// ─── Seat-Based Billing Service ──────────────────────────────
// Per-doctor seat pricing. Clinic accounts are free.
// Each doctor pays for their own plan via MercadoPago PreApproval.
//
// Plans:
//   Gratuito   — $0/mes, 20 turnos/mes, limited features
//   Profesional — $29,000 ARS/mes, unlimited agenda, reminders, WhatsApp, insurance verify, priority listing
//   Premium    — $59,000 ARS/mes, everything + telehealth, MercadoPago cobro, AI chatbot, analytics, e-billing

import { createDoc, getDoc, updateDoc } from "@/lib/services/firestore";

// ─── Plan Definitions ────────────────────────────────────────

export type SeatPlanId = "free" | "profesional" | "premium";

export interface SeatPlanDef {
  id: SeatPlanId;
  name: string;
  nameEn: string;
  price: number; // ARS per month per seat
  priceAnnual: number; // ARS per month when billed annually
  maxBookingsPerMonth: number | null; // null = unlimited
  trialDays: number;
  features: Record<string, boolean>;
}

export const SEAT_PLANS: SeatPlanDef[] = [
  {
    id: "free",
    name: "Gratuito",
    nameEn: "Free",
    price: 0,
    priceAnnual: 0,
    maxBookingsPerMonth: 20,
    trialDays: 0,
    features: {
      agenda: true,
      basicProfile: true,
      searchListing: true,
      patientManagement: true,
      // Restricted
      reminders: false,
      whatsappReminders: false,
      insuranceVerify: false,
      priorityListing: false,
      telehealth: false,
      mercadopagoCobro: false,
      aiChatbot: false,
      analytics: false,
      eBilling: false,
      customBranding: false,
    },
  },
  {
    id: "profesional",
    name: "Profesional",
    nameEn: "Professional",
    price: 29_000,
    priceAnnual: 24_650, // ~15% discount
    maxBookingsPerMonth: null,
    trialDays: 14,
    features: {
      agenda: true,
      basicProfile: true,
      searchListing: true,
      patientManagement: true,
      reminders: true,
      whatsappReminders: true,
      insuranceVerify: true,
      priorityListing: true,
      // Restricted
      telehealth: false,
      mercadopagoCobro: false,
      aiChatbot: false,
      analytics: false,
      eBilling: false,
      customBranding: false,
    },
  },
  {
    id: "premium",
    name: "Premium",
    nameEn: "Premium",
    price: 59_000,
    priceAnnual: 50_150, // ~15% discount
    maxBookingsPerMonth: null,
    trialDays: 14,
    features: {
      agenda: true,
      basicProfile: true,
      searchListing: true,
      patientManagement: true,
      reminders: true,
      whatsappReminders: true,
      insuranceVerify: true,
      priorityListing: true,
      telehealth: true,
      mercadopagoCobro: true,
      aiChatbot: true,
      analytics: true,
      eBilling: true,
      customBranding: true,
    },
  },
];

const planMap = new Map(SEAT_PLANS.map((p) => [p.id, p]));

// ─── Plan Lookup ─────────────────────────────────────────────

export function getSeatPlan(id: SeatPlanId): SeatPlanDef {
  const p = planMap.get(id);
  if (!p) throw new Error(`Unknown seat plan: ${id}`);
  return p;
}

export function getAllSeatPlans(): SeatPlanDef[] {
  return [...SEAT_PLANS];
}

// ─── Doctor Plan Storage (Firestore) ─────────────────────────

export interface DoctorPlanRecord {
  doctorId: string;
  plan: SeatPlanId;
  billingCycle: "monthly" | "annual" | null;
  subscriptionId: string | null;
  subscriptionStatus: "free" | "trialing" | "active" | "paused" | "cancelled" | "lapsed";
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  planUpdatedAt: string;
  bookingsThisMonth: number;
  bookingsResetAt: string; // ISO date — first of current month
}

function defaultPlanRecord(doctorId: string): DoctorPlanRecord {
  const now = new Date();
  return {
    doctorId,
    plan: "free",
    billingCycle: null,
    subscriptionId: null,
    subscriptionStatus: "free",
    trialEndsAt: null,
    currentPeriodEnd: null,
    planUpdatedAt: now.toISOString(),
    bookingsThisMonth: 0,
    bookingsResetAt: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
  };
}

/** Get or create the plan record for a doctor */
export async function getDoctorPlan(doctorId: string): Promise<DoctorPlanRecord> {
  try {
    const doc = await getDoc("doctorPlans", doctorId);
    if (!doc) {
      const rec = defaultPlanRecord(doctorId);
      await createDoc("doctorPlans", doctorId, rec as unknown as Record<string, unknown>);
      return rec;
    }
    return doc as unknown as DoctorPlanRecord;
  } catch {
    return defaultPlanRecord(doctorId);
  }
}

/** Check if a doctor has a specific feature */
export async function hasFeature(doctorId: string, featureKey: string): Promise<boolean> {
  const rec = await getDoctorPlan(doctorId);
  const planDef = getSeatPlan(rec.plan);

  // During active trial, grant all features of the trial plan
  if (rec.subscriptionStatus === "trialing" && rec.trialEndsAt) {
    const trialEnd = new Date(rec.trialEndsAt);
    if (trialEnd > new Date()) {
      return planDef.features[featureKey] ?? false;
    }
    // Trial expired — downgrade
    await downgradeToPlan(doctorId, "free");
    return getSeatPlan("free").features[featureKey] ?? false;
  }

  // Lapsed or cancelled — free features only
  if (rec.subscriptionStatus === "lapsed" || rec.subscriptionStatus === "cancelled") {
    return getSeatPlan("free").features[featureKey] ?? false;
  }

  return planDef.features[featureKey] ?? false;
}

/** Check if doctor has bookings remaining this month */
export async function canBook(
  doctorId: string,
): Promise<{ allowed: boolean; remaining: number | null }> {
  const rec = await getDoctorPlan(doctorId);
  const planDef = getSeatPlan(rec.plan);

  // Reset monthly counter if needed
  const resetDate = new Date(rec.bookingsResetAt);
  const now = new Date();
  if (now.getMonth() !== resetDate.getMonth() || now.getFullYear() !== resetDate.getFullYear()) {
    await updateDoc("doctorPlans", doctorId, {
      bookingsThisMonth: 0,
      bookingsResetAt: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
    });
    rec.bookingsThisMonth = 0;
  }

  if (planDef.maxBookingsPerMonth === null) {
    return { allowed: true, remaining: null };
  }

  const remaining = planDef.maxBookingsPerMonth - rec.bookingsThisMonth;
  return { allowed: remaining > 0, remaining: Math.max(0, remaining) };
}

/** Increment monthly booking count */
export async function incrementBookingCount(doctorId: string): Promise<void> {
  const rec = await getDoctorPlan(doctorId);
  await updateDoc("doctorPlans", doctorId, {
    bookingsThisMonth: rec.bookingsThisMonth + 1,
  });
}

/** Upgrade a doctor to a paid plan (after MercadoPago subscription created) */
export async function upgradeToPlan(
  doctorId: string,
  plan: SeatPlanId,
  billingCycle: "monthly" | "annual",
  subscriptionId: string,
  trialDays?: number,
): Promise<DoctorPlanRecord> {
  const now = new Date();
  const trialEndsAt = trialDays
    ? new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000).toISOString()
    : null;

  const update: Partial<DoctorPlanRecord> = {
    plan,
    billingCycle,
    subscriptionId,
    subscriptionStatus: trialDays ? "trialing" : "active",
    trialEndsAt,
    planUpdatedAt: now.toISOString(),
  };

  await updateDoc("doctorPlans", doctorId, update as unknown as Record<string, unknown>);
  return { ...(await getDoctorPlan(doctorId)), ...update };
}

/** Downgrade to a specific plan (e.g., on subscription lapse) */
export async function downgradeToPlan(doctorId: string, plan: SeatPlanId): Promise<void> {
  await updateDoc("doctorPlans", doctorId, {
    plan,
    subscriptionStatus: plan === "free" ? "free" : "lapsed",
    planUpdatedAt: new Date().toISOString(),
  });
}

/** Handle MercadoPago PreApproval webhook status change */
export async function handleSubscriptionWebhook(
  subscriptionId: string,
  status: string,
): Promise<void> {
  // Find the doctor by subscriptionId

  // TODO: query by subscriptionId when Firestore query is available
  // For now, the webhook handler should pass the doctorId from metadata

  const statusMap: Record<string, DoctorPlanRecord["subscriptionStatus"]> = {
    authorized: "active",
    pending: "trialing",
    paused: "paused",
    cancelled: "cancelled",
  };

  const newStatus = statusMap[status] || "lapsed";

  // If cancelled or paused too long, auto-downgrade
  if (newStatus === "cancelled" || newStatus === "lapsed") {
    // The calling code should handle finding doctorId from subscriptionId
    console.warn(
      `[SeatBilling] Subscription ${subscriptionId} status: ${status} — needs downgrade`,
    );
  }
}

/** Get trial days remaining for a doctor */
export function getTrialDaysRemaining(record: DoctorPlanRecord): number {
  if (!record.trialEndsAt) return 0;
  const end = new Date(record.trialEndsAt);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)));
}

// ─── Feature Gate Middleware ─────────────────────────────────
// Runtime plan enforcement for API routes.
// Checks if the requesting doctor's plan includes the required feature.

import { NextRequest, NextResponse } from "next/server";
import {
  hasFeature,
  getDoctorPlan,
  type SeatPlanId,
  type DoctorPlanRecord,
} from "@/lib/services/seat-billing";

// ─── Types ───────────────────────────────────────────────────

export interface FeatureGateResult {
  allowed: boolean;
  plan: SeatPlanId;
  upgradeUrl: string;
  message: string;
}

// ─── Hard Gate (403 on missing feature) ──────────────────────

/**
 * Check if a doctor has a specific feature.
 * Returns a 403 JSON response if the feature is not available.
 * Use in API route handlers:
 *
 * ```ts
 * const gate = await requireFeature(doctorId, "telehealth");
 * if (gate) return gate; // 403 response
 * ```
 */
export async function requireFeature(
  doctorId: string,
  featureKey: string,
): Promise<NextResponse | null> {
  const allowed = await hasFeature(doctorId, featureKey);
  if (allowed) return null;

  const record = await getDoctorPlan(doctorId);
  return NextResponse.json(
    {
      error: "Feature not available on your current plan",
      feature: featureKey,
      currentPlan: record.plan,
      upgradeUrl: `/planes?feature=${featureKey}&current=${record.plan}`,
      message: `Upgrade to access ${featureKey}`,
    },
    { status: 403 },
  );
}

// ─── Soft Gate (non-blocking, attaches boolean) ──────────────

/**
 * Non-blocking feature check. Returns the gate result without
 * blocking the request. Useful for conditional behavior:
 *
 * ```ts
 * const gate = await softGate(doctorId, "whatsappReminders");
 * if (gate.allowed) { sendWhatsAppReminder(); }
 * ```
 */
export async function softGate(doctorId: string, featureKey: string): Promise<FeatureGateResult> {
  const allowed = await hasFeature(doctorId, featureKey);
  const record = await getDoctorPlan(doctorId);

  return {
    allowed,
    plan: record.plan,
    upgradeUrl: `/planes?feature=${featureKey}&current=${record.plan}`,
    message: allowed ? "Feature available" : `Upgrade to access ${featureKey}`,
  };
}

// ─── Plan Hydration ──────────────────────────────────────────

/**
 * Hydrate the full plan record for a doctor.
 * Returns the complete plan record for use in responses.
 */
export async function attachPlan(doctorId: string): Promise<DoctorPlanRecord> {
  return getDoctorPlan(doctorId);
}

// ─── Feature key constants ───────────────────────────────────

export const FEATURES = {
  TELEHEALTH: "telehealth",
  MERCADOPAGO_COBRO: "mercadopagoCobro",
  WHATSAPP_REMINDERS: "whatsappReminders",
  INSURANCE_VERIFY: "insuranceVerify",
  PRIORITY_LISTING: "priorityListing",
  AI_CHATBOT: "aiChatbot",
  ANALYTICS: "analytics",
  E_BILLING: "eBilling",
  REMINDERS: "reminders",
  CUSTOM_BRANDING: "customBranding",
} as const;

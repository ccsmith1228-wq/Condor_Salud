// ─── Demo Configuration Service ─────────────────────────────
// Centralized demo mode management. During sales demos, any
// combination of pages, pricing models, features, and services
// can be toggled on/off from the web admin panel.

import { createDoc, getDoc } from "@/lib/services/firestore";

// ─── Types ───────────────────────────────────────────────────

export interface DemoConfig {
  active: boolean;
  pricingModel: "seat" | "clinic";
  showPages: Record<string, boolean>;
  showPlans: Record<string, boolean>;
  pricing: {
    model: "seat" | "clinic";
    currency: string;
    ipcAdjustment: boolean;
    annualToggle: boolean;
    freeClinicBanner: boolean;
    showCalculator: boolean;
    seats: { free: number; profesional: number; premium: number };
    clinic: { esencial: number; profesional: number; enterprise: number };
  };
  branding: {
    appName: string;
    accentColor: string;
    showRides: boolean;
    showAI: boolean;
    showTelehealth: boolean;
  };
  demoData: {
    preloadSpecialty: string;
    preloadCity: string;
    preloadNeighborhood: string;
    showFakeDoctors: boolean;
  };
  updatedAt: string | null;
  updatedBy: string | null;
}

// ─── Defaults ────────────────────────────────────────────────

export const DEMO_DEFAULTS: DemoConfig = {
  active: false,
  pricingModel: "seat",
  showPages: {
    search: true,
    map: true,
    booking: true,
    telehealth: true,
    payments: true,
    reviews: true,
    dashboard: true,
    chatbot: true,
    rides: true,
    adminPanel: true,
  },
  showPlans: {
    free: true,
    profesional: true,
    premium: true,
  },
  pricing: {
    model: "seat",
    currency: "ARS",
    ipcAdjustment: true,
    annualToggle: true,
    freeClinicBanner: true,
    showCalculator: true,
    seats: { free: 0, profesional: 29_000, premium: 59_000 },
    clinic: { esencial: 50_000, profesional: 111_350, enterprise: 159_750 },
  },
  branding: {
    appName: "Cóndor Salud",
    accentColor: "#0F6E56",
    showRides: true,
    showAI: true,
    showTelehealth: true,
  },
  demoData: {
    preloadSpecialty: "Cardiología",
    preloadCity: "Buenos Aires",
    preloadNeighborhood: "Recoleta",
    showFakeDoctors: false,
  },
  updatedAt: null,
  updatedBy: null,
};

// ─── Firestore Operations ────────────────────────────────────

const COLLECTION = "demoConfig";
const DOC_ID = "active";

/** Get the current demo config (from Firestore or defaults) */
export async function getDemoConfig(): Promise<DemoConfig> {
  try {
    const doc = await getDoc(COLLECTION, DOC_ID);
    if (!doc) return { ...DEMO_DEFAULTS };
    return { ...DEMO_DEFAULTS, ...(doc as unknown as Partial<DemoConfig>) };
  } catch {
    return { ...DEMO_DEFAULTS };
  }
}

/** Save a new demo config */
export async function saveDemoConfig(config: Partial<DemoConfig>): Promise<DemoConfig> {
  const merged: DemoConfig = {
    ...DEMO_DEFAULTS,
    ...config,
    updatedAt: new Date().toISOString(),
    updatedBy: "demo_admin",
  };

  try {
    await createDoc(COLLECTION, DOC_ID, merged as unknown as Record<string, unknown>);
  } catch {
    // Firestore unavailable — config returned in-memory only
  }

  return merged;
}

/** Reset demo config to defaults */
export async function resetDemoConfig(): Promise<DemoConfig> {
  const reset: DemoConfig = {
    ...DEMO_DEFAULTS,
    updatedAt: new Date().toISOString(),
    updatedBy: "demo_admin",
  };

  try {
    await createDoc(COLLECTION, DOC_ID, reset as unknown as Record<string, unknown>);
  } catch {
    // Firestore unavailable
  }

  return reset;
}

/** Check if a page should be visible in demo mode */
export async function isPageVisible(pageKey: string): Promise<boolean> {
  const config = await getDemoConfig();
  if (!config.active) return true;
  return config.showPages[pageKey] !== false;
}

/** Check if a feature is enabled in demo mode */
export async function isFeatureEnabled(featureKey: keyof DemoConfig["branding"]): Promise<boolean> {
  const config = await getDemoConfig();
  if (!config.active) return true;
  return config.branding[featureKey] !== false;
}

"use client";

// ─── Demo Configuration Hook ────────────────────────────────
// Client-side hook for reading the demo config from /api/demo/config.
// Provides DemoProvider context + useDemoConfig() + usePageVisible().

import { useState, useEffect, createContext, useContext, type ReactNode } from "react";

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
  };
}

// ─── Defaults ────────────────────────────────────────────────

const DEFAULT_CONFIG: DemoConfig = {
  active: false,
  pricingModel: "seat",
  showPages: {},
  showPlans: { free: true, profesional: true, premium: true },
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
  },
};

// ─── Context ─────────────────────────────────────────────────

const DemoContext = createContext<DemoConfig>(DEFAULT_CONFIG);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<DemoConfig>(DEFAULT_CONFIG);

  useEffect(() => {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/api/demo/config`
        : "/api/demo/config";

    fetch(url)
      .then((r) => r.json())
      .then((data) => setConfig({ ...DEFAULT_CONFIG, ...data }))
      .catch(() => {
        /* use defaults */
      });
  }, []);

  return <DemoContext.Provider value={config}>{children}</DemoContext.Provider>;
}

// ─── Hooks ───────────────────────────────────────────────────

/** Get the full demo config */
export function useDemoConfig(): DemoConfig {
  return useContext(DemoContext);
}

/** Check if a page should be visible (returns true when demo is off) */
export function usePageVisible(pageKey: string): boolean {
  const config = useDemoConfig();
  if (!config.active) return true;
  return config.showPages?.[pageKey] !== false;
}

/** Check if a feature is enabled (returns true when demo is off) */
export function useFeatureVisible(featureKey: "showRides" | "showAI" | "showTelehealth"): boolean {
  const config = useDemoConfig();
  if (!config.active) return true;
  return config.branding?.[featureKey] !== false;
}

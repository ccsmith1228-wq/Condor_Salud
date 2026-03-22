"use client";

// ─── Plan Hooks & Components ─────────────────────────────────
// Client-side hooks for seat-based billing.
// Provides usePlan(), useFeature(), UpgradePrompt, TrialBanner, PlanBadge.

import { useState, useEffect, createContext, useContext, type ReactNode } from "react";
import { useLocale } from "@/lib/i18n/context";

// ─── Types ───────────────────────────────────────────────────

type SeatPlanId = "free" | "profesional" | "premium";

interface PlanRecord {
  plan: SeatPlanId;
  subscriptionStatus: string;
  trialEndsAt: string | null;
  bookingsThisMonth: number;
}

interface SeatPlanDef {
  id: SeatPlanId;
  name: string;
  nameEn: string;
  price: number;
  features: Record<string, boolean>;
}

interface PlanContextValue {
  record: PlanRecord | null;
  planDef: SeatPlanDef | null;
  loading: boolean;
  hasFeature: (key: string) => boolean;
  trialDaysRemaining: number;
  refresh: () => void;
}

// ─── Context ─────────────────────────────────────────────────

const PlanContext = createContext<PlanContextValue>({
  record: null,
  planDef: null,
  loading: true,
  hasFeature: () => false,
  trialDaysRemaining: 0,
  refresh: () => {},
});

// ─── Provider ────────────────────────────────────────────────

export function PlanProvider({ doctorId, children }: { doctorId?: string; children: ReactNode }) {
  const [record, setRecord] = useState<PlanRecord | null>(null);
  const [planDef, setPlanDef] = useState<SeatPlanDef | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPlan = () => {
    if (!doctorId) {
      setLoading(false);
      return;
    }

    fetch("/api/billing/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ doctorId }),
    })
      .then((r) => r.json())
      .then((data) => {
        setRecord(data.record ?? null);
        setPlanDef(data.plan ?? null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPlan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorId]);

  const trialDaysRemaining = record?.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(record.trialEndsAt).getTime() - Date.now()) / 86_400_000))
    : 0;

  const hasFeature = (key: string) => planDef?.features?.[key] ?? false;

  return (
    <PlanContext.Provider
      value={{ record, planDef, loading, hasFeature, trialDaysRemaining, refresh: fetchPlan }}
    >
      {children}
    </PlanContext.Provider>
  );
}

// ─── Hooks ───────────────────────────────────────────────────

export function usePlan() {
  return useContext(PlanContext);
}

export function useFeature(key: string): boolean {
  const { hasFeature } = usePlan();
  return hasFeature(key);
}

// ─── Components ──────────────────────────────────────────────

/** Shows a banner during trial period with days remaining */
export function TrialBanner() {
  const { record, trialDaysRemaining } = usePlan();
  const { t, isEn } = useLocale();

  if (!record || record.subscriptionStatus !== "trialing" || trialDaysRemaining === 0) {
    return null;
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-amber-600 text-sm">⏱</span>
        <span className="text-sm text-amber-800">
          {isEn
            ? `${trialDaysRemaining} day${trialDaysRemaining === 1 ? "" : "s"} left in your trial`
            : `${trialDaysRemaining} día${trialDaysRemaining === 1 ? "" : "s"} restante${trialDaysRemaining === 1 ? "" : "s"} de prueba`}
        </span>
      </div>
      <a href="/planes" className="text-xs font-medium text-teal-700 hover:underline">
        {isEn ? "Upgrade" : "Mejorar plan"}
      </a>
    </div>
  );
}

/** Shows a badge with the current plan name */
export function PlanBadge() {
  const { planDef, loading } = usePlan();
  const { isEn } = useLocale();

  if (loading || !planDef) return null;

  const colors: Record<SeatPlanId, string> = {
    free: "bg-gray-100 text-gray-600",
    profesional: "bg-teal-50 text-teal-700",
    premium: "bg-amber-50 text-amber-700",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[planDef.id]}`}
    >
      {isEn ? planDef.nameEn : planDef.name}
    </span>
  );
}

/** Wraps children and shows upgrade prompt if feature is not available */
export function UpgradePrompt({ feature, children }: { feature: string; children: ReactNode }) {
  const { hasFeature, planDef } = usePlan();
  const { isEn } = useLocale();
  const allowed = hasFeature(feature);

  if (allowed) return <>{children}</>;

  return (
    <div className="relative">
      <div className="opacity-50 pointer-events-none">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
        <div className="text-center p-4">
          <p className="text-sm text-ink-muted mb-2">
            {isEn
              ? `This feature requires a plan upgrade`
              : `Esta funcionalidad requiere mejorar tu plan`}
          </p>
          <a
            href={`/planes?feature=${feature}&current=${planDef?.id ?? "free"}`}
            className="inline-flex items-center gap-1 px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700"
          >
            {isEn ? "Upgrade plan" : "Mejorar plan"}
          </a>
        </div>
      </div>
    </div>
  );
}

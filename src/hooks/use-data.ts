// ─── SWR Data Hooks ──────────────────────────────────────────
// Typed React hooks for all domain data using SWR.
// Provides automatic caching, revalidation, loading, and error states.
//
// Usage:
//   const { data, isLoading, error, mutate } = usePacientes();
//   const { data: factura } = useFacturas();

"use client";

import useSWR from "swr";
import type { Factura, Rechazo, Financiador, InflacionMes, Alerta, KPI } from "@/lib/types";
import type { Paciente } from "@/lib/services/data";
import type { NomencladorEntry } from "@/lib/services/nomenclador";
import type { ReporteEntry } from "@/lib/services/reportes";
import {
  getPacientes,
  getPaciente,
  getFacturas,
  getRechazos,
  getFinanciadores,
  getInflacion,
  getAlertas,
  getTurnos,
  getInventario,
  getNomenclador,
  getReportes,
  getAuditoria,
  getDashboardKPIs,
  getFacturacionKPIs,
  getRechazosKPIs,
  getPacientesKPIs,
  getAgendaKPIs,
  getInventarioKPIs,
} from "@/lib/services/data";

// ─── Generic fetcher wrapper ─────────────────────────────────
// Wraps a service function as an SWR-compatible fetcher
function serviceFetcher<T>(fn: () => Promise<T>) {
  return async () => fn();
}

// ─── Data Hooks ──────────────────────────────────────────────

export function usePacientes() {
  return useSWR<Paciente[]>("pacientes", () => getPacientes(), {
    revalidateOnFocus: false,
    dedupingInterval: 10000,
  });
}

export function usePaciente(id: string | null) {
  return useSWR<Paciente | null>(
    id ? `paciente-${id}` : null, // null key = don't fetch
    () => (id ? getPaciente(id) : null),
    { revalidateOnFocus: false },
  );
}

export function useFacturas() {
  return useSWR<Factura[]>("facturas", () => getFacturas(), {
    revalidateOnFocus: false,
    dedupingInterval: 10000,
  });
}

export function useRechazos() {
  return useSWR<Rechazo[]>("rechazos", () => getRechazos(), {
    revalidateOnFocus: false,
    dedupingInterval: 10000,
  });
}

export function useFinanciadores() {
  return useSWR<Financiador[]>("financiadores", () => getFinanciadores(), {
    revalidateOnFocus: false,
    dedupingInterval: 30000, // Less frequent — slower changing data
  });
}

export function useInflacion() {
  return useSWR<InflacionMes[]>("inflacion", () => getInflacion(), {
    revalidateOnFocus: false,
    dedupingInterval: 60000, // Monthly data — very stable
  });
}

export function useAlertas() {
  return useSWR<Alerta[]>("alertas", () => getAlertas(), {
    revalidateOnFocus: true, // Alerts should refresh on tab focus
    dedupingInterval: 5000,
  });
}

export function useTurnos() {
  return useSWR("turnos", () => getTurnos(), {
    revalidateOnFocus: true, // Schedule changes frequently
    dedupingInterval: 5000,
    refreshInterval: 30000, // Poll every 30s so appointments never go stale on idle screens
    revalidateOnReconnect: true,
  });
}

export function useInventario() {
  return useSWR("inventario", () => getInventario(), {
    revalidateOnFocus: false,
    dedupingInterval: 15000,
  });
}

export function useNomenclador() {
  return useSWR("nomenclador", () => getNomenclador(), {
    revalidateOnFocus: false,
    dedupingInterval: 60000, // Very stable data
  });
}

export function useReportes() {
  return useSWR("reportes", () => getReportes(), {
    revalidateOnFocus: false,
    dedupingInterval: 30000,
  });
}

export function useAuditoria() {
  return useSWR("auditoria", () => getAuditoria(), {
    revalidateOnFocus: false,
    dedupingInterval: 10000,
  });
}

// ─── KPI Hooks ───────────────────────────────────────────────
// KPI functions are async (Supabase when configured, mock fallback).

export function useDashboardKPIs() {
  return useSWR<KPI[]>("kpi-dashboard", () => getDashboardKPIs(), {
    revalidateOnFocus: false,
    dedupingInterval: 30000,
  });
}

export function useFacturacionKPIs() {
  return useSWR<KPI[]>("kpi-facturacion", () => getFacturacionKPIs(), {
    revalidateOnFocus: false,
    dedupingInterval: 30000,
  });
}

export function useRechazosKPIs() {
  return useSWR<KPI[]>("kpi-rechazos", () => getRechazosKPIs(), {
    revalidateOnFocus: false,
    dedupingInterval: 30000,
  });
}

export function usePacientesKPIs() {
  return useSWR<KPI[]>("kpi-pacientes", () => getPacientesKPIs(), {
    revalidateOnFocus: false,
    dedupingInterval: 30000,
  });
}

export function useAgendaKPIs() {
  return useSWR<KPI[]>("kpi-agenda", () => getAgendaKPIs(), {
    revalidateOnFocus: false,
    dedupingInterval: 30000,
  });
}

export function useInventarioKPIs() {
  return useSWR<KPI[]>("kpi-inventario", () => getInventarioKPIs(), {
    revalidateOnFocus: false,
    dedupingInterval: 30000,
  });
}

// ─── Service-specific Hooks ──────────────────────────────────
// These hooks call the dedicated service files with full CRUD
// and filtering capabilities beyond what data.ts provides.

export function useFinanciadoresExtended() {
  return useSWR(
    "financiadores-extended",
    async () => {
      const { getFinanciadoresExtended } = await import("@/lib/services/financiadores");
      return getFinanciadoresExtended();
    },
    { revalidateOnFocus: false, dedupingInterval: 30000 },
  );
}

export function useInflacionMensual(period?: "3m" | "6m" | "12m") {
  return useSWR(
    `inflacion-mensual-${period ?? "6m"}`,
    async () => {
      const { getInflacionMensual } = await import("@/lib/services/inflacion");
      return getInflacionMensual({ period });
    },
    { revalidateOnFocus: false, dedupingInterval: 60000 },
  );
}

export function useFinanciadoresInflacion() {
  return useSWR(
    "financiadores-inflacion",
    async () => {
      const { getFinanciadoresInflacion } = await import("@/lib/services/inflacion");
      return getFinanciadoresInflacion();
    },
    { revalidateOnFocus: false, dedupingInterval: 60000 },
  );
}

export function useInventarioItems() {
  return useSWR(
    "inventario-items",
    async () => {
      const { getInventarioItems } = await import("@/lib/services/inventario");
      return getInventarioItems();
    },
    { revalidateOnFocus: false, dedupingInterval: 15000 },
  );
}

export function useNomencladorEntries() {
  return useSWR<NomencladorEntry[]>(
    "nomenclador-entries",
    async () => {
      const { getNomencladorEntries } = await import("@/lib/services/nomenclador");
      return getNomencladorEntries();
    },
    { revalidateOnFocus: false, dedupingInterval: 60000 },
  );
}

export function useReportesList() {
  return useSWR<ReporteEntry[]>(
    "reportes-list",
    async () => {
      const { getReportesList } = await import("@/lib/services/reportes");
      return getReportesList();
    },
    { revalidateOnFocus: false, dedupingInterval: 30000 },
  );
}

// ─── Config Hooks (API-backed) ───────────────────────────────
// These hooks fetch/save configuration via dedicated API routes
// instead of the data.ts service layer.

const apiFetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
};

export function useReminderConfig() {
  const swr = useSWR("reminder-config", () => apiFetcher("/api/config/recordatorios"), {
    revalidateOnFocus: false,
    dedupingInterval: 30000,
  });

  const save = async (body: {
    config?: Record<string, unknown>;
    templates?: Record<string, unknown>[];
  }) => {
    const res = await fetch("/api/config/recordatorios", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("Failed to save reminder config");
    const data = await res.json();
    swr.mutate(data, false);
    return data;
  };

  return { ...swr, save };
}

export function usePaymentConfig() {
  const swr = useSWR("payment-config", () => apiFetcher("/api/config/pagos"), {
    revalidateOnFocus: false,
    dedupingInterval: 30000,
  });

  const save = async (body: {
    config?: Record<string, unknown>;
    billingRules?: Record<string, unknown>[];
  }) => {
    const res = await fetch("/api/config/pagos", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("Failed to save payment config");
    const data = await res.json();
    swr.mutate(data, false);
    return data;
  };

  return { ...swr, save };
}

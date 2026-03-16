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

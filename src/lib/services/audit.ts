// ─── Audit Service ───────────────────────────────────────────
// CRUD for the auditoria table. Used by the audit log viewer
// to display, filter, and update audit items.

import { isSupabaseConfigured } from "@/lib/env";
import { delay } from "@/lib/utils";
import type { AuditoriaItem } from "@/lib/services/data";

// ─── Types ───────────────────────────────────────────────────

export interface AuditFilter {
  severidad?: "alta" | "media" | "baja";
  estado?: "pendiente" | "revisado" | "resuelto";
  financiador?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface AuditStats {
  total: number;
  pendientes: number;
  alta: number;
  resueltos: number;
  montoRiesgo: number;
}

export interface UpdateAuditInput {
  estado: "revisado" | "resuelto" | "pendiente";
  resolvedBy?: string;
}

// ─── Read Operations ─────────────────────────────────────────

/**
 * Fetch audit items with optional filters.
 */
export async function getAuditoriaFiltered(filter?: AuditFilter): Promise<AuditoriaItem[]> {
  if (isSupabaseConfigured()) {
    const { createClient } = await import("@/lib/supabase/client");
    const sb = createClient();

    let query = sb.from("auditoria").select("*").order("fecha", { ascending: false });

    if (filter?.severidad) {
      query = query.eq("severidad", filter.severidad);
    }
    if (filter?.estado) {
      query = query.eq("estado", filter.estado);
    }
    if (filter?.financiador) {
      query = query.ilike("financiador", `%${filter.financiador}%`);
    }
    if (filter?.dateFrom) {
      query = query.gte("fecha", filter.dateFrom);
    }
    if (filter?.dateTo) {
      query = query.lte("fecha", filter.dateTo);
    }
    if (filter?.search) {
      query = query.or(
        `paciente.ilike.%${filter.search}%,prestacion.ilike.%${filter.search}%,detalle.ilike.%${filter.search}%`,
      );
    }

    const { data } = await query;

    return (data ?? []).map((row) => ({
      id: row.id,
      fecha: row.fecha,
      paciente: row.paciente,
      prestacion: row.prestacion,
      financiador: row.financiador,
      tipo: row.tipo,
      severidad: row.severidad as AuditoriaItem["severidad"],
      detalle: row.detalle,
      estado: row.estado as AuditoriaItem["estado"],
    }));
  }

  // Demo mode
  await delay(150);
  const { getAuditoria } = await import("@/lib/services/data");
  let items = await getAuditoria();

  if (filter?.severidad) {
    items = items.filter((a) => a.severidad === filter.severidad);
  }
  if (filter?.estado) {
    items = items.filter((a) => a.estado === filter.estado);
  }
  if (filter?.search) {
    const s = filter.search.toLowerCase();
    items = items.filter(
      (a) =>
        a.paciente.toLowerCase().includes(s) ||
        a.prestacion.toLowerCase().includes(s) ||
        a.detalle.toLowerCase().includes(s),
    );
  }

  return items;
}

/**
 * Get audit statistics.
 */
export async function getAuditStats(): Promise<AuditStats> {
  if (isSupabaseConfigured()) {
    const { createClient } = await import("@/lib/supabase/client");
    const sb = createClient();

    const { data } = await sb.from("auditoria").select("severidad, estado");
    const items = data ?? [];

    return {
      total: items.length,
      pendientes: items.filter((a) => a.estado === "pendiente").length,
      alta: items.filter((a) => a.severidad === "alta" && a.estado === "pendiente").length,
      resueltos: items.filter((a) => a.estado === "resuelto").length,
      montoRiesgo: 0, // Would need monto column
    };
  }

  const { getAuditoria } = await import("@/lib/services/data");
  const items = await getAuditoria();

  return {
    total: items.length,
    pendientes: items.filter((a) => a.estado === "pendiente").length,
    alta: items.filter((a) => a.severidad === "alta" && a.estado === "pendiente").length,
    resueltos: items.filter((a) => a.estado === "resuelto").length,
    montoRiesgo: 0,
  };
}

// ─── Write Operations ────────────────────────────────────────

/**
 * Update an audit item's status.
 */
export async function updateAuditItem(
  id: string,
  input: UpdateAuditInput,
): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured()) {
    const { createClient } = await import("@/lib/supabase/client");
    const sb = createClient();

    const updateData: Record<string, string | null> = {
      estado: input.estado,
    };

    if (input.estado === "resuelto") {
      updateData.resolved_at = new Date().toISOString();
      updateData.resolved_by = input.resolvedBy ?? null;
    }

    const { error } = await sb.from("auditoria").update(updateData).eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  }

  // Demo mode
  await delay(150);
  return { success: true };
}

/**
 * Bulk update audit items.
 */
export async function bulkUpdateAudit(
  ids: string[],
  estado: "revisado" | "resuelto",
): Promise<{ success: boolean; updated: number; error?: string }> {
  if (isSupabaseConfigured()) {
    const { createClient } = await import("@/lib/supabase/client");
    const sb = createClient();

    const updateData: Record<string, string> = { estado };
    if (estado === "resuelto") {
      updateData.resolved_at = new Date().toISOString();
    }

    const { error, count } = await sb.from("auditoria").update(updateData).in("id", ids);

    if (error) {
      return { success: false, updated: 0, error: error.message };
    }
    return { success: true, updated: count ?? ids.length };
  }

  await delay(200);
  return { success: true, updated: ids.length };
}

/**
 * Run automatic audit check (triggers a re-scan of recent facturas).
 */
export async function runAutoAudit(): Promise<{
  success: boolean;
  newFindings: number;
  error?: string;
}> {
  if (isSupabaseConfigured()) {
    // In a real implementation, this would call an Edge Function
    // or a server-side audit algorithm. For now, it's a placeholder.
    const { createClient } = await import("@/lib/supabase/client");
    const sb = createClient();

    // Check facturas from last 30 days against nomenclador
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    const { data: recentFacturas } = await sb
      .from("facturas")
      .select("id, codigo_nomenclador, monto, financiador, paciente, prestacion")
      .gte("fecha", thirtyDaysAgo);

    // Placeholder: return count of facturas scanned
    return { success: true, newFindings: (recentFacturas ?? []).length };
  }

  await delay(500);
  return { success: true, newFindings: 3 };
}

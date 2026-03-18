/**
 * Cóndor Salud — CRM Service Layer
 *
 * Business logic for lead management, pipeline, and conversion.
 * Uses Supabase service_role client for admin operations,
 * or user-scoped client for dashboard queries (RLS-gated).
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";

const log = logger.child({ module: "crm" });

// ─── Types ───────────────────────────────────────────────────

export type LeadEstado =
  | "nuevo"
  | "contactado"
  | "interesado"
  | "turno_agendado"
  | "convertido"
  | "perdido";

export type LeadFuente = "whatsapp" | "web" | "referido" | "landing" | "chatbot" | "manual";

export interface Lead {
  id: string;
  clinic_id: string;
  paciente_id: string | null;
  nombre: string | null;
  telefono: string;
  email: string | null;
  motivo: string | null;
  fuente: LeadFuente;
  estado: LeadEstado;
  prioridad: number;
  assigned_to: string | null;
  tags: string[];
  financiador: string | null;
  notas: string | null;
  first_contact_at: string | null;
  last_message_at: string | null;
  converted_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface LeadStats {
  total: number;
  nuevo: number;
  contactado: number;
  interesado: number;
  turno_agendado: number;
  convertido: number;
  perdido: number;
  byFuente: Record<LeadFuente, number>;
  conversionRate: number;
  avgTimeToConvert: number | null; // in hours
}

export interface LeadFilters {
  estado?: LeadEstado | LeadEstado[];
  fuente?: LeadFuente;
  assignedTo?: string;
  search?: string;
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}

// ─── Supabase Clients ────────────────────────────────────────

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase service config");
  return createClient(url, key);
}

// ─── Lead CRUD ───────────────────────────────────────────────

/** Get leads with filtering, pagination, and search */
export async function getLeads(
  clinicId: string,
  filters: LeadFilters = {},
  supabase?: SupabaseClient,
) {
  const db = supabase ?? getServiceClient();
  let query = db
    .from("leads")
    .select("*, paciente:pacientes(id, nombre, telefono, financiador)", { count: "exact" })
    .eq("clinic_id", clinicId)
    .order("created_at", { ascending: false });

  // Filter by estado
  if (filters.estado) {
    if (Array.isArray(filters.estado)) {
      query = query.in("estado", filters.estado);
    } else {
      query = query.eq("estado", filters.estado);
    }
  }

  // Filter by fuente
  if (filters.fuente) query = query.eq("fuente", filters.fuente);

  // Filter by assignment
  if (filters.assignedTo) query = query.eq("assigned_to", filters.assignedTo);

  // Search by name, phone, or email
  if (filters.search) {
    query = query.or(
      `nombre.ilike.%${filters.search}%,telefono.ilike.%${filters.search}%,email.ilike.%${filters.search}%`,
    );
  }

  // Filter by tags (overlap)
  if (filters.tags?.length) {
    query = query.overlaps("tags", filters.tags);
  }

  // Date range
  if (filters.dateFrom) query = query.gte("created_at", filters.dateFrom);
  if (filters.dateTo) query = query.lte("created_at", filters.dateTo);

  // Pagination
  const limit = filters.limit ?? 50;
  const offset = filters.offset ?? 0;
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;
  if (error) {
    log.error({ error }, "Failed to fetch leads");
    return { leads: [], total: 0 };
  }

  return { leads: data ?? [], total: count ?? 0 };
}

/** Get a single lead by ID */
export async function getLead(leadId: string, supabase?: SupabaseClient) {
  const db = supabase ?? getServiceClient();
  const { data, error } = await db
    .from("leads")
    .select(
      `*,
      paciente:pacientes(id, nombre, telefono, email, financiador, plan),
      conversations(id, channel, status, unread_count, last_message_at)`,
    )
    .eq("id", leadId)
    .single();

  if (error) {
    log.error({ error, leadId }, "Failed to fetch lead");
    return null;
  }
  return data;
}

/** Update lead status (pipeline progression) */
export async function updateLeadStatus(
  leadId: string,
  estado: LeadEstado,
  supabase?: SupabaseClient,
) {
  const db = supabase ?? getServiceClient();
  const updates: Record<string, unknown> = { estado };

  if (estado === "convertido") {
    updates.converted_at = new Date().toISOString();
  }

  const { data, error } = await db.from("leads").update(updates).eq("id", leadId).select().single();

  if (error) {
    log.error({ error, leadId, estado }, "Failed to update lead status");
    return null;
  }

  log.info({ leadId, estado }, "Lead status updated");
  return data;
}

/** Assign lead to a staff member */
export async function assignLead(
  leadId: string,
  staffId: string | null,
  supabase?: SupabaseClient,
) {
  const db = supabase ?? getServiceClient();
  const { data, error } = await db
    .from("leads")
    .update({ assigned_to: staffId })
    .eq("id", leadId)
    .select()
    .single();

  if (error) {
    log.error({ error, leadId }, "Failed to assign lead");
    return null;
  }
  return data;
}

/** Add tags to a lead */
export async function addLeadTags(leadId: string, tags: string[], supabase?: SupabaseClient) {
  const db = supabase ?? getServiceClient();
  // Fetch current tags, merge, deduplicate
  const { data: lead } = await db.from("leads").select("tags").eq("id", leadId).single();
  const current: string[] = lead?.tags ?? [];
  const merged = Array.from(new Set([...current, ...tags]));

  const { data, error } = await db
    .from("leads")
    .update({ tags: merged })
    .eq("id", leadId)
    .select()
    .single();

  if (error) log.error({ error, leadId }, "Failed to update lead tags");
  return data;
}

/** Add notes to a lead */
export async function addLeadNote(leadId: string, note: string, supabase?: SupabaseClient) {
  const db = supabase ?? getServiceClient();
  const { data: lead } = await db.from("leads").select("notas").eq("id", leadId).single();
  const timestamp = new Date().toLocaleString("es-AR");
  const updated = lead?.notas
    ? `${lead.notas}\n\n[${timestamp}] ${note}`
    : `[${timestamp}] ${note}`;

  const { data, error } = await db
    .from("leads")
    .update({ notas: updated })
    .eq("id", leadId)
    .select()
    .single();

  if (error) log.error({ error, leadId }, "Failed to add lead note");
  return data;
}

// ─── Lead → Patient Conversion ───────────────────────────────

/**
 * Convert a lead to a full patient profile.
 * If the lead already has a paciente_id, just update status.
 * Otherwise create a new patient record and link it.
 */
export async function convertLeadToPatient(
  leadId: string,
  patientData: {
    nombre: string;
    dni: string;
    telefono: string;
    email?: string;
    fecha_nacimiento?: string;
    financiador?: string;
    plan?: string;
  },
  supabase?: SupabaseClient,
) {
  const db = supabase ?? getServiceClient();

  // Get lead
  const { data: lead } = await db.from("leads").select("*").eq("id", leadId).single();
  if (!lead) return { success: false, error: "Lead not found" };

  // If already linked to a patient
  if (lead.paciente_id) {
    await updateLeadStatus(leadId, "convertido", db);
    return { success: true, pacienteId: lead.paciente_id, alreadyLinked: true };
  }

  // Check for existing patient by DNI
  const { data: existing } = await db
    .from("pacientes")
    .select("id")
    .eq("clinic_id", lead.clinic_id)
    .eq("dni", patientData.dni)
    .single();

  if (existing) {
    // Link and convert
    await db.from("leads").update({ paciente_id: existing.id }).eq("id", leadId);
    await updateLeadStatus(leadId, "convertido", db);
    return { success: true, pacienteId: existing.id, alreadyLinked: true };
  }

  // Create new patient
  const { data: patient, error } = await db
    .from("pacientes")
    .insert({
      clinic_id: lead.clinic_id,
      nombre: patientData.nombre,
      dni: patientData.dni,
      telefono: patientData.telefono,
      email: patientData.email || lead.email || null,
      fecha_nacimiento: patientData.fecha_nacimiento || null,
      financiador: patientData.financiador || lead.financiador || null,
      plan: patientData.plan || null,
      estado: "activo",
      notas: `Convertido desde lead WhatsApp. Motivo original: ${lead.motivo || "N/A"}`,
    })
    .select("id")
    .single();

  if (error) {
    log.error({ error, leadId }, "Failed to create patient from lead");
    return { success: false, error: "Failed to create patient" };
  }

  // Link patient → lead & update conversations
  await db.from("leads").update({ paciente_id: patient!.id }).eq("id", leadId);
  await db.from("conversations").update({ paciente_id: patient!.id }).eq("lead_id", leadId);
  await updateLeadStatus(leadId, "convertido", db);

  log.info({ leadId, pacienteId: patient!.id }, "Lead converted to patient");
  return { success: true, pacienteId: patient!.id, alreadyLinked: false };
}

// ─── Pipeline Stats ──────────────────────────────────────────

/** Get lead pipeline stats for dashboard KPIs */
export async function getLeadStats(
  clinicId: string,
  supabase?: SupabaseClient,
): Promise<LeadStats> {
  const db = supabase ?? getServiceClient();

  // Get counts by estado
  const { data: leads } = await db
    .from("leads")
    .select("estado, fuente, first_contact_at, converted_at")
    .eq("clinic_id", clinicId);

  if (!leads?.length) {
    return {
      total: 0,
      nuevo: 0,
      contactado: 0,
      interesado: 0,
      turno_agendado: 0,
      convertido: 0,
      perdido: 0,
      byFuente: { whatsapp: 0, web: 0, referido: 0, landing: 0, chatbot: 0, manual: 0 },
      conversionRate: 0,
      avgTimeToConvert: null,
    };
  }

  const byEstado: Record<string, number> = {};
  const byFuente: Record<string, number> = {};
  const conversionTimes: number[] = [];

  for (const lead of leads) {
    byEstado[lead.estado] = (byEstado[lead.estado] || 0) + 1;
    byFuente[lead.fuente] = (byFuente[lead.fuente] || 0) + 1;

    if (lead.estado === "convertido" && lead.first_contact_at && lead.converted_at) {
      const hours =
        (new Date(lead.converted_at).getTime() - new Date(lead.first_contact_at).getTime()) /
        (1000 * 60 * 60);
      conversionTimes.push(hours);
    }
  }

  const convertidos = byEstado["convertido"] || 0;
  const total = leads.length;

  return {
    total,
    nuevo: byEstado["nuevo"] || 0,
    contactado: byEstado["contactado"] || 0,
    interesado: byEstado["interesado"] || 0,
    turno_agendado: byEstado["turno_agendado"] || 0,
    convertido: convertidos,
    perdido: byEstado["perdido"] || 0,
    byFuente: {
      whatsapp: byFuente["whatsapp"] || 0,
      web: byFuente["web"] || 0,
      referido: byFuente["referido"] || 0,
      landing: byFuente["landing"] || 0,
      chatbot: byFuente["chatbot"] || 0,
      manual: byFuente["manual"] || 0,
    },
    conversionRate: total > 0 ? Math.round((convertidos / total) * 100) : 0,
    avgTimeToConvert:
      conversionTimes.length > 0
        ? Math.round(conversionTimes.reduce((a, b) => a + b, 0) / conversionTimes.length)
        : null,
  };
}

// ─── Create Manual Lead ──────────────────────────────────────

export async function createManualLead(
  clinicId: string,
  data: {
    nombre: string;
    telefono: string;
    email?: string;
    motivo?: string;
    fuente?: LeadFuente;
    tags?: string[];
    financiador?: string;
    assignedTo?: string;
  },
  supabase?: SupabaseClient,
) {
  const db = supabase ?? getServiceClient();

  const { data: lead, error } = await db
    .from("leads")
    .insert({
      clinic_id: clinicId,
      nombre: data.nombre,
      telefono: data.telefono,
      email: data.email || null,
      motivo: data.motivo || null,
      fuente: data.fuente || "manual",
      estado: "nuevo",
      tags: data.tags || [],
      financiador: data.financiador || null,
      assigned_to: data.assignedTo || null,
      first_contact_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    log.error({ error, clinicId }, "Failed to create manual lead");
    return null;
  }

  log.info({ leadId: lead!.id, clinicId }, "Manual lead created");
  return lead;
}

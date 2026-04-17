// ─── Turno Scheduling Engine ─────────────────────────────────
// Full CRUD for appointments with conflict detection, availability
// slot management, and integration with the turnos table.
//
// Works in two modes:
// 1. Supabase mode: real database operations
// 2. Demo mode: local state management with mock data

import { isSupabaseConfigured } from "@/lib/env";
import { delay } from "@/lib/utils";
import type { Turno } from "@/lib/services/data";

// ─── Types ───────────────────────────────────────────────────

export interface AvailabilitySlot {
  id: string;
  doctorId: string;
  doctorName: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // HH:MM
  booked: boolean;
}

export interface CreateTurnoInput {
  fecha: string; // YYYY-MM-DD
  hora: string; // HH:MM
  paciente: string;
  pacienteId?: string;
  tipo: string;
  financiador: string;
  profesional: string;
  profesionalId?: string;
  notas?: string;
  durationMin?: number;
}

export interface UpdateTurnoInput {
  estado?: Turno["estado"];
  notas?: string;
  hora?: string;
  fecha?: string;
}

export interface ConflictResult {
  hasConflict: boolean;
  conflictingTurno?: Turno;
  message?: string;
}

export interface AvailabilityConfig {
  doctorId: string;
  doctorName: string;
  date: string;
  slots: string[]; // Array of HH:MM times
}

// ─── Constants ───────────────────────────────────────────────

const DEFAULT_SLOT_DURATION = 30; // minutes
const DEFAULT_SLOTS = [
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
];

// ─── Availability Management ─────────────────────────────────

/**
 * Get available slots for a doctor on a given date.
 * Returns slots that are NOT already booked.
 */
export async function getAvailableSlots(
  doctorId: string,
  date: string,
): Promise<AvailabilitySlot[]> {
  if (isSupabaseConfigured()) {
    const { createClient } = await import("@/lib/supabase/client");
    const sb = createClient();

    // Fetch doctor's availability config
    const { data: availSlots } = await sb
      .from("doctor_availability")
      .select("*")
      .eq("doctor_id", doctorId)
      .eq("date", date);

    // Fetch booked turnos for the same doctor + date
    const { data: bookedTurnos } = await sb
      .from("turnos")
      .select("hora, estado")
      .eq("profesional_id", doctorId)
      .eq("fecha", date)
      .neq("estado", "cancelado");

    const bookedTimes = new Set((bookedTurnos ?? []).map((t) => t.hora));

    // If no availability configured, use defaults
    const slots =
      availSlots && availSlots.length > 0
        ? availSlots.map((s) => ({
            id: s.id,
            doctorId: s.doctor_id,
            doctorName: "",
            date: s.date,
            timeSlot: s.time_slot,
            booked: s.booked || bookedTimes.has(s.time_slot),
          }))
        : DEFAULT_SLOTS.map((time, i) => ({
            id: `default-${i}`,
            doctorId,
            doctorName: "",
            date,
            timeSlot: time,
            booked: bookedTimes.has(time),
          }));

    return slots;
  }

  // Demo mode
  await delay(100);
  return DEFAULT_SLOTS.map((time, i) => ({
    id: `slot-${i}`,
    doctorId,
    doctorName: "",
    date,
    timeSlot: time,
    booked: Math.random() < 0.3, // 30% random booking
  }));
}

/**
 * Configure available slots for a doctor on a date.
 * Useful for managing doctor schedules.
 */
export async function setAvailability(config: AvailabilityConfig): Promise<void> {
  if (isSupabaseConfigured()) {
    const { createClient } = await import("@/lib/supabase/client");
    const sb = createClient();

    // Delete existing slots for this doctor+date
    await sb
      .from("doctor_availability")
      .delete()
      .eq("doctor_id", config.doctorId)
      .eq("date", config.date);

    // Insert new slots
    const rows = config.slots.map((time) => ({
      doctor_id: config.doctorId,
      date: config.date,
      time_slot: time,
      booked: false,
    }));

    await sb.from("doctor_availability").insert(rows);
    return;
  }

  // Demo mode: no-op
  await delay(100);
}

// ─── Conflict Detection ──────────────────────────────────────

/**
 * Check if a proposed turno conflicts with existing ones.
 * A conflict means the same doctor already has a turno at the same time.
 */
export async function checkConflict(
  profesionalId: string,
  fecha: string,
  hora: string,
  excludeTurnoId?: string,
  clinicId?: string,
): Promise<ConflictResult> {
  if (isSupabaseConfigured()) {
    const { createClient } = await import("@/lib/supabase/client");
    const sb = createClient();

    // Try matching by profesional_id first (UUID), fall back to profesional (name)
    let query = sb
      .from("turnos")
      .select("*")
      .eq("fecha", fecha)
      .eq("hora", hora)
      .neq("estado", "cancelado");

    // UUID pattern check — if it looks like a UUID, query profesional_id
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      profesionalId,
    );
    if (isUUID) {
      query = query.eq("profesional_id", profesionalId);
    } else {
      query = query.eq("profesional", profesionalId);
    }

    if (clinicId) {
      query = query.eq("clinic_id", clinicId);
    }

    if (excludeTurnoId) {
      query = query.neq("id", excludeTurnoId);
    }

    const { data } = await query;

    if (data && data.length > 0) {
      return {
        hasConflict: true,
        message: `El profesional ya tiene un turno a las ${hora} del ${fecha}`,
      };
    }
    return { hasConflict: false };
  }

  // Demo mode: no conflict
  await delay(50);
  return { hasConflict: false };
}

/**
 * Check if a patient already has a turno on the same date.
 */
export async function checkPatientConflict(
  paciente: string,
  fecha: string,
  excludeTurnoId?: string,
): Promise<ConflictResult> {
  if (isSupabaseConfigured()) {
    const { createClient } = await import("@/lib/supabase/client");
    const sb = createClient();

    let query = sb
      .from("turnos")
      .select("*")
      .eq("paciente", paciente)
      .eq("fecha", fecha)
      .neq("estado", "cancelado");

    if (excludeTurnoId) {
      query = query.neq("id", excludeTurnoId);
    }

    const { data } = await query;

    if (data && data.length > 0) {
      return {
        hasConflict: true,
        message: `${paciente} ya tiene un turno el ${fecha}`,
      };
    }
    return { hasConflict: false };
  }

  await delay(50);
  return { hasConflict: false };
}

// ─── CRUD Operations ─────────────────────────────────────────

/**
 * Create a new turno with conflict detection.
 */
export async function createTurno(
  input: CreateTurnoInput,
): Promise<{ success: boolean; turno?: Turno; error?: string }> {
  if (isSupabaseConfigured()) {
    const { createClient } = await import("@/lib/supabase/client");
    const sb = createClient();

    // Get clinic_id: prefer profiles table (authoritative), fall back to user_metadata
    const {
      data: { user },
    } = await sb.auth.getUser();
    let clinicId = user?.user_metadata?.clinic_id;
    if (!clinicId && user?.id) {
      const { data: profile } = await sb
        .from("profiles")
        .select("clinic_id")
        .eq("id", user.id)
        .single();
      clinicId = profile?.clinic_id;
    }
    if (!clinicId) {
      return {
        success: false,
        error: "No se pudo determinar la clinica. Cerra sesion y volve a ingresar.",
      };
    }

    // 1. Check for conflicts (scoped to clinic)
    const conflict = await checkConflict(
      input.profesionalId ?? input.profesional,
      input.fecha,
      input.hora,
      undefined,
      clinicId,
    );
    if (conflict.hasConflict) {
      return { success: false, error: conflict.message };
    }

    // Resolve paciente_id if not already provided
    let pacienteId = input.pacienteId ?? null;
    if (!pacienteId && input.paciente?.trim()) {
      const { data: match } = await sb
        .from("pacientes")
        .select("id")
        .eq("clinic_id", clinicId)
        .ilike("nombre", input.paciente.trim())
        .limit(1)
        .single();
      if (match) pacienteId = match.id;
    }

    const { data, error } = await sb
      .from("turnos")
      .insert({
        clinic_id: clinicId,
        fecha: input.fecha,
        hora: input.hora,
        paciente: input.paciente,
        paciente_id: pacienteId,
        tipo: input.tipo,
        financiador: input.financiador,
        profesional: input.profesional,
        profesional_id: input.profesionalId ?? null,
        estado: "pendiente",
        notas: input.notas ?? null,
        duration_min: input.durationMin ?? DEFAULT_SLOT_DURATION,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    // Mark the availability slot as booked
    await sb
      .from("doctor_availability")
      .update({ booked: true })
      .eq("doctor_id", input.profesionalId ?? input.profesional)
      .eq("date", input.fecha)
      .eq("time_slot", input.hora);

    // ── Notify the assigned doctor ─────────────────────────
    // Insert an alert so the doctor (and dashboard) gets a real-time notification
    // via Supabase Realtime on the `alertas` table.
    try {
      await sb.from("alertas").insert({
        clinic_id: clinicId,
        tipo: "turno",
        titulo: `Nuevo turno: ${input.paciente}`,
        detalle: `${input.fecha} ${input.hora} — ${input.tipo} — ${input.financiador} — Dr. ${input.profesional}`,
        fecha: new Date().toISOString(),
        acento: "celeste",
        read: false,
      });
    } catch {
      // Non-critical — turno was already created successfully
    }

    return {
      success: true,
      turno: {
        id: data.id,
        fecha: data.fecha,
        hora: data.hora,
        paciente: data.paciente,
        pacienteId: data.paciente_id ?? undefined,
        tipo: data.tipo,
        financiador: data.financiador,
        profesional: data.profesional,
        estado: data.estado as Turno["estado"],
        notas: data.notas ?? undefined,
        durationMin: data.duration_min ?? undefined,
      },
    };
  }

  // Demo mode
  await delay(200);
  const newTurno: Turno = {
    id: `t-${Date.now()}`,
    fecha: input.fecha,
    hora: input.hora,
    paciente: input.paciente,
    tipo: input.tipo,
    financiador: input.financiador,
    profesional: input.profesional,
    estado: "pendiente",
    notas: input.notas,
  };
  return { success: true, turno: newTurno };
}

/**
 * Update a turno (status, notes, reschedule).
 */
export async function updateTurno(
  id: string,
  updates: UpdateTurnoInput,
): Promise<{ success: boolean; error?: string }> {
  // If rescheduling, check for conflicts
  if (updates.hora || updates.fecha) {
    // We'd need the current turno data to get the profesional
    if (isSupabaseConfigured()) {
      const { createClient } = await import("@/lib/supabase/client");
      const sb = createClient();

      const { data: current } = await sb.from("turnos").select("*").eq("id", id).single();
      if (current) {
        const conflict = await checkConflict(
          current.profesional,
          updates.fecha ?? current.fecha,
          updates.hora ?? current.hora,
          id,
        );
        if (conflict.hasConflict) {
          return { success: false, error: conflict.message };
        }
      }
    }
  }

  if (isSupabaseConfigured()) {
    const { createClient } = await import("@/lib/supabase/client");
    const sb = createClient();

    const updateData: Record<string, string> = {};
    if (updates.estado) updateData.estado = updates.estado;
    if (updates.notas !== undefined) updateData.notas = updates.notas;
    if (updates.hora) updateData.hora = updates.hora;
    if (updates.fecha) updateData.fecha = updates.fecha;

    const { error } = await sb.from("turnos").update(updateData).eq("id", id);

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
 * Cancel a turno and free up the slot.
 */
export async function cancelTurno(
  id: string,
  reason?: string,
): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured()) {
    const { createClient } = await import("@/lib/supabase/client");
    const sb = createClient();

    // Get the turno first to free the slot
    const { data: turno } = await sb
      .from("turnos")
      .select("profesional, fecha, hora")
      .eq("id", id)
      .single();

    const { error } = await sb
      .from("turnos")
      .update({
        estado: "cancelado",
        notas: reason ? `Cancelado: ${reason}` : "Cancelado",
      })
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    // Free the availability slot
    if (turno) {
      await sb
        .from("doctor_availability")
        .update({ booked: false })
        .eq("doctor_id", turno.profesional)
        .eq("date", turno.fecha)
        .eq("time_slot", turno.hora);
    }

    return { success: true };
  }

  // Demo mode
  await delay(150);
  return { success: true };
}

/**
 * Mark a turno as attended.
 */
export async function attendTurno(id: string): Promise<{ success: boolean; error?: string }> {
  return updateTurno(id, { estado: "atendido" });
}

/**
 * Confirm a pending turno.
 */
export async function confirmTurno(id: string): Promise<{ success: boolean; error?: string }> {
  return updateTurno(id, { estado: "confirmado" });
}

// ─── Query helpers ───────────────────────────────────────────

/**
 * Get turnos for a specific date range.
 */
export async function getTurnosByDateRange(startDate: string, endDate: string): Promise<Turno[]> {
  if (isSupabaseConfigured()) {
    const { createClient } = await import("@/lib/supabase/client");
    const sb = createClient();

    const { data } = await sb
      .from("turnos")
      .select("*")
      .gte("fecha", startDate)
      .lte("fecha", endDate)
      .order("fecha", { ascending: true })
      .order("hora", { ascending: true });

    return (data ?? []).map((row) => ({
      id: row.id,
      fecha: row.fecha,
      hora: row.hora,
      paciente: row.paciente,
      pacienteId: row.paciente_id ?? undefined,
      tipo: row.tipo,
      financiador: row.financiador,
      profesional: row.profesional,
      estado: row.estado as Turno["estado"],
      notas: row.notas ?? undefined,
      durationMin: row.duration_min ?? undefined,
    }));
  }

  // Demo mode: import getTurnos
  const { getTurnos } = await import("@/lib/services/data");
  return getTurnos();
}

/**
 * Get turnos for a specific professional.
 */
export async function getTurnosByProfessional(
  profesional: string,
  fecha?: string,
): Promise<Turno[]> {
  if (isSupabaseConfigured()) {
    const { createClient } = await import("@/lib/supabase/client");
    const sb = createClient();

    let query = sb
      .from("turnos")
      .select("*")
      .eq("profesional", profesional)
      .order("hora", { ascending: true });

    if (fecha) {
      query = query.eq("fecha", fecha);
    }

    const { data } = await query;

    return (data ?? []).map((row) => ({
      id: row.id,
      fecha: row.fecha,
      hora: row.hora,
      paciente: row.paciente,
      pacienteId: row.paciente_id ?? undefined,
      tipo: row.tipo,
      financiador: row.financiador,
      profesional: row.profesional,
      estado: row.estado as Turno["estado"],
      notas: row.notas ?? undefined,
      durationMin: row.duration_min ?? undefined,
    }));
  }

  const { getTurnos } = await import("@/lib/services/data");
  const all = await getTurnos();
  return all.filter((t) => t.profesional === profesional);
}

/**
 * Get today's turno statistics.
 */
export async function getTodayStats(): Promise<{
  total: number;
  confirmados: number;
  pendientes: number;
  atendidos: number;
  cancelados: number;
  occupancy: number;
}> {
  const today = new Date().toISOString().slice(0, 10);
  const turnos = await getTurnosByDateRange(today, today);

  const total = turnos.length;
  const confirmados = turnos.filter((t) => t.estado === "confirmado").length;
  const pendientes = turnos.filter((t) => t.estado === "pendiente").length;
  const atendidos = turnos.filter((t) => t.estado === "atendido").length;
  const cancelados = turnos.filter((t) => t.estado === "cancelado").length;
  const occupancy =
    DEFAULT_SLOTS.length > 0 ? Math.round(((total - cancelados) / DEFAULT_SLOTS.length) * 100) : 0;

  return { total, confirmados, pendientes, atendidos, cancelados, occupancy };
}

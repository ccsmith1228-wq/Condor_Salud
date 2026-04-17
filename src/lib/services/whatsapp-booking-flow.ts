// ─── WhatsApp Appointment Booking Flow ────────────────────────
// Conversational flow that lets patients book appointments via WhatsApp.
// State machine: idle → awaiting_doctor → awaiting_date → awaiting_time → confirm → done
//
// The flow is triggered when an incoming message matches appointment intent
// keywords. State is stored in the `conversations` table metadata column.

import { isSupabaseConfigured } from "@/lib/env";
import { createClientLogger } from "@/lib/logger";

const log = createClientLogger("wa-booking-flow");

// eslint-disable-next-line
type SB = any; // Supabase service client

// ─── Intent Detection ────────────────────────────────────────

const BOOKING_INTENT_REGEX =
  /\b(turno|cita|reservar|agendar|sacar turno|pedir turno|appointment|book|quiero turno|necesito turno|quiero ver al doctor|quiero ir)\b/i;

const CANCEL_FLOW_KEYWORDS = /\b(cancelar|salir|no|exit|cancel|volver)\b/i;

export function hasBookingIntent(text: string): boolean {
  return BOOKING_INTENT_REGEX.test(text);
}

// ─── Types ───────────────────────────────────────────────────

type BookingStep = "awaiting_doctor" | "awaiting_date" | "awaiting_time" | "awaiting_confirm";

interface BookingFlowState {
  step: BookingStep;
  doctorId?: string;
  doctorName?: string;
  date?: string;
  time?: string;
  suggestedDoctorId?: string;
  suggestedDoctorName?: string;
  availableDoctors?: { id: string; name: string }[];
  availableSlots?: string[];
}

interface FlowResult {
  handled: boolean;
  reply?: string;
}

// ─── Main Entry Point ────────────────────────────────────────

/**
 * Process a WhatsApp message through the booking flow.
 * Returns { handled: true, reply } if the message was consumed by the flow.
 */
export async function handleBookingFlow(
  fromPhone: string,
  messageBody: string,
  clinicId: string,
  conversationId?: string,
): Promise<FlowResult> {
  if (!isSupabaseConfigured() || !clinicId) {
    return { handled: false };
  }

  const { createClient } = await import("@supabase/supabase-js");
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const text = messageBody.trim();

  // Load current flow state from conversation metadata
  let state: BookingFlowState | null = null;
  let convId = conversationId;

  if (convId) {
    const { data: conv } = await sb
      .from("conversations")
      .select("id, metadata")
      .eq("id", convId)
      .single();
    if (conv?.metadata?.booking_flow) {
      state = conv.metadata.booking_flow as BookingFlowState;
    }
  } else {
    // Find conversation by phone + clinic
    const { data: conv } = await sb
      .from("conversations")
      .select("id, metadata")
      .eq("clinic_id", clinicId)
      .eq("patient_phone", fromPhone)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    if (conv) {
      convId = conv.id;
      if (conv.metadata?.booking_flow) {
        state = conv.metadata.booking_flow as BookingFlowState;
      }
    }
  }

  // If user wants to cancel the flow
  if (state && CANCEL_FLOW_KEYWORDS.test(text)) {
    await clearFlowState(sb, convId!);
    return {
      handled: true,
      reply: "Reserva cancelada. Si necesitas algo mas, escribime. 🙂",
    };
  }

  // If there's an active flow, continue it
  if (state) {
    return await continueFlow(sb, clinicId, fromPhone, convId!, state, text);
  }

  // Check if this is a new booking intent
  if (hasBookingIntent(text)) {
    return await startBookingFlow(sb, clinicId, fromPhone, convId);
  }

  return { handled: false };
}

// ─── Start Flow ──────────────────────────────────────────────

async function startBookingFlow(
  sb: SB,
  clinicId: string,
  fromPhone: string,
  conversationId?: string,
): Promise<FlowResult> {
  // Look up patient by phone
  const { data: paciente } = await sb
    .from("pacientes")
    .select("id, nombre, telefono, financiador")
    .eq("clinic_id", clinicId)
    .eq("telefono", fromPhone)
    .maybeSingle();

  // Find preferred doctor from appointment history
  let suggestedDoctor: { id: string; name: string } | null = null;
  if (paciente) {
    const { data: pastTurnos } = await sb
      .from("turnos")
      .select("profesional_id, profesional")
      .eq("clinic_id", clinicId)
      .eq("paciente_id", paciente.id)
      .neq("estado", "cancelado")
      .order("fecha", { ascending: false })
      .limit(10);

    if (pastTurnos && pastTurnos.length > 0) {
      // Count doctor frequency
      const freq: Record<string, { id: string; name: string; count: number }> = {};
      for (const t of pastTurnos) {
        const key = t.profesional_id || t.profesional;
        if (!freq[key]) {
          freq[key] = { id: t.profesional_id || "", name: t.profesional, count: 0 };
        }
        freq[key].count++;
      }
      const top = Object.values(freq).sort((a, b) => b.count - a.count)[0];
      if (top) suggestedDoctor = { id: top.id, name: top.name };
    }
  }

  // Get all doctors for this clinic
  const { data: doctors } = await sb
    .from("profiles")
    .select("id, full_name, role")
    .eq("clinic_id", clinicId)
    .in("role", ["medico", "admin"]);

  const doctorList = (doctors || [])
    .filter((d: { full_name: string }) => d.full_name)
    .map((d: { id: string; full_name: string }) => ({ id: d.id, name: d.full_name }));

  if (doctorList.length === 0) {
    return {
      handled: true,
      reply:
        "Lo siento, no hay profesionales disponibles en este momento. Llama a la clinica para coordinar tu turno.",
    };
  }

  // Build the reply
  const greeting = paciente ? `Hola ${paciente.nombre.split(" ")[0]}! 👋` : "Hola! 👋";

  let reply = `${greeting} Vamos a agendar tu turno.\n\n`;

  if (suggestedDoctor) {
    reply += `Tu profesional habitual es *Dr. ${suggestedDoctor.name}*.\n`;
    reply += `Responde *1* para agendar con el/ella, o elegí un profesional:\n\n`;
  } else {
    reply += `Elegí un profesional:\n\n`;
  }

  doctorList.forEach((d: { id: string; name: string }, i: number) => {
    const num = suggestedDoctor ? i + 2 : i + 1;
    reply += `*${num}* — Dr. ${d.name}\n`;
  });

  reply += `\nResponde con el número o el nombre del profesional.`;
  reply += `\n_Escribí "cancelar" en cualquier momento para salir._`;

  // Save flow state
  const flowState: BookingFlowState = {
    step: "awaiting_doctor",
    suggestedDoctorId: suggestedDoctor?.id,
    suggestedDoctorName: suggestedDoctor?.name,
    availableDoctors: doctorList,
  };

  await saveFlowState(sb, conversationId, clinicId, fromPhone, flowState);

  return { handled: true, reply };
}

// ─── Continue Flow ───────────────────────────────────────────

async function continueFlow(
  sb: SB,
  clinicId: string,
  fromPhone: string,
  conversationId: string,
  state: BookingFlowState,
  text: string,
): Promise<FlowResult> {
  switch (state.step) {
    case "awaiting_doctor":
      return handleDoctorSelection(sb, clinicId, fromPhone, conversationId, state, text);
    case "awaiting_date":
      return handleDateSelection(sb, clinicId, fromPhone, conversationId, state, text);
    case "awaiting_time":
      return handleTimeSelection(sb, clinicId, fromPhone, conversationId, state, text);
    case "awaiting_confirm":
      return handleConfirmation(sb, clinicId, fromPhone, conversationId, state, text);
    default:
      await clearFlowState(sb, conversationId);
      return { handled: false };
  }
}

// ─── Step: Doctor Selection ──────────────────────────────────

async function handleDoctorSelection(
  sb: SB,
  clinicId: string,
  fromPhone: string,
  conversationId: string,
  state: BookingFlowState,
  text: string,
): Promise<FlowResult> {
  const doctors = state.availableDoctors || [];
  let selectedDoctor: { id: string; name: string } | null = null;

  // Check if user picked "1" (suggested doctor)
  if (text === "1" && state.suggestedDoctorId) {
    selectedDoctor = { id: state.suggestedDoctorId, name: state.suggestedDoctorName || "" };
  } else {
    // Parse numeric selection
    const num = parseInt(text, 10);
    const offset = state.suggestedDoctorId ? 2 : 1;
    if (!isNaN(num) && num >= offset && num < offset + doctors.length) {
      selectedDoctor = doctors[num - offset] ?? null;
    }

    // Try name matching
    if (!selectedDoctor) {
      const lower = text.toLowerCase();
      selectedDoctor =
        doctors.find(
          (d: { id: string; name: string }) =>
            d.name.toLowerCase().includes(lower) ||
            lower.includes(d.name.toLowerCase().split(" ")[0] || ""),
        ) || null;
    }
  }

  if (!selectedDoctor) {
    return {
      handled: true,
      reply:
        "No entendí tu selección. Por favor responde con el *número* del profesional o su nombre.",
    };
  }

  // Get next 5 business days
  const days = getNext5BusinessDays();
  let reply = `Perfecto, *Dr. ${selectedDoctor.name}* ✅\n\n`;
  reply += `¿Qué día te queda bien?\n\n`;
  days.forEach((d, i) => {
    reply += `*${i + 1}* — ${d.label}\n`;
  });
  reply += `\nO escribí una fecha (ej: *21/4* o *2026-04-21*)`;

  const newState: BookingFlowState = {
    ...state,
    step: "awaiting_date",
    doctorId: selectedDoctor.id,
    doctorName: selectedDoctor.name,
  };
  await saveFlowState(sb, conversationId, clinicId, fromPhone, newState);

  return { handled: true, reply };
}

// ─── Step: Date Selection ────────────────────────────────────

async function handleDateSelection(
  sb: SB,
  clinicId: string,
  fromPhone: string,
  conversationId: string,
  state: BookingFlowState,
  text: string,
): Promise<FlowResult> {
  const days = getNext5BusinessDays();
  let selectedDate: string | null = null;
  let dateLabel = "";

  // Numeric selection
  const num = parseInt(text, 10);
  if (!isNaN(num) && num >= 1 && num <= days.length) {
    selectedDate = days[num - 1]!.value;
    dateLabel = days[num - 1]!.label;
  }

  // Parse dd/mm or yyyy-mm-dd
  if (!selectedDate) {
    const ddmm = text.match(/^(\d{1,2})[\/\-](\d{1,2})$/);
    if (ddmm) {
      const day = parseInt(ddmm[1]!, 10);
      const month = parseInt(ddmm[2]!, 10);
      const year = new Date().getFullYear();
      selectedDate = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    }
    const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (iso) {
      selectedDate = text;
    }
  }

  if (!selectedDate) {
    return {
      handled: true,
      reply: "No entendí la fecha. Responde con un *número* (1-5) o una fecha como *21/4*.",
    };
  }

  // Validate date is not in the past
  const today = new Date().toISOString().split("T")[0]!;
  if (selectedDate < today) {
    return {
      handled: true,
      reply: "Esa fecha ya pasó. Elegí una fecha futura.",
    };
  }

  if (!dateLabel) {
    const d = new Date(selectedDate + "T12:00:00");
    dateLabel = d.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });
  }

  // Get available slots for this doctor + date
  const { data: bookedTurnos } = await sb
    .from("turnos")
    .select("hora")
    .eq("profesional_id", state.doctorId!)
    .eq("fecha", selectedDate)
    .neq("estado", "cancelado");

  const bookedTimes = new Set((bookedTurnos || []).map((t: { hora: string }) => t.hora));
  const allSlots = [
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
  const available = allSlots.filter((s) => !bookedTimes.has(s));

  if (available.length === 0) {
    return {
      handled: true,
      reply: `No hay turnos disponibles con Dr. ${state.doctorName} el ${dateLabel}. Elegí otra fecha.`,
    };
  }

  let reply = `📅 *${dateLabel}* con Dr. ${state.doctorName}\n\n`;
  reply += `Horarios disponibles:\n\n`;
  available.forEach((s, i) => {
    reply += `*${i + 1}* — ${s}\n`;
  });
  reply += `\nResponde con el número o la hora (ej: *10:30*).`;

  const newState: BookingFlowState = {
    ...state,
    step: "awaiting_time",
    date: selectedDate,
    availableSlots: available,
  };
  await saveFlowState(sb, conversationId, clinicId, fromPhone, newState);

  return { handled: true, reply };
}

// ─── Step: Time Selection ────────────────────────────────────

async function handleTimeSelection(
  sb: SB,
  clinicId: string,
  fromPhone: string,
  conversationId: string,
  state: BookingFlowState,
  text: string,
): Promise<FlowResult> {
  const slots = state.availableSlots || [];
  let selectedTime: string | null = null;

  // Numeric selection
  const num = parseInt(text, 10);
  if (!isNaN(num) && num >= 1 && num <= slots.length) {
    selectedTime = slots[num - 1] ?? null;
  }

  // Direct time match
  if (!selectedTime) {
    const timeMatch = text.match(/^(\d{1,2}):?(\d{2})$/);
    if (timeMatch) {
      const formatted = `${String(parseInt(timeMatch[1]!, 10)).padStart(2, "0")}:${timeMatch[2]!}`;
      if (slots.includes(formatted)) {
        selectedTime = formatted;
      }
    }
  }

  if (!selectedTime) {
    return {
      handled: true,
      reply: "No entendí el horario. Responde con el *número* o la hora (ej: *10:30*).",
    };
  }

  const dateObj = new Date(state.date + "T12:00:00");
  const dateLabel = dateObj.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  let reply = `Perfecto! Confirma tu turno:\n\n`;
  reply += `🩺 *Dr. ${state.doctorName}*\n`;
  reply += `📅 *${dateLabel}*\n`;
  reply += `🕐 *${selectedTime}*\n\n`;
  reply += `Responde *SI* para confirmar o *NO* para cancelar.`;

  const newState: BookingFlowState = {
    ...state,
    step: "awaiting_confirm",
    time: selectedTime,
  };
  await saveFlowState(sb, conversationId, clinicId, fromPhone, newState);

  return { handled: true, reply };
}

// ─── Step: Confirmation ──────────────────────────────────────

async function handleConfirmation(
  sb: SB,
  clinicId: string,
  fromPhone: string,
  conversationId: string,
  state: BookingFlowState,
  text: string,
): Promise<FlowResult> {
  const upper = text.toUpperCase().trim();
  const yes = ["SI", "SÍ", "YES", "OK", "CONFIRMAR", "DALE", "LISTO", "1"];
  const no = ["NO", "CANCELAR", "CANCEL", "2"];

  if (no.some((k) => upper.includes(k))) {
    await clearFlowState(sb, conversationId);
    return {
      handled: true,
      reply: "Turno cancelado. Si necesitas agendar otro turno, escribí *turno* 🙂",
    };
  }

  if (!yes.some((k) => upper.includes(k))) {
    return {
      handled: true,
      reply: "Responde *SI* para confirmar o *NO* para cancelar.",
    };
  }

  // Look up patient
  const { data: paciente } = await sb
    .from("pacientes")
    .select("id, nombre, financiador")
    .eq("clinic_id", clinicId)
    .eq("telefono", fromPhone)
    .maybeSingle();

  const patientName = paciente?.nombre || "Paciente WhatsApp";
  const patientId = paciente?.id || null;
  const financiador = paciente?.financiador || "Particular";

  // Double-check no conflict
  const { data: conflicts } = await sb
    .from("turnos")
    .select("id")
    .eq("profesional_id", state.doctorId!)
    .eq("fecha", state.date!)
    .eq("hora", state.time!)
    .neq("estado", "cancelado");

  if (conflicts && conflicts.length > 0) {
    await clearFlowState(sb, conversationId);
    return {
      handled: true,
      reply: `Ese horario acaba de ser ocupado. Escribí *turno* para buscar otro horario.`,
    };
  }

  // Create the turno
  const { data: turno, error } = await sb
    .from("turnos")
    .insert({
      clinic_id: clinicId,
      fecha: state.date,
      hora: state.time,
      paciente: patientName,
      paciente_id: patientId,
      tipo: "consulta",
      financiador,
      profesional: state.doctorName,
      profesional_id: state.doctorId,
      estado: "confirmado",
      notas: `Turno agendado via WhatsApp (${fromPhone})`,
      duration_min: 30,
    })
    .select()
    .single();

  if (error) {
    log.error({ error }, "Failed to create turno from WhatsApp");
    await clearFlowState(sb, conversationId);
    return {
      handled: true,
      reply: "Hubo un error al crear el turno. Por favor llama a la clinica para coordinar.",
    };
  }

  // Mark availability slot as booked
  await sb
    .from("doctor_availability")
    .update({ booked: true })
    .eq("doctor_id", state.doctorId!)
    .eq("date", state.date!)
    .eq("time_slot", state.time!);

  // Create alert for dashboard
  try {
    await sb.from("alertas").insert({
      clinic_id: clinicId,
      tipo: "turno",
      titulo: `Nuevo turno via WhatsApp: ${patientName}`,
      detalle: `${state.date} ${state.time} — consulta — ${financiador} — Dr. ${state.doctorName}`,
      fecha: new Date().toISOString(),
      acento: "celeste",
      read: false,
    });
  } catch {
    /* non-critical */
  }

  await clearFlowState(sb, conversationId);

  const dateObj = new Date(state.date + "T12:00:00");
  const dateLabel = dateObj.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return {
    handled: true,
    reply:
      `✅ *Turno confirmado!*\n\n` +
      `🩺 Dr. ${state.doctorName}\n` +
      `📅 ${dateLabel}\n` +
      `🕐 ${state.time}\n` +
      `📍 Presentate 10 minutos antes\n\n` +
      `Vas a recibir un recordatorio 24hs antes.\n` +
      `Para cancelar, escribí *CANCELAR*.`,
  };
}

// ─── Helpers ─────────────────────────────────────────────────

async function saveFlowState(
  sb: SB,
  conversationId: string | undefined,
  clinicId: string,
  fromPhone: string,
  state: BookingFlowState,
): Promise<void> {
  if (conversationId) {
    // Get current metadata and merge
    const { data: conv } = await sb
      .from("conversations")
      .select("metadata")
      .eq("id", conversationId)
      .single();

    await sb
      .from("conversations")
      .update({
        metadata: { ...(conv?.metadata || {}), booking_flow: state },
      })
      .eq("id", conversationId);
  }
}

async function clearFlowState(sb: SB, conversationId: string): Promise<void> {
  const { data: conv } = await sb
    .from("conversations")
    .select("metadata")
    .eq("id", conversationId)
    .single();

  if (conv) {
    const meta = { ...(conv.metadata || {}) };
    delete meta.booking_flow;
    await sb.from("conversations").update({ metadata: meta }).eq("id", conversationId);
  }
}

function getNext5BusinessDays(): { label: string; value: string }[] {
  const result: { label: string; value: string }[] = [];
  const d = new Date();
  // Use ART timezone offset
  d.setMinutes(d.getMinutes() + d.getTimezoneOffset() - 180);

  while (result.length < 5) {
    d.setDate(d.getDate() + 1);
    const day = d.getDay();
    if (day === 0 || day === 6) continue; // Skip weekends
    const iso = d.toISOString().split("T")[0]!;
    const label = d.toLocaleDateString("es-AR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
    result.push({ label, value: iso });
  }
  return result;
}

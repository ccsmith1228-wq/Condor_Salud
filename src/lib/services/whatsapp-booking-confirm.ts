// ─── WhatsApp Booking Confirmation Handler ───────────────────
// Processes CONFIRMAR/RECHAZAR/CANCELAR replies from clinic staff
// and patients via WhatsApp. Called from the WhatsApp webhook.

import { isSupabaseConfigured } from "@/lib/env";
import { createClientLogger } from "@/lib/logger";

const log = createClientLogger("wa-booking-confirm");

// Keywords in Spanish and English
const CONFIRM_KEYWORDS = ["CONFIRMAR", "CONFIRM", "SI", "SÍ", "YES", "OK"];
const REJECT_KEYWORDS = ["RECHAZAR", "REJECT", "NO", "NEGAR"];
const CANCEL_KEYWORDS = ["CANCELAR", "CANCEL"];

export interface WhatsAppBookingResult {
  handled: boolean;
  action?: "confirmed" | "cancelled" | "unknown";
  bookingId?: string;
  message?: string;
}

/**
 * Try to handle an incoming WhatsApp message as a booking action.
 * Returns { handled: false } if the message isn't a booking command.
 */
export async function handleBookingReply(
  fromPhone: string,
  messageBody: string,
  clinicId: string,
): Promise<WhatsAppBookingResult> {
  if (!isSupabaseConfigured()) {
    return { handled: false };
  }

  const text = messageBody.trim().toUpperCase();

  // Quick check: is this a booking-related keyword?
  const isConfirm = CONFIRM_KEYWORDS.some((k) => text.includes(k));
  const isReject = REJECT_KEYWORDS.some((k) => text.includes(k));
  const isCancel = CANCEL_KEYWORDS.some((k) => text.includes(k));

  if (!isConfirm && !isReject && !isCancel) {
    return { handled: false };
  }

  const { createClient } = await import("@supabase/supabase-js");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const sb = createClient(url, key);
  const sbAny = sb as unknown as { from: (t: string) => ReturnType<typeof sb.from> };

  // Determine if this is from a clinic (staff confirming) or a patient (cancelling)
  // First, check if this phone belongs to a clinic
  const { data: clinic } = (await sbAny
    .from("clinics")
    .select("id, name, phone")
    .eq("id", clinicId)
    .single()) as { data: Record<string, unknown> | null };

  const isClinicPhone =
    clinic?.phone && normalizePhone(clinic.phone as string) === normalizePhone(fromPhone);

  if (isClinicPhone && (isConfirm || isReject)) {
    // Clinic staff is confirming/rejecting the most recent pending booking
    return handleClinicAction(sbAny, clinicId, isConfirm ? "confirm" : "cancel", text);
  }

  if (isCancel) {
    // Patient is cancelling their booking
    return handlePatientCancel(sbAny, clinicId, fromPhone);
  }

  // Confirm from non-clinic phone — might be patient confirming attendance
  if (isConfirm) {
    return handlePatientCancel(sbAny, clinicId, fromPhone); // no-op, just ack
  }

  return { handled: false };
}

// ─── Clinic confirms/rejects ─────────────────────────────────

async function handleClinicAction(
  sb: { from: (t: string) => unknown },
  clinicId: string,
  action: "confirm" | "cancel",
  _rawText: string,
): Promise<WhatsAppBookingResult> {
  const sbTyped = sb as unknown as {
    from: (
      t: string,
    ) => ReturnType<ReturnType<(typeof import("@supabase/supabase-js"))["createClient"]>["from"]>;
  };

  // Find the most recent notified/pending booking for this clinic
  const { data: booking } = (await sbTyped
    .from("clinic_bookings")
    .select(
      "id, patient_name, patient_phone, patient_email, patient_language, fecha, hora, doctor_id",
    )
    .eq("clinic_id", clinicId)
    .in("status", ["pending", "notified"])
    .order("created_at", { ascending: false })
    .limit(1)
    .single()) as { data: Record<string, unknown> | null };

  if (!booking) {
    return {
      handled: true,
      action: "unknown",
      message: "No hay turnos pendientes para confirmar o rechazar.",
    };
  }

  const newStatus = action === "confirm" ? "confirmed" : "cancelled";

  const updateData: Record<string, unknown> = { status: newStatus };
  if (action === "confirm") {
    updateData.confirmed_at = new Date().toISOString();
  } else {
    updateData.cancelled_at = new Date().toISOString();
    updateData.cancel_reason = "Rechazado por WhatsApp";
  }

  await sbTyped.from("clinic_bookings").update(updateData).eq("id", booking.id);

  // Notify patient
  try {
    const { notifyPatientConfirmation, notifyPatientCancellation } =
      await import("@/lib/services/clinic-notifications");

    // Fetch clinic + doctor names
    const { data: clinic } = (await sbTyped
      .from("clinics")
      .select("name, email, phone")
      .eq("id", clinicId)
      .single()) as { data: Record<string, unknown> | null };

    const { data: doctor } = (await sbTyped
      .from("doctors")
      .select("name, specialty")
      .eq("id", booking.doctor_id)
      .single()) as { data: Record<string, unknown> | null };

    const notifyInput = {
      bookingId: booking.id as string,
      clinicId,
      clinicName: (clinic?.name ?? "Clínica") as string,
      clinicEmail: (clinic?.email ?? "") as string,
      clinicPhone: (clinic?.phone ?? null) as string | null,
      doctorName: (doctor?.name ?? "Doctor") as string,
      patientName: booking.patient_name as string,
      patientEmail: (booking.patient_email ?? null) as string | null,
      patientPhone: (booking.patient_phone ?? null) as string | null,
      patientLanguage: (booking.patient_language ?? "es") as string,
      fecha: booking.fecha as string,
      hora: booking.hora as string,
      specialty: null,
      tipo: "presencial",
    };

    if (action === "confirm") {
      await notifyPatientConfirmation(notifyInput);
    } else {
      await notifyPatientCancellation({ ...notifyInput, reason: "Rechazado por la clínica" });
    }
  } catch (err) {
    log.warn({ err }, "Patient notification failed after WhatsApp confirmation");
  }

  const patientName = booking.patient_name as string;
  return {
    handled: true,
    action: newStatus as "confirmed" | "cancelled",
    bookingId: booking.id as string,
    message:
      action === "confirm"
        ? `✅ Turno de ${patientName} confirmado. Se le notificó al paciente.`
        : `❌ Turno de ${patientName} rechazado. Se le notificó al paciente.`,
  };
}

// ─── Patient cancels ─────────────────────────────────────────

async function handlePatientCancel(
  sb: { from: (t: string) => unknown },
  clinicId: string,
  patientPhone: string,
): Promise<WhatsAppBookingResult> {
  const sbTyped = sb as unknown as {
    from: (
      t: string,
    ) => ReturnType<ReturnType<(typeof import("@supabase/supabase-js"))["createClient"]>["from"]>;
  };
  const phone = normalizePhone(patientPhone);

  // Find the patient's upcoming confirmed booking
  const today = new Date().toISOString().slice(0, 10);
  const { data: booking } = (await sbTyped
    .from("clinic_bookings")
    .select("id, patient_name, fecha, hora")
    .eq("clinic_id", clinicId)
    .eq("patient_phone", phone)
    .in("status", ["confirmed", "pending", "notified"])
    .gte("fecha", today)
    .order("fecha", { ascending: true })
    .limit(1)
    .single()) as { data: Record<string, unknown> | null };

  if (!booking) {
    return {
      handled: true,
      action: "unknown",
      message: "No encontramos un turno próximo para cancelar.",
    };
  }

  await sbTyped
    .from("clinic_bookings")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
      cancel_reason: "Cancelado por paciente via WhatsApp",
    })
    .eq("id", booking.id);

  return {
    handled: true,
    action: "cancelled",
    bookingId: booking.id as string,
    message: `Tu turno del ${booking.fecha} a las ${booking.hora} fue cancelado.`,
  };
}

// ─── Utils ───────────────────────────────────────────────────

function normalizePhone(raw: string): string {
  return raw.replace(/^whatsapp:/, "").replace(/\D/g, "");
}

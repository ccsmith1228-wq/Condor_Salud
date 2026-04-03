// ─── Clinic Notification Service ─────────────────────────────
// Orchestrates email + WhatsApp notifications for the full
// appointment lifecycle: booked → notified → confirmed/cancelled.
//
// Integrates with existing email.ts and whatsapp.ts services.

import { sendEmail } from "@/lib/services/email";
import { sendMessage, sendMetaTemplate } from "@/lib/services/whatsapp";
import { isSupabaseConfigured } from "@/lib/env";
import { createClientLogger } from "@/lib/logger";

const log = createClientLogger("clinic-notifications");

// ─── Types ───────────────────────────────────────────────────

export interface BookingNotifyInput {
  bookingId: string;
  clinicId?: string;
  clinicName: string;
  clinicEmail?: string;
  clinicAddress?: string;
  clinicPhone: string | null;
  doctorName: string;
  patientName: string;
  patientEmail: string | null;
  patientPhone: string | null;
  patientLanguage: string;
  fecha: string;
  hora: string;
  specialty: string | null;
  tipo: string;
}

export interface NotifyResult {
  emailSent: boolean;
  whatsappSent: boolean;
  emailId?: string;
  whatsappSid?: string;
  errors: string[];
}

// ─── Brand Constants ─────────────────────────────────────────

const BRAND_CELESTE = "#75AADB";
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://condorsalud.com";

// ─── Notify Clinic of New Booking ────────────────────────────

export async function notifyClinicNewBooking(input: BookingNotifyInput): Promise<NotifyResult> {
  const result: NotifyResult = { emailSent: false, whatsappSent: false, errors: [] };
  const supabase = isSupabaseConfigured() ? await getServiceSupabase() : null;

  const dateFormatted = new Date(input.fecha).toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  // 1. Email to clinic
  try {
    const emailResult = await sendEmail({
      to: input.clinicEmail || "",
      subject: `Nuevo turno: ${input.patientName} — ${input.hora} ${dateFormatted}`,
      html: buildClinicBookingEmailHtml({
        ...input,
        dateFormatted,
        dashboardUrl: `${BASE_URL}/dashboard/agenda`,
      }),
      tags: [{ name: "type", value: "clinic_new_booking" }],
    });
    result.emailSent = emailResult.success;
    result.emailId = emailResult.id;
    if (!emailResult.success && emailResult.error) {
      result.errors.push(`Email: ${emailResult.error}`);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Email send failed";
    result.errors.push(`Email: ${msg}`);
    log.error({ err: msg }, "Failed to email clinic");
  }

  // 2. WhatsApp to clinic
  if (input.clinicPhone) {
    try {
      const waBody =
        `🔔 *Nuevo turno — Cóndor Salud*\n\n` +
        `👤 *Paciente:* ${input.patientName}\n` +
        `🩺 *Doctor:* ${input.doctorName}\n` +
        `📅 *Fecha:* ${dateFormatted}\n` +
        `🕐 *Hora:* ${input.hora}\n` +
        `📋 *Tipo:* ${input.tipo === "teleconsulta" ? "Teleconsulta" : "Presencial"}\n` +
        (input.patientPhone ? `📱 *Tel paciente:* ${input.patientPhone}\n` : "") +
        `🌐 *Idioma:* ${input.patientLanguage === "en" ? "Inglés 🇺🇸" : "Español"}\n` +
        `\n` +
        `Responder *CONFIRMAR* o *RECHAZAR*`;

      const waResult = await sendMessage({
        to: input.clinicPhone,
        body: waBody,
        clinicId: input.clinicId || "",
      });
      result.whatsappSent = waResult.success;
      result.whatsappSid = waResult.twilioSid;
      if (!waResult.success && waResult.error) {
        result.errors.push(`WhatsApp: ${waResult.error}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "WhatsApp send failed";
      result.errors.push(`WhatsApp: ${msg}`);
      log.error({ err: msg }, "Failed to WhatsApp clinic");
    }
  }

  // 3. Log notification in DB
  if (supabase) {
    const notifications = [];
    if (result.emailSent) {
      notifications.push({
        booking_id: input.bookingId,
        channel: "email",
        recipient_type: "clinic",
        recipient_contact: input.clinicEmail,
        template: "clinic_new_booking",
        status: "sent",
        external_id: result.emailId || null,
      });
    }
    if (result.whatsappSent) {
      notifications.push({
        booking_id: input.bookingId,
        channel: "whatsapp",
        recipient_type: "clinic",
        recipient_contact: input.clinicPhone,
        template: "clinic_new_booking_wa",
        status: "sent",
        external_id: result.whatsappSid || null,
      });
    }
    if (notifications.length) {
      await supabase.from("booking_notifications").insert(notifications);
    }

    // Update booking record
    await supabase
      .from("clinic_bookings")
      .update({
        status: "notified",
        clinic_notified_at: new Date().toISOString(),
        clinic_notified_via: [
          result.emailSent ? "email" : null,
          result.whatsappSent ? "whatsapp" : null,
        ]
          .filter(Boolean)
          .join(","),
      })
      .eq("id", input.bookingId);
  }

  log.info(
    { bookingId: input.bookingId, emailSent: result.emailSent, whatsappSent: result.whatsappSent },
    "Clinic notified of new booking",
  );

  return result;
}

// ─── Notify Patient of Confirmation ──────────────────────────

export async function notifyPatientConfirmation(input: BookingNotifyInput): Promise<NotifyResult> {
  const result: NotifyResult = { emailSent: false, whatsappSent: false, errors: [] };
  const supabase = isSupabaseConfigured() ? await getServiceSupabase() : null;

  const dateFormatted = new Date(input.fecha).toLocaleDateString(
    input.patientLanguage === "en" ? "en-US" : "es-AR",
    { weekday: "long", day: "numeric", month: "long" },
  );

  const isEnglish = input.patientLanguage === "en";

  // 1. Email to patient
  if (input.patientEmail) {
    try {
      const emailResult = await sendEmail({
        to: input.patientEmail,
        subject: isEnglish
          ? `Appointment Confirmed — ${input.hora} ${dateFormatted}`
          : `Turno Confirmado — ${input.hora} ${dateFormatted}`,
        html: buildPatientConfirmationEmailHtml({
          ...input,
          dateFormatted,
          isEnglish,
        }),
        tags: [{ name: "type", value: "patient_booking_confirmed" }],
      });
      result.emailSent = emailResult.success;
      result.emailId = emailResult.id;
    } catch (err) {
      result.errors.push(`Email: ${err instanceof Error ? err.message : "Failed"}`);
    }
  }

  // 2. WhatsApp to patient
  if (input.patientPhone) {
    try {
      const body = isEnglish
        ? `✅ *Appointment Confirmed*\n\n` +
          `Doctor: ${input.doctorName}\n` +
          `Date: ${dateFormatted}\n` +
          `Time: ${input.hora}\n` +
          `Clinic: ${input.clinicName}\n\n` +
          `Reply CANCEL to cancel.`
        : `✅ *Turno Confirmado*\n\n` +
          `Doctor: ${input.doctorName}\n` +
          `Fecha: ${dateFormatted}\n` +
          `Hora: ${input.hora}\n` +
          `Clínica: ${input.clinicName}\n\n` +
          `Responder CANCELAR para cancelar.`;

      const waResult = await sendMessage({
        to: input.patientPhone,
        body,
        clinicId: input.clinicId || "",
      });
      result.whatsappSent = waResult.success;
      result.whatsappSid = waResult.twilioSid;
    } catch (err) {
      result.errors.push(`WhatsApp: ${err instanceof Error ? err.message : "Failed"}`);
    }
  }

  // 3. Log
  if (supabase) {
    const notifications = [];
    if (result.emailSent) {
      notifications.push({
        booking_id: input.bookingId,
        channel: "email",
        recipient_type: "patient",
        recipient_contact: input.patientEmail,
        template: "patient_booking_confirmed",
        status: "sent",
        external_id: result.emailId || null,
      });
    }
    if (result.whatsappSent) {
      notifications.push({
        booking_id: input.bookingId,
        channel: "whatsapp",
        recipient_type: "patient",
        recipient_contact: input.patientPhone,
        template: "patient_booking_confirmed_wa",
        status: "sent",
        external_id: result.whatsappSid || null,
      });
    }
    if (notifications.length) {
      await supabase.from("booking_notifications").insert(notifications);
    }

    await supabase
      .from("clinic_bookings")
      .update({
        status: "confirmed",
        confirmed_at: new Date().toISOString(),
        patient_notified_at: new Date().toISOString(),
      })
      .eq("id", input.bookingId);
  }

  return result;
}

// ─── Notify Patient of Cancellation ──────────────────────────

export async function notifyPatientCancellation(
  input: BookingNotifyInput & { reason?: string },
): Promise<NotifyResult> {
  const result: NotifyResult = { emailSent: false, whatsappSent: false, errors: [] };
  const supabase = isSupabaseConfigured() ? await getServiceSupabase() : null;
  const isEnglish = input.patientLanguage === "en";

  const dateFormatted = new Date(input.fecha).toLocaleDateString(isEnglish ? "en-US" : "es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  // WhatsApp to patient
  if (input.patientPhone) {
    try {
      const body = isEnglish
        ? `❌ *Appointment Cancelled*\n\n` +
          `Your appointment with Dr. ${input.doctorName} on ${dateFormatted} at ${input.hora} has been cancelled.\n` +
          (input.reason ? `Reason: ${input.reason}\n\n` : "\n") +
          `Please book a new appointment at ${BASE_URL}/reservar`
        : `❌ *Turno Cancelado*\n\n` +
          `Tu turno con Dr. ${input.doctorName} del ${dateFormatted} a las ${input.hora} fue cancelado.\n` +
          (input.reason ? `Motivo: ${input.reason}\n\n` : "\n") +
          `Podés reservar un nuevo turno en ${BASE_URL}/reservar`;

      const waResult = await sendMessage({
        to: input.patientPhone,
        body,
        clinicId: input.clinicId || "",
      });
      result.whatsappSent = waResult.success;
    } catch {
      result.errors.push("WhatsApp cancellation failed");
    }
  }

  // Email to patient
  if (input.patientEmail) {
    try {
      const emailResult = await sendEmail({
        to: input.patientEmail,
        subject: isEnglish
          ? `Appointment Cancelled — ${dateFormatted}`
          : `Turno Cancelado — ${dateFormatted}`,
        html: buildPatientCancellationEmailHtml({
          ...input,
          dateFormatted,
          isEnglish,
        }),
        tags: [{ name: "type", value: "patient_booking_cancelled" }],
      });
      result.emailSent = emailResult.success;
    } catch {
      result.errors.push("Email cancellation failed");
    }
  }

  if (supabase) {
    await supabase
      .from("clinic_bookings")
      .update({
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
        cancel_reason: input.reason || null,
      })
      .eq("id", input.bookingId);
  }

  return result;
}

// ─── Send Reminder (24h before) ──────────────────────────────

export async function sendBookingReminder(
  input: BookingNotifyInput & { templateName?: string },
): Promise<NotifyResult> {
  const result: NotifyResult = { emailSent: false, whatsappSent: false, errors: [] };
  const isEnglish = input.patientLanguage === "en";

  const dateFormatted = new Date(input.fecha).toLocaleDateString(isEnglish ? "en-US" : "es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  if (input.patientPhone) {
    // Try Meta template first (required for proactive messages outside 24h window)
    const tplName = input.templateName || "reminder-24h";
    try {
      const tplResult = await sendMetaTemplate({
        to: input.patientPhone,
        templateName: tplName,
        variables: {
          "1": input.patientName,
          "2": `Dr. ${input.doctorName}`,
          "3": dateFormatted,
          "4": input.hora,
          "5": input.clinicName,
        },
        clinicId: input.clinicId || "",
        language: isEnglish ? "en_US" : "es_AR",
      });
      result.whatsappSent = tplResult.success;

      // Fall back to free-form if template fails (e.g. Meta not configured)
      if (!tplResult.success) {
        log.warn(
          { tpl: tplName, err: tplResult.error },
          "Template send failed — falling back to free-form",
        );
        const body = isEnglish
          ? `⏰ *Reminder: Appointment Tomorrow*\n\nDr. ${input.doctorName}\n${dateFormatted} at ${input.hora}\n${input.clinicName}\n\nReply CANCEL to cancel.`
          : `⏰ *Recordatorio: Turno Mañana*\n\nDr. ${input.doctorName}\n${dateFormatted} a las ${input.hora}\n${input.clinicName}\n\nResponder CANCELAR para cancelar.`;
        const waResult = await sendMessage({
          to: input.patientPhone,
          body,
          clinicId: input.clinicId || "",
        });
        result.whatsappSent = waResult.success;
      }
    } catch {
      result.errors.push("Reminder WhatsApp failed");
    }
  }

  if (input.patientEmail) {
    try {
      const emailResult = await sendEmail({
        to: input.patientEmail,
        subject: isEnglish
          ? `Reminder: Appointment tomorrow at ${input.hora}`
          : `Recordatorio: Turno mañana a las ${input.hora}`,
        html: buildReminderEmailHtml({
          ...input,
          dateFormatted,
          isEnglish,
        }),
        tags: [{ name: "type", value: "booking_reminder" }],
      });
      result.emailSent = emailResult.success;
    } catch {
      result.errors.push("Reminder email failed");
    }
  }

  return result;
}

// ─── HTML Email Builders ─────────────────────────────────────

function emailWrapper(title: string, body: string): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><title>${title}</title></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f8fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:40px auto;background:white;border-radius:8px;border:1px solid #d4e4f0;overflow:hidden;">
    <tr><td style="background:${BRAND_CELESTE};padding:24px 32px;">
      <h1 style="margin:0;color:white;font-size:20px;font-weight:700;">Cóndor Salud</h1>
    </td></tr>
    <tr><td style="padding:32px;">${body}</td></tr>
    <tr><td style="padding:16px 32px;background:#f8fafb;border-top:1px solid #d4e4f0;">
      <p style="margin:0;font-size:11px;color:#999;">© ${new Date().getFullYear()} Cóndor Salud · condorsalud.com</p>
    </td></tr>
  </table>
</body>
</html>`.trim();
}

function buildClinicBookingEmailHtml(
  opts: BookingNotifyInput & { dateFormatted: string; dashboardUrl: string },
): string {
  return emailWrapper(
    "Nuevo Turno",
    `
    <h2 style="margin:0 0 16px;font-size:18px;color:#1a1a1a;">🔔 Nuevo turno recibido</h2>
    <table style="margin:16px 0;font-size:14px;width:100%;" cellpadding="6" cellspacing="0">
      <tr><td style="color:#999;font-weight:600;width:120px;">Paciente</td><td style="color:#1a1a1a;font-weight:700;">${opts.patientName}</td></tr>
      <tr><td style="color:#999;font-weight:600;">Doctor</td><td style="color:#1a1a1a;">${opts.doctorName}</td></tr>
      <tr><td style="color:#999;font-weight:600;">Fecha</td><td style="color:#1a1a1a;font-weight:700;">${opts.dateFormatted}</td></tr>
      <tr><td style="color:#999;font-weight:600;">Hora</td><td style="color:#1a1a1a;font-weight:700;">${opts.hora}</td></tr>
      <tr><td style="color:#999;font-weight:600;">Tipo</td><td style="color:#1a1a1a;">${opts.tipo === "teleconsulta" ? "Teleconsulta" : "Presencial"}</td></tr>
      ${opts.patientPhone ? `<tr><td style="color:#999;font-weight:600;">Teléfono</td><td style="color:#1a1a1a;">${opts.patientPhone}</td></tr>` : ""}
      ${opts.patientEmail ? `<tr><td style="color:#999;font-weight:600;">Email</td><td style="color:#1a1a1a;">${opts.patientEmail}</td></tr>` : ""}
      <tr><td style="color:#999;font-weight:600;">Idioma</td><td style="color:#1a1a1a;">${opts.patientLanguage === "en" ? "Inglés 🇺🇸" : "Español"}</td></tr>
    </table>
    <a href="${opts.dashboardUrl}" style="display:inline-block;margin-top:16px;padding:12px 28px;background:${BRAND_CELESTE};color:white;font-weight:700;font-size:14px;border-radius:6px;text-decoration:none;">Ver en el dashboard →</a>
    `,
  );
}

function buildPatientConfirmationEmailHtml(
  opts: BookingNotifyInput & { dateFormatted: string; isEnglish: boolean },
): string {
  const { isEnglish: en } = opts;
  return emailWrapper(
    en ? "Appointment Confirmed" : "Turno Confirmado",
    `
    <h2 style="margin:0 0 16px;font-size:18px;color:#1a1a1a;">
      ${en ? "✅ Your appointment is confirmed" : "✅ Tu turno está confirmado"}
    </h2>
    <p style="margin:0 0 8px;color:#555;font-size:14px;">
      ${en ? `Hi ${opts.patientName},` : `Hola ${opts.patientName},`}
    </p>
    <table style="margin:16px 0;font-size:14px;" cellpadding="6" cellspacing="0">
      <tr><td style="color:#999;font-weight:600;">${en ? "Doctor" : "Doctor"}</td><td style="color:#1a1a1a;font-weight:700;">${opts.doctorName}</td></tr>
      <tr><td style="color:#999;font-weight:600;">${en ? "Date" : "Fecha"}</td><td style="color:#1a1a1a;font-weight:700;">${opts.dateFormatted}</td></tr>
      <tr><td style="color:#999;font-weight:600;">${en ? "Time" : "Hora"}</td><td style="color:#1a1a1a;font-weight:700;">${opts.hora}</td></tr>
      <tr><td style="color:#999;font-weight:600;">${en ? "Clinic" : "Clínica"}</td><td style="color:#1a1a1a;">${opts.clinicName}</td></tr>
      <tr><td style="color:#999;font-weight:600;">${en ? "Type" : "Tipo"}</td><td style="color:#1a1a1a;">${opts.tipo === "teleconsulta" ? (en ? "Telemedicine" : "Teleconsulta") : en ? "In-person" : "Presencial"}</td></tr>
    </table>
    <p style="margin:16px 0 0;color:#555;font-size:13px;">
      ${en ? "Need to cancel? Reply to this email or visit" : "¿Necesitás cancelar? Respondé este email o ingresá a"}
      <a href="${BASE_URL}/paciente/turnos" style="color:${BRAND_CELESTE};">${en ? "your portal" : "tu portal"}</a>.
    </p>
    `,
  );
}

function buildPatientCancellationEmailHtml(
  opts: BookingNotifyInput & { dateFormatted: string; isEnglish: boolean; reason?: string },
): string {
  const { isEnglish: en } = opts;
  return emailWrapper(
    en ? "Appointment Cancelled" : "Turno Cancelado",
    `
    <h2 style="margin:0 0 16px;font-size:18px;color:#1a1a1a;">
      ${en ? "❌ Appointment cancelled" : "❌ Turno cancelado"}
    </h2>
    <p style="margin:0 0 8px;color:#555;font-size:14px;">
      ${en ? `Hi ${opts.patientName},` : `Hola ${opts.patientName},`}
    </p>
    <p style="margin:0 0 16px;color:#555;font-size:14px;">
      ${en ? `Your appointment with Dr. ${opts.doctorName} on ${opts.dateFormatted} at ${opts.hora} has been cancelled.` : `Tu turno con Dr. ${opts.doctorName} del ${opts.dateFormatted} a las ${opts.hora} fue cancelado.`}
    </p>
    ${opts.reason ? `<p style="margin:0 0 16px;color:#999;font-size:13px;">${en ? "Reason" : "Motivo"}: ${opts.reason}</p>` : ""}
    <a href="${BASE_URL}/reservar" style="display:inline-block;padding:12px 28px;background:${BRAND_CELESTE};color:white;font-weight:700;font-size:14px;border-radius:6px;text-decoration:none;">
      ${en ? "Book a new appointment" : "Reservar nuevo turno"} →
    </a>
    `,
  );
}

function buildReminderEmailHtml(
  opts: BookingNotifyInput & { dateFormatted: string; isEnglish: boolean },
): string {
  const { isEnglish: en } = opts;
  return emailWrapper(
    en ? "Appointment Reminder" : "Recordatorio de Turno",
    `
    <h2 style="margin:0 0 16px;font-size:18px;color:#1a1a1a;">
      ${en ? "⏰ Appointment tomorrow" : "⏰ Tu turno es mañana"}
    </h2>
    <p style="margin:0 0 8px;color:#555;font-size:14px;">
      ${en ? `Hi ${opts.patientName},` : `Hola ${opts.patientName},`}
    </p>
    <table style="margin:16px 0;font-size:14px;" cellpadding="6" cellspacing="0">
      <tr><td style="color:#999;font-weight:600;">${en ? "Doctor" : "Doctor"}</td><td style="color:#1a1a1a;font-weight:700;">${opts.doctorName}</td></tr>
      <tr><td style="color:#999;font-weight:600;">${en ? "Date" : "Fecha"}</td><td style="color:#1a1a1a;font-weight:700;">${opts.dateFormatted}</td></tr>
      <tr><td style="color:#999;font-weight:600;">${en ? "Time" : "Hora"}</td><td style="color:#1a1a1a;font-weight:700;">${opts.hora}</td></tr>
      <tr><td style="color:#999;font-weight:600;">${en ? "Clinic" : "Clínica"}</td><td style="color:#1a1a1a;">${opts.clinicName}</td></tr>
    </table>
    <p style="margin:16px 0 0;color:#555;font-size:13px;">
      ${en ? "Need to cancel? Reply to this email or visit" : "¿Necesitás cancelar? Respondé este email o ingresá a"}
      <a href="${BASE_URL}/paciente/turnos" style="color:${BRAND_CELESTE};">${en ? "your portal" : "tu portal"}</a>.
    </p>
    `,
  );
}

// ─── Helpers ─────────────────────────────────────────────────

async function getServiceSupabase() {
  const { createClient } = await import("@supabase/supabase-js");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

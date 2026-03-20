// ─── SendGrid Email Service ──────────────────────────────────
// Transactional email via SendGrid dynamic templates.
// Ported from backend/src/services/EmailService.js.
//
// Falls back to the existing Resend-based email service
// (src/lib/services/email.ts) if SendGrid is not configured.

import sgMail from "@sendgrid/mail";
import { logger } from "@/lib/logger";

// ─── Configuration ───────────────────────────────────────────

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || "";
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || "no-reply@condorsalud.com";
const FROM_NAME = process.env.SENDGRID_FROM_NAME || "Cóndor Salud";

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

// ─── Template IDs (dynamic templates in SendGrid) ────────────

const TEMPLATES = {
  BOOKING_CONFIRMATION: process.env.SG_TPL_BOOKING_CONFIRMATION || "",
  BOOKING_REMINDER: process.env.SG_TPL_BOOKING_REMINDER || "",
  BOOKING_CANCELLED: process.env.SG_TPL_BOOKING_CANCELLED || "",
  BOOKING_CONFIRMED: process.env.SG_TPL_BOOKING_CONFIRMED || "",
  WELCOME_PATIENT: process.env.SG_TPL_WELCOME_PATIENT || "",
  WELCOME_DOCTOR: process.env.SG_TPL_WELCOME_DOCTOR || "",
  RESET_PASSWORD: process.env.SG_TPL_RESET_PASSWORD || "",
  NEW_REVIEW: process.env.SG_TPL_NEW_REVIEW || "",
} as const;

// ─── Spanish month names ─────────────────────────────────────

const MONTHS = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

function formatDateES(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return `${d.getDate()} de ${MONTHS[d.getMonth()]} de ${d.getFullYear()}`;
}

// ─── Internal helpers ────────────────────────────────────────

async function sendTemplate(
  to: string,
  templateId: string,
  dynamicData: Record<string, unknown>,
): Promise<boolean> {
  if (!SENDGRID_API_KEY) {
    logger.warn({ to, templateId }, "SendGrid not configured — email not sent");
    return false;
  }

  if (!templateId) {
    logger.warn({ to }, "SendGrid template ID not configured");
    return false;
  }

  try {
    await sgMail.send({
      to,
      from: { email: FROM_EMAIL, name: FROM_NAME },
      templateId,
      dynamicTemplateData: dynamicData,
    });
    logger.info({ to, templateId }, "SendGrid template email sent");
    return true;
  } catch (err) {
    logger.error({ err, to, templateId }, "SendGrid send failed");
    return false;
  }
}

async function sendRaw(to: string, subject: string, html: string): Promise<boolean> {
  if (!SENDGRID_API_KEY) {
    logger.warn({ to, subject }, "SendGrid not configured — raw email not sent");
    return false;
  }

  try {
    await sgMail.send({
      to,
      from: { email: FROM_EMAIL, name: FROM_NAME },
      subject,
      html,
    });
    logger.info({ to, subject }, "SendGrid raw email sent");
    return true;
  } catch (err) {
    logger.error({ err, to, subject }, "SendGrid raw send failed");
    return false;
  }
}

// ─── Public API ──────────────────────────────────────────────

export async function sendBookingConfirmation(booking: {
  patientEmail: string;
  patientName: string;
  doctorName: string;
  specialty: string;
  date: string | Date;
  time: string;
  address: string;
  bookingId: string;
}): Promise<boolean> {
  return sendTemplate(booking.patientEmail, TEMPLATES.BOOKING_CONFIRMATION, {
    patient_name: booking.patientName,
    doctor_name: booking.doctorName,
    specialty: booking.specialty,
    date: formatDateES(booking.date),
    time: booking.time,
    address: booking.address,
    booking_id: booking.bookingId,
  });
}

export async function sendBookingReminder(booking: {
  patientEmail: string;
  patientName: string;
  doctorName: string;
  date: string | Date;
  time: string;
}): Promise<boolean> {
  return sendTemplate(booking.patientEmail, TEMPLATES.BOOKING_REMINDER, {
    patient_name: booking.patientName,
    doctor_name: booking.doctorName,
    date: formatDateES(booking.date),
    time: booking.time,
  });
}

export async function sendBookingCancellation(booking: {
  patientEmail: string;
  patientName: string;
  doctorName: string;
  date: string | Date;
  reason?: string;
}): Promise<boolean> {
  return sendTemplate(booking.patientEmail, TEMPLATES.BOOKING_CANCELLED, {
    patient_name: booking.patientName,
    doctor_name: booking.doctorName,
    date: formatDateES(booking.date),
    reason: booking.reason || "No especificado",
  });
}

export async function sendBookingConfirmedByDoctor(booking: {
  patientEmail: string;
  patientName: string;
  doctorName: string;
  date: string | Date;
  time: string;
  meetLink?: string;
}): Promise<boolean> {
  return sendTemplate(booking.patientEmail, TEMPLATES.BOOKING_CONFIRMED, {
    patient_name: booking.patientName,
    doctor_name: booking.doctorName,
    date: formatDateES(booking.date),
    time: booking.time,
    meet_link: booking.meetLink || "",
  });
}

export async function sendWelcomePatient(patient: {
  email: string;
  name: string;
}): Promise<boolean> {
  return sendTemplate(patient.email, TEMPLATES.WELCOME_PATIENT, {
    patient_name: patient.name,
  });
}

export async function sendWelcomeDoctor(doctor: { email: string; name: string }): Promise<boolean> {
  return sendTemplate(doctor.email, TEMPLATES.WELCOME_DOCTOR, {
    doctor_name: doctor.name,
  });
}

export async function sendPasswordReset(data: {
  email: string;
  name: string;
  resetUrl: string;
}): Promise<boolean> {
  return sendTemplate(data.email, TEMPLATES.RESET_PASSWORD, {
    patient_name: data.name,
    reset_url: data.resetUrl,
  });
}

export async function sendNewReviewNotification(review: {
  doctorEmail: string;
  doctorName: string;
  patientName: string;
  rating: number;
  comment: string;
}): Promise<boolean> {
  return sendTemplate(review.doctorEmail, TEMPLATES.NEW_REVIEW, {
    doctor_name: review.doctorName,
    patient_name: review.patientName,
    rating: review.rating,
    comment: review.comment,
  });
}

export async function sendPaymentReceipt(payment: {
  patientEmail: string;
  patientName: string;
  doctorName: string;
  amount: number;
  currency: string;
  paymentId: string;
  date: string | Date;
}): Promise<boolean> {
  const formattedAmount = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: payment.currency || "ARS",
  }).format(payment.amount / 100); // amount is in centavos

  return sendRaw(
    payment.patientEmail,
    `Recibo de pago — Cóndor Salud`,
    `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Recibo de pago</h2>
      <p>Hola ${payment.patientName},</p>
      <p>Tu pago fue procesado exitosamente.</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Profesional</strong></td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${payment.doctorName}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Monto</strong></td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${formattedAmount}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>ID de pago</strong></td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${payment.paymentId}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Fecha</strong></td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${formatDateES(payment.date)}</td></tr>
      </table>
      <p style="color: #6b7280; font-size: 14px;">Este es un correo automático. No responder.</p>
    </div>
    `,
  );
}

// ─── Availability check ──────────────────────────────────────

export function isSendGridConfigured(): boolean {
  return !!SENDGRID_API_KEY;
}

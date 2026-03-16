// ─── Email Service (Resend) ──────────────────────────────────
// Transactional email service for turno reminders, auth, alerts.
// Uses Resend SDK. Falls back to console logging when no API key.

import { Resend } from "resend";
import { createClientLogger } from "@/lib/logger";

const log = createClientLogger("email");

// ─── Client ──────────────────────────────────────────────────

const RESEND_KEY = process.env.RESEND_API_KEY ?? "";
const resend = RESEND_KEY ? new Resend(RESEND_KEY) : null;

const FROM_ADDRESS = "Cóndor Salud <no-reply@condorsalud.com>";

// ─── Types ───────────────────────────────────────────────────

export interface SendEmailInput {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  tags?: { name: string; value: string }[];
}

export interface EmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

// ─── Send ────────────────────────────────────────────────────

export async function sendEmail(input: SendEmailInput): Promise<EmailResult> {
  if (!resend) {
    log.warn(
      { to: input.to, subject: input.subject },
      "Email not sent — RESEND_API_KEY not configured",
    );
    return { success: false, error: "Email provider not configured" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: Array.isArray(input.to) ? input.to : [input.to],
      subject: input.subject,
      html: input.html,
      text: input.text,
      replyTo: input.replyTo,
      tags: input.tags,
    });

    if (error) {
      log.error({ error, to: input.to }, "Resend API error");
      return { success: false, error: error.message };
    }

    log.info({ id: data?.id, to: input.to, subject: input.subject }, "Email sent");
    return { success: true, id: data?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown email error";
    log.error({ error: message }, "Email send failed");
    return { success: false, error: message };
  }
}

// ─── Pre-built Templates ─────────────────────────────────────

const BRAND_CELESTE = "#75AADB";
const BRAND_GOLD = "#F6B40E";

function wrapHtml(title: string, body: string): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><title>${title}</title></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f8fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:40px auto;background:white;border-radius:8px;border:1px solid #d4e4f0;overflow:hidden;">
    <tr>
      <td style="background:${BRAND_CELESTE};padding:24px 32px;">
        <h1 style="margin:0;color:white;font-size:20px;font-weight:700;">🦅 Cóndor Salud</h1>
      </td>
    </tr>
    <tr>
      <td style="padding:32px;">
        ${body}
      </td>
    </tr>
    <tr>
      <td style="padding:16px 32px;background:#f8fafb;border-top:1px solid #d4e4f0;">
        <p style="margin:0;font-size:11px;color:#999;">© ${new Date().getFullYear()} Cóndor Salud · condorsalud.com</p>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

/**
 * Send a turno reminder email (24h before appointment).
 */
export async function sendTurnoReminder(opts: {
  to: string;
  paciente: string;
  fecha: string;
  hora: string;
  profesional: string;
  tipo: string;
}): Promise<EmailResult> {
  const { to, paciente, fecha, hora, profesional, tipo } = opts;
  return sendEmail({
    to,
    subject: `📅 Recordatorio de turno — ${fecha} ${hora}`,
    html: wrapHtml(
      "Recordatorio de turno",
      `
      <h2 style="margin:0 0 16px;font-size:18px;color:#1a1a1a;">Hola ${paciente},</h2>
      <p style="margin:0 0 8px;color:#555;font-size:14px;">Te recordamos que tenés un turno programado:</p>
      <table style="margin:16px 0;font-size:14px;" cellpadding="4" cellspacing="0">
        <tr><td style="color:#999;font-weight:600;">Fecha</td><td style="color:#1a1a1a;font-weight:700;">${fecha}</td></tr>
        <tr><td style="color:#999;font-weight:600;">Hora</td><td style="color:#1a1a1a;font-weight:700;">${hora}</td></tr>
        <tr><td style="color:#999;font-weight:600;">Profesional</td><td style="color:#1a1a1a;">${profesional}</td></tr>
        <tr><td style="color:#999;font-weight:600;">Tipo</td><td style="color:#1a1a1a;">${tipo}</td></tr>
      </table>
      <p style="margin:16px 0 0;color:#555;font-size:13px;">Si necesitás cancelar o reprogramar, ingresá a <a href="https://condorsalud.com/paciente/turnos" style="color:${BRAND_CELESTE};">tu portal</a>.</p>
      `,
    ),
    tags: [{ name: "type", value: "turno_reminder" }],
  });
}

/**
 * Send an audit alert email to the billing team.
 */
export async function sendAuditAlert(opts: {
  to: string;
  observaciones: number;
  altaSeveridad: number;
  montoRiesgo: string;
}): Promise<EmailResult> {
  const { to, observaciones, altaSeveridad, montoRiesgo } = opts;
  return sendEmail({
    to,
    subject: `⚠️ Auditoría: ${observaciones} observaciones nuevas`,
    html: wrapHtml(
      "Alerta de auditoría",
      `
      <h2 style="margin:0 0 16px;font-size:18px;color:#1a1a1a;">Nuevas observaciones de auditoría</h2>
      <div style="background:#FFF8E1;border:1px solid ${BRAND_GOLD};border-radius:6px;padding:16px;margin:16px 0;">
        <p style="margin:0 0 8px;font-size:24px;font-weight:700;color:#1a1a1a;">${observaciones} observaciones</p>
        <p style="margin:0;font-size:13px;color:#555;">${altaSeveridad} de severidad alta · Monto en riesgo: ${montoRiesgo}</p>
      </div>
      <p style="margin:16px 0 0;font-size:13px;color:#555;">
        <a href="https://condorsalud.com/dashboard/auditoria" style="color:${BRAND_CELESTE};font-weight:600;">Revisar en el dashboard →</a>
      </p>
      `,
    ),
    tags: [{ name: "type", value: "audit_alert" }],
  });
}

/**
 * Send a welcome email after registration.
 */
export async function sendWelcomeEmail(opts: {
  to: string;
  nombre: string;
  clinicName: string;
}): Promise<EmailResult> {
  const { to, nombre, clinicName } = opts;
  return sendEmail({
    to,
    subject: "🦅 Bienvenido a Cóndor Salud",
    html: wrapHtml(
      "Bienvenido",
      `
      <h2 style="margin:0 0 16px;font-size:18px;color:#1a1a1a;">¡Hola ${nombre}!</h2>
      <p style="margin:0 0 12px;color:#555;font-size:14px;">Tu cuenta para <strong>${clinicName}</strong> está lista.</p>
      <p style="margin:0 0 20px;color:#555;font-size:14px;">Con Cóndor Salud podés gestionar turnos, facturación, auditoría y mucho más desde un solo lugar.</p>
      <a href="https://condorsalud.com/dashboard" style="display:inline-block;padding:12px 28px;background:${BRAND_CELESTE};color:white;font-weight:700;font-size:14px;border-radius:6px;text-decoration:none;">Ingresar al dashboard</a>
      `,
    ),
    tags: [{ name: "type", value: "welcome" }],
  });
}

export function isEmailConfigured(): boolean {
  return !!resend;
}

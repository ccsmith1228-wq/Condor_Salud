// ─── Signup Notification Webhook ─────────────────────────────
// Called after a successful registration to notify the admin.
// Sends an email via Resend and logs the event.

import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

const ADMIN_EMAIL = "admin@condorsalud.com.ar";
const ADMIN_WA = "5491155140371";

export async function POST(req: NextRequest) {
  try {
    const { name, email, clinicName, cuit, provincia, especialidad } = await req.json();

    const timestamp = new Date().toLocaleString("es-AR", {
      timeZone: "America/Argentina/Buenos_Aires",
    });

    // ── Log the signup ──
    logger.info({ name, email, clinicName, cuit, provincia }, "New signup");

    // ── Send email via Resend ──
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Cóndor Salud <notificaciones@condorsalud.com.ar>",
            to: [ADMIN_EMAIL],
            subject: `🆕 Nuevo registro: ${clinicName || name}`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px;">
                <h2 style="color: #75AADB;">Nuevo registro en Cóndor Salud</h2>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr><td style="padding: 8px; font-weight: bold;">Nombre</td><td style="padding: 8px;">${name}</td></tr>
                  <tr style="background: #f9f9f9;"><td style="padding: 8px; font-weight: bold;">Email</td><td style="padding: 8px;">${email}</td></tr>
                  <tr><td style="padding: 8px; font-weight: bold;">Clínica</td><td style="padding: 8px;">${clinicName || "—"}</td></tr>
                  <tr style="background: #f9f9f9;"><td style="padding: 8px; font-weight: bold;">CUIT</td><td style="padding: 8px;">${cuit || "—"}</td></tr>
                  <tr><td style="padding: 8px; font-weight: bold;">Provincia</td><td style="padding: 8px;">${provincia || "—"}</td></tr>
                  <tr style="background: #f9f9f9;"><td style="padding: 8px; font-weight: bold;">Especialidad</td><td style="padding: 8px;">${especialidad || "—"}</td></tr>
                  <tr><td style="padding: 8px; font-weight: bold;">Fecha</td><td style="padding: 8px;">${timestamp}</td></tr>
                </table>
                <p style="color: #888; margin-top: 20px; font-size: 12px;">
                  Este email fue enviado automáticamente por el sistema de Cóndor Salud.
                </p>
              </div>
            `,
          }),
        });
      } catch (emailErr) {
        logger.error({ err: emailErr }, "Failed to send signup notification email");
      }
    }

    // ── Send WhatsApp notification ──
    const waMessage = encodeURIComponent(
      `🆕 *Nuevo registro en Cóndor Salud*\n\n` +
        `👤 ${name}\n` +
        `📧 ${email}\n` +
        `🏥 ${clinicName || "—"}\n` +
        `📍 ${provincia || "—"}\n` +
        `🕐 ${timestamp}`,
    );
    // Log the WhatsApp deep link (can be used with Twilio later)
    logger.info(
      { waLink: `https://wa.me/${ADMIN_WA}?text=${waMessage}` },
      "Signup WA notification",
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error({ err }, "Signup notification error");
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

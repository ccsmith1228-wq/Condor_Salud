// ─── POST /api/partners ──────────────────────────────────────
// Receives partner application form submissions from /partnerships page.
// Persists to Supabase (partner_applications table) when configured;
// always logs and notifies admin via email.

import { NextRequest, NextResponse } from "next/server";
import { type SupabaseClient } from "@supabase/supabase-js";
import { checkRateLimit, sanitizeBody, logger } from "@/lib/security/api-guard";
import { isSupabaseConfigured } from "@/lib/env";
import { partnerSchema } from "@/lib/validations/schemas";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  // ── Rate limit: 3 req / 60s per IP ──
  const limited = checkRateLimit(request, "partners", { limit: 3, windowSec: 60 });
  if (limited) return limited;

  try {
    const raw = await request.json();

    // ── Zod validation ──
    const parsed = partnerSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const company = data.company;
    const name = data.name;
    const email = data.email;
    const type = data.type;
    const volume = data.volume;
    const message = data.message || "";

    // ── Persist to Supabase if configured ──
    if (isSupabaseConfigured()) {
      try {
        const { createClient } = await import("@/lib/supabase/server");
        const supabase = createClient() as unknown as SupabaseClient;
        const { error: dbError } = await supabase.from("partner_applications").insert({
          company,
          contact_name: name,
          email,
          company_type: type,
          monthly_volume: volume,
          message: message || null,
          status: "new",
        });

        if (dbError) {
          logger.error({ err: dbError, route: "partners" }, "Supabase partner insert failed");
        } else {
          logger.info({ route: "partners", company }, "Partner application persisted");
        }
      } catch (err) {
        logger.error({ err, route: "partners" }, "Supabase partner error");
      }
    } else {
      // Structured log fallback
      logger.info(
        { company, name, email, type, volume, route: "partners", action: "application" },
        "Partner application received (logged, no DB configured)",
      );
    }

    // ── Notify admin via email ──
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      const ts = new Date().toLocaleString("es-AR", {
        timeZone: "America/Argentina/Buenos_Aires",
      });
      const volumeLabels: Record<string, string> = {
        lt50: "< 50",
        "50-200": "50–200",
        "200-500": "200–500",
        "500-2000": "500–2,000",
        gt2000: "2,000+",
      };
      const typeLabels: Record<string, string> = {
        agencia: "Agencia de viajes",
        aerolinea: "Aerolínea",
        ota: "OTA / Plataforma",
        dmc: "DMC / Receptivo",
        otro: "Otro",
      };

      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "Cóndor Salud <notificaciones@condorsalud.com.ar>",
          to: ["partnerships@condorsalud.com.ar", "admin@condorsalud.com.ar"],
          subject: `🤝 Nueva aplicación de partner: ${company}`,
          html: `
            <h2>Nueva aplicación de partner</h2>
            <table style="border-collapse:collapse">
              <tr><td style="padding:4px 12px 4px 0;font-weight:bold">Empresa</td><td>${company}</td></tr>
              <tr><td style="padding:4px 12px 4px 0;font-weight:bold">Contacto</td><td>${name}</td></tr>
              <tr><td style="padding:4px 12px 4px 0;font-weight:bold">Email</td><td>${email}</td></tr>
              <tr><td style="padding:4px 12px 4px 0;font-weight:bold">Tipo</td><td>${typeLabels[type] || type}</td></tr>
              <tr><td style="padding:4px 12px 4px 0;font-weight:bold">Viajeros/mes</td><td>${volumeLabels[volume] || volume}</td></tr>
              ${message ? `<tr><td style="padding:4px 12px 4px 0;font-weight:bold">Mensaje</td><td>${message}</td></tr>` : ""}
            </table>
            <p style="margin-top:12px;color:#888;font-size:12px">Recibido el ${ts}</p>
          `,
        }),
      }).catch(() => {});
    }

    return NextResponse.json(
      { message: "¡Solicitud recibida! Te contactamos en 24hs." },
      { status: 201 },
    );
  } catch (err) {
    logger.error({ err, route: "partners" }, "Partner application error");
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

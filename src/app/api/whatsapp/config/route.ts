/**
 * WhatsApp Config API
 *
 * GET  /api/whatsapp/config — Read the clinic's WhatsApp settings + templates
 * PUT  /api/whatsapp/config — Upsert config + templates
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { checkRateLimit, sanitizeBody, logger } from "@/lib/security/api-guard";
import { requireAuth } from "@/lib/security/require-auth";

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase service config");
  return createClient(url, key);
}

// ─── GET ─────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth.error) return auth.error;

  const limited = checkRateLimit(req, "wa-config-read", { limit: 30, windowSec: 60 });
  if (limited) return limited;

  try {
    const { clinicId } = auth.user;
    if (!clinicId) {
      return NextResponse.json({ error: "No clinic associated" }, { status: 400 });
    }

    const supabase = getServiceClient();

    // Fetch config
    const { data: config, error: cfgErr } = await supabase
      .from("whatsapp_config")
      .select("*")
      .eq("clinic_id", clinicId)
      .maybeSingle();

    if (cfgErr) {
      logger.error({ err: cfgErr, route: "whatsapp/config" }, "Failed to fetch config");
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    // Fetch templates
    const { data: templates, error: tplErr } = await supabase
      .from("whatsapp_templates")
      .select("*")
      .eq("clinic_id", clinicId)
      .order("created_at", { ascending: true });

    if (tplErr) {
      logger.error({ err: tplErr, route: "whatsapp/config" }, "Failed to fetch templates");
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    return NextResponse.json({
      config: config || null,
      templates: templates || [],
    });
  } catch (err) {
    logger.error({ err, route: "whatsapp/config" }, "Unexpected error");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── PUT ─────────────────────────────────────────────────────

export async function PUT(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth.error) return auth.error;

  const limited = checkRateLimit(req, "wa-config-write", { limit: 10, windowSec: 60 });
  if (limited) return limited;

  try {
    const { clinicId } = auth.user;
    if (!clinicId) {
      return NextResponse.json({ error: "No clinic associated" }, { status: 400 });
    }

    const rawBody = await req.json();
    const body = sanitizeBody(rawBody);
    const supabase = getServiceClient();

    // ── Upsert config ────────────────────────────────────
    if (body.config) {
      const cfg = body.config;
      const row = {
        clinic_id: clinicId,
        whatsapp_number: cfg.whatsapp_number ?? "",
        display_name: cfg.display_name ?? "",
        welcome_message: cfg.welcome_message ?? null,
        auto_reply: cfg.auto_reply ?? true,
        business_hours: cfg.business_hours ?? "08:00-20:00",
        out_of_hours_message: cfg.out_of_hours_message ?? null,
        notify_on_new_lead: cfg.notify_on_new_lead ?? true,
        // Don't overwrite Twilio creds if not provided
        ...(cfg.twilio_sid !== undefined ? { twilio_sid: cfg.twilio_sid } : {}),
        ...(cfg.twilio_token !== undefined ? { twilio_token: cfg.twilio_token } : {}),
      };

      const { error: upsertErr } = await supabase
        .from("whatsapp_config")
        .upsert(row, { onConflict: "clinic_id" });

      if (upsertErr) {
        logger.error({ err: upsertErr, route: "whatsapp/config" }, "Failed to upsert config");
        return NextResponse.json({ error: "Failed to save config" }, { status: 500 });
      }
    }

    // ── Upsert templates ─────────────────────────────────
    if (body.templates && Array.isArray(body.templates)) {
      for (const tpl of body.templates) {
        const row = {
          clinic_id: clinicId,
          name: tpl.name,
          category: tpl.category ?? "utility",
          language: tpl.language ?? "es_AR",
          body_template: tpl.body_template,
          variables: tpl.variables ?? [],
          header_text: tpl.header_text ?? null,
          footer_text: tpl.footer_text ?? null,
          active: tpl.active ?? true,
        };

        const { error: tplErr } = await supabase
          .from("whatsapp_templates")
          .upsert(row, { onConflict: "clinic_id,name" });

        if (tplErr) {
          logger.error(
            { err: tplErr, template: tpl.name, route: "whatsapp/config" },
            "Failed to upsert template",
          );
          // Continue with remaining templates
        }
      }
    }

    // Return the updated state
    const { data: config } = await supabase
      .from("whatsapp_config")
      .select("*")
      .eq("clinic_id", clinicId)
      .maybeSingle();

    const { data: templates } = await supabase
      .from("whatsapp_templates")
      .select("*")
      .eq("clinic_id", clinicId)
      .order("created_at", { ascending: true });

    return NextResponse.json({
      config: config || null,
      templates: templates || [],
    });
  } catch (err) {
    logger.error({ err, route: "whatsapp/config" }, "Unexpected error");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

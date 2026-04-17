/**
 * Cóndor Salud — WhatsApp Webhook (Meta Cloud API + Twilio)
 *
 * POST /api/webhooks/whatsapp
 *   Receives inbound WhatsApp messages from either:
 *   - Meta Cloud API (JSON, object="whatsapp_business_account")
 *   - Twilio (form-encoded, with X-Twilio-Signature)
 *
 * GET /api/webhooks/whatsapp
 *   Meta webhook verification handshake (hub.challenge).
 *
 * This route is PUBLIC (added to middleware bypass) because
 * neither Meta nor Twilio can carry session cookies.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  processIncomingMessage,
  processMetaWebhook,
  getMetaVerifyToken,
  getActiveProvider,
  type IncomingMessage,
  type MetaWebhookPayload,
} from "@/lib/services/whatsapp";
import { handleBookingReply } from "@/lib/services/whatsapp-booking-confirm";
import { handleBookingFlow } from "@/lib/services/whatsapp-booking-flow";
import { sendMessage } from "@/lib/services/whatsapp";
import { logger } from "@/lib/logger";

const log = logger.child({ route: "webhooks/whatsapp" });

// ─── Twilio Signature Validation ─────────────────────────────

async function validateTwilioSignature(
  req: NextRequest,
  params: Record<string, string>,
): Promise<boolean> {
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  // In development without Twilio, skip validation
  if (!authToken) {
    log.warn("TWILIO_AUTH_TOKEN not set — skipping signature validation (dev mode)");
    return true;
  }

  const signature = req.headers.get("x-twilio-signature");
  if (!signature) {
    log.warn("Missing X-Twilio-Signature header");
    return false;
  }

  try {
    const twilio = await import("twilio");
    // Build the full URL that Twilio used to generate the signature
    const url = req.url;
    return twilio.validateRequest(authToken, signature, url, params);
  } catch (err) {
    log.error({ err }, "Twilio signature validation failed");
    return false;
  }
}

// ─── Detect Request Format ───────────────────────────────────

function isMetaWebhook(req: NextRequest): boolean {
  const contentType = req.headers.get("content-type") || "";
  // Meta sends application/json; Twilio sends application/x-www-form-urlencoded
  return contentType.includes("application/json");
}

// ─── POST Handler ────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    // ── Route to Meta or Twilio handler based on Content-Type ──
    if (isMetaWebhook(req)) {
      return await handleMetaPost(req);
    }
    return await handleTwilioPost(req);
  } catch (err) {
    log.error({ err }, "WhatsApp webhook error");
    return NextResponse.json({ status: "error" }, { status: 200 });
  }
}

// ─── Meta Cloud API POST Handler ─────────────────────────────

async function handleMetaPost(req: NextRequest) {
  const body = await req.json();

  // Validate this is a WhatsApp webhook
  if (body.object !== "whatsapp_business_account") {
    log.warn({ object: body.object }, "Unexpected Meta webhook object type");
    return NextResponse.json({ error: "Not a WhatsApp webhook" }, { status: 400 });
  }

  const payload = body as MetaWebhookPayload;

  log.info(
    {
      entries: payload.entry?.length,
      provider: "meta",
    },
    "Meta WhatsApp webhook received",
  );

  // ── Intercept booking confirmation keywords ──────────────
  // Check each message for booking-related keywords before CRM
  for (const entry of payload.entry) {
    for (const change of entry.changes) {
      if (change.field !== "messages" || !change.value.messages) continue;
      for (const msg of change.value.messages) {
        if (msg.type !== "text" || !msg.text?.body) continue;
        try {
          const fromPhone = `+${msg.from}`;
          const bookingHandled = await handleBookingReply(fromPhone, msg.text.body);
          if (bookingHandled) {
            log.info(
              { from: msg.from, body: msg.text.body },
              "Meta message handled as booking reply",
            );
            // Don't return yet — other messages in the batch may need CRM processing
          }
        } catch (bookingErr) {
          log.warn({ err: bookingErr }, "Booking reply handler error — falling through to CRM");
        }
      }
    }
  }

  // ── Intercept booking flow (appointment scheduling via WhatsApp) ──
  for (const entry of payload.entry) {
    for (const change of entry.changes) {
      if (change.field !== "messages" || !change.value.messages) continue;
      const toPhone = change.value.metadata?.display_phone_number;
      for (const msg of change.value.messages) {
        if (msg.type !== "text" || !msg.text?.body) continue;
        try {
          const fromPhone = `+${msg.from}`;
          // Resolve clinic by WhatsApp number
          const { createClient } = await import("@supabase/supabase-js");
          const sbTemp = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
          );
          const normalTo = toPhone ? `+${toPhone.replace(/\D/g, "")}` : "";
          const { data: waConfig } = await sbTemp
            .from("whatsapp_config")
            .select("clinic_id")
            .or(`whatsapp_number.eq.${normalTo},whatsapp_number.eq.${toPhone}`)
            .limit(1)
            .maybeSingle();

          if (waConfig?.clinic_id) {
            const flowResult = await handleBookingFlow(
              fromPhone,
              msg.text.body,
              waConfig.clinic_id,
            );
            if (flowResult.handled && flowResult.reply) {
              await sendMessage({
                to: fromPhone,
                body: flowResult.reply,
                clinicId: waConfig.clinic_id,
              });
              log.info({ from: msg.from }, "Meta message handled by booking flow");
            }
            if (flowResult.handled) continue;
          }
        } catch (flowErr) {
          log.warn({ err: flowErr }, "Booking flow error — falling through to CRM");
        }
      }
    }
  }

  // Process through service layer
  const result = await processMetaWebhook(payload);

  log.info({ processed: result.processed, errors: result.errors.length }, "Meta webhook processed");

  // Meta requires 200 OK response, otherwise it retries
  return NextResponse.json({ status: "ok" }, { status: 200 });
}

// ─── Twilio POST Handler ─────────────────────────────────────

async function handleTwilioPost(req: NextRequest) {
  // Twilio sends application/x-www-form-urlencoded
  const formData = await req.formData();
  const params: Record<string, string> = {};
  formData.forEach((value, key) => {
    params[key] = String(value);
  });

  // Validate Twilio signature
  const isValid = await validateTwilioSignature(req, params);
  if (!isValid) {
    log.warn({ ip: req.headers.get("x-forwarded-for") }, "Invalid Twilio signature — rejected");
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // Extract standard Twilio WhatsApp fields
  const payload: IncomingMessage = {
    MessageSid: params.MessageSid || params.SmsSid || "",
    AccountSid: params.AccountSid || "",
    From: params.From || "",
    To: params.To || "",
    Body: params.Body || "",
    NumMedia: params.NumMedia || "0",
    MediaUrl0: params.MediaUrl0,
    MediaContentType0: params.MediaContentType0,
    ProfileName: params.ProfileName,
    WaId: params.WaId,
  };

  // Validate required fields
  if (!payload.From || !payload.To) {
    log.warn({ params }, "Webhook missing From or To");
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  log.info(
    {
      from: payload.From,
      to: payload.To,
      sid: payload.MessageSid,
      profile: payload.ProfileName,
      provider: "twilio",
    },
    "Twilio WhatsApp webhook received",
  );

  // ── Intercept booking confirmation keywords ──────────────
  try {
    const bookingHandled = await handleBookingReply(
      payload.From.replace("whatsapp:", ""),
      payload.Body,
    );
    if (bookingHandled) {
      log.info(
        { from: payload.From, body: payload.Body },
        "WhatsApp message handled as booking reply",
      );
      return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?><Response></Response>`, {
        status: 200,
        headers: { "Content-Type": "text/xml" },
      });
    }
  } catch (bookingErr) {
    log.warn({ err: bookingErr }, "Booking reply handler error — falling through to CRM");
  }

  // ── Intercept booking flow (appointment scheduling via WhatsApp) ──
  try {
    const normalFrom = payload.From.replace("whatsapp:", "");
    const normalTo = payload.To.replace("whatsapp:", "");
    const { createClient } = await import("@supabase/supabase-js");
    const sbTemp = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
    const { data: waConfig } = await sbTemp
      .from("whatsapp_config")
      .select("clinic_id")
      .or(`whatsapp_number.eq.${normalTo},whatsapp_number.eq.+${normalTo.replace(/\D/g, "")}`)
      .limit(1)
      .maybeSingle();

    if (waConfig?.clinic_id) {
      const flowResult = await handleBookingFlow(normalFrom, payload.Body, waConfig.clinic_id);
      if (flowResult.handled && flowResult.reply) {
        await sendMessage({
          to: normalFrom,
          body: flowResult.reply,
          clinicId: waConfig.clinic_id,
        });
        log.info({ from: normalFrom }, "Twilio message handled by booking flow");
        return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?><Response></Response>`, {
          status: 200,
          headers: { "Content-Type": "text/xml" },
        });
      }
    }
  } catch (flowErr) {
    log.warn({ err: flowErr }, "Booking flow error — falling through to CRM");
  }

  // Process through service layer (general CRM / chatbot)
  const result = await processIncomingMessage(payload);

  if (!result.success) {
    log.error({ error: result.error }, "processIncomingMessage failed");
    return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?><Response></Response>`, {
      status: 200,
      headers: { "Content-Type": "text/xml" },
    });
  }

  log.info(
    {
      leadId: result.leadId,
      conversationId: result.conversationId,
      isNew: result.isNewLead,
    },
    "WhatsApp message processed",
  );

  // Return empty TwiML — auto-reply is handled in service layer via API
  return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?><Response></Response>`, {
    status: 200,
    headers: { "Content-Type": "text/xml" },
  });
}

// ─── GET Handler (Meta Verification + Health Check) ──────────

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  // ── Meta Webhook Verification Handshake ─────────────────
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token && challenge) {
    const verifyToken = getMetaVerifyToken();

    if (token === verifyToken) {
      log.info("Meta webhook verification successful");
      // Must return the challenge as plain text with 200
      return new NextResponse(challenge, {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      });
    }

    log.warn({ token }, "Meta webhook verification failed — token mismatch");
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // ── Health check ────────────────────────────────────────
  return NextResponse.json({
    status: "ok",
    service: "whatsapp-webhook",
    provider: getActiveProvider(),
    timestamp: new Date().toISOString(),
  });
}

/**
 * Cóndor Salud — Twilio WhatsApp Incoming Webhook
 *
 * POST /api/webhooks/whatsapp
 *
 * Receives inbound WhatsApp messages from Twilio.
 * This route is PUBLIC (added to middleware bypass) because
 * Twilio cannot carry session cookies. Authentication is via
 * Twilio request signature validation.
 *
 * Flow:
 *   Twilio POST → validate signature → parse form body →
 *   processIncomingMessage() → return TwiML or 200
 */

import { NextRequest, NextResponse } from "next/server";
import { processIncomingMessage, type IncomingMessage } from "@/lib/services/whatsapp";
import { handleBookingReply } from "@/lib/services/whatsapp-booking-confirm";
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

// ─── POST Handler ────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
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
      },
      "WhatsApp webhook received",
    );

    // ── Intercept booking confirmation keywords ──────────────
    // If the message is a booking action (CONFIRMAR, CANCELAR, etc.)
    // handle it here and skip the general CRM flow.
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

    // Process through service layer (general CRM / chatbot)
    const result = await processIncomingMessage(payload);

    if (!result.success) {
      log.error({ error: result.error }, "processIncomingMessage failed");
      // Still return 200 to Twilio so it doesn't retry
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
  } catch (err) {
    log.error({ err }, "WhatsApp webhook error");
    // Return 200 even on error to prevent Twilio retry storms
    return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?><Response></Response>`, {
      status: 200,
      headers: { "Content-Type": "text/xml" },
    });
  }
}

// ─── GET Handler (Twilio health check) ───────────────────────

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "whatsapp-webhook",
    timestamp: new Date().toISOString(),
  });
}

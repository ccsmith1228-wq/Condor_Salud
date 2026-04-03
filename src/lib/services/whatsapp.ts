/**
 * Cóndor Salud — WhatsApp Service Layer
 *
 * Handles all WhatsApp messaging via Meta Cloud API (primary)
 * with Twilio fallback:
 * - Sending messages (text, templates, media)
 * - Processing incoming webhook payloads (Meta + Twilio formats)
 * - Conversation threading
 * - Lead auto-creation on first contact
 * - Patient profile generation
 *
 * Provider priority: Meta Cloud API → Twilio → dev-mode stub
 */

import { createClient } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";
import { isSupabaseConfigured } from "@/lib/env";

const log = logger.child({ module: "whatsapp" });

// ─── Constants ───────────────────────────────────────────────

const META_GRAPH_API = "https://graph.facebook.com/v21.0";

// ─── Types ───────────────────────────────────────────────────

/** Twilio-format incoming message (form-encoded webhook) */
export interface IncomingMessage {
  MessageSid: string;
  AccountSid: string;
  From: string; // "whatsapp:+5491155551234"
  To: string; // "whatsapp:+5491100001111"
  Body: string;
  NumMedia: string;
  MediaUrl0?: string;
  MediaContentType0?: string;
  ProfileName?: string; // WhatsApp display name
  WaId?: string; // WhatsApp ID (phone without prefix)
}

/** Meta Cloud API webhook payload (JSON) */
export interface MetaWebhookPayload {
  object: "whatsapp_business_account";
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: "whatsapp";
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        contacts?: Array<{
          profile: { name: string };
          wa_id: string;
        }>;
        messages?: Array<{
          from: string;
          id: string;
          timestamp: string;
          type:
            | "text"
            | "image"
            | "document"
            | "audio"
            | "video"
            | "location"
            | "interactive"
            | "button";
          text?: { body: string };
          image?: { id: string; mime_type: string; sha256: string; caption?: string };
          document?: { id: string; mime_type: string; filename: string };
          audio?: { id: string; mime_type: string };
        }>;
        statuses?: Array<{
          id: string;
          status: "sent" | "delivered" | "read" | "failed";
          timestamp: string;
          recipient_id: string;
          errors?: Array<{ code: number; title: string }>;
        }>;
      };
      field: "messages";
    }>;
  }>;
}

export interface MetaConfig {
  phoneNumberId: string;
  accessToken: string;
}

export interface SendMessageParams {
  to: string; // "+5491155551234" or "whatsapp:+5491155551234"
  body: string;
  mediaUrl?: string;
  clinicId: string;
  conversationId?: string;
  senderName?: string;
  senderId?: string;
}

export interface SendTemplateParams {
  to: string;
  templateName: string;
  variables: Record<string, string>;
  clinicId: string;
  conversationId?: string;
  /** BCP-47 language code for template, e.g. "es_AR" or "en_US" */
  language?: string;
}

// ─── Supabase Admin Client (service_role for webhook) ────────

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL or SERVICE_ROLE_KEY for WhatsApp service");
  }
  return createClient(url, key);
}

// ─── Meta Cloud API Config ───────────────────────────────────

/**
 * Returns Meta Cloud API credentials from env vars.
 * These are the global/system-level credentials.
 * Per-clinic overrides can live in whatsapp_config table.
 */
function getMetaConfig(): MetaConfig | null {
  const phoneNumberId = process.env.META_WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.META_WHATSAPP_ACCESS_TOKEN;
  if (!phoneNumberId || !accessToken) return null;
  return { phoneNumberId, accessToken };
}

/** Verify token used for Meta webhook subscription */
export function getMetaVerifyToken(): string {
  return process.env.META_WHATSAPP_VERIFY_TOKEN || "condorsalud-whatsapp-verify-2026";
}

// ─── Meta Cloud API — Send ───────────────────────────────────

/**
 * Send a text message via Meta WhatsApp Cloud API.
 * POST https://graph.facebook.com/v21.0/{phone_number_id}/messages
 */
async function sendMetaTextMessage(
  meta: MetaConfig,
  to: string,
  body: string,
  mediaUrl?: string,
): Promise<{ messageId: string }> {
  const phone = normalizePhone(to).replace("+", ""); // Meta wants digits only

  // Text message
  if (!mediaUrl) {
    const res = await fetch(`${META_GRAPH_API}/${meta.phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${meta.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: phone,
        type: "text",
        text: { preview_url: false, body },
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`Meta API ${res.status}: ${errBody}`);
    }

    const data = await res.json();
    return { messageId: data.messages?.[0]?.id || `meta-${Date.now()}` };
  }

  // Image message
  const res = await fetch(`${META_GRAPH_API}/${meta.phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${meta.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: phone,
      type: "image",
      image: { link: mediaUrl, caption: body || undefined },
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Meta API ${res.status}: ${errBody}`);
  }

  const data = await res.json();
  return { messageId: data.messages?.[0]?.id || `meta-${Date.now()}` };
}

/**
 * Send a template message via Meta Cloud API.
 * Used for initiating conversations (outside 24-hour window).
 */
export async function sendMetaTemplate(params: SendTemplateParams): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  const meta = getMetaConfig();
  if (!meta) return { success: false, error: "Meta Cloud API not configured" };

  const phone = normalizePhone(params.to).replace("+", "");

  // Meta API requires all body parameters in a single "body" component.
  const bodyParams = Object.values(params.variables).map((value) => ({
    type: "text" as const,
    text: value,
  }));

  const components =
    bodyParams.length > 0 ? [{ type: "body" as const, parameters: bodyParams }] : undefined;

  try {
    const res = await fetch(`${META_GRAPH_API}/${meta.phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${meta.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: phone,
        type: "template",
        template: {
          name: params.templateName,
          language: { code: params.language || "es_AR" },
          components,
        },
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      log.error({ status: res.status, body: errBody }, "Meta template send failed");
      return { success: false, error: errBody };
    }

    const data = await res.json();
    const messageId = data.messages?.[0]?.id;
    log.info({ messageId, template: params.templateName, to: phone }, "Meta template sent");
    return { success: true, messageId };
  } catch (err) {
    log.error({ err }, "Meta template send error");
    return { success: false, error: String(err) };
  }
}

/**
 * Mark a message as read in Meta Cloud API.
 * This shows blue check marks to the user.
 */
export async function markMetaMessageRead(messageId: string): Promise<void> {
  const meta = getMetaConfig();
  if (!meta) return;

  try {
    await fetch(`${META_GRAPH_API}/${meta.phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${meta.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        status: "read",
        message_id: messageId,
      }),
    });
  } catch (err) {
    log.warn({ err, messageId }, "Failed to mark Meta message as read");
  }
}

// ─── Twilio Client (Fallback) ────────────────────────────────

async function getTwilioClient() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) return null;

  const twilio = await import("twilio");
  return twilio.default(sid, token);
}

// ─── Normalize Phone Numbers ─────────────────────────────────

/** Strip "whatsapp:" prefix and normalize to E.164 */
export function normalizePhone(raw: string): string {
  return raw.replace(/^whatsapp:/, "").trim();
}

/** Ensure "whatsapp:" prefix for Twilio */
export function toWhatsAppFormat(phone: string): string {
  const clean = normalizePhone(phone);
  return `whatsapp:${clean}`;
}

/** Which provider is configured? Meta takes priority. */
export function getActiveProvider(): "meta" | "twilio" | "none" {
  if (getMetaConfig()) return "meta";
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) return "twilio";
  return "none";
}

// ─── Process Incoming (Meta Cloud API) ───────────────────────

/**
 * Entry point for Meta Cloud API webhooks.
 * Extracts messages from Meta's nested JSON format and routes
 * them through the same CRM pipeline as Twilio messages.
 */
export async function processMetaWebhook(payload: MetaWebhookPayload): Promise<{
  processed: number;
  errors: string[];
}> {
  const results = { processed: 0, errors: [] as string[] };

  for (const entry of payload.entry) {
    for (const change of entry.changes) {
      if (change.field !== "messages") continue;
      const value = change.value;

      // Handle delivery/read status updates
      if (value.statuses) {
        for (const status of value.statuses) {
          await handleMetaStatusUpdate(status);
        }
      }

      // Handle incoming messages
      if (value.messages && value.contacts) {
        for (let i = 0; i < value.messages.length; i++) {
          const msg = value.messages[i]!;
          const contact = value.contacts[i] ?? value.contacts[0]!;

          // Extract message body based on type
          let body = "";
          let mediaUrl: string | undefined;
          let mediaType: string | undefined;

          switch (msg.type) {
            case "text":
              body = msg.text?.body || "";
              break;
            case "image":
              body = msg.image?.caption || "[Imagen]";
              mediaType = msg.image?.mime_type;
              // Media URL must be fetched from Meta's media endpoint
              mediaUrl = msg.image?.id ? `${META_GRAPH_API}/${msg.image.id}` : undefined;
              break;
            case "document":
              body = `[Documento: ${msg.document?.filename || "archivo"}]`;
              mediaType = msg.document?.mime_type;
              break;
            case "audio":
              body = "[Audio]";
              mediaType = msg.audio?.mime_type;
              break;
            case "interactive":
            case "button":
              body = (msg as Record<string, unknown>).interactive
                ? JSON.stringify((msg as Record<string, unknown>).interactive)
                : msg.type;
              break;
            default:
              body = `[${msg.type}]`;
          }

          // Convert to our standard IncomingMessage format
          const fromPhone = `+${msg.from}`;
          const toPhone = value.metadata.display_phone_number.startsWith("+")
            ? value.metadata.display_phone_number
            : `+${value.metadata.display_phone_number}`;

          const incomingPayload: IncomingMessage = {
            MessageSid: msg.id, // Meta message ID (wamid.xxx)
            AccountSid: entry.id, // Business Account ID
            From: fromPhone,
            To: toPhone,
            Body: body,
            NumMedia: mediaUrl ? "1" : "0",
            MediaUrl0: mediaUrl,
            MediaContentType0: mediaType,
            ProfileName: contact.profile.name,
            WaId: contact.wa_id,
          };

          try {
            const result = await processIncomingMessage(incomingPayload);
            if (result.success) {
              results.processed++;
              // Mark message as read in Meta
              await markMetaMessageRead(msg.id);
            } else {
              results.errors.push(result.error || "Unknown error");
            }
          } catch (err) {
            log.error({ err, msgId: msg.id }, "Error processing Meta webhook message");
            results.errors.push(String(err));
          }
        }
      }
    }
  }

  return results;
}

/** Update message status from Meta delivery receipts */
async function handleMetaStatusUpdate(status: {
  id: string;
  status: string;
  timestamp: string;
  recipient_id: string;
  errors?: Array<{ code: number; title: string }>;
}) {
  if (!isSupabaseConfigured()) return;

  const supabase = getServiceClient();

  // Map Meta status to our status values
  const statusMap: Record<string, string> = {
    sent: "sent",
    delivered: "delivered",
    read: "read",
    failed: "failed",
  };

  const newStatus = statusMap[status.status] || status.status;

  // Update the message by its external ID (stored as twilio_sid for compatibility)
  const { error } = await supabase
    .from("messages")
    .update({
      status: newStatus,
      ...(status.errors ? { metadata: { delivery_errors: status.errors } } : {}),
    })
    .eq("twilio_sid", status.id);

  if (error) {
    log.warn({ error, metaId: status.id }, "Failed to update message status from Meta webhook");
  } else {
    log.debug({ metaId: status.id, status: newStatus }, "Meta message status updated");
  }
}

// ─── Process Incoming Message (Provider-Agnostic) ────────────

/**
 * Main entry point for Twilio webhook.
 * 1. Find the clinic by the "To" number
 * 2. Find or create lead
 * 3. Find or create conversation
 * 4. Store message
 * 5. Auto-create patient profile if enough data
 * 6. Send auto-reply if first contact
 */
export async function processIncomingMessage(payload: IncomingMessage) {
  if (!isSupabaseConfigured()) {
    log.info("DEMO MODE — incoming message ignored");
    return {
      success: true,
      leadId: "lead-demo",
      conversationId: "conv-demo",
      messageId: "msg-demo",
      isNewLead: false,
    };
  }

  const supabase = getServiceClient();
  const fromPhone = normalizePhone(payload.From);
  const toPhone = normalizePhone(payload.To);

  log.info({ from: fromPhone, to: toPhone, sid: payload.MessageSid }, "Incoming WhatsApp message");

  // 1. Find clinic by WhatsApp number
  const { data: config } = await supabase
    .from("whatsapp_config")
    .select("*")
    .eq("whatsapp_number", toPhone)
    .single();

  if (!config) {
    // Try with alternative formats
    const { data: configAlt } = await supabase
      .from("whatsapp_config")
      .select("*")
      .or(`whatsapp_number.eq.${toPhone},whatsapp_number.eq.+${toPhone}`)
      .limit(1)
      .single();

    if (!configAlt) {
      log.warn({ to: toPhone }, "No clinic found for WhatsApp number");
      return { success: false, error: "No clinic configured for this number" };
    }
    Object.assign(config ?? {}, configAlt);
  }

  const clinicId = config!.clinic_id;

  // 2. Find or create lead
  let isNewLead = false;
  let { data: lead } = await supabase
    .from("leads")
    .select("*")
    .eq("clinic_id", clinicId)
    .eq("telefono", fromPhone)
    .single();

  if (!lead) {
    isNewLead = true;
    const { data: newLead, error } = await supabase
      .from("leads")
      .insert({
        clinic_id: clinicId,
        telefono: fromPhone,
        nombre: payload.ProfileName || null,
        motivo: payload.Body.substring(0, 500),
        fuente: "whatsapp",
        estado: "nuevo",
        first_contact_at: new Date().toISOString(),
        last_message_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      log.error({ error, phone: fromPhone }, "Failed to create lead");
      return { success: false, error: "Failed to create lead" };
    }
    lead = newLead;
    log.info({ leadId: lead!.id, phone: fromPhone }, "New lead created from WhatsApp");
  } else {
    // Update last message timestamp
    await supabase
      .from("leads")
      .update({
        last_message_at: new Date().toISOString(),
        ...(payload.ProfileName && !lead.nombre ? { nombre: payload.ProfileName } : {}),
      })
      .eq("id", lead.id);
  }

  // 3. Find or create conversation
  let { data: conversation } = await supabase
    .from("conversations")
    .select("*")
    .eq("clinic_id", clinicId)
    .eq("lead_id", lead!.id)
    .eq("channel", "whatsapp")
    .in("status", ["open", "pending"])
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!conversation) {
    const { data: newConv, error } = await supabase
      .from("conversations")
      .insert({
        clinic_id: clinicId,
        lead_id: lead!.id,
        paciente_id: lead!.paciente_id || null,
        channel: "whatsapp",
        status: "open",
        subject: payload.Body.substring(0, 100),
        unread_count: 1,
        last_message_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      log.error({ error }, "Failed to create conversation");
      return { success: false, error: "Failed to create conversation" };
    }
    conversation = newConv;
  } else {
    await supabase
      .from("conversations")
      .update({
        unread_count: (conversation.unread_count || 0) + 1,
        last_message_at: new Date().toISOString(),
        status: "open",
      })
      .eq("id", conversation.id);
  }

  // 4. Store message
  const { data: message, error: msgError } = await supabase
    .from("messages")
    .insert({
      clinic_id: clinicId,
      conversation_id: conversation!.id,
      direction: "inbound",
      sender_type: lead!.paciente_id ? "patient" : "lead",
      sender_id: lead!.paciente_id || lead!.id,
      sender_name: payload.ProfileName || fromPhone,
      body: payload.Body,
      media_url: payload.MediaUrl0 || null,
      media_type: payload.MediaContentType0 || null,
      twilio_sid: payload.MessageSid,
      status: "delivered",
    })
    .select()
    .single();

  if (msgError) {
    log.error({ error: msgError }, "Failed to store message");
  }

  // 5. Auto-create patient profile if new lead
  if (isNewLead && payload.ProfileName) {
    await autoCreatePatient(supabase, clinicId, lead!.id, {
      nombre: payload.ProfileName,
      telefono: fromPhone,
    });
  }

  // 6. Send auto-reply if configured and first contact
  if (isNewLead && config!.auto_reply && config!.welcome_message) {
    await sendMessage({
      to: fromPhone,
      body: config!.welcome_message,
      clinicId,
      conversationId: conversation!.id,
      senderName: config!.display_name || "Sistema",
    });
  }

  return {
    success: true,
    leadId: lead!.id,
    conversationId: conversation!.id,
    messageId: message?.id,
    isNewLead,
  };
}

// ─── Auto-Create Patient Profile ─────────────────────────────

async function autoCreatePatient(
  supabase: ReturnType<typeof getServiceClient>,
  clinicId: string,
  leadId: string,
  data: { nombre: string; telefono: string; email?: string; dni?: string },
) {
  // Check if a patient with this phone already exists
  const { data: existing } = await supabase
    .from("pacientes")
    .select("id")
    .eq("clinic_id", clinicId)
    .eq("telefono", data.telefono)
    .limit(1)
    .single();

  if (existing) {
    // Link existing patient to lead
    await supabase.from("leads").update({ paciente_id: existing.id }).eq("id", leadId);
    log.info({ leadId, pacienteId: existing.id }, "Lead linked to existing patient");
    return existing.id;
  }

  // Create a new patient profile with minimal data (to be enriched later)
  const { data: patient, error } = await supabase
    .from("pacientes")
    .insert({
      clinic_id: clinicId,
      nombre: data.nombre,
      telefono: data.telefono,
      email: data.email || null,
      dni: data.dni || `WA-${Date.now()}`, // Temp DNI — must be updated by staff
      estado: "activo",
      notas: "Creado automáticamente desde WhatsApp. Verificar datos.",
    })
    .select("id")
    .single();

  if (error) {
    log.warn({ error, leadId }, "Could not auto-create patient (may need DNI)");
    return null;
  }

  // Link patient to lead
  await supabase.from("leads").update({ paciente_id: patient!.id }).eq("id", leadId);
  log.info({ leadId, pacienteId: patient!.id }, "Patient auto-created from WhatsApp lead");

  return patient!.id;
}

// ─── Send Message ────────────────────────────────────────────

// ─── Send Message (Meta → Twilio → Dev Stub) ────────────────

/**
 * Main send function. Priority: Meta Cloud API → Twilio → dev stub.
 * Stores outbound message in DB regardless of provider.
 */
export async function sendMessage(params: SendMessageParams): Promise<{
  success: boolean;
  twilioSid?: string;
  messageId?: string;
  error?: string;
}> {
  if (!isSupabaseConfigured()) {
    log.info({ to: params.to, body: params.body }, "DEMO MODE — message not sent");
    return { success: true, twilioSid: `demo-${Date.now()}` };
  }

  const supabase = getServiceClient();
  const meta = getMetaConfig();
  const to = normalizePhone(params.to);

  // Get clinic's WhatsApp number
  const { data: config } = await supabase
    .from("whatsapp_config")
    .select("whatsapp_number")
    .eq("clinic_id", params.clinicId)
    .single();

  if (!config) {
    return { success: false, error: "No WhatsApp config for this clinic" };
  }

  // ── Try Meta Cloud API first ───────────────────────────────
  if (meta) {
    try {
      const { messageId } = await sendMetaTextMessage(meta, to, params.body, params.mediaUrl);

      // Store outbound message
      if (params.conversationId) {
        await supabase.from("messages").insert({
          clinic_id: params.clinicId,
          conversation_id: params.conversationId,
          direction: "outbound",
          sender_type: "staff",
          sender_id: params.senderId || null,
          sender_name: params.senderName || "Staff",
          body: params.body,
          media_url: params.mediaUrl || null,
          twilio_sid: messageId, // Reuse column for Meta message ID
          status: "sent",
          metadata: { provider: "meta" },
        });
      }

      log.info({ messageId, to, provider: "meta" }, "WhatsApp message sent via Meta Cloud API");
      return { success: true, messageId, twilioSid: messageId };
    } catch (err) {
      log.error({ err, to }, "Meta Cloud API send failed — falling back to Twilio");
      // Fall through to Twilio
    }
  }

  // ── Try Twilio fallback ────────────────────────────────────
  const client = await getTwilioClient();
  const twilioTo = toWhatsAppFormat(to);
  const from = toWhatsAppFormat(config.whatsapp_number);

  if (!client) {
    // Dev mode: log message and store it
    log.info({ to: twilioTo, body: params.body }, "WhatsApp message (dev mode — not sent)");

    if (params.conversationId) {
      await supabase.from("messages").insert({
        clinic_id: params.clinicId,
        conversation_id: params.conversationId,
        direction: "outbound",
        sender_type: "staff",
        sender_id: params.senderId || null,
        sender_name: params.senderName || "Staff",
        body: params.body,
        status: "sent",
        metadata: { dev_mode: true },
      });
    }

    return { success: true, twilioSid: `dev-${Date.now()}` };
  }

  try {
    const twilioMsg = await client.messages.create({
      from,
      to: twilioTo,
      body: params.body,
      ...(params.mediaUrl ? { mediaUrl: [params.mediaUrl] } : {}),
    });

    // Store outbound message
    if (params.conversationId) {
      await supabase.from("messages").insert({
        clinic_id: params.clinicId,
        conversation_id: params.conversationId,
        direction: "outbound",
        sender_type: "staff",
        sender_id: params.senderId || null,
        sender_name: params.senderName || "Staff",
        body: params.body,
        media_url: params.mediaUrl || null,
        twilio_sid: twilioMsg.sid,
        status: "sent",
        metadata: { provider: "twilio" },
      });
    }

    log.info(
      { sid: twilioMsg.sid, to: twilioTo, provider: "twilio" },
      "WhatsApp message sent via Twilio",
    );
    return { success: true, twilioSid: twilioMsg.sid };
  } catch (err) {
    log.error({ err, to: twilioTo }, "Failed to send WhatsApp message via Twilio");
    return { success: false, error: String(err) };
  }
}

// ─── Get Conversations ───────────────────────────────────────

const DEMO_CONVERSATIONS = [
  {
    id: "conv-1",
    clinic_id: "demo-clinic-001",
    lead_id: "lead-1",
    paciente_id: null,
    channel: "whatsapp",
    status: "open",
    subject: "Consulta dolor de cabeza",
    unread_count: 2,
    last_message_at: "2026-03-15T09:32:00",
    created_at: "2026-03-15T09:30:00",
    lead: {
      id: "lead-1",
      nombre: "Lucía Fernández",
      telefono: "+5491155550101",
      estado: "nuevo",
      tags: ["urgente"],
      financiador: "OSDE",
    },
    paciente: null,
  },
  {
    id: "conv-2",
    clinic_id: "demo-clinic-001",
    lead_id: "lead-2",
    paciente_id: null,
    channel: "whatsapp",
    status: "open",
    subject: "Turno chequeo anual",
    unread_count: 0,
    last_message_at: "2026-03-15T10:00:00",
    created_at: "2026-03-14T14:00:00",
    lead: {
      id: "lead-2",
      nombre: "Matías Romero",
      telefono: "+5491155550102",
      estado: "contactado",
      tags: ["chequeo"],
      financiador: "Swiss Medical",
    },
    paciente: null,
  },
  {
    id: "conv-3",
    clinic_id: "demo-clinic-001",
    lead_id: "lead-3",
    paciente_id: null,
    channel: "whatsapp",
    status: "open",
    subject: "Dermatología - manchas",
    unread_count: 1,
    last_message_at: "2026-03-14T16:00:00",
    created_at: "2026-03-13T11:00:00",
    lead: {
      id: "lead-3",
      nombre: "Valentina Sosa",
      telefono: "+5491155550103",
      estado: "interesado",
      tags: ["dermatología"],
      financiador: "Galeno",
    },
    paciente: null,
  },
  {
    id: "conv-4",
    clinic_id: "demo-clinic-001",
    lead_id: "lead-5",
    paciente_id: "p-demo-1",
    channel: "whatsapp",
    status: "closed",
    subject: "Control post-operatorio",
    unread_count: 0,
    last_message_at: "2026-03-10T14:00:00",
    created_at: "2026-03-08T10:00:00",
    lead: {
      id: "lead-5",
      nombre: "Carolina Méndez",
      telefono: "+5491155550105",
      estado: "convertido",
      tags: ["post-op"],
      financiador: "Medifé",
    },
    paciente: {
      id: "p-demo-1",
      nombre: "Carolina Méndez",
      telefono: "+5491155550105",
      financiador: "Medifé",
    },
  },
  {
    id: "conv-5",
    clinic_id: "demo-clinic-001",
    lead_id: "lead-10",
    paciente_id: "p-demo-3",
    channel: "whatsapp",
    status: "closed",
    subject: "Consulta pediátrica",
    unread_count: 0,
    last_message_at: "2026-03-11T10:00:00",
    created_at: "2026-03-10T16:00:00",
    lead: {
      id: "lead-10",
      nombre: "Julieta Vargas",
      telefono: "+5491155550110",
      estado: "convertido",
      tags: ["pediatría"],
      financiador: "Galeno",
    },
    paciente: {
      id: "p-demo-3",
      nombre: "Julieta Vargas",
      telefono: "+5491155550110",
      financiador: "Galeno",
    },
  },
];

const DEMO_MESSAGES: Record<
  string,
  Array<{
    id: string;
    clinic_id: string;
    conversation_id: string;
    direction: string;
    sender_type: string;
    sender_id: string;
    sender_name: string;
    body: string;
    media_url: string | null;
    media_type: string | null;
    twilio_sid: string | null;
    status: string;
    created_at: string;
  }>
> = {
  "conv-1": [
    {
      id: "msg-1a",
      clinic_id: "demo-clinic-001",
      conversation_id: "conv-1",
      direction: "inbound",
      sender_type: "lead",
      sender_id: "lead-1",
      sender_name: "Lucía Fernández",
      body: "Hola, quería consultar porque tengo dolores de cabeza frecuentes desde hace dos semanas.",
      media_url: null,
      media_type: null,
      twilio_sid: null,
      status: "delivered",
      created_at: "2026-03-15T09:30:00",
    },
    {
      id: "msg-1b",
      clinic_id: "demo-clinic-001",
      conversation_id: "conv-1",
      direction: "outbound",
      sender_type: "staff",
      sender_id: "demo-doctor-001",
      sender_name: "Clínica San Martín",
      body: "Hola Lucía! Gracias por contactarnos. ¿Podría contarnos un poco más? ¿El dolor es localizado o general? ¿Toma alguna medicación?",
      media_url: null,
      media_type: null,
      twilio_sid: null,
      status: "sent",
      created_at: "2026-03-15T09:31:00",
    },
    {
      id: "msg-1c",
      clinic_id: "demo-clinic-001",
      conversation_id: "conv-1",
      direction: "inbound",
      sender_type: "lead",
      sender_id: "lead-1",
      sender_name: "Lucía Fernández",
      body: "Es en la zona de la frente, generalmente por la tarde. No tomo nada por el momento.",
      media_url: null,
      media_type: null,
      twilio_sid: null,
      status: "delivered",
      created_at: "2026-03-15T09:32:00",
    },
  ],
  "conv-2": [
    {
      id: "msg-2a",
      clinic_id: "demo-clinic-001",
      conversation_id: "conv-2",
      direction: "inbound",
      sender_type: "lead",
      sender_id: "lead-2",
      sender_name: "Matías Romero",
      body: "Buen día, quisiera sacar turno para un chequeo general. Tengo Swiss Medical.",
      media_url: null,
      media_type: null,
      twilio_sid: null,
      status: "delivered",
      created_at: "2026-03-14T14:00:00",
    },
    {
      id: "msg-2b",
      clinic_id: "demo-clinic-001",
      conversation_id: "conv-2",
      direction: "outbound",
      sender_type: "staff",
      sender_id: "demo-doctor-001",
      sender_name: "Clínica San Martín",
      body: "Hola Matías! Tenemos turnos disponibles esta semana. ¿Le conviene martes o jueves por la mañana?",
      media_url: null,
      media_type: null,
      twilio_sid: null,
      status: "sent",
      created_at: "2026-03-14T14:05:00",
    },
    {
      id: "msg-2c",
      clinic_id: "demo-clinic-001",
      conversation_id: "conv-2",
      direction: "inbound",
      sender_type: "lead",
      sender_id: "lead-2",
      sender_name: "Matías Romero",
      body: "El jueves a las 10 me viene perfecto. Gracias!",
      media_url: null,
      media_type: null,
      twilio_sid: null,
      status: "delivered",
      created_at: "2026-03-15T10:00:00",
    },
  ],
  "conv-3": [
    {
      id: "msg-3a",
      clinic_id: "demo-clinic-001",
      conversation_id: "conv-3",
      direction: "inbound",
      sender_type: "lead",
      sender_id: "lead-3",
      sender_name: "Valentina Sosa",
      body: "Hola, tengo unas manchas en el brazo que aparecieron hace un mes. ¿Puedo enviar fotos?",
      media_url: null,
      media_type: null,
      twilio_sid: null,
      status: "delivered",
      created_at: "2026-03-13T11:00:00",
    },
    {
      id: "msg-3b",
      clinic_id: "demo-clinic-001",
      conversation_id: "conv-3",
      direction: "outbound",
      sender_type: "staff",
      sender_id: "demo-doctor-001",
      sender_name: "Clínica San Martín",
      body: "Hola Valentina! Sí, puede enviarnos las fotos por acá. Se las vamos a derivar a nuestra dermatóloga.",
      media_url: null,
      media_type: null,
      twilio_sid: null,
      status: "sent",
      created_at: "2026-03-13T11:05:00",
    },
    {
      id: "msg-3c",
      clinic_id: "demo-clinic-001",
      conversation_id: "conv-3",
      direction: "inbound",
      sender_type: "lead",
      sender_id: "lead-3",
      sender_name: "Valentina Sosa",
      body: "Acá le mando las fotos. Son las manchas del antebrazo derecho.",
      media_url: "https://placehold.co/400x300?text=Foto+dermatológica",
      media_type: "image/jpeg",
      twilio_sid: null,
      status: "delivered",
      created_at: "2026-03-14T16:00:00",
    },
  ],
};

export async function getConversations(clinicId: string, status?: string) {
  if (!isSupabaseConfigured()) {
    let convs = [...DEMO_CONVERSATIONS];
    if (status) convs = convs.filter((c) => c.status === status);
    return convs;
  }

  const supabase = getServiceClient();
  let query = supabase
    .from("conversations")
    .select(
      `
      *,
      lead:leads(id, nombre, telefono, estado, tags, financiador),
      paciente:pacientes(id, nombre, telefono, financiador)
    `,
    )
    .eq("clinic_id", clinicId)
    .order("last_message_at", { ascending: false });

  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) log.error({ error }, "Failed to fetch conversations");
  return data ?? [];
}

// ─── Get Messages for a Conversation ─────────────────────────

export async function getMessages(conversationId: string, limit = 50) {
  if (!isSupabaseConfigured()) {
    return DEMO_MESSAGES[conversationId] ?? [];
  }

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) log.error({ error }, "Failed to fetch messages");
  return data ?? [];
}

// ─── Mark Conversation as Read ───────────────────────────────

export async function markConversationRead(conversationId: string) {
  if (!isSupabaseConfigured()) return; // DEMO MODE — no-op

  const supabase = getServiceClient();
  await supabase.from("conversations").update({ unread_count: 0 }).eq("id", conversationId);
}

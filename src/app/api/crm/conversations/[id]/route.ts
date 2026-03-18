/**
 * Conversation Messages + Reply API
 *
 * GET  /api/crm/conversations/[id] — Get messages for a conversation
 * POST /api/crm/conversations/[id] — Send reply in conversation
 */

import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, sanitizeBody, logger } from "@/lib/security/api-guard";
import { requireAuth } from "@/lib/security/require-auth";
import { getMessages, markConversationRead, sendMessage } from "@/lib/services/whatsapp";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const auth = await requireAuth(req);
  if (auth.error) return auth.error;

  const limited = checkRateLimit(req, "crm-messages", { limit: 60, windowSec: 60 });
  if (limited) return limited;

  try {
    const { id } = await params;
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit") || "50", 10);

    const messages = await getMessages(id, limit);

    // Mark as read when viewed
    await markConversationRead(id);

    return NextResponse.json({ messages });
  } catch (err) {
    logger.error({ err }, "Failed to fetch messages");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  const auth = await requireAuth(req);
  if (auth.error) return auth.error;

  const limited = checkRateLimit(req, "crm-send-msg", { limit: 20, windowSec: 60 });
  if (limited) return limited;

  try {
    const { id: conversationId } = await params;
    const clinicId = auth.user?.clinicId;
    if (!clinicId) {
      return NextResponse.json({ error: "No clinic associated" }, { status: 400 });
    }

    const rawBody = await req.json();
    const body = sanitizeBody(rawBody);

    if (!body.body || !body.to) {
      return NextResponse.json({ error: "body and to are required" }, { status: 400 });
    }

    const result = await sendMessage({
      to: body.to,
      body: body.body,
      clinicId,
      conversationId,
      senderName: auth.user?.name || "Staff",
      senderId: auth.user?.id,
      mediaUrl: body.mediaUrl,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, twilioSid: result.twilioSid });
  } catch (err) {
    logger.error({ err }, "Failed to send message");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

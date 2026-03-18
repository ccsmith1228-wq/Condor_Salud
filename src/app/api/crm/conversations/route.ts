/**
 * Conversations + Messages API
 *
 * GET  /api/crm/conversations           — List conversations
 * POST /api/crm/conversations/[id]/send — Send a message in conversation
 * GET  /api/crm/conversations/[id]      — Get messages for a conversation
 */

import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, logger } from "@/lib/security/api-guard";
import { requireAuth } from "@/lib/security/require-auth";
import { getConversations } from "@/lib/services/whatsapp";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth.error) return auth.error;

  const limited = checkRateLimit(req, "crm-conversations", { limit: 60, windowSec: 60 });
  if (limited) return limited;

  try {
    const clinicId = auth.user?.clinicId;
    if (!clinicId) {
      return NextResponse.json({ error: "No clinic associated" }, { status: 400 });
    }

    const url = new URL(req.url);
    const status = url.searchParams.get("status") || undefined;

    const conversations = await getConversations(clinicId, status);
    return NextResponse.json({ conversations });
  } catch (err) {
    logger.error({ err, route: "crm/conversations" }, "Failed to fetch conversations");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

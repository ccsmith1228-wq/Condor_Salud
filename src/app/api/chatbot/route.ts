import { NextRequest, NextResponse } from "next/server";
import { processMessage } from "@/lib/chatbot-engine";
import { checkRateLimit, sanitize, logger } from "@/lib/security/api-guard";

export async function POST(req: NextRequest) {
  // ── Rate limit: 20 req / 60s per IP ──
  const limited = checkRateLimit(req, "chatbot", { limit: 20, windowSec: 60 });
  if (limited) return limited;

  try {
    const body = await req.json();
    const { message, lat, lng } = body as { message?: string; lat?: number; lng?: number };

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Sanitize user input
    const cleanMessage = sanitize(message, 2000);

    // Build optional coordinates (validated)
    const coords =
      typeof lat === "number" &&
      typeof lng === "number" &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180
        ? { lat, lng }
        : null;

    // Simulate a brief thinking delay (200-600ms) for natural feel
    const delay = 200 + Math.random() * 400;
    await new Promise((resolve) => setTimeout(resolve, delay));

    const response = processMessage(cleanMessage, coords);

    return NextResponse.json({
      id: `bot-${Date.now()}`,
      role: "bot",
      timestamp: Date.now(),
      ...response,
    });
  } catch (err) {
    logger.error({ err, route: "chatbot" }, "Chatbot processing error");
    return NextResponse.json(
      {
        id: `bot-${Date.now()}`,
        role: "bot",
        timestamp: Date.now(),
        text: "Disculpá, ocurrió un error procesando tu consulta. ¿Podrías intentar de nuevo?",
        quickReplies: [
          { label: "Reintentar", value: "Hola" },
          { label: "Hablar con alguien", value: "Quiero hablar con un agente" },
        ],
      },
      { status: 200 },
    );
  }
}

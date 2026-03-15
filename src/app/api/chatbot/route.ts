import { NextRequest, NextResponse } from "next/server";
import { processMessage, detectEmergency } from "@/lib/chatbot-engine";
import { askClaude, isClaudeConfigured } from "@/lib/ai/claude";
import { checkRateLimit, sanitize, logger } from "@/lib/security/api-guard";

export async function POST(req: NextRequest) {
  // ── Rate limit: 20 req / 60s per IP ──
  const limited = checkRateLimit(req, "chatbot", { limit: 20, windowSec: 60 });
  if (limited) return limited;

  let lang: string | undefined;

  try {
    const body = await req.json();
    const {
      message,
      lat,
      lng,
      history,
      lang: bodyLang,
    } = body as {
      message?: string;
      lat?: number;
      lng?: number;
      history?: { role: "user" | "assistant"; content: string }[];
      lang?: string;
    };
    lang = bodyLang;

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

    // ── SAFETY LAYER: Check for emergencies first (rule-based) ──
    // Emergency detection must NEVER be delegated to AI.
    const emergency = detectEmergency(cleanMessage);
    if (emergency) {
      return NextResponse.json({
        id: `bot-${Date.now()}`,
        role: "bot",
        timestamp: Date.now(),
        ...processMessage(cleanMessage, coords),
      });
    }

    // ── CLAUDE AI: Use AI for non-emergency conversations ──
    if (isClaudeConfigured()) {
      // Truncate history to last 10 messages to control token usage
      const trimmedHistory = (history ?? []).slice(-10);

      const aiResponse = await askClaude(cleanMessage, trimmedHistory, coords, lang);

      if (aiResponse) {
        return NextResponse.json({
          id: `bot-${Date.now()}`,
          role: "bot",
          timestamp: Date.now(),
          ...aiResponse,
        });
      }

      // If Claude fails, fall through to rule-based engine
      logger.warn("Claude unavailable, falling back to rule-based engine");
    }

    // ── FALLBACK: Rule-based engine ──
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
    const isEn = typeof lang === "string" && lang.startsWith("en");
    return NextResponse.json(
      {
        id: `bot-${Date.now()}`,
        role: "bot",
        timestamp: Date.now(),
        text: isEn
          ? "Sorry, something went wrong processing your request. Could you try again?"
          : "Disculpá, ocurrió un error procesando tu consulta. ¿Podrías intentar de nuevo?",
        quickReplies: isEn
          ? [
              { label: "Try again", value: "Hello" },
              { label: "Talk to someone", value: "I want to speak with an agent" },
            ]
          : [
              { label: "Reintentar", value: "Hola" },
              { label: "Hablar con alguien", value: "Quiero hablar con un agente" },
            ],
      },
      { status: 200 },
    );
  }
}

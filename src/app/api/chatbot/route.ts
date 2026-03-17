import { NextRequest, NextResponse } from "next/server";
import { processMessage, detectEmergency } from "@/lib/chatbot-engine";
import type { LivePlaces } from "@/lib/chatbot-engine";
import { askClaude, isClaudeConfigured } from "@/lib/ai/claude";
import { checkRateLimit, sanitize, logger } from "@/lib/security/api-guard";
import { nearbyPlacesSearch } from "@/lib/google";

/* ── Helper: fetch live places from Google and map to chatbot format ── */
async function fetchLivePlaces(lat: number, lng: number): Promise<LivePlaces | null> {
  try {
    const [rawDocs, rawPharms, rawHosps] = await Promise.all([
      nearbyPlacesSearch(lat, lng, "doctor", 5000),
      nearbyPlacesSearch(lat, lng, "pharmacy", 5000),
      nearbyPlacesSearch(lat, lng, "hospital", 5000),
    ]);

    // If all three returned empty, Google key is likely missing — skip
    if (!rawDocs.length && !rawPharms.length && !rawHosps.length) return null;

    const mapItem = (p: {
      name: string;
      address: string;
      lat: number;
      lng: number;
      types?: string[];
      openNow?: boolean;
    }) => ({
      name: p.name,
      address: p.address,
      lat: p.lat,
      lng: p.lng,
    });

    return {
      doctors: rawDocs.map((p) => ({
        ...mapItem(p),
        specialty: p.types?.find((t) => t !== "doctor" && t !== "health") ?? undefined,
      })),
      pharmacies: rawPharms.map((p) => ({
        ...mapItem(p),
        open24h: p.openNow ?? undefined,
      })),
      hospitals: rawHosps.map((p) => ({
        ...mapItem(p),
        emergency: true,
      })),
    };
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  // ── Rate limit: 20 req / 60s per IP ──
  const limited = checkRateLimit(req, "chatbot", { limit: 20, windowSec: 60 });
  if (limited) {
    // Return rate-limit error as a valid ChatMessage so the client can display it
    return NextResponse.json(
      {
        id: `bot-${Date.now()}`,
        role: "bot",
        timestamp: Date.now(),
        text: "Estás enviando mensajes muy rápido. Esperá un momento antes de enviar otro. / You're sending messages too quickly. Please wait a moment.",
        quickReplies: [{ label: "Reintentar / Retry", value: "Hola" }],
      },
      { status: 429, headers: Object.fromEntries(limited.headers.entries()) },
    );
  }

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
      const isEn = typeof bodyLang === "string" && bodyLang.startsWith("en");
      return NextResponse.json(
        {
          id: `bot-${Date.now()}`,
          role: "bot",
          timestamp: Date.now(),
          text: isEn
            ? "I didn't receive a message. Could you try again?"
            : "No recibí un mensaje. ¿Podés intentar de nuevo?",
          quickReplies: isEn
            ? [{ label: "Try again", value: "Hello" }]
            : [{ label: "Reintentar", value: "Hola" }],
        },
        { status: 400 },
      );
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

    // ── Fetch live Google Places data when coords are available ──
    const livePlaces = coords ? await fetchLivePlaces(coords.lat, coords.lng) : null;

    if (emergency) {
      return NextResponse.json({
        id: `bot-${Date.now()}`,
        role: "bot",
        timestamp: Date.now(),
        ...processMessage(cleanMessage, coords, lang, livePlaces),
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

    const response = processMessage(cleanMessage, coords, lang, livePlaces);

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
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { processMessage, detectEmergency } from "@/lib/chatbot-engine";
import type { LivePlaces } from "@/lib/chatbot-engine";
import { askClaude, isClaudeConfigured } from "@/lib/ai/claude";
import { checkRateLimit, sanitize, logger } from "@/lib/security/api-guard";
import { nearbyPlacesSearch } from "@/lib/google";

/* ── Helper: enrich coverage responses with real data from /api/coverage ── */
async function enrichCoverageResponse(
  response: Record<string, unknown>,
  message: string,
  isEn: boolean,
): Promise<Record<string, unknown>> {
  // Detect if the user mentioned a specific provider
  const providerPatterns: Record<string, string> = {
    pami: "PAMI",
    osde: "OSDE",
    "swiss medical": "Swiss Medical",
    galeno: "Galeno",
    medife: "Medifé",
    "medif[eé]": "Medifé",
    "accord salud": "Accord Salud",
    "sancor salud": "Sancor Salud",
    sancor: "Sancor Salud",
  };

  const lower = message.toLowerCase();
  let matchedProvider: string | null = null;
  let displayName: string | null = null;

  for (const [pattern, name] of Object.entries(providerPatterns)) {
    if (lower.includes(pattern.replace(/\[.*?\]/g, ""))) {
      matchedProvider = pattern.replace(/\[.*?\]/g, "");
      displayName = name;
      break;
    }
  }

  if (!matchedProvider) return response;

  try {
    // Internal fetch to the coverage API (relative URL won't work server-side, call logic directly)
    const { isSupabaseConfigured } = await import("@/lib/env");
    let plans: Array<Record<string, unknown>> = [];

    if (isSupabaseConfigured()) {
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = createClient();
      const sb: { from: (table: string) => ReturnType<typeof supabase.from> } = supabase as never;

      const { data } = await sb
        .from("coverage_plans")
        .select("*")
        .or(`provider_group.ilike.%${matchedProvider}%,provider_name.ilike.%${matchedProvider}%`)
        .eq("active", true)
        .limit(5);

      if (data) plans = data as Array<Record<string, unknown>>;
    }

    if (plans.length > 0) {
      const plan = plans[0]!;
      const checks = [
        plan.covers_general && (isEn ? "✅ General consultations" : "✅ Consultas generales"),
        plan.covers_specialists && (isEn ? "✅ Specialists" : "✅ Especialistas"),
        plan.covers_emergency && (isEn ? "✅ Emergency room" : "✅ Guardia"),
        plan.covers_dental && (isEn ? "✅ Dental" : "✅ Odontología"),
        plan.covers_telemedicine && (isEn ? "✅ Telemedicine" : "✅ Teleconsulta"),
        plan.covers_medications && (isEn ? "✅ Medications" : "✅ Medicamentos"),
        plan.covers_mental_health && (isEn ? "✅ Mental health" : "✅ Salud mental"),
      ].filter(Boolean);

      const copayInfo = plan.copay_general
        ? isEn
          ? `Copay: ${plan.copay_general}`
          : `Coseguro: ${plan.copay_general}`
        : "";

      const notes = isEn ? (plan.notes_en ?? "") : (plan.notes_es ?? "");

      const text = isEn
        ? `Here's what ${displayName} covers:\n\n${checks.join("\n")}${copayInfo ? `\n\n${copayInfo}` : ""}${notes ? `\n\n${notes}` : ""}\n\nWant to find a doctor that accepts ${displayName}?`
        : `Esto es lo que cubre ${displayName}:\n\n${checks.join("\n")}${copayInfo ? `\n\n${copayInfo}` : ""}${notes ? `\n\n${notes}` : ""}\n\n¿Querés buscar un médico que acepte ${displayName}?`;

      const cards =
        plan.phone || plan.website
          ? [
              {
                title: displayName,
                body: isEn
                  ? "Contact your provider directly"
                  : "Contactá a tu obra social directamente",
                icon: "phone",
                ...(plan.phone
                  ? {
                      action: {
                        label: isEn ? `Call ${plan.phone}` : `Llamar al ${plan.phone}`,
                        url: `tel:${plan.phone}`,
                      },
                    }
                  : {}),
              },
            ]
          : undefined;

      return {
        ...response,
        text,
        cards,
        quickReplies: isEn
          ? [
              { label: "Search directory", value: "I want to see the doctor directory" },
              { label: "Different provider", value: "I want to check my insurance coverage" },
              { label: "Talk to someone", value: "I want to talk to an agent" },
            ]
          : [
              { label: "Buscar directorio", value: "Quiero ver el directorio médico" },
              { label: "Otra obra social", value: "Quiero consultar mi cobertura" },
              { label: "Hablar con alguien", value: "Quiero hablar con un agente" },
            ],
      };
    }
  } catch (err) {
    logger.warn({ err }, "Coverage enrichment failed, using default response");
  }

  return response;
}

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
        openNow: p.openNow ?? undefined,
      })),
      hospitals: rawHosps.map((p) => ({
        ...mapItem(p),
        emergency: true,
        openNow: p.openNow ?? undefined,
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
      triageContext,
    } = body as {
      message?: string;
      lat?: number;
      lng?: number;
      history?: { role: "user" | "assistant"; content: string }[];
      lang?: string;
      triageContext?: string;
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
        source: "rules" as const,
        isEmergency: true,
        ...processMessage(cleanMessage, coords, lang, livePlaces, triageContext),
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
          source: "ai" as const,
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

    const response = processMessage(cleanMessage, coords, lang, livePlaces, triageContext);

    // Enrich coverage responses with real data when available
    const isEn = typeof lang === "string" && lang.startsWith("en");
    const enriched = await enrichCoverageResponse(
      response as Record<string, unknown>,
      cleanMessage,
      isEn,
    );

    return NextResponse.json({
      id: `bot-${Date.now()}`,
      role: "bot",
      timestamp: Date.now(),
      source: "rules" as const,
      ...enriched,
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

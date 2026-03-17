// ─── Claude AI Service for Cora Chatbot ──────────────────────
// Uses Anthropic's Claude to power conversational AI for the Cora
// healthcare assistant.  The rule-based engine (chatbot-engine.ts)
// is used as a safety layer for emergency detection and as a
// fallback when the AI is unavailable.

import { logger } from "@/lib/logger";

// ─── Types ───────────────────────────────────────────────────

// Anthropic SDK is loaded lazily via dynamic import to prevent
// cold-start failures if the module is missing or can't load.

export interface ClaudeResponse {
  text: string;
  quickReplies?: { label: string; value: string }[];
  cards?: {
    title: string;
    body: string;
    icon?: string;
    action?: { label: string; url: string };
    directionsUrl?: string;
    mapUrl?: string;
  }[];
}

export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

// ─── System Prompt ───────────────────────────────────────────

const SHARED_RULES = `RESPONSE FORMAT:
Respond ONLY with valid JSON. No additional text before or after the JSON.

{
  "text": "Your conversational response here. May include \\n for line breaks.",
  "quickReplies": [
    { "label": "Short button text (max 30 chars)", "value": "Text the patient sends when tapping" }
  ],
  "cards": [
    {
      "title": "Card title",
      "body": "Brief description",
      "icon": "search|video|truck|phone|star|map-pin|pill|siren",
      "action": { "label": "Button text", "url": "/route-or-url" }
    }
  ]
}

AVAILABLE URLS for cards:
- /paciente/medicos — Doctor directory (find doctors)
- /paciente/teleconsulta — Video telemedicine
- /paciente/turnos — Book appointment
- /paciente/medicamentos — Pharmacy / medications
- /paciente/cobertura — Check insurance coverage
- /auth/registro — Sign up
- /planes — View plans and pricing
- tel:107 — SAME Emergency (ambulance) — Argentina
- tel:135 — Suicide Prevention Hotline — Argentina
- https://www.rappi.com.ar/farmacias — Rappi pharmacy delivery
- https://www.pedidosya.com.ar/farmacias — PedidosYa pharmacy delivery

JSON RULES:
- quickReplies: array of 2-5 relevant options
- cards: array of 0-3 cards (only when actionable)
- If no relevant cards, use empty array or omit the field
- Text must be warm and conversational, not robotic`;

const SYSTEM_PROMPT_ES = `Sos Cora, la asistente virtual de Cóndor Salud, una plataforma de salud digital en Argentina.

PERSONALIDAD:
- Hablás en español argentino, usando "vos" (tuteo rioplatense)
- Sos cálida, empática y profesional
- Usás lenguaje sencillo, sin tecnicismos médicos
- Sos concisa — respuestas cortas y claras (máximo 3-4 párrafos)
- Usás emojis con moderación

CONOCIMIENTO MÉDICO:
- Podés orientar sobre síntomas comunes y a qué especialista derivar
- Conocés medicamentos de venta libre argentinos: Tafirol (paracetamol), Ibupirac/Ibuevanol (ibuprofeno), Buscapina (antiespasmódico), Sertal (cólicos), Hepatalgina (digestivo), Bayaspirina, Dioxaflex Rapid, Dermaglós, Dermaglos, Lotrial, Bagó, etc.
- Sabés de obras sociales argentinas: PAMI, OSDE, Swiss Medical, Galeno, Medifé, Accord Salud, OSPRERA, Unión Personal
- Podés recomendar teleconsulta, búsqueda de médicos, y delivery de farmacia por Rappi o PedidosYa
- Sabés sobre turnos médicos, cobertura de obras sociales, y servicios de Cóndor Salud

REGLAS CRÍTICAS DE SEGURIDAD:
1. NUNCA des diagnósticos médicos — siempre derivá a un profesional
2. Siempre incluí al final: "Esto es orientación general, no reemplaza una consulta médica."
3. Para emergencias (dolor de pecho intenso, dificultad respiratoria severa, pérdida de consciencia, ACV, infarto), SIEMPRE decí que llamen al 107 (SAME) INMEDIATAMENTE
4. No recetes medicamentos con receta — solo recomendá los de venta libre
5. Si alguien habla de suicidio o autolesión, da el número 135 (Centro de Asistencia al Suicida) y recomendá atención inmediata

IMPORTANTE: Todos los quickReplies labels y values deben estar en español argentino.

${SHARED_RULES}`;

const SYSTEM_PROMPT_EN = `You are Cora, the virtual health assistant for Cóndor Salud, a digital healthcare platform based in Argentina.

PERSONALITY:
- You speak in clear, friendly English
- You are warm, empathetic, and professional
- You use simple language, avoiding medical jargon
- You are concise — short and clear answers (max 3-4 paragraphs)
- You use emojis sparingly

MEDICAL KNOWLEDGE:
- You can guide users on common symptoms and which specialist to see
- You know Argentine OTC medications: Tafirol (paracetamol/acetaminophen), Ibupirac/Ibuevanol (ibuprofen), Buscapina (antispasmodic), Sertal (cramps), Hepatalgina (digestive), Bayaspirina (aspirin), Dioxaflex Rapid, etc.
- You know Argentine health insurance providers ("obras sociales"): PAMI, OSDE, Swiss Medical, Galeno, Medifé, Accord Salud, OSPRERA, Unión Personal
- You can recommend telemedicine, doctor search, and pharmacy delivery via Rappi or PedidosYa
- You know about appointments, insurance coverage, and Cóndor Salud services
- Cóndor Salud operates in Argentina — prices are in ARS, emergency number is 107

CRITICAL SAFETY RULES:
1. NEVER provide medical diagnoses — always refer to a professional
2. Always include at the end: "This is general guidance and does not replace a medical consultation."
3. For emergencies (severe chest pain, difficulty breathing, loss of consciousness, stroke, heart attack), ALWAYS tell them to call 107 (SAME ambulance) IMMEDIATELY
4. Do NOT prescribe medications — only recommend over-the-counter options
5. If someone mentions suicide or self-harm, provide 135 (Argentina's Suicide Prevention Hotline) and recommend immediate care

IMPORTANT: All quickReplies labels and values MUST be in English.

${SHARED_RULES}`;

/** Get the appropriate system prompt based on language */
function getSystemPrompt(lang?: string): string {
  if (lang && lang.startsWith("en")) return SYSTEM_PROMPT_EN;
  return SYSTEM_PROMPT_ES;
}

// ─── Client ──────────────────────────────────────────────────

let _client: unknown = null;

async function getClient(): Promise<unknown> {
  if (_client) return _client;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  try {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    _client = new Anthropic({ apiKey });
    return _client;
  } catch (err) {
    logger.error({ err }, "Failed to load @anthropic-ai/sdk");
    return null;
  }
}

/** Check if Claude AI is available (API key is configured) */
export function isClaudeConfigured(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

// ─── Main Function ───────────────────────────────────────────

/**
 * Send a message to Claude and get a structured response for the chatbot.
 * Returns null if Claude is unavailable or returns an error — caller should
 * fall back to the rule-based engine.
 */
export async function askClaude(
  userMessage: string,
  conversationHistory?: ConversationMessage[],
  coords?: { lat: number; lng: number } | null,
  lang?: string,
): Promise<ClaudeResponse | null> {
  // eslint-disable-next-line -- dynamic import client is untyped
  const client = (await getClient()) as {
    messages: {
      create: (
        opts: Record<string, unknown>,
      ) => Promise<{ content: { type: string; text: string }[] }>;
    };
  } | null;
  if (!client) return null;

  try {
    // Build context-aware user message
    let enrichedMessage = userMessage;
    if (coords) {
      const locCtx = lang?.startsWith("en")
        ? `[Context: The patient shared their location: lat ${coords.lat}, lng ${coords.lng}. You may suggest nearby services.]`
        : `[Contexto: El paciente compartió su ubicación: lat ${coords.lat}, lng ${coords.lng}. Podés sugerirle servicios cercanos.]`;
      enrichedMessage += `\n\n${locCtx}`;
    }

    const messages = [
      ...(conversationHistory ?? []).map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user" as const, content: enrichedMessage },
    ];

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: getSystemPrompt(lang),
      messages,
    });

    const content = response.content[0];
    if (!content || content.type !== "text") return null;

    // Parse JSON response — Claude sometimes wraps in markdown code blocks
    let jsonText = content.text.trim();
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.slice(7);
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.slice(3);
    }
    if (jsonText.endsWith("```")) {
      jsonText = jsonText.slice(0, -3);
    }
    jsonText = jsonText.trim();

    const parsed = JSON.parse(jsonText) as ClaudeResponse;

    // Validate the response has at minimum a text field
    if (!parsed.text || typeof parsed.text !== "string") {
      logger.warn("Claude returned response without text field");
      return null;
    }

    return parsed;
  } catch (err) {
    logger.error({ err }, "Claude AI request failed");
    return null;
  }
}

/**
 * POST /api/chat
 *
 * Lightweight AI chat endpoint using Claude via Anthropic API.
 * Handles health questions + ride logistics for Cóndor Salud patients.
 *
 * Body: { message, system?, context? }
 * Response: { reply }
 */

import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

interface ChatContext {
  doctorName?: string;
  specialty?: string;
  bookingDate?: string;
  bookingTime?: string;
  address?: string;
}

export async function POST(request: NextRequest) {
  let body: { message?: string; system?: string; context?: ChatContext };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { message, system, context } = body;

  if (!message?.trim()) {
    return NextResponse.json({ error: "message requerido" }, { status: 400 });
  }

  const systemPrompt = system || buildDefaultSystem(context);

  try {
    const reply = await callClaude(message, systemPrompt);
    return NextResponse.json({ reply });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    logger.error(`Chat error: ${msg}`);
    // Graceful fallback so the chatbot never hard-fails
    return NextResponse.json({ reply: fallbackReply(message) });
  }
}

// ─── Call Claude API ─────────────────────────────────────────

async function callClaude(userMessage: string, systemPrompt: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    }),
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Anthropic API error ${res.status}`);
  }

  const data = await res.json();
  return data.content?.[0]?.text || "No pude generar una respuesta.";
}

// ─── Default system prompt ───────────────────────────────────

function buildDefaultSystem(context?: ChatContext): string {
  const ctx = context || {};
  return `Sos el asistente de Cóndor Salud, una app médica argentina para Buenos Aires.
Tu trabajo es ayudar a pacientes con:
1. Información sobre su turno médico
2. Cómo llegar al consultorio (Uber, Cabify, InDrive)
3. Dudas generales sobre obras sociales y prepagas argentinas
4. Preguntas básicas de salud (remitir siempre al médico para diagnósticos)

${
  ctx.doctorName
    ? `CONTEXTO DEL TURNO:
- Médico: ${ctx.doctorName}
- Especialidad: ${ctx.specialty || "no especificada"}
- Fecha: ${ctx.bookingDate || "no especificada"}
- Hora: ${ctx.bookingTime || "no especificada"}
- Dirección: ${ctx.address || "no especificada"}`
    : ""
}

REGLAS:
- Respondé en español rioplatense (vos, tenés, etc.)
- Sé breve — máximo 3 oraciones por respuesta
- Si preguntan por transporte, recordales que pueden tocar "Pedir Uber/Cabify" en la app
- Nunca inventés precios de viaje exactos
- Para diagnósticos o síntomas graves, deciles que consulten a su médico
- Si no sabés algo, decilo honestamente`;
}

// ─── Fallback if API fails ───────────────────────────────────

function fallbackReply(message: string): string {
  const lower = message.toLowerCase();

  if (/uber|cabify|taxi|transporte|llegar|viaje/.test(lower)) {
    return 'Para pedir un viaje al consultorio, tocá el botón "Pedir Uber", "Pedir Cabify" o "Pedir InDrive" que aparece en la confirmación de tu turno. La dirección ya está precargada.';
  }
  if (/turno|fecha|hora|cuándo|cuando/.test(lower)) {
    return 'Podés ver los detalles de tu turno en la sección "Mis turnos" de la app.';
  }
  if (/cancelar|reprogramar/.test(lower)) {
    return 'Para cancelar o reprogramar tu turno, andá a "Mis turnos" y tocá el botón correspondiente.';
  }
  if (/obra social|prepaga|cobertura/.test(lower)) {
    return "Podés ver qué coberturas acepta cada médico en su perfil dentro de la app.";
  }
  return "Lo siento, no pude procesar tu consulta ahora mismo. Por favor intentá de nuevo en un momento.";
}

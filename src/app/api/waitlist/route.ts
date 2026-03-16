import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, sanitize, logger } from "@/lib/security/api-guard";
import { isSupabaseConfigured } from "@/lib/env";

// S-10: Persist to Supabase when configured; log as structured fallback.

export async function POST(request: NextRequest) {
  // ── Rate limit: 5 req / 60s per IP ──
  const limited = checkRateLimit(request, "waitlist", { limit: 5, windowSec: 60 });
  if (limited) return limited;

  try {
    const body = await request.json();
    const email = sanitize(body.email || "", 254);

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email es requerido" }, { status: 400 });
    }

    // Strict email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    }

    // ── Persist to Supabase if configured ──
    if (isSupabaseConfigured()) {
      try {
        const { createClient } = await import("@/lib/supabase/server");
        const supabase = createClient();
        const { error: dbError } = await supabase
          .from("waitlist")
          .upsert({ email, source: "landing" }, { onConflict: "email" });

        if (dbError) {
          logger.error({ err: dbError, route: "waitlist" }, "Supabase waitlist insert failed");
        } else {
          logger.info({ route: "waitlist" }, "Waitlist signup persisted to Supabase");
        }
      } catch (err) {
        logger.error({ err, route: "waitlist" }, "Supabase waitlist error");
      }
    } else {
      // Structured log fallback — persists in log aggregator (Vercel, Sentry, etc.)
      logger.info(
        { email, route: "waitlist", action: "signup" },
        "Waitlist signup (logged, no DB configured)",
      );
    }

    return NextResponse.json({ message: "¡Listo! Te contactamos pronto." }, { status: 201 });
  } catch (err) {
    logger.error({ err, route: "waitlist" }, "Waitlist error");
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

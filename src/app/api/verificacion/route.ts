// ─── Verificación de Cobertura API Route ─────────────────────
// GET /api/verificacion?dni=12345678
// GET /api/verificacion?status=providers  (returns provider health)
//
// Multi-source lookup chain:
//   1. Supabase cache (24h TTL)
//   2. SISA / PUCO (Ministerio de Salud)
//   3. PAMI Prestadores
//   4. Clinic DB (pacientes table)
//   5. Demo fallback (only in demo mode)
//   6. "Not found" — honest response
//
// No more fake data for unknown DNIs.

import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, sanitize, logger } from "@/lib/security/api-guard";
import { requireAuth } from "@/lib/security/require-auth";
import { isSupabaseConfigured } from "@/lib/env";
import { lookupCoverage, getProviderStatus, normalizeDni } from "@/lib/services/coverage-providers";

function getServiceClient() {
  const { createClient } = require("@supabase/supabase-js");
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;

  const limited = checkRateLimit(request, "verificacion", { limit: 20, windowSec: 60 });
  if (limited) return limited;

  // ── Provider status endpoint ──────────────────────────────
  const statusParam = request.nextUrl.searchParams.get("status");
  if (statusParam === "providers") {
    const status = await getProviderStatus();
    return NextResponse.json({ providers: status });
  }

  // ── DNI / CUIL lookup ─────────────────────────────────────
  const rawDni = request.nextUrl.searchParams.get("dni") ?? "";
  const dni = normalizeDni(sanitize(rawDni, 20));

  if (!dni || dni.length < 6) {
    return NextResponse.json({ error: "DNI inválido (mínimo 6 dígitos)" }, { status: 400 });
  }

  // CUIL support: 11 digits is a CUIL, 7-8 is DNI — both accepted
  if (dni.length > 8 && dni.length !== 11) {
    return NextResponse.json(
      { error: "Formato inválido. Ingrese DNI (7-8 dígitos) o CUIL (11 dígitos)" },
      { status: 400 },
    );
  }

  try {
    const isDemo =
      request.headers.get("x-demo-mode") === "true" ||
      request.nextUrl.searchParams.get("demo") === "true" ||
      Boolean(auth.user?.email?.includes("demo"));

    const supabase = isSupabaseConfigured() ? getServiceClient() : undefined;

    const result = await lookupCoverage(dni, {
      supabase,
      clinicId: auth.user.clinicId,
      isDemo,
    });

    logger.info(
      {
        route: "verificacion",
        dni: dni.slice(0, 3) + "***",
        source: result.source,
        status: result.status,
      },
      "Coverage lookup completed",
    );

    return NextResponse.json({ result });
  } catch (err) {
    logger.error({ err, route: "verificacion" }, "Coverage verification error");
    return NextResponse.json({ error: "Error consultando cobertura" }, { status: 500 });
  }
}

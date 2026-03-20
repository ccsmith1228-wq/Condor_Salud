// POST /api/patients/register
// POST /api/patients/login

import { NextRequest, NextResponse } from "next/server";
import * as patientAuth from "@/lib/services/patient-auth";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const body = await request.json();

    // Determine action from query param or path
    const action = url.searchParams.get("action") || "login";

    if (action === "register") {
      const { email, password, name, phone } = body;

      if (!email || !password || !name) {
        return NextResponse.json(
          { error: "Email, contraseña y nombre son obligatorios" },
          { status: 400 },
        );
      }

      if (password.length < 6) {
        return NextResponse.json(
          { error: "La contraseña debe tener al menos 6 caracteres" },
          { status: 400 },
        );
      }

      const result = await patientAuth.register({ email, password, name, phone });
      return NextResponse.json(result, { status: 201 });
    }

    // Default: login
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña son obligatorios" }, { status: 400 });
    }

    const result = await patientAuth.login({ email, password });
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error interno";
    logger.error({ err }, "Patient auth error");
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

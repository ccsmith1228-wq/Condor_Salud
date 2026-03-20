// POST /api/patients/login

import { NextRequest, NextResponse } from "next/server";
import * as patientAuth from "@/lib/services/patient-auth";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña son obligatorios" }, { status: 400 });
    }

    const result = await patientAuth.login({ email, password });
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error interno";
    logger.error({ err }, "Patient login error");
    return NextResponse.json({ error: message }, { status: 401 });
  }
}

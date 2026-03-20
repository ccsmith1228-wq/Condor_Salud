// POST /api/patients/register

import { NextRequest, NextResponse } from "next/server";
import * as patientAuth from "@/lib/services/patient-auth";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, phone } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, contraseña y nombre son obligatorios" },
        { status: 400 },
      );
    }

    if (typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 },
      );
    }

    const result = await patientAuth.register({ email, password, name, phone });
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error interno";
    logger.error({ err }, "Patient register error");
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

// GET  /api/patients/me  — get current patient profile
// PUT  /api/patients/me  — update current patient profile

import { NextRequest, NextResponse } from "next/server";
import { requirePatientAuth } from "@/lib/security/jwt-auth";
import * as patientAuth from "@/lib/services/patient-auth";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const auth = await requirePatientAuth(request);
  if (auth.error) return auth.error;

  try {
    const patient = await patientAuth.getById(auth.user.id);
    if (!patient) {
      return NextResponse.json({ error: "Paciente no encontrado" }, { status: 404 });
    }
    return NextResponse.json(patient);
  } catch (err) {
    logger.error({ err }, "Get patient profile error");
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requirePatientAuth(request);
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const patient = await patientAuth.updateProfile(auth.user.id, body);
    if (!patient) {
      return NextResponse.json({ error: "Paciente no encontrado" }, { status: 404 });
    }
    return NextResponse.json(patient);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error interno";
    logger.error({ err }, "Update patient profile error");
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

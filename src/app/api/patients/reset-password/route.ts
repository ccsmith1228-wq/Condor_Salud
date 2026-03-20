// POST /api/patients/reset-password/request
// POST /api/patients/reset-password/confirm

import { NextRequest, NextResponse } from "next/server";
import * as patientAuth from "@/lib/services/patient-auth";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const url = new URL(request.url);

    // Determine if this is a request or confirm based on body fields
    if (body.token && body.password) {
      // Confirm reset
      const result = await patientAuth.resetPassword({
        token: body.token,
        password: body.password,
      });
      return NextResponse.json(result);
    }

    if (body.email) {
      // Request reset
      const result = await patientAuth.requestPasswordReset(body.email);
      return NextResponse.json(result);
    }

    return NextResponse.json(
      { error: "Proporcione email (solicitar) o token+password (confirmar)" },
      { status: 400 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error interno";
    logger.error({ err }, "Password reset error");
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

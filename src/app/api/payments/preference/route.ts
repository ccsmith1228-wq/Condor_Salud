// POST /api/payments/preference — create MercadoPago checkout preference

import { NextRequest, NextResponse } from "next/server";
import { requireAnyAuth } from "@/lib/security/jwt-auth";
import * as mpService from "@/lib/services/mercadopago";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const auth = await requireAnyAuth(request);
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const { bookingId, doctorId, doctorName, consultationFee, description } = body;

    if (!bookingId || !doctorId || !consultationFee) {
      return NextResponse.json(
        { error: "bookingId, doctorId y consultationFee son obligatorios" },
        { status: 400 },
      );
    }

    const result = await mpService.createPreference({
      bookingId,
      doctorId,
      doctorName: doctorName || "Médico",
      patientEmail: auth.user.email,
      consultationFee: Number(consultationFee),
      description,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    logger.error({ err }, "Create payment preference error");
    return NextResponse.json({ error: "Error al crear preferencia de pago" }, { status: 500 });
  }
}

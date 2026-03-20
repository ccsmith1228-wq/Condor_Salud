// GET  /api/payments/booking/[bookingId] — get payment for a booking
// POST /api/payments/booking/[bookingId]/refund — refund a payment

import { NextRequest, NextResponse } from "next/server";
import { requireAnyAuth, requireDoctorAuth } from "@/lib/security/jwt-auth";
import * as mpService from "@/lib/services/mercadopago";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

export async function GET(request: NextRequest, { params }: { params: { bookingId: string } }) {
  const auth = await requireAnyAuth(request);
  if (auth.error) return auth.error;

  try {
    const payment = await mpService.getPaymentForBooking(params.bookingId);
    if (!payment) {
      return NextResponse.json({ error: "Pago no encontrado" }, { status: 404 });
    }
    return NextResponse.json(payment);
  } catch (err) {
    logger.error({ err }, "Get payment error");
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { bookingId: string } }) {
  // Only doctors can refund
  const auth = await requireDoctorAuth(request);
  if (auth.error) return auth.error;

  try {
    const result = await mpService.refundPayment(params.bookingId);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true, message: "Pago reembolsado" });
  } catch (err) {
    logger.error({ err }, "Refund error");
    return NextResponse.json({ error: "Error al procesar el reembolso" }, { status: 500 });
  }
}

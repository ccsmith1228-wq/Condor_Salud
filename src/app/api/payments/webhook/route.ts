// POST /api/payments/webhook — MercadoPago webhook (public endpoint)
// Must return 200 immediately. Processing is async.

import { NextRequest, NextResponse } from "next/server";
import * as mpService from "@/lib/services/mercadopago";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  // Respond 200 immediately as required by MercadoPago
  const xSignature = request.headers.get("x-signature");
  const xRequestId = request.headers.get("x-request-id");

  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
  } catch {
    logger.warn("MercadoPago webhook: invalid JSON body");
    return NextResponse.json({ ok: true });
  }

  // Process asynchronously (don't await)
  mpService.handleWebhook(body, xSignature, xRequestId).catch((err) => {
    logger.error({ err }, "MercadoPago webhook processing error");
  });

  return NextResponse.json({ ok: true });
}

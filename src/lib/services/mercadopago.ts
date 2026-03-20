// ─── MercadoPago Service ─────────────────────────────────────
// Payment preferences, webhook handling, and refunds via
// MercadoPago SDK v2.  Ported from backend/src/services/MercadoPagoService.js.
//
// Stores payment records in Firestore "payments" collection.

import { MercadoPagoConfig, Preference, Payment, PaymentRefund } from "mercadopago";
import { createHmac } from "crypto";
import { logger } from "@/lib/logger";
import * as firestore from "@/lib/services/firestore";
import * as emailService from "@/lib/services/email-sendgrid";

// ─── SDK client ──────────────────────────────────────────────

function getClient(): MercadoPagoConfig {
  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) throw new Error("MP_ACCESS_TOKEN not configured");
  return new MercadoPagoConfig({ accessToken });
}

const WEBHOOK_SECRET = () => process.env.MP_WEBHOOK_SECRET || "";
const FRONTEND_URL = () =>
  process.env.NEXT_PUBLIC_APP_URL || process.env.FRONTEND_URL || "http://localhost:3000";

// ─── Types ───────────────────────────────────────────────────

export interface PaymentRecord {
  id: string;
  bookingId: string;
  doctorId: string;
  patientEmail: string;
  preferenceId: string;
  externalRef: string;
  amount: number; // centavos
  currency: string;
  status: "pending" | "approved" | "rejected" | "refunded" | "cancelled";
  initPoint: string;
  sandboxPoint: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

// ─── Create a checkout preference ────────────────────────────

export async function createPreference(input: {
  bookingId: string;
  doctorId: string;
  doctorName: string;
  patientEmail: string;
  consultationFee: number; // in ARS (whole units, e.g. 5000)
  description?: string;
}): Promise<{
  preferenceId: string;
  initPoint: string;
  sandboxPoint: string;
}> {
  const client = getClient();
  const preference = new Preference(client);
  const externalRef = `booking_${input.bookingId}_${Date.now()}`;

  const result = await preference.create({
    body: {
      items: [
        {
          id: input.bookingId,
          title: input.description || `Consulta médica — Dr. ${input.doctorName}`,
          quantity: 1,
          unit_price: input.consultationFee,
          currency_id: "ARS",
        },
      ],
      payer: { email: input.patientEmail },
      external_reference: externalRef,
      back_urls: {
        success: `${FRONTEND_URL()}/paciente/pagos/exito`,
        failure: `${FRONTEND_URL()}/paciente/pagos/fallo`,
        pending: `${FRONTEND_URL()}/paciente/pagos/pendiente`,
      },
      auto_return: "approved",
      notification_url: `${FRONTEND_URL()}/api/payments/webhook`,
    },
  });

  // Store payment record in Firestore
  const paymentId = `pay_${input.bookingId}_${Date.now()}`;
  await firestore.createDoc(firestore.Collections.PAYMENTS, paymentId, {
    bookingId: input.bookingId,
    doctorId: input.doctorId,
    patientEmail: input.patientEmail,
    preferenceId: result.id || "",
    externalRef,
    amount: input.consultationFee * 100, // store in centavos
    currency: "ARS",
    status: "pending",
    initPoint: result.init_point || "",
    sandboxPoint: result.sandbox_init_point || "",
  });

  logger.info(
    { bookingId: input.bookingId, preferenceId: result.id },
    "MercadoPago preference created",
  );

  return {
    preferenceId: result.id || "",
    initPoint: result.init_point || "",
    sandboxPoint: result.sandbox_init_point || "",
  };
}

// ─── Webhook handler ─────────────────────────────────────────

export async function handleWebhook(
  body: Record<string, unknown>,
  xSignature: string | null,
  xRequestId: string | null,
): Promise<{ ok: boolean }> {
  // Verify HMAC signature if webhook secret is configured
  const secret = WEBHOOK_SECRET();
  if (secret && xSignature) {
    const parts: Record<string, string> = {};
    (xSignature || "").split(",").forEach((part) => {
      const [k, v] = part.trim().split("=");
      if (k && v) parts[k] = v;
    });

    const ts = parts["ts"] || "";
    const hash = parts["v1"] || "";
    const dataId = (body.data as Record<string, unknown>)?.id || "";

    const manifest = `id:${dataId};request-id:${xRequestId || ""};ts:${ts};`;
    const expected = createHmac("sha256", secret).update(manifest).digest("hex");

    if (hash !== expected) {
      logger.warn("MercadoPago webhook signature mismatch");
      return { ok: false };
    }
  }

  const type = body.type as string;
  if (type !== "payment") {
    logger.info({ type }, "Ignoring non-payment webhook");
    return { ok: true };
  }

  const paymentId = String((body.data as Record<string, unknown>)?.id || "");
  if (!paymentId) return { ok: false };

  try {
    const client = getClient();
    const payment = new Payment(client);
    const mpPayment = await payment.get({ id: paymentId });

    const externalRef = mpPayment.external_reference || "";
    const status = mpPayment.status as string;

    // Find our payment record by externalRef
    const record = await firestore.queryOne(
      firestore.Collections.PAYMENTS,
      "externalRef",
      "==",
      externalRef,
    );

    if (!record) {
      logger.warn({ externalRef }, "Payment record not found for webhook");
      return { ok: false };
    }

    // Update payment status
    await firestore.updateDoc(firestore.Collections.PAYMENTS, record.id as string, {
      status: status === "approved" ? "approved" : status === "rejected" ? "rejected" : status,
      mpPaymentId: paymentId,
      mpStatus: status,
    });

    if (status === "approved") {
      await onPaymentApproved(record as unknown as PaymentRecord);
    } else if (status === "rejected" || status === "cancelled") {
      await onPaymentFailed(record as unknown as PaymentRecord);
    }

    logger.info({ paymentId, status, externalRef }, "Webhook processed");
    return { ok: true };
  } catch (err) {
    logger.error({ err, paymentId }, "Webhook processing failed");
    return { ok: false };
  }
}

// ─── Internal: payment approved ──────────────────────────────

async function onPaymentApproved(record: PaymentRecord): Promise<void> {
  // Auto-confirm the booking
  try {
    const booking = await firestore.getDoc(firestore.Collections.BOOKINGS, record.bookingId);
    if (booking) {
      await firestore.updateDoc(firestore.Collections.BOOKINGS, record.bookingId, {
        status: "confirmed",
        paymentStatus: "paid",
      });
    }
  } catch (err) {
    logger.error({ err, bookingId: record.bookingId }, "Failed to confirm booking on payment");
  }

  // Send receipt email
  try {
    const doctor = await firestore.getDoc(firestore.Collections.DOCTORS, record.doctorId);
    await emailService.sendPaymentReceipt({
      patientEmail: record.patientEmail,
      patientName: record.patientEmail, // will be overridden if patient record exists
      doctorName: (doctor?.name as string) || "Médico",
      amount: record.amount,
      currency: record.currency,
      paymentId: record.id,
      date: new Date(),
    });
  } catch (err) {
    logger.error({ err }, "Failed to send payment receipt email");
  }
}

// ─── Internal: payment failed ────────────────────────────────

async function onPaymentFailed(record: PaymentRecord): Promise<void> {
  try {
    await firestore.updateDoc(firestore.Collections.BOOKINGS, record.bookingId, {
      paymentStatus: "failed",
    });
  } catch (err) {
    logger.error(
      { err, bookingId: record.bookingId },
      "Failed to update booking on payment failure",
    );
  }
}

// ─── Get payment for booking ─────────────────────────────────

export async function getPaymentForBooking(bookingId: string): Promise<PaymentRecord | null> {
  const doc = await firestore.queryOne(
    firestore.Collections.PAYMENTS,
    "bookingId",
    "==",
    bookingId,
  );
  return doc as unknown as PaymentRecord | null;
}

// ─── Refund ──────────────────────────────────────────────────

export async function refundPayment(
  bookingId: string,
): Promise<{ success: boolean; error?: string }> {
  const record = await getPaymentForBooking(bookingId);
  if (!record) {
    return { success: false, error: "Pago no encontrado" };
  }

  if (record.status !== "approved") {
    return { success: false, error: "Solo se pueden reembolsar pagos aprobados" };
  }

  const mpPaymentId = (record as unknown as Record<string, unknown>).mpPaymentId as string;
  if (!mpPaymentId) {
    return { success: false, error: "ID de pago de MercadoPago no disponible" };
  }

  try {
    const client = getClient();
    const paymentRefund = new PaymentRefund(client);
    await paymentRefund.create({ payment_id: Number(mpPaymentId) });

    await firestore.updateDoc(firestore.Collections.PAYMENTS, record.id, {
      status: "refunded",
    });

    await firestore.updateDoc(firestore.Collections.BOOKINGS, bookingId, {
      paymentStatus: "refunded",
    });

    logger.info({ bookingId, mpPaymentId }, "Payment refunded");
    return { success: true };
  } catch (err) {
    logger.error({ err, bookingId }, "Refund failed");
    return { success: false, error: "Error al procesar el reembolso" };
  }
}

// ─── Availability check ─────────────────────────────────────

export function isMercadoPagoConfigured(): boolean {
  return !!process.env.MP_ACCESS_TOKEN;
}

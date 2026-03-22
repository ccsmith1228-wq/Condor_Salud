import { NextRequest, NextResponse } from "next/server";
import { handleSubscriptionWebhook } from "@/lib/services/seat-billing";

/**
 * POST /api/billing/webhook
 * MercadoPago PreApproval webhook handler.
 * Processes subscription status changes and auto-downgrades lapsed subscriptions.
 *
 * Note: In production, verify the webhook signature using MP_WEBHOOK_SECRET.
 */
export async function POST(req: NextRequest) {
  try {
    // MercadoPago sends raw JSON body
    const body = (await req.json()) as {
      type?: string;
      data?: { id?: string };
      action?: string;
    };

    // Only handle preapproval events
    if (body.type !== "preapproval" && body.type !== "subscription_preapproval") {
      return NextResponse.json({ received: true });
    }

    const subscriptionId = body.data?.id;
    if (!subscriptionId) {
      return NextResponse.json({ error: "Missing subscription ID" }, { status: 400 });
    }

    // In production: fetch the PreApproval from MercadoPago to get current status
    // const mp = new MercadoPago(process.env.MP_ACCESS_TOKEN);
    // const preapproval = await mp.preapproval.get({ id: subscriptionId });
    // const status = preapproval.status; // "authorized", "paused", "cancelled", "pending"

    const status = body.action || "authorized";
    await handleSubscriptionWebhook(subscriptionId, status);

    return NextResponse.json({ received: true, processed: true });
  } catch (err) {
    console.error("[Billing Webhook] Error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

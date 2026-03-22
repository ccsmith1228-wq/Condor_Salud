import { NextRequest, NextResponse } from "next/server";
import { getSeatPlan, upgradeToPlan, type SeatPlanId } from "@/lib/services/seat-billing";

/**
 * POST /api/billing/subscribe
 * Create a MercadoPago PreApproval subscription for a doctor.
 * Body: { doctorId, plan, billingCycle }
 *
 * In production, this would create a MercadoPago PreApproval and return
 * the init_point URL for the doctor to complete payment.
 * For now, it creates the subscription record directly.
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      doctorId?: string;
      plan?: SeatPlanId;
      billingCycle?: "monthly" | "annual";
    };

    if (!body.doctorId || !body.plan || !body.billingCycle) {
      return NextResponse.json(
        { error: "doctorId, plan, and billingCycle are required" },
        { status: 400 },
      );
    }

    const planDef = getSeatPlan(body.plan);
    if (planDef.price === 0) {
      return NextResponse.json({ error: "Cannot subscribe to free plan" }, { status: 400 });
    }

    // In production: create MercadoPago PreApproval
    // const mp = new MercadoPago(process.env.MP_ACCESS_TOKEN);
    // const preapproval = await mp.preapproval.create({ ... });

    // For now, simulate the subscription
    const subscriptionId = `sub_${Date.now()}_${body.doctorId}`;
    const record = await upgradeToPlan(
      body.doctorId,
      body.plan,
      body.billingCycle,
      subscriptionId,
      planDef.trialDays,
    );

    return NextResponse.json({
      success: true,
      subscriptionId,
      record,
      // In production: initPoint: preapproval.init_point
      initPoint: `/planes?subscribed=${body.plan}`,
      trialDays: planDef.trialDays,
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 });
  }
}

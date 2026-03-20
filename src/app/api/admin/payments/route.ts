// GET /api/admin/payments — paginated payment list with summary

import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/security/jwt-auth";
import { db, Collections } from "@/lib/services/firestore";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth(request);
  if (auth.error) return auth.error;

  try {
    const params = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(params.get("page") || "1"));
    const limit = Math.min(50, parseInt(params.get("limit") || "20"));

    const snap = await db()
      .collection(Collections.PAYMENTS)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .offset((page - 1) * limit)
      .get();

    const payments = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    // Summary: total approved amount
    const approvedSnap = await db()
      .collection(Collections.PAYMENTS)
      .where("status", "==", "approved")
      .get();

    let totalApproved = 0;
    approvedSnap.docs.forEach((d) => {
      totalApproved += (d.data().amount as number) || 0;
    });

    return NextResponse.json({
      data: payments,
      page,
      limit,
      count: payments.length,
      summary: {
        totalApproved, // in centavos
        totalApprovedFormatted: `ARS ${(totalApproved / 100).toLocaleString("es-AR")}`,
        approvedCount: approvedSnap.size,
      },
    });
  } catch (err) {
    logger.error({ err }, "Admin list payments error");
    return NextResponse.json({ error: "Error al listar pagos" }, { status: 500 });
  }
}

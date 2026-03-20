// GET /api/admin/bookings — paginated, filter by status/date

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
    const status = params.get("status");
    const dateFrom = params.get("dateFrom");
    const dateTo = params.get("dateTo");

    let query = db().collection(Collections.BOOKINGS).orderBy("createdAt", "desc");

    if (status) {
      query = query.where("status", "==", status) as typeof query;
    }
    if (dateFrom) {
      query = query.where("date", ">=", dateFrom) as typeof query;
    }
    if (dateTo) {
      query = query.where("date", "<=", dateTo) as typeof query;
    }

    const snap = await query
      .limit(limit)
      .offset((page - 1) * limit)
      .get();
    const bookings = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    return NextResponse.json({
      data: bookings,
      page,
      limit,
      count: bookings.length,
    });
  } catch (err) {
    logger.error({ err }, "Admin list bookings error");
    return NextResponse.json({ error: "Error al listar turnos" }, { status: 500 });
  }
}

// GET /api/admin/doctors — paginated doctor list (filter by verified)
// PUT /api/admin/doctors — handled by [id] routes below

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
    const verified = params.get("verified"); // "true", "false", or null (all)

    let query = db().collection(Collections.DOCTORS).orderBy("createdAt", "desc");

    if (verified === "true") {
      query = query.where("verified", "==", true) as typeof query;
    } else if (verified === "false") {
      query = query.where("verified", "==", false) as typeof query;
    }

    const snap = await query
      .limit(limit)
      .offset((page - 1) * limit)
      .get();
    const doctors = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    return NextResponse.json({
      data: doctors,
      page,
      limit,
      count: doctors.length,
    });
  } catch (err) {
    logger.error({ err }, "Admin list doctors error");
    return NextResponse.json({ error: "Error al listar médicos" }, { status: 500 });
  }
}

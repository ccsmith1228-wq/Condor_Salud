// GET /api/admin/reviews          — get flagged reviews
// PUT /api/admin/reviews/[id]/approve — approve a review
// PUT /api/admin/reviews/[id]/remove  — remove a review

import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/security/jwt-auth";
import { db, Collections } from "@/lib/services/firestore";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth(request);
  if (auth.error) return auth.error;

  try {
    const snap = await db()
      .collection(Collections.REVIEWS)
      .where("flagged", "==", true)
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();

    const reviews = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ data: reviews });
  } catch (err) {
    logger.error({ err }, "Admin flagged reviews error");
    return NextResponse.json({ error: "Error al listar reseñas" }, { status: 500 });
  }
}

// PUT /api/admin/reviews/[id]/[action] — approve or remove a review

import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/security/jwt-auth";
import * as firestore from "@/lib/services/firestore";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; action: string } },
) {
  const auth = await requireAdminAuth(request);
  if (auth.error) return auth.error;

  const { id, action } = params;

  try {
    const review = await firestore.getDoc(firestore.Collections.REVIEWS, id);
    if (!review) {
      return NextResponse.json({ error: "Reseña no encontrada" }, { status: 404 });
    }

    if (action === "approve") {
      await firestore.updateDoc(firestore.Collections.REVIEWS, id, {
        flagged: false,
        approved: true,
        moderatedAt: new Date().toISOString(),
      });
      return NextResponse.json({ success: true, message: "Reseña aprobada" });
    }

    if (action === "remove") {
      await firestore.removeDoc(firestore.Collections.REVIEWS, id);
      return NextResponse.json({ success: true, message: "Reseña eliminada" });
    }

    return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
  } catch (err) {
    logger.error({ err, id, action }, "Admin review action error");
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

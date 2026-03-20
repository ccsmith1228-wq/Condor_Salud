// GET /api/admin/stats — aggregate counts across all collections

import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/security/jwt-auth";
import { db, Collections } from "@/lib/services/firestore";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth(request);
  if (auth.error) return auth.error;

  try {
    const [doctorsSnap, patientsSnap, bookingsSnap, paymentsSnap, reviewsSnap] = await Promise.all([
      db().collection(Collections.DOCTORS).count().get(),
      db().collection(Collections.PATIENTS).count().get(),
      db().collection(Collections.BOOKINGS).count().get(),
      db().collection(Collections.PAYMENTS).count().get(),
      db().collection(Collections.REVIEWS).count().get(),
    ]);

    return NextResponse.json({
      doctors: doctorsSnap.data().count,
      patients: patientsSnap.data().count,
      bookings: bookingsSnap.data().count,
      payments: paymentsSnap.data().count,
      reviews: reviewsSnap.data().count,
    });
  } catch (err) {
    logger.error({ err }, "Admin stats error");
    return NextResponse.json({ error: "Error al obtener estadísticas" }, { status: 500 });
  }
}

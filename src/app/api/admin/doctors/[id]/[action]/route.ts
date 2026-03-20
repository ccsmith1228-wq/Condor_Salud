// PUT /api/admin/doctors/[id]/verify  — verify a doctor
// PUT /api/admin/doctors/[id]/suspend — suspend a doctor

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
    const doctor = await firestore.getDoc(firestore.Collections.DOCTORS, id);
    if (!doctor) {
      return NextResponse.json({ error: "Médico no encontrado" }, { status: 404 });
    }

    if (action === "verify") {
      await firestore.updateDoc(firestore.Collections.DOCTORS, id, {
        verified: true,
        verifiedAt: new Date().toISOString(),
      });
      return NextResponse.json({ success: true, message: "Médico verificado" });
    }

    if (action === "suspend") {
      await firestore.updateDoc(firestore.Collections.DOCTORS, id, {
        suspended: true,
        suspendedAt: new Date().toISOString(),
      });
      return NextResponse.json({ success: true, message: "Médico suspendido" });
    }

    return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
  } catch (err) {
    logger.error({ err, id, action }, "Admin doctor action error");
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

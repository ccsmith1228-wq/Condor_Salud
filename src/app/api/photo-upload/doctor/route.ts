// POST   /api/photo-upload/doctor — multipart file upload
// DELETE /api/photo-upload/doctor — delete doctor photo

import { NextRequest, NextResponse } from "next/server";
import { requireDoctorAuth } from "@/lib/security/jwt-auth";
import * as photoService from "@/lib/services/photo-upload";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const auth = await requireDoctorAuth(request);
  if (auth.error) return auth.error;

  try {
    const formData = await request.formData();
    const file = formData.get("photo") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No se proporcionó archivo" }, { status: 400 });
    }

    const result = await photoService.uploadDoctorPhoto(auth.user.id, file);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al subir foto";
    logger.error({ err }, "Doctor photo upload error");
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireDoctorAuth(request);
  if (auth.error) return auth.error;

  try {
    await photoService.deleteDoctorPhoto(auth.user.id);
    return NextResponse.json({ success: true, message: "Foto eliminada" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al eliminar foto";
    logger.error({ err }, "Doctor photo delete error");
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

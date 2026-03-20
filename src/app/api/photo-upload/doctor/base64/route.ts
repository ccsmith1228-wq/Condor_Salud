// POST /api/photo-upload/doctor/base64 — upload photo from base64 string

import { NextRequest, NextResponse } from "next/server";
import { requireDoctorAuth } from "@/lib/security/jwt-auth";
import * as photoService from "@/lib/services/photo-upload";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const auth = await requireDoctorAuth(request);
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const { imageData, mimeType } = body;

    if (!imageData || !mimeType) {
      return NextResponse.json({ error: "imageData y mimeType son obligatorios" }, { status: 400 });
    }

    const result = await photoService.uploadFromBase64(auth.user.id, imageData, mimeType);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al subir foto";
    logger.error({ err }, "Doctor photo base64 upload error");
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

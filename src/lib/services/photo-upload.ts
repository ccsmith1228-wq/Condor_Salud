// ─── Photo Upload Service ─────────────────────────────────────
// Doctor photo upload/delete via Firebase Storage.
// Ported from backend/src/services/PhotoUploadService.js.
//
// Replaces multer (Express-only) with Next.js formData parsing.

import { logger } from "@/lib/logger";
import * as firestore from "@/lib/services/firestore";

// ─── Constants ───────────────────────────────────────────────

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

// ─── Types ───────────────────────────────────────────────────

export interface UploadResult {
  url: string;
  path: string;
}

// ─── Upload from multipart form data ─────────────────────────

export async function uploadDoctorPhoto(doctorId: string, file: File): Promise<UploadResult> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Tipo de archivo no permitido. Use JPEG, PNG o WebP.");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("El archivo excede el límite de 5 MB");
  }

  const extension = file.name.split(".").pop() || "jpg";
  const destination = `doctors/${doctorId}/photo_${Date.now()}.${extension}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const url = await firestore.uploadBuffer(buffer, destination, file.type);

  // Update doctor record
  await firestore.updateDoc(firestore.Collections.DOCTORS, doctorId, {
    photoUrl: url,
    photoPath: destination,
  });

  logger.info({ doctorId, destination }, "Doctor photo uploaded");

  return { url, path: destination };
}

// ─── Upload from base64 ─────────────────────────────────────

export async function uploadFromBase64(
  doctorId: string,
  imageData: string,
  mimeType: string,
): Promise<UploadResult> {
  if (!ALLOWED_TYPES.has(mimeType)) {
    throw new Error("Tipo de archivo no permitido. Use JPEG, PNG o WebP.");
  }

  // Strip data URL prefix if present
  const base64Clean = imageData.includes(",") ? imageData.split(",")[1]! : imageData;
  const buffer = Buffer.from(base64Clean, "base64");

  if (buffer.length > MAX_FILE_SIZE) {
    throw new Error("La imagen excede el límite de 5 MB");
  }

  const ext = mimeType.split("/")[1] || "jpg";
  const destination = `doctors/${doctorId}/photo_${Date.now()}.${ext}`;

  const url = await firestore.uploadBuffer(buffer, destination, mimeType);

  // Update doctor record
  await firestore.updateDoc(firestore.Collections.DOCTORS, doctorId, {
    photoUrl: url,
    photoPath: destination,
  });

  logger.info({ doctorId, destination }, "Doctor photo uploaded (base64)");

  return { url, path: destination };
}

// ─── Delete photo ────────────────────────────────────────────

export async function deleteDoctorPhoto(doctorId: string): Promise<void> {
  const doctor = await firestore.getDoc(firestore.Collections.DOCTORS, doctorId);
  if (!doctor) {
    throw new Error("Médico no encontrado");
  }

  const photoPath = doctor.photoPath as string | undefined;
  if (photoPath) {
    await firestore.deleteFile(photoPath);
  }

  await firestore.updateDoc(firestore.Collections.DOCTORS, doctorId, {
    photoUrl: null,
    photoPath: null,
  });

  logger.info({ doctorId }, "Doctor photo deleted");
}

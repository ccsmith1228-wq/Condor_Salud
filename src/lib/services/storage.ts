// ─── Supabase Storage Service ────────────────────────────────
// Upload, download, list, and delete files from Supabase Storage.
// Buckets: "reports" (generated PDFs/Excel), "medical-docs" (patient uploads).
//
// Usage:
//   import { uploadReport, getReportUrl } from "@/lib/services/storage";
//   const path = await uploadReport(buffer, "facturacion-marzo-2026.pdf", "application/pdf");
//   const url = await getReportUrl(path);

import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/env";

// ─── Bucket names ────────────────────────────────────────────
export const BUCKET_REPORTS = "reports";
export const BUCKET_MEDICAL_DOCS = "medical-docs";

// ─── Types ───────────────────────────────────────────────────
export interface StorageFile {
  name: string;
  path: string;
  size: number;
  createdAt: string;
  mimeType: string;
}

export interface UploadResult {
  path: string;
  fullPath: string;
}

// ─── Ensure Supabase is ready ────────────────────────────────
function getClient() {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured. Storage operations require a connected instance.");
  }
  return createClient();
}

// ─── Upload ──────────────────────────────────────────────────

/**
 * Upload a generated report (PDF or Excel) to the "reports" bucket.
 * Path format: reports/{clinicId}/{year-month}/{filename}
 */
export async function uploadReport(
  file: Buffer | Blob | ArrayBuffer,
  filename: string,
  contentType: string,
  clinicId?: string,
): Promise<UploadResult> {
  const supabase = getClient();
  const now = new Date();
  const folder = `${clinicId || "default"}/${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const path = `${folder}/${filename}`;

  const { data, error } = await supabase.storage.from(BUCKET_REPORTS).upload(path, file, {
    contentType,
    upsert: true,
  });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  return {
    path: data.path,
    fullPath: data.fullPath ?? `${BUCKET_REPORTS}/${data.path}`,
  };
}

/**
 * Upload a medical document (patient file, lab result, image) to "medical-docs" bucket.
 * Path format: medical-docs/{clinicId}/{patientId}/{filename}
 */
export async function uploadMedicalDoc(
  file: File | Blob,
  filename: string,
  clinicId: string,
  patientId: string,
): Promise<UploadResult> {
  const supabase = getClient();
  const path = `${clinicId}/${patientId}/${filename}`;

  const { data, error } = await supabase.storage.from(BUCKET_MEDICAL_DOCS).upload(path, file, {
    upsert: false, // Don't overwrite — keep history
  });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  return {
    path: data.path,
    fullPath: data.fullPath ?? `${BUCKET_MEDICAL_DOCS}/${data.path}`,
  };
}

// ─── Download / Get URL ──────────────────────────────────────

/**
 * Get a signed URL (temporary, 1 hour) for a file in any bucket.
 */
export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresInSeconds = 3600,
): Promise<string> {
  const supabase = getClient();

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresInSeconds);

  if (error) throw new Error(`Signed URL failed: ${error.message}`);
  return data.signedUrl;
}

/** Shorthand for report downloads */
export async function getReportUrl(path: string): Promise<string> {
  return getSignedUrl(BUCKET_REPORTS, path);
}

/** Shorthand for medical doc downloads */
export async function getMedicalDocUrl(path: string): Promise<string> {
  return getSignedUrl(BUCKET_MEDICAL_DOCS, path);
}

/**
 * Get a public URL (if bucket is public). Reports bucket should be private → use signed URLs.
 */
export function getPublicUrl(bucket: string, path: string): string {
  const supabase = getClient();
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

// ─── List Files ──────────────────────────────────────────────

/**
 * List files in a storage bucket folder.
 */
export async function listFiles(bucket: string, folder: string): Promise<StorageFile[]> {
  const supabase = getClient();

  const { data, error } = await supabase.storage.from(bucket).list(folder, {
    sortBy: { column: "created_at", order: "desc" },
  });

  if (error) throw new Error(`List files failed: ${error.message}`);

  return (data || [])
    .filter((f) => f.name !== ".emptyFolderPlaceholder") // Supabase artifact
    .map((f) => ({
      name: f.name,
      path: `${folder}/${f.name}`,
      size: f.metadata?.size ?? 0,
      createdAt: f.created_at ?? "",
      mimeType: f.metadata?.mimetype ?? "application/octet-stream",
    }));
}

/** List generated reports for a clinic */
export async function listReports(clinicId: string): Promise<StorageFile[]> {
  return listFiles(BUCKET_REPORTS, clinicId);
}

/** List medical docs for a patient */
export async function listMedicalDocs(clinicId: string, patientId: string): Promise<StorageFile[]> {
  return listFiles(BUCKET_MEDICAL_DOCS, `${clinicId}/${patientId}`);
}

// ─── Delete ──────────────────────────────────────────────────

/**
 * Delete a file from a bucket.
 */
export async function deleteFile(bucket: string, path: string): Promise<void> {
  const supabase = getClient();

  const { error } = await supabase.storage.from(bucket).remove([path]);

  if (error) throw new Error(`Delete failed: ${error.message}`);
}

/** Delete a generated report */
export async function deleteReport(path: string): Promise<void> {
  return deleteFile(BUCKET_REPORTS, path);
}

/** Delete a medical document */
export async function deleteMedicalDoc(path: string): Promise<void> {
  return deleteFile(BUCKET_MEDICAL_DOCS, path);
}

// ─── Move / Copy ─────────────────────────────────────────────

/**
 * Move a file within a bucket (rename / reorganize).
 */
export async function moveFile(bucket: string, fromPath: string, toPath: string): Promise<void> {
  const supabase = getClient();

  const { error } = await supabase.storage.from(bucket).move(fromPath, toPath);

  if (error) throw new Error(`Move failed: ${error.message}`);
}

/**
 * Copy a file within a bucket.
 */
export async function copyFile(bucket: string, fromPath: string, toPath: string): Promise<void> {
  const supabase = getClient();

  const { error } = await supabase.storage.from(bucket).copy(fromPath, toPath);

  if (error) throw new Error(`Copy failed: ${error.message}`);
}

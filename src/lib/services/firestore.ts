// ─── Firebase Admin + Firestore Service ──────────────────────
// Singleton Firebase Admin SDK with generic Firestore CRUD and
// Firebase Storage helpers. Ported from backend/src/db/firestore.js.

import admin from "firebase-admin";
import { logger } from "@/lib/logger";

// ─── Singleton initialisation ────────────────────────────────

function getApp(): admin.app.App {
  if (admin.apps.length > 0) return admin.apps[0]!;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;

  if (!projectId || !clientEmail || !privateKey) {
    logger.warn("Firebase credentials not configured — using emulator / noop mode");
    return admin.initializeApp({
      projectId: projectId || "condor-salud-dev",
      storageBucket: storageBucket || "condor-salud-dev.appspot.com",
    });
  }

  return admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
    storageBucket: storageBucket || `${projectId}.appspot.com`,
  });
}

let _app: admin.app.App | null = null;

function app(): admin.app.App {
  if (!_app) _app = getApp();
  return _app;
}

// ─── Firestore DB accessor ───────────────────────────────────

export function db(): admin.firestore.Firestore {
  return app().firestore();
}

// ─── Collections ─────────────────────────────────────────────

export const Collections = {
  DOCTORS: "doctors",
  PATIENTS: "patients",
  BOOKINGS: "bookings",
  REVIEWS: "reviews",
  CLAIM_TOKENS: "claimTokens",
  ADMIN_USERS: "adminUsers",
  PAYMENTS: "payments",
} as const;

// ─── Generic CRUD helpers ────────────────────────────────────

export async function createDoc(
  collection: string,
  id: string,
  data: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const now = admin.firestore.FieldValue.serverTimestamp();
  const doc = { ...data, createdAt: now, updatedAt: now };
  await db().collection(collection).doc(id).set(doc);
  return { id, ...doc };
}

export async function getDoc(
  collection: string,
  id: string,
): Promise<Record<string, unknown> | null> {
  const snap = await db().collection(collection).doc(id).get();
  if (!snap.exists) return null;
  return { id: snap.id, ...snap.data() } as Record<string, unknown>;
}

export async function updateDoc(
  collection: string,
  id: string,
  data: Record<string, unknown>,
): Promise<void> {
  await db()
    .collection(collection)
    .doc(id)
    .update({ ...data, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
}

export async function removeDoc(collection: string, id: string): Promise<void> {
  await db().collection(collection).doc(id).delete();
}

export async function queryDocs(
  collection: string,
  field: string,
  operator: admin.firestore.WhereFilterOp,
  value: unknown,
): Promise<Record<string, unknown>[]> {
  const snap = await db().collection(collection).where(field, operator, value).get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function queryOne(
  collection: string,
  field: string,
  operator: admin.firestore.WhereFilterOp,
  value: unknown,
): Promise<Record<string, unknown> | null> {
  const snap = await db().collection(collection).where(field, operator, value).limit(1).get();
  if (snap.empty) return null;
  const d = snap.docs[0]!;
  return { id: d.id, ...d.data() };
}

export async function exists(collection: string, field: string, value: unknown): Promise<boolean> {
  const snap = await db().collection(collection).where(field, "==", value).limit(1).get();
  return !snap.empty;
}

// ─── Batch & transaction helpers ─────────────────────────────

export function batch(): admin.firestore.WriteBatch {
  return db().batch();
}

export async function runTransaction<T>(
  fn: (tx: admin.firestore.Transaction) => Promise<T>,
): Promise<T> {
  return db().runTransaction(fn);
}

export function increment(n: number): admin.firestore.FieldValue {
  return admin.firestore.FieldValue.increment(n);
}

export function serverTimestamp(): admin.firestore.FieldValue {
  return admin.firestore.FieldValue.serverTimestamp();
}

// ─── Firebase Storage helpers ────────────────────────────────

function getBucket(): ReturnType<admin.storage.Storage["bucket"]> {
  return app().storage().bucket();
}

export async function uploadFile(
  filePath: string,
  destination: string,
  contentType: string,
): Promise<string> {
  const bucket = getBucket();
  await bucket.upload(filePath, {
    destination,
    metadata: { contentType },
  });

  const file = bucket.file(destination);
  const [url] = await file.getSignedUrl({
    action: "read",
    expires: "03-09-2500",
  });

  return url;
}

export async function uploadBuffer(
  buffer: Buffer,
  destination: string,
  contentType: string,
): Promise<string> {
  const bucket = getBucket();
  const file = bucket.file(destination);

  await file.save(buffer, {
    metadata: { contentType },
    public: true,
  });

  return `https://storage.googleapis.com/${bucket.name}/${destination}`;
}

export async function deleteFile(destination: string): Promise<void> {
  try {
    await getBucket().file(destination).delete();
  } catch (err) {
    logger.warn({ err, destination }, "Failed to delete file from Storage");
  }
}

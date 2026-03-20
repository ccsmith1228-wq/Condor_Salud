// ─── Patient Auth Service ─────────────────────────────────────
// Registration, login, JWT, password reset for patients.
// Ported from backend/src/services/PatientAuthService.js.
//
// Uses Firestore "patients" collection and bcryptjs for password hashing.

import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { logger } from "@/lib/logger";
import * as firestore from "@/lib/services/firestore";
import * as emailService from "@/lib/services/email-sendgrid";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "@/lib/security/jwt-auth";

// ─── Types ───────────────────────────────────────────────────

export interface Patient {
  id: string;
  email: string;
  name: string;
  phone?: string;
  dateOfBirth?: string;
  insuranceId?: string;
  expoPushToken?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

interface PatientDoc extends Patient {
  passwordHash: string;
}

interface AuthResponse {
  patient: Patient;
  token: string;
  refreshToken: string;
}

const SALT_ROUNDS = 10;
const FRONTEND_URL = () =>
  process.env.NEXT_PUBLIC_APP_URL || process.env.FRONTEND_URL || "http://localhost:3000";

// ─── Helpers ─────────────────────────────────────────────────

function stripPassword(doc: Record<string, unknown>): Patient {
  const { passwordHash: _, ...rest } = doc;
  return rest as unknown as Patient;
}

// ─── Register ────────────────────────────────────────────────

export async function register(input: {
  email: string;
  password: string;
  name: string;
  phone?: string;
}): Promise<AuthResponse> {
  const existing = await firestore.exists(firestore.Collections.PATIENTS, "email", input.email);
  if (existing) {
    throw new Error("Ya existe una cuenta con este email");
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  const id = uuidv4();

  const doc = await firestore.createDoc(firestore.Collections.PATIENTS, id, {
    email: input.email.toLowerCase().trim(),
    name: input.name.trim(),
    phone: input.phone || null,
    passwordHash,
  });

  const patient = stripPassword(doc);

  const token = signAccessToken({ id, email: patient.email, role: "patient" });
  const refreshToken = signRefreshToken({ id, type: "refresh" });

  // Send welcome email (non-blocking)
  emailService.sendWelcomePatient({ email: patient.email, name: patient.name }).catch((err) => {
    logger.error({ err }, "Failed to send welcome email");
  });

  logger.info({ patientId: id }, "Patient registered");

  return { patient, token, refreshToken };
}

// ─── Login ───────────────────────────────────────────────────

export async function login(input: { email: string; password: string }): Promise<AuthResponse> {
  const doc = await firestore.queryOne(
    firestore.Collections.PATIENTS,
    "email",
    "==",
    input.email.toLowerCase().trim(),
  );

  if (!doc) {
    throw new Error("Email o contraseña incorrectos");
  }

  const passwordHash = doc.passwordHash as string;
  const valid = await bcrypt.compare(input.password, passwordHash);
  if (!valid) {
    throw new Error("Email o contraseña incorrectos");
  }

  const patient = stripPassword(doc);
  const token = signAccessToken({ id: patient.id, email: patient.email, role: "patient" });
  const refreshToken = signRefreshToken({ id: patient.id, type: "refresh" });

  return { patient, token, refreshToken };
}

// ─── Get by ID ───────────────────────────────────────────────

export async function getById(id: string): Promise<Patient | null> {
  const doc = await firestore.getDoc(firestore.Collections.PATIENTS, id);
  if (!doc) return null;
  return stripPassword(doc);
}

// ─── Update profile ──────────────────────────────────────────

const ALLOWED_UPDATE_FIELDS = ["name", "phone", "dateOfBirth", "insuranceId", "expoPushToken"];

export async function updateProfile(
  id: string,
  data: Record<string, unknown>,
): Promise<Patient | null> {
  // Allow-list fields
  const updates: Record<string, unknown> = {};
  for (const key of ALLOWED_UPDATE_FIELDS) {
    if (key in data) updates[key] = data[key];
  }

  if (Object.keys(updates).length === 0) {
    throw new Error("No se proporcionaron campos válidos para actualizar");
  }

  await firestore.updateDoc(firestore.Collections.PATIENTS, id, updates);
  return getById(id);
}

// ─── Password reset request ─────────────────────────────────

export async function requestPasswordReset(email: string): Promise<{ sent: boolean }> {
  const patient = await firestore.queryOne(
    firestore.Collections.PATIENTS,
    "email",
    "==",
    email.toLowerCase().trim(),
  );

  if (!patient) {
    // Don't reveal whether email exists
    return { sent: true };
  }

  const resetToken = uuidv4();
  const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours

  await firestore.createDoc(firestore.Collections.CLAIM_TOKENS, resetToken, {
    patientId: patient.id,
    type: "password_reset",
    expiresAt: expiresAt.toISOString(),
  });

  const resetUrl = `${FRONTEND_URL()}/auth/reset-password?token=${resetToken}`;

  await emailService.sendPasswordReset({
    email: patient.email as string,
    name: patient.name as string,
    resetUrl,
  });

  return { sent: true };
}

// ─── Password reset confirm ─────────────────────────────────

export async function resetPassword(input: {
  token: string;
  password: string;
}): Promise<{ success: boolean }> {
  const tokenDoc = await firestore.getDoc(firestore.Collections.CLAIM_TOKENS, input.token);

  if (!tokenDoc) {
    throw new Error("Token inválido o expirado");
  }

  const expiresAt = new Date(tokenDoc.expiresAt as string);
  if (expiresAt < new Date()) {
    await firestore.removeDoc(firestore.Collections.CLAIM_TOKENS, input.token);
    throw new Error("Token expirado");
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  await firestore.updateDoc(firestore.Collections.PATIENTS, tokenDoc.patientId as string, {
    passwordHash,
  });

  // Clean up token
  await firestore.removeDoc(firestore.Collections.CLAIM_TOKENS, input.token);

  return { success: true };
}

// ─── Refresh access token ────────────────────────────────────

export async function refreshAccessToken(
  refreshTokenStr: string,
): Promise<{ token: string } | null> {
  const decoded = verifyRefreshToken(refreshTokenStr);
  if (!decoded) return null;

  const patient = await getById(decoded.id);
  if (!patient) return null;

  const token = signAccessToken({ id: patient.id, email: patient.email, role: "patient" });
  return { token };
}

// ─── JWT Auth Helpers for Next.js Route Handlers ─────────────
// Ported from backend/src/middleware/auth.js (Express middleware)
// to Next.js-compatible async helper functions.
//
// Usage:
//   const patient = await requirePatientAuth(request);
//   if (patient.error) return patient.error;
//   // patient.user is available

import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { logger } from "@/lib/logger";

const JWT_SECRET = () => process.env.JWT_SECRET || process.env.SESSION_ENCRYPTION_KEY || "";

// ─── Types ───────────────────────────────────────────────────

export interface JwtUser {
  id: string;
  email: string;
  role: "doctor" | "patient" | "admin";
}

export type JwtAuthResult =
  | { error: NextResponse; user?: never }
  | { error?: never; user: JwtUser };

// ─── Token extraction ────────────────────────────────────────

function extractToken(req: NextRequest): string | null {
  const header = req.headers.get("authorization");
  if (header?.startsWith("Bearer ")) return header.slice(7);
  return null;
}

function verifyToken(token: string): JwtUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET()) as jwt.JwtPayload & {
      id?: string;
      email?: string;
      role?: string;
    };
    if (!decoded.id) return null;
    return {
      id: decoded.id,
      email: decoded.email || "",
      role: (decoded.role as JwtUser["role"]) || "patient",
    };
  } catch {
    return null;
  }
}

// ─── Auth guards ─────────────────────────────────────────────

/** Require a valid doctor JWT */
export async function requireDoctorAuth(req: NextRequest): Promise<JwtAuthResult> {
  const token = extractToken(req);
  if (!token) {
    return {
      error: NextResponse.json({ error: "Token no proporcionado" }, { status: 401 }),
    };
  }

  const user = verifyToken(token);
  if (!user) {
    return {
      error: NextResponse.json({ error: "Token inválido o expirado" }, { status: 401 }),
    };
  }

  if (user.role !== "doctor") {
    return {
      error: NextResponse.json(
        { error: "Acceso denegado — se requiere rol doctor" },
        { status: 403 },
      ),
    };
  }

  return { user };
}

/** Require a valid patient JWT */
export async function requirePatientAuth(req: NextRequest): Promise<JwtAuthResult> {
  const token = extractToken(req);
  if (!token) {
    return {
      error: NextResponse.json({ error: "Token no proporcionado" }, { status: 401 }),
    };
  }

  const user = verifyToken(token);
  if (!user) {
    return {
      error: NextResponse.json({ error: "Token inválido o expirado" }, { status: 401 }),
    };
  }

  if (user.role !== "patient") {
    return {
      error: NextResponse.json(
        { error: "Acceso denegado — se requiere rol paciente" },
        { status: 403 },
      ),
    };
  }

  return { user };
}

/** Require any valid JWT (doctor or patient) */
export async function requireAnyAuth(req: NextRequest): Promise<JwtAuthResult> {
  const token = extractToken(req);
  if (!token) {
    return {
      error: NextResponse.json({ error: "Token no proporcionado" }, { status: 401 }),
    };
  }

  const user = verifyToken(token);
  if (!user) {
    return {
      error: NextResponse.json({ error: "Token inválido o expirado" }, { status: 401 }),
    };
  }

  return { user };
}

/** Optional auth — returns user if token is present and valid, null otherwise */
export async function optionalAuth(req: NextRequest): Promise<JwtUser | null> {
  const token = extractToken(req);
  if (!token) return null;
  return verifyToken(token);
}

/** Require admin JWT — verified by role="admin" in token */
export async function requireAdminAuth(req: NextRequest): Promise<JwtAuthResult> {
  const token = extractToken(req);
  if (!token) {
    return {
      error: NextResponse.json({ error: "Token no proporcionado" }, { status: 401 }),
    };
  }

  const user = verifyToken(token);
  if (!user) {
    return {
      error: NextResponse.json({ error: "Token inválido o expirado" }, { status: 401 }),
    };
  }

  if (user.role !== "admin") {
    return {
      error: NextResponse.json(
        { error: "Acceso denegado — se requiere rol admin" },
        { status: 403 },
      ),
    };
  }

  return { user };
}

// ─── Token generation ────────────────────────────────────────

/** Sign an access token (7 days) */
export function signAccessToken(payload: { id: string; email: string; role: string }): string {
  return jwt.sign(payload, JWT_SECRET(), { expiresIn: "7d" });
}

/** Sign a refresh token (30 days) */
export function signRefreshToken(payload: { id: string; type: "refresh" }): string {
  return jwt.sign(payload, JWT_SECRET(), { expiresIn: "30d" });
}

/** Verify a refresh token and return the payload */
export function verifyRefreshToken(token: string): { id: string; type: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET()) as jwt.JwtPayload & {
      id?: string;
      type?: string;
    };
    if (decoded.type !== "refresh" || !decoded.id) return null;
    return { id: decoded.id, type: decoded.type };
  } catch {
    logger.warn("Invalid refresh token");
    return null;
  }
}

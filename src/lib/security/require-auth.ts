// ─── API Auth Guard ──────────────────────────────────────────
// Server-side authentication check for API routes.
// Reads the httpOnly session cookie (or Supabase / Google OAuth session)
// and returns 401 if the request is not authenticated.
//
// Usage in any API route:
//   const auth = await requireAuth(req);
//   if (auth.error) return auth.error;
//   // auth.user is now available
//
// S-01: Addresses the audit finding that 9/11 API routes had zero auth.

import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { logger } from "@/lib/logger";

const SESSION_COOKIE = "condor_session";
const GOOGLE_SESSION_COOKIE = "condor_google_session";

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  clinicId: string;
  clinicName: string;
}

type AuthResult = { error: NextResponse; user?: never } | { error?: never; user: AuthUser };

/**
 * Verify the caller is authenticated.
 * Priority: 1) Demo session cookie  2) Google OAuth session  3) Supabase JWT
 */
export async function requireAuth(req: NextRequest): Promise<AuthResult> {
  // ── 1. Check encrypted httpOnly session cookie ──
  const cookie = req.cookies.get(SESSION_COOKIE)?.value;
  if (cookie) {
    try {
      const { decrypt } = await import("@/lib/security/crypto");
      const decrypted = decrypt(cookie);
      const session = JSON.parse(decrypted) as AuthUser;
      if (session.id && session.email && session.role) {
        return { user: session };
      }
    } catch {
      // Corrupt / tampered cookie — fall through
    }
  }

  // ── 2. Check Google OAuth session cookie ──
  const googleCookie = req.cookies.get(GOOGLE_SESSION_COOKIE)?.value;
  if (googleCookie) {
    try {
      // The Google session cookie is encrypted with AES-256-GCM.
      // Import dynamically to avoid circular deps.
      const { decrypt } = await import("@/lib/security/crypto");
      const decrypted = decrypt(googleCookie);
      const googleSession = JSON.parse(decrypted) as {
        id?: string;
        email?: string;
        name?: string;
        role?: string;
        clinicId?: string;
        clinicName?: string;
        access_token?: string;
        refresh_token?: string;
      };
      if (googleSession.id && googleSession.email) {
        return {
          user: {
            id: googleSession.id,
            email: googleSession.email,
            name: googleSession.name ?? "Google User",
            role: googleSession.role ?? "medico",
            clinicId: googleSession.clinicId ?? "pending",
            clinicName: googleSession.clinicName ?? "Sin asignar",
          },
        };
      }
    } catch {
      // Corrupt / expired encrypted cookie — fall through
      logger.debug("Google OAuth session cookie decryption failed");
    }
  }

  // ── 3. Check Supabase session (when configured) ──
  const supabaseAuth =
    req.cookies.get("sb-access-token")?.value ||
    req.cookies.getAll().find((c) => c.name.startsWith("sb-") && c.name.endsWith("-auth-token"))
      ?.value;

  if (supabaseAuth) {
    const jwtSecret = process.env.SUPABASE_JWT_SECRET;
    if (jwtSecret) {
      try {
        const secret = new TextEncoder().encode(jwtSecret);
        const { payload } = await jwtVerify(supabaseAuth, secret, {
          issuer: "supabase",
        });
        const meta = (payload.user_metadata ?? payload.app_metadata ?? {}) as Record<
          string,
          string
        >;
        return {
          user: {
            id: payload.sub ?? "unknown",
            email: (payload.email as string) ?? meta.email ?? "unknown",
            name: meta.full_name ?? meta.name ?? "Supabase User",
            role: meta.role ?? (payload.role as string) ?? "admin",
            clinicId: meta.clinic_id ?? "clinic-001",
            clinicName: meta.clinic_name ?? "Clínica",
          },
        };
      } catch (err) {
        logger.warn({ err, route: req.nextUrl.pathname }, "JWT verification failed");
        // Fall through to 401
      }
    } else if (process.env.NODE_ENV !== "production") {
      // Dev-only: trust Supabase cookie presence when no JWT secret
      logger.debug("SUPABASE_JWT_SECRET not set — skipping JWT check (dev only)");
      return {
        user: {
          id: "supabase-user",
          email: "unknown",
          name: "Supabase User",
          role: "admin",
          clinicId: "clinic-001",
          clinicName: "Unknown Clinic",
        },
      };
    } else {
      // Production: require JWT verification — refuse to trust unsigned cookies
      logger.warn("SUPABASE_JWT_SECRET not set in production — Supabase auth cannot be verified");
    }
  }

  // ── 4. Not authenticated ──
  logger.warn(
    { route: req.nextUrl.pathname, ip: req.headers.get("x-forwarded-for") },
    "Unauthenticated API access attempt",
  );

  return {
    error: NextResponse.json({ error: "No autorizado. Iniciá sesión primero." }, { status: 401 }),
  };
}

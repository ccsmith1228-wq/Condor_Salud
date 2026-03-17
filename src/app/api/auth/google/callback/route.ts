import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens, getGoogleUserInfo } from "@/lib/google";
import { logger } from "@/lib/security/api-guard";
import { rateLimit, rateLimitHeaders } from "@/lib/security/rate-limit";
import { encrypt } from "@/lib/security/crypto";

/** Validate redirect target to prevent open-redirect attacks */
function safeRedirect(target: string | null): string {
  if (!target) return "/dashboard";
  // Only allow relative paths starting with /
  if (!target.startsWith("/") || target.startsWith("//")) return "/dashboard";
  // Block protocol-relative URLs and data/javascript schemes
  if (/^\/[\\@]/.test(target)) return "/dashboard";
  return target;
}

// ─── SH-01: Verify OAuth state parameter against cookie ─────
function verifyState(req: NextRequest, stateParam: string | null): boolean {
  const cookieState = req.cookies.get("condor_oauth_state")?.value;
  if (!cookieState || !stateParam) return false;
  // state format: "nonce:redirect"
  return cookieState === stateParam.split(":")[0];
}

export async function GET(req: NextRequest) {
  // ── SH-02: Rate limit callback endpoint ──
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    req.ip ||
    "unknown";
  const rlResult = rateLimit(`google_callback:${ip}`, { limit: 10, windowSec: 60 });
  if (!rlResult.allowed) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Intentá de nuevo en unos minutos." },
      { status: 429, headers: rateLimitHeaders(rlResult) },
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) {
      logger.warn({ error, route: "auth/google/callback" }, "OAuth error response");
      return NextResponse.redirect(
        new URL(`/auth/login?error=${encodeURIComponent(error)}`, req.url),
      );
    }

    if (!code) {
      return NextResponse.redirect(new URL("/auth/login?error=missing_code", req.url));
    }

    // ── SH-01: Verify CSRF state ──
    if (!verifyState(req, state)) {
      logger.warn({ route: "auth/google/callback" }, "OAuth state mismatch — possible CSRF");
      return NextResponse.redirect(new URL("/auth/login?error=invalid_state", req.url));
    }

    const origin = new URL(req.url).origin;
    const redirectUri = `${origin}/api/auth/google/callback`;

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code, redirectUri);

    // Get user info from Google
    const googleUser = await getGoogleUserInfo(tokens.access_token);

    // ── SM-02: Check email_verified ──
    if (!googleUser.email_verified) {
      logger.warn(
        { email: googleUser.email, route: "auth/google/callback" },
        "Unverified Google email attempted login",
      );
      return NextResponse.redirect(new URL("/auth/login?error=email_not_verified", req.url));
    }

    // ── S-06: Encrypt tokens before storing ──
    const encryptedAccessToken = encrypt(tokens.access_token);
    const encryptedRefreshToken = tokens.refresh_token ? encrypt(tokens.refresh_token) : undefined;

    // ── SH-03: Default role is "medico" (valid RBAC role) ──
    const sessionData = {
      id: `google-${googleUser.sub}`,
      email: googleUser.email,
      name: googleUser.name,
      role: "medico" as const,
      clinicId: "pending",
      clinicName: "Sin asignar",
      avatarUrl: googleUser.picture,
      googleAccessToken: encryptedAccessToken,
      googleRefreshToken: encryptedRefreshToken,
    };

    // Extract redirect from state (format: "nonce:redirect")
    const redirectPath = state?.includes(":") ? state.split(":").slice(1).join(":") : null;
    const redirect = safeRedirect(redirectPath);
    const response = NextResponse.redirect(new URL(redirect, req.url));

    // Set session cookie (httpOnly for security)
    response.cookies.set("condor_google_session", JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    // Public cookie — NEVER include tokens or role
    response.cookies.set(
      "condor_google_user",
      JSON.stringify({
        id: sessionData.id,
        email: sessionData.email,
        name: sessionData.name,
        avatarUrl: sessionData.avatarUrl,
      }),
      {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      },
    );

    // Clear the OAuth state cookie
    response.cookies.delete("condor_oauth_state");

    logger.info({ userId: sessionData.id }, "Google OAuth login success");
    return response;
  } catch (err) {
    logger.error({ err, route: "auth/google/callback" }, "Google OAuth callback error");
    return NextResponse.redirect(new URL("/auth/login?error=oauth_failed", req.url));
  }
}

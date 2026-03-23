import { NextResponse, type NextRequest } from "next/server";

// ─── Route classification ────────────────────────────────────
const AUTH_ROUTES = ["/auth/login", "/auth/registro", "/auth/forgot-password"];
const AUTH_VERIFY_ROUTE = "/auth/verificar-email";
const ONBOARDING_ROUTE = "/dashboard/wizard";

const PUBLIC_PAGE_PREFIXES = [
  "/", // Landing
  "/planes", // Pricing
  "/partnerships", // B2B travel partnership
  "/acs", // Embassy endorsement page
  "/privacidad", // Legal
  "/terminos",
  "/status",
  "/offline",
  "/paciente", // Patient portal (has own auth)
  "/auth", // Auth pages
];

const PUBLIC_API_PREFIXES = [
  "/api/health",
  "/api/status",
  "/api/chatbot",
  "/api/waitlist",
  "/api/auth",
  "/api/csp-report",
  "/api/webhooks", // Twilio WhatsApp (auth via signature validation)
  "/api/patients/register",
  "/api/patients/login",
  "/api/patients/refresh",
  "/api/patients/reset-password",
  "/api/payments/webhook", // MercadoPago (auth via HMAC signature)
  "/api/admin/login",
  "/api/rides", // Ride deep links (public — no auth needed)
  "/api/chat", // AI chatbot (public — no auth needed)
  "/api/demo", // Demo admin panel (auth via JWT)
  "/api/billing", // Billing endpoints (auth via plan context)
  "/api/team/accept", // Team invitation accept (has own token auth)
];

/** SM-01: Validate redirect param — only allow relative paths to prevent open redirects */
function sanitizeRedirect(value: string | null): string {
  if (!value) return "/dashboard";
  if (value.startsWith("/") && !value.startsWith("//") && !value.includes(":")) return value;
  return "/dashboard";
}

/** Check if a pathname is a public (non-dashboard) page */
function isPublicPage(pathname: string): boolean {
  if (pathname === "/") return true;
  return PUBLIC_PAGE_PREFIXES.some((p) => p !== "/" && pathname.startsWith(p));
}

// ─── SH-07: Generate per-request CSP nonce ───────────────────
function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(Array.from(array, (b) => String.fromCharCode(b)).join(""));
}

function buildCspHeader(_nonce: string): string {
  return [
    "default-src 'self'",
    // NOTE: Do NOT include a nonce in script-src — the CSP spec says 'unsafe-inline'
    // is silently ignored when a nonce or hash is present. Next.js emits inline
    // <script> tags without nonce attributes, so adding a nonce here blocks React
    // hydration entirely. The nonce is kept in generateNonce() / x-nonce header
    // for future use (e.g. if Next.js adds nonce propagation support).
    "script-src 'self' 'unsafe-inline' https://us-assets.i.posthog.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://o4507.ingest.sentry.io https://*.daily.co wss://*.daily.co https://api.mercadopago.com https://*.upstash.io https://api.anthropic.com https://www.googleapis.com https://accounts.google.com https://*.posthog.com https://us.i.posthog.com https://*.sentry.io https://maps.googleapis.com https://firestore.googleapis.com https://storage.googleapis.com https://api.sendgrid.com https://api.uber.com https://indrive.com",
    "frame-src 'self' https://*.daily.co https://*.mercadopago.com.ar https://*.mercadopago.com https://meet.google.com https://m.uber.com https://cabify.com https://indrive.com https://wa.me",
    "media-src 'self' blob:",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
    "report-uri /api/csp-report",
  ].join("; ");
}

// ─── Middleware ───────────────────────────────────────────────
// MEDICAL INDUSTRY: Authentication and verification are mandatory.
// Dashboard requires: 1) Auth 2) Email verified 3) Onboarding complete.
// No demo-browsable dashboard — all write AND read operations gated.

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── SH-07: Generate CSP nonce for every request ──
  const nonce = generateNonce();
  const cspHeader = buildCspHeader(nonce);

  // Pass nonce to server components via request header
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  // Public API routes — skip auth checks, still apply CSP
  if (PUBLIC_API_PREFIXES.some((p) => pathname.startsWith(p))) {
    const response = NextResponse.next({ request: { headers: requestHeaders } });
    response.headers.set("Content-Security-Policy", cspHeader);
    return response;
  }

  // Public pages (landing, pricing, legal, patient portal) — no auth
  if (isPublicPage(pathname) && !pathname.startsWith("/dashboard")) {
    const response = NextResponse.next({ request: { headers: requestHeaders } });
    response.headers.set("Content-Security-Policy", cspHeader);
    return response;
  }

  // ── Supabase auth (when configured) ──────────────────────
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isSupabaseReady =
    supabaseUrl &&
    supabaseUrl !== "https://your-project.supabase.co" &&
    supabaseUrl !== "https://placeholder.supabase.co";

  if (isSupabaseReady) {
    try {
      const { createClient } = await import("@/lib/supabase/middleware");
      const { supabase, response } = createClient(request);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // ── Gate 1: Authentication required for dashboard + protected APIs ──
      const isProtectedApi =
        pathname.startsWith("/api/") && !PUBLIC_API_PREFIXES.some((p) => pathname.startsWith(p));
      const isDashboard = pathname.startsWith("/dashboard");

      if (!user && isProtectedApi) {
        const r = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        r.headers.set("Content-Security-Policy", cspHeader);
        return r;
      }

      if (!user && isDashboard) {
        const loginUrl = new URL("/auth/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        const r = NextResponse.redirect(loginUrl);
        r.headers.set("Content-Security-Policy", cspHeader);
        return r;
      }

      // Redirect authenticated users away from auth pages (login/register)
      if (user && AUTH_ROUTES.includes(pathname)) {
        const redirectTo = sanitizeRedirect(request.nextUrl.searchParams.get("redirect"));
        const r = NextResponse.redirect(new URL(redirectTo, request.url));
        r.headers.set("Content-Security-Policy", cspHeader);
        return r;
      }

      // ── Gate 2: Email verification required for dashboard ──
      if (user && isDashboard) {
        const emailConfirmed = user.email_confirmed_at != null;
        if (!emailConfirmed && pathname !== AUTH_VERIFY_ROUTE) {
          // Allow access to /auth/verificar-email even while on dashboard routes
          const r = NextResponse.redirect(new URL(AUTH_VERIFY_ROUTE, request.url));
          r.headers.set("Content-Security-Policy", cspHeader);
          return r;
        }
      }

      // ── Gate 3: Onboarding completion required for dashboard ──
      if (user && isDashboard && pathname !== ONBOARDING_ROUTE) {
        const emailConfirmed = user.email_confirmed_at != null;
        if (emailConfirmed) {
          // Check onboarding_complete from clinic record (lightweight query)
          const { data: profile } = await supabase
            .from("profiles")
            .select("clinic_id")
            .eq("id", user.id)
            .single();

          if (profile?.clinic_id) {
            const { data: clinic } = await supabase
              .from("clinics")
              .select("onboarding_completed")
              .eq("id", profile.clinic_id)
              .single();

            if (clinic && !clinic.onboarding_completed) {
              const r = NextResponse.redirect(new URL(ONBOARDING_ROUTE, request.url));
              r.headers.set("Content-Security-Policy", cspHeader);
              return r;
            }
          } else {
            // No clinic linked — force onboarding
            const r = NextResponse.redirect(new URL(ONBOARDING_ROUTE, request.url));
            r.headers.set("Content-Security-Policy", cspHeader);
            return r;
          }
        }
      }

      // RBAC: role-based dashboard sub-route access (authenticated users only)
      if (user && pathname.startsWith("/dashboard/")) {
        const role = user.user_metadata?.role as string | undefined;
        if (role) {
          const { canAccessRoute } = await import("@/lib/auth/rbac");
          const validRoles = ["admin", "medico", "facturacion", "recepcion"];
          const userRole = validRoles.includes(role) ? role : "recepcion";
          if (
            !canAccessRoute(userRole as "admin" | "medico" | "facturacion" | "recepcion", pathname)
          ) {
            const r = NextResponse.redirect(new URL("/dashboard?forbidden=1", request.url));
            r.headers.set("Content-Security-Policy", cspHeader);
            return r;
          }
        }
      }

      // SH-07: Apply CSP header to the Supabase-refreshed response
      response.headers.set("Content-Security-Policy", cspHeader);
      return response;
    } catch {
      // If Supabase auth fails, redirect to login for dashboard, block APIs
      if (pathname.startsWith("/api/")) {
        const r = NextResponse.json({ error: "Auth service unavailable" }, { status: 503 });
        r.headers.set("Content-Security-Policy", cspHeader);
        return r;
      }
      if (pathname.startsWith("/dashboard")) {
        const r = NextResponse.redirect(new URL("/auth/login", request.url));
        r.headers.set("Content-Security-Policy", cspHeader);
        return r;
      }
      const r = NextResponse.next({ request: { headers: requestHeaders } });
      r.headers.set("Content-Security-Policy", cspHeader);
      return r;
    }
  }

  // ── No Supabase configured ───────────────────────────────
  // In production: dashboard requires auth backend. Block access.
  // In development: allow dashboard access for local testing.
  if (process.env.NODE_ENV === "production") {
    if (pathname.startsWith("/dashboard")) {
      const r = NextResponse.redirect(new URL("/auth/login?error=no_auth_backend", request.url));
      r.headers.set("Content-Security-Policy", cspHeader);
      return r;
    }
    if (pathname.startsWith("/api/") && !PUBLIC_API_PREFIXES.some((p) => pathname.startsWith(p))) {
      const r = NextResponse.json({ error: "Auth backend not configured" }, { status: 503 });
      r.headers.set("Content-Security-Policy", cspHeader);
      return r;
    }
  }

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", cspHeader);
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, logos, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|logos/|demo\\.html).*)",
  ],
};

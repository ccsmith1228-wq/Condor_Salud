import { NextResponse, type NextRequest } from "next/server";

// ─── Route classification ────────────────────────────────────
const AUTH_ROUTES = ["/auth/login", "/auth/registro", "/auth/forgot-password"];
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
];

/** SM-01: Validate redirect param — only allow relative paths to prevent open redirects */
function sanitizeRedirect(value: string | null): string {
  if (!value) return "/dashboard";
  if (value.startsWith("/") && !value.startsWith("//") && !value.includes(":")) return value;
  return "/dashboard";
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
// IMPORTANT: Dashboard pages are ALWAYS accessible without login.
// They render with demo/mock data. Write operations are gated by
// DemoModal + RequirePermission on the client side.
// Only protected API routes require authentication (SH-04).

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

      // SH-04: Block unauthenticated access to protected API routes only
      const isProtectedApi =
        pathname.startsWith("/api/") && !PUBLIC_API_PREFIXES.some((p) => pathname.startsWith(p));

      if (!user && isProtectedApi) {
        const r = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
      // If Supabase auth fails, allow page access (demo-browsable)
      // but block API routes as a precaution
      if (pathname.startsWith("/api/")) {
        const r = NextResponse.json({ error: "Auth service unavailable" }, { status: 503 });
        r.headers.set("Content-Security-Policy", cspHeader);
        return r;
      }
      const r = NextResponse.next({ request: { headers: requestHeaders } });
      r.headers.set("Content-Security-Policy", cspHeader);
      return r;
    }
  }

  // ── No Supabase configured ───────────────────────────────
  // Dashboard pages still accessible (demo mode with mock data).
  // Only block protected API routes in production.
  if (
    process.env.NODE_ENV === "production" &&
    pathname.startsWith("/api/") &&
    !PUBLIC_API_PREFIXES.some((p) => pathname.startsWith(p))
  ) {
    const r = NextResponse.json({ error: "Auth backend not configured" }, { status: 503 });
    r.headers.set("Content-Security-Policy", cspHeader);
    return r;
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

import { NextResponse, type NextRequest } from "next/server";

// ─── Protected routes ────────────────────────────────────────
const PROTECTED_PREFIXES = ["/dashboard", "/paciente"];
const AUTH_ROUTES = ["/auth/login", "/auth/registro", "/auth/forgot-password"];
// Reset-password and verify need session, so they're NOT in AUTH_ROUTES
// Public API routes that don't require authentication
const PUBLIC_API_PREFIXES = [
  "/api/health",
  "/api/chatbot",
  "/api/waitlist",
  "/api/auth",
  "/api/csp-report",
];

/** SM-01: Validate redirect param — only allow relative paths to prevent open redirects */
function sanitizeRedirect(value: string | null): string {
  if (!value) return "/dashboard";
  // Must start with / and must NOT start with // (protocol-relative) or contain :
  if (value.startsWith("/") && !value.startsWith("//") && !value.includes(":")) return value;
  return "/dashboard";
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip auth for public API routes
  if (PUBLIC_API_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Check if Supabase is configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isSupabaseReady =
    supabaseUrl &&
    supabaseUrl !== "https://your-project.supabase.co" &&
    supabaseUrl !== "https://placeholder.supabase.co";

  if (isSupabaseReady) {
    // Real auth check via Supabase middleware client
    const { createClient } = await import("@/lib/supabase/middleware");
    const { supabase, response } = createClient(request);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Redirect unauthenticated users away from protected routes
    // NOTE: Dashboard is demo-browsable (mock data). Only API routes are blocked.
    // Write operations are gated by RequirePermission on the client side.
    const isProtectedApi =
      pathname.startsWith("/api/") && !PUBLIC_API_PREFIXES.some((p) => pathname.startsWith(p));

    // SH-04: Block unauthenticated access to protected API routes
    if (!user && isProtectedApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Redirect authenticated users away from auth pages
    if (user && AUTH_ROUTES.includes(pathname)) {
      const redirectTo = sanitizeRedirect(request.nextUrl.searchParams.get("redirect"));
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }

    // ── RBAC: Role-based route access ──
    // Check if the user's role has permission for the requested dashboard route.
    // The role is stored in user_metadata (set during signup/profile trigger).
    if (user && pathname.startsWith("/dashboard/")) {
      const role = user.user_metadata?.role as string | undefined;
      if (role) {
        const { canAccessRoute } = await import("@/lib/auth/rbac");
        // canAccessRoute expects UserRole; fallback to "admin" if unknown
        const validRoles = ["admin", "medico", "facturacion", "recepcion"];
        const userRole = validRoles.includes(role) ? role : "admin";
        if (
          !canAccessRoute(userRole as "admin" | "medico" | "facturacion" | "recepcion", pathname)
        ) {
          return NextResponse.redirect(new URL("/dashboard?forbidden=1", request.url));
        }
      }
    }

    return response;
  }

  // Demo mode: check localStorage-based session via cookie bridge
  // In demo mode, allow all access (auth is handled client-side)
  // ── S-03: In production, demo mode must NOT grant free access ──
  if (process.env.NODE_ENV === "production") {
    // Supabase is NOT configured in prod → block protected routes
    if (PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      loginUrl.searchParams.set("reason", "no_auth_backend");
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Development / test: allow demo access (client-side auth via httpOnly cookie)
  return NextResponse.next();
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
    "/((?!_next/static|_next/image|favicon.ico|logos/).*)",
  ],
};

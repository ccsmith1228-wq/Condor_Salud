import { NextResponse, type NextRequest } from "next/server";

// ─── Route classification ────────────────────────────────────
const AUTH_ROUTES = ["/auth/login", "/auth/registro", "/auth/forgot-password"];
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
  if (value.startsWith("/") && !value.startsWith("//") && !value.includes(":")) return value;
  return "/dashboard";
}

// ─── Middleware ───────────────────────────────────────────────
// IMPORTANT: Dashboard pages are ALWAYS accessible without login.
// They render with demo/mock data. Write operations are gated by
// DemoModal + RequirePermission on the client side.
// Only protected API routes require authentication (SH-04).

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public API routes — skip all checks
  if (PUBLIC_API_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
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
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Redirect authenticated users away from auth pages (login/register)
      if (user && AUTH_ROUTES.includes(pathname)) {
        const redirectTo = sanitizeRedirect(request.nextUrl.searchParams.get("redirect"));
        return NextResponse.redirect(new URL(redirectTo, request.url));
      }

      // RBAC: role-based dashboard sub-route access (authenticated users only)
      if (user && pathname.startsWith("/dashboard/")) {
        const role = user.user_metadata?.role as string | undefined;
        if (role) {
          const { canAccessRoute } = await import("@/lib/auth/rbac");
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
    } catch {
      // If Supabase auth fails, allow page access (demo-browsable)
      // but block API routes as a precaution
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Auth service unavailable" }, { status: 503 });
      }
      return NextResponse.next();
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
    return NextResponse.json({ error: "Auth backend not configured" }, { status: 503 });
  }

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

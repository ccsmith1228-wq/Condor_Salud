import { NextResponse, type NextRequest } from "next/server";

// ─── Protected routes ────────────────────────────────────────
const PROTECTED_PREFIXES = ["/dashboard", "/paciente"];
const AUTH_ROUTES = ["/auth/login", "/auth/registro"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
    if (!user && PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Redirect authenticated users away from auth pages
    if (user && AUTH_ROUTES.includes(pathname)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return response;
  }

  // Demo mode: check localStorage-based session via cookie bridge
  // In demo mode, allow all access (auth is handled client-side)
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
     * - API routes
     */
    "/((?!_next/static|_next/image|favicon.ico|logos/|api/).*)",
  ],
};

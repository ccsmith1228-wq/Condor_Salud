// ─── Session API ─────────────────────────────────────────────
// Manages user sessions.
// When Supabase is configured, delegates to Supabase Auth.
// In demo/dev mode, uses httpOnly cookies for session simulation.
//
// POST /api/auth/session — Create session (login)
// GET  /api/auth/session — Read current session
// DELETE /api/auth/session — Destroy session (logout)

import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

const COOKIE_NAME = "condor_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: MAX_AGE,
    path: "/",
  };
}

// ─── Demo user for development (NOT used in production) ──────
const DEMO_USER = {
  id: "demo-001",
  email: "demo@condorsalud.com",
  name: "Dr. Martín Rodríguez",
  role: "admin" as const,
  clinicId: "clinic-001",
  clinicName: "Centro Médico Sur",
};

const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return (
    !!url && url !== "https://your-project.supabase.co" && url !== "https://placeholder.supabase.co"
  );
};

// ─── GET: Read current session ───────────────────────────────
export async function GET(req: NextRequest) {
  // ── Supabase mode: read session from Supabase cookies ──
  if (isSupabaseConfigured()) {
    try {
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = createClient();
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        return NextResponse.json({ user: null });
      }

      // Fetch profile data
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, full_name, avatar_url, clinic_id, clinics(name)")
        .eq("id", authUser.id)
        .single();

      const user = {
        id: authUser.id,
        email: authUser.email ?? "",
        name: profile?.full_name || authUser.user_metadata?.full_name || authUser.email,
        role: profile?.role || "admin",
        clinicId: profile?.clinic_id || "",
        clinicName: (profile?.clinics as { name?: string })?.name || "",
        avatarUrl: profile?.avatar_url || authUser.user_metadata?.avatar_url,
      };

      return NextResponse.json({ user });
    } catch (err) {
      logger.error({ err, route: "auth/session" }, "Supabase session read error");
      return NextResponse.json({ user: null });
    }
  }

  // ── Demo mode: read from httpOnly cookie ──
  const cookie = req.cookies.get(COOKIE_NAME)?.value;

  if (!cookie) {
    return NextResponse.json({ user: null });
  }

  try {
    const session = JSON.parse(cookie);
    return NextResponse.json({
      user: {
        id: session.id,
        email: session.email,
        name: session.name,
        role: session.role,
        clinicId: session.clinicId,
        clinicName: session.clinicName,
        avatarUrl: session.avatarUrl,
      },
    });
  } catch {
    const res = NextResponse.json({ user: null });
    res.cookies.delete(COOKIE_NAME);
    return res;
  }
}

// ─── POST: Create session (login) ───────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, action } = body as {
      email?: string;
      password?: string;
      action?: "login" | "register";
      name?: string;
      clinicName?: string;
    };

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email requerido" }, { status: 400 });
    }

    // ── S-03: BLOCK demo login in production ──
    if (process.env.NODE_ENV === "production" && !isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Autenticación no disponible. Contacte al administrador." },
        { status: 503 },
      );
    }

    // ── Supabase auth (production) ──
    if (isSupabaseConfigured()) {
      try {
        const { createClient } = await import("@/lib/supabase/server");
        const supabase = createClient();

        if (action === "register") {
          const { data, error } = await supabase.auth.signUp({
            email,
            password: password || "",
            options: {
              data: {
                full_name: body.name || email,
                clinic_name: body.clinicName || "Mi Clínica",
                role: "admin",
              },
            },
          });

          if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
          }

          return NextResponse.json({
            user: {
              id: data.user?.id,
              email: data.user?.email,
              name: body.name || email,
              role: "admin",
              clinicId: "",
              clinicName: body.clinicName || "",
            },
            success: true,
          });
        }

        // Login
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: password || "",
        });

        if (error || !data.user) {
          return NextResponse.json(
            { error: error?.message || "Email o contraseña incorrectos" },
            { status: 401 },
          );
        }

        // Fetch profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, full_name, avatar_url, clinic_id, clinics(name)")
          .eq("id", data.user.id)
          .single();

        return NextResponse.json({
          user: {
            id: data.user.id,
            email: data.user.email,
            name: profile?.full_name || data.user.user_metadata?.full_name || email,
            role: profile?.role || "admin",
            clinicId: profile?.clinic_id || "",
            clinicName: (profile?.clinics as { name?: string })?.name || "",
            avatarUrl: profile?.avatar_url,
          },
          success: true,
        });
      } catch (err) {
        logger.error({ err, route: "auth/session" }, "Supabase auth error");
        return NextResponse.json({ error: "Error de autenticación" }, { status: 500 });
      }
    }

    // ── Demo mode (development only) ──
    const user = {
      ...DEMO_USER,
      email,
      ...(body.name ? { name: body.name } : {}),
      ...(body.clinicName ? { clinicName: body.clinicName } : {}),
    };

    const response = NextResponse.json({ user, success: true });
    response.cookies.set(COOKIE_NAME, JSON.stringify(user), cookieOptions());

    logger.info({ userId: user.id, action: action ?? "login" }, "Session created");
    return response;
  } catch (err) {
    logger.error({ err, route: "auth/session" }, "Session creation error");
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// ─── DELETE: Destroy session (logout) ────────────────────────
export async function DELETE() {
  // ── Supabase: sign out server-side ──
  if (isSupabaseConfigured()) {
    try {
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // Best-effort
    }
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(COOKIE_NAME, "", {
    ...cookieOptions(),
    maxAge: 0,
  });
  logger.info("Session destroyed");
  return response;
}

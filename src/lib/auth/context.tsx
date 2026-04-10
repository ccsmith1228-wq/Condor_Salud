"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { isSupabaseConfigured } from "@/lib/env";

// ─── Types ───────────────────────────────────────────────────
export type UserRole = "admin" | "medico" | "facturacion" | "recepcion";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  clinicId: string;
  clinicName: string;
  avatarUrl?: string;
  /** True when the clinic is in demo mode — actions show DemoModal */
  isDemo: boolean;
  /** True when the clinic has finished onboarding */
  onboardingComplete: boolean;
  /** Clinic plan tier from DB (starter/growth/scale/enterprise) — used to auto-apply plan preset */
  planTier?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  hasPermission: (permission: Permission) => boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  clinicName: string;
  cuit: string;
  provincia: string;
  especialidad: string;
  financiadores: string[];
}

// ─── Permissions ─────────────────────────────────────────────
export type Permission =
  | "pacientes:read"
  | "pacientes:write"
  | "facturacion:read"
  | "facturacion:write"
  | "agenda:read"
  | "agenda:write"
  | "inventario:read"
  | "inventario:write"
  | "reportes:read"
  | "auditoria:read"
  | "configuracion:read"
  | "configuracion:write"
  | "equipo:manage";

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    "pacientes:read",
    "pacientes:write",
    "facturacion:read",
    "facturacion:write",
    "agenda:read",
    "agenda:write",
    "inventario:read",
    "inventario:write",
    "reportes:read",
    "auditoria:read",
    "configuracion:read",
    "configuracion:write",
    "equipo:manage",
  ],
  medico: ["pacientes:read", "pacientes:write", "agenda:read", "agenda:write"],
  facturacion: [
    "pacientes:read",
    "facturacion:read",
    "facturacion:write",
    "reportes:read",
    "auditoria:read",
    "inventario:read",
  ],
  recepcion: [
    "pacientes:read",
    "pacientes:write",
    "agenda:read",
    "agenda:write",
    "inventario:read",
  ],
};

// ─── Context ─────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // ── Supabase or Demo session bootstrap ─────────────────────
  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      // ── Demo user for local development ──
      const DEMO_USER: User = {
        id: "demo-doctor-001",
        email: "demo@condorsalud.com",
        name: "Dr. Rodriguez",
        role: "admin",
        clinicId: "demo-clinic-001",
        clinicName: "Clinica San Martin",
        isDemo: true,
        onboardingComplete: false,
      };

      // ── Supabase Auth Mode ──
      if (isSupabaseConfigured()) {
        try {
          const { createClient } = await import("@/lib/supabase/client");
          const supabase = createClient();

          // Get current authenticated user (server-validated, not local storage)
          const {
            data: { user: authUser },
          } = await supabase.auth.getUser();

          if (authUser) {
            const user = await resolveProfile(supabase, authUser);
            if (!cancelled) {
              setState({ user, isLoading: false, isAuthenticated: true });
            }
          } else if (!cancelled) {
            // No Supabase session — fall back to demo user.
            // The middleware currently allows unauthenticated access to /dashboard
            // (demo mode). When auth gates are re-enabled in middleware, server-side
            // redirects will prevent reaching this code, making the fallback inert.
            setState({ user: DEMO_USER, isLoading: false, isAuthenticated: true });
          }

          // Listen for auth state changes (login/logout/token refresh)
          const {
            data: { subscription },
          } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
            if (cancelled) return;
            if (newSession?.user) {
              const user = await resolveProfile(supabase, newSession.user);
              setState({ user, isLoading: false, isAuthenticated: true });
            } else {
              // No session — keep demo user active.
              // Explicit logout already navigates to /auth/login via handleLogout,
              // so we don't need to set user=null here in demo mode.
              setState({ user: DEMO_USER, isLoading: false, isAuthenticated: true });
            }
          });

          return () => {
            cancelled = true;
            subscription.unsubscribe();
          };
        } catch {
          if (!cancelled) {
            // Supabase unavailable — fall back to demo user
            setState({ user: DEMO_USER, isLoading: false, isAuthenticated: true });
          }
        }
        return;
      }

      // ── Demo Mode (cookie-based session via API) ──
      try {
        const res = await fetch("/api/auth/session", { credentials: "include" });
        if (!res.ok) throw new Error("Session fetch failed");
        const { user } = await res.json();
        if (!cancelled) {
          setState({
            user: user ?? DEMO_USER,
            isLoading: false,
            isAuthenticated: true,
          });
        }
      } catch {
        if (!cancelled) {
          setState({ user: DEMO_USER, isLoading: false, isAuthenticated: true });
        }
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Login ──────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string) => {
    // ── Supabase Auth ──
    if (isSupabaseConfigured()) {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error || !data.user) {
          return { success: false, error: mapSupabaseError(error?.message) };
        }

        // Profile is resolved by onAuthStateChange listener
        return { success: true };
      } catch {
        return { success: false, error: "Error de conexión" };
      }
    }

    // ── Demo fallback ──
    try {
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password, action: "login" }),
      });

      const data = await res.json();

      if (!res.ok || !data.user) {
        return { success: false, error: data.error ?? "Error al iniciar sesión" };
      }

      setState({ user: data.user, isLoading: false, isAuthenticated: true });
      return { success: true };
    } catch {
      return { success: false, error: "Error de conexión" };
    }
  }, []);

  // ── Register ───────────────────────────────────────────────
  const register = useCallback(async (data: RegisterData) => {
    // ── Supabase Auth ──
    if (isSupabaseConfigured()) {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data: authData, error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              full_name: data.name,
              clinic_name: data.clinicName,
              cuit: data.cuit,
              provincia: data.provincia,
              especialidad: data.especialidad,
              role: "admin", // First user of a clinic is always admin
            },
          },
        });

        if (error || !authData.user) {
          return { success: false, error: mapSupabaseError(error?.message) };
        }

        // Profile created by DB trigger (handle_new_user).
        // onAuthStateChange will pick up the new session.

        // Notify admin of new signup (fire-and-forget)
        fetch("/api/auth/signup-notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: data.name,
            email: data.email,
            clinicName: data.clinicName,
            cuit: data.cuit,
            provincia: data.provincia,
            especialidad: data.especialidad,
          }),
        }).catch(() => {}); // Silent — don't block registration

        return { success: true };
      } catch {
        return { success: false, error: "Error de conexión" };
      }
    }

    // ── Demo fallback ──
    try {
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          name: data.name,
          clinicName: data.clinicName,
          action: "register",
        }),
      });

      const result = await res.json();

      if (!res.ok || !result.user) {
        return { success: false, error: result.error ?? "Error al registrarse" };
      }

      setState({ user: result.user, isLoading: false, isAuthenticated: true });
      return { success: true };
    } catch {
      return { success: false, error: "Error de conexión" };
    }
  }, []);

  // ── Logout ─────────────────────────────────────────────────
  // SM-03: Also clear Google OAuth cookies
  const logout = useCallback(async () => {
    if (isSupabaseConfigured()) {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        await supabase.auth.signOut();
      } catch {
        // Best-effort
      }
    } else {
      try {
        await fetch("/api/auth/session", {
          method: "DELETE",
          credentials: "include",
        });
      } catch {
        // Best-effort
      }
    }
    // SM-03: Clear Google cookies (non-httpOnly ones clearable from client)
    document.cookie = "condor_google_user=; path=/; max-age=0";
    document.cookie = "condor_google_session=; path=/; max-age=0";
    setState({ user: null, isLoading: false, isAuthenticated: false });
  }, []);

  const hasPermission = useCallback(
    (permission: Permission) => {
      if (!state.user) return false;
      return ROLE_PERMISSIONS[state.user.role].includes(permission);
    },
    [state.user],
  );

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function useUser() {
  const { user } = useAuth();
  if (!user) throw new Error("useUser called without authenticated user");
  return user;
}

/**
 * Returns true when the current clinic is in demo mode.
 * Demo mode is true when:
 *   1. Supabase is not configured (local dev / preview), OR
 *   2. The authenticated clinic has `demo = true` in the DB
 */
export function useIsDemo(): boolean {
  const { user, isLoading } = useAuth();
  if (isLoading) return false; // Don't flash demo badge while loading
  if (!isSupabaseConfigured()) return true; // local dev fallback
  return user?.isDemo ?? false; // Authenticated user with no clinic → NOT demo
}

// ─── Helpers ─────────────────────────────────────────────────

/** Resolve Supabase auth.user → our User shape by querying the profiles table */
// @ts-expect-error -- Supabase client and auth user types vary by version
async function resolveProfile(supabase, authUser): Promise<User> {
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select(
        "role, full_name, avatar_url, clinic_id, clinics(name, demo, onboarding_completed, plan_tier)",
      )
      .eq("id", authUser.id)
      .single();

    if (profile) {
      return {
        id: authUser.id,
        email: authUser.email ?? "",
        name: profile.full_name || authUser.user_metadata?.full_name || authUser.email,
        role: (profile.role as UserRole) || "recepcion",
        clinicId: profile.clinic_id,
        clinicName: profile.clinics?.name || "",
        avatarUrl: profile.avatar_url || authUser.user_metadata?.avatar_url,
        isDemo: profile.clinics?.demo ?? false,
        onboardingComplete: profile.clinics?.onboarding_completed ?? false,
        planTier: profile.clinics?.plan_tier ?? undefined,
      };
    }
  } catch {
    // Profile query failed — fall back to metadata
  }

  // Fallback: build from user_metadata (before profile trigger completes)
  return {
    id: authUser.id,
    email: authUser.email ?? "",
    name: authUser.user_metadata?.full_name || authUser.email,
    role: (authUser.user_metadata?.role as UserRole) || "recepcion",
    clinicId: "",
    clinicName: authUser.user_metadata?.clinic_name || "",
    avatarUrl: authUser.user_metadata?.avatar_url,
    isDemo: true, // No clinic linked yet → treat as demo
    onboardingComplete: false,
  };
}

/** Map Supabase auth error messages to Spanish */
function mapSupabaseError(msg?: string): string {
  if (!msg) return "Error al iniciar sesión";
  if (msg.includes("Invalid login")) return "Email o contraseña incorrectos";
  if (msg.includes("Email not confirmed")) return "Confirmá tu email antes de ingresar";
  if (msg.includes("User already registered")) return "Ya existe una cuenta con ese email";
  if (msg.includes("Password should be")) return "La contraseña debe tener al menos 8 caracteres";
  if (msg.includes("rate limit")) return "Demasiados intentos. Esperá un momento.";
  return msg;
}

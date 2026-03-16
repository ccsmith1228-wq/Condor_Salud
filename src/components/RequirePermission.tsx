"use client";

import { useAuth, type Permission, type UserRole } from "@/lib/auth/context";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { canAccessRoute } from "@/lib/auth/rbac";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";

// ─── Permission Gate ─────────────────────────────────────────
// Wraps UI that requires a specific permission. Renders fallback or nothing.

interface RequirePermissionProps {
  permission: Permission;
  children: ReactNode;
  /** Show fallback UI instead of hiding completely */
  fallback?: ReactNode;
}

export function RequirePermission({ permission, children, fallback }: RequirePermissionProps) {
  const { hasPermission, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;
  if (!isAuthenticated) return fallback ?? null;
  if (!hasPermission(permission)) return fallback ?? null;

  return <>{children}</>;
}

// ─── Role Gate ───────────────────────────────────────────────
// Shows content only for specific roles.

interface RequireRoleProps {
  roles: UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function RequireRole({ roles, children, fallback }: RequireRoleProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;
  if (!user || !roles.includes(user.role)) return fallback ?? null;

  return <>{children}</>;
}

// ─── Route Guard ─────────────────────────────────────────────
// Use in page components to block access based on RBAC route map.

interface RouteGuardProps {
  children: ReactNode;
}

export function RouteGuard({ children }: RouteGuardProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    if (user && !canAccessRoute(user.role, pathname)) {
      router.replace("/dashboard?forbidden=1");
    }
  }, [isLoading, isAuthenticated, user, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-celeste-dark border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (user && !canAccessRoute(user.role, pathname)) {
    return <AccessDenied />;
  }

  return <>{children}</>;
}

// ─── Access Denied Page ──────────────────────────────────────

function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
        <ShieldAlert className="w-8 h-8 text-red-500" />
      </div>
      <h2 className="text-xl font-bold text-ink mb-2">Acceso restringido</h2>
      <p className="text-sm text-ink-muted mb-6 max-w-md">
        No tenés permisos para acceder a esta sección. Contactá al administrador de tu clínica para
        solicitar acceso.
      </p>
      <Link
        href="/dashboard"
        className="px-4 py-2 text-sm font-semibold bg-celeste-dark text-white rounded-[4px] hover:bg-celeste transition"
      >
        Volver al Dashboard
      </Link>
    </div>
  );
}

// ─── usePermission hook ──────────────────────────────────────
// Lightweight hook to check a specific permission in components.

export function usePermission(permission: Permission): boolean {
  const { hasPermission } = useAuth();
  return hasPermission(permission);
}

// ─── useRole hook ────────────────────────────────────────────
export function useRole(): UserRole | null {
  const { user } = useAuth();
  return user?.role ?? null;
}

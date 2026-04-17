import type { UserRole, Permission } from "./context";

// ─── Role display names ──────────────────────────────────────
export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrador",
  medico: "Médico",
  facturacion: "Facturación",
  recepcion: "Recepción",
};

// ─── Route permission map ────────────────────────────────────
// Maps dashboard routes to required permissions
export const ROUTE_PERMISSIONS: Record<string, Permission> = {
  "/dashboard/pacientes": "pacientes:read",
  "/dashboard/agenda": "agenda:read",
  "/dashboard/disponibilidad": "agenda:read",
  "/dashboard/turnos-online": "agenda:read",
  "/dashboard/facturacion": "facturacion:read",
  "/dashboard/rechazos": "facturacion:read",
  "/dashboard/financiadores": "facturacion:read",
  "/dashboard/inflacion": "facturacion:read",
  "/dashboard/nomenclador": "facturacion:read",
  "/dashboard/inventario": "inventario:read",
  "/dashboard/reportes": "reportes:read",
  "/dashboard/auditoria": "auditoria:read",
  "/dashboard/alertas": "pacientes:read",
  "/dashboard/verificacion": "pacientes:read",
  "/dashboard/configuracion": "configuracion:read",
  "/dashboard/telemedicina": "pacientes:read",
  "/dashboard/farmacia": "inventario:read",
  "/dashboard/pagos": "facturacion:read",
  "/dashboard/nubix": "pacientes:read",
  "/dashboard/directorio": "pacientes:read",
  "/dashboard/triage": "pacientes:read",
  "/dashboard/recetas": "pacientes:write",
  "/dashboard/recetas/nueva": "pacientes:write",
  "/dashboard/wizard": "configuracion:read",
  "/dashboard/precios": "agenda:read",
  "/dashboard/cobros": "agenda:read",
  "/dashboard/interconsultas": "pacientes:read",
};

// ─── Check if a role can access a route ──────────────────────
export function canAccessRoute(role: UserRole, path: string): boolean {
  const ROLE_PERMISSIONS_MAP: Record<UserRole, Permission[]> = {
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

  // Find the matching route permission
  const matchingRoute = Object.keys(ROUTE_PERMISSIONS)
    .sort((a, b) => b.length - a.length) // longest match first
    .find((route) => path.startsWith(route));

  if (!matchingRoute) return true; // No permission required (e.g., /dashboard home)

  const requiredPermission = ROUTE_PERMISSIONS[matchingRoute];
  if (!requiredPermission) return true;
  return (ROLE_PERMISSIONS_MAP[role] ?? []).includes(requiredPermission);
}

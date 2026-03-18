"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { ToastProvider } from "@/components/Toast";
import { DemoModalProvider } from "@/components/DemoModal";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import Chatbot from "@/components/Chatbot";

import { SWRProvider } from "@/lib/swr";
import { useAuth } from "@/lib/auth/context";
import { usePlanSafe } from "@/lib/plan-context";
import type { ModuleId } from "@/lib/plan-config";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Search,
  Package,
  FileText,
  AlertTriangle,
  Building2,
  TrendingUp,
  Shield,
  Tag,
  ClipboardList,
  Bell,
  Settings,
  BookOpen,
  Wallet,
  Pill,
  Video,
  UserSearch,
  Stethoscope,
  Network,
} from "lucide-react";

const navIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "/dashboard": LayoutDashboard,
  "/dashboard/pacientes": Users,
  "/dashboard/agenda": Calendar,
  "/dashboard/verificacion": Search,
  "/dashboard/inventario": Package,
  "/dashboard/facturacion": FileText,
  "/dashboard/rechazos": AlertTriangle,
  "/dashboard/financiadores": Building2,
  "/dashboard/inflacion": TrendingUp,
  "/dashboard/auditoria": Shield,
  "/dashboard/nomenclador": Tag,
  "/dashboard/reportes": ClipboardList,
  "/dashboard/alertas": Bell,
  "/dashboard/configuracion": Settings,
  "/dashboard/wizard": BookOpen,
  "/dashboard/pagos": Wallet,
  "/dashboard/farmacia": Pill,
  "/dashboard/telemedicina": Video,
  "/dashboard/directorio": UserSearch,
  "/dashboard/interconsultas": Network,
  "/dashboard/triage": Stethoscope,
};

const navSections = [
  { title: null, items: [{ label: "Panel", href: "/dashboard" }] },
  {
    title: "GESTION CLINICA",
    items: [
      { label: "Pacientes", href: "/dashboard/pacientes" },
      { label: "Agenda", href: "/dashboard/agenda" },
      { label: "Verificacion", href: "/dashboard/verificacion" },
      { label: "Inventario", href: "/dashboard/inventario" },
    ],
  },
  {
    title: "FINANZAS",
    items: [
      { label: "Facturacion", href: "/dashboard/facturacion" },
      { label: "Rechazos", href: "/dashboard/rechazos" },
      { label: "Financiadores", href: "/dashboard/financiadores" },
      { label: "Inflacion", href: "/dashboard/inflacion" },
      { label: "Pagos", href: "/dashboard/pagos" },
    ],
  },
  {
    title: "INTELIGENCIA",
    items: [
      { label: "Auditoria", href: "/dashboard/auditoria" },
      { label: "Nomenclador", href: "/dashboard/nomenclador" },
      { label: "Reportes", href: "/dashboard/reportes" },
    ],
  },
  {
    title: "SERVICIOS",
    items: [
      { label: "Farmacia Online", href: "/dashboard/farmacia" },
      { label: "Telemedicina", href: "/dashboard/telemedicina" },
      { label: "Directorio Medico", href: "/dashboard/directorio" },
      { label: "Red Interconsultas", href: "/dashboard/interconsultas" },
      { label: "Triage", href: "/dashboard/triage" },
    ],
  },
  {
    title: "SISTEMA",
    items: [
      { label: "Alertas", href: "/dashboard/alertas" },
      { label: "Configuracion", href: "/dashboard/configuracion" },
      { label: "Recorrido Guiado", href: "/dashboard/wizard" },
    ],
  },
];

const ROUTE_MODULE_MAP: Record<string, ModuleId> = {
  "/dashboard/pacientes": "pacientes",
  "/dashboard/agenda": "agenda",
  "/dashboard/verificacion": "verificacion",
  "/dashboard/inventario": "inventario",
  "/dashboard/facturacion": "facturacion",
  "/dashboard/rechazos": "rechazos",
  "/dashboard/financiadores": "financiadores",
  "/dashboard/inflacion": "inflacion",
  "/dashboard/pagos": "pagos",
  "/dashboard/auditoria": "auditoria",
  "/dashboard/nomenclador": "nomenclador",
  "/dashboard/reportes": "reportes",
  "/dashboard/alertas": "alertas",
  "/dashboard/wizard": "wizard",
  "/dashboard/farmacia": "farmacia",
  "/dashboard/telemedicina": "telemedicina",
  "/dashboard/directorio": "directorio",
  "/dashboard/interconsultas": "interconsultas",
  "/dashboard/triage": "triage",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();
  const plan = usePlanSafe();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isNavVisible = (href: string): boolean => {
    // Always show: dashboard home, configuracion and sub-pages
    if (href === "/dashboard") return true;
    if (href.startsWith("/dashboard/configuracion")) return true;
    const moduleId = ROUTE_MODULE_MAP[href];
    if (!moduleId) return true; // Unknown routes always visible
    return plan.isModuleSelected(moduleId);
  };

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Close sidebar on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  const displayName = user?.name || "Dr. Rodríguez";
  const displayClinic = user?.clinicName || "Clínica San Martín";
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Skip to content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[200] focus:px-4 focus:py-2 focus:bg-celeste-dark focus:text-white focus:rounded-[4px] focus:text-sm focus:font-semibold"
      >
        Ir al contenido principal
      </a>

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          role="button"
          aria-label="Cerrar menú lateral"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Escape" && setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-60 bg-white border-r border-gray-200 flex flex-col shrink-0 transform transition-transform duration-200 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        role="navigation"
        aria-label="Navegación principal"
      >
        {/* Brand */}
        <div className="px-5 py-5 border-b border-gray-100 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5"
            aria-label="Ir al inicio — Cóndor Salud"
          >
            <Image
              src="/condor.png"
              alt="Cóndor Salud"
              width={36}
              height={36}
              className="w-9 h-9 object-contain"
            />
            <div className="font-display font-bold text-base">
              <span className="text-celeste-dark">CÓNDOR </span>
              <span className="text-gold">SALUD</span>
            </div>
          </Link>
          {/* Mobile close */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 text-gray-400 hover:text-gray-700 transition"
            aria-label="Cerrar menú"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-3 overflow-y-auto" aria-label="Menú del dashboard">
          {navSections.map((section, si) => {
            const visibleItems = section.items.filter((item) => isNavVisible(item.href));
            if (visibleItems.length === 0) return null;
            return (
              <div
                key={si}
                className={si > 0 ? "mt-5" : ""}
                role="group"
                aria-label={section.title || "Principal"}
              >
                {section.title && (
                  <div
                    className="px-3 mb-2 text-[10px] font-bold tracking-[0.16em] text-gray-400 uppercase"
                    aria-hidden="true"
                  >
                    {section.title}
                  </div>
                )}
                <div className="space-y-0.5">
                  {visibleItems.map((item) => {
                    const active =
                      pathname === item.href ||
                      (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] transition ${
                          active
                            ? "bg-celeste-50 text-celeste-dark font-semibold"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        }`}
                      >
                        {(() => {
                          const IconComp = navIcons[item.href];
                          return IconComp ? <IconComp className="w-4 h-4" /> : null;
                        })()}
                        <span className="flex-1">{item.label}</span>
                        {"badge" in item && (item as { badge?: number }).badge ? (
                          <span
                            className="bg-red-100 text-red-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none"
                            aria-label={`${(item as { badge?: number }).badge} notificaciones`}
                          >
                            {(item as { badge?: number }).badge}
                          </span>
                        ) : null}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {/* Modificar plan link */}
          <div className="mt-5 px-3">
            <Link
              href="/planes"
              className="flex items-center gap-2 px-3 py-2 text-[11px] font-medium text-celeste-dark hover:bg-celeste-pale rounded-lg transition"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Modificar plan
            </Link>
          </div>
        </nav>

        {/* Bottom user section */}
        <div className="px-4 py-3 border-t border-gray-100">
          <Link href="/dashboard/configuracion/equipo" className="flex items-center gap-2.5 group">
            <div
              className="w-8 h-8 rounded-full bg-celeste-100 flex items-center justify-center text-celeste-700 font-bold text-xs"
              aria-hidden="true"
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-gray-700 font-medium truncate group-hover:text-gray-900 transition">
                {displayName}
              </div>
              <div className="text-[10px] text-gray-400 truncate">{displayClinic}</div>
            </div>
          </Link>
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
            <Link href="/" className="text-[10px] text-gray-400 hover:text-celeste-dark transition">
              Volver al sitio
            </Link>
            <button
              onClick={handleLogout}
              className="text-[10px] text-gray-400 hover:text-red-500 transition ml-auto"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header
          className="h-14 border-b border-border bg-white flex items-center justify-between px-4 lg:px-6 shrink-0"
          role="banner"
        >
          {/* Mobile hamburger */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 -ml-2 text-ink-light hover:text-ink transition"
            aria-label="Abrir menú de navegación"
            aria-expanded={sidebarOpen ? "true" : "false"}
            aria-controls="sidebar"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <div className="text-sm text-ink-light hidden sm:block">
            {new Date().toLocaleDateString("es-AR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <Link
              href="/dashboard/alertas"
              className="relative text-ink-muted hover:text-ink transition"
              aria-label="Alertas — 5 nuevas"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
                />
              </svg>
              <span
                className="absolute -top-1 -right-1 w-4 h-4 bg-celeste-dark text-white text-[8px] font-bold rounded-full flex items-center justify-center"
                aria-hidden="true"
              >
                5
              </span>
            </Link>
            <div className="h-5 w-px bg-border" aria-hidden="true" />
            <Link href="/dashboard/configuracion" className="flex items-center gap-2.5 group">
              <span className="text-xs text-ink-muted group-hover:text-ink transition hidden sm:inline">
                {displayName}
              </span>
              <div
                className="w-8 h-8 rounded-full bg-celeste-pale flex items-center justify-center text-celeste-dark font-bold text-xs"
                aria-hidden="true"
              >
                {initials}
              </div>
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main
          id="main-content"
          className="flex-1 overflow-y-auto bg-surface p-4 lg:p-6"
          role="main"
          tabIndex={-1}
        >
          <SWRProvider>
            <ToastProvider>
              <DemoModalProvider>{children}</DemoModalProvider>
            </ToastProvider>
          </SWRProvider>
        </main>
        <WhatsAppFloat />
        <Chatbot />
      </div>
    </div>
  );
}

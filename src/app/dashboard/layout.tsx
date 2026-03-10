"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { ToastProvider } from "@/components/Toast";
import { SWRProvider } from "@/lib/swr";
import { useAuth } from "@/lib/auth/context";

const navSections = [
  { title: null, items: [{ label: "Dashboard", href: "/dashboard", icon: "📊" }] },
  {
    title: "GESTIÓN CLÍNICA",
    items: [
      { label: "Pacientes", href: "/dashboard/pacientes", icon: "👥" },
      { label: "Agenda", href: "/dashboard/agenda", icon: "📅" },
      { label: "Verificación", href: "/dashboard/verificacion", icon: "🔍" },
      { label: "Inventario", href: "/dashboard/inventario", icon: "📦" },
    ],
  },
  {
    title: "FINANZAS",
    items: [
      { label: "Facturación", href: "/dashboard/facturacion", icon: "📄" },
      { label: "Rechazos", href: "/dashboard/rechazos", icon: "⚠️" },
      { label: "Financiadores", href: "/dashboard/financiadores", icon: "🏛️" },
      { label: "Inflación", href: "/dashboard/inflacion", icon: "📈" },
    ],
  },
  {
    title: "INTELIGENCIA",
    items: [
      { label: "Auditoría", href: "/dashboard/auditoria", icon: "🛡️" },
      { label: "Nomenclador", href: "/dashboard/nomenclador", icon: "🏷️" },
      { label: "Reportes", href: "/dashboard/reportes", icon: "📋" },
    ],
  },
  {
    title: "SISTEMA",
    items: [
      { label: "Alertas", href: "/dashboard/alertas", icon: "🔔", badge: 5 },
      { label: "Configuración", href: "/dashboard/configuracion", icon: "⚙️" },
    ],
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-60 bg-ink flex flex-col shrink-0 transform transition-transform duration-200 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        role="navigation"
        aria-label="Navegación principal"
      >
        {/* Brand */}
        <div className="px-5 py-5 border-b border-white/10 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5"
            aria-label="Ir al inicio — Cóndor Salud"
          >
            <Image
              src="/logos/condor.png"
              alt="Cóndor Salud"
              width={36}
              height={36}
              className="w-9 h-9 object-contain"
            />
            <div>
              <div className="font-bold text-sm text-celeste-light tracking-[2px] leading-none">
                CÓNDOR
              </div>
              <div className="text-[8px] font-bold text-gold tracking-[0.2em] leading-none">
                S A L U D
              </div>
            </div>
          </Link>
          {/* Mobile close */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 text-white/60 hover:text-white transition"
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
          {navSections.map((section, si) => (
            <div
              key={si}
              className={si > 0 ? "mt-5" : ""}
              role="group"
              aria-label={section.title || "Principal"}
            >
              {section.title && (
                <div
                  className="px-3 mb-2 text-[9px] font-bold tracking-[0.16em] text-white/25 uppercase"
                  aria-hidden="true"
                >
                  {section.title}
                </div>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const active =
                    pathname === item.href ||
                    (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center gap-3 px-3 py-2 rounded text-[13px] transition ${
                        active
                          ? "bg-celeste-dark/20 text-white font-medium"
                          : "text-ink-muted hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <span className="text-sm w-5 text-center" aria-hidden="true">
                        {item.icon}
                      </span>
                      <span className="flex-1">{item.label}</span>
                      {"badge" in item && item.badge ? (
                        <span
                          className="bg-gold text-ink text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none"
                          aria-label={`${item.badge} notificaciones`}
                        >
                          {item.badge}
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom user section */}
        <div className="px-4 py-3 border-t border-white/10">
          <Link href="/dashboard/configuracion/equipo" className="flex items-center gap-2.5 group">
            <div
              className="w-8 h-8 rounded-full bg-celeste-dark/30 flex items-center justify-center text-celeste-light font-bold text-xs"
              aria-hidden="true"
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-white/80 font-medium truncate group-hover:text-white transition">
                {displayName}
              </div>
              <div className="text-[10px] text-ink-muted/60 truncate">{displayClinic}</div>
            </div>
          </Link>
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/10">
            <Link href="/" className="text-[10px] text-ink-muted/60 hover:text-white transition">
              ← Volver al sitio
            </Link>
            <button
              onClick={handleLogout}
              className="text-[10px] text-ink-muted/60 hover:text-white transition ml-auto"
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
            aria-expanded={sidebarOpen}
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
                className="absolute -top-1 -right-1 w-4 h-4 bg-gold text-ink text-[8px] font-bold rounded-full flex items-center justify-center"
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
            <ToastProvider>{children}</ToastProvider>
          </SWRProvider>
        </main>
      </div>
    </div>
  );
}

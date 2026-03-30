"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { ToastProvider } from "@/components/Toast";
import { SWRProvider } from "@/lib/swr";
import { usePatientName } from "@/lib/hooks/usePatientName";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import Chatbot from "@/components/Chatbot";
import { useLocale } from "@/lib/i18n/context";

import {
  Heart,
  Calendar,
  Shield,
  Pill,
  Video,
  UserSearch,
  Activity,
  FileText,
  User,
  LogOut,
  Menu,
  X,
  ChevronRight,
  MapPin,
  Wallet,
} from "lucide-react";

const navItems = [
  { label: "Mi Salud", href: "/paciente", icon: Heart, tKey: "nav.myHealth" },
  { label: "Mis Turnos", href: "/paciente/turnos", icon: Calendar, tKey: "nav.myAppointments" },
  { label: "Mi Cobertura", href: "/paciente/cobertura", icon: Shield, tKey: "nav.myCoverage" },
  {
    label: "Mis Medicamentos",
    href: "/paciente/medicamentos",
    icon: Pill,
    tKey: "nav.myMedications",
  },
  {
    label: "Mis Recetas",
    href: "/paciente/recetas",
    icon: FileText,
    tKey: "nav.myPrescriptions",
  },
  {
    label: "Teleconsulta",
    href: "/paciente/teleconsulta",
    icon: Video,
    tKey: "nav.teleconsultation",
  },
  { label: "Buscar Médico", href: "/paciente/medicos", icon: UserSearch, tKey: "nav.findDoctor" },
  {
    label: "Chequear Síntomas",
    href: "/paciente/sintomas",
    icon: Activity,
    tKey: "nav.checkSymptoms",
  },
  {
    label: "Historia Clínica",
    href: "/paciente/historia",
    icon: FileText,
    tKey: "nav.medicalHistory",
  },
  { label: "Mi Perfil", href: "/paciente/perfil", icon: User, tKey: "nav.myProfile" },
  { label: "Mis Pagos", href: "/paciente/pagos", icon: Wallet, tKey: "nav.myPayments" },
  { label: "Mapa", href: "/paciente/mapa", icon: MapPin, tKey: "nav.map" },
  { label: "Club Salud", href: "/paciente/club", icon: Heart, tKey: "nav.healthClub" },
  { label: "Seguimiento", href: "/paciente/salud", icon: Activity, tKey: "nav.healthTracker" },
];

// Demo insurance info (mocked)
const DEMO_INSURANCE = "OSDE 310";
const DEMO_MEMBER_ID = "08-29384756-3";
const IS_DEMO_DATA = true; // Flag for demo badge visibility

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { name, setName, initials, needsName, loaded } = usePatientName();
  const { t } = useLocale();
  const [nameInput, setNameInput] = useState("");

  const displayName = name || t("patient.fallbackName");
  const displayInitials = initials;

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("condor_session");
    router.push("/");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      {/* Skip to content */}
      <a
        href="#patient-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[200] focus:px-4 focus:py-2 focus:bg-celeste-dark focus:text-white focus:rounded-lg focus:text-sm focus:font-semibold"
      >
        {t("aria.skipToPatientContent")}
      </a>

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") setSidebarOpen(false);
          }}
          role="button"
          tabIndex={0}
          aria-label={t("aria.closeMenu")}
        />
      )}

      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-border-light flex flex-col shrink-0 transform transition-transform duration-200 ease-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand */}
        <div className="px-5 py-4 border-b border-border-light flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/condor.png"
              alt="Cóndor Salud"
              width={36}
              height={36}
              className="w-9 h-9 object-contain"
            />
            <div className="font-display font-bold text-[15px]">
              <span className="text-celeste-dark">CÓNDOR </span>
              <span className="text-gold">SALUD</span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 text-ink-muted hover:text-ink transition"
            aria-label={t("aria.closeMenu")}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Patient info card */}
        <div className="px-4 py-4 border-b border-border-light">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-celeste-100 flex items-center justify-center text-celeste-dark font-bold text-sm">
              {displayInitials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink truncate">{displayName}</p>
              <p className="text-[11px] text-ink-muted truncate">{DEMO_INSURANCE}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 px-3 overflow-y-auto">
          <div className="space-y-0.5">
            {navItems.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/paciente" && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] transition group ${
                    active
                      ? "bg-celeste-50 text-celeste-dark font-semibold"
                      : "text-ink-500 hover:text-ink hover:bg-ink-50"
                  }`}
                >
                  <Icon
                    className={`w-[18px] h-[18px] ${active ? "text-celeste-dark" : "text-ink-300 group-hover:text-ink-500"}`}
                  />
                  <span className="flex-1">{item.tKey ? t(item.tKey) : item.label}</span>
                  {active && <ChevronRight className="w-3.5 h-3.5 text-celeste-300" />}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Bottom actions */}
        <div className="px-4 py-3 border-t border-border-light space-y-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-[11px] text-ink-muted hover:text-celeste-dark transition"
          >
            {t("nav.professionalPortal")}
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-[11px] text-ink-muted hover:text-red-500 transition w-full"
          >
            <LogOut className="w-3.5 h-3.5" />
            {t("action.logout")}
          </button>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-border-light flex items-center justify-between px-4 lg:px-6 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 -ml-2 text-ink-light hover:text-ink transition"
            aria-label={t("aria.openMenu")}
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden sm:block text-sm text-ink-muted">{t("patient.portal")}</div>

          <div className="flex items-center gap-3 ml-auto">
            <span className="text-xs text-ink-muted hidden sm:inline">{displayName}</span>
            <Link
              href="/paciente/perfil"
              className="w-8 h-8 rounded-full bg-celeste-100 flex items-center justify-center text-celeste-dark font-bold text-xs hover:ring-2 hover:ring-celeste-200 transition"
            >
              {displayInitials}
            </Link>
          </div>
        </header>

        {/* Content */}
        <main id="patient-content" className="flex-1 overflow-y-auto bg-surface p-4 lg:p-6">
          {IS_DEMO_DATA && (
            <div className="mb-3 flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800">
              <span className="inline-flex items-center rounded bg-amber-200 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                DEMO
              </span>
              {t("demo.banner") ?? "Estás viendo datos de demostración"}
            </div>
          )}
          <SWRProvider>
            <ToastProvider>{children}</ToastProvider>
          </SWRProvider>
        </main>
      </div>

      <WhatsAppFloat />
      <Chatbot />

      {/* Name prompt modal — shown once when no name cookie exists */}
      {loaded && needsName && (
        <div className="fixed inset-0 bg-black/40 z-[200] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-chatOpen">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-celeste-100 flex items-center justify-center">
                <User className="w-5 h-5 text-celeste-dark" />
              </div>
              <div>
                <h2 className="text-lg font-display font-bold text-ink">
                  {t("patient.welcomeTitle")}
                </h2>
                <p className="text-xs text-ink-muted">{t("patient.portalSubtitle")}</p>
              </div>
            </div>
            <p className="text-sm text-ink-light mb-4">{t("patient.welcomePrompt")}</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (nameInput.trim()) setName(nameInput.trim());
              }}
            >
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder={t("patient.namePlaceholder")}
                autoFocus
                className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:border-celeste-dark focus:ring-2 focus:ring-celeste/20"
              />
              <button
                type="submit"
                disabled={!nameInput.trim()}
                className="w-full mt-3 px-4 py-3 bg-celeste-dark text-white text-sm font-semibold rounded-xl hover:bg-celeste transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {t("action.continue")}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

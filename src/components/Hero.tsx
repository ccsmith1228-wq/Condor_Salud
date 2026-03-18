"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  DollarSign,
  Heart,
  MapPin,
  Pill,
  Send,
  Shield,
  Stethoscope,
  Target,
  Timer,
  TrendingDown,
  User,
  Users,
  Video,
  Zap,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/context";

const trustLogos = ["PAMI", "OSDE", "Swiss Medical", "Galeno", "Medifé", "IOMA"];

export default function Hero() {
  const { t, segment, setSegment } = useLocale();

  const isProvider = segment === "provider" || segment === "default";

  // Tourist CTA links go to patient-facing pages
  const cta1Href = segment === "tourist" ? "/paciente/medicos" : "/auth/registro";
  const cta2Href = segment === "tourist" ? "/paciente" : "/dashboard";

  return (
    <section className="px-6 pt-16 pb-20 max-w-[1000px] mx-auto">
      {/* ── Audience Toggle ────────────────────────────── */}
      <div className="flex justify-center mb-6">
        <div
          className="inline-flex items-center bg-surface border border-border rounded-full p-1 gap-1"
          role="radiogroup"
          aria-label={t("seg.label")}
        >
          <button
            type="button"
            role="radio"
            aria-checked={isProvider}
            onClick={() => setSegment("provider")}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
              isProvider
                ? "bg-celeste-dark text-white shadow-sm"
                : "text-ink-muted hover:text-ink hover:bg-white"
            }`}
          >
            <Building2 className="w-4 h-4" />
            {t("seg.provider")}
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={segment === "tourist"}
            onClick={() => setSegment("tourist")}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
              segment === "tourist"
                ? "bg-celeste-dark text-white shadow-sm"
                : "text-ink-muted hover:text-ink hover:bg-white"
            }`}
          >
            <User className="w-4 h-4" />
            {t("seg.tourist")}
          </button>
        </div>
      </div>

      {/* Announcement banner */}
      <div className="flex justify-center mb-8">
        <Link
          href="/dashboard/configuracion/integraciones"
          className="inline-flex items-center gap-2 px-4 py-1.5 bg-celeste-pale border border-celeste/20 rounded-full text-xs hover:bg-celeste-100 hover:border-celeste/40 transition"
        >
          <span className="w-2 h-2 bg-celeste-dark rounded-full animate-pulse" />
          <span className="text-ink-light">{t("hero.badge")}</span>
          <ArrowRight className="w-3 h-3 text-celeste-dark" />
        </Link>
      </div>

      {/* Content crossfades when segment changes */}
      <div key={segment} className="text-center animate-segmentFade">
        <h1 className="text-[clamp(32px,5vw,56px)] font-bold text-ink leading-[1.1] mb-6">
          {t("hero.title1")}
          <br />
          <em className="not-italic text-celeste-dark">{t("hero.title2")}</em>
        </h1>
        <p className="text-lg text-ink-light leading-[1.7] max-w-[660px] mx-auto mb-8">
          {t("hero.subtitle")}
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
          <Link
            href={cta1Href}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-bold text-white bg-celeste-dark hover:bg-celeste rounded-[4px] transition"
          >
            {t("hero.cta1")}
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href={cta2Href}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-semibold text-ink-light border-[1.5px] border-border hover:border-celeste-dark hover:text-celeste-dark rounded-[4px] transition"
          >
            {t("hero.cta2")}
          </Link>
        </div>
        <p className="text-[11px] text-ink-muted mb-10">{t("hero.fine")}</p>

        {/* Dashboard preview — segment-aware */}
        <div className="relative max-w-[800px] mx-auto mb-10">
          <div className="bg-celeste-pale border border-border rounded-xl overflow-hidden shadow-lg">
            {/* Browser chrome */}
            <div className="bg-white/80 backdrop-blur border-b border-border px-5 py-3 flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-400" />
                <span className="w-3 h-3 rounded-full bg-gold" />
                <span className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="px-4 py-1 bg-surface rounded text-[11px] text-ink-muted">
                  {segment === "tourist" ? t("hero.mockUrl") : t("hero.mockUrl")}
                </div>
              </div>
            </div>

            {/* Content area */}
            <div className="p-5 sm:p-6 space-y-4">
              {isProvider ? <ProviderPreview t={t} /> : <TouristPreview t={t} />}
            </div>
          </div>
          <div className="absolute -inset-4 bg-celeste/5 rounded-2xl -z-10 blur-xl" />
        </div>

        {/* Trust logos */}
        <p className="text-[10px] font-bold tracking-[2px] text-ink-muted uppercase mb-4">
          {t("hero.trust")}
        </p>
        <div className="flex flex-wrap justify-center gap-6">
          {trustLogos.map((name) => (
            <div
              key={name}
              className="text-sm font-bold text-ink-muted/50 hover:text-celeste-dark transition"
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────
 * Provider Dashboard Preview
 * Shows billing KPIs, real-time alerts, and active automations
 * ──────────────────────────────────────────────────────────── */
function ProviderPreview({ t }: { t: (key: string) => string }) {
  return (
    <>
      {/* KPI row — 6 cards in 3x2 grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          {
            label: t("hero.mockBilled"),
            val: t("hero.mockBilledVal"),
            change: t("hero.mockBilledChange"),
            accent: "border-l-celeste-dark",
            icon: <BarChart3 className="w-3.5 h-3.5 text-celeste-dark" />,
          },
          {
            label: t("hero.mockCollected"),
            val: t("hero.mockCollectedVal"),
            change: t("hero.mockCollectedChange"),
            accent: "border-l-green-400",
            icon: <DollarSign className="w-3.5 h-3.5 text-green-500" />,
          },
          {
            label: t("hero.mockRejections"),
            val: t("hero.mockRejectionsVal"),
            change: t("hero.mockRejectionsChange"),
            accent: "border-l-red-400",
            icon: <TrendingDown className="w-3.5 h-3.5 text-red-400" />,
          },
          {
            label: t("hero.mockDelay"),
            val: t("hero.mockDelayVal"),
            change: t("hero.mockDelayChange"),
            accent: "border-l-amber-400",
            icon: <Timer className="w-3.5 h-3.5 text-amber-500" />,
          },
          {
            label: t("hero.mockPatients"),
            val: t("hero.mockPatientsVal"),
            change: t("hero.mockPatientsChange"),
            accent: "border-l-purple-400",
            icon: <Users className="w-3.5 h-3.5 text-purple-500" />,
          },
          {
            label: t("hero.mockAgenda"),
            val: t("hero.mockAgendaVal"),
            change: t("hero.mockAgendaChange"),
            accent: "border-l-celeste",
            icon: <Calendar className="w-3.5 h-3.5 text-celeste" />,
          },
        ].map((k) => (
          <div
            key={k.label}
            className={`bg-white border border-border/60 ${k.accent} border-l-[3px] rounded-lg p-3 text-left`}
          >
            <p className="text-[10px] text-ink-muted flex items-center gap-1">
              {k.icon} {k.label}
            </p>
            <p className="text-lg font-bold text-ink">{k.val}</p>
            <p className="text-[10px] text-celeste-dark font-medium">{k.change}</p>
          </div>
        ))}
      </div>

      {/* Revenue target bar */}
      <div className="bg-white border border-border/60 rounded-lg px-4 py-3 flex items-center gap-4">
        <div className="flex items-center gap-2 flex-shrink-0">
          <Target className="w-4 h-4 text-celeste-dark" />
          <span className="text-xs font-semibold text-ink">{t("hero.mockRevenueTitle")}</span>
        </div>
        <div className="flex-1">
          <div className="w-full bg-surface rounded-full h-2.5">
            <div
              className="bg-celeste-dark rounded-full h-2.5 transition-all"
              style={{ width: "78%" }}
            />
          </div>
        </div>
        <span className="text-xs font-bold text-celeste-dark flex-shrink-0">
          {t("hero.mockRevenuePercent")}
        </span>
        <span className="text-[10px] text-ink-muted flex-shrink-0 hidden sm:inline">
          {t("hero.mockRevenueLabel")}
        </span>
      </div>

      {/* Three-column: Alerts + Automations + Spark */}
      <div className="grid sm:grid-cols-5 gap-3">
        {/* Alerts feed — 3 cols */}
        <div className="sm:col-span-3 bg-white border border-border/60 rounded-lg p-4 text-left">
          <p className="text-xs font-semibold text-ink mb-3 flex items-center gap-1.5">
            <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
            {t("hero.mockAlertsTitle")}
          </p>
          <div className="space-y-2">
            {[
              t("hero.mockAlert1"),
              t("hero.mockAlert2"),
              t("hero.mockAlert3"),
              t("hero.mockAlert4"),
            ].map((alert, i) => (
              <div
                key={`alert-${i}`}
                className="flex items-start gap-2 px-3 py-2 bg-surface/60 rounded-md"
              >
                <p className="text-[11px] text-ink-light leading-snug">{alert}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Automations — 2 cols */}
        <div className="sm:col-span-2 bg-white border border-border/60 rounded-lg p-4 text-left">
          <p className="text-xs font-semibold text-ink mb-3 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-celeste-dark" />
            {t("hero.mockAutoTitle")}
          </p>
          <div className="space-y-2">
            {[
              t("hero.mockAuto1"),
              t("hero.mockAuto2"),
              t("hero.mockAuto3"),
              t("hero.mockAuto4"),
            ].map((item, i) => (
              <div
                key={`auto-${i}`}
                className="flex items-center gap-2 px-3 py-2 bg-celeste-pale/40 border border-celeste/10 rounded-md"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-celeste-dark flex-shrink-0" />
                <p className="text-[11px] font-medium text-ink">{item}</p>
              </div>
            ))}
          </div>
          {/* Mini chart spark */}
          <div className="mt-3 flex items-end gap-1 h-10">
            {[40, 55, 45, 65, 60, 75, 80, 70, 85, 90, 82, 95].map((h, i) => (
              <div
                key={`spark-${i}`}
                className="flex-1 bg-celeste-dark/20 rounded-sm"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

/* ────────────────────────────────────────────────────────────────
 * Tourist / Patient Preview
 * Shows upcoming appointments, Cora chatbot, and quick-access cards
 * ──────────────────────────────────────────────────────────── */
function TouristPreview({ t }: { t: (key: string) => string }) {
  const appointments = [
    {
      doctor: t("hero.mockAppt1.doctor"),
      spec: t("hero.mockAppt1.spec"),
      time: t("hero.mockAppt1.time"),
      icon: <Video className="w-3.5 h-3.5 text-celeste-dark" />,
      accent: "border-l-celeste-dark",
    },
    {
      doctor: t("hero.mockAppt2.doctor"),
      spec: t("hero.mockAppt2.spec"),
      time: t("hero.mockAppt2.time"),
      icon: <MapPin className="w-3.5 h-3.5 text-gold" />,
      accent: "border-l-gold",
    },
    {
      doctor: t("hero.mockAppt3.doctor"),
      spec: t("hero.mockAppt3.spec"),
      time: t("hero.mockAppt3.time"),
      icon: <MapPin className="w-3.5 h-3.5 text-gold" />,
      accent: "border-l-gold",
    },
  ];

  return (
    <>
      {/* KPI row — 6 cards in 3x2 grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          {
            label: t("hero.mockBilled"),
            val: t("hero.mockBilledVal"),
            sub: t("hero.mockBilledChange"),
            icon: <Clock className="w-3.5 h-3.5 text-celeste-dark" />,
            accent: "border-l-celeste-dark",
          },
          {
            label: t("hero.mockCollected"),
            val: t("hero.mockCollectedVal"),
            sub: t("hero.mockCollectedChange"),
            icon: <Video className="w-3.5 h-3.5 text-green-500" />,
            accent: "border-l-green-400",
          },
          {
            label: t("hero.mockRejections"),
            val: t("hero.mockRejectionsVal"),
            sub: t("hero.mockRejectionsChange"),
            icon: <MapPin className="w-3.5 h-3.5 text-gold" />,
            accent: "border-l-gold",
          },
          {
            label: t("hero.mockDelay"),
            val: t("hero.mockDelayVal"),
            sub: t("hero.mockDelayChange"),
            icon: <Zap className="w-3.5 h-3.5 text-purple-500" />,
            accent: "border-l-purple-400",
          },
          {
            label: t("hero.mockPatients"),
            val: t("hero.mockPatientsVal"),
            sub: t("hero.mockPatientsChange"),
            icon: <Shield className="w-3.5 h-3.5 text-emerald-500" />,
            accent: "border-l-emerald-400",
          },
          {
            label: t("hero.mockAgenda"),
            val: t("hero.mockAgendaVal"),
            sub: t("hero.mockAgendaChange"),
            icon: <Pill className="w-3.5 h-3.5 text-rose-500" />,
            accent: "border-l-rose-400",
          },
        ].map((k) => (
          <div
            key={k.label}
            className={`bg-white border border-border/60 ${k.accent} border-l-[3px] rounded-lg p-3 text-left`}
          >
            <p className="text-[10px] text-ink-muted flex items-center gap-1.5">
              {k.icon} {k.label}
            </p>
            <p className="text-lg font-bold text-ink">{k.val}</p>
            <p className="text-[10px] text-celeste-dark font-medium">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Coverage status bar */}
      <div className="bg-white border border-border/60 rounded-lg px-4 py-3 flex items-center gap-3">
        <Shield className="w-4 h-4 text-emerald-500 flex-shrink-0" />
        <span className="text-xs font-semibold text-ink">{t("hero.mockCoverageTitle")}</span>
        <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
          {t("hero.mockCoveragePlan")}
        </span>
        <span className="text-[10px] text-ink-muted">{t("hero.mockCoverageStatus")}</span>
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 ml-auto flex-shrink-0" />
      </div>

      {/* Two-column: Appointments + Cora chatbot */}
      <div className="grid sm:grid-cols-5 gap-3">
        {/* Appointments list — 3 cols */}
        <div className="sm:col-span-3 bg-white border border-border/60 rounded-lg p-4 text-left">
          <p className="text-xs font-semibold text-ink mb-3 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-celeste-dark" />
            {t("hero.mockApptTitle")}
          </p>
          <div className="space-y-2">
            {appointments.map((appt, i) => (
              <div
                key={`appt-${i}`}
                className={`flex items-center gap-3 px-3 py-2.5 bg-surface/60 ${appt.accent} border-l-[3px] rounded-md`}
              >
                <div className="flex-shrink-0 w-8 h-8 bg-celeste-pale rounded-full flex items-center justify-center">
                  {appt.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-ink truncate">{appt.doctor}</p>
                  <p className="text-[10px] text-ink-muted truncate">{appt.spec}</p>
                </div>
                <span className="text-[10px] font-semibold text-celeste-dark whitespace-nowrap">
                  {appt.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Cora chatbot preview — 2 cols */}
        <div className="sm:col-span-2 bg-white border border-border/60 rounded-lg p-4 text-left flex flex-col">
          <p className="text-xs font-semibold text-ink mb-3 flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-celeste-dark" />
            {t("hero.mockCoraTitle")}
          </p>
          <div className="flex-1 space-y-2.5">
            {/* Cora greeting */}
            <div className="flex gap-2">
              <div className="w-6 h-6 bg-celeste-dark rounded-full flex items-center justify-center flex-shrink-0 text-[10px] text-white font-bold">
                C
              </div>
              <div className="bg-celeste-pale/60 border border-celeste/10 rounded-lg rounded-tl-none px-3 py-2 max-w-[85%]">
                <p className="text-[11px] text-ink leading-snug">{t("hero.mockCoraMsg")}</p>
              </div>
            </div>
            {/* User message */}
            <div className="flex gap-2 justify-end">
              <div className="bg-celeste-dark/10 border border-celeste/20 rounded-lg rounded-tr-none px-3 py-2 max-w-[85%]">
                <p className="text-[11px] text-ink leading-snug">{t("hero.mockCoraUser")}</p>
              </div>
              <div className="w-6 h-6 bg-ink-muted/20 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-3 h-3 text-ink-muted" />
              </div>
            </div>
            {/* Cora reply */}
            <div className="flex gap-2">
              <div className="w-6 h-6 bg-celeste-dark rounded-full flex items-center justify-center flex-shrink-0 text-[10px] text-white font-bold">
                C
              </div>
              <div className="bg-celeste-pale/60 border border-celeste/10 rounded-lg rounded-tl-none px-3 py-2 max-w-[85%]">
                <p className="text-[11px] text-ink leading-snug">{t("hero.mockCoraReply")}</p>
              </div>
            </div>
          </div>
          {/* Input bar */}
          <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-surface border border-border/60 rounded-full">
            <p className="flex-1 text-[10px] text-ink-muted truncate">{t("hero.mockCoraInput")}</p>
            <Send className="w-3.5 h-3.5 text-celeste-dark flex-shrink-0" />
          </div>
        </div>
      </div>
    </>
  );
}

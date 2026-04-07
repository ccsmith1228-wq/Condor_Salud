"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/context";
import { usePlanSafe } from "@/lib/plan-context";
import { PRESETS, formatARS } from "@/lib/plan-config";
import { whatsappUrl } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  KPIGridSkeleton,
  TableSkeleton,
} from "@/components/ui";
import { StatusBadge } from "@/components/ui";
import {
  Users,
  Calendar,
  Shield,
  Package,
  Tag,
  ClipboardList,
  BookOpen,
  Download,
  Loader2,
  BarChart3,
  Bell,
  FileText,
  Activity,
  MessageCircle,
  ArrowRight,
} from "lucide-react";
import { useExport } from "@/lib/services/export";
import { useLocale } from "@/lib/i18n/context";
import {
  useDashboardKPIs,
  useFinanciadores,
  useTurnos,
  useAuditoria,
  usePacientes,
} from "@/hooks/use-data";
import { useWhatsAppConfig } from "@/lib/hooks/useCRM";
import { useRealtimeTurnoNotifications } from "@/lib/services/realtime";
import { NotificationToastList, PatientSlideCard } from "@/components/TurnoNotifications";

// ─── Quick-link definitions (UI config — not mock data) ──────

const quickLinkIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Pacientes: Users,
  Agenda: Calendar,
  Auditoria: Shield,
  Inventario: Package,
  Nomenclador: Tag,
  Reportes: ClipboardList,
};

const quickLinks = [
  { label: "Pacientes", desc: "activos", href: "/dashboard/pacientes" },
  { label: "Agenda", desc: "turnos hoy", href: "/dashboard/agenda" },
  { label: "Auditoria", desc: "pendientes", href: "/dashboard/auditoria" },
  { label: "Inventario", desc: "críticos", href: "/dashboard/inventario" },
  { label: "Nomenclador", desc: "códigos", href: "/dashboard/nomenclador" },
  { label: "Reportes", desc: "disponibles", href: "/dashboard/reportes" },
];

export default function DashboardPage() {
  const { t } = useLocale();
  const { user } = useAuth();
  const plan = usePlanSafe();

  // ── Persist wizard banner dismissal per clinic ────────────
  // Only show to admins whose clinic hasn't completed onboarding yet
  const isAdmin = user?.role === "admin";
  const clinicOnboarded = user?.onboardingComplete ?? false;
  const bannerKey = user?.clinicId
    ? `condor_wizard_banner_dismissed_${user.clinicId}`
    : "condor_wizard_banner_dismissed";

  const [showWizardBanner, setShowWizardBanner] = useState(false);
  const [showMetaSetupBanner, setShowMetaSetupBanner] = useState(false);
  const { config: whatsAppConfig } = useWhatsAppConfig();

  useEffect(() => {
    // Non-admins never see it; already-onboarded clinics never see it
    if (!isAdmin || clinicOnboarded) {
      setShowWizardBanner(false);
      return;
    }
    try {
      const dismissed = localStorage.getItem(bannerKey);
      setShowWizardBanner(dismissed !== "true");
    } catch {
      setShowWizardBanner(true);
    }
  }, [bannerKey, isAdmin, clinicOnboarded]);

  const dismissBanner = useCallback(() => {
    setShowWizardBanner(false);
    try {
      localStorage.setItem(bannerKey, "true");
    } catch {
      /* localStorage unavailable — dismiss for session only */
    }
  }, [bannerKey]);

  const hasWhatsAppBootstrap = !!whatsAppConfig?.whatsapp_number;
  const hasMetaCredentials = !!(
    whatsAppConfig?.meta_phone_number_id && whatsAppConfig?.meta_access_token
  );
  const metaBannerKey = user?.clinicId
    ? `condor_meta_setup_banner_dismissed_${user.clinicId}`
    : "condor_meta_setup_banner_dismissed";

  useEffect(() => {
    if (!isAdmin || !clinicOnboarded || !hasWhatsAppBootstrap || hasMetaCredentials) {
      setShowMetaSetupBanner(false);
      return;
    }

    try {
      const dismissed = localStorage.getItem(metaBannerKey);
      setShowMetaSetupBanner(dismissed !== "true");
    } catch {
      setShowMetaSetupBanner(true);
    }
  }, [clinicOnboarded, hasMetaCredentials, hasWhatsAppBootstrap, isAdmin, metaBannerKey]);

  const dismissMetaSetupBanner = useCallback(() => {
    setShowMetaSetupBanner(false);
    try {
      localStorage.setItem(metaBannerKey, "true");
    } catch {
      /* localStorage unavailable */
    }
  }, [metaBannerKey]);

  const { isExporting, exportPDF } = useExport();

  // ── Real data hooks ──────────────────────────────────────
  const { data: kpiData } = useDashboardKPIs();
  const { data: financiadoresData } = useFinanciadores();
  const { data: turnosData } = useTurnos();
  const { data: auditoriaData } = useAuditoria();
  const { data: pacientesData } = usePacientes();

  // ── Realtime turno notifications (medico & admin only) ───
  const showNotifications = user?.role === "medico" || user?.role === "admin";
  const {
    notifications: turnoNotifs,
    activePatient: activePatientNotif,
    unreadCount,
    dismiss: dismissNotif,
    dismissAll: dismissAllNotifs,
    showPatient,
    closePatient,
  } = useRealtimeTurnoNotifications({
    enabled: showNotifications,
    profesionalFilter: user?.role === "medico" ? user.name : undefined,
    upcomingThresholdMin: 15,
  });

  // Derived states: undefined = loading, [] = no data, [...] = has data
  const isKpiLoading = kpiData === undefined;
  const isFinanciadoresLoading = financiadoresData === undefined;
  const isTurnosLoading = turnosData === undefined;
  const isAuditoriaLoading = auditoriaData === undefined;

  // Map KPI hook data → display cards (empty array if no data)
  const kpis = isKpiLoading
    ? []
    : kpiData.map((k) => ({
        label: k.label,
        value: k.value,
        change: k.change ?? "",
        up: k.up,
        accent: k.label.includes("Facturado")
          ? "border-l-celeste"
          : k.label.includes("Cobrado")
            ? "border-l-green-400"
            : k.label.includes("Rechazo")
              ? "border-l-amber-400"
              : "border-l-red-400",
        href: k.label.includes("Facturado")
          ? "/dashboard/facturacion"
          : k.label.includes("Cobrado")
            ? "/dashboard/financiadores"
            : k.label.includes("Rechazo")
              ? "/dashboard/rechazos"
              : "/dashboard/inflacion",
      }));

  // Map financiadores → table rows
  const financiadores = isFinanciadoresLoading
    ? []
    : financiadoresData.slice(0, 5).map((f) => ({
        name: f.name,
        facturado: formatARS(f.facturado),
        cobrado: formatARS(f.cobrado),
        rechazo: `${f.tasaRechazo}%`,
        dias: f.diasPromedioPago.toString(),
      }));

  // Map turnos → today agenda
  const todayAgenda = isTurnosLoading
    ? []
    : turnosData.slice(0, 4).map((t) => ({
        hora: t.hora,
        pac: t.paciente,
        tipo: t.tipo,
        estado: t.estado as "confirmado" | "pendiente",
      }));

  // Map audit → pending items
  const pendingAudit = isAuditoriaLoading
    ? []
    : auditoriaData
        .filter((a) => a.estado === "pendiente")
        .slice(0, 4)
        .map((a) => ({
          tipo: a.tipo,
          sev: a.severidad,
          pac: `${a.paciente} — ${a.financiador}`,
          monto: a.prestacion,
        }));

  // Quick-link live counts
  const pacCount = pacientesData === undefined ? "—" : pacientesData.length;
  const turnoCount = turnosData === undefined ? "—" : turnosData.length;
  const auditCount =
    auditoriaData === undefined
      ? "—"
      : auditoriaData.filter((a) => a.estado === "pendiente").length;
  const quickCounts: Record<string, string> = {
    Pacientes: `${pacCount} activos`,
    Agenda: `${turnoCount} turnos hoy`,
    Auditoria: `${auditCount} pendientes`,
  };

  const activePresetDef = plan.activePreset
    ? PRESETS.find((p) => p.id === plan.activePreset)
    : null;

  return (
    <div className="space-y-5">
      {/* Plan info bar */}
      <div className="flex items-center justify-between bg-celeste-pale/40 border border-celeste-100 rounded-lg px-4 py-2.5">
        <p className="text-xs text-ink">
          <span className="font-semibold">
            {activePresetDef
              ? `${t("label.plan")} ${activePresetDef.name}`
              : t("dashboard.customPlan")}
          </span>
          {" — "}
          {plan.selectedModules.length} {t("dashboard.activeModules")}
          {plan.total > 0 && (
            <span className="text-ink-muted">
              {" "}
              · {formatARS(plan.total)}
              {t("label.month")}
            </span>
          )}
        </p>
        <Link href="/planes" className="text-xs font-semibold text-celeste-dark hover:underline">
          {t("dashboard.modify")}
        </Link>
      </div>

      {/* Wizard onboarding banner */}
      {showWizardBanner && (
        <div className="relative bg-celeste-50 border border-celeste-200 rounded-xl p-5 overflow-hidden">
          <button
            onClick={dismissBanner}
            className="absolute top-3 right-3 text-celeste-400 hover:text-celeste-700 transition"
            aria-label={t("dashboard.closeBanner")}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-celeste-100 flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6 text-celeste-dark" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-bold text-ink">{t("dashboard.configureCta")}</h2>
              <p className="text-xs text-ink-muted mt-0.5 leading-relaxed">
                {t("dashboard.configureDesc")}
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Link
                href="/dashboard/wizard"
                className="px-5 py-2.5 text-xs font-semibold bg-celeste-dark text-white rounded-lg hover:bg-celeste transition"
              >
                {t("dashboard.startSetup")}
              </Link>
              <a
                href={whatsappUrl("Hola, quiero agendar una demo en vivo de Cóndor Salud.")}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 text-xs font-medium border border-celeste-200 text-celeste-dark rounded-lg hover:bg-celeste-50 transition flex items-center gap-1.5"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-3.5 h-3.5 fill-current text-[#25D366]"
                  aria-hidden="true"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                {t("dashboard.liveDemo")}
              </a>
            </div>
          </div>
        </div>
      )}

      {showMetaSetupBanner && (
        <div className="relative rounded-xl border border-celeste-200 bg-white p-4">
          <button
            onClick={dismissMetaSetupBanner}
            className="absolute top-3 right-3 text-celeste-400 hover:text-celeste-700 transition"
            aria-label="Cerrar banner de Meta"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3 pr-8 sm:pr-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-celeste-50">
                <MessageCircle className="h-5 w-5 text-celeste-dark" />
              </div>
              <div>
                <p className="text-sm font-bold text-ink">Conectá Meta en 2 pasos</p>
                <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                  Tu CRM de WhatsApp ya está preconfigurado. Solo faltan el{" "}
                  <strong className="text-ink">Phone Number ID</strong> y el{" "}
                  <strong className="text-ink">Permanent Access Token</strong> para empezar a
                  recibir mensajes reales.
                </p>
              </div>
            </div>

            <Link
              href="/dashboard/configuracion/whatsapp"
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-celeste-dark px-4 py-2 text-xs font-semibold text-white transition hover:bg-celeste"
            >
              Conectar ahora
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}
      {/* Page title */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">{t("dashboard.mainPanel")}</h1>
          <p className="text-sm text-ink-muted mt-0.5">
            {t("dashboard.executiveView")} · {user?.clinicName || "Mi Clínica"}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => exportPDF("kpi")}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium border border-border rounded-[4px] text-ink-light hover:border-celeste-dark hover:text-celeste-dark transition disabled:opacity-50"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {t("dashboard.kpiPdf")}
          </button>
          <Link
            href="/dashboard/reportes"
            className="px-4 py-2 text-sm font-medium border border-border rounded-[4px] text-ink-light hover:border-celeste-dark hover:text-celeste-dark transition"
          >
            {t("dashboard.generateReport")}
          </Link>
          <Link
            href="/dashboard/facturacion"
            className="px-4 py-2 text-sm font-semibold bg-celeste-dark text-white rounded-[4px] hover:bg-celeste transition"
          >
            {t("dashboard.viewBilling")}
          </Link>
        </div>
      </div>

      {/* KPI cards — skeleton while loading, empty state if no data */}
      {isKpiLoading ? (
        <KPIGridSkeleton count={4} />
      ) : kpis.length === 0 ? (
        <EmptyState
          compact
          icon={<Activity className="w-8 h-8 text-celeste-dark" />}
          title="Sin datos de facturación todavía"
          description="Los indicadores se generan automáticamente a partir de las facturas y cobros que cargues. Empezá registrando tu primera factura para ver tus KPIs en tiempo real."
          actionLabel="Ir a Facturación"
          actionHref="/dashboard/facturacion"
        />
      ) : (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          role="region"
          aria-label={t("dashboard.kpiTitle")}
        >
          {kpis.map((kpi) => (
            <Link
              key={kpi.label}
              href={kpi.href}
              className={`bg-white border border-border rounded-lg p-5 border-l-[3px] ${kpi.accent} hover:shadow-md hover:-translate-y-0.5 transition group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-celeste-dark`}
              aria-label={`${kpi.label}: ${kpi.value}, ${kpi.change}`}
            >
              <div className="text-[10px] font-bold tracking-wider text-ink-muted uppercase mb-1">
                {kpi.label}
              </div>
              <div className="text-2xl font-bold text-celeste-dark">{kpi.value}</div>
              <div className={`text-xs mt-1 ${kpi.up ? "text-green-600" : "text-ink-muted"}`}>
                {kpi.change}
              </div>
              <span
                className="text-[10px] text-celeste-dark font-medium mt-2 inline-block opacity-0 group-hover:opacity-100 transition"
                aria-hidden="true"
              >
                {t("dashboard.viewDetail")}
              </span>
            </Link>
          ))}
        </div>
      )}

      {/* Quick access grid */}
      <div
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
        role="navigation"
        aria-label={t("dashboard.shortcuts")}
      >
        {quickLinks.map((q) => (
          <Link
            key={q.label}
            href={q.href}
            className="bg-white border border-border rounded-lg p-4 text-center hover:shadow-md hover:-translate-y-0.5 transition group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-celeste-dark"
          >
            <span className="block mb-1" aria-hidden="true">
              {(() => {
                const I = quickLinkIcons[q.label];
                return I ? <I className="w-6 h-6 mx-auto text-celeste-dark" /> : null;
              })()}
            </span>
            <p className="text-xs font-bold text-ink group-hover:text-celeste-dark transition">
              {q.label}
            </p>
            <p className="text-[10px] text-ink-muted">{quickCounts[q.label] ?? q.desc}</p>
          </Link>
        ))}
      </div>

      {/* Two-column layout */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Chart — only rendered with real data */}
        <Card className="lg:col-span-2">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs text-ink-muted">{t("dashboard.revenueVsCollection")}</div>
              <Link
                href="/dashboard/financiadores"
                className="text-[10px] text-celeste-dark font-medium hover:underline"
              >
                {t("dashboard.viewInsurers")}
              </Link>
            </div>
            {isFinanciadoresLoading ? (
              <div className="h-48 flex items-end gap-3 px-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex gap-0.5">
                      <div
                        className="flex-1 bg-gray-200 animate-pulse rounded-t"
                        style={{ height: `${60 + i * 10}px` }}
                      />
                      <div
                        className="flex-1 bg-gray-100 animate-pulse rounded-t"
                        style={{ height: `${40 + i * 8}px` }}
                      />
                    </div>
                    <span className="text-[10px] text-ink-muted">M{i + 1}</span>
                  </div>
                ))}
              </div>
            ) : financiadores.length === 0 ? (
              <EmptyState
                compact
                icon={<BarChart3 className="w-7 h-7 text-celeste-dark" />}
                title="Sin datos de ingresos"
                description="Este gráfico muestra la comparación entre lo facturado y lo cobrado por financiador. Agregá financiadores y facturas para empezar a ver la evolución."
                actionLabel="Cargar financiadores"
                actionHref="/dashboard/financiadores"
              />
            ) : (
              <>
                <div
                  className="h-48 flex items-end gap-3 px-4"
                  role="img"
                  aria-label="Gráfico de barras: ingresos vs cobros"
                >
                  {financiadores.slice(0, 6).map((f) => {
                    const facNum = parseFloat(f.facturado.replace(/[$.]/g, "")) || 1;
                    const cobNum = parseFloat(f.cobrado.replace(/[$.]/g, "")) || 0;
                    const maxH = 180;
                    const cobH = Math.round((cobNum / facNum) * maxH) || 20;
                    return (
                      <div key={f.name} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full flex gap-0.5">
                          <div
                            className="flex-1 bg-celeste rounded-t transition-all duration-500"
                            style={{ height: `${maxH}px` }}
                          />
                          <div
                            className="flex-1 bg-celeste-light rounded-t transition-all duration-500"
                            style={{ height: `${cobH}px` }}
                          />
                        </div>
                        <span className="text-[10px] text-ink-muted truncate max-w-full">
                          {f.name.slice(0, 6)}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-4 mt-3 text-[10px] text-ink-muted">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 bg-celeste rounded-sm" aria-hidden="true" />{" "}
                    {t("dashboard.billed")}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 bg-celeste-light rounded-sm" aria-hidden="true" />{" "}
                    {t("dashboard.collected")}
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Alerts — empty state when no data */}
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs text-ink-muted">{t("dashboard.recentAlerts")}</div>
            </div>
            {isKpiLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="animate-pulse flex gap-2">
                    <div className="w-1 h-8 bg-gray-200 rounded" />
                    <div className="flex-1 space-y-1">
                      <div className="h-3 w-3/4 bg-gray-200 rounded" />
                      <div className="h-2 w-1/2 bg-gray-100 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                compact
                icon={<Bell className="w-6 h-6 text-celeste-dark" />}
                title="Sin alertas"
                description="Las alertas aparecen cuando hay rechazos, vencimientos próximos o actualizaciones de nomenclador. Se generan automáticamente al operar."
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Financiadores table */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-xs text-ink-muted font-normal">
            {t("dashboard.performanceByInsurer")}
          </CardTitle>
          <Link
            href="/dashboard/financiadores"
            className="text-[10px] text-celeste-dark font-medium hover:underline"
          >
            {t("dashboard.fullAnalysis")}
          </Link>
        </CardHeader>
        {isFinanciadoresLoading ? (
          <TableSkeleton rows={4} cols={5} />
        ) : financiadores.length === 0 ? (
          <EmptyState
            compact
            icon={<FileText className="w-7 h-7 text-celeste-dark" />}
            title="Sin financiadores registrados"
            description="Acá vas a ver el rendimiento de cada obra social y prepaga: lo facturado, lo cobrado, la tasa de rechazo y los días promedio de pago. Empezá cargando los financiadores con los que trabajás."
            actionLabel="Cargar financiadores"
            actionHref="/dashboard/financiadores"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" aria-label="Rendimiento por financiador">
              <thead>
                <tr className="bg-surface text-[10px] font-bold tracking-wider text-ink-muted uppercase">
                  <th scope="col" className="text-left px-5 py-2.5">
                    {t("billing.insurer")}
                  </th>
                  <th scope="col" className="text-right px-5 py-2.5">
                    {t("dashboard.billed")}
                  </th>
                  <th scope="col" className="text-right px-5 py-2.5">
                    {t("dashboard.collected")}
                  </th>
                  <th scope="col" className="text-right px-5 py-2.5">
                    {t("dashboard.rejection")}
                  </th>
                  <th scope="col" className="text-right px-5 py-2.5">
                    {t("dashboard.paymentDays")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {financiadores.map((f) => (
                  <tr
                    key={f.name}
                    className="border-t border-border-light hover:bg-celeste-pale/30 transition"
                  >
                    <td className="px-5 py-3 font-semibold text-ink">
                      <Link href="/dashboard/financiadores" className="hover:text-celeste-dark">
                        {f.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-right text-ink-light">{f.facturado}</td>
                    <td className="px-5 py-3 text-right text-ink-light">{f.cobrado}</td>
                    <td
                      className={`px-5 py-3 text-right font-semibold ${
                        parseFloat(f.rechazo) > 10
                          ? "text-red-500"
                          : parseFloat(f.rechazo) > 5
                            ? "text-amber-500"
                            : "text-green-600"
                      }`}
                    >
                      {f.rechazo}
                    </td>
                    <td
                      className={`px-5 py-3 text-right ${parseInt(f.dias) > 60 ? "text-red-500 font-semibold" : "text-ink-light"}`}
                    >
                      {f.dias}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Today's activity */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold tracking-wider text-ink-muted uppercase">
                {t("dashboard.todayAgenda")}
              </h3>
              <Link
                href="/dashboard/agenda"
                className="text-[10px] text-celeste-dark font-medium hover:underline"
              >
                {t("action.viewSchedule")}
              </Link>
            </div>
            {isTurnosLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center gap-3 py-2">
                    <div className="h-3 w-10 bg-gray-200 rounded" />
                    <div className="h-3 flex-1 bg-gray-200 rounded" />
                    <div className="h-3 w-16 bg-gray-100 rounded" />
                  </div>
                ))}
              </div>
            ) : todayAgenda.length === 0 ? (
              <EmptyState
                compact
                icon={<Calendar className="w-6 h-6 text-celeste-dark" />}
                title="Sin turnos hoy"
                description="Acá aparecen los turnos del día. Cargá tu agenda para ver los pacientes de hoy con horario, tipo de consulta y estado."
                actionLabel="Gestionar agenda"
                actionHref="/dashboard/agenda"
              />
            ) : (
              <div className="space-y-2" role="list" aria-label="Turnos de hoy">
                {todayAgenda.map((turno, i) => (
                  <Link
                    key={i}
                    href="/dashboard/agenda"
                    className="flex items-center gap-3 py-2 border-b border-border-light last:border-0 hover:bg-celeste-pale/30 transition rounded px-2 -mx-2"
                    role="listitem"
                  >
                    <span className="font-mono text-[10px] text-ink-muted w-10">{turno.hora}</span>
                    <span className="text-xs font-semibold text-ink flex-1">{turno.pac}</span>
                    <span className="text-[10px] text-ink-light">{turno.tipo}</span>
                    <StatusBadge
                      variant={turno.estado}
                      label={
                        turno.estado === "confirmado" ? t("status.confirmed") : t("status.pending")
                      }
                    />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold tracking-wider text-ink-muted uppercase">
                {t("dashboard.pendingAudit")}
              </h3>
              <Link
                href="/dashboard/auditoria"
                className="text-[10px] text-celeste-dark font-medium hover:underline"
              >
                {t("action.viewAudit")}
              </Link>
            </div>
            {isAuditoriaLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center gap-3 py-2">
                    <div className="h-2 w-2 bg-gray-200 rounded-full" />
                    <div className="h-3 flex-1 bg-gray-200 rounded" />
                    <div className="h-3 w-20 bg-gray-100 rounded" />
                  </div>
                ))}
              </div>
            ) : pendingAudit.length === 0 ? (
              <EmptyState
                compact
                icon={<Shield className="w-6 h-6 text-celeste-dark" />}
                title="Sin items de auditoría"
                description="La auditoría pre-facturación detecta errores de código, autorizaciones vencidas y duplicados antes de presentar. Se activa automáticamente al cargar facturas."
                actionLabel="Ir a facturación"
                actionHref="/dashboard/facturacion"
              />
            ) : (
              <div className="space-y-2" role="list" aria-label="Items de auditoría pendientes">
                {pendingAudit.map((a, i) => (
                  <Link
                    key={i}
                    href="/dashboard/auditoria"
                    className="flex items-center gap-3 py-2 border-b border-border-light last:border-0 hover:bg-celeste-pale/30 transition rounded px-2 -mx-2"
                    role="listitem"
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${a.sev === "alta" ? "bg-red-500" : "bg-amber-400"}`}
                      aria-label={`Severidad ${a.sev}`}
                    />
                    <span className="text-xs font-semibold text-ink flex-1">{a.tipo}</span>
                    <span className="text-[10px] text-ink-light">{a.pac}</span>
                    <span className="text-[10px] font-bold text-ink">{a.monto}</span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Realtime turno notifications overlay ───────────── */}
      {showNotifications && (
        <>
          <NotificationToastList
            notifications={turnoNotifs}
            onDismiss={dismissNotif}
            onDismissAll={dismissAllNotifs}
            onSelect={showPatient}
            unreadCount={unreadCount}
          />
          {activePatientNotif && (
            <PatientSlideCard notification={activePatientNotif} onClose={closePatient} />
          )}
        </>
      )}
    </div>
  );
}

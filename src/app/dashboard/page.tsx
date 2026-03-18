"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/context";
import { usePlanSafe } from "@/lib/plan-context";
import { PRESETS, formatARS } from "@/lib/plan-config";
import { whatsappUrl } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
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
} from "lucide-react";
import { useExport } from "@/lib/services/export";
import {
  useDashboardKPIs,
  useFinanciadores,
  useTurnos,
  useAuditoria,
  usePacientes,
} from "@/hooks/use-data";

// ─── Fallback static data (shown while hooks load) ──────────

const FALLBACK_KPIS = [
  {
    label: "Facturado este mes",
    value: "$4.2M",
    change: "+12%",
    up: true,
    accent: "border-l-celeste",
    href: "/dashboard/facturacion",
  },
  {
    label: "Cobrado",
    value: "$3.1M",
    change: "74% del facturado",
    up: true,
    accent: "border-l-green-400",
    href: "/dashboard/financiadores",
  },
  {
    label: "Rechazos PAMI",
    value: "8.2%",
    change: "-3.1% vs. mes ant.",
    up: false,
    accent: "border-l-amber-400",
    href: "/dashboard/rechazos",
  },
  {
    label: "Pérdida por inflación",
    value: "$320K",
    change: "7.6% del cobrado",
    up: false,
    accent: "border-l-red-400",
    href: "/dashboard/inflacion",
  },
];

const FALLBACK_FINANCIADORES = [
  { name: "PAMI", facturado: "$1.4M", cobrado: "$980K", rechazo: "12%", dias: "68" },
  { name: "OSDE", facturado: "$890K", cobrado: "$845K", rechazo: "4%", dias: "32" },
  { name: "Swiss Medical", facturado: "$620K", cobrado: "$595K", rechazo: "2%", dias: "28" },
  { name: "IOMA", facturado: "$410K", cobrado: "$312K", rechazo: "18%", dias: "82" },
  { name: "Galeno", facturado: "$280K", cobrado: "$268K", rechazo: "3%", dias: "35" },
];

const FALLBACK_AGENDA = [
  { hora: "08:00", pac: "González, María Elena", tipo: "Control", estado: "confirmado" as const },
  { hora: "08:30", pac: "López, Juan Carlos", tipo: "Consulta", estado: "confirmado" as const },
  { hora: "09:00", pac: "Ramírez, Sofía", tipo: "Primera vez", estado: "pendiente" as const },
  { hora: "10:00", pac: "Díaz, Roberto", tipo: "Ecografía", estado: "confirmado" as const },
];

const FALLBACK_AUDIT = [
  { tipo: "Código incorrecto", sev: "alta", pac: "González — PAMI", monto: "$24.600" },
  { tipo: "Autorización vencida", sev: "alta", pac: "Ramírez — Swiss Med.", monto: "$65.000" },
  { tipo: "Duplicado potencial", sev: "media", pac: "Morales — Galeno", monto: "$32.000" },
  { tipo: "Tope superado", sev: "alta", pac: "Romero — Medifé", monto: "$42.300" },
];

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
  const { user } = useAuth();
  const plan = usePlanSafe();
  const [showWizardBanner, setShowWizardBanner] = useState(true);
  const { isExporting, exportPDF } = useExport();

  // ── Real data hooks (fall back to static demo data) ──────
  const { data: kpiData } = useDashboardKPIs();
  const { data: financiadoresData } = useFinanciadores();
  const { data: turnosData } = useTurnos();
  const { data: auditoriaData } = useAuditoria();
  const { data: pacientesData } = usePacientes();

  // Map KPI hook data → display cards, or fallback
  const kpis = kpiData?.length
    ? kpiData.map((k) => ({
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
      }))
    : FALLBACK_KPIS;

  // Map financiadores hook data → table rows, or fallback
  const financiadores = financiadoresData?.length
    ? financiadoresData.slice(0, 5).map((f) => ({
        name: f.name,
        facturado: `$${Math.round(f.facturado / 1000)}K`,
        cobrado: `$${Math.round(f.cobrado / 1000)}K`,
        rechazo: `${f.tasaRechazo}%`,
        dias: f.diasPromedioPago.toString(),
      }))
    : FALLBACK_FINANCIADORES;

  // Map turnos hook data → today agenda, or fallback
  const todayAgenda = turnosData?.length
    ? turnosData.slice(0, 4).map((t) => ({
        hora: t.hora,
        pac: t.paciente,
        tipo: t.tipo,
        estado: t.estado as "confirmado" | "pendiente",
      }))
    : FALLBACK_AGENDA;

  // Map audit hook data → pending items, or fallback
  const pendingAudit = auditoriaData?.length
    ? auditoriaData
        .filter((a) => a.estado === "pendiente")
        .slice(0, 4)
        .map((a) => ({
          tipo: a.tipo,
          sev: a.severidad,
          pac: `${a.paciente} — ${a.financiador}`,
          monto: a.prestacion,
        }))
    : FALLBACK_AUDIT;

  // Quick-link live counts
  const pacCount = pacientesData?.length ?? 847;
  const turnoCount = turnosData?.length ?? 16;
  const auditCount = auditoriaData?.filter((a) => a.estado === "pendiente").length ?? 5;
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
            {activePresetDef ? `Plan ${activePresetDef.name}` : "Plan personalizado"}
          </span>
          {" — "}
          {plan.selectedModules.length} módulos activos
          {plan.total > 0 && <span className="text-ink-muted"> · {formatARS(plan.total)}/mes</span>}
        </p>
        <Link href="/planes" className="text-xs font-semibold text-celeste-dark hover:underline">
          Modificar
        </Link>
      </div>

      {/* Wizard onboarding banner */}
      {showWizardBanner && (
        <div className="relative bg-celeste-50 border border-celeste-200 rounded-xl p-5 overflow-hidden">
          <button
            onClick={() => setShowWizardBanner(false)}
            className="absolute top-3 right-3 text-celeste-400 hover:text-celeste-700 transition"
            aria-label="Cerrar banner"
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
              <h2 className="text-sm font-bold text-ink">Recorrido guiado de la plataforma</h2>
              <p className="text-xs text-ink-muted mt-0.5 leading-relaxed">
                Descubrí las 15 funcionalidades clave de Condor Salud en un recorrido interactivo de
                5 minutos. Ideal para conocer todo lo que la plataforma puede hacer por tu clinica.
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Link
                href="/dashboard/wizard"
                className="px-5 py-2.5 text-xs font-semibold bg-celeste-dark text-white rounded-lg hover:bg-celeste transition"
              >
                Iniciar recorrido
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
                Demo en vivo
              </a>
            </div>
          </div>
        </div>
      )}
      {/* Page title */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Dashboard</h1>
          <p className="text-sm text-ink-muted mt-0.5">
            Vista ejecutiva · {user?.clinicName || "Centro Médico San Martín"}
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
            KPI PDF
          </button>
          <Link
            href="/dashboard/reportes"
            className="px-4 py-2 text-sm font-medium border border-border rounded-[4px] text-ink-light hover:border-celeste-dark hover:text-celeste-dark transition"
          >
            Generar reporte
          </Link>
          <Link
            href="/dashboard/facturacion"
            className="px-4 py-2 text-sm font-semibold bg-celeste-dark text-white rounded-[4px] hover:bg-celeste transition"
          >
            Ver facturación
          </Link>
        </div>
      </div>

      {/* KPI cards */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        role="region"
        aria-label="Indicadores clave"
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
              Ver detalle
            </span>
          </Link>
        ))}
      </div>

      {/* Quick access grid */}
      <div
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
        role="navigation"
        aria-label="Accesos rápidos"
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
        {/* Chart placeholder */}
        <Card className="lg:col-span-2">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs text-ink-muted">Ingresos vs. cobros (últimos 6 meses)</div>
              <Link
                href="/dashboard/financiadores"
                className="text-[10px] text-celeste-dark font-medium hover:underline"
              >
                Ver financiadores
              </Link>
            </div>
            <div
              className="h-48 flex items-end gap-3 px-4"
              role="img"
              aria-label="Gráfico de barras: ingresos vs cobros últimos 6 meses mostrando tendencia creciente"
            >
              {[40, 55, 48, 62, 58, 72].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex gap-0.5">
                    <div
                      className="flex-1 bg-celeste rounded-t transition-all duration-500"
                      style={{ height: `${h * 2.5}px` }}
                    />
                    <div
                      className="flex-1 bg-celeste-light rounded-t transition-all duration-500"
                      style={{ height: `${h * 1.9}px` }}
                    />
                  </div>
                  <span className="text-[10px] text-ink-muted">M{i + 1}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-3 text-[10px] text-ink-muted">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-celeste rounded-sm" aria-hidden="true" /> Facturado
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-celeste-light rounded-sm" aria-hidden="true" />{" "}
                Cobrado
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs text-ink-muted">Alertas recientes</div>
              <Link
                href="/dashboard/alertas"
                className="text-[10px] text-celeste-dark font-medium hover:underline"
              >
                Ver todas
              </Link>
            </div>
            <div className="space-y-3" role="list" aria-label="Alertas recientes">
              {[
                {
                  href: "/dashboard/rechazos",
                  color: "border-amber-400",
                  title: "5 rechazos IOMA nuevos",
                  sub: "Hace 2 horas · Error de código",
                },
                {
                  href: "/dashboard/facturacion",
                  color: "border-celeste",
                  title: "Vence presentación PAMI",
                  sub: "En 3 días · 12 facturas pendientes",
                },
                {
                  href: "/dashboard/nomenclador",
                  color: "border-amber-400",
                  title: "Nomenclador SSS actualizado",
                  sub: "Ayer · 14 códigos modificados",
                },
                {
                  href: "/dashboard/financiadores",
                  color: "border-celeste",
                  title: "Swiss Medical pagó lote",
                  sub: "Hoy · $595K acreditados",
                },
              ].map((a, i) => (
                <Link
                  key={i}
                  href={a.href}
                  className={`block border-l-2 ${a.color} pl-3 py-1 hover:bg-celeste-pale/30 transition rounded-r`}
                  role="listitem"
                >
                  <div className="text-xs font-semibold text-ink">{a.title}</div>
                  <div className="text-[10px] text-ink-muted">{a.sub}</div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financiadores table */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-xs text-ink-muted font-normal">
            Rendimiento por financiador
          </CardTitle>
          <Link
            href="/dashboard/financiadores"
            className="text-[10px] text-celeste-dark font-medium hover:underline"
          >
            Analisis completo
          </Link>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" aria-label="Rendimiento por financiador">
            <thead>
              <tr className="bg-[#F8FAFB] text-[10px] font-bold tracking-wider text-ink-muted uppercase">
                <th className="text-left px-5 py-2.5" scope="col">
                  Financiador
                </th>
                <th className="text-right px-5 py-2.5" scope="col">
                  Facturado
                </th>
                <th className="text-right px-5 py-2.5" scope="col">
                  Cobrado
                </th>
                <th className="text-right px-5 py-2.5" scope="col">
                  Rechazo
                </th>
                <th className="text-right px-5 py-2.5" scope="col">
                  Días pago
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
      </Card>

      {/* Today's activity */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold tracking-wider text-ink-muted uppercase">
                Agenda de Hoy
              </h3>
              <Link
                href="/dashboard/agenda"
                className="text-[10px] text-celeste-dark font-medium hover:underline"
              >
                Ver agenda
              </Link>
            </div>
            <div className="space-y-2" role="list" aria-label="Turnos de hoy">
              {todayAgenda.map((t, i) => (
                <Link
                  key={i}
                  href="/dashboard/agenda"
                  className="flex items-center gap-3 py-2 border-b border-border-light last:border-0 hover:bg-celeste-pale/30 transition rounded px-2 -mx-2"
                  role="listitem"
                >
                  <span className="font-mono text-[10px] text-ink-muted w-10">{t.hora}</span>
                  <span className="text-xs font-semibold text-ink flex-1">{t.pac}</span>
                  <span className="text-[10px] text-ink-light">{t.tipo}</span>
                  <StatusBadge
                    variant={t.estado}
                    label={t.estado === "confirmado" ? "Confirmado" : "Pendiente"}
                  />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold tracking-wider text-ink-muted uppercase">
                Auditoría Pendiente
              </h3>
              <Link
                href="/dashboard/auditoria"
                className="text-[10px] text-celeste-dark font-medium hover:underline"
              >
                Ver auditoria
              </Link>
            </div>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

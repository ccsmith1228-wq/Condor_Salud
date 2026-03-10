"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth/context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { StatusBadge } from "@/components/ui";
import { Users, Calendar, Shield, Package, Tag, ClipboardList } from "lucide-react";
import type { Metadata } from "next";

const kpis = [
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
    accent: "border-l-gold",
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

const financiadores = [
  { name: "PAMI", facturado: "$1.4M", cobrado: "$980K", rechazo: "12%", dias: "68" },
  { name: "OSDE", facturado: "$890K", cobrado: "$845K", rechazo: "4%", dias: "32" },
  { name: "Swiss Medical", facturado: "$620K", cobrado: "$595K", rechazo: "2%", dias: "28" },
  { name: "IOMA", facturado: "$410K", cobrado: "$312K", rechazo: "18%", dias: "82" },
  { name: "Galeno", facturado: "$280K", cobrado: "$268K", rechazo: "3%", dias: "35" },
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
  { label: "Pacientes", desc: "847 activos", href: "/dashboard/pacientes" },
  { label: "Agenda", desc: "16 turnos hoy", href: "/dashboard/agenda" },
  { label: "Auditoria", desc: "5 pendientes", href: "/dashboard/auditoria" },
  { label: "Inventario", desc: "3 criticos", href: "/dashboard/inventario" },
  { label: "Nomenclador", desc: "18 codigos", href: "/dashboard/nomenclador" },
  { label: "Reportes", desc: "10 disponibles", href: "/dashboard/reportes" },
];

const todayAgenda = [
  { hora: "08:00", pac: "González, María Elena", tipo: "Control", estado: "confirmado" as const },
  { hora: "08:30", pac: "López, Juan Carlos", tipo: "Consulta", estado: "confirmado" as const },
  { hora: "09:00", pac: "Ramírez, Sofía", tipo: "Primera vez", estado: "pendiente" as const },
  { hora: "10:00", pac: "Díaz, Roberto", tipo: "Ecografía", estado: "confirmado" as const },
];

const pendingAudit = [
  { tipo: "Código incorrecto", sev: "alta", pac: "González — PAMI", monto: "$24.600" },
  { tipo: "Autorización vencida", sev: "alta", pac: "Ramírez — Swiss Med.", monto: "$65.000" },
  { tipo: "Duplicado potencial", sev: "media", pac: "Morales — Galeno", monto: "$32.000" },
  { tipo: "Tope superado", sev: "alta", pac: "Romero — Medifé", monto: "$42.300" },
];

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-5">
      {/* Page title */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Dashboard</h1>
          <p className="text-sm text-ink-muted mt-0.5">
            Vista ejecutiva · {user?.clinicName || "Centro Médico San Martín"}
          </p>
        </div>
        <div className="flex gap-2">
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
            <p className="text-[10px] text-ink-muted">{q.desc}</p>
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
                  color: "border-gold",
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
                  color: "border-gold",
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
                          ? "text-gold"
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
                  className="flex items-center gap-3 py-2 border-b border-border-light last:border-0 hover:bg-celeste-pale/30 transition rounded px-2 -mx-2 block"
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
                  className="flex items-center gap-3 py-2 border-b border-border-light last:border-0 hover:bg-celeste-pale/30 transition rounded px-2 -mx-2 block"
                  role="listitem"
                >
                  <span
                    className={`w-2 h-2 rounded-full ${a.sev === "alta" ? "bg-red-500" : "bg-gold"}`}
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

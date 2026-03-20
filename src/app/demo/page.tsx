"use client";

import Link from "next/link";
import DemoShell from "./DemoShell";
import {
  DEMO_KPIS,
  DEMO_FINANCIADORES,
  DEMO_TURNOS,
  DEMO_AUDIT,
  DEMO_ALERTAS,
  DEMO_CHART_BARS,
  DEMO_QUICK_LINKS,
} from "@/lib/demo-data";
import { Card, CardContent, CardHeader, CardTitle, StatusBadge } from "@/components/ui";
import { Users, Calendar, FileText, Package, AlertTriangle, Building2 } from "lucide-react";

const quickIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Pacientes: Users,
  Agenda: Calendar,
  Facturación: FileText,
  Inventario: Package,
  Rechazos: AlertTriangle,
  Financiadores: Building2,
};

export default function DemoPage() {
  return (
    <DemoShell>
      <div className="space-y-5">
        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold text-ink">Panel principal</h1>
          <p className="text-sm text-ink-muted mt-0.5">Vista ejecutiva · Centro Médico Ejemplo</p>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {DEMO_KPIS.map((kpi) => (
            <Link
              key={kpi.label}
              href={kpi.href}
              className={`bg-white border border-border rounded-lg p-5 border-l-[3px] ${kpi.accent} hover:shadow-md hover:-translate-y-0.5 transition group block`}
            >
              <div className="text-[10px] font-bold tracking-wider text-ink-muted uppercase mb-1">
                {kpi.label}
              </div>
              <div className="text-2xl font-bold text-celeste-dark">{kpi.value}</div>
              <div className={`text-xs mt-1 ${kpi.up ? "text-green-600" : "text-ink-muted"}`}>
                {kpi.change}
              </div>
            </Link>
          ))}
        </div>

        {/* Quick access grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {DEMO_QUICK_LINKS.map((q) => {
            const Icon = quickIcons[q.label];
            return (
              <Link
                key={q.label}
                href={q.href}
                className="bg-white border border-border rounded-lg p-4 text-center hover:shadow-md hover:-translate-y-0.5 transition group block"
              >
                {Icon && <Icon className="w-6 h-6 mx-auto text-celeste-dark mb-1" />}
                <p className="text-xs font-bold text-ink group-hover:text-celeste-dark transition">
                  {q.label}
                </p>
                <p className="text-[10px] text-ink-muted">{q.desc}</p>
              </Link>
            );
          })}
        </div>

        {/* Two-column: Chart + Alerts */}
        <div className="grid lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <CardContent className="pt-5">
              <div className="flex items-center justify-between mb-4">
                <div className="text-xs text-ink-muted">Ingresos vs. cobros (últimos 6 meses)</div>
                <Link
                  href="/demo/financiadores"
                  className="text-[10px] text-celeste-dark font-medium hover:underline"
                >
                  Ver financiadores
                </Link>
              </div>
              <div className="h-48 flex items-end gap-3 px-4">
                {DEMO_CHART_BARS.map((h, i) => (
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
                  <span className="w-2.5 h-2.5 bg-celeste rounded-sm" /> Facturado
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 bg-celeste-light rounded-sm" /> Cobrado
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs text-ink-muted">Alertas recientes</div>
              </div>
              <div className="space-y-3">
                {DEMO_ALERTAS.map((a, i) => (
                  <Link
                    key={i}
                    href={a.href}
                    className={`block border-l-2 ${a.color} pl-3 py-1 hover:bg-celeste-pale/30 transition rounded-r`}
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
              href="/demo/financiadores"
              className="text-[10px] text-celeste-dark font-medium hover:underline"
            >
              Análisis completo
            </Link>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F8FAFB] text-[10px] font-bold tracking-wider text-ink-muted uppercase">
                  <th scope="col" className="text-left px-5 py-2.5">
                    Financiador
                  </th>
                  <th scope="col" className="text-right px-5 py-2.5">
                    Facturado
                  </th>
                  <th scope="col" className="text-right px-5 py-2.5">
                    Cobrado
                  </th>
                  <th scope="col" className="text-right px-5 py-2.5">
                    Rechazo
                  </th>
                  <th scope="col" className="text-right px-5 py-2.5">
                    Días pago
                  </th>
                </tr>
              </thead>
              <tbody>
                {DEMO_FINANCIADORES.map((f) => (
                  <tr
                    key={f.name}
                    className="border-t border-border-light hover:bg-celeste-pale/30 transition"
                  >
                    <td className="px-5 py-3 font-semibold text-ink">{f.name}</td>
                    <td className="px-5 py-3 text-right text-ink-light">{f.facturado}</td>
                    <td className="px-5 py-3 text-right text-ink-light">{f.cobrado}</td>
                    <td
                      className={`px-5 py-3 text-right font-semibold ${parseFloat(f.rechazo) > 10 ? "text-red-500" : parseFloat(f.rechazo) > 5 ? "text-amber-500" : "text-green-600"}`}
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

        {/* Agenda + Audit */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-5">
              <h3 className="text-xs font-bold tracking-wider text-ink-muted uppercase mb-3">
                Agenda de Hoy
              </h3>
              <div className="space-y-2">
                {DEMO_TURNOS.slice(0, 4).map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center gap-3 py-2 border-b border-border-light last:border-0"
                  >
                    <span className="font-mono text-[10px] text-ink-muted w-10">{t.hora}</span>
                    <span className="text-xs font-semibold text-ink flex-1">{t.paciente}</span>
                    <span className="text-[10px] text-ink-light">{t.tipo}</span>
                    <StatusBadge
                      variant={t.estado === "cancelado" ? "pendiente" : t.estado}
                      label={
                        t.estado === "confirmado"
                          ? "Confirmado"
                          : t.estado === "pendiente"
                            ? "Pendiente"
                            : "Cancelado"
                      }
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5">
              <h3 className="text-xs font-bold tracking-wider text-ink-muted uppercase mb-3">
                Auditoría Pendiente
              </h3>
              <div className="space-y-2">
                {DEMO_AUDIT.map((a, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 py-2 border-b border-border-light last:border-0"
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${a.sev === "alta" ? "bg-red-500" : "bg-amber-400"}`}
                    />
                    <span className="text-xs font-semibold text-ink flex-1">{a.tipo}</span>
                    <span className="text-[10px] text-ink-light">{a.pac}</span>
                    <span className="text-[10px] font-bold text-ink">{a.monto}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DemoShell>
  );
}

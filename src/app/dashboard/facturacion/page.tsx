"use client";

import { useState, useMemo } from "react";
import type { FacturaEstado } from "@/lib/types";
import { useToast } from "@/components/Toast";
import { useDemoAction } from "@/components/DemoModal";
import { useExport } from "@/lib/services/export";
import { Card, CardContent, StatusBadge, PageHeader, Select, Button } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { useFacturas } from "@/hooks/use-data";
import { Download, Loader2 } from "lucide-react";

const estadoConfig: Record<FacturaEstado, string> = {
  presentada: "Presentada",
  cobrada: "Cobrada",
  rechazada: "Rechazada",
  pendiente: "Pendiente",
  en_observacion: "En observación",
};

const financiadoresFilter = [
  { value: "Todos", label: "Todos" },
  { value: "PAMI", label: "PAMI" },
  { value: "OSDE", label: "OSDE" },
  { value: "Swiss Medical", label: "Swiss Medical" },
  { value: "IOMA", label: "IOMA" },
  { value: "Galeno", label: "Galeno" },
];

const estadosFilter = [
  { value: "todos", label: "Todos" },
  { value: "presentada", label: "Presentada" },
  { value: "cobrada", label: "Cobrada" },
  { value: "rechazada", label: "Rechazada" },
  { value: "pendiente", label: "Pendiente" },
  { value: "en_observacion", label: "En observación" },
];

export default function FacturacionPage() {
  const { showToast } = useToast();
  const { showDemo } = useDemoAction();
  const { isExporting, exportPDF, exportExcel } = useExport();
  const { data: facturas = [], isLoading } = useFacturas();
  const [filtroFinanciador, setFiltroFinanciador] = useState("Todos");
  const [filtroEstado, setFiltroEstado] = useState("todos");

  const filtered = useMemo(() => {
    return facturas.filter((f) => {
      if (filtroFinanciador !== "Todos" && f.financiador !== filtroFinanciador) return false;
      if (filtroEstado !== "todos" && f.estado !== filtroEstado) return false;
      return true;
    });
  }, [facturas, filtroFinanciador, filtroEstado]);

  const totals = useMemo(() => {
    const totalFacturado = facturas.reduce((s, f) => s + f.monto, 0);
    const totalCobrado = facturas
      .filter((f) => f.estado === "cobrada")
      .reduce((s, f) => s + f.monto, 0);
    const totalRechazado = facturas
      .filter((f) => f.estado === "rechazada")
      .reduce((s, f) => s + f.monto, 0);
    const totalPendiente = facturas
      .filter((f) => ["presentada", "pendiente", "en_observacion"].includes(f.estado))
      .reduce((s, f) => s + f.monto, 0);
    return { totalFacturado, totalCobrado, totalRechazado, totalPendiente };
  }, [facturas]);

  const kpis = [
    {
      label: "Total facturado",
      value: formatCurrency(totals.totalFacturado),
      sub: `${facturas.length} facturas`,
      accent: "border-l-celeste",
    },
    {
      label: "Cobrado",
      value: formatCurrency(totals.totalCobrado),
      sub: `${totals.totalFacturado ? Math.round((totals.totalCobrado / totals.totalFacturado) * 100) : 0}% del total`,
      accent: "border-l-green-400",
      subColor: "text-green-600",
    },
    {
      label: "Pendiente de cobro",
      value: formatCurrency(totals.totalPendiente),
      sub: `${facturas.filter((f) => ["presentada", "pendiente", "en_observacion"].includes(f.estado)).length} facturas`,
      accent: "border-l-amber-400",
    },
    {
      label: "Rechazado",
      value: formatCurrency(totals.totalRechazado),
      sub: `${totals.totalFacturado ? Math.round((totals.totalRechazado / totals.totalFacturado) * 100) : 0}% del total`,
      accent: "border-l-red-400",
      subColor: "text-red-600",
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Facturación"
        description="Gestión de facturas por financiador"
        breadcrumbs={[{ label: "Panel", href: "/dashboard" }, { label: "Facturación" }]}
        actions={
          <div className="flex gap-2">
            <button
              onClick={() => exportPDF("facturacion")}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border border-border text-ink-light rounded-[4px] hover:border-celeste-dark hover:text-celeste-dark transition disabled:opacity-50"
            >
              {isExporting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              PDF
            </button>
            <button
              onClick={() => exportExcel("facturacion")}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border border-border text-ink-light rounded-[4px] hover:border-green-600 hover:text-green-600 transition disabled:opacity-50"
            >
              {isExporting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              Excel
            </button>
            <Button onClick={() => showDemo("Nueva factura")}>Nueva factura</Button>
          </div>
        }
      />

      {/* KPI summary */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        role="region"
        aria-label="Resumen de facturación"
      >
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className={`bg-white border border-border rounded-lg p-5 border-l-[3px] ${kpi.accent}`}
          >
            <div className="text-xs text-ink-muted mb-1">{kpi.label}</div>
            <div className="text-2xl font-bold text-celeste-dark">{kpi.value}</div>
            <div className={`text-xs mt-1 ${kpi.subColor || "text-ink-muted"}`}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div
            className="flex flex-wrap gap-4 items-end"
            role="search"
            aria-label="Filtros de facturación"
          >
            <Select
              label="Financiador"
              options={financiadoresFilter}
              value={filtroFinanciador}
              onChange={(e) => setFiltroFinanciador(e.target.value)}
            />
            <Select
              label="Estado"
              options={estadosFilter}
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
            />
            <div className="ml-auto text-xs text-ink-muted self-center">
              Mostrando {filtered.length} de {facturas.length} facturas
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" aria-label="Facturas">
            <thead>
              <tr className="bg-[#F8FAFB] text-[10px] font-bold tracking-wider text-ink-muted uppercase">
                <th className="text-left px-5 py-3" scope="col">
                  Número
                </th>
                <th className="text-left px-5 py-3" scope="col">
                  Fecha
                </th>
                <th className="text-left px-5 py-3" scope="col">
                  Financiador
                </th>
                <th className="text-left px-5 py-3" scope="col">
                  Paciente
                </th>
                <th className="text-left px-5 py-3" scope="col">
                  Prestación
                </th>
                <th className="text-right px-5 py-3" scope="col">
                  Monto
                </th>
                <th className="text-center px-5 py-3" scope="col">
                  Estado
                </th>
                <th className="text-center px-5 py-3" scope="col">
                  Acción
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((f) => (
                <tr
                  key={f.id}
                  className="border-t border-border-light hover:bg-celeste-pale/30 transition"
                >
                  <td className="px-5 py-3 font-mono text-xs text-celeste-dark font-semibold">
                    {f.numero}
                  </td>
                  <td className="px-5 py-3 text-ink-light">{f.fecha}</td>
                  <td className="px-5 py-3 text-ink font-medium">{f.financiador}</td>
                  <td className="px-5 py-3 text-ink-light">{f.paciente}</td>
                  <td className="px-5 py-3 text-ink-light">{f.prestacion}</td>
                  <td className="px-5 py-3 text-right font-semibold text-ink">
                    {formatCurrency(f.monto)}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <StatusBadge variant={f.estado} label={estadoConfig[f.estado]} />
                  </td>
                  <td className="px-5 py-3 text-center">
                    <button
                      onClick={() => showDemo(`Detalle de factura ${f.numero}`)}
                      className="text-[10px] text-celeste-dark font-medium hover:underline"
                      aria-label={`Ver detalle de factura ${f.numero}`}
                    >
                      Ver
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-sm text-ink-muted">
                    No se encontraron facturas con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

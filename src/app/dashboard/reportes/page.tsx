"use client";
import { useState } from "react";
import Link from "next/link";
import { useExport } from "@/lib/services/export";
import { useReportesList } from "@/hooks/use-data";
import { useIsDemo } from "@/lib/auth/context";
import type { PDFReportType, ExcelReportType } from "@/lib/services/export";
import {
  BarChart3,
  XCircle,
  Building2,
  TrendingUp,
  Users,
  Timer,
  Search,
  Package,
  Calendar,
  Target,
  Loader2,
  Download,
} from "lucide-react";

// ─── Map report IDs to export types ──────────────────────────
const pdfTypeMap: Record<string, PDFReportType> = {
  R01: "facturacion",
  R02: "rechazos",
  R03: "kpi",
  R04: "kpi",
  R05: "kpi",
  R06: "kpi",
  R07: "kpi",
  R08: "kpi",
  R09: "kpi",
  R10: "kpi",
};
const excelTypeMap: Record<string, ExcelReportType> = {
  R01: "facturacion",
  R02: "rechazos",
  R05: "pacientes",
  R08: "inventario",
  R09: "nomenclador",
};

const reportIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  R01: BarChart3,
  R02: XCircle,
  R03: Building2,
  R04: TrendingUp,
  R05: Users,
  R06: Timer,
  R07: Search,
  R08: Package,
  R09: Calendar,
  R10: Target,
};

const reportLinkMap: Record<string, string> = {
  R01: "/dashboard/facturacion",
  R02: "/dashboard/rechazos",
  R03: "/dashboard/financiadores",
  R04: "/dashboard/inflacion",
  R05: "/dashboard/pacientes",
  R06: "/dashboard/agenda",
  R07: "/dashboard/auditoria",
  R08: "/dashboard/inventario",
  R09: "/dashboard/agenda",
  R10: "/dashboard",
};

const historialGeneraciones = [
  {
    fecha: "07/03/2026 14:32",
    reporte: "Ocupación de Agenda",
    formato: "PDF",
    usuario: "Dr. Rodríguez",
    estado: "Completado",
  },
  {
    fecha: "05/03/2026 10:15",
    reporte: "Análisis de Rechazos",
    formato: "Excel",
    usuario: "Adm. García",
    estado: "Completado",
  },
  {
    fecha: "05/03/2026 09:45",
    reporte: "Auditoría Pre-Presentación",
    formato: "PDF",
    usuario: "Adm. García",
    estado: "Completado",
  },
  {
    fecha: "03/03/2026 16:20",
    reporte: "Inventario & Consumo",
    formato: "PDF",
    usuario: "Enf. López",
    estado: "Completado",
  },
  {
    fecha: "01/03/2026 08:00",
    reporte: "Indicadores KPI Ejecutivo",
    formato: "PDF",
    usuario: "Dr. Rodríguez",
    estado: "Completado",
  },
  {
    fecha: "01/03/2026 08:00",
    reporte: "Facturación Mensual",
    formato: "Excel",
    usuario: "Adm. García",
    estado: "Completado",
  },
];

export default function ReportesPage() {
  const { isExporting, exportError, exportPDF, exportExcel } = useExport();
  const { data: reportes = [], isLoading } = useReportesList();
  const isDemo = useIsDemo();
  const [catFilter, setCatFilter] = useState("Todos");
  const [dateRange, setDateRange] = useState("Marzo 2026");

  const categorias = [
    "Todos",
    ...Array.from(new Set(reportes.map((r: any) => r.categoria as string))),
  ];

  const filtered =
    catFilter === "Todos" ? reportes : reportes.filter((r) => r.categoria === catFilter);

  return (
    <div className="space-y-5">
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-celeste" />
          <span className="ml-2 text-sm text-ink-muted">Cargando reportes...</span>
        </div>
      )}
      {!isLoading && (
        <>
          {/* Export error banner */}
          {exportError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              Error al exportar: {exportError}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-ink">Reportes</h1>
              <p className="text-sm text-ink-muted mt-0.5">
                Reportes predefinidos y herramientas de exportación
              </p>
            </div>
            <div className="flex gap-2">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                aria-label="Seleccionar período"
                className="px-3 py-2 text-sm border border-border rounded-[4px] outline-none focus:border-celeste-dark transition bg-white text-ink"
              >
                <option>Marzo 2026</option>
                <option>Febrero 2026</option>
                <option>Enero 2026</option>
                <option>Q1 2026</option>
                <option>2025 Anual</option>
              </select>
              <button
                onClick={() => exportPDF("kpi", { periodo: dateRange })}
                disabled={isExporting}
                className="px-4 py-2 text-sm font-semibold bg-celeste-dark text-white rounded-[4px] hover:bg-celeste transition disabled:opacity-50 flex items-center gap-2"
              >
                {isExporting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                Generar todos
              </button>
            </div>
          </div>

          {/* Category tabs */}
          <div className="flex flex-wrap gap-2">
            {categorias.map((c) => (
              <button
                key={c}
                onClick={() => setCatFilter(c)}
                className={`px-4 py-2 text-xs rounded-[4px] font-medium transition ${catFilter === c ? "bg-ink text-white" : "border border-border text-ink-light hover:border-ink"}`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Report grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((r) => (
              <div
                key={r.id}
                className="bg-white border border-border rounded-lg p-5 hover:shadow-md hover:-translate-y-0.5 transition group"
              >
                <div className="flex items-start justify-between mb-3">
                  {(() => {
                    const I = reportIconMap[r.id];
                    return I ? <I className="w-6 h-6 text-celeste-dark" /> : null;
                  })()}
                  <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded bg-celeste-pale text-celeste-dark">
                    {r.categoria}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-ink mb-1">{r.nombre}</h3>
                <p className="text-xs text-ink-muted leading-relaxed mb-4">{r.descripcion}</p>
                <div className="flex items-center justify-between text-[10px] text-ink-muted mb-3">
                  <span>Frecuencia: {r.frecuencia}</span>
                  <span>Último: {r.ultimaGeneracion}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => exportPDF(pdfTypeMap[r.id] || "kpi", { periodo: dateRange })}
                    disabled={isExporting}
                    className="flex-1 px-3 py-2 text-xs font-semibold bg-celeste-dark text-white rounded-[4px] hover:bg-celeste transition disabled:opacity-50"
                  >
                    {isExporting ? "..." : "Generar PDF"}
                  </button>
                  {excelTypeMap[r.id] ? (
                    <button
                      onClick={() =>
                        excelTypeMap[r.id] &&
                        exportExcel(excelTypeMap[r.id]!, { periodo: dateRange })
                      }
                      disabled={isExporting}
                      className="flex-1 px-3 py-2 text-xs font-semibold border border-border text-ink-light rounded-[4px] hover:border-celeste-dark hover:text-celeste-dark transition disabled:opacity-50"
                    >
                      {isExporting ? "..." : "Excel"}
                    </button>
                  ) : (
                    <span className="flex-1" />
                  )}
                  <Link
                    href={reportLinkMap[r.id] || "/dashboard"}
                    className="px-3 py-2 text-xs font-medium text-celeste-dark hover:underline flex items-center"
                  >
                    Ver
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Generation history (demo mode only) */}
          {isDemo && (
            <div className="bg-white border border-border rounded-lg overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <h3 className="text-xs font-bold tracking-wider text-ink-muted uppercase">
                  Historial de Generaciones
                </h3>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#F8FAFB] text-[10px] font-bold tracking-wider text-ink-muted uppercase">
                    <th scope="col" className="text-left px-5 py-2.5">
                      Fecha
                    </th>
                    <th scope="col" className="text-left px-5 py-2.5">
                      Reporte
                    </th>
                    <th scope="col" className="text-center px-5 py-2.5">
                      Formato
                    </th>
                    <th scope="col" className="text-left px-5 py-2.5">
                      Usuario
                    </th>
                    <th scope="col" className="text-center px-5 py-2.5">
                      Estado
                    </th>
                    <th scope="col" className="text-right px-5 py-2.5">
                      Acción
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {historialGeneraciones.map((h, i) => (
                    <tr
                      key={i}
                      className="border-t border-border-light hover:bg-celeste-pale/30 transition"
                    >
                      <td className="px-5 py-3 font-mono text-[10px] text-ink-muted">{h.fecha}</td>
                      <td className="px-5 py-3 text-xs font-semibold text-ink">{h.reporte}</td>
                      <td className="px-5 py-3 text-center">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded ${h.formato === "PDF" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"}`}
                        >
                          {h.formato}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-ink-light">{h.usuario}</td>
                      <td className="px-5 py-3 text-center">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-green-50 text-green-700">
                          {h.estado}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => {
                            if (h.formato === "PDF") exportPDF("kpi", { periodo: dateRange });
                            else exportExcel("facturacion", { periodo: dateRange });
                          }}
                          disabled={isExporting}
                          className="text-xs text-celeste-dark font-medium hover:underline disabled:opacity-50"
                        >
                          {isExporting ? "..." : "Descargar"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

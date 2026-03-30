"use client";
import { useState } from "react";
import Link from "next/link";
import { useExport } from "@/lib/services/export";
import { useLocale } from "@/lib/i18n/context";
import { useReportesList } from "@/hooks/use-data";
import { EmptyState } from "@/components/ui";
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

// NOTE: No hardcoded report history. The generation log is populated
// as users actually generate reports. New clinics start empty.

export default function ReportesPage() {
  const { t } = useLocale();
  const { isExporting, exportError, exportPDF, exportExcel } = useExport();
  const { data: reportes = [], isLoading } = useReportesList();
  const [catFilter, setCatFilter] = useState("Todos");
  const [dateRange, setDateRange] = useState("Marzo 2026");

  const categorias = ["Todos", ...Array.from(new Set(reportes.map((r) => r.categoria)))];

  const filtered =
    catFilter === "Todos" ? reportes : reportes.filter((r) => r.categoria === catFilter);

  return (
    <div className="space-y-5">
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-celeste" />
          <span className="ml-2 text-sm text-ink-muted">{t("reports.loadingReports")}</span>
        </div>
      )}
      {!isLoading && (
        <>
          {/* Export error banner */}
          {exportError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {t("reports.exportError")}: {exportError}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-ink">{t("reports.title")}</h1>
              <p className="text-sm text-ink-muted mt-0.5">{t("reports.predefinedAndExport")}</p>
            </div>
            <div className="flex gap-2">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                aria-label="Seleccionar período"
                className="px-3 py-2 text-sm border border-border rounded-[4px] outline-none focus:border-celeste-dark transition bg-white text-ink"
              >
                <option>Marzo {new Date().getFullYear()}</option>
                <option>Febrero {new Date().getFullYear()}</option>
                <option>Enero {new Date().getFullYear()}</option>
                <option>Q1 {new Date().getFullYear()}</option>
                <option>{new Date().getFullYear() - 1} Anual</option>
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
                {t("reports.generateAll")}
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
          {filtered.length === 0 ? (
            <EmptyState title={t("label.noResults")} description={t("reports.noResultsDesc")} />
          ) : (
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
                    <span>
                      {t("reports.frequency")}: {r.frecuencia}
                    </span>
                    <span>
                      {t("reports.lastGenerated")}: {r.ultimaGeneracion}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => exportPDF(pdfTypeMap[r.id] || "kpi", { periodo: dateRange })}
                      disabled={isExporting}
                      className="flex-1 px-3 py-2 text-xs font-semibold bg-celeste-dark text-white rounded-[4px] hover:bg-celeste transition disabled:opacity-50"
                    >
                      {isExporting ? "..." : t("reports.generatePdf")}
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
                      {t("action.view")}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Report generation history — populated as users actually export reports */}
        </>
      )}
    </div>
  );
}

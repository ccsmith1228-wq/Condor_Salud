"use client";

import { useState } from "react";
import { useExport } from "@/lib/services/export";
import { useInflacionMensual, useFinanciadoresInflacion } from "@/hooks/use-data";
import { useLocale } from "@/lib/i18n/context";
import { formatCurrency } from "@/lib/utils";
import { EmptyState } from "@/components/ui";
import {
  Download,
  Filter,
  TrendingDown,
  Calendar,
  BarChart3,
  AlertTriangle,
  Loader2,
} from "lucide-react";

type Period = "3m" | "6m";
type FinFilter = "Todos" | string;

const formatMonto = formatCurrency;

export default function InflacionPage() {
  const { t } = useLocale();
  const { exportPDF, exportExcel, isExporting } = useExport();
  const [period, setPeriod] = useState<Period>("6m");
  const [finFilter, setFinFilter] = useState<FinFilter>("Todos");

  const { data: meses = [], isLoading: loadingMeses } = useInflacionMensual(period);
  const { data: financiadoresInflacion = [], isLoading: loadingFin } = useFinanciadoresInflacion();
  const isLoading = loadingMeses || loadingFin;

  const filteredFinanciadores =
    finFilter === "Todos"
      ? financiadoresInflacion
      : financiadoresInflacion.filter((f) => f.name === finFilter);

  const totalPerdida = meses.reduce((s, m) => s + m.perdidaReal, 0);
  const totalCobrado = meses.reduce((s, m) => s + m.cobrado, 0);
  const ipcPromedio = Math.round((meses.reduce((s, m) => s + m.ipc, 0) / meses.length) * 10) / 10;
  const diasPromedio = Math.round(meses.reduce((s, m) => s + m.diasDemora, 0) / meses.length);
  const maxBarHeight = 160;
  const maxPerdida = Math.max(...meses.map((m) => m.perdidaReal));

  return (
    <div className="space-y-5">
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-celeste" />
          <span className="ml-2 text-sm text-ink-muted">{t("inflation.loading")}</span>
        </div>
      )}
      {!isLoading && (
        <>
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-ink">{t("inflation.trackerTitle")}</h1>
              <p className="text-sm text-ink-muted mt-1">{t("inflation.trackerSubtitle")}</p>
            </div>
            <div className="flex gap-2">
              <div className="flex border border-border rounded-[4px] overflow-hidden">
                {(["3m", "6m"] as Period[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-3 py-1.5 text-xs font-medium transition ${
                      period === p
                        ? "bg-celeste-dark text-white"
                        : "bg-white text-ink-light hover:text-ink"
                    }`}
                  >
                    {p === "3m" ? t("inflation.3months") : t("inflation.6months")}
                  </button>
                ))}
              </div>
              <button
                onClick={() => exportPDF("inflacion")}
                disabled={isExporting}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-celeste-dark text-white rounded-[4px] hover:bg-celeste transition disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                {isExporting ? "..." : t("action.exportPdf")}
              </button>
              <button
                onClick={() => exportExcel("inflacion")}
                disabled={isExporting}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border rounded-[4px] text-ink-light hover:border-celeste-dark hover:text-celeste-dark transition disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                Excel
              </button>
            </div>
          </div>

          {/* KPI summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-border rounded-lg p-5 border-l-[3px] border-l-red-400">
              <div className="flex items-center gap-1.5 text-xs text-ink-muted mb-1">
                <TrendingDown className="w-3.5 h-3.5" />
                {t("inflation.totalLoss")} ({period === "3m" ? "3" : "6"}{" "}
                {t("inflation.3months").split(" ")[1]})
              </div>
              <div className="text-2xl font-bold text-red-600">{formatMonto(totalPerdida)}</div>
              <div className="text-xs mt-1 text-red-600">
                {Math.round((totalPerdida / totalCobrado) * 100 * 10) / 10}%{" "}
                {t("inflation.ofCollected")}
              </div>
            </div>
            <div className="bg-white border border-border rounded-lg p-5 border-l-[3px] border-l-celeste">
              <div className="flex items-center gap-1.5 text-xs text-ink-muted mb-1">
                <BarChart3 className="w-3.5 h-3.5" />
                {t("inflation.avgMonthlyIpc")}
              </div>
              <div className="text-2xl font-bold text-celeste-dark">{ipcPromedio}%</div>
              <div className="text-xs mt-1 text-ink-muted">
                {t("inflation.lastMonths")} {period === "3m" ? "3" : "6"}{" "}
                {t("inflation.3months").split(" ")[1]}
              </div>
            </div>
            <div className="bg-white border border-border rounded-lg p-5 border-l-[3px] border-l-celeste">
              <div className="flex items-center gap-1.5 text-xs text-ink-muted mb-1">
                <Calendar className="w-3.5 h-3.5" />
                {t("inflation.avgDelayDays")}
              </div>
              <div className="text-2xl font-bold text-celeste-dark">{diasPromedio}</div>
              <div className="text-xs mt-1 text-ink-muted">{t("inflation.allInsurers")}</div>
            </div>
            <div className="bg-white border border-border rounded-lg p-5 border-l-[3px] border-l-celeste">
              <div className="flex items-center gap-1.5 text-xs text-ink-muted mb-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                {t("inflation.lossPerDay")}
              </div>
              <div className="text-2xl font-bold text-celeste-dark">0.11%</div>
              <div className="text-xs mt-1 text-ink-muted">
                {t("inflation.estimatedCurrentValue")}
              </div>
            </div>
          </div>

          {/* Chart + Explanation */}
          <div className="grid lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-white border border-border rounded-lg p-5">
              <div className="text-xs text-ink-muted mb-4">
                {t("inflation.realLossInflation")} — {t("inflation.lastMonths").toLowerCase()}{" "}
                {period === "3m" ? "3" : "6"} {t("inflation.3months").split(" ")[1]}
              </div>
              <div className="h-52 flex items-end gap-3 px-4">
                {meses.map((m, i) => {
                  const barHeight = Math.round((m.perdidaReal / maxPerdida) * maxBarHeight);
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="text-[10px] font-semibold text-red-600">
                        {formatMonto(m.perdidaReal)}
                      </div>
                      <div
                        className="w-full bg-celeste rounded-t transition-all"
                        style={{ height: `${barHeight}px` }}
                      />
                      <span className="text-[10px] text-ink-muted">{m.mes.slice(0, 3)}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-4 mt-3 text-[10px] text-ink-muted">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 bg-celeste rounded-sm" />{" "}
                  {t("inflation.realLossInflation")}
                </span>
              </div>
            </div>
            <div className="bg-white border border-border rounded-lg p-5">
              <div className="text-xs text-ink-muted mb-3">{t("inflation.howWeCalculate")}</div>
              <div className="space-y-3">
                <div className="border-l-2 border-celeste pl-3 py-1">
                  <div className="text-xs font-semibold text-ink">
                    {t("inflation.nominalValue")}
                  </div>
                  <div className="text-[11px] text-ink-muted">{t("inflation.whatYouInvoiced")}</div>
                </div>
                <div className="border-l-2 border-celeste pl-3 py-1">
                  <div className="text-xs font-semibold text-ink">{t("inflation.realValue")}</div>
                  <div className="text-[11px] text-ink-muted">{t("inflation.purchasingPower")}</div>
                </div>
                <div className="border-l-2 border-red-500 pl-3 py-1">
                  <div className="text-xs font-semibold text-ink">
                    {t("inflation.lossEquation")}
                  </div>
                  <div className="text-[11px] text-ink-muted">{t("inflation.adjustedByCPI")}</div>
                </div>
              </div>
              <div className="mt-4 bg-celeste-pale border border-celeste/20 rounded p-3">
                <div className="text-xs font-semibold text-ink">{t("inflation.formula")}</div>
                <div className="text-[11px] text-ink-light mt-1">
                  {t("inflation.formulaDetail")}
                </div>
              </div>
            </div>
          </div>

          {/* Per-month detail table */}
          <div className="bg-white border border-border rounded-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <div className="text-xs text-ink-muted">{t("inflation.monthlyDetail")}</div>
              <button
                onClick={() => exportExcel("inflacion")}
                disabled={isExporting}
                className="text-xs text-celeste-dark font-medium hover:underline flex items-center gap-1"
              >
                <Download className="w-3 h-3" /> Excel
              </button>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F8FAFB] text-[10px] font-bold tracking-wider text-ink-muted uppercase">
                  <th scope="col" className="text-left px-5 py-2.5">
                    {t("inflation.month")}
                  </th>
                  <th scope="col" className="text-right px-5 py-2.5">
                    IPC
                  </th>
                  <th scope="col" className="text-right px-5 py-2.5">
                    {t("inflation.invoiced")}
                  </th>
                  <th scope="col" className="text-right px-5 py-2.5">
                    {t("inflation.collected")}
                  </th>
                  <th scope="col" className="text-right px-5 py-2.5">
                    {t("inflation.delayDays")}
                  </th>
                  <th scope="col" className="text-right px-5 py-2.5">
                    {t("inflation.realLoss")}
                  </th>
                  <th scope="col" className="text-right px-5 py-2.5">
                    {t("inflation.lossPercent")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {meses.map((m) => (
                  <tr
                    key={m.mes}
                    className="border-t border-border-light hover:bg-celeste-pale/30 transition"
                  >
                    <td className="px-5 py-3 font-semibold text-ink">{m.mes}</td>
                    <td className="px-5 py-3 text-right text-ink-light">{m.ipc}%</td>
                    <td className="px-5 py-3 text-right text-ink-light">
                      {formatMonto(m.facturado)}
                    </td>
                    <td className="px-5 py-3 text-right text-ink-light">
                      {formatMonto(m.cobrado)}
                    </td>
                    <td
                      className={`px-5 py-3 text-right ${m.diasDemora > 50 ? "text-red-600 font-semibold" : "text-ink-light"}`}
                    >
                      {m.diasDemora}
                    </td>
                    <td className="px-5 py-3 text-right font-semibold text-red-600">
                      {formatMonto(m.perdidaReal)}
                    </td>
                    <td
                      className={`px-5 py-3 text-right font-semibold ${m.perdidaPorcentaje > 8 ? "text-red-600" : m.perdidaPorcentaje > 6 ? "text-amber-500" : "text-success-600"}`}
                    >
                      {m.perdidaPorcentaje}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Per-financiador inflation impact */}
          <div className="bg-white border border-border rounded-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <div className="text-xs text-ink-muted">{t("inflation.impactByInsurer")}</div>
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-ink-muted" />
                <select
                  value={finFilter}
                  onChange={(e) => setFinFilter(e.target.value)}
                  aria-label={t("inflation.filterByInsurer")}
                  className="text-xs border border-border rounded-[4px] px-2 py-1 outline-none focus:border-celeste-dark bg-white text-ink"
                >
                  <option>Todos</option>
                  {financiadoresInflacion.map((f) => (
                    <option key={f.name}>{f.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F8FAFB] text-[10px] font-bold tracking-wider text-ink-muted uppercase">
                  <th scope="col" className="text-left px-5 py-2.5">
                    {t("inflation.insurer")}
                  </th>
                  <th scope="col" className="text-right px-5 py-2.5">
                    {t("inflation.avgDaysCol")}
                  </th>
                  <th scope="col" className="text-right px-5 py-2.5">
                    {t("inflation.lossPerDayCol")}
                  </th>
                  <th scope="col" className="text-right px-5 py-2.5">
                    {t("inflation.totalLossCol")}
                  </th>
                  <th scope="col" className="text-right px-5 py-2.5">
                    {t("inflation.affectedAmount")}
                  </th>
                  <th scope="col" className="text-right px-5 py-2.5">
                    {t("inflation.estimatedLoss")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredFinanciadores.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-0">
                      <EmptyState
                        title={t("label.noResults")}
                        description={t("inflation.noResultsDesc")}
                      />
                    </td>
                  </tr>
                ) : (
                  filteredFinanciadores.map((f) => {
                    const perdidaEstimada = Math.round(f.montoAfectado * (f.perdidaTotal / 100));
                    return (
                      <tr
                        key={f.name}
                        className="border-t border-border-light hover:bg-celeste-pale/30 transition"
                      >
                        <td className="px-5 py-3 font-semibold text-ink">{f.name}</td>
                        <td
                          className={`px-5 py-3 text-right ${f.diasPromedio > 60 ? "text-red-600 font-semibold" : "text-ink-light"}`}
                        >
                          {f.diasPromedio}
                        </td>
                        <td className="px-5 py-3 text-right text-ink-light">{f.perdidaPorDia}%</td>
                        <td
                          className={`px-5 py-3 text-right font-semibold ${f.perdidaTotal > 7 ? "text-red-600" : f.perdidaTotal > 4 ? "text-amber-500" : "text-success-600"}`}
                        >
                          {f.perdidaTotal}%
                        </td>
                        <td className="px-5 py-3 text-right text-ink-light">
                          {formatMonto(f.montoAfectado)}
                        </td>
                        <td className="px-5 py-3 text-right font-semibold text-red-600">
                          {formatMonto(perdidaEstimada)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

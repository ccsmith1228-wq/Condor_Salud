"use client";
import { useState } from "react";
import { useToast } from "@/components/Toast";
import { useDemoAction } from "@/components/DemoModal";
import { useExport } from "@/lib/services/export";
import { useNomencladorEntries } from "@/hooks/use-data";
import { useLocale } from "@/lib/i18n/context";
import { formatCurrency } from "@/lib/utils";
import { EmptyState } from "@/components/ui";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function NomencladorPage() {
  const { showToast } = useToast();
  const { showDemo } = useDemoAction();
  const { t, locale } = useLocale();
  const { exportExcel, isExporting } = useExport();
  const { data: nomenclador = [], isLoading } = useNomencladorEntries();
  const [search, setSearch] = useState("");
  const [capFilter, setCapFilter] = useState("Todos");
  const [comparar, setComparar] = useState(false);

  const capitulos = ["Todos", ...Array.from(new Set(nomenclador.map((p) => p.capitulo)))];

  const filtered = nomenclador.filter((p) => {
    const matchSearch =
      p.codigo.includes(search) || p.descripcion.toLowerCase().includes(search.toLowerCase());
    const matchCap = capFilter === "Todos" || p.capitulo === capFilter;
    return matchSearch && matchCap;
  });

  return (
    <div className="space-y-5">
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-celeste" />
          <span className="ml-2 text-sm text-ink-muted">{t("nomenclator.loading")}</span>
        </div>
      )}
      {!isLoading && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-ink">{t("nomenclator.title")}</h1>
              <p className="text-sm text-ink-muted mt-0.5">
                {t("nomenclator.subtitle")}{" "}
                {new Date().toLocaleDateString(locale === "en" ? "en-US" : "es-AR", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/dashboard/nomenclador/pami"
                className="px-4 py-2 text-sm font-medium bg-celeste-dark text-white rounded-[4px] hover:bg-celeste-dark/90 transition"
              >
                {t("pami.viewNomenclador")}
              </Link>
              <button
                onClick={() => setComparar(!comparar)}
                className={`px-4 py-2 text-sm rounded-[4px] font-medium transition ${comparar ? "bg-celeste-dark text-white" : "border border-border text-ink-light hover:border-celeste-dark"}`}
              >
                {comparar ? t("nomenclator.compareActive") : t("nomenclator.compareInsurers")}
              </button>
              <button
                onClick={() => exportExcel("nomenclador")}
                disabled={isExporting}
                className="px-4 py-2 text-sm font-medium border border-border rounded-[4px] text-ink-light hover:border-celeste-dark hover:text-celeste-dark transition disabled:opacity-50"
              >
                {isExporting ? t("action.exporting") : t("action.exportExcel")}
              </button>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                label: t("nomenclator.totalServices"),
                value: nomenclador.length,
                color: "border-celeste",
              },
              {
                label: t("nomenclator.chapters"),
                value: capitulos.length - 1,
                color: "border-gold",
              },
              {
                label: t("nomenclator.avgValueSSS"),
                value: nomenclador.length
                  ? formatCurrency(
                      Math.round(
                        nomenclador.reduce((s, p) => s + p.valorSSS, 0) / nomenclador.length,
                      ),
                    )
                  : "—",
                color: "border-green-400",
              },
              { label: t("nomenclator.lastUpdate"), value: "01/03/2026", color: "border-celeste" },
            ].map((k) => (
              <div
                key={k.label}
                className={`bg-white border border-border rounded-lg p-4 border-l-[3px] ${k.color}`}
              >
                <p className="text-[10px] font-bold tracking-wider text-ink-muted uppercase">
                  {k.label}
                </p>
                <p className="text-xl font-bold text-ink mt-1">{k.value}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            <input
              type="text"
              placeholder={t("nomenclator.searchPlaceholder")}
              aria-label={t("nomenclator.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-80 px-4 py-2 text-sm border border-border rounded-[4px] outline-none focus:border-celeste-dark transition"
            />
            <select
              value={capFilter}
              onChange={(e) => setCapFilter(e.target.value)}
              aria-label={t("nomenclator.filterByChapter")}
              className="px-3 py-2 text-sm border border-border rounded-[4px] outline-none focus:border-celeste-dark transition bg-white text-ink"
            >
              {capitulos.map((c) => (
                <option key={c} value={c}>
                  {c === "Todos" ? t("nomenclator.allChapters") : c}
                </option>
              ))}
            </select>
            <span className="text-xs text-ink-muted ml-auto">
              {filtered.length}{" "}
              {filtered.length !== 1 ? t("nomenclator.results") : t("nomenclator.result")}
            </span>
          </div>

          {/* Table */}
          <div className="bg-white border border-border rounded-lg overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr className="bg-[#F8FAFB] text-[10px] font-bold tracking-wider text-ink-muted uppercase">
                  <th scope="col" className="text-left px-5 py-2.5">
                    {t("label.code")}
                  </th>
                  <th scope="col" className="text-left px-5 py-2.5">
                    {t("nomenclator.service")}
                  </th>
                  <th scope="col" className="text-left px-5 py-2.5">
                    {t("nomenclator.chapter")}
                  </th>
                  <th scope="col" className="text-left px-5 py-2.5">
                    {t("nomenclator.module")}
                  </th>
                  <th scope="col" className="text-right px-5 py-2.5">
                    {t("nomenclator.valueSSSHeader")}
                  </th>
                  <th scope="col" className="text-right px-5 py-2.5">
                    {t("nomenclator.valuePAMIHeader")}
                  </th>
                  {comparar && (
                    <th scope="col" className="text-right px-5 py-2.5">
                      OSDE
                    </th>
                  )}
                  {comparar && (
                    <th scope="col" className="text-right px-5 py-2.5">
                      Swiss Med.
                    </th>
                  )}
                  {comparar && (
                    <th scope="col" className="text-right px-5 py-2.5">
                      Δ PAMI vs SSS
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={comparar ? 8 : 5} className="p-0">
                      <EmptyState
                        title={t("label.noResults")}
                        description={t("nomenclator.noResultsDesc")}
                      />
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => {
                    const sss = p.valorSSS;
                    const pami = p.valorPAMI;
                    const diff = Math.round(((pami - sss) / sss) * 100);
                    return (
                      <tr
                        key={p.codigo}
                        className="border-t border-border-light hover:bg-celeste-pale/30 transition cursor-pointer"
                      >
                        <td className="px-5 py-3 font-mono text-xs font-bold text-celeste-dark">
                          {p.codigo}
                        </td>
                        <td className="px-5 py-3 text-xs font-semibold text-ink">
                          {p.descripcion}
                        </td>
                        <td className="px-5 py-3 text-xs text-ink-light">{p.capitulo}</td>
                        <td className="px-5 py-3 text-xs text-ink-muted">{p.modulo}</td>
                        <td className="px-5 py-3 text-right text-xs font-bold text-ink">
                          {formatCurrency(p.valorSSS)}
                        </td>
                        <td className="px-5 py-3 text-right text-xs font-bold text-celeste-dark">
                          {formatCurrency(p.valorPAMI)}
                        </td>
                        {comparar && (
                          <td className="px-5 py-3 text-right text-xs text-ink">
                            {formatCurrency(p.valorOSDE)}
                          </td>
                        )}
                        {comparar && (
                          <td className="px-5 py-3 text-right text-xs text-ink">
                            {formatCurrency(p.valorSwiss)}
                          </td>
                        )}
                        {comparar && (
                          <td
                            className={`px-5 py-3 text-right text-xs font-bold ${diff < 0 ? "text-red-600" : "text-green-600"}`}
                          >
                            {diff > 0 ? "+" : ""}
                            {diff}%
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Quick reference */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-celeste-pale/40 border border-border rounded-lg p-5">
              <h3 className="text-xs font-bold tracking-wider text-celeste-dark uppercase mb-3">
                {t("nomenclator.quickReference")}
              </h3>
              <div className="space-y-2 text-xs">
                {[
                  { mod: "Módulo 1", desc: t("nomenclator.medicalConsultations") },
                  { mod: "Módulo 4", desc: t("nomenclator.cardiologyDiag") },
                  { mod: "Módulo 5", desc: t("nomenclator.surgeries") },
                  { mod: "Módulo 6", desc: t("nomenclator.laboratory") },
                  { mod: "Módulo 8", desc: t("nomenclator.diagnosticImaging") },
                  { mod: "Módulo 9", desc: t("nomenclator.rehabilitation") },
                ].map((m) => (
                  <div key={m.mod} className="flex items-center gap-2">
                    <span className="font-mono font-bold text-celeste-dark w-20">{m.mod}</span>
                    <span className="text-ink-light">{m.desc}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gold-pale/40 border border-border rounded-lg p-5">
              <h3 className="text-xs font-bold tracking-wider text-[#B8860B] uppercase mb-3">
                {t("nomenclator.importantNotes")}
              </h3>
              <ul className="space-y-2 text-xs text-ink-light">
                <li>• {t("nomenclator.note1")}</li>
                <li>• {t("nomenclator.note2")}</li>
                <li>• {t("nomenclator.note3")}</li>
                <li>• {t("nomenclator.note4")}</li>
                <li>• {t("nomenclator.note5")}</li>
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

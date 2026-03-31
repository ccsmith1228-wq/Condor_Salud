"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { Pagination } from "@/components/ui/Pagination";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ChevronRight, ChevronLeft, ExternalLink, ScanLine } from "lucide-react";
import { useDemoAction } from "@/components/DemoModal";
import { useToast } from "@/components/Toast";
import { useIsDemo } from "@/lib/auth/context";
import { useLocale } from "@/lib/i18n/context";
import { useNubixStudies, useNubixKPIs } from "@/lib/hooks/useModules";
import { getNubixViewerConfig } from "@/lib/services/nubix";
import type { NubixStudy, NubixModality, NubixStudyStatus } from "@/lib/nubix/types";

// ─── Helpers ─────────────────────────────────────────────────

const modalityLabel: Record<NubixModality, string> = {
  CR: "Rx Computada",
  CT: "Tomografía",
  MR: "Resonancia",
  US: "Ecografía",
  DX: "Rx Digital",
  MG: "Mamografía",
  OT: "Otro",
  XA: "Angiografía",
  PT: "PET",
  NM: "Med. Nuclear",
  IO: "Intraoral",
  PX: "Panorámica",
  ES: "Endoscopía",
  ECG: "ECG",
  AU: "Audiometría",
  OPT: "Oft. Tomografía",
};

const statusConfig: Record<NubixStudyStatus, { label: string; color: string }> = {
  scheduled: { label: "Programado", color: "bg-blue-100 text-blue-700" },
  in_progress: { label: "En progreso", color: "bg-yellow-100 text-yellow-700" },
  completed: { label: "Completado", color: "bg-green-100 text-green-700" },
  reported: { label: "Informado", color: "bg-purple-100 text-purple-700" },
  delivered: { label: "Entregado", color: "bg-emerald-100 text-emerald-700" },
  cancelled: { label: "Cancelado", color: "bg-red-100 text-red-700" },
};

function formatDate(iso: string, loc?: string) {
  return new Date(iso).toLocaleDateString(loc === "en" ? "en-US" : "es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatTime(iso: string, loc?: string) {
  return new Date(iso).toLocaleTimeString(loc === "en" ? "en-US" : "es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Constants ───────────────────────────────────────────────

const MODALITIES = ["CT", "MR", "US", "CR", "DX", "PT", "NM", "XA", "RF", "MG"] as const;
const healthFetcher = (url: string) => fetch(url).then((r) => r.json());

interface SeriesItem {
  seriesInstanceUID: string;
  seriesNumber: number;
  modality: string;
  seriesDescription: string;
  numberOfInstances: number;
  bodyPartExamined?: string;
}

// ─── Page Component ──────────────────────────────────────────

export default function NubixPage() {
  const { showDemo } = useDemoAction();
  const { showToast } = useToast();
  const isDemo = useIsDemo();
  const { t, locale } = useLocale();
  const router = useRouter();

  // ─── Search sidebar state ───────────────────────────────────
  const [patientName, setPatientName] = useState("");
  const [patientId, setPatientId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedModalities, setSelectedModalities] = useState<string[]>([]);
  const [debouncedName, setDebouncedName] = useState("");

  // ─── Table state ────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 25;

  // ─── Right panel state ──────────────────────────────────────
  const [selectedStudy, setSelectedStudy] = useState<NubixStudy | null>(null);
  const [seriesOpen, setSeriesOpen] = useState(false);
  const [seriesData, setSeriesData] = useState<SeriesItem[]>([]);
  const [seriesLoading, setSeriesLoading] = useState(false);

  // ─── SWR data hooks ─────────────────────────────────────────
  const { data: studies = [], isLoading } = useNubixStudies();
  const { data: kpis, isLoading: kpisLoading } = useNubixKPIs();

  // ─── PACS health status ─────────────────────────────────────
  const { data: health } = useSWR("/api/nubix/health", healthFetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 30000,
  });
  const pacsStatus: "connected" | "disconnected" | "demo" =
    health?.status === "connected"
      ? "connected"
      : health?.status === "demo"
        ? "demo"
        : "disconnected";

  // ─── Debounce patient name ──────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedName(patientName), 400);
    return () => clearTimeout(timer);
  }, [patientName]);

  // ─── Filtering ──────────────────────────────────────────────
  const allStudies = studies as NubixStudy[];
  const filteredStudies = allStudies.filter((s) => {
    if (debouncedName) {
      const q = debouncedName.toLowerCase();
      if (!s.patientName.toLowerCase().includes(q)) return false;
    }
    if (patientId && !s.patientDni?.includes(patientId)) return false;
    if (selectedModalities.length > 0 && !selectedModalities.includes(s.modality)) return false;
    // Date range filter
    if (dateFrom) {
      const studyDate = s.studyDate ? new Date(s.studyDate).toISOString().split("T")[0] : undefined;
      if (!studyDate || studyDate < dateFrom) return false;
    }
    if (dateTo) {
      const studyDate = s.studyDate ? new Date(s.studyDate).toISOString().split("T")[0] : undefined;
      if (!studyDate || studyDate > dateTo) return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filteredStudies.length / PAGE_SIZE);
  const paginatedStudies = filteredStudies.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedName, patientId, dateFrom, dateTo, selectedModalities]);

  // ─── Series panel fetch ─────────────────────────────────────
  const handleViewSeries = useCallback(async (study: NubixStudy) => {
    setSelectedStudy(study);
    setSeriesOpen(true);
    setSeriesLoading(true);
    try {
      const res = await fetch(`/api/nubix/series?studyInstanceUID=${encodeURIComponent(study.id)}`);
      const data = await res.json();
      setSeriesData(data.series || []);
    } catch {
      setSeriesData([]);
    } finally {
      setSeriesLoading(false);
    }
  }, []);

  const clearFilters = () => {
    setPatientName("");
    setPatientId("");
    setDateFrom("");
    setDateTo("");
    setSelectedModalities([]);
  };

  const toggleModality = (m: string) => {
    setSelectedModalities((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m],
    );
  };

  // ─── KPI calculations ──────────────────────────────────────
  const totalStudies = allStudies.length;
  const activeModalities = new Set(allStudies.map((s) => s.modality)).size;
  const studiesToday = kpis?.todayStudies ?? 0;
  const totalInstances = allStudies.reduce((sum, s) => sum + (s.instanceCount || 0), 0);

  return (
    <div id="main-content" className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* ════════════════ LEFT — Search Sidebar ════════════════ */}
      <aside className="w-[280px] shrink-0 border-r border-border bg-white overflow-y-auto hidden lg:block">
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-2">
            <ScanLine className="w-5 h-5 text-celeste-dark" />
            <h2 className="text-sm font-bold text-ink">{t("nubix.title")}</h2>
          </div>

          {/* Patient name */}
          <div>
            <label className="text-xs font-medium text-ink-muted block mb-1">
              {t("nubix.searchByName")}
            </label>
            <input
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="García, Juan..."
              className="w-full px-3 py-2 border border-border rounded text-sm focus:outline-none focus:border-celeste-dark focus:ring-2 focus:ring-celeste-dark/30"
            />
          </div>

          {/* Patient ID */}
          <div>
            <label className="text-xs font-medium text-ink-muted block mb-1">
              {t("nubix.searchById")}
            </label>
            <input
              type="text"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              placeholder="20-31456789-0"
              className="w-full px-3 py-2 border border-border rounded text-sm focus:outline-none focus:border-celeste-dark focus:ring-2 focus:ring-celeste-dark/30"
            />
          </div>

          {/* Date range */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-medium text-ink-muted block mb-1">
                {t("nubix.dateFrom")}
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-2 py-2 border border-border rounded text-xs focus:outline-none focus:border-celeste-dark focus:ring-2 focus:ring-celeste-dark/30"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-ink-muted block mb-1">
                {t("nubix.dateTo")}
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-2 py-2 border border-border rounded text-xs focus:outline-none focus:border-celeste-dark focus:ring-2 focus:ring-celeste-dark/30"
              />
            </div>
          </div>

          {/* Modality multi-select */}
          <div>
            <label className="text-xs font-medium text-ink-muted block mb-1.5">
              {t("nubix.modality")}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {MODALITIES.map((m) => (
                <button
                  key={m}
                  onClick={() => toggleModality(m)}
                  className={`px-2 py-1 text-[11px] font-medium rounded transition ${
                    selectedModalities.includes(m)
                      ? "bg-celeste-dark text-white"
                      : "bg-surface text-ink-muted hover:bg-celeste-pale"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Clear filters */}
          <div className="pt-2">
            <button onClick={clearFilters} className="text-xs text-celeste-dark hover:underline">
              {t("nubix.clearFilters")}
            </button>
          </div>
        </div>
      </aside>

      {/* ════════════════ CENTER — KPIs + Study Table ════════════════ */}
      <main className="flex-1 overflow-y-auto p-6 space-y-5 min-w-0">
        {/* Page header + PACS status */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-display font-bold text-ink flex items-center gap-2">
              {t("nubix.title")}
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                  pacsStatus === "connected"
                    ? "bg-green-100 text-green-700"
                    : pacsStatus === "demo"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-red-100 text-red-700"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    pacsStatus === "connected"
                      ? "bg-green-500"
                      : pacsStatus === "demo"
                        ? "bg-amber-500"
                        : "bg-red-500"
                  }`}
                />
                {pacsStatus === "connected"
                  ? t("nubix.pacsConnected")
                  : pacsStatus === "demo"
                    ? t("nubix.demoMode")
                    : t("nubix.pacsDisconnected")}
              </span>
            </h1>
            <p className="text-sm text-ink-light mt-0.5">{t("nubix.subtitle")}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() =>
                !isDemo ? router.push("/dashboard/agenda") : showDemo(t("nubix.newAppointment"))
              }
              className="px-4 py-2 border border-border text-sm font-medium rounded hover:bg-surface transition"
            >
              {t("nubix.newAppointment")}
            </button>
            <button
              onClick={() => {
                if (isDemo) {
                  showDemo(t("nubix.uploadStudy"));
                  return;
                }
                const input = document.createElement("input");
                input.type = "file";
                input.accept = ".dcm,.dicom,image/*";
                input.multiple = true;
                input.onchange = async () => {
                  const count = input.files?.length ?? 0;
                  if (count === 0) return;
                  showToast(`Uploading ${count} file(s)...`, "success");
                  try {
                    const formData = new FormData();
                    for (let i = 0; i < count; i++) {
                      const file = input.files?.[i];
                      if (file) formData.append("files", file);
                    }
                    const res = await fetch("/api/nubix/upload", {
                      method: "POST",
                      body: formData,
                    });
                    if (!res.ok) throw new Error();
                    showToast(`${count} archivo(s) subido(s) exitosamente`, "success");
                  } catch {
                    showToast(`${count} archivo(s) seleccionado(s)`, "success");
                  }
                };
                input.click();
              }}
              className="px-4 py-2 bg-celeste-dark text-white text-sm font-semibold rounded hover:bg-celeste transition"
            >
              {t("nubix.uploadStudy")}
            </button>
          </div>
        </div>

        {/* KPI strip — 4 cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: t("nubix.totalStudiesKpi"),
              value: totalStudies,
              color: "border-l-celeste-dark",
            },
            {
              label: t("nubix.activeModalities"),
              value: activeModalities,
              color: "border-l-celeste",
            },
            {
              label: t("nubix.todayStudiesKpi"),
              value: studiesToday,
              color: "border-l-success-500",
            },
            { label: t("nubix.totalInstances"), value: totalInstances, color: "border-l-gold" },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className={`bg-white border border-border border-l-4 ${kpi.color} rounded-[4px] p-4`}
            >
              <p className="text-[11px] font-semibold text-ink-muted uppercase tracking-wide">
                {kpi.label}
              </p>
              {kpisLoading ? (
                <Skeleton className="h-8 w-20 mt-1" />
              ) : (
                <p className="text-2xl font-bold text-ink mt-1">{kpi.value}</p>
              )}
            </div>
          ))}
        </div>

        {/* Study table */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : filteredStudies.length === 0 ? (
          <EmptyState title={t("nubix.emptyTitle")} description={t("nubix.emptyDescription")} />
        ) : (
          <>
            <div className="bg-white border border-border rounded-[4px] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm" aria-label="Estudios de imágenes">
                  <thead>
                    <tr className="bg-celeste-pale border-b border-border">
                      <th
                        scope="col"
                        className="text-left px-4 py-3 font-medium text-ink-muted text-xs"
                      >
                        {t("nubix.patient")}
                      </th>
                      <th
                        scope="col"
                        className="text-left px-4 py-3 font-medium text-ink-muted text-xs"
                      >
                        ID
                      </th>
                      <th
                        scope="col"
                        className="text-left px-4 py-3 font-medium text-ink-muted text-xs"
                      >
                        {t("nubix.date")}
                      </th>
                      <th
                        scope="col"
                        className="text-left px-4 py-3 font-medium text-ink-muted text-xs"
                      >
                        {t("nubix.description")}
                      </th>
                      <th
                        scope="col"
                        className="text-left px-4 py-3 font-medium text-ink-muted text-xs"
                      >
                        {t("nubix.modality")}
                      </th>
                      <th
                        scope="col"
                        className="text-left px-4 py-3 font-medium text-ink-muted text-xs"
                      >
                        {t("nubix.series")}
                      </th>
                      <th
                        scope="col"
                        className="text-left px-4 py-3 font-medium text-ink-muted text-xs"
                      >
                        {t("nubix.instances")}
                      </th>
                      <th
                        scope="col"
                        className="text-left px-4 py-3 font-medium text-ink-muted text-xs"
                      >
                        {t("nubix.actions")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedStudies.map((study) => (
                      <tr
                        key={study.id}
                        className={`border-b border-border last:border-0 hover:bg-celeste-pale/30 transition cursor-pointer ${
                          selectedStudy?.id === study.id ? "bg-celeste-pale/40" : ""
                        }`}
                        onClick={() => handleViewSeries(study)}
                      >
                        <td className="px-4 py-3">
                          <div className="font-medium text-sm">{study.patientName}</div>
                          <div className="text-[11px] text-ink-muted">{study.patientDni}</div>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-ink-muted">
                          {study.accessionNumber}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-xs">
                          {formatDate(study.studyDate, locale)}
                        </td>
                        <td className="px-4 py-3 max-w-[200px] truncate text-xs">
                          {study.description}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-surface px-2 py-0.5 rounded">
                            {study.modality}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-center">{study.seriesCount}</td>
                        <td className="px-4 py-3 text-xs text-center">{study.instanceCount}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewSeries(study);
                              }}
                              className="text-[11px] px-2.5 py-1.5 bg-celeste-dark text-white rounded hover:bg-celeste transition font-medium"
                            >
                              {t("nubix.viewSeries")}
                            </button>
                            <a
                              href={process.env.NEXT_PUBLIC_DCM4CHEE_UI_URL || "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="p-1.5 text-ink-muted hover:text-celeste-dark transition"
                              title="dcm4chee UI"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}

        {/* Storage info */}
        {kpis && (
          <div className="text-xs text-ink-muted text-right">
            {t("nubix.storage")} {kpis.storageUsedGB} {t("nubix.gbUsed")} · Powered by{" "}
            <a
              href="https://web.dcm4che.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-celeste-dark hover:underline"
            >
              dcm4chee Archive
            </a>
          </div>
        )}
      </main>

      {/* ════════════════ RIGHT — Series + Thumbnails Panel ════════════════ */}
      {seriesOpen && (
        <aside className="w-[320px] shrink-0 border-l border-border bg-white overflow-y-auto hidden lg:block">
          <div className="p-4 space-y-4">
            {/* Panel header */}
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-ink">{t("nubix.seriesPanel")}</h3>
              <button
                onClick={() => {
                  setSeriesOpen(false);
                  setSelectedStudy(null);
                }}
                className="p-1 text-ink-muted hover:text-ink transition"
                aria-label={t("common.close")}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Selected study info */}
            {selectedStudy && (
              <div className="bg-surface rounded p-3 space-y-1">
                <p className="text-sm font-semibold text-ink">{selectedStudy.patientName}</p>
                <p className="text-[11px] text-ink-muted">{selectedStudy.description}</p>
                <p className="text-[11px] text-ink-muted font-mono">
                  {selectedStudy.accessionNumber} · {selectedStudy.modality}
                </p>
              </div>
            )}

            {/* Series list */}
            {seriesLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : seriesData.length === 0 ? (
              <p className="text-xs text-ink-muted text-center py-4">{t("nubix.noStudies")}</p>
            ) : (
              <div className="space-y-3">
                {seriesData.map((series) => (
                  <div
                    key={series.seriesInstanceUID}
                    className="border border-border rounded-[4px] overflow-hidden hover:border-celeste-dark/40 transition"
                  >
                    {/* Thumbnail */}
                    <div className="bg-ink/90 h-20 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/api/nubix/thumbnail?studyUID=${selectedStudy?.id}&seriesUID=${series.seriesInstanceUID}&instanceUID=1`}
                        alt={series.seriesDescription}
                        className="h-full w-full object-contain"
                        loading="lazy"
                      />
                    </div>
                    {/* Series info */}
                    <div className="p-2.5 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold bg-celeste-pale text-celeste-dark px-1.5 py-0.5 rounded">
                          {series.modality}
                        </span>
                        <span className="text-[11px] font-medium text-ink truncate">
                          {series.seriesDescription}
                        </span>
                      </div>
                      <p className="text-[10px] text-ink-muted">
                        {series.numberOfInstances} {t("nubix.instances")}
                        {series.bodyPartExamined && ` · ${series.bodyPartExamined}`}
                      </p>
                      <button
                        onClick={async () => {
                          if (isDemo) {
                            showDemo(t("nubix.openInViewer"));
                            return;
                          }
                          const config = await getNubixViewerConfig(
                            selectedStudy?.id || series.seriesInstanceUID,
                          );
                          if (config?.embedUrl) {
                            window.open(config.embedUrl, "_blank");
                          } else {
                            // Fallback to dcm4chee native UI
                            const dcm4cheeUrl = process.env.NEXT_PUBLIC_DCM4CHEE_UI_URL || "#";
                            window.open(dcm4cheeUrl, "_blank");
                          }
                        }}
                        className="text-[11px] text-celeste-dark font-medium hover:underline"
                      >
                        {t("nubix.openInViewer")} →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      )}

      {/* Series panel toggle (when closed) */}
      {!seriesOpen && selectedStudy && (
        <button
          onClick={() => setSeriesOpen(true)}
          className="hidden lg:flex fixed right-0 top-1/2 -translate-y-1/2 bg-celeste-dark text-white px-1 py-3 rounded-l shadow-lg hover:bg-celeste transition z-10"
          aria-label={t("nubix.seriesPanel")}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useToast } from "@/components/Toast";
import { RequirePermission } from "@/components/RequirePermission";
import { useLocale } from "@/lib/i18n/context";
import {
  getAuditoriaFiltered,
  updateAuditItem,
  runAutoAudit,
  getAuditStats,
  type AuditFilter,
  type AuditStats,
} from "@/lib/services/audit";
import type { AuditoriaItem } from "@/lib/services/data";
import { Shield, Search, Check, X, Eye, Play, Loader2, AlertTriangle } from "lucide-react";

// ─── Styles ──────────────────────────────────────────────────

const severidadColors: Record<string, string> = {
  alta: "bg-red-50 text-red-600 border-red-200",
  media: "bg-gold-pale text-[#B8860B] border-gold",
  baja: "bg-celeste-pale text-celeste-dark border-celeste",
};

const estadoColors: Record<string, string> = {
  pendiente: "bg-gold-pale text-[#B8860B]",
  revisado: "bg-celeste-pale text-celeste-dark",
  resuelto: "bg-green-50 text-green-700",
};

// ─── Component ───────────────────────────────────────────────

export default function AuditoriaPage() {
  const { t } = useLocale();
  const { showToast } = useToast();
  const [items, setItems] = useState<AuditoriaItem[]>([]);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [autoAuditLoading, setAutoAuditLoading] = useState(false);

  // Filters
  const [sevFilter, setSevFilter] = useState("Todos");
  const [estadoFilter, setEstadoFilter] = useState("Todos");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true);
    const filter: AuditFilter = {};
    if (sevFilter !== "Todos")
      filter.severidad = sevFilter.toLowerCase() as AuditFilter["severidad"];
    if (estadoFilter !== "Todos")
      filter.estado = estadoFilter.toLowerCase() as AuditFilter["estado"];
    if (search) filter.search = search;

    const [data, s] = await Promise.all([getAuditoriaFiltered(filter), getAuditStats()]);
    setItems(data);
    setStats(s);
    setLoading(false);
  }, [sevFilter, estadoFilter, search]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Actions
  const handleMarkResolved = useCallback(
    async (id: string) => {
      setActionLoading(id);
      const result = await updateAuditItem(id, { estado: "resuelto" });
      setActionLoading(null);
      if (result.success) {
        showToast(t("toast.audit.resolved"));
        loadData();
      } else {
        showToast(`${result.error}`);
      }
    },
    [loadData, showToast, t],
  );

  const handleMarkReviewed = useCallback(
    async (id: string) => {
      setActionLoading(id);
      const result = await updateAuditItem(id, { estado: "revisado" });
      setActionLoading(null);
      if (result.success) {
        showToast(t("toast.audit.reviewed"));
        loadData();
      } else {
        showToast(`${result.error}`);
      }
    },
    [loadData, showToast, t],
  );

  const handleRunAudit = useCallback(async () => {
    setAutoAuditLoading(true);
    const result = await runAutoAudit();
    setAutoAuditLoading(false);
    if (result.success) {
      showToast(t("audit.auditCompletedMsg").replace("{count}", String(result.newFindings)));
      loadData();
    } else {
      showToast(`${result.error}`);
    }
  }, [loadData, showToast, t]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">{t("audit.title")}</h1>
          <p className="text-sm text-ink-muted mt-0.5">{t("audit.subtitle")}</p>
        </div>
        <div className="flex gap-2">
          <RequirePermission permission="auditoria:read">
            <button
              onClick={handleRunAudit}
              disabled={autoAuditLoading}
              className="px-4 py-2 text-sm font-medium border border-border rounded-[4px] text-ink-light hover:border-celeste-dark hover:text-celeste-dark transition disabled:opacity-50 flex items-center gap-2"
            >
              {autoAuditLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              {t("audit.runAuditAction")}
            </button>
          </RequirePermission>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: t("audit.totalFindings"),
            value: stats?.total ?? "...",
            color: "border-celeste",
          },
          { label: t("status.pending"), value: stats?.pendientes ?? "...", color: "border-gold" },
          { label: t("audit.highSeverity"), value: stats?.alta ?? "...", color: "border-red-400" },
          {
            label: t("audit.resolvedCount"),
            value: stats?.resueltos ?? "...",
            color: "border-green-400",
          },
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

      {/* Search + Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
          <input
            type="text"
            placeholder={t("action.search")}
            aria-label={t("audit.searchAudit")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-1.5 border border-border rounded-[4px] text-sm focus:outline-none focus:ring-2 focus:ring-celeste-200 focus:border-celeste-dark w-48"
          />
        </div>
        <span className="text-xs font-bold text-ink-muted uppercase tracking-wider">
          {t("audit.severity")}:
        </span>
        {[
          { value: "Todos", label: t("label.all") },
          { value: "Alta", label: t("audit.severityHigh") },
          { value: "Media", label: t("audit.severityMedium") },
          { value: "Baja", label: t("audit.severityLow") },
        ].map((s) => (
          <button
            key={s.value}
            onClick={() => setSevFilter(s.value)}
            className={`px-3 py-1.5 text-xs rounded-[4px] transition ${sevFilter === s.value ? "bg-ink text-white" : "border border-border text-ink-light hover:border-ink"}`}
          >
            {s.label}
          </button>
        ))}
        <span className="text-xs font-bold text-ink-muted uppercase tracking-wider ml-2">
          {t("label.status")}:
        </span>
        {[
          { value: "Todos", label: t("label.all") },
          { value: "Pendiente", label: t("status.pending") },
          { value: "Revisado", label: t("audit.reviewed") },
          { value: "Resuelto", label: t("audit.resolvedLabel") },
        ].map((e) => (
          <button
            key={e.value}
            onClick={() => setEstadoFilter(e.value)}
            className={`px-3 py-1.5 text-xs rounded-[4px] transition ${estadoFilter === e.value ? "bg-ink text-white" : "border border-border text-ink-light hover:border-ink"}`}
          >
            {e.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-celeste-dark animate-spin" />
          <span className="ml-2 text-sm text-ink-muted">{t("audit.loadingAudit")}</span>
        </div>
      )}

      {/* Audit cards */}
      {!loading && (
        <div className="space-y-3">
          {items.map((a) => (
            <div
              key={a.id}
              className={`bg-white border rounded-lg overflow-hidden transition ${expanded === a.id ? "border-celeste shadow-sm" : "border-border hover:border-celeste-light"}`}
            >
              <button
                onClick={() => setExpanded(expanded === a.id ? null : a.id)}
                className="w-full px-5 py-4 flex items-center gap-4 text-left"
              >
                <span
                  className={`w-2 h-2 rounded-full ${a.severidad === "alta" ? "bg-red-500" : a.severidad === "media" ? "bg-gold" : "bg-celeste"}`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono text-ink-muted">{a.id}</span>
                    <span
                      className={`px-1.5 py-0.5 text-[10px] font-bold rounded capitalize ${severidadColors[a.severidad]}`}
                    >
                      {a.severidad}
                    </span>
                    <span className="text-xs font-semibold text-ink">{a.tipo}</span>
                  </div>
                  <div className="text-xs text-ink-light mt-0.5 truncate">
                    {a.paciente} · {a.financiador} · {a.prestacion} · {a.fecha}
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold rounded capitalize ${estadoColors[a.estado]}`}
                >
                  {a.estado}
                </span>
                <svg
                  className={`w-3.5 h-3.5 text-ink-muted transition-transform ${expanded === a.id ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {expanded === a.id && (
                <div className="px-5 pb-5 pt-0 border-t border-border-light">
                  <div className="mt-4">
                    <p className="text-[10px] font-bold tracking-wider text-ink-muted uppercase mb-1">
                      {t("audit.detail")}
                    </p>
                    <p className="text-xs text-ink-light leading-relaxed">{a.detalle}</p>
                  </div>
                  <div className="flex items-center gap-3 mt-4 pt-3 border-t border-border-light">
                    <Link
                      href="/dashboard/facturacion"
                      className="text-xs text-celeste-dark font-medium hover:underline"
                    >
                      {t("audit.viewInvoices")}
                    </Link>
                    <Link
                      href="/dashboard/nomenclador"
                      className="text-xs text-celeste-dark font-medium hover:underline"
                    >
                      {t("audit.consultNomenclator")}
                    </Link>
                    <div className="ml-auto flex gap-2">
                      {a.estado === "pendiente" && (
                        <>
                          {actionLoading === a.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-ink-muted" />
                          ) : (
                            <>
                              <button
                                onClick={() => handleMarkReviewed(a.id)}
                                className="px-3 py-1.5 text-xs font-medium border border-celeste rounded-[4px] text-celeste-dark hover:bg-celeste-pale transition flex items-center gap-1"
                              >
                                <Eye className="w-3 h-3" /> {t("audit.markReviewed")}
                              </button>
                              <button
                                onClick={() => handleMarkResolved(a.id)}
                                className="px-3 py-1.5 text-xs font-semibold bg-green-600 text-white rounded-[4px] hover:bg-green-700 transition flex items-center gap-1"
                              >
                                <Check className="w-3 h-3" /> {t("audit.resolve")}
                              </button>
                            </>
                          )}
                        </>
                      )}
                      {a.estado === "revisado" && (
                        <>
                          {actionLoading === a.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-ink-muted" />
                          ) : (
                            <button
                              onClick={() => handleMarkResolved(a.id)}
                              className="px-3 py-1.5 text-xs font-semibold bg-green-600 text-white rounded-[4px] hover:bg-green-700 transition flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" /> {t("audit.resolve")}
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {items.length === 0 && (
            <div className="bg-white border border-border rounded-lg px-5 py-12 text-center">
              <Shield className="w-8 h-8 text-green-500 mx-auto mb-3" />
              <p className="text-sm font-semibold text-ink">{t("audit.noFindings")}</p>
              <p className="text-xs text-ink-muted mt-1">
                {sevFilter !== "Todos" || estadoFilter !== "Todos"
                  ? t("audit.noFindingsFiltered")
                  : t("audit.allPassed")}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Summary */}
      {!loading && items.length > 0 && (
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-white border border-border rounded-lg p-5">
            <h3 className="text-xs font-bold tracking-wider text-ink-muted uppercase mb-3">
              {t("audit.bySeverity")}
            </h3>
            {(["alta", "media", "baja"] as const).map((sev) => {
              const count = items.filter((a) => a.severidad === sev).length;
              const sevLabel = {
                alta: t("audit.severityHigh"),
                media: t("audit.severityMedium"),
                baja: t("audit.severityLow"),
              }[sev];
              return (
                <div
                  key={sev}
                  className="flex items-center justify-between py-1.5 text-xs border-b border-border-light last:border-0"
                >
                  <span className="text-ink-light">{sevLabel}</span>
                  <span className="font-bold text-ink">{count}</span>
                </div>
              );
            })}
          </div>
          <div className="bg-white border border-border rounded-lg p-5">
            <h3 className="text-xs font-bold tracking-wider text-ink-muted uppercase mb-3">
              {t("audit.byStatus")}
            </h3>
            {(["pendiente", "revisado", "resuelto"] as const).map((est) => {
              const count = items.filter((a) => a.estado === est).length;
              const estLabel = {
                pendiente: t("status.pending"),
                revisado: t("audit.reviewed"),
                resuelto: t("audit.resolvedLabel"),
              }[est];
              return (
                <div
                  key={est}
                  className="flex items-center justify-between py-1.5 text-xs border-b border-border-light last:border-0"
                >
                  <span className="text-ink-light">{estLabel}</span>
                  <span className="font-bold text-ink">{count}</span>
                </div>
              );
            })}
          </div>
          <div className="bg-celeste-pale/40 border border-border rounded-lg p-5">
            <h3 className="text-xs font-bold tracking-wider text-celeste-dark uppercase mb-3">
              {t("audit.summary")}
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-[10px] text-ink-muted">{t("audit.resolutionRate")}</p>
                <p className="text-lg font-bold text-green-600">
                  {stats && stats.total > 0
                    ? `${Math.round((stats.resueltos / stats.total) * 100)}%`
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-ink-muted">{t("audit.pendingHighAlerts")}</p>
                <p className="text-lg font-bold text-red-600">{stats?.alta ?? 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

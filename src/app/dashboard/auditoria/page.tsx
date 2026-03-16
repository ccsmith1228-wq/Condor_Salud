"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useToast } from "@/components/Toast";
import { RequirePermission } from "@/components/RequirePermission";
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
        showToast("✅ Observación resuelta");
        loadData();
      } else {
        showToast(`❌ ${result.error}`);
      }
    },
    [loadData, showToast],
  );

  const handleMarkReviewed = useCallback(
    async (id: string) => {
      setActionLoading(id);
      const result = await updateAuditItem(id, { estado: "revisado" });
      setActionLoading(null);
      if (result.success) {
        showToast("✅ Observación revisada");
        loadData();
      } else {
        showToast(`❌ ${result.error}`);
      }
    },
    [loadData, showToast],
  );

  const handleRunAudit = useCallback(async () => {
    setAutoAuditLoading(true);
    const result = await runAutoAudit();
    setAutoAuditLoading(false);
    if (result.success) {
      showToast(`✅ Auditoría completada: ${result.newFindings} facturas analizadas`);
      loadData();
    } else {
      showToast(`❌ ${result.error}`);
    }
  }, [loadData, showToast]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Auditoría</h1>
          <p className="text-sm text-ink-muted mt-0.5">
            Pre-auditoría automática de facturas antes de presentación
          </p>
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
              Ejecutar auditoría
            </button>
          </RequirePermission>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total observaciones", value: stats?.total ?? "...", color: "border-celeste" },
          { label: "Pendientes", value: stats?.pendientes ?? "...", color: "border-gold" },
          { label: "Severidad alta", value: stats?.alta ?? "...", color: "border-red-400" },
          { label: "Resueltos", value: stats?.resueltos ?? "...", color: "border-green-400" },
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
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-1.5 border border-border rounded-[4px] text-sm focus:outline-none focus:ring-2 focus:ring-celeste-200 focus:border-celeste-dark w-48"
          />
        </div>
        <span className="text-xs font-bold text-ink-muted uppercase tracking-wider">
          Severidad:
        </span>
        {["Todos", "Alta", "Media", "Baja"].map((s) => (
          <button
            key={s}
            onClick={() => setSevFilter(s)}
            className={`px-3 py-1.5 text-xs rounded-[4px] transition ${sevFilter === s ? "bg-ink text-white" : "border border-border text-ink-light hover:border-ink"}`}
          >
            {s}
          </button>
        ))}
        <span className="text-xs font-bold text-ink-muted uppercase tracking-wider ml-2">
          Estado:
        </span>
        {["Todos", "Pendiente", "Revisado", "Resuelto"].map((e) => (
          <button
            key={e}
            onClick={() => setEstadoFilter(e)}
            className={`px-3 py-1.5 text-xs rounded-[4px] transition ${estadoFilter === e ? "bg-ink text-white" : "border border-border text-ink-light hover:border-ink"}`}
          >
            {e}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-celeste-dark animate-spin" />
          <span className="ml-2 text-sm text-ink-muted">Cargando auditoría...</span>
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
                      Detalle
                    </p>
                    <p className="text-xs text-ink-light leading-relaxed">{a.detalle}</p>
                  </div>
                  <div className="flex items-center gap-3 mt-4 pt-3 border-t border-border-light">
                    <Link
                      href="/dashboard/facturacion"
                      className="text-xs text-celeste-dark font-medium hover:underline"
                    >
                      Ver facturas
                    </Link>
                    <Link
                      href="/dashboard/nomenclador"
                      className="text-xs text-celeste-dark font-medium hover:underline"
                    >
                      Consultar nomenclador
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
                                <Eye className="w-3 h-3" /> Marcar revisado
                              </button>
                              <button
                                onClick={() => handleMarkResolved(a.id)}
                                className="px-3 py-1.5 text-xs font-semibold bg-green-600 text-white rounded-[4px] hover:bg-green-700 transition flex items-center gap-1"
                              >
                                <Check className="w-3 h-3" /> Resolver
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
                              <Check className="w-3 h-3" /> Resolver
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
              <p className="text-sm font-semibold text-ink">Sin observaciones</p>
              <p className="text-xs text-ink-muted mt-1">
                {sevFilter !== "Todos" || estadoFilter !== "Todos"
                  ? "No hay observaciones con los filtros seleccionados"
                  : "Todas las facturas pasaron la auditoría automática"}
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
              Por Severidad
            </h3>
            {(["alta", "media", "baja"] as const).map((sev) => {
              const count = items.filter((a) => a.severidad === sev).length;
              return (
                <div
                  key={sev}
                  className="flex items-center justify-between py-1.5 text-xs border-b border-border-light last:border-0"
                >
                  <span className="text-ink-light capitalize">{sev}</span>
                  <span className="font-bold text-ink">{count}</span>
                </div>
              );
            })}
          </div>
          <div className="bg-white border border-border rounded-lg p-5">
            <h3 className="text-xs font-bold tracking-wider text-ink-muted uppercase mb-3">
              Por Estado
            </h3>
            {(["pendiente", "revisado", "resuelto"] as const).map((est) => {
              const count = items.filter((a) => a.estado === est).length;
              return (
                <div
                  key={est}
                  className="flex items-center justify-between py-1.5 text-xs border-b border-border-light last:border-0"
                >
                  <span className="text-ink-light capitalize">{est}</span>
                  <span className="font-bold text-ink">{count}</span>
                </div>
              );
            })}
          </div>
          <div className="bg-celeste-pale/40 border border-border rounded-lg p-5">
            <h3 className="text-xs font-bold tracking-wider text-celeste-dark uppercase mb-3">
              Resumen
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-[10px] text-ink-muted">Tasa de resolución</p>
                <p className="text-lg font-bold text-green-600">
                  {stats && stats.total > 0
                    ? `${Math.round((stats.resueltos / stats.total) * 100)}%`
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-ink-muted">Alertas alta pendientes</p>
                <p className="text-lg font-bold text-red-600">{stats?.alta ?? 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

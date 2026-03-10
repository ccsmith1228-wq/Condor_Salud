"use client";

import { useState, useMemo } from "react";
import type { RechazoMotivo } from "@/lib/types";
import { useToast } from "@/components/Toast";
import { useDemoAction } from "@/components/DemoModal";
import { Card, CardContent, StatusBadge, PageHeader, Select, Button } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { useRechazos } from "@/hooks/use-data";

const motivoLabels: Record<RechazoMotivo, string> = {
  codigo_invalido: "Código inválido",
  afiliado_no_encontrado: "Afiliado no encontrado",
  vencida: "Factura vencida",
  duplicada: "Factura duplicada",
  sin_autorizacion: "Sin autorización previa",
  datos_incompletos: "Datos incompletos",
  nomenclador_desactualizado: "Nomenclador desactualizado",
};

export default function RechazosPage() {
  const { showToast } = useToast();
  const { showDemo } = useDemoAction();
  const { data: rechazos = [], isLoading } = useRechazos();
  const [filtroFinanciador, setFiltroFinanciador] = useState("Todos");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return rechazos.filter((r) => {
      if (filtroFinanciador !== "Todos" && r.financiador !== filtroFinanciador) return false;
      if (filtroEstado !== "todos" && r.estado !== filtroEstado) return false;
      return true;
    });
  }, [rechazos, filtroFinanciador, filtroEstado]);

  const stats = useMemo(() => {
    const totalRechazado = rechazos.reduce((s, r) => s + r.monto, 0);
    const pendientes = rechazos.filter((r) => r.estado === "pendiente");
    const reprocesables = pendientes.filter((r) => r.reprocesable);
    const reprocesados = rechazos.filter((r) => r.estado === "reprocesado");
    const tasaRecupero = Math.round(
      (reprocesados.reduce((s, r) => s + r.monto, 0) / totalRechazado) * 100,
    );
    return { totalRechazado, pendientes, reprocesables, reprocesados, tasaRecupero };
  }, [rechazos]);

  const motivoCounts = useMemo(() => {
    return rechazos.reduce<Record<string, number>>((acc, r) => {
      acc[r.motivo] = (acc[r.motivo] || 0) + 1;
      return acc;
    }, {});
  }, [rechazos]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Gestión de Rechazos"
        description="Auditoría y reprocesamiento de facturas rechazadas"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Rechazos" }]}
      />

      {/* KPI summary */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        role="region"
        aria-label="Resumen de rechazos"
      >
        <div className="bg-white border border-border rounded-lg p-5 border-l-[3px] border-l-red-400">
          <div className="text-xs text-ink-muted mb-1">Total rechazado</div>
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(stats.totalRechazado)}
          </div>
          <div className="text-xs mt-1 text-ink-muted">{rechazos.length} rechazos</div>
        </div>
        <div className="bg-white border border-border rounded-lg p-5 border-l-[3px] border-l-amber-400">
          <div className="text-xs text-ink-muted mb-1">Pendientes de gestión</div>
          <div className="text-2xl font-bold text-amber-600">{stats.pendientes.length}</div>
          <div className="text-xs mt-1 text-ink-muted">
            {formatCurrency(stats.pendientes.reduce((s, r) => s + r.monto, 0))}
          </div>
        </div>
        <div className="bg-white border border-border rounded-lg p-5 border-l-[3px] border-l-celeste">
          <div className="text-xs text-ink-muted mb-1">Reprocesables</div>
          <div className="text-2xl font-bold text-celeste-dark">{stats.reprocesables.length}</div>
          <div className="text-xs mt-1 text-green-600">
            Recuperables: {formatCurrency(stats.reprocesables.reduce((s, r) => s + r.monto, 0))}
          </div>
        </div>
        <div className="bg-white border border-border rounded-lg p-5 border-l-[3px] border-l-green-400">
          <div className="text-xs text-ink-muted mb-1">Tasa de recupero</div>
          <div className="text-2xl font-bold text-celeste-dark">{stats.tasaRecupero}%</div>
          <div className="text-xs mt-1 text-green-600">
            {stats.reprocesados.length} reprocesados
          </div>
        </div>
      </div>

      {/* Two column: Motivos breakdown + Financiador breakdown */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-5">
            <div className="text-xs text-ink-muted mb-3">Rechazos por motivo</div>
            <div className="space-y-3" role="list" aria-label="Distribución de rechazos por motivo">
              {Object.entries(motivoCounts)
                .sort(([, a], [, b]) => b - a)
                .map(([motivo, count]) => (
                  <div key={motivo} className="flex items-center justify-between" role="listitem">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-celeste-dark" aria-hidden="true" />
                      <span className="text-xs text-ink">
                        {motivoLabels[motivo as RechazoMotivo]}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-border-light rounded-full h-1.5" aria-hidden="true">
                        <div
                          className="bg-celeste-dark h-1.5 rounded-full"
                          style={{ width: `${(count / rechazos.length) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-ink w-4 text-right">{count}</span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <Card>
            <CardContent className="pt-5">
              <div className="text-xs text-ink-muted mb-3">Rechazos por financiador</div>
              <div className="grid sm:grid-cols-2 gap-4">
                {["PAMI", "IOMA"].map((fin) => {
                  const finRechazos = rechazos.filter((r) => r.financiador === fin);
                  const finMonto = finRechazos.reduce((s, r) => s + r.monto, 0);
                  const finPendientes = finRechazos.filter((r) => r.estado === "pendiente");
                  return (
                    <div key={fin} className="border border-border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-ink">{fin}</span>
                        <span className="text-xs font-semibold text-red-600">
                          {finRechazos.length} rechazos
                        </span>
                      </div>
                      <div className="text-xl font-bold text-ink mb-1">
                        {formatCurrency(finMonto)}
                      </div>
                      <div className="text-xs text-ink-muted">
                        {finPendientes.length} pendientes ·{" "}
                        {finRechazos.filter((r) => r.reprocesable).length} reprocesables
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div
            className="flex flex-wrap gap-4 items-end"
            role="search"
            aria-label="Filtros de rechazos"
          >
            <Select
              label="Financiador"
              options={[
                { value: "Todos", label: "Todos" },
                { value: "PAMI", label: "PAMI" },
                { value: "IOMA", label: "IOMA" },
              ]}
              value={filtroFinanciador}
              onChange={(e) => setFiltroFinanciador(e.target.value)}
            />
            <Select
              label="Estado"
              options={[
                { value: "todos", label: "Todos" },
                { value: "pendiente", label: "Pendiente" },
                { value: "reprocesado", label: "Reprocesado" },
                { value: "descartado", label: "Descartado" },
              ]}
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
            />
            <div className="ml-auto text-xs text-ink-muted self-center">
              {filtered.length} de {rechazos.length} rechazos
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rechazos list */}
      <div className="space-y-3" role="list" aria-label="Lista de rechazos">
        {filtered.map((r) => (
          <Card key={r.id}>
            <CardContent className="pt-4 pb-4">
              <button
                onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                className="w-full text-left"
                aria-expanded={expandedId === r.id}
                aria-controls={`rechazo-detail-${r.id}`}
              >
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-celeste-dark font-semibold">
                        {r.facturaNumero}
                      </span>
                      <StatusBadge
                        variant={r.estado}
                        label={
                          r.estado === "pendiente"
                            ? "Pendiente"
                            : r.estado === "reprocesado"
                              ? "Reprocesado"
                              : "Descartado"
                        }
                      />
                      {r.reprocesable && (
                        <span className="text-[9px] px-1.5 py-0.5 bg-green-100 text-green-700 font-bold rounded">
                          Reprocesable
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-ink">
                      {r.paciente} — {r.prestacion}
                    </div>
                    <div className="text-xs text-ink-muted mt-0.5">
                      {r.financiador} · {motivoLabels[r.motivo]} · Rechazado: {r.fechaRechazo}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-ink">{formatCurrency(r.monto)}</div>
                    <div className="text-[10px] text-ink-muted">
                      Presentado: {r.fechaPresentacion}
                    </div>
                  </div>
                  <svg
                    className={`w-4 h-4 text-ink-muted transition-transform ${expandedId === r.id ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>
              {expandedId === r.id && (
                <div
                  id={`rechazo-detail-${r.id}`}
                  className="mt-4 pt-4 border-t border-border-light"
                >
                  <div className="bg-amber-50 rounded-lg p-4 mb-3">
                    <div className="text-xs font-semibold text-amber-700 mb-1">
                      Motivo de rechazo
                    </div>
                    <div className="text-sm text-ink">{r.motivoDetalle}</div>
                  </div>
                  <div className="flex gap-2">
                    {r.reprocesable && r.estado === "pendiente" && (
                      <Button
                        size="sm"
                        onClick={() => showDemo(`Reprocesar factura ${r.facturaNumero}`)}
                      >
                        Reprocesar
                      </Button>
                    )}
                    {r.estado === "pendiente" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => showDemo(`Descartar factura ${r.facturaNumero}`)}
                      >
                        Descartar
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => showDemo(`Ver factura original ${r.facturaNumero}`)}
                    >
                      Ver factura original
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <div className="text-sm text-ink-muted">
                No se encontraron rechazos con los filtros seleccionados.
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

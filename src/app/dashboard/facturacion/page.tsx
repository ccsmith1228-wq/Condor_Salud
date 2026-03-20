"use client";

import { useState, useMemo } from "react";
import type { FacturaEstado } from "@/lib/types";
import { useToast } from "@/components/Toast";
import { useDemoAction } from "@/components/DemoModal";
import { useCrudAction } from "@/hooks/use-crud-action";
import { useExport } from "@/lib/services/export";
import { Card, CardContent, StatusBadge, PageHeader, Select, Button, Input } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { useFacturas } from "@/hooks/use-data";
import { useIsDemo } from "@/lib/auth/context";
import { Download, Loader2, X } from "lucide-react";

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
  const isDemo = useIsDemo();
  const { execute, isExecuting } = useCrudAction(isDemo);
  const { isExporting, exportPDF, exportExcel } = useExport();
  const { data: facturas = [], isLoading } = useFacturas();
  const [filtroFinanciador, setFiltroFinanciador] = useState("Todos");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [showNuevaFactura, setShowNuevaFactura] = useState(false);
  const [detalleFactura, setDetalleFactura] = useState<(typeof facturas)[number] | null>(null);

  // ─── Nueva factura form state ────────────────────────────
  const [nfNumero, setNfNumero] = useState("");
  const [nfPaciente, setNfPaciente] = useState("");
  const [nfFinanciador, setNfFinanciador] = useState("PAMI");
  const [nfPrestacion, setNfPrestacion] = useState("");
  const [nfMonto, setNfMonto] = useState("");
  const [nfCodigo, setNfCodigo] = useState("");

  const handleNuevaFactura = () => {
    if (isDemo) {
      showDemo("Nueva factura");
      return;
    }
    setShowNuevaFactura(true);
  };

  const handleCrearFactura = async () => {
    if (!nfNumero || !nfPaciente || !nfMonto) {
      showToast("❌ Completá los campos obligatorios");
      return;
    }
    const result = await execute({
      action: async () => {
        const { createFactura } = await import("@/lib/services/facturacion");
        return createFactura({
          numero: nfNumero,
          fecha: new Date().toISOString().split("T")[0]!,
          financiador: nfFinanciador,
          paciente: nfPaciente,
          prestacion: nfPrestacion,
          codigoNomenclador: nfCodigo || undefined,
          monto: Number(nfMonto),
          estado: "presentada",
        });
      },
      successMessage: `Factura ${nfNumero} creada`,
      errorMessage: "Error al crear factura",
      demoLabel: "Nueva factura",
      mutateKeys: ["facturas", "kpi-facturacion"],
    });
    if (result) {
      setShowNuevaFactura(false);
      setNfNumero("");
      setNfPaciente("");
      setNfPrestacion("");
      setNfMonto("");
      setNfCodigo("");
    }
  };

  const handleVerDetalle = (f: (typeof facturas)[number]) => {
    if (isDemo) {
      showDemo(`Detalle de factura ${f.numero}`);
      return;
    }
    setDetalleFactura(f);
  };

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
            <Button onClick={handleNuevaFactura}>Nueva factura</Button>
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
                <th scope="col" className="text-left px-5 py-3">
                  Número
                </th>
                <th scope="col" className="text-left px-5 py-3">
                  Fecha
                </th>
                <th scope="col" className="text-left px-5 py-3">
                  Financiador
                </th>
                <th scope="col" className="text-left px-5 py-3">
                  Paciente
                </th>
                <th scope="col" className="text-left px-5 py-3">
                  Prestación
                </th>
                <th scope="col" className="text-right px-5 py-3">
                  Monto
                </th>
                <th scope="col" className="text-center px-5 py-3">
                  Estado
                </th>
                <th scope="col" className="text-center px-5 py-3">
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
                      onClick={() => handleVerDetalle(f)}
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

      {/* ─── Nueva Factura Modal ──────────────────────────── */}
      {showNuevaFactura && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Nueva factura"
        >
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-lg font-bold text-ink">Nueva factura</h2>
              <button
                onClick={() => setShowNuevaFactura(false)}
                className="text-ink-muted hover:text-ink"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-4 space-y-3">
              <Input
                label="Número *"
                placeholder="FAC-0001"
                value={nfNumero}
                onChange={(e) => setNfNumero(e.target.value)}
              />
              <Input
                label="Paciente *"
                placeholder="Nombre del paciente"
                value={nfPaciente}
                onChange={(e) => setNfPaciente(e.target.value)}
              />
              <Select
                label="Financiador"
                options={financiadoresFilter}
                value={nfFinanciador}
                onChange={(e) => setNfFinanciador(e.target.value)}
              />
              <Input
                label="Prestación"
                placeholder="Consulta, laboratorio..."
                value={nfPrestacion}
                onChange={(e) => setNfPrestacion(e.target.value)}
              />
              <Input
                label="Código nomenclador"
                placeholder="420101"
                value={nfCodigo}
                onChange={(e) => setNfCodigo(e.target.value)}
              />
              <Input
                label="Monto *"
                placeholder="18500"
                type="number"
                value={nfMonto}
                onChange={(e) => setNfMonto(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-border">
              <Button variant="outline" onClick={() => setShowNuevaFactura(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCrearFactura} disabled={isExecuting}>
                {isExecuting ? "Creando..." : "Crear factura"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Detalle Factura Panel ────────────────────────── */}
      {detalleFactura && (
        <div className="fixed inset-y-0 right-0 w-96 bg-white border-l border-border shadow-xl z-50 overflow-y-auto">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h3 className="font-bold text-ink">Factura {detalleFactura.numero}</h3>
            <button
              onClick={() => setDetalleFactura(null)}
              className="text-ink-muted hover:text-ink"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-5 space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-muted">Fecha</span>
                <span className="text-ink">{detalleFactura.fecha}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Financiador</span>
                <span className="text-ink font-medium">{detalleFactura.financiador}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Paciente</span>
                <span className="text-ink">{detalleFactura.paciente}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Prestación</span>
                <span className="text-ink">{detalleFactura.prestacion}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Monto</span>
                <span className="text-ink font-bold text-lg">
                  {formatCurrency(detalleFactura.monto)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-ink-muted">Estado</span>
                <StatusBadge
                  variant={detalleFactura.estado}
                  label={estadoConfig[detalleFactura.estado]}
                />
              </div>
            </div>
            {detalleFactura.estado === "rechazada" && (
              <div className="bg-red-50 rounded-lg p-3 text-xs text-red-700">
                Esta factura fue rechazada. Podés gestionarla desde la sección de Rechazos.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

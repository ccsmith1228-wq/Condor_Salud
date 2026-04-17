"use client";

import { use, useState, useCallback, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { useDemoAction } from "@/components/DemoModal";
import { useIsDemo } from "@/lib/auth/context";
import { useAuth } from "@/lib/auth/context";
import { useToast } from "@/components/Toast";
import { useLocale } from "@/lib/i18n/context";
import { usePacientes, useTurnos, useFacturas } from "@/hooks/use-data";
import { EmptyState, TableSkeleton } from "@/components/ui";
import {
  Users,
  Calendar,
  FileText,
  Stethoscope,
  Receipt,
  Loader2,
  CheckSquare,
  Square,
  Printer,
  Plus,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import type { Paciente } from "@/lib/services/data";
import { formatCurrency } from "@/lib/utils";

/* ── Service / Receipt types ───────────────────────────── */
interface ClinicService {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  ef_price: number | null;
  currency: string;
  duration_min: number | null;
  active: boolean;
}

interface ReceiptRecord {
  id: string;
  receipt_number: string;
  patient_id: string;
  patient_display?: string;
  status: string;
  subtotal: number;
  discount: number;
  total: number;
  currency: string;
  payment_method: string | null;
  notes: string | null;
  created_at: string;
  receipt_items: {
    id: string;
    service_name: string;
    category: string | null;
    unit_price: number;
    quantity: number;
    subtotal: number;
  }[];
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

const PAYMENT_METHODS = [
  { value: "efectivo", label: "Efectivo" },
  { value: "tarjeta", label: "Tarjeta" },
  { value: "transferencia", label: "Transferencia" },
  { value: "obra_social", label: "Obra Social" },
  { value: "otro", label: "Otro" },
];

// ─── NOTE: No hardcoded patient data. ────────────────────────
// Real patient details come from usePacientes() via Supabase.
// Mock/demo data lives only in src/lib/services/data.ts
// (returned when isSupabaseConfigured() === false).

export default function PacienteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { showDemo } = useDemoAction();
  const { showToast } = useToast();
  const { t } = useLocale();
  const isDemo = useIsDemo();

  // ── Data hooks ─────────────────────────────────────────────
  const {
    data: allPacientes,
    isLoading: loadingPacientes,
    mutate: mutatePacientes,
  } = usePacientes();
  const { data: allTurnos, isLoading: loadingTurnos } = useTurnos();
  const { data: allFacturas, isLoading: loadingFacturas } = useFacturas();

  const paciente = allPacientes?.find((p) => p.id === id);
  const turnosPaciente =
    allTurnos?.filter(
      (t) =>
        t.pacienteId === id ||
        (!t.pacienteId && t.paciente?.toLowerCase() === paciente?.nombre?.toLowerCase()),
    ) ?? [];
  const facturasPaciente =
    allFacturas?.filter(
      (f) =>
        (f as any).pacienteId === id ||
        f.paciente?.toLowerCase() === paciente?.nombre?.toLowerCase(),
    ) ?? [];

  const isLoading = loadingPacientes || loadingTurnos || loadingFacturas;

  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "services" | "billing">("overview");

  /* ── Services & Receipts ──────────────────────────────── */
  const [services, setServices] = useState<ClinicService[]>([]);
  const [receipts, setReceipts] = useState<ReceiptRecord[]>([]);
  const [loadingServicesData, setLoadingServicesData] = useState(true);
  const [loadingReceipts, setLoadingReceipts] = useState(true);
  const [checkedServices, setCheckedServices] = useState<
    Record<string, { checked: boolean; quantity: number }>
  >({});
  const [paymentMethod, setPaymentMethod] = useState("efectivo");
  const [billNotes, setBillNotes] = useState("");
  const [savingBill, setSavingBill] = useState(false);
  const [expandedReceipt, setExpandedReceipt] = useState<string | null>(null);

  // Fetch services
  useEffect(() => {
    fetch("/api/services")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.services) setServices(data.services.filter((s: ClinicService) => s.active));
      })
      .catch(() => {})
      .finally(() => setLoadingServicesData(false));
  }, []);

  // Fetch receipts for this patient
  const fetchReceipts = useCallback(async () => {
    try {
      const res = await fetch(`/api/receipts?patient_id=${id}&limit=200`);
      if (res.ok) {
        const data = await res.json();
        setReceipts(data.receipts || []);
      }
    } catch {
      /* silent */
    } finally {
      setLoadingReceipts(false);
    }
  }, [id]);

  useEffect(() => {
    fetchReceipts();
  }, [fetchReceipts]);

  const servicesByCategory = useMemo(() => {
    const map: Record<string, ClinicService[]> = {};
    for (const svc of services) (map[svc.category] ??= []).push(svc);
    return map;
  }, [services]);

  const billTotal = useMemo(() => {
    let total = 0;
    for (const svc of services) {
      const e = checkedServices[svc.id];
      if (e?.checked) total += svc.price * (e.quantity || 1);
    }
    return total;
  }, [services, checkedServices]);

  const checkedCount = useMemo(
    () => Object.values(checkedServices).filter((e) => e.checked).length,
    [checkedServices],
  );

  const toggleService = (sid: string) =>
    setCheckedServices((prev) => ({
      ...prev,
      [sid]: { checked: !prev[sid]?.checked, quantity: prev[sid]?.quantity || 1 },
    }));

  const setServiceQty = (sid: string, qty: number) =>
    setCheckedServices((prev) => ({
      ...prev,
      [sid]: { checked: prev[sid]?.checked ?? true, quantity: Math.max(1, qty) },
    }));

  const createBill = async () => {
    if (!paciente) return;
    const items = services
      .filter((s) => checkedServices[s.id]?.checked)
      .map((s) => ({
        service_id: s.id,
        service_name: s.name,
        category: s.category,
        unit_price: s.price,
        quantity: checkedServices[s.id]?.quantity || 1,
      }));
    if (items.length === 0) {
      showToast("Seleccione al menos un servicio", "error");
      return;
    }
    setSavingBill(true);
    try {
      const res = await fetch("/api/receipts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: id,
          items,
          payment_method: paymentMethod,
          notes: billNotes || null,
          discount: 0,
          status: "completed",
        }),
      });
      if (res.ok) {
        showToast("Comprobante creado exitosamente", "success");
        setCheckedServices({});
        setBillNotes("");
        fetchReceipts();
        setActiveTab("billing");
      } else {
        const data = await res.json();
        showToast(data.error || "Error al crear comprobante", "error");
      }
    } catch {
      showToast("Error de conexion", "error");
    } finally {
      setSavingBill(false);
    }
  };

  const printReceipt = (r: ReceiptRecord) => {
    const w = window.open("", "_blank", "width=400,height=600");
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>${r.receipt_number}</title>
      <style>body{font-family:sans-serif;padding:24px;max-width:350px;margin:0 auto}
      h2{text-align:center;margin-bottom:4px}table{width:100%;border-collapse:collapse;margin:12px 0}
      th,td{text-align:left;padding:4px 6px;border-bottom:1px solid #eee;font-size:12px}
      th{font-size:10px;text-transform:uppercase;color:#999}
      .total{font-size:16px;font-weight:bold;text-align:right;margin-top:8px}
      .footer{text-align:center;font-size:10px;color:#999;margin-top:16px}</style></head><body>
      <h2>Condor Salud</h2><p style="text-align:center;font-size:11px;color:#666">Comprobante ${r.receipt_number}</p>
      <p style="font-size:11px"><strong>Paciente:</strong> ${paciente?.nombre ?? ""}<br>
      <strong>DNI:</strong> ${paciente?.dni ?? ""}<br>
      <strong>Fecha:</strong> ${new Date(r.created_at).toLocaleDateString("es-AR")}<br>
      <strong>Pago:</strong> ${r.payment_method?.replace("_", " ") ?? ""}</p>
      <table><thead><tr><th>Servicio</th><th style="text-align:right">Precio</th><th style="text-align:center">Cant</th><th style="text-align:right">Subtotal</th></tr></thead><tbody>
      ${(r.receipt_items || []).map((it) => `<tr><td>${it.service_name}</td><td style="text-align:right">${formatPrice(it.unit_price)}</td><td style="text-align:center">${it.quantity}</td><td style="text-align:right">${formatPrice(it.subtotal)}</td></tr>`).join("")}
      </tbody></table>
      ${r.discount > 0 ? `<p style="text-align:right;font-size:12px">Descuento: -${formatPrice(r.discount)}</p>` : ""}
      <p class="total">Total: ${formatPrice(r.total)}</p>
      <script>window.print()</script></body></html>`);
    w.document.close();
  };

  const handleEditarPaciente = () => {
    if (isDemo) {
      showDemo("Editar paciente");
      return;
    }
    setShowEditModal(true);
  };

  // ── Loading state ──────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-sm text-ink-muted">
          <Link href="/dashboard/pacientes" className="hover:text-celeste-dark transition">
            Pacientes
          </Link>
          <span>/</span>
          <span className="text-ink font-medium">Cargando...</span>
        </div>
        <TableSkeleton rows={4} />
      </div>
    );
  }

  // ── Patient not found ──────────────────────────────────────
  if (!paciente) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-sm text-ink-muted">
          <Link href="/dashboard/pacientes" className="hover:text-celeste-dark transition">
            Pacientes
          </Link>
          <span>/</span>
          <span className="text-ink font-medium">No encontrado</span>
        </div>
        <EmptyState
          icon={<Users className="w-10 h-10 text-ink-muted" />}
          title="Paciente no encontrado"
          description={`No se encontro un paciente con ID "${id}". Puede que haya sido eliminado o que el enlace sea incorrecto.`}
          actionLabel="Volver a Pacientes"
          actionHref="/dashboard/pacientes"
        />
      </div>
    );
  }

  // ── Derived display values ─────────────────────────────────
  const nombre = paciente.nombre?.split(" ")[0] ?? "";
  const apellido = paciente.nombre?.split(" ").slice(1).join(" ") ?? "";
  const initials = `${nombre[0] ?? ""}${apellido[0] ?? ""}`.toUpperCase();

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-ink-muted">
        <Link href="/dashboard/pacientes" className="hover:text-celeste-dark transition">
          Pacientes
        </Link>
        <span>/</span>
        <span className="text-ink font-medium">
          {apellido ? `${apellido}, ${nombre}` : paciente.nombre}
        </span>
      </div>

      {/* Header */}
      <div className="bg-white border border-border rounded-lg p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-celeste-pale flex items-center justify-center text-celeste-dark font-bold text-xl">
              {initials || "?"}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-ink">
                {apellido ? `${apellido}, ${nombre}` : paciente.nombre}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-ink-light">
                {paciente.dni && <span>DNI {paciente.dni}</span>}
                {paciente.financiador && (
                  <>
                    <span className="w-1 h-1 bg-ink-muted rounded-full" />
                    <span className="font-semibold text-celeste-dark">{paciente.financiador}</span>
                  </>
                )}
                {paciente.plan && (
                  <>
                    <span className="w-1 h-1 bg-ink-muted rounded-full" />
                    <span>{paciente.plan}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href="/dashboard/agenda"
              className="px-4 py-2 text-sm font-medium border border-border rounded-[4px] text-ink-light hover:border-celeste-dark hover:text-celeste-dark transition"
            >
              Agendar turno
            </Link>
            <button
              onClick={handleEditarPaciente}
              className="px-4 py-2 text-sm font-semibold bg-celeste-dark text-white rounded-[4px] hover:bg-celeste transition"
            >
              Editar paciente
            </button>
          </div>
        </div>
      </div>

      {/* Info grid */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Datos personales */}
        <div className="bg-white border border-border rounded-lg p-5">
          <h3 className="text-xs font-bold tracking-wider text-ink-muted uppercase mb-4">
            Datos Personales
          </h3>
          <div className="space-y-3 text-sm">
            {paciente.dni && (
              <div>
                <span className="text-ink-muted">DNI:</span>{" "}
                <span className="text-ink font-mono">{paciente.dni}</span>
              </div>
            )}
            {paciente.telefono && (
              <div>
                <span className="text-ink-muted">Telefono:</span>{" "}
                <span className="text-ink">{paciente.telefono}</span>
              </div>
            )}
            {paciente.email && (
              <div>
                <span className="text-ink-muted">Email:</span>{" "}
                <span className="text-ink">{paciente.email}</span>
              </div>
            )}
            {!paciente.dni && !paciente.telefono && !paciente.email && (
              <p className="text-xs text-ink-muted">
                Completa los datos del paciente para ver su informacion personal.
              </p>
            )}
          </div>
        </div>

        {/* Cobertura */}
        <div className="bg-white border border-border rounded-lg p-5">
          <h3 className="text-xs font-bold tracking-wider text-ink-muted uppercase mb-4">
            Cobertura
          </h3>
          <div className="space-y-3 text-sm">
            {paciente.financiador ? (
              <>
                <div>
                  <span className="text-ink-muted">Financiador:</span>{" "}
                  <span className="text-ink font-semibold">{paciente.financiador}</span>
                </div>
                {paciente.plan && (
                  <div>
                    <span className="text-ink-muted">Plan:</span>{" "}
                    <span className="text-ink">{paciente.plan}</span>
                  </div>
                )}
                <div>
                  <span className="text-ink-muted">Estado:</span>{" "}
                  <span
                    className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded ${
                      paciente.estado === "activo"
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    {paciente.estado === "activo" ? "Activo" : "Inactivo"}
                  </span>
                </div>
              </>
            ) : (
              <p className="text-xs text-ink-muted">
                La cobertura se completa al registrar el financiador del paciente.
              </p>
            )}
          </div>
        </div>

        {/* Estado */}
        <div className="bg-white border border-border rounded-lg p-5">
          <h3 className="text-xs font-bold tracking-wider text-ink-muted uppercase mb-4">
            Actividad
          </h3>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-ink-muted">Ultima visita:</span>{" "}
              <span className="text-ink">{paciente.ultimaVisita || "Sin registros"}</span>
            </div>
            <div>
              <span className="text-ink-muted">Turnos proximos:</span>{" "}
              <span className="text-ink font-semibold">{turnosPaciente.length}</span>
            </div>
            <div>
              <span className="text-ink-muted">Facturas:</span>{" "}
              <span className="text-ink font-semibold">{facturasPaciente.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {(
          [
            { key: "overview", label: "Resumen", icon: Users },
            { key: "services", label: "Servicios Prestados", icon: Stethoscope },
            { key: "billing", label: "Historial de Cobros", icon: Receipt },
          ] as const
        ).map((tb) => (
          <button
            key={tb.key}
            onClick={() => setActiveTab(tb.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition ${
              activeTab === tb.key
                ? "border-celeste-dark text-celeste-dark"
                : "border-transparent text-ink-muted hover:text-ink hover:border-border"
            }`}
          >
            <tb.icon className="w-4 h-4" />
            {tb.label}
            {tb.key === "billing" && receipts.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-[9px] font-bold bg-celeste-pale text-celeste-dark rounded">
                {receipts.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Overview Tab ─────────────────────────────── */}
      {activeTab === "overview" && (
        <>
          {/* Turnos proximos */}
          <div className="bg-white border border-border rounded-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h3 className="text-xs font-bold tracking-wider text-ink-muted uppercase">
                Turnos Proximos
              </h3>
              <Link
                href="/dashboard/agenda"
                className="text-xs text-celeste-dark font-medium hover:underline"
              >
                Ver agenda
              </Link>
            </div>
            {turnosPaciente.length === 0 ? (
              <EmptyState
                compact
                icon={<Calendar className="w-8 h-8 text-ink-muted" />}
                title="Sin turnos proximos"
                description="Los turnos del paciente aparecen aca al agendarlos desde la agenda."
              />
            ) : (
              <table className="w-full text-sm" aria-label="Turnos del paciente">
                <tbody>
                  {turnosPaciente.map((t, i) => (
                    <tr
                      key={i}
                      className="border-t border-border-light first:border-t-0 hover:bg-celeste-pale/30 transition"
                    >
                      <td className="px-5 py-3 font-semibold text-ink">{t.hora}</td>
                      <td className="px-5 py-3 text-ink-light">{t.profesional || "\u2014"}</td>
                      <td className="px-5 py-3 text-ink-light">{t.tipo}</td>
                      <td className="px-5 py-3 text-right">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                            t.estado === "confirmado"
                              ? "bg-green-50 text-green-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {t.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Facturacion */}
          <div className="bg-white border border-border rounded-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h3 className="text-xs font-bold tracking-wider text-ink-muted uppercase">
                Facturacion
              </h3>
              <Link
                href="/dashboard/facturacion"
                className="text-xs text-celeste-dark font-medium hover:underline"
              >
                Ver todo
              </Link>
            </div>
            {facturasPaciente.length === 0 ? (
              <EmptyState
                compact
                icon={<FileText className="w-8 h-8 text-ink-muted" />}
                title="Sin facturas registradas"
                description="Las facturas aparecen aca a medida que se registran atenciones y se facturan practicas."
              />
            ) : (
              <table className="w-full text-sm" aria-label="Facturación del paciente">
                <thead>
                  <tr className="bg-surface text-[10px] font-bold tracking-wider text-ink-muted uppercase">
                    <th scope="col" className="text-left px-5 py-2.5">
                      Financiador
                    </th>
                    <th scope="col" className="text-left px-5 py-2.5">
                      Paciente
                    </th>
                    <th scope="col" className="text-right px-5 py-2.5">
                      Monto
                    </th>
                    <th scope="col" className="text-center px-5 py-2.5">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {facturasPaciente.map((f, i) => (
                    <tr key={i} className="border-t border-border-light">
                      <td className="px-5 py-3 text-xs font-semibold text-ink">{f.financiador}</td>
                      <td className="px-5 py-3 text-xs text-ink-light">{f.paciente}</td>
                      <td className="px-5 py-3 text-right text-ink">{formatCurrency(f.monto)}</td>
                      <td className="px-5 py-3 text-center">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                            f.estado === "cobrada"
                              ? "bg-green-50 text-green-700"
                              : f.estado === "rechazada"
                                ? "bg-red-50 text-red-600"
                                : "bg-celeste-pale text-celeste-dark"
                          }`}
                        >
                          {f.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* ── Services Tab — checklist to create bills ─── */}
      {activeTab === "services" && (
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-ink uppercase tracking-wider">
                Marque los servicios prestados
              </h3>
              <span className="text-xs text-ink-muted">
                {checkedCount} seleccionado{checkedCount !== 1 ? "s" : ""}
              </span>
            </div>
            {loadingServicesData ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-celeste-dark" />
              </div>
            ) : services.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-border">
                <Stethoscope className="w-10 h-10 text-ink-muted/30 mx-auto mb-2" />
                <p className="text-sm text-ink-muted">
                  No hay servicios configurados. Configure los servicios en Precios.
                </p>
              </div>
            ) : (
              Object.entries(servicesByCategory).map(([cat, svcs]) => (
                <div key={cat} className="bg-white border border-border rounded-lg overflow-hidden">
                  <div className="px-4 py-2.5 bg-surface border-b border-border">
                    <h4 className="text-xs font-bold text-ink uppercase tracking-wider">{cat}</h4>
                  </div>
                  <div className="divide-y divide-border/50">
                    {svcs.map((svc) => {
                      const entry = checkedServices[svc.id];
                      const isChecked = entry?.checked ?? false;
                      return (
                        <div
                          key={svc.id}
                          className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-celeste-pale/20 transition ${isChecked ? "bg-green-50/40" : ""}`}
                          onClick={() => toggleService(svc.id)}
                        >
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-green-600 flex-shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-ink-muted/40 flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-ink truncate">{svc.name}</p>
                            {svc.description && (
                              <p className="text-[10px] text-ink-muted truncate">
                                {svc.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {isChecked && (
                              <div
                                className="flex items-center gap-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  className="w-6 h-6 rounded border border-border text-ink-muted hover:bg-surface flex items-center justify-center text-xs"
                                  onClick={() => setServiceQty(svc.id, (entry?.quantity || 1) - 1)}
                                >
                                  -
                                </button>
                                <span className="text-xs font-mono w-6 text-center">
                                  {entry?.quantity || 1}
                                </span>
                                <button
                                  className="w-6 h-6 rounded border border-border text-ink-muted hover:bg-surface flex items-center justify-center text-xs"
                                  onClick={() => setServiceQty(svc.id, (entry?.quantity || 1) + 1)}
                                >
                                  +
                                </button>
                              </div>
                            )}
                            <span className="text-sm font-semibold text-ink tabular-nums w-24 text-right">
                              {formatPrice(svc.price)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Bill summary sidebar */}
          <div className="space-y-4">
            <div className="bg-white border border-border rounded-lg p-5 space-y-4 sticky top-4">
              <h3 className="text-sm font-bold text-ink uppercase tracking-wider flex items-center gap-2">
                <Receipt className="w-4 h-4 text-celeste-dark" />
                Resumen del Cobro
              </h3>
              {checkedCount === 0 ? (
                <p className="text-xs text-ink-muted py-4 text-center">
                  Seleccione servicios de la lista para generar un comprobante
                </p>
              ) : (
                <>
                  <div className="space-y-2">
                    {services
                      .filter((s) => checkedServices[s.id]?.checked)
                      .map((s) => {
                        const qty = checkedServices[s.id]?.quantity || 1;
                        return (
                          <div key={s.id} className="flex justify-between text-xs">
                            <span className="text-ink truncate flex-1">
                              {s.name}
                              {qty > 1 && <span className="text-ink-muted ml-1">x{qty}</span>}
                            </span>
                            <span className="font-semibold text-ink tabular-nums ml-2">
                              {formatPrice(s.price * qty)}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                  <div className="border-t border-border pt-3">
                    <div className="flex justify-between text-sm font-bold text-ink">
                      <span>Total</span>
                      <span>{formatPrice(billTotal)}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-1">
                      Metodo de Pago
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-[4px] text-sm focus:outline-none focus:ring-2 focus:ring-celeste-200"
                    >
                      {PAYMENT_METHODS.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-1">
                      Notas (opcional)
                    </label>
                    <textarea
                      rows={2}
                      value={billNotes}
                      onChange={(e) => setBillNotes(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-[4px] text-sm focus:outline-none focus:ring-2 focus:ring-celeste-200 resize-none"
                      placeholder="Observaciones..."
                    />
                  </div>
                  <button
                    onClick={createBill}
                    disabled={savingBill}
                    className="w-full py-2.5 text-sm font-semibold bg-celeste-dark text-white rounded-[4px] hover:bg-celeste transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {savingBill ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Receipt className="w-4 h-4" />
                    )}
                    Generar Comprobante
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Billing History Tab ──────────────────────── */}
      {activeTab === "billing" && (
        <div>
          {loadingReceipts ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-celeste-dark" />
            </div>
          ) : receipts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-border">
              <Receipt className="w-10 h-10 text-ink-muted/30 mx-auto mb-2" />
              <p className="text-sm text-ink-muted">Sin comprobantes para este paciente</p>
              <button
                onClick={() => setActiveTab("services")}
                className="mt-3 inline-flex items-center gap-1.5 text-sm text-celeste-dark hover:underline"
              >
                <Plus className="w-4 h-4" /> Crear primer comprobante
              </button>
            </div>
          ) : (
            <div className="bg-white border border-border rounded-lg overflow-hidden">
              <table className="w-full text-sm" aria-label="Historial de comprobantes">
                <thead>
                  <tr className="bg-surface text-[10px] font-bold tracking-wider text-ink-muted uppercase">
                    <th className="w-8 px-3 py-2.5" />
                    <th className="text-left px-5 py-2.5">Comprobante</th>
                    <th className="text-left px-5 py-2.5">Fecha</th>
                    <th className="text-left px-5 py-2.5 hidden sm:table-cell">Pago</th>
                    <th className="text-right px-5 py-2.5">Total</th>
                    <th className="text-center px-5 py-2.5">Estado</th>
                    <th className="text-right px-5 py-2.5 w-12" />
                  </tr>
                </thead>
                <tbody>
                  {receipts.map((r) => {
                    const isExp = expandedReceipt === r.id;
                    return (
                      <>
                        <tr
                          key={r.id}
                          className={`border-t border-border-light hover:bg-surface/30 cursor-pointer transition ${isExp ? "bg-surface/20" : ""}`}
                          onClick={() => setExpandedReceipt(isExp ? null : r.id)}
                        >
                          <td className="pl-3 py-2.5">
                            {isExp ? (
                              <ChevronDown className="w-3.5 h-3.5 text-ink-muted" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5 text-ink-muted" />
                            )}
                          </td>
                          <td className="px-5 py-2.5 font-mono text-xs font-semibold text-ink">
                            {r.receipt_number || r.id.slice(0, 8)}
                          </td>
                          <td className="px-5 py-2.5 text-xs text-ink-muted">
                            {new Date(r.created_at).toLocaleDateString("es-AR")}
                          </td>
                          <td className="px-5 py-2.5 text-xs text-ink-muted capitalize hidden sm:table-cell">
                            {r.payment_method?.replace("_", " ") || "\u2014"}
                          </td>
                          <td className="px-5 py-2.5 text-right font-bold text-ink tabular-nums">
                            {formatPrice(r.total)}
                          </td>
                          <td className="px-5 py-2.5 text-center">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                r.status === "completed"
                                  ? "bg-green-50 text-green-700"
                                  : r.status === "voided"
                                    ? "bg-red-50 text-red-600"
                                    : "bg-amber-50 text-amber-700"
                              }`}
                            >
                              {r.status === "completed"
                                ? "Completado"
                                : r.status === "voided"
                                  ? "Anulado"
                                  : "Borrador"}
                            </span>
                          </td>
                          <td
                            className="px-3 py-2.5 text-right"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => printReceipt(r)}
                              className="p-1 hover:bg-surface rounded transition text-ink-muted hover:text-ink"
                              title="Imprimir"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                        {isExp && (
                          <tr key={`${r.id}-items`}>
                            <td colSpan={7} className="px-5 pb-3 bg-surface/20">
                              <table className="w-full text-xs mt-2">
                                <thead>
                                  <tr className="text-[9px] font-bold text-ink-muted uppercase tracking-wider">
                                    <th className="text-left py-1 px-2">Servicio</th>
                                    <th className="text-left py-1 px-2">Categoria</th>
                                    <th className="text-right py-1 px-2">Precio</th>
                                    <th className="text-center py-1 px-2">Cant.</th>
                                    <th className="text-right py-1 px-2">Subtotal</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {(r.receipt_items || []).map((it) => (
                                    <tr key={it.id} className="border-t border-border/20">
                                      <td className="py-1 px-2 font-medium text-ink">
                                        {it.service_name}
                                      </td>
                                      <td className="py-1 px-2 text-ink-muted capitalize">
                                        {it.category || "\u2014"}
                                      </td>
                                      <td className="py-1 px-2 text-right tabular-nums text-ink-muted">
                                        {formatPrice(it.unit_price)}
                                      </td>
                                      <td className="py-1 px-2 text-center text-ink-muted">
                                        {it.quantity}
                                      </td>
                                      <td className="py-1 px-2 text-right font-semibold text-ink tabular-nums">
                                        {formatPrice(it.subtotal)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                              {r.discount > 0 && (
                                <p className="text-[10px] text-ink-muted mt-2 px-2 text-right">
                                  Descuento: -{formatPrice(r.discount)}
                                </p>
                              )}
                              {r.notes && (
                                <p className="text-[10px] text-ink-muted mt-1 px-2">
                                  Notas: {r.notes}
                                </p>
                              )}
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Edit Patient Modal */}
      {showEditModal && paciente && (
        <EditPatientModal
          paciente={paciente}
          onClose={() => setShowEditModal(false)}
          onUpdated={() => {
            mutatePacientes();
            setShowEditModal(false);
            showToast(t("patients.patientUpdated"), "success");
          }}
        />
      )}
    </div>
  );
}

// ─── Insurance Options ──────────────────────────────────────
const INSURANCE_OPTIONS = [
  "PAMI",
  "OSDE",
  "Swiss Medical",
  "Galeno",
  "IOMA",
  "Medifé",
  "Sancor Salud",
  "Unión Personal",
  "Accord Salud",
  "OSECAC",
];

// ─── Edit Patient Modal ─────────────────────────────────────
function EditPatientModal({
  paciente,
  onClose,
  onUpdated,
}: {
  paciente: Paciente;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const { t } = useLocale();
  const { showToast } = useToast();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [saving, setSaving] = useState(false);

  // Form state — pre-filled with current patient data
  const [nombre, setNombre] = useState(paciente.nombre ?? "");
  const [dni, setDni] = useState(paciente.dni ?? "");
  const [email, setEmail] = useState(paciente.email ?? "");
  const [telefono, setTelefono] = useState(paciente.telefono ?? "");
  const [fechaNacimiento, setFechaNacimiento] = useState(paciente.fechaNacimiento ?? "");
  const [direccion, setDireccion] = useState(paciente.direccion ?? "");
  const [financiador, setFinanciador] = useState(paciente.financiador ?? "");
  const [plan, setPlan] = useState(paciente.plan ?? "");
  const [notas, setNotas] = useState("");
  const [estado, setEstado] = useState<"activo" | "inactivo">(paciente.estado ?? "activo");

  // Open the dialog on mount
  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) {
      dialog.showModal();
    }
  }, []);

  const handleDialogClick = useCallback(
    (e: React.MouseEvent<HTMLDialogElement>) => {
      if (e.target === dialogRef.current) {
        onClose();
      }
    },
    [onClose],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !dni.trim()) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/dashboard/patients/${paciente.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nombre.trim(),
          dni: dni.trim(),
          email: email.trim() || undefined,
          telefono: telefono.trim() || undefined,
          fechaNacimiento: fechaNacimiento || undefined,
          direccion: direccion.trim() || undefined,
          financiador: financiador || undefined,
          plan: plan.trim() || undefined,
          notas: notas.trim() || undefined,
          estado,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Error desconocido" }));
        showToast(data.error || t("patients.patientUpdateError"), "error");
        return;
      }

      onUpdated();
    } catch {
      showToast(t("patients.patientUpdateError"), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      onClick={handleDialogClick}
      onClose={onClose}
      className="fixed inset-0 z-50 m-auto w-full max-w-lg rounded-xl border border-border bg-white p-0 shadow-2xl backdrop:bg-black/40"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-ink">{t("patients.editPatientTitle")}</h2>
            <p className="text-xs text-ink-muted mt-0.5">{t("patients.editPatientDesc")}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-ink-muted hover:text-ink text-xl leading-none p-1"
            aria-label={t("patients.cancel")}
          >
            ×
          </button>
        </div>

        {/* Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Nombre — required */}
          <div className="sm:col-span-2">
            <label htmlFor="ep-nombre" className="block text-xs font-medium text-ink-muted mb-1">
              {t("patients.fieldNombre")} *
            </label>
            <input
              id="ep-nombre"
              type="text"
              required
              autoFocus
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder={t("patients.fieldNombrePlaceholder")}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-celeste-dark/30"
            />
          </div>

          {/* DNI — required */}
          <div>
            <label htmlFor="ep-dni" className="block text-xs font-medium text-ink-muted mb-1">
              {t("patients.fieldDNI")} *
            </label>
            <input
              id="ep-dni"
              type="text"
              required
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              placeholder={t("patients.fieldDNIPlaceholder")}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-celeste-dark/30"
            />
          </div>

          {/* Teléfono */}
          <div>
            <label htmlFor="ep-telefono" className="block text-xs font-medium text-ink-muted mb-1">
              {t("patients.fieldTelefono")}
            </label>
            <input
              id="ep-telefono"
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder={t("patients.fieldTelefonoPlaceholder")}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-celeste-dark/30"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="ep-email" className="block text-xs font-medium text-ink-muted mb-1">
              {t("patients.fieldEmail")}
            </label>
            <input
              id="ep-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("patients.fieldEmailPlaceholder")}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-celeste-dark/30"
            />
          </div>

          {/* Fecha de nacimiento */}
          <div>
            <label htmlFor="ep-fecha" className="block text-xs font-medium text-ink-muted mb-1">
              {t("patients.fieldFechaNacimiento")}
            </label>
            <input
              id="ep-fecha"
              type="date"
              value={fechaNacimiento}
              onChange={(e) => setFechaNacimiento(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-celeste-dark/30"
            />
          </div>

          {/* Estado */}
          <div>
            <label htmlFor="ep-estado" className="block text-xs font-medium text-ink-muted mb-1">
              {t("patients.fieldEstado")}
            </label>
            <select
              id="ep-estado"
              value={estado}
              onChange={(e) => setEstado(e.target.value as "activo" | "inactivo")}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-celeste-dark/30"
            >
              <option value="activo">{t("patients.statusActive")}</option>
              <option value="inactivo">{t("patients.statusInactive")}</option>
            </select>
          </div>

          {/* Financiador */}
          <div>
            <label
              htmlFor="ep-financiador"
              className="block text-xs font-medium text-ink-muted mb-1"
            >
              {t("patients.fieldFinanciador")}
            </label>
            <select
              id="ep-financiador"
              value={financiador}
              onChange={(e) => setFinanciador(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-celeste-dark/30"
            >
              <option value="">{t("patients.selectInsurance")}</option>
              <option value="Particular">{t("patients.particular")}</option>
              {INSURANCE_OPTIONS.map((ins) => (
                <option key={ins} value={ins}>
                  {ins}
                </option>
              ))}
            </select>
          </div>

          {/* Plan */}
          <div>
            <label htmlFor="ep-plan" className="block text-xs font-medium text-ink-muted mb-1">
              {t("patients.fieldPlan")}
            </label>
            <input
              id="ep-plan"
              type="text"
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              placeholder={t("patients.fieldPlanPlaceholder")}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-celeste-dark/30"
            />
          </div>

          {/* Dirección */}
          <div className="sm:col-span-2">
            <label htmlFor="ep-direccion" className="block text-xs font-medium text-ink-muted mb-1">
              {t("patients.fieldDireccion")}
            </label>
            <input
              id="ep-direccion"
              type="text"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              placeholder={t("patients.fieldDireccionPlaceholder")}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-celeste-dark/30"
            />
          </div>

          {/* Notas */}
          <div className="sm:col-span-2">
            <label htmlFor="ep-notas" className="block text-xs font-medium text-ink-muted mb-1">
              {t("patients.fieldNotas")}
            </label>
            <textarea
              id="ep-notas"
              rows={2}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder={t("patients.fieldNotasPlaceholder")}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-celeste-dark/30"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-ink-muted hover:text-ink border border-border rounded-lg transition"
          >
            {t("patients.cancel")}
          </button>
          <button
            type="submit"
            disabled={saving || !nombre.trim() || !dni.trim()}
            className="px-5 py-2 text-sm font-semibold bg-celeste-dark text-white rounded-lg hover:bg-celeste transition disabled:opacity-50"
          >
            {saving ? t("patients.saving") : t("patients.updatePatient")}
          </button>
        </div>
      </form>
    </dialog>
  );
}

"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Plus,
  Trash2,
  Save,
  DollarSign,
  Loader2,
  Search,
  Receipt,
  Printer,
  ChevronDown,
  ChevronRight,
  FileText,
  User,
  X,
  Check,
  Minus,
  CreditCard,
  Banknote,
  Building2,
  ArrowRight,
} from "lucide-react";
import { useToast } from "@/components/Toast";
import { useLocale } from "@/lib/i18n/context";
import { useAuth } from "@/lib/auth/context";
import { usePacientes } from "@/hooks/use-data";

/* ── Types ──────────────────────────────────────────────── */
interface ClinicService {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  ef_price: number | null;
  currency: string;
  duration_min: number | null;
  notes: string | null;
  active: boolean;
}

interface LineItem {
  key: string;
  service_id: string | null;
  service_name: string;
  category: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
  notes: string;
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

interface PatientOption {
  id: string;
  nombre: string;
  apellido?: string;
  dni: string;
  financiador: string;
}

const PAYMENT_METHODS = [
  { value: "efectivo", label: "Efectivo", icon: Banknote },
  { value: "tarjeta", label: "Tarjeta", icon: CreditCard },
  { value: "transferencia", label: "Transferencia", icon: ArrowRight },
  { value: "obra_social", label: "Obra Social", icon: Building2 },
  { value: "otro", label: "Otro", icon: FileText },
];

function formatPrice(price: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

function generateKey() {
  return Math.random().toString(36).slice(2, 10);
}

/* ── Main Page ──────────────────────────────────────────── */
export default function CobrosPage() {
  const { showToast } = useToast();
  const { locale } = useLocale();
  const { user } = useAuth();

  // Data
  const [services, setServices] = useState<ClinicService[]>([]);
  const [receipts, setReceipts] = useState<ReceiptRecord[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingReceipts, setLoadingReceipts] = useState(true);
  const [saving, setSaving] = useState(false);

  // Current billing form
  const [mode, setMode] = useState<"list" | "create">("list");
  const [selectedPatient, setSelectedPatient] = useState<PatientOption | null>(null);
  const [patientSearch, setPatientSearch] = useState("");
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [serviceSearch, setServiceSearch] = useState("");
  const [discount, setDiscount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("efectivo");
  const [receiptNotes, setReceiptNotes] = useState("");
  const [expandedReceipt, setExpandedReceipt] = useState<string | null>(null);

  const patientInputRef = useRef<HTMLInputElement>(null);
  const patientDropdownRef = useRef<HTMLDivElement>(null);

  // Patient data
  const { data: rawPacientes = [] } = usePacientes();
  const patients: PatientOption[] = useMemo(
    () =>
      rawPacientes.map((p: any) => ({
        id: p.id,
        nombre: p.nombre ?? "",
        apellido: p.apellido ?? "",
        dni: p.dni ?? "",
        financiador: p.financiador ?? "Particular",
      })),
    [rawPacientes],
  );

  const filteredPatients = useMemo(() => {
    if (!patientSearch || patientSearch.length < 2) return [];
    const q = patientSearch.toLowerCase();
    return patients
      .filter(
        (p) =>
          `${p.nombre} ${p.apellido ?? ""}`.toLowerCase().includes(q) ||
          p.dni.toLowerCase().includes(q),
      )
      .slice(0, 8);
  }, [patients, patientSearch]);

  // Close patient dropdown on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        patientDropdownRef.current &&
        !patientDropdownRef.current.contains(e.target as Node) &&
        patientInputRef.current &&
        !patientInputRef.current.contains(e.target as Node)
      ) {
        setShowPatientDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Fetch services
  const fetchServices = useCallback(async () => {
    try {
      const res = await fetch("/api/services");
      if (res.ok) {
        const data = await res.json();
        setServices((data.services || []).filter((s: ClinicService) => s.active));
      }
    } catch {
      /* silent */
    } finally {
      setLoadingServices(false);
    }
  }, []);

  // Fetch receipts
  const fetchReceipts = useCallback(async () => {
    try {
      const res = await fetch("/api/receipts?limit=200");
      if (res.ok) {
        const data = await res.json();
        setReceipts(data.receipts || []);
      }
    } catch {
      /* silent */
    } finally {
      setLoadingReceipts(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
    fetchReceipts();
  }, [fetchServices, fetchReceipts]);

  // Filtered services for the service picker
  const filteredServices = useMemo(() => {
    if (!serviceSearch) return services;
    const q = serviceSearch.toLowerCase();
    return services.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        (s.notes && s.notes.toLowerCase().includes(q)),
    );
  }, [services, serviceSearch]);

  // Group services by category for the picker
  const groupedServices = useMemo(() => {
    const map = new Map<string, ClinicService[]>();
    for (const svc of filteredServices) {
      const list = map.get(svc.category) ?? [];
      list.push(svc);
      map.set(svc.category, list);
    }
    return Array.from(map.entries());
  }, [filteredServices]);

  // Totals
  const subtotal = lineItems.reduce((sum, li) => sum + li.subtotal, 0);
  const discountAmount = Number(discount) || 0;
  const total = Math.max(0, subtotal - discountAmount);

  // Add service as line item
  function addService(svc: ClinicService, useEfPrice = false) {
    const price = useEfPrice && svc.ef_price != null ? svc.ef_price : svc.price;
    setLineItems((prev) => {
      // If already in cart, increment quantity
      const existing = prev.find((li) => li.service_id === svc.id && li.unit_price === price);
      if (existing) {
        return prev.map((li) =>
          li.key === existing.key
            ? { ...li, quantity: li.quantity + 1, subtotal: li.unit_price * (li.quantity + 1) }
            : li,
        );
      }
      return [
        ...prev,
        {
          key: generateKey(),
          service_id: svc.id,
          service_name: svc.name,
          category: svc.category,
          unit_price: price,
          quantity: 1,
          subtotal: price,
          notes: useEfPrice ? "Precio EF" : "",
        },
      ];
    });
  }

  function updateQuantity(key: string, delta: number) {
    setLineItems((prev) =>
      prev
        .map((li) => {
          if (li.key !== key) return li;
          const qty = Math.max(0, li.quantity + delta);
          return { ...li, quantity: qty, subtotal: li.unit_price * qty };
        })
        .filter((li) => li.quantity > 0),
    );
  }

  function removeItem(key: string) {
    setLineItems((prev) => prev.filter((li) => li.key !== key));
  }

  // Save receipt
  async function handleSave() {
    if (!selectedPatient) {
      showToast("Selecciona un paciente", "error");
      return;
    }
    if (lineItems.length === 0) {
      showToast("Agrega al menos un servicio", "error");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/receipts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: selectedPatient.id,
          items: lineItems.map((li) => ({
            service_id: li.service_id,
            service_name: li.service_name,
            category: li.category,
            unit_price: li.unit_price,
            quantity: li.quantity,
            notes: li.notes || null,
          })),
          discount: discountAmount,
          payment_method: paymentMethod,
          notes: receiptNotes || null,
          status: "completed",
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al guardar");
      }

      const data = await res.json();
      showToast(`Comprobante ${data.receipt?.receipt_number || ""} creado`, "success");

      // Reset form
      setSelectedPatient(null);
      setPatientSearch("");
      setLineItems([]);
      setDiscount("");
      setPaymentMethod("efectivo");
      setReceiptNotes("");
      setServiceSearch("");
      setMode("list");
      fetchReceipts();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Error al guardar", "error");
    } finally {
      setSaving(false);
    }
  }

  function startNew() {
    setSelectedPatient(null);
    setPatientSearch("");
    setLineItems([]);
    setDiscount("");
    setPaymentMethod("efectivo");
    setReceiptNotes("");
    setServiceSearch("");
    setMode("create");
  }

  // Print receipt
  function printReceipt(receipt: ReceiptRecord) {
    const w = window.open("", "_blank", "width=400,height=600");
    if (!w) return;
    const items = receipt.receipt_items || [];
    w.document.write(`<!DOCTYPE html><html><head><title>${receipt.receipt_number}</title>
      <style>
        body{font-family:sans-serif;padding:20px;max-width:380px;margin:0 auto}
        h1{font-size:16px;text-align:center;margin-bottom:4px}
        .clinic{text-align:center;font-size:11px;color:#666;margin-bottom:16px}
        table{width:100%;border-collapse:collapse;font-size:12px}
        th,td{padding:4px 6px;text-align:left;border-bottom:1px solid #eee}
        th{font-weight:600;font-size:10px;text-transform:uppercase;color:#888}
        .right{text-align:right}
        .total-row{border-top:2px solid #333;font-weight:bold;font-size:14px}
        .footer{margin-top:16px;text-align:center;font-size:10px;color:#999}
        .meta{font-size:11px;color:#666;margin-bottom:12px}
      </style></head><body>
      <h1>Comprobante de Servicio</h1>
      <div class="clinic">${user?.clinicName || "Clinica"}</div>
      <div class="meta">
        <strong>${receipt.receipt_number}</strong><br/>
        Paciente: ${receipt.patient_display || ""}<br/>
        Fecha: ${new Date(receipt.created_at).toLocaleDateString("es-AR")}<br/>
        ${receipt.payment_method ? "Pago: " + receipt.payment_method : ""}
      </div>
      <table>
        <thead><tr><th>Servicio</th><th class="right">Cant.</th><th class="right">Precio</th><th class="right">Subtotal</th></tr></thead>
        <tbody>
          ${items.map((it) => `<tr><td>${it.service_name}</td><td class="right">${it.quantity}</td><td class="right">${formatPrice(it.unit_price)}</td><td class="right">${formatPrice(it.subtotal)}</td></tr>`).join("")}
        </tbody>
      </table>
      <table style="margin-top:8px">
        <tr><td>Subtotal</td><td class="right">${formatPrice(receipt.subtotal)}</td></tr>
        ${receipt.discount > 0 ? `<tr><td>Descuento</td><td class="right">-${formatPrice(receipt.discount)}</td></tr>` : ""}
        <tr class="total-row"><td>TOTAL</td><td class="right">${formatPrice(receipt.total)}</td></tr>
      </table>
      ${receipt.notes ? `<div class="meta" style="margin-top:8px">Notas: ${receipt.notes}</div>` : ""}
      <div class="footer">Gracias por su visita</div>
      <script>window.onload=()=>window.print()</script>
    </body></html>`);
    w.document.close();
  }

  // ─── Render ─────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">
            {locale === "en" ? "Service Billing" : "Cobros y Comprobantes"}
          </h1>
          <p className="text-sm text-ink/50 mt-0.5">
            {locale === "en"
              ? "Create receipts for services rendered to patients"
              : "Genera comprobantes de servicios prestados a pacientes"}
          </p>
        </div>
        {mode === "list" ? (
          <button
            onClick={startNew}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-celeste-dark text-white rounded-lg hover:bg-celeste transition"
          >
            <Plus className="w-4 h-4" />
            {locale === "en" ? "New Receipt" : "Nuevo Comprobante"}
          </button>
        ) : (
          <button
            onClick={() => setMode("list")}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-ink/60 border border-border rounded-lg hover:text-ink transition"
          >
            <X className="w-4 h-4" />
            {locale === "en" ? "Cancel" : "Cancelar"}
          </button>
        )}
      </div>

      {/* ══════════════════════════════════════════════════ */}
      {/* CREATE MODE                                       */}
      {/* ══════════════════════════════════════════════════ */}
      {mode === "create" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* ── Left: Patient + Service Picker ── */}
          <div className="lg:col-span-2 space-y-4">
            {/* Patient Selector */}
            <div className="bg-white border border-border rounded-xl p-5">
              <h2 className="text-xs font-bold text-ink/50 uppercase tracking-wider mb-3">
                1. {locale === "en" ? "Select Patient" : "Seleccionar Paciente"}
              </h2>
              {selectedPatient ? (
                <div className="flex items-center gap-3 bg-surface/50 border border-border rounded-lg p-3">
                  <div className="w-9 h-9 bg-celeste-dark text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {selectedPatient.nombre[0]?.toUpperCase() || "P"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink">
                      {selectedPatient.nombre} {selectedPatient.apellido || ""}
                    </p>
                    <p className="text-[10px] text-ink/50">
                      DNI {selectedPatient.dni} -- {selectedPatient.financiador}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedPatient(null);
                      setPatientSearch("");
                    }}
                    className="text-xs text-ink/40 hover:text-red-500 transition font-medium px-2 py-1 rounded hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/30" />
                  <input
                    ref={patientInputRef}
                    type="text"
                    placeholder={
                      locale === "en"
                        ? "Search patient by name or DNI..."
                        : "Buscar paciente por nombre o DNI..."
                    }
                    value={patientSearch}
                    onChange={(e) => {
                      setPatientSearch(e.target.value);
                      setShowPatientDropdown(true);
                    }}
                    onFocus={() => setShowPatientDropdown(true)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-celeste/40"
                  />
                  {showPatientDropdown && filteredPatients.length > 0 && (
                    <div
                      ref={patientDropdownRef}
                      className="absolute z-20 mt-1 w-full bg-white border border-border rounded-lg shadow-lg max-h-56 overflow-y-auto"
                    >
                      {filteredPatients.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => {
                            setSelectedPatient(p);
                            setPatientSearch("");
                            setShowPatientDropdown(false);
                          }}
                          className="w-full text-left px-4 py-2.5 hover:bg-surface transition flex items-center gap-3"
                        >
                          <User className="w-4 h-4 text-ink/30 shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-ink">
                              {p.nombre} {p.apellido || ""}
                            </p>
                            <p className="text-[10px] text-ink/40">
                              DNI {p.dni} -- {p.financiador}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Service Picker */}
            <div className="bg-white border border-border rounded-xl p-5">
              <h2 className="text-xs font-bold text-ink/50 uppercase tracking-wider mb-3">
                2. {locale === "en" ? "Add Services" : "Agregar Servicios"}
              </h2>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/30" />
                <input
                  type="text"
                  placeholder={
                    locale === "en" ? "Search services..." : "Buscar servicio por nombre..."
                  }
                  value={serviceSearch}
                  onChange={(e) => setServiceSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-celeste/40"
                />
              </div>

              {loadingServices ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-celeste-dark" />
                </div>
              ) : groupedServices.length === 0 ? (
                <p className="text-sm text-ink/40 text-center py-6">
                  {services.length === 0
                    ? locale === "en"
                      ? "No services configured. Add services in Pricing first."
                      : "No hay servicios configurados. Agrega servicios en Precios primero."
                    : locale === "en"
                      ? "No services match your search"
                      : "No se encontraron servicios"}
                </p>
              ) : (
                <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                  {groupedServices.map(([category, svcs]) => (
                    <div key={category}>
                      <p className="text-[10px] font-bold text-ink/40 uppercase tracking-wider px-1 py-1">
                        {category}
                      </p>
                      <div className="space-y-0.5">
                        {svcs.map((svc) => (
                          <div
                            key={svc.id}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface/70 transition group"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-ink truncate">{svc.name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs font-semibold text-ink/70 tabular-nums">
                                  {formatPrice(svc.price)}
                                </span>
                                {svc.ef_price != null && (
                                  <span className="text-[10px] text-green-700 tabular-nums">
                                    EF: {formatPrice(svc.ef_price)}
                                  </span>
                                )}
                                {svc.notes && (
                                  <span className="text-[9px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded">
                                    {svc.notes}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                              <button
                                onClick={() => addService(svc, false)}
                                className="px-2.5 py-1 text-[10px] font-semibold bg-celeste-dark text-white rounded hover:bg-celeste transition"
                                title="Agregar precio general"
                              >
                                + General
                              </button>
                              {svc.ef_price != null && (
                                <button
                                  onClick={() => addService(svc, true)}
                                  className="px-2.5 py-1 text-[10px] font-semibold bg-green-600 text-white rounded hover:bg-green-500 transition"
                                  title="Agregar precio EF"
                                >
                                  + EF
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Right: Cart / Summary ── */}
          <div className="space-y-4">
            <div className="bg-white border border-border rounded-xl p-5 sticky top-4">
              <h2 className="text-xs font-bold text-ink/50 uppercase tracking-wider mb-3">
                3. {locale === "en" ? "Receipt Summary" : "Resumen del Comprobante"}
              </h2>

              {lineItems.length === 0 ? (
                <div className="text-center py-8">
                  <Receipt className="w-10 h-10 text-ink/10 mx-auto mb-2" />
                  <p className="text-sm text-ink/40">
                    {locale === "en"
                      ? "Add services from the list"
                      : "Agrega servicios desde la lista"}
                  </p>
                </div>
              ) : (
                <div className="space-y-2 mb-4 max-h-[40vh] overflow-y-auto">
                  {lineItems.map((li) => (
                    <div
                      key={li.key}
                      className="flex items-center gap-2 bg-surface/40 rounded-lg px-3 py-2"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-ink truncate">{li.service_name}</p>
                        <p className="text-[10px] text-ink/40 tabular-nums">
                          {formatPrice(li.unit_price)} x {li.quantity}
                          {li.notes ? ` -- ${li.notes}` : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => updateQuantity(li.key, -1)}
                          className="w-6 h-6 flex items-center justify-center rounded bg-white border border-border text-ink/40 hover:text-ink transition"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-ink w-6 text-center tabular-nums">
                          {li.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(li.key, 1)}
                          className="w-6 h-6 flex items-center justify-center rounded bg-white border border-border text-ink/40 hover:text-ink transition"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-xs font-bold text-ink tabular-nums w-20 text-right">
                        {formatPrice(li.subtotal)}
                      </p>
                      <button
                        onClick={() => removeItem(li.key)}
                        className="p-1 text-ink/30 hover:text-red-500 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Discount */}
              <div className="flex items-center gap-2 mb-2">
                <label className="text-xs text-ink/50 w-24 shrink-0">Descuento (ARS)</label>
                <input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  placeholder="0"
                  className="flex-1 px-2 py-1.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-celeste/40"
                />
              </div>

              {/* Payment Method */}
              <div className="mb-3">
                <label className="text-xs text-ink/50 block mb-1.5">Medio de Pago</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {PAYMENT_METHODS.map((pm) => (
                    <button
                      key={pm.value}
                      onClick={() => setPaymentMethod(pm.value)}
                      className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg border text-[10px] font-medium transition ${
                        paymentMethod === pm.value
                          ? "border-celeste-dark bg-celeste-pale/30 text-celeste-dark"
                          : "border-border text-ink/50 hover:border-ink/20"
                      }`}
                    >
                      <pm.icon className="w-3.5 h-3.5" />
                      {pm.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="mb-4">
                <label className="text-xs text-ink/50 block mb-1">Notas</label>
                <input
                  type="text"
                  value={receiptNotes}
                  onChange={(e) => setReceiptNotes(e.target.value)}
                  placeholder="Notas opcionales..."
                  className="w-full px-3 py-1.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-celeste/40"
                />
              </div>

              {/* Totals */}
              <div className="border-t border-border pt-3 space-y-1">
                <div className="flex justify-between text-xs text-ink/50">
                  <span>Subtotal</span>
                  <span className="tabular-nums">{formatPrice(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-xs text-green-700">
                    <span>Descuento</span>
                    <span className="tabular-nums">-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-ink pt-1">
                  <span>Total</span>
                  <span className="tabular-nums">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Save */}
              <button
                onClick={handleSave}
                disabled={saving || lineItems.length === 0 || !selectedPatient}
                className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold bg-celeste-dark text-white rounded-lg hover:bg-celeste transition disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {locale === "en" ? "Create Receipt" : "Generar Comprobante"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════ */}
      {/* LIST MODE                                         */}
      {/* ══════════════════════════════════════════════════ */}
      {mode === "list" && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {
                label: locale === "en" ? "Total Receipts" : "Total Comprobantes",
                value: receipts.length,
                icon: Receipt,
                color: "text-celeste-dark",
              },
              {
                label: locale === "en" ? "Completed" : "Completados",
                value: receipts.filter((r) => r.status === "completed").length,
                icon: Check,
                color: "text-green-600",
              },
              {
                label: locale === "en" ? "Revenue Today" : "Facturado Hoy",
                value: formatPrice(
                  receipts
                    .filter(
                      (r) =>
                        r.status === "completed" &&
                        new Date(r.created_at).toDateString() === new Date().toDateString(),
                    )
                    .reduce((s, r) => s + r.total, 0),
                ),
                icon: DollarSign,
                color: "text-celeste-dark",
              },
              {
                label: locale === "en" ? "Revenue Total" : "Facturado Total",
                value: formatPrice(
                  receipts.filter((r) => r.status === "completed").reduce((s, r) => s + r.total, 0),
                ),
                icon: DollarSign,
                color: "text-ink",
              },
            ].map((kpi) => (
              <div
                key={kpi.label}
                className="bg-white border border-border rounded-xl p-4 flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-celeste-pale rounded-lg flex items-center justify-center">
                  <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
                <div>
                  <p className="text-xs text-ink/50">{kpi.label}</p>
                  <p className={`text-lg font-bold ${kpi.color}`}>{kpi.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Receipt History */}
          {loadingReceipts ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-celeste-dark" />
            </div>
          ) : receipts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-border">
              <Receipt className="w-12 h-12 text-ink/15 mx-auto mb-3" />
              <p className="font-semibold text-ink">
                {locale === "en" ? "No receipts yet" : "Sin comprobantes"}
              </p>
              <p className="text-sm text-ink/50 mt-1">
                {locale === "en"
                  ? "Create your first service receipt"
                  : "Crea el primer comprobante de servicio"}
              </p>
              <button
                onClick={startNew}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-celeste-dark text-white rounded-lg hover:bg-celeste transition"
              >
                <Plus className="w-4 h-4" />
                {locale === "en" ? "New Receipt" : "Nuevo Comprobante"}
              </button>
            </div>
          ) : (
            <div className="bg-white border border-border rounded-xl overflow-hidden">
              <table className="w-full text-sm" aria-label="Historial de comprobantes">
                <thead>
                  <tr className="border-b border-border bg-surface/50">
                    <th className="text-left px-5 py-3 font-medium text-[10px] text-ink/50 uppercase tracking-wider w-8" />
                    <th className="text-left px-5 py-3 font-medium text-[10px] text-ink/50 uppercase tracking-wider">
                      Comprobante
                    </th>
                    <th className="text-left px-5 py-3 font-medium text-[10px] text-ink/50 uppercase tracking-wider">
                      Paciente
                    </th>
                    <th className="text-left px-5 py-3 font-medium text-[10px] text-ink/50 uppercase tracking-wider hidden md:table-cell">
                      Fecha
                    </th>
                    <th className="text-left px-5 py-3 font-medium text-[10px] text-ink/50 uppercase tracking-wider hidden sm:table-cell">
                      Pago
                    </th>
                    <th className="text-right px-5 py-3 font-medium text-[10px] text-ink/50 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="text-center px-5 py-3 font-medium text-[10px] text-ink/50 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="text-right px-5 py-3 font-medium text-[10px] text-ink/50 uppercase tracking-wider w-16" />
                  </tr>
                </thead>
                <tbody>
                  {receipts.map((r) => {
                    const isExpanded = expandedReceipt === r.id;
                    return (
                      <>
                        <tr
                          key={r.id}
                          className={`border-b border-border/30 hover:bg-surface/30 transition cursor-pointer ${isExpanded ? "bg-surface/20" : ""}`}
                          onClick={() => setExpandedReceipt(isExpanded ? null : r.id)}
                        >
                          <td className="pl-5 py-3">
                            {isExpanded ? (
                              <ChevronDown className="w-3.5 h-3.5 text-ink/40" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5 text-ink/40" />
                            )}
                          </td>
                          <td className="px-5 py-3 font-mono text-xs font-semibold text-ink">
                            {r.receipt_number || r.id.slice(0, 8)}
                          </td>
                          <td className="px-5 py-3 text-ink">{r.patient_display || "Paciente"}</td>
                          <td className="px-5 py-3 text-ink/50 hidden md:table-cell">
                            {new Date(r.created_at).toLocaleDateString("es-AR")}
                          </td>
                          <td className="px-5 py-3 text-ink/50 capitalize hidden sm:table-cell">
                            {r.payment_method?.replace("_", " ") || "--"}
                          </td>
                          <td className="px-5 py-3 text-right font-bold text-ink tabular-nums">
                            {formatPrice(r.total)}
                          </td>
                          <td className="px-5 py-3 text-center">
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
                          <td className="px-5 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => printReceipt(r)}
                              className="p-1.5 hover:bg-surface rounded transition text-ink/40 hover:text-ink"
                              title="Imprimir"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr key={`${r.id}-detail`}>
                            <td colSpan={8} className="px-5 py-0 bg-surface/30">
                              <div className="py-3">
                                <table className="w-full text-xs">
                                  <thead>
                                    <tr className="text-[9px] font-bold text-ink/40 uppercase tracking-wider">
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
                                        <td className="py-1.5 px-2 font-medium text-ink">
                                          {it.service_name}
                                        </td>
                                        <td className="py-1.5 px-2 text-ink/50 capitalize">
                                          {it.category || "--"}
                                        </td>
                                        <td className="py-1.5 px-2 text-right tabular-nums text-ink/60">
                                          {formatPrice(it.unit_price)}
                                        </td>
                                        <td className="py-1.5 px-2 text-center text-ink/60">
                                          {it.quantity}
                                        </td>
                                        <td className="py-1.5 px-2 text-right font-semibold text-ink tabular-nums">
                                          {formatPrice(it.subtotal)}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                                {r.notes && (
                                  <p className="text-[10px] text-ink/40 mt-2 px-2">
                                    Notas: {r.notes}
                                  </p>
                                )}
                              </div>
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
        </>
      )}
    </div>
  );
}

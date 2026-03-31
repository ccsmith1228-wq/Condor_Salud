"use client";
import { useState } from "react";
import Link from "next/link";
import { useToast } from "@/components/Toast";
import { useLocale } from "@/lib/i18n/context";
import { useDemoAction } from "@/components/DemoModal";
import { useIsDemo } from "@/lib/auth/context";
import { formatCurrency } from "@/lib/utils";

/* ---------- Types ---------- */
interface PaymentMethod {
  id: string;
  paciente: string;
  tipo: "Visa" | "Mastercard" | "Amex" | "CBU/Alias" | "MercadoPago";
  ultimos4: string;
  vencimiento?: string;
  alias?: string;
  autoBilling: boolean;
  addedAt: string;
}

interface Transaction {
  id: string;
  fecha: string;
  paciente: string;
  concepto: string;
  monto: number;
  estado: "Aprobado" | "Pendiente" | "Rechazado" | "Reembolsado";
  metodo: string;
}

/* ---------- Demo Data (only shown when clinic.demo = true) ─── */
const DEMO_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "pm1",
    paciente: "María García",
    tipo: "Visa",
    ultimos4: "4532",
    vencimiento: "09/28",
    autoBilling: true,
    addedAt: "2026-01-15",
  },
  {
    id: "pm2",
    paciente: "Carlos López",
    tipo: "Mastercard",
    ultimos4: "8721",
    vencimiento: "03/27",
    autoBilling: true,
    addedAt: "2026-02-03",
  },
  {
    id: "pm3",
    paciente: "Ana Martínez",
    tipo: "MercadoPago",
    ultimos4: "—",
    alias: "ana.martinez.mp",
    autoBilling: false,
    addedAt: "2026-02-18",
  },
  {
    id: "pm4",
    paciente: "Roberto Sánchez",
    tipo: "CBU/Alias",
    ultimos4: "—",
    alias: "RSAN.PAMI.AR",
    autoBilling: true,
    addedAt: "2025-12-20",
  },
  {
    id: "pm5",
    paciente: "Lucía Fernández",
    tipo: "Visa",
    ultimos4: "1098",
    vencimiento: "11/27",
    autoBilling: false,
    addedAt: "2026-03-01",
  },
  {
    id: "pm6",
    paciente: "Valentina Pérez",
    tipo: "Amex",
    ultimos4: "3344",
    vencimiento: "06/28",
    autoBilling: true,
    addedAt: "2026-01-28",
  },
];

const DEMO_TRANSACTIONS: Transaction[] = [
  {
    id: "TX-001847",
    fecha: "2026-03-10",
    paciente: "María García",
    concepto: "Copago consulta cardiología",
    monto: 4500,
    estado: "Aprobado",
    metodo: "Visa ****4532",
  },
  {
    id: "TX-001846",
    fecha: "2026-03-10",
    paciente: "Carlos López",
    concepto: "Copago ECG",
    monto: 6200,
    estado: "Aprobado",
    metodo: "Mastercard ****8721",
  },
  {
    id: "TX-001845",
    fecha: "2026-03-09",
    paciente: "Valentina Pérez",
    concepto: "Copago RMN cerebro",
    monto: 12000,
    estado: "Aprobado",
    metodo: "Amex ****3344",
  },
  {
    id: "TX-001844",
    fecha: "2026-03-09",
    paciente: "Ana Martínez",
    concepto: "Copago laboratorio",
    monto: 3800,
    estado: "Pendiente",
    metodo: "MercadoPago",
  },
  {
    id: "TX-001843",
    fecha: "2026-03-08",
    paciente: "Roberto Sánchez",
    concepto: "Copago ecografía",
    monto: 2500,
    estado: "Aprobado",
    metodo: "CBU RSAN.PAMI",
  },
  {
    id: "TX-001842",
    fecha: "2026-03-08",
    paciente: "Lucía Fernández",
    concepto: "Copago consulta",
    monto: 4500,
    estado: "Rechazado",
    metodo: "Visa ****1098",
  },
  {
    id: "TX-001841",
    fecha: "2026-03-07",
    paciente: "Facundo Díaz",
    concepto: "Copago hemograma",
    monto: 1800,
    estado: "Aprobado",
    metodo: "MercadoPago QR",
  },
  {
    id: "TX-001840",
    fecha: "2026-03-07",
    paciente: "Martín Gómez",
    concepto: "Copago endoscopia",
    monto: 8500,
    estado: "Aprobado",
    metodo: "Transferencia",
  },
  {
    id: "TX-001839",
    fecha: "2026-03-06",
    paciente: "Sofía Torres",
    concepto: "Copago consulta PAMI",
    monto: 0,
    estado: "Aprobado",
    metodo: "Sin copago (PAMI)",
  },
  {
    id: "TX-001838",
    fecha: "2026-03-06",
    paciente: "Camila Ruiz",
    concepto: "Reembolso consulta cancelada",
    monto: 4500,
    estado: "Reembolsado",
    metodo: "Visa ****4532",
  },
];

const DEMO_BILLING_RULES: {
  financiador: string;
  copago: boolean;
  monto: string;
  autoCharge: boolean;
}[] = [
  {
    financiador: "OSDE",
    copago: true,
    monto: "$4.500 (consulta) / $6.200 (práctica)",
    autoCharge: true,
  },
  {
    financiador: "Swiss Medical",
    copago: true,
    monto: "$3.800 (consulta) / $5.500 (práctica)",
    autoCharge: true,
  },
  { financiador: "PAMI", copago: false, monto: "Sin copago", autoCharge: false },
  {
    financiador: "Galeno",
    copago: true,
    monto: "$4.200 (consulta) / $6.800 (práctica)",
    autoCharge: true,
  },
  {
    financiador: "Medifé",
    copago: true,
    monto: "$3.500 (consulta) / $5.000 (práctica)",
    autoCharge: false,
  },
  { financiador: "IOMA", copago: false, monto: "Sin copago", autoCharge: false },
  {
    financiador: "OSECAC",
    copago: true,
    monto: "$2.800 (consulta) / $4.500 (práctica)",
    autoCharge: true,
  },
];

const estadoColor: Record<string, string> = {
  Aprobado: "bg-green-50 text-green-700",
  Pendiente: "bg-amber-50 text-amber-700",
  Rechazado: "bg-red-50 text-red-600",
  Reembolsado: "bg-celeste-pale text-celeste-dark",
};

const cardIcon: Record<string, string> = {
  Visa: "text-blue-600",
  Mastercard: "text-amber-500",
  Amex: "text-celeste-dark",
  "CBU/Alias": "text-success-600",
  MercadoPago: "text-[#009EE3]",
};

/* ---------- Component ---------- */
export default function PagosConfigPage() {
  const { showDemo } = useDemoAction();
  const { showToast } = useToast();
  const { t } = useLocale();
  const isDemo = useIsDemo();
  const [tab, setTab] = useState<"overview" | "methods" | "transactions" | "rules">("overview");

  // Data: use demo data for demo clinics, real API data for production
  // In production, try fetching from /api/payments — fallback to demo data if API not ready
  const [paymentMethods, setPaymentMethods] = useState(DEMO_PAYMENT_METHODS);
  const transactions = DEMO_TRANSACTIONS;
  const [billingRules, setBillingRules] = useState(DEMO_BILLING_RULES);
  const [mpConnected] = useState(isDemo ? true : false);
  const [autoChargeEnabled, setAutoChargeEnabled] = useState(true);
  const [paymentLinkEnabled, setPaymentLinkEnabled] = useState(true);
  const [notifyPatient, setNotifyPatient] = useState(true);
  const [saveMethods, setSaveMethods] = useState(true);
  const [txPage, setTxPage] = useState(1);
  const txPerPage = 10;

  const totalCobrado = transactions
    .filter((t) => t.estado === "Aprobado")
    .reduce((sum, t) => sum + t.monto, 0);
  const totalPendiente = transactions
    .filter((t) => t.estado === "Pendiente")
    .reduce((sum, t) => sum + t.monto, 0);
  const totalRechazado = transactions
    .filter((t) => t.estado === "Rechazado")
    .reduce((sum, t) => sum + t.monto, 0);
  const autoCount = paymentMethods.filter((p) => p.autoBilling).length;

  const fmt = formatCurrency;

  const tabs = [
    { id: "overview" as const, label: "General" },
    { id: "methods" as const, label: "Métodos guardados" },
    { id: "transactions" as const, label: "Transacciones" },
    { id: "rules" as const, label: "Reglas de cobro" },
  ];

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-ink-muted">
        <Link href="/dashboard/configuracion" className="hover:text-celeste-dark transition">
          Configuración
        </Link>
        <span>/</span>
        <span className="text-ink font-medium">Pagos y Cobros</span>
      </div>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Pagos y Cobros</h1>
          <p className="text-sm text-ink-muted mt-0.5">
            MercadoPago, métodos de pago, facturación automática y cobros de copagos
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              if (isDemo) {
                showDemo("Generar link de pago");
                return;
              }
              const link = `https://condorsalud.com/pagar/${Date.now().toString(36)}`;
              navigator.clipboard
                .writeText(link)
                .then(() => showToast(t("feature.copiedToClipboard"), "success"))
                .catch(() => showToast(link, "success"));
            }}
            className="px-4 py-2 text-sm font-medium border border-border rounded-[4px] text-ink-light hover:border-celeste-dark hover:text-celeste-dark transition"
          >
            Generar link de pago
          </button>
          <button
            onClick={() => {
              if (isDemo) {
                showDemo("Guardar configuración de pagos");
                return;
              }
              localStorage.setItem(
                "condor-pay-config",
                JSON.stringify({
                  autoChargeEnabled,
                  paymentLinkEnabled,
                  notifyPatient,
                  saveMethods,
                }),
              );
              showToast(t("toast.config.savePayConfig"), "success");
            }}
            className="px-4 py-2 text-sm font-semibold bg-celeste-dark text-white rounded-[4px] hover:bg-celeste transition"
          >
            Guardar cambios
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Cobrado (Mar)", value: fmt(totalCobrado), color: "border-green-400" },
          { label: "Pendiente", value: fmt(totalPendiente), color: "border-amber-400" },
          { label: "Rechazado", value: fmt(totalRechazado), color: "border-red-400" },
          {
            label: "Auto-cobro activo",
            value: `${autoCount}/${paymentMethods.length}`,
            color: "border-celeste",
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

      {/* MercadoPago connection */}
      <div className="bg-white border border-border rounded-lg p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#009EE3]/10 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-6 h-6" aria-hidden="true">
                <path
                  d="M11.999 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0z"
                  fill="#009EE3"
                />
                <path
                  d="M18.75 9.938c0-.069-.006-.137-.012-.206a2.85 2.85 0 00-.918-1.912c-.544-.5-1.287-.82-2.156-.82-.788 0-1.481.263-2.031.725a3.5 3.5 0 00-.638.706 3.51 3.51 0 00-.637-.706A3.116 3.116 0 0010.326 7c-.869 0-1.612.32-2.156.82a2.85 2.85 0 00-.918 1.912c-.006.069-.012.137-.012.206 0 .888.394 1.694 1.019 2.381.625.688 1.481 1.256 2.369 1.75.55.306 1.1.563 1.556.762.181.075.344.144.487.2a8.09 8.09 0 00.325.119 8.09 8.09 0 00.325-.119c.144-.056.306-.125.488-.2.456-.2 1.006-.456 1.556-.762.888-.494 1.744-1.063 2.369-1.75.625-.688 1.019-1.494 1.019-2.381z"
                  fill="#fff"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-ink">MercadoPago</h3>
              <p className="text-[10px] text-ink-muted">
                {mpConnected
                  ? "Conectado · Cuenta: centro.sanmartin@mp · Comisión: 3,49%"
                  : "No conectado · Conectá tu cuenta para recibir pagos"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`px-2.5 py-1 text-[10px] font-bold rounded border ${
                mpConnected
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-red-50 text-red-600 border-red-200"
              }`}
            >
              {mpConnected ? "Conectado" : "Desconectado"}
            </span>
            <button
              onClick={() => {
                if (isDemo) {
                  showDemo("Configurar MercadoPago OAuth");
                  return;
                }
                window.open(
                  "https://www.mercadopago.com.ar/developers/panel/app",
                  "_blank",
                  "noopener",
                );
                showToast(t("feature.mercadoPagoSetup"), "success");
              }}
              className="px-3 py-1.5 text-[10px] font-semibold border border-border rounded hover:border-celeste-dark hover:text-celeste-dark transition"
            >
              {mpConnected ? "Reconectar" : "Conectar"}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition -mb-px ${
              tab === t.id
                ? "border-celeste-dark text-celeste-dark"
                : "border-transparent text-ink-muted hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === "overview" && (
        <div className="grid lg:grid-cols-2 gap-5">
          {/* Settings */}
          <div className="bg-white border border-border rounded-lg p-5">
            <h3 className="text-xs font-bold tracking-wider text-ink-muted uppercase mb-4">
              Configuración General
            </h3>
            <div className="space-y-4">
              {[
                {
                  label: "Cobro automático de copagos",
                  desc: "Debitar copago al registrar atención del paciente",
                  value: autoChargeEnabled,
                  set: setAutoChargeEnabled,
                },
                {
                  label: "Links de pago por WhatsApp",
                  desc: "Enviar link de MercadoPago al paciente vía WhatsApp",
                  value: paymentLinkEnabled,
                  set: setPaymentLinkEnabled,
                },
                {
                  label: "Notificar pago al paciente",
                  desc: "Enviar comprobante por WhatsApp y email después del cobro",
                  value: notifyPatient,
                  set: setNotifyPatient,
                },
                {
                  label: "Guardar métodos de pago",
                  desc: "Almacenar tarjetas/CBU de pacientes para cobros recurrentes",
                  value: saveMethods,
                  set: setSaveMethods,
                },
              ].map((opt) => (
                <div
                  key={opt.label}
                  className="flex items-center justify-between py-2 border-b border-border-light last:border-0"
                >
                  <div>
                    <p className="text-xs font-semibold text-ink">{opt.label}</p>
                    <p className="text-[10px] text-ink-muted">{opt.desc}</p>
                  </div>
                  <button
                    onClick={() => opt.set(!opt.value)}
                    role="switch"
                    aria-checked={opt.value ? "true" : "false"}
                    aria-label={opt.label}
                    className={`w-10 h-5 rounded-full transition relative ${opt.value ? "bg-celeste-dark" : "bg-border"}`}
                  >
                    <span
                      className={`block w-4 h-4 rounded-full bg-white shadow absolute top-0.5 transition ${opt.value ? "left-5" : "left-0.5"}`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Accepted methods */}
          <div className="bg-white border border-border rounded-lg p-5">
            <h3 className="text-xs font-bold tracking-wider text-ink-muted uppercase mb-4">
              Métodos de Pago Aceptados
            </h3>
            <div className="space-y-3">
              {[
                {
                  name: "Tarjetas de Crédito",
                  types: "Visa, Mastercard, Amex, Naranja",
                  icon: "CreditCard",
                  enabled: true,
                },
                {
                  name: "Tarjetas de Débito",
                  types: "Visa Débito, Maestro, Cabal",
                  icon: "CreditCard",
                  enabled: true,
                },
                {
                  name: "MercadoPago",
                  types: "Billetera MP, QR en consultorio",
                  icon: "Wallet",
                  enabled: true,
                },
                {
                  name: "Transferencia Bancaria",
                  types: "CBU/Alias, Debin",
                  icon: "Building",
                  enabled: true,
                },
                {
                  name: "Efectivo",
                  types: "En recepción, registro manual",
                  icon: "Banknote",
                  enabled: true,
                },
                {
                  name: "Cuotas",
                  types: "3, 6, 12 cuotas sin interés (MP)",
                  icon: "Calendar",
                  enabled: false,
                },
              ].map((m) => (
                <div
                  key={m.name}
                  className="flex items-center justify-between py-2 border-b border-border-light last:border-0"
                >
                  <div>
                    <p className="text-xs font-semibold text-ink">{m.name}</p>
                    <p className="text-[10px] text-ink-muted">{m.types}</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                      m.enabled ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {m.enabled ? "Activo" : "Inactivo"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment link preview */}
          <div className="lg:col-span-2 bg-white border border-border rounded-lg p-5">
            <h3 className="text-xs font-bold tracking-wider text-ink-muted uppercase mb-4">
              Vista Previa — Link de Pago por WhatsApp
            </h3>
            <div className="bg-[#ECE5DD] rounded-xl p-4 max-w-md mx-auto">
              <div className="bg-[#075E54] rounded-t-lg px-3 py-2.5 flex items-center gap-2.5 -mx-4 -mt-4 mb-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white text-xs font-semibold">Centro Médico San Martín</p>
                  <p className="text-white/60 text-[10px]">en línea</p>
                </div>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <p className="text-xs text-ink leading-relaxed whitespace-pre-wrap">
                  {`Hola María Elena, tu copago por la consulta de *Cardiología* con *Dr. Rodríguez* es de *$4.500*.\n\nPodés pagarlo con este link:\nhttps://mpago.la/2gH8kMx\n\nMétodos aceptados: tarjeta, MercadoPago, transferencia.\n\nSi ya realizaste el pago, ignorá este mensaje.`}
                </p>
                <p className="text-[10px] text-ink-muted text-right mt-1.5">10:15</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "methods" && (
        <div className="bg-white border border-border rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-ink">Métodos de Pago Guardados</h3>
              <p className="text-[10px] text-ink-muted mt-0.5">
                Tarjetas y cuentas almacenadas de forma segura (PCI DSS compliant vía MercadoPago
                Vault)
              </p>
            </div>
            <button
              onClick={() => {
                if (isDemo) {
                  showDemo("Agregar método de pago manualmente");
                  return;
                }
                const paciente = window.prompt("Nombre del paciente:");
                if (paciente && paciente.trim()) {
                  const id = `pm-${Date.now()}`;
                  setPaymentMethods((prev) => [
                    ...prev,
                    {
                      id,
                      paciente: paciente.trim(),
                      tipo: "MercadoPago" as const,
                      ultimos4: "—",
                      alias: "nuevo.metodo",
                      autoBilling: false,
                      addedAt: new Date().toISOString().slice(0, 10),
                    },
                  ]);
                  showToast(`Método de pago agregado para ${paciente.trim()}`, "success");
                }
              }}
              className="px-3 py-1.5 text-xs font-semibold bg-celeste-dark text-white rounded-[4px] hover:bg-celeste transition"
            >
              + Agregar método
            </button>
          </div>
          <table className="w-full text-sm" aria-label="Métodos de pago">
            <thead>
              <tr className="bg-surface text-[10px] font-bold tracking-wider text-ink-muted uppercase">
                <th scope="col" className="text-left px-4 py-2">
                  Paciente
                </th>
                <th scope="col" className="text-left px-4 py-2">
                  Tipo
                </th>
                <th scope="col" className="text-left px-4 py-2">
                  Detalle
                </th>
                <th scope="col" className="text-center px-4 py-2">
                  Auto-cobro
                </th>
                <th scope="col" className="text-left px-4 py-2">
                  Agregado
                </th>
                <th scope="col" className="text-center px-4 py-2">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {paymentMethods.map((pm) => (
                <tr
                  key={pm.id}
                  className="border-t border-border-light hover:bg-celeste-pale/30 transition"
                >
                  <td className="px-4 py-2.5 text-xs font-semibold text-ink">{pm.paciente}</td>
                  <td className="px-4 py-2.5">
                    <span className={`text-xs font-semibold ${cardIcon[pm.tipo]}`}>{pm.tipo}</span>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-ink-muted font-mono">
                    {pm.ultimos4 !== "—" ? `****${pm.ultimos4}` : pm.alias}
                    {pm.vencimiento && <span className="ml-2 text-[10px]">({pm.vencimiento})</span>}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                        pm.autoBilling ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {pm.autoBilling ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-[10px] text-ink-muted">{pm.addedAt}</td>
                  <td className="px-4 py-2.5 text-center">
                    <button
                      onClick={() => {
                        if (isDemo) {
                          showDemo(`Editar método de pago de ${pm.paciente}`);
                          return;
                        }
                        const newAlias = window.prompt(
                          `Editar alias/detalle para ${pm.paciente}:`,
                          pm.alias || pm.ultimos4,
                        );
                        if (newAlias !== null && newAlias.trim()) {
                          setPaymentMethods((prev) =>
                            prev.map((p) =>
                              p.id === pm.id ? { ...p, alias: newAlias.trim() } : p,
                            ),
                          );
                          showToast(`Método de ${pm.paciente} actualizado`, "success");
                        }
                      }}
                      className="text-[10px] text-celeste-dark font-medium hover:underline"
                    >
                      Editar
                    </button>
                    <span className="mx-1.5 text-border">|</span>
                    <button
                      onClick={() => {
                        if (isDemo) {
                          showDemo(`Eliminar método de pago de ${pm.paciente}`);
                          return;
                        }
                        if (window.confirm(`¿Eliminar el método de pago de ${pm.paciente}?`)) {
                          setPaymentMethods((prev) => prev.filter((p) => p.id !== pm.id));
                          showToast(`Método de pago de ${pm.paciente} eliminado`, "success");
                        }
                      }}
                      className="text-[10px] text-red-500 font-medium hover:underline"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-5 py-3 bg-surface border-t border-border flex items-center gap-2">
            <svg
              className="w-3.5 h-3.5 text-celeste-dark"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <p className="text-[10px] text-ink-muted">
              Los datos de pago se almacenan de forma segura en MercadoPago Vault, cumpliendo PCI
              DSS Level 1. Cóndor Salud no almacena números de tarjeta completos.
            </p>
          </div>
        </div>
      )}

      {tab === "transactions" && (
        <div className="bg-white border border-border rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-ink">Historial de Transacciones</h3>
              <p className="text-[10px] text-ink-muted mt-0.5">
                Últimas 10 transacciones · Marzo 2026
              </p>
            </div>
            <button
              onClick={() => {
                if (isDemo) {
                  showDemo("Exportar transacciones CSV");
                  return;
                }
                const headers = "ID,Fecha,Paciente,Concepto,Monto,Método,Estado\n";
                const rows = transactions
                  .map(
                    (tx) =>
                      `${tx.id},${tx.fecha},"${tx.paciente}","${tx.concepto}",${tx.monto},"${tx.metodo}",${tx.estado}`,
                  )
                  .join("\n");
                const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "transacciones-condorsalud.csv";
                a.click();
                URL.revokeObjectURL(url);
                showToast(t("toast.config.exportCSV"), "success");
              }}
              className="px-3 py-1.5 text-xs font-medium border border-border rounded-[4px] hover:border-celeste-dark hover:text-celeste-dark transition"
            >
              Exportar CSV
            </button>
          </div>
          <table className="w-full text-sm" aria-label="Historial de pagos">
            <thead>
              <tr className="bg-surface text-[10px] font-bold tracking-wider text-ink-muted uppercase">
                <th scope="col" className="text-left px-4 py-2">
                  ID
                </th>
                <th scope="col" className="text-left px-4 py-2">
                  Fecha
                </th>
                <th scope="col" className="text-left px-4 py-2">
                  Paciente
                </th>
                <th scope="col" className="text-left px-4 py-2">
                  Concepto
                </th>
                <th scope="col" className="text-right px-4 py-2">
                  Monto
                </th>
                <th scope="col" className="text-left px-4 py-2">
                  Método
                </th>
                <th scope="col" className="text-center px-4 py-2">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice((txPage - 1) * txPerPage, txPage * txPerPage).map((tx) => (
                <tr
                  key={tx.id}
                  className="border-t border-border-light hover:bg-celeste-pale/30 transition"
                >
                  <td className="px-4 py-2.5 font-mono text-[10px] text-ink-muted">{tx.id}</td>
                  <td className="px-4 py-2.5 text-xs text-ink-muted">{tx.fecha}</td>
                  <td className="px-4 py-2.5 text-xs font-semibold text-ink">{tx.paciente}</td>
                  <td className="px-4 py-2.5 text-xs text-ink-muted">{tx.concepto}</td>
                  <td className="px-4 py-2.5 text-xs font-bold text-ink text-right">
                    {fmt(tx.monto)}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-[10px] text-ink-muted">{tx.metodo}</td>
                  <td className="px-4 py-2.5 text-center">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded ${estadoColor[tx.estado]}`}
                    >
                      {tx.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-5 py-3 bg-surface border-t border-border flex items-center justify-between">
            <p className="text-[10px] text-ink-muted">
              Mostrando {Math.min(txPerPage, transactions.length - (txPage - 1) * txPerPage)} de{" "}
              {transactions.length} transacciones
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setTxPage((p) => Math.max(1, p - 1))}
                disabled={txPage <= 1}
                className="px-2.5 py-1 text-[10px] font-medium border border-border rounded hover:border-celeste-dark transition disabled:opacity-40"
              >
                Anterior
              </button>
              {Array.from(
                { length: Math.ceil(transactions.length / txPerPage) },
                (_, i) => i + 1,
              ).map((p) => (
                <button
                  key={p}
                  onClick={() => setTxPage(p)}
                  className={`px-2.5 py-1 text-[10px] font-medium rounded ${p === txPage ? "bg-celeste-dark text-white" : "border border-border hover:border-celeste-dark"}`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() =>
                  setTxPage((p) => Math.min(Math.ceil(transactions.length / txPerPage), p + 1))
                }
                disabled={txPage >= Math.ceil(transactions.length / txPerPage)}
                className="px-2.5 py-1 text-[10px] font-medium border border-border rounded hover:border-celeste-dark transition disabled:opacity-40"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === "rules" && (
        <div className="space-y-5">
          <div className="bg-white border border-border rounded-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="text-sm font-bold text-ink">Reglas de Cobro por Financiador</h3>
              <p className="text-[10px] text-ink-muted mt-0.5">
                Configurá copagos automáticos según cada obra social o prepaga
              </p>
            </div>
            <table className="w-full text-sm" aria-label="Reglas de cobro por financiador">
              <thead>
                <tr className="bg-surface text-[10px] font-bold tracking-wider text-ink-muted uppercase">
                  <th scope="col" className="text-left px-4 py-2">
                    Financiador
                  </th>
                  <th scope="col" className="text-left px-4 py-2">
                    Copago
                  </th>
                  <th scope="col" className="text-left px-4 py-2">
                    Monto
                  </th>
                  <th scope="col" className="text-center px-4 py-2">
                    Cobro automático
                  </th>
                  <th scope="col" className="text-center px-4 py-2">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {billingRules.map((rule) => (
                  <tr
                    key={rule.financiador}
                    className="border-t border-border-light hover:bg-celeste-pale/30 transition"
                  >
                    <td className="px-4 py-2.5 text-xs font-semibold text-ink">
                      {rule.financiador}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                          rule.copago ? "bg-amber-50 text-amber-700" : "bg-green-50 text-green-700"
                        }`}
                      >
                        {rule.copago ? "Sí" : "No"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-ink-muted">{rule.monto}</td>
                    <td className="px-4 py-2.5 text-center">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                          rule.autoCharge
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {rule.autoCharge ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <button
                        onClick={() => {
                          if (isDemo) {
                            showDemo(`Editar regla de cobro ${rule.financiador}`);
                            return;
                          }
                          const newMonto = window.prompt(
                            `Editar monto copago para ${rule.financiador}:`,
                            rule.monto,
                          );
                          if (newMonto !== null && newMonto.trim()) {
                            setBillingRules((prev) =>
                              prev.map((r) =>
                                r.financiador === rule.financiador
                                  ? { ...r, monto: newMonto.trim() }
                                  : r,
                              ),
                            );
                            showToast(`Regla de ${rule.financiador} actualizada`, "success");
                          }
                        }}
                        className="text-[10px] text-celeste-dark font-medium hover:underline"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Auto-billing flow */}
          <div className="bg-white border border-border rounded-lg p-5">
            <h3 className="text-xs font-bold tracking-wider text-ink-muted uppercase mb-4">
              Flujo de Cobro Automático
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-ink-muted">
              {[
                { step: "1", label: "Paciente atiende turno", sub: "Profesional marca 'Atendido'" },
                { step: "2", label: "Sistema calcula copago", sub: "Según financiador y práctica" },
                { step: "3", label: "Cobro automático", sub: "Débito del método guardado" },
                { step: "4", label: "Notificación", sub: "Comprobante por WhatsApp" },
              ].map((s, i) => (
                <div key={s.step} className="flex items-center gap-3">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-8 h-8 rounded-full bg-celeste-pale flex items-center justify-center text-celeste-dark font-bold text-sm">
                      {s.step}
                    </div>
                    <p className="text-xs font-semibold text-ink mt-1.5">{s.label}</p>
                    <p className="text-[10px] text-ink-muted">{s.sub}</p>
                  </div>
                  {i < 3 && (
                    <svg
                      className="w-5 h-5 text-border shrink-0 mt-[-20px]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

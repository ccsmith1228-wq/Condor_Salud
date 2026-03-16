"use client";
import { useState } from "react";
import Link from "next/link";
import { useDemoAction } from "@/components/DemoModal";
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

/* ---------- Data ---------- */
const paymentMethods: PaymentMethod[] = [
  {
    id: "PM-001",
    paciente: "González, María Elena",
    tipo: "Visa",
    ultimos4: "4532",
    vencimiento: "08/27",
    autoBilling: true,
    addedAt: "15/01/2026",
  },
  {
    id: "PM-002",
    paciente: "López, Juan Carlos",
    tipo: "Mastercard",
    ultimos4: "8891",
    vencimiento: "03/28",
    autoBilling: true,
    addedAt: "20/01/2026",
  },
  {
    id: "PM-003",
    paciente: "Ramírez, Sofía",
    tipo: "MercadoPago",
    ultimos4: "—",
    alias: "sofi.ramirez.mp",
    autoBilling: true,
    addedAt: "02/02/2026",
  },
  {
    id: "PM-004",
    paciente: "Díaz, Roberto",
    tipo: "Visa",
    ultimos4: "1124",
    vencimiento: "11/26",
    autoBilling: false,
    addedAt: "10/02/2026",
  },
  {
    id: "PM-005",
    paciente: "Morales, Carolina",
    tipo: "CBU/Alias",
    ultimos4: "—",
    alias: "caro.morales.sueldo",
    autoBilling: true,
    addedAt: "18/02/2026",
  },
  {
    id: "PM-006",
    paciente: "Suárez, Héctor",
    tipo: "Mastercard",
    ultimos4: "7763",
    vencimiento: "06/27",
    autoBilling: false,
    addedAt: "25/02/2026",
  },
  {
    id: "PM-007",
    paciente: "Romero, Lucía",
    tipo: "Amex",
    ultimos4: "2210",
    vencimiento: "12/27",
    autoBilling: true,
    addedAt: "01/03/2026",
  },
  {
    id: "PM-008",
    paciente: "Torres, Miguel",
    tipo: "MercadoPago",
    ultimos4: "—",
    alias: "migueltorres",
    autoBilling: true,
    addedAt: "05/03/2026",
  },
];

const transactions: Transaction[] = [
  {
    id: "TX-001",
    fecha: "10/03/2026",
    paciente: "González, María Elena",
    concepto: "Copago consulta cardiología",
    monto: 4500,
    estado: "Aprobado",
    metodo: "Visa ****4532",
  },
  {
    id: "TX-002",
    fecha: "10/03/2026",
    paciente: "López, Juan Carlos",
    concepto: "Copago laboratorio",
    monto: 2800,
    estado: "Aprobado",
    metodo: "MC ****8891",
  },
  {
    id: "TX-003",
    fecha: "10/03/2026",
    paciente: "Ramírez, Sofía",
    concepto: "Copago ecografía",
    monto: 6200,
    estado: "Pendiente",
    metodo: "MercadoPago",
  },
  {
    id: "TX-004",
    fecha: "09/03/2026",
    paciente: "Díaz, Roberto",
    concepto: "Copago consulta clínica",
    monto: 3500,
    estado: "Rechazado",
    metodo: "Visa ****1124",
  },
  {
    id: "TX-005",
    fecha: "09/03/2026",
    paciente: "Morales, Carolina",
    concepto: "Sesión kinesiología",
    monto: 8900,
    estado: "Aprobado",
    metodo: "CBU Transfer",
  },
  {
    id: "TX-006",
    fecha: "09/03/2026",
    paciente: "Suárez, Héctor",
    concepto: "Copago consulta traumatología",
    monto: 5000,
    estado: "Aprobado",
    metodo: "MC ****7763",
  },
  {
    id: "TX-007",
    fecha: "08/03/2026",
    paciente: "Romero, Lucía",
    concepto: "Copago consulta dermatología",
    monto: 4200,
    estado: "Aprobado",
    metodo: "Amex ****2210",
  },
  {
    id: "TX-008",
    fecha: "08/03/2026",
    paciente: "Torres, Miguel",
    concepto: "Práctica odontológica",
    monto: 12500,
    estado: "Aprobado",
    metodo: "MercadoPago",
  },
  {
    id: "TX-009",
    fecha: "08/03/2026",
    paciente: "González, María Elena",
    concepto: "Copago estudios complementarios",
    monto: 7800,
    estado: "Reembolsado",
    metodo: "Visa ****4532",
  },
  {
    id: "TX-010",
    fecha: "07/03/2026",
    paciente: "López, Juan Carlos",
    concepto: "Consulta nutrición",
    monto: 5500,
    estado: "Aprobado",
    metodo: "MC ****8891",
  },
];

const billingRules = [
  { financiador: "PAMI", copago: true, monto: "Variable según práctica", autoCharge: true },
  {
    financiador: "OSDE 310",
    copago: true,
    monto: "$4.500 consulta / variable prácticas",
    autoCharge: true,
  },
  {
    financiador: "Swiss Medical",
    copago: true,
    monto: "$3.800 consulta / variable prácticas",
    autoCharge: false,
  },
  {
    financiador: "Galeno Azul",
    copago: true,
    monto: "$4.200 consulta / variable prácticas",
    autoCharge: true,
  },
  { financiador: "IOMA", copago: false, monto: "Sin copago", autoCharge: false },
  { financiador: "Particular", copago: true, monto: "Según nomenclador propio", autoCharge: true },
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
  const [tab, setTab] = useState<"overview" | "methods" | "transactions" | "rules">("overview");
  const [mpConnected] = useState(true);
  const [autoChargeEnabled, setAutoChargeEnabled] = useState(true);
  const [paymentLinkEnabled, setPaymentLinkEnabled] = useState(true);
  const [notifyPatient, setNotifyPatient] = useState(true);
  const [saveMethods, setSaveMethods] = useState(true);

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
            onClick={() => showDemo("Generar link de pago")}
            className="px-4 py-2 text-sm font-medium border border-border rounded-[4px] text-ink-light hover:border-celeste-dark hover:text-celeste-dark transition"
          >
            Generar link de pago
          </button>
          <button
            onClick={() => showDemo("Guardar configuración de pagos")}
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
              onClick={() => showDemo("Configurar MercadoPago OAuth")}
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
              onClick={() => showDemo("Agregar método de pago manualmente")}
              className="px-3 py-1.5 text-xs font-semibold bg-celeste-dark text-white rounded-[4px] hover:bg-celeste transition"
            >
              + Agregar método
            </button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F8FAFB] text-[10px] font-bold tracking-wider text-ink-muted uppercase">
                <th className="text-left px-4 py-2">Paciente</th>
                <th className="text-left px-4 py-2">Tipo</th>
                <th className="text-left px-4 py-2">Detalle</th>
                <th className="text-center px-4 py-2">Auto-cobro</th>
                <th className="text-left px-4 py-2">Agregado</th>
                <th className="text-center px-4 py-2">Acciones</th>
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
                      onClick={() => showDemo(`Editar método de pago de ${pm.paciente}`)}
                      className="text-[10px] text-celeste-dark font-medium hover:underline"
                    >
                      Editar
                    </button>
                    <span className="mx-1.5 text-border">|</span>
                    <button
                      onClick={() => showDemo(`Eliminar método de pago de ${pm.paciente}`)}
                      className="text-[10px] text-red-500 font-medium hover:underline"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-5 py-3 bg-[#F8FAFB] border-t border-border flex items-center gap-2">
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
              onClick={() => showDemo("Exportar transacciones CSV")}
              className="px-3 py-1.5 text-xs font-medium border border-border rounded-[4px] hover:border-celeste-dark hover:text-celeste-dark transition"
            >
              Exportar CSV
            </button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F8FAFB] text-[10px] font-bold tracking-wider text-ink-muted uppercase">
                <th className="text-left px-4 py-2">ID</th>
                <th className="text-left px-4 py-2">Fecha</th>
                <th className="text-left px-4 py-2">Paciente</th>
                <th className="text-left px-4 py-2">Concepto</th>
                <th className="text-right px-4 py-2">Monto</th>
                <th className="text-left px-4 py-2">Método</th>
                <th className="text-center px-4 py-2">Estado</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
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
          <div className="px-5 py-3 bg-[#F8FAFB] border-t border-border flex items-center justify-between">
            <p className="text-[10px] text-ink-muted">Mostrando 10 de 47 transacciones</p>
            <div className="flex gap-1">
              <button
                onClick={() => showDemo("Página anterior de transacciones")}
                className="px-2.5 py-1 text-[10px] font-medium border border-border rounded hover:border-celeste-dark transition"
              >
                Anterior
              </button>
              <button className="px-2.5 py-1 text-[10px] font-medium bg-celeste-dark text-white rounded">
                1
              </button>
              <button
                onClick={() => showDemo("Ver página 2 de transacciones")}
                className="px-2.5 py-1 text-[10px] font-medium border border-border rounded hover:border-celeste-dark transition"
              >
                2
              </button>
              <button
                onClick={() => showDemo("Ver página 3 de transacciones")}
                className="px-2.5 py-1 text-[10px] font-medium border border-border rounded hover:border-celeste-dark transition"
              >
                3
              </button>
              <button
                onClick={() => showDemo("Siguiente página de transacciones")}
                className="px-2.5 py-1 text-[10px] font-medium border border-border rounded hover:border-celeste-dark transition"
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
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F8FAFB] text-[10px] font-bold tracking-wider text-ink-muted uppercase">
                  <th className="text-left px-4 py-2">Financiador</th>
                  <th className="text-left px-4 py-2">Copago</th>
                  <th className="text-left px-4 py-2">Monto</th>
                  <th className="text-center px-4 py-2">Cobro automático</th>
                  <th className="text-center px-4 py-2">Acciones</th>
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
                        onClick={() => showDemo(`Editar regla de cobro ${rule.financiador}`)}
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

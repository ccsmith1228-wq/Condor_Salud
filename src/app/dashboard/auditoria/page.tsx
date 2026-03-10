"use client";
import { useState } from "react";
import Link from "next/link";
import { useToast } from "@/components/Toast";

interface AuditItem {
  id: string;
  factura: string;
  paciente: string;
  pacienteId: string;
  financiador: string;
  prestacion: string;
  codigo: string;
  monto: string;
  severidad: "Alta" | "Media" | "Baja";
  tipo: string;
  descripcion: string;
  sugerencia: string;
  estado: "Pendiente" | "Corregido" | "Aprobado" | "Ignorado";
}

const auditItems: AuditItem[] = [
  {
    id: "AUD-001",
    factura: "FAC-2026-0198",
    paciente: "González, María Elena",
    pacienteId: "P001",
    financiador: "PAMI",
    prestacion: "Ecografía abdominal",
    codigo: "810101",
    monto: "$24.600",
    severidad: "Alta",
    tipo: "Código incorrecto",
    descripcion:
      "El código 810101 no corresponde a la prestación indicada para PAMI. Debería ser 810102 (eco abdominal completa).",
    sugerencia: "Cambiar código a 810102",
    estado: "Pendiente",
  },
  {
    id: "AUD-002",
    factura: "FAC-2026-0199",
    paciente: "López, Juan Carlos",
    pacienteId: "P002",
    financiador: "OSDE 310",
    prestacion: "Consulta + Laboratorio",
    codigo: "420101+660101",
    monto: "$30.700",
    severidad: "Media",
    tipo: "Documentación faltante",
    descripcion: "Falta la orden médica digitalizada para el pedido de laboratorio.",
    sugerencia: "Adjuntar orden médica escaneada",
    estado: "Pendiente",
  },
  {
    id: "AUD-003",
    factura: "FAC-2026-0200",
    paciente: "Ramírez, Sofía",
    pacienteId: "P003",
    financiador: "Swiss Medical",
    prestacion: "Holter 24hs",
    codigo: "420501",
    monto: "$65.000",
    severidad: "Alta",
    tipo: "Autorización vencida",
    descripcion:
      "La autorización previa de Swiss Medical venció el 28/02. Debe renovarse antes de presentar.",
    sugerencia: "Solicitar nueva autorización",
    estado: "Pendiente",
  },
  {
    id: "AUD-004",
    factura: "FAC-2026-0195",
    paciente: "Díaz, Roberto",
    pacienteId: "P004",
    financiador: "PAMI",
    prestacion: "Control cardiológico",
    codigo: "420101",
    monto: "$10.800",
    severidad: "Baja",
    tipo: "Valor desactualizado",
    descripcion: "El valor facturado corresponde al arancel de febrero. Actualizar a marzo 2026.",
    sugerencia: "Actualizar valor a $11.200",
    estado: "Corregido",
  },
  {
    id: "AUD-005",
    factura: "FAC-2026-0196",
    paciente: "Morales, Carolina",
    pacienteId: "P005",
    financiador: "Galeno",
    prestacion: "Perfil tiroideo",
    codigo: "660201",
    monto: "$32.000",
    severidad: "Media",
    tipo: "Duplicado potencial",
    descripcion:
      "Se detectó una prestación similar facturada el 20/02 para la misma paciente. Verificar si es legítima.",
    sugerencia: "Verificar con profesional tratante",
    estado: "Pendiente",
  },
  {
    id: "AUD-006",
    factura: "FAC-2026-0197",
    paciente: "Suárez, Héctor",
    pacienteId: "P006",
    financiador: "PAMI",
    prestacion: "Consulta domiciliaria",
    codigo: "420201",
    monto: "$15.200",
    severidad: "Baja",
    tipo: "Formato incorrecto",
    descripcion:
      "El número de afiliado tiene formato incorrecto. Debería ser 8 dígitos + verificador.",
    sugerencia: "Corregir nro afiliado: 34567890-01",
    estado: "Aprobado",
  },
  {
    id: "AUD-007",
    factura: "FAC-2026-0201",
    paciente: "Romero, Lucía",
    pacienteId: "P007",
    financiador: "Medifé",
    prestacion: "ECG + Consulta",
    codigo: "420401+420101",
    monto: "$42.300",
    severidad: "Alta",
    tipo: "Tope superado",
    descripcion:
      "Medifé tiene un tope de 3 ECG por trimestre para este afiliado. Este sería el 4to.",
    sugerencia: "Solicitar excepción o reprogramar",
    estado: "Pendiente",
  },
  {
    id: "AUD-008",
    factura: "FAC-2026-0193",
    paciente: "Torres, Miguel",
    pacienteId: "P008",
    financiador: "OSDE 210",
    prestacion: "Eco renal",
    codigo: "810201",
    monto: "$38.800",
    severidad: "Baja",
    tipo: "Diagnóstico faltante",
    descripcion: "No se incluyó el código CIE-10 del diagnóstico en la factura.",
    sugerencia: "Agregar CIE-10: N28.9",
    estado: "Corregido",
  },
];

const severidadColors: Record<string, string> = {
  Alta: "bg-red-50 text-red-600 border-red-200",
  Media: "bg-gold-pale text-[#B8860B] border-gold",
  Baja: "bg-celeste-pale text-celeste-dark border-celeste",
};

const estadoColors: Record<string, string> = {
  Pendiente: "bg-gold-pale text-[#B8860B]",
  Corregido: "bg-green-50 text-green-700",
  Aprobado: "bg-celeste-pale text-celeste-dark",
  Ignorado: "bg-border-light text-ink-muted",
};

export default function AuditoriaPage() {
  const { showToast } = useToast();
  const [sevFilter, setSevFilter] = useState("Todos");
  const [estadoFilter, setEstadoFilter] = useState("Todos");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = auditItems.filter((a) => {
    const matchSev = sevFilter === "Todos" || a.severidad === sevFilter;
    const matchEstado = estadoFilter === "Todos" || a.estado === estadoFilter;
    return matchSev && matchEstado;
  });

  const pendientes = auditItems.filter((a) => a.estado === "Pendiente").length;
  const altas = auditItems.filter((a) => a.severidad === "Alta" && a.estado === "Pendiente").length;
  const corregidos = auditItems.filter((a) => a.estado === "Corregido").length;
  const montoRiesgo = auditItems
    .filter((a) => a.estado === "Pendiente")
    .reduce((s, a) => s + parseInt(a.monto.replace(/[$.]/g, "")), 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Auditoría</h1>
          <p className="text-sm text-ink-muted mt-0.5">
            Pre-auditoría automática de facturas antes de presentación
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => showToast("Ejecutar auditoría — Próximamente")}
            className="px-4 py-2 text-sm font-medium border border-border rounded-[4px] text-ink-light hover:border-celeste-dark hover:text-celeste-dark transition"
          >
            Ejecutar auditoría
          </button>
          <button
            onClick={() => showToast("Aprobar seleccionados — Próximamente")}
            className="px-4 py-2 text-sm font-semibold bg-green-600 text-white rounded-[4px] hover:bg-green-700 transition"
          >
            Aprobar seleccionados
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Observaciones pendientes", value: pendientes, color: "border-gold" },
          { label: "Severidad alta", value: altas, color: "border-red-400" },
          { label: "Ya corregidos", value: corregidos, color: "border-green-400" },
          {
            label: "Monto en riesgo",
            value: `$${(montoRiesgo / 1000).toFixed(0)}K`,
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

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
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
        <span className="text-xs font-bold text-ink-muted uppercase tracking-wider ml-4">
          Estado:
        </span>
        {["Todos", "Pendiente", "Corregido", "Aprobado"].map((e) => (
          <button
            key={e}
            onClick={() => setEstadoFilter(e)}
            className={`px-3 py-1.5 text-xs rounded-[4px] transition ${estadoFilter === e ? "bg-ink text-white" : "border border-border text-ink-light hover:border-ink"}`}
          >
            {e}
          </button>
        ))}
      </div>

      {/* Audit cards */}
      <div className="space-y-3">
        {filtered.map((a) => (
          <div
            key={a.id}
            className={`bg-white border rounded-lg overflow-hidden transition ${expanded === a.id ? "border-celeste shadow-sm" : "border-border hover:border-celeste-light"}`}
          >
            <button
              onClick={() => setExpanded(expanded === a.id ? null : a.id)}
              className="w-full px-5 py-4 flex items-center gap-4 text-left"
            >
              <span
                className={`w-2 h-2 rounded-full ${a.severidad === "Alta" ? "bg-red-500" : a.severidad === "Media" ? "bg-gold" : "bg-celeste"}`}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono text-ink-muted">{a.id}</span>
                  <span
                    className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${severidadColors[a.severidad]}`}
                  >
                    {a.severidad}
                  </span>
                  <span className="text-xs font-semibold text-ink">{a.tipo}</span>
                </div>
                <div className="text-xs text-ink-light mt-0.5 truncate">
                  {a.paciente} · {a.financiador} · {a.prestacion} · {a.monto}
                </div>
              </div>
              <span
                className={`px-2 py-0.5 text-[10px] font-bold rounded ${estadoColors[a.estado]}`}
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
                <div className="grid sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-[10px] font-bold tracking-wider text-ink-muted uppercase mb-1">
                      Detalle del problema
                    </p>
                    <p className="text-xs text-ink-light leading-relaxed">{a.descripcion}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold tracking-wider text-ink-muted uppercase mb-1">
                      Sugerencia de corrección
                    </p>
                    <p className="text-xs text-celeste-dark font-medium leading-relaxed">
                      {a.sugerencia}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-4 pt-3 border-t border-border-light">
                  <Link
                    href={`/dashboard/pacientes/${a.pacienteId}`}
                    className="text-xs text-celeste-dark font-medium hover:underline"
                  >
                    Ver paciente
                  </Link>
                  <Link
                    href="/dashboard/facturacion"
                    className="text-xs text-celeste-dark font-medium hover:underline"
                  >
                    Ver factura
                  </Link>
                  <Link
                    href="/dashboard/nomenclador"
                    className="text-xs text-celeste-dark font-medium hover:underline"
                  >
                    Consultar nomenclador
                  </Link>
                  <div className="ml-auto flex gap-2">
                    {a.estado === "Pendiente" && (
                      <>
                        <button
                          onClick={() => showToast("Marcar corregido — Próximamente")}
                          className="px-3 py-1.5 text-xs font-semibold bg-green-600 text-white rounded-[4px] hover:bg-green-700 transition"
                        >
                          Marcar corregido
                        </button>
                        <button
                          onClick={() => showToast("Ignorar observación — Próximamente")}
                          className="px-3 py-1.5 text-xs font-medium border border-border text-ink-muted rounded-[4px] hover:border-red-300 hover:text-red-600 transition"
                        >
                          Ignorar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary chart */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white border border-border rounded-lg p-5">
          <h3 className="text-xs font-bold tracking-wider text-ink-muted uppercase mb-3">
            Por Tipo de Error
          </h3>
          {[
            { tipo: "Código incorrecto", count: 1, pct: 12 },
            { tipo: "Documentación faltante", count: 2, pct: 25 },
            { tipo: "Autorización vencida", count: 1, pct: 12 },
            { tipo: "Valor desactualizado", count: 1, pct: 12 },
            { tipo: "Duplicado potencial", count: 1, pct: 12 },
            { tipo: "Tope superado", count: 1, pct: 12 },
            { tipo: "Formato incorrecto", count: 1, pct: 12 },
          ].map((t) => (
            <div key={t.tipo} className="flex items-center gap-2 mb-2">
              <div className="flex-1">
                <div className="flex justify-between text-[10px] mb-0.5">
                  <span className="text-ink-light">{t.tipo}</span>
                  <span className="font-bold text-ink">{t.count}</span>
                </div>
                <div className="h-1.5 bg-border-light rounded-full overflow-hidden">
                  <div
                    className="h-full bg-celeste-dark rounded-full"
                    style={{ width: `${t.pct}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white border border-border rounded-lg p-5">
          <h3 className="text-xs font-bold tracking-wider text-ink-muted uppercase mb-3">
            Por Financiador
          </h3>
          {["PAMI", "OSDE", "Swiss Medical", "Galeno", "Medifé"].map((f) => {
            const count = auditItems.filter((a) => a.financiador.includes(f.split(" ")[0])).length;
            return (
              <div
                key={f}
                className="flex items-center justify-between py-1.5 text-xs border-b border-border-light last:border-0"
              >
                <span className="text-ink-light">{f}</span>
                <span className="font-bold text-ink">{count}</span>
              </div>
            );
          })}
        </div>
        <div className="bg-celeste-pale/40 border border-border rounded-lg p-5">
          <h3 className="text-xs font-bold tracking-wider text-celeste-dark uppercase mb-3">
            Impacto Estimado
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-[10px] text-ink-muted">Rechazos evitados (estimado)</p>
              <p className="text-lg font-bold text-green-600">$173.400</p>
            </div>
            <div>
              <p className="text-[10px] text-ink-muted">Tasa de corrección previa</p>
              <p className="text-lg font-bold text-ink">87%</p>
            </div>
            <div>
              <p className="text-[10px] text-ink-muted">Ahorro acumulado Q1 2026</p>
              <p className="text-lg font-bold text-celeste-dark">$1.2M</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

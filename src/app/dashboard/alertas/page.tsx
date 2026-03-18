"use client";
import { useState } from "react";
import Link from "next/link";
import { useToast } from "@/components/Toast";
import { useDemoAction } from "@/components/DemoModal";

interface Alerta {
  id: string;
  titulo: string;
  descripcion: string;
  categoria: "Pagos" | "Rechazos" | "Aranceles" | "Sistema" | "Vencimientos" | "Inventario";
  prioridad: "Urgente" | "Alta" | "Media" | "Baja";
  fecha: string;
  leida: boolean;
  accionUrl?: string;
  accionLabel?: string;
}

const alertas: Alerta[] = [
  {
    id: "ALR-001",
    titulo: "Pago recibido — OSDE",
    descripcion:
      "Se acreditó el pago de OSDE correspondiente al período enero 2026 por $1.245.800.",
    categoria: "Pagos",
    prioridad: "Media",
    fecha: "07/03/2026 15:42",
    leida: false,
    accionUrl: "/dashboard/financiadores",
    accionLabel: "Ver financiadores",
  },
  {
    id: "ALR-002",
    titulo: "3 rechazos nuevos — PAMI",
    descripcion:
      "Se detectaron 3 nuevos rechazos en la última presentación de PAMI. Motivo principal: documentación faltante.",
    categoria: "Rechazos",
    prioridad: "Alta",
    fecha: "07/03/2026 10:15",
    leida: false,
    accionUrl: "/dashboard/rechazos",
    accionLabel: "Ver rechazos",
  },
  {
    id: "ALR-003",
    titulo: "Actualización arancelaria — Swiss Medical",
    descripcion:
      "Swiss Medical publicó nuevos aranceles vigentes desde 01/03/2026. Incremento promedio: 12.5%.",
    categoria: "Aranceles",
    prioridad: "Alta",
    fecha: "06/03/2026 09:00",
    leida: false,
    accionUrl: "/dashboard/nomenclador",
    accionLabel: "Ver nomenclador",
  },
  {
    id: "ALR-004",
    titulo: "Stock crítico — Guantes nitrilo M",
    descripcion:
      "El stock de guantes nitrilo talle M está por debajo del mínimo (5 cajas de 15 requeridas).",
    categoria: "Inventario",
    prioridad: "Urgente",
    fecha: "06/03/2026 08:30",
    leida: false,
    accionUrl: "/dashboard/inventario",
    accionLabel: "Ver inventario",
  },
  {
    id: "ALR-005",
    titulo: "Stock crítico — Tiras reactivas glucemia",
    descripcion:
      "Solo quedan 3 cajas de tiras reactivas (mínimo: 10). Vencimiento cercano: 06/2026.",
    categoria: "Inventario",
    prioridad: "Urgente",
    fecha: "06/03/2026 08:30",
    leida: true,
    accionUrl: "/dashboard/inventario",
    accionLabel: "Ver inventario",
  },
  {
    id: "ALR-006",
    titulo: "Vencimiento de autorización — Holter (Ramírez)",
    descripcion:
      "La autorización de Swiss Medical para Holter 24hs de Sofía Ramírez vence el 28/02. Renovar antes de presentar.",
    categoria: "Vencimientos",
    prioridad: "Alta",
    fecha: "05/03/2026 14:20",
    leida: true,
    accionUrl: "/dashboard/auditoria",
    accionLabel: "Ver auditoría",
  },
  {
    id: "ALR-007",
    titulo: "Backup del sistema completado",
    descripcion:
      "El backup diario del sistema se completó exitosamente a las 03:00. Tamaño: 2.4GB.",
    categoria: "Sistema",
    prioridad: "Baja",
    fecha: "07/03/2026 03:05",
    leida: true,
  },
  {
    id: "ALR-008",
    titulo: "Nuevo arancel PAMI — Resolución 2024/2026",
    descripcion:
      "Se publicó la Resolución 2024/2026 con actualización de aranceles PAMI vigente desde 01/03/2026.",
    categoria: "Aranceles",
    prioridad: "Alta",
    fecha: "04/03/2026 11:00",
    leida: true,
    accionUrl: "/dashboard/nomenclador",
    accionLabel: "Ver nomenclador",
  },
  {
    id: "ALR-009",
    titulo: "Demora en pago — Galeno",
    descripcion:
      "El pago de Galeno correspondiente a enero 2026 supera los 90 días. Monto pendiente: $342.600.",
    categoria: "Pagos",
    prioridad: "Urgente",
    fecha: "03/03/2026 09:00",
    leida: true,
    accionUrl: "/dashboard/financiadores",
    accionLabel: "Ver financiadores",
  },
  {
    id: "ALR-010",
    titulo: "Presentación vence mañana — IOMA",
    descripcion:
      "La fecha límite de presentación del período febrero 2026 para IOMA es el 10/03/2026.",
    categoria: "Vencimientos",
    prioridad: "Alta",
    fecha: "09/03/2026 08:00",
    leida: false,
    accionUrl: "/dashboard/facturacion",
    accionLabel: "Ver facturación",
  },
];

const categoriaColors: Record<string, string> = {
  Pagos: "bg-green-100 text-green-700",
  Rechazos: "bg-red-100 text-red-600",
  Aranceles: "bg-celeste-100 text-celeste-700",
  Sistema: "bg-gray-100 text-gray-600",
  Vencimientos: "bg-gold-100 text-gold-700",
  Inventario: "bg-amber-100 text-amber-700",
};

const prioridadColors: Record<string, string> = {
  Urgente: "bg-red-50 text-red-600 border-red-200",
  Alta: "bg-gold-pale text-[#B8860B] border-gold",
  Media: "bg-celeste-pale text-celeste-dark border-celeste",
  Baja: "bg-border-light text-ink-muted border-border",
};

export default function AlertasPage() {
  const { showToast } = useToast();
  const { showDemo } = useDemoAction();
  const [catFilter, setCatFilter] = useState("Todas");
  const [soloNoLeidas, setSoloNoLeidas] = useState(false);

  const categorias = [
    "Todas",
    "Pagos",
    "Rechazos",
    "Aranceles",
    "Inventario",
    "Vencimientos",
    "Sistema",
  ];

  const filtered = alertas.filter((a) => {
    const matchCat = catFilter === "Todas" || a.categoria === catFilter;
    const matchLeida = !soloNoLeidas || !a.leida;
    return matchCat && matchLeida;
  });

  const noLeidas = alertas.filter((a) => !a.leida).length;
  const urgentes = alertas.filter((a) => a.prioridad === "Urgente" && !a.leida).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Alertas</h1>
          <p className="text-sm text-ink-muted mt-0.5">
            {noLeidas} sin leer · {urgentes} urgente{urgentes !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setSoloNoLeidas(!soloNoLeidas)}
            className={`px-4 py-2 text-sm rounded-[4px] font-medium transition ${soloNoLeidas ? "bg-celeste-dark text-white" : "border border-border text-ink-light hover:border-celeste-dark"}`}
          >
            {soloNoLeidas ? "Solo no leidas (activo)" : "Solo no leidas"}
          </button>
          <button
            onClick={() => showDemo("Marcar todas leídas")}
            className="px-4 py-2 text-sm font-medium border border-border rounded-[4px] text-ink-light hover:border-celeste-dark hover:text-celeste-dark transition"
          >
            Marcar todas leídas
          </button>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2">
        {categorias.map((c) => {
          const count =
            c === "Todas"
              ? alertas.filter((a) => !a.leida).length
              : alertas.filter((a) => a.categoria === c && !a.leida).length;
          return (
            <button
              key={c}
              onClick={() => setCatFilter(c)}
              className={`px-4 py-2 text-xs rounded-[4px] font-medium transition flex items-center gap-1.5 ${catFilter === c ? "bg-ink text-white" : "border border-border text-ink-light hover:border-ink"}`}
            >
              {c !== "Todas" && (
                <span
                  className={`w-2 h-2 rounded-full inline-block ${categoriaColors[c]?.split(" ")[0] || "bg-gray-200"}`}
                />
              )}
              {c}
              {count > 0 && (
                <span
                  className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${catFilter === c ? "bg-white/20 text-white" : "bg-red-500 text-white"}`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Alert list */}
      <div className="space-y-2">
        {filtered.map((a) => (
          <div
            key={a.id}
            className={`border rounded-lg p-4 transition ${a.leida ? "bg-white border-border" : "bg-celeste-pale/20 border-celeste-light"} hover:shadow-sm`}
          >
            <div className="flex items-start gap-3">
              <span
                className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${categoriaColors[a.categoria] || "bg-gray-100 text-gray-600"}`}
              >
                {a.categoria}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  {!a.leida && <span className="w-2 h-2 bg-celeste-dark rounded-full" />}
                  <span
                    className={`px-1.5 py-0.5 text-[10px] font-bold rounded border ${prioridadColors[a.prioridad]}`}
                  >
                    {a.prioridad}
                  </span>
                  <span className="text-xs font-bold text-ink">{a.titulo}</span>
                </div>
                <p className="text-xs text-ink-light leading-relaxed">{a.descripcion}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[10px] text-ink-muted">{a.fecha}</span>
                  {a.accionUrl && (
                    <Link
                      href={a.accionUrl}
                      className="text-[10px] text-celeste-dark font-semibold hover:underline"
                    >
                      {a.accionLabel}
                    </Link>
                  )}
                </div>
              </div>
              <button
                onClick={() => showDemo("Descartar alerta")}
                className="text-ink-muted hover:text-ink text-xs p-1"
                aria-label="Descartar alerta"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-ink-muted">
          <div className="flex justify-center mb-2">
            <svg
              className="w-8 h-8 text-ink-muted"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
              />
            </svg>
          </div>
          <p className="text-sm">No hay alertas que coincidan con los filtros</p>
        </div>
      )}
    </div>
  );
}

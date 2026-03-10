"use client";
import { useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  XCircle,
  Building2,
  TrendingUp,
  Users,
  Timer,
  Search,
  Package,
  Calendar,
  Target,
} from "lucide-react";

const reportIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  R01: BarChart3,
  R02: XCircle,
  R03: Building2,
  R04: TrendingUp,
  R05: Users,
  R06: Timer,
  R07: Search,
  R08: Package,
  R09: Calendar,
  R10: Target,
};

const reportes = [
  {
    id: "R01",
    nombre: "Facturacion Mensual",
    descripcion: "Resumen de facturacion por financiador con desglose de prestaciones",
    categoria: "Finanzas",
    frecuencia: "Mensual",
    ultimaGen: "01/03/2026",
    link: "/dashboard/facturacion",
  },
  {
    id: "R02",
    nombre: "Analisis de Rechazos",
    descripcion: "Motivos de rechazo, tendencias y tasa por financiador",
    categoria: "Finanzas",
    frecuencia: "Semanal",
    ultimaGen: "05/03/2026",
    link: "/dashboard/rechazos",
  },
  {
    id: "R03",
    nombre: "Rendimiento Financiadores",
    descripcion: "Comparacion de financiadores por cobro, plazos y cartera",
    categoria: "Finanzas",
    frecuencia: "Mensual",
    ultimaGen: "01/03/2026",
    link: "/dashboard/financiadores",
  },
  {
    id: "R04",
    nombre: "Impacto Inflacionario",
    descripcion: "Desfasaje arancelario vs IPC, perdida real acumulada",
    categoria: "Finanzas",
    frecuencia: "Mensual",
    ultimaGen: "01/03/2026",
    link: "/dashboard/inflacion",
  },
  {
    id: "R05",
    nombre: "Pacientes Activos",
    descripcion: "Demografia, cobertura, frecuencia de atencion, retencion",
    categoria: "Gestion Clinica",
    frecuencia: "Mensual",
    ultimaGen: "01/03/2026",
    link: "/dashboard/pacientes",
  },
  {
    id: "R06",
    nombre: "Productividad Profesionales",
    descripcion: "Atenciones por profesional, horas trabajadas, facturacion generada",
    categoria: "Gestion Clinica",
    frecuencia: "Quincenal",
    ultimaGen: "28/02/2026",
    link: "/dashboard/agenda",
  },
  {
    id: "R07",
    nombre: "Auditoria Pre-Presentacion",
    descripcion: "Errores detectados, tasa de correccion, ahorro estimado",
    categoria: "Calidad",
    frecuencia: "Semanal",
    ultimaGen: "05/03/2026",
    link: "/dashboard/auditoria",
  },
  {
    id: "R08",
    nombre: "Inventario & Consumo",
    descripcion: "Stock actual, consumo mensual, alertas de reposicion",
    categoria: "Operaciones",
    frecuencia: "Semanal",
    ultimaGen: "03/03/2026",
    link: "/dashboard/inventario",
  },
  {
    id: "R09",
    nombre: "Ocupacion de Agenda",
    descripcion: "Tasa de ocupacion, cancelaciones, tiempos de espera",
    categoria: "Operaciones",
    frecuencia: "Diario",
    ultimaGen: "07/03/2026",
    link: "/dashboard/agenda",
  },
  {
    id: "R10",
    nombre: "Indicadores KPI Ejecutivo",
    descripcion: "Dashboard ejecutivo con todos los KPIs clave de la clinica",
    categoria: "Ejecutivo",
    frecuencia: "Mensual",
    ultimaGen: "01/03/2026",
    link: "/dashboard",
  },
];

const categorias = ["Todos", "Finanzas", "Gestion Clinica", "Calidad", "Operaciones", "Ejecutivo"];

const historialGeneraciones = [
  {
    fecha: "07/03/2026 14:32",
    reporte: "Ocupación de Agenda",
    formato: "PDF",
    usuario: "Dr. Rodríguez",
    estado: "Completado",
  },
  {
    fecha: "05/03/2026 10:15",
    reporte: "Análisis de Rechazos",
    formato: "Excel",
    usuario: "Adm. García",
    estado: "Completado",
  },
  {
    fecha: "05/03/2026 09:45",
    reporte: "Auditoría Pre-Presentación",
    formato: "PDF",
    usuario: "Adm. García",
    estado: "Completado",
  },
  {
    fecha: "03/03/2026 16:20",
    reporte: "Inventario & Consumo",
    formato: "PDF",
    usuario: "Enf. López",
    estado: "Completado",
  },
  {
    fecha: "01/03/2026 08:00",
    reporte: "Indicadores KPI Ejecutivo",
    formato: "PDF",
    usuario: "Dr. Rodríguez",
    estado: "Completado",
  },
  {
    fecha: "01/03/2026 08:00",
    reporte: "Facturación Mensual",
    formato: "Excel",
    usuario: "Adm. García",
    estado: "Completado",
  },
];

export default function ReportesPage() {
  const [catFilter, setCatFilter] = useState("Todos");
  const [dateRange, setDateRange] = useState("Marzo 2026");

  const filtered =
    catFilter === "Todos" ? reportes : reportes.filter((r) => r.categoria === catFilter);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Reportes</h1>
          <p className="text-sm text-ink-muted mt-0.5">
            Reportes predefinidos y herramientas de exportación
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 text-sm border border-border rounded-[4px] outline-none focus:border-celeste-dark transition bg-white text-ink"
          >
            <option>Marzo 2026</option>
            <option>Febrero 2026</option>
            <option>Enero 2026</option>
            <option>Q1 2026</option>
            <option>2025 Anual</option>
          </select>
          <button className="px-4 py-2 text-sm font-semibold bg-celeste-dark text-white rounded-[4px] hover:bg-celeste transition">
            Generar todos
          </button>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2">
        {categorias.map((c) => (
          <button
            key={c}
            onClick={() => setCatFilter(c)}
            className={`px-4 py-2 text-xs rounded-[4px] font-medium transition ${catFilter === c ? "bg-ink text-white" : "border border-border text-ink-light hover:border-ink"}`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Report grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((r) => (
          <div
            key={r.id}
            className="bg-white border border-border rounded-lg p-5 hover:shadow-md hover:-translate-y-0.5 transition group"
          >
            <div className="flex items-start justify-between mb-3">
              {(() => {
                const I = reportIconMap[r.id];
                return I ? <I className="w-6 h-6 text-celeste-dark" /> : null;
              })()}
              <span className="px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase rounded bg-celeste-pale text-celeste-dark">
                {r.categoria}
              </span>
            </div>
            <h3 className="text-sm font-bold text-ink mb-1">{r.nombre}</h3>
            <p className="text-xs text-ink-muted leading-relaxed mb-4">{r.descripcion}</p>
            <div className="flex items-center justify-between text-[10px] text-ink-muted mb-3">
              <span>Frecuencia: {r.frecuencia}</span>
              <span>Último: {r.ultimaGen}</span>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 px-3 py-2 text-xs font-semibold bg-celeste-dark text-white rounded-[4px] hover:bg-celeste transition">
                Generar PDF
              </button>
              <button className="flex-1 px-3 py-2 text-xs font-semibold border border-border text-ink-light rounded-[4px] hover:border-celeste-dark hover:text-celeste-dark transition">
                Excel
              </button>
              <Link
                href={r.link}
                className="px-3 py-2 text-xs font-medium text-celeste-dark hover:underline flex items-center"
              >
                Ver
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Generation history */}
      <div className="bg-white border border-border rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-xs font-bold tracking-wider text-ink-muted uppercase">
            Historial de Generaciones
          </h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F8FAFB] text-[10px] font-bold tracking-wider text-ink-muted uppercase">
              <th className="text-left px-5 py-2.5">Fecha</th>
              <th className="text-left px-5 py-2.5">Reporte</th>
              <th className="text-center px-5 py-2.5">Formato</th>
              <th className="text-left px-5 py-2.5">Usuario</th>
              <th className="text-center px-5 py-2.5">Estado</th>
              <th className="text-right px-5 py-2.5">Acción</th>
            </tr>
          </thead>
          <tbody>
            {historialGeneraciones.map((h, i) => (
              <tr
                key={i}
                className="border-t border-border-light hover:bg-celeste-pale/30 transition"
              >
                <td className="px-5 py-3 font-mono text-[10px] text-ink-muted">{h.fecha}</td>
                <td className="px-5 py-3 text-xs font-semibold text-ink">{h.reporte}</td>
                <td className="px-5 py-3 text-center">
                  <span
                    className={`px-2 py-0.5 text-[9px] font-bold rounded ${h.formato === "PDF" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"}`}
                  >
                    {h.formato}
                  </span>
                </td>
                <td className="px-5 py-3 text-xs text-ink-light">{h.usuario}</td>
                <td className="px-5 py-3 text-center">
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-green-50 text-green-700">
                    {h.estado}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <button className="text-xs text-celeste-dark font-medium hover:underline">
                    Descargar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

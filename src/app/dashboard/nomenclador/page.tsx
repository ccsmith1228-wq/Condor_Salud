"use client";
import { useState } from "react";
import { useToast } from "@/components/Toast";

interface Prestacion {
  codigo: string;
  descripcion: string;
  modulo: string;
  valorSSS: string;
  valorPAMI: string;
  valorOSDE: string;
  valorSwiss: string;
  capitulo: string;
  vigente: boolean;
}

const nomenclador: Prestacion[] = [
  {
    codigo: "420101",
    descripcion: "Consulta médica en consultorio",
    modulo: "Módulo 1",
    valorSSS: "$12.500",
    valorPAMI: "$10.800",
    valorOSDE: "$18.200",
    valorSwiss: "$17.500",
    capitulo: "Consultas",
    vigente: true,
  },
  {
    codigo: "420201",
    descripcion: "Consulta médica domiciliaria",
    modulo: "Módulo 1",
    valorSSS: "$18.000",
    valorPAMI: "$15.200",
    valorOSDE: "$24.600",
    valorSwiss: "$23.800",
    capitulo: "Consultas",
    vigente: true,
  },
  {
    codigo: "420301",
    descripcion: "Interconsulta especializada",
    modulo: "Módulo 1",
    valorSSS: "$15.800",
    valorPAMI: "$13.400",
    valorOSDE: "$22.100",
    valorSwiss: "$21.000",
    capitulo: "Consultas",
    vigente: true,
  },
  {
    codigo: "660101",
    descripcion: "Hemograma completo",
    modulo: "Módulo 6",
    valorSSS: "$8.200",
    valorPAMI: "$7.100",
    valorOSDE: "$12.500",
    valorSwiss: "$11.800",
    capitulo: "Laboratorio",
    vigente: true,
  },
  {
    codigo: "660201",
    descripcion: "Perfil tiroideo (TSH + T3 + T4)",
    modulo: "Módulo 6",
    valorSSS: "$22.400",
    valorPAMI: "$19.200",
    valorOSDE: "$32.000",
    valorSwiss: "$30.500",
    capitulo: "Laboratorio",
    vigente: true,
  },
  {
    codigo: "660301",
    descripcion: "Glucemia",
    modulo: "Módulo 6",
    valorSSS: "$3.800",
    valorPAMI: "$3.200",
    valorOSDE: "$5.600",
    valorSwiss: "$5.200",
    capitulo: "Laboratorio",
    vigente: true,
  },
  {
    codigo: "660401",
    descripcion: "HbA1c (hemoglobina glicosilada)",
    modulo: "Módulo 6",
    valorSSS: "$14.200",
    valorPAMI: "$12.100",
    valorOSDE: "$20.800",
    valorSwiss: "$19.500",
    capitulo: "Laboratorio",
    vigente: true,
  },
  {
    codigo: "660501",
    descripcion: "Perfil lipídico completo",
    modulo: "Módulo 6",
    valorSSS: "$16.500",
    valorPAMI: "$14.200",
    valorOSDE: "$24.200",
    valorSwiss: "$22.800",
    capitulo: "Laboratorio",
    vigente: true,
  },
  {
    codigo: "810101",
    descripcion: "Ecografía abdominal",
    modulo: "Módulo 8",
    valorSSS: "$28.500",
    valorPAMI: "$24.600",
    valorOSDE: "$42.000",
    valorSwiss: "$40.200",
    capitulo: "Diagnóstico por Imágenes",
    vigente: true,
  },
  {
    codigo: "810201",
    descripcion: "Ecografía renal y de vías urinarias",
    modulo: "Módulo 8",
    valorSSS: "$26.200",
    valorPAMI: "$22.500",
    valorOSDE: "$38.800",
    valorSwiss: "$37.000",
    capitulo: "Diagnóstico por Imágenes",
    vigente: true,
  },
  {
    codigo: "810301",
    descripcion: "Ecografía tiroidea",
    modulo: "Módulo 8",
    valorSSS: "$25.800",
    valorPAMI: "$22.100",
    valorOSDE: "$38.200",
    valorSwiss: "$36.500",
    capitulo: "Diagnóstico por Imágenes",
    vigente: true,
  },
  {
    codigo: "420401",
    descripcion: "Electrocardiograma (ECG)",
    modulo: "Módulo 4",
    valorSSS: "$16.800",
    valorPAMI: "$14.400",
    valorOSDE: "$25.200",
    valorSwiss: "$24.000",
    capitulo: "Cardiología",
    vigente: true,
  },
  {
    codigo: "420501",
    descripcion: "Holter 24hs",
    modulo: "Módulo 4",
    valorSSS: "$45.200",
    valorPAMI: "$38.800",
    valorOSDE: "$68.000",
    valorSwiss: "$65.000",
    capitulo: "Cardiología",
    vigente: true,
  },
  {
    codigo: "420601",
    descripcion: "Ergometría (PEG)",
    modulo: "Módulo 4",
    valorSSS: "$38.500",
    valorPAMI: "$33.200",
    valorOSDE: "$58.000",
    valorSwiss: "$55.000",
    capitulo: "Cardiología",
    vigente: true,
  },
  {
    codigo: "930101",
    descripcion: "Sesión de kinesiología",
    modulo: "Módulo 9",
    valorSSS: "$10.200",
    valorPAMI: "$8.800",
    valorOSDE: "$15.600",
    valorSwiss: "$14.800",
    capitulo: "Rehabilitación",
    vigente: true,
  },
  {
    codigo: "930201",
    descripcion: "Sesión de fonoaudiología",
    modulo: "Módulo 9",
    valorSSS: "$10.800",
    valorPAMI: "$9.200",
    valorOSDE: "$16.200",
    valorSwiss: "$15.400",
    capitulo: "Rehabilitación",
    vigente: true,
  },
  {
    codigo: "510101",
    descripcion: "Cirugía menor ambulatoria",
    modulo: "Módulo 5",
    valorSSS: "$52.000",
    valorPAMI: "$44.800",
    valorOSDE: "$78.000",
    valorSwiss: "$75.000",
    capitulo: "Cirugías",
    vigente: true,
  },
  {
    codigo: "420102",
    descripcion: "Consulta médica pediátrica",
    modulo: "Módulo 1",
    valorSSS: "$13.200",
    valorPAMI: "$11.400",
    valorOSDE: "$19.800",
    valorSwiss: "$18.500",
    capitulo: "Consultas",
    vigente: true,
  },
];

const capitulos = ["Todos", ...Array.from(new Set(nomenclador.map((p) => p.capitulo)))];

export default function NomencladorPage() {
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [capFilter, setCapFilter] = useState("Todos");
  const [comparar, setComparar] = useState(false);

  const filtered = nomenclador.filter((p) => {
    const matchSearch =
      p.codigo.includes(search) || p.descripcion.toLowerCase().includes(search.toLowerCase());
    const matchCap = capFilter === "Todos" || p.capitulo === capFilter;
    return matchSearch && matchCap;
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Nomenclador</h1>
          <p className="text-sm text-ink-muted mt-0.5">
            Códigos SSS / PAMI — Valores actualizados marzo 2026
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setComparar(!comparar)}
            className={`px-4 py-2 text-sm rounded-[4px] font-medium transition ${comparar ? "bg-celeste-dark text-white" : "border border-border text-ink-light hover:border-celeste-dark"}`}
          >
            {comparar ? "Comparar financiadores (activo)" : "Comparar financiadores"}
          </button>
          <button
            onClick={() => showToast("Exportar Excel — Próximamente")}
            className="px-4 py-2 text-sm font-medium border border-border rounded-[4px] text-ink-light hover:border-celeste-dark hover:text-celeste-dark transition"
          >
            Exportar Excel
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total prestaciones", value: nomenclador.length, color: "border-celeste" },
          { label: "Capítulos", value: capitulos.length - 1, color: "border-gold" },
          {
            label: "Valor medio SSS",
            value: `$${Math.round(nomenclador.reduce((s, p) => s + parseInt(p.valorSSS.replace(/[$.]/g, "")), 0) / nomenclador.length / 100) / 10}K`,
            color: "border-green-400",
          },
          { label: "Última actualización", value: "01/03/2026", color: "border-celeste" },
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
        <input
          type="text"
          placeholder="Buscar por código o descripción..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-80 px-4 py-2 text-sm border border-border rounded-[4px] outline-none focus:border-celeste-dark transition"
        />
        <select
          value={capFilter}
          onChange={(e) => setCapFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-border rounded-[4px] outline-none focus:border-celeste-dark transition bg-white text-ink"
        >
          {capitulos.map((c) => (
            <option key={c} value={c}>
              {c === "Todos" ? "Todos los capítulos" : c}
            </option>
          ))}
        </select>
        <span className="text-xs text-ink-muted ml-auto">
          {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <div className="bg-white border border-border rounded-lg overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead>
            <tr className="bg-[#F8FAFB] text-[10px] font-bold tracking-wider text-ink-muted uppercase">
              <th className="text-left px-5 py-2.5">Código</th>
              <th className="text-left px-5 py-2.5">Prestación</th>
              <th className="text-left px-5 py-2.5">Capítulo</th>
              <th className="text-left px-5 py-2.5">Módulo</th>
              <th className="text-right px-5 py-2.5">Valor SSS</th>
              <th className="text-right px-5 py-2.5">Valor PAMI</th>
              {comparar && <th className="text-right px-5 py-2.5">OSDE</th>}
              {comparar && <th className="text-right px-5 py-2.5">Swiss Med.</th>}
              {comparar && <th className="text-right px-5 py-2.5">Δ PAMI vs SSS</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const sss = parseInt(p.valorSSS.replace(/[$.]/g, ""));
              const pami = parseInt(p.valorPAMI.replace(/[$.]/g, ""));
              const diff = Math.round(((pami - sss) / sss) * 100);
              return (
                <tr
                  key={p.codigo}
                  className="border-t border-border-light hover:bg-celeste-pale/30 transition cursor-pointer"
                >
                  <td className="px-5 py-3 font-mono text-xs font-bold text-celeste-dark">
                    {p.codigo}
                  </td>
                  <td className="px-5 py-3 text-xs font-semibold text-ink">{p.descripcion}</td>
                  <td className="px-5 py-3 text-xs text-ink-light">{p.capitulo}</td>
                  <td className="px-5 py-3 text-xs text-ink-muted">{p.modulo}</td>
                  <td className="px-5 py-3 text-right text-xs font-bold text-ink">{p.valorSSS}</td>
                  <td className="px-5 py-3 text-right text-xs font-bold text-celeste-dark">
                    {p.valorPAMI}
                  </td>
                  {comparar && (
                    <td className="px-5 py-3 text-right text-xs text-ink">{p.valorOSDE}</td>
                  )}
                  {comparar && (
                    <td className="px-5 py-3 text-right text-xs text-ink">{p.valorSwiss}</td>
                  )}
                  {comparar && (
                    <td
                      className={`px-5 py-3 text-right text-xs font-bold ${diff < 0 ? "text-red-600" : "text-green-600"}`}
                    >
                      {diff > 0 ? "+" : ""}
                      {diff}%
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Quick reference */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-celeste-pale/40 border border-border rounded-lg p-5">
          <h3 className="text-xs font-bold tracking-wider text-celeste-dark uppercase mb-3">
            Referencia Rápida — Módulos SSS
          </h3>
          <div className="space-y-2 text-xs">
            {[
              { mod: "Módulo 1", desc: "Consultas médicas" },
              { mod: "Módulo 4", desc: "Cardiología / Diagnóstico" },
              { mod: "Módulo 5", desc: "Cirugías" },
              { mod: "Módulo 6", desc: "Laboratorio" },
              { mod: "Módulo 8", desc: "Diagnóstico por imágenes" },
              { mod: "Módulo 9", desc: "Rehabilitación" },
            ].map((m) => (
              <div key={m.mod} className="flex items-center gap-2">
                <span className="font-mono font-bold text-celeste-dark w-20">{m.mod}</span>
                <span className="text-ink-light">{m.desc}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-gold-pale/40 border border-border rounded-lg p-5">
          <h3 className="text-xs font-bold tracking-wider text-[#B8860B] uppercase mb-3">
            Notas Importantes
          </h3>
          <ul className="space-y-2 text-xs text-ink-light">
            <li>• Los valores PAMI se actualizan por Resolución trimestral</li>
            <li>• Valores SSS según Nomenclador Nacional vigente (Res. 2024/2026)</li>
            <li>• OSDE y Swiss Medical son valores convenio directo (pueden variar por plan)</li>
            <li>• Para prestaciones no listadas, consultar con Auditoría</li>
            <li>• Las diferencias PAMI vs SSS suelen oscilar entre -12% y -18%</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

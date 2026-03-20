"use client";
import { useState } from "react";
import { useToast } from "@/components/Toast";
import { useDemoAction } from "@/components/DemoModal";
import { useExport } from "@/lib/services/export";
import { useNomencladorEntries } from "@/hooks/use-data";
import { formatCurrency } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export default function NomencladorPage() {
  const { showToast } = useToast();
  const { showDemo } = useDemoAction();
  const { exportExcel, isExporting } = useExport();
  const { data: nomenclador = [], isLoading } = useNomencladorEntries();
  const [search, setSearch] = useState("");
  const [capFilter, setCapFilter] = useState("Todos");
  const [comparar, setComparar] = useState(false);

  const capitulos = [
    "Todos",
    ...Array.from(new Set(nomenclador.map((p: any) => p.capitulo as string))),
  ];

  const filtered = nomenclador.filter((p) => {
    const matchSearch =
      p.codigo.includes(search) || p.descripcion.toLowerCase().includes(search.toLowerCase());
    const matchCap = capFilter === "Todos" || p.capitulo === capFilter;
    return matchSearch && matchCap;
  });

  return (
    <div className="space-y-5">
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-celeste" />
          <span className="ml-2 text-sm text-ink-muted">Cargando nomenclador...</span>
        </div>
      )}
      {!isLoading && (
        <>
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
                onClick={() => exportExcel("nomenclador")}
                disabled={isExporting}
                className="px-4 py-2 text-sm font-medium border border-border rounded-[4px] text-ink-light hover:border-celeste-dark hover:text-celeste-dark transition disabled:opacity-50"
              >
                {isExporting ? "Exportando..." : "Exportar Excel"}
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
                value: nomenclador.length
                  ? `$${Math.round(nomenclador.reduce((s, p: any) => s + p.valorSSS, 0) / nomenclador.length / 100) / 10}K`
                  : "—",
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
              aria-label="Buscar por código o descripción"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-80 px-4 py-2 text-sm border border-border rounded-[4px] outline-none focus:border-celeste-dark transition"
            />
            <select
              value={capFilter}
              onChange={(e) => setCapFilter(e.target.value)}
              aria-label="Filtrar por capítulo"
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
                  <th scope="col" className="text-left px-5 py-2.5">
                    Código
                  </th>
                  <th scope="col" className="text-left px-5 py-2.5">
                    Prestación
                  </th>
                  <th scope="col" className="text-left px-5 py-2.5">
                    Capítulo
                  </th>
                  <th scope="col" className="text-left px-5 py-2.5">
                    Módulo
                  </th>
                  <th scope="col" className="text-right px-5 py-2.5">
                    Valor SSS
                  </th>
                  <th scope="col" className="text-right px-5 py-2.5">
                    Valor PAMI
                  </th>
                  {comparar && (
                    <th scope="col" className="text-right px-5 py-2.5">
                      OSDE
                    </th>
                  )}
                  {comparar && (
                    <th scope="col" className="text-right px-5 py-2.5">
                      Swiss Med.
                    </th>
                  )}
                  {comparar && (
                    <th scope="col" className="text-right px-5 py-2.5">
                      Δ PAMI vs SSS
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const sss = (p as any).valorSSS as number;
                  const pami = (p as any).valorPAMI as number;
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
                      <td className="px-5 py-3 text-right text-xs font-bold text-ink">
                        {formatCurrency((p as any).valorSSS)}
                      </td>
                      <td className="px-5 py-3 text-right text-xs font-bold text-celeste-dark">
                        {formatCurrency((p as any).valorPAMI)}
                      </td>
                      {comparar && (
                        <td className="px-5 py-3 text-right text-xs text-ink">
                          {formatCurrency((p as any).valorOSDE)}
                        </td>
                      )}
                      {comparar && (
                        <td className="px-5 py-3 text-right text-xs text-ink">
                          {formatCurrency((p as any).valorSwiss)}
                        </td>
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
                <li>
                  • OSDE y Swiss Medical son valores convenio directo (pueden variar por plan)
                </li>
                <li>• Para prestaciones no listadas, consultar con Auditoría</li>
                <li>• Las diferencias PAMI vs SSS suelen oscilar entre -12% y -18%</li>
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

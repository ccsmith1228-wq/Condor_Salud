import type { Financiador, FinanciadorType } from "@/lib/types";

const financiadores: (Financiador & { contacto: string; ultimaLiquidacion: string })[] = [
  {
    id: "1",
    name: "PAMI",
    type: "pami",
    facturado: 1400000,
    cobrado: 980000,
    tasaRechazo: 12,
    diasPromedioPago: 68,
    facturasPendientes: 23,
    ultimoPago: "2026-02-28",
    contacto: "delegacion.caba@pami.gob.ar",
    ultimaLiquidacion: "Febrero 2026",
  },
  {
    id: "2",
    name: "OSDE",
    type: "prepaga",
    facturado: 890000,
    cobrado: 845000,
    tasaRechazo: 4,
    diasPromedioPago: 32,
    facturasPendientes: 8,
    ultimoPago: "2026-03-05",
    contacto: "prestadores@osde.com.ar",
    ultimaLiquidacion: "Marzo 2026",
  },
  {
    id: "3",
    name: "Swiss Medical",
    type: "prepaga",
    facturado: 620000,
    cobrado: 595000,
    tasaRechazo: 2,
    diasPromedioPago: 28,
    facturasPendientes: 5,
    ultimoPago: "2026-03-07",
    contacto: "prestadores@swissmedical.com.ar",
    ultimaLiquidacion: "Marzo 2026",
  },
  {
    id: "4",
    name: "IOMA",
    type: "os",
    facturado: 410000,
    cobrado: 312000,
    tasaRechazo: 18,
    diasPromedioPago: 82,
    facturasPendientes: 31,
    ultimoPago: "2026-01-15",
    contacto: "prestadores@ioma.gba.gov.ar",
    ultimaLiquidacion: "Enero 2026",
  },
  {
    id: "5",
    name: "Galeno",
    type: "prepaga",
    facturado: 280000,
    cobrado: 268000,
    tasaRechazo: 3,
    diasPromedioPago: 35,
    facturasPendientes: 4,
    ultimoPago: "2026-03-02",
    contacto: "admin@galeno.com.ar",
    ultimaLiquidacion: "Marzo 2026",
  },
  {
    id: "6",
    name: "Medifé",
    type: "prepaga",
    facturado: 195000,
    cobrado: 178000,
    tasaRechazo: 5,
    diasPromedioPago: 38,
    facturasPendientes: 6,
    ultimoPago: "2026-02-25",
    contacto: "prestadores@medife.com.ar",
    ultimaLiquidacion: "Febrero 2026",
  },
  {
    id: "7",
    name: "Obra Social Bancaria",
    type: "os",
    facturado: 150000,
    cobrado: 128000,
    tasaRechazo: 8,
    diasPromedioPago: 55,
    facturasPendientes: 12,
    ultimoPago: "2026-02-10",
    contacto: "salud@osbancaria.com.ar",
    ultimaLiquidacion: "Febrero 2026",
  },
];

const typeLabels: Record<FinanciadorType, { label: string; bg: string; text: string }> = {
  pami: { label: "PAMI", bg: "bg-celeste-pale", text: "text-celeste-dark" },
  os: { label: "Obra Social", bg: "bg-celeste-pale", text: "text-celeste-dark" },
  prepaga: { label: "Prepaga", bg: "bg-green-100", text: "text-green-700" },
};

function formatMonto(n: number): string {
  return "$" + n.toLocaleString("es-AR");
}

function formatPorcentaje(facturado: number, cobrado: number): number {
  return Math.round((cobrado / facturado) * 100);
}

export default function FinanciadoresPage() {
  const totalFacturado = financiadores.reduce((s, f) => s + f.facturado, 0);
  const totalCobrado = financiadores.reduce((s, f) => s + f.cobrado, 0);
  const promedioRechazo =
    Math.round((financiadores.reduce((s, f) => s + f.tasaRechazo, 0) / financiadores.length) * 10) /
    10;
  const promedioDias = Math.round(
    financiadores.reduce((s, f) => s + f.diasPromedioPago, 0) / financiadores.length,
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-ink">Financiadores</h1>
        <p className="text-sm text-ink-muted mt-1">
          Rendimiento y análisis comparativo por financiador
        </p>
      </div>

      {/* Global KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-border rounded-lg p-5 border-l-[3px] border-l-celeste">
          <div className="text-xs text-ink-muted mb-1">Total facturado</div>
          <div className="text-2xl font-bold text-celeste-dark">{formatMonto(totalFacturado)}</div>
          <div className="text-xs mt-1 text-ink-muted">
            {financiadores.length} financiadores activos
          </div>
        </div>
        <div className="bg-white border border-border rounded-lg p-5 border-l-[3px] border-l-green-400">
          <div className="text-xs text-ink-muted mb-1">Total cobrado</div>
          <div className="text-2xl font-bold text-green-600">{formatMonto(totalCobrado)}</div>
          <div className="text-xs mt-1 text-green-600">
            {formatPorcentaje(totalFacturado, totalCobrado)}% del facturado
          </div>
        </div>
        <div className="bg-white border border-border rounded-lg p-5 border-l-[3px] border-l-celeste">
          <div className="text-xs text-ink-muted mb-1">Rechazo promedio</div>
          <div
            className={`text-2xl font-bold ${promedioRechazo > 10 ? "text-red-600" : promedioRechazo > 5 ? "text-amber-500" : "text-green-600"}`}
          >
            {promedioRechazo}%
          </div>
          <div className="text-xs mt-1 text-ink-muted">Promedio ponderado</div>
        </div>
        <div className="bg-white border border-border rounded-lg p-5 border-l-[3px] border-l-red-400">
          <div className="text-xs text-ink-muted mb-1">Días pago promedio</div>
          <div
            className={`text-2xl font-bold ${promedioDias > 60 ? "text-red-600" : "text-celeste-dark"}`}
          >
            {promedioDias}
          </div>
          <div className="text-xs mt-1 text-ink-muted">Promedio entre financiadores</div>
        </div>
      </div>

      {/* Financiador cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {financiadores.map((f) => {
          const tipo = typeLabels[f.type];
          const porcentajeCobro = formatPorcentaje(f.facturado, f.cobrado);
          return (
            <div key={f.id} className="bg-white border border-border rounded-lg overflow-hidden">
              <div
                className={`h-1 ${f.type === "pami" ? "bg-celeste" : f.type === "os" ? "bg-celeste-light" : "bg-celeste"}`}
              />
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-sm text-ink">{f.name}</h3>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${tipo.bg} ${tipo.text}`}
                    >
                      {tipo.label}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-celeste-dark">
                      {formatMonto(f.facturado)}
                    </div>
                    <div className="text-[10px] text-ink-muted">facturado</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-ink-muted">Cobrado</span>
                    <span className="font-semibold text-ink">{porcentajeCobro}%</span>
                  </div>
                  <div className="w-full bg-border-light rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${porcentajeCobro >= 90 ? "bg-green-500" : porcentajeCobro >= 70 ? "bg-celeste" : "bg-celeste-light"}`}
                      style={{ width: `${porcentajeCobro}%` }}
                    />
                  </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border-light">
                  <div className="text-center">
                    <div
                      className={`text-sm font-bold ${f.tasaRechazo > 10 ? "text-red-600" : f.tasaRechazo > 5 ? "text-amber-500" : "text-green-600"}`}
                    >
                      {f.tasaRechazo}%
                    </div>
                    <div className="text-[10px] text-ink-muted">Rechazo</div>
                  </div>
                  <div className="text-center">
                    <div
                      className={`text-sm font-bold ${f.diasPromedioPago > 60 ? "text-red-600" : "text-ink"}`}
                    >
                      {f.diasPromedioPago}d
                    </div>
                    <div className="text-[10px] text-ink-muted">Días pago</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-bold text-ink">{f.facturasPendientes}</div>
                    <div className="text-[10px] text-ink-muted">Pendientes</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparison table */}
      <div className="bg-white border border-border rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <div className="text-xs text-ink-muted">Comparativo detallado</div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F8FAFB] text-[10px] font-bold tracking-wider text-ink-muted uppercase">
              <th className="text-left px-5 py-2.5">Financiador</th>
              <th className="text-left px-5 py-2.5">Tipo</th>
              <th className="text-right px-5 py-2.5">Facturado</th>
              <th className="text-right px-5 py-2.5">Cobrado</th>
              <th className="text-right px-5 py-2.5">% Cobro</th>
              <th className="text-right px-5 py-2.5">Rechazo</th>
              <th className="text-right px-5 py-2.5">Días pago</th>
              <th className="text-right px-5 py-2.5">Pendientes</th>
              <th className="text-left px-5 py-2.5">Últ. liquidación</th>
            </tr>
          </thead>
          <tbody>
            {financiadores.map((f) => {
              const tipo = typeLabels[f.type];
              return (
                <tr
                  key={f.id}
                  className="border-t border-border-light hover:bg-celeste-pale/30 transition"
                >
                  <td className="px-5 py-3 font-semibold text-ink">{f.name}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${tipo.bg} ${tipo.text}`}
                    >
                      {tipo.label}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right text-ink-light">
                    {formatMonto(f.facturado)}
                  </td>
                  <td className="px-5 py-3 text-right text-ink-light">{formatMonto(f.cobrado)}</td>
                  <td className="px-5 py-3 text-right font-semibold text-ink">
                    {formatPorcentaje(f.facturado, f.cobrado)}%
                  </td>
                  <td
                    className={`px-5 py-3 text-right font-semibold ${
                      f.tasaRechazo > 10
                        ? "text-red-600"
                        : f.tasaRechazo > 5
                          ? "text-amber-500"
                          : "text-green-600"
                    }`}
                  >
                    {f.tasaRechazo}%
                  </td>
                  <td
                    className={`px-5 py-3 text-right ${
                      f.diasPromedioPago > 60 ? "text-red-600 font-semibold" : "text-ink-light"
                    }`}
                  >
                    {f.diasPromedioPago}
                  </td>
                  <td className="px-5 py-3 text-right text-ink-light">{f.facturasPendientes}</td>
                  <td className="px-5 py-3 text-ink-muted text-xs">{f.ultimaLiquidacion}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

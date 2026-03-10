import type { InflacionMes } from "@/lib/types";

const meses: InflacionMes[] = [
  {
    mes: "Oct 2025",
    ipc: 3.5,
    facturado: 3200000,
    cobrado: 2350000,
    diasDemora: 52,
    perdidaReal: 198000,
    perdidaPorcentaje: 8.4,
  },
  {
    mes: "Nov 2025",
    ipc: 3.2,
    facturado: 3450000,
    cobrado: 2580000,
    diasDemora: 48,
    perdidaReal: 185000,
    perdidaPorcentaje: 7.2,
  },
  {
    mes: "Dic 2025",
    ipc: 3.8,
    facturado: 3600000,
    cobrado: 2720000,
    diasDemora: 55,
    perdidaReal: 245000,
    perdidaPorcentaje: 9.0,
  },
  {
    mes: "Ene 2026",
    ipc: 2.9,
    facturado: 3100000,
    cobrado: 2280000,
    diasDemora: 50,
    perdidaReal: 162000,
    perdidaPorcentaje: 7.1,
  },
  {
    mes: "Feb 2026",
    ipc: 2.7,
    facturado: 3800000,
    cobrado: 2900000,
    diasDemora: 45,
    perdidaReal: 195000,
    perdidaPorcentaje: 6.7,
  },
  {
    mes: "Mar 2026",
    ipc: 2.5,
    facturado: 4200000,
    cobrado: 3100000,
    diasDemora: 42,
    perdidaReal: 210000,
    perdidaPorcentaje: 6.8,
  },
];

const financiadoresInflacion = [
  { name: "PAMI", diasPromedio: 68, perdidaPorDia: 0.11, perdidaTotal: 7.5, montoAfectado: 980000 },
  { name: "IOMA", diasPromedio: 82, perdidaPorDia: 0.11, perdidaTotal: 9.0, montoAfectado: 312000 },
  { name: "OSDE", diasPromedio: 32, perdidaPorDia: 0.11, perdidaTotal: 3.5, montoAfectado: 845000 },
  {
    name: "Swiss Medical",
    diasPromedio: 28,
    perdidaPorDia: 0.11,
    perdidaTotal: 3.1,
    montoAfectado: 595000,
  },
  {
    name: "Galeno",
    diasPromedio: 35,
    perdidaPorDia: 0.11,
    perdidaTotal: 3.9,
    montoAfectado: 268000,
  },
];

function formatMonto(n: number): string {
  return "$" + n.toLocaleString("es-AR");
}

export default function InflacionPage() {
  const totalPerdida = meses.reduce((s, m) => s + m.perdidaReal, 0);
  const totalCobrado = meses.reduce((s, m) => s + m.cobrado, 0);
  const ipcPromedio = Math.round((meses.reduce((s, m) => s + m.ipc, 0) / meses.length) * 10) / 10;
  const diasPromedio = Math.round(meses.reduce((s, m) => s + m.diasDemora, 0) / meses.length);
  const maxBarHeight = 160;
  const maxPerdida = Math.max(...meses.map((m) => m.perdidaReal));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-ink">Tracker de Inflación</h1>
        <p className="text-sm text-ink-muted mt-1">
          Impacto real de la inflación en tus cobros por demora de pago
        </p>
      </div>

      {/* KPI summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-border rounded-lg p-5 border-l-[3px] border-l-red-400">
          <div className="text-xs text-ink-muted mb-1">Pérdida total (6 meses)</div>
          <div className="text-2xl font-bold text-red-600">{formatMonto(totalPerdida)}</div>
          <div className="text-xs mt-1 text-red-600">
            {Math.round((totalPerdida / totalCobrado) * 100 * 10) / 10}% del cobrado
          </div>
        </div>
        <div className="bg-white border border-border rounded-lg p-5 border-l-[3px] border-l-celeste">
          <div className="text-xs text-ink-muted mb-1">IPC promedio mensual</div>
          <div className="text-2xl font-bold text-celeste-dark">{ipcPromedio}%</div>
          <div className="text-xs mt-1 text-ink-muted">Últimos 6 meses</div>
        </div>
        <div className="bg-white border border-border rounded-lg p-5 border-l-[3px] border-l-celeste">
          <div className="text-xs text-ink-muted mb-1">Días demora promedio</div>
          <div className="text-2xl font-bold text-celeste-dark">{diasPromedio}</div>
          <div className="text-xs mt-1 text-ink-muted">Promedio todos los financiadores</div>
        </div>
        <div className="bg-white border border-border rounded-lg p-5 border-l-[3px] border-l-celeste">
          <div className="text-xs text-ink-muted mb-1">Pérdida por día de demora</div>
          <div className="text-2xl font-bold text-celeste-dark">0.11%</div>
          <div className="text-xs mt-1 text-ink-muted">Valor estimado actual</div>
        </div>
      </div>

      {/* Chart + Explanation */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white border border-border rounded-lg p-5">
          <div className="text-xs text-ink-muted mb-4">
            Pérdida real por inflación — últimos 6 meses
          </div>
          <div className="h-52 flex items-end gap-3 px-4">
            {meses.map((m, i) => {
              const barHeight = Math.round((m.perdidaReal / maxPerdida) * maxBarHeight);
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="text-[10px] font-semibold text-red-600">
                    {formatMonto(m.perdidaReal)}
                  </div>
                  <div
                    className="w-full bg-celeste rounded-t transition-all"
                    style={{ height: `${barHeight}px` }}
                  />
                  <span className="text-[10px] text-ink-muted">{m.mes.slice(0, 3)}</span>
                </div>
              );
            })}
          </div>
          <div className="flex gap-4 mt-3 text-[10px] text-ink-muted">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-celeste rounded-sm" /> Pérdida real por inflación
            </span>
          </div>
        </div>

        {/* Explanation card */}
        <div className="bg-white border border-border rounded-lg p-5">
          <div className="text-xs text-ink-muted mb-3">Cómo calculamos la pérdida</div>
          <div className="space-y-3">
            <div className="border-l-2 border-celeste pl-3 py-1">
              <div className="text-xs font-semibold text-ink">Valor nominal</div>
              <div className="text-[11px] text-ink-muted">Lo que facturaste al financiador</div>
            </div>
            <div className="border-l-2 border-celeste pl-3 py-1">
              <div className="text-xs font-semibold text-ink">Valor real</div>
              <div className="text-[11px] text-ink-muted">
                Poder adquisitivo al momento del cobro
              </div>
            </div>
            <div className="border-l-2 border-red-500 pl-3 py-1">
              <div className="text-xs font-semibold text-ink">Pérdida = Nominal − Real</div>
              <div className="text-[11px] text-ink-muted">
                Ajustado por IPC entre presentación y cobro
              </div>
            </div>
          </div>
          <div className="mt-4 bg-celeste-pale border border-celeste/20 rounded p-3">
            <div className="text-xs font-semibold text-ink">Fórmula</div>
            <div className="text-[11px] text-ink-light mt-1">
              Pérdida = Monto × (IPC_mensual / 30) × días_demora
            </div>
          </div>
        </div>
      </div>

      {/* Per-month detail table */}
      <div className="bg-white border border-border rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <div className="text-xs text-ink-muted">Detalle mensual</div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F8FAFB] text-[10px] font-bold tracking-wider text-ink-muted uppercase">
              <th className="text-left px-5 py-2.5">Mes</th>
              <th className="text-right px-5 py-2.5">IPC</th>
              <th className="text-right px-5 py-2.5">Facturado</th>
              <th className="text-right px-5 py-2.5">Cobrado</th>
              <th className="text-right px-5 py-2.5">Días demora</th>
              <th className="text-right px-5 py-2.5">Pérdida real</th>
              <th className="text-right px-5 py-2.5">% Pérdida</th>
            </tr>
          </thead>
          <tbody>
            {meses.map((m) => (
              <tr
                key={m.mes}
                className="border-t border-border-light hover:bg-celeste-pale/30 transition"
              >
                <td className="px-5 py-3 font-semibold text-ink">{m.mes}</td>
                <td className="px-5 py-3 text-right text-ink-light">{m.ipc}%</td>
                <td className="px-5 py-3 text-right text-ink-light">{formatMonto(m.facturado)}</td>
                <td className="px-5 py-3 text-right text-ink-light">{formatMonto(m.cobrado)}</td>
                <td
                  className={`px-5 py-3 text-right ${m.diasDemora > 50 ? "text-red-600 font-semibold" : "text-ink-light"}`}
                >
                  {m.diasDemora}
                </td>
                <td className="px-5 py-3 text-right font-semibold text-red-600">
                  {formatMonto(m.perdidaReal)}
                </td>
                <td
                  className={`px-5 py-3 text-right font-semibold ${
                    m.perdidaPorcentaje > 8
                      ? "text-red-600"
                      : m.perdidaPorcentaje > 6
                        ? "text-amber-500"
                        : "text-green-600"
                  }`}
                >
                  {m.perdidaPorcentaje}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Per-financiador inflation impact */}
      <div className="bg-white border border-border rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <div className="text-xs text-ink-muted">
            Impacto por financiador — cuánto perdés por la demora de cada uno
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F8FAFB] text-[10px] font-bold tracking-wider text-ink-muted uppercase">
              <th className="text-left px-5 py-2.5">Financiador</th>
              <th className="text-right px-5 py-2.5">Días promedio</th>
              <th className="text-right px-5 py-2.5">Pérdida/día</th>
              <th className="text-right px-5 py-2.5">Pérdida total</th>
              <th className="text-right px-5 py-2.5">Monto afectado</th>
              <th className="text-right px-5 py-2.5">Pérdida estimada</th>
            </tr>
          </thead>
          <tbody>
            {financiadoresInflacion.map((f) => {
              const perdidaEstimada = Math.round(f.montoAfectado * (f.perdidaTotal / 100));
              return (
                <tr
                  key={f.name}
                  className="border-t border-border-light hover:bg-celeste-pale/30 transition"
                >
                  <td className="px-5 py-3 font-semibold text-ink">{f.name}</td>
                  <td
                    className={`px-5 py-3 text-right ${
                      f.diasPromedio > 60 ? "text-red-600 font-semibold" : "text-ink-light"
                    }`}
                  >
                    {f.diasPromedio}
                  </td>
                  <td className="px-5 py-3 text-right text-ink-light">{f.perdidaPorDia}%</td>
                  <td
                    className={`px-5 py-3 text-right font-semibold ${
                      f.perdidaTotal > 7
                        ? "text-red-600"
                        : f.perdidaTotal > 4
                          ? "text-amber-500"
                          : "text-green-600"
                    }`}
                  >
                    {f.perdidaTotal}%
                  </td>
                  <td className="px-5 py-3 text-right text-ink-light">
                    {formatMonto(f.montoAfectado)}
                  </td>
                  <td className="px-5 py-3 text-right font-semibold text-red-600">
                    {formatMonto(perdidaEstimada)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

"use client";

import DemoShell from "../DemoShell";
import { DEMO_FINANCIADORES } from "@/lib/demo-data";
import { Card, PageHeader } from "@/components/ui";

export default function DemoFinanciadoresPage() {
  return (
    <DemoShell>
      <div className="space-y-5">
        <PageHeader
          title="Financiadores"
          description={`${DEMO_FINANCIADORES.length} obras sociales y prepagas con facturación activa`}
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Total financiadores", value: DEMO_FINANCIADORES.length },
            { label: "Mayor facturación", value: "PAMI ($1.4M)" },
            { label: "Peor rechazo", value: "IOMA (18%)" },
            { label: "Mejor pago", value: "Swiss Med. (28 días)" },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-white border border-border rounded-lg p-4">
              <div className="text-[10px] font-bold tracking-wider text-ink-muted uppercase">
                {kpi.label}
              </div>
              <div className="text-lg font-bold mt-1 text-ink">{kpi.value}</div>
            </div>
          ))}
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F8FAFB] text-[10px] font-bold tracking-wider text-ink-muted uppercase">
                  <th scope="col" className="text-left px-5 py-2.5">
                    Financiador
                  </th>
                  <th scope="col" className="text-right px-5 py-2.5">
                    Facturado
                  </th>
                  <th scope="col" className="text-right px-5 py-2.5">
                    Cobrado
                  </th>
                  <th scope="col" className="text-right px-5 py-2.5">
                    Rechazo %
                  </th>
                  <th scope="col" className="text-right px-5 py-2.5">
                    Días prom. cobro
                  </th>
                </tr>
              </thead>
              <tbody>
                {DEMO_FINANCIADORES.map((f) => {
                  const rechazoNum = parseFloat(f.rechazo);
                  return (
                    <tr
                      key={f.name}
                      className="border-t border-border-light hover:bg-celeste-pale/30 transition"
                    >
                      <td className="px-5 py-3 font-semibold text-ink">{f.name}</td>
                      <td className="px-5 py-3 text-right font-semibold text-ink">{f.facturado}</td>
                      <td className="px-5 py-3 text-right text-green-600 font-semibold">
                        {f.cobrado}
                      </td>
                      <td
                        className={`px-5 py-3 text-right font-semibold ${rechazoNum >= 10 ? "text-red-500" : rechazoNum >= 5 ? "text-amber-600" : "text-green-600"}`}
                      >
                        {f.rechazo}
                      </td>
                      <td
                        className={`px-5 py-3 text-right ${parseInt(f.dias) > 60 ? "text-red-500 font-semibold" : "text-ink"}`}
                      >
                        {f.dias} días
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* insight card */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
          <h3 className="text-sm font-bold text-amber-800">📊 Insight</h3>
          <p className="text-sm text-amber-700 mt-1">
            <strong>IOMA</strong> tiene el mayor porcentaje de rechazos (18%) y el mayor tiempo de
            cobro (82 días). Recomendamos priorizar la corrección de códigos y consultar la tabla de
            rechazos para mejorar la cobrabilidad.
          </p>
        </div>
      </div>
    </DemoShell>
  );
}

"use client";

import { useState, useMemo } from "react";
import DemoShell from "../DemoShell";
import { DEMO_RECHAZOS } from "@/lib/demo-data";
import { Card, StatusBadge, PageHeader, Select } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";

const estadoLabels: Record<string, string> = {
  pendiente: "Pendiente",
  reprocesado: "Reprocesado",
  descartado: "Descartado",
};

export default function DemoRechazosPage() {
  const [filtro, setFiltro] = useState("todos");

  const filtered = useMemo(() => {
    if (filtro === "todos") return DEMO_RECHAZOS;
    return DEMO_RECHAZOS.filter((r) => r.estado === filtro);
  }, [filtro]);

  const totalPerdida = DEMO_RECHAZOS.filter((r) => r.estado === "pendiente").reduce(
    (s, r) => s + r.monto,
    0,
  );

  return (
    <DemoShell>
      <div className="space-y-5">
        <PageHeader
          title="Rechazos"
          description={`${filtered.length} rechazos · ${formatCurrency(totalPerdida)} pendientes de recupero`}
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Total rechazos", value: DEMO_RECHAZOS.length, color: "text-red-500" },
            {
              label: "Pendientes",
              value: DEMO_RECHAZOS.filter((r) => r.estado === "pendiente").length,
              color: "text-amber-600",
            },
            {
              label: "Reprocesados",
              value: DEMO_RECHAZOS.filter((r) => r.estado === "reprocesado").length,
              color: "text-green-600",
            },
            {
              label: "Monto en riesgo",
              value: formatCurrency(totalPerdida),
              color: "text-red-500",
            },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-white border border-border rounded-lg p-4">
              <div className="text-[10px] font-bold tracking-wider text-ink-muted uppercase">
                {kpi.label}
              </div>
              <div className={`text-xl font-bold mt-1 ${kpi.color}`}>{kpi.value}</div>
            </div>
          ))}
        </div>

        <Select
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          options={[
            { value: "todos", label: "Todos los estados" },
            { value: "pendiente", label: "Pendiente" },
            { value: "reprocesado", label: "Reprocesado" },
            { value: "descartado", label: "Descartado" },
          ]}
        />

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F8FAFB] text-[10px] font-bold tracking-wider text-ink-muted uppercase">
                  <th scope="col" className="text-left px-5 py-2.5">
                    Factura
                  </th>
                  <th scope="col" className="text-left px-5 py-2.5">
                    Paciente
                  </th>
                  <th scope="col" className="text-left px-5 py-2.5">
                    Financiador
                  </th>
                  <th scope="col" className="text-left px-5 py-2.5">
                    Motivo
                  </th>
                  <th scope="col" className="text-right px-5 py-2.5">
                    Monto
                  </th>
                  <th scope="col" className="text-left px-5 py-2.5">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr
                    key={r.id}
                    className="border-t border-border-light hover:bg-celeste-pale/30 transition"
                  >
                    <td className="px-5 py-3 font-mono text-xs text-ink">{r.facturaNumero}</td>
                    <td className="px-5 py-3 font-semibold text-ink">{r.paciente}</td>
                    <td className="px-5 py-3 text-ink-light">{r.financiador}</td>
                    <td className="px-5 py-3 text-ink-light">{r.motivo}</td>
                    <td className="px-5 py-3 text-right font-semibold text-red-500">
                      {formatCurrency(r.monto)}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge
                        variant={
                          r.estado === "reprocesado"
                            ? "confirmado"
                            : r.estado === "descartado"
                              ? "cancelado"
                              : "pendiente"
                        }
                        label={estadoLabels[r.estado] ?? r.estado}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DemoShell>
  );
}

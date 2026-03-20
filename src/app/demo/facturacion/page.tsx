"use client";

import { useState, useMemo } from "react";
import DemoShell from "../DemoShell";
import { DEMO_FACTURAS } from "@/lib/demo-data";
import { Card, StatusBadge, PageHeader, Select } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";

const estadoLabels: Record<string, string> = {
  presentada: "Presentada",
  cobrada: "Cobrada",
  rechazada: "Rechazada",
  pendiente: "Pendiente",
  en_observacion: "En observación",
};

export default function DemoFacturacionPage() {
  const [filtroFinanciador, setFiltroFinanciador] = useState("Todos");
  const [filtroEstado, setFiltroEstado] = useState("todos");

  const filtered = useMemo(() => {
    return DEMO_FACTURAS.filter((f) => {
      if (filtroFinanciador !== "Todos" && f.financiador !== filtroFinanciador) return false;
      if (filtroEstado !== "todos" && f.estado !== filtroEstado) return false;
      return true;
    });
  }, [filtroFinanciador, filtroEstado]);

  const totalMonto = filtered.reduce((s, f) => s + f.monto, 0);

  return (
    <DemoShell>
      <div className="space-y-5">
        <PageHeader
          title="Facturación"
          description={`${filtered.length} facturas · ${formatCurrency(totalMonto)} total`}
        />

        {/* KPI row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              label: "Presentadas",
              value: DEMO_FACTURAS.filter((f) => f.estado === "presentada").length,
              color: "text-blue-600",
            },
            {
              label: "Cobradas",
              value: DEMO_FACTURAS.filter((f) => f.estado === "cobrada").length,
              color: "text-green-600",
            },
            {
              label: "Rechazadas",
              value: DEMO_FACTURAS.filter((f) => f.estado === "rechazada").length,
              color: "text-red-500",
            },
            {
              label: "Monto total",
              value: formatCurrency(DEMO_FACTURAS.reduce((s, f) => s + f.monto, 0)),
              color: "text-celeste-dark",
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

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <Select
            value={filtroFinanciador}
            onChange={(e) => setFiltroFinanciador(e.target.value)}
            options={[
              { value: "Todos", label: "Todos los financiadores" },
              { value: "PAMI", label: "PAMI" },
              { value: "OSDE", label: "OSDE" },
              { value: "Swiss Medical", label: "Swiss Medical" },
              { value: "IOMA", label: "IOMA" },
              { value: "Galeno", label: "Galeno" },
            ]}
          />
          <Select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            options={[
              { value: "todos", label: "Todos los estados" },
              { value: "presentada", label: "Presentada" },
              { value: "cobrada", label: "Cobrada" },
              { value: "rechazada", label: "Rechazada" },
              { value: "pendiente", label: "Pendiente" },
            ]}
          />
        </div>

        {/* Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F8FAFB] text-[10px] font-bold tracking-wider text-ink-muted uppercase">
                  <th scope="col" className="text-left px-5 py-2.5">
                    Número
                  </th>
                  <th scope="col" className="text-left px-5 py-2.5">
                    Paciente
                  </th>
                  <th scope="col" className="text-left px-5 py-2.5">
                    Financiador
                  </th>
                  <th scope="col" className="text-left px-5 py-2.5">
                    Prestación
                  </th>
                  <th scope="col" className="text-right px-5 py-2.5">
                    Monto
                  </th>
                  <th scope="col" className="text-left px-5 py-2.5">
                    Fecha
                  </th>
                  <th scope="col" className="text-left px-5 py-2.5">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((f) => (
                  <tr
                    key={f.id}
                    className="border-t border-border-light hover:bg-celeste-pale/30 transition"
                  >
                    <td className="px-5 py-3 font-mono text-xs text-ink">{f.numero}</td>
                    <td className="px-5 py-3 font-semibold text-ink">{f.paciente}</td>
                    <td className="px-5 py-3 text-ink-light">{f.financiador}</td>
                    <td className="px-5 py-3 text-ink-light">{f.prestacion}</td>
                    <td className="px-5 py-3 text-right font-semibold text-ink">
                      {formatCurrency(f.monto)}
                    </td>
                    <td className="px-5 py-3 text-ink-light">{f.fecha}</td>
                    <td className="px-5 py-3">
                      <StatusBadge
                        variant={
                          f.estado === "cobrada"
                            ? "confirmado"
                            : f.estado === "rechazada"
                              ? "cancelado"
                              : "pendiente"
                        }
                        label={estadoLabels[f.estado] ?? f.estado}
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

"use client";

import { useState, useMemo } from "react";
import DemoShell from "../DemoShell";
import { DEMO_PACIENTES } from "@/lib/demo-data";
import { Card, StatusBadge, PageHeader, Select, Input } from "@/components/ui";

export default function DemoPacientesPage() {
  const [search, setSearch] = useState("");
  const [filtro, setFiltro] = useState("todos");

  const filtered = useMemo(() => {
    let list = DEMO_PACIENTES;
    if (filtro !== "todos") list = list.filter((p) => p.estado === filtro);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.nombre.toLowerCase().includes(q) || p.dni.includes(q));
    }
    return list;
  }, [filtro, search]);

  return (
    <DemoShell>
      <div className="space-y-5">
        <PageHeader
          title="Pacientes"
          description={`${DEMO_PACIENTES.length} pacientes registrados`}
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Total", value: DEMO_PACIENTES.length },
            { label: "Activos", value: DEMO_PACIENTES.filter((p) => p.estado === "activo").length },
            {
              label: "Inactivos",
              value: DEMO_PACIENTES.filter((p) => p.estado === "inactivo").length,
            },
            {
              label: "Financiadores",
              value: Array.from(new Set(DEMO_PACIENTES.map((p) => p.financiador))).length,
            },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-white border border-border rounded-lg p-4">
              <div className="text-[10px] font-bold tracking-wider text-ink-muted uppercase">
                {kpi.label}
              </div>
              <div className="text-xl font-bold mt-1 text-ink">{kpi.value}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Buscar por nombre o DNI…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            options={[
              { value: "todos", label: "Todos" },
              { value: "activo", label: "Activos" },
              { value: "inactivo", label: "Inactivos" },
            ]}
          />
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F8FAFB] text-[10px] font-bold tracking-wider text-ink-muted uppercase">
                  <th scope="col" className="text-left px-5 py-2.5">
                    Nombre
                  </th>
                  <th scope="col" className="text-left px-5 py-2.5">
                    DNI
                  </th>
                  <th scope="col" className="text-left px-5 py-2.5">
                    Financiador
                  </th>
                  <th scope="col" className="text-left px-5 py-2.5">
                    Plan
                  </th>
                  <th scope="col" className="text-left px-5 py-2.5">
                    Teléfono
                  </th>
                  <th scope="col" className="text-left px-5 py-2.5">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr
                    key={p.id}
                    className="border-t border-border-light hover:bg-celeste-pale/30 transition"
                  >
                    <td className="px-5 py-3 font-semibold text-ink">{p.nombre}</td>
                    <td className="px-5 py-3 font-mono text-xs text-ink">{p.dni}</td>
                    <td className="px-5 py-3 text-ink-light">{p.financiador}</td>
                    <td className="px-5 py-3 text-ink-light">{p.plan}</td>
                    <td className="px-5 py-3 text-ink-light">{p.telefono}</td>
                    <td className="px-5 py-3">
                      <StatusBadge
                        variant={p.estado === "activo" ? "confirmado" : "cancelado"}
                        label={p.estado === "activo" ? "Activo" : "Inactivo"}
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

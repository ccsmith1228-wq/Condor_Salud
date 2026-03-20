"use client";

import DemoShell from "../DemoShell";
import { DEMO_INVENTARIO } from "@/lib/demo-data";
import { Card, PageHeader } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";

export default function DemoInventarioPage() {
  const criticos = DEMO_INVENTARIO.filter((i) => i.stock < i.stockMin);
  const valorTotal = DEMO_INVENTARIO.reduce((s, i) => s + i.stock * i.precio, 0);

  return (
    <DemoShell>
      <div className="space-y-5">
        <PageHeader
          title="Inventario"
          description={`${DEMO_INVENTARIO.length} ítems · ${criticos.length} con stock crítico`}
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Total ítems", value: DEMO_INVENTARIO.length },
            { label: "Stock crítico", value: criticos.length, color: "text-red-500" },
            {
              label: "Categorías",
              value: Array.from(new Set(DEMO_INVENTARIO.map((i) => i.categoria))).length,
            },
            { label: "Valor total", value: formatCurrency(valorTotal) },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-white border border-border rounded-lg p-4">
              <div className="text-[10px] font-bold tracking-wider text-ink-muted uppercase">
                {kpi.label}
              </div>
              <div className={`text-xl font-bold mt-1 ${kpi.color ?? "text-ink"}`}>{kpi.value}</div>
            </div>
          ))}
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F8FAFB] text-[10px] font-bold tracking-wider text-ink-muted uppercase">
                  <th scope="col" className="text-left px-5 py-2.5">
                    Producto
                  </th>
                  <th scope="col" className="text-left px-5 py-2.5">
                    Categoría
                  </th>
                  <th scope="col" className="text-right px-5 py-2.5">
                    Stock
                  </th>
                  <th scope="col" className="text-right px-5 py-2.5">
                    Mínimo
                  </th>
                  <th scope="col" className="text-right px-5 py-2.5">
                    Precio unit.
                  </th>
                  <th scope="col" className="text-left px-5 py-2.5">
                    Proveedor
                  </th>
                  <th scope="col" className="text-left px-5 py-2.5">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody>
                {DEMO_INVENTARIO.map((item) => {
                  const isCritical = item.stock < item.stockMin;
                  return (
                    <tr
                      key={item.id}
                      className={`border-t border-border-light hover:bg-celeste-pale/30 transition ${isCritical ? "bg-red-50/60" : ""}`}
                    >
                      <td className="px-5 py-3 font-semibold text-ink">{item.nombre}</td>
                      <td className="px-5 py-3 text-ink-light">{item.categoria}</td>
                      <td
                        className={`px-5 py-3 text-right font-semibold ${isCritical ? "text-red-600" : "text-ink"}`}
                      >
                        {item.stock}
                      </td>
                      <td className="px-5 py-3 text-right text-ink-muted">{item.stockMin}</td>
                      <td className="px-5 py-3 text-right font-mono text-xs text-ink">
                        {formatCurrency(item.precio)}
                      </td>
                      <td className="px-5 py-3 text-ink-light">{item.proveedor}</td>
                      <td className="px-5 py-3">
                        {isCritical ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                            ⚠ Reponer
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            OK
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DemoShell>
  );
}

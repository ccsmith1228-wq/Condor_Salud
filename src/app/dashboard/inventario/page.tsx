"use client";
import { useState } from "react";
import Link from "next/link";
import { useToast } from "@/components/Toast";

interface Item {
  id: string;
  nombre: string;
  categoria: "Medicamento" | "Insumo" | "Descartable" | "Reactivo" | "Equipamiento";
  presentacion: string;
  stock: number;
  stockMin: number;
  unidad: string;
  precioUnit: string;
  proveedor: string;
  ultimaCompra: string;
  vencimiento: string;
  estado: "OK" | "Bajo" | "Crítico" | "Vencido";
}

const inventario: Item[] = [
  {
    id: "INV-001",
    nombre: "Enalapril 10mg",
    categoria: "Medicamento",
    presentacion: "Caja x30 comp.",
    stock: 245,
    stockMin: 50,
    unidad: "cajas",
    precioUnit: "$3.200",
    proveedor: "Droguería del Sud",
    ultimaCompra: "01/03/2026",
    vencimiento: "11/2027",
    estado: "OK",
  },
  {
    id: "INV-002",
    nombre: "Metformina 850mg",
    categoria: "Medicamento",
    presentacion: "Caja x60 comp.",
    stock: 132,
    stockMin: 40,
    unidad: "cajas",
    precioUnit: "$4.800",
    proveedor: "Droguería del Sud",
    ultimaCompra: "15/02/2026",
    vencimiento: "08/2027",
    estado: "OK",
  },
  {
    id: "INV-003",
    nombre: "Jeringa 5ml c/aguja",
    categoria: "Descartable",
    presentacion: "Caja x100",
    stock: 18,
    stockMin: 20,
    unidad: "cajas",
    precioUnit: "$12.500",
    proveedor: "Medistock",
    ultimaCompra: "20/02/2026",
    vencimiento: "—",
    estado: "Bajo",
  },
  {
    id: "INV-004",
    nombre: "Guantes nitrilo M",
    categoria: "Descartable",
    presentacion: "Caja x100",
    stock: 5,
    stockMin: 15,
    unidad: "cajas",
    precioUnit: "$8.900",
    proveedor: "Medistock",
    ultimaCompra: "10/02/2026",
    vencimiento: "—",
    estado: "Crítico",
  },
  {
    id: "INV-005",
    nombre: "Gel ecográfico",
    categoria: "Insumo",
    presentacion: "Bidón 5L",
    stock: 8,
    stockMin: 3,
    unidad: "bidones",
    precioUnit: "$15.000",
    proveedor: "EcoSuministros",
    ultimaCompra: "25/01/2026",
    vencimiento: "—",
    estado: "OK",
  },
  {
    id: "INV-006",
    nombre: "Tiras reactivas glucemia",
    categoria: "Reactivo",
    presentacion: "Caja x50",
    stock: 3,
    stockMin: 10,
    unidad: "cajas",
    precioUnit: "$22.400",
    proveedor: "Wiener Lab",
    ultimaCompra: "05/02/2026",
    vencimiento: "06/2026",
    estado: "Crítico",
  },
  {
    id: "INV-007",
    nombre: "Alcohol 70° 1L",
    categoria: "Insumo",
    presentacion: "Botella 1L",
    stock: 42,
    stockMin: 10,
    unidad: "botellas",
    precioUnit: "$2.100",
    proveedor: "Droguería del Sud",
    ultimaCompra: "28/02/2026",
    vencimiento: "—",
    estado: "OK",
  },
  {
    id: "INV-008",
    nombre: "Gasa estéril 10x10",
    categoria: "Descartable",
    presentacion: "Caja x100",
    stock: 28,
    stockMin: 15,
    unidad: "cajas",
    precioUnit: "$6.700",
    proveedor: "Medistock",
    ultimaCompra: "18/02/2026",
    vencimiento: "—",
    estado: "OK",
  },
  {
    id: "INV-009",
    nombre: "Levotiroxina 50mcg",
    categoria: "Medicamento",
    presentacion: "Caja x30 comp.",
    stock: 67,
    stockMin: 20,
    unidad: "cajas",
    precioUnit: "$5.600",
    proveedor: "Droguería del Sud",
    ultimaCompra: "22/02/2026",
    vencimiento: "03/2027",
    estado: "OK",
  },
  {
    id: "INV-010",
    nombre: "Electrodos ECG",
    categoria: "Descartable",
    presentacion: "Bolsa x50",
    stock: 12,
    stockMin: 10,
    unidad: "bolsas",
    precioUnit: "$4.300",
    proveedor: "Medistock",
    ultimaCompra: "12/02/2026",
    vencimiento: "—",
    estado: "OK",
  },
  {
    id: "INV-011",
    nombre: "Reactivo TSH",
    categoria: "Reactivo",
    presentacion: "Kit x100 det.",
    stock: 2,
    stockMin: 5,
    unidad: "kits",
    precioUnit: "$185.000",
    proveedor: "Wiener Lab",
    ultimaCompra: "10/01/2026",
    vencimiento: "09/2026",
    estado: "Bajo",
  },
  {
    id: "INV-012",
    nombre: "Ibuprofeno 400mg",
    categoria: "Medicamento",
    presentacion: "Caja x20 comp.",
    stock: 0,
    stockMin: 30,
    unidad: "cajas",
    precioUnit: "$1.800",
    proveedor: "Droguería del Sud",
    ultimaCompra: "20/01/2026",
    vencimiento: "05/2026",
    estado: "Crítico",
  },
];

const categorias = [
  "Todos",
  "Medicamento",
  "Descartable",
  "Insumo",
  "Reactivo",
  "Equipamiento",
] as const;
const estadoColors: Record<string, string> = {
  OK: "bg-green-50 text-green-700",
  Bajo: "bg-amber-50 text-amber-700",
  Crítico: "bg-red-50 text-red-600",
  Vencido: "bg-border-light text-ink-muted",
};

const movimientos = [
  {
    fecha: "07/03/2026",
    item: "Enalapril 10mg",
    tipo: "Ingreso",
    cantidad: "+50 cajas",
    usuario: "Dr. Rodríguez",
  },
  {
    fecha: "07/03/2026",
    item: "Guantes nitrilo M",
    tipo: "Consumo",
    cantidad: "-10 cajas",
    usuario: "Enf. López",
  },
  {
    fecha: "06/03/2026",
    item: "Tiras reactivas",
    tipo: "Consumo",
    cantidad: "-7 cajas",
    usuario: "Dra. Pérez",
  },
  {
    fecha: "05/03/2026",
    item: "Gel ecográfico",
    tipo: "Ingreso",
    cantidad: "+5 bidones",
    usuario: "Admin",
  },
  {
    fecha: "04/03/2026",
    item: "Jeringa 5ml",
    tipo: "Consumo",
    cantidad: "-2 cajas",
    usuario: "Enf. López",
  },
];

export default function InventarioPage() {
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("Todos");
  const [estadoFilter, setEstadoFilter] = useState("Todos");

  const filtered = inventario.filter((item) => {
    const matchSearch =
      item.nombre.toLowerCase().includes(search.toLowerCase()) ||
      item.id.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "Todos" || item.categoria === catFilter;
    const matchEstado = estadoFilter === "Todos" || item.estado === estadoFilter;
    return matchSearch && matchCat && matchEstado;
  });

  const criticos = inventario.filter((i) => i.estado === "Crítico").length;
  const bajos = inventario.filter((i) => i.estado === "Bajo").length;
  const valorTotal = inventario.reduce(
    (sum, i) => sum + i.stock * parseInt(i.precioUnit.replace(/[$.]/g, "")),
    0,
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Inventario</h1>
          <p className="text-sm text-ink-muted mt-0.5">
            Gestión de medicamentos, insumos y descartables
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => showToast("Exportar inventario — Próximamente")}
            className="px-4 py-2 text-sm font-medium border border-border rounded-[4px] text-ink-light hover:border-celeste-dark hover:text-celeste-dark transition"
          >
            Exportar
          </button>
          <button
            onClick={() => showToast("Registrar ingreso — Próximamente")}
            className="px-4 py-2 text-sm font-semibold bg-celeste-dark text-white rounded-[4px] hover:bg-celeste transition"
          >
            + Registrar ingreso
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Ítems totales", value: inventario.length, color: "border-celeste" },
          { label: "Stock crítico", value: criticos, color: "border-red-400" },
          { label: "Stock bajo", value: bajos, color: "border-amber-400" },
          {
            label: "Valor inventario",
            value: `$${(valorTotal / 1000000).toFixed(1)}M`,
            color: "border-green-400",
          },
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

      {/* Alerts */}
      {criticos > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <svg
            className="w-5 h-5 text-red-500 shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15.75h.007v.008H12v-.008z" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-red-700">
              {criticos} ítem{criticos > 1 ? "s" : ""} en estado crítico
            </p>
            <p className="text-xs text-red-600 mt-0.5">
              {inventario
                .filter((i) => i.estado === "Crítico")
                .map((i) => i.nombre)
                .join(", ")}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Buscar por nombre o código..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64 px-4 py-2 text-sm border border-border rounded-[4px] outline-none focus:border-celeste-dark transition"
        />
        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-border rounded-[4px] outline-none focus:border-celeste-dark transition bg-white text-ink"
        >
          {categorias.map((c) => (
            <option key={c} value={c}>
              {c === "Todos" ? "Todas las categorías" : c + "s"}
            </option>
          ))}
        </select>
        <select
          value={estadoFilter}
          onChange={(e) => setEstadoFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-border rounded-[4px] outline-none focus:border-celeste-dark transition bg-white text-ink"
        >
          <option value="Todos">Todos los estados</option>
          <option value="OK">OK</option>
          <option value="Bajo">Bajo</option>
          <option value="Crítico">Crítico</option>
        </select>
      </div>

      {/* Stock table */}
      <div className="bg-white border border-border rounded-lg overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr className="bg-[#F8FAFB] text-[10px] font-bold tracking-wider text-ink-muted uppercase">
              <th className="text-left px-5 py-2.5">Código</th>
              <th className="text-left px-5 py-2.5">Nombre</th>
              <th className="text-left px-5 py-2.5">Categoría</th>
              <th className="text-left px-5 py-2.5">Presentación</th>
              <th className="text-right px-5 py-2.5">Stock</th>
              <th className="text-right px-5 py-2.5">Mín.</th>
              <th className="text-right px-5 py-2.5">Precio Unit.</th>
              <th className="text-left px-5 py-2.5">Proveedor</th>
              <th className="text-center px-5 py-2.5">Vto.</th>
              <th className="text-center px-5 py-2.5">Estado</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr
                key={item.id}
                className="border-t border-border-light hover:bg-celeste-pale/30 transition cursor-pointer"
              >
                <td className="px-5 py-3 font-mono text-[10px] text-ink-muted">{item.id}</td>
                <td className="px-5 py-3 font-semibold text-ink text-xs">{item.nombre}</td>
                <td className="px-5 py-3 text-xs text-ink-light">{item.categoria}</td>
                <td className="px-5 py-3 text-xs text-ink-light">{item.presentacion}</td>
                <td
                  className={`px-5 py-3 text-right text-xs font-bold ${item.stock <= item.stockMin ? "text-red-600" : "text-ink"}`}
                >
                  {item.stock}
                </td>
                <td className="px-5 py-3 text-right text-xs text-ink-muted">{item.stockMin}</td>
                <td className="px-5 py-3 text-right text-xs text-ink">{item.precioUnit}</td>
                <td className="px-5 py-3 text-xs text-ink-light">{item.proveedor}</td>
                <td className="px-5 py-3 text-center font-mono text-[10px] text-ink-muted">
                  {item.vencimiento}
                </td>
                <td className="px-5 py-3 text-center">
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded ${estadoColors[item.estado]}`}
                  >
                    {item.estado}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Movimientos recientes */}
      <div className="bg-white border border-border rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-xs font-bold tracking-wider text-ink-muted uppercase">
            Últimos Movimientos
          </h3>
        </div>
        <table className="w-full text-sm">
          <tbody>
            {movimientos.map((m, i) => (
              <tr key={i} className="border-t border-border-light first:border-t-0">
                <td className="px-5 py-3 font-mono text-[10px] text-ink-muted w-24">{m.fecha}</td>
                <td className="px-5 py-3 text-xs font-semibold text-ink">{m.item}</td>
                <td className="px-5 py-3 text-xs text-ink-light">{m.tipo}</td>
                <td
                  className={`px-5 py-3 text-xs font-bold ${m.cantidad.startsWith("+") ? "text-green-600" : "text-red-600"}`}
                >
                  {m.cantidad}
                </td>
                <td className="px-5 py-3 text-xs text-ink-muted text-right">{m.usuario}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

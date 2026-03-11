"use client";

import { useState } from "react";
import {
  Pill,
  Clock,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Package,
  Truck,
  Search,
  Filter,
  Plus,
  FileText,
  ShoppingCart,
  Calendar,
} from "lucide-react";

/* ── types ────────────────────────────────────────────── */
type Tab = "activos" | "historial" | "pedidos";

interface Medication {
  id: number;
  name: string;
  generic: string;
  dose: string;
  frequency: string;
  prescribedBy: string;
  startDate: string;
  remaining: number;
  refillable: boolean;
  coverage: string;
  copay: string;
  status: "activo" | "finalizado";
}

interface Order {
  id: number;
  date: string;
  items: string[];
  total: string;
  status: "entregado" | "en-camino" | "preparando" | "cancelado";
}

/* ── demo data ────────────────────────────────────────── */
const medications: Medication[] = [
  {
    id: 1,
    name: "Losartán 50mg",
    generic: "Losartán potásico",
    dose: "1 comprimido",
    frequency: "Cada 24 horas - Mañana",
    prescribedBy: "Dra. Laura Méndez",
    startDate: "15/01/2025",
    remaining: 12,
    refillable: true,
    coverage: "70%",
    copay: "$2.100",
    status: "activo",
  },
  {
    id: 2,
    name: "Metformina 850mg",
    generic: "Metformina clorhidrato",
    dose: "1 comprimido",
    frequency: "Cada 12 horas - Desayuno y cena",
    prescribedBy: "Dra. Laura Méndez",
    startDate: "15/01/2025",
    remaining: 5,
    refillable: true,
    coverage: "70%",
    copay: "$1.800",
    status: "activo",
  },
  {
    id: 3,
    name: "Atorvastatina 20mg",
    generic: "Atorvastatina cálcica",
    dose: "1 comprimido",
    frequency: "Cada 24 horas - Noche",
    prescribedBy: "Dr. Carlos Ruiz",
    startDate: "01/02/2025",
    remaining: 28,
    refillable: true,
    coverage: "70%",
    copay: "$3.200",
    status: "activo",
  },
  {
    id: 4,
    name: "Omeprazol 20mg",
    generic: "Omeprazol",
    dose: "1 cápsula",
    frequency: "Cada 24 horas - Antes del desayuno",
    prescribedBy: "Dra. Laura Méndez",
    startDate: "01/11/2024",
    remaining: 0,
    refillable: false,
    coverage: "70%",
    copay: "$950",
    status: "finalizado",
  },
  {
    id: 5,
    name: "Amoxicilina 500mg",
    generic: "Amoxicilina",
    dose: "1 cápsula",
    frequency: "Cada 8 horas - 7 días",
    prescribedBy: "Dr. Martín Rodríguez",
    startDate: "10/02/2025",
    remaining: 0,
    refillable: false,
    coverage: "100%",
    copay: "$0",
    status: "finalizado",
  },
];

const orders: Order[] = [
  {
    id: 1001,
    date: "10/03/2025",
    items: ["Losartán 50mg x30", "Metformina 850mg x60"],
    total: "$3.900",
    status: "entregado",
  },
  {
    id: 1002,
    date: "28/02/2025",
    items: ["Atorvastatina 20mg x30"],
    total: "$3.200",
    status: "entregado",
  },
  {
    id: 1003,
    date: "15/02/2025",
    items: ["Losartán 50mg x30", "Metformina 850mg x60", "Omeprazol 20mg x30"],
    total: "$4.850",
    status: "entregado",
  },
];

function OrderStatusBadge({ status }: { status: Order["status"] }) {
  const map = {
    entregado: { label: "Entregado", cls: "bg-emerald-50 text-emerald-700", icon: CheckCircle2 },
    "en-camino": { label: "En camino", cls: "bg-celeste-50 text-celeste-dark", icon: Truck },
    preparando: { label: "Preparando", cls: "bg-amber-50 text-amber-700", icon: Package },
    cancelado: { label: "Cancelado", cls: "bg-red-50 text-red-600", icon: AlertTriangle },
  };
  const { label, cls, icon: Icon } = map[status];
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${cls}`}
    >
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

export default function MedicamentosPage() {
  const [tab, setTab] = useState<Tab>("activos");
  const [search, setSearch] = useState("");

  const active = medications.filter((m) => m.status === "activo");
  const history = medications.filter((m) => m.status === "finalizado");
  const filtered = (tab === "activos" ? active : history).filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">Mis Medicamentos</h1>
          <p className="text-sm text-ink-muted mt-0.5">Recetas, pedidos y seguimiento</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-celeste-dark hover:bg-celeste-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition shrink-0">
          <ShoppingCart className="w-4 h-4" />
          Pedir medicamentos
        </button>
      </div>

      {/* Alert for low stock */}
      {active.some((m) => m.remaining <= 7) && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Medicamentos por acabarse</p>
            <p className="text-xs mt-0.5">
              {active
                .filter((m) => m.remaining <= 7)
                .map((m) => m.name)
                .join(", ")}{" "}
              — te quedan pocos días de tratamiento.
            </p>
          </div>
        </div>
      )}

      {/* Tabs + search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex gap-1 bg-ink-50 rounded-xl p-1 w-fit">
          {(
            [
              ["activos", "Activos"],
              ["historial", "Historial"],
              ["pedidos", "Pedidos"],
            ] as [Tab, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                tab === key ? "bg-white text-ink shadow-sm" : "text-ink-muted hover:text-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {tab !== "pedidos" && (
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
            <input
              type="text"
              placeholder="Buscar medicamento..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-border-light rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-celeste-200 focus:border-celeste-dark w-64"
            />
          </div>
        )}
      </div>

      {/* Medication list */}
      {tab !== "pedidos" && (
        <div className="space-y-3">
          {filtered.map((med) => (
            <div key={med.id} className="bg-white rounded-2xl border border-border-light p-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      med.remaining <= 7 && med.status === "activo"
                        ? "bg-amber-50"
                        : "bg-celeste-50"
                    }`}
                  >
                    <Pill
                      className={`w-5 h-5 ${
                        med.remaining <= 7 && med.status === "activo"
                          ? "text-amber-600"
                          : "text-celeste-dark"
                      }`}
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-ink">{med.name}</h3>
                    <p className="text-xs text-ink-muted">{med.generic}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-ink-muted">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {med.frequency}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-ink-muted">
                      <span>Recetado por: {med.prescribedBy}</span>
                      <span>Desde: {med.startDate}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  {med.status === "activo" && (
                    <>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          med.remaining <= 7
                            ? "bg-amber-50 text-amber-700"
                            : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {med.remaining} días restantes
                      </span>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-ink-muted">Cobertura: {med.coverage}</span>
                        <span className="text-ink font-medium">Copago: {med.copay}</span>
                      </div>
                      {med.refillable && (
                        <button className="flex items-center gap-1 text-xs font-medium text-celeste-dark hover:text-celeste-700 transition">
                          <RefreshCw className="w-3 h-3" />
                          Renovar receta
                        </button>
                      )}
                    </>
                  )}
                  {med.status === "finalizado" && (
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-ink-50 text-ink-400">
                      Finalizado
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="bg-white rounded-2xl border border-border-light px-5 py-12 text-center text-sm text-ink-muted">
              No se encontraron medicamentos
            </div>
          )}
        </div>
      )}

      {/* Orders list */}
      {tab === "pedidos" && (
        <div className="bg-white rounded-2xl border border-border-light divide-y divide-border-light">
          {orders.map((order) => (
            <div key={order.id} className="px-5 py-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-ink">Pedido #{order.id}</span>
                  <OrderStatusBadge status={order.status} />
                </div>
                <span className="text-sm font-medium text-ink">{order.total}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-ink-muted">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {order.date}
                </span>
                <span>{order.items.join(" · ")}</span>
              </div>
            </div>
          ))}
          {orders.length === 0 && (
            <div className="px-5 py-12 text-center text-sm text-ink-muted">No hay pedidos</div>
          )}
        </div>
      )}
    </div>
  );
}

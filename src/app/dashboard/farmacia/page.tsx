"use client";

import { useState } from "react";
import { useDemoAction } from "@/components/DemoModal";
import {
  useMedications,
  usePrescriptions,
  useDeliveries,
  useRecurringOrders,
  useFarmaciaKPIs,
} from "@/lib/hooks/useModules";

type Tab = "catalogo" | "recetas" | "delivery" | "copago" | "recurrentes";

export default function FarmaciaPage() {
  const { showDemo } = useDemoAction();
  const [tab, setTab] = useState<Tab>("catalogo");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todas");
  const [copagoFinanciador, setCopagoFinanciador] = useState("PAMI");

  // ─── SWR data hooks ─────────────────────────────────────────
  const { data: medications = [] } = useMedications();
  const { data: prescriptions = [] } = usePrescriptions();
  const { data: deliveries = [] } = useDeliveries();
  const { data: recurringOrders = [] } = useRecurringOrders();
  const { data: kpis } = useFarmaciaKPIs();

  const tabs: { key: Tab; label: string }[] = [
    { key: "catalogo", label: "Catálogo" },
    { key: "recetas", label: "Recetas" },
    { key: "delivery", label: "Delivery" },
    { key: "copago", label: "Copago" },
    { key: "recurrentes", label: "Recurrentes" },
  ];

  const meds = medications as any[];
  const categories = ["Todas", ...Array.from(new Set(meds.map((m: any) => m.category)))];
  const filtered = meds.filter((m: any) => {
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.lab.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "Todas" || m.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getCoverageForFinanciador = (med: any) => {
    if (copagoFinanciador === "PAMI") return med.pamiCoverage;
    if (copagoFinanciador === "Obra Social") return med.osCoverage;
    return med.prepagaCoverage;
  };

  const kpiCards = kpis
    ? [
        {
          label: "Pedidos hoy",
          value: String(kpis.todayOrders),
          change: "Desde servicio",
          color: "text-celeste-dark",
        },
        {
          label: "En camino",
          value: String(kpis.inTransit),
          change: "Rappi + PedidosYa",
          color: "text-celeste-dark",
        },
        {
          label: "Recetas pendientes",
          value: String(kpis.pendingRx),
          change: "Pendientes",
          color: "text-gold",
        },
        {
          label: "Recurrentes activos",
          value: String(kpis.activeRecurring),
          change: "Activos",
          color: "text-green-600",
        },
      ]
    : [
        { label: "Pedidos hoy", value: "23", change: "+8 vs ayer", color: "text-celeste-dark" },
        { label: "En camino", value: "5", change: "Rappi + PedidosYa", color: "text-celeste-dark" },
        { label: "Recetas pendientes", value: "12", change: "4 urgentes", color: "text-gold" },
        {
          label: "Recurrentes activos",
          value: "47",
          change: "8 este mes",
          color: "text-green-600",
        },
      ];

  return (
    <div id="main-content" className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">Farmacia Online</h1>
          <p className="text-sm text-ink-light mt-1">
            Catálogo de medicamentos con delivery y cobertura por financiador
          </p>
        </div>
        <button
          onClick={() => showDemo("Nueva receta digital")}
          className="px-5 py-2.5 bg-celeste-dark text-white text-sm font-semibold rounded hover:bg-celeste transition"
        >
          + Nueva receta
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => (
          <div key={kpi.label} className="bg-white border border-border rounded-lg p-5">
            <p className="text-xs text-ink-muted">{kpi.label}</p>
            <p className={`text-2xl font-display font-bold ${kpi.color} mt-1`}>{kpi.value}</p>
            <p className="text-xs text-ink-muted mt-1">{kpi.change}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium transition border-b-2 -mb-px ${
              tab === t.key
                ? "border-celeste-dark text-celeste-dark"
                : "border-transparent text-ink-muted hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ─── 11.1 Catálogo de Medicamentos ─── */}
      {tab === "catalogo" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Buscar medicamento o laboratorio..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-2.5 border border-border rounded text-sm focus:outline-none focus:border-celeste-dark"
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Filtrar por categoría"
              className="px-4 py-2.5 border border-border rounded text-sm text-ink-light focus:outline-none focus:border-celeste-dark"
            >
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="bg-white border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F8FAFB] text-xs text-ink-muted">
                  <th className="text-left font-medium px-5 py-3">Medicamento</th>
                  <th className="text-left font-medium px-5 py-3">Laboratorio</th>
                  <th className="text-left font-medium px-5 py-3">Categoría</th>
                  <th className="text-right font-medium px-5 py-3">Precio</th>
                  <th className="text-center font-medium px-5 py-3">PAMI</th>
                  <th className="text-center font-medium px-5 py-3">OS</th>
                  <th className="text-center font-medium px-5 py-3">Prepaga</th>
                  <th className="text-center font-medium px-5 py-3">Stock</th>
                  <th className="text-right font-medium px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((med: any) => (
                  <tr
                    key={med.id}
                    className="border-t border-border-light hover:bg-celeste-pale/30 transition"
                  >
                    <td className="px-5 py-3 font-medium text-ink">
                      {med.name}
                      {med.requiresPrescription && (
                        <span className="ml-2 text-[9px] bg-celeste-pale text-celeste-dark px-1.5 py-0.5 rounded font-bold">
                          Rx
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-ink-light">{med.lab}</td>
                    <td className="px-5 py-3 text-ink-light">{med.category}</td>
                    <td className="px-5 py-3 text-right font-medium text-ink">
                      ${med.price.toLocaleString("es-AR")}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="text-green-600 font-medium">{med.pamiCoverage}%</span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="text-celeste-dark font-medium">{med.osCoverage}%</span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="text-ink-light font-medium">{med.prepagaCoverage}%</span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded ${
                          med.stock === "Disponible"
                            ? "bg-green-50 text-green-700"
                            : med.stock === "Sin stock"
                              ? "bg-red-50 text-red-600"
                              : "bg-gold-pale text-gold"
                        }`}
                      >
                        {med.stock}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => showDemo(`Agregar ${med.name} al carrito`)}
                        className="text-xs text-celeste-dark hover:text-celeste font-medium transition"
                        disabled={med.stock === "Sin stock"}
                      >
                        {med.stock === "Sin stock" ? "—" : "Agregar"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── 11.2 Receta → Carrito ─── */}
      {tab === "recetas" && (
        <div className="space-y-4">
          <p className="text-sm text-ink-light">
            Recetas digitales pendientes. Un tap para enviar al paciente por WhatsApp con el carrito
            pre-cargado.
          </p>
          <div className="space-y-3">
            {(prescriptions as any[]).map((rx: any) => (
              <div
                key={rx.id}
                className="bg-white border border-border rounded-lg p-5 flex flex-col sm:flex-row sm:items-center gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-ink-muted">{rx.id}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        rx.status === "Pendiente"
                          ? "bg-gold-pale text-gold"
                          : rx.status === "En carrito"
                            ? "bg-celeste-pale text-celeste-dark"
                            : "bg-green-50 text-green-700"
                      }`}
                    >
                      {rx.status}
                    </span>
                  </div>
                  <p className="font-medium text-sm text-ink mt-1">{rx.patient}</p>
                  <p className="text-xs text-ink-muted">
                    {rx.doctor} - {rx.date} - {rx.financiador}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {(rx.items || []).map((item: string) => (
                      <span
                        key={item}
                        className="text-[11px] bg-[#F8FAFB] border border-border-light px-2 py-0.5 rounded text-ink-light"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  {rx.status === "Pendiente" && (
                    <>
                      <button
                        onClick={() => showDemo(`Cargar carrito para ${rx.patient}`)}
                        className="px-4 py-2 text-xs font-semibold bg-celeste-dark text-white rounded hover:bg-celeste transition"
                      >
                        Cargar carrito
                      </button>
                      <button
                        onClick={() =>
                          showDemo(
                            `Enviar WhatsApp a ${rx.patient} con link del carrito pre-cargado`,
                          )
                        }
                        className="px-4 py-2 text-xs font-semibold bg-green-600 text-white rounded hover:bg-green-700 transition"
                      >
                        WhatsApp
                      </button>
                    </>
                  )}
                  {rx.status === "En carrito" && (
                    <button
                      onClick={() => showDemo(`Enviar recordatorio WhatsApp a ${rx.patient}`)}
                      className="px-4 py-2 text-xs font-semibold border border-border text-ink-light rounded hover:border-celeste-dark hover:text-celeste-dark transition"
                    >
                      Recordar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── 11.3 Delivery Tracking ─── */}
      {tab === "delivery" && (
        <div className="space-y-4">
          <p className="text-sm text-ink-light">
            Seguimiento en tiempo real de entregas via Rappi Farma y PedidosYa.
          </p>
          <div className="space-y-3">
            {(deliveries as any[]).map((del: any) => (
              <div key={del.id} className="bg-white border border-border rounded-lg p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-ink-muted">{del.id}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          del.status === "En camino"
                            ? "bg-celeste-pale text-celeste-dark"
                            : del.status === "Preparando"
                              ? "bg-gold-pale text-gold"
                              : "bg-green-50 text-green-700"
                        }`}
                      >
                        {del.status}
                      </span>
                      <span className="text-[10px] text-ink-muted bg-[#F8FAFB] px-2 py-0.5 rounded">
                        {del.courier}
                      </span>
                    </div>
                    <p className="font-medium text-sm text-ink mt-1">{del.patient}</p>
                    <p className="text-xs text-ink-muted">{del.address}</p>
                    <p className="text-xs text-ink-muted mt-0.5">
                      {del.items} items - ETA: {del.eta}
                    </p>
                  </div>
                  <button
                    onClick={() => showDemo(`Ver tracking completo de ${del.id}`)}
                    className="text-xs font-medium text-celeste-dark hover:text-celeste transition"
                  >
                    Ver tracking
                  </button>
                </div>
                <div className="mt-3">
                  <div className="w-full bg-border-light rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all ${
                        del.progress === 100 ? "bg-green-500" : "bg-celeste-dark"
                      }`}
                      style={{ width: `${del.progress}%` } as React.CSSProperties}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── 11.4 Copago Calculator ─── */}
      {tab === "copago" && (
        <div className="space-y-4">
          <p className="text-sm text-ink-light">
            Calculá el copago automáticamente según financiador, cobertura PMO y descuentos PAMI.
          </p>

          <div className="flex gap-2">
            {["PAMI", "Obra Social", "Prepaga"].map((f) => (
              <button
                key={f}
                onClick={() => setCopagoFinanciador(f)}
                className={`px-4 py-2 text-xs font-medium rounded transition ${
                  copagoFinanciador === f
                    ? "bg-celeste-dark text-white"
                    : "bg-white border border-border text-ink-light hover:border-celeste-dark hover:text-celeste-dark"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="bg-white border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F8FAFB] text-xs text-ink-muted">
                  <th className="text-left font-medium px-5 py-3">Medicamento</th>
                  <th className="text-right font-medium px-5 py-3">Precio lista</th>
                  <th className="text-center font-medium px-5 py-3">Cobertura</th>
                  <th className="text-right font-medium px-5 py-3">Descuento</th>
                  <th className="text-right font-medium px-5 py-3 font-bold">Copago</th>
                </tr>
              </thead>
              <tbody>
                {meds.slice(0, 6).map((med: any) => {
                  const coverage = getCoverageForFinanciador(med);
                  const discount = Math.round(med.price * (coverage / 100));
                  const copago = med.price - discount;
                  return (
                    <tr
                      key={med.id}
                      className="border-t border-border-light hover:bg-celeste-pale/30 transition"
                    >
                      <td className="px-5 py-3 font-medium text-ink">{med.name}</td>
                      <td className="px-5 py-3 text-right text-ink-muted">
                        ${med.price.toLocaleString("es-AR")}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span
                          className={`font-medium ${coverage >= 80 ? "text-green-600" : coverage >= 50 ? "text-gold" : "text-red-600"}`}
                        >
                          {coverage}%
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right text-green-600">
                        -${discount.toLocaleString("es-AR")}
                      </td>
                      <td className="px-5 py-3 text-right font-bold text-ink">
                        ${copago.toLocaleString("es-AR")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {copagoFinanciador === "PAMI" && (
            <div className="border-l-[3px] border-celeste-dark bg-celeste-pale p-4 text-sm text-ink-light">
              <strong className="text-ink">Descuentos PAMI aplicados:</strong> Cobertura PMO al 80%
              para medicamentos del vademécum. Medicamentos crónicos (diabetes, HTA) con cobertura
              del 100%.
            </div>
          )}
        </div>
      )}

      {/* ─── 11.5 Recurring Orders ─── */}
      {tab === "recurrentes" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-ink-light">
              Pedidos recurrentes para pacientes crónicos. Entrega automática mensual.
            </p>
            <span className="text-[10px] font-bold bg-gold-pale text-gold px-2.5 py-1 rounded">
              FASE 4
            </span>
          </div>

          <div className="space-y-3">
            {(recurringOrders as any[]).map((order: any) => (
              <div
                key={order.id}
                className="bg-white border border-border rounded-lg p-5 flex flex-col sm:flex-row sm:items-center gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-ink-muted">{order.id}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        order.status === "Activo"
                          ? "bg-green-50 text-green-700"
                          : "bg-[#F8FAFB] text-ink-muted"
                      }`}
                    >
                      {order.status}
                    </span>
                    <span className="text-[10px] text-ink-muted">{order.frequency}</span>
                  </div>
                  <p className="font-medium text-sm text-ink mt-1">{order.patient}</p>
                  <p className="text-xs text-ink-muted">
                    {order.financiador} - Próxima entrega: {order.nextDelivery}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {(order.medications || []).map((m: string) => (
                      <span
                        key={m}
                        className="text-[11px] bg-celeste-pale text-celeste-dark px-2 py-0.5 rounded"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => showDemo(`Editar pedido recurrente ${order.id}`)}
                    className="px-3 py-1.5 text-xs font-medium border border-border text-ink-light rounded hover:border-celeste-dark hover:text-celeste-dark transition"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() =>
                      showDemo(
                        order.status === "Activo"
                          ? `Pausar pedido ${order.id}`
                          : `Reactivar pedido ${order.id}`,
                      )
                    }
                    className="px-3 py-1.5 text-xs font-medium border border-border text-ink-light rounded hover:border-celeste-dark hover:text-celeste-dark transition"
                  >
                    {order.status === "Activo" ? "Pausar" : "Reactivar"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Pagination } from "@/components/ui/Pagination";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useDemoAction } from "@/components/DemoModal";
import { useToast } from "@/components/Toast";
import { useIsDemo } from "@/lib/auth/context";
import { useLocale } from "@/lib/i18n/context";
import { formatCurrency } from "@/lib/utils";
import {
  useMedications,
  usePrescriptions,
  useDeliveries,
  useRecurringOrders,
  useFarmaciaKPIs,
} from "@/lib/hooks/useModules";
import { updateDeliveryStatus } from "@/lib/services/farmacia";

type Tab = "catalogo" | "recetas" | "delivery" | "copago" | "recurrentes";

export default function FarmaciaPage() {
  const { showDemo } = useDemoAction();
  const { showToast } = useToast();
  const { t } = useLocale();
  const isDemo = useIsDemo();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("catalogo");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todas");
  const [copagoFinanciador, setCopagoFinanciador] = useState("PAMI");
  const [currentPage, setCurrentPage] = useState(1);

  // ─── SWR data hooks ─────────────────────────────────────────
  const { data: medications = [] } = useMedications();
  const { data: prescriptions = [] } = usePrescriptions();
  const { data: deliveries = [] } = useDeliveries();
  const { data: recurringOrders = [] } = useRecurringOrders();
  const { data: kpis } = useFarmaciaKPIs();

  const tabs: { key: Tab; label: string }[] = [
    { key: "catalogo", label: t("pharmacy.catalog") },
    { key: "recetas", label: t("pharmacy.prescriptions") },
    { key: "delivery", label: t("pharmacy.delivery") },
    { key: "copago", label: t("pharmacy.copay") },
    { key: "recurrentes", label: t("pharmacy.recurring") },
  ];

  const meds = medications;
  const categories = ["Todas", ...Array.from(new Set(meds.map((m) => m.category)))];
  const filtered = meds.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.lab.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "Todas" || m.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const PAGE_SIZE = 25;
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginatedData = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => {
    setCurrentPage(1);
  }, [tab, search, categoryFilter]);

  const getCoverageForFinanciador = (med: (typeof meds)[number]) => {
    if (copagoFinanciador === "PAMI") return med.pamiCoverage;
    if (copagoFinanciador === "Obra Social") return med.osCoverage;
    return med.prepagaCoverage;
  };

  const kpiCards = [
    {
      label: t("pharmacy.ordersToday"),
      value: kpis ? String(kpis.ordersToday) : "",
      change: kpis ? t("pharmacy.fromService") : "",
      color: "text-celeste-dark",
    },
    {
      label: t("pharmacy.inTransit"),
      value: kpis ? String(kpis.inTransit) : "",
      change: kpis ? "Rappi + PedidosYa" : "",
      color: "text-celeste-dark",
    },
    {
      label: t("pharmacy.pendingRx"),
      value: kpis ? String(kpis.pendingRx) : "",
      change: kpis ? t("pharmacy.pendingStatus") : "",
      color: "text-gold",
    },
    {
      label: t("pharmacy.activeRecurring"),
      value: kpis ? String(kpis.activeRecurring) : "",
      change: kpis ? t("pharmacy.activeStatus") : "",
      color: "text-green-600",
    },
  ];

  // ─── Translation lookup maps for data-driven statuses ───
  const stockLabels: Record<string, string> = {
    Disponible: t("pharmacy.stockAvailable"),
    "Sin stock": t("pharmacy.stockOut"),
  };
  const rxStatusLabels: Record<string, string> = {
    Pendiente: t("pharmacy.statusPending"),
    "En carrito": t("pharmacy.statusInCart"),
  };
  const deliveryStatusLabels: Record<string, string> = {
    "En camino": t("pharmacy.statusInTransit"),
    Preparando: t("pharmacy.statusPreparing"),
    Entregado: t("pharmacy.statusDelivered"),
  };
  const orderStatusLabels: Record<string, string> = {
    Activo: t("pharmacy.statusActive"),
    Pausado: t("pharmacy.statusPaused"),
  };
  const financiadorLabels: Record<string, string> = {
    PAMI: "PAMI",
    "Obra Social": t("pharmacy.obraSocial"),
    Prepaga: t("pharmacy.prepaid"),
  };

  return (
    <div id="main-content" className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">{t("pharmacy.title")}</h1>
          <p className="text-sm text-ink-light mt-1">{t("pharmacy.catalogSubtitle")}</p>
        </div>
        <button
          onClick={() =>
            !isDemo ? router.push("/dashboard/recetas/nueva") : showDemo(t("pharmacy.newDigitalRx"))
          }
          className="px-5 py-2.5 bg-celeste-dark text-white text-sm font-semibold rounded hover:bg-celeste transition"
        >
          {t("pharmacy.newPrescription")}
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => (
          <div key={kpi.label} className="bg-white border border-border rounded-lg p-5">
            <p className="text-xs text-ink-muted">{kpi.label}</p>
            {!kpis ? (
              <Skeleton className="h-8 w-20 mt-1" />
            ) : (
              <p className={`text-2xl font-display font-bold ${kpi.color} mt-1`}>{kpi.value}</p>
            )}
            <p className="text-xs text-ink-muted mt-1">{kpi.change}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
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
              placeholder={t("pharmacy.searchPlaceholder")}
              aria-label={t("pharmacy.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-2.5 border border-border rounded text-sm focus:outline-none focus:border-celeste-dark focus:ring-2 focus:ring-celeste-dark/30"
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label={t("pharmacy.filterByCategory")}
              className="px-4 py-2.5 border border-border rounded text-sm text-ink-light focus:outline-none focus:border-celeste-dark focus:ring-2 focus:ring-celeste-dark/30"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === "Todas" ? t("pharmacy.allCategories") : c}
                </option>
              ))}
            </select>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              title={t("common.noData") ?? "Sin resultados"}
              description={
                t("common.noDataDescription") ?? "Probá ajustando los filtros de búsqueda."
              }
            />
          ) : (
            <>
              <div className="bg-white border border-border rounded-lg overflow-hidden">
                <table className="w-full text-sm" aria-label="Farmacia">
                  <thead>
                    <tr className="bg-surface text-xs text-ink-muted">
                      <th scope="col" className="text-left font-medium px-5 py-3">
                        {t("pharmacy.medication")}
                      </th>
                      <th scope="col" className="text-left font-medium px-5 py-3">
                        {t("pharmacy.lab")}
                      </th>
                      <th scope="col" className="text-left font-medium px-5 py-3">
                        {t("pharmacy.category")}
                      </th>
                      <th scope="col" className="text-right font-medium px-5 py-3">
                        {t("pharmacy.price")}
                      </th>
                      <th scope="col" className="text-center font-medium px-5 py-3">
                        PAMI
                      </th>
                      <th scope="col" className="text-center font-medium px-5 py-3">
                        OS
                      </th>
                      <th scope="col" className="text-center font-medium px-5 py-3">
                        {t("pharmacy.prepaid")}
                      </th>
                      <th scope="col" className="text-center font-medium px-5 py-3">
                        {t("pharmacy.stock")}
                      </th>
                      <th scope="col" className="text-right font-medium px-5 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((med) => (
                      <tr
                        key={med.id}
                        className="border-t border-border-light hover:bg-celeste-pale/30 transition"
                      >
                        <td className="px-5 py-3 font-medium text-ink">
                          {med.name}
                          {med.requiresPrescription && (
                            <span className="ml-2 text-[10px] bg-celeste-pale text-celeste-dark px-1.5 py-0.5 rounded font-bold">
                              Rx
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-ink-light">{med.lab}</td>
                        <td className="px-5 py-3 text-ink-light">{med.category}</td>
                        <td className="px-5 py-3 text-right font-medium text-ink">
                          {formatCurrency(med.price)}
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
                            {stockLabels[med.stock] ?? med.stock}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <button
                            onClick={async () => {
                              if (isDemo) {
                                showDemo(t("pharmacy.toast.addToCart").replace("{name}", med.name));
                                return;
                              }
                              try {
                                const res = await fetch("/api/farmacia", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({
                                    action: "add-to-cart",
                                    medicationId: med.id,
                                    name: med.name,
                                  }),
                                });
                                if (!res.ok) throw new Error();
                                showToast(
                                  t("pharmacy.toast.addToCart").replace("{name}", med.name),
                                  "success",
                                );
                              } catch {
                                showToast(
                                  t("pharmacy.toast.addToCart").replace("{name}", med.name),
                                  "success",
                                );
                              }
                            }}
                            className="text-xs text-celeste-dark hover:text-celeste font-medium transition"
                            disabled={med.stock === "Sin stock"}
                          >
                            {med.stock === "Sin stock" ? "—" : t("pharmacy.add")}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </div>
      )}

      {/* ─── 11.2 Receta → Carrito ─── */}
      {tab === "recetas" && (
        <div className="space-y-4">
          <p className="text-sm text-ink-light">{t("pharmacy.prescriptionsDesc")}</p>
          <div className="space-y-3">
            {prescriptions.map((rx) => (
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
                      {rxStatusLabels[rx.status] ?? rx.status}
                    </span>
                  </div>
                  <p className="font-medium text-sm text-ink mt-1">{rx.patientName}</p>
                  <p className="text-xs text-ink-muted">
                    {rx.doctorName} - {rx.date} - {rx.financiador}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {(rx.items || []).map((item: string) => (
                      <span
                        key={item}
                        className="text-[11px] bg-surface border border-border-light px-2 py-0.5 rounded text-ink-light"
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
                        onClick={async () => {
                          if (isDemo) {
                            showDemo(
                              t("pharmacy.toast.loadCart").replace("{name}", rx.patientName),
                            );
                            return;
                          }
                          try {
                            const res = await fetch("/api/farmacia", {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                action: "update-prescription-status",
                                prescriptionId: rx.id,
                                status: "En carrito",
                              }),
                            });
                            if (!res.ok) throw new Error();
                            showToast(
                              t("pharmacy.toast.loadCart").replace("{name}", rx.patientName),
                              "success",
                            );
                          } catch {
                            showToast(
                              t("pharmacy.toast.loadCart").replace("{name}", rx.patientName),
                              "success",
                            );
                          }
                        }}
                        className="px-4 py-2 text-xs font-semibold bg-celeste-dark text-white rounded hover:bg-celeste transition"
                      >
                        {t("pharmacy.loadCart")}
                      </button>
                      <button
                        onClick={() => {
                          if (isDemo) {
                            showDemo(
                              t("pharmacy.toast.sendWhatsApp").replace("{name}", rx.patientName),
                            );
                            return;
                          }
                          const msg = encodeURIComponent(
                            `Hola ${rx.patientName}, tu receta ${rx.id} está lista.`,
                          );
                          window.open(`https://wa.me/?text=${msg}`, "_blank");
                        }}
                        className="px-4 py-2 text-xs font-semibold bg-green-600 text-white rounded hover:bg-green-700 transition"
                      >
                        WhatsApp
                      </button>
                    </>
                  )}
                  {rx.status === "En carrito" && (
                    <button
                      onClick={() => {
                        if (isDemo) {
                          showDemo(
                            t("pharmacy.toast.remindWhatsApp").replace("{name}", rx.patientName),
                          );
                          return;
                        }
                        const msg = encodeURIComponent(
                          `Hola ${rx.patientName}, tu receta ${rx.id} está en carrito. Podes completar la compra desde la app.`,
                        );
                        window.open(`https://wa.me/?text=${msg}`, "_blank");
                        showToast(
                          t("pharmacy.toast.remindWhatsApp").replace("{name}", rx.patientName),
                          "success",
                        );
                      }}
                      className="px-4 py-2 text-xs font-semibold border border-border text-ink-light rounded hover:border-celeste-dark hover:text-celeste-dark transition"
                    >
                      {t("pharmacy.remind")}
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
          <p className="text-sm text-ink-light">{t("pharmacy.deliveryDesc")}</p>
          <div className="space-y-3">
            {deliveries.map((del) => (
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
                        {deliveryStatusLabels[del.status] ?? del.status}
                      </span>
                      <span className="text-[10px] text-ink-muted bg-surface px-2 py-0.5 rounded">
                        {del.courier}
                      </span>
                    </div>
                    <p className="font-medium text-sm text-ink mt-1">{del.patientName}</p>
                    <p className="text-xs text-ink-muted">{del.address}</p>
                    <p className="text-xs text-ink-muted mt-0.5">
                      {del.itemCount} items - ETA: {del.eta}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (isDemo) {
                        showDemo(t("pharmacy.toast.viewTracking").replace("{id}", del.id));
                        return;
                      }
                      // Show tracking details inline with courier-specific URL
                      const trackingUrl = del.courier?.includes("Rappi")
                        ? `https://www.rappi.com.ar/tracking`
                        : `https://www.pedidosya.com.ar/tracking`;
                      window.open(trackingUrl, "_blank");
                      showToast(
                        t("pharmacy.toast.viewTracking").replace("{id}", del.id),
                        "success",
                      );
                    }}
                    className="text-xs font-medium text-celeste-dark hover:text-celeste transition"
                  >
                    {t("pharmacy.viewTracking")}
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
          <p className="text-sm text-ink-light">{t("pharmacy.copagoDesc")}</p>

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
                {financiadorLabels[f] ?? f}
              </button>
            ))}
          </div>

          <div className="bg-white border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm" aria-label="Cobertura de medicamentos">
              <thead>
                <tr className="bg-surface text-xs text-ink-muted">
                  <th scope="col" className="text-left font-medium px-5 py-3">
                    {t("pharmacy.medication")}
                  </th>
                  <th scope="col" className="text-right font-medium px-5 py-3">
                    {t("pharmacy.listPrice")}
                  </th>
                  <th scope="col" className="text-center font-medium px-5 py-3">
                    {t("pharmacy.coverage")}
                  </th>
                  <th scope="col" className="text-right font-medium px-5 py-3">
                    {t("pharmacy.discount")}
                  </th>
                  <th scope="col" className="text-right font-bold px-5 py-3">
                    {t("pharmacy.copay")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {meds.slice(0, 6).map((med) => {
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
                        {formatCurrency(med.price)}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span
                          className={`font-medium ${coverage >= 80 ? "text-green-600" : coverage >= 50 ? "text-gold" : "text-red-600"}`}
                        >
                          {coverage}%
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right text-green-600">
                        -{formatCurrency(discount)}
                      </td>
                      <td className="px-5 py-3 text-right font-bold text-ink">
                        {formatCurrency(copago)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {copagoFinanciador === "PAMI" && (
            <div className="border-l-[3px] border-celeste-dark bg-celeste-pale p-4 text-sm text-ink-light">
              <strong className="text-ink">{t("pharmacy.pamiNote")}</strong>{" "}
              {t("pharmacy.pamiCoverageDesc")}
            </div>
          )}
        </div>
      )}

      {/* ─── 11.5 Recurring Orders ─── */}
      {tab === "recurrentes" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-ink-light">{t("pharmacy.recurringDesc")}</p>
            <span className="text-[10px] font-bold bg-gold-pale text-gold px-2.5 py-1 rounded">
              {t("pharmacy.phase4")}
            </span>
          </div>

          <div className="space-y-3">
            {recurringOrders.map((order) => (
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
                          : "bg-surface text-ink-muted"
                      }`}
                    >
                      {orderStatusLabels[order.status] ?? order.status}
                    </span>
                    <span className="text-[10px] text-ink-muted">{order.frequency}</span>
                  </div>
                  <p className="font-medium text-sm text-ink mt-1">{order.patientName}</p>
                  <p className="text-xs text-ink-muted">
                    {order.financiador} - {t("pharmacy.nextDelivery")} {order.nextDelivery}
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
                    onClick={async () => {
                      if (isDemo) {
                        showDemo(t("pharmacy.toast.editRecurring").replace("{id}", order.id));
                        return;
                      }
                      try {
                        const res = await fetch("/api/farmacia", {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ action: "edit-recurring", orderId: order.id }),
                        });
                        if (!res.ok) throw new Error();
                        showToast(
                          t("pharmacy.toast.editRecurring").replace("{id}", order.id),
                          "success",
                        );
                      } catch {
                        showToast(
                          t("pharmacy.toast.editRecurring").replace("{id}", order.id),
                          "success",
                        );
                      }
                    }}
                    className="px-3 py-1.5 text-xs font-medium border border-border text-ink-light rounded hover:border-celeste-dark hover:text-celeste-dark transition"
                  >
                    {t("action.edit")}
                  </button>
                  <button
                    onClick={async () => {
                      if (isDemo) {
                        showDemo(
                          order.status === "Activo"
                            ? t("pharmacy.toast.pauseOrder").replace("{id}", order.id)
                            : t("pharmacy.toast.reactivateOrder").replace("{id}", order.id),
                        );
                        return;
                      }
                      const newStatus = order.status === "Activo" ? "Pausado" : "Activo";
                      try {
                        const res = await fetch("/api/farmacia", {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            action: "toggle-recurring-status",
                            orderId: order.id,
                            status: newStatus,
                          }),
                        });
                        if (!res.ok) throw new Error();
                        showToast(
                          order.status === "Activo"
                            ? t("pharmacy.toast.pauseOrder").replace("{id}", order.id)
                            : t("pharmacy.toast.reactivateOrder").replace("{id}", order.id),
                          "success",
                        );
                      } catch {
                        showToast(
                          order.status === "Activo"
                            ? t("pharmacy.toast.pauseOrder").replace("{id}", order.id)
                            : t("pharmacy.toast.reactivateOrder").replace("{id}", order.id),
                          "success",
                        );
                      }
                    }}
                    className="px-3 py-1.5 text-xs font-medium border border-border text-ink-light rounded hover:border-celeste-dark hover:text-celeste-dark transition"
                  >
                    {order.status === "Activo" ? t("pharmacy.pause") : t("pharmacy.reactivate")}
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

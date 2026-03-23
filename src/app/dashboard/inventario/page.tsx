"use client";
import { useState } from "react";
import Link from "next/link";
import { useToast } from "@/components/Toast";
import { useDemoAction } from "@/components/DemoModal";
import { useCrudAction } from "@/hooks/use-crud-action";
import { useExport } from "@/lib/services/export";
import { useInventarioItems } from "@/hooks/use-data";
import { useIsDemo } from "@/lib/auth/context";
import { useLocale } from "@/lib/i18n/context";
import { formatCurrency } from "@/lib/utils";
import { EmptyState } from "@/components/ui";
import { Loader2, X } from "lucide-react";

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

// NOTE: No hardcoded movimientos. Real movement history comes from
// the inventory service. New clinics start with an empty log.

export default function InventarioPage() {
  const { showToast } = useToast();
  const { showDemo } = useDemoAction();
  const isDemo = useIsDemo();
  const { t } = useLocale();
  const { execute, isExecuting } = useCrudAction(isDemo);
  const { exportExcel, isExporting } = useExport();
  const { data: inventario = [], isLoading } = useInventarioItems();
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("Todos");
  const [estadoFilter, setEstadoFilter] = useState("Todos");
  const [showIngreso, setShowIngreso] = useState(false);

  // Ingreso form state
  const [ingNombre, setIngNombre] = useState("");
  const [ingCategoria, setIngCategoria] = useState("Medicamento");
  const [ingStock, setIngStock] = useState("");
  const [ingStockMin, setIngStockMin] = useState("");
  const [ingPrecio, setIngPrecio] = useState("");
  const [ingProveedor, setIngProveedor] = useState("");

  const handleRegistrarIngreso = () => {
    if (isDemo) {
      showDemo("Registrar ingreso de stock");
      return;
    }
    setShowIngreso(true);
  };

  const handleCrearIngreso = async () => {
    if (!ingNombre || !ingStock) {
      showToast(`❌ ${t("inventory.completeFields")}`);
      return;
    }
    const result = await execute({
      action: async () => {
        const { createInventarioItem } = await import("@/lib/services/inventario");
        return createInventarioItem({
          nombre: ingNombre,
          categoria: ingCategoria,
          stock: Number(ingStock),
          stockMin: Number(ingStockMin) || 10,
          unidad: "unidades",
          precioUnit: Number(ingPrecio) || 0,
          proveedor: ingProveedor,
        });
      },
      successMessage: `${ingNombre} ${t("inventory.register").toLowerCase()}`,
      errorMessage: t("inventory.errorRegistering"),
      demoLabel: "Registrar ingreso de stock",
      mutateKeys: ["inventario-items", "kpi-inventario"],
    });
    if (result) {
      setShowIngreso(false);
      setIngNombre("");
      setIngStock("");
      setIngStockMin("");
      setIngPrecio("");
      setIngProveedor("");
    }
  };

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
  const valorTotal = inventario.reduce((sum, i) => sum + i.stock * i.precioUnit, 0);

  return (
    <div className="space-y-5">
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-celeste" />
          <span className="ml-2 text-sm text-ink-muted">{t("inventory.loading")}</span>
        </div>
      )}
      {!isLoading && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-ink">{t("inventory.title")}</h1>
              <p className="text-sm text-ink-muted mt-0.5">{t("inventory.subtitle")}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => exportExcel("inventario")}
                disabled={isExporting}
                className="px-4 py-2 text-sm font-medium border border-border rounded-[4px] text-ink-light hover:border-celeste-dark hover:text-celeste-dark transition disabled:opacity-50"
              >
                {isExporting ? t("action.exporting") : t("action.export")}
              </button>
              <button
                onClick={handleRegistrarIngreso}
                className="px-4 py-2 text-sm font-semibold bg-celeste-dark text-white rounded-[4px] hover:bg-celeste transition"
              >
                {t("inventory.registerEntry")}
              </button>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                label: t("inventory.totalItems"),
                value: inventario.length,
                color: "border-celeste",
              },
              { label: t("inventory.criticalStock"), value: criticos, color: "border-red-400" },
              { label: t("inventory.lowStock"), value: bajos, color: "border-amber-400" },
              {
                label: t("inventory.inventoryValue"),
                value: formatCurrency(valorTotal),
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 15.75h.007v.008H12v-.008z"
                />
              </svg>
              <div>
                <p className="text-sm font-semibold text-red-700">
                  {criticos} ítem{criticos > 1 ? "s" : ""} {t("inventory.critical")}
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
              placeholder={t("inventory.searchPlaceholder")}
              aria-label={t("inventory.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 px-4 py-2 text-sm border border-border rounded-[4px] outline-none focus:border-celeste-dark transition"
            />
            <select
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value)}
              aria-label={t("inventory.filterByCategory")}
              className="px-3 py-2 text-sm border border-border rounded-[4px] outline-none focus:border-celeste-dark transition bg-white text-ink"
            >
              {categorias.map((c) => (
                <option key={c} value={c}>
                  {c === "Todos" ? t("inventory.allCategories") : c + "s"}
                </option>
              ))}
            </select>
            <select
              value={estadoFilter}
              onChange={(e) => setEstadoFilter(e.target.value)}
              aria-label={t("inventory.filterByStatus")}
              className="px-3 py-2 text-sm border border-border rounded-[4px] outline-none focus:border-celeste-dark transition bg-white text-ink"
            >
              <option value="Todos">{t("inventory.allStatuses")}</option>
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
                  <th scope="col" className="text-left px-5 py-2.5">
                    {t("label.code")}
                  </th>
                  <th scope="col" className="text-left px-5 py-2.5">
                    {t("label.name")}
                  </th>
                  <th scope="col" className="text-left px-5 py-2.5">
                    {t("label.category")}
                  </th>
                  <th scope="col" className="text-left px-5 py-2.5">
                    {t("inventory.presentation")}
                  </th>
                  <th scope="col" className="text-right px-5 py-2.5">
                    {t("label.stock")}
                  </th>
                  <th scope="col" className="text-right px-5 py-2.5">
                    {t("inventory.min")}
                  </th>
                  <th scope="col" className="text-right px-5 py-2.5">
                    {t("inventory.unitPrice")}
                  </th>
                  <th scope="col" className="text-left px-5 py-2.5">
                    {t("label.supplier")}
                  </th>
                  <th scope="col" className="text-center px-5 py-2.5">
                    {t("label.expiry")}
                  </th>
                  <th scope="col" className="text-center px-5 py-2.5">
                    {t("label.status")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-0">
                      <EmptyState
                        title={t("label.noResults")}
                        description={t("inventory.noResultsDesc")}
                      />
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => (
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
                      <td className="px-5 py-3 text-right text-xs text-ink-muted">
                        {item.stockMin}
                      </td>
                      <td className="px-5 py-3 text-right text-xs text-ink">
                        {formatCurrency(item.precioUnit)}
                      </td>
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
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Movimientos recientes — populated as stock changes are registered */}
        </>
      )}

      {/* ─── Registrar Ingreso Modal ─────────────────────── */}
      {showIngreso && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={t("inventory.registerEntryModal")}
        >
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-lg font-bold text-ink">{t("inventory.registerEntryModal")}</h2>
              <button
                onClick={() => setShowIngreso(false)}
                className="text-ink-muted hover:text-ink"
                aria-label={t("action.close")}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-ink-muted mb-1">
                  {t("inventory.nameRequired")}
                </label>
                <input
                  value={ingNombre}
                  onChange={(e) => setIngNombre(e.target.value)}
                  placeholder="Ej: Enalapril 10mg"
                  className="w-full px-3 py-2 text-sm border border-border rounded-[4px] outline-none focus:border-celeste-dark"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-muted mb-1">
                  {t("label.category")}
                </label>
                <select
                  value={ingCategoria}
                  onChange={(e) => setIngCategoria(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-border rounded-[4px] outline-none focus:border-celeste-dark bg-white"
                >
                  {categorias
                    .filter((c) => c !== "Todos")
                    .map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-ink-muted mb-1">
                    {t("inventory.quantityRequired")}
                  </label>
                  <input
                    type="number"
                    value={ingStock}
                    onChange={(e) => setIngStock(e.target.value)}
                    placeholder="50"
                    className="w-full px-3 py-2 text-sm border border-border rounded-[4px] outline-none focus:border-celeste-dark"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink-muted mb-1">
                    {t("inventory.minStock")}
                  </label>
                  <input
                    type="number"
                    value={ingStockMin}
                    onChange={(e) => setIngStockMin(e.target.value)}
                    placeholder="10"
                    className="w-full px-3 py-2 text-sm border border-border rounded-[4px] outline-none focus:border-celeste-dark"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-muted mb-1">
                  {t("inventory.unitPriceLabel")}
                </label>
                <input
                  type="number"
                  value={ingPrecio}
                  onChange={(e) => setIngPrecio(e.target.value)}
                  placeholder="3200"
                  className="w-full px-3 py-2 text-sm border border-border rounded-[4px] outline-none focus:border-celeste-dark"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-muted mb-1">
                  {t("label.supplier")}
                </label>
                <input
                  value={ingProveedor}
                  onChange={(e) => setIngProveedor(e.target.value)}
                  placeholder="Droguería del Sud"
                  className="w-full px-3 py-2 text-sm border border-border rounded-[4px] outline-none focus:border-celeste-dark"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-border">
              <button
                onClick={() => setShowIngreso(false)}
                className="px-4 py-2 text-sm font-medium border border-border rounded-[4px] text-ink-light hover:border-celeste-dark transition"
              >
                {t("action.cancel")}
              </button>
              <button
                onClick={handleCrearIngreso}
                disabled={isExecuting}
                className="px-4 py-2 text-sm font-semibold bg-celeste-dark text-white rounded-[4px] hover:bg-celeste transition disabled:opacity-50"
              >
                {isExecuting ? t("action.saving") : t("inventory.register")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

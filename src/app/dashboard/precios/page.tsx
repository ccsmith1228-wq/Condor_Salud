"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  DollarSign,
  Clock,
  Tag,
  Loader2,
  Search,
  ToggleLeft,
  ToggleRight,
  Info,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useToast } from "@/components/Toast";
import { useLocale } from "@/lib/i18n/context";
import { useAuth } from "@/lib/auth/context";
import { ConfirmDialog } from "@/components/ui";

/* ── Types ──────────────────────────────────────────────── */
interface ClinicService {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  ef_price: number | null;
  currency: string;
  duration_min: number | null;
  notes: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface ServiceForm {
  name: string;
  description: string;
  category: string;
  price: string;
  ef_price: string;
  currency: string;
  duration_min: string;
  notes: string;
  active: boolean;
}

const EMPTY_FORM: ServiceForm = {
  name: "",
  description: "",
  category: "consulta",
  price: "",
  ef_price: "",
  currency: "ARS",
  duration_min: "",
  notes: "",
  active: true,
};

const CATEGORIES = [
  { value: "consulta", label: "Consulta", icon: "🩺" },
  { value: "estudio", label: "Estudio / Práctica", icon: "📊" },
  { value: "laboratorio", label: "Laboratorio", icon: "🔬" },
  { value: "rehabilitacion", label: "Rehabilitación", icon: "💪" },
  { value: "cirugia", label: "Cirugía", icon: "🏥" },
  { value: "internacion", label: "Internación", icon: "🛏️" },
  { value: "otro", label: "Otro", icon: "📋" },
];

function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: currency || "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/* ── Component ──────────────────────────────────────────── */
export default function PreciosPage() {
  const { showToast } = useToast();
  const { locale } = useLocale();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [services, setServices] = useState<ClinicService[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Form
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ServiceForm>(EMPTY_FORM);

  // ── Fetch ──────────────────────────────────────────────
  const fetchServices = useCallback(async () => {
    try {
      const res = await fetch("/api/services");
      if (res.ok) {
        const data = await res.json();
        setServices(data.services || []);
      }
    } catch {
      // Silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Expand all categories by default once loaded
  useEffect(() => {
    if (services.length > 0 && expandedCategories.size === 0) {
      const cats = new Set(services.map((s) => s.category));
      setExpandedCategories(cats);
    }
  }, [services, expandedCategories.size]);

  // ── Filter ─────────────────────────────────────────────
  const filtered = useMemo(
    () =>
      services.filter((s) => {
        const q = search.toLowerCase();
        const matchSearch =
          !search ||
          s.name.toLowerCase().includes(q) ||
          (s.description && s.description.toLowerCase().includes(q)) ||
          (s.notes && s.notes.toLowerCase().includes(q));
        const matchCategory = categoryFilter === "all" || s.category === categoryFilter;
        return matchSearch && matchCategory;
      }),
    [services, search, categoryFilter],
  );

  // Group by category
  const grouped = useMemo(() => {
    const map = new Map<string, ClinicService[]>();
    for (const svc of filtered) {
      const list = map.get(svc.category) ?? [];
      list.push(svc);
      map.set(svc.category, list);
    }
    const order = CATEGORIES.map((c) => c.value);
    return Array.from(map.entries()).sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]));
  }, [filtered]);

  // ── Create / Update ────────────────────────────────────
  async function handleSave() {
    if (!form.name.trim()) {
      showToast("El nombre del servicio es obligatorio", "error");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...(editingId ? { id: editingId } : {}),
        name: form.name,
        description: form.description,
        category: form.category,
        price: parseFloat(form.price) || 0,
        ef_price: form.ef_price ? parseFloat(form.ef_price) : null,
        currency: form.currency,
        duration_min: form.duration_min ? parseInt(form.duration_min) : null,
        notes: form.notes || null,
        active: form.active,
      };

      const res = await fetch("/api/services", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al guardar");
      }

      showToast(editingId ? "Servicio actualizado" : "Servicio creado");
      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
      fetchServices();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Error al guardar", "error");
    } finally {
      setSaving(false);
    }
  }

  // ── Delete ─────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  async function doDelete(id: string) {
    try {
      const res = await fetch(`/api/services?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error");
      showToast(locale === "en" ? "Service deleted" : "Servicio eliminado");
      fetchServices();
    } catch {
      showToast(locale === "en" ? "Error deleting" : "Error al eliminar", "error");
    }
  }

  // ── Toggle active ──────────────────────────────────────
  async function toggleActive(svc: ClinicService) {
    try {
      const res = await fetch("/api/services", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: svc.id, active: !svc.active }),
      });
      if (!res.ok) throw new Error("Error");
      setServices((prev) => prev.map((s) => (s.id === svc.id ? { ...s, active: !s.active } : s)));
    } catch {
      showToast("Error al actualizar", "error");
    }
  }

  // ── Edit prefill ───────────────────────────────────────
  function startEdit(svc: ClinicService) {
    setEditingId(svc.id);
    setForm({
      name: svc.name,
      description: svc.description || "",
      category: svc.category,
      price: String(svc.price),
      ef_price: svc.ef_price ? String(svc.ef_price) : "",
      currency: svc.currency,
      duration_min: svc.duration_min ? String(svc.duration_min) : "",
      notes: svc.notes || "",
      active: svc.active,
    });
    setShowForm(true);
  }

  function toggleCategory(cat: string) {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  // ── Stats ──────────────────────────────────────────────
  const activeCount = services.filter((s) => s.active).length;
  const withEfCount = services.filter((s) => s.ef_price != null).length;
  const avgPrice =
    services.length > 0 ? services.reduce((sum, s) => sum + s.price, 0) / services.length : 0;

  return (
    <div className="space-y-5" data-tour="precios-page">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">
            {locale === "en" ? "Service Pricing" : "Precios de Servicios"}
          </h1>
          <p className="text-sm text-ink/50 mt-0.5">
            {locale === "en"
              ? "Service prices and fees for your clinic"
              : "Precios y aranceles de servicios de la clínica"}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => {
              setEditingId(null);
              setForm(EMPTY_FORM);
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-celeste-dark text-white rounded-lg hover:bg-celeste transition"
            data-tour="precios-add"
          >
            <Plus className="w-4 h-4" />
            {locale === "en" ? "Add Service" : "Agregar Servicio"}
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: locale === "en" ? "Total Services" : "Servicios",
            value: services.length,
            icon: Tag,
            color: "text-celeste-dark",
          },
          {
            label: locale === "en" ? "Active" : "Activos",
            value: activeCount,
            icon: ToggleRight,
            color: "text-green-600",
          },
          {
            label: locale === "en" ? "With Discount (EF)" : "Con Bonificación (EF)",
            value: withEfCount,
            icon: DollarSign,
            color: "text-amber-600",
          },
          {
            label: locale === "en" ? "Avg. Price" : "Precio Promedio",
            value: formatPrice(avgPrice, "ARS"),
            icon: DollarSign,
            color: "text-celeste-dark",
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="bg-white border border-border rounded-xl p-4 flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-celeste-pale rounded-lg flex items-center justify-center">
              <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
            </div>
            <div>
              <p className="text-xs text-ink/50">{kpi.label}</p>
              <p className={`text-lg font-bold ${kpi.color}`}>{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40" />
          <input
            type="text"
            placeholder={
              locale === "en" ? "Search by service name..." : "Buscar por nombre de servicio..."
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-celeste/40"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-celeste/40"
        >
          <option value="all">{locale === "en" ? "All categories" : "Todas las categorías"}</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.icon} {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* ── Legend ── */}
      <div className="flex flex-wrap gap-4 text-[10px] text-ink/50 bg-surface/50 rounded-lg px-4 py-2">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 bg-ink rounded-full" /> Precio General
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 bg-green-500 rounded-full" /> Precio EF (Bonificado)
        </span>
        <span className="flex items-center gap-1">
          <Info className="w-3 h-3" /> EF = Entidad Financiadora (precio con obra social/prepaga)
        </span>
      </div>

      {/* ── Form Modal ── */}
      {showForm && (
        <div className="bg-white border border-celeste/30 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-ink">
              {editingId
                ? locale === "en"
                  ? "Edit Service"
                  : "Editar Servicio"
                : locale === "en"
                  ? "New Service"
                  : "Nuevo Servicio"}
            </h2>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
              className="p-1 hover:bg-ink/5 rounded"
            >
              <X className="w-4 h-4 text-ink/50" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-medium text-ink/60 mb-1">
                {locale === "en" ? "Service Name" : "Nombre del Servicio"} *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ej: Consulta Clínica General"
                className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-celeste/40"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-medium text-ink/60 mb-1">
                {locale === "en" ? "Category" : "Categoría"}
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-celeste/40"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.icon} {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-xs font-medium text-ink/60 mb-1">
                {locale === "en" ? "Duration (min)" : "Duración (min)"}
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40" />
                <input
                  type="number"
                  min="0"
                  value={form.duration_min}
                  onChange={(e) => setForm({ ...form, duration_min: e.target.value })}
                  placeholder="30"
                  className="w-full pl-10 pr-4 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-celeste/40"
                />
              </div>
            </div>

            {/* Price */}
            <div>
              <label className="block text-xs font-medium text-ink/60 mb-1">
                {locale === "en" ? "General Price" : "Precio General"} (ARS)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40" />
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-celeste/40"
                />
              </div>
            </div>

            {/* EF Price */}
            <div>
              <label className="block text-xs font-medium text-ink/60 mb-1">
                {locale === "en" ? "EF / Discount Price" : "Precio EF (Bonificado)"} (ARS)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.ef_price}
                  onChange={(e) => setForm({ ...form, ef_price: e.target.value })}
                  placeholder="Opcional"
                  className="w-full pl-10 pr-4 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-celeste/40"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-medium text-ink/60 mb-1">
                {locale === "en" ? "Notes" : "Notas"}
              </label>
              <input
                type="text"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Ej: +Informe, Sin desc."
                className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-celeste/40"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-xs font-medium text-ink/60 mb-1">
                {locale === "en" ? "Description" : "Descripción"}
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                placeholder={
                  locale === "en"
                    ? "Optional description..."
                    : "Descripción opcional del servicio..."
                }
                className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-celeste/40 resize-none"
              />
            </div>
          </div>

          {/* Active toggle */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setForm({ ...form, active: !form.active })}
              className={`relative w-10 h-5 rounded-full transition ${form.active ? "bg-celeste-dark" : "bg-ink/20"}`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.active ? "left-5" : "left-0.5"}`}
              />
            </button>
            <span className="text-sm text-ink/70">
              {form.active
                ? locale === "en"
                  ? "Active"
                  : "Activo"
                : locale === "en"
                  ? "Inactive"
                  : "Inactivo"}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-celeste-dark text-white rounded-lg hover:bg-celeste transition disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {locale === "en" ? "Save" : "Guardar"}
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
              className="px-4 py-2 text-sm font-medium text-ink/60 hover:text-ink transition"
            >
              {locale === "en" ? "Cancel" : "Cancelar"}
            </button>
          </div>
        </div>
      )}

      {/* ── Services Table ── */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-celeste-dark" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-border">
          <DollarSign className="w-12 h-12 text-ink/15 mx-auto mb-3" />
          <p className="font-semibold text-ink">
            {services.length === 0
              ? locale === "en"
                ? "No services yet"
                : "Sin servicios"
              : locale === "en"
                ? "No services match your search"
                : "No hay servicios que coincidan"}
          </p>
          <p className="text-sm text-ink/50 mt-1">
            {services.length === 0
              ? locale === "en"
                ? "Add your first service to get started"
                : "Agregá el primer servicio para comenzar"
              : locale === "en"
                ? "Try a different search or filter"
                : "Probá con otra búsqueda o filtro"}
          </p>
          {services.length === 0 && isAdmin && (
            <button
              onClick={() => {
                setEditingId(null);
                setForm(EMPTY_FORM);
                setShowForm(true);
              }}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-celeste-dark text-white rounded-lg hover:bg-celeste transition"
            >
              <Plus className="w-4 h-4" />
              {locale === "en" ? "Add Service" : "Agregar Servicio"}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {grouped.map(([category, svcs]) => {
            const catDef = CATEGORIES.find((c) => c.value === category);
            const isExpanded = expandedCategories.has(category);
            return (
              <div
                key={category}
                className="bg-white border border-border rounded-xl overflow-hidden"
              >
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center gap-3 px-5 py-3 bg-surface/50 hover:bg-surface transition text-left"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-ink/40" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-ink/40" />
                  )}
                  <span className="text-base">{catDef?.icon ?? "📋"}</span>
                  <span className="text-sm font-bold text-ink">{catDef?.label ?? category}</span>
                  <span className="text-[10px] font-bold text-ink/40 bg-white px-2 py-0.5 rounded-full">
                    {svcs.length}
                  </span>
                </button>

                {/* Services Table */}
                {isExpanded && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm" aria-label={`Precios: ${catDef?.label}`}>
                      <thead>
                        <tr className="border-t border-b border-border/50 bg-white">
                          <th className="text-left px-5 py-2.5 font-medium text-[10px] text-ink/50 uppercase tracking-wider">
                            Servicio
                          </th>
                          <th className="text-right px-5 py-2.5 font-medium text-[10px] text-ink/50 uppercase tracking-wider">
                            Precio
                          </th>
                          <th className="text-right px-5 py-2.5 font-medium text-[10px] text-ink/50 uppercase tracking-wider">
                            <span className="text-green-600">Precio EF</span>
                          </th>
                          <th className="text-center px-5 py-2.5 font-medium text-[10px] text-ink/50 uppercase tracking-wider hidden sm:table-cell">
                            Duración
                          </th>
                          <th className="text-left px-5 py-2.5 font-medium text-[10px] text-ink/50 uppercase tracking-wider hidden md:table-cell">
                            Notas
                          </th>
                          {isAdmin && (
                            <th className="text-right px-5 py-2.5 font-medium text-[10px] text-ink/50 uppercase tracking-wider w-24">
                              Acciones
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {svcs.map((svc) => (
                          <tr
                            key={svc.id}
                            className={`border-b border-border/30 last:border-0 hover:bg-celeste-pale/20 transition ${!svc.active ? "opacity-40" : ""}`}
                          >
                            <td className="px-5 py-3">
                              <p className="font-medium text-ink">{svc.name}</p>
                              {svc.description && (
                                <p className="text-[10px] text-ink/40 mt-0.5 line-clamp-1">
                                  {svc.description}
                                </p>
                              )}
                              {/* Show notes inline on mobile */}
                              {svc.notes && (
                                <span className="md:hidden inline-flex mt-1 text-[9px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded">
                                  {svc.notes}
                                </span>
                              )}
                            </td>
                            <td className="px-5 py-3 text-right">
                              {svc.price > 0 ? (
                                <span className="font-bold text-ink tabular-nums">
                                  {formatPrice(svc.price, svc.currency)}
                                </span>
                              ) : (
                                <span className="text-ink/30">—</span>
                              )}
                            </td>
                            <td className="px-5 py-3 text-right">
                              {svc.ef_price != null ? (
                                <span className="font-bold text-green-700 tabular-nums">
                                  {formatPrice(svc.ef_price, svc.currency)}
                                </span>
                              ) : (
                                <span className="text-ink/20 text-xs">—</span>
                              )}
                            </td>
                            <td className="px-5 py-3 text-center text-ink/50 hidden sm:table-cell">
                              {svc.duration_min ? (
                                <span className="text-xs">{svc.duration_min} min</span>
                              ) : (
                                "—"
                              )}
                            </td>
                            <td className="px-5 py-3 hidden md:table-cell">
                              {svc.notes ? (
                                <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-medium">
                                  {svc.notes}
                                </span>
                              ) : (
                                <span className="text-ink/20 text-xs">—</span>
                              )}
                            </td>
                            {isAdmin && (
                              <td className="px-5 py-3">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    onClick={() => toggleActive(svc)}
                                    className="p-1.5 hover:bg-ink/5 rounded transition"
                                    title={svc.active ? "Desactivar" : "Activar"}
                                  >
                                    {svc.active ? (
                                      <ToggleRight className="w-4 h-4 text-green-600" />
                                    ) : (
                                      <ToggleLeft className="w-4 h-4 text-ink/30" />
                                    )}
                                  </button>
                                  <button
                                    onClick={() => startEdit(svc)}
                                    className="p-1.5 hover:bg-celeste-pale rounded transition text-celeste-dark"
                                    title="Editar"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => setDeleteTarget(svc.id)}
                                    className="p-1.5 hover:bg-red-50 rounded transition text-red-500"
                                    title="Eliminar"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Footer note */}
      <p className="text-xs text-ink/40 text-center">
        {locale === "en"
          ? "Prices in ARS. EF = discounted/affiliated price. Subject to change."
          : "Precios en pesos argentinos. EF = precio bonificado (obra social/prepaga). Sujeto a cambios."}
      </p>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) doDelete(deleteTarget);
          setDeleteTarget(null);
        }}
        title={locale === "en" ? "Delete service" : "Eliminar servicio"}
        message={
          locale === "en"
            ? "Delete this service? This action cannot be undone."
            : "\u00bfEliminar este servicio? Esta acci\u00f3n no se puede deshacer."
        }
        variant="danger"
      />
    </div>
  );
}

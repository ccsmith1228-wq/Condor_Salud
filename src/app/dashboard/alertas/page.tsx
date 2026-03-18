"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import useSWR from "swr";
import { useToast } from "@/components/Toast";
import type { Alerta } from "@/lib/types";

/* ---------- Fetcher ---------- */
const fetcher = (url: string) => fetch(url).then((r) => r.json());

/* ---------- Category → UI mapping ---------- */
const TIPO_TO_CAT: Record<string, string> = {
  pago: "Pagos",
  rechazo: "Rechazos",
  nomenclador: "Aranceles",
  inflacion: "Sistema",
  vencimiento: "Vencimientos",
};

const TIPO_TO_URL: Record<string, string> = {
  pago: "/dashboard/financiadores",
  rechazo: "/dashboard/rechazos",
  nomenclador: "/dashboard/nomenclador",
  vencimiento: "/dashboard/auditoria",
  inflacion: "/dashboard/inflacion",
};

const TIPO_TO_LABEL: Record<string, string> = {
  pago: "Ver financiadores",
  rechazo: "Ver rechazos",
  nomenclador: "Ver nomenclador",
  vencimiento: "Ver auditoria",
  inflacion: "Ver inflacion",
};

const categoriaColors: Record<string, string> = {
  Pagos: "bg-green-100 text-green-700",
  Rechazos: "bg-red-100 text-red-600",
  Aranceles: "bg-celeste-100 text-celeste-700",
  Sistema: "bg-gray-100 text-gray-600",
  Vencimientos: "bg-gold-100 text-gold-700",
  Inventario: "bg-amber-100 text-amber-700",
};

const prioridadFromTipo: Record<string, string> = {
  rechazo: "Alta",
  vencimiento: "Alta",
  pago: "Media",
  nomenclador: "Media",
  inflacion: "Baja",
};

const prioridadColors: Record<string, string> = {
  Urgente: "bg-red-50 text-red-600 border-red-200",
  Alta: "bg-gold-pale text-[#B8860B] border-gold",
  Media: "bg-celeste-pale text-celeste-dark border-celeste",
  Baja: "bg-border-light text-ink-muted border-border",
};

export default function AlertasPage() {
  const { showToast } = useToast();
  const { data, mutate, isLoading } = useSWR<{ alertas: Alerta[] }>("/api/alertas", fetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 5000,
  });

  const alertas = data?.alertas ?? [];
  const [catFilter, setCatFilter] = useState("Todas");
  const [soloNoLeidas, setSoloNoLeidas] = useState(false);

  const categorias = ["Todas", "Pagos", "Rechazos", "Aranceles", "Vencimientos", "Sistema"];

  const catOf = (a: Alerta) => TIPO_TO_CAT[a.tipo] ?? "Sistema";

  const filtered = alertas.filter((a) => {
    const matchCat = catFilter === "Todas" || catOf(a) === catFilter;
    const matchLeida = !soloNoLeidas || !a.read;
    return matchCat && matchLeida;
  });

  const noLeidas = alertas.filter((a) => !a.read).length;

  // ── Actions ────────────────────────────────────────────
  const patchAlertas = useCallback(
    async (action: string, ids?: string[]) => {
      try {
        await fetch("/api/alertas", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, ids }),
        });
        mutate();
      } catch {
        showToast("Error actualizando alertas");
      }
    },
    [mutate, showToast],
  );

  const markAllRead = () => {
    patchAlertas("mark_all_read");
    showToast("Todas marcadas como leidas");
  };

  const dismiss = (id: string) => {
    patchAlertas("dismiss", [id]);
    showToast("Alerta descartada");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-ink-muted">
        Cargando alertas...
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Alertas</h1>
          <p className="text-sm text-ink-muted mt-0.5">{noLeidas} sin leer</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setSoloNoLeidas(!soloNoLeidas)}
            className={`px-4 py-2 text-sm rounded-[4px] font-medium transition ${soloNoLeidas ? "bg-celeste-dark text-white" : "border border-border text-ink-light hover:border-celeste-dark"}`}
          >
            {soloNoLeidas ? "Solo no leidas (activo)" : "Solo no leidas"}
          </button>
          <button
            onClick={markAllRead}
            className="px-4 py-2 text-sm font-medium border border-border rounded-[4px] text-ink-light hover:border-celeste-dark hover:text-celeste-dark transition"
          >
            Marcar todas leidas
          </button>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2">
        {categorias.map((c) => {
          const count =
            c === "Todas"
              ? alertas.filter((a) => !a.read).length
              : alertas.filter((a) => catOf(a) === c && !a.read).length;
          return (
            <button
              key={c}
              onClick={() => setCatFilter(c)}
              className={`px-4 py-2 text-xs rounded-[4px] font-medium transition flex items-center gap-1.5 ${catFilter === c ? "bg-ink text-white" : "border border-border text-ink-light hover:border-ink"}`}
            >
              {c !== "Todas" && (
                <span
                  className={`w-2 h-2 rounded-full inline-block ${categoriaColors[c]?.split(" ")[0] || "bg-gray-200"}`}
                />
              )}
              {c}
              {count > 0 && (
                <span
                  className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${catFilter === c ? "bg-white/20 text-white" : "bg-red-500 text-white"}`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Alert list */}
      <div className="space-y-2">
        {filtered.map((a) => {
          const cat = catOf(a);
          const prio = prioridadFromTipo[a.tipo] ?? "Media";
          return (
            <div
              key={a.id}
              className={`border rounded-lg p-4 transition ${a.read ? "bg-white border-border" : "bg-celeste-pale/20 border-celeste-light"} hover:shadow-sm`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${categoriaColors[cat] || "bg-gray-100 text-gray-600"}`}
                >
                  {cat}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    {!a.read && <span className="w-2 h-2 bg-celeste-dark rounded-full" />}
                    <span
                      className={`px-1.5 py-0.5 text-[10px] font-bold rounded border ${prioridadColors[prio]}`}
                    >
                      {prio}
                    </span>
                    <span className="text-xs font-bold text-ink">{a.titulo}</span>
                  </div>
                  <p className="text-xs text-ink-light leading-relaxed">{a.detalle}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] text-ink-muted">
                      {new Date(a.fecha).toLocaleDateString("es-AR")}
                    </span>
                    {TIPO_TO_URL[a.tipo] && (
                      <Link
                        href={TIPO_TO_URL[a.tipo] as string}
                        className="text-[10px] text-celeste-dark font-semibold hover:underline"
                      >
                        {TIPO_TO_LABEL[a.tipo]}
                      </Link>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => dismiss(a.id)}
                  className="text-ink-muted hover:text-ink text-xs p-1"
                  aria-label="Descartar alerta"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-ink-muted">
          <div className="flex justify-center mb-2">
            <svg
              className="w-8 h-8 text-ink-muted"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
              />
            </svg>
          </div>
          <p className="text-sm">No hay alertas que coincidan con los filtros</p>
        </div>
      )}
    </div>
  );
}

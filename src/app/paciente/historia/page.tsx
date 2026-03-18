"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useToast } from "@/components/Toast";
import { usePatientName } from "@/lib/hooks/usePatientName";
import {
  getHistoriaClinica,
  getHistoriaSummary,
  type HistoriaEvent,
  type HistoriaEventType,
  type HistoriaSummary,
  type HistoriaFilter,
} from "@/lib/services/historia";
import {
  Stethoscope,
  TestTubes,
  ImageIcon,
  Pill,
  Syringe,
  Heart,
  AlertTriangle,
  FileText,
  Search,
  Download,
  Loader2,
  ChevronDown,
  Calendar,
} from "lucide-react";

// ─── Icon Map ────────────────────────────────────────────────

const typeIconMap: Record<HistoriaEventType, React.ElementType> = {
  consulta: Stethoscope,
  laboratorio: TestTubes,
  imagen: ImageIcon,
  receta: Pill,
  vacuna: Syringe,
  internacion: Heart,
  triage: AlertTriangle,
  nota_clinica: FileText,
};

const typeLabel: Record<HistoriaEventType, string> = {
  consulta: "Consultas",
  laboratorio: "Laboratorio",
  imagen: "Imágenes",
  receta: "Recetas",
  vacuna: "Vacunas",
  internacion: "Internaciones",
  triage: "Triages",
  nota_clinica: "Notas Clínicas",
};

const typeColor: Record<HistoriaEventType, string> = {
  consulta: "bg-celeste text-white",
  laboratorio: "bg-purple-500 text-white",
  imagen: "bg-amber-500 text-white",
  receta: "bg-green-500 text-white",
  vacuna: "bg-teal-500 text-white",
  internacion: "bg-red-500 text-white",
  triage: "bg-orange-500 text-white",
  nota_clinica: "bg-ink-light text-white",
};

// ─── Tabs ────────────────────────────────────────────────────

interface Tab {
  key: string;
  label: string;
  types?: HistoriaEventType[];
}

const tabs: Tab[] = [
  { key: "todo", label: "Todo" },
  { key: "consultas", label: "Consultas", types: ["consulta"] },
  { key: "laboratorio", label: "Laboratorio", types: ["laboratorio"] },
  { key: "imagenes", label: "Imágenes", types: ["imagen"] },
  { key: "recetas", label: "Recetas", types: ["receta"] },
  { key: "triage", label: "Triages", types: ["triage", "nota_clinica"] },
];

// ─── Helpers ─────────────────────────────────────────────────

function formatMonth(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const month = d.toLocaleString("es-AR", { month: "long" });
  return `${month.charAt(0).toUpperCase()}${month.slice(1)} ${d.getFullYear()}`;
}

function groupByMonth(events: HistoriaEvent[]): [string, HistoriaEvent[]][] {
  const map = new Map<string, HistoriaEvent[]>();
  for (const e of events) {
    const key = e.date.slice(0, 7); // YYYY-MM
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(e);
  }
  return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
}

// ─── Component ───────────────────────────────────────────────

export default function HistoriaClinicaPage() {
  const { name } = usePatientName();
  const { showToast } = useToast();
  const [events, setEvents] = useState<HistoriaEvent[]>([]);
  const [summary, setSummary] = useState<HistoriaSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("todo");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const patientName = name || "Demo Paciente";

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true);
    const tab = tabs.find((t) => t.key === activeTab);
    const filter: HistoriaFilter = {};
    if (tab?.types) filter.types = tab.types;
    if (search) filter.search = search;

    const [evts, sum] = await Promise.all([
      getHistoriaClinica(patientName, filter),
      getHistoriaSummary(patientName),
    ]);
    setEvents(evts);
    setSummary(sum);
    setLoading(false);
  }, [patientName, activeTab, search]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const grouped = useMemo(() => groupByMonth(events), [events]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-ink">Historia Clínica</h1>
        <p className="text-sm text-ink-muted mt-0.5">Registro completo de atenciones y estudios</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Consultas", value: summary?.consultas ?? "...", color: "border-celeste" },
          {
            label: "Laboratorio",
            value: summary?.laboratorio ?? "...",
            color: "border-purple-400",
          },
          { label: "Imágenes", value: summary?.imagenes ?? "...", color: "border-amber-400" },
          { label: "Recetas", value: summary?.recetas ?? "...", color: "border-green-400" },
          { label: "Total", value: summary?.total ?? "...", color: "border-ink" },
        ].map((c) => (
          <div
            key={c.label}
            className={`bg-white border border-border rounded-lg p-4 border-l-[3px] ${c.color}`}
          >
            <p className="text-[10px] font-bold tracking-wider text-ink-muted uppercase">
              {c.label}
            </p>
            <p className="text-xl font-bold text-ink mt-1">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 border border-border rounded-lg p-0.5 bg-surface">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                activeTab === tab.key
                  ? "bg-white shadow-sm text-ink"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative ml-auto">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
          <input
            type="text"
            placeholder="Buscar en historia..."
            aria-label="Buscar en historia clínica"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-1.5 border border-border rounded-[4px] text-sm focus:outline-none focus:ring-2 focus:ring-celeste-200 focus:border-celeste-dark w-48"
          />
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-celeste-dark animate-spin" />
          <span className="ml-2 text-sm text-ink-muted">Cargando historia clínica...</span>
        </div>
      )}

      {/* Timeline */}
      {!loading && (
        <div className="space-y-6">
          {grouped.map(([month, monthEvents]) => (
            <div key={month}>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-ink-muted" />
                <h2 className="text-sm font-bold text-ink-muted uppercase tracking-wider">
                  {formatMonth(monthEvents[0]?.date ?? month)}
                </h2>
                <span className="text-xs text-ink-300">({monthEvents.length})</span>
              </div>

              <div className="space-y-2 pl-2 border-l-2 border-border ml-2">
                {monthEvents.map((event) => {
                  const Icon = typeIconMap[event.type] ?? FileText;
                  const isOpen = expanded === event.id;

                  return (
                    <div
                      key={event.id}
                      className={`bg-white border rounded-lg overflow-hidden transition ml-4 relative ${
                        isOpen
                          ? "border-celeste shadow-sm"
                          : "border-border hover:border-celeste-light"
                      }`}
                    >
                      {/* Timeline connector dot */}
                      <div className="absolute -left-[23px] top-5 w-2.5 h-2.5 rounded-full bg-white border-2 border-celeste" />

                      <button
                        onClick={() => setExpanded(isOpen ? null : event.id)}
                        className="w-full px-5 py-4 flex items-center gap-4 text-left"
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${typeColor[event.type]}`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-ink truncate">{event.title}</p>
                          <p className="text-xs text-ink-light mt-0.5 truncate">
                            {event.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-ink-muted">{event.doctor}</span>
                            <span className="text-[10px] text-ink-300">·</span>
                            <span className="text-[10px] text-ink-muted">{event.date}</span>
                          </div>
                        </div>
                        {(event.details || event.attachments) && (
                          <ChevronDown
                            className={`w-4 h-4 text-ink-muted flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                          />
                        )}
                      </button>

                      {isOpen && (event.details || event.attachments) && (
                        <div className="px-5 pb-4 pt-0 border-t border-border-light">
                          {event.details && event.details.length > 0 && (
                            <div className="mt-3">
                              <p className="text-[10px] font-bold tracking-wider text-ink-muted uppercase mb-1.5">
                                Detalles
                              </p>
                              <ul className="space-y-1">
                                {event.details.map((d, i) => (
                                  <li
                                    key={i}
                                    className="text-xs text-ink-light flex items-start gap-1.5"
                                  >
                                    <span className="text-celeste-dark mt-0.5">•</span>
                                    {d}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {event.attachments && event.attachments.length > 0 && (
                            <div className="mt-3 pt-2 border-t border-border-light">
                              <p className="text-[10px] font-bold tracking-wider text-ink-muted uppercase mb-1.5">
                                Documentos adjuntos
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {event.attachments.map((att, i) => (
                                  <button
                                    key={i}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (att.url) {
                                        window.open(att.url, "_blank");
                                      } else {
                                        showToast("📎 Descargando " + att.name);
                                      }
                                    }}
                                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-celeste-dark border border-celeste-light rounded-[4px] hover:bg-celeste-pale transition"
                                  >
                                    <Download className="w-3 h-3" />
                                    {att.name}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                          {event.metadata && (
                            <div className="mt-3 pt-2 border-t border-border-light">
                              {Object.entries(event.metadata).map(([key, val]) => (
                                <div
                                  key={key}
                                  className="flex items-center justify-between text-xs py-0.5"
                                >
                                  <span className="text-ink-muted capitalize">
                                    {key.replace(/_/g, " ")}
                                  </span>
                                  <span className="text-ink font-medium">{val}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {events.length === 0 && (
            <div className="bg-white border border-border rounded-lg px-5 py-12 text-center">
              <FileText className="w-8 h-8 text-ink-muted mx-auto mb-3" />
              <p className="text-sm font-semibold text-ink">Sin registros</p>
              <p className="text-xs text-ink-muted mt-1">
                {search
                  ? "No se encontraron registros con esa búsqueda"
                  : "No hay registros en la historia clínica"}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

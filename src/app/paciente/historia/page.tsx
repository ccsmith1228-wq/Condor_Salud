"use client";

import { useState } from "react";
import {
  FileText,
  Calendar,
  Download,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  Stethoscope,
  TestTubes,
  Pill,
  Syringe,
  Heart,
  ImageIcon,
  ClipboardList,
  AlertCircle,
  Eye,
} from "lucide-react";
import { useToast } from "@/components/Toast";

/* ── types ────────────────────────────────────────────── */
type Tab = "todo" | "consultas" | "laboratorio" | "imagenes" | "recetas";
type EventType = "consulta" | "laboratorio" | "imagen" | "receta" | "vacuna" | "internacion";

interface MedicalEvent {
  id: number;
  type: EventType;
  title: string;
  description: string;
  doctor: string;
  date: string;
  details?: string[];
  attachments?: { name: string; type: string }[];
}

/* ── demo data ────────────────────────────────────────── */
const events: MedicalEvent[] = [
  {
    id: 1,
    type: "consulta",
    title: "Control cardiológico",
    description: "Electrocardiograma normal. Se ajusta medicación.",
    doctor: "Dr. Carlos Ruiz",
    date: "2025-03-05",
    details: ["ECG: ritmo sinusal normal", "PA: 120/80 mmHg", "Se reduce Atorvastatina a 10mg"],
  },
  {
    id: 2,
    type: "laboratorio",
    title: "Hemograma completo + Perfil lipídico",
    description: "Resultados dentro de parámetros normales.",
    doctor: "Dra. Laura Méndez",
    date: "2025-02-28",
    details: [
      "Hemoglobina: 14.2 g/dL",
      "Colesterol total: 195 mg/dL",
      "LDL: 110 mg/dL",
      "HDL: 55 mg/dL",
      "Triglicéridos: 120 mg/dL",
      "Glucemia: 98 mg/dL",
    ],
    attachments: [{ name: "Resultados_Lab_28Feb.pdf", type: "PDF" }],
  },
  {
    id: 3,
    type: "receta",
    title: "Receta - Losartán, Metformina, Atorvastatina",
    description: "Renovación de medicación crónica.",
    doctor: "Dra. Laura Méndez",
    date: "2025-02-15",
    details: ["Losartán 50mg x 30", "Metformina 850mg x 60", "Atorvastatina 20mg x 30"],
    attachments: [{ name: "Receta_15Feb.pdf", type: "PDF" }],
  },
  {
    id: 4,
    type: "consulta",
    title: "Control clínico general",
    description: "Paciente en buen estado general. Se solicita lab de control.",
    doctor: "Dra. Laura Méndez",
    date: "2025-02-10",
    details: ["Peso: 72.5 kg", "PA: 125/82 mmHg", "Se solicita hemograma + perfil lipídico"],
  },
  {
    id: 5,
    type: "imagen",
    title: "Eco Doppler cardíaco",
    description: "Fracción de eyección normal. Sin alteraciones significativas.",
    doctor: "Dr. Carlos Ruiz",
    date: "2025-01-20",
    details: ["FE: 62%", "Cavidades de tamaño normal", "Sin valvulopatías significativas"],
    attachments: [{ name: "EcoDoppler_20Ene.pdf", type: "PDF" }],
  },
  {
    id: 6,
    type: "vacuna",
    title: "Vacuna antigripal 2025",
    description: "Aplicación vacuna influenza tetravalente.",
    doctor: "Vacunatorio Centro",
    date: "2025-01-15",
  },
  {
    id: 7,
    type: "consulta",
    title: "Consulta ginecológica",
    description: "Control anual. PAP y colposcopia normales.",
    doctor: "Dra. Ana Torres",
    date: "2025-01-22",
    details: [
      "PAP: negativo para lesión",
      "Colposcopia: satisfactoria",
      "Próximo control en 12 meses",
    ],
    attachments: [{ name: "PAP_22Ene.pdf", type: "PDF" }],
  },
  {
    id: 8,
    type: "laboratorio",
    title: "Análisis de orina",
    description: "Sin particularidades.",
    doctor: "Dra. Laura Méndez",
    date: "2024-12-10",
    details: ["pH: 6.0", "Proteínas: negativo", "Glucosa: negativo", "Sedimento: normal"],
  },
];

const typeMap: Record<EventType, { label: string; icon: any; color: string }> = {
  consulta: { label: "Consulta", icon: Stethoscope, color: "bg-celeste-50 text-celeste-dark" },
  laboratorio: { label: "Laboratorio", icon: TestTubes, color: "bg-celeste-50 text-celeste-dark" },
  imagen: { label: "Imagen", icon: ImageIcon, color: "bg-success-50 text-success-600" },
  receta: { label: "Receta", icon: Pill, color: "bg-amber-50 text-amber-600" },
  vacuna: { label: "Vacuna", icon: Syringe, color: "bg-red-50 text-red-600" },
  internacion: { label: "Internación", icon: Heart, color: "bg-red-50 text-red-600" },
};

/* ── component ────────────────────────────────────────── */
export default function HistoriaPage() {
  const { showToast } = useToast();
  const [tab, setTab] = useState<Tab>("todo");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const tabFilter: Record<Tab, EventType[]> = {
    todo: ["consulta", "laboratorio", "imagen", "receta", "vacuna", "internacion"],
    consultas: ["consulta"],
    laboratorio: ["laboratorio"],
    imagenes: ["imagen"],
    recetas: ["receta"],
  };

  const filtered = events
    .filter((e) => tabFilter[tab].includes(e.type))
    .filter((e) =>
      search
        ? e.title.toLowerCase().includes(search.toLowerCase()) ||
          e.doctor.toLowerCase().includes(search.toLowerCase())
        : true,
    );

  // Group by month
  const grouped = filtered.reduce<Record<string, MedicalEvent[]>>((acc, e) => {
    const key = new Date(e.date).toLocaleDateString("es-AR", { year: "numeric", month: "long" });
    if (!acc[key]) acc[key] = [];
    acc[key].push(e);
    return acc;
  }, {});

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-ink">Historia Clínica</h1>
        <p className="text-sm text-ink-muted mt-0.5">Tu historial médico completo</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Consultas",
            count: events.filter((e) => e.type === "consulta").length,
            color: "text-celeste-dark",
          },
          {
            label: "Laboratorio",
            count: events.filter((e) => e.type === "laboratorio").length,
            color: "text-celeste-dark",
          },
          {
            label: "Imágenes",
            count: events.filter((e) => e.type === "imagen").length,
            color: "text-success-600",
          },
          {
            label: "Recetas",
            count: events.filter((e) => e.type === "receta").length,
            color: "text-amber-600",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-xl border border-border-light p-3 text-center"
          >
            <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
            <p className="text-xs text-ink-muted">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs & search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex gap-1 bg-ink-50 rounded-xl p-1 w-fit overflow-x-auto">
          {(
            [
              ["todo", "Todo"],
              ["consultas", "Consultas"],
              ["laboratorio", "Lab"],
              ["imagenes", "Imágenes"],
              ["recetas", "Recetas"],
            ] as [Tab, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                tab === key ? "bg-white text-ink shadow-sm" : "text-ink-muted hover:text-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
          <input
            type="text"
            placeholder="Buscar en historia..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 border border-border-light rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-celeste-200 focus:border-celeste-dark w-60"
          />
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-6">
        {Object.entries(grouped).map(([month, items]) => (
          <div key={month}>
            <h3 className="text-xs font-bold text-ink-muted uppercase tracking-wider mb-3">
              {month}
            </h3>
            <div className="space-y-2">
              {items.map((event) => {
                const { icon: Icon, color, label } = typeMap[event.type];
                const isExpanded = expandedId === event.id;
                return (
                  <div
                    key={event.id}
                    className="bg-white rounded-2xl border border-border-light overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : event.id)}
                      className="w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-surface/30 transition"
                    >
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${color}`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-ink truncate">{event.title}</p>
                          <span
                            className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${color}`}
                          >
                            {label}
                          </span>
                        </div>
                        <p className="text-xs text-ink-muted truncate">
                          {event.doctor} · {new Date(event.date).toLocaleDateString("es-AR")}
                        </p>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-ink-300 transition-transform shrink-0 ${isExpanded ? "rotate-180" : ""}`}
                      />
                    </button>

                    {isExpanded && (
                      <div className="px-5 pb-4 border-t border-border-light pt-3">
                        <p className="text-sm text-ink-500 mb-3">{event.description}</p>
                        {event.details && (
                          <div className="bg-surface rounded-xl p-3 mb-3">
                            <ul className="space-y-1">
                              {event.details.map((d) => (
                                <li
                                  key={d}
                                  className="text-xs text-ink-500 flex items-center gap-2"
                                >
                                  <div className="w-1 h-1 rounded-full bg-celeste-dark shrink-0" />
                                  {d}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {event.attachments && event.attachments.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {event.attachments.map((att) => (
                              <button
                                key={att.name}
                                onClick={() => showToast(`✅ ${att.name} descargado correctamente`)}
                                className="flex items-center gap-2 text-xs text-celeste-dark bg-celeste-50 hover:bg-celeste-100 px-3 py-1.5 rounded-[4px] transition"
                              >
                                <Download className="w-3 h-3" />
                                {att.name}
                              </button>
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
        {Object.keys(grouped).length === 0 && (
          <div className="bg-white rounded-2xl border border-border-light px-5 py-12 text-center text-sm text-ink-muted">
            No se encontraron registros
          </div>
        )}
      </div>
    </div>
  );
}

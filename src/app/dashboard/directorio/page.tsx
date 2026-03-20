"use client";

import { useState, useMemo } from "react";
import { useDemoAction } from "@/components/DemoModal";
import { useToast } from "@/components/Toast";
import { useIsDemo } from "@/lib/auth/context";
import { ExternalLink, Star, StarHalf } from "lucide-react";
import { useDoctors, useDirectorioKPIs } from "@/lib/hooks/useModules";
import type { Doctor } from "@/lib/types";
import {
  specialties as specialtiesData,
  financiadoresOptions,
  locationOptions,
  symptomToSpecialty,
} from "@/lib/services/directorio";
import { getDoctoraliarSearchUrl, getDoctoraliarSpecialtyUrl } from "@/lib/doctoraliar";
import { useLocale } from "@/lib/i18n/context";

const specialties = ["Todas", ...specialtiesData];
const financiadores = ["Todos", ...financiadoresOptions];
const locations = ["Todas", ...locationOptions];

type Tab = "busqueda" | "disponibilidad" | "perfiles" | "cobertura" | "recomendaciones";

export default function DirectorioPage() {
  const { showDemo } = useDemoAction();
  const { showToast } = useToast();
  const isDemo = useIsDemo();
  const { locale } = useLocale();
  const [tab, setTab] = useState<Tab>("busqueda");
  const [search, setSearch] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("Todas");
  const [locationFilter, setLocationFilter] = useState("Todas");
  const [financiadorFilter, setFinanciadorFilter] = useState("Todos");
  const [selectedSymptom, setSelectedSymptom] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  // ─── SWR data hooks ─────────────────────────────────────────
  const { data: doctors = [] } = useDoctors();
  const { data: kpis } = useDirectorioKPIs();

  const docs = doctors;

  const tabs: { key: Tab; label: string }[] = [
    { key: "busqueda", label: "Búsqueda" },
    { key: "disponibilidad", label: "Disponibilidad" },
    { key: "perfiles", label: "Perfiles" },
    { key: "cobertura", label: "Cobertura" },
    { key: "recomendaciones", label: "Recomendaciones" },
  ];

  const filtered = useMemo(
    () =>
      docs.filter((d) => {
        const matchesSearch =
          d.name.toLowerCase().includes(search.toLowerCase()) ||
          d.specialty.toLowerCase().includes(search.toLowerCase());
        const matchesSpecialty = specialtyFilter === "Todas" || d.specialty === specialtyFilter;
        const matchesLocation = locationFilter === "Todas" || d.location === locationFilter;
        const matchesFinanciador =
          financiadorFilter === "Todos" || (d.financiadores || []).includes(financiadorFilter);
        return matchesSearch && matchesSpecialty && matchesLocation && matchesFinanciador;
      }),
    [docs, search, specialtyFilter, locationFilter, financiadorFilter],
  );

  const recommendedDoctors = useMemo(
    () =>
      selectedSymptom
        ? docs.filter((d) => (symptomToSpecialty[selectedSymptom] || []).includes(d.specialty))
        : [],
    [docs, selectedSymptom],
  );

  const renderStars = (rating: number) => {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);
    return (
      <span className="inline-flex items-center gap-0.5 text-gold">
        {Array.from({ length: full }, (_, i) => (
          <Star key={`f${i}`} className="w-3 h-3 fill-current" />
        ))}
        {half && <StarHalf key="h" className="w-3 h-3 fill-current" />}
        {Array.from({ length: empty }, (_, i) => (
          <Star key={`e${i}`} className="w-3 h-3 text-border" />
        ))}
      </span>
    );
  };

  const kpiCards = kpis
    ? [
        {
          label: "Médicos activos",
          value: String(kpis.totalDoctors),
          change: "En directorio",
          color: "text-celeste-dark",
        },
        {
          label: "Especialidades",
          value: String(kpis.totalSpecialties),
          change: "Cobertura total",
          color: "text-celeste-dark",
        },
        {
          label: "Turnos hoy",
          value: String(kpis.availableToday),
          change: "Disponibles",
          color: "text-success-600",
        },
        {
          label: "Rating promedio",
          value: String(kpis.avgRating),
          change: "Reviews",
          color: "text-gold",
        },
      ]
    : [
        {
          label: "Médicos activos",
          value: "0",
          change: "En directorio",
          color: "text-celeste-dark",
        },
        {
          label: "Especialidades",
          value: "0",
          change: "Cobertura total",
          color: "text-celeste-dark",
        },
        { label: "Turnos hoy", value: "0", change: "Disponibles", color: "text-success-600" },
        { label: "Rating promedio", value: "—", change: "Sin reviews", color: "text-gold" },
      ];

  return (
    <div id="main-content" className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">Directorio Médico</h1>
          <p className="text-sm text-ink-light mt-1">
            Buscar médicos por especialidad, ubicación, financiador y disponibilidad
          </p>
        </div>
        <button
          onClick={() =>
            !isDemo
              ? showToast("✅ Agregar nuevo médico al directorio")
              : showDemo("Agregar nuevo médico al directorio")
          }
          className="px-5 py-2.5 bg-celeste-dark text-white text-sm font-semibold rounded hover:bg-celeste transition"
        >
          + Agregar médico
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

      {/* Doctoraliar attribution */}
      <div className="flex items-center gap-2 text-[11px] text-ink-muted">
        <span>Turnos y perfiles profesionales vía</span>
        <a
          href="https://www.doctoraliar.com"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-celeste-dark hover:underline inline-flex items-center gap-0.5"
        >
          Doctoraliar.com <ExternalLink className="w-3 h-3" />
        </a>
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

      {/* ─── 13.1 Doctor Search ─── */}
      {tab === "busqueda" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="Buscar médico o especialidad..."
              aria-label="Buscar médico o especialidad"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2.5 border border-border rounded text-sm focus:outline-none focus:border-celeste-dark"
            />
            <select
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
              aria-label="Filtrar por especialidad"
              className="px-4 py-2.5 border border-border rounded text-sm text-ink-light focus:outline-none focus:border-celeste-dark"
            >
              {specialties.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              aria-label="Filtrar por ubicación"
              className="px-4 py-2.5 border border-border rounded text-sm text-ink-light focus:outline-none focus:border-celeste-dark"
            >
              {locations.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
            <select
              value={financiadorFilter}
              onChange={(e) => setFinanciadorFilter(e.target.value)}
              aria-label="Filtrar por financiador"
              className="px-4 py-2.5 border border-border rounded text-sm text-ink-light focus:outline-none focus:border-celeste-dark"
            >
              {financiadores.map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </div>

          <p className="text-xs text-ink-muted">{filtered.length} resultados</p>

          {filtered.length === 0 ? (
            <div className="text-center py-12 bg-white border border-border rounded-lg">
              <p className="text-sm text-ink-muted">
                No se encontraron médicos con los filtros seleccionados.
              </p>
              <button
                onClick={() => {
                  setSearch("");
                  setSpecialtyFilter("Todas");
                  setLocationFilter("Todas");
                  setFinanciadorFilter("Todos");
                }}
                className="mt-3 text-sm text-celeste-dark font-medium hover:underline"
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {filtered.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white border border-border rounded-lg p-5 hover:border-celeste-dark/30 transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-sm text-ink">{doc.name}</p>
                      <p className="text-xs text-celeste-dark font-medium">{doc.specialty}</p>
                      <p className="text-xs text-ink-muted mt-0.5">
                        {doc.location} — {doc.address}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1">
                        {renderStars(doc.rating)}
                        <span className="text-xs font-medium text-ink ml-1">{doc.rating}</span>
                      </div>
                      <p className="text-[10px] text-ink-muted">{doc.reviews} reviews</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {(doc.financiadores || []).map((f: string) => (
                      <span
                        key={f}
                        className="text-[10px] bg-[#F8FAFB] border border-border-light px-2 py-0.5 rounded text-ink-light"
                      >
                        {f}
                      </span>
                    ))}
                    {doc.teleconsulta && (
                      <span className="text-[10px] bg-celeste-pale text-celeste-dark px-2 py-0.5 rounded font-bold">
                        Teleconsulta
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border-light">
                    <span
                      className={`text-xs font-medium ${doc.available ? "text-success-600" : "text-ink-muted"}`}
                    >
                      {doc.available ? `Próximo: ${doc.nextSlot}` : "Sin disponibilidad"}
                    </span>
                    <div className="flex items-center gap-2">
                      <a
                        href={doc.profileUrl || getDoctoraliarSearchUrl(doc.name)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 text-xs font-medium text-celeste-dark border border-celeste-dark/30 rounded hover:bg-celeste-pale transition flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" /> Doctoraliar
                      </a>
                      <a
                        href={doc.profileUrl || getDoctoraliarSearchUrl(doc.name)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`px-4 py-1.5 text-xs font-semibold rounded transition inline-block text-center ${
                          doc.available
                            ? "bg-celeste-dark text-white hover:bg-celeste"
                            : "bg-gray-100 text-gray-400 pointer-events-none"
                        }`}
                      >
                        Reservar
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── 13.2 Real-time Availability ─── */}
      {tab === "disponibilidad" && (
        <div className="space-y-4">
          <p className="text-sm text-ink-light">
            Calendario de disponibilidad en tiempo real. Turnos disponibles con reserva instantánea.
          </p>

          <div className="bg-white border border-border rounded-lg overflow-hidden">
            <div className="bg-[#F8FAFB] px-5 py-3 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-semibold text-ink">Semana del 10/03/2026 — 14/03/2026</h3>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    !isDemo ? showToast("✅ Semana anterior") : showDemo("Semana anterior")
                  }
                  className="text-xs text-ink-muted hover:text-ink transition"
                >
                  Anterior
                </button>
                <button
                  onClick={() =>
                    !isDemo ? showToast("✅ Semana siguiente") : showDemo("Semana siguiente")
                  }
                  className="text-xs text-ink-muted hover:text-ink transition"
                >
                  Siguiente
                </button>
              </div>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-ink-muted">
                  <th scope="col" className="text-left font-medium px-5 py-3">
                    Médico
                  </th>
                  <th scope="col" className="text-center font-medium px-5 py-3">
                    Lun 10
                  </th>
                  <th scope="col" className="text-center font-medium px-5 py-3">
                    Mar 11
                  </th>
                  <th scope="col" className="text-center font-medium px-5 py-3">
                    Mié 12
                  </th>
                  <th scope="col" className="text-center font-medium px-5 py-3">
                    Jue 13
                  </th>
                  <th scope="col" className="text-center font-medium px-5 py-3">
                    Vie 14
                  </th>
                </tr>
              </thead>
              <tbody>
                {docs.slice(0, 5).map((doc, docIdx) => (
                  <tr
                    key={doc.id}
                    className="border-t border-border-light hover:bg-celeste-pale/30 transition"
                  >
                    <td className="px-5 py-3">
                      <p className="font-medium text-ink text-xs">{doc.name}</p>
                      <p className="text-[10px] text-ink-muted">{doc.specialty}</p>
                    </td>
                    {[1, 2, 3, 4, 5].map((day) => {
                      // Deterministic slot count based on doctor index + day
                      const slots = (docIdx * 3 + day * 2) % 6;
                      return (
                        <td key={day} className="px-5 py-3 text-center">
                          {slots > 0 ? (
                            <button
                              onClick={() =>
                                !isDemo
                                  ? showToast(`✅ Ver ${slots} turnos disponibles — ${doc.name}`)
                                  : showDemo(`Ver ${slots} turnos disponibles — ${doc.name}`)
                              }
                              className="text-xs font-medium text-success-600 hover:text-success-700 transition"
                            >
                              {slots} turnos
                            </button>
                          ) : (
                            <span className="text-xs text-ink-muted">Completo</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── 13.3 Doctor Profiles ─── */}
      {tab === "perfiles" && (
        <div className="space-y-4">
          <p className="text-sm text-ink-light">
            Perfiles completos de médicos con calificaciones y reviews verificadas de pacientes.
          </p>

          {!selectedDoctor ? (
            <div className="space-y-3">
              {docs.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDoctor(doc)}
                  className="w-full text-left bg-white border border-border rounded-lg p-5 hover:border-celeste-dark/30 transition flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-full bg-celeste-pale flex items-center justify-center text-celeste-dark font-bold text-sm shrink-0">
                    {doc.name
                      .split(" ")
                      .slice(1)
                      .map((n: string) => n[0])
                      .join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-ink">{doc.name}</p>
                    <p className="text-xs text-celeste-dark">{doc.specialty}</p>
                    <p className="text-xs text-ink-muted">
                      {doc.location} — {doc.experience}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1">
                      {renderStars(doc.rating)}
                      <span className="text-xs font-medium text-ink ml-1">{doc.rating}</span>
                    </div>
                    <p className="text-[10px] text-ink-muted">{doc.reviews} reviews</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div>
              <button
                onClick={() => setSelectedDoctor(null)}
                className="text-xs text-celeste-dark hover:text-celeste font-medium mb-4"
              >
                Volver al listado
              </button>
              <div className="bg-white border border-border rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-celeste-pale flex items-center justify-center text-celeste-dark font-bold text-lg shrink-0">
                    {selectedDoctor.name
                      .split(" ")
                      .slice(1)
                      .map((n: string) => n[0])
                      .join("")}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-display font-bold text-ink">
                      {selectedDoctor.name}
                    </h2>
                    <p className="text-sm text-celeste-dark font-medium">
                      {selectedDoctor.specialty}
                    </p>
                    <p className="text-xs text-ink-muted mt-1">
                      {selectedDoctor.location} — {selectedDoctor.address}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      {renderStars(selectedDoctor.rating)}
                      <span className="text-sm font-medium text-ink">{selectedDoctor.rating}</span>
                      <span className="text-xs text-ink-muted">
                        ({selectedDoctor.reviews} reviews verificadas)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                  <div>
                    <p className="text-[10px] text-ink-muted">Experiencia</p>
                    <p className="text-sm font-medium text-ink">{selectedDoctor.experience}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-ink-muted">Idiomas</p>
                    <p className="text-sm font-medium text-ink">
                      {(selectedDoctor.languages || []).join(", ")}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-ink-muted">Teleconsulta</p>
                    <p className="text-sm font-medium text-ink">
                      {selectedDoctor.teleconsulta ? "Disponible" : "No disponible"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-ink-muted">Próximo turno</p>
                    <p className="text-sm font-medium text-success-600">
                      {selectedDoctor.nextSlot}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-[10px] text-ink-muted mb-1.5">Financiadores aceptados</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(selectedDoctor.financiadores || []).map((f: string) => (
                      <span
                        key={f}
                        className="text-[11px] bg-celeste-pale text-celeste-dark px-2 py-0.5 rounded"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Reviews */}
                <h3 className="text-sm font-semibold text-ink mt-6 mb-3">
                  Reviews de pacientes verificados
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      name: "Carlos M.",
                      rating: 5,
                      date: "02/03/2026",
                      text: "Excelente profesional. Muy atento y dedicado. Explica todo con claridad.",
                    },
                    {
                      name: "Ana L.",
                      rating: 5,
                      date: "25/02/2026",
                      text: "La mejor cardióloga que consulté. Muy minuciosa en la revisión.",
                    },
                    {
                      name: "Roberto P.",
                      rating: 4,
                      date: "18/02/2026",
                      text: "Buena atención aunque el turno demoró un poco. Muy profesional.",
                    },
                  ].map((review, i) => (
                    <div key={i} className="border-t border-border-light pt-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-ink">{review.name}</span>
                        {renderStars(review.rating)}
                        <span className="text-[10px] text-ink-muted">{review.date}</span>
                      </div>
                      <p className="text-xs text-ink-light mt-1">{review.text}</p>
                    </div>
                  ))}
                </div>

                <a
                  href={selectedDoctor.profileUrl || getDoctoraliarSearchUrl(selectedDoctor.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-block px-6 py-2.5 bg-celeste-dark text-white text-sm font-semibold rounded hover:bg-celeste transition text-center"
                >
                  Reservar turno vía Doctoraliar
                </a>
                <a
                  href={selectedDoctor.profileUrl || getDoctoraliarSearchUrl(selectedDoctor.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-sm text-celeste-dark hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Ver perfil en Doctoraliar.com
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── 13.4 Coverage-Aware Booking ─── */}
      {tab === "cobertura" && (
        <div className="space-y-4">
          <p className="text-sm text-ink-light">
            Al reservar un turno, el sistema verifica automáticamente la cobertura del paciente con
            su obra social o prepaga.
          </p>

          <div className="bg-white border border-border rounded-lg p-6">
            <h3 className="text-sm font-semibold text-ink mb-4">
              Simulador de reserva con verificación
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-ink-muted block mb-1" id="lbl-paciente-sim">
                  Paciente
                </label>
                <select
                  aria-labelledby="lbl-paciente-sim"
                  className="w-full px-4 py-2.5 border border-border rounded text-sm text-ink-light focus:outline-none focus:border-celeste-dark"
                >
                  <option>Carlos Méndez — PAMI</option>
                  <option>Ana Rodríguez — OSDE</option>
                  <option>Marta Gutiérrez — Swiss Medical</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-ink-muted block mb-1" id="lbl-medico-sim">
                  Médico
                </label>
                <select
                  aria-labelledby="lbl-medico-sim"
                  className="w-full px-4 py-2.5 border border-border rounded text-sm text-ink-light focus:outline-none focus:border-celeste-dark"
                >
                  <option>Dra. Fernández — Cardiología</option>
                  <option>Dr. García — Dermatología</option>
                  <option>Dr. López — Clínica médica</option>
                </select>
              </div>
            </div>

            <button
              onClick={() =>
                !isDemo
                  ? showToast(
                      "✅ Verificación de cobertura: OSDE cubre consulta cardiológica al 80%. Copago estimado: $2.400. Confirmar turno?",
                    )
                  : showDemo(
                      "Verificación de cobertura: OSDE cubre consulta cardiológica al 80%. Copago estimado: $2.400. Confirmar turno?",
                    )
              }
              className="mt-4 px-5 py-2.5 bg-celeste-dark text-white text-sm font-semibold rounded hover:bg-celeste transition"
            >
              Verificar cobertura y reservar
            </button>
          </div>

          <div className="border-l-[3px] border-celeste-dark bg-celeste-pale p-4 text-sm text-ink-light">
            <strong className="text-ink">Verificación automática:</strong> Antes de confirmar el
            turno, Cóndor Salud cruza los datos del paciente con su financiador para confirmar
            cobertura, calcular copago y evitar rechazos posteriores.
          </div>

          {/* Verification history */}
          <div className="bg-white border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F8FAFB] text-xs text-ink-muted">
                  <th scope="col" className="text-left font-medium px-5 py-3">
                    Paciente
                  </th>
                  <th scope="col" className="text-left font-medium px-5 py-3">
                    Médico
                  </th>
                  <th scope="col" className="text-center font-medium px-5 py-3">
                    Financiador
                  </th>
                  <th scope="col" className="text-center font-medium px-5 py-3">
                    Cobertura
                  </th>
                  <th scope="col" className="text-center font-medium px-5 py-3">
                    Verificación
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    patient: "Carlos M.",
                    doctor: "Dra. Fernández",
                    fin: "PAMI",
                    cov: "80%",
                    status: "Aprobado",
                  },
                  {
                    patient: "Ana R.",
                    doctor: "Dr. García",
                    fin: "OSDE",
                    cov: "100%",
                    status: "Aprobado",
                  },
                  {
                    patient: "Pedro S.",
                    doctor: "Dra. Moreno",
                    fin: "Galeno",
                    cov: "0%",
                    status: "Sin cobertura",
                  },
                  {
                    patient: "Lucía T.",
                    doctor: "Dr. Pérez",
                    fin: "IOMA",
                    cov: "70%",
                    status: "Aprobado",
                  },
                ].map((v, i) => (
                  <tr
                    key={i}
                    className="border-t border-border-light hover:bg-celeste-pale/30 transition"
                  >
                    <td className="px-5 py-3 font-medium text-ink">{v.patient}</td>
                    <td className="px-5 py-3 text-ink-light">{v.doctor}</td>
                    <td className="px-5 py-3 text-center">
                      <span className="text-[10px] bg-[#F8FAFB] px-2 py-0.5 rounded text-ink-muted">
                        {v.fin}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center font-medium text-ink">{v.cov}</td>
                    <td className="px-5 py-3 text-center">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          v.status === "Aprobado"
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        {v.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── 13.5 Specialty Recommendations ─── */}
      {tab === "recomendaciones" && (
        <div className="space-y-4">
          <p className="text-sm text-ink-light">
            El paciente describe su síntoma y el sistema recomienda la especialidad y médicos
            disponibles.
          </p>

          <div className="bg-white border border-border rounded-lg p-6">
            <h3 className="text-sm font-semibold text-ink mb-3">
              ¿Qué síntoma o necesidad tiene el paciente?
            </h3>
            <select
              value={selectedSymptom}
              onChange={(e) => setSelectedSymptom(e.target.value)}
              aria-label="Seleccionar síntoma del paciente"
              className="w-full sm:w-auto px-4 py-2.5 border border-border rounded text-sm text-ink-light focus:outline-none focus:border-celeste-dark"
            >
              <option value="">Seleccionar síntoma...</option>
              {Object.keys(symptomToSpecialty).map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>

            {selectedSymptom && (
              <div className="mt-4 space-y-2">
                <p className="text-xs text-ink-muted">
                  Especialidades recomendadas:{" "}
                  <span className="font-medium text-celeste-dark">
                    {(symptomToSpecialty[selectedSymptom] || []).join(", ")}
                  </span>
                </p>
              </div>
            )}
          </div>

          {recommendedDoctors.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-ink">
                Médicos recomendados para &quot;{selectedSymptom}&quot;
              </h3>
              {recommendedDoctors.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white border border-border rounded-lg p-5 flex flex-col sm:flex-row sm:items-center gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-ink">{doc.name}</p>
                    <p className="text-xs text-celeste-dark">{doc.specialty}</p>
                    <p className="text-xs text-ink-muted">
                      {doc.location} — {doc.experience}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {renderStars(doc.rating)}
                      <span className="text-xs text-ink-muted">{doc.reviews} reviews</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-medium text-success-600 mb-2">{doc.nextSlot}</p>
                    <a
                      href={doc.profileUrl || getDoctoraliarSearchUrl(doc.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 text-xs font-semibold bg-celeste-dark text-white rounded hover:bg-celeste transition inline-block text-center"
                    >
                      Reservar
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

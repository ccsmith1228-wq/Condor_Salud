"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Network,
  Search,
  Send,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  Building2,
  Filter,
  Plus,
  ArrowRight,
  ChevronDown,
  Users,
  Activity,
  FlaskConical,
  XCircle,
  Loader2,
  BadgeCheck,
} from "lucide-react";
import { useDemoAction } from "@/components/DemoModal";
import type {
  NetworkDoctor,
  Interconsulta,
  SolicitudEstudio,
  InterconsultaStats,
  InterconsultaPrioridad,
  InterconsultaEstado,
  EstudioTipo,
  EstudioEstado,
} from "@/lib/services/interconsultas";
import {
  getNetworkDoctors,
  getNetworkSpecialties,
  getInterconsultas,
  getSolicitudesEstudio,
  getInterconsultaStats,
} from "@/lib/services/interconsultas";

// ─── Helpers ─────────────────────────────────────────────────

const PRIORIDAD_COLORS: Record<InterconsultaPrioridad, string> = {
  urgente: "bg-red-100 text-red-700 border-red-200",
  alta: "bg-orange-100 text-orange-700 border-orange-200",
  normal: "bg-celeste/10 text-celeste border-celeste/30",
  baja: "bg-gray-100 text-gray-600 border-gray-200",
};

const ESTADO_CONFIG: Record<
  InterconsultaEstado,
  { label: string; color: string; icon: typeof Clock }
> = {
  pendiente: { label: "Pendiente", color: "bg-yellow-100 text-yellow-700", icon: Clock },
  aceptada: { label: "Aceptada", color: "bg-blue-100 text-blue-700", icon: BadgeCheck },
  en_curso: { label: "En Curso", color: "bg-purple-100 text-purple-700", icon: Activity },
  completada: { label: "Completada", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  rechazada: { label: "Rechazada", color: "bg-red-100 text-red-700", icon: XCircle },
  cancelada: { label: "Cancelada", color: "bg-gray-100 text-gray-500", icon: XCircle },
};

const ESTUDIO_ESTADO: Record<EstudioEstado, { label: string; color: string }> = {
  solicitado: { label: "Solicitado", color: "bg-yellow-100 text-yellow-700" },
  en_proceso: { label: "En Proceso", color: "bg-blue-100 text-blue-700" },
  completado: { label: "Completado", color: "bg-green-100 text-green-700" },
  cancelado: { label: "Cancelado", color: "bg-gray-100 text-gray-500" },
};

const DISPONIBILIDAD_BADGE: Record<string, { label: string; class: string }> = {
  disponible: { label: "Disponible", class: "bg-green-100 text-green-700" },
  limitada: { label: "Disponibilidad limitada", class: "bg-yellow-100 text-yellow-700" },
  no_disponible: { label: "No disponible", class: "bg-red-100 text-red-700" },
};

const TIPO_ESTUDIO_LABELS: Record<EstudioTipo, string> = {
  laboratorio: "Laboratorio",
  imagen: "Diagnóstico por Imágenes",
  ecografia: "Ecografía",
  electrocardiograma: "Electrocardiograma",
  endoscopia: "Endoscopía",
  otro: "Otro",
};

type Tab = "red" | "interconsultas" | "estudios";

// ─── Page Component ──────────────────────────────────────────

export default function InterconsultasPage() {
  const { showDemo } = useDemoAction();

  const [tab, setTab] = useState<Tab>("red");
  const [search, setSearch] = useState("");
  const [espFilter, setEspFilter] = useState("Todas");
  const [estadoFilter, setEstadoFilter] = useState<"todos" | InterconsultaEstado>("todos");

  // Data
  const [doctors, setDoctors] = useState<NetworkDoctor[]>([]);
  const [specialties, setSpecialties] = useState<string[]>(["Todas"]);
  const [interconsultas, setInterconsultas] = useState<Interconsulta[]>([]);
  const [estudios, setEstudios] = useState<SolicitudEstudio[]>([]);
  const [stats, setStats] = useState<InterconsultaStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showNewIc, setShowNewIc] = useState(false);
  const [showNewEstudio, setShowNewEstudio] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<NetworkDoctor | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [d, s, ic, est, st] = await Promise.all([
        getNetworkDoctors(),
        getNetworkSpecialties(),
        getInterconsultas(),
        getSolicitudesEstudio(),
        getInterconsultaStats(),
      ]);
      setDoctors(d);
      setSpecialties(s);
      setInterconsultas(ic);
      setEstudios(est);
      setStats(st);
      setLoading(false);
    }
    load();
  }, []);

  // ─── Filtered data ──────────────────────────────────────────

  const filteredDoctors = useMemo(() => {
    let result = doctors;
    if (espFilter !== "Todas") {
      result = result.filter((d) => d.especialidad === espFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (d) =>
          d.nombre.toLowerCase().includes(q) ||
          d.especialidad.toLowerCase().includes(q) ||
          d.institucion.toLowerCase().includes(q),
      );
    }
    return result;
  }, [doctors, espFilter, search]);

  const filteredIc = useMemo(() => {
    if (estadoFilter === "todos") return interconsultas;
    return interconsultas.filter((i) => i.estado === estadoFilter);
  }, [interconsultas, estadoFilter]);

  // ─── Grouped doctors by specialty ───────────────────────────

  const groupedDoctors = useMemo(() => {
    const map = new Map<string, NetworkDoctor[]>();
    for (const d of filteredDoctors) {
      const list = map.get(d.especialidad) ?? [];
      list.push(d);
      map.set(d.especialidad, list);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredDoctors]);

  // ─── Tabs ───────────────────────────────────────────────────

  const tabs: { id: Tab; label: string; icon: typeof Network }[] = [
    { id: "red", label: "Red de Profesionales", icon: Network },
    { id: "interconsultas", label: "Interconsultas", icon: Send },
    { id: "estudios", label: "Estudios", icon: FlaskConical },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-celeste" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink flex items-center gap-2">
            <Network className="w-7 h-7 text-celeste" />
            Red de Interconsultas
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Derivaciones, red de profesionales y solicitudes de estudio
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowNewIc(true)}
            className="flex items-center gap-2 bg-celeste text-white px-4 py-2 rounded-lg
                       hover:bg-celeste/90 transition text-sm font-medium"
          >
            <Send className="w-4 h-4" />
            Nueva Interconsulta
          </button>
          <button
            onClick={() => setShowNewEstudio(true)}
            className="flex items-center gap-2 border border-celeste text-celeste px-4 py-2 rounded-lg
                       hover:bg-celeste/5 transition text-sm font-medium"
          >
            <FlaskConical className="w-4 h-4" />
            Solicitar Estudio
          </button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            {
              label: "Profesionales",
              value: stats.totalDoctors,
              icon: Users,
              color: "text-celeste",
            },
            {
              label: "Especialidades",
              value: stats.specialties,
              icon: Activity,
              color: "text-purple-600",
            },
            {
              label: "IC Pendientes",
              value: stats.pendientes,
              icon: Clock,
              color: "text-yellow-600",
            },
            {
              label: "IC Completadas",
              value: stats.completadas,
              icon: CheckCircle2,
              color: "text-green-600",
            },
            {
              label: "Estudios Activos",
              value: stats.estudiosEnCurso,
              icon: FlaskConical,
              color: "text-blue-600",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white border border-border rounded-xl p-4 flex items-center gap-3"
            >
              <s.icon className={`w-8 h-8 ${s.color}`} />
              <div>
                <p className="text-2xl font-bold text-ink">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab bar */}
      <div className="flex gap-1 bg-surface border border-border rounded-xl p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition flex-1 justify-center
              ${tab === t.id ? "bg-white text-celeste shadow-sm" : "text-gray-500 hover:text-ink"}`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* ═══════════ TAB: Red de Profesionales ═══════════ */}
      {tab === "red" && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre, especialidad o institución..."
                aria-label="Buscar por nombre, especialidad o institución"
                className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl text-sm
                           focus:outline-none focus:ring-2 focus:ring-celeste/30 focus:border-celeste"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={espFilter}
                onChange={(e) => setEspFilter(e.target.value)}
                className="pl-10 pr-8 py-2.5 border border-border rounded-xl text-sm appearance-none
                           bg-white focus:outline-none focus:ring-2 focus:ring-celeste/30 focus:border-celeste"
              >
                {specialties.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Doctor groups */}
          {groupedDoctors.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No se encontraron profesionales</p>
            </div>
          ) : (
            groupedDoctors.map(([esp, docs]) => (
              <div key={esp}>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  {esp}
                  <span className="bg-celeste/10 text-celeste px-2 py-0.5 rounded-full text-xs">
                    {docs.length}
                  </span>
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {docs.map((doc) => (
                    <DoctorCard
                      key={doc.id}
                      doctor={doc}
                      onRefer={() => {
                        setSelectedDoctor(doc);
                        setShowNewIc(true);
                      }}
                      onViewProfile={() => setSelectedDoctor(doc)}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ═══════════ TAB: Interconsultas ═══════════ */}
      {tab === "interconsultas" && (
        <div className="space-y-4">
          {/* Filter chips */}
          <div className="flex flex-wrap gap-2">
            {(
              ["todos", "pendiente", "aceptada", "en_curso", "completada", "rechazada"] as const
            ).map((f) => (
              <button
                key={f}
                onClick={() => setEstadoFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                  estadoFilter === f
                    ? "bg-celeste text-white border-celeste"
                    : "bg-white text-gray-600 border-border hover:border-celeste/40"
                }`}
              >
                {f === "todos" ? "Todos" : ESTADO_CONFIG[f].label}
              </button>
            ))}
          </div>

          {/* IC List */}
          {filteredIc.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Send className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No hay interconsultas en esta categoría</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredIc.map((ic) => (
                <InterconsultaCard key={ic.id} ic={ic} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══════════ TAB: Estudios ═══════════ */}
      {tab === "estudios" && (
        <div className="space-y-4">
          {estudios.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FlaskConical className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No hay solicitudes de estudio</p>
            </div>
          ) : (
            <div className="space-y-3">
              {estudios.map((est) => (
                <EstudioCard key={est.id} estudio={est} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══════════ Modal: Nueva Interconsulta ═══════════ */}
      {showNewIc && (
        <NewInterconsultaModal
          doctors={doctors}
          specialties={specialties.filter((s) => s !== "Todas")}
          preselected={selectedDoctor}
          onClose={() => {
            setShowNewIc(false);
            setSelectedDoctor(null);
          }}
          onSubmit={() => {
            showDemo("Interconsulta creada — el profesional destino recibirá la notificación.");
            setShowNewIc(false);
            setSelectedDoctor(null);
          }}
        />
      )}

      {/* ═══════════ Modal: Solicitar Estudio ═══════════ */}
      {showNewEstudio && (
        <NewEstudioModal
          doctors={doctors}
          onClose={() => setShowNewEstudio(false)}
          onSubmit={() => {
            showDemo("Solicitud de estudio enviada al centro de diagnóstico.");
            setShowNewEstudio(false);
          }}
        />
      )}

      {/* ═══════════ Modal: Perfil Doctor ═══════════ */}
      {selectedDoctor && !showNewIc && (
        <DoctorProfileModal
          doctor={selectedDoctor}
          onClose={() => setSelectedDoctor(null)}
          onRefer={() => {
            setShowNewIc(true);
          }}
        />
      )}
    </div>
  );
}

// ─── Doctor Card ──────────────────────────────────────────────

function DoctorCard({
  doctor,
  onRefer,
  onViewProfile,
}: {
  doctor: NetworkDoctor;
  onRefer: () => void;
  onViewProfile: () => void;
}) {
  const badge = DISPONIBILIDAD_BADGE[doctor.disponibilidad] ?? {
    label: "—",
    class: "bg-gray-100 text-gray-500",
  };
  return (
    <div className="bg-white border border-border rounded-xl p-4 hover:shadow-md transition group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-celeste/10 flex items-center justify-center text-celeste font-bold text-sm">
            {doctor.nombre
              .split(" ")
              .filter((_, i, arr) => i === 0 || i === arr.length - 1)
              .map((w) => w[0])
              .join("")}
          </div>
          <div>
            <h4 className="font-semibold text-ink text-sm">{doctor.nombre}</h4>
            <p className="text-xs text-gray-500">{doctor.matricula}</p>
          </div>
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${badge.class}`}>
          {badge.label}
        </span>
      </div>

      <div className="space-y-1.5 mb-3">
        <p className="text-xs text-gray-600 flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-celeste" />
          {doctor.especialidad}
        </p>
        <p className="text-xs text-gray-600 flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5 text-gray-400" />
          {doctor.institucion}
        </p>
        {doctor.turnaroundDays && (
          <p className="text-xs text-gray-500 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            Respuesta ~{doctor.turnaroundDays} día{doctor.turnaroundDays > 1 ? "s" : ""}
          </p>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={onViewProfile}
          className="flex-1 text-xs border border-border rounded-lg py-1.5 text-gray-600
                     hover:border-celeste hover:text-celeste transition"
        >
          Ver Perfil
        </button>
        <button
          onClick={onRefer}
          disabled={doctor.disponibilidad === "no_disponible"}
          className="flex-1 text-xs bg-celeste text-white rounded-lg py-1.5
                     hover:bg-celeste/90 transition disabled:opacity-40 disabled:cursor-not-allowed
                     flex items-center justify-center gap-1"
        >
          <Send className="w-3 h-3" />
          Derivar
        </button>
      </div>
    </div>
  );
}

// ─── Interconsulta Card ──────────────────────────────────────

function InterconsultaCard({ ic }: { ic: Interconsulta }) {
  const est = ESTADO_CONFIG[ic.estado];
  const EstIcon = est.icon;

  return (
    <div className="bg-white border border-border rounded-xl p-4 hover:shadow-sm transition">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${est.color}`}
            >
              <EstIcon className="w-3 h-3" />
              {est.label}
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full border font-medium ${PRIORIDAD_COLORS[ic.prioridad]}`}
            >
              {ic.prioridad.charAt(0).toUpperCase() + ic.prioridad.slice(1)}
            </span>
            <span className="text-xs text-gray-400">{ic.fecha}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-ink">{ic.paciente}</span>
            <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-celeste font-medium">{ic.doctorDestino}</span>
            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-500">
              {ic.especialidad}
            </span>
          </div>

          <p className="text-xs text-gray-600 line-clamp-2">{ic.motivo}</p>

          {ic.respuesta && (
            <div className="bg-green-50 border border-green-100 rounded-lg p-2 mt-1">
              <p className="text-xs text-green-700">
                <span className="font-medium">Respuesta:</span> {ic.respuesta}
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>De: {ic.doctorOrigen}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Estudio Card ────────────────────────────────────────────

function EstudioCard({ estudio }: { estudio: SolicitudEstudio }) {
  const est = ESTUDIO_ESTADO[estudio.estado];

  return (
    <div className="bg-white border border-border rounded-xl p-4 hover:shadow-sm transition">
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${est.color}`}>
              {est.label}
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full border font-medium ${PRIORIDAD_COLORS[estudio.prioridad]}`}
            >
              {estudio.prioridad.charAt(0).toUpperCase() + estudio.prioridad.slice(1)}
            </span>
            <span className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">
              {TIPO_ESTUDIO_LABELS[estudio.tipo]}
            </span>
            <span className="text-xs text-gray-400">{estudio.fecha}</span>
          </div>

          <h4 className="text-sm font-medium text-ink">{estudio.estudio}</h4>

          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>
              Paciente: <b className="text-ink">{estudio.paciente}</b>
            </span>
            <span>
              Centro: <b className="text-ink">{estudio.centroDestino}</b>
            </span>
          </div>

          <p className="text-xs text-gray-600">{estudio.indicacion}</p>
        </div>

        <div className="text-xs text-gray-400">Solicita: {estudio.doctorSolicitante}</div>
      </div>
    </div>
  );
}

// ─── Modal: Nueva Interconsulta ──────────────────────────────

function NewInterconsultaModal({
  doctors,
  specialties,
  preselected,
  onClose,
  onSubmit,
}: {
  doctors: NetworkDoctor[];
  specialties: string[];
  preselected: NetworkDoctor | null;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const [esp, setEsp] = useState(preselected?.especialidad ?? "");
  const [doctorId, setDoctorId] = useState(preselected?.id ?? "");
  const [paciente, setPaciente] = useState("");
  const [motivo, setMotivo] = useState("");
  const [prioridad, setPrioridad] = useState<InterconsultaPrioridad>("normal");
  const [notas, setNotas] = useState("");

  const filteredDocs = useMemo(() => {
    if (!esp) return doctors.filter((d) => d.disponibilidad !== "no_disponible");
    return doctors.filter((d) => d.especialidad === esp && d.disponibilidad !== "no_disponible");
  }, [doctors, esp]);

  const canSubmit = paciente.trim() && doctorId && motivo.trim() && esp;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-ink flex items-center gap-2">
              <Send className="w-5 h-5 text-celeste" />
              Solicitud de Interconsulta
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-ink transition">
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Paciente */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Paciente *</label>
            <input
              value={paciente}
              onChange={(e) => setPaciente(e.target.value)}
              placeholder="Nombre del paciente"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-celeste/30 focus:border-celeste"
            />
          </div>

          {/* Especialidad */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Especialidad *</label>
            <select
              value={esp}
              onChange={(e) => {
                setEsp(e.target.value);
                if (!preselected) setDoctorId("");
              }}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm appearance-none
                         bg-white focus:outline-none focus:ring-2 focus:ring-celeste/30 focus:border-celeste"
            >
              <option value="">Seleccionar especialidad...</option>
              {specialties.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Doctor destino */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Profesional destino *
            </label>
            <select
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm appearance-none
                         bg-white focus:outline-none focus:ring-2 focus:ring-celeste/30 focus:border-celeste"
            >
              <option value="">Seleccionar profesional...</option>
              {filteredDocs.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nombre} — {d.institucion}
                </option>
              ))}
            </select>
          </div>

          {/* Prioridad */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Prioridad</label>
            <div className="flex gap-2">
              {(["baja", "normal", "alta", "urgente"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPrioridad(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                    prioridad === p
                      ? PRIORIDAD_COLORS[p]
                      : "bg-white text-gray-500 border-border hover:border-gray-300"
                  }`}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Motivo */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Motivo de la interconsulta *
            </label>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              rows={3}
              placeholder="Describa el motivo clínico de la derivación..."
              className="w-full border border-border rounded-lg px-3 py-2 text-sm resize-none
                         focus:outline-none focus:ring-2 focus:ring-celeste/30 focus:border-celeste"
            />
          </div>

          {/* Notas */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Notas adicionales
            </label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={2}
              placeholder="Medicación actual, alergias, antecedentes relevantes..."
              className="w-full border border-border rounded-lg px-3 py-2 text-sm resize-none
                         focus:outline-none focus:ring-2 focus:ring-celeste/30 focus:border-celeste"
            />
          </div>
        </div>

        <div className="p-6 border-t border-border flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-ink transition"
          >
            Cancelar
          </button>
          <button
            onClick={onSubmit}
            disabled={!canSubmit}
            className="px-6 py-2 bg-celeste text-white text-sm font-medium rounded-lg
                       hover:bg-celeste/90 transition disabled:opacity-40 disabled:cursor-not-allowed
                       flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Enviar Interconsulta
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal: Solicitar Estudio ────────────────────────────────

function NewEstudioModal({
  doctors,
  onClose,
  onSubmit,
}: {
  doctors: NetworkDoctor[];
  onClose: () => void;
  onSubmit: () => void;
}) {
  const [paciente, setPaciente] = useState("");
  const [tipo, setTipo] = useState<EstudioTipo>("laboratorio");
  const [estudio, setEstudio] = useState("");
  const [indicacion, setIndicacion] = useState("");
  const [centroId, setCentroId] = useState("");
  const [prioridad, setPrioridad] = useState<InterconsultaPrioridad>("normal");

  const centros = useMemo(() => {
    return doctors.filter(
      (d) =>
        d.especialidad === "Laboratorio" ||
        d.especialidad === "Diagnóstico por Imágenes" ||
        d.disponibilidad !== "no_disponible",
    );
  }, [doctors]);

  const canSubmit = paciente.trim() && estudio.trim() && indicacion.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-ink flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-purple-600" />
              Solicitud de Estudio
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-ink transition">
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Paciente *</label>
            <input
              value={paciente}
              onChange={(e) => setPaciente(e.target.value)}
              placeholder="Nombre del paciente"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-celeste/30 focus:border-celeste"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Tipo de estudio *
            </label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as EstudioTipo)}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm appearance-none
                         bg-white focus:outline-none focus:ring-2 focus:ring-celeste/30 focus:border-celeste"
            >
              {Object.entries(TIPO_ESTUDIO_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Estudio solicitado *
            </label>
            <input
              value={estudio}
              onChange={(e) => setEstudio(e.target.value)}
              placeholder="Ej: RMN de cerebro sin contraste"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-celeste/30 focus:border-celeste"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Centro de destino
            </label>
            <select
              value={centroId}
              onChange={(e) => setCentroId(e.target.value)}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm appearance-none
                         bg-white focus:outline-none focus:ring-2 focus:ring-celeste/30 focus:border-celeste"
            >
              <option value="">Seleccionar centro...</option>
              {centros.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre} — {c.institucion}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Prioridad</label>
            <div className="flex gap-2">
              {(["baja", "normal", "alta", "urgente"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPrioridad(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                    prioridad === p
                      ? PRIORIDAD_COLORS[p]
                      : "bg-white text-gray-500 border-border hover:border-gray-300"
                  }`}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Indicación clínica *
            </label>
            <textarea
              value={indicacion}
              onChange={(e) => setIndicacion(e.target.value)}
              rows={3}
              placeholder="Motivo del estudio y contexto clínico relevante..."
              className="w-full border border-border rounded-lg px-3 py-2 text-sm resize-none
                         focus:outline-none focus:ring-2 focus:ring-celeste/30 focus:border-celeste"
            />
          </div>
        </div>

        <div className="p-6 border-t border-border flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-ink transition"
          >
            Cancelar
          </button>
          <button
            onClick={onSubmit}
            disabled={!canSubmit}
            className="px-6 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg
                       hover:bg-purple-700 transition disabled:opacity-40 disabled:cursor-not-allowed
                       flex items-center gap-2"
          >
            <FlaskConical className="w-4 h-4" />
            Solicitar Estudio
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal: Doctor Profile ───────────────────────────────────

function DoctorProfileModal({
  doctor,
  onClose,
  onRefer,
}: {
  doctor: NetworkDoctor;
  onClose: () => void;
  onRefer: () => void;
}) {
  const badge = DISPONIBILIDAD_BADGE[doctor.disponibilidad] ?? {
    label: "—",
    class: "bg-gray-100 text-gray-500",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-celeste/10 flex items-center justify-center text-celeste font-bold text-lg">
                {doctor.nombre
                  .split(" ")
                  .filter((_, i, arr) => i === 0 || i === arr.length - 1)
                  .map((w) => w[0])
                  .join("")}
              </div>
              <div>
                <h2 className="text-lg font-bold text-ink">{doctor.nombre}</h2>
                <p className="text-sm text-celeste font-medium">{doctor.especialidad}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-ink transition">
              <XCircle className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <Building2 className="w-4 h-4 text-gray-400 shrink-0" />
              {doctor.institucion}
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <BadgeCheck className="w-4 h-4 text-gray-400 shrink-0" />
              {doctor.matricula}
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <Phone className="w-4 h-4 text-gray-400 shrink-0" />
              {doctor.telefono}
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <Mail className="w-4 h-4 text-gray-400 shrink-0" />
              {doctor.email}
            </div>
            {doctor.turnaroundDays && (
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                Respuesta estimada: ~{doctor.turnaroundDays} día
                {doctor.turnaroundDays > 1 ? "s" : ""}
              </div>
            )}
            <div className="pt-1">
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${badge.class}`}>
                {badge.label}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm border border-border rounded-lg
                         text-gray-600 hover:border-gray-300 transition"
            >
              Cerrar
            </button>
            <button
              onClick={onRefer}
              disabled={doctor.disponibilidad === "no_disponible"}
              className="flex-1 px-4 py-2.5 bg-celeste text-white text-sm font-medium rounded-lg
                         hover:bg-celeste/90 transition disabled:opacity-40 disabled:cursor-not-allowed
                         flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              Derivar paciente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

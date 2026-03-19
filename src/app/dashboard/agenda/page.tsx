"use client";

import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/components/Toast";
import { RequirePermission } from "@/components/RequirePermission";
import { useExport } from "@/lib/services/export";
import {
  createTurno,
  cancelTurno,
  confirmTurno,
  attendTurno,
  type CreateTurnoInput,
} from "@/lib/services/turnos";
import type { Turno } from "@/lib/services/data";
import { useTurnos } from "@/hooks/use-data";
import { Calendar, Plus, X, Check, Clock, Ban, Loader2, Video, Download } from "lucide-react";

// ─── Google Calendar hook ────────────────────────────────────

interface GCalEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  meetLink?: string;
}

function useGoogleCalendarEvents() {
  const [events, setEvents] = useState<GCalEvent[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetch("/api/google/calendar?days=7")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data?.events) setEvents(data.events);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { events, loading };
}

// ─── Config ──────────────────────────────────────────────────

const diasSemana = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const horas = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
];

const profesionales = [
  {
    id: "prof-1",
    nombre: "Dr. Martín Rodríguez",
    especialidad: "Cardiología",
    color: "bg-celeste-pale text-celeste-dark border-celeste",
  },
  {
    id: "prof-2",
    nombre: "Dra. Laura Pérez",
    especialidad: "Clínica Médica",
    color: "bg-celeste-pale text-celeste-dark border-celeste-light",
  },
  {
    id: "prof-3",
    nombre: "Dr. Carlos Martínez",
    especialidad: "Ecografía",
    color: "bg-celeste-pale text-celeste-dark border-celeste",
  },
  {
    id: "prof-4",
    nombre: "Dra. Ana Fernández",
    especialidad: "Laboratorio",
    color: "bg-green-50 text-green-700 border-green-300",
  },
];

const estadoColor: Record<string, string> = {
  confirmado: "bg-green-50 text-green-700",
  pendiente: "bg-amber-50 text-amber-700",
  atendido: "bg-border-light text-ink-muted",
  cancelado: "bg-red-50 text-red-600",
};

const tiposTurno = [
  "Consulta",
  "Control",
  "Primera vez",
  "Ecografía",
  "Laboratorio",
  "Procedimiento",
];
const financiadoresOptions = [
  "PAMI",
  "OSDE 310",
  "OSDE 210",
  "Swiss Medical",
  "Galeno",
  "Medifé",
  "Sancor Salud",
  "IOMA",
  "Particular",
];

// ─── Component ───────────────────────────────────────────────

export default function AgendaPage() {
  const { showToast } = useToast();
  const { data: turnos, isLoading, mutate } = useTurnos();
  const { exportPDF, exportExcel, isExporting } = useExport();
  const { events: gCalEvents } = useGoogleCalendarEvents();
  const [vista, setVista] = useState<"semana" | "lista">("semana");
  const [profFilter, setProfFilter] = useState("");
  const [showNewModal, setShowNewModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Merge Google Calendar events as virtual turnos
  const gCalTurnos: Turno[] = gCalEvents.map((e) => ({
    id: `gcal-${e.id}`,
    hora: e.start
      ? new Date(e.start).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })
      : "",
    paciente: e.title,
    tipo: e.meetLink ? "Teleconsulta" : "Google Calendar",
    financiador: "",
    profesional: "",
    estado: "confirmado" as const,
    notas: e.meetLink ? `Meet: ${e.meetLink}` : undefined,
  }));

  const allTurnos = [...(turnos ?? []), ...gCalTurnos];
  const filtered = profFilter
    ? allTurnos.filter(
        (t: Turno) =>
          t.profesional === profFilter ||
          profesionales.find((p) => p.id === profFilter)?.nombre === t.profesional,
      )
    : allTurnos;

  const hoy = new Date();
  const lunes = new Date(hoy);
  lunes.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7));

  const fechasDias = diasSemana.map((_, i) => {
    const d = new Date(lunes);
    d.setDate(lunes.getDate() + i);
    return `${d.getDate()}/${d.getMonth() + 1}`;
  });

  const total = filtered.length;
  const confirmados = filtered.filter((t: Turno) => t.estado === "confirmado").length;
  const pendientes = filtered.filter((t: Turno) => t.estado === "pendiente").length;
  const atendidos = filtered.filter((t: Turno) => t.estado === "atendido").length;

  // ── Actions ──

  const handleConfirm = useCallback(
    async (id: string) => {
      setActionLoading(id);
      const result = await confirmTurno(id);
      setActionLoading(null);
      if (result.success) {
        showToast("✅ Turno confirmado");
        mutate();
      } else {
        showToast(`❌ ${result.error}`);
      }
    },
    [mutate, showToast],
  );

  const handleAttend = useCallback(
    async (id: string) => {
      setActionLoading(id);
      const result = await attendTurno(id);
      setActionLoading(null);
      if (result.success) {
        showToast("✅ Paciente atendido");
        mutate();
      } else {
        showToast(`❌ ${result.error}`);
      }
    },
    [mutate, showToast],
  );

  const handleCancel = useCallback(
    async (id: string) => {
      if (!confirm("¿Cancelar este turno?")) return;
      setActionLoading(id);
      const result = await cancelTurno(id);
      setActionLoading(null);
      if (result.success) {
        showToast("Turno cancelado");
        mutate();
      } else {
        showToast(`❌ ${result.error}`);
      }
    },
    [mutate, showToast],
  );

  const handleCreate = useCallback(
    async (input: CreateTurnoInput) => {
      const result = await createTurno(input);
      if (result.success) {
        showToast("✅ Turno creado exitosamente");
        mutate();
        setShowNewModal(false);
      } else {
        showToast(`❌ ${result.error}`);
      }
      return result;
    },
    [mutate, showToast],
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Agenda</h1>
          <p className="text-sm text-ink-muted mt-0.5">
            Semana del {fechasDias[0]} al {fechasDias[5]}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => exportPDF("agenda")}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-celeste-dark text-white rounded-[4px] hover:bg-celeste transition disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            {isExporting ? "..." : "PDF"}
          </button>
          <button
            onClick={() => exportExcel("agenda")}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border rounded-[4px] text-ink-light hover:border-celeste-dark hover:text-celeste-dark transition disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            Excel
          </button>
          <button
            onClick={() => setVista("semana")}
            className={`px-4 py-2 text-sm rounded-[4px] font-medium transition ${vista === "semana" ? "bg-celeste-dark text-white" : "border border-border text-ink-light hover:border-celeste-dark"}`}
          >
            Semana
          </button>
          <button
            onClick={() => setVista("lista")}
            className={`px-4 py-2 text-sm rounded-[4px] font-medium transition ${vista === "lista" ? "bg-celeste-dark text-white" : "border border-border text-ink-light hover:border-celeste-dark"}`}
          >
            Lista
          </button>
          <RequirePermission permission="agenda:write">
            <button
              onClick={() => setShowNewModal(true)}
              className="px-4 py-2 text-sm font-semibold bg-celeste-dark text-white rounded-[4px] hover:bg-celeste transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Nuevo turno
            </button>
          </RequirePermission>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total turnos", value: isLoading ? "..." : total, color: "border-celeste" },
          {
            label: "Confirmados",
            value: isLoading ? "..." : confirmados,
            color: "border-green-400",
          },
          { label: "Pendientes", value: isLoading ? "..." : pendientes, color: "border-amber-400" },
          { label: "Atendidos", value: isLoading ? "..." : atendidos, color: "border-celeste" },
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

      {/* Prof filter */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs font-bold text-ink-muted uppercase tracking-wider">
          Profesional:
        </span>
        <button
          onClick={() => setProfFilter("")}
          className={`px-3 py-1.5 text-xs rounded-[4px] transition ${!profFilter ? "bg-ink text-white" : "border border-border text-ink-light hover:border-ink"}`}
        >
          Todos
        </button>
        {profesionales.map((p) => (
          <button
            key={p.id}
            onClick={() => setProfFilter(p.id)}
            className={`px-3 py-1.5 text-xs rounded-[4px] border transition ${profFilter === p.id ? p.color + " font-semibold" : "border-border text-ink-light hover:border-ink"}`}
          >
            {p.nombre.split(" ").slice(0, 2).join(" ")}
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-celeste-dark animate-spin" />
          <span className="ml-2 text-sm text-ink-muted">Cargando agenda...</span>
        </div>
      )}

      {/* List view */}
      {!isLoading && vista === "lista" && (
        <div className="bg-white border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F8FAFB] text-[10px] font-bold tracking-wider text-ink-muted uppercase">
                <th className="text-left px-5 py-2.5">Hora</th>
                <th className="text-left px-5 py-2.5">Paciente</th>
                <th className="text-left px-5 py-2.5">Profesional</th>
                <th className="text-left px-5 py-2.5">Tipo</th>
                <th className="text-left px-5 py-2.5">Financiador</th>
                <th className="text-center px-5 py-2.5">Estado</th>
                <th className="text-center px-5 py-2.5">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered
                .sort((a: Turno, b: Turno) => a.hora.localeCompare(b.hora))
                .map((t: Turno) => (
                  <tr
                    key={t.id}
                    className="border-t border-border-light hover:bg-celeste-pale/30 transition"
                  >
                    <td className="px-5 py-3 font-mono text-xs text-ink">{t.hora}</td>
                    <td className="px-5 py-3 text-xs font-semibold text-ink">{t.paciente}</td>
                    <td className="px-5 py-3 text-xs text-ink-light">{t.profesional}</td>
                    <td className="px-5 py-3 text-xs text-ink-light">{t.tipo}</td>
                    <td className="px-5 py-3 text-xs text-ink-light">{t.financiador}</td>
                    <td className="px-5 py-3 text-center">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded capitalize ${estadoColor[t.estado] ?? "bg-gray-50 text-gray-500"}`}
                      >
                        {t.estado}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <RequirePermission permission="agenda:write">
                        <div className="flex items-center justify-center gap-1">
                          {actionLoading === t.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-ink-muted" />
                          ) : (
                            <>
                              {t.estado === "pendiente" && (
                                <button
                                  onClick={() => handleConfirm(t.id)}
                                  className="p-1 text-green-600 hover:bg-green-50 rounded transition"
                                  title="Confirmar"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {(t.estado === "confirmado" || t.estado === "pendiente") && (
                                <button
                                  onClick={() => handleAttend(t.id)}
                                  className="p-1 text-celeste-dark hover:bg-celeste-pale rounded transition"
                                  title="Marcar atendido"
                                >
                                  <Clock className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {t.estado !== "cancelado" && t.estado !== "atendido" && (
                                <button
                                  onClick={() => handleCancel(t.id)}
                                  className="p-1 text-red-500 hover:bg-red-50 rounded transition"
                                  title="Cancelar"
                                >
                                  <Ban className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </RequirePermission>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="px-5 py-10 text-center text-sm text-ink-muted">
              No hay turnos para mostrar
            </div>
          )}
        </div>
      )}

      {/* Week view */}
      {!isLoading && vista === "semana" && (
        <div className="bg-white border border-border rounded-lg overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="w-16 px-3 py-2 text-[10px] font-bold tracking-wider text-ink-muted uppercase bg-[#F8FAFB]">
                  Hora
                </th>
                {diasSemana.map((d, i) => (
                  <th
                    key={d}
                    className={`px-2 py-2 text-[10px] font-bold tracking-wider uppercase ${i === (hoy.getDay() + 6) % 7 ? "text-celeste-dark bg-celeste-pale/40" : "text-ink-muted bg-[#F8FAFB]"}`}
                  >
                    {d} {fechasDias[i]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {horas.map((hora) => {
                const matching = filtered.filter((t: Turno) => t.hora === hora);
                return (
                  <tr key={hora} className="border-t border-border-light hover:bg-[#FCFCFD]">
                    <td className="px-3 py-1.5 text-[10px] font-mono text-ink-muted text-center">
                      {hora}
                    </td>
                    {diasSemana.map((_, di) => {
                      const turno = matching[di % Math.max(matching.length, 1)];
                      if (!turno || di >= matching.length)
                        return <td key={di} className="px-1 py-1" />;
                      return (
                        <td key={di} className="px-1 py-1">
                          <div className="block p-1.5 rounded text-[10px] border-l-2 bg-celeste-pale text-celeste-dark border-celeste hover:shadow-sm transition cursor-pointer">
                            <div className="font-semibold truncate">{turno.paciente}</div>
                            <div className="text-ink-muted truncate">
                              {turno.tipo} · {turno.financiador}
                            </div>
                            <span
                              className={`inline-block mt-0.5 px-1 py-0.5 rounded text-[8px] font-bold capitalize ${estadoColor[turno.estado] ?? ""}`}
                            >
                              {turno.estado}
                            </span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-[10px] text-ink-muted">
        {profesionales.map((p) => (
          <div key={p.id} className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-sm ${p.color.split(" ")[0]}`} />
            <span>
              {p.nombre} — {p.especialidad}
            </span>
          </div>
        ))}
      </div>

      {/* New Turno Modal */}
      {showNewModal && (
        <NewTurnoModal onClose={() => setShowNewModal(false)} onCreate={handleCreate} />
      )}
    </div>
  );
}

// ─── New Turno Modal ─────────────────────────────────────────

function NewTurnoModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (input: CreateTurnoInput) => Promise<{ success: boolean; error?: string }>;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<CreateTurnoInput>({
    fecha: new Date().toISOString().slice(0, 10),
    hora: "09:00",
    paciente: "",
    tipo: "Consulta",
    financiador: "PAMI",
    profesional: profesionales[0]?.nombre ?? "",
    profesionalId: profesionales[0]?.id,
    notas: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.paciente.trim()) {
      setError("Ingresá el nombre del paciente");
      return;
    }
    setLoading(true);
    setError("");
    const result = await onCreate(form);
    setLoading(false);
    if (!result.success) {
      setError(result.error ?? "Error al crear turno");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-bold text-ink flex items-center gap-2">
            <Calendar className="w-5 h-5 text-celeste-dark" />
            Nuevo Turno
          </h2>
          <button onClick={onClose} className="p-1 text-ink-muted hover:text-ink transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-[4px] text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">
                Fecha
              </label>
              <input
                type="date"
                value={form.fecha}
                onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-[4px] text-sm focus:outline-none focus:ring-2 focus:ring-celeste-200 focus:border-celeste-dark"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">
                Hora
              </label>
              <select
                value={form.hora}
                onChange={(e) => setForm({ ...form, hora: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-[4px] text-sm focus:outline-none focus:ring-2 focus:ring-celeste-200 focus:border-celeste-dark"
              >
                {horas.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">
              Paciente
            </label>
            <input
              type="text"
              placeholder="Nombre del paciente"
              value={form.paciente}
              onChange={(e) => setForm({ ...form, paciente: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-[4px] text-sm focus:outline-none focus:ring-2 focus:ring-celeste-200 focus:border-celeste-dark"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">
                Profesional
              </label>
              <select
                value={form.profesionalId}
                onChange={(e) => {
                  const prof = profesionales.find((p) => p.id === e.target.value);
                  setForm({
                    ...form,
                    profesionalId: e.target.value,
                    profesional: prof?.nombre ?? e.target.value,
                  });
                }}
                className="w-full px-3 py-2 border border-border rounded-[4px] text-sm focus:outline-none focus:ring-2 focus:ring-celeste-200 focus:border-celeste-dark"
              >
                {profesionales.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">
                Tipo
              </label>
              <select
                value={form.tipo}
                onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-[4px] text-sm focus:outline-none focus:ring-2 focus:ring-celeste-200 focus:border-celeste-dark"
              >
                {tiposTurno.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">
              Financiador
            </label>
            <select
              value={form.financiador}
              onChange={(e) => setForm({ ...form, financiador: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-[4px] text-sm focus:outline-none focus:ring-2 focus:ring-celeste-200 focus:border-celeste-dark"
            >
              {financiadoresOptions.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">
              Notas (opcional)
            </label>
            <textarea
              rows={2}
              value={form.notas}
              onChange={(e) => setForm({ ...form, notas: e.target.value })}
              placeholder="Observaciones adicionales..."
              className="w-full px-3 py-2 border border-border rounded-[4px] text-sm focus:outline-none focus:ring-2 focus:ring-celeste-200 focus:border-celeste-dark resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium border border-border rounded-[4px] text-ink-light hover:border-ink transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-semibold bg-celeste-dark text-white rounded-[4px] hover:bg-celeste transition disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Crear turno
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useToast } from "@/components/Toast";
import { RequirePermission } from "@/components/RequirePermission";
import { useExport } from "@/lib/services/export";
import { useLocale } from "@/lib/i18n/context";
import {
  createTurno,
  cancelTurno,
  confirmTurno,
  attendTurno,
  type CreateTurnoInput,
} from "@/lib/services/turnos";
import type { Turno } from "@/lib/services/data";
import { useTurnos } from "@/hooks/use-data";
import { useDoctors } from "@/lib/hooks/useModules";
import { formatDoctorSchedule } from "@/lib/services/directorio";
import { Calendar, Plus, X, Check, Clock, Ban, Loader2, Download, UserRound } from "lucide-react";
import { ConfirmDialog } from "@/components/ui";
import { analytics } from "@/lib/analytics";

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

const diasSemana = ["Lun", "Mar", "Mié", "Jue", "Vie"];
const horas = [
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
];

// Color palette for professional filter chips & legend
const profColors = [
  "bg-blue-100 text-blue-700",
  "bg-green-100 text-green-700",
  "bg-purple-100 text-purple-700",
  "bg-amber-100 text-amber-700",
  "bg-pink-100 text-pink-700",
  "bg-teal-100 text-teal-700",
  "bg-indigo-100 text-indigo-700",
  "bg-red-100 text-red-700",
  "bg-cyan-100 text-cyan-700",
  "bg-orange-100 text-orange-700",
];

export type Profesional = {
  id: string;
  nombre: string;
  especialidad: string;
  color: string;
  /** Compact schedule text, e.g. "Lun 14:30–16:30 · Jue 10:00–12:00" */
  horario: string;
};

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

/** Preset duration options (minutes) the receptionist can choose from */
const DURATION_OPTIONS = [15, 20, 30, 45, 60, 90, 120] as const;

/** Default duration per appointment type (fallback when clinic_services not loaded) */
const DEFAULT_DURATION_BY_TYPE: Record<string, number> = {
  Consulta: 30,
  Control: 15,
  "Primera vez": 45,
  Ecografía: 30,
  Laboratorio: 15,
  Procedimiento: 60,
};

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
  const { t, locale } = useLocale();
  const { showToast } = useToast();
  const { data: turnos, isLoading, mutate } = useTurnos();
  const { data: doctors = [] } = useDoctors();
  const { exportPDF, exportExcel, isExporting } = useExport();
  const { events: gCalEvents } = useGoogleCalendarEvents();

  // Build profesionales list from real doctor data
  const profesionales: Profesional[] = useMemo(
    () =>
      doctors.map((d, i) => ({
        id: d.id,
        nombre: d.name,
        especialidad: d.specialty,
        color: profColors[i % profColors.length] ?? "bg-blue-100 text-blue-700",
        horario: formatDoctorSchedule(d.schedule),
      })),
    [doctors],
  );

  const localeDays = locale === "en" ? ["Mon", "Tue", "Wed", "Thu", "Fri"] : diasSemana;
  const [vista, setVista] = useState<"semana" | "lista">("semana");
  const [profFilter, setProfFilter] = useState("");
  const [showNewModal, setShowNewModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Merge Google Calendar events as virtual turnos
  const gCalTurnos: Turno[] = gCalEvents.map((e) => {
    const startDate = e.start ? new Date(e.start) : null;
    return {
      id: `gcal-${e.id}`,
      fecha: startDate ? startDate.toISOString().split("T")[0] : undefined,
      hora: startDate
        ? startDate.toLocaleTimeString(locale === "en" ? "en-US" : "es-AR", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "",
      paciente: e.title,
      tipo: e.meetLink ? "Teleconsulta" : "Google Calendar",
      financiador: "",
      profesional: "",
      estado: "confirmado" as const,
      notas: e.meetLink ? `Meet: ${e.meetLink}` : undefined,
    };
  });

  const allTurnos = [...(turnos ?? []), ...gCalTurnos];
  const filtered = profFilter
    ? allTurnos.filter(
        (t: Turno) =>
          t.profesionalId === profFilter ||
          t.profesional === profFilter ||
          profesionales.find((p) => p.id === profFilter)?.nombre === t.profesional,
      )
    : allTurnos;

  const hoy = new Date();
  const lunes = new Date(hoy);
  lunes.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7));

  // ISO date strings for each column (Mon–Fri): YYYY-MM-DD
  const isoFechas = localeDays.map((_, i) => {
    const d = new Date(lunes);
    d.setDate(lunes.getDate() + i);
    return d.toISOString().split("T")[0];
  });

  const fechasDias = localeDays.map((_, i) => {
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
        showToast(`${t("schedule.appointmentConfirmed")}`, "success");
        mutate();
      } else {
        showToast(`${result.error}`, "error");
      }
    },
    [mutate, showToast, t],
  );

  const handleAttend = useCallback(
    async (id: string) => {
      setActionLoading(id);
      const result = await attendTurno(id);
      setActionLoading(null);
      if (result.success) {
        showToast(`${t("schedule.patientAttended")}`, "success");
        mutate();
      } else {
        showToast(`${result.error}`, "error");
      }
    },
    [mutate, showToast, t],
  );

  const [cancelTarget, setCancelTarget] = useState<string | null>(null);

  const doCancel = useCallback(
    async (id: string) => {
      setActionLoading(id);
      const result = await cancelTurno(id);
      setActionLoading(null);
      if (result.success) {
        showToast(t("schedule.appointmentCancelled"), "success");
        mutate();
      } else {
        showToast(`${result.error}`, "error");
      }
    },
    [mutate, showToast, t],
  );

  const handleCancel = useCallback((id: string) => setCancelTarget(id), []);

  const handleCreate = useCallback(
    async (input: CreateTurnoInput) => {
      const result = await createTurno(input);
      if (result.success) {
        analytics.track("turno_created");
        showToast(`${t("schedule.appointmentCreated")}`, "success");
        mutate();
        setShowNewModal(false);
      } else {
        showToast(`${result.error}`, "error");
      }
      return result;
    },
    [mutate, showToast, t],
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">{t("nav.appointments")}</h1>
          <p className="text-sm text-ink-muted mt-0.5">
            {t("schedule.weekOfRange")} {fechasDias[0]} {t("schedule.to")} {fechasDias[5]}
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
          <div className="flex gap-0" data-tour="agenda-view-toggle">
            <button
              onClick={() => setVista("semana")}
              className={`px-4 py-2 text-sm rounded-[4px] font-medium transition ${vista === "semana" ? "bg-celeste-dark text-white" : "border border-border text-ink-light hover:border-celeste-dark"}`}
            >
              {t("label.week")}
            </button>
            <button
              onClick={() => setVista("lista")}
              className={`px-4 py-2 text-sm rounded-[4px] font-medium transition ${vista === "lista" ? "bg-celeste-dark text-white" : "border border-border text-ink-light hover:border-celeste-dark"}`}
            >
              {t("label.list")}
            </button>
          </div>
          <RequirePermission permission="agenda:write">
            <button
              onClick={() => setShowNewModal(true)}
              className="px-4 py-2 text-sm font-semibold bg-celeste-dark text-white rounded-[4px] hover:bg-celeste transition flex items-center gap-1.5"
              data-tour="btn-nuevo-turno"
            >
              <Plus className="w-4 h-4" /> {t("schedule.newAppointment")}
            </button>
          </RequirePermission>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" data-tour="agenda-kpi">
        {[
          {
            label: t("schedule.totalAppointments"),
            value: isLoading ? "..." : total,
            color: "border-celeste",
          },
          {
            label: t("status.confirmed"),
            value: isLoading ? "..." : confirmados,
            color: "border-green-400",
          },
          {
            label: t("status.pending"),
            value: isLoading ? "..." : pendientes,
            color: "border-amber-400",
          },
          {
            label: t("label.attended"),
            value: isLoading ? "..." : atendidos,
            color: "border-celeste",
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

      {/* Prof filter */}
      <div className="flex flex-wrap gap-2 items-center" data-tour="agenda-profesional-filter">
        <span className="text-xs font-bold text-ink-muted uppercase tracking-wider">
          {t("label.professional")}:
        </span>
        <button
          onClick={() => setProfFilter("")}
          className={`px-3 py-1.5 text-xs rounded-[4px] transition ${!profFilter ? "bg-ink text-white" : "border border-border text-ink-light hover:border-ink"}`}
        >
          {t("label.all")}
        </button>
        {profesionales.map((p) => (
          <button
            key={p.id}
            onClick={() => setProfFilter(p.id)}
            title={p.horario ? `${p.especialidad} — ${p.horario}` : p.especialidad}
            className={`px-3 py-1.5 text-xs rounded-[4px] border transition ${profFilter === p.id ? p.color + " font-semibold" : "border-border text-ink-light hover:border-ink"}`}
          >
            {p.nombre.split(" ").slice(0, 2).join(" ")}
            {p.horario && (
              <span className="ml-1 opacity-60 hidden sm:inline">
                <Clock className="inline w-3 h-3 -mt-px" />
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Selected professional schedule banner */}
      {profFilter &&
        (() => {
          const prof = profesionales.find((p) => p.id === profFilter);
          if (!prof?.horario) return null;
          return (
            <div className="flex items-center gap-2 px-4 py-2 bg-celeste-pale/40 border border-celeste-light rounded-lg text-sm">
              <Clock className="w-4 h-4 text-celeste-dark flex-shrink-0" />
              <span className="font-semibold text-ink">{prof.nombre}</span>
              <span className="text-ink-muted">—</span>
              <span className="text-ink-light">{prof.horario}</span>
            </div>
          );
        })()}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-celeste-dark animate-spin" />
          <span className="ml-2 text-sm text-ink-muted">{t("schedule.loading")}</span>
        </div>
      )}

      {/* List view */}
      {!isLoading && vista === "lista" && (
        <div
          className="bg-white border border-border rounded-lg overflow-hidden"
          data-tour="agenda-table"
        >
          <table className="w-full text-sm" aria-label="Agenda de turnos">
            <thead>
              <tr className="bg-surface text-[10px] font-bold tracking-wider text-ink-muted uppercase">
                <th scope="col" className="text-left px-5 py-2.5">
                  {t("label.time")}
                </th>
                <th scope="col" className="text-left px-5 py-2.5">
                  {locale === "en" ? "Duration" : "Duración"}
                </th>
                <th scope="col" className="text-left px-5 py-2.5">
                  {t("label.patient")}
                </th>
                <th scope="col" className="text-left px-5 py-2.5">
                  {t("label.professional")}
                </th>
                <th scope="col" className="text-left px-5 py-2.5">
                  {t("label.type")}
                </th>
                <th scope="col" className="text-left px-5 py-2.5">
                  {t("billing.insurer")}
                </th>
                <th scope="col" className="text-center px-5 py-2.5">
                  {t("label.status")}
                </th>
                <th scope="col" className="text-center px-5 py-2.5">
                  {t("label.actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered
                .sort((a: Turno, b: Turno) => a.hora.localeCompare(b.hora))
                .map((turno: Turno) => (
                  <tr
                    key={turno.id}
                    className="border-t border-border-light hover:bg-celeste-pale/30 transition"
                  >
                    <td className="px-5 py-3 font-mono text-xs text-ink">{turno.hora}</td>
                    <td className="px-5 py-3 text-xs text-ink-light">
                      {turno.durationMin ? (
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {turno.durationMin} min
                        </span>
                      ) : (
                        <span className="text-ink-muted">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-xs font-semibold text-ink">{turno.paciente}</td>
                    <td className="px-5 py-3 text-xs text-ink-light">{turno.profesional}</td>
                    <td className="px-5 py-3 text-xs text-ink-light">{turno.tipo}</td>
                    <td className="px-5 py-3 text-xs text-ink-light">{turno.financiador}</td>
                    <td className="px-5 py-3 text-center">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded capitalize ${estadoColor[turno.estado] ?? "bg-gray-50 text-gray-500"}`}
                      >
                        {turno.estado}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <RequirePermission permission="agenda:write">
                        <div className="flex items-center justify-center gap-1">
                          {actionLoading === turno.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-ink-muted" />
                          ) : (
                            <>
                              {turno.estado === "pendiente" && (
                                <button
                                  onClick={() => handleConfirm(turno.id)}
                                  className="p-1 text-green-600 hover:bg-green-50 rounded transition"
                                  title={t("action.confirm")}
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {(turno.estado === "confirmado" || turno.estado === "pendiente") && (
                                <button
                                  onClick={() => handleAttend(turno.id)}
                                  className="p-1 text-celeste-dark hover:bg-celeste-pale rounded transition"
                                  title={t("label.attended")}
                                >
                                  <Clock className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {turno.estado !== "cancelado" && turno.estado !== "atendido" && (
                                <button
                                  onClick={() => handleCancel(turno.id)}
                                  className="p-1 text-red-500 hover:bg-red-50 rounded transition"
                                  title={t("action.cancel")}
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
              {t("schedule.noAppointments")}
            </div>
          )}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────
           ENTERPRISE WEEK VIEW — Vertical timeline schedule grid
           07:00–21:00 · 30-min gridlines · doctor-colored blocks
           current-time indicator · duration-aware heights
         ──────────────────────────────────────────────────────── */}
      {!isLoading &&
        vista === "semana" &&
        (() => {
          // ── Constants ──
          const START_HOUR = 10;
          const END_HOUR = 17;
          const TOTAL_HOURS = END_HOUR - START_HOUR; // 7
          const HOUR_PX = 64; // height per hour
          const TOTAL_PX = TOTAL_HOURS * HOUR_PX; // 896px
          const PX_PER_MIN = HOUR_PX / 60;

          // Half-hour time labels
          const timeLabels: string[] = [];
          for (let h = START_HOUR; h < END_HOUR; h++) {
            timeLabels.push(`${String(h).padStart(2, "0")}:00`);
            timeLabels.push(`${String(h).padStart(2, "0")}:30`);
          }

          // Parse "HH:MM" to minutes since START_HOUR
          const parseToOffset = (hora: string): number => {
            const [hh, mm] = hora.split(":").map(Number);
            return ((hh ?? START_HOUR) - START_HOUR) * 60 + (mm ?? 0);
          };

          // Current time position
          const now = new Date();
          const nowMinOffset = (now.getHours() - START_HOUR) * 60 + now.getMinutes();
          const todayDayIdx = (now.getDay() + 6) % 7; // 0=Mon

          // Color lookup: profesionalId → bg class
          const profColorMap: Record<string, { bg: string; border: string; text: string }> = {};
          const colorPalette = [
            { bg: "bg-blue-50", border: "border-blue-400", text: "text-blue-700" },
            { bg: "bg-green-50", border: "border-green-400", text: "text-green-700" },
            { bg: "bg-purple-50", border: "border-purple-400", text: "text-purple-700" },
            { bg: "bg-amber-50", border: "border-amber-500", text: "text-amber-700" },
            { bg: "bg-pink-50", border: "border-pink-400", text: "text-pink-700" },
            { bg: "bg-teal-50", border: "border-teal-400", text: "text-teal-700" },
            { bg: "bg-indigo-50", border: "border-indigo-400", text: "text-indigo-700" },
            { bg: "bg-red-50", border: "border-red-400", text: "text-red-700" },
            { bg: "bg-cyan-50", border: "border-cyan-400", text: "text-cyan-700" },
            { bg: "bg-orange-50", border: "border-orange-400", text: "text-orange-700" },
          ];
          profesionales.forEach((p, i) => {
            profColorMap[p.id] = colorPalette[i % colorPalette.length]!;
            // Also map by name for turnos that only have profesional name
            profColorMap[p.nombre] = colorPalette[i % colorPalette.length]!;
          });

          const defaultColor = {
            bg: "bg-celeste-pale",
            border: "border-celeste",
            text: "text-celeste-dark",
          };

          // Group turnos by day column index
          const turnosByDay: Record<number, Turno[]> = {};
          for (const turno of filtered) {
            const dayIdx = isoFechas.indexOf(turno.fecha ?? "");
            if (dayIdx < 0) continue;
            (turnosByDay[dayIdx] ??= []).push(turno);
          }

          return (
            <div className="bg-white border border-border rounded-lg overflow-hidden">
              {/* Day header row */}
              <div
                className="grid border-b border-border"
                style={{ gridTemplateColumns: "56px repeat(5, 1fr)" }}
              >
                <div className="bg-surface px-2 py-3 text-center">
                  <span className="text-[9px] font-bold tracking-widest text-ink-muted uppercase">
                    {locale === "en" ? "Time" : "Hora"}
                  </span>
                </div>
                {localeDays.map((day, i) => {
                  const isToday = i === todayDayIdx;
                  const dateNum = fechasDias[i]?.split("/")[0];
                  return (
                    <div
                      key={day}
                      className={`px-2 py-2 text-center border-l border-border ${isToday ? "bg-celeste-pale/40" : "bg-surface"}`}
                    >
                      <div
                        className={`text-[10px] font-bold tracking-wider uppercase ${isToday ? "text-celeste-dark" : "text-ink-muted"}`}
                      >
                        {day}
                      </div>
                      <div
                        className={`text-lg font-bold leading-tight ${isToday ? "text-celeste-dark" : "text-ink"}`}
                      >
                        {dateNum}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Scrollable schedule body */}
              <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 340px)" }}>
                <div className="grid" style={{ gridTemplateColumns: "56px repeat(5, 1fr)" }}>
                  {/* Time gutter + grid lines + appointment columns */}
                  <div className="relative" style={{ height: `${TOTAL_PX}px` }}>
                    {/* Time labels */}
                    {timeLabels.map((label) => {
                      const [hh, mm] = label.split(":").map(Number);
                      const offset =
                        ((hh ?? START_HOUR) - START_HOUR) * HOUR_PX + (mm ?? 0) * PX_PER_MIN;
                      const isHour = (mm ?? 0) === 0;
                      return (
                        <div
                          key={label}
                          className={`absolute right-0 left-0 pr-2 text-right ${isHour ? "text-[10px] font-semibold text-ink-muted" : "text-[9px] text-ink-muted/50"}`}
                          style={{ top: `${offset - 6}px` }}
                        >
                          {label}
                        </div>
                      );
                    })}
                  </div>

                  {/* Day columns */}
                  {localeDays.map((_, di) => {
                    const isToday = di === todayDayIdx;
                    const dayTurnos = turnosByDay[di] ?? [];

                    return (
                      <div
                        key={di}
                        className={`relative border-l border-border ${isToday ? "bg-celeste-pale/10" : ""}`}
                        style={{ height: `${TOTAL_PX}px` }}
                      >
                        {/* Horizontal grid lines at each half hour */}
                        {timeLabels.map((label) => {
                          const [hh, mm] = label.split(":").map(Number);
                          const offset =
                            ((hh ?? START_HOUR) - START_HOUR) * HOUR_PX + (mm ?? 0) * PX_PER_MIN;
                          const isHour = (mm ?? 0) === 0;
                          return (
                            <div
                              key={label}
                              className={`absolute left-0 right-0 ${isHour ? "border-t border-border" : "border-t border-border-light/50 border-dashed"}`}
                              style={{ top: `${offset}px` }}
                            />
                          );
                        })}

                        {/* Current-time indicator (red line) */}
                        {isToday && nowMinOffset >= 0 && nowMinOffset <= TOTAL_HOURS * 60 && (
                          <div
                            className="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
                            style={{ top: `${nowMinOffset * PX_PER_MIN}px` }}
                          >
                            <div className="w-2 h-2 rounded-full bg-red-500 -ml-1 shrink-0" />
                            <div className="flex-1 border-t-2 border-red-500" />
                          </div>
                        )}

                        {/* Appointment blocks */}
                        {dayTurnos.map((turno, ti) => {
                          const offset = parseToOffset(turno.hora);
                          const duration = turno.durationMin ?? 30;
                          const blockHeight = Math.max(duration * PX_PER_MIN, 24);
                          const topPx = Math.max(offset * PX_PER_MIN, 0);

                          // Find color by profesionalId or name
                          const color =
                            profColorMap[turno.profesionalId ?? ""] ??
                            profColorMap[turno.profesional ?? ""] ??
                            defaultColor;

                          // Check for overlapping — nudge right if same time
                          const overlapIdx = dayTurnos.slice(0, ti).filter((prev) => {
                            const prevOff = parseToOffset(prev.hora);
                            const prevDur = prev.durationMin ?? 30;
                            return prevOff < offset + duration && prevOff + prevDur > offset;
                          }).length;
                          const overlapShift = overlapIdx * 6;

                          return (
                            <div
                              key={turno.id}
                              className={`absolute left-1 border-l-[3px] rounded-r-[3px] px-1.5 py-0.5 overflow-hidden cursor-pointer
                              hover:shadow-md hover:z-30 transition-shadow group
                              ${color.bg} ${color.border} ${color.text}`}
                              style={{
                                top: `${topPx + 1}px`,
                                height: `${blockHeight - 2}px`,
                                right: "4px",
                                marginLeft: overlapShift > 0 ? `${overlapShift}px` : undefined,
                                zIndex: 10 + ti,
                              }}
                              title={`${turno.hora} — ${turno.paciente}\n${turno.profesional} · ${turno.tipo}\n${turno.financiador} · ${turno.estado}`}
                            >
                              <div className="flex items-center gap-1 leading-tight">
                                <span className="font-bold text-[10px] truncate">
                                  {turno.paciente}
                                </span>
                                {turno.estado === "confirmado" && (
                                  <Check className="w-2.5 h-2.5 text-green-600 shrink-0" />
                                )}
                              </div>
                              {blockHeight > 28 && (
                                <div className="text-[9px] opacity-80 truncate leading-tight">
                                  {turno.profesional}
                                </div>
                              )}
                              {blockHeight > 42 && (
                                <div className="flex items-center gap-1 text-[8px] opacity-60 mt-0.5">
                                  <span className="truncate">{turno.tipo}</span>
                                  <span>·</span>
                                  <span>{duration}′</span>
                                </div>
                              )}
                              {blockHeight > 56 && (
                                <span
                                  className={`inline-block mt-0.5 px-1 py-px rounded text-[7px] font-bold capitalize ${estadoColor[turno.estado] ?? "bg-gray-50 text-gray-500"}`}
                                >
                                  {turno.estado}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })()}

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-[10px] text-ink-muted">
        {profesionales.map((p, i) => {
          const palette = [
            "bg-blue-400",
            "bg-green-400",
            "bg-purple-400",
            "bg-amber-500",
            "bg-pink-400",
            "bg-teal-400",
            "bg-indigo-400",
            "bg-red-400",
            "bg-cyan-400",
            "bg-orange-400",
          ];
          return (
            <div key={p.id} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-sm ${palette[i % palette.length]}`} />
              <span>
                {p.nombre} — {p.especialidad}
              </span>
            </div>
          );
        })}
      </div>

      {/* New Turno Modal */}
      {showNewModal && (
        <NewTurnoModal
          onClose={() => setShowNewModal(false)}
          onCreate={handleCreate}
          profesionales={profesionales}
        />
      )}

      <ConfirmDialog
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={() => {
          if (cancelTarget) doCancel(cancelTarget);
          setCancelTarget(null);
        }}
        title={t("schedule.cancelAppointment")}
        message={t("schedule.cancelConfirm")}
        variant="danger"
      />
    </div>
  );
}

// ─── New Turno Modal ─────────────────────────────────────────

function NewTurnoModal({
  onClose,
  onCreate,
  profesionales,
}: {
  onClose: () => void;
  onCreate: (input: CreateTurnoInput) => Promise<{ success: boolean; error?: string }>;
  profesionales: Profesional[];
}) {
  const { t, locale } = useLocale();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [profSearch, setProfSearch] = useState("");
  /** Whether the receptionist manually changed the duration (override mode) */
  const [durationOverridden, setDurationOverridden] = useState(false);

  /** Map of service category → duration_min from clinic_services */
  const [serviceDurations, setServiceDurations] = useState<Record<string, number>>({});

  // Fetch clinic_services once to get per-type default durations
  useEffect(() => {
    fetch("/api/services")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data?.services) return;
        const map: Record<string, number> = {};
        for (const svc of data.services as {
          name: string;
          category: string;
          duration_min: number | null;
        }[]) {
          if (svc.duration_min) {
            // Map by name (exact match) and by category as fallback
            map[svc.name] = svc.duration_min;
            if (!map[svc.category]) map[svc.category] = svc.duration_min;
          }
        }
        setServiceDurations(map);
      })
      .catch(() => {});
  }, []);

  const [form, setForm] = useState<CreateTurnoInput>({
    fecha: new Date().toISOString().slice(0, 10),
    hora: "09:00",
    paciente: "",
    tipo: "Consulta",
    financiador: "PAMI",
    profesional: "",
    profesionalId: "",
    notas: "",
    durationMin: DEFAULT_DURATION_BY_TYPE["Consulta"] ?? 30,
  });

  // Filter profesionales by search text
  const filteredProfs = useMemo(() => {
    if (!profSearch.trim()) return profesionales;
    const q = profSearch.toLowerCase();
    return profesionales.filter(
      (p) => p.nombre.toLowerCase().includes(q) || p.especialidad.toLowerCase().includes(q),
    );
  }, [profesionales, profSearch]);

  /** Derive best-guess duration for a given appointment type */
  const getDurationForType = useCallback(
    (tipo: string): number => {
      // 1. Exact match from clinic_services
      if (serviceDurations[tipo]) return serviceDurations[tipo];
      // 2. Category fallback (lowercase match)
      const lower = tipo.toLowerCase();
      for (const [key, dur] of Object.entries(serviceDurations)) {
        if (key.toLowerCase() === lower) return dur;
      }
      // 3. Built-in defaults
      return DEFAULT_DURATION_BY_TYPE[tipo] ?? 30;
    },
    [serviceDurations],
  );

  /** Handle tipo change — auto-set duration unless receptionist overrode it */
  const handleTipoChange = useCallback(
    (newTipo: string) => {
      const suggestedDur = getDurationForType(newTipo);
      setForm((prev) => ({
        ...prev,
        tipo: newTipo,
        ...(durationOverridden ? {} : { durationMin: suggestedDur }),
      }));
    },
    [getDurationForType, durationOverridden],
  );

  /** Handle manual duration change by receptionist */
  const handleDurationChange = useCallback((min: number) => {
    setDurationOverridden(true);
    setForm((prev) => ({ ...prev, durationMin: min }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.paciente.trim()) {
      setError(t("schedule.enterPatientName"));
      return;
    }
    if (!form.profesionalId) {
      setError(locale === "en" ? "Please select a professional" : "Seleccione un profesional");
      return;
    }
    setLoading(true);
    setError("");
    const result = await onCreate(form);
    setLoading(false);
    if (!result.success) {
      setError(result.error ?? t("schedule.errorCreating"));
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
            {t("schedule.newAppointment")}
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

          {/* ── Professional — primary decision for receptionist ── */}
          <div className="bg-celeste-pale/20 border border-celeste-light/60 rounded-lg p-4">
            <label className="flex items-center gap-1.5 text-xs font-bold text-celeste-dark uppercase tracking-wider mb-2">
              <UserRound className="w-3.5 h-3.5" />
              {t("label.professional")}
            </label>
            {profesionales.length > 6 && (
              <input
                type="text"
                placeholder={locale === "en" ? "Search doctor..." : "Buscar profesional..."}
                value={profSearch}
                onChange={(e) => setProfSearch(e.target.value)}
                className="w-full px-3 py-1.5 mb-1.5 border border-border rounded-[4px] text-xs bg-white focus:outline-none focus:ring-2 focus:ring-celeste-200 focus:border-celeste-dark"
              />
            )}
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
              className="w-full px-3 py-2.5 border border-celeste-light rounded-[4px] text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-celeste-200 focus:border-celeste-dark"
            >
              <option value="">
                {locale === "en" ? "— Select professional —" : "— Seleccionar profesional —"}
              </option>
              {filteredProfs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre} — {p.especialidad}
                  {p.horario ? ` (${p.horario})` : ""}
                </option>
              ))}
            </select>
            {form.profesionalId &&
              (() => {
                const sel = profesionales.find((p) => p.id === form.profesionalId);
                if (!sel?.horario) return null;
                return (
                  <div className="mt-2 px-3 py-2 bg-white border border-celeste-light rounded text-xs text-ink-light flex items-start gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-celeste-dark flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-ink">
                        {locale === "en" ? "Hours:" : "Horarios:"}
                      </span>{" "}
                      {sel.horario}
                    </div>
                  </div>
                );
              })()}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">
                {t("label.date")}
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
                {t("label.time")}
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

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">
                {t("label.patient")}
              </label>
              <input
                type="text"
                placeholder={t("schedule.patientNamePlaceholder")}
                value={form.paciente}
                onChange={(e) => setForm({ ...form, paciente: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-[4px] text-sm focus:outline-none focus:ring-2 focus:ring-celeste-200 focus:border-celeste-dark"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">
                {t("label.type")}
              </label>
              <select
                value={form.tipo}
                onChange={(e) => handleTipoChange(e.target.value)}
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

          {/* Duration picker — receptionist-configurable */}
          <div>
            <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">
              {locale === "en" ? "Duration" : "Duración"}
            </label>
            <div className="flex items-center gap-2">
              <div className="flex flex-wrap gap-1.5">
                {DURATION_OPTIONS.map((min) => (
                  <button
                    key={min}
                    type="button"
                    onClick={() => handleDurationChange(min)}
                    className={`px-2.5 py-1.5 text-xs rounded-[4px] border transition font-medium ${
                      form.durationMin === min
                        ? "bg-celeste-dark text-white border-celeste-dark"
                        : "border-border text-ink-light hover:border-celeste-dark hover:text-celeste-dark"
                    }`}
                  >
                    {min} min
                  </button>
                ))}
              </div>
              {/* Custom input for non-standard durations */}
              <input
                type="number"
                min={5}
                max={480}
                step={5}
                value={form.durationMin ?? 30}
                onChange={(e) => handleDurationChange(Math.max(5, Number(e.target.value) || 30))}
                className="w-20 px-2 py-1.5 border border-border rounded-[4px] text-xs text-center focus:outline-none focus:ring-2 focus:ring-celeste-200 focus:border-celeste-dark"
                title={locale === "en" ? "Custom duration (min)" : "Duración personalizada (min)"}
              />
            </div>
            {durationOverridden && (
              <button
                type="button"
                onClick={() => {
                  setDurationOverridden(false);
                  setForm((prev) => ({
                    ...prev,
                    durationMin: getDurationForType(prev.tipo),
                  }));
                }}
                className="mt-1 text-[10px] text-celeste-dark hover:underline"
              >
                {locale === "en"
                  ? "↩ Reset to default for this type"
                  : "↩ Restablecer duración por defecto"}
              </button>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">
              {t("billing.insurer")}
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
              {t("label.notes")} ({t("label.optional")})
            </label>
            <textarea
              rows={2}
              value={form.notas}
              onChange={(e) => setForm({ ...form, notas: e.target.value })}
              placeholder={t("schedule.additionalObservations")}
              className="w-full px-3 py-2 border border-border rounded-[4px] text-sm focus:outline-none focus:ring-2 focus:ring-celeste-200 focus:border-celeste-dark resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium border border-border rounded-[4px] text-ink-light hover:border-ink transition"
            >
              {t("action.cancel")}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-semibold bg-celeste-dark text-white rounded-[4px] hover:bg-celeste transition disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {t("schedule.createAppointment")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import { useLocale } from "@/lib/i18n/context";
import { useDoctors } from "@/lib/hooks/useModules";
import { formatDoctorSchedule } from "@/lib/services/directorio";
import { Calendar, Clock, ChevronLeft, ChevronRight, Users } from "lucide-react";

// ── Types ────────────────────────────────────────────────────

type Profesional = {
  id: string;
  nombre: string;
  especialidad: string;
  color: string;
  /** Compact schedule text, e.g. "Lun 14:30–16:30 · Jue 10:00–12:00" */
  horario: string;
};

type ScheduleBlock = {
  profId: string;
  dayIdx: number;
  startMin: number;
  endMin: number;
  note?: string;
};

type LanedBlock = ScheduleBlock & { lane: number; totalLanes: number };

// ── Color Palettes ───────────────────────────────────────────

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

const blockPalette = [
  { bg: "bg-blue-50", border: "border-l-blue-500", text: "text-blue-800", accent: "bg-blue-500" },
  {
    bg: "bg-green-50",
    border: "border-l-green-500",
    text: "text-green-800",
    accent: "bg-green-500",
  },
  {
    bg: "bg-purple-50",
    border: "border-l-purple-500",
    text: "text-purple-800",
    accent: "bg-purple-500",
  },
  {
    bg: "bg-amber-50",
    border: "border-l-amber-500",
    text: "text-amber-800",
    accent: "bg-amber-500",
  },
  { bg: "bg-pink-50", border: "border-l-pink-500", text: "text-pink-800", accent: "bg-pink-500" },
  { bg: "bg-teal-50", border: "border-l-teal-500", text: "text-teal-800", accent: "bg-teal-500" },
  {
    bg: "bg-indigo-50",
    border: "border-l-indigo-500",
    text: "text-indigo-800",
    accent: "bg-indigo-500",
  },
  { bg: "bg-red-50", border: "border-l-red-500", text: "text-red-800", accent: "bg-red-500" },
  { bg: "bg-cyan-50", border: "border-l-cyan-500", text: "text-cyan-800", accent: "bg-cyan-500" },
  {
    bg: "bg-orange-50",
    border: "border-l-orange-500",
    text: "text-orange-800",
    accent: "bg-orange-500",
  },
];

// ── Centro Médico Roca — full doctor roster (fallback) ───────
// Source: create-doctor-accounts.mjs (Mar 2026) + Francisco script

const CMR_DOCTORS: Profesional[] = [
  {
    id: "cmr-francisco",
    nombre: "Dr. Francisco Lopez",
    especialidad: "Director Médico",
    color: profColors[0]!,
    horario: "Lun–Vie 10:00–17:00",
  },
  {
    id: "cmr-vargas",
    nombre: "Dr. Vargas Freddy",
    especialidad: "Cirugía Dental",
    color: profColors[1]!,
    horario: "Lun 14:30–15:30",
  },
  {
    id: "cmr-angela",
    nombre: "Dra. Angela María González",
    especialidad: "Gastroenterología",
    color: profColors[2]!,
    horario: "Lun 10:00–12:00",
  },
  {
    id: "cmr-nigro",
    nombre: "Dra. Clara Nigro",
    especialidad: "Neurología",
    color: profColors[3]!,
    horario: "Lun 15:00–16:00",
  },
  {
    id: "cmr-delgadillo",
    nombre: "Dr. Gustavo Delgadillo",
    especialidad: "Ecografía",
    color: profColors[4]!,
    horario: "Mar 10:00–12:00 · Jue 14:00–15:45",
  },
  {
    id: "cmr-taboada",
    nombre: "Dra. Yessica Taboada",
    especialidad: "Odontología",
    color: profColors[5]!,
    horario: "Mar 14:00–17:00",
  },
  {
    id: "cmr-rivero",
    nombre: "Dr. Richard Rivero",
    especialidad: "Traumatología",
    color: profColors[6]!,
    horario: "Mar 17:00–18:00",
  },
  {
    id: "cmr-gibilbank",
    nombre: "Dra. Martha Gibilbank",
    especialidad: "Oftalmología",
    color: profColors[7]!,
    horario: "Mar 15:00–16:00",
  },
  {
    id: "cmr-legal",
    nombre: "Dra. Norma Legal",
    especialidad: "Hematología",
    color: profColors[8]!,
    horario: "Mar 15:00–16:00 · Jue 16:00–17:00",
  },
  {
    id: "cmr-rios",
    nombre: "Dra. Mariana Ríos",
    especialidad: "Terapia Alternativa",
    color: profColors[9]!,
    horario: "1 vez al mes (ella avisa)",
  },
  {
    id: "cmr-acevedo",
    nombre: "Lic. Cristina Acevedo",
    especialidad: "Mamografía / Kinesiología",
    color: profColors[0]!,
    horario: "Mar 09:00–12:00 · Jue 09:00–12:00",
  },
  {
    id: "cmr-vargasl",
    nombre: "Dr. Rogelio Vargas Lopez",
    especialidad: "Urología",
    color: profColors[1]!,
    horario: "Mié 11:30–12:30",
  },
  {
    id: "cmr-urbieta",
    nombre: "Dra. Alicia Urbieta",
    especialidad: "Alergista",
    color: profColors[2]!,
    horario: "Mié 14:00–15:00 (cada 15 días)",
  },
  {
    id: "cmr-espinoza",
    nombre: "Dra. Sikiu Espinoza",
    especialidad: "Odontología",
    color: profColors[3]!,
    horario: "Mié 14:00–17:00 · Vie 14:00–17:00",
  },
  {
    id: "cmr-angelotti",
    nombre: "Dra. Liliana Angelotti",
    especialidad: "Endocrinología",
    color: profColors[4]!,
    horario: "Jue 10:00–12:00 (cada 15 días)",
  },
  {
    id: "cmr-dalpiaz",
    nombre: "Dr. Juan Manuel Dalpiaz",
    especialidad: "Cirugía General",
    color: profColors[5]!,
    horario: "Jue 11:00–12:00",
  },
  {
    id: "cmr-lezcano",
    nombre: "Dr. Adrián Lezcano",
    especialidad: "Infectología",
    color: profColors[6]!,
    horario: "Jue 13:00–14:00",
  },
  {
    id: "cmr-jimenez",
    nombre: "Dra. Susana Jiménez",
    especialidad: "Dermatología",
    color: profColors[7]!,
    horario: "Jue 15:00–16:00 (cada 15 días)",
  },
  {
    id: "cmr-lagos",
    nombre: "Dr. Carlos Lagos",
    especialidad: "Flebología",
    color: profColors[8]!,
    horario: "Jue 17:00–18:00",
  },
  {
    id: "cmr-heit",
    nombre: "Téc. Esteban Heit",
    especialidad: "Radiografía",
    color: profColors[9]!,
    horario: "Lun–Vie 13:30–15:00",
  },
  {
    id: "cmr-baied",
    nombre: "Dra. María del Carmen Baied",
    especialidad: "Reumatología",
    color: profColors[0]!,
    horario: "Vie 09:30–10:30",
  },
  {
    id: "cmr-gutierrez",
    nombre: "Dra. Irene Gutiérrez",
    especialidad: "Diabetología",
    color: profColors[1]!,
    horario: "Vie 09:00–10:00",
  },
  {
    id: "cmr-abdala",
    nombre: "Dra. Alicia Abdala",
    especialidad: "Gastroenterología",
    color: profColors[2]!,
    horario: "Vie 12:30–14:00",
  },
  {
    id: "cmr-asz",
    nombre: "Dr. José Asz",
    especialidad: "Oftalmología",
    color: profColors[3]!,
    horario: "Vie 13:30–14:30 (cada 15 días)",
  },
  {
    id: "cmr-diccea",
    nombre: "Dr. Carlos Diccea",
    especialidad: "Ginecología",
    color: profColors[4]!,
    horario: "Vie 14:00–15:00",
  },
  {
    id: "cmr-molina",
    nombre: "Lic. Oscar Molina",
    especialidad: "Psicología",
    color: profColors[5]!,
    horario: "Confirmar horario",
  },
  {
    id: "cmr-tottereaus",
    nombre: "Dr. Julián Tottereaus",
    especialidad: "Neumonología",
    color: profColors[6]!,
    horario: "Vie 15:00–16:00 (1 vez al mes)",
  },
];

// ── Day constants ────────────────────────────────────────────

const DAYS_ES = ["Lun", "Mar", "Mié", "Jue", "Vie"];
const DAYS_EN = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const DAY_MAP: Record<string, number> = { Lun: 0, Mar: 1, Mié: 2, Jue: 3, Vie: 4 };

// ── Helpers ──────────────────────────────────────────────────

function timeToMin(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

function minToTime(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Parse "Lun 14:30–15:30" or "Lun–Vie 10:00–17:00" horario strings into blocks */
function parseHorario(horario: string, profId: string): ScheduleBlock[] {
  if (!horario || horario === "Confirmar horario" || horario.includes("ella avisa")) return [];

  const blocks: ScheduleBlock[] = [];
  const parts = horario.split(" · ");

  for (const part of parts) {
    let note: string | undefined;
    let cleanPart = part;

    // Extract notes like "(cada 15 días)" or "(1 vez al mes)"
    const noteMatch = part.match(/\(([^)]+)\)/);
    if (noteMatch) {
      note = noteMatch[1];
      cleanPart = part.replace(/\s*\([^)]+\)/, "").trim();
    }

    // Day range: "Lun–Vie 10:00–17:00"
    const rangeMatch = cleanPart.match(/^(\w+)–(\w+)\s+(\d{2}:\d{2})–(\d{2}:\d{2})/);
    if (rangeMatch) {
      const startDay = DAY_MAP[rangeMatch[1]!];
      const endDay = DAY_MAP[rangeMatch[2]!];
      if (startDay !== undefined && endDay !== undefined) {
        for (let d = startDay; d <= endDay; d++) {
          blocks.push({
            profId,
            dayIdx: d,
            startMin: timeToMin(rangeMatch[3]!),
            endMin: timeToMin(rangeMatch[4]!),
            note,
          });
        }
      }
      continue;
    }

    // Single day: "Mar 14:00–17:00"
    const singleMatch = cleanPart.match(/^(\w+)\s+(\d{2}:\d{2})–(\d{2}:\d{2})/);
    if (singleMatch) {
      const dayIdx = DAY_MAP[singleMatch[1]!];
      if (dayIdx !== undefined) {
        blocks.push({
          profId,
          dayIdx,
          startMin: timeToMin(singleMatch[2]!),
          endMin: timeToMin(singleMatch[3]!),
          note,
        });
      }
    }
  }

  return blocks;
}

/** Greedy lane assignment for overlapping blocks within a single day */
function assignLanes(blocks: ScheduleBlock[]): LanedBlock[] {
  if (blocks.length === 0) return [];
  const sorted = [...blocks].sort((a, b) => a.startMin - b.startMin || a.endMin - b.endMin);
  const laneEnds: number[] = [];
  const result: LanedBlock[] = [];

  for (const block of sorted) {
    let lane = -1;
    for (let i = 0; i < laneEnds.length; i++) {
      if (laneEnds[i]! <= block.startMin) {
        lane = i;
        break;
      }
    }
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(0);
    }
    laneEnds[lane] = block.endMin;
    result.push({ ...block, lane, totalLanes: 0 });
  }

  const totalLanes = laneEnds.length;
  return result.map((b) => ({ ...b, totalLanes }));
}

function getWeekDates(offset: number) {
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7) + offset * 7);
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return {
      date: d.toISOString().split("T")[0]!,
      dayNum: d.getDate(),
      monthNum: d.getMonth() + 1,
    };
  });
}

// ── Grid constants ───────────────────────────────────────────

const START_HOUR = 9;
const END_HOUR = 18;
const TOTAL_HOURS = END_HOUR - START_HOUR;
const HOUR_PX = 64;
const TOTAL_PX = TOTAL_HOURS * HOUR_PX;
const PX_PER_MIN = HOUR_PX / 60;
const START_MIN = START_HOUR * 60;

// ── Component ────────────────────────────────────────────────

export default function DisponibilidadPage() {
  const { t, locale } = useLocale();
  const { data: apiDoctors = [] } = useDoctors();
  const [weekOffset, setWeekOffset] = useState(0);
  const [profFilter, setProfFilter] = useState("");
  const [hoveredProf, setHoveredProf] = useState("");

  const localeDays = locale === "en" ? DAYS_EN : DAYS_ES;
  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);

  // ── Build profesionales (same merge logic as agenda) ───────
  const profesionales = useMemo(() => {
    const fromApi: Profesional[] = apiDoctors.map((d, i) => ({
      id: d.id,
      nombre: d.name,
      especialidad: d.specialty,
      color: profColors[i % profColors.length]!,
      horario: formatDoctorSchedule(d.schedule),
    }));
    if (fromApi.length > 0) {
      const apiNames = new Set(fromApi.map((p) => p.nombre.toLowerCase()));
      const missing = CMR_DOCTORS.filter((c) => !apiNames.has(c.nombre.toLowerCase()));
      return [...fromApi, ...missing];
    }
    return CMR_DOCTORS;
  }, [apiDoctors]);

  // Color index map: profId → palette index
  const profColorMap = useMemo(() => {
    const map: Record<string, number> = {};
    profesionales.forEach((p, i) => {
      map[p.id] = i % blockPalette.length;
    });
    return map;
  }, [profesionales]);

  // ── Parse all schedules ────────────────────────────────────
  const allBlocks = useMemo(
    () => profesionales.flatMap((p) => parseHorario(p.horario, p.id)),
    [profesionales],
  );

  const visibleBlocks = profFilter ? allBlocks.filter((b) => b.profId === profFilter) : allBlocks;

  // Lane assignment per day
  const lanedBlocksByDay = useMemo(() => {
    const byDay: Record<number, LanedBlock[]> = {};
    for (let d = 0; d < 5; d++) {
      byDay[d] = assignLanes(visibleBlocks.filter((b) => b.dayIdx === d));
    }
    return byDay;
  }, [visibleBlocks]);

  // ── KPIs ───────────────────────────────────────────────────
  const totalDoctors = profesionales.length;
  const todayDayIdx = (new Date().getDay() + 6) % 7;
  const doctorsToday = new Set(
    allBlocks.filter((b) => b.dayIdx === todayDayIdx).map((b) => b.profId),
  ).size;
  const specialties = new Set(profesionales.map((p) => p.especialidad)).size;

  // Doctors who have schedule blocks (used for filter pills)
  const scheduledProfs = useMemo(
    () => profesionales.filter((p) => parseHorario(p.horario, p.id).length > 0),
    [profesionales],
  );
  // Doctors without defined schedule
  const noScheduleProfs = useMemo(
    () => profesionales.filter((p) => parseHorario(p.horario, p.id).length === 0),
    [profesionales],
  );

  // ── Current time indicator ─────────────────────────────────
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();

  // Half-hour time labels
  const timeLabels: string[] = [];
  for (let h = START_HOUR; h < END_HOUR; h++) {
    timeLabels.push(`${String(h).padStart(2, "0")}:00`);
    timeLabels.push(`${String(h).padStart(2, "0")}:30`);
  }

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* ─── Header ───────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink flex items-center gap-2">
            <Calendar className="h-6 w-6 text-celeste-dark" />
            {t("availability.title")}
          </h1>
          <p className="text-sm text-ink/60 mt-1">
            {locale === "en"
              ? "Weekly availability overview for all professionals"
              : "Vista semanal de disponibilidad de todos los profesionales"}
          </p>
        </div>

        {/* Week navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekOffset((p) => p - 1)}
            className="rounded-[4px] border border-ink/20 p-2 hover:bg-ink/5 transition-colors"
            aria-label={t("availability.previousWeek")}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-medium text-ink min-w-[160px] text-center">
            {weekDates[0]?.dayNum}/{weekDates[0]?.monthNum} — {weekDates[4]?.dayNum}/
            {weekDates[4]?.monthNum}
          </span>
          <button
            onClick={() => setWeekOffset((p) => p + 1)}
            className="rounded-[4px] border border-ink/20 p-2 hover:bg-ink/5 transition-colors"
            aria-label={t("availability.nextWeek")}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          {weekOffset !== 0 && (
            <button
              onClick={() => setWeekOffset(0)}
              className="ml-2 text-xs text-celeste-dark hover:underline font-medium"
            >
              {t("availability.today")}
            </button>
          )}
        </div>
      </div>

      {/* ─── KPI Row ──────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-border rounded-lg p-4 border-l-[3px] border-l-celeste">
          <p className="text-[10px] font-bold tracking-wider text-ink-muted uppercase">
            <Users className="w-3 h-3 inline mr-1" />
            {locale === "en" ? "Total Professionals" : "Total Profesionales"}
          </p>
          <p className="text-xl font-bold text-ink mt-1">{totalDoctors}</p>
        </div>
        <div className="bg-white border border-border rounded-lg p-4 border-l-[3px] border-l-green-400">
          <p className="text-[10px] font-bold tracking-wider text-ink-muted uppercase">
            <Clock className="w-3 h-3 inline mr-1" />
            {locale === "en" ? "Available Today" : "Disponibles Hoy"}
          </p>
          <p className="text-xl font-bold text-ink mt-1">{doctorsToday}</p>
        </div>
        <div className="bg-white border border-border rounded-lg p-4 border-l-[3px] border-l-purple-400">
          <p className="text-[10px] font-bold tracking-wider text-ink-muted uppercase">
            {locale === "en" ? "Specialties" : "Especialidades"}
          </p>
          <p className="text-xl font-bold text-ink mt-1">{specialties}</p>
        </div>
      </div>

      {/* ─── Professional filter pills ────────────────────── */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs font-bold text-ink-muted uppercase tracking-wider">
          {t("availability.professional")}
        </span>
        <button
          onClick={() => setProfFilter("")}
          className={`px-3 py-1.5 text-xs rounded-[4px] transition ${
            !profFilter
              ? "bg-ink text-white"
              : "border border-border text-ink-light hover:border-ink"
          }`}
        >
          {locale === "en" ? "All" : "Todos"}
        </button>
        {scheduledProfs.map((p) => (
          <button
            key={p.id}
            onClick={() => setProfFilter(profFilter === p.id ? "" : p.id)}
            title={`${p.especialidad} — ${p.horario}`}
            className={`px-3 py-1.5 text-xs rounded-[4px] border transition ${
              profFilter === p.id
                ? `${p.color} font-semibold`
                : "border-border text-ink-light hover:border-ink"
            }`}
          >
            {p.nombre.split(" ").slice(0, 2).join(" ")}
            <span className="ml-1 opacity-60 hidden sm:inline">
              <Clock className="inline w-3 h-3 -mt-px" />
            </span>
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
              <span className="text-ink-light">{prof.especialidad}</span>
              <span className="text-ink-muted">·</span>
              <span className="text-ink-light">{prof.horario}</span>
            </div>
          );
        })()}

      {/* ─── Enterprise Week Grid ─────────────────────────── */}
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
            const isToday = i === todayDayIdx && weekOffset === 0;
            return (
              <div
                key={day}
                className={`px-2 py-2 text-center border-l border-border ${
                  isToday ? "bg-celeste-pale/40" : "bg-surface"
                }`}
              >
                <div
                  className={`text-[10px] font-bold tracking-wider uppercase ${
                    isToday ? "text-celeste-dark" : "text-ink-muted"
                  }`}
                >
                  {day}
                </div>
                <div
                  className={`text-lg font-bold leading-tight ${
                    isToday ? "text-celeste-dark" : "text-ink"
                  }`}
                >
                  {weekDates[i]?.dayNum}
                </div>
              </div>
            );
          })}
        </div>

        {/* Scrollable schedule body */}
        <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 420px)" }}>
          <div className="grid" style={{ gridTemplateColumns: "56px repeat(5, 1fr)" }}>
            {/* Time gutter */}
            <div className="relative" style={{ height: `${TOTAL_PX}px` }}>
              {timeLabels.map((label) => {
                const [hh, mm] = label.split(":").map(Number);
                const offset = ((hh ?? START_HOUR) - START_HOUR) * HOUR_PX + (mm ?? 0) * PX_PER_MIN;
                const isHour = (mm ?? 0) === 0;
                return (
                  <div
                    key={label}
                    className={`absolute right-0 left-0 pr-2 text-right ${
                      isHour
                        ? "text-[10px] font-semibold text-ink-muted"
                        : "text-[9px] text-ink-muted/50"
                    }`}
                    style={{ top: `${offset - 6}px` }}
                  >
                    {label}
                  </div>
                );
              })}
            </div>

            {/* Day columns */}
            {localeDays.map((_, di) => {
              const isToday = di === todayDayIdx && weekOffset === 0;
              const dayBlocks = lanedBlocksByDay[di] ?? [];

              return (
                <div
                  key={di}
                  className={`relative border-l border-border ${isToday ? "bg-celeste-pale/10" : ""}`}
                  style={{ height: `${TOTAL_PX}px` }}
                >
                  {/* Horizontal grid lines */}
                  {timeLabels.map((label) => {
                    const [hh, mm] = label.split(":").map(Number);
                    const offset =
                      ((hh ?? START_HOUR) - START_HOUR) * HOUR_PX + (mm ?? 0) * PX_PER_MIN;
                    const isHour = (mm ?? 0) === 0;
                    return (
                      <div
                        key={label}
                        className={`absolute left-0 right-0 ${
                          isHour
                            ? "border-t border-border"
                            : "border-t border-border-light/50 border-dashed"
                        }`}
                        style={{ top: `${offset}px` }}
                      />
                    );
                  })}

                  {/* Current time indicator */}
                  {isToday && nowMin >= START_MIN && nowMin <= END_HOUR * 60 && (
                    <div
                      className="absolute left-0 right-0 z-20 pointer-events-none"
                      style={{ top: `${(nowMin - START_MIN) * PX_PER_MIN}px` }}
                    >
                      <div className="flex items-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500 -ml-1.5 shadow-sm" />
                        <div className="flex-1 border-t-2 border-red-500" />
                      </div>
                    </div>
                  )}

                  {/* ── Schedule blocks ── */}
                  {dayBlocks.map((block, bi) => {
                    const prof = profesionales.find((p) => p.id === block.profId);
                    if (!prof) return null;

                    const colorIdx = profColorMap[block.profId] ?? 0;
                    const colors = blockPalette[colorIdx]!;
                    const topPx = (block.startMin - START_MIN) * PX_PER_MIN;
                    const heightPx = (block.endMin - block.startMin) * PX_PER_MIN;
                    const leftPct = (block.lane / block.totalLanes) * 100;
                    const widthPct = (1 / block.totalLanes) * 100;

                    const isHighlighted = !hoveredProf || hoveredProf === block.profId;

                    return (
                      <div
                        key={`${block.profId}-${bi}`}
                        className={`absolute rounded-r-md border-l-[3px] ${colors.border} ${colors.bg} ${colors.text} overflow-hidden cursor-pointer transition-all hover:shadow-md hover:z-10 ${
                          isHighlighted ? "opacity-100" : "opacity-40"
                        }`}
                        style={{
                          top: `${topPx + 1}px`,
                          height: `${heightPx - 2}px`,
                          left: `${leftPct}%`,
                          width: `calc(${widthPct}% - 2px)`,
                          marginLeft: "1px",
                        }}
                        onMouseEnter={() => setHoveredProf(block.profId)}
                        onMouseLeave={() => setHoveredProf("")}
                        onClick={() =>
                          setProfFilter(profFilter === block.profId ? "" : block.profId)
                        }
                        title={`${prof.nombre}\n${prof.especialidad}\n${minToTime(block.startMin)}–${minToTime(block.endMin)}${block.note ? `\n${block.note}` : ""}`}
                      >
                        <div className="p-1 h-full flex flex-col">
                          <span className="text-[9px] font-bold leading-tight truncate">
                            {prof.nombre
                              .replace(/^(Dr\.|Dra\.|Lic\.|Téc\.)\s*/, "")
                              .split(" ")
                              .slice(0, 2)
                              .join(" ")}
                          </span>
                          {heightPx >= 50 && (
                            <span className="text-[8px] opacity-70 truncate leading-tight">
                              {prof.especialidad}
                            </span>
                          )}
                          {heightPx >= 64 && (
                            <span className="text-[8px] opacity-60 mt-auto">
                              {minToTime(block.startMin)}–{minToTime(block.endMin)}
                            </span>
                          )}
                          {block.note && heightPx >= 80 && (
                            <span className="text-[7px] italic opacity-50 truncate">
                              {block.note}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── Professionals without defined schedule ───────── */}
      {noScheduleProfs.length > 0 && (
        <div className="bg-amber-50/50 border border-amber-200 rounded-lg p-4">
          <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">
            {locale === "en" ? "Schedule to be confirmed" : "Horario por confirmar"}
          </p>
          <div className="flex flex-wrap gap-2">
            {noScheduleProfs.map((p) => (
              <span
                key={p.id}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-amber-200 rounded-[4px] text-xs text-amber-800"
              >
                <span className="font-medium">{p.nombre}</span>
                <span className="text-amber-600">— {p.especialidad}</span>
                {p.horario && p.horario !== "Confirmar horario" && (
                  <span className="italic text-amber-500 text-[10px]">({p.horario})</span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ─── Legend ────────────────────────────────────────── */}
      <div className="bg-white border border-border rounded-lg p-4">
        <p className="text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-3">
          {locale === "en" ? "Legend — Click to filter" : "Leyenda — Click para filtrar"}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-2">
          {scheduledProfs
            .filter((p) => !profFilter || p.id === profFilter)
            .map((p) => {
              const colorIdx = profColorMap[p.id] ?? 0;
              const colors = blockPalette[colorIdx]!;
              return (
                <div
                  key={p.id}
                  className="flex items-center gap-1.5 text-xs cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setProfFilter(profFilter === p.id ? "" : p.id)}
                >
                  <span
                    className={`inline-block w-3 h-3 rounded-sm border-l-[3px] ${colors.border} ${colors.bg} flex-shrink-0`}
                  />
                  <span className="font-medium text-ink truncate">
                    {p.nombre.split(" ").slice(0, 2).join(" ")}
                  </span>
                  <span className="text-ink-muted truncate hidden sm:inline">
                    ({p.especialidad})
                  </span>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

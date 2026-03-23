"use client";

import { useState, useCallback, useEffect } from "react";
import { useLocale } from "@/lib/i18n/context";
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  Save,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────
interface AvailabilitySlot {
  id: string;
  doctor_id: string;
  date: string;
  time_slot: string;
  booked: boolean;
  patient_id: string | null;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
}

// ── Time slot options ────────────────────────────────────────
const ALL_TIME_SLOTS = [
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
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
];

const DAYS_OF_WEEK_ES = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const DAYS_OF_WEEK_EN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// ── Helpers ──────────────────────────────────────────────────
function getWeekDates(
  offset: number,
  locale?: string,
): { label: string; date: string; dayName: string }[] {
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - today.getDay() + 1 + offset * 7);
  const days = locale === "en" ? DAYS_OF_WEEK_EN : DAYS_OF_WEEK_ES;

  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return {
      label: `${d.getDate()}/${d.getMonth() + 1}`,
      date: d.toISOString().split("T")[0] ?? "",
      dayName: days[i] ?? days[0] ?? "",
    };
  });
}

function formatWeekRange(dates: { date: string }[]): string {
  if (dates.length === 0) return "";
  const start = dates[0]?.date ?? "";
  const end = dates[dates.length - 1]?.date ?? "";
  return `${start} — ${end}`;
}

// NOTE: No hardcoded doctors. Real data comes from /api/doctors.
// New clinics start with an empty list until team members are added.

export default function DisponibilidadPage() {
  const { t, locale } = useLocale();
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Pending changes: date → Set<time_slot> to add
  const [pendingAdds, setPendingAdds] = useState<Map<string, Set<string>>>(new Map());
  const [pendingDeletes, setPendingDeletes] = useState<Set<string>>(new Set());

  const weekDates = getWeekDates(weekOffset, locale);
  const weekStart = weekDates[0]?.date ?? "";

  // ── Fetch doctors ──────────────────────────────────────────
  useEffect(() => {
    async function loadDoctors() {
      try {
        const res = await fetch("/api/doctors?active=true");
        if (res.ok) {
          const data = await res.json();
          if (data.doctors?.length) setDoctors(data.doctors);
        }
      } catch {
        // Keep demo doctors
      }
    }
    loadDoctors();
  }, []);

  // ── Fetch availability ─────────────────────────────────────
  const fetchSlots = useCallback(async () => {
    if (!selectedDoctor) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ doctorId: selectedDoctor, weekStart });
      const res = await fetch(`/api/availability?${params}`);
      if (res.ok) {
        const data = await res.json();
        setSlots(data.slots || []);
      }
    } catch {
      setSlots([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDoctor, weekStart]);

  useEffect(() => {
    fetchSlots();
    setPendingAdds(new Map());
    setPendingDeletes(new Set());
  }, [fetchSlots]);

  // ── Toggle a slot ──────────────────────────────────────────
  const toggleSlot = (date: string, time: string) => {
    const existing = slots.find((s) => s.date === date && s.time_slot === time);

    if (existing) {
      // If booked, can't remove
      if (existing.booked) return;
      // Toggle delete
      setPendingDeletes((prev) => {
        const next = new Set(prev);
        if (next.has(existing.id)) next.delete(existing.id);
        else next.add(existing.id);
        return next;
      });
    } else {
      // Toggle add
      setPendingAdds((prev) => {
        const next = new Map(prev);
        const set = new Set(next.get(date) || []);
        if (set.has(time)) set.delete(time);
        else set.add(time);
        if (set.size === 0) next.delete(date);
        else next.set(date, set);
        return next;
      });
    }
  };

  // ── Get slot state ─────────────────────────────────────────
  const getSlotState = (date: string, time: string) => {
    const existing = slots.find((s) => s.date === date && s.time_slot === time);
    if (existing) {
      if (existing.booked) return "booked";
      if (pendingDeletes.has(existing.id)) return "pending-delete";
      return "available";
    }
    const adds = pendingAdds.get(date);
    if (adds?.has(time)) return "pending-add";
    return "empty";
  };

  // ── Save changes ───────────────────────────────────────────
  const saveChanges = async () => {
    setSaving(true);
    try {
      // Process adds
      const addEntries = Array.from(pendingAdds.entries());
      for (let i = 0; i < addEntries.length; i++) {
        const [date, times] = addEntries[i]!;
        await fetch("/api/availability", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            doctorId: selectedDoctor,
            date,
            timeSlots: Array.from(times),
          }),
        });
      }

      // Process deletes
      const deleteIds = Array.from(pendingDeletes);
      for (let i = 0; i < deleteIds.length; i++) {
        await fetch("/api/availability", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slotId: deleteIds[i] }),
        });
      }

      setPendingAdds(new Map());
      setPendingDeletes(new Set());
      await fetchSlots();
      setToast({ message: t("availability.saved"), type: "success" });
    } catch {
      setToast({ message: t("availability.errorSaving"), type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = pendingAdds.size > 0 || pendingDeletes.size > 0;

  // ── Auto-dismiss toast ─────────────────────────────────────
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink flex items-center gap-2">
            <Calendar className="h-6 w-6 text-celeste-dark" />
            {t("availability.title")}
          </h1>
          <p className="text-sm text-ink/60 mt-1">{t("availability.subtitleManage")}</p>
        </div>

        {hasChanges && (
          <button
            onClick={saveChanges}
            disabled={saving}
            className="flex items-center gap-2 rounded-[4px] bg-celeste-dark px-4 py-2 text-sm font-medium text-white hover:bg-celeste-dark/90 disabled:opacity-50 transition-colors"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {t("availability.saveChanges")}
          </button>
        )}
      </div>

      {/* Doctor selector + week nav */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white rounded-[4px] border border-ink/10 p-4">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-ink/70">
            {t("availability.professional")}
          </label>
          <select
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
            className="rounded-[4px] border border-ink/20 bg-white px-3 py-2 text-sm text-ink focus:border-celeste-dark focus:ring-1 focus:ring-celeste-dark"
          >
            <option value="">{t("availability.select")}</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} — {d.specialty}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekOffset((p) => p - 1)}
            className="rounded-[4px] border border-ink/20 p-2 hover:bg-ink/5 transition-colors"
            aria-label={t("availability.previousWeek")}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-medium text-ink min-w-[180px] text-center">
            {formatWeekRange(weekDates)}
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
              className="ml-2 text-xs text-celeste-dark hover:underline"
            >
              {t("availability.today")}
            </button>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-4 right-4 z-50 rounded-[4px] px-4 py-3 text-sm font-medium text-white shadow-lg transition-all ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Grid */}
      {!selectedDoctor ? (
        <div className="flex items-center justify-center rounded-[4px] border border-dashed border-ink/20 bg-white p-12">
          <p className="text-ink/50 text-sm">{t("availability.selectPrompt")}</p>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center rounded-[4px] border border-ink/10 bg-white p-12">
          <Loader2 className="h-6 w-6 animate-spin text-celeste-dark" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[4px] border border-ink/10 bg-white">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-ink/5">
                <th className="border-b border-ink/10 p-2 text-left font-medium text-ink/60 w-20">
                  <Clock className="h-4 w-4 inline mr-1" />
                  {t("availability.hour")}
                </th>
                {weekDates.map((d) => (
                  <th
                    key={d.date}
                    className="border-b border-ink/10 p-2 text-center font-medium text-ink/80 min-w-[100px]"
                  >
                    <div>{d.dayName}</div>
                    <div className="text-xs text-ink/50">{d.label}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ALL_TIME_SLOTS.map((time) => (
                <tr key={time} className="hover:bg-ink/[0.02]">
                  <td className="border-b border-ink/5 p-2 text-ink/60 font-mono text-xs">
                    {time}
                  </td>
                  {weekDates.map((d) => {
                    const state = getSlotState(d.date, time);
                    return (
                      <td
                        key={`${d.date}-${time}`}
                        className="border-b border-ink/5 p-1 text-center"
                      >
                        <button
                          onClick={() => toggleSlot(d.date, time)}
                          disabled={state === "booked"}
                          className={`w-full rounded-[4px] px-2 py-1.5 text-xs font-medium transition-all ${
                            state === "booked"
                              ? "bg-red-100 text-red-700 cursor-not-allowed"
                              : state === "available"
                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                : state === "pending-add"
                                  ? "bg-celeste-dark/20 text-celeste-dark border-2 border-dashed border-celeste-dark"
                                  : state === "pending-delete"
                                    ? "bg-red-50 text-red-500 line-through border-2 border-dashed border-red-400"
                                    : "bg-ink/5 text-ink/30 hover:bg-celeste-dark/10 hover:text-celeste-dark"
                          }`}
                          title={
                            state === "booked"
                              ? t("availability.bookedTooltip")
                              : state === "available"
                                ? t("availability.availableTooltip")
                                : state === "pending-add"
                                  ? t("availability.pendingAddTooltip")
                                  : state === "pending-delete"
                                    ? t("availability.pendingDeleteTooltip")
                                    : t("availability.emptyTooltip")
                          }
                        >
                          {state === "booked" ? (
                            t("availability.booked")
                          ) : state === "available" ? (
                            t("availability.available")
                          ) : state === "pending-add" ? (
                            <span className="flex items-center justify-center gap-1">
                              <Plus className="h-3 w-3" /> {t("availability.add")}
                            </span>
                          ) : state === "pending-delete" ? (
                            <span className="flex items-center justify-center gap-1">
                              <Trash2 className="h-3 w-3" /> {t("availability.remove")}
                            </span>
                          ) : (
                            "—"
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-ink/60">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded bg-green-100 border border-green-300" />
          {t("availability.legendAvailable")}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded bg-red-100 border border-red-300" />
          {t("availability.legendBooked")}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded bg-celeste-dark/20 border border-celeste-dark border-dashed" />
          {t("availability.legendPendingAdd")}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded bg-red-50 border border-red-400 border-dashed" />
          {t("availability.legendPendingDelete")}
        </span>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  Star,
  Stethoscope,
  Globe2,
  Video,
  Check,
  ArrowLeft,
  ArrowRight,
  User,
  Mail,
  Shield,
  Loader2,
  Search,
  Filter,
} from "lucide-react";
import { analytics } from "@/lib/analytics";

// ─── Types ───────────────────────────────────────────────────

interface ClinicPublic {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  logoUrl: string | null;
  specialties: string | null;
  specialtyList: string[];
  description: string | null;
  languages: string[] | null;
  operatingHours: Record<string, { open: string; close: string }> | null;
  lat: number | null;
  lng: number | null;
  acceptsInsurance: string[] | null;
  bookingEnabled: boolean;
}

interface DoctorScheduleBlock {
  day: number; // 0=Sun .. 6=Sat
  start: string;
  end: string;
}

interface DoctorPublic {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  available: boolean;
  teleconsulta: boolean;
  experience: string | null;
  languages: unknown;
  bio: string | null;
  photoUrl: string | null;
  matricula: string | null;
  schedule: DoctorScheduleBlock[];
}

interface BookingSettings {
  slotDuration: number;
  maxAdvanceDays: number;
  minAdvanceHours: number;
  autoConfirm: boolean;
  workingDays: number[];
  breakStart: string;
  breakEnd: string;
}

type Step = "doctor" | "datetime" | "info" | "confirm" | "success";

// ─── Helpers ─────────────────────────────────────────────────

const DAY_NAMES_ES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const DAY_NAMES_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatScheduleBadges(schedule: DoctorScheduleBlock[], lang: "es" | "en") {
  const names = lang === "en" ? DAY_NAMES_EN : DAY_NAMES_ES;
  const sorted = [...schedule].sort((a, b) => a.day - b.day);
  return sorted.map((s) => ({
    label: names[s.day] ?? "",
    time: `${s.start}–${s.end}`,
    day: s.day,
  }));
}

// ─── Component ───────────────────────────────────────────────

export default function PublicBookingPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [clinic, setClinic] = useState<ClinicPublic | null>(null);
  const [doctors, setDoctors] = useState<DoctorPublic[]>([]);
  const [settings, setSettings] = useState<BookingSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQ, setSearchQ] = useState("");
  const [filterSpec, setFilterSpec] = useState<string>("all");

  // Booking state
  const [step, setStep] = useState<Step>("doctor");
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorPublic | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [tipo, setTipo] = useState<"presencial" | "teleconsulta">("presencial");
  const [lang, setLang] = useState<"es" | "en">("es");
  const [form, setForm] = useState({ name: "", email: "", phone: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState<{ id: string; status: string } | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [doctorSlots, setDoctorSlots] = useState<string[]>([]);

  const t = useCallback((es: string, en: string) => (lang === "en" ? en : es), [lang]);

  // Fetch clinic data
  useEffect(() => {
    fetch(`/api/clinics/${slug}/public`)
      .then((r) => {
        if (!r.ok) throw new Error("Clinic not found");
        return r.json();
      })
      .then((data) => {
        setClinic(data.clinic);
        setDoctors(data.doctors);
        setSettings(data.settings);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug]);

  // Filtered & searched doctors
  const filteredDoctors = useMemo(() => {
    let list = doctors.filter((d) => d.available);
    if (filterSpec !== "all") {
      list = list.filter((d) => d.specialty === filterSpec);
    }
    if (searchQ.trim()) {
      const q = searchQ.toLowerCase();
      list = list.filter(
        (d) => d.name.toLowerCase().includes(q) || d.specialty.toLowerCase().includes(q),
      );
    }
    return list;
  }, [doctors, filterSpec, searchQ]);

  // Generate available dates for selected doctor (based on their schedule days)
  const availableDates = useMemo(() => {
    const days: string[] = [];
    const maxDays = settings?.maxAdvanceDays ?? 60;
    const now = new Date();

    if (!selectedDoctor) return days;

    // Use doctor's schedule days if available, otherwise fall back to working days
    const doctorDays =
      selectedDoctor.schedule.length > 0
        ? new Set(selectedDoctor.schedule.map((s) => s.day))
        : new Set(settings?.workingDays ?? [1, 2, 3, 4, 5]);

    for (let i = 1; i <= maxDays && days.length < 28; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() + i);
      if (doctorDays.has(d.getDay())) {
        days.push(d.toISOString().slice(0, 10));
      }
    }
    return days;
  }, [selectedDoctor, settings]);

  // Fetch time slots for selected doctor + date
  useEffect(() => {
    if (!selectedDoctor || !selectedDate) {
      setDoctorSlots([]);
      return;
    }
    setSlotsLoading(true);
    fetch(`/api/clinics/${slug}/slots?doctorId=${selectedDoctor.id}&date=${selectedDate}`)
      .then((r) => r.json())
      .then((data) => setDoctorSlots(data.slots ?? []))
      .catch(() => setDoctorSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [slug, selectedDoctor, selectedDate]);

  // Submit booking
  async function handleSubmit() {
    if (!selectedDoctor || !selectedDate || !selectedTime || !form.name) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/clinics/${slug}/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: selectedDoctor.id,
          patientName: form.name,
          patientEmail: form.email || undefined,
          patientPhone: form.phone || undefined,
          patientLanguage: lang,
          fecha: selectedDate,
          hora: selectedTime,
          specialty: selectedDoctor.specialty,
          tipo,
          notas: form.notes || undefined,
          bookedVia: "web",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Booking failed");
      setBookingResult(data);
      analytics.track("turno_created", { via: "public", tipo });
      setStep("success");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Booking failed");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Loading / Error states ────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-celeste-pale/30 to-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-celeste animate-spin" />
      </div>
    );
  }

  if (error && !clinic) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-celeste-pale/30 to-white flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-border p-10 text-center max-w-md">
          <h1 className="text-xl font-bold text-ink mb-2">
            {t("Clínica no encontrada", "Clinic not found")}
          </h1>
          <p className="text-sm text-ink-muted">{error}</p>
        </div>
      </div>
    );
  }

  if (!clinic) return null;

  // ── Render ─────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-b from-celeste-pale/30 to-white">
      {/* Header */}
      <header className="border-b border-border bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {clinic.logoUrl ? (
              <Image
                src={clinic.logoUrl}
                alt=""
                width={40}
                height={40}
                className="w-10 h-10 rounded-lg object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-celeste-pale flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-celeste-dark" />
              </div>
            )}
            <div>
              <h1 className="font-bold text-ink text-lg leading-tight">{clinic.name}</h1>
              {clinic.address && (
                <p className="text-[11px] text-ink-muted flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {clinic.address}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => setLang(lang === "es" ? "en" : "es")}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-ink-light bg-surface hover:bg-celeste-pale/40 rounded-lg transition"
          >
            <Globe2 className="w-3.5 h-3.5" />
            {lang === "es" ? "EN" : "ES"}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {(["doctor", "datetime", "info", "confirm"] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition
                  ${step === s ? "bg-celeste-dark text-white" : step === "success" || ["doctor", "datetime", "info", "confirm"].indexOf(step) > i ? "bg-green-100 text-green-700" : "bg-surface text-ink-muted"}`}
              >
                {step === "success" ||
                ["doctor", "datetime", "info", "confirm"].indexOf(step) > i ? (
                  <Check className="w-4 h-4" />
                ) : (
                  i + 1
                )}
              </div>
              {i < 3 && <div className="flex-1 h-0.5 bg-border rounded" />}
            </div>
          ))}
        </div>

        {/* ── Step 1: Select Doctor ──────────────── */}
        {step === "doctor" && (
          <div>
            <h2 className="text-xl font-bold text-ink mb-1">
              {t("Elegí tu profesional", "Choose your doctor")}
            </h2>
            <p className="text-sm text-ink-muted mb-4">
              {t(
                `${doctors.filter((d) => d.available).length} profesionales disponibles`,
                `${doctors.filter((d) => d.available).length} doctors available`,
              )}
            </p>

            {/* Search + Filter */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
                <input
                  type="text"
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  placeholder={t("Buscar profesional...", "Search doctor...")}
                  className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-celeste-pale focus:border-celeste bg-white"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
                <select
                  value={filterSpec}
                  onChange={(e) => setFilterSpec(e.target.value)}
                  className="pl-10 pr-8 py-2.5 border border-border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-celeste-pale focus:border-celeste appearance-none cursor-pointer"
                >
                  <option value="all">{t("Todas las especialidades", "All specialties")}</option>
                  {(clinic.specialtyList ?? []).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Doctor list */}
            <div className="grid gap-3">
              {filteredDoctors.length === 0 && (
                <div className="text-center py-10 text-ink-muted text-sm">
                  {t(
                    "No se encontraron profesionales con ese criterio.",
                    "No doctors found matching that criteria.",
                  )}
                </div>
              )}
              {filteredDoctors.map((doc) => {
                const badges = formatScheduleBadges(doc.schedule, lang);
                return (
                  <button
                    key={doc.id}
                    onClick={() => {
                      setSelectedDoctor(doc);
                      setSelectedDate("");
                      setSelectedTime("");
                      setStep("datetime");
                    }}
                    className={`text-left bg-white border rounded-xl p-5 hover:shadow-sm transition
                    ${selectedDoctor?.id === doc.id ? "border-celeste-dark ring-2 ring-celeste-pale" : "border-border"}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-celeste-pale flex items-center justify-center shrink-0">
                        {doc.photoUrl ? (
                          <Image
                            src={doc.photoUrl}
                            alt=""
                            width={48}
                            height={48}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <Stethoscope className="w-6 h-6 text-celeste-dark" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-ink">{doc.name}</p>
                        <p className="text-sm text-celeste-dark font-medium">{doc.specialty}</p>
                        {doc.matricula && (
                          <p className="text-[11px] text-ink-muted">{doc.matricula}</p>
                        )}

                        {/* Schedule badges */}
                        {badges.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {badges.map((b) => (
                              <span
                                key={b.day}
                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-celeste-pale/50 text-celeste-dark text-[11px] font-semibold rounded-md"
                              >
                                <Calendar className="w-3 h-3" />
                                {b.label} {b.time}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-3 mt-2 text-xs text-ink-muted">
                          {doc.rating > 0 && (
                            <span className="flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 text-gold fill-gold" />
                              {doc.rating} ({doc.reviewCount})
                            </span>
                          )}
                          {doc.experience && <span>{doc.experience}</span>}
                          {doc.teleconsulta && (
                            <span className="flex items-center gap-1 text-celeste-dark">
                              <Video className="w-3.5 h-3.5" /> Teleconsulta
                            </span>
                          )}
                        </div>
                        {doc.bio && (
                          <p className="text-xs text-ink-muted mt-2 line-clamp-2">{doc.bio}</p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Clinic info footer */}
            <div className="mt-8 bg-white border border-border rounded-xl p-5">
              <h3 className="font-bold text-ink text-sm mb-3">
                {t("Información de la clínica", "Clinic information")}
              </h3>
              <div className="grid sm:grid-cols-2 gap-3 text-sm text-ink-light">
                {clinic.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-ink-muted" /> {clinic.phone}
                  </div>
                )}
                {clinic.acceptsInsurance && clinic.acceptsInsurance.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-ink-muted" />
                    {clinic.acceptsInsurance.join(", ")}
                  </div>
                )}
                {clinic.languages && clinic.languages.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Globe2 className="w-4 h-4 text-ink-muted" />
                    {clinic.languages
                      .map((l) => (l === "es" ? "Español" : l === "en" ? "English" : l))
                      .join(", ")}
                  </div>
                )}
              </div>
              {clinic.description && (
                <p className="text-xs text-ink-muted mt-3">{clinic.description}</p>
              )}
            </div>
          </div>
        )}

        {/* ── Step 2: Date & Time ────────────────── */}
        {step === "datetime" && selectedDoctor && (
          <div>
            <h2 className="text-xl font-bold text-ink mb-1">
              {t("Elegí fecha y hora", "Choose date & time")}
            </h2>
            <div className="flex items-center gap-3 mb-6 bg-white border border-border rounded-xl p-4">
              <div className="w-10 h-10 rounded-full bg-celeste-pale flex items-center justify-center shrink-0">
                <Stethoscope className="w-5 h-5 text-celeste-dark" />
              </div>
              <div>
                <p className="font-bold text-ink text-sm">{selectedDoctor.name}</p>
                <p className="text-xs text-celeste-dark">{selectedDoctor.specialty}</p>
              </div>
            </div>

            {/* Type selector */}
            {selectedDoctor.teleconsulta && (
              <div className="flex gap-2 mb-6">
                {(["presencial", "teleconsulta"] as const).map((t2) => (
                  <button
                    key={t2}
                    onClick={() => setTipo(t2)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition
                      ${tipo === t2 ? "bg-celeste-dark text-white" : "bg-surface text-ink-muted hover:text-ink"}`}
                  >
                    {t2 === "teleconsulta" ? (
                      <Video className="w-4 h-4" />
                    ) : (
                      <MapPin className="w-4 h-4" />
                    )}
                    {t2 === "teleconsulta" ? "Teleconsulta" : t("Presencial", "In-person")}
                  </button>
                ))}
              </div>
            )}

            {/* Schedule hint */}
            {selectedDoctor.schedule.length > 0 && (
              <div className="bg-celeste-pale/30 border border-celeste-pale rounded-xl px-4 py-3 mb-4 text-xs text-celeste-dark">
                <p className="font-semibold mb-1">{t("Días de atención", "Available days")}:</p>
                <div className="flex flex-wrap gap-2">
                  {formatScheduleBadges(selectedDoctor.schedule, lang).map((b) => (
                    <span key={b.day} className="font-bold">
                      {b.label} {b.time}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Date picker */}
            <p className="text-sm font-semibold text-ink mb-2">{t("Fecha", "Date")}</p>
            {availableDates.length === 0 ? (
              <p className="text-sm text-ink-muted bg-surface rounded-xl p-4 text-center mb-4">
                {t(
                  "No hay fechas disponibles para este profesional",
                  "No available dates for this doctor",
                )}
              </p>
            ) : (
              <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
                {availableDates.map((date) => {
                  const d = new Date(date + "T12:00:00");
                  const isSelected = selectedDate === date;
                  return (
                    <button
                      key={date}
                      onClick={() => {
                        setSelectedDate(date);
                        setSelectedTime("");
                      }}
                      className={`shrink-0 w-16 py-3 rounded-xl text-center transition border
                        ${isSelected ? "bg-celeste-dark text-white border-celeste-dark" : "bg-white border-border hover:border-celeste"}`}
                    >
                      <p className="text-[10px] uppercase font-semibold">
                        {d.toLocaleDateString(lang === "en" ? "en-US" : "es-AR", {
                          weekday: "short",
                        })}
                      </p>
                      <p className="text-lg font-bold">{d.getDate()}</p>
                      <p className="text-[10px]">
                        {d.toLocaleDateString(lang === "en" ? "en-US" : "es-AR", {
                          month: "short",
                        })}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Time slots — fetched per doctor */}
            {selectedDate && (
              <>
                <p className="text-sm font-semibold text-ink mb-2">{t("Hora", "Time")}</p>
                {slotsLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="w-5 h-5 text-celeste animate-spin" />
                    <span className="ml-2 text-sm text-ink-muted">
                      {t("Cargando horarios...", "Loading slots...")}
                    </span>
                  </div>
                ) : doctorSlots.length === 0 ? (
                  <p className="text-sm text-ink-muted bg-surface rounded-xl p-4 text-center">
                    {t(
                      "No hay horarios disponibles para esta fecha",
                      "No time slots available for this date",
                    )}
                  </p>
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-6">
                    {doctorSlots.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`py-2.5 rounded-lg text-sm font-semibold transition border
                          ${selectedTime === time ? "bg-celeste-dark text-white border-celeste-dark" : "bg-white border-border hover:border-celeste text-ink"}`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Navigation */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep("doctor")}
                className="flex items-center gap-1 px-4 py-2.5 text-sm text-ink-muted hover:text-ink transition"
              >
                <ArrowLeft className="w-4 h-4" /> {t("Volver", "Back")}
              </button>
              <button
                onClick={() => setStep("info")}
                disabled={!selectedDate || !selectedTime}
                className="flex items-center gap-1 px-6 py-2.5 text-sm font-bold bg-celeste-dark text-white rounded-lg hover:bg-celeste-dark/90 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {t("Siguiente", "Next")} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Patient Info ────────────────── */}
        {step === "info" && (
          <div>
            <h2 className="text-xl font-bold text-ink mb-1">
              {t("Tus datos", "Your information")}
            </h2>
            <p className="text-sm text-ink-muted mb-6">
              {t(
                "Para confirmar tu turno necesitamos tus datos de contacto",
                "We need your contact info to confirm the appointment",
              )}
            </p>

            <div className="space-y-4 max-w-md">
              <div>
                <label className="text-xs font-semibold text-ink-muted mb-1 block">
                  {t("Nombre completo *", "Full name *")}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder={t("María García", "Jane Smith")}
                    className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-celeste-pale focus:border-celeste"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-ink-muted mb-1 block">
                  {t("Email", "Email")}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="email@ejemplo.com"
                    className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-celeste-pale focus:border-celeste"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-ink-muted mb-1 block">
                  {t("Teléfono / WhatsApp", "Phone / WhatsApp")}
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+54 11 5555-1234"
                    className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-celeste-pale focus:border-celeste"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-ink-muted mb-1 block">
                  {t("Notas (opcional)", "Notes (optional)")}
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                  placeholder={t(
                    "Motivo de consulta, síntomas, etc.",
                    "Reason for visit, symptoms, etc.",
                  )}
                  className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-celeste-pale focus:border-celeste resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep("datetime")}
                className="flex items-center gap-1 px-4 py-2.5 text-sm text-ink-muted hover:text-ink transition"
              >
                <ArrowLeft className="w-4 h-4" /> {t("Volver", "Back")}
              </button>
              <button
                onClick={() => setStep("confirm")}
                disabled={!form.name || (!form.email && !form.phone)}
                className="flex items-center gap-1 px-6 py-2.5 text-sm font-bold bg-celeste-dark text-white rounded-lg hover:bg-celeste-dark/90 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {t("Revisar", "Review")} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 4: Confirmation ────────────────── */}
        {step === "confirm" && selectedDoctor && (
          <div>
            <h2 className="text-xl font-bold text-ink mb-1">
              {t("Confirmar turno", "Confirm appointment")}
            </h2>
            <p className="text-sm text-ink-muted mb-6">
              {t("Revisá los datos antes de confirmar", "Review the details before confirming")}
            </p>

            <div className="bg-white border border-border rounded-xl p-6 space-y-4 max-w-md">
              <div className="flex items-center gap-3 pb-4 border-b border-border">
                <div className="w-10 h-10 rounded-full bg-celeste-pale flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-celeste-dark" />
                </div>
                <div>
                  <p className="font-bold text-ink">{selectedDoctor.name}</p>
                  <p className="text-xs text-ink-muted">{selectedDoctor.specialty}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-ink-muted font-semibold">{t("Fecha", "Date")}</p>
                  <p className="text-ink font-bold flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-celeste" />
                    {new Date(selectedDate + "T12:00:00").toLocaleDateString(
                      lang === "en" ? "en-US" : "es-AR",
                      { weekday: "short", day: "numeric", month: "short" },
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-ink-muted font-semibold">{t("Hora", "Time")}</p>
                  <p className="text-ink font-bold flex items-center gap-1">
                    <Clock className="w-4 h-4 text-celeste" /> {selectedTime}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-ink-muted font-semibold">{t("Tipo", "Type")}</p>
                  <p className="text-ink">
                    {tipo === "teleconsulta" ? "Teleconsulta" : t("Presencial", "In-person")}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-ink-muted font-semibold">{t("Clínica", "Clinic")}</p>
                  <p className="text-ink">{clinic.name}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-border text-sm">
                <p className="text-ink font-semibold">{form.name}</p>
                {form.email && <p className="text-ink-muted text-xs">{form.email}</p>}
                {form.phone && <p className="text-ink-muted text-xs">{form.phone}</p>}
                {form.notes && <p className="text-ink-muted text-xs mt-1 italic">{form.notes}</p>}
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 mt-3 bg-red-50 rounded-lg px-4 py-2">{error}</p>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setStep("info");
                  setError(null);
                }}
                className="flex items-center gap-1 px-4 py-2.5 text-sm text-ink-muted hover:text-ink transition"
              >
                <ArrowLeft className="w-4 h-4" /> {t("Volver", "Back")}
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold bg-celeste-dark text-white rounded-lg hover:bg-celeste-dark/90 transition disabled:opacity-60"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                {submitting
                  ? t("Reservando...", "Booking...")
                  : t("Confirmar turno", "Confirm appointment")}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 5: Success ─────────────────────── */}
        {step === "success" && bookingResult && (
          <div className="text-center py-10">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-ink mb-2">
              {bookingResult.status === "confirmed"
                ? t("¡Turno confirmado!", "Appointment confirmed!")
                : t("¡Turno reservado!", "Appointment booked!")}
            </h2>
            <p className="text-sm text-ink-muted max-w-sm mx-auto mb-6">
              {bookingResult.status === "confirmed"
                ? t(
                    "Tu turno está confirmado. Te enviamos los detalles por email y/o WhatsApp.",
                    "Your appointment is confirmed. We sent you the details via email and/or WhatsApp.",
                  )
                : t(
                    "Tu turno fue recibido. La clínica lo va a confirmar pronto y te avisamos.",
                    "Your booking was received. The clinic will confirm it shortly and we'll notify you.",
                  )}
            </p>

            <div className="bg-white border border-border rounded-xl p-5 inline-block text-left text-sm">
              <p className="text-ink font-bold">{selectedDoctor?.name}</p>
              <p className="text-ink-muted">
                {new Date(selectedDate + "T12:00:00").toLocaleDateString(
                  lang === "en" ? "en-US" : "es-AR",
                  { weekday: "long", day: "numeric", month: "long" },
                )}{" "}
                · {selectedTime}
              </p>
              <p className="text-ink-muted">{clinic.name}</p>
              <p className="text-[11px] text-ink-muted mt-2">ID: {bookingResult.id}</p>
            </div>

            <div className="mt-6 flex flex-col items-center gap-3">
              <a
                href={`/reservar/${slug}/turno/${bookingResult.id}${form.email ? `?email=${encodeURIComponent(form.email)}` : ""}`}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-celeste-dark hover:bg-celeste rounded-lg transition"
              >
                {t("Gestionar mi turno", "Manage my appointment")}
              </a>
              <button
                onClick={() => {
                  setStep("doctor");
                  setSelectedDoctor(null);
                  setSelectedDate("");
                  setSelectedTime("");
                  setForm({ name: "", email: "", phone: "", notes: "" });
                  setBookingResult(null);
                  setError(null);
                }}
                className="px-6 py-2.5 text-sm font-semibold text-celeste-dark bg-celeste-pale/40 hover:bg-celeste-pale rounded-lg transition"
              >
                {t("Reservar otro turno", "Book another appointment")}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-white mt-12">
        <div className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
          <p className="text-[11px] text-ink-muted">
            Powered by <span className="font-semibold text-celeste-dark">Cóndor Salud</span>
          </p>
          <div className="flex items-center gap-1 text-[11px] text-ink-muted">
            <Shield className="w-3 h-3" />
            {t("Datos protegidos", "Data protected")}
          </div>
        </div>
      </footer>
    </div>
  );
}

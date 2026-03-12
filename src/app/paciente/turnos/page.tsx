"use client";

import { useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Search,
  Filter,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  User,
} from "lucide-react";
import { useToast } from "@/components/Toast";

/* ── types ────────────────────────────────────────────── */
type Tab = "proximos" | "historial";
type AppointmentStatus = "confirmado" | "pendiente" | "cancelado" | "completado";

interface Appointment {
  id: number;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  type: "presencial" | "teleconsulta";
  location: string;
  status: AppointmentStatus;
}

/* ── demo data ────────────────────────────────────────── */
const appointments: Appointment[] = [
  {
    id: 1,
    doctor: "Dra. Laura Méndez",
    specialty: "Clínica Médica",
    date: "2025-03-17",
    time: "10:30",
    type: "presencial",
    location: "Consultorio 3 - Sede Belgrano",
    status: "confirmado",
  },
  {
    id: 2,
    doctor: "Dr. Carlos Ruiz",
    specialty: "Cardiología",
    date: "2025-03-19",
    time: "15:00",
    type: "teleconsulta",
    location: "Videollamada",
    status: "pendiente",
  },
  {
    id: 3,
    doctor: "Dra. Sofía Peralta",
    specialty: "Dermatología",
    date: "2025-03-24",
    time: "09:15",
    type: "presencial",
    location: "Consultorio 7 - Sede Palermo",
    status: "confirmado",
  },
  {
    id: 4,
    doctor: "Dr. Martín Rodríguez",
    specialty: "Clínica Médica",
    date: "2025-02-10",
    time: "11:00",
    type: "presencial",
    location: "Consultorio 3 - Sede Belgrano",
    status: "completado",
  },
  {
    id: 5,
    doctor: "Dra. Ana Torres",
    specialty: "Ginecología",
    date: "2025-01-22",
    time: "14:30",
    type: "teleconsulta",
    location: "Videollamada",
    status: "completado",
  },
  {
    id: 6,
    doctor: "Dr. Luis Herrera",
    specialty: "Traumatología",
    date: "2025-01-08",
    time: "16:00",
    type: "presencial",
    location: "Consultorio 5 - Sede Belgrano",
    status: "cancelado",
  },
];

const specialties = [
  "Clínica Médica",
  "Cardiología",
  "Dermatología",
  "Ginecología",
  "Traumatología",
  "Pediatría",
  "Oftalmología",
  "Neurología",
  "Endocrinología",
  "Nutrición",
];

const timeSlots = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
];

/* ── status badge ─────────────────────────────────────── */
function StatusBadge({ status }: { status: AppointmentStatus }) {
  const map: Record<AppointmentStatus, { label: string; cls: string }> = {
    confirmado: { label: "Confirmado", cls: "bg-emerald-50 text-emerald-700" },
    pendiente: { label: "Pendiente", cls: "bg-amber-50 text-amber-700" },
    cancelado: { label: "Cancelado", cls: "bg-red-50 text-red-600" },
    completado: { label: "Completado", cls: "bg-ink-50 text-ink-400" },
  };
  const { label, cls } = map[status];
  return <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${cls}`}>{label}</span>;
}

/* ── component ────────────────────────────────────────── */
export default function TurnosPage() {
  const { showToast } = useToast();
  const [tab, setTab] = useState<Tab>("proximos");
  const [showBooking, setShowBooking] = useState(false);
  const [bookingStep, setBookingStep] = useState(1);
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const upcoming = appointments.filter(
    (a) => a.status === "confirmado" || a.status === "pendiente",
  );
  const history = appointments.filter((a) => a.status === "completado" || a.status === "cancelado");

  const resetBooking = () => {
    setShowBooking(false);
    setBookingStep(1);
    setSelectedSpecialty("");
    setSelectedDate("");
    setSelectedTime("");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">Mis Turnos</h1>
          <p className="text-sm text-ink-muted mt-0.5">Gestioná tus consultas médicas</p>
        </div>
        <button
          onClick={() => setShowBooking(true)}
          className="inline-flex items-center gap-2 bg-celeste-dark hover:bg-celeste-700 text-white text-sm font-semibold px-5 py-2.5 rounded-[4px] transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          Nuevo turno
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-ink-50 rounded-xl p-1 w-fit">
        {(
          [
            ["proximos", "Próximos"],
            ["historial", "Historial"],
          ] as [Tab, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              tab === key ? "bg-white text-ink shadow-sm" : "text-ink-muted hover:text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Appointment list */}
      <div className="bg-white rounded-2xl border border-border-light divide-y divide-border-light overflow-hidden">
        {(tab === "proximos" ? upcoming : history).map((apt) => (
          <div
            key={apt.id}
            className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4 hover:bg-surface/50 transition"
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                apt.type === "teleconsulta" ? "bg-emerald-50" : "bg-celeste-50"
              }`}
            >
              {apt.type === "teleconsulta" ? (
                <Video className="w-5 h-5 text-emerald-600" />
              ) : (
                <Calendar className="w-5 h-5 text-celeste-dark" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold text-ink">{apt.doctor}</p>
                <StatusBadge status={apt.status} />
              </div>
              <p className="text-xs text-ink-muted mt-0.5">{apt.specialty}</p>
              <div className="flex items-center gap-3 mt-1 text-xs text-ink-muted">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(apt.date).toLocaleDateString("es-AR", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {apt.time}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {apt.location}
                </span>
              </div>
            </div>
            {(apt.status === "confirmado" || apt.status === "pendiente") && (
              <div className="flex gap-2 shrink-0">
                {apt.type === "teleconsulta" && (
                  <button
                    onClick={() =>
                      showToast("La teleconsulta se habilitará minutos antes del turno")
                    }
                    className="text-xs font-medium bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-[4px] hover:bg-emerald-100 transition"
                  >
                    Unirse
                  </button>
                )}
                <button
                  onClick={() => showToast("Función de cancelación disponible próximamente")}
                  className="text-xs font-medium bg-red-50 text-red-600 px-3 py-1.5 rounded-[4px] hover:bg-red-100 transition"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
        ))}
        {(tab === "proximos" ? upcoming : history).length === 0 && (
          <div className="px-5 py-12 text-center text-sm text-ink-muted">
            {tab === "proximos" ? "No tenés turnos próximos" : "No hay historial de turnos"}
          </div>
        )}
      </div>

      {/* ── Booking modal ────────────────────────────────── */}
      {showBooking && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-xl max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-light">
              <h2 className="text-lg font-bold text-ink">Nuevo turno</h2>
              <button
                onClick={resetBooking}
                className="p-1 text-ink-muted hover:text-ink transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Steps indicator */}
            <div className="px-6 py-3 flex items-center gap-2 text-xs font-medium">
              {["Especialidad", "Fecha", "Horario", "Confirmar"].map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                      bookingStep > i + 1
                        ? "bg-emerald-100 text-emerald-700"
                        : bookingStep === i + 1
                          ? "bg-celeste-dark text-white"
                          : "bg-ink-50 text-ink-300"
                    }`}
                  >
                    {bookingStep > i + 1 ? <Check className="w-3.5 h-3.5" /> : i + 1}
                  </div>
                  <span className={bookingStep >= i + 1 ? "text-ink" : "text-ink-300"}>{s}</span>
                  {i < 3 && <ChevronRight className="w-3.5 h-3.5 text-ink-200" />}
                </div>
              ))}
            </div>

            <div className="px-6 py-4">
              {/* Step 1: Specialty */}
              {bookingStep === 1 && (
                <div className="space-y-2">
                  <p className="text-sm text-ink-muted mb-3">Seleccioná la especialidad</p>
                  <div className="grid grid-cols-2 gap-2">
                    {specialties.map((sp) => (
                      <button
                        key={sp}
                        onClick={() => {
                          setSelectedSpecialty(sp);
                          setBookingStep(2);
                        }}
                        className={`text-left text-sm px-3 py-2.5 rounded-xl border transition ${
                          selectedSpecialty === sp
                            ? "border-celeste-dark bg-celeste-50 text-celeste-dark font-semibold"
                            : "border-border-light hover:border-celeste-200 text-ink-500"
                        }`}
                      >
                        {sp}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Date */}
              {bookingStep === 2 && (
                <div className="space-y-3">
                  <p className="text-sm text-ink-muted">Elegí una fecha para {selectedSpecialty}</p>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setBookingStep(3);
                    }}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full border border-border-light rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-celeste-200 focus:border-celeste-dark"
                  />
                </div>
              )}

              {/* Step 3: Time */}
              {bookingStep === 3 && (
                <div className="space-y-3">
                  <p className="text-sm text-ink-muted">
                    Horarios disponibles para{" "}
                    {new Date(selectedDate + "T12:00").toLocaleDateString("es-AR", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {timeSlots.map((t) => (
                      <button
                        key={t}
                        onClick={() => {
                          setSelectedTime(t);
                          setBookingStep(4);
                        }}
                        className={`text-sm px-3 py-2 rounded-lg border transition ${
                          selectedTime === t
                            ? "border-celeste-dark bg-celeste-50 text-celeste-dark font-semibold"
                            : "border-border-light hover:border-celeste-200 text-ink-500"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4: Confirm */}
              {bookingStep === 4 && (
                <div className="space-y-4">
                  <p className="text-sm text-ink-muted">Confirmá tu turno</p>
                  <div className="bg-surface rounded-xl p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-ink-muted">Especialidad</span>
                      <span className="font-semibold text-ink">{selectedSpecialty}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-muted">Fecha</span>
                      <span className="font-semibold text-ink">
                        {new Date(selectedDate + "T12:00").toLocaleDateString("es-AR", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-muted">Horario</span>
                      <span className="font-semibold text-ink">{selectedTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-muted">Profesional</span>
                      <span className="font-semibold text-ink">A asignar</span>
                    </div>
                  </div>
                  <button
                    onClick={resetBooking}
                    className="w-full bg-celeste-dark hover:bg-celeste-700 text-white text-sm font-semibold py-3 rounded-[4px] transition"
                  >
                    Confirmar turno
                  </button>
                </div>
              )}
            </div>

            {/* Back button */}
            {bookingStep > 1 && (
              <div className="px-6 pb-4">
                <button
                  onClick={() => setBookingStep(bookingStep - 1)}
                  className="flex items-center gap-1 text-xs text-ink-muted hover:text-ink transition"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Volver
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

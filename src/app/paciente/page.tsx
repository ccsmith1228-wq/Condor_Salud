"use client";

import { useState } from "react";
import Link from "next/link";
import { usePatientName } from "@/lib/hooks/usePatientName";
import {
  Heart,
  Calendar,
  Pill,
  Shield,
  Video,
  Activity,
  ChevronRight,
  Bell,
  TrendingUp,
  Clock,
  AlertCircle,
  Sun,
} from "lucide-react";

/* ── demo data ────────────────────────────────────────── */
const upcomingAppointments = [
  {
    id: 1,
    doctor: "Dra. Laura Méndez",
    specialty: "Clínica Médica",
    date: "Lun 17 Mar",
    time: "10:30",
    type: "presencial",
  },
  {
    id: 2,
    doctor: "Dr. Carlos Ruiz",
    specialty: "Cardiología",
    date: "Mié 19 Mar",
    time: "15:00",
    type: "teleconsulta",
  },
];

const activeMeds = [
  { id: 1, name: "Losartán 50mg", dose: "1 comprimido/día", remaining: 12 },
  { id: 2, name: "Metformina 850mg", dose: "2 comprimidos/día", remaining: 5 },
  { id: 3, name: "Atorvastatina 20mg", dose: "1 comprimido/noche", remaining: 28 },
];

const vitals = [
  { label: "Presión arterial", value: "120/80", unit: "mmHg", trend: "stable" },
  { label: "Peso", value: "72.5", unit: "kg", trend: "down" },
  { label: "Glucemia", value: "98", unit: "mg/dL", trend: "stable" },
  { label: "Frecuencia cardíaca", value: "68", unit: "bpm", trend: "stable" },
];

const quickActions = [
  {
    label: "Sacar turno",
    href: "/paciente/turnos",
    icon: Calendar,
    color: "bg-celeste-50 text-celeste-dark",
  },
  {
    label: "Teleconsulta",
    href: "/paciente/teleconsulta",
    icon: Video,
    color: "bg-success-50 text-success-600",
  },
  {
    label: "Mis medicamentos",
    href: "/paciente/medicamentos",
    icon: Pill,
    color: "bg-amber-50 text-amber-600",
  },
  {
    label: "Chequear síntomas",
    href: "/paciente/sintomas",
    icon: Activity,
    color: "bg-red-50 text-red-600",
  },
];

const alerts = [
  { id: 1, text: "Tu receta de Metformina vence en 5 días", type: "warning" as const },
  { id: 2, text: "Recordatorio: análisis de sangre pendiente", type: "info" as const },
];

/* ── helpers ──────────────────────────────────────────── */
function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 19) return "Buenas tardes";
  return "Buenas noches";
}

function TrendIcon({ trend }: { trend: string }) {
  if (trend === "down") return <TrendingUp className="w-3.5 h-3.5 text-success-500 rotate-180" />;
  if (trend === "up") return <TrendingUp className="w-3.5 h-3.5 text-amber-500" />;
  return <div className="w-3.5 h-3.5 rounded-full bg-celeste-100" />;
}

/* ── component ────────────────────────────────────────── */
export default function PatientDashboard() {
  const { firstName } = usePatientName();
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink flex items-center gap-2">
            <Sun className="w-6 h-6 text-gold" />
            {getGreeting()}, {firstName || "Paciente"}
          </h1>
          <p className="text-sm text-ink-muted mt-0.5">Acá tenés un resumen de tu salud</p>
        </div>
        <Link
          href="/paciente/turnos"
          className="inline-flex items-center gap-2 bg-celeste-dark hover:bg-celeste-700 text-white text-sm font-semibold px-5 py-2.5 rounded-[4px] transition shrink-0"
        >
          <Calendar className="w-4 h-4" />
          Sacar turno
        </Link>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((a) => (
            <div
              key={a.id}
              className={`flex items-start gap-3 px-4 py-3 rounded-xl text-sm ${
                a.type === "warning"
                  ? "bg-amber-50 text-amber-800 border border-amber-200"
                  : "bg-celeste-50 text-celeste-dark border border-celeste-200"
              }`}
            >
              {a.type === "warning" ? (
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              ) : (
                <Bell className="w-4 h-4 mt-0.5 shrink-0" />
              )}
              {a.text}
            </div>
          ))}
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {quickActions.map((a) => {
          const Icon = a.icon;
          return (
            <Link
              key={a.href}
              href={a.href}
              className="flex flex-col items-center gap-2 bg-white rounded-2xl border border-border-light p-4 hover:shadow-md hover:-translate-y-0.5 transition group"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${a.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-ink-500 group-hover:text-ink">
                {a.label}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Upcoming appointments */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-border-light">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border-light">
            <h2 className="text-sm font-bold text-ink flex items-center gap-2">
              <Calendar className="w-4 h-4 text-celeste-dark" />
              Próximos turnos
            </h2>
            <Link
              href="/paciente/turnos"
              className="text-xs text-celeste-dark hover:underline font-medium"
            >
              Ver todos
            </Link>
          </div>
          <div className="divide-y divide-border-light">
            {upcomingAppointments.map((apt) => (
              <div key={apt.id} className="flex items-center justify-between px-5 py-3.5">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      apt.type === "teleconsulta" ? "bg-success-50" : "bg-celeste-50"
                    }`}
                  >
                    {apt.type === "teleconsulta" ? (
                      <Video className="w-4 h-4 text-success-600" />
                    ) : (
                      <Calendar className="w-4 h-4 text-celeste-dark" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink truncate">{apt.doctor}</p>
                    <p className="text-xs text-ink-muted">{apt.specialty}</p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className="text-sm font-medium text-ink">{apt.date}</p>
                  <p className="text-xs text-ink-muted flex items-center gap-1 justify-end">
                    <Clock className="w-3 h-3" />
                    {apt.time}
                  </p>
                </div>
              </div>
            ))}
            {upcomingAppointments.length === 0 && (
              <div className="px-5 py-8 text-center text-sm text-ink-muted">
                No tenés turnos próximos
              </div>
            )}
          </div>
        </div>

        {/* Coverage card */}
        <div className="bg-celeste-dark rounded-2xl p-5 text-white flex flex-col justify-between min-h-[200px]">
          <div>
            <Shield className="w-8 h-8 mb-3 opacity-90" />
            <p className="text-xs font-medium opacity-80">Mi obra social</p>
            <h3 className="text-xl font-bold mt-0.5">OSDE 310</h3>
            <p className="text-xs mt-1 opacity-80">N° afiliado: 08-29384756-3</p>
          </div>
          <Link
            href="/paciente/cobertura"
            className="mt-4 inline-flex items-center gap-1 text-xs font-semibold bg-white/20 hover:bg-white/30 backdrop-blur px-3 py-2 rounded-lg transition self-start"
          >
            Ver cobertura <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Second row */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Vitals */}
        <div className="bg-white rounded-2xl border border-border-light">
          <div className="px-5 py-4 border-b border-border-light">
            <h2 className="text-sm font-bold text-ink flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500" />
              Últimos controles
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-px bg-border-light">
            {vitals.map((v) => (
              <div key={v.label} className="bg-white px-4 py-3.5">
                <p className="text-[11px] text-ink-muted">{v.label}</p>
                <div className="flex items-end gap-1.5 mt-0.5">
                  <span className="text-lg font-bold text-ink">{v.value}</span>
                  <span className="text-[11px] text-ink-muted mb-0.5">{v.unit}</span>
                  <TrendIcon trend={v.trend} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active medications */}
        <div className="bg-white rounded-2xl border border-border-light">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border-light">
            <h2 className="text-sm font-bold text-ink flex items-center gap-2">
              <Pill className="w-4 h-4 text-amber-600" />
              Medicamentos activos
            </h2>
            <Link
              href="/paciente/medicamentos"
              className="text-xs text-celeste-dark hover:underline font-medium"
            >
              Ver todos
            </Link>
          </div>
          <div className="divide-y divide-border-light">
            {activeMeds.map((med) => (
              <div key={med.id} className="flex items-center justify-between px-5 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink">{med.name}</p>
                  <p className="text-xs text-ink-muted">{med.dose}</p>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      med.remaining <= 7
                        ? "bg-amber-50 text-amber-700"
                        : "bg-success-50 text-success-700"
                    }`}
                  >
                    {med.remaining} días
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

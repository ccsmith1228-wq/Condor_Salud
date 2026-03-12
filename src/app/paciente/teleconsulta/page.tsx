"use client";

import { useState } from "react";
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  Phone,
  MessageSquare,
  Monitor,
  Calendar,
  Clock,
  User,
  Star,
  ChevronRight,
  Shield,
  Wifi,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/components/Toast";

/* ── types ────────────────────────────────────────────── */
type View = "list" | "waiting" | "call";

interface TeleAppointment {
  id: number;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  status: "disponible" | "en-espera" | "completado";
  rating?: number;
}

/* ── demo data ────────────────────────────────────────── */
const teleAppointments: TeleAppointment[] = [
  {
    id: 1,
    doctor: "Dr. Carlos Ruiz",
    specialty: "Cardiología",
    date: "Mié 19 Mar",
    time: "15:00",
    status: "disponible",
  },
  {
    id: 2,
    doctor: "Dra. Ana Torres",
    specialty: "Ginecología",
    date: "Vie 21 Mar",
    time: "10:30",
    status: "disponible",
  },
  {
    id: 3,
    doctor: "Dra. Laura Méndez",
    specialty: "Clínica Médica",
    date: "Lun 10 Mar",
    time: "11:00",
    status: "completado",
    rating: 5,
  },
  {
    id: 4,
    doctor: "Dr. Pablo Sánchez",
    specialty: "Dermatología",
    date: "Jue 06 Mar",
    time: "16:00",
    status: "completado",
    rating: 4,
  },
];

const tips = [
  { icon: Wifi, text: "Asegurate de tener buena conexión a internet" },
  { icon: Mic, text: "Probá el micrófono y cámara antes de la consulta" },
  { icon: Monitor, text: "Buscá un lugar tranquilo y bien iluminado" },
  { icon: Shield, text: "Tu consulta es 100% privada y encriptada" },
];

export default function TeleconsultaPage() {
  const { showToast } = useToast();
  const [view, setView] = useState<View>("list");
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [selectedApt, setSelectedApt] = useState<TeleAppointment | null>(null);

  const upcoming = teleAppointments.filter((a) => a.status === "disponible");
  const past = teleAppointments.filter((a) => a.status === "completado");

  const handleJoin = (apt: TeleAppointment) => {
    setSelectedApt(apt);
    setView("waiting");
  };

  const handleStartCall = () => {
    setView("call");
  };

  if (view === "call") {
    return (
      <div className="fixed inset-0 bg-ink z-50 flex flex-col">
        {/* Video area */}
        <div className="flex-1 relative">
          {/* Remote video (doctor) */}
          <div className="absolute inset-0 flex items-center justify-center bg-ink-900">
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-celeste-dark/30 flex items-center justify-center mx-auto mb-4">
                <User className="w-12 h-12 text-celeste-200" />
              </div>
              <p className="text-white text-lg font-semibold">{selectedApt?.doctor}</p>
              <p className="text-white/60 text-sm">{selectedApt?.specialty}</p>
              <p className="text-white/40 text-xs mt-2 flex items-center justify-center gap-1">
                <Clock className="w-3 h-3" />
                Conectando...
              </p>
            </div>
          </div>

          {/* Local video (patient) */}
          <div className="absolute bottom-4 right-4 w-40 h-28 bg-ink-800 rounded-xl border-2 border-white/20 flex items-center justify-center">
            {camOn ? (
              <div className="text-center">
                <div className="w-10 h-10 rounded-full bg-celeste-dark/50 flex items-center justify-center mx-auto">
                  <User className="w-5 h-5 text-white" />
                </div>
                <p className="text-white/60 text-[10px] mt-1">Vos</p>
              </div>
            ) : (
              <VideoOff className="w-6 h-6 text-white/40" />
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="bg-ink-900/90 backdrop-blur px-6 py-5 flex items-center justify-center gap-4">
          <button
            onClick={() => setMicOn(!micOn)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition ${
              micOn ? "bg-white/10 text-white hover:bg-white/20" : "bg-red-500 text-white"
            }`}
          >
            {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setCamOn(!camOn)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition ${
              camOn ? "bg-white/10 text-white hover:bg-white/20" : "bg-red-500 text-white"
            }`}
          >
            {camOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>
          <button
            onClick={() => showToast("Chat en consulta disponible próximamente")}
            className="w-12 h-12 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center transition"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              setView("list");
              setSelectedApt(null);
            }}
            className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition"
          >
            <Phone className="w-6 h-6 rotate-[135deg]" />
          </button>
        </div>
      </div>
    );
  }

  if (view === "waiting") {
    return (
      <div className="max-w-lg mx-auto mt-12 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-celeste-50 flex items-center justify-center mx-auto">
          <Video className="w-10 h-10 text-celeste-dark animate-pulse" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-ink">Sala de espera</h2>
          <p className="text-sm text-ink-muted mt-1">
            Tu consulta con {selectedApt?.doctor} está por comenzar
          </p>
        </div>

        {/* Preview controls */}
        <div className="bg-white rounded-2xl border border-border-light p-6">
          <div className="w-full h-40 bg-ink-50 rounded-xl flex items-center justify-center mb-4">
            {camOn ? (
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-celeste-100 flex items-center justify-center mx-auto">
                  <User className="w-8 h-8 text-celeste-dark" />
                </div>
                <p className="text-xs text-ink-muted mt-2">Vista previa de tu cámara</p>
              </div>
            ) : (
              <VideoOff className="w-8 h-8 text-ink-300" />
            )}
          </div>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setMicOn(!micOn)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
                micOn ? "bg-ink-50 text-ink hover:bg-ink-100" : "bg-red-50 text-red-600"
              }`}
            >
              {micOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              {micOn ? "Micrófono" : "Silenciado"}
            </button>
            <button
              onClick={() => setCamOn(!camOn)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
                camOn ? "bg-ink-50 text-ink hover:bg-ink-100" : "bg-red-50 text-red-600"
              }`}
            >
              {camOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              {camOn ? "Cámara" : "Sin cámara"}
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              setView("list");
              setSelectedApt(null);
            }}
            className="flex-1 border border-border-light text-ink-500 text-sm font-medium py-3 rounded-xl hover:bg-ink-50 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleStartCall}
            className="flex-1 bg-success-600 hover:bg-success-700 text-white text-sm font-semibold py-3 rounded-[4px] transition"
          >
            Ingresar a la consulta
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-ink">Teleconsulta</h1>
        <p className="text-sm text-ink-muted mt-0.5">
          Consultá con tu médico desde cualquier lugar
        </p>
      </div>

      {/* Tips */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {tips.map((tip) => {
          const Icon = tip.icon;
          return (
            <div
              key={tip.text}
              className="flex items-start gap-3 bg-white rounded-xl border border-border-light p-3"
            >
              <div className="w-8 h-8 rounded-lg bg-celeste-50 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-celeste-dark" />
              </div>
              <p className="text-xs text-ink-muted leading-relaxed">{tip.text}</p>
            </div>
          );
        })}
      </div>

      {/* Upcoming teleconsultas */}
      <div className="bg-white rounded-2xl border border-border-light">
        <div className="px-5 py-4 border-b border-border-light">
          <h2 className="text-sm font-bold text-ink flex items-center gap-2">
            <Video className="w-4 h-4 text-success-600" />
            Teleconsultas programadas
          </h2>
        </div>
        <div className="divide-y divide-border-light">
          {upcoming.map((apt) => (
            <div key={apt.id} className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4">
              <div className="w-10 h-10 rounded-xl bg-success-50 flex items-center justify-center shrink-0">
                <Video className="w-5 h-5 text-success-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ink">{apt.doctor}</p>
                <p className="text-xs text-ink-muted">{apt.specialty}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-ink-muted">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {apt.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {apt.time}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleJoin(apt)}
                className="inline-flex items-center gap-2 bg-success-600 hover:bg-success-700 text-white text-sm font-semibold px-4 py-2 rounded-[4px] transition shrink-0"
              >
                <Video className="w-4 h-4" />
                Ingresar
              </button>
            </div>
          ))}
          {upcoming.length === 0 && (
            <div className="px-5 py-8 text-center text-sm text-ink-muted">
              No tenés teleconsultas programadas
            </div>
          )}
        </div>
      </div>

      {/* Past teleconsultas */}
      <div className="bg-white rounded-2xl border border-border-light">
        <div className="px-5 py-4 border-b border-border-light">
          <h2 className="text-sm font-bold text-ink">Consultas anteriores</h2>
        </div>
        <div className="divide-y divide-border-light">
          {past.map((apt) => (
            <div key={apt.id} className="flex items-center gap-3 px-5 py-3.5">
              <div className="w-9 h-9 rounded-lg bg-ink-50 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4 text-ink-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-ink">
                  {apt.doctor} — {apt.specialty}
                </p>
                <p className="text-xs text-ink-muted">
                  {apt.date} · {apt.time}
                </p>
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${i < (apt.rating ?? 0) ? "text-gold fill-gold" : "text-ink-100"}`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

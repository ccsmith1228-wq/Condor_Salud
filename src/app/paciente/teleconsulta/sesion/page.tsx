"use client";

// ─── Telehealth Session Page ─────────────────────────────────
// Google Meet integration with pre-call lobby, camera/mic checks,
// and call timer. Ported from frontend/src/screens/TelehealthScreen.tsx.

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  Wifi,
  Monitor,
  ArrowLeft,
  Loader2,
} from "lucide-react";

type SessionView = "lobby" | "call" | "ended";

interface CheckItemProps {
  label: string;
  status: "checking" | "ok" | "error";
}

function CheckItem({ label, status }: CheckItemProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
      {status === "checking" && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
      {status === "ok" && <CheckCircle2 className="h-4 w-4 text-green-500" />}
      {status === "error" && <XCircle className="h-4 w-4 text-red-500" />}
      <span className="text-sm text-gray-700">{label}</span>
    </div>
  );
}

const tips = [
  { icon: Wifi, text: "Asegurate de tener buena conexión a internet" },
  { icon: Mic, text: "Probá el micrófono antes de la consulta" },
  { icon: Monitor, text: "Buscá un lugar tranquilo y bien iluminado" },
  { icon: Shield, text: "Tu consulta es 100% privada y encriptada" },
];

export default function TeleconsultaSesionPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const meetUrl = searchParams.get("meetUrl") || "";
  const doctorName = searchParams.get("doctor") || "tu médico";
  const bookingId = searchParams.get("bookingId") || "";

  const [view, setView] = useState<SessionView>("lobby");
  const [cameraCheck, setCameraCheck] = useState<"checking" | "ok" | "error">("checking");
  const [micCheck, setMicCheck] = useState<"checking" | "ok" | "error">("checking");
  const [callDuration, setCallDuration] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Check camera & mic permissions ─────────────────────────
  useEffect(() => {
    async function checkPermissions() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach((t) => t.stop());
        setCameraCheck("ok");
      } catch {
        setCameraCheck("error");
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((t) => t.stop());
        setMicCheck("ok");
      } catch {
        setMicCheck("error");
      }
    }
    checkPermissions();
  }, []);

  // ── Call timer ─────────────────────────────────────────────
  useEffect(() => {
    if (view === "call") {
      timerRef.current = setInterval(() => {
        setCallDuration((d) => d + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [view]);

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleStartCall = () => {
    if (!meetUrl) return;
    setView("call");
  };

  const handleEndCall = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setView("ended");
  }, []);

  // ── Lobby view ─────────────────────────────────────────────
  if (view === "lobby") {
    const allChecksOk = cameraCheck === "ok" && micCheck === "ok";

    return (
      <div className="mx-auto max-w-lg px-4 py-8">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" /> Volver
        </button>

        <div className="rounded-2xl bg-white p-6 shadow-lg">
          <div className="text-center">
            <Video className="mx-auto h-10 w-10 text-celeste" />
            <h1 className="mt-3 text-xl font-bold text-gray-900">Teleconsulta</h1>
            <p className="mt-1 text-sm text-gray-500">Consulta con {doctorName}</p>
          </div>

          {/* ── Pre-call checks ─────────────────────────────── */}
          <div className="mt-6 space-y-2">
            <CheckItem label="Cámara" status={cameraCheck} />
            <CheckItem label="Micrófono" status={micCheck} />
          </div>

          {/* ── Tips ────────────────────────────────────────── */}
          <div className="mt-6 rounded-xl bg-blue-50 p-4">
            <p className="mb-2 text-xs font-semibold text-blue-800">Consejos</p>
            <div className="space-y-2">
              {tips.map((tip, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-blue-700">
                  <tip.icon className="h-3.5 w-3.5" />
                  <span>{tip.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Join button ─────────────────────────────────── */}
          <button
            onClick={handleStartCall}
            disabled={!meetUrl || !allChecksOk}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-celeste px-4 py-3 text-sm font-semibold text-white transition hover:bg-celeste-dark disabled:opacity-50"
          >
            <Video className="h-4 w-4" />
            Unirse a la consulta
          </button>

          {!meetUrl && (
            <p className="mt-2 text-center text-xs text-red-500">
              No se proporcionó un enlace de videollamada
            </p>
          )}
        </div>
      </div>
    );
  }

  // ── Call view ──────────────────────────────────────────────
  if (view === "call") {
    return (
      <div className="relative h-[calc(100vh-4rem)] w-full">
        <iframe
          src={meetUrl}
          className="h-full w-full border-0"
          allow="camera; microphone; display-capture; autoplay; clipboard-write"
          title="Teleconsulta"
        />

        {/* ── Call controls overlay ─────────────────────────── */}
        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3 rounded-full bg-black/70 px-6 py-3 shadow-xl backdrop-blur">
          <span className="mr-2 text-sm font-mono text-white">{formatDuration(callDuration)}</span>
          <button
            onClick={handleEndCall}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition hover:bg-red-600"
            aria-label="Finalizar llamada"
          >
            <Phone className="h-5 w-5 rotate-[135deg]" />
          </button>
        </div>
      </div>
    );
  }

  // ── Ended view ─────────────────────────────────────────────
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
        <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
        <h2 className="mt-4 text-xl font-bold text-gray-900">Consulta finalizada</h2>
        <p className="mt-2 text-sm text-gray-500">Duración: {formatDuration(callDuration)}</p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => router.push("/paciente/turnos")}
            className="flex-1 rounded-xl bg-celeste px-4 py-3 text-sm font-semibold text-white transition hover:bg-celeste-dark"
          >
            Ver mis turnos
          </button>
          <button
            onClick={() => router.push("/paciente")}
            className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700"
          >
            Inicio
          </button>
        </div>
      </div>
    </div>
  );
}

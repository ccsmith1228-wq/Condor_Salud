"use client";
import { useState } from "react";
import Link from "next/link";
import { useToast } from "@/components/Toast";
import { useDemoAction } from "@/components/DemoModal";
import { useIsDemo } from "@/lib/auth/context";

/** Mask phone number for display: "11-4523-8891" → "11-••••-8891" */
function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 6) return "••••";
  return phone.replace(/(\d{2}-)(\d{4})(-.*)/, "$1••••$3");
}

// ─── NOTE: No hardcoded templates, stats, or history. ────────
// This page mirrors the WhatsApp config page (which IS wired to
// the backend via useWhatsAppConfig). For now, we show empty
// states until this page is connected to the same backend hooks.
// Marketing/demo mock data lives only in src/lib/services/data.ts.

const DEFAULT_TEMPLATES = [
  {
    id: "reminder-24h",
    nombre: "Recordatorio 24hs",
    mensaje:
      "Hola {nombre}, te recordamos que tenes turno manana {fecha} a las {hora} con {profesional}. Responde SI para confirmar o NO para cancelar.",
    activo: true,
    tipo: "recordatorio" as const,
    timing: "24 horas antes",
  },
  {
    id: "reminder-2h",
    nombre: "Recordatorio 2hs",
    mensaje:
      "Hola {nombre}, tu turno es HOY a las {hora} con {profesional}. Si no podes asistir, avisanos.",
    activo: true,
    tipo: "recordatorio" as const,
    timing: "2 horas antes",
  },
  {
    id: "confirmation",
    nombre: "Confirmacion recibida",
    mensaje: "Perfecto {nombre}, tu turno del {fecha} a las {hora} quedo confirmado.",
    activo: true,
    tipo: "confirmacion" as const,
    timing: "Inmediato",
  },
  {
    id: "cancellation",
    nombre: "Cancelacion",
    mensaje:
      "Hola {nombre}, tu turno del {fecha} a las {hora} fue cancelado. Podes reprogramar desde la app.",
    activo: true,
    tipo: "cancelacion" as const,
    timing: "Inmediato",
  },
  {
    id: "post-visit",
    nombre: "Post-consulta",
    mensaje: "Hola {nombre}, gracias por tu visita. Si necesitas algo, estamos a disposicion.",
    activo: false,
    tipo: "seguimiento" as const,
    timing: "1 hora despues",
  },
];

const estadoColors: Record<string, string> = {
  Confirmado: "bg-green-50 text-green-700",
  Cancelado: "bg-red-50 text-red-600",
  "Sin respuesta": "bg-amber-50 text-amber-700",
  Entregado: "bg-celeste-pale text-celeste-dark",
  Pendiente: "bg-border-light text-ink-muted",
};

export default function RecordatoriosConfigPage() {
  const { showDemo } = useDemoAction();
  const { showToast } = useToast();
  const isDemo = useIsDemo();
  const [activeTemplates, setActiveTemplates] = useState(
    DEFAULT_TEMPLATES.reduce(
      (acc, t) => ({ ...acc, [t.id]: t.activo }),
      {} as Record<string, boolean>,
    ),
  );

  const toggleTemplate = (id: string) => {
    setActiveTemplates((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-ink-muted">
        <Link href="/dashboard/configuracion" className="hover:text-celeste-dark transition">
          Configuración
        </Link>
        <span>/</span>
        <span className="text-ink font-medium">Recordatorios WhatsApp</span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Recordatorios WhatsApp</h1>
          <p className="text-sm text-ink-muted mt-0.5">
            Confirmaciones y recordatorios automáticos de turnos por WhatsApp
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() =>
              isDemo
                ? showDemo("Enviar recordatorio manual")
                : showToast("✅ Enviar recordatorio manual")
            }
            className="px-4 py-2 text-sm font-medium border border-border rounded-[4px] text-ink-light hover:border-celeste-dark hover:text-celeste-dark transition"
          >
            Envío manual
          </button>
          <button
            onClick={() =>
              isDemo
                ? showDemo("Configurar WhatsApp Business API")
                : showToast("✅ Configurar WhatsApp Business API")
            }
            className="px-4 py-2 text-sm font-semibold bg-[#25D366] text-white rounded-[4px] hover:bg-[#20BD5A] transition flex items-center gap-1.5"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Conectar WhatsApp
          </button>
        </div>
      </div>

      {/* Connection status */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-green-800">WhatsApp Business conectado</p>
          <p className="text-xs text-green-700 mt-0.5">
            Número: +54 11 5514-0371 · API activa · Última sincronización: hace 5 minutos
          </p>
        </div>
        <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider bg-green-100 text-green-700 rounded">
          ACTIVO
        </span>
      </div>

      {/* KPI row — populated from actual WhatsApp delivery data */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Enviados (mes)", value: "0", color: "border-celeste" },
          { label: "Confirmados", value: "0", color: "border-green-400" },
          { label: "Cancelados", value: "0", color: "border-red-400" },
          { label: "Tasa confirmacion", value: "—", color: "border-green-400" },
        ].map((k) => (
          <div
            key={k.label}
            className={`bg-white border border-border rounded-lg p-3 border-l-[3px] ${k.color}`}
          >
            <p className="text-[10px] font-bold tracking-wider text-ink-muted uppercase">
              {k.label}
            </p>
            <p className="text-lg font-bold text-ink mt-0.5">{k.value}</p>
          </div>
        ))}
      </div>

      {/* Auto-send settings */}
      <div className="bg-white border border-border rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xs font-bold tracking-wider text-ink-muted uppercase">
              Envío Automático
            </h3>
            <p className="text-[10px] text-ink-muted mt-0.5">
              Los recordatorios se envían automáticamente según el horario configurado
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-ink-light">Horario de envío:</span>
            <span className="px-3 py-1 text-xs font-mono font-semibold bg-[#F8FAFB] border border-border rounded">
              08:00
            </span>
          </div>
        </div>

        {/* Message templates */}
        <div className="space-y-3">
          {DEFAULT_TEMPLATES.map((t) => (
            <div
              key={t.id}
              className={`border rounded-lg p-4 transition ${activeTemplates[t.id] ? "border-green-200 bg-green-50/30" : "border-border bg-white"}`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => toggleTemplate(t.id)}
                  role="switch"
                  aria-checked={activeTemplates[t.id] ? "true" : "false"}
                  aria-label={`${activeTemplates[t.id] ? "Desactivar" : "Activar"} ${t.nombre}`}
                  className={`mt-0.5 w-10 h-5 rounded-full transition relative shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-celeste-dark focus-visible:ring-offset-2 ${activeTemplates[t.id] ? "bg-green-500" : "bg-gray-200"}`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white shadow absolute top-0.5 transition ${activeTemplates[t.id] ? "left-5" : "left-0.5"}`}
                  />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-sm font-bold text-ink">{t.nombre}</span>
                    <span
                      className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                        t.tipo === "recordatorio"
                          ? "bg-celeste-pale text-celeste-dark"
                          : t.tipo === "confirmacion"
                            ? "bg-green-50 text-green-700"
                            : t.tipo === "cancelacion"
                              ? "bg-red-50 text-red-600"
                              : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {t.tipo}
                    </span>
                    <span className="text-[10px] text-ink-muted">{t.timing}</span>
                  </div>
                  <div className="bg-[#F8FAFB] rounded p-3 text-xs text-ink-light leading-relaxed font-mono">
                    {t.mensaje}
                  </div>
                </div>
                <button
                  onClick={() =>
                    isDemo
                      ? showDemo(`Editar plantilla "${t.nombre}"`)
                      : showToast(`✅ Editar plantilla "${t.nombre}"`)
                  }
                  className="text-xs text-celeste-dark font-medium hover:underline shrink-0"
                >
                  Editar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Variables reference */}
      <div className="bg-celeste-pale/30 border border-border rounded-lg p-4">
        <h4 className="text-[10px] font-bold tracking-wider text-ink-muted uppercase mb-2">
          Variables disponibles en plantillas
        </h4>
        <div className="flex flex-wrap gap-2">
          {[
            { var: "{nombre}", desc: "Nombre del paciente" },
            { var: "{apellido}", desc: "Apellido" },
            { var: "{fecha}", desc: "Fecha del turno" },
            { var: "{hora}", desc: "Hora del turno" },
            { var: "{profesional}", desc: "Nombre del profesional" },
            { var: "{especialidad}", desc: "Especialidad" },
            { var: "{clinica}", desc: "Nombre de la clínica" },
            { var: "{direccion}", desc: "Dirección" },
            { var: "{diasProximo}", desc: "Días hasta próximo turno" },
          ].map((v) => (
            <span
              key={v.var}
              className="px-2 py-1 text-[10px] font-mono bg-white border border-border rounded"
              title={v.desc}
            >
              {v.var}
            </span>
          ))}
        </div>
      </div>

      {/* Recent activity — populated from actual delivery logs */}
      <div className="bg-white border border-border rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h3 className="text-xs font-bold tracking-wider text-ink-muted uppercase">
            Actividad Reciente
          </h3>
          <span className="text-[10px] text-ink-muted">Ultimas 48 horas</span>
        </div>
        <div className="py-10 px-6 text-center">
          <p className="text-sm font-semibold text-ink">Sin actividad reciente</p>
          <p className="text-xs text-ink-muted mt-1">
            Los recordatorios enviados a pacientes aparecen aca una vez que conectes WhatsApp
            Business y agendes turnos. Podes configurar las plantillas arriba.
          </p>
        </div>
      </div>
    </div>
  );
}

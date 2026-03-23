"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useToast } from "@/components/Toast";
import { useWhatsAppConfig, useSaveWhatsAppConfig } from "@/lib/hooks/useCRM";
import type { WhatsAppTemplate } from "@/lib/types";

/* ---------- Types ---------- */
interface ReminderSettings {
  hoursBeforeFirst: number;
  hoursBeforeSecond: number;
  confirmationReply: boolean;
  cancellationReply: boolean;
  rescheduleReply: boolean;
  includeGoogleMaps: boolean;
  includeClinicPhone: boolean;
  includePreparation: boolean;
}

interface PageTemplate {
  name: string;
  trigger: string;
  body_template: string;
  active: boolean;
}

/* ---------- Defaults (shown in demo + pre-filled for new users) ---------- */
const DEFAULT_CLINIC_ADDRESS = "Av. San Martin 1520, Piso 2, CABA";
const DEFAULT_CLINIC_PHONE = "(011) 4523-8800";
const DEFAULT_CLINIC_NAME = "Centro Medico San Martin";
const DEFAULT_GMAPS = "https://maps.google.com/?q=Av+San+Martin+1520+CABA+Argentina";

const DEFAULT_REMINDER_SETTINGS: ReminderSettings = {
  hoursBeforeFirst: 24,
  hoursBeforeSecond: 2,
  confirmationReply: true,
  cancellationReply: true,
  rescheduleReply: true,
  includeGoogleMaps: true,
  includeClinicPhone: true,
  includePreparation: false,
};

const DEFAULT_TEMPLATES: PageTemplate[] = [
  {
    name: "reminder-24h",
    trigger: "24 horas antes del turno",
    body_template:
      `Hola {{paciente_nombre}}, te recordamos tu turno en *${DEFAULT_CLINIC_NAME}*:\n\n` +
      `Fecha: *{{turno_fecha}}*\nHora: *{{turno_hora}}*\n` +
      `Profesional: *{{profesional_nombre}}*\nTipo: {{turno_tipo}}\n\n` +
      `Como llegar: ${DEFAULT_GMAPS}\n\n` +
      `Responde:\n*1* - Confirmar turno\n*2* - Cancelar turno\n*3* - Reprogramar`,
    active: true,
  },
  {
    name: "reminder-2h",
    trigger: "2 horas antes del turno",
    body_template:
      `Hola {{paciente_nombre}}, tu turno es *hoy a las {{turno_hora}}* con {{profesional_nombre}}.\n\n` +
      `Direccion: ${DEFAULT_CLINIC_ADDRESS}\nAbrir en Google Maps: ${DEFAULT_GMAPS}\n\nTe esperamos!`,
    active: true,
  },
  {
    name: "confirmation",
    trigger: "Al agendar un turno nuevo",
    body_template:
      `Hola {{paciente_nombre}}, tu turno fue agendado:\n\n` +
      `Fecha: *{{turno_fecha}}*\nHora: *{{turno_hora}}*\n` +
      `Profesional: *{{profesional_nombre}}*\nTipo: {{turno_tipo}}\n` +
      `Financiador: {{financiador}}\n\n` +
      `Direccion: ${DEFAULT_CLINIC_ADDRESS}\nGoogle Maps: ${DEFAULT_GMAPS}\n\n` +
      `24 hs antes te enviaremos un recordatorio. Responde *CANCELAR* si necesitas cancelar.`,
    active: true,
  },
  {
    name: "cancellation",
    trigger: "Al cancelar un turno",
    body_template:
      `Hola {{paciente_nombre}}, tu turno del *{{turno_fecha}}* a las *{{turno_hora}}* fue cancelado correctamente.\n\n` +
      `Para agendar uno nuevo, contactanos al ${DEFAULT_CLINIC_PHONE} o responde *TURNO*.`,
    active: true,
  },
  {
    name: "reschedule",
    trigger: "Al reprogramar un turno",
    body_template:
      `Hola {{paciente_nombre}}, tu turno fue reprogramado:\n\n` +
      `Nueva fecha: *{{turno_fecha}}*\nNueva hora: *{{turno_hora}}*\n` +
      `Profesional: *{{profesional_nombre}}*\n\n` +
      `Direccion: ${DEFAULT_CLINIC_ADDRESS}\nGoogle Maps: ${DEFAULT_GMAPS}`,
    active: true,
  },
  {
    name: "post-visit",
    trigger: "1 hora despues de la consulta",
    body_template:
      `Hola {{paciente_nombre}}, gracias por visitarnos en *${DEFAULT_CLINIC_NAME}*.\n\n` +
      `Si necesitas un nuevo turno o tenes consultas, escribinos por aca o llamanos al ${DEFAULT_CLINIC_PHONE}.`,
    active: false,
  },
];

// NOTE: No hardcoded recent reminders. This section is populated
// from actual WhatsApp delivery logs once the API is connected.

const ESTADO_COLOR: Record<string, string> = {
  Confirmado: "bg-green-50 text-green-700",
  "Sin respuesta": "bg-amber-50 text-amber-700",
  Cancelado: "bg-red-50 text-red-600",
  Reprogramado: "bg-celeste-pale text-celeste-dark",
  Pendiente: "bg-gray-50 text-gray-500",
};

/* ---------- Component ---------- */
export default function WhatsAppConfigPage() {
  const { showToast } = useToast();
  const {
    config: savedConfig,
    templates: savedTemplates,
    isLoading,
    refresh,
  } = useWhatsAppConfig();
  const { trigger: saveConfig, isMutating: saving } = useSaveWhatsAppConfig();

  // ── Local state ────────────────────────────────────────
  const [autoReply, setAutoReply] = useState(true);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [displayName, setDisplayName] = useState(DEFAULT_CLINIC_NAME);
  const [welcomeMessage, setWelcomeMessage] = useState(
    "Hola! Gracias por comunicarte con nosotros. Un miembro de nuestro equipo te respondera a la brevedad. En que podemos ayudarte?",
  );
  const [outOfHoursMessage, setOutOfHoursMessage] = useState(
    "Nuestro horario de atencion es de 8:00 a 20:00. Te responderemos a primera hora.",
  );
  const [notifyOnNewLead, setNotifyOnNewLead] = useState(true);
  const [reminderSettings, setReminderSettings] =
    useState<ReminderSettings>(DEFAULT_REMINDER_SETTINGS);
  const [templates, setTemplates] = useState<PageTemplate[]>(DEFAULT_TEMPLATES);
  const [previewTemplate, setPreviewTemplate] = useState<string | null>("reminder-24h");
  const [dirty, setDirty] = useState(false);

  // ── Hydrate from DB when data arrives ──────────────────
  useEffect(() => {
    if (!savedConfig) return;
    setAutoReply(savedConfig.auto_reply);
    setWhatsappNumber(savedConfig.whatsapp_number);
    setDisplayName(savedConfig.display_name || DEFAULT_CLINIC_NAME);
    if (savedConfig.welcome_message) setWelcomeMessage(savedConfig.welcome_message);
    if (savedConfig.out_of_hours_message) setOutOfHoursMessage(savedConfig.out_of_hours_message);
    setNotifyOnNewLead(savedConfig.notify_on_new_lead);

    // Parse reminder settings from business_hours JSON
    try {
      const bh = JSON.parse(savedConfig.business_hours);
      if (bh && typeof bh === "object" && bh.hoursBeforeFirst !== undefined) {
        setReminderSettings({
          hoursBeforeFirst: bh.hoursBeforeFirst ?? 24,
          hoursBeforeSecond: bh.hoursBeforeSecond ?? 2,
          confirmationReply: bh.confirmationReply ?? true,
          cancellationReply: bh.cancellationReply ?? true,
          rescheduleReply: bh.rescheduleReply ?? true,
          includeGoogleMaps: bh.includeGoogleMaps ?? true,
          includeClinicPhone: bh.includeClinicPhone ?? true,
          includePreparation: bh.includePreparation ?? false,
        });
      }
    } catch {
      // Not JSON — keep defaults
    }
  }, [savedConfig]);

  useEffect(() => {
    if (savedTemplates.length === 0) return;
    // Merge DB templates into local state
    setTemplates((prev) =>
      prev.map((local) => {
        const db = savedTemplates.find((t: WhatsAppTemplate) => t.name === local.name);
        if (!db) return local;
        return {
          ...local,
          body_template: db.body_template,
          active: db.active,
        };
      }),
    );
  }, [savedTemplates]);

  // ── Mark dirty on any change ───────────────────────────
  const markDirty = useCallback(() => setDirty(true), []);

  const toggleReminder = (key: keyof ReminderSettings) => {
    setReminderSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    markDirty();
  };

  const toggleTemplate = (name: string) => {
    setTemplates((prev) => prev.map((t) => (t.name === name ? { ...t, active: !t.active } : t)));
    markDirty();
  };

  // ── Save ───────────────────────────────────────────────
  const handleSave = async () => {
    try {
      const businessHoursJson = JSON.stringify({
        hours: "08:00-20:00",
        ...reminderSettings,
      });

      await saveConfig({
        config: {
          whatsapp_number: whatsappNumber || "+5491100000000",
          display_name: displayName,
          welcome_message: welcomeMessage,
          auto_reply: autoReply,
          business_hours: businessHoursJson,
          out_of_hours_message: outOfHoursMessage,
          notify_on_new_lead: notifyOnNewLead,
        },
        templates: templates.map((t) => ({
          name: t.name,
          category: "utility",
          language: "es_AR",
          body_template: t.body_template,
          variables: [
            "paciente_nombre",
            "turno_fecha",
            "turno_hora",
            "profesional_nombre",
            "turno_tipo",
            "financiador",
          ],
          header_text: t.trigger,
          active: t.active,
        })),
      });

      setDirty(false);
      refresh();
      showToast("Configuracion guardada");
    } catch {
      showToast("Error al guardar");
    }
  };

  // ── Derived values ─────────────────────────────────────
  const previewMsg = templates.find((t) => t.name === previewTemplate);
  const previewText = previewMsg?.body_template
    .replace(/\{\{paciente_nombre\}\}/g, "Maria Elena")
    .replace(/\{\{turno_fecha\}\}/g, "Martes 11/03/2026")
    .replace(/\{\{turno_hora\}\}/g, "08:00")
    .replace(/\{\{profesional_nombre\}\}/g, "Dr. Martin Rodriguez")
    .replace(/\{\{turno_tipo\}\}/g, "Control cardiologico")
    .replace(/\{\{financiador\}\}/g, "PAMI");

  const activeCount = templates.filter((t) => t.active).length;
  const isConnected = !!savedConfig?.whatsapp_number;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-ink-muted text-sm">
        Cargando configuracion...
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-ink-muted">
        <Link href="/dashboard/configuracion" className="hover:text-celeste-dark transition">
          Configuracion
        </Link>
        <span>/</span>
        <span className="text-ink font-medium">WhatsApp Turnos</span>
      </div>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">WhatsApp Turnos</h1>
          <p className="text-sm text-ink-muted mt-0.5">
            Recordatorios automaticos y confirmaciones de turnos via WhatsApp
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => showToast("Mensaje de prueba enviado (simulado)")}
            className="px-4 py-2 text-sm font-medium border border-border rounded-[4px] text-ink-light hover:border-celeste-dark hover:text-celeste-dark transition"
          >
            Enviar prueba
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm font-semibold bg-celeste-dark text-white rounded-[4px] hover:bg-celeste transition disabled:opacity-50"
          >
            {saving ? "Guardando..." : dirty ? "Guardar cambios *" : "Guardar cambios"}
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Mensajes hoy", value: "0", color: "border-celeste" },
          { label: "Confirmados", value: "0", color: "border-green-400" },
          { label: "Sin respuesta", value: "0", color: "border-amber-400" },
          { label: "Plantillas activas", value: `${activeCount}/6`, color: "border-celeste" },
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

      {/* Connection status */}
      <div className="bg-white border border-border rounded-lg p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#25D366]/10 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#25D366]" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-ink">WhatsApp Business API</h3>
              <p className="text-[10px] text-ink-muted">
                {isConnected
                  ? `Conectado -- Linea: ${savedConfig?.whatsapp_number} -- ${displayName}`
                  : `Demo -- Configure su numero para activar`}
              </p>
            </div>
          </div>
          <span
            className={`px-2.5 py-1 text-[10px] font-bold rounded border ${
              isConnected
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-amber-50 text-amber-700 border-amber-200"
            }`}
          >
            {isConnected ? "Conectado" : "Demo"}
          </span>
        </div>

        {/* Number config (editable) */}
        <div className="mt-4 grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold tracking-wider text-ink-muted uppercase">
              Numero WhatsApp
            </label>
            <input
              type="text"
              value={whatsappNumber}
              onChange={(e) => {
                setWhatsappNumber(e.target.value);
                markDirty();
              }}
              placeholder="+5491155551234"
              className="mt-1 w-full px-3 py-2 text-sm border border-border rounded focus:outline-none focus:ring-1 focus:ring-celeste"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold tracking-wider text-ink-muted uppercase">
              Nombre para mostrar
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value);
                markDirty();
              }}
              placeholder="Clinica San Martin"
              className="mt-1 w-full px-3 py-2 text-sm border border-border rounded focus:outline-none focus:ring-1 focus:ring-celeste"
            />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Left: Configuration */}
        <div className="space-y-5">
          {/* Reminder settings */}
          <div className="bg-white border border-border rounded-lg p-5">
            <h3 className="text-xs font-bold tracking-wider text-ink-muted uppercase mb-4">
              Recordatorios Automaticos
            </h3>
            <div className="space-y-4">
              {/* Master toggle */}
              <ToggleRow
                label="Recordatorios activos"
                desc="Enviar recordatorios automaticos antes de cada turno"
                value={autoReply}
                onChange={() => {
                  setAutoReply(!autoReply);
                  markDirty();
                }}
                color="bg-[#25D366]"
              />

              {/* Timing */}
              <div className="flex items-center justify-between py-2 border-b border-border-light">
                <div>
                  <p className="text-xs font-semibold text-ink">Primer recordatorio</p>
                  <p className="text-[10px] text-ink-muted">Cuantas horas antes del turno</p>
                </div>
                <select
                  value={reminderSettings.hoursBeforeFirst}
                  onChange={(e) => {
                    setReminderSettings((s) => ({
                      ...s,
                      hoursBeforeFirst: Number(e.target.value),
                    }));
                    markDirty();
                  }}
                  aria-label="Primer recordatorio - horas antes"
                  className="text-xs border border-border rounded px-2 py-1.5 text-ink"
                >
                  <option value={48}>48 horas</option>
                  <option value={24}>24 horas</option>
                  <option value={12}>12 horas</option>
                </select>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-border-light">
                <div>
                  <p className="text-xs font-semibold text-ink">Segundo recordatorio</p>
                  <p className="text-[10px] text-ink-muted">Recordatorio corto previo al turno</p>
                </div>
                <select
                  value={reminderSettings.hoursBeforeSecond}
                  onChange={(e) => {
                    setReminderSettings((s) => ({
                      ...s,
                      hoursBeforeSecond: Number(e.target.value),
                    }));
                    markDirty();
                  }}
                  aria-label="Segundo recordatorio - horas antes"
                  className="text-xs border border-border rounded px-2 py-1.5 text-ink"
                >
                  <option value={4}>4 horas</option>
                  <option value={2}>2 horas</option>
                  <option value={1}>1 hora</option>
                </select>
              </div>

              {/* Google Maps */}
              <ToggleRow
                label="Incluir Google Maps"
                desc="Link con direcciones a la clinica en cada recordatorio"
                value={reminderSettings.includeGoogleMaps}
                onChange={() => toggleReminder("includeGoogleMaps")}
              />

              {reminderSettings.includeGoogleMaps && (
                <div className="bg-[#F8FAFB] rounded-lg p-3">
                  <p className="text-[10px] font-bold tracking-wider text-ink-muted uppercase mb-1.5">
                    Direccion configurada
                  </p>
                  <p className="text-xs font-semibold text-ink">{DEFAULT_CLINIC_ADDRESS}</p>
                  <a
                    href={DEFAULT_GMAPS}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-celeste-dark font-medium hover:underline mt-1 inline-block"
                  >
                    Ver en Google Maps
                  </a>
                </div>
              )}

              {/* Reply options + misc toggles */}
              {[
                {
                  key: "confirmationReply" as const,
                  label: "Respuesta de confirmacion",
                  desc: "Paciente puede confirmar respondiendo '1'",
                },
                {
                  key: "cancellationReply" as const,
                  label: "Respuesta de cancelacion",
                  desc: "Paciente puede cancelar respondiendo '2'",
                },
                {
                  key: "rescheduleReply" as const,
                  label: "Respuesta de reprogramacion",
                  desc: "Paciente puede pedir reprogramar respondiendo '3'",
                },
                {
                  key: "includeClinicPhone" as const,
                  label: "Incluir telefono clinica",
                  desc: `Agregar ${DEFAULT_CLINIC_PHONE} en los mensajes`,
                },
              ].map((opt) => (
                <ToggleRow
                  key={opt.key}
                  label={opt.label}
                  desc={opt.desc}
                  value={reminderSettings[opt.key]}
                  onChange={() => toggleReminder(opt.key)}
                />
              ))}
            </div>
          </div>

          {/* Auto-reply messages */}
          <div className="bg-white border border-border rounded-lg p-5">
            <h3 className="text-xs font-bold tracking-wider text-ink-muted uppercase mb-4">
              Mensajes Automaticos
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold tracking-wider text-ink-muted uppercase">
                  Mensaje de bienvenida
                </label>
                <textarea
                  value={welcomeMessage}
                  onChange={(e) => {
                    setWelcomeMessage(e.target.value);
                    markDirty();
                  }}
                  rows={3}
                  className="mt-1 w-full px-3 py-2 text-sm border border-border rounded focus:outline-none focus:ring-1 focus:ring-celeste resize-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold tracking-wider text-ink-muted uppercase">
                  Mensaje fuera de horario
                </label>
                <textarea
                  value={outOfHoursMessage}
                  onChange={(e) => {
                    setOutOfHoursMessage(e.target.value);
                    markDirty();
                  }}
                  rows={2}
                  className="mt-1 w-full px-3 py-2 text-sm border border-border rounded focus:outline-none focus:ring-1 focus:ring-celeste resize-none"
                />
              </div>
              <ToggleRow
                label="Notificar nuevos leads"
                desc="Recibir alerta cuando un nuevo contacto escriba por WhatsApp"
                value={notifyOnNewLead}
                onChange={() => {
                  setNotifyOnNewLead(!notifyOnNewLead);
                  markDirty();
                }}
              />
            </div>
          </div>

          {/* Message templates list */}
          <div className="bg-white border border-border rounded-lg p-5">
            <h3 className="text-xs font-bold tracking-wider text-ink-muted uppercase mb-4">
              Plantillas de Mensajes
            </h3>
            <div className="space-y-2">
              {templates.map((t) => (
                <div
                  key={t.name}
                  className={`flex items-center justify-between p-3 rounded-lg border transition cursor-pointer ${
                    previewTemplate === t.name
                      ? "border-celeste bg-celeste-pale/20"
                      : "border-border-light hover:border-border"
                  }`}
                  onClick={() => setPreviewTemplate(t.name)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold text-ink">{t.name}</p>
                      {!t.active && (
                        <span className="px-1.5 py-0.5 text-[8px] font-bold rounded bg-gray-100 text-gray-400">
                          INACTIVO
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-ink-muted mt-0.5">{t.trigger}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTemplate(t.name);
                    }}
                    role="switch"
                    aria-checked={t.active}
                    aria-label={`Toggle ${t.name}`}
                    className={`w-9 h-5 rounded-full transition relative shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-celeste-dark focus-visible:ring-offset-2 ${t.active ? "bg-[#25D366]" : "bg-border"}`}
                  >
                    <span
                      className={`block w-3.5 h-3.5 rounded-full bg-white shadow absolute top-[3px] transition ${t.active ? "left-[18px]" : "left-[3px]"}`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Preview + Recent */}
        <div className="space-y-5">
          {/* WhatsApp Preview */}
          <div className="bg-white border border-border rounded-lg p-5">
            <h3 className="text-xs font-bold tracking-wider text-ink-muted uppercase mb-4">
              Vista Previa del Mensaje
            </h3>
            {/* Phone mockup */}
            <div className="bg-[#ECE5DD] rounded-xl p-4 max-w-sm mx-auto">
              {/* Chat header */}
              <div className="bg-[#075E54] rounded-t-lg px-3 py-2.5 flex items-center gap-2.5 -mx-4 -mt-4 mb-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white text-xs font-semibold">{displayName}</p>
                  <p className="text-white/60 text-[10px]">en linea</p>
                </div>
              </div>
              {/* Message bubble */}
              <div className="bg-white rounded-lg p-3 shadow-sm relative">
                <pre className="text-xs text-ink whitespace-pre-wrap font-sans leading-relaxed">
                  {previewText}
                </pre>
                <p className="text-[10px] text-ink-muted text-right mt-1.5">08:00</p>
              </div>
              {/* Patient reply */}
              <div className="flex justify-end mt-2">
                <div className="bg-[#DCF8C6] rounded-lg px-3 py-2 shadow-sm max-w-[70%]">
                  <p className="text-xs text-ink">1</p>
                  <p className="text-[10px] text-ink-muted text-right mt-0.5">08:02</p>
                </div>
              </div>
              {/* Auto-reply */}
              <div className="bg-white rounded-lg p-3 shadow-sm mt-2">
                <p className="text-xs text-ink leading-relaxed">
                  Perfecto Maria Elena, tu turno del *Martes 11/03* a las *08:00* queda confirmado.
                  Te esperamos!
                </p>
                <p className="text-[10px] text-ink-muted text-right mt-1.5">08:02</p>
              </div>
            </div>
            <p className="text-[10px] text-ink-muted text-center mt-3">
              Selecciona una plantilla de la lista para ver su vista previa
            </p>
          </div>

          {/* Recent reminders — populated from actual WhatsApp delivery logs */}
          <div className="bg-white border border-border rounded-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h3 className="text-xs font-bold tracking-wider text-ink-muted uppercase">
                Recordatorios Recientes
              </h3>
              <Link
                href="/dashboard/agenda"
                className="text-[10px] text-celeste-dark font-medium hover:underline"
              >
                Ver agenda
              </Link>
            </div>
            <div className="py-10 px-6 text-center">
              <p className="text-sm font-semibold text-ink">Sin actividad reciente</p>
              <p className="text-xs text-ink-muted mt-1">
                Los recordatorios enviados a pacientes aparecen aca una vez que conectes WhatsApp
                Business y agendes turnos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Toggle Row ---------- */
function ToggleRow({
  label,
  desc,
  value,
  onChange,
  color = "bg-celeste-dark",
}: {
  label: string;
  desc: string;
  value: boolean;
  onChange: () => void;
  color?: string;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border-light last:border-0">
      <div>
        <p className="text-xs font-semibold text-ink">{label}</p>
        <p className="text-[10px] text-ink-muted">{desc}</p>
      </div>
      <button
        onClick={onChange}
        role="switch"
        aria-checked={value}
        aria-label={label}
        className={`w-10 h-5 rounded-full transition relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-celeste-dark focus-visible:ring-offset-2 ${value ? color : "bg-border"}`}
      >
        <span
          className={`block w-4 h-4 rounded-full bg-white shadow absolute top-0.5 transition ${value ? "left-5" : "left-0.5"}`}
        />
      </button>
    </div>
  );
}

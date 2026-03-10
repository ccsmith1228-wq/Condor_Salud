"use client";
import Link from "next/link";
import { useState } from "react";
import { useToast } from "@/components/Toast";
import { useDemoAction } from "@/components/DemoModal";

export default function NotificacionesConfigPage() {
  const { showToast } = useToast();
  const { showDemo } = useDemoAction();
  const [prefs, setPrefs] = useState({
    emailPagos: true,
    emailRechazos: true,
    emailAranceles: true,
    emailInventario: false,
    emailSistema: false,
    pushPagos: true,
    pushRechazos: true,
    pushAranceles: false,
    pushInventario: true,
    pushSistema: false,
    reporteSemanal: true,
    reporteMensual: true,
    reporteDiario: false,
  });

  const toggle = (key: string) => setPrefs((p) => ({ ...p, [key]: !p[key as keyof typeof p] }));

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-sm text-ink-muted">
        <Link href="/dashboard/configuracion" className="hover:text-celeste-dark transition">
          Configuración
        </Link>
        <span>/</span>
        <span className="text-ink font-medium">Notificaciones</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-ink">Notificaciones</h1>
        <p className="text-sm text-ink-muted mt-0.5">Configurá cómo y cuándo recibir alertas</p>
      </div>

      {/* Email notifications */}
      <div className="bg-white border border-border rounded-lg p-5">
        <h3 className="text-xs font-bold tracking-wider text-ink-muted uppercase mb-4">
          Notificaciones por Email
        </h3>
        <div className="space-y-3">
          {[
            {
              key: "emailPagos",
              label: "Pagos recibidos",
              desc: "Aviso cuando se acredita un pago de financiador",
            },
            {
              key: "emailRechazos",
              label: "Nuevos rechazos",
              desc: "Alerta inmediata cuando se detectan rechazos",
            },
            {
              key: "emailAranceles",
              label: "Actualización arancelaria",
              desc: "Cuando un financiador publica nuevos aranceles",
            },
            {
              key: "emailInventario",
              label: "Stock crítico",
              desc: "Cuando un ítem cae por debajo del mínimo",
            },
            {
              key: "emailSistema",
              label: "Sistema",
              desc: "Mantenimiento programado y actualizaciones",
            },
          ].map((n) => (
            <div
              key={n.key}
              className="flex items-center justify-between py-2 border-b border-border-light last:border-0"
            >
              <div>
                <p className="text-xs font-semibold text-ink">{n.label}</p>
                <p className="text-[10px] text-ink-muted">{n.desc}</p>
              </div>
              <button
                onClick={() => toggle(n.key)}
                className={`w-10 h-5 rounded-full transition relative ${prefs[n.key as keyof typeof prefs] ? "bg-celeste-dark" : "bg-border"}`}
              >
                <span
                  className={`block w-4 h-4 rounded-full bg-white shadow absolute top-0.5 transition ${prefs[n.key as keyof typeof prefs] ? "left-5" : "left-0.5"}`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Push */}
      <div className="bg-white border border-border rounded-lg p-5">
        <h3 className="text-xs font-bold tracking-wider text-ink-muted uppercase mb-4">
          Notificaciones Push (Navegador)
        </h3>
        <div className="space-y-3">
          {[
            { key: "pushPagos", label: "Pagos recibidos" },
            { key: "pushRechazos", label: "Nuevos rechazos" },
            { key: "pushAranceles", label: "Actualización arancelaria" },
            { key: "pushInventario", label: "Stock crítico" },
            { key: "pushSistema", label: "Sistema" },
          ].map((n) => (
            <div
              key={n.key}
              className="flex items-center justify-between py-2 border-b border-border-light last:border-0"
            >
              <p className="text-xs font-semibold text-ink">{n.label}</p>
              <button
                onClick={() => toggle(n.key)}
                className={`w-10 h-5 rounded-full transition relative ${prefs[n.key as keyof typeof prefs] ? "bg-celeste-dark" : "bg-border"}`}
              >
                <span
                  className={`block w-4 h-4 rounded-full bg-white shadow absolute top-0.5 transition ${prefs[n.key as keyof typeof prefs] ? "left-5" : "left-0.5"}`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Reportes automáticos */}
      <div className="bg-white border border-border rounded-lg p-5">
        <h3 className="text-xs font-bold tracking-wider text-ink-muted uppercase mb-4">
          Reportes Automáticos por Email
        </h3>
        <div className="space-y-3">
          {[
            { key: "reporteDiario", label: "Resumen diario", desc: "Todos los días a las 08:00" },
            {
              key: "reporteSemanal",
              label: "Resumen semanal",
              desc: "Todos los lunes a las 08:00",
            },
            {
              key: "reporteMensual",
              label: "Reporte mensual ejecutivo",
              desc: "Primer día hábil de cada mes",
            },
          ].map((n) => (
            <div
              key={n.key}
              className="flex items-center justify-between py-2 border-b border-border-light last:border-0"
            >
              <div>
                <p className="text-xs font-semibold text-ink">{n.label}</p>
                <p className="text-[10px] text-ink-muted">{n.desc}</p>
              </div>
              <button
                onClick={() => toggle(n.key)}
                className={`w-10 h-5 rounded-full transition relative ${prefs[n.key as keyof typeof prefs] ? "bg-celeste-dark" : "bg-border"}`}
              >
                <span
                  className={`block w-4 h-4 rounded-full bg-white shadow absolute top-0.5 transition ${prefs[n.key as keyof typeof prefs] ? "left-5" : "left-0.5"}`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => showDemo("Guardar preferencias de notificaciones")}
          className="px-5 py-2.5 text-sm font-semibold bg-celeste-dark text-white rounded-[4px] hover:bg-celeste transition"
        >
          Guardar cambios
        </button>
        <button
          onClick={() => showDemo("Restablecer configuración")}
          className="px-5 py-2.5 text-sm font-medium border border-border text-ink-light rounded-[4px] hover:border-ink transition"
        >
          Restablecer
        </button>
      </div>
    </div>
  );
}

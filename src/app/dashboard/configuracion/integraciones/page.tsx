"use client";
import { useState } from "react";
import Link from "next/link";
import { useToast } from "@/components/Toast";
import { useDemoAction } from "@/components/DemoModal";
import { useIsDemo } from "@/lib/auth/context";
import { useLocale } from "@/lib/i18n/context";

interface IntegracionData {
  id: string;
  nombre: string;
  tipoKey: string;
  estado: "connected" | "error" | "disconnected" | "pending";
  ultimaSync: string;
  descKey: string;
  icon: string;
}

const integracionesData: IntegracionData[] = [
  {
    id: "INT-01",
    nombre: "PAMI · Webservice",
    tipoKey: "typeSocialInsurance",
    estado: "pending",
    ultimaSync: "07/03/2026 16:00",
    descKey: "descPami",
    icon: "pami",
  },
  {
    id: "INT-02",
    nombre: "AFIP · Factura Electrónica",
    tipoKey: "typeFiscal",
    estado: "pending",
    ultimaSync: "07/03/2026 14:30",
    descKey: "descAfip",
    icon: "afip",
  },
  {
    id: "INT-03",
    nombre: "Swiss Medical · API",
    tipoKey: "typeSocialInsurance",
    estado: "pending",
    ultimaSync: "06/03/2026 22:00",
    descKey: "descSwiss",
    icon: "swiss",
  },
  {
    id: "INT-04",
    nombre: "OSDE · Portal Prestadores",
    tipoKey: "typeSocialInsurance",
    estado: "connected",
    ultimaSync: "06/03/2026 23:00",
    descKey: "descOsde",
    icon: "osde",
  },
  {
    id: "INT-05",
    nombre: "Galeno · Webservice",
    tipoKey: "typeSocialInsurance",
    estado: "error",
    ultimaSync: "04/03/2026 10:15",
    descKey: "descGaleno",
    icon: "galeno",
  },
  {
    id: "INT-06",
    nombre: "WhatsApp Business · Turnos",
    tipoKey: "typeCommunication",
    estado: "connected",
    ultimaSync: "07/03/2026 17:00",
    descKey: "descWhatsapp",
    icon: "whatsapp",
  },
  {
    id: "INT-07",
    nombre: "IOMA · Portal Web",
    tipoKey: "typeSocialInsurance",
    estado: "disconnected",
    ultimaSync: "—",
    descKey: "descIoma",
    icon: "ioma",
  },
  {
    id: "INT-08",
    nombre: "Medife · API Prestadores",
    tipoKey: "typeSocialInsurance",
    estado: "pending",
    ultimaSync: "—",
    descKey: "descMedife",
    icon: "medife",
  },
];

const estadoColors: Record<string, string> = {
  connected: "bg-green-50 text-green-700 border-green-200",
  error: "bg-red-50 text-red-600 border-red-200",
  disconnected: "bg-border-light text-ink-muted border-border",
  pending: "bg-gold-pale text-[#B8860B] border-gold",
};

export default function IntegracionesPage() {
  const { showToast } = useToast();
  const { showDemo } = useDemoAction();
  const isDemo = useIsDemo();
  const { t } = useLocale();
  const [integState, setIntegState] = useState(integracionesData);

  const portalUrls: Record<string, string> = {
    "INT-01": "https://www.pami.org.ar/prestadores",
    "INT-02": "https://www.afip.gob.ar/fe/",
    "INT-03": "https://prestadores.swissmedical.com.ar",
    "INT-04": "https://www.osde.com.ar/prestadores",
    "INT-05": "https://www.galeno.com.ar/prestadores",
    "INT-06": "https://business.facebook.com/wa/manage/phone-numbers/",
    "INT-07": "https://www.ioma.gba.gob.ar/prestadores",
    "INT-08": "https://www.medife.com.ar/prestadores",
  };

  // Translated lookup maps resolved inside component
  const statusLabels: Record<string, string> = {
    connected: t("settings.integrations.statusConnected"),
    error: t("settings.integrations.statusError"),
    disconnected: t("settings.integrations.statusDisconnected"),
    pending: t("settings.integrations.statusPending"),
  };

  const integraciones = integState.map((d) => ({
    ...d,
    tipo: t(`settings.integrations.${d.tipoKey}` as Parameters<typeof t>[0]),
    descripcion: t(`settings.integrations.${d.descKey}` as Parameters<typeof t>[0]),
    estadoLabel: statusLabels[d.estado],
  }));

  const activas = integraciones.filter((i) => i.estado === "connected").length;
  const errores = integraciones.filter((i) => i.estado === "error").length;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-sm text-ink-muted">
        <Link href="/dashboard/configuracion" className="hover:text-celeste-dark transition">
          {t("settings.integrations.breadcrumb")}
        </Link>
        <span>/</span>
        <span className="text-ink font-medium">{t("settings.integrations.breadcrumbCurrent")}</span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">{t("settings.integrations.heading")}</h1>
          <p className="text-sm text-ink-muted mt-0.5">
            {t("settings.integrations.activeCount")
              .replace("{active}", String(activas))
              .replace("{errors}", String(errores))}
          </p>
        </div>
        <button
          onClick={() => {
            if (isDemo) {
              showDemo(t("toast.config.newIntegration"));
              return;
            }
            window.open(
              "mailto:soporte@condorsalud.com?subject=Nueva%20integraci%C3%B3n&body=Necesito%20agregar%20una%20nueva%20integraci%C3%B3n%20para%20mi%20cl%C3%ADnica.",
              "_blank",
            );
            showToast(t("toast.config.newIntegration"), "success");
          }}
          className="px-4 py-2 text-sm font-semibold bg-celeste-dark text-white rounded-[4px] hover:bg-celeste transition"
        >
          {t("settings.integrations.newIntegration")}
        </button>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: t("settings.integrations.kpiTotal"),
            value: integraciones.length,
            color: "border-celeste",
          },
          {
            label: t("settings.integrations.kpiConnected"),
            value: activas,
            color: "border-green-400",
          },
          { label: t("settings.integrations.kpiErrors"), value: errores, color: "border-red-400" },
          {
            label: t("settings.integrations.kpiPending"),
            value: integraciones.filter(
              (i) => i.estado === "pending" || i.estado === "disconnected",
            ).length,
            color: "border-gold",
          },
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

      {/* Error banner */}
      {errores > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <svg
            className="w-5 h-5 text-red-500 mt-0.5 shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
          <div>
            <p className="text-sm font-semibold text-red-700">
              {t("settings.integrations.errorBanner").replace("{count}", String(errores))}
            </p>
            <p className="text-xs text-red-600 mt-0.5">
              {integraciones
                .filter((i) => i.estado === "error")
                .map((i) => i.nombre)
                .join(", ")}
            </p>
          </div>
        </div>
      )}

      {/* Integration cards */}
      <div className="space-y-3">
        {integraciones.map((int) => (
          <div
            key={int.id}
            className={`bg-white border rounded-lg p-5 transition hover:shadow-sm ${int.estado === "error" ? "border-red-200" : "border-border"}`}
          >
            <div className="flex items-start gap-4">
              <span className="w-10 h-10 rounded-lg bg-celeste-50 flex items-center justify-center text-sm font-bold text-celeste-700">
                {int.nombre.slice(0, 2).toUpperCase()}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="text-sm font-bold text-ink">{int.nombre}</h3>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded border ${estadoColors[int.estado]}`}
                  >
                    {int.estadoLabel}
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider rounded bg-surface text-ink-muted">
                    {int.tipo}
                  </span>
                </div>
                <p className="text-xs text-ink-light leading-relaxed">{int.descripcion}</p>
                <p className="text-[10px] text-ink-muted mt-1.5">
                  {t("settings.integrations.lastSync")}: {int.ultimaSync}
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                {int.estado === "connected" && (
                  <button
                    onClick={async () => {
                      if (isDemo) {
                        showDemo(
                          t("settings.integrations.syncToast").replace("{name}", int.nombre),
                        );
                        return;
                      }
                      try {
                        await fetch("/api/config", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            action: "sync-integration",
                            integrationId: int.id,
                          }),
                        });
                        const now = new Date().toLocaleString("es-AR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        });
                        setIntegState((prev) =>
                          prev.map((i) => (i.id === int.id ? { ...i, ultimaSync: now } : i)),
                        );
                        showToast(
                          t("settings.integrations.syncToast").replace("{name}", int.nombre),
                          "success",
                        );
                      } catch {
                        showToast(`Error sincronizando ${int.nombre}`, "error");
                      }
                    }}
                    className="px-3 py-1.5 text-xs font-medium border border-border rounded-[4px] text-ink-light hover:border-celeste-dark hover:text-celeste-dark transition"
                  >
                    {t("settings.integrations.sync")}
                  </button>
                )}
                {int.estado === "error" && (
                  <button
                    onClick={async () => {
                      if (isDemo) {
                        showDemo(
                          t("settings.integrations.retryToast").replace("{name}", int.nombre),
                        );
                        return;
                      }
                      try {
                        await fetch("/api/config", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            action: "retry-integration",
                            integrationId: int.id,
                          }),
                        });
                        setIntegState((prev) =>
                          prev.map((i) =>
                            i.id === int.id ? { ...i, estado: "pending" as const } : i,
                          ),
                        );
                        showToast(
                          t("settings.integrations.retryToast").replace("{name}", int.nombre),
                          "success",
                        );
                      } catch {
                        showToast(`Error reconectando ${int.nombre}`, "error");
                      }
                    }}
                    className="px-3 py-1.5 text-xs font-semibold bg-red-600 text-white rounded-[4px] hover:bg-red-700 transition"
                  >
                    {t("settings.integrations.retry")}
                  </button>
                )}
                {(int.estado === "disconnected" || int.estado === "pending") && (
                  <button
                    onClick={() => {
                      if (isDemo) {
                        showDemo(
                          t("settings.integrations.configureToast").replace("{name}", int.nombre),
                        );
                        return;
                      }
                      const url = portalUrls[int.id];
                      if (url) window.open(url, "_blank", "noopener");
                      showToast(
                        t("settings.integrations.configureToast").replace("{name}", int.nombre),
                        "success",
                      );
                    }}
                    className="px-3 py-1.5 text-xs font-semibold bg-celeste-dark text-white rounded-[4px] hover:bg-celeste transition"
                  >
                    {t("settings.integrations.configure")}
                  </button>
                )}
                <button
                  onClick={() => {
                    if (isDemo) {
                      showDemo(
                        t("settings.integrations.settingsToast").replace("{name}", int.nombre),
                      );
                      return;
                    }
                    const config = `ID: ${int.id}\nNombre: ${int.nombre}\nEstado: ${int.estadoLabel}\nÚltima sync: ${int.ultimaSync}\nTipo: ${int.tipo}`;
                    navigator.clipboard
                      .writeText(config)
                      .then(() => showToast(`Configuración de ${int.nombre} copiada`, "success"))
                      .catch(() => showToast(config, "success"));
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-ink-muted hover:text-ink transition"
                >
                  {t("settings.integrations.settings")}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

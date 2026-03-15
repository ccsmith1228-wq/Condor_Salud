"use client";

import { useState } from "react";
import { useDemoAction } from "@/components/DemoModal";
import {
  useNubixStudies,
  useNubixAppointments,
  useNubixDeliveries,
  useNubixKPIs,
} from "@/lib/hooks/useModules";
import type {
  NubixStudy,
  NubixDelivery,
  NubixAppointment,
  NubixModality,
  NubixStudyStatus,
} from "@/lib/nubix/types";

// ─── Helpers ─────────────────────────────────────────────────

const modalityLabel: Record<NubixModality, string> = {
  CR: "Rx Computada",
  CT: "Tomografía",
  MR: "Resonancia",
  US: "Ecografía",
  DX: "Rx Digital",
  MG: "Mamografía",
  OT: "Otro",
  XA: "Angiografía",
  PT: "PET",
  NM: "Med. Nuclear",
  IO: "Intraoral",
  PX: "Panorámica",
  ES: "Endoscopía",
  ECG: "ECG",
  AU: "Audiometría",
  OPT: "Oft. Tomografía",
};

const statusConfig: Record<NubixStudyStatus, { label: string; color: string }> = {
  scheduled: { label: "Programado", color: "bg-blue-100 text-blue-700" },
  in_progress: { label: "En progreso", color: "bg-yellow-100 text-yellow-700" },
  completed: { label: "Completado", color: "bg-green-100 text-green-700" },
  reported: { label: "Informado", color: "bg-purple-100 text-purple-700" },
  delivered: { label: "Entregado", color: "bg-emerald-100 text-emerald-700" },
  cancelled: { label: "Cancelado", color: "bg-red-100 text-red-700" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Types ───────────────────────────────────────────────────

type Tab = "estudios" | "turnos" | "entregas" | "visor";

// ─── Page Component ──────────────────────────────────────────

export default function NubixPage() {
  const { showDemo } = useDemoAction();
  const [tab, setTab] = useState<Tab>("estudios");
  const [search, setSearch] = useState("");
  const [modalityFilter, setModalityFilter] = useState<string>("Todas");
  const [statusFilter, setStatusFilter] = useState<string>("Todos");
  const [selectedStudy, setSelectedStudy] = useState<NubixStudy | null>(null);

  // ─── SWR data hooks ─────────────────────────────────────────
  const { data: studies = [] } = useNubixStudies();
  const { data: appointments = [] } = useNubixAppointments();
  const { data: deliveries = [] } = useNubixDeliveries();
  const { data: kpis } = useNubixKPIs();

  const tabs: { key: Tab; label: string }[] = [
    { key: "estudios", label: "Estudios" },
    { key: "turnos", label: "Turnos" },
    { key: "entregas", label: "Entregas" },
    { key: "visor", label: "Visor DICOM" },
  ];

  // Filters
  const allStudies = studies as NubixStudy[];
  const modalities = ["Todas", ...Array.from(new Set(allStudies.map((s) => s.modality)))];
  const statuses = ["Todos", ...Object.keys(statusConfig)];

  const filteredStudies = allStudies.filter((s) => {
    const matchesSearch =
      s.patientName.toLowerCase().includes(search.toLowerCase()) ||
      s.accessionNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase());
    const matchesModality = modalityFilter === "Todas" || s.modality === modalityFilter;
    const matchesStatus = statusFilter === "Todos" || s.status === statusFilter;
    return matchesSearch && matchesModality && matchesStatus;
  });

  const kpiCards = kpis
    ? [
        {
          label: "Estudios hoy",
          value: String(kpis.todayStudies),
          change: `${kpis.totalStudies} totales`,
          color: "text-celeste-dark",
        },
        {
          label: "Informes pendientes",
          value: String(kpis.pendingReports),
          change: `Promedio: ${kpis.avgReportTime}`,
          color: "text-gold",
        },
        {
          label: "Entregas hoy",
          value: String(kpis.deliveredToday),
          change: "WhatsApp, email, portal",
          color: "text-green-600",
        },
        {
          label: "Turnos hoy",
          value: String(kpis.appointmentsToday),
          change: `No-show: ${kpis.noShowRate}%`,
          color: "text-celeste-dark",
        },
      ]
    : [
        { label: "Estudios hoy", value: "5", change: "6 totales", color: "text-celeste-dark" },
        {
          label: "Informes pendientes",
          value: "2",
          change: "Promedio: 2h 15m",
          color: "text-gold",
        },
        {
          label: "Entregas hoy",
          value: "1",
          change: "WhatsApp, email, portal",
          color: "text-green-600",
        },
        { label: "Turnos hoy", value: "3", change: "No-show: 4.2%", color: "text-celeste-dark" },
      ];

  return (
    <div id="main-content" className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">
            Imagen Médica
            <span className="ml-2 text-xs font-normal bg-celeste-dark/10 text-celeste-dark px-2 py-0.5 rounded-full">
              NUBIX
            </span>
          </h1>
          <p className="text-sm text-ink-light mt-1">
            Estudios DICOM, informes y entrega de resultados en la nube
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => showDemo("Nuevo turno de imagen")}
            className="px-4 py-2.5 border border-border text-sm font-medium rounded hover:bg-muted transition"
          >
            + Nuevo turno
          </button>
          <button
            onClick={() => showDemo("Subir estudio DICOM")}
            className="px-5 py-2.5 bg-celeste-dark text-white text-sm font-semibold rounded hover:bg-celeste transition"
          >
            Subir estudio
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => (
          <div key={kpi.label} className="bg-white border border-border rounded-lg p-5">
            <p className="text-xs text-ink-muted">{kpi.label}</p>
            <p className={`text-2xl font-display font-bold ${kpi.color} mt-1`}>{kpi.value}</p>
            <p className="text-xs text-ink-muted mt-1">{kpi.change}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium transition border-b-2 -mb-px ${
              tab === t.key
                ? "border-celeste-dark text-celeste-dark"
                : "border-transparent text-ink-muted hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ─── Tab: Estudios ─── */}
      {tab === "estudios" && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Buscar por paciente, accesión o descripción..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-2.5 border border-border rounded text-sm focus:outline-none focus:border-celeste-dark"
            />
            <select
              value={modalityFilter}
              onChange={(e) => setModalityFilter(e.target.value)}
              title="Filtrar por modalidad"
              className="px-3 py-2.5 border border-border rounded text-sm focus:outline-none focus:border-celeste-dark"
            >
              {modalities.map((m) => (
                <option key={m} value={m}>
                  {m === "Todas" ? "Modalidad: Todas" : (modalityLabel[m as NubixModality] ?? m)}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              title="Filtrar por estado"
              className="px-3 py-2.5 border border-border rounded text-sm focus:outline-none focus:border-celeste-dark"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s === "Todos"
                    ? "Estado: Todos"
                    : (statusConfig[s as NubixStudyStatus]?.label ?? s)}
                </option>
              ))}
            </select>
          </div>

          {/* Studies table */}
          <div className="bg-white border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted border-b border-border">
                    <th className="text-left px-4 py-3 font-medium text-ink-muted">Accesión</th>
                    <th className="text-left px-4 py-3 font-medium text-ink-muted">Paciente</th>
                    <th className="text-left px-4 py-3 font-medium text-ink-muted">Modalidad</th>
                    <th className="text-left px-4 py-3 font-medium text-ink-muted">Descripción</th>
                    <th className="text-left px-4 py-3 font-medium text-ink-muted">Fecha</th>
                    <th className="text-left px-4 py-3 font-medium text-ink-muted">Estado</th>
                    <th className="text-left px-4 py-3 font-medium text-ink-muted">Informe</th>
                    <th className="text-left px-4 py-3 font-medium text-ink-muted">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudies.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-ink-muted">
                        No se encontraron estudios.
                      </td>
                    </tr>
                  ) : (
                    filteredStudies.map((study) => (
                      <tr
                        key={study.id}
                        className="border-b border-border last:border-0 hover:bg-muted/50 transition"
                      >
                        <td className="px-4 py-3 font-mono text-xs">{study.accessionNumber}</td>
                        <td className="px-4 py-3">
                          <div className="font-medium">{study.patientName}</div>
                          <div className="text-xs text-ink-muted">{study.patientDni}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 text-xs font-medium bg-muted px-2 py-1 rounded">
                            {study.modality}
                            <span className="text-ink-muted">{modalityLabel[study.modality]}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3 max-w-[200px] truncate">{study.description}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div>{formatDate(study.studyDate)}</div>
                          <div className="text-xs text-ink-muted">
                            {formatTime(study.studyDate)}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${
                              statusConfig[study.status]?.color ?? "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {statusConfig[study.status]?.label ?? study.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {study.reportStatus === "signed" ? (
                            <span className="text-xs text-green-600 font-medium">✓ Firmado</span>
                          ) : study.reportStatus === "draft" ? (
                            <span className="text-xs text-yellow-600 font-medium">Borrador</span>
                          ) : (
                            <span className="text-xs text-ink-muted">Pendiente</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            {study.instanceCount > 0 && (
                              <button
                                onClick={() => {
                                  setSelectedStudy(study);
                                  setTab("visor");
                                }}
                                className="text-xs px-2.5 py-1.5 bg-celeste-dark text-white rounded hover:bg-celeste transition"
                                title="Ver en visor DICOM"
                              >
                                🖥 Ver
                              </button>
                            )}
                            {study.reportStatus === "signed" && (
                              <button
                                onClick={() => showDemo(`Enviar resultados — ${study.patientName}`)}
                                className="text-xs px-2.5 py-1.5 border border-border rounded hover:bg-muted transition"
                                title="Enviar resultados al paciente"
                              >
                                📤 Enviar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── Tab: Turnos ─── */}
      {tab === "turnos" && (
        <div className="space-y-4">
          <div className="bg-white border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted border-b border-border">
                    <th className="text-left px-4 py-3 font-medium text-ink-muted">Hora</th>
                    <th className="text-left px-4 py-3 font-medium text-ink-muted">Paciente</th>
                    <th className="text-left px-4 py-3 font-medium text-ink-muted">Estudio</th>
                    <th className="text-left px-4 py-3 font-medium text-ink-muted">Modalidad</th>
                    <th className="text-left px-4 py-3 font-medium text-ink-muted">Sala</th>
                    <th className="text-left px-4 py-3 font-medium text-ink-muted">Derivante</th>
                    <th className="text-left px-4 py-3 font-medium text-ink-muted">Financiador</th>
                    <th className="text-left px-4 py-3 font-medium text-ink-muted">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {(appointments as NubixAppointment[]).length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-ink-muted">
                        No hay turnos para hoy.
                      </td>
                    </tr>
                  ) : (
                    (appointments as NubixAppointment[]).map((appt) => (
                      <tr
                        key={appt.id}
                        className="border-b border-border last:border-0 hover:bg-muted/50 transition"
                      >
                        <td className="px-4 py-3 font-medium whitespace-nowrap">
                          {formatTime(appt.scheduledAt)}
                          <div className="text-xs text-ink-muted">{appt.duration} min</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium">{appt.patientName}</div>
                          <div className="text-xs text-ink-muted">{appt.patientDni}</div>
                        </td>
                        <td className="px-4 py-3">{appt.description}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-medium bg-muted px-2 py-1 rounded">
                            {modalityLabel[appt.modality] ?? appt.modality}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs">{appt.room}</td>
                        <td className="px-4 py-3 text-xs">{appt.referringDoctor}</td>
                        <td className="px-4 py-3 text-xs">{appt.financiador}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${
                              appt.status === "confirmed"
                                ? "bg-blue-100 text-blue-700"
                                : appt.status === "arrived"
                                  ? "bg-green-100 text-green-700"
                                  : appt.status === "in_progress"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : appt.status === "completed"
                                      ? "bg-emerald-100 text-emerald-700"
                                      : appt.status === "no_show"
                                        ? "bg-red-100 text-red-700"
                                        : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {appt.status === "confirmed"
                              ? "Confirmado"
                              : appt.status === "arrived"
                                ? "Llegó"
                                : appt.status === "in_progress"
                                  ? "En progreso"
                                  : appt.status === "completed"
                                    ? "Completado"
                                    : appt.status === "no_show"
                                      ? "No asistió"
                                      : "Cancelado"}
                          </span>
                          {appt.reminderSent && (
                            <span
                              className="ml-1 text-xs text-ink-muted"
                              title="Recordatorio enviado"
                            >
                              🔔
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── Tab: Entregas ─── */}
      {tab === "entregas" && (
        <div className="space-y-4">
          <div className="bg-white border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted border-b border-border">
                    <th className="text-left px-4 py-3 font-medium text-ink-muted">Estudio</th>
                    <th className="text-left px-4 py-3 font-medium text-ink-muted">Canal</th>
                    <th className="text-left px-4 py-3 font-medium text-ink-muted">Destinatario</th>
                    <th className="text-left px-4 py-3 font-medium text-ink-muted">Contacto</th>
                    <th className="text-left px-4 py-3 font-medium text-ink-muted">Enviado</th>
                    <th className="text-left px-4 py-3 font-medium text-ink-muted">Abierto</th>
                    <th className="text-left px-4 py-3 font-medium text-ink-muted">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {(deliveries as NubixDelivery[]).length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-ink-muted">
                        No hay entregas registradas.
                      </td>
                    </tr>
                  ) : (
                    (deliveries as NubixDelivery[]).map((d) => {
                      const study = allStudies.find((s) => s.id === d.studyId);
                      return (
                        <tr
                          key={d.id}
                          className="border-b border-border last:border-0 hover:bg-muted/50 transition"
                        >
                          <td className="px-4 py-3">
                            <div className="font-medium text-xs">
                              {study?.accessionNumber ?? d.studyId}
                            </div>
                            <div className="text-xs text-ink-muted">
                              {study?.patientName ?? "—"}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-block text-xs font-medium px-2 py-1 rounded ${
                                d.channel === "whatsapp"
                                  ? "bg-green-100 text-green-700"
                                  : d.channel === "email"
                                    ? "bg-blue-100 text-blue-700"
                                    : d.channel === "portal"
                                      ? "bg-purple-100 text-purple-700"
                                      : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {d.channel === "whatsapp"
                                ? "WhatsApp"
                                : d.channel === "email"
                                  ? "Email"
                                  : d.channel === "portal"
                                    ? "Portal"
                                    : "SMS"}
                            </span>
                          </td>
                          <td className="px-4 py-3">{d.recipientName}</td>
                          <td className="px-4 py-3 text-xs font-mono">{d.recipientContact}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-xs">
                            {formatDate(d.sentAt)} {formatTime(d.sentAt)}
                          </td>
                          <td className="px-4 py-3 text-xs">
                            {d.openedAt
                              ? `${formatDate(d.openedAt)} ${formatTime(d.openedAt)}`
                              : "—"}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${
                                d.status === "opened"
                                  ? "bg-green-100 text-green-700"
                                  : d.status === "delivered"
                                    ? "bg-blue-100 text-blue-700"
                                    : d.status === "sent"
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-red-100 text-red-700"
                              }`}
                            >
                              {d.status === "opened"
                                ? "Abierto"
                                : d.status === "delivered"
                                  ? "Entregado"
                                  : d.status === "sent"
                                    ? "Enviado"
                                    : "Fallido"}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── Tab: Visor DICOM ─── */}
      {tab === "visor" && (
        <div className="space-y-4">
          {selectedStudy ? (
            <div className="bg-white border border-border rounded-lg overflow-hidden">
              {/* Viewer header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted">
                <div>
                  <span className="font-medium">{selectedStudy.patientName}</span>
                  <span className="mx-2 text-ink-muted">·</span>
                  <span className="text-sm text-ink-muted">{selectedStudy.description}</span>
                  <span className="mx-2 text-ink-muted">·</span>
                  <span className="text-xs font-mono text-ink-muted">
                    {selectedStudy.accessionNumber}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => showDemo(`Enviar resultados — ${selectedStudy.patientName}`)}
                    className="text-xs px-3 py-1.5 border border-border rounded hover:bg-white transition"
                  >
                    📤 Enviar
                  </button>
                  <button
                    onClick={() => setSelectedStudy(null)}
                    className="text-xs px-3 py-1.5 border border-border rounded hover:bg-white transition"
                  >
                    ✕ Cerrar
                  </button>
                </div>
              </div>

              {/* DICOM Viewer embed placeholder */}
              <div className="relative bg-black" style={{ minHeight: "65vh" }}>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white/70">
                  <div className="text-6xl mb-4">🖥</div>
                  <p className="text-lg font-medium">Visor DICOM — NUBIX Cloud</p>
                  <p className="text-sm mt-2 text-white/50">
                    {selectedStudy.instanceCount} imágenes · {selectedStudy.seriesCount} series ·{" "}
                    {modalityLabel[selectedStudy.modality]}
                  </p>
                  <p className="text-xs mt-4 text-white/30">
                    El visor DICOM se carga vía iframe desde app.nubix.cloud cuando la integración
                    está activa.
                  </p>
                  <div className="flex gap-2 mt-6">
                    {["zoom", "pan", "window_level", "measure", "annotate", "rotate"].map(
                      (tool) => (
                        <span
                          key={tool}
                          className="text-xs px-3 py-1.5 bg-white/10 rounded text-white/60"
                        >
                          {tool.replace("_", " ")}
                        </span>
                      ),
                    )}
                  </div>
                </div>
                {/* Real viewer would be:
                <iframe
                  src={viewerConfig.embedUrl + "?token=" + viewerConfig.token}
                  className="w-full h-full"
                  style={{ minHeight: "65vh" }}
                  allow="fullscreen"
                /> */}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-border rounded-lg p-12 text-center">
              <div className="text-4xl mb-3">🏥</div>
              <p className="text-ink font-medium">
                Seleccioná un estudio para ver en el visor DICOM
              </p>
              <p className="text-sm text-ink-muted mt-1">
                Volvé a la pestaña &quot;Estudios&quot; y hacé clic en &quot;Ver&quot; en cualquier
                estudio con imágenes.
              </p>
              <button
                onClick={() => setTab("estudios")}
                className="mt-4 px-5 py-2.5 bg-celeste-dark text-white text-sm font-semibold rounded hover:bg-celeste transition"
              >
                Ir a Estudios
              </button>
            </div>
          )}
        </div>
      )}

      {/* Storage info */}
      {kpis && (
        <div className="text-xs text-ink-muted text-right">
          Almacenamiento: {kpis.storageUsedGB} GB usados · Powered by{" "}
          <a
            href="https://nubix.cloud"
            target="_blank"
            rel="noopener noreferrer"
            className="text-celeste-dark hover:underline"
          >
            NUBIX Cloud
          </a>
        </div>
      )}
    </div>
  );
}

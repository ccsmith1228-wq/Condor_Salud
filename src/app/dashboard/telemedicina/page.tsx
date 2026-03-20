"use client";

import { useState } from "react";
import { useDemoAction } from "@/components/DemoModal";
import { useToast } from "@/components/Toast";
import { useIsDemo } from "@/lib/auth/context";
import {
  useWaitingRoom,
  useConsultations,
  useScheduledConsultations,
  useTelemedicinaKPIs,
} from "@/lib/hooks/useModules";

type Tab = "sala" | "consultas" | "facturacion" | "recetas" | "resumen";

export default function TelemedicinPage() {
  const { showDemo } = useDemoAction();
  const { showToast } = useToast();
  const isDemo = useIsDemo();
  const [tab, setTab] = useState<Tab>("sala");

  // ─── SWR data hooks ─────────────────────────────────────────
  const { data: waitingRoom = [] } = useWaitingRoom();
  const { data: recentConsultations = [] } = useConsultations();
  const { data: scheduledConsultations = [] } = useScheduledConsultations();
  const { data: kpis } = useTelemedicinaKPIs();

  const tabs: { key: Tab; label: string }[] = [
    { key: "sala", label: "Sala de espera" },
    { key: "consultas", label: "Consultas" },
    { key: "facturacion", label: "Facturación auto" },
    { key: "recetas", label: "Receta digital" },
    { key: "resumen", label: "Resumen WhatsApp" },
  ];

  const kpiCards = kpis
    ? [
        {
          label: "En sala de espera",
          value: String(kpis.inWaiting),
          change: "Conectados",
          color: "text-celeste-dark",
        },
        {
          label: "Consultas hoy",
          value: String(kpis.todayCount),
          change: "Completadas",
          color: "text-celeste-dark",
        },
        {
          label: "Facturadas auto",
          value: String(kpis.billed),
          change: "Facturación auto",
          color: "text-green-600",
        },
        {
          label: "Recetas enviadas",
          value: String(kpis.prescriptionsSent),
          change: "Con farmacia",
          color: "text-gold",
        },
      ]
    : [
        {
          label: "En sala de espera",
          value: "3",
          change: "1 sin intake",
          color: "text-celeste-dark",
        },
        {
          label: "Consultas hoy",
          value: "11",
          change: "8 completadas",
          color: "text-celeste-dark",
        },
        { label: "Facturadas auto", value: "8", change: "$186.400 total", color: "text-green-600" },
        { label: "Recetas enviadas", value: "6", change: "4 con farmacia", color: "text-gold" },
      ];

  const wr = waitingRoom;
  const rc = recentConsultations;
  const sc = scheduledConsultations;

  return (
    <div id="main-content" className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">Telemedicina</h1>
          <p className="text-sm text-ink-light mt-1">
            Videoconsultas, sala de espera virtual, facturación automática y recetas digitales
          </p>
        </div>
        <button
          onClick={() =>
            !isDemo
              ? showToast("✅ Iniciar nueva videoconsulta")
              : showDemo("Iniciar nueva videoconsulta")
          }
          className="px-5 py-2.5 bg-celeste-dark text-white text-sm font-semibold rounded hover:bg-celeste transition"
        >
          + Nueva consulta
        </button>
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

      {/* ─── 12.2 Virtual Waiting Room ─── */}
      {tab === "sala" && (
        <div className="space-y-4">
          <p className="text-sm text-ink-light">
            Pacientes en la sala de espera virtual. Formularios de intake se completan antes de la
            consulta.
          </p>

          <div className="space-y-3">
            {wr.map((p) => (
              <div
                key={p.id}
                className="bg-white border border-border rounded-lg p-5 flex flex-col sm:flex-row sm:items-center gap-4"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-celeste-pale text-celeste-dark font-bold text-lg shrink-0">
                  {p.queuePosition}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <p className="font-medium text-sm text-ink">{p.patientName}</p>
                    <span className="text-[10px] text-ink-muted">{p.age} años</span>
                    <span className="text-[10px] bg-[#F8FAFB] px-2 py-0.5 rounded text-ink-muted">
                      {p.financiador}
                    </span>
                  </div>
                  <p className="text-xs text-ink-light mt-0.5">{p.reason}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] text-ink-muted">
                      Ingresó: {p.joinedAt} - Espera: {p.waitTime}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        p.intakeComplete ? "bg-green-50 text-green-700" : "bg-gold-pale text-gold"
                      }`}
                    >
                      {p.intakeComplete ? "Intake completo" : "Intake pendiente"}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  {!p.intakeComplete && (
                    <button
                      onClick={() =>
                        !isDemo
                          ? showToast(`✅ Enviar formulario de intake a ${p.patientName}`)
                          : showDemo(`Enviar formulario de intake a ${p.patientName}`)
                      }
                      className="px-3 py-1.5 text-xs font-medium border border-border text-ink-light rounded hover:border-gold hover:text-gold transition"
                    >
                      Enviar intake
                    </button>
                  )}
                  <button
                    onClick={() =>
                      !isDemo
                        ? showToast(
                            `✅ Iniciar videoconsulta con ${p.patientName} — sin descarga de app, desde el navegador`,
                          )
                        : showDemo(
                            `Iniciar videoconsulta con ${p.patientName} — sin descarga de app, desde el navegador`,
                          )
                    }
                    className="px-4 py-2 text-xs font-semibold bg-celeste-dark text-white rounded hover:bg-celeste transition"
                  >
                    Iniciar video
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Upcoming */}
          <h3 className="text-sm font-semibold text-ink mt-6">Próximas programadas</h3>
          <div className="bg-white border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F8FAFB] text-xs text-ink-muted">
                  <th scope="col" className="text-left font-medium px-5 py-3">
                    Paciente
                  </th>
                  <th scope="col" className="text-left font-medium px-5 py-3">
                    Doctor
                  </th>
                  <th scope="col" className="text-left font-medium px-5 py-3">
                    Especialidad
                  </th>
                  <th scope="col" className="text-center font-medium px-5 py-3">
                    Hora
                  </th>
                  <th scope="col" className="text-center font-medium px-5 py-3">
                    Financiador
                  </th>
                  <th scope="col" className="text-right font-medium px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {sc.map((c) => (
                  <tr
                    key={c.id}
                    className="border-t border-border-light hover:bg-celeste-pale/30 transition"
                  >
                    <td className="px-5 py-3 font-medium text-ink">{c.patientName}</td>
                    <td className="px-5 py-3 text-ink-light">{c.doctorName}</td>
                    <td className="px-5 py-3 text-ink-light">{c.specialty}</td>
                    <td className="px-5 py-3 text-center text-ink">{c.time}</td>
                    <td className="px-5 py-3 text-center">
                      <span className="text-[10px] bg-[#F8FAFB] px-2 py-0.5 rounded text-ink-muted">
                        {c.financiador}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() =>
                          !isDemo
                            ? showToast(`✅ Copiar link: ${c.videoRoomUrl ?? c.code}`)
                            : showDemo(`Copiar link: ${c.videoRoomUrl ?? c.code}`)
                        }
                        className="text-xs text-celeste-dark hover:text-celeste font-medium transition"
                      >
                        Copiar link
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── 12.1 Video Consultations ─── */}
      {tab === "consultas" && (
        <div className="space-y-4">
          <p className="text-sm text-ink-light">
            Historial de videoconsultas. Desde el navegador, sin descargas. Incluye compartir
            pantalla y grabación de sesión.
          </p>

          {/* Active session card */}
          <div className="bg-celeste-pale border border-celeste-dark/20 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-green-700">SESIÓN ACTIVA</span>
            </div>
            <p className="font-medium text-ink">
              Dra. Fernández con Elena Martínez — Control cardiológico
            </p>
            <p className="text-xs text-ink-light mt-1">Duración: 12:34 - Compartiendo pantalla</p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() =>
                  !isDemo
                    ? showToast("✅ Abrir videoconsulta activa — compartir pantalla")
                    : showDemo("Abrir videoconsulta activa — compartir pantalla")
                }
                className="px-4 py-2 text-xs font-semibold bg-celeste-dark text-white rounded hover:bg-celeste transition"
              >
                Unirse a sesión
              </button>
              <button
                onClick={() =>
                  !isDemo
                    ? showToast("✅ Iniciar grabación de sesión")
                    : showDemo("Iniciar grabación de sesión")
                }
                className="px-4 py-2 text-xs font-semibold border border-celeste-dark text-celeste-dark rounded hover:bg-celeste-pale transition"
              >
                Grabar sesión
              </button>
              <button
                onClick={() =>
                  !isDemo
                    ? showToast("✅ Finalizar videoconsulta activa")
                    : showDemo("Finalizar videoconsulta activa")
                }
                className="px-4 py-2 text-xs font-semibold border border-red-300 text-red-600 rounded hover:bg-red-50 transition"
              >
                Finalizar
              </button>
            </div>
          </div>

          {/* History */}
          <div className="bg-white border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F8FAFB] text-xs text-ink-muted">
                  <th scope="col" className="text-left font-medium px-5 py-3">
                    ID
                  </th>
                  <th scope="col" className="text-left font-medium px-5 py-3">
                    Paciente
                  </th>
                  <th scope="col" className="text-left font-medium px-5 py-3">
                    Doctor
                  </th>
                  <th scope="col" className="text-left font-medium px-5 py-3">
                    Especialidad
                  </th>
                  <th scope="col" className="text-center font-medium px-5 py-3">
                    Fecha
                  </th>
                  <th scope="col" className="text-center font-medium px-5 py-3">
                    Duración
                  </th>
                  <th scope="col" className="text-center font-medium px-5 py-3">
                    Estado
                  </th>
                  <th scope="col" className="text-right font-medium px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {rc.map((c) => (
                  <tr
                    key={c.id}
                    className="border-t border-border-light hover:bg-celeste-pale/30 transition"
                  >
                    <td className="px-5 py-3 text-xs font-mono text-ink-muted">{c.id}</td>
                    <td className="px-5 py-3 font-medium text-ink">{c.patientName}</td>
                    <td className="px-5 py-3 text-ink-light">{c.doctorName}</td>
                    <td className="px-5 py-3 text-ink-light">{c.specialty}</td>
                    <td className="px-5 py-3 text-center text-ink-light">
                      {c.date} {c.time}
                    </td>
                    <td className="px-5 py-3 text-center text-ink">{c.duration}</td>
                    <td className="px-5 py-3 text-center">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          c.status === "Completada"
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() =>
                          !isDemo
                            ? showToast(`✅ Ver detalle de consulta ${c.id}`)
                            : showDemo(`Ver detalle de consulta ${c.id}`)
                        }
                        className="text-xs text-celeste-dark hover:text-celeste font-medium transition"
                      >
                        Ver detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── 12.3 Auto-billing ─── */}
      {tab === "facturacion" && (
        <div className="space-y-4">
          <p className="text-sm text-ink-light">
            Al finalizar una teleconsulta, se genera automáticamente la facturación con el código
            nomenclador correcto.
          </p>

          <div className="bg-white border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F8FAFB] text-xs text-ink-muted">
                  <th scope="col" className="text-left font-medium px-5 py-3">
                    Consulta
                  </th>
                  <th scope="col" className="text-left font-medium px-5 py-3">
                    Paciente
                  </th>
                  <th scope="col" className="text-left font-medium px-5 py-3">
                    Doctor
                  </th>
                  <th scope="col" className="text-center font-medium px-5 py-3">
                    Cód. nomenclador
                  </th>
                  <th scope="col" className="text-center font-medium px-5 py-3">
                    Facturado
                  </th>
                  <th scope="col" className="text-right font-medium px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {rc
                  .filter((c) => c.status === "Completada")
                  .map((c) => (
                    <tr
                      key={c.id}
                      className="border-t border-border-light hover:bg-celeste-pale/30 transition"
                    >
                      <td className="px-5 py-3 text-xs font-mono text-ink-muted">{c.id}</td>
                      <td className="px-5 py-3 font-medium text-ink">{c.patientName}</td>
                      <td className="px-5 py-3 text-ink-light">{c.doctorName}</td>
                      <td className="px-5 py-3 text-center">
                        <span className="text-xs font-mono bg-celeste-pale text-celeste-dark px-2 py-0.5 rounded">
                          {c.billCode}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        {c.billed ? (
                          <span className="text-[10px] font-bold bg-green-50 text-green-700 px-2 py-0.5 rounded">
                            Facturado
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold bg-gold-pale text-gold px-2 py-0.5 rounded">
                            Pendiente
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right">
                        {!c.billed && (
                          <button
                            onClick={() =>
                              !isDemo
                                ? showToast(
                                    `✅ Facturar consulta ${c.id} con código ${c.billCode} al financiador`,
                                  )
                                : showDemo(
                                    `Facturar consulta ${c.id} con código ${c.billCode} al financiador`,
                                  )
                            }
                            className="text-xs text-celeste-dark hover:text-celeste font-medium transition"
                          >
                            Facturar ahora
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <div className="border-l-[3px] border-celeste-dark bg-celeste-pale p-4 text-sm text-ink-light">
            <strong className="text-ink">Facturación automática:</strong> Al cerrar la teleconsulta,
            el sistema detecta la especialidad del médico, asigna el código nomenclador (ej. 420101
            — Consulta médica virtual) y genera el comprobante para el financiador del paciente.
          </div>
        </div>
      )}

      {/* ─── 12.4 Receta Digital → Farmacia ─── */}
      {tab === "recetas" && (
        <div className="space-y-4">
          <p className="text-sm text-ink-light">
            Ciclo completo: teleconsulta → receta digital → farmacia online. Atención remota sin
            salir de casa.
          </p>

          <div className="space-y-3">
            {rc
              .filter((c) => c.status === "Completada")
              .map((c) => (
                <div
                  key={c.id}
                  className="bg-white border border-border rounded-lg p-5 flex flex-col sm:flex-row sm:items-center gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-ink-muted">{c.id}</span>
                      {c.prescriptionSent ? (
                        <span className="text-[10px] font-bold bg-green-50 text-green-700 px-2 py-0.5 rounded">
                          Receta enviada
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold bg-gold-pale text-gold px-2 py-0.5 rounded">
                          Sin receta
                        </span>
                      )}
                    </div>
                    <p className="font-medium text-sm text-ink mt-1">
                      {c.patientName} — {c.specialty}
                    </p>
                    <p className="text-xs text-ink-muted">
                      {c.doctorName} — {c.date} {c.time}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {!c.prescriptionSent && (
                      <button
                        onClick={() =>
                          !isDemo
                            ? showToast(`✅ Generar receta digital para ${c.patientName}`)
                            : showDemo(`Generar receta digital para ${c.patientName}`)
                        }
                        className="px-4 py-2 text-xs font-semibold bg-celeste-dark text-white rounded hover:bg-celeste transition"
                      >
                        Generar receta
                      </button>
                    )}
                    {c.prescriptionSent && (
                      <button
                        onClick={() =>
                          !isDemo
                            ? showToast(
                                `✅ Enviar receta de ${c.patientName} a Farmacia Online con carrito pre-cargado`,
                              )
                            : showDemo(
                                `Enviar receta de ${c.patientName} a Farmacia Online con carrito pre-cargado`,
                              )
                        }
                        className="px-4 py-2 text-xs font-semibold bg-green-600 text-white rounded hover:bg-green-700 transition"
                      >
                        Enviar a Farmacia
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>

          {/* Flow diagram */}
          <div className="bg-white border border-border rounded-lg p-6">
            <h4 className="text-sm font-semibold text-ink mb-4">
              Flujo de atención remota completa
            </h4>
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {[
                { step: "1", label: "Teleconsulta", color: "bg-celeste-dark" },
                { step: "", label: "→", color: "" },
                { step: "2", label: "Receta digital", color: "bg-celeste-dark" },
                { step: "", label: "→", color: "" },
                { step: "3", label: "Farmacia Online", color: "bg-green-600" },
                { step: "", label: "→", color: "" },
                { step: "4", label: "Delivery", color: "bg-gold" },
              ].map((s, i) =>
                s.step ? (
                  <div
                    key={i}
                    className={`${s.color} text-white px-4 py-3 rounded-lg text-center min-w-[120px] shrink-0`}
                  >
                    <p className="text-xs opacity-80">Paso {s.step}</p>
                    <p className="text-sm font-semibold">{s.label}</p>
                  </div>
                ) : (
                  <span key={i} className="text-ink-muted text-lg shrink-0">
                    {s.label}
                  </span>
                ),
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── 12.5 Post-consultation WhatsApp Summary ─── */}
      {tab === "resumen" && (
        <div className="space-y-4">
          <p className="text-sm text-ink-light">
            Resumen post-consulta enviado al paciente via WhatsApp: diagnóstico, indicaciones,
            próximos pasos.
          </p>

          <div className="space-y-3">
            {rc
              .filter((c) => c.status === "Completada")
              .map((c) => (
                <div
                  key={c.id}
                  className="bg-white border border-border rounded-lg p-5 flex flex-col sm:flex-row sm:items-center gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-ink-muted">{c.id}</span>
                      {c.summarySent ? (
                        <span className="text-[10px] font-bold bg-green-50 text-green-700 px-2 py-0.5 rounded">
                          Resumen enviado
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold bg-gold-pale text-gold px-2 py-0.5 rounded">
                          Pendiente
                        </span>
                      )}
                    </div>
                    <p className="font-medium text-sm text-ink mt-1">
                      {c.patientName} — {c.specialty}
                    </p>
                    <p className="text-xs text-ink-muted">
                      {c.doctorName} — {c.date} {c.time} — {c.duration}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {!c.summarySent && (
                      <button
                        onClick={() =>
                          !isDemo
                            ? showToast(
                                `✅ Generar y enviar resumen WhatsApp a ${c.patientName}: diagnóstico, indicaciones, receta, próximo turno`,
                              )
                            : showDemo(
                                `Generar y enviar resumen WhatsApp a ${c.patientName}: diagnóstico, indicaciones, receta, próximo turno`,
                              )
                        }
                        className="px-4 py-2 text-xs font-semibold bg-green-600 text-white rounded hover:bg-green-700 transition"
                      >
                        Enviar por WhatsApp
                      </button>
                    )}
                    <button
                      onClick={() =>
                        !isDemo
                          ? showToast(`✅ Ver resumen completo de ${c.id}`)
                          : showDemo(`Ver resumen completo de ${c.id}`)
                      }
                      className="px-3 py-1.5 text-xs font-medium border border-border text-ink-light rounded hover:border-celeste-dark hover:text-celeste-dark transition"
                    >
                      Ver resumen
                    </button>
                  </div>
                </div>
              ))}
          </div>

          {/* Preview card */}
          <div className="bg-white border border-border rounded-lg p-6 max-w-md">
            <h4 className="text-sm font-semibold text-ink mb-3">Vista previa del mensaje</h4>
            <div className="bg-[#DCF8C6] rounded-lg p-4 text-sm text-ink space-y-2 font-mono">
              <p className="font-bold">Cóndor Salud — Resumen de consulta</p>
              <p>Paciente: Jorge Álvarez</p>
              <p>Médico: Dra. Fernández</p>
              <p>Fecha: 10/03/2026 09:30</p>
              <p className="border-t border-green-400 pt-2 mt-2">
                Diagnóstico: Control cardiológico — Sin novedades
              </p>
              <p>Indicaciones: Continuar tratamiento actual</p>
              <p>Receta: Losartán 50mg (enlace farmacia)</p>
              <p>Próximo turno: 10/04/2026 09:30</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

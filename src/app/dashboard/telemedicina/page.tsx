"use client";

import { useState, useEffect } from "react";
import { Pagination } from "@/components/ui/Pagination";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useDemoAction } from "@/components/DemoModal";
import { useToast } from "@/components/Toast";
import { useLocale } from "@/lib/i18n/context";
import { useIsDemo } from "@/lib/auth/context";
import {
  useWaitingRoom,
  useConsultations,
  useScheduledConsultations,
  useTelemedicinaKPIs,
} from "@/lib/hooks/useModules";

type Tab = "sala" | "consultas" | "facturacion" | "recetas" | "resumen";

export default function TelemedicinPage() {
  const { t } = useLocale();
  const { showDemo } = useDemoAction();
  const { showToast } = useToast();
  const isDemo = useIsDemo();
  const [tab, setTab] = useState<Tab>("sala");
  const [currentPage, setCurrentPage] = useState(1);

  // ─── SWR data hooks ─────────────────────────────────────────
  const { data: waitingRoom = [] } = useWaitingRoom();
  const { data: recentConsultations = [] } = useConsultations();
  const { data: scheduledConsultations = [] } = useScheduledConsultations();
  const { data: kpis } = useTelemedicinaKPIs();

  const tabs: { key: Tab; label: string }[] = [
    { key: "sala", label: t("telemedicine.waitingRoom") },
    { key: "consultas", label: t("telemedicine.consultations") },
    { key: "facturacion", label: t("telemedicine.autoBilling") },
    { key: "recetas", label: t("telemedicine.digitalPrescription") },
    { key: "resumen", label: t("telemedicine.whatsAppSummary") },
  ];

  const kpiCards = [
    {
      label: t("telemedicine.inWaitingRoom"),
      value: kpis ? String(kpis.inWaiting) : "",
      change: kpis ? t("telemedicine.connected") : "",
      color: "text-celeste-dark",
    },
    {
      label: t("telemedicine.consultationsToday"),
      value: kpis ? String(kpis.todayCount) : "",
      change: kpis ? t("telemedicine.completed") : "",
      color: "text-celeste-dark",
    },
    {
      label: t("telemedicine.autoBilled"),
      value: kpis ? String(kpis.billed) : "",
      change: kpis ? t("telemedicine.autoBilling") : "",
      color: "text-green-600",
    },
    {
      label: t("telemedicine.prescriptionsSent"),
      value: kpis ? String(kpis.prescriptionsSent) : "",
      change: kpis ? t("telemedicine.withPharmacy") : "",
      color: "text-gold",
    },
  ];

  const wr = waitingRoom;
  const rc = recentConsultations;
  const sc = scheduledConsultations;

  const PAGE_SIZE = 25;
  const totalPages = Math.ceil(rc.length / PAGE_SIZE);
  const paginatedRc = rc.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => {
    setCurrentPage(1);
  }, [tab]);

  return (
    <div id="main-content" className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">{t("telemedicine.title")}</h1>
          <p className="text-sm text-ink-light mt-1">{t("telemedicine.subtitle")}</p>
        </div>
        <button
          onClick={() =>
            !isDemo
              ? showToast(t("toast.telemed.newCall"))
              : showDemo(t("telemedicine.startNewConsultationDemo"))
          }
          className="px-5 py-2.5 bg-celeste-dark text-white text-sm font-semibold rounded hover:bg-celeste transition"
        >
          + {t("telemedicine.newConsultation")}
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => (
          <div key={kpi.label} className="bg-white border border-border rounded-lg p-5">
            <p className="text-xs text-ink-muted">{kpi.label}</p>
            {!kpis ? (
              <Skeleton className="h-8 w-20 mt-1" />
            ) : (
              <p className={`text-2xl font-display font-bold ${kpi.color} mt-1`}>{kpi.value}</p>
            )}
            <p className="text-xs text-ink-muted mt-1">{kpi.change}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {tabs.map((tabItem) => (
          <button
            key={tabItem.key}
            onClick={() => setTab(tabItem.key)}
            className={`px-4 py-2.5 text-sm font-medium transition border-b-2 -mb-px ${
              tab === tabItem.key
                ? "border-celeste-dark text-celeste-dark"
                : "border-transparent text-ink-muted hover:text-ink"
            }`}
          >
            {tabItem.label}
          </button>
        ))}
      </div>

      {/* ─── 12.2 Virtual Waiting Room ─── */}
      {tab === "sala" && (
        <div className="space-y-4">
          <p className="text-sm text-ink-light">{t("telemedicine.waitingRoomDesc")}</p>

          {wr.length === 0 && (
            <EmptyState
              title={t("telemedicine.noData")}
              description={t("telemedicine.waitingRoomDesc")}
            />
          )}

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
                    <span className="text-[10px] text-ink-muted">
                      {p.age} {t("telemedicine.yearsOld")}
                    </span>
                    <span className="text-[10px] bg-[#F8FAFB] px-2 py-0.5 rounded text-ink-muted">
                      {p.financiador}
                    </span>
                  </div>
                  <p className="text-xs text-ink-light mt-0.5">{p.reason}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] text-ink-muted">
                      {t("telemedicine.joined")}: {p.joinedAt} - {t("telemedicine.waiting")}:{" "}
                      {p.waitTime}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        p.intakeComplete ? "bg-green-50 text-green-700" : "bg-gold-pale text-gold"
                      }`}
                    >
                      {p.intakeComplete
                        ? t("telemedicine.intakeComplete")
                        : t("telemedicine.intakePending")}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  {!p.intakeComplete && (
                    <button
                      onClick={() =>
                        !isDemo
                          ? showToast(
                              t("telemedicine.sendIntakeDemo").replace("{name}", p.patientName),
                            )
                          : showDemo(
                              t("telemedicine.sendIntakeDemo").replace("{name}", p.patientName),
                            )
                      }
                      className="px-3 py-1.5 text-xs font-medium border border-border text-ink-light rounded hover:border-gold hover:text-gold transition"
                    >
                      {t("telemedicine.sendIntake")}
                    </button>
                  )}
                  <button
                    onClick={() =>
                      !isDemo
                        ? showToast(
                            t("telemedicine.startVideoDemo").replace("{name}", p.patientName),
                          )
                        : showDemo(
                            t("telemedicine.startVideoDemo").replace("{name}", p.patientName),
                          )
                    }
                    className="px-4 py-2 text-xs font-semibold bg-celeste-dark text-white rounded hover:bg-celeste transition"
                  >
                    {t("telemedicine.startVideo")}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Upcoming */}
          <h3 className="text-sm font-semibold text-ink mt-6">
            {t("telemedicine.upcomingScheduled")}
          </h3>
          <div className="bg-white border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F8FAFB] text-xs text-ink-muted">
                  <th scope="col" className="text-left font-medium px-5 py-3">
                    {t("label.patient")}
                  </th>
                  <th scope="col" className="text-left font-medium px-5 py-3">
                    {t("telemedicine.doctor")}
                  </th>
                  <th scope="col" className="text-left font-medium px-5 py-3">
                    {t("telemedicine.specialty")}
                  </th>
                  <th scope="col" className="text-center font-medium px-5 py-3">
                    {t("label.time")}
                  </th>
                  <th scope="col" className="text-center font-medium px-5 py-3">
                    {t("billing.insurer")}
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
                            ? showToast(
                                t("telemedicine.copyLinkDemo").replace(
                                  "{url}",
                                  c.videoRoomUrl ?? c.code,
                                ),
                              )
                            : showDemo(
                                t("telemedicine.copyLinkDemo").replace(
                                  "{url}",
                                  c.videoRoomUrl ?? c.code,
                                ),
                              )
                        }
                        className="text-xs text-celeste-dark hover:text-celeste font-medium transition"
                      >
                        {t("telemedicine.copyLink")}
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
          <p className="text-sm text-ink-light">{t("telemedicine.consultationsDesc")}</p>

          {/* Active session card */}
          <div className="bg-celeste-pale border border-celeste-dark/20 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-green-700">
                {t("telemedicine.activeSession")}
              </span>
            </div>
            <p className="font-medium text-ink">{t("telemedicine.activeSessionDemoText")}</p>
            <p className="text-xs text-ink-light mt-1">
              {t("telemedicine.activeSessionDemoDetail")}
            </p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() =>
                  !isDemo
                    ? showToast(t("toast.telemed.shareScreen"))
                    : showDemo(t("telemedicine.openActiveVideoDemo"))
                }
                className="px-4 py-2 text-xs font-semibold bg-celeste-dark text-white rounded hover:bg-celeste transition"
              >
                {t("telemedicine.joinSession")}
              </button>
              <button
                onClick={() =>
                  !isDemo
                    ? showToast(t("toast.telemed.startRecording"))
                    : showDemo(t("telemedicine.startRecordingDemo"))
                }
                className="px-4 py-2 text-xs font-semibold border border-celeste-dark text-celeste-dark rounded hover:bg-celeste-pale transition"
              >
                {t("telemedicine.recordSession")}
              </button>
              <button
                onClick={() =>
                  !isDemo
                    ? showToast(t("toast.telemed.endCall"))
                    : showDemo(t("telemedicine.endActiveVideoDemo"))
                }
                className="px-4 py-2 text-xs font-semibold border border-red-300 text-red-600 rounded hover:bg-red-50 transition"
              >
                {t("telemedicine.endSession")}
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
                    {t("label.patient")}
                  </th>
                  <th scope="col" className="text-left font-medium px-5 py-3">
                    {t("label.doctor")}
                  </th>
                  <th scope="col" className="text-left font-medium px-5 py-3">
                    {t("label.specialty")}
                  </th>
                  <th scope="col" className="text-center font-medium px-5 py-3">
                    {t("label.date")}
                  </th>
                  <th scope="col" className="text-center font-medium px-5 py-3">
                    {t("label.duration")}
                  </th>
                  <th scope="col" className="text-center font-medium px-5 py-3">
                    {t("label.status")}
                  </th>
                  <th scope="col" className="text-right font-medium px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {paginatedRc.map((c) => (
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
                            ? showToast(
                                t("telemedicine.viewConsultationDetailDemo").replace("{id}", c.id),
                              )
                            : showDemo(
                                t("telemedicine.viewConsultationDetailDemo").replace("{id}", c.id),
                              )
                        }
                        className="text-xs text-celeste-dark hover:text-celeste font-medium transition"
                      >
                        {t("dashboard.viewDetail")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* ─── 12.3 Auto-billing ─── */}
      {tab === "facturacion" && (
        <div className="space-y-4">
          <p className="text-sm text-ink-light">{t("telemedicine.autoBillingDesc")}</p>

          <div className="bg-white border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F8FAFB] text-xs text-ink-muted">
                  <th scope="col" className="text-left font-medium px-5 py-3">
                    {t("telemedicine.consultationHeader")}
                  </th>
                  <th scope="col" className="text-left font-medium px-5 py-3">
                    {t("label.patient")}
                  </th>
                  <th scope="col" className="text-left font-medium px-5 py-3">
                    {t("label.doctor")}
                  </th>
                  <th scope="col" className="text-center font-medium px-5 py-3">
                    {t("telemedicine.nomenclatorCode")}
                  </th>
                  <th scope="col" className="text-center font-medium px-5 py-3">
                    {t("telemedicine.billedHeader")}
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
                            {t("dashboard.billed")}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold bg-gold-pale text-gold px-2 py-0.5 rounded">
                            {t("status.pending")}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right">
                        {!c.billed && (
                          <button
                            onClick={() =>
                              !isDemo
                                ? showToast(
                                    t("telemedicine.billConsultationDemo")
                                      .replace("{id}", c.id)
                                      .replace("{code}", c.billCode ?? ""),
                                  )
                                : showDemo(
                                    t("telemedicine.billConsultationDemo")
                                      .replace("{id}", c.id)
                                      .replace("{code}", c.billCode ?? ""),
                                  )
                            }
                            className="text-xs text-celeste-dark hover:text-celeste font-medium transition"
                          >
                            {t("telemedicine.billNow")}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <div className="border-l-[3px] border-celeste-dark bg-celeste-pale p-4 text-sm text-ink-light">
            <strong className="text-ink">{t("telemedicine.autoBilling")}:</strong>{" "}
            {t("telemedicine.autoBillingNote")}
          </div>
        </div>
      )}

      {/* ─── 12.4 Receta Digital → Farmacia ─── */}
      {tab === "recetas" && (
        <div className="space-y-4">
          <p className="text-sm text-ink-light">{t("telemedicine.prescriptionDesc")}</p>

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
                          {t("telemedicine.prescriptionSent")}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold bg-gold-pale text-gold px-2 py-0.5 rounded">
                          {t("telemedicine.noPrescription")}
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
                            ? showToast(
                                t("telemedicine.generatePrescriptionDemo").replace(
                                  "{name}",
                                  c.patientName,
                                ),
                              )
                            : showDemo(
                                t("telemedicine.generatePrescriptionDemo").replace(
                                  "{name}",
                                  c.patientName,
                                ),
                              )
                        }
                        className="px-4 py-2 text-xs font-semibold bg-celeste-dark text-white rounded hover:bg-celeste transition"
                      >
                        {t("telemedicine.generatePrescription")}
                      </button>
                    )}
                    {c.prescriptionSent && (
                      <button
                        onClick={() =>
                          !isDemo
                            ? showToast(
                                t("telemedicine.sendToPharmacyDemo").replace(
                                  "{name}",
                                  c.patientName,
                                ),
                              )
                            : showDemo(
                                t("telemedicine.sendToPharmacyDemo").replace(
                                  "{name}",
                                  c.patientName,
                                ),
                              )
                        }
                        className="px-4 py-2 text-xs font-semibold bg-green-600 text-white rounded hover:bg-green-700 transition"
                      >
                        {t("telemedicine.sendToPharmacy")}
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>

          {/* Flow diagram */}
          <div className="bg-white border border-border rounded-lg p-6">
            <h4 className="text-sm font-semibold text-ink mb-4">
              {t("telemedicine.remoteFlowTitle")}
            </h4>
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {[
                { step: "1", label: t("telemedicine.teleconsultation"), color: "bg-celeste-dark" },
                { step: "", label: "→", color: "" },
                {
                  step: "2",
                  label: t("telemedicine.digitalPrescription"),
                  color: "bg-celeste-dark",
                },
                { step: "", label: "→", color: "" },
                { step: "3", label: t("telemedicine.onlinePharmacy"), color: "bg-green-600" },
                { step: "", label: "→", color: "" },
                { step: "4", label: "Delivery", color: "bg-gold" },
              ].map((s, i) =>
                s.step ? (
                  <div
                    key={i}
                    className={`${s.color} text-white px-4 py-3 rounded-lg text-center min-w-[120px] shrink-0`}
                  >
                    <p className="text-xs opacity-80">
                      {t("telemedicine.step")} {s.step}
                    </p>
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
          <p className="text-sm text-ink-light">{t("telemedicine.whatsAppSummaryDesc")}</p>

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
                          {t("telemedicine.summarySent")}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold bg-gold-pale text-gold px-2 py-0.5 rounded">
                          {t("status.pending")}
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
                                t("telemedicine.generateWhatsAppDemo").replace(
                                  "{name}",
                                  c.patientName,
                                ),
                              )
                            : showDemo(
                                t("telemedicine.generateWhatsAppDemo").replace(
                                  "{name}",
                                  c.patientName,
                                ),
                              )
                        }
                        className="px-4 py-2 text-xs font-semibold bg-green-600 text-white rounded hover:bg-green-700 transition"
                      >
                        {t("telemedicine.sendViaWhatsApp")}
                      </button>
                    )}
                    <button
                      onClick={() =>
                        !isDemo
                          ? showToast(t("telemedicine.viewFullSummaryDemo").replace("{id}", c.id))
                          : showDemo(t("telemedicine.viewFullSummaryDemo").replace("{id}", c.id))
                      }
                      className="px-3 py-1.5 text-xs font-medium border border-border text-ink-light rounded hover:border-celeste-dark hover:text-celeste-dark transition"
                    >
                      {t("telemedicine.viewSummary")}
                    </button>
                  </div>
                </div>
              ))}
          </div>

          {/* Preview card */}
          <div className="bg-white border border-border rounded-lg p-6 max-w-md">
            <h4 className="text-sm font-semibold text-ink mb-3">
              {t("telemedicine.previewTitle")}
            </h4>
            <div className="bg-[#DCF8C6] rounded-lg p-4 text-sm text-ink space-y-2 font-mono">
              <p className="font-bold">{t("telemedicine.whatsAppPreviewHeader")}</p>
              <p>{t("telemedicine.whatsAppPreviewPatient")}</p>
              <p>{t("telemedicine.whatsAppPreviewDoctor")}</p>
              <p>{t("telemedicine.whatsAppPreviewDate")}</p>
              <p className="border-t border-green-400 pt-2 mt-2">
                {t("telemedicine.whatsAppPreviewDiagnosis")}
              </p>
              <p>{t("telemedicine.whatsAppPreviewInstructions")}</p>
              <p>{t("telemedicine.whatsAppPreviewPrescription")}</p>
              <p>{t("telemedicine.whatsAppPreviewNextAppt")}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

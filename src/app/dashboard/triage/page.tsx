"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { Pagination } from "@/components/ui/Pagination";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useDemoAction } from "@/components/DemoModal";
import { useToast } from "@/components/Toast";
import { useIsDemo } from "@/lib/auth/context";
import { useLocale } from "@/lib/i18n/context";
import { useTriages, useTriageKPIs } from "@/lib/hooks/useModules";
import { usePacientes } from "@/hooks/use-data";
import {
  bodySystems,
  severityLabels,
  frequencyOptions,
  symptomToSpecialty,
  icd10Codes,
} from "@/lib/services/triage";

type Tab = "sintomas" | "detalle" | "notas" | "intake" | "clinicas" | "routing";

export default function TriagePage() {
  const { showDemo } = useDemoAction();
  const { showToast } = useToast();
  const { t } = useLocale();
  const isDemo = useIsDemo();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("sintomas");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [severity, setSeverity] = useState(5);
  const [frequency, setFrequency] = useState("Primera vez");
  const [duration, setDuration] = useState("");
  const [triggers, setTriggers] = useState("");
  const [freeNotes, setFreeNotes] = useState("");
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [selectedICD, setSelectedICD] = useState<string[]>([]);
  const [treatmentPlan, setTreatmentPlan] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // ─── Patient selector ───────────────────────────────────────
  const [patientSearch, setPatientSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<{
    id: string;
    nombre: string;
    apellido: string;
    dni: string;
    financiador: string;
    plan?: string;
    edad?: number;
    telefono?: string;
    email?: string;
  } | null>(null);
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const patientInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: pacientes = [] } = usePacientes();
  const filteredPacientes = useMemo(() => {
    if (!patientSearch || patientSearch.length < 2) return [];
    const q = patientSearch.toLowerCase();
    return pacientes
      .filter(
        (p: any) =>
          `${p.nombre} ${p.apellido}`.toLowerCase().includes(q) ||
          (p.dni && p.dni.toLowerCase().includes(q)),
      )
      .slice(0, 8);
  }, [pacientes, patientSearch]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        patientInputRef.current &&
        !patientInputRef.current.contains(e.target as Node)
      ) {
        setShowPatientDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const patientDisplayName = selectedPatient
    ? `${selectedPatient.nombre} ${selectedPatient.apellido}`
    : "Paciente";

  // ─── SWR data hooks ─────────────────────────────────────────
  const { data: triages = [] } = useTriages();
  const { data: kpis } = useTriageKPIs();

  const intakeHistory = triages.map((tr) => ({
    id: tr.code || tr.id,
    patient: tr.patientName,
    date: tr.date,
    symptoms: tr.symptoms || [],
    severity: tr.severity,
    routedTo: tr.routedSpecialty
      ? `${tr.routedSpecialty}${tr.routedDoctor ? ` — ${tr.routedDoctor}` : ""}`
      : t("label.pending"),
    status: tr.status,
  }));

  const PAGE_SIZE = 25;
  const totalPages = Math.ceil(intakeHistory.length / PAGE_SIZE);
  const paginatedIntake = intakeHistory.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [tab]);

  const tabs: { key: Tab; label: string }[] = [
    { key: "sintomas", label: t("triage.symptoms") },
    { key: "detalle", label: t("triage.detail") },
    { key: "notas", label: t("triage.patientNotesTab") },
    { key: "intake", label: t("triage.medicalIntake") },
    { key: "clinicas", label: t("triage.clinicalNotes") },
    { key: "routing", label: t("triage.routing") },
  ];

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom],
    );
  };

  const toggleICD = (code: string) => {
    setSelectedICD((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    );
  };

  const routedSpecialties = Array.from(
    new Set(selectedSymptoms.map((s) => symptomToSpecialty[s]).filter(Boolean)),
  );

  const statusLabels: Record<string, string> = {
    Completado: t("triage.statusCompleted"),
    Pendiente: t("label.pending"),
  };

  const kpiCards = [
    {
      label: t("triage.todayCount"),
      value: kpis ? String(kpis.todayCount) : "",
      change: kpis ? t("triage.registered") : "",
      color: "text-celeste-dark",
    },
    {
      label: t("triage.waiting"),
      value: kpis ? String(kpis.pending) : "",
      change: kpis ? t("triage.pendingCount") : "",
      color: "text-gold",
    },
    {
      label: t("triage.referred"),
      value: kpis ? String(kpis.routed) : "",
      change: kpis ? t("triage.withSpecialty") : "",
      color: "text-celeste-dark",
    },
    {
      label: t("triage.highSeverity"),
      value: kpis ? String(kpis.highSeverity) : "",
      change: kpis ? t("triage.severityGte7") : "",
      color: "text-green-600",
    },
  ];

  return (
    <div id="main-content" className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">{t("triage.title")}</h1>
          <p className="text-sm text-ink-light mt-1">{t("triage.triageSubtitle")}</p>
        </div>
        <button
          onClick={async () => {
            if (isDemo) {
              showDemo(t("triage.newTriageDemo"));
              return;
            }
            setSelectedSymptoms([]);
            setSeverity(5);
            setFrequency("Primera vez");
            setDuration("");
            setTriggers("");
            setFreeNotes("");
            setClinicalNotes("");
            setSelectedICD([]);
            setTreatmentPlan("");
            setSelectedPatient(null);
            setPatientSearch("");
            setTab("sintomas");
            showToast(t("toast.triage.newTriage"), "success");
          }}
          className="px-5 py-2.5 bg-celeste-dark text-white text-sm font-semibold rounded hover:bg-celeste transition"
        >
          {t("triage.newTriage")}
        </button>
      </div>

      {/* ─── Patient Selector ─── */}
      <div className="bg-white border border-border rounded-lg p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 relative">
            <label className="text-xs font-bold text-ink-muted uppercase tracking-wider block mb-1.5">
              {t("triage.selectPatient") ?? "Paciente para Triaje"}
            </label>
            {selectedPatient ? (
              <div className="flex items-center gap-3 bg-celeste-pale/30 border border-celeste-dark/20 rounded-lg p-3">
                <div className="w-9 h-9 bg-celeste-dark text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {selectedPatient.nombre[0]}
                  {selectedPatient.apellido[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink">
                    {selectedPatient.apellido}, {selectedPatient.nombre}
                  </p>
                  <p className="text-[10px] text-ink-muted">
                    DNI {selectedPatient.dni} · {selectedPatient.financiador}
                    {selectedPatient.edad ? ` · ${selectedPatient.edad} años` : ""}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedPatient(null);
                    setPatientSearch("");
                  }}
                  className="text-xs text-ink-muted hover:text-red-500 transition font-medium px-2 py-1 rounded hover:bg-red-50"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="relative">
                <input
                  ref={patientInputRef}
                  type="text"
                  placeholder={
                    t("triage.searchPatientPlaceholder") ?? "Buscar paciente por nombre o DNI..."
                  }
                  value={patientSearch}
                  onChange={(e) => {
                    setPatientSearch(e.target.value);
                    setShowPatientDropdown(true);
                  }}
                  onFocus={() => setShowPatientDropdown(true)}
                  className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-celeste-dark focus:ring-2 focus:ring-celeste-dark/30"
                />
                {showPatientDropdown && filteredPacientes.length > 0 && (
                  <div
                    ref={dropdownRef}
                    className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto"
                  >
                    {filteredPacientes.map((p: any) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setSelectedPatient({
                            id: p.id,
                            nombre: p.nombre,
                            apellido: p.apellido,
                            dni: p.dni || "",
                            financiador: p.financiador || "Particular",
                            plan: p.plan,
                            edad: p.edad,
                            telefono: p.telefono,
                            email: p.email,
                          });
                          setPatientSearch("");
                          setShowPatientDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-celeste-pale/30 transition flex items-center gap-3"
                      >
                        <div className="w-7 h-7 bg-surface text-ink-muted rounded-full flex items-center justify-center text-[10px] font-bold">
                          {p.nombre?.[0] ?? ""}
                          {p.apellido?.[0] ?? ""}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-ink">
                            {p.apellido}, {p.nombre}
                          </p>
                          <p className="text-[10px] text-ink-muted">
                            DNI {p.dni} · {p.financiador || "Particular"}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Selected patient detail card */}
          {selectedPatient && (
            <div className="grid grid-cols-2 gap-3 sm:w-80">
              <div className="bg-surface rounded-lg p-2.5">
                <p className="text-[9px] font-bold text-ink-muted uppercase">Obra Social</p>
                <p className="text-xs font-semibold text-ink mt-0.5">
                  {selectedPatient.financiador}
                </p>
                {selectedPatient.plan && (
                  <p className="text-[9px] text-ink-muted">Plan: {selectedPatient.plan}</p>
                )}
              </div>
              <div className="bg-surface rounded-lg p-2.5">
                <p className="text-[9px] font-bold text-ink-muted uppercase">Contacto</p>
                <p className="text-[10px] text-ink mt-0.5">{selectedPatient.telefono || "—"}</p>
                {selectedPatient.email && (
                  <p className="text-[9px] text-ink-muted truncate">{selectedPatient.email}</p>
                )}
              </div>
            </div>
          )}
        </div>
        {!selectedPatient && (
          <p className="text-[10px] text-amber-600 mt-2 flex items-center gap-1">
            <span>⚠</span>{" "}
            {t("triage.selectPatientWarning") ??
              "Seleccioná un paciente para vincular este triaje a su historial clínico"}
          </p>
        )}
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
      <div className="flex gap-1 border-b border-border overflow-x-auto" role="tablist">
        {tabs.map((tb) => (
          <button
            key={tb.key}
            role="tab"
            aria-selected={tab === tb.key}
            onClick={() => setTab(tb.key)}
            className={`px-4 py-2.5 text-sm font-medium transition border-b-2 -mb-px whitespace-nowrap ${
              tab === tb.key
                ? "border-celeste-dark text-celeste-dark"
                : "border-transparent text-ink-muted hover:text-ink"
            }`}
          >
            {tb.label}
          </button>
        ))}
      </div>

      {/* ─── 14.1 Symptom Dropdown by Body System ─── */}
      {tab === "sintomas" && (
        <div className="space-y-4">
          <p className="text-sm text-ink-light">{t("triage.symptomsDesc")}</p>

          {selectedSymptoms.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedSymptoms.map((s) => (
                <span
                  key={s}
                  className="text-xs bg-celeste-pale text-celeste-dark px-3 py-1 rounded flex items-center gap-1.5"
                >
                  {s}
                  <button
                    onClick={() => toggleSymptom(s)}
                    className="hover:text-red-500 transition font-bold"
                  >
                    x
                  </button>
                </span>
              ))}
              <button
                onClick={() => setSelectedSymptoms([])}
                className="text-xs text-ink-muted hover:text-red-500 transition"
              >
                {t("triage.clearAll")}
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(bodySystems).map(([system, symptoms]) => (
              <div key={system} className="bg-white border border-border rounded-lg p-4">
                <h4 className="text-xs font-semibold text-ink mb-2">{system}</h4>
                <div className="space-y-1">
                  {symptoms.map((symptom) => (
                    <label
                      key={symptom}
                      className="flex items-center gap-2 py-1 px-2 rounded hover:bg-celeste-pale/30 transition cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedSymptoms.includes(symptom)}
                        onChange={() => toggleSymptom(symptom)}
                        className="rounded border-border text-celeste-dark focus:ring-celeste-dark"
                      />
                      <span className="text-xs text-ink-light">{symptom}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {selectedSymptoms.length > 0 && (
            <button
              onClick={() => setTab("detalle")}
              className="px-5 py-2.5 bg-celeste-dark text-white text-sm font-semibold rounded hover:bg-celeste transition"
            >
              {t("triage.continueWithSymptoms")} ({selectedSymptoms.length}{" "}
              {t("triage.symptomsLower")})
            </button>
          )}
        </div>
      )}

      {/* ─── 14.2 Symptom Detail Fields ─── */}
      {tab === "detalle" && (
        <div className="space-y-4">
          <p className="text-sm text-ink-light">{t("triage.detailDesc")}</p>

          {selectedSymptoms.length === 0 && (
            <div className="bg-gold-pale border border-gold/30 rounded-lg p-4 text-sm text-ink-light">
              {t("triage.selectSymptomsFirst")}
            </div>
          )}

          {selectedSymptoms.length > 0 && (
            <div className="bg-white border border-border rounded-lg p-6 space-y-5">
              <div className="flex flex-wrap gap-1.5 mb-2">
                {selectedSymptoms.map((s) => (
                  <span
                    key={s}
                    className="text-[11px] bg-celeste-pale text-celeste-dark px-2 py-0.5 rounded"
                  >
                    {s}
                  </span>
                ))}
              </div>

              {/* Duration */}
              <div>
                <label className="text-xs text-ink-muted block mb-1">
                  {t("triage.durationLabel")}
                </label>
                <input
                  type="text"
                  placeholder={t("triage.durationPlaceholder")}
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-4 py-2.5 border border-border rounded text-sm focus:outline-none focus:border-celeste-dark focus:ring-2 focus:ring-celeste-dark/30"
                />
              </div>

              {/* Severity */}
              <div>
                <label className="text-xs text-ink-muted block mb-1">
                  {t("triage.severityLabel")}{" "}
                  <span className="font-bold text-ink">{severity}/10</span>{" "}
                  <span className="text-celeste-dark">({severityLabels[severity]})</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={severity}
                  onChange={(e) => setSeverity(Number(e.target.value))}
                  aria-label={`${t("triage.severityLabel")} ${severity}/10`}
                  className="w-full accent-celeste-dark"
                />
                <div className="flex justify-between text-[10px] text-ink-muted">
                  <span>1</span>
                  <span>5</span>
                  <span>10</span>
                </div>
              </div>

              {/* Frequency */}
              <div>
                <label className="text-xs text-ink-muted block mb-1">
                  {t("triage.frequencyLabel")}
                </label>
                <div className="flex flex-wrap gap-2">
                  {frequencyOptions.map((f) => (
                    <button
                      key={f}
                      onClick={() => setFrequency(f)}
                      className={`px-3 py-1.5 text-xs rounded transition ${
                        frequency === f
                          ? "bg-celeste-dark text-white"
                          : "bg-surface border border-border text-ink-light hover:border-celeste-dark hover:text-celeste-dark"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Triggers */}
              <div>
                <label className="text-xs text-ink-muted block mb-1">
                  {t("triage.triggersLabel")}
                </label>
                <input
                  type="text"
                  placeholder={t("triage.triggersPlaceholder")}
                  value={triggers}
                  onChange={(e) => setTriggers(e.target.value)}
                  className="w-full px-4 py-2.5 border border-border rounded text-sm focus:outline-none focus:border-celeste-dark focus:ring-2 focus:ring-celeste-dark/30"
                />
              </div>

              <button
                onClick={async () => {
                  if (isDemo) {
                    showDemo(
                      `${t("triage.saveDetail")}: ${selectedSymptoms.join(", ")} — ${t("triage.severity")} ${severity}/10, ${frequency}, ${t("triage.durationLabel")}: ${duration || "N/A"}`,
                    );
                    return;
                  }
                  try {
                    const res = await fetch("/api/triage", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        action: "create-triage",
                        data: {
                          patientId: selectedPatient?.id ?? null,
                          patientName: patientDisplayName,
                          symptoms: selectedSymptoms,
                          severity,
                          frequency,
                          duration: duration || "",
                          triggers: triggers || "",
                          freeNotes: freeNotes || "",
                        },
                      }),
                    });
                    if (res.ok) {
                      showToast(t("triage.saveDetail"), "success");
                    } else {
                      showToast("Error al guardar", "error");
                    }
                  } catch {
                    showToast("Error de conexión", "error");
                  }
                }}
                className="px-5 py-2.5 bg-celeste-dark text-white text-sm font-semibold rounded hover:bg-celeste transition"
              >
                {t("triage.saveDetail")}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ─── 14.3 Free-text Notes + Photos ─── */}
      {tab === "notas" && (
        <div className="space-y-4">
          <p className="text-sm text-ink-light">{t("triage.notesDesc")}</p>

          <div className="bg-white border border-border rounded-lg p-6 space-y-4">
            <div>
              <label className="text-xs text-ink-muted block mb-1">
                {t("triage.patientNotes")}
              </label>
              <textarea
                placeholder={t("triage.patientNotesPlaceholder")}
                value={freeNotes}
                onChange={(e) => setFreeNotes(e.target.value)}
                rows={6}
                className="w-full px-4 py-3 border border-border rounded text-sm focus:outline-none focus:border-celeste-dark focus:ring-2 focus:ring-celeste-dark/30 resize-y"
              />
            </div>

            <div>
              <label className="text-xs text-ink-muted block mb-1">
                {t("triage.attachPhotos")}
              </label>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <p className="text-sm text-ink-muted">{t("triage.dragPhotos")}</p>
                <p className="text-xs text-ink-muted mt-1">
                  {t("triage.photoFormat")}. {t("triage.photoExamples")}
                </p>
                <button
                  onClick={() => {
                    if (isDemo) {
                      showDemo(t("triage.attachPhotosDemo"));
                      return;
                    }
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "image/*";
                    input.multiple = true;
                    input.onchange = () => {
                      const count = input.files?.length ?? 0;
                      if (count > 0) showToast(`${count} archivo(s) seleccionado(s)`, "success");
                    };
                    input.click();
                  }}
                  className="mt-3 px-4 py-2 text-xs font-medium border border-border text-ink-light rounded hover:border-celeste-dark hover:text-celeste-dark transition"
                >
                  {t("triage.selectFiles")}
                </button>
              </div>
            </div>

            <button
              onClick={async () => {
                if (isDemo) {
                  showDemo(
                    `${t("triage.saveNotes")}: ${freeNotes.substring(0, 50) || t("triage.noNotes")}...`,
                  );
                  return;
                }
                try {
                  const res = await fetch("/api/triage", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      action: "save-clinical-note",
                      data: {
                        patientId: selectedPatient?.id ?? null,
                        doctorName: "",
                        patientName: patientDisplayName,
                        icd10Codes: [],
                        notes: freeNotes,
                        treatmentPlan: "",
                        referrals: [],
                      },
                    }),
                  });
                  if (res.ok) {
                    showToast(t("triage.saveNotes"), "success");
                  } else {
                    showToast("Error al guardar notas", "error");
                  }
                } catch {
                  showToast("Error de conexión", "error");
                }
              }}
              className="px-5 py-2.5 bg-celeste-dark text-white text-sm font-semibold rounded hover:bg-celeste transition"
            >
              {t("triage.saveNotes")}
            </button>
          </div>
        </div>
      )}

      {/* ─── 14.4 Doctor-Facing Intake Summary ─── */}
      {tab === "intake" && (
        <div className="space-y-4">
          <p className="text-sm text-ink-light">{t("triage.intakeDesc")}</p>

          {/* Current intake preview */}
          <div className="bg-white border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-ink">{t("triage.intakeView")}</h3>
              <span className="text-[10px] font-bold bg-celeste-pale text-celeste-dark px-2.5 py-1 rounded">
                {t("triage.preConsultation")}
              </span>
            </div>

            {/* Patient info banner */}
            {selectedPatient ? (
              <div className="flex items-center gap-3 bg-celeste-pale/20 border border-celeste-dark/10 rounded-lg p-3 mb-4">
                <div className="w-10 h-10 bg-celeste-dark text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {selectedPatient.nombre[0]}
                  {selectedPatient.apellido[0]}
                </div>
                <div>
                  <p className="text-sm font-bold text-ink">
                    {selectedPatient.apellido}, {selectedPatient.nombre}
                  </p>
                  <p className="text-[10px] text-ink-muted">
                    DNI {selectedPatient.dni} · {selectedPatient.financiador}
                    {selectedPatient.plan && selectedPatient.plan !== "—"
                      ? ` — Plan ${selectedPatient.plan}`
                      : ""}
                    {selectedPatient.edad ? ` · ${selectedPatient.edad} años` : ""}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-xs text-amber-700">
                ⚠{" "}
                {t("triage.noPatientSelected") ??
                  "Ningún paciente seleccionado. Seleccioná un paciente arriba para vincular este triaje."}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <p className="text-[10px] text-ink-muted mb-1">{t("triage.reportedSymptoms")}</p>
                {selectedSymptoms.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedSymptoms.map((s) => (
                      <span
                        key={s}
                        className="text-[11px] bg-celeste-pale text-celeste-dark px-2 py-0.5 rounded"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-ink-muted italic">{t("triage.noSymptoms")}</p>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-[10px] text-ink-muted">{t("triage.severity")}</p>
                  <p
                    className={`text-sm font-bold ${severity >= 7 ? "text-red-600" : severity >= 4 ? "text-gold" : "text-green-600"}`}
                  >
                    {severity}/10
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-ink-muted">{t("triage.frequencyLabel")}</p>
                  <p className="text-sm font-medium text-ink">{frequency}</p>
                </div>
                <div>
                  <p className="text-[10px] text-ink-muted">{t("triage.durationLabel")}</p>
                  <p className="text-sm font-medium text-ink">{duration || "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-ink-muted">{t("triage.triggersShort")}</p>
                  <p className="text-sm font-medium text-ink">{triggers || "—"}</p>
                </div>
              </div>

              {freeNotes && (
                <div>
                  <p className="text-[10px] text-ink-muted mb-1">{t("triage.patientNotesTitle")}</p>
                  <div className="bg-surface rounded p-3 text-xs text-ink-light">{freeNotes}</div>
                </div>
              )}
            </div>
          </div>

          {/* Intake history */}
          <h3 className="text-sm font-semibold text-ink">{t("triage.intakeHistory")}</h3>

          {intakeHistory.length === 0 && (
            <EmptyState
              title={t("common.noData") ?? "Sin datos"}
              description={t("common.noDataDescription") ?? "No hay datos para mostrar."}
            />
          )}

          <div className="bg-white border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm" aria-label="Triaje de pacientes">
              <thead>
                <tr className="bg-surface text-xs text-ink-muted">
                  <th scope="col" className="text-left font-medium px-5 py-3">
                    ID
                  </th>
                  <th scope="col" className="text-left font-medium px-5 py-3">
                    {t("label.patient")}
                  </th>
                  <th scope="col" className="text-left font-medium px-5 py-3">
                    {t("triage.symptoms")}
                  </th>
                  <th scope="col" className="text-center font-medium px-5 py-3">
                    {t("triage.severity")}
                  </th>
                  <th scope="col" className="text-left font-medium px-5 py-3">
                    {t("triage.routedTo")}
                  </th>
                  <th scope="col" className="text-center font-medium px-5 py-3">
                    {t("label.status")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedIntake.map((h) => (
                  <tr
                    key={h.id}
                    className="border-t border-border-light hover:bg-celeste-pale/30 transition"
                  >
                    <td className="px-5 py-3 text-xs font-mono text-ink-muted">{h.id}</td>
                    <td className="px-5 py-3 font-medium text-ink">{h.patient}</td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(h.symptoms || []).map((s: string) => (
                          <span
                            key={s}
                            className="text-[10px] bg-surface px-1.5 py-0.5 rounded text-ink-light"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span
                        className={`text-xs font-bold ${h.severity >= 7 ? "text-red-600" : h.severity >= 4 ? "text-gold" : "text-green-600"}`}
                      >
                        {h.severity}/10
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-ink-light">{h.routedTo}</td>
                    <td className="px-5 py-3 text-center">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          h.status === "Completado"
                            ? "bg-green-50 text-green-700"
                            : "bg-celeste-pale text-celeste-dark"
                        }`}
                      >
                        {statusLabels[h.status] ?? h.status}
                      </span>
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

      {/* ─── 14.5 Doctor Clinical Notes ─── */}
      {tab === "clinicas" && (
        <div className="space-y-4">
          <p className="text-sm text-ink-light">{t("triage.clinicalNotesDesc")}</p>

          <div className="bg-white border border-border rounded-lg p-6 space-y-5">
            {/* ICD-10 selector */}
            <div>
              <label className="text-xs text-ink-muted block mb-2">
                {t("triage.diagnosisIcd10")}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {icd10Codes.map((icd) => (
                  <label
                    key={icd.code}
                    className={`flex items-center gap-2 py-2 px-3 rounded border transition cursor-pointer ${
                      selectedICD.includes(icd.code)
                        ? "border-celeste-dark bg-celeste-pale"
                        : "border-border hover:border-celeste-dark/30"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedICD.includes(icd.code)}
                      onChange={() => toggleICD(icd.code)}
                      className="rounded border-border text-celeste-dark focus:ring-celeste-dark"
                    />
                    <span className="text-xs font-mono text-celeste-dark font-medium">
                      {icd.code}
                    </span>
                    <span className="text-xs text-ink-light">{icd.description}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Clinical notes */}
            <div>
              <label className="text-xs text-ink-muted block mb-1">
                {t("triage.clinicalNotesDoctor")}
              </label>
              <textarea
                placeholder={t("triage.clinicalNotesPlaceholder")}
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-border rounded text-sm focus:outline-none focus:border-celeste-dark focus:ring-2 focus:ring-celeste-dark/30 resize-y"
              />
            </div>

            {/* Treatment plan */}
            <div>
              <label className="text-xs text-ink-muted block mb-1">
                {t("triage.treatmentPlan")}
              </label>
              <textarea
                placeholder={t("triage.treatmentPlaceholder")}
                value={treatmentPlan}
                onChange={(e) => setTreatmentPlan(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-border rounded text-sm focus:outline-none focus:border-celeste-dark focus:ring-2 focus:ring-celeste-dark/30 resize-y"
              />
            </div>

            {/* Referrals */}
            <div>
              <label className="text-xs text-ink-muted block mb-1" id="lbl-derivaciones">
                {t("triage.referrals")}
              </label>
              <div className="flex gap-2">
                <select
                  aria-labelledby="lbl-derivaciones"
                  className="flex-1 px-4 py-2.5 border border-border rounded text-sm text-ink-light focus:outline-none focus:border-celeste-dark focus:ring-2 focus:ring-celeste-dark/30"
                >
                  <option value="">{t("triage.noReferral")}</option>
                  <option>Cardiología</option>
                  <option>Neurología</option>
                  <option>Traumatología</option>
                  <option>Dermatología</option>
                  <option>Gastroenterología</option>
                  <option>Endocrinología</option>
                  <option>Laboratorio</option>
                  <option>Imágenes</option>
                </select>
                <button
                  onClick={() =>
                    !isDemo
                      ? showToast(t("toast.triage.addReferral"), "success")
                      : showDemo(t("triage.addReferralDemo"))
                  }
                  className="px-4 py-2.5 text-xs font-medium border border-border text-ink-light rounded hover:border-celeste-dark hover:text-celeste-dark transition"
                >
                  {t("triage.addReferral")}
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() =>
                  !isDemo
                    ? showToast(
                        `${t("triage.saveClinicalNote")}: ICD-10 ${selectedICD.join(", ") || "N/A"} — ${t("triage.treatmentPlan")}: ${treatmentPlan.substring(0, 50) || "N/A"}`,
                        "success",
                      )
                    : showDemo(
                        `${t("triage.saveClinicalNote")}: ICD-10 ${selectedICD.join(", ") || "N/A"} — ${t("triage.treatmentPlan")}: ${treatmentPlan.substring(0, 50) || "N/A"}`,
                      )
                }
                className="px-5 py-2.5 bg-celeste-dark text-white text-sm font-semibold rounded hover:bg-celeste transition"
              >
                {t("triage.saveClinicalNote")}
              </button>
              <button
                onClick={() =>
                  !isDemo
                    ? router.push("/dashboard/recetas/nueva")
                    : showDemo(t("triage.generatePrescriptionToast"))
                }
                className="px-5 py-2.5 bg-green-600 text-white text-sm font-semibold rounded hover:bg-green-700 transition"
              >
                {t("triage.generatePrescription")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── 14.6 Symptom → Specialist Routing ─── */}
      {tab === "routing" && (
        <div className="space-y-4">
          <p className="text-sm text-ink-light">{t("triage.routingDescFull")}</p>

          {selectedSymptoms.length === 0 ? (
            <div className="bg-gold-pale border border-gold/30 rounded-lg p-4 text-sm text-ink-light">
              {t("triage.routingSelectSymptoms")}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Mapping */}
              <div className="bg-white border border-border rounded-lg overflow-hidden">
                <table className="w-full text-sm" aria-label="Ruteo por síntomas">
                  <thead>
                    <tr className="bg-surface text-xs text-ink-muted">
                      <th scope="col" className="text-left font-medium px-5 py-3">
                        {t("triage.symptomSingular")}
                      </th>
                      <th scope="col" className="text-left font-medium px-5 py-3">
                        {t("triage.suggestedSpecialty")}
                      </th>
                      <th scope="col" className="text-right font-medium px-5 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedSymptoms.map((s) => (
                      <tr
                        key={s}
                        className="border-t border-border-light hover:bg-celeste-pale/30 transition"
                      >
                        <td className="px-5 py-3 font-medium text-ink">{s}</td>
                        <td className="px-5 py-3">
                          <span className="text-xs bg-celeste-pale text-celeste-dark px-2 py-0.5 rounded font-medium">
                            {symptomToSpecialty[s] || "Clínica médica"}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <button
                            onClick={() =>
                              !isDemo
                                ? router.push("/dashboard/directorio")
                                : showDemo(
                                    `${t("triage.searchDoctorsIn")} ${symptomToSpecialty[s] || "Clínica médica"} ${t("triage.inDirectory")}`,
                                  )
                            }
                            className="text-xs text-celeste-dark hover:text-celeste font-medium transition"
                          >
                            {t("triage.viewDoctors")}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className="bg-celeste-pale border border-celeste-dark/20 rounded-lg p-5">
                <h4 className="text-sm font-semibold text-ink mb-2">
                  {t("triage.suggestedReferral")}
                </h4>
                <p className="text-xs text-ink-light">
                  {t("triage.basedOnSymptomsConsult")}{" "}
                  <span className="font-bold text-celeste-dark">
                    {routedSpecialties.length > 0
                      ? routedSpecialties.join(", ")
                      : "Clínica médica (general)"}
                  </span>
                </p>
                <button
                  onClick={() =>
                    !isDemo
                      ? router.push("/dashboard/directorio")
                      : showDemo(
                          `${t("triage.openDirectoryFiltered")} ${routedSpecialties.join(", ") || "Clínica médica"}`,
                        )
                  }
                  className="mt-3 px-5 py-2.5 bg-celeste-dark text-white text-sm font-semibold rounded hover:bg-celeste transition"
                >
                  {t("triage.searchInDirectory")}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

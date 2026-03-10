"use client";

import { useState } from "react";
import { useDemoAction } from "@/components/DemoModal";

/* ─── body systems & symptoms ─── */
const bodySystems: Record<string, string[]> = {
  Cabeza: ["Dolor de cabeza", "Mareos", "Visión borrosa", "Zumbido en oídos", "Congestión nasal"],
  "Pecho / Corazón": ["Dolor de pecho", "Palpitaciones", "Falta de aire", "Opresión torácica"],
  Abdomen: [
    "Dolor abdominal",
    "Náuseas",
    "Vómitos",
    "Diarrea",
    "Estreñimiento",
    "Acidez",
    "Hinchazón",
  ],
  "Músculos / Huesos": [
    "Dolor de espalda",
    "Dolor de rodilla",
    "Dolor cervical",
    "Dolor articular",
    "Rigidez muscular",
  ],
  Piel: ["Erupciones", "Picazón", "Manchas", "Heridas", "Enrojecimiento"],
  "Sistema nervioso": [
    "Hormigueo",
    "Entumecimiento",
    "Debilidad muscular",
    "Temblores",
    "Problemas de memoria",
  ],
  "Vías urinarias": ["Dolor al orinar", "Frecuencia urinaria", "Sangre en orina", "Incontinencia"],
  General: ["Fiebre", "Fatiga", "Pérdida de peso", "Insomnio", "Sudoración nocturna"],
};

const severityLabels: Record<number, string> = {
  1: "Mínimo",
  2: "Leve",
  3: "Leve",
  4: "Moderado",
  5: "Moderado",
  6: "Moderado-alto",
  7: "Alto",
  8: "Alto",
  9: "Severo",
  10: "Insoportable",
};

const frequencyOptions = ["Primera vez", "Ocasional", "Frecuente", "Diario", "Constante"];

const symptomToSpecialty: Record<string, string> = {
  "Dolor de cabeza": "Neurología",
  Mareos: "Neurología",
  "Visión borrosa": "Oftalmología",
  "Dolor de pecho": "Cardiología",
  Palpitaciones: "Cardiología",
  "Falta de aire": "Neumonología",
  "Dolor abdominal": "Gastroenterología",
  Náuseas: "Gastroenterología",
  "Dolor de espalda": "Traumatología",
  "Dolor de rodilla": "Traumatología",
  Erupciones: "Dermatología",
  Picazón: "Dermatología",
  Hormigueo: "Neurología",
  "Dolor al orinar": "Urología",
  Fiebre: "Clínica médica",
  Fatiga: "Clínica médica",
};

const icd10Codes = [
  { code: "I10", description: "Hipertensión esencial" },
  { code: "E11", description: "Diabetes mellitus tipo 2" },
  { code: "M54.5", description: "Dolor lumbar" },
  { code: "J06.9", description: "Infección respiratoria aguda" },
  { code: "R51", description: "Cefalea" },
  { code: "K21", description: "Reflujo gastroesofágico" },
  { code: "G43", description: "Migraña" },
  { code: "L30.9", description: "Dermatitis, no especificada" },
  { code: "N39.0", description: "Infección urinaria" },
  { code: "R10.4", description: "Dolor abdominal" },
];

const intakeHistory = [
  {
    id: "TRI-0341",
    patient: "Carlos Méndez",
    date: "10/03/2026 09:45",
    symptoms: ["Dolor de pecho", "Falta de aire"],
    severity: 7,
    routedTo: "Cardiología — Dra. Fernández",
    status: "Completado",
  },
  {
    id: "TRI-0340",
    patient: "Ana Rodríguez",
    date: "10/03/2026 08:30",
    symptoms: ["Dolor de espalda", "Rigidez muscular"],
    severity: 5,
    routedTo: "Traumatología — Dra. Sánchez",
    status: "En consulta",
  },
  {
    id: "TRI-0339",
    patient: "Pedro Silva",
    date: "09/03/2026 16:20",
    symptoms: ["Erupciones", "Picazón"],
    severity: 4,
    routedTo: "Dermatología — Dr. García",
    status: "Completado",
  },
  {
    id: "TRI-0338",
    patient: "Marta Gutiérrez",
    date: "09/03/2026 14:10",
    symptoms: ["Dolor abdominal", "Náuseas", "Acidez"],
    severity: 6,
    routedTo: "Gastroenterología — Dr. Rossi",
    status: "Completado",
  },
];

type Tab = "sintomas" | "detalle" | "notas" | "intake" | "clinicas" | "routing";

export default function TriagePage() {
  const { showDemo } = useDemoAction();
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

  const tabs: { key: Tab; label: string }[] = [
    { key: "sintomas", label: "Síntomas" },
    { key: "detalle", label: "Detalle" },
    { key: "notas", label: "Notas paciente" },
    { key: "intake", label: "Intake médico" },
    { key: "clinicas", label: "Notas clínicas" },
    { key: "routing", label: "Routing" },
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

  return (
    <div id="main-content" className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">Triage de Síntomas</h1>
          <p className="text-sm text-ink-light mt-1">
            Registro de síntomas, notas médicas, intake pre-consulta y routing por especialidad
          </p>
        </div>
        <button
          onClick={() => showDemo("Nuevo triage de paciente")}
          className="px-5 py-2.5 bg-celeste-dark text-white text-sm font-semibold rounded hover:bg-celeste transition"
        >
          + Nuevo triage
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Triages hoy", value: "18", change: "5 urgentes", color: "text-celeste-dark" },
          { label: "En espera", value: "4", change: "2 alta severidad", color: "text-gold" },
          {
            label: "Derivados",
            value: "14",
            change: "6 especialidades",
            color: "text-celeste-dark",
          },
          {
            label: "Notas clínicas",
            value: "11",
            change: "Hoy completadas",
            color: "text-green-600",
          },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white border border-border rounded-lg p-5">
            <p className="text-xs text-ink-muted">{kpi.label}</p>
            <p className={`text-2xl font-display font-bold ${kpi.color} mt-1`}>{kpi.value}</p>
            <p className="text-xs text-ink-muted mt-1">{kpi.change}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium transition border-b-2 -mb-px whitespace-nowrap ${
              tab === t.key
                ? "border-celeste-dark text-celeste-dark"
                : "border-transparent text-ink-muted hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ─── 14.1 Symptom Dropdown by Body System ─── */}
      {tab === "sintomas" && (
        <div className="space-y-4">
          <p className="text-sm text-ink-light">
            Seleccioná los síntomas del paciente organizados por sistema corporal. Multi-selección
            habilitada.
          </p>

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
                Limpiar todo
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
              Continuar con detalle ({selectedSymptoms.length} síntomas)
            </button>
          )}
        </div>
      )}

      {/* ─── 14.2 Symptom Detail Fields ─── */}
      {tab === "detalle" && (
        <div className="space-y-4">
          <p className="text-sm text-ink-light">
            Detallá duración, severidad, frecuencia y triggers de los síntomas seleccionados.
          </p>

          {selectedSymptoms.length === 0 && (
            <div className="bg-gold-pale border border-gold/30 rounded-lg p-4 text-sm text-ink-light">
              Primero seleccioná síntomas en la pestaña anterior.
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
                <label className="text-xs text-ink-muted block mb-1">Duración</label>
                <input
                  type="text"
                  placeholder="Ej: 3 días, 2 semanas, desde ayer..."
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-4 py-2.5 border border-border rounded text-sm focus:outline-none focus:border-celeste-dark"
                />
              </div>

              {/* Severity */}
              <div>
                <label className="text-xs text-ink-muted block mb-1">
                  Severidad: <span className="font-bold text-ink">{severity}/10</span>{" "}
                  <span className="text-celeste-dark">({severityLabels[severity]})</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={severity}
                  onChange={(e) => setSeverity(Number(e.target.value))}
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
                <label className="text-xs text-ink-muted block mb-1">Frecuencia</label>
                <div className="flex flex-wrap gap-2">
                  {frequencyOptions.map((f) => (
                    <button
                      key={f}
                      onClick={() => setFrequency(f)}
                      className={`px-3 py-1.5 text-xs rounded transition ${
                        frequency === f
                          ? "bg-celeste-dark text-white"
                          : "bg-[#F8FAFB] border border-border text-ink-light hover:border-celeste-dark hover:text-celeste-dark"
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
                  Triggers / Desencadenantes
                </label>
                <input
                  type="text"
                  placeholder="Ej: al caminar, después de comer, en la mañana..."
                  value={triggers}
                  onChange={(e) => setTriggers(e.target.value)}
                  className="w-full px-4 py-2.5 border border-border rounded text-sm focus:outline-none focus:border-celeste-dark"
                />
              </div>

              <button
                onClick={() =>
                  showDemo(
                    `Guardar detalle: ${selectedSymptoms.join(", ")} — Severidad ${severity}/10, ${frequency}, Duración: ${duration || "N/A"}`,
                  )
                }
                className="px-5 py-2.5 bg-celeste-dark text-white text-sm font-semibold rounded hover:bg-celeste transition"
              >
                Guardar detalle
              </button>
            </div>
          )}
        </div>
      )}

      {/* ─── 14.3 Free-text Notes + Photos ─── */}
      {tab === "notas" && (
        <div className="space-y-4">
          <p className="text-sm text-ink-light">
            Notas de texto libre del paciente con opción de adjuntar fotos (heridas, erupciones,
            estudios).
          </p>

          <div className="bg-white border border-border rounded-lg p-6 space-y-4">
            <div>
              <label className="text-xs text-ink-muted block mb-1">
                Notas del paciente (texto libre)
              </label>
              <textarea
                placeholder="El paciente describe sus síntomas en sus propias palabras..."
                value={freeNotes}
                onChange={(e) => setFreeNotes(e.target.value)}
                rows={6}
                className="w-full px-4 py-3 border border-border rounded text-sm focus:outline-none focus:border-celeste-dark resize-y"
              />
            </div>

            <div>
              <label className="text-xs text-ink-muted block mb-1">Adjuntar fotos</label>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <p className="text-sm text-ink-muted">
                  Arrastrá imágenes aquí o hacé click para seleccionar
                </p>
                <p className="text-xs text-ink-muted mt-1">
                  JPG, PNG hasta 10MB. Fotos de heridas, erupciones, estudios previos.
                </p>
                <button
                  onClick={() => showDemo("Adjuntar fotos al triage del paciente")}
                  className="mt-3 px-4 py-2 text-xs font-medium border border-border text-ink-light rounded hover:border-celeste-dark hover:text-celeste-dark transition"
                >
                  Seleccionar archivos
                </button>
              </div>
            </div>

            <button
              onClick={() =>
                showDemo(
                  `Guardar notas del paciente: ${freeNotes.substring(0, 50) || "Sin notas"}...`,
                )
              }
              className="px-5 py-2.5 bg-celeste-dark text-white text-sm font-semibold rounded hover:bg-celeste transition"
            >
              Guardar notas
            </button>
          </div>
        </div>
      )}

      {/* ─── 14.4 Doctor-Facing Intake Summary ─── */}
      {tab === "intake" && (
        <div className="space-y-4">
          <p className="text-sm text-ink-light">
            Resumen compilado antes de que comience la consulta. El médico ve todo el intake en un
            solo lugar.
          </p>

          {/* Current intake preview */}
          <div className="bg-white border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-ink">Intake actual — Vista del médico</h3>
              <span className="text-[10px] font-bold bg-celeste-pale text-celeste-dark px-2.5 py-1 rounded">
                PRE-CONSULTA
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-[10px] text-ink-muted mb-1">SÍNTOMAS REPORTADOS</p>
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
                  <p className="text-xs text-ink-muted italic">Sin síntomas seleccionados</p>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-[10px] text-ink-muted">Severidad</p>
                  <p
                    className={`text-sm font-bold ${severity >= 7 ? "text-red-600" : severity >= 4 ? "text-gold" : "text-green-600"}`}
                  >
                    {severity}/10
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-ink-muted">Frecuencia</p>
                  <p className="text-sm font-medium text-ink">{frequency}</p>
                </div>
                <div>
                  <p className="text-[10px] text-ink-muted">Duración</p>
                  <p className="text-sm font-medium text-ink">{duration || "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-ink-muted">Triggers</p>
                  <p className="text-sm font-medium text-ink">{triggers || "—"}</p>
                </div>
              </div>

              {freeNotes && (
                <div>
                  <p className="text-[10px] text-ink-muted mb-1">NOTAS DEL PACIENTE</p>
                  <div className="bg-[#F8FAFB] rounded p-3 text-xs text-ink-light">{freeNotes}</div>
                </div>
              )}
            </div>
          </div>

          {/* Intake history */}
          <h3 className="text-sm font-semibold text-ink">Historial de intakes</h3>
          <div className="bg-white border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F8FAFB] text-xs text-ink-muted">
                  <th className="text-left font-medium px-5 py-3">ID</th>
                  <th className="text-left font-medium px-5 py-3">Paciente</th>
                  <th className="text-left font-medium px-5 py-3">Síntomas</th>
                  <th className="text-center font-medium px-5 py-3">Severidad</th>
                  <th className="text-left font-medium px-5 py-3">Derivado a</th>
                  <th className="text-center font-medium px-5 py-3">Estado</th>
                </tr>
              </thead>
              <tbody>
                {intakeHistory.map((h) => (
                  <tr
                    key={h.id}
                    className="border-t border-border-light hover:bg-celeste-pale/30 transition"
                  >
                    <td className="px-5 py-3 text-xs font-mono text-ink-muted">{h.id}</td>
                    <td className="px-5 py-3 font-medium text-ink">{h.patient}</td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1">
                        {h.symptoms.map((s) => (
                          <span
                            key={s}
                            className="text-[10px] bg-[#F8FAFB] px-1.5 py-0.5 rounded text-ink-light"
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
                        {h.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── 14.5 Doctor Clinical Notes ─── */}
      {tab === "clinicas" && (
        <div className="space-y-4">
          <p className="text-sm text-ink-light">
            Notas clínicas post-consulta: diagnóstico ICD-10, plan de tratamiento, derivaciones.
          </p>

          <div className="bg-white border border-border rounded-lg p-6 space-y-5">
            {/* ICD-10 selector */}
            <div>
              <label className="text-xs text-ink-muted block mb-2">
                Diagnóstico ICD-10 (selección múltiple)
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
              <label className="text-xs text-ink-muted block mb-1">Notas clínicas del médico</label>
              <textarea
                placeholder="Hallazgos, observaciones, evolución del cuadro..."
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-border rounded text-sm focus:outline-none focus:border-celeste-dark resize-y"
              />
            </div>

            {/* Treatment plan */}
            <div>
              <label className="text-xs text-ink-muted block mb-1">Plan de tratamiento</label>
              <textarea
                placeholder="Medicación, indicaciones, reposo, estudios a solicitar..."
                value={treatmentPlan}
                onChange={(e) => setTreatmentPlan(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-border rounded text-sm focus:outline-none focus:border-celeste-dark resize-y"
              />
            </div>

            {/* Referrals */}
            <div>
              <label className="text-xs text-ink-muted block mb-1">Derivaciones</label>
              <div className="flex gap-2">
                <select className="flex-1 px-4 py-2.5 border border-border rounded text-sm text-ink-light focus:outline-none focus:border-celeste-dark">
                  <option value="">Sin derivación</option>
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
                  onClick={() => showDemo("Agregar derivación al directorio médico")}
                  className="px-4 py-2.5 text-xs font-medium border border-border text-ink-light rounded hover:border-celeste-dark hover:text-celeste-dark transition"
                >
                  Agregar
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() =>
                  showDemo(
                    `Guardar nota clínica: ICD-10 ${selectedICD.join(", ") || "N/A"} — Plan: ${treatmentPlan.substring(0, 50) || "N/A"}`,
                  )
                }
                className="px-5 py-2.5 bg-celeste-dark text-white text-sm font-semibold rounded hover:bg-celeste transition"
              >
                Guardar nota clínica
              </button>
              <button
                onClick={() =>
                  showDemo("Generar receta digital desde notas clínicas y enviar a Farmacia Online")
                }
                className="px-5 py-2.5 bg-green-600 text-white text-sm font-semibold rounded hover:bg-green-700 transition"
              >
                Generar receta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── 14.6 Symptom → Specialist Routing ─── */}
      {tab === "routing" && (
        <div className="space-y-4">
          <p className="text-sm text-ink-light">
            Los síntomas seleccionados se cruzan automáticamente con especialidades médicas para
            derivar al paciente al directorio correcto.
          </p>

          {selectedSymptoms.length === 0 ? (
            <div className="bg-gold-pale border border-gold/30 rounded-lg p-4 text-sm text-ink-light">
              Seleccioná síntomas en la primera pestaña para ver las especialidades recomendadas.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Mapping */}
              <div className="bg-white border border-border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#F8FAFB] text-xs text-ink-muted">
                      <th className="text-left font-medium px-5 py-3">Síntoma</th>
                      <th className="text-left font-medium px-5 py-3">Especialidad sugerida</th>
                      <th className="text-right font-medium px-5 py-3"></th>
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
                              showDemo(
                                `Buscar médicos de ${symptomToSpecialty[s] || "Clínica médica"} en Directorio`,
                              )
                            }
                            className="text-xs text-celeste-dark hover:text-celeste font-medium transition"
                          >
                            Ver médicos
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className="bg-celeste-pale border border-celeste-dark/20 rounded-lg p-5">
                <h4 className="text-sm font-semibold text-ink mb-2">Derivación sugerida</h4>
                <p className="text-xs text-ink-light">
                  Basado en los síntomas seleccionados, se recomienda consulta con:{" "}
                  <span className="font-bold text-celeste-dark">
                    {routedSpecialties.length > 0
                      ? routedSpecialties.join(", ")
                      : "Clínica médica (general)"}
                  </span>
                </p>
                <button
                  onClick={() =>
                    showDemo(
                      `Abrir Directorio Médico filtrado por: ${routedSpecialties.join(", ") || "Clínica médica"}`,
                    )
                  }
                  className="mt-3 px-5 py-2.5 bg-celeste-dark text-white text-sm font-semibold rounded hover:bg-celeste transition"
                >
                  Buscar en Directorio
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

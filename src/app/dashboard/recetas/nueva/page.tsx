"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Plus,
  Pill,
  Loader2,
  X,
  ArrowLeft,
  Shield,
  Send,
  Save,
  AlertTriangle,
  Calendar,
  CheckSquare,
} from "lucide-react";
import { useToast } from "@/components/Toast";
import { useLocale } from "@/lib/i18n/context";
import type { VademecumDrug, DrugInteraction } from "@/lib/types";
import DrugSearch from "@/components/prescriptions/DrugSearch";
import InteractionWarning from "@/components/prescriptions/InteractionWarning";
import CIE10Search from "@/components/prescriptions/CIE10Search";
import type { CIE10Entry } from "@/components/prescriptions/CIE10Search";
import PatientCoverageSelector from "@/components/prescriptions/PatientCoverageSelector";
import type { CoverageData } from "@/components/prescriptions/PatientCoverageSelector";
import PrescriptionSuccessModal from "@/components/prescriptions/PrescriptionSuccessModal";

const MAX_MEDICATIONS = 3;

/* ── Types ──────────────────────────────────────────────── */
interface Medication {
  medicationName: string;
  genericName: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number | "";
  notes: string;
  drug?: VademecumDrug;
}

const EMPTY_MED: Medication = {
  medicationName: "",
  genericName: "",
  dosage: "",
  frequency: "",
  duration: "",
  quantity: "",
  notes: "",
};

/* ── Interaction Check Hook ────────────────────────────── */
function useInteractionCheck() {
  const [interactions, setInteractions] = useState<DrugInteraction[]>([]);
  const [hasContraindicated, setHasContraindicated] = useState(false);
  const [hasHigh, setHasHigh] = useState(false);

  const check = useCallback(async (drugIds: string[]) => {
    if (drugIds.length < 2) {
      setInteractions([]);
      setHasContraindicated(false);
      setHasHigh(false);
      return;
    }

    try {
      const res = await fetch("/api/vademecum/interactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ drugIds }),
      });
      if (res.ok) {
        const data = await res.json();
        setInteractions(data.interactions || []);
        setHasContraindicated(data.hasContraindicated || false);
        setHasHigh(data.hasHigh || false);
      }
    } catch {
      // Ignore — interaction check is best-effort
    }
  }, []);

  return { interactions, hasContraindicated, hasHigh, check };
}

/* ── Main Component ────────────────────────────────────── */
export default function NuevaRecetaPage() {
  const { showToast } = useToast();
  const { t } = useLocale();
  const interactionCheck = useInteractionCheck();

  const [creating, setCreating] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState("");
  const [created, setCreated] = useState<{
    id: string;
    verificationToken: string;
    verificationUrl: string;
    patientName: string;
    medications: { medicationName: string }[];
    status: string;
    registrations?: {
      osde?: { status: string; registeredAt?: string };
      rcta?: { status: string; prescriptionId?: string; pdfUrl?: string; error?: string };
    };
  } | null>(null);

  // Form state
  const [patientName, setPatientName] = useState("");
  const [patientDNI, setPatientDNI] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [diagnosisCode, setDiagnosisCode] = useState("");
  const [notes, setNotes] = useState("");
  const [meds, setMeds] = useState<Medication[]>([{ ...EMPTY_MED }]);
  const [coverage, setCoverage] = useState<CoverageData>({
    coverageName: "",
    coveragePlan: "",
    coverageNumber: "",
  });

  // Posdated
  const [isPosdated, setIsPosdated] = useState(false);
  const [posdatedMonths, setPosdatedMonths] = useState(1);

  // Checklist
  const [checklistOpen, setChecklistOpen] = useState(false);

  // Track drug IDs for interaction checking
  const drugIds = meds.filter((m) => m.drug?.id).map((m) => m.drug!.id);
  const drugIdsKey = drugIds.join(",");

  // Check interactions when drugs change
  useEffect(() => {
    interactionCheck.check(drugIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drugIdsKey]);

  const isOsde = coverage.coverageName.toLowerCase().includes("osde");
  const isNoCoverage = !coverage.coverageName || coverage.coverageName === "Sin cobertura";
  const routeLabel = isOsde ? "OSDE FHIR" : isNoCoverage ? "PDF Only" : "RCTA QBI2";

  function addMed() {
    if (meds.length >= MAX_MEDICATIONS) return;
    setMeds([...meds, { ...EMPTY_MED }]);
  }

  function removeMed(idx: number) {
    if (meds.length === 1) return;
    setMeds(meds.filter((_, i) => i !== idx));
  }

  function updateMed(idx: number, field: keyof Medication, value: string | number) {
    setMeds(meds.map((m, i) => (i === idx ? { ...m, [field]: value } : m)));
  }

  function selectDrug(idx: number, drug: VademecumDrug) {
    setMeds(
      meds.map((m, i) =>
        i === idx
          ? {
              ...m,
              medicationName: drug.commercialName,
              genericName: drug.genericName,
              dosage: drug.concentration,
              drug,
            }
          : m,
      ),
    );
  }

  function handleCIE10Select(entry: CIE10Entry) {
    setDiagnosisCode(entry.code);
    setDiagnosis(`${entry.code} — ${entry.description}`);
  }

  /* ── Pre-submission checklist ── */
  const validMeds = meds.filter((m) => m.medicationName.trim());
  const checklist = [
    { label: "Paciente identificado", ok: !!patientName.trim() },
    { label: "Al menos 1 medicamento", ok: validMeds.length > 0 },
    { label: "Maximo 3 medicamentos", ok: validMeds.length <= MAX_MEDICATIONS },
    { label: "Dosis indicada", ok: validMeds.every((m) => m.dosage.trim()) },
    { label: "Frecuencia indicada", ok: validMeds.every((m) => m.frequency.trim()) },
    { label: "Sin interacciones contraindicadas", ok: !interactionCheck.hasContraindicated },
    { label: "Diagnostico con CIE-10", ok: !!diagnosisCode, required: false },
    { label: "Cobertura seleccionada", ok: !!coverage.coverageName, required: false },
  ];
  const requiredChecks = checklist.filter((c) => c.required !== false);
  const allRequiredOk = requiredChecks.every((c) => c.ok);

  async function handleCreate(asDraft: boolean = false) {
    if (!patientName.trim() || !meds[0]?.medicationName) {
      showToast(t("toast.recetas.fillRequired"), "warning");
      return;
    }

    if (interactionCheck.hasContraindicated) {
      showToast(t("toast.recetas.contraindicated"), "error");
      return;
    }

    setCreating(true);
    setLoadingLabel(
      isOsde
        ? "Registrando en OSDE..."
        : isNoCoverage
          ? "Generando PDF..."
          : "Registrando en RCTA...",
    );

    const filteredMeds = meds
      .filter((m) => m.medicationName)
      .slice(0, MAX_MEDICATIONS)
      .map((m) => ({
        medicationName: m.medicationName,
        genericName: m.genericName || undefined,
        dosage: m.dosage,
        frequency: m.frequency,
        duration: m.duration || undefined,
        quantity: m.quantity ? Number(m.quantity) : undefined,
        notes: m.notes || undefined,
        drug: m.drug
          ? {
              drugId: m.drug.id,
              troquel: m.drug.troquel,
              alfabetaCode: m.drug.alfabetaCode,
              genericName: m.drug.genericName,
              commercialName: m.drug.commercialName,
              lab: m.drug.lab,
              concentration: m.drug.concentration,
              presentation: m.drug.presentation,
              isControlled: m.drug.isControlled,
            }
          : undefined,
      }));

    try {
      const res = await fetch("/api/prescriptions/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: patientDNI.trim() || "clinic-patient-" + Date.now(),
          patientName: patientName.trim(),
          patientDni: patientDNI.trim() || undefined,
          doctorName: "Dra. Maria Rodriguez",
          doctorMatricula: "MN-12345",
          doctorCuit: "27-27345678-0",
          diagnosis: diagnosis.trim() || undefined,
          diagnosisCode: diagnosisCode || undefined,
          notes: notes.trim() || undefined,
          coverageName: coverage.coverageName || undefined,
          coveragePlan: coverage.coveragePlan || undefined,
          coverageNumber: coverage.coverageNumber || undefined,
          asDraft,
          medications: filteredMeds,
          posdated: isPosdated ? { months: posdatedMonths } : undefined,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        if (errData.code === "CONTROLLED_SUBSTANCE") {
          showToast("Sustancia controlada — no se puede prescribir por este sistema", "error");
          setCreating(false);
          return;
        }
        throw new Error(errData.error || "API unavailable");
      }

      const data = await res.json();
      setCreated({
        id: data.prescription.id,
        verificationToken: data.prescription.verificationToken,
        verificationUrl: data.verificationUrl,
        patientName: data.prescription.patientName,
        medications: data.prescription.medications || [],
        status: asDraft ? "draft" : "active",
        registrations: data.registrations,
      });
    } catch {
      showToast("Error al crear la receta. Intente nuevamente.", "error");
      setCreating(false);
      setLoadingLabel("");
      return;
    }

    showToast(asDraft ? "Borrador guardado" : "Receta digital creada con exito");
    setCreating(false);
    setLoadingLabel("");
  }

  function resetForm() {
    setCreated(null);
    setPatientName("");
    setPatientDNI("");
    setDiagnosis("");
    setDiagnosisCode("");
    setNotes("");
    setMeds([{ ...EMPTY_MED }]);
    setCoverage({ coverageName: "", coveragePlan: "", coverageNumber: "" });
    setIsPosdated(false);
    setPosdatedMonths(1);
  }

  // ── Success state ──
  if (created) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <PrescriptionSuccessModal
          prescription={{
            id: created.id,
            patientName: created.patientName,
            medications: created.medications,
            verificationToken: created.verificationToken,
            status: created.status,
          }}
          verificationUrl={created.verificationUrl}
          registrations={created.registrations}
          onNewPrescription={resetForm}
        />
      </div>
    );
  }

  // ── Form state ──
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/recetas"
          className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-border transition"
        >
          <ArrowLeft className="w-4 h-4 text-ink/50" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-display font-bold text-ink">Prescribir Receta</h1>
          <p className="text-sm text-ink/60 mt-0.5">
            Crea una receta digital con validacion de medicamentos e interacciones
          </p>
        </div>
        {/* Route indicator */}
        <div
          className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
            isOsde
              ? "bg-blue-50 border-blue-200 text-blue-700"
              : isNoCoverage
                ? "bg-amber-50 border-amber-200 text-amber-700"
                : "bg-green-50 border-green-200 text-green-700"
          }`}
        >
          <span className="hidden sm:inline">Ruta: </span>
          {routeLabel}
        </div>
      </div>

      {/* Interaction Warnings */}
      {interactionCheck.interactions.length > 0 && (
        <InteractionWarning
          interactions={interactionCheck.interactions}
          hasContraindicated={interactionCheck.hasContraindicated}
          hasHigh={interactionCheck.hasHigh}
        />
      )}

      {/* Form */}
      <div className="bg-white border border-border rounded-2xl overflow-hidden">
        {/* Patient section */}
        <div className="p-6 border-b border-border">
          <h2 className="text-sm font-bold text-ink uppercase tracking-wider flex items-center gap-2 mb-4">
            <FileText className="w-4 h-4 text-celeste" />
            Datos del Paciente
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-ink/70 uppercase tracking-wider">
                Nombre completo *
              </label>
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Apellido, Nombre del paciente"
                className="mt-1 w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-celeste/40"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-ink/70 uppercase tracking-wider">
                DNI
              </label>
              <input
                type="text"
                value={patientDNI}
                onChange={(e) => setPatientDNI(e.target.value)}
                placeholder="Ej: 30123456"
                className="mt-1 w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-celeste/40"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="text-xs font-semibold text-ink/70 uppercase tracking-wider">
              Diagnostico (CIE-10)
            </label>
            <CIE10Search
              onSelect={handleCIE10Select}
              value={diagnosis}
              onChange={(v) => {
                setDiagnosis(v);
                setDiagnosisCode("");
              }}
              showFreeTextWarning={!!diagnosis && !diagnosisCode}
            />
          </div>
        </div>

        {/* Coverage section */}
        <div className="p-6 border-b border-border">
          <h2 className="text-sm font-bold text-ink uppercase tracking-wider flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-celeste" />
            Cobertura / Obra Social
          </h2>
          <PatientCoverageSelector value={coverage} onChange={setCoverage} />
        </div>

        {/* Medications section */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-ink uppercase tracking-wider flex items-center gap-2">
              <Pill className="w-4 h-4 text-celeste" />
              Medicamentos *
              <span
                className={`text-xs font-mono ml-2 px-2 py-0.5 rounded-full ${
                  validMeds.length >= MAX_MEDICATIONS
                    ? "bg-red-100 text-red-700"
                    : "bg-surface text-ink/50"
                }`}
              >
                {validMeds.length}/{MAX_MEDICATIONS}
              </span>
            </h2>
            {meds.length < MAX_MEDICATIONS && (
              <button
                onClick={addMed}
                className="text-xs text-celeste-dark hover:underline flex items-center gap-1 font-semibold"
              >
                <Plus className="w-3 h-3" /> Agregar
              </button>
            )}
          </div>

          {meds.length >= MAX_MEDICATIONS && (
            <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <p className="text-xs text-amber-800">
                Maximo {MAX_MEDICATIONS} medicamentos por receta (Res. MSN 1314/2023). Para mas
                medicamentos, emita una receta adicional.
              </p>
            </div>
          )}

          <div className="space-y-4">
            {meds.map((med, idx) => (
              <div key={idx} className="bg-surface rounded-xl p-4 space-y-3 relative group">
                {meds.length > 1 && (
                  <button
                    onClick={() => removeMed(idx)}
                    className="absolute top-3 right-3 p-1 hover:bg-white rounded opacity-0 group-hover:opacity-100 transition"
                    title="Eliminar medicamento"
                  >
                    <X className="w-3.5 h-3.5 text-ink/40" />
                  </button>
                )}

                <div className="flex items-center gap-1.5 mb-1">
                  <Pill className="w-3.5 h-3.5 text-celeste" />
                  <span className="text-[10px] font-bold text-ink/50 uppercase">
                    Medicamento {idx + 1}
                  </span>
                  {med.drug && (
                    <span className="text-[9px] bg-celeste-pale text-celeste-dark px-1.5 py-0.5 rounded font-semibold">
                      Validado
                    </span>
                  )}
                </div>

                {/* Drug search using component */}
                <DrugSearch
                  onSelect={(drug) => selectDrug(idx, drug)}
                  value={med.medicationName}
                  onChange={(value) => updateMed(idx, "medicationName", value)}
                  placeholder="Buscar medicamento (ej: losartan, amoxicilina)..."
                />

                {/* Generic name display */}
                {med.genericName && (
                  <p className="text-[11px] text-ink/50 -mt-1">
                    Generico: <span className="font-semibold">{med.genericName}</span>
                    {med.drug?.lab && <> — {med.drug.lab}</>}
                    {med.drug?.troquel && <> — Troquel: {med.drug.troquel}</>}
                  </p>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <input
                    type="text"
                    placeholder="Dosis (500mg)"
                    value={med.dosage}
                    onChange={(e) => updateMed(idx, "dosage", e.target.value)}
                    className="px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-celeste/40"
                  />
                  <input
                    type="text"
                    placeholder="Frecuencia (c/8h)"
                    value={med.frequency}
                    onChange={(e) => updateMed(idx, "frequency", e.target.value)}
                    className="px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-celeste/40"
                  />
                  <input
                    type="text"
                    placeholder="Duracion (7 dias)"
                    value={med.duration}
                    onChange={(e) => updateMed(idx, "duration", e.target.value)}
                    className="px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-celeste/40"
                  />
                  <input
                    type="number"
                    placeholder="Cantidad"
                    value={med.quantity}
                    onChange={(e) => updateMed(idx, "quantity", e.target.value)}
                    className="px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-celeste/40"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Notas adicionales para este medicamento (opcional)"
                  value={med.notes}
                  onChange={(e) => updateMed(idx, "notes", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-celeste/40"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Notes + Posdated section */}
        <div className="p-6 border-b border-border">
          <h2 className="text-sm font-bold text-ink uppercase tracking-wider flex items-center gap-2 mb-4">
            Indicaciones Generales
          </h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Indicaciones adicionales para el paciente o la farmacia..."
            className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-celeste/40 resize-none"
          />

          {/* Posdated toggle */}
          <div className="mt-4 flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPosdated}
                onChange={(e) => setIsPosdated(e.target.checked)}
                className="w-4 h-4 text-celeste-dark rounded border-border focus:ring-celeste/40"
              />
              <Calendar className="w-4 h-4 text-ink/40" />
              <span className="text-sm text-ink/70">Receta posdatada</span>
            </label>
            {isPosdated && (
              <select
                value={posdatedMonths}
                onChange={(e) => setPosdatedMonths(Number(e.target.value))}
                className="text-sm border border-border rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-celeste/40"
              >
                {[1, 2, 3, 4, 5, 6].map((m) => (
                  <option key={m} value={m}>
                    {m} {m === 1 ? "mes" : "meses"}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Pre-submission checklist */}
        <div className="p-6 border-b border-border">
          <button
            onClick={() => setChecklistOpen(!checklistOpen)}
            className="flex items-center gap-2 text-sm font-semibold text-ink/70 hover:text-ink transition w-full"
          >
            <CheckSquare className="w-4 h-4" />
            Checklist pre-emision
            <span
              className={`ml-auto text-xs font-mono px-2 py-0.5 rounded-full ${
                allRequiredOk ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}
            >
              {requiredChecks.filter((c) => c.ok).length}/{requiredChecks.length}
            </span>
          </button>
          {checklistOpen && (
            <div className="mt-3 space-y-1.5">
              {checklist.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-2 text-xs py-1 ${
                    item.ok
                      ? "text-green-700"
                      : item.required === false
                        ? "text-amber-600"
                        : "text-red-600"
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] ${
                      item.ok
                        ? "bg-green-100 border-green-300 text-green-700"
                        : item.required === false
                          ? "border-amber-300"
                          : "border-red-300"
                    }`}
                  >
                    {item.ok ? "✓" : ""}
                  </span>
                  {item.label}
                  {item.required === false && !item.ok && (
                    <span className="text-[10px] text-amber-500 font-semibold">(recomendado)</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-6 bg-surface/50">
          <Link
            href="/dashboard/recetas"
            className="text-sm font-medium text-ink/60 hover:text-ink transition"
          >
            Cancelar
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleCreate(true)}
              disabled={creating}
              className="inline-flex items-center gap-2 border border-border text-ink/70 hover:text-ink text-sm font-semibold px-5 py-2.5 rounded-[4px] transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              Guardar Borrador
            </button>
            <button
              onClick={() => handleCreate(false)}
              disabled={creating || interactionCheck.hasContraindicated || !allRequiredOk}
              className="inline-flex items-center gap-2 bg-celeste-dark hover:bg-celeste-700 text-white text-sm font-semibold px-6 py-2.5 rounded-[4px] transition disabled:opacity-50 shadow-sm shadow-celeste/20"
            >
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {loadingLabel}
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Emitir Receta
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

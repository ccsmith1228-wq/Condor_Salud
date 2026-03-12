"use client";

import { useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  Thermometer,
  Heart,
  Brain,
  Eye,
  Ear,
  Wind,
  Frown,
  Zap,
  CircleDot,
  Pill,
  Phone,
  Calendar,
  MessageSquare,
  Shield,
} from "lucide-react";
import { useToast } from "@/components/Toast";

/* ── types ────────────────────────────────────────────── */
type Step = "select" | "details" | "result";
type Severity = "leve" | "moderado" | "urgente";

interface BodyPart {
  id: string;
  label: string;
  icon: any;
  symptoms: string[];
}

interface TriageResult {
  severity: Severity;
  title: string;
  recommendation: string;
  doctorType: string;
  otcMeds: { name: string; dose: string }[];
  homeRemedies: string[];
  redFlags: string[];
  shouldSeek: string;
}

/* ── body parts ───────────────────────────────────────── */
const bodyParts: BodyPart[] = [
  {
    id: "cabeza",
    label: "Cabeza",
    icon: Brain,
    symptoms: ["Dolor de cabeza", "Mareos", "Migraña", "Visión borrosa", "Zumbido en oídos"],
  },
  {
    id: "ojos",
    label: "Ojos",
    icon: Eye,
    symptoms: [
      "Ojos rojos",
      "Picazón ocular",
      "Visión borrosa",
      "Lagrimeo excesivo",
      "Sensibilidad a la luz",
    ],
  },
  {
    id: "oidos",
    label: "Oídos",
    icon: Ear,
    symptoms: ["Dolor de oído", "Zumbido", "Pérdida de audición", "Secreción del oído"],
  },
  {
    id: "garganta",
    label: "Garganta y nariz",
    icon: Wind,
    symptoms: [
      "Dolor de garganta",
      "Congestión nasal",
      "Tos seca",
      "Tos con flema",
      "Ronquera",
      "Estornudos",
    ],
  },
  {
    id: "pecho",
    label: "Pecho",
    icon: Heart,
    symptoms: [
      "Dolor en el pecho",
      "Falta de aire",
      "Palpitaciones",
      "Opresión",
      "Tos persistente",
    ],
  },
  {
    id: "estomago",
    label: "Estómago",
    icon: CircleDot,
    symptoms: [
      "Dolor abdominal",
      "Náuseas",
      "Vómitos",
      "Acidez",
      "Hinchazón",
      "Diarrea",
      "Constipación",
    ],
  },
  {
    id: "piel",
    label: "Piel",
    icon: Zap,
    symptoms: ["Erupción", "Picazón", "Enrojecimiento", "Manchas", "Hinchazón", "Quemadura solar"],
  },
  {
    id: "musculo",
    label: "Músculos y huesos",
    icon: Activity,
    symptoms: [
      "Dolor muscular",
      "Dolor articular",
      "Rigidez",
      "Hinchazón",
      "Esguince",
      "Dolor de espalda",
    ],
  },
  {
    id: "fiebre",
    label: "Fiebre y malestar",
    icon: Thermometer,
    symptoms: ["Fiebre", "Escalofríos", "Fatiga", "Debilidad", "Sudoración nocturna"],
  },
  {
    id: "animo",
    label: "Estado de ánimo",
    icon: Frown,
    symptoms: [
      "Ansiedad",
      "Tristeza persistente",
      "Insomnio",
      "Irritabilidad",
      "Falta de apetito",
      "Dificultad para concentrarse",
    ],
  },
];

/* ── mock triage engine ───────────────────────────────── */
function getTriageResult(
  partId: string,
  symptoms: string[],
  duration: string,
  intensity: number,
): TriageResult {
  const isUrgent =
    intensity >= 8 ||
    symptoms.some((s) => ["Dolor en el pecho", "Falta de aire", "Palpitaciones"].includes(s));
  const isModerate = intensity >= 5 || duration === "mas-de-una-semana";

  if (isUrgent) {
    return {
      severity: "urgente",
      title: "Consultá con urgencia",
      recommendation:
        "Los síntomas que describís necesitan atención médica lo antes posible. Te recomendamos ir a una guardia o llamar a emergencias.",
      doctorType: "Guardia / Emergencias",
      otcMeds: [],
      homeRemedies: [],
      redFlags: ["No demores la consulta", "Si empeora, llamá al 107 (SAME)"],
      shouldSeek: "Inmediatamente",
    };
  }

  if (isModerate) {
    const meds: { name: string; dose: string }[] = [];
    if (partId === "cabeza") meds.push({ name: "Ibupirac 400mg", dose: "1 cada 8 hs con comida" });
    if (partId === "garganta") meds.push({ name: "Strepsils", dose: "1 pastilla cada 3 hs" });
    if (partId === "estomago") meds.push({ name: "Buscapina", dose: "1 comprimido cada 6 hs" });
    if (partId === "fiebre") meds.push({ name: "Tafirol 1g", dose: "1 cada 6 hs" });
    if (partId === "musculo") meds.push({ name: "Diclofenac gel", dose: "Aplicar 3 veces al día" });
    if (partId === "piel") meds.push({ name: "Loratadina 10mg", dose: "1 por día" });

    return {
      severity: "moderado",
      title: "Sacá turno esta semana",
      recommendation:
        "Tus síntomas necesitan evaluación médica pero no son una emergencia. Sacá turno en los próximos días.",
      doctorType:
        partId === "animo"
          ? "Psicólogo / Psiquiatra"
          : partId === "piel"
            ? "Dermatólogo"
            : partId === "musculo"
              ? "Traumatólogo"
              : "Clínico",
      otcMeds: meds,
      homeRemedies: ["Descansá lo más posible", "Tomá abundante líquido", "Evitá esfuerzos"],
      redFlags: ["Si los síntomas empeoran", "Si aparece fiebre alta (más de 38.5°C)"],
      shouldSeek: "Dentro de 2-3 días",
    };
  }

  const meds: { name: string; dose: string }[] = [];
  if (partId === "cabeza") meds.push({ name: "Tafirol 500mg", dose: "1 cada 6 hs si hay dolor" });
  if (partId === "garganta")
    meds.push(
      { name: "Paracetamol 500mg", dose: "1 cada 6 hs" },
      { name: "Miel con limón", dose: "Infusión tibia" },
    );
  if (partId === "estomago") meds.push({ name: "Sertal compuesto", dose: "1 cada 8 hs" });
  if (partId === "fiebre") meds.push({ name: "Paracetamol 500mg", dose: "1 cada 6 hs" });

  return {
    severity: "leve",
    title: "Podés hacer manejo en casa",
    recommendation:
      "Tus síntomas parecen leves y podés manejarlos desde casa. Si no mejorás en unos días, consultá con un médico.",
    doctorType: "Clínico (si no mejora)",
    otcMeds: meds,
    homeRemedies: ["Descansá y hidratate", "Comé liviano", "Evitá el estrés"],
    redFlags: ["Si los síntomas persisten más de 5 días", "Si aparecen síntomas nuevos"],
    shouldSeek: "Si no mejora en 5 días",
  };
}

/* ── component ────────────────────────────────────────── */
export default function SintomasPage() {
  const { showToast } = useToast();
  const [step, setStep] = useState<Step>("select");
  const [selectedPart, setSelectedPart] = useState<BodyPart | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [duration, setDuration] = useState("hoy");
  const [intensity, setIntensity] = useState(3);
  const [result, setResult] = useState<TriageResult | null>(null);

  const handleSelectPart = (part: BodyPart) => {
    setSelectedPart(part);
    setSelectedSymptoms([]);
    setStep("details");
  };

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom],
    );
  };

  const handleSubmit = () => {
    if (!selectedPart) return;
    const res = getTriageResult(selectedPart.id, selectedSymptoms, duration, intensity);
    setResult(res);
    setStep("result");
  };

  const reset = () => {
    setStep("select");
    setSelectedPart(null);
    setSelectedSymptoms([]);
    setDuration("hoy");
    setIntensity(3);
    setResult(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-ink">Chequear Síntomas</h1>
        <p className="text-sm text-ink-muted mt-0.5">
          Contanos cómo te sentís y te orientamos sobre qué hacer
        </p>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-800">
        <Shield className="w-4 h-4 mt-0.5 shrink-0" />
        <p>
          Esta herramienta es orientativa y <strong>no reemplaza</strong> una consulta médica. Ante
          una emergencia, llamá al <strong>107 (SAME)</strong> o andá a la guardia más cercana.
        </p>
      </div>

      {/* ── Step 1: Select body part ──────────────────── */}
      {step === "select" && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-ink">¿Dónde sentís las molestias?</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {bodyParts.map((part) => {
              const Icon = part.icon;
              return (
                <button
                  key={part.id}
                  onClick={() => handleSelectPart(part)}
                  className="flex flex-col items-center gap-2 bg-white rounded-2xl border border-border-light p-4 hover:shadow-md hover:-translate-y-0.5 transition group"
                >
                  <div className="w-11 h-11 rounded-xl bg-celeste-50 flex items-center justify-center group-hover:bg-celeste-100 transition">
                    <Icon className="w-5 h-5 text-celeste-dark" />
                  </div>
                  <span className="text-xs font-semibold text-ink-500 text-center">
                    {part.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Step 2: Symptom details ───────────────────── */}
      {step === "details" && selectedPart && (
        <div className="space-y-5">
          <button
            onClick={() => setStep("select")}
            className="flex items-center gap-1 text-sm text-ink-muted hover:text-ink transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>

          <div className="bg-white rounded-2xl border border-border-light p-5 space-y-5">
            {/* Symptoms */}
            <div>
              <h3 className="text-sm font-semibold text-ink mb-3">
                ¿Qué síntomas tenés? ({selectedPart.label})
              </h3>
              <div className="flex flex-wrap gap-2">
                {selectedPart.symptoms.map((s) => (
                  <button
                    key={s}
                    onClick={() => toggleSymptom(s)}
                    className={`text-sm px-3 py-1.5 rounded-full border transition ${
                      selectedSymptoms.includes(s)
                        ? "border-celeste-dark bg-celeste-50 text-celeste-dark font-medium"
                        : "border-border-light text-ink-500 hover:border-celeste-200"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div>
              <h3 className="text-sm font-semibold text-ink mb-3">¿Hace cuánto empezó?</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  ["hoy", "Hoy"],
                  ["ayer", "Ayer"],
                  ["unos-dias", "Hace unos días"],
                  ["una-semana", "Hace una semana"],
                  ["mas-de-una-semana", "Más de una semana"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => setDuration(value)}
                    className={`text-sm px-3 py-1.5 rounded-full border transition ${
                      duration === value
                        ? "border-celeste-dark bg-celeste-50 text-celeste-dark font-medium"
                        : "border-border-light text-ink-500 hover:border-celeste-200"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Intensity */}
            <div>
              <h3 className="text-sm font-semibold text-ink mb-3">
                Intensidad de las molestias:{" "}
                <span className="text-celeste-dark">{intensity}/10</span>
              </h3>
              <input
                type="range"
                min={1}
                max={10}
                value={intensity}
                onChange={(e) => setIntensity(Number(e.target.value))}
                className="w-full accent-celeste-dark"
              />
              <div className="flex justify-between text-[11px] text-ink-muted">
                <span>Leve</span>
                <span>Moderado</span>
                <span>Intenso</span>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={selectedSymptoms.length === 0}
              className="w-full bg-celeste-dark hover:bg-celeste-700 disabled:bg-ink-100 disabled:text-ink-300 text-white text-sm font-semibold py-3 rounded-[4px] transition"
            >
              Evaluar síntomas
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: Result ────────────────────────────── */}
      {step === "result" && result && (
        <div className="space-y-5">
          <button
            onClick={reset}
            className="flex items-center gap-1 text-sm text-ink-muted hover:text-ink transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Evaluar de nuevo
          </button>

          {/* Severity card */}
          <div
            className={`rounded-2xl p-6 ${
              result.severity === "urgente"
                ? "bg-red-50 border-2 border-red-300"
                : result.severity === "moderado"
                  ? "bg-amber-50 border border-amber-200"
                  : "bg-success-50 border border-success-200"
            }`}
          >
            <div className="flex items-start gap-3">
              {result.severity === "urgente" && (
                <AlertTriangle className="w-6 h-6 text-red-600 shrink-0" />
              )}
              {result.severity === "moderado" && (
                <Activity className="w-6 h-6 text-amber-600 shrink-0" />
              )}
              {result.severity === "leve" && (
                <CheckCircle2 className="w-6 h-6 text-success-600 shrink-0" />
              )}
              <div>
                <h2
                  className={`text-lg font-bold ${
                    result.severity === "urgente"
                      ? "text-red-800"
                      : result.severity === "moderado"
                        ? "text-amber-800"
                        : "text-success-800"
                  }`}
                >
                  {result.title}
                </h2>
                <p
                  className={`text-sm mt-1 ${
                    result.severity === "urgente"
                      ? "text-red-700"
                      : result.severity === "moderado"
                        ? "text-amber-700"
                        : "text-success-700"
                  }`}
                >
                  {result.recommendation}
                </p>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Doctor recommendation */}
            <div className="bg-white rounded-2xl border border-border-light p-5">
              <h3 className="text-sm font-bold text-ink mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-celeste-dark" />
                Profesional sugerido
              </h3>
              <p className="text-sm text-ink-500">{result.doctorType}</p>
              <p className="text-xs text-ink-muted mt-1">Consultá: {result.shouldSeek}</p>
              <button
                onClick={() => showToast("Redirigiendo a búsqueda de médicos…")}
                className="mt-3 text-sm font-semibold text-celeste-dark hover:text-celeste-700 flex items-center gap-1 transition"
              >
                Buscar médico <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* OTC meds */}
            {result.otcMeds.length > 0 && (
              <div className="bg-white rounded-2xl border border-border-light p-5">
                <h3 className="text-sm font-bold text-ink mb-3 flex items-center gap-2">
                  <Pill className="w-4 h-4 text-amber-600" />
                  Podés tomar (venta libre)
                </h3>
                <div className="space-y-2">
                  {result.otcMeds.map((med) => (
                    <div key={med.name}>
                      <p className="text-sm font-medium text-ink">{med.name}</p>
                      <p className="text-xs text-ink-muted">{med.dose}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Home remedies */}
            {result.homeRemedies.length > 0 && (
              <div className="bg-white rounded-2xl border border-border-light p-5">
                <h3 className="text-sm font-bold text-ink mb-3">Cuidados en casa</h3>
                <ul className="space-y-1.5">
                  {result.homeRemedies.map((r) => (
                    <li key={r} className="text-sm text-ink-500 flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-success-500 mt-0.5 shrink-0" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Red flags */}
            {result.redFlags.length > 0 && (
              <div className="bg-white rounded-2xl border border-border-light p-5">
                <h3 className="text-sm font-bold text-ink mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  Señales de alarma
                </h3>
                <ul className="space-y-1.5">
                  {result.redFlags.map((f) => (
                    <li key={f} className="text-sm text-red-600 flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => showToast("Reserva de turno disponible próximamente")}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-celeste-dark hover:bg-celeste-700 text-white text-sm font-semibold py-3 rounded-[4px] transition"
            >
              <Calendar className="w-4 h-4" />
              Sacar turno ahora
            </button>
            <button
              onClick={() => showToast("Abriendo chat con Cora…")}
              className="flex-1 inline-flex items-center justify-center gap-2 border border-border-light text-ink-500 text-sm font-medium py-3 rounded-[4px] hover:bg-ink-50 transition"
            >
              <MessageSquare className="w-4 h-4" />
              Hablar con Cora
            </button>
            {result.severity === "urgente" && (
              <a
                href="tel:107"
                className="flex-1 inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-3 rounded-[4px] transition"
              >
                <Phone className="w-4 h-4" />
                Llamar al 107
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Historia Clínica Service ────────────────────────────────
// Queries across multiple tables (consultations, clinical_notes,
// prescriptions, triages) to build a unified patient timeline.

import { isSupabaseConfigured } from "@/lib/env";
import { delay } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────

export type HistoriaEventType =
  | "consulta"
  | "laboratorio"
  | "imagen"
  | "receta"
  | "vacuna"
  | "internacion"
  | "triage"
  | "nota_clinica";

export interface HistoriaEvent {
  id: string;
  type: HistoriaEventType;
  title: string;
  description: string;
  doctor: string;
  date: string; // YYYY-MM-DD
  details?: string[];
  attachments?: { name: string; type: string; url?: string }[];
  metadata?: Record<string, string>;
}

export interface HistoriaFilter {
  types?: HistoriaEventType[];
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface HistoriaSummary {
  consultas: number;
  laboratorio: number;
  imagenes: number;
  recetas: number;
  triages: number;
  total: number;
}

// ─── Fetch Historia ──────────────────────────────────────────

/**
 * Fetch the full clinical history for a patient.
 * Aggregates data from consultations, clinical_notes, prescriptions, and triages.
 */
export async function getHistoriaClinica(
  patientName: string,
  filter?: HistoriaFilter,
): Promise<HistoriaEvent[]> {
  if (isSupabaseConfigured()) {
    const { createClient } = await import("@/lib/supabase/client");
    const sb = createClient();

    const events: HistoriaEvent[] = [];

    // 1. Consultations
    const { data: consultations } = await sb
      .from("consultations")
      .select("*")
      .ilike("patient_name", `%${patientName}%`)
      .order("date", { ascending: false });

    for (const c of consultations ?? []) {
      events.push({
        id: `consult-${c.id}`,
        type: "consulta",
        title: `${c.specialty ?? "Consulta"} - ${c.code}`,
        description: `Consulta ${c.status === "completed" ? "completada" : c.status}`,
        doctor: c.doctor_name,
        date: c.date,
        details: [
          `Especialidad: ${c.specialty ?? "General"}`,
          `Estado: ${c.status}`,
          c.billed ? "Facturada" : "Sin facturar",
          c.financiador ? `Financiador: ${c.financiador}` : "",
        ].filter(Boolean),
      });
    }

    // 2. Clinical notes (linked to triages or consultations)
    const { data: notes } = await sb
      .from("clinical_notes")
      .select("*")
      .ilike("patient_name", `%${patientName}%`)
      .order("created_at", { ascending: false });

    for (const n of notes ?? []) {
      events.push({
        id: `note-${n.id}`,
        type: "nota_clinica",
        title: `Nota clínica - ${n.doctor_name}`,
        description: n.notes ?? "Sin notas",
        doctor: n.doctor_name,
        date: (n.created_at ?? "").slice(0, 10),
        details: [
          n.treatment_plan ? `Plan: ${n.treatment_plan}` : "",
          Array.isArray(n.icd10_codes) && n.icd10_codes.length > 0
            ? `CIE-10: ${(n.icd10_codes as string[]).join(", ")}`
            : "",
        ].filter(Boolean),
      });
    }

    // 3. Prescriptions
    const { data: prescriptions } = await sb
      .from("prescriptions")
      .select("*")
      .ilike("patient_name", `%${patientName}%`)
      .order("created_at", { ascending: false });

    for (const p of prescriptions ?? []) {
      const items =
        typeof p.items === "string" ? JSON.parse(p.items) : Array.isArray(p.items) ? p.items : [];
      events.push({
        id: `rx-${p.id}`,
        type: "receta",
        title: `Receta - ${p.code}`,
        description: `${items.length} medicamentos - ${p.status}`,
        doctor: p.doctor_name,
        date: (p.created_at ?? "").slice(0, 10),
        details: items.map(
          (item: { name?: string; dose?: string }) =>
            `${item.name ?? "Medicamento"}${item.dose ? ` ${item.dose}` : ""}`,
        ),
      });
    }

    // 4. Triages
    const { data: triages } = await sb
      .from("triages")
      .select("*")
      .ilike("patient_name", `%${patientName}%`)
      .order("created_at", { ascending: false });

    for (const t of triages ?? []) {
      const symptoms =
        typeof t.symptoms === "string"
          ? JSON.parse(t.symptoms)
          : Array.isArray(t.symptoms)
            ? t.symptoms
            : [];
      const symptomsArr = Array.isArray(symptoms) ? symptoms : [];
      events.push({
        id: `triage-${t.id}`,
        type: "triage",
        title: `Triage - Severidad ${t.severity}`,
        description: `Derivado a: ${t.routed_specialty ?? "General"}`,
        doctor: "Sistema de Triage",
        date: (t.created_at ?? "").slice(0, 10),
        details: [
          `Severidad: ${t.severity}`,
          `Especialidad: ${t.routed_specialty ?? "General"}`,
          `Estado: ${t.status}`,
          symptomsArr.length > 0
            ? `Síntomas: ${symptomsArr.map((s: { name?: string }) => (typeof s === "object" && s?.name ? s.name : String(s))).join(", ")}`
            : "",
        ].filter(Boolean),
      });
    }

    // Sort all events by date descending
    events.sort((a, b) => b.date.localeCompare(a.date));

    // Apply filters
    let filtered = events;
    if (filter?.types && filter.types.length > 0) {
      filtered = filtered.filter((e) => filter.types!.includes(e.type));
    }
    if (filter?.search) {
      const s = filter.search.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.title.toLowerCase().includes(s) ||
          e.doctor.toLowerCase().includes(s) ||
          e.description.toLowerCase().includes(s),
      );
    }
    if (filter?.dateFrom) {
      filtered = filtered.filter((e) => e.date >= filter.dateFrom!);
    }
    if (filter?.dateTo) {
      filtered = filtered.filter((e) => e.date <= filter.dateTo!);
    }

    return filtered;
  }

  // ── Demo mode: return mock data ──
  await delay(200);
  return getDemoHistoria(filter);
}

/**
 * Get summary counts for a patient's history.
 */
export async function getHistoriaSummary(patientName: string): Promise<HistoriaSummary> {
  const events = await getHistoriaClinica(patientName);

  return {
    consultas: events.filter((e) => e.type === "consulta").length,
    laboratorio: events.filter((e) => e.type === "laboratorio").length,
    imagenes: events.filter((e) => e.type === "imagen").length,
    recetas: events.filter((e) => e.type === "receta").length,
    triages: events.filter((e) => e.type === "triage" || e.type === "nota_clinica").length,
    total: events.length,
  };
}

// ─── Demo Data ───────────────────────────────────────────────

function getDemoHistoria(filter?: HistoriaFilter): HistoriaEvent[] {
  const events: HistoriaEvent[] = [
    {
      id: "h1",
      type: "consulta",
      title: "Control cardiológico",
      description: "Electrocardiograma normal. Se ajusta medicación.",
      doctor: "Dr. Carlos Ruiz",
      date: "2026-03-05",
      details: ["ECG: ritmo sinusal normal", "PA: 120/80 mmHg", "Se reduce Atorvastatina a 10mg"],
    },
    {
      id: "h2",
      type: "laboratorio",
      title: "Hemograma completo + Perfil lipídico",
      description: "Resultados dentro de parámetros normales.",
      doctor: "Dra. Laura Méndez",
      date: "2026-02-28",
      details: [
        "Hemoglobina: 14.2 g/dL",
        "Colesterol total: 195 mg/dL",
        "LDL: 110 mg/dL",
        "HDL: 55 mg/dL",
        "Triglicéridos: 120 mg/dL",
        "Glucemia: 98 mg/dL",
      ],
      attachments: [{ name: "Resultados_Lab_28Feb.pdf", type: "PDF" }],
    },
    {
      id: "h3",
      type: "receta",
      title: "Receta - Losartán, Metformina, Atorvastatina",
      description: "Renovación de medicación crónica.",
      doctor: "Dra. Laura Méndez",
      date: "2026-02-15",
      details: ["Losartán 50mg x 30", "Metformina 850mg x 60", "Atorvastatina 20mg x 30"],
      attachments: [{ name: "Receta_15Feb.pdf", type: "PDF" }],
    },
    {
      id: "h4",
      type: "consulta",
      title: "Control clínico general",
      description: "Paciente en buen estado general. Se solicita lab de control.",
      doctor: "Dra. Laura Méndez",
      date: "2026-02-10",
      details: ["Peso: 72.5 kg", "PA: 125/82 mmHg", "Se solicita hemograma + perfil lipídico"],
    },
    {
      id: "h5",
      type: "imagen",
      title: "Eco Doppler cardíaco",
      description: "Fracción de eyección normal. Sin alteraciones significativas.",
      doctor: "Dr. Carlos Ruiz",
      date: "2026-01-20",
      details: ["FE: 62%", "Cavidades de tamaño normal", "Sin valvulopatías significativas"],
      attachments: [{ name: "EcoDoppler_20Ene.pdf", type: "PDF" }],
    },
    {
      id: "h6",
      type: "vacuna",
      title: "Vacuna antigripal 2026",
      description: "Aplicación vacuna influenza tetravalente.",
      doctor: "Vacunatorio Centro",
      date: "2026-01-15",
    },
    {
      id: "h7",
      type: "triage",
      title: "Triage - Dolor torácico",
      description: "Evaluación de emergencia. Derivado a cardiología.",
      doctor: "Sistema de Triage",
      date: "2026-01-10",
      details: [
        "Severidad: Moderada",
        "Especialidad: Cardiología",
        "Estado: Completado",
        "Síntomas: dolor torácico, disnea leve",
      ],
    },
    {
      id: "h8",
      type: "laboratorio",
      title: "Análisis de orina",
      description: "Sin particularidades.",
      doctor: "Dra. Laura Méndez",
      date: "2026-02-10",
      details: ["pH: 6.0", "Proteínas: negativo", "Glucosa: negativo", "Sedimento: normal"],
    },
  ];

  let filtered = events;
  if (filter?.types && filter.types.length > 0) {
    filtered = filtered.filter((e) => filter.types!.includes(e.type));
  }
  if (filter?.search) {
    const s = filter.search.toLowerCase();
    filtered = filtered.filter(
      (e) =>
        e.title.toLowerCase().includes(s) ||
        e.doctor.toLowerCase().includes(s) ||
        e.description.toLowerCase().includes(s),
    );
  }

  return filtered;
}

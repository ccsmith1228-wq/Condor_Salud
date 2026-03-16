// ─── Triage Service Layer ────────────────────────────────────
// Real Supabase queries with mock fallback when not configured.

import { isSupabaseConfigured } from "@/lib/env";
import type { Triage, ClinicalNote } from "@/lib/types";

// ─── Static Data ─────────────────────────────────────────────

export const bodySystems: Record<string, string[]> = {
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

export const symptomToSpecialty: Record<string, string> = {
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

export const icd10Codes = [
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

export const severityLabels: Record<number, string> = {
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

export const frequencyOptions = ["Primera vez", "Ocasional", "Frecuente", "Diario", "Constante"];

// ─── Mock Data ───────────────────────────────────────────────

const mockTriages: Triage[] = [
  {
    id: "1",
    code: "TRI-0341",
    patientName: "Carlos Méndez",
    date: "10/03/2026 09:45",
    symptoms: ["Dolor de pecho", "Falta de aire"],
    severity: 7,
    frequency: "Frecuente",
    duration: "3 días",
    triggers: "Al caminar",
    freeNotes: "",
    photoUrls: [],
    routedSpecialty: "Cardiología",
    routedDoctor: "Dra. Fernández",
    status: "Completado",
  },
  {
    id: "2",
    code: "TRI-0340",
    patientName: "Ana Rodríguez",
    date: "10/03/2026 08:30",
    symptoms: ["Dolor de espalda", "Rigidez muscular"],
    severity: 5,
    frequency: "Diario",
    duration: "2 semanas",
    triggers: "Al despertar",
    freeNotes: "",
    photoUrls: [],
    routedSpecialty: "Traumatología",
    routedDoctor: "Dra. Sánchez",
    status: "En consulta",
  },
  {
    id: "3",
    code: "TRI-0339",
    patientName: "Pedro Silva",
    date: "09/03/2026 16:20",
    symptoms: ["Erupciones", "Picazón"],
    severity: 4,
    frequency: "Primera vez",
    duration: "1 semana",
    triggers: "Contacto con plantas",
    freeNotes: "",
    photoUrls: [],
    routedSpecialty: "Dermatología",
    routedDoctor: "Dr. García",
    status: "Completado",
  },
  {
    id: "4",
    code: "TRI-0338",
    patientName: "Marta Gutiérrez",
    date: "09/03/2026 14:10",
    symptoms: ["Dolor abdominal", "Náuseas", "Acidez"],
    severity: 6,
    frequency: "Frecuente",
    duration: "5 días",
    triggers: "Después de comer",
    freeNotes: "",
    photoUrls: [],
    routedSpecialty: "Gastroenterología",
    routedDoctor: "Dr. Rossi",
    status: "Completado",
  },
];

// ─── Service Functions ───────────────────────────────────────

async function getSupabase() {
  const { createClient } = await import("@/lib/supabase/client");
  return createClient();
}

export async function getTriages(): Promise<Triage[]> {
  if (!isSupabaseConfigured()) return mockTriages;
  try {
    const sb = await getSupabase();
    const { data, error } = await sb
      .from("triages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) throw error;
    return (data || []).map((r) => ({
      id: r.id,
      code: r.code,
      patientName: r.patient_name,
      date: r.created_at,
      symptoms: (r.symptoms || []) as string[],
      severity: r.severity,
      frequency: r.frequency,
      duration: r.duration || "",
      triggers: r.triggers || "",
      freeNotes: r.free_notes || "",
      photoUrls: (r.photo_urls || []) as string[],
      routedSpecialty: r.routed_specialty || "",
      routedDoctor: r.routed_doctor || "",
      status: r.status as Triage["status"],
    }));
  } catch {
    return mockTriages;
  }
}

export async function createTriage(data: {
  patientName: string;
  symptoms: string[];
  severity: number;
  frequency: string;
  duration: string;
  triggers: string;
  freeNotes: string;
}): Promise<Triage | null> {
  if (!isSupabaseConfigured()) return null;
  const sb = await getSupabase();
  // Q-01: Use crypto for unique ID instead of Math.random()
  const code = `TRI-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  const routedSpecialties = Array.from(
    new Set(data.symptoms.map((s) => symptomToSpecialty[s]).filter(Boolean)),
  );
  const { data: row, error } = await sb
    .from("triages")
    .insert({
      code,
      patient_name: data.patientName,
      symptoms: data.symptoms,
      severity: data.severity,
      frequency: data.frequency,
      duration: data.duration,
      triggers: data.triggers,
      free_notes: data.freeNotes,
      routed_specialty: routedSpecialties[0] || null,
      status: "Pendiente",
    })
    .select()
    .single();
  if (error) throw error;
  return {
    id: row.id,
    code: row.code,
    patientName: row.patient_name,
    date: row.created_at,
    symptoms: (row.symptoms || []) as string[],
    severity: row.severity,
    frequency: row.frequency,
    duration: row.duration || "",
    triggers: row.triggers || "",
    freeNotes: row.free_notes || "",
    photoUrls: [],
    routedSpecialty: row.routed_specialty || "",
    routedDoctor: "",
    status: row.status as Triage["status"],
  };
}

export async function saveClinicalNote(data: {
  triageId?: string;
  consultationId?: string;
  doctorName: string;
  patientName: string;
  icd10Codes: { code: string; description: string }[];
  notes: string;
  treatmentPlan: string;
  referrals: string[];
}): Promise<ClinicalNote | null> {
  if (!isSupabaseConfigured()) return null;
  const sb = await getSupabase();
  const { data: row, error } = await sb
    .from("clinical_notes")
    .insert({
      triage_id: data.triageId || null,
      consultation_id: data.consultationId || null,
      doctor_name: data.doctorName,
      patient_name: data.patientName,
      icd10_codes: data.icd10Codes,
      notes: data.notes,
      treatment_plan: data.treatmentPlan,
      referrals: data.referrals,
    })
    .select()
    .single();
  if (error) throw error;
  return {
    id: row.id,
    triageId: row.triage_id ?? undefined,
    consultationId: row.consultation_id ?? undefined,
    doctorName: row.doctor_name,
    patientName: row.patient_name,
    icd10Codes: (row.icd10_codes || []) as { code: string; description: string }[],
    notes: row.notes || "",
    treatmentPlan: row.treatment_plan || "",
    referrals: (row.referrals || []) as string[],
    date: row.date,
  };
}

const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];
const MAX_PHOTO_SIZE = 10 * 1024 * 1024; // 10 MB

export async function uploadTriagePhoto(triageId: string, file: File): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  // SH-08: Validate file type and size
  if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
    throw new Error(
      `Tipo de archivo no permitido: ${file.type}. Permitidos: JPEG, PNG, WebP, HEIC`,
    );
  }
  if (file.size > MAX_PHOTO_SIZE) {
    throw new Error(
      `Archivo demasiado grande (${(file.size / 1024 / 1024).toFixed(1)} MB). Máximo: 10 MB`,
    );
  }
  const sb = await getSupabase();
  const ext = file.name.split(".").pop();
  const path = `${triageId}/${Date.now()}.${ext}`;
  const { error } = await sb.storage.from("triage-photos").upload(path, file);
  if (error) return null;
  const { data: urlData } = sb.storage.from("triage-photos").getPublicUrl(path);
  // Update triage record
  const { data: triage } = await sb
    .from("triages")
    .select("photo_urls")
    .eq("id", triageId)
    .single();
  const urls = [...((triage?.photo_urls as string[]) || []), urlData.publicUrl];
  await sb.from("triages").update({ photo_urls: urls }).eq("id", triageId);
  return urlData.publicUrl;
}

export async function getTriageKPIs() {
  const triages = await getTriages();
  return {
    todayCount: triages.length,
    pending: triages.filter((t) => t.status === "Pendiente").length,
    routed: triages.filter((t) => t.routedSpecialty).length,
    highSeverity: triages.filter((t) => t.severity >= 7).length,
  };
}

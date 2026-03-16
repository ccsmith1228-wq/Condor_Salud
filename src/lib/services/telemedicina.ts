// ─── Telemedicina Service Layer ──────────────────────────────
// Real Supabase queries with mock fallback when not configured.

import { isSupabaseConfigured } from "@/lib/env";
import type { WaitingRoomEntry, Consultation } from "@/lib/types";

// ─── Mock Data ───────────────────────────────────────────────

const mockWaitingRoom: WaitingRoomEntry[] = [
  {
    id: "1",
    patientName: "Elena Martínez",
    age: 45,
    reason: "Control cardiológico",
    queuePosition: 1,
    waitTime: "2 min",
    intakeComplete: true,
    financiador: "OSDE",
    joinedAt: "10:15",
  },
  {
    id: "2",
    patientName: "Raúl Gómez",
    age: 62,
    reason: "Dolor lumbar persistente",
    queuePosition: 2,
    waitTime: "8 min",
    intakeComplete: true,
    financiador: "PAMI",
    joinedAt: "10:20",
  },
  {
    id: "3",
    patientName: "Carolina López",
    age: 31,
    reason: "Seguimiento embarazo",
    queuePosition: 3,
    waitTime: "15 min",
    intakeComplete: false,
    financiador: "Swiss Medical",
    joinedAt: "10:28",
  },
];

const mockConsultations: Consultation[] = [
  {
    id: "1",
    code: "TC-0811",
    patientName: "Jorge Álvarez",
    doctorName: "Dra. Fernández",
    specialty: "Clínica médica",
    date: "10/03/2026",
    time: "09:30",
    duration: "22 min",
    status: "Completada",
    billed: true,
    billCode: "420101",
    prescriptionSent: true,
    summarySent: true,
    financiador: "PAMI",
  },
  {
    id: "2",
    code: "TC-0810",
    patientName: "Marta Sosa",
    doctorName: "Dr. García",
    specialty: "Dermatología",
    date: "10/03/2026",
    time: "09:00",
    duration: "18 min",
    status: "Completada",
    billed: true,
    billCode: "420101",
    prescriptionSent: false,
    summarySent: true,
    financiador: "OSDE",
  },
  {
    id: "3",
    code: "TC-0809",
    patientName: "Luis Herrera",
    doctorName: "Dra. Moreno",
    specialty: "Pediatría",
    date: "09/03/2026",
    time: "16:45",
    duration: "15 min",
    status: "Completada",
    billed: false,
    billCode: null,
    prescriptionSent: true,
    summarySent: false,
    financiador: "IOMA",
  },
  {
    id: "4",
    code: "TC-0808",
    patientName: "Ana Colombo",
    doctorName: "Dr. Pérez",
    specialty: "Endocrinología",
    date: "09/03/2026",
    time: "15:30",
    duration: "25 min",
    status: "No show",
    billed: false,
    billCode: null,
    prescriptionSent: false,
    summarySent: false,
    financiador: "Swiss Medical",
  },
];

const mockScheduled: Consultation[] = [
  {
    id: "5",
    code: "TC-0815",
    patientName: "Roberto Díaz",
    doctorName: "Dra. Fernández",
    specialty: "Clínica médica",
    date: "10/03/2026",
    time: "11:00",
    duration: "",
    status: "Programada",
    billed: false,
    billCode: null,
    prescriptionSent: false,
    summarySent: false,
    financiador: "IOMA",
    videoRoomUrl: "https://meet.condorsalud.com/tc-0815",
  },
  {
    id: "6",
    code: "TC-0816",
    patientName: "Silvia Peralta",
    doctorName: "Dr. García",
    specialty: "Dermatología",
    date: "10/03/2026",
    time: "11:30",
    duration: "",
    status: "Programada",
    billed: false,
    billCode: null,
    prescriptionSent: false,
    summarySent: false,
    financiador: "OSDE",
    videoRoomUrl: "https://meet.condorsalud.com/tc-0816",
  },
  {
    id: "7",
    code: "TC-0817",
    patientName: "Marcos Iglesias",
    doctorName: "Dra. Moreno",
    specialty: "Traumatología",
    date: "10/03/2026",
    time: "14:00",
    duration: "",
    status: "Programada",
    billed: false,
    billCode: null,
    prescriptionSent: false,
    summarySent: false,
    financiador: "Swiss Medical",
    videoRoomUrl: "https://meet.condorsalud.com/tc-0817",
  },
];

// ─── Service Functions ───────────────────────────────────────

async function getSupabase() {
  const { createClient } = await import("@/lib/supabase/client");
  return createClient();
}

export async function getWaitingRoom(): Promise<WaitingRoomEntry[]> {
  if (!isSupabaseConfigured()) return mockWaitingRoom;
  try {
    const sb = await getSupabase();
    const { data, error } = await sb.from("waiting_room").select("*").order("queue_position");
    if (error) throw error;
    return (data || []).map((r) => ({
      id: r.id,
      patientName: r.patient_name,
      age: r.age ?? 0,
      reason: r.reason,
      queuePosition: r.queue_position,
      waitTime: r.wait_time || "",
      intakeComplete: r.intake_complete,
      financiador: r.financiador || "",
      joinedAt: new Date(r.joined_at).toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    }));
  } catch {
    return mockWaitingRoom;
  }
}

export async function getConsultations(): Promise<Consultation[]> {
  if (!isSupabaseConfigured()) return mockConsultations;
  try {
    const sb = await getSupabase();
    const { data, error } = await sb
      .from("consultations")
      .select("*")
      .in("status", ["Completada", "No show"])
      .order("date", { ascending: false })
      .order("time", { ascending: false })
      .limit(20);
    if (error) throw error;
    return (data || []).map(mapConsultation);
  } catch {
    return mockConsultations;
  }
}

export async function getScheduledConsultations(): Promise<Consultation[]> {
  if (!isSupabaseConfigured()) return mockScheduled;
  try {
    const sb = await getSupabase();
    const { data, error } = await sb
      .from("consultations")
      .select("*")
      .eq("status", "Programada")
      .order("date")
      .order("time");
    if (error) throw error;
    return (data || []).map(mapConsultation);
  } catch {
    return mockScheduled;
  }
}

function mapConsultation(r: Record<string, unknown>): Consultation {
  return {
    id: r.id as string,
    code: r.code as string,
    patientName: r.patient_name as string,
    doctorName: r.doctor_name as string,
    specialty: r.specialty as string,
    date: r.date as string,
    time: r.time as string,
    duration: (r.duration as string) || "",
    status: r.status as Consultation["status"],
    billed: r.billed as boolean,
    billCode: r.bill_code as string | null,
    prescriptionSent: r.prescription_sent as boolean,
    summarySent: r.summary_sent as boolean,
    financiador: r.financiador as string,
    videoRoomUrl: r.video_room_url as string | undefined,
  };
}

export async function createVideoRoom(consultationId: string): Promise<string | null> {
  try {
    const res = await fetch("/api/telemedicina/room", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ consultationId }),
    });
    if (!res.ok) return null;
    const { url } = await res.json();
    return url;
  } catch {
    return null;
  }
}

export async function sendWhatsAppSummary(consultationId: string): Promise<boolean> {
  try {
    const res = await fetch("/api/telemedicina/whatsapp-summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ consultationId }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function getTelemedicinaKPIs() {
  const [waiting, consultations] = await Promise.all([getWaitingRoom(), getConsultations()]);
  const completed = consultations.filter((c) => c.status === "Completada");
  return {
    inWaiting: waiting.length,
    todayCount: consultations.length,
    billed: completed.filter((c) => c.billed).length,
    prescriptionsSent: completed.filter((c) => c.prescriptionSent).length,
  };
}

// ─── Directorio Médico Service Layer ─────────────────────────
// Real Supabase queries with mock fallback when not configured.

import { isSupabaseConfigured } from "@/lib/env";
import type { Doctor, DoctorReview } from "@/lib/types";

// ─── Static Data ─────────────────────────────────────────────

export const specialties = [
  "Todas",
  "Cardiología",
  "Clínica médica",
  "Dermatología",
  "Endocrinología",
  "Gastroenterología",
  "Ginecología",
  "Neurología",
  "Oftalmología",
  "Pediatría",
  "Traumatología",
  "Urología",
];

export const financiadoresOptions = [
  "Todos",
  "PAMI",
  "OSDE",
  "Swiss Medical",
  "IOMA",
  "Galeno",
  "Medifé",
];
export const locationOptions = ["Todas", "CABA", "La Plata", "Rosario", "Córdoba", "Mendoza"];

export const symptomToSpecialty: Record<string, string[]> = {
  "Dolor de espalda": ["Traumatología", "Clínica médica"],
  "Dolor de cabeza": ["Neurología", "Clínica médica"],
  "Problemas de piel": ["Dermatología"],
  "Dolor de pecho": ["Cardiología", "Clínica médica"],
  "Problemas digestivos": ["Gastroenterología", "Clínica médica"],
  "Problemas hormonales": ["Endocrinología"],
  "Control pediátrico": ["Pediatría"],
  "Problemas de visión": ["Oftalmología"],
  "Problemas urinarios": ["Urología"],
  "Control ginecológico": ["Ginecología"],
};

// ─── Mock Data ───────────────────────────────────────────────

const mockDoctors: Doctor[] = [
  {
    id: "1",
    name: "Dra. Laura Fernández",
    specialty: "Cardiología",
    location: "CABA",
    address: "Av. Santa Fe 2100, Piso 3",
    financiadores: ["OSDE", "Swiss Medical", "Galeno"],
    rating: 4.9,
    reviews: 127,
    nextSlot: "Hoy 14:30",
    available: true,
    teleconsulta: true,
    experience: "18 años",
    languages: ["Español", "Inglés"],
  },
  {
    id: "2",
    name: "Dr. Martín García",
    specialty: "Dermatología",
    location: "CABA",
    address: "Callao 850, Piso 8",
    financiadores: ["OSDE", "PAMI", "IOMA"],
    rating: 4.7,
    reviews: 89,
    nextSlot: "Mañana 09:00",
    available: true,
    teleconsulta: true,
    experience: "12 años",
    languages: ["Español"],
  },
  {
    id: "3",
    name: "Dra. Patricia Moreno",
    specialty: "Pediatría",
    location: "La Plata",
    address: "Calle 7 #1230",
    financiadores: ["IOMA", "OSDE", "Swiss Medical"],
    rating: 4.8,
    reviews: 203,
    nextSlot: "Hoy 16:00",
    available: true,
    teleconsulta: false,
    experience: "22 años",
    languages: ["Español"],
  },
  {
    id: "4",
    name: "Dr. Alejandro Pérez",
    specialty: "Endocrinología",
    location: "CABA",
    address: "Av. Córdoba 1500",
    financiadores: ["PAMI", "Galeno", "Medifé"],
    rating: 4.6,
    reviews: 64,
    nextSlot: "Jue 11:00",
    available: true,
    teleconsulta: true,
    experience: "15 años",
    languages: ["Español", "Portugués"],
  },
  {
    id: "5",
    name: "Dra. Claudia Sánchez",
    specialty: "Traumatología",
    location: "Rosario",
    address: "San Martín 920",
    financiadores: ["OSDE", "Swiss Medical"],
    rating: 4.5,
    reviews: 51,
    nextSlot: "Vie 10:00",
    available: true,
    teleconsulta: false,
    experience: "10 años",
    languages: ["Español"],
  },
  {
    id: "6",
    name: "Dr. Roberto López",
    specialty: "Clínica médica",
    location: "CABA",
    address: "Av. Rivadavia 4500",
    financiadores: ["PAMI", "IOMA", "Galeno", "Medifé"],
    rating: 4.4,
    reviews: 178,
    nextSlot: "Hoy 17:30",
    available: true,
    teleconsulta: true,
    experience: "25 años",
    languages: ["Español"],
  },
  {
    id: "7",
    name: "Dra. Mariana Vega",
    specialty: "Ginecología",
    location: "Córdoba",
    address: "Bv. San Juan 800",
    financiadores: ["OSDE", "Swiss Medical", "Galeno"],
    rating: 4.8,
    reviews: 95,
    nextSlot: "Lun 08:30",
    available: false,
    teleconsulta: true,
    experience: "14 años",
    languages: ["Español", "Inglés"],
  },
  {
    id: "8",
    name: "Dr. Federico Ruiz",
    specialty: "Neurología",
    location: "Mendoza",
    address: "Las Heras 450",
    financiadores: ["OSDE", "PAMI"],
    rating: 4.7,
    reviews: 42,
    nextSlot: "Mar 14:00",
    available: true,
    teleconsulta: true,
    experience: "20 años",
    languages: ["Español"],
  },
];

const mockReviews: DoctorReview[] = [
  {
    id: "1",
    doctorId: "1",
    patientName: "Carlos M.",
    rating: 5,
    text: "Excelente profesional. Muy atento y dedicado. Explica todo con claridad.",
    date: "02/03/2026",
  },
  {
    id: "2",
    doctorId: "1",
    patientName: "Ana L.",
    rating: 5,
    text: "La mejor cardióloga que consulté. Muy minuciosa en la revisión.",
    date: "25/02/2026",
  },
  {
    id: "3",
    doctorId: "1",
    patientName: "Roberto P.",
    rating: 4,
    text: "Buena atención aunque el turno demoró un poco. Muy profesional.",
    date: "18/02/2026",
  },
];

// ─── Service Functions ───────────────────────────────────────

async function getSupabase() {
  const { createClient } = await import("@/lib/supabase/client");
  return createClient();
}

export async function getDoctors(filters?: {
  specialty?: string;
  location?: string;
  financiador?: string;
  search?: string;
}): Promise<Doctor[]> {
  if (!isSupabaseConfigured()) {
    let result = mockDoctors;
    if (filters?.specialty && filters.specialty !== "Todas") {
      result = result.filter((d) => d.specialty === filters.specialty);
    }
    if (filters?.location && filters.location !== "Todas") {
      result = result.filter((d) => d.location === filters.location);
    }
    if (filters?.financiador && filters.financiador !== "Todos") {
      result = result.filter((d) => d.financiadores.includes(filters.financiador!));
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (d) => d.name.toLowerCase().includes(q) || d.specialty.toLowerCase().includes(q),
      );
    }
    return result;
  }
  try {
    const sb = await getSupabase();
    let query = sb
      .from("doctors")
      .select("*")
      .eq("active", true)
      .order("rating", { ascending: false });
    if (filters?.specialty && filters.specialty !== "Todas") {
      query = query.eq("specialty", filters.specialty);
    }
    if (filters?.location && filters.location !== "Todas") {
      query = query.eq("location", filters.location);
    }
    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,specialty.ilike.%${filters.search}%`);
    }
    const { data, error } = await query;
    if (error) throw error;
    let doctors = (data || []).map(mapDoctor);
    if (filters?.financiador && filters.financiador !== "Todos") {
      doctors = doctors.filter((d) => d.financiadores.includes(filters.financiador!));
    }
    return doctors;
  } catch {
    return mockDoctors;
  }
}

function mapDoctor(r: Record<string, unknown>): Doctor {
  return {
    id: r.id as string,
    name: r.name as string,
    specialty: r.specialty as string,
    location: r.location as string,
    address: (r.address as string) || "",
    financiadores: (r.financiadores as string[]) || [],
    rating: Number(r.rating) || 0,
    reviews: (r.review_count as number) || 0,
    nextSlot: (r.next_slot as string) || "",
    available: r.available as boolean,
    teleconsulta: r.teleconsulta as boolean,
    experience: (r.experience as string) || "",
    languages: (r.languages as string[]) || ["Español"],
  };
}

export async function getDoctorReviews(doctorId: string): Promise<DoctorReview[]> {
  if (!isSupabaseConfigured()) return mockReviews.filter((r) => r.doctorId === doctorId);
  try {
    const sb = await getSupabase();
    const { data, error } = await sb
      .from("doctor_reviews")
      .select("*")
      .eq("doctor_id", doctorId)
      .order("date", { ascending: false })
      .limit(10);
    if (error) throw error;
    return (data || []).map((r) => ({
      id: r.id,
      doctorId: r.doctor_id,
      patientName: r.patient_name,
      rating: r.rating,
      text: r.text || "",
      date: r.date,
    }));
  } catch {
    return mockReviews.filter((r) => r.doctorId === doctorId);
  }
}

export async function verifyPatientCoverage(
  patientFinanciador: string,
  doctorId: string,
): Promise<{
  covered: boolean;
  coveragePercent: number;
  estimatedCopago: number;
}> {
  // In production, call financiador API
  const doctor = (await getDoctors()).find((d) => d.id === doctorId);
  const covered = doctor?.financiadores.includes(patientFinanciador) ?? false;
  return {
    covered,
    coveragePercent: covered ? (patientFinanciador === "PAMI" ? 80 : 70) : 0,
    estimatedCopago: covered ? 2400 : 12000,
  };
}

export async function getDirectorioKPIs() {
  const doctors = await getDoctors();
  const availableToday = doctors.filter(
    (d) => d.available && d.nextSlot.toLowerCase().startsWith("hoy"),
  ).length;
  return {
    totalDoctors: doctors.length,
    totalSpecialties: new Set(doctors.map((d) => d.specialty)).size,
    availableToday,
    avgRating: (doctors.reduce((sum, d) => sum + d.rating, 0) / doctors.length).toFixed(1),
    totalReviews: doctors.reduce((sum, d) => sum + d.reviews, 0),
  };
}

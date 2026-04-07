// ─── Directorio Médico Service Layer ─────────────────────────
// Real Supabase queries with mock fallback when not configured.
// When GOOGLE_MAPS_API_KEY is set, enriches results with
// Google Maps profile URLs.

import { isSupabaseConfigured } from "@/lib/env";
import { getGoogleMapsSearchUrl } from "@/lib/doctor-search";
import type { Doctor, DoctorReview, DoctorScheduleEntry } from "@/lib/types";

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
    return enrichWithGoogleMaps(result);
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

    // ── Enrich with weekly schedule from doctor_availability ──
    const doctorIds = doctors.map((d) => d.id);
    if (doctorIds.length > 0) {
      const scheduleMap = await fetchDoctorSchedules(doctorIds);
      doctors = doctors.map((d) => ({
        ...d,
        schedule: scheduleMap[d.id] ?? [],
      }));
    }

    return enrichWithGoogleMaps(doctors);
  } catch {
    return [];
  }
}

// ─── Schedule derivation from availability slots ─────────────

const DAY_NAMES_ES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

interface AvailabilitySlot {
  doctor_id: string;
  date: string;
  time_slot: string;
}

/** Parse "HH:MM" → total minutes */
function toMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

/**
 * Fetches doctor_availability rows for the next 14 days and derives
 * a compact weekly schedule (day + start + end) per doctor.
 */
async function fetchDoctorSchedules(
  doctorIds: string[],
): Promise<Record<string, DoctorScheduleEntry[]>> {
  const result: Record<string, DoctorScheduleEntry[]> = {};
  try {
    // Use service-role client — doctor_availability has RLS policies only
    // for 'authenticated', and the browser anon client authenticates as 'anon',
    // which would return zero rows.
    const { getServiceClientSafe } = await import("@/lib/supabase/service");
    const sb = getServiceClientSafe();
    if (!sb) return result;

    const today = new Date();
    const future = new Date(today);
    future.setDate(future.getDate() + 14);
    const todayStr = today.toISOString().slice(0, 10);
    const futureStr = future.toISOString().slice(0, 10);

    const { data: slots, error } = await sb
      .from("doctor_availability")
      .select("doctor_id, date, time_slot")
      .in("doctor_id", doctorIds)
      .gte("date", todayStr)
      .lte("date", futureStr)
      .order("time_slot", { ascending: true });

    if (error || !slots) return result;

    // Group by doctor_id → day-of-week → list of time_slot strings
    const byDoctor: Record<string, Record<number, string[]>> = {};
    for (const raw of slots) {
      const slot = raw as unknown as AvailabilitySlot;
      const d = new Date(slot.date + "T00:00:00");
      const dow = d.getDay(); // 0=Sun..6=Sat
      const docEntry = byDoctor[slot.doctor_id] ?? (byDoctor[slot.doctor_id] = {});
      const dayEntry = docEntry[dow] ?? (docEntry[dow] = []);
      dayEntry.push(String(slot.time_slot));
    }

    // Derive start/end per day for each doctor
    for (const docId of Object.keys(byDoctor)) {
      const dayMap = byDoctor[docId] ?? {};
      const entries: DoctorScheduleEntry[] = [];
      for (const dayStr of Object.keys(dayMap)) {
        const day = Number(dayStr);
        const times = dayMap[day] ?? [];
        const unique = Array.from(new Set(times)).sort();
        if (unique.length === 0) continue;
        const first = unique[0] ?? "00:00";
        const last = unique[unique.length - 1] ?? first;

        // Infer slot duration from gap between first two slots (default 15 min).
        // Add it to the last slot to get the actual end time.
        let slotMin = 15;
        if (unique.length >= 2) {
          const t0 = toMinutes(unique[0] ?? "00:00");
          const t1 = toMinutes(unique[1] ?? "00:15");
          if (t1 > t0) slotMin = t1 - t0;
        }
        const endMin = toMinutes(last) + slotMin;
        const endTime = `${String(Math.floor(endMin / 60)).padStart(2, "0")}:${String(endMin % 60).padStart(2, "0")}`;

        entries.push({
          day,
          start: first.slice(0, 5),
          end: endTime,
        });
      }
      entries.sort((a, b) => a.day - b.day);
      result[docId] = entries;
    }
  } catch {
    // Non-fatal — return what we have
  }
  return result;
}

/**
 * Format a doctor's schedule into a compact display string.
 * e.g. "Lun 14:30–16:30 · Jue 10:00–12:00"
 */
export function formatDoctorSchedule(schedule?: DoctorScheduleEntry[]): string {
  if (!schedule || schedule.length === 0) return "";
  return schedule.map((s) => `${DAY_NAMES_ES[s.day]} ${s.start}–${s.end}`).join(" · ");
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
    source: "local",
    photoUrl: (r.photo_url as string) || undefined,
  };
}

// ─── Google Maps Enrichment ──────────────────────────────────

/**
 * Enrich doctors with Google Maps profile URLs.
 * Attaches a profileUrl pointing to Google Maps search for each doctor.
 */
function enrichWithGoogleMaps(doctors: Doctor[]): Doctor[] {
  return doctors.map((doc) => ({
    ...doc,
    profileUrl: doc.profileUrl || getGoogleMapsSearchUrl(doc.name),
    source: doc.source || "local",
  }));
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
    return [];
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

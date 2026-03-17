/**
 * TopDoctors.com.ar Integration Layer
 *
 * Maps Cóndor Salud specialties to TopDoctors search/booking URLs.
 * TopDoctors is Argentina's leading verified doctor directory.
 *
 * Booking flow:
 *   Patient clicks "Reservar" → redirected to TopDoctors booking page
 *   for the specific specialty or doctor search.
 */

const TOPDOCTORS_BASE = "https://www.topdoctors.com.ar";

// ── Specialty → TopDoctors category slug mapping ─────────────
const SPECIALTY_SLUGS: Record<string, string> = {
  Cardiología: "cardiologia-adultos",
  "Clínica médica": "clinica-medica",
  Dermatología: "dermatologia",
  Endocrinología: "endocrinologia",
  Gastroenterología: "gastroenterologia",
  Ginecología: "ginecologia-y-obstetricia",
  Neurología: "neurologia",
  Oftalmología: "oftalmologia",
  Pediatría: "pediatria",
  Traumatología: "traumatologia",
  Urología: "urologia",
  Otorrinolaringología: "otorrinolaringologia",
  Psiquiatría: "psiquiatria",
  Kinesiología: "kinesiologia-y-fisioterapia",
  Nutrición: "nutricion-y-dietetica",
  Odontología: "odontologia",
};

/**
 * Get the TopDoctors category page URL for a specialty.
 * Falls back to a search query if no slug mapping exists.
 */
export function getTopDoctorsSpecialtyUrl(specialty: string): string {
  const slug = SPECIALTY_SLUGS[specialty];
  if (slug) return `${TOPDOCTORS_BASE}/${slug}/`;
  return `${TOPDOCTORS_BASE}/buscar-especialistas/?q=${encodeURIComponent(specialty)}`;
}

/**
 * Get the TopDoctors search URL for a specific doctor name.
 */
export function getTopDoctorsSearchUrl(doctorName: string): string {
  return `${TOPDOCTORS_BASE}/buscar-especialistas/?q=${encodeURIComponent(doctorName)}`;
}

/**
 * Get the TopDoctors booking URL — specialty page with intent to book.
 * This is the URL for the "Reservar turno" action.
 */
export function getTopDoctorsBookingUrl(specialty: string, doctorName?: string): string {
  if (doctorName) {
    return getTopDoctorsSearchUrl(doctorName);
  }
  return getTopDoctorsSpecialtyUrl(specialty);
}

/**
 * TopDoctors-enriched doctor data for the directorio.
 * Combines our local mock doctors with TopDoctors URLs.
 */
export interface TopDoctorsDoctor {
  id: string;
  name: string;
  specialty: string;
  location: string;
  address: string;
  financiadores: string[];
  rating: number;
  reviews: number;
  nextSlot: string;
  available: boolean;
  teleconsulta: boolean;
  experience: string;
  languages: string[];
  topDoctorsUrl: string;
  bookingUrl: string;
  source: "topdoctors";
}

/**
 * Enrich a basic doctor record with TopDoctors URLs.
 */
export function enrichWithTopDoctors(doc: {
  id: string;
  name: string;
  specialty: string;
  location: string;
  address: string;
  financiadores: string[];
  rating: number;
  reviews: number;
  nextSlot: string;
  available: boolean;
  teleconsulta: boolean;
  experience: string;
  languages: string[];
}): TopDoctorsDoctor {
  return {
    ...doc,
    topDoctorsUrl: getTopDoctorsSearchUrl(doc.name),
    bookingUrl: getTopDoctorsBookingUrl(doc.specialty, doc.name),
    source: "topdoctors" as const,
  };
}

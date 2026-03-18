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

/**
 * Append locale hint to a TopDoctors URL.
 * TopDoctors.com.ar renders in Spanish by default; the `?hl=en`
 * query parameter switches the UI to English when available.
 */
function withLocale(url: string, locale?: string): string {
  if (!locale || locale.startsWith("es")) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}hl=${encodeURIComponent(locale.slice(0, 2))}`;
}

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
 * @param locale - Pass "en" to switch TopDoctors UI to English.
 */
export function getTopDoctorsSpecialtyUrl(specialty: string, locale?: string): string {
  const slug = SPECIALTY_SLUGS[specialty];
  if (slug) return withLocale(`${TOPDOCTORS_BASE}/${slug}/`, locale);
  return withLocale(
    `${TOPDOCTORS_BASE}/buscar-especialistas/?q=${encodeURIComponent(specialty)}`,
    locale,
  );
}

/**
 * Get the TopDoctors search URL for a specific doctor name.
 * @param locale - Pass "en" to switch TopDoctors UI to English.
 */
export function getTopDoctorsSearchUrl(doctorName: string, locale?: string): string {
  return withLocale(
    `${TOPDOCTORS_BASE}/buscar-especialistas/?q=${encodeURIComponent(doctorName)}`,
    locale,
  );
}

/**
 * Get the TopDoctors booking URL — specialty page with intent to book.
 * This is the URL for the "Reservar turno" action.
 * @param locale - Pass "en" to switch TopDoctors UI to English.
 */
export function getTopDoctorsBookingUrl(
  specialty: string,
  doctorName?: string,
  locale?: string,
): string {
  if (doctorName) {
    return getTopDoctorsSearchUrl(doctorName, locale);
  }
  return getTopDoctorsSpecialtyUrl(specialty, locale);
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
 * @param locale - Pass "en" to switch TopDoctors UI to English.
 */
export function enrichWithTopDoctors(
  doc: {
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
  },
  locale?: string,
): TopDoctorsDoctor {
  return {
    ...doc,
    topDoctorsUrl: getTopDoctorsSearchUrl(doc.name, locale),
    bookingUrl: getTopDoctorsBookingUrl(doc.specialty, doc.name, locale),
    source: "topdoctors" as const,
  };
}

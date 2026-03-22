/**
 * Doctor Enrichment Service — Server-side only.
 *
 * Scrapes doctor websites to extract:
 * - WhatsApp number (4 strategies)
 * - Booking link (Calendly, TurnoMed, Reservo, etc.)
 * - English-speaking indicator
 * - Insurance / obra social coverage
 * - Telehealth availability
 */

import * as cheerio from "cheerio";

// ── Known Argentine obras sociales / prepagas ────────────────

const INSURANCE_NAMES = [
  "OSDE",
  "Swiss Medical",
  "Galeno",
  "MEDICUS",
  "Medicus",
  "OMINT",
  "PAMI",
  "IOMA",
  "OSPJN",
  "OSECAC",
  "Hospital Italiano",
  "Sancor Salud",
  "Consolidar Salud",
  "Accord Salud",
  "AMSA",
  "Unión Personal",
  "OSSEG",
  "OSPACP",
  "OSAM",
  "OSPAT",
  "OSPE",
  "OSPLAD",
  "OSUTHGRA",
  "OSTEP",
  "OSPOCE",
  "OSMATA",
  "OSDIPP",
  "OSPA",
  "DASPU",
  "Luis Pasteur",
  "Jerárquicos Salud",
  "Sancor",
  "OSDE 210",
  "OSDE 310",
  "OSDE 410",
  "OSDE 450",
  "OSDE 510",
];

// ── Booking platform patterns ────────────────────────────────
// Detects external booking links on doctor websites during scraping.

const BOOKING_PLATFORMS: { re: RegExp; type: string }[] = [
  { re: /(?:https?:\/\/)?(?:www\.)?calendly\.com\/[\w-]+(\/[\w-]+)?/i, type: "Calendly" },
  { re: /(?:https?:\/\/)?(?:www\.)?cal\.com\/[\w-]+(\/[\w-]+)?/i, type: "Cal.com" },
  { re: /(?:https?:\/\/)?turno\.med\.ec[^\s"'<>]*/i, type: "TurnoMed" },
  { re: /(?:https?:\/\/)?reservo\.online[^\s"'<>]*/i, type: "Reservo" },
  { re: /(?:https?:\/\/)?miturno\.com\.ar[^\s"'<>]*/i, type: "MiTurno" },
  { re: /(?:https?:\/\/)?topdoctors\.com\.ar[^\s"'<>]*/i, type: "TopDoctors" },
  { re: /(?:https?:\/\/)?mediline\.com\.ar[^\s"'<>]*/i, type: "Mediline" },
];

// ── English-speaking indicator patterns ──────────────────────

const ENGLISH_PATTERNS = [
  /english[\s-]*spoken/i,
  /i[\s]*speak[\s]*english/i,
  /hablo[\s]*ingl[eé]s/i,
  /atenci[oó]n[\s]*en[\s]*ingl[eé]s/i,
  /english[\s-]*speaking/i,
  /biling[üu]e/i,
  /fluent[\s]*in[\s]*english/i,
  /speaks?\s+english/i,
  /consultorio[\s]*biling[üu]e/i,
];

// ── Telehealth detection patterns ────────────────────────────

const TELEHEALTH_PATTERNS = [
  /teleconsulta/i,
  /telemedicina/i,
  /videoconsulta/i,
  /consulta[\s-]*virtual/i,
  /consulta[\s-]*online/i,
  /atenci[oó]n[\s-]*virtual/i,
  /videollamada/i,
];

// ── In-memory cache ──────────────────────────────────────────

const cache = new Map<string, { data: unknown; expiresAt: number }>();
const CACHE_TTL = parseInt(process.env.CACHE_TTL_ENRICHED || "7200") * 1000;

function cacheGet<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry || Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function cacheSet(key: string, data: unknown): void {
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL });
}

// ── Enrichment result ────────────────────────────────────────

export interface EnrichmentResult {
  whatsapp: string | null;
  bookingUrl: string | null;
  bookingType: string | null;
  englishSpeaking: boolean;
  insurances: string[];
  telehealth: boolean;
  enriched: boolean;
  enrichmentSource: "scrape" | "cache" | "failed" | null;
}

// ── Service ──────────────────────────────────────────────────

export class DoctorEnrichmentService {
  private timeout: number;
  private userAgent: string;

  constructor() {
    this.timeout = parseInt(process.env.SCRAPER_TIMEOUT_MS || "8000");
    this.userAgent =
      process.env.SCRAPER_USER_AGENT || "CondorSalud/1.0 (+https://condorsalud.com.ar)";
  }

  /** Enrich a single doctor with scraped data from their website */
  async enrich(doctor: { website: string | null; name: string }): Promise<EnrichmentResult> {
    if (!doctor.website) {
      return {
        whatsapp: null,
        bookingUrl: null,
        bookingType: null,
        englishSpeaking: false,
        insurances: [],
        telehealth: false,
        enriched: false,
        enrichmentSource: null,
      };
    }

    const cacheKey = `enrich:${doctor.website}`;
    const cached = cacheGet<EnrichmentResult>(cacheKey);
    if (cached) return { ...cached, enrichmentSource: "cache" };

    try {
      const html = await this.fetchHtml(doctor.website);
      const $ = cheerio.load(html);

      const bookingData = this.extractBookingLink(html, $);
      const result: EnrichmentResult = {
        whatsapp: this.extractWhatsApp(html, $),
        bookingUrl: bookingData?.url || null,
        bookingType: bookingData?.type || null,
        englishSpeaking: this.detectEnglish(html),
        insurances: this.extractInsurances(html, $),
        telehealth: this.detectTelehealth(html),
        enriched: true,
        enrichmentSource: "scrape",
      };

      cacheSet(cacheKey, result);
      return result;
    } catch {
      return {
        whatsapp: null,
        bookingUrl: null,
        bookingType: null,
        englishSpeaking: false,
        insurances: [],
        telehealth: false,
        enriched: false,
        enrichmentSource: "failed",
      };
    }
  }

  /** Enrich a batch with concurrency control */
  async enrichBatch(
    doctors: Array<{ website: string | null; name: string }>,
    concurrency = 5,
  ): Promise<EnrichmentResult[]> {
    const results: EnrichmentResult[] = [];
    for (let i = 0; i < doctors.length; i += concurrency) {
      const chunk = doctors.slice(i, i + concurrency);
      const batch = await Promise.allSettled(chunk.map((d) => this.enrich(d)));
      for (const r of batch) {
        results.push(
          r.status === "fulfilled"
            ? r.value
            : {
                whatsapp: null,
                bookingUrl: null,
                bookingType: null,
                englishSpeaking: false,
                insurances: [],
                telehealth: false,
                enriched: false,
                enrichmentSource: "failed",
              },
        );
      }
    }
    return results;
  }

  // ── Private helpers ────────────────────────────────────────

  private async fetchHtml(website: string): Promise<string> {
    const url = website.startsWith("http") ? website : `https://${website}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);

    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent": this.userAgent,
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "es-AR,es;q=0.9,en;q=0.8",
        },
        redirect: "follow",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
      return res.text();
    } finally {
      clearTimeout(timer);
    }
  }

  /** Extract WhatsApp number using 4 strategies */
  private extractWhatsApp(html: string, $: cheerio.CheerioAPI): string | null {
    // Strategy 1: wa.me/NUMBER
    const m1 = html.match(/wa\.me\/(\d{10,15})/i);
    if (m1) return this.normalisePhone(m1[1]!);

    // Strategy 2: whatsapp.com/send?phone=NUMBER
    const m2 = html.match(/whatsapp\.com\/send\?phone=(\d{10,15})/i);
    if (m2) return this.normalisePhone(m2[1]!);

    // Strategy 3: Phone number near "whatsapp" keyword
    const m3 = html.match(
      /whatsapp[\s\S]{0,200}?(\+?54[\s-]?9?[\s-]?\d{2,4}[\s-]?\d{4}[\s-]?\d{4})/i,
    );
    if (m3) return this.normalisePhone(m3[1]!);

    // Strategy 4: tel: link inside a whatsapp-labelled container
    let found: string | null = null;
    $('a[href^="tel:"]').each((_, el) => {
      const parent = $(el).closest(
        '[class*="whatsapp"],[id*="whatsapp"],[class*="wsp"],[id*="wsp"],[class*="wa-"]',
      );
      if (parent.length) {
        const href = $(el).attr("href") || "";
        found = href.replace("tel:", "").replace(/\D/g, "");
      }
    });
    return found ? this.normalisePhone(found) : null;
  }

  /** Extract booking link from HTML */
  private extractBookingLink(
    html: string,
    $: cheerio.CheerioAPI,
  ): { url: string; type: string } | null {
    const hrefs: string[] = [];
    $("a[href]").each((_, el) => {
      hrefs.push($(el).attr("href") || "");
    });
    const combined = [html, ...hrefs].join(" ");

    for (const { re, type } of BOOKING_PLATFORMS) {
      const m = combined.match(re);
      if (m) {
        let url = m[0].trim();
        if (!url.startsWith("http")) url = "https://" + url;
        return { url, type };
      }
    }
    return null;
  }

  private detectEnglish(html: string): boolean {
    return ENGLISH_PATTERNS.some((p) => p.test(html));
  }

  private extractInsurances(html: string, $: cheerio.CheerioAPI): string[] {
    const text = $.text ? $.text() : html.replace(/<[^>]+>/g, " ");
    return INSURANCE_NAMES.filter((name) =>
      new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(text),
    );
  }

  private detectTelehealth(html: string): boolean {
    return TELEHEALTH_PATTERNS.some((p) => p.test(html));
  }

  /** Normalise Argentine phone for WhatsApp */
  private normalisePhone(raw: string): string {
    const digits = raw.replace(/\D/g, "");
    if (digits.startsWith("549") && digits.length >= 12) return digits;
    if (digits.startsWith("5411") && digits.length === 12) return "549" + digits.slice(2);
    if (digits.startsWith("54") && digits.length >= 10) return "549" + digits.slice(2);
    if (digits.startsWith("011") && digits.length === 11) return "54911" + digits.slice(3);
    if (digits.startsWith("11") && digits.length === 10) return "54911" + digits.slice(2);
    return "549" + digits;
  }

  /** Build pre-filled WhatsApp URL */
  static buildWhatsAppUrl(
    phone: string | null,
    doctorName: string,
    specialty?: string,
  ): string | null {
    if (!phone) return null;
    const message =
      `Hola ${doctorName}, me contacto a través de Cóndor Salud ` +
      `para consultar disponibilidad de turno${specialty ? " para " + specialty : ""}.`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  }
}

// ─── Coverage Provider Service ───────────────────────────────
// Multi-source coverage verification for Argentine health system.
//
// Lookup chain (in order):
//   1. Supabase cache  — recent lookups cached for 24h
//   2. SISA / PUCO     — Padrón Único Consolidado Operativo (Ministerio de Salud)
//   3. PAMI             — Prestadores portal (for PAMI beneficiaries)
//   4. Clinic DB        — Local pacientes table
//   5. Not found        — Honest "no coverage data" response
//
// Each provider is optional — works with zero credentials (cache + DB only).
// Register at:
//   SISA:  https://sisa.msal.gov.ar — request API access with institutional email
//   PAMI:  https://prestadores.pami.org.ar — register clinic as provider

import { createClientLogger } from "@/lib/logger";

const log = createClientLogger("coverage-providers");

// ─── Types ───────────────────────────────────────────────────

export type CoverageStatus = "activo" | "inactivo" | "no_encontrado";

export type CoverageSource =
  | "sisa"
  | "pami"
  | "sssalud"
  | "clinic_db"
  | "cache"
  | "demo"
  | "not_found";

export interface CoverageResult {
  status: CoverageStatus;
  nombre: string;
  financiador: string;
  plan: string;
  vigencia: string;
  grupo: string;
  rnos?: string;
  source: CoverageSource;
  cachedAt?: string;
}

export interface ProviderStatus {
  sisa: { configured: boolean; healthy: boolean };
  pami: { configured: boolean; healthy: boolean };
  supabase: { configured: boolean };
}

// Row shapes from Supabase (no generated types)
interface CoverageLookupRow {
  clinic_id: string;
  dni: string;
  status: string;
  nombre: string;
  financiador: string;
  plan: string;
  vigencia: string;
  grupo: string;
  rnos: string | null;
  source: string;
  fetched_at: string;
}

interface PacienteRow {
  id: string;
  nombre: string;
  dni: string;
  financiador: string | null;
  plan: string | null;
  cobertura_estado: string | null;
  grupo_familiar: string | null;
}

// ─── Environment ─────────────────────────────────────────────

const SISA_USER = process.env.SISA_USER || "";
const SISA_PASSWORD = process.env.SISA_PASSWORD || "";
const SISA_BASE = process.env.SISA_BASE_URL || "https://sisa.msal.gov.ar/sisa/services/rest";

const PAMI_PRESTADOR_USER = process.env.PAMI_PRESTADOR_USER || "";
const PAMI_PRESTADOR_PASS = process.env.PAMI_PRESTADOR_PASS || "";
const PAMI_PRESTADOR_CUIT = process.env.PAMI_PRESTADOR_CUIT || "";
const PAMI_BASE = process.env.PAMI_BASE_URL || "https://prestadores.pami.org.ar/api";

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// ─── Helpers ─────────────────────────────────────────────────

function isSISAConfigured(): boolean {
  return Boolean(SISA_USER && SISA_PASSWORD);
}

function isPAMIConfigured(): boolean {
  return Boolean(PAMI_PRESTADOR_USER && PAMI_PRESTADOR_PASS && PAMI_PRESTADOR_CUIT);
}

/** Normalize DNI: strip dots, dashes, spaces */
export function normalizeDni(raw: string): string {
  return raw.replace(/[^\d]/g, "");
}

/** Check if input looks like a CUIL (11 digits) vs DNI (7-8 digits) */
export function isCuil(doc: string): boolean {
  const clean = normalizeDni(doc);
  return clean.length === 11;
}

/** Extract DNI from CUIL (middle 8 digits) */
export function dniFromCuil(cuil: string): string {
  const clean = normalizeDni(cuil);
  return clean.length === 11 ? clean.slice(2, 10) : clean;
}

// ─── 1. SISA / PUCO Lookup ──────────────────────────────────
// Padrón Único Consolidado Operativo — the government's unified
// health coverage registry. Requires institutional registration.
//
// Endpoint: GET /rest/puco/{dni_or_cuil}
// Auth: Basic Auth (usuario:clave)
// Response: JSON with persona + cobertura fields.

async function lookupSISA(dni: string): Promise<CoverageResult | null> {
  if (!isSISAConfigured()) return null;

  const url = `${SISA_BASE}/puco/${encodeURIComponent(dni)}`;
  const auth = Buffer.from(`${SISA_USER}:${SISA_PASSWORD}`).toString("base64");

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Basic ${auth}`,
        Accept: "application/json",
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      log.warn({ status: res.status, dni: dni.slice(0, 3) + "***" }, "SISA PUCO returned non-OK");
      return null;
    }

    const data = await res.json();

    // SISA returns various response shapes — handle known patterns
    if (data.resultado === "NO_ENCONTRADO" || data.resultado === "ERROR") {
      return null;
    }

    // Extract coverage from PUCO response
    const cobertura = data.cobertura || data;
    const persona = data.persona || data;

    const nombre =
      [persona.apellido, persona.nombre].filter(Boolean).join(", ") || persona.denominacion || "";
    const financiador =
      cobertura.denominacion || cobertura.obraSocial || cobertura.financiador || "";
    const rnos = cobertura.rnos || cobertura.codigoObraSocial || "";
    const tipoCobertura = cobertura.tipoCobertura || "";

    if (!nombre && !financiador) return null;

    return {
      status: "activo",
      nombre: nombre || `Paciente ${dni.slice(-4)}`,
      financiador: financiador || "Sin datos",
      plan: tipoCobertura || cobertura.plan || "Plan general",
      vigencia: cobertura.vigencia || cobertura.fechaVigencia || "Vigente",
      grupo: cobertura.grupoFamiliar || "Titular",
      rnos: rnos || undefined,
      source: "sisa",
    };
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      log.warn({ timeout: 8000 }, "SISA PUCO request timed out (8s)");
    } else {
      log.error({ err }, "SISA PUCO lookup failed");
    }
    return null;
  }
}

// ─── 2. PAMI Prestadores Lookup ─────────────────────────────
// PAMI beneficiary lookup via the prestadores portal.
// Requires the clinic to be registered as a PAMI provider.
//
// The prestadores portal uses session-based auth. We authenticate
// once and look up beneficiary status by DNI.

let pamiSessionToken: string | null = null;
let pamiSessionExpiry = 0;

async function getPamiSession(): Promise<string | null> {
  if (pamiSessionToken && Date.now() < pamiSessionExpiry) {
    return pamiSessionToken;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(`${PAMI_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        usuario: PAMI_PRESTADOR_USER,
        password: PAMI_PRESTADOR_PASS,
        cuit: PAMI_PRESTADOR_CUIT,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      log.warn({ status: res.status }, "PAMI login failed");
      return null;
    }

    const data = await res.json();
    pamiSessionToken = data.token || data.sessionId || null;
    pamiSessionExpiry = Date.now() + 30 * 60 * 1000; // 30 min
    return pamiSessionToken;
  } catch (err) {
    log.error({ err }, "PAMI session auth failed");
    return null;
  }
}

async function lookupPAMI(dni: string): Promise<CoverageResult | null> {
  if (!isPAMIConfigured()) return null;

  const token = await getPamiSession();
  if (!token) return null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(`${PAMI_BASE}/padron/afiliado?dni=${encodeURIComponent(dni)}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      if (res.status === 401) {
        pamiSessionToken = null; // Force re-auth
      }
      return null;
    }

    const data = await res.json();

    if (!data || data.error || data.resultado === "NO_ENCONTRADO") {
      return null;
    }

    const afiliado = data.afiliado || data;

    return {
      status: afiliado.estado === "ACTIVO" || afiliado.activo ? "activo" : "inactivo",
      nombre:
        [afiliado.apellido, afiliado.nombre].filter(Boolean).join(", ") ||
        afiliado.nombreCompleto ||
        "",
      financiador: "PAMI",
      plan: afiliado.plan || "Jubilados y Pensionados",
      vigencia: afiliado.vigenciaDesde
        ? `${afiliado.vigenciaDesde} – ${afiliado.vigenciaHasta || "vigente"}`
        : "Vigente",
      grupo: afiliado.grupoFamiliar || "Titular",
      rnos: "100000", // PAMI's RNOS code
      source: "pami",
    };
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      log.warn({ timeout: 8000 }, "PAMI lookup timed out (8s)");
    } else {
      log.error({ err }, "PAMI lookup failed");
    }
    return null;
  }
}

// ─── 3. Supabase Cache ──────────────────────────────────────
// Cache external API results to avoid hammering SISA/PAMI on
// repeated lookups for the same patient.

async function getCachedLookup(
  supabase: ReturnType<typeof import("@supabase/supabase-js").createClient>,
  clinicId: string,
  dni: string,
): Promise<CoverageResult | null> {
  try {
    const { data: raw } = await supabase
      .from("coverage_lookups")
      .select("*")
      .eq("clinic_id", clinicId)
      .eq("dni", dni)
      .single();

    const data = raw as CoverageLookupRow | null;
    if (!data) return null;

    // Check TTL
    const age = Date.now() - new Date(data.fetched_at).getTime();
    if (age > CACHE_TTL_MS) return null;

    return {
      status: data.status as CoverageStatus,
      nombre: data.nombre,
      financiador: data.financiador,
      plan: data.plan,
      vigencia: data.vigencia,
      grupo: data.grupo,
      rnos: data.rnos || undefined,
      source: "cache" as const,
      cachedAt: data.fetched_at,
    };
  } catch {
    // Table may not exist yet — that's fine
    return null;
  }
}

async function setCachedLookup(
  supabase: ReturnType<typeof import("@supabase/supabase-js").createClient>,
  clinicId: string,
  dni: string,
  result: CoverageResult,
): Promise<void> {
  try {
    // @ts-expect-error — untyped Supabase table (no generated types)
    await supabase.from("coverage_lookups").upsert(
      {
        clinic_id: clinicId,
        dni,
        status: result.status,
        nombre: result.nombre,
        financiador: result.financiador,
        plan: result.plan,
        vigencia: result.vigencia,
        grupo: result.grupo,
        rnos: result.rnos || null,
        source: result.source,
        fetched_at: new Date().toISOString(),
      },
      { onConflict: "clinic_id,dni" },
    );
  } catch {
    // Non-critical — caching is best-effort
  }
}

// ─── 4. Clinic DB (pacientes) ────────────────────────────────

async function lookupClinicDB(
  supabase: ReturnType<typeof import("@supabase/supabase-js").createClient>,
  clinicId: string,
  dni: string,
): Promise<CoverageResult | null> {
  try {
    const { data: raw } = await supabase
      .from("pacientes")
      .select("id, nombre, dni, financiador, plan, cobertura_estado, grupo_familiar")
      .eq("clinic_id", clinicId)
      .eq("dni", dni)
      .single();

    const paciente = raw as PacienteRow | null;
    if (!paciente) return null;

    return {
      status: paciente.cobertura_estado === "inactivo" ? "inactivo" : "activo",
      nombre: paciente.nombre,
      financiador: paciente.financiador || "Sin datos",
      plan: paciente.plan || "Plan general",
      vigencia: "01/2026 – 12/2026",
      grupo: paciente.grupo_familiar || "Titular",
      source: "clinic_db" as const,
    };
  } catch {
    return null;
  }
}

// ─── 5. Demo Fallback (only in demo mode) ────────────────────

const DEMO_PATIENTS: Record<string, CoverageResult> = {
  "28456789": {
    status: "activo",
    nombre: "Carlos Pérez",
    financiador: "OSDE",
    plan: "OSDE 310",
    vigencia: "01/2026 – 12/2026",
    grupo: "Titular + 2 familiares",
    rnos: "400308",
    source: "demo",
  },
  "35123456": {
    status: "activo",
    nombre: "Ana Rodríguez",
    financiador: "Swiss Medical",
    plan: "SMG30",
    vigencia: "01/2026 – 12/2026",
    grupo: "Titular",
    rnos: "400604",
    source: "demo",
  },
  "22789012": {
    status: "activo",
    nombre: "Jorge Martínez",
    financiador: "PAMI",
    plan: "Jubilados y Pensionados",
    vigencia: "01/2026 – 12/2026",
    grupo: "Titular + 1 familiar",
    rnos: "100000",
    source: "demo",
  },
  "40567890": {
    status: "inactivo",
    nombre: "Laura Gómez",
    financiador: "IOMA",
    plan: "Plan básico",
    vigencia: "Vencida 11/2025",
    grupo: "Titular",
    rnos: "103000",
    source: "demo",
  },
  "30987654": {
    status: "activo",
    nombre: "María González",
    financiador: "PAMI",
    plan: "Jubilados y Pensionados",
    vigencia: "01/2026 – 12/2026",
    grupo: "Titular + 1 familiar",
    rnos: "100000",
    source: "demo",
  },
  "25678901": {
    status: "activo",
    nombre: "Roberto Díaz",
    financiador: "Galeno",
    plan: "Oro",
    vigencia: "01/2026 – 12/2026",
    grupo: "Titular + 3 familiares",
    rnos: "400410",
    source: "demo",
  },
  "38234567": {
    status: "activo",
    nombre: "Sofía Ramírez",
    financiador: "Swiss Medical",
    plan: "SMG40",
    vigencia: "01/2026 – 12/2026",
    grupo: "Titular",
    rnos: "400604",
    source: "demo",
  },
  "27890123": {
    status: "activo",
    nombre: "Héctor Suárez",
    financiador: "Medifé",
    plan: "Plata",
    vigencia: "01/2026 – 12/2026",
    grupo: "Titular + 1 familiar",
    rnos: "400413",
    source: "demo",
  },
};

// ─── Main Lookup — Orchestrator ──────────────────────────────

export interface LookupOptions {
  supabase?: ReturnType<typeof import("@supabase/supabase-js").createClient>;
  clinicId?: string;
  isDemo?: boolean;
}

export async function lookupCoverage(
  rawDoc: string,
  options: LookupOptions = {},
): Promise<CoverageResult> {
  const { supabase, clinicId, isDemo } = options;
  const doc = normalizeDni(rawDoc);
  const dni = isCuil(doc) ? dniFromCuil(doc) : doc;

  log.info({ dni: dni.slice(0, 3) + "***", isCuil: isCuil(doc) }, "Coverage lookup started");

  // 1. Cache (if Supabase available)
  if (supabase && clinicId) {
    const cached = await getCachedLookup(supabase, clinicId, dni);
    if (cached) {
      log.info({ source: "cache" }, "Coverage found in cache");
      return cached;
    }
  }

  // 2. SISA / PUCO
  const sisa = await lookupSISA(isCuil(doc) ? doc : dni);
  if (sisa) {
    log.info({ source: "sisa", financiador: sisa.financiador }, "Coverage found via SISA");
    if (supabase && clinicId) setCachedLookup(supabase, clinicId, dni, sisa);
    return sisa;
  }

  // 3. PAMI
  const pami = await lookupPAMI(dni);
  if (pami) {
    log.info({ source: "pami" }, "Coverage found via PAMI");
    if (supabase && clinicId) setCachedLookup(supabase, clinicId, dni, pami);
    return pami;
  }

  // 4. Clinic DB (pacientes table)
  if (supabase && clinicId) {
    const db = await lookupClinicDB(supabase, clinicId, dni);
    if (db) {
      log.info({ source: "clinic_db" }, "Coverage found in clinic DB");
      return db;
    }
  }

  // 5. Demo fallback (only if demo mode active)
  if (isDemo) {
    const demo = DEMO_PATIENTS[dni];
    if (demo) {
      log.info({ source: "demo" }, "Coverage found in demo data");
      return demo;
    }
  }

  // 6. Not found — honest response
  log.info({ dni: dni.slice(0, 3) + "***" }, "Coverage not found in any source");
  return {
    status: "no_encontrado",
    nombre: "",
    financiador: "",
    plan: "",
    vigencia: "",
    grupo: "",
    source: "not_found",
  };
}

// ─── Provider Status Check ───────────────────────────────────

export async function getProviderStatus(): Promise<ProviderStatus> {
  const sisa = { configured: isSISAConfigured(), healthy: false };
  const pami = { configured: isPAMIConfigured(), healthy: false };
  const supabaseOk = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );

  // Quick health check for SISA
  if (sisa.configured) {
    try {
      const auth = Buffer.from(`${SISA_USER}:${SISA_PASSWORD}`).toString("base64");
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(`${SISA_BASE}/puco/20000000001`, {
        method: "GET",
        headers: { Authorization: `Basic ${auth}`, Accept: "application/json" },
        signal: controller.signal,
      });
      clearTimeout(timeout);
      sisa.healthy = res.ok || res.status === 404; // 404 = API works, just not found
    } catch {
      sisa.healthy = false;
    }
  }

  // Quick health check for PAMI
  if (pami.configured) {
    const token = await getPamiSession();
    pami.healthy = Boolean(token);
  }

  return { sisa, pami, supabase: { configured: supabaseOk } };
}

// ─── Plan Configuration ─────────────────────────────────────
// Defines all 19 modules, 4 categories, 3 presets, pricing,
// dependencies, and utility functions for the plan system.

import { formatCurrency } from "@/lib/utils";

export type ModuleId =
  | "pacientes"
  | "agenda"
  | "verificacion"
  | "inventario"
  | "facturacion"
  | "rechazos"
  | "financiadores"
  | "inflacion"
  | "auditoria"
  | "nomenclador"
  | "reportes"
  | "alertas"
  | "wizard"
  | "pagos"
  | "farmacia"
  | "telemedicina"
  | "directorio"
  | "interconsultas"
  | "triage"
  | "nubix"
  | "chatbot"
  | "club-salud"
  | "recetas-digitales"
  | "health-tracker"
  | "perfiles-publicos"
  | "verificacion-medica";

export type CategoryId = "gestion" | "finanzas" | "inteligencia" | "servicios";

export interface ModuleDef {
  id: ModuleId;
  label: string;
  desc: string;
  price: number; // ARS per month
  category: CategoryId;
  phase: 1 | 2 | 3;
  base?: boolean; // Always included, cannot be deselected
  deps?: ModuleId[]; // Required dependencies
}

export interface CategoryDef {
  id: CategoryId;
  label: string;
  modules: ModuleId[];
}

export type PresetId = "basic" | "plus" | "enterprise";

export interface PresetDef {
  id: PresetId;
  name: string;
  tagline: string;
  modules: ModuleId[];
  discount: number; // 0-1 fraction
  priceUsd: number; // Display price in USD/mo
  popular?: boolean;
  annual?: boolean;
}

// ─── Module Definitions ──────────────────────────────────────

export const MODULES: ModuleDef[] = [
  // GESTION CLINICA
  {
    id: "pacientes",
    label: "Gestión de Pacientes",
    desc: "Fichas, historial clínico, datos de cobertura.",
    price: 8000,
    category: "gestion",
    phase: 1,
    base: true,
  },
  {
    id: "agenda",
    label: "Agenda de Turnos",
    desc: "Calendario, recordatorios, confirmaciones.",
    price: 10000,
    category: "gestion",
    phase: 1,
  },
  {
    id: "verificacion",
    label: "Verificación de Cobertura",
    desc: "Validación en tiempo real contra obras sociales.",
    price: 12000,
    category: "gestion",
    phase: 1,
  },
  {
    id: "inventario",
    label: "Inventario",
    desc: "Stock de insumos, alertas de reposición.",
    price: 10000,
    category: "gestion",
    phase: 1,
  },

  // FINANZAS
  {
    id: "facturacion",
    label: "Facturación Electrónica",
    desc: "Facturación, AFIP, débitos automáticos.",
    price: 15000,
    category: "finanzas",
    phase: 1,
  },
  {
    id: "rechazos",
    label: "Gestión de Rechazos",
    desc: "Seguimiento, reclamos, recupero de montos.",
    price: 12000,
    category: "finanzas",
    phase: 1,
    deps: ["facturacion", "pacientes"],
  },
  {
    id: "financiadores",
    label: "Panel de Financiadores",
    desc: "Comparativa, días de cobro, mix de payers.",
    price: 10000,
    category: "finanzas",
    phase: 1,
    deps: ["facturacion"],
  },
  {
    id: "inflacion",
    label: "Tracker de Inflación",
    desc: "Impacto IPC sobre facturado y cobrado.",
    price: 8000,
    category: "finanzas",
    phase: 1,
    deps: ["facturacion"],
  },
  {
    id: "pagos",
    label: "Cobros MercadoPago",
    desc: "Copagos, coseguros, cobro online integrado.",
    price: 12000,
    category: "finanzas",
    phase: 2,
  },

  // INTELIGENCIA
  {
    id: "auditoria",
    label: "Auditoría Pre-Envío",
    desc: "Detección de errores antes de facturar.",
    price: 15000,
    category: "inteligencia",
    phase: 1,
    deps: ["facturacion"],
  },
  {
    id: "nomenclador",
    label: "Nomenclador SSS",
    desc: "Códigos actualizados, búsqueda inteligente.",
    price: 8000,
    category: "inteligencia",
    phase: 1,
  },
  {
    id: "reportes",
    label: "Reportes",
    desc: "Dashboards, exportación, indicadores clave.",
    price: 10000,
    category: "inteligencia",
    phase: 1,
  },

  // SERVICIOS
  {
    id: "farmacia",
    label: "Farmacia Online",
    desc: "Catálogo de medicamentos, pedidos, entregas.",
    price: 15000,
    category: "servicios",
    phase: 2,
  },
  {
    id: "telemedicina",
    label: "Telemedicina",
    desc: "Videollamadas, recetas digitales.",
    price: 18000,
    category: "servicios",
    phase: 2,
  },
  {
    id: "directorio",
    label: "Directorio Médico",
    desc: "Búsqueda de profesionales, derivaciones.",
    price: 10000,
    category: "servicios",
    phase: 2,
  },
  {
    id: "interconsultas",
    label: "Red de Interconsultas",
    desc: "Derivaciones y red de profesionales para estudios.",
    price: 8000,
    category: "servicios",
    phase: 2,
    deps: ["pacientes"],
  },
  {
    id: "triage",
    label: "Triage Clínico",
    desc: "Clasificación de urgencia asistida por IA.",
    price: 12000,
    category: "servicios",
    phase: 2,
    deps: ["pacientes"],
  },
  {
    id: "chatbot",
    label: "Chatbot Cora",
    desc: "Asistente virtual para consultas frecuentes.",
    price: 15000,
    category: "servicios",
    phase: 2,
  },

  // SISTEMA (always included)
  {
    id: "alertas",
    label: "Centro de Alertas",
    desc: "Notificaciones centralizadas.",
    price: 5000,
    category: "gestion",
    phase: 1,
    base: true,
  },
  {
    id: "wizard",
    label: "Recorrido Guiado",
    desc: "Onboarding interactivo de la plataforma.",
    price: 0,
    category: "gestion",
    phase: 1,
    base: true,
  },
  // ─── New Feature Modules ─────────────────────────────────
  {
    id: "club-salud",
    label: "Club de Salud",
    desc: "Membresías premium para pacientes con descuentos en consultas y recetas.",
    price: 8000,
    category: "servicios",
    phase: 2,
  },
  {
    id: "recetas-digitales",
    label: "Recetas Digitales QR",
    desc: "Prescripciones digitales con verificación por QR y URL pública.",
    price: 6000,
    category: "servicios",
    phase: 2,
    deps: ["pacientes"],
  },
  {
    id: "health-tracker",
    label: "Seguimiento de Salud",
    desc: "Seguimiento de métricas de salud del paciente: glucosa, presión, peso, etc.",
    price: 5000,
    category: "servicios",
    phase: 2,
  },
  {
    id: "perfiles-publicos",
    label: "Perfiles Públicos SEO",
    desc: "Páginas públicas de médicos optimizadas para buscadores con Schema.org.",
    price: 10000,
    category: "servicios",
    phase: 2,
    deps: ["directorio"],
  },
  {
    id: "nubix",
    label: "PACS / Imagen Médica",
    desc: "Visualización DICOM, integración dcm4chee Archive 5, entrega de resultados.",
    price: 8000,
    category: "servicios",
    phase: 2,
  },
  {
    id: "verificacion-medica",
    label: "Verificación Médica",
    desc: "Verificación de matrícula y credenciales profesionales con badge público.",
    price: 0,
    category: "gestion",
    phase: 2,
    base: true,
  },
];

// ─── Category Definitions ────────────────────────────────────

export const CATEGORIES: CategoryDef[] = [
  {
    id: "gestion",
    label: "Gestión Clínica",
    modules: [
      "pacientes",
      "agenda",
      "verificacion",
      "inventario",
      "alertas",
      "wizard",
      "verificacion-medica",
    ],
  },
  {
    id: "finanzas",
    label: "Finanzas",
    modules: ["facturacion", "rechazos", "financiadores", "inflacion", "pagos"],
  },
  { id: "inteligencia", label: "Inteligencia", modules: ["auditoria", "nomenclador", "reportes"] },
  {
    id: "servicios",
    label: "Servicios",
    modules: [
      "farmacia",
      "telemedicina",
      "directorio",
      "interconsultas",
      "triage",
      "nubix",
      "chatbot",
      "club-salud",
      "recetas-digitales",
      "health-tracker",
      "perfiles-publicos",
      "verificacion-medica",
    ],
  },
];

// ─── Preset Plans ────────────────────────────────────────────

export const PRESETS: PresetDef[] = [
  {
    id: "basic",
    name: "Consultorio",
    tagline: "1 profesional incluido",
    modules: ["pacientes", "agenda", "verificacion", "facturacion", "alertas", "wizard"],
    discount: 0,
    priceUsd: 50,
  },
  {
    id: "plus",
    name: "Multi Consultorio",
    tagline: "Hasta 5 profesionales incluidos",
    modules: [
      "pacientes",
      "agenda",
      "verificacion",
      "inventario",
      "facturacion",
      "rechazos",
      "financiadores",
      "inflacion",
      "auditoria",
      "nomenclador",
      "reportes",
      "interconsultas",
      "alertas",
      "wizard",
      "recetas-digitales",
      "verificacion-medica",
    ],
    discount: 0.15,
    priceUsd: 120,
    popular: true,
  },
  {
    id: "enterprise",
    name: "Centro Médico",
    tagline: "Hasta 20 profesionales incluidos",
    modules: [
      "pacientes",
      "agenda",
      "verificacion",
      "inventario",
      "facturacion",
      "rechazos",
      "financiadores",
      "inflacion",
      "pagos",
      "auditoria",
      "nomenclador",
      "reportes",
      "farmacia",
      "telemedicina",
      "directorio",
      "interconsultas",
      "triage",
      "chatbot",
      "alertas",
      "wizard",
      "club-salud",
      "recetas-digitales",
      "health-tracker",
      "perfiles-publicos",
      "verificacion-medica",
    ],
    discount: 0.25,
    priceUsd: 180,
    annual: true,
  },
];

// ─── Utilities ───────────────────────────────────────────────

const moduleMap = new Map(MODULES.map((m) => [m.id, m]));

export function getModule(id: ModuleId): ModuleDef {
  const m = moduleMap.get(id);
  if (!m) throw new Error(`Unknown module: ${id}`);
  return m;
}

export function getModulesForCategory(catId: CategoryId): ModuleDef[] {
  const cat = CATEGORIES.find((c) => c.id === catId);
  if (!cat) return [];
  return cat.modules.map((id) => getModule(id));
}

/** Base modules that are always included and cannot be toggled off */
export function getBaseModules(): ModuleId[] {
  return MODULES.filter((m) => m.base).map((m) => m.id);
}

/** Calculate subtotal for a set of modules (before discount) */
export function calcSubtotal(moduleIds: ModuleId[]): number {
  return moduleIds.reduce((sum, id) => sum + getModule(id).price, 0);
}

/** Calculate total with discount */
export function calcTotal(moduleIds: ModuleId[], discount: number): number {
  const sub = calcSubtotal(moduleIds);
  return Math.round(sub * (1 - discount));
}

/** Resolve all dependencies for a set of modules */
export function resolveDeps(moduleIds: ModuleId[]): ModuleId[] {
  const set = new Set(moduleIds);
  let changed = true;
  while (changed) {
    changed = false;
    for (const id of Array.from(set)) {
      const m = getModule(id);
      if (m.deps) {
        for (const dep of m.deps) {
          if (!set.has(dep)) {
            set.add(dep);
            changed = true;
          }
        }
      }
    }
  }
  // Always include base modules
  for (const base of getBaseModules()) {
    set.add(base);
  }
  return Array.from(set);
}

/** Get preset by id */
export function getPreset(id: PresetId): PresetDef {
  const p = PRESETS.find((pr) => pr.id === id);
  if (!p) throw new Error(`Unknown preset: ${id}`);
  return p;
}

/** Calculate the preset price using its modules and discount */
export function calcPresetPrice(preset: PresetDef): number {
  return calcTotal(preset.modules, preset.discount);
}

/** Calculate non-discounted price for a preset (for strikethrough) */
export function calcPresetSubtotal(preset: PresetDef): number {
  return calcSubtotal(preset.modules);
}

/** Format number as ARS with period separators */
export function formatARS(amount: number): string {
  return formatCurrency(amount);
}

// ─── Club Salud Membership Plans (B2C) ──────────────────────
// Patient-facing Club Salud tiers.  Single source of truth for
// Básico / Plus / Familiar pricing used by:
//   /club (marketing), /paciente/club (portal), investor deck.

export interface ClubSaludPlanDef {
  slug: "basico" | "plus" | "familiar";
  nameEs: string;
  nameEn: string;
  priceArs: number;
  priceUsd: number;
  maxTeleconsultas: number;
  includesDelivery: boolean;
  includesCoraPriority: boolean;
  includesRecordsRequest: boolean;
  prescriptionDiscount: number;
  sortOrder: number;
  popular?: boolean;
  featuresEs: string[];
  featuresEn: string[];
}

export const CLUB_SALUD_PLANS: ClubSaludPlanDef[] = [
  {
    slug: "basico",
    nameEs: "Club Básico",
    nameEn: "Basic Club",
    priceArs: 9_000,
    priceUsd: 0,
    maxTeleconsultas: 1,
    includesDelivery: false,
    includesCoraPriority: false,
    includesRecordsRequest: true,
    prescriptionDiscount: 0,
    sortOrder: 1,
    featuresEs: [
      "Plan de Bienvenida (chequeo médico)",
      "1 teleconsulta por mes",
      "Acceso a Cora (chatbot IA)",
      "Historia clínica digital",
      "Seguimiento de salud",
      "Solicitar historia clínica de médicos externos",
    ],
    featuresEn: [
      "Welcome Plan (medical screening)",
      "1 teleconsult per month",
      "Access to Cora (AI chatbot)",
      "Digital health record",
      "Health tracking",
      "Request records from out-of-network doctors",
    ],
  },
  {
    slug: "plus",
    nameEs: "Club Plus",
    nameEn: "Plus Club",
    priceArs: 24_500,
    priceUsd: 0,
    maxTeleconsultas: 3,
    includesDelivery: true,
    includesCoraPriority: true,
    includesRecordsRequest: true,
    prescriptionDiscount: 0,
    sortOrder: 2,
    popular: true,
    featuresEs: [
      "Plan de Bienvenida (chequeo médico)",
      "3 teleconsultas por mes",
      "Delivery de medicamentos",
      "Prioridad con Cora IA",
      "Historia clínica digital",
      "Seguimiento de salud con recordatorios",
      "Solicitar historia clínica de médicos externos",
    ],
    featuresEn: [
      "Welcome Plan (medical screening)",
      "3 teleconsults per month",
      "Medication delivery",
      "Priority Cora AI access",
      "Digital health record",
      "Health tracking with reminders",
      "Request records from out-of-network doctors",
    ],
  },
  {
    slug: "familiar",
    nameEs: "Club Familiar",
    nameEn: "Family Club",
    priceArs: 90_000,
    priceUsd: 0,
    maxTeleconsultas: 999,
    includesDelivery: true,
    includesCoraPriority: true,
    includesRecordsRequest: true,
    prescriptionDiscount: 0,
    sortOrder: 3,
    featuresEs: [
      "Plan de Bienvenida (chequeo médico)",
      "Teleconsultas ilimitadas",
      "Delivery de medicamentos incluido",
      "Prioridad con Cora IA",
      "Chequeo anual completo",
      "Consultas de cardiología",
      "Visitas a médico clínico ilimitadas",
      "Cobertura para grupo familiar",
      "Seguimiento de salud con recordatorios",
      "Solicitar historia clínica de médicos externos",
      "Soporte prioritario",
    ],
    featuresEn: [
      "Welcome Plan (medical screening)",
      "Unlimited teleconsultations",
      "Medication delivery included",
      "Priority Cora AI access",
      "Annual comprehensive checkup",
      "Cardiology consultations",
      "Unlimited general practitioner visits",
      "Family group coverage",
      "Health tracking with reminders",
      "Request records from out-of-network doctors",
      "Priority support",
    ],
  },
];

/** Non-member prescription fee (ARS) */
export const NON_MEMBER_PRESCRIPTION_FEE = 2_000;

/** Get a Club Salud plan by slug */
export function getClubSaludPlan(slug: string): ClubSaludPlanDef | undefined {
  return CLUB_SALUD_PLANS.find((p) => p.slug === slug);
}

/** Format Club Salud price for display (e.g. "9.000") */
export function formatClubPrice(amount: number): string {
  return amount.toLocaleString("es-AR");
}

// ─── Seat-Based Plan Definitions ─────────────────────────────
// Per-doctor plans for the seat billing model.
// Coexists with the clinic module system above.

export type SeatPlanId = "free" | "basic" | "plus" | "enterprise";

export interface SeatPlanDef {
  id: SeatPlanId;
  name: string;
  nameEn: string;
  tagline: string;
  taglineEn: string;
  price: number;
  priceAnnual: number;
  features: string[];
  featuresEn: string[];
}

export const SEAT_PLANS: SeatPlanDef[] = [
  {
    id: "free",
    name: "Gratuito",
    nameEn: "Free",
    tagline: "Para empezar",
    taglineEn: "Get started",
    price: 0,
    priceAnnual: 0,
    features: ["20 turnos por mes", "Perfil en el directorio", "Gestión básica de pacientes"],
    featuresEn: ["20 appointments per month", "Directory listing", "Basic patient management"],
  },
  {
    id: "basic",
    name: "Consultorio",
    nameEn: "Consultorio",
    tagline: "$50 USD/mes · 1 profesional",
    taglineEn: "$50 USD/mo · 1 provider seat",
    price: 60_000,
    priceAnnual: 51_000,
    features: [
      "1 profesional incluido",
      "Agenda ilimitada",
      "Recordatorios por WhatsApp",
      "Verificación de cobertura",
      "Listado prioritario",
      "Soporte prioritario",
    ],
    featuresEn: [
      "1 provider seat included",
      "Unlimited scheduling",
      "WhatsApp reminders",
      "Insurance verification",
      "Priority listing",
      "Priority support",
    ],
  },
  {
    id: "plus",
    name: "Multi Consultorio",
    nameEn: "Multi Consultorio",
    tagline: "$120 USD/mes · Hasta 5 profesionales",
    taglineEn: "$120 USD/mo · Up to 5 provider seats",
    price: 144_000,
    priceAnnual: 122_400,
    features: [
      "Hasta 5 profesionales incluidos",
      "Todo de Consultorio",
      "Teleconsulta integrada",
      "Cobro online MercadoPago",
      "Chatbot IA Cora",
      "Analítica avanzada",
      "Facturación electrónica",
    ],
    featuresEn: [
      "Up to 5 provider seats included",
      "Everything in Consultorio",
      "Integrated telehealth",
      "Online MercadoPago billing",
      "AI Chatbot Cora",
      "Advanced analytics",
      "Electronic invoicing",
    ],
  },
  {
    id: "enterprise",
    name: "Centro Médico",
    nameEn: "Centro Médico",
    tagline: "$180 USD/mes · Hasta 20 profesionales",
    taglineEn: "$180 USD/mo · Up to 20 provider seats",
    price: 216_000,
    priceAnnual: 183_600,
    features: [
      "Hasta 20 profesionales incluidos",
      "Todo de Multi Consultorio",
      "Multi-sucursal consolidado",
      "Integraciones a medida",
      "SLA garantizado",
      "Customer Success dedicado",
      "API enterprise",
    ],
    featuresEn: [
      "Up to 20 provider seats included",
      "Everything in Multi Consultorio",
      "Multi-location consolidated",
      "Custom integrations",
      "Guaranteed SLA",
      "Dedicated Customer Success",
      "Enterprise API",
    ],
  },
];

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
  | "chatbot";

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

export type PresetId = "esencial" | "profesional" | "enterprise";

export interface PresetDef {
  id: PresetId;
  name: string;
  tagline: string;
  modules: ModuleId[];
  discount: number; // 0-1 fraction
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
];

// ─── Category Definitions ────────────────────────────────────

export const CATEGORIES: CategoryDef[] = [
  {
    id: "gestion",
    label: "Gestión Clínica",
    modules: ["pacientes", "agenda", "verificacion", "inventario", "alertas", "wizard"],
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
    modules: ["farmacia", "telemedicina", "directorio", "interconsultas", "triage", "chatbot"],
  },
];

// ─── Preset Plans ────────────────────────────────────────────

export const PRESETS: PresetDef[] = [
  {
    id: "esencial",
    name: "Esencial",
    tagline: "Para empezar",
    modules: ["pacientes", "agenda", "verificacion", "facturacion", "alertas", "wizard"],
    discount: 0,
  },
  {
    id: "profesional",
    name: "Profesional",
    tagline: "Gestión completa con inteligencia financiera",
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
    ],
    discount: 0.15,
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "Todo incluido para clínicas grandes",
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
    ],
    discount: 0.25,
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

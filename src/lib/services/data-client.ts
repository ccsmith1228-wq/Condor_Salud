// ─── Client-side Data Service ────────────────────────────────
// Thin client wrapper that re-exports the async data functions.
// SWR calls these via dynamic key mapping.

import {
  getPacientes,
  getPaciente,
  getFacturas,
  getRechazos,
  getFinanciadores,
  getInflacion,
  getAlertas,
  getTurnos,
  getInventario,
  getNomenclador,
  getReportes,
  getAuditoria,
} from "@/lib/services/data";

// ─── Module 11-14 service imports ────────────────────────────
import {
  getMedications,
  getPrescriptions,
  getDeliveries,
  getRecurringOrders,
  getFarmaciaKPIs,
} from "@/lib/services/farmacia";

import {
  getWaitingRoom,
  getConsultations,
  getScheduledConsultations,
  getTelemedichinaKPIs,
} from "@/lib/services/telemedicina";

import { getDoctors, getDirectorioKPIs } from "@/lib/services/directorio";

import { getTriages, getTriageKPIs } from "@/lib/services/triage";

import {
  getNubixStudies,
  getNubixReports,
  getNubixDeliveries,
  getNubixAppointments,
  getNubixKPIs,
} from "@/lib/services/nubix";

const dataService = {
  pacientes: getPacientes,
  facturas: getFacturas,
  rechazos: getRechazos,
  financiadores: getFinanciadores,
  inflacion: getInflacion,
  alertas: getAlertas,
  turnos: getTurnos,
  inventario: getInventario,
  nomenclador: getNomenclador,
  reportes: getReportes,
  auditoria: getAuditoria,

  // ─── Module 11: Farmacia ────────────────────────────────────
  medications: getMedications,
  prescriptions: getPrescriptions,
  deliveries: getDeliveries,
  recurringOrders: getRecurringOrders,
  farmaciaKPIs: getFarmaciaKPIs,

  // ─── Module 12: Telemedicina ────────────────────────────────
  waitingRoom: getWaitingRoom,
  consultations: getConsultations,
  scheduledConsultations: getScheduledConsultations,
  telemedichinaKPIs: getTelemedichinaKPIs,

  // ─── Module 13: Directorio ─────────────────────────────────
  doctors: () => getDoctors({}),
  directorioKPIs: getDirectorioKPIs,

  // ─── Module 14: Triage ─────────────────────────────────────
  triages: getTriages,
  triageKPIs: getTriageKPIs,

  // ─── Nubix Cloud (RIS/PACS) ────────────────────────────────
  nubixStudies: () => getNubixStudies(),
  nubixReports: getNubixReports,
  nubixDeliveries: () => getNubixDeliveries(),
  nubixAppointments: () => getNubixAppointments(),
  nubixKPIs: getNubixKPIs,
} as const;

export default dataService;

// Re-export getPaciente separately (takes an argument)
export { getPaciente };

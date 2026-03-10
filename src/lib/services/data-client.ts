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
} as const;

export default dataService;

// Re-export getPaciente separately (takes an argument)
export { getPaciente };

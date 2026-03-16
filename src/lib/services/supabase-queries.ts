// ─── Supabase Data Queries ───────────────────────────────────
// Real database queries that replace mock data when Supabase is configured.
// Each function mirrors the signature from services/data.ts.
// Imported lazily only when isSupabaseConfigured() returns true.
//
// Supabase returns untyped JSON rows. We cast them through mapper functions
// that produce our typed domain models. The `R` alias keeps mappers concise.

import { createClient } from "@/lib/supabase/client";
import type {
  Factura,
  Rechazo,
  Financiador,
  InflacionMes,
  Alerta,
  FacturaEstado,
  FinanciadorType,
  RechazoMotivo,
} from "@/lib/types";
import type {
  Paciente,
  Turno,
  InventarioItem,
  NomencladorEntry,
  Reporte,
  AuditoriaItem,
} from "@/lib/services/data";

// ─── Row type shorthand ──────────────────────────────────────
// Typed row aliases from our generated Database types.
import type { Tables } from "@/lib/supabase/database.types";
type PacienteRow = Tables<"pacientes">;
type FacturaRow = Tables<"facturas">;
type RechazoRow = Tables<"rechazos">;
type FinanciadorRow = Tables<"financiadores">;
type InflacionRow = Tables<"inflacion">;
type AlertaRow = Tables<"alertas">;
type TurnoRow = Tables<"turnos">;
type InventarioRow = Tables<"inventario">;
type NomencladorRow = Tables<"nomenclador">;
type ReporteRow = Tables<"reportes">;
type AuditoriaRow = Tables<"auditoria">;

// ─── Row → Entity Mappers ────────────────────────────────────
// Supabase returns snake_case rows; our TS types use camelCase.

function mapPaciente(row: PacienteRow): Paciente {
  return {
    id: row.id,
    nombre: row.nombre,
    dni: row.dni,
    financiador: row.financiador,
    plan: row.plan,
    ultimaVisita: row.ultima_visita ?? "",
    estado: row.estado as Paciente["estado"],
    email: row.email ?? "",
    telefono: row.telefono ?? "",
    fechaNacimiento: row.fecha_nacimiento ?? "",
    direccion: row.direccion ?? "",
  };
}

function mapFactura(row: FacturaRow): Factura {
  return {
    id: row.id,
    numero: row.numero,
    fecha: row.fecha,
    financiador: row.financiador,
    paciente: row.paciente,
    prestacion: row.prestacion,
    codigoNomenclador: row.codigo_nomenclador,
    monto: row.monto,
    estado: row.estado as FacturaEstado,
    fechaPresentacion: row.fecha_presentacion ?? undefined,
    fechaCobro: row.fecha_cobro ?? undefined,
    cae: row.cae ?? undefined,
  };
}

function mapRechazo(row: RechazoRow): Rechazo {
  return {
    id: row.id,
    facturaId: row.factura_id ?? "",
    facturaNumero: row.factura_numero,
    financiador: row.financiador,
    paciente: row.paciente,
    prestacion: row.prestacion,
    monto: row.monto,
    motivo: row.motivo as RechazoMotivo,
    motivoDetalle: row.motivo_detalle,
    fechaRechazo: row.fecha_rechazo,
    fechaPresentacion: row.fecha_presentacion,
    reprocesable: row.reprocesable,
    estado: row.estado as Rechazo["estado"],
  };
}

function mapFinanciador(row: FinanciadorRow): Financiador {
  return {
    id: row.id,
    name: row.name,
    type: row.type as FinanciadorType,
    facturado: row.facturado,
    cobrado: row.cobrado,
    tasaRechazo: Number(row.tasa_rechazo),
    diasPromedioPago: row.dias_promedio_pago,
    facturasPendientes: row.facturas_pendientes,
    ultimoPago: row.ultimo_pago ?? undefined,
  };
}

function mapInflacion(row: InflacionRow): InflacionMes {
  return {
    mes: row.mes,
    ipc: Number(row.ipc),
    facturado: row.facturado,
    cobrado: row.cobrado,
    diasDemora: row.dias_demora,
    perdidaReal: row.perdida_real,
    perdidaPorcentaje: Number(row.perdida_porcentaje),
  };
}

function mapAlerta(row: AlertaRow): Alerta {
  return {
    id: row.id,
    tipo: row.tipo as Alerta["tipo"],
    titulo: row.titulo,
    detalle: row.detalle,
    fecha: row.fecha,
    acento: row.acento as Alerta["acento"],
  };
}

function mapTurno(row: TurnoRow): Turno {
  return {
    id: row.id,
    hora: row.hora,
    paciente: row.paciente,
    tipo: row.tipo,
    financiador: row.financiador,
    profesional: row.profesional,
    estado: row.estado as Turno["estado"],
    notas: row.notas ?? undefined,
  };
}

function mapInventario(row: InventarioRow): InventarioItem {
  return {
    id: row.id,
    nombre: row.nombre,
    categoria: row.categoria,
    stock: row.stock,
    minimo: row.minimo,
    unidad: row.unidad,
    precio: row.precio,
    proveedor: row.proveedor,
    vencimiento: row.vencimiento ?? undefined,
    lote: row.lote ?? undefined,
  };
}

function mapNomenclador(row: NomencladorRow): NomencladorEntry {
  return {
    id: row.id,
    codigo: row.codigo,
    descripcion: row.descripcion,
    capitulo: row.capitulo,
    valorOSDE: row.valor_osde,
    valorSwiss: row.valor_swiss,
    valorPAMI: row.valor_pami,
    valorGaleno: row.valor_galeno,
    vigente: row.vigente,
    ultimaActualizacion: row.ultima_actualizacion,
  };
}

function mapReporte(row: ReporteRow): Reporte {
  return {
    id: row.id,
    nombre: row.nombre,
    categoria: row.categoria,
    descripcion: row.descripcion,
    ultimaGen: row.ultima_gen ?? "",
    formato: row.formato,
  };
}

function mapAuditoria(row: AuditoriaRow): AuditoriaItem {
  return {
    id: row.id,
    fecha: row.fecha,
    paciente: row.paciente,
    prestacion: row.prestacion,
    financiador: row.financiador,
    tipo: row.tipo,
    severidad: row.severidad as AuditoriaItem["severidad"],
    detalle: row.detalle,
    estado: row.estado as AuditoriaItem["estado"],
  };
}

// ─── Query Functions ─────────────────────────────────────────

export async function fetchPacientes(): Promise<Paciente[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("pacientes").select("*").order("nombre");
  if (error) throw error;
  return (data ?? []).map(mapPaciente);
}

export async function fetchPaciente(id: string): Promise<Paciente | null> {
  const supabase = createClient();
  const { data, error } = await supabase.from("pacientes").select("*").eq("id", id).single();
  if (error || !data) return null;
  return mapPaciente(data);
}

export async function fetchFacturas(): Promise<Factura[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("facturas")
    .select("*")
    .order("fecha", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapFactura);
}

export async function fetchRechazos(): Promise<Rechazo[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("rechazos")
    .select("*")
    .order("fecha_rechazo", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapRechazo);
}

export async function fetchFinanciadores(): Promise<Financiador[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("financiadores").select("*").order("name");
  if (error) throw error;
  return (data ?? []).map(mapFinanciador);
}

export async function fetchInflacion(): Promise<InflacionMes[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("inflacion").select("*").order("created_at");
  if (error) throw error;
  return (data ?? []).map(mapInflacion);
}

export async function fetchAlertas(): Promise<Alerta[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("alertas")
    .select("*")
    .order("fecha", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapAlerta);
}

export async function fetchTurnos(): Promise<Turno[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("turnos").select("*").order("hora");
  if (error) throw error;
  return (data ?? []).map(mapTurno);
}

export async function fetchInventario(): Promise<InventarioItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("inventario").select("*").order("nombre");
  if (error) throw error;
  return (data ?? []).map(mapInventario);
}

export async function fetchNomenclador(): Promise<NomencladorEntry[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("nomenclador")
    .select("*")
    .eq("vigente", true)
    .order("codigo");
  if (error) throw error;
  return (data ?? []).map(mapNomenclador);
}

export async function fetchReportes(): Promise<Reporte[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("reportes").select("*").order("nombre");
  if (error) throw error;
  return (data ?? []).map(mapReporte);
}

export async function fetchAuditoria(): Promise<AuditoriaItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("auditoria")
    .select("*")
    .order("fecha", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapAuditoria);
}

// ─── KPI Aggregation Queries ─────────────────────────────────
// These query live Supabase data and compute KPIs from real rows.
// Format helpers:
const fmtARS = (n: number) =>
  n >= 1_000_000
    ? `$${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
      ? `$${(n / 1_000).toFixed(0)}K`
      : `$${n}`;
const pct = (n: number, d: number) => (d ? ((n / d) * 100).toFixed(1) : "0") + "%";
const pp = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(1)}pp`;

import type { KPI } from "@/lib/types";

export async function fetchDashboardKPIs(): Promise<KPI[]> {
  const sb = createClient();
  const { data: facturas } = await sb.from("facturas").select("monto, estado, fecha");
  const { data: rechazos } = await sb.from("rechazos").select("monto, fecha_rechazo");
  const { data: financiadores } = await sb.from("financiadores").select("dias_promedio_pago");

  const rows = facturas ?? [];
  const totalFacturado = rows.reduce((s, r) => s + r.monto, 0);
  const totalCobrado = rows.filter((r) => r.estado === "cobrada").reduce((s, r) => s + r.monto, 0);
  const totalRechazado = (rechazos ?? []).reduce((s, r) => s + r.monto, 0);
  const tasaRechazo = totalFacturado ? (totalRechazado / totalFacturado) * 100 : 0;
  const diasProm =
    (financiadores ?? []).reduce((s, r) => s + r.dias_promedio_pago, 0) /
    Math.max((financiadores ?? []).length, 1);

  return [
    {
      label: "Facturado",
      value: fmtARS(totalFacturado),
      change: `${rows.length} facturas`,
      up: true,
      color: "celeste",
    },
    {
      label: "Cobrado",
      value: fmtARS(totalCobrado),
      change: pct(totalCobrado, totalFacturado),
      up: true,
      color: "celeste",
    },
    {
      label: "Rechazos",
      value: `${tasaRechazo.toFixed(1)}%`,
      change: fmtARS(totalRechazado),
      up: false,
      color: "gold",
    },
    {
      label: "Días promedio cobro",
      value: `${Math.round(diasProm)}`,
      change: `${(financiadores ?? []).length} financiadores`,
      up: false,
      color: "celeste",
    },
  ];
}

export async function fetchFacturacionKPIs(): Promise<KPI[]> {
  const sb = createClient();
  const { data: facturas } = await sb.from("facturas").select("monto, estado");

  const rows = facturas ?? [];
  const totalFacturado = rows.reduce((s, r) => s + r.monto, 0);
  const cobradas = rows.filter((r) => r.estado === "cobrada");
  const totalCobrado = cobradas.reduce((s, r) => s + r.monto, 0);
  const pendientes = rows.filter((r) => r.estado === "pendiente");
  const totalPendiente = pendientes.reduce((s, r) => s + r.monto, 0);
  const tasaCobro = totalFacturado ? (totalCobrado / totalFacturado) * 100 : 0;

  return [
    {
      label: "Facturado",
      value: fmtARS(totalFacturado),
      change: `${rows.length} facturas`,
      up: true,
      color: "celeste",
    },
    {
      label: "Cobrado",
      value: fmtARS(totalCobrado),
      change: pct(totalCobrado, totalFacturado),
      up: true,
      color: "celeste",
    },
    {
      label: "Pendiente",
      value: fmtARS(totalPendiente),
      change: `${pendientes.length} facturas`,
      up: false,
      color: "gold",
    },
    {
      label: "Tasa de cobro",
      value: `${tasaCobro.toFixed(1)}%`,
      change: `${cobradas.length} cobradas`,
      up: true,
      color: "celeste",
    },
  ];
}

export async function fetchRechazosKPIs(): Promise<KPI[]> {
  const sb = createClient();
  const { data: rechazos } = await sb.from("rechazos").select("monto, estado, reprocesable");
  const { data: facturas } = await sb.from("facturas").select("monto");

  const rr = rechazos ?? [];
  const totalRech = rr.reduce((s, r) => s + r.monto, 0);
  const totalFact = (facturas ?? []).reduce((s, r) => s + r.monto, 0);
  const tasaRech = totalFact ? (totalRech / totalFact) * 100 : 0;
  const reprocesados = rr.filter((r) => r.estado === "reprocesado").length;

  return [
    {
      label: "Rechazos",
      value: `${rr.length}`,
      change: `total acumulado`,
      up: false,
      color: "gold",
    },
    {
      label: "Monto rechazado",
      value: fmtARS(totalRech),
      change: `de ${fmtARS(totalFact)}`,
      up: false,
      color: "gold",
    },
    {
      label: "Tasa rechazo",
      value: `${tasaRech.toFixed(1)}%`,
      change: pp(-tasaRech),
      up: false,
      color: "celeste",
    },
    {
      label: "Reprocesados",
      value: `${reprocesados}`,
      change: pct(reprocesados, rr.length),
      up: true,
      color: "celeste",
    },
  ];
}

export async function fetchPacientesKPIs(): Promise<KPI[]> {
  const sb = createClient();
  const { data: pacientes } = await sb.from("pacientes").select("estado");

  const pp2 = pacientes ?? [];
  const total = pp2.length;
  const activos = pp2.filter((r) => r.estado === "activo").length;

  return [
    {
      label: "Total pacientes",
      value: total.toLocaleString("es-AR"),
      change: `registrados`,
      up: true,
      color: "celeste",
    },
    {
      label: "Activos",
      value: activos.toLocaleString("es-AR"),
      change: pct(activos, total),
      up: true,
      color: "celeste",
    },
    {
      label: "Inactivos",
      value: `${total - activos}`,
      change: pct(total - activos, total),
      up: false,
      color: "gold",
    },
    {
      label: "Tasa activos",
      value: pct(activos, total),
      change: `de ${total}`,
      up: true,
      color: "celeste",
    },
  ];
}

export async function fetchAgendaKPIs(): Promise<KPI[]> {
  const sb = createClient();
  const today = new Date().toISOString().slice(0, 10);
  const { data: turnos } = await sb.from("turnos").select("estado").eq("fecha", today);

  const tt = turnos ?? [];
  const total = tt.length;
  const atendidos = tt.filter((r) => r.estado === "atendido").length;
  const cancelados = tt.filter((r) => r.estado === "cancelado").length;
  const ocupacion = total ? ((total - cancelados) / Math.max(total, 1)) * 100 : 0;

  return [
    {
      label: "Turnos hoy",
      value: `${total}`,
      change: `${total - atendidos - cancelados} pendientes`,
      up: true,
      color: "celeste",
    },
    {
      label: "Atendidos",
      value: `${atendidos}`,
      change: pct(atendidos, total),
      up: true,
      color: "celeste",
    },
    {
      label: "Cancelados",
      value: `${cancelados}`,
      change: pct(cancelados, total),
      up: false,
      color: "gold",
    },
    {
      label: "Ocupación",
      value: `${ocupacion.toFixed(0)}%`,
      change: `${total} turnos`,
      up: true,
      color: "celeste",
    },
  ];
}

export async function fetchInventarioKPIs(): Promise<KPI[]> {
  const sb = createClient();
  const { data: items } = await sb.from("inventario").select("stock, minimo, precio, vencimiento");

  const ii = items ?? [];
  const total = ii.length;
  const stockBajo = ii.filter((r) => r.stock <= r.minimo).length;
  const hoy = new Date();
  const seisMeses = new Date(hoy.getFullYear(), hoy.getMonth() + 6, hoy.getDate())
    .toISOString()
    .slice(0, 10);
  const proxVenc = ii.filter((r) => r.vencimiento && r.vencimiento <= seisMeses).length;
  const valorTotal = ii.reduce((s, r) => s + r.stock * r.precio, 0);

  return [
    {
      label: "Total ítems",
      value: `${total}`,
      change: `en inventario`,
      up: true,
      color: "celeste",
    },
    {
      label: "Stock bajo",
      value: `${stockBajo}`,
      change: "requieren atención",
      up: false,
      color: "gold",
    },
    {
      label: "Próx. vencimiento",
      value: `${proxVenc}`,
      change: "< 6 meses",
      up: false,
      color: "gold",
    },
    {
      label: "Valor total",
      value: fmtARS(valorTotal),
      change: `${total} ítems`,
      up: true,
      color: "celeste",
    },
  ];
}

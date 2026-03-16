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
// Supabase .select() returns typed rows, but since we don't generate
// database types yet, we use a permissive record type for mappers.
// Once `supabase gen types typescript` is run, replace R with generated types.
type R = Record<string, any>; // eslint-disable-line

// ─── Row → Entity Mappers ────────────────────────────────────
// Supabase returns snake_case rows; our TS types use camelCase.

function mapPaciente(row: R): Paciente {
  return {
    id: row.id,
    nombre: row.nombre,
    dni: row.dni,
    financiador: row.financiador,
    plan: row.plan,
    ultimaVisita: row.ultima_visita ?? "",
    estado: row.estado,
    email: row.email ?? "",
    telefono: row.telefono ?? "",
    fechaNacimiento: row.fecha_nacimiento ?? "",
    direccion: row.direccion ?? "",
  };
}

function mapFactura(row: R): Factura {
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

function mapRechazo(row: R): Rechazo {
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
    estado: row.estado,
  };
}

function mapFinanciador(row: R): Financiador {
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

function mapInflacion(row: R): InflacionMes {
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

function mapAlerta(row: R): Alerta {
  return {
    id: row.id,
    tipo: row.tipo,
    titulo: row.titulo,
    detalle: row.detalle,
    fecha: row.fecha,
    acento: row.acento,
  };
}

function mapTurno(row: R): Turno {
  return {
    id: row.id,
    hora: row.hora,
    paciente: row.paciente,
    tipo: row.tipo,
    financiador: row.financiador,
    profesional: row.profesional,
    estado: row.estado,
    notas: row.notas ?? undefined,
  };
}

function mapInventario(row: R): InventarioItem {
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

function mapNomenclador(row: R): NomencladorEntry {
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

function mapReporte(row: R): Reporte {
  return {
    id: row.id,
    nombre: row.nombre,
    categoria: row.categoria,
    descripcion: row.descripcion,
    ultimaGen: row.ultima_gen ?? "",
    formato: row.formato,
  };
}

function mapAuditoria(row: R): AuditoriaItem {
  return {
    id: row.id,
    fecha: row.fecha,
    paciente: row.paciente,
    prestacion: row.prestacion,
    financiador: row.financiador,
    tipo: row.tipo,
    severidad: row.severidad,
    detalle: row.detalle,
    estado: row.estado,
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

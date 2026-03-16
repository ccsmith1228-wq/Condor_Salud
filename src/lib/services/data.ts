// ─── Centralized Demo Data Service ───────────────────────────
// All mock data lives here. Pages import from services, not inline arrays.
// When Supabase is connected, real DB queries are used automatically.
//
// Every function returns a Promise to match async DB patterns.

import type {
  Factura,
  Rechazo,
  Financiador,
  InflacionMes,
  Alerta,
  KPI,
  FacturaEstado,
  FinanciadorType,
  RechazoMotivo,
} from "@/lib/types";
import { delay } from "@/lib/utils";
import { isSupabaseConfigured } from "@/lib/env";

// ─── Simulate network latency in dev ─────────────────────────
const SIM_DELAY = process.env.NODE_ENV === "development" ? 150 : 0;

// ─── Pacientes ───────────────────────────────────────────────
export interface Paciente {
  id: string;
  nombre: string;
  dni: string;
  financiador: string;
  plan: string;
  ultimaVisita: string;
  estado: "activo" | "inactivo";
  email: string;
  telefono: string;
  fechaNacimiento: string;
  direccion: string;
}

const PACIENTES: Paciente[] = [
  {
    id: "p1",
    nombre: "María García",
    dni: "28.456.789",
    financiador: "OSDE",
    plan: "310",
    ultimaVisita: "2026-03-08",
    estado: "activo",
    email: "maria@email.com",
    telefono: "11-4567-8901",
    fechaNacimiento: "1980-05-12",
    direccion: "Av. Corrientes 1234, CABA",
  },
  {
    id: "p2",
    nombre: "Carlos López",
    dni: "31.234.567",
    financiador: "Swiss Medical",
    plan: "SMG20",
    ultimaVisita: "2026-03-07",
    estado: "activo",
    email: "carlos@email.com",
    telefono: "11-2345-6789",
    fechaNacimiento: "1975-11-23",
    direccion: "Av. Santa Fe 4321, CABA",
  },
  {
    id: "p3",
    nombre: "Ana Martínez",
    dni: "35.678.901",
    financiador: "Galeno",
    plan: "Oro",
    ultimaVisita: "2026-03-05",
    estado: "activo",
    email: "ana@email.com",
    telefono: "11-3456-7890",
    fechaNacimiento: "1990-03-08",
    direccion: "Calle Florida 567, CABA",
  },
  {
    id: "p4",
    nombre: "Roberto Sánchez",
    dni: "22.345.678",
    financiador: "PAMI",
    plan: "Básico",
    ultimaVisita: "2026-02-28",
    estado: "activo",
    email: "roberto@email.com",
    telefono: "11-4567-0123",
    fechaNacimiento: "1958-07-15",
    direccion: "Av. Rivadavia 8765, CABA",
  },
  {
    id: "p5",
    nombre: "Lucía Fernández",
    dni: "40.123.456",
    financiador: "OSDE",
    plan: "210",
    ultimaVisita: "2026-03-06",
    estado: "activo",
    email: "lucia@email.com",
    telefono: "11-5678-1234",
    fechaNacimiento: "1995-01-20",
    direccion: "Av. Callao 1111, CABA",
  },
  {
    id: "p6",
    nombre: "Diego Rodríguez",
    dni: "27.890.123",
    financiador: "Medifé",
    plan: "Bronce",
    ultimaVisita: "2026-03-01",
    estado: "inactivo",
    email: "diego@email.com",
    telefono: "11-6789-2345",
    fechaNacimiento: "1982-09-30",
    direccion: "Tucumán 2222, CABA",
  },
  {
    id: "p7",
    nombre: "Valentina Pérez",
    dni: "38.567.890",
    financiador: "Swiss Medical",
    plan: "SMG30",
    ultimaVisita: "2026-03-09",
    estado: "activo",
    email: "valentina@email.com",
    telefono: "11-7890-3456",
    fechaNacimiento: "1992-12-05",
    direccion: "Av. Belgrano 3333, CABA",
  },
  {
    id: "p8",
    nombre: "Martín Gómez",
    dni: "33.012.345",
    financiador: "Galeno",
    plan: "Plata",
    ultimaVisita: "2026-02-25",
    estado: "activo",
    email: "martin@email.com",
    telefono: "11-8901-4567",
    fechaNacimiento: "1988-04-18",
    direccion: "Av. de Mayo 4444, CABA",
  },
  {
    id: "p9",
    nombre: "Sofía Torres",
    dni: "42.345.678",
    financiador: "PAMI",
    plan: "Básico",
    ultimaVisita: "2026-03-04",
    estado: "activo",
    email: "sofia@email.com",
    telefono: "11-9012-5678",
    fechaNacimiento: "1960-06-25",
    direccion: "Lavalle 5555, CABA",
  },
  {
    id: "p10",
    nombre: "Facundo Díaz",
    dni: "36.789.012",
    financiador: "OSDE",
    plan: "450",
    ultimaVisita: "2026-03-03",
    estado: "activo",
    email: "facundo@email.com",
    telefono: "11-0123-6789",
    fechaNacimiento: "1991-10-10",
    direccion: "Av. Libertador 6666, CABA",
  },
  {
    id: "p11",
    nombre: "Camila Ruiz",
    dni: "29.456.123",
    financiador: "Medifé",
    plan: "Oro",
    ultimaVisita: "2026-02-20",
    estado: "inactivo",
    email: "camila@email.com",
    telefono: "11-1234-7890",
    fechaNacimiento: "1978-02-14",
    direccion: "Paraguay 7777, CABA",
  },
  {
    id: "p12",
    nombre: "Tomás Herrera",
    dni: "44.890.567",
    financiador: "Galeno",
    plan: "Platino",
    ultimaVisita: "2026-03-10",
    estado: "activo",
    email: "tomas@email.com",
    telefono: "11-2345-8901",
    fechaNacimiento: "1998-08-22",
    direccion: "Junín 8888, CABA",
  },
];

// ─── Facturas ────────────────────────────────────────────────
const FACTURAS: Factura[] = [
  {
    id: "f1",
    numero: "FC-2026-001847",
    fecha: "2026-03-08",
    financiador: "OSDE",
    paciente: "María García",
    prestacion: "Consulta clínica",
    codigoNomenclador: "420101",
    monto: 18500,
    estado: "cobrada",
    fechaPresentacion: "2026-03-08",
    fechaCobro: "2026-03-10",
    cae: "73001234567890",
  },
  {
    id: "f2",
    numero: "FC-2026-001848",
    fecha: "2026-03-07",
    financiador: "Swiss Medical",
    paciente: "Carlos López",
    prestacion: "Electrocardiograma",
    codigoNomenclador: "420607",
    monto: 32000,
    estado: "presentada",
    fechaPresentacion: "2026-03-07",
  },
  {
    id: "f3",
    numero: "FC-2026-001849",
    fecha: "2026-03-07",
    financiador: "PAMI",
    paciente: "Roberto Sánchez",
    prestacion: "Ecografía abdominal",
    codigoNomenclador: "420720",
    monto: 45000,
    estado: "rechazada",
    fechaPresentacion: "2026-03-07",
  },
  {
    id: "f4",
    numero: "FC-2026-001850",
    fecha: "2026-03-06",
    financiador: "Galeno",
    paciente: "Ana Martínez",
    prestacion: "Laboratorio completo",
    codigoNomenclador: "420301",
    monto: 28500,
    estado: "pendiente",
  },
  {
    id: "f5",
    numero: "FC-2026-001851",
    fecha: "2026-03-06",
    financiador: "OSDE",
    paciente: "Lucía Fernández",
    prestacion: "Consulta especialista",
    codigoNomenclador: "420102",
    monto: 22000,
    estado: "cobrada",
    fechaPresentacion: "2026-03-06",
    fechaCobro: "2026-03-09",
    cae: "73001234567891",
  },
  {
    id: "f6",
    numero: "FC-2026-001852",
    fecha: "2026-03-05",
    financiador: "Medifé",
    paciente: "Diego Rodríguez",
    prestacion: "Radiografía tórax",
    codigoNomenclador: "420501",
    monto: 15000,
    estado: "en_observacion",
    fechaPresentacion: "2026-03-05",
  },
  {
    id: "f7",
    numero: "FC-2026-001853",
    fecha: "2026-03-05",
    financiador: "Swiss Medical",
    paciente: "Valentina Pérez",
    prestacion: "RMN cerebro",
    codigoNomenclador: "420810",
    monto: 85000,
    estado: "presentada",
    fechaPresentacion: "2026-03-05",
  },
  {
    id: "f8",
    numero: "FC-2026-001854",
    fecha: "2026-03-04",
    financiador: "PAMI",
    paciente: "Sofía Torres",
    prestacion: "Consulta cardiología",
    codigoNomenclador: "420103",
    monto: 12500,
    estado: "cobrada",
    fechaPresentacion: "2026-03-04",
    fechaCobro: "2026-03-08",
    cae: "73001234567892",
  },
  {
    id: "f9",
    numero: "FC-2026-001855",
    fecha: "2026-03-03",
    financiador: "Galeno",
    paciente: "Martín Gómez",
    prestacion: "Endoscopia digestiva",
    codigoNomenclador: "420920",
    monto: 67000,
    estado: "rechazada",
    fechaPresentacion: "2026-03-03",
  },
  {
    id: "f10",
    numero: "FC-2026-001856",
    fecha: "2026-03-03",
    financiador: "OSDE",
    paciente: "Facundo Díaz",
    prestacion: "Hemograma completo",
    codigoNomenclador: "420302",
    monto: 9800,
    estado: "pendiente",
  },
];

// ─── Rechazos ────────────────────────────────────────────────
const RECHAZOS: Rechazo[] = [
  {
    id: "r1",
    facturaId: "f3",
    facturaNumero: "FC-2026-001849",
    financiador: "PAMI",
    paciente: "Roberto Sánchez",
    prestacion: "Ecografía abdominal",
    monto: 45000,
    motivo: "sin_autorizacion",
    motivoDetalle: "No se encontró autorización previa para el código 420720",
    fechaRechazo: "2026-03-09",
    fechaPresentacion: "2026-03-07",
    reprocesable: true,
    estado: "pendiente",
  },
  {
    id: "r2",
    facturaId: "f9",
    facturaNumero: "FC-2026-001855",
    financiador: "Galeno",
    paciente: "Martín Gómez",
    prestacion: "Endoscopia digestiva",
    monto: 67000,
    motivo: "codigo_invalido",
    motivoDetalle: "Código 420920 no vigente en nomenclador Galeno 2026",
    fechaRechazo: "2026-03-08",
    fechaPresentacion: "2026-03-03",
    reprocesable: true,
    estado: "pendiente",
  },
  {
    id: "r3",
    facturaId: "f11",
    facturaNumero: "FC-2026-001840",
    financiador: "Swiss Medical",
    paciente: "Pedro Acosta",
    prestacion: "TAC tórax",
    monto: 72000,
    motivo: "afiliado_no_encontrado",
    motivoDetalle: "DNI 30.456.789 no registrado en padrón Swiss Medical marzo 2026",
    fechaRechazo: "2026-03-07",
    fechaPresentacion: "2026-03-02",
    reprocesable: false,
    estado: "pendiente",
  },
  {
    id: "r4",
    facturaId: "f12",
    facturaNumero: "FC-2026-001838",
    financiador: "OSDE",
    paciente: "Laura Méndez",
    prestacion: "Consulta nutrición",
    monto: 16000,
    motivo: "duplicada",
    motivoDetalle: "Factura con mismo código y fecha ya presentada (FC-2026-001820)",
    fechaRechazo: "2026-03-06",
    fechaPresentacion: "2026-03-01",
    reprocesable: false,
    estado: "descartado",
  },
  {
    id: "r5",
    facturaId: "f13",
    facturaNumero: "FC-2026-001835",
    financiador: "PAMI",
    paciente: "Jorge Gutiérrez",
    prestacion: "Kinesiología sesión",
    monto: 8500,
    motivo: "datos_incompletos",
    motivoDetalle: "Falta número de autorización en campo obligatorio",
    fechaRechazo: "2026-03-05",
    fechaPresentacion: "2026-02-28",
    reprocesable: true,
    estado: "reprocesado",
  },
  {
    id: "r6",
    facturaId: "f14",
    facturaNumero: "FC-2026-001832",
    financiador: "Medifé",
    paciente: "Claudia Vega",
    prestacion: "Mamografía bilateral",
    monto: 35000,
    motivo: "vencida",
    motivoDetalle: "Presentación fuera de plazo (>60 días)",
    fechaRechazo: "2026-03-04",
    fechaPresentacion: "2026-01-02",
    reprocesable: false,
    estado: "pendiente",
  },
  {
    id: "r7",
    facturaId: "f15",
    facturaNumero: "FC-2026-001828",
    financiador: "Galeno",
    paciente: "Ricardo Blanco",
    prestacion: "Análisis hormonal",
    monto: 22000,
    motivo: "nomenclador_desactualizado",
    motivoDetalle: "Valor facturado supera tope 2026 para código 420380",
    fechaRechazo: "2026-03-03",
    fechaPresentacion: "2026-02-25",
    reprocesable: true,
    estado: "pendiente",
  },
  {
    id: "r8",
    facturaId: "f16",
    facturaNumero: "FC-2026-001825",
    financiador: "Swiss Medical",
    paciente: "Natalia Ríos",
    prestacion: "Densitometría ósea",
    monto: 28000,
    motivo: "sin_autorizacion",
    motivoDetalle: "Requiere autorización previa para afiliados plan SMG10",
    fechaRechazo: "2026-03-02",
    fechaPresentacion: "2026-02-22",
    reprocesable: true,
    estado: "pendiente",
  },
];

// ─── Financiadores ───────────────────────────────────────────
const FINANCIADORES: Financiador[] = [
  {
    id: "fin1",
    name: "OSDE",
    type: "prepaga",
    facturado: 2850000,
    cobrado: 2420000,
    tasaRechazo: 4.2,
    diasPromedioPago: 28,
    facturasPendientes: 12,
    ultimoPago: "2026-03-05",
  },
  {
    id: "fin2",
    name: "Swiss Medical",
    type: "prepaga",
    facturado: 1920000,
    cobrado: 1540000,
    tasaRechazo: 7.8,
    diasPromedioPago: 35,
    facturasPendientes: 18,
    ultimoPago: "2026-03-02",
  },
  {
    id: "fin3",
    name: "PAMI",
    type: "pami",
    facturado: 3100000,
    cobrado: 2170000,
    tasaRechazo: 12.5,
    diasPromedioPago: 62,
    facturasPendientes: 45,
    ultimoPago: "2026-02-15",
  },
  {
    id: "fin4",
    name: "Galeno",
    type: "prepaga",
    facturado: 1450000,
    cobrado: 1280000,
    tasaRechazo: 5.1,
    diasPromedioPago: 22,
    facturasPendientes: 8,
    ultimoPago: "2026-03-07",
  },
  {
    id: "fin5",
    name: "Medifé",
    type: "prepaga",
    facturado: 890000,
    cobrado: 756000,
    tasaRechazo: 6.3,
    diasPromedioPago: 30,
    facturasPendientes: 6,
    ultimoPago: "2026-03-01",
  },
  {
    id: "fin6",
    name: "IOMA",
    type: "os",
    facturado: 680000,
    cobrado: 408000,
    tasaRechazo: 15.2,
    diasPromedioPago: 75,
    facturasPendientes: 22,
    ultimoPago: "2026-01-28",
  },
  {
    id: "fin7",
    name: "OSECAC",
    type: "os",
    facturado: 520000,
    cobrado: 442000,
    tasaRechazo: 3.8,
    diasPromedioPago: 25,
    facturasPendientes: 5,
    ultimoPago: "2026-03-04",
  },
];

// ─── Inflación ───────────────────────────────────────────────
const INFLACION: InflacionMes[] = [
  {
    mes: "Oct 2025",
    ipc: 3.5,
    facturado: 8200000,
    cobrado: 6890000,
    diasDemora: 38,
    perdidaReal: 241150,
    perdidaPorcentaje: 3.5,
  },
  {
    mes: "Nov 2025",
    ipc: 3.2,
    facturado: 8450000,
    cobrado: 7100000,
    diasDemora: 40,
    perdidaReal: 227200,
    perdidaPorcentaje: 3.2,
  },
  {
    mes: "Dic 2025",
    ipc: 4.1,
    facturado: 9100000,
    cobrado: 7500000,
    diasDemora: 42,
    perdidaReal: 307500,
    perdidaPorcentaje: 4.1,
  },
  {
    mes: "Ene 2026",
    ipc: 3.8,
    facturado: 7800000,
    cobrado: 6450000,
    diasDemora: 45,
    perdidaReal: 245100,
    perdidaPorcentaje: 3.8,
  },
  {
    mes: "Feb 2026",
    ipc: 3.3,
    facturado: 8600000,
    cobrado: 7200000,
    diasDemora: 41,
    perdidaReal: 237600,
    perdidaPorcentaje: 3.3,
  },
  {
    mes: "Mar 2026",
    ipc: 2.9,
    facturado: 9400000,
    cobrado: 7850000,
    diasDemora: 37,
    perdidaReal: 227650,
    perdidaPorcentaje: 2.9,
  },
];

// ─── Alertas ─────────────────────────────────────────────────
const ALERTAS: Alerta[] = [
  {
    id: "a1",
    tipo: "rechazo",
    titulo: "Lote PAMI rechazado",
    detalle: "15 facturas del lote #2026-089 fueron rechazadas por nomenclador desactualizado",
    fecha: "2026-03-10T09:15:00",
    acento: "gold",
  },
  {
    id: "a2",
    tipo: "vencimiento",
    titulo: "Vencimiento de presentación",
    detalle: "8 facturas de Swiss Medical vencen en 5 días (plazo 60 días)",
    fecha: "2026-03-10T08:30:00",
    acento: "gold",
  },
  {
    id: "a3",
    tipo: "nomenclador",
    titulo: "Actualización de nomenclador",
    detalle: "OSDE publicó nuevos valores para marzo 2026 — 342 códigos actualizados",
    fecha: "2026-03-09T14:00:00",
    acento: "celeste",
  },
  {
    id: "a4",
    tipo: "pago",
    titulo: "Pago recibido — Galeno",
    detalle: "Transferencia $1.280.000 acreditada. Corresponde a lote #2026-072",
    fecha: "2026-03-09T11:20:00",
    acento: "celeste",
  },
  {
    id: "a5",
    tipo: "inflacion",
    titulo: "IPC marzo: 2.9%",
    detalle: "La pérdida estimada por demora en cobros este mes es de $227.650",
    fecha: "2026-03-08T16:45:00",
    acento: "gold",
  },
  {
    id: "a6",
    tipo: "rechazo",
    titulo: "Rechazo Swiss Medical",
    detalle: "Factura FC-2026-001828 rechazada: densitometría requiere autorización previa",
    fecha: "2026-03-07T10:00:00",
    acento: "gold",
  },
  {
    id: "a7",
    tipo: "pago",
    titulo: "Demora IOMA > 75 días",
    detalle: "22 facturas pendientes de cobro superan los 75 días de demora promedio",
    fecha: "2026-03-06T09:00:00",
    acento: "gold",
  },
  {
    id: "a8",
    tipo: "nomenclador",
    titulo: "Códigos deprecados",
    detalle: "3 códigos que usás frecuentemente serán discontinuados en abril 2026",
    fecha: "2026-03-05T13:30:00",
    acento: "celeste",
  },
  {
    id: "a9",
    tipo: "vencimiento",
    titulo: "Insumo próximo a vencer",
    detalle: "Guantes estériles Lote L-2024-156 vence el 15/03/2026 — 45 unidades",
    fecha: "2026-03-04T08:00:00",
    acento: "gold",
  },
  {
    id: "a10",
    tipo: "pago",
    titulo: "Pago recibido — OSECAC",
    detalle: "Transferencia $442.000 acreditada. Corresponde a lote #2026-068",
    fecha: "2026-03-03T15:10:00",
    acento: "celeste",
  },
];

// ─── Agenda / Turnos ─────────────────────────────────────────
export interface Turno {
  id: string;
  hora: string;
  paciente: string;
  tipo: string;
  financiador: string;
  profesional: string;
  estado: "confirmado" | "pendiente" | "cancelado" | "atendido";
  notas?: string;
}

const TURNOS: Turno[] = [
  {
    id: "t1",
    hora: "08:00",
    paciente: "María García",
    tipo: "Consulta clínica",
    financiador: "OSDE",
    profesional: "Dr. Rodríguez",
    estado: "atendido",
  },
  {
    id: "t2",
    hora: "08:30",
    paciente: "Carlos López",
    tipo: "Electrocardiograma",
    financiador: "Swiss Medical",
    profesional: "Dr. Rodríguez",
    estado: "atendido",
  },
  {
    id: "t3",
    hora: "09:00",
    paciente: "Ana Martínez",
    tipo: "Control",
    financiador: "Galeno",
    profesional: "Dra. Fernández",
    estado: "atendido",
  },
  {
    id: "t4",
    hora: "09:30",
    paciente: "Roberto Sánchez",
    tipo: "Ecografía",
    financiador: "PAMI",
    profesional: "Dr. Molina",
    estado: "confirmado",
  },
  {
    id: "t5",
    hora: "10:00",
    paciente: "Lucía Fernández",
    tipo: "Consulta",
    financiador: "OSDE",
    profesional: "Dra. Fernández",
    estado: "confirmado",
  },
  {
    id: "t6",
    hora: "10:30",
    paciente: "Diego Rodríguez",
    tipo: "Radiografía",
    financiador: "Medifé",
    profesional: "Dr. Molina",
    estado: "pendiente",
  },
  {
    id: "t7",
    hora: "11:00",
    paciente: "Valentina Pérez",
    tipo: "RMN",
    financiador: "Swiss Medical",
    profesional: "Dr. Rodríguez",
    estado: "confirmado",
  },
  {
    id: "t8",
    hora: "11:30",
    paciente: "Martín Gómez",
    tipo: "Consulta",
    financiador: "Galeno",
    profesional: "Dra. Fernández",
    estado: "pendiente",
  },
  {
    id: "t9",
    hora: "12:00",
    paciente: "Sofía Torres",
    tipo: "Cardiología",
    financiador: "PAMI",
    profesional: "Dr. Rodríguez",
    estado: "confirmado",
  },
  {
    id: "t10",
    hora: "14:00",
    paciente: "Facundo Díaz",
    tipo: "Laboratorio",
    financiador: "OSDE",
    profesional: "Dra. López",
    estado: "confirmado",
  },
  {
    id: "t11",
    hora: "14:30",
    paciente: "Camila Ruiz",
    tipo: "Consulta",
    financiador: "Medifé",
    profesional: "Dr. Rodríguez",
    estado: "cancelado",
    notas: "Paciente reprogramó",
  },
  {
    id: "t12",
    hora: "15:00",
    paciente: "Tomás Herrera",
    tipo: "Control post-op",
    financiador: "Galeno",
    profesional: "Dr. Molina",
    estado: "confirmado",
  },
  {
    id: "t13",
    hora: "15:30",
    paciente: "Laura Méndez",
    tipo: "Nutrición",
    financiador: "OSDE",
    profesional: "Lic. Gómez",
    estado: "pendiente",
  },
  {
    id: "t14",
    hora: "16:00",
    paciente: "Pedro Acosta",
    tipo: "TAC",
    financiador: "Swiss Medical",
    profesional: "Dr. Molina",
    estado: "confirmado",
  },
  {
    id: "t15",
    hora: "16:30",
    paciente: "Jorge Gutiérrez",
    tipo: "Kinesiología",
    financiador: "PAMI",
    profesional: "Lic. Martín",
    estado: "confirmado",
  },
  {
    id: "t16",
    hora: "17:00",
    paciente: "Claudia Vega",
    tipo: "Mamografía",
    financiador: "Medifé",
    profesional: "Dra. López",
    estado: "pendiente",
  },
];

// ─── Inventario ──────────────────────────────────────────────
export interface InventarioItem {
  id: string;
  nombre: string;
  categoria: string;
  stock: number;
  minimo: number;
  unidad: string;
  precio: number;
  proveedor: string;
  vencimiento?: string;
  lote?: string;
}

const INVENTARIO: InventarioItem[] = [
  {
    id: "inv1",
    nombre: "Guantes estériles (par)",
    categoria: "Descartable",
    stock: 450,
    minimo: 200,
    unidad: "par",
    precio: 280,
    proveedor: "MedSupply AR",
    vencimiento: "2026-09-15",
    lote: "L-2025-234",
  },
  {
    id: "inv2",
    nombre: "Jeringas 5ml",
    categoria: "Descartable",
    stock: 380,
    minimo: 150,
    unidad: "unidad",
    precio: 120,
    proveedor: "MedSupply AR",
    lote: "L-2025-567",
  },
  {
    id: "inv3",
    nombre: "Gasas estériles 10x10",
    categoria: "Descartable",
    stock: 600,
    minimo: 300,
    unidad: "paquete",
    precio: 95,
    proveedor: "Covidien",
    lote: "L-2025-890",
  },
  {
    id: "inv4",
    nombre: "Alcohol 70% (1L)",
    categoria: "Antiséptico",
    stock: 25,
    minimo: 20,
    unidad: "litro",
    precio: 850,
    proveedor: "Lab. Barracas",
  },
  {
    id: "inv5",
    nombre: "Ibuprofeno 400mg",
    categoria: "Medicamento",
    stock: 180,
    minimo: 100,
    unidad: "comprimido",
    precio: 45,
    proveedor: "Roemmers",
    vencimiento: "2027-01-20",
    lote: "L-2025-112",
  },
  {
    id: "inv6",
    nombre: "Suero fisiológico 500ml",
    categoria: "Solución",
    stock: 85,
    minimo: 50,
    unidad: "unidad",
    precio: 420,
    proveedor: "Fresenius Kabi",
    vencimiento: "2026-12-01",
    lote: "L-2025-445",
  },
  {
    id: "inv7",
    nombre: "Cinta micropore 2.5cm",
    categoria: "Descartable",
    stock: 120,
    minimo: 60,
    unidad: "rollo",
    precio: 350,
    proveedor: "3M",
  },
  {
    id: "inv8",
    nombre: "Amoxicilina 500mg",
    categoria: "Medicamento",
    stock: 200,
    minimo: 80,
    unidad: "comprimido",
    precio: 65,
    proveedor: "Bagó",
    vencimiento: "2027-03-15",
    lote: "L-2025-778",
  },
  {
    id: "inv9",
    nombre: "Barbijos quirúrgicos",
    categoria: "Descartable",
    stock: 800,
    minimo: 400,
    unidad: "unidad",
    precio: 35,
    proveedor: "MedSupply AR",
    lote: "L-2026-001",
  },
  {
    id: "inv10",
    nombre: "Gel ecográfico (1L)",
    categoria: "Insumo",
    stock: 12,
    minimo: 8,
    unidad: "litro",
    precio: 1200,
    proveedor: "EcoGel",
  },
  {
    id: "inv11",
    nombre: "Agujas hipodérmicas 21G",
    categoria: "Descartable",
    stock: 500,
    minimo: 200,
    unidad: "unidad",
    precio: 55,
    proveedor: "BD Medical",
    lote: "L-2025-993",
  },
  {
    id: "inv12",
    nombre: "Diclofenac gel 1%",
    categoria: "Medicamento",
    stock: 45,
    minimo: 30,
    unidad: "tubo",
    precio: 380,
    proveedor: "Novartis",
    vencimiento: "2026-11-10",
  },
];

// ─── Nomenclador ─────────────────────────────────────────────
export interface NomencladorEntry {
  id: string;
  codigo: string;
  descripcion: string;
  capitulo: string;
  valorOSDE: number;
  valorSwiss: number;
  valorPAMI: number;
  valorGaleno: number;
  vigente: boolean;
  ultimaActualizacion: string;
}

const NOMENCLADOR: NomencladorEntry[] = [
  {
    id: "n1",
    codigo: "420101",
    descripcion: "Consulta médica en consultorio",
    capitulo: "Consultas",
    valorOSDE: 18500,
    valorSwiss: 19200,
    valorPAMI: 12500,
    valorGaleno: 17800,
    vigente: true,
    ultimaActualizacion: "2026-03-01",
  },
  {
    id: "n2",
    codigo: "420102",
    descripcion: "Consulta médica especialista",
    capitulo: "Consultas",
    valorOSDE: 22000,
    valorSwiss: 23500,
    valorPAMI: 14800,
    valorGaleno: 21000,
    vigente: true,
    ultimaActualizacion: "2026-03-01",
  },
  {
    id: "n3",
    codigo: "420103",
    descripcion: "Consulta cardiológica",
    capitulo: "Consultas",
    valorOSDE: 24000,
    valorSwiss: 25000,
    valorPAMI: 15500,
    valorGaleno: 23000,
    vigente: true,
    ultimaActualizacion: "2026-03-01",
  },
  {
    id: "n4",
    codigo: "420301",
    descripcion: "Laboratorio completo (rutina)",
    capitulo: "Laboratorio",
    valorOSDE: 28500,
    valorSwiss: 30000,
    valorPAMI: 18000,
    valorGaleno: 27000,
    vigente: true,
    ultimaActualizacion: "2026-03-01",
  },
  {
    id: "n5",
    codigo: "420302",
    descripcion: "Hemograma completo",
    capitulo: "Laboratorio",
    valorOSDE: 9800,
    valorSwiss: 10500,
    valorPAMI: 6500,
    valorGaleno: 9200,
    vigente: true,
    ultimaActualizacion: "2026-03-01",
  },
  {
    id: "n6",
    codigo: "420501",
    descripcion: "Radiografía de tórax (frente y perfil)",
    capitulo: "Diagnóstico por imagen",
    valorOSDE: 15000,
    valorSwiss: 16000,
    valorPAMI: 9800,
    valorGaleno: 14500,
    vigente: true,
    ultimaActualizacion: "2026-03-01",
  },
  {
    id: "n7",
    codigo: "420607",
    descripcion: "Electrocardiograma",
    capitulo: "Cardiología",
    valorOSDE: 32000,
    valorSwiss: 34000,
    valorPAMI: 21000,
    valorGaleno: 30000,
    vigente: true,
    ultimaActualizacion: "2026-03-01",
  },
  {
    id: "n8",
    codigo: "420720",
    descripcion: "Ecografía abdominal completa",
    capitulo: "Diagnóstico por imagen",
    valorOSDE: 45000,
    valorSwiss: 48000,
    valorPAMI: 28000,
    valorGaleno: 42000,
    vigente: true,
    ultimaActualizacion: "2026-03-01",
  },
  {
    id: "n9",
    codigo: "420810",
    descripcion: "RMN cerebro con contraste",
    capitulo: "Diagnóstico por imagen",
    valorOSDE: 85000,
    valorSwiss: 90000,
    valorPAMI: 55000,
    valorGaleno: 80000,
    vigente: true,
    ultimaActualizacion: "2026-03-01",
  },
  {
    id: "n10",
    codigo: "420920",
    descripcion: "Endoscopia digestiva alta",
    capitulo: "Procedimientos",
    valorOSDE: 67000,
    valorSwiss: 72000,
    valorPAMI: 42000,
    valorGaleno: 63000,
    vigente: true,
    ultimaActualizacion: "2026-03-01",
  },
  {
    id: "n11",
    codigo: "420380",
    descripcion: "Panel hormonal completo",
    capitulo: "Laboratorio",
    valorOSDE: 35000,
    valorSwiss: 38000,
    valorPAMI: 22000,
    valorGaleno: 33000,
    vigente: true,
    ultimaActualizacion: "2026-03-01",
  },
  {
    id: "n12",
    codigo: "421010",
    descripcion: "Sesión de kinesiología",
    capitulo: "Rehabilitación",
    valorOSDE: 12000,
    valorSwiss: 13000,
    valorPAMI: 8500,
    valorGaleno: 11500,
    vigente: true,
    ultimaActualizacion: "2026-03-01",
  },
  {
    id: "n13",
    codigo: "420610",
    descripcion: "Ecocardiograma doppler",
    capitulo: "Cardiología",
    valorOSDE: 42000,
    valorSwiss: 45000,
    valorPAMI: 27000,
    valorGaleno: 40000,
    vigente: true,
    ultimaActualizacion: "2026-03-01",
  },
  {
    id: "n14",
    codigo: "420520",
    descripcion: "Mamografía bilateral",
    capitulo: "Diagnóstico por imagen",
    valorOSDE: 35000,
    valorSwiss: 37000,
    valorPAMI: 22000,
    valorGaleno: 33000,
    vigente: true,
    ultimaActualizacion: "2026-03-01",
  },
  {
    id: "n15",
    codigo: "420530",
    descripcion: "Densitometría ósea",
    capitulo: "Diagnóstico por imagen",
    valorOSDE: 28000,
    valorSwiss: 30000,
    valorPAMI: 18000,
    valorGaleno: 26000,
    vigente: true,
    ultimaActualizacion: "2026-03-01",
  },
  {
    id: "n16",
    codigo: "420830",
    descripcion: "TAC tórax con contraste",
    capitulo: "Diagnóstico por imagen",
    valorOSDE: 72000,
    valorSwiss: 76000,
    valorPAMI: 48000,
    valorGaleno: 68000,
    vigente: true,
    ultimaActualizacion: "2026-03-01",
  },
  {
    id: "n17",
    codigo: "420150",
    descripcion: "Consulta nutrición",
    capitulo: "Consultas",
    valorOSDE: 16000,
    valorSwiss: 17000,
    valorPAMI: 10000,
    valorGaleno: 15000,
    vigente: true,
    ultimaActualizacion: "2026-03-01",
  },
  {
    id: "n18",
    codigo: "420105",
    descripcion: "Consulta psicología",
    capitulo: "Consultas",
    valorOSDE: 20000,
    valorSwiss: 21000,
    valorPAMI: 13000,
    valorGaleno: 19000,
    vigente: true,
    ultimaActualizacion: "2026-03-01",
  },
];

// ─── Reportes ────────────────────────────────────────────────
export interface Reporte {
  id: string;
  nombre: string;
  categoria: string;
  descripcion: string;
  ultimaGen: string;
  formato: string;
}

const REPORTES: Reporte[] = [
  {
    id: "rep1",
    nombre: "Facturación mensual",
    categoria: "Facturación",
    descripcion: "Detalle de facturación por financiador con estado de cobro",
    ultimaGen: "2026-03-01",
    formato: "PDF / Excel",
  },
  {
    id: "rep2",
    nombre: "Rechazos por motivo",
    categoria: "Rechazos",
    descripcion: "Distribución de rechazos agrupados por motivo y financiador",
    ultimaGen: "2026-03-05",
    formato: "PDF / Excel",
  },
  {
    id: "rep3",
    nombre: "Cobranzas pendientes",
    categoria: "Facturación",
    descripcion: "Facturas pendientes de cobro con antigüedad y financiador",
    ultimaGen: "2026-03-08",
    formato: "PDF / Excel",
  },
  {
    id: "rep4",
    nombre: "Producción por profesional",
    categoria: "Operativo",
    descripcion: "Prestaciones realizadas por cada profesional del equipo",
    ultimaGen: "2026-02-28",
    formato: "PDF",
  },
  {
    id: "rep5",
    nombre: "Impacto inflacionario",
    categoria: "Financiero",
    descripcion: "Pérdida real por desfase entre facturación e IPC mensual",
    ultimaGen: "2026-03-01",
    formato: "PDF / Excel",
  },
  {
    id: "rep6",
    nombre: "Auditoría de prestaciones",
    categoria: "Auditoría",
    descripcion: "Prestaciones con inconsistencias detectadas por IA",
    ultimaGen: "2026-03-07",
    formato: "PDF",
  },
  {
    id: "rep7",
    nombre: "Inventario crítico",
    categoria: "Operativo",
    descripcion: "Insumos por debajo del stock mínimo y próximos a vencer",
    ultimaGen: "2026-03-09",
    formato: "PDF / Excel",
  },
  {
    id: "rep8",
    nombre: "Indicadores clave (KPI)",
    categoria: "Ejecutivo",
    descripcion: "Resumen ejecutivo con KPIs de facturación, cobro y operación",
    ultimaGen: "2026-03-10",
    formato: "PDF",
  },
  {
    id: "rep9",
    nombre: "Agenda ocupacional",
    categoria: "Operativo",
    descripcion: "Tasa de ocupación de agenda por profesional y sede",
    ultimaGen: "2026-03-06",
    formato: "PDF / Excel",
  },
  {
    id: "rep10",
    nombre: "Ranking de financiadores",
    categoria: "Financiero",
    descripcion: "Comparativa de financiadores por cobro, demora y tasa de rechazo",
    ultimaGen: "2026-03-04",
    formato: "PDF / Excel",
  },
];

// ─── Auditoría ───────────────────────────────────────────────
export interface AuditoriaItem {
  id: string;
  fecha: string;
  paciente: string;
  prestacion: string;
  financiador: string;
  tipo: string;
  severidad: "alta" | "media" | "baja";
  detalle: string;
  estado: "pendiente" | "revisado" | "resuelto";
}

const AUDITORIA: AuditoriaItem[] = [
  {
    id: "aud1",
    fecha: "2026-03-10",
    paciente: "María García",
    prestacion: "Consulta + ECG",
    financiador: "OSDE",
    tipo: "Sobrefacturación potencial",
    severidad: "alta",
    detalle:
      "Consulta clínica y electrocardiograma facturados el mismo día. Verificar si corresponde copago doble.",
    estado: "pendiente",
  },
  {
    id: "aud2",
    fecha: "2026-03-09",
    paciente: "Roberto Sánchez",
    prestacion: "Ecografía abdominal",
    financiador: "PAMI",
    tipo: "Sin orden médica",
    severidad: "alta",
    detalle:
      "Prestación facturada sin orden médica digitalizada en el sistema. Requerida por PAMI.",
    estado: "pendiente",
  },
  {
    id: "aud3",
    fecha: "2026-03-08",
    paciente: "Valentina Pérez",
    prestacion: "RMN cerebro",
    financiador: "Swiss Medical",
    tipo: "Frecuencia inusual",
    severidad: "media",
    detalle: "Segunda RMN en 30 días para mismo paciente. Verificar justificación clínica.",
    estado: "revisado",
  },
  {
    id: "aud4",
    fecha: "2026-03-07",
    paciente: "Martín Gómez",
    prestacion: "Endoscopia",
    financiador: "Galeno",
    tipo: "Código incorrecto",
    severidad: "alta",
    detalle: "Código facturado 420920 no corresponde al procedimiento registrado en HC.",
    estado: "pendiente",
  },
  {
    id: "aud5",
    fecha: "2026-03-06",
    paciente: "Sofía Torres",
    prestacion: "Consulta cardiología",
    financiador: "PAMI",
    tipo: "Valor discrepante",
    severidad: "baja",
    detalle: "Monto facturado $12.500 vs valor nomenclador PAMI $15.500. Subfacturación detectada.",
    estado: "resuelto",
  },
  {
    id: "aud6",
    fecha: "2026-03-05",
    paciente: "Diego Rodríguez",
    prestacion: "Radiografía + Consulta",
    financiador: "Medifé",
    tipo: "Práctica no habilitada",
    severidad: "media",
    detalle: "Radiografía facturada por profesional sin habilitación para diagnóstico por imagen.",
    estado: "pendiente",
  },
  {
    id: "aud7",
    fecha: "2026-03-04",
    paciente: "Lucía Fernández",
    prestacion: "Laboratorio",
    financiador: "OSDE",
    tipo: "Determinaciones excesivas",
    severidad: "baja",
    detalle: "28 determinaciones en un solo pedido de laboratorio. Promedio clínica: 12.",
    estado: "revisado",
  },
  {
    id: "aud8",
    fecha: "2026-03-03",
    paciente: "Facundo Díaz",
    prestacion: "Hemograma",
    financiador: "OSDE",
    tipo: "Duplicación",
    severidad: "media",
    detalle: "Hemograma ya realizado el 28/02. Posible duplicación de facturación.",
    estado: "pendiente",
  },
];

// ─── KPI builders ────────────────────────────────────────────
export function getDashboardKPIs(): KPI[] {
  return [
    { label: "Facturado (mar)", value: "$9.4M", change: "+8.2%", up: true, color: "celeste" },
    { label: "Cobrado (mar)", value: "$7.8M", change: "+5.1%", up: true, color: "celeste" },
    { label: "Rechazos", value: "4.7%", change: "-1.2pp", up: false, color: "gold" },
    { label: "Días promedio cobro", value: "38", change: "-3 días", up: false, color: "celeste" },
  ];
}

export function getFacturacionKPIs(): KPI[] {
  return [
    { label: "Facturado (mar)", value: "$9.4M", change: "+8.2%", up: true, color: "celeste" },
    { label: "Cobrado", value: "$7.8M", change: "+5.1%", up: true, color: "celeste" },
    { label: "Pendiente", value: "$1.2M", change: "116 facturas", up: false, color: "gold" },
    { label: "Tasa de cobro", value: "83.7%", change: "+2.1pp", up: true, color: "celeste" },
  ];
}

export function getRechazosKPIs(): KPI[] {
  return [
    { label: "Rechazos (mar)", value: "48", change: "-12 vs feb", up: false, color: "gold" },
    { label: "Monto rechazado", value: "$293.5K", change: "-18%", up: false, color: "gold" },
    { label: "Tasa rechazo", value: "4.7%", change: "-1.2pp", up: false, color: "celeste" },
    { label: "Reprocesados", value: "31", change: "64.5%", up: true, color: "celeste" },
  ];
}

export function getPacientesKPIs(): KPI[] {
  return [
    {
      label: "Total pacientes",
      value: "1.247",
      change: "+23 este mes",
      up: true,
      color: "celeste",
    },
    { label: "Activos", value: "1.189", change: "95.3%", up: true, color: "celeste" },
    { label: "Nuevos (mar)", value: "23", change: "+15%", up: true, color: "celeste" },
    { label: "Financiadores", value: "7", change: "activos", up: true, color: "gold" },
  ];
}

export function getAgendaKPIs(): KPI[] {
  return [
    { label: "Turnos hoy", value: "16", change: "3 disponibles", up: true, color: "celeste" },
    { label: "Atendidos", value: "3", change: "18.7%", up: true, color: "celeste" },
    { label: "Cancelados", value: "1", change: "6.2%", up: false, color: "gold" },
    { label: "Ocupación", value: "81%", change: "+5pp vs ayer", up: true, color: "celeste" },
  ];
}

export function getInventarioKPIs(): KPI[] {
  return [
    { label: "Total ítems", value: "12", change: "categorías: 5", up: true, color: "celeste" },
    { label: "Stock bajo", value: "2", change: "requieren atención", up: false, color: "gold" },
    { label: "Próx. vencimiento", value: "3", change: "< 6 meses", up: false, color: "gold" },
    { label: "Valor total", value: "$485K", change: "+3.2%", up: true, color: "celeste" },
  ];
}

// ─── Service functions ───────────────────────────────────────
// When Supabase is configured, delegate to real queries.
// Otherwise, return mock data for development/demo.

export async function getPacientes(): Promise<Paciente[]> {
  if (isSupabaseConfigured()) {
    const { fetchPacientes } = await import("@/lib/services/supabase-queries");
    return fetchPacientes();
  }
  await delay(SIM_DELAY);
  return [...PACIENTES];
}

export async function getPaciente(id: string): Promise<Paciente | null> {
  if (isSupabaseConfigured()) {
    const { fetchPaciente } = await import("@/lib/services/supabase-queries");
    return fetchPaciente(id);
  }
  await delay(SIM_DELAY);
  return PACIENTES.find((p) => p.id === id) ?? null;
}

export async function getFacturas(): Promise<Factura[]> {
  if (isSupabaseConfigured()) {
    const { fetchFacturas } = await import("@/lib/services/supabase-queries");
    return fetchFacturas();
  }
  await delay(SIM_DELAY);
  return [...FACTURAS];
}

export async function getRechazos(): Promise<Rechazo[]> {
  if (isSupabaseConfigured()) {
    const { fetchRechazos } = await import("@/lib/services/supabase-queries");
    return fetchRechazos();
  }
  await delay(SIM_DELAY);
  return [...RECHAZOS];
}

export async function getFinanciadores(): Promise<Financiador[]> {
  if (isSupabaseConfigured()) {
    const { fetchFinanciadores } = await import("@/lib/services/supabase-queries");
    return fetchFinanciadores();
  }
  await delay(SIM_DELAY);
  return [...FINANCIADORES];
}

export async function getInflacion(): Promise<InflacionMes[]> {
  if (isSupabaseConfigured()) {
    const { fetchInflacion } = await import("@/lib/services/supabase-queries");
    return fetchInflacion();
  }
  await delay(SIM_DELAY);
  return [...INFLACION];
}

export async function getAlertas(): Promise<Alerta[]> {
  if (isSupabaseConfigured()) {
    const { fetchAlertas } = await import("@/lib/services/supabase-queries");
    return fetchAlertas();
  }
  await delay(SIM_DELAY);
  return [...ALERTAS];
}

export async function getTurnos(): Promise<Turno[]> {
  if (isSupabaseConfigured()) {
    const { fetchTurnos } = await import("@/lib/services/supabase-queries");
    return fetchTurnos();
  }
  await delay(SIM_DELAY);
  return [...TURNOS];
}

export async function getInventario(): Promise<InventarioItem[]> {
  if (isSupabaseConfigured()) {
    const { fetchInventario } = await import("@/lib/services/supabase-queries");
    return fetchInventario();
  }
  await delay(SIM_DELAY);
  return [...INVENTARIO];
}

export async function getNomenclador(): Promise<NomencladorEntry[]> {
  if (isSupabaseConfigured()) {
    const { fetchNomenclador } = await import("@/lib/services/supabase-queries");
    return fetchNomenclador();
  }
  await delay(SIM_DELAY);
  return [...NOMENCLADOR];
}

export async function getReportes(): Promise<Reporte[]> {
  if (isSupabaseConfigured()) {
    const { fetchReportes } = await import("@/lib/services/supabase-queries");
    return fetchReportes();
  }
  await delay(SIM_DELAY);
  return [...REPORTES];
}

export async function getAuditoria(): Promise<AuditoriaItem[]> {
  if (isSupabaseConfigured()) {
    const { fetchAuditoria } = await import("@/lib/services/supabase-queries");
    return fetchAuditoria();
  }
  await delay(SIM_DELAY);
  return [...AUDITORIA];
}

// ─── Red de Interconsultas Service ───────────────────────────
// Manages the physician referral network, interconsulta requests,
// and study orders between networked professionals.

import { isSupabaseConfigured } from "@/lib/env";
import { delay } from "@/lib/utils";

/** Tables network_doctors, interconsultas, solicitudes_estudio are not in
 *  generated Supabase types yet. Use untyped client for these queries. */
async function untypedClient() {
  const { createClient } = await import("@/lib/supabase/client");
  // eslint-disable-next-line
  return createClient() as any;
}

// ─── Types ───────────────────────────────────────────────────

export interface NetworkDoctor {
  id: string;
  nombre: string;
  especialidad: string;
  institucion: string;
  telefono: string;
  email: string;
  matricula: string;
  disponibilidad: "disponible" | "limitada" | "no_disponible";
  avatar?: string;
  /** Turnaround time for interconsultas in days */
  turnaroundDays?: number;
}

export type InterconsultaEstado =
  | "pendiente"
  | "aceptada"
  | "en_curso"
  | "completada"
  | "rechazada"
  | "cancelada";

export type InterconsultaPrioridad = "urgente" | "alta" | "normal" | "baja";

export interface Interconsulta {
  id: string;
  paciente: string;
  pacienteId?: string;
  doctorOrigen: string;
  doctorDestino: string;
  doctorDestinoId: string;
  especialidad: string;
  motivo: string;
  prioridad: InterconsultaPrioridad;
  estado: InterconsultaEstado;
  fecha: string; // YYYY-MM-DD
  notas?: string;
  adjuntos?: string[];
  respuesta?: string;
}

export type EstudioTipo =
  | "laboratorio"
  | "imagen"
  | "ecografia"
  | "electrocardiograma"
  | "endoscopia"
  | "otro";

export type EstudioEstado = "solicitado" | "en_proceso" | "completado" | "cancelado";

export interface SolicitudEstudio {
  id: string;
  paciente: string;
  pacienteId?: string;
  doctorSolicitante: string;
  centroDestino: string;
  centroDestinoId?: string;
  tipo: EstudioTipo;
  estudio: string;
  indicacion: string;
  prioridad: InterconsultaPrioridad;
  estado: EstudioEstado;
  fecha: string;
  resultadoUrl?: string;
}

export interface CreateInterconsultaInput {
  paciente: string;
  pacienteId?: string;
  doctorDestinoId: string;
  especialidad: string;
  motivo: string;
  prioridad: InterconsultaPrioridad;
  notas?: string;
}

export interface CreateEstudioInput {
  paciente: string;
  pacienteId?: string;
  centroDestinoId?: string;
  centroDestino: string;
  tipo: EstudioTipo;
  estudio: string;
  indicacion: string;
  prioridad: InterconsultaPrioridad;
}

// ─── Network Directory ───────────────────────────────────────

export async function getNetworkDoctors(especialidad?: string): Promise<NetworkDoctor[]> {
  if (isSupabaseConfigured()) {
    const sb = await untypedClient();

    let query = sb.from("network_doctors").select("*").order("especialidad").order("nombre");

    if (especialidad && especialidad !== "Todas") {
      query = query.eq("especialidad", especialidad);
    }

    const { data } = await query;
    return (data ?? []) as NetworkDoctor[];
  }

  await delay(150);
  let docs = DEMO_DOCTORS;
  if (especialidad && especialidad !== "Todas") {
    docs = docs.filter((d) => d.especialidad === especialidad);
  }
  return docs;
}

export async function getNetworkSpecialties(): Promise<string[]> {
  const docs = await getNetworkDoctors();
  const set = new Set(docs.map((d) => d.especialidad));
  return ["Todas", ...Array.from(set).sort()];
}

// ─── Interconsultas CRUD ─────────────────────────────────────

export async function getInterconsultas(): Promise<Interconsulta[]> {
  if (isSupabaseConfigured()) {
    const sb = await untypedClient();
    const { data } = await sb
      .from("interconsultas")
      .select("*")
      .order("fecha", { ascending: false });
    return (data ?? []) as Interconsulta[];
  }

  await delay(150);
  return DEMO_INTERCONSULTAS;
}

export async function createInterconsulta(
  input: CreateInterconsultaInput,
): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured()) {
    const sb = await untypedClient();
    const {
      data: { user },
    } = await sb.auth.getUser();

    const { error } = await sb.from("interconsultas").insert({
      paciente: input.paciente,
      paciente_id: input.pacienteId,
      doctor_origen: user?.user_metadata?.full_name ?? "Dr. Demo",
      doctor_destino_id: input.doctorDestinoId,
      especialidad: input.especialidad,
      motivo: input.motivo,
      prioridad: input.prioridad,
      estado: "pendiente",
      notas: input.notas ?? null,
      fecha: new Date().toISOString().slice(0, 10),
    });

    if (error) return { success: false, error: error.message };
    return { success: true };
  }

  await delay(300);
  return { success: true };
}

export async function updateInterconsultaEstado(
  id: string,
  estado: InterconsultaEstado,
  respuesta?: string,
): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured()) {
    const sb = await untypedClient();
    const updates: Record<string, unknown> = { estado };
    if (respuesta) updates.respuesta = respuesta;
    const { error } = await sb.from("interconsultas").update(updates).eq("id", id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  }

  await delay(200);
  return { success: true };
}

// ─── Solicitud de Estudios CRUD ──────────────────────────────

export async function getSolicitudesEstudio(): Promise<SolicitudEstudio[]> {
  if (isSupabaseConfigured()) {
    const sb = await untypedClient();
    const { data } = await sb
      .from("solicitudes_estudio")
      .select("*")
      .order("fecha", { ascending: false });
    return (data ?? []) as SolicitudEstudio[];
  }

  await delay(150);
  return DEMO_ESTUDIOS;
}

export async function createSolicitudEstudio(
  input: CreateEstudioInput,
): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured()) {
    const sb = await untypedClient();
    const {
      data: { user },
    } = await sb.auth.getUser();

    const { error } = await sb.from("solicitudes_estudio").insert({
      paciente: input.paciente,
      paciente_id: input.pacienteId,
      doctor_solicitante: user?.user_metadata?.full_name ?? "Dr. Demo",
      centro_destino: input.centroDestino,
      centro_destino_id: input.centroDestinoId,
      tipo: input.tipo,
      estudio: input.estudio,
      indicacion: input.indicacion,
      prioridad: input.prioridad,
      estado: "solicitado",
      fecha: new Date().toISOString().slice(0, 10),
    });

    if (error) return { success: false, error: error.message };
    return { success: true };
  }

  await delay(300);
  return { success: true };
}

// ─── Stats ───────────────────────────────────────────────────

export interface InterconsultaStats {
  totalDoctors: number;
  specialties: number;
  pendientes: number;
  completadas: number;
  estudiosEnCurso: number;
}

export async function getInterconsultaStats(): Promise<InterconsultaStats> {
  const [docs, ics, estudios] = await Promise.all([
    getNetworkDoctors(),
    getInterconsultas(),
    getSolicitudesEstudio(),
  ]);

  const specialties = new Set(docs.map((d) => d.especialidad)).size;

  return {
    totalDoctors: docs.length,
    specialties,
    pendientes: ics.filter(
      (i) => i.estado === "pendiente" || i.estado === "aceptada" || i.estado === "en_curso",
    ).length,
    completadas: ics.filter((i) => i.estado === "completada").length,
    estudiosEnCurso: estudios.filter((e) => e.estado === "solicitado" || e.estado === "en_proceso")
      .length,
  };
}

// ─── Demo Data ───────────────────────────────────────────────

const DEMO_DOCTORS: NetworkDoctor[] = [
  {
    id: "net-1",
    nombre: "Dra. María Belén Torres",
    especialidad: "Cardiología",
    institucion: "Hospital Italiano",
    telefono: "+54 11 4959-0200",
    email: "mbtorres@hospitalitaliano.org.ar",
    matricula: "MN 89.432",
    disponibilidad: "disponible",
    turnaroundDays: 3,
  },
  {
    id: "net-2",
    nombre: "Dr. Hernán Agüero",
    especialidad: "Traumatología",
    institucion: "Sanatorio Güemes",
    telefono: "+54 11 4952-7070",
    email: "haguero@guemes.com.ar",
    matricula: "MN 76.221",
    disponibilidad: "disponible",
    turnaroundDays: 2,
  },
  {
    id: "net-3",
    nombre: "Dra. Cecilia Morán",
    especialidad: "Dermatología",
    institucion: "CEMIC",
    telefono: "+54 11 5299-0100",
    email: "cmoran@cemic.edu.ar",
    matricula: "MN 92.108",
    disponibilidad: "limitada",
    turnaroundDays: 5,
  },
  {
    id: "net-4",
    nombre: "Dr. Pablo Santillán",
    especialidad: "Gastroenterología",
    institucion: "Fundación Favaloro",
    telefono: "+54 11 4378-1200",
    email: "psantillan@favaloro.org",
    matricula: "MN 81.557",
    disponibilidad: "disponible",
    turnaroundDays: 4,
  },
  {
    id: "net-5",
    nombre: "Dra. Julieta Romero",
    especialidad: "Neurología",
    institucion: "Fleni",
    telefono: "+54 11 5777-3200",
    email: "jromero@fleni.org.ar",
    matricula: "MN 95.340",
    disponibilidad: "disponible",
    turnaroundDays: 3,
  },
  {
    id: "net-6",
    nombre: "Dr. Gustavo Leiva",
    especialidad: "Oftalmología",
    institucion: "Instituto Zaldivar",
    telefono: "+54 11 5238-8400",
    email: "gleiva@zaldivar.com.ar",
    matricula: "MN 88.012",
    disponibilidad: "disponible",
    turnaroundDays: 2,
  },
  {
    id: "net-7",
    nombre: "Dra. Florencia Paz",
    especialidad: "Endocrinología",
    institucion: "Hospital Austral",
    telefono: "+54 11 2304-6000",
    email: "fpaz@cas.austral.edu.ar",
    matricula: "MN 97.455",
    disponibilidad: "disponible",
    turnaroundDays: 4,
  },
  {
    id: "net-8",
    nombre: "Dr. Martín Quiroga",
    especialidad: "Urología",
    institucion: "Hospital Británico",
    telefono: "+54 11 4309-6400",
    email: "mquiroga@hbritanico.com.ar",
    matricula: "MN 83.776",
    disponibilidad: "limitada",
    turnaroundDays: 5,
  },
  {
    id: "net-9",
    nombre: "Dra. Soledad Vega",
    especialidad: "Ginecología",
    institucion: "Sanatorio Finochietto",
    telefono: "+54 11 4000-0100",
    email: "svega@finochietto.com",
    matricula: "MN 91.230",
    disponibilidad: "disponible",
    turnaroundDays: 2,
  },
  {
    id: "net-10",
    nombre: "Dr. Ricardo Díaz",
    especialidad: "Neumología",
    institucion: "Hospital Muñiz",
    telefono: "+54 11 4305-4600",
    email: "rdiaz@muniz.gob.ar",
    matricula: "MN 74.889",
    disponibilidad: "no_disponible",
    turnaroundDays: 7,
  },
  {
    id: "net-11",
    nombre: "Dra. Laura Chen",
    especialidad: "Cardiología",
    institucion: "Sanatorio de la Trinidad",
    telefono: "+54 11 4827-7000",
    email: "lchen@trinidad.com.ar",
    matricula: "MN 96.112",
    disponibilidad: "disponible",
    turnaroundDays: 2,
  },
  {
    id: "net-12",
    nombre: "Dr. Federico Alonso",
    especialidad: "Laboratorio",
    institucion: "Laboratorio Stamboulian",
    telefono: "+54 11 5032-3200",
    email: "falonso@stamboulian.com.ar",
    matricula: "MN 85.667",
    disponibilidad: "disponible",
    turnaroundDays: 1,
  },
  {
    id: "net-13",
    nombre: "Dra. Natalia Peralta",
    especialidad: "Diagnóstico por Imágenes",
    institucion: "DIM Centros de Diagnóstico",
    telefono: "+54 11 4325-9000",
    email: "nperalta@dim.com.ar",
    matricula: "MN 90.443",
    disponibilidad: "disponible",
    turnaroundDays: 1,
  },
];

const DEMO_INTERCONSULTAS: Interconsulta[] = [
  {
    id: "ic-1",
    paciente: "María García",
    doctorOrigen: "Dr. Martín Rodríguez",
    doctorDestino: "Dra. María Belén Torres",
    doctorDestinoId: "net-1",
    especialidad: "Cardiología",
    motivo: "Soplo cardíaco de nueva aparición. Solicito ecocardiograma y evaluación.",
    prioridad: "alta",
    estado: "aceptada",
    fecha: "2026-03-14",
    notas: "Paciente hipertensa, bajo tratamiento con Losartán 50mg.",
  },
  {
    id: "ic-2",
    paciente: "Carlos López",
    doctorOrigen: "Dr. Martín Rodríguez",
    doctorDestino: "Dr. Hernán Agüero",
    doctorDestinoId: "net-2",
    especialidad: "Traumatología",
    motivo: "Dolor persistente en rodilla derecha post caída. RX sin fractura visible.",
    prioridad: "normal",
    estado: "pendiente",
    fecha: "2026-03-15",
  },
  {
    id: "ic-3",
    paciente: "Ana Fernández",
    doctorOrigen: "Dra. Laura Pérez",
    doctorDestino: "Dra. Julieta Romero",
    doctorDestinoId: "net-5",
    especialidad: "Neurología",
    motivo: "Cefalea crónica refractaria a tratamiento. Solicito evaluación neurológica.",
    prioridad: "urgente",
    estado: "en_curso",
    fecha: "2026-03-12",
    respuesta: "Paciente evaluada. Solicito RMN de cerebro y potenciales evocados.",
  },
  {
    id: "ic-4",
    paciente: "Jorge Ramírez",
    doctorOrigen: "Dra. Laura Pérez",
    doctorDestino: "Dr. Pablo Santillán",
    doctorDestinoId: "net-4",
    especialidad: "Gastroenterología",
    motivo: "Dispepsia funcional + antecedentes familiares Ca gástrico. Solicito VEDA.",
    prioridad: "alta",
    estado: "completada",
    fecha: "2026-03-08",
    respuesta:
      "VEDA realizada: gastritis erosiva leve. Sin lesiones sospechosas. Control en 12 meses.",
  },
  {
    id: "ic-5",
    paciente: "Lucía Méndez",
    doctorOrigen: "Dr. Martín Rodríguez",
    doctorDestino: "Dra. Cecilia Morán",
    doctorDestinoId: "net-3",
    especialidad: "Dermatología",
    motivo: "Lesión pigmentada en dorso con cambios recientes. Solicito dermatoscopía.",
    prioridad: "alta",
    estado: "pendiente",
    fecha: "2026-03-16",
  },
];

const DEMO_ESTUDIOS: SolicitudEstudio[] = [
  {
    id: "est-1",
    paciente: "María García",
    doctorSolicitante: "Dr. Martín Rodríguez",
    centroDestino: "Laboratorio Stamboulian",
    centroDestinoId: "net-12",
    tipo: "laboratorio",
    estudio: "Hemograma completo + Perfil lipídico + HbA1c",
    indicacion: "Control metabólico. Paciente diabética tipo 2.",
    prioridad: "normal",
    estado: "completado",
    fecha: "2026-03-10",
  },
  {
    id: "est-2",
    paciente: "Carlos López",
    doctorSolicitante: "Dr. Martín Rodríguez",
    centroDestino: "DIM Centros de Diagnóstico",
    centroDestinoId: "net-13",
    tipo: "imagen",
    estudio: "RMN de rodilla derecha con contraste",
    indicacion: "Dolor persistente post traumático. Descartar lesión meniscal.",
    prioridad: "alta",
    estado: "en_proceso",
    fecha: "2026-03-15",
  },
  {
    id: "est-3",
    paciente: "Ana Fernández",
    doctorSolicitante: "Dra. Julieta Romero",
    centroDestino: "DIM Centros de Diagnóstico",
    centroDestinoId: "net-13",
    tipo: "imagen",
    estudio: "RMN de cerebro sin contraste",
    indicacion: "Cefalea crónica. Descartar patología estructural.",
    prioridad: "urgente",
    estado: "solicitado",
    fecha: "2026-03-16",
  },
  {
    id: "est-4",
    paciente: "Jorge Ramírez",
    doctorSolicitante: "Dr. Pablo Santillán",
    centroDestino: "Laboratorio Stamboulian",
    centroDestinoId: "net-12",
    tipo: "laboratorio",
    estudio: "Anti-H. pylori IgG + Calprotectina fecal",
    indicacion: "Post VEDA con gastritis erosiva. Descartar infección H. pylori.",
    prioridad: "normal",
    estado: "solicitado",
    fecha: "2026-03-16",
  },
];

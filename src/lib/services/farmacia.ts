// ─── Farmacia Service Layer ──────────────────────────────────
// Real Supabase queries with mock fallback when not configured.

import { isSupabaseConfigured } from "@/lib/env";
import type { Medication, Prescription, Delivery, RecurringOrder } from "@/lib/types";

// ─── Mock Data ───────────────────────────────────────────────

const mockMedications: Medication[] = [
  {
    id: "1",
    name: "Losartán 50mg",
    lab: "Roemmers",
    category: "Antihipertensivo",
    price: 12400,
    pamiCoverage: 80,
    osCoverage: 70,
    prepagaCoverage: 60,
    stock: "Disponible",
    requiresPrescription: true,
  },
  {
    id: "2",
    name: "Metformina 850mg",
    lab: "Bago",
    category: "Antidiabético",
    price: 8900,
    pamiCoverage: 100,
    osCoverage: 80,
    prepagaCoverage: 70,
    stock: "Disponible",
    requiresPrescription: true,
  },
  {
    id: "3",
    name: "Omeprazol 20mg",
    lab: "Elea",
    category: "Protector gástrico",
    price: 6200,
    pamiCoverage: 70,
    osCoverage: 50,
    prepagaCoverage: 40,
    stock: "Últimas unidades",
    requiresPrescription: true,
  },
  {
    id: "4",
    name: "Enalapril 10mg",
    lab: "Bernabó",
    category: "Antihipertensivo",
    price: 9800,
    pamiCoverage: 80,
    osCoverage: 70,
    prepagaCoverage: 55,
    stock: "Disponible",
    requiresPrescription: true,
  },
  {
    id: "5",
    name: "Ibuprofeno 400mg",
    lab: "Raffo",
    category: "Antiinflamatorio",
    price: 3100,
    pamiCoverage: 50,
    osCoverage: 40,
    prepagaCoverage: 30,
    stock: "Disponible",
    requiresPrescription: false,
  },
  {
    id: "6",
    name: "Levotiroxina 100mcg",
    lab: "Montpellier",
    category: "Tiroides",
    price: 7500,
    pamiCoverage: 80,
    osCoverage: 70,
    prepagaCoverage: 60,
    stock: "Disponible",
    requiresPrescription: true,
  },
  {
    id: "7",
    name: "Atorvastatina 20mg",
    lab: "Gador",
    category: "Hipolipemiante",
    price: 11200,
    pamiCoverage: 70,
    osCoverage: 60,
    prepagaCoverage: 50,
    stock: "Sin stock",
    requiresPrescription: true,
  },
  {
    id: "8",
    name: "Amlodipina 5mg",
    lab: "Roemmers",
    category: "Antihipertensivo",
    price: 8100,
    pamiCoverage: 80,
    osCoverage: 65,
    prepagaCoverage: 50,
    stock: "Disponible",
    requiresPrescription: true,
  },
];

const mockPrescriptions: Prescription[] = [
  {
    id: "1",
    code: "RX-2026-0891",
    patientName: "Carlos Méndez",
    doctorName: "Dra. Fernández",
    date: "10/03/2026",
    items: ["Losartán 50mg x30", "Enalapril 10mg x30"],
    status: "Pendiente",
    financiador: "PAMI",
  },
  {
    id: "2",
    code: "RX-2026-0890",
    patientName: "Marta Gutiérrez",
    doctorName: "Dr. López",
    date: "09/03/2026",
    items: ["Metformina 850mg x60", "Levotiroxina 100mcg x30"],
    status: "En carrito",
    financiador: "OSDE",
  },
  {
    id: "3",
    code: "RX-2026-0888",
    patientName: "Jorge Ramírez",
    doctorName: "Dra. Sánchez",
    date: "08/03/2026",
    items: ["Atorvastatina 20mg x30"],
    status: "Entregado",
    financiador: "Swiss Medical",
  },
];

const mockDeliveries: Delivery[] = [
  {
    id: "1",
    code: "DEL-4521",
    patientName: "Ana Rodríguez",
    address: "Av. Corrientes 3200, CABA",
    itemCount: 3,
    status: "En camino",
    eta: "14:30",
    courier: "Rappi Farma",
    progress: 65,
  },
  {
    id: "2",
    code: "DEL-4520",
    patientName: "Pedro Silva",
    address: "Calle 48 #720, La Plata",
    itemCount: 2,
    status: "Preparando",
    eta: "16:00",
    courier: "PedidosYa",
    progress: 25,
  },
  {
    id: "3",
    code: "DEL-4519",
    patientName: "Lucía Torres",
    address: "San Martín 1450, Rosario",
    itemCount: 1,
    status: "Entregado",
    eta: "-",
    courier: "Rappi Farma",
    progress: 100,
  },
];

const mockRecurringOrders: RecurringOrder[] = [
  {
    id: "1",
    code: "REC-091",
    patientName: "María García",
    medications: ["Losartán 50mg", "Metformina 850mg"],
    frequency: "Mensual",
    nextDelivery: "15/03/2026",
    financiador: "PAMI",
    status: "Activo",
  },
  {
    id: "2",
    code: "REC-088",
    patientName: "Roberto Díaz",
    medications: ["Levotiroxina 100mcg"],
    frequency: "Mensual",
    nextDelivery: "18/03/2026",
    financiador: "IOMA",
    status: "Activo",
  },
  {
    id: "3",
    code: "REC-085",
    patientName: "Susana Flores",
    medications: ["Enalapril 10mg", "Amlodipina 5mg", "Atorvastatina 20mg"],
    frequency: "Mensual",
    nextDelivery: "20/03/2026",
    financiador: "OSDE",
    status: "Pausado",
  },
];

// ─── Service Functions ───────────────────────────────────────

async function getSupabase() {
  const { createClient } = await import("@/lib/supabase/client");
  return createClient();
}

export async function getMedications(): Promise<Medication[]> {
  if (!isSupabaseConfigured()) return mockMedications;
  try {
    const sb = await getSupabase();
    const { data, error } = await sb
      .from("medications")
      .select("*")
      .eq("active", true)
      .order("name");
    if (error) throw error;
    return (data || []).map((r) => ({
      id: r.id,
      name: r.name,
      lab: r.lab,
      category: r.category,
      price: r.price,
      pamiCoverage: r.pami_coverage,
      osCoverage: r.os_coverage,
      prepagaCoverage: r.prepaga_coverage,
      stock: r.stock as Medication["stock"],
      requiresPrescription: r.requires_prescription,
    })) as Medication[];
  } catch {
    return mockMedications;
  }
}

export async function getPrescriptions(): Promise<Prescription[]> {
  if (!isSupabaseConfigured()) return mockPrescriptions;
  try {
    const sb = await getSupabase();
    const { data, error } = await sb
      .from("prescriptions")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []).map((r) => ({
      id: r.id,
      code: r.code,
      patientName: r.patient_name,
      doctorName: r.doctor_name,
      date: r.date,
      items: (r.items || []) as string[],
      status: r.status as Prescription["status"],
      financiador: r.financiador,
    })) as Prescription[];
  } catch {
    return mockPrescriptions;
  }
}

export async function getDeliveries(): Promise<Delivery[]> {
  if (!isSupabaseConfigured()) return mockDeliveries;
  try {
    const sb = await getSupabase();
    const { data, error } = await sb
      .from("deliveries")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []).map((r) => ({
      id: r.id,
      code: r.code,
      patientName: r.patient_name,
      address: r.address,
      itemCount: r.item_count,
      status: r.status as Delivery["status"],
      eta: r.eta || "-",
      courier: r.courier,
      progress: r.progress,
    }));
  } catch {
    return mockDeliveries;
  }
}

export async function getRecurringOrders(): Promise<RecurringOrder[]> {
  if (!isSupabaseConfigured()) return mockRecurringOrders;
  try {
    const sb = await getSupabase();
    const { data, error } = await sb.from("recurring_orders").select("*").order("next_delivery");
    if (error) throw error;
    return (data || []).map((r) => ({
      id: r.id,
      code: r.code,
      patientName: r.patient_name,
      medications: (r.medications || []) as string[],
      frequency: r.frequency,
      nextDelivery: r.next_delivery,
      financiador: r.financiador,
      status: r.status as RecurringOrder["status"],
    }));
  } catch {
    return mockRecurringOrders;
  }
}

export async function createPrescription(data: {
  patientName: string;
  doctorName: string;
  items: string[];
  financiador: string;
}): Promise<Prescription | null> {
  if (!isSupabaseConfigured()) return null;
  const sb = await getSupabase();
  // Q-01: Use crypto for unique ID instead of Math.random()
  const code = `RX-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  const { data: row, error } = await sb
    .from("prescriptions")
    .insert({
      code,
      patient_name: data.patientName,
      doctor_name: data.doctorName,
      items: data.items,
      financiador: data.financiador,
      status: "Pendiente",
    })
    .select()
    .single();
  if (error) throw error;
  return {
    id: row.id,
    code: row.code,
    patientName: row.patient_name,
    doctorName: row.doctor_name,
    date: row.date,
    items: (row.items || []) as string[],
    status: row.status as Prescription["status"],
    financiador: row.financiador,
  };
}

export async function updateDeliveryStatus(
  id: string,
  status: string,
  progress: number,
): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const sb = await getSupabase();
  await sb
    .from("deliveries")
    .update({ status, progress, updated_at: new Date().toISOString() })
    .eq("id", id);
}

// ─── KPI Helpers ─────────────────────────────────────────────

export async function getFarmaciaKPIs() {
  const [prescriptions, deliveries, recurring] = await Promise.all([
    getPrescriptions(),
    getDeliveries(),
    getRecurringOrders(),
  ]);
  return {
    ordersToday: deliveries.length + prescriptions.filter((p) => p.status === "Entregado").length,
    inTransit: deliveries.filter((d) => d.status === "En camino").length,
    pendingRx: prescriptions.filter((p) => p.status === "Pendiente").length,
    activeRecurring: recurring.filter((r) => r.status === "Activo").length,
  };
}

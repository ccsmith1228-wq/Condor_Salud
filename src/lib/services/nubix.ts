// ─── Nubix Service Layer ─────────────────────────────────────
// Real Nubix API calls with mock fallback when not configured.
// Follows the same pattern as farmacia.ts, telemedicina.ts, etc.

import {
  isNubixConfigured,
  nubixGet,
  nubixPost,
  nubixPut,
  nubixGetPaginated,
} from "@/lib/nubix/client";
import type {
  NubixStudy,
  NubixReport,
  NubixDelivery,
  NubixAppointment,
  NubixViewerConfig,
  NubixKPIs,
  NubixStudyFilters,
  NubixAppointmentFilters,
  NubixPaginatedResponse,
} from "@/lib/nubix/types";

// ─── Mock Data ───────────────────────────────────────────────

const mockStudies: NubixStudy[] = [
  {
    id: "ns-001",
    accessionNumber: "ACC-2026-0451",
    patientId: "p-101",
    patientName: "Carlos Méndez",
    patientDni: "28.456.789",
    modality: "CR",
    specialty: "radiologia",
    description: "Radiografía de tórax frente y perfil",
    bodyPart: "Tórax",
    studyDate: "2026-03-15T09:30:00Z",
    status: "reported",
    instanceCount: 2,
    seriesCount: 1,
    referringDoctor: "Dr. Roberto Guzmán",
    reportingDoctor: "Dra. Lucía Paredes",
    reportStatus: "signed",
    financiador: "OSDE",
    viewerUrl: "https://app.nubix.cloud/viewer/ns-001",
    thumbnailUrl: "https://app.nubix.cloud/thumb/ns-001.jpg",
    createdAt: "2026-03-15T09:30:00Z",
    updatedAt: "2026-03-15T11:45:00Z",
  },
  {
    id: "ns-002",
    accessionNumber: "ACC-2026-0452",
    patientId: "p-102",
    patientName: "Elena Martínez",
    patientDni: "32.123.456",
    modality: "US",
    specialty: "obstetricia",
    description: "Ecografía obstétrica — 20 semanas",
    bodyPart: "Abdomen",
    studyDate: "2026-03-15T10:00:00Z",
    status: "completed",
    instanceCount: 45,
    seriesCount: 3,
    referringDoctor: "Dra. Ana Fernández",
    reportingDoctor: null,
    reportStatus: "pending",
    financiador: "Swiss Medical",
    viewerUrl: "https://app.nubix.cloud/viewer/ns-002",
    thumbnailUrl: "https://app.nubix.cloud/thumb/ns-002.jpg",
    createdAt: "2026-03-15T10:00:00Z",
    updatedAt: "2026-03-15T10:35:00Z",
  },
  {
    id: "ns-003",
    accessionNumber: "ACC-2026-0453",
    patientId: "p-103",
    patientName: "Jorge Álvarez",
    patientDni: "22.789.012",
    modality: "CT",
    specialty: "radiologia",
    description: "TC de abdomen con contraste",
    bodyPart: "Abdomen",
    studyDate: "2026-03-15T11:15:00Z",
    status: "in_progress",
    instanceCount: 0,
    seriesCount: 0,
    referringDoctor: "Dr. Martín Suárez",
    reportingDoctor: null,
    reportStatus: "pending",
    financiador: "PAMI",
    viewerUrl: "https://app.nubix.cloud/viewer/ns-003",
    thumbnailUrl: null,
    createdAt: "2026-03-15T11:15:00Z",
    updatedAt: "2026-03-15T11:15:00Z",
  },
  {
    id: "ns-004",
    accessionNumber: "ACC-2026-0454",
    patientId: "p-104",
    patientName: "María González",
    patientDni: "35.456.123",
    modality: "MG",
    specialty: "radiologia",
    description: "Mamografía bilateral",
    bodyPart: "Mama",
    studyDate: "2026-03-14T14:00:00Z",
    status: "delivered",
    instanceCount: 4,
    seriesCount: 2,
    referringDoctor: "Dra. Carla Vega",
    reportingDoctor: "Dra. Lucía Paredes",
    reportStatus: "signed",
    financiador: "Galeno",
    viewerUrl: "https://app.nubix.cloud/viewer/ns-004",
    thumbnailUrl: "https://app.nubix.cloud/thumb/ns-004.jpg",
    createdAt: "2026-03-14T14:00:00Z",
    updatedAt: "2026-03-14T17:30:00Z",
  },
  {
    id: "ns-005",
    accessionNumber: "ACC-2026-0455",
    patientId: "p-105",
    patientName: "Raúl Gómez",
    patientDni: "19.234.567",
    modality: "ECG",
    specialty: "cardiologia",
    description: "Electrocardiograma de 12 derivaciones",
    bodyPart: "Corazón",
    studyDate: "2026-03-15T08:00:00Z",
    status: "reported",
    instanceCount: 1,
    seriesCount: 1,
    referringDoctor: "Dr. Pablo Ruiz",
    reportingDoctor: "Dr. Hernán Cárdenas",
    reportStatus: "signed",
    financiador: "PAMI",
    viewerUrl: "https://app.nubix.cloud/viewer/ns-005",
    thumbnailUrl: "https://app.nubix.cloud/thumb/ns-005.jpg",
    createdAt: "2026-03-15T08:00:00Z",
    updatedAt: "2026-03-15T09:00:00Z",
  },
  {
    id: "ns-006",
    accessionNumber: "ACC-2026-0456",
    patientId: "p-106",
    patientName: "Carolina López",
    patientDni: "37.890.123",
    modality: "IO",
    specialty: "dental",
    description: "Radiografía periapical — pieza 36",
    bodyPart: "Mandíbula",
    studyDate: "2026-03-15T12:30:00Z",
    status: "scheduled",
    instanceCount: 0,
    seriesCount: 0,
    referringDoctor: "Dr. Tomás Ríos",
    reportingDoctor: null,
    reportStatus: "pending",
    financiador: "OSDE",
    viewerUrl: "https://app.nubix.cloud/viewer/ns-006",
    thumbnailUrl: null,
    createdAt: "2026-03-15T12:30:00Z",
    updatedAt: "2026-03-15T12:30:00Z",
  },
];

const mockReports: NubixReport[] = [
  {
    id: "nr-001",
    studyId: "ns-001",
    doctorName: "Dra. Lucía Paredes",
    status: "signed",
    findings:
      "Campos pulmonares de transparencia normal. Silueta cardíaca dentro de límites normales. Senos costofrénicos libres. Mediastino sin ensanchamiento.",
    impression: "Radiografía de tórax sin hallazgos patológicos significativos.",
    recommendations: "Control anual de rutina.",
    icd10Codes: [{ code: "Z01.6", description: "Examen radiológico NEC" }],
    templateName: "Rx Tórax — Normal",
    signedAt: "2026-03-15T11:45:00Z",
    createdAt: "2026-03-15T10:30:00Z",
    updatedAt: "2026-03-15T11:45:00Z",
  },
  {
    id: "nr-002",
    studyId: "ns-005",
    doctorName: "Dr. Hernán Cárdenas",
    status: "signed",
    findings:
      "Ritmo sinusal regular a 72 lpm. Eje eléctrico normal. PR 0.16s. QRS 0.08s. Sin alteraciones del ST. T positivas en todas las derivaciones.",
    impression: "ECG dentro de límites normales.",
    recommendations: "Sin indicación de estudios complementarios.",
    icd10Codes: [{ code: "Z01.3", description: "Examen cardiovascular de rutina" }],
    templateName: "ECG — Normal",
    signedAt: "2026-03-15T09:00:00Z",
    createdAt: "2026-03-15T08:30:00Z",
    updatedAt: "2026-03-15T09:00:00Z",
  },
];

const mockDeliveries: NubixDelivery[] = [
  {
    id: "nd-001",
    studyId: "ns-001",
    channel: "whatsapp",
    recipientName: "Carlos Méndez",
    recipientContact: "+54 11 4567-8901",
    sentAt: "2026-03-15T12:00:00Z",
    openedAt: "2026-03-15T12:05:00Z",
    portalUrl: "https://minubix.cloud/r/abc123",
    status: "opened",
  },
  {
    id: "nd-002",
    studyId: "ns-004",
    channel: "email",
    recipientName: "María González",
    recipientContact: "maria.gonzalez@email.com",
    sentAt: "2026-03-14T17:30:00Z",
    openedAt: null,
    portalUrl: "https://minubix.cloud/r/def456",
    status: "delivered",
  },
  {
    id: "nd-003",
    studyId: "ns-004",
    channel: "portal",
    recipientName: "Dra. Carla Vega",
    recipientContact: "dra.vega@hospital.com",
    sentAt: "2026-03-14T17:30:00Z",
    openedAt: "2026-03-14T18:10:00Z",
    portalUrl: "https://minubix.cloud/doc/ghi789",
    status: "opened",
  },
];

const mockAppointments: NubixAppointment[] = [
  {
    id: "na-001",
    patientName: "Pedro Sánchez",
    patientDni: "40.123.456",
    modality: "MR",
    specialty: "radiologia",
    description: "RM de rodilla derecha",
    scheduledAt: "2026-03-15T14:00:00Z",
    duration: 30,
    room: "Sala RM-1",
    referringDoctor: "Dr. Federico Blanco",
    financiador: "OSDE",
    status: "confirmed",
    reminderSent: true,
    notes: "Contraindicaciones verificadas — sin implantes metálicos.",
  },
  {
    id: "na-002",
    patientName: "Laura Díaz",
    patientDni: "33.456.789",
    modality: "US",
    specialty: "obstetricia",
    description: "Ecografía morfológica",
    scheduledAt: "2026-03-15T15:00:00Z",
    duration: 45,
    room: "Sala US-2",
    referringDoctor: "Dra. Ana Fernández",
    financiador: "Swiss Medical",
    status: "confirmed",
    reminderSent: true,
    notes: "Semana 22 de gestación.",
  },
  {
    id: "na-003",
    patientName: "Roberto Torres",
    patientDni: "25.678.901",
    modality: "CT",
    specialty: "radiologia",
    description: "TC cerebro sin contraste",
    scheduledAt: "2026-03-15T16:00:00Z",
    duration: 15,
    room: "Sala TC-1",
    referringDoctor: "Dr. Martín Suárez",
    financiador: "PAMI",
    status: "arrived",
    reminderSent: true,
    notes: "Paciente con cefalea persistente.",
  },
];

// ─── Service Functions ───────────────────────────────────────

/** Get all studies, optionally filtered */
export async function getNubixStudies(filters?: NubixStudyFilters): Promise<NubixStudy[]> {
  if (!isNubixConfigured()) return applyStudyFilters(mockStudies, filters);

  try {
    const params: Record<string, string | number | undefined> = {
      patient_name: filters?.patientName,
      patient_dni: filters?.patientDni,
      modality: filters?.modality,
      specialty: filters?.specialty,
      status: filters?.status,
      date_from: filters?.dateFrom,
      date_to: filters?.dateTo,
      referring_doctor: filters?.referringDoctor,
      financiador: filters?.financiador,
      page: filters?.page ?? 1,
      page_size: filters?.pageSize ?? 50,
    };

    const res = await nubixGetPaginated<NubixStudy>("/studies", params);
    return res.data;
  } catch {
    return applyStudyFilters(mockStudies, filters);
  }
}

/** Get a single study by ID */
export async function getNubixStudy(id: string): Promise<NubixStudy | null> {
  if (!isNubixConfigured()) return mockStudies.find((s) => s.id === id) ?? null;

  try {
    return await nubixGet<NubixStudy>(`/studies/${id}`);
  } catch {
    return mockStudies.find((s) => s.id === id) ?? null;
  }
}

/** Get report for a study */
export async function getNubixReport(studyId: string): Promise<NubixReport | null> {
  if (!isNubixConfigured()) return mockReports.find((r) => r.studyId === studyId) ?? null;

  try {
    return await nubixGet<NubixReport>(`/studies/${studyId}/report`);
  } catch {
    return mockReports.find((r) => r.studyId === studyId) ?? null;
  }
}

/** Get all reports (pending + signed) */
export async function getNubixReports(): Promise<NubixReport[]> {
  if (!isNubixConfigured()) return mockReports;

  try {
    const res = await nubixGetPaginated<NubixReport>("/reports", { page_size: 100 });
    return res.data;
  } catch {
    return mockReports;
  }
}

/** Get delivery history for a study */
export async function getNubixDeliveries(studyId?: string): Promise<NubixDelivery[]> {
  if (!isNubixConfigured()) {
    return studyId ? mockDeliveries.filter((d) => d.studyId === studyId) : mockDeliveries;
  }

  try {
    const path = studyId ? `/studies/${studyId}/deliveries` : "/deliveries";
    const res = await nubixGetPaginated<NubixDelivery>(path, { page_size: 100 });
    return res.data;
  } catch {
    return studyId ? mockDeliveries.filter((d) => d.studyId === studyId) : mockDeliveries;
  }
}

/** Send study results to a patient via WhatsApp/email/portal */
export async function sendNubixResults(
  studyId: string,
  channel: NubixDelivery["channel"],
  recipientContact: string,
): Promise<NubixDelivery | null> {
  if (!isNubixConfigured()) {
    // Return a simulated delivery for demo
    return {
      id: `nd-demo-${Date.now()}`,
      studyId,
      channel,
      recipientName: "Demo Patient",
      recipientContact,
      sentAt: new Date().toISOString(),
      openedAt: null,
      portalUrl: `https://minubix.cloud/r/demo-${Date.now()}`,
      status: "sent",
    };
  }

  try {
    return await nubixPost<NubixDelivery>(`/studies/${studyId}/deliver`, {
      channel,
      recipient_contact: recipientContact,
    });
  } catch {
    return null;
  }
}

/** Get DICOM viewer embed config (temporary token + URL) */
export async function getNubixViewerConfig(studyId: string): Promise<NubixViewerConfig | null> {
  if (!isNubixConfigured()) {
    return {
      studyId,
      embedUrl: `https://app.nubix.cloud/embed/viewer/${studyId}`,
      token: "demo-token-" + Date.now(),
      expiresAt: new Date(Date.now() + 3600_000).toISOString(),
      tools: ["zoom", "pan", "window_level", "measure", "annotate", "rotate", "invert"],
    };
  }

  try {
    return await nubixPost<NubixViewerConfig>(`/studies/${studyId}/viewer-token`, {});
  } catch {
    return null;
  }
}

/** Get appointments, optionally filtered */
export async function getNubixAppointments(
  filters?: NubixAppointmentFilters,
): Promise<NubixAppointment[]> {
  if (!isNubixConfigured()) return mockAppointments;

  try {
    const params: Record<string, string | number | undefined> = {
      date_from: filters?.dateFrom,
      date_to: filters?.dateTo,
      modality: filters?.modality,
      status: filters?.status,
      room: filters?.room,
      page: filters?.page ?? 1,
      page_size: filters?.pageSize ?? 50,
    };

    const res = await nubixGetPaginated<NubixAppointment>("/appointments", params);
    return res.data;
  } catch {
    return mockAppointments;
  }
}

/** Create or update an appointment */
export async function upsertNubixAppointment(
  data: Omit<NubixAppointment, "id">,
  id?: string,
): Promise<NubixAppointment | null> {
  if (!isNubixConfigured()) return null;

  try {
    if (id) {
      return await nubixPut<NubixAppointment>(`/appointments/${id}`, data);
    }
    return await nubixPost<NubixAppointment>("/appointments", data);
  } catch {
    return null;
  }
}

// ─── KPIs ────────────────────────────────────────────────────

export async function getNubixKPIs(): Promise<NubixKPIs> {
  if (!isNubixConfigured()) {
    const todayStudies = mockStudies.filter((s) => s.studyDate.startsWith("2026-03-15"));
    return {
      totalStudies: mockStudies.length,
      todayStudies: todayStudies.length,
      pendingReports: mockStudies.filter((s) => s.reportStatus === "pending").length,
      deliveredToday: mockDeliveries.filter((d) => d.sentAt.startsWith("2026-03-15")).length,
      avgReportTime: "2h 15m",
      appointmentsToday: mockAppointments.length,
      noShowRate: 4.2,
      storageUsedGB: 128.5,
    };
  }

  try {
    return await nubixGet<NubixKPIs>("/stats/kpis");
  } catch {
    return {
      totalStudies: 0,
      todayStudies: 0,
      pendingReports: 0,
      deliveredToday: 0,
      avgReportTime: "—",
      appointmentsToday: 0,
      noShowRate: 0,
      storageUsedGB: 0,
    };
  }
}

// ─── Helpers ─────────────────────────────────────────────────

function applyStudyFilters(studies: NubixStudy[], filters?: NubixStudyFilters): NubixStudy[] {
  if (!filters) return studies;

  return studies.filter((s) => {
    if (
      filters.patientName &&
      !s.patientName.toLowerCase().includes(filters.patientName.toLowerCase())
    )
      return false;
    if (filters.patientDni && !s.patientDni.includes(filters.patientDni)) return false;
    if (filters.modality && s.modality !== filters.modality) return false;
    if (filters.specialty && s.specialty !== filters.specialty) return false;
    if (filters.status && s.status !== filters.status) return false;
    if (filters.financiador && s.financiador !== filters.financiador) return false;
    if (
      filters.referringDoctor &&
      !s.referringDoctor.toLowerCase().includes(filters.referringDoctor.toLowerCase())
    )
      return false;
    return true;
  });
}

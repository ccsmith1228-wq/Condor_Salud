// ─── Nubix Cloud Integration Types ───────────────────────────
// TypeScript types for the Nubix RIS/PACS cloud platform.
// See https://nubix.cloud for platform documentation.

// ─── Enums ───────────────────────────────────────────────────

export type NubixModality =
  | "CR" // Computed Radiography
  | "CT" // Computed Tomography
  | "MR" // Magnetic Resonance
  | "US" // Ultrasound
  | "DX" // Digital Radiography
  | "MG" // Mammography
  | "OT" // Other
  | "XA" // X-Ray Angiography
  | "PT" // PET
  | "NM" // Nuclear Medicine
  | "IO" // Intra-Oral (Dental)
  | "PX" // Panoramic X-Ray (Dental)
  | "ES" // Endoscopy
  | "ECG" // Electrocardiogram
  | "AU" // Audiometry
  | "OPT"; // Ophthalmic Tomography

export type NubixStudyStatus =
  | "scheduled" // Programado
  | "in_progress" // En progreso
  | "completed" // Completado — images acquired
  | "reported" // Informado — report attached
  | "delivered" // Entregado — sent to patient/doctor
  | "cancelled"; // Cancelado

export type NubixReportStatus = "pending" | "draft" | "signed" | "amended";

export type NubixDeliveryChannel = "whatsapp" | "email" | "portal" | "sms";

export type NubixSpecialty =
  | "radiologia"
  | "dental"
  | "cirugia"
  | "cardiologia"
  | "neumologia"
  | "audiometria"
  | "patologia"
  | "obstetricia"
  | "colposcopia"
  | "oftalmologia"
  | "veterinaria";

// ─── Core Entities ───────────────────────────────────────────

/** A DICOM imaging study stored in Nubix Cloud */
export interface NubixStudy {
  id: string;
  accessionNumber: string;
  patientId: string;
  patientName: string;
  patientDni: string;
  modality: NubixModality;
  specialty: NubixSpecialty;
  description: string;
  bodyPart: string;
  studyDate: string; // ISO 8601
  status: NubixStudyStatus;
  instanceCount: number; // Number of DICOM images
  seriesCount: number;
  referringDoctor: string;
  reportingDoctor: string | null;
  reportStatus: NubixReportStatus;
  financiador: string;
  viewerUrl: string; // Deep link to Nubix DICOM viewer
  thumbnailUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

/** A radiology/diagnostic report attached to a study */
export interface NubixReport {
  id: string;
  studyId: string;
  doctorName: string;
  status: NubixReportStatus;
  findings: string;
  impression: string;
  recommendations: string;
  icd10Codes: { code: string; description: string }[];
  templateName: string | null;
  signedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Result delivery record — when/how a study was sent to patient/doctor */
export interface NubixDelivery {
  id: string;
  studyId: string;
  channel: NubixDeliveryChannel;
  recipientName: string;
  recipientContact: string; // Phone or email
  sentAt: string;
  openedAt: string | null;
  portalUrl: string | null;
  status: "sent" | "delivered" | "opened" | "failed";
}

/** A patient appointment/slot in Nubix scheduling */
export interface NubixAppointment {
  id: string;
  patientName: string;
  patientDni: string;
  modality: NubixModality;
  specialty: NubixSpecialty;
  description: string;
  scheduledAt: string; // ISO 8601
  duration: number; // minutes
  room: string;
  referringDoctor: string;
  financiador: string;
  status: "confirmed" | "arrived" | "in_progress" | "completed" | "no_show" | "cancelled";
  reminderSent: boolean;
  notes: string;
}

/** Nubix DICOM viewer embed configuration */
export interface NubixViewerConfig {
  studyId: string;
  embedUrl: string;
  token: string; // Temporary viewer access token
  expiresAt: string;
  tools: NubixViewerTool[];
}

export type NubixViewerTool =
  | "zoom"
  | "pan"
  | "window_level"
  | "measure"
  | "annotate"
  | "rotate"
  | "invert"
  | "cine"
  | "mpr" // Multi-Planar Reconstruction
  | "3d";

// ─── KPIs ────────────────────────────────────────────────────

export interface NubixKPIs {
  totalStudies: number;
  todayStudies: number;
  pendingReports: number;
  deliveredToday: number;
  avgReportTime: string; // e.g. "2h 15m"
  appointmentsToday: number;
  noShowRate: number; // percentage
  storageUsedGB: number;
}

// ─── API Response Wrappers ───────────────────────────────────

export interface NubixPaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface NubixApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// ─── Filter/Query Types ──────────────────────────────────────

export interface NubixStudyFilters {
  patientName?: string;
  patientDni?: string;
  modality?: NubixModality;
  specialty?: NubixSpecialty;
  status?: NubixStudyStatus;
  dateFrom?: string;
  dateTo?: string;
  referringDoctor?: string;
  financiador?: string;
  page?: number;
  pageSize?: number;
}

export interface NubixAppointmentFilters {
  dateFrom?: string;
  dateTo?: string;
  modality?: NubixModality;
  status?: NubixAppointment["status"];
  room?: string;
  page?: number;
  pageSize?: number;
}

// ─── Domain Types ────────────────────────────────────────────
// Shared TypeScript types for Cóndor Salud.
// See BRANDKIT.md §10 for terminology reference.

export type PlanTier = "basic" | "plus" | "enterprise";
export type FinanciadorType = "os" | "prepaga" | "pami";
export type FacturaEstado = "presentada" | "cobrada" | "rechazada" | "pendiente" | "en_observacion";
export type RechazoMotivo =
  | "codigo_invalido"
  | "afiliado_no_encontrado"
  | "vencida"
  | "duplicada"
  | "sin_autorizacion"
  | "datos_incompletos"
  | "nomenclador_desactualizado";

// ─── Entities ────────────────────────────────────────────────

export interface Clinic {
  id: string;
  name: string;
  cuit: string;
  planTier: PlanTier;
  sedes: number;
  provincia: string;
  localidad: string;
}

export interface Financiador {
  id: string;
  name: string;
  type: FinanciadorType;
  facturado: number;
  cobrado: number;
  tasaRechazo: number;
  diasPromedioPago: number;
  facturasPendientes: number;
  ultimoPago?: string;
}

export interface Factura {
  id: string;
  numero: string;
  fecha: string;
  financiador: string;
  paciente: string;
  prestacion: string;
  codigoNomenclador: string;
  monto: number;
  estado: FacturaEstado;
  fechaPresentacion?: string;
  fechaCobro?: string;
  cae?: string;
}

export interface Rechazo {
  id: string;
  facturaId: string;
  facturaNumero: string;
  financiador: string;
  paciente: string;
  prestacion: string;
  monto: number;
  motivo: RechazoMotivo;
  motivoDetalle: string;
  fechaRechazo: string;
  fechaPresentacion: string;
  reprocesable: boolean;
  estado: "pendiente" | "reprocesado" | "descartado";
}

export interface VerificacionResult {
  status: "activo" | "inactivo";
  nombre: string;
  financiador: string;
  plan: string;
  vigencia: string;
  grupo: string;
}

export interface InflacionMes {
  mes: string;
  ipc: number;
  facturado: number;
  cobrado: number;
  diasDemora: number;
  perdidaReal: number;
  perdidaPorcentaje: number;
}

export interface Alerta {
  id: string;
  tipo: "rechazo" | "vencimiento" | "nomenclador" | "pago" | "inflacion";
  titulo: string;
  detalle: string;
  fecha: string;
  acento: "celeste" | "gold";
  read: boolean;
}

export interface KPI {
  label: string;
  value: string;
  change: string;
  up: boolean;
  color: string;
}

// ─── Module 11: Farmacia ─────────────────────────────────────

export interface Medication {
  id: string;
  name: string;
  lab: string;
  category: string;
  price: number;
  pamiCoverage: number;
  osCoverage: number;
  prepagaCoverage: number;
  stock: "Disponible" | "Últimas unidades" | "Sin stock";
  requiresPrescription: boolean;
}

export interface Prescription {
  id: string;
  code: string;
  patientName: string;
  doctorName: string;
  date: string;
  items: string[];
  status: "Pendiente" | "En carrito" | "Entregado" | "Cancelado";
  financiador: string;
}

export interface Delivery {
  id: string;
  code: string;
  patientName: string;
  address: string;
  itemCount: number;
  status: "Preparando" | "En camino" | "Entregado" | "Cancelado";
  eta: string;
  courier: string;
  progress: number;
}

export interface RecurringOrder {
  id: string;
  code: string;
  patientName: string;
  medications: string[];
  frequency: string;
  nextDelivery: string;
  financiador: string;
  status: "Activo" | "Pausado" | "Cancelado";
}

// ─── Module 12: Telemedicina ─────────────────────────────────

export interface WaitingRoomEntry {
  id: string;
  patientName: string;
  age: number;
  reason: string;
  queuePosition: number;
  waitTime: string;
  intakeComplete: boolean;
  financiador: string;
  joinedAt: string;
}

export interface Consultation {
  id: string;
  code: string;
  patientName: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  duration: string;
  status: "Programada" | "En sala" | "En curso" | "Completada" | "No show" | "Cancelada";
  billed: boolean;
  billCode: string | null;
  prescriptionSent: boolean;
  summarySent: boolean;
  financiador: string;
  videoRoomUrl?: string;
}

// ─── Module 13: Directorio Médico ────────────────────────────

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  location: string;
  address: string;
  financiadores: string[];
  rating: number;
  reviews: number;
  nextSlot: string;
  available: boolean;
  teleconsulta: boolean;
  experience: string;
  languages: string[];
  /** External profile URL (Google Maps when enriched) */
  profileUrl?: string;
  /** Source of the listing */
  source?: "local" | "google_places";
  /** Doctor photo URL (Google Places proxy or database) */
  photoUrl?: string;
}

export interface DoctorReview {
  id: string;
  doctorId: string;
  patientName: string;
  rating: number;
  text: string;
  date: string;
}

// ─── Module 14: Triage ───────────────────────────────────────

export interface Triage {
  id: string;
  code: string;
  patientName: string;
  date: string;
  symptoms: string[];
  severity: number;
  frequency: string;
  duration: string;
  triggers: string;
  freeNotes: string;
  photoUrls: string[];
  routedSpecialty: string;
  routedDoctor: string;
  status: "Pendiente" | "En consulta" | "Completado" | "Cancelado";
}

export interface ClinicalNote {
  id: string;
  triageId?: string;
  consultationId?: string;
  doctorName: string;
  patientName: string;
  icd10Codes: { code: string; description: string }[];
  notes: string;
  treatmentPlan: string;
  referrals: string[];
  date: string;
}

// ─── Module KPI Shapes ──────────────────────────────────────

export interface FarmaciaKPIs {
  ordersToday: number;
  inTransit: number;
  pendingRx: number;
  activeRecurring: number;
}

export interface TelemedicinaKPIs {
  inWaiting: number;
  todayCount: number;
  billed: number;
  prescriptionsSent: number;
}

export interface DirectorioKPIs {
  totalDoctors: number;
  totalSpecialties: number;
  availableToday: number;
  avgRating: string;
  totalReviews: number;
}

export interface TriageKPIs {
  todayCount: number;
  pending: number;
  routed: number;
  highSeverity: number;
}

// ─── CRM / WhatsApp Types ────────────────────────────────────

export type LeadEstado =
  | "nuevo"
  | "contactado"
  | "interesado"
  | "turno_agendado"
  | "convertido"
  | "perdido";

export type LeadFuente = "whatsapp" | "web" | "referido" | "landing" | "chatbot" | "manual";

export type ConversationStatus = "open" | "pending" | "resolved" | "archived";
export type ConversationChannel = "whatsapp" | "web_chat" | "email" | "telefono";
export type MessageDirection = "inbound" | "outbound";
export type MessageSenderType = "patient" | "lead" | "staff" | "system" | "bot";

export interface Lead {
  id: string;
  clinic_id: string;
  paciente_id: string | null;
  nombre: string | null;
  telefono: string;
  email: string | null;
  motivo: string | null;
  fuente: LeadFuente;
  estado: LeadEstado;
  prioridad: number;
  assigned_to: string | null;
  tags: string[];
  financiador: string | null;
  notas: string | null;
  first_contact_at: string | null;
  last_message_at: string | null;
  converted_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  // Joined relations
  paciente?: { id: string; nombre: string; telefono: string; financiador: string | null };
  conversations?: Conversation[];
}

export interface Conversation {
  id: string;
  clinic_id: string;
  lead_id: string | null;
  paciente_id: string | null;
  channel: ConversationChannel;
  status: ConversationStatus;
  subject: string | null;
  assigned_to: string | null;
  unread_count: number;
  last_message_at: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined relations
  lead?: Pick<Lead, "id" | "nombre" | "telefono" | "estado" | "tags" | "financiador">;
  paciente?: { id: string; nombre: string; telefono: string; financiador: string | null };
}

export interface Message {
  id: string;
  clinic_id: string;
  conversation_id: string;
  direction: MessageDirection;
  sender_type: MessageSenderType;
  sender_id: string | null;
  sender_name: string | null;
  body: string;
  media_url: string | null;
  media_type: string | null;
  twilio_sid: string | null;
  status: "queued" | "sent" | "delivered" | "read" | "failed";
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface WhatsAppConfig {
  id: string;
  clinic_id: string;
  whatsapp_number: string;
  display_name: string;
  twilio_sid: string | null;
  twilio_token: string | null;
  welcome_message: string | null;
  auto_reply: boolean;
  business_hours: string; // JSON string with schedule + reminder settings
  out_of_hours_message: string | null;
  notify_on_new_lead: boolean;
  created_at: string;
  updated_at: string;
}

export interface WhatsAppTemplate {
  id: string;
  clinic_id: string;
  name: string;
  category: "utility" | "marketing" | "authentication";
  language: string;
  body_template: string;
  variables: string[];
  header_text: string | null;
  footer_text: string | null;
  active: boolean;
  approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface LeadStats {
  total: number;
  nuevo: number;
  contactado: number;
  interesado: number;
  turno_agendado: number;
  convertido: number;
  perdido: number;
  byFuente: Record<LeadFuente, number>;
  conversionRate: number;
  avgTimeToConvert: number | null;
}

export interface CRMKPIs {
  leadsToday: number;
  openConversations: number;
  unreadMessages: number;
  conversionRate: number;
  topFuente: LeadFuente;
}

// ─── Feature: Cóndor Club Salud ──────────────────────────────

export interface ClubPlan {
  id: string;
  slug: "basico" | "plus" | "familiar";
  nameEs: string;
  nameEn: string;
  priceArs: number;
  priceUsd: number;
  prescriptionDiscount: number; // legacy — always 0
  maxTeleconsultas: number;
  includesDelivery: boolean;
  includesCoraPriority: boolean;
  includesRecordsRequest: boolean;
  active: boolean;
  sortOrder: number;
}

export type ClubMembershipStatus = "active" | "paused" | "cancelled" | "expired";

export interface ClubMembership {
  id: string;
  patientId: string;
  planId: string;
  plan?: ClubPlan;
  status: ClubMembershipStatus;
  mpSubscriptionId?: string;
  startedAt: string;
  expiresAt?: string;
  cancelledAt?: string;
}

export interface PrescriptionFee {
  id: string;
  patientId: string;
  prescriptionId?: string;
  medicationName: string;
  originalPrice: number;
  discountPct: number;
  finalPrice: number;
  clubPlanSlug?: string;
  paymentStatus: "pending" | "paid" | "waived";
  createdAt: string;
}

// ─── Feature: Club Salud — Welcome Plan (Plan de Bienvenida) ─

export type WelcomeStudyGender = "male" | "female" | "all";

export interface WelcomeStudy {
  id: string;
  name: string;
  nameEn: string;
  category: "cardio" | "imaging" | "lab" | "screening";
  gender: WelcomeStudyGender;
  minAge?: number; // only required if age-gated
  description: string;
  descriptionEn: string;
}

export interface WelcomePlanResult {
  baseStudies: WelcomeStudy[];
  ageSpecificStudies: WelcomeStudy[];
  allStudies: WelcomeStudy[];
}

// ─── Feature: Health Tracker ─────────────────────────────────

export interface HealthTrackerCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  defaultUnit: string;
  minValue?: number;
  maxValue?: number;
  active: boolean;
  sortOrder: number;
}

export interface HealthTrackerItem {
  id: string;
  patientId: string;
  categoryId: string;
  category?: HealthTrackerCategory;
  value: number;
  unit?: string;
  notes?: string;
  measuredAt: string;
  createdAt: string;
  // Joined from category (populated by service)
  categoryName?: string;
  categoryIcon?: string;
  categoryColor?: string;
}

// ─── Feature: Digital Prescriptions with QR ──────────────────

export type DigitalPrescriptionStatus =
  | "draft"
  | "active"
  | "sent"
  | "dispensed"
  | "expired"
  | "cancelled";

export interface PrescriptionMedication {
  id: string;
  prescriptionId: string;
  medicationName: string;
  genericName?: string;
  dosage: string;
  frequency: string;
  duration?: string;
  quantity?: number;
  notes?: string;
  sortOrder: number;
  drug?: DrugSnapshot;
}

/** Snapshot of drug data at time of prescription (immutable) */
export interface DrugSnapshot {
  drugId: string;
  troquel?: string;
  alfabetaCode?: string;
  monodrogaCode?: string;
  genericName: string;
  commercialName: string;
  lab: string;
  concentration: string;
  presentation: string;
  isControlled: boolean;
}

/** Structured diagnosis with optional ICD-10 code */
export interface PrescriptionDiagnosis {
  code?: string; // ICD-10 code, e.g. "J06.9"
  description: string;
}

/** OSDE registration data stored per prescription */
export interface OSDEPrescriptionData {
  status:
    | "registered"
    | "partial"
    | "not_osde"
    | "no_credentials"
    | "validation_error"
    | "server_error"
    | "config_error";
  registeredAt?: string;
  retriedAt?: string;
  batchResults?: Record<string, { groupIdentifier?: string; success: boolean; error?: string }>;
}

export interface DigitalPrescription {
  id: string;
  clinicId?: string;
  doctorProfileId?: string;
  patientId: string;
  patientName: string;
  patientDni?: string;
  doctorName: string;
  doctorMatricula?: string;
  doctorCuit?: string;
  specialty?: string;
  diagnosis?: string;
  diagnoses?: PrescriptionDiagnosis[];
  notes?: string;
  verificationToken: string;
  status: DigitalPrescriptionStatus;
  issuedAt: string;
  expiresAt: string;
  sentAt?: string;
  sentVia?: ("whatsapp" | "email")[];
  dispensedAt?: string;
  dispensedBy?: string;
  pdfPath?: string;
  pdfUrl?: string;
  coverageName?: string;
  coveragePlan?: string;
  coverageNumber?: string;
  osde?: OSDEPrescriptionData;
  repeatOf?: string; // original prescription ID
  medications: PrescriptionMedication[];
  createdAt: string;
}

// ─── Vademécum / Drug Database ───────────────────────────────

export interface VademecumDrug {
  id: string;
  commercialName: string;
  genericName: string;
  lab: string;
  concentration: string;
  presentation: string;
  troquel?: string;
  alfabetaCode?: string;
  monodrogaCode?: string;
  isControlled: boolean;
  requiresPrescription: boolean;
  category: string;
  atcCode?: string;
}

export interface DrugInteraction {
  id: string;
  drugA: string;
  drugB: string;
  severity: "low" | "moderate" | "high" | "contraindicated";
  description: string;
  recommendation: string;
}

export interface VademecumSearchResult {
  drugs: VademecumDrug[];
  source: "api" | "cache" | "local";
  total: number;
}

export interface InteractionCheckResult {
  interactions: DrugInteraction[];
  hasContraindicated: boolean;
  hasHigh: boolean;
}

// ─── SISA (Sistema Integrado de Información Sanitaria) ───────

export interface SISADoctorData {
  nombre: string;
  apellido: string;
  dni: string;
  cuil?: string;
  provincia: string;
  profesion: string;
  especialidad: string;
  matricula: string;
  tipoMatricula: "nacional" | "provincial";
  estado: "habilitado" | "inhabilitado" | "suspendido";
}

export interface SISAValidationResult {
  valid: boolean;
  data: SISADoctorData | null;
  error?: string;
}

// ─── Feature: Doctor Verification ────────────────────────────

export type DoctorVerificationStatus = "pending" | "approved" | "rejected" | "needs_review";

export type VerificationDocumentType =
  | "matricula_frente"
  | "matricula_dorso"
  | "dni_frente"
  | "dni_dorso"
  | "titulo"
  | "otro";

export interface VerificationDocument {
  id: string;
  verificationId: string;
  documentType: VerificationDocumentType;
  storagePath: string;
  fileName: string;
  mimeType: string;
  uploadedAt: string;
}

export interface DoctorVerification {
  id: string;
  profileId: string;
  matriculaNacional?: string;
  matriculaProvincial?: string;
  dni?: string;
  status: DoctorVerificationStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  documents: VerificationDocument[];
}

// ─── Feature: Public Doctor Profiles ─────────────────────────

export interface DoctorPublicProfile {
  id: string;
  profileId: string;
  slug: string;
  displayName: string;
  specialty: string;
  subSpecialties: string[];
  bioEs?: string;
  bioEn?: string;
  photoUrl?: string;
  matriculaNacional?: string;
  matriculaProvincial?: string;
  isVerified: boolean;
  // Contact
  phone?: string;
  whatsapp?: string;
  email?: string;
  bookingUrl?: string;
  // Location
  address?: string;
  city?: string;
  province?: string;
  lat?: number;
  lng?: number;
  // Practice
  insuranceAccepted: string[];
  languages: string[];
  education: { degree: string; institution: string; year: number }[];
  experienceYears?: number;
  teleconsultaAvailable: boolean;
  consultationFeeArs?: number;
  consultationFeeUsd?: number;
  // SEO
  seoTitle?: string;
  seoDescription?: string;
  // Visibility
  published: boolean;
  featured: boolean;
  // Ratings
  avgRating: number;
  reviewCount: number;
}

export interface DoctorPublicReview {
  id: string;
  doctorProfileId: string;
  patientId?: string;
  patientDisplayName: string;
  rating: number;
  title?: string;
  body?: string;
  isVerifiedPatient: boolean;
  status: "pending" | "approved" | "rejected" | "flagged";
  createdAt: string;
}

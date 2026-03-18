/**
 * Doctoraliar (Docplanner) Integration Layer
 *
 * Full REST API client for Argentina's Doctoraliar.com (Doctoralia / Docplanner Group).
 * Uses OAuth2 client_credentials flow.
 *
 * API docs: https://integrations.docplanner.com/docs/
 * Guide:    https://integrations.docplanner.com/guide/
 *
 * Base URL: https://www.doctoraliar.com/api/v3/integration/{resource}
 * Auth:     https://www.doctoraliar.com/oauth/v2/token
 */

import { logger } from "@/lib/security/api-guard";

// ── Constants ────────────────────────────────────────────────

const DOMAIN = "doctoraliar.com";
const BASE_URL = `https://www.${DOMAIN}/api/v3/integration`;
const TOKEN_URL = `https://www.${DOMAIN}/oauth/v2/token`;
const CONTENT_TYPE = "application/vnd.docplanner+json; charset=UTF-8";

// ── Types ────────────────────────────────────────────────────

export interface DoctoraliarFacility {
  id: string;
  name: string;
}

export interface DoctoraliarSpecialization {
  id: string;
  name: string;
}

export interface DoctoraliarDoctor {
  id: string;
  name: string;
  surname: string;
  specializations?: { _items: DoctoraliarSpecialization[] };
  profile_url?: string;
  license_numbers?: string[];
  addresses?: { _items: DoctoraliarAddress[] };
}

export interface DoctoraliarBookingExtraFields {
  birth_date: boolean;
  gender: boolean;
  nin: boolean;
}

export interface DoctoraliarAddress {
  id: string;
  name: string;
  city_name: string;
  post_code: string;
  street: string;
  booking_extra_fields?: DoctoraliarBookingExtraFields;
  online_only?: boolean;
  insurance_support?: "private" | "insurance" | "private_and_insurance";
}

export interface DoctoraliarSlot {
  start: string; // ISO 8601
  address_services?: { _items: DoctoraliarAddressService[] };
}

export interface DoctoraliarAddressService {
  id: string;
  name: string;
  is_default: boolean;
  is_price_from: boolean;
  price: number | null;
  description: string | null;
  service_id: string;
  is_visible: boolean;
  allowed_patients?: { minimum_age: number; maximum_age: number } | null;
}

export interface DoctoraliarBooking {
  id: string;
  status: "booked" | "canceled";
  start_at: string;
  end_at: string;
  duration: number;
  booked_by: "user" | "doctor";
  canceled_by: string;
  booked_at: string;
  canceled_at: string | null;
  comment: string | null;
  patient?: DoctoraliarPatient;
  address_service?: DoctoraliarAddressService;
  insurance?: { id: string; name: string; plan: string | null; plan_id: string | null };
}

export interface DoctoraliarPatient {
  name: string;
  surname: string;
  email: string;
  phone: string | number;
  birth_date?: string;
  nin?: string | number;
  gender?: "m" | "f";
  is_returning?: boolean;
  insurance_number?: string | null;
}

export interface DoctoraliarInsuranceProvider {
  insurance_provider_id: string;
  name: string;
  insurance_plans?: { _items: DoctoraliarInsurancePlan[] };
}

export interface DoctoraliarInsurancePlan {
  insurance_plan_id: string;
  name: string;
}

export interface DoctoraliarService {
  id: string;
  name: string;
}

export interface BookSlotPayload {
  address_service_id: string;
  is_returning?: boolean;
  duration: number;
  patient: {
    name: string;
    surname: string;
    email: string;
    phone: string;
    birth_date?: string;
    nin?: string;
    gender?: "m" | "f";
    marketing_consent?: boolean;
    data_privacy_consent?: boolean;
  };
  label?: string;
  comment?: string;
  insurance_provider_id?: string;
  insurance_plan_id?: string;
  is_recurring?: boolean;
}

// ── Paginated response ───────────────────────────────────────

interface PaginatedResponse<T> {
  _items: T[];
  page?: number;
  limit?: number;
  pages?: number;
  total?: number;
}

// ── Error types ──────────────────────────────────────────────

export class DoctoraliarError extends Error {
  status: number;
  apiMessage: string;
  constructor(status: number, message: string) {
    super(`Doctoraliar API error ${status}: ${message}`);
    this.name = "DoctoraliarError";
    this.status = status;
    this.apiMessage = message;
  }
}

// ── Token Cache ──────────────────────────────────────────────

let cachedToken: { access_token: string; expires_at: number } | null = null;

async function getAccessToken(): Promise<string> {
  const clientId = process.env.DOCTORALIAR_CLIENT_ID;
  const clientSecret = process.env.DOCTORALIAR_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new DoctoraliarError(500, "DOCTORALIAR_CLIENT_ID or DOCTORALIAR_CLIENT_SECRET not set");
  }

  // Return cached token if still valid (with 5 min buffer)
  if (cachedToken && Date.now() < cachedToken.expires_at - 300_000) {
    return cachedToken.access_token;
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials&scope=integration",
  });

  if (!res.ok) {
    const text = await res.text();
    logger.error({ status: res.status, body: text }, "Doctoraliar token request failed");
    throw new DoctoraliarError(res.status, "Token request failed");
  }

  const data = await res.json();

  cachedToken = {
    access_token: data.access_token,
    // Token is valid for 24h (86400s); data.expires_in is in seconds
    expires_at: Date.now() + (data.expires_in || 86400) * 1000,
  };

  logger.info("Doctoraliar OAuth2 token acquired");
  return cachedToken.access_token;
}

// ── Core fetch helper ────────────────────────────────────────

async function dpFetch<T>(
  path: string,
  options?: { method?: string; body?: unknown; params?: Record<string, string> },
): Promise<T> {
  const token = await getAccessToken();

  const url = new URL(`${BASE_URL}${path}`);
  if (options?.params) {
    for (const [k, v] of Object.entries(options.params)) {
      if (v) url.searchParams.set(k, v);
    }
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    Accept: CONTENT_TYPE,
  };

  const fetchOpts: RequestInit = {
    method: options?.method || "GET",
    headers,
    next: { revalidate: 60 }, // ISR cache for 60 seconds
  };

  if (options?.body) {
    headers["Content-Type"] = "application/json";
    fetchOpts.body = JSON.stringify(options.body);
  }

  const res = await fetch(url.toString(), fetchOpts);

  if (!res.ok) {
    const errorBody = await res.text().catch(() => "");
    let message = `HTTP ${res.status}`;
    try {
      const parsed = JSON.parse(errorBody);
      message = parsed.message || message;
    } catch {
      /* not JSON */
    }
    throw new DoctoraliarError(res.status, message);
  }

  // 204 No Content
  if (res.status === 204) return {} as T;

  return res.json();
}

// ── Configuration check ──────────────────────────────────────

export function isDoctoraliarConfigured(): boolean {
  return !!(process.env.DOCTORALIAR_CLIENT_ID && process.env.DOCTORALIAR_CLIENT_SECRET);
}

// ── Facilities ───────────────────────────────────────────────

export async function getFacilities(): Promise<DoctoraliarFacility[]> {
  const data = await dpFetch<{ _items: DoctoraliarFacility[] }>("/facilities");
  return data._items || [];
}

export async function getFacility(
  facilityId: string,
  withDoctors?: boolean,
): Promise<DoctoraliarFacility & { doctors?: { _items: DoctoraliarDoctor[] } }> {
  const params: Record<string, string> = {};
  if (withDoctors) params.with = "facility.doctors";
  return dpFetch(`/facilities/${facilityId}`, { params });
}

// ── Doctors ──────────────────────────────────────────────────

export async function getDoctors(
  facilityId: string,
  options?: {
    withProfileUrl?: boolean;
    withSpecializations?: boolean;
    withLicenseNumbers?: boolean;
  },
): Promise<DoctoraliarDoctor[]> {
  const withScopes: string[] = [];
  if (options?.withProfileUrl) withScopes.push("doctor.profile_url");
  if (options?.withSpecializations) withScopes.push("doctor.specializations");
  if (options?.withLicenseNumbers) withScopes.push("doctor.license_numbers");

  const params: Record<string, string> = {};
  if (withScopes.length) params.with = withScopes.join(",");

  const data = await dpFetch<PaginatedResponse<DoctoraliarDoctor>>(
    `/facilities/${facilityId}/doctors`,
    { params },
  );
  return data._items || [];
}

export async function getDoctor(
  facilityId: string,
  doctorId: string,
  options?: {
    withProfileUrl?: boolean;
    withAddresses?: boolean;
    withLicenseNumbers?: boolean;
    withOnlineOnly?: boolean;
    withInsuranceSupport?: boolean;
  },
): Promise<DoctoraliarDoctor> {
  const withScopes: string[] = [];
  if (options?.withProfileUrl) withScopes.push("doctor.profile_url");
  if (options?.withAddresses) withScopes.push("doctor.addresses");
  if (options?.withLicenseNumbers) withScopes.push("doctor.license_numbers");
  if (options?.withOnlineOnly) withScopes.push("address.online_only");
  if (options?.withInsuranceSupport) withScopes.push("address.insurance_support");

  const params: Record<string, string> = {};
  if (withScopes.length) params.with = withScopes.join(",");

  return dpFetch(`/facilities/${facilityId}/doctors/${doctorId}`, { params });
}

// ── Addresses ────────────────────────────────────────────────

export async function getAddresses(
  facilityId: string,
  doctorId: string,
  options?: { withOnlineOnly?: boolean; withInsuranceSupport?: boolean },
): Promise<DoctoraliarAddress[]> {
  const withScopes: string[] = [];
  if (options?.withOnlineOnly) withScopes.push("address.online_only");
  if (options?.withInsuranceSupport) withScopes.push("address.insurance_support");

  const params: Record<string, string> = {};
  if (withScopes.length) params.with = withScopes.join(",");

  const data = await dpFetch<PaginatedResponse<DoctoraliarAddress>>(
    `/facilities/${facilityId}/doctors/${doctorId}/addresses`,
    { params },
  );
  return data._items || [];
}

// ── Services ─────────────────────────────────────────────────

export async function getServices(specializationId?: string): Promise<DoctoraliarService[]> {
  const params: Record<string, string> = {};
  if (specializationId) params.specialization_id = specializationId;
  const data = await dpFetch<PaginatedResponse<DoctoraliarService>>("/services", { params });
  return data._items || [];
}

export async function getAddressServices(
  facilityId: string,
  doctorId: string,
  addressId: string,
): Promise<DoctoraliarAddressService[]> {
  const data = await dpFetch<PaginatedResponse<DoctoraliarAddressService>>(
    `/facilities/${facilityId}/doctors/${doctorId}/addresses/${addressId}/services`,
  );
  return data._items || [];
}

// ── Insurance Providers ──────────────────────────────────────

export async function getInsuranceProviders(): Promise<DoctoraliarInsuranceProvider[]> {
  const data =
    await dpFetch<PaginatedResponse<DoctoraliarInsuranceProvider>>("/insurance-providers");
  return data._items || [];
}

export async function getInsurancePlans(providerId: string): Promise<DoctoraliarInsurancePlan[]> {
  const data = await dpFetch<PaginatedResponse<DoctoraliarInsurancePlan>>(
    `/insurance-providers/${providerId}/plans`,
  );
  return data._items || [];
}

export async function getAddressInsuranceProviders(
  facilityId: string,
  doctorId: string,
  addressId: string,
): Promise<DoctoraliarInsuranceProvider[]> {
  const data = await dpFetch<PaginatedResponse<DoctoraliarInsuranceProvider>>(
    `/facilities/${facilityId}/doctors/${doctorId}/addresses/${addressId}/insurance-providers`,
  );
  return data._items || [];
}

// ── Slots ────────────────────────────────────────────────────

export async function getSlots(
  facilityId: string,
  doctorId: string,
  addressId: string,
  start: string, // ISO 8601
  end: string, // ISO 8601
  options?: { withServices?: boolean },
): Promise<DoctoraliarSlot[]> {
  const params: Record<string, string> = {
    start: encodeURIComponent(start),
    end: encodeURIComponent(end),
  };
  if (options?.withServices) params.with = "slot.services";

  const data = await dpFetch<PaginatedResponse<DoctoraliarSlot>>(
    `/facilities/${facilityId}/doctors/${doctorId}/addresses/${addressId}/slots`,
    { params },
  );
  return data._items || [];
}

export async function bookSlot(
  facilityId: string,
  doctorId: string,
  addressId: string,
  slotStart: string, // ISO 8601
  payload: BookSlotPayload,
): Promise<DoctoraliarBooking> {
  const encodedStart = encodeURIComponent(slotStart);
  return dpFetch<DoctoraliarBooking>(
    `/facilities/${facilityId}/doctors/${doctorId}/addresses/${addressId}/slots/${encodedStart}/book`,
    { method: "POST", body: payload },
  );
}

// ── Bookings ─────────────────────────────────────────────────

export async function getBookings(
  facilityId: string,
  doctorId: string,
  addressId: string,
  start: string,
  end: string,
  options?: { withPatient?: boolean; withService?: boolean; page?: number; limit?: number },
): Promise<DoctoraliarBooking[]> {
  const params: Record<string, string> = {
    start: encodeURIComponent(start),
    end: encodeURIComponent(end),
  };
  const withScopes: string[] = [];
  if (options?.withPatient) withScopes.push("booking.patient");
  if (options?.withService) withScopes.push("booking.address_service");
  if (withScopes.length) params.with = withScopes.join(",");
  if (options?.page) params.page = String(options.page);
  if (options?.limit) params.limit = String(options.limit);

  const data = await dpFetch<PaginatedResponse<DoctoraliarBooking>>(
    `/facilities/${facilityId}/doctors/${doctorId}/addresses/${addressId}/bookings`,
    { params },
  );
  return data._items || [];
}

export async function getBooking(
  facilityId: string,
  doctorId: string,
  addressId: string,
  bookingId: string,
): Promise<DoctoraliarBooking> {
  return dpFetch(
    `/facilities/${facilityId}/doctors/${doctorId}/addresses/${addressId}/bookings/${bookingId}`,
  );
}

export async function cancelBooking(
  facilityId: string,
  doctorId: string,
  addressId: string,
  bookingId: string,
  reason?: string,
): Promise<void> {
  await dpFetch(
    `/facilities/${facilityId}/doctors/${doctorId}/addresses/${addressId}/bookings/${bookingId}`,
    { method: "DELETE", body: reason ? { reason } : undefined },
  );
}

export async function moveBooking(
  facilityId: string,
  doctorId: string,
  addressId: string,
  bookingId: string,
  payload: { address_service_id: string; start?: string; duration?: number; address_id?: string },
): Promise<DoctoraliarBooking> {
  return dpFetch(
    `/facilities/${facilityId}/doctors/${doctorId}/addresses/${addressId}/bookings/${bookingId}/move`,
    { method: "POST", body: payload },
  );
}

// ── Calendar ─────────────────────────────────────────────────

export async function getCalendarStatus(
  facilityId: string,
  doctorId: string,
  addressId: string,
): Promise<{ status: "enabled" | "disabled" }> {
  return dpFetch(`/facilities/${facilityId}/doctors/${doctorId}/addresses/${addressId}/calendar`);
}

// ── Notifications (Pull) ─────────────────────────────────────

export async function pullNotifications(
  limit?: number,
): Promise<{ notifications: unknown[]; remaining: number }> {
  const params: Record<string, string> = {};
  if (limit) params.limit = String(limit);
  return dpFetch("/notifications/multiple", { params });
}

// ── Profile URL Builder ──────────────────────────────────────
// When we have doctor.profile_url from the API, use it directly.
// Otherwise, build a Doctoraliar search URL.

export function getDoctoraliarSearchUrl(doctorName: string): string {
  return `https://www.${DOMAIN}/?q=${encodeURIComponent(doctorName)}`;
}

export function getDoctoraliarSpecialtyUrl(specialty: string): string {
  const slug = SPECIALTY_SLUGS[specialty];
  if (slug) return `https://www.${DOMAIN}/${slug}`;
  return `https://www.${DOMAIN}/?q=${encodeURIComponent(specialty)}`;
}

// Specialty → Doctoraliar slug mapping (Argentine Spanish)
const SPECIALTY_SLUGS: Record<string, string> = {
  Cardiología: "cardiologo",
  "Clínica médica": "medico-clinico",
  Dermatología: "dermatologo",
  Endocrinología: "endocrinologo",
  Gastroenterología: "gastroenterologo",
  Ginecología: "ginecologo",
  Neurología: "neurologo",
  Oftalmología: "oftalmologo",
  Pediatría: "pediatra",
  Traumatología: "traumatologo",
  Urología: "urologo",
  Otorrinolaringología: "otorrinolaringologo",
  Psiquiatría: "psiquiatra",
  Kinesiología: "kinesiologo",
  Nutrición: "nutricionista",
  Odontología: "odontologo",
  Psicología: "psicologo",
  Obstetricia: "obstetra",
};

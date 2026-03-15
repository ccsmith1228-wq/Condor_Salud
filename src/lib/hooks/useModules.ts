// ─── SWR Hooks for Modules 11-14 ─────────────────────────────
// Each hook maps to a data-client key or API route.
// Works with mock data fallback when Supabase is not configured.

"use client";

import useSWR from "swr";

// ─── Module 11: Farmacia ─────────────────────────────────────

export function useMedications() {
  return useSWR("medications");
}

export function usePrescriptions() {
  return useSWR("prescriptions");
}

export function useDeliveries() {
  return useSWR("deliveries");
}

export function useRecurringOrders() {
  return useSWR("recurringOrders");
}

export function useFarmaciaKPIs() {
  return useSWR("farmaciaKPIs");
}

// ─── Module 12: Telemedicina ─────────────────────────────────

export function useWaitingRoom() {
  return useSWR("waitingRoom");
}

export function useConsultations() {
  return useSWR("consultations");
}

export function useScheduledConsultations() {
  return useSWR("scheduledConsultations");
}

export function useTelemedichinaKPIs() {
  return useSWR("telemedichinaKPIs");
}

// ─── Module 13: Directorio ───────────────────────────────────

export function useDoctors() {
  return useSWR("doctors");
}

export function useDirectorioKPIs() {
  return useSWR("directorioKPIs");
}

// ─── Module 14: Triage ───────────────────────────────────────

export function useTriages() {
  return useSWR("triages");
}

export function useTriageKPIs() {
  return useSWR("triageKPIs");
}

// ─── Nubix Cloud (RIS/PACS) ─────────────────────────────────

export function useNubixStudies() {
  return useSWR("nubixStudies");
}

export function useNubixReports() {
  return useSWR("nubixReports");
}

export function useNubixDeliveries() {
  return useSWR("nubixDeliveries");
}

export function useNubixAppointments() {
  return useSWR("nubixAppointments");
}

export function useNubixKPIs() {
  return useSWR("nubixKPIs");
}

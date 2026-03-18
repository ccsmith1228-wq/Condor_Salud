/**
 * Cóndor Salud — CRM SWR Hooks
 *
 * Client-side data-fetching hooks for the CRM dashboard.
 * Uses the global SWR fetcher which auto-calls /api/ routes.
 */

"use client";

import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import type {
  Lead,
  LeadStats,
  LeadEstado,
  LeadFuente,
  Conversation,
  Message,
  WhatsAppConfig,
  WhatsAppTemplate,
} from "@/lib/types";

// ─── Types ───────────────────────────────────────────────────

interface LeadsResponse {
  leads: Lead[];
  total: number;
}

interface ConversationsResponse {
  conversations: Conversation[];
}

interface MessagesResponse {
  messages: Message[];
}

interface StatsResponse {
  stats: LeadStats;
}

interface LeadFilters {
  estado?: LeadEstado | LeadEstado[];
  fuente?: LeadFuente;
  search?: string;
  limit?: number;
  offset?: number;
}

// ─── Build URL ───────────────────────────────────────────────

function buildLeadsUrl(filters: LeadFilters = {}): string {
  const params = new URLSearchParams();
  if (filters.estado) {
    params.set("estado", Array.isArray(filters.estado) ? filters.estado.join(",") : filters.estado);
  }
  if (filters.fuente) params.set("fuente", filters.fuente);
  if (filters.search) params.set("search", filters.search);
  if (filters.limit) params.set("limit", String(filters.limit));
  if (filters.offset) params.set("offset", String(filters.offset));
  const qs = params.toString();
  return `/api/crm/leads${qs ? `?${qs}` : ""}`;
}

// ─── Fetch Helpers for mutations ─────────────────────────────

async function postJson(url: string, { arg }: { arg: Record<string, unknown> }) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(arg),
  });
  if (!res.ok) throw new Error(`POST ${url} failed: ${res.status}`);
  return res.json();
}

async function patchJson(url: string, { arg }: { arg: Record<string, unknown> }) {
  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(arg),
  });
  if (!res.ok) throw new Error(`PATCH ${url} failed: ${res.status}`);
  return res.json();
}

// ─── Hooks ───────────────────────────────────────────────────

/** List leads with filtering */
export function useLeads(filters: LeadFilters = {}) {
  const key = buildLeadsUrl(filters);
  const { data, error, isLoading, mutate } = useSWR<LeadsResponse>(key, {
    refreshInterval: 30_000, // Refresh every 30s for live pipeline
  });

  return {
    leads: data?.leads ?? [],
    total: data?.total ?? 0,
    isLoading,
    error,
    refresh: mutate,
  };
}

/** Get a single lead with details */
export function useLead(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<{ lead: Lead }>(
    id ? `/api/crm/leads/${id}` : null,
  );

  return {
    lead: data?.lead ?? null,
    isLoading,
    error,
    refresh: mutate,
  };
}

/** CRM pipeline stats */
export function useLeadStats() {
  const { data, error, isLoading } = useSWR<StatsResponse>("/api/crm/stats", {
    refreshInterval: 60_000,
  });

  return {
    stats: data?.stats ?? null,
    isLoading,
    error,
  };
}

/** List conversations */
export function useConversations(status?: string) {
  const key = `/api/crm/conversations${status ? `?status=${status}` : ""}`;
  const { data, error, isLoading, mutate } = useSWR<ConversationsResponse>(key, {
    refreshInterval: 10_000, // Refresh every 10s for inbox
  });

  return {
    conversations: data?.conversations ?? [],
    isLoading,
    error,
    refresh: mutate,
  };
}

/** Get messages for a conversation */
export function useMessages(conversationId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<MessagesResponse>(
    conversationId ? `/api/crm/conversations/${conversationId}` : null,
    { refreshInterval: 5_000 }, // Fast refresh for active chat
  );

  return {
    messages: data?.messages ?? [],
    isLoading,
    error,
    refresh: mutate,
  };
}

// ─── Mutations ───────────────────────────────────────────────

/** Create a manual lead */
export function useCreateLead() {
  return useSWRMutation("/api/crm/leads", postJson);
}

/** Update lead (status, tags, assignment, notes) */
export function useUpdateLead(leadId: string) {
  return useSWRMutation(`/api/crm/leads/${leadId}`, patchJson);
}

/** Convert lead to patient */
export function useConvertLead(leadId: string) {
  return useSWRMutation(`/api/crm/leads/${leadId}`, postJson);
}

/** Send a message in a conversation */
export function useSendMessage(conversationId: string) {
  return useSWRMutation(`/api/crm/conversations/${conversationId}`, postJson);
}

// ─── WhatsApp Config ─────────────────────────────────────────

interface WhatsAppConfigResponse {
  config: WhatsAppConfig | null;
  templates: WhatsAppTemplate[];
}

/** Fetch the clinic's WhatsApp config + templates */
export function useWhatsAppConfig() {
  const { data, error, isLoading, mutate } = useSWR<WhatsAppConfigResponse>("/api/whatsapp/config");

  return {
    config: data?.config ?? null,
    templates: data?.templates ?? [],
    isLoading,
    error,
    refresh: mutate,
  };
}

/** Save WhatsApp config + templates via PUT */
export function useSaveWhatsAppConfig() {
  return useSWRMutation("/api/whatsapp/config", putJson);
}

async function putJson(url: string, { arg }: { arg: Record<string, unknown> }) {
  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(arg),
  });
  if (!res.ok) throw new Error(`PUT ${url} failed: ${res.status}`);
  return res.json();
}

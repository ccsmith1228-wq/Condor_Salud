// ─── Supabase Realtime Service ───────────────────────────────
// Live subscriptions for alerts, notifications, and data changes.
// Uses Supabase Realtime channels with Row Level Security.
//
// Usage:
//   import { useRealtimeAlerts } from "@/lib/services/realtime";
//   const { alerts, unreadCount } = useRealtimeAlerts();

"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import type { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/env";
import type { Alerta } from "@/lib/types";

// ─── Types ───────────────────────────────────────────────────
interface RealtimeAlertState {
  alerts: Alerta[];
  unreadCount: number;
  isConnected: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

interface AlertRow {
  id: string;
  clinic_id: string;
  tipo: string;
  titulo: string;
  detalle: string;
  fecha: string;
  acento: string;
  read: boolean;
  created_at: string;
}

function mapAlertRow(row: AlertRow): Alerta {
  return {
    id: row.id,
    tipo: row.tipo as Alerta["tipo"],
    titulo: row.titulo,
    detalle: row.detalle,
    fecha: row.fecha,
    acento: row.acento as Alerta["acento"],
  };
}

// ─── useRealtimeAlerts Hook ──────────────────────────────────
// Subscribes to INSERT/UPDATE on the `alertas` table.
// Falls back to static data when Supabase is not configured.

export function useRealtimeAlerts(initialAlerts: Alerta[] = []): RealtimeAlertState {
  const [alerts, setAlerts] = useState<Alerta[]>(initialAlerts);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const readSetRef = useRef<Set<string>>(new Set());

  // Recalculate unread count
  useEffect(() => {
    setUnreadCount(alerts.filter((a) => !readSetRef.current.has(a.id)).length);
  }, [alerts]);

  // Subscribe to realtime changes
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const supabase = createClient();

    // Fetch initial alerts
    supabase
      .from("alertas")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data, error }) => {
        if (!error && data) {
          const rows = data as unknown as AlertRow[];
          setAlerts(rows.map(mapAlertRow));
          readSetRef.current = new Set(rows.filter((r) => r.read).map((r) => r.id));
        }
      });

    // Subscribe to changes
    const channel = supabase
      .channel("alertas-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "alertas",
        },
        (payload: RealtimePostgresChangesPayload<AlertRow>) => {
          if (payload.new && "id" in payload.new) {
            const newAlert = mapAlertRow(payload.new as AlertRow);
            setAlerts((prev) => [newAlert, ...prev]);
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "alertas",
        },
        (payload: RealtimePostgresChangesPayload<AlertRow>) => {
          if (payload.new && "id" in payload.new) {
            const updated = payload.new as AlertRow;
            if (updated.read) {
              readSetRef.current.add(updated.id);
            }
            setAlerts((prev) => prev.map((a) => (a.id === updated.id ? mapAlertRow(updated) : a)));
          }
        },
      )
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED");
      });

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, []);

  // Mark a single alert as read
  const markAsRead = useCallback(async (id: string) => {
    readSetRef.current.add(id);
    setUnreadCount((prev) => Math.max(0, prev - 1));

    if (isSupabaseConfigured()) {
      const supabase = createClient();
      await supabase.from("alertas").update({ read: true }).eq("id", id);
    }
  }, []);

  // Mark all alerts as read
  const markAllAsRead = useCallback(async () => {
    alerts.forEach((a) => readSetRef.current.add(a.id));
    setUnreadCount(0);

    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const unreadIds = alerts.filter((a) => !readSetRef.current.has(a.id)).map((a) => a.id);
      if (unreadIds.length > 0) {
        await supabase.from("alertas").update({ read: true }).in("id", unreadIds);
      }
    }
  }, [alerts]);

  return {
    alerts,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
  };
}

// ─── Generic Realtime Subscription ───────────────────────────
// For subscribing to any table changes.

export interface RealtimeSubscription<T> {
  data: T[];
  isConnected: boolean;
  unsubscribe: () => void;
}

/**
 * Subscribe to a table's changes. Returns current data + live updates.
 *
 * Usage:
 *   const { data, isConnected } = useRealtimeTable<Turno>("turnos", mapTurno, {
 *     filter: "date=eq.2026-03-16"
 *   });
 */
export function useRealtimeTable<TRow extends Record<string, unknown>, TEntity>(
  table: string,
  mapper: (row: TRow) => TEntity,
  options?: {
    filter?: string;
    orderBy?: string;
    limit?: number;
  },
): { data: TEntity[]; isConnected: boolean } {
  const [data, setData] = useState<TEntity[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const supabase = createClient();

    // Initial fetch
    let query = (supabase.from as Function)(table).select("*");
    if (options?.orderBy) {
      query = query.order(options.orderBy, { ascending: false });
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    query.then(({ data: rows, error }: { data: unknown[] | null; error: unknown }) => {
      if (!error && rows) {
        setData((rows as TRow[]).map(mapper));
      }
    });

    // Subscribe
    const channel = supabase
      .channel(`${table}-realtime`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table,
          ...(options?.filter ? { filter: options.filter } : {}),
        },
        (payload) => {
          const eventType = payload.eventType;
          if (eventType === "INSERT" && payload.new) {
            setData((prev) => [mapper(payload.new as TRow), ...prev]);
          } else if (eventType === "UPDATE" && payload.new) {
            const updated = mapper(payload.new as TRow);
            setData((prev) =>
              prev.map((item) => {
                const itemId = (item as Record<string, unknown>)["id"];
                const newId = (payload.new as Record<string, unknown>)["id"];
                return itemId === newId ? updated : item;
              }),
            );
          } else if (eventType === "DELETE" && payload.old) {
            const deletedId = (payload.old as Record<string, unknown>)["id"];
            setData((prev) =>
              prev.filter((item) => (item as Record<string, unknown>)["id"] !== deletedId),
            );
          }
        },
      )
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED");
      });

    return () => {
      channel.unsubscribe();
    };
  }, [table]); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, isConnected };
}

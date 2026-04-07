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
    read: row.read,
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
      .then(({ data, error }: { data: unknown[] | null; error: unknown }) => {
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
      .subscribe((status: string) => {
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
        (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
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
      .subscribe((status: string) => {
        setIsConnected(status === "SUBSCRIBED");
      });

    return () => {
      channel.unsubscribe();
    };
  }, [table]); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, isConnected };
}

// ─── Realtime Turno Notifications for Doctors ────────────────
// Subscribes to INSERT/UPDATE on the `turnos` table.
// Surfaces new bookings + upcoming appointments with patient info.

export interface TurnoNotification {
  id: string;
  turnoId: string;
  type: "new_booking" | "upcoming" | "status_change";
  hora: string;
  fecha: string;
  paciente: string;
  pacienteId?: string;
  tipo: string;
  financiador: string;
  profesional: string;
  estado: string;
  durationMin?: number;
  notas?: string;
  /** Patient detail (populated via lookup) */
  patientDetail?: {
    id: string;
    nombre: string;
    dni: string;
    financiador: string;
    plan: string;
    telefono: string;
    email: string;
    ultimaVisita: string;
  } | null;
  timestamp: number;
  dismissed: boolean;
}

interface TurnoRow {
  id: string;
  clinic_id: string;
  hora: string;
  fecha: string;
  paciente: string;
  tipo: string;
  financiador: string;
  profesional: string;
  estado: string;
  duration_min?: number;
  notas?: string;
  created_at?: string;
}

interface UseTurnoNotificationsOptions {
  /** Set false to skip subscription entirely (e.g. for non-doctor roles) */
  enabled?: boolean;
  /** Filter to only show turnos for this professional name or ID */
  profesionalFilter?: string;
  /** How many minutes before an appointment to fire "upcoming" */
  upcomingThresholdMin?: number;
  /** Max notifications to keep in state */
  maxNotifications?: number;
}

export function useRealtimeTurnoNotifications(options: UseTurnoNotificationsOptions = {}): {
  notifications: TurnoNotification[];
  activePatient: TurnoNotification | null;
  unreadCount: number;
  dismiss: (id: string) => void;
  dismissAll: () => void;
  showPatient: (notification: TurnoNotification) => void;
  closePatient: () => void;
  isConnected: boolean;
} {
  const {
    enabled = true,
    profesionalFilter,
    upcomingThresholdMin = 10,
    maxNotifications = 20,
  } = options;
  const [notifications, setNotifications] = useState<TurnoNotification[]>([]);
  const [activePatient, setActivePatient] = useState<TurnoNotification | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const upcomingTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const unreadCount = notifications.filter((n) => !n.dismissed).length;

  /** Look up patient details from pacientes table */
  const enrichWithPatient = useCallback(
    async (notif: TurnoNotification): Promise<TurnoNotification> => {
      if (!isSupabaseConfigured()) return notif;
      try {
        const supabase = createClient();
        const patientName = notif.paciente?.trim();
        if (!patientName || patientName.length < 2) return notif;

        // Try exact name match first (most reliable)
        let { data } = await supabase
          .from("pacientes")
          .select("id, nombre, dni, financiador, plan, telefono, email, ultima_visita")
          .ilike("nombre", patientName)
          .limit(1)
          .single();

        // Fall back to first-name partial match
        if (!data) {
          const firstName = patientName.split(" ")[0];
          if (firstName && firstName.length >= 2) {
            const res = await supabase
              .from("pacientes")
              .select("id, nombre, dni, financiador, plan, telefono, email, ultima_visita")
              .ilike("nombre", `${firstName}%`)
              .limit(1)
              .single();
            data = res.data;
          }
        }

        if (data) {
          return {
            ...notif,
            patientDetail: {
              id: data.id,
              nombre: data.nombre,
              dni: data.dni,
              financiador: data.financiador || notif.financiador,
              plan: data.plan || "",
              telefono: data.telefono || "",
              email: data.email || "",
              ultimaVisita: data.ultima_visita || "",
            },
          };
        }
      } catch {
        // Non-critical — show notification without patient detail
      }
      return notif;
    },
    [],
  );

  /** Add a notification (with patient enrichment + auto-show) */
  const addNotification = useCallback(
    async (notif: TurnoNotification) => {
      const enriched = await enrichWithPatient(notif);
      setNotifications((prev) => {
        // Deduplicate by turnoId + type
        const filtered = prev.filter(
          (n) => !(n.turnoId === enriched.turnoId && n.type === enriched.type),
        );
        return [enriched, ...filtered].slice(0, maxNotifications);
      });
      // Auto-show patient card for new bookings
      if (enriched.type === "new_booking" || enriched.type === "upcoming") {
        setActivePatient(enriched);
      }
    },
    [enrichWithPatient, maxNotifications],
  );

  // Subscribe to realtime turno changes
  useEffect(() => {
    if (!enabled || !isSupabaseConfigured()) return;

    const supabase = createClient();

    // Subscribe to INSERT (new booking) and UPDATE (status change)
    const channel = supabase
      .channel("turnos-doctor-notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "turnos" },
        (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          if (!payload.new || !("id" in payload.new)) return;
          const row = payload.new as unknown as TurnoRow;

          // Filter by professional if specified
          if (profesionalFilter && row.profesional !== profesionalFilter) {
            return;
          }

          addNotification({
            id: `notif-${row.id}-new`,
            turnoId: row.id,
            type: "new_booking",
            hora: row.hora,
            fecha: row.fecha,
            paciente: row.paciente,
            tipo: row.tipo,
            financiador: row.financiador,
            profesional: row.profesional,
            estado: row.estado,
            durationMin: row.duration_min,
            notas: row.notas,
            timestamp: Date.now(),
            dismissed: false,
          });
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "turnos" },
        (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          if (!payload.new || !("id" in payload.new)) return;
          const row = payload.new as unknown as TurnoRow;

          if (profesionalFilter && row.profesional !== profesionalFilter) {
            return;
          }

          // Only notify on meaningful status changes
          const oldEstado = (payload.old as Record<string, unknown>)?.estado;
          if (oldEstado && oldEstado !== row.estado) {
            addNotification({
              id: `notif-${row.id}-status-${row.estado}`,
              turnoId: row.id,
              type: "status_change",
              hora: row.hora,
              fecha: row.fecha,
              paciente: row.paciente,
              tipo: row.tipo,
              financiador: row.financiador,
              profesional: row.profesional,
              estado: row.estado,
              durationMin: row.duration_min,
              notas: row.notas,
              timestamp: Date.now(),
              dismissed: false,
            });
          }
        },
      )
      .subscribe((status: string) => {
        setIsConnected(status === "SUBSCRIBED");
      });

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [enabled, profesionalFilter, addNotification]);

  // Upcoming appointment checker — runs every 60s
  useEffect(() => {
    if (!enabled || !isSupabaseConfigured()) return;

    async function checkUpcoming() {
      try {
        const supabase = createClient();
        const now = new Date();
        const today = now.toISOString().slice(0, 10);
        const currentMin = now.getHours() * 60 + now.getMinutes();
        const thresholdMin = currentMin + upcomingThresholdMin;

        let query = supabase
          .from("turnos")
          .select("*")
          .eq("fecha", today)
          .in("estado", ["confirmado", "pendiente"]);

        if (profesionalFilter) {
          query = query.eq("profesional", profesionalFilter);
        }

        const { data: rows } = await query;
        if (!rows) return;

        for (const row of rows as unknown as TurnoRow[]) {
          const [hh, mm] = (row.hora || "").split(":").map(Number);
          const turnoMin = (hh || 0) * 60 + (mm || 0);

          // Fire if within threshold and not past
          if (turnoMin > currentMin && turnoMin <= thresholdMin) {
            addNotification({
              id: `notif-${row.id}-upcoming`,
              turnoId: row.id,
              type: "upcoming",
              hora: row.hora,
              fecha: row.fecha,
              paciente: row.paciente,
              tipo: row.tipo,
              financiador: row.financiador,
              profesional: row.profesional,
              estado: row.estado,
              durationMin: row.duration_min,
              notas: row.notas,
              timestamp: Date.now(),
              dismissed: false,
            });
          }
        }
      } catch {
        // Non-critical
      }
    }

    // Check immediately + every 60s
    checkUpcoming();
    const interval = setInterval(checkUpcoming, 60_000);
    const timers = upcomingTimersRef.current;

    return () => {
      clearInterval(interval);
      timers.forEach(clearTimeout);
    };
  }, [enabled, profesionalFilter, upcomingThresholdMin, addNotification]);

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, dismissed: true } : n)));
    setActivePatient((curr) => (curr?.id === id ? null : curr));
  }, []);

  const dismissAll = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, dismissed: true })));
    setActivePatient(null);
  }, []);

  const showPatient = useCallback((notif: TurnoNotification) => {
    setActivePatient(notif);
  }, []);

  const closePatient = useCallback(() => {
    setActivePatient(null);
  }, []);

  return {
    notifications,
    activePatient,
    unreadCount,
    dismiss,
    dismissAll,
    showPatient,
    closePatient,
    isConnected,
  };
}

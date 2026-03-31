"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/Toast";
import { useLocale } from "@/lib/i18n/context";
import { useAuth } from "@/lib/auth/context";
import {
  Calendar,
  Check,
  X,
  Clock,
  Phone,
  Mail,
  Video,
  User,
  Filter,
  RefreshCw,
  ExternalLink,
  Copy,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Globe,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────

interface Booking {
  id: string;
  patient_name: string;
  patient_email: string | null;
  patient_phone: string | null;
  patient_language: string;
  doctor_id: string;
  doctor_name?: string;
  specialty: string;
  fecha: string;
  hora: string;
  hora_fin: string | null;
  tipo: "presencial" | "teleconsulta";
  status: "pending" | "notified" | "confirmed" | "cancelled" | "completed" | "no_show";
  notes: string | null;
  booked_via: string | null;
  created_at: string;
}

type StatusFilter = "all" | "pending" | "confirmed" | "cancelled" | "completed" | "no_show";

// ─── Status badge helper ─────────────────────────────────────

const STATUS_CONFIG = {
  pending: { key: "onlineBooking.statusPending", color: "bg-yellow-100 text-yellow-800" },
  notified: { key: "onlineBooking.statusNotified", color: "bg-blue-100 text-blue-800" },
  confirmed: { key: "onlineBooking.statusConfirmed", color: "bg-green-100 text-green-800" },
  cancelled: { key: "onlineBooking.statusCancelled", color: "bg-red-100 text-red-800" },
  completed: { key: "onlineBooking.statusCompleted", color: "bg-gray-100 text-gray-700" },
  no_show: { key: "onlineBooking.statusNoShow", color: "bg-orange-100 text-orange-800" },
} as const;

type StatusKey = keyof typeof STATUS_CONFIG;

function StatusBadge({ status, t }: { status: string; t: (key: string) => string }) {
  const key = (status in STATUS_CONFIG ? status : "pending") as StatusKey;
  const cfg = STATUS_CONFIG[key];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}
    >
      {t(cfg.key)}
    </span>
  );
}

// ─── Main Page Component ─────────────────────────────────────

export default function TurnosOnlinePage() {
  const { showToast } = useToast();
  const { t } = useLocale();
  const { user } = useAuth();

  // State
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [clinicSlug, setClinicSlug] = useState<string | null>(null);
  const [publicUrl, setPublicUrl] = useState<string>("");

  // ─── Fetch clinic slug ───────────────────────────────────
  useEffect(() => {
    async function getClinicSlug() {
      try {
        const res = await fetch("/api/me/clinic");
        if (res.ok) {
          const data = await res.json();
          setClinicSlug(data.slug);
          if (typeof window !== "undefined") {
            setPublicUrl(`${window.location.origin}/reservar/${data.slug}`);
          }
        } else {
          // Clinic not found — stop loading so we show empty state
          setLoading(false);
        }
      } catch {
        // Real API unavailable — stop loading
        setLoading(false);
      }
    }
    getClinicSlug();
  }, []);

  // ─── Fetch bookings ─────────────────────────────────────
  const fetchBookings = useCallback(async () => {
    if (!clinicSlug) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (dateFilter) params.set("date", dateFilter);

      const res = await fetch(`/api/clinics/${clinicSlug}/bookings?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();
      setBookings(data.bookings || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch {
      showToast(t("onlineBooking.errorLoading"), "error");
      setBookings([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [clinicSlug, page, statusFilter, dateFilter, t, showToast]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // ─── Actions ─────────────────────────────────────────────
  const handleAction = async (
    bookingId: string,
    action: "confirm" | "cancel" | "complete" | "no_show",
  ) => {
    if (!clinicSlug) return;
    setActionLoading(bookingId);
    try {
      const res = await fetch(`/api/clinics/${clinicSlug}/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Action failed");
      }

      const labels: Record<string, string> = {
        confirm: "onlineBooking.toastConfirmed",
        cancel: "onlineBooking.toastCancelled",
        complete: "onlineBooking.toastCompleted",
        no_show: "onlineBooking.toastNoShow",
      };

      showToast(t(labels[action]!), "success");
      fetchBookings();
    } catch (err) {
      showToast(err instanceof Error ? err.message : t("onlineBooking.actionFailed"), "error");
    } finally {
      setActionLoading(null);
    }
  };

  const copyPublicUrl = () => {
    navigator.clipboard.writeText(publicUrl);
    showToast(t("onlineBooking.linkCopied"), "success");
  };

  // ─── Render ──────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink flex items-center gap-2">
            <Calendar className="h-6 w-6 text-celeste" />
            {t("onlineBooking.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{t("onlineBooking.subtitle")}</p>
        </div>

        {/* Public URL card */}
        {publicUrl && (
          <div
            className="flex items-center gap-2 bg-surface border border-border rounded-lg px-4 py-2"
            data-tour="turnos-online-url"
          >
            <Globe className="h-4 w-4 text-celeste shrink-0" />
            <span className="text-xs text-muted-foreground truncate max-w-[200px]">
              {publicUrl}
            </span>
            <button
              onClick={copyPublicUrl}
              className="p-1 hover:bg-muted rounded transition"
              title={t("onlineBooking.copyLink")}
            >
              <Copy className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 hover:bg-muted rounded transition"
              title={t("onlineBooking.openPage")}
            >
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
            </a>
          </div>
        )}
      </div>

      {/* Filters bar */}
      <div
        className="flex flex-wrap items-center gap-3 bg-surface border border-border rounded-lg px-4 py-3"
        data-tour="turnos-online-filters"
      >
        <Filter className="h-4 w-4 text-muted-foreground" />
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as StatusFilter);
            setPage(1);
          }}
          className="text-sm border border-border rounded-md px-3 py-1.5 bg-white focus:ring-2 focus:ring-celeste/50 focus:border-celeste outline-none"
        >
          <option value="all">{t("onlineBooking.allStatuses")}</option>
          <option value="pending">{t(STATUS_CONFIG.pending.key)}</option>
          <option value="confirmed">{t(STATUS_CONFIG.confirmed.key)}</option>
          <option value="cancelled">{t(STATUS_CONFIG.cancelled.key)}</option>
          <option value="completed">{t(STATUS_CONFIG.completed.key)}</option>
          <option value="no_show">{t(STATUS_CONFIG.no_show.key)}</option>
        </select>

        <input
          type="date"
          value={dateFilter}
          onChange={(e) => {
            setDateFilter(e.target.value);
            setPage(1);
          }}
          className="text-sm border border-border rounded-md px-3 py-1.5 bg-white focus:ring-2 focus:ring-celeste/50 focus:border-celeste outline-none"
        />

        <button
          onClick={() => fetchBookings()}
          className="ml-auto flex items-center gap-1.5 text-sm text-celeste hover:text-celeste/80 transition"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          {t("action.refresh")}
        </button>
      </div>

      {/* Bookings table */}
      <div
        className="bg-white border border-border rounded-lg overflow-hidden"
        data-tour="turnos-online-table"
      >
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-celeste" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Calendar className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-lg font-medium text-ink">{t("onlineBooking.noBookings")}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {t("onlineBooking.noBookingsDesc")}
            </p>
            {publicUrl && (
              <button
                onClick={copyPublicUrl}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-celeste text-white rounded-lg text-sm hover:bg-celeste/90 transition"
              >
                <Copy className="h-4 w-4" />
                {t("onlineBooking.copyLink")}
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      {t("label.patient")}
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      {t("label.doctor")}
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      {t("onlineBooking.dateTime")}
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      {t("onlineBooking.type")}
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      {t("label.status")}
                    </th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                      {t("onlineBooking.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-muted/30 transition">
                      {/* Patient */}
                      <td className="px-4 py-3">
                        <div className="font-medium text-ink">{b.patient_name}</div>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                          {b.patient_email && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {b.patient_email}
                            </span>
                          )}
                          {b.patient_phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {b.patient_phone}
                            </span>
                          )}
                        </div>
                      </td>
                      {/* Doctor */}
                      <td className="px-4 py-3">
                        <div className="text-ink">{b.doctor_name || "—"}</div>
                        <div className="text-xs text-muted-foreground">{b.specialty}</div>
                      </td>
                      {/* Date/Time */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-ink">{formatDate(b.fecha)}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {b.hora}
                          {b.hora_fin ? ` – ${b.hora_fin}` : ""}
                        </div>
                      </td>
                      {/* Type */}
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-xs">
                          {b.tipo === "teleconsulta" ? (
                            <Video className="h-3.5 w-3.5 text-celeste" />
                          ) : (
                            <User className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                          {b.tipo === "teleconsulta"
                            ? t("onlineBooking.teleconsulta")
                            : t("onlineBooking.presencial")}
                        </span>
                        {b.booked_via && (
                          <div className="text-[10px] text-muted-foreground mt-0.5">
                            {t("onlineBooking.bookedVia")}: {b.booked_via}
                          </div>
                        )}
                      </td>
                      {/* Status */}
                      <td className="px-4 py-3">
                        <StatusBadge status={b.status} t={t} />
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-3 text-right" data-tour="turnos-online-actions">
                        <ActionButtons
                          booking={b}
                          loading={actionLoading === b.id}
                          t={t}
                          onAction={handleAction}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="lg:hidden divide-y divide-border">
              {bookings.map((b) => (
                <div key={b.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-ink">{b.patient_name}</p>
                      <p className="text-xs text-muted-foreground">{b.specialty}</p>
                    </div>
                    <StatusBadge status={b.status} t={t} />
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(b.fecha)} {b.hora}
                    </span>
                    <span className="flex items-center gap-1">
                      {b.tipo === "teleconsulta" ? (
                        <Video className="h-3 w-3 text-celeste" />
                      ) : (
                        <User className="h-3 w-3" />
                      )}
                      {b.tipo === "teleconsulta"
                        ? t("onlineBooking.teleconsulta")
                        : t("onlineBooking.presencial")}
                    </span>
                    {b.patient_phone && (
                      <a
                        href={`tel:${b.patient_phone}`}
                        className="flex items-center gap-1 text-celeste"
                      >
                        <Phone className="h-3 w-3" />
                        {b.patient_phone}
                      </a>
                    )}
                  </div>
                  <div className="flex gap-2 pt-1">
                    <ActionButtons
                      booking={b}
                      loading={actionLoading === b.id}
                      t={t}
                      onAction={handleAction}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-ink disabled:opacity-40 transition"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm text-muted-foreground">
                  {t("onlineBooking.page")} {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-ink disabled:opacity-40 transition"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Action Buttons Component ────────────────────────────────

function ActionButtons({
  booking,
  loading,
  t,
  onAction,
}: {
  booking: Booking;
  loading: boolean;
  t: (key: string) => string;
  onAction: (id: string, action: "confirm" | "cancel" | "complete" | "no_show") => void;
}) {
  if (loading) {
    return <Loader2 className="h-4 w-4 animate-spin text-celeste" />;
  }

  const btnBase =
    "inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition";

  switch (booking.status) {
    case "pending":
    case "notified":
      return (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onAction(booking.id, "confirm")}
            className={`${btnBase} bg-green-50 text-green-700 hover:bg-green-100`}
          >
            <Check className="h-3 w-3" />
            {t("action.confirm")}
          </button>
          <button
            onClick={() => onAction(booking.id, "cancel")}
            className={`${btnBase} bg-red-50 text-red-700 hover:bg-red-100`}
          >
            <X className="h-3 w-3" />
            {t("action.cancel")}
          </button>
        </div>
      );
    case "confirmed":
      return (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onAction(booking.id, "complete")}
            className={`${btnBase} bg-blue-50 text-blue-700 hover:bg-blue-100`}
          >
            <Check className="h-3 w-3" />
            {t("onlineBooking.complete")}
          </button>
          <button
            onClick={() => onAction(booking.id, "no_show")}
            className={`${btnBase} bg-orange-50 text-orange-700 hover:bg-orange-100`}
          >
            <X className="h-3 w-3" />
            {t("onlineBooking.noShow")}
          </button>
        </div>
      );
    default:
      return <span className="text-xs text-muted-foreground">—</span>;
  }
}

// ─── Helpers ─────────────────────────────────────────────────

function formatDate(fecha: string): string {
  try {
    const d = new Date(fecha + "T00:00:00");
    return d.toLocaleDateString("es-AR", { day: "2-digit", month: "short" });
  } catch {
    return fecha;
  }
}

// No demo bookings – real data comes from /api/clinics/:slug/bookings

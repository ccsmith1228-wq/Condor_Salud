"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  Stethoscope,
  Shield,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────

interface BookingData {
  id: string;
  patient_name: string;
  patient_email: string | null;
  patient_phone: string | null;
  patient_language: string;
  fecha: string;
  hora: string;
  hora_fin: string;
  specialty: string | null;
  tipo: string;
  status: string;
  cancel_reason: string | null;
  doctorName: string;
  doctorSpecialty: string | null;
  clinicName: string;
  clinicAddress: string;
  clinicPhone: string | null;
  clinicSlug: string;
}

// ─── Component ───────────────────────────────────────────────

export default function BookingDetailPage() {
  const { slug, bookingId } = useParams<{ slug: string; bookingId: string }>();
  const router = useRouter();

  const [booking, setBooking] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verification
  const [verifyEmail, setVerifyEmail] = useState("");
  const [verified, setVerified] = useState(false);

  // Cancel flow
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  // Reschedule flow
  const [showReschedule, setShowReschedule] = useState(false);
  const [newFecha, setNewFecha] = useState("");
  const [newHora, setNewHora] = useState("");
  const [rescheduling, setRescheduling] = useState(false);

  // Success state
  const [actionResult, setActionResult] = useState<{ type: string; message: string } | null>(null);

  const lang = booking?.patient_language || "es";
  const t = (es: string, en: string) => (lang === "en" ? en : es);

  // ── Verify & Fetch ─────────────────────────────────────────

  const fetchBooking = useCallback(async () => {
    if (!verifyEmail.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/clinics/${slug}/patient-bookings/${bookingId}?email=${encodeURIComponent(verifyEmail.trim())}`,
      );

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "No se encontró el turno");
        return;
      }

      const data: BookingData = await res.json();
      setBooking(data);
      setVerified(true);
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }, [verifyEmail, slug, bookingId]);

  // Auto-verify if email param is in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const emailParam = urlParams.get("email");
    if (emailParam) {
      setVerifyEmail(emailParam);
    }
  }, []);

  useEffect(() => {
    if (verifyEmail && !verified && !booking) {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("email")) {
        fetchBooking();
      }
    }
  }, [verifyEmail, verified, booking, fetchBooking]);

  // ── Cancel ─────────────────────────────────────────────────

  const handleCancel = async () => {
    setCancelling(true);
    setError(null);

    try {
      const res = await fetch(`/api/clinics/${slug}/patient-bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "cancel",
          email: verifyEmail,
          reason: cancelReason || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }

      setBooking((prev) => (prev ? { ...prev, status: "cancelled" } : null));
      setShowCancelConfirm(false);
      setActionResult({
        type: "cancel",
        message: t("Tu turno fue cancelado exitosamente.", "Your appointment was cancelled."),
      });
    } catch {
      setError(t("Error al cancelar", "Cancellation failed"));
    } finally {
      setCancelling(false);
    }
  };

  // ── Reschedule ─────────────────────────────────────────────

  const handleReschedule = async () => {
    if (!newFecha || !newHora) return;
    setRescheduling(true);
    setError(null);

    try {
      const res = await fetch(`/api/clinics/${slug}/patient-bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reschedule",
          email: verifyEmail,
          newFecha,
          newHora,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }

      setShowReschedule(false);
      setActionResult({
        type: "reschedule",
        message: t(
          `Turno reprogramado para ${newFecha} a las ${newHora}. Nuevo ID: ${data.id}`,
          `Rescheduled to ${newFecha} at ${newHora}. New ID: ${data.id}`,
        ),
      });
    } catch {
      setError(t("Error al reprogramar", "Reschedule failed"));
    } finally {
      setRescheduling(false);
    }
  };

  // ── Date formatting helper ─────────────────────────────────

  const fmtDate = (d: string) =>
    new Date(d + "T12:00:00").toLocaleDateString(lang === "en" ? "en-US" : "es-AR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  // ── Render ─────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b border-border bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-3">
          <button
            onClick={() => router.push(`/reservar/${slug}`)}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <ArrowLeft className="w-5 h-5 text-ink-muted" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-ink">
              {t("Gestionar Turno", "Manage Appointment")}
            </h1>
            <p className="text-xs text-ink-muted">ID: {bookingId?.slice(0, 8)}…</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        {/* ── Verification step ───────────────────────────── */}
        {!verified && (
          <div className="bg-white border border-border rounded-xl p-8 text-center">
            <Shield className="w-10 h-10 text-celeste-dark mx-auto mb-4" />
            <h2 className="text-lg font-bold text-ink mb-2">
              {t("Verificá tu identidad", "Verify your identity")}
            </h2>
            <p className="text-sm text-ink-muted mb-6">
              {t(
                "Ingresá el email que usaste al reservar para ver tu turno.",
                "Enter the email you used when booking to view your appointment.",
              )}
            </p>

            <div className="flex gap-2 max-w-md mx-auto">
              <input
                type="email"
                value={verifyEmail}
                onChange={(e) => setVerifyEmail(e.target.value)}
                placeholder="tucorreo@email.com"
                className="flex-1 px-4 py-2.5 border border-border rounded-lg text-sm focus:ring-2 focus:ring-celeste/40 focus:border-celeste outline-none"
                onKeyDown={(e) => e.key === "Enter" && fetchBooking()}
              />
              <button
                onClick={fetchBooking}
                disabled={loading || !verifyEmail.trim()}
                className="px-5 py-2.5 bg-celeste-dark text-white text-sm font-semibold rounded-lg hover:bg-celeste transition disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t("Verificar", "Verify")}
              </button>
            </div>

            {error && (
              <p className="mt-4 text-sm text-red-600 flex items-center justify-center gap-1">
                <AlertTriangle className="w-4 h-4" /> {error}
              </p>
            )}
          </div>
        )}

        {/* ── Action Result ───────────────────────────────── */}
        {actionResult && (
          <div
            className={`mb-6 p-4 rounded-xl border flex items-start gap-3 ${
              actionResult.type === "cancel"
                ? "bg-red-50 border-red-200"
                : "bg-green-50 border-green-200"
            }`}
          >
            {actionResult.type === "cancel" ? (
              <XCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
            )}
            <div>
              <p className="text-sm font-semibold text-ink">{actionResult.message}</p>
              <button
                onClick={() => router.push(`/reservar/${slug}`)}
                className="mt-2 text-xs text-celeste-dark font-semibold hover:underline"
              >
                {t("← Volver a reservar", "← Book another appointment")}
              </button>
            </div>
          </div>
        )}

        {/* ── Booking Details ─────────────────────────────── */}
        {booking && verified && (
          <div className="space-y-6">
            {/* Status badge */}
            <div className="bg-white border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    booking.status === "confirmed"
                      ? "bg-green-100 text-green-700"
                      : booking.status === "cancelled"
                        ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {booking.status === "confirmed" && <CheckCircle2 className="w-3 h-3" />}
                  {booking.status === "cancelled" && <XCircle className="w-3 h-3" />}
                  {booking.status === "confirmed"
                    ? t("Confirmado", "Confirmed")
                    : booking.status === "cancelled"
                      ? t("Cancelado", "Cancelled")
                      : t("Pendiente", "Pending")}
                </span>
                <span className="text-xs text-ink-muted">ID: {booking.id.slice(0, 8)}…</span>
              </div>

              {/* Details grid */}
              <div className="grid gap-3">
                <DetailRow
                  icon={Stethoscope}
                  label={t("Doctor", "Doctor")}
                  value={booking.doctorName}
                />
                {booking.specialty && (
                  <DetailRow
                    icon={Stethoscope}
                    label={t("Especialidad", "Specialty")}
                    value={booking.specialty}
                  />
                )}
                <DetailRow
                  icon={Calendar}
                  label={t("Fecha", "Date")}
                  value={fmtDate(booking.fecha)}
                />
                <DetailRow
                  icon={Clock}
                  label={t("Hora", "Time")}
                  value={`${booking.hora} – ${booking.hora_fin}`}
                />
                <DetailRow
                  icon={MapPin}
                  label={t("Clínica", "Clinic")}
                  value={`${booking.clinicName}${booking.clinicAddress ? ` · ${booking.clinicAddress}` : ""}`}
                />
                {booking.clinicPhone && (
                  <DetailRow
                    icon={Phone}
                    label={t("Teléfono", "Phone")}
                    value={booking.clinicPhone}
                  />
                )}
              </div>

              {booking.cancel_reason && (
                <p className="mt-4 text-xs text-red-600 bg-red-50 rounded-lg p-3">
                  {t("Motivo de cancelación", "Cancellation reason")}: {booking.cancel_reason}
                </p>
              )}
            </div>

            {/* Actions */}
            {booking.status !== "cancelled" && !actionResult && (
              <div className="flex gap-3">
                <button
                  onClick={() => setShowReschedule(true)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-celeste-dark text-celeste-dark font-semibold rounded-xl hover:bg-celeste-pale/30 transition"
                >
                  <RefreshCw className="w-4 h-4" />
                  {t("Reprogramar", "Reschedule")}
                </button>
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-red-300 text-red-600 font-semibold rounded-xl hover:bg-red-50 transition"
                >
                  <XCircle className="w-4 h-4" />
                  {t("Cancelar Turno", "Cancel")}
                </button>
              </div>
            )}

            {/* Cancel Confirmation Dialog */}
            {showCancelConfirm && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <h3 className="font-bold text-red-700 mb-2">
                  {t("¿Estás seguro/a?", "Are you sure?")}
                </h3>
                <p className="text-sm text-red-600 mb-4">
                  {t(
                    "Esta acción no se puede deshacer. Tu turno será cancelado.",
                    "This action cannot be undone. Your appointment will be cancelled.",
                  )}
                </p>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder={t("Motivo (opcional)", "Reason (optional)")}
                  className="w-full px-3 py-2 border border-red-200 rounded-lg text-sm mb-4 focus:ring-2 focus:ring-red-300 outline-none"
                  rows={2}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowCancelConfirm(false)}
                    className="flex-1 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-slate-50 transition"
                  >
                    {t("Volver", "Go back")}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={cancelling}
                    className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition disabled:opacity-50"
                  >
                    {cancelling ? (
                      <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                    ) : (
                      t("Sí, cancelar turno", "Yes, cancel")
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Reschedule Dialog */}
            {showReschedule && (
              <div className="bg-celeste-pale/20 border border-celeste/30 rounded-xl p-6">
                <h3 className="font-bold text-celeste-dark mb-2">
                  {t("Reprogramar turno", "Reschedule appointment")}
                </h3>
                <p className="text-sm text-ink-muted mb-4">
                  {t(
                    "Elegí una nueva fecha y hora. El turno anterior será cancelado.",
                    "Pick a new date and time. The previous appointment will be cancelled.",
                  )}
                </p>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="text-xs font-semibold text-ink-muted block mb-1">
                      {t("Nueva fecha", "New date")}
                    </label>
                    <input
                      type="date"
                      value={newFecha}
                      onChange={(e) => setNewFecha(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-celeste/40 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-ink-muted block mb-1">
                      {t("Nueva hora", "New time")}
                    </label>
                    <input
                      type="time"
                      value={newHora}
                      onChange={(e) => setNewHora(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-celeste/40 outline-none"
                    />
                  </div>
                </div>
                {error && (
                  <p className="mb-3 text-sm text-red-600 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" /> {error}
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowReschedule(false);
                      setError(null);
                    }}
                    className="flex-1 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-slate-50 transition"
                  >
                    {t("Cancelar", "Cancel")}
                  </button>
                  <button
                    onClick={handleReschedule}
                    disabled={rescheduling || !newFecha || !newHora}
                    className="flex-1 py-2.5 bg-celeste-dark text-white rounded-lg text-sm font-bold hover:bg-celeste transition disabled:opacity-50"
                  >
                    {rescheduling ? (
                      <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                    ) : (
                      t("Confirmar cambio", "Confirm change")
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-white mt-12">
        <div className="max-w-2xl mx-auto px-6 py-6 flex items-center justify-between">
          <p className="text-[11px] text-ink-muted">
            Powered by <span className="font-semibold text-celeste-dark">Cóndor Salud</span>
          </p>
          <div className="flex items-center gap-1 text-[11px] text-ink-muted">
            <Shield className="w-3 h-3" />
            {t("Datos protegidos", "Data protected")}
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── Detail Row Component ────────────────────────────────────

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
      <Icon className="w-4 h-4 text-celeste-dark shrink-0" />
      <span className="text-xs text-ink-muted w-24 shrink-0">{label}</span>
      <span className="text-sm text-ink font-medium">{value}</span>
    </div>
  );
}

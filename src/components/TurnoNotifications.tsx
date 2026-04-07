"use client";

// ─── Turno Notification Panel + Patient Card ─────────────────
// Shows real-time appointment notifications for doctors.
// When a new booking arrives or an appointment is upcoming,
// a toast slides in and the patient card auto-opens.

import { useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Bell,
  X,
  Clock,
  User,
  Phone,
  Mail,
  CreditCard,
  Calendar,
  AlertCircle,
  CheckCircle2,
  CalendarClock,
  ChevronRight,
} from "lucide-react";
import type { TurnoNotification } from "@/lib/services/realtime";
import { useLocale } from "@/lib/i18n/context";

// ─── Notification Toast List ─────────────────────────────────

interface NotificationToastListProps {
  notifications: TurnoNotification[];
  onDismiss: (id: string) => void;
  onDismissAll: () => void;
  onSelect: (notif: TurnoNotification) => void;
  unreadCount: number;
}

export function NotificationToastList({
  notifications,
  onDismiss,
  onDismissAll,
  onSelect,
  unreadCount,
}: NotificationToastListProps) {
  const { locale } = useLocale();
  const isEn = locale === "en";

  const visible = notifications.filter((n) => !n.dismissed).slice(0, 5);
  if (visible.length === 0) return null;

  const typeLabel = (type: TurnoNotification["type"]) => {
    switch (type) {
      case "new_booking":
        return isEn ? "New Appointment" : "Nuevo Turno";
      case "upcoming":
        return isEn ? "Upcoming" : "Próximo";
      case "status_change":
        return isEn ? "Status Change" : "Cambio de Estado";
    }
  };

  const typeIcon = (type: TurnoNotification["type"]) => {
    switch (type) {
      case "new_booking":
        return <Calendar className="w-4 h-4 text-celeste-dark" />;
      case "upcoming":
        return <CalendarClock className="w-4 h-4 text-amber-500" />;
      case "status_change":
        return <AlertCircle className="w-4 h-4 text-purple-500" />;
    }
  };

  const typeBg = (type: TurnoNotification["type"]) => {
    switch (type) {
      case "new_booking":
        return "border-celeste-dark bg-celeste-pale/50";
      case "upcoming":
        return "border-amber-400 bg-amber-50/50";
      case "status_change":
        return "border-purple-400 bg-purple-50/50";
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 w-80 space-y-2 pointer-events-none">
      {/* Header */}
      {visible.length > 1 && (
        <div className="pointer-events-auto flex items-center justify-between px-3 py-1.5 bg-white/90 backdrop-blur rounded-lg shadow-sm border border-border text-[10px]">
          <span className="font-bold text-ink-muted uppercase tracking-wider">
            {unreadCount} {isEn ? "notifications" : "notificaciones"}
          </span>
          <button
            onClick={onDismissAll}
            className="text-ink-muted hover:text-ink transition font-medium"
          >
            {isEn ? "Dismiss all" : "Cerrar todas"}
          </button>
        </div>
      )}

      {/* Toasts */}
      {visible.map((notif) => (
        <div
          key={notif.id}
          className={`pointer-events-auto border-l-[3px] rounded-lg shadow-lg bg-white p-3 cursor-pointer hover:shadow-xl transition-all animate-slide-in-right ${typeBg(notif.type)}`}
          onClick={() => onSelect(notif)}
          role="alert"
        >
          <div className="flex items-start gap-2.5">
            <div className="mt-0.5">{typeIcon(notif.type)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">
                  {typeLabel(notif.type)}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDismiss(notif.id);
                  }}
                  className="text-ink-muted hover:text-ink transition p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              <p className="text-sm font-semibold text-ink mt-0.5 truncate">{notif.paciente}</p>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-ink-light">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {notif.hora}
                </span>
                <span>·</span>
                <span>{notif.tipo}</span>
                {notif.durationMin && (
                  <>
                    <span>·</span>
                    <span>{notif.durationMin}′</span>
                  </>
                )}
              </div>
              <div className="text-[10px] text-ink-muted mt-0.5">
                {notif.financiador} · {notif.fecha}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Patient Detail Slide-in Card ────────────────────────────

interface PatientCardProps {
  notification: TurnoNotification;
  onClose: () => void;
}

export function PatientSlideCard({ notification, onClose }: PatientCardProps) {
  const { locale } = useLocale();
  const isEn = locale === "en";
  const cardRef = useRef<HTMLDivElement>(null);
  const patient = notification.patientDetail;

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Click outside to close
  const handleBackdrop = useCallback(
    (e: React.MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        onClose();
      }
    },
    [onClose],
  );

  const estadoBadge = (estado: string) => {
    const colors: Record<string, string> = {
      confirmado: "bg-green-50 text-green-700",
      pendiente: "bg-amber-50 text-amber-700",
      atendido: "bg-gray-100 text-gray-600",
      cancelado: "bg-red-50 text-red-600",
    };
    return colors[estado] || "bg-gray-100 text-gray-600";
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex justify-end bg-black/20 backdrop-blur-[2px]"
      onClick={handleBackdrop}
    >
      <div
        ref={cardRef}
        className="w-full max-w-sm bg-white shadow-2xl h-full overflow-y-auto animate-slide-in-right"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-border px-5 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-celeste-pale flex items-center justify-center">
              <User className="w-4 h-4 text-celeste-dark" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-ink">
                {isEn ? "Patient Info" : "Datos del Paciente"}
              </h2>
              <p className="text-[10px] text-ink-muted">
                {notification.type === "upcoming"
                  ? isEn
                    ? "Upcoming appointment"
                    : "Turno próximo"
                  : isEn
                    ? "New booking"
                    : "Nuevo turno"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-ink-muted hover:text-ink transition rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Appointment info */}
        <div className="px-5 py-4 border-b border-border bg-celeste-pale/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">
              {isEn ? "Appointment" : "Turno"}
            </span>
            <span
              className={`px-2 py-0.5 text-[10px] font-bold rounded capitalize ${estadoBadge(notification.estado)}`}
            >
              {notification.estado}
            </span>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-3.5 h-3.5 text-ink-muted" />
              <span className="font-semibold text-ink">{notification.fecha}</span>
              <span className="text-ink-muted">—</span>
              <span className="font-mono font-semibold text-ink">{notification.hora}</span>
              {notification.durationMin && (
                <span className="text-xs text-ink-light">({notification.durationMin} min)</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CreditCard className="w-3.5 h-3.5 text-ink-muted" />
              <span className="text-ink-light">{notification.tipo}</span>
              <span className="text-ink-muted">·</span>
              <span className="text-ink-light">{notification.financiador}</span>
            </div>
            {notification.notas && (
              <div className="text-xs text-ink-muted mt-1 italic">📝 {notification.notas}</div>
            )}
          </div>
        </div>

        {/* Patient details */}
        <div className="px-5 py-4">
          <div className="flex items-center gap-2 mb-3">
            <User className="w-4 h-4 text-celeste-dark" />
            <h3 className="text-xs font-bold text-ink-muted uppercase tracking-wider">
              {isEn ? "Patient" : "Paciente"}
            </h3>
          </div>

          {patient ? (
            <div className="space-y-3">
              <div>
                <p className="text-lg font-bold text-ink">{patient.nombre}</p>
                <p className="text-xs text-ink-muted">DNI: {patient.dni}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <InfoItem
                  icon={<CreditCard className="w-3.5 h-3.5" />}
                  label={isEn ? "Insurance" : "Financiador"}
                  value={patient.financiador}
                />
                <InfoItem
                  icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                  label={isEn ? "Plan" : "Plan"}
                  value={patient.plan || "—"}
                />
                <InfoItem
                  icon={<Phone className="w-3.5 h-3.5" />}
                  label={isEn ? "Phone" : "Teléfono"}
                  value={patient.telefono || "—"}
                />
                <InfoItem
                  icon={<Mail className="w-3.5 h-3.5" />}
                  label="Email"
                  value={patient.email || "—"}
                />
              </div>

              {patient.ultimaVisita && (
                <div className="text-xs text-ink-muted">
                  {isEn ? "Last visit:" : "Última visita:"}{" "}
                  <span className="font-medium text-ink">{patient.ultimaVisita}</span>
                </div>
              )}

              <Link
                href={`/dashboard/pacientes/${patient.id}`}
                className="flex items-center justify-center gap-2 w-full mt-3 px-4 py-2.5 text-xs font-semibold bg-celeste-dark text-white rounded-lg hover:bg-celeste transition"
              >
                {isEn ? "Open Full Record" : "Ver Ficha Completa"}
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <p className="text-lg font-bold text-ink">{notification.paciente}</p>
                <p className="text-xs text-ink-muted italic">
                  {isEn
                    ? "Patient not yet registered in the system"
                    : "Paciente aún no registrado en el sistema"}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <InfoItem
                  icon={<CreditCard className="w-3.5 h-3.5" />}
                  label={isEn ? "Insurance" : "Financiador"}
                  value={notification.financiador}
                />
                <InfoItem
                  icon={<Clock className="w-3.5 h-3.5" />}
                  label={isEn ? "Type" : "Tipo"}
                  value={notification.tipo}
                />
              </div>
              <Link
                href="/dashboard/pacientes"
                className="flex items-center justify-center gap-2 w-full mt-3 px-4 py-2.5 text-xs font-medium border border-border text-ink-light rounded-lg hover:border-celeste-dark hover:text-celeste-dark transition"
              >
                {isEn ? "Register Patient" : "Registrar Paciente"}
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Small info item ─────────────────────────────────────────

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <div className="flex items-center gap-1 text-[10px] text-ink-muted font-bold uppercase tracking-wider">
        {icon}
        {label}
      </div>
      <p className="text-xs font-medium text-ink truncate">{value}</p>
    </div>
  );
}

// ─── Notification Bell Badge (for nav bar) ───────────────────

export function TurnoNotificationBadge({
  count,
  onClick,
}: {
  count: number;
  onClick?: () => void;
}) {
  if (count === 0) return null;

  return (
    <button
      onClick={onClick}
      className="relative p-1.5 text-ink-muted hover:text-celeste-dark transition"
      title={`${count} notificaciones`}
    >
      <Bell className="w-5 h-5" />
      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
        {count > 9 ? "9+" : count}
      </span>
    </button>
  );
}

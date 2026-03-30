"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Pill,
  Shield,
  Copy,
  ExternalLink,
  Send,
  RefreshCw,
  Ban,
  Download,
  QrCode,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  User,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/components/Toast";
import { useLocale } from "@/lib/i18n/context";
import PrescriptionStatusBadge from "@/components/prescriptions/PrescriptionStatusBadge";

/* ── Types ──────────────────────────────────────────────── */
interface PrescriptionDetail {
  id: string;
  patientName: string;
  patientDni?: string;
  doctorName: string;
  doctorMatricula?: string;
  status: string;
  issuedAt: string;
  expiresAt?: string;
  verificationToken: string;
  coverageName?: string;
  coveragePlan?: string;
  coverageNumber?: string;
  diagnosis?: string;
  notes?: string;
  osde?: { status: string; registeredAt?: string; groupIdentifier?: string };
  rcta?: {
    status: string;
    prescriptionId?: string;
    pdfUrl?: string;
    error?: string;
    issuedAt?: string;
    expiresAt?: string;
  };
  medications: {
    medicationName: string;
    genericName?: string;
    dosage: string;
    frequency: string;
    duration?: string;
    quantity?: number;
    notes?: string;
    troquel?: string;
  }[];
  auditTrail: {
    action: string;
    timestamp: string;
    actor: string;
    detail?: string;
  }[];
}

/* ── No demo data – real prescriptions come from API ── */

export default function RecetaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { showToast } = useToast();
  const { locale } = useLocale();
  const [rx, setRx] = useState<PrescriptionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [rxId, setRxId] = useState<string>("");

  useEffect(() => {
    params.then(({ id }) => {
      setRxId(id);
      fetch(`/api/prescriptions/${id}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.prescription) {
            setRx(data.prescription);
          } else {
            setRx(null);
          }
        })
        .catch(() => {
          setRx(null);
        })
        .finally(() => setLoading(false));
    });
  }, [params]);

  function copyVerificationUrl() {
    if (!rx) return;
    const url = `${window.location.origin}/rx/${rx.verificationToken}`;
    navigator.clipboard.writeText(url);
    showToast("URL de verificacion copiada");
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString(locale === "en" ? "en-US" : "es-AR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatDateShort(iso: string) {
    return new Date(iso).toLocaleDateString(locale === "en" ? "en-US" : "es-AR", {
      day: "2-digit",
      month: "short",
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-celeste border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!rx) {
    return (
      <div className="text-center py-24">
        <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
        <h1 className="text-xl font-display font-bold text-ink mb-2">Receta no encontrada</h1>
        <p className="text-sm text-ink/50 mb-6">No se encontro la receta con ID {rxId}</p>
        <Link
          href="/dashboard/recetas"
          className="inline-flex items-center gap-2 bg-celeste-dark text-white text-sm font-semibold px-5 py-2.5 rounded-[4px] transition hover:bg-celeste-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al historial
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/recetas"
            className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-border transition"
          >
            <ArrowLeft className="w-4 h-4 text-ink/50" />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-display font-bold text-ink">{rx.patientName}</h1>
              <PrescriptionStatusBadge status={rx.status} osde={rx.osde} rcta={rx.rcta} />
            </div>
            <p className="text-xs text-ink/50">
              ID: <span className="font-mono">{rx.id}</span> — Emitida {formatDate(rx.issuedAt)}
            </p>
          </div>
        </div>
        {/* Action bar */}
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/recetas/nueva?repeat=${rx.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold border border-border text-ink/70 px-3 py-2 rounded-md hover:bg-surface transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Repetir
          </Link>
          {rx.status !== "cancelled" && rx.status !== "expired" && rx.status !== "dispensed" && (
            <button
              onClick={async () => {
                if (!confirm("¿Anular esta receta? Esta acción no se puede deshacer.")) return;
                try {
                  const res = await fetch(`/api/prescriptions/${rx.id}/cancel`, { method: "POST" });
                  if (res.ok) {
                    setRx((prev) => (prev ? { ...prev, status: "cancelled" } : prev));
                    showToast("Receta anulada exitosamente");
                  } else {
                    showToast("Error al anular la receta", "error");
                  }
                } catch {
                  showToast("Error al anular la receta", "error");
                }
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 border border-red-200 px-3 py-2 rounded-md hover:bg-red-50 transition"
            >
              <Ban className="w-3.5 h-3.5" />
              Anular
            </button>
          )}
          {rx.rcta?.pdfUrl && (
            <a
              href={rx.rcta.pdfUrl}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-1.5 text-xs font-semibold bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition"
            >
              <Download className="w-3.5 h-3.5" />
              PDF RCTA
            </a>
          )}
          {(rx.status === "active" || rx.status === "sent") && (
            <button
              onClick={async () => {
                try {
                  const res = await fetch(`/api/prescriptions/${rx.id}/send`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ via: ["whatsapp"] }),
                  });
                  if (res.ok) {
                    setRx((prev) => (prev ? { ...prev, status: "sent" } : prev));
                    showToast("Receta enviada por WhatsApp");
                  } else {
                    showToast("Error al enviar la receta", "error");
                  }
                } catch {
                  showToast("Error al enviar la receta", "error");
                }
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition"
            >
              <Send className="w-3.5 h-3.5" />
              WhatsApp
            </button>
          )}
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* LEFT — Clinical Data (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Patient Info */}
          <div className="bg-white border border-border rounded-xl p-5">
            <h2 className="text-[10px] font-bold text-ink/50 uppercase tracking-wider flex items-center gap-2 mb-4">
              <User className="w-3.5 h-3.5" />
              Datos del Paciente
            </h2>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-ink/40 text-xs">Nombre</span>
                <p className="font-semibold text-ink">{rx.patientName}</p>
              </div>
              {rx.patientDni && (
                <div>
                  <span className="text-ink/40 text-xs">DNI</span>
                  <p className="font-semibold text-ink font-mono">{rx.patientDni}</p>
                </div>
              )}
              {rx.diagnosis && (
                <div className="sm:col-span-2">
                  <span className="text-ink/40 text-xs">Diagnostico</span>
                  <p className="font-semibold text-ink">{rx.diagnosis}</p>
                </div>
              )}
              <div>
                <span className="text-ink/40 text-xs">Prescriptor</span>
                <p className="font-semibold text-ink">{rx.doctorName}</p>
                {rx.doctorMatricula && (
                  <p className="text-[10px] text-ink/40 font-mono">{rx.doctorMatricula}</p>
                )}
              </div>
              {rx.coverageName && (
                <div>
                  <span className="text-ink/40 text-xs">Cobertura</span>
                  <p className="font-semibold text-ink">{rx.coverageName}</p>
                  {rx.coverageNumber && (
                    <p className="text-[10px] text-ink/40 font-mono">
                      Afiliado: {rx.coverageNumber}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Medications */}
          <div className="bg-white border border-border rounded-xl p-5">
            <h2 className="text-[10px] font-bold text-ink/50 uppercase tracking-wider flex items-center gap-2 mb-4">
              <Pill className="w-3.5 h-3.5" />
              Medicamentos ({rx.medications.length}/3)
            </h2>
            <div className="space-y-3">
              {rx.medications.map((m, idx) => (
                <div key={idx} className="bg-surface rounded-lg p-4 border border-border/50">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-ink">{m.medicationName}</p>
                      {m.genericName && (
                        <p className="text-xs text-ink/50">Generico: {m.genericName}</p>
                      )}
                    </div>
                    {m.troquel && (
                      <span className="text-[10px] font-mono text-ink/40 bg-white px-2 py-0.5 rounded border border-border/50">
                        Troquel: {m.troquel}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
                    <div>
                      <span className="text-[10px] text-ink/40">Dosis</span>
                      <p className="text-xs font-semibold text-ink">{m.dosage}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-ink/40">Frecuencia</span>
                      <p className="text-xs font-semibold text-ink">{m.frequency}</p>
                    </div>
                    {m.duration && (
                      <div>
                        <span className="text-[10px] text-ink/40">Duracion</span>
                        <p className="text-xs font-semibold text-ink">{m.duration}</p>
                      </div>
                    )}
                    {m.quantity && (
                      <div>
                        <span className="text-[10px] text-ink/40">Cantidad</span>
                        <p className="text-xs font-semibold text-ink">{m.quantity} unidades</p>
                      </div>
                    )}
                  </div>
                  {m.notes && <p className="text-xs text-ink/50 mt-2 italic">{m.notes}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          {rx.notes && (
            <div className="bg-white border border-border rounded-xl p-5">
              <h2 className="text-[10px] font-bold text-ink/50 uppercase tracking-wider flex items-center gap-2 mb-3">
                <FileText className="w-3.5 h-3.5" />
                Indicaciones
              </h2>
              <p className="text-sm text-ink/70">{rx.notes}</p>
            </div>
          )}
        </div>

        {/* RIGHT — Registration & Verification (1 col) */}
        <div className="space-y-6">
          {/* QR Verification */}
          {rx.status !== "draft" && (
            <div className="bg-white border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <QrCode className="w-5 h-5 text-celeste-dark" />
                <span className="text-xs font-bold text-ink uppercase">Verificacion QR</span>
              </div>
              <div className="flex items-center gap-2 bg-surface border border-border rounded-lg px-3 py-2">
                <code className="text-[10px] text-ink/60 flex-1 truncate">
                  {typeof window !== "undefined"
                    ? `${window.location.origin}/rx/${rx.verificationToken}`
                    : `/rx/${rx.verificationToken}`}
                </code>
                <button
                  onClick={copyVerificationUrl}
                  className="p-1 hover:bg-white rounded transition shrink-0"
                  title="Copiar URL"
                >
                  <Copy className="w-3.5 h-3.5 text-ink/50" />
                </button>
                <a
                  href={`/rx/${rx.verificationToken}`}
                  target="_blank"
                  rel="noopener"
                  className="p-1 hover:bg-white rounded transition shrink-0"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-ink/50" />
                </a>
              </div>
            </div>
          )}

          {/* Validity */}
          <div className="bg-white border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-ink/40" />
              <span className="text-xs font-bold text-ink uppercase">Vigencia</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-ink/50">Emitida</span>
                <span className="font-semibold text-ink">{formatDate(rx.issuedAt)}</span>
              </div>
              {rx.expiresAt && (
                <div className="flex justify-between">
                  <span className="text-ink/50">Vence</span>
                  <span className="font-semibold text-ink">{formatDate(rx.expiresAt)}</span>
                </div>
              )}
            </div>
          </div>

          {/* RCTA Registration */}
          {rx.rcta && (
            <div
              className={`border rounded-xl p-5 ${
                rx.rcta.status === "registered"
                  ? "bg-green-50 border-green-200"
                  : rx.rcta.status === "pending_credentials"
                    ? "bg-amber-50 border-amber-200"
                    : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <Shield
                  className={`w-4 h-4 ${
                    rx.rcta.status === "registered"
                      ? "text-green-600"
                      : rx.rcta.status === "pending_credentials"
                        ? "text-amber-600"
                        : "text-red-600"
                  }`}
                />
                <span className="text-xs font-bold uppercase">RCTA QBI2</span>
              </div>
              {rx.rcta.status === "registered" && (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-green-700/70">ID Prescripcion</span>
                    <span className="font-mono font-semibold text-green-800">
                      {rx.rcta.prescriptionId}
                    </span>
                  </div>
                  {rx.rcta.issuedAt && (
                    <div className="flex justify-between">
                      <span className="text-green-700/70">Registrada</span>
                      <span className="text-green-800">{formatDateShort(rx.rcta.issuedAt)}</span>
                    </div>
                  )}
                  {rx.rcta.pdfUrl && (
                    <a
                      href={rx.rcta.pdfUrl}
                      target="_blank"
                      rel="noopener"
                      className="inline-flex items-center gap-1.5 text-green-700 font-semibold hover:underline mt-1"
                    >
                      <Download className="w-3 h-3" />
                      Descargar PDF RCTA
                    </a>
                  )}
                </div>
              )}
              {rx.rcta.status === "pending_credentials" && (
                <p className="text-xs text-amber-800">
                  Credenciales RCTA pendientes. Solicitar a Innovamed:{" "}
                  <a
                    href="https://wa.me/5491121935123"
                    target="_blank"
                    rel="noopener"
                    className="underline font-semibold"
                  >
                    wa.me/5491121935123
                  </a>
                </p>
              )}
              {rx.rcta.status === "error" && (
                <p className="text-xs text-red-800">
                  Error al registrar: {rx.rcta.error || "Error desconocido"}. PDF generado como
                  respaldo.
                </p>
              )}
            </div>
          )}

          {/* OSDE Registration */}
          {rx.osde && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-blue-800 uppercase">OSDE FHIR 4.0</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-blue-700/70">Estado</span>
                  <span className="font-semibold text-blue-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {rx.osde.status === "registered" ? "Registrada" : rx.osde.status}
                  </span>
                </div>
                {rx.osde.groupIdentifier && (
                  <div className="flex justify-between">
                    <span className="text-blue-700/70">Group ID</span>
                    <span className="font-mono text-blue-800 text-[10px]">
                      {rx.osde.groupIdentifier}
                    </span>
                  </div>
                )}
                {rx.osde.registeredAt && (
                  <div className="flex justify-between">
                    <span className="text-blue-700/70">Registrada</span>
                    <span className="text-blue-800">{formatDateShort(rx.osde.registeredAt)}</span>
                  </div>
                )}
              </div>
              <p className="text-[10px] text-blue-700/60 mt-3">
                Conforme Res. MSN 1314/2023 — FHIR HL7 4.0
              </p>
            </div>
          )}

          {/* No registration */}
          {!rx.osde && !rx.rcta && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold text-amber-800 uppercase">Solo PDF</span>
              </div>
              <p className="text-xs text-amber-700">
                Esta receta no fue registrada electronicamente. Se genero PDF como respaldo.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Audit Trail ── */}
      {rx.auditTrail && rx.auditTrail.length > 0 && (
        <div className="bg-white border border-border rounded-xl p-5">
          <h2 className="text-[10px] font-bold text-ink/50 uppercase tracking-wider flex items-center gap-2 mb-4">
            <Clock className="w-3.5 h-3.5" />
            Historial de Eventos
          </h2>
          <div className="relative">
            <div className="absolute left-3 top-0 bottom-0 w-px bg-border" />
            <div className="space-y-4">
              {rx.auditTrail.map((event, idx) => {
                const iconMap: Record<string, typeof CheckCircle2> = {
                  created: FileText,
                  issued: CheckCircle2,
                  osde_registered: Shield,
                  rcta_registered: Shield,
                  sent_whatsapp: Send,
                  cancelled: XCircle,
                };
                const Icon = iconMap[event.action] || Clock;

                return (
                  <div key={idx} className="flex items-start gap-3 relative pl-7">
                    <div className="absolute left-1.5 w-3 h-3 rounded-full bg-white border-2 border-celeste flex items-center justify-center">
                      <div className="w-1 h-1 bg-celeste rounded-full" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Icon className="w-3 h-3 text-ink/40" />
                        <span className="text-xs font-semibold text-ink">
                          {event.detail || event.action}
                        </span>
                      </div>
                      <p className="text-[10px] text-ink/40 mt-0.5">
                        {formatDate(event.timestamp)} — {event.actor}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

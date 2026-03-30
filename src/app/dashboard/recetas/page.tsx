"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Plus,
  QrCode,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Copy,
  ExternalLink,
  Send,
  RefreshCw,
  Ban,
  Shield,
  FileEdit,
  ChevronDown,
  ChevronUp,
  Calendar,
  TrendingUp,
  Pill,
  Filter,
  Download,
} from "lucide-react";
import { useToast } from "@/components/Toast";
import { useLocale } from "@/lib/i18n/context";
import PrescriptionStatusBadge from "@/components/prescriptions/PrescriptionStatusBadge";

/* ── Types ──────────────────────────────────────────────── */
interface PrescriptionRow {
  id: string;
  patientName: string;
  patientDni?: string;
  doctorName: string;
  status: string;
  issuedAt: string;
  verificationToken: string;
  coverageName?: string;
  diagnosis?: string;
  osde?: { status: string };
  rcta?: { status: string; prescriptionId?: string; pdfUrl?: string };
  medications: {
    medicationName: string;
    dosage: string;
    frequency: string;
    genericName?: string;
  }[];
}

type StatusFilter = "all" | "draft" | "active" | "sent" | "dispensed" | "expired" | "cancelled";
type CoverageFilter = "all" | "osde" | "obra_social" | "prepaga" | "particular";

const STATUS_TABS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "Todas" },
  { key: "draft", label: "Borradores" },
  { key: "active", label: "Activas" },
  { key: "sent", label: "Enviadas" },
  { key: "dispensed", label: "Dispensadas" },
];

const COVERAGE_FILTERS: { key: CoverageFilter; label: string }[] = [
  { key: "all", label: "Todas" },
  { key: "osde", label: "OSDE" },
  { key: "obra_social", label: "Obra Social" },
  { key: "prepaga", label: "Prepaga" },
  { key: "particular", label: "Particular" },
];

const PREPAGA_NAMES = [
  "swiss medical",
  "galeno",
  "medicus",
  "omint",
  "medife",
  "hospital italiano",
];
const OBRA_SOCIAL_NAMES = ["pami", "ioma", "osecac", "union personal", "accord salud"];

function getCoverageType(name?: string): CoverageFilter {
  if (!name) return "particular";
  const lower = name.toLowerCase();
  if (lower.includes("osde")) return "osde";
  if (PREPAGA_NAMES.some((p) => lower.includes(p))) return "prepaga";
  if (OBRA_SOCIAL_NAMES.some((o) => lower.includes(o))) return "obra_social";
  return "particular";
}

// ─── No demo data – real prescriptions come from API ─────────

export default function RecetasPage() {
  const { showToast } = useToast();
  const { t, locale } = useLocale();
  const [prescriptions, setPrescriptions] = useState<PrescriptionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [coverageFilter, setCoverageFilter] = useState<CoverageFilter>("all");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // ── Fetch prescriptions from API ─────────────────────
  const fetchPrescriptions = useCallback(async () => {
    try {
      const res = await fetch("/api/prescriptions");
      if (res.ok) {
        const data = await res.json();
        setPrescriptions(data.prescriptions || []);
      }
    } catch {
      // Silent — show empty
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrescriptions();
  }, [fetchPrescriptions]);

  const filtered = useMemo(() => {
    return prescriptions.filter((p) => {
      const matchesSearch =
        !search ||
        p.patientName.toLowerCase().includes(search.toLowerCase()) ||
        (p.patientDni && p.patientDni.includes(search)) ||
        p.medications.some((m) => m.medicationName.toLowerCase().includes(search.toLowerCase()));
      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
      const matchesCoverage =
        coverageFilter === "all" || getCoverageType(p.coverageName) === coverageFilter;
      return matchesSearch && matchesStatus && matchesCoverage;
    });
  }, [prescriptions, search, statusFilter, coverageFilter]);

  const counts = {
    all: prescriptions.length,
    draft: prescriptions.filter((p) => p.status === "draft").length,
    active: prescriptions.filter((p) => p.status === "active").length,
    sent: prescriptions.filter((p) => p.status === "sent").length,
    dispensed: prescriptions.filter((p) => p.status === "dispensed").length,
  };

  /* ── Stats ── */
  const thisMonth = prescriptions.filter((p) => {
    const d = new Date(p.issuedAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const drugCounts: Record<string, number> = {};
  prescriptions.forEach((p) =>
    p.medications.forEach((m) => {
      const name = m.genericName || m.medicationName;
      drugCounts[name] = (drugCounts[name] || 0) + 1;
    }),
  );
  const topDrug = Object.entries(drugCounts).sort(([, a], [, b]) => b - a)[0];
  const rctaRegistered = prescriptions.filter((p) => p.rcta?.status === "registered").length;
  const osdeRegistered = prescriptions.filter((p) => p.osde?.status === "registered").length;

  function copyVerificationUrl(token: string) {
    const url = `${window.location.origin}/rx/${token}`;
    navigator.clipboard.writeText(url);
    showToast(t("toast.recetas.urlCopied"));
  }

  async function handleAction(rxId: string, action: "issue" | "send" | "cancel" | "repeat") {
    try {
      const via = action === "send" ? { via: ["whatsapp"] } : {};
      const res = await fetch(`/api/prescriptions/${rxId}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(via),
      });

      if (!res.ok) throw new Error("Action failed");

      const data = await res.json();

      if (action === "repeat" && data.prescription) {
        setPrescriptions((prev) => [
          {
            id: data.prescription.id,
            patientName: prev.find((p) => p.id === rxId)?.patientName || "Paciente",
            doctorName: "Dra. Rodriguez",
            status: "draft",
            issuedAt: new Date().toISOString(),
            verificationToken: data.prescription.verificationToken || `repeat-${Date.now()}`,
            medications: prev.find((p) => p.id === rxId)?.medications || [],
            coverageName: prev.find((p) => p.id === rxId)?.coverageName,
          },
          ...prev,
        ]);
        showToast(t("toast.recetas.repeatDraft"));
        return;
      }

      const statusMap: Record<string, string> = {
        issue: "active",
        send: "sent",
        cancel: "cancelled",
      };
      setPrescriptions((prev) =>
        prev.map((p) => (p.id === rxId ? { ...p, status: statusMap[action] || p.status } : p)),
      );

      const msgMap: Record<string, string> = {
        issue: "Receta emitida exitosamente",
        send: "Receta enviada al paciente",
        cancel: "Receta anulada",
      };
      showToast(msgMap[action] || "Accion completada");
    } catch {
      showToast("Error al procesar la receta. Intente nuevamente.", "error");
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString(locale === "en" ? "en-US" : "es-AR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">Recetas Digitales</h1>
          <p className="text-sm text-ink/60 mt-0.5">
            Gestion completa del ciclo de vida de prescripciones
          </p>
        </div>
        <Link
          href="/dashboard/recetas/nueva"
          className="inline-flex items-center gap-2 bg-celeste-dark hover:bg-celeste-700 text-white text-sm font-semibold px-5 py-2.5 rounded-[4px] transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          Nueva Receta
        </Link>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-celeste border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && (
        <>
          {/* ── Stats Bar ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 text-ink/50 mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase">Este mes</span>
              </div>
              <p className="text-2xl font-bold text-ink">{thisMonth.length}</p>
              <p className="text-[10px] text-ink/40">prescripciones emitidas</p>
            </div>
            <div className="bg-white border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 text-ink/50 mb-1">
                <Pill className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase">Mas prescripto</span>
              </div>
              <p className="text-lg font-bold text-ink truncate">{topDrug?.[0] ?? "—"}</p>
              <p className="text-[10px] text-ink/40">
                {topDrug ? `${topDrug[1]} recetas` : "sin datos"}
              </p>
            </div>
            <div className="bg-white border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 text-green-600 mb-1">
                <Shield className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase">RCTA Registradas</span>
              </div>
              <p className="text-2xl font-bold text-green-700">{rctaRegistered}</p>
              <p className="text-[10px] text-ink/40">via QBI2 Innovamed</p>
            </div>
            <div className="bg-white border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 text-blue-600 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase">OSDE Registradas</span>
              </div>
              <p className="text-2xl font-bold text-blue-700">{osdeRegistered}</p>
              <p className="text-[10px] text-ink/40">via FHIR 4.0</p>
            </div>
          </div>

          {/* ── Filters Row ── */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Status Tabs */}
            <div className="flex items-center gap-1 bg-surface p-1 rounded-lg overflow-x-auto flex-1">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setStatusFilter(tab.key)}
                  className={`px-4 py-2 text-xs font-semibold rounded-md transition whitespace-nowrap ${
                    statusFilter === tab.key
                      ? "bg-white text-ink shadow-sm"
                      : "text-ink/50 hover:text-ink/70"
                  }`}
                >
                  {tab.label}
                  <span className="ml-1.5 text-[10px] opacity-60">
                    {counts[tab.key as keyof typeof counts] ?? ""}
                  </span>
                </button>
              ))}
            </div>

            {/* Coverage + Filters toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg border transition ${
                showFilters || coverageFilter !== "all"
                  ? "bg-celeste/10 border-celeste text-celeste-dark"
                  : "border-border text-ink/60 hover:bg-surface"
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              Filtros
              {coverageFilter !== "all" && (
                <span className="bg-celeste text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  1
                </span>
              )}
            </button>
          </div>

          {/* ── Sidebar Filters Panel ── */}
          {showFilters && (
            <div className="bg-surface/50 border border-border rounded-xl p-4 flex flex-wrap gap-4 items-end">
              <div>
                <label className="text-[10px] font-bold text-ink/50 uppercase block mb-1.5">
                  Cobertura
                </label>
                <div className="flex items-center gap-1">
                  {COVERAGE_FILTERS.map((cf) => (
                    <button
                      key={cf.key}
                      onClick={() => setCoverageFilter(cf.key)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                        coverageFilter === cf.key
                          ? "bg-white text-ink shadow-sm"
                          : "text-ink/50 hover:text-ink/70 hover:bg-white/50"
                      }`}
                    >
                      {cf.label}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={() => {
                  setStatusFilter("all");
                  setCoverageFilter("all");
                  setSearch("");
                }}
                className="text-xs text-red-500 hover:text-red-700 font-semibold"
              >
                Limpiar filtros
              </button>
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40" />
            <input
              type="text"
              placeholder="Buscar por paciente, DNI o medicamento..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-celeste/40"
            />
          </div>

          {/* ── Results summary ── */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-ink/50">
              {filtered.length} receta{filtered.length !== 1 ? "s" : ""}
              {statusFilter !== "all" || coverageFilter !== "all" ? " (filtradas)" : ""}
            </p>
          </div>

          {/* Prescriptions List */}
          {filtered.length === 0 ? (
            <div className="text-center py-16 bg-surface rounded-2xl">
              <QrCode className="w-12 h-12 text-ink/20 mx-auto mb-3" />
              <p className="font-semibold text-ink">No hay recetas</p>
              <p className="text-sm text-ink/50 mt-1">
                {statusFilter !== "all" || coverageFilter !== "all"
                  ? "No hay recetas que coincidan con los filtros seleccionados"
                  : "Crea tu primera receta digital con codigo QR"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((rx) => {
                const isExpanded = expandedRow === rx.id;

                return (
                  <div
                    key={rx.id}
                    className="bg-white border border-border rounded-xl overflow-hidden hover:shadow-sm transition"
                  >
                    {/* Main row */}
                    <div
                      className="flex items-center gap-4 px-4 py-3 cursor-pointer"
                      onClick={() => setExpandedRow(isExpanded ? null : rx.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <Link
                            href={`/dashboard/recetas/${rx.id}`}
                            className="font-semibold text-sm text-ink truncate hover:text-celeste-dark transition"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {rx.patientName}
                          </Link>
                          {rx.patientDni && (
                            <span className="text-[10px] text-ink/40 font-mono">
                              DNI {rx.patientDni}
                            </span>
                          )}
                          <PrescriptionStatusBadge
                            status={rx.status}
                            osde={rx.osde}
                            rcta={rx.rcta}
                            compact
                          />
                        </div>
                        <div className="flex items-center gap-2 text-xs text-ink/50">
                          <span className="truncate">
                            {rx.medications.map((m) => m.medicationName).join(" + ")}
                          </span>
                          <span className="shrink-0">— {formatDate(rx.issuedAt)}</span>
                        </div>
                        {rx.diagnosis && (
                          <p className="text-[10px] text-ink/40 mt-0.5 truncate">{rx.diagnosis}</p>
                        )}
                      </div>

                      {/* Quick actions */}
                      <div
                        className="flex items-center gap-1 shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {rx.status === "draft" && (
                          <button
                            onClick={() => handleAction(rx.id, "issue")}
                            className="p-1.5 hover:bg-green-50 rounded transition text-green-600"
                            title="Emitir receta"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                        {(rx.status === "active" || rx.status === "sent") && (
                          <button
                            onClick={() => handleAction(rx.id, "send")}
                            className="p-1.5 hover:bg-blue-50 rounded transition text-blue-600"
                            title="Enviar al paciente"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}
                        {rx.status !== "cancelled" && rx.status !== "expired" && (
                          <button
                            onClick={() => copyVerificationUrl(rx.verificationToken)}
                            className="p-1.5 hover:bg-surface rounded transition"
                            title="Copiar URL QR"
                          >
                            <Copy className="w-3.5 h-3.5 text-ink/50" />
                          </button>
                        )}
                        <button
                          onClick={() => handleAction(rx.id, "repeat")}
                          className="p-1.5 hover:bg-surface rounded transition"
                          title="Repetir receta"
                        >
                          <RefreshCw className="w-3.5 h-3.5 text-ink/50" />
                        </button>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-ink/30" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-ink/30" />
                        )}
                      </div>
                    </div>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="border-t border-border/50 px-4 py-3 bg-surface/30">
                        <div className="grid sm:grid-cols-2 gap-4">
                          {/* Medications detail */}
                          <div>
                            <p className="text-[10px] font-bold text-ink/50 uppercase mb-2">
                              Medicamentos ({rx.medications.length}/3)
                            </p>
                            <div className="space-y-1.5">
                              {rx.medications.map((m, idx) => (
                                <div
                                  key={idx}
                                  className="bg-white rounded-lg px-3 py-2 border border-border/50"
                                >
                                  <p className="text-xs font-semibold text-ink">
                                    {m.medicationName}
                                  </p>
                                  {m.genericName && (
                                    <p className="text-[10px] text-ink/40">
                                      Generico: {m.genericName}
                                    </p>
                                  )}
                                  <p className="text-[10px] text-ink/50">
                                    {m.dosage} — {m.frequency}
                                  </p>
                                </div>
                              ))}
                            </div>
                            {rx.diagnosis && (
                              <div className="mt-3">
                                <p className="text-[10px] font-bold text-ink/50 uppercase mb-1">
                                  Diagnostico
                                </p>
                                <p className="text-xs text-ink/70">{rx.diagnosis}</p>
                              </div>
                            )}
                          </div>

                          {/* Actions & Registration */}
                          <div className="space-y-3">
                            <div>
                              <p className="text-[10px] font-bold text-ink/50 uppercase mb-2">
                                Acciones
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {rx.status === "draft" && (
                                  <button
                                    onClick={() => handleAction(rx.id, "issue")}
                                    className="inline-flex items-center gap-1.5 text-xs font-semibold bg-green-600 text-white px-3 py-1.5 rounded-md hover:bg-green-700 transition"
                                  >
                                    <CheckCircle2 className="w-3 h-3" />
                                    Emitir
                                  </button>
                                )}
                                {(rx.status === "active" || rx.status === "sent") && (
                                  <>
                                    <button
                                      onClick={() => handleAction(rx.id, "send")}
                                      className="inline-flex items-center gap-1.5 text-xs font-semibold bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition"
                                    >
                                      <Send className="w-3 h-3" />
                                      Enviar WhatsApp
                                    </button>
                                    <a
                                      href={`/rx/${rx.verificationToken}`}
                                      target="_blank"
                                      rel="noopener"
                                      className="inline-flex items-center gap-1.5 text-xs font-semibold border border-border text-ink/70 px-3 py-1.5 rounded-md hover:bg-surface transition"
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                      Ver receta
                                    </a>
                                  </>
                                )}
                                {rx.rcta?.pdfUrl && (
                                  <a
                                    href={rx.rcta.pdfUrl}
                                    target="_blank"
                                    rel="noopener"
                                    className="inline-flex items-center gap-1.5 text-xs font-semibold border border-border text-ink/70 px-3 py-1.5 rounded-md hover:bg-surface transition"
                                  >
                                    <Download className="w-3 h-3" />
                                    PDF RCTA
                                  </a>
                                )}
                                <button
                                  onClick={() => handleAction(rx.id, "repeat")}
                                  className="inline-flex items-center gap-1.5 text-xs font-semibold border border-border text-ink/70 px-3 py-1.5 rounded-md hover:bg-surface transition"
                                >
                                  <RefreshCw className="w-3 h-3" />
                                  Repetir
                                </button>
                                {rx.status !== "cancelled" &&
                                  rx.status !== "expired" &&
                                  rx.status !== "dispensed" && (
                                    <button
                                      onClick={() => handleAction(rx.id, "cancel")}
                                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 border border-red-200 px-3 py-1.5 rounded-md hover:bg-red-50 transition"
                                    >
                                      <Ban className="w-3 h-3" />
                                      Anular
                                    </button>
                                  )}
                              </div>
                            </div>

                            {/* RCTA Registration */}
                            {rx.rcta && rx.rcta.status === "registered" && (
                              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                <div className="flex items-center gap-1.5 mb-1">
                                  <Shield className="w-3.5 h-3.5 text-green-600" />
                                  <span className="text-[10px] font-bold text-green-800 uppercase">
                                    RCTA QBI2
                                  </span>
                                </div>
                                <p className="text-[11px] text-green-700">
                                  Registrada en RCTA — ID:{" "}
                                  <span className="font-mono font-semibold">
                                    {rx.rcta.prescriptionId}
                                  </span>
                                </p>
                              </div>
                            )}

                            {rx.rcta && rx.rcta.status === "pending_credentials" && (
                              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                <div className="flex items-center gap-1.5 mb-1">
                                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                                  <span className="text-[10px] font-bold text-amber-800 uppercase">
                                    Credenciales RCTA pendientes
                                  </span>
                                </div>
                                <p className="text-[11px] text-amber-700">
                                  PDF generado. Solicitar credenciales Innovamed:{" "}
                                  <a
                                    href="https://wa.me/5491121935123"
                                    target="_blank"
                                    rel="noopener"
                                    className="underline font-semibold"
                                  >
                                    wa.me/5491121935123
                                  </a>
                                </p>
                              </div>
                            )}

                            {rx.rcta && rx.rcta.status === "error" && (
                              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <div className="flex items-center gap-1.5 mb-1">
                                  <XCircle className="w-3.5 h-3.5 text-red-600" />
                                  <span className="text-[10px] font-bold text-red-800 uppercase">
                                    Error RCTA
                                  </span>
                                </div>
                                <p className="text-[11px] text-red-700">
                                  No se pudo registrar en RCTA. Se genero PDF de respaldo.
                                </p>
                              </div>
                            )}

                            {/* OSDE Info */}
                            {rx.osde && (
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <div className="flex items-center gap-1.5 mb-1">
                                  <Shield className="w-3.5 h-3.5 text-blue-600" />
                                  <span className="text-[10px] font-bold text-blue-800 uppercase">
                                    OSDE FHIR 4.0
                                  </span>
                                </div>
                                <p className="text-[11px] text-blue-700">
                                  Prescripcion registrada en el sistema electronico de OSDE.
                                  Conforme Res. MSN 1314/2023.
                                </p>
                              </div>
                            )}

                            {/* Coverage */}
                            {rx.coverageName && (
                              <p className="text-[11px] text-ink/50">
                                Cobertura: <span className="font-semibold">{rx.coverageName}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Pagination } from "@/components/ui/Pagination";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/components/Toast";
import { useExport } from "@/lib/services/export";
import { Card, CardContent, StatusBadge, PageHeader, Input, Select, Button } from "@/components/ui";
import {
  useLeads,
  useLeadStats,
  useConversations,
  useMessages,
  useSendMessage,
  useUpdateLead,
} from "@/lib/hooks/useCRM";
import { useCrudAction } from "@/hooks/use-crud-action";
import { useIsDemo, useAuth } from "@/lib/auth/context";
import { useLocale } from "@/lib/i18n/context";
import { usePacientes, useTurnos } from "@/hooks/use-data";
import type { Lead, LeadEstado, Conversation } from "@/lib/types";
import { analytics } from "@/lib/analytics";
import { bodySystems, severityLabels, frequencyOptions } from "@/lib/services/triage";

// ─── Patient display type ───────────────────────────────────
interface PacienteDisplay {
  id: string;
  nombre: string;
  apellido: string;
  dni: string;
  edad: number;
  sexo: string;
  financiador: string;
  plan: string;
  telefono: string;
  email: string | null;
  ultimaVisita: string;
  estado: "activo" | "inactivo";
  turnos: number;
}

// ─── NOTE: No hardcoded patient data. ────────────────────────
// Authenticated users see real data from Supabase via usePacientes().
// Demo/marketing mock data lives only in src/lib/services/data.ts
// (returned when isSupabaseConfigured() === false).

const financiadores = [
  { value: "Todos", label: "Todos" },
  { value: "PAMI", label: "PAMI" },
  { value: "OSDE 310", label: "OSDE 310" },
  { value: "OSDE 210", label: "OSDE 210" },
  { value: "Swiss Medical", label: "Swiss Medical" },
  { value: "Galeno", label: "Galeno" },
  { value: "IOMA", label: "IOMA" },
  { value: "Medifé", label: "Medifé" },
  { value: "Sancor Salud", label: "Sancor Salud" },
];

// ─── Lead pipeline constants ─────────────────────────────────

const PIPELINE_COLUMNS: { key: LeadEstado; label: string; color: string }[] = [
  { key: "nuevo", label: "Nuevos", color: "border-l-blue-400" },
  { key: "contactado", label: "Contactados", color: "border-l-yellow-400" },
  { key: "interesado", label: "Interesados", color: "border-l-orange-400" },
  { key: "turno_agendado", label: "Turno agendado", color: "border-l-celeste" },
  { key: "convertido", label: "Convertidos", color: "border-l-green-500" },
  { key: "perdido", label: "Perdidos", color: "border-l-red-400" },
];

const ESTADO_COLORS: Record<LeadEstado, string> = {
  nuevo: "bg-blue-50 text-blue-700 border-blue-200",
  contactado: "bg-amber-50 text-amber-700 border-amber-200",
  interesado: "bg-orange-50 text-orange-700 border-orange-200",
  turno_agendado: "bg-celeste-pale text-celeste-dark border-celeste-light",
  convertido: "bg-success-50 text-success-700 border-success-200",
  perdido: "bg-red-50 text-red-700 border-red-200",
};

const FUENTE_OPTIONS = [
  { value: "", label: "Todas las fuentes" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "web", label: "Web" },
  { value: "referido", label: "Referido" },
  { value: "chatbot", label: "Chatbot" },
  { value: "landing", label: "Landing" },
  { value: "manual", label: "Manual" },
];

// ─── Tab type ────────────────────────────────────────────────

type PacientesTab = "leads" | "pacientes" | "inbox";

// ─── Main Page ───────────────────────────────────────────────

export default function PacientesPage() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as PacientesTab) || "pacientes";

  const { showToast } = useToast();
  const isDemo = useIsDemo();
  const { t } = useLocale();
  const { execute, isExecuting } = useCrudAction(isDemo);
  const { exportPDF, exportExcel, isExporting } = useExport();
  const [activeTab, setActiveTab] = useState<PacientesTab>(initialTab);
  const [showAddPatient, setShowAddPatient] = useState(false);
  const { hasPermission } = useAuth();

  const handleNuevoLead = () => {
    execute({
      action: async () => {
        const { createManualLead } = await import("@/lib/services/crm");
        return createManualLead("default", {
          nombre: t("patients.newContact"),
          telefono: "",
          fuente: "manual",
        });
      },
      successMessage: t("patients.leadCreated"),
      errorMessage: t("patients.leadCreateError"),
      demoLabel: t("patients.newManualLead"),
      mutateKeys: ["leads"],
    });
  };

  const handleNuevoPaciente = () => {
    setShowAddPatient(true);
  };

  // Patient data: real from Supabase or demo
  const { data: realPacientes, mutate: mutatePacientes } = usePacientes();
  const { data: allTurnos } = useTurnos();

  // Build a map of paciente_id → turno count for quick lookup
  const turnoCountMap = useMemo(() => {
    const map = new Map<string, number>();
    if (allTurnos) {
      for (const t of allTurnos) {
        // Match by paciente_id when available, fall back to exact name match
        const key = (t as any).pacienteId ?? t.paciente;
        if (key) map.set(key, (map.get(key) ?? 0) + 1);
      }
    }
    return map;
  }, [allTurnos]);

  const pacientes = useMemo((): PacienteDisplay[] => {
    if (!realPacientes || realPacientes.length === 0) return [];
    return realPacientes.map((p) => {
      // Calculate age from fechaNacimiento
      let edad = 0;
      if (p.fechaNacimiento) {
        const birth = new Date(p.fechaNacimiento);
        if (!isNaN(birth.getTime())) {
          edad = Math.floor((Date.now() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
          if (edad < 0) edad = 0;
        }
      }

      // Count turnos for this patient
      const turnoCount = turnoCountMap.get(p.id) ?? turnoCountMap.get(p.nombre) ?? 0;

      return {
        id: p.id,
        nombre: p.nombre?.split(" ")[0] ?? "",
        apellido: p.nombre?.split(" ").slice(1).join(" ") ?? "",
        dni: p.dni,
        edad,
        sexo: "—",
        financiador: p.financiador,
        plan: p.plan ?? "—",
        telefono: p.telefono ?? "—",
        email: p.email ?? null,
        ultimaVisita: p.ultimaVisita ?? "—",
        estado: p.estado as "activo" | "inactivo",
        turnos: turnoCount,
      };
    });
  }, [realPacientes, turnoCountMap]);

  // Patient filters
  const [search, setSearch] = useState("");
  const [filtroFinanciador, setFiltroFinanciador] = useState("Todos");
  const [filtroEstado, setFiltroEstado] = useState("Todos");

  // Lead state
  const [leadSearch, setLeadSearch] = useState("");
  const [fuenteFilter, setFuenteFilter] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  // ─── Data hooks ────────────────────────────────────────
  const {
    leads,
    total: leadTotal,
    isLoading: leadsLoading,
    refresh: refreshLeads,
  } = useLeads({
    search: leadSearch || undefined,
    fuente: fuenteFilter ? (fuenteFilter as Lead["fuente"]) : undefined,
    limit: 200,
  });
  const { stats } = useLeadStats();
  const { conversations, isLoading: convosLoading } = useConversations("open");

  // Group leads by estado for pipeline
  const pipeline = useMemo(() => {
    const grouped: Record<LeadEstado, Lead[]> = {
      nuevo: [],
      contactado: [],
      interesado: [],
      turno_agendado: [],
      convertido: [],
      perdido: [],
    };
    for (const lead of leads) {
      if (grouped[lead.estado as LeadEstado]) {
        grouped[lead.estado as LeadEstado].push(lead);
      }
    }
    return grouped;
  }, [leads]);

  // Patient filter
  const filtered = useMemo(() => {
    return pacientes.filter((p) => {
      const matchSearch = `${p.nombre} ${p.apellido} ${p.dni}`
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchFin = filtroFinanciador === "Todos" || p.financiador === filtroFinanciador;
      const matchEst = filtroEstado === "Todos" || p.estado === filtroEstado;
      return matchSearch && matchFin && matchEst;
    });
  }, [search, filtroFinanciador, filtroEstado, pacientes]);

  const unreadCount = conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0);

  return (
    <div className="space-y-5">
      <PageHeader
        title={t("patients.title")}
        description={`${pacientes.length} ${t("patients.patientsCount")} · ${leadTotal} ${t("patients.newConsultationsCount")}`}
        breadcrumbs={[
          { label: t("patients.breadcrumbPanel"), href: "/dashboard" },
          { label: t("patients.title") },
        ]}
        actions={
          activeTab === "leads" ? (
            <Button onClick={handleNuevoLead} data-tour="btn-nueva-consulta">
              {t("patients.newConsultationBtn")}
            </Button>
          ) : activeTab === "pacientes" ? (
            <div className="flex gap-2">
              <button
                onClick={() => exportPDF("kpi")}
                disabled={isExporting}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-celeste-dark text-white rounded-[4px] hover:bg-celeste transition disabled:opacity-50"
              >
                {isExporting ? "..." : "PDF"}
              </button>
              <button
                onClick={() => exportExcel("pacientes")}
                disabled={isExporting}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border rounded-[4px] text-ink-light hover:border-celeste-dark hover:text-celeste-dark transition disabled:opacity-50"
              >
                Excel
              </button>
              <Button onClick={handleNuevoPaciente}>{t("patients.newPatientBtn")}</Button>
            </div>
          ) : null
        }
      />

      {/* ── Add Patient Modal ───────────────────────────── */}
      {showAddPatient && (
        <AddPatientModal
          onClose={() => setShowAddPatient(false)}
          onCreated={() => {
            mutatePacientes();
            setShowAddPatient(false);
            showToast(t("patients.patientCreated"), "success");
          }}
        />
      )}

      {/* ── Tabs ────────────────────────────────────────── */}
      <div className="flex gap-1 border-b border-border" role="tablist">
        <TabButton
          active={activeTab === "leads"}
          onClick={() => setActiveTab("leads")}
          badge={leadTotal > 0 ? leadTotal : undefined}
          data-tour="tab-leads"
        >
          {t("patients.newConsultations")}
        </TabButton>
        <TabButton
          active={activeTab === "pacientes"}
          onClick={() => setActiveTab("pacientes")}
          data-tour="tab-pacientes"
        >
          {t("patients.title")}
        </TabButton>
        <TabButton
          active={activeTab === "inbox"}
          onClick={() => setActiveTab("inbox")}
          badge={unreadCount > 0 ? unreadCount : undefined}
        >
          {t("patients.messages")}
        </TabButton>
      </div>

      {/* ── Tab Content ─────────────────────────────────── */}

      {activeTab === "leads" && (
        <LeadsTab
          pipeline={pipeline}
          stats={stats}
          search={leadSearch}
          setSearch={setLeadSearch}
          fuenteFilter={fuenteFilter}
          setFuenteFilter={setFuenteFilter}
          isLoading={leadsLoading}
          selectedLead={selectedLead}
          setSelectedLead={setSelectedLead}
          refreshLeads={refreshLeads}
          showToast={showToast}
        />
      )}

      {activeTab === "pacientes" && (
        <PacientesTabView
          pacientes={pacientes}
          filtered={filtered}
          search={search}
          setSearch={setSearch}
          filtroFinanciador={filtroFinanciador}
          setFiltroFinanciador={setFiltroFinanciador}
          filtroEstado={filtroEstado}
          setFiltroEstado={setFiltroEstado}
          allTurnos={allTurnos ?? []}
        />
      )}

      {activeTab === "inbox" && (
        <InboxTabView
          conversations={conversations}
          isLoading={convosLoading}
          selectedConversation={selectedConversation}
          setSelectedConversation={setSelectedConversation}
        />
      )}
    </div>
  );
}

// ─── Tab Button ──────────────────────────────────────────────

function TabButton({
  active,
  onClick,
  badge,
  children,
  "data-tour": dataTour,
}: {
  active: boolean;
  onClick: () => void;
  badge?: number;
  children: React.ReactNode;
  "data-tour"?: string;
}) {
  return (
    <button
      role="tab"
      aria-selected={active}
      data-tour={dataTour}
      className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
        active
          ? "border-celeste text-celeste-dark"
          : "border-transparent text-ink-muted hover:text-ink"
      }`}
      onClick={onClick}
    >
      {children}
      {badge !== undefined && badge > 0 && (
        <span className="text-[10px] bg-celeste text-white rounded-full px-1.5 min-w-[18px] text-center leading-[18px]">
          {badge}
        </span>
      )}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB 1: LEADS (Consultas nuevas)
// ═══════════════════════════════════════════════════════════════

function LeadsTab({
  pipeline,
  stats,
  search,
  setSearch,
  fuenteFilter,
  setFuenteFilter,
  isLoading,
  selectedLead,
  setSelectedLead,
  refreshLeads,
  showToast,
}: {
  pipeline: Record<LeadEstado, Lead[]>;
  stats: ReturnType<typeof useLeadStats>["stats"];
  search: string;
  setSearch: (v: string) => void;
  fuenteFilter: string;
  setFuenteFilter: (v: string) => void;
  isLoading: boolean;
  selectedLead: Lead | null;
  setSelectedLead: (v: Lead | null) => void;
  refreshLeads: () => void;
  showToast: (msg: string, type?: "success" | "error" | "info") => void;
}) {
  const { t } = useLocale();
  const pipelineLabels: Record<string, string> = {
    nuevo: t("patients.new"),
    contactado: t("patients.contacted"),
    interesado: t("patients.interested"),
    turno_agendado: t("patients.appointmentScheduled"),
    convertido: t("patients.converted"),
    perdido: t("patients.lost"),
  };
  const fuenteOptions = [
    { value: "", label: t("patients.allSources") },
    { value: "whatsapp", label: "WhatsApp" },
    { value: "web", label: "Web" },
    { value: "referido", label: t("patients.sourceReferral") },
    { value: "chatbot", label: "Chatbot" },
    { value: "landing", label: "Landing" },
    { value: "manual", label: t("patients.sourceManual") },
  ];
  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        role="region"
        aria-label={t("patients.leadIndicators")}
      >
        <KPICard
          label={t("patients.newConsultations")}
          value={stats?.nuevo ?? 0}
          accent="border-l-blue-400"
        />
        <KPICard
          label={t("patients.inFollowup")}
          value={(stats?.contactado ?? 0) + (stats?.interesado ?? 0)}
          accent="border-l-yellow-400"
        />
        <KPICard
          label={t("patients.scheduledAppointments")}
          value={stats?.turno_agendado ?? 0}
          accent="border-l-celeste"
        />
        <KPICard
          label={t("patients.conversionRate")}
          value={`${stats?.conversionRate ?? 0}%`}
          accent="border-l-green-500"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3" role="search" aria-label={t("patients.filterLeads")}>
        <div className="w-72" data-tour="leads-search">
          <Input
            placeholder={t("patients.searchLeadPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label={t("patients.searchLead")}
          />
        </div>
        <Select
          options={fuenteOptions}
          value={fuenteFilter}
          onChange={(e) => setFuenteFilter(e.target.value)}
          aria-label={t("patients.filterBySource")}
        />
        <Button variant="secondary" onClick={() => refreshLeads()}>
          {t("patients.refresh")}
        </Button>
      </div>

      {/* Pipeline columns */}
      {isLoading ? (
        <div className="text-center py-12 text-ink-muted">{t("patients.loadingConsults")}</div>
      ) : (
        <div
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4"
          data-tour="leads-pipeline"
        >
          {PIPELINE_COLUMNS.map((col) => (
            <div key={col.key} className="space-y-2">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <span
                  className={`w-2 h-2 rounded-full bg-current ${col.color.replace("border-l-", "text-")}`}
                />
                <span className="text-sm font-semibold text-ink">
                  {pipelineLabels[col.key] || col.label}
                </span>
                <span className="text-xs text-ink-muted bg-surface-alt rounded-full px-2">
                  {pipeline[col.key].length}
                </span>
              </div>
              <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                {pipeline[col.key].length === 0 ? (
                  <div className="text-xs text-ink-muted text-center py-4">—</div>
                ) : (
                  pipeline[col.key].map((lead) => (
                    <LeadCard
                      key={lead.id}
                      lead={lead}
                      isSelected={selectedLead?.id === lead.id}
                      onClick={() => setSelectedLead(lead)}
                    />
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lead detail slide-over */}
      {selectedLead && (
        <LeadDetailPanel
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          refreshLeads={refreshLeads}
          showToast={showToast}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB 2: PACIENTES (existing table)
// ═══════════════════════════════════════════════════════════════

function PacientesTabView({
  pacientes,
  filtered,
  search,
  setSearch,
  filtroFinanciador,
  setFiltroFinanciador,
  filtroEstado,
  setFiltroEstado,
  allTurnos,
}: {
  pacientes: PacienteDisplay[];
  filtered: PacienteDisplay[];
  search: string;
  setSearch: (v: string) => void;
  filtroFinanciador: string;
  setFiltroFinanciador: (v: string) => void;
  filtroEstado: string;
  setFiltroEstado: (v: string) => void;
  allTurnos: {
    id: string;
    fecha?: string;
    hora: string;
    paciente: string;
    pacienteId?: string;
    tipo: string;
    financiador: string;
    profesional: string;
    profesionalId?: string;
    estado: string;
    notas?: string;
    durationMin?: number;
  }[];
}) {
  const { t, locale } = useLocale();
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedPatient, setExpandedPatient] = useState<string | null>(null);

  // Build patient → turnos lookup for medical history
  const patientTurnosMap = useMemo(() => {
    const map = new Map<string, typeof allTurnos>();
    for (const turno of allTurnos) {
      const key = turno.pacienteId ?? turno.paciente;
      if (!key) continue;
      const list = map.get(key) ?? [];
      list.push(turno);
      map.set(key, list);
    }
    return map;
  }, [allTurnos]);

  const getPatientTurnos = (p: PacienteDisplay) => {
    const byId = patientTurnosMap.get(p.id) ?? [];
    const byName = patientTurnosMap.get(`${p.nombre} ${p.apellido}`.trim()) ?? [];
    // Deduplicate by turno id
    const seen = new Set<string>();
    const merged = [];
    for (const t of [...byId, ...byName]) {
      if (!seen.has(t.id)) {
        seen.add(t.id);
        merged.push(t);
      }
    }
    return merged.sort((a, b) => {
      const da = a.fecha ?? "";
      const db = b.fecha ?? "";
      return db.localeCompare(da) || b.hora.localeCompare(a.hora);
    });
  };

  const estadoColors: Record<string, string> = {
    confirmado: "bg-green-50 text-green-700",
    pendiente: "bg-amber-50 text-amber-700",
    atendido: "bg-gray-100 text-gray-600",
    cancelado: "bg-red-50 text-red-600",
  };

  const PAGE_SIZE = 25;
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginatedFiltered = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filtroFinanciador, filtroEstado]);

  return (
    <div className="space-y-4">
      {/* KPI cards */}
      <div
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        role="region"
        aria-label={t("patients.patientIndicators")}
      >
        <KPICard
          label={t("patients.totalPatients")}
          value={pacientes.length}
          accent="border-l-celeste"
        />
        <KPICard
          label={t("patients.activePatients")}
          value={pacientes.filter((p) => p.estado === "activo").length}
          accent="border-l-green-400"
        />
        <KPICard
          label="PAMI"
          value={pacientes.filter((p) => p.financiador === "PAMI").length}
          accent="border-l-celeste-dark"
        />
        <KPICard
          label={t("patients.withAppointments")}
          value={pacientes.filter((p) => p.turnos > 0).length}
          accent="border-l-celeste"
        />
      </div>

      {/* Filters */}
      <div
        className="flex flex-wrap gap-3"
        role="search"
        aria-label={t("patients.searchFilterPatients")}
      >
        <div className="w-72" data-tour="pacientes-search">
          <Input
            placeholder={t("patients.searchByNameDni")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label={t("patients.searchPatient")}
          />
        </div>
        <Select
          options={[{ value: "Todos", label: t("patients.all") }, ...financiadores.slice(1)]}
          value={filtroFinanciador}
          onChange={(e) => setFiltroFinanciador(e.target.value)}
          aria-label={t("patients.filterByInsurance")}
        />
        <Select
          options={[
            { value: "Todos", label: t("patients.all") },
            { value: "activo", label: t("patients.statusActive") },
            { value: "inactivo", label: t("patients.statusInactive") },
          ]}
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          aria-label={t("patients.filterByStatus")}
        />
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" aria-label={t("patients.patientList")}>
            <thead>
              <tr className="bg-surface text-[10px] font-bold tracking-wider text-ink-muted uppercase">
                <th scope="col" className="text-left px-5 py-3">
                  {t("patients.patientColumn")}
                </th>
                <th scope="col" className="text-left px-5 py-3">
                  {t("patients.dni")}
                </th>
                <th scope="col" className="text-left px-5 py-3">
                  {t("patients.insurerColumn")}
                </th>
                <th scope="col" className="text-center px-5 py-3">
                  {t("patients.ageColumn")}
                </th>
                <th scope="col" className="text-left px-5 py-3">
                  {t("patients.lastVisit")}
                </th>
                <th scope="col" className="text-center px-5 py-3">
                  {t("patients.appointmentsColumn")}
                </th>
                <th scope="col" className="text-center px-5 py-3">
                  {t("patients.statusColumn")}
                </th>
                <th scope="col" className="text-center px-5 py-3">
                  {t("patients.actionColumn")}
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedFiltered.map((p) => {
                const isExpanded = expandedPatient === p.id;
                const pTurnos = getPatientTurnos(p);
                return (
                  <>
                    <tr
                      key={p.id}
                      className={`border-t border-border-light hover:bg-celeste-pale/30 transition cursor-pointer ${isExpanded ? "bg-celeste-pale/20" : ""}`}
                      onClick={() => setExpandedPatient(isExpanded ? null : p.id)}
                    >
                      <td className="px-5 py-3 font-semibold text-ink">
                        <div className="flex items-center gap-2">
                          <svg
                            className={`w-3 h-3 text-ink-muted transition-transform ${isExpanded ? "rotate-90" : ""}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                          {p.apellido}, {p.nombre}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-ink-light font-mono text-xs">{p.dni}</td>
                      <td className="px-5 py-3 text-ink-light">{p.financiador}</td>
                      <td className="px-5 py-3 text-center text-ink-light">{p.edad}</td>
                      <td className="px-5 py-3 text-ink-light">{p.ultimaVisita}</td>
                      <td className="px-5 py-3 text-center">
                        {p.turnos > 0 ? (
                          <span className="bg-celeste-pale text-celeste-dark text-[10px] font-bold px-2 py-0.5 rounded">
                            {p.turnos}
                          </span>
                        ) : (
                          <span className="text-ink-muted text-xs">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <StatusBadge
                          variant={p.estado}
                          label={
                            p.estado === "activo"
                              ? t("patients.statusActive")
                              : t("patients.statusInactive")
                          }
                        />
                      </td>
                      <td className="px-5 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <Link
                          href={`/dashboard/pacientes/${p.id}`}
                          className="text-[10px] text-celeste-dark font-medium hover:underline"
                          aria-label={`${t("patients.viewRecord")} - ${p.apellido}, ${p.nombre}`}
                        >
                          {t("patients.viewRecord")}
                        </Link>
                      </td>
                    </tr>
                    {/* ── Expanded: Medical History & Previous Appointments ── */}
                    {isExpanded && (
                      <tr key={`${p.id}-detail`}>
                        <td colSpan={8} className="px-5 py-0 bg-surface/50">
                          <div className="py-4 space-y-4">
                            {/* Patient Summary Card */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              <div className="bg-white border border-border rounded-lg p-3">
                                <p className="text-[9px] font-bold text-ink-muted uppercase tracking-wider">
                                  {locale === "en" ? "Insurance" : "Obra Social"}
                                </p>
                                <p className="text-sm font-semibold text-ink mt-0.5">
                                  {p.financiador}
                                </p>
                                {p.plan !== "—" && (
                                  <p className="text-[10px] text-ink-muted">
                                    {locale === "en" ? "Plan" : "Plan"}: {p.plan}
                                  </p>
                                )}
                              </div>
                              <div className="bg-white border border-border rounded-lg p-3">
                                <p className="text-[9px] font-bold text-ink-muted uppercase tracking-wider">
                                  {locale === "en" ? "Contact" : "Contacto"}
                                </p>
                                <p className="text-xs text-ink mt-0.5">{p.telefono}</p>
                                {p.email && (
                                  <p className="text-[10px] text-ink-muted truncate">{p.email}</p>
                                )}
                              </div>
                              <div className="bg-white border border-border rounded-lg p-3">
                                <p className="text-[9px] font-bold text-ink-muted uppercase tracking-wider">
                                  {locale === "en" ? "Total Appointments" : "Total Turnos"}
                                </p>
                                <p className="text-lg font-bold text-celeste-dark mt-0.5">
                                  {pTurnos.length}
                                </p>
                              </div>
                              <div className="bg-white border border-border rounded-lg p-3">
                                <p className="text-[9px] font-bold text-ink-muted uppercase tracking-wider">
                                  {locale === "en" ? "Last Visit" : "Última Visita"}
                                </p>
                                <p className="text-sm font-semibold text-ink mt-0.5">
                                  {p.ultimaVisita}
                                </p>
                              </div>
                            </div>

                            {/* Previous Appointments Table */}
                            <div>
                              <h4 className="text-xs font-bold text-ink-muted uppercase tracking-wider mb-2">
                                {locale === "en" ? "Appointment History" : "Historial de Turnos"}
                              </h4>
                              {pTurnos.length === 0 ? (
                                <p className="text-xs text-ink-muted italic py-3">
                                  {locale === "en"
                                    ? "No previous appointments"
                                    : "Sin turnos previos"}
                                </p>
                              ) : (
                                <div className="bg-white border border-border rounded-lg overflow-hidden">
                                  <table className="w-full text-xs">
                                    <thead>
                                      <tr className="bg-surface text-[9px] font-bold tracking-wider text-ink-muted uppercase">
                                        <th className="text-left px-4 py-2">
                                          {locale === "en" ? "Date" : "Fecha"}
                                        </th>
                                        <th className="text-left px-4 py-2">
                                          {locale === "en" ? "Time" : "Hora"}
                                        </th>
                                        <th className="text-left px-4 py-2">
                                          {locale === "en" ? "Type" : "Tipo"}
                                        </th>
                                        <th className="text-left px-4 py-2">
                                          {locale === "en" ? "Doctor" : "Profesional"}
                                        </th>
                                        <th className="text-left px-4 py-2">
                                          {locale === "en" ? "Insurance" : "Obra Social"}
                                        </th>
                                        <th className="text-center px-4 py-2">
                                          {locale === "en" ? "Status" : "Estado"}
                                        </th>
                                        {pTurnos.some((t) => t.notas) && (
                                          <th className="text-left px-4 py-2">
                                            {locale === "en" ? "Notes" : "Notas"}
                                          </th>
                                        )}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {pTurnos.slice(0, 15).map((turno) => (
                                        <tr
                                          key={turno.id}
                                          className="border-t border-border-light hover:bg-celeste-pale/20 transition"
                                        >
                                          <td className="px-4 py-2 font-mono text-ink-light">
                                            {turno.fecha ?? "—"}
                                          </td>
                                          <td className="px-4 py-2 font-mono text-ink-light">
                                            {turno.hora}
                                          </td>
                                          <td className="px-4 py-2">
                                            <span className="bg-surface px-2 py-0.5 rounded text-ink-light font-medium">
                                              {turno.tipo}
                                            </span>
                                          </td>
                                          <td className="px-4 py-2 text-ink-light">
                                            {turno.profesional}
                                          </td>
                                          <td className="px-4 py-2 text-ink-light">
                                            {turno.financiador}
                                          </td>
                                          <td className="px-4 py-2 text-center">
                                            <span
                                              className={`text-[9px] font-bold px-2 py-0.5 rounded capitalize ${estadoColors[turno.estado] ?? "bg-gray-100 text-gray-600"}`}
                                            >
                                              {turno.estado}
                                            </span>
                                          </td>
                                          {pTurnos.some((t) => t.notas) && (
                                            <td
                                              className="px-4 py-2 text-ink-muted max-w-[150px] truncate"
                                              title={turno.notas ?? ""}
                                            >
                                              {turno.notas ?? "—"}
                                            </td>
                                          )}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                  {pTurnos.length > 15 && (
                                    <div className="px-4 py-2 text-[10px] text-ink-muted bg-surface border-t border-border">
                                      {locale === "en"
                                        ? `Showing 15 of ${pTurnos.length} appointments`
                                        : `Mostrando 15 de ${pTurnos.length} turnos`}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* ── Receipt / Billing History ── */}
                            <PatientReceiptHistory patientId={p.id} locale={locale} />
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-sm text-ink-muted">
                    {t("patients.noResults")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB 3: INBOX (WhatsApp conversations)
// ═══════════════════════════════════════════════════════════════

function InboxTabView({
  conversations,
  isLoading,
  selectedConversation,
  setSelectedConversation,
}: {
  conversations: Conversation[];
  isLoading: boolean;
  selectedConversation: Conversation | null;
  setSelectedConversation: (c: Conversation | null) => void;
}) {
  const { t } = useLocale();
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" style={{ minHeight: "60vh" }}>
      {/* Conversation list */}
      <div className="lg:col-span-1 border border-border rounded-lg overflow-hidden">
        <div className="p-3 border-b border-border bg-surface-alt">
          <div className="text-sm font-semibold text-ink">{t("patients.conversations")}</div>
        </div>
        <div className="overflow-y-auto max-h-[60vh]">
          {isLoading ? (
            <div className="text-center py-8 text-ink-muted text-sm">{t("patients.loading")}</div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-8 text-ink-muted text-sm">
              {t("patients.noConversations")}
              <br />
              <span className="text-xs">{t("patients.whatsAppNote")}</span>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={`w-full text-left p-3 border-b border-border hover:bg-surface-alt transition-colors ${
                  selectedConversation?.id === conv.id
                    ? "bg-celeste/5 border-l-2 border-l-celeste"
                    : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-medium text-sm text-ink truncate">
                      {conv.lead?.nombre || conv.paciente?.nombre || t("patients.noName")}
                    </div>
                    <div className="text-xs text-ink-muted truncate">
                      {conv.lead?.telefono || conv.paciente?.telefono || ""}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] text-ink-muted">
                      {conv.last_message_at
                        ? new Date(conv.last_message_at).toLocaleTimeString("es-AR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </span>
                    {conv.unread_count > 0 && (
                      <span className="text-[10px] bg-celeste text-white rounded-full px-1.5 min-w-[18px] text-center">
                        {conv.unread_count}
                      </span>
                    )}
                  </div>
                </div>
                {conv.subject && (
                  <div className="text-xs text-ink-muted mt-1 line-clamp-1">{conv.subject}</div>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Message thread */}
      <div className="lg:col-span-2 border border-border rounded-lg overflow-hidden flex flex-col">
        {selectedConversation ? (
          <ConversationThread conversation={selectedConversation} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-ink-muted text-sm">
            {t("patients.selectConversation")}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Shared Components ───────────────────────────────────────

function KPICard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent: string;
}) {
  return (
    <div className={`bg-white border border-border rounded-lg p-4 border-l-[3px] ${accent}`}>
      <div className="text-xs text-ink-muted">{label}</div>
      <div className="text-2xl font-bold text-ink mt-1">{value}</div>
    </div>
  );
}

function LeadCard({
  lead,
  isSelected,
  onClick,
}: {
  lead: Lead;
  isSelected: boolean;
  onClick: () => void;
}) {
  const { t, locale } = useLocale();
  return (
    <button
      onClick={onClick}
      className={`w-full text-left bg-white border rounded-lg p-3 transition-all hover:shadow-sm ${
        isSelected ? "border-celeste ring-1 ring-celeste" : "border-border"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-medium text-sm text-ink truncate">
            {lead.nombre || lead.telefono}
          </div>
          {lead.nombre && <div className="text-xs text-ink-muted truncate">{lead.telefono}</div>}
        </div>
        <FuenteIcon fuente={lead.fuente} />
      </div>
      {lead.motivo && <div className="text-xs text-ink-muted mt-1 line-clamp-2">{lead.motivo}</div>}
      <div className="flex items-center gap-2 mt-2 flex-wrap">
        <span
          className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded border ${ESTADO_COLORS[lead.estado]}`}
        >
          {lead.estado}
        </span>
        {lead.tags?.slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="text-[10px] px-1.5 py-0.5 bg-surface-alt rounded text-ink-muted"
          >
            {tag}
          </span>
        ))}
      </div>
      {lead.last_message_at && (
        <div className="text-[10px] text-ink-muted mt-1.5">
          {t("patients.lastMsg")}{" "}
          {new Date(lead.last_message_at).toLocaleDateString(locale === "en" ? "en-US" : "es-AR")}
        </div>
      )}
    </button>
  );
}

function FuenteIcon({ fuente }: { fuente: string }) {
  const labels: Record<string, string> = {
    whatsapp: "WA",
    web: "Web",
    referido: "Ref",
    chatbot: "Bot",
    landing: "LP",
    manual: "Man",
  };
  return (
    <span
      className="text-[10px] font-bold text-ink-muted bg-surface-alt rounded px-1.5 py-0.5"
      title={fuente}
    >
      {labels[fuente] || fuente}
    </span>
  );
}

function LeadDetailPanel({
  lead,
  onClose,
  refreshLeads,
  showToast,
}: {
  lead: Lead;
  onClose: () => void;
  refreshLeads: () => void;
  showToast: (msg: string, type?: "success" | "error" | "info") => void;
}) {
  const { t } = useLocale();
  const pipelineLabels: Record<string, string> = {
    nuevo: t("patients.new"),
    contactado: t("patients.contacted"),
    interesado: t("patients.interested"),
    turno_agendado: t("patients.appointmentScheduled"),
    convertido: t("patients.converted"),
    perdido: t("patients.lost"),
  };
  const { trigger: updateLead, isMutating } = useUpdateLead(lead.id);

  const handleStatusChange = async (newEstado: LeadEstado) => {
    try {
      await updateLead({ estado: newEstado });
      showToast(`${t("patients.movedTo")} "${newEstado}"`);
      refreshLeads();
    } catch {
      showToast(t("toast.pacientes.updateError"), "error");
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white border-l border-border shadow-xl z-50 overflow-y-auto">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold text-ink">{t("patients.consultDetail")}</h3>
        <button onClick={onClose} className="text-ink-muted hover:text-ink text-xl">
          ×
        </button>
      </div>
      <div className="p-4 space-y-4">
        <div className="space-y-2">
          <div className="text-lg font-semibold">{lead.nombre || t("patients.noName")}</div>
          <div className="text-sm text-ink-muted space-y-1">
            <div>
              {t("patients.telLabel")} {lead.telefono}
            </div>
            {lead.email && (
              <div>
                {t("patients.emailLabel")} {lead.email}
              </div>
            )}
            {lead.financiador && (
              <div>
                {t("patients.insurerLabel")} {lead.financiador}
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-ink-muted">{t("patients.statusLabel")}</label>
          <div className="flex flex-wrap gap-1 mt-1">
            {PIPELINE_COLUMNS.map((col) => (
              <button
                key={col.key}
                disabled={isMutating}
                onClick={() => handleStatusChange(col.key)}
                className={`text-xs px-2 py-1 rounded border transition-colors ${
                  lead.estado === col.key
                    ? "bg-celeste text-white border-celeste"
                    : "border-border text-ink-muted hover:border-celeste"
                }`}
              >
                {pipelineLabels[col.key] || col.label}
              </button>
            ))}
          </div>
        </div>

        {lead.motivo && (
          <Card>
            <CardContent>
              <div className="text-xs font-medium text-ink-muted mb-1">{t("patients.reason")}</div>
              <div className="text-sm">{lead.motivo}</div>
            </CardContent>
          </Card>
        )}

        <div>
          <div className="text-xs font-medium text-ink-muted mb-1">{t("patients.tags")}</div>
          <div className="flex flex-wrap gap-1">
            {lead.tags?.length ? (
              lead.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 bg-surface-alt rounded-full text-ink-muted"
                >
                  {tag}
                </span>
              ))
            ) : (
              <span className="text-xs text-ink-muted">{t("patients.noTags")}</span>
            )}
          </div>
        </div>

        {lead.notas && (
          <div>
            <div className="text-xs font-medium text-ink-muted mb-1">
              {t("patients.notesLabel")}
            </div>
            <div className="text-xs text-ink whitespace-pre-wrap bg-surface-alt rounded p-2">
              {lead.notas}
            </div>
          </div>
        )}

        <div className="text-xs text-ink-muted space-y-0.5 pt-2 border-t border-border">
          <div>
            {t("patients.sourceLabel")} {lead.fuente}
          </div>
          <div>
            {t("patients.createdLabel")} {new Date(lead.created_at).toLocaleString("es-AR")}
          </div>
          {lead.first_contact_at && (
            <div>
              {t("patients.firstContactLabel")}{" "}
              {new Date(lead.first_contact_at).toLocaleString("es-AR")}
            </div>
          )}
          {lead.converted_at && (
            <div>
              {t("patients.convertedDate")} {new Date(lead.converted_at).toLocaleString("es-AR")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ConversationThread({ conversation }: { conversation: Conversation }) {
  const { t } = useLocale();
  const { messages, isLoading } = useMessages(conversation.id);
  const { trigger: send, isMutating: sending } = useSendMessage(conversation.id);
  const [draft, setDraft] = useState("");

  const handleSend = async () => {
    if (!draft.trim()) return;
    const to = conversation.lead?.telefono || conversation.paciente?.telefono || "";
    if (!to) return;
    try {
      await send({ body: draft, to });
      setDraft("");
    } catch {
      /* SWR handles error */
    }
  };

  return (
    <>
      <div className="p-3 border-b border-border bg-surface-alt flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-celeste/20 flex items-center justify-center text-celeste text-sm font-bold">
          {(
            conversation.lead?.nombre?.[0] ||
            conversation.paciente?.nombre?.[0] ||
            "?"
          ).toUpperCase()}
        </div>
        <div>
          <div className="text-sm font-semibold">
            {conversation.lead?.nombre || conversation.paciente?.nombre || t("patients.noName")}
          </div>
          <div className="text-xs text-ink-muted">{conversation.channel}</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f0f2f5]">
        {isLoading ? (
          <div className="text-center text-ink-muted text-sm">{t("patients.loadingMessages")}</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-ink-muted text-sm">{t("patients.noMessages")}</div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.direction === "outbound" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                  msg.direction === "outbound"
                    ? "bg-[#d9fdd3] text-ink"
                    : "bg-white text-ink shadow-sm"
                }`}
              >
                {msg.sender_name && msg.direction === "inbound" && (
                  <div className="text-xs font-semibold text-celeste-dark mb-0.5">
                    {msg.sender_name}
                  </div>
                )}
                <div className="whitespace-pre-wrap">{msg.body}</div>
                <div className="text-[10px] text-ink-muted text-right mt-1">
                  {new Date(msg.created_at).toLocaleTimeString("es-AR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {msg.direction === "outbound" && (
                    <span className="ml-1 text-[10px] opacity-70">
                      {msg.status === "delivered" || msg.status === "read"
                        ? t("patients.readStatus")
                        : t("patients.sentStatus")}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-3 border-t border-border bg-white flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder={t("patients.writeMessage")}
          className="flex-1 px-3 py-2 border border-border rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-celeste"
          disabled={sending}
        />
        <button
          onClick={handleSend}
          disabled={sending || !draft.trim()}
          className="px-4 py-2 bg-celeste text-white rounded-full text-sm font-medium disabled:opacity-50 hover:bg-celeste-dark transition-colors"
        >
          {sending ? "..." : t("patients.send")}
        </button>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// PATIENT RECEIPT HISTORY (inside expanded row)
// ═══════════════════════════════════════════════════════════════

function PatientReceiptHistory({ patientId, locale }: { patientId: string; locale: string }) {
  const [receipts, setReceipts] = useState<
    {
      id: string;
      receipt_number: string;
      status: string;
      total: number;
      discount: number;
      payment_method: string | null;
      created_at: string;
      receipt_items: {
        id: string;
        service_name: string;
        unit_price: number;
        quantity: number;
        subtotal: number;
      }[];
    }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/receipts?patient_id=${patientId}`);
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) setReceipts(data.receipts || []);
        }
      } catch {
        /* silent */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [patientId]);

  if (loading) {
    return (
      <div>
        <h4 className="text-xs font-bold text-ink-muted uppercase tracking-wider mb-2">
          {locale === "en" ? "Billing History" : "Historial de Cobros"}
        </h4>
        <p className="text-xs text-ink-muted italic py-2">
          {locale === "en" ? "Loading..." : "Cargando..."}
        </p>
      </div>
    );
  }

  return (
    <div>
      <h4 className="text-xs font-bold text-ink-muted uppercase tracking-wider mb-2">
        {locale === "en" ? "Billing History" : "Historial de Cobros"}
      </h4>
      {receipts.length === 0 ? (
        <p className="text-xs text-ink-muted italic py-2">
          {locale === "en" ? "No receipts" : "Sin comprobantes"}
        </p>
      ) : (
        <div className="bg-white border border-border rounded-lg overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-surface text-[9px] font-bold tracking-wider text-ink-muted uppercase">
                <th className="text-left px-4 py-2">
                  {locale === "en" ? "Receipt" : "Comprobante"}
                </th>
                <th className="text-left px-4 py-2">{locale === "en" ? "Date" : "Fecha"}</th>
                <th className="text-left px-4 py-2">{locale === "en" ? "Items" : "Servicios"}</th>
                <th className="text-left px-4 py-2">{locale === "en" ? "Payment" : "Pago"}</th>
                <th className="text-right px-4 py-2">Total</th>
                <th className="text-center px-4 py-2">{locale === "en" ? "Status" : "Estado"}</th>
              </tr>
            </thead>
            <tbody>
              {receipts.map((r) => (
                <tr
                  key={r.id}
                  className="border-t border-border-light hover:bg-celeste-pale/20 transition"
                >
                  <td className="px-4 py-2 font-mono font-semibold text-ink">{r.receipt_number}</td>
                  <td className="px-4 py-2 text-ink-light">
                    {new Date(r.created_at).toLocaleDateString("es-AR")}
                  </td>
                  <td
                    className="px-4 py-2 text-ink-muted max-w-[200px] truncate"
                    title={(r.receipt_items || []).map((i) => i.service_name).join(", ")}
                  >
                    {(r.receipt_items || []).map((i) => i.service_name).join(", ") || "--"}
                  </td>
                  <td className="px-4 py-2 text-ink-light capitalize">
                    {r.payment_method?.replace("_", " ") || "--"}
                  </td>
                  <td className="px-4 py-2 text-right font-bold text-ink tabular-nums">
                    {new Intl.NumberFormat("es-AR", {
                      style: "currency",
                      currency: "ARS",
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(r.total)}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded capitalize ${
                        r.status === "completed"
                          ? "bg-green-50 text-green-700"
                          : r.status === "voided"
                            ? "bg-red-50 text-red-600"
                            : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {r.status === "completed"
                        ? "Completado"
                        : r.status === "voided"
                          ? "Anulado"
                          : "Borrador"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ADD PATIENT MODAL
// ═══════════════════════════════════════════════════════════════

const INSURANCE_OPTIONS = [
  "PAMI",
  "OSDE",
  "Swiss Medical",
  "Galeno",
  "IOMA",
  "Medifé",
  "Sancor Salud",
  "Unión Personal",
  "Accord Salud",
  "OSECAC",
];

function AddPatientModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const { t, locale } = useLocale();
  const { showToast } = useToast();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [nombre, setNombre] = useState("");
  const [dni, setDni] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [direccion, setDireccion] = useState("");
  const [financiador, setFinanciador] = useState("");
  const [plan, setPlan] = useState("");
  const [notas, setNotas] = useState("");

  // Triage / intake state
  const [showTriage, setShowTriage] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [severity, setSeverity] = useState(1);
  const [frequency, setFrequency] = useState("");
  const [triageDuration, setTriageDuration] = useState("");
  const [triageTriggers, setTriageTriggers] = useState("");

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom],
    );
  };

  // Open the dialog on mount
  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) {
      dialog.showModal();
    }
  }, []);

  // Close on Escape (native dialog behavior) or backdrop click
  const handleDialogClick = useCallback(
    (e: React.MouseEvent<HTMLDialogElement>) => {
      if (e.target === dialogRef.current) {
        onClose();
      }
    },
    [onClose],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !dni.trim()) return;

    setSaving(true);
    try {
      // Build structured triage notes if any symptoms were selected
      let combinedNotes = notas.trim();
      if (selectedSymptoms.length > 0) {
        const triageParts: string[] = [];
        triageParts.push(`[TRIAGE INTAKE]`);
        triageParts.push(`Sintomas: ${selectedSymptoms.join(", ")}`);
        if (severity > 1) triageParts.push(`Severidad: ${severity}/10`);
        if (frequency) triageParts.push(`Frecuencia: ${frequency}`);
        if (triageDuration.trim()) triageParts.push(`Duracion: ${triageDuration.trim()}`);
        if (triageTriggers.trim()) triageParts.push(`Desencadenantes: ${triageTriggers.trim()}`);
        const triageBlock = triageParts.join(" | ");
        combinedNotes = combinedNotes ? `${combinedNotes}\n${triageBlock}` : triageBlock;
      }

      const res = await fetch("/api/dashboard/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nombre.trim(),
          dni: dni.trim(),
          email: email.trim() || undefined,
          telefono: telefono.trim() || undefined,
          fechaNacimiento: fechaNacimiento || undefined,
          direccion: direccion.trim() || undefined,
          financiador: financiador || undefined,
          plan: plan.trim() || undefined,
          notas: combinedNotes || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Error desconocido" }));
        showToast(data.error || t("patients.patientCreateError"), "error");
        return;
      }

      analytics.track("paciente_created");
      onCreated();
    } catch {
      showToast(t("patients.patientCreateError"), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      onClick={handleDialogClick}
      onClose={onClose}
      className="fixed inset-0 z-50 m-auto w-full max-w-2xl rounded-xl border border-border bg-white p-0 shadow-2xl backdrop:bg-black/40 max-h-[90vh] overflow-y-auto"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-ink">{t("patients.addPatientTitle")}</h2>
            <p className="text-xs text-ink-muted mt-0.5">{t("patients.addPatientDesc")}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-ink-muted hover:text-ink text-xl leading-none p-1"
            aria-label={t("patients.cancel")}
          >
            ×
          </button>
        </div>

        {/* Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Nombre — required */}
          <div className="sm:col-span-2">
            <label htmlFor="ap-nombre" className="block text-xs font-medium text-ink-muted mb-1">
              {t("patients.fieldNombre")} *
            </label>
            <input
              id="ap-nombre"
              type="text"
              required
              autoFocus
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder={t("patients.fieldNombrePlaceholder")}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-celeste-dark/30"
            />
          </div>

          {/* DNI — required */}
          <div>
            <label htmlFor="ap-dni" className="block text-xs font-medium text-ink-muted mb-1">
              {t("patients.fieldDNI")} *
            </label>
            <input
              id="ap-dni"
              type="text"
              required
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              placeholder={t("patients.fieldDNIPlaceholder")}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-celeste-dark/30"
            />
          </div>

          {/* Teléfono */}
          <div>
            <label htmlFor="ap-telefono" className="block text-xs font-medium text-ink-muted mb-1">
              {t("patients.fieldTelefono")}
            </label>
            <input
              id="ap-telefono"
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder={t("patients.fieldTelefonoPlaceholder")}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-celeste-dark/30"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="ap-email" className="block text-xs font-medium text-ink-muted mb-1">
              {t("patients.fieldEmail")}
            </label>
            <input
              id="ap-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("patients.fieldEmailPlaceholder")}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-celeste-dark/30"
            />
          </div>

          {/* Fecha de nacimiento */}
          <div>
            <label htmlFor="ap-fecha" className="block text-xs font-medium text-ink-muted mb-1">
              {t("patients.fieldFechaNacimiento")}
            </label>
            <input
              id="ap-fecha"
              type="date"
              value={fechaNacimiento}
              onChange={(e) => setFechaNacimiento(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-celeste-dark/30"
            />
          </div>

          {/* Financiador */}
          <div>
            <label
              htmlFor="ap-financiador"
              className="block text-xs font-medium text-ink-muted mb-1"
            >
              {t("patients.fieldFinanciador")}
            </label>
            <select
              id="ap-financiador"
              value={financiador}
              onChange={(e) => setFinanciador(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-celeste-dark/30"
            >
              <option value="">{t("patients.selectInsurance")}</option>
              <option value="Particular">{t("patients.particular")}</option>
              {INSURANCE_OPTIONS.map((ins) => (
                <option key={ins} value={ins}>
                  {ins}
                </option>
              ))}
            </select>
          </div>

          {/* Plan */}
          <div>
            <label htmlFor="ap-plan" className="block text-xs font-medium text-ink-muted mb-1">
              {t("patients.fieldPlan")}
            </label>
            <input
              id="ap-plan"
              type="text"
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              placeholder={t("patients.fieldPlanPlaceholder")}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-celeste-dark/30"
            />
          </div>

          {/* Dirección */}
          <div className="sm:col-span-2">
            <label htmlFor="ap-direccion" className="block text-xs font-medium text-ink-muted mb-1">
              {t("patients.fieldDireccion")}
            </label>
            <input
              id="ap-direccion"
              type="text"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              placeholder={t("patients.fieldDireccionPlaceholder")}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-celeste-dark/30"
            />
          </div>
        </div>

        {/* ── Triage / Intake Checklist ── */}
        <div className="border border-border rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowTriage(!showTriage)}
            className="w-full flex items-center justify-between px-4 py-3 bg-surface/50 hover:bg-surface transition"
          >
            <span className="text-xs font-bold text-ink uppercase tracking-wider">
              {locale === "en"
                ? "Intake Triage Checklist"
                : "Checklist de Triage / Motivo de Consulta"}
            </span>
            <svg
              className={`w-4 h-4 text-ink-muted transition-transform ${showTriage ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showTriage && (
            <div className="p-4 space-y-4">
              {/* Body Systems Symptoms */}
              <div>
                <p className="text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-2">
                  {locale === "en" ? "Symptoms by Body System" : "Sintomas por Sistema Corporal"}
                </p>
                <div className="space-y-3 max-h-[30vh] overflow-y-auto pr-1">
                  {Object.entries(bodySystems).map(([system, symptoms]) => (
                    <div key={system}>
                      <p className="text-xs font-semibold text-ink mb-1">{system}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {symptoms.map((symptom) => {
                          const isActive = selectedSymptoms.includes(symptom);
                          return (
                            <button
                              key={symptom}
                              type="button"
                              onClick={() => toggleSymptom(symptom)}
                              className={`text-[10px] px-2 py-1 rounded border transition ${
                                isActive
                                  ? "bg-celeste-dark text-white border-celeste-dark"
                                  : "bg-white text-ink/60 border-border hover:border-ink/30"
                              }`}
                            >
                              {symptom}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                {selectedSymptoms.length > 0 && (
                  <p className="text-[10px] text-celeste-dark font-medium mt-2">
                    {selectedSymptoms.length} {locale === "en" ? "selected" : "seleccionado(s)"}
                  </p>
                )}
              </div>

              {/* Severity + Frequency */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-medium text-ink-muted mb-1">
                    {locale === "en" ? "Severity" : "Severidad"}: {severity}/10
                    {severityLabels[severity] ? ` (${severityLabels[severity]})` : ""}
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={severity}
                    onChange={(e) => setSeverity(Number(e.target.value))}
                    className="w-full accent-celeste-dark"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-ink-muted mb-1">
                    {locale === "en" ? "Frequency" : "Frecuencia"}
                  </label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="w-full px-2 py-1.5 border border-border rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-celeste-dark/30"
                  >
                    <option value="">--</option>
                    {frequencyOptions.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Duration + Triggers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-medium text-ink-muted mb-1">
                    {locale === "en" ? "Duration" : "Duracion"}
                  </label>
                  <input
                    type="text"
                    value={triageDuration}
                    onChange={(e) => setTriageDuration(e.target.value)}
                    placeholder={locale === "en" ? "e.g. 3 days" : "ej. 3 dias"}
                    className="w-full px-2 py-1.5 border border-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-celeste-dark/30"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-ink-muted mb-1">
                    {locale === "en" ? "Triggers" : "Desencadenantes"}
                  </label>
                  <input
                    type="text"
                    value={triageTriggers}
                    onChange={(e) => setTriageTriggers(e.target.value)}
                    placeholder={locale === "en" ? "e.g. after eating" : "ej. al caminar, al comer"}
                    className="w-full px-2 py-1.5 border border-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-celeste-dark/30"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Notas */}
        <div>
          <label htmlFor="ap-notas" className="block text-xs font-medium text-ink-muted mb-1">
            {t("patients.fieldNotas")}
          </label>
          <textarea
            id="ap-notas"
            rows={2}
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            placeholder={t("patients.fieldNotasPlaceholder")}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-celeste-dark/30"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-ink-muted hover:text-ink border border-border rounded-lg transition"
          >
            {t("patients.cancel")}
          </button>
          <button
            type="submit"
            disabled={saving || !nombre.trim() || !dni.trim()}
            className="px-5 py-2 text-sm font-semibold bg-celeste-dark text-white rounded-lg hover:bg-celeste transition disabled:opacity-50"
          >
            {saving ? t("patients.saving") : t("patients.savePatient")}
          </button>
        </div>
      </form>
    </dialog>
  );
}

"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/components/Toast";
import { useDemoAction } from "@/components/DemoModal";
import { Card, CardContent, StatusBadge, PageHeader, Input, Select, Button } from "@/components/ui";
import {
  useLeads,
  useLeadStats,
  useConversations,
  useMessages,
  useSendMessage,
  useUpdateLead,
} from "@/lib/hooks/useCRM";
import type { Lead, LeadEstado, Conversation } from "@/lib/types";

// ─── Demo patient data ──────────────────────────────────────

const pacientes = [
  {
    id: "P001",
    nombre: "María Elena",
    apellido: "González",
    dni: "27.845.332",
    edad: 67,
    sexo: "F",
    financiador: "PAMI",
    plan: "Básico",
    telefono: "11-4523-8891",
    email: "maria.gonzalez@gmail.com",
    ultimaVisita: "07/03/2026",
    estado: "activo" as const,
    turnos: 3,
  },
  {
    id: "P002",
    nombre: "Jorge Alberto",
    apellido: "Fernández",
    dni: "20.112.485",
    edad: 54,
    sexo: "M",
    financiador: "OSDE 310",
    plan: "310",
    telefono: "11-5567-2234",
    email: "jfernandez@outlook.com",
    ultimaVisita: "05/03/2026",
    estado: "activo" as const,
    turnos: 1,
  },
  {
    id: "P003",
    nombre: "Lucía",
    apellido: "Martínez",
    dni: "35.678.901",
    edad: 32,
    sexo: "F",
    financiador: "Swiss Medical",
    plan: "SMG 30",
    telefono: "11-3345-6789",
    email: "lucia.mtz@gmail.com",
    ultimaVisita: "01/03/2026",
    estado: "activo" as const,
    turnos: 2,
  },
  {
    id: "P004",
    nombre: "Carlos Raúl",
    apellido: "López",
    dni: "14.567.890",
    edad: 72,
    sexo: "M",
    financiador: "PAMI",
    plan: "Básico",
    telefono: "11-4412-3356",
    email: null,
    ultimaVisita: "28/02/2026",
    estado: "activo" as const,
    turnos: 5,
  },
  {
    id: "P005",
    nombre: "Ana Sofía",
    apellido: "Russo",
    dni: "38.901.234",
    edad: 28,
    sexo: "F",
    financiador: "Galeno",
    plan: "Azul",
    telefono: "11-6678-4455",
    email: "anarusso@live.com",
    ultimaVisita: "06/03/2026",
    estado: "activo" as const,
    turnos: 1,
  },
  {
    id: "P006",
    nombre: "Roberto",
    apellido: "Díaz",
    dni: "18.234.567",
    edad: 61,
    sexo: "M",
    financiador: "IOMA",
    plan: "Obligatorio",
    telefono: "221-445-6677",
    email: "rdiaz@yahoo.com.ar",
    ultimaVisita: "04/03/2026",
    estado: "activo" as const,
    turnos: 2,
  },
  {
    id: "P007",
    nombre: "Valentina",
    apellido: "Morales",
    dni: "40.123.456",
    edad: 24,
    sexo: "F",
    financiador: "Swiss Medical",
    plan: "SMG 50",
    telefono: "11-2234-5566",
    email: "vmorales@gmail.com",
    ultimaVisita: "02/03/2026",
    estado: "activo" as const,
    turnos: 0,
  },
  {
    id: "P008",
    nombre: "Héctor Osvaldo",
    apellido: "Pereyra",
    dni: "12.345.678",
    edad: 78,
    sexo: "M",
    financiador: "PAMI",
    plan: "Básico",
    telefono: "11-4456-7788",
    email: null,
    ultimaVisita: "25/02/2026",
    estado: "inactivo" as const,
    turnos: 0,
  },
  {
    id: "P009",
    nombre: "Florencia",
    apellido: "Castro",
    dni: "33.456.789",
    edad: 35,
    sexo: "F",
    financiador: "OSDE 210",
    plan: "210",
    telefono: "11-5578-9900",
    email: "fcastro@gmail.com",
    ultimaVisita: "08/03/2026",
    estado: "activo" as const,
    turnos: 1,
  },
  {
    id: "P010",
    nombre: "Raúl Eduardo",
    apellido: "Sánchez",
    dni: "16.789.012",
    edad: 69,
    sexo: "M",
    financiador: "PAMI",
    plan: "Básico",
    telefono: "11-4433-2211",
    email: "raulsanchez@hotmail.com",
    ultimaVisita: "03/03/2026",
    estado: "activo" as const,
    turnos: 4,
  },
  {
    id: "P011",
    nombre: "Camila",
    apellido: "Torres",
    dni: "42.567.890",
    edad: 21,
    sexo: "F",
    financiador: "Medifé",
    plan: "Bronce",
    telefono: "11-7789-0011",
    email: "ctorres@gmail.com",
    ultimaVisita: "09/03/2026",
    estado: "activo" as const,
    turnos: 1,
  },
  {
    id: "P012",
    nombre: "Miguel Ángel",
    apellido: "Acosta",
    dni: "22.890.123",
    edad: 58,
    sexo: "M",
    financiador: "Sancor Salud",
    plan: "3000",
    telefono: "341-456-7890",
    email: "macosta@empresa.com",
    ultimaVisita: "07/03/2026",
    estado: "activo" as const,
    turnos: 2,
  },
];

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
  const { showDemo } = useDemoAction();
  const [activeTab, setActiveTab] = useState<PacientesTab>(initialTab);

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
  }, [search, filtroFinanciador, filtroEstado]);

  const unreadCount = conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Pacientes"
        description={`${pacientes.length} pacientes · ${leadTotal} consultas nuevas`}
        breadcrumbs={[{ label: "Panel", href: "/dashboard" }, { label: "Pacientes" }]}
        actions={
          activeTab === "leads" ? (
            <Button onClick={() => showDemo("Nuevo lead manual")}>+ Nueva consulta</Button>
          ) : activeTab === "pacientes" ? (
            <Button onClick={() => showDemo("Nuevo paciente")}>+ Nuevo paciente</Button>
          ) : null
        }
      />

      {/* ── Tabs ────────────────────────────────────────── */}
      <div className="flex gap-1 border-b border-border" role="tablist">
        <TabButton
          active={activeTab === "leads"}
          onClick={() => setActiveTab("leads")}
          badge={leadTotal > 0 ? leadTotal : undefined}
        >
          Consultas nuevas
        </TabButton>
        <TabButton active={activeTab === "pacientes"} onClick={() => setActiveTab("pacientes")}>
          Pacientes
        </TabButton>
        <TabButton
          active={activeTab === "inbox"}
          onClick={() => setActiveTab("inbox")}
          badge={unreadCount > 0 ? unreadCount : undefined}
        >
          Mensajes
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
          filtered={filtered}
          search={search}
          setSearch={setSearch}
          filtroFinanciador={filtroFinanciador}
          setFiltroFinanciador={setFiltroFinanciador}
          filtroEstado={filtroEstado}
          setFiltroEstado={setFiltroEstado}
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
}: {
  active: boolean;
  onClick: () => void;
  badge?: number;
  children: React.ReactNode;
}) {
  return (
    <button
      role="tab"
      aria-selected={active}
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
  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        role="region"
        aria-label="Indicadores de leads"
      >
        <KPICard label="Consultas nuevas" value={stats?.nuevo ?? 0} accent="border-l-blue-400" />
        <KPICard
          label="En seguimiento"
          value={(stats?.contactado ?? 0) + (stats?.interesado ?? 0)}
          accent="border-l-yellow-400"
        />
        <KPICard
          label="Turnos agendados"
          value={stats?.turno_agendado ?? 0}
          accent="border-l-celeste"
        />
        <KPICard
          label="Tasa conversión"
          value={`${stats?.conversionRate ?? 0}%`}
          accent="border-l-green-500"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3" role="search" aria-label="Filtrar leads">
        <div className="w-72">
          <Input
            placeholder="Buscar por nombre, teléfono o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Buscar lead"
          />
        </div>
        <Select
          options={FUENTE_OPTIONS}
          value={fuenteFilter}
          onChange={(e) => setFuenteFilter(e.target.value)}
          aria-label="Filtrar por fuente"
        />
        <Button variant="secondary" onClick={() => refreshLeads()}>
          ↻ Actualizar
        </Button>
      </div>

      {/* Pipeline columns */}
      {isLoading ? (
        <div className="text-center py-12 text-ink-muted">Cargando consultas...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4">
          {PIPELINE_COLUMNS.map((col) => (
            <div key={col.key} className="space-y-2">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <span
                  className={`w-2 h-2 rounded-full bg-current ${col.color.replace("border-l-", "text-")}`}
                />
                <span className="text-sm font-semibold text-ink">{col.label}</span>
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
  filtered,
  search,
  setSearch,
  filtroFinanciador,
  setFiltroFinanciador,
  filtroEstado,
  setFiltroEstado,
}: {
  filtered: typeof pacientes;
  search: string;
  setSearch: (v: string) => void;
  filtroFinanciador: string;
  setFiltroFinanciador: (v: string) => void;
  filtroEstado: string;
  setFiltroEstado: (v: string) => void;
}) {
  return (
    <div className="space-y-4">
      {/* KPI cards */}
      <div
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        role="region"
        aria-label="Indicadores de pacientes"
      >
        <KPICard label="Total pacientes" value={pacientes.length} accent="border-l-celeste" />
        <KPICard
          label="Activos"
          value={pacientes.filter((p) => p.estado === "activo").length}
          accent="border-l-green-400"
        />
        <KPICard
          label="PAMI"
          value={pacientes.filter((p) => p.financiador === "PAMI").length}
          accent="border-l-celeste-dark"
        />
        <KPICard
          label="Con turnos"
          value={pacientes.filter((p) => p.turnos > 0).length}
          accent="border-l-celeste"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3" role="search" aria-label="Buscar y filtrar pacientes">
        <div className="w-72">
          <Input
            placeholder="Buscar por nombre o DNI..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Buscar paciente"
          />
        </div>
        <Select
          options={financiadores}
          value={filtroFinanciador}
          onChange={(e) => setFiltroFinanciador(e.target.value)}
          aria-label="Filtrar por financiador"
        />
        <Select
          options={[
            { value: "Todos", label: "Todos" },
            { value: "activo", label: "Activo" },
            { value: "inactivo", label: "Inactivo" },
          ]}
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          aria-label="Filtrar por estado"
        />
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" aria-label="Lista de pacientes">
            <thead>
              <tr className="bg-[#F8FAFB] text-[10px] font-bold tracking-wider text-ink-muted uppercase">
                <th className="text-left px-5 py-3" scope="col">
                  Paciente
                </th>
                <th className="text-left px-5 py-3" scope="col">
                  DNI
                </th>
                <th className="text-left px-5 py-3" scope="col">
                  Financiador
                </th>
                <th className="text-center px-5 py-3" scope="col">
                  Edad
                </th>
                <th className="text-left px-5 py-3" scope="col">
                  Última visita
                </th>
                <th className="text-center px-5 py-3" scope="col">
                  Turnos
                </th>
                <th className="text-center px-5 py-3" scope="col">
                  Estado
                </th>
                <th className="text-center px-5 py-3" scope="col">
                  Acción
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr
                  key={p.id}
                  className="border-t border-border-light hover:bg-celeste-pale/30 transition"
                >
                  <td className="px-5 py-3 font-semibold text-ink">
                    {p.apellido}, {p.nombre}
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
                      label={p.estado === "activo" ? "Activo" : "Inactivo"}
                    />
                  </td>
                  <td className="px-5 py-3 text-center">
                    <Link
                      href={`/dashboard/pacientes/${p.id}`}
                      className="text-[10px] text-celeste-dark font-medium hover:underline"
                      aria-label={`Ver ficha de ${p.apellido}, ${p.nombre}`}
                    >
                      Ver ficha
                    </Link>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-sm text-ink-muted">
                    No se encontraron pacientes con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
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
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" style={{ minHeight: "60vh" }}>
      {/* Conversation list */}
      <div className="lg:col-span-1 border border-border rounded-lg overflow-hidden">
        <div className="p-3 border-b border-border bg-surface-alt">
          <div className="text-sm font-semibold text-ink">Conversaciones</div>
        </div>
        <div className="overflow-y-auto max-h-[60vh]">
          {isLoading ? (
            <div className="text-center py-8 text-ink-muted text-sm">Cargando...</div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-8 text-ink-muted text-sm">
              No hay conversaciones abiertas.
              <br />
              <span className="text-xs">Los mensajes de WhatsApp aparecerán aquí.</span>
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
                      {conv.lead?.nombre || conv.paciente?.nombre || "Sin nombre"}
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
            Seleccioná una conversación para ver los mensajes
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
          Último msg: {new Date(lead.last_message_at).toLocaleDateString("es-AR")}
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
  const { trigger: updateLead, isMutating } = useUpdateLead(lead.id);

  const handleStatusChange = async (newEstado: LeadEstado) => {
    try {
      await updateLead({ estado: newEstado });
      showToast(`Movido a "${newEstado}"`, "success");
      refreshLeads();
    } catch {
      showToast("Error al actualizar", "error");
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white border-l border-border shadow-xl z-50 overflow-y-auto">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold text-ink">Detalle de consulta</h3>
        <button onClick={onClose} className="text-ink-muted hover:text-ink text-xl">
          ✕
        </button>
      </div>
      <div className="p-4 space-y-4">
        <div className="space-y-2">
          <div className="text-lg font-semibold">{lead.nombre || "Sin nombre"}</div>
          <div className="text-sm text-ink-muted space-y-1">
            <div>Tel: {lead.telefono}</div>
            {lead.email && <div>Email: {lead.email}</div>}
            {lead.financiador && <div>Financiador: {lead.financiador}</div>}
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-ink-muted">Estado</label>
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
                {col.label}
              </button>
            ))}
          </div>
        </div>

        {lead.motivo && (
          <Card>
            <CardContent>
              <div className="text-xs font-medium text-ink-muted mb-1">Motivo</div>
              <div className="text-sm">{lead.motivo}</div>
            </CardContent>
          </Card>
        )}

        <div>
          <div className="text-xs font-medium text-ink-muted mb-1">Tags</div>
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
              <span className="text-xs text-ink-muted">Sin tags</span>
            )}
          </div>
        </div>

        {lead.notas && (
          <div>
            <div className="text-xs font-medium text-ink-muted mb-1">Notas</div>
            <div className="text-xs text-ink whitespace-pre-wrap bg-surface-alt rounded p-2">
              {lead.notas}
            </div>
          </div>
        )}

        <div className="text-xs text-ink-muted space-y-0.5 pt-2 border-t border-border">
          <div>Fuente: {lead.fuente}</div>
          <div>Creado: {new Date(lead.created_at).toLocaleString("es-AR")}</div>
          {lead.first_contact_at && (
            <div>Primer contacto: {new Date(lead.first_contact_at).toLocaleString("es-AR")}</div>
          )}
          {lead.converted_at && (
            <div>Convertido: {new Date(lead.converted_at).toLocaleString("es-AR")}</div>
          )}
        </div>
      </div>
    </div>
  );
}

function ConversationThread({ conversation }: { conversation: Conversation }) {
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
            {conversation.lead?.nombre || conversation.paciente?.nombre || "Sin nombre"}
          </div>
          <div className="text-xs text-ink-muted">{conversation.channel}</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f0f2f5]">
        {isLoading ? (
          <div className="text-center text-ink-muted text-sm">Cargando mensajes...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-ink-muted text-sm">Sin mensajes aún</div>
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
                    <span className="ml-1">
                      {msg.status === "delivered" || msg.status === "read" ? "✓✓" : "✓"}
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
          placeholder="Escribir mensaje..."
          className="flex-1 px-3 py-2 border border-border rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-celeste"
          disabled={sending}
        />
        <button
          onClick={handleSend}
          disabled={sending || !draft.trim()}
          className="px-4 py-2 bg-celeste text-white rounded-full text-sm font-medium disabled:opacity-50 hover:bg-celeste-dark transition-colors"
        >
          {sending ? "..." : "Enviar"}
        </button>
      </div>
    </>
  );
}

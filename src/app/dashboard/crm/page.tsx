"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, PageHeader, Input, Select, Button } from "@/components/ui";
import { useToast } from "@/components/Toast";
import { useDemoAction } from "@/components/DemoModal";
import {
  useLeads,
  useLeadStats,
  useConversations,
  useMessages,
  useSendMessage,
  useUpdateLead,
} from "@/lib/hooks/useCRM";
import type { Lead, LeadEstado, Conversation } from "@/lib/types";

// ─── Constants ───────────────────────────────────────────────

const PIPELINE_COLUMNS: { key: LeadEstado; label: string; color: string }[] = [
  { key: "nuevo", label: "Nuevos", color: "border-l-blue-400" },
  { key: "contactado", label: "Contactados", color: "border-l-yellow-400" },
  { key: "interesado", label: "Interesados", color: "border-l-orange-400" },
  { key: "turno_agendado", label: "Turno agendado", color: "border-l-celeste" },
  { key: "convertido", label: "Convertidos", color: "border-l-green-500" },
  { key: "perdido", label: "Perdidos", color: "border-l-red-400" },
];

const ESTADO_BADGE: Record<LeadEstado, string> = {
  nuevo: "bg-blue-50 text-blue-700 border-blue-200",
  contactado: "bg-amber-50 text-amber-700 border-amber-200",
  interesado: "bg-orange-50 text-orange-700 border-orange-200",
  turno_agendado: "bg-celeste-pale text-celeste-dark border-celeste-light",
  convertido: "bg-success-50 text-success-700 border-success-200",
  perdido: "bg-red-50 text-red-700 border-red-200",
};

const FUENTE_OPTIONS = [
  { value: "", label: "Todas las fuentes" },
  { value: "whatsapp", label: "📱 WhatsApp" },
  { value: "web", label: "🌐 Web" },
  { value: "referido", label: "👥 Referido" },
  { value: "chatbot", label: "🤖 Chatbot" },
  { value: "landing", label: "📄 Landing" },
  { value: "manual", label: "✏️ Manual" },
];

// ─── Tab type ────────────────────────────────────────────────

type CRMTab = "pipeline" | "inbox" | "stats";

// ─── Page ────────────────────────────────────────────────────

export default function CRMPage() {
  const { showToast } = useToast();
  const { showDemo } = useDemoAction();
  const [activeTab, setActiveTab] = useState<CRMTab>("pipeline");
  const [search, setSearch] = useState("");
  const [fuenteFilter, setFuenteFilter] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  // ─── Data ────────────────────────────────────────────────
  const {
    leads,
    total,
    isLoading: leadsLoading,
    refresh: refreshLeads,
  } = useLeads({
    search: search || undefined,
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

  return (
    <div className="space-y-5">
      <PageHeader
        title="CRM — Pipeline de leads"
        description={`${total} leads · ${conversations.length} conversaciones abiertas`}
        breadcrumbs={[{ label: "Panel", href: "/dashboard" }, { label: "CRM" }]}
        actions={<Button onClick={() => showDemo("Nuevo lead manual")}>+ Nuevo lead</Button>}
      />

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border" role="tablist">
        {(
          [
            { key: "pipeline", label: "🔁 Pipeline" },
            { key: "inbox", label: `💬 Inbox (${conversations.length})` },
            { key: "stats", label: "📊 Estadísticas" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={activeTab === tab.key}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-celeste text-celeste-dark"
                : "border-transparent text-ink-muted hover:text-ink"
            }`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4" role="region" aria-label="KPIs CRM">
        <KPICard label="Total leads" value={stats?.total ?? 0} color="celeste" />
        <KPICard label="Nuevos hoy" value={stats?.nuevo ?? 0} color="blue" />
        <KPICard label="Conversaciones" value={conversations.length} color="yellow" />
        <KPICard label="Tasa conversión" value={`${stats?.conversionRate ?? 0}%`} color="green" />
        <KPICard
          label="Tiempo promedio"
          value={stats?.avgTimeToConvert ? `${stats.avgTimeToConvert}h` : "–"}
          color="purple"
        />
      </div>

      {/* Tab Content */}
      {activeTab === "pipeline" && (
        <PipelineView
          pipeline={pipeline}
          search={search}
          setSearch={setSearch}
          fuenteFilter={fuenteFilter}
          setFuenteFilter={setFuenteFilter}
          isLoading={leadsLoading}
          selectedLead={selectedLead}
          setSelectedLead={setSelectedLead}
          refreshLeads={refreshLeads}
          showToast={showToast}
        />
      )}

      {activeTab === "inbox" && (
        <InboxView
          conversations={conversations}
          isLoading={convosLoading}
          selectedConversation={selectedConversation}
          setSelectedConversation={setSelectedConversation}
        />
      )}

      {activeTab === "stats" && <StatsView stats={stats} />}
    </div>
  );
}

// ─── KPI Card ────────────────────────────────────────────────

function KPICard({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: string;
}) {
  const borderColors: Record<string, string> = {
    celeste: "border-l-celeste",
    blue: "border-l-blue-400",
    yellow: "border-l-yellow-400",
    green: "border-l-green-500",
    purple: "border-l-purple-400",
  };
  return (
    <div
      className={`bg-white border border-border rounded-lg p-4 border-l-[3px] ${borderColors[color] || "border-l-gray-400"}`}
    >
      <div className="text-xs text-ink-muted">{label}</div>
      <div className="text-2xl font-bold text-ink mt-1">{value}</div>
    </div>
  );
}

// ─── Pipeline View (Kanban) ──────────────────────────────────

function PipelineView({
  pipeline,
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

      {isLoading ? (
        <div className="text-center py-12 text-ink-muted">Cargando pipeline...</div>
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
              <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
                {pipeline[col.key].length === 0 ? (
                  <div className="text-xs text-ink-muted text-center py-4">Sin leads</div>
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

      {/* Lead detail sidebar */}
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

// ─── Lead Card ───────────────────────────────────────────────

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
          className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded border ${ESTADO_BADGE[lead.estado]}`}
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

// ─── Fuente Icon ─────────────────────────────────────────────

function FuenteIcon({ fuente }: { fuente: string }) {
  const icons: Record<string, string> = {
    whatsapp: "📱",
    web: "🌐",
    referido: "👥",
    chatbot: "🤖",
    landing: "📄",
    manual: "✏️",
  };
  return (
    <span className="text-sm" title={fuente}>
      {icons[fuente] || "❓"}
    </span>
  );
}

// ─── Lead Detail Panel ───────────────────────────────────────

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
      showToast(`Lead movido a "${newEstado}"`, "success");
      refreshLeads();
    } catch {
      showToast("Error al actualizar lead", "error");
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white border-l border-border shadow-xl z-50 overflow-y-auto">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold text-ink">Detalle de lead</h3>
        <button onClick={onClose} className="text-ink-muted hover:text-ink text-xl">
          ✕
        </button>
      </div>
      <div className="p-4 space-y-4">
        {/* Lead info */}
        <div className="space-y-2">
          <div className="text-lg font-semibold">{lead.nombre || "Sin nombre"}</div>
          <div className="text-sm text-ink-muted space-y-1">
            <div>📱 {lead.telefono}</div>
            {lead.email && <div>📧 {lead.email}</div>}
            {lead.financiador && <div>🏥 {lead.financiador}</div>}
          </div>
        </div>

        {/* Status selector */}
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

        {/* Motivo */}
        {lead.motivo && (
          <Card>
            <CardContent>
              <div className="text-xs font-medium text-ink-muted mb-1">Motivo</div>
              <div className="text-sm">{lead.motivo}</div>
            </CardContent>
          </Card>
        )}

        {/* Tags */}
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

        {/* Notes */}
        {lead.notas && (
          <div>
            <div className="text-xs font-medium text-ink-muted mb-1">Notas</div>
            <div className="text-xs text-ink whitespace-pre-wrap bg-surface-alt rounded p-2">
              {lead.notas}
            </div>
          </div>
        )}

        {/* Metadata */}
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

// ─── Inbox View ──────────────────────────────────────────────

function InboxView({
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
              No hay conversaciones abiertas
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

// ─── Conversation Thread ─────────────────────────────────────

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
      // Error toast handled by SWR
    }
  };

  return (
    <>
      {/* Header */}
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

      {/* Messages */}
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

      {/* Compose */}
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

// ─── Stats View ──────────────────────────────────────────────

function StatsView({ stats }: { stats: ReturnType<typeof useLeadStats>["stats"] }) {
  if (!stats) {
    return <div className="text-center py-12 text-ink-muted">Cargando estadísticas...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Pipeline distribution */}
      <Card>
        <CardContent>
          <h3 className="font-semibold text-ink mb-4">Distribución del Pipeline</h3>
          <div className="space-y-3">
            {PIPELINE_COLUMNS.map((col) => {
              const count = stats[col.key] ?? 0;
              const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
              return (
                <div key={col.key} className="flex items-center gap-3">
                  <div className="w-28 text-sm text-ink-muted">{col.label}</div>
                  <div className="flex-1 bg-surface-alt rounded-full h-6 overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-celeste transition-all`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="w-16 text-sm text-right font-medium">
                    {count} ({pct}%)
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Fuente breakdown */}
      <Card>
        <CardContent>
          <h3 className="font-semibold text-ink mb-4">Leads por fuente</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(stats.byFuente).map(([fuente, count]) => (
              <div key={fuente} className="bg-surface-alt rounded-lg p-3 text-center">
                <FuenteIcon fuente={fuente} />
                <div className="text-lg font-bold text-ink mt-1">{count}</div>
                <div className="text-xs text-ink-muted capitalize">{fuente}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Conversion metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent>
            <h3 className="font-semibold text-ink mb-2">Tasa de conversión</h3>
            <div className="text-4xl font-bold text-celeste">{stats.conversionRate}%</div>
            <div className="text-xs text-ink-muted mt-1">
              {stats.convertido} de {stats.total} leads convertidos
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <h3 className="font-semibold text-ink mb-2">Tiempo promedio de conversión</h3>
            <div className="text-4xl font-bold text-celeste">
              {stats.avgTimeToConvert ? `${stats.avgTimeToConvert}h` : "–"}
            </div>
            <div className="text-xs text-ink-muted mt-1">
              Desde primer contacto hasta conversión
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

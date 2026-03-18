-- ─── 006: WhatsApp CRM — Leads, Conversations & Marketing ───
-- Adds WhatsApp-as-CRM pipeline: incoming messages auto-create leads
-- and patient profiles, with conversation threading and marketing campaigns.
-- Safe to run multiple times (all operations are IF NOT EXISTS / idempotent).

-- ═══════════════════════════════════════════════════════════════
-- 1. WHATSAPP CONFIG — Per-clinic WhatsApp Business settings
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.whatsapp_config (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id     UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  whatsapp_number TEXT NOT NULL,             -- e.g., "+5491155551234"
  display_name  TEXT NOT NULL DEFAULT '',    -- "Clínica San Martín"
  twilio_sid    TEXT,                        -- per-clinic Twilio sub-account (optional)
  twilio_token  TEXT,                        -- encrypted at app layer
  welcome_message TEXT DEFAULT '¡Hola! Gracias por comunicarte con nosotros. Un miembro de nuestro equipo te responderá a la brevedad. ¿En qué podemos ayudarte?',
  auto_reply    BOOLEAN DEFAULT true,        -- send welcome_message on first contact
  business_hours TEXT DEFAULT '08:00-20:00', -- when auto-reply is active
  out_of_hours_message TEXT DEFAULT 'Nuestro horario de atención es de 8:00 a 20:00. Te responderemos a primera hora.',
  notify_on_new_lead BOOLEAN DEFAULT true,   -- real-time alert on new lead
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(clinic_id)
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_config_clinic ON public.whatsapp_config(clinic_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_config_number ON public.whatsapp_config(whatsapp_number);

-- ═══════════════════════════════════════════════════════════════
-- 2. LEADS — Funnel pipeline from WhatsApp first contact
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.leads (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id     UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  nombre        TEXT,                        -- extracted from WhatsApp profile or first message
  telefono      TEXT NOT NULL,               -- WhatsApp number (e.g., "whatsapp:+5491155551234")
  email         TEXT,
  dni           TEXT,
  financiador   TEXT,
  motivo        TEXT,                        -- why they reached out (first message summary)
  fuente        TEXT NOT NULL DEFAULT 'whatsapp'
    CHECK (fuente IN ('whatsapp', 'web', 'referido', 'landing', 'chatbot', 'manual')),
  estado        TEXT NOT NULL DEFAULT 'nuevo'
    CHECK (estado IN ('nuevo', 'contactado', 'interesado', 'turno_agendado', 'convertido', 'perdido')),
  assigned_to   UUID REFERENCES public.profiles(id), -- staff member handling this lead
  paciente_id   UUID REFERENCES public.pacientes(id), -- NULL until converted
  tags          TEXT[] DEFAULT '{}',
  notas         TEXT,
  last_message_at TIMESTAMPTZ,
  first_contact_at TIMESTAMPTZ DEFAULT now(),
  converted_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(clinic_id, telefono)
);

CREATE INDEX IF NOT EXISTS idx_leads_clinic ON public.leads(clinic_id);
CREATE INDEX IF NOT EXISTS idx_leads_estado ON public.leads(estado);
CREATE INDEX IF NOT EXISTS idx_leads_telefono ON public.leads(telefono);
CREATE INDEX IF NOT EXISTS idx_leads_paciente ON public.leads(paciente_id);
CREATE INDEX IF NOT EXISTS idx_leads_assigned ON public.leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_last_msg ON public.leads(last_message_at DESC);

-- ═══════════════════════════════════════════════════════════════
-- 3. CONVERSATIONS — Message threads (WhatsApp + other channels)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.conversations (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id     UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  lead_id       UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  paciente_id   UUID REFERENCES public.pacientes(id) ON DELETE SET NULL,
  channel       TEXT NOT NULL DEFAULT 'whatsapp'
    CHECK (channel IN ('whatsapp', 'web_chat', 'email', 'telefono')),
  status        TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'pending', 'resolved', 'archived')),
  subject       TEXT,                        -- optional: "Consulta turno cardiología"
  assigned_to   UUID REFERENCES public.profiles(id),
  unread_count  INTEGER DEFAULT 0,
  last_message_at TIMESTAMPTZ DEFAULT now(),
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_conversations_clinic ON public.conversations(clinic_id);
CREATE INDEX IF NOT EXISTS idx_conversations_lead ON public.conversations(lead_id);
CREATE INDEX IF NOT EXISTS idx_conversations_paciente ON public.conversations(paciente_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON public.conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_last_msg ON public.conversations(last_message_at DESC);

-- ═══════════════════════════════════════════════════════════════
-- 4. MESSAGES — Individual messages within conversations
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.messages (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id       UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  direction       TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  sender_type     TEXT NOT NULL CHECK (sender_type IN ('patient', 'lead', 'staff', 'system', 'bot')),
  sender_id       UUID,                      -- profiles.id for staff, leads.id or pacientes.id for patient
  sender_name     TEXT,                       -- display name
  body            TEXT NOT NULL,
  media_url       TEXT,                       -- image/document attachment
  media_type      TEXT,                       -- "image/jpeg", "application/pdf", etc.
  twilio_sid      TEXT,                       -- Twilio MessageSid for tracking
  status          TEXT NOT NULL DEFAULT 'sent'
    CHECK (status IN ('queued', 'sent', 'delivered', 'read', 'failed')),
  error_message   TEXT,
  metadata        JSONB DEFAULT '{}',         -- extra data: template_name, campaign_id, etc.
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_clinic ON public.messages(clinic_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_twilio_sid ON public.messages(twilio_sid);

-- ═══════════════════════════════════════════════════════════════
-- 5. WHATSAPP TEMPLATES — Approved message templates per clinic
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.whatsapp_templates (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id     UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,                -- "reminder_24h", "welcome", "campaign_promo"
  category      TEXT NOT NULL DEFAULT 'utility'
    CHECK (category IN ('utility', 'marketing', 'authentication')),
  language      TEXT NOT NULL DEFAULT 'es_AR',
  body_template TEXT NOT NULL,                -- "Hola {{1}}, tu turno es el {{2}} a las {{3}}"
  variables     TEXT[] DEFAULT '{}',          -- ["paciente_nombre", "turno_fecha", "turno_hora"]
  header_text   TEXT,
  footer_text   TEXT,
  active        BOOLEAN DEFAULT true,
  approved      BOOLEAN DEFAULT false,        -- Meta/Twilio approval status
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(clinic_id, name)
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_templates_clinic ON public.whatsapp_templates(clinic_id);

-- ═══════════════════════════════════════════════════════════════
-- 6. MARKETING CAMPAIGNS — Bulk WhatsApp outreach
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.marketing_campaigns (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id       UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  description     TEXT,
  template_id     UUID REFERENCES public.whatsapp_templates(id),
  audience_filter JSONB DEFAULT '{}',         -- {"financiador": "OSDE", "last_visit_before": "2026-01-01"}
  audience_count  INTEGER DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'cancelled')),
  scheduled_at    TIMESTAMPTZ,
  sent_at         TIMESTAMPTZ,
  stats           JSONB DEFAULT '{"sent": 0, "delivered": 0, "read": 0, "replied": 0, "failed": 0}',
  created_by      UUID REFERENCES public.profiles(id),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_campaigns_clinic ON public.marketing_campaigns(clinic_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.marketing_campaigns(status);

-- ═══════════════════════════════════════════════════════════════
-- 7. CAMPAIGN RECIPIENTS — Track per-recipient delivery
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.campaign_recipients (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id   UUID NOT NULL REFERENCES public.marketing_campaigns(id) ON DELETE CASCADE,
  paciente_id   UUID REFERENCES public.pacientes(id),
  lead_id       UUID REFERENCES public.leads(id),
  telefono      TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'replied', 'failed', 'opted_out')),
  twilio_sid    TEXT,
  sent_at       TIMESTAMPTZ,
  delivered_at  TIMESTAMPTZ,
  read_at       TIMESTAMPTZ,
  replied_at    TIMESTAMPTZ,
  error_message TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_recipients_campaign ON public.campaign_recipients(campaign_id);
CREATE INDEX IF NOT EXISTS idx_recipients_telefono ON public.campaign_recipients(telefono);

-- ═══════════════════════════════════════════════════════════════
-- 8. RLS POLICIES
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE public.whatsapp_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_recipients ENABLE ROW LEVEL SECURITY;

-- Clinic-isolated policies for all CRM tables
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'whatsapp_config', 'leads', 'conversations', 'messages',
    'whatsapp_templates', 'marketing_campaigns'
  ])
  LOOP
    BEGIN
      EXECUTE format(
        'CREATE POLICY "Clinic isolation: %I" ON public.%I
         FOR ALL TO authenticated
         USING (clinic_id = public.get_clinic_id())
         WITH CHECK (clinic_id = public.get_clinic_id())',
        tbl, tbl
      );
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END LOOP;
END $$;

-- campaign_recipients: access via campaign's clinic_id
DO $$ BEGIN
  CREATE POLICY "Clinic isolation: campaign_recipients" ON public.campaign_recipients
    FOR ALL TO authenticated
    USING (
      campaign_id IN (
        SELECT id FROM public.marketing_campaigns
        WHERE clinic_id = public.get_clinic_id()
      )
    )
    WITH CHECK (
      campaign_id IN (
        SELECT id FROM public.marketing_campaigns
        WHERE clinic_id = public.get_clinic_id()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Service role bypass for webhook (Twilio callbacks use service_role key)
DO $$ BEGIN
  CREATE POLICY "Service role bypass: leads" ON public.leads
    FOR ALL TO service_role USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Service role bypass: conversations" ON public.conversations
    FOR ALL TO service_role USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Service role bypass: messages" ON public.messages
    FOR ALL TO service_role USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Service role bypass: whatsapp_config" ON public.whatsapp_config
    FOR ALL TO service_role USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════
-- 9. AUTO-UPDATE TRIGGERS
-- ═══════════════════════════════════════════════════════════════

-- Reuse the set_updated_at() trigger function from 002_core_schema.sql
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'whatsapp_config', 'leads', 'conversations',
    'whatsapp_templates', 'marketing_campaigns'
  ])
  LOOP
    BEGIN
      EXECUTE format(
        'CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.%I
         FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()',
        tbl
      );
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END LOOP;
END $$;

-- ═══════════════════════════════════════════════════════════════
-- 10. REALTIME — Enable for live CRM dashboard updates
-- ═══════════════════════════════════════════════════════════════

ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

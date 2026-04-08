-- =============================================================================
-- Cóndor Salud — Modules 11-14 Database Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL → New query)
-- =============================================================================

-- ─── Enable extensions ───────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- MODULE 11 — FARMACIA ONLINE
-- =============================================================================

CREATE TABLE IF NOT EXISTS medications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  lab TEXT NOT NULL,
  category TEXT NOT NULL,
  price INTEGER NOT NULL, -- in ARS cents (e.g., 1240000 = $12,400)
  pami_coverage SMALLINT NOT NULL DEFAULT 0, -- percentage 0-100
  os_coverage SMALLINT NOT NULL DEFAULT 0,
  prepaga_coverage SMALLINT NOT NULL DEFAULT 0,
  stock TEXT NOT NULL DEFAULT 'Disponible' CHECK (stock IN ('Disponible', 'Últimas unidades', 'Sin stock')),
  requires_prescription BOOLEAN NOT NULL DEFAULT true,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS prescriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE, -- e.g., RX-2026-0891
  patient_id UUID, -- FK to patients when available
  patient_name TEXT NOT NULL,
  doctor_name TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  items JSONB NOT NULL DEFAULT '[]', -- array of { medication_id, name, quantity }
  status TEXT NOT NULL DEFAULT 'Pendiente' CHECK (status IN ('Pendiente', 'En carrito', 'Entregado', 'Cancelado')),
  financiador TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE, -- e.g., DEL-4521
  prescription_id UUID REFERENCES prescriptions(id),
  patient_name TEXT NOT NULL,
  address TEXT NOT NULL,
  item_count INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'Preparando' CHECK (status IN ('Preparando', 'En camino', 'Entregado', 'Cancelado')),
  eta TEXT,
  courier TEXT NOT NULL DEFAULT 'Rappi Farma',
  progress SMALLINT NOT NULL DEFAULT 0, -- 0-100
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS recurring_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE, -- e.g., REC-091
  patient_name TEXT NOT NULL,
  patient_id UUID,
  medications JSONB NOT NULL DEFAULT '[]', -- array of medication names
  frequency TEXT NOT NULL DEFAULT 'Mensual',
  next_delivery DATE NOT NULL,
  financiador TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Activo' CHECK (status IN ('Activo', 'Pausado', 'Cancelado')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- MODULE 12 — TELEMEDICINA
-- =============================================================================

CREATE TABLE IF NOT EXISTS consultations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE, -- e.g., TC-0811
  patient_name TEXT NOT NULL,
  patient_id UUID,
  doctor_name TEXT NOT NULL,
  doctor_id UUID,
  specialty TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  time TIME NOT NULL,
  duration TEXT, -- e.g., "22 min"
  status TEXT NOT NULL DEFAULT 'Programada' CHECK (status IN ('Programada', 'En sala', 'En curso', 'Completada', 'No show', 'Cancelada')),
  billed BOOLEAN NOT NULL DEFAULT false,
  bill_code TEXT, -- nomenclador code
  prescription_sent BOOLEAN NOT NULL DEFAULT false,
  summary_sent BOOLEAN NOT NULL DEFAULT false,
  financiador TEXT,
  video_room_url TEXT,
  recording_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS waiting_room (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consultation_id UUID REFERENCES consultations(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  age SMALLINT,
  reason TEXT NOT NULL,
  queue_position SMALLINT NOT NULL DEFAULT 0,
  wait_time TEXT,
  intake_complete BOOLEAN NOT NULL DEFAULT false,
  financiador TEXT,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- MODULE 13 — DIRECTORIO MÉDICO
-- =============================================================================

CREATE TABLE IF NOT EXISTS doctors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  location TEXT NOT NULL,
  address TEXT,
  financiadores JSONB NOT NULL DEFAULT '[]', -- array of financiador names
  rating NUMERIC(2,1) NOT NULL DEFAULT 0.0,
  review_count INTEGER NOT NULL DEFAULT 0,
  next_slot TEXT, -- e.g., "Hoy 14:30"
  available BOOLEAN NOT NULL DEFAULT true,
  teleconsulta BOOLEAN NOT NULL DEFAULT false,
  experience TEXT, -- e.g., "18 años"
  languages JSONB NOT NULL DEFAULT '["Español"]',
  bio TEXT,
  lat DOUBLE PRECISION,              -- latitude (WGS84)
  lng DOUBLE PRECISION,              -- longitude (WGS84)
  photo_url TEXT,                     -- profile photo URL
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS doctor_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL, -- display name, e.g., "Carlos M."
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  text TEXT,
  verified BOOLEAN NOT NULL DEFAULT false,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS doctor_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time_slot TIME NOT NULL,
  booked BOOLEAN NOT NULL DEFAULT false,
  patient_id UUID,
  UNIQUE(doctor_id, date, time_slot)
);

-- =============================================================================
-- MODULE 14 — TRIAGE DE SÍNTOMAS
-- =============================================================================

CREATE TABLE IF NOT EXISTS triages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE, -- e.g., TRI-0341
  patient_name TEXT NOT NULL,
  patient_id UUID,
  symptoms JSONB NOT NULL DEFAULT '[]', -- array of symptom strings
  severity SMALLINT NOT NULL DEFAULT 5 CHECK (severity BETWEEN 1 AND 10),
  frequency TEXT NOT NULL DEFAULT 'Primera vez',
  duration TEXT,
  triggers TEXT,
  free_notes TEXT,
  photo_urls JSONB NOT NULL DEFAULT '[]', -- array of storage URLs
  routed_specialty TEXT,
  routed_doctor TEXT,
  status TEXT NOT NULL DEFAULT 'Pendiente' CHECK (status IN ('Pendiente', 'En consulta', 'Completado', 'Cancelado')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS clinical_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  triage_id UUID REFERENCES triages(id),
  consultation_id UUID REFERENCES consultations(id),
  doctor_name TEXT NOT NULL,
  doctor_id UUID,
  patient_name TEXT NOT NULL,
  icd10_codes JSONB NOT NULL DEFAULT '[]', -- array of { code, description }
  notes TEXT,
  treatment_plan TEXT,
  referrals JSONB NOT NULL DEFAULT '[]', -- array of specialty names
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_medications_category ON medications(category);
CREATE INDEX IF NOT EXISTS idx_medications_active ON medications(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_prescriptions_status ON prescriptions(status);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON deliveries(status);
CREATE INDEX IF NOT EXISTS idx_consultations_date ON consultations(date);
CREATE INDEX IF NOT EXISTS idx_consultations_status ON consultations(status);
CREATE INDEX IF NOT EXISTS idx_doctors_specialty ON doctors(specialty);
CREATE INDEX IF NOT EXISTS idx_doctors_location ON doctors(location);
CREATE INDEX IF NOT EXISTS idx_doctors_active ON doctors(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_doctor_reviews_doctor ON doctor_reviews(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_availability_date ON doctor_availability(doctor_id, date);
CREATE INDEX IF NOT EXISTS idx_triages_status ON triages(status);
CREATE INDEX IF NOT EXISTS idx_clinical_notes_triage ON clinical_notes(triage_id);
CREATE INDEX IF NOT EXISTS idx_clinical_notes_consultation ON clinical_notes(consultation_id);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE waiting_room ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE triages ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_notes ENABLE ROW LEVEL SECURITY;

-- Default policy: authenticated users can read all
-- (In production, scope by clinic_id / tenant)
DO $$ 
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN 
    SELECT unnest(ARRAY[
      'medications','prescriptions','deliveries','recurring_orders',
      'consultations','waiting_room','doctors','doctor_reviews',
      'doctor_availability','triages','clinical_notes'
    ])
  LOOP
    BEGIN
      EXECUTE format(
        'CREATE POLICY "Allow authenticated read" ON %I FOR SELECT TO authenticated USING (true)',
        tbl
      );
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
      EXECUTE format(
        'CREATE POLICY "Allow authenticated write" ON %I FOR ALL TO authenticated USING (true) WITH CHECK (true)',
        tbl
      );
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END LOOP;
END $$;

-- =============================================================================
-- Supabase Storage bucket for triage photos
-- Run separately or via Dashboard → Storage → New bucket
-- =============================================================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('triage-photos', 'triage-photos', false);
-- =============================================================================
-- Cóndor Salud — Core Schema (Modules 1-10 + Auth + Multi-tenant)
-- Depends on: 001_modules_11_14.sql
-- Run this in Supabase SQL Editor (Dashboard → SQL → New query)
-- =============================================================================

-- ─── Enable extensions ───────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- MULTI-TENANT FOUNDATION
-- =============================================================================

-- ─── Clinics (tenant anchor) ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clinics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  cuit TEXT NOT NULL UNIQUE,        -- e.g., "30-12345678-9"
  plan_tier TEXT NOT NULL DEFAULT 'starter'
    CHECK (plan_tier IN ('starter', 'growth', 'scale', 'enterprise')),
  sedes INTEGER NOT NULL DEFAULT 1,
  provincia TEXT NOT NULL DEFAULT 'CABA',
  localidad TEXT NOT NULL DEFAULT '',
  especialidad TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  logo_url TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  demo BOOLEAN NOT NULL DEFAULT false,
  onboarding_complete BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Profiles (extends auth.users) ──────────────────────────────────────────
-- One profile per auth.users row. Links user → clinic + role.
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin'
    CHECK (role IN ('admin', 'medico', 'facturacion', 'recepcion')),
  full_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  phone TEXT,
  especialidad TEXT,
  matricula TEXT,                     -- medical license number
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_clinic ON profiles(clinic_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- =============================================================================
-- MODULE 1 — PACIENTES
-- =============================================================================

CREATE TABLE IF NOT EXISTS pacientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  dni TEXT NOT NULL,
  email TEXT,
  telefono TEXT,
  fecha_nacimiento DATE,
  direccion TEXT,
  financiador TEXT NOT NULL DEFAULT '',
  plan TEXT NOT NULL DEFAULT '',
  ultima_visita DATE,
  estado TEXT NOT NULL DEFAULT 'activo'
    CHECK (estado IN ('activo', 'inactivo')),
  notas TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(clinic_id, dni)
);

CREATE INDEX IF NOT EXISTS idx_pacientes_clinic ON pacientes(clinic_id);
CREATE INDEX IF NOT EXISTS idx_pacientes_nombre ON pacientes(clinic_id, nombre);
CREATE INDEX IF NOT EXISTS idx_pacientes_financiador ON pacientes(clinic_id, financiador);
CREATE INDEX IF NOT EXISTS idx_pacientes_estado ON pacientes(clinic_id, estado);

-- =============================================================================
-- MODULE 2 — FACTURACIÓN
-- =============================================================================

CREATE TABLE IF NOT EXISTS facturas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  numero TEXT NOT NULL,              -- e.g., "FC-2026-001847"
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  financiador TEXT NOT NULL,
  paciente TEXT NOT NULL,            -- display name (denormalized for speed)
  paciente_id UUID REFERENCES pacientes(id),
  prestacion TEXT NOT NULL,
  codigo_nomenclador TEXT NOT NULL,
  monto INTEGER NOT NULL,            -- ARS (whole pesos, no cents for simplicity)
  estado TEXT NOT NULL DEFAULT 'pendiente'
    CHECK (estado IN ('presentada', 'cobrada', 'rechazada', 'pendiente', 'en_observacion')),
  fecha_presentacion DATE,
  fecha_cobro DATE,
  cae TEXT,                          -- AFIP electronic authorization code
  profesional_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(clinic_id, numero)
);

CREATE INDEX IF NOT EXISTS idx_facturas_clinic ON facturas(clinic_id);
CREATE INDEX IF NOT EXISTS idx_facturas_estado ON facturas(clinic_id, estado);
CREATE INDEX IF NOT EXISTS idx_facturas_financiador ON facturas(clinic_id, financiador);
CREATE INDEX IF NOT EXISTS idx_facturas_fecha ON facturas(clinic_id, fecha DESC);

-- =============================================================================
-- MODULE 3 — RECHAZOS
-- =============================================================================

CREATE TABLE IF NOT EXISTS rechazos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  factura_id UUID REFERENCES facturas(id) ON DELETE SET NULL,
  factura_numero TEXT NOT NULL,
  financiador TEXT NOT NULL,
  paciente TEXT NOT NULL,
  prestacion TEXT NOT NULL,
  monto INTEGER NOT NULL,
  motivo TEXT NOT NULL
    CHECK (motivo IN (
      'codigo_invalido', 'afiliado_no_encontrado', 'vencida',
      'duplicada', 'sin_autorizacion', 'datos_incompletos',
      'nomenclador_desactualizado'
    )),
  motivo_detalle TEXT NOT NULL DEFAULT '',
  fecha_rechazo DATE NOT NULL DEFAULT CURRENT_DATE,
  fecha_presentacion DATE NOT NULL,
  reprocesable BOOLEAN NOT NULL DEFAULT false,
  estado TEXT NOT NULL DEFAULT 'pendiente'
    CHECK (estado IN ('pendiente', 'reprocesado', 'descartado')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rechazos_clinic ON rechazos(clinic_id);
CREATE INDEX IF NOT EXISTS idx_rechazos_estado ON rechazos(clinic_id, estado);
CREATE INDEX IF NOT EXISTS idx_rechazos_financiador ON rechazos(clinic_id, financiador);

-- =============================================================================
-- MODULE 4 — FINANCIADORES
-- =============================================================================

CREATE TABLE IF NOT EXISTS financiadores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'os'
    CHECK (type IN ('os', 'prepaga', 'pami')),
  facturado INTEGER NOT NULL DEFAULT 0,
  cobrado INTEGER NOT NULL DEFAULT 0,
  tasa_rechazo NUMERIC(5,2) NOT NULL DEFAULT 0,
  dias_promedio_pago INTEGER NOT NULL DEFAULT 0,
  facturas_pendientes INTEGER NOT NULL DEFAULT 0,
  ultimo_pago DATE,
  convenio_vigente BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(clinic_id, name)
);

CREATE INDEX IF NOT EXISTS idx_financiadores_clinic ON financiadores(clinic_id);

-- =============================================================================
-- MODULE 5 — INFLACIÓN
-- =============================================================================

CREATE TABLE IF NOT EXISTS inflacion (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  mes TEXT NOT NULL,                  -- e.g., "Oct 2025"
  ipc NUMERIC(5,2) NOT NULL DEFAULT 0,
  facturado INTEGER NOT NULL DEFAULT 0,
  cobrado INTEGER NOT NULL DEFAULT 0,
  dias_demora INTEGER NOT NULL DEFAULT 0,
  perdida_real INTEGER NOT NULL DEFAULT 0,
  perdida_porcentaje NUMERIC(5,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(clinic_id, mes)
);

CREATE INDEX IF NOT EXISTS idx_inflacion_clinic ON inflacion(clinic_id);

-- =============================================================================
-- MODULE 6 — ALERTAS
-- =============================================================================

CREATE TABLE IF NOT EXISTS alertas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL
    CHECK (tipo IN ('rechazo', 'vencimiento', 'nomenclador', 'pago', 'inflacion')),
  titulo TEXT NOT NULL,
  detalle TEXT NOT NULL,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  acento TEXT NOT NULL DEFAULT 'celeste'
    CHECK (acento IN ('celeste', 'gold')),
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_alertas_clinic ON alertas(clinic_id);
CREATE INDEX IF NOT EXISTS idx_alertas_unread ON alertas(clinic_id, read) WHERE read = false;

-- =============================================================================
-- MODULE 7 — AGENDA / TURNOS
-- =============================================================================

CREATE TABLE IF NOT EXISTS turnos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  hora TIME NOT NULL,
  paciente TEXT NOT NULL,
  paciente_id UUID REFERENCES pacientes(id),
  tipo TEXT NOT NULL,                 -- e.g., "Consulta clínica"
  financiador TEXT NOT NULL DEFAULT '',
  profesional TEXT NOT NULL,
  profesional_id UUID,
  estado TEXT NOT NULL DEFAULT 'pendiente'
    CHECK (estado IN ('confirmado', 'pendiente', 'cancelado', 'atendido')),
  notas TEXT,
  duration_min INTEGER NOT NULL DEFAULT 30,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_turnos_clinic ON turnos(clinic_id);
CREATE INDEX IF NOT EXISTS idx_turnos_fecha ON turnos(clinic_id, fecha, hora);
CREATE INDEX IF NOT EXISTS idx_turnos_profesional ON turnos(clinic_id, profesional_id, fecha);
CREATE INDEX IF NOT EXISTS idx_turnos_estado ON turnos(clinic_id, estado);

-- =============================================================================
-- MODULE 8 — INVENTARIO
-- =============================================================================

CREATE TABLE IF NOT EXISTS inventario (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  categoria TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  minimo INTEGER NOT NULL DEFAULT 0,
  unidad TEXT NOT NULL DEFAULT 'unidad',
  precio INTEGER NOT NULL DEFAULT 0,  -- ARS
  proveedor TEXT NOT NULL DEFAULT '',
  vencimiento DATE,
  lote TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inventario_clinic ON inventario(clinic_id);
CREATE INDEX IF NOT EXISTS idx_inventario_stock_low ON inventario(clinic_id) WHERE stock <= minimo;

-- =============================================================================
-- MODULE 9 — NOMENCLADOR
-- =============================================================================

-- Nomenclador is shared across clinics (national standard) but clinics
-- can have custom value overrides. This table holds the master list.
CREATE TABLE IF NOT EXISTS nomenclador (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo TEXT NOT NULL UNIQUE,       -- e.g., "420101"
  descripcion TEXT NOT NULL,
  capitulo TEXT NOT NULL,
  valor_osde INTEGER NOT NULL DEFAULT 0,
  valor_swiss INTEGER NOT NULL DEFAULT 0,
  valor_pami INTEGER NOT NULL DEFAULT 0,
  valor_galeno INTEGER NOT NULL DEFAULT 0,
  vigente BOOLEAN NOT NULL DEFAULT true,
  ultima_actualizacion DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_nomenclador_codigo ON nomenclador(codigo);
CREATE INDEX IF NOT EXISTS idx_nomenclador_vigente ON nomenclador(vigente) WHERE vigente = true;

-- =============================================================================
-- MODULE 10 — REPORTES & AUDITORÍA
-- =============================================================================

CREATE TABLE IF NOT EXISTS reportes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  categoria TEXT NOT NULL,
  descripcion TEXT NOT NULL DEFAULT '',
  ultima_gen DATE,                   -- last generated
  formato TEXT NOT NULL DEFAULT 'PDF',
  data_query TEXT,                   -- stored query for generation
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reportes_clinic ON reportes(clinic_id);

CREATE TABLE IF NOT EXISTS auditoria (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  paciente TEXT NOT NULL,
  prestacion TEXT NOT NULL,
  financiador TEXT NOT NULL,
  tipo TEXT NOT NULL,                -- e.g., "Sobrefacturación potencial"
  severidad TEXT NOT NULL DEFAULT 'media'
    CHECK (severidad IN ('alta', 'media', 'baja')),
  detalle TEXT NOT NULL DEFAULT '',
  estado TEXT NOT NULL DEFAULT 'pendiente'
    CHECK (estado IN ('pendiente', 'revisado', 'resuelto')),
  resolved_by UUID REFERENCES profiles(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_auditoria_clinic ON auditoria(clinic_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_estado ON auditoria(clinic_id, estado);
CREATE INDEX IF NOT EXISTS idx_auditoria_severidad ON auditoria(clinic_id, severidad);

-- =============================================================================
-- WAITLIST (public — no clinic scoping)
-- =============================================================================

CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  source TEXT DEFAULT 'landing',     -- landing, chatbot, referral
  segment TEXT DEFAULT 'provider',   -- provider, tourist
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);

-- =============================================================================
-- BACKFILL clinic_id ON MODULE 11-14 TABLES
-- =============================================================================
-- Add clinic_id column to existing module 11-14 tables for multi-tenancy.
-- These ALTER statements are idempotent (IF NOT EXISTS).

DO $$
BEGIN
  -- Medications
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'medications' AND column_name = 'clinic_id') THEN
    ALTER TABLE medications ADD COLUMN clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE;
    CREATE INDEX idx_medications_clinic ON medications(clinic_id);
  END IF;

  -- Prescriptions
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prescriptions' AND column_name = 'clinic_id') THEN
    ALTER TABLE prescriptions ADD COLUMN clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE;
    CREATE INDEX idx_prescriptions_clinic ON prescriptions(clinic_id);
  END IF;

  -- Deliveries
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deliveries' AND column_name = 'clinic_id') THEN
    ALTER TABLE deliveries ADD COLUMN clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE;
    CREATE INDEX idx_deliveries_clinic ON deliveries(clinic_id);
  END IF;

  -- Recurring Orders
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recurring_orders' AND column_name = 'clinic_id') THEN
    ALTER TABLE recurring_orders ADD COLUMN clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE;
    CREATE INDEX idx_recurring_orders_clinic ON recurring_orders(clinic_id);
  END IF;

  -- Consultations
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'consultations' AND column_name = 'clinic_id') THEN
    ALTER TABLE consultations ADD COLUMN clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE;
    CREATE INDEX idx_consultations_clinic ON consultations(clinic_id);
  END IF;

  -- Waiting Room
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'waiting_room' AND column_name = 'clinic_id') THEN
    ALTER TABLE waiting_room ADD COLUMN clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE;
    CREATE INDEX idx_waiting_room_clinic ON waiting_room(clinic_id);
  END IF;

  -- Triages
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'triages' AND column_name = 'clinic_id') THEN
    ALTER TABLE triages ADD COLUMN clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE;
    CREATE INDEX idx_triages_clinic ON triages(clinic_id);
  END IF;

  -- Clinical Notes
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clinical_notes' AND column_name = 'clinic_id') THEN
    ALTER TABLE clinical_notes ADD COLUMN clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE;
    CREATE INDEX idx_clinical_notes_clinic ON clinical_notes(clinic_id);
  END IF;
END $$;

-- =============================================================================
-- ROW LEVEL SECURITY — MULTI-TENANT ISOLATION
-- =============================================================================

-- Enable RLS on all core tables
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE facturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE rechazos ENABLE ROW LEVEL SECURITY;
ALTER TABLE financiadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE inflacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertas ENABLE ROW LEVEL SECURITY;
ALTER TABLE turnos ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventario ENABLE ROW LEVEL SECURITY;
ALTER TABLE nomenclador ENABLE ROW LEVEL SECURITY;
ALTER TABLE reportes ENABLE ROW LEVEL SECURITY;
ALTER TABLE auditoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- ─── Helper function: get current user's clinic_id ───────────────────────────
CREATE OR REPLACE FUNCTION public.get_clinic_id()
RETURNS UUID AS $$
  SELECT clinic_id FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ─── Clinics: users can only see their own clinic ────────────────────────────
DO $$ BEGIN
  CREATE POLICY "Users see own clinic"
    ON clinics FOR SELECT TO authenticated
    USING (id = public.get_clinic_id());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Admins update own clinic"
    ON clinics FOR UPDATE TO authenticated
    USING (id = public.get_clinic_id())
    WITH CHECK (id = public.get_clinic_id());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── Profiles: users see teammates ──────────────────────────────────────────
DO $$ BEGIN
  CREATE POLICY "Users see clinic profiles"
    ON profiles FOR SELECT TO authenticated
    USING (clinic_id = public.get_clinic_id());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users update own profile"
    ON profiles FOR UPDATE TO authenticated
    USING (id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── Clinic-scoped tables: CRUD within own clinic ───────────────────────────
-- Macro: apply standard tenant-isolation policies to a table
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY[
      'pacientes', 'facturas', 'rechazos', 'financiadores',
      'inflacion', 'alertas', 'turnos', 'inventario',
      'reportes', 'auditoria'
    ])
  LOOP
    -- SELECT: own clinic only
    BEGIN
      EXECUTE format(
        'CREATE POLICY "Tenant isolation read" ON %I FOR SELECT TO authenticated USING (clinic_id = public.get_clinic_id())',
        tbl
      );
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    -- INSERT: must be own clinic
    BEGIN
      EXECUTE format(
        'CREATE POLICY "Tenant isolation insert" ON %I FOR INSERT TO authenticated WITH CHECK (clinic_id = public.get_clinic_id())',
        tbl
      );
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    -- UPDATE: own clinic only
    BEGIN
      EXECUTE format(
        'CREATE POLICY "Tenant isolation update" ON %I FOR UPDATE TO authenticated USING (clinic_id = public.get_clinic_id()) WITH CHECK (clinic_id = public.get_clinic_id())',
        tbl
      );
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    -- DELETE: own clinic only
    BEGIN
      EXECUTE format(
        'CREATE POLICY "Tenant isolation delete" ON %I FOR DELETE TO authenticated USING (clinic_id = public.get_clinic_id())',
        tbl
      );
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END LOOP;
END $$;

-- ─── Nomenclador: readable by all authenticated users (national standard) ───
DO $$ BEGIN
  CREATE POLICY "Nomenclador public read"
    ON nomenclador FOR SELECT TO authenticated
    USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Only service_role can modify nomenclador (admin seeding)
DO $$ BEGIN
  CREATE POLICY "Nomenclador admin write"
    ON nomenclador FOR ALL TO service_role
    USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── Waitlist: public insert (anon), read by service_role only ──────────────
DO $$ BEGIN
  CREATE POLICY "Waitlist public insert"
    ON waitlist FOR INSERT TO anon
    WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Waitlist authenticated insert"
    ON waitlist FOR INSERT TO authenticated
    WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Waitlist admin read"
    ON waitlist FOR SELECT TO service_role
    USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── Module 11-14: Update existing RLS to use clinic_id ─────────────────────
-- Drop the old wide-open policies and replace with tenant-scoped ones
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY[
      'medications', 'prescriptions', 'deliveries', 'recurring_orders',
      'consultations', 'waiting_room', 'triages', 'clinical_notes'
    ])
  LOOP
    -- Drop old permissive policies (ignore if not exists)
    BEGIN
      EXECUTE format('DROP POLICY "Allow authenticated read" ON %I', tbl);
    EXCEPTION WHEN undefined_object THEN NULL;
    END;
    BEGIN
      EXECUTE format('DROP POLICY "Allow authenticated write" ON %I', tbl);
    EXCEPTION WHEN undefined_object THEN NULL;
    END;

    -- Create tenant-scoped policies
    BEGIN
      EXECUTE format(
        'CREATE POLICY "Tenant read" ON %I FOR SELECT TO authenticated USING (clinic_id = public.get_clinic_id())',
        tbl
      );
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
      EXECUTE format(
        'CREATE POLICY "Tenant insert" ON %I FOR INSERT TO authenticated WITH CHECK (clinic_id = public.get_clinic_id())',
        tbl
      );
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
      EXECUTE format(
        'CREATE POLICY "Tenant update" ON %I FOR UPDATE TO authenticated USING (clinic_id = public.get_clinic_id()) WITH CHECK (clinic_id = public.get_clinic_id())',
        tbl
      );
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
      EXECUTE format(
        'CREATE POLICY "Tenant delete" ON %I FOR DELETE TO authenticated USING (clinic_id = public.get_clinic_id())',
        tbl
      );
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END LOOP;
END $$;

-- Doctors and doctor_reviews are public-readable (patient portal)
DO $$ BEGIN
  CREATE POLICY "Doctors public read" ON doctors FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Doctors anon read" ON doctors FOR SELECT TO anon USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Doctor reviews public read" ON doctor_reviews FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Doctor reviews anon read" ON doctor_reviews FOR SELECT TO anon USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Doctor availability public read" ON doctor_availability FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =============================================================================
-- TRIGGERS — auto-update updated_at
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY[
      'clinics', 'profiles', 'pacientes', 'facturas', 'rechazos',
      'financiadores', 'turnos', 'inventario', 'nomenclador', 'auditoria',
      'medications', 'prescriptions', 'deliveries', 'recurring_orders',
      'consultations', 'triages', 'clinical_notes'
    ])
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS set_updated_at ON %I', tbl);
    EXECUTE format(
      'CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at()',
      tbl
    );
  END LOOP;
END $$;

-- =============================================================================
-- TRIGGER — Auto-create profile on signup
-- =============================================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  _clinic_id UUID;
  _cuit TEXT;
BEGIN
  -- Build a CUIT value: use provided or generate a placeholder
  _cuit := COALESCE(NULLIF(NEW.raw_user_meta_data->>'cuit', ''), 'pending-' || NEW.id::text);

  -- If user signed up with clinic metadata, create the clinic first
  IF NEW.raw_user_meta_data->>'clinic_name' IS NOT NULL THEN
    INSERT INTO public.clinics (name, cuit, provincia, especialidad)
    VALUES (
      COALESCE(NEW.raw_user_meta_data->>'clinic_name', 'Mi Clínica'),
      _cuit,
      COALESCE(NEW.raw_user_meta_data->>'provincia', 'CABA'),
      COALESCE(NEW.raw_user_meta_data->>'especialidad', '')
    )
    RETURNING id INTO _clinic_id;
  ELSE
    -- Create a default clinic for the user
    INSERT INTO public.clinics (name, cuit)
    VALUES (COALESCE(NEW.raw_user_meta_data->>'clinic_name', 'Mi Clínica'), _cuit)
    RETURNING id INTO _clinic_id;
  END IF;

  -- Create the profile
  INSERT INTO public.profiles (id, clinic_id, role, full_name)
  VALUES (
    NEW.id,
    _clinic_id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'admin'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fire after a new user is created in auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- =============================================================================
-- STORAGE BUCKETS
-- =============================================================================

-- Triage photos bucket (private — requires auth)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'triage-photos',
  'triage-photos',
  false,
  10485760, -- 10 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: users can upload to their clinic's folder
DO $$ BEGIN
  CREATE POLICY "Triage photos upload"
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (
      bucket_id = 'triage-photos' AND
      (storage.foldername(name))[1] = public.get_clinic_id()::text
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Triage photos read"
    ON storage.objects FOR SELECT TO authenticated
    USING (
      bucket_id = 'triage-photos' AND
      (storage.foldername(name))[1] = public.get_clinic_id()::text
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =============================================================================
-- SEED: Nomenclador (national standard billing codes)
-- =============================================================================

INSERT INTO nomenclador (codigo, descripcion, capitulo, valor_osde, valor_swiss, valor_pami, valor_galeno)
VALUES
  ('420101', 'Consulta médica en consultorio', 'Consultas', 18500, 19200, 12500, 17800),
  ('420102', 'Consulta médica especialista', 'Consultas', 22000, 23500, 14800, 21000),
  ('420103', 'Consulta cardiológica', 'Consultas', 25000, 26000, 16500, 24200),
  ('420104', 'Consulta pediátrica', 'Consultas', 20000, 21000, 13800, 19500),
  ('420105', 'Consulta ginecológica', 'Consultas', 22000, 23000, 15000, 21500),
  ('420301', 'Laboratorio completo (hemograma + químico)', 'Laboratorio', 28500, 30000, 19000, 27800),
  ('420302', 'Hemograma', 'Laboratorio', 8500, 9000, 6200, 8200),
  ('420501', 'Radiografía de tórax', 'Diagnóstico por imágenes', 15000, 16000, 10500, 14500),
  ('420607', 'Electrocardiograma', 'Cardiología', 32000, 33500, 22000, 31000),
  ('420720', 'Ecografía abdominal', 'Diagnóstico por imágenes', 45000, 47000, 30000, 43500),
  ('420810', 'RMN cerebro', 'Diagnóstico por imágenes', 85000, 88000, 58000, 82000),
  ('420901', 'Sesión de kinesiología', 'Rehabilitación', 12000, 12500, 8500, 11500)
ON CONFLICT (codigo) DO NOTHING;

-- =============================================================================
-- GRANTS — Base table permissions
-- =============================================================================

-- Authenticated users get full access to all public tables (RLS still applies)
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Anon: waitlist insert (landing page signups)
GRANT INSERT ON waitlist TO anon;

-- Anon: public-readable tables (patient portal / directorio)
GRANT SELECT ON doctors TO anon;
GRANT SELECT ON doctor_reviews TO anon;
GRANT SELECT ON doctor_availability TO anon;

-- Service role: waitlist read (admin dashboard)
GRANT SELECT ON waitlist TO service_role;
-- ─── 003: Supabase Storage Buckets + Realtime ────────────────
-- Creates storage buckets for reports and medical documents.
-- Enables Realtime on the alertas table.
-- Run in Supabase SQL Editor.

-- ─── Storage Buckets ─────────────────────────────────────────
-- Note: Supabase Storage buckets are created via the Storage API,
-- not via SQL. Use the Supabase Dashboard → Storage to create:
--
-- 1. Bucket: "reports" (private)
--    - Max file size: 10 MB
--    - Allowed MIME types: application/pdf, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
--
-- 2. Bucket: "medical-docs" (private)
--    - Max file size: 25 MB
--    - Allowed MIME types: application/pdf, image/jpeg, image/png, image/webp,
--      application/dicom, application/vnd.openxmlformats-officedocument.wordprocessingml.document

-- ─── Storage RLS Policies ────────────────────────────────────
-- Users can only access files belonging to their clinic.

-- Reports bucket: clinic members can read/write their clinic's reports
DO $$ BEGIN
  CREATE POLICY "Clinic members can upload reports"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'reports'
      AND (storage.foldername(name))[1] = (public.get_clinic_id())::text
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Clinic members can read own reports"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (
      bucket_id = 'reports'
      AND (storage.foldername(name))[1] = (public.get_clinic_id())::text
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Clinic members can delete own reports"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
      bucket_id = 'reports'
      AND (storage.foldername(name))[1] = (public.get_clinic_id())::text
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Medical docs bucket: clinic members can read/write their clinic's docs
DO $$ BEGIN
  CREATE POLICY "Clinic members can upload medical docs"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'medical-docs'
      AND (storage.foldername(name))[1] = (public.get_clinic_id())::text
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Clinic members can read own medical docs"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (
      bucket_id = 'medical-docs'
      AND (storage.foldername(name))[1] = (public.get_clinic_id())::text
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Clinic members can delete own medical docs"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
      bucket_id = 'medical-docs'
      AND (storage.foldername(name))[1] = (public.get_clinic_id())::text
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── Enable Realtime on alertas ──────────────────────────────
-- This allows the client to subscribe to INSERT/UPDATE events.
ALTER PUBLICATION supabase_realtime ADD TABLE alertas;

-- ─── Add 'read' column to alertas if not exists ──────────────
-- The realtime alert system tracks read/unread state.
DO $$ BEGIN
  ALTER TABLE alertas ADD COLUMN read boolean DEFAULT false;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- ─── Index for unread alerts ─────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_alertas_unread
  ON alertas (clinic_id, read)
  WHERE read = false;

-- Done!
-- Next: Go to Supabase Dashboard → Storage → Create buckets "reports" and "medical-docs".
-- ─── 004: Service Tables for Dashboard Modules ──────────────
-- Extends the core schema (002) with additional columns and new tables.
-- Safe to run multiple times (all operations are IF NOT EXISTS / idempotent).
-- Run in Supabase SQL Editor.

-- ═══════════════════════════════════════════════════════════════
-- 1. NEW TABLES — Interconsultas Module
-- ═══════════════════════════════════════════════════════════════

-- Network of referral doctors
CREATE TABLE IF NOT EXISTS public.network_doctors (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id    UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  nombre       TEXT NOT NULL,
  especialidad TEXT NOT NULL,
  subespecialidad TEXT,
  matricula    TEXT NOT NULL,
  telefono     TEXT,
  email        TEXT,
  direccion    TEXT,
  localidad    TEXT DEFAULT 'CABA',
  obras_sociales TEXT[] DEFAULT '{}',
  horarios     TEXT,
  acepta_derivaciones BOOLEAN DEFAULT true,
  notas        TEXT,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

-- Interconsultas (referrals between doctors)
CREATE TABLE IF NOT EXISTS public.interconsultas (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id      UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  paciente_id    UUID REFERENCES public.pacientes(id),
  paciente_nombre TEXT NOT NULL,
  doctor_origen_id UUID,
  doctor_origen_nombre TEXT NOT NULL,
  doctor_destino_id UUID REFERENCES public.network_doctors(id),
  doctor_destino_nombre TEXT NOT NULL,
  especialidad   TEXT NOT NULL,
  prioridad      TEXT NOT NULL DEFAULT 'normal' CHECK (prioridad IN ('urgente','alta','normal','baja')),
  motivo         TEXT NOT NULL,
  diagnostico    TEXT,
  estado         TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente','aceptada','en_curso','completada','cancelada')),
  respuesta      TEXT,
  fecha_solicitud TIMESTAMPTZ DEFAULT now(),
  fecha_respuesta TIMESTAMPTZ,
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now()
);

-- Study/exam requests
CREATE TABLE IF NOT EXISTS public.solicitudes_estudio (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id      UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  paciente_id    UUID REFERENCES public.pacientes(id),
  paciente_nombre TEXT NOT NULL,
  doctor_solicitante TEXT NOT NULL,
  tipo           TEXT NOT NULL CHECK (tipo IN ('laboratorio','imagen','cardiologia','otros')),
  estudio        TEXT NOT NULL,
  centro         TEXT,
  indicacion     TEXT,
  urgente        BOOLEAN DEFAULT false,
  estado         TEXT NOT NULL DEFAULT 'solicitado' CHECK (estado IN ('solicitado','programado','realizado','informado','cancelado')),
  resultado_url  TEXT,
  fecha_solicitud TIMESTAMPTZ DEFAULT now(),
  fecha_resultado TIMESTAMPTZ,
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now()
);

-- Inflacion mensual (separate from 002's inflacion table)
CREATE TABLE IF NOT EXISTS public.inflacion_mensual (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id         UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  mes               TEXT NOT NULL,           -- "Mar 2026"
  anio              INTEGER NOT NULL,
  mes_num           INTEGER NOT NULL,        -- 1-12
  ipc               NUMERIC(5,2) NOT NULL,
  facturado         NUMERIC(12,2) DEFAULT 0,
  cobrado           NUMERIC(12,2) DEFAULT 0,
  dias_demora       INTEGER DEFAULT 0,
  perdida_real      NUMERIC(12,2) DEFAULT 0,
  perdida_porcentaje NUMERIC(5,2) DEFAULT 0,
  created_at        TIMESTAMPTZ DEFAULT now(),
  UNIQUE(clinic_id, anio, mes_num)
);

-- ═══════════════════════════════════════════════════════════════
-- 2. ALTER EXISTING TABLES — add missing columns from 002
-- ═══════════════════════════════════════════════════════════════

-- ─── facturas: add lote_id, notas ────────────────────────────
ALTER TABLE public.facturas ADD COLUMN IF NOT EXISTS lote_id TEXT;
ALTER TABLE public.facturas ADD COLUMN IF NOT EXISTS notas TEXT;

-- ─── rechazos: add resuelto_por, fecha_resolucion ────────────
ALTER TABLE public.rechazos ADD COLUMN IF NOT EXISTS resuelto_por TEXT;
ALTER TABLE public.rechazos ADD COLUMN IF NOT EXISTS fecha_resolucion DATE;

-- ─── financiadores: add contact/billing columns ──────────────
ALTER TABLE public.financiadores ADD COLUMN IF NOT EXISTS cuit TEXT;
ALTER TABLE public.financiadores ADD COLUMN IF NOT EXISTS contacto_email TEXT;
ALTER TABLE public.financiadores ADD COLUMN IF NOT EXISTS contacto_telefono TEXT;
ALTER TABLE public.financiadores ADD COLUMN IF NOT EXISTS direccion TEXT;
ALTER TABLE public.financiadores ADD COLUMN IF NOT EXISTS ultima_liquidacion TEXT;
ALTER TABLE public.financiadores ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT true;

-- ─── inventario: add extended columns ────────────────────────
ALTER TABLE public.inventario ADD COLUMN IF NOT EXISTS presentacion TEXT;
ALTER TABLE public.inventario ADD COLUMN IF NOT EXISTS stock_minimo INTEGER DEFAULT 0;
ALTER TABLE public.inventario ADD COLUMN IF NOT EXISTS precio_unitario NUMERIC(10,2) DEFAULT 0;
ALTER TABLE public.inventario ADD COLUMN IF NOT EXISTS ultima_compra DATE;

-- Backfill stock_minimo from old 'minimo' column if it exists
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'inventario' AND column_name = 'minimo'
  ) THEN
    UPDATE public.inventario SET stock_minimo = minimo WHERE stock_minimo = 0 AND minimo > 0;
  END IF;
END $$;

-- ─── nomenclador: add clinic_id + missing columns ───────────
ALTER TABLE public.nomenclador ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE;
ALTER TABLE public.nomenclador ADD COLUMN IF NOT EXISTS modulo TEXT;
ALTER TABLE public.nomenclador ADD COLUMN IF NOT EXISTS valor_sss NUMERIC(10,2) DEFAULT 0;

-- ─── reportes: add extended columns ─────────────────────────
ALTER TABLE public.reportes ADD COLUMN IF NOT EXISTS frecuencia TEXT DEFAULT 'Mensual';
ALTER TABLE public.reportes ADD COLUMN IF NOT EXISTS ultima_generacion TIMESTAMPTZ;
ALTER TABLE public.reportes ADD COLUMN IF NOT EXISTS archivo_url TEXT;
ALTER TABLE public.reportes ADD COLUMN IF NOT EXISTS generado_por UUID REFERENCES auth.users(id);
ALTER TABLE public.reportes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- ─── Indexes for new tables ─────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_facturas_fecha_desc ON public.facturas(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_inflacion_mensual_clinic ON public.inflacion_mensual(clinic_id);
CREATE INDEX IF NOT EXISTS idx_inventario_categoria ON public.inventario(categoria);
CREATE INDEX IF NOT EXISTS idx_nomenclador_capitulo ON public.nomenclador(capitulo);

-- ═══════════════════════════════════════════════════════════════
-- 3. CLINICS ONBOARDING (multi-tenant setup)
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 0;
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS direccion TEXT;
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS telefono TEXT;
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS cantidad_profesionales INTEGER DEFAULT 1;
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS sistema_anterior TEXT;

-- ═══════════════════════════════════════════════════════════════
-- 4. RLS POLICIES
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE public.network_doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interconsultas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitudes_estudio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inflacion_mensual ENABLE ROW LEVEL SECURITY;

-- RLS for new tables (002 already handles facturas, rechazos, etc.)
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'network_doctors','interconsultas','solicitudes_estudio','inflacion_mensual'
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

-- Nomenclador: clinic-scoped policy (allows NULL clinic_id for shared codes)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'nomenclador' AND column_name = 'clinic_id'
  ) THEN
    BEGIN
      EXECUTE 'CREATE POLICY "Clinic isolation: nomenclador" ON public.nomenclador
               FOR ALL TO authenticated
               USING (clinic_id IS NULL OR clinic_id = public.get_clinic_id())
               WITH CHECK (clinic_id = public.get_clinic_id())';
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END IF;
END $$;

-- Allow anon read for nomenclador (public codes)
DO $$ BEGIN
  CREATE POLICY "Public nomenclador read"
    ON public.nomenclador FOR SELECT
    TO anon
    USING (vigente = true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════
-- 5. UPDATED_AT TRIGGERS
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'network_doctors','interconsultas','solicitudes_estudio'
  ])
  LOOP
    BEGIN
      EXECUTE format(
        'CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.%I
         FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at()',
        tbl
      );
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END LOOP;
END $$;

-- ═══════════════════════════════════════════════════════════════
-- 6. ENABLE REALTIME for key tables
-- ═══════════════════════════════════════════════════════════════

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.interconsultas;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.inflacion_mensual;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =============================================================================
-- 006: WhatsApp CRM — Leads, Conversations & Marketing
-- Auto-created during onboarding (seedDefaultWhatsApp).
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.whatsapp_config (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id     UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  whatsapp_number TEXT NOT NULL,
  display_name  TEXT NOT NULL DEFAULT '',
  twilio_sid    TEXT,
  twilio_token  TEXT,
  welcome_message TEXT DEFAULT '¡Hola! Gracias por comunicarte con nosotros. Un miembro de nuestro equipo te responderá a la brevedad. ¿En qué podemos ayudarte?',
  auto_reply    BOOLEAN DEFAULT true,
  business_hours TEXT DEFAULT '08:00-20:00',
  out_of_hours_message TEXT DEFAULT 'Nuestro horario de atención es de 8:00 a 20:00. Te responderemos a primera hora.',
  notify_on_new_lead BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(clinic_id)
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_config_clinic ON public.whatsapp_config(clinic_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_config_number ON public.whatsapp_config(whatsapp_number);

CREATE TABLE IF NOT EXISTS public.leads (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id     UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  nombre        TEXT,
  telefono      TEXT NOT NULL,
  email         TEXT,
  dni           TEXT,
  financiador   TEXT,
  motivo        TEXT,
  fuente        TEXT NOT NULL DEFAULT 'whatsapp'
    CHECK (fuente IN ('whatsapp', 'web', 'referido', 'landing', 'chatbot', 'manual')),
  estado        TEXT NOT NULL DEFAULT 'nuevo'
    CHECK (estado IN ('nuevo', 'contactado', 'interesado', 'turno_agendado', 'convertido', 'perdido')),
  assigned_to   UUID REFERENCES public.profiles(id),
  paciente_id   UUID REFERENCES public.pacientes(id),
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

CREATE TABLE IF NOT EXISTS public.conversations (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id     UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  lead_id       UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  paciente_id   UUID REFERENCES public.pacientes(id) ON DELETE SET NULL,
  channel       TEXT NOT NULL DEFAULT 'whatsapp'
    CHECK (channel IN ('whatsapp', 'web_chat', 'email', 'telefono')),
  status        TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'pending', 'resolved', 'archived')),
  subject       TEXT,
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

CREATE TABLE IF NOT EXISTS public.messages (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id       UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  direction       TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  sender_type     TEXT NOT NULL CHECK (sender_type IN ('patient', 'lead', 'staff', 'system', 'bot')),
  sender_id       UUID,
  sender_name     TEXT,
  body            TEXT NOT NULL,
  media_url       TEXT,
  media_type      TEXT,
  twilio_sid      TEXT,
  status          TEXT NOT NULL DEFAULT 'sent'
    CHECK (status IN ('queued', 'sent', 'delivered', 'read', 'failed')),
  error_message   TEXT,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_clinic ON public.messages(clinic_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_twilio_sid ON public.messages(twilio_sid);

CREATE TABLE IF NOT EXISTS public.whatsapp_templates (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id     UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  category      TEXT NOT NULL DEFAULT 'utility'
    CHECK (category IN ('utility', 'marketing', 'authentication')),
  language      TEXT NOT NULL DEFAULT 'es_AR',
  body_template TEXT NOT NULL,
  variables     TEXT[] DEFAULT '{}',
  header_text   TEXT,
  footer_text   TEXT,
  active        BOOLEAN DEFAULT true,
  approved      BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(clinic_id, name)
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_templates_clinic ON public.whatsapp_templates(clinic_id);

CREATE TABLE IF NOT EXISTS public.marketing_campaigns (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id       UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  description     TEXT,
  template_id     UUID REFERENCES public.whatsapp_templates(id),
  audience_filter JSONB DEFAULT '{}',
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

-- WhatsApp CRM — RLS
ALTER TABLE public.whatsapp_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_recipients ENABLE ROW LEVEL SECURITY;

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

DO $$ BEGIN
  CREATE POLICY "Clinic isolation: campaign_recipients" ON public.campaign_recipients
    FOR ALL TO authenticated
    USING (campaign_id IN (SELECT id FROM public.marketing_campaigns WHERE clinic_id = public.get_clinic_id()))
    WITH CHECK (campaign_id IN (SELECT id FROM public.marketing_campaigns WHERE clinic_id = public.get_clinic_id()));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN CREATE POLICY "Service role bypass: leads" ON public.leads FOR ALL TO service_role USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Service role bypass: conversations" ON public.conversations FOR ALL TO service_role USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Service role bypass: messages" ON public.messages FOR ALL TO service_role USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Service role bypass: whatsapp_config" ON public.whatsapp_config FOR ALL TO service_role USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- WhatsApp CRM — auto-update triggers
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

-- WhatsApp CRM — Realtime
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.leads; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.messages; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =============================================================================
-- Cóndor Salud — Chatbot Feature Tables
-- Depends on: 002_core_schema.sql (clinics, profiles, pacientes)
-- Adds: coverage_plans, available_slots, appointments, prescriptions
-- =============================================================================

-- ─── Enable extensions (idempotent) ──────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- COVERAGE PLANS — Pre-populated lookup table
-- Used by Cora to answer "What does my plan cover?"
-- =============================================================================

CREATE TABLE IF NOT EXISTS coverage_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_key TEXT NOT NULL,             -- normalized lowercase key: "pami", "osde_310", etc.
  provider_name TEXT NOT NULL,            -- display name: "PAMI", "OSDE 310"
  provider_group TEXT NOT NULL,           -- parent group: "PAMI", "OSDE", "Swiss Medical"
  plan_tier TEXT,                         -- "básico", "premium", "310", "410", etc.

  -- Coverage details (JSON for flexibility)
  covers_general BOOLEAN NOT NULL DEFAULT true,
  covers_specialists BOOLEAN NOT NULL DEFAULT true,
  covers_emergency BOOLEAN NOT NULL DEFAULT true,
  covers_dental BOOLEAN NOT NULL DEFAULT false,
  covers_mental_health BOOLEAN NOT NULL DEFAULT false,
  covers_telemedicine BOOLEAN NOT NULL DEFAULT false,
  covers_medications BOOLEAN NOT NULL DEFAULT false,

  -- Copay info
  copay_general TEXT,                     -- e.g. "$500 - $1,200" or "Sin coseguro"
  copay_specialist TEXT,
  copay_emergency TEXT,

  -- Additional info
  phone TEXT,                             -- provider support phone
  website TEXT,                           -- provider website
  notes_es TEXT,                          -- Additional notes in Spanish
  notes_en TEXT,                          -- Additional notes in English

  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(provider_key)
);

-- ─── Index for quick lookups ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_coverage_plans_group ON coverage_plans(provider_group);
CREATE INDEX IF NOT EXISTS idx_coverage_plans_key ON coverage_plans(provider_key);

-- =============================================================================
-- SEED DATA — Major Argentine health insurance providers
-- =============================================================================

INSERT INTO coverage_plans (provider_key, provider_name, provider_group, plan_tier,
  covers_general, covers_specialists, covers_emergency, covers_dental,
  covers_mental_health, covers_telemedicine, covers_medications,
  copay_general, copay_specialist, copay_emergency,
  phone, website, notes_es, notes_en)
VALUES
  -- PAMI
  ('pami', 'PAMI', 'PAMI', NULL,
   true, true, true, true, true, false, true,
   'Sin coseguro', 'Sin coseguro', 'Sin coseguro',
   '138', 'https://www.pami.org.ar',
   'Cobertura del PMO (Programa Médico Obligatorio) completa. Incluye medicamentos con descuento del 50-100%.',
   'Full PMO (Mandatory Medical Program) coverage. Includes medications with 50-100% discount.'),

  -- OSDE
  ('osde_210', 'OSDE 210', 'OSDE', '210',
   true, true, true, false, true, true, false,
   '$800 - $1,500', '$1,200 - $2,500', 'Sin coseguro',
   '0800-555-6733', 'https://www.osde.com.ar',
   'Plan básico. Clínica médica y especialistas con coseguro. Guardia sin coseguro.',
   'Basic plan. General and specialist visits with copay. Emergency at no extra cost.'),

  ('osde_310', 'OSDE 310', 'OSDE', '310',
   true, true, true, true, true, true, true,
   '$500 - $1,000', '$800 - $1,800', 'Sin coseguro',
   '0800-555-6733', 'https://www.osde.com.ar',
   'Plan intermedio. Incluye dental básico y descuentos en medicamentos.',
   'Mid-tier plan. Includes basic dental and medication discounts.'),

  ('osde_410', 'OSDE 410', 'OSDE', '410',
   true, true, true, true, true, true, true,
   'Sin coseguro', '$500 - $1,200', 'Sin coseguro',
   '0800-555-6733', 'https://www.osde.com.ar',
   'Plan premium. Coseguros mínimos, cobertura odontológica y medicamentos amplia.',
   'Premium plan. Minimal copays, broad dental and medication coverage.'),

  -- Swiss Medical
  ('swiss_smg20', 'Swiss Medical SMG20', 'Swiss Medical', 'SMG20',
   true, true, true, false, true, true, false,
   '$1,000 - $2,000', '$1,500 - $3,000', 'Sin coseguro',
   '0810-333-8876', 'https://www.swissmedical.com.ar',
   'Plan básico. Red de profesionales y centros médicos propios.',
   'Basic plan. Own network of professionals and medical centers.'),

  ('swiss_smg30', 'Swiss Medical SMG30', 'Swiss Medical', 'SMG30',
   true, true, true, true, true, true, true,
   '$600 - $1,200', '$1,000 - $2,000', 'Sin coseguro',
   '0810-333-8876', 'https://www.swissmedical.com.ar',
   'Plan intermedio. Incluye cobertura dental y descuentos en farmacias.',
   'Mid-tier plan. Dental coverage and pharmacy discounts included.'),

  ('swiss_smg50', 'Swiss Medical SMG50', 'Swiss Medical', 'SMG50',
   true, true, true, true, true, true, true,
   'Sin coseguro', 'Sin coseguro', 'Sin coseguro',
   '0810-333-8876', 'https://www.swissmedical.com.ar',
   'Plan premium. Sin coseguros, cobertura completa.',
   'Premium plan. No copays, full coverage.'),

  -- Galeno
  ('galeno_azul', 'Galeno Azul', 'Galeno', 'Azul',
   true, true, true, false, true, true, false,
   '$800 - $1,500', '$1,200 - $2,500', 'Sin coseguro',
   '0810-222-4253', 'https://www.galeno.com.ar',
   'Plan básico. Consultas con coseguro moderado.',
   'Basic plan. Visits with moderate copay.'),

  ('galeno_oro', 'Galeno Oro', 'Galeno', 'Oro',
   true, true, true, true, true, true, true,
   'Sin coseguro', '$500 - $1,000', 'Sin coseguro',
   '0810-222-4253', 'https://www.galeno.com.ar',
   'Plan premium. Coseguros mínimos, cobertura amplia.',
   'Premium plan. Minimal copays, broad coverage.'),

  -- Medifé
  ('medife_azul', 'Medifé Azul', 'Medifé', 'Azul',
   true, true, true, false, true, true, false,
   '$700 - $1,400', '$1,000 - $2,200', 'Sin coseguro',
   '0810-501-6334', 'https://www.medife.com.ar',
   'Plan inicial. Red amplia de prestadores.',
   'Entry plan. Wide provider network.'),

  ('medife_plata', 'Medifé Plata', 'Medifé', 'Plata',
   true, true, true, true, true, true, true,
   '$400 - $900', '$700 - $1,500', 'Sin coseguro',
   '0810-501-6334', 'https://www.medife.com.ar',
   'Plan intermedio. Incluye dental y medicamentos.',
   'Mid-tier plan. Includes dental and medications.'),

  -- Accord Salud
  ('accord_clasico', 'Accord Salud Clásico', 'Accord Salud', 'Clásico',
   true, true, true, false, false, false, false,
   '$600 - $1,200', '$1,000 - $2,000', 'Sin coseguro',
   '0810-555-2226', 'https://www.accordsalud.com.ar',
   'Plan básico. Cobertura PMO estándar.',
   'Basic plan. Standard PMO coverage.'),

  -- Sancor Salud
  ('sancor_1000', 'Sancor Salud 1000', 'Sancor Salud', '1000',
   true, true, true, false, true, true, false,
   '$500 - $1,000', '$800 - $1,500', 'Sin coseguro',
   '0800-444-7262', 'https://www.sancorsalud.com.ar',
   'Plan básico con amplia cobertura geográfica.',
   'Basic plan with wide geographic coverage.')
ON CONFLICT (provider_key) DO NOTHING;


-- =============================================================================
-- AVAILABLE SLOTS — Appointment availability
-- Used by Cora to show real-time booking options
-- =============================================================================

CREATE TABLE IF NOT EXISTS available_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  doctor_profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  specialty TEXT NOT NULL,
  slot_date DATE NOT NULL,
  slot_time TIME NOT NULL,
  duration_min INTEGER NOT NULL DEFAULT 30,
  is_telemedicine BOOLEAN NOT NULL DEFAULT false,
  is_booked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_available_slots_specialty ON available_slots(specialty, slot_date);
CREATE INDEX IF NOT EXISTS idx_available_slots_clinic ON available_slots(clinic_id, slot_date);
CREATE INDEX IF NOT EXISTS idx_available_slots_available ON available_slots(is_booked, slot_date, specialty);


-- =============================================================================
-- APPOINTMENTS — Booked appointments
-- =============================================================================

CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slot_id UUID REFERENCES available_slots(id) ON DELETE SET NULL,
  patient_id UUID NOT NULL,              -- references pacientes(id) or auth.users(id)
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  doctor_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  specialty TEXT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  is_telemedicine BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'confirmed'
    CHECK (status IN ('confirmed', 'cancelled', 'completed', 'no_show')),
  notes TEXT,
  booked_via TEXT DEFAULT 'chatbot',     -- 'chatbot', 'web', 'phone'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id, appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_clinic ON appointments(clinic_id, appointment_date);


-- =============================================================================
-- PRESCRIPTIONS — Patient prescriptions (for in-chat viewer + delivery links)
-- =============================================================================

CREATE TABLE IF NOT EXISTS prescriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL,              -- references pacientes(id) or auth.users(id)
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  doctor_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  doctor_name TEXT NOT NULL,
  medication_name TEXT NOT NULL,
  medication_generic TEXT,               -- generic name for delivery search
  dosage TEXT NOT NULL,                  -- e.g. "500mg"
  frequency TEXT NOT NULL,               -- e.g. "Every 8 hours"
  duration TEXT,                          -- e.g. "7 days"
  quantity INTEGER,
  is_otc BOOLEAN NOT NULL DEFAULT false, -- over-the-counter (no prescription needed)
  is_active BOOLEAN NOT NULL DEFAULT true,
  prescribed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON prescriptions(patient_id, is_active);
CREATE INDEX IF NOT EXISTS idx_prescriptions_active ON prescriptions(is_active, expires_at);


-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

-- Coverage plans are public (read-only for everyone)
ALTER TABLE coverage_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "coverage_plans_public_read" ON coverage_plans
  FOR SELECT TO authenticated, anon
  USING (active = true);

-- Available slots are public read, clinic-managed write
ALTER TABLE available_slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "available_slots_public_read" ON available_slots
  FOR SELECT TO authenticated, anon
  USING (is_booked = false);
CREATE POLICY "available_slots_clinic_write" ON available_slots
  FOR ALL TO authenticated
  USING (
    clinic_id IN (SELECT clinic_id FROM profiles WHERE id = auth.uid())
  );

-- Appointments: patients see own, clinics see their own
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "appointments_patient_read" ON appointments
  FOR SELECT TO authenticated
  USING (patient_id = auth.uid());
CREATE POLICY "appointments_clinic_manage" ON appointments
  FOR ALL TO authenticated
  USING (
    clinic_id IN (SELECT clinic_id FROM profiles WHERE id = auth.uid())
  );

-- Prescriptions: patients see own, doctors manage
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "prescriptions_patient_read" ON prescriptions
  FOR SELECT TO authenticated
  USING (patient_id = auth.uid());
CREATE POLICY "prescriptions_clinic_manage" ON prescriptions
  FOR ALL TO authenticated
  USING (
    clinic_id IN (SELECT clinic_id FROM profiles WHERE id = auth.uid())
  );
-- =============================================================================
-- Cóndor Salud — Seed Data for First Client
-- Run AFTER all 5 migrations. Uses service_role or direct SQL Editor.
-- =============================================================================

-- ─── 1. Create the first clinic ──────────────────────────────────────────────
INSERT INTO clinics (id, name, cuit, plan_tier, sedes, provincia, localidad, especialidad, phone, email, address, active, onboarding_complete)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Clínica San Martín',
  '30-71234567-9',
  'enterprise',
  1,
  'CABA',
  'Palermo',
  'Clínica médica general',
  '+54 11 5514-0371',
  'admin@condorsalud.com.ar',
  'Av. San Martín 1520, Piso 2°, CABA',
  true,
  true
)
ON CONFLICT DO NOTHING;

-- ─── 2. Financiadores (payers) ───────────────────────────────────────────────
INSERT INTO financiadores (clinic_id, name, type, facturado, cobrado, tasa_rechazo, dias_promedio_pago, facturas_pendientes, convenio_vigente)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'PAMI', 'pami', 0, 0, 0, 68, 0, true),
  ('00000000-0000-0000-0000-000000000001', 'OSDE', 'prepaga', 0, 0, 0, 32, 0, true),
  ('00000000-0000-0000-0000-000000000001', 'Swiss Medical', 'prepaga', 0, 0, 0, 28, 0, true),
  ('00000000-0000-0000-0000-000000000001', 'Galeno', 'prepaga', 0, 0, 0, 35, 0, true),
  ('00000000-0000-0000-0000-000000000001', 'Medifé', 'prepaga', 0, 0, 0, 40, 0, true),
  ('00000000-0000-0000-0000-000000000001', 'IOMA', 'os', 0, 0, 0, 82, 0, true),
  ('00000000-0000-0000-0000-000000000001', 'OSECAC', 'os', 0, 0, 0, 45, 0, true)
ON CONFLICT (clinic_id, name) DO NOTHING;

-- ─── 3. Initial inventory items ──────────────────────────────────────────────
INSERT INTO inventario (clinic_id, nombre, categoria, stock, minimo, unidad, precio, proveedor, vencimiento)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Guantes de latex M', 'Descartables', 500, 100, 'par', 85, 'Distrisur', '2027-06-01'),
  ('00000000-0000-0000-0000-000000000001', 'Jeringa 5ml', 'Descartables', 300, 50, 'unidad', 120, 'Medline', '2027-12-01'),
  ('00000000-0000-0000-0000-000000000001', 'Alcohol 70%', 'Antisépticos', 40, 10, 'litro', 2500, 'Distrisur', '2027-03-01'),
  ('00000000-0000-0000-0000-000000000001', 'Gasas estériles 10x10', 'Descartables', 200, 50, 'paquete', 450, 'Medline', '2027-08-01'),
  ('00000000-0000-0000-0000-000000000001', 'Tensiómetro digital', 'Equipamiento', 3, 1, 'unidad', 45000, 'OmronAR', NULL),
  ('00000000-0000-0000-0000-000000000001', 'Amoxicilina 500mg', 'Medicamentos', 80, 20, 'caja', 8500, 'Roemmers', '2026-11-01'),
  ('00000000-0000-0000-0000-000000000001', 'Ibuprofeno 400mg', 'Medicamentos', 120, 30, 'caja', 4200, 'Bagó', '2026-09-01'),
  ('00000000-0000-0000-0000-000000000001', 'Barbijo quirúrgico', 'Descartables', 1000, 200, 'unidad', 35, 'Medline', '2027-12-01')
ON CONFLICT DO NOTHING;

-- ─── 4. Sample alertas ──────────────────────────────────────────────────────
INSERT INTO alertas (clinic_id, tipo, titulo, detalle, fecha, acento, read)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'rechazo', 'Nuevo rechazo PAMI', 'La factura FC-2026-001234 fue rechazada por código inválido.', CURRENT_DATE, 'gold', false),
  ('00000000-0000-0000-0000-000000000001', 'vencimiento', 'Convenio IOMA por vencer', 'El convenio con IOMA vence en 15 días. Renovar antes del 01/04.', CURRENT_DATE, 'gold', false),
  ('00000000-0000-0000-0000-000000000001', 'nomenclador', 'Actualización nomenclador', 'OSDE actualizó valores del nomenclador para Consultas (+8.5%).', CURRENT_DATE, 'celeste', false),
  ('00000000-0000-0000-0000-000000000001', 'pago', 'Pago recibido Swiss Medical', 'Se acreditó el lote de marzo por $845.000.', CURRENT_DATE, 'celeste', true),
  ('00000000-0000-0000-0000-000000000001', 'inflacion', 'IPC Marzo: 3.2%', 'Pérdida estimada por demora en cobro: $42.300 este mes.', CURRENT_DATE, 'gold', false)
ON CONFLICT DO NOTHING;

-- ─── 5. Sample reportes templates ───────────────────────────────────────────
INSERT INTO reportes (clinic_id, nombre, categoria, descripcion, formato)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Facturación Mensual', 'Finanzas', 'Resumen de facturación por financiador del mes en curso', 'PDF'),
  ('00000000-0000-0000-0000-000000000001', 'Rechazos Pendientes', 'Finanzas', 'Listado de rechazos sin resolver, agrupados por motivo', 'PDF'),
  ('00000000-0000-0000-0000-000000000001', 'Productividad Profesionales', 'Operaciones', 'Atenciones por profesional, horas trabajadas, facturación generada', 'Excel'),
  ('00000000-0000-0000-0000-000000000001', 'Inventario Crítico', 'Operaciones', 'Items por debajo del stock mínimo con sugerencias de reposición', 'PDF'),
  ('00000000-0000-0000-0000-000000000001', 'Análisis IPC', 'Finanzas', 'Impacto de la inflación en la cadena de cobro por financiador', 'Excel')
ON CONFLICT DO NOTHING;

-- ─── 6. Doctors directory (public, not clinic-scoped) ────────────────────────
INSERT INTO doctors (name, specialty, location, address, financiadores, rating, review_count, next_slot, available, teleconsulta, experience, bio)
VALUES
  ('Dr. Carlos Rodríguez', 'Clínica Médica', 'Palermo, CABA', 'Av. Santa Fe 3200, 4°B', '["PAMI","OSDE","Swiss Medical","Galeno"]', 4.8, 124, 'Hoy 15:00', true, true, '22 años', 'Médico clínico con especialización en medicina interna.'),
  ('Dra. María Pérez', 'Cardiología', 'Recoleta, CABA', 'Junín 1050, PB', '["OSDE","Swiss Medical","Medifé"]', 4.9, 89, 'Mañana 09:30', true, true, '18 años', 'Cardióloga con sub-especialización en ecocardiografía.'),
  ('Dr. Alejandro Martínez', 'Traumatología', 'Belgrano, CABA', 'Cabildo 2100, 2°', '["PAMI","OSDE","Galeno","IOMA"]', 4.6, 67, 'Hoy 17:00', true, false, '15 años', 'Traumatólogo especialista en rodilla y hombro.'),
  ('Dra. Laura González', 'Pediatría', 'Palermo, CABA', 'Honduras 4500, 1°', '["OSDE","Swiss Medical","Galeno","Medifé"]', 4.9, 201, 'Mañana 10:00', true, true, '20 años', 'Pediatra con foco en desarrollo infantil y vacunación.'),
  ('Dr. Roberto Díaz', 'Dermatología', 'Microcentro, CABA', 'Av. Corrientes 1200, 8°', '["PAMI","OSDE","Swiss Medical"]', 4.5, 45, 'Jueves 11:00', true, true, '12 años', 'Dermatólogo clínico y estético.'),
  ('Dra. Sofía Ramírez', 'Ginecología', 'Recoleta, CABA', 'Arenales 1850, 3°', '["OSDE","Swiss Medical","Medifé","Galeno"]', 4.8, 156, 'Hoy 16:30', true, true, '16 años', 'Ginecóloga obstetra con experiencia en fertilidad.'),
  ('Dr. Martín López', 'Oftalmología', 'Caballito, CABA', 'Av. Rivadavia 5400, 1°', '["PAMI","OSDE","IOMA"]', 4.4, 38, 'Viernes 09:00', true, false, '10 años', 'Oftalmólogo especialista en cirugía refractiva.'),
  ('Dra. Carolina Morales', 'Psiquiatría', 'Palermo, CABA', 'El Salvador 4800, 6°', '["OSDE","Swiss Medical","Galeno"]', 4.7, 72, 'Mañana 14:00', true, true, '14 años', 'Psiquiatra con enfoque en trastornos de ansiedad y depresión.')
ON CONFLICT DO NOTHING;

-- ─── 7. Doctor reviews ──────────────────────────────────────────────────────
-- Get first doctor ID for reviews
DO $$
DECLARE
  doc_id UUID;
BEGIN
  SELECT id INTO doc_id FROM doctors WHERE name = 'Dr. Carlos Rodríguez' LIMIT 1;
  IF doc_id IS NOT NULL THEN
    INSERT INTO doctor_reviews (doctor_id, patient_name, rating, text, verified, date)
    VALUES
      (doc_id, 'Carlos M.', 5, 'Excelente profesional, muy atento.', true, '2026-03-10'),
      (doc_id, 'Ana G.', 5, 'Siempre se toma el tiempo para explicar todo.', true, '2026-03-05'),
      (doc_id, 'Roberto P.', 4, 'Muy buen médico, la espera fue un poco larga.', true, '2026-02-28')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- ─── 8. Sample medications ──────────────────────────────────────────────────
INSERT INTO medications (name, lab, category, price, pami_coverage, os_coverage, prepaga_coverage, stock, requires_prescription)
VALUES
  ('Ibuprofeno 400mg', 'Bagó', 'Antiinflamatorio', 420000, 50, 40, 60, 'Disponible', false),
  ('Amoxicilina 500mg', 'Roemmers', 'Antibiótico', 850000, 70, 50, 70, 'Disponible', true),
  ('Losartán 50mg', 'Gador', 'Antihipertensivo', 680000, 80, 60, 75, 'Disponible', true),
  ('Metformina 850mg', 'Montpellier', 'Antidiabético', 520000, 75, 55, 70, 'Disponible', true),
  ('Omeprazol 20mg', 'Bagó', 'Antiulceroso', 380000, 60, 45, 65, 'Disponible', true),
  ('Paracetamol 500mg', 'Raffo', 'Analgésico', 280000, 40, 30, 50, 'Disponible', false),
  ('Enalapril 10mg', 'Gador', 'Antihipertensivo', 450000, 70, 55, 70, 'Disponible', true),
  ('Atorvastatina 20mg', 'Pfizer', 'Hipolipemiante', 920000, 65, 50, 70, 'Disponible', true)
ON CONFLICT DO NOTHING;

-- ─── Done! ───────────────────────────────────────────────────────────────────
-- The system is ready. When a user signs up via /auth/registro,
-- the handle_new_user() trigger will auto-create their clinic + profile.
-- For the first admin, sign up with metadata:
--   { clinic_name: "Clínica San Martín", full_name: "Dr. Rodríguez", role: "admin" }

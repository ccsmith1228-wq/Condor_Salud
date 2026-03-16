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
CREATE OR REPLACE FUNCTION auth.clinic_id()
RETURNS UUID AS $$
  SELECT clinic_id FROM profiles WHERE id = auth.uid()
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ─── Clinics: users can only see their own clinic ────────────────────────────
CREATE POLICY "Users see own clinic"
  ON clinics FOR SELECT TO authenticated
  USING (id = auth.clinic_id());

CREATE POLICY "Admins update own clinic"
  ON clinics FOR UPDATE TO authenticated
  USING (id = auth.clinic_id())
  WITH CHECK (id = auth.clinic_id());

-- ─── Profiles: users see teammates ──────────────────────────────────────────
CREATE POLICY "Users see clinic profiles"
  ON profiles FOR SELECT TO authenticated
  USING (clinic_id = auth.clinic_id());

CREATE POLICY "Users update own profile"
  ON profiles FOR UPDATE TO authenticated
  USING (id = auth.uid());

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
    EXECUTE format(
      'CREATE POLICY "Tenant isolation read" ON %I FOR SELECT TO authenticated USING (clinic_id = auth.clinic_id())',
      tbl
    );
    -- INSERT: must be own clinic
    EXECUTE format(
      'CREATE POLICY "Tenant isolation insert" ON %I FOR INSERT TO authenticated WITH CHECK (clinic_id = auth.clinic_id())',
      tbl
    );
    -- UPDATE: own clinic only
    EXECUTE format(
      'CREATE POLICY "Tenant isolation update" ON %I FOR UPDATE TO authenticated USING (clinic_id = auth.clinic_id()) WITH CHECK (clinic_id = auth.clinic_id())',
      tbl
    );
    -- DELETE: own clinic only
    EXECUTE format(
      'CREATE POLICY "Tenant isolation delete" ON %I FOR DELETE TO authenticated USING (clinic_id = auth.clinic_id())',
      tbl
    );
  END LOOP;
END $$;

-- ─── Nomenclador: readable by all authenticated users (national standard) ───
CREATE POLICY "Nomenclador public read"
  ON nomenclador FOR SELECT TO authenticated
  USING (true);

-- Only service_role can modify nomenclador (admin seeding)
CREATE POLICY "Nomenclador admin write"
  ON nomenclador FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ─── Waitlist: public insert (anon), read by service_role only ──────────────
CREATE POLICY "Waitlist public insert"
  ON waitlist FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Waitlist authenticated insert"
  ON waitlist FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Waitlist admin read"
  ON waitlist FOR SELECT TO service_role
  USING (true);

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
    EXECUTE format(
      'CREATE POLICY "Tenant read" ON %I FOR SELECT TO authenticated USING (clinic_id = auth.clinic_id())',
      tbl
    );
    EXECUTE format(
      'CREATE POLICY "Tenant insert" ON %I FOR INSERT TO authenticated WITH CHECK (clinic_id = auth.clinic_id())',
      tbl
    );
    EXECUTE format(
      'CREATE POLICY "Tenant update" ON %I FOR UPDATE TO authenticated USING (clinic_id = auth.clinic_id()) WITH CHECK (clinic_id = auth.clinic_id())',
      tbl
    );
    EXECUTE format(
      'CREATE POLICY "Tenant delete" ON %I FOR DELETE TO authenticated USING (clinic_id = auth.clinic_id())',
      tbl
    );
  END LOOP;
END $$;

-- Doctors and doctor_reviews are public-readable (patient portal)
CREATE POLICY "Doctors public read"
  ON doctors FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Doctors anon read"
  ON doctors FOR SELECT TO anon
  USING (true);

CREATE POLICY "Doctor reviews public read"
  ON doctor_reviews FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Doctor reviews anon read"
  ON doctor_reviews FOR SELECT TO anon
  USING (true);

CREATE POLICY "Doctor availability public read"
  ON doctor_availability FOR SELECT TO authenticated
  USING (true);

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
BEGIN
  -- If user signed up with clinic metadata, create the clinic first
  IF NEW.raw_user_meta_data->>'clinic_name' IS NOT NULL THEN
    INSERT INTO clinics (name, cuit, provincia, especialidad)
    VALUES (
      COALESCE(NEW.raw_user_meta_data->>'clinic_name', 'Mi Clínica'),
      COALESCE(NEW.raw_user_meta_data->>'cuit', ''),
      COALESCE(NEW.raw_user_meta_data->>'provincia', 'CABA'),
      COALESCE(NEW.raw_user_meta_data->>'especialidad', '')
    )
    RETURNING id INTO _clinic_id;
  ELSE
    -- Create a default clinic for the user
    INSERT INTO clinics (name, cuit)
    VALUES (COALESCE(NEW.raw_user_meta_data->>'clinic_name', 'Mi Clínica'), '')
    RETURNING id INTO _clinic_id;
  END IF;

  -- Create the profile
  INSERT INTO profiles (id, clinic_id, role, full_name)
  VALUES (
    NEW.id,
    _clinic_id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'admin'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
CREATE POLICY "Triage photos upload"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'triage-photos' AND
    (storage.foldername(name))[1] = auth.clinic_id()::text
  );

CREATE POLICY "Triage photos read"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'triage-photos' AND
    (storage.foldername(name))[1] = auth.clinic_id()::text
  );

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

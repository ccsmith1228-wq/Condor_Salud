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

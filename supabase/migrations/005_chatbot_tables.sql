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

-- Migration 016: Welcome Plan (Plan de Bienvenida) for Club Salud
-- Gender- and age-specific medical screening studies included in ALL tiers.
--
-- Run: supabase db push

-- ═══════════════════════════════════════════════════════════════
-- 1. Welcome Plan Studies catalog
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS club_welcome_studies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name_es TEXT NOT NULL,
  name_en TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('cardio', 'imaging', 'lab', 'screening')),
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'all')),
  min_age INT,                                   -- NULL = no age gate
  description_es TEXT NOT NULL,
  description_en TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- 2. Track which studies a member has completed
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS club_welcome_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  membership_id UUID NOT NULL REFERENCES club_memberships(id) ON DELETE CASCADE,
  study_slug TEXT NOT NULL REFERENCES club_welcome_studies(slug) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  provider_name TEXT,                             -- clinic or lab name
  notes TEXT,
  UNIQUE (membership_id, study_slug)
);

CREATE INDEX IF NOT EXISTS idx_welcome_completions_membership ON club_welcome_completions(membership_id);

-- ═══════════════════════════════════════════════════════════════
-- 3. RLS policies
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE club_welcome_studies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read welcome studies" ON club_welcome_studies FOR SELECT USING (TRUE);

ALTER TABLE club_welcome_completions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can manage their welcome completions" ON club_welcome_completions FOR ALL
  USING (
    membership_id IN (
      SELECT id FROM club_memberships WHERE patient_id = auth.uid()::text
    )
  );

-- ═══════════════════════════════════════════════════════════════
-- 4. Seed studies
-- ═══════════════════════════════════════════════════════════════

INSERT INTO club_welcome_studies (slug, name_es, name_en, category, gender, min_age, description_es, description_en, sort_order)
VALUES
  -- Shared (all genders)
  ('ecg',             'Electrocardiograma (ECG)',        'Electrocardiogram (ECG)',       'cardio',    'all',    NULL, 'Registro de la actividad eléctrica del corazón en reposo.',                           'Recording of the heart''s electrical activity at rest.',                    1),
  ('ecocardiograma',  'Ecocardiograma',                  'Echocardiogram',                'cardio',    'all',    NULL, 'Ecografía cardíaca para evaluar estructura y función del corazón.',                   'Cardiac ultrasound to assess heart structure and function.',                2),
  ('ergometria',      'Ergometría',                      'Stress Test (Ergometry)',        'cardio',    'all',    NULL, 'Prueba de esfuerzo en cinta para evaluar respuesta cardiovascular.',                  'Treadmill stress test to evaluate cardiovascular response.',               3),
  -- Male
  ('rx-torax',        'Radiografía de Tórax',            'Chest X-Ray',                   'imaging',   'male',   NULL, 'Imagen del tórax para evaluar pulmones, corazón y estructuras óseas.',                'Chest image to evaluate lungs, heart, and bone structures.',               4),
  ('eco-prostatica',  'Ecografía Prostática',            'Prostate Ultrasound',           'screening', 'male',   45,   'Ecografía transabdominal de próstata. Recomendada a partir de los 45 años.',         'Transabdominal prostate ultrasound. Recommended from age 45.',             5),
  ('doppler-cuello',  'Doppler de Vasos de Cuello',      'Neck Vessels Doppler',          'cardio',    'male',   45,   'Ecografía Doppler de arterias carótidas y vertebrales para evaluar flujo sanguíneo.', 'Doppler ultrasound of carotid and vertebral arteries to assess blood flow.', 6),
  -- Female
  ('eco-mamaria',     'Ecografía Mamaria',               'Breast Ultrasound',             'screening', 'female', NULL, 'Ecografía bilateral de mamas para detección temprana.',                               'Bilateral breast ultrasound for early detection.',                         7),
  ('eco-ginecologica','Ecografía Ginecológica',           'Gynecological Ultrasound',      'screening', 'female', NULL, 'Ecografía pélvica transabdominal para evaluación ginecológica.',                      'Transabdominal pelvic ultrasound for gynecological evaluation.',           8),
  ('laboratorio',     'Laboratorio Completo',            'Complete Bloodwork',            'lab',       'female', NULL, 'Hemograma, glucemia, perfil lipídico, función renal, hepática y tiroidea.',          'CBC, glucose, lipid panel, renal, hepatic and thyroid function.',          9)
ON CONFLICT (slug) DO NOTHING;

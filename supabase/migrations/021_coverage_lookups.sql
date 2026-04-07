-- 021_coverage_lookups.sql
-- Cache table for external coverage API results (SISA, PAMI, etc.)
-- Avoids hammering external services on repeated lookups for the same patient.
-- TTL is enforced in application code (24h default).

CREATE TABLE IF NOT EXISTS coverage_lookups (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id   uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  dni         text NOT NULL,
  status      text NOT NULL CHECK (status IN ('activo', 'inactivo', 'no_encontrado')),
  nombre      text NOT NULL DEFAULT '',
  financiador text NOT NULL DEFAULT '',
  plan        text NOT NULL DEFAULT '',
  vigencia    text NOT NULL DEFAULT '',
  grupo       text NOT NULL DEFAULT '',
  rnos        text,
  source      text NOT NULL DEFAULT 'cache',
  fetched_at  timestamptz NOT NULL DEFAULT now(),
  created_at  timestamptz NOT NULL DEFAULT now(),

  UNIQUE (clinic_id, dni)
);

-- Index for fast lookups by clinic + DNI
CREATE INDEX IF NOT EXISTS idx_coverage_lookups_clinic_dni
  ON coverage_lookups (clinic_id, dni);

-- Index to clean up stale cache entries (optional cron)
CREATE INDEX IF NOT EXISTS idx_coverage_lookups_fetched
  ON coverage_lookups (fetched_at);

-- RLS: clinics can only see their own lookups
ALTER TABLE coverage_lookups ENABLE ROW LEVEL SECURITY;

CREATE POLICY coverage_lookups_clinic_read ON coverage_lookups
  FOR SELECT USING (clinic_id = auth.uid()::uuid);

CREATE POLICY coverage_lookups_clinic_write ON coverage_lookups
  FOR ALL USING (clinic_id = auth.uid()::uuid);

-- Service role bypass (for API routes using service_role key)
CREATE POLICY coverage_lookups_service ON coverage_lookups
  FOR ALL USING (current_setting('request.jwt.claim.role', true) = 'service_role');

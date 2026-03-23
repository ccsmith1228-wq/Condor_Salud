-- Migration 014: Partner applications table
-- Stores form submissions from /partnerships page

CREATE TABLE IF NOT EXISTS partner_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  company_type TEXT NOT NULL CHECK (company_type IN ('agencia', 'aerolinea', 'ota', 'dmc', 'otro')),
  monthly_volume TEXT NOT NULL CHECK (monthly_volume IN ('lt50', '50-200', '200-500', '500-2000', 'gt2000')),
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'onboarding', 'active', 'rejected')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_partner_apps_status ON partner_applications(status);
CREATE INDEX IF NOT EXISTS idx_partner_apps_email ON partner_applications(email);

-- RLS: admin-only access
ALTER TABLE partner_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage partner applications" ON partner_applications FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

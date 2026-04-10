-- 024: Receipts / Comprobantes de Servicio
-- Tracks services rendered per patient, creates a receipt with line items.

-- ── Main receipts table ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS receipts (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id     UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id    UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  receipt_number TEXT,                        -- human-readable sequential number
  status        TEXT NOT NULL DEFAULT 'draft', -- draft | completed | voided
  subtotal      NUMERIC(14, 2) NOT NULL DEFAULT 0,
  discount      NUMERIC(14, 2) NOT NULL DEFAULT 0,
  total         NUMERIC(14, 2) NOT NULL DEFAULT 0,
  currency      TEXT NOT NULL DEFAULT 'ARS',
  payment_method TEXT,                        -- efectivo | tarjeta | transferencia | obra_social | otro
  notes         TEXT,
  created_by    UUID REFERENCES profiles(id),
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- ── Receipt line items ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS receipt_items (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  receipt_id    UUID NOT NULL REFERENCES receipts(id) ON DELETE CASCADE,
  service_id    UUID REFERENCES clinic_services(id) ON DELETE SET NULL,
  service_name  TEXT NOT NULL,                 -- snapshot of name at billing time
  category      TEXT,
  unit_price    NUMERIC(14, 2) NOT NULL DEFAULT 0,
  quantity      INTEGER NOT NULL DEFAULT 1,
  subtotal      NUMERIC(14, 2) NOT NULL DEFAULT 0,
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ── Indexes ────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_receipts_clinic    ON receipts(clinic_id);
CREATE INDEX IF NOT EXISTS idx_receipts_patient   ON receipts(patient_id);
CREATE INDEX IF NOT EXISTS idx_receipts_status    ON receipts(status);
CREATE INDEX IF NOT EXISTS idx_receipts_created   ON receipts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_receipt_items_receipt ON receipt_items(receipt_id);

-- ── Auto-generate receipt_number ───────────────────────────────
CREATE OR REPLACE FUNCTION generate_receipt_number()
RETURNS TRIGGER AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(
    CAST(NULLIF(regexp_replace(receipt_number, '[^0-9]', '', 'g'), '') AS INTEGER)
  ), 0) + 1
  INTO next_num
  FROM receipts
  WHERE clinic_id = NEW.clinic_id;

  NEW.receipt_number := 'REC-' || LPAD(next_num::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_receipt_number ON receipts;
CREATE TRIGGER trg_receipt_number
  BEFORE INSERT ON receipts
  FOR EACH ROW
  WHEN (NEW.receipt_number IS NULL)
  EXECUTE FUNCTION generate_receipt_number();

-- ── Updated_at trigger ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_receipts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_receipts_updated ON receipts;
CREATE TRIGGER trg_receipts_updated
  BEFORE UPDATE ON receipts
  FOR EACH ROW
  EXECUTE FUNCTION update_receipts_updated_at();

-- ── RLS ────────────────────────────────────────────────────────
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipt_items ENABLE ROW LEVEL SECURITY;

-- Receipts: staff can see/manage their clinic's receipts
CREATE POLICY receipts_select ON receipts FOR SELECT
  USING (clinic_id IN (SELECT clinic_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY receipts_insert ON receipts FOR INSERT
  WITH CHECK (clinic_id IN (SELECT clinic_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY receipts_update ON receipts FOR UPDATE
  USING (clinic_id IN (SELECT clinic_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY receipts_delete ON receipts FOR DELETE
  USING (clinic_id IN (SELECT clinic_id FROM profiles WHERE id = auth.uid()));

-- Receipt items: accessible via receipt's clinic scope
CREATE POLICY receipt_items_select ON receipt_items FOR SELECT
  USING (receipt_id IN (SELECT id FROM receipts WHERE clinic_id IN (SELECT clinic_id FROM profiles WHERE id = auth.uid())));

CREATE POLICY receipt_items_insert ON receipt_items FOR INSERT
  WITH CHECK (receipt_id IN (SELECT id FROM receipts WHERE clinic_id IN (SELECT clinic_id FROM profiles WHERE id = auth.uid())));

CREATE POLICY receipt_items_update ON receipt_items FOR UPDATE
  USING (receipt_id IN (SELECT id FROM receipts WHERE clinic_id IN (SELECT clinic_id FROM profiles WHERE id = auth.uid())));

CREATE POLICY receipt_items_delete ON receipt_items FOR DELETE
  USING (receipt_id IN (SELECT id FROM receipts WHERE clinic_id IN (SELECT clinic_id FROM profiles WHERE id = auth.uid())));

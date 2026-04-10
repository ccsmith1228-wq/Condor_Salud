-- ============================================================
-- Migration 023: Add EF price + notes to clinic_services
-- EF = precio bonificado (discounted/affiliated price)
-- notes = free-text notes (e.g. "INF" = informe incluido)
-- ============================================================

ALTER TABLE clinic_services
  ADD COLUMN IF NOT EXISTS ef_price NUMERIC(12, 2),
  ADD COLUMN IF NOT EXISTS notes TEXT;

COMMENT ON COLUMN clinic_services.ef_price IS 'Precio bonificado/afiliado (EF). NULL = no discount.';
COMMENT ON COLUMN clinic_services.notes IS 'Free-text notes visible to receptionists (e.g. +INF, Sin Desc.)';

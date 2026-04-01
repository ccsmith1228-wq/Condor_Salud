-- ═══════════════════════════════════════════════════════════════
-- Migration 019: Club Salud — Unique Member ID + Wallet Support
-- ═══════════════════════════════════════════════════════════════
-- Adds a unique human-readable member ID (CS-XXXXXX) to each
-- club membership. Used on virtual card and wallet passes.

-- 1. Add member_id column
ALTER TABLE club_memberships
  ADD COLUMN IF NOT EXISTS member_id TEXT UNIQUE;

-- 2. Create sequence for auto-incrementing member numbers
CREATE SEQUENCE IF NOT EXISTS club_member_id_seq START WITH 100001;

-- 3. Backfill existing memberships
UPDATE club_memberships
SET member_id = 'CS-' || LPAD(nextval('club_member_id_seq')::TEXT, 6, '0')
WHERE member_id IS NULL;

-- 4. Make it NOT NULL going forward
ALTER TABLE club_memberships
  ALTER COLUMN member_id SET DEFAULT 'CS-' || LPAD(nextval('club_member_id_seq')::TEXT, 6, '0');

ALTER TABLE club_memberships
  ALTER COLUMN member_id SET NOT NULL;

-- 5. Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_club_memberships_member_id ON club_memberships(member_id);

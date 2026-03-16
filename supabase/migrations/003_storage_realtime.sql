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

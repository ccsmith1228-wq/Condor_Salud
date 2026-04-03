-- 020_reminder_columns.sql
-- Add reminder tracking columns to clinic_bookings so the cron
-- can stamp which bookings have already received reminders.

ALTER TABLE clinic_bookings
  ADD COLUMN IF NOT EXISTS reminder_sent_at    timestamptz,
  ADD COLUMN IF NOT EXISTS reminder_2h_sent_at timestamptz;

-- Index for efficient cron look-ups: "confirmed bookings on date X that
-- haven't been reminded yet"
CREATE INDEX IF NOT EXISTS idx_clinic_bookings_reminder_24h
  ON clinic_bookings (fecha, status)
  WHERE reminder_sent_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_clinic_bookings_reminder_2h
  ON clinic_bookings (fecha, hora, status)
  WHERE reminder_2h_sent_at IS NULL;

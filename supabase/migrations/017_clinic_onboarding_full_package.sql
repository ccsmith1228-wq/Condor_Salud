-- ─── Migration 017: Clinic Onboarding Full Package ──────────
-- Adds public-facing clinic profiles, external booking support,
-- appointment notification tracking, and WhatsApp confirmation flow.

-- 1. Enhance clinics table with public-facing fields
ALTER TABLE clinics
  ADD COLUMN IF NOT EXISTS slug text UNIQUE,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS website text,
  ADD COLUMN IF NOT EXISTS languages text[] DEFAULT ARRAY['es'],
  ADD COLUMN IF NOT EXISTS operating_hours jsonb DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS lat double precision,
  ADD COLUMN IF NOT EXISTS lng double precision,
  ADD COLUMN IF NOT EXISTS accepts_insurance text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS onboarded_at timestamptz,
  ADD COLUMN IF NOT EXISTS public_visible boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS booking_enabled boolean DEFAULT false;

-- Generate slugs for existing clinics
UPDATE clinics SET slug = lower(replace(replace(name, ' ', '-'), '.', ''))
  WHERE slug IS NULL;

-- 2. Add clinic_id to doctors table (many doctors → one clinic)
ALTER TABLE doctors
  ADD COLUMN IF NOT EXISTS clinic_id uuid REFERENCES clinics(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS matricula text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS email text;

-- 3. External bookings table (for patients who book via public page)
CREATE TABLE IF NOT EXISTS clinic_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  doctor_id uuid REFERENCES doctors(id) ON DELETE SET NULL,

  -- Patient info (may not have an account)
  patient_name text NOT NULL,
  patient_email text,
  patient_phone text,
  patient_language text DEFAULT 'es',

  -- Booking details
  fecha date NOT NULL,
  hora text NOT NULL,  -- HH:MM
  hora_fin text,       -- HH:MM
  specialty text,
  tipo text DEFAULT 'presencial',  -- presencial | teleconsulta
  notas text,

  -- Lifecycle
  status text DEFAULT 'pending'
    CHECK (status IN ('pending','notified','confirmed','cancelled','completed','no_show')),
  booked_via text DEFAULT 'web',  -- web | whatsapp | cora | phone

  -- Notification tracking
  clinic_notified_at timestamptz,
  clinic_notified_via text,  -- email | whatsapp | both
  patient_notified_at timestamptz,
  confirmed_at timestamptz,
  cancelled_at timestamptz,
  cancel_reason text,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_clinic_bookings_clinic_date ON clinic_bookings(clinic_id, fecha);
CREATE INDEX IF NOT EXISTS idx_clinic_bookings_status ON clinic_bookings(status);
CREATE INDEX IF NOT EXISTS idx_clinic_bookings_doctor ON clinic_bookings(doctor_id);

-- 4. Booking notification log (audit trail)
CREATE TABLE IF NOT EXISTS booking_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES clinic_bookings(id) ON DELETE CASCADE,
  channel text NOT NULL CHECK (channel IN ('email','whatsapp','push','sms')),
  recipient_type text NOT NULL CHECK (recipient_type IN ('clinic','patient','doctor')),
  recipient_contact text NOT NULL,  -- email or phone
  template text,          -- template name used
  status text DEFAULT 'sent' CHECK (status IN ('sent','delivered','failed','read')),
  external_id text,       -- Twilio SID or Resend ID
  error_message text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_booking_notif_booking ON booking_notifications(booking_id);

-- 5. Clinic booking settings
CREATE TABLE IF NOT EXISTS clinic_booking_settings (
  clinic_id uuid PRIMARY KEY REFERENCES clinics(id) ON DELETE CASCADE,
  slot_duration_min integer DEFAULT 30,
  max_advance_days integer DEFAULT 60,   -- how far in advance patients can book
  min_advance_hours integer DEFAULT 2,   -- minimum hours before appointment
  auto_confirm boolean DEFAULT false,    -- auto-confirm or require manual
  notify_via text[] DEFAULT ARRAY['email','whatsapp'],
  confirmation_message text DEFAULT 'Su turno ha sido confirmado.',
  cancellation_message text DEFAULT 'Su turno ha sido cancelado.',
  reminder_hours_before integer DEFAULT 24,
  working_days integer[] DEFAULT ARRAY[1,2,3,4,5],  -- Mon-Fri
  break_start text DEFAULT '13:00',
  break_end text DEFAULT '14:00',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 6. RLS policies
ALTER TABLE clinic_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_booking_settings ENABLE ROW LEVEL SECURITY;

-- Clinic staff can see their own bookings
CREATE POLICY "clinic_bookings_clinic_access" ON clinic_bookings
  FOR ALL USING (
    clinic_id IN (SELECT clinic_id FROM profiles WHERE id = auth.uid())
  );

-- Public insert for external bookings (patients without accounts)
CREATE POLICY "clinic_bookings_public_insert" ON clinic_bookings
  FOR INSERT WITH CHECK (true);

-- Public select for checking own booking (by email/phone)
CREATE POLICY "clinic_bookings_public_select" ON clinic_bookings
  FOR SELECT USING (true);

-- Notifications visible to clinic staff
CREATE POLICY "booking_notif_clinic_access" ON booking_notifications
  FOR ALL USING (
    booking_id IN (
      SELECT id FROM clinic_bookings WHERE clinic_id IN (
        SELECT clinic_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- Settings managed by clinic staff
CREATE POLICY "clinic_settings_access" ON clinic_booking_settings
  FOR ALL USING (
    clinic_id IN (SELECT clinic_id FROM profiles WHERE id = auth.uid())
  );

-- 7. Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_booking_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_clinic_bookings_updated
  BEFORE UPDATE ON clinic_bookings
  FOR EACH ROW EXECUTE FUNCTION update_booking_timestamp();

CREATE TRIGGER trg_clinic_booking_settings_updated
  BEFORE UPDATE ON clinic_booking_settings
  FOR EACH ROW EXECUTE FUNCTION update_booking_timestamp();

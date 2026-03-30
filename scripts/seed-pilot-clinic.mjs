// ─── Seed Pilot Clinic ───────────────────────────────────────
// Run with: node --loader tsx scripts/seed-pilot-clinic.mjs
// Or: npx tsx scripts/seed-pilot-clinic.mjs
//
// Seeds a realistic Buenos Aires clinic with:
// - Clinic profile (public-visible, booking-enabled)
// - 3 doctors with availability
// - Booking settings
// - WhatsApp config
//
// Requires: NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const sb = createClient(url, key);

async function main() {
  console.log("Seeding pilot clinic...\n");

  // ─── 1. Create or update the clinic ─────────────────────────
  const clinicPayload = {
    name: "Clínica Salud Recoleta",
    slug: "clinica-salud-recoleta",
    cuit: "30-71234567-9",
    plan_tier: "plus",
    sedes: 1,
    provincia: "CABA",
    localidad: "Recoleta",
    especialidad: "Clínica General, Dermatología, Pediatría, Cardiología",
    phone: "+5491145678900",
    email: "turnos@clinicarecoleta.com.ar",
    address: "Av. Callao 1234, Recoleta, Buenos Aires",
    description:
      "Clínica de atención integral en el corazón de Recoleta. " +
      "Atendemos con las principales obras sociales y prepagas. " +
      "Servicio bilingüe para pacientes internacionales.",
    languages: ["es", "en"],
    operating_hours: {
      lun: { open: "08:00", close: "20:00" },
      mar: { open: "08:00", close: "20:00" },
      mie: { open: "08:00", close: "20:00" },
      jue: { open: "08:00", close: "20:00" },
      vie: { open: "08:00", close: "18:00" },
      sab: { open: "09:00", close: "13:00" },
    },
    lat: -34.5957,
    lng: -58.3932,
    accepts_insurance: ["OSDE", "Swiss Medical", "Galeno", "Medifé", "PAMI"],
    active: true,
    onboarding_complete: true,
    public_visible: true,
    booking_enabled: true,
    onboarded_at: new Date().toISOString(),
  };

  const { data: existingClinic } = await sb
    .from("clinics")
    .select("id")
    .eq("cuit", clinicPayload.cuit)
    .single();

  let clinicId;
  if (existingClinic) {
    clinicId = existingClinic.id;
    await sb.from("clinics").update(clinicPayload).eq("id", clinicId);
    console.log(`  Updated clinic: ${clinicPayload.name} (${clinicId})`);
  } else {
    const { data: newClinic, error } = await sb
      .from("clinics")
      .insert(clinicPayload)
      .select("id")
      .single();
    if (error) {
      console.error("  Failed to create clinic:", error);
      process.exit(1);
    }
    clinicId = newClinic.id;
    console.log(`  Created clinic: ${clinicPayload.name} (${clinicId})`);
  }

  // ─── 2. Create doctors ─────────────────────────────────────
  const doctors = [
    {
      name: "Dr. Martín Ruiz",
      specialty: "Clínica General",
      location: "Recoleta, Buenos Aires",
      address: "Av. Callao 1234",
      financiadores: ["OSDE", "Swiss Medical", "Galeno"],
      rating: 4.9,
      review_count: 127,
      available: true,
      teleconsulta: true,
      experience: "15 años",
      languages: ["es", "en"],
      bio: "Médico clínico con amplia experiencia en atención primaria y medicina preventiva. Bilingüe.",
      matricula: "MN-45892",
      clinic_id: clinicId,
      active: true,
    },
    {
      name: "Dra. Carolina Vega",
      specialty: "Dermatología",
      location: "Recoleta, Buenos Aires",
      address: "Av. Callao 1234",
      financiadores: ["OSDE", "Swiss Medical", "Medifé"],
      rating: 4.8,
      review_count: 89,
      available: true,
      teleconsulta: true,
      experience: "12 años",
      languages: ["es", "en"],
      bio: "Especialista en dermatología clínica, estética y dermocosmética.",
      matricula: "MN-38741",
      clinic_id: clinicId,
      active: true,
    },
    {
      name: "Dr. Lucas Fernández",
      specialty: "Pediatría",
      location: "Recoleta, Buenos Aires",
      address: "Av. Callao 1234",
      financiadores: ["OSDE", "Galeno", "PAMI"],
      rating: 4.7,
      review_count: 64,
      available: true,
      teleconsulta: false,
      experience: "10 años",
      languages: ["es"],
      bio: "Pediatra dedicado al cuidado integral del niño y adolescente.",
      matricula: "MN-52103",
      clinic_id: clinicId,
      active: true,
    },
  ];

  const doctorIds = [];
  for (const doc of doctors) {
    // Check if doctor already exists by matrícula
    const { data: existing } = await sb
      .from("doctors")
      .select("id")
      .eq("matricula", doc.matricula)
      .single();

    if (existing) {
      await sb.from("doctors").update(doc).eq("id", existing.id);
      doctorIds.push(existing.id);
      console.log(`  Updated doctor: ${doc.name} (${existing.id})`);
    } else {
      const { data: newDoc, error } = await sb
        .from("doctors")
        .insert(doc)
        .select("id")
        .single();
      if (error) {
        console.error(`  Failed to create doctor ${doc.name}:`, error);
        continue;
      }
      doctorIds.push(newDoc.id);
      console.log(`  Created doctor: ${doc.name} (${newDoc.id})`);
    }
  }

  // ─── 3. Create availability slots (next 30 days) ───────────
  console.log("\n  Generating availability slots...");
  let slotCount = 0;
  const now = new Date();

  for (const doctorId of doctorIds) {
    // Clear existing future availability
    await sb
      .from("doctor_availability")
      .delete()
      .eq("doctor_id", doctorId)
      .gte("date", now.toISOString().slice(0, 10));

    for (let day = 1; day <= 30; day++) {
      const d = new Date(now);
      d.setDate(d.getDate() + day);
      const dayOfWeek = d.getDay();

      // Skip Sunday (0)
      if (dayOfWeek === 0) continue;

      // Saturday: shorter hours
      const slots =
        dayOfWeek === 6
          ? ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30"]
          : [
              "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
              "11:00", "11:30", "12:00", "12:30",
              "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
              "17:00", "17:30",
            ];

      const rows = slots.map((time) => ({
        doctor_id: doctorId,
        date: d.toISOString().slice(0, 10),
        time_slot: time,
        booked: false,
      }));

      await sb.from("doctor_availability").insert(rows);
      slotCount += rows.length;
    }
  }
  console.log(`  Created ${slotCount} availability slots for ${doctorIds.length} doctors`);

  // ─── 4. Booking settings ───────────────────────────────────
  await sb.from("clinic_booking_settings").upsert({
    clinic_id: clinicId,
    slot_duration_min: 30,
    max_advance_days: 60,
    min_advance_hours: 2,
    auto_confirm: false,
    notify_via: ["email", "whatsapp"],
    confirmation_message: "Su turno ha sido confirmado. Lo esperamos!",
    cancellation_message: "Su turno ha sido cancelado. Puede reservar otro en condorsalud.com",
    reminder_hours_before: 24,
    working_days: [1, 2, 3, 4, 5, 6],
    break_start: "13:00",
    break_end: "14:00",
  });
  console.log("  Created booking settings");

  // ─── 5. Sample bookings (to populate the dashboard) ────────
  const sampleBookings = [
    {
      clinic_id: clinicId,
      doctor_id: doctorIds[0],
      patient_name: "Sarah Johnson",
      patient_email: "sarah@example.com",
      patient_phone: "+14155551234",
      patient_language: "en",
      fecha: new Date(now.getTime() + 86400000).toISOString().slice(0, 10), // tomorrow
      hora: "10:00",
      hora_fin: "10:30",
      specialty: "Clínica General",
      tipo: "presencial",
      status: "confirmed",
      booked_via: "web",
      confirmed_at: new Date().toISOString(),
    },
    {
      clinic_id: clinicId,
      doctor_id: doctorIds[1],
      patient_name: "María López",
      patient_email: "maria@ejemplo.com",
      patient_phone: "+5491155551234",
      patient_language: "es",
      fecha: new Date(now.getTime() + 86400000).toISOString().slice(0, 10),
      hora: "11:00",
      hora_fin: "11:30",
      specialty: "Dermatología",
      tipo: "teleconsulta",
      status: "pending",
      booked_via: "whatsapp",
    },
    {
      clinic_id: clinicId,
      doctor_id: doctorIds[0],
      patient_name: "James Miller",
      patient_email: "james@example.com",
      patient_phone: "+12125559876",
      patient_language: "en",
      fecha: new Date(now.getTime() + 172800000).toISOString().slice(0, 10), // day after tomorrow
      hora: "14:00",
      hora_fin: "14:30",
      specialty: "Clínica General",
      tipo: "presencial",
      status: "pending",
      booked_via: "cora",
    },
  ];

  const { error: bookingErr } = await sb.from("clinic_bookings").insert(sampleBookings);
  if (bookingErr) {
    console.warn("  Sample bookings insert warning:", bookingErr.message);
  } else {
    console.log(`  Created ${sampleBookings.length} sample bookings`);
  }

  // ─── Done ──────────────────────────────────────────────────
  console.log("\n✅ Pilot clinic seeded successfully!");
  console.log(`   Clinic: ${clinicPayload.name}`);
  console.log(`   Slug: ${clinicPayload.slug}`);
  console.log(`   Doctors: ${doctors.length}`);
  console.log(`   Booking URL: /reservar/${clinicPayload.slug}`);
  console.log(`   Dashboard: /dashboard/agenda`);
}

main().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});

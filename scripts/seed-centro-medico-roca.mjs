// ─── Seed: Centro Médico Roca ────────────────────────────────
// Run: node scripts/seed-centro-medico-roca.mjs
//
// Seeds the first real clinic onboarding:
//   - Clinic profile with full public data
//   - 26 confirmed professionals (from Profesionales actuales.pdf)
//   - Booking settings (15 min slots, auto-confirm)
//   - Availability slots for the next 60 days
//
// Requires env: NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error(
    "❌ Missing env vars. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY",
  );
  process.exit(1);
}

const sb = createClient(url, key);

// ─── Clinic Data ─────────────────────────────────────────────

const CLINIC = {
  name: "Centro Médico Roca",
  slug: "centro-medico-roca",
  cuit: "20-95140905-8",
  plan_tier: "plus",
  sedes: 2,
  provincia: "CABA",
  localidad: "Caballito",
  especialidad:
    "Clínico, Cardiología, Ecografía, Odontología, Traumatología, Flebología, " +
    "Urología, Oftalmología, Diabetología, Gastroenterología, Ginecología, " +
    "Alergista, Nutrición, Terapia Alternativa, Cirugía General, Infectología, " +
    "Endocrinología, Dermatología, Otorrinolaringología, Psicología, " +
    "Fonoaudiología, Neumonología, Reumatología, Cirugía Dental, Radiografía, " +
    "Hemodinamia, Mamografía, Kinesiología, Laboratorio",
  phone: "+5491127756496",
  email: "rocasaludintegral@gmail.com",
  address: "Juan B. Ambrosetti 698, C1405BIJ, CABA",
  description:
    "Centro médico de múltiples especialidades en Caballito. " +
    "Más de 27 especialidades, 30+ profesionales y 15 años de experiencia. " +
    "Precisión y calidez para tu bienestar.",
  website: "https://www.cmrocasalud.com.ar/",
  languages: ["es"],
  operating_hours: {
    lun: { open: "10:00", close: "18:00" },
    mar: { open: "09:30", close: "18:00" },
    mie: { open: "10:00", close: "18:00" },
    jue: { open: "10:00", close: "18:00" },
    vie: { open: "10:00", close: "18:00" },
  },
  lat: -34.6189,
  lng: -58.4356,
  accepts_insurance: [], // pending — will be filled later
  active: true,
  onboarding_complete: true,
  public_visible: true,
  booking_enabled: true,
  onboarded_at: new Date().toISOString(),
};

// ─── Doctors (from Profesionales actuales.pdf) ───────────────

const DOCTORS = [
  {
    name: "Dr. Francisco Lopez",
    specialty: "Director Médico",
    matricula: "MN-149549",
    phone: "+5491127756496",
    email: "rocasaludintegral@gmail.com",
    bio: "Director Médico del Centro Médico Roca. Más de 15 años al frente de la institución.",
    languages: ["es"],
    teleconsulta: false,
  },
  {
    name: "Dr. Vargas Freddy",
    specialty: "Cirugía Dental",
    matricula: null,
    phone: "+5491130763493",
    bio: "Especialista en cirugía dental.",
    languages: ["es"],
    teleconsulta: false,
  },
  {
    name: "Dr. Gustavo Delgadillo",
    specialty: "Ecografía",
    matricula: "MN-157282",
    phone: "+5491170181295",
    bio: "Especialista en ecografía y diagnóstico por imágenes.",
    languages: ["es"],
    teleconsulta: false,
  },
  {
    name: "Dra. Yessica Taboada",
    specialty: "Odontología",
    matricula: "MN-41698",
    phone: "+5491131457352",
    bio: "Odontóloga general.",
    languages: ["es"],
    teleconsulta: false,
  },
  {
    name: "Dra. Norma Legal",
    specialty: "Hematología",
    matricula: "MN-113014",
    phone: "+5491130270474",
    bio: "Especialista en hematología.",
    languages: ["es"],
    teleconsulta: false,
  },
  {
    name: "Dra. Mariana Ríos",
    specialty: "Terapia Alternativa",
    matricula: "MN-13122",
    phone: "+542216925128",
    bio: "Especialista en terapia alternativa y medicina complementaria.",
    languages: ["es"],
    teleconsulta: false,
  },
  {
    name: "Dr. Richard Rivero",
    specialty: "Traumatología",
    matricula: "MN-151338",
    phone: "+5491137050529",
    bio: "Traumatólogo. Lesiones del sistema músculo-esquelético.",
    languages: ["es"],
    teleconsulta: false,
  },
  {
    name: "Lic. Cristina Acevedo",
    specialty: "Mamografía / Kinesiología",
    matricula: null,
    phone: "+5491163246875",
    bio: "Licenciada en mamografía y kinesiología.",
    languages: ["es"],
    teleconsulta: false,
  },
  {
    name: "Dr. Rogelio Vargas Lopez",
    specialty: "Urología",
    matricula: "MN-115956",
    phone: "+5491167008079",
    bio: "Urólogo. Sistema urinario y reproductor masculino.",
    languages: ["es"],
    teleconsulta: false,
  },
  {
    name: "Dra. Alicia Urbieta",
    specialty: "Alergista",
    matricula: "MN-105946",
    phone: "+5491167497167",
    bio: "Diagnóstico y tratamiento de alergias.",
    languages: ["es"],
    teleconsulta: false,
  },
  {
    name: "Dr. Juan Manuel Dalpiaz",
    specialty: "Cirugía General",
    matricula: "MN-141225",
    phone: "+5491154922054",
    bio: "Cirujano general.",
    languages: ["es"],
    teleconsulta: false,
  },
  {
    name: "Dr. Adrián Lezcano",
    specialty: "Infectología",
    matricula: "MN-102921",
    phone: "+5491162046147",
    bio: "Especialista en enfermedades infecciosas.",
    languages: ["es"],
    teleconsulta: false,
  },
  {
    name: "Dra. Liliana Angelotti",
    specialty: "Endocrinología",
    matricula: "MN-69824",
    phone: "+5491162457322",
    bio: "Endocrinóloga. Trastornos hormonales y metabólicos.",
    languages: ["es"],
    teleconsulta: false,
  },
  {
    name: "Dra. Susana Jiménez",
    specialty: "Dermatología",
    matricula: "MN-190900",
    phone: null,
    bio: "Dermatóloga. Enfermedades de piel, cabello y uñas.",
    languages: ["es"],
    teleconsulta: false,
  },
  {
    name: "Dr. Carlos Diccea",
    specialty: "Ginecología",
    matricula: "MN-92346",
    phone: "+5491144155887",
    bio: "Ginecólogo. Salud del sistema reproductor femenino.",
    languages: ["es"],
    teleconsulta: false,
  },
  {
    name: "Dr. Carlos Lagos",
    specialty: "Flebología",
    matricula: "MN-78443",
    phone: "+5491128684688",
    bio: "Flebólogo. Tratamiento de várices y patologías venosas.",
    languages: ["es"],
    teleconsulta: false,
  },
  {
    name: "Dra. Alicia Abdala",
    specialty: "Gastroenterología",
    matricula: "MN-44522",
    phone: "+5491136635898",
    bio: "Gastroenteróloga. Enfermedades del sistema digestivo.",
    languages: ["es"],
    teleconsulta: false,
  },
  {
    name: "Dra. Sikiu Espinoza",
    specialty: "Odontología",
    matricula: "MN-44722",
    phone: "+5491128825532",
    bio: "Odontóloga general.",
    languages: ["es"],
    teleconsulta: false,
  },
  {
    name: "Lic. Oscar Molina",
    specialty: "Psicología",
    matricula: "MN-79381",
    phone: "+5491155162615",
    bio: "Psicólogo. Salud mental y bienestar emocional.",
    languages: ["es"],
    teleconsulta: false,
  },
  {
    name: "Lic. Eugenia Safar",
    specialty: "Fonoaudiología",
    matricula: "MN-9127",
    phone: "+5491135572970",
    bio: "Fonoaudióloga. Trastornos de comunicación y deglución.",
    languages: ["es"],
    teleconsulta: false,
  },
  {
    name: "Dr. Julián Tottereaus",
    specialty: "Neumonología",
    matricula: "MN-154122",
    phone: "+5491121721721",
    bio: "Neumonólogo. Enfermedades del sistema respiratorio.",
    languages: ["es"],
    teleconsulta: false,
  },
  {
    name: "Dr. José Asz",
    specialty: "Oftalmología",
    matricula: "MN-100366",
    phone: "+5491144201443",
    bio: "Oftalmólogo. Salud visual y enfermedades oculares.",
    languages: ["es"],
    teleconsulta: false,
  },
  {
    name: "Dra. Martha Gibilbank",
    specialty: "Oftalmología",
    matricula: "MN-61235",
    phone: "+5491153247149",
    bio: "Oftalmóloga.",
    languages: ["es"],
    teleconsulta: false,
  },
  {
    name: "Dra. María del Carmen Baied",
    specialty: "Reumatología",
    matricula: "MN-90687",
    phone: "+5491161618088",
    bio: "Reumatóloga. Enfermedades autoinmunes y articulares.",
    languages: ["es"],
    teleconsulta: false,
  },
  {
    name: "Dra. Irene Gutiérrez",
    specialty: "Diabetología",
    matricula: "MN-64241",
    phone: "+5491144148392",
    bio: "Diabetóloga. Control y tratamiento de la diabetes.",
    languages: ["es"],
    teleconsulta: false,
  },
  {
    name: "Téc. Esteban Heit",
    specialty: "Radiografía",
    matricula: null,
    phone: "+5491168576049",
    bio: "Técnico radiólogo.",
    languages: ["es"],
    teleconsulta: false,
  },
];

// ─── Doctor → Day/Time schedule (from website) ───────────────

const SCHEDULE = {
  "Dr. Francisco Lopez": [
    { day: 1, start: "10:00", end: "17:00" }, // Mon
    { day: 2, start: "10:00", end: "17:00" }, // Tue
    { day: 3, start: "10:00", end: "17:00" }, // Wed
    { day: 4, start: "10:00", end: "17:00" }, // Thu
    { day: 5, start: "10:00", end: "17:00" }, // Fri — 15-min slots
  ],
  "Dr. Vargas Freddy": [{ day: 1, start: "14:30", end: "16:30" }],
  "Dr. Gustavo Delgadillo": [
    { day: 2, start: "10:00", end: "12:00" },
    { day: 4, start: "14:00", end: "15:45" },
  ],
  "Dra. Yessica Taboada": [{ day: 2, start: "14:00", end: "17:00" }],
  "Dra. Norma Legal": [
    { day: 2, start: "16:00", end: "17:00" },
    { day: 4, start: "16:00", end: "17:00" },
  ],
  "Dra. Mariana Ríos": [{ day: 2, start: "09:30", end: "14:00" }], // monthly
  "Dr. Richard Rivero": [{ day: 2, start: "17:00", end: "18:00" }],
  "Lic. Cristina Acevedo": [{ day: 3, start: "10:00", end: "12:00" }],
  "Dr. Rogelio Vargas Lopez": [{ day: 3, start: "11:30", end: "12:30" }],
  "Dra. Alicia Urbieta": [{ day: 3, start: "14:00", end: "15:00" }], // biweekly
  "Dr. Juan Manuel Dalpiaz": [{ day: 4, start: "11:00", end: "12:00" }],
  "Dr. Adrián Lezcano": [{ day: 4, start: "13:00", end: "14:00" }],
  "Dra. Liliana Angelotti": [{ day: 4, start: "10:00", end: "12:00" }], // biweekly
  "Dra. Susana Jiménez": [{ day: 4, start: "16:00", end: "17:00" }], // biweekly
  "Dr. Carlos Diccea": [
    { day: 4, start: "10:00", end: "11:00" }, // biweekly
    { day: 5, start: "13:30", end: "14:30" },
  ],
  "Dr. Carlos Lagos": [{ day: 4, start: "16:00", end: "17:00" }],
  "Dra. Alicia Abdala": [{ day: 5, start: "12:00", end: "14:00" }],
  "Dra. Sikiu Espinoza": [{ day: 5, start: "12:00", end: "17:00" }], // biweekly
  "Lic. Oscar Molina": [{ day: 5, start: "13:00", end: "16:00" }],
  "Lic. Eugenia Safar": [{ day: 5, start: "14:00", end: "16:00" }], // monthly
  "Dr. Julián Tottereaus": [{ day: 5, start: "12:00", end: "13:00" }], // monthly
  "Dr. José Asz": [{ day: 5, start: "13:30", end: "14:30" }], // biweekly
};

// ─── Main ────────────────────────────────────────────────────

async function main() {
  console.log("🏥 Seeding Centro Médico Roca...\n");

  // ─── 1. Upsert clinic ───────────────────────────────────────
  const { data: existing } = await sb
    .from("clinics")
    .select("id")
    .eq("cuit", CLINIC.cuit)
    .single();

  let clinicId;
  if (existing) {
    clinicId = existing.id;
    await sb.from("clinics").update(CLINIC).eq("id", clinicId);
    console.log(`  ✏️  Updated clinic: ${CLINIC.name} (${clinicId})`);
  } else {
    const { data: newClinic, error } = await sb
      .from("clinics")
      .insert(CLINIC)
      .select("id")
      .single();
    if (error) {
      console.error("  ❌ Failed to create clinic:", error.message);
      process.exit(1);
    }
    clinicId = newClinic.id;
    console.log(`  ✅ Created clinic: ${CLINIC.name} (${clinicId})`);
  }

  // ─── 2. Upsert doctors ─────────────────────────────────────
  console.log(`\n  Inserting ${DOCTORS.length} doctors...`);
  const doctorMap = {}; // name → id

  for (const doc of DOCTORS) {
    const payload = {
      name: doc.name,
      specialty: doc.specialty,
      matricula: doc.matricula,
      phone: doc.phone,
      email: doc.email || null,
      bio: doc.bio,
      languages: doc.languages,
      teleconsulta: doc.teleconsulta,
      clinic_id: clinicId,
      location: "Caballito, CABA",
      address: CLINIC.address,
      available: true,
      active: true,
    };

    // Try to find by matrícula first, then by name
    let existingDoc = null;
    if (doc.matricula) {
      const { data } = await sb
        .from("doctors")
        .select("id")
        .eq("matricula", doc.matricula)
        .single();
      existingDoc = data;
    }
    if (!existingDoc) {
      const { data } = await sb
        .from("doctors")
        .select("id")
        .eq("name", doc.name)
        .eq("clinic_id", clinicId)
        .single();
      existingDoc = data;
    }

    if (existingDoc) {
      await sb.from("doctors").update(payload).eq("id", existingDoc.id);
      doctorMap[doc.name] = existingDoc.id;
      console.log(`    ✏️  ${doc.name} (updated)`);
    } else {
      const { data: newDoc, error } = await sb
        .from("doctors")
        .insert(payload)
        .select("id")
        .single();
      if (error) {
        console.error(`    ❌ ${doc.name}: ${error.message}`);
        continue;
      }
      doctorMap[doc.name] = newDoc.id;
      console.log(`    ✅ ${doc.name}`);
    }
  }

  console.log(`\n  ${Object.keys(doctorMap).length} doctors ready`);

  // ─── 3. Generate availability slots (next 60 days) ─────────
  console.log("\n  Generating availability (15-min slots, 60 days)...");
  const now = new Date();
  let slotCount = 0;

  for (const [docName, schedules] of Object.entries(SCHEDULE)) {
    const doctorId = doctorMap[docName];
    if (!doctorId) {
      console.warn(`    ⚠️  No doctor ID for ${docName}, skipping slots`);
      continue;
    }

    // Clear existing future availability
    await sb
      .from("doctor_availability")
      .delete()
      .eq("doctor_id", doctorId)
      .gte("date", now.toISOString().slice(0, 10));

    for (let dayOffset = 1; dayOffset <= 60; dayOffset++) {
      const d = new Date(now);
      d.setDate(d.getDate() + dayOffset);
      const dow = d.getDay(); // 0=Sun, 1=Mon...

      for (const sched of schedules) {
        if (dow !== sched.day) continue;

        // Generate 15-minute slots
        const [sh, sm] = sched.start.split(":").map(Number);
        const [eh, em] = sched.end.split(":").map(Number);
        const startMin = sh * 60 + sm;
        const endMin = eh * 60 + em;

        const rows = [];
        for (let m = startMin; m < endMin; m += 15) {
          const hh = String(Math.floor(m / 60)).padStart(2, "0");
          const mm = String(m % 60).padStart(2, "0");
          rows.push({
            doctor_id: doctorId,
            date: d.toISOString().slice(0, 10),
            time_slot: `${hh}:${mm}`,
            booked: false,
          });
        }

        if (rows.length > 0) {
          const { error } = await sb.from("doctor_availability").insert(rows);
          if (error) {
            console.warn(`    ⚠️  Slots for ${docName}: ${error.message}`);
          } else {
            slotCount += rows.length;
          }
        }
      }
    }
  }
  console.log(`  ✅ ${slotCount} availability slots created`);

  // ─── 4. Booking settings ───────────────────────────────────
  const { error: settErr } = await sb.from("clinic_booking_settings").upsert({
    clinic_id: clinicId,
    slot_duration_min: 15,
    max_advance_days: 60,
    min_advance_hours: 2,
    auto_confirm: true,
    notify_via: ["email", "whatsapp"],
    confirmation_message:
      "Su turno en Centro Médico Roca ha sido confirmado. " +
      "Lo esperamos en Ambrosetti 698, Caballito.",
    cancellation_message:
      "Su turno ha sido cancelado. " +
      "Puede reservar otro en condorsalud.com/reservar/centro-medico-roca",
    reminder_hours_before: 24,
    working_days: [1, 2, 3, 4, 5], // Mon–Fri only
    break_start: null,
    break_end: null,
  });
  if (settErr) {
    console.warn("  ⚠️  Booking settings:", settErr.message);
  } else {
    console.log("  ✅ Booking settings: 15 min, auto-confirm, Mon–Fri");
  }

  // ─── Done ──────────────────────────────────────────────────
  console.log("\n" + "═".repeat(60));
  console.log("🎉 Centro Médico Roca onboarded successfully!");
  console.log("═".repeat(60));
  console.log(`   Clinic:     ${CLINIC.name}`);
  console.log(`   CUIT:       ${CLINIC.cuit}`);
  console.log(`   Slug:       ${CLINIC.slug}`);
  console.log(`   Doctors:    ${Object.keys(doctorMap).length}`);
  console.log(`   Slots:      ${slotCount} (15-min, 60 days)`);
  console.log(`   Auto-conf:  ✅ Yes`);
  console.log(`   Booking:    /reservar/${CLINIC.slug}`);
  console.log(`   Dashboard:  /dashboard/turnos-online`);
  console.log(`   WhatsApp:   +54 11 2775-6496`);
  console.log("═".repeat(60));
}

main().catch((e) => {
  console.error("❌ Seed failed:", e);
  process.exit(1);
});

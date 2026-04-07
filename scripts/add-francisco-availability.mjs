#!/usr/bin/env node
// ─── Add Dr. Francisco Lopez availability slots ──────────────
// Schedule: Mon–Fri 10:00–17:00, 15-minute appointments
// Run: node scripts/add-francisco-availability.mjs

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  console.error("   Run: source .env.local && node scripts/add-francisco-availability.mjs");
  process.exit(1);
}

const sb = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const SCHEDULE = [
  { day: 1, start: "10:00", end: "17:00" }, // Mon
  { day: 2, start: "10:00", end: "17:00" }, // Tue
  { day: 3, start: "10:00", end: "17:00" }, // Wed
  { day: 4, start: "10:00", end: "17:00" }, // Thu
  { day: 5, start: "10:00", end: "17:00" }, // Fri
];

const SLOT_DURATION = 15; // minutes
const DAYS_AHEAD = 60;

async function main() {
  console.log("🩺 Adding Dr. Francisco Lopez availability...\n");

  // Find Dr. Francisco
  const { data: doc, error: docErr } = await sb
    .from("doctors")
    .select("id, name, clinic_id")
    .ilike("name", "%Francisco%Lopez%")
    .single();

  if (docErr || !doc) {
    console.error("❌ Could not find Dr. Francisco Lopez:", docErr?.message);
    process.exit(1);
  }

  console.log(`  Found: ${doc.name} (${doc.id})`);

  // Clear existing future availability
  const today = new Date().toISOString().slice(0, 10);
  const { count: deleted } = await sb
    .from("doctor_availability")
    .delete({ count: "exact" })
    .eq("doctor_id", doc.id)
    .gte("date", today);

  console.log(`  Cleared ${deleted ?? 0} existing future slots`);

  // Generate 15-min slots for next 60 days
  const now = new Date();
  let totalSlots = 0;
  const batchSize = 500;
  let batch = [];

  for (let dayOffset = 0; dayOffset <= DAYS_AHEAD; dayOffset++) {
    const d = new Date(now);
    d.setDate(d.getDate() + dayOffset);
    const dow = d.getDay(); // 0=Sun, 1=Mon...
    const dateStr = d.toISOString().slice(0, 10);

    for (const sched of SCHEDULE) {
      if (dow !== sched.day) continue;

      const [sh, sm] = sched.start.split(":").map(Number);
      const [eh, em] = sched.end.split(":").map(Number);
      const startMin = sh * 60 + sm;
      const endMin = eh * 60 + em;

      for (let m = startMin; m < endMin; m += SLOT_DURATION) {
        const hh = String(Math.floor(m / 60)).padStart(2, "0");
        const mm = String(m % 60).padStart(2, "0");
        batch.push({
          doctor_id: doc.id,
          date: dateStr,
          time_slot: `${hh}:${mm}`,
          booked: false,
        });
        totalSlots++;

        if (batch.length >= batchSize) {
          const { error } = await sb
            .from("doctor_availability")
            .upsert(batch, { onConflict: "doctor_id,date,time_slot" });
          if (error) console.error(`  ⚠️  Batch insert error: ${error.message}`);
          batch = [];
        }
      }
    }
  }

  // Flush remaining
  if (batch.length > 0) {
    const { error } = await sb
      .from("doctor_availability")
      .upsert(batch, { onConflict: "doctor_id,date,time_slot" });
    if (error) console.error(`  ⚠️  Final batch error: ${error.message}`);
  }

  console.log(`\n  ✅ Created ${totalSlots} slots (15-min, Mon–Fri 10:00–17:00, ${DAYS_AHEAD} days)`);
  console.log(`  📅 ${totalSlots / (DAYS_AHEAD * 5 / 7) | 0} slots/day × ~${Math.round(DAYS_AHEAD * 5 / 7)} weekdays`);
  console.log("\n  Dr. Francisco will now appear in the receptionist scheduling dropdown with hours.");
}

main().catch((err) => {
  console.error("❌ Fatal:", err);
  process.exit(1);
});

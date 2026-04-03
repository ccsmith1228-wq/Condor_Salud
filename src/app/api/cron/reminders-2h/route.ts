// ─── GET /api/cron/reminders-2h — 2-hour booking reminders ───
// Runs every 2 hours. Finds clinic_bookings happening within the
// next 2-4 hours and sends the "reminder-2h" WhatsApp template +
// a short email nudge.
//
// vercel.json → crons: [{ path: "/api/cron/reminders-2h", schedule: "0 */2 * * *" }]

import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function GET(req: NextRequest) {
  // ── Auth ────────────────────────────────────────────
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && req.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ skipped: true, reason: "Supabase not configured" });
  }

  try {
    const { createClient } = await import("@supabase/supabase-js");
    const sb = createClient(supabaseUrl, serviceKey);

    // Current time in Buenos Aires (UTC-3)
    const now = new Date();
    const artOffset = -3 * 60; // minutes
    const artNow = new Date(now.getTime() + (artOffset + now.getTimezoneOffset()) * 60_000);

    // We want bookings whose appointment is 2-4 hours from now
    const todayStr = artNow.toISOString().split("T")[0];
    const hh = artNow.getHours();
    const mm = artNow.getMinutes();

    // Window: [now+2h, now+4h)
    const from2h = `${String(hh + 2).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
    const to4h = `${String(hh + 4).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;

    // If the window extends past midnight, skip (edge case: cron at 22:00+)
    if (hh + 2 >= 24) {
      return NextResponse.json({ sent: 0, message: "Window past midnight — skipping" });
    }

    const { data: bookings, error } = await sb
      .from("clinic_bookings")
      .select(
        "id, clinic_id, doctor_id, patient_name, patient_email, patient_phone, patient_language, fecha, hora, hora_fin, specialty, tipo",
      )
      .eq("fecha", todayStr)
      .eq("status", "confirmed")
      .gte("hora", from2h)
      .lt("hora", to4h)
      .is("reminder_2h_sent_at", null);

    if (error) {
      logger.error({ err: error }, "Cron 2h: query failed");
      return NextResponse.json({ error: "Query failed" }, { status: 500 });
    }

    if (!bookings || bookings.length === 0) {
      return NextResponse.json({ sent: 0, message: "No bookings in 2-4h window" });
    }

    let sent = 0;

    const { sendBookingReminder } = await import("@/lib/services/clinic-notifications");

    for (const b of bookings) {
      try {
        const [{ data: clinic }, { data: doctor }] = await Promise.all([
          sb.from("clinics").select("name, address, phone").eq("id", b.clinic_id).single(),
          sb.from("doctors").select("name").eq("id", b.doctor_id).single(),
        ]);

        await sendBookingReminder({
          bookingId: b.id,
          clinicName: clinic?.name || "Clínica",
          clinicAddress: clinic?.address || "",
          clinicPhone: clinic?.phone || "",
          doctorName: doctor?.name || "Profesional",
          patientName: b.patient_name,
          patientEmail: b.patient_email,
          patientPhone: b.patient_phone,
          patientLanguage: b.patient_language || "es",
          fecha: b.fecha,
          hora: b.hora,
          specialty: b.specialty || "",
          tipo: b.tipo || "presencial",
          templateName: "reminder-2h",
        });

        await sb
          .from("clinic_bookings")
          .update({ reminder_2h_sent_at: new Date().toISOString() })
          .eq("id", b.id);

        sent++;
      } catch (err) {
        logger.warn({ err, bookingId: b.id }, "Cron 2h: reminder failed for booking");
      }
    }

    logger.info({ total: bookings.length, sent }, "Cron 2h reminders completed");

    return NextResponse.json({
      total: bookings.length,
      sent,
      window: `${todayStr} ${from2h}–${to4h}`,
    });
  } catch (err) {
    logger.error({ err }, "Cron /api/cron/reminders-2h failed");
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

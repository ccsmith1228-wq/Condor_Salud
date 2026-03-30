// ─── GET /api/cron/reminders — Vercel Cron: 24h booking reminders ──
// Runs daily at 10:00 UTC (07:00 ART).
// Queries appointments happening tomorrow, sends email + push.
//
// vercel.json → crons: [{ path: "/api/cron/reminders", schedule: "0 10 * * *" }]

import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export const maxDuration = 30; // seconds

/**
 * Vercel Cron sends a GET request.
 * We verify the CRON_SECRET header to prevent external abuse.
 */
export async function GET(req: NextRequest) {
  // ── Verify cron secret ──────────────────────────────
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

    // Tomorrow date in YYYY-MM-DD (Buenos Aires TZ)
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    // Fetch confirmed appointments for tomorrow
    const { data: appointments, error } = await sb
      .from("appointments")
      .select("id, patient_id, specialty, appointment_date, appointment_time, doctor_profile_id")
      .eq("appointment_date", tomorrowStr)
      .eq("status", "confirmed");

    if (error) {
      logger.error({ err: error }, "Cron: failed to query appointments");
      return NextResponse.json({ error: "Query failed" }, { status: 500 });
    }

    if (!appointments || appointments.length === 0) {
      return NextResponse.json({ sent: 0, message: "No appointments tomorrow" });
    }

    let emailsSent = 0;
    let pushesSent = 0;

    for (const apt of appointments) {
      const patientId = apt.patient_id as string;

      // Look up patient email
      const { data: user } = await sb.auth.admin.getUserById(patientId);
      const email = user?.user?.email;

      // Look up doctor name
      let doctorName = "tu profesional";
      if (apt.doctor_profile_id) {
        const { data: doc } = await sb
          .from("doctors")
          .select("name")
          .eq("id", apt.doctor_profile_id)
          .maybeSingle();
        if (doc) doctorName = doc.name;
      }

      // ── Email reminder ──────────────────────────────
      if (email) {
        try {
          const { sendBookingReminder } = await import("@/lib/services/email-sendgrid");
          await sendBookingReminder({
            patientEmail: email,
            patientName: email?.split("@")[0] ?? "Paciente",
            doctorName,
            date: apt.appointment_date as string,
            time: apt.appointment_time as string,
          });
          emailsSent++;
        } catch (emailErr) {
          logger.warn({ err: emailErr, aptId: apt.id }, "Cron: email reminder failed");
        }
      }

      // ── Push reminder ───────────────────────────────
      try {
        const { pushBookingReminder, isPushConfigured } =
          await import("@/lib/services/push-notifications");
        if (isPushConfigured()) {
          const { data: subs } = await sb
            .from("push_subscriptions")
            .select("endpoint, keys")
            .eq("user_id", patientId);

          if (subs && subs.length > 0) {
            const pushSubs = subs.map(
              (s: { endpoint: string; keys: { p256dh: string; auth: string } }) => ({
                endpoint: s.endpoint,
                keys: s.keys,
              }),
            );
            await pushBookingReminder(pushSubs, {
              doctor: doctorName,
              time: apt.appointment_time as string,
            });
            pushesSent++;
          }
        }
      } catch (pushErr) {
        logger.warn({ err: pushErr, aptId: apt.id }, "Cron: push reminder failed");
      }
    }

    logger.info({ total: appointments.length, emailsSent, pushesSent }, "Cron reminders completed");

    // ── Clinic Bookings (public booking system) ────────────
    // Also send reminders for clinic_bookings from the public booking flow
    let clinicRemindersSent = 0;
    try {
      const { data: bookings } = await sb
        .from("clinic_bookings")
        .select(
          "id, clinic_id, doctor_id, patient_name, patient_email, patient_phone, patient_language, fecha, hora, hora_fin, specialty, tipo",
        )
        .eq("fecha", tomorrowStr)
        .eq("status", "confirmed")
        .is("reminder_sent_at", null);

      if (bookings && bookings.length > 0) {
        const { sendBookingReminder: sendClinicReminder } =
          await import("@/lib/services/clinic-notifications");

        for (const booking of bookings) {
          try {
            const [{ data: clinic }, { data: doctor }] = await Promise.all([
              sb
                .from("clinics")
                .select("name, address, phone")
                .eq("id", booking.clinic_id)
                .single(),
              sb.from("doctors").select("name").eq("id", booking.doctor_id).single(),
            ]);

            await sendClinicReminder({
              bookingId: booking.id,
              clinicName: clinic?.name || "Clínica",
              clinicAddress: clinic?.address || "",
              clinicPhone: clinic?.phone || "",
              doctorName: doctor?.name || "Profesional",
              patientName: booking.patient_name,
              patientEmail: booking.patient_email,
              patientPhone: booking.patient_phone,
              patientLanguage: booking.patient_language || "es",
              fecha: booking.fecha,
              hora: booking.hora,
              specialty: booking.specialty || "",
              tipo: booking.tipo || "presencial",
            });

            await sb
              .from("clinic_bookings")
              .update({ reminder_sent_at: new Date().toISOString() })
              .eq("id", booking.id);

            clinicRemindersSent++;
          } catch (bErr) {
            logger.warn(
              { err: bErr, bookingId: booking.id },
              "Cron: clinic booking reminder failed",
            );
          }
        }
      }
    } catch (cbErr) {
      logger.warn(
        { err: cbErr },
        "Cron: clinic_bookings reminder pass failed (table may not exist yet)",
      );
    }

    return NextResponse.json({
      total: appointments.length,
      emailsSent,
      pushesSent,
      clinicRemindersSent,
      date: tomorrowStr,
    });
  } catch (err) {
    logger.error({ err }, "Cron /api/cron/reminders failed");
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

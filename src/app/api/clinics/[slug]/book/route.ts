// ─── POST /api/clinics/[slug]/book ───────────────────────────
// Public endpoint: create a booking for a clinic.
// No auth required — external patients can book without an account.
// Triggers notification to clinic via email + WhatsApp.

import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/env";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

interface BookingBody {
  doctorId: string;
  patientName: string;
  patientEmail?: string;
  patientPhone?: string;
  patientLanguage?: string;
  fecha: string; // YYYY-MM-DD
  hora: string; // HH:MM
  specialty?: string;
  tipo?: string; // presencial | teleconsulta
  notas?: string;
  bookedVia?: string; // web | whatsapp | cora
}

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const body = (await req.json()) as BookingBody;
    const { slug } = params;

    // Validate required fields
    if (!body.patientName || !body.fecha || !body.hora || !body.doctorId) {
      return NextResponse.json(
        { error: "patientName, doctorId, fecha, and hora are required" },
        { status: 400 },
      );
    }

    if (!body.patientEmail && !body.patientPhone) {
      return NextResponse.json(
        { error: "At least patientEmail or patientPhone is required" },
        { status: 400 },
      );
    }

    // ── Supabase path ──────────────────────────────
    if (isSupabaseConfigured()) {
      const { createClient } = await import("@supabase/supabase-js");
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
      const sb = createClient(url, key);
      const sbAny = sb as unknown as { from: (t: string) => ReturnType<typeof sb.from> };

      // 1. Find clinic by slug
      const { data: clinic, error: clinicErr } = (await sbAny
        .from("clinics")
        .select("id, name, email, phone, booking_enabled")
        .eq("slug", slug)
        .eq("active", true)
        .single()) as { data: Record<string, unknown> | null; error: unknown };

      if (clinicErr || !clinic) {
        return NextResponse.json({ error: "Clinic not found" }, { status: 404 });
      }

      if (!clinic.booking_enabled) {
        return NextResponse.json({ error: "Booking is disabled for this clinic" }, { status: 403 });
      }

      // 2. Verify doctor belongs to clinic
      const { data: doctor } = (await sbAny
        .from("doctors")
        .select("id, name, specialty")
        .eq("id", body.doctorId)
        .eq("clinic_id", clinic.id)
        .eq("active", true)
        .single()) as { data: Record<string, unknown> | null };

      if (!doctor) {
        return NextResponse.json({ error: "Doctor not found at this clinic" }, { status: 404 });
      }

      // 3. Check for conflicts (same doctor, same date+time, not cancelled)
      const { data: conflict } = (await sbAny
        .from("clinic_bookings")
        .select("id")
        .eq("doctor_id", body.doctorId)
        .eq("fecha", body.fecha)
        .eq("hora", body.hora)
        .not("status", "in", '("cancelled")')
        .limit(1)) as { data: Record<string, unknown>[] | null };

      if (conflict && conflict.length > 0) {
        return NextResponse.json({ error: "This time slot is already booked" }, { status: 409 });
      }

      // 4. Check booking settings
      const { data: settings } = (await sbAny
        .from("clinic_booking_settings")
        .select("auto_confirm, slot_duration_min")
        .eq("clinic_id", clinic.id)
        .single()) as { data: Record<string, unknown> | null };

      const autoConfirm = settings?.auto_confirm ?? false;
      const slotDuration = (settings?.slot_duration_min as number) ?? 30;

      // Calculate end time
      const parts = body.hora.split(":").map(Number);
      const hh = parts[0] ?? 0;
      const mm = parts[1] ?? 0;
      const endDate = new Date(2000, 0, 1, hh, mm + slotDuration);
      const horaFin = `${String(endDate.getHours()).padStart(2, "0")}:${String(endDate.getMinutes()).padStart(2, "0")}`;

      // 5. Create booking
      const { data: booking, error: insertErr } = (await sbAny
        .from("clinic_bookings")
        .insert({
          clinic_id: clinic.id,
          doctor_id: body.doctorId,
          patient_name: body.patientName,
          patient_email: body.patientEmail || null,
          patient_phone: body.patientPhone || null,
          patient_language: body.patientLanguage || "es",
          fecha: body.fecha,
          hora: body.hora,
          hora_fin: horaFin,
          specialty: body.specialty || (doctor.specialty as string) || null,
          tipo: body.tipo || "presencial",
          notas: body.notas || null,
          status: autoConfirm ? "confirmed" : "pending",
          booked_via: body.bookedVia || "web",
          ...(autoConfirm ? { confirmed_at: new Date().toISOString() } : {}),
        })
        .select("id")
        .single()) as { data: Record<string, unknown> | null; error: unknown };

      if (insertErr || !booking) {
        logger.error({ err: insertErr }, "Failed to create clinic booking");
        return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
      }

      // 6. Fire-and-forget: notify clinic
      try {
        const { notifyClinicNewBooking } = await import("@/lib/services/clinic-notifications");
        await notifyClinicNewBooking({
          bookingId: booking.id as string,
          clinicId: clinic.id as string,
          clinicName: clinic.name as string,
          clinicEmail: clinic.email as string,
          clinicPhone: clinic.phone as string | null,
          doctorName: doctor.name as string,
          patientName: body.patientName,
          patientEmail: body.patientEmail || null,
          patientPhone: body.patientPhone || null,
          patientLanguage: body.patientLanguage || "es",
          fecha: body.fecha,
          hora: body.hora,
          specialty: (doctor.specialty as string) || null,
          tipo: body.tipo || "presencial",
        });
      } catch (notifyErr) {
        logger.warn({ err: notifyErr }, "Booking created but notification failed");
      }

      // 7. If auto-confirm, also notify patient
      if (autoConfirm) {
        try {
          const { notifyPatientConfirmation } = await import("@/lib/services/clinic-notifications");
          await notifyPatientConfirmation({
            bookingId: booking.id as string,
            clinicId: clinic.id as string,
            clinicName: clinic.name as string,
            clinicEmail: clinic.email as string,
            clinicPhone: clinic.phone as string | null,
            doctorName: doctor.name as string,
            patientName: body.patientName,
            patientEmail: body.patientEmail || null,
            patientPhone: body.patientPhone || null,
            patientLanguage: body.patientLanguage || "es",
            fecha: body.fecha,
            hora: body.hora,
            specialty: (doctor.specialty as string) || null,
            tipo: body.tipo || "presencial",
          });
        } catch {
          // Non-critical
        }
      }

      return NextResponse.json(
        {
          id: booking.id,
          status: autoConfirm ? "confirmed" : "pending",
          message: autoConfirm
            ? "Booking confirmed!"
            : "Booking received — awaiting clinic confirmation.",
        },
        { status: 201 },
      );
    }

    // ── Demo fallback ────────────────────────────────
    return NextResponse.json(
      {
        id: `demo-${Date.now()}`,
        status: "pending",
        message: "Demo booking created — awaiting clinic confirmation.",
      },
      { status: 201 },
    );
  } catch (err) {
    logger.error({ err }, "Booking endpoint error");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

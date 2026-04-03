// ─── Patient Self-Service Booking API ────────────────────────
// Public endpoint: patients look up / cancel / reschedule their
// own bookings, verified by email or phone (no login required).
//
// GET  ?email=...  → look up booking
// PATCH { action: "cancel"|"reschedule", email, ... } → modify

import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/env";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

interface RouteCtx {
  params: Promise<{ slug: string; bookingId: string }>;
}

// ─── GET: Lookup booking ─────────────────────────────────────

export async function GET(req: NextRequest, ctx: RouteCtx) {
  const { slug, bookingId } = await ctx.params;
  const emailParam = req.nextUrl.searchParams.get("email");
  const phoneParam = req.nextUrl.searchParams.get("phone");

  if (!emailParam && !phoneParam) {
    return NextResponse.json(
      { error: "Email or phone required for verification" },
      { status: 400 },
    );
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(demoBooking(bookingId));
  }

  try {
    const { createClient } = await import("@supabase/supabase-js");
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // Find clinic by slug
    const { data: clinic } = await sb
      .from("clinics")
      .select("id, name, address, phone, slug")
      .eq("slug", slug)
      .eq("active", true)
      .single();

    if (!clinic) {
      return NextResponse.json({ error: "Clinic not found" }, { status: 404 });
    }

    // Find booking + verify ownership
    let query = sb
      .from("clinic_bookings")
      .select(
        "id, clinic_id, doctor_id, patient_name, patient_email, patient_phone, patient_language, fecha, hora, hora_fin, specialty, tipo, notas, status, cancel_reason, created_at",
      )
      .eq("id", bookingId)
      .eq("clinic_id", clinic.id);

    if (emailParam) query = query.eq("patient_email", emailParam);
    if (phoneParam) query = query.eq("patient_phone", phoneParam);

    const { data: booking, error } = await query.single();

    if (error || !booking) {
      return NextResponse.json(
        { error: "Booking not found or verification failed" },
        { status: 404 },
      );
    }

    const { data: doctor } = await sb
      .from("doctors")
      .select("name, specialty")
      .eq("id", booking.doctor_id)
      .single();

    return NextResponse.json({
      ...booking,
      doctorName: doctor?.name || "Profesional",
      doctorSpecialty: doctor?.specialty || null,
      clinicName: clinic.name,
      clinicAddress: clinic.address,
      clinicPhone: clinic.phone,
      clinicSlug: clinic.slug,
    });
  } catch (err) {
    logger.error({ err }, "Patient booking lookup failed");
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// ─── PATCH: Cancel or Reschedule ─────────────────────────────

export async function PATCH(req: NextRequest, ctx: RouteCtx) {
  const { slug, bookingId } = await ctx.params;

  let body: {
    action: "cancel" | "reschedule";
    email?: string;
    phone?: string;
    reason?: string;
    newFecha?: string;
    newHora?: string;
    newDoctorId?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.action || !["cancel", "reschedule"].includes(body.action)) {
    return NextResponse.json({ error: "action must be 'cancel' or 'reschedule'" }, { status: 400 });
  }

  if (!body.email && !body.phone) {
    return NextResponse.json({ error: "Email or phone required" }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      id: bookingId,
      status: body.action === "cancel" ? "cancelled" : "confirmed",
      message: `Demo: booking ${body.action === "cancel" ? "cancelled" : "rescheduled"}.`,
    });
  }

  try {
    const { createClient } = await import("@supabase/supabase-js");
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const { data: clinic } = await sb
      .from("clinics")
      .select("id, name, address, phone, email")
      .eq("slug", slug)
      .eq("active", true)
      .single();

    if (!clinic) {
      return NextResponse.json({ error: "Clinic not found" }, { status: 404 });
    }

    let query = sb
      .from("clinic_bookings")
      .select(
        "id, doctor_id, patient_name, patient_email, patient_phone, patient_language, fecha, hora, specialty, tipo, status",
      )
      .eq("id", bookingId)
      .eq("clinic_id", clinic.id);

    if (body.email) query = query.eq("patient_email", body.email);
    if (body.phone) query = query.eq("patient_phone", body.phone);

    const { data: booking, error } = await query.single();

    if (error || !booking) {
      return NextResponse.json(
        { error: "Booking not found or verification failed" },
        { status: 404 },
      );
    }

    if (booking.status === "cancelled") {
      return NextResponse.json({ error: "Booking is already cancelled" }, { status: 400 });
    }

    const { data: doctor } = await sb
      .from("doctors")
      .select("name")
      .eq("id", booking.doctor_id)
      .single();

    // ── Cancel ───────────────────────────────────────
    if (body.action === "cancel") {
      await sb
        .from("clinic_bookings")
        .update({
          status: "cancelled",
          cancelled_at: new Date().toISOString(),
          cancel_reason: body.reason || "Cancelled by patient",
        })
        .eq("id", bookingId);

      try {
        const { notifyPatientCancellation } = await import("@/lib/services/clinic-notifications");
        await notifyPatientCancellation({
          bookingId,
          clinicId: clinic.id,
          clinicName: clinic.name,
          clinicEmail: clinic.email,
          clinicPhone: clinic.phone,
          doctorName: doctor?.name || "Profesional",
          patientName: booking.patient_name,
          patientEmail: booking.patient_email,
          patientPhone: booking.patient_phone,
          patientLanguage: booking.patient_language || "es",
          fecha: booking.fecha,
          hora: booking.hora,
          specialty: booking.specialty,
          tipo: booking.tipo,
          reason: body.reason || "Cancelled by patient",
        });
      } catch (notifyErr) {
        logger.warn({ err: notifyErr }, "Cancel notification failed (non-critical)");
      }

      return NextResponse.json({
        id: bookingId,
        status: "cancelled",
        message: "Booking cancelled successfully.",
      });
    }

    // ── Reschedule ───────────────────────────────────
    if (!body.newFecha || !body.newHora) {
      return NextResponse.json(
        { error: "newFecha and newHora required for reschedule" },
        { status: 400 },
      );
    }

    const targetDoctorId = body.newDoctorId || booking.doctor_id;
    const { data: conflict } = await sb
      .from("clinic_bookings")
      .select("id")
      .eq("doctor_id", targetDoctorId)
      .eq("fecha", body.newFecha)
      .eq("hora", body.newHora)
      .not("status", "in", '("cancelled")')
      .neq("id", bookingId)
      .limit(1);

    if (conflict && conflict.length > 0) {
      return NextResponse.json({ error: "New time slot is already taken" }, { status: 409 });
    }

    const { data: settings } = await sb
      .from("clinic_booking_settings")
      .select("slot_duration_min")
      .eq("clinic_id", clinic.id)
      .single();

    const slotDuration = (settings?.slot_duration_min as number) ?? 30;
    const [hh, mm] = body.newHora.split(":").map(Number);
    const end = new Date(2000, 0, 1, hh ?? 0, (mm ?? 0) + slotDuration);
    const horaFin = `${String(end.getHours()).padStart(2, "0")}:${String(end.getMinutes()).padStart(2, "0")}`;

    // Cancel old
    await sb
      .from("clinic_bookings")
      .update({
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
        cancel_reason: `Rescheduled to ${body.newFecha} ${body.newHora}`,
      })
      .eq("id", bookingId);

    // Create new
    const { data: newBooking, error: insertErr } = await sb
      .from("clinic_bookings")
      .insert({
        clinic_id: clinic.id,
        doctor_id: targetDoctorId,
        patient_name: booking.patient_name,
        patient_email: booking.patient_email,
        patient_phone: booking.patient_phone,
        patient_language: booking.patient_language || "es",
        fecha: body.newFecha,
        hora: body.newHora,
        hora_fin: horaFin,
        specialty: booking.specialty,
        tipo: booking.tipo,
        status: "confirmed",
        confirmed_at: new Date().toISOString(),
        booked_via: "reschedule",
      })
      .select("id")
      .single();

    if (insertErr || !newBooking) {
      logger.error({ err: insertErr }, "Reschedule insert failed");
      return NextResponse.json({ error: "Failed to create new booking" }, { status: 500 });
    }

    try {
      const { notifyPatientConfirmation } = await import("@/lib/services/clinic-notifications");
      await notifyPatientConfirmation({
        bookingId: newBooking.id,
        clinicId: clinic.id,
        clinicName: clinic.name,
        clinicEmail: clinic.email,
        clinicPhone: clinic.phone,
        doctorName: doctor?.name || "Profesional",
        patientName: booking.patient_name,
        patientEmail: booking.patient_email,
        patientPhone: booking.patient_phone,
        patientLanguage: booking.patient_language || "es",
        fecha: body.newFecha,
        hora: body.newHora,
        specialty: booking.specialty,
        tipo: booking.tipo,
      });
    } catch {
      // non-critical
    }

    return NextResponse.json({
      id: newBooking.id,
      oldBookingId: bookingId,
      status: "confirmed",
      fecha: body.newFecha,
      hora: body.newHora,
      message: "Booking rescheduled successfully.",
    });
  } catch (err) {
    logger.error({ err }, "Patient booking PATCH failed");
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// ─── Demo fallback ───────────────────────────────────────────

function demoBooking(id: string) {
  return {
    id,
    patient_name: "Demo Paciente",
    patient_email: "demo@condorsalud.com",
    fecha: new Date(Date.now() + 86_400_000).toISOString().split("T")[0],
    hora: "10:00",
    hora_fin: "10:30",
    specialty: "Clínica Médica",
    tipo: "presencial",
    status: "confirmed",
    doctorName: "Dr. Demo",
    clinicName: "Clínica Demo",
    clinicAddress: "Av. Demo 123",
    clinicPhone: "+54 9 298 555-0001",
    clinicSlug: "demo",
  };
}

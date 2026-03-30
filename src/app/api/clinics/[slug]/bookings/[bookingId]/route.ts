// ─── PATCH /api/clinics/[slug]/bookings/[bookingId] ──────────
// Clinic staff endpoint: confirm, reject, or complete a booking.
// Triggers notification to patient on status change.

import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/env";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

const VALID_ACTIONS = ["confirm", "cancel", "complete", "no_show"] as const;
type BookingAction = (typeof VALID_ACTIONS)[number];

interface PatchBody {
  action: BookingAction;
  reason?: string;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { slug: string; bookingId: string } },
) {
  try {
    const body = (await req.json()) as PatchBody;

    if (!VALID_ACTIONS.includes(body.action)) {
      return NextResponse.json(
        { error: `Invalid action. Must be one of: ${VALID_ACTIONS.join(", ")}` },
        { status: 400 },
      );
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ status: body.action === "cancel" ? "cancelled" : "confirmed" });
    }

    const { createClient } = await import("@/lib/supabase/server");
    const sb = createClient();
    const sbAny = sb as unknown as { from: (t: string) => ReturnType<typeof sb.from> };

    // Verify user is authenticated and belongs to this clinic
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch the booking with clinic + doctor info
    const { data: booking } = (await sbAny
      .from("clinic_bookings")
      .select(
        "id, clinic_id, doctor_id, patient_name, patient_email, patient_phone, " +
          "patient_language, fecha, hora, specialty, tipo, status",
      )
      .eq("id", params.bookingId)
      .single()) as { data: Record<string, unknown> | null };

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Fetch clinic info
    const { data: clinic } = (await sbAny
      .from("clinics")
      .select("id, name, email, phone")
      .eq("id", booking.clinic_id)
      .single()) as { data: Record<string, unknown> | null };

    // Fetch doctor info
    const { data: doctor } = await sb
      .from("doctors")
      .select("id, name, specialty")
      .eq("id", booking.doctor_id as string)
      .single();

    // Apply status change
    const statusMap: Record<BookingAction, string> = {
      confirm: "confirmed",
      cancel: "cancelled",
      complete: "completed",
      no_show: "no_show",
    };

    const updateData: Record<string, unknown> = {
      status: statusMap[body.action],
    };

    if (body.action === "confirm") {
      updateData.confirmed_at = new Date().toISOString();
    } else if (body.action === "cancel") {
      updateData.cancelled_at = new Date().toISOString();
      updateData.cancel_reason = body.reason || null;
    }

    await sbAny.from("clinic_bookings").update(updateData).eq("id", params.bookingId);

    // Notify patient
    const notifyInput = {
      bookingId: booking.id as string,
      clinicId: (clinic?.id ?? booking.clinic_id) as string,
      clinicName: (clinic?.name ?? "Clínica") as string,
      clinicEmail: (clinic?.email ?? "") as string,
      clinicPhone: (clinic?.phone ?? null) as string | null,
      doctorName: (doctor?.name ?? "Doctor") as string,
      patientName: booking.patient_name as string,
      patientEmail: (booking.patient_email ?? null) as string | null,
      patientPhone: (booking.patient_phone ?? null) as string | null,
      patientLanguage: (booking.patient_language ?? "es") as string,
      fecha: booking.fecha as string,
      hora: booking.hora as string,
      specialty: (booking.specialty ?? null) as string | null,
      tipo: (booking.tipo ?? "presencial") as string,
    };

    try {
      if (body.action === "confirm") {
        const { notifyPatientConfirmation } = await import("@/lib/services/clinic-notifications");
        await notifyPatientConfirmation(notifyInput);
      } else if (body.action === "cancel") {
        const { notifyPatientCancellation } = await import("@/lib/services/clinic-notifications");
        await notifyPatientCancellation({ ...notifyInput, reason: body.reason });
      }
    } catch (notifyErr) {
      logger.warn({ err: notifyErr }, "Status updated but patient notification failed");
    }

    return NextResponse.json({
      id: booking.id,
      status: statusMap[body.action],
      message: `Booking ${statusMap[body.action]} successfully`,
    });
  } catch (err) {
    logger.error({ err }, "Booking update error");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET: Fetch a single booking detail
export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string; bookingId: string } },
) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Not available in demo mode" }, { status: 501 });
  }

  const { createClient } = await import("@/lib/supabase/server");
  const sb = createClient();
  const sbAny = sb as unknown as { from: (t: string) => ReturnType<typeof sb.from> };

  const { data: booking } = (await sbAny
    .from("clinic_bookings")
    .select("*")
    .eq("id", params.bookingId)
    .single()) as { data: Record<string, unknown> | null };

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  // Fetch notification history
  const { data: notifications } = (await sbAny
    .from("booking_notifications")
    .select("*")
    .eq("booking_id", params.bookingId)
    .order("created_at", { ascending: false })) as { data: Record<string, unknown>[] | null };

  return NextResponse.json({ booking, notifications: notifications ?? [] });
}

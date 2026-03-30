// ─── GET /api/clinics/[slug]/bookings ────────────────────────
// Clinic staff endpoint: list all bookings with optional filters.
// Requires authentication.

import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/env";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status"); // pending, confirmed, cancelled, etc.
  const date = searchParams.get("date"); // YYYY-MM-DD
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);
  const offset = (page - 1) * limit;

  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      bookings: [],
      total: 0,
      page,
      limit,
    });
  }

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const sb = createClient();
    const sbAny = sb as unknown as { from: (t: string) => ReturnType<typeof sb.from> };

    // Verify auth
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find clinic by slug
    const { data: clinic } = (await sbAny
      .from("clinics")
      .select("id")
      .eq("slug", params.slug)
      .single()) as { data: { id: string } | null };

    if (!clinic) {
      return NextResponse.json({ error: "Clinic not found" }, { status: 404 });
    }

    // Build query
    let query = sbAny
      .from("clinic_bookings")
      .select(
        "id, doctor_id, patient_name, patient_email, patient_phone, patient_language, " +
          "fecha, hora, hora_fin, specialty, tipo, notas, status, booked_via, " +
          "clinic_notified_at, clinic_notified_via, patient_notified_at, " +
          "confirmed_at, cancelled_at, cancel_reason, created_at",
        { count: "exact" },
      )
      .eq("clinic_id", clinic.id)
      .order("fecha", { ascending: false })
      .order("hora", { ascending: true })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq("status", status);
    }
    if (date) {
      query = query.eq("fecha", date);
    }

    const {
      data: bookings,
      count,
      error,
    } = (await query) as {
      data: Record<string, unknown>[] | null;
      count: number | null;
      error: unknown;
    };

    if (error) {
      logger.error({ err: error }, "Failed to fetch clinic bookings");
      return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
    }

    // Enrich with doctor names
    const doctorIds = [...new Set((bookings ?? []).map((b) => b.doctor_id).filter(Boolean))];
    let doctorMap: Record<string, string> = {};
    if (doctorIds.length > 0) {
      const { data: docs } = await sb
        .from("doctors")
        .select("id, name")
        .in("id", doctorIds as string[]);
      doctorMap = Object.fromEntries((docs ?? []).map((d) => [d.id, d.name]));
    }

    return NextResponse.json({
      bookings: (bookings ?? []).map((b) => ({
        ...b,
        doctorName: doctorMap[b.doctor_id as string] ?? "Sin asignar",
      })),
      total: count ?? 0,
      page,
      limit,
    });
  } catch (err) {
    logger.error({ err }, "Clinic bookings list error");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── GET /api/clinics/[slug]/public ──────────────────────────
// Public endpoint: returns clinic profile + doctors for the booking page.
// No auth required. Only returns clinics with public_visible=true.

import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/env";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const { slug } = params;

  if (!slug) {
    return NextResponse.json({ error: "Slug is required" }, { status: 400 });
  }

  // ── Supabase path ──────────────────────────────────
  if (isSupabaseConfigured()) {
    try {
      const { createClient } = await import("@/lib/supabase/server");
      const sb = createClient();
      // Cast for new migration tables/columns not yet in generated types
      const sbAny = sb as unknown as { from: (t: string) => ReturnType<typeof sb.from> };

      // Fetch clinic (new columns from migration 017)
      const { data: clinic, error } = (await sbAny
        .from("clinics")
        .select(
          "id, name, slug, address, phone, email, logo_url, especialidad, description, " +
            "languages, operating_hours, lat, lng, accepts_insurance, public_visible, booking_enabled",
        )
        .eq("slug", slug)
        .eq("active", true)
        .single()) as { data: Record<string, unknown> | null; error: unknown };

      if (error || !clinic) {
        return NextResponse.json({ error: "Clinic not found" }, { status: 404 });
      }

      if (!clinic.public_visible) {
        return NextResponse.json({ error: "Clinic profile is not public" }, { status: 403 });
      }

      // Fetch clinic's doctors (clinic_id added by migration 017)
      const { data: doctors } = (await sbAny
        .from("doctors")
        .select(
          "id, name, specialty, rating, review_count, available, teleconsulta, " +
            "experience, languages, bio, photo_url, matricula",
        )
        .eq("clinic_id", clinic.id as string)
        .eq("active", true)
        .order("name", { ascending: true })) as { data: Record<string, unknown>[] | null };

      // Fetch per-doctor schedule summary from doctor_availability
      // (distinct date → day-of-week + min/max time_slot per doctor)
      const doctorIds = (doctors ?? []).map((d) => d.id as string);
      let scheduleMap: Record<string, { day: number; start: string; end: string }[]> = {};

      if (doctorIds.length > 0) {
        // Get next 14 days of availability to derive weekly schedule
        const today = new Date().toISOString().slice(0, 10);
        const twoWeeks = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);

        const { data: avail } = (await sbAny
          .from("doctor_availability")
          .select("doctor_id, date, time_slot")
          .in("doctor_id", doctorIds)
          .gte("date", today)
          .lte("date", twoWeeks)
          .eq("booked", false)
          .order("time_slot", { ascending: true })) as {
          data: { doctor_id: string; date: string; time_slot: string }[] | null;
        };

        if (avail && avail.length > 0) {
          // Group by doctor_id → day-of-week → min/max time
          const grouped: Record<string, Record<number, { min: string; max: string }>> = {};
          for (const row of avail) {
            const d = new Date(row.date + "T12:00:00");
            const dow = d.getDay(); // 0=Sun..6=Sat
            const t = String(row.time_slot).slice(0, 5);
            if (!grouped[row.doctor_id]) grouped[row.doctor_id] = {};
            const docGroup = grouped[row.doctor_id]!;
            if (!docGroup[dow]) {
              docGroup[dow] = { min: t, max: t };
            } else {
              if (t < docGroup[dow]!.min) docGroup[dow]!.min = t;
              if (t > docGroup[dow]!.max) docGroup[dow]!.max = t;
            }
          }
          for (const [docId, days] of Object.entries(grouped)) {
            scheduleMap[docId] = Object.entries(days).map(([dow, range]) => ({
              day: Number(dow),
              start: range.min,
              end: range.max,
            }));
          }
        }
      }

      // Fetch booking settings (new table from migration 017)
      const { data: settings } = (await sbAny
        .from("clinic_booking_settings")
        .select("*")
        .eq("clinic_id", clinic.id)
        .single()) as { data: Record<string, unknown> | null };

      // Collect unique specialties
      const specialtySet = new Set<string>();
      for (const d of doctors ?? []) {
        if (d.specialty) specialtySet.add(d.specialty as string);
      }

      return NextResponse.json({
        clinic: {
          id: clinic.id,
          name: clinic.name,
          slug: clinic.slug,
          address: clinic.address,
          phone: clinic.phone,
          email: clinic.email,
          logoUrl: clinic.logo_url,
          specialties: clinic.especialidad,
          specialtyList: Array.from(specialtySet).sort(),
          description: clinic.description,
          languages: clinic.languages,
          operatingHours: clinic.operating_hours,
          lat: clinic.lat,
          lng: clinic.lng,
          acceptsInsurance: clinic.accepts_insurance,
          bookingEnabled: clinic.booking_enabled,
        },
        doctors: (doctors ?? []).map((d) => ({
          id: d.id,
          name: d.name,
          specialty: d.specialty,
          rating: d.rating,
          reviewCount: d.review_count,
          available: d.available,
          teleconsulta: d.teleconsulta,
          experience: d.experience,
          languages: d.languages,
          bio: d.bio,
          photoUrl: d.photo_url,
          matricula: d.matricula,
          schedule: scheduleMap[d.id as string] ?? [],
        })),
        settings: settings
          ? {
              slotDuration: settings.slot_duration_min,
              maxAdvanceDays: settings.max_advance_days,
              minAdvanceHours: settings.min_advance_hours,
              autoConfirm: settings.auto_confirm,
              workingDays: settings.working_days,
              breakStart: settings.break_start,
              breakEnd: settings.break_end,
            }
          : null,
      });
    } catch (err) {
      logger.error({ err }, "Failed to fetch public clinic profile");
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }

  // ── Demo fallback ──────────────────────────────────
  return NextResponse.json({
    clinic: {
      id: "demo-clinic-01",
      name: "Clínica Salud Recoleta",
      slug: "clinica-salud-recoleta",
      address: "Av. Callao 1234, Recoleta, Buenos Aires",
      phone: "+5411-4567-8900",
      email: "turnos@clinicarecoleta.com.ar",
      logoUrl: null,
      specialties: ["Clínica General", "Dermatología", "Pediatría", "Cardiología"],
      specialtyList: ["Cardiología", "Clínica General", "Dermatología", "Pediatría"],
      description:
        "Clínica de atención integral en el corazón de Recoleta. Atendemos con obras sociales y prepagas.",
      languages: ["es", "en"],
      operatingHours: {
        lun: { open: "08:00", close: "20:00" },
        mar: { open: "08:00", close: "20:00" },
        mie: { open: "08:00", close: "20:00" },
        jue: { open: "08:00", close: "20:00" },
        vie: { open: "08:00", close: "18:00" },
        sab: { open: "09:00", close: "13:00" },
      },
      lat: -34.5957,
      lng: -58.3932,
      acceptsInsurance: ["OSDE", "Swiss Medical", "Galeno", "Medifé"],
      bookingEnabled: true,
    },
    doctors: [
      {
        id: "doc-01",
        name: "Dr. Martín Ruiz",
        specialty: "Clínica General",
        rating: 4.9,
        reviewCount: 127,
        available: true,
        teleconsulta: true,
        experience: "15 años",
        languages: ["es", "en"],
        bio: "Médico clínico con amplia experiencia en atención primaria.",
        photoUrl: null,
        matricula: "MN-45892",
        schedule: [
          { day: 1, start: "08:00", end: "12:00" },
          { day: 3, start: "14:00", end: "18:00" },
        ],
      },
      {
        id: "doc-02",
        name: "Dra. Carolina Vega",
        specialty: "Dermatología",
        rating: 4.8,
        reviewCount: 89,
        available: true,
        teleconsulta: true,
        experience: "12 años",
        languages: ["es", "en"],
        bio: "Especialista en dermatología clínica y estética.",
        photoUrl: null,
        matricula: "MN-38741",
        schedule: [
          { day: 2, start: "09:00", end: "13:00" },
          { day: 4, start: "09:00", end: "13:00" },
        ],
      },
      {
        id: "doc-03",
        name: "Dr. Lucas Fernández",
        specialty: "Pediatría",
        rating: 4.7,
        reviewCount: 64,
        available: true,
        teleconsulta: false,
        experience: "10 años",
        languages: ["es"],
        bio: "Pediatra dedicado al cuidado integral del niño.",
        photoUrl: null,
        matricula: "MN-52103",
        schedule: [
          { day: 1, start: "14:00", end: "18:00" },
          { day: 5, start: "08:00", end: "12:00" },
        ],
      },
    ],
    settings: {
      slotDuration: 30,
      maxAdvanceDays: 60,
      minAdvanceHours: 2,
      autoConfirm: false,
      workingDays: [1, 2, 3, 4, 5],
      breakStart: "13:00",
      breakEnd: "14:00",
    },
  });
}

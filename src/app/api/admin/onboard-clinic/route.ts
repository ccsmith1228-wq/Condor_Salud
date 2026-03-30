/**
 * POST /api/admin/onboard-clinic — Admin-initiated clinic onboarding
 *
 * Creates a full clinic setup in one shot:
 *   1. Clinic record (with slug, operating hours, insurance, etc.)
 *   2. Doctors linked to the clinic
 *   3. Booking settings
 *   4. Doctor availability slots (next N days)
 *
 * Auth: Requires authenticated admin user (role === "admin")
 * Uses service_role key to bypass RLS for cross-table inserts.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

// ─── Validation Schema ──────────────────────────────────────

const DoctorSchema = z.object({
  name: z.string().min(2),
  specialty: z.string().min(2),
  matricula: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  bio: z.string().optional(),
  languages: z.array(z.string()).optional(),
  teleconsulta: z.boolean().default(false),
  experience: z.string().optional(),
});

const OperatingHoursSchema = z.record(
  z.string(), // day key: lun, mar, mie, etc.
  z.object({ open: z.string(), close: z.string() }),
);

const OnboardClinicSchema = z.object({
  // Clinic basics
  name: z.string().min(2, "Nombre requerido"),
  cuit: z.string().min(8, "CUIT requerido"),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  provincia: z.string().default("CABA"),
  localidad: z.string().default(""),
  planTier: z.enum(["free", "starter", "plus", "enterprise"]).default("plus"),

  // Public profile
  slug: z.string().min(2).optional(), // auto-generated from name if omitted
  description: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  languages: z.array(z.string()).default(["es"]),
  operatingHours: OperatingHoursSchema.optional(),

  // Location
  lat: z.number().optional(),
  lng: z.number().optional(),
  acceptsInsurance: z.array(z.string()).default([]),

  // Visibility
  publicVisible: z.boolean().default(true),
  bookingEnabled: z.boolean().default(true),

  // Doctors
  doctors: z.array(DoctorSchema).default([]),

  // Booking settings
  slotDurationMin: z.number().min(5).max(120).default(30),
  maxAdvanceDays: z.number().min(1).max(365).default(60),
  minAdvanceHours: z.number().min(0).default(2),
  autoConfirm: z.boolean().default(false),
  notifyVia: z.array(z.enum(["email", "whatsapp", "push"])).default(["email", "whatsapp"]),
  confirmationMessage: z.string().optional(),
  cancellationMessage: z.string().optional(),
  reminderHoursBefore: z.number().default(24),
  workingDays: z.array(z.number()).default([1, 2, 3, 4, 5, 6]),
  breakStart: z.string().optional(),
  breakEnd: z.string().optional(),

  // Availability generation
  generateAvailabilityDays: z.number().min(0).max(90).default(30),
});

export type OnboardClinicInput = z.infer<typeof OnboardClinicSchema>;

// ─── Slug generator ─────────────────────────────────────────

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ─── POST Handler ───────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    // 1. Auth check — must be admin
    const serverSb = await createServerClient();
    const {
      data: { user },
    } = await serverSb.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Check admin role
    const sbAny = serverSb as unknown as {
      from: (t: string) => ReturnType<typeof serverSb.from>;
    };
    const { data: profile } = await sbAny
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const isAdmin = profile?.role === "admin" || user.email === process.env.ADMIN_EMAIL;
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Acceso denegado — solo administradores" },
        { status: 403 },
      );
    }

    // 2. Parse & validate body
    const body = await req.json();
    const parsed = OnboardClinicSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Datos inválidos",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const input = parsed.data;

    // 3. Service-role client for bypassing RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json(
        { error: "Supabase no configurado en el servidor" },
        { status: 500 },
      );
    }

    const sb = createClient(supabaseUrl, serviceKey);

    // 4. Generate slug
    const slug = input.slug || generateSlug(input.name);

    // Check slug uniqueness
    const { data: existing } = await sb.from("clinics").select("id").eq("slug", slug).maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: `El slug "${slug}" ya está en uso. Elegí otro.` },
        { status: 409 },
      );
    }

    // 5. Create clinic
    const clinicPayload = {
      name: input.name,
      cuit: input.cuit,
      phone: input.phone || null,
      email: input.email || null,
      address: input.address || null,
      provincia: input.provincia,
      localidad: input.localidad,
      plan_tier: input.planTier,
      sedes: 1,
      slug,
      description: input.description || null,
      website: input.website || null,
      languages: input.languages,
      operating_hours: input.operatingHours || null,
      lat: input.lat || null,
      lng: input.lng || null,
      accepts_insurance: input.acceptsInsurance,
      public_visible: input.publicVisible,
      booking_enabled: input.bookingEnabled,
      active: true,
      onboarding_complete: true,
      onboarding_step: 999,
      onboarded_at: new Date().toISOString(),
    };

    const { data: clinic, error: clinicErr } = await sb
      .from("clinics")
      .insert(clinicPayload)
      .select("id, slug, name")
      .single();

    if (clinicErr) {
      console.error("Clinic insert error:", clinicErr);
      return NextResponse.json(
        { error: `Error creando clínica: ${clinicErr.message}` },
        { status: 500 },
      );
    }

    const clinicId = clinic.id;

    // 6. Create doctors
    const doctorIds: string[] = [];

    for (const doc of input.doctors) {
      const { data: newDoc, error: docErr } = await sb
        .from("doctors")
        .insert({
          name: doc.name,
          specialty: doc.specialty,
          matricula: doc.matricula || null,
          phone: doc.phone || null,
          email: doc.email || null,
          bio: doc.bio || null,
          languages: doc.languages || ["es"],
          teleconsulta: doc.teleconsulta,
          experience: doc.experience || null,
          clinic_id: clinicId,
          location: `${input.localidad}, ${input.provincia}`,
          address: input.address || null,
          financiadores: input.acceptsInsurance,
          available: true,
          active: true,
          rating: 5.0,
          review_count: 0,
        })
        .select("id")
        .single();

      if (docErr) {
        console.error(`Doctor insert error (${doc.name}):`, docErr);
        continue;
      }
      doctorIds.push(newDoc.id);
    }

    // 7. Create booking settings
    await sb.from("clinic_booking_settings").insert({
      clinic_id: clinicId,
      slot_duration_min: input.slotDurationMin,
      max_advance_days: input.maxAdvanceDays,
      min_advance_hours: input.minAdvanceHours,
      auto_confirm: input.autoConfirm,
      notify_via: input.notifyVia,
      confirmation_message: input.confirmationMessage || null,
      cancellation_message: input.cancellationMessage || null,
      reminder_hours_before: input.reminderHoursBefore,
      working_days: input.workingDays,
      break_start: input.breakStart || null,
      break_end: input.breakEnd || null,
    });

    // 8. Generate availability slots
    if (input.generateAvailabilityDays > 0 && doctorIds.length > 0 && input.operatingHours) {
      const slotDuration = input.slotDurationMin;
      const dayMap: Record<number, string> = {
        1: "lun",
        2: "mar",
        3: "mie",
        4: "jue",
        5: "vie",
        6: "sab",
        0: "dom",
      };

      const now = new Date();

      for (const doctorId of doctorIds) {
        const rows: { doctor_id: string; date: string; time_slot: string; booked: boolean }[] = [];

        for (let d = 1; d <= input.generateAvailabilityDays; d++) {
          const date = new Date(now);
          date.setDate(date.getDate() + d);
          const dayKey = dayMap[date.getDay()];
          if (!dayKey) continue;
          const hours = input.operatingHours[dayKey];

          if (!hours) continue; // clinic closed this day
          if (!input.workingDays.includes(date.getDay())) continue;

          // Generate slots
          const openParts = hours.open.split(":").map(Number);
          const closeParts = hours.close.split(":").map(Number);
          const openMin = (openParts[0] ?? 0) * 60 + (openParts[1] ?? 0);
          const closeMin = (closeParts[0] ?? 0) * 60 + (closeParts[1] ?? 0);

          for (let m = openMin; m + slotDuration <= closeMin; m += slotDuration) {
            // Skip break time
            if (input.breakStart && input.breakEnd) {
              const bsParts = input.breakStart.split(":").map(Number);
              const beParts = input.breakEnd.split(":").map(Number);
              const breakStartMin = (bsParts[0] ?? 0) * 60 + (bsParts[1] ?? 0);
              const breakEndMin = (beParts[0] ?? 0) * 60 + (beParts[1] ?? 0);
              if (m >= breakStartMin && m < breakEndMin) continue;
            }

            const hh = String(Math.floor(m / 60)).padStart(2, "0");
            const mm = String(m % 60).padStart(2, "0");

            rows.push({
              doctor_id: doctorId,
              date: date.toISOString().slice(0, 10),
              time_slot: `${hh}:${mm}`,
              booked: false,
            });
          }
        }

        // Batch insert in chunks of 500
        for (let i = 0; i < rows.length; i += 500) {
          await sb.from("doctor_availability").insert(rows.slice(i, i + 500));
        }
      }
    }

    // 9. Return result
    const bookingUrl = `/reservar/${slug}`;

    return NextResponse.json({
      success: true,
      clinic: {
        id: clinicId,
        name: clinic.name,
        slug,
        bookingUrl,
      },
      doctorsCreated: doctorIds.length,
      message: `Clínica "${input.name}" dada de alta exitosamente`,
    });
  } catch (err) {
    console.error("Admin onboard-clinic error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

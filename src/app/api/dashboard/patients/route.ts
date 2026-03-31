// POST /api/dashboard/patients — Create a new patient (staff only)

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/security/require-auth";
import { checkRateLimit } from "@/lib/security/api-guard";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

const CreatePatientSchema = z.object({
  nombre: z.string().min(2, "Nombre requerido").max(200),
  dni: z.string().min(7, "DNI inválido").max(12),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  telefono: z.string().max(30).optional().or(z.literal("")),
  fechaNacimiento: z.string().optional().or(z.literal("")),
  direccion: z.string().max(500).optional().or(z.literal("")),
  financiador: z.string().max(100).optional().or(z.literal("")),
  plan: z.string().max(100).optional().or(z.literal("")),
  notas: z.string().max(2000).optional().or(z.literal("")),
});

export async function POST(request: NextRequest) {
  // Rate limit: 10 patient creations per minute
  const limited = checkRateLimit(request, "dashboard-patients-create", {
    limit: 10,
    windowSec: 60,
  });
  if (limited) return limited;

  // Auth: only staff with pacientes:write
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;

  const { user } = auth;
  const allowedRoles = ["admin", "medico", "recepcion"];
  if (!allowedRoles.includes(user.role)) {
    return NextResponse.json({ error: "No tenés permisos para crear pacientes" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = CreatePatientSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Datos inválidos";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { nombre, dni, email, telefono, fechaNacimiento, direccion, financiador, plan, notas } =
      parsed.data;

    // Insert into Supabase
    const { isSupabaseConfigured } = await import("@/lib/env");
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Base de datos no configurada" }, { status: 503 });
    }

    // Use service role client — our custom auth (condor_session) doesn't
    // create Supabase sessions, so the anon-key client is blocked by RLS.
    const { createClient: createSupa } = await import("@supabase/supabase-js");
    const supabase = createSupa(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const { data, error } = await supabase
      .from("pacientes")
      .insert({
        clinic_id: user.clinicId,
        nombre: nombre.trim(),
        dni: dni.trim(),
        email: email?.trim() || null,
        telefono: telefono?.trim() || null,
        fecha_nacimiento: fechaNacimiento || null,
        direccion: direccion?.trim() || null,
        financiador: financiador?.trim() || "",
        plan: plan?.trim() || "",
        notas: notas?.trim() || null,
        estado: "activo",
      })
      .select("id, nombre, dni")
      .single();

    if (error) {
      // Unique constraint violation (clinic_id, dni)
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Ya existe un paciente con ese DNI en esta clínica" },
          { status: 409 },
        );
      }
      logger.error({ err: error, clinicId: user.clinicId }, "Error creating patient");
      return NextResponse.json({ error: "Error al crear paciente" }, { status: 500 });
    }

    logger.info(
      { patientId: data.id, clinicId: user.clinicId, createdBy: user.id },
      "Patient created",
    );

    return NextResponse.json({ id: data.id, nombre: data.nombre, dni: data.dni }, { status: 201 });
  } catch (err) {
    logger.error({ err }, "Unexpected error creating patient");
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

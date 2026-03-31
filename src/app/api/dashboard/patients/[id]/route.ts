// PUT /api/dashboard/patients/[id] — Update an existing patient (staff only)

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/security/require-auth";
import { checkRateLimit } from "@/lib/security/api-guard";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

const UpdatePatientSchema = z.object({
  nombre: z.string().min(2, "Nombre requerido").max(200),
  dni: z.string().min(7, "DNI inválido").max(12),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  telefono: z.string().max(30).optional().or(z.literal("")),
  fechaNacimiento: z.string().optional().or(z.literal("")),
  direccion: z.string().max(500).optional().or(z.literal("")),
  financiador: z.string().max(100).optional().or(z.literal("")),
  plan: z.string().max(100).optional().or(z.literal("")),
  notas: z.string().max(2000).optional().or(z.literal("")),
  estado: z.enum(["activo", "inactivo"]).optional(),
});

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Rate limit: 20 updates per minute
  const limited = checkRateLimit(request, "dashboard-patients-update", {
    limit: 20,
    windowSec: 60,
  });
  if (limited) return limited;

  // Auth: only staff with pacientes:write
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;

  const { user } = auth;
  const allowedRoles = ["admin", "medico", "recepcion"];
  if (!allowedRoles.includes(user.role)) {
    return NextResponse.json({ error: "No tenés permisos para editar pacientes" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = UpdatePatientSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Datos inválidos";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const {
      nombre,
      dni,
      email,
      telefono,
      fechaNacimiento,
      direccion,
      financiador,
      plan,
      notas,
      estado,
    } = parsed.data;

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

    // Ensure patient belongs to the user's clinic
    const { data: existing } = await supabase
      .from("pacientes")
      .select("id, clinic_id")
      .eq("id", id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: "Paciente no encontrado" }, { status: 404 });
    }

    if (existing.clinic_id !== user.clinicId) {
      return NextResponse.json({ error: "Paciente no pertenece a esta clínica" }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("pacientes")
      .update({
        nombre: nombre.trim(),
        dni: dni.trim(),
        email: email?.trim() || null,
        telefono: telefono?.trim() || null,
        fecha_nacimiento: fechaNacimiento || null,
        direccion: direccion?.trim() || null,
        financiador: financiador?.trim() || "",
        plan: plan?.trim() || "",
        notas: notas?.trim() || null,
        ...(estado ? { estado } : {}),
      })
      .eq("id", id)
      .select("id, nombre, dni")
      .single();

    if (error) {
      // Unique constraint violation (clinic_id, dni)
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Ya existe otro paciente con ese DNI en esta clínica" },
          { status: 409 },
        );
      }
      logger.error(
        { err: error, patientId: id, clinicId: user.clinicId },
        "Error updating patient",
      );
      return NextResponse.json({ error: "Error al actualizar paciente" }, { status: 500 });
    }

    logger.info(
      { patientId: data.id, clinicId: user.clinicId, updatedBy: user.id },
      "Patient updated",
    );

    return NextResponse.json({ patient: data });
  } catch (err) {
    logger.error({ err, patientId: id }, "Unexpected error in PUT /api/dashboard/patients/[id]");
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

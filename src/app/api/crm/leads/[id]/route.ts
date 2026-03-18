/**
 * CRM Lead Detail API
 *
 * GET    /api/crm/leads/[id] — Get single lead
 * PATCH  /api/crm/leads/[id] — Update lead (status, assignment, tags, notes)
 * POST   /api/crm/leads/[id] — Convert lead to patient
 */

import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, sanitizeBody, logger } from "@/lib/security/api-guard";
import { requireAuth } from "@/lib/security/require-auth";
import {
  getLead,
  updateLeadStatus,
  assignLead,
  addLeadTags,
  addLeadNote,
  convertLeadToPatient,
} from "@/lib/services/crm";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const auth = await requireAuth(req);
  if (auth.error) return auth.error;

  const limited = checkRateLimit(req, "crm-lead-detail", { limit: 60, windowSec: 60 });
  if (limited) return limited;

  try {
    const { id } = await params;
    const lead = await getLead(id);
    if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    return NextResponse.json({ lead });
  } catch (err) {
    logger.error({ err }, "Failed to get lead");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const auth = await requireAuth(req);
  if (auth.error) return auth.error;

  const limited = checkRateLimit(req, "crm-lead-update", { limit: 30, windowSec: 60 });
  if (limited) return limited;

  try {
    const { id } = await params;
    const rawBody = await req.json();
    const body = sanitizeBody(rawBody);

    // Update status
    if (body.estado) {
      const updated = await updateLeadStatus(id, body.estado);
      if (!updated) return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
    }

    // Assign to staff
    if (body.assigned_to !== undefined) {
      await assignLead(id, body.assigned_to);
    }

    // Add tags
    if (body.tags && Array.isArray(body.tags)) {
      await addLeadTags(id, body.tags);
    }

    // Add note
    if (body.nota) {
      await addLeadNote(id, body.nota);
    }

    const lead = await getLead(id);
    return NextResponse.json({ lead });
  } catch (err) {
    logger.error({ err }, "Failed to update lead");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/** POST = Convert lead to patient */
export async function POST(req: NextRequest, { params }: Params) {
  const auth = await requireAuth(req);
  if (auth.error) return auth.error;

  const limited = checkRateLimit(req, "crm-lead-convert", { limit: 10, windowSec: 60 });
  if (limited) return limited;

  try {
    const { id } = await params;
    const rawBody = await req.json();
    const body = sanitizeBody(rawBody);

    if (!body.nombre || !body.dni || !body.telefono) {
      return NextResponse.json(
        { error: "nombre, dni, and telefono are required for conversion" },
        { status: 400 },
      );
    }

    const result = await convertLeadToPatient(id, {
      nombre: body.nombre,
      dni: body.dni,
      telefono: body.telefono,
      email: body.email,
      fecha_nacimiento: body.fecha_nacimiento,
      financiador: body.financiador,
      plan: body.plan,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      pacienteId: result.pacienteId,
      alreadyLinked: result.alreadyLinked,
    });
  } catch (err) {
    logger.error({ err }, "Failed to convert lead");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

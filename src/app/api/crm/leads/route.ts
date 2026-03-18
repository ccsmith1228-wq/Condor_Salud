/**
 * CRM Leads API
 *
 * GET  /api/crm/leads — List leads with filters
 * POST /api/crm/leads — Create manual lead
 */

import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, sanitizeBody, logger } from "@/lib/security/api-guard";
import { requireAuth } from "@/lib/security/require-auth";
import { getLeads, createManualLead, type LeadFilters } from "@/lib/services/crm";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth.error) return auth.error;

  const limited = checkRateLimit(req, "crm-leads-list", { limit: 60, windowSec: 60 });
  if (limited) return limited;

  try {
    const clinicId = auth.user?.clinicId;
    if (!clinicId) {
      return NextResponse.json({ error: "No clinic associated" }, { status: 400 });
    }

    const url = new URL(req.url);
    const filters: LeadFilters = {};

    const estado = url.searchParams.get("estado");
    if (estado) filters.estado = estado.split(",") as LeadFilters["estado"];

    const fuente = url.searchParams.get("fuente");
    if (fuente) filters.fuente = fuente as LeadFilters["fuente"];

    const search = url.searchParams.get("search");
    if (search) filters.search = search;

    const assignedTo = url.searchParams.get("assigned_to");
    if (assignedTo) filters.assignedTo = assignedTo;

    const limit = url.searchParams.get("limit");
    if (limit) filters.limit = parseInt(limit, 10);

    const offset = url.searchParams.get("offset");
    if (offset) filters.offset = parseInt(offset, 10);

    const { leads, total } = await getLeads(clinicId, filters);

    return NextResponse.json({ leads, total });
  } catch (err) {
    logger.error({ err, route: "crm/leads" }, "Failed to fetch leads");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth.error) return auth.error;

  const limited = checkRateLimit(req, "crm-leads-create", { limit: 20, windowSec: 60 });
  if (limited) return limited;

  try {
    const clinicId = auth.user?.clinicId;
    if (!clinicId) {
      return NextResponse.json({ error: "No clinic associated" }, { status: 400 });
    }

    const rawBody = await req.json();
    const body = sanitizeBody(rawBody);

    if (!body.nombre || !body.telefono) {
      return NextResponse.json({ error: "nombre and telefono are required" }, { status: 400 });
    }

    const lead = await createManualLead(clinicId, {
      nombre: body.nombre,
      telefono: body.telefono,
      email: body.email,
      motivo: body.motivo,
      fuente: body.fuente,
      tags: body.tags,
      financiador: body.financiador,
      assignedTo: body.assigned_to,
    });

    if (!lead) {
      return NextResponse.json({ error: "Failed to create lead" }, { status: 500 });
    }

    return NextResponse.json({ lead }, { status: 201 });
  } catch (err) {
    logger.error({ err, route: "crm/leads" }, "Failed to create lead");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

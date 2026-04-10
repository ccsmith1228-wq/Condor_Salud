// ─── CRUD /api/services — Clinic service pricing ─────────────
// Uses service-role client for DB ops (RLS bypass) + requireAuth for auth.
import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/env";
import { getServiceClient } from "@/lib/supabase/service";
import { requireAuth } from "@/lib/security/require-auth";

export const runtime = "nodejs";

/* ── Auth helper: get clinicId + role ─────────────────── */
async function authorize(req: NextRequest, roles?: string[]) {
  // 1. Try condor_session / Google OAuth cookie
  const auth = await requireAuth(req);
  if (!auth.error) {
    if (roles && !roles.includes(auth.user.role)) {
      return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
    }
    return { clinicId: auth.user.clinicId, userId: auth.user.id };
  }

  // 2. Fallback: Supabase session (for users who logged in via Supabase auth)
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const anonSb = createClient();
    const {
      data: { user },
    } = await anonSb.auth.getUser();
    if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };

    const sb = getServiceClient();
    const { data: profile } = await sb
      .from("profiles")
      .select("clinic_id, role")
      .eq("id", user.id)
      .single();

    if (!profile?.clinic_id) {
      return { error: NextResponse.json({ error: "No clinic" }, { status: 404 }) };
    }
    if (roles && !roles.includes(profile.role)) {
      return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
    }
    return { clinicId: profile.clinic_id, userId: user.id };
  } catch {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
}

/* ── GET — list clinic services ───────────────────────── */
export async function GET(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ services: [] });
  }

  const auth = await authorize(req);
  if ("error" in auth) return auth.error;

  const sb = getServiceClient();
  const { data, error } = await sb
    .from("clinic_services")
    .select("*")
    .eq("clinic_id", auth.clinicId)
    .order("category")
    .order("name");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ services: data ?? [] });
}

/* ── POST — create a service ──────────────────────────── */
export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const auth = await authorize(req, ["admin", "recepcion"]);
  if ("error" in auth) return auth.error;

  const body = await req.json();
  const { name, description, category, price, ef_price, currency, duration_min, notes, active } =
    body;

  if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const sb = getServiceClient();
  const { data, error } = await sb
    .from("clinic_services")
    .insert({
      clinic_id: auth.clinicId,
      name: name.trim(),
      description: description?.trim() || null,
      category: category || "consulta",
      price: Number(price) || 0,
      ef_price: ef_price != null ? Number(ef_price) : null,
      currency: currency || "ARS",
      duration_min: duration_min ? Number(duration_min) : null,
      notes: notes?.trim() || null,
      active: active !== false,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ service: data }, { status: 201 });
}

/* ── PATCH — update a service ─────────────────────────── */
export async function PATCH(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const auth = await authorize(req, ["admin", "recepcion"]);
  if ("error" in auth) return auth.error;

  const body = await req.json();
  const { id, ...updates } = body;

  if (!id) return NextResponse.json({ error: "Service id required" }, { status: 400 });

  // Sanitize allowed fields
  const allowed: Record<string, unknown> = {};
  if (updates.name !== undefined) allowed.name = String(updates.name).trim();
  if (updates.description !== undefined) allowed.description = updates.description?.trim() || null;
  if (updates.category !== undefined) allowed.category = updates.category;
  if (updates.price !== undefined) allowed.price = Number(updates.price) || 0;
  if (updates.ef_price !== undefined)
    allowed.ef_price = updates.ef_price != null ? Number(updates.ef_price) : null;
  if (updates.currency !== undefined) allowed.currency = updates.currency;
  if (updates.duration_min !== undefined)
    allowed.duration_min = updates.duration_min ? Number(updates.duration_min) : null;
  if (updates.notes !== undefined) allowed.notes = updates.notes?.trim() || null;
  if (updates.active !== undefined) allowed.active = Boolean(updates.active);

  const sb = getServiceClient();
  const { data, error } = await sb
    .from("clinic_services")
    .update(allowed)
    .eq("id", id)
    .eq("clinic_id", auth.clinicId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ service: data });
}

/* ── DELETE — remove a service ────────────────────────── */
export async function DELETE(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const auth = await authorize(req, ["admin", "recepcion"]);
  if ("error" in auth) return auth.error;

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Service id required" }, { status: 400 });

  const sb = getServiceClient();
  const { error } = await sb
    .from("clinic_services")
    .delete()
    .eq("id", id)
    .eq("clinic_id", auth.clinicId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

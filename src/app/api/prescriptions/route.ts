// ─── GET /api/prescriptions — List clinic prescriptions ──────
import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/env";

export const runtime = "nodejs";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ prescriptions: [] });
  }

  const { createClient } = await import("@/lib/supabase/server");
  const sb = createClient() as unknown as import("@supabase/supabase-js").SupabaseClient;

  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await sb
    .from("profiles")
    .select("clinic_id")
    .eq("id", user.id)
    .single();

  if (!profile?.clinic_id) return NextResponse.json({ error: "No clinic" }, { status: 404 });

  // Fetch prescriptions for this clinic (newest first, last 200)
  const { data: rows, error } = await sb
    .from("digital_prescriptions")
    .select("*")
    .eq("clinic_id", profile.clinic_id)
    .order("issued_at", { ascending: false })
    .limit(200);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (!rows || rows.length === 0) {
    return NextResponse.json({ prescriptions: [] });
  }

  // Fetch medications for all prescriptions in one query
  const rxIds = rows.map((r: Record<string, unknown>) => r.id as string);
  const { data: allMeds } = await sb
    .from("prescription_medications")
    .select("*")
    .in("prescription_id", rxIds)
    .order("sort_order");

  const medsMap = new Map<string, Record<string, unknown>[]>();
  for (const m of allMeds || []) {
    const pid = m.prescription_id as string;
    if (!medsMap.has(pid)) medsMap.set(pid, []);
    medsMap.get(pid)!.push(m);
  }

  const prescriptions = rows.map((r: Record<string, unknown>) => {
    const id = r.id as string;
    const meds = medsMap.get(id) || [];
    const osdeData = r.osde_data as Record<string, unknown> | null;

    return {
      id,
      patientName: r.patient_name as string,
      patientDni: (r.patient_dni as string) || undefined,
      doctorName: r.doctor_name as string,
      status: r.status as string,
      issuedAt: r.issued_at as string,
      verificationToken: r.verification_token as string,
      coverageName: (r.coverage_name as string) || undefined,
      diagnosis: (r.diagnosis as string) || undefined,
      osde: osdeData ? { status: (osdeData.status as string) || "unknown" } : undefined,
      rcta: undefined, // RCTA data stored in separate registration table if needed
      medications: meds.map((m: Record<string, unknown>) => ({
        medicationName: m.medication_name as string,
        dosage: m.dosage as string,
        frequency: m.frequency as string,
        genericName: (m.generic_name as string) || undefined,
      })),
    };
  });

  return NextResponse.json({ prescriptions });
}

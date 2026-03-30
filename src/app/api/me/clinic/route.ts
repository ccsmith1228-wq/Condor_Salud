/**
 * GET /api/me/clinic — Returns the current user's clinic info
 *
 * Used by the dashboard to resolve the clinic slug for API calls.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const sb = await createClient();
    const {
      data: { user },
    } = await sb.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // sbAny casting for new columns not yet in generated types
    const sbAny = sb as unknown as { from: (t: string) => ReturnType<typeof sb.from> };

    // Find clinic this user belongs to (via profiles → clinic_id or clinics table)
    // Try direct lookup first — user may own the clinic
    const { data: clinic } = await sbAny
      .from("clinics")
      .select("id, name, slug, booking_enabled, public_visible")
      .or(`admin_user_id.eq.${user.id},owner_id.eq.${user.id}`)
      .limit(1)
      .single();

    if (clinic) {
      return NextResponse.json(clinic);
    }

    // Try profile → clinic_id
    const { data: profile } = await sbAny
      .from("profiles")
      .select("clinic_id")
      .eq("id", user.id)
      .single();

    if (profile?.clinic_id) {
      const { data: c } = await sbAny
        .from("clinics")
        .select("id, name, slug, booking_enabled, public_visible")
        .eq("id", profile.clinic_id)
        .single();

      if (c) return NextResponse.json(c);
    }

    // No clinic found — return demo slug so the page still renders
    return NextResponse.json({
      id: null,
      name: "Demo Clinic",
      slug: "demo",
      booking_enabled: true,
      public_visible: false,
    });
  } catch {
    return NextResponse.json({ slug: "demo", name: "Demo Clinic" }, { status: 200 });
  }
}

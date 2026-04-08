import type { SupabaseClient, DBRow } from "@/lib/services/db-types";
import type { PlanTier } from "@/lib/types";
import { buildDefaultWhatsAppSetup } from "@/lib/services/whatsapp-defaults";
/**
 * Onboarding service — persists clinic setup to Supabase.
 *
 * MEDICAL INDUSTRY: No demo fallback. Supabase required.
 */

import { isSupabaseConfigured } from "@/lib/env";

// ─── Types ───────────────────────────────────────────────────

export interface ClinicOnboardingInput {
  // Clinic data (step 1)
  nombre: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  whatsappNumber?: string;
  // Doctor profile (step 2)
  doctorNombre: string;
  doctorMatricula: string;
  doctorEspecialidad?: string;
  // Configuration (step 3)
  especialidades?: string[];
  financiadores?: string[];
  // Plan (step 4)
  planTier: PlanTier;
}

export interface OnboardingResult {
  success: boolean;
  clinicId?: string;
  error?: string;
}

/**
 * Server-side WhatsApp config + template seeding using service_role client.
 * No client-side fetch — no cookie/auth race condition.
 * Idempotent: safe to call multiple times (uses upsert).
 */
async function seedDefaultWhatsApp(
  clinicId: string,
  clinic: {
    name: string;
    slug?: string | null;
    phone?: string | null;
    address?: string | null;
  },
  input: ClinicOnboardingInput,
) {
  const { createClient } = await import("@supabase/supabase-js");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return; // Silently skip if no service key

  const sb = createClient(url, key);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://condorsalud.com";
  const bookingUrl = clinic.slug ? `${baseUrl}/reservar/${clinic.slug}` : undefined;

  const { config, templates } = buildDefaultWhatsAppSetup({
    clinicName: clinic.name,
    whatsappNumber: input.whatsappNumber,
    clinicPhone: input.telefono ?? clinic.phone,
    clinicAddress: input.direccion ?? clinic.address,
    bookingUrl,
  });

  // Upsert whatsapp_config (one row per clinic)
  await sb.from("whatsapp_config").upsert(
    {
      clinic_id: clinicId,
      ...config,
    },
    { onConflict: "clinic_id" },
  );

  // Upsert templates (7 default templates per clinic)
  for (const tpl of templates) {
    await sb.from("whatsapp_templates").upsert(
      {
        clinic_id: clinicId,
        name: tpl.name,
        category: tpl.category,
        language: tpl.language,
        body_template: tpl.body_template,
        variables: tpl.variables,
        header_text: tpl.header_text,
        active: tpl.active,
        approved: false, // Pending Meta approval
      },
      { onConflict: "clinic_id,name" },
    );
  }
}

/**
 * Auto-provision WhatsApp config for a clinic if it doesn't exist yet.
 * Called lazily on first dashboard access or first API call.
 * Handles clinics that were onboarded before migration 006 existed.
 */
export async function ensureWhatsAppConfig(
  clinicId: string,
  clinicName?: string,
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const { createClient } = await import("@supabase/supabase-js");
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const sb = createClient(url, key);

    // Check if config already exists
    const { data: existing } = await sb
      .from("whatsapp_config")
      .select("id")
      .eq("clinic_id", clinicId)
      .maybeSingle();

    if (existing) return true; // Already provisioned

    // Fetch clinic details for the defaults
    const { data: clinic } = await sb
      .from("clinics")
      .select("name, slug, phone, address")
      .eq("id", clinicId)
      .maybeSingle();

    if (!clinic) return false;

    const name = clinicName || ((clinic as DBRow).name as string);
    const slug = ((clinic as DBRow).slug as string | null) ?? null;
    const phone = ((clinic as DBRow).phone as string | null) ?? null;
    const address = ((clinic as DBRow).address as string | null) ?? null;

    await seedDefaultWhatsApp(
      clinicId,
      { name, slug, phone, address },
      {
        nombre: name,
        telefono: phone ?? undefined,
        direccion: address ?? undefined,
        doctorNombre: "",
        doctorMatricula: "",
        planTier: "profesional" as PlanTier,
      },
    );

    return true;
  } catch (err) {
    console.error("[ensureWhatsAppConfig] auto-provision failed (tables may not exist)", err);
    return false;
  }
}

// ─── Service ─────────────────────────────────────────────────

/**
 * Create or update the clinic record, set doctor profile, and mark onboarding completed.
 * MEDICAL INDUSTRY: No demo fallback — Supabase is required.
 */
export async function completeOnboarding(input: ClinicOnboardingInput): Promise<OnboardingResult> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Sistema de autenticación no configurado. Contactá soporte." };
  }

  try {
    const { createClient } = await import("@/lib/supabase/client");
    const sb = createClient();

    // Get current user
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) {
      return { success: false, error: "Usuario no autenticado" };
    }

    // Check if user already has a clinic via profiles
    const { data: profile } = await (sb as SupabaseClient)
      .from("profiles")
      .select("clinic_id")
      .eq("id", user.id)
      .single();

    let clinicId = profile?.clinic_id as string | null;

    const clinicPayload = {
      name: input.nombre,
      address: input.direccion ?? null,
      phone: input.telefono ?? null,
      email: input.email ?? null,
      especialidad: input.especialidades ?? [],
      plan_tier: input.planTier,
      onboarding_completed: true,
      onboarding_step: -1, // -1 = finished
      updated_at: new Date().toISOString(),
    };

    if (clinicId) {
      // Update existing clinic
      const { error } = await (sb as SupabaseClient)
        .from("clinics")
        .update(clinicPayload)
        .eq("id", clinicId);

      if (error) {
        console.error("[onboarding] clinic update error", error);
        return { success: false, error: error.message };
      }
    } else {
      // Create new clinic
      const { data: clinic, error: insertErr } = await (sb as SupabaseClient)
        .from("clinics")
        .insert(clinicPayload)
        .select("id")
        .single();

      if (insertErr) {
        console.error("[onboarding] clinic insert error", insertErr);
        return { success: false, error: insertErr.message };
      }

      clinicId = clinic?.id as string;
    }

    // Update doctor profile with matrícula and especialidad
    if (clinicId) {
      const profilePayload: Record<string, unknown> = {
        clinic_id: clinicId,
        full_name: input.doctorNombre,
        matricula: input.doctorMatricula,
      };
      if (input.doctorEspecialidad) {
        profilePayload.especialidad = input.doctorEspecialidad;
      }

      const { error: profileErr } = await (sb as SupabaseClient)
        .from("profiles")
        .update(profilePayload)
        .eq("id", user.id);

      if (profileErr) {
        console.error("[onboarding] profile update error", profileErr);
        // Non-fatal — clinic was created, profile update can be retried
      }

      const { data: clinicData } = await (sb as SupabaseClient)
        .from("clinics")
        .select("name, slug, phone, address")
        .eq("id", clinicId)
        .maybeSingle();

      if (clinicData) {
        try {
          await seedDefaultWhatsApp(
            clinicId,
            {
              name: (clinicData as DBRow).name as string,
              slug: ((clinicData as DBRow).slug as string | null | undefined) ?? null,
              phone: ((clinicData as DBRow).phone as string | null | undefined) ?? null,
              address: ((clinicData as DBRow).address as string | null | undefined) ?? null,
            },
            input,
          );
        } catch (whatsAppErr) {
          console.error("[onboarding] whatsapp seed error", whatsAppErr);
        }
      }
    }

    return { success: true, clinicId: clinicId ?? undefined };
  } catch (err) {
    console.error("[onboarding] unexpected error", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Error desconocido",
    };
  }
}

/**
 * Save onboarding progress (partial — user hasn't finished yet).
 */
export async function saveOnboardingProgress(step: number): Promise<void> {
  if (!isSupabaseConfigured()) return; // Silently skip if no backend

  try {
    const { createClient } = await import("@/lib/supabase/client");
    const sb = createClient();
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) return;

    const { data: profile } = await (sb as SupabaseClient)
      .from("profiles")
      .select("clinic_id")
      .eq("id", user.id)
      .single();

    if (profile?.clinic_id) {
      await (sb as SupabaseClient)
        .from("clinics")
        .update({ onboarding_step: step, updated_at: new Date().toISOString() })
        .eq("id", profile.clinic_id);
    }
  } catch {
    // Silently fail — progress saving is non-critical
  }
}

/**
 * Check if user's clinic has completed onboarding.
 */
export async function getOnboardingStatus(): Promise<{
  completed: boolean;
  step: number;
}> {
  if (!isSupabaseConfigured()) {
    return { completed: false, step: 0 };
  }

  try {
    const { createClient } = await import("@/lib/supabase/client");
    const sb = createClient();
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) return { completed: false, step: 0 };

    const { data: profile } = await (sb as SupabaseClient)
      .from("profiles")
      .select("clinic_id")
      .eq("id", user.id)
      .single();

    if (!profile?.clinic_id) return { completed: false, step: 0 };

    const { data: clinic } = await (sb as SupabaseClient)
      .from("clinics")
      .select("onboarding_completed, onboarding_step")
      .eq("id", profile.clinic_id)
      .single();

    return {
      completed: clinic?.onboarding_completed ?? false,
      step: clinic?.onboarding_step ?? 0,
    };
  } catch {
    return { completed: false, step: 0 };
  }
}

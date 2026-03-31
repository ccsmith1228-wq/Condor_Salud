"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useToast } from "@/components/Toast";
import { useAuth } from "@/lib/auth/context";
import { useLocale } from "@/lib/i18n/context";
import { isSupabaseConfigured } from "@/lib/env";
import { Building2, Save, Loader2, AlertCircle } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────

interface ClinicData {
  id: string;
  name: string;
  cuit: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  plan_tier: string;
  especialidad: string[];
  logo_url: string | null;
}

const inputClass =
  "w-full rounded-[4px] border border-border px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-celeste-dark focus:border-celeste-dark transition";

// ─── Page ────────────────────────────────────────────────────

export default function ClinicaConfigPage() {
  const { showToast } = useToast();
  const { user } = useAuth();
  const { t } = useLocale();
  const [clinic, setClinic] = useState<ClinicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);

  // Editable fields
  const [name, setName] = useState("");
  const [cuit, setCuit] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  // ── Fetch clinic data ──────────────────────────────────────
  const fetchClinic = useCallback(async () => {
    if (!isSupabaseConfigured() || !user?.clinicId) {
      setLoading(false);
      setError(t("settings.clinic.loadError"));
      return;
    }
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const sb = createClient();
      const { data, error: fetchErr } = await (sb as ReturnType<typeof createClient>)
        .from("clinics")
        .select("id, name, cuit, phone, email, address, plan_tier, especialidad, logo_url")
        .eq("id", user.clinicId)
        .single();

      if (fetchErr || !data) {
        setError(t("settings.clinic.fetchError"));
        return;
      }

      const c = data as unknown as ClinicData;
      setClinic(c);
      setName(c.name || "");
      setCuit(c.cuit || "");
      setPhone(c.phone || "");
      setEmail(c.email || "");
      setAddress(c.address || "");
    } catch {
      setError(t("settings.clinic.connectionError"));
    } finally {
      setLoading(false);
    }
  }, [user?.clinicId, t]);

  useEffect(() => {
    fetchClinic();
  }, [fetchClinic]);

  // ── Save clinic data ───────────────────────────────────────
  const handleSave = async () => {
    if (!clinic?.id) return;
    setSaving(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const sb = createClient();
      const { error: updateErr } = await (sb as ReturnType<typeof createClient>)
        .from("clinics")
        .update({
          name: name.trim(),
          cuit: cuit.trim() || undefined,
          phone: phone.trim() || undefined,
          email: email.trim() || undefined,
          address: address.trim() || undefined,
          updated_at: new Date().toISOString(),
        })
        .eq("id", clinic.id);

      if (updateErr) {
        showToast(t("toast.config.clinicSaveError") + updateErr.message);
        return;
      }

      setClinic((prev) =>
        prev
          ? {
              ...prev,
              name: name.trim(),
              cuit: cuit.trim(),
              phone: phone.trim(),
              email: email.trim(),
              address: address.trim(),
            }
          : prev,
      );
      setEditMode(false);
      showToast(t("toast.config.clinicUpdated"));
    } catch {
      showToast(t("toast.config.clinicConnectionError"));
    } finally {
      setSaving(false);
    }
  };

  // ── Loading / Error states ─────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-celeste-dark" />
        <span className="ml-2 text-sm text-ink-muted">{t("settings.clinic.loadingClinic")}</span>
      </div>
    );
  }

  if (error || !clinic) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <AlertCircle className="h-8 w-8 text-red-400" />
        <p className="text-sm text-ink-muted">{error || t("settings.clinic.notFound")}</p>
        <Link href="/dashboard" className="text-xs text-celeste-dark hover:underline">
          {t("settings.clinic.backToDashboard")}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-sm text-ink-muted">
        <Link href="/dashboard/configuracion" className="hover:text-celeste-dark transition">
          {t("settings.clinic.breadcrumb")}
        </Link>
        <span>/</span>
        <span className="text-ink font-medium">{t("settings.clinic.breadcrumbCurrent")}</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">{t("settings.clinic.heading")}</h1>
          <p className="text-sm text-ink-muted mt-0.5">{t("settings.clinic.subtitle")}</p>
        </div>
        {!editMode ? (
          <button
            onClick={() => setEditMode(true)}
            className="flex items-center gap-1.5 rounded-[4px] border border-celeste-dark px-4 py-2 text-xs font-bold text-celeste-dark hover:bg-celeste-50 transition"
          >
            {t("settings.clinic.edit")}
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditMode(false);
                setName(clinic.name || "");
                setCuit(clinic.cuit || "");
                setPhone(clinic.phone || "");
                setEmail(clinic.email || "");
                setAddress(clinic.address || "");
              }}
              className="rounded-[4px] border border-gray-300 px-4 py-2 text-xs font-medium text-ink-muted hover:bg-gray-50 transition"
            >
              {t("settings.clinic.cancel")}
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !name.trim()}
              className="flex items-center gap-1.5 rounded-[4px] bg-celeste-dark px-4 py-2 text-xs font-bold text-white hover:bg-celeste-700 transition disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              {t("settings.clinic.save")}
            </button>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* General info */}
        <div className="bg-white border border-border rounded-lg p-5 space-y-4">
          <h3 className="text-xs font-bold tracking-wider text-ink-muted uppercase">
            {t("settings.clinic.generalInfo")}
          </h3>
          {editMode ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-ink-muted mb-1">
                  {t("settings.clinic.name")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className={inputClass}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-ink-muted mb-1">{t("settings.cuit")}</label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="30-12345678-9"
                  value={cuit}
                  onChange={(e) => setCuit(e.target.value)}
                />
              </div>
            </div>
          ) : (
            <>
              {[
                { label: t("settings.clinic.name"), value: clinic.name },
                {
                  label: t("settings.cuit"),
                  value: clinic.cuit || t("settings.clinic.notEntered"),
                  mono: true,
                },
                {
                  label: t("settings.clinic.plan"),
                  value:
                    (clinic.plan_tier || "starter").charAt(0).toUpperCase() +
                    (clinic.plan_tier || "starter").slice(1),
                },
              ].map((f) => (
                <div
                  key={f.label}
                  className="flex justify-between items-center py-2 border-b border-border-light last:border-0"
                >
                  <span className="text-xs text-ink-muted">{f.label}</span>
                  <span className={`text-xs font-semibold text-ink ${f.mono ? "font-mono" : ""}`}>
                    {f.value}
                  </span>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Contact */}
        <div className="bg-white border border-border rounded-lg p-5 space-y-4">
          <h3 className="text-xs font-bold tracking-wider text-ink-muted uppercase">
            {t("settings.clinic.contactLocation")}
          </h3>
          {editMode ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-ink-muted mb-1">
                  {t("settings.clinic.address")}
                </label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="Av. San Martín 1520, CABA"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-ink-muted mb-1">
                  {t("settings.clinic.phone")}
                </label>
                <input
                  type="tel"
                  className={inputClass}
                  placeholder="+54 11 1234-5678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-ink-muted mb-1">
                  {t("settings.clinic.email")}
                </label>
                <input
                  type="email"
                  className={inputClass}
                  placeholder="admin@clinica.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
          ) : (
            <>
              {[
                {
                  label: t("settings.clinic.address"),
                  value: clinic.address || t("settings.clinic.notEnteredF"),
                },
                {
                  label: t("settings.clinic.phone"),
                  value: clinic.phone || t("settings.clinic.notEntered"),
                },
                {
                  label: t("settings.clinic.email"),
                  value: clinic.email || t("settings.clinic.notEntered"),
                },
              ].map((f) => (
                <div
                  key={f.label}
                  className="flex justify-between items-center py-2 border-b border-border-light last:border-0"
                >
                  <span className="text-xs text-ink-muted">{f.label}</span>
                  <span className="text-xs font-semibold text-ink text-right">{f.value}</span>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Specialties */}
        <div className="bg-white border border-border rounded-lg p-5">
          <h3 className="text-xs font-bold tracking-wider text-ink-muted uppercase mb-3">
            {t("settings.clinic.specialties")}
          </h3>
          {clinic.especialidad && clinic.especialidad.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {clinic.especialidad.map((e: string) => (
                <span
                  key={e}
                  className="px-3 py-1.5 text-xs font-medium bg-celeste-pale text-celeste-dark rounded-[4px]"
                >
                  {e}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-ink-muted">{t("settings.clinic.noSpecialties")}</p>
          )}
        </div>

        {/* Plan info */}
        <div className="bg-white border border-border rounded-lg p-5">
          <h3 className="text-xs font-bold tracking-wider text-ink-muted uppercase mb-3">
            {t("settings.clinic.currentPlan")}
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-bold text-ink">
                {(clinic.plan_tier || "starter").charAt(0).toUpperCase() +
                  (clinic.plan_tier || "starter").slice(1)}
              </span>
              <p className="text-xs text-ink-muted mt-0.5">{t("settings.clinic.changePlanHint")}</p>
            </div>
            <Link href="/planes" className="text-xs text-celeste-dark font-medium hover:underline">
              {t("settings.clinic.viewPlans")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

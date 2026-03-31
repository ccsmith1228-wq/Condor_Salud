"use client";

import { useState } from "react";
import { useToast } from "@/components/Toast";
import { RequireRole } from "@/components/RequirePermission";
import { useLocale } from "@/lib/i18n/context";
import {
  Building2,
  Stethoscope,
  Settings,
  CheckCircle2,
  Plus,
  Trash2,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Globe,
  Copy,
  ExternalLink,
  Clock,
  MapPin,
  Phone,
  Mail,
  Languages,
  CreditCard,
  Video,
  Shield,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────

interface DoctorInput {
  name: string;
  specialty: string;
  matricula: string;
  phone: string;
  email: string;
  bio: string;
  languages: string[];
  teleconsulta: boolean;
  experience: string;
}

interface ClinicForm {
  // Step 1 — Clinic
  name: string;
  cuit: string;
  phone: string;
  email: string;
  address: string;
  provincia: string;
  localidad: string;
  planTier: "free" | "starter" | "plus" | "enterprise";
  description: string;
  website: string;
  languages: string[];
  lat: string;
  lng: string;
  acceptsInsurance: string[];
  publicVisible: boolean;
  bookingEnabled: boolean;
  operatingHours: Record<string, { open: string; close: string } | null>;

  // Step 2 — Doctors
  doctors: DoctorInput[];

  // Step 3 — Settings
  slotDurationMin: number;
  maxAdvanceDays: number;
  minAdvanceHours: number;
  autoConfirm: boolean;
  notifyVia: string[];
  confirmationMessage: string;
  cancellationMessage: string;
  reminderHoursBefore: number;
  workingDays: number[];
  breakStart: string;
  breakEnd: string;
  generateAvailabilityDays: number;
}

const DAYS = [
  { key: "lun", tKey: "clinicWizard.dayMon", num: 1 },
  { key: "mar", tKey: "clinicWizard.dayTue", num: 2 },
  { key: "mie", tKey: "clinicWizard.dayWed", num: 3 },
  { key: "jue", tKey: "clinicWizard.dayThu", num: 4 },
  { key: "vie", tKey: "clinicWizard.dayFri", num: 5 },
  { key: "sab", tKey: "clinicWizard.daySat", num: 6 },
  { key: "dom", tKey: "clinicWizard.daySun", num: 0 },
];

const INSURANCE_OPTIONS = [
  "OSDE",
  "Swiss Medical",
  "Galeno",
  "Medifé",
  "PAMI",
  "IOMA",
  "OSECAC",
  "Omint",
  "ACA Salud",
  "Hospital Italiano",
  "Unión Personal",
  "OSDEPYM",
  "Medicus",
  "Hospital Alemán",
];

const SPECIALTIES = [
  "Clínica General",
  "Cardiología",
  "Dermatología",
  "Pediatría",
  "Ginecología",
  "Traumatología",
  "Neurología",
  "Oftalmología",
  "Otorrinolaringología",
  "Psiquiatría",
  "Urología",
  "Endocrinología",
  "Gastroenterología",
  "Neumonología",
  "Oncología",
  "Nutrición",
];

const PLAN_TKEYS: Record<string, string> = {
  free: "clinicWizard.planFree",
  starter: "clinicWizard.planStarter",
  plus: "clinicWizard.planPlus",
  enterprise: "clinicWizard.planEnterprise",
};

// ─── Main Page ───────────────────────────────────────────────

export default function AltaClinicaPage() {
  const { t } = useLocale();
  return (
    <RequireRole
      roles={["admin"]}
      fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center space-y-2">
            <Shield className="h-12 w-12 text-muted-foreground/40 mx-auto" />
            <p className="text-lg font-medium text-ink">{t("clinicWizard.accessRestricted")}</p>
            <p className="text-sm text-muted-foreground">{t("clinicWizard.adminOnly")}</p>
          </div>
        </div>
      }
    >
      <OnboardingWizard />
    </RequireRole>
  );
}

function OnboardingWizard() {
  const { showToast } = useToast();
  const { t, locale } = useLocale();
  const lang = locale === "en" ? "en" : "es";

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    clinicName: string;
    slug: string;
    bookingUrl: string;
    doctorsCreated: number;
  } | null>(null);

  const [form, setForm] = useState<ClinicForm>({
    name: "",
    cuit: "",
    phone: "",
    email: "",
    address: "",
    provincia: "CABA",
    localidad: "",
    planTier: "plus",
    description: "",
    website: "",
    languages: ["es"],
    lat: "",
    lng: "",
    acceptsInsurance: [],
    publicVisible: true,
    bookingEnabled: true,
    operatingHours: {
      lun: { open: "08:00", close: "20:00" },
      mar: { open: "08:00", close: "20:00" },
      mie: { open: "08:00", close: "20:00" },
      jue: { open: "08:00", close: "20:00" },
      vie: { open: "08:00", close: "18:00" },
      sab: { open: "09:00", close: "13:00" },
      dom: null,
    },
    doctors: [],
    slotDurationMin: 30,
    maxAdvanceDays: 60,
    minAdvanceHours: 2,
    autoConfirm: false,
    notifyVia: ["email", "whatsapp"],
    confirmationMessage: "",
    cancellationMessage: "",
    reminderHoursBefore: 24,
    workingDays: [1, 2, 3, 4, 5, 6],
    breakStart: "13:00",
    breakEnd: "14:00",
    generateAvailabilityDays: 30,
  });

  const updateForm = (patch: Partial<ClinicForm>) => setForm((f) => ({ ...f, ...patch }));

  // ─── Steps ─────────────────────────────────────────────
  const steps = [
    { icon: Building2, label: t("clinicWizard.stepClinic") },
    { icon: Stethoscope, label: t("clinicWizard.stepProfessionals") },
    { icon: Settings, label: t("clinicWizard.stepSettings") },
    { icon: CheckCircle2, label: t("clinicWizard.stepReview") },
  ];

  // ─── Submit ────────────────────────────────────────────
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Build the API payload
      const operatingHours: Record<string, { open: string; close: string }> = {};
      for (const [key, val] of Object.entries(form.operatingHours)) {
        if (val) operatingHours[key] = val;
      }

      const payload = {
        name: form.name,
        cuit: form.cuit,
        phone: form.phone || undefined,
        email: form.email || undefined,
        address: form.address || undefined,
        provincia: form.provincia,
        localidad: form.localidad,
        planTier: form.planTier,
        description: form.description || undefined,
        website: form.website || undefined,
        languages: form.languages,
        operatingHours: Object.keys(operatingHours).length > 0 ? operatingHours : undefined,
        lat: form.lat ? parseFloat(form.lat) : undefined,
        lng: form.lng ? parseFloat(form.lng) : undefined,
        acceptsInsurance: form.acceptsInsurance,
        publicVisible: form.publicVisible,
        bookingEnabled: form.bookingEnabled,
        doctors: form.doctors.map((d) => ({
          ...d,
          languages: d.languages.length ? d.languages : ["es"],
        })),
        slotDurationMin: form.slotDurationMin,
        maxAdvanceDays: form.maxAdvanceDays,
        minAdvanceHours: form.minAdvanceHours,
        autoConfirm: form.autoConfirm,
        notifyVia: form.notifyVia,
        confirmationMessage: form.confirmationMessage || undefined,
        cancellationMessage: form.cancellationMessage || undefined,
        reminderHoursBefore: form.reminderHoursBefore,
        workingDays: form.workingDays,
        breakStart: form.breakStart || undefined,
        breakEnd: form.breakEnd || undefined,
        generateAvailabilityDays: form.generateAvailabilityDays,
      };

      const res = await fetch("/api/admin/onboard-clinic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || t("clinicWizard.errorCreating"));
      }

      setResult({
        clinicName: data.clinic.name,
        slug: data.clinic.slug,
        bookingUrl: data.clinic.bookingUrl,
        doctorsCreated: data.doctorsCreated,
      });
      setStep(4); // success step
      showToast(data.message || t("clinicWizard.clinicCreated"), "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : t("clinicWizard.errorCreating"), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const canNext = () => {
    switch (step) {
      case 0:
        return form.name.trim().length >= 2 && form.cuit.trim().length >= 8;
      case 1:
        return true; // doctors are optional
      case 2:
        return true;
      case 3:
        return true;
      default:
        return false;
    }
  };

  // ─── Render ────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-ink flex items-center gap-2">
          <Building2 className="h-6 w-6 text-celeste" />
          {t("clinicWizard.title")}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{t("clinicWizard.subtitle")}</p>
      </div>

      {/* Step indicator */}
      {step < 4 && (
        <div className="flex items-center gap-1">
          {steps.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === step;
            const isDone = i < step;
            return (
              <button
                key={i}
                onClick={() => i < step && setStep(i)}
                disabled={i > step}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition
                  ${isActive ? "bg-celeste text-white" : isDone ? "bg-celeste/10 text-celeste cursor-pointer hover:bg-celeste/20" : "bg-muted/50 text-muted-foreground cursor-not-allowed"}`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{s.label}</span>
                <span className="sm:hidden">{i + 1}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Step content */}
      <div className="bg-white border border-border rounded-xl p-6">
        {step === 0 && <StepClinicInfo form={form} updateForm={updateForm} />}
        {step === 1 && <StepDoctors form={form} updateForm={updateForm} />}
        {step === 2 && <StepSettings form={form} updateForm={updateForm} />}
        {step === 3 && <StepReview form={form} />}
        {step === 4 && result && (
          <StepSuccess
            result={result}
            onReset={() => {
              setStep(0);
              setResult(null);
              setForm((f) => ({ ...f, name: "", cuit: "", doctors: [] }));
            }}
          />
        )}
      </div>

      {/* Navigation */}
      {step < 4 && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
            className="flex items-center gap-1.5 px-4 py-2 text-sm text-muted-foreground hover:text-ink disabled:opacity-30 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("clinicWizard.previous")}
          </button>

          {step < 3 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canNext()}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-celeste text-white rounded-lg text-sm font-medium hover:bg-celeste/90 disabled:opacity-40 transition"
            >
              {t("clinicWizard.next")}
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting || !canNext()}
              className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-40 transition"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("clinicWizard.creatingClinic")}
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  {t("clinicWizard.confirmCreate")}
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Step 1 — Clinic Info
// ═══════════════════════════════════════════════════════════════

function StepClinicInfo({
  form,
  updateForm,
}: {
  form: ClinicForm;
  updateForm: (p: Partial<ClinicForm>) => void;
}) {
  const { t } = useLocale();
  const toggleInsurance = (ins: string) => {
    const current = form.acceptsInsurance;
    updateForm({
      acceptsInsurance: current.includes(ins)
        ? current.filter((i) => i !== ins)
        : [...current, ins],
    });
  };

  const toggleLanguage = (lang: string) => {
    const current = form.languages;
    if (current.includes(lang)) {
      if (current.length <= 1) return; // keep at least one
      updateForm({ languages: current.filter((l) => l !== lang) });
    } else {
      updateForm({ languages: [...current, lang] });
    }
  };

  const setDayHours = (dayKey: string, field: "open" | "close", value: string) => {
    const hours = { ...form.operatingHours };
    if (hours[dayKey]) {
      hours[dayKey] = { ...hours[dayKey]!, [field]: value };
    } else {
      hours[dayKey] = { open: "08:00", close: "20:00", [field]: value };
    }
    updateForm({ operatingHours: hours });
  };

  const toggleDay = (dayKey: string) => {
    const hours = { ...form.operatingHours };
    if (hours[dayKey]) {
      hours[dayKey] = null;
    } else {
      hours[dayKey] = { open: "08:00", close: "20:00" };
    }
    updateForm({ operatingHours: hours });
  };

  return (
    <div className="space-y-8">
      {/* Basic info */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-ink flex items-center gap-2">
          <Building2 className="h-5 w-5 text-celeste" />
          {t("clinicWizard.clinicData")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label={t("clinicWizard.nameLabel")}
            value={form.name}
            onChange={(v) => updateForm({ name: v })}
            placeholder={t("clinicWizard.namePlaceholder")}
          />
          <Input
            label={t("clinicWizard.cuitLabel")}
            value={form.cuit}
            onChange={(v) => updateForm({ cuit: v })}
            placeholder={t("clinicWizard.cuitPlaceholder")}
          />
          <Input
            label={t("clinicWizard.phoneLabel")}
            value={form.phone}
            onChange={(v) => updateForm({ phone: v })}
            placeholder={t("clinicWizard.phonePlaceholder")}
            icon={<Phone className="h-4 w-4" />}
          />
          <Input
            label={t("clinicWizard.emailLabel")}
            value={form.email}
            onChange={(v) => updateForm({ email: v })}
            placeholder={t("clinicWizard.emailPlaceholder")}
            icon={<Mail className="h-4 w-4" />}
          />
          <Input
            label={t("clinicWizard.addressLabel")}
            value={form.address}
            onChange={(v) => updateForm({ address: v })}
            placeholder={t("clinicWizard.addressPlaceholder")}
            icon={<MapPin className="h-4 w-4" />}
            className="md:col-span-2"
          />
          <Input
            label={t("clinicWizard.provinceLabel")}
            value={form.provincia}
            onChange={(v) => updateForm({ provincia: v })}
          />
          <Input
            label={t("clinicWizard.cityLabel")}
            value={form.localidad}
            onChange={(v) => updateForm({ localidad: v })}
          />
        </div>
      </section>

      {/* Plan */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-ink flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-celeste" />
          {t("clinicWizard.planHeading")}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {(["free", "starter", "plus", "enterprise"] as const).map((tier) => (
            <button
              key={tier}
              onClick={() => updateForm({ planTier: tier })}
              className={`px-4 py-3 rounded-lg border text-sm text-left transition
                ${form.planTier === tier ? "border-celeste bg-celeste/5 text-celeste font-medium" : "border-border hover:border-celeste/50"}`}
            >
              {t(PLAN_TKEYS[tier] ?? tier)}
            </button>
          ))}
        </div>
      </section>

      {/* Public profile */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-ink flex items-center gap-2">
          <Globe className="h-5 w-5 text-celeste" />
          {t("clinicWizard.publicProfile")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-ink mb-1">
              {t("clinicWizard.descriptionLabel")}
            </label>
            <textarea
              value={form.description}
              onChange={(e) => updateForm({ description: e.target.value })}
              rows={3}
              placeholder={t("clinicWizard.descriptionPlaceholder")}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-celeste/50 focus:border-celeste outline-none resize-none"
            />
          </div>
          <Input
            label={t("clinicWizard.websiteLabel")}
            value={form.website}
            onChange={(v) => updateForm({ website: v })}
            placeholder={t("clinicWizard.websitePlaceholder")}
          />
          <div className="flex items-center gap-6">
            <Toggle
              label={t("clinicWizard.publicVisible")}
              checked={form.publicVisible}
              onChange={(v) => updateForm({ publicVisible: v })}
            />
            <Toggle
              label={t("clinicWizard.onlineBooking")}
              checked={form.bookingEnabled}
              onChange={(v) => updateForm({ bookingEnabled: v })}
            />
          </div>
        </div>
      </section>

      {/* Languages */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-ink flex items-center gap-2">
          <Languages className="h-4 w-4 text-celeste" />
          {t("clinicWizard.languagesHeading")}
        </h2>
        <div className="flex flex-wrap gap-2">
          {[
            { code: "es", label: "Español" },
            { code: "en", label: "English" },
            { code: "pt", label: "Português" },
            { code: "fr", label: "Français" },
            { code: "de", label: "Deutsch" },
            { code: "it", label: "Italiano" },
          ].map((l) => (
            <button
              key={l.code}
              onClick={() => toggleLanguage(l.code)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition
                ${form.languages.includes(l.code) ? "border-celeste bg-celeste/10 text-celeste" : "border-border text-muted-foreground hover:border-celeste/50"}`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </section>

      {/* Insurance */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-ink flex items-center gap-2">
          <Shield className="h-4 w-4 text-celeste" />
          {t("clinicWizard.insuranceHeading")}
        </h2>
        <div className="flex flex-wrap gap-2">
          {INSURANCE_OPTIONS.map((ins) => (
            <button
              key={ins}
              onClick={() => toggleInsurance(ins)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition
                ${form.acceptsInsurance.includes(ins) ? "border-celeste bg-celeste/10 text-celeste" : "border-border text-muted-foreground hover:border-celeste/50"}`}
            >
              {ins}
            </button>
          ))}
        </div>
      </section>

      {/* Operating hours */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-ink flex items-center gap-2">
          <Clock className="h-4 w-4 text-celeste" />
          {t("clinicWizard.operatingHoursHeading")}
        </h2>
        <div className="space-y-2">
          {DAYS.map((day) => {
            const hours = form.operatingHours[day.key];
            const isActive = hours !== null;
            return (
              <div key={day.key} className="flex items-center gap-3">
                <button
                  onClick={() => toggleDay(day.key)}
                  className={`w-24 text-left text-sm font-medium transition ${isActive ? "text-ink" : "text-muted-foreground line-through"}`}
                >
                  {t(day.tKey)}
                </button>
                {isActive && hours ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={hours.open}
                      onChange={(e) => setDayHours(day.key, "open", e.target.value)}
                      className="px-2 py-1 border border-border rounded text-sm focus:ring-1 focus:ring-celeste/50 outline-none"
                    />
                    <span className="text-muted-foreground text-xs">
                      {t("clinicWizard.timeTo")}
                    </span>
                    <input
                      type="time"
                      value={hours.close}
                      onChange={(e) => setDayHours(day.key, "close", e.target.value)}
                      className="px-2 py-1 border border-border rounded text-sm focus:ring-1 focus:ring-celeste/50 outline-none"
                    />
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">{t("clinicWizard.closed")}</span>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Coordinates (optional) */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-ink flex items-center gap-2">
          <MapPin className="h-4 w-4 text-celeste" />
          {t("clinicWizard.coordinatesHeading")}
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label={t("clinicWizard.latitudeLabel")}
            value={form.lat}
            onChange={(v) => updateForm({ lat: v })}
            placeholder="-34.5957"
          />
          <Input
            label={t("clinicWizard.longitudeLabel")}
            value={form.lng}
            onChange={(v) => updateForm({ lng: v })}
            placeholder="-58.3932"
          />
        </div>
      </section>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Step 2 — Doctors
// ═══════════════════════════════════════════════════════════════

function StepDoctors({
  form,
  updateForm,
}: {
  form: ClinicForm;
  updateForm: (p: Partial<ClinicForm>) => void;
}) {
  const { t } = useLocale();
  const addDoctor = () => {
    updateForm({
      doctors: [
        ...form.doctors,
        {
          name: "",
          specialty: "",
          matricula: "",
          phone: "",
          email: "",
          bio: "",
          languages: ["es"],
          teleconsulta: false,
          experience: "",
        },
      ],
    });
  };

  const updateDoctor = (index: number, patch: Partial<DoctorInput>) => {
    const docs = [...form.doctors];
    const existing = docs[index];
    if (existing) {
      docs[index] = { ...existing, ...patch };
      updateForm({ doctors: docs });
    }
  };

  const removeDoctor = (index: number) => {
    updateForm({ doctors: form.doctors.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-ink flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-celeste" />
            {t("clinicWizard.professionalsTitle")}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t("clinicWizard.professionalsSubtitle")}
          </p>
        </div>
        <button
          onClick={addDoctor}
          className="flex items-center gap-1.5 px-4 py-2 bg-celeste text-white rounded-lg text-sm font-medium hover:bg-celeste/90 transition"
        >
          <Plus className="h-4 w-4" />
          {t("clinicWizard.addButton")}
        </button>
      </div>

      {form.doctors.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
          <Stethoscope className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">{t("clinicWizard.noProfessionals")}</p>
          <button
            onClick={addDoctor}
            className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-celeste/10 text-celeste rounded-lg text-sm font-medium hover:bg-celeste/20 transition"
          >
            <Plus className="h-4 w-4" />
            {t("clinicWizard.addFirstProfessional")}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {form.doctors.map((doc, i) => (
            <div key={i} className="border border-border rounded-lg p-4 space-y-4 relative">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  {t("clinicWizard.professionalNumber")} #{i + 1}
                </span>
                <button
                  onClick={() => removeDoctor(i)}
                  className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                  title={t("clinicWizard.deleteTitle")}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  label={t("clinicWizard.fullNameLabel")}
                  value={doc.name}
                  onChange={(v) => updateDoctor(i, { name: v })}
                  placeholder={t("clinicWizard.fullNamePlaceholder")}
                />
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">
                    {t("clinicWizard.specialtyLabel")}
                  </label>
                  <select
                    value={doc.specialty}
                    onChange={(e) => updateDoctor(i, { specialty: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-celeste/50 focus:border-celeste outline-none bg-white"
                  >
                    <option value="">{t("clinicWizard.selectOption")}</option>
                    {SPECIALTIES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <Input
                  label={t("clinicWizard.licenseLabel")}
                  value={doc.matricula}
                  onChange={(v) => updateDoctor(i, { matricula: v })}
                  placeholder={t("clinicWizard.licensePlaceholder")}
                />
                <Input
                  label={t("clinicWizard.phoneLabel")}
                  value={doc.phone}
                  onChange={(v) => updateDoctor(i, { phone: v })}
                  placeholder={t("clinicWizard.doctorPhonePlaceholder")}
                />
                <Input
                  label={t("clinicWizard.emailLabel")}
                  value={doc.email}
                  onChange={(v) => updateDoctor(i, { email: v })}
                  placeholder={t("clinicWizard.doctorEmailPlaceholder")}
                />
                <Input
                  label={t("clinicWizard.experienceLabel")}
                  value={doc.experience}
                  onChange={(v) => updateDoctor(i, { experience: v })}
                  placeholder={t("clinicWizard.experiencePlaceholder")}
                />
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-ink mb-1">
                    {t("clinicWizard.bioLabel")}
                  </label>
                  <textarea
                    value={doc.bio}
                    onChange={(e) => updateDoctor(i, { bio: e.target.value })}
                    rows={2}
                    placeholder={t("clinicWizard.bioPlaceholder")}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-celeste/50 focus:border-celeste outline-none resize-none"
                  />
                </div>
                <div className="flex items-center gap-4 md:col-span-2">
                  <Toggle
                    label={t("clinicWizard.teleconsultation")}
                    checked={doc.teleconsulta}
                    onChange={(v) => updateDoctor(i, { teleconsulta: v })}
                    icon={<Video className="h-3.5 w-3.5" />}
                  />
                  <div className="flex items-center gap-1.5">
                    {["es", "en", "pt"].map((l) => (
                      <button
                        key={l}
                        onClick={() => {
                          const langs = doc.languages.includes(l)
                            ? doc.languages.filter((x) => x !== l)
                            : [...doc.languages, l];
                          if (langs.length > 0) updateDoctor(i, { languages: langs });
                        }}
                        className={`px-2 py-0.5 rounded text-xs font-medium border transition
                          ${doc.languages.includes(l) ? "border-celeste bg-celeste/10 text-celeste" : "border-border text-muted-foreground"}`}
                      >
                        {l.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Step 3 — Settings
// ═══════════════════════════════════════════════════════════════

function StepSettings({
  form,
  updateForm,
}: {
  form: ClinicForm;
  updateForm: (p: Partial<ClinicForm>) => void;
}) {
  const { t } = useLocale();
  const toggleWorkingDay = (num: number) => {
    const current = form.workingDays;
    updateForm({
      workingDays: current.includes(num)
        ? current.filter((d) => d !== num)
        : [...current, num].sort(),
    });
  };

  const toggleNotify = (channel: string) => {
    const current = form.notifyVia;
    updateForm({
      notifyVia: current.includes(channel)
        ? current.filter((c) => c !== channel)
        : [...current, channel],
    });
  };

  return (
    <div className="space-y-8">
      {/* Slot config */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-ink flex items-center gap-2">
          <Clock className="h-5 w-5 text-celeste" />
          {t("clinicWizard.appointmentsHeading")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              {t("clinicWizard.slotDuration")}
            </label>
            <select
              value={form.slotDurationMin}
              onChange={(e) => updateForm({ slotDurationMin: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-celeste/50 focus:border-celeste outline-none bg-white"
            >
              {[15, 20, 30, 45, 60].map((m) => (
                <option key={m} value={m}>
                  {m} {t("clinicWizard.minutesSuffix")}
                </option>
              ))}
            </select>
          </div>
          <Input
            label={t("clinicWizard.maxAdvanceDays")}
            value={String(form.maxAdvanceDays)}
            onChange={(v) => updateForm({ maxAdvanceDays: parseInt(v) || 60 })}
            type="number"
          />
          <Input
            label={t("clinicWizard.minAdvanceHours")}
            value={String(form.minAdvanceHours)}
            onChange={(v) => updateForm({ minAdvanceHours: parseInt(v) || 2 })}
            type="number"
          />
        </div>
        <div className="flex items-center gap-6">
          <Toggle
            label={t("clinicWizard.autoConfirm")}
            checked={form.autoConfirm}
            onChange={(v) => updateForm({ autoConfirm: v })}
          />
        </div>
      </section>

      {/* Working days */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-ink">{t("clinicWizard.workingDaysHeading")}</h2>
        <div className="flex flex-wrap gap-2">
          {DAYS.map((day) => (
            <button
              key={day.key}
              onClick={() => toggleWorkingDay(day.num)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition
                ${form.workingDays.includes(day.num) ? "border-celeste bg-celeste/10 text-celeste" : "border-border text-muted-foreground"}`}
            >
              {t(day.tKey).slice(0, 3)}
            </button>
          ))}
        </div>
      </section>

      {/* Break */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-ink">{t("clinicWizard.lunchBreakHeading")}</h2>
        <div className="flex items-center gap-3">
          <input
            type="time"
            value={form.breakStart}
            onChange={(e) => updateForm({ breakStart: e.target.value })}
            className="px-3 py-2 border border-border rounded-lg text-sm focus:ring-1 focus:ring-celeste/50 outline-none"
          />
          <span className="text-muted-foreground text-sm">{t("clinicWizard.timeTo")}</span>
          <input
            type="time"
            value={form.breakEnd}
            onChange={(e) => updateForm({ breakEnd: e.target.value })}
            className="px-3 py-2 border border-border rounded-lg text-sm focus:ring-1 focus:ring-celeste/50 outline-none"
          />
        </div>
      </section>

      {/* Notifications */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-ink">{t("clinicWizard.notificationsHeading")}</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { key: "email", label: "Email" },
            { key: "whatsapp", label: "WhatsApp" },
            { key: "push", label: "Push" },
          ].map((ch) => (
            <button
              key={ch.key}
              onClick={() => toggleNotify(ch.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition
                ${form.notifyVia.includes(ch.key) ? "border-celeste bg-celeste/10 text-celeste" : "border-border text-muted-foreground"}`}
            >
              {ch.label}
            </button>
          ))}
        </div>
        <Input
          label={t("clinicWizard.reminderLabel")}
          value={String(form.reminderHoursBefore)}
          onChange={(v) => updateForm({ reminderHoursBefore: parseInt(v) || 24 })}
          type="number"
        />
      </section>

      {/* Custom messages */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-ink">
          {t("clinicWizard.customMessagesHeading")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              {t("clinicWizard.confirmationLabel")}
            </label>
            <textarea
              value={form.confirmationMessage}
              onChange={(e) => updateForm({ confirmationMessage: e.target.value })}
              rows={2}
              placeholder={t("clinicWizard.confirmationPlaceholder")}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-celeste/50 focus:border-celeste outline-none resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              {t("clinicWizard.cancellationLabel")}
            </label>
            <textarea
              value={form.cancellationMessage}
              onChange={(e) => updateForm({ cancellationMessage: e.target.value })}
              rows={2}
              placeholder={t("clinicWizard.cancellationPlaceholder")}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-celeste/50 focus:border-celeste outline-none resize-none"
            />
          </div>
        </div>
      </section>

      {/* Availability generation */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-ink">{t("clinicWizard.availabilityHeading")}</h2>
        <Input
          label={t("clinicWizard.generateSlotsLabel")}
          value={String(form.generateAvailabilityDays)}
          onChange={(v) => updateForm({ generateAvailabilityDays: parseInt(v) || 30 })}
          type="number"
        />
        <p className="text-xs text-muted-foreground">
          {t("clinicWizard.generateSlotsDesc").replace("{min}", String(form.slotDurationMin))}
        </p>
      </section>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Step 4 — Review
// ═══════════════════════════════════════════════════════════════

function StepReview({ form }: { form: ClinicForm }) {
  const { t } = useLocale();
  const activeDays = DAYS.filter((d) => form.operatingHours[d.key] !== null);

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-ink flex items-center gap-2">
        <CheckCircle2 className="h-5 w-5 text-green-600" />
        {t("clinicWizard.reviewHeading")}
      </h2>

      {/* Clinic summary */}
      <div className="bg-muted/30 rounded-lg p-4 space-y-2">
        <h3 className="font-semibold text-ink text-base">
          {form.name || t("clinicWizard.noName")}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          <Detail label={t("clinicWizard.reviewCuit")} value={form.cuit} />
          <Detail
            label={t("clinicWizard.reviewPlan")}
            value={t(PLAN_TKEYS[form.planTier] ?? form.planTier)}
          />
          <Detail label={t("clinicWizard.reviewPhone")} value={form.phone} />
          <Detail label={t("clinicWizard.reviewEmail")} value={form.email} />
          <Detail label={t("clinicWizard.reviewAddress")} value={form.address} />
          <Detail
            label={t("clinicWizard.reviewLocation")}
            value={`${form.localidad}, ${form.provincia}`}
          />
          <Detail label={t("clinicWizard.reviewLanguages")} value={form.languages.join(", ")} />
          <Detail
            label={t("clinicWizard.reviewVisible")}
            value={form.publicVisible ? t("clinicWizard.yes") : t("clinicWizard.no")}
          />
          <Detail
            label={t("clinicWizard.reviewOnlineBooking")}
            value={form.bookingEnabled ? t("clinicWizard.yes") : t("clinicWizard.no")}
          />
          {form.acceptsInsurance.length > 0 && (
            <Detail
              label={t("clinicWizard.reviewInsurance")}
              value={form.acceptsInsurance.join(", ")}
              className="sm:col-span-2"
            />
          )}
        </div>
        {activeDays.length > 0 && (
          <div className="text-sm pt-2 border-t border-border/50 mt-2">
            <span className="font-medium text-ink">{t("clinicWizard.scheduleLabel")} </span>
            {activeDays.map((d) => {
              const h = form.operatingHours[d.key]!;
              return (
                <span key={d.key} className="text-muted-foreground mr-3">
                  {t(d.tKey).slice(0, 3)} {h.open}–{h.close}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Doctors summary */}
      <div className="space-y-2">
        <h3 className="font-medium text-ink">
          {form.doctors.length}{" "}
          {form.doctors.length !== 1
            ? t("clinicWizard.professionalsCount")
            : t("clinicWizard.professionalSingular")}
        </h3>
        {form.doctors.map((doc, i) => (
          <div key={i} className="flex items-center gap-3 bg-muted/20 rounded-lg px-4 py-2">
            <Stethoscope className="h-4 w-4 text-celeste shrink-0" />
            <div className="text-sm">
              <span className="font-medium text-ink">{doc.name || t("clinicWizard.noName")}</span>
              <span className="text-muted-foreground">
                {" "}
                — {doc.specialty || t("clinicWizard.noSpecialty")}
              </span>
              {doc.teleconsulta && <Video className="h-3 w-3 text-celeste inline ml-2" />}
            </div>
          </div>
        ))}
      </div>

      {/* Settings summary */}
      <div className="bg-muted/30 rounded-lg p-4 space-y-2">
        <h3 className="font-medium text-ink text-sm">{t("clinicWizard.settingsSummary")}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
          <Detail
            label={t("clinicWizard.reviewDuration")}
            value={`${form.slotDurationMin} ${t("clinicWizard.minSuffix")}`}
          />
          <Detail
            label={t("clinicWizard.reviewMaxAdvance")}
            value={`${form.maxAdvanceDays} ${t("clinicWizard.daysSuffix")}`}
          />
          <Detail
            label={t("clinicWizard.reviewMinAdvance")}
            value={`${form.minAdvanceHours} ${t("clinicWizard.hoursSuffix")}`}
          />
          <Detail
            label={t("clinicWizard.reviewAutoConfirm")}
            value={form.autoConfirm ? t("clinicWizard.yes") : t("clinicWizard.no")}
          />
          <Detail label={t("clinicWizard.reviewNotifyVia")} value={form.notifyVia.join(", ")} />
          <Detail
            label={t("clinicWizard.reviewReminder")}
            value={`${form.reminderHoursBefore}${t("clinicWizard.hoursBeforeSuffix")}`}
          />
          <Detail
            label={t("clinicWizard.reviewAvailability")}
            value={`${form.generateAvailabilityDays} ${t("clinicWizard.daysSuffix")}`}
          />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Step 5 — Success
// ═══════════════════════════════════════════════════════════════

function StepSuccess({
  result,
  onReset,
}: {
  result: { clinicName: string; slug: string; bookingUrl: string; doctorsCreated: number };
  onReset: () => void;
}) {
  const { t } = useLocale();
  const fullUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${result.bookingUrl}`
      : result.bookingUrl;

  return (
    <div className="text-center py-8 space-y-6">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
        <CheckCircle2 className="h-8 w-8 text-green-600" />
      </div>

      <div>
        <h2 className="text-xl font-bold text-ink">{t("clinicWizard.successTitle")}</h2>
        <p className="text-muted-foreground mt-1">
          <span className="font-medium text-ink">{result.clinicName}</span>{" "}
          {t("clinicWizard.successActiveWith")} {result.doctorsCreated}{" "}
          {result.doctorsCreated !== 1
            ? t("clinicWizard.professionalsCount")
            : t("clinicWizard.professionalSingular")}
        </p>
      </div>

      {/* Booking URL */}
      <div className="mx-auto max-w-md bg-muted/30 rounded-lg p-4 space-y-3">
        <p className="text-sm font-medium text-ink">{t("clinicWizard.bookingLinkTitle")}</p>
        <div className="flex items-center gap-2 bg-white border border-border rounded-lg px-3 py-2">
          <Globe className="h-4 w-4 text-celeste shrink-0" />
          <span className="text-sm text-muted-foreground truncate flex-1">{fullUrl}</span>
          <button
            onClick={() => navigator.clipboard.writeText(fullUrl)}
            className="p-1 hover:bg-muted rounded transition"
            title={t("clinicWizard.copyTitle")}
          >
            <Copy className="h-4 w-4 text-muted-foreground" />
          </button>
          <a
            href={fullUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 hover:bg-muted rounded transition"
            title={t("clinicWizard.openTitle")}
          >
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </a>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 pt-4">
        <button
          onClick={onReset}
          className="px-6 py-2.5 bg-celeste text-white rounded-lg text-sm font-medium hover:bg-celeste/90 transition"
        >
          <Plus className="h-4 w-4 inline mr-1.5" />
          {t("clinicWizard.createAnother")}
        </button>
        <a
          href="/dashboard/turnos-online"
          className="px-6 py-2.5 border border-border rounded-lg text-sm font-medium text-ink hover:bg-muted/50 transition"
        >
          {t("clinicWizard.goToBooking")}
        </a>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Shared UI Components
// ═══════════════════════════════════════════════════════════════

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  icon,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-ink mb-1">{label}</label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-celeste/50 focus:border-celeste outline-none
            ${icon ? "pl-9" : ""}`}
        />
      </div>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
  icon,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  icon?: React.ReactNode;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-9 h-5 rounded-full transition-colors
          ${checked ? "bg-celeste" : "bg-gray-300"}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform
            ${checked ? "translate-x-4" : ""}`}
        />
      </button>
      {icon}
      <span className="text-sm text-ink">{label}</span>
    </label>
  );
}

function Detail({
  label,
  value,
  className = "",
}: {
  label: string;
  value?: string;
  className?: string;
}) {
  if (!value) return null;
  return (
    <div className={className}>
      <span className="text-muted-foreground">{label}:</span>{" "}
      <span className="text-ink">{value}</span>
    </div>
  );
}

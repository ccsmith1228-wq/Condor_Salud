"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Crown,
  Heart,
  Loader2,
  Lock,
  Mail,
  Phone,
  Shield,
  Star,
  User,
  CreditCard,
  Sparkles,
  BadgeCheck,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/components/Toast";
import { useLocale } from "@/lib/i18n/context";
import { CLUB_SALUD_PLANS, formatClubPrice, type ClubSaludPlanDef } from "@/lib/plan-config";

/* ─── Constants ─────────────────────────────────────────────── */
const PLAN_ICONS: Record<string, typeof Crown> = {
  basico: Star,
  plus: Crown,
  familiar: Shield,
};

const PLAN_GRADIENTS: Record<string, string> = {
  basico: "from-celeste/10 to-celeste-pale",
  plus: "from-gold/10 to-amber-50",
  familiar: "from-celeste-dark/10 to-celeste-pale",
};

const PLAN_ACCENTS: Record<string, string> = {
  basico: "text-celeste-dark",
  plus: "text-gold-dark",
  familiar: "text-celeste-dark",
};

const PLAN_BTN: Record<string, string> = {
  basico: "bg-celeste-dark hover:bg-celeste-700 text-white",
  plus: "bg-gold hover:bg-gold-dark text-white",
  familiar: "bg-celeste-dark hover:bg-celeste-700 text-white",
};

/* ─── Helpers ───────────────────────────────────────────────── */
function getStoredPatientId(): string | null {
  try {
    const raw = localStorage.getItem("condor_patient_data");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.id) return parsed.id;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function getStoredPatient(): { id: string; name: string; email: string } | null {
  try {
    const raw = localStorage.getItem("condor_patient_data");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.id) return parsed;
    }
  } catch {
    /* ignore */
  }
  return null;
}

/* ═══════════════════════════════════════════════════════════════
   CLUB SALUD — SIGN-UP PAGE
   /paciente/club/registro?plan=basico|plus|familiar
   ═══════════════════════════════════════════════════════════════ */
export default function ClubRegistroPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const { locale } = useLocale();
  const isEn = locale === "en";

  /* ── Plan from URL ─── */
  const planSlug = searchParams.get("plan") || "basico";
  const [selectedPlan, setSelectedPlan] = useState<ClubSaludPlanDef | null>(null);

  useEffect(() => {
    const found = CLUB_SALUD_PLANS.find((p) => p.slug === planSlug);
    setSelectedPlan(found ?? CLUB_SALUD_PLANS[0] ?? null);
  }, [planSlug]);

  /* ── Auth state ─── */
  const [existingPatient, setExistingPatient] = useState<{
    id: string;
    name: string;
    email: string;
  } | null>(null);
  const [authMode, setAuthMode] = useState<"register" | "login">("register");

  useEffect(() => {
    const stored = getStoredPatient();
    if (stored) {
      setExistingPatient(stored);
      setAuthMode("login"); // Already has account
    }
  }, []);

  /* ── Form state ─── */
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    dni: "",
    password: "",
    confirmPassword: "",
  });
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<"auth" | "confirm">("auth");

  // Pre-fill email from existing session
  useEffect(() => {
    if (existingPatient) {
      setLoginForm((f) => ({ ...f, email: existingPatient.email }));
    }
  }, [existingPatient]);

  /* ── Validation ─── */
  function validateRegistration(): boolean {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = isEn ? "Name is required" : "El nombre es obligatorio";
    if (!form.email.trim()) errs.email = isEn ? "Email is required" : "El email es obligatorio";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = isEn ? "Invalid email" : "Email inválido";
    if (!form.password)
      errs.password = isEn ? "Password is required" : "La contraseña es obligatoria";
    else if (form.password.length < 6)
      errs.password = isEn ? "Minimum 6 characters" : "Mínimo 6 caracteres";
    if (form.password !== form.confirmPassword)
      errs.confirmPassword = isEn ? "Passwords don't match" : "Las contraseñas no coinciden";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function validateLogin(): boolean {
    const errs: Record<string, string> = {};
    if (!loginForm.email.trim())
      errs.email = isEn ? "Email is required" : "El email es obligatorio";
    if (!loginForm.password)
      errs.password = isEn ? "Password is required" : "La contraseña es obligatoria";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  /* ── Submit: Register + Join ─── */
  async function handleRegisterAndJoin() {
    if (!validateRegistration() || !selectedPlan) return;
    setSubmitting(true);
    setErrors({});
    try {
      // Step 1: Register patient
      const regRes = await fetch("/api/patients/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password,
          name: form.name.trim(),
          phone: form.phone.trim() || undefined,
        }),
      });
      const regData = await regRes.json();
      if (!regRes.ok) throw new Error(regData.error || "Registration failed");

      // Save session
      localStorage.setItem("condor_patient_token", regData.token);
      localStorage.setItem("condor_patient_refresh", regData.refreshToken);
      localStorage.setItem("condor_patient_data", JSON.stringify(regData.patient));

      // Step 2: Join club plan
      const joinRes = await fetch("/api/club/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: regData.patient.id,
          planSlug: selectedPlan.slug,
        }),
      });
      const joinData = await joinRes.json();
      if (!joinRes.ok) throw new Error(joinData.error || "Join failed");

      showToast(
        isEn
          ? `Welcome to ${selectedPlan.nameEn}! Your membership is active.`
          : `¡Bienvenido/a al ${selectedPlan.nameEs}! Tu membresía está activa.`,
      );
      router.push("/paciente/club");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error";
      setErrors({ general: msg });
    } finally {
      setSubmitting(false);
    }
  }

  /* ── Submit: Login + Join ─── */
  async function handleLoginAndJoin() {
    if (!validateLogin() || !selectedPlan) return;
    setSubmitting(true);
    setErrors({});
    try {
      // Step 1: Login
      const loginRes = await fetch("/api/patients/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginForm.email.trim(),
          password: loginForm.password,
        }),
      });
      const loginData = await loginRes.json();
      if (!loginRes.ok) throw new Error(loginData.error || "Login failed");

      // Save session
      localStorage.setItem("condor_patient_token", loginData.token);
      localStorage.setItem("condor_patient_refresh", loginData.refreshToken);
      localStorage.setItem("condor_patient_data", JSON.stringify(loginData.patient));

      // Step 2: Join club plan
      const joinRes = await fetch("/api/club/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: loginData.patient.id,
          planSlug: selectedPlan.slug,
        }),
      });
      const joinData = await joinRes.json();
      if (!joinRes.ok) throw new Error(joinData.error || "Join failed");

      showToast(
        isEn
          ? `Welcome to ${selectedPlan.nameEn}! Your membership is active.`
          : `¡Bienvenido/a al ${selectedPlan.nameEs}! Tu membresía está activa.`,
      );
      router.push("/paciente/club");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error";
      setErrors({ general: msg });
    } finally {
      setSubmitting(false);
    }
  }

  /* ── Submit: Already logged in — just join ─── */
  async function handleDirectJoin() {
    if (!existingPatient || !selectedPlan) return;
    setSubmitting(true);
    setErrors({});
    try {
      const joinRes = await fetch("/api/club/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: existingPatient.id,
          planSlug: selectedPlan.slug,
        }),
      });
      const joinData = await joinRes.json();
      if (!joinRes.ok) throw new Error(joinData.error || "Join failed");

      showToast(
        isEn
          ? `Welcome to ${selectedPlan.nameEn}! Your membership is active.`
          : `¡Bienvenido/a al ${selectedPlan.nameEs}! Tu membresía está activa.`,
      );
      router.push("/paciente/club");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error";
      setErrors({ general: msg });
    } finally {
      setSubmitting(false);
    }
  }

  /* ── Computed ─── */
  const features = useMemo(() => {
    if (!selectedPlan) return [];
    return isEn ? selectedPlan.featuresEn : selectedPlan.featuresEs;
  }, [selectedPlan, isEn]);

  if (!selectedPlan) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-celeste" />
      </div>
    );
  }

  const Icon = PLAN_ICONS[selectedPlan.slug] || Star;
  const accent = PLAN_ACCENTS[selectedPlan.slug] || "text-celeste-dark";
  const gradient = PLAN_GRADIENTS[selectedPlan.slug] || "from-celeste/10 to-celeste-pale";
  const btnClass = PLAN_BTN[selectedPlan.slug] || "bg-celeste-dark hover:bg-celeste-700 text-white";

  return (
    <div className="max-w-5xl mx-auto">
      {/* ── Breadcrumb ─── */}
      <div className="flex items-center gap-2 text-sm text-ink-muted mb-6">
        <Link href="/club" className="hover:text-celeste-dark transition">
          Club Salud
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-ink font-medium">{isEn ? "Sign Up" : "Registro"}</span>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* ═══ LEFT: Form Section (3 cols) ═══ */}
        <div className="lg:col-span-3 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-ink mb-2">
              {isEn ? "Join Club Salud" : "Unite al Club Salud"}
            </h1>
            <p className="text-ink/60">
              {isEn
                ? "Complete your registration to activate your membership and start enjoying your benefits immediately."
                : "Completá tu registro para activar tu membresía y empezar a disfrutar tus beneficios de inmediato."}
            </p>
          </div>

          {/* ── Plan Selector (compact) ─── */}
          <div>
            <label className="block text-sm font-semibold text-ink mb-3">
              {isEn ? "Selected Plan" : "Plan Seleccionado"}
            </label>
            <div className="grid grid-cols-3 gap-3">
              {CLUB_SALUD_PLANS.map((plan) => {
                const PIcon = PLAN_ICONS[plan.slug] || Star;
                const isActive = selectedPlan.slug === plan.slug;
                return (
                  <button
                    key={plan.slug}
                    onClick={() => {
                      setSelectedPlan(plan);
                      // Update URL without navigation
                      const url = new URL(window.location.href);
                      url.searchParams.set("plan", plan.slug);
                      window.history.replaceState({}, "", url.toString());
                    }}
                    className={`relative border-2 rounded-xl p-3 text-left transition-all ${
                      isActive
                        ? "border-celeste-dark ring-2 ring-celeste/20 bg-celeste/5"
                        : "border-border hover:border-celeste/40"
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-2 right-2 bg-gold text-white text-[8px] font-bold px-2 py-0.5 rounded-full tracking-wider uppercase">
                        Popular
                      </div>
                    )}
                    <PIcon
                      className={`w-5 h-5 mb-1.5 ${isActive ? PLAN_ACCENTS[plan.slug] : "text-ink-300"}`}
                    />
                    <p className="font-semibold text-sm text-ink">
                      {isEn ? plan.nameEn : plan.nameEs}
                    </p>
                    <p
                      className={`text-lg font-bold ${isActive ? PLAN_ACCENTS[plan.slug] : "text-ink/70"}`}
                    >
                      ${formatClubPrice(plan.priceArs)}
                      <span className="text-xs font-normal text-ink/50">
                        /{isEn ? "mo" : "mes"}
                      </span>
                    </p>
                    {isActive && (
                      <div className="absolute top-2 left-2">
                        <Check className="w-4 h-4 text-celeste-dark" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── General Error ─── */}
          {errors.general && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">{errors.general}</p>
              </div>
            </div>
          )}

          {/* ── Already logged in? Direct join ─── */}
          {existingPatient && (
            <div className="bg-celeste/5 border border-celeste/20 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-celeste/20 flex items-center justify-center">
                  <BadgeCheck className="w-5 h-5 text-celeste-dark" />
                </div>
                <div>
                  <p className="font-semibold text-ink">
                    {isEn ? "Welcome back" : "¡Bienvenido/a de nuevo"}
                    {existingPatient.name ? `, ${existingPatient.name}` : ""}!
                  </p>
                  <p className="text-xs text-ink/60">{existingPatient.email}</p>
                </div>
              </div>
              <button
                onClick={handleDirectJoin}
                disabled={submitting}
                className={`w-full py-3 text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2 ${btnClass} disabled:opacity-50`}
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    {isEn ? `Activate ${selectedPlan.nameEn}` : `Activar ${selectedPlan.nameEs}`}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  // Log out and show registration form
                  localStorage.removeItem("condor_patient_token");
                  localStorage.removeItem("condor_patient_refresh");
                  localStorage.removeItem("condor_patient_data");
                  setExistingPatient(null);
                  setAuthMode("register");
                }}
                className="text-xs text-ink-muted hover:text-ink transition text-center w-full"
              >
                {isEn ? "Use a different account" : "Usar otra cuenta"}
              </button>
            </div>
          )}

          {/* ── Auth Forms ─── */}
          {!existingPatient && (
            <>
              {/* Tab toggle */}
              <div className="flex gap-1 bg-surface rounded-xl p-1">
                <button
                  onClick={() => {
                    setAuthMode("register");
                    setErrors({});
                  }}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition ${
                    authMode === "register"
                      ? "bg-white text-ink shadow-sm"
                      : "text-ink-muted hover:text-ink"
                  }`}
                >
                  {isEn ? "New Account" : "Cuenta Nueva"}
                </button>
                <button
                  onClick={() => {
                    setAuthMode("login");
                    setErrors({});
                  }}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition ${
                    authMode === "login"
                      ? "bg-white text-ink shadow-sm"
                      : "text-ink-muted hover:text-ink"
                  }`}
                >
                  {isEn ? "I Already Have an Account" : "Ya Tengo Cuenta"}
                </button>
              </div>

              {/* ── Registration Form ─── */}
              {authMode === "register" && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleRegisterAndJoin();
                  }}
                  className="space-y-4"
                >
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1.5">
                      {isEn ? "Full Name" : "Nombre Completo"} *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-300" />
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        placeholder={isEn ? "Juan Pérez" : "Juan Pérez"}
                        required
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-celeste/20 ${
                          errors.name
                            ? "border-red-300 focus:border-red-400"
                            : "border-border focus:border-celeste-dark"
                        }`}
                      />
                    </div>
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1.5">
                      {isEn ? "Email" : "Email"} *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-300" />
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                        placeholder="nombre@email.com"
                        required
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-celeste/20 ${
                          errors.email
                            ? "border-red-300 focus:border-red-400"
                            : "border-border focus:border-celeste-dark"
                        }`}
                      />
                    </div>
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1.5">
                      {isEn ? "Phone (optional)" : "Teléfono (opcional)"}
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-300" />
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                        placeholder="+54 11 1234-5678"
                        className="w-full pl-10 pr-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:border-celeste-dark focus:ring-2 focus:ring-celeste/20"
                      />
                    </div>
                  </div>

                  {/* DNI */}
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1.5">
                      {isEn ? "ID Number / DNI (optional)" : "DNI (opcional)"}
                    </label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-300" />
                      <input
                        type="text"
                        value={form.dni}
                        onChange={(e) => setForm((f) => ({ ...f, dni: e.target.value }))}
                        placeholder="12.345.678"
                        className="w-full pl-10 pr-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:border-celeste-dark focus:ring-2 focus:ring-celeste/20"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-ink mb-1.5">
                        {isEn ? "Password" : "Contraseña"} *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-300" />
                        <input
                          type="password"
                          value={form.password}
                          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                          placeholder={isEn ? "6+ characters" : "6+ caracteres"}
                          required
                          minLength={6}
                          className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-celeste/20 ${
                            errors.password
                              ? "border-red-300 focus:border-red-400"
                              : "border-border focus:border-celeste-dark"
                          }`}
                        />
                      </div>
                      {errors.password && (
                        <p className="text-xs text-red-500 mt-1">{errors.password}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ink mb-1.5">
                        {isEn ? "Confirm" : "Confirmar"} *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-300" />
                        <input
                          type="password"
                          value={form.confirmPassword}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, confirmPassword: e.target.value }))
                          }
                          placeholder={isEn ? "Repeat password" : "Repetir"}
                          required
                          minLength={6}
                          className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-celeste/20 ${
                            errors.confirmPassword
                              ? "border-red-300 focus:border-red-400"
                              : "border-border focus:border-celeste-dark"
                          }`}
                        />
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>
                      )}
                    </div>
                  </div>

                  {/* Terms */}
                  <p className="text-xs text-ink/50 leading-relaxed">
                    {isEn
                      ? "By creating your account, you agree to our Terms of Service and Privacy Policy. Your membership will renew monthly until you cancel."
                      : "Al crear tu cuenta, aceptás nuestros Términos de Servicio y Política de Privacidad. Tu membresía se renueva mensualmente hasta que la canceles."}
                  </p>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`w-full py-3.5 text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2 ${btnClass} disabled:opacity-50`}
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        {isEn
                          ? `Create Account & Activate ${selectedPlan.nameEn}`
                          : `Crear Cuenta y Activar ${selectedPlan.nameEs}`}
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* ── Login Form ─── */}
              {authMode === "login" && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleLoginAndJoin();
                  }}
                  className="space-y-4"
                >
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1.5">
                      {isEn ? "Email" : "Email"} *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-300" />
                      <input
                        type="email"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm((f) => ({ ...f, email: e.target.value }))}
                        placeholder="nombre@email.com"
                        required
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-celeste/20 ${
                          errors.email
                            ? "border-red-300 focus:border-red-400"
                            : "border-border focus:border-celeste-dark"
                        }`}
                      />
                    </div>
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1.5">
                      {isEn ? "Password" : "Contraseña"} *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-300" />
                      <input
                        type="password"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm((f) => ({ ...f, password: e.target.value }))}
                        placeholder={isEn ? "Your password" : "Tu contraseña"}
                        required
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-celeste/20 ${
                          errors.password
                            ? "border-red-300 focus:border-red-400"
                            : "border-border focus:border-celeste-dark"
                        }`}
                      />
                    </div>
                    {errors.password && (
                      <p className="text-xs text-red-500 mt-1">{errors.password}</p>
                    )}
                  </div>

                  <Link
                    href="/paciente/perfil"
                    className="text-xs text-celeste-dark hover:underline"
                  >
                    {isEn ? "Forgot your password?" : "¿Olvidaste tu contraseña?"}
                  </Link>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`w-full py-3.5 text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2 ${btnClass} disabled:opacity-50`}
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        {isEn
                          ? `Log In & Activate ${selectedPlan.nameEn}`
                          : `Iniciar Sesión y Activar ${selectedPlan.nameEs}`}
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </>
          )}
        </div>

        {/* ═══ RIGHT: Plan Summary Sidebar (2 cols) ═══ */}
        <div className="lg:col-span-2">
          <div className="sticky top-6 space-y-5">
            {/* Plan Card */}
            <div
              className={`bg-gradient-to-br ${gradient} border border-border-light rounded-2xl p-6 space-y-4`}
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-white/80 flex items-center justify-center shadow-sm">
                  <Icon className={`w-6 h-6 ${accent}`} />
                </div>
                <div>
                  <p className="font-display font-bold text-ink text-lg">
                    {isEn ? selectedPlan.nameEn : selectedPlan.nameEs}
                  </p>
                  {selectedPlan.popular && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gold-dark bg-gold/20 px-2 py-0.5 rounded-full">
                      <Sparkles className="w-3 h-3" />
                      {isEn ? "MOST POPULAR" : "MÁS POPULAR"}
                    </span>
                  )}
                </div>
              </div>

              {/* Price */}
              <div className="border-t border-black/5 pt-4">
                <div className="flex items-baseline gap-1.5">
                  <span className={`text-3xl font-display font-bold ${accent}`}>
                    ${formatClubPrice(selectedPlan.priceArs)}
                  </span>
                  <span className="text-sm text-ink/50">ARS/{isEn ? "month" : "mes"}</span>
                </div>
                <p className="text-xs text-ink/40 mt-1">
                  {isEn
                    ? "Billed monthly · Cancel anytime"
                    : "Facturación mensual · Cancelá cuando quieras"}
                </p>
              </div>

              {/* Features */}
              <div className="border-t border-black/5 pt-4 space-y-2.5">
                <p className="text-xs font-semibold text-ink/70 uppercase tracking-wider">
                  {isEn ? "Includes" : "Incluye"}
                </p>
                {features.map((feat) => (
                  <div key={feat} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-celeste-dark mt-0.5 shrink-0" />
                    <span className="text-sm text-ink/80">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Trust signals */}
            <div className="space-y-3 px-2">
              <div className="flex items-center gap-2.5 text-sm text-ink/60">
                <Shield className="w-4 h-4 text-celeste shrink-0" />
                {isEn ? "Secure payment via MercadoPago" : "Pago seguro con MercadoPago"}
              </div>
              <div className="flex items-center gap-2.5 text-sm text-ink/60">
                <BadgeCheck className="w-4 h-4 text-celeste shrink-0" />
                {isEn
                  ? "Verified doctors in the Cóndor network"
                  : "Médicos verificados en la red Cóndor"}
              </div>
              <div className="flex items-center gap-2.5 text-sm text-ink/60">
                <Heart className="w-4 h-4 text-celeste shrink-0" />
                {isEn
                  ? "Cancel anytime — no hidden fees"
                  : "Cancelá cuando quieras — sin cargos ocultos"}
              </div>
            </div>

            {/* Back link */}
            <Link
              href="/club"
              className="flex items-center gap-2 text-sm text-ink-muted hover:text-celeste-dark transition px-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {isEn ? "Back to plans" : "Volver a los planes"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

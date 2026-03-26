"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Crown,
  Star,
  Check,
  Video,
  Truck,
  Bot,
  Shield,
  ChevronRight,
  Sparkles,
  Loader2,
  Activity,
  FileText,
  UserSearch,
  BadgeCheck,
  ArrowRight,
  Heart,
  ClipboardCheck,
} from "lucide-react";
import { useToast } from "@/components/Toast";
import { useLocale } from "@/lib/i18n/context";
import type { ClubPlan, ClubMembership } from "@/lib/types";

/* ── Plan card icon mapping ──────────────────────────────── */
const PLAN_ICONS: Record<string, typeof Crown> = {
  basico: Star,
  plus: Crown,
  familiar: Shield,
};

const PLAN_COLORS: Record<string, string> = {
  basico: "border-celeste/40 bg-celeste/5",
  plus: "border-gold/60 bg-gold/5",
  familiar: "border-celeste-dark/50 bg-celeste-dark/5",
};

const PLAN_ACCENT: Record<string, string> = {
  basico: "text-celeste-dark",
  plus: "text-gold",
  familiar: "text-celeste-dark",
};

export default function ClubPage() {
  const { showToast } = useToast();
  const { t, locale } = useLocale();
  const isEn = locale === "en";

  const [plans, setPlans] = useState<ClubPlan[]>([]);
  const [membership, setMembership] = useState<ClubMembership | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<string | null>(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  async function fetchStatus() {
    try {
      // Get patient ID from localStorage (set by patient-auth)
      const patientId = localStorage.getItem("patientId") || "demo-patient";
      const res = await fetch(`/api/club/status?patientId=${patientId}`);
      const data = await res.json();
      setPlans(data.plans || []);
      setMembership(data.membership || null);
    } catch {
      // Fallback demo plans
      setPlans([
        {
          id: "1",
          slug: "basico",
          nameEs: "Club Básico",
          nameEn: "Basic Club",
          priceArs: 9000,
          priceUsd: 0,
          prescriptionDiscount: 0,
          maxTeleconsultas: 1,
          includesDelivery: false,
          includesCoraPriority: false,
          includesRecordsRequest: true,
          active: true,
          sortOrder: 1,
        },
        {
          id: "2",
          slug: "plus",
          nameEs: "Club Plus",
          nameEn: "Plus Club",
          priceArs: 24500,
          priceUsd: 0,
          prescriptionDiscount: 0,
          maxTeleconsultas: 3,
          includesDelivery: true,
          includesCoraPriority: true,
          includesRecordsRequest: true,
          active: true,
          sortOrder: 2,
        },
        {
          id: "3",
          slug: "familiar",
          nameEs: "Club Familiar",
          nameEn: "Family Club",
          priceArs: 90000,
          priceUsd: 0,
          prescriptionDiscount: 0,
          maxTeleconsultas: 999,
          includesDelivery: true,
          includesCoraPriority: true,
          includesRecordsRequest: true,
          active: true,
          sortOrder: 3,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin(plan: ClubPlan) {
    setJoining(plan.slug);
    try {
      const patientId = localStorage.getItem("patientId") || "demo-patient";
      const res = await fetch("/api/club/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId, planSlug: plan.slug }),
      });
      if (!res.ok) throw new Error("Join failed");
      const data = await res.json();
      setMembership(data.membership);
      showToast(isEn ? `Welcome to ${plan.nameEn}!` : `¡Bienvenido al ${plan.nameEs}!`);
    } catch {
      showToast(isEn ? "Could not join. Try again." : "No se pudo unir. Intentá de nuevo.");
    } finally {
      setJoining(null);
    }
  }

  function getFeatures(plan: ClubPlan): string[] {
    const features = [];
    features.push(
      isEn ? "Welcome Plan (medical screening)" : "Plan de Bienvenida (chequeo medico)",
    );
    const tc =
      plan.maxTeleconsultas >= 999
        ? isEn
          ? "Unlimited teleconsults/month"
          : "Teleconsultas ilimitadas/mes"
        : isEn
          ? `${plan.maxTeleconsultas} teleconsult${plan.maxTeleconsultas > 1 ? "s" : ""}/month`
          : `${plan.maxTeleconsultas} teleconsulta${plan.maxTeleconsultas > 1 ? "s" : ""}/mes`;
    features.push(tc);
    if (plan.includesDelivery) {
      features.push(isEn ? "Free medication delivery" : "Envío de medicamentos gratis");
    }
    if (plan.includesCoraPriority) {
      features.push(isEn ? "Priority Cora AI access" : "Acceso prioritario a Cora IA");
    }
    features.push(
      isEn
        ? "Request records from out-of-network doctors"
        : "Solicitar historia clínica de médicos externos",
    );
    if (plan.slug === "familiar") {
      features.push(isEn ? "Annual comprehensive checkup" : "Chequeo anual completo");
      features.push(isEn ? "Cardiology consultations" : "Consultas de cardiología");
      features.push(
        isEn ? "Unlimited general practitioner visits" : "Visitas a médico clínico ilimitadas",
      );
    }
    return features;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-celeste" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* ─── Header ─── */}
      <div className="text-center">
        <p className="text-[11px] font-bold tracking-[2px] text-celeste uppercase mb-2">
          {isEn ? "CÓNDOR CLUB SALUD" : "CÓNDOR CLUB SALUD"}
        </p>
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-ink">
          {isEn ? "Your health, rewarded" : "Tu salud, con beneficios"}
        </h1>
        <p className="text-ink/60 mt-2 max-w-lg mx-auto">
          {isEn
            ? "Get teleconsults, medical visits, and unlock priority access to Cora."
            : "Obtené teleconsultas, visitas médicas y acceso prioritario a Cora."}
        </p>
      </div>

      {/* ─── Active Membership Banner ─── */}
      {membership && (
        <div className="bg-gradient-to-r from-celeste/10 via-gold/5 to-celeste/10 border border-celeste/30 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-celeste/20 flex items-center justify-center">
              <Crown className="w-5 h-5 text-celeste-dark" />
            </div>
            <div>
              <p className="font-semibold text-ink">
                {isEn ? "Active Member" : "Miembro Activo"} —{" "}
                {isEn ? membership.plan?.nameEn : membership.plan?.nameEs}
              </p>
              <p className="text-xs text-ink/50">
                {isEn ? "Since" : "Desde"}{" "}
                {new Date(membership.startedAt).toLocaleDateString(isEn ? "en-US" : "es-AR")}
                {membership.expiresAt && (
                  <>
                    {" · "}
                    {isEn ? "Renews" : "Renueva"}{" "}
                    {new Date(membership.expiresAt).toLocaleDateString(isEn ? "en-US" : "es-AR")}
                  </>
                )}
              </p>
            </div>
          </div>
          {membership.plan && (
            <div className="flex flex-wrap gap-3 mt-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-white/80 px-3 py-1.5 rounded-full text-ink">
                <Video className="w-3.5 h-3.5 text-celeste" />
                {membership.plan.maxTeleconsultas >= 999
                  ? isEn
                    ? "Unlimited teleconsults"
                    : "Teleconsultas ilimitadas"
                  : `${membership.plan.maxTeleconsultas} ${isEn ? "teleconsults" : "teleconsultas"}`}
              </span>
              {membership.plan.includesDelivery && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-white/80 px-3 py-1.5 rounded-full text-ink">
                  <Truck className="w-3.5 h-3.5 text-celeste" />
                  {isEn ? "Free delivery" : "Envío gratis"}
                </span>
              )}
              {membership.plan.includesCoraPriority && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-white/80 px-3 py-1.5 rounded-full text-ink">
                  <Bot className="w-3.5 h-3.5 text-gold" />
                  {isEn ? "Priority Cora" : "Cora prioritaria"}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─── Feature Hub Widgets ─── */}
      <div>
        <h2 className="text-xl font-display font-bold text-ink mb-4">
          {isEn ? "Your Club Experience" : "Tu Experiencia Club"}
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Health Tracker */}
          <Link
            href="/paciente/salud"
            className="group relative bg-white border border-border-light rounded-2xl p-5 hover:shadow-md hover:border-celeste/40 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mb-3">
              <Activity className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="font-bold text-sm text-ink mb-1">
              {isEn ? "Health Tracker" : "Seguimiento de Salud"}
            </h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              {isEn
                ? "Track vitals, weight, glucose and more. Set goals and see trends."
                : "Registrá signos vitales, peso, glucosa y más. Fijá metas y seguí tendencias."}
            </p>
            <ArrowRight className="absolute top-5 right-4 w-4 h-4 text-ink-200 group-hover:text-celeste transition" />
          </Link>

          {/* Digital Prescriptions */}
          <Link
            href="/paciente/recetas"
            className="group relative bg-white border border-border-light rounded-2xl p-5 hover:shadow-md hover:border-celeste/40 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-celeste-50 flex items-center justify-center mb-3">
              <FileText className="w-5 h-5 text-celeste-dark" />
            </div>
            <h3 className="font-bold text-sm text-ink mb-1">
              {isEn ? "My Prescriptions" : "Mis Recetas"}
            </h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              {isEn
                ? "View digital prescriptions with QR verification."
                : "Consultá recetas digitales con verificación QR."}
            </p>
            <ArrowRight className="absolute top-5 right-4 w-4 h-4 text-ink-200 group-hover:text-celeste transition" />
          </Link>

          {/* Find a Doctor */}
          <Link
            href="/medicos"
            className="group relative bg-white border border-border-light rounded-2xl p-5 hover:shadow-md hover:border-celeste/40 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center mb-3">
              <UserSearch className="w-5 h-5 text-violet-600" />
            </div>
            <h3 className="font-bold text-sm text-ink mb-1">
              {isEn ? "Find a Doctor" : "Buscar Médico"}
            </h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              {isEn
                ? "Browse verified doctors, read reviews and book appointments."
                : "Explorá médicos verificados, leé reseñas y pedí turno."}
            </p>
            <ArrowRight className="absolute top-5 right-4 w-4 h-4 text-ink-200 group-hover:text-celeste transition" />
          </Link>

          {/* Club Savings */}
          <div className="relative bg-gradient-to-br from-gold/5 to-celeste/5 border border-gold/20 rounded-2xl p-5">
            <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center mb-3">
              <Crown className="w-5 h-5 text-gold" />
            </div>
            <h3 className="font-bold text-sm text-ink mb-1">
              {isEn ? "Club Savings" : "Ahorro Club"}
            </h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              {membership?.plan
                ? isEn
                  ? `You get ${membership.plan.maxTeleconsultas >= 999 ? "unlimited" : membership.plan.maxTeleconsultas} teleconsults plus medical records request from any doctor.`
                  : `Tenés ${membership.plan.maxTeleconsultas >= 999 ? "teleconsultas ilimitadas" : `${membership.plan.maxTeleconsultas} teleconsultas`} más solicitud de historias clínicas de cualquier médico.`
                : isEn
                  ? "Join a plan below to access teleconsults and medical benefits."
                  : "Unite a un plan abajo para acceder a teleconsultas y beneficios médicos."}
            </p>
            {membership?.plan && (
              <div className="mt-2">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-celeste-dark bg-celeste/10 px-2 py-0.5 rounded-full">
                  <BadgeCheck className="w-3 h-3" />
                  {isEn ? "Active Member" : "Miembro Activo"}
                </span>
              </div>
            )}
          </div>

          {/* Welcome Plan */}
          <div className="relative bg-gradient-to-br from-emerald-50/60 to-celeste/5 border border-emerald-200/50 rounded-2xl p-5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center mb-3">
              <ClipboardCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="font-bold text-sm text-ink mb-1">
              {isEn ? "Welcome Plan" : "Plan de Bienvenida"}
            </h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              {isEn
                ? "ECG, echocardiogram, stress test, and gender-specific screenings included with your membership."
                : "ECG, ecocardiograma, ergometria y estudios especificos por genero incluidos con tu membresia."}
            </p>
            <div className="mt-2">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                <Check className="w-3 h-3" />
                {isEn ? "All Tiers" : "Todos los Planes"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Plan Cards ─── */}
      <div className="grid sm:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const Icon = PLAN_ICONS[plan.slug] || Star;
          const isCurrentPlan = membership?.plan?.slug === plan.slug;
          const features = getFeatures(plan);

          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl border-2 p-6 transition-all ${
                isCurrentPlan
                  ? "border-celeste ring-2 ring-celeste/20"
                  : PLAN_COLORS[plan.slug] || "border-border"
              }`}
            >
              {plan.slug === "plus" && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-ink text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {isEn ? "POPULAR" : "POPULAR"}
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    plan.slug === "plus" ? "bg-gold/20" : "bg-celeste/10"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${PLAN_ACCENT[plan.slug] || "text-celeste"}`} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-ink">
                    {isEn ? plan.nameEn : plan.nameEs}
                  </h3>
                </div>
              </div>

              {/* Price */}
              <div className="mb-5">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-display font-bold text-ink">
                    ${plan.priceArs.toLocaleString("es-AR")}
                  </span>
                  <span className="text-sm text-ink/50">/{isEn ? "mo" : "mes"}</span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-2.5 mb-6">
                {features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-ink/80">
                    <Check className="w-4 h-4 text-celeste shrink-0 mt-0.5" />
                    {feat}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {isCurrentPlan ? (
                <div className="text-center py-2.5 text-sm font-semibold text-celeste-dark bg-celeste/10 rounded-lg">
                  {isEn ? "Current Plan" : "Plan Actual"}
                </div>
              ) : (
                <button
                  onClick={() => handleJoin(plan)}
                  disabled={joining !== null}
                  className={`w-full py-2.5 text-sm font-semibold rounded-lg transition flex items-center justify-center gap-2 ${
                    plan.slug === "plus"
                      ? "bg-gold hover:bg-gold/90 text-ink"
                      : "bg-celeste-dark hover:bg-celeste-700 text-white"
                  } disabled:opacity-50`}
                >
                  {joining === plan.slug ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      {isEn ? "Join Now" : "Unirme"}
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* ─── How It Works ─── */}
      <div className="bg-surface rounded-2xl p-8">
        <h2 className="text-xl font-display font-bold text-ink text-center mb-6">
          {isEn ? "How it works" : "¿Cómo funciona?"}
        </h2>
        <div className="grid sm:grid-cols-3 gap-6 text-center">
          {[
            {
              icon: Crown,
              title: isEn ? "1. Choose your plan" : "1. Elegí tu plan",
              desc: isEn
                ? "Pick the tier that fits your health needs and budget."
                : "Seleccioná el nivel que se adapte a tus necesidades.",
            },
            {
              icon: Heart,
              title: isEn ? "2. Access your benefits" : "2. Accedé a tus beneficios",
              desc: isEn
                ? "Teleconsults, medical visits, and records request included."
                : "Teleconsultas, visitas médicas y solicitud de historias clínicas incluidos.",
            },
            {
              icon: Video,
              title: isEn ? "3. Use your benefits" : "3. Usá tus beneficios",
              desc: isEn
                ? "Teleconsults, delivery, and priority Cora included."
                : "Teleconsultas, envío y Cora prioritaria incluidos.",
            },
          ].map((step, i) => (
            <div key={i} className="space-y-2">
              <div className="w-12 h-12 rounded-xl bg-celeste/10 flex items-center justify-center mx-auto">
                <step.icon className="w-6 h-6 text-celeste-dark" />
              </div>
              <h3 className="font-semibold text-ink">{step.title}</h3>
              <p className="text-sm text-ink/60">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ─── FAQ ─── */}
      <div className="space-y-4">
        <h2 className="text-xl font-display font-bold text-ink">
          {isEn ? "Frequently Asked Questions" : "Preguntas Frecuentes"}
        </h2>
        {[
          {
            q: isEn ? "Can I cancel anytime?" : "¿Puedo cancelar en cualquier momento?",
            a: isEn
              ? "Yes, cancel anytime from your profile. No hidden fees."
              : "Sí, cancelá cuando quieras desde tu perfil. Sin cargos ocultos.",
          },
          {
            q: isEn
              ? "How does the medical records request work?"
              : "¿Cómo funciona la solicitud de historias clínicas?",
            a: isEn
              ? "You can request records from any out-of-network doctor. We’ll contact them and add the records to your digital health profile."
              : "Podés solicitar historias clínicas de cualquier médico externo. Nos comunicamos con ellos y agregamos los registros a tu perfil de salud digital.",
          },
          {
            q: isEn ? "Can I upgrade my plan later?" : "¿Puedo mejorar mi plan después?",
            a: isEn
              ? "Absolutely. Upgrade anytime and your new benefits activate immediately."
              : "Por supuesto. Mejorá cuando quieras y tus nuevos beneficios se activan de inmediato.",
          },
        ].map((item, i) => (
          <details key={i} className="group border border-border rounded-xl overflow-hidden">
            <summary className="flex items-center justify-between cursor-pointer px-5 py-4 text-sm font-semibold text-ink hover:bg-surface/50 transition">
              {item.q}
              <ChevronRight className="w-4 h-4 text-ink/40 transition-transform group-open:rotate-90" />
            </summary>
            <div className="px-5 pb-4 text-sm text-ink/70">{item.a}</div>
          </details>
        ))}
      </div>
    </div>
  );
}

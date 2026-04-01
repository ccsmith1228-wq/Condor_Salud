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
  Wallet,
} from "lucide-react";
import { useToast } from "@/components/Toast";
import { useLocale } from "@/lib/i18n/context";
import { CLUB_SALUD_PLANS } from "@/lib/plan-config";
import ClubMemberCard from "@/components/ClubMemberCard";
import type { ClubPlan, ClubMembership } from "@/lib/types";

/** Resolve patient ID from patient-auth localStorage, fallback chain */
function getStoredPatientId(): string | null {
  try {
    // Primary: PatientAuthProvider stores full patient object
    const raw = localStorage.getItem("condor_patient_data");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.id) return parsed.id;
    }
    // Legacy: older flows stored patientId directly
    const legacy = localStorage.getItem("patientId");
    if (legacy && legacy !== "demo-patient") return legacy;
  } catch {
    /* ignore parse errors */
  }
  return null;
}

/** Resolve patient name from patient-auth localStorage */
function getStoredPatientName(): string {
  try {
    const raw = localStorage.getItem("condor_patient_data");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.name) return parsed.name;
    }
  } catch {
    /* ignore */
  }
  return "";
}

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
  const [patientId, setPatientId] = useState<string | null>(null);
  const [patientName, setPatientName] = useState("");
  const [walletLoading, setWalletLoading] = useState<"apple" | "google" | null>(null);

  useEffect(() => {
    const stored = getStoredPatientId();
    setPatientId(stored);
    setPatientName(getStoredPatientName());
    // Inline fetch to avoid stale-closure lint issue
    (async () => {
      try {
        if (stored) {
          const res = await fetch(`/api/club/status?patientId=${stored}`);
          const data = await res.json();
          setPlans(data.plans || []);
          setMembership(data.membership || null);
        } else {
          throw new Error("no-patient");
        }
      } catch {
        setPlans(
          CLUB_SALUD_PLANS.map((p, i) => ({
            id: String(i + 1),
            slug: p.slug,
            nameEs: p.nameEs,
            nameEn: p.nameEn,
            priceArs: p.priceArs,
            priceUsd: p.priceUsd,
            prescriptionDiscount: p.prescriptionDiscount,
            maxTeleconsultas: p.maxTeleconsultas,
            includesDelivery: p.includesDelivery,
            includesCoraPriority: p.includesCoraPriority,
            includesRecordsRequest: p.includesRecordsRequest,
            active: true,
            sortOrder: p.sortOrder,
          })),
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function fetchStatus(pid?: string | null) {
    const resolvedId = pid ?? patientId;
    try {
      if (resolvedId) {
        const res = await fetch(`/api/club/status?patientId=${resolvedId}`);
        const data = await res.json();
        setPlans(data.plans || []);
        setMembership(data.membership || null);
      } else {
        throw new Error("no-patient"); // trigger fallback plans
      }
    } catch {
      // Fallback demo plans from canonical config
      setPlans(
        CLUB_SALUD_PLANS.map((p, i) => ({
          id: String(i + 1),
          slug: p.slug,
          nameEs: p.nameEs,
          nameEn: p.nameEn,
          priceArs: p.priceArs,
          priceUsd: p.priceUsd,
          prescriptionDiscount: p.prescriptionDiscount,
          maxTeleconsultas: p.maxTeleconsultas,
          includesDelivery: p.includesDelivery,
          includesCoraPriority: p.includesCoraPriority,
          includesRecordsRequest: p.includesRecordsRequest,
          active: true,
          sortOrder: p.sortOrder,
        })),
      );
    } finally {
      setLoading(false);
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
            ? "Access Cóndor's own doctor network — teleconsults, in-person visits, your virtual member card, and priority Cora AI."
            : "Accedé a la red propia de médicos Cóndor — teleconsultas, visitas presenciales, tu credencial digital y Cora IA prioritaria."}
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

      {/* ─── Virtual Member Card + Wallet ─── */}
      {membership && membership.memberId && (
        <div className="space-y-4">
          <h2 className="text-xl font-display font-bold text-ink">
            {isEn ? "Your Digital Member Card" : "Tu Credencial Digital"}
          </h2>

          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Card */}
            <ClubMemberCard
              memberId={membership.memberId}
              memberName={patientName}
              planSlug={membership.plan?.slug || "basico"}
              planName={(isEn ? membership.plan?.nameEn : membership.plan?.nameEs) || "Club Salud"}
              startedAt={membership.startedAt}
              expiresAt={membership.expiresAt}
            />

            {/* Wallet buttons */}
            <div className="flex flex-col gap-3 sm:pt-2 w-full sm:w-auto">
              <p className="text-xs text-ink/50 mb-1">
                {isEn
                  ? "Add to your phone wallet for easy access"
                  : "Agregala a tu billetera digital para acceso rápido"}
              </p>

              {/* Apple Wallet */}
              <button
                onClick={async () => {
                  setWalletLoading("apple");
                  try {
                    const res = await fetch(`/api/club/card/apple?memberId=${membership.memberId}`);
                    const data = await res.json();
                    if (res.status === 501) {
                      showToast(
                        isEn
                          ? "Apple Wallet will be available soon"
                          : "Apple Wallet estará disponible pronto",
                      );
                    } else if (res.ok) {
                      // When implemented, trigger download of .pkpass
                      showToast(isEn ? "Pass downloaded!" : "¡Pase descargado!");
                    } else {
                      showToast(data.error || "Error");
                    }
                  } catch {
                    showToast(isEn ? "Connection error" : "Error de conexión");
                  } finally {
                    setWalletLoading(null);
                  }
                }}
                disabled={walletLoading !== null}
                className="flex items-center gap-2.5 bg-ink text-white px-5 py-3 rounded-xl hover:bg-ink/90 transition disabled:opacity-50 text-sm font-semibold"
              >
                {walletLoading === "apple" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                )}
                {isEn ? "Add to Apple Wallet" : "Agregar a Apple Wallet"}
              </button>

              {/* Google Wallet */}
              <button
                onClick={async () => {
                  setWalletLoading("google");
                  try {
                    const res = await fetch(
                      `/api/club/card/google?memberId=${membership.memberId}`,
                    );
                    const data = await res.json();
                    if (res.status === 501) {
                      showToast(
                        isEn
                          ? "Google Wallet will be available soon"
                          : "Google Wallet estará disponible pronto",
                      );
                    } else if (res.ok && data.saveUrl) {
                      window.open(data.saveUrl, "_blank");
                    } else {
                      showToast(data.error || "Error");
                    }
                  } catch {
                    showToast(isEn ? "Connection error" : "Error de conexión");
                  } finally {
                    setWalletLoading(null);
                  }
                }}
                disabled={walletLoading !== null}
                className="flex items-center gap-2.5 bg-white border border-border text-ink px-5 py-3 rounded-xl hover:bg-surface transition disabled:opacity-50 text-sm font-semibold"
              >
                {walletLoading === "google" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Wallet className="w-5 h-5 text-celeste" />
                )}
                {isEn ? "Add to Google Wallet" : "Agregar a Google Wallet"}
              </button>

              <p className="text-[10px] text-ink/40 max-w-[220px]">
                {isEn
                  ? "Present your card at any Cóndor network clinic to access your benefits."
                  : "Presentá tu credencial en cualquier centro de la red Cóndor para acceder a tus beneficios."}
              </p>
            </div>
          </div>
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
                <Link
                  href={`/paciente/club/registro?plan=${plan.slug}`}
                  className={`w-full py-2.5 text-sm font-semibold rounded-lg transition flex items-center justify-center gap-2 ${
                    plan.slug === "plus"
                      ? "bg-gold hover:bg-gold/90 text-ink"
                      : "bg-celeste-dark hover:bg-celeste-700 text-white"
                  }`}
                >
                  {isEn ? "Join Now" : "Unirme"}
                  <ChevronRight className="w-4 h-4" />
                </Link>
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

"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/context";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import {
  ArrowRight,
  Bot,
  Check,
  ChevronRight,
  Crown,
  Heart,
  HeartPulse,
  Pill,
  Shield,
  Sparkles,
  Star,
  Stethoscope,
  Truck,
  Video,
  Zap,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   PUBLIC HEALTH CLUB PAGE — condorsalud.com/club
   Marketing page for Cóndor Health Club memberships.
   Logged-in patient management at /paciente/club
   ═══════════════════════════════════════════════════════════════ */

/* ─── Plan data ───────────────────────────────────────────── */
interface PlanInfo {
  slug: string;
  icon: React.ElementType;
  nameEs: string;
  nameEn: string;
  priceArs: string;
  priceUsd: string;
  accent: string;
  border: string;
  badge?: string;
  featuresEs: string[];
  featuresEn: string[];
}

const PLANS: PlanInfo[] = [
  {
    slug: "basico",
    icon: Star,
    nameEs: "Club Básico",
    nameEn: "Basic Club",
    priceArs: "4.500",
    priceUsd: "5",
    accent: "text-celeste-dark",
    border: "border-celeste/40",
    featuresEs: [
      "10% de descuento en recetas",
      "1 teleconsulta por mes",
      "Acceso a Cora (chatbot IA)",
      "Historia clínica digital",
      "Seguimiento de salud",
    ],
    featuresEn: [
      "10% prescription discount",
      "1 teleconsult per month",
      "Access to Cora (AI chatbot)",
      "Digital health record",
      "Health tracking",
    ],
  },
  {
    slug: "plus",
    icon: Crown,
    nameEs: "Club Plus",
    nameEn: "Plus Club",
    priceArs: "8.500",
    priceUsd: "10",
    accent: "text-gold-dark",
    border: "border-gold/60",
    badge: "Popular",
    featuresEs: [
      "20% de descuento en recetas",
      "3 teleconsultas por mes",
      "Delivery de medicamentos",
      "Prioridad con Cora IA",
      "Historia clínica digital",
      "Seguimiento de salud con recordatorios",
    ],
    featuresEn: [
      "20% prescription discount",
      "3 teleconsults per month",
      "Medication delivery",
      "Priority Cora AI access",
      "Digital health record",
      "Health tracking with reminders",
    ],
  },
  {
    slug: "familiar",
    icon: Shield,
    nameEs: "Club Familiar",
    nameEn: "Family Club",
    priceArs: "14.000",
    priceUsd: "18",
    accent: "text-celeste-dark",
    border: "border-celeste-dark/50",
    featuresEs: [
      "30% de descuento en recetas",
      "6 teleconsultas por mes",
      "Delivery de medicamentos incluido",
      "Prioridad con Cora IA",
      "Cobertura para grupo familiar",
      "Seguimiento de salud con recordatorios",
      "Soporte prioritario",
    ],
    featuresEn: [
      "30% prescription discount",
      "6 teleconsults per month",
      "Medication delivery included",
      "Priority Cora AI access",
      "Family group coverage",
      "Health tracking with reminders",
      "Priority support",
    ],
  },
];

/* ─── Benefit card ────────────────────────────────────────── */
function Benefit({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex gap-4 items-start">
      <div className="w-10 h-10 rounded-xl bg-celeste-pale flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-celeste-dark" />
      </div>
      <div>
        <h3 className="font-bold text-sm text-ink">{title}</h3>
        <p className="text-xs text-ink-light leading-relaxed mt-0.5">{desc}</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function HealthClubPage() {
  const { locale } = useLocale();
  const isEn = locale === "en";

  return (
    <>
      <Navbar />
      <main>
        {/* ── Hero ─────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-celeste-pale via-white to-gold-50 pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="max-w-5xl mx-auto px-6 relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-5 h-5 text-gold" />
              <p className="text-[11px] font-bold tracking-[2.5px] text-celeste uppercase">
                {isEn ? "CÓNDOR HEALTH CLUB" : "CÓNDOR HEALTH CLUB"}
              </p>
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-ink leading-[1.1] mb-6">
              {isEn ? (
                <>
                  Your health, <span className="text-celeste-dark">protected</span>
                </>
              ) : (
                <>
                  Tu salud, <span className="text-celeste-dark">protegida</span>
                </>
              )}
            </h1>
            <p className="text-lg md:text-xl text-ink-light max-w-2xl mb-8 leading-relaxed">
              {isEn
                ? "Join Cóndor Health Club and get prescription discounts, teleconsultas, medication delivery, and 24/7 AI health assistance — all in one membership."
                : "Unite al Cóndor Health Club y accedé a descuentos en recetas, teleconsultas, delivery de medicamentos y asistencia de salud con IA 24/7 — todo en una membresía."}
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="#planes"
                className="inline-flex items-center gap-2 bg-celeste-dark text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-celeste-700 transition-colors shadow-sm"
              >
                {isEn ? "See Plans" : "Ver Planes"} <ArrowRight className="w-4 h-4" />
              </a>
              <Link
                href="/paciente/club"
                className="inline-flex items-center gap-2 border border-celeste-dark text-celeste-dark px-6 py-3 rounded-full text-sm font-semibold hover:bg-celeste-pale transition-colors"
              >
                {isEn ? "I'm already a member" : "Ya soy miembro"}{" "}
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          {/* Decorative */}
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-celeste/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-16 w-72 h-72 rounded-full bg-gold/10 blur-3xl" />
        </section>

        {/* ── Benefits ─────────────────────────────────────── */}
        <section className="py-16 md:py-24 bg-surface">
          <div className="max-w-5xl mx-auto px-6">
            <p className="text-[11px] font-bold tracking-[2.5px] text-celeste uppercase mb-2">
              {isEn ? "WHY JOIN" : "POR QUÉ UNIRTE"}
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-ink mb-4">
              {isEn
                ? "Everything you need, one membership"
                : "Todo lo que necesitás, una membresía"}
            </h2>
            <p className="text-base text-ink-light max-w-2xl mb-10">
              {isEn
                ? "Cóndor Health Club gives you and your family access to healthcare tools that save you money and time — every month."
                : "El Cóndor Health Club te da a vos y a tu familia acceso a herramientas de salud que te ahorran plata y tiempo — todos los meses."}
            </p>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
              <Benefit
                icon={Pill}
                title={isEn ? "Prescription Discounts" : "Descuentos en Recetas"}
                desc={
                  isEn
                    ? "Save 10–30% on every prescription. Discounts are applied automatically at checkout."
                    : "Ahorrá 10–30% en cada receta. Los descuentos se aplican automáticamente al pagar."
                }
              />
              <Benefit
                icon={Video}
                title={isEn ? "Teleconsultas" : "Teleconsultas"}
                desc={
                  isEn
                    ? "HD video consultations with doctors from home. No waiting rooms, no travel."
                    : "Consultas por video HD con médicos desde tu casa. Sin salas de espera, sin viajes."
                }
              />
              <Benefit
                icon={Truck}
                title={isEn ? "Medication Delivery" : "Delivery de Medicamentos"}
                desc={
                  isEn
                    ? "Get your prescriptions delivered to your door via Rappi or PedidosYa."
                    : "Recibí tus recetas en la puerta de tu casa por Rappi o PedidosYa."
                }
              />
              <Benefit
                icon={Bot}
                title={isEn ? "Cora AI — 24/7" : "Cora IA — 24/7"}
                desc={
                  isEn
                    ? "Our AI health assistant helps you triage symptoms, find doctors, and manage your health anytime."
                    : "Nuestra asistente de salud IA te ayuda a evaluar síntomas, encontrar médicos y gestionar tu salud en cualquier momento."
                }
              />
              <Benefit
                icon={HeartPulse}
                title={isEn ? "Health Tracking" : "Seguimiento de Salud"}
                desc={
                  isEn
                    ? "Track blood pressure, weight, glucose, medications, vaccines, lab results — all in one place."
                    : "Seguí presión arterial, peso, glucosa, medicación, vacunas, laboratorio — todo en un solo lugar."
                }
              />
              <Benefit
                icon={Stethoscope}
                title={isEn ? "Doctor Directory" : "Directorio Médico"}
                desc={
                  isEn
                    ? "Find verified doctors near you, sorted by specialty, insurance, and ratings."
                    : "Encontrá médicos verificados cerca tuyo, ordenados por especialidad, cobertura y calificaciones."
                }
              />
            </div>
          </div>
        </section>

        {/* ── Plans ────────────────────────────────────────── */}
        <section id="planes" className="py-16 md:py-24">
          <div className="max-w-5xl mx-auto px-6">
            <p className="text-[11px] font-bold tracking-[2.5px] text-celeste uppercase mb-2 text-center">
              {isEn ? "CHOOSE YOUR PLAN" : "ELEGÍ TU PLAN"}
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-ink mb-4 text-center">
              {isEn ? "Plans for every need" : "Planes para cada necesidad"}
            </h2>
            <p className="text-base text-ink-light max-w-2xl mx-auto mb-12 text-center">
              {isEn
                ? "All plans include digital health record, health tracking, and access to the doctor directory. Cancel anytime."
                : "Todos los planes incluyen historia clínica digital, seguimiento de salud y acceso al directorio médico. Cancelá cuando quieras."}
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              {PLANS.map((plan) => {
                const Icon = plan.icon;
                const features = isEn ? plan.featuresEn : plan.featuresEs;
                return (
                  <div
                    key={plan.slug}
                    className={`relative border-2 ${plan.border} rounded-2xl p-6 bg-white hover:shadow-lg transition-shadow`}
                  >
                    {plan.badge && (
                      <div className="absolute -top-3 right-4 bg-gold text-white text-[10px] font-bold px-3 py-0.5 rounded-full tracking-wider uppercase">
                        {plan.badge}
                      </div>
                    )}
                    <div
                      className={`w-12 h-12 rounded-xl bg-surface flex items-center justify-center mb-4 ${plan.accent}`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-display text-xl font-bold text-ink mb-1">
                      {isEn ? plan.nameEn : plan.nameEs}
                    </h3>
                    <div className="flex items-baseline gap-1.5 mb-1">
                      <span className={`text-3xl font-display font-bold ${plan.accent}`}>
                        ${plan.priceArs}
                      </span>
                      <span className="text-xs text-ink-muted">ARS/mes</span>
                    </div>
                    <p className="text-xs text-ink-muted mb-5">
                      USD ${plan.priceUsd}/{isEn ? "month" : "mes"}
                    </p>
                    <ul className="space-y-2.5 mb-6">
                      {features.map((f) => (
                        <li key={f} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-success mt-0.5 shrink-0" />
                          <span className="text-sm text-ink-light">{f}</span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href="/paciente/club"
                      className={`block text-center py-2.5 rounded-full text-sm font-semibold transition-colors ${
                        plan.slug === "plus"
                          ? "bg-gold text-white hover:bg-gold-dark"
                          : "bg-celeste-dark text-white hover:bg-celeste-700"
                      }`}
                    >
                      {isEn ? "Join Now" : "Unirme Ahora"}
                    </Link>
                  </div>
                );
              })}
            </div>

            {/* Non-member pricing note */}
            <div className="mt-8 bg-surface border border-border rounded-xl p-5 text-center">
              <p className="text-sm text-ink-light">
                {isEn ? (
                  <>
                    <strong className="text-ink">Not a member?</strong> You can still request
                    prescriptions for a one-time fee of $2,000 ARS per prescription.
                  </>
                ) : (
                  <>
                    <strong className="text-ink">¿No sos miembro?</strong> Igualmente podés pedir
                    recetas por un cargo único de $2.000 ARS por receta.
                  </>
                )}
              </p>
            </div>
          </div>
        </section>

        {/* ── How It Works ─────────────────────────────────── */}
        <section className="py-16 md:py-24 bg-surface">
          <div className="max-w-4xl mx-auto px-6">
            <p className="text-[11px] font-bold tracking-[2.5px] text-celeste uppercase mb-2 text-center">
              {isEn ? "HOW IT WORKS" : "CÓMO FUNCIONA"}
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-ink mb-12 text-center">
              {isEn ? "Start in 3 minutes" : "Empezá en 3 minutos"}
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: "1",
                  titleEs: "Elegí tu plan",
                  titleEn: "Choose your plan",
                  descEs: "Seleccioná Básico, Plus o Familiar según tus necesidades.",
                  descEn: "Select Basic, Plus, or Family based on your needs.",
                  icon: Sparkles,
                },
                {
                  step: "2",
                  titleEs: "Pagá con MercadoPago",
                  titleEn: "Pay with MercadoPago",
                  descEs: "Suscripción mensual segura. Cancelá cuando quieras.",
                  descEn: "Secure monthly subscription. Cancel anytime.",
                  icon: Shield,
                },
                {
                  step: "3",
                  titleEs: "Disfrutá tus beneficios",
                  titleEn: "Enjoy your benefits",
                  descEs:
                    "Descuentos automáticos en recetas, teleconsultas y delivery disponibles inmediatamente.",
                  descEn:
                    "Automatic prescription discounts, teleconsultas, and delivery available immediately.",
                  icon: Zap,
                },
              ].map((s) => (
                <div key={s.step} className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-celeste-dark text-white flex items-center justify-center mx-auto mb-4">
                    <s.icon className="w-6 h-6" />
                  </div>
                  <div className="text-[10px] font-bold tracking-[2px] text-celeste uppercase mb-1">
                    {isEn ? `Step ${s.step}` : `Paso ${s.step}`}
                  </div>
                  <h3 className="font-bold text-base text-ink mb-1">
                    {isEn ? s.titleEn : s.titleEs}
                  </h3>
                  <p className="text-sm text-ink-light">{isEn ? s.descEn : s.descEs}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────── */}
        <section className="bg-gradient-to-r from-celeste-dark to-celeste-700 text-white py-16 md:py-20">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <Heart className="w-10 h-10 text-gold mx-auto mb-4" />
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              {isEn ? "Join Cóndor Health Club today" : "Unite al Cóndor Health Club hoy"}
            </h2>
            <p className="text-white/70 text-base mb-8 max-w-xl mx-auto">
              {isEn
                ? "Save on prescriptions, get teleconsultas, and take control of your health — all from your phone."
                : "Ahorrá en recetas, accedé a teleconsultas y tomá el control de tu salud — todo desde tu celular."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/paciente/club"
                className="inline-flex items-center justify-center gap-2 bg-white text-celeste-dark px-6 py-3 rounded-full font-bold text-sm hover:bg-white/90 transition-colors"
              >
                {isEn ? "Get Started" : "Empezar"} <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/paciente"
                className="inline-flex items-center justify-center gap-2 border border-white/30 text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-white/10 transition-colors"
              >
                {isEn ? "Explore Patient Portal" : "Explorar Portal Paciente"}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}

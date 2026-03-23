"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/i18n/context";
import { whatsappUrl } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  Clock,
  CreditCard,
  FileText,
  Globe2,
  Heart,
  HeartPulse,
  Languages,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Pill,
  Shield,
  Stethoscope,
  Users,
  Video,
  Zap,
} from "lucide-react";

/* ─── Static data ─────────────────────────────────────────── */

const PAIN_POINTS = [
  { icon: Languages, color: "border-red-300" },
  { icon: FileText, color: "border-red-300" },
  { icon: Clock, color: "border-red-300" },
  { icon: CreditCard, color: "border-red-300" },
] as const;

const SOLUTION_FEATURES = [
  { icon: Stethoscope },
  { icon: Video },
  { icon: Pill },
  { icon: MapPin },
  { icon: MessageSquare },
  { icon: CreditCard },
] as const;

const PROTOCOL_STEPS = [
  { icon: Phone },
  { icon: HeartPulse },
  { icon: MapPin },
  { icon: Pill },
  { icon: FileText },
] as const;

const NETWORK_STATS = [
  { icon: Stethoscope },
  { icon: Heart },
  { icon: Building2 },
  { icon: Clock },
] as const;

const ENDORSEMENT_ASKS = [{ icon: FileText }, { icon: Globe2 }, { icon: Users }] as const;

/* ─── Page ────────────────────────────────────────────────── */

export default function AmericanTravelersPage() {
  const { t, isEn, setSegment } = useLocale();
  const et = (key: string) => t(`embassy.${key}`);

  useEffect(() => {
    setSegment("tourist");
  }, [setSegment]);

  const embassyEmail =
    "mailto:embassy@condorsalud.com.ar?subject=" +
    encodeURIComponent(isEn ? "Embassy Endorsement Inquiry" : "Consulta de Aval Embajada");

  const emergencyWA = whatsappUrl(
    isEn
      ? "Hi, I'm an American traveler and need healthcare assistance in Argentina."
      : "Hola, soy un viajero estadounidense y necesito asistencia médica en Argentina.",
  );

  return (
    <>
      <Navbar />
      <main className="animate-segmentFade">
        {/* ── Institutional Banner ──────────────────────────── */}
        <div
          className="border-b-[3px]"
          style={{ borderImage: "linear-gradient(to right, #003087, #BF0A30, #003087) 1" }}
        >
          <div className="max-w-[960px] mx-auto px-6 py-3 flex items-center justify-center gap-3 text-center">
            <Shield className="w-4 h-4 text-[#003087] shrink-0" />
            <p className="text-[11px] font-bold tracking-[1.5px] text-[#003087] uppercase">
              {et("banner.text")}
            </p>
          </div>
        </div>

        {/* ── Hero ──────────────────────────────────────────── */}
        <section className="px-6 pt-16 pb-20 max-w-[1000px] mx-auto">
          <div className="text-center">
            <p className="text-[11px] font-bold tracking-[2px] text-celeste uppercase mb-4">
              {et("hero.label")}
            </p>
            <h1 className="text-[clamp(32px,5vw,52px)] font-bold text-ink leading-[1.1] mb-6">
              {et("hero.title1")}
              <br />
              <em className="not-italic text-celeste-dark">{et("hero.title2")}</em>
            </h1>

            <p className="text-lg text-ink-light leading-[1.7] max-w-[700px] mx-auto mb-8">
              {et("hero.subtitle")}
            </p>

            {/* Key metrics */}
            <div className="flex flex-wrap justify-center gap-6 mb-10">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-full text-sm text-ink"
                >
                  <BadgeCheck className="w-4 h-4 text-celeste-dark shrink-0" />
                  <span className="font-semibold">{et(`hero.metric${i}`)}</span>
                </div>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={embassyEmail}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-bold text-white bg-celeste-dark hover:bg-celeste rounded-[4px] transition"
              >
                {et("hero.cta")} <ArrowRight className="w-4 h-4" />
              </a>
              <Link
                href="/paciente"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-semibold text-ink-light border-[1.5px] border-border hover:border-celeste-dark hover:text-celeste-dark rounded-[4px] transition"
              >
                {et("hero.ctaSecondary")}
              </Link>
            </div>
          </div>
        </section>

        {/* ── The Problem ───────────────────────────────────── */}
        <section className="px-6 py-20 border-t border-border">
          <div className="max-w-[960px] mx-auto">
            <p className="text-[11px] font-bold tracking-[2px] text-celeste uppercase mb-2.5">
              {et("problem.kicker")}
            </p>
            <h2 className="text-[clamp(24px,3vw,36px)] font-bold text-ink mb-4 leading-[1.2]">
              {et("problem.title")}{" "}
              <em className="not-italic text-celeste-dark">{et("problem.titleEm")}</em>
            </h2>
            <p className="text-[15px] text-ink-light leading-[1.7] max-w-[640px] mb-10">
              {et("problem.subtitle")}
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {PAIN_POINTS.map(({ icon: Icon, color }, i) => (
                <div
                  key={i}
                  className={`border-l-[3px] ${color} bg-white border border-border rounded-lg p-5 hover:shadow-sm transition`}
                >
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-red-400" />
                    </div>
                    <h3 className="font-bold text-sm text-ink">{et(`problem.p${i}.title`)}</h3>
                  </div>
                  <p className="text-[13px] text-ink-light leading-relaxed">
                    {et(`problem.p${i}.desc`)}
                  </p>
                </div>
              ))}
            </div>

            {/* Callout stat */}
            <div className="mt-8 bg-celeste-pale/40 border border-celeste/20 rounded-xl p-6 text-center">
              <div className="flex items-center justify-center gap-3 mb-2">
                <AlertTriangle className="w-5 h-5 text-celeste-dark" />
                <p className="text-[32px] font-bold text-celeste-dark leading-none">
                  {et("problem.stat.num")}
                </p>
              </div>
              <p className="text-sm text-ink-light">{et("problem.stat.desc")}</p>
            </div>
          </div>
        </section>

        {/* ── The Solution ──────────────────────────────────── */}
        <section className="px-6 py-20 bg-celeste-pale/50 border-t border-border">
          <div className="max-w-[960px] mx-auto">
            <p className="text-[11px] font-bold tracking-[2px] text-celeste uppercase mb-2.5">
              {et("solution.kicker")}
            </p>
            <h2 className="text-[clamp(24px,3vw,36px)] font-bold text-ink mb-4 leading-[1.2]">
              {et("solution.title")}{" "}
              <em className="not-italic text-celeste-dark">{et("solution.titleEm")}</em>
            </h2>
            <p className="text-[15px] text-ink-light leading-[1.7] max-w-[640px] mb-10">
              {et("solution.subtitle")}
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {SOLUTION_FEATURES.map(({ icon: Icon }, i) => {
                const accent = i % 2 === 0 ? "border-celeste" : "border-celeste-light";
                return (
                  <div
                    key={i}
                    className={`border-l-[3px] ${accent} bg-white border border-border rounded-lg p-5 hover:shadow-sm transition`}
                  >
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-celeste-pale flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-celeste-dark" />
                      </div>
                      <h3 className="font-bold text-sm text-ink">{et(`solution.f${i}.title`)}</h3>
                    </div>
                    <p className="text-[13px] text-ink-light leading-relaxed">
                      {et(`solution.f${i}.desc`)}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Pricing callout */}
            <div className="mt-8 bg-white border border-border rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold tracking-[2px] text-celeste uppercase mb-1">
                  {et("solution.priceLabel")}
                </p>
                <p className="text-[32px] font-bold text-celeste-dark leading-none">USD 30</p>
                <p className="text-sm text-ink-light mt-1">{et("solution.priceDesc")}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {["Visa", "Mastercard", "Amex", "MercadoPago"].map((card) => (
                  <span
                    key={card}
                    className="px-3 py-1 text-[11px] font-semibold text-ink-muted bg-surface border border-border rounded"
                  >
                    {card}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Emergency Protocol ─────────────────────────────── */}
        <section className="px-6 py-20 border-t border-border">
          <div className="max-w-[900px] mx-auto">
            <p className="text-[11px] font-bold tracking-[2px] text-celeste uppercase mb-2.5">
              {et("protocol.kicker")}
            </p>
            <h2 className="text-[clamp(24px,3vw,36px)] font-bold text-ink mb-4 leading-[1.2]">
              {et("protocol.title")}{" "}
              <em className="not-italic text-celeste-dark">{et("protocol.titleEm")}</em>
            </h2>
            <p className="text-[15px] text-ink-light leading-[1.7] max-w-[640px] mb-12">
              {et("protocol.subtitle")}
            </p>

            <div className="space-y-6">
              {PROTOCOL_STEPS.map(({ icon: Icon }, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-xl bg-celeste-pale flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-celeste-dark" />
                    </div>
                    {i < PROTOCOL_STEPS.length - 1 && (
                      <div className="w-px flex-1 bg-celeste/30 mt-2" />
                    )}
                  </div>
                  <div className="pb-6">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-bold tracking-wider text-celeste-dark/60 uppercase">
                        {isEn ? "Step" : "Paso"} {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-[10px] text-ink-muted">
                        {et(`protocol.s${i}.time`)}
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-ink mb-1.5">
                      {et(`protocol.s${i}.title`)}
                    </h3>
                    <p className="text-[13px] text-ink-light leading-relaxed">
                      {et(`protocol.s${i}.desc`)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Emergency callout */}
            <div className="mt-8 bg-green-50 border border-green-200 rounded-xl p-6 text-center">
              <p className="text-sm font-bold text-green-700 mb-1">{et("protocol.result")}</p>
              <p className="text-[13px] text-green-600">{et("protocol.resultDesc")}</p>
            </div>
          </div>
        </section>

        {/* ── Network Stats ──────────────────────────────────── */}
        <section className="px-6 py-20 bg-celeste-pale/50 border-t border-border">
          <div className="max-w-[960px] mx-auto">
            <p className="text-[11px] font-bold tracking-[2px] text-celeste uppercase mb-2.5">
              {et("network.kicker")}
            </p>
            <h2 className="text-[clamp(24px,3vw,36px)] font-bold text-ink mb-10 leading-[1.2]">
              {et("network.title")}{" "}
              <em className="not-italic text-celeste-dark">{et("network.titleEm")}</em>
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {NETWORK_STATS.map(({ icon: Icon }, i) => (
                <div
                  key={i}
                  className="bg-white border border-border rounded-xl p-5 hover:border-celeste/40 hover:shadow-sm transition text-center"
                >
                  <div className="w-10 h-10 rounded-lg bg-celeste-pale flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-5 h-5 text-celeste-dark" />
                  </div>
                  <div className="text-[32px] font-bold text-celeste-dark leading-none">
                    {et(`network.n${i}.num`)}
                  </div>
                  <div className="text-xs font-semibold text-ink mt-1.5">
                    {et(`network.n${i}.label`)}
                  </div>
                </div>
              ))}
            </div>

            {/* Compliance badges */}
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border border-border rounded-lg"
                >
                  <BadgeCheck className="w-4 h-4 text-celeste-dark shrink-0" />
                  <span className="text-[12px] font-semibold text-ink">
                    {et(`network.badge${i}`)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Endorsement Request ─────────────────────────────── */}
        <section className="px-6 py-20 border-t border-border">
          <div className="max-w-[900px] mx-auto">
            <p className="text-[11px] font-bold tracking-[2px] text-celeste uppercase mb-2.5">
              {et("endorsement.kicker")}
            </p>
            <h2 className="text-[clamp(24px,3vw,36px)] font-bold text-ink mb-4 leading-[1.2]">
              {et("endorsement.title")}{" "}
              <em className="not-italic text-celeste-dark">{et("endorsement.titleEm")}</em>
            </h2>
            <p className="text-[15px] text-ink-light leading-[1.7] max-w-[640px] mb-10">
              {et("endorsement.subtitle")}
            </p>

            <div className="grid md:grid-cols-3 gap-4">
              {ENDORSEMENT_ASKS.map(({ icon: Icon }, i) => (
                <div
                  key={i}
                  className="border-l-[3px] border-celeste bg-white border border-border rounded-lg p-5 hover:shadow-sm transition"
                >
                  <div className="w-10 h-10 rounded-lg bg-celeste-pale flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-celeste-dark" />
                  </div>
                  <h3 className="font-bold text-sm text-ink mb-2">
                    {et(`endorsement.ask${i}.title`)}
                  </h3>
                  <p className="text-[13px] text-ink-light leading-relaxed">
                    {et(`endorsement.ask${i}.desc`)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Contact / CTA ──────────────────────────────────── */}
        <section className="px-6 py-20 bg-celeste-pale/40 border-t border-border">
          <div className="max-w-[800px] mx-auto text-center">
            <p className="text-[11px] font-bold tracking-[2px] text-celeste uppercase mb-3">
              {et("cta.kicker")}
            </p>
            <h2 className="text-[clamp(24px,3.5vw,40px)] font-bold text-ink mb-4 leading-[1.2]">
              {et("cta.title")}
              <br />
              <em className="not-italic text-celeste-dark">{et("cta.titleEm")}</em>
            </h2>
            <p className="text-[15px] text-ink-muted leading-[1.7] max-w-[560px] mx-auto mb-8">
              {et("cta.subtitle")}
            </p>

            {/* Contact card */}
            <div className="bg-white border border-border rounded-xl p-6 mb-8 max-w-md mx-auto text-left">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-celeste-pale flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-celeste-dark" />
                </div>
                <div>
                  <p className="font-bold text-sm text-ink">{et("cta.contactTitle")}</p>
                  <p className="text-[12px] text-ink-muted">{et("cta.contactSub")}</p>
                </div>
              </div>
              <a
                href={embassyEmail}
                className="block text-celeste-dark font-semibold text-sm hover:underline mb-2"
              >
                embassy@condorsalud.com.ar
              </a>
              <p className="text-[11px] text-ink-muted">{et("cta.cuit")}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={embassyEmail}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-bold text-white bg-celeste-dark hover:bg-celeste rounded-[4px] transition"
              >
                {et("cta.primary")} <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href={emergencyWA}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-semibold text-ink border-[1.5px] border-border hover:border-celeste-dark hover:text-celeste-dark rounded-[4px] transition"
              >
                {et("cta.secondary")}
              </a>
            </div>
            <p className="text-xs text-ink-muted mt-5">{et("cta.note")}</p>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/i18n/context";
import { whatsappUrl } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import {
  ArrowRight,
  Bell,
  Brain,
  Building2,
  Calendar,
  Car,
  Check,
  ChevronDown,
  Clock,
  Code,
  CreditCard,
  Globe2,
  HeartPulse,
  Languages,
  Link2,
  MapPin,
  MessageSquare,
  Phone,
  Pill,
  Plane,
  Shield,
  Star,
  Stethoscope,
  TrendingUp,
  Users,
  Video,
  Zap,
} from "lucide-react";

/* ─── Revenue Calculator ──────────────────────────────────── */

function RevenueCalculator({ pt }: { pt: (k: string) => string }) {
  const [travelers, setTravelers] = useState(200);
  const monthly = Math.round(travelers * 30 * 0.2);

  return (
    <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
      <p className="text-[11px] font-bold tracking-[2px] text-celeste uppercase mb-1">
        {pt("calc.label")}
      </p>
      <h3 className="font-bold text-ink text-base mb-4">{pt("calc.title")}</h3>
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-ink-light">{pt("calc.perMonth")}</span>
          <span className="text-2xl font-bold text-celeste-dark font-display">
            {travelers.toLocaleString()}
          </span>
        </div>
        <input
          type="range"
          min={10}
          max={2000}
          step={10}
          value={travelers}
          onChange={(e) => setTravelers(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer accent-celeste-dark"
        />
        <div className="flex justify-between text-[10px] text-ink-muted mt-1">
          <span>10</span>
          <span>2,000+</span>
        </div>
      </div>
      <div className="bg-celeste-pale border border-celeste/20 rounded-lg p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-ink-muted mb-0.5">{pt("calc.resultLabel")}</p>
          <p className="text-3xl font-bold text-celeste-dark font-display">
            USD {monthly.toLocaleString()}
          </p>
          <p className="text-[10px] text-ink-muted mt-1">
            {travelers.toLocaleString()} {pt("calc.resultSub")}
          </p>
        </div>
        <div className="w-14 h-14 rounded-xl bg-white border border-celeste/30 flex items-center justify-center shrink-0">
          <TrendingUp className="w-6 h-6 text-celeste-dark" />
        </div>
      </div>
      <p className="text-[10px] text-ink-muted mt-3">{pt("calc.disclaimer")}</p>
    </div>
  );
}

/* ─── Tourist Demo ────────────────────────────────────────── */

function TouristDemo({ pt, isEn }: { pt: (k: string) => string; isEn: boolean }) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      icon: <CreditCard className="w-4 h-4 text-celeste-dark" />,
      label: pt("demo.step0.label"),
      desc: pt("demo.step0.desc"),
      screen: (
        <div className="space-y-2">
          <div className="bg-celeste-pale border border-celeste/20 rounded-lg p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-celeste-dark flex items-center justify-center shrink-0">
              <HeartPulse className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-ink">
                Cóndor Salud — {isEn ? "Medical access" : "Acceso médico"}
              </p>
              <p className="text-[10px] text-ink-muted">
                {isEn ? "30 days · Full network · English" : "30 días · Red completa · Inglés"}
              </p>
            </div>
            <p className="text-sm font-bold text-celeste-dark">$30</p>
          </div>
          <div className="bg-white border border-border rounded-lg p-3 flex items-center gap-3 opacity-40">
            <div className="w-8 h-8 rounded bg-surface flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4 text-ink-muted" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-ink">
                {isEn ? "Basic travel insurance" : "Seguro de viaje básico"}
              </p>
              <p className="text-[10px] text-ink-muted">
                {isEn ? "Standard coverage" : "Cobertura estándar"}
              </p>
            </div>
            <p className="text-sm font-bold text-ink-muted">$45</p>
          </div>
          <div className="bg-celeste-dark rounded-lg p-2.5 text-center">
            <p className="text-xs font-bold text-white">
              {isEn ? "Confirm booking →" : "Confirmar reserva →"}
            </p>
          </div>
        </div>
      ),
    },
    {
      icon: <Bell className="w-4 h-4 text-celeste-dark" />,
      label: pt("demo.step1.label"),
      desc: pt("demo.step1.desc"),
      screen: (
        <div className="space-y-2">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-[10px] font-bold text-green-700 mb-1">
              ✓ {isEn ? "Payment confirmed" : "Pago confirmado"}
            </p>
            <p className="text-xs text-ink font-semibold">
              {isEn
                ? "Your Cóndor Salud membership is active"
                : "Tu membresía de Cóndor Salud está activa"}
            </p>
            <p className="text-[10px] text-ink-muted">
              {isEn ? "Valid for 30 days from today" : "Válida por 30 días desde hoy"}
            </p>
          </div>
          <div className="bg-white border border-border rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded bg-celeste-pale flex items-center justify-center">
                <HeartPulse className="w-3 h-3 text-celeste-dark" />
              </div>
              <p className="text-[10px] font-semibold text-ink">
                CÓNDOR <span className="text-gold">SALUD</span>
              </p>
            </div>
            <p className="text-[10px] text-ink-muted">Member ID</p>
            <p className="text-xs font-mono font-bold text-ink">CS-2026-047821</p>
          </div>
          <div className="bg-celeste-dark rounded-lg p-2.5 text-center">
            <p className="text-xs font-bold text-white">
              {isEn ? "Open patient portal →" : "Abrir portal de pacientes →"}
            </p>
          </div>
        </div>
      ),
    },
    {
      icon: <MapPin className="w-4 h-4 text-celeste-dark" />,
      label: pt("demo.step2.label"),
      desc: pt("demo.step2.desc"),
      screen: (
        <div className="space-y-2">
          <div className="bg-celeste-pale border border-celeste/20 rounded-lg p-2.5 flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-celeste-dark shrink-0" />
            <p className="text-xs text-ink-light">Buenos Aires, Argentina</p>
          </div>
          {[
            {
              name: "Dr. Martín Rodríguez",
              spec: isEn ? "General Practitioner" : "Médico General",
              dist: "0.8 km",
            },
            {
              name: "Dra. Laura Fernández",
              spec: isEn ? "Internal Medicine" : "Medicina Interna",
              dist: "1.2 km",
            },
          ].map((doc, i) => (
            <div key={i} className="bg-white border border-border rounded-lg p-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-ink">{doc.name}</p>
                  <p className="text-[10px] text-ink-muted">{doc.spec}</p>
                </div>
                <span className="text-[9px] bg-green-50 text-green-700 border border-green-200 rounded px-1.5 py-0.5 font-semibold shrink-0">
                  {isEn ? "Available now" : "Disponible"}
                </span>
              </div>
              <div className="flex items-center gap-1 mt-1.5">
                <MapPin className="w-2.5 h-2.5 text-ink-muted" />
                <p className="text-[9px] text-ink-muted">{doc.dist}</p>
                <span className="text-[9px] text-ink-muted mx-1">·</span>
                <Languages className="w-2.5 h-2.5 text-ink-muted" />
                <p className="text-[9px] text-ink-muted">English</p>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      icon: <Calendar className="w-4 h-4 text-celeste-dark" />,
      label: pt("demo.step3.label"),
      desc: pt("demo.step3.desc"),
      screen: (
        <div className="space-y-2">
          <div className="bg-white border border-border rounded-lg p-3">
            <p className="text-xs font-semibold text-ink mb-2">
              {isEn ? "Book appointment" : "Reservar turno"}
            </p>
            <p className="text-[10px] text-ink-muted mb-1">Dr. Martín Rodríguez</p>
            <div className="grid grid-cols-3 gap-1 mb-2">
              {["9:00", "10:30", "14:00", "15:30", "16:00", "17:30"].map((time, i) => (
                <div
                  key={i}
                  className={`text-[10px] py-1 rounded border text-center font-medium ${
                    i === 1
                      ? "bg-celeste-dark text-white border-celeste-dark"
                      : "border-border text-ink-light"
                  }`}
                >
                  {time}
                </div>
              ))}
            </div>
            <div className="bg-celeste-dark rounded p-2 text-center">
              <p className="text-[10px] font-bold text-white">
                {isEn ? "Confirm — $0 (covered) →" : "Confirmar — $0 (cubierto) →"}
              </p>
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-2.5 text-center">
            <p className="text-[10px] font-semibold text-green-700">
              ✓{" "}
              {isEn
                ? "Appointment confirmed · Reminder set"
                : "Turno confirmado · Recordatorio activado"}
            </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white border border-border rounded-xl overflow-hidden shadow-sm">
      {/* Browser chrome */}
      <div className="bg-[#F0F4F7] border-b border-border px-4 py-2.5 flex items-center gap-3">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-gold" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="bg-white border border-border rounded px-3 py-0.5 text-[10px] text-ink-muted">
            condorsalud.com/paciente
          </div>
        </div>
      </div>

      {/* Step tabs */}
      <div className="flex border-b border-border">
        {steps.map((s, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 px-1 text-[10px] font-semibold transition border-b-2 ${
              step === i
                ? "border-celeste-dark text-celeste-dark"
                : "border-transparent text-ink-muted hover:text-celeste-dark"
            }`}
          >
            <span>{s.icon}</span>
            <span className="leading-tight text-center">{s.label}</span>
          </button>
        ))}
      </div>

      {/* Screen */}
      <div className="p-4">
        <p className="text-[12px] text-ink-light mb-3 leading-relaxed">{steps[step]?.desc}</p>
        <div className="bg-surface border border-border rounded-lg p-3">{steps[step]?.screen}</div>
      </div>

      {/* Navigation */}
      <div className="px-4 pb-4 flex justify-between items-center">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="text-[11px] text-ink-muted disabled:opacity-30 hover:text-celeste-dark transition"
        >
          {pt("demo.prev")}
        </button>
        <div className="flex gap-1.5">
          {steps.map((_, i) => (
            <span
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition ${
                i === step ? "bg-celeste-dark" : "bg-border"
              }`}
            />
          ))}
        </div>
        <button
          onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
          disabled={step === steps.length - 1}
          className="text-[11px] text-ink-muted disabled:opacity-30 hover:text-celeste-dark transition"
        >
          {pt("demo.next")}
        </button>
      </div>
    </div>
  );
}

/* ─── Partner Form ────────────────────────────────────────── */

function PartnerForm({ pt }: { pt: (k: string) => string }) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    company: "",
    name: "",
    email: "",
    type: "",
    volume: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/partners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    }).catch(() => {});
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="bg-white border border-border rounded-xl p-8 text-center shadow-sm">
        <div className="w-14 h-14 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-4">
          <Check className="w-6 h-6 text-green-600" />
        </div>
        <h3 className="font-bold text-lg text-ink mb-2">{pt("form.successTitle")}</h3>
        <p className="text-sm text-ink-light max-w-xs mx-auto leading-relaxed">
          {pt("form.successSub")}
        </p>
        <p className="text-xs text-ink-muted mt-4">{form.email}</p>
      </div>
    );
  }

  const inputCls =
    "w-full px-4 py-3.5 bg-surface border border-border text-ink text-sm rounded focus:outline-none focus:border-celeste focus:ring-1 focus:ring-celeste placeholder:text-ink-muted";

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-border rounded-xl p-6 shadow-sm space-y-3"
    >
      <div className="grid sm:grid-cols-2 gap-3">
        <input
          required
          type="text"
          placeholder={pt("form.company")}
          value={form.company}
          onChange={(e) => setForm({ ...form, company: e.target.value })}
          className={inputCls}
        />
        <input
          required
          type="text"
          placeholder={pt("form.name")}
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className={inputCls}
        />
      </div>
      <input
        required
        type="email"
        placeholder={pt("form.email")}
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        className={inputCls}
      />
      <div className="grid sm:grid-cols-2 gap-3">
        <select
          required
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          className={inputCls}
        >
          <option value="" disabled>
            {pt("form.type")}
          </option>
          <option value="agencia">{pt("form.type0")}</option>
          <option value="aerolinea">{pt("form.type1")}</option>
          <option value="ota">{pt("form.type2")}</option>
          <option value="dmc">{pt("form.type3")}</option>
          <option value="otro">{pt("form.type4")}</option>
        </select>
        <select
          required
          value={form.volume}
          onChange={(e) => setForm({ ...form, volume: e.target.value })}
          className={inputCls}
        >
          <option value="" disabled>
            {pt("form.volume")}
          </option>
          <option value="lt50">{pt("form.vol0")}</option>
          <option value="50-200">{pt("form.vol1")}</option>
          <option value="200-500">{pt("form.vol2")}</option>
          <option value="500-2000">{pt("form.vol3")}</option>
          <option value="gt2000">{pt("form.vol4")}</option>
        </select>
      </div>
      <textarea
        rows={3}
        placeholder={pt("form.message")}
        value={form.message}
        onChange={(e) => setForm({ ...form, message: e.target.value })}
        className={`${inputCls} resize-none`}
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full px-7 py-3.5 bg-celeste-dark text-white font-bold text-sm rounded-[4px] hover:bg-celeste transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            {pt("form.submit")} <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
      <p className="text-[10px] text-ink-muted text-center">
        {pt("form.legal")}{" "}
        <Link href="/privacidad" className="text-celeste-dark underline">
          {pt("form.legalLink")}
        </Link>
      </p>
    </form>
  );
}

/* ─── FAQ Accordion ───────────────────────────────────────── */

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-celeste-pale/30 transition"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-ink pr-4">{q}</span>
        <ChevronDown
          className={`w-4 h-4 text-ink-muted shrink-0 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-200 ease-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-5 pb-4">
            <p className="text-[13px] text-ink-light leading-[1.7]">{a}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Static data ─────────────────────────────────────────── */

const STAT_ICONS = [CreditCard, Clock, TrendingUp, Zap];
const IDEAL_ICONS = [Plane, Building2, Globe2, MapPin, Users];
const BENEFIT_ICONS = [Languages, MapPin, Phone, Shield, Star];
const FEATURE_ICONS = [Stethoscope, Video, MessageSquare, Pill, MapPin, Brain];
const WHY_ICONS = [CreditCard, Globe2, Zap, Shield, TrendingUp, Users];

/* ─── Page ────────────────────────────────────────────────── */

export default function PartnersPage() {
  const { t, isEn, setSegment } = useLocale();
  const pt = (key: string) => t(`partners.${key}`);

  useEffect(() => {
    setSegment("tourist");
  }, [setSegment]);

  const demoWA = whatsappUrl(
    isEn
      ? "Hi, I'm interested in the Cóndor Salud travel partnership."
      : "Hola, me interesa la alianza de viajes de Cóndor Salud.",
  );

  return (
    <>
      <Navbar />
      <main className="animate-segmentFade">
        {/* ── Hero ──────────────────────────────────────────── */}
        <section className="px-6 pt-16 pb-20 max-w-[1000px] mx-auto">
          {/* Announcement pill */}
          <div className="flex justify-center mb-8">
            <Link
              href="/paciente"
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-celeste-pale border border-celeste/20 rounded-full text-xs hover:bg-celeste-100 hover:border-celeste/40 transition"
            >
              <span className="w-2 h-2 bg-celeste-dark rounded-full animate-pulse" />
              <span className="text-ink-light">{pt("hero.badge")}</span>
              <ArrowRight className="w-3 h-3 text-celeste-dark" />
            </Link>
          </div>

          <div className="text-center">
            <p className="text-[11px] font-bold tracking-[2px] text-celeste uppercase mb-4">
              {pt("hero.label")}
            </p>
            <h1 className="text-[clamp(32px,5vw,52px)] font-bold text-ink leading-[1.1] mb-6">
              {pt("hero.title1")}
              <br />
              <em className="not-italic text-celeste-dark">{pt("hero.title2")}</em>
            </h1>

            <p className="text-lg text-ink-light leading-[1.7] max-w-[660px] mx-auto mb-8">
              {pt("hero.subtitle")}
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
              <a
                href="#form"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-bold text-white bg-celeste-dark hover:bg-celeste rounded-[4px] transition"
              >
                {pt("hero.cta")} <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#demo"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-semibold text-ink-light border-[1.5px] border-border hover:border-celeste-dark hover:text-celeste-dark rounded-[4px] transition"
              >
                {pt("hero.ctaSecondary")}
              </a>
            </div>
            <p className="text-[11px] text-ink-muted mb-10">{pt("cta.note")}</p>

            {/* Ideal for pills */}
            <div className="mt-6">
              <p className="text-[10px] font-bold tracking-[2px] text-ink-muted uppercase mb-4">
                {pt("hero.idealLabel")}
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {IDEAL_ICONS.map((Icon, i) => (
                  <div
                    key={i}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-full text-sm text-ink-light"
                  >
                    <Icon className="w-4 h-4 text-celeste-dark" />
                    {pt(`hero.ideal${i}`)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats ─────────────────────────────────────────── */}
        <section className="px-6 mb-16">
          <div className="max-w-[960px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
            {STAT_ICONS.map((Icon, i) => (
              <div
                key={i}
                className="bg-white border border-border rounded-xl p-5 hover:border-celeste/40 hover:shadow-sm transition text-center"
              >
                <div className="w-10 h-10 rounded-lg bg-celeste-pale flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-5 h-5 text-celeste-dark" />
                </div>
                <div className="text-[32px] font-bold text-celeste-dark leading-none">
                  {pt(`stats.s${i}.num`)}
                </div>
                <div className="text-xs font-semibold text-ink mt-1.5 mb-1">
                  {pt(`stats.s${i}.label`)}
                </div>
                <p className="text-[11px] text-ink-muted leading-snug">{pt(`stats.s${i}.sub`)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Tourist Experience Demo ───────────────────────── */}
        <section id="demo" className="px-6 py-20 border-t border-border">
          <div className="max-w-[960px] mx-auto">
            <p className="text-[11px] font-bold tracking-[2px] text-celeste uppercase mb-2.5">
              {pt("demo.kicker")}
            </p>
            <h2 className="text-[clamp(24px,3vw,36px)] font-bold text-ink mb-4 leading-[1.2]">
              {pt("demo.title")}{" "}
              <em className="not-italic text-celeste-dark">{pt("demo.titleEm")}</em>
            </h2>
            <p className="text-[15px] text-ink-light leading-[1.7] max-w-[640px] mb-10">
              {pt("demo.subtitle")}
            </p>

            <div className="grid md:grid-cols-2 gap-10 items-start">
              <TouristDemo pt={pt} isEn={isEn} />

              <div className="space-y-5">
                {BENEFIT_ICONS.map((Icon, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-celeste-pale flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-5 h-5 text-celeste-dark" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-ink mb-0.5">
                        {pt(`demo.benefit${i}.title`)}
                      </p>
                      <p className="text-[13px] text-ink-light leading-relaxed">
                        {pt(`demo.benefit${i}.desc`)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Product Features ──────────────────────────────── */}
        <section className="px-6 py-20 bg-celeste-pale/50 border-t border-border">
          <div className="max-w-[960px] mx-auto">
            <p className="text-[11px] font-bold tracking-[2px] text-celeste uppercase mb-2.5">
              {pt("features.kicker")}
            </p>
            <h2 className="text-[clamp(24px,3vw,36px)] font-bold text-ink mb-4 leading-[1.2]">
              {pt("features.title")}{" "}
              <em className="not-italic text-celeste-dark">{pt("features.titleEm")}</em>
            </h2>
            <p className="text-[15px] text-ink-light leading-[1.7] max-w-[640px] mb-10">
              {pt("features.subtitle")}
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {FEATURE_ICONS.map((Icon, i) => {
                const accent =
                  i % 2 === 0
                    ? "border-celeste bg-celeste-pale/60"
                    : "border-celeste-light bg-white";
                return (
                  <div
                    key={i}
                    className={`border-l-[3px] ${accent} border border-border rounded-lg p-5 hover:shadow-sm transition`}
                  >
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-white/80 border border-celeste/20 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-celeste-dark" />
                      </div>
                      <h3 className="font-bold text-sm text-ink">{pt(`features.f${i}.title`)}</h3>
                    </div>
                    <p className="text-[13px] text-ink-light leading-relaxed mb-3">
                      {pt(`features.f${i}.desc`)}
                    </p>
                    <span className="inline-block text-[10px] font-bold text-celeste-dark bg-celeste-pale px-2 py-0.5 rounded">
                      {pt(`features.f${i}.tag`)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="text-center mt-8">
              <Link
                href="/paciente"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-celeste-dark border border-celeste-dark rounded-[4px] hover:bg-celeste-pale transition"
              >
                {pt("hero.ctaSecondary")} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── Why Partner + Revenue Calculator ──────────────── */}
        <section className="px-6 py-20 border-t border-border">
          <div className="max-w-[960px] mx-auto">
            <p className="text-[11px] font-bold tracking-[2px] text-celeste uppercase mb-2.5">
              {pt("why.kicker")}
            </p>
            <h2 className="text-[clamp(24px,3vw,36px)] font-bold text-ink mb-4 leading-[1.2]">
              {pt("why.title")}{" "}
              <em className="not-italic text-celeste-dark">{pt("why.titleEm")}</em>
            </h2>

            <div className="grid md:grid-cols-2 gap-10 mt-10">
              {/* Benefits list */}
              <div className="space-y-4">
                {WHY_ICONS.map((Icon, i) => (
                  <div
                    key={i}
                    className="border-l-[3px] border-celeste bg-white border border-border rounded-lg p-5 hover:shadow-sm transition"
                  >
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="w-7 h-7 rounded-lg bg-celeste-pale flex items-center justify-center shrink-0">
                        <Icon className="w-3.5 h-3.5 text-celeste-dark" />
                      </div>
                      <h3 className="font-bold text-sm text-ink">{pt(`why.w${i}.title`)}</h3>
                    </div>
                    <p className="text-[13px] text-ink-light leading-relaxed pl-9">
                      {pt(`why.w${i}.desc`)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Calculator + how it works */}
              <div className="space-y-5">
                <RevenueCalculator pt={pt} />

                <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
                  <p className="text-[11px] font-bold tracking-[2px] text-celeste uppercase mb-4">
                    {pt("how.kicker")}
                  </p>
                  <div className="space-y-4">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className="flex gap-4">
                        <div className="w-12 h-12 rounded-xl bg-celeste-pale flex items-center justify-center shrink-0">
                          <span className="text-[11px] font-bold tracking-wider text-celeste-dark/60 uppercase">
                            0{i + 1}
                          </span>
                        </div>
                        <div className="pt-2">
                          <p className="font-bold text-sm text-ink mb-0.5">
                            {pt(`how.step${i}.title`)}
                          </p>
                          <p className="text-[12px] text-ink-light">{pt(`how.step${i}.desc`)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 bg-celeste-pale border border-celeste/20 rounded-lg px-4 py-2.5 text-center">
                    <p className="text-[11px] font-semibold text-celeste-dark">{pt("how.badge")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Partner Form ──────────────────────────────────── */}
        <section id="form" className="px-6 py-20 bg-celeste-pale/30 border-t border-border">
          <div className="max-w-[800px] mx-auto">
            <div className="text-center mb-10">
              <p className="text-[11px] font-bold tracking-[2px] text-celeste uppercase mb-2.5">
                {pt("form.kicker")}
              </p>
              <h2 className="text-[clamp(24px,3vw,36px)] font-bold text-ink mb-4 leading-[1.2]">
                {pt("form.title")}{" "}
                <em className="not-italic text-celeste-dark">{pt("form.titleEm")}</em>
              </h2>
              <p className="text-[15px] text-ink-muted leading-[1.7] max-w-[520px] mx-auto">
                {pt("form.subtitle")}
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-6 mb-8">
              {[Clock, Shield, Users].map((Icon, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-celeste-dark" />
                  <span className="text-xs text-ink-muted font-medium">
                    {pt(`form.benefit${i}`)}
                  </span>
                </div>
              ))}
            </div>

            <PartnerForm pt={pt} />
          </div>
        </section>

        {/* ── FAQ ────────────────────────────────────────────── */}
        <section className="px-6 py-20 border-t border-border">
          <div className="max-w-[720px] mx-auto">
            <p className="text-[11px] font-bold tracking-[2px] text-celeste uppercase mb-2.5">
              {pt("faq.kicker")}
            </p>
            <h2 className="text-[clamp(24px,3vw,36px)] font-bold text-ink mb-10 leading-[1.2]">
              {pt("faq.title")}
            </h2>
            <div className="space-y-1">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <FaqItem key={i} q={pt(`faq.q${i}`)} a={pt(`faq.a${i}`)} />
              ))}
            </div>
          </div>
        </section>

        {/* ── Final CTA ──────────────────────────────────────── */}
        <section className="px-6 py-20 bg-celeste-pale/40 border-t border-border">
          <div className="max-w-[800px] mx-auto text-center">
            <p className="text-[11px] font-bold tracking-[2px] text-celeste uppercase mb-3">
              {pt("cta.kicker")}
            </p>
            <h2 className="text-[clamp(24px,3.5vw,40px)] font-bold text-ink mb-4 leading-[1.2]">
              {pt("cta.title")}
              <br />
              <em className="not-italic text-celeste-dark">{pt("cta.titleEm")}</em>
            </h2>
            <p className="text-[15px] text-ink-muted leading-[1.7] max-w-[560px] mx-auto mb-8">
              {pt("cta.subtitle")}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="#form"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-bold text-white bg-celeste-dark hover:bg-celeste rounded-[4px] transition"
              >
                {pt("cta.primary")} <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href={demoWA}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-semibold text-ink border-[1.5px] border-border hover:border-celeste-dark hover:text-celeste-dark rounded-[4px] transition"
              >
                {pt("cta.secondary")}
              </a>
            </div>
            <p className="text-xs text-ink-muted mt-5">{pt("cta.note")}</p>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}

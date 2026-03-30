"use client";

import { useState, useEffect } from "react";
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
  Bell,
  Brain,
  Building2,
  Car,
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
  Star,
  Stethoscope,
  Users,
  Video,
  WifiOff,
  Zap,
} from "lucide-react";

/* ─── Cora Conversation Demo (Embassy) ────────────────────── */

function CoraConversationDemo({ et, isEn }: { et: (k: string) => string; isEn: boolean }) {
  const tabs = [et("cora.tab0"), et("cora.tab1"), et("cora.tab2")];
  const [active, setActive] = useState(0);

  type Msg = {
    from: "user" | "cora";
    text: string;
    cards?: { name: string; rating: string; spec: string; dist: string }[];
    rides?: { name: string; time: string; price: string; color: string }[];
  };

  const convos: Msg[][] = [
    // Scenario 0 — Symptom triage
    [
      {
        from: "user",
        text: isEn
          ? "I have a bad headache and slight fever since yesterday"
          : "Tengo dolor de cabeza fuerte y algo de fiebre desde ayer",
      },
      {
        from: "cora",
        text: isEn
          ? "I'm sorry you're not feeling well. Let me ask a few questions to help you. On a scale of 1–10, how would you rate your headache?"
          : "Lamento que no te sientas bien. Déjame hacerte unas preguntas. Del 1 al 10, ¿cómo calificarías tu dolor de cabeza?",
      },
      {
        from: "user",
        text: isEn
          ? "About a 6. And my temperature is 37.8°C"
          : "Como un 6. Y mi temperatura es 37.8°C",
      },
      {
        from: "cora",
        text: isEn
          ? "With moderate headache and low-grade fever for 24h, I recommend:\n\nIbuprofen 400mg (every 8h with food)\nPlenty of fluids\nCold compress on forehead\n\nThis is likely viral. If fever exceeds 38.5°C or symptoms worsen in 48h, I'll connect you with a doctor."
          : "Con dolor moderado y fiebre baja por 24h, te recomiendo:\n\nIbuprofeno 400mg (cada 8h con comida)\nMucho líquido\nCompresa fría en la frente\n\nProbablemente sea viral. Si la fiebre supera 38.5°C o los síntomas empeoran en 48h, te conecto con un médico.",
      },
      {
        from: "user",
        text: isEn
          ? "Can I get ibuprofen delivered to my hotel?"
          : "¿Puedo recibir ibuprofeno en el hotel?",
      },
      {
        from: "cora",
        text: isEn
          ? "Of course! I found Ibuprofen 400mg at Farmacity (12 min away) for AR$4,200. Want me to order via Rappi for delivery to your hotel in ~20 min?"
          : "¡Claro! Encontré Ibuprofeno 400mg en Farmacity (12 min) por AR$4.200. ¿Quieres que pida por Rappi para entrega en tu hotel en ~20 min?",
      },
    ],
    // Scenario 1 — Find English-speaking doctor
    [
      {
        from: "user",
        text: isEn
          ? "I need a general doctor who speaks English near Recoleta"
          : "Necesito un médico general que hable inglés cerca de Recoleta",
      },
      {
        from: "cora",
        text: isEn
          ? "I found 3 English-speaking doctors near Recoleta available this week:"
          : "Encontré 3 médicos que hablan inglés cerca de Recoleta disponibles esta semana:",
        cards: [
          {
            name: "Dr. Martín Ruiz",
            rating: "4.9",
            spec: isEn ? "General Medicine · Fluent English" : "Medicina General · Inglés fluido",
            dist: isEn ? "0.8 km · Recoleta" : "0.8 km · Recoleta",
          },
          {
            name: "Dra. Carolina Vega",
            rating: "4.8",
            spec: isEn ? "Internal Medicine · Fluent English" : "Medicina Interna · Inglés fluido",
            dist: isEn ? "1.2 km · Barrio Norte" : "1.2 km · Barrio Norte",
          },
          {
            name: "Dr. James Patterson",
            rating: "4.7",
            spec: isEn ? "Family Medicine · Native English" : "Medicina Familiar · Inglés nativo",
            dist: isEn ? "1.5 km · Palermo" : "1.5 km · Palermo",
          },
        ],
      },
      { from: "user", text: isEn ? "Book Dr. Ruiz please" : "Reservar con Dr. Ruiz por favor" },
      {
        from: "cora",
        text: isEn
          ? "Dr. Ruiz has availability tomorrow at 10:00 AM and 3:30 PM. Which do you prefer? I'll also arrange a ride when it's time."
          : "El Dr. Ruiz tiene disponibilidad mañana a las 10:00 y 15:30. ¿Cuál preferís? También te organizo el transporte cuando sea la hora.",
      },
    ],
    // Scenario 2 — Emergency ride to hospital
    [
      {
        from: "user",
        text: isEn
          ? "I need to get to Hospital Británico quickly, I think I sprained my ankle"
          : "Necesito llegar al Hospital Británico rápido, creo que me torcí el tobillo",
      },
      {
        from: "cora",
        text: isEn
          ? "I'll get you a ride right away. In the meantime: avoid putting weight on it, elevate if possible, and apply ice wrapped in cloth. Here are your options:"
          : "Te consigo un viaje ya. Mientras tanto: no apoyes el pie, elevalo si podés, y aplicá hielo envuelto en un paño. Tus opciones:",
        rides: [
          { name: "Uber X", time: "4 min", price: "AR$3,800", color: "#000" },
          { name: "Cabify Lite", time: "6 min", price: "AR$3,500", color: "#7B61FF" },
          { name: "InDrive", time: "3 min", price: "AR$3,200", color: "#A5D610" },
        ],
      },
      { from: "user", text: isEn ? "InDrive, fastest please" : "InDrive, el más rápido por favor" },
      {
        from: "cora",
        text: isEn
          ? "Opening InDrive now with Hospital Británico as destination.\n\nI'm also preparing your visit summary in English to show at reception:\n• Suspected ankle sprain\n• No known allergies\n• Travel insurance: [your policy]\n\nI'll check in with you after your visit."
          : "Abriendo InDrive con Hospital Británico como destino.\n\nTambién estoy preparando tu resumen de visita en inglés para mostrar en recepción:\n• Posible esguince de tobillo\n• Sin alergias conocidas\n• Seguro de viaje: [tu póliza]\n\nTe contacto después de tu visita.",
      },
    ],
  ];

  const msgs = convos[active] || convos[0] || [];

  return (
    <div className="bg-white border border-border rounded-2xl shadow-lg overflow-hidden max-w-md mx-auto md:mx-0">
      {/* Phone header */}
      <div className="bg-celeste-dark px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold">
          C
        </div>
        <div>
          <p className="text-white text-sm font-bold leading-none">Cora</p>
          <p className="text-celeste-pale text-[10px]">AI Health Assistant · online</p>
        </div>
      </div>
      {/* Tabs */}
      <div className="flex border-b border-border">
        {tabs.map((label, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`flex-1 py-2.5 text-[11px] font-semibold transition ${active === i ? "text-celeste-dark border-b-2 border-celeste-dark bg-celeste-pale/30" : "text-ink-muted hover:text-ink"}`}
          >
            {label}
          </button>
        ))}
      </div>
      {/* Messages */}
      <div className="p-4 space-y-3 max-h-[380px] overflow-y-auto bg-[#f8fafb]">
        {msgs.map((m, i) => (
          <div key={`${active}-${i}`}>
            <div className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed whitespace-pre-line ${m.from === "user" ? "bg-celeste-dark text-white rounded-br-md" : "bg-white border border-border text-ink rounded-bl-md"}`}
              >
                {m.text}
              </div>
            </div>
            {m.cards && (
              <div className="mt-2 space-y-2 ml-2">
                {m.cards.map((c, ci) => (
                  <div
                    key={ci}
                    className="bg-white border border-border rounded-lg p-3 hover:border-celeste/40 transition"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-ink">{c.name}</span>
                      <span className="flex items-center gap-0.5 text-xs text-gold">
                        <Star className="w-3 h-3 fill-gold" />
                        {c.rating}
                      </span>
                    </div>
                    <p className="text-[11px] text-ink-light">{c.spec}</p>
                    <p className="text-[10px] text-ink-muted flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      {c.dist}
                    </p>
                  </div>
                ))}
              </div>
            )}
            {m.rides && (
              <div className="mt-2 space-y-1.5 ml-2">
                {m.rides.map((r, ri) => (
                  <div
                    key={ri}
                    className="flex items-center gap-3 bg-white border border-border rounded-lg px-3 py-2.5 hover:border-celeste/40 transition"
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[10px] font-bold"
                      style={{ backgroundColor: r.color }}
                    >
                      {r.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm text-ink">{r.name}</p>
                      <p className="text-[11px] text-ink-muted">{r.time}</p>
                    </div>
                    <p className="font-bold text-sm text-ink">{r.price}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      {/* Input bar */}
      <div className="border-t border-border px-4 py-3 flex items-center gap-2 bg-white">
        <div className="flex-1 bg-surface border border-border rounded-full px-4 py-2 text-[12px] text-ink-muted">
          {isEn ? "Ask Cora anything…" : "Preguntale a Cora…"}
        </div>
        <div className="w-8 h-8 rounded-full bg-celeste-dark flex items-center justify-center">
          <ArrowRight className="w-4 h-4 text-white" />
        </div>
      </div>
    </div>
  );
}

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
  { icon: Car },
  { icon: Phone },
  { icon: Bell },
  { icon: Shield },
  { icon: Brain },
  { icon: WifiOff },
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

        {/* ── Integrations Showcase ─────────────────────────── */}
        <section className="px-6 py-20 border-t border-border">
          <div className="max-w-[960px] mx-auto">
            <p className="text-[11px] font-bold tracking-[2px] text-celeste uppercase mb-2.5">
              {et("integrations.kicker")}
            </p>
            <h2 className="text-[clamp(24px,3vw,36px)] font-bold text-ink mb-4 leading-[1.2]">
              {et("integrations.title")}{" "}
              <em className="not-italic text-celeste-dark">{et("integrations.titleEm")}</em>
            </h2>
            <p className="text-[15px] text-ink-light leading-[1.7] max-w-[640px] mb-10">
              {et("integrations.subtitle")}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {[
                { name: "Uber", cat: isEn ? "Transport" : "Transporte" },
                { name: "Cabify", cat: isEn ? "Transport" : "Transporte" },
                { name: "InDrive", cat: isEn ? "Transport" : "Transporte" },
                { name: "Rappi", cat: isEn ? "Pharmacy" : "Farmacia" },
                { name: "PedidosYa", cat: isEn ? "Pharmacy" : "Farmacia" },
                { name: "MercadoPago", cat: isEn ? "Payments" : "Pagos" },
                { name: "Google Maps", cat: isEn ? "Navigation" : "Navegación" },
                { name: "WhatsApp", cat: isEn ? "Communication" : "Comunicación" },
                { name: "TopDoctors", cat: isEn ? "Doctor data" : "Datos médicos" },
                { name: "Google Places", cat: isEn ? "Doctor data" : "Datos médicos" },
                { name: "Visa / MC / Amex", cat: isEn ? "Payments" : "Pagos" },
                { name: "PWA Offline", cat: isEn ? "Technology" : "Tecnología" },
              ].map((item) => (
                <div
                  key={item.name}
                  className="bg-white border border-border rounded-lg p-4 hover:border-celeste/40 hover:shadow-sm transition text-center"
                >
                  <p className="font-bold text-sm text-ink">{item.name}</p>
                  <p className="text-[10px] text-ink-muted mt-1">{item.cat}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Cora AI Conversation Demo ─────────────────────── */}
        <section className="px-6 py-20 bg-celeste-pale/50 border-t border-border">
          <div className="max-w-[960px] mx-auto">
            <p className="text-[11px] font-bold tracking-[2px] text-celeste uppercase mb-2.5">
              {et("cora.kicker")}
            </p>
            <h2 className="text-[clamp(24px,3vw,36px)] font-bold text-ink mb-4 leading-[1.2]">
              {et("cora.title")}{" "}
              <em className="not-italic text-celeste-dark">{et("cora.titleEm")}</em>
            </h2>
            <p className="text-[15px] text-ink-light leading-[1.7] max-w-[640px] mb-10">
              {et("cora.subtitle")}
            </p>

            <div className="grid md:grid-cols-2 gap-10 items-start">
              <CoraConversationDemo et={et} isEn={isEn} />

              <div className="space-y-5">
                {[
                  {
                    icon: Brain,
                    title: isEn ? "Symptom triage" : "Triaje de síntomas",
                    desc: isEn
                      ? "Evaluates your symptoms step-by-step, recommends OTC medication from Argentine pharmacies, and knows exactly when to connect you with a doctor."
                      : "Evalúa tus síntomas paso a paso, recomienda medicamentos de venta libre de farmacias argentinas, y sabe cuándo conectarte con un médico.",
                  },
                  {
                    icon: MapPin,
                    title: isEn ? "English-speaking doctors" : "Médicos que hablan inglés",
                    desc: isEn
                      ? "GPS-powered search finds doctors who speak English near you. Shows ratings, specialties, distance, and books appointments directly."
                      : "Búsqueda GPS encuentra médicos que hablan inglés cerca tuyo. Muestra calificaciones, especialidades, distancia y reserva turnos.",
                  },
                  {
                    icon: Car,
                    title: isEn ? "Ride to hospital" : "Viaje al hospital",
                    desc: isEn
                      ? "Compares Uber, Cabify, and InDrive with real-time pricing. One tap to open the app with the hospital pre-filled as destination."
                      : "Compara Uber, Cabify e InDrive con precios en tiempo real. Un toque para abrir la app con el hospital como destino.",
                  },
                  {
                    icon: Pill,
                    title: isEn ? "Pharmacy delivery" : "Farmacia a domicilio",
                    desc: isEn
                      ? "Finds the best price nearby, orders via Rappi or PedidosYa, delivered to your hotel or Airbnb in ~25 minutes."
                      : "Encuentra el mejor precio cerca, pide por Rappi o PedidosYa, entregado en tu hotel o Airbnb en ~25 minutos.",
                  },
                  {
                    icon: Languages,
                    title: isEn ? "Bilingual ES + EN" : "Bilingüe ES + EN",
                    desc: isEn
                      ? "Auto-detects your language. Responds naturally in English or Spanish. Prepares bilingual medical summaries for local doctors."
                      : "Detecta tu idioma automáticamente. Responde natural en inglés o español. Prepara resúmenes médicos bilingües para doctores locales.",
                  },
                ].map((cap, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-white border border-celeste/20 flex items-center justify-center shrink-0 mt-0.5">
                      <cap.icon className="w-5 h-5 text-celeste-dark" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-ink mb-0.5">{cap.title}</p>
                      <p className="text-[13px] text-ink-light leading-relaxed">{cap.desc}</p>
                    </div>
                  </div>
                ))}

                <div className="bg-celeste-pale border border-celeste/20 rounded-lg px-4 py-2.5 text-center">
                  <p className="text-[11px] font-semibold text-celeste-dark">{et("cora.badge")}</p>
                </div>
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
                  className="border-l-[3px] border-l-celeste bg-white border border-border rounded-lg p-5 hover:shadow-sm transition"
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

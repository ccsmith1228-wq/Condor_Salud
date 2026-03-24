"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Brain,
  Building2,
  Check,
  ChevronDown,
  CreditCard,
  Globe2,
  HeartPulse,
  Layers,
  Lock,
  MapPin,
  MessageSquare,
  Pill,
  Plane,
  QrCode,
  Shield,
  Stethoscope,
  TrendingUp,
  Users,
  Video,
  Zap,
} from "lucide-react";
import { useState } from "react";

/* ═══════════════════════════════════════════════════════════════
   PRIVATE INVESTOR PAGE — condorsalud.com/sieczkowski
   Not indexed (noindex via layout.tsx), not linked anywhere.
   ═══════════════════════════════════════════════════════════════ */

/* ─── Reusable Section Shell ──────────────────────────────── */
function Section({
  id,
  children,
  className = "",
  dark = false,
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
  dark?: boolean;
}) {
  return (
    <section id={id} className={`py-16 md:py-24 ${dark ? "bg-ink text-white" : ""} ${className}`}>
      <div className="max-w-5xl mx-auto px-6">{children}</div>
    </section>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-bold tracking-[2.5px] text-celeste uppercase mb-2">{children}</p>
  );
}

function SectionTitle({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <h2
      className={`font-display text-3xl md:text-4xl font-bold mb-4 ${dark ? "text-white" : "text-ink"}`}
    >
      {children}
    </h2>
  );
}

function SectionSub({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <p
      className={`text-base md:text-lg max-w-3xl ${dark ? "text-white/70" : "text-ink-light"} mb-10`}
    >
      {children}
    </p>
  );
}

/* ─── Stat Card ───────────────────────────────────────────── */
function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <p className="text-3xl md:text-4xl font-display font-bold text-celeste-dark">{value}</p>
      <p className="text-xs text-ink-muted mt-1">{label}</p>
    </div>
  );
}

/* ─── Feature Card ────────────────────────────────────────── */
function FeatureCard({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
}) {
  return (
    <div className="bg-white border border-border rounded-xl p-5 hover:shadow-md transition-shadow">
      <div className="w-10 h-10 rounded-lg bg-celeste-pale flex items-center justify-center mb-3">
        <Icon className="w-5 h-5 text-celeste-dark" />
      </div>
      <h3 className="font-bold text-sm text-ink mb-1">{title}</h3>
      <p className="text-xs text-ink-light leading-relaxed">{desc}</p>
    </div>
  );
}

/* ─── Collapsible FAQ ─────────────────────────────────────── */
function FAQ({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left group"
      >
        <span className="font-semibold text-sm text-ink group-hover:text-celeste-dark transition-colors">
          {q}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-ink-muted transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <p className="text-sm text-ink-light pb-4 leading-relaxed">{a}</p>}
    </div>
  );
}

/* ─── Table Row Helper ────────────────────────────────────── */
function TR({ cells, header = false }: { cells: string[]; header?: boolean }) {
  const Tag = header ? "th" : "td";
  return (
    <tr className={header ? "bg-celeste-pale/50" : "hover:bg-surface transition-colors"}>
      {cells.map((c, i) => (
        <Tag
          key={i}
          className={`px-4 py-2.5 text-xs ${header ? "font-bold text-ink text-left" : "text-ink-light"} ${i === 0 ? "font-medium text-ink" : ""}`}
        >
          {c}
        </Tag>
      ))}
    </tr>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════ */

export default function InvestorPage() {
  return (
    <div className="bg-white text-ink font-body min-h-screen">
      {/* ── Private Banner ───────────────────────────────────── */}
      <div className="bg-ink text-white/60 text-[10px] text-center py-1.5 tracking-wider font-semibold uppercase">
        <Lock className="w-3 h-3 inline -mt-px mr-1.5" />
        Confidential — Private Investor Overview
      </div>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <header className="relative overflow-hidden bg-gradient-to-br from-celeste-pale via-white to-gold-50 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-xl bg-celeste-dark flex items-center justify-center">
              <HeartPulse className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-display text-xl font-bold text-ink">Cóndor Salud</p>
              <p className="text-[10px] text-ink-muted tracking-wider uppercase">
                Healthcare Intelligence Platform
              </p>
            </div>
          </div>

          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-ink leading-[1.1] mb-6">
            The operating system for
            <span className="text-celeste-dark"> Argentine healthcare</span>
          </h1>
          <p className="text-lg md:text-xl text-ink-light max-w-3xl mb-10 leading-relaxed">
            Cóndor Salud replaces the 5–8 disconnected tools every clinic uses today — unifying
            billing, insurance claims, patient care, telemedicine, pharmacy, and AI triage into one
            platform for clinics, doctors, and patients.
          </p>

          {/* Key numbers row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
            <Stat value="24" label="Dashboard Modules" />
            <Stat value="229" label="Automated Tests" />
            <Stat value="23+" label="Database Tables" />
            <Stat value="$580M" label="SAM (Argentina)" />
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href="https://condorsalud.com"
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-2 bg-celeste-dark text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-celeste-700 transition-colors"
            >
              Live Product <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="https://condorsalud.com/planes"
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-2 border border-celeste-dark text-celeste-dark px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-celeste-pale transition-colors"
            >
              Pricing Configurator
            </a>
            <a
              href="https://condorsalud.com/partnerships"
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-2 border border-gold text-gold-dark px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-gold-50 transition-colors"
            >
              Travel Partnerships
            </a>
          </div>
        </div>

        {/* Decorative gradient blobs */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-celeste/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 w-72 h-72 rounded-full bg-gold/10 blur-3xl" />
      </header>

      {/* ── Nav Pills (sticky) ───────────────────────────────── */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-border">
        <div className="max-w-5xl mx-auto px-6 flex gap-1 overflow-x-auto py-2 scrollbar-thin">
          {[
            ["#problem", "Problem"],
            ["#solution", "Solution"],
            ["#product", "Product"],
            ["#market", "Market"],
            ["#revenue", "Revenue"],
            ["#competition", "Competition"],
            ["#traction", "Traction"],
            ["#gtm", "GTM"],
            ["#funds", "Use of Funds"],
            ["#faq", "FAQ"],
          ].map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="px-3 py-1.5 rounded-full text-xs font-semibold text-ink-light hover:text-celeste-dark hover:bg-celeste-pale transition-colors whitespace-nowrap"
            >
              {label}
            </a>
          ))}
        </div>
      </nav>

      {/* ══════════════════════════════════════════════════════════ */}
      {/*  PROBLEM                                                  */}
      {/* ══════════════════════════════════════════════════════════ */}
      <Section id="problem" className="bg-surface">
        <SectionLabel>The Problem</SectionLabel>
        <SectionTitle>Argentine healthcare is broken at every layer</SectionTitle>
        <SectionSub>
          Doctors lose 10–20% of revenue to unrecovered claim rejections, manage patients via
          WhatsApp, and watch inflation destroy their receivables over 45–120 day payment cycles.
        </SectionSub>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Provider pain */}
          <div className="bg-white border border-border rounded-xl p-6">
            <p className="text-[10px] font-bold tracking-[2px] text-red-500 uppercase mb-3">
              For Clinics & Doctors
            </p>
            <ul className="space-y-3">
              {[
                [
                  "Fragmented payers",
                  "7+ insurance companies, each with different portals, codes, and formats",
                ],
                [
                  "15–25% rejection rate",
                  "Each rejection needs manual investigation, correction, and resubmission",
                ],
                [
                  "Inflation destroys receivables",
                  "A $100K ARS bill paid 90 days later is worth ~$85K in real terms",
                ],
                [
                  "No integrated systems",
                  "Average clinic uses 3–5 separate tools plus WhatsApp for coordination",
                ],
                [
                  "Zero digital patient infrastructure",
                  "Paper prescriptions, handwritten records, no real-time coverage verification",
                ],
              ].map(([title, desc]) => (
                <li key={title} className="flex gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0" />
                  <div>
                    <p className="font-semibold text-sm text-ink">{title}</p>
                    <p className="text-xs text-ink-light">{desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Patient pain */}
          <div className="bg-white border border-border rounded-xl p-6">
            <p className="text-[10px] font-bold tracking-[2px] text-red-500 uppercase mb-3">
              For Patients & Tourists
            </p>
            <ul className="space-y-3">
              {[
                [
                  "Opaque healthcare navigation",
                  "Finding a doctor who accepts your insurance, speaks your language, and is nearby requires calling multiple clinics",
                ],
                [
                  "No unified health record",
                  "Lab results are paper, prescriptions handwritten, appointment history lives in the doctor's notebook",
                ],
                [
                  "Tourists are stranded",
                  "6.5M+ tourists/year — no system to connect them with English-speaking doctors, verify insurance, or deliver medication",
                ],
              ].map(([title, desc]) => (
                <li key={title} className="flex gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0" />
                  <div>
                    <p className="font-semibold text-sm text-ink">{title}</p>
                    <p className="text-xs text-ink-light">{desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/*  SOLUTION                                                 */}
      {/* ══════════════════════════════════════════════════════════ */}
      <Section id="solution">
        <SectionLabel>The Solution</SectionLabel>
        <SectionTitle>One platform, three audiences</SectionTitle>
        <SectionSub>
          Cóndor Salud replaces fragmented point-solutions with one Argentina-native platform that
          serves providers, patients, and the travel/tourism ecosystem.
        </SectionSub>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Building2,
              title: "B2B — Clinic SaaS",
              items: [
                "24-module professional dashboard",
                "Electronic billing (AFIP)",
                "Insurance claim processing",
                "Rejection recovery",
                "Telemedicine & pharmacy",
                "AI triage & chatbot",
              ],
            },
            {
              icon: Users,
              title: "B2C — Patient Portal",
              items: [
                "9-section patient portal",
                "Appointment booking",
                "Coverage verification",
                "Medication management",
                "AI symptom checker (Cora)",
                "Health Club memberships",
              ],
            },
            {
              icon: Plane,
              title: "B2B2C — Travel Partnerships",
              items: [
                "White-label health concierge",
                "Tourist coverage & doctor matching",
                "Prescription delivery",
                "24/7 AI triage in English",
                "Revenue calculator & partner app",
                "Revenue share model",
              ],
            },
          ].map((col) => (
            <div key={col.title} className="bg-surface border border-border rounded-xl p-6">
              <div className="w-10 h-10 rounded-lg bg-celeste-pale flex items-center justify-center mb-3">
                <col.icon className="w-5 h-5 text-celeste-dark" />
              </div>
              <h3 className="font-bold text-base text-ink mb-3">{col.title}</h3>
              <ul className="space-y-2">
                {col.items.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-success mt-0.5 shrink-0" />
                    <span className="text-xs text-ink-light">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Differentiators */}
        <div className="mt-12 grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[
            {
              icon: MapPin,
              t: "Argentina-native",
              d: "Built for PAMI, AFIP, obras sociales, SSS nomenclador, CUIL/CUIT from day one",
            },
            {
              icon: Brain,
              t: "AI-first",
              d: "Cora handles 20+ intents including symptom triage with Argentine OTC recommendations",
            },
            {
              icon: Layers,
              t: "Full vertical integration",
              d: "Billing → Claims → Rejections → Recovery → Payment — closed loop",
            },
            {
              icon: TrendingUp,
              t: "Inflation-aware",
              d: "IPC tracker calculates real loss per payer based on payment delay × daily inflation",
            },
            {
              icon: Globe2,
              t: "Bilingual for tourism",
              d: "Full ES/EN support, partnerships page, tourist health concierge",
            },
            {
              icon: QrCode,
              t: "Digital Rx with QR",
              d: "Legally-compliant digital prescriptions with scannable QR verification",
            },
          ].map((d) => (
            <div key={d.t} className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-lg bg-gold-50 flex items-center justify-center shrink-0">
                <d.icon className="w-4 h-4 text-gold-dark" />
              </div>
              <div>
                <p className="font-semibold text-sm text-ink">{d.t}</p>
                <p className="text-[11px] text-ink-light leading-snug">{d.d}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/*  PRODUCT                                                  */}
      {/* ══════════════════════════════════════════════════════════ */}
      <Section id="product" className="bg-surface">
        <SectionLabel>Product Overview</SectionLabel>
        <SectionTitle>24 modules. 9 patient sections. 14 integrations.</SectionTitle>
        <SectionSub>
          Every module is live and functional. The platform is deployed at condorsalud.com with 229
          automated tests passing.
        </SectionSub>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          <FeatureCard
            icon={CreditCard}
            title="Electronic Billing (AFIP)"
            desc="Generate and submit electronic invoices directly through AFIP's WSFE web services."
          />
          <FeatureCard
            icon={Shield}
            title="Claim Rejection Recovery"
            desc="Identify, categorize, and resubmit rejected insurance claims with audit trail."
          />
          <FeatureCard
            icon={BarChart3}
            title="Inflation Impact Tracker"
            desc="Calculate real-value loss on receivables using daily IPC data per payer."
          />
          <FeatureCard
            icon={Video}
            title="Telemedicine (Daily.co)"
            desc="HD video consultations integrated directly into the scheduling workflow."
          />
          <FeatureCard
            icon={Pill}
            title="Online Pharmacy"
            desc="Prescription management with delivery via Rappi/PedidosYa integration."
          />
          <FeatureCard
            icon={MessageSquare}
            title="AI Chatbot — Cora"
            desc="20+ intents, 17 symptom conditions, Argentine OTC recommendations, emergency routing."
          />
          <FeatureCard
            icon={QrCode}
            title="Digital Prescriptions"
            desc="QR-verified digital prescriptions replacing paper scripts. 30-day validity."
          />
          <FeatureCard
            icon={Stethoscope}
            title="Doctor Verification"
            desc="Matrícula + DNI upload and admin review workflow for trusted provider network."
          />
          <FeatureCard
            icon={Globe2}
            title="Public Doctor Profiles"
            desc="SEO-optimized, verified doctor pages with ratings, insurance, and booking."
          />
          <FeatureCard
            icon={HeartPulse}
            title="Health Tracker"
            desc="9 categories (BP, weight, glucose, meds, vaccines, labs, studies, symptoms, notes)."
          />
          <FeatureCard
            icon={Users}
            title="Health Club"
            desc="B2C membership tiers ($5–$18/mo) with prescription discounts and teleconsulta."
          />
          <FeatureCard
            icon={Plane}
            title="Travel Concierge"
            desc="Bilingual health concierge for travel agencies with revenue calculator."
          />
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/*  MARKET                                                   */}
      {/* ══════════════════════════════════════════════════════════ */}
      <Section id="market">
        <SectionLabel>Market Opportunity</SectionLabel>
        <SectionTitle>$580M addressable market in Argentina alone</SectionTitle>
        <SectionSub>
          210,000+ registered doctors, 45,000+ private clinics, 300+ insurance payers, 6.5M+
          tourists annually, and severe infrastructure gaps at every layer.
        </SectionSub>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <Stat value="$32B" label="Total healthcare spending" />
          <Stat value="210K+" label="Registered doctors" />
          <Stat value="45K+" label="Private clinics" />
          <Stat value="6.5M+" label="Annual tourists" />
        </div>

        {/* TAM / SAM / SOM */}
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left">
            <thead>
              <TR header cells={["Segment", "TAM (LATAM)", "SAM (Argentina)", "SOM (Year 1)"]} />
            </thead>
            <tbody>
              <TR cells={["Clinic SaaS", "$2.8B", "$280M", "$500K"]} />
              <TR cells={["Patient Portal / Health Club", "$1.2B", "$120M", "$200K"]} />
              <TR cells={["Medical Tourism Concierge", "$4.4B", "$180M", "$150K"]} />
              <TR cells={["Total", "$8.4B", "$580M", "$850K"]} />
            </tbody>
          </table>
        </div>

        {/* Why Now */}
        <div className="mt-12">
          <h3 className="font-display text-xl font-bold text-ink mb-4">Why Now</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              [
                "Post-COVID digital adoption",
                "Doctors went from 5% to 40%+ telemedicine adoption — but infrastructure didn't catch up.",
              ],
              [
                "Inflation crisis",
                "Clinics are desperate for tools that help them understand and recover real-value losses.",
              ],
              [
                "PAMI digitalization mandate",
                "Argentina's largest public insurer (7M+ members) is pushing electronic claims.",
              ],
              ["Tourism recovery", "International arrivals surpassed pre-pandemic levels in 2024."],
              [
                "Regulatory tailwind",
                "Argentina's 2020 digital prescription law created the legal framework for our QR prescription system.",
              ],
            ].map(([title, desc]) => (
              <div key={title} className="flex gap-3 items-start bg-celeste-pale/30 rounded-lg p-4">
                <Zap className="w-4 h-4 text-celeste-dark mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-sm text-ink">{title}</p>
                  <p className="text-xs text-ink-light">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/*  REVENUE                                                  */}
      {/* ══════════════════════════════════════════════════════════ */}
      <Section id="revenue" className="bg-surface">
        <SectionLabel>Business Model</SectionLabel>
        <SectionTitle>Five revenue streams, one platform</SectionTitle>
        <SectionSub>
          Diversified monetization across SaaS, B2C memberships, transactions, travel partnerships,
          and premium features.
        </SectionSub>

        {/* Stream 1: SaaS */}
        <div className="mb-10">
          <h3 className="font-display text-lg font-bold text-ink mb-3">
            1. SaaS Subscriptions (B2B) — Per-Doctor Seats
          </h3>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-left">
              <thead>
                <TR header cells={["Plan", "ARS/mo", "~USD/mo", "Features"]} />
              </thead>
              <tbody>
                <TR
                  cells={["Gratuito", "$0", "$0", "20 appts, directory listing, basic patients"]}
                />
                <TR
                  cells={[
                    "Profesional",
                    "$29,000",
                    "~$25",
                    "Unlimited scheduling, WhatsApp, coverage verification",
                  ]}
                />
                <TR
                  cells={[
                    "Premium",
                    "$59,000",
                    "~$50",
                    "Everything + telemedicine, billing, AI Cora, analytics",
                  ]}
                />
              </tbody>
            </table>
          </div>
          <p className="text-xs text-ink-muted mt-2">
            Clinic-level module pricing: 24 modules at $5K–$18K/mo each. Presets: Esencial ($53K),
            Profesional ($115K, -15%), Enterprise ($180K, -25%).
          </p>
        </div>

        {/* Stream 2: Health Club */}
        <div className="mb-10">
          <h3 className="font-display text-lg font-bold text-ink mb-3">
            2. Health Club Memberships (B2C)
          </h3>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-left">
              <thead>
                <TR header cells={["Plan", "ARS/mo", "USD/mo", "Benefits"]} />
              </thead>
              <tbody>
                <TR cells={["Básico", "$4,500", "$5", "10% Rx discount, 1 teleconsulta/mo"]} />
                <TR
                  cells={[
                    "Plus",
                    "$8,500",
                    "$10",
                    "20% Rx discount, 3 teleconsultas, delivery, Cora priority",
                  ]}
                />
                <TR
                  cells={[
                    "Familiar",
                    "$14,000",
                    "$18",
                    "30% Rx discount, 6 teleconsultas, delivery, Cora priority",
                  ]}
                />
              </tbody>
            </table>
          </div>
        </div>

        {/* Streams 3–5 */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white border border-border rounded-xl p-5">
            <h4 className="font-bold text-sm text-ink mb-2">3. Transaction Fees</h4>
            <ul className="space-y-1.5 text-xs text-ink-light">
              <li>• $2,000 ARS per non-member prescription (50% to Cóndor)</li>
              <li>• MercadoPago processing margin on copays</li>
              <li>• Future: per-booking fees on public profiles</li>
            </ul>
          </div>
          <div className="bg-white border border-border rounded-xl p-5">
            <h4 className="font-bold text-sm text-ink mb-2">4. Travel Partnerships</h4>
            <ul className="space-y-1.5 text-xs text-ink-light">
              <li>• $3–10 USD per covered traveler</li>
              <li>• Revenue share on medical services</li>
              <li>• White-label licensing fee</li>
            </ul>
          </div>
          <div className="bg-white border border-border rounded-xl p-5">
            <h4 className="font-bold text-sm text-ink mb-2">5. Data & Premium</h4>
            <ul className="space-y-1.5 text-xs text-ink-light">
              <li>• Priority directory placement</li>
              <li>• Premium analytics dashboards</li>
              <li>• Enterprise API access</li>
            </ul>
          </div>
        </div>

        {/* Unit Economics */}
        <div className="bg-celeste-dark rounded-xl p-6 text-white">
          <h3 className="font-display text-lg font-bold mb-4">Target Unit Economics</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {[
              ["ARPU", "$35–50 USD/mo"],
              ["CAC", "$50–100 USD"],
              ["LTV", "$1,200–2,400 USD"],
              ["LTV:CAC", "12–24×"],
              ["Gross Margin", "80–85%"],
              ["Payback", "1–3 months"],
            ].map(([k, v]) => (
              <div key={k}>
                <p className="text-white/60 text-[10px] tracking-wider uppercase">{k}</p>
                <p className="text-xl font-display font-bold">{v}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/*  COMPETITION                                              */}
      {/* ══════════════════════════════════════════════════════════ */}
      <Section id="competition">
        <SectionLabel>Competitive Landscape</SectionLabel>
        <SectionTitle>No one combines all of this for Argentina</SectionTitle>
        <SectionSub>
          The market is fragmented across 5+ point solutions. No existing player combines billing +
          claims + patient portal + telemedicine + AI triage + tourism.
        </SectionSub>

        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left">
            <thead>
              <TR header cells={["Competitor", "What They Do", "Cóndor Advantage"]} />
            </thead>
            <tbody>
              <TR
                cells={[
                  "Osana",
                  "Clinic management",
                  "No billing, no insurance, no patient portal",
                ]}
              />
              <TR
                cells={[
                  "Doctoralia",
                  "Doctor directory + booking",
                  "No billing, no clinical tools, no AR insurance",
                ]}
              />
              <TR
                cells={[
                  "MediFé App",
                  "Single-payer patient app",
                  "Only MediFé members, no provider tools",
                ]}
              />
              <TR
                cells={[
                  "PAMI Digital",
                  "Government portal",
                  "Terrible UX, no private insurance, no modern features",
                ]}
              />
              <TR
                cells={[
                  "Dricloud",
                  "Cloud clinic management",
                  "Spanish company, not localized for AR billing",
                ]}
              />
              <TR
                cells={[
                  "iClinic",
                  "Brazilian clinic software",
                  "No AR integration, no bilingual tourism",
                ]}
              />
            </tbody>
          </table>
        </div>

        <div className="mt-6 bg-gold-50 border border-gold/30 rounded-xl p-5">
          <p className="font-semibold text-sm text-ink">💡 Key Insight</p>
          <p className="text-xs text-ink-light mt-1">
            No existing player combines billing + claims + patient portal + telemedicine + AI triage
            + tourism in one platform for Argentina. The closest US analog is&nbsp;
            <strong>Veeva + Doctoralia + Oscar Health</strong> — we&apos;re building that for LATAM.
          </p>
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/*  TRACTION                                                 */}
      {/* ══════════════════════════════════════════════════════════ */}
      <Section id="traction" className="bg-surface">
        <SectionLabel>Traction & Current State</SectionLabel>
        <SectionTitle>Product is live and fully functional</SectionTitle>
        <SectionSub>
          Everything below is built, tested, and deployed at condorsalud.com. This is not a
          prototype — it&apos;s production-grade software.
        </SectionSub>

        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          {[
            ["Full marketing site (14 sections)", "✅ Live"],
            ["24-module professional dashboard", "✅ Functional"],
            ["9-section patient portal", "✅ Functional"],
            ["AI chatbot Cora (20+ intents)", "✅ Functional"],
            ["Supabase DB (23+ tables, RLS)", "✅ Connected"],
            ["Authentication (Supabase + Google OAuth)", "✅ Working"],
            ["14 external integrations wired", "✅ Code complete"],
            ["Travel partnerships page (bilingual)", "✅ Live"],
            ["Partner application → Supabase + email", "✅ Working"],
            ["Digital prescriptions with QR", "✅ Built"],
            ["Health Club membership system", "✅ Built"],
            ["Doctor verification gate", "✅ Built"],
            ["Public doctor profiles (SEO)", "✅ Built"],
            ["229 automated tests passing", "✅ Green"],
            ["Deployed on Vercel", "✅ Live"],
            ["Custom domains (.com + .com.ar)", "✅ Configured"],
          ].map(([item, status]) => (
            <div
              key={item}
              className="flex items-center gap-3 bg-white border border-border rounded-lg px-4 py-3"
            >
              <span className="text-xs font-bold text-success">{status}</span>
              <span className="text-xs text-ink">{item}</span>
            </div>
          ))}
        </div>

        {/* What's needed */}
        <h3 className="font-display text-lg font-bold text-ink mb-4">
          What&apos;s Needed for First Paying Customer
        </h3>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left">
            <thead>
              <TR header cells={["Item", "Effort", "Status"]} />
            </thead>
            <tbody>
              <TR
                cells={[
                  "AFIP electronic billing (WSFE)",
                  "2–3 weeks",
                  "Stub ready, needs certificate",
                ]}
              />
              <TR
                cells={[
                  "PAMI webservice connection",
                  "1–2 weeks",
                  "Env vars defined, needs credentials",
                ]}
              />
              <TR
                cells={[
                  "Stripe/MercadoPago payments",
                  "1 week",
                  "SDK installed, needs merchant account",
                ]}
              />
              <TR
                cells={["Transactional email (Resend)", "2 days", "SDK installed, needs API key"]}
              />
              <TR
                cells={["WhatsApp Business API (Twilio)", "1 week", "SDK installed, needs number"]}
              />
              <TR cells={["5 pilot clinics onboarded", "2–4 weeks", "Outreach starting"]} />
            </tbody>
          </table>
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/*  GTM                                                      */}
      {/* ══════════════════════════════════════════════════════════ */}
      <Section id="gtm">
        <SectionLabel>Go-to-Market Strategy</SectionLabel>
        <SectionTitle>Three phases from product to revenue</SectionTitle>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            {
              phase: "Phase 1 — Foundation",
              time: "Months 1–3 · $0 spend",
              goal: "5 pilot clinics, validate pricing, PMF",
              items: [
                "Direct outreach to 50 small clinics in Buenos Aires",
                "Free tier hook (20 appts/mo + directory)",
                "Doctor referral network (each → 2–3 colleagues)",
                "Content marketing: rejection recovery, inflation",
                "WhatsApp community for pilot clinic owners",
              ],
            },
            {
              phase: "Phase 2 — Growth",
              time: "Months 4–9 · $2–5K/mo",
              goal: "50 clinics, $5K MRR, launch B2C",
              items: [
                'Google Ads: "software médico Argentina"',
                "SEO via public doctor profiles",
                "Health Club B2C launch for onboarded clinics",
                "Partnership pipeline: 3–5 travel agencies",
                "Medical conference presence (AAMR, SAC)",
              ],
            },
            {
              phase: "Phase 3 — Scale",
              time: "Months 10–18 · $10–20K/mo",
              goal: "200+ clinics, $25K+ MRR, first enterprise",
              items: [
                "Enterprise sales: hospital networks",
                "API partnerships: labs, pharmacies, payers",
                "LATAM expansion research (CO, CL, UY)",
                "Revenue-generating travel agency deals",
              ],
            },
          ].map((p) => (
            <div key={p.phase} className="bg-surface border border-border rounded-xl p-6">
              <p className="text-[10px] font-bold tracking-[2px] text-celeste uppercase mb-1">
                {p.time}
              </p>
              <h3 className="font-bold text-base text-ink mb-1">{p.phase}</h3>
              <p className="text-xs text-ink-muted mb-4">{p.goal}</p>
              <ul className="space-y-2">
                {p.items.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <ArrowRight className="w-3 h-3 text-celeste-dark mt-0.5 shrink-0" />
                    <span className="text-xs text-ink-light">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Revenue targets */}
        <h3 className="font-display text-lg font-bold text-ink mb-4">Revenue Targets</h3>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left">
            <thead>
              <TR header cells={["Metric", "Month 3", "Month 12"]} />
            </thead>
            <tbody>
              <TR cells={["MRR (SaaS)", "$500", "$5,000"]} />
              <TR cells={["MRR (Health Club)", "$0", "$2,500"]} />
              <TR cells={["MRR (Partnerships)", "$0", "$1,000"]} />
              <TR cells={["Total MRR", "$500", "$8,500"]} />
              <TR cells={["ARR", "$6,000", "$102,000"]} />
            </tbody>
          </table>
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/*  USE OF FUNDS                                             */}
      {/* ══════════════════════════════════════════════════════════ */}
      <Section id="funds" dark>
        <SectionLabel>Use of Funds</SectionLabel>
        <SectionTitle dark>Pre-Seed: $150–300K USD</SectionTitle>
        <SectionSub dark>
          Every dollar goes to sales + integration. The product is already built.
        </SectionSub>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 mb-10">
          {[
            { pct: "50%", label: "Engineering", desc: "2 FT devs × 12 months", amount: "$75–150K" },
            { pct: "25%", label: "Go-to-Market", desc: "Sales + marketing", amount: "$37–75K" },
            {
              pct: "10%",
              label: "Infrastructure",
              desc: "Supabase Pro, Vercel, APIs",
              amount: "$15–30K",
            },
            {
              pct: "10%",
              label: "Legal & Compliance",
              desc: "AFIP cert, data protection",
              amount: "$15–30K",
            },
            { pct: "5%", label: "Buffer / Ops", desc: "Contingency", amount: "$7.5–15K" },
          ].map((f) => (
            <div key={f.label} className="bg-white/5 border border-white/10 rounded-xl p-5">
              <p className="text-2xl font-display font-bold text-gold">{f.pct}</p>
              <p className="font-semibold text-sm text-white mt-1">{f.label}</p>
              <p className="text-xs text-white/50">{f.desc}</p>
              <p className="text-xs text-white/70 mt-2 font-medium">{f.amount}</p>
            </div>
          ))}
        </div>

        <div className="bg-gold/10 border border-gold/20 rounded-xl p-6">
          <h3 className="font-display text-lg font-bold text-gold mb-3">
            What $150K Gets You in 12 Months
          </h3>
          <ul className="grid sm:grid-cols-2 gap-2">
            {[
              "Full AFIP + PAMI integration (real billing)",
              "50 paying clinics ($5K+ MRR)",
              "500+ Health Club members ($2.5K+ MRR)",
              "3+ travel agency partnerships ($1K+ MRR)",
              "Revenue run-rate of $100K+ ARR",
              "Position to raise Seed at $2–3M valuation",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-gold mt-0.5 shrink-0" />
                <span className="text-xs text-white/80">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/*  FAQ                                                      */}
      {/* ══════════════════════════════════════════════════════════ */}
      <Section id="faq">
        <SectionLabel>Investor FAQ</SectionLabel>
        <SectionTitle>Common questions</SectionTitle>

        <div className="bg-white border border-border rounded-xl divide-y divide-border overflow-hidden">
          <FAQ
            q="Why Argentina?"
            a="Argentina has a uniquely fragmented insurance system (300+ payers), a $32B healthcare market, and severe infrastructure gaps. Doctors literally lose 10–20% of revenue. Argentina produces world-class engineering talent at LATAM costs, and the learnings translate directly to Colombia, Chile, and Mexico."
          />
          <FAQ
            q="Is this a vitamin or a painkiller?"
            a="Painkiller. Claim rejection recovery alone can increase a clinic's revenue by 10–20%. We're not selling productivity — we're recovering lost money."
          />
          <FAQ
            q="How defensible is this?"
            a="Three moats: (1) Integration depth — each AFIP/PAMI/obra social integration takes months to build and certify, (2) Network effects — every doctor on the platform makes the directory more valuable for patients and vice versa, (3) Data compound — the more claims we process, the better our pre-submission audit becomes at predicting rejections."
          />
          <FAQ
            q="What if Doctoralia or a big player enters?"
            a="Doctoralia is a directory company — they'd need to build billing, claims, insurance integration, and AI from scratch. That's 2+ years of work. We're already live. The Argentine insurance system is niche enough that global players underinvest here."
          />
          <FAQ
            q="What's the regulatory risk?"
            a="Low. Argentina's 2020 digital prescription law enables our QR prescription feature. AFIP electronic billing is mandated. Patient data protection follows Argentine PDPA (similar to GDPR)."
          />
          <FAQ
            q="What are the biggest risks?"
            a="(1) Argentine macro volatility affecting willingness to pay (mitigated by USD pricing for tourism revenue), (2) AFIP/PAMI integration timelines longer than expected, (3) Initial clinic sales cycle being slow. All solvable with capital and execution."
          />
          <FAQ
            q="What's the tech stack?"
            a="Next.js 14 (App Router), TypeScript strict, Tailwind CSS, Supabase (PostgreSQL + Auth + Storage), Anthropic Claude (AI), Daily.co (video), MercadoPago, Twilio WhatsApp, Sentry monitoring. Deployed on Vercel with GitHub CI/CD."
          />
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/*  TECHNICAL APPENDIX                                       */}
      {/* ══════════════════════════════════════════════════════════ */}
      <Section className="bg-surface">
        <SectionLabel>Technical Appendix</SectionLabel>
        <SectionTitle>Enterprise-grade from day one</SectionTitle>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[
            ["Framework", "Next.js 14 (App Router)"],
            ["Language", "TypeScript (strict)"],
            ["Styling", "Tailwind CSS (custom design system)"],
            ["Database", "Supabase PostgreSQL + RLS"],
            ["AI", "Anthropic Claude"],
            ["Video", "Daily.co"],
            ["Payments", "MercadoPago SDK"],
            ["Messaging", "Twilio + Resend"],
            ["Monitoring", "Sentry (client + server + edge)"],
            ["CI/CD", "GitHub → Vercel auto-deploy"],
            ["Testing", "229 tests (Vitest + Playwright)"],
            ["Security", "AES-256-GCM, rate limiting, Zod, CSP"],
            ["Docker", "Multi-stage, Alpine, non-root"],
            ["Tables", "23+ with Row Level Security"],
            ["Migrations", "14 files applied"],
            ["APIs", "16+ endpoints"],
            ["Integrations", "14 services"],
            ["WCAG", "2.1 AA (axe-core tested)"],
          ].map(([label, value]) => (
            <div
              key={label}
              className="flex items-start gap-3 bg-white border border-border rounded-lg px-4 py-3"
            >
              <span className="text-[10px] font-bold tracking-wider text-celeste uppercase w-20 shrink-0 mt-0.5">
                {label}
              </span>
              <span className="text-xs text-ink">{value}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/*  FOOTER CTA                                               */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section className="bg-gradient-to-r from-celeste-dark to-celeste-700 text-white py-16 md:py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Let&apos;s build the future of Argentine healthcare
          </h2>
          <p className="text-white/70 text-base mb-8 max-w-xl mx-auto">
            The product is live. The market is massive. We need capital to go from product to
            revenue. Let&apos;s talk.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://condorsalud.com"
              target="_blank"
              rel="noopener"
              className="inline-flex items-center justify-center gap-2 bg-white text-celeste-dark px-6 py-3 rounded-lg font-bold text-sm hover:bg-white/90 transition-colors"
            >
              Explore the Live Product <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="mailto:invest@condorsalud.com"
              className="inline-flex items-center justify-center gap-2 border border-white/30 text-white px-6 py-3 rounded-lg font-bold text-sm hover:bg-white/10 transition-colors"
            >
              invest@condorsalud.com
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="bg-ink text-white/40 text-[10px] text-center py-6 tracking-wider">
        <Lock className="w-3 h-3 inline -mt-px mr-1" />
        CONFIDENTIAL — Cóndor Salud © {new Date().getFullYear()} · This document is not for public
        distribution.
      </footer>
    </div>
  );
}

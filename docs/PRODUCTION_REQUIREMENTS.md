# Cóndor Salud — Production Requirements & Cost Analysis

> What's needed to move from demo prototype to fully functional production SaaS.
>
> Last updated: March 10, 2026

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current State (Demo Mode)](#current-state-demo-mode)
3. [Required Services](#required-services)
   - [Tier 1 — Critical (Must-Have for Launch)](#tier-1--critical-must-have-for-launch)
   - [Tier 2 — Important (Needed Within 30 Days)](#tier-2--important-needed-within-30-days)
   - [Tier 3 — Growth (Scale Phase)](#tier-3--growth-scale-phase)
4. [Argentine Government & Regulatory APIs](#argentine-government--regulatory-apis)
5. [Monthly Cost Summary](#monthly-cost-summary)
6. [Implementation Roadmap](#implementation-roadmap)
7. [Revenue vs. Cost Projection](#revenue-vs-cost-projection)

---

## Executive Summary

Cóndor Salud is currently a **fully functional UI** with enterprise-grade infrastructure (TypeScript, Sentry, structured logging, CI/CD, Docker, SWR, testing). However, all data is hardcoded demo data and auth is simulated via localStorage.

**To go live, you need 7 external services totaling ~$49–149 USD/month** at launch, scaling to ~$249–749 USD/month at growth stage. The largest cost driver is Supabase (database), followed by Vercel (hosting) and Sentry (error tracking).

---

## Current State (Demo Mode)

| Component             | Demo Behavior                                                                    | Production Requirement                                        |
| --------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| **Authentication**    | localStorage session, any email/password accepted                                | Supabase Auth with email/password, magic link, or SSO         |
| **Database**          | In-memory arrays in `lib/services/data.ts` (pacientes, facturas, rechazos, etc.) | Supabase PostgreSQL with Row Level Security                   |
| **Waitlist API**      | In-memory array, resets on deploy                                                | Supabase table insert                                         |
| **File Storage**      | None                                                                             | Supabase Storage (medical docs, reports, invoices)            |
| **Error Tracking**    | Sentry code installed but `SENTRY_DSN` not configured                            | Sentry project with DSN                                       |
| **Analytics**         | Console.debug in dev, no-op in prod                                              | PostHog or Plausible                                          |
| **Email**             | None                                                                             | Resend or SendGrid (turnos reminders, alerts, password reset) |
| **AFIP Integration**  | UI only — CAE numbers are hardcoded                                              | AFIP WSFEV1 webservice with digital certificate               |
| **PAMI Integration**  | UI only — facturación data is mock                                               | PAMI webservice credentials                                   |
| **Financiador APIs**  | UI shows "Conectado" but no real connections                                     | Individual API credentials per financiador                    |
| **WhatsApp**          | UI only                                                                          | WhatsApp Business API (Meta)                                  |
| **Report Generation** | Buttons show "Próximamente"                                                      | PDF/Excel generation library + Supabase Storage               |
| **Search**            | Client-side filter on mock data                                                  | Supabase full-text search or Algolia                          |
| **Real-time**         | None                                                                             | Supabase Realtime for alerts, notifications                   |

---

## Required Services

### Tier 1 — Critical (Must-Have for Launch)

These services are **blocking** — without them, the app cannot handle real users or data.

---

#### 1. Supabase (Database + Auth + Storage + Realtime)

**What it replaces:** Demo data arrays, localStorage auth, no persistence

**What you get:**

- PostgreSQL database (pacientes, facturas, rechazos, financiadores, turnos, inventario, auditoría, nomenclador, reportes, alertas, configuración)
- Auth (email/password, magic link, OAuth providers)
- Row Level Security (multi-tenant: each clinic sees only its data)
- Storage (medical documents, generated reports, invoice PDFs)
- Realtime subscriptions (live alerts, notification badges)
- Edge Functions (serverless backend logic)

**Setup work in codebase:**

- Create ~15 database tables + RLS policies + migrations
- Wire `lib/auth/context.tsx` to Supabase Auth (TODOs already in place)
- Wire `lib/services/data.ts` functions to Supabase queries (async pattern already matches)
- Wire `api/waitlist/route.ts` to Supabase insert (TODO already in place)
- Configure `middleware.ts` for Supabase session validation (code already exists)

| Plan     | Price (USD/mo) | Includes                                                 | When to Use                       |
| -------- | -------------- | -------------------------------------------------------- | --------------------------------- |
| **Free** | $0             | 500 MB DB, 1 GB Storage, 50K auth MAU, 500 MB bandwidth  | Development / MVP testing         |
| **Pro**  | $25            | 8 GB DB, 100 GB Storage, 100K auth MAU, 250 GB bandwidth | **Launch — first 10 clinics**     |
| **Team** | $599           | 100+ GB DB, priority support, SOC2 report                | 50+ clinics, enterprise contracts |

> **Recommendation:** Start with **Pro ($25/mo)**, upgrade to Team when serving enterprise clients.

Link: [supabase.com/pricing](https://supabase.com/pricing)

---

#### 2. Vercel (Hosting + Edge + CI/CD)

**What it replaces:** Current Hobby deployment (has limitations)

**Current state:** Deployed on Vercel Hobby (free) at `condor-salud.vercel.app`

**Why upgrade:**

- Hobby has 100 GB bandwidth, no commercial use allowed
- Pro adds: custom domains, password protection, analytics, 1 TB bandwidth
- Needed for: `condorsalud.com.ar` custom domain, commercial SLA

| Plan           | Price (USD/mo) | Includes                                                  | When to Use    |
| -------------- | -------------- | --------------------------------------------------------- | -------------- |
| **Hobby**      | $0             | 100 GB bandwidth, personal use only                       | Current (demo) |
| **Pro**        | $20            | 1 TB bandwidth, custom domains, analytics, commercial use | **Launch**     |
| **Enterprise** | Custom         | SLA, SSO, audit logs                                      | 100+ clinics   |

> **Recommendation:** **Pro ($20/mo)** at launch. Essential for commercial use and custom domain.

Link: [vercel.com/pricing](https://vercel.com/pricing)

---

#### 3. Sentry (Error Tracking + Performance)

**What it replaces:** Silent errors, no visibility into production issues

**Current state:** `@sentry/nextjs` installed, client/server/edge configs written, PII redaction configured. Just needs a `SENTRY_DSN`.

**Setup work:** Create Sentry project -> copy DSN -> add to Vercel env vars. **~5 minutes.**

| Plan          | Price (USD/mo) | Includes                                     | When to Use                  |
| ------------- | -------------- | -------------------------------------------- | ---------------------------- |
| **Developer** | $0             | 5K errors/mo, 10K perf transactions          | **Launch — first 5 clinics** |
| **Team**      | $26            | 50K errors/mo, 100K perf, crash-free metrics | 10+ clinics                  |
| **Business**  | $80            | 100K+ errors, custom dashboards, SLA         | Enterprise                   |

> **Recommendation:** Start **free (Developer)**, move to **Team ($26/mo)** when you have paying customers.

Link: [sentry.io/pricing](https://sentry.io/pricing)

---

#### 4. Domain Name (`condorsalud.com.ar`)

**What it replaces:** `condor-salud.vercel.app` subdomain

| Provider                  | Price (USD/year) | Notes                           |
| ------------------------- | ---------------- | ------------------------------- |
| NIC Argentina (`.com.ar`) | ~$4/year         | Requires CUIT, Argentine entity |
| Namecheap (`.com`)        | ~$10/year        | Backup if `.com.ar` taken       |
| Cloudflare (`.com`)       | ~$9/year         | At-cost pricing                 |

> **Recommendation:** Register `condorsalud.com.ar` via NIC Argentina (~$4/year ≈ $0.33/mo).

---

### Tier 2 — Important (Needed Within 30 Days)

These services are needed for the product to deliver core value to clinics.

---

#### 5. Transactional Email (Resend or SendGrid)

**What it replaces:** No email functionality

**Needed for:**

- Password reset / magic link emails
- Turno reminders (24h before appointment)
- Alert notifications (rechazos, pagos, vencimientos)
- Weekly/monthly report delivery
- Waitlist confirmation

| Provider     | Free Tier       | Paid           | Notes                                   |
| ------------ | --------------- | -------------- | --------------------------------------- |
| **Resend**   | 3,000 emails/mo | $20/mo for 50K | Modern API, great DX, built for Next.js |
| **SendGrid** | 100 emails/day  | $15/mo for 50K | Mature, more features                   |

> **Recommendation:** **Resend** — free tier covers launch, $20/mo at scale. Better developer experience with Next.js.

Link: [resend.com/pricing](https://resend.com/pricing)

---

#### 6. Analytics (PostHog or Plausible)

**What it replaces:** `lib/analytics.ts` skeleton (currently logs to console)

**Needed for:** Understanding user behavior, feature usage, conversion funnels, clinic engagement metrics.

| Provider             | Free Tier         | Paid               | Notes                                                 |
| -------------------- | ----------------- | ------------------ | ----------------------------------------------------- |
| **PostHog**          | 1M events/mo      | $0 (generous free) | Full product analytics, session replay, feature flags |
| **Plausible**        | None              | €9/mo              | Privacy-focused, lightweight, GDPR compliant          |
| **Vercel Analytics** | Included with Pro | $0 with Vercel Pro | Basic Web Vitals only                                 |

> **Recommendation:** **PostHog (free tier)** — 1M events/month is very generous, includes session replay. Add feature flags for A/B testing pricing pages.

Link: [posthog.com/pricing](https://posthog.com/pricing)

---

#### 7. PDF/Report Generation

**What it replaces:** "Próximamente" toasts on report buttons

**Needed for:** Generating facturación reports, rechazo summaries, KPI dashboards as downloadable PDF/Excel files.

| Library                 | Price      | Notes                                                 |
| ----------------------- | ---------- | ----------------------------------------------------- |
| **@react-pdf/renderer** | Free (OSS) | React components -> PDF. Good for invoices, reports   |
| **jsPDF + autoTable**   | Free (OSS) | Lightweight, table-heavy reports                      |
| **ExcelJS**             | Free (OSS) | Excel generation for financial exports                |
| **Puppeteer**           | Free (OSS) | Screenshot-based PDF (heavier, needs headless Chrome) |

> **Recommendation:** `@react-pdf/renderer` for PDFs + `ExcelJS` for spreadsheets. **$0/mo** — open source.

---

### Tier 3 — Growth (Scale Phase)

Services needed once you have 10+ paying clinics.

---

#### 8. WhatsApp Business API

**What it replaces:** UI-only WhatsApp integration in integraciones page

**Needed for:** Automatic turno reminders, appointment confirmations, patient notifications.

| Provider          | Price                           | Notes                                   |
| ----------------- | ------------------------------- | --------------------------------------- |
| **Meta (direct)** | ~$0.05/message (AR)             | Requires Facebook Business verification |
| **Twilio**        | $0.005/msg + $0.05/conversation | Easier setup, higher cost               |
| **Gupshup**       | ~$0.03/msg                      | Popular in LATAM                        |

> **Recommendation:** Start with **Twilio** for ease of integration (~$50–100/mo for 1K conversations), migrate to Meta direct at scale.

Link: [twilio.com/whatsapp](https://www.twilio.com/en-us/messaging/channels/whatsapp)

---

#### 9. Uptime Monitoring

**What it replaces:** No uptime visibility

| Provider         | Free Tier   | Paid   | Notes                           |
| ---------------- | ----------- | ------ | ------------------------------- |
| **BetterUptime** | 10 monitors | $20/mo | Beautiful status page, alerting |
| **UptimeRobot**  | 50 monitors | $7/mo  | Simple, reliable                |
| **Checkly**      | 5 checks    | $30/mo | Includes API monitoring         |

> **Recommendation:** **UptimeRobot free** at launch -> **BetterUptime ($20/mo)** for public status page when selling enterprise.

---

#### 10. Log Management (Production)

**What it replaces:** Pino logs go to stdout (lost on deploy)

| Provider                   | Free Tier        | Paid             | Notes                        |
| -------------------------- | ---------------- | ---------------- | ---------------------------- |
| **Axiom**                  | 500 MB/mo ingest | $25/mo for 50 GB | Excellent Vercel integration |
| **Datadog**                | None             | $15/host/mo      | Full APM, expensive at scale |
| **Logtail (Better Stack)** | 1 GB/mo          | $25/mo           | Good for startups            |

> **Recommendation:** **Axiom free tier** — native Vercel integration, 500 MB/mo covers early stage.

Link: [axiom.co/pricing](https://axiom.co/pricing)

---

## Argentine Government & Regulatory APIs

These are **unique to the Argentine healthcare market** and critical for the product's core value proposition.

### AFIP — Factura Electrónica (WSFEV1)

**Purpose:** Issue legally valid electronic invoices (Factura C, Nota de Crédito/Débito) and obtain CAE numbers.

**Requirements:**

- CUIT registered with AFIP
- Digital certificate (Certificado Digital) — obtained free from AFIP
- WSAA (authentication webservice) + WSFEV1 (billing webservice)

**Cost:** **$0** (government service, free API)

**Setup complexity:** Medium — requires certificate generation, SOAP/XML integration, homologation testing environment before production.

**Libraries:** `afip.js` (Node.js SDK for AFIP webservices) — open source

Link: [afip.gob.ar/fe](https://www.afip.gob.ar/fe/)

---

### PAMI — Webservice Prestadores

**Purpose:** Electronic submission of invoices to PAMI, eligibility verification, claim status tracking.

**Requirements:**

- Institutional PAMI credential (requires clinic registration)
- Access to PAMI's prestadores portal
- SOAP webservice integration

**Cost:** **$0** (government service)

**Setup complexity:** High — PAMI's API documentation is limited, requires institutional registration, testing against their staging environment.

Link: [pami.org.ar/prestadores](https://www.pami.org.ar/prestadores)

---

### SISA — Sistema Integrado de Información Sanitaria

**Purpose:** Patient identity verification, REFES (establishment registry), REFEPS (professional registry).

**Requirements:** Ministerio de Salud credential

**Cost:** **$0** (government service)

---

### Obra Social / Prepaga APIs

Each financiador has its own integration method:

| Financiador       | API Type                     | Access                                  | Cost |
| ----------------- | ---------------------------- | --------------------------------------- | ---- |
| **OSDE**          | REST API / Portal            | Prestador credential                    | $0   |
| **Swiss Medical** | REST API                     | Client ID + Secret (request via portal) | $0   |
| **Galeno**        | SOAP Webservice              | Prestador credential                    | $0   |
| **Medifé**        | REST API                     | Client credential                       | $0   |
| **IOMA**          | Web portal (manual/scraping) | Provincial credential                   | $0   |
| **OSECAC**        | SOAP Webservice              | Prestador credential                    | $0   |
| **Sancor Salud**  | REST API                     | Partnership agreement                   | $0   |

> **All financiador APIs are free.** The cost is developer time to integrate each one (estimate 2–5 days per financiador).

---

## Monthly Cost Summary

### Launch Phase (0–10 clinics)

| Service            | Plan              | Monthly Cost (USD) |
| ------------------ | ----------------- | ------------------ |
| Supabase           | Pro               | $25                |
| Vercel             | Pro               | $20                |
| Sentry             | Developer (free)  | $0                 |
| Domain             | .com.ar           | ~$0.33             |
| Resend             | Free tier         | $0                 |
| PostHog            | Free tier         | $0                 |
| PDF/Excel libs     | Open source       | $0                 |
| AFIP / PAMI / SISA | Government (free) | $0                 |
| Axiom (logs)       | Free tier         | $0                 |
| UptimeRobot        | Free tier         | $0                 |
| **TOTAL**          |                   | **~$45/mo**        |

### Growth Phase (10–50 clinics)

| Service           | Plan         | Monthly Cost (USD) |
| ----------------- | ------------ | ------------------ |
| Supabase          | Pro          | $25                |
| Vercel            | Pro          | $20                |
| Sentry            | Team         | $26                |
| Domain            | .com.ar      | ~$0.33             |
| Resend            | Starter      | $20                |
| PostHog           | Free tier    | $0                 |
| WhatsApp (Twilio) | Pay-per-use  | ~$75               |
| Axiom             | Free -> Paid | $0–25              |
| UptimeRobot       | Free         | $0                 |
| **TOTAL**         |              | **~$166–191/mo**   |

### Scale Phase (50+ clinics)

| Service                | Plan                  | Monthly Cost (USD)   |
| ---------------------- | --------------------- | -------------------- |
| Supabase               | Team                  | $599                 |
| Vercel                 | Pro/Enterprise        | $20–500              |
| Sentry                 | Business              | $80                  |
| Domain                 | .com.ar + .com        | ~$1                  |
| Resend                 | Pro                   | $80                  |
| PostHog                | Free (still under 1M) | $0                   |
| WhatsApp (Meta direct) | ~$0.05/msg            | ~$200                |
| Axiom                  | Pro                   | $25                  |
| BetterUptime           | Starter               | $20                  |
| **TOTAL**              |                       | **~$1,025–1,505/mo** |

---

## Implementation Roadmap

### Week 1–2: Foundation (Enables first real user)

| #   | Task                                            | Dependency       | Effort |
| --- | ----------------------------------------------- | ---------------- | ------ |
| 1   | Create Supabase project + configure env vars    | Supabase account | 1 hour |
| 2   | Design database schema (15 tables)              | —                | 2 days |
| 3   | Write Supabase migrations + RLS policies        | Schema design    | 3 days |
| 4   | Wire auth context to Supabase Auth              | Supabase project | 1 day  |
| 5   | Wire data service functions to Supabase queries | Migrations       | 3 days |
| 6   | Wire waitlist API to Supabase                   | Supabase project | 1 hour |
| 7   | Upgrade Vercel to Pro + add custom domain       | Vercel account   | 1 hour |
| 8   | Create Sentry project + set DSN                 | Sentry account   | 5 min  |

### Week 3–4: Core Value Features

| #   | Task                                           | Dependency             | Effort |
| --- | ---------------------------------------------- | ---------------------- | ------ |
| 9   | AFIP digital certificate + WSFEV1 integration  | AFIP CUIT              | 5 days |
| 10  | PDF invoice generation (`@react-pdf/renderer`) | —                      | 3 days |
| 11  | Excel export for financial reports (`ExcelJS`) | —                      | 2 days |
| 12  | Transactional email setup (Resend)             | Resend account         | 1 day  |
| 13  | Password reset + magic link flow               | Supabase Auth + Resend | 1 day  |
| 14  | Turno reminder emails (24h before)             | Resend + Supabase      | 1 day  |

### Week 5–8: Financiador Integrations

| #   | Task                          | Dependency           | Effort  |
| --- | ----------------------------- | -------------------- | ------- |
| 15  | PAMI webservice integration   | PAMI credential      | 5 days  |
| 16  | OSDE API integration          | Prestador credential | 3 days  |
| 17  | Swiss Medical API integration | Client ID/Secret     | 3 days  |
| 18  | Galeno webservice integration | Prestador credential | 3 days  |
| 19  | PostHog analytics integration | PostHog account      | 2 hours |

### Week 9–12: Growth Features

| #   | Task                                                      | Dependency                         | Effort  |
| --- | --------------------------------------------------------- | ---------------------------------- | ------- |
| 20  | WhatsApp Business API (Twilio)                            | Twilio account + Meta verification | 3 days  |
| 21  | Remaining financiador integrations (Medifé, IOMA, OSECAC) | Credentials                        | 6 days  |
| 22  | Real-time alerts via Supabase Realtime                    | Supabase                           | 2 days  |
| 23  | Uptime monitoring + status page                           | BetterUptime                       | 2 hours |
| 24  | Axiom log drain from Vercel                               | Axiom account                      | 1 hour  |

---

## Revenue vs. Cost Projection

Based on the pricing tiers defined in the product (ARS/month):

| Phase        | Clinics | Avg MRR (ARS) | Avg MRR (USD\*) | Infra Cost (USD) | Gross Margin |
| ------------ | ------- | ------------- | --------------- | ---------------- | ------------ |
| Launch       | 5       | $250K         | ~$208           | $45              | **78%**      |
| Early Growth | 15      | $900K         | ~$750           | $180             | **76%**      |
| Growth       | 50      | $3.5M         | ~$2,917         | $500             | **83%**      |
| Scale        | 100     | $8M           | ~$6,667         | $1,200           | **82%**      |

_\*At assumed rate of ~1,200 ARS/USD. Adjust for current exchange rate._

**Key insight:** Even at just 5 clinics on the Starter plan ($25K ARS/mo each), infrastructure costs are covered. The business is profitable from the first paying customer at the Growth tier ($75K ARS/mo).

---

## Environment Variables Needed

When you're ready to configure, these are all the env vars referenced in the codebase:

```env
# ─── Required for Launch ─────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=https://condorsalud.com.ar
SENTRY_DSN=https://your-key@sentry.io/your-project
SENTRY_AUTH_TOKEN=your-sentry-auth-token
SENTRY_ORG=condor-salud
SENTRY_PROJECT=condor-salud

# ─── Required for AFIP Integration ───────────────────────────
AFIP_CERT_PATH=/path/to/cert.pem
AFIP_KEY_PATH=/path/to/key.pem
AFIP_CUIT=30-12345678-9

# ─── Required for PAMI Integration ───────────────────────────
PAMI_API_URL=https://webservice.pami.org.ar/...
PAMI_API_TOKEN=your-pami-token

# ─── Required for Swiss Medical Integration ──────────────────
SWISS_MEDICAL_CLIENT_ID=your-client-id
SWISS_MEDICAL_CLIENT_SECRET=your-client-secret

# ─── Required for Email ──────────────────────────────────────
RESEND_API_KEY=re_your_api_key

# ─── Required for Analytics ──────────────────────────────────
NEXT_PUBLIC_POSTHOG_KEY=phc_your_key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# ─── Required for WhatsApp (Growth Phase) ────────────────────
TWILIO_ACCOUNT_SID=your-sid
TWILIO_AUTH_TOKEN=your-token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# ─── Optional ────────────────────────────────────────────────
LOG_LEVEL=info
NODE_ENV=production
```

---

## TL;DR

| Question                        | Answer                                                             |
| ------------------------------- | ------------------------------------------------------------------ |
| **Minimum to launch?**          | Supabase Pro ($25) + Vercel Pro ($20) + Sentry (free) = **$45/mo** |
| **Biggest engineering effort?** | Database schema + RLS + data service wiring (~2 weeks)             |
| **Biggest value unlock?**       | AFIP integration (enables real electronic invoicing)               |
| **When profitable?**            | First paying clinic covers infrastructure                          |
| **Government APIs cost?**       | All free ($0) — AFIP, PAMI, SISA, financiadores                    |
| **Total services at scale?**    | ~$1,200/mo serving 100 clinics -> 82% gross margin                 |

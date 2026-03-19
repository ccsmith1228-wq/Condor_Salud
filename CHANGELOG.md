# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.9.4] — 2026-03-19

### Fixed

- **Geolocation now works in Cora chatbot**
  - `Permissions-Policy` header changed from `geolocation=()` (deny-all) to `geolocation=(self)` — the browser was blocking the Geolocation API before it even prompted the user
  - Service worker cache bumped to v2 so returning visitors drop stale cached responses with the old deny-all header
  - Added English regex patterns for all geolocation intents (`shared_location`, `nearby_doctor`, `nearby_pharmacy`, `nearby_guardia`, `directions`, `location`) — previously only Spanish patterns existed, so English messages like "I shared my location" fell through to the fallback response
  - Geolocation errors (permission denied, timeout, unavailable) now display as a bot message in chat instead of being silently swallowed — users see what went wrong and get quick replies to retry or search the directory

## [0.9.3] — 2026-03-19

### Changed

- **Dual-mode architecture: Demo shows mock data, authenticated clinics get blank slate**
  - Restored all mock/demo data that was removed in v0.9.1 and v0.9.2 — demo visitors see rich sample data
  - Service layer catch blocks now return `[]` (empty) instead of mock data when Supabase is configured, ensuring authenticated users never see demo data on error
  - KPI builders return zeroed KPIs (`$0`, `0%`, `—`) on query failure for authenticated users instead of falling through to demo values
  - All 12 data.ts service functions (getPacientes, getFacturas, etc.) wrapped in try-catch returning `[]` for auth error paths
  - Pattern B files (financiadores, inflacion, inventario, nomenclador, reportes) wrapped Supabase blocks in try-catch returning `[]` on failure
  - dashboard/page.tsx: Distinguishes `undefined` (loading → show fallback) from `[]` (loaded, no data → show empty)
  - pacientes/page.tsx: Uses `usePacientes()` hook for auth mode, inline demo data for demo mode
  - reportes/page.tsx & inventario/page.tsx: Generation history and movements sections hidden for authenticated users
  - Removed hardcoded "Centro Médico San Martín" fallback from dashboard subtitle (shows "Mi Clínica" for auth users without a name)

### Fixed

- Authenticated clinic dashboards now start completely blank — no demo patients, KPIs, prescriptions, or sample data leak through

## [0.9.2] — 2026-03-19

### Changed

- **Complete mock data removal**: Stripped every remaining demo/mock data array across the entire codebase so new clinics start with a truly clean slate
  - `farmacia.ts`: Emptied mockMedications (8 items), mockPrescriptions (3), mockDeliveries (3), mockRecurringOrders (3)
  - `telemedicina.ts`: Emptied mockWaitingRoom (3), mockConsultations (4), mockScheduled (3)
  - `triage.ts`: Emptied mockTriages (4)
  - `interconsultas.ts`: Emptied DEMO_DOCTORS (13), DEMO_INTERCONSULTAS (5), DEMO_ESTUDIOS (4)
  - `useNearbyServices.ts`: Emptied DEMO_PROVIDERS (4), DEMO_PHARMACIES (3), DEMO_CENTERS (4)
  - `nubix.ts`: Emptied mockStudies (6), mockReports (2), mockDeliveries (3), mockAppointments (3); removed fake KPI values and simulated deliveries
  - `financiadores.ts`: Emptied DEMO_FINANCIADORES (7)
  - `inflacion.ts`: Emptied DEMO_MESES (6) and DEMO_FINANCIADORES_INFLACION (5)
  - `inventario.ts`: Emptied DEMO_INVENTARIO (12)
  - `nomenclador.ts`: Emptied DEMO_NOMENCLADOR (18)
  - `historia.ts`: Emptied getDemoHistoria events (8)
  - `reportes/page.tsx`: Emptied historialGeneraciones (6 fake entries)
  - `pacientes/[id]/page.tsx`: Cleared all hardcoded patient data, historial, turnos, and facturacion
  - `directorio/page.tsx`: Removed hardcoded doctor options and verification history mock rows
  - `layout.tsx`: Changed fallback name from "Dr. Rodríguez" → "Usuario", clinic from "Clínica San Martín" → "Mi Clínica"
  - `interconsultas.ts`: Changed "Dr. Demo" fallback → "Médico"

## [0.9.1] — 2026-03-19

### Added

- **WhatsApp AI service** (`src/lib/services/whatsapp-ai.ts`): Complete integration with WhatsApp Business Cloud API v21.0
  - Multi-turn conversation AI: greeting → symptom collection → severity assessment → scheduling → confirmation
  - Symptom triage with 4 severity levels (leve / moderado / urgente / emergencia) and specialty suggestion
  - Auto-scheduling: bot asks specialty, preferred time, and books appointments
  - 24-hour & 2-hour appointment reminders with patient confirm/cancel/reschedule replies (1/2/3)
  - Digital prescription delivery via WhatsApp with legal compliance notice (Ley 27.553)
  - Batch reminder processor for cron job integration
- **Camera capture on mobile**: `FileUpload` component now accepts `enableCamera` prop. Opens rear camera via `capture="environment"` on mobile devices for scanning documents, logos, and credentials
- **Feature explanation cards in wizard**: Every wizard step now explains what each feature does with illustrated cards (WhatsApp AI, recordatorios, recetas digitales, triage, telemedicina, auditoría)
- **WhatsApp number collection**: Step 4 (Configuración) now asks for the clinic's WhatsApp number with toggle to enable WhatsApp AI. Saved to `ClinicOnboardingInput`

### Changed

- **Zero mock data for new clinics**: Clinics and doctors that sign up now see completely empty dashboards — no fake patients, invoices, appointments, or KPIs
  - `data.ts`: All 11 mock arrays emptied (pacientes, facturas, rechazos, financiadores, inflación, alertas, turnos, inventario, nomenclador, reportes, auditoría). All 6 KPI builders return `[]`
  - `directorio.ts`: mockDoctors, mockReviews, coverage fallbacks → empty
  - `dashboard/page.tsx`: Fallback KPIs, agenda, audit log, and inline alerts all emptied
  - `dashboard/pacientes/page.tsx`: 12 inline mock patients → empty array
  - `api/verificacion/route.ts`: Fake "activo PAMI" fallback → proper 404 error
  - `api/alertas/route.ts`: 10 demo alerts → empty array
  - `dashboard/directorio/page.tsx`: Hardcoded KPI values → zeros
  - `dashboard/inventario/page.tsx`: Fake stock movements → empty array
  - `paciente/medicos/page.tsx`: Hardcoded doctor array → empty
  - `chatbot-engine.ts`: Fake nearby doctors/pharmacies/hospitals → empty
  - `services/reportes.ts`: Demo report definitions → empty
  - `configuracion/whatsapp/page.tsx`: Fake clinic defaults and demo history → empty
- **Onboarding wizard enhanced** with WhatsApp configuration section, feature explanation cards per step, and camera-enabled file uploads
- **`ClinicOnboardingInput`**: Added `whatsappNumber`, `enableWhatsapp`, `enableTelemedicina`, `financiadores` fields

## [0.9.0] — 2026-03-19

### Changed

- **Onboarding wizard rewrite**: Replaced the 13-slide informational tour with a real 6-step clinic setup wizard:
  1. **Bienvenida** — Overview of the setup process
  2. **Datos de la clínica** — Name (required), CUIT, address, phone, email, logo upload
  3. **Equipo médico** — Add team members manually or import via spreadsheet (xlsx/csv)
  4. **Importar datos** — Upload patient spreadsheets, medical documents (xlsx, csv, pdf)
  5. **Configuración** — Specialty & financiador chip selectors, sistema anterior, WhatsApp & telemedicine toggles
  6. **Confirmación** — Summary review + "Activar clínica" button that calls `completeOnboarding()`
- **`WizardData.tsx`**: New `SetupStep` interface, `OnboardingFormData` type, `WizardProvider` with form state, per-step validation, non-blocking progress saves via `saveOnboardingProgress()`
- **`WizardStepContent.tsx`**: Full form renderers for all 6 steps with real inputs, file uploads, team member CRUD, chip selectors
- **`WizardNavigation.tsx`**: Prev/Next with step title labels; last step hidden (confirmation button lives in step content)
- **Sidebar nav label**: "Recorrido Guiado" → "Configuración inicial"

### Added

- **`FileUpload` component** (`src/components/ui/FileUpload.tsx`): Reusable drag-and-drop + click file upload with preview, delete, size validation (10 MB default), file type filtering, ARIA labels, error messages in Spanish
- **New type exports**: `SetupStep`, `OnboardingFormData`, `TeamMember` from `src/components/wizard/index.ts`

## [0.8.1] — 2026-03-18

### Fixed

- **RBAC security**: Default role fallback changed from `admin` to `recepcion` (most-restrictive) when user profile or metadata has no role. First-user signup remains intentionally `admin`. (`src/lib/auth/context.tsx`)
- **i18n**: "Dashboard" → "Panel principal" in main page heading (`src/app/dashboard/page.tsx`)
- **i18n**: PWA shortcut name/short_name changed from "Dashboard" to "Panel" (`src/app/manifest.ts`)

### Added

- **Doctoraliar → Directorio wiring**: `getDoctors()` now enriches results with Doctoraliar profile URLs when `DOCTORALIAR_CLIENT_ID` is configured. Local doctors matched by name get `profileUrl`; unmatched Doctoraliar-only doctors are appended. Graceful fallback on API errors. (`src/lib/services/directorio.ts`)
- **`DOCTORALIAR_FACILITY_ID` env var**: Optional — if set, skips facility lookup. Otherwise auto-resolves from `getFacilities()` and caches.
- **Doctoraliar tests**: URL builders, `isDoctoraliarConfigured()`, `DoctoraliarError`, and directorio service integration tests. (`src/__tests__/lib/doctoraliar.test.ts`)

### Changed

- **CSP hardened**: Added `object-src 'none'`, `upgrade-insecure-requests`, and `https://www.doctoraliar.com` to `connect-src`. Comment explains `unsafe-inline` is required by Next.js hydration. (`next.config.mjs`)

### Audited (no changes needed)

- **Chatbot emojis**: Enterprise audit claimed "40 emojis" — verified **zero** emojis exist. File uses em-dashes (—), bullet points (•), and box-drawing chars only.
- **Chatbot English strings**: Bilingual by design via `en(lang)` helper — every response has ES/EN variants. Not a leak.
- **Double-hyphens in integraciones**: Zero found — audit claim is stale.
- **Helvetica in PDFs**: Zero `Helvetica` references anywhere in codebase.
- **RBAC route map**: 18 routes fully mapped including directorio, triage, wizard, interconsultas, nubix.
- **UI accessibility**: Button, Modal, Toggle, PageHeader all have proper ARIA attributes (`aria-label`, `aria-checked`, `aria-modal`, `aria-labelledby`, `role="switch"`).

## [0.8.0] — 2026-03-18

### Added

- **Doctoraliar API client** (`src/lib/doctoraliar.ts`) — Full OAuth2 client for Docplanner v3 API (Argentina's doctoraliar.com): facilities, doctors, addresses, slots, bookings, insurance providers, services, notifications. Cached 24h token with automatic refresh.
- **Doctoraliar API route** (`/api/doctoraliar`) — Server-side proxy with auth + rate limiting. GET: facilities, doctors, doctor detail, addresses, services, slots, bookings, insurances, address-insurances. POST: book slot, cancel booking.
- **Env vars**: `DOCTORALIAR_CLIENT_ID`, `DOCTORALIAR_CLIENT_SECRET` added to server schema
- **Doctor type extended**: `profileUrl?` and `source?` fields added to `Doctor` interface

### Changed

- **Directorio page** — All external links now point to Doctoraliar.com instead of TopDoctors.com.ar. Uses `doc.profileUrl` when available from API, falls back to Doctoraliar search URL.
- **Patient medicos page** — All booking and profile links updated to Doctoraliar
- **Hero banner translations** — Updated badge text from TopDoctors to Doctoraliar (both patient and provider segments, ES/EN)
- **API_REFERENCE.md** — Doctoraliar section renumbered to §14 (TopDoctors legacy section removed entirely)
- **FEATURES.md** — Integrations table updated to Doctoraliar with full API description

### Removed

- **`src/lib/topdoctors.ts`** — Deleted entirely. All TopDoctors URL builders, `TopDoctorsDoctor` interface, and `enrichWithTopDoctors()` function removed.
- **TopDoctors references** — Purged from translations, types, docs (FEATURES, API_REFERENCE, FULL_AUDIT_DOC). `"topdoctors"` removed from `Doctor.source` union type.

## [0.7.0] — 2026-03-17

### Added

- **Alertas API** (`/api/alertas`) — GET fetches from `alertas` table by `clinic_id` with demo fallback; PATCH supports `mark_read`, `mark_all_read`, `dismiss` actions
- **Verificacion API** (`/api/verificacion`) — GET by `?dni=` with Supabase `pacientes` lookup and static known-patients fallback
- **Alertas page rewrite** — now uses SWR for live data, real mark-as-read and dismiss via PATCH, category filters, unread-only toggle
- **Verificacion page rewrite** — calls real API instead of `setTimeout` stub; builds session history of lookups
- **Export buttons wired** on 4 remaining dashboard pages (inventario, nomenclador, financiadores, inflacion) — replaced `showDemo()` toasts with real `useExport()` PDF/Excel downloads

### Changed

- `Alerta` type now includes `read: boolean` matching DB schema
- Financiadores and inflacion export buttons relabeled from "CSV" to "Excel" (downloads actual `.xlsx` via ExcelJS)
- Export buttons show loading state and disable during download

### Removed

- Hardcoded alert arrays and fake verification delay from dashboard pages

## [0.5.1] — 2026-03-16

### Added

- **Test coverage tripled**: 172 tests across 14 files (up from 62/5)
- 7 new service test suites covering demo-mode CRUD, filtering, stats, and write-guard assertions for facturación, rechazos, financiadores, inflación, inventario, nomenclador, reportes
- `require-auth.test.ts` — tests for cookie auth, corrupt cookie, missing fields, Supabase fallback
- `onboarding.test.ts` — tests for demo-mode onboarding lifecycle
- Coverage thresholds bumped: statements 9%, branches 7%, functions 14%, lines 9%

## [0.5.0] — 2026-03-16

### Added

- **Migration 004**: 10 new Supabase tables — `network_doctors`, `interconsultas`, `solicitudes_estudio`, `facturas`, `rechazos`, `financiadores`, `inflacion_mensual`, `inventario`, `nomenclador`, `reportes`; all with RLS clinic isolation, updated_at triggers, and Realtime publication
- **7 service files** (`facturacion.ts`, `rechazos.ts`, `financiadores.ts`, `inflacion.ts`, `inventario.ts`, `nomenclador.ts`, `reportes.ts`) with dual-mode pattern: Supabase queries when configured, demo data otherwise
- **6 SWR hooks** — `useFinanciadoresExtended`, `useInflacionMensual`, `useFinanciadoresInflacion`, `useInventarioItems`, `useNomencladorEntries`, `useReportesList`
- **Dashboard pages wired to Supabase**: financiadores, inflación, inventario, nomenclador, reportes — all with loading spinners and error handling
- **Multi-tenant clinic onboarding** (`onboarding.ts` service) — real Supabase insert for clinic creation, progress tracking, wizard `completeSetup` action
- **Uptime monitoring**: `/api/status` API route with health checks for Supabase, PostHog, Vercel; `/status` public page with auto-refresh every 60s
- **PWA enhancements**: enhanced `manifest.ts` with shortcuts and screenshots; `sw.js` service worker with offline-first caching; `InstallPrompt` component for mobile install banner; `/offline` fallback page
- **CSP fix**: added `posthog.com`, `us.i.posthog.com`, `sentry.io` to Content-Security-Policy `connect-src`

### Changed

- Dashboard pages now use SWR hooks → services instead of inline hardcoded data arrays
- WizardProvider now exposes `completeSetup`, `isSubmitting`, `setupError` for real onboarding flow
- Root layout includes `InstallPrompt` component for PWA install prompt
- Manifest `start_url` changed from `/` to `/dashboard`

## [0.4.0] — 2026-03-15

### Added

- **PostHog analytics** — `posthog-js` + `posthog-node`, PostHogProvider, server-side analytics
- **Resend email service** — transactional emails for auth flows
- **Password reset + magic link** — full auth flow with Supabase + Resend
- **RBAC system** — RequirePermission / RouteGuard components, role-based access control
- **Turno scheduling** — appointment booking with slot management and Supabase persistence
- **Audit log viewer** — real-time audit trail with filters, timeline, and Supabase Realtime
- **Patient history timeline** — clinical history with entries, types, and doctor attribution
- **Red de Interconsultas** — physician referral network with search, request, and tracking
- **Google Workspace DNS** — MX, SPF, DKIM, DMARC records via Vercel

### Fixed

- Demo login wall — middleware rewritten to never redirect pages, only API routes
- RouteGuard renders children for unauthenticated users (demo browsing)

## [0.3.0] — 2026-03-10

### Added

- Zod environment variable validation (`lib/env.ts`) with server + client schemas
- Husky git hooks + lint-staged (pre-commit: prettier + eslint --fix)
- Test coverage thresholds (60% statements, 50% branches, 55% functions, 60% lines)
- Sentry error tracking with `@sentry/nextjs` (client/server/edge configs, PII redaction)
- Structured logging with `pino` (JSON production, pretty dev, domain child loggers)
- Converted all `<img>` to `next/image` — zero ESLint warnings

### Changed

- CI pipeline now runs `test:coverage` with threshold enforcement
- Error boundaries (`error.tsx`, `dashboard/error.tsx`) now capture to Sentry
- Health endpoint reports Sentry configuration status
- Analytics module uses structured logger instead of `console.debug`

## [0.2.0] — 2026-03-10

### Added

- AuthProvider with RBAC (admin, médico, facturación, recepción roles)
- Security headers: CSP, HSTS, X-Frame-Options, Permissions-Policy
- Reusable UI component library (15 components: Button, Card, Input, Select, StatusBadge, etc.)
- Vitest unit testing (56 tests: utils, validations, data services)
- Playwright E2E testing (8 smoke tests)
- GitHub Actions CI pipeline (lint -> typecheck -> test -> build -> e2e)
- SEO: `robots.txt`, `sitemap.xml`, `manifest.webmanifest`, enhanced meta tags
- Legal pages: Política de Privacidad and Términos de Servicio (Argentina/Ley 25.326)
- Error boundaries + loading skeletons for all routes (14 sub-route loading files)
- `api/health` endpoint with edge runtime
- Centralized demo data service (`lib/services/data.ts`) with async patterns
- Zod validation schemas for all domain entities
- Route protection middleware (Supabase-aware with demo mode fallback)

### Changed

- Root layout wraps with `AuthProvider`
- Dashboard layout: mobile-responsive sidebar with ARIA landmarks
- Refactored dashboard pages (main, facturacion, rechazos, pacientes) to use UI components

## [0.1.0] — 2026-03-09

### Added

- Initial Next.js 14 App Router project with TypeScript
- Landing page with Hero, Features, Stats, Problem, Pricing, Waitlist, Footer sections
- Dashboard with 26 routes covering:
  - Executive overview with KPIs
  - Facturación (invoice management)
  - Rechazos (rejection management)
  - Pacientes (patient management + detail view)
  - Agenda (appointment scheduling)
  - Inventario (inventory management)
  - Nomenclador (billing codes)
  - Reportes (report generation)
  - Auditoría (audit management)
  - Alertas (notifications)
  - Verificación (eligibility checking)
  - Financiadores (payer management)
  - Inflación (inflation impact tracking)
  - Configuración (settings hub + 5 sub-pages)
- Tailwind CSS custom theme: celeste, gold, ink brand tokens
- Deployed to Vercel at condor-salud.vercel.app

[Unreleased]: https://github.com/ellioappio-gif/condor-salud/compare/v0.3.0...HEAD
[0.3.0]: https://github.com/ellioappio-gif/condor-salud/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/ellioappio-gif/condor-salud/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/ellioappio-gif/condor-salud/releases/tag/v0.1.0

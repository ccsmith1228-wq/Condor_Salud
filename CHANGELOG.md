# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.23.1] — 2026-04-08

### Added

- **WhatsApp reminders for internal turnos** — The daily cron (`/api/cron/reminders`) now includes a third pass querying the `turnos` table for tomorrow's confirmed/pending turnos. Resolves patient `telefono` and `email` from the `pacientes` table, then sends WhatsApp template reminders (Meta `reminder-24h` template with free-form fallback) and email reminders via `clinic-notifications.sendBookingReminder()`. Previously only `appointments` and `clinic_bookings` received reminders.
- **Migration 006 helper** — `scripts/apply-migration-006.mjs` assists with applying the WhatsApp CRM migration to Supabase.

### Changed

- **Cron `maxDuration` raised to 60s** — Accommodates three reminder passes (appointments → turnos → clinic_bookings).

## [0.21.1] — 2026-04-04

### Fixed

- **Receptionist patient save** — Replaced inline Supabase client creation in `/api/dashboard/patients` with the shared `getServiceClient()` from `@/lib/supabase/service`. The old code silently created an anon-key client if `SUPABASE_SERVICE_ROLE_KEY` was missing, causing RLS to block inserts. The shared module validates the key exists and throws a clear error.

### Added

- **Doctor dropdown with hours of operation** — The agenda's "New Appointment" modal and professional filter chips now show each doctor's weekly schedule (e.g. "Lun 14:30–16:30 · Jue 10:00–12:00"). Hours are derived from `doctor_availability` slots over the next 14 days. Selecting a professional in the filter shows a schedule banner. The dropdown options include hours inline.
- **`DoctorScheduleEntry` type** — New type in `types.ts` for structured day/start/end schedule entries.
- **`formatDoctorSchedule()` helper** — Exported from `directorio.ts` for compact schedule display strings.
- **Schedule enrichment in `getDoctors()`** — Directorio service now fetches `doctor_availability` slots and attaches a `schedule` array to each `Doctor` object.

## [0.21.0] — 2026-04-03

### Added

- **Patient self-service portal** — New `/reservar/[slug]/turno/[bookingId]` page where patients can verify identity (email), view booking details, cancel with optional reason, and reschedule to a new date/time. Full cancel & reschedule flows with conflict checking, WhatsApp + email notifications, and bilingual (ES/EN) support.
- **Patient bookings API** — New `GET/PATCH /api/clinics/[slug]/patient-bookings/[bookingId]` endpoint for patient self-service. Supports lookup by email/phone verification, cancel with notifications, and reschedule with slot conflict detection. Includes demo fallback for testing.
- **WhatsApp 2-hour reminder cron** — New `/api/cron/reminders-2h` Vercel cron (runs every 2 hours) sends appointment reminders 2–4 hours before confirmed bookings. Uses Meta WhatsApp templates with free-form fallback. Tracks `reminder_2h_sent_at` to avoid duplicates.
- **SEO & Open Graph for booking pages** — New `/reservar/[slug]/layout.tsx` with `generateMetadata()` fetching clinic name, address, doctor count, and specialties from Supabase. Full Open Graph (`og:image`, `og:title`, `og:description`), Twitter cards, and JSON-LD structured data (`MedicalClinic` + `ReserveAction` schema.org).
- **Migration 020** — `supabase/migrations/020_reminder_columns.sql` adds `reminder_sent_at` and `reminder_2h_sent_at` columns to `clinic_bookings` with partial indexes for efficient cron lookups.
- **E2E tests for per-doctor booking flow** — Rewrote `e2e/booking.spec.ts` with tests for clinic header, search, specialty filters, doctor cards, date/time selection, full happy-path booking, public API endpoints, and patient portal verification flow.
- **"Manage my appointment" link** — Booking confirmation page now shows a direct link to the patient self-service portal with auto-verified email.

### Changed

- **`sendBookingReminder()`** — Now accepts `templateName` parameter and attempts Meta WhatsApp template delivery first, falling back to free-form messaging if templates aren't configured.
- **`sendMetaTemplate()`** — Fixed Meta Graph API component structure: body parameters now correctly grouped into a single `body` component array. Added configurable `language` parameter (was hardcoded `es_AR`).
- **`vercel.json`** — Added `reminders-2h` cron schedule (`0 */2 * * *`).
- **Public route strict null fix** — Fixed TypeScript strict null check in `/api/clinics/[slug]/public` schedule grouping.

## [0.20.0] — 2026-03-23

### Added

- **Blank-slate dashboard policy** — All 9 dashboard sub-pages now show `<EmptyState>` with calls-to-action when no real data exists, instead of hardcoded mock arrays. Removed ~860 lines of inline demo data from: pacientes, pacientes/[id], agenda, disponibilidad, inventario, reportes, whatsapp, recordatorios, pagos.
- **DATA POLICY header** — `src/lib/services/data.ts` now has a comprehensive policy comment explaining the dual approach: blank-slate for authenticated dashboard, demo data for public/marketing pages, service-layer mock fallback for local dev/CI.
- **Patient detail rewrite** — `pacientes/[id]/page.tsx` fully rewritten to use `usePacientes()`, `useTurnos()`, `useFacturas()` SWR hooks with loading skeletons and empty states instead of hardcoded patient/historial/turnos/facturacion objects.
- **Wizard step explanations** — `WizardStepContent.tsx` rewritten with thorough Argentine-context explanations for all 9 onboarding steps.
- **Config API routes** — New `PUT /api/config/recordatorios` and `PUT /api/config/pagos` for persisting reminder and payment settings to Supabase.
- **SWR config hooks** — New `usePaymentConfig()` and `useReminderConfig()` hooks with save mutation support.
- **Dashboard blank-slate tests** — New vitest suite verifying empty-state rendering when hooks return no data.
- **Performance: dynamic imports** — Heavy dashboard pages lazy-loaded with `next/dynamic` and loading skeletons.
- **E2E blank-slate tests** — Updated smoke and accessibility specs for dashboard sub-pages with empty states.

### Changed

- **`EmptyState` component** — Enhanced with `compact`, `actionLabel`, and `actionHref` props for in-page blank-slate sections.
- **KPI zeroing** — WhatsApp, recordatorios, and pagos pages show zeroed KPIs when no real data is available instead of mock values.
- **FacturaEstado casing** — Fixed `pacientes/[id]` to use lowercase `"cobrada"`/`"rechazada"` matching the `FacturaEstado` type union.

### Fixed

- **WhatsApp KPI references** — Removed references to deleted `confirmados` and `sinResp` variables.
- **`templates` to `DEFAULT_TEMPLATES`** — Fixed all references in recordatorios page after rename.

## [0.19.0] — 2026-03-21

### Added

- **End-to-end booking flow** — `/paciente/turnos` "Confirmar turno" button now calls `POST /api/bookings` creating a real `appointments` row in Supabase (or a demo booking in demo mode). Cancel button calls `DELETE /api/bookings` setting status to `cancelled`.
- **`POST /api/bookings` route** — Creates appointment in the `appointments` table (migration 005), fires SendGrid `sendBookingConfirmation()` email, and returns the new appointment for optimistic SWR updates.
- **`DELETE /api/bookings` route** — Cancels an appointment by ID, fires SendGrid `sendBookingCancellation()` email.
- **`GET /api/bookings/slots` route** — Returns available time slots for a specialty + date. Queries `doctor_availability` table in Supabase, falls back to demo slots.
- **Dynamic time slots** — Step 3 of the booking modal fetches real availability from `/api/bookings/slots` with a loading spinner, instead of a hardcoded array.
- **Doctor picker** — Step 4 shows a dropdown of doctors filtered by the selected specialty (from the doctor directory SWR cache). Defaults to "A asignar".
- **Appointment type selector** — Step 4 includes Presencial / Teleconsulta toggle.
- **SWR mutation hooks** — `useCreateBooking()` and `useCancelBooking()` with optimistic updates that prepend/update the appointment list. `useAvailableSlots(specialty, date)` fetches slots.
- **`createBooking()`, `cancelBooking()`, `getAvailableSlots()`** — New service functions in `patient-data.ts` that call the API routes.
- **Migration 009** — `009_doctors_geo_photo.sql` adds `lat`, `lng`, `photo_url` columns to `doctors` table with Buenos Aires backfill and geo index.

### Fixed

- **18 TypeScript test errors** — Added non-null assertions (`!`) to all `array[0].prop` and `array[i]` accesses across 7 test files (`facturacion`, `financiadores`, `inflacion`, `inventario`, `nomenclador`, `rechazos`, `reportes`).
- **`full_setup.sql` schema sync** — Added `lat`, `lng`, `photo_url` columns to the `doctors` table in the consolidated setup script.

### Changed

- **Cancel is real** — Cancel button on upcoming appointments now calls the API (with optimistic revert on failure) instead of only updating local state.
- **Booking confirm shows loading** — Submit button shows a spinner and disables while the API call is in flight.

## [0.18.2] — 2026-03-21

### Removed

- **Doctoraliar / Doctoralia integration** — Removed all references: env vars (`DOCTORALIAR_CLIENT_ID`, `DOCTORALIAR_CLIENT_SECRET`), i18n banner text, JSDoc comments. The scraper still detects Docplanner booking URLs on doctor websites as an external booking platform.

### Changed

- **Booking buttons route internally** — All "Sacar turno" and "Reservar" buttons in `/paciente/medicos` and `/dashboard/directorio` now navigate to `/paciente/turnos` instead of opening Google Maps search URLs. Google Maps links remain as a separate "Ver ubicación" option.
- **Doctor photos wired to UI** — Added `photoUrl` field to `PatientDoctor` and `Doctor` interfaces. Both `paciente/medicos/page.tsx` and `dashboard/directorio/page.tsx` now display real doctor photos (from Google Places proxy or database) with graceful fallback to initials/icon.
- **`getDoctorDirectory()` lat/lng fix** — Reads real `lat`/`lng` coordinates from Supabase `doctors` table instead of hardcoding all doctors to `-34.6037, -58.3816`. Falls back to Buenos Aires center if columns not present.
- **`mapDoctor()` reads `photo_url`** — Directorio service now maps `photo_url` column from database to `Doctor.photoUrl`.
- **Docs updated** — Replaced all Doctoraliar references in `API_REFERENCE.md`, `FEATURES.md`, and `FULL_AUDIT_DOC.md` with Google Places API documentation.
- **Scraper booking types** — Renamed Doctoralia booking type label to "Docplanner" for clarity.

## [0.14.0] — 2026-03-20

### UX & Quality — Phase 4

- **U-06: Empty states** — Added `<EmptyState>` conditional rendering to 5 dashboard pages (inventario, nomenclador, financiadores, inflacion, reportes). Users now see a friendly message with icon instead of blank tables/grids when data is empty or filtered to zero results.
- **I-02: Pagination** — Created new `<Pagination>` component with first/last page, current±1, ellipsis logic, and full ARIA labels (`aria-label="Paginación"`, `aria-current="page"`, prev/next navigation). Integrated into `<DataTable>` with `pageSize` prop (default 20).
- **U-05: Profile edit guard** — Added read-only informational banner to `/paciente/perfil` medical info section with Shield icon: "Información médica protegida — Estos datos solo pueden ser modificados por tu médico tratante."
- **Q-04: Currency formatting** — Replaced 3 inline `$${Math.round(...)}K` / `$${(...).toFixed(1)}M` patterns with centralized `formatCurrency()` / `formatARS()` calls in dashboard, inventario, and nomenclador pages. All monetary values now render consistently as `$12.500` via `Intl.NumberFormat("es-AR")`.
- **UM-12: Dynamic dates** — Replaced hardcoded "2025 Anual" / "2025" date options in reportes with `new Date().getFullYear()` so the dropdown stays current automatically.
- **Q-02: Eliminate any types** — Reduced `any` from 75 occurrences across the codebase to 1 centralized definition in `db-types.ts`. Created `SupabaseClient` and `DBRow` type aliases, replaced `(sb as any)` in 9 service files (~34 occurrences), replaced `row: any` / `f: any` / `r: any` callbacks (~21 occurrences). Added `NomencladorEntry[]` and `ReporteEntry[]` generics to SWR hooks. Created `PacienteDisplay` interface for pacientes page. Extended manifest return type with `Screenshot` and `Shortcut` interfaces.

### Audit Verification — Items Already Resolved in Prior Releases

- **I-01** (SWR hooks): Already done — all 12+ data modules use SWR with typed hooks in `use-data.ts`
- **D-02/U-01** (Waitlist): Already done — form validation, success states, and error handling
- **U-04** (Chatbot reset): Already done — reset button in chatbot UI
- **U-03** (Geolocation opt-in): Already done — `lazy: true` in both TopDoctors consumers
- **D-05** (Planes SEO): Already done — `metadata` export with title, description, and OpenGraph in `planes/layout.tsx`

## [0.13.0] — 2026-03-20

### Accessibility — Phase 3

- **A-06: Toggle focus rings** — Added `focus-visible:ring-2 focus-visible:ring-celeste-dark focus-visible:ring-offset-2` to 6 inline toggle buttons across `configuracion/notificaciones`, `configuracion/whatsapp`, and `configuracion/recordatorios` pages. Keyboard users can now see which toggle is focused (WCAG 2.4.7 Focus Visible).
- **A-08: Table header scope** — Added `scope="col"` to 250 `<th>` elements across 28 files. Screen readers can now properly associate data cells with their column headers (WCAG 1.3.1 Info and Relationships).

### Audit Verification — Items Already Resolved in Prior Releases

- **A-01** (skip-to-content link): Already fixed — `<a href="#main-content">` with sr-only + focus styles in `layout.tsx`
- **A-02** (DemoModal): Already fixed — `role="dialog"`, `aria-modal="true"`, focus trap, Escape handler, focus restore
- **A-03** (FAQ accordion): Already fixed — `aria-expanded`, `aria-controls`, unique panel IDs, `aria-labelledby`
- **A-04/A-07** (form labels): Already fixed — sr-only `<label>` on Waitlist inputs, `aria-label` on verificacion DNI input
- **A-05** (Toast): Already fixed — `role="status"` + `aria-live="polite"` on container, `role="alert"` on each toast
- **A-09** (focus-visible ring): Already fixed — all `focus:outline-none` paired with `focus:ring`/`focus:border`; global `*:focus-visible` outline in `globals.css`
- **AM-01** (prefers-reduced-motion): Already fixed — `@media (prefers-reduced-motion: reduce)` zeroes all animation/transition durations in `globals.css`

## [0.12.0] — 2026-03-20

### Security — Phase 2 Auth & Safety

- **SH-07: Nonce-based Content Security Policy** — Replaced static `unsafe-inline` script-src with per-request cryptographic nonces generated in middleware. Uses `'strict-dynamic'` for CSP Level 3 browsers (auto-trusts scripts loaded by nonce'd scripts), with `'unsafe-inline'` as a fallback for older browsers (ignored when `strict-dynamic` present). Removed static CSP from `next.config.mjs`; now set dynamically by middleware on every response.
- **I-05: Production env validation hardened** — Added `notPlaceholder` Zod refinement that rejects values containing `your-project`, `placeholder`, `xxxx`, or `YOUR_`. Applied to 6 critical env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `SUPABASE_JWT_SECRET`. Both server and client schemas now reject placeholder credentials.

### Audit Verification — Items Already Resolved in Prior Releases

- **D-01** (chatbot links to `/dashboard/*`): Already fixed — all URLs point to `/paciente/*`
- **D-03** (no patient portal error boundary): Already fixed — `error.tsx` exists at `/paciente/error.tsx`
- **SH-01** (no CSRF on OAuth): Already fixed — `verifyState()` with state cookie
- **SH-02** (no rate limit on auth): Already fixed — `rateLimit()` on google callback
- **SH-03** (Google OAuth assigns admin): Already fixed — assigns `"medico"` role
- **SH-06** (weak password policy): Already fixed — register requires 12+ chars, upper, lower, number, special
- **SH-08** (no file validation on triage upload): Already fixed — `ALLOWED_PHOTO_TYPES` + `MAX_PHOTO_SIZE`

## [0.11.0] — 2026-03-21

### Security — Phase 1 CRITICAL Hardening

- **S-01/S-02: Auth enforcement on all API routes** — Added `requireAuth()` + rate limiting to `/api/push/subscribe` POST. All 16 API routes now require authentication (chatbot and waitlist are intentionally public with rate limiting).
- **I-04: Zod schema validation on all POST/PUT/PATCH routes** — Created 10 new Zod schemas in `src/lib/validations/schemas.ts` and wired them into 9 API routes:
  - `nubixActionSchema` — discriminatedUnion for send-results + upsert-appointment actions
  - `telemedicinaRoomSchema` — validates patientName + consultationId
  - `whatsappSummarySchema` — validates phone format, patient/doctor names, diagnosis
  - `chatbotMessageSchema` — validates message (max 2000 chars), coords, history (max 50), lang
  - `pushSubscriptionSchema` — validates endpoint URL + keys (p256dh, auth)
  - `alertaPatchSchema` — validates action enum + optional ids array
  - `doctoraliarActionSchema` — discriminatedUnion for book + cancel actions with full booking payload validation
  - `whatsappConfigPutSchema` — validates config fields + templates array
  - `waitlistSchema` — validates email format
- All unsafe `as` type casts and manual field checks replaced with proper Zod `.safeParse()` + 400 error responses with structured field errors.

### Audit Verification — Items Already Resolved in Prior Releases

The following CRITICAL audit items were verified as already implemented:

- **PS-01** (greeting overrides emergency): Intent priority system already exists — `greeting: 1`, `pain_chest: 10`
- **PS-02** (no crisis card): Crisis card with `tel:135` already exists at line 1020+ in chatbot-engine
- **S-03** (demo mode in production): Session API already blocks demo login in production
- **S-04/S-05** (httpOnly session): `requireAuth()` already reads encrypted httpOnly cookies via AES-256-GCM
- **S-06** (Google token exposure): Google callback already encrypts tokens before storing in cookie
- **S-09** (in-memory rate limiter): Upstash Redis rate limiter already implemented
- **S-10** (waitlist in-memory): Waitlist already persists to Supabase via upsert

## [0.9.8] — 2026-03-19

### Changed

- **Demo mode moved to provider/clinic level** — no longer determined by `isSupabaseConfigured()` env var
  - Added `demo BOOLEAN NOT NULL DEFAULT false` column to `clinics` table (migration `007_clinic_demo_flag.sql`)
  - Extended `User` type with `isDemo: boolean` — resolved from `clinics.demo` via profile join
  - Updated `resolveProfile()` in auth context to fetch `clinics(name, demo)`
  - Updated session API (GET/POST) to include `isDemo` in all responses
  - Created `useIsDemo()` hook in `@/lib/auth/context` — returns `true` when clinic is demo OR Supabase not configured (local dev fallback)
  - Updated `useCrudAction(isDemo)` to accept demo flag parameter instead of checking env
  - Replaced all 84 `isSupabaseConfigured()` calls across 20 dashboard pages with `useIsDemo()` / `isDemo`
  - New clinics default to `demo: false`; set `demo: true` in DB to enable demo mode per clinic

## [0.9.7] — 2026-03-20

### Changed

- **Wired real CRUD actions across all 86 showDemo() calls — dual-mode preserved**
  - Created `useCrudAction` hook (`src/hooks/use-crud-action.ts`) — reusable pattern that executes real Supabase mutations when configured, falls back to DemoModal when not, handles toast feedback and SWR cache invalidation
  - **Facturación**: "Nueva factura" opens a full creation form with Supabase insert; "Ver" opens a slide-over detail panel with all invoice fields
  - **Rechazos**: "Reprocesar" calls `reprocesarRechazo()` (updates estado to "reprocesado"); "Descartar" calls `descartarRechazo()`; "Ver factura original" navigates to facturación
  - **Pacientes**: "Nueva consulta" calls `createManualLead()` via CRM service; "Nuevo paciente" guides to lead conversion flow
  - **Paciente [id]**: "Editar paciente" wired with real-mode toast feedback
  - **Financiadores**: "Ver detalle" opens slide-over with full financial metrics; "Contactar" opens mailto with pre-filled subject
  - **Inventario**: "Registrar ingreso" opens modal form → `createInventarioItem()` with category, stock, price, proveedor fields
  - **Interconsultas**: "Nueva interconsulta" calls `createInterconsulta()`; "Solicitar estudio" calls `createSolicitudEstudio()`
  - **Configuración** (7 pages, 34 calls): equipo, clínica, integraciones, facturación/billing, notificaciones, recordatorios, pagos — all wired with `isSupabaseConfigured()` ternary
  - **Specialty pages** (5 pages, 39 calls): farmacia, telemedicina, directorio, triage, nubix — all wired with dual-mode ternary
  - **Demo mode fully preserved**: All 86 actions still show the WhatsApp CTA modal when Supabase is not configured

### Technical

- 20+ files changed, ~+800 lines
- Zero breaking changes — demo mode untouched
- Build passes clean with zero TypeScript errors

## [0.9.6] — 2026-03-19

### Fixed

- **Google Maps & Places integration in Cora now works end-to-end**
  - Geo intents (`nearby_doctor`, `nearby_pharmacy`, `nearby_guardia`, `directions`, `shared_location`, `location`) now route to the rule-based engine instead of Claude AI — the rule-based engine has live Google Places data and generates structured cards with "Get directions" and "View on map" links, while Claude only received raw coordinates as text context and could not produce actionable cards
  - Fixed `fetchLivePlaces` missing `openNow` field for doctors — pharmacies and hospitals had it but doctors didn't, so doctor open/closed status was never shown
  - Exported new `detectGeoIntent()` helper from chatbot-engine for use by the API route

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

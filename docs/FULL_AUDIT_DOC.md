# Cóndor Salud — Complete Application Audit Document

> **Generated:** 2026-03-17  
> **Purpose:** Comprehensive documentation of every feature, function, route, service, and security mechanism for external audit.  
> **Stack:** Next.js 14.2 (App Router) · React 18 · TypeScript · Supabase · Tailwind CSS · Deployed on Vercel

---

## Table of Contents

1. [Application Overview](#1-application-overview)
2. [Technology Stack & Dependencies](#2-technology-stack--dependencies)
3. [Architecture & Infrastructure](#3-architecture--infrastructure)
4. [Route Map (All Pages)](#4-route-map-all-pages)
5. [API Routes (All Endpoints)](#5-api-routes-all-endpoints)
6. [Authentication & Authorization](#6-authentication--authorization)
7. [Middleware](#7-middleware)
8. [Database Schema (Supabase/PostgreSQL)](#8-database-schema)
9. [Row-Level Security (RLS) Policies](#9-row-level-security-policies)
10. [Dashboard Modules (1–15)](#10-dashboard-modules)
11. [Patient Portal](#11-patient-portal)
12. [Landing Page & Marketing](#12-landing-page--marketing)
13. [AI & Chatbot System (Cora)](#13-ai--chatbot-system)
14. [Service Layer (All Services)](#14-service-layer)
15. [Custom React Hooks](#15-custom-react-hooks)
16. [UI Component Library](#16-ui-component-library)
17. [Security Implementation](#17-security-implementation)
18. [Third-Party Integrations](#18-third-party-integrations)
19. [Internationalization (i18n)](#19-internationalization)
20. [Analytics & Observability](#20-analytics--observability)
21. [Plan & Pricing System](#21-plan--pricing-system)
22. [Export System (PDF/Excel)](#22-export-system)
23. [Real-time Features](#23-real-time-features)
24. [Environment Variables](#24-environment-variables)
25. [Testing Infrastructure](#25-testing-infrastructure)
26. [Deployment & Docker](#26-deployment--docker)
27. [File Tree (Full)](#27-file-tree)

---

## 1. Application Overview

**Cóndor Salud** is a multi-tenant SaaS platform for the Argentine healthcare system. It provides a unified intelligence dashboard for medical clinics to manage billing, insurance claims (obras sociales, prepagas, PAMI), patient records, telemedicine, pharmacy, triage, and more.

### Key Business Domain

- **Target Market:** Argentine medical clinics, consultorios, sanatorios
- **Insurance Entities:** PAMI (national seniors' health), obras sociales (union-based), prepagas (private)
- **Regulatory Context:** Argentine healthcare nomenclator (SSS), AFIP electronic invoicing (WSFEV1), IPC inflation tracking
- **Languages:** Spanish (AR) primary, English secondary

### Dual-Portal Architecture

1. **Provider Portal** (`/dashboard/*`) — For clinic staff (doctors, billing, reception, admin)
2. **Patient Portal** (`/paciente/*`) — For patients (appointments, coverage, medications, teleconsulta)
3. **Landing/Marketing** (`/`, `/planes`, `/privacidad`, `/terminos`) — Public-facing

### Demo Mode

All dashboard pages are **browsable without authentication** using hardcoded demo data. Write operations are gated by a `DemoModal` component that prompts users to sign up. This allows prospects to explore the full platform before committing.

---

## 2. Technology Stack & Dependencies

### Core Framework

| Technology   | Version | Purpose                                 |
| ------------ | ------- | --------------------------------------- |
| Next.js      | 14.2.15 | Full-stack React framework (App Router) |
| React        | 18.3.1  | UI library                              |
| TypeScript   | 5.x     | Type safety                             |
| Tailwind CSS | 3.4.13  | Utility-first CSS                       |

### Backend & Data

| Technology          | Version        | Purpose                                      |
| ------------------- | -------------- | -------------------------------------------- |
| Supabase (SSR + JS) | 0.9.0 / 2.99.0 | PostgreSQL database, auth, storage, realtime |
| Zod                 | 4.3.6          | Schema validation (env, forms, API input)    |
| Pino                | 10.3.1         | Structured JSON logging                      |

### AI & Communication

| Technology    | Version | Purpose                                                     |
| ------------- | ------- | ----------------------------------------------------------- |
| Anthropic SDK | 0.78.0  | Claude AI for Cora chatbot                                  |
| Twilio        | 5.12.2  | WhatsApp messaging (appointment reminders, summaries)       |
| Resend        | 6.9.3   | Transactional email (alerts, welcome, signup notifications) |

### Payments & Finance

| Technology  | Version | Purpose                        |
| ----------- | ------- | ------------------------------ |
| MercadoPago | 2.12.0  | Payment processing (Argentina) |

### Video & Imaging

| Technology                  | Version | Purpose                            |
| --------------------------- | ------- | ---------------------------------- |
| Daily.co                    | 0.87.0  | WebRTC video consultations         |
| Nubix Cloud (custom client) | —       | RIS/PACS DICOM imaging integration |

### Security & Auth

| Technology                | Version        | Purpose                                  |
| ------------------------- | -------------- | ---------------------------------------- |
| jose                      | 6.2.1          | JWT verification, AES-256-GCM encryption |
| Upstash Redis + Ratelimit | 1.36.4 / 2.0.8 | Rate limiting (production)               |

### Export & Documents

| Technology          | Version | Purpose                               |
| ------------------- | ------- | ------------------------------------- |
| @react-pdf/renderer | 4.3.2   | Server-side PDF generation            |
| ExcelJS             | 4.4.0   | Server-side Excel workbook generation |
| file-saver          | 2.0.5   | Client-side file download             |

### Analytics & Monitoring

| Technology | Version | Purpose                                                |
| ---------- | ------- | ------------------------------------------------------ |
| PostHog    | 1.360.2 | Product analytics, feature flags                       |
| Sentry     | 10.42.0 | Error tracking, performance monitoring, session replay |

### Forms & UI

| Technology            | Version | Purpose                      |
| --------------------- | ------- | ---------------------------- |
| react-hook-form       | 7.71.2  | Form state management        |
| @hookform/resolvers   | 5.2.2   | Zod → react-hook-form bridge |
| lucide-react          | 0.577.0 | Icon library                 |
| tailwind-merge + clsx | —       | Conditional class names      |
| SWR                   | 2.4.1   | Data fetching with caching   |

### Dev & Testing

| Technology                        | Purpose                     |
| --------------------------------- | --------------------------- |
| Vitest + @vitest/coverage-v8      | Unit testing with coverage  |
| Playwright + @axe-core/playwright | E2E testing + accessibility |
| @testing-library/react            | Component testing           |
| ESLint + Prettier                 | Linting + formatting        |
| Husky + lint-staged               | Pre-commit hooks            |
| @next/bundle-analyzer             | Bundle analysis             |

---

## 3. Architecture & Infrastructure

### App Router Structure

```
src/
├── app/                  # Next.js App Router pages
│   ├── layout.tsx        # Root layout (providers, metadata)
│   ├── page.tsx          # Landing page
│   ├── api/              # 17 API route files
│   ├── auth/             # Login, register, forgot/reset password, verify
│   ├── dashboard/        # Provider portal (22 sub-routes)
│   ├── paciente/         # Patient portal (9 sub-sections)
│   ├── planes/           # Pricing page
│   ├── privacidad/       # Privacy policy
│   ├── terminos/         # Terms of service
│   ├── status/           # Public status page
│   └── offline/          # PWA offline fallback
├── components/           # 24 components + ui/ + wizard/
├── hooks/                # SWR data hooks
└── lib/                  # Services, utils, types, security
```

### Provider Hierarchy (Root Layout)

```
<PostHogProvider>
  <LanguageProvider>          # i18n (ES/EN + segment overrides)
    <SWRProvider>             # Global SWR config
      <PlanProvider>          # Selected modules/plan state
        <AuthProvider>        # Auth context (Supabase or demo)
          {children}
          <Chatbot />         # Global AI chatbot (Cora)
          <InstallPrompt />   # PWA install prompt
        </AuthProvider>
      </PlanProvider>
    </SWRProvider>
  </LanguageProvider>
</PostHogProvider>
```

### Dashboard Layout Provider Hierarchy

```
<SWRProvider>
  <ToastProvider>
    <DemoModalProvider>
      {children}
    </DemoModalProvider>
  </ToastProvider>
</SWRProvider>
```

### Multi-Tenant Data Strategy

- Each clinic gets a `clinic_id` on signup (auto-created via Supabase trigger)
- All tables include `clinic_id` column for tenant isolation
- RLS policies enforce `clinic_id = get_clinic_id()` on every query
- `get_clinic_id()` helper function resolves the current user's clinic via the `profiles` table

### Deployment

- **Platform:** Vercel (implied by edge runtime usage, Vercel env vars)
- **Docker:** Multi-stage Dockerfile (deps → build → standalone runner)
- **Health Check:** `GET /api/health` (edge runtime, for load balancers)
- **Status Page:** `GET /api/status` (checks all external services)

---

## 4. Route Map (All Pages)

### Public Pages

| Route         | Description                                           |
| ------------- | ----------------------------------------------------- |
| `/`           | Landing page (segment-aware: Provider vs Tourist)     |
| `/planes`     | Plan builder with 3 presets + custom module selection |
| `/privacidad` | Privacy policy                                        |
| `/terminos`   | Terms of service                                      |
| `/status`     | Public status page                                    |
| `/offline`    | PWA offline fallback                                  |

### Auth Pages

| Route                   | Description                                                                  |
| ----------------------- | ---------------------------------------------------------------------------- |
| `/auth/login`           | Email/password + Google OAuth login                                          |
| `/auth/registro`        | Full registration form (name, email, clinic, CUIT, provincia, financiadores) |
| `/auth/forgot-password` | Password reset request                                                       |
| `/auth/reset-password`  | Password reset form                                                          |
| `/auth/verify`          | Email verification                                                           |

### Provider Dashboard (22 routes)

| Route                       | Module | Description                                                      |
| --------------------------- | ------ | ---------------------------------------------------------------- |
| `/dashboard`                | —      | Executive dashboard (KPIs, financiador table, agenda, audit)     |
| `/dashboard/pacientes`      | Mod 1  | Patient registry (search, filter, CRUD)                          |
| `/dashboard/agenda`         | Mod 2  | Appointment scheduling (week grid + list, Google Calendar sync)  |
| `/dashboard/verificacion`   | Mod 3  | Insurance coverage verification by DNI/CUIL                      |
| `/dashboard/inventario`     | Mod 4  | Medical supply inventory (stock, alerts, movements)              |
| `/dashboard/facturacion`    | Mod 5  | Invoice management (filter, export PDF/Excel)                    |
| `/dashboard/rechazos`       | Mod 6  | Claim rejection management (reprocesar, descartar)               |
| `/dashboard/financiadores`  | Mod 7  | Insurance entity analytics (cobro %, payment days)               |
| `/dashboard/inflacion`      | Mod 8  | Inflation impact tracker (IPC vs billing cycles)                 |
| `/dashboard/pagos`          | Mod 9  | Redirects → `/dashboard/configuracion/pagos`                     |
| `/dashboard/auditoria`      | Mod 10 | Pre-submission audit (code validation, duplicates)               |
| `/dashboard/nomenclador`    | Mod 11 | Medical procedure code browser (SSS, PAMI, OSDE values)          |
| `/dashboard/reportes`       | Mod 12 | Report generation center (10 report types, PDF/Excel)            |
| `/dashboard/alertas`        | Mod 13 | Alert center (pagos, rechazos, aranceles, inventario)            |
| `/dashboard/farmacia`       | Mod 14 | Online pharmacy (catalog, prescriptions, delivery, copago)       |
| `/dashboard/telemedicina`   | Mod 15 | Telemedicine (waiting room, video, auto-billing, prescriptions)  |
| `/dashboard/directorio`     | Mod 16 | Medical directory (search, availability, TopDoctors integration) |
| `/dashboard/triage`         | Mod 17 | AI triage system (symptoms, routing, clinical notes)             |
| `/dashboard/interconsultas` | Mod 18 | Physician referral network (interconsultas, study requests)      |
| `/dashboard/nubix`          | Mod 19 | RIS/PACS imaging (studies, DICOM viewer, reports)                |
| `/dashboard/wizard`         | —      | Interactive onboarding tour                                      |
| `/dashboard/configuracion`  | —      | Settings hub (10 sub-pages)                                      |

### Configuration Sub-Pages

| Route                                     | Description                                                     |
| ----------------------------------------- | --------------------------------------------------------------- |
| `/dashboard/configuracion/clinica`        | Clinic profile settings                                         |
| `/dashboard/configuracion/equipo`         | Team member management                                          |
| `/dashboard/configuracion/integraciones`  | Third-party integration settings                                |
| `/dashboard/configuracion/facturacion`    | Billing & plan settings                                         |
| `/dashboard/configuracion/notificaciones` | Notification preferences                                        |
| `/dashboard/configuracion/whatsapp`       | WhatsApp Business configuration                                 |
| `/dashboard/configuracion/pagos`          | Payment & collection settings                                   |
| `/dashboard/configuracion/recordatorios`  | WhatsApp appointment reminders (templates, stats, activity log) |

### Patient Portal (9 sections)

| Route                    | Description                                                              |
| ------------------------ | ------------------------------------------------------------------------ |
| `/paciente`              | Patient health dashboard (alerts, appointments, vitals, nearby services) |
| `/paciente/turnos`       | Book/manage appointments                                                 |
| `/paciente/cobertura`    | Insurance coverage details                                               |
| `/paciente/medicamentos` | Active medications & prescriptions                                       |
| `/paciente/teleconsulta` | Telemedicine access                                                      |
| `/paciente/medicos`      | Find doctors                                                             |
| `/paciente/sintomas`     | Symptom checker                                                          |
| `/paciente/historia`     | Clinical history                                                         |
| `/paciente/perfil`       | Personal profile settings                                                |

---

## 5. API Routes (All Endpoints)

### Authentication

| Endpoint                        | Methods | Auth | Rate Limit | Description                                                    |
| ------------------------------- | ------- | ---- | ---------- | -------------------------------------------------------------- |
| `POST /api/auth/session`        | POST    | —    | —          | Create session (login/register via Supabase or demo cookie)    |
| `GET /api/auth/session`         | GET     | —    | —          | Read current session                                           |
| `DELETE /api/auth/session`      | DELETE  | —    | —          | Destroy session (logout)                                       |
| `POST /api/auth/signup-notify`  | POST    | —    | —          | Send admin notification on new registration (email + WhatsApp) |
| `GET /api/auth/google/callback` | GET     | —    | 10/60s     | Google OAuth callback (token exchange, session creation)       |

### Core Domain APIs

| Endpoint              | Methods | Auth | Rate Limit | Description                                                             |
| --------------------- | ------- | ---- | ---------- | ----------------------------------------------------------------------- |
| `POST /api/chatbot`   | POST    | —    | 20/60s     | AI chatbot (Claude AI + rule-based fallback + Google Places enrichment) |
| `GET /api/triage`     | GET     | ✅   | 15/60s     | Triage list or KPIs (by `action` param)                                 |
| `POST /api/triage`    | POST    | ✅   | 15/60s     | Create triage entries or save clinical notes                            |
| `GET /api/directorio` | GET     | ✅   | —          | Doctor directory (filter by specialty/location/financiador)             |
| `GET /api/farmacia`   | GET     | ✅   | 10/60s     | Pharmacy data (medications, prescriptions, deliveries, KPIs)            |
| `POST /api/farmacia`  | POST    | ✅   | 10/60s     | Create prescriptions or update delivery status                          |
| `GET /api/coverage`   | GET     | —    | 30/60s     | Insurance coverage lookup (Supabase + static fallback)                  |
| `GET /api/nubix`      | GET     | ✅   | 10/60s     | Nubix RIS/PACS data (studies, reports, viewer, KPIs)                    |
| `POST /api/nubix`     | POST    | ✅   | 10/60s     | Nubix actions (send results, upsert appointments)                       |

### Telemedicine APIs

| Endpoint                                  | Methods | Auth | Rate Limit | Description                                                     |
| ----------------------------------------- | ------- | ---- | ---------- | --------------------------------------------------------------- |
| `GET /api/telemedicina`                   | GET     | ✅   | —          | Waiting room, consultations, scheduled, KPIs                    |
| `POST /api/telemedicina/room`             | POST    | ✅   | 5/60s      | Create Daily.co video room (screen share, recording, 1h expiry) |
| `POST /api/telemedicina/whatsapp-summary` | POST    | ✅   | 5/60s      | Send post-consultation WhatsApp summary via Twilio              |

### Reports & Export APIs

| Endpoint                   | Methods | Auth | Rate Limit | Description                                                                |
| -------------------------- | ------- | ---- | ---------- | -------------------------------------------------------------------------- |
| `POST /api/reportes/pdf`   | POST    | ✅   | 5/60s      | Generate PDF (facturación, rechazos, KPI dashboard)                        |
| `POST /api/reportes/excel` | POST    | ✅   | 5/60s      | Generate Excel (facturación, rechazos, nomenclador, inventario, pacientes) |

### Google Integration APIs

| Endpoint                    | Methods | Auth | Rate Limit | Description                                        |
| --------------------------- | ------- | ---- | ---------- | -------------------------------------------------- |
| `GET /api/google/calendar`  | GET     | —    | 15/60s     | Fetch Google Calendar events (configurable window) |
| `POST /api/google/calendar` | POST    | —    | 10/60s     | Create calendar event with patient/doctor details  |

### Geolocation APIs

| Endpoint                                      | Methods | Auth | Rate Limit | Description                                                   |
| --------------------------------------------- | ------- | ---- | ---------- | ------------------------------------------------------------- |
| `GET /api/geolocation?action=reverse-geocode` | GET     | ✅   | 30/60s     | Coords → neighborhood name (Google Geocoding + CABA fallback) |
| `GET /api/geolocation?action=nearby`          | GET     | ✅   | 30/60s     | Nearby places (Google Places, configurable type/radius)       |

### Infrastructure APIs

| Endpoint               | Methods | Auth | Rate Limit | Description                                             |
| ---------------------- | ------- | ---- | ---------- | ------------------------------------------------------- |
| `GET /api/health`      | GET     | —    | —          | Edge runtime health check (status + response time)      |
| `GET /api/status`      | GET     | —    | —          | Detailed multi-service status page                      |
| `POST /api/csp-report` | POST    | —    | —          | CSP violation reporting endpoint                        |
| `POST /api/waitlist`   | POST    | —    | 5/60s      | Waitlist signup (email → Supabase + admin notification) |

---

## 6. Authentication & Authorization

### Authentication Modes

The app supports **three authentication strategies** (checked in priority order by `require-auth.ts`):

1. **Demo Session Cookie** — Encrypted httpOnly cookie (`condor_session`) for demo/dev mode
2. **Google OAuth Cookie** — Encrypted httpOnly cookie (`condor_google_session`) with Google user info + tokens
3. **Supabase Auth** — JWT-based authentication via `@supabase/ssr` cookie management

### Auth Flow

```
Login → POST /api/auth/session → Creates encrypted cookie OR Supabase session
Google → /api/auth/google/callback → Token exchange → Encrypted cookie + public user cookie
Supabase → Standard Supabase Auth flow → SSR cookie management
```

### Role-Based Access Control (RBAC)

**4 Roles:**
| Role | Display Name | Description |
|---|---|---|
| `admin` | Administrador | Full access to all modules |
| `medico` | Médico | Patients, agenda, reports, audit |
| `facturacion` | Facturación | Billing, rejections, reports, inventory |
| `recepcion` | Recepción | Patients, agenda, inventory |

**13 Granular Permissions:**
| Permission | Admin | Médico | Facturación | Recepción |
|---|---|---|---|---|
| `pacientes:read` | ✅ | ✅ | ✅ | ✅ |
| `pacientes:write` | ✅ | ✅ | — | ✅ |
| `facturacion:read` | ✅ | — | ✅ | — |
| `facturacion:write` | ✅ | — | ✅ | — |
| `agenda:read` | ✅ | ✅ | — | ✅ |
| `agenda:write` | ✅ | ✅ | — | ✅ |
| `inventario:read` | ✅ | — | ✅ | ✅ |
| `inventario:write` | ✅ | — | — | — |
| `reportes:read` | ✅ | ✅ | ✅ | — |
| `auditoria:read` | ✅ | ✅ | ✅ | — |
| `configuracion:read` | ✅ | — | — | — |
| `configuracion:write` | ✅ | — | — | — |
| `equipo:manage` | ✅ | — | — | — |

### RBAC Route Protection

Routes are mapped to required permissions in `rbac.ts`:

```
/dashboard/pacientes → pacientes:read
/dashboard/agenda → agenda:read
/dashboard/facturacion → facturacion:read
/dashboard/rechazos → facturacion:read
/dashboard/financiadores → facturacion:read
/dashboard/inflacion → facturacion:read
/dashboard/nomenclador → facturacion:read
/dashboard/inventario → inventario:read
/dashboard/reportes → reportes:read
/dashboard/auditoria → auditoria:read
/dashboard/configuracion → configuracion:read
```

### RBAC Components

- `RequirePermission` — Permission gate (shows children or `AccessDeniedPage`)
- `RequireRole` — Role gate
- `RequireRoutePermission` — Page-level route guard with redirect
- `useHasPermission()` / `useHasRole()` — Hooks for conditional UI

---

## 7. Middleware

**File:** `src/middleware.ts`

### Route Classification

- **Public API Routes** (no auth): `/api/health`, `/api/status`, `/api/chatbot`, `/api/waitlist`, `/api/auth`, `/api/csp-report`
- **Auth Routes** (redirect if logged in): `/auth/login`, `/auth/registro`, `/auth/forgot-password`
- **Protected API Routes** (require auth): All other `/api/*` routes
- **Dashboard Pages** (always accessible): All `/dashboard/*` pages render with demo data without auth

### Middleware Logic

1. Public API routes → skip all checks
2. If Supabase is configured:
   - Protected API routes without auth → 401
   - Authenticated users on auth pages → redirect to dashboard
   - RBAC check on dashboard sub-routes → redirect if forbidden
3. If Supabase is NOT configured:
   - Dashboard pages → accessible (demo mode)
   - Protected API in production → 503

### Security Features

- **Open redirect prevention:** `sanitizeRedirect()` only allows relative paths (no `//` or `:` in path)
- **Graceful degradation:** If auth service fails, pages still accessible but API routes blocked

### Matcher Pattern

Matches all routes except: `_next/static`, `_next/image`, `favicon.ico`, `logos/`

---

## 8. Database Schema

### Tables (33 total)

#### Multi-Tenant Core

| Table      | Purpose                            | Key Columns                                                                          |
| ---------- | ---------------------------------- | ------------------------------------------------------------------------------------ |
| `clinics`  | Clinic/tenant records              | id, name, cuit (UNIQUE), plan_tier, sedes, provincia, localidad, onboarding_complete |
| `profiles` | User profiles linked to auth.users | id (FK→auth.users), clinic_id, role (admin/medico/facturacion/recepcion), full_name  |

#### Clinical Management (Modules 1–4)

| Table        | Purpose          | Key Columns                                                                                                               |
| ------------ | ---------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `pacientes`  | Patient registry | clinic_id, nombre, apellido, dni, financiador, plan, estado. UNIQUE(clinic_id, dni)                                       |
| `turnos`     | Appointments     | clinic_id, fecha, hora, paciente_id, tipo, estado (confirmado/pendiente/cancelado/atendido), profesional_id, duration_min |
| `inventario` | Medical supplies | clinic_id, nombre, categoria, stock, minimo, precio, proveedor, vencimiento                                               |

#### Financial (Modules 5–9)

| Table               | Purpose                 | Key Columns                                                                                             |
| ------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------- |
| `facturas`          | Invoices                | clinic_id, numero (UNIQUE), financiador, paciente_id, monto, estado (5 states), codigo_nomenclador, cae |
| `rechazos`          | Claim rejections        | clinic_id, factura_id, motivo (7 enum values), estado (pendiente/reprocesado/descartado), reprocesable  |
| `financiadores`     | Insurance entities      | clinic_id, name (UNIQUE), type (os/prepaga/pami), facturado, cobrado, tasa_rechazo, dias_promedio_pago  |
| `inflacion`         | Inflation tracking      | clinic_id, mes, ipc, facturado, cobrado, dias_demora, perdida_real                                      |
| `inflacion_mensual` | Extended inflation data | clinic_id, anio, mes_num (UNIQUE per clinic)                                                            |

#### Intelligence (Module 10)

| Table         | Purpose            | Key Columns                                                                            |
| ------------- | ------------------ | -------------------------------------------------------------------------------------- |
| `auditoria`   | Audit observations | clinic_id, tipo, severidad (alta/media/baja), estado (pendiente/revisado/resuelto)     |
| `nomenclador` | Procedure codes    | codigo (UNIQUE), valor_sss, valor_pami, valor_osde, valor_swiss, valor_galeno, vigente |
| `reportes`    | Report definitions | clinic_id, nombre, categoria, frecuencia                                               |
| `alertas`     | System alerts      | clinic_id, tipo (5 types), titulo, detalle, read                                       |

#### Pharmacy (Module 11)

| Table              | Purpose                | Key Columns                                                                                                       |
| ------------------ | ---------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `medications`      | Drug catalog           | clinic_id, name, lab, category, price, pami_coverage, os_coverage, prepaga_coverage, stock, requires_prescription |
| `prescriptions`    | Digital prescriptions  | clinic_id, code (UNIQUE), patient_name, doctor_name, items (JSONB), status                                        |
| `deliveries`       | Pharmacy deliveries    | clinic_id, code (UNIQUE), patient_name, address, status, courier, progress                                        |
| `recurring_orders` | Chronic patient orders | clinic_id, code (UNIQUE), medications (JSONB), frequency, next_delivery                                           |

#### Telemedicine (Module 12)

| Table           | Purpose              | Key Columns                                                                                                          |
| --------------- | -------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `consultations` | Video consultations  | clinic_id, code (UNIQUE), patient_name, doctor_name, specialty, status (6 states), billed, bill_code, video_room_url |
| `waiting_room`  | Virtual waiting room | clinic_id, consultation_id, patient_name, queue_position, intake_complete                                            |

#### Directory (Module 13)

| Table                 | Purpose         | Key Columns                                                                               |
| --------------------- | --------------- | ----------------------------------------------------------------------------------------- |
| `doctors`             | Doctor profiles | name, specialty, location, financiadores (JSONB), rating, teleconsulta, languages (JSONB) |
| `doctor_reviews`      | Doctor reviews  | doctor_id, rating (1-5), text, verified                                                   |
| `doctor_availability` | Time slots      | doctor_id, date, time_slot, booked. UNIQUE(doctor_id, date, time_slot)                    |

#### Triage (Module 14)

| Table            | Purpose        | Key Columns                                                                                          |
| ---------------- | -------------- | ---------------------------------------------------------------------------------------------------- |
| `triages`        | Triage entries | clinic_id, code (UNIQUE), symptoms (JSONB), severity (1-10), routed_specialty, routed_doctor, status |
| `clinical_notes` | Clinical notes | clinic_id, triage_id, consultation_id, icd10_codes (JSONB), notes, treatment_plan, referrals (JSONB) |

#### Interconsultas (Module 18)

| Table                 | Purpose           | Key Columns                                                                   |
| --------------------- | ----------------- | ----------------------------------------------------------------------------- |
| `network_doctors`     | Referral network  | clinic_id, nombre, especialidad, obras_sociales (TEXT[]), acepta_derivaciones |
| `interconsultas`      | Referral requests | clinic_id, paciente_nombre, doctor_origen, doctor_destino, prioridad, estado  |
| `solicitudes_estudio` | Study requests    | clinic_id, paciente_nombre, tipo_estudio, centro, estado                      |

#### Chatbot & Public

| Table             | Purpose                 | Key Columns                                                                    |
| ----------------- | ----------------------- | ------------------------------------------------------------------------------ |
| `coverage_plans`  | Insurance coverage data | provider*key (UNIQUE), provider_name, covers*_ (7 booleans), copay\__          |
| `available_slots` | Booking slots           | clinic_id, doctor_profile_id, slot_date, slot_time, is_telemedicine, is_booked |
| `appointments`    | Chatbot bookings        | slot_id, patient_id, status (confirmed/cancelled/completed/no_show)            |
| `waitlist`        | Marketing waitlist      | email (UNIQUE), source, segment                                                |

---

## 9. Row-Level Security (RLS) Policies

### Tenant Isolation

**Helper function:** `public.get_clinic_id()` → returns `clinic_id` from `profiles` where `id = auth.uid()`

**All domain tables** (pacientes, facturas, rechazos, financiadores, inflacion, turnos, inventario, reportes, auditoria, medications, prescriptions, deliveries, recurring_orders, consultations, waiting_room, triages, clinical_notes, network_doctors, interconsultas, solicitudes_estudio, inflacion_mensual) enforce:

- `SELECT ... WHERE clinic_id = get_clinic_id()`
- `INSERT ... WITH CHECK (clinic_id = get_clinic_id())`
- `UPDATE ... USING (clinic_id = get_clinic_id())`
- `DELETE ... USING (clinic_id = get_clinic_id())`

### Special Policies

| Table                        | Policy                                                                              |
| ---------------------------- | ----------------------------------------------------------------------------------- |
| `clinics`                    | SELECT own clinic; UPDATE by admins only                                            |
| `profiles`                   | SELECT teammates (same clinic); UPDATE own row only                                 |
| `nomenclador`                | Public read for authenticated; service_role write; anon read where `vigente = true` |
| `waitlist`                   | INSERT by anon + authenticated; SELECT by service_role only                         |
| `doctors` / `doctor_reviews` | SELECT by authenticated + anon (patient portal access)                              |
| `coverage_plans`             | SELECT by authenticated + anon where active                                         |
| `available_slots`            | Public read (unbooked only); clinic members manage all                              |
| `appointments`               | Patients see own (`patient_id = auth.uid()`); clinic manages own                    |

### Storage Bucket Policies

| Bucket          | Policy                                                    |
| --------------- | --------------------------------------------------------- |
| `triage-photos` | Upload/read restricted to `clinic_id/` folder path        |
| `reports`       | Upload/read/delete restricted to `clinic_id/` folder path |
| `medical-docs`  | Upload/read/delete restricted to `clinic_id/` folder path |

### Auto-Signup Trigger

`handle_new_user()` fires on `auth.users` INSERT → automatically creates a `clinics` row + `profiles` row, extracting metadata (name, clinic_name, cuit, provincia, especialidad, plan_tier) from user_metadata.

### Realtime Enabled On

`alertas`, `turnos`, `inflacion_mensual`

---

## 10. Dashboard Modules (1–15+)

### Module 1: Pacientes (`/dashboard/pacientes`)

- Patient registry with search by name/DNI
- Filter by financiador (PAMI, OSDE, Swiss Medical, Galeno, IOMA, Medifé, Sancor) and estado
- KPIs: Total patients, Active, PAMI patients, Patients with pending appointments
- Actions: Create patient, view patient file
- Currently uses hardcoded demo data

### Module 2: Agenda (`/dashboard/agenda`)

- Week grid view (Mon–Sat, half-hour slots) and list view
- Google Calendar integration (merges events as virtual "Teleconsulta" turnos with Meet links)
- Filter by professional (4 specialties)
- Actions: Create turno (modal), confirm, mark attended, cancel
- Real API integration with SWR + optimistic mutations
- Conflict detection on turno creation
- Permission gated: `agenda:write` for write operations

### Module 3: Verificación de Cobertura (`/dashboard/verificacion`)

- Real-time insurance coverage lookup by DNI/CUIL
- Returns: nombre, financiador, plan, vigencia, grupo familiar
- Active/inactive status visual indicator
- Intended for real-time PAMI/Swiss Medical API integration (currently simulated)

### Module 4: Inventario (`/dashboard/inventario`)

- Medical supply tracking with categories (Medicamento, Descartable, Insumo, Reactivo, Equipamiento)
- KPIs: Total items, Critical stock, Low stock, Inventory value
- Red alert banner when items are at critical levels
- Recent movements log
- Fetched via SWR hooks with real Supabase queries

### Module 5: Facturación (`/dashboard/facturacion`)

- Invoice management with filter by financiador and estado (5 states)
- KPIs: Total facturado, Cobrado, Pendiente, Rechazado
- Export to PDF and Excel
- Actions: Create factura (demo), view detail
- Real data fetching via `useFacturas()` hook

### Module 6: Rechazos (`/dashboard/rechazos`)

- Claim rejection management with motivo breakdown (7 rejection reason types)
- KPIs: Total rechazado ($), Pendientes, Reprocesables, Tasa de recupero
- Actions: Reprocesar factura, Descartar, View original
- Export to PDF/Excel
- Expandable cards with detail view
- Financiador breakdown (PAMI/IOMA)

### Module 7: Financiadores (`/dashboard/financiadores`)

- Insurance entity analytics with card grid + comparison table
- KPIs: Total facturado, Total cobrado, Rechazo promedio %, Días pago promedio
- Progress bars for cobro percentage per financiador
- Color-coded rejection rates (green <5%, amber 5-10%, red >10%)
- Export PDF/Excel, contact financiador

### Module 8: Inflación (`/dashboard/inflacion`)

- IPC (Consumer Price Index) impact on billing cycles
- KPIs: Pérdida total, IPC promedio, Días demora promedio, Pérdida por día
- Monthly loss bar chart
- Per-financiador inflation impact table
- Formula explanation panel
- Period selector (3/6 months), export PDF/Excel/CSV

### Module 9: Pagos (`/dashboard/pagos`)

- Redirects to `/dashboard/configuracion/pagos`
- MercadoPago integration for payment processing

### Module 10: Auditoría (`/dashboard/auditoria`)

- Pre-submission audit engine detecting: incorrect codes, expired authorizations, duplicates, exceeded limits
- KPIs: Total observations, Pending, High severity, Resolved
- Actions: Execute auto-audit, mark as reviewed/resolved
- Permission gated: `auditoria:read`
- Expandable cards with links to facturación/nomenclador

### Module 11: Nomenclador (`/dashboard/nomenclador`)

- Medical procedure code browser (SSS national nomenclator)
- Per-financiador values: PAMI, OSDE, Swiss Medical, Galeno
- Compare mode (side-by-side financiador values with delta %)
- Quick reference panels for SSS modules
- Export to Excel

### Module 12: Reportes (`/dashboard/reportes`)

- 10 predefined report types across categories (Financiero, Gestión, Operativo)
- PDF and Excel export per report
- Generation history log with download
- Category filter tabs, period selector

### Module 13: Alertas (`/dashboard/alertas`)

- 6 alert categories: Pagos, Rechazos, Aranceles, Inventario, Vencimientos, Sistema
- Priority levels: Urgente, Alta, Media, Baja
- Read/unread toggle, mark all as read
- Each alert links to its related module page

### Module 14: Farmacia Online (`/dashboard/farmacia`)

5 sub-tabs:

1. **Catálogo** — Drug catalog with search, category filter, coverage %, stock status, add to cart
2. **Recetas** — Digital prescriptions with WhatsApp carrito pre-cargado
3. **Delivery** — Real-time tracking (Rappi + PedidosYa integration), progress bars
4. **Copago** — Automatic copayment calculator by financiador (PAMI 80-100%, OS, Prepaga)
5. **Recurrentes** — Monthly recurring orders for chronic patients

### Module 15: Telemedicina (`/dashboard/telemedicina`)

5 sub-tabs:

1. **Sala de espera** — Virtual waiting room with queue position, intake status, video initiation
2. **Consultas** — Video consultation history, active session card, screen sharing, recording
3. **Facturación auto** — Automatic billing with nomenclator code assignment after teleconsulta
4. **Receta digital** — Teleconsulta → digital prescription → pharmacy online flow
5. **Resumen WhatsApp** — Post-consultation summary sent via WhatsApp (diagnosis, instructions, next appointment)

### Module 16: Directorio Médico (`/dashboard/directorio`)

5 sub-tabs:

1. **Búsqueda** — Doctor search by specialty, location, financiador, availability
2. **Disponibilidad** — Real-time availability calendar
3. **Perfiles** — Doctor detail with reviews, bio, languages
4. **Cobertura** — Coverage verification per financiador
5. **Recomendaciones** — TopDoctors.com.ar integration for external booking

### Module 17: Triage (`/dashboard/triage`)

6 sub-tabs:

1. **Síntomas** — Symptom input by body system (12 systems with symptom lists)
2. **Detalle** — Severity scale (1-10), frequency, duration, triggers
3. **Notas clínicas** — ICD-10 code assignment, treatment plan, referrals
4. **Intake** — Pre-consultation intake forms
5. **Clínicas** — Clinical data display
6. **Routing** — Automatic specialty routing based on symptoms

### Module 18: Red de Interconsultas (`/dashboard/interconsultas`)

3 sub-tabs:

1. **Red de Profesionales** — Referral network directory (grouped by specialty, availability badges)
2. **Interconsultas** — Referral requests with priority/estado tracking
3. **Estudios** — Study order requests (laboratorio, imagen, cardiología)

### Module 19: Nubix RIS/PACS (`/dashboard/nubix`)

4 sub-tabs:

1. **Estudios** — Radiology study list with modality, status, urgency
2. **Turnos** — Imaging appointment management
3. **Entregas** — Result delivery (WhatsApp, email, patient portal, SMS)
4. **Visor** — DICOM viewer integration (Nubix Cloud + local OHIF fallback)

### Settings: Configuración (`/dashboard/configuracion`)

10 sub-pages:

1. Clínica — Clinic profile (name, CUIT, address)
2. Equipo — Team members (roles, permissions)
3. Integraciones — External service connections
4. Facturación — Billing settings
5. Nomenclador — Code configuration
6. Notificaciones — Alert preferences
7. WhatsApp Turnos — Appointment reminder configuration
8. Pagos — Payment collection (MercadoPago)
9. Recordatorios — WhatsApp templates (5 templates, send stats, activity log)
10. Tu Plan — Subscription management

### Interactive Wizard (`/dashboard/wizard`)

- Multi-step guided onboarding tour
- Sidebar navigation with progress tracking
- Covers all 15+ platform features in ~5 minutes

---

## 11. Patient Portal

**Layout:** Full sidebar + top header with 9 navigation sections, name prompt on first visit, WhatsApp float + Chatbot.

### Patient Dashboard (`/paciente`)

- Personalized greeting (stored in cookie)
- Health alerts (prescription expiry, pending lab results)
- Quick actions: Book appointment, teleconsulta, medications, symptom checker
- Upcoming appointments list
- Coverage card (e.g., "OSDE 310")
- Vitals grid: Blood pressure, weight, glucose, heart rate (with trends)
- Active medications with days remaining
- Nearby services (doctors, pharmacies, hospitals) via geolocation

### Sub-Pages

| Page                     | Features                            |
| ------------------------ | ----------------------------------- |
| `/paciente/turnos`       | Book/manage appointments            |
| `/paciente/cobertura`    | Insurance coverage details          |
| `/paciente/medicamentos` | Active medications, prescriptions   |
| `/paciente/teleconsulta` | Video consultation access           |
| `/paciente/medicos`      | Find doctors (directory)            |
| `/paciente/sintomas`     | Symptom checker (feeds into triage) |
| `/paciente/historia`     | Clinical history timeline           |
| `/paciente/perfil`       | Personal profile settings           |

---

## 12. Landing Page & Marketing

### Segment-Aware Design

The landing page detects visitor type and shows different content:

- **Provider** (healthcare business emails): Stats → Problem → Features → HowItWorks → Integrations → Security → Testimonials → Pricing → FAQ → Waitlist → FinalCTA
- **Tourist/Patient** (personal emails): PatientStats → Problem → Features → HowItWorks → Security → FAQ → FinalCTA

### Key Landing Components

| Component       | Description                                                      |
| --------------- | ---------------------------------------------------------------- |
| `Navbar`        | Top navigation with CTA                                          |
| `Hero`          | Segment toggle, headline, mock dashboard preview                 |
| `Stats`         | Key metrics (rejection reduction, payment days, recovery amount) |
| `Problem`       | Pain point presentation                                          |
| `Features`      | Feature showcase                                                 |
| `HowItWorks`    | Step-by-step flow                                                |
| `Integrations`  | Third-party integrations display                                 |
| `Security`      | Security features presentation                                   |
| `Testimonials`  | Customer testimonials                                            |
| `Pricing`       | 3-tier plan cards from plan-config                               |
| `FAQ`           | Accordion FAQ section                                            |
| `Waitlist`      | Email capture form                                               |
| `FinalCTA`      | Final conversion section                                         |
| `PatientStats`  | Patient-specific metrics                                         |
| `WhatsAppFloat` | Floating WhatsApp contact button                                 |

### Plans Page (`/planes`)

- 3 preset tiers: Esencial, Profesional, Enterprise
- Custom plan builder with 4 module categories
- Module checkboxes with dependency auto-resolution
- Sticky summary sidebar (desktop) + mobile bottom bar
- ARS pricing with IPC adjustment note
- 6-item FAQ accordion

---

## 13. AI & Chatbot System (Cora)

### Architecture

```
User Message → Emergency Detection (rule-based, never skipped)
            → Claude AI (if API key configured)
            → Rule-based Engine (fallback)
            → Response Enrichment (coverage data, Google Places)
```

### Rule-Based Engine (`chatbot-engine.ts` — 2,669 lines)

- Intent detection via Spanish regex patterns
- Covers: greetings, body-part pain, COVID symptoms, anxiety, allergies, chronic conditions, medication queries, emergency detection
- Routes patients to specialists or OTC recommendations
- Never delegates emergency detection to AI

### Claude AI Integration (`ai/claude.ts`)

- Uses Anthropic SDK with lazy loading
- Detailed healthcare system prompt (bilingual ES/EN)
- Returns structured JSON: text, quick replies, info cards
- Falls back to rule-based engine when API key unavailable

### Chatbot UI (`Chatbot.tsx` — 735 lines)

- Floating widget with message bubbles
- Typing indicator with delay
- Quick reply buttons
- Info cards (with Google Maps directions links)
- Voice input (Web Speech API)
- Geolocation integration for nearby services
- Session persistence (sessionStorage)
- Locale-aware (ES/EN)
- Analytics tracking (PostHog events)

### Enrichment Features

- **Coverage data:** Real Supabase `coverage_plans` lookup for insurance queries
- **Google Places:** Nearby doctors, pharmacies, hospitals when user provides location
- **Emergency detection:** Hardcoded keywords trigger immediate "Call 107" response

---

## 14. Service Layer (All Services)

### Data Services (Supabase + Demo Fallback)

| Service              | File                  | Functions                                                                                       |
| -------------------- | --------------------- | ----------------------------------------------------------------------------------------------- |
| **Central Data**     | `data.ts`             | 24 async getters for all domain entities. Auto-switches between Supabase queries and mock data. |
| **Supabase Queries** | `supabase-queries.ts` | 12 real Supabase database queries with snake_case → camelCase mappers                           |
| **Data Client**      | `data-client.ts`      | Client-side lookup object mapping SWR keys to getter functions                                  |

### Domain Services

| Service            | File                | Key Functions                                                                                                                                                      |
| ------------------ | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Facturación**    | `facturacion.ts`    | getFacturas, getFacturaById, createFactura, updateFactura, getFacturaStats, submitToFinanciador                                                                    |
| **Rechazos**       | `rechazos.ts`       | getRechazos, reprocesarRechazo, descartarRechazo, getRechazoStats, getMotivoBreakdown                                                                              |
| **Financiadores**  | `financiadores.ts`  | getFinanciadores, getFinanciadoresExtended, getFinanciadorById, updateFinanciador, getFinanciadorStats                                                             |
| **Inflación**      | `inflacion.ts`      | getInflacionMensual, getFinanciadoresInflacion, getInflacionResumen, getInflacionTrend                                                                             |
| **Auditoría**      | `audit.ts`          | getAuditoriaFiltered, updateAuditStatus, runAutoAudit, getAuditStats                                                                                               |
| **Nomenclador**    | `nomenclador.ts`    | getNomencladorEntries, getNomencladorById, updateNomenclador, getNomencladorStats                                                                                  |
| **Inventario**     | `inventario.ts`     | getInventarioItems, createItem, updateItem, adjustStock, getInventarioStats                                                                                        |
| **Turnos**         | `turnos.ts`         | getTurnos, createTurno, confirmTurno, cancelTurno, attendTurno, getAvailableSlots, checkConflict, getTurnoStats                                                    |
| **Reportes**       | `reportes.ts`       | getReportesList, generateReport, getReportesByCategoria, getReportStats                                                                                            |
| **Historia**       | `historia.ts`       | getPatientTimeline, getHistoriaClinica, getHistoriaStats, getHistoriaSummary                                                                                       |
| **Farmacia**       | `farmacia.ts`       | getMedications, getPrescriptions, getDeliveries, getRecurringOrders, getFarmaciaKPIs                                                                               |
| **Telemedicina**   | `telemedicina.ts`   | getWaitingRoom, getConsultations, getScheduledConsultations, createVideoRoom, sendWhatsAppSummary, getTelemedicinaKPIs                                             |
| **Directorio**     | `directorio.ts`     | getDoctors, getDoctorReviews, getDoctorAvailability, getDirectorioKPIs                                                                                             |
| **Triage**         | `triage.ts`         | getTriages, getTriageKPIs, createTriage, saveClinicalNote, uploadTriagePhoto. Constants: BODY_SYSTEM_SYMPTOMS, SYMPTOM_SPECIALTY_MAP, ICD10_CODES, SEVERITY_LABELS |
| **Interconsultas** | `interconsultas.ts` | getNetworkDoctors, getInterconsultas, createInterconsulta, getSolicitudesEstudio, createSolicitud, getInterconsultaStats                                           |
| **Nubix**          | `nubix.ts`          | getStudies, getStudyById, getReports, getDeliveries, getViewerConfig, getAppointments, upsertAppointment, getNubixKPIs                                             |
| **Onboarding**     | `onboarding.ts`     | saveClinicSetup, saveOnboardingProgress, getOnboardingStatus, linkProfileToClinic                                                                                  |

### Infrastructure Services

| Service      | File          | Functions                                                                                                                  |
| ------------ | ------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **Email**    | `email.ts`    | sendTurnoReminder, sendAuditAlert, sendWelcomeEmail, sendSignupNotification, isEmailConfigured                             |
| **PDF**      | `pdf.tsx`     | generateFacturacionPDF, generateRechazosPDF, generateKPIDashboardPDF                                                       |
| **Excel**    | `excel.ts`    | generateFacturacionExcel, generateRechazosExcel, generateNomencladorExcel, generateInventarioExcel, generatePacientesExcel |
| **Export**   | `export.ts`   | exportPDF, exportExcel (client-side download triggers), useExport hook                                                     |
| **Storage**  | `storage.ts`  | uploadFile, getSignedUrl, listFiles, deleteFile, moveFile, copyFile (for reports, medical-docs, triage-photos)             |
| **Realtime** | `realtime.ts` | useAlertNotifications, useRealtimeSubscription (Supabase Realtime)                                                         |

---

## 15. Custom React Hooks

### SWR Data Hooks (`hooks/use-data.ts` — 20+ hooks)

| Hook                          | Data Source     | Returns                    |
| ----------------------------- | --------------- | -------------------------- |
| `useDashboardKPIs()`          | `/api/` or mock | KPI[]                      |
| `useFacturas()`               | data service    | Factura[]                  |
| `useRechazos()`               | data service    | Rechazo[]                  |
| `useFinanciadores()`          | data service    | Financiador[]              |
| `useFinanciadoresExtended()`  | service         | ExtendedFinanciador[]      |
| `useInflacionMensual(period)` | service         | InflacionMes[]             |
| `useFinanciadoresInflacion()` | service         | financiador inflation data |
| `usePacientes()`              | data service    | Paciente[]                 |
| `useTurnos()`                 | data service    | Turno[]                    |
| `useInventario()`             | data service    | InventarioItem[]           |
| `useNomencladorEntries()`     | data service    | NomencladorEntry[]         |
| `useAuditoria()`              | data service    | AuditoriaItem[]            |
| `useReportesList()`           | data service    | Reporte[]                  |

### Module-Specific Hooks (`lib/hooks/useModules.ts`)

| Hook                          | Module       | Data               |
| ----------------------------- | ------------ | ------------------ |
| `useMedications()`            | Farmacia     | Medication[]       |
| `usePrescriptions()`          | Farmacia     | Prescription[]     |
| `useDeliveries()`             | Farmacia     | Delivery[]         |
| `useRecurringOrders()`        | Farmacia     | RecurringOrder[]   |
| `useFarmaciaKPIs()`           | Farmacia     | FarmaciaKPIs       |
| `useWaitingRoom()`            | Telemedicina | WaitingRoomEntry[] |
| `useConsultations()`          | Telemedicina | Consultation[]     |
| `useScheduledConsultations()` | Telemedicina | Consultation[]     |
| `useTelemedicinaKPIs()`       | Telemedicina | TelemedicinaKPIs   |
| `useDoctors(filters)`         | Directorio   | Doctor[]           |
| `useDoctorReviews(id)`        | Directorio   | DoctorReview[]     |
| `useDoctorAvailability(id)`   | Directorio   | availability data  |
| `useDirectorioKPIs()`         | Directorio   | DirectorioKPIs     |
| `useTriages()`                | Triage       | Triage[]           |
| `useTriageKPIs()`             | Triage       | TriageKPIs         |
| `useNubixStudies(filters)`    | Nubix        | Study[]            |
| `useNubixKPIs()`              | Nubix        | NubixKPIs          |

### Utility Hooks

| Hook                        | File                         | Purpose                                                                                |
| --------------------------- | ---------------------------- | -------------------------------------------------------------------------------------- |
| `useGeolocation()`          | `hooks/useGeolocation.ts`    | Browser Geolocation API with caching (10-min TTL), permission states, privacy rounding |
| `useNearbyServices()`       | `hooks/useNearbyServices.ts` | Combines geolocation with nearby doctors/pharmacies/centers (Haversine distance)       |
| `usePatientName()`          | `hooks/usePatientName.ts`    | Manages patient display name via 30-day cookie                                         |
| `useExport()`               | `services/export.ts`         | PDF/Excel export with loading state                                                    |
| `useAlertNotifications()`   | `services/realtime.ts`       | Supabase Realtime alert subscription                                                   |
| `useRealtimeSubscription()` | `services/realtime.ts`       | Generic table change subscription                                                      |
| `useHasPermission()`        | `RequirePermission.tsx`      | Check current user's permission                                                        |
| `useHasRole()`              | `RequirePermission.tsx`      | Check current user's role                                                              |

---

## 16. UI Component Library

### Base Components (`components/ui/`)

| Component                                           | Purpose                                   |
| --------------------------------------------------- | ----------------------------------------- |
| `Button`                                            | Primary/secondary/outline button variants |
| `Card` / `CardContent` / `CardHeader` / `CardTitle` | Card container with sections              |
| `ConfirmDialog`                                     | Modal confirmation dialog                 |
| `DataTable`                                         | Generic data table                        |
| `EmptyState`                                        | Empty state placeholder                   |
| `FilterBar`                                         | Search + filter controls                  |
| `Input`                                             | Form input with label                     |
| `KPICard`                                           | KPI display card with accent color        |
| `Modal`                                             | Base modal dialog                         |
| `PageHeader`                                        | Page title + breadcrumbs + actions        |
| `Select`                                            | Dropdown select with label                |
| `Skeleton`                                          | Loading skeleton placeholders             |
| `StatusBadge`                                       | Color-coded status badges                 |
| `Toggle`                                            | Toggle switch                             |

### Wizard Components (`components/wizard/`)

| Component           | Purpose                   |
| ------------------- | ------------------------- |
| `WizardData`        | Wizard step data/content  |
| `WizardNavigation`  | Step navigation controls  |
| `WizardProgress`    | Progress indicator        |
| `WizardSidebar`     | Table of contents sidebar |
| `WizardStepContent` | Step content renderer     |

### Feature Components

| Component                 | Purpose                           |
| ------------------------- | --------------------------------- |
| `Chatbot`                 | AI chatbot floating widget (Cora) |
| `DemoModal`               | Demo action interception modal    |
| `RequirePermission`       | RBAC access control wrapper       |
| `Toast` / `ToastProvider` | Toast notification system         |
| `InstallPrompt`           | PWA install prompt                |
| `WhatsAppFloat`           | Floating WhatsApp contact button  |

---

## 17. Security Implementation

### HTTP Security Headers (next.config.mjs)

| Header                      | Value                                                                |
| --------------------------- | -------------------------------------------------------------------- |
| `X-Frame-Options`           | DENY                                                                 |
| `X-Content-Type-Options`    | nosniff                                                              |
| `Referrer-Policy`           | strict-origin-when-cross-origin                                      |
| `X-DNS-Prefetch-Control`    | on                                                                   |
| `Strict-Transport-Security` | max-age=63072000; includeSubDomains; preload                         |
| `Permissions-Policy`        | camera=(self), microphone=(self), geolocation=(), interest-cohort=() |
| `Content-Security-Policy`   | Comprehensive policy with per-domain allowlists                      |

### CSP Policy Details

```
default-src 'self'
script-src 'self' 'unsafe-inline'
style-src 'self' 'unsafe-inline' fonts.googleapis.com
font-src 'self' fonts.gstatic.com
img-src 'self' data: blob: https:
connect-src 'self' *.supabase.co *.daily.co *.upstash.io api.anthropic.com googleapis.com accounts.google.com *.posthog.com sentry.io
frame-src 'self' *.daily.co
frame-ancestors 'none'
report-uri /api/csp-report
```

### Rate Limiting (`security/rate-limit.ts`)

- **Production:** Upstash Redis sliding window
- **Development:** In-memory rate limiter (Map-based)
- Standard rate-limit response headers (X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset)
- Per-endpoint limits (5–30 req/60s depending on endpoint)

### API Route Guard (`security/api-guard.ts`)

Combined middleware providing:

1. Client IP extraction
2. Rate limit checking (returns 429 on excess)
3. Input sanitization

### Input Sanitization (`security/sanitize.ts`)

- `sanitizeInput(str)` — strips HTML tags
- `escapeHtml(str)` — escapes HTML entities
- `sanitizeString(str, maxLength)` — trim + length limit
- `sanitizeObject(obj)` — recursive deep sanitization of all string values

### Encryption (`security/crypto.ts`)

- AES-256-GCM encryption/decryption for sensitive tokens
- Uses `SESSION_ENCRYPTION_KEY` env var (64-char hex = 32 bytes)
- Dev-only ephemeral fallback key

### Auth Guard (`security/require-auth.ts`)

Server-side API route guard checking 3 strategies:

1. Demo session cookie (encrypted)
2. Google OAuth cookie (encrypted)
3. Supabase JWT

### Open Redirect Prevention

`sanitizeRedirect()` in middleware only allows relative paths (no `//` or `:` in path)

### PII Redaction

Logger auto-redacts: email, DNI, CUIL, password, token, secret, authorization

### Docker Security

- Non-root user (UID 1001)
- Multi-stage build (minimal attack surface)
- Health check built-in

---

## 18. Third-Party Integrations

| Integration            | Purpose                           | Configuration                                                                      |
| ---------------------- | --------------------------------- | ---------------------------------------------------------------------------------- |
| **Supabase**           | Database, Auth, Storage, Realtime | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_JWT_SECRET` |
| **Anthropic (Claude)** | AI chatbot engine                 | `ANTHROPIC_API_KEY`                                                                |
| **Twilio**             | WhatsApp messaging                | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_NUMBER`                |
| **Resend**             | Transactional email               | `RESEND_API_KEY`                                                                   |
| **Daily.co**           | Video consultations (WebRTC)      | `DAILY_API_KEY`                                                                    |
| **Google OAuth**       | Authentication                    | `NEXT_PUBLIC_GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`                             |
| **Google Calendar**    | Appointment sync                  | Via OAuth tokens                                                                   |
| **Google Maps/Places** | Geolocation, nearby services      | `GOOGLE_MAPS_API_KEY`, `NEXT_PUBLIC_GOOGLE_MAPS_KEY`                               |
| **MercadoPago**        | Payment processing                | `MP_ACCESS_TOKEN`, `NEXT_PUBLIC_MP_PUBLIC_KEY`                                     |
| **PostHog**            | Product analytics                 | `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`                              |
| **Sentry**             | Error tracking, performance       | `SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`                  |
| **Upstash Redis**      | Rate limiting                     | `UPSTASH_REDIS_URL`, `UPSTASH_REDIS_TOKEN`                                         |
| **Nubix Cloud**        | RIS/PACS DICOM imaging            | `NUBIX_API_URL`, `NUBIX_API_KEY`, `NUBIX_TENANT_ID`                                |
| **TopDoctors**         | Doctor directory enrichment       | URL-based integration (no API key)                                                 |
| **PAMI API**           | National health insurance         | `PAMI_API_URL`, `PAMI_API_TOKEN`                                                   |
| **AFIP WSFEV1**        | Electronic invoicing              | `AFIP_CERT_PATH`, `AFIP_KEY_PATH`, `AFIP_CUIT`                                     |
| **Swiss Medical**      | Private insurance API             | `SWISS_MEDICAL_CLIENT_ID`, `SWISS_MEDICAL_CLIENT_SECRET`                           |

---

## 19. Internationalization

### Architecture

- `LanguageProvider` context supports ES (default) and EN
- Visitor segment detection: `proveedor` (healthcare), `turista` (patient), `desconocido`
- Segment-specific translation overrides (e.g., provider sees "Facturación", patient sees "My Bills")
- Cookie persistence for locale + segment

### Translation Coverage

- 1,100+ translation keys in `translations.ts`
- Namespaces: nav, hero, stats, problem, features, pricing, patient portal, FAQ
- Both landing page and patient portal are fully i18n-enabled
- Dashboard uses Spanish only (target market is Argentina)

### Segment Detection (`segments.ts`)

- Analyzes email domain against:
  - Personal email dictionary (gmail, hotmail, yahoo, etc.)
  - Healthcare keyword dictionary
- Classifies as: `proveedor`, `turista`, or `desconocido`
- Persisted via cookie

---

## 20. Analytics & Observability

### PostHog Analytics

- `PostHogProvider` initializes on client
- Automatic `$pageview` capture on SPA navigation
- Custom events: `factura_created`, `chatbot_message_sent`, `plan_selected`, etc.
- User identification on login

### Sentry Error Tracking

- Client: 20% traces sample rate (prod), 10% session replay, 100% on-error replay
- Server: Same config
- Edge: Configured for edge runtime
- Source map upload on build
- Filters: browser extensions, ResizeObserver, network errors

### Structured Logging (Pino)

- JSON logging with child loggers per module: `authLog`, `apiLog`, `emailLog`, `nubixLog`, `chatbotLog`
- Auto-redacts PII (email, DNI, password, token)
- Log levels: fatal, error, warn, info, debug, trace
- `clientLog` provides browser-compatible logging with same API shape
- Pretty printing in development

---

## 21. Plan & Pricing System

### Module System

20 modules across 4 categories:

**Gestión Clínica:**
| ID | Module | Price (ARS/month) | Phase |
|---|---|---|---|
| pacientes | Pacientes | $3,500 | 1 |
| agenda | Agenda | $4,000 | 1 |
| verificacion | Verificación de Cobertura | $2,500 | 1 |
| inventario | Inventario | $3,000 | 1 |

**Finanzas:**
| ID | Module | Price (ARS/month) | Phase |
|---|---|---|---|
| facturacion | Facturación | $5,000 | 1 |
| rechazos | Gestión de Rechazos | $4,500 | 1 |
| financiadores | Financiadores | $3,500 | 1 |
| inflacion | Tracker de Inflación | $2,000 | 2 |
| pagos | Pagos y Cobros | $3,000 | 2 |

**Inteligencia:**
| ID | Module | Price (ARS/month) | Phase |
|---|---|---|---|
| auditoria | Auditoría Pre-Presentación | $5,500 | 2 |
| nomenclador | Nomenclador Unificado | $2,000 | 1 |
| reportes | Reportes | $3,000 | 1 |
| alertas | Alertas Inteligentes | $1,500 | 1 |
| wizard | Recorrido Guiado | $0 | 1 |

**Servicios:**
| ID | Module | Price (ARS/month) | Phase |
|---|---|---|---|
| farmacia | Farmacia Online | $6,000 | 3 |
| telemedicina | Telemedicina | $7,000 | 3 |
| directorio | Directorio Médico | $2,500 | 3 |
| interconsultas | Red de Interconsultas | $4,000 | 3 |
| triage | Triage Inteligente | $5,000 | 3 |
| nubix | Nubix Cloud (RIS/PACS) | $8,000 | 4 |

### Preset Plans

| Plan        | Modules        | Discount | Approx. Price  |
| ----------- | -------------- | -------- | -------------- |
| Esencial    | 8 core modules | 15%      | ~$24,650/month |
| Profesional | 14 modules     | 20%      | ~$44,400/month |
| Enterprise  | All 20 modules | 25%      | ~$52,125/month |

### Features

- Module dependency resolution (e.g., rechazos requires facturacion)
- localStorage persistence of selection
- URL sync with `?tier=` parameter
- Custom plan builder with category accordions

---

## 22. Export System

### PDF Generation (Server-Side)

- Uses `@react-pdf/renderer` with branded templates
- 3 report types: Facturación, Rechazos, KPI Dashboard
- Streamed response from API route
- Rate limited: 5 req/60s

### Excel Generation (Server-Side)

- Uses ExcelJS with branded multi-sheet workbooks
- 5 report types: Facturación, Rechazos, Nomenclador, Inventario, Pacientes
- Content-Disposition header for download
- Rate limited: 5 req/60s

### Client-Side Export Hook

```typescript
const { isExporting, exportError, exportPDF, exportExcel } = useExport();
```

- Triggers API calls and handles blob download
- Loading state management
- Error handling

---

## 23. Real-time Features

### Supabase Realtime Subscriptions

- `useAlertNotifications()` — Live alert notifications with mark-as-read
- `useRealtimeSubscription(table)` — Generic hook for any table's INSERT/UPDATE/DELETE

### Enabled Tables

- `alertas` — Real-time alert push
- `turnos` — Appointment changes
- `inflacion_mensual` — Inflation data updates

---

## 24. Environment Variables

### Server-Side Variables (37 total)

| Category           | Variables                                                                             |
| ------------------ | ------------------------------------------------------------------------------------- |
| **Core**           | NODE_ENV, NEXT_PUBLIC_APP_URL, NEXT_PUBLIC_SITE_URL, NEXT_PUBLIC_DEMO_MODE, LOG_LEVEL |
| **Supabase**       | NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_JWT_SECRET          |
| **AI**             | ANTHROPIC_API_KEY                                                                     |
| **Communication**  | TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER, RESEND_API_KEY         |
| **Video**          | DAILY_API_KEY                                                                         |
| **Google**         | NEXT_PUBLIC_GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_MAPS_API_KEY               |
| **Payments**       | MP_ACCESS_TOKEN, NEXT_PUBLIC_MP_PUBLIC_KEY                                            |
| **Analytics**      | NEXT_PUBLIC_POSTHOG_KEY, NEXT_PUBLIC_POSTHOG_HOST                                     |
| **Monitoring**     | SENTRY_DSN, NEXT_PUBLIC_SENTRY_DSN, SENTRY_AUTH_TOKEN, SENTRY_ORG, SENTRY_PROJECT     |
| **Rate Limiting**  | UPSTASH_REDIS_URL, UPSTASH_REDIS_TOKEN                                                |
| **Imaging**        | NUBIX_API_URL, NUBIX_API_KEY, NUBIX_TENANT_ID                                         |
| **Insurance APIs** | PAMI_API_URL, PAMI_API_TOKEN, SWISS_MEDICAL_CLIENT_ID, SWISS_MEDICAL_CLIENT_SECRET    |
| **AFIP**           | AFIP_CERT_PATH, AFIP_KEY_PATH, AFIP_CUIT                                              |
| **Security**       | SESSION_ENCRYPTION_KEY                                                                |

### Validation

- All env vars validated via Zod schemas at startup
- Server schema: fails hard in production, warns in development
- Client schema: validates NEXT*PUBLIC*\* vars only
- Lazy singleton pattern prevents build-time crashes

---

## 25. Testing Infrastructure

### Unit Testing (Vitest)

- Configuration: `vitest.config.ts` with jsdom environment
- Coverage: V8 provider with lcov reporter
- Test files in `src/__tests__/`
- React component testing with `@testing-library/react`

### E2E Testing (Playwright)

- Configuration: `playwright.config.ts`
- Test files: `e2e/smoke.spec.ts`, `e2e/accessibility.spec.ts`
- Accessibility testing with `@axe-core/playwright`
- Auth helper: `scripts/test-e2e-auth.mjs`

### Quality Automation

- Pre-commit: Husky + lint-staged (prettier + eslint)
- CI validation: `npm run validate` (lint → typecheck → test → build)
- Scripts: `test`, `test:watch`, `test:coverage`, `test:e2e`, `test:e2e:ui`

---

## 26. Deployment & Docker

### Docker Build

- Multi-stage build: deps → builder → runner
- Node.js 20 Alpine base
- Standalone output mode for minimal image size
- Non-root user (UID 1001)
- Built-in health check (30s interval, 3 retries)
- Docker Compose support via `docker-compose.yml`

### Vercel Deployment

- Edge runtime for health/status endpoints
- Bundle analysis via `ANALYZE=true npm run build`
- Automatic source map upload to Sentry

### PWA Support

- `manifest.ts` — Web app manifest
- `public/sw.js` — Service worker for offline support
- `offline/page.tsx` — Offline fallback page
- `InstallPrompt` component for native install prompt

---

## 27. File Tree (Full)

```
condor-salud/
├── src/
│   ├── middleware.ts
│   ├── app/
│   │   ├── layout.tsx, page.tsx, globals.css
│   │   ├── error.tsx, global-error.tsx, not-found.tsx, loading.tsx
│   │   ├── manifest.ts, sitemap.ts
│   │   ├── api/
│   │   │   ├── auth/ (session, signup-notify, google/callback)
│   │   │   ├── chatbot/route.ts
│   │   │   ├── coverage/route.ts
│   │   │   ├── csp-report/route.ts
│   │   │   ├── directorio/route.ts
│   │   │   ├── farmacia/route.ts
│   │   │   ├── geolocation/route.ts
│   │   │   ├── google/calendar/route.ts
│   │   │   ├── health/route.ts
│   │   │   ├── nubix/route.ts
│   │   │   ├── reportes/ (pdf, excel)
│   │   │   ├── status/route.ts
│   │   │   ├── telemedicina/ (route, room, whatsapp-summary)
│   │   │   ├── triage/route.ts
│   │   │   └── waitlist/route.ts
│   │   ├── auth/ (login, registro, forgot-password, reset-password, verify)
│   │   ├── dashboard/
│   │   │   ├── layout.tsx, page.tsx
│   │   │   ├── agenda, alertas, auditoria, configuracion/
│   │   │   ├── directorio, facturacion, farmacia, financiadores/
│   │   │   ├── inflacion, interconsultas, inventario, nomenclador/
│   │   │   ├── nubix, pacientes, pagos, rechazos/
│   │   │   ├── reportes, telemedicina, triage, verificacion/
│   │   │   └── wizard/
│   │   ├── paciente/ (layout + 9 sub-pages)
│   │   ├── planes/, privacidad/, terminos/, status/, offline/
│   │   └── __tests__/
│   ├── components/
│   │   ├── Chatbot.tsx, DemoModal.tsx, FAQ.tsx, Features.tsx
│   │   ├── FinalCTA.tsx, Footer.tsx, Hero.tsx, HowItWorks.tsx
│   │   ├── InstallPrompt.tsx, Integrations.tsx, LandingContent.tsx
│   │   ├── LegalLayout.tsx, Navbar.tsx, PatientStats.tsx
│   │   ├── Pricing.tsx, Problem.tsx, RequirePermission.tsx
│   │   ├── Security.tsx, Stats.tsx, Testimonials.tsx
│   │   ├── Toast.tsx, Waitlist.tsx, WhatsAppFloat.tsx
│   │   ├── ui/ (14 base components)
│   │   └── wizard/ (5 wizard components)
│   ├── hooks/
│   │   └── use-data.ts (20+ SWR hooks)
│   └── lib/
│       ├── analytics.ts, chatbot-engine.ts, env.ts, google.ts
│       ├── logger.ts, plan-config.ts, plan-context.tsx, posthog.tsx
│       ├── segments.ts, swr.tsx, topdoctors.ts, types.ts, utils.ts
│       ├── ai/ (claude.ts)
│       ├── auth/ (context.tsx, rbac.ts)
│       ├── hooks/ (useGeolocation, useModules, useNearbyServices, usePatientName)
│       ├── i18n/ (context.tsx, translations.ts)
│       ├── nubix/ (client.ts, types.ts, index.ts)
│       ├── security/ (api-guard, crypto, rate-limit, require-auth, sanitize)
│       ├── services/ (26 service files)
│       ├── supabase/ (client, server, middleware, database.types)
│       └── validations/ (auth.ts, schemas.ts)
├── supabase/
│   ├── full_setup.sql (33 tables, RLS policies, triggers)
│   ├── seed.sql
│   └── migrations/
├── docs/ (API_REFERENCE, AUDIT_REPORT, FEATURES, PRODUCTION_REQUIREMENTS)
├── e2e/ (smoke.spec.ts, accessibility.spec.ts)
├── public/ (logos, robots.txt, sw.js)
├── scripts/ (test-e2e-auth.mjs)
└── Config files (next.config, tailwind, tsconfig, vitest, playwright, sentry, Dockerfile, docker-compose)
```

---

_End of audit document. This covers every page, API route, service, component, database table, RLS policy, security mechanism, third-party integration, and configuration in the Cóndor Salud SaaS platform._

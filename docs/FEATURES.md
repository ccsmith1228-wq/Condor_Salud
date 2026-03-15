# 🦅 Cóndor Salud — Comprehensive Feature Document

> **Version:** 1.0 · **Last updated:** March 15, 2026
> **Domain:** [condorsalud.com](https://condorsalud.com) · [condorsalud.com.ar](https://condorsalud.com.ar)
> **Stack:** Next.js 14 · React 18 · TypeScript · Tailwind CSS · Supabase · Vercel

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Landing Page & Marketing](#2-landing-page--marketing)
3. [Authentication & Security](#3-authentication--security)
4. [Professional Dashboard (19 Modules)](#4-professional-dashboard-19-modules)
5. [Patient Portal (9 Sections)](#5-patient-portal-9-sections)
6. [AI Chatbot — Cora](#6-ai-chatbot--cora)
7. [API Layer (13 Endpoints)](#7-api-layer-13-endpoints)
8. [External Integrations (14 Services)](#8-external-integrations-14-services)
9. [Geolocation & Maps](#9-geolocation--maps)
10. [Delivery (Rappi & PedidosYa)](#10-delivery-rappi--pedidosya)
11. [Design System & UI Library](#11-design-system--ui-library)
12. [Data Architecture](#12-data-architecture)
13. [Database Schema](#13-database-schema)
14. [Security & Compliance](#14-security--compliance)
15. [Monitoring & Observability](#15-monitoring--observability)
16. [DevOps & Infrastructure](#16-devops--infrastructure)
17. [Testing](#17-testing)
18. [SEO & PWA](#18-seo--pwa)
19. [Documentation](#19-documentation)
20. [Summary Statistics](#20-summary-statistics)

---

## 1. Executive Summary

Cóndor Salud is an **all-in-one healthcare SaaS platform** built for the Argentine medical system. It unifies medical billing, insurance claim management, patient care, telemedicine, pharmacy delivery, and medical imaging into a single web application.

The platform serves two audiences:

- **Healthcare professionals** (doctors, clinics, billing staff) → 19-module professional dashboard
- **Patients** → 9-section patient portal + AI chatbot

### Key Differentiators

- Full integration with Argentine insurance ecosystem (PAMI, OSDE, Swiss Medical, Galeno, Medifé, etc.)
- Real-time insurance coverage verification by DNI
- Built-in claim rejection management with automatic reprocesamiento
- Inflation impact tracking (IPC-based real loss calculations)
- AI symptom checker with Argentine OTC medicine recommendations (brand names, dosing, red flags)
- Geolocation-powered nearby services with Google Maps directions
- OTC medicine delivery via Rappi and PedidosYa
- Nubix Cloud RIS/PACS integration for medical imaging
- SSS nomenclator code management with per-payer pricing

---

## 2. Landing Page & Marketing

A full-featured marketing site composed of 14 section components:

| Section          | Description                                                      |
| ---------------- | ---------------------------------------------------------------- |
| **Navbar**       | Responsive navigation with mobile hamburger menu and CTA buttons |
| **Hero**         | Main headline, value proposition, demo URL preview               |
| **Stats**        | Key metrics: –62% claim rejections, 45-day collection, etc.      |
| **Problem**      | Pain points of Argentine healthcare billing                      |
| **Features**     | Feature showcase grid highlighting platform capabilities         |
| **How It Works** | 3-step visual onboarding flow                                    |
| **Integrations** | Logos/badges for PAMI, AFIP, major obras sociales                |
| **Security**     | HIPAA-style compliance and data protection messaging             |
| **Testimonials** | Customer quotes and social proof                                 |
| **Pricing**      | Three-tier plan display (Esencial / Profesional / Institución)   |
| **FAQ**          | Expandable accordion with common questions                       |
| **Waitlist**     | Email signup form for early access                               |
| **Final CTA**    | Bottom conversion section                                        |
| **Footer**       | Links, legal, social media                                       |

### Additional Pages

| Page                           | Description                                                                                       |
| ------------------------------ | ------------------------------------------------------------------------------------------------- |
| **Planes** (`/planes`)         | Interactive plan configurator — 19 modules, 3 presets, category browser, dynamic price calculator |
| **Privacidad** (`/privacidad`) | Privacy policy compliant with Argentine data protection law                                       |
| **Términos** (`/terminos`)     | Terms of service                                                                                  |

### Global Components

| Component          | Description                                                                         |
| ------------------ | ----------------------------------------------------------------------------------- |
| **WhatsApp Float** | Floating WhatsApp button on every page — opens `wa.me` with pre-filled message      |
| **Chatbot (Cora)** | Floating chat widget available on every page (see [Section 6](#6-ai-chatbot--cora)) |

---

## 3. Authentication & Security

### Login (`/auth/login`)

- Email + password authentication with Zod validation
- "Remember me" checkbox
- Google OAuth button (one-click sign-in)
- Redirect preservation (returns user to intended page after login)
- Demo mode fallback (localStorage-based when Supabase isn't configured)

### Registration (`/auth/registro`)

- Multi-field form: name, email, password, clinic name, CUIT, provincia, especialidad, financiadores
- Password strength enforcement: minimum 8 characters, uppercase + number required
- CUIT format validation (Argentine tax ID regex)
- Password confirmation matching
- Terms acceptance checkbox
- Google OAuth alternative

### Google OAuth 2.0 Flow

- Full authorization code exchange implementation
- Sets secure httpOnly session cookie
- Open-redirect prevention (validates all redirect targets are relative paths)

### Role-Based Access Control (RBAC)

| Role            | Permissions                                                        |
| --------------- | ------------------------------------------------------------------ |
| **admin**       | Full access to all 13 permissions                                  |
| **médico**      | Patient records, appointments, prescriptions, triage, telemedicine |
| **facturación** | Billing, claims, rejections, financiadores, nomenclator, reports   |
| **recepción**   | Patients (read), appointments, insurance verification              |

### Route Protection

- Server middleware protects `/dashboard/*` and `/paciente/*` routes
- Unauthenticated users redirected to `/auth/login`
- Authenticated users redirected away from auth pages
- Permission checks at route level based on RBAC role

---

## 4. Professional Dashboard (19 Modules)

### Dashboard Layout

- Collapsible sidebar with 6 sections (Gestión Clínica, Finanzas, Inteligencia, Servicios, Sistema)
- Module visibility tied to plan selection (some modules locked on lower plans)
- Mobile-responsive drawer navigation
- User profile display with clinic name, role, and logout
- Onboarding wizard banner for new users

### Dashboard Home (`/dashboard`)

- 4 KPI cards: facturado, cobrado, rechazos %, inflación loss
- Financiador comparison table (top payers ranked by performance)
- Today's agenda preview
- Pending audit items
- Quick-action links to most-used modules

---

### 4.1 Gestión Clínica

#### Pacientes (`/dashboard/pacientes`)

- Patient list with search, filter, and CRUD operations
- 12 demo patients with: DNI, financiador, plan, phone, email, last visit, conditions
- Individual patient detail view (`/dashboard/pacientes/[id]`)
- Patient record management

#### Agenda (`/dashboard/agenda`)

- Day view with 16 time slots (30-minute intervals)
- Appointment status tracking: confirmado, pendiente, cancelado, atendido
- Patient name, financiador, and reason per slot
- Quick status change actions

#### Verificación de Cobertura (`/dashboard/verificacion`)

- Real-time insurance eligibility check by DNI + financiador
- Returns: plan name, coverage status, copay amounts, authorized services
- Supports all major Argentine obras sociales

#### Inventario (`/dashboard/inventario`)

- Medical supply stock management
- 12 demo items (gloves, syringes, gauze, masks, etc.)
- Minimum stock alerts (yellow/red indicators)
- Expiration date tracking
- Stock in/out logging

---

### 4.2 Finanzas

#### Facturación (`/dashboard/facturacion`)

- Electronic invoice management
- 5 invoice statuses: presentada, cobrada, rechazada, pendiente, en_observación
- CAE (Código de Autorización Electrónico) number tracking
- Filter by financiador, status, date range
- Invoice detail view with line items

#### Rechazos (`/dashboard/rechazos`)

- Claim rejection management dashboard
- 7 rejection reason codes:
  - `código_invalido` — Invalid nomenclator code
  - `afiliado_no_encontrado` — Patient not found in payer's system
  - `vencida` — Expired claim submission
  - `duplicada` — Duplicate submission
  - `sin_autorización` — Missing prior authorization
  - `datos_incompletos` — Incomplete data
  - `nomenclador_desactualizado` — Outdated nomenclator version
- Reprocesamiento workflow (re-submit corrected claims)
- Rejection rate analytics

#### Financiadores (`/dashboard/financiadores`)

- Insurance payer comparison dashboard
- Supported payers: OSDE, Swiss Medical, PAMI, Galeno, Medifé, IOMA, OSECAC
- Per-payer metrics: amount billed, amount collected, rejection rate, average days to payment
- Trend analysis and ranking

#### Inflación (`/dashboard/inflacion`)

- Monthly IPC (consumer price index) data tracking
- Real loss calculation: (`days_to_pay × daily_inflation_rate × amount_billed`)
- Per-financiador inflation impact comparison
- Historical trend visualization

#### Pagos (`/dashboard/pagos`)

- MercadoPago integration for online copay/coseguro collection
- Supported methods: Visa, Mastercard, Amex, CBU transfer, MercadoPago wallet
- Transaction history and status tracking
- Auto-billing configuration

---

### 4.3 Inteligencia

#### Auditoría (`/dashboard/auditoria`)

- Pre-submission invoice audit
- Detects errors before claims are sent to financiadores
- Validation rules: missing fields, invalid codes, expired authorizations
- Batch audit capability

#### Nomenclador (`/dashboard/nomenclador`)

- SSS (Superintendencia de Servicios de Salud) nomenclator code browser
- 18 procedure codes with descriptions
- Per-financiador pricing matrix (OSDE, Swiss Medical, PAMI, Galeno)
- Search and filter by code, description, category

#### Reportes (`/dashboard/reportes`)

- Configurable report dashboards
- Export functionality (CSV, PDF)
- Revenue, rejection, and collection analytics

---

### 4.4 Servicios

#### Farmacia Online (`/dashboard/farmacia`)

- Medication catalog with 10+ medications
- Details: lab, category, price, coverage % by payer (PAMI/OS/prepaga)
- Prescription management (create, view, status tracking)
- Delivery tracking with courier info and ETA
- Recurring order configuration (auto-refill)
- Stock and requires-prescription flags

#### Telemedicina (`/dashboard/telemedicina`)

- Video consultation platform
- Waiting room management with queue position
- One-click Daily.co video room creation
- Camera/mic controls
- Consultation recording capability
- Post-consultation: digital prescription, WhatsApp summary via Twilio
- Scheduled consultation management
- KPIs: consultations today, average wait time, satisfaction

**Integrates with:** Daily.co (video), Twilio (WhatsApp summaries)

#### Directorio Médico (`/dashboard/directorio`)

- Doctor directory with 10+ professionals
- Filters: specialty, location, financiador, teleconsulta-enabled
- Doctor profiles: name, specialty, address, rating (1-5), review count
- Patient reviews and ratings
- Appointment booking links
- TopDoctors.com.ar integration for external profiles

**Integrates with:** TopDoctors.com.ar

#### Triage (`/dashboard/triage`)

- Clinical triage system
- Body-system based symptom selection (12 body systems)
- Severity scale: 1-10 with labeled tiers (leve, moderado, serio, emergencia)
- ICD-10 code assignment
- Clinical notes with treatment plan and referrals
- Auto-routing to appropriate specialty
- Photo upload capability for visible symptoms

#### Nubix RIS/PACS (`/dashboard/nubix`)

- Medical imaging management platform
- 16 DICOM modalities: CR, CT, MR, US, MG, ECG, DX, NM, PT, XA, RF, OT, SC, ES, IO, BI
- Radiology study listing with filters (modality, status, date, patient)
- Report management (preliminary → final → delivered)
- Result delivery via WhatsApp, email, or patient portal
- Embedded DICOM viewer
- Appointment scheduling for imaging studies
- KPIs: studies today, pending reports, average turnaround

**Integrates with:** Nubix Cloud API (full REST client with auth)

---

### 4.5 Sistema

#### Alertas (`/dashboard/alertas`)

- Notification center with 10 alert types:
  - Claim rejection alerts
  - Document expiration warnings
  - Nomenclator update notifications
  - Payment received confirmations
  - Inflation impact alerts
- Read/unread state management
- Priority-based sorting

#### Configuración (`/dashboard/configuracion`)

9 sub-sections:

| Sub-section        | Description                                                                                                  |
| ------------------ | ------------------------------------------------------------------------------------------------------------ |
| **Clínica**        | Clinic profile: name, logo, CUIT, address, fiscal info                                                       |
| **Equipo**         | Team management with 4 roles: admin, médico, facturación, recepción                                          |
| **Integraciones**  | 6 integration configs: PAMI webservice, AFIP WSFE, Swiss Medical API, OSDE portal, Sancor Salud, MercadoPago |
| **Facturación**    | Subscription plan management, billing history                                                                |
| **Pagos y Cobros** | Payment method config, MercadoPago settings, transaction log                                                 |
| **Notificaciones** | Alert and notification preferences                                                                           |
| **WhatsApp**       | Appointment reminder configuration via WhatsApp                                                              |
| **Recordatorios**  | Automated reminder scheduling (appointments, prescriptions, etc.)                                            |

#### Wizard (`/dashboard/wizard`)

- Interactive guided tour of all 15 platform features
- Multi-step wizard with sidebar table of contents
- Per-step interactive content (885 lines of guided content)
- Progress tracking and step completion

---

## 5. Patient Portal (9 Sections)

Separate layout and navigation for patient users with insurance info display.

### Mi Salud — Home (`/paciente`)

- Personalized greeting with patient name
- Vitals dashboard: blood pressure, weight, glucose, heart rate
- Upcoming appointments with quick actions
- Active medications with dosage and next-dose reminders
- Medication alerts (refill needed, interactions)
- **Nearby services** (geolocation-powered): doctors, pharmacies, hospitals
- Quick action buttons for most-used features

### Mis Turnos (`/paciente/turnos`)

- Appointment booking by specialty, doctor, date
- Upcoming and past appointment history
- Cancel/reschedule capabilities
- Appointment reminders

### Mi Cobertura (`/paciente/cobertura`)

- Insurance plan details and coverage breakdown
- What's covered, copay amounts, authorization requirements
- Per-category coverage (consultas, estudios, medicamentos, internación)

### Mis Medicamentos (`/paciente/medicamentos`)

- Active medication list with dosage and frequency
- Refill reminders and auto-order configuration
- Medication interaction warnings
- Prescription history

### Teleconsulta (`/paciente/teleconsulta`)

- Three views: consultation list, waiting room, video call
- Camera and microphone controls
- Screen sharing
- Consultation scheduling by specialty
- Post-consultation summary access

### Buscar Médico (`/paciente/medicos`)

- Doctor search by specialty, location, and financiador
- Geolocation-aware sorting (nearest first)
- Doctor profiles with ratings and reviews
- Direct appointment booking
- Teleconsulta availability indicator

### Chequear Síntomas (`/paciente/sintomas`)

- Self-triage wizard:
  1. Select body part / symptom area
  2. Describe symptoms in detail
  3. Rate severity (1-10)
  4. Receive recommendation: doctor type, OTC meds, home remedies, red flags
- Built on the same triage engine as the chatbot

### Historia Clínica (`/paciente/historia`)

- Clinical history viewer
- Past consultations, diagnoses, prescriptions
- Lab results and imaging studies

### Mi Perfil (`/paciente/perfil`)

- Personal data management
- Insurance information
- Contact details
- Notification preferences

---

## 6. AI Chatbot — Cora

A **1,747-line rule-based conversational engine** powering the Cora chatbot, available as a floating widget on every page.

### Chatbot UI Features

- Floating bubble with notification dot (appears after 3 seconds)
- Expandable chat window (380px width, responsive)
- Typing indicator with animated dots
- Message bubbles (bot with condor avatar, user in brand color)
- **Info cards** with action buttons, Google Maps links, delivery links
- **Quick reply** buttons for guided conversation
- **Geolocation** button (📍) to share location
- "Online" status indicator
- Auto-scroll to latest message
- Disclaimer footer: "No reemplaza el diagnóstico médico profesional"

### Intent Recognition (20+ Intents)

| Category                  | Intents                                                                                                                                                                                                                        |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Symptom Triage**        | `pain_head`, `pain_chest`, `pain_belly`, `pain_throat`, `pain_back`, `pain_joints`, `skin_issue`, `eye_issue`, `ear_issue`, `fever`, `cold_flu`, `allergy`, `anxiety`, `blood_pressure`, `pediatric`, `women_health`, `dental` |
| **Healthcare Navigation** | `coverage`, `appointment`, `medication`, `delivery`, `telemedicine`                                                                                                                                                            |
| **Geolocation**           | `nearby_doctor`, `nearby_pharmacy`, `nearby_guardia`, `directions`, `shared_location`                                                                                                                                          |
| **General**               | `greeting`, `farewell`, `thanks`, `pricing`, `how_it_works`, `register`, `contact_human`, `location`, `triage_generic`                                                                                                         |

### Symptom Triage Engine

For each of the 17 symptom intents, Cora provides:

1. **Severity assessment** (leve / moderado / serio / emergencia)
2. **Plain-language advice** in Argentine Spanish
3. **Specific OTC medicine recommendations** with Argentine brand names, doses, and warnings
4. **Red flags** — when to go to the ER immediately
5. **Home remedies** — what to do in the meantime
6. **Doctor routing** — which specialist to see, in everyday language
7. **Action cards** — book appointment, teleconsulta, or call 107
8. **Delivery options** — Rappi and PedidosYa cards for ordering OTC meds (non-emergency)

### Argentine OTC Medicine Database

Covers 30+ medications with Argentine brand names:

| Medicine                          | Use Case                             |
| --------------------------------- | ------------------------------------ |
| Tafirol (paracetamol) 500mg/1g    | Headache, fever, throat pain         |
| Ibupirac (ibuprofeno) 400/600mg   | Pain, inflammation, menstrual cramps |
| Buscapina (hioscina) 10mg         | Stomach cramps                       |
| Sertal Compuesto                  | Abdominal pain                       |
| Estrepsils                        | Sore throat                          |
| Diclofenac gel (Voltaren Emulgel) | Back/joint pain                      |
| Relaxyl (ciclobenzaprina)         | Muscle contractures                  |
| Loratadina 10mg (Clarityne)       | Allergies                            |
| Alikal / Alka-Seltzer             | Acid reflux                          |
| Imodium (loperamida)              | Diarrhea                             |
| Buscapina Fem                     | Menstrual pain                       |
| Ibupirac Pediátrico jarabe        | Pediatric fever/pain                 |
| Listerine / Plax                  | Dental hygiene                       |
| And more...                       | Various conditions                   |

### Emergency Handling

- `pain_chest` triggers **immediate emergency response**: "Llamá al 107 AHORA"
- Shows SAME (107) emergency card with tap-to-call
- If location is shared: adds nearest hospital/guardia card with Google Maps directions

---

## 7. API Layer (13 Endpoints)

| Endpoint                             | Method   | Rate Limit | Description                                                     |
| ------------------------------------ | -------- | ---------- | --------------------------------------------------------------- |
| `/api/health`                        | GET      | —          | Health check (Edge runtime), Sentry status, response time       |
| `/api/waitlist`                      | POST     | 5/min      | Email waitlist signup                                           |
| `/api/chatbot`                       | POST     | 20/min     | Chatbot message processing with optional geolocation            |
| `/api/nubix`                         | GET      | —          | Studies, reports, deliveries, viewer config, appointments, KPIs |
| `/api/nubix`                         | POST     | 10/min     | Send results, upsert appointments                               |
| `/api/triage`                        | GET      | —          | List triages, get KPIs                                          |
| `/api/triage`                        | POST     | 15/min     | Create triage, save clinical notes                              |
| `/api/directorio`                    | GET      | —          | Doctor search with specialty/location/financiador filters       |
| `/api/telemedicina`                  | GET      | —          | Waiting room, consultations, scheduled, KPIs                    |
| `/api/telemedicina/room`             | POST     | 5/min      | Create Daily.co video room                                      |
| `/api/telemedicina/whatsapp-summary` | POST     | 5/min      | Send summary via Twilio WhatsApp                                |
| `/api/google/calendar`               | GET/POST | —          | Google Calendar events (appointment scheduling)                 |
| `/api/geolocation`                   | GET      | —          | Reverse geocode + nearby places via Google Maps                 |
| `/api/farmacia`                      | GET      | —          | Medications, prescriptions, deliveries, recurring orders        |
| `/api/farmacia`                      | POST     | 10/min     | Create prescriptions, update delivery status                    |
| `/api/auth/google/callback`          | GET      | —          | OAuth 2.0 token exchange                                        |

All POST endpoints use input sanitization and structured logging via the API guard layer.

---

## 8. External Integrations (14 Services)

| Service                  | Purpose                                                | Status                            |
| ------------------------ | ------------------------------------------------------ | --------------------------------- |
| **Supabase**             | Database, Auth, Storage, Realtime                      | Code wired, demo mode fallback    |
| **Sentry**               | Error tracking, performance monitoring, session replay | Configured, needs DSN             |
| **Google OAuth 2.0**     | Authentication + Calendar access tokens                | Fully implemented                 |
| **Google Calendar API**  | Appointment scheduling, provider availability          | Fully implemented                 |
| **Google Maps / Places** | Reverse geocoding, nearby search, directions           | Fully implemented with fallback   |
| **Daily.co**             | Telemedicine video rooms                               | Implemented with mock fallback    |
| **Twilio**               | WhatsApp consultation summaries                        | Implemented with mock fallback    |
| **MercadoPago**          | Online payments (copagos, coseguros)                   | UI built, SDK installed           |
| **Resend**               | Transactional email                                    | SDK installed                     |
| **Upstash Redis**        | Production rate limiting and caching                   | SDK installed, in-memory fallback |
| **Nubix Cloud**          | RIS/PACS medical imaging (188-line HTTP client)        | Full client + mock fallback       |
| **TopDoctors.com.ar**    | Doctor directory external profiles                     | URL builder implemented           |
| **PAMI**                 | Argentine public health insurance API                  | Env vars defined, stub ready      |
| **AFIP WSFE**            | Argentine electronic invoicing                         | Env vars defined, stub ready      |

---

## 9. Geolocation & Maps

### Browser Geolocation Hook (`useGeolocation`)

- **Lazy mode**: location requested only on user action (📍 button click)
- **Caching**: coordinates stored in localStorage with 10-minute TTL
- **Permission tracking**: monitors `granted` / `denied` / `prompt` states
- **High accuracy**: uses GPS when available
- **Error handling**: Spanish error messages for timeout, permission denied, etc.
- **15-second timeout** to prevent indefinite waiting

### Nearby Services Hook (`useNearbyServices`)

- Haversine distance calculation between user and service locations
- Sorts doctors, pharmacies, and hospitals by proximity
- Returns formatted distance (meters for <1km, km otherwise)

### Google Maps Integration

Three URL generators for plain links (no embeds/iframes):

| Function              | What It Opens                                     |
| --------------------- | ------------------------------------------------- |
| `mapsDirectionsUrl()` | Turn-by-turn directions from user to destination  |
| `mapsPlaceUrl()`      | Place view on Google Maps for a specific location |
| `mapsSearchNearby()`  | Search results near user's location               |

### Where Geolocation Is Used

1. **Chatbot**: nearby doctors/pharmacies/guardias with directions
2. **Patient dashboard**: nearby services section
3. **Doctor search**: distance-based sorting
4. **Emergency triage**: nearest hospital with directions
5. **Delivery**: Rappi link includes lat/lng for nearest pharmacies

---

## 10. Delivery (Rappi & PedidosYa)

OTC medicine delivery integrated directly into the chatbot conversation flow.

### How It Works

1. User reports symptoms → Cora recommends OTC meds
2. Below the medication list, **Rappi** and **PedidosYa** cards appear
3. User taps to open the app's pharmacy section
4. If location is shared, Rappi link includes coordinates for nearest pharmacies

### Delivery Intent

Triggers on: "pedir por Rappi", "remedios a domicilio", "que me traigan", "PedidosYa farmacia", "delivery farmacia", "comprar online medicamentos"

### Cards Shown

| App           | Link                         | Description                                                         |
| ------------- | ---------------------------- | ------------------------------------------------------------------- |
| **Rappi**     | `rappi.com.ar/.../farmacias` | OTC meds delivered in 30-60 min. Supports Mercado Pago, cards, cash |
| **PedidosYa** | `pedidosya.com.ar/farmacias` | Pharmacy delivery with real-time tracking                           |

### Integration Points

- Every **non-emergency triage** response with OTC meds includes Rappi + PedidosYa cards
- **Medication** intent shows delivery options
- Dedicated **delivery** intent with detailed response
- Quick reply "🛵 Que me lo traigan" on all triage with OTC recommendations

---

## 11. Design System & UI Library

### Brand Colors (Tailwind Config)

| Token     | Usage                | Shades             |
| --------- | -------------------- | ------------------ |
| `celeste` | Primary brand blue   | 50–950 (10 shades) |
| `gold`    | Accent / highlights  | 50–950 (10 shades) |
| `ink`     | Text and dark UI     | 50–950 (10 shades) |
| `surface` | Background surfaces  | Single value       |
| `border`  | Borders and dividers | Single value       |
| `success` | Positive states      | Single value       |

### Typography

- **Display font:** Georgia (serif)
- **Body font:** DM Sans (sans-serif)

### UI Component Library (16 Components)

| Component         | Variants / Features                                      |
| ----------------- | -------------------------------------------------------- |
| **Button**        | Primary, outline, ghost, loading state, disabled         |
| **Card**          | Card + CardHeader + CardTitle + CardContent              |
| **Input**         | Label, placeholder, error state, disabled                |
| **Select**        | Dropdown with label and error state                      |
| **Modal**         | Overlay dialog with close button                         |
| **ConfirmDialog** | Action confirmation with cancel/confirm buttons          |
| **DataTable**     | Sortable columns, pagination, empty state                |
| **FilterBar**     | Horizontal filter controls                               |
| **KPICard**       | Metric display with trend indicator                      |
| **StatusBadge**   | Colored pills for statuses                               |
| **PageHeader**    | Title + description + action buttons                     |
| **EmptyState**    | Illustration + message + CTA                             |
| **Skeleton**      | Loading placeholder animations                           |
| **Toggle**        | On/off switch                                            |
| **Toast**         | Notification toasts via React context                    |
| **DemoModal**     | "Feature not available in demo" dialog with WhatsApp CTA |

### Wizard Components (5)

- WizardData (885 lines of guided tour content)
- WizardSidebar (table of contents)
- WizardProgress (progress bar + step header)
- WizardStepContent (step body renderer)
- WizardNavigation (prev/next/finish)

---

## 12. Data Architecture

### Service Layer Pattern

Every module follows the same pattern:

```text
Service (mock data + Supabase stub)
  ↓
API Route (validation + rate limit + sanitization)
  ↓
SWR Hook (client-side caching + revalidation)
  ↓
Page Component (renders data)
```

### Centralized Demo Data

365-line data service providing:

- 12 patients with full Argentine medical data
- 10 invoices with CAE numbers and statuses
- 8 claim rejections with reason codes
- 7 financiadores with performance metrics
- 6 months of inflation data
- 10 system alerts
- 16 appointment slots
- 12 inventory items
- 18 nomenclator codes

### SWR Data Hooks (15+)

Typed hooks for every module:

- `usePatients()`, `useFacturas()`, `useRechazos()`
- `useFinanciadores()`, `useInflacion()`, `useAlertas()`
- `useAgenda()`, `useInventario()`, `useNomenclador()`
- `useFarmacia()`, `useTelemedicina()`, `useDirectorio()`
- `useTriage()`, `useNubix()`

### Plan System

- 19 configurable modules across 4 categories
- 3 presets: Esencial (free), Profesional ($12,900/mo), Institución ($34,900/mo)
- Module dependency resolution (some modules require others)
- Dynamic pricing calculator
- React context with localStorage persistence

---

## 13. Database Schema

PostgreSQL via Supabase with UUID primary keys and Row Level Security on all tables.

### Tables (11)

| Table                 | Module       | Key Columns                                                                          |
| --------------------- | ------------ | ------------------------------------------------------------------------------------ |
| `medications`         | Farmacia     | name, lab, category, price, PAMI/OS/prepaga coverage %, stock, requires_prescription |
| `prescriptions`       | Farmacia     | code, patient, doctor, items (JSONB), status, financiador                            |
| `deliveries`          | Farmacia     | code, prescription FK, address, status, ETA, courier, progress                       |
| `recurring_orders`    | Farmacia     | code, patient, medications (JSONB), frequency, next_delivery                         |
| `consultations`       | Telemedicina | code, patient, doctor, specialty, status, video_room_url, recording_url              |
| `waiting_room`        | Telemedicina | consultation FK, patient, queue_position, intake_complete                            |
| `doctors`             | Directorio   | name, specialty, location, financiadores (JSONB), rating, teleconsulta               |
| `doctor_reviews`      | Directorio   | doctor FK, rating (1-5), text, verified                                              |
| `doctor_availability` | Directorio   | doctor FK, date, time_slot, booked (UNIQUE)                                          |
| `triages`             | Triage       | code, symptoms (JSONB), severity 1-10, photo_urls (JSONB), routed_specialty          |
| `clinical_notes`      | Triage       | triage/consultation FK, ICD-10 codes (JSONB), treatment_plan, referrals              |

### Indexes (16)

Optimized for common query patterns: status filters, date ranges, patient lookups, doctor searches, availability checks.

### Security

- `uuid-ossp` extension enabled
- Row Level Security (RLS) on all tables
- Authenticated read/write policies

---

## 14. Security & Compliance

| Feature                      | Description                                                                                                                                                   |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Rate Limiting**            | Sliding window limiter on all POST endpoints (5-20 req/min depending on route). In-memory with Upstash Redis upgrade path                                     |
| **Input Sanitization**       | HTML stripping, entity escaping, length limiting on all user input                                                                                            |
| **API Guard**                | Combined rate-limit + sanitization + structured logging per route                                                                                             |
| **HTTP Security Headers**    | X-Frame-Options: DENY, HSTS (max-age 2yr, includeSubDomains, preload), strict CSP, X-Content-Type-Options: nosniff, Permissions-Policy (camera/mic self-only) |
| **RBAC**                     | 4 roles × 13 permissions with route-level enforcement                                                                                                         |
| **Environment Validation**   | Zod schemas for 25+ env vars. Fails hard in production if missing                                                                                             |
| **PII Redaction (Logging)**  | Pino logger redacts: password, token, cookie, auth headers, DNI, CUIL, CUIT, email                                                                            |
| **PII Redaction (Sentry)**   | beforeSend strips request body and non-safe headers                                                                                                           |
| **Open-Redirect Prevention** | OAuth callback validates redirect targets (relative paths only)                                                                                               |
| **Zod Validation**           | Input schemas for: paciente, factura, turno, inventario, verificación, search, clinic config, team member, login, registration                                |

---

## 15. Monitoring & Observability

| Layer                     | Tool                         | Details                                                                                                    |
| ------------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Client Error Tracking** | Sentry                       | 20% sampling in production, session replay with masked text and blocked media                              |
| **Server Error Tracking** | Sentry                       | PII-scrubbed beforeSend hook, request body redacted                                                        |
| **Edge Error Tracking**   | Sentry                       | Middleware and edge route error capture                                                                    |
| **Structured Logging**    | Pino                         | JSON output (prod) / pretty print (dev). Child loggers: auth, api, database, billing, security, middleware |
| **Analytics**             | PostHog/Plausible (skeleton) | 14 event types: page_view, login, register, factura_created, rechazo_resolved, etc.                        |
| **Health Check**          | `/api/health`                | Edge runtime. Returns: status, version, environment, Sentry check, response time                           |

---

## 16. DevOps & Infrastructure

| Component           | Details                                                                                    |
| ------------------- | ------------------------------------------------------------------------------------------ |
| **Hosting**         | Vercel (auto-deploy from GitHub `main` branch)                                             |
| **Domains**         | `condorsalud.com`, `condorsalud.com.ar`, `www.condorsalud.com`, `www.condorsalud.com.ar`   |
| **Docker**          | Multi-stage build: Alpine Node 20, non-root user, standalone output, built-in health check |
| **Docker Compose**  | Dev mode (hot reload, volume mounts) + Prod mode (resource limits: 1 CPU / 512MB)          |
| **CI/CD**           | GitHub → Vercel auto-deploy. `validate` script: lint + typecheck + test + build            |
| **Lint/Format**     | ESLint + Prettier + Husky + lint-staged (auto-format on commit, zero-warning policy)       |
| **Bundle Analyzer** | `@next/bundle-analyzer` via `ANALYZE=true` env var                                         |
| **Node Version**    | 20 (Alpine Linux in Docker)                                                                |

---

## 17. Testing

| Layer                 | Framework                | Coverage                                                                                                                |
| --------------------- | ------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| **Unit Tests**        | Vitest + Testing Library | env validation, logger, services, utils, validations (5 test suites)                                                    |
| **E2E Smoke Tests**   | Playwright               | 8 tests: page load, login form, navigation, health endpoint, legal pages, 404, dashboard redirect                       |
| **E2E Accessibility** | Playwright + axe-core    | WCAG 2.1 AA on 10+ pages: landing, login, register, privacy, terms, dashboard, facturación, pacientes, rechazos, agenda |

---

## 18. SEO & PWA

### SEO

- OpenGraph meta tags with locale `es_AR`
- Twitter card meta tags
- Canonical URLs pointing to `condorsalud.com`
- Dynamic sitemap at `/sitemap.xml` (5 public URLs)
- `robots.txt` allowing all crawlers
- Metadata templates for consistent page titles

### PWA

- Web App Manifest at `/manifest.json`
- Display mode: `standalone`
- Categories: medical, business, productivity
- App icons at multiple sizes

---

## 19. Documentation

| Document                          | Lines     | Description                                                                                                      |
| --------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------- |
| `docs/FEATURES.md`                | This file | Comprehensive feature documentation                                                                              |
| `docs/API_REFERENCE.md`           | 1,191     | Complete API docs for all 14 integrations with endpoints, auth, schemas, and examples                            |
| `docs/PRODUCTION_REQUIREMENTS.md` | 511       | Production readiness assessment, 3-tier service requirements, cost analysis ($49-749/mo), implementation roadmap |
| `BRANDKIT.md`                     | —         | Brand guidelines (colors, typography, logos)                                                                     |
| `CHANGELOG.md`                    | —         | Release history                                                                                                  |
| `CONTRIBUTING.md`                 | —         | Contribution guidelines                                                                                          |
| `README.md`                       | —         | Project overview and setup instructions                                                                          |

---

## 20. Summary Statistics

| Metric                        | Count                            |
| ----------------------------- | -------------------------------- |
| **Total pages**               | 45                               |
| **Dashboard modules**         | 19                               |
| **Patient portal sections**   | 9                                |
| **API endpoints**             | 13 (16 counting method variants) |
| **External integrations**     | 14                               |
| **Chatbot intents**           | 20+                              |
| **Symptom triage conditions** | 17                               |
| **OTC medicines in database** | 30+                              |
| **UI components**             | 16                               |
| **Landing page sections**     | 14                               |
| **Database tables**           | 11                               |
| **Database indexes**          | 16                               |
| **RBAC roles**                | 4                                |
| **RBAC permissions**          | 13                               |
| **Financiadores supported**   | 7+                               |
| **Nomenclator codes**         | 18                               |
| **Demo patients**             | 12                               |
| **E2E test suites**           | 2 (smoke + accessibility)        |
| **Source files**              | ~100+                            |

---

Built with 🦅 by the Cóndor Salud team · condorsalud.com

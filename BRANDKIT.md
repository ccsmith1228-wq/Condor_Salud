# CÓNDOR SALUD — Brand Kit & Development Standards

> This document is the single source of truth for all design and development decisions.
> Every component, page, and feature must follow these rules exactly.
> When in doubt, refer back to this document. Do not improvise.

---

## 1. BRAND IDENTITY

**Company:** Cóndor Salud
**Tagline:** "Volá más alto."
**Description:** Plataforma unificada de inteligencia para el sistema de salud argentino.
**Language:** Spanish (Argentine). Use "vos" conjugation, not "tú". Use local terminology (obra social, prepaga, financiador, PAMI, AFIP, CUIL, DNI).
**Tone:** Professional, direct, confident. No corporate jargon. No emojis in production UI (only in placeholder/dev pages).

---

## 2. COLOR PALETTE — STRICT

Only these colors may be used. No exceptions. No other blues, greens, reds, or purples.

### Primary Colors (Argentine Flag)

| Name               | Hex       | Tailwind Class  | Usage                                              |
| ------------------ | --------- | --------------- | -------------------------------------------------- |
| Celeste            | `#75AADB` | `celeste`       | Primary brand color, buttons, links, active states |
| Celeste Dark       | `#4A7FAF` | `celeste-dark`  | Headlines, primary CTA, hover states               |
| Celeste Light      | `#A8CCE8` | `celeste-light` | Secondary text on dark bg, subtle accents          |
| Celeste Pale       | `#E4F0F9` | `celeste-pale`  | Backgrounds, highlighted rows, feature cards       |
| Gold (Sol de Mayo) | `#F6B40E` | `gold`          | Accent, secondary CTA, warnings, "SALUD" text      |
| Gold Pale          | `#FEF5DC` | `gold-pale`     | Warning backgrounds, callout boxes                 |

### Neutral Colors

| Name         | Hex       | Tailwind Class | Usage                                                     |
| ------------ | --------- | -------------- | --------------------------------------------------------- |
| Ink          | `#1A1A1A` | `ink`          | Primary text, dark backgrounds (sidebar, footer)          |
| Ink Light    | `#666666` | `ink-light`    | Body text, descriptions                                   |
| Ink Muted    | `#999999` | `ink-muted`    | Captions, timestamps, placeholder text                    |
| Border       | `#D4E4F0` | `border`       | Borders, dividers, table lines                            |
| Border Light | `#E8F0F6` | `border-light` | Subtle dividers, alternating row backgrounds              |
| White        | `#FFFFFF` | `white`        | Page backgrounds, cards                                   |
| Off-white    | `#F8FAFB` | —              | Dashboard content area background, alternating table rows |

### Semantic Colors (use sparingly, only for data)

| Purpose               | Hex                   | Usage                                        |
| --------------------- | --------------------- | -------------------------------------------- |
| Success/Low rejection | `#16A34A` (green-600) | Rejection rates <5%, positive changes        |
| Danger/High rejection | `#DC2626` (red-600)   | Rejection rates >10%, overdue items          |
| Warning               | Use `gold`            | Rejection rates 5-10%, approaching deadlines |

**NEVER USE:** Purple, teal, orange (except gold), pink, or any color not listed above.

---

## 3. TYPOGRAPHY

### Font Stack

```typescript
fontFamily: {
  display: ["Georgia", "serif"],        // Headlines, wordmark, KPI numbers
  body: ["system-ui", "-apple-system", "sans-serif"],  // Everything else
}
```

### Usage Rules

- **Georgia (display):** Page titles (h1), section headers (h2), KPI large numbers, the "CÓNDOR" wordmark, pricing numbers
- **System UI (body):** Navigation, body text, table data, buttons, form inputs, labels, captions
- **Never use:** Custom Google Fonts, Inter, Roboto, or any other font. Keep it native for performance.

### Scale

| Element            | Font    | Size                 | Weight                              | Color                |
| ------------------ | ------- | -------------------- | ----------------------------------- | -------------------- |
| Page title (h1)    | Georgia | text-2xl (24px)      | font-bold                           | ink                  |
| Section kicker     | System  | text-xs (12px)       | font-bold tracking-widest uppercase | celeste              |
| Section title (h2) | Georgia | text-3xl md:text-4xl | font-bold                           | ink                  |
| Card title         | System  | text-sm (14px)       | font-bold                           | ink                  |
| Body text          | System  | text-sm (14px)       | font-normal                         | ink-light            |
| Caption/label      | System  | text-xs (12px)       | font-normal                         | ink-muted            |
| KPI number         | Georgia | text-2xl–3xl         | font-bold                           | celeste-dark or gold |
| Table data         | System  | text-sm              | font-normal                         | ink-light            |
| Button             | System  | text-sm              | font-semibold                       | white (on dark bg)   |
| Nav link           | System  | text-sm              | font-medium                         | ink-light            |

---

## 4. LOGO SYSTEM

### Wordmark (text-only, used everywhere)

```
CÓNDOR     <- Georgia, bold, celeste-dark (#4A7FAF), tracking-wide
S A L U D  <- System UI, bold, gold (#F6B40E), tracking-[0.25em], smaller
```

### Logo Mark (sidebar, nav, favicon)

Circle with "C" inside:

- Background: `ink` (#1A1A1A)
- Text: `celeste-light` (#A8CCE8)
- Size: 36px (nav), 32px (sidebar)
- Border-radius: full (rounded-full)

### Flag Stripe

Always present at the very top of every page:

```html
<div className="h-1 flex sticky top-0 z-50">
  <div className="flex-1 bg-celeste" />
  <div className="flex-1 bg-white" />
  <div className="flex-1 bg-celeste" />
</div>
```

Height: 4px (h-1). Sticky. Highest z-index. Three equal bands: celeste / white / celeste.

---

## 5. COMPONENT PATTERNS

### Buttons

```tsx
// Primary (celeste dark background)
<button className="px-6 py-3 text-sm font-semibold text-white bg-celeste-dark hover:bg-celeste rounded transition">
  Label
</button>

// Secondary (outline)
<button className="px-6 py-3 text-sm font-semibold text-ink-light border border-border hover:border-celeste-dark hover:text-celeste-dark rounded transition">
  Label
</button>

// Gold accent (waitlist, special CTA)
<button className="px-6 py-3 text-sm font-bold text-ink bg-gold hover:bg-[#E5A50D] rounded transition">
  Label
</button>
```

**Rules:**

- Border-radius: `rounded` (4px). Never `rounded-full` on buttons.
- Padding: `px-6 py-3` standard, `px-5 py-2` compact (nav).
- Always include `transition` for hover states.
- Never use shadows on buttons.

### Cards

```tsx
<div className="border border-border hover:shadow-md transition">
  <div className="h-1 bg-celeste" /> {/* or bg-gold, alternating */}
  <div className="p-5">
    <h3 className="font-bold text-sm text-ink mb-2">Title</h3>
    <p className="text-[13px] text-ink-light leading-relaxed">Description</p>
  </div>
</div>
```

**Rules:**

- Border: 1px `border-border`
- No background color (white by default)
- Top accent bar: 4px, alternating celeste/gold
- Padding: p-5 (20px)
- Shadow: only on hover (`hover:shadow-md`)
- Never use `rounded-lg` on cards. Keep them sharp (no border-radius or just `rounded` at most).

### Feature Cards (left-border style)

```tsx
<div className="border-l-[3px] border-celeste bg-celeste-pale p-5">
  {/* or border-gold bg-gold-pale for alternating */}
  <h3 className="font-bold text-sm text-ink mb-1.5">Title</h3>
  <p className="text-[13px] text-ink-light leading-relaxed">Desc</p>
</div>
```

### Tables

```tsx
// Header row: dark background
<tr className="bg-[#F8FAFB] text-xs text-ink-muted">
  <th className="text-left font-medium px-5 py-3">Column</th>
</tr>

// Data rows: alternating, border-t
<tr className="border-t border-border-light hover:bg-celeste-pale/30 transition">
  <td className="px-5 py-3 text-ink-light">Data</td>
</tr>
```

**Rules:**

- Headers: `bg-[#F8FAFB]`, `text-xs`, `text-ink-muted`, `font-medium`
- Row border: `border-t border-border-light`
- Hover: `hover:bg-celeste-pale/30`
- Cell padding: `px-5 py-3`
- Color-code rejection rates: green <5%, gold 5-10%, red >10%
- Color-code payment days: red >60 days

### Section Layout

```tsx
<section className="px-6 py-20 border-t border-border">
  <div className="max-w-4xl mx-auto">
    <p className="text-xs font-bold tracking-widest text-celeste uppercase mb-2">Kicker text</p>
    <h2 className="text-3xl md:text-4xl font-display font-bold text-ink mb-4 leading-tight">
      Section Title <span className="text-celeste-dark">Highlighted Part</span>
    </h2>
    {/* Content */}
  </div>
</section>
```

**Rules:**

- Max-width: `max-w-4xl` (896px) for marketing pages
- Padding: `px-6 py-20` for sections
- Border-top between sections: `border-t border-border`
- Kicker: uppercase, tracked, celeste, text-xs, bold
- Title: Georgia, bold, ink. Highlight part in `text-celeste-dark`

---

## 6. LAYOUT PATTERNS

### Marketing Pages (/)

```
[Flag Stripe — 4px, sticky top]
[Navbar — sticky below flag, white bg, border-bottom]
[Content sections — max-w-4xl centered]
[Footer — white bg, centered brand + copy]
```

### Dashboard Pages (/dashboard/\*)

```
[Sidebar — w-60, bg-ink, fixed left]
  [Brand mark + wordmark]
  [Nav items with icons]
  [Bottom: clinic info]
[Main area — flex-1]
  [Top bar — h-14, white, date + user]
  [Content — bg-[#F8FAFB], p-6, overflow-y-auto]
```

**Dashboard rules:**

- Sidebar width: `w-60` (240px)
- Sidebar bg: `ink` (#1A1A1A)
- Active nav item: `bg-celeste-dark/20 text-white`
- Inactive nav item: `text-ink-muted hover:text-white hover:bg-white/5`
- Content area bg: `#F8FAFB`
- Cards in dashboard: `bg-white border border-border rounded-lg`
- Dashboard uses `rounded-lg` on cards (unlike marketing which is sharp)

---

## 7. SPACING SYSTEM

Use Tailwind's default spacing scale. Key values:

| Token | Pixels | Usage                                                 |
| ----- | ------ | ----------------------------------------------------- |
| p-5   | 20px   | Card padding                                          |
| p-6   | 24px   | Dashboard content padding, section horizontal padding |
| py-20 | 80px   | Section vertical padding (marketing)                  |
| gap-4 | 16px   | Card grid gaps                                        |
| gap-3 | 12px   | Button groups, form elements                          |
| mb-2  | 8px    | Kicker to title                                       |
| mb-4  | 16px   | Title to content                                      |
| mt-10 | 40px   | Content to grid                                       |

---

## 8. TECH STACK

| Layer       | Technology              | Notes                                                                      |
| ----------- | ----------------------- | -------------------------------------------------------------------------- |
| Framework   | Next.js 14 (App Router) | Use `src/` directory, `@/*` import alias                                   |
| Language    | TypeScript              | Strict mode. Always type props and state.                                  |
| Styling     | Tailwind CSS 3          | Custom colors in tailwind.config.ts. No CSS modules. No styled-components. |
| Database    | Supabase (PostgreSQL)   | For waitlist, clinics, users, billing data                                 |
| Auth        | Supabase Auth           | Email + password + TOTP 2FA                                                |
| Deploy      | Vercel                  | Auto-deploy from `main` branch                                             |
| State       | React hooks             | useState, useReducer. No Redux. No Zustand unless justified.               |
| Forms       | Native React            | No form libraries unless complexity demands it                             |
| Charts      | Recharts                | For dashboard visualizations                                               |
| API clients | Custom fetch wrappers   | In `src/lib/` — one file per external API (pami.ts, afip.ts, etc.)         |

### File Structure

```
src/
├── app/
│   ├── layout.tsx                 # Root layout (metadata, fonts, body)
│   ├── page.tsx                   # Marketing landing page
│   ├── globals.css                # Tailwind directives only
│   ├── api/                       # API routes
│   │   └── waitlist/route.ts      # Waitlist signup endpoint
│   └── dashboard/
│       ├── layout.tsx             # Sidebar + topbar layout
│       ├── page.tsx               # Main dashboard (KPIs)
│       ├── verificacion/page.tsx  # Coverage verification
│       ├── facturacion/page.tsx   # AFIP billing
│       ├── rechazos/page.tsx      # Rejection management
│       ├── financiadores/page.tsx # Financiador breakdown
│       └── inflacion/page.tsx     # Inflation tracker
├── components/
│   ├── Navbar.tsx                 # Marketing navbar
│   ├── Hero.tsx
│   ├── Stats.tsx
│   ├── Problem.tsx
│   ├── Features.tsx
│   ├── Pricing.tsx
│   ├── Waitlist.tsx
│   ├── Footer.tsx
│   └── ui/                        # Shared UI primitives
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Table.tsx
│       └── Input.tsx
├── lib/
│   ├── supabase.ts                # Supabase client
│   ├── pami.ts                    # PAMI API client
│   ├── afip.ts                    # AFIP WSFEV1 client
│   ├── swiss-medical.ts           # Swiss Medical API
│   ├── nomenclador.ts             # SSS nomenclador lookup
│   └── types.ts                   # Shared TypeScript types
└── hooks/
    └── useDebounce.ts             # etc.
```

### Naming Conventions

- Components: PascalCase (`Navbar.tsx`, `DashboardPage.tsx`)
- Utilities/lib: camelCase (`supabase.ts`, `pami.ts`)
- Types: PascalCase, suffix with type (`Clinic`, `Financiador`, `VerificacionResult`)
- API routes: kebab-case directories (`api/waitlist/route.ts`)
- CSS classes: Tailwind only. Never write custom CSS except in `globals.css` for base styles.

---

## 9. CODING STANDARDS

### TypeScript

```typescript
// Always type function parameters and return types for lib functions
export async function verificarCobertura(dni: string): Promise<VerificacionResult> {}

// Use interfaces for objects, types for unions
interface Clinic {
  id: string;
  name: string;
  cuit: string;
  planTier: "starter" | "growth" | "scale" | "enterprise";
}

type FinanciadorType = "os" | "prepaga" | "pami";
```

### Components

```typescript
// Always use default exports for page components
export default function DashboardPage() {}

// Named exports for shared components
export function KPICard({ label, value, change }: KPICardProps) {}

// "use client" only when needed (useState, useEffect, event handlers)
// Server components by default
```

### Data Fetching

```typescript
// Server components fetch data directly
// src/app/dashboard/page.tsx
export default async function DashboardPage() {
  const data = await fetchDashboardData();
  return <DashboardView data={data} />;
}

// Client components use hooks for interactive data
// src/app/dashboard/verificacion/page.tsx
"use client";
const [result, setResult] = useState<VerificacionResult | null>(null);
```

---

## 10. KEY DOMAIN TERMINOLOGY

Use these exact terms in UI, never anglicize:

| Term             | Meaning                                 | Where Used                 |
| ---------------- | --------------------------------------- | -------------------------- |
| Financiador      | Insurance/payer entity                  | Dashboard, tables, filters |
| Obra social (OS) | Union-based health insurance            | Financiador type label     |
| Prepaga          | Private health insurance                | Financiador type label     |
| PAMI             | National retiree health system          | Financiador name           |
| Nomenclador SSS  | Official procedure code catalog         | Billing, code lookups      |
| Prestación       | Medical service/procedure               | Billing line items         |
| Rechazo          | Rejected claim/bill                     | Rejection management       |
| Observación      | Claim under review (PAMI specific)      | PAMI rejections            |
| Liquidación      | Settlement/payment batch                | Payment tracking           |
| Padrón           | Registry of affiliated patients         | Verification               |
| CUIL             | Argentine tax/social security ID        | Patient lookup             |
| DNI              | National ID number                      | Patient lookup             |
| AFIP / ARCA      | Tax authority (billing)                 | Invoicing                  |
| CAE              | Electronic authorization code (invoice) | AFIP billing               |
| Factura          | Invoice                                 | Billing module             |
| Turno            | Appointment                             | Scheduling                 |

---

## 11. PRICING (always display in ARS)

| Tier       | Monthly Price    | Display Format                                       |
| ---------- | ---------------- | ---------------------------------------------------- |
| Starter    | $70.000 ARS/mes  | Use period as thousands separator (Argentine format) |
| Growth     | $210.000 ARS/mes | Featured tier (celeste border + celeste-pale bg)     |
| Scale      | $560.000 ARS/mes |                                                      |
| Enterprise | A convenir       | "contrato anual"                                     |

**Rules:**

- Always show prices in Argentine pesos
- Use period as thousands separator ($70.000 not $70,000)
- Always note "ajuste mensual IPC" (monthly inflation adjustment)
- Never show USD prices to end users (only in investor materials)

---

## 12. DO NOT

- [x] Use colors outside the palette
- [x] Use fonts other than Georgia (display) and system-ui (body)
- [x] Use rounded-full on anything except the logo mark circle
- [x] Use shadows except hover states on cards
- [x] Use gradients anywhere
- [x] Use emojis in production UI
- [x] Use English in the user-facing product (except technical terms like "dashboard")
- [x] Use "tú" — always "vos" (Argentine Spanish)
- [x] Use CSS modules, styled-components, or Sass
- [x] Use Redux, Zustand, or external state management
- [x] Create components without TypeScript types
- [x] Use `any` type — always define proper types
- [x] Put business logic in components — extract to `lib/`
- [x] Use USD in the product UI
- [x] Use comma as thousands separator (use period: $70.000)
- [x] Hard-code data that should come from API/database

---

## 13. REFERENCE: TAILWIND CONFIG

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        celeste: {
          DEFAULT: "#75AADB",
          dark: "#4A7FAF",
          light: "#A8CCE8",
          pale: "#E4F0F9",
        },
        gold: {
          DEFAULT: "#F6B40E",
          pale: "#FEF5DC",
        },
        ink: {
          DEFAULT: "#1A1A1A",
          light: "#666666",
          muted: "#999999",
        },
        border: {
          DEFAULT: "#D4E4F0",
          light: "#E8F0F6",
        },
      },
      fontFamily: {
        display: ["Georgia", "serif"],
        body: ["system-ui", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
```

---

_CÓNDOR SALUD · Brand Kit v1.0 · March 2026 · Confidencial_

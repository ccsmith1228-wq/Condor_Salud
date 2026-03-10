# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- SWR data fetching hooks with typed React hooks for all domain entities
- Bundle analyzer (`npm run analyze`) for bundle size visibility
- Accessibility testing with axe-core in Playwright E2E suite
- Docker support (multi-stage Dockerfile + docker-compose.yml)
- CONTRIBUTING.md and CHANGELOG.md

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

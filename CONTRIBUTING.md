# Contributing to Cóndor Salud

¡Gracias por querer contribuir! This document provides guidelines for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Branching Strategy](#branching-strategy)
- [Commit Conventions](#commit-conventions)
- [Pull Request Process](#pull-request-process)
- [Code Standards](#code-standards)
- [Testing Requirements](#testing-requirements)
- [Architecture Decisions](#architecture-decisions)

---

## Code of Conduct

Be respectful, inclusive, and constructive. We follow the [Contributor Covenant](https://www.contributor-covenant.org/version/2/1/code_of_conduct/).

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 20 (recommended: use `nvm`)
- **npm** ≥ 10
- **Git** ≥ 2.40
- **Docker** (optional, for containerized development)

### Setup

```bash
# Clone the repository
git clone https://github.com/ellioappio-gif/condor-salud.git
cd condor-salud

# Install dependencies (also sets up Husky git hooks)
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

### Docker Setup (alternative)

```bash
docker compose up dev
```

### Verify Setup

```bash
npm run validate    # lint + typecheck + test + build
npm run test        # unit tests only
npm run test:e2e    # E2E tests (requires dev server)
npm run analyze     # Bundle analysis report
```

---

## Development Workflow

1. **Pick an issue** from the backlog or create one
2. **Create a branch** from `develop` (see [Branching Strategy](#branching-strategy))
3. **Make your changes** with tests
4. **Run validation** locally: `npm run validate`
5. **Commit** using [conventional commits](#commit-conventions)
6. **Open a PR** against `develop`
7. **Address review feedback**
8. **Merge** after CI passes and 1 approval

---

## Branching Strategy

We use **Git Flow Lite**:

| Branch          | Purpose                         | Merges into        |
| --------------- | ------------------------------- | ------------------ |
| `main`          | Production — deployed to Vercel | —                  |
| `develop`       | Integration — next release      | `main`             |
| `feat/<name>`   | New features                    | `develop`          |
| `fix/<name>`    | Bug fixes                       | `develop`          |
| `hotfix/<name>` | Urgent production fixes         | `main` + `develop` |
| `chore/<name>`  | Tooling, deps, CI               | `develop`          |

### Branch naming examples

```
feat/swr-data-hooks
fix/facturacion-filter-reset
hotfix/sentry-dsn-missing
chore/upgrade-next-15
```

---

## Commit Conventions

We use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/):

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

| Type       | Description                 |
| ---------- | --------------------------- |
| `feat`     | New feature                 |
| `fix`      | Bug fix                     |
| `docs`     | Documentation only          |
| `style`    | Formatting (no code change) |
| `refactor` | Code change (no feat/fix)   |
| `perf`     | Performance improvement     |
| `test`     | Adding/updating tests       |
| `chore`    | Build, CI, deps             |
| `revert`   | Revert a previous commit    |

### Scopes (optional)

`auth`, `billing`, `patients`, `dashboard`, `ui`, `api`, `seo`, `security`, `ci`, `docker`

### Examples

```
feat(billing): add SWR hook for facturas data fetching
fix(auth): prevent redirect loop on expired session
test(a11y): add WCAG 2.1 AA tests for dashboard pages
chore(deps): upgrade @sentry/nextjs to 10.43.0
```

---

## Pull Request Process

### PR Title

Follow commit convention: `feat(scope): description`

### PR Template

```markdown
## What does this PR do?

Brief description of changes.

## Type of change

- [ ] New feature
- [ ] Bug fix
- [ ] Breaking change
- [ ] Documentation update

## Checklist

- [ ] Tests pass (`npm run test`)
- [ ] Build succeeds (`npm run build`)
- [ ] No new TypeScript errors (`npm run typecheck`)
- [ ] No new lint warnings (`npm run lint`)
- [ ] Updated CHANGELOG.md (if user-facing)
- [ ] Updated docs (if applicable)

## Screenshots (if UI changes)

Before | After
```

### Review Requirements

- **1 approval** minimum
- **CI must pass** (lint, typecheck, test, build)
- **No merge conflicts**
- **Coverage thresholds met** (60% statements, 50% branches)

---

## Code Standards

### TypeScript

- **Strict mode** enabled — no `any` unless absolutely necessary
- Use `interface` for object shapes, `type` for unions/intersections
- Export types alongside their implementations
- Always type function parameters and return values

### React

- **Server Components** by default — add `"use client"` only when needed
- Use the UI component library (`@/components/ui`) for consistency
- Forms use `react-hook-form` + `zod` for validation
- Data fetching uses SWR hooks from `@/hooks/use-data`

### Styling

- **Tailwind CSS** only — no inline styles, no CSS modules
- Use design tokens: `celeste`, `gold`, `ink`, `border`, `surface`
- Mobile-first responsive design (`sm:`, `md:`, `lg:`)
- Use `cn()` from `@/lib/utils` for conditional classes

### File Organization

```
src/
├── app/              # Next.js App Router pages
├── components/       # Shared components
│   └── ui/           # Design system components
├── hooks/            # Custom React hooks
├── lib/              # Core utilities
│   ├── auth/         # Authentication + RBAC
│   ├── security/     # Rate limiting, sanitization
│   ├── services/     # Data services
│   ├── supabase/     # Supabase clients
│   └── validations/  # Zod schemas
└── __tests__/        # Unit tests (mirrors src/ structure)
```

---

## Testing Requirements

### Unit Tests (Vitest)

- All utility functions must have tests
- All validation schemas must have tests
- All data service functions must have tests
- **Coverage thresholds must pass:**
  - Statements: 60%
  - Branches: 50%
  - Functions: 55%
  - Lines: 60%

```bash
npm run test              # Run once
npm run test:watch        # Watch mode
npm run test:coverage     # With coverage report
```

### E2E Tests (Playwright)

- Smoke tests for all public pages
- Accessibility tests (WCAG 2.1 AA) for all pages
- Critical user flows (login, navigation)

```bash
npm run test:e2e          # Run all
npm run test:e2e:ui       # Interactive UI mode
```

### Naming Convention

```
src/__tests__/lib/utils.test.ts        # Unit test
src/__tests__/lib/validations.test.ts  # Schema test
e2e/smoke.spec.ts                      # E2E smoke
e2e/accessibility.spec.ts              # E2E a11y
```

---

## Architecture Decisions

### Data Flow

```
Page Component -> SWR Hook -> Data Service -> [Supabase | Demo Data]
```

### Error Handling

1. **Error boundaries** (`error.tsx`) catch rendering errors -> Sentry
2. **API routes** use try/catch -> structured logging -> error response
3. **Forms** use Zod validation -> field-level error messages

### Logging

- **Server**: `pino` structured JSON logs with PII redaction
- **Client**: `createClientLogger()` — console-based, dev only
- **Never log**: passwords, DNI, CUIL, CUIT, tokens, cookies

### Security

- CSP headers on all routes
- Input sanitization via `lib/security/sanitize.ts`
- Rate limiting via `lib/security/rate-limit.ts`
- Non-root Docker user
- Supabase Row Level Security (when connected)

---

## Questions?

Open an issue or reach out to the maintainers. ¡Bienvenido al equipo!

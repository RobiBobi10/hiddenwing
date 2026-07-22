# Milestone 1 — Foundations & Authenticated Skeleton

_Status: **Ready to build** · Owner: You · Depends on: nothing (first milestone)_

Part of the [Development Roadmap](development-roadmap.md). This is the **only** milestone detailed
right now — do not build M2+ yet.

---

## 1. Objective

Stand up a **deployed, authenticated, tested Next.js application connected to a Postgres database**,
with the project's tooling, folder structure, and CI pipeline in place — the foundation every later
milestone builds on. When M1 is done, a family member can sign in and reach a protected page, the
app is live on the internet (auto-deploying on every push), the database is connected and migrated,
and the quality gate (lint + typecheck + tests + build) is green.

**Deliberately no flight logic, no AI, no optimization** — those are M2–M4. M1 is the skeleton.

## 2. Scope

### In scope
- Next.js (App Router, TypeScript **strict**) project, initialized and running.
- Tooling: ESLint, Prettier, strict TS, environment-variable validation.
- Clean-architecture **folder boundaries** established (empty but real) so later code has a home.
- Database: **Neon** Postgres connected via **Prisma**, with an initial migration.
- Minimal schema: a `User` table synced from Clerk (no profiles/trips yet).
- Auth: **Clerk** — sign-up, sign-in, sign-out, and a **protected** dashboard route.
- Config/secrets: `.env.example`, zod-validated env loader, secrets kept out of git.
- A `/api/health` endpoint reporting app + database connectivity.
- Testing harness: **Vitest** (+ Testing Library) with a few real tests, and **one** Playwright
  smoke test for the auth redirect.
- CI: **GitHub Actions** running lint, typecheck, unit tests, and build on every PR.
- Deploy: **Vercel** connected to the repo (auto-deploy on push to `main`); Neon connected.
- A short app-level `README.md` with setup steps.

### Out of scope (later milestones — do NOT build now)
- Any flight search / Duffel integration (M2).
- Optimization / TTV / ranking (M3).
- Claude / AI intake / explanations (M4).
- Preference profiles, flexibility search (M5).
- Price re-validation, booking handoff (M6).

## 3. Files affected

Greenfield — these are **new** files. Target structure:

```
hiddenwing/                              # repo root
├─ package.json
├─ tsconfig.json                       # strict: true
├─ next.config.mjs
├─ .eslintrc.json
├─ .prettierrc
├─ .gitignore                          # ignores .env*, node_modules, .next
├─ .env.example                        # documents every required env var (no secrets)
├─ vitest.config.ts
├─ playwright.config.ts
├─ README.md                           # app setup + run instructions
├─ .github/
│  └─ workflows/
│     └─ ci.yml                        # lint · typecheck · test · build
├─ prisma/
│  ├─ schema.prisma                    # User model
│  └─ migrations/                      # generated initial migration
├─ src/
│  ├─ middleware.ts                    # Clerk route protection
│  ├─ app/
│  │  ├─ layout.tsx                    # root layout + ClerkProvider
│  │  ├─ page.tsx                      # public landing
│  │  ├─ sign-in/[[...sign-in]]/page.tsx
│  │  ├─ sign-up/[[...sign-up]]/page.tsx
│  │  ├─ dashboard/page.tsx            # PROTECTED — "hello, {name}"
│  │  └─ api/
│  │     ├─ health/route.ts            # 200 + { app: ok, db: ok }
│  │     └─ webhooks/clerk/route.ts    # upsert User on sign-up
│  ├─ lib/
│  │  ├─ env.ts                        # zod-validated process.env
│  │  └─ db.ts                         # Prisma client singleton
│  ├─ domain/                          # (placeholder) pure business types — empty for now
│  │  └─ .gitkeep
│  └─ features/                        # (placeholder) feature slices — empty for now
│     └─ .gitkeep
└─ tests/
   ├─ unit/
   │  ├─ env.test.ts                   # env validation fails on missing vars
   │  └─ health.test.ts                # health route shape
   └─ e2e/
      └─ auth.smoke.spec.ts            # unauthenticated → redirected to sign-in
```

Rationale for the empty `domain/` and `features/` folders: they establish the clean-architecture
seams now (kept-quality principle, [ADR-0004](../architecture/adr/0004-modular-monolith-first.md)) so
M2+ code lands in the right place and the app can later split into services without a reshuffle.

## 4. Dependencies

### External accounts (all free tiers)
- **GitHub** — repo + Actions.
- **Vercel** — hosting, connected to the GitHub repo.
- **Neon** — serverless Postgres (grab the connection string).
- **Clerk** — auth (publishable + secret keys, and a webhook signing secret).

_(Anthropic and Duffel accounts are **not** needed for M1 — they arrive in M2/M4.)_

### Packages
- Runtime: `next`, `react`, `react-dom`, `@clerk/nextjs`, `@prisma/client`, `zod`.
- Dev: `typescript`, `prisma`, `eslint`, `eslint-config-next`, `prettier`, `vitest`,
  `@testing-library/react`, `@testing-library/jest-dom`, `@playwright/test`, `@types/*`.

### Milestone dependencies
- None — M1 is the first. Everything downstream depends on M1.

### Required environment variables (documented in `.env.example`)
```
DATABASE_URL=                      # Neon Postgres connection string
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=
NEXT_PUBLIC_APP_URL=
```

## 5. Testing requirements

| Type | Test | Passes when |
|---|---|---|
| **Unit** | `env.test.ts` | `env.ts` throws/reports clearly when a required var is missing, and parses a valid env. |
| **Unit** | `health.test.ts` | `/api/health` handler returns the expected `{ app, db }` shape and 200. |
| **Integration** | DB connectivity | Prisma connects to a Neon (test/branch) database and the initial migration applies cleanly. |
| **E2E (smoke)** | `auth.smoke.spec.ts` | An unauthenticated visit to `/dashboard` redirects to sign-in; (optionally) a signed-in session reaches `/dashboard`. |
| **Quality gate (CI)** | `ci.yml` | `lint`, `typecheck` (strict), `vitest run`, and `next build` all succeed on a PR. |

Discipline for this milestone: **CI must be green before M1 is closed.** Write `env.test.ts` and
`health.test.ts` first (they're small) so the harness is proven before more is added.

## 6. Completion criteria (Definition of Done)

M1 is complete when **all** of these are true:

- [ ] App runs locally with `npm run dev` and builds with `npm run build` (no TS/lint errors, strict mode on).
- [ ] App is **deployed on Vercel** at a live URL; pushing to `main` auto-deploys.
- [ ] **Neon Postgres** is connected; the initial Prisma migration is applied.
- [ ] A user can **sign up, sign in, and sign out** via Clerk.
- [ ] Visiting `/dashboard` while signed out **redirects to sign-in**; while signed in shows a protected "hello, {name}" page.
- [ ] On sign-up, a `User` row is **created in Postgres** (via the Clerk webhook).
- [ ] `GET /api/health` returns **200** with `{ app: "ok", db: "ok" }` (db check actually queries Postgres).
- [ ] **CI is green** on a PR: lint, typecheck, unit tests, build (plus the auth smoke test).
- [ ] `.env.example` lists **every** required variable; **no secrets are committed** (`.env*` gitignored).
- [ ] `domain/` and `features/` boundary folders exist; the app `README.md` documents setup/run/test steps.

When every box is checked, M1 is done — **then** we detail and start Milestone 2 (Flight Search via
Duffel), and not before.

---
### Notes / decisions for M1
- **ORM: Prisma** (not raw SQL / Drizzle) for its migrations + DX; matches the Scale-Edition
  [backend doc](../architecture/07-backend-architecture.md). Revisit only if it becomes a constraint.
- **Clerk over rolling our own auth** — never build auth yourself (security, [doc 15](../security/15-security-architecture.md) A07); Clerk is free at family scale and swappable later (Scale Edition path: Clerk → Ory).
- **Keep the skeleton boring.** No premature abstractions; the empty boundary folders are the only
  forward-looking structure, and they cost nothing.

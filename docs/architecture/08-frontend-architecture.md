# 08 · Frontend Architecture

_Status: Draft · Owner: Frontend · Last updated: 2026-07-22_

## 1. Goals
- **SEO-first** for the content/route-page growth wedge (see [GTM](../product/02-business-model-gtm.md)).
- **Fast, progressive** results UX — wide searches stream in (NFR-2).
- **Trust & explainability** front-and-center: every recommendation shows *why* and the delta
  vs. the literal query.
- **Accessible** (WCAG 2.1 AA, NFR-28) and **i18n/multi-currency-ready** (NFR-29).

## 2. Stack
| Concern | Choice | Why |
|---|---|---|
| Framework | **Next.js (App Router), React, TypeScript** | SSR/SSG for SEO, streaming UI, one TS stack with backend |
| Styling | **Tailwind + a component library** (Radix/shadcn) | Speed + accessible primitives |
| Data fetching | **TanStack Query** + typed API client (OpenAPI-gen) | Caching, retries, contract safety |
| Realtime | **SSE / WebSocket** for progressive search results | Matches async backend (doc 07) |
| State | Server state via Query; minimal client state (Zustand) | Avoid a heavy global store |
| Forms/validation | React Hook Form + shared Zod schemas | Reuse backend validation contracts |
| i18n | next-intl / ICU messages; currency via Intl | Multi-locale from day one |
| Testing | Vitest + Testing Library + Playwright (E2E) | See [Testing](../operations/17-testing-strategy.md) |

## 3. Rendering strategy
- **SSG/ISR** — marketing + programmatic route/content pages (SEO wedge). Cheap, crawlable.
- **SSR** — authenticated landing, shareable result snapshots (with fresh-price caveat).
- **CSR + streaming** — the interactive search experience (progressive results).

## 4. Key surfaces
1. **Trip intake** — dual mode: natural-language box *and* structured form (FR-1/2). NL calls
   the AI intake; the parsed query is shown back for confirmation/edit (transparency).
2. **Results / shortlist** — ranked by TTV with "cheapest / fastest / best value" anchors
   (FR-17); each card shows Comfort Score, bags/seat included, and the **why** (FR-19) plus the
   **delta vs. your query** (FR-18). Wide searches stream in with a progress indicator.
3. **Explanation & follow-up** — expandable rationale; (fast-follow) ask "why not the nonstop?"
   (FR-20).
4. **Cold-start onboarding** — a skippable <1-minute first-run flow (a few high-signal questions
   or a traveler-archetype pick) that seeds the Preference Profile so a new user's first search
   isn't a bare price-sort (FR-12a, review §1). Sensible defaults if skipped.
5. **Preference Profile** — view/edit/export/delete everything the system inferred (FR-13);
   consent toggles (FR-28) — this is also a GDPR surface (doc 16).
6. **Booking handoff** — live re-validation state, clear price-change re-quote (FR-21), then a
   signed, correctly-attributed deep-link to the provider (FR-22a). Cached prices are visibly
   labeled and any savings claim is substantiable (review §5/§6).
7. **Saved searches / alerts + disruption notices** (FR-24, FR-25a).

## 5. Architecture patterns
- **Feature-sliced structure** (`/features/search`, `/features/profile`, …) mirroring backend
  bounded contexts for a shared mental model.
- **Typed API layer** generated from the backend OpenAPI spec — no hand-written fetch types;
  contract drift caught at build.
- **BFF** (Next.js route handlers / a thin gateway) shapes payloads for the UI and hides
  cross-service calls (doc 14).
- **Optimistic + progressive UI** — never a blank spinner for wide searches; show partial
  ranked results and refine.

## 6. Price-integrity in the UI (trust)
- Cached/estimated prices are **visibly labeled**; the primary CTA triggers a **live
  re-validation** and surfaces any change before handoff (FR-21, NFR-12). The UI must never
  imply a cached price is guaranteed.

## 7. Performance
- Core Web Vitals budgets enforced in CI (LCP/CLS/INP).
- Route-level code splitting; image optimization; edge caching for static/ISR content.
- Skeletons + streamed hydration for perceived speed.

## 8. Accessibility & i18n
- Semantic HTML, keyboard nav, focus management, ARIA on custom controls; automated axe checks
  in CI + manual audits.
- All copy externalized; date/number/currency via `Intl`; RTL-ready layout.

## 9. Mobile
- Responsive web first. Native apps (React Native / Expo to share TS + validation) are a
  post-MVP consideration (doc 19).

## 10. Rejected alternatives
- **SPA-only (CSR)** — bad for the SEO wedge; rejected in favor of Next.js hybrid.
- **Separate design-system package on day one** — premature; start with shadcn/Radix, extract a
  package when reuse demands.

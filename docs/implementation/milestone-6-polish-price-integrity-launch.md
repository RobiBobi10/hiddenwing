# Milestone 6 — Polish, Price-Integrity & Family Launch

_Status: **Ready to build** · Owner: You · Depends on: [M5](milestone-5-personalization-flexibility.md) (✅ complete)_

Part of the [Development Roadmap](development-roadmap.md). This is the **final** milestone — it turns
a working prototype into something the family can actually rely on. Built in three sub-parts, in this
order: **M6a Price-Integrity**, **M6b Polish & Responsive**, **M6c Hardening & Launch**.

---

## 1. Objective

Make Hiddenwing **trustworthy, finished, and usable by non-technical family members on any device.**
The trust-critical piece is **price integrity**: a shown price must be re-validated live before we
ever send someone to book, so nobody acts on a stale fare. The rest is the polish and hardening that
separate "it works on my machine" from "my parents can use it on their phone."

## 2. Scope-setting: what "launch" means for the Family Edition (challenge first)

Per CLAUDE.md we **challenge the assumption** that "launch" means a full public product launch. It
does **not**. Per the [Family Edition](../FAMILY-EDITION.md) §7 boundary:

- This is a **private tool for 2–10 known people**, taking **no money**, booking **nothing on the
  user's behalf**. That means the heavy launch machinery — **GDPR DPIA, seller-of-travel
  registration, PCI, cookie-consent, a formal security audit** — is **explicitly out of scope**, and
  correctly so. Building it now would be wasted effort (doc 15/16 apply to a *public commercial
  service*).
- **The boundary is money + strangers.** The moment you open public signups or take payment, the
  Scale-Edition security/GDPR/legal work becomes required again. M6 adds a **one-page "before you go
  public" checklist** so that trigger is never crossed by accident.

So M6 is deliberately **lean**: trust (price integrity), polish (usable + responsive), and
**family-appropriate** hardening — not enterprise compliance.

## 3. Sub-parts, scope & plan

### M6a — Price-Integrity (build first; trust-critical)
The one feature we deliberately deferred to last (FR-21, NFR-12; doc 13 §6).

- Add **`price(offerId)`** to the `ProviderPort` and implement it in the Duffel adapter (re-fetch /
  re-price the selected offer).
- A **"Confirm price" action** on an offer: re-validates against Duffel **before** any booking
  handoff. If the price moved or the offer expired, show the **new** price / a clear "this fare is no
  longer available, re-search" message. A stored price is **never** presented as bookable
  (ADR-0009).
- **Booking handoff (honest, no-money):** because the Family Edition is not a seller of travel, we do
  **not** take payment or issue tickets. The handoff is a **confirmed summary + "book directly with
  {airline}" guidance** (deep link where available), clearly stating the price was validated at a
  timestamp. This keeps us the right side of the money/stranger boundary (ADR-0003 affiliate-style,
  minus monetization).
- **Risk:** users treat an indicative price as final → mitigated by the confirm step + explicit
  freshness labels everywhere a price appears.

### M6b — Polish & Responsive (make it feel finished)
- **Responsive pass:** phone / tablet / desktop. The search panel, results, profile, and dashboard
  all usable at ≤ 400 px (stack fields, tap-friendly targets).
- **States:** proper **loading skeletons**, **empty states** ("no flights — try ± dates or nearby
  airports"), and **friendly error** surfaces everywhere (some exist; make them consistent).
- **Self-explanatory presentation** (the deferred UX niceties, [UX plan](../product/25-ux-and-searchability-plan.md)):
  **airline logos** (Duffel provides `airline.logo_symbol_url`), **city/airport names** (not just
  IATA), readable durations/dates (done). **Route map + great-circle distance** are *optional* nice-
  to-haves — include only if cheap.
- **Airport autocomplete** (optional pull-in from the UX plan): type "London" → pick an airport.
  Only if time allows; NL search already covers most of the need.
- **Accessibility pass:** keyboard navigation, focus states, colour contrast, `aria-label`s, form
  labels (mostly present) — a genuine once-over.
- **Visual consistency:** spacing, typography, the value tags, a small brand touch.

### M6c — Hardening & Launch (family-appropriate)
- **Rate limiting** on the API routes (`/api/search`, `/api/ai/search`, `/api/ai/explain`) — a simple
  per-user/IP limiter to stop a runaway loop from burning Duffel/Gemini quota. (Maps to OWASP
  "rate limiting"; keeps costs bounded.)
- **Security headers** via `next.config` (CSP where feasible, `X-Frame-Options`, `Referrer-Policy`,
  HSTS on Vercel).
- **Input validation review** (already zod-validated everywhere; confirm no route trusts raw input).
- **Secrets review:** confirm all keys are server-only and in Vercel env, none committed (done;
  re-verify). Rotate any key that ever touched a screenshot if desired.
- **Dependency audit:** review the `npm audit` findings (the deferred "8 vulnerabilities") and patch
  what's safe **without** `--force`.
- **Error hygiene:** no stack traces or internal paths leak to the client; server logs only.
- **Family onboarding:** short doc on **inviting family via Clerk** (allowlist / manual invite so it
  stays private — the money/strangers boundary), and a first-run "how to use it" note.
- **Final QA pass:** run through every flow on desktop + mobile; fix what's rough.
- **Launch checklist + "before you go public" checklist** (the boundary tripwire from §2).

### Out of scope (Scale Edition / later)
- Payments, ticket issuance, seller-of-record — **not** the Family Edition (boundary).
- GDPR DPIA, cookie consent, formal audit, on-call/SLOs — public-service concerns (docs 15–21).
- Multi-provider failover, async job queue, caching mesh — Scale Edition (docs 06/13/24).
- Learned/behavioural ranking — post-MVP (doc 12 §9).

## 4. Requirements traceability (per CLAUDE.md "check the requirements")

| Project standard / requirement | How M6 satisfies it (Family Edition scope) |
|---|---|
| **Pricing/availability from reliable providers; AI not for accuracy** | Price-integrity re-validates against Duffel; AI still only understands/explains (ADR-0006). ✅ |
| **Security — OWASP: input validation, rate limiting, secrets, authz** | zod on every input (done); M6c adds rate limiting, security headers, secrets re-check, error hygiene. ✅ (family scope) |
| **Security — GDPR, PCI, seller-of-travel** | **Deferred by boundary** — private, no money, no strangers (Family Edition §7). Tripwire checklist added. ⏸ by design |
| **Testing** | M6 adds a price-integrity unit test + a final manual QA matrix; CI stays green. ✅ |
| **Documentation is part of the product** | `/docs` + `README` updated; family-onboarding + launch + go-public checklists added. ✅ |
| **Performance & scalability** | Family scale is trivial; M6 confirms no obvious regressions and keeps flexibility fan-out capped. ✅ (Scale work stays documented for later) |
| **Clean architecture / maintainability** | `price()` lands behind the existing `ProviderPort`; polish is UI-layer only; no seams broken. ✅ |
| **Product vision — optimal, explainable travel** | Price integrity closes the trust loop; polish makes the value legible to real users. ✅ |

## 5. Files affected (indicative)

```
M6a: src/domain/providers/provider-port.ts (+ price())
     src/features/search/duffel/duffel-adapter.ts (+ price impl)
     src/app/api/offers/[id]/price/route.ts (re-validate endpoint)
     src/app/search/offer-card.tsx (+ "Confirm price" + freshness label)
     tests/unit/…price mapping test
M6b: src/app/**/*.tsx + globals.css (responsive, states, logos, names, a11y)
     src/features/search/airport-names.ts (IATA → city/airport name map or Duffel places)
M6c: src/lib/rate-limit.ts, next.config.mjs (headers),
     docs/implementation/family-onboarding.md, docs/implementation/launch-checklist.md,
     docs/implementation/before-you-go-public.md
```

## 6. Testing requirements

| Type | Test | Passes when |
|---|---|---|
| **Unit** | price mapping | A re-priced Duffel offer maps to the same normalized shape; a changed price surfaces as changed. |
| **Unit** | rate limiter | Nth request in a window is rejected; resets after the window. |
| **Manual (matrix)** | full QA | Every flow (AI search, manual search, flexibility, profile, confirm-price) works on **desktop + phone widths**; empty/error/loading states look right. |
| **Manual** | price integrity | Confirming a price re-validates; an expired offer shows the "re-search" message, never a stale bookable price. |
| **Quality gate** | `npm run test` / build / deploy | Green; live on Vercel. |

## 7. Completion criteria (Definition of Done)

**M6a — code complete (2026-07-23); pending browser verification**
- [x] `ProviderPort.price()` exists and is implemented for Duffel (`offers.get`, expiry-aware).
- [x] An offer can be **re-validated live** via `POST /api/offers/:id/price`; expired offers return
      `available:false`; a stored price is never shown as bookable.
- [x] Booking handoff is a **"Confirm price" → confirmed summary + book-direct with {airline}"** with
      an expiry/hold time (no payment, no ticketing).
- [x] _(M6c bonus, done alongside)_ security headers set in `next.config.mjs`.

**M6b**
- [ ] Usable and good-looking on **phone, tablet, desktop**; loading/empty/error states everywhere.
- [ ] **Airline logos + city/airport names** shown; durations/dates readable.
- [ ] Accessibility once-over done (keyboard, contrast, labels).

**M6c**
- [ ] **Rate limiting** on AI/search routes; **security headers** set; secrets re-verified server-only.
- [ ] `npm audit` reviewed and safely patched; no internal errors leak to the client.
- [ ] **Family-onboarding**, **launch**, and **before-you-go-public** docs written.
- [ ] Final QA matrix passed; tests green; deployed.

When every box is checked, **the MVP is complete** — Hiddenwing is a trustworthy, polished, private
AI travel optimizer the family can use for a real trip. Post-MVP directions live in the
[future roadmap](../product/19-future-roadmap.md) and the Scale-Edition docs.

---
### Notes / decisions for M6
- **Price integrity is the trust close** — the whole product's credibility rests on "a shown price is
  real," so it's the first and most important M6 piece (NFR-12).
- **Lean launch by design** — the Family Edition boundary keeps compliance out of scope; the
  "before you go public" checklist is the guardrail, not a to-do list.
- **Polish last, once** — deferred here precisely so we polish the *final* set of screens once,
  cheaply (UX plan rationale).

# 18 · MVP Roadmap

_Status: Draft · Owner: Product / Eng · Last updated: 2026-07-22_

> **🏠 Family-first.** This roadmap is the **Scale Edition** MVP (public product, team build). We
> are building the **[Family Edition](../FAMILY-EDITION.md) first** — a 6–8 part-time-week solo
> build for 2–10 people at ≈ $0–15/month, whose roadmap lives in that doc. Use this roadmap only
> when/if the family version proves worth scaling into a public product.

## Goal of the MVP

Prove the **core thesis**: that personalized Total-Trip-Value optimization over a *flexibility
space* produces measurably better trips than a literal search — and that travelers value the
explanation. Everything not serving that proof is cut.

**Success = a validated north-star metric:** median `TTV(recommended) − TTV(literal query)` is
positive and meaningful (e.g. ≥ €40 or ≥ 2 hours) across real searches, with a healthy
search→handoff rate.

## Scope decisions (what's in / out)

| In (MVP) | Out (post-MVP) |
|---|---|
| One-way + round-trip | Multi-city, open-jaw, "anywhere" |
| Date-grid + nearby-airport flexibility | Split-ticket (fast-follow) |
| Deterministic TTV ranking + Comfort Score | Implicit preference learning (start explicit) |
| NL intake **and** structured form | Voice, chat memory across sessions |
| Explanations (grounded) | Follow-up Q&A on results (fast-follow) |
| **Cold-start onboarding** (FR-12a) | Implicit preference learning |
| Signed/attributed affiliate deep-link handoff | In-platform booking / ticketing |
| **Disruption detection + notify** (FR-25a) | Disruption **rebooking** assistance (Phase 3) |
| Email/OAuth accounts + editable profile | Price-drop monitoring/alerts (Phase 2) |
| Experimentation platform (for TTV tuning) | — |
| 1 primary + 1 fallback provider (native-flexible) | Full multi-provider mesh |

## Timeline (indicative, ~6 months)

### Month -1 — Validate before you build (gate, added per review §7/§9)
Two things must clear **before** committing the full build budget:
- **[Provider Due-Diligence Spike](../Review/provider-due-diligence-spike.md)** — inventory access,
  cost, caching rights, booking model, unit economics. Hard go/no-go.
- **(Recommended) Wizard-of-Oz value validation** — a human + tools optimizes real trips for ~50
  target users to test "people value TTV optimization and will pay" for a fraction of build cost.
  De-risks the biggest business assumption (review §8) before the engine exists.

### Month 0 — Foundations
- Repo, CI/CD, IaC skeleton, environments (see [Deployment](../operations/20-deployment-strategy.md)).
- Auth, user + profile data model (see [Database](../architecture/09-database-design.md)).
- Provider adapter interface + **one** provider integrated behind it, **preferring its native
  flexible-search endpoint** (see [Data Providers](../architecture/13-data-providers.md),
  [ADR-0007](../architecture/adr/0007-native-flexible-search.md)).
- **Async-first search skeleton** (job + progressive results) from the start, not retrofitted
  ([ADR-0008](../architecture/adr/0008-async-first-search.md)).
- Observability baseline (tracing, logs, **provider-cost + re-validation-failure metrics**).
- **Experimentation platform primitive** — feature flags + assignment + metric pipeline
  (review §1). You cannot tune the TTV optimizer without it; it's a Month-0 dependency, not a
  later add. See [Experimentation & Analytics](../operations/23-experimentation-and-analytics.md).

### Month 1–2 — Search & optimization core
- Structured search → normalized query → provider fan-out → normalized results.
- **Optimization Engine v1**: deterministic TTV scoring + Comfort Score (doc 12). This is the
  crown jewel — build and test it hard (100% coverage on scoring, NFR-21).
- Fare cache + live re-validation path (NFR-12/14).

### Month 2–3 — Flexibility
- Date-grid and nearby-airport expansion with a **provider-cost budget** (query planner).
- Async wide-search with progressive results (NFR-2).
- Delta-vs-literal-query display (the "we saved you X" moment).

### Month 3–4 — AI layer (at the edges) + cold start
- NL intake → structured query + profile deltas (grounded, with structured-output validation).
- **Cold-start onboarding** to seed the Preference Profile in <1 min (FR-12a) — without it, new
  users get a bare price-sort and the moat is empty (review §1).
- Grounded explanations for each recommendation.
- Eval harness online: preference-extraction accuracy + grounding gate (doc 11).

### Month 4–5 — Trust & handoff
- Live re-validation UX, cached-price labeling, audit log.
- Affiliate deep-link handoff for the launch provider(s).
- Security review + pen-test pass (OWASP, doc 15); GDPR DSAR/erasure flows (doc 16).

### Month 5–6 — Beta & instrument
- Closed beta; instrument the north-star **proxies** end to end (doc 01) plus a holdout control.
- **Disruption/IROPS detection** for saved trips (FR-25a) — detection + notification only.
- **Support & trust-safety model** live (review §1): a path for "price changed" / "where's my
  refund" tickets, even with affiliate handoff. It's a real cost line, not zero.
- Content/SEO wedge live (see [GTM](02-business-model-gtm.md)).
- Harden, load-test to target concurrency, fix the top reliability issues, public launch.
- **(Parallel) B2B design-partner track** kicked off ([ADR-0010](../architecture/adr/0010-b2b-track-in-parallel.md))
  — hedges the B2C economic/inventory risk (review §8).

## Explicit risks & mitigations
- **Provider cost blows up under flexibility search** → query-planning budget + caching from
  day one; treat provider-cost as a release-gating metric.
- **AI shows a wrong price** → AI never sources prices; deterministic pricing + live
  re-validation (hard architectural boundary).
- **Optimization "feels wrong" to users** → determinism + explanations make every ranking
  debuggable; tune TTV weights against real feedback.
- **Thin affiliate economics** → MVP is about *validating value*, not revenue; subscription is
  the Phase-2 monetization (GTM doc).

## Definition of done for MVP
North-star metric validated on real traffic; core search p95 ≤ 4 s; zero known Sev-1 pricing
defects; GDPR + security gates passed; docs/ADRs current.

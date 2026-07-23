# Development Roadmap — Family Edition

_Status: Active · Owner: You · Last updated: 2026-07-22_

The implementation plan for the **[Family Edition](../FAMILY-EDITION.md)** — the product for
2–10 people, built solo, on the approved stack (Next.js · Neon Postgres · Clerk · Duffel · Claude ·
Vercel, all TypeScript). This roadmap breaks the MVP into six milestones.

> **Working rule:** milestones are built **in order, one at a time**. Only the *current* milestone
> is detailed in full; future milestones are listed by objective so we don't design or build them
> prematurely. **M1 & M2 are ✅ complete**; **Milestone 3 is detailed now** in
> [milestone-3-optimization-engine.md](milestone-3-optimization-engine.md). The rest get their own
> detailed doc when we reach them.
>
> **UX & searchability** (autocomplete, readable places, maps, responsive, polish) are staged
> separately in the [UX & Searchability Plan](../product/25-ux-and-searchability-plan.md) — most
> polish is deliberately a single M6 pass; airport autocomplete is pulled forward to M4.

## Milestone overview

| # | Milestone | Objective (headline) | Depends on |
|---|-----------|----------------------|-----------|
| ✅ **M1** | **Foundations & Authenticated Skeleton** | A deployed, authenticated Next.js app connected to Postgres, with tooling, CI, and clean-architecture boundaries in place. No flight logic yet. | — |
| ✅ **M2** | **Flight Search (Duffel)** | Integrate one flight-data provider behind an adapter; a structured search returns real, normalized flight options. | M1 |
| ✅ **M3** | **Optimization Engine** | The deterministic **TTV** ranking + Comfort Score — the core value. Rank options by *your family's* definition of value, not just price. | M2 |
| ✅ **M4** | **AI Layer** | The AI (Gemini Flash, free) turns a plain-language trip request into a structured search, and writes **grounded** "why this trip" explanations (never invents prices). | M3 |
| M5 | Personalization & Flexibility | Preference profiles per family member; flexibility search (nearby airports, ± a few days). | M3 (M4 helpful) |
| M6 | Polish, Price-Integrity & Family Launch | Live price re-validation before any booking handoff, error handling, and deploy for real family use. | M2–M5 |

## Why this order
1. **M1 first** because everything needs a deployed, authenticated, tested skeleton to build in.
2. **M2 before M3** because the optimizer needs real flight options to rank.
3. **M3 before M4** because the deterministic engine must own ranking/pricing; the AI only
   *understands* and *explains* it ([ADR-0006](../architecture/adr/0006-ai-authority-boundary.md)).
   Building the engine first keeps that boundary honest.
4. **M5** layers personalization on a working ranking.
5. **M6** hardens the trust-critical path (a shown price must be real) before the family relies on it.

## Milestone template (every future milestone doc uses this)
Each milestone, when reached, gets a doc with exactly these sections:
- **Objective** — what "done" achieves, in one paragraph.
- **Scope (in / out)** — what this milestone does and explicitly does *not* do.
- **Files affected** — the concrete files created/changed.
- **Dependencies** — prior milestones, external accounts, and packages needed.
- **Testing requirements** — the tests that must exist and pass.
- **Completion criteria (Definition of Done)** — the checklist that closes the milestone.

## Kept-quality principles that carry through every milestone
Even at family scale, these Scale-Edition principles hold (they're cheap and they're the point):
- **Deterministic pricing/ranking; AI only at the edges, grounded** ([ADR-0006](../architecture/adr/0006-ai-authority-boundary.md)).
- **A shown bookable price is re-validated live before any booking handoff** (built in M6).
- **Clean architecture boundaries** so the app can later split into services
  ([ADR-0004](../architecture/adr/0004-modular-monolith-first.md)) — established in M1.
- **Provider behind an adapter** so a second provider is additive later
  ([ADR-0002](../architecture/adr/0002-multi-provider-adapter-strategy.md)) — established in M2.

---
### Current status
- ✅ **M1 — Foundations:** complete → [milestone-1-foundations.md](milestone-1-foundations.md). Live at hiddenwing.vercel.app.
- ✅ **M2 — Flight Search:** complete → [milestone-2-flight-search.md](milestone-2-flight-search.md). Live `/search` returns ranked-by-price offers.
- ✅ **M3 — Optimization Engine:** complete → [milestone-3-optimization-engine.md](milestone-3-optimization-engine.md). Best-value ranking live.
- ▶ **M4 — AI Layer:** detailed and building → [milestone-4-ai-layer.md](milestone-4-ai-layer.md). Gemini Flash (free) behind an AI port.
- ⏸ M5–M6: objectives set above; **not yet detailed** (by design — one milestone at a time). See the [UX & Searchability Plan](../product/25-ux-and-searchability-plan.md) for when polish lands.

# ADR-0007: Prefer provider-native flexible search over DIY fan-out

- **Status:** Accepted
- **Date:** 2026-07-22
- **Deciders:** Architecture
- **Related:** [Data Providers §4a](../13-data-providers.md), [Optimization](../12-flight-search-optimization.md), [Business Model §2a](../../product/02-business-model-gtm.md), [CTO Review](../../Review/CTO_Review.md) §9.2, NFR-1

## Context
Flexibility search is the core feature but also the core cost/latency risk. A naïve implementation
issues one provider call per (date × nearby-airport × provider) cell — 20–100+ calls per search —
which drives both search latency (provider calls run 2–10 s) and the dominant cost line in the
[unit-economics model](../../product/02-business-model-gtm.md#2a-per-search-unit-economics--the-make-or-break-model-added-per-review-248). The CTO review flagged that this single design choice can
make the whole business unprofitable.

## Options considered
1. **DIY fan-out** — full control, works with any provider; but call-count and latency explode;
   likely negative per-search margin. Rejected as the *primary* mechanism.
2. **Provider-native flexible/cheapest-date endpoints** (Amadeus Flight Cheapest Date Search, Kiwi
   flexible search, price-calendar/month-view APIs) — enumerate cheap regions of the flexibility
   space in *few* calls; then do targeted live calls only on promising cells.
3. **Cache-only flexibility** — cheapest, but stale and constrained by caching rights (ADR
   pending legal, review §5); insufficient accuracy alone.

## Decision
The query planner **prefers provider-native flexible-search endpoints** to survey the flexibility
space cheaply, then issues **targeted live calls only on the cells the user might actually book**.
DIY fan-out is the *fallback* for providers without native support.

## Rationale
This can cut provider calls per search by an order of magnitude, directly attacking the top cost
and latency risks, and it's the biggest single architectural win identified in the review. It also
plays to the async-first design (ADR-0008): survey fast, refine progressively.

## Consequences
- Positive: dramatically lower provider cost/latency per search; makes the unit-economics model
  viable; better first-result latency.
- Negative / accepted: native endpoints vary in shape and coverage per provider (more
  normalization work, doc 13); some providers lack them (fallback to fan-out); native results may
  need a live confirm before booking (already required, NFR-12).
- Follow-up: the provider due-diligence spike records which providers offer native flexible search
  (a selection criterion).

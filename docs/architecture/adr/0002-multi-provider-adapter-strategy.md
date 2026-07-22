# ADR-0002: Multi-provider via the adapter pattern

- **Status:** Accepted
- **Date:** 2026-07-22
- **Deciders:** Architecture
- **Related:** [Data Providers](../13-data-providers.md), [Backend](../07-backend-architecture.md), NFR-6/11

## Context
Pricing and availability must come from reliable providers (CLAUDE.md). Coverage and best price
vary by provider; any single one is a single point of failure and a competitive ceiling. We also
must control provider call cost (the dominant scaling cost).

## Options considered
1. **Single provider (e.g. one aggregator)** — fastest to build; fragile, weak coverage, no
   price competition, SPOF. Rejected.
2. **Multiple providers, called directly from domain code** — flexible but leaks
   provider-specific shapes everywhere; brittle, hard to test, hard to add/remove providers.
3. **Multiple providers behind a `ProviderPort` adapter interface** — domain stays
   provider-agnostic; adapters normalize to a common offer model; add/remove = adapter change.

## Decision
All providers implement a domain-defined `ProviderPort`; normalization to a common offer model
happens inside each adapter. Start API-first (e.g. Duffel/Kiwi) and add a GDS (Amadeus/Sabre) for
coverage. Never depend on one provider.

## Rationale
The adapter pattern satisfies the no-SPOF and graceful-degradation NFRs, keeps the domain and
optimization engine pure/testable, and makes provider onboarding a contained, checklist-driven
task. It also lets the query planner reason about per-provider cost/rate limits uniformly.

## Consequences
- Positive: resilience (failover), testability, competitive coverage/price, clean cost control.
- Negative: normalization is real work (baggage, fare rules, timezones, dedupe); ongoing
  per-provider maintenance and ToS/caching compliance.
- Follow-up: provider onboarding checklist in [doc 13](../13-data-providers.md); revisit provider
  mix as volume unlocks better commercial terms.

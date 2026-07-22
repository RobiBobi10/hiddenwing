# ADR-0008: Async-first, progressive search

- **Status:** Accepted
- **Date:** 2026-07-22
- **Deciders:** Architecture
- **Related:** [Backend §5](../07-backend-architecture.md), [System](../06-system-architecture.md), [Frontend](../08-frontend-architecture.md), [CTO Review](../../Review/CTO_Review.md) §2–3, NFR-1/1b/2

## Context
The original design centered on a synchronous search with a p95 ≤ 4 s *full-result* target and
treated async/progressive as a special case for "wide" searches. The CTO review challenged this:
live, multi-provider flexibility search cannot reliably hit 4 s because provider search calls
alone routinely run 2–10 s. You cannot have live accuracy, wide flexibility, and a 4 s full-result
p95 at once.

## Options considered
1. **Sync-first (original)** — simplest client model; but the SLO is unachievable for the core
   feature, forcing either heavy cache reliance (ToS/staleness risk, review §5) or broken latency
   promises. Rejected.
2. **Async-first, progressive** — every non-trivial search is a job; results stream in and are
   scored as they arrive; SLO is redefined around *first meaningful result*. A cache-served sync
   fast lane remains for narrow exact-date queries.
3. **Always fully async, no fast lane** — clean but needlessly slow for trivially cacheable narrow
   queries.

## Decision
**Async/progressive is the primary search path.** The latency SLO is re-baselined to **first
meaningful result p95 ≤ 2 s** (NFR-1) with the full set filling progressively ≤ 10 s (NFR-1b). A
**cache-served sync fast lane** handles narrow, exact-date, contractually-cacheable queries as an
optimization on top — never the primary flow.

## Rationale
This aligns the architecture with provider reality, makes the latency promise honest and
achievable, and pairs naturally with native flexible search (ADR-0007): survey fast, stream and
refine. Progressive UX is also better product — users see value in <2 s instead of staring at a
spinner.

## Consequences
- Positive: honest, achievable SLOs; better perceived speed; natural fit with cost-aware,
  native-flexible search.
- Negative / accepted: more complex client (SSE/WebSocket, progressive rendering — doc 08); result
  ordering can shift as cells resolve (needs stable-shortlist UX handling); the async fan-out
  becomes the scaling crux (queue durability decided up front, not "Kafka later" — review §4).
- Follow-up: define the streaming contract in [API Strategy](../14-api-strategy.md); instrument
  first-meaningful-result latency as the primary search SLO (doc 21).

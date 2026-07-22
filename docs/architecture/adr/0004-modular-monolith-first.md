# ADR-0004: Modular monolith first, extract services later

- **Status:** Accepted
- **Date:** 2026-07-22
- **Deciders:** Architecture
- **Related:** [System](../06-system-architecture.md), [Backend](../07-backend-architecture.md), NFR-5

## Context
We must design for millions of users (CLAUDE.md), which tempts a microservices-from-day-one
design. But at pre-PMF stage the service seams aren't yet known, and premature distribution adds
network failure modes, deployment complexity, and slower iteration.

## Options considered
1. **Full microservices now** — "web-scale" ready; but distributed complexity, hard local dev,
   guessed boundaries that will be wrong, slow iteration. Rejected for this stage.
2. **Single unstructured monolith** — fast now; becomes a big ball of mud, hard to extract later.
3. **Modular monolith with strict bounded-context boundaries + a few genuinely-separate
   services** (AI service, extractable Optimization Engine) — fast iteration, clean seams that
   double as future service boundaries.

## Decision
Build a **modular monolith** (NestJS/TS) with enforced module boundaries and inward-only
dependencies, plus a separate **AI service** (Python) and an **isolatable Optimization Engine**.
Extract additional services along the existing seams when scale/independent-scaling demands it.

## Rationale
This gives clean architecture and testability now, keeps distributed-systems cost low while the
team is small, and — because modules are already well-bounded with port interfaces — makes later
extraction mechanical rather than a rewrite. Matches the NFR-5 scale target without paying its
full complexity up front.

## Consequences
- Positive: velocity, simpler ops/local dev, clean seams, cheap path to services later.
- Negative / accepted: discipline required to keep boundaries honest (enforced in review/CI); one
  deploy unit initially (mitigated by good CI/CD, doc 20).
- Revisit trigger: a module needs independent scaling, isolation, or a different runtime → extract
  it to a service (the AI service and Optimization Engine are the first candidates).

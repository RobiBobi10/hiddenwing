# 04 · Non-Functional Requirements

_Status: Draft · Owner: Architecture · Last updated: 2026-07-22_

NFRs are the quality bar. Where a number is a target it is marked _(target)_ and owned by an SLO
in [Observability & SLOs](../operations/21-observability-and-slos.md). IDs are `NFR-x`.

## 1. Performance & latency

> **Re-baselined per [CTO Review](../Review/CTO_Review.md) §2–3 (2026-07-22).** Live,
> multi-provider flexibility search cannot reliably hit a 4 s *full-result* p95 because provider
> search calls alone routinely run 2–10 s. **Async-first / first-meaningful-result is the design
> center**, not a special case (see [ADR-0008](../architecture/adr/0008-async-first-search.md)).

- **NFR-1 (primary SLO)** **First meaningful result p95 ≤ 2 s** — a usable, ranked partial
  shortlist streamed to the user; the full result set continues to fill progressively. This
  replaces the old "full result ≤ 4 s" target, which is not achievable with live multi-provider
  flexibility search.
- **NFR-1b** Full result set (all flexibility cells resolved) p95 **≤ 10 s**, delivered
  progressively; the UI is never blocked waiting for it.
- **NFR-2** All non-trivial searches run through the **async/progressive** path; a bounded
  cache-served "fast lane" may answer narrow, exact-date queries synchronously where provider
  caching rights permit (see [Data Providers](../architecture/13-data-providers.md), legal §5 of
  the review).
- **NFR-3** Optimization scoring of 10k candidate solutions **≤ 500 ms** (deterministic engine,
  no network in the scoring path). *Unchanged — this is the compute side and is realistic.*
- **NFR-4** AI intake (NL→structured query) p95 **≤ 1.5 s**; must never block the structured
  path (FR-2).

## 2. Scalability
- **NFR-5** Design for **10M+ registered users** and **millions of searches/day**; every core
  service horizontally scalable and stateless where possible.
- **NFR-6** No single point of failure in the request path; provider outages degrade gracefully
  (see NFR-11).
- **NFR-7** Search is bursty (deals, holidays) — autoscale on queue depth / concurrency, not
  just CPU.

## 3. Availability & reliability
- **NFR-8** Core search availability **99.9%** _(target)_ monthly (≈43 min/mo budget).
- **NFR-9** Booking-handoff path **99.95%** — it's closest to revenue and trust.
- **NFR-10** RPO ≤ 5 min, RTO ≤ 30 min for user data (profiles, saved trips).
- **NFR-11** **Graceful degradation:** if a provider is down, serve remaining providers + cache
  and label freshness; never show a hard error if any results exist.

## 4. Correctness & data integrity (highest priority)
- **NFR-12** A price shown as bookable must match the provider at handoff within tolerance, or
  the user is re-quoted. **Wrong prices are Sev-1.**
- **NFR-13** Optimization ranking is **deterministic and reproducible** given the same inputs +
  profile version (required for debugging and trust). **Caveat (review §2):** provider prices
  change constantly, so reproducibility only holds against a **snapshotted offer set**.
  Reproducibility is guaranteed *given the stored snapshot*, and snapshotting has a real storage
  cost owned by [ADR-0009](../architecture/adr/0009-offer-snapshot-storage.md) — not free as
  originally implied.
- **NFR-14** Cache staleness bounded by TTL; all bookable prices re-validated live (FR-21).

## 5. Security
- **NFR-15** Meet all controls in [Security Architecture](../security/15-security-architecture.md):
  OWASP Top 10 mitigations, TLS 1.2+ in transit, AES-256 at rest, centralized secrets, per-user
  and per-IP rate limiting, strict input validation on every boundary.
- **NFR-16** No secrets in code or logs; PII never in plaintext logs.

## 6. Privacy & compliance
- **NFR-17** GDPR-compliant by design: lawful basis per purpose, data minimization, DSAR
  fulfilment ≤ 30 days, right to erasure honored across all stores (see
  [16-gdpr](../security/16-gdpr-and-privacy.md)).
- **NFR-18** Data residency configurable per region (EU data stays in EU).

## 7. Observability
- **NFR-19** Every request carries a correlation/trace ID across all services and provider
  calls. Structured logs, RED/USE metrics, distributed tracing (see doc 21).
- **NFR-20** Provider cost and call volume are first-class metrics (business-critical — see
  [Business Model](02-business-model-gtm.md)).

## 8. Maintainability & quality
- **NFR-21** ≥ 80% line coverage on core domain (optimization, pricing, profile); 100% on the
  TTV scoring functions.
- **NFR-22** Clean architecture: domain logic independent of frameworks and providers (provider
  adapters behind interfaces — see [Backend](../architecture/07-backend-architecture.md)).
- **NFR-23** All architecture changes accompanied by doc + ADR updates in the same PR.

## 9. AI quality
- **NFR-24 (reframed, review §2)** LLM output in the results path is **grounded**. Split into an
  achievable hard gate + a measured target, because "100% grounding" as an absolute is not
  attainable and creates false assurance:
  - **NFR-24a (hard gate):** **0 fabricated *quantitative* facts displayed** — every number,
    price, time, airport, and carrier in shown output must trace to verified source data or it is
    rejected and replaced by a template (see [AI Safety](../architecture/11-ai-safety-and-evaluation.md)).
  - **NFR-24b (measured target):** qualitative faithfulness — no misleading framing, omitted
    caveats, or wrong causal claims — measured continuously against a labeled eval set;
    regressions block release. This is a target, not an absolute guarantee.
- **NFR-25** Preference-extraction accuracy measured continuously against a labeled eval set;
  regressions block release.

## 10. Cost efficiency
- **NFR-26** Provider calls per search bounded by a query-planning budget; cache-hit ratio
  tracked and targeted.
- **NFR-27** LLM kept out of the per-candidate scoring path (cost + latency + determinism).

## 11. Accessibility & i18n
- **NFR-28** WCAG 2.1 AA on the web client. **(Review §5: this is a legal requirement, not just a
  quality target.)** The **European Accessibility Act** (in force June 2025) makes accessibility
  mandatory for EU consumer digital services; WCAG 2.1 AA is the practical conformance bar. Treat
  as launch-gating for EU, verified in CI (axe) + manual audit (doc 17).
- **NFR-29** Architecture supports multi-currency, multi-language, multi-timezone from day one
  (even if UI ships English/one currency first).

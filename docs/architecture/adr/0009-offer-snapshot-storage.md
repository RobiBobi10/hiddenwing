# ADR-0009: Offer-snapshot storage for reproducible ranking

- **Status:** Accepted
- **Date:** 2026-07-22
- **Deciders:** Architecture / Data
- **Related:** [Database](../09-database-design.md), [Optimization](../12-flight-search-optimization.md), NFR-13, [CTO Review](../../Review/CTO_Review.md) §2/§4

## Context
NFR-13 promises deterministic, reproducible ranking "given the same inputs + profile version". The
review pointed out this is only true if we **snapshot the exact provider offer set** a ranking was
computed from — provider prices/availability change by the minute — and that snapshotting has a
real, previously-unbudgeted storage cost at millions of searches/day. The original DB doc implied
storing the full expanded candidate set in Postgres, which is expensive and high-volume.

## Options considered
1. **Store nothing; recompute on demand** — cheapest storage; but reproducibility is *impossible*
   (offers are gone), breaking NFR-13 and debuggability. Rejected.
2. **Store the full expanded candidate set (all trip_solutions + breakdowns) in Postgres** — fully
   queryable; but very high write/storage volume; expensive at scale.
3. **Store the minimal snapshot to reconstruct**: the normalized query, profile version, and the
   **raw/normalized provider offer payloads** in cheap object storage, keyed to the search, with
   short retention; recompute the ranking deterministically from the snapshot when needed.

## Decision
Persist a **minimal offer snapshot** (query + profile version + provider offer payloads) in
**object storage** with a short, class-based retention, plus lightweight search metadata in
Postgres. The deterministic engine can reconstruct any ranking from the snapshot; we do **not**
durably store every expanded candidate solution in the OLTP database.

## Rationale
This preserves reproducibility and debuggability (NFR-13) at a fraction of the storage cost, keeps
Postgres lean (helps the scaling story, doc 09), and cleanly bounds retention for GDPR (short-
lived, purgeable, crypto-shreddable — doc 16). Recompute-from-snapshot is cheap because scoring is
fast and deterministic (NFR-3).

## Consequences
- Positive: reproducibility without OLTP bloat; cheaper storage; GDPR-friendly retention.
- Negative / accepted: reconstructing a ranking requires a recompute step (fine — it's fast);
  snapshots must be retention-managed and count as personal data (they encode a user's query);
  caching-rights on stored provider payloads must be checked per provider (review §5, doc 13 §0).
- Follow-up: define snapshot retention per data class in doc 09/16; ensure snapshots are covered by
  erasure (crypto-shredding).

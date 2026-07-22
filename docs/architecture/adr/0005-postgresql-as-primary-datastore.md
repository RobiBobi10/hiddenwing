# ADR-0005: PostgreSQL as the primary datastore

- **Status:** Accepted
- **Date:** 2026-07-22
- **Deciders:** Architecture / Data
- **Related:** [Database Design](../09-database-design.md), NFR-12/13/17

## Context
We need a primary store for users, versioned preference profiles, consents, searches, trip
solutions, booking handoffs, and an append-only audit log. Requirements: strong integrity
(pricing/PII/audit), some schema flexibility (preference blobs), reproducibility, GDPR support,
and a path to scale toward millions of users.

## Options considered
1. **Document DB (MongoDB/DynamoDB) as primary** — flexible schema, easy horizontal scale; but
   weaker multi-record integrity and relational constraints for money/consents/audit; app-side
   invariants are error-prone.
2. **PostgreSQL** — ACID, relational integrity, strong constraints, **JSONB** for the flexible
   parts, mature scaling (replicas, partitioning, PgBouncer), rich ecosystem, easy GDPR erasure
   semantics.
3. **NewSQL (CockroachDB/Spanner)** — global scale + SQL; heavier/cost-lier than needed pre-scale.

## Decision
**PostgreSQL** is the primary OLTP store, using JSONB for flexible preference/breakdown fields.
Redis, OpenSearch, object storage, and an analytics warehouse are used alongside for their
specific jobs (polyglot persistence — doc 09).

## Rationale
Integrity for prices, consents, and the audit log matters more than schema fluidity, and JSONB
covers the flexible bits without giving up constraints. Postgres scales far enough (replicas +
partitioning) before sharding is needed, and its erasure/consent semantics fit GDPR. NewSQL's
global-scale benefits aren't worth the cost/complexity yet.

## Consequences
- Positive: strong integrity, reproducible rankings (versioned profiles), clean GDPR erasure,
  well-understood scaling and tooling.
- Negative / accepted: eventual sharding work if a single primary + replicas + partitioning is
  outgrown; must manage connection pooling under bursty load.
- Revisit trigger: write throughput or dataset size exceeds partition/replica headroom → evaluate
  sharding or NewSQL (new ADR).

# ADR-0001: Record architecture decisions as ADRs

- **Status:** Accepted
- **Date:** 2026-07-22
- **Deciders:** Architecture
- **Related:** [README](../../README.md), CLAUDE.md

## Context
CLAUDE.md requires that before writing code we "compare alternatives" and "explain trade-offs",
and that documentation is part of the product. Architecture prose captures *what* the system is
but tends to lose *why* a choice was made. As the team and system grow toward the scale target,
undocumented rationale leads to re-litigated decisions and accidental reversals.

## Options considered
1. **Rationale inline in architecture docs** — pro: one place; con: gets overwritten on edits,
   "why" erodes into "what".
2. **A wiki/Notion decision log** — pro: easy editing; con: drifts from the code, not
   version-controlled with the change.
3. **Architecture Decision Records in-repo (Nygard-style)** — pro: versioned with the code,
   immutable, reviewable in PRs, minimal ceremony; con: light process discipline required.

## Decision
Adopt in-repo **ADRs** under `docs/architecture/adr/`, numbered sequentially, using
[the template](0000-adr-template.md).

## Rationale
ADRs keep the decision, its alternatives, and its trade-offs next to the code, under review, and
immutable — exactly what CLAUDE.md's "compare alternatives / explain trade-offs" mandate needs.
They scale with the team and make onboarding faster.

## Consequences
- Positive: durable, reviewable decision history; fewer re-litigated debates.
- Negative: small per-decision authoring cost.
- Follow-up: every significant/irreversible choice (provider strategy, datastore, service
  boundaries, booking model, AI authority) gets an ADR before implementation.

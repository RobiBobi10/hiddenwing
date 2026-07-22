# 17 · Testing Strategy

_Status: Draft · Owner: Engineering · Last updated: 2026-07-22_

Testing enforces the correctness NFRs — above all "**wrong prices are Sev-1**" (NFR-12) and
"**ranking is deterministic**" (NFR-13). Coverage targets in NFR-21.

## 1. The test pyramid
```
        /\        E2E (few) — critical user journeys
       /  \       Contract — provider adapters & service APIs
      /    \      Integration — modules + DB/cache/queue
     /______\     Unit (many) — domain logic, TTV, validation
```

## 2. Unit tests (foundation)
- **Optimization Engine / TTV scoring: 100% coverage** (NFR-21) — it's pure and deterministic, so
  it's exhaustively testable. Property-based tests assert invariants (monotonicity: lower price at
  equal everything ⇒ higher TTV; hard constraints always eliminate; determinism: same input ⇒
  identical ranking).
- Comfort Score, risk model, query planner budgeting, input validation, entity normalization.
- Fast, no I/O; run on every commit.

## 3. Integration tests
- Modules against a real Postgres/Redis (test containers): profile versioning, audit-log
  append-only behavior, cache TTL, idempotency, rate limiting.
- Async search: job enqueue → workers → progressive aggregation.

## 4. Contract tests (critical for providers)
- Each provider adapter tested against the provider **sandbox** and recorded fixtures: request
  mapping, response normalization (baggage, fare rules, timezones), `price()` re-validation,
  health/cost model. Catches upstream breaking changes before users do (doc 13).
- Consumer-driven contracts between the core and the AI service, and for the partner API.

## 5. Pricing-integrity tests (highest priority)
- A dedicated suite asserting: cached prices are labeled; **no booking handoff without a live
  re-validation**; price-change → re-quote; every quote/re-validation/handoff hits the audit log.
- Fault injection: provider returns a changed/greater price at re-validation → user is re-quoted,
  never silently charged the old price. These map to NFR-12 and are release-gating.

## 6. AI evaluation (gate, not vibes)
Run the [AI eval harness](../architecture/11-ai-safety-and-evaluation.md) in CI:
- Preference-extraction accuracy vs. labeled set (regression blocks release, NFR-25).
- **Grounding/faithfulness: 0 fabricated facts** tolerated (hard gate, NFR-24).
- Prompt-injection/red-team set must not break grounding or leak PII.
- Golden NL→structured-query cases. Prompts/models don't ship without passing.

## 7. End-to-end tests
- A small set of critical journeys (Playwright): NL search → shortlist → explanation →
  re-validate → handoff; profile edit/export/delete (GDPR path); graceful degradation with a
  provider down.
- Run against a staging env with sandbox providers.

## 8. Non-functional testing
- **Performance/load**: search p95 ≤ 4 s and 10k-candidate scoring ≤ 500 ms verified under load;
  burst/soak tests for autoscaling (NFR-1/3/7).
- **Resilience/chaos**: kill a provider, a worker, a replica → graceful degradation holds
  (NFR-11).
- **Security**: SAST/DAST, dependency + IaC + secret scanning in CI; pen test before major
  launches (doc 15).
- **Accessibility**: automated axe checks + manual audits (WCAG 2.1 AA, NFR-28).

## 9. Test data & environments
- Deterministic fixtures for the optimization engine; recorded provider payloads (PII-scrubbed);
  **never real user PII** in test/staging.
- Ephemeral test containers for integration; seeded staging for E2E.

## 10. Quality gates (CI) — merge blocked unless
1. Unit + integration + contract tests pass; coverage thresholds met (100% on TTV scoring).
2. Pricing-integrity suite passes.
3. AI eval gates (grounding + accuracy) pass for any AI/prompt change.
4. Security scans clean (no high/critical).
5. Docs/ADRs updated for architecture changes (NFR-23).

## 11. Ownership
Each bounded context owns its tests; the pricing-integrity and AI-eval suites are owned centrally
given their cross-cutting, trust-critical nature.

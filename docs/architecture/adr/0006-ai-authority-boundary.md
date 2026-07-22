# ADR-0006: AI has no pricing, ranking, or booking authority

- **Status:** Accepted
- **Date:** 2026-07-22
- **Deciders:** Architecture / AI / Product
- **Related:** [AI Strategy](../10-ai-strategy.md), [AI Safety](../11-ai-safety-and-evaluation.md), [Optimization](../12-flight-search-optimization.md), NFR-12/13/24

## Context
CLAUDE.md: "AI should NOT replace deterministic systems where accuracy is required. Flight
pricing and availability must come from reliable data providers." LLMs are powerful for
understanding and explanation but are non-deterministic and can fabricate plausible facts —
including prices. A single displayed-wrong-price incident is existential for trust.

## Options considered
1. **LLM as the optimizer/ranker** — flexible, "smart"; but non-deterministic (breaks NFR-13),
   unexplainable/undebuggable, expensive/slow per candidate, and can hallucinate prices. Rejected.
2. **LLM assists ranking (re-orders / tweaks scores)** — still injects non-determinism and a
   fabrication surface into the decision path. Rejected.
3. **Hard boundary: AI only at intake (understanding) and output (explanation); deterministic
   engine owns pricing, scoring, ranking, and booking requires explicit user confirmation.**

## Decision
Establish a hard architectural boundary: the LLM **understands** (NL → validated structured
query + profile deltas) and **explains** (grounded, guardrail-checked). It holds **no authority**
to set prices, rank, mutate profiles silently, or book. Prices come from providers and are
live-re-validated; ranking is the deterministic Optimization Engine.

## Rationale
Determinism gives reproducibility, debuggability, speed, and cost control; grounding + guardrails
make a fabricated price structurally impossible to display. This directly implements CLAUDE.md's
accuracy mandate and protects the single most trust-critical property of the product.

## Consequences
- Positive: trustworthy prices, reproducible/explainable rankings, bounded AI cost/latency,
  clear failure isolation (AI outage ≠ core outage).
- Negative / accepted: AI can't "creatively" reorder results; nuance must be encoded as
  interpretable TTV terms, not delegated to the model.
- Enforcement: grounding guardrail + eval gate in CI (doc 11); displayed-wrong-price = Sev-1.
- Revisit trigger: a learned component may *feed* interpretable TTV weights later, but the
  scoring function stays deterministic and transparent (would need a new ADR to change).

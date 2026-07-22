# 23 · Experimentation & Analytics

_Status: Draft · Owner: Data / Product Eng · Last updated: 2026-07-22 · Added per [CTO Review](../Review/CTO_Review.md) §1_

The review's point: the plan says "tune TTV weights against feedback" but there was no
infrastructure to do so. **You cannot tune an optimizer you can't experiment on.** This is a
Month-0 platform primitive ([MVP Roadmap](../product/18-mvp-roadmap.md)), not a later add.

## 1. Why this is core, not peripheral
- The **Total Trip Value** model (doc 12) has weights (value-of-time, comfort, risk, preference
  fit) that must be *learned and validated*, not guessed once.
- The **north-star** is now measured via proxies + a **holdout control** (doc 01) — that requires
  an assignment/experiment framework to exist.
- Provider-cost and conversion trade-offs (business model §2a) need controlled experiments to
  optimize safely.

## 2. Capabilities required
| Capability | Purpose |
|---|---|
| **Deterministic assignment** | Stable bucketing of users/sessions into variants (feature flags + experiment keys) |
| **Holdout / control groups** | The optimizer-vs-literal-sort control that makes the north-star measurable (doc 01) |
| **Metric pipeline** | Reliable event capture → warehouse → experiment readouts (funnel, TTV proxies, provider cost, re-validation-failure rate) |
| **Guardrail metrics** | Auto-flag if a variant harms conversion, cost-per-search, or grounding (doc 21) |
| **Offline replay** | Re-score historical searches (from offer snapshots, [ADR-0009](../architecture/adr/0009-offer-snapshot-storage.md)) under a new TTV weighting *before* shipping it live |

## 3. How it plugs into the architecture
- **Feature flags** (already a deployment primitive, doc 20) carry experiment assignment; the
  same kill-switch mechanism gates risky variants.
- **Offer snapshots** (ADR-0009) enable **offline counterfactual evaluation**: replay a candidate
  TTV weighting over stored searches to estimate its effect cheaply before any live test — because
  scoring is deterministic and fast (NFR-3), this is practical.
- **Warehouse** (doc 09) is the analysis substrate; events are PII-scrubbed (doc 16).

## 4. Experimentation discipline
- Pre-registered hypothesis + primary metric + guardrails per experiment (no metric fishing).
- Minimum-detectable-effect / power thinking before launch; avoid peeking.
- Every TTV-weight change ships **behind an experiment**, validated offline first (§3), then
  online with guardrails.
- Results are logged and versioned alongside the TTV model version (reproducibility, NFR-13).

## 5. Analytics (product + business)
- **Funnel**: search → shortlist → handoff → (attributed) booking.
- **Value proxies**: TTV(recommended)−TTV(literal), TTV(chosen)−TTV(cheapest) (doc 01).
- **Cost**: provider-cost-per-search, LLM-$/search, cache-hit ratio (doc 21, business model).
- **Trust**: re-validation-failure rate, guardrail-rejection rate.
- Dashboards live alongside the observability set (doc 21); business analytics in the warehouse,
  operational metrics in the metrics stack.

## 6. Privacy
Experiment assignment and analytics use pseudonymous IDs; events are PII-free by design;
consented data only for anything tied to an identifiable user (doc 16). Experimentation must not
become a backdoor around consent or residency.

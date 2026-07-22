# 21 · Observability & SLOs

_Status: Draft · Owner: DevOps / SRE · Last updated: 2026-07-22_

You cannot operate at scale, or protect trust, without seeing the system. This doc defines the
three pillars, the SLOs that gate releases, and the business/AI metrics unique to FlightAI.

## 1. The three pillars
- **Metrics** — RED (Rate, Errors, Duration) per service/endpoint; USE (Utilization, Saturation,
  Errors) per resource. Time-series (Prometheus-style) + dashboards (Grafana-style).
- **Logs** — structured JSON, centralized, **correlation/trace ID on every line** (NFR-19),
  **no PII** (NFR-16, doc 16). Queryable (OpenSearch).
- **Traces** — distributed tracing (OpenTelemetry) across gateway → core → AI service → provider
  calls, so any slow/failed search is traceable end to end.

Everything is correlated by a single trace ID injected at the gateway and propagated outward,
including into provider requests.

## 2. Domain-specific metrics (what makes FlightAI observable)
| Metric | Why it matters |
|---|---|
| **Provider cost per search** & call volume | Dominant scaling cost; business-critical (NFR-20, GTM doc) |
| **Cache-hit ratio** (fare cache) | Directly drives provider cost & latency |
| **Search latency** p50/p95/p99 (sync & async first-result) | Core UX (NFR-1/2) |
| **Scoring time** for N candidates | Optimization health (NFR-3) |
| **LLM tokens/$ & latency per call** | AI cost/latency discipline (NFR-27) |
| **Guardrail rejection rate** | AI drift / grounding health (doc 11) |
| **Live re-validation price-change rate** | Pricing integrity + UX friction (NFR-12) |
| **North-star: TTV(recommended) − TTV(literal query)** | Product value (Vision doc) |
| **Provider health** (latency/error/rate-limit per provider) | Failover decisions (doc 13) |
| Funnel: search → shortlist → handoff | Growth/PMF (GTM doc) |

## 3. SLOs & error budgets
| SLO | Target | Window | Budget |
|---|---|---|---|
| Core search availability | 99.9% | 30 days | ~43 min |
| Booking-handoff availability | 99.95% | 30 days | ~22 min |
| Search latency p95 ≤ 4 s | 99% of searches | 30 days | 1% |
| **Displayed-price correctness** | **100%** (any breach = Sev-1) | always | 0 |
| AI grounding (no fabricated facts shown) | 100% | always | 0 |

Error budgets gate releases (doc 20): burn the budget → freeze feature rollout, prioritize
reliability. The two 100% SLOs are hard — they define the product's trust.

## 4. Alerting
- **Symptom-based, SLO-driven** alerts (page on user-facing pain, not every CPU blip).
- Multi-window burn-rate alerts on the SLOs above.
- **Sev-1 pages**: any displayed-wrong-price signal, AI grounding breach, PII-leak signal,
  booking-path outage.
- Cost alerts: provider-cost-per-search or LLM-cost drift beyond threshold (protects economics).
- Every alert links to a runbook; on-call rotation with clear escalation.

## 5. Dashboards
- **Service health** (RED/USE), **search funnel + north-star**, **provider health & cost**,
  **AI quality & cost**, **SLO/error-budget** status. Operator dashboard includes manual provider
  failover (FR-29).

## 6. Incident management
- Severity definitions (Sev-1 = trust/revenue: wrong price, PII leak, booking outage).
- On-call, runbooks, and blameless post-mortems feeding action items back into tests (doc 17) and
  ADRs.
- The immutable audit log (doc 09) is the source of truth for any price/booking investigation.

## 7. Privacy in observability
Telemetry is PII-free by design: scrub before logging, aggregate the north-star and funnels, and
keep AI request logs minimized and retention-limited (doc 16). Observability must never become a
backdoor around GDPR.

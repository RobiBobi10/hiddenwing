# Risk Register

_Status: Living document · Owner: Founders / Architecture · Last updated: 2026-07-22_

Consolidates every material risk from the [CTO Review](CTO_Review.md) into one tracked table so
they don't get lost in prose. **Severity**: 🔴 existential · 🟠 high · 🟡 medium. **Status**: Open ·
Mitigating · Accepted · Closed. Review at each phase gate.

## P0 — existential (resolve before build commitment)

| ID | Risk | Sev | Mitigation | Owner | Status |
|----|------|-----|------------|-------|--------|
| R1 | **Inventory access on viable terms** — provider accreditation, volume commitments, deposits; seller-of-record requirements; chicken-and-egg | 🔴 | [Provider Due-Diligence Spike](provider-due-diligence-spike.md); [ADR-0002](../architecture/adr/0002-multi-provider-adapter-strategy.md) | Founders | Open |
| R2 | **Negative per-search unit economics** — pay provider+LLM cost on every search, earn only on booked trips, at a fan-out multiple | 🔴 | Unit-economics model (business model §2a); native-flexible search ([ADR-0007](../architecture/adr/0007-native-flexible-search.md)); cost-aware query planning | Founders + Arch | Open |
| R3 | **Fare caching/display may violate provider ToS + bait-pricing law** | 🟠 | Legal memo (spike §6); caching only within contractual rights; live re-validation (NFR-12) | Legal + Arch | Open |
| R4 | **Affiliate booking model may not be supported** (e.g. Duffel seller-of-record) | 🟠 | Spike gates [ADR-0003](../architecture/adr/0003-affiliate-first-booking-model.md); supersede with agent-of-record if needed | Founders | Open (ADR blocked) |
| R22 | **Amadeus self-service portal decommissioned mid-2026** — easy low-cost on-ramp gone; new access needs Enterprise/Quick Connect contract or alt GDS | 🟠 | Lead with Duffel (API-first); decide GDS via [due-diligence spike](provider-due-diligence-spike.md); [Tech Stack §8](../architecture/24-technology-stack-decisions.md) | Founders + Arch | Open |

## P1 — high (resolve before public launch)

| ID | Risk | Sev | Mitigation | Owner | Status |
|----|------|-----|------------|-------|--------|
| R5 | **Sub-4s live multi-provider search unrealistic** | 🟠 | Async-first, first-meaningful-result SLO ([ADR-0008](../architecture/adr/0008-async-first-search.md), NFR-1) | Arch | Mitigating |
| R6 | **High re-validation-failure rate** ("price changed" as default UX) erodes trust | 🟠 | Instrument as launch-gating metric (doc 21); re-quote UX (FR-21); tune caching if high | Arch | Mitigating |
| R7 | **EU free-text PII sent to LLM** — stripping infeasible; transfer risk | 🟠 | EU-region no-retention endpoint mandatory; DPIA; minimize structured PII (doc 16) | Security | Mitigating |
| R8 | **Cold-start weak moat** — new users get bare price-sort | 🟠 | Cold-start onboarding (FR-12a, US-E0) | Product | Mitigating |
| R9 | **Reproducibility needs paid-for offer snapshots** (unbudgeted storage) | 🟡 | Minimal-snapshot strategy ([ADR-0009](../architecture/adr/0009-offer-snapshot-storage.md)) | Data | Mitigating |
| R10 | **No experimentation infra** to tune TTV | 🟠 | Month-0 experimentation primitive ([doc 23](../operations/23-experimentation-and-analytics.md)) | Data | Mitigating |
| R11 | **Cross-provider de-duplication is hard** (fare basis, classes) | 🟡 | Contract tests + real design investment (doc 13, doc 17) | Arch | Open |
| R12 | **Affiliate open-redirect / click fraud / savings-claim exposure** | 🟠 | Signed allow-listed handoff, attribution signing, substantiable claims ([Security §9](../security/15-security-architecture.md), FR-22a) | Security | Mitigating |
| R13 | **Audit-immutability vs. GDPR erasure** conflict | 🟡 | Per-subject crypto-shredding keys (doc 16, doc 09) | Security | Mitigating |
| R14 | **Split-ticket traveler-borne risk / liability** | 🟡 | Explicit disclosure at point of choice, or exclude from MVP (FR §10, doc 12 §5) | Product | Open |
| R15 | **Accessibility is a legal requirement (EAA), not a target** | 🟡 | WCAG 2.1 AA launch-gating, CI + manual audit (NFR-28, doc 17) | Frontend | Mitigating |

## P2 — strategic (decide early, execute later)

| ID | Risk | Sev | Mitigation | Owner | Status |
|----|------|-----|------------|-------|--------|
| R16 | **Thin differentiation vs. free Google Flights** | 🟠 | Narrow wedge / value+memory+explanation positioning ([doc 22](../product/22-competitive-analysis.md)) | Product | Open |
| R17 | **Subscription willingness-to-pay unproven** | 🟠 | Wizard-of-Oz validation (roadmap Month -1); B2B hedge | Founders | Open |
| R18 | **SEO/content wedge slower & contested in 2026** | 🟡 | Treat as one channel; B2B + product-led loops (GTM) | Product | Open |
| R19 | **B2B may be the real business but is under-prioritized** | 🟠 | Parallel design-partner track ([ADR-0010](../architecture/adr/0010-b2b-track-in-parallel.md)) | Founders | Open |
| R20 | **Award-travel base named but under-served** | 🟡 | Pull a narrow points feature forward or drop the targeting (GTM) | Product | Open |
| R21 | **Async fan-out queue "Kafka later" migration under load** | 🟡 | Decide durability/throughput reqs up front (review §4, ADR-0004) | Arch | Open |

## Phase-gate review
This register is reviewed at each phase gate (Month -1 due-diligence gate, pre-beta, pre-launch).
A risk moves to **Accepted** only with an explicit, documented decision; **Closed** only with
evidence. New risks discovered during build are appended here, not scattered.

# Hiddenwing Documentation

> The single source of truth for Hiddenwing — an AI-powered travel **optimization** platform.
> This is not a flight search engine. It finds the *optimal travel solution* for a traveler
> across price, dates, flexibility, airports, duration, stops, airlines, baggage, comfort,
> personal preferences, and total trip value.

## 🚦 Two tracks — read this first

This documentation now describes **two versions of the same product**:

1. **🏠 [Family Edition](FAMILY-EDITION.md) — the ACTIVE plan we're building first.** The full
   product for **2–10 people (family & friends)**, at **≈ $0–15/month** and near-zero ops. Maximum
   quality, minimum spend. **Start here.**
2. **🌍 Scale Edition — the North Star we grow into.** Everything else in `/docs` is the
   "world-class platform serving millions" design. We keep it intact because the Family Edition is
   built on the *same technologies*, so scaling up later is **adding pieces, not rewriting.**

If you're just starting, read **[FAMILY-EDITION.md](FAMILY-EDITION.md)** and treat the rest as the
reference/growth plan.

## How this documentation is organized

Docs are grouped by audience and rate-of-change. Read top to bottom within a group.

### `product/` — what we are building and why
| # | Doc | Purpose |
|---|-----|---------|
| 01 | [Product Vision](product/01-product-vision.md) | The mission, the wedge, the north-star metric |
| 02 | [Business Model & Go-To-Market](product/02-business-model-gtm.md) | How we make money and acquire users |
| 03 | [Functional Requirements](product/03-functional-requirements.md) | What the system must do |
| 04 | [Non-Functional Requirements](product/04-non-functional-requirements.md) | How well it must do it |
| 05 | [User Stories](product/05-user-stories.md) | Requirements as user-centric narratives |
| 22 | [Competitive Analysis](product/22-competitive-analysis.md) | Honest positioning vs. incumbents; where we win/lose |
| 18 | [MVP Roadmap](product/18-mvp-roadmap.md) | The first 6 months |
| 19 | [Future Roadmap](product/19-future-roadmap.md) | 6–36 months |

### `architecture/` — how it is built
| # | Doc | Purpose |
|---|-----|---------|
| 06 | [System Architecture](architecture/06-system-architecture.md) | The whole system, end to end |
| 07 | [Backend Architecture](architecture/07-backend-architecture.md) | Services, boundaries, data flow |
| 08 | [Frontend Architecture](architecture/08-frontend-architecture.md) | Web/app client architecture |
| 09 | [Database Design](architecture/09-database-design.md) | Data stores, schemas, partitioning |
| 10 | [AI Strategy](architecture/10-ai-strategy.md) | Where and how AI is used |
| 11 | [AI Safety & Evaluation](architecture/11-ai-safety-and-evaluation.md) | Grounding, guardrails, evals |
| 12 | [Flight Search Optimization](architecture/12-flight-search-optimization.md) | The core optimization engine |
| 13 | [Data Providers](architecture/13-data-providers.md) | GDS/aggregator sourcing & fallback |
| 14 | [API Strategy](architecture/14-api-strategy.md) | Internal & external API design |
| 24 | [Technology Stack Decisions](architecture/24-technology-stack-decisions.md) | Final stack: framework/DB/cloud/AI/auth/payments/etc. with trade-offs |
| — | [Architecture Decision Records](architecture/adr/) | Immutable log of key decisions |

### `security/` — trust and compliance
| # | Doc | Purpose |
|---|-----|---------|
| 15 | [Security Architecture](security/15-security-architecture.md) | OWASP, authn/authz, encryption, secrets |
| 16 | [GDPR & Privacy](security/16-gdpr-and-privacy.md) | Lawful basis, data rights, DPIA |

### `operations/` — running it
| # | Doc | Purpose |
|---|-----|---------|
| 17 | [Testing Strategy](operations/17-testing-strategy.md) | The test pyramid and quality gates |
| 20 | [Deployment Strategy](operations/20-deployment-strategy.md) | CI/CD, environments, IaC, rollout |
| 21 | [Observability & SLOs](operations/21-observability-and-slos.md) | Metrics, logs, traces, error budgets |
| 23 | [Experimentation & Analytics](operations/23-experimentation-and-analytics.md) | A/B framework for TTV tuning; metric pipeline |

### `Review/` — critical review & resulting actions
| Doc | Purpose |
|-----|---------|
| [CTO Review](Review/CTO_Review.md) | Adversarial review of the whole blueprint; prioritized recommendations |
| [Provider Due-Diligence Spike](Review/provider-due-diligence-spike.md) | P0 pre-build investigation: inventory access, cost, legal, go/no-go |
| [Risk Register](Review/risk-register.md) | Living, tracked table of all material risks (severity, owner, status) |
| [Cost Model](Review/cost-model.md) | Every cost, at-start vs. scaling, with startup-credit offsets |
| Cost Model spreadsheet | `Review/Hiddenwing-Cost-Model.xlsx` — interactive; change the blue assumptions |

### `implementation/` — the build plan (Family Edition)
| Doc | Purpose |
|-----|---------|
| [Development Roadmap](implementation/development-roadmap.md) | All six milestones (M1–M6), built one at a time |
| [Milestone 1 — Foundations](implementation/milestone-1-foundations.md) | The current milestone, detailed and ready to build |

### Reference
- [Glossary](glossary.md) — canonical definitions (Total Trip Value, Flexibility, Comfort Score, etc.)

## Changelog
- **2026-07-22 (e)** — **Blueprint approved; implementation planning started.** Added the
  [Development Roadmap](implementation/development-roadmap.md) (six milestones for the Family
  Edition) and fully detailed [Milestone 1 — Foundations](implementation/milestone-1-foundations.md).
  Future milestones are intentionally left as objectives until reached.
- **2026-07-22 (d)** — **Family-first reframe.** Added [FAMILY-EDITION.md](FAMILY-EDITION.md) as
  the active plan: the full product for 2–10 people at ≈ $0–15/month, built on the same tech as the
  Scale Edition so growth is additive. Added a Family Edition column to the [stack](architecture/24-technology-stack-decisions.md)
  and a Family section to the [cost model](Review/cost-model.md) + spreadsheet; noted the
  family-first starting point in the vision and roadmap. The rest of `/docs` remains the Scale
  Edition North Star.
- **2026-07-22 (c)** — Final technical architecture: added [Technology Stack Decisions](architecture/24-technology-stack-decisions.md)
  (13 categories, each with why/alternatives/disadvantages, grounded in current 2026 pricing) and
  a full [Cost Model](Review/cost-model.md) + interactive spreadsheet (`Review/Hiddenwing-Cost-Model.xlsx`).
  Noted the mid-2026 **Amadeus self-service decommission** (doc 13, risk R22). Key stack picks:
  Next.js · NestJS+FastAPI · PostgreSQL · Valkey · SQS+Valkey Streams · AWS (Fargate→EKS) · Claude
  on Bedrock · Duffel+GDS · Clerk→Ory · Stripe · Grafana Cloud · GitHub Actions.
- **2026-07-22 (b)** — Production-quality pass, applying the remaining [CTO Review](Review/CTO_Review.md)
  findings: added missing features — cold-start onboarding (FR-12a, US-E0), disruption/IROPS
  detection (FR-25a, US-F2), fraud-safe attributed handoff (FR-22a); made scope limits explicit
  (group travel, split-ticket liability); hardened security (signed allow-listed redirect, click
  fraud, savings-claim substantiation); added a Month-1 validation gate (due-diligence +
  Wizard-of-Oz) and experimentation/cold-start/support to the MVP roadmap; reconciled the
  award-travel wedge (doc 02); added **Competitive Analysis** (doc 22), **Experimentation &
  Analytics** (doc 23), and a consolidated **[Risk Register](Review/risk-register.md)**.
- **2026-07-22 (a)** — Applied first tranche of [CTO Review](Review/CTO_Review.md) revisions:
  re-baselined latency (async-first, NFR-1) and grounding (NFR-24a/b) NFRs; replaced the
  unobservable north-star with observable proxies (doc 01); added per-search unit-economics +
  elevated B2B (doc 02); added provider commercial due-diligence + native-flexible-search strategy
  (doc 13); strengthened EU-PII-to-LLM and crypto-shredding controls + elevated EAA to legal
  (docs 16, 04); gated ADR-0003 on due-diligence; added ADR-0007 (native flexible search), 0008
  (async-first), 0009 (offer-snapshot storage), 0010 (parallel B2B track); added the Provider
  Due-Diligence Spike.

## Reading paths
- **New engineer:** Vision → System Architecture → Backend → Database → ADRs.
- **New PM:** Vision → Business Model → Functional Requirements → User Stories → Roadmaps.
- **Security review:** Security Architecture → GDPR → Data Providers → API Strategy.
- **Investor / exec:** Vision → Business Model → MVP Roadmap → Future Roadmap.

## Documentation rules
1. **Docs are part of the product.** Any architecture change updates the relevant doc in the same PR.
2. **Decisions live in ADRs.** If you chose X over Y, write an ADR — don't bury the "why" in prose.
3. **One canonical definition.** New domain terms go in the [Glossary](glossary.md); don't redefine locally.
4. **Status headers.** Each doc carries a status: `Draft` · `Reviewed` · `Approved`.

---
_Status: Draft · Owner: Architecture · Last updated: 2026-07-22_

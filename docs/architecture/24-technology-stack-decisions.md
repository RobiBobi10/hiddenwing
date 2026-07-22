# 24 · Final Technology Stack Decisions

_Status: Draft (decisions final, pending provider due-diligence) · Owner: Architecture · Last updated: 2026-07-22_

The definitive stack. Each decision states **what we chose, why, alternatives considered, and the
disadvantages we accept.** Where a decision already has an ADR, it's linked. Costs for each are
modeled in the [Cost Model](../Review/cost-model.md) and the accompanying spreadsheet.

> **Two editions.** This doc is the **Scale Edition** (world-class, millions of users). We are
> building the **[Family Edition](../FAMILY-EDITION.md) first** — the same product for 2–10 people
> at ≈ $0–15/month, using the *same technology families* so growth is additive. The "Family
> Edition (now)" column in the summary table below shows the minimal-cost starting point for each
> choice; the full sections describe where each grows to.

> **Guiding bias:** at pre-PMF stage, prefer **managed services + generous free tiers + startup
> credits** over self-hosting, and keep a documented migration path for the few places where
> per-usage pricing becomes painful at scale. Minimize ops for a small team; don't pay for scale
> we don't have yet.

---

## 1. Frontend framework — **Next.js (React, TypeScript)**

- **Why:** SSR/SSG/ISR for the SEO content wedge (doc 08, GTM), streaming UI for async-first
  progressive results ([ADR-0008](adr/0008-async-first-search.md)), one TypeScript language across
  front and back, huge ecosystem and hiring pool.
- **Alternatives considered:** Remix (great data-loading model, smaller ecosystem); SvelteKit
  (leaner/faster, much smaller talent pool); Nuxt/Vue (fine, but splits us off React); plain React
  SPA (no SSR → bad for SEO — disqualifying given the content strategy).
- **Disadvantages accepted:** React/Next churn and complexity; SSR adds hosting cost and cold-path
  latency; a pull toward Vercel-specific features. Mitigation: keep to framework-standard APIs so
  we can self-host.
- **Hosting:** **Vercel** for MVP (best DX, generous tier), with a documented path to self-host on
  AWS (OpenNext/SST) if egress/seat cost dominates at scale.

## 2. Backend framework — **NestJS (TypeScript) core + FastAPI (Python) for AI**

- **Why:** NestJS gives typed, modular, DI-friendly structure that maps cleanly onto our
  bounded-context clean architecture (doc 07); TypeScript shares models/validation with the
  frontend. FastAPI is the right home for the AI service — it lives in the Python ML/LLM/eval
  ecosystem (docs 10–11). Two services, two runtimes, by design.
- **Alternatives considered:** Express/Fastify alone (less structure — we'd rebuild NestJS's
  conventions); Django/DRF (batteries-included but Python for the whole core loses FE type-sharing
  and is heavier for our I/O-bound fan-out); Go (excellent concurrency/perf for the fan-out, but
  slower to build in and smaller shared-language benefit); Spring Boot (mature, heavyweight, JVM
  ops).
- **Disadvantages accepted:** NestJS is opinionated/heavier than bare Node; Node is weaker for
  CPU-bound work (the deterministic optimization engine is the risk — mitigated by keeping it a
  pure module extractable to **Rust** if profiling demands, doc 12/ [ADR-0004](adr/0004-modular-monolith-first.md));
  running two languages means two toolchains/CI paths.

## 3. Database — **PostgreSQL (Amazon RDS; Aurora at scale)** · [ADR-0005](adr/0005-postgresql-as-primary-datastore.md)

- **Why:** ACID integrity for prices/consents/audit, JSONB for flexible preference blobs,
  reproducible-ranking support via versioned rows, mature scaling (replicas, partitioning), clean
  GDPR erasure. Managed via **RDS for PostgreSQL** (predictable cost) with a path to **Aurora
  Serverless v2** when bursty autoscaling is worth the premium.
- **Alternatives considered:** MySQL/MariaDB (weaker JSON + extensions); MongoDB/DynamoDB (schema
  flexibility but weaker multi-record integrity for money/audit — rejected as *primary*);
  CockroachDB/Spanner (global SQL scale we don't need yet, higher cost/complexity).
- **Disadvantages accepted:** single-writer vertical ceiling; sharding is real work if we outgrow
  replicas+partitioning (deferred, with trigger in ADR-0005); Aurora is AWS-lock-in if we adopt it.

## 4. Caching — **Valkey (Redis-compatible) via Amazon ElastiCache**

- **Why:** Sub-ms fare cache, rate-limit token buckets, idempotency keys, low-latency progressive
  result fan-in (doc 07/09). We choose **Valkey** — the open-source, Linux-Foundation fork of
  Redis — to **avoid Redis's 2024 license change (RSALv2/SSPL)** while keeping full API
  compatibility. Managed by ElastiCache (also offers a Valkey engine at lower cost than the Redis
  engine).
- **Alternatives considered:** Redis (same API, but restrictive license + higher managed cost);
  Memcached (no data structures/streams/persistence — too limited); DragonflyDB/KeyDB (promising,
  smaller ecosystem/managed support).
- **Disadvantages accepted:** in-memory = RAM cost; single-threaded hot-key contention (mitigated
  by key design/sharding); cache invalidation complexity; Valkey is younger than Redis (but
  API-identical and backed by AWS/Google/Linux Foundation).

## 5. Queue system — **Amazon SQS (durable jobs) + Valkey Streams (progressive fan-in); Kafka/MSK deferred**

- **Why:** Async-first search ([ADR-0008](adr/0008-async-first-search.md)) makes the queue the
  scaling crux. The review (§4) rejected the "Redis now, Kafka later" hand-wave. Decision:
  dispatch search **jobs** on **SQS** — durable, serverless, no ops, effectively free at MVP
  volume — and use **Valkey Streams** for the low-latency streaming of partial results back to the
  client. This gives durability where it matters (jobs) and speed where it matters (result
  streaming), with no cluster to run.
- **Alternatives considered:** Redis/Valkey Streams for everything (simplest, but weaker
  durability/replay for jobs); RabbitMQ (rich routing, but a broker to operate); Kafka/MSK or
  Confluent (best throughput/replay — but heavy and expensive before we need event streaming);
  Google Pub/Sub / NATS (fine, but off our AWS-primary path).
- **Disadvantages accepted:** SQS FIFO throughput caps and at-least-once semantics (need
  idempotency — already required); two mechanisms to reason about; a future migration to Kafka
  **if** event-sourcing/replay/high-throughput streaming becomes core (trigger documented, not
  hand-waved).

## 6. Cloud provider — **AWS** (ECS Fargate for MVP → EKS at scale)

- **Why:** Breadth and maturity of managed services (RDS, ElastiCache, SQS, Bedrock), strong
  startup credits (**AWS Activate**, incl. a GenAI track), and travel-industry credibility.
  **Compute: ECS Fargate at MVP** to minimize ops for a small team (no cluster to manage), with a
  documented move to **EKS (Kubernetes)** when we need finer control/scale — this refines the
  earlier docs 06/20 which named Kubernetes up front.
- **Alternatives considered:** **GCP** (very close second — GKE Autopilot is lovely, BigQuery is a
  great warehouse, strong AI; slightly thinner enterprise-travel presence); Azure (fine, weaker
  fit for us); PaaS like **Render/Fly.io** (great DX, lowest ops — a legitimate MVP option, but
  less headroom for the scale target and fewer managed data services); Cloudflare (superb
  edge/egress economics, but not a full app platform for our stateful core).
- **Disadvantages accepted:** AWS cost complexity and **egress fees**; real lock-in as we adopt
  RDS/ElastiCache/SQS/Bedrock; ops burden higher than a PaaS (mitigated by starting on Fargate +
  Terraform).

## 7. AI providers — **Anthropic Claude via Amazon Bedrock** (Sonnet 5 for quality, Haiku 4.5 for volume), behind an `LlmClient` abstraction · [ADR-0006](adr/0006-ai-authority-boundary.md)

- **Why:** Strong quality for intake/explanation; **accessing Claude through Amazon Bedrock** gives
  (a) **EU data residency** for GDPR (doc 16, review §5), (b) unified AWS billing, and (c)
  eligibility for **AWS Activate GenAI credits**. Tier the models: **Haiku 4.5** ($1/$5 per M
  tokens) for high-volume, low-complexity tasks (entity normalization, classification); **Sonnet
  5** ($3/$15; intro $2/$10 through Aug 2026) for nuanced planning/explanation. Prompt caching
  (−90% cached input) and batch (−50%) cut cost further (doc 10, NFR-27). All behind an
  `LlmClient` port so we can route/fallback.
- **Alternatives considered:** **OpenAI GPT** and **Google Gemini** (strong; kept as
  fallback/routing options behind the port — avoids single-vendor risk); self-hosted open models
  (**Llama/Mistral**) — deferred; only worth it if cost/latency at scale justify the ops and
  eval burden.
- **Disadvantages accepted:** per-token cost scales with usage (bounded by keeping the LLM at the
  edges, not in per-candidate scoring, NFR-27); vendor dependency (mitigated by the abstraction);
  Bedrock model availability can lag direct-Anthropic by a little; rate limits to manage.

## 8. Flight data (API) providers — **Duffel primary + a GDS (Enterprise) + Kiwi/Tequila**, all behind `ProviderPort` · [ADR-0002](adr/0002-multi-provider-adapter-strategy.md) · **pending [due-diligence](../Review/provider-due-diligence-spike.md)**

- **Why:** **Duffel** is modern, API-first, NDC-rich, with transparent per-use pricing (~$3 per
  confirmed order, +1% managed content, $1/ancillary, and a search-fee only past a 1,500:1
  search-to-book ratio) — a good fit to start. Add a **GDS for coverage** and **Kiwi/Tequila** for
  flexible/affiliate search. All sit behind the provider adapter so the mix can change.
- **⚠ Current-events caveat (2026):** **Amadeus is decommissioning its Self-Service developer
  portal, with existing self-service keys disabled mid-2026.** New integrations must go via Amadeus
  **Enterprise/Quick Connect** (contract, likely minimums) — or an alternative GDS
  (**Travelport**, **Sabre**). This *raises* the importance of the
  [due-diligence spike](../Review/provider-due-diligence-spike.md) (risk R1/R22) and may reshape
  the GDS choice.
- **Alternatives considered:** Amadeus Self-Service (was the easy on-ramp — now being retired);
  Sabre/Travelport (full GDS, heavier contracts); airline **NDC direct** (richest content, but one
  integration per airline — not an MVP path); scraping (rejected — brittle, ToS/legal risk).
- **Disadvantages accepted:** per-provider commercial terms, latency, and caching-rights differ
  (the adapter can't fix commercials — review §7); booking-model fit (affiliate vs. seller-of-
  record) must be validated per provider and may force [ADR-0003](adr/0003-affiliate-first-booking-model.md)
  to be superseded; **this is the biggest external dependency and cost driver.**

## 9. Authentication — **Clerk for MVP → Ory (self-hosted) at scale**

- **Why:** Clerk gives secure-by-default auth (OIDC, social, MFA, session management) with
  excellent DX and a **free tier up to 50,000 monthly retained users** (raised Feb 2026) — we pay
  nothing until real scale. It lets us *not* roll our own auth (an OWASP-A07 risk to avoid, doc 15).
- **Alternatives considered:** **Auth0** (mature, but per-MAU cost climbs fast); **AWS Cognito**
  (cheap, AWS-native, clunky DX); **Supabase Auth** (good value, ties to Supabase); **Ory
  Kratos/Hydra** or **Keycloak** (open-source, no per-user fee, but you operate them).
- **Disadvantages accepted:** per-retained-user pricing beyond the free tier (~$1,025/mo at ~100k
  users) and vendor lock-in; migrating auth later is sensitive work. Mitigation: plan the **Ory
  self-host migration** as the cost-control trigger at scale, and keep user identity in our own
  Postgres as the source of truth.

## 10. Payment system — **MVP: none (affiliate handoff, no PCI) → Subscriptions: Stripe Billing** (Paddle as MoR alternative)

- **Why:** MVP books via **affiliate handoff** ([ADR-0003](adr/0003-affiliate-first-booking-model.md)),
  so **we process no card payments and stay out of PCI scope** — a deliberate cost/risk avoidance.
  For **Hiddenwing Plus subscriptions** (Phase 2), **Stripe** is the default: best-in-class API,
  Billing (0.7% of billing volume) on top of 2.9% + 30¢ card fees, plus Stripe Tax (0.5%) for VAT.
- **Alternatives considered:** **Paddle / Lemon Squeezy** (Merchant-of-Record — they handle global
  sales tax/VAT and remittance for a higher cut; **strongly worth it** to offload EU VAT
  complexity — flagged as the likely better choice for a global consumer subscription); Braintree;
  Adyen (enterprise-scale, heavier).
- **Disadvantages accepted:** Stripe leaves **tax compliance to us** (mitigated by Stripe Tax or by
  choosing an MoR); effective take-rate rises once Billing+Tax+international+dispute fees stack
  (~4–8%+); no payment cost at all until subscriptions launch (so **$0 at MVP**).

## 11. Monitoring — **Grafana Cloud** (OpenTelemetry-native)

- **Why:** OTel-native metrics/traces matching our observability design (doc 21: RED/USE,
  correlation IDs), a **genuinely usable free tier** (10k active series, 50 GB logs/traces/profiles,
  3 users), and roughly **~50% cheaper than Datadog** at comparable usage. Open standards mean low
  lock-in.
- **Alternatives considered:** **Datadog** (best-in-class UX and breadth, but cost balloons —
  per-host + per-GB); **New Relic** (usage-based, decent free tier); **self-hosted
  Prometheus+Grafana+Tempo** (no license cost, but ops burden we don't want pre-scale); SigNoz
  (open-source APM, smaller ecosystem).
- **Disadvantages accepted:** Grafana's per-series/per-GB model requires cardinality discipline;
  more setup than Datadog's turnkey experience; usage cost still grows with scale.

## 12. Logging — **Grafana Cloud Loki + Sentry (errors)**; OpenSearch deferred

- **Why:** Structured JSON logs → **Loki** (same Grafana platform, correlated with metrics/traces
  by trace ID, doc 21), and **Sentry** for exception tracking/alerting (great DX, free/dev tier).
  We **defer OpenSearch** at MVP (originally in the data layer) to save cost/ops — Postgres
  full-text search covers early result/log search — and add it only when analytics/search volume
  justifies it.
- **Alternatives considered:** ELK/OpenSearch stack from day one (powerful, but costly to run for
  logs alone); Datadog Logs (bundled but pricey); CloudWatch Logs (AWS-native, workable, weaker
  querying/UX).
- **Disadvantages accepted:** Loki's label-based model is less flexible than full-text log search;
  log/trace retention has a cost; two tools (Loki + Sentry) to wire up. PII must be scrubbed before
  logging (NFR-16, doc 16).

## 13. CI/CD — **GitHub Actions + Terraform → ECR → ECS Fargate** (ArgoCD/GitOps at EKS scale)

- **Why:** GitHub Actions is integrated with our repo, has a large action ecosystem and a generous
  free-minutes tier, and runs the full quality gate (unit/integration/contract/pricing-integrity/
  **AI-eval**/security scans — doc 17/20). **Terraform** provisions everything (doc 20); images are
  built, **signed**, pushed to **ECR**, and deployed to **Fargate** with canary rollout.
- **Alternatives considered:** GitLab CI (great if we were on GitLab); CircleCI/Buildkite (strong,
  but another vendor); Jenkins (powerful, high maintenance — rejected); for CD at EKS scale,
  **ArgoCD** (GitOps) is the intended upgrade.
- **Disadvantages accepted:** Actions minutes get costly for heavy pipelines (mitigated by
  self-hosted runners for the expensive AI-eval/load jobs); careful secrets hygiene required (doc
  15); GitOps/ArgoCD deferred until EKS.

---

## Stack at a glance

| Category | 🏠 Family Edition (now, ~$0) | Scale MVP choice | At full scale | Primary reason |
|---|---|---|---|---|
| Frontend | Next.js on Vercel (free) | Next.js on Vercel | Next.js self-host (AWS) | SEO + streaming + TS everywhere |
| Backend | **one Next.js app** (API routes) | NestJS (TS) + FastAPI (Py) | same, extract services | Clean architecture + AI ecosystem |
| Database | **Neon/Supabase** Postgres (free) | RDS PostgreSQL | Aurora / partition / shard | Integrity + JSONB + GDPR |
| Caching | **none** (Postgres/in-memory) | ElastiCache **Valkey** | Valkey cluster | Speed, open-source license |
| Queue | **none** (synchronous) | **SQS** + Valkey Streams | + Kafka/MSK if needed | Durable jobs, no ops |
| Cloud | **Vercel + Neon** (no ops) | AWS + **Fargate** | AWS + **EKS** | Managed breadth + credits |
| AI | **Claude API direct** (Haiku/Sonnet) | **Claude via Bedrock** | + routing/fallback | Quality + EU residency + credits |
| Flight APIs | **Duffel** (one provider) | Duffel + GDS + Kiwi | multi-provider mesh | Modern API + coverage |
| Auth | **Clerk** free tier | **Clerk** | **Ory** self-host | Secure-by-default, free early |
| Payments | **none** | none (affiliate) → **Stripe** | Stripe / Paddle MoR | No PCI at MVP |
| Monitoring | **Sentry** free | **Grafana Cloud** | Grafana Cloud | OTel-native, ~½ Datadog cost |
| Logging | Sentry + console | **Loki + Sentry** | + OpenSearch | Cheap, correlated |
| CI/CD | **GitHub Actions** → Vercel | GitHub Actions + Terraform | + ArgoCD | Integrated, full gate |

_The Family Edition column is the plan we're building first — see [FAMILY-EDITION.md](../FAMILY-EDITION.md).
It uses the same technology families as the Scale columns, so scaling up is additive, not a rewrite._

**Cross-cutting theme:** every MVP choice is either free-tier, credit-covered, or usage-priced at
near-zero early volume; the two costs that *scale with usage from day one* are **flight-provider
calls** and **LLM tokens** — exactly the variable terms in the
[unit-economics model](../product/02-business-model-gtm.md#2a-per-search-unit-economics--the-make-or-break-model-added-per-review-248).
Full numbers in the [Cost Model](../Review/cost-model.md).

---
### Sources for current pricing (2026)
- Claude/Bedrock token pricing — [CloudZero](https://www.cloudzero.com/blog/claude-api-pricing/), [BenchLM](https://benchlm.ai/anthropic/api-pricing)
- Duffel pricing — [Duffel](https://duffel.com/pricing)
- AWS Activate credits — [AWS Startups](https://aws.amazon.com/startups/credits-lp)
- Clerk pricing/MRU — [Clerk](https://clerk.com/pricing)
- Amadeus self-service decommission — [OneClick Travel Tech](https://oneclicktraveltech.com/blogs/amadeus-api-pricing-and-access)
- Grafana Cloud vs Datadog — [CloudZero](https://www.cloudzero.com/blog/grafana-cloud-pricing/)
- Stripe Billing fees — [Flexprice](https://flexprice.io/blog/stripe-pricing-breakdown-2026)

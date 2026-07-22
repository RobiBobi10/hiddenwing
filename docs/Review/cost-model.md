# Cost Model

_Status: Draft · Owner: Founders / Architecture · Last updated: 2026-07-22_

Answers two questions directly: **what will every cost be**, and **will I have any at the
beginning?** Figures are 2026 estimates in USD, grounded in the pricing sources at the bottom.
They are **planning ranges, not quotes** — verify live, especially flight-provider terms (the
[due-diligence spike](provider-due-diligence-spike.md) exists to pin these down). A companion
spreadsheet (`FlightAI-Cost-Model.xlsx`) lets you change the assumptions.

> **The one-sentence answer:** thanks to free tiers and startup credits, your **out-of-pocket
> software/infra cost at the very beginning is close to $0** — the real early costs are **people's
> time, some legal/professional fees, and possibly a flight-provider commitment.** What scales with
> usage from day one is **flight-API calls** and **LLM tokens** — everything else stays cheap for a
> long time.

---

## 0. 🏠 Family Edition — what it actually costs to build this for 2–10 people

**This is the plan we're building first (see [FAMILY-EDITION.md](../FAMILY-EDITION.md)).** For a
private family tool, almost every cost below disappears — no team, no legal, no infrastructure spend:

| Item | Family Edition monthly cost |
|---|---|
| Hosting (Vercel free) | **$0** |
| Database (Neon/Supabase free Postgres) | **$0** |
| Auth (Clerk free tier) | **$0** |
| AI (Claude API, family-scale usage) | **~$1–5** |
| Flight data (Duffel sandbox / pay-per-use) | **~$0** |
| Monitoring (Sentry free) | **$0** |
| Domain (optional, ~$12/yr) | **~$1** |
| **TOTAL** | **≈ $0–15 / month** |

- **To build:** your own time (evenings/weekends), **$0 in wages**.
- **One-off:** optionally ~$12/year for a domain. **No legal fees, no deposits, no salaries.**
- **Why so cheap:** private family use isn't a public data-processing service, so the GDPR/legal
  work (§1) doesn't apply; and at 2–10 users you need none of the scaling infrastructure.

The rest of this document is the **Scale Edition** cost model — what it costs *if and when* you grow
FlightAI into a public product for thousands. Keep it for later; ignore it while you're building for
your family.

---

---

## 1. Will I have costs at the beginning? (Pre-launch / MVP build, pre-revenue)

| Item | At-start monthly | Notes |
|---|---|---|
| Domain | ~$1–2/mo ($15/yr) | One-off-ish |
| Email (Google Workspace) | ~$7/user/mo | 2–3 founders → ~$15–21/mo |
| Cloud (AWS dev) | **~$0 effective** | Real spend ~$100–400/mo, **offset by AWS Activate credits** ($1k–$5k self-serve/builders; up to $100k+ via accelerators; up to $300k GenAI on Bedrock) |
| LLM (Claude via Bedrock) | **~$0–100 effective** | Dev/test usage is low; offset by GenAI credits if approved |
| Flight APIs (Duffel test / GDS sandbox) | **$0** to start | Duffel is pay-per-booking (so $0 until you book); **but a GDS Enterprise contract may carry setup/minimums** — the main uncertainty (R1/R22) |
| Auth (Clerk) | **$0** | Free up to 50k monthly retained users |
| Monitoring/logging (Grafana Cloud) | **$0** | Free tier (10k series, 50 GB logs) |
| Error tracking (Sentry) | **$0** | Free/dev tier |
| CDN/SSL (Cloudflare) | **$0** | Free tier |
| Frontend host (Vercel) | **$0–20/mo** | Hobby/Pro |
| CI/CD (GitHub) | **$0–12/mo** | Free minutes; Team $4/user |
| Payments (Stripe) | **$0** | No subscription at MVP; you only pay when you charge |
| **Recurring software subtotal** | **~$30–150/mo** | Mostly email + a couple of paid seats; the rest is free-tier/credit-covered |

**One-off / professional costs at the start (the ones that actually matter):**

| Item | Estimate | Why |
|---|---|---|
| **Legal** — provider ToS review, GDPR DPIA, seller-of-travel check | **$2,000–15,000** one-off | Gated by the due-diligence spike; genuinely needed before launch (review §5) |
| **Business setup** — incorporation, accounting | $500–3,000 | Jurisdiction-dependent |
| **Flight-provider deposit/minimums** (if GDS Enterprise) | **$0–?** (unknown) | The big at-start unknown — pin down in the spike (R1/R22) |
| **Wizard-of-Oz validation** (optional, recommended) | low ($ of real bookings + time) | De-risks the business before the build (roadmap Month -1) |

**Conclusion:** you can build and run the MVP infrastructure for **tens of dollars a month** out of
pocket. The beginning's real cash costs are **legal/professional (~$3k–18k one-off)** and any
**flight-provider commitment**, and the dominant cost — as always — is **people's time**.

---

## 2. The elephant: people (stated honestly, excluded from tool totals)

Infrastructure is a rounding error next to salaries. A minimal build team is the real budget:

| Team shape | Indicative monthly cost |
|---|---|
| Solo founder-engineer (sweat equity) | $0 cash (opportunity cost) |
| 2–3 engineers (early) | ~$20,000–60,000/mo (varies hugely by geography/seniority) |

The rest of this model covers **software/service costs only**, because that's what the question
listed — but no plan is realistic without accounting for people first.

---

## 3. Monthly software/service cost by phase

Ranges assume the [stack decisions](../architecture/24-technology-stack-decisions.md). "Credits
offset" means AWS Activate / Bedrock GenAI credits likely cover much of it in Phase A–B.

| Category | Phase A: MVP build (pre-launch) | Phase B: Beta (~1k–10k MAU) | Phase C: Growth (~100k+ MAU) |
|---|---|---|---|
| Cloud compute + data (AWS) | $100–400 (credit-offset → ~$0) | $300–1,500 | $3,000–15,000 |
| **LLM tokens** (Claude/Bedrock) | $50–200 (credit-offset) | $100–800 | $1,000–10,000 |
| **Flight APIs** (variable) | ~$0 | see §4 (booking + search fees) | see §4 (dominant variable cost) |
| Auth (Clerk → Ory) | $0 | $0 (under 50k MRU) | ~$1,025 (Clerk) or self-host Ory |
| Monitoring/logging (Grafana + Sentry) | $0 | $0–150 | $500–5,000 |
| Frontend host (Vercel) | $0–20 | $20–150 | $150–1,000+ (or self-host) |
| CI/CD (GitHub Actions) | $0–12 | $12–100 | $100–1,000 |
| Email/collab | $15–50 | $30–150 | $150–500 |
| Payments (Stripe) | $0 | starts w/ subscriptions (Phase 2): 0.7% + 2.9%+30¢ | same, on subscription revenue |
| **Software subtotal (excl. flight APIs & salaries)** | **~$30–150/mo effective** | **~$500–3,000/mo** | **~$6,000–35,000/mo** |

Flight APIs and LLM tokens are broken out because they scale with *usage*, not headcount — they're
the terms that decide whether the business works (see §4).

---

## 4. The costs that scale with usage (unit economics)

This is the make-or-break part (business model §2a, review §2/§4). Per the grounded 2026 rates:

**Per booking (revenue side):** affiliate commission of ~$5–20 per booked trip (provisional).

**Per booking (Duffel cost side, if booking through Duffel rather than pure affiliate):**
- ~$3 per confirmed order, +1% of order value (managed content), +$1 per paid ancillary.

**Per search (cost side) — the dangerous term:**
- LLM: ~1 intake call + 1 explanation call per search. With Haiku for intake and Sonnet for
  explanation, and prompt caching, on the order of **fractions of a cent to a few cents per
  search** (bounded by keeping the LLM at the edges, NFR-27).
- Flight-provider search: **the risk.** Naïve flexibility fan-out = 20–100+ calls/search. Duffel
  adds a **search fee of $0.005/search only past a 1,500:1 search-to-book ratio** — so a low
  booking-conversion product doing wide fan-out pays real money per search. **This is why
  provider-native flexible-search ([ADR-0007](../architecture/adr/0007-native-flexible-search.md))
  and caching are not optional.**

**Illustrative break-even intuition:**
```
If affiliate_revenue_per_booking = $10
and booking_conversion_rate      = 2%   → revenue/search = $0.20
then cost/search must stay well under $0.20 (LLM + provider + infra)
→ every extra 40 provider calls at $0.005 = $0.20 = your entire margin gone.
```
The [spreadsheet](../Review) lets you flex conversion rate and calls-per-search to see where margin
turns positive. **Do not commit to the full build until this closes positive** (risk R2).

---

## 5. Startup credits — how to make the beginning nearly free

| Program | Value | Notes |
|---|---|---|
| **AWS Activate** | $1k (self-serve) → $5k (builders) → $25k–100k (via accelerator/VC) → **up to $300k GenAI** (Bedrock/SageMaker) | Covers cloud + Claude-on-Bedrock in Phase A–B |
| Google for Startups / Azure founders | comparable credits | If you chose GCP/Azure instead |
| Anthropic / OpenAI startup programs | occasional credits | Worth applying |
| Stripe, Sentry, etc. startup tiers | free/discounted | Stack them |

Applying for these is a **Month-0 task** — it's the difference between "$0 effective" and
"$300–600/mo" during the build.

---

## 6. Summary

- **🏠 Family Edition (what we're building first):** **≈ $0–15/month**, no wages, no legal, no
  deposits. See §0 and [FAMILY-EDITION.md](../FAMILY-EDITION.md).
- **At the beginning (Scale Edition):** software/infra ≈ **$0–150/mo** (free tiers + credits). Real early cash =
  **legal/professional (~$3k–18k one-off)** + any **flight-provider commitment** + **people**.
- **Beta:** ~**$500–3,000/mo** software, plus usage-based flight/LLM cost.
- **Growth:** ~**$6k–35k/mo** software, **dominated by flight-API calls and LLM tokens** — the
  variable costs the unit-economics work must tame.
- **Biggest financial risks:** (R1/R22) flight-provider access/terms, and (R2) per-search unit
  economics. Neither is a tooling cost — both are resolved by the
  [due-diligence spike](provider-due-diligence-spike.md), not by picking a cheaper database.

---
### Pricing sources (2026)
- Claude/Bedrock tokens — [CloudZero](https://www.cloudzero.com/blog/claude-api-pricing/), [BenchLM](https://benchlm.ai/anthropic/api-pricing)
- Duffel — [Duffel pricing](https://duffel.com/pricing)
- AWS Activate — [AWS Startups](https://aws.amazon.com/startups/credits-lp)
- Clerk — [Clerk pricing](https://clerk.com/pricing)
- Grafana Cloud vs Datadog — [CloudZero](https://www.cloudzero.com/blog/grafana-cloud-pricing/)
- Stripe — [Flexprice](https://flexprice.io/blog/stripe-pricing-breakdown-2026)
- Amadeus self-service decommission — [OneClick Travel Tech](https://oneclicktraveltech.com/blogs/amadeus-api-pricing-and-access)

_All figures are planning estimates as of July 2026 and will drift — re-verify before budgeting._

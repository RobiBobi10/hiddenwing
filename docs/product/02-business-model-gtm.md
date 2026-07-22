# 02 · Business Model & Go-To-Market

_Status: Draft · Owner: Product / Founders · Last updated: 2026-07-22_

## 1. How FlightAI makes money

We separate the model into what's viable at MVP (low regulatory burden) and what unlocks better
economics later (higher burden). See ADR-0003 for the accreditation decision.

### Revenue streams

| Stream | Description | Phase | Notes / risk |
|---|---|---|---|
| **Affiliate / referral** | Deep-link handoff to airlines & OTAs; earn CPA/CPC commission | MVP | Low margin (~1–2% of fare, or fixed CPA), no ticketing liability. Fastest to launch. |
| **Subscription (FlightAI Plus)** | Monthly/annual: price monitoring, unlimited flexibility searches, priority AI planning, fare-drop rebooking alerts | Phase 2 | High margin, aligns us with the user (we're paid to save them money, not to upsell fares). Our preferred core. |
| **Ancillary / in-platform booking margin** | Once accredited, sell tickets directly and earn distribution margin + ancillary attach | Phase 3 | Requires IATA/seller-of-travel accreditation, PCI scope, refunds/IROPS support. |
| **B2B / API licensing** | License the optimization engine to OTAs, TMCs, super-apps | **Phase 1–2 (elevated)** | **Likely the strongest business.** Sidesteps CAC, the cold-start problem, *and* partly the inventory-access problem (partners bring their own inventory). Review §8/§9 recommends starting a design-partner track in parallel with MVP, not deferring. |
| **Anonymized demand insights** | Aggregate, privacy-safe route/price-trend data to airlines | Phase 3 | Only if GDPR-clean and non-identifiable; treat cautiously. |

**Deliberate stance:** we do **not** want a model that pays us more when the traveler pays more.
Subscription + B2B keep incentives aligned with the north-star metric (traveler savings).

## 2. Unit economics (illustrative, to be validated)

- **CAC** target: keep blended CAC < 0.3 × LTV.
- **Affiliate LTV** (MVP): thin — a booked trip might net €5–€20. Alone this doesn't fund paid
  acquisition; MVP growth must be organic/content-led.
- **Subscription LTV**: €5–€10/mo × retention. A 12-month retained subscriber (~€60–€120)
  fundamentally changes what CAC we can afford. **This is why the model must reach subscription
  quickly.**
- **Cost to serve**: dominated by (a) provider API call costs / rate limits and (b) LLM
  inference. Both are controllable via caching and by keeping the LLM out of the hot scoring
  path (see [Flight Search Optimization](../architecture/12-flight-search-optimization.md)).

### 2a. Per-search unit economics — the make-or-break model (added per review §2/§4/§8)

> The [CTO Review](../Review/CTO_Review.md) flagged this as a P0 existential risk: **we pay
> provider + LLM cost on *every search*, but earn affiliate revenue only on *booked trips*, at a
> flexibility fan-out multiple.** Per-search margin may be negative. This must be modeled with
> real provider quotes before committing to a build. Illustrative structure (numbers TBD by the
> [Provider Due-Diligence Spike](../Review/provider-due-diligence-spike.md)):

```
Revenue per search  = booking_conversion_rate × affiliate_revenue_per_booking
Cost per search     = (provider_calls_per_search × provider_cost_per_call)
                    +  llm_cost_per_search
                    +  infra_cost_per_search

Gross margin/search = Revenue per search − Cost per search
```

The dangerous term is `provider_calls_per_search`: naïve flexibility fan-out (date grid × nearby
airports × providers) can be **20–100+ calls per search**. Levers that must bring this down before
the model works:
1. **Provider-native flexible/cheapest-date endpoints** instead of DIY fan-out — the biggest lever
   ([ADR-0007](../architecture/adr/0007-native-flexible-search.md)).
2. **Cache-first** within contractual limits (caching *rights* vary by provider — legal review
   §5).
3. **Cost-aware query planning** — spend a per-search call budget only where it changes the answer.
4. **Keep the LLM at the edges** (once per search + once per shortlist, not per candidate).

**Gate:** do not green-light the full build until a real-numbers model shows a credible path to
non-negative per-search margin (or an explicit, funded subsidy runway with a plan to reach it).

## 3. Cost structure to watch

1. **Provider call costs & rate limits** — the single biggest scaling constraint. Every
   flexibility search multiplies queries (date grid × nearby airports). Aggressive caching,
   query planning, and provider-cost-aware search are core engineering problems, not
   afterthoughts. See [Data Providers](../architecture/13-data-providers.md).
2. **LLM inference** — bounded by keeping AI at the edges (understanding + explanation), not in
   per-candidate scoring.
3. **Infrastructure** — search is bursty and compute-heavy; autoscaling + spot capacity.

## 4. Go-to-market

### Phase 0 — Wedge (organic, content-led)
- **SEO + programmatic content**: "cheapest time to fly X→Y", flexibility guides, route pages
  — feeds the flexibility engine's strength. _Caveat (review §8): "near-zero CAC via SEO" is
  optimistic in 2026 given AI-generated results and zero-click search; treat as one channel, not
  the whole plan._
- **"Show your savings" virality**: every result shows the value added vs. the user's literal
  query (doc 01). Shareable "we saved you €X and 4 hours" cards — **claims must be substantiable**
  from stored data (review §5, [Security §9](../security/15-security-architecture.md)).
- **Communities**: r/travel, digital-nomad and flight-deal communities.

> **Award-travel wedge — reconciled (review §1/§9.4).** The award-travel community is a natural
> early-adopter base, but points/loyalty optimization was originally deferred to Phase 4 — a
> mismatch. Decision: either **pull a *narrow* points-value feature forward** (e.g. "is this worth
> paying cash or points?") to actually serve that base, **or drop the r/awardtravel targeting**
> until we do. Don't claim a community we don't yet build for. Tracked in the
> [Risk Register](../Review/risk-register.md).

### Phase 1 — Convert to habit
- Preference Profile as the retention hook: the more you use it, the better it gets, the higher
  the switching cost.
- Price-monitoring & fare-drop alerts (subscription upsell) to create recurring engagement.

### Phase 2 — Paid + B2B
- Once subscription LTV is proven, unlock paid acquisition.
- B2B pilots: embed the optimizer via API in a mid-size OTA or a corporate TMC.

## 5. Moat / defensibility

- **Preference data flywheel** — durable, per-user profiles competitors can't copy.
- **Optimization quality** — a genuinely better TTV model, provable via the north-star metric.
- **Provider-cost-aware search** — the operational ability to run wide flexibility searches
  cheaper than rivals is itself a moat.
- **Explainability + trust** — a brand travelers believe is on their side (subscription
  alignment reinforces this).

## 6. Key risks

| Risk | Mitigation |
|---|---|
| Affiliate margins too thin to fund growth | Content-led organic wedge; move to subscription fast |
| Provider costs scale worse than revenue | Caching, query planning, cost-aware search; negotiate volume deals |
| Google Flights / incumbents add personalization | Compete on depth of optimization + alignment (we don't sell fares) |
| Accreditation/regulatory burden of direct booking | Stay affiliate until subscription + B2B justify the leap (ADR-0003) |
| AI trust incidents (a wrong price shown) | Deterministic pricing + live re-validation (see [AI Safety](../architecture/11-ai-safety-and-evaluation.md)) |

---
### Open questions
- B2C-first vs. B2B2C-first? B2B may monetize the core asset faster with less CAC.
- Geography of launch (regulatory + provider-coverage dependent).

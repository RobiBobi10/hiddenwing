# Provider Due-Diligence Spike (Month-0, P0)

_Status: Action plan · Owner: Founders + Architecture · Date: 2026-07-22 · Blocks: build go/no-go_

> This spike exists because the [CTO Review](CTO_Review.md) identified **inventory access on viable
> terms** as the single existential risk the blueprint under-weighted. It is a *before-you-build*
> investigation, not an engineering task. Its output either de-risks the plan with facts or changes
> it (up to and including superseding [ADR-0003](../architecture/adr/0003-affiliate-first-booking-model.md)).

## 1. Objective
Determine, **per candidate provider**, whether FlightAI can obtain flight pricing/availability on
terms that make the product legal, technically feasible, and economically viable — and produce a
real-numbers per-search unit-economics model. Reach a **go / no-go / change-the-plan** decision.

## 2. Timebox & output
- **~2–3 weeks**, run in parallel with Month-0 foundations (it gates the *build commitment*, not
  the scaffolding).
- **Deliverables:**
  1. Completed **provider matrix** (§4).
  2. **Unit-economics model** with real call costs (§5).
  3. **Legal memo** on caching/display rights, seller-of-travel, bait-pricing, EU-PII-to-LLM (§6).
  4. A **decision record** (go/no-go) and any resulting new/superseding ADRs (§7).

## 3. Candidate providers to evaluate
Amadeus (Self-Service **and** Enterprise), Duffel, Kiwi/Tequila, Sabre, Travelport, and at least
one airline **NDC** direct (as a content/effort reference point). Weight toward API-first providers
for MVP (per [ADR-0002](../architecture/adr/0002-multi-provider-adapter-strategy.md)).

## 4. The provider matrix — questions to answer for each

| Dimension | Specific questions |
|---|---|
| **Access & onboarding** | Which tier gives production pricing? What does it take to get it — contract, accreditation, deposit, volume commitment, time-to-onboard? Is there a usable sandbox with realistic data? |
| **Cost per call** | Exact price per search call, per price/confirm call, per booking. Tiered? Minimums/commitments? → feeds §5. |
| **Rate limits & quotas** | Calls/sec and calls/day at each tier. Burst handling. Do quotas support our flexibility fan-out and target volume? |
| **Native flexible search** | Does it offer cheapest-date / price-calendar / flexible endpoints (Amadeus Flight Cheapest Date Search, Kiwi flexible)? Coverage & cost of those vs. per-itinerary calls? (Decides [ADR-0007](../architecture/adr/0007-native-flexible-search.md) viability per provider.) |
| **Caching & display rights** | May we store fares? Max TTL? May we display a cached price, or must every displayed price be live? Penalties for violation? (Gates the whole caching strategy — legal §6.) |
| **Price stability / confirm step** | Is there a mandatory confirm-price call? How often does it change vs. search? → sets expected **re-validation-failure rate** (review §3). |
| **Booking model** | Affiliate/deep-link supported? Or must we be seller/agent of record? Commission/CPA terms? (Gates [ADR-0003](../architecture/adr/0003-affiliate-first-booking-model.md).) |
| **Content richness** | Baggage, fare rules, ancillaries, seat, aircraft, on-time data available? (Needed for Comfort Score / TTV, doc 12.) |
| **Data residency** | EU-region endpoints/hosting available? (GDPR, doc 16.) |
| **Reliability** | Published SLA/uptime, historical incident behavior, support responsiveness. |

## 5. Unit-economics model (fill with real numbers from §4)

Instantiate the model from [Business Model §2a](../product/02-business-model-gtm.md#2a-per-search-unit-economics--the-make-or-break-model-added-per-review-248):

```
provider_calls_per_search   = f(flexibility settings, native-flexible availability, cache hit rate)
provider_cost_per_search    = provider_calls_per_search × provider_cost_per_call
llm_cost_per_search         = intake_tokens + explanation_tokens priced at chosen model
infra_cost_per_search       = compute + storage (incl. offer snapshot, ADR-0009)
cost_per_search             = provider + llm + infra

revenue_per_search          = booking_conversion_rate × affiliate_revenue_per_booking
gross_margin_per_search     = revenue_per_search − cost_per_search
```

Model **three scenarios**: naïve fan-out, native-flexible + cache-optimized, and cache-heavy.
Sensitivity-test on `booking_conversion_rate` (unproven) and `provider_calls_per_search` (the
dangerous term). **Success criterion:** a credible path to non-negative `gross_margin_per_search`
under conservative conversion assumptions — or an explicit, funded subsidy runway with a plan to
reach it.

## 6. Legal memo (parallel, with counsel)
1. **Fare caching/display rights** per provider contract — does our cache strategy comply?
2. **Seller-of-travel registration** — required in target launch jurisdictions even for affiliate?
   (e.g. CA/FL/WA in the US.)
3. **Bait-pricing / advertising law** — exposure from cached-price → changed-at-handoff, and from
   "we saved you €X" marketing claims (must be substantiable; FTC-style disclosure).
4. **EU-PII-to-LLM transfer** — EU-region no-retention model endpoint availability; SCCs; DPIA
   scope (doc 16).
5. **European Accessibility Act** — confirm WCAG 2.1 AA as a launch-gating legal requirement for EU.

## 7. Decision gate (go / no-go / change-the-plan)

**GO to build** if, for at least one primary + one fallback provider:
- Production access is obtainable on a known timeline/cost, **and**
- The affiliate (or an acceptable alternative) booking model is permitted, **and**
- Caching/display rights are compatible with the [async-first + native-flexible](../architecture/adr/0008-async-first-search.md) design, **and**
- The unit-economics model shows a credible path to non-negative per-search margin, **and**
- No unresolved legal blocker (residency, seller-of-travel, bait-pricing).

**CHANGE THE PLAN** (write/supersede ADRs) if, e.g.:
- Affiliate isn't supported → pursue agent-of-record (supersede ADR-0003) and re-budget for PCI/ops.
- Caching is prohibited → lean harder on native-flexible + live-only, re-baseline latency again.
- B2C economics don't close → elevate the [B2B track](../architecture/adr/0010-b2b-track-in-parallel.md)
  to primary (partners bring their own provider contracts).

**NO-GO / pause** if no provider combination yields legal, feasible, and economically viable access
— revisit the whole thesis (or the Wizard-of-Oz validation in [review §9.7](CTO_Review.md)) before
spending engineering budget.

## 8. Owners & next step
- **Founders**: provider commercial conversations, legal engagement.
- **Architecture**: sandbox spikes (measure real call latency, native-flexible coverage, confirm-
  price change rate), build the unit-economics model.
- **Next step:** schedule provider calls this week; stand up sandbox keys for Amadeus Self-Service,
  Duffel, and Kiwi to get measured latency/cost numbers into the model within the timebox.

# CTO Review — Hiddenwing Blueprint

_Status: Critical review · Reviewer: acting CTO · Date: 2026-07-22 · Scope: all of `/docs`_

> **Verdict up front:** the blueprint is well-structured and internally coherent, and the core
> instinct — deterministic pricing with AI at the edges — is right. But it is **engineered as if
> the hard part is software. It isn't.** The hard part is *access to flight inventory on
> economically viable terms*, and the plan under-weights that to the point of being optimistic.
> Several headline numbers are aspirational, the core feature (wide flexibility search) is in
> direct tension with the economics and the provider APIs, and the competitive/monetization story
> is the weakest link. **This is a conditional go, not a go.** Below is what I'd force to change
> before funding a build.

---

## 0. The five things that actually decide whether this company exists

Before the itemized review, here are the load-bearing risks. If any one of these is unsolved, the
rest of the plan is moot.

1. **Inventory access & terms (existential).** The plan assumes provider access as a given. It
   is not. Amadeus/Sabre enterprise contracts require accreditation, volume commitments, and
   deposits; Duffel requires you to be the seller/agent of record; aggregators restrict how you
   store and display fares. There is a **chicken-and-egg**: you need volume for good terms, and
   good terms to build a product that generates volume. **No doc owns this.** → See §7, §10.

2. **The core feature fights the economics.** Wide flexibility search (date-grid × nearby
   airports × providers) multiplies provider calls, and provider calls are the dominant cost.
   Affiliate revenue is €5–20 per *booked* trip, but you pay call costs on *every search*,
   booked or not, at a fan-out multiple. **At MVP the per-search gross margin is plausibly
   negative.** → §2, §4, §8.

3. **Sub-4-second live multi-provider search is unrealistic.** GDS/aggregator search calls are
   routinely 2–10s each. A fan-out that then re-prices for booking cannot reliably hit p95 ≤ 4s.
   The doc treats async as a fallback for "wide" searches; in reality **async/progressive is the
   only honest design center.** → §2, §3.

4. **Cached-fare display is a legal and correctness landmine.** "Cache-first, label staleness"
   collides with provider ToS (many prohibit storing/displaying fares without a live requery) and
   with consumer-protection/bait-pricing law when the re-validation price differs. If
   price-change-at-handoff is common (it will be), it's not an edge case — it's the default UX.
   → §5, §6.

5. **Differentiation vs. Google Flights is thin, and monetization is unproven.** Google Flights
   is free, fast, has vast inventory, and is itself adding AI. "Better optimization + a
   preference profile" is a real but *narrow* wedge with weak early switching cost, and
   flight-search subscription willingness-to-pay is historically low. **The B2B/API play is
   probably the real business and it's buried in Phase 2.** → §8, §9.

---

## 1. Missing features & gaps

| Gap | Why it matters | Recommendation |
|---|---|---|
| **Disruption / IROPS handling** | A "travel optimizer" that ignores delays, cancellations, and schedule changes is optimizing a snapshot that decays. Deferred to Phase 3. | Even MVP should *detect* schedule changes on saved trips. It's also a genuine differentiator vs. metasearch. |
| **Cold-start personalization** | The Preference Profile is the moat, but a new user has none. Value-of-time, comfort weights, "hate red-eyes" — all empty on day one. TTV degenerates to price-sort initially, i.e. Google with extra latency. | Design explicit onboarding to seed the profile fast (a 5-question quiz, sensible archetypes) and address cold-start head-on. |
| **Experimentation platform** | The plan says "tune TTV weights against feedback" but there's no A/B/experimentation infra. You cannot tune an optimizer you can't experiment on. | Make an experimentation framework a Month-0 platform primitive, not an afterthought. |
| **Points/loyalty optimization** | The GTM names the award-travel community as an early-adopter base, yet points optimization is Phase 4. That's backwards — it may be the sharpest wedge. | Pull a *narrow* points-value feature forward, or drop the award-travel GTM claim. |
| **Customer support & trust/safety ops** | Handoff bookings still generate "where's my refund?" and "the price changed" tickets. No support model, no dispute path. | Define a support/escalation model before launch; it's a real cost line. |
| **Mobile** | Travel is mobile-dominant; MVP is responsive-web only. Defensible for MVP, but a stated risk. | Fine to defer native, but validate mobile-web conversion explicitly. |
| **Group/multi-pax constraints** | Even 2 travelers with different preferences complicate TTV. MVP is effectively single-traveler. | Acknowledge as a scoping limit in the FRs. |
| **Payment/click fraud & affiliate attribution** | Affiliate models attract click fraud and attribution disputes; no mention. | Add attribution + fraud handling to the handoff design. |

---

## 2. Unrealistic assumptions (the numbers I don't believe)

- **NFR-1: search p95 ≤ 4s.** For a *live, multi-provider, flexibility* search, no. Provider
  latency alone often exceeds this. Either (a) redefine the SLO to "first meaningful result ≤ 2s,
  full result set async," making progressive UX the default, or (b) admit most searches are
  served substantially from cache — which then reopens the ToS/staleness problem (§5). You can't
  have live accuracy, wide flexibility, and 4s p95 simultaneously. **Pick two.**
- **NFR-24 / SLO "100% grounding, 0 fabricated facts."** Admirable intent, but stated as an
  absolute it's unachievable and creates false assurance. The numeric guardrail catches
  *fabricated numbers*; it does **not** catch misleading *framing*, omitted caveats, or wrong
  causal claims ("nonstop is worse" when it's actually better on the user's own weights). Reframe
  as "0 fabricated **quantitative** facts *displayed* (hard gate) + measured faithfulness on
  qualitative claims (target)."
- **North-star metric is unobservable as defined.** `TTV(recommended) − TTV(what they'd have
  booked unaided)` requires the counterfactual — what the user *would* have booked without you.
  You can't measure that. Replace with observable proxies: TTV(recommended) − TTV(their literal
  query), TTV(chosen) − TTV(cheapest), and booking-vs-baseline holdout experiments.
- **NFR-13 determinism "given the same inputs."** Provider prices/availability change by the
  minute. Reproducibility only holds if you **snapshot the exact offer set** per search — which is
  a large, unbudgeted storage cost (§4) and has data-retention/ToS implications (§5). The doc
  claims determinism without owning its cost.
- **10M users / millions of searches/day (NFR-5).** The compute side is fine; the assumption that
  you can *make the corresponding volume of provider calls* within contracted quotas and at
  survivable cost is the real, unexamined bet.

---

## 3. Technical risks

- **Provider latency dominates everything.** The architecture is built around a sync path that
  won't usually be sync. Invert it: async-first, cache-assisted, with provider "flexible/cheapest-
  date" *native* endpoints (Amadeus Flight Cheapest Date Search, Kiwi flexible search) used
  instead of DIY fan-out wherever possible — this cuts both latency and call volume dramatically.
  **This is the single biggest architectural improvement available.**
- **Re-validation failure rate.** If cached ranking prices frequently don't survive the live
  re-price, the "price changed" re-quote becomes the norm and erodes trust — the exact thing the
  design is trying to protect. Instrument this from day one; if it's high, the caching strategy is
  wrong, not just the UX.
- **Cross-provider de-duplication is genuinely hard** (fare basis, booking class, branded fares).
  The docs treat it as a normalization bullet; it deserves real design and test investment (§ maps
  to Testing doc's contract tests, but scope is understated).
- **Split-ticket / self-transfer liability.** Cheaper but the user bears missed-connection risk
  with no protection. "Label the risk" is not enough — there's reputational and possibly legal
  exposure when it goes wrong. Consider excluding from MVP or making the risk disclosure very
  explicit.
- **AI free-text is the query *and* the PII.** "Strip PII before the LLM" is largely infeasible
  when the trip request itself contains names, locations, and dates ("fly me to my mother in
  Haifa on the 3rd"). The mitigation in docs 10/11 overstates what's achievable (§6).

---

## 4. Scalability problems

- **The ceiling is provider rate limits and cost, not CPU.** Every scaling doc optimizes compute
  (autoscaling on queue depth — good) but the binding constraint is *calls you're allowed to make
  and can afford*. Scaling the user base linearly scales provider spend, which may scale faster
  than affiliate revenue. **This can make growth actively unprofitable** — the opposite of the
  usual SaaS assumption.
- **Storing every candidate solution for reproducibility.** Snapshotting offer sets and
  `trip_solution` breakdowns for millions of searches/day is a very large write/storage volume.
  Partitioning is mentioned; the *cost and volume* aren't reckoned with. Consider storing only
  what's needed to reconstruct (query + provider raw payloads in cheap object storage with short
  retention), not the full expanded candidate set in Postgres.
- **Redis Streams → "Kafka later" hand-wave.** The async fan-out is the scaling crux; "we'll swap
  the queue later" is exactly the kind of load-bearing migration that's painful under load. Decide
  the durability/throughput requirements now even if you start on Redis.

---

## 5. Legal & compliance issues (under-weighted)

- **Fare caching & display rights.** Many GDS/airline/aggregator agreements restrict *storing and
  displaying* fares without a live request, and cap caching TTLs. The "fare cache" strategy may be
  **contractually non-compliant** depending on provider. This must be validated per provider
  before it's designed in as a core performance mechanism. → gates the whole caching approach.
- **Bait-pricing / advertising law.** Repeatedly showing a price that changes at handoff can
  attract consumer-protection scrutiny (EU + several US states). "We labeled it cached" may not be
  a sufficient defense.
- **Seller-of-travel registration.** Even as an affiliate, some jurisdictions (e.g. California,
  Florida, Washington seller-of-travel laws) may require registration/disclosure. ADR-0003 assumes
  affiliate = negligible regulatory burden; that's not uniformly true. Get counsel before assuming
  it.
- **EU–US data transfer for LLM + free-text PII.** Sending EU users' free-text trip requests
  (which *are* PII) to a US LLM is a real transfer-risk and DPIA issue. SCCs help but the doc's
  "we'll strip PII" is not a credible control for free text (§3, §6). Strongly prefer EU-region
  model endpoints with no-retention terms, and treat this as a launch-gating legal item.
- **European Accessibility Act (in force June 2025).** WCAG 2.1 AA is cited as a quality target;
  for EU consumer services it may be a **legal requirement**, not a nice-to-have. Elevate it.
- **FTC/consumer affiliate-disclosure** requirements on the handoff and any "savings" marketing
  claims — the "we saved you €X" virality mechanic must be substantiable or it's a deceptive-
  advertising risk.

---

## 6. Security issues

The security doc is strong (OWASP mapping, least privilege, secrets, rate limiting). Gaps I'd
push on:

- **PII-to-LLM minimization is overstated** (repeated from §3/§5 because it's both a privacy *and*
  security control). Treat the LLM boundary as a data-egress point in the threat model with
  explicit residency and retention controls, not a "we'll strip it" bullet.
- **Affiliate deep-link handoff = open-redirect / link-tampering surface.** Outbound handoff URLs
  must be signed/validated; the SSRF/egress controls mentioned should explicitly cover the
  affiliate redirect.
- **Audit-immutability vs. GDPR erasure tension.** Hash-chained immutable audit log + right to
  erasure are in conflict; crypto-shredding is named but the *key-management design* that makes it
  actually work (per-subject keys) isn't specified. Specify it.
- **Prompt-injection via provider content** is well-noted — keep it; it's a genuinely correct call
  that many teams miss.

---

## 7. API limitations (the reality of the providers)

- **Amadeus Self-Service vs. Enterprise:** Self-Service has low rate limits and non-production
  data quirks; Enterprise needs a commercial contract, and its terms constrain caching/display.
  The MVP plan ("1 primary + 1 fallback provider") glosses over *which tier* and *what it takes to
  get it*.
- **Duffel** is booking-first and generally expects you to act as the seller/agent — it may not
  fit a pure affiliate-handoff model cleanly. Validate that the affiliate model even works with
  the chosen providers *before* committing to ADR-0003.
- **Kiwi (Tequila)** supports affiliate/deep-link but with its own booking/deep-link constraints
  and self-transfer product (which carries the split-ticket risk in §3).
- **NDC direct** is one integration per airline — great content, terrible effort-scaling; not an
  MVP path.
- **No provider guarantees a quoted price holds**; the mandatory "confirm price" step can itself
  fail or change — so re-validation friction (§3) is structural, not incidental.

**Bottom line:** the provider abstraction (ADR-0002) is the *right engineering pattern*, but it
can't paper over the *commercial* reality that each provider imposes different economics, latency,
caching rights, and booking models. A provider **due-diligence spike** must precede the build.

---

## 8. Business risks

- **Negative unit economics at MVP** (see §2/§4): provider + LLM cost per search vs. thin
  affiliate revenue per booking, at a fan-out multiple, on an unproven conversion funnel.
- **Competing with free.** Google Flights/Skyscanner are free, fast, broad, and adding AI. Your
  advantage (personalized TTV + explanation) is real but *incremental* and has weak early
  switching cost until the profile is rich — a cold-start-limited moat (§1).
- **Subscription willingness-to-pay is historically low** for flight search; the plan leans on
  subscription for the economics to work. That's a big, unvalidated bet.
- **Content/SEO wedge is slow and increasingly hostile** (AI-generated search results,
  Google zero-click). "Near-zero CAC via SEO" is optimistic in 2026.
- **The B2B/API business is likely stronger than B2C and is under-prioritized.** Licensing the
  optimization engine sidesteps CAC, the cold-start problem, *and* partly the inventory problem
  (partners bring their own inventory). It's buried in Phase 2.

---

## 9. Better alternatives (what I'd do differently)

1. **Make async/progressive the default architecture**, not the wide-search special case. Redefine
   the latency SLO around first-meaningful-result. (Fixes §2, §3.)
2. **Use providers' native flexible/cheapest-date search endpoints** instead of DIY fan-out
   wherever possible — cuts call volume, cost, and latency simultaneously. Biggest single win.
   (Fixes §2, §4.)
3. **Seriously evaluate B2B/API-first or B2B2C-first.** It attacks the three worst risks at once
   (economics, cold-start, inventory). At minimum, sequence a B2B design partner in parallel with
   MVP, not in Phase 2.
4. **Narrow the consumer wedge.** "Optimize any flight better than Google" is a wide, well-
   defended front. A sharp niche — points/award optimization, a specific traveler segment, or a
   watch-and-notify (async, low real-time pressure) product — is more winnable and less of a
   head-on fight.
5. **Run a provider due-diligence spike before any build** (Month -1): confirm access tier,
   pricing, rate limits, caching/display rights, and whether affiliate booking is even permitted
   per provider. This de-risks or kills ADR-0003 and the whole caching strategy with facts.
6. **Reframe correctness claims honestly:** grounding gate on *quantitative* facts only;
   observable north-star proxies; determinism only where you pay for offer snapshots.
7. **Prove the value hypothesis cheaply before building the engine.** A concierge/Wizard-of-Oz
   MVP (human + tools optimizing real trips for ~50 users) validates "people value TTV
   optimization + will pay" for a fraction of the cost — *before* committing to the full platform.

---

## 10. What's genuinely good (keep it)

Not everything needs changing — these are correct and worth defending:

- **AI-authority boundary (ADR-0006)** — deterministic pricing/ranking, AI at the edges. This is
  the right call and many competitors will get it wrong. Keep it exactly.
- **Provider adapter pattern (ADR-0002)** — correct engineering abstraction (just not a
  substitute for commercial due diligence).
- **Modular monolith first (ADR-0004)** — appropriately unglamorous and correct for the stage.
- **Prompt-injection / untrusted-provider-content handling** — mature, frequently overlooked.
- **Transparent, additive TTV with retained breakdown** — the right foundation for explainability
  and debuggability.
- **Documentation-as-product + ADRs** — this review is only possible because the reasoning is
  written down.

---

## 11. Prioritized recommendations

**P0 — resolve before committing to a build**
1. Provider due-diligence spike: access tier, cost, rate limits, caching/display rights, affiliate
   permissibility per provider. (§7, §5, §1)
2. Model the per-search unit economics with real provider call costs at flexibility fan-out; prove
   a path to non-negative margin (or a subsidy runway with a plan). (§2, §4, §8)
3. Legal review of fare caching/display, bait-pricing exposure, seller-of-travel registration, and
   EU-PII-to-LLM transfer. (§5)
4. Re-baseline the latency SLO to async-first / first-meaningful-result. (§2, §3)

**P1 — before public launch**
5. Adopt provider-native flexible-search endpoints to reduce fan-out. (§9.2)
6. Cold-start onboarding to seed the Preference Profile. (§1 missing features)
7. Experimentation platform for TTV tuning. (§1)
8. Reframe grounding SLO (quantitative-only) and north-star (observable proxies). (§2)
9. Instrument re-validation-failure rate and provider-cost-per-search as launch-gating metrics.
   (§3, §4)
10. Specify crypto-shredding key management for the audit/erasure tension. (§6)

**P2 — strategic, decide early even if executed later**
11. Stand up a B2B/API design-partner track in parallel with MVP. (§8, §9.3)
12. Consider a Wizard-of-Oz validation of the value hypothesis before full engine build. (§9.7)
13. Narrow the consumer wedge or explicitly accept the head-on fight with Google. (§8, §9.4)

---

## 12. Documents that need updating as a result

| Doc | Change |
|---|---|
| `product/04-non-functional-requirements.md` | Re-baseline NFR-1 latency; reframe NFR-24 grounding; note determinism's snapshot cost (NFR-13) |
| `product/01-product-vision.md` | Replace the unobservable north-star with observable proxies |
| `product/02-business-model-gtm.md` | Add explicit per-search unit-economics analysis; elevate B2B |
| `architecture/13-data-providers.md` | Add commercial due-diligence, per-provider access tiers, caching-rights, native-flexible-search strategy |
| `architecture/06/07` | Make async-first the primary design center |
| `architecture/adr/0003` | Gate on provider due-diligence; it may need to be superseded |
| `security/16-gdpr-and-privacy.md` | Strengthen EU-PII-to-LLM controls; specify crypto-shredding keys; elevate EAA to legal requirement |
| New ADRs to write | Native-flexible-search vs. DIY fan-out; async-first search; offer-snapshot storage strategy; B2B-vs-B2C sequencing |

---

_This review deliberately withholds approval. The blueprint is a strong **engineering** plan
attached to an **under-examined commercial and inventory-access** plan. Fix the P0 items — none of
which are about code — and it becomes fundable._

# 22 · Competitive Analysis & Positioning

_Status: Draft · Owner: Product · Last updated: 2026-07-22 · Added per [CTO Review](../Review/CTO_Review.md) §8_

The review's blunt point: **"better optimization + a preference profile" is a real but narrow
wedge against free, fast, broad incumbents that are themselves adding AI.** A production blueprint
has to state honestly who we beat, where, and why — and where we don't.

## 1. The landscape

| Player | What it is | Strengths | Weaknesses we can exploit |
|---|---|---|---|
| **Google Flights** | Free metasearch, vast inventory, extremely fast, adding AI | Speed, coverage, brand, zero cost, calendar/flexible views | Optimizes for *the query*, not *the traveler*; no durable preference memory; no personalized value model; incentives tied to ads/Google ecosystem |
| **Skyscanner / Kayak** | Metasearch + some flexibility ("everywhere", month view) | Coverage, flexible search, mobile | Price/duration sorting, not personalized TTV; shallow personalization; ad-driven |
| **Hopper** | Price prediction + "watch/wait", mobile-first | Prediction, notifications, booking, big mobile base | Prediction ≠ personalized optimization; consumer-trust debates; limited explainability |
| **Airline .com** | Direct booking | Best own-fare + ancillaries + loyalty | Single-carrier; no cross-carrier optimization |
| **OTAs (Expedia/Booking)** | Book flights + packages | Inventory, packaging, scale | Conversion-optimized, not traveler-value-optimized; upsell incentives |
| **TMCs / corporate (Amex GBT, Navan)** | Managed business travel | Policy, expense, support | Enterprise-only; weak consumer-grade optimization/UX — a B2B opening for our engine |

## 2. Where we genuinely differ (defensible)
1. **Personalized Total Trip Value**, not price/duration sorting — money, time, comfort, risk, and
   preference fit in one commensurable score, with the ancillaries (bags/seat) priced *in* up
   front. Incumbents sort; we *decide for you*.
2. **Durable Preference Profile** — the system remembers and improves. This is the switching-cost
   moat (once seeded — hence cold-start onboarding, FR-12a).
3. **Explainability** — grounded "why this trip for you", which ad-driven metasearch has no
   incentive to build well.
4. **Incentive alignment** — subscription/B2B, not "earn more when you pay more" (GTM doc). A
   trust position incumbents structurally can't copy.

## 3. Where we are *weaker* (say it plainly)
- **Speed & coverage**: Google is faster and broader. We won't win a raw-inventory or raw-latency
  race (hence async-first honesty, [ADR-0008](../architecture/adr/0008-async-first-search.md)).
- **Cost to user**: they're free; we may need subscription for the economics (unproven WTP,
  review §8).
- **Cold-start**: our advantage is weak until the profile is rich — a real early-adoption gap
  (mitigated by FR-12a, still a risk).
- **Distribution**: incumbents own the demand; our SEO/content wedge is slower and increasingly
  contested (review §8).

## 4. Honest strategic conclusion
Competing head-on with Google Flights on general flight search is a **wide, well-defended front**.
Two lower-risk framings the review pushed, both retained here as live options:

- **Narrow the consumer wedge** to a segment where personalized TTV is sharply valuable and
  incumbents are weak: e.g. **complex/flexible trips**, **frequent travelers with strong
  preferences**, or a **points/award value** angle (reconcile with GTM — that base is named but
  under-served today).
- **Lead with B2B/API** ([ADR-0010](../architecture/adr/0010-b2b-track-in-parallel.md)): sell the
  optimization engine to OTAs/TMCs/super-apps who bring their own inventory and users — turning
  our weakness (distribution + inventory access) into someone else's solved problem, and
  monetizing the one thing that's genuinely ours: the engine.

## 5. Positioning statement (working)
> *For travelers who want the best trip, not just the cheapest flight — Hiddenwing is the travel
> optimizer that learns what you value and finds the trip that maximizes it, and tells you why.*
> Unlike metasearch that sorts a query, we decide for a person.

## 6. What this means for the build
- Don't try to out-cover or out-speed Google — win on **value, memory, and explanation**.
- Treat **cold-start** and **a narrow beachhead segment** as first-class, not afterthoughts.
- Keep the **B2B option open from day one** — it may be the real business.

_Tracked risks from this analysis live in the [Risk Register](../Review/risk-register.md)._

# 01 · Product Vision

_Status: Draft · Owner: Product · Last updated: 2026-07-22_

> **🏠 We're starting family-first.** This vision describes the full "Scale Edition". The **active
> build is the [Family Edition](../FAMILY-EDITION.md)** — the same product for 2–10 people at
> ≈ $0–15/month. The vision and principles below still guide it; the scale, business, and
> compliance parts apply only if/when we grow it into a public product.

## 1. The problem

Booking travel is a search problem pretending to be a decision problem. Every existing tool —
Google Flights, Skyscanner, Kayak, airline sites — answers *"what flights match these exact
inputs?"* The traveler is left to do the hard part themselves: try dozens of date/airport
combinations, weigh a $60 saving against a 4-hour layover, remember that they hate red-eyes,
guess whether a bag is included, and decide whether a cheaper split-ticket is worth the risk.

The optimal trip is almost never the one the traveler literally typed. It's hiding one airport
over, two days earlier, on an airline they forgot they preferred.

## 2. The vision

> **FlightAI finds the *best trip for you*, not the cheapest flight matching your query.**

We treat travel as a **constrained optimization problem** over a single objective —
**Total Trip Value (TTV)** — that captures what a traveler actually cares about: money, time,
comfort, risk, and personal preference. We use AI to *understand the traveler* and *explain the
trade-offs*, and deterministic systems to *guarantee the prices and rankings are correct*.

## 3. What makes us different

| Everyone else | FlightAI |
|---|---|
| Matches exact inputs | Explores the flexibility space (dates, nearby airports, split tickets) |
| Sorts by price or duration | Ranks by personalized Total Trip Value |
| Forgets you between sessions | Learns and reuses a durable Preference Profile |
| Shows results | Explains *why* this is the right trip for *you* |
| Bag/seat costs hidden until checkout | Ancillaries priced into the ranking up front |

## 4. Principles (non-negotiable)

1. **AI understands; deterministic systems decide.** LLMs extract preferences and explain
   results. They never invent prices, availability, or rankings. (See
   [AI Strategy](../architecture/10-ai-strategy.md).)
2. **Prices come from reliable providers and are re-validated before booking.** No cached or
   estimated price is ever presented as bookable without a live check.
3. **Personalization is a feature, not surveillance.** We store the minimum needed, with a
   clear lawful basis. (See [GDPR & Privacy](../security/16-gdpr-and-privacy.md).)
4. **Explainability is a first-class output.** A recommendation the traveler can't understand
   is a failure, even if it's optimal.

## 5. Target users (initial)

- **The optimizing leisure traveler** — flexible on dates/airports, wants the best value, hates
  the manual grid-search. *Primary wedge.*
- **The frequent solo business traveler** — values time and comfort over raw price, has strong
  airline/seat preferences worth remembering.
- **Later:** families (complex multi-pax constraints), digital nomads (multi-city), SMB travel.

## 6. North-star metric

> **Revised per [CTO Review](../Review/CTO_Review.md) §2 (2026-07-22).** The original definition —
> `TTV(recommended) − TTV(what they would have booked unaided)` — is **unobservable**: we can't
> measure the counterfactual of what a user would have booked without us. Replaced with observable
> proxies.

**North star: Realized Traveler Value per booked trip**, measured via observable proxies:
- `TTV(recommended) − TTV(their literal query)` — the value our flexibility search adds over what
  they asked for.
- `TTV(chosen) − TTV(cheapest)` — evidence users pick our *value* pick over the raw-cheapest one
  (the whole thesis).
- **Holdout experiments**: compare booking outcomes / satisfaction between users who get the
  optimizer and a control that gets a plain literal-query sort — the closest we can get to the
  true counterfactual, and it's actually measurable.

This still aligns the company with the user — we win only when we make trips measurably better —
but every term can be computed from data we hold.

Supporting metrics: search→shortlist rate, shortlist→booking-handoff rate, preference-profile
adoption, repeat-search rate, and (review §3) **live re-validation price-change rate** as a
trust/UX guardrail.

## 7. What we are explicitly NOT building (initially)

- A metasearch clone that competes on inventory breadth.
- A full booking/PNR/ticketing back office (MVP hands off to providers; see
  [MVP Roadmap](18-mvp-roadmap.md)).
- Hotels, cars, or full trip packaging (future — see [Future Roadmap](19-future-roadmap.md)).
- An AI that books autonomously without explicit user confirmation.

## 8. Three-year picture

A traveler says, in their own words, *"I want to be in Lisbon for a long weekend in October,
cheap-ish but I'll pay for comfort, no red-eyes, and I hate Ryanair."* FlightAI returns three
explained options ranked by *their* definition of value, each with bags and seats already
accounted for, each one-click to book — and remembers all of it next time.

---
### Open questions
- Booking model: affiliate/deep-link vs. becoming an IATA-accredited seller of travel (OTA)? Drives economics — see [Business Model](02-business-model-gtm.md) and ADR-0003.
- B2C first, or B2B2C (embed the optimizer in existing OTAs/TMCs)?

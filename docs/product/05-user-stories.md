# 05 · User Stories

_Status: Draft · Owner: Product · Last updated: 2026-07-22_

Format: _As a **role**, I want **capability**, so that **outcome**._ Each story lists acceptance
criteria (AC) and the functional requirements it exercises (see
[03-functional-requirements](03-functional-requirements.md)).

## Personas
- **Maya — Optimizing leisure traveler.** Flexible on dates/airports, wants best value, hates
  manual grid-search. *Primary.*
- **Dan — Frequent business traveler.** Values time & comfort, strong airline/seat preferences,
  wants them remembered.
- **Priya — Returning power user.** Has a rich Preference Profile, monitors prices, rebooks.

---

## Epic A — Natural-language planning

**US-A1** _As Maya, I want to describe my trip in my own words, so that I don't have to fill a
long form._
- AC: Free text yields origin/destination/date-range/pax/flexibility + profile deltas. (FR-1,4)
- AC: If the return date is missing, I'm asked exactly one clarifying question. (FR-3)
- AC: I can switch to the structured form and get identical results. (FR-2)

**US-A2** _As Dan, I want to say "not United, aisle seat, I'll pay for comfort" and have it
stick, so that I never re-enter it._
- AC: Statement updates my Preference Profile; I can review the inferred changes. (FR-10,12)
- AC: "not United" becomes a hard constraint; "comfort" raises my value-of-time. (FR-10,14)

## Epic B — Flexibility & optimization

**US-B1** _As Maya, I want the system to try nearby airports and ± a few days, so that I get a
better deal than my literal search._
- AC: Results include solutions from a date grid and alternate airports. (FR-5,6)
- AC: Each result shows the delta vs. my literal query. (FR-18)

**US-B2** _As Maya, I want cheaper split-ticket options flagged with their risk, so that I can
decide knowingly._
- AC: Split tickets appear labeled with missed-connection risk. (FR-7)
- AC: I can hide them with one toggle. (FR-7)

**US-B3** _As Dan, I want results ranked by *my* definition of value, not just price, so that a
$40 saving never costs me 4 hours._
- AC: Ranking uses TTV with my value-of-time and comfort weights. (FR-14,15)
- AC: Bags/seat I always buy are priced into the ranking. (FR-16)
- AC: "Cheapest / fastest / best value" anchors are shown for comparison. (FR-17)

## Epic C — Explanation & trust

**US-C1** _As Maya, I want to know *why* the top pick is recommended, so that I trust it._
- AC: Each recommendation has a plain-language, grounded explanation. (FR-19)
- AC: Explanation references only real attributes of that solution — no invented facts. (NFR-24)

**US-C2** _As Dan, I want to ask "why not the nonstop?", so that I can sanity-check the ranking._
- AC: Follow-up answered from system data (e.g. "nonstop is €180 more; exceeds your value-of-
  time break-even"). (FR-20)

## Epic D — Pricing integrity & booking

**US-D1** _As any traveler, I want the price I click to be the price I pay, so that I trust the
platform._
- AC: Price re-validated live before handoff; if it changed, I'm re-quoted before proceeding.
  (FR-21, NFR-12)
- AC: Cached/estimated prices are visibly labeled. (FR-21)

**US-D2** _As any traveler, I want to complete my booking smoothly, so that the plan becomes a
trip._
- AC: One click hands off to the provider/airline with the itinerary pre-filled. (FR-22)

## Epic E — Personalization lifecycle

**US-E0 — Cold start** _As a brand-new user, I want to get good recommendations on my very first
search, so that I don't abandon before the profile has learned anything._ _(Added per review §1.)_
- AC: A skippable <1-minute onboarding (a few questions or an archetype pick) seeds a usable
  Preference Profile. (FR-12a)
- AC: If skipped, sensible defaults apply and results are still better than a bare price-sort.
- AC: I can refine everything later (links to US-E1).

**US-E1** _As Priya, I want to see and edit everything the system knows about my preferences, so
that I stay in control._
- AC: I can view, edit, export, and delete my profile. (FR-13, NFR-17)

**US-E2** _As any traveler, I want to control what's used for personalization vs. marketing, so
that my consent is respected._
- AC: Independent, revocable consent toggles; revocation takes effect immediately. (FR-28)

## Epic F — Monitoring

**US-F1** _As Priya, I want to save a search and be alerted when the price drops, so that I book
at the right moment._
- AC: Saved search monitors price; alert fires below my threshold. (FR-24)
- AC: (Subscription) fare-drop rebooking suggestions for a planned trip. (FR-25)

**US-F2 — Disruption alert** _As any traveler with a planned trip, I want to be told when my
flight's schedule changes or is cancelled, so that I'm not caught out._ _(Added per review §1.)_
- AC: Schedule changes/delays/cancellations on a saved trip trigger a notification. (FR-25a)
- AC: MVP notifies (detection only); rebooking assistance is a later phase — the notification says
  what changed and points to next steps.

## Epic G — Resilience (implicit but critical)

**US-G1** _As any traveler, I want useful results even when a provider is down, so that the app
never feels broken._
- AC: If a provider fails, results come from the others + cache, with freshness labeled.
  (NFR-11)

## Epic H — Internal / admin

**US-H1** _As an operator, I want to see provider health and force failover, so that I can
protect the search experience._
- AC: Dashboard shows per-provider latency/error/cost; manual failover available. (FR-29,30)

**US-H2** _As a compliance officer, I want an audit trail of price-affecting actions, so that we
can investigate any discrepancy._
- AC: Immutable audit log of quotes, re-validations, and handoffs. (FR-31, NFR-12)

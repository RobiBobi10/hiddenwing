# 03 · Functional Requirements

_Status: Draft · Owner: Product · Last updated: 2026-07-22_

Requirements use MoSCoW priority: **M**ust / **S**hould / **C**ould / **W**on't-yet.
IDs are stable references (`FR-x`). Acceptance criteria are in [User Stories](05-user-stories.md).

> **Updated 2026-07-22 per [CTO Review](../Review/CTO_Review.md) §1** — added the missing
> features the review identified (cold-start onboarding, disruption detection, fraud/attribution)
> and made scoping limits (group travel) explicit rather than silent. See §10–§12 below.

## 1. Natural-language trip intake
- **FR-1 (M)** Accept a free-text trip request ("cheap-ish long weekend in Lisbon in October,
  no red-eyes, not Ryanair") and convert it to a structured query + Preference Profile deltas.
- **FR-2 (M)** Support a structured form as an equal alternative path (origin, destination,
  dates, pax, cabin, flexibility ranges). AI is optional, never required.
- **FR-3 (M)** Ask clarifying questions only when a constraint is genuinely ambiguous (missing
  return date, unclear "cheap") — at most one round.
- **FR-4 (S)** Detect and normalize entities: city→airports, relative dates→absolute, fuzzy
  airlines→carrier codes.

## 2. Flexibility & search space
- **FR-5 (M)** Search a **date grid** around requested dates (± configurable days).
- **FR-6 (M)** Search **nearby/alternate airports** within a radius (origin and destination).
- **FR-7 (S)** Evaluate **split-ticket** itineraries and label their missed-connection risk.
- **FR-8 (S)** Support **one-way, round-trip, and multi-city**; open-jaw where providers allow.
- **FR-9 (C)** "Anywhere / surprise me" mode: destination-flexible search under a budget.

## 3. Preferences & personalization
- **FR-10 (M)** Maintain a versioned **Preference Profile** per user: value-of-time rate,
  cabin, hard constraints (airlines/times to avoid), soft preferences (alliances, seats).
- **FR-11 (M)** Apply the profile automatically to every search; allow per-search overrides.
- **FR-12 (S)** Learn preferences implicitly from choices (with consent) and let the user
  review/edit everything the system inferred.
- **FR-13 (M)** Let users view, edit, export, and delete their profile (GDPR — see
  [16-gdpr](../security/16-gdpr-and-privacy.md)).
- **FR-12a (M) — Cold-start onboarding.** _(Added per review §1.)_ On first use, seed a usable
  Preference Profile in under a minute via a short guided flow (a few high-signal questions and/or
  traveler archetypes) so TTV isn't a bare price-sort for new users. Without this, the
  personalization moat is empty on day one and the product degrades to "Google with extra
  latency". Skippable, with sensible defaults if skipped.

## 4. Optimization & ranking
- **FR-14 (M)** Score every candidate Trip Solution by **Total Trip Value** combining price,
  time cost, comfort, risk, and preference-fit.
- **FR-15 (M)** Compute a deterministic **Comfort Score** (cabin, layover, red-eye, aircraft,
  on-time record).
- **FR-16 (M)** Price **ancillaries** (bags, seat) into ranking when the profile implies them.
- **FR-17 (M)** Return a ranked shortlist (default 3–5) plus "cheapest", "fastest", "best
  value" anchors for comparison.
- **FR-18 (S)** Show the delta vs. the user's literal query ("€72 cheaper, 3h shorter than what
  you searched").

## 5. Explanation
- **FR-19 (M)** For each recommendation, produce a plain-language explanation of *why* it ranks
  where it does, grounded strictly in the solution's real attributes.
- **FR-20 (S)** Support follow-up questions on results ("why not the nonstop?") answered from
  system data only.

## 6. Pricing integrity & booking handoff
- **FR-21 (M)** Every displayed bookable price is either live or clearly marked as an
  estimate/cached; **re-validate live before any booking handoff**.
- **FR-22 (M)** Hand off to the provider/airline to complete booking (deep-link, MVP).
- **FR-22a (M) — Attribution & fraud-safe handoff.** _(Added per review §1/§6.)_ Handoff
  deep-links are **signed/validated** (no open-redirect), carry correct affiliate attribution,
  and are protected against click fraud (the affiliate revenue line depends on clean
  attribution). See [Security §9/§12](../security/15-security-architecture.md).
- **FR-23 (C)** In-platform booking, itinerary storage, and change/cancel (post-accreditation).

## 7. Monitoring & alerts
- **FR-24 (S)** Save a search and monitor price; alert on drops below a threshold.
- **FR-25 (C)** Fare-drop **rebooking** suggestions for already-planned trips.
- **FR-25a (S) — Disruption/IROPS detection.** _(Added per review §1.)_ For saved/planned trips,
  detect schedule changes, delays, and cancellations and notify the traveler. MVP scope is
  **detection + notification** only (full rebooking assistance is Phase 3, see
  [Future Roadmap](19-future-roadmap.md)); even detection is a genuine differentiator over
  metasearch, which forgets you after the search.

## 8. Accounts & history
- **FR-26 (M)** Auth: email/OAuth sign-in; guest search allowed, profile requires an account.
- **FR-27 (S)** Search history and saved trips per user.
- **FR-28 (M)** Consent management for personalization and marketing, independently toggleable.

## 9. Admin / internal
- **FR-29 (M)** Provider health dashboard and manual failover controls.
- **FR-30 (S)** Feature flags for search parameters (grid size, radius, provider mix).
- **FR-31 (M)** Full audit log of price-affecting operations and booking handoffs.

## 10. Explicit scope limits (stated, not silent — review §1)
Naming these prevents them being mistaken for oversights:
- **Group / multi-passenger optimization is limited.** MVP optimizes for a single traveler's
  profile applied to all passengers. True multi-pax optimization (different preferences per
  traveler, seat-together constraints) is deferred; the FRs above assume one profile per search.
- **Split-ticket carries traveler-borne risk.** Where split tickets are offered (FR-7), the
  missed-connection risk is the traveler's (no through-fare protection). MVP must **disclose this
  explicitly** at the point of choice, or exclude split tickets until the disclosure/UX is solid
  (see [Optimization §5](../architecture/12-flight-search-optimization.md), review §3).
- **Booking is a handoff, not in-platform** (MVP) — see [ADR-0003](../architecture/adr/0003-affiliate-first-booking-model.md).

## Traceability
Each FR maps to one or more user stories (05) and is covered by tests per the
[Testing Strategy](../operations/17-testing-strategy.md). NFRs constraining these live in
[04-non-functional-requirements](04-non-functional-requirements.md).

# Glossary

Canonical definitions. If a term is used in more than one doc, it is defined **here** and only here.

| Term | Definition |
|------|------------|
| **Total Trip Value (TTV)** | The single scalar FlightAI optimizes. A weighted utility score combining monetary cost, time cost, comfort, risk, and preference-fit for a specific traveler. See [Flight Search Optimization](architecture/12-flight-search-optimization.md). |
| **Trip Solution** | A complete, bookable itinerary (one or more flight segments, optionally + ancillaries) evaluated as a single candidate. Not a "flight" — a solution may span multiple airports/dates. |
| **Flexibility** | The degree to which a traveler's constraints (dates, airports, airlines) can move. Expressed as ranges, not fixed values (e.g. depart ±3 days, any airport within 100 km of NYC). |
| **Flexibility Search** | Exploring the constraint space (date grid, nearby airports, split tickets) to find lower-TTV solutions the traveler didn't explicitly ask for. |
| **Comfort Score** | A deterministic 0–100 score per solution derived from measurable factors: cabin, seat pitch, layover length/quality, red-eye penalty, aircraft type, on-time record. Not AI-generated. |
| **Preference Profile** | The structured, versioned set of a traveler's weights and hard/soft constraints (e.g. "never Spirit", "aisle seat", "value time at $40/hr"). Extracted by AI, stored deterministically. |
| **Hard Constraint** | A rule that eliminates a solution entirely (e.g. "must arrive before 18:00", "no red-eyes"). |
| **Soft Constraint / Preference** | A rule that adjusts a solution's TTV but does not eliminate it (e.g. "prefer Star Alliance"). |
| **Time Cost** | The monetary value assigned to travel time (duration, layovers, red-eye fatigue) using the traveler's value-of-time rate. |
| **Split Ticket** | An itinerary booked as two or more separate tickets rather than one through-fare, often cheaper but carrying missed-connection risk. |
| **Provider** | An upstream source of flight pricing/availability: a GDS (Amadeus, Sabre), an airline NDC feed, or an aggregator (Duffel, Kiwi). See [Data Providers](architecture/13-data-providers.md). |
| **GDS** | Global Distribution System — legacy inventory/pricing networks (Amadeus, Sabre, Travelport). |
| **NDC** | New Distribution Capability — the IATA XML standard letting airlines distribute richer content/ancillaries directly. |
| **Ancillary** | A non-fare product: bags, seat selection, priority boarding, lounge, etc. Material to TTV. |
| **Fare Cache** | A short-TTL store of recently seen prices used to reduce provider calls. Prices are always **re-validated** before booking. |
| **Live Price** | A price confirmed against the provider at request time (not from cache). Required before any booking action. |
| **Booking Handoff** | The point where FlightAI transfers the user to complete a purchase (affiliate deep-link in MVP; in-platform booking later). |
| **Optimization Engine** | The deterministic service that scores and ranks Trip Solutions by TTV. Contains no LLM calls in the scoring path. |
| **Planner (AI)** | The LLM-driven layer that turns natural language into a Preference Profile + structured query, and explains results. Never sets prices. |
| **Grounding** | Constraining LLM output to verified system data (prices, times, rules) so it cannot fabricate. See [AI Safety & Evaluation](architecture/11-ai-safety-and-evaluation.md). |
| **Eval Harness** | The offline+online test suite measuring AI quality (grounding, preference-extraction accuracy, explanation faithfulness). |
| **Error Budget** | The allowed amount of unreliability for an SLO within a window; drives release gating. See [Observability & SLOs](operations/21-observability-and-slos.md). |

---
_Status: Draft · Owner: Architecture · Last updated: 2026-07-22_

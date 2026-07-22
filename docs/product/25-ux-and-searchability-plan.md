# 25 · UX & Searchability Staging Plan

_Status: Draft · Owner: Product / Frontend · Last updated: 2026-07-22_

Answers a direct question: **when do we make the UI genuinely nice** — real searchability (no raw
airport codes), self-explanatory places/airports/airlines, durations, maps, distances, and a polished
experience on every device?

The short answer: **some is already done, the big polish is deliberately staged for M6, and the one
thing worth pulling forward is airport/place autocomplete.** Here's the reasoning and the map.

## 1. Guiding principle — why we don't "make it pretty" now

The screen changes a lot over the next three milestones: M3 adds value scores and breakdowns, M4
adds an AI chat box and explanations, M5 adds preference controls and flexible-date/airport pickers.
**Polishing the UI before those exist means re-polishing it three times.** So we do a single,
focused polish pass at **M6**, once the app knows everything it needs to display. The one exception
is anything that's a *hard blocker to a family member actually using it* — that we pull forward.

## 2. What's already nice (shipped in M2)
- **Human-readable airline names** ("British Airways", not "BA").
- **Formatted durations** ("7h 58m") and **stops** ("Direct", "1 stop").
- **Readable cabin** and **baggage** ("economy · 1 checked bag").
- Clean, dark, legible result cards.

## 3. The one thing worth pulling forward — airport/place search

**The problem:** today you type raw IATA codes (`LHR`, `JFK`). No family member knows those. This is
the single biggest usability blocker, and it's cheap to fix.

**Two solutions, both on the roadmap:**
- **Airport/place autocomplete** — type "London" → pick "London Heathrow (LHR)". Duffel exposes a
  Places suggestions endpoint, so this is a small, deterministic feature. **Recommendation: add it as
  a light pass at the start of M4 (or a small M3.5)**, because it unblocks real use and M5's
  nearby-airport feature needs the same place data anyway.
- **AI natural-language intake (M4)** — "cheap flights from London to New York in September" → Claude
  fills the structured search. This is the *ultimate* searchability and is already M4.

Together these mean: after M4, nobody has to know an airport code again.

## 4. Full map — feature → milestone → why

| UX capability | Lands in | Why then |
|---|---|---|
| Readable airlines, durations, stops, cabin, bags | ✅ **M2 (done)** | Fell out of normalization for free |
| Value badges, "why this ranked here" reasons, cheapest/fastest/best-value tags | **M3 (now)** | They *are* the optimization output |
| **Airport/place autocomplete** (names, cities) | **M4 start (pull-forward)** | Biggest usability blocker; cheap; M5 reuses the place data |
| Natural-language search ("London to NYC in Sept") | **M4** | The AI layer's core intake |
| Conversational, plain-language explanations of the ranking | **M4** | Narrates M3's deterministic breakdown |
| Preference controls (hard/soft: "no red-eyes", "arrive by 18:00", "never Spirit") | **M5** | Needs the profile model M5 introduces |
| Nearby-airport & flexible-date pickers (± days, map of options) | **M5** | Part of flexibility search |
| Country / city names & flags, airline logos | **M6** | Pure presentation polish; cheap once data model is stable |
| **Route maps & great-circle distances** | **M6** | Nice-to-have visualization; no decision value, so last |
| **Full responsive / all-device optimization** (mobile, tablet, desktop) | **M6** | Do it once, when the final set of screens exists |
| Loading/empty/error states, skeletons, sorting & filtering controls | **M6** | The dedicated polish-and-launch pass |
| Accessibility pass (keyboard, contrast, screen-reader) | **M6** | Same reason — one thorough pass near launch |

## 5. Bottom line
- **Now (M3):** make it *smart* (value ranking + reasons). Presentation stays functional.
- **M4:** make it *effortless to search* (autocomplete + natural language) and *explained*.
- **M5:** make it *personal and flexible* (profiles, nearby airports, flexible dates).
- **M6:** make it *beautiful and universal* (visual polish, logos/flags, maps, distances, fully
  responsive, accessible) — the single polish pass, right before real family use.

If at any point you want family members using it *before* M6, the minimum to make that pleasant is:
airport autocomplete (M4 pull-forward) + a basic responsive check. Everything else is upside.

_Tracked against the [Development Roadmap](../implementation/development-roadmap.md)._

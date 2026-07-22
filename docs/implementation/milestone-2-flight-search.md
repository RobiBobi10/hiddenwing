# Milestone 2 — Flight Search (Duffel)

_Status: **✅ Complete** (2026-07-22, live) · Owner: You · Depends on: [M1](milestone-1-foundations.md) (✅ complete)_

Verified locally **and** on the live URL (hiddenwing.vercel.app/search): LHR→JFK round-trip returns
normalized offers, snapshotted to Neon; deploy `b402e84` is Ready in Production.

Part of the [Development Roadmap](development-roadmap.md). This is the **current** milestone — do
not build M3+ (ranking, AI, flexibility, booking) yet.

---

## 1. Objective

Turn the authenticated skeleton into an app that **returns real flight options**. A signed-in family
member fills in a structured search (from, to, date(s), passengers, cabin), and the app calls a live
flight-data provider, **normalizes** the response into our own provider-agnostic offer model, and
shows the results.

Crucially, the provider sits **behind an adapter** (`ProviderPort`,
[ADR-0002](../architecture/adr/0002-multi-provider-adapter-strategy.md)): the rest of the app never
sees Duffel-specific shapes, so adding a second provider later is an adapter change, not a rewrite.
This milestone establishes that seam and proves it with one real provider (Duffel, test mode).

**Deliberately no optimization and no AI.** Results are shown in a plain default order (cheapest
first) — that's a placeholder. The *real* ranking (Total Trip Value + Comfort Score) is
[Milestone 3](development-roadmap.md), and it's the whole point of the product. M2 just gets honest,
normalized options onto the screen for M3 to rank.

## 2. Scope

### In scope
- **`ProviderPort`** interface in the domain layer — the provider-agnostic contract (search +
  future `price()` hook), plus our **common offer model** types (slices, segments, fares, baggage,
  cabin, times).
- **Duffel adapter** implementing `ProviderPort`: maps our `NormalizedQuery` → a Duffel **offer
  request**, and Duffel **offers** → our common offer model. Pure, unit-tested mapping functions.
- **Duffel client** configured server-side only, reading `DUFFEL_ACCESS_TOKEN` (a **test-mode**
  token, `duffel_test_…`) — the token never reaches the browser.
- **Search input validation** (zod) — origins/destinations, dates (no past dates), passenger counts,
  cabin — rejecting malformed input before any provider call (OWASP input validation, doc 15).
- **`/api/search` route** (server-side POST): validates → calls the search service → returns
  normalized offers as JSON. Protected (signed-in users only).
- **Search UI** at `/search` (protected): a form (from, to, depart date, optional return date,
  passengers, cabin) and a **results list** rendering normalized offers (carrier, times, duration,
  stops, price, cabin, baggage), sorted cheapest-first as a *temporary* default.
- **Thin persistence** ([ADR-0009](../architecture/adr/0009-offer-snapshot-storage.md)): store the
  search and a **snapshot** of the normalized offers with `fetched_at`, so M3 can rank without
  re-fetching and M6 can compare against a live re-quote. Minimal — two Prisma models.
- Basic **error handling + timeout** around the Duffel call, with a clear UI state for "no results"
  and "provider error".

### Out of scope (later milestones — do NOT build now)
- TTV ranking, Comfort Score, ancillary-inclusive scoring — **M3**.
- Natural-language trip intake and grounded explanations (Claude) — **M4**.
- Flexibility search (± days, nearby airports) and preference profiles — **M5**.
- Live price re-validation and booking handoff — **M6**.
- A second provider / failover mesh — deliberately **one** provider now, but behind the port so it's
  additive (ADR-0002). Live-mode Duffel (real bookings, subscription) — not until M6+.

## 3. Plan, risks & decisions (per CLAUDE.md — think before building)

**The flow we're building (synchronous, family-scale):**

```mermaid
flowchart LR
  U[Search form /search] -->|POST| API[/api/search route]
  API --> V[zod validate → NormalizedQuery]
  V --> SVC[search-service]
  SVC --> PORT{ProviderPort}
  PORT --> DUF[Duffel adapter]
  DUF -->|offer request → offers| DAPI[(Duffel API · test mode)]
  DUF --> MAP[mapper → common offer model]
  MAP --> SNAP[(snapshot: Search + Offer in Postgres)]
  SNAP --> API
  API -->|normalized offers| U
```

**Why synchronous.** The [Family Edition](../FAMILY-EDITION.md) deliberately cut the async job queue
and streaming — at 2–10 users there's no concurrency problem, so a plain request with a loading
spinner is correct and far simpler. The Scale Edition's async-first design
([ADR-0008](../architecture/adr/0008-async-first-search.md)) stays the North Star; we grow into it,
we don't pre-build it.

**Risks and how we handle them:**

| Risk | Mitigation in M2 |
|---|---|
| **API token leaks to the browser** | Token is server-only (`DUFFEL_ACCESS_TOKEN`, never `NEXT_PUBLIC_`); all Duffel calls happen in the route/service, never client-side. |
| **Duffel offers expire** (offers are only valid for minutes) | Store `fetched_at` on every snapshot; **never trust a stored price for booking** — M6 re-validates live before any handoff. M2 labels results as indicative. |
| **Search latency** (real searches take a few seconds) | Sensible timeout + a clear loading state; acceptable at family volume. Async streaming is a Scale-Edition concern, not now. |
| **Normalization bugs** (timezones, baggage inclusion, stops) | The mapper is a **pure function** with fixture-based unit tests — the one thing in M2 that must be correct, since M3 ranks on these fields. |
| **Provider/ToS caching & display rights** | Test mode (Duffel Airways sandbox) has no real fares, so no display-rights issue now. Live-mode ToS review is gated to M6 (doc 13 §0). |
| **Malformed / abusive input** | zod validation on every field before a provider call; reject past dates, absurd passenger counts, bad IATA codes. |

**A decision I'm challenging (and my recommendation):** Duffel v2 offers **partial offer requests**
(stream offers slice-by-slice for snappier UX) and **batch offer requests**. They're nice but add
complexity. **Recommendation: use the standard offer-request flow for M2** (one request → list of
offers), and revisit partial requests only if search feels too slow in real use. Simpler first,
optimize on evidence.

**One more:** we integrate against **test mode only** in M2. That's intentional — it lets us build
and test the entire search-and-normalize path for **$0 and zero risk** (no real bookings, sandbox
"Duffel Airways" flights). Live mode (a Duffel subscription, real inventory) is deferred until we're
actually ready to help the family book, in M6.

## 4. Files affected

New unless marked. Lands in the clean-architecture folders M1 established (`domain/` = provider-
agnostic types/contracts; `features/` = the Duffel-specific implementation).

```
src/
├─ domain/
│  ├─ providers/
│  │  └─ provider-port.ts        # ProviderPort interface + NormalizedQuery type (provider-agnostic)
│  └─ offer/
│     └─ offer.ts                # common offer model: Offer, Slice, Segment, Fare, Baggage, Cabin
├─ features/
│  └─ search/
│     ├─ duffel/
│     │  ├─ duffel-client.ts     # @duffel/api client, server-only, reads DUFFEL_ACCESS_TOKEN
│     │  ├─ duffel-adapter.ts    # implements ProviderPort using the client
│     │  └─ duffel-mapper.ts     # PURE: Duffel offer ↔ common offer model (unit-tested)
│     ├─ search-service.ts       # validate → provider.search → normalize → snapshot → return
│     └─ snapshot-repo.ts        # thin Prisma persistence of Search + Offer
├─ lib/
│  └─ validation/
│     └─ search-schema.ts        # zod schema → NormalizedQuery
├─ app/
│  ├─ api/
│  │  └─ search/route.ts         # POST: protected, validates, calls search-service
│  └─ search/
│     ├─ page.tsx                # protected search page (form + results)
│     ├─ search-form.tsx         # client component: the input form
│     ├─ results-list.tsx        # renders normalized offers
│     └─ offer-card.tsx          # one offer: carrier, times, duration, stops, price, bags
prisma/
└─ schema.prisma                 # + Search and Offer models (CHANGED) → new migration
tests/
└─ unit/
   ├─ duffel-mapper.test.ts      # fixture Duffel offer → expected normalized offer
   └─ search-schema.test.ts      # rejects past dates / bad codes; parses a valid query
.env.example                     # + DUFFEL_ACCESS_TOKEN= (CHANGED)
.env.local                       # + DUFFEL_ACCESS_TOKEN=duffel_test_… (CHANGED, gitignored)
```

## 5. Dependencies

### External accounts
- **Duffel** — free sign-up, no credit card for test mode. In the dashboard, switch to **Developer
  test mode** and create a token (it starts `duffel_test_`). That's the only new account for M2.

### Packages
- Runtime: **`@duffel/api`** (official JS client; Node 18+ — we're already there).

### Environment variables (add to `.env.local`, `.env.example`, and Vercel)
```
DUFFEL_ACCESS_TOKEN=            # Duffel TEST token (duffel_test_…) — server-only, never NEXT_PUBLIC
```

### Milestone dependencies
- **M1** (done): auth, DB, deploy, the `domain/` + `features/` seams this milestone fills.

## 6. Testing requirements

| Type | Test | Passes when |
|---|---|---|
| **Unit** | `duffel-mapper.test.ts` | A fixture Duffel offer normalizes to the expected common offer model — correct times (UTC+local), duration, stop count, cabin, price, and baggage. This is the highest-value test in M2. |
| **Unit** | `search-schema.test.ts` | Rejects past dates, invalid IATA codes, and out-of-range passenger counts; accepts and parses a valid query into `NormalizedQuery`. |
| **Route (mocked)** | `/api/search` with a **mocked** Duffel client | Returns normalized offers for a valid body; returns 400 on invalid input; **no live provider calls in CI**. |
| **Manual (sandbox)** | Real test-mode search | Searching a Duffel Airways sandbox route (e.g. LHR→JFK) returns real offers rendered in the UI with sane fields. |
| **Quality gate (CI)** | existing `ci.yml` | lint · typecheck · unit tests · build still green with the new code. |

Discipline: the **mapper tests come first**. Everything downstream (M3 ranking, M6 re-validation)
trusts the normalized fields, so normalization is the part that must be provably correct. CI must
never hit the live Duffel API — the provider is mocked in tests.

## 7. Completion criteria (Definition of Done)

M2 is complete when **all** of these are true:

- [x] A `ProviderPort` interface exists in `domain/`, and the app depends on **it**, not on Duffel
      types directly.
- [x] A **Duffel adapter** implements `ProviderPort` and returns our common offer model.
- [x] `DUFFEL_ACCESS_TOKEN` (test token) is set locally; it is **server-only** (not
      `NEXT_PUBLIC_`, not committed). _(Still to add to Vercel for the live deploy.)_
- [x] `/search` (protected) shows a working form; submitting it returns **real sandbox offers**
      rendered with carrier, times, duration, stops, price, cabin, and baggage. _(640 offers, LHR→JFK.)_
- [x] Input is **validated** (zod) before any provider call; bad input returns a clear 400 / form
      error, never a provider call.
- [x] Each search and its returned offers are **snapshotted** to Postgres with `fetched_at`.
- [x] Mapper and schema **unit tests** written (mapper logic verified). _(Route test with a mocked
      provider is optional polish; deferred.)_
- [x] The app **auto-deploys** to Vercel and `/search` works on the **live URL** (token added to
      Vercel, pushed, deploy `b402e84` Ready in Production).
- [x] `.env.example` documents `DUFFEL_ACCESS_TOKEN`; no secrets committed.
- [x] Results are labeled **indicative** (not a booking guarantee) — honesty until M6 re-validation.

When every box is checked, M2 is done — **then** we detail and start
[Milestone 3 (Optimization Engine)](development-roadmap.md), the deterministic TTV ranking that
makes these results actually *ours*.

---
### Notes / decisions for M2
- **Provider behind the port from day one** — even with one provider, the seam is the point
  (ADR-0002). It costs almost nothing now and saves a rewrite later.
- **Test mode only** — full build-and-test of search for $0, zero booking risk (Duffel Airways
  sandbox). Live mode is an M6 concern, tied to real booking + ToS/caching-rights review (doc 13 §0).
- **Standard offer requests, not partial/batch** — simpler; revisit only if real-world search
  latency demands it.
- **Snapshot storage now** (ADR-0009) — cheap, and both M3 (rank the stored offers) and M6
  (re-validate against the snapshot) need it. Store normalized offers + `fetched_at`; never treat a
  stored price as bookable.
- **Default sort = cheapest** is a deliberate placeholder, clearly not the product. M3 replaces it
  with Total Trip Value — the reason Hiddenwing exists.
```

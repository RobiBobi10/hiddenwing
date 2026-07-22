# ADR-0010: Run a B2B/API design-partner track in parallel with the B2C MVP

- **Status:** Proposed
- **Date:** 2026-07-22
- **Deciders:** Founders / Product / Architecture
- **Related:** [Business Model](../../product/02-business-model-gtm.md), [Future Roadmap](../../product/19-future-roadmap.md), [API Strategy §7](../14-api-strategy.md), [CTO Review](../../Review/CTO_Review.md) §8/§9.3

## Context
The review argued the B2B/API business is probably stronger than B2C and is under-prioritized
(buried in Phase 2). Licensing the Optimization Engine attacks the three worst risks at once:
- **Unit economics** — B2B revenue per integration dwarfs thin affiliate margins, with far lower
  CAC.
- **Cold-start** — partners bring their own users/behavior; less dependence on our own profile
  flywheel to be valuable on day one.
- **Inventory access** — partners often bring their **own** provider contracts, partly sidestepping
  our chicken-and-egg access problem (review §1).

The counter-risk is focus: a pre-PMF team doing two go-to-markets can do neither well.

## Options considered
1. **B2C-only, defer B2B to Phase 2 (original)** — focused; but leaves the strongest risk-reducer
   on the shelf and bets everything on the hardest market (competing with free Google Flights).
2. **B2B-first, defer B2C** — best economics/risk profile; but loses the consumer brand/data
   flywheel and the content wedge, and the product surface differs.
3. **B2C MVP + a single B2B design-partner track in parallel** — validate both value hypotheses;
   the Optimization Engine + provider abstraction are shared core, so the marginal cost of one B2B
   partner is bounded.

## Decision (proposed)
Build the B2C MVP **and** sign **one** B2B design partner in parallel, exposing the Optimization
Engine via the partner API surface already envisaged in [doc 14](../14-api-strategy.md). Keep it to
a single partner to protect focus; use it to price-test B2B and de-risk the economics/inventory
story.

## Rationale
The shared core (deterministic engine + adapters) means a *single* B2B partner is a bounded
addition, not a second company. It provides an economic and inventory hedge against the B2C risks
the review highlights, and informs the eventual B2C-vs-B2B emphasis with real signal instead of a
guess.

## Consequences
- Positive: economic + inventory hedge; real B2B pricing signal; leverages the core asset early.
- Negative / accepted: focus cost and some roadmap contention; partner requirements can pull the
  API surface around (mitigated by capping at one partner).
- Revisit trigger: after the partner pilot + B2C beta, decide the primary emphasis (may supersede
  this ADR with a committed B2B-led or B2C-led strategy).

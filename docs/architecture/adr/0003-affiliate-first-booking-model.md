# ADR-0003: Affiliate-first booking, direct accreditation later

- **Status:** Proposed — **BLOCKED pending provider due-diligence** (per [CTO Review](../../Review/CTO_Review.md) §7)
- **Date:** 2026-07-22
- **Deciders:** Founders / Product / Architecture
- **Related:** [Business Model](../../product/02-business-model-gtm.md), [MVP Roadmap](../../product/18-mvp-roadmap.md), [Future Roadmap](../../product/19-future-roadmap.md), [Provider Due-Diligence Spike](../../Review/provider-due-diligence-spike.md)

> **⚠ Gate (added 2026-07-22).** This ADR assumes an affiliate/deep-link handoff is *available*
> and *low-burden*. The review challenges both: some providers (e.g. Duffel) expect you to be the
> seller/agent of record and may not support a pure affiliate handoff, and some jurisdictions
> require seller-of-travel registration even for affiliates. **Do not accept this ADR until the
> [Provider Due-Diligence Spike](../../Review/provider-due-diligence-spike.md) confirms, per
> chosen provider, that affiliate handoff is permitted and the regulatory burden is understood.**
> If it isn't, this ADR must be superseded (e.g. by a "become agent of record" decision).

## Context
How we let users complete a purchase determines regulatory burden, economics, and engineering
scope. Becoming an accredited seller of travel (IATA / seller-of-travel laws) unlocks
distribution margin and ancillary attach but brings PCI scope, ticketing, refunds/IROPS support,
bonding, and compliance overhead. The MVP's job is to *validate the optimization thesis*, not to
run a travel agency.

## Options considered
1. **Direct booking from day one (accredited OTA)** — best economics, full control; heavy
   regulatory/PCI/ops burden, slow, distracting from the core thesis.
2. **Affiliate / deep-link handoff** — hand the validated itinerary to the airline/OTA to
   complete; thin margin but near-zero regulatory burden, fast to launch, no PCI scope.
3. **Hybrid immediately** — both at once; complexity of (1) without focus.

## Decision
Ship **affiliate/deep-link handoff** for MVP and early growth. Revisit direct booking in Phase 3,
gated on proven retention/subscription economics and operational maturity.

## Rationale
Affiliate lets us validate the north-star metric and build the moat (optimization + preference
data) without the OTA compliance drag. Economics are thin, but MVP success is measured in
*validated traveler value*, not revenue; subscription + B2B (GTM doc) carry early monetization.

## Consequences
- Positive: fast launch, minimal regulatory/PCI burden, focus on the core differentiator.
- Negative / accepted: thin per-booking economics; less control over the final booking UX; some
  price-change friction at handoff (mitigated by live re-validation, NFR-12).
- Revisit trigger: subscription + B2B revenue proven, and volume makes distribution margin worth
  the accreditation/ops investment → write a superseding ADR for direct booking.

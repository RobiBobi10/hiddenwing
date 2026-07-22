# 19 · Future Roadmap

_Status: Draft · Owner: Product · Last updated: 2026-07-22_

Horizon planning after MVP validation (see [MVP Roadmap](18-mvp-roadmap.md)). Themes are
sequenced by dependency and by the [Business Model](02-business-model-gtm.md) phases, not fixed
dates. Each theme names what unlocks it.

## Phase 2 (≈ months 6–15) — Depth, retention, monetization

**Richer search space**
- Split-ticket optimization with quantified risk (fast-follow from MVP).
- Multi-city and open-jaw itineraries.
- "Anywhere under €X" destination-flexible discovery — a strong content/virality driver.

**Personalization flywheel**
- Implicit preference learning from choices (consented), with full user review/edit.
- Cross-session memory and proactive suggestions ("your usual NYC trip is €90 below average").

**Monetization**
- **Hiddenwing Plus** subscription: price monitoring, fare-drop rebooking, unlimited flexibility
  searches, priority AI planning. _Unlocks: proven retention + willingness-to-pay from beta._
- **B2B API v1**: license the Optimization Engine to a design-partner OTA/TMC. _Unlocks: stable
  engine + provider abstraction._

**Resilience & scale**
- Full multi-provider mesh with cost-aware routing and richer failover (doc 13).
- Regional data residency (EU/US) hardening (doc 16).

## Phase 3 (≈ months 15–30) — Platform & full trip

**Direct booking (major decision — ADR-0003)**
- IATA / seller-of-travel accreditation, in-platform booking, ticketing, PCI scope, refunds &
  IROPS handling. _Unlocks: distribution margin + ancillary attach; requires ops maturity._

**Beyond flights**
- Ancillary optimization (bags/seats/lounge as first-class TTV levers everywhere).
- Hotels + ground transport → **total trip** optimization (the original vision's endgame).
- Trip packaging where package TTV beats the sum of parts.

**AI depth**
- Conversational multi-turn planning agent (still non-autonomous — books only on explicit
  confirmation).
- Proactive disruption handling: rebooking suggestions during IROPS (delays/cancellations).

## Phase 4 (≈ 30 months+) — Scale-out & ecosystem

- **Super-app / embed strategy**: Hiddenwing optimization inside partner apps (B2B2C at scale).
- **Loyalty & points optimization**: value award vs. cash, multi-program optimization
  (award-travel community is a natural early-adopter base).
- **Corporate travel**: policy-aware optimization, approvals, expense integration.
- **Global expansion**: language, currency, regional providers, local regulation.

## Guardrails that persist across all phases
1. AI never sets prices or books autonomously; deterministic pricing + live re-validation stays
   sacred (docs 10, 11, 12).
2. Incentive alignment: monetization must not reward making the traveler pay more (GTM doc).
3. Privacy-by-design and GDPR compliance scale *with* personalization, not behind it (doc 16).
4. Every architectural leap (booking, hotels, packaging) gets an ADR before code.

## Known big open decisions (tracked as ADRs)
- Become an accredited seller of travel vs. stay affiliate/agent (ADR-0003).
- B2C-led vs. B2B-led growth emphasis.
- Build vs. buy for hotel/ground inventory when expanding beyond flights.

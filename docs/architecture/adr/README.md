# Architecture Decision Records

Immutable log of significant decisions. New decisions get the next number using
[the template](0000-adr-template.md). Superseding is done with a new ADR, never by editing an
Accepted one.

| ADR | Title | Status |
|-----|-------|--------|
| [0001](0001-record-architecture-decisions.md) | Record architecture decisions as ADRs | Accepted |
| [0002](0002-multi-provider-adapter-strategy.md) | Multi-provider via adapter pattern | Accepted |
| [0003](0003-affiliate-first-booking-model.md) | Affiliate-first booking, accreditation later | Proposed — **blocked on due-diligence** |
| [0004](0004-modular-monolith-first.md) | Modular monolith first, extract services later | Accepted |
| [0005](0005-postgresql-as-primary-datastore.md) | PostgreSQL as primary datastore | Accepted |
| [0006](0006-ai-authority-boundary.md) | AI has no pricing/ranking/booking authority | Accepted |
| [0007](0007-native-flexible-search.md) | Prefer provider-native flexible search over DIY fan-out | Accepted |
| [0008](0008-async-first-search.md) | Async-first, progressive search | Accepted |
| [0009](0009-offer-snapshot-storage.md) | Offer-snapshot storage for reproducible ranking | Accepted |
| [0010](0010-b2b-track-in-parallel.md) | B2B/API design-partner track in parallel with B2C MVP | Proposed |

_ADRs 0007–0010 were added in response to the [CTO Review](../../Review/CTO_Review.md) (2026-07-22)._

# Requirements Coverage — MVP vs. the spec (Family Edition)

_Status: Active · Owner: You · Last updated: 2026-07-23_

An honest audit of what the **built MVP** delivers against the
[Functional Requirements](../product/03-functional-requirements.md) and
[Non-Functional Requirements](../product/04-non-functional-requirements.md).

Legend: ✅ done · 🟡 partial · ⏸ deferred **by the [Family-Edition boundary](../FAMILY-EDITION.md)**
(Scale-Edition concern — not needed for a private, no-money, no-strangers tool) · 💤 nice-to-have not
yet built.

## Functional requirements

| FR | Requirement | Status | Where / note |
|---|---|---|---|
| FR-1 (M) | NL trip intake | ✅ | M4 Gemini parse |
| FR-2 (M) | Structured form, AI optional | ✅ | M2 form + M4 |
| FR-3 (M) | Clarifying questions (≤1 round) | 💤 | AI infers defaults + shows "I understood"; no ask-back yet |
| FR-4 (S) | Entity normalization (city→airport, relative dates) | ✅ | M4 |
| FR-5 (M) | Date grid ± days | ✅ | M5b |
| FR-6 (M) | Nearby airports | ✅ | M5b |
| FR-7 (S) | Split-ticket + risk label | 💤 | out of MVP scope |
| FR-8 (S) | One-way / round-trip | ✅ (multi-city 💤) | M2 |
| FR-9 (C) | "Anywhere / surprise me" | 💤 | Could-have |
| FR-10 (M) | Preference profile (value-of-time, cabin, hard/soft) | ✅ (versioning 🟡) | M5a; no explicit version field |
| FR-11 (M) | Apply profile automatically; per-search override | 🟡 | auto-applied ✅; per-search override 💤 |
| FR-12 (S) | Implicit preference learning | 💤 | v2 |
| FR-12a (M) | Cold-start onboarding | 🟡 | sensible defaults applied on day one (not a bare price-sort); guided flow 💤 |
| FR-13 (M) | View/edit/export/delete profile | 🟡 | view/edit ✅ (/profile); delete via Clerk removes the row; export ⏸ (GDPR machinery, boundary) |
| FR-14 (M) | Total Trip Value scoring | ✅ | M3 |
| FR-15 (M) | Deterministic Comfort Score | ✅ | M3 (cabin/stops/layover/red-eye/duration; aircraft & on-time not in provider data) |
| FR-16 (M) | Price ancillaries (bags) into ranking | ✅ | M3 |
| FR-17 (M) | Shortlist + cheapest/fastest/best-value anchors | ✅ | M3 |
| FR-18 (S) | Delta vs. literal query | ✅ | M3 ("best value costs €X more than cheapest") |
| FR-19 (M) | Grounded explanation | ✅ | M4 |
| FR-20 (S) | Follow-up questions on results | 💤 | single explanation only |
| FR-21 (M) | Live price re-validation before handoff | ✅ | M6a |
| FR-22 (M) | Booking handoff (deep-link) | 🟡 | "book directly with {airline}" guidance; true deep-link 💤 |
| FR-22a (M) | Signed / fraud-safe / affiliate handoff | ⏸ | no money → no affiliate/fraud surface (boundary) |
| FR-23 (C) | In-platform booking | ⏸ | Won't-yet |
| FR-24 (S) | Save search + price alert | 💤 | not built |
| FR-25 / 25a (S) | Disruption / fare-drop detection | 💤 | not built |
| FR-26 (M) | Auth (sign-in) | ✅ (guest search 💤) | M1 Clerk; we require sign-in |
| FR-27 (S) | Search history / saved trips | 🟡 | searches **are** snapshotted to DB (M2); no history UI yet |
| FR-28 (M) | Consent management | ⏸ | boundary (no marketing, private) |
| FR-29 (M) | Provider health dashboard + failover | ⏸ | single provider; `/api/health` exists |
| FR-30 (S) | Feature flags | 💤 | — |
| FR-31 (M) | Audit log of price-affecting ops | 🟡 | offer snapshots + server logs; formal audit log ⏸ (boundary) |

## Non-functional requirements

| NFR | Requirement | Status | Note |
|---|---|---|---|
| NFR-1/2/4 | Async first-meaningful-result, ≤2s | ⏸ | Family Edition is **synchronous by design** (queue cut); searches ~1–8s, fine at family scale |
| NFR-3 | Scoring 10k ≤ 500ms | ✅ | pure, fast engine |
| NFR-5/6/7 | 10M users, autoscale, no SPOF | ⏸ | Scale Edition |
| NFR-8/9/10/11 | Availability / failover / RPO-RTO | ⏸ | Vercel + Neon give solid uptime; formal SLOs are Scale |
| NFR-12 | Price integrity (wrong price = Sev-1) | ✅ | M6a re-validation |
| NFR-13 | Deterministic ranking (given snapshot) | ✅ | M3 pure functions + M2 snapshots |
| NFR-14 | Cache TTL / re-validate live | ✅ | no cache; always re-validate |
| NFR-15 | OWASP, TLS, AES-256 at rest, rate limit, input validation | ✅ | TLS (Vercel), encryption at rest (Neon), zod validation, M6c rate limiting, secrets server-only |
| NFR-16 | No secrets/PII in logs | ✅ | — |
| NFR-17/18 | GDPR / data residency | ⏸ | boundary (private use) |
| NFR-19/20 | Tracing / cost metrics | 🟡 | console logs only; full observability is Scale |
| NFR-21 | ≥80% core coverage; 100% TTV | 🟡 | TTV/comfort/constraints/flexibility/mapper/schema/rate-limit all unit-tested; coverage % not formally measured |
| NFR-22 | Clean architecture (adapters behind interfaces) | ✅ | ProviderPort, AiPort, pure domain |
| NFR-23 | Docs + ADRs updated with changes | ✅ | every milestone updated `/docs` |
| NFR-24 | Grounded AI: 0 fabricated quantitative facts | ✅ | structural — AI only phrases given numbers; parse is validated |
| NFR-25 | Preference-extraction eval set | 💤 | — |
| NFR-26 | Provider-call budget | ✅ | flexibility fan-out capped ≤ 8 |
| NFR-27 | LLM out of the scoring path | ✅ | ADR-0006 enforced |
| NFR-28 | WCAG 2.1 AA | 🟡 | labels/alt/semantic buttons done; full audit 💤 (legally gating only for a **public EU** service) |
| NFR-29 | Multi-currency / lang / tz | 🟡 | single currency per search, English; architecture doesn't preclude it |

## Verdict

**Every product-defining "Must" is built:** NL intake, structured search, flexibility, preference
profiles, Total Trip Value + Comfort Score with ancillaries priced in, cheapest/fastest/best-value
anchors, grounded explanations, and live price integrity. The engine is deterministic and behind
clean provider/AI interfaces.

**The gaps fall into two honest buckets:**
1. **Deferred by the Family-Edition boundary (⏸):** async streaming, multi-provider failover, GDPR
   export/consent, affiliate/fraud handoff, observability/SLOs, 10M-scale. These are *correctly* not
   built — they're Scale-Edition work that a private family tool doesn't need (and the docs say so).
2. **Nice-to-haves not yet built (💤 / 🟡):** clarifying-question round, follow-up Q&A on results,
   save-search price alerts, a **search-history UI** (the data is already stored), per-search profile
   override, a **guided cold-start** onboarding, and a full **accessibility audit**. None block family
   use; each is a candidate for a future polish round.

So: **doing everything accordingly for the Family Edition** — the deliberate scope. The full Scale
spec stays the documented North Star.

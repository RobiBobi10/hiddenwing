# 16 · GDPR & Privacy

_Status: Draft · Owner: Security / Legal · Last updated: 2026-07-22_

Personalization is our differentiator, which makes privacy a core competency, not a checkbox.
This doc covers GDPR compliance and privacy-by-design. Security controls are in
[doc 15](15-security-architecture.md).

> Not legal advice. This is the engineering/product plan for compliance; validate with counsel
> and a DPO before launch in each jurisdiction.

## 1. Roles & scope
- Hiddenwing is a **data controller** for user account/preference data; providers and the LLM
  vendor are **processors/third parties** under contract (DPAs required).
- Applies to EU/EEA users; mirror principles for UK GDPR and align with CCPA/CPRA where relevant.

## 2. Lawful basis per purpose (Art. 6)
| Processing purpose | Lawful basis |
|---|---|
| Providing search/optimization the user requested | Contract (Art. 6(1)(b)) |
| Storing & applying the Preference Profile | Contract / Consent (depending on inference depth) |
| **Implicit** preference learning from behavior | **Consent** (explicit, revocable) |
| Marketing communications | Consent |
| Fraud/abuse prevention, security | Legitimate interest (balanced, documented) |
| Analytics / product improvement | Consent or legitimate interest (aggregated/anonymized) |

Consents are **per-purpose, independently toggleable, and revocable** (FR-28); revocation takes
effect immediately and stops the corresponding processing.

## 3. Data-protection principles (Art. 5) in practice
- **Minimization** — collect only what optimization needs; strip PII before it reaches the LLM
  (doc 11); no PII in logs (NFR-16).
- **Purpose limitation** — data collected for search isn't repurposed for marketing without
  consent.
- **Storage limitation** — retention policies per data class (search logs << account data);
  automated purge (doc 09).
- **Accuracy** — users can review/correct inferred preferences (FR-12/13).
- **Integrity & confidentiality** — encryption, access control, audit (doc 15).
- **Accountability** — this doc, DPIA, records of processing, immutable audit log.

## 4. Data-subject rights (Art. 12–22) — how each is fulfilled
| Right | Implementation |
|---|---|
| **Access** (DSAR) | `GET /v1/me/export` produces a structured export; fulfilled ≤ 30 days (NFR-17) |
| **Rectification** | Edit profile/account in-app (FR-13) |
| **Erasure ("right to be forgotten")** | Deletion propagates across Postgres, Redis, OpenSearch, object store, and warehouse; **crypto-shredding** for immutable/audit stores (doc 09). **Design (review §6):** each data subject's PII is encrypted under a **per-subject data-encryption key**; erasure = destroy that key, rendering the immutable/audit records permanently unreadable while preserving the tamper-evident chain's integrity. Key lifecycle managed in KMS (doc 15). |
| **Restriction** | Consent toggles + processing flags |
| **Portability** | Machine-readable export (JSON) |
| **Object** | Opt-out of legitimate-interest processing (e.g. profiling/marketing) |
| **Not subject to solely-automated decisions w/ legal effect** | Optimization is advisory + explainable; booking needs explicit user action (no solely-automated significant decision) |

## 5. Consent management
- Granular, purpose-specific, freely given, as easy to withdraw as to give.
- Consent state versioned and audit-logged (what/when/which version of the notice).
- No pre-ticked boxes; personalization degrades gracefully if consent is withheld (the structured
  path still works — FR-2).

## 6. Data residency & transfers
- **EU users' PII stored in the EU region** (NFR-18); region-aware schema tagging (doc 09).
- Cross-border transfers (e.g. to a US LLM vendor) covered by SCCs/adequacy + transfer risk
  assessment; prefer EU-region model endpoints and no-retention terms where available.

> **Strengthened per [CTO Review](../Review/CTO_Review.md) §5/§6 — launch-gating.** The free-text
> trip request **is itself PII** ("fly me to my mother in Haifa on the 3rd" contains a name, a
> location, a relationship, and a date). "We'll strip PII before the LLM" is **not a credible
> control for free text** and must not be relied on. Required controls instead:
> - **EU-region LLM endpoint with contractual no-retention / no-training** for EU users — treat
>   as mandatory, not "where available". If unavailable for a given model, that model is not used
>   for EU free-text.
> - A **DPIA that explicitly covers the LLM transfer** as a distinct high-risk processing
>   activity, with SCCs and a transfer risk assessment on file before launch.
> - Minimize *structured* PII sent alongside the free text (don't add account identifiers to the
>   prompt), even though the free text itself can't be fully stripped.
> - Log scrubbing on AI request/response, short retention, access control (doc 15).

## 7. Third parties & processors
- **Providers** (Amadeus/Duffel/…): DPAs; share only the minimum needed to price/book.
- **LLM vendor**: DPA; pin to **no-retention / no-training** tiers; minimize/strip PII in prompts
  (doc 11); no training on user data without separate explicit consent.
- Maintain a **Record of Processing Activities (RoPA)** and a processor register.

## 8. DPIA (Data Protection Impact Assessment)
Required because we do profiling/personalization at scale. The DPIA documents: data flows,
necessity/proportionality, risks to data subjects, and mitigations (minimization, consent,
encryption, erasure, LLM PII-stripping). Reviewed before launch and on material change.

## 9. Privacy by design & default
- Default to the least data and the narrowest sharing.
- Personalization is opt-in beyond what "contract" strictly requires.
- Privacy considerations are part of every feature's threat model (doc 15) and every relevant
  ADR.

## 10. Breach response
- Detection via security monitoring (doc 15); **72-hour** supervisory-authority notification
  process where required; user notification when high risk; documented runbook and post-mortem.

## 11. Engineering checklist (per feature touching personal data)
1. Identify data collected + lawful basis + retention.
2. Minimize; avoid sending PII to the LLM.
3. Wire it into export + erasure paths.
4. Add/confirm consent gating if applicable.
5. Update RoPA and, if material, the DPIA.

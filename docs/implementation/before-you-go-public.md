# Before You Go Public — the boundary tripwire

_Status: Active · Owner: You · Part of [Milestone 6](milestone-6-polish-price-integrity-launch.md)_

Hiddenwing's Family Edition is deliberately cheap and legally simple **because** it's private and
takes no money. The moment you cross either line below, a whole set of obligations switches back on.
**Do not open public sign-ups or take payment until you've worked through this.** This doc is the
guardrail, not a to-do list — most of it stays "not needed" for as long as it's a family tool.

## The two triggers
1. **Strangers** — you open sign-ups to the public (turn off the Clerk allowlist).
2. **Money** — you take payment, earn commission, or book on someone's behalf as agent/seller.

Cross either and you are running a **public commercial service**, and the
[Scale-Edition security/legal docs](../security/15-security-architecture.md) apply for real.

## What switches on (from our own Scale-Edition docs)
| If you… | You now need |
|---|---|
| Open public sign-ups | **GDPR**: lawful basis, privacy policy, DPIA, data-subject rights, cookie consent; abuse/rate protection at real scale (docs 15–16) |
| Take payment | **PCI DSS** scope, a payment processor (Stripe/Paddle), refunds/chargebacks, tax; **seller-of-travel** registration in some jurisdictions (ADR-0003, GTM doc) |
| Book as agent/seller | Duffel **live** mode + seller-of-record obligations, ticketing liability, customer support duty |
| Grow traffic | Multi-provider failover, caching, async queue, observability/SLOs, on-call (docs 06/13/21/24) |
| Handle more data | Data retention/deletion policy, encryption review, security audit, incident response |

## Minimum first steps if you decide to go public
1. Re-read [docs 15 (security)](../security/15-security-architecture.md) and 16 (GDPR).
2. Write a real **privacy policy** + **terms**; add **cookie consent**.
3. Turn on a **shared-store rate limiter** (Upstash) and a proper **CSP**.
4. Get **legal advice** on seller-of-travel / consumer-protection for your market.
5. Move AI to a no-training tier (paid Gemini / Claude via Bedrock) if handling others' data (doc 24).
6. Only then flip Clerk to public and/or Duffel to live.

Until you choose to do all that: **keep it invite-only, test-mode, no-payment — and enjoy the simple
version.** That's the whole point of the Family Edition.

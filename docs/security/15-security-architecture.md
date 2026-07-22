# 15 · Security Architecture

_Status: Draft · Owner: Security · Last updated: 2026-07-22_

Security is a design constraint, not a phase. This doc covers the controls required by NFR-15/16
and CLAUDE.md's security mandate. Privacy/GDPR specifics are in [doc 16](16-gdpr-and-privacy.md).

## 1. Principles
- **Defense in depth** — no single control is trusted alone.
- **Least privilege** — every service, token, and the LLM get the minimum authority (the LLM
  gets none over pricing/booking — ADR-0006).
- **Secure by default** — deny by default; explicit allow.
- **Assume breach** — segment, encrypt, audit, so a compromise is contained.
- **Shift left** — security checks in CI (SAST, deps, secrets, IaC) — see
  [Deployment](../operations/20-deployment-strategy.md).

## 2. OWASP Top 10 — how each is addressed
| Risk | Mitigation |
|---|---|
| **A01 Broken Access Control** | Central authZ policy layer (RBAC→ABAC); every endpoint checks actor vs. resource owner; deny-by-default; tenant isolation on the partner API |
| **A02 Cryptographic Failures** | TLS 1.2+ in transit; AES-256 at rest; column-level encryption for sensitive PII; modern password hashing (argon2/bcrypt); no secrets in logs |
| **A03 Injection** | Parameterized queries/ORM; schema validation (Zod/DTO) at every boundary; **all external text (user + provider) treated as untrusted** (doc 11) |
| **A04 Insecure Design** | Threat modeling per feature (CLAUDE.md "identify risks"); this doc + ADRs; abuse cases in user stories |
| **A05 Security Misconfiguration** | Hardened base images, IaC-scanned configs, no default creds, least-privilege cloud IAM, security headers/CSP |
| **A06 Vulnerable Components** | SCA/dependency scanning in CI, pinned versions, patch SLA, SBOM |
| **A07 Identification & Auth Failures** | OAuth2/OIDC, short-lived JWTs + refresh rotation, MFA option, lockout/rate-limit on auth, secure session handling |
| **A08 Software & Data Integrity** | Signed builds/images, verified CI/CD, protected branches, provenance; validate provider payloads |
| **A09 Logging & Monitoring Failures** | Central structured logging, correlation IDs, security alerting, immutable audit log (doc 09), tamper-evident |
| **A10 SSRF** | Egress allow-list; provider calls only via vetted adapters; validate/deny arbitrary outbound URLs; no user-controlled fetch |

## 3. Authentication & authorization
- **AuthN**: OAuth2/OIDC + email; short-lived access JWTs, rotating refresh tokens; optional MFA;
  brute-force protection (rate-limit + lockout).
- **AuthZ**: single policy layer (RBAC now, ABAC-ready); resource-owner checks everywhere; API
  keys + OAuth2 scopes for partners with strict tenant isolation.
- **Sessions**: secure, httpOnly, SameSite cookies for web; token binding where feasible.

## 4. Data protection
- **In transit**: TLS everywhere, incl. internal service-to-service (mTLS in the cluster).
- **At rest**: AES-256 volume/DB encryption; **column-level encryption** for the most sensitive
  PII; envelope encryption via KMS.
- **Key management**: cloud KMS/HSM; rotation; separation of duties.
- **Tokenization/minimization**: don't store what we don't need; strip PII before it reaches the
  LLM (doc 11) and before logs.

## 5. Secrets management
- Centralized secrets manager (Vault/cloud secrets); **no secrets in code, env files in repo, or
  logs** (NFR-16). Short-lived, dynamically issued where possible; automated rotation; CI secret
  scanning blocks commits.

## 6. Rate limiting & abuse prevention
- Per user + per IP + per API key token buckets (Redis); stricter on expensive **search**, **AI**,
  and **provider-cost-heavy** endpoints (protects both security and unit economics — GTM doc).
- Bot/abuse detection; WAF at the edge; captchas on abuse-prone flows; idempotency keys on
  mutations.

## 7. Input validation & output encoding
- Schema-first validation at **every** boundary (client, service-to-service, provider ingress).
- Output encoding/escaping to prevent XSS; strict CSP; sanitize any provider-supplied strings
  before render.

## 8. Network & infra security
- Private subnets, security groups, least-privilege IAM roles per service.
- Cluster: network policies, mTLS, non-root containers, read-only FS, image scanning, admission
  control.
- Secrets/PII segmented; blast-radius limited by segmentation.

## 9. Application-specific risks
- **Price/booking integrity** — live re-validation + immutable audit log make wrong-price
  tampering detectable (NFR-12, doc 09).
- **Prompt injection / LLM abuse** — LLM has no authority; grounding + guardrails; untrusted-text
  handling (doc 11).
- **Scraping/data-harvesting of our results** — rate limits, bot defense, ToS.
- **Affiliate handoff = open-redirect surface** _(review §6)._ Outbound deep-links must be built
  from a **server-side allow-list of provider domains** and **signed** (tamper-evident); never
  redirect to a user- or provider-string-supplied raw URL. This is the SSRF/redirect control
  (A10) applied to the booking handoff (FR-22a).
- **Affiliate click fraud / attribution abuse** _(review §1/§6)._ Attribution parameters are
  signed and validated; anomalous click patterns are detected and filtered so the affiliate
  revenue line isn't corrupted and we aren't clawed back by partners.
- **Deceptive-pricing / savings-claim exposure** _(review §5)._ The "we saved you €X" mechanic and
  any displayed savings must be **substantiable from stored data** (the offer snapshot, ADR-0009);
  cached prices are labeled and re-validated (FR-21) to avoid bait-pricing liability. Treated as a
  security/compliance control, not just UX copy.

## 10. Security operations
- **SDLC**: threat model per feature, SAST/DAST, dependency + IaC + secret scanning in CI, code
  review, security review for sensitive changes.
- **Vuln management**: scanning, patch SLAs, coordinated disclosure / bug-bounty path.
- **Monitoring/IR**: security alerting on the central logs, documented incident runbooks, defined
  severities (displayed-wrong-price and PII leak = Sev-1), post-mortems.
- **Pen testing** before major launches (MVP gate — doc 18).

## 11. Compliance touchpoints
GDPR (doc 16), PCI-DSS only if/when we take card data directly (deferred by ADR-0003 — affiliate
handoff keeps us out of PCI scope for MVP), SOC 2 as an enterprise/B2B readiness goal.

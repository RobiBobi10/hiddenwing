# 14 · API Strategy

_Status: Draft · Owner: Backend · Last updated: 2026-07-22_

## 1. Surfaces
1. **Client ↔ BFF/Gateway** — the API the web (and later mobile) app consumes.
2. **Internal service ↔ service** — core ↔ AI service ↔ (future extracted services).
3. **Public / partner API** — the B2B licensing surface for the Optimization Engine (Phase 2,
   see [Business Model](../product/02-business-model-gtm.md)).

## 2. Style choices
| Surface | Style | Why |
|---|---|---|
| Client ↔ BFF | **REST/JSON + SSE/WebSocket** for progressive search; GraphQL optional at BFF | Simple, cacheable, streams partial results (doc 08); GraphQL only if client query flexibility demands it |
| Service ↔ service | **Typed RPC over HTTP (OpenAPI-generated clients)**; events via Redis Streams/Kafka | Easy to trace, contract-checked; async for wide search & side-effects (doc 07) |
| Public/partner | **REST, versioned, OpenAPI-documented, key + OAuth2** | Standard, easy to adopt, monetizable |

We deliberately avoid GraphQL *everywhere internally* — REST/typed RPC is simpler to trace and
rate-limit; a GraphQL BFF is a client-convenience option, not an internal mandate.

## 3. Design conventions
- **Contract-first**: OpenAPI spec is the source of truth; server stubs and typed client SDKs
  are generated from it (drift caught at build — docs 07/08).
- **Versioning**: URL-versioned public API (`/v1/`), additive-change policy, deprecation window.
- **Consistent envelopes**: standard error shape (`code`, `message`, `traceId`), pagination,
  and `Idempotency-Key` support on state-changing endpoints.
- **Correlation IDs** propagated across every hop and into provider calls (doc 21).
- **Async pattern**: wide searches return a job handle; results stream via SSE/WebSocket or are
  polled (NFR-2).

## 4. Representative endpoints (client-facing, illustrative)
```
POST /v1/searches                 # create a search (structured or NL); returns id + mode(sync|async)
GET  /v1/searches/{id}            # status + current ranked shortlist
GET  /v1/searches/{id}/stream     # SSE: progressive results for wide searches
POST /v1/searches/{id}/revalidate # live re-price a chosen solution before handoff
GET  /v1/solutions/{id}/explain   # grounded explanation (+ follow-up Q&A)
GET/PUT/DELETE /v1/profile        # view/edit/delete Preference Profile (GDPR surface)
POST /v1/profile/consents         # manage per-purpose consents
POST /v1/saved-searches           # price monitoring (Phase 2)
GET  /v1/me/export                # DSAR data export (doc 16)
```

## 5. Security (see [doc 15](../security/15-security-architecture.md))
- **AuthN**: OAuth2/OIDC + short-lived JWT access tokens, refresh rotation; API keys for
  partners.
- **AuthZ**: central policy layer (RBAC now, ABAC-ready); every endpoint authorizes the actor
  against the resource owner.
- **Rate limiting**: per user + per IP + per API key (Redis token bucket); stricter limits on
  expensive search and AI endpoints, and on provider-cost-heavy operations.
- **Input validation**: schema validation (Zod/DTO) at every boundary — an OWASP control, not
  just ergonomics.
- **Idempotency** on all mutations; **no PII in URLs**; TLS everywhere.

## 6. Provider-facing (outbound) APIs
Handled entirely behind `ProviderPort` adapters (doc 13). Outbound calls get timeouts, retries
with jitter, circuit breakers, per-provider rate governors, and cost accounting. The domain
never calls a provider SDK directly.

## 7. Partner / public API (Phase 2)
- Separate gateway, separate quotas/billing, sandbox environment.
- Strong versioning + deprecation policy (partners depend on stability).
- Usage metering feeds billing (B2B revenue line, GTM doc).
- Never exposes another customer's data; strict tenant isolation.

## 8. Documentation & DX
- Auto-generated OpenAPI docs + a developer portal for partners.
- Every endpoint: examples, error catalog, rate-limit headers, changelog.
- Docs updated in the same PR as the contract (NFR-23).

## 9. Rejected alternatives
- **gRPC internally** — great perf, but weaker browser story and heavier tooling than we need
  at current scale; typed REST/RPC suffices. Reconsider at high internal throughput.
- **Public GraphQL** — flexible but harder to rate-limit, cache, and cost-govern for a
  monetized partner API; REST chosen for the public surface.

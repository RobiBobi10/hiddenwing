# 11 · AI Safety & Evaluation

_Status: Draft · Owner: AI · Last updated: 2026-07-22_

This doc exists because the [AI Strategy](10-ai-strategy.md) makes a hard promise — *AI never
invents prices, times, or rankings* — and a promise without enforcement and measurement is
marketing. Here is how we enforce and measure it.

## 1. Threat & failure model

| Failure | Impact | Severity |
|---|---|---|
| Hallucinated **price** in an explanation | User books a wrong price; trust destroyed | **Sev-1** |
| Hallucinated time/duration/stop | Bad decision; trust damage | High |
| Wrong preference extraction | Bad ranking; user frustration | Medium |
| Prompt injection (user text or provider content) steering the model | Manipulated output; potential data exfiltration | High |
| PII leakage to model/logs | Privacy/GDPR breach | High |
| Latency/outage of the LLM | Degraded UX | Medium (mitigated by fallback) |

## 2. Grounding — the primary defense
- The explanation LLM receives **only** the chosen solution's verified attributes (price
  breakdown, segment times, comfort factors, constraint checks) as structured context. It is
  instructed to reference only those.
- **Numeric/entity guardrail:** after generation, a deterministic checker extracts every number,
  currency, airport, airline, and time in the output and asserts each exists in the source
  context within tolerance. **Any unverifiable claim → reject** and fall back to a templated
  explanation. This makes hallucinated prices structurally impossible to display (NFR-24).
- Prices in the UI are **never** taken from LLM text — they come from the pricing service and are
  live-re-validated before booking (NFR-12).

## 3. Prompt-injection & untrusted-input handling
- **All external text is untrusted**: user free-text *and* provider-returned strings (fare
  rules, marketing copy) can contain injection. They are treated as data, never instructions.
- The LLM holds **no authority**: it cannot call pricing, mutate profiles, or trigger bookings
  directly. Its outputs are proposals validated by deterministic code (least privilege — doc 15).
- Structured-output schemas constrain intake; freeform is parsed, validated, and shown back to
  the user for confirmation before it affects anything.

## 4. Privacy in AI (ties to GDPR doc 16)
- Minimize/strip PII before sending to the model; pin managed-provider terms to
  no-retention/no-training tiers.
- No user data used for training/fine-tuning without explicit separate consent.
- AI request/response logs scrubbed of PII; access-controlled and retention-limited.

## 5. Evaluation harness

**Offline (pre-release gate):**
- **Preference-extraction accuracy** vs. a labeled dataset (intent, constraints, weights).
  Precision/recall tracked; regression blocks release (NFR-25).
- **Grounding/faithfulness** on explanation test cases — 0 fabricated facts tolerated (hard
  gate).
- **Robustness/red-team set**: adversarial and prompt-injection prompts must not break grounding
  or leak data.
- **Golden queries**: canonical NL inputs → expected structured queries.

**Online (production):**
- Guardrail rejection rate (spikes signal model/prompt drift).
- Explanation-helpfulness signals (user feedback, expand/collapse, "why not" follow-ups).
- Shadow-eval a candidate prompt/model on live traffic before promotion.
- Token/$ and latency per AI call (doc 21).

**Governance:**
- Prompts and models are **versioned artifacts**; none ships without passing the offline gate.
- Every change logged; rollbacks are one config flip.

## 6. Human-in-the-loop & autonomy limits
- AI is advisory. **No autonomous booking** — purchases require explicit user confirmation on a
  live-validated price.
- Inferred preference changes are **shown to the user** for review/edit, never silently applied
  as hard constraints.

## 7. CI integration
The eval harness runs in CI on any change to prompts, AI-service code, or models; a failing
grounding or accuracy gate blocks merge — same status as a failing unit test (see
[Testing](../operations/17-testing-strategy.md), [Deployment](../operations/20-deployment-strategy.md)).

## 8. Incident response
- A displayed-wrong-price event (even suspected) is **Sev-1**: page on-call, freeze the
  offending prompt/model, fall back to templates, root-cause via the audit log (doc 09/15).

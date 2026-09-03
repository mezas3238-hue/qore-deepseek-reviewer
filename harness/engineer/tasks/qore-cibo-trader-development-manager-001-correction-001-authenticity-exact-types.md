# QORE CIBO Trader Development Manager — Correction 001: Authority Authenticity + Exact Types

## Continuity law

Bounded correction over the exact currently materialized PR #480 candidate. This is NOT a rebuild of the Trader Development Manager foundation.

Immutable START / current PR #480 HEAD:
- START: `576803fbda76970a4bbfe2287b5f9ca101d0f6c3`
- TREE: `11f35844670551ac4ab5be322272a3221e6b1c4b`
- PR: #480

Preserve all valid behavior and tests. Correct only the independently reproduced trust-root / exact-runtime / recursive-revalidation causal families and directly necessary docs/tests.

## Independent IA material findings

### IA-TDM-R1 — DEMO eligibility self-declaration

`CiboDemoEligibilityEvidence` is a public frozen dataclass. Any caller can construct it with a `ResearchDecisionEvaluatorIdentity`, config fingerprint, arm, risk mode, arbitrary `CiboEvidenceRef` and timestamp. `CiboTraderManager.decide(SELECT, ...)` treats that locally constructed record as the only DEMO_ELIGIBLE proof. Therefore a caller can manufacture eligibility without an owning Trader Lab / governance authority having issued it.

Hard law:
`PUBLIC DATACLASS != AUTHORITY-ROOTED DEMO ELIGIBILITY`
`TYPED EVIDENCE REF != AUTHENTIC CERTIFICATION`
`CIBO MANAGER != TRADER LAB PROMOTION AUTHORITY`
`NO AUTHORITY ROOT -> SELECTION FAILS CLOSED`

Do not solve this with a private Python name, `init=False`, caller-supplied verifier/Protocol, private helper, object token, or hidden bool that arbitrary Python code can mint. Reuse a genuine existing owning-authority proof/verification boundary if the repository has one. If it does not, model a consume-only external seam and keep SELECT explicitly blocked/dependent until authentic Trader Lab/governance evidence is supplied.

### IA-TDM-R2 — exact runtime / subclass laundering

The seven-file candidate contains many `isinstance` checks at trust-bearing boundaries for datetime, Decimal, evidence refs, enums, `ResearchDecisionEvaluatorIdentity`, fingerprints, profiles, eligibility, concentration records and nested tuples. QORE exact runtime law requires exact types where identity/evidence/authority semantics are conveyed.

### IA-TDM-R3 — recursive re-entry

Consumers such as `review_capability_profile`, manager selection/binding and concentration evaluation must recursively revalidate nested retained records so `object.__setattr__`/deserialize-like corruption or malicious subclasses cannot survive merely because an outer frozen dataclass was once valid.

## Six lanes

### Lane 1 — authority + LSP seam inventory
Use semantic LSP across #480 and neighboring Trader Lab/governance/evidence types. Prove whether a genuine authority-rooted DEMO eligibility proof/verifier already exists. Map all constructors and consumers of `CiboDemoEligibilityEvidence` and every selection path. Record evidence in checkpoints.

### Lane 2 — DEMO eligibility authority-root redesign
Remove any path where direct caller construction of a public record can confer SELECT authority. If a genuine existing authority-rooted Trader Lab/governance proof can be consumed without reverse dependencies, bind to it. Otherwise make the boundary consume-only/external-dependent and selection fail closed until authoritative evidence integration. CIBO may recommend/manage but cannot self-certify promotion.

### Lane 3 — capability profile exact-type hardening
Replace permissive trust-bearing runtime checks with exact type checks; recursively revalidate identity, refs, stages, regime records, markets/timeframes, config fingerprints, freshness, Decimal metrics and operating conditions on construction and re-entry. Preserve sanitized immutable canonical ordering.

### Lane 4 — development review hardening
Exact-type and recursively revalidate profile/evidence/timestamps/required stages/expected identity/config. Reflectively corrupted nested profiles must fail closed before promotion recommendation. Recommendations remain advisory and non-authoritative.

### Lane 5 — manager/concentration hardening + adversarial tests
Exact-type and recursively revalidate action/profile/eligibility/evidence/concentration/arm/risk mode/timestamps at manager entry. Add adversarial witnesses for locally fabricated eligibility, subclass laundering, reflective mutation, copied/swapped identity/config, future certification, cross-arm/risk-mode reuse and corrupted concentration evidence. Missing authentic authority must never SELECT.

### Lane 6 — integrated audit + docs
Audit the complete seven-file PR #480 surface and neighboring consumers for the same root families. Update docs truthfully. Preserve provider neutrality, deterministic explicit time, no hidden RNG/now/retry/scheduler/thread, no execution/order authority, no Risk bypass, no Production/real-capital authority. Run focused tests; host owns FULL QG.

## Acceptance criteria

- No public/caller-mintable record alone can create DEMO selection eligibility.
- No caller-supplied verifier or Python-private helper becomes an authority root.
- Missing genuine authority evidence fails closed and remains explicit.
- Exact runtime types enforced at identity/evidence/authority boundaries; bool/subclass laundering rejected.
- Recursive consumer revalidation rejects nested reflective corruption.
- CIBO recommendation/management remains non-authoritative; Trader Lab/governance owns promotion evidence.
- No test weakening/suppression.
- Six durable lanes complete; final output `COMPLETE` only when all lanes close.

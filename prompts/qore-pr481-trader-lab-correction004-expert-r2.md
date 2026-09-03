# QORE PR #481 — Trader Lab Correction-004 — DeepSeek Expert R2

Actúa como reviewer EXPERT independiente, adversarial y estrictamente read-only del candidato congelado de QORE Core. No asumas que Harness, IA previa ni tests verdes implican corrección semántica.

## BINDING EXACTO — NO REVISAR OTRO CANDIDATO

- Repository: `mezas3238-hue/qore-core`
- PR: `#481`
- BASE: `9672c4d999bd5d3e6db544f349243bc6abea0363`
- HEAD: `ba8c1e3c05e06c69b2bc39b3c3fdf6e3c4f50449`
- HEAD TREE: `7649fa454fef4c9d50c48521230eb46b41e3e78f`
- SYNTHETIC: `13ef5df04d645d3e13bf1d7543ab2cfefd7228c6`
- SYNTHETIC TREE MUST equal HEAD TREE.
- Current PR diff vs main: 15 Trader Lab files.
- Correction-004 delta from prior rejected HEAD `5d25445faf57fa83410b57faf5eaf1f437949129`: exactly 14 files, +3928/-267.
- Harness Correction-004 run: `33757459061`; job `100655229316`; artifact `9895767894`.
- Artifact ZIP digest: `sha256:bd815bf99c341af9b90f7bfb936c1e16b941706e6a98dc663e091118e33691f1`.
- Exact Correction-004 patch SHA256: `cd6f86489ccc85c2aadad5bb1bf0724878212505b740c2e403e5d01a64d7c3c5`.
- Harness FULL QG evidence: Ruff PASS; Mypy PASS (754 source files); Pytest 4940 passed / 7 pre-existing warnings / 87% coverage; focused Trader Lab 78 passed; diff check PASS.
- Exact-head QORE CI run is host-bound in the review request and MUST be SUCCESS before this review is accepted.

The final HEAD `ba8c1e3...` is a content-empty retrigger commit over the exact materialized Correction-004 TREE. Do not treat the retrigger as a semantic code change.

## HISTORICAL EXPERT R1 — MUST FALSIFY CLOSURE, NOT IGNORE IT

Expert R1 reviewed old HEAD `5d25445...` and returned `VALIDACIÓN NO OK`. Its material findings are historical regression targets, not current findings by assumption:

- **R1-F1 MATERIAL:** stage evidence provenance could be decorative/fabricated/laundered into `DEMO_ELIGIBLE`.
- **R1-F2 MATERIAL:** cross-candidate evidence reuse could inherit qualification.
- **R1-F3 MATERIAL:** economic-evidence requirement could be bypassed or satisfied by wrong-kind evidence.
- **R1-F4 MATERIAL:** trust-boundary revalidation was shallow; post-construction/reflective corruption could survive into eligibility.

Correction-004 and predecessor corrections claim to close these. Independently reproduce or falsify each closure on the exact current HEAD. If any class remains materially exploitable, report it even if the implementation changed shape.

## NEW CORRECTION-004 AUTHORITY-ROOT TARGET

The current candidate claims a provider-neutral **consume/verify-only** boundary for Risk, CIBO and Independent Validation evidence:

- `TraderLabGovernedAuthorityKind`
- `TraderLabGovernedAuthenticityProof`
- `verify_governed_gate_evidence`
- no production proof-mint helper in Trader Lab
- no caller-supplied authenticator/verifier Protocol that can become the authority root
- absent authentic external proof => `EXTERNAL_EVIDENCE_DEPENDENT` / fail closed

Falsify this aggressively.

Hard law:
`CALLER-SUPPLIED VERIFIER != AUTHORITY ROOT`
`PRIVATE PYTHON NAME != CAPABILITY SECURITY`
`TYPED APPROVED OBJECT != AUTHENTIC GOVERNED EVIDENCE`
`LOCAL TYPED REFERENCE != EXTERNALLY ISSUED AUTHORITY-KIND-BOUND PROOF`

Test whether a caller can still synthesize, reconstruct, copy, reflectively mutate, deserialize-like reconstruct, subclass, reuse, swap, or otherwise supply values that Trader Lab mistakes for an externally issued Risk/CIBO/Independent-Validation proof. A Python naming convention or `init=False` alone is NOT cryptographic/capability authenticity; determine whether the contract merely models an external trust seam (acceptable if fail-closed until real authority integration) or accidentally self-authorizes inside the Lab (material defect).

## MANDATORY FALSIFICATION TARGETS

1. **Old F1 closure:** wrong evidence kind, fabricated digest/reference, fake self-authentication, raw constructor, copied reference, or malformed retained material cannot qualify a mandatory stage.
2. **Old F2 closure:** candidate A evidence/proof cannot qualify candidate B; exact strategy binding/fingerprint/version/config lineage must be enforced recursively.
3. **Old F3 closure:** economic evidence is mandatory, exact-kind `ECONOMIC_EVALUATION`, non-bypassable, and cannot be replaced by Risk/CIBO/replay/other typed evidence.
4. **Old F4 closure:** nested and reflective corruption of candidate, lifecycle, stage evidence, source references, proof, times, fingerprints and authority metadata must fail closed without raw exception leakage across Result boundaries.
5. **Authority-root authenticity:** no local mint path, generic factory, caller-supplied verifier/context/callback/Protocol, test helper leaked to production, `object.__new__`-like production path, or reconstructable public state can turn caller assertion into qualifying external authority.
6. **Authority-kind separation:** Risk proof cannot satisfy CIBO or Independent Validation, and vice versa. No enum/string/subclass equality laundering.
7. **Exact proof binding:** proof binds exact candidate, gate/stage, authority kind, evidence fingerprint/digest/reference identity, issuer identity, and relevant time semantics. Swapping any axis must fail closed.
8. **Replay/reuse attacks:** proof/evidence cannot be reused across candidate version, candidate identity, strategy config, gate kind, evidence record, or stale/contradictory time window where contract promises rejection.
9. **Missing external authority:** current repo may lack a production issuer. That must remain `EXTERNAL_EVIDENCE_DEPENDENT`, never auto-PASS, inferred approval, or local fallback.
10. **Promotion chain:** RESEARCH -> REPLAY -> FAST_FORWARD -> OOS -> STRESS -> MONTE_CARLO -> RISK_REVIEW -> CIBO_REVIEW -> INDEPENDENT_VALIDATION remains exact, ordered, non-skippable and individually candidate-bound.
11. **Monte Carlo / Fast Forward:** deterministic, pre-registered, no hidden RNG/retry/seed hunting/lookahead, no second replay truth, no profitability inference from descriptive robustness.
12. **Exact runtime types:** `bool != int`; malicious subclasses cannot launder UUID/enums/value objects/authority kinds or trusted references where exact types are required. Preserve intentional structural Protocol polymorphism only where it does not convey authority/identity.
13. **Temporal law:** timezone-aware explicit timestamps, deterministic ordering, no hidden `datetime.now()`/`date.today()`/`uuid4()`/RNG/sleep/retry/thread semantic effects.
14. **Secret hygiene:** no secret-bearing material in repr/logical_values/evidence/errors/docs fixtures.
15. **Authority boundary:** Trader Lab, CIBO and Trader output never place orders, bypass Risk, grant Production, custody, withdrawal, or real-capital authority.
16. **Tests prove, not mirror:** identify happy-path fixtures that merely encode the implementation’s assumptions; build adversarial witnesses where possible.
17. **Root-family exhaustion:** inspect neighboring constructors/builders/factories/re-entry paths, not just the named fix function.

## MANDATORY SEMANTIC LSP

Use semantic LSP materially: `hover`, `findReferences`, `goToDefinition`, `goToImplementation` where relevant. Establish dependency radius and all authority/evidence construction and promotion call paths. Grep-only review is insufficient.

## REVIEW DISCIPLINE

- Read-only. Do not mutate repository state.
- Do not weaken tests or treat missing external Risk/CIBO authority implementation as a defect if the current contract correctly and explicitly fails closed pending that integration.
- Do treat any path that lets the Lab self-attest external authority as MATERIAL.
- Distinguish architectural seam limitation from actual bypass.
- Report only reproducible findings tied to exact files/symbols/evidence.
- Deduplicate common-root findings.
- Classify MATERIAL vs MINOR.
- Preserve prior findings only if independently reproduced on this exact HEAD.

Hard laws:
`NO VALID TRADER LAB PROMOTION EVIDENCE -> NO DEMO_ELIGIBLE -> NO DEMO ADMISSION`
`CODE_GREEN != DEMO_ELIGIBLE`
`MONTE_CARLO_PASS != PROFITABILITY_PROOF`
`CIBO_REVIEW != PROMOTION AUTHORITY`
`TRADER_LAB != EXECUTION AUTHORITY != RISK_BYPASS`
`DEMO_ELIGIBLE != PROFITABLE`
`DEMO EVIDENCE != PRODUCTION READY != REAL CAPITAL AUTHORIZED`

## REQUIRED OUTPUT

Provide binding verification, semantic-LSP evidence, adversarial witnesses, R1-F1..F4 closure adjudication, authority-root adjudication, root-family exhaustion, then findings.

If any material defect remains, finish with:
`VALIDACIÓN NO OK`

If no material defect remains, finish exactly with:
`HALLAZGOS: NINGUNO`
`VALIDACIÓN OK`

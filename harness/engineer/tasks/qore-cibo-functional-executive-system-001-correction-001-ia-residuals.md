# QORE CIBO FUNCTIONAL EXECUTIVE SYSTEM — CORRECTION 001 — IA RESIDUALS

## Package

`HARNESS-ENGINEER-QORE-CIBO-FUNCTIONAL-EXECUTIVE-SYSTEM-001-CORRECTION-001-IA-RESIDUALS`

## Authority / continuity

- Canonical roadmap: qore-core #303 and CEO-frozen CIBO amendment comment `5518822885`.
- Functional program: qore-core #483 — WHAT CIBO DOES.
- Cognitive program #482 remains SEPARATE.
- Trader Lab #473 / PR #481 remains SEPARATE.
- PR #480 remains the Track-B lineage for the Trader Manager foundation, but DO NOT publish from Harness; `artifact_only=true`.

This correction is a continuation of completed Batch 007. It is NOT permission to redo Batch 007 from scratch.

Completed predecessor:
- package: `HARNESS-ENGINEER-QORE-CIBO-FUNCTIONAL-EXECUTIVE-SYSTEM-001-BATCH-007`
- run: `33703515481`
- job: `100487677331`
- artifact: `9875839889`
- artifact digest: `sha256:1f36667054842ea2bb8c564ca3019cab9267412d18f2a7aa13d0c0e4b64e7f0f`
- immutable qore-core START: `576803fbda76970a4bbfe2287b5f9ca101d0f6c3`
- START TREE: `11f35844670551ac4ab5be322272a3221e6b1c4b`
- predecessor candidate patch SHA256: `82c4da71a668ea26e643dc5577c6dc00b04502dfbfd640b75b76aafa9c9a7008`
- predecessor state: all six lanes COMPLETE; FULL QG previously green (`5154 passed`); LSP-before/after recorded.
- terminal workflow failure was checkpoint-publication formatting only, after candidate completion. DO NOT rerun completed predecessor lanes.

Retained exact predecessor patch:
`harness/engineer/recovery/qore-cibo-functional-batch007.patch.bz2.b64.part01` through `.part05`

## Mandatory restore before correction

From exact qore-core START/TREE above:

1. Verify HEAD == START and tree == START TREE.
2. Decode retained predecessor:
   `cat ../../harness/engineer/recovery/qore-cibo-functional-batch007.patch.bz2.b64.part* | base64 -d | bzip2 -dc > /tmp/qore-cibo-functional-batch007.patch`
3. Verify decoded patch SHA256 exactly `82c4da71a668ea26e643dc5577c6dc00b04502dfbfd640b75b76aafa9c9a7008`.
4. `git apply --check /tmp/qore-cibo-functional-batch007.patch`.
5. Apply it exactly. Do not transcribe or reconstruct predecessor code manually.
6. Verify predecessor patch includes the exact Trader Manager Correction 001 prefix with SHA256 `e192d33a32d473f241fd0ea839cd31c141464e1af2434a3d1e3d443729bdfa32` for its first five diffs.
7. Treat all Batch-007 implementation work as completed predecessor evidence. Only the IA residual root families below are open.

## IA disposition of Batch 007

`NOT READY FOR EXPERT`.

The Integration Authority independently found material residuals after Harness completion. Do not dispatch Expert/Coder/Claude until this correction is materialized, independently adjudicated, FULL-QG green, and frozen on qore-core.

### IA-F1 — Self-attested / opaque-reference evidence laundering — MATERIAL

Current shared `CiboFunctionalEvidence` can be constructed as `SUFFICIENT` with one or more arbitrary opaque `CiboEvidenceRef` values plus a caller-selected timestamp. Multiple CF domains then treat that self-declared status as authoritative enough to issue stronger conclusions/recommendations. `CiboRiskContext` similarly accepts arbitrary opaque refs + a caller-selected assessment code, and can unlock `RECOMMEND` in the risk-aware composer.

This violates:
- `NO EVIDENCE -> NO CLAIM`;
- no fabricated market/economic/Risk evidence;
- `FUNCTIONAL OUTPUT != AUTHORITY`;
- evidence-dependent seams must fail closed;
- a typed reference/label is not, by itself, proof of governed evidence authenticity.

Required engineering outcome:
- use semantic LSP and repo-wide discovery to locate the existing authoritative/governed evidence/provenance contracts that are semantically appropriate;
- bind functional sufficiency to verified governed evidence material rather than arbitrary opaque identifiers;
- bind Risk-aware recommendation to genuine governed Risk evidence/context, not merely a string/code label;
- where a required producer is not yet certified/available, retain an explicit `EVIDENCE_DEPENDENT_SEAM` and make the stronger outcome impossible (ABSTAIN/ESCALATE/INSUFFICIENT), rather than fabricate an authority surrogate;
- do NOT invent provider-native identity or a new competing evidence authority if an existing QORE evidence boundary can be reused;
- recursively revalidate nested governed evidence at every material trust boundary;
- preserve deterministic canonicalization, no secrets, exact subject/version bindings where the authoritative contract requires them.

Audit propagation across at least CF-01/02/05/06/07/08/09/10/11/12/13/16/17/18/19/20 so a generic self-declared `SUFFICIENT` value cannot transitively manufacture market facts, PnL/economic certainty, Risk context, opportunity edge, allocation certainty, or executive recommendation.

### IA-F2 — Direct-constructor semantic bypass / builder parity — MATERIAL

`CiboFunctionalCoordinator.coordinate()` fails closed on disagreement/non-sufficient evidence, but public `CiboFunctionalCoordination` can currently be constructed directly with:
- `disposition=RECOMMEND`,
- `authority=RECOMMENDATION`,
- contradictory/stale/missing/insufficient evidence and/or preserved disagreements,
without constructor rejection.

Thus a downstream consumer can receive a type-valid recommendation that the coordinator itself would never emit.

Required engineering outcome:
- public immutable result contracts must enforce the same semantic ceiling as their canonical builder/orchestrator;
- direct construction must not admit a stronger semantic state than the public operation would produce;
- for CF-20, RECOMMEND must require sufficient authentic evidence, no unresolved disagreement, and all other required invariants; REQUEST/ABSTAIN must also remain coherent with request/evidence/disagreement semantics;
- systematically audit this builder-vs-constructor parity root family across all decision/recommendation/qualification-like result contracts introduced by Batch 007, not only CF-20.

### IA-F3 — Disagreement preservation / recursive revalidation residuals — MATERIAL ROOT FAMILY

Examples independently observed:
- `CiboFunctionalDisagreement.__post_init__` canonicalizes faculties through `set(...)` before checking duplicate cardinality, so duplicate input is silently collapsed instead of rejected;
- `_normalize_disagreements()` keys only by `subject_key` and silently overwrites multiple differing disagreement records for the same subject;
- shared reduction helpers such as `synthesize_evidence()` type-check nested objects but do not independently reconstruct/revalidate each retained nested value before consuming status/refs/reasons.

These violate no-fake-consensus, preserve-disagreement, deterministic audit material, and recursive trust-boundary revalidation.

Required engineering outcome:
- reject semantic duplicates/differing duplicate keys rather than last-write-wins or silent set collapse;
- preserve every material disagreement deterministically, or reject malformed ambiguous inputs;
- recursive revalidation must detect reflective corruption / malformed nested material and return typed Failure at public Result boundaries where applicable;
- exact runtime type discipline where required (`bool != int`, no subclass/value-equality laundering); include adversarial tests for reflectively corrupted nested evidence and lookalike/subclass material where semantically meaningful.

## Mandatory adversarial closure

At minimum prove:

1. Arbitrary opaque refs cannot self-certify `SUFFICIENT` evidence for a stronger functional conclusion.
2. Arbitrary Risk refs/assessment code cannot unlock a risk-aware RECOMMEND.
3. Missing/unavailable governed evidence producer -> explicit fail-closed seam, not fabricated sufficiency.
4. Exact authentic evidence binding cannot be reused across incompatible subject/version/kind where the reused authoritative contract forbids it.
5. Direct `CiboFunctionalCoordination(RECOMMEND, ...)` with contradictory/stale/missing/insufficient evidence is rejected.
6. Direct RECOMMEND with unresolved disagreements is rejected.
7. Every other Batch-007 result type that has a builder/composer is adversarially checked for constructor/builder semantic parity.
8. Duplicate disagreement faculties are rejected rather than silently deduplicated.
9. Two differing disagreements with the same semantic key cannot overwrite each other by input ordering.
10. Reflectively corrupted nested evidence cannot survive `synthesize_evidence` or any public functional trust boundary.
11. Nested StrEnum/string lookalikes and dataclass subclasses cannot launder exact semantic types where exact type is required.
12. No correction introduces provider execution/order authority, Risk bypass, Production/real-capital authority, hidden RNG/retry/sleep/thread/global mutable state, or secrets in repr/logical/evidence material.
13. Trader Manager predecessor correction remains exact and F1-F4 from the prior Expert remain closed.
14. CF-01..CF-20 ledger remains complete; no Cognitive Batch 006 or Trader Lab implementation is duplicated.

## Six-lane correction plan

Use six durable lanes. Completed Batch-007 lanes are predecessor evidence, not lanes to rerun.

1. **Governed evidence mapping lane** — semantic LSP on existing QORE evidence/provenance/Risk/economic contracts; produce exact reuse map and authenticity threat model.
2. **Shared evidence contract lane** — close IA-F1 centrally with bounded provider-neutral contracts and recursive validation.
3. **Risk/economic/market propagation lane** — ensure no stronger CF conclusion can be created from opaque/self-attested evidence; preserve EVIDENCE_DEPENDENT seams.
4. **Coordination/constructor parity lane** — close IA-F2 across CF-20 and audit all builder/result pairs.
5. **Disagreement/deep-validation lane** — close IA-F3, duplicate preservation, reflective/subclass/lookalike adversarial tests.
6. **Integration/QG lane** — cross-domain adversarial matrix, LSP-after, CF ledger audit, FULL QG, diff audit, refreshed recovery patch and final root-family exhaustion.

Parallel lanes may investigate in parallel, but shared-file edits must be reconciled deterministically. Never repeat predecessor implementation solely because a correction lane is pending.

## Semantic LSP — mandatory

Use hover/findReferences/goToDefinition/goToImplementation where supported before synthesis and after stabilization on at least:
- `CiboFunctionalEvidence`, `CiboEvidenceRef`, `synthesize_evidence`;
- existing governed evidence/provenance contracts selected for reuse;
- `CiboRiskContext`, Risk evidence/decision contracts;
- economic evidence/reconciliation contracts from #472 or nearest existing authoritative implementation;
- `CiboFunctionalCoordination`, `CiboFunctionalContribution`, `CiboFunctionalDisagreement`;
- all builder/composer/result pairs materially changed by parity correction.

Grep-only is insufficient.

## Quality / boundaries

Canonical FULL QG after stabilization:
- `ruff check .`
- `mypy src tests`
- `pytest --cov=src/qore --cov-report=term-missing`
- `git diff --check`

No weakening tests, skips/xfail to hide failures, `type: ignore` concealment, lint suppression, coverage exclusion, or semantic relaxation.

No Production, real capital, productive credentials, deposits/withdrawals, provider-native orders, Risk bypass, automatic corrective trading, hidden retry/sleep/scheduler/thread/global RNG, or silent self-modification.

## Durable memory / recovery law

Every generation/checkpoint must record PHASE, exact binding, predecessor patch hash, findings, decisions, evidence, uncertainties, lanes complete/pending, changed files, what closed/remains, exact next action, and SAFE RESUME instruction.

If interrupted: resume from durable checkpoint; do not redo completed predecessor or correction lanes.

## Completion

Final report must include:
- exact restoration verification;
- IA-F1/F2/F3 disposition matrix;
- CF-01..CF-20 regression ledger;
- LSP-before/after evidence;
- focused/adversarial tests;
- FULL QG;
- changed file/diff budget;
- explicit root-family exhaustion argument;
- `## RESUME STATE` / `COMPLETE`;
- literal `CANDIDATE_READY_FOR_EXTERNAL_QG` only if all material IA residuals are closed.

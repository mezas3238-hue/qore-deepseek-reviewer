# QORE TRADER LAB — CORRECTION 002 IA RESIDUALS — RESUME 001

## Package intent

Resume, do not restart, `HARNESS-ENGINEER-QORE-TRADER-LAB-001-CORRECTION-002-IA-RESIDUALS` after run `33706656994` / job `100497118185` stopped because DeepSeek returned `QUOTA: Insufficient Balance`.

This is a continuity package. Completed investigation and all patch work from the interrupted run are predecessor evidence and MUST NOT be repeated from zero.

## Immutable qore-core binding

- START: `5d25445faf57fa83410b57faf5eaf1f437949129`
- TREE: `f9df989d7e7120d8742d4001b045fdd11cb0cb03`
- PR: qore-core #481
- Issue: qore-core #473

Verify exact START/TREE and clean workspace before recovery.

## Mandatory partial-candidate recovery

The exact partial candidate preserved from the interrupted run is stored as ordered bzip2/base64 fragments:

1. `harness/engineer/recovery/qore-trader-lab-001-correction-002-partial.patch.bz2.b64.part01`
2. `harness/engineer/recovery/qore-trader-lab-001-correction-002-partial.patch.bz2.b64.part02a`
3. `harness/engineer/recovery/qore-trader-lab-001-correction-002-partial.patch.bz2.b64.part02b`
4. `harness/engineer/recovery/qore-trader-lab-001-correction-002-partial.patch.bz2.b64.part02c`
5. `harness/engineer/recovery/qore-trader-lab-001-correction-002-partial.patch.bz2.b64.part02d`
6. `harness/engineer/recovery/qore-trader-lab-001-correction-002-partial.patch.bz2.b64.part03`

From the qore-core workspace, concatenate them from the reviewer checkout in exactly that order, base64-decode, then bzip2-decompress to `/tmp/qore-trader-lab-correction002-partial.patch`.

The decompressed patch SHA-256 MUST equal:

`d63a30aad13ae1fc300e4784a1971efe39d7cd2301fd178850a677a37728b43a`

Then run `git apply --check` and `git apply`. If the SHA, binding, or apply check differs, fail closed. Do not reconstruct by hand.

This partial patch already includes the exact predecessor Resume-001 correction and the work performed before quota exhaustion. Do not re-apply the old Resume-001 patch separately after this recovery.

## Durable predecessor findings — already established

The interrupted run already used semantic LSP and established:

- hover on `TraderLabEvidenceReference`: successful;
- go-to-definition on `ResearchRunStrategyBinding`: successful;
- IA-R1 governed evidence authenticity: MATERIAL;
- IA-R2 research/stress semantic evidence: MATERIAL;
- IA-R3 Monte Carlo thresholds must actually participate in qualification: MATERIAL;
- IA-R4 nested recursive trust-boundary revalidation: MATERIAL;
- IA-R5 canonicalization residuals confirmed, including Decimal canonicalization and ordering/fingerprint consistency.

Repository evidence already mapped:

- economic producer family: `ResearchReturnObservation` / `ResearchEconomicResult`;
- Research-stage evidence: `ResearchEvaluationFreezeEvidence`;
- OOS-stage evidence: `ResearchFrozenOosEvidence`;
- no in-repo authoritative digest producer was found for Risk/CIBO/Independent Validation; those gates therefore require an explicit governed binding/seam and must fail closed rather than treating arbitrary UUID/digest/kind labels as authentic evidence.

Do not repeat repository-wide discovery merely to rediscover these facts. Use LSP only where needed to continue implementation and for mandatory post-stabilization revalidation.

## Exact resume point

Resume from the partially implemented candidate, with priority on the unfinished `stage_evidence` / governed-gate work:

1. finish stage-specific evidence semantics so Research cannot be represented by a later OOS evidence kind;
2. finish governed authenticity/binding for Risk, CIBO, Economic and Independent Validation gates, using real authoritative producers when they exist and explicit fail-closed evidence-dependent seams when they do not;
3. ensure arbitrary UUID/digest/kind labels cannot self-certify a promotion gate;
4. make frozen Monte Carlo thresholds participate in the qualification decision, not merely identity/fingerprint storage;
5. recursively revalidate nested material against reflective corruption, invalid nested state, StrEnum/string value-equality laundering, subclass laundering and bool/int laundering;
6. close local canonicalization residuals without changing economic semantics: Decimal canonical form, deterministic threshold ordering/logical values/fingerprints, supplementary evidence ordering where semantically unordered;
7. preserve all F1-F18 corrections already closed by predecessor work and re-audit only for regressions caused by these residual changes.

## Hard laws

- `NO VALID TRADER LAB PROMOTION EVIDENCE -> NO DEMO_ELIGIBLE -> NO DEMO ADMISSION`.
- Every Trader version qualifies individually; no cohort inheritance.
- A typed reference is not proof of authentic governed evidence by itself.
- Monte Carlo thresholds frozen before outcome inspection must be enforced in promotion.
- weak/ambiguous evidence -> `INSUFFICIENT_EVIDENCE`, never optimistic promotion.
- no hidden RNG, seed hunting, retry-to-pass, lookahead, hidden wall clock or chronology changes.
- no CIBO self-promotion, no Risk bypass, no provider-native execution authority, no Production or real-capital authority.
- exact runtime types at trust boundaries; `bool != int`; recursively revalidate nested material.
- provider-neutral Core; no concrete provider/model dependency leakage.

## Required work discipline

Use semantic LSP before touching a symbol whose ownership/impact is not already established, and mandatory LSP after stabilization (`hover`, `findReferences`, `goToDefinition`, `goToImplementation` where supported).

Preserve append-only durable checkpoint memory with PHASE, binding, findings, decisions, evidence, uncertainties, work already inherited, work newly completed, what remains, exact resume point and next action.

Do not mark the batch complete until all residuals above are closed or explicitly fail-closed as genuine external evidence-dependent seams.

## Quality gate

Run focused normal + adversarial tests, then canonical FULL QG:

- `ruff check .`
- `mypy src tests`
- `pytest --cov=src/qore --cov-report=term-missing`
- `git diff --check`

No test weakening, `type: ignore` concealment, lint suppression, unjustified skip/xfail, coverage gaming or semantic relaxation.

## Final output

When genuinely complete, produce the F1-F18 + IA-R1..R5 closure matrix, changed-file/diff stats, LSP evidence, focused-test evidence, FULL-QG evidence, remaining external evidence-dependent seams, and literal terminal markers:

`## RESUME STATE`
`COMPLETE`

`CANDIDATE_READY_FOR_EXTERNAL_QG`

The next host gate is IA adjudication -> exact materialization on PR #481 -> native QORE CI/FULL QG -> HEAD/TREE/SYNTHETIC freeze -> fresh DeepSeek Expert. Do not dispatch reviewers from inside Harness.

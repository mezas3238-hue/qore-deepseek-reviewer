# QORE TRADER LAB — CORRECTION 001 / RECOVERY RESUME 001

## Purpose

Resume the interrupted Trader Lab correction from durable predecessor evidence without repeating completed research/subagent lanes.

This is NOT a restart. The predecessor six-lane swarm completed and its reports were consumed before the host rejected a non-semantic checkpoint binding annotation. The predecessor candidate patch was durably recovered.

## Immutable predecessor evidence

- predecessor package: `HARNESS-ENGINEER-QORE-TRADER-LAB-001-CORRECTION-001`
- predecessor run: `33697103670`
- predecessor job: `100468241466`
- artifact: `9873043023`
- artifact digest: `sha256:05caade57e4a9bf9c95af208a54636e814b8eb37662d81d9f3b98abcaaa19464`
- exact qore-core START: `5d25445faf57fa83410b57faf5eaf1f437949129`
- exact TREE: `f9df989d7e7120d8742d4001b045fdd11cb0cb03`
- recovered patch SHA256: `954a33e9e2f828bef82562910e5fe3f1509ea5f1b49f68bb39f33881eb89dfc3`
- recovered patch archive text path in reviewer checkout: `harness/engineer/recovery/qore-trader-lab-001-correction-001.patch.gz.b64`

## Mandatory first actions

1. Verify qore-core HEAD and TREE equal the immutable START/TREE above.
2. **DO NOT relaunch predecessor subagent lanes 1-6.** Their durable result is `COMPLETED`.
3. Restore the predecessor patch exactly from the reviewer checkout. From the qore-core workspace, reviewer repo root is `../..`:
   - `base64 -d ../../harness/engineer/recovery/qore-trader-lab-001-correction-001.patch.gz.b64 | gzip -dc > /tmp/qore-trader-lab-recovered.patch`
   - verify `sha256sum /tmp/qore-trader-lab-recovered.patch` equals `954a33e9e2f828bef82562910e5fe3f1509ea5f1b49f68bb39f33881eb89dfc3`
   - run `git apply --check /tmp/qore-trader-lab-recovered.patch`
   - run `git apply /tmp/qore-trader-lab-recovered.patch`
4. Confirm the recovered diff is exactly 11 files and initial recovered stat is `+1367/-168` before new continuation edits.
5. Append a canonical checkpoint with the EXACT binding line only: `binding: START=5d25445faf57fa83410b57faf5eaf1f437949129 TREE=f9df989d7e7120d8742d4001b045fdd11cb0cb03`. **No suffix or annotation is permitted on the binding line.**
6. Mark lanes 1-6 `COMPLETED` as predecessor carry-forward evidence. Do not claim they were re-executed in this resume run.

## Recovered synthesis state

Predecessor report IDs: `4600a964`, `95e8b66c`, `09b124f7`, `30ed1cbf`, `1673ef34`, `5027d588`.

Semantic LSP before synthesis was already completed over `TraderLabCandidateBinding`, `TraderLabEvidenceKind`, `TraderLabStageEvidenceRecord`, `TraderLabEvidenceReference`, `ResearchRunStrategyBinding`, `ResearchFrozenOosEvidence`, `evaluate_demo_eligibility`, `reference_research_frozen_oos`, and `validate_trader_lab_lifecycle`.

Decisions already made and carried forward:
- F1: stage/evidence-kind contract plus self-authenticating/reference lineage semantics.
- F2: helper candidate binding and exact strategy-lineage checks.
- F3: economic evidence mandatory; remove opt-out; require `ECONOMIC_EVALUATION`.
- F4: recursive candidate/stage/nested fingerprint revalidation plus typed timestamps.
- F6/F7/F8/F9/F10/F11/F12/F14/F18: close now where safely coupled.
- F5/F13/F15/F16: may remain deferred only if explicitly documented and non-material after testing.
- shared replay chronology digest for F8.
- terminal timestamp canonical UTC for F14.
- exact-int protection for F18.

Recovered patch already modifies:
- `src/qore/infrastructure/trader_lab/__init__.py`
- `src/qore/infrastructure/trader_lab/candidate.py`
- `src/qore/infrastructure/trader_lab/fast_forward.py`
- `src/qore/infrastructure/trader_lab/lifecycle.py`
- `src/qore/infrastructure/trader_lab/promotion.py`
- `src/qore/infrastructure/trader_lab/robustness.py`
- `src/qore/infrastructure/trader_lab/stage_evidence.py`
- `tests/infrastructure/trader_lab/conftest.py`
- `tests/infrastructure/trader_lab/test_candidate_and_stage_evidence.py`
- `tests/infrastructure/trader_lab/test_lifecycle_and_promotion.py`
- `tests/infrastructure/trader_lab/test_robustness.py`

Predecessor pending next action at timeout: finish F2 lineage + F10 tests in `test_robustness.py`, then complete implementation/testing/synthesis.

## Required completion

Close the four MATERIAL Expert findings from PR #481:

- F1 evidence provenance/kind laundering/fabricated digest acceptance.
- F2 cross-candidate evidence reuse.
- F3 economic-evidence bypass/kind gap.
- F4 shallow trust-boundary revalidation / reflective corruption acceptance.

Then run focused tests repeatedly until green, perform semantic LSP post-stabilization, audit changed paths, and prepare the candidate for host FULL QG.

Do not weaken tests, fabricate external evidence, add Production/execution authority, or change outside the allowed Trader Lab paths/doc.

## Durable completion law

Every checkpoint must preserve exact completed work, findings closed, tests run, uncertainties, pending action, and safe resume instruction.

The machine-semantic binding line MUST always be exactly:
`binding: START=5d25445faf57fa83410b57faf5eaf1f437949129 TREE=f9df989d7e7120d8742d4001b045fdd11cb0cb03`

When truly complete, emit literal:

## RESUME STATE
COMPLETE

and `CANDIDATE_READY_FOR_EXTERNAL_QG`.

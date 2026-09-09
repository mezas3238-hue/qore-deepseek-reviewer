# QORE CORE — HARNESS MINIMAL SUCCESSOR WORK PACKAGE

## Trader Historical Intelligence Registry — COMPLETE ONLY THE REMAINING GATES AFTER HARNESS -008

Repository under test: `mezas3238-hue/qore-core`

Immutable baseline:
- START `e632a6bf999b22544125b1208c2fcf6475d5f5ed`
- TREE `a638f7a1af8709441a1b240002ca61f51eac7320`

Immediate predecessor:
- package `HARNESS-ENGINEER-QORE-TRADER-HISTORY-POST-FALSIFICATION-INTEGRITY-CLOSURE-008`
- run `34369410276`
- artifact `10113034846`
- artifact digest `sha256:0b251f67c49b363364dff373494af1a672a1262d4fbbbc1f39846776cd73c6cc`
- recoverable artifact patch SHA-256 `398309059e711445307cfbc515e32ba4e2deb9e4d962c80aba3c23ed26ff50c1`

Harness -008 is NOT certified. It terminated with `ENGINEERING_SESSION_BUDGET_EXHAUSTED_RECOVERABLY` after all four Engineer sessions were consumed while L6 remained non-terminal. The monotonic-checkpoint salvage mechanism itself did not fail.

## DO NOT REPEAT VALID WORK

Preserve the predecessor's durably valid completed engineering state:
- L1 COMPLETED
- L2 COMPLETED
- L3 COMPLETED
- L4 COMPLETED
- L5 COMPLETED

Do NOT rerun L1-L5, do NOT reopen F1-F9/D1-D3 indiscriminately, and do NOT spend sessions re-summarizing already adjudicated work.

The only permitted reasons to reopen a previously completed lane are:
1. L6 produces a new material finding that invalidates that lane's closure argument; or
2. deterministic host validation proves the inherited binding/patch/checkpoint evidence is inconsistent.

If neither condition occurs, L1-L5 remain inherited COMPLETE.

## RECOVERY AUTHORITY AND HASH DISCREPANCY

The artifact actually delivered by -008 contains the same recoverable patch bytes as -007, SHA-256:

`398309059e711445307cfbc515e32ba4e2deb9e4d962c80aba3c23ed26ff50c1`

Engineer-session metadata also mentioned an observed candidate hash:

`f23283b57ed5429e17d49f5621d03e64bf00e52220a4f64ffc3d545ead94639e`

but -008 did NOT publish a final candidate with reproducible bytes bound to that hash and `final_candidate_patch_sha256` remained null.

Therefore:
- Treat `398309...` as the only recoverable starting patch unless the host can reproduce exact bytes for `f232...` from durable artifact evidence.
- Never certify a model-reported hash without exact bytes.
- After the last permitted mutation, deterministically regenerate/freeze the final candidate patch and record its exact SHA-256.
- The final candidate hash used by Internal Expert and FULL QG must bind to the exact same bytes.

## MISSION — ONLY WHAT REMAINS

Complete the predecessor, not the whole campaign again.

### R1 — Finish L6 fresh

L6 is the only engineering lane that remains incomplete.

L6 must perform the required final integration/reachable-path/call-site correctness review over the exact recovered/final candidate with semantic LSP evidence.

Requirements:
- use a fresh L6 generation;
- examine exact runtime reachability and integration semantics relevant to the already-implemented Trader History/CIBO closure;
- verify the final candidate, not a stale intermediate representation;
- record durable canonical checkpoint state;
- terminate L6 as CLEAN only if no material defect remains.

If L6 finds a material defect:
- repair only the causal family exposed by that finding;
- invalidate only the completed lanes materially affected by that mutation/finding;
- rerun those affected checks as necessary;
- launch a fresh L6 generation over the corrected candidate;
- L6 must be CLEAN after the LAST mutation.

Do not wait passively for asynchronous subagent state across multiple sessions. If a subagent fails to return, use the remaining Engineer authority to obtain a durable terminal L6 result without regressing completed checkpoints.

### R2 — Freeze one exact candidate

After L6 is CLEAN:
- generate the candidate patch from exact START/TREE;
- enforce allowed paths and change budgets;
- reject generated files, `.coverage*`, pyc/cache artifacts or unrelated changes;
- record changed files, patch SHA-256 and exact START/TREE binding;
- ensure all subsequent gates consume exactly these candidate bytes.

### R3 — Independent Internal Expert audit-repair

Run the reserved Internal Expert only after all six engineering lanes are durably complete.

The Internal Expert must independently attempt to falsify the exact frozen candidate against the already-defined material families F1-F9 and D1-D3, focusing effort on residual cross-family/integration defects rather than repeating completed engineering narration.

If Internal Expert finds a material defect:
- repair it under the audit-repair contract;
- produce a new candidate hash;
- revalidate only affected engineering closure plus fresh L6 as required by mutation;
- rerun Internal Expert on the new exact candidate until CLEAN or explicitly BLOCKED.

Terminal requirement: `internal_expert_clean == true` bound to the exact final candidate hash.

### R4 — Canonical FULL QORE Quality Gate

Only after Internal Expert CLEAN, the deterministic host must run exactly:

- `ruff check .`
- `mypy src tests`
- `pytest --cov=src/qore --cov-report=term-missing`

All three must PASS on the exact candidate consumed by Internal Expert.

No weakening tests, Ruff, mypy strictness, coverage, fail-closed semantics, or exclusions. No `type: ignore`, skip/xfail, generated coverage files in the patch, or scope laundering.

### R5 — Final exact-candidate revalidation

After FULL QG:
- regenerate or re-hash the candidate patch;
- prove bytes/hash are unchanged from the Internal Expert/QG candidate;
- prove START/TREE unchanged;
- prove changed files remain within allowlist and budgets;
- produce artifact-only completion evidence.

## MATERIAL FAMILIES — PRESERVE, DO NOT REINVESTIGATE BY DEFAULT

The candidate must continue to preserve the already-closed invariants/families:
- F1 authority-backed certification; no caller self-certification.
- F2 temporal knowledge boundary/no lookahead.
- F3 contradictions cannot disappear at CIBO boundary.
- F4 append-only/reconstruction continuity with authoritative root.
- F5 hypothesis/supersession causality and future-invariance.
- F6 exact Trader/version isolation and holdout governance separation.
- F7 derived specialty/freshness/scopes and joint-scope semantics.
- F8 canonical Trader identity and Registry-governed CIBO path.
- F9 duplicate holdout dataset fingerprint rejection.
- D1 no supersession lookahead.
- D2 no Cartesian joint-scope laundering.
- D3 no ledger truncation acceptance without authoritative external root.

Supreme invariants remain unchanged:

`CERTIFIED == VERIFIED AUTHORITY-BACKED EVIDENCE, NEVER CALLER ASSERTION`

`CURRENT CAPABILITY(T) == ONLY KNOWLEDGE AUTHENTIC AND AVAILABLE AT T`

`TRADER HISTORY IS APPEND-ONLY ACROSS RECONSTRUCTION, NOT ONLY INSIDE ONE OBJECT INSTANCE`

`CIBO CAPABILITY == PROJECTION OF VERIFIED CURRENT TRADER HISTORY`

`CIBO CANNOT FABRICATE SPECIALTY, CERTIFICATION, FRESHNESS, SCOPE OR STAGE`

`CONTRADICTION != POSITIVE EVIDENCE`

`MARKET/TIMEFRAME/REGIME/SESSION SCOPE IS JOINT, NOT CARTESIAN`

`ONE TRADER IDENTITY CONVENTION / ONE CANONICAL BUILDER ACROSS TRADER LAB, REGISTRY AND CIBO`

## TERMINAL ACCEPTANCE

This successor is complete only when ALL are true:
- inherited L1-L5 remain valid or any specifically invalidated lane is reclosed;
- L6 is fresh, durably COMPLETE and CLEAN after the last mutation;
- exactly one reproducible final candidate patch/hash exists;
- the `f232...` vs `398309...` discrepancy is resolved by exact bytes, not assertion;
- Internal Expert has run and is CLEAN on that exact candidate;
- canonical FULL QORE QG is GREEN;
- final candidate revalidation proves no mutation after review/QG;
- artifact contains sufficient evidence for Architect audit;
- no push, commit, merge or Production action occurs.

External DeepSeek Expert is NOT part of this Harness package. It remains the next separate gate only after the Architect audits a successful Harness artifact.
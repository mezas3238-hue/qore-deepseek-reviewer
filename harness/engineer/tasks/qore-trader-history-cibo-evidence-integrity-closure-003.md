# HARNESS ENGINEER — QORE TRADER HISTORY / CIBO EVIDENCE-INTEGRITY CLOSURE 003

## PACKAGE

`HARNESS-ENGINEER-QORE-TRADER-HISTORY-CIBO-EVIDENCE-INTEGRITY-CLOSURE-003`

## AUTHORITY / BINDING

Repository under repair: `mezas3238-hue/qore-core`

Exact candidate PR: `#502`

Exact start HEAD: `26c91740dfae5790f80517fb7e8023ba59c1c970`

Exact start TREE: `c8669162bfc6f8ea653c9ecc5c87a67b68cf3c83`

Parent PR #500 HEAD remains `c283c9d793ca04b7477d32f5cd0969de9a304195`.

Artifact-only. Do not push, commit, merge, retarget, or mutate qore-core. Return a bounded candidate patch and evidence only.

## MISSION

Close the remaining semantic family that can contaminate the Trader Historical Intelligence Registry or cause CIBO to consume knowledge under the wrong Trader, wrong scientific lineage, or unsupported market/timeframe scope.

This is not a request to optimize tests or widen authority. The objective is scientific identity/evidence integrity so CIBO cannot learn false associations.

Canonical laws:

- `TRADER HISTORY IS APPEND-ONLY`
- `CURRENT CAPABILITY = PROJECTION OF CERTIFIED HISTORICAL EVIDENCE`
- `HYPOTHESIS != OBSERVATION != CERTIFIED FACT`
- `NEW TRADER VERSION != MUTATION OF OLD HISTORY`
- `INSUFFICIENT SAMPLE != POSITIVE EVIDENCE`
- `CIBO MUST NEVER CONSUME CROSS-TRADER OR UNSUPPORTED CAPABILITY CLAIMS`
- `SAME MARKET HOLDOUT MAY BE COMPARABLE ACROSS DIFFERENT TRADERS; IT MUST NOT BE REUSED TO RE-CERTIFY THE SAME TRADER LINEAGE AFTER LEARNING FROM IT`

## MATERIAL FINDINGS TO REPRODUCE FIRST

### F1 — holdout ownership is incorrectly global across all Traders

Current `_check_partition_governance()` tracks external-validation ownership only by `dataset_fingerprint` and `study_id` across the entire registry.

Consequence: the same legitimate OOS market window cannot be recorded for VT-01 and VT-08, even though cohort comparison requires multiple independent Traders to be evaluated on the same external market sample.

Required semantics:

- holdout consumption/reuse protection must be scoped to the Trader lineage, not globally across unrelated Traders;
- at minimum, the anti-reuse key must preserve `trader_code` + holdout content identity so VT-01 and VT-08 may both consume the same OOS dataset independently;
- a later version/config/methodology of the SAME trader_code must not be allowed to relabel/reuse an already consumed external-validation dataset as a fresh holdout after learning from it;
- dataset role relabeling must likewise be evaluated in the correct lineage scope: same Trader lineage cannot relabel holdout content as development/calibration, while unrelated Traders are not automatically contaminated merely because they are evaluated on the same historical market window;
- preserve deterministic behavior and fail closed on ambiguous/corrupted identity.

Required adversarial controls:

1. Same `dataset_fingerprint`, EXTERNAL_VALIDATION, VT-01 study + VT-08 study => allowed.
2. Same `dataset_fingerprint`, EXTERNAL_VALIDATION, VT-08 v1 + VT-08 v2 after change => blocked as reused holdout.
3. Same Trader lineage: holdout content relabeled DEVELOPMENT under new partition id => blocked.
4. Different Trader lineage: same dataset may be DEVELOPMENT/EXTERNAL only if this is semantically valid under the chosen governance model; if role semantics themselves represent global dataset contamination, justify that explicitly. Do not accidentally prohibit cohort-wide comparative OOS.
5. Exact idempotent replay remains a no-op success.

### F2 — hypothesis verdict may cross Trader identity

Current `_check_hypothesis_lineage()` requires the verdict version fingerprint to differ from the parent, but does not require the same `trader_code`.

Consequence: a hypothesis born from VT-08 can be confirmed/falsified by VT-17 and pollute longitudinal biography.

Required semantics:

- hypothesis, confirmation and falsification must remain within the same exact Trader identity family / `trader_code`;
- confirmation/falsification must still bind a NEW exact Trader version (fingerprint change) where required;
- cross-Trader parent/verdict lineage must fail closed;
- preserve fresh-holdout requirement for confirmation;
- no hypothesis laundering across codes, versions, methodologies, or configs.

Required adversarial controls:

1. VT-08 hypothesis -> VT-17 confirmation => blocked.
2. VT-08 hypothesis -> VT-17 falsification => blocked.
3. VT-08 hypothesis -> changed VT-08 exact version with fresh holdout => allowed when otherwise valid.
4. Same exact VT-08 version verdict => blocked.

### F3 — CIBO adapter accepts caller-declared qualified markets/timeframes without evidence binding

`project_cibo_capability_profile()` currently validates cross-Trader identity and config, but accepts `qualified_markets` and `qualified_timeframes` supplied by the caller without proving they are backed by current certified historical evidence.

Consequence: history containing only EUR/USD H1 evidence could be projected into a CIBO profile claiming qualification for XAUUSD M5. That can mislead CIBO's later selection logic even though no evidence supports the claim.

Required semantics:

- CIBO-facing `qualified_markets` and `qualified_timeframes` must not exceed the scopes supported by CURRENT certified, sufficient, non-superseded, non-contradictory evidence at `freshness.as_of`;
- unsupported requested market/timeframe must fail closed, not silently become qualification;
- stale/future/superseded/insufficient/exploratory evidence must not authorize qualification;
- a contradictory metric in one scope must not magically create positive qualification; define and justify whether presence of other certified non-contradictory evidence for that same scope is sufficient;
- avoid fabricating `best market`, recommendation, DEMO eligibility, Risk authority, execution authority, or confidence;
- if the correct design is to derive qualified scopes from the Registry rather than accept them from the caller, prefer the minimal architecture-compatible approach and document it. Do not duplicate `CiboTraderCapabilityProfile`.

Required adversarial controls:

1. Registry only EUR/USD H1; caller requests EUR/USD H1 => success when valid evidence exists.
2. Registry only EUR/USD H1; caller requests XAUUSD H1 => Failure.
3. Registry only EUR/USD H1; caller requests EUR/USD M5 => Failure.
4. Scope appears only in exploratory/insufficient/stale/future evidence => Failure.
5. Mixed valid scopes preserve deterministic canonical ordering.
6. Cross-Trader identity test from the current candidate must remain GREEN.

## ROOT-FAMILY EXHAUSTION

Do not stop at the three witnesses. Explore adjacent causal space:

- Trader code vs exact version fingerprint vs config/methodology changes;
- same dataset under multiple partition ids;
- same partition id under multiple Traders;
- same dataset role across Traders vs within one Trader lineage;
- hypothesis parent/version/cross-code permutations;
- superseded/stale/future evidence at CIBO projection cutoff;
- market-only, timeframe-only and joint market+timeframe claims;
- evidence refs shared across studies/scopes;
- contradictions and insufficient evidence;
- corrupted retained exact types and post-construction tampering;
- deterministic replay/reordering;
- 31 Trader catalog compatibility, not only first five.

Produce an explicit closure argument: why the corrected model prevents CIBO from learning a Trader's evidence under another Trader or under an unsupported market/timeframe while still permitting scientifically valid cohort comparison on common market holdouts.

## 6 REQUIRED LANES — NON-DUPLICATIVE

Use exactly six lanes/subagents and retain evidence:

1. Architecture/contracts/identity lineage.
2. Holdout governance and cohort-comparison semantics.
3. Hypothesis/version causal lineage adversarial analysis.
4. CIBO projection/evidence-scope integrity.
5. Property/metamorphic/exact-runtime-type exploration.
6. Integration/regression/call-sites/docs/QG.

Semantic LSP evidence required: definitions, references, implementations where applicable, hover/type inspection, call sites of modified symbols, and final recheck.

Use HIGH reasoning generally and MAX on identity/holdout/CIBO-evidence contradictions and closure.

## ALLOWED CHANGE SURFACE

Only modify what is necessary inside the allowed paths of the immutable request. Prefer the current Registry files/tests/docs. Do not alter Risk, execution gateways, broker code, secrets, workflows, or Production/LIVE surfaces.

## FULL QUALITY GATE — MANDATORY

Run exactly:

`ruff check .`

`mypy src tests`

`pytest --cov=src/qore --cov-report=term-missing`

No `type: ignore`, unjustified `noqa`, strictness reduction, skip/xfail hiding defects, weakened tests, reduced coverage scope, or fabricated evidence.

## OUTPUT

Return an artifact-only candidate containing:

- final `candidate.patch`;
- patch SHA-256;
- exact start HEAD/TREE;
- changed-file list and diff size;
- reproduction evidence for F1/F2/F3;
- six-lane/subagent evidence;
- LSP evidence;
- adversarial/property/metamorphic test evidence;
- FULL QG evidence;
- root-family closure report;
- explicit statement that the patch grants no DEMO/LIVE/Production/Risk/execution authority.

Terminal result must be one of:

`CANDIDATE READY — CIBO/TRADER HISTORY EVIDENCE-INTEGRITY FAMILY EXHAUSTED`

or

`BLOCKED / FURTHER MATERIAL FAMILY FOUND`.

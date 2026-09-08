# HARNESS ENGINEER — QORE TRADER HISTORICAL INTELLIGENCE REGISTRY RECOVERY CLOSURE 002

## Mission

Close the unfinished Trader Historical Intelligence Registry front by recovering and completing the valid work already produced by the failed predecessor package. Do **not** restart the implementation from zero and do **not** duplicate already-valid code.

Target repository: `mezas3238-hue/qore-core`
Active protected work context: PR `#500` remains DRAFT.
Exact recovery base binding:
- START: `c283c9d793ca04b7477d32f5cd0969de9a304195`
- TREE: `6d9a3728ddfbc2161171af1315c59ff1f0adf3d6`

Predecessor package:
- `HARNESS-ENGINEER-QORE-TRADER-HISTORICAL-INTELLIGENCE-REGISTRY-001`
- workflow run: `34262302561`
- recovery artifact id: `10071755323`
- recovery artifact digest: `sha256:cb951a968e20d0c1b633587d4a76943f25c3a41d9a3e2c54e5c5156e96157959`
- recovered candidate patch SHA256: `c5f449a589ab602e2ee58acff9992407e9ed73cc1cedb9ea7e962fcd9f9b11e9`

The predecessor workflow failed because the durable lane checkpoint state became corrupt after the 2100-second Engineer generation timeout (`CORRUPT_ENGINEER_CHECKPOINT: unknown lane state for lane 1: IN_PROGRESS`). This is not evidence that the code is semantically bad, and it is not evidence that it is clean. Treat the recovered patch as an **untrusted recovery candidate** that must be independently completed and certified.

The recovered patch already contains approximately 3,591 insertions across these eight files:
- `docs/architecture/QORE-TRADER-HISTORICAL-INTELLIGENCE-001.md`
- `src/qore/infrastructure/trader_history/__init__.py`
- `src/qore/infrastructure/trader_history/cibo_adapter.py`
- `src/qore/infrastructure/trader_history/contracts.py`
- `src/qore/infrastructure/trader_history/registry.py`
- `tests/infrastructure/trader_history/test_trader_history_cibo_adapter.py`
- `tests/infrastructure/trader_history/test_trader_history_contracts.py`
- `tests/infrastructure/trader_history/test_trader_history_registry.py`

The predecessor transcript stated that all six lanes had reported and that a full suite had reached `7100 passed`, then began applying material correctness fixes, explicitly including that a hypothesis must carry an id. Because the durable state did not retain those lane completions and the workflow never reached final scope gate, Internal Expert CLEAN, FULL QG host certification, or terminal candidate-ready state, **none of those claims may be accepted by inheritance**. Reproduce and certify them.

## Canonical objective

Deliver a provider-neutral, deterministic, append-only **Trader Historical Intelligence Registry** that preserves the complete scientific/technical biography of every exact Trader version and deterministically derives a current evidence-backed capability view without laundering exploratory evidence into certified facts.

Canonical laws:
- `TRADER HISTORY IS APPEND-ONLY`
- `CURRENT CAPABILITY = PROJECTION OF CERTIFIED HISTORICAL EVIDENCE`
- `HYPOTHESIS != OBSERVATION != CERTIFIED FACT`
- `NEW TRADER VERSION != MUTATION OF OLD HISTORY`
- `INSUFFICIENT SAMPLE != POSITIVE EVIDENCE`
- `FAILED GATE != END OF RESEARCH`

Do not replace existing `CiboTraderCapabilityProfile`, Trader Lab, Risk, CIBO review or dossiers. Compose them through explicit adapters/projections.

## Recovery-first execution rule

1. Verify exact START/TREE binding.
2. Restore the predecessor patch from recovery artifact `10071755323` and verify patch SHA256 exactly `c5f449a589ab602e2ee58acff9992407e9ed73cc1cedb9ea7e962fcd9f9b11e9` **before additional implementation/API spend**.
3. Confirm the restored patch changes only allowed paths and is based on the exact bound START/TREE.
4. Audit the recovered implementation rather than recreating it.
5. Repair every material defect found, including incomplete hypothesis identity/lifecycle semantics and any neighboring causal family.
6. Re-run all six Harness lanes with valid durable terminal states. A predecessor transcript or corrupted checkpoint is not lane evidence.
7. Run independent Internal Expert falsification/repair until CLEAN.
8. Run FULL QORE quality gate on the exact final patch.
9. Revalidate exact candidate after FULL QG and produce terminal closure evidence.

If the recovery patch cannot be verified or applied exactly to the bound START/TREE, fail closed and report the mismatch. Do not silently regenerate an unrelated candidate.

## Functional closure requirements

The final candidate must fully satisfy the original Historical Intelligence contract, including:

### Longitudinal exact identity
Every study/result binds exact Trader identity/version, software revision where applicable, methodology family/version, exact config fingerprint, study identity/version, dataset/partition/evidence identity, market/timeframe scope, timezone-aware timestamp, provenance/producer, study kind, epistemic state and sufficiency state.

A new code/config/methodology identity creates a new historical version. Old evidence can never be overwritten, relabeled or used to certify a new version.

### Append-only ledger
Retain immutable, deterministic records for replay/backtest, fast-forward, walk-forward/OOS, stress/adversarial, Monte Carlo, economic evaluation, Risk review, CIBO review, independent validation, DEMO observation/certification when real evidence exists, characterization, failure analysis, hypothesis, falsification/confirmation and return-to-Lab/remediation history.

Identical replay may be idempotent only when semantically identical. Same logical identity with contradictory payload fails closed.

### Epistemic and sufficiency safety
Represent and enforce explicit distinctions equivalent to observed/descriptive, inferred/diagnostic, hypothesis, falsified, certified, insufficient evidence, stale/superseded. Unsupported quantitative claims, sparse samples, contradictory findings or consumed holdouts cannot be projected as current certified capability.

### Capability dimensions
Support evidence-backed market/instrument, timeframe, side, session/time bucket, explicit regime, setup/fill funnel, exit reason, sample/trade counts, expectancy, win rate, payoff distribution, profit factor, drawdown/tails, MAE/MFE, duration, turnover/cost/slippage/spread drag, parameter robustness/fragility, Monte Carlo robustness/risk-of-ruin, favorable/adverse/degraded conditions, abstain/reduce/suspend/return-to-Lab conditions, limitations and missing evidence.

Missing values remain missing/insufficient, never synthetic zero or optimism.

### Current capability projection
Projection must be deterministic, exact-version/config compatible, market/timeframe/regime specific, contradiction-preserving, evidence-ref backed, sufficiency aware, and unable to create `DEMO_ELIGIBLE`, Risk bypass, execution authority or Production/LIVE authority.

Where exact, project into existing `CiboTraderCapabilityProfile`; CIBO may consume but never mutate historical truth.

### Study/hypothesis lineage
Retain traceable chain:
`study evidence -> finding -> diagnosis -> hypothesis -> change proposal -> new Trader version -> fresh holdout -> confirmation/falsification`.

Every hypothesis must have stable explicit identity sufficient to distinguish, trace, confirm or falsify it deterministically. Adopting a code change never certifies the hypothesis by itself.

Consumed OOS/holdout evidence cannot become fresh validation for a modified version.

### Generic Trader support
No hard-coding to only VT-01/08/09/17/31. All 31 current Trader identities must be representable. First-cohort deterministic fixtures/adapters may be used, but do not fabricate conclusions from still-incomplete external evidence.

### Queries/read model
Must answer deterministically: studies performed, favorable/adverse/insufficient markets, explicit regimes/sessions/sides, current evidence-backed economic/risk view with refs, failures/diagnoses/hypotheses, hypothesis outcomes, version-to-version evidence differences, stale/contradicted/sparse/missing evidence and consumed holdouts. Do not infer a "best market" unless comparability and sufficiency are explicitly satisfied.

## Six mandatory lanes — must be durably completed 6/6

1. **Architecture / canonical contracts / exact identity** — append-only aggregate, exact version/config types, reuse canonical contracts, no parallel semantics.
2. **Evidence lineage / epistemic status / sufficiency** — provenance, hypothesis identity, contradictions, sparse samples, stale/superseded evidence, consumed holdouts.
3. **Trader Lab integration / dossier / diagnosis / hypothesis lifecycle** — conversions, no hindsight/OOS laundering, remediation/new-version chain.
4. **Capability projection / CIBO integration** — deterministic evidence-ref-backed current projection with no authority widening.
5. **Adversarial/property/metamorphic falsification** — duplicates/reordering, identity mismatch, nested immutability, exact runtime types, chronology/timezones, projection replay determinism.
6. **Integration impact / reachable paths / regression / closure** — semantic LSP refs/call sites, all-31 representability, docs, FULL QG, root-family exhaustion.

Exactly six non-duplicative lanes and six corresponding subagents are required. Do not mark inherited predecessor lanes complete; revalidate them against the recovered candidate and persist valid terminal lane states.

## Semantic LSP requirement

Before and after repairs, retain meaningful evidence for modified/canonical symbols using goToDefinition, findReferences, goToImplementation where applicable, hover, call-site inspection and final reference recheck. Missing meaningful LSP evidence blocks readiness.

## Root-family exhaustion / adversarial families

Use HIGH reasoning generally and MAX for identity/version lineage, append-only semantics, epistemic classification, hypothesis lifecycle, OOS/holdout consumption, contradiction/sufficiency, capability projection and closure.

Exhaust at minimum:
- same study id / different payload;
- exact idempotent duplicate;
- evidence reused across versions;
- version/config mismatch laundering;
- missing/duplicate hypothesis identity;
- confirm/falsify wrong hypothesis/version;
- hypothesis mutation after ingestion;
- timezone-naive timestamps and chronology edges;
- duplicate/reordered ingestion;
- mutable nested payload corruption;
- bool-as-int and float-as-Decimal laundering where applicable;
- unsupported metric without compatible evidence ref;
- sparse sample presented as favorable/certified;
- contradictory market/regime findings;
- stale/superseded evidence presented as current;
- hypothesis presented as observation/certification;
- consumed holdout presented as fresh;
- projection changing historical ledger;
- replay/order changing deterministic projection;
- CIBO/manager gaining promotion, Risk, execution or Production authority.

## Mandatory tests

Prove at minimum:
- historical record cannot be deleted/overwritten;
- identical replay is deterministic;
- contradictory duplicate fails closed;
- old-version evidence cannot certify new version;
- config mismatch fails closed;
- hypothesis identity is mandatory/stable and wrong-id transitions fail closed;
- unsupported metrics fail closed;
- insufficient sample cannot become certified favorable capability;
- contradictions remain visible/indeterminate;
- consumed OOS/holdout cannot become fresh validation;
- hypothesis cannot become certified fact by constructor/state transition/code adoption;
- exact runtime types reject laundering where applicable;
- timezone-naive timestamps fail closed;
- canonical ordering is deterministic;
- nested retained payloads cannot mutate historical truth;
- current projection replay is deterministic;
- CIBO projection cannot manufacture DEMO eligibility;
- no provider-native execution/custody authority leaks;
- no Production/LIVE/real-capital authority;
- all 31 Trader identities can be represented without methodology hard-coding.

## FULL QG — exact final candidate only

```bash
ruff check .
mypy src tests
pytest --cov=src/qore --cov-report=term-missing
```

No weakening tests, no strictness reduction, no coverage exclusion, no `type: ignore`, hidden skip/xfail, unjustified noqa, fabricated evidence or post-hoc threshold manipulation.

## Artifact-only / authority boundary

Do not push, commit or merge qore-core. Do not modify PR #500 state. Do not touch broker credentials, cTrader execution, Production/LIVE, real capital or execution authority. Deliver only an auditable candidate artifact.

## Required terminal deliverable

The artifact must include:
- recovered predecessor patch identity plus exact final patch;
- final patch SHA256;
- changed files/stats and allowed-path proof;
- exact START/TREE binding;
- durable six-lane + six-subagent evidence;
- semantic LSP evidence;
- focused/adversarial/property/metamorphic test evidence;
- Internal Expert audit/repair and final CLEAN result;
- FULL QG logs/results and coverage;
- exact post-QG candidate revalidation;
- root-family closure argument;
- explicit limitations/non-scope.

Terminal status must be exactly one of:
- `CANDIDATE READY — ROOT FAMILY EXHAUSTED`
- `BLOCKED / FURTHER MATERIAL FAMILY FOUND`

A timeout, corrupted checkpoint, partial patch or inherited test claim is not closure.
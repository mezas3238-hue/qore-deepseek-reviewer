# QORE DEMO RISK — HARNESS CONTINUATION 001

## Authority
Continuation-only successor for QORE Core Issue #495. Do NOT restart the Risk design or discard prior work.

## Exact baseline
Start from qore-core main SHA `514ca00f89fca8194eb57c954e78ba9b2e82b9b7`, TREE `80688a11e42d2ed7f67860b2d0002499b37d1dd9`.

## Recovery binding
Recover exact prior Harness artifact `9990674898` from run `34028382013`; raw candidate patch SHA-256 `f9fef91de96362c6341e849abd19560c195459dbbe420f830d0c67a9705bf1b2`.
The prior run was cancelled after substantial work. Preserve semantic work. Remove `.qore-harness-recovery/*` from the final semantic candidate; those files are checkpoint transport, not qore-core product code.
Reconcile recovered work with current main, which now includes the #492 Terra/Sol adaptive CIBO router.

## Required functional closure
Finish the complete #495 contract already defined: deterministic non-bypassable Risk Authority; ALLOW/REDUCE/REJECT/FREEZE/CONTAIN/KILL; portfolio heat and budgets; atomic reserve/commit/release capacity; exact risk authorization binding/freshness; account/trader/instrument/correlation/concentration limits; drawdown/loss-clustering/stress-before-admit; kill/containment/recovery; counterfactual and risk attribution; prop-firm/provider policy acquisition, normalization, versioning, change detection and fail-closed behavior; external rule ceiling with stricter internal QORE buffers allowed.

Cognitive Risk must remain a separate governed analyst: Terra/medium default, Terra/high for genuine ambiguity, Sol/high or Sol/max only for material contradiction/breach-risk analysis. No model, CIBO or Trader may grant or bypass deterministic Risk authority.

## Six lanes — mandatory
L1 architecture/contracts/exact types; L2 policy intelligence/provider/prop-firm rules; L3 portfolio heat/budgets/concentration; L4 atomic capacity/lifecycle/concurrency; L5 cognitive Risk + provenance + #492 interoperability; L6 execution/kill/recovery/regression/integration. Exactly 6 active non-duplicative lanes with durable evidence.

## Mandatory semantics
Use semantic LSP evidence: goToDefinition, findReferences, goToImplementation when applicable, hover/type inspection, symbols/call sites and final recheck. HIGH normally, MAX for authority boundaries, account-rule ambiguity, concurrency and closure contradictions.

Do not weaken existing tests or governance. No Production/real capital.

## Quality gate
Run FULL QG exactly:
- `ruff check .`
- `mypy src tests`
- `pytest --cov=src/qore --cov-report=term-missing`

## Artifact-only
Do not push/commit/merge qore-core. Deliver final semantic patch, metadata, exact baseline binding, 6/6 lane evidence, LSP evidence, checkpoints, tests, FULL QG and closure/blockers. Final candidate must not contain `.qore-harness-recovery/*` or coverage artifacts.

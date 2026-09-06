# HARNESS ENGINEER SUCCESSOR WORK ORDER — QORE CTRADER DEMO MULTI-TIMEFRAME 001 / CONTINUATION 001

## Identity and recovery binding

- Successor package: `HARNESS-ENGINEER-QORE-CTRADER-DEMO-MULTI-TIMEFRAME-CONTINUATION-001`
- Original package: `HARNESS-ENGINEER-QORE-CTRADER-DEMO-MULTI-TIMEFRAME-001`
- QORE Core issue: `mezas3238-hue/qore-core#494`
- Parent DEMO program: `#469`
- Current QORE baseline: `514ca00f89fca8194eb57c954e78ba9b2e82b9b7`
- Current QORE TREE: `80688a11e42d2ed7f67860b2d0002499b37d1dd9`
- Recovery source run: `34027493877`
- Recovery artifact: `9988010076`
- Recovery patch SHA-256: `2c8be65f2ce769c031ffcfc4b3f048bb4e8aadf2e36f2675a0b33d5f3db6330a`
- Prior Engineer output reached: `FULL QG is green (6584 passed)` immediately before timeout/checkpoint failure; this is evidence to preserve but NOT host certification.
- Prior terminal reason: `CORRUPT_ENGINEER_CHECKPOINT:unknown lane state for lane 1: IN_PROGRESS`.
- Mode: engineer / artifact-only / CONTINUE, DO NOT RESTART.

## Supreme continuation rule

The host restores the exact prior recovery artifact before API spend. Continue the already-written cTrader multi-timeframe implementation instead of rebuilding it. Reconcile it with current main, independently inspect it, repair only what is actually defective, reconstruct truthful lane/checkpoint state, then complete Internal Expert + host FULL QG.

Read and continue the original contract in:
`harness/engineer/tasks/qore-ctrader-demo-multi-timeframe-001-m1-m5-m15-m30-h1-d.md`

The exact required timeframe family is unchanged and exhaustive for this package:

`M1, M5, M15, M30, H1, D (Daily)`

Do NOT replace D with H4 and do NOT reduce this package back to M5-first semantics.

## Recovered semantic candidate

The recovery artifact includes intended changes in:
- `src/qore/infrastructure/ctrader_demo_market_data.py`
- `tests/infrastructure/test_ctrader_demo_market_data.py`
- `docs/architecture/QORE-CTRADER-DEMO-MULTI-TIMEFRAME-001.md`

It also contains generated/recovery-only files. The following are permitted in request scope solely for exact host restoration and MUST be removed from the final candidate:
- `.coverage.ctrader`
- `.coverage.eng`
- `.coverage.qg`
- `.qore-harness-recovery/checkpoints.md`
- any other `.coverage*` or `.qore-harness-recovery/*` produced during recovery.

## Mandatory first actions

1. Verify current baseline/TREE and restored patch.
2. Remove all generated/recovery-only files from the semantic candidate.
3. Verify recovered implementation semantics rather than assuming prior green output proves closure.
4. Reconstruct exact six-lane state using valid checkpoint syntax; do not repeat completed semantic work just to manufacture state.
5. Use semantic LSP over changed symbols, references, call sites and provider/consumer boundaries.

## Required causal family closure

Close native cTrader DEMO market-data support for all six exact timeframes:
- M1
- M5
- M15
- M30
- H1
- D / Daily

At minimum certify:
- exact provider period mapping and canonical QORE timeframe identity;
- closed-bar-only admission; no partial current bar leakage;
- correct timeframe boundary/alignment semantics;
- UTC/provider timestamp handling and deterministic normalization;
- correct Daily boundary semantics without inventing broker-local rules not supported by provider evidence;
- no silent backfill, future leakage or accidental synthetic substitution where native provider bars are required;
- deterministic replay/logical identity;
- exact runtime types and rejection of malformed/unsupported periods;
- coherent coexistence of the six requested timeframes;
- transport decoding, duplicates/out-of-order handling and stale/ambiguous evidence behavior where reachable;
- compatibility with the five-Trader cohort consumers without hard-coding Trader-specific strategy logic into the provider adapter.

## Six-lane / LSP / reasoning requirements

Use exactly six non-duplicative lanes and six active subagents. HIGH for normal complex work; MAX for time-boundary/provider-semantic contradictions, Daily/session ambiguity, no-lookahead guarantees, exact type/lifecycle conflicts and final closure.

Mandatory semantic LSP evidence includes go-to-definition, find-references, go-to-implementation where applicable, hover/type inspection, changed-symbol search, call sites and post-change recheck.

## Tests and quality gate

Retain/extend adversarial tests for every requested timeframe and neighboring invalid periods. Cover closed-vs-partial bars, exact boundaries, duplicate/out-of-order evidence, replay, malformed timestamps/types, Daily semantics and no lookahead.

Run exact FULL QG after Internal Expert repairs:
- `ruff check .`
- `mypy src tests`
- `pytest --cov=src/qore --cov-report=term-missing`

Prior in-agent `6584 passed` is useful recovery evidence but does not substitute the host external FULL QG on the final exact patch.

## Final artifact

Do not push/commit/merge qore-core. Final artifact must include only intended source/test/docs changes, exact patch digests, 6/6 lane evidence, LSP evidence, checkpoints, Internal Expert CLEAN evidence, FULL QG evidence and closure argument.

Allowed dispositions:
- `CANDIDATE READY — CTRADER DEMO M1/M5/M15/M30/H1/D FAMILY CLOSED`
- `BLOCKED / FURTHER MATERIAL FAMILY FOUND`

No Production or real-capital authority.

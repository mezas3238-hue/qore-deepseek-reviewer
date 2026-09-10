# QORE CORE — HARNESS ENGINEERING WORK PACKAGE

## Trader Story Forensics — 11-market deep research, falsification and repair

Package: `HARNESS-ENGINEER-QORE-TRADER-STORY-FORENSICS-ELEVEN-MARKET-001`

Repository under test: `mezas3238-hue/qore-core`

Primary governance:
- Story Forensics issue `#505`
- Trader Lab parent `#473`
- operational implementation PR `#506` — MUST remain DRAFT during this work
- PR `#500` is parent integration context and MUST NOT be mutated by this Harness package
- PR `#507` is CI carrier only and MUST NOT be merged

Immutable shared research baseline:
- START `18dc5736a28369ffb7bc1cfd0fccabb2334b208b`
- TREE `4a897527d3d3250ddaaddf89009f04d18decae88`

GitHub live is the source of truth for repository state. This Harness package is nevertheless intentionally frozen to the START/TREE above so its conclusions remain reproducible even if PR #506 advances elsewhere.

## MISSION

Act as a senior independent QORE engineer, not a superficial code reviewer. Investigate, falsify, repair and re-audit the Story Forensics / 11-market research architecture deeply enough that QORE can form an evidence-grounded central behavioral thesis for each of these five Traders:

- VT-01
- VT-08
- VT-09
- VT-17
- VT-31

using the exact QORE 11-market universe:

`EURUSD, GBPUSD, USDJPY, AUDUSD, USDCAD, XAUUSD, NAS100, SP500, GBPJPY, AUDJPY, US30`.

Every Trader must be examined across all eleven markets. No cherry-picking a favorable market, direction, session, regime, streak or episode is allowed.

The engineering objective is twofold and inseparable:
1. make the software/contracts genuinely capable of carrying the complete research evidence needed for the five independent Trader theses; and
2. attempt to falsify the behavioral and epistemic correctness of that software using code, tests, retained evidence contracts, semantic LSP and adversarial reasoning.

Do not optimize a Trader methodology merely because historical performance is weak. Any methodology-changing proposal remains a research hypothesis and requires a fresh governed holdout.

## KNOWN LIVE WITNESS AT START

Canonical QORE CI run `34466491554` on the exact START failed after:
- Ruff PASS;
- Mypy PASS (`978 source files`);
- Pytest: `7 failed, 7213 passed, 8 warnings`, coverage about `83%`.

The visible failure family is an incomplete schema migration after `story_forensics_eleven_market_thesis.py` was hardened to require:

`qore.trader_lab.eleven_market_trader_research_dossier.v1`

while older tests/consumers still construct or pass:

`qore.trader_lab.eleven_market_trader_dossier.v1`.

Known failing areas include:
- `test_first_cohort_eleven_market_dossier.py::test_builds_five_frozen_dossiers_each_covering_exact_eleven_markets`;
- multiple tests in `test_story_forensics_eleven_market_thesis.py` using the old fixture/schema.

This witness is NOT permission to patch assertions or weaken the new validator. Use LSP and call-site analysis to determine the complete causal migration class, decide which layer should own old shallow dossier testing versus new research-dossier thesis integration, repair the architecture coherently, and test all affected callers.

## EVIDENCE CONTEXT THAT MUST BE PRESERVED

The current branch contains or references these research layers, which must be traced semantically rather than assumed from filenames:
- `first_cohort_story_forensics.py`;
- `first_cohort_market_story_forensics.py`;
- `first_cohort_eleven_market_dossier.py`;
- `first_cohort_market_thesis_evidence.py`;
- `first_cohort_eleven_market_research_dossier.py`;
- `story_forensics_eleven_market_thesis.py`;
- session intelligence/replay;
- market board / review panel;
- Lightweight Charts replay and filmstrip renderers;
- Backtest, Characterization, walk-forward, failure analysis and hypothesis/holdout governance.

Retained research evidence for all eleven markets exists. NAS100 and SP500 Characterization Stage 4 were recovered from GitHub Actions run `34376439792`:
- NAS100 artifact `10133837821`;
- SP500 artifact `10135078991`.

If GitHub Actions artifact access is available in the isolated environment, use those exact artifacts and other retained 11-market artifacts read-only as empirical evidence. If artifact bytes are not available to the model environment, do not invent measurements: record the concrete evidence-access limitation and still verify that the software contract fails closed rather than fabricating a completed 11-market empirical thesis.

## SIX MANDATORY HARNESS SUBAGENTS / LANES

Use exactly six distinct engineering subagents, matching the global Harness lane contract. All lanes must investigate all five Traders where their concern applies, and every lane must leave durable checkpoint evidence.

### H-L1 — Architecture / contracts / dataflow / trust boundaries

Map with semantic LSP the complete path:

`retained market evidence -> backtest/characterization -> Story Forensics -> market thesis evidence -> 11-market research dossier -> independent thesis panel -> synthesis`.

Trace definitions, references, callers, types and implementations for the principal builders/validators. Determine whether schemas, provenance, exact Trader/config/methodology/timeframe identity, market universe, authority boundaries and dossier fingerprints are coherent after the research-dossier migration.

Explicitly test that TradingView remains visualization only and cannot become source evidence or execution authority.

### H-L2 — Witness reproduction / quantitative evidence / Trader-by-Trader research

Reproduce the known 7-test migration failure first, then inspect neighboring consumers so the repair closes the whole causal class.

For VT-01, VT-08, VT-09, VT-17 and VT-31, verify that the software can expose, per each of 11 markets, at least the evidence needed to reason about:
- sample/setup/fill behavior;
- realized outcomes and expectancy distributions available in retained Characterization/Backtest;
- OOS and Stress disposition;
- LONG versus SHORT asymmetry;
- session behavior;
- trend/volatility regime behavior;
- winning and losing streaks;
- direct-stop versus profit-then-stop/giveback episodes;
- MFE/MAE and lifecycle path;
- geometry and entry/SL/TP context;
- material exceptions and insufficient-evidence states.

Do not infer unavailable facts. A missing field is a contract defect or explicit evidence limitation, not an invitation to guess.

### H-L3 — Provenance / no-lookahead / serialization / adversarial evidence boundaries

Attack market/trader cross-contamination, duplicate/missing markets, wrong config/methodology/timeframe, stale software SHA, wrong account fingerprint, modified characterization/story payload, mismatched per-market evidence digest, malformed reviewer evidence, post-outcome leakage into decision-time fields, chronology ambiguity and serialization/fingerprint instability.

Use semantic LSP plus adversarial tests. Ensure every review statement by market is cryptographically anchored to the exact frozen per-market evidence digest and that a changed digest fails closed.

The engine currently states that intrabar ordering is not inferred. Preserve that epistemic boundary. M5/M15 OHLC must never be represented as tick-level proof of event order.

### H-L4 — Property / metamorphic / deterministic systematic falsification

Construct bounded systematic tests over:
- all 5 Traders;
- all 11 market identities;
- market ordering/permutation where input order should not change canonical output;
- one-market omission/duplication/substitution;
- one-Trader binding substitution;
- evidence-digest mutation;
- dossier-fingerprint mutation;
- decision/post-outcome separation;
- frame timestamp ordering and deterministic identity;
- review-lane sealing order and peer-conclusion isolation;
- benign controls that must remain accepted.

Do not brute-force meaningless combinations. Use equivalence classes to target invariants.

### H-L5 — Historical regression / replay / integration / real retained research semantics

Trace Backtest, Characterization, walk-forward/OOS/Stress, failure analysis, session/regime segmentation, story selection and renderer package generation through their actual callers. Confirm that the new research dossier carries enough retained quantitative/scientific material for an independent engineer to form a thesis rather than only episode labels.

Investigate the five Traders independently across the 11-market universe and record provisional evidence-grounded observations and counterexamples. Historical/exploratory evidence is not certification. Any recommendation that changes methodology must be recorded as a hypothesis with falsifier and fresh-holdout requirement.

Where actual retained artifact access exists, use it. Where it does not, distinguish `SOFTWARE_CONTRACT_VERIFIED` from `EMPIRICAL_ARTIFACT_NOT_MATERIALIZED` instead of pretending a real pilot ran.

### H-L6 — Final cross-interaction engineer / thesis-readiness challenger

After all prior repairs, perform a fresh final integration challenge with semantic LSP on the exact final candidate. Re-evaluate all five Traders and all eleven market paths from source evidence to thesis panel.

Specifically challenge:
- old shallow dossier accidentally reaching thesis review;
- deep research fields silently dropped between layers;
- raw replay frame chronology versus renderer sorting;
- no-lookahead and evidence-resolution claims;
- reviewer independence and per-market digest anchoring;
- majority vote accidentally becoming truth;
- real-artifact absence being mislabeled as completed empirical research;
- methodology changes escaping hypothesis/fresh-holdout governance;
- any DEMO/LIVE/Production/real-capital authority leakage.

H-L6 must run after the last mutation affecting this causal family. If it finds a defect, repair the complete class, invalidate only materially affected lanes, reclose them, then run a fresh H-L6 again.

## MANDATORY SEMANTIC LSP EVIDENCE

For every Python-relevant lane, text grep is insufficient. Use the installed semantic LSP. Record, at minimum where applicable:
- go-to-definition;
- find-references;
- hover/type information;
- implementation/call-site traversal.

After the last mutation affecting a lane, repeat the relevant traversal and record the final conclusion. LSP does not replace executable tests.

## REQUIRED ENGINEERING OUTPUT

The final durable engineering evidence must include, for each Trader separately:
- central provisional behavioral thesis supported by available evidence;
- repeated cross-market patterns;
- material exceptions/counterexamples;
- strongest and weakest market/direction/session/regime evidence actually available;
- lifecycle observations including direct-stop/giveback where evidence supports them;
- OOS/Stress context;
- strengths to preserve;
- degradation risks;
- causal hypothesis;
- explicit falsifier;
- confidence and evidence limitations;
- statement that any methodology mutation requires fresh holdout.

These are research conclusions only. Do not mark any Trader DEMO_ELIGIBLE, LIVE-ready or production-ready from this package.

## REPAIR RULES

If material defects are found, repair them in the disposable candidate workspace inside the allowlist. Prefer the smallest complete architectural repair. Do not:
- weaken fail-closed validation;
- convert the thesis validator back to the shallow dossier merely to make tests green;
- patch only expected exception text while leaving the migration broken;
- add `type: ignore` to hide defects;
- skip/xfail tests;
- reduce coverage or strictness;
- introduce TradingView market data as QORE evidence;
- mutate Trader methodology for historical performance optimization;
- commit, push or merge from the model workspace.

Add normal, adversarial, benign-control and property/metamorphic tests proportional to the causal class.

## TIMEOUT / INCOMPLETE-WORK LAW

This package inherits the global timeout-resilient Harness V3 contract.

A session ending is not permission to hand off incomplete work as success. Work in bounded shards. After every material finding/repair/test/LSP result, checkpoint durably and refresh the candidate recovery patch after meaningful mutations.

Before each generation ends, every started subagent must be durably `COMPLETED`, `RECOVERY_REQUIRED`, or `MATERIAL_BLOCKED`; never leave the only copy of useful progress in transient model context. If budget becomes uncertain, stop opening new work, checkpoint exact next steps and let the resilient host resume.

`ENGINEERING_READY_FOR_HOST_HANDOFF` is forbidden until all six lanes/subagents are COMPLETED on the exact final candidate.

## INTERNAL EXPERT ENGINEER

After Harness engineering completes, the v3 host must hand the exact candidate to the isolated Internal Expert. The Internal Expert has exactly five independent LSP-enabled engineering lanes and may repair defects itself. It must not receive Harness transcript, hidden reasoning or subagent conclusions. If it repairs, it must perform a fresh complete five-lane audit after the last repair before CLEAN.

Internal Expert CLEAN is not external certification.

## HOST QUALITY GATE

After Harness + Internal Expert completion, the deterministic host must run the canonical full QORE gate on the exact final candidate:
- `ruff check .`
- `mypy src tests`
- `pytest --cov=src/qore --cov-report=term-missing`

All must pass. Final candidate bytes/hash must remain unchanged after the final review/QG binding.

## TERMINAL ACCEPTANCE

Complete only when ALL are true:
- six Harness subagents/lanes are durably COMPLETED;
- mandatory semantic LSP evidence exists for each applicable lane;
- known schema-migration causal family is coherently closed;
- research-dossier and thesis-panel contracts are fail-closed and deep-evidence capable;
- all five Traders and all eleven markets are represented without cherry-picking;
- empirical claims are clearly separated from unavailable artifact evidence;
- Internal Expert's five independent lanes are CLEAN on the exact corrected candidate;
- canonical full QG is GREEN on that candidate;
- no mutation occurs after final binding;
- PR #500 remains untouched and #506 remains DRAFT;
- no Production/LIVE/real-capital authority is asserted.

Anything less is resumable engineering evidence, not completed work.
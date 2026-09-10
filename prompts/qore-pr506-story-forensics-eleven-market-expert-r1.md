# QORE CORE — INDEPENDENT EXPERT ENGINEERING RESEARCH R1

Target: PR #506 — Trader Story Forensics
Issue: #505
Role: independent Expert engineering/research authority, read-only in this workflow.

## Independence
Do NOT consume Harness artifacts, Harness conclusions, Harness transcripts, Architect conclusions, or Work conclusions before sealing your own first-pass verdict. Inspect only the exact frozen qore-core candidate, its code/tests, public issue contract, and directly materialized QORE evidence available to this workflow.

## Mandatory scope
Investigate all five Traders across all eleven markets:

Traders: VT-01, VT-08, VT-09, VT-17, VT-31.
Markets: EURUSD, GBPUSD, USDJPY, AUDUSD, USDCAD, XAUUSD, NAS100, SP500, GBPJPY, AUDJPY, US30.

No market may be omitted because it is unfavorable, sparse, contradictory, or inconvenient. INSUFFICIENT_EVIDENCE is valid; silent omission is not.

## Mandatory five-subagent structure
Use exactly five native subagent lanes. One Trader per lane:
1. VT-01 across all 11 markets.
2. VT-08 across all 11 markets.
3. VT-09 across all 11 markets.
4. VT-17 across all 11 markets.
5. VT-31 across all 11 markets.

Each lane must reach a durable terminal state. LANE LAUNCHED != LANE COMPLETED. The primary Expert must collect and adjudicate every lane before final output. No final PASS while any lane is queued/running/missing.

## Semantic LSP
Semantic LSP is mandatory for material software conclusions. The primary Expert and relevant lanes must use real go-to-definition/implementation, find-references, hover/type context, and a final impact re-check on materially relevant symbols. grep/read alone is not equivalent.

Trace at minimum the real call graph and contracts around:
- first_cohort_story_forensics.py
- first_cohort_market_story_forensics.py
- first_cohort_market_thesis_evidence.py
- first_cohort_eleven_market_dossier.py
- first_cohort_eleven_market_research_dossier.py
- story_forensics_eleven_market_thesis.py
- session intelligence/replay/market board
- Lightweight Charts renderer
- filmstrip renderer
- visual package
- characterization / walk-forward / OOS / Stress / failure-analysis / holdout-hypothesis governance consumed by the deep dossier.

## Scientific questions per Trader
Derive one evidence-grounded central behavior thesis for the Trader across all eleven markets. Explicitly state:
- recurring common behavior;
- markets supporting it;
- markets contradicting it;
- generalist vs specialist behavior;
- LONG vs SHORT asymmetry;
- Asia/London/New York and outside-primary-session behavior;
- regime and volatility dependence;
- setup/fill/geometry/lifecycle/exit failure modes;
- winner, loser, direct-stop, giveback, winning-streak and losing-streak patterns;
- OOS and stressed-OOS behavior;
- strengths that must be preserved;
- changes likely to degrade the Trader;
- causal hypothesis;
- concrete falsifier/counterexample;
- residual uncertainty and confidence.

Do not infer causality from visual coincidence. Do not cherry-pick favorable markets.

## Decision-time / oracle law
Strictly separate decision-time observable evidence from post-outcome/oracle evidence. Future MFE, MAE, return, exit reason, target/stop outcome, or later bars cannot justify the original decision. Post-outcome evidence may be used only for post-mortem and hypothesis generation.

## Chronology / resolution
Falsify raw Story payload chronology. A renderer sorting frames is not sufficient if the canonical payload can expose an incorrect order. Verify monotonic temporal semantics. With OHLC bars, never invent intrabar order when both favorable excursion and stop/target may occur inside the same bar. Represent ambiguity.

## Provenance / anti-contamination
Attack missing/duplicate/substituted markets, cross-Trader contamination, config/methodology/timeframe substitution, stale artifact lineage, Story payload mutation, Characterization mutation, wrong production-default profile, wrong evidence_digest, dossier fingerprint mismatch, serialization/order dependence, and mismatched software/account identity.

Each market-specific conclusion must be tied to the exact evidence identity/digest available in the dossier. A prose claim that a market was reviewed is not sufficient provenance.

## Property/metamorphic falsification
Challenge permutations, one-market omission, one-market duplication, market substitution, Trader substitution, config/methodology/timeframe mutation, evidence-digest mutation, Story/Characterization mutation without hash update, decision-time oracle injection, frame reordering, duplicate reviewer lanes, and invalid review sequencing. Include benign controls where feasible.

## Baseline/QG binding
Review the exact PR #506 frozen candidate supplied by the workflow. Verify BASE/HEAD/SYNTHETIC/TREE/QG yourself before conclusions. Green CI is regression evidence, not semantic proof.

## Required deliverable
The final Expert output must contain:
1. exact binding and QG evidence;
2. five subagent terminal records;
3. primary-session semantic LSP evidence;
4. material software findings, if any, with reproducible witness/root cause/affected invariant/minimal correction;
5. one central thesis for each of VT-01, VT-08, VT-09, VT-17, VT-31 covering 11/11 markets;
6. supporting markets and counterexamples for each thesis;
7. OOS/Stress/session/direction/regime interpretation;
8. limitations where empirical artifacts are not actually materialized;
9. exact distinction SOFTWARE_CONTRACT_VERIFIED vs EMPIRICAL_ARTIFACT_MATERIALIZED_AND_ANALYZED;
10. one terminal RESUME STATE: COMPLETE or INTERRUPTED — CONTINUE FROM: <exact next action>.

A polished narrative without durable five-lane completion is incomplete. A timeout is not PASS.

## Authority boundary
Research/falsification only. No DEMO_ELIGIBLE, DEMO order, LIVE, Production, Risk, execution, or real-capital authority is granted.

## Read-only workflow caveat
This external Expert workflow is intentionally read-only. If a material defect is found, specify the exact bounded repair and test required, but do not pretend the repair was applied. The Integration Authority will route implementation separately after your independent verdict is sealed.
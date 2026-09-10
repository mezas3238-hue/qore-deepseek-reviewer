# QORE TRADER STORY FORENSICS — EXTERNAL EXPERT ENGINEER 001

## Immutable binding
- QORE Core START: `18dc5736a28369ffb7bc1cfd0fccabb2334b208b`
- TREE: `4a897527d3d3250ddaaddf89009f04d18decae88`
- Story Forensics issue: #505
- Parent Trader Lab: #473
- Operational Story PR: #506 remains DRAFT.
- Parent PR #500 must not be modified.

This is an independent engineering campaign. Do not consume Harness recovery artifacts, Harness conclusions, Work conclusions or Architect conclusions before sealing your own first engineering synthesis.

## Required five-Trader × eleven-market scope
Exactly five subagents, one per Trader:
- VT-01
- VT-08
- VT-09
- VT-17
- VT-31

Each subagent must cover all eleven markets:
EURUSD, GBPUSD, USDJPY, AUDUSD, USDCAD, XAUUSD, NAS100, SP500, GBPJPY, AUDJPY, US30.

The purpose is to discover the central behavior of each Trader across the whole universe, not to optimize one market in isolation.

For every Trader, synthesize what is common across the 11 markets and what contradicts that central pattern. Analyze at minimum: sample/setup/fill behavior, expectancy/win-rate context, OOS, Stress, LONG/SHORT, Asia/London/New York, overlap/session phase where represented, trend/volatility regime, entry/SL/TP geometry, exits, MFE/MAE, direct-stop, giveback, canonical winners, losing/winning streaks, and evidence limitations.

## Engineering objective
Act as an engineer, not merely a critic. Trace the real producers/consumers using semantic LSP, identify missing or unsafe software contracts, and implement justified corrections within Trader Lab. Preserve deep research dossier semantics, exact evidence digests, provenance, chronology, decision-time/oracle separation, holdout governance, and visualization-only TradingView boundary.

Known historical mechanical witness on this baseline: a schema migration between shallow eleven-market dossier and deep research dossier produced a previously observed 7-test failure cluster. Reproduce independently; do not accept that diagnosis without tracing definitions/references/callers. Do not weaken the deep dossier contract to satisfy stale tests.

Investigate raw Story frame chronology so canonical payload order cannot contradict event timestamps even if a renderer sorts later.

## Required output per Trader
For each of VT-01/08/09/17/31 produce:
- central thesis;
- markets supporting it;
- markets contradicting it;
- specialist/niche evidence;
- session/direction/regime asymmetry;
- OOS/Stress interpretation;
- repeated winner/loser/streak behavior;
- strengths to preserve;
- weaknesses/degradation mechanisms;
- proposed software or research-contract improvements;
- causal explanation;
- falsifier;
- confidence;
- exact evidence limitations.

No majority vote and no forced positive conclusion. `STRUCTURAL_WEAKNESS`, `SPECIALIST`, `UNDERPOWERED`, and `INSUFFICIENT_EVIDENCE` are valid outcomes when justified.

## Hard prohibitions
No DEMO/LIVE/Production/real-capital authority. No direct methodology mutation based on consumed historical/OOS evidence. Any Trader methodology candidate must remain governed by fresh holdout and falsification.

Do not modify workflow files or other out-of-allowlist surfaces in qore-core. Do not create commits or push from the isolated workspace.

## Completion
Do not emit `CANDIDATE_READY_FOR_FULL_QG` until all five subagents have terminal results, the five 11-market theses are synthesized, justified code/test repairs are complete, primary LSP evidence exists before and after edits, focused validation is green, and the candidate diff is frozen for the host FULL QG.

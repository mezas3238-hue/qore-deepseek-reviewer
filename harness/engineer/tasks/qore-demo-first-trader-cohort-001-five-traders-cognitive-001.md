# HARNESS ENGINEER WORK ORDER — QORE DEMO FIRST TRADER COHORT 001

## Identity

- Package: `HARNESS-ENGINEER-QORE-DEMO-FIRST-TRADER-COHORT-001`
- QORE Core issue: `mezas3238-hue/qore-core#493`
- Parent DEMO program: `#469`
- Adaptive cognition contract: `#492`
- Trader Lab: `#473`
- Exact QORE baseline: `1e08a355f4109f016ca47bc4b8957b92a1ae7948`
- Exact QORE baseline TREE: `5b37d0750ca163665135f9c075b4d7c44a43be8e`
- Baseline QORE CI: run `34010471344` SUCCESS
- Mode: engineer / artifact-only

## Mission

Implement and adversarially close the **first five specialized DEMO Traders as one causal family**, plus their governed reasoning/voice wrapper, while preserving the strict boundary:

`DETERMINISTIC METHODOLOGY FIRST -> COGNITIVE INTERPRETATION SECOND`

The cognitive model must never invent or replace a deterministic setup.

Cohort:

1. VT-01 NY Precision Core — M5, bounded NY-session liquidity family.
2. VT-08 CRT 4H AMD — M5 execution with **closed H4** structural context.
3. VT-09 Turtle Soup — false-break reversal; **M15 path required**.
4. VT-17 QT Scalper — M5; formalize exact deterministic **90-minute cycle** semantics.
5. VT-31 Silver Bullet — M5/M1, fixed NY windows.

No qualification threshold may be weakened to fill the cohort.

---

# PHASE A — DETERMINISTIC TRADER FAMILY

For every Trader implement an exact, versioned, evidence-bound methodology path:

`MARKET EVIDENCE -> EXACT TRADER VERSION/CONFIG/METHODOLOGY -> SETUP / STATE / ABSTAIN`

Required retained identity at minimum:

- Trader id/version;
- config fingerprint;
- methodology id/version/fingerprint;
- exact input evidence refs;
- exact timeframe and closed-candle assumptions;
- session/window identity and timezone semantics;
- deterministic setup/state output;
- invalidation/exit semantics;
- confidence/abstain semantics where defined by methodology;
- lifecycle identity compatible with Trader Lab;
- reproducible logical identity/replay.

## Shared causal primitives

Close the cohort-level primitive family rather than implementing five unrelated witness patches. At minimum investigate/implement where needed:

- canonical OHLC/candle identity;
- closed-candle timeframe aggregation with no partial-candle leakage;
- M1/M5/M15/H4 relationships and closed higher-timeframe context;
- DST-aware New York session/window membership;
- exact fixed-window boundary semantics;
- swing pivots;
- liquidity sweeps / false-break semantics;
- PDH/PDL and relevant session extrema;
- FVG/imbalance primitives where required;
- structural context / AMD semantics where required;
- opportunity-density semantics;
- deterministic 90-minute cycle semantics for VT-17;
- canonical evidence lineage;
- exact runtime types;
- deterministic replay;
- no silent backfill / no lookahead / no future leakage;
- false-positive controls and abstain behavior;
- exact Trader version/config lifecycle binding.

Do not infer methodology from labels alone. Reconstruct canonical intent from the current QORE trader catalog/architecture and write explicit contracts where the existing inventory is underspecified. If an economically material methodology rule cannot be determined without inventing semantics, do **not** fabricate it: record the ambiguity, choose only what is safely supported by existing canonical evidence, and return a precise blocker for the unresolved rule.

---

# PHASE B — GOVERNED TRADER COGNITION / VOICE

Only after the corresponding Phase-A Trader output is exact may its cognitive wrapper be admitted.

Required flow:

`DETERMINISTIC TRADER STATE + EXACT EVIDENCE -> COGNITIVE INTERPRETATION -> OPINION / EXPLANATION / QUESTION / DOUBT`

The cognitive layer may:

- explain what the Trader sees;
- state thesis and invalidation;
- express uncertainty;
- challenge its own setup;
- explain abstention;
- answer CIBO/CEO questions;
- compare current conditions with frozen methodology;
- disagree with another Trader;
- state missing evidence and limitations.

It may **not**:

- create a setup that Phase A did not produce;
- fabricate market evidence;
- mutate methodology/version in place;
- self-promote through Trader Lab;
- grant Risk approval;
- create order/account/quantity/provider-native execution authority;
- authorize Production or real capital;
- launder opinion into formal signal/evidence/authority.

## Initial cognitive engine policy from #492

Trader-local cognition:

- routine explanation / voice / normal setup context -> `gpt-5.6-terra`, provider effort `medium`;
- ambiguous evidence within specialty -> `gpt-5.6-terra`, provider effort `high`;
- serious internal contradiction -> Trader may emit a governed escalation request, but may not self-grant Sol/MAX or authority;
- material conflict between Traders -> handoff to CIBO adjudication, normally Sol/high if material;
- unresolved material multi-Trader conflict -> CIBO `COUNCIL_ADVERSARIAL`, Sol/max.

Voice is a channel, not a reasoning tier. Voice/text/UI must use the same situational routing semantics. Speaking must not force HIGH/MAX.

Every admitted Trader cognitive opinion must bind at minimum:

- exact Trader/version/config/methodology identity;
- exact deterministic setup/state reference;
- exact evidence subset actually used;
- semantic reasoning mode;
- provider/model/effort receipt;
- config/prompt/schema fingerprint where applicable;
- uncertainty/confidence;
- thesis;
- invalidation/limitations;
- timestamp;
- dialogue provenance (independent opinion vs reply to CIBO/CEO/Trader);
- admitted proposal digest / replay-safe receipt.

Historical replay must use retained admitted output/receipt and must not silently re-call a changed external model while claiming it is the original opinion.

---

# TRADER LAB / LIFECYCLE REQUIREMENTS

Preserve the existing Trader Lab gate and close the previously explicit integration-store lifecycle family where this cohort reaches it:

- exact candidate/version identity;
- terminal/version stickiness;
- after terminal rejection, version bump before requalification;
- bounded/no ungoverned parallel DEMO lifecycles;
- no self-promotion;
- no lowering qualification thresholds.

This batch does not declare the Traders `DEMO_ELIGIBLE` merely because code exists. It must make their exact methodologies and cognitive wrappers **representable, testable and ready for the governed Trader Lab path**; actual qualification still requires the existing evidence gates.

---

# EXACT 6-LANE SUBAGENT CONTRACT

Use **exactly six non-duplicative active lanes** and report evidence for 6/6. Failure to use all six is BLOCKED unless the Architect changes the contract.

## L1 — Architecture / shared contracts / exact types

Own shared Trader identity/config/methodology/state contracts, timeframe primitives, lifecycle identity, canonical evidence and architecture placement. Check existing references/call sites with semantic LSP.

## L2 — VT-01 + VT-08 adversarial methodology lane

Own deterministic semantics and adversarial witnesses for NY Precision Core and CRT 4H AMD, including closed H4 context, liquidity/structure boundaries, positive/negative/abstain cases and neighboring false positives.

## L3 — VT-09 + VT-17 adversarial methodology lane

Own Turtle Soup false-break reversal and QT Scalper 90-minute-cycle family, including M15 requirement for VT-09, exact cycle boundaries for VT-17, false breaks, neighboring sessions, deterministic replay and abstain cases.

## L4 — VT-31 + time/session/metamorphic lane

Own Silver Bullet M5/M1 fixed NY windows plus the cross-cohort DST/timezone/session/window/timeframe metamorphic family. Explore DST transition days, exact open/close boundaries, closed-candle semantics, timeframe composition and no lookahead.

## L5 — Cognitive/voice/provenance lane

Own Trader cognitive wrapper conformance to #492: Terra-medium default Trader-local cognition, Terra-high on typed ambiguity, voice independence, evidence-subset enforcement, model/effort authenticity, cognitive receipts/replay, opinion-vs-authority separation and handoff to CIBO for material disputes.

## L6 — Integration / Trader Lab / regression / LSP lane

Own reachable integration paths, call sites, reference checks, Trader Lab compatibility, existing CIBO Trader Manager/voice interactions, historical regression families, full changed-symbol recheck and final root-family closure argument.

---

# REASONING / LSP REQUIREMENTS

Harness reasoning:

- HIGH for normal complex analysis/implementation;
- MAX for architectural contradictions, time/DST/session ambiguity, exact-type/lifecycle conflicts, evidence/authority security boundaries, model-effort authenticity, and final closure adjudication.

Semantic LSP use is mandatory and must be evidenced. At minimum:

- go-to-definition;
- find-references;
- go-to-implementation where applicable;
- hover/type inspection;
- symbol search for all modified/new core contracts;
- call-site inspection;
- post-change reference recheck.

Do not claim LSP use without concrete symbol/reference evidence.

---

# DURABLE MEMORY / CHECKPOINTS

Write durable checkpoints throughout execution. A recovery run must continue from the latest verified checkpoint and must not restart the batch from zero.

At minimum checkpoint after:

1. baseline reconstruction + canonical methodology inventory;
2. shared primitive design decisions;
3. each Trader deterministic methodology completion;
4. cognitive wrapper design/integration;
5. focused/adversarial tests;
6. FULL QG;
7. final closure / blockers.

Each checkpoint must record:

- completed work;
- discoveries/findings;
- design decisions and why;
- exact files modified;
- tests run/results;
- LSP evidence collected;
- unresolved blockers/families;
- next exact step.

---

# ADVERSARIAL TEST REQUIREMENTS

At minimum cover:

## Deterministic family

- strategy-specific positive setup cases;
- strategy-specific negative cases;
- explicit abstain cases;
- closed-candle / partial-candle rejection;
- higher-timeframe closure/no future leakage;
- DST spring/fall transitions and adjacent days;
- exact NY window boundaries;
- M1/M5/M15/H4 aggregation consistency;
- pivot/sweep/FVG/session-extrema neighbors;
- false-break vs valid-break distinctions;
- deterministic 90-minute cycle boundaries;
- repeated replay produces identical logical output;
- exact runtime type rejection where applicable;
- config/version fingerprint changes alter identity;
- same config/version/evidence does not mint new logical identity;
- no silent backfill/lookahead;
- false positives near boundary transformations.

## Cognitive family

- cognitive layer cannot create a setup absent from deterministic state;
- evidence outside supplied evidence set is rejected;
- opinion cannot carry order/account/quantity/Risk approval/Production authority;
- voice and text produce same routing class given same typed situation;
- routine Trader cognition routes Terra/medium;
- typed ambiguity can route Terra/high;
- prompt words such as `urgent`, `MAX`, `controversy` do not self-escalate;
- material dispute handoff targets CIBO rather than five independent Sol/MAX calls;
- provider model/effort must match governed route;
- receipt/provenance is immutable and replay-safe;
- hidden chain-of-thought is neither required nor persisted;
- unrelated later episode de-escalates / does not inherit prior escalation;
- uncertainty/dissent may remain unresolved instead of forced consensus.

## Trader Lab / lifecycle

- terminal/version stickiness;
- terminal rejection requires version bump before requalification;
- no ungoverned parallel DEMO lifecycle;
- no self-promotion or threshold weakening.

Use property/metamorphic/generated representative methods wherever causal family breadth makes witness-only tests insufficient.

---

# FULL QUALITY GATE

Final artifact candidate must run exactly:

- `ruff check .`
- `mypy src tests`
- `pytest --cov=src/qore --cov-report=term-missing`

Focused tests are allowed during development but are not final certification.

No test weakening, skip/xfail hiding, strictness reduction, unjustified lint silencing, `type: ignore` to conceal defects, or coverage exclusion.

---

# ARTIFACT-ONLY OUTPUT

Do not push/commit/merge to qore-core.

Deliver an artifact containing at minimum:

- patch;
- package metadata;
- exact expected baseline SHA/TREE;
- actual changed files;
- patch/hash digests;
- 6/6 lane evidence;
- semantic LSP evidence;
- durable checkpoint log;
- focused/adversarial test evidence;
- FULL QG evidence;
- remaining findings/blockers;
- closure argument.

Allowed final dispositions:

- `CANDIDATE READY — FIVE-TRADER DETERMINISTIC FAMILY + COGNITIVE WRAPPER CLOSED`
- `BLOCKED / FURTHER MATERIAL FAMILY FOUND`

If Phase B is blocked by an unresolved semantic dependency but Phase A is materially complete, retain and report the Phase-A artifact/checkpoint. Do not discard or restart completed Phase-A work.

No Production / real-capital authorization is introduced by this package.

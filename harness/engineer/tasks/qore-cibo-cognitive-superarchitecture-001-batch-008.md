# QORE CIBO COGNITIVE SUPERARCHITECTURE — ROADMAP CONTINUATION BATCH 008

## CANONICAL PURPOSE

Implement the next large coherent architectural slice of **QORE CIBO Cognitive Superarchitecture #482**, subordinate to the CEO-frozen CIBO route in master roadmap #303.

This package answers only:

`HOW CIBO THINKS, ORGANIZES COGNITION, PLANS, LEARNS, USES TOOLS, REPLAYS AND EVALUATES ITS COGNITION`

It does NOT implement the complete business/executive function set of CIBO Functions #483.
It does NOT implement Trader Lab #473/#481.
It does NOT implement provider execution, Risk authority, Production authority or real-capital authority.

## PREDECESSOR WORK — PRESERVE, DO NOT REPEAT

Harness package `HARNESS-ENGINEER-QORE-CIBO-COGNITIVE-EXECUTIVE-001-BATCH-006` is completed durable predecessor evidence:

- run `33695704703`
- job `100463980792`
- artifact `9873332600`
- artifact digest `sha256:a468ec368c2d39f8fe25c465b9f55c9a613fb3e8ff23a0751bb6ce907e7e793c`
- exact START `576803fbda76970a4bbfe2287b5f9ca101d0f6c3`
- exact TREE `11f35844670551ac4ab5be322272a3221e6b1c4b`
- 6/6 predecessor lanes COMPLETE
- 11 candidate files / +4006
- focused tests 80 PASS
- FULL QG: ruff PASS / mypy 756 files PASS / pytest 4989 PASS / coverage 87%

Batch 006 already owns the following cognitive foundation and MUST NOT be reconstructed in this package:

- cognitive contracts and epistemic-state foundation;
- semantic reasoning-mode enum FAST/HIGH/MAX/COUNCIL_ADVERSARIAL;
- evidence references, confidence and uncertainty primitives;
- governed persistent memory foundation;
- executive/decision/lesson/failure journals;
- Council of Minds / adversarial critic / disagreement retention;
- Executive Brain pure synthesis seam;
- authority-boundary absence checks.

Do not recreate or shadow these predecessor files/names:

- `src/qore/modules/cibo/cognitive_contracts.py`
- `src/qore/infrastructure/cibo_executive_memory.py`
- `src/qore/infrastructure/cibo_executive_journal.py`
- `src/qore/infrastructure/cibo_executive_deliberation.py`
- `src/qore/infrastructure/cibo_executive_brain.py`
- their five predecessor test files.

This package is a **complementary artifact on the same immutable START**, designed for later deterministic materialization together with Batch 006 and a dedicated Cognitive Integration Gate. It must not pretend Batch 006 symbols exist in this checkout. Define complementary provider-neutral contracts with explicit future integration seams and no duplicate semantic ownership.

## ROADMAP CONFORMANCE LEDGER

The final report MUST contain an explicit `CA-01..CA-18` ledger with one of:

- `PREDECESSOR_BATCH006`
- `IMPLEMENTED_BATCH008`
- `INTEGRATION_GATE_REQUIRED`
- `EXTERNAL_EVIDENCE_DEPENDENT`

No CA item may be silently omitted.

Canonical #482 mapping:

- CA-01 Cognitive Kernel — predecessor Batch 006.
- CA-02 Evidence / Provenance Fabric — predecessor foundation; Batch 008 may add only complementary provenance binding needed by new components.
- CA-03 Persistent Memory Fabric — predecessor Batch 006.
- CA-04 Financial/Core World Model Architecture — IMPLEMENT NOW.
- CA-05 Attention / Priority / Context Selection — IMPLEMENT NOW.
- CA-06 Reasoning Modes — enum predecessor; implement only complementary reasoning-request/routing semantics that do not duplicate enum ownership; final composition at integration gate.
- CA-07 Council of Minds / Specialist Cognition Bus — council predecessor; IMPLEMENT common faculty contribution/bus seam now without duplicating deliberation types.
- CA-08 Critic / Skeptic / Contradiction Engine — predecessor foundation; add only cross-component contradiction/missing-evidence integration where needed.
- CA-09 Uncertainty / Calibration Architecture — predecessor primitives; add calibration/evaluation seam where needed, without redefining uncertainty enums.
- CA-10 Planning / Goal Graph — IMPLEMENT NOW.
- CA-11 Learning / Reflection / Counterfactual Architecture — IMPLEMENT NOW.
- CA-12 Quant / Tool Orchestration Substrate — IMPLEMENT NOW.
- CA-13 Specialist Faculty Interface — IMPLEMENT NOW.
- CA-14 Dialogue / Voice Cognitive Boundary — predecessor boundary semantics; add only a typed cognitive-dialogue request/response seam if required, never authority.
- CA-15 Authority / Action Firewall — predecessor negative boundary; add typed formal handoff envelope only if it remains authority-free and cannot execute.
- CA-16 Cognitive Observability / Replay / Audit — IMPLEMENT NOW.
- CA-17 Cognitive Evaluation Framework — IMPLEMENT NOW.
- CA-18 Scale / Modularity / Evolution — IMPLEMENT NOW through versioned registries/interfaces, never global mutable plugin state.

## HARD ARCHITECTURE LAWS

1. `CIBO COGNITIVE SUPERARCHITECTURE = HOW CIBO THINKS`.
2. `CIBO FUNCTIONS = WHAT CIBO DOES`; #483 is outside this package.
3. `INTELLIGENCE != AUTHORITY`.
4. `REASONING != EXECUTION`.
5. `OPINION != FORMAL SIGNAL`.
6. `MODEL PROVIDER != CIBO SEMANTICS`.
7. `SUMMARY != SOURCE EVIDENCE`.
8. `COUNCIL != FAKE CONSENSUS`.
9. `UNCERTAINTY != FAILURE`.
10. `CIBO MEMORY != TRANSIENT LLM CONTEXT`.
11. `CIBO MEMORY != SILENT SELF-REWRITE`.
12. No concrete LLM/provider/model imports in semantic Core contracts.
13. No provider order, account, credential, execution, promotion, Risk approval or Production authority can emerge from cognitive output.
14. No hidden `datetime.now()`, `date.today()`, `uuid4()`, RNG, retry, sleep, scheduler, thread or network semantic side effect.
15. Exact runtime types where required; `bool != int`; no subclass laundering.
16. Frozen slots dataclasses where applicable.
17. All externally supplied nested material recursively revalidated.
18. Timestamps timezone-aware and explicit.
19. Deterministic canonical ordering and fingerprints.
20. Secret-bearing strings/metadata/evidence must fail closed.
21. No global mutable registry/state.
22. No hindsight rewriting of beliefs, goals, lessons or counterfactuals.

## SIX-LANE ENGINEERING PLAN

### Lane 1 — CA-04 World Model + epistemic state projection

Implement a typed **Financial/Core Cognitive World Model substrate** capable of representing references/projections for:

- market/regime state;
- Trader state;
- portfolio/economic state;
- operational/Core health state;
- research state;
- temporal/current vs historical snapshot identity;
- source evidence/provenance identity;
- contradictions/staleness/missing evidence.

Do not reimplement authoritative market/Trader/portfolio/research contracts. This is a cognitive representation/projection layer with exact source identities/versions.

Required properties:
- immutable snapshots;
- explicit as-of timestamp supplied by caller;
- provenance references;
- deterministic canonical ordering;
- no market monitoring behavior;
- no fabricated current state;
- stale/contradictory state remains explicit.

### Lane 2 — CA-05 Attention + CA-06 complementary reasoning routing + CA-09 calibration seam

Implement deterministic/evidence-bound context-selection primitives for:

- anomalies;
- unresolved contradictions;
- stale/missing evidence;
- pending goals;
- economic/risk deterioration references;
- high-value research questions;
- priority reasons and bounded scores/ranks without hidden model authority.

Add complementary reasoning-request/routing semantics that can later bind to Batch 006 FAST/HIGH/MAX/COUNCIL_ADVERSARIAL modes at integration. Do NOT define a second reasoning-mode enum.

Represent why a deeper reasoning mode is requested, what evidence is missing, and when abstention/insufficient evidence is required.

### Lane 3 — CA-10 Planning / Goal Graph + CA-11 Learning / Reflection / Counterfactual

Implement typed, replayable cognitive planning:

`GOAL -> SUBGOAL -> TASK -> DEPENDENCY -> REQUIRED EVIDENCE -> STATUS -> REPLAN`

Requirements:
- exact goal/task identities supplied explicitly;
- DAG validation / cycle rejection;
- deterministic dependency order;
- progress cannot be inferred without evidence;
- plan/replan history append-only;
- planner can emit governed work/research REQUESTS only;
- cannot mutate code, Trader versions, authority state or execution.

Implement governed learning/reflection/counterfactual records:

- expected result;
- actual result reference;
- evidence available at decision time;
- later evidence separated from contemporaneous evidence;
- error attribution as hypothesis unless proven;
- counterfactual alternatives;
- lesson version/supersession lineage;
- no hindsight rewrite;
- no silent self-modification.

### Lane 4 — CA-12 Quant/Tool Orchestration + CA-13 Specialist Faculty Interface + CA-18 modularity

Implement provider-neutral typed tool orchestration substrate:

- deterministic tool identity/version;
- typed request/result envelope;
- exact input fingerprint;
- exact output/evidence fingerprint;
- explicit deterministic seed only where an existing approved algorithm requires it;
- no retry-to-pass;
- no prose replacing exact math;
- failure/insufficient-evidence Result boundary.

Implement common Specialist Faculty Interface / cognition bus for future functional faculties such as Markets, Traders, Portfolio, Profitability, Research and Core Health:

- faculty identity/version;
- bounded observation/opinion/evidence contribution;
- no authority transfer;
- deterministic contribution ordering;
- disagreement preserved;
- capability registry immutable/versioned;
- extensible without reverse dependency or global mutable plugin registry.

Do not implement the business behavior of those faculties here.

### Lane 5 — CA-16 Replay/Audit + CA-14/15 integration boundaries

Implement cognitive observability/replay/audit semantics sufficient to reconstruct:

- evidence available at episode time;
- world-model snapshot identity;
- selected context/attention reasons;
- goal/plan state;
- tool requests/results;
- alternatives/counterfactuals;
- uncertainty/contradictions;
- recommendation/handoff reference;
- what changed afterward.

Replay must be deterministic over exact recorded inputs and MUST NOT call providers/network/current time.

Where needed, add a typed **authority-free handoff envelope** representing:

`COGNITIVE OUTPUT -> FORMAL REQUEST/RECOMMENDATION FOR EXTERNAL POLICY/RISK PIPELINE`

It must contain no execution credential/order/account/promotion/Risk-decision authority and cannot itself authorize action.

Do not duplicate Batch 006 formal recommendation types; use reference-based seam until integration.

### Lane 6 — CA-17 Cognitive Evaluation + adversarial integration + docs + FULL QG

Implement a cognitive evaluation framework that can assess, without self-certifying authority:

- evidence sufficiency;
- provenance completeness;
- contradiction handling;
- calibration/abstention quality;
- decision/recommendation consistency references;
- counterfactual quality;
- memory-usefulness references;
- planning consistency;
- replay completeness;
- incremental contribution evidence hooks.

Evaluation outputs must distinguish at least:

- `SUFFICIENT_FOR_EVALUATION`
- `INSUFFICIENT_EVIDENCE`
- `CONTRADICTORY_EVIDENCE`
- `EVALUATION_NOT_APPLICABLE`

Use names/types that do not collide with Batch 006 ownership.

Finish with architecture documentation, root-family audit, adversarial tests and FULL QG.

## ADVERSARIAL MATRIX — REQUIRED

At minimum test:

1. world snapshot with naïve timestamp rejected;
2. world projection containing secret-bearing evidence rejected;
3. contradictory source states cannot collapse into one asserted truth;
4. stale source cannot masquerade as current;
5. attention priority cannot invent evidence;
6. equal-priority ordering deterministic under permutation;
7. malformed/nested reflective corruption fails recursive revalidation;
8. bool cannot launder as integer score/version/ordinal;
9. subclass laundering rejected where exact type required;
10. goal graph cycle rejected;
11. task completion without required evidence rejected;
12. replan cannot erase old plan history;
13. later evidence cannot rewrite what was known at decision time;
14. counterfactual cannot be asserted as actual outcome;
15. tool result must bind exact request/input fingerprint;
16. mismatched tool version/result rejected;
17. tool retry-to-pass not represented as success;
18. faculty contribution cannot carry execution/Risk/promotion authority;
19. duplicate faculty identity/version conflict rejected;
20. faculty ordering deterministic;
21. replay with changed input/fingerprint rejected;
22. replay cannot read current clock/network;
23. audit record cannot omit source evidence for material cognition;
24. evaluation with missing evidence => INSUFFICIENT_EVIDENCE;
25. contradictory evidence => CONTRADICTORY_EVIDENCE;
26. evaluation cannot confer authority;
27. handoff envelope cannot contain provider order/account/credential fields;
28. dialogue/opinion reference cannot become formal signal implicitly;
29. no global mutable registry;
30. no provider/model import in semantic contracts.

## SEMANTIC LSP — MANDATORY

Before implementation, use semantic LSP on existing CIBO, research, evidence, Risk, portfolio, market observation, trader and governance boundaries relevant to the new contracts. At minimum use `hover`, `findReferences`, `goToDefinition` and, where applicable, `goToImplementation`.

After stabilization, repeat semantic LSP over all new public types and their key consumers. Grep-only work is insufficient.

Record exact LSP symbols and findings in durable checkpoints.

## DURABLE MEMORY / RESUME LAW

This is a large batch. Every lane must continuously publish durable canonical checkpoints containing:

- PHASE;
- lane state;
- FINDINGS;
- DECISIONS;
- EVIDENCE;
- TESTS;
- UNCERTAINTIES;
- WHAT IS COMPLETE;
- WHAT REMAINS;
- EXACT NEXT ACTION;
- SAFE RESUME instruction.

A pending lane is not batch failure.
A timeout/interruption is not permission to restart.
A completed durable lane MUST NOT be rerun in a recovery generation.

Machine binding line must remain exactly:

`binding: START=576803fbda76970a4bbfe2287b5f9ca101d0f6c3 TREE=11f35844670551ac4ab5be322272a3221e6b1c4b`

No annotation/suffix on the binding line.

## EXPECTED FILE FAMILIES

Prefer new complementary files under:

- `src/qore/modules/cibo/`
- `src/qore/infrastructure/`
- `tests/modules/cibo/`
- `tests/infrastructure/`
- `docs/architecture/QORE-CIBO-COGNITIVE-SUPERARCHITECTURE-001.md`

Use clear cognitive-specific names, for example world model, attention, planning, learning, tools/faculty bus, replay/evaluation. Do not modify unrelated infrastructure merely to fit the package.

## QUALITY GATE

Host owns canonical FULL QG. Candidate must be ready for:

- `ruff check .`
- `mypy src tests`
- `pytest --cov=src/qore --cov-report=term-missing`
- `git diff --check`

No test weakening, unjustified skip/xfail, `type: ignore` hiding defects, lint suppression or coverage gaming.

## FINAL REPORT REQUIRED

Report:

1. exact START/TREE;
2. six lane states;
3. `CA-01..CA-18` roadmap conformance ledger;
4. files changed;
5. semantic LSP before/after evidence;
6. adversarial matrix dispositions;
7. focused tests;
8. FULL QG readiness;
9. unresolved integration seams with Batch 006;
10. proof no CIBO Functions/Trader Lab/provider/Production authority leaked into cognition;
11. exact safe next action for `COGNITIVE INTEGRATION GATE`.

When genuinely complete emit literal:

## RESUME STATE
COMPLETE

and:

`CANDIDATE_READY_FOR_EXTERNAL_QG`

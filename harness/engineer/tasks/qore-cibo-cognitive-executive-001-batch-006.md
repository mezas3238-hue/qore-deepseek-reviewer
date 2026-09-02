# HARNESS ENGINEER — QORE CIBO COGNITIVE EXECUTIVE 001 / BATCH 006

## PACKAGE

`HARNESS-ENGINEER-QORE-CIBO-COGNITIVE-EXECUTIVE-001-BATCH-006`

## AUTHORITY / SOURCE OF TRUTH

- Target repository: `mezas3238-hue/qore-core`
- Roadmap change order: qore-core Issue `#482 QORE-CIBO-COGNITIVE-EXECUTIVE-ARCHITECTURE-001`
- Parent roadmap: `#303`
- Existing CIBO Trader Development foundation: `#479 / PR #480`
- Trader Lab: `#473 / PR #481`
- Trader reasoning/voice boundary: `#475`
- Economic evidence: `#472`
- CIBO roadmap amendment lineage: `#474`

GitHub live is authoritative. Do not reconstruct QORE from this package alone.

## EXACT START — FROZEN INPUT

Checkout exactly:

- commit: `576803fbda76970a4bbfe2287b5f9ca101d0f6c3`
- tree: `11f35844670551ac4ab5be322272a3221e6b1c4b`

This SHA is the current frozen recovered CIBO Trader Development candidate from PR #480. It is used ONLY as an immutable engineering input so Batch 006 can compose with its exact contracts. **Do not mutate PR #480, its branch, its HEAD, or its review package.** Work in the disposable Harness workspace and return artifact only.

If exact checkout/tree mismatch: fail closed before implementation and report the mismatch. Do not silently substitute current `main` or another CIBO candidate.

Batch 006 may be engineered now, but its future materialization/admission must remain subordinate to the independent admission of its exact CIBO foundation. If PR #480 is later changed because of a valid reviewer finding, Batch 006 will require explicit reconciliation/revalidation; do not hide that dependency.

## EXECUTIVE OBJECTIVE

Implement the first bounded foundation of **CIBO as the Cognitive Executive Director of QORE Core**, not merely a chatbot, trader, signal source, or Trader Manager.

Canonical law:

```text
CIBO THINKS / PLANS / QUESTIONS / LEARNS FROM GOVERNED EVIDENCE
CORE EXECUTES THROUGH FORMAL CONTRACTS
CIBO INTELLIGENCE != UNBOUNDED AUTHORITY
CIBO RECOMMENDATION != RISK BYPASS
CIBO REASONING != PROVIDER-NATIVE ORDER
CIBO MEMORY != SILENT SELF-REWRITE
TRADER VOICE != FORMAL SIGNAL
IDEA != TRADE AUTHORITY
```

This batch establishes reusable, provider-neutral, deterministic foundations for:

1. executive cognitive observations/hypotheses/uncertainty/recommendations;
2. explicit reasoning mode and bounded deliberation roles;
3. governed persistent executive memory with provenance/freshness/confidence/limitations;
4. executive decision / lesson / failure / economic-journal foundations;
5. adversarial critic / disagreement-retaining council deliberation;
6. executive synthesis / orchestration seam that can consume exact CIBO/Trader evidence but cannot create execution authority.

Do **not** attempt to implement the entire #482 roadmap in this batch. CE-03/05/06/07/08/09/10 remain later slices except for minimal provider-neutral seams necessary to keep CE-01/02/04 composable.

## ROADMAP TARGET CONTEXT

The complete #482 architecture later includes:

- Executive Reasoning / Synthesis
- Financial World Model
- Market Intelligence Mesh
- Trader Director / Trader Academy
- Portfolio / Capital / Allocation Intelligence
- Quantitative Intelligence
- Research / scientific experiment planning
- Economic Evidence / Profitability Intelligence
- Risk-aware Executive Reasoning
- Adversarial Critic / Skeptic
- Council-of-Minds deliberation
- Persistent Executive Memory
- Executive / Profit / Stop-Loss / Failure journals
- Core/Operational Health Awareness
- Voice / Dialogue / uncertainty / questions
- Counterfactual evaluation
- self-evaluation of CIBO decisions

Batch 006 must create clean seams for those capabilities without prematurely implementing them or coupling Core to a concrete LLM/model/provider.

## MANDATORY PRE-IMPLEMENTATION RECONSTRUCTION

Before editing, use semantic LSP and repository-wide inspection. At minimum inspect and use `hover`, `findReferences`, `goToDefinition`, and where applicable `goToImplementation` on the exact existing CIBO/research/evidence contracts that constrain this work.

Inspect at least:

- `src/qore/modules/cibo/contracts.py`
- `src/qore/modules/cibo/module.py`
- `src/qore/governance/cibo_executive_dialogue.py`
- `src/qore/governance/cibo_widget.py`
- `src/qore/infrastructure/cibo_supervised_runtime.py`
- `src/qore/infrastructure/cibo_operational_supervision_evidence.py`
- `src/qore/infrastructure/cibo_trader_capability_profile.py`
- `src/qore/infrastructure/cibo_trader_development_review.py`
- `src/qore/infrastructure/cibo_trader_manager.py`
- relevant ResearchRun / strategy binding / evidence lineage / OOS / Monte Carlo / risk-policy contracts
- existing immutable evidence-ref/fingerprint/provenance/value-object patterns
- tests that enforce exact runtime types, deterministic logical values, recursive revalidation, sanitized evidence and authority boundaries.

Do not solve this with grep-only reasoning. Record semantic-LSP evidence in the durable checkpoint/final report.

## ARCHITECTURAL PLACEMENT

Choose placement only after LSP/dependency inspection. Preserve dependency direction. Do not make Core/Domain/Governance depend backward on concrete infrastructure or model/provider adapters.

Preferred bounded file budget if architecture confirms it:

- `docs/architecture/QORE-CIBO-COGNITIVE-EXECUTIVE-001.md`
- `src/qore/modules/cibo/cognitive_contracts.py` or the semantically correct provider-neutral CIBO contract location
- `src/qore/infrastructure/cibo_executive_memory.py`
- `src/qore/infrastructure/cibo_executive_journal.py`
- `src/qore/infrastructure/cibo_executive_deliberation.py`
- `src/qore/infrastructure/cibo_executive_brain.py`
- focused tests under existing `tests/modules/cibo/` and/or `tests/infrastructure/`

Do not edit unrelated files. Prefer new bounded files over broad refactors. If exact layering requires a different new-file placement, document the reason and remain inside the allowed path families supplied by the dispatch package.

## CROSS-CUTTING QORE INVARIANTS

Mandatory throughout:

- provider-neutral Core semantics;
- no reverse dependency from Core/Domain/Governance into concrete adapters;
- `@dataclass(frozen=True, slots=True)` when applicable;
- typed Protocol boundaries where a behavior seam is needed;
- typed `Result / Success / Failure` and typed errors where operations may fail;
- exact runtime types; `bool != int`; no subclass laundering;
- recursive revalidation of nested externally materialized semantic values;
- exact UUID semantics when UUID is used;
- timezone-aware timestamps only;
- no implicit `datetime.now()`, `date.today()`, `uuid4()` in deterministic contracts;
- no hidden RNG, global mutable state, hidden retry, sleep, scheduler, thread or network side effect;
- immutable sanitized metadata/evidence; deterministic canonicalization/order;
- no secrets/tokens/credentials in repr/logical values/evidence/journal payloads;
- uncertainty fails closed;
- no provider-native identity/order laundering;
- no accidental operational/execution/promotion authority.

## COGNITIVE SEMANTICS — REQUIRED

### Reasoning modes

Create provider-neutral semantic modes equivalent to:

- `FAST`
- `HIGH`
- `MAX`
- `COUNCIL_ADVERSARIAL`

These are **reasoning-policy semantics**, not concrete model names, token budgets or API settings. Core must not import a specific LLM vendor/model.

### Epistemic states

CIBO must distinguish, with typed semantics where appropriate:

```text
OBSERVATION
INFERENCE
HYPOTHESIS
OPINION
FORMAL_RECOMMENDATION
```

None of them is an `AUTHORIZED_ACTION`.

Represent uncertainty explicitly. Valid outcomes must permit at least:

- insufficient evidence;
- unresolved contradiction;
- competing hypotheses;
- request/recommendation for more evidence;
- abstention/defer;
- bounded confidence only when justified by explicit evidence/schema.

Never manufacture certainty for conversational fluency.

### Deliberation roles

Provide a generic, bounded role/faculty identity suitable for later instances such as:

- Market Strategist
- Quant
- Portfolio
- Trader Director
- Researcher
- Risk-aware Critic
- Skeptic

Do not hard-code operational privileges into roles. A role emits an evidence-bound argument/critique/opinion, not an order.

### Council semantics

A deliberation must retain:

- exact deliberation identity/version/context binding;
- participants/roles;
- evidence references;
- each participant's position/argument;
- uncertainty/limitations;
- disagreements and contradictions;
- adversarial critiques;
- executive synthesis when one is justified;
- explicit no-decision/insufficient-evidence outcome.

Do not collapse disagreement into fabricated consensus. Deterministic input ordering/canonicalization is mandatory.

## MEMORY ARCHITECTURE — REQUIRED FOUNDATION

Do not use transient LLM context as authoritative CIBO memory.

Create typed foundations capable of distinguishing at least:

- working;
- episodic;
- semantic;
- market;
- Trader;
- research;
- decision;
- economic;
- failure/lesson;
- long-term archive.

Every retained memory fact/item must be evidence/provenance bound and expose enough semantics for later retrieval to distinguish:

- source identity/reference;
- event/effective timestamp supplied explicitly;
- recorded timestamp supplied explicitly if semantically distinct;
- freshness/currentness state where applicable;
- confidence/uncertainty where applicable;
- limitations;
- exact subject/version/config binding where applicable;
- supersession/revision lineage without silent destructive rewrite.

A summary/index may reference source records but **must not replace source evidence**. No fabricated memories. No silent self-modification of certified Trader/CIBO code/config from memory.

Memory API must be deterministic and testable. Do not implement a concrete vector database, embeddings provider, cloud DB, LLM memory service or infinite-storage claim in this batch. Define provider-neutral contracts/value objects and an in-memory/pure seam only if needed for tests.

## EXECUTIVE JOURNAL — REQUIRED FOUNDATION

Create immutable evidence-oriented journal entry semantics capable of retaining material executive episodes, including as applicable:

- exact episode identity;
- subject/world/Core state references;
- hypotheses/alternatives;
- uncertainty/questions;
- consulted roles/Traders/specialists;
- evidence references;
- recommendation/decision rationale as sanitized semantic content/reference;
- expected result and risk assumptions when explicitly provided;
- actual-result/economic evidence references when later available;
- counterfactual reference when available;
- lesson reference/outcome;
- confidence before/after when explicitly justified.

No hindsight rewrite: later outcomes/lessons should append/link/supersede through explicit lineage rather than mutate the historical belief into what became known later.

## PROFIT / TRADE / STOP / FAILURE JOURNAL FOUNDATION

This batch does not duplicate #472 economic accounting. It must provide journal link semantics that can later point to exact economic evidence for:

- Trader identity + exact version/config;
- instrument/market/regime references;
- originating formal signal/decision refs;
- CIBO management mode/action ref;
- Risk decision ref;
- actual DEMO receipt/fill/reconciliation refs;
- gross/net PnL/cost/slippage/carry refs where certified;
- stop/target lifecycle refs;
- MFE/MAE refs when supported;
- drawdown/exposure contribution refs;
- Trader/CIBO attribution refs;
- evidence sufficiency.

Never invent a PnL, stop cause, regime classification or attribution merely because a field is desired.

Loss/stop analysis must support `INSUFFICIENT_EVIDENCE` as a first-class diagnosis and later hypotheses such as risk containment, entry quality, market noise, regime change, volatility expansion, late signal, lifecycle mismatch, instrument mismatch, stop methodology, concentration/correlation event, execution/cost degradation. These remain hypotheses/research inputs, not silent parameter changes.

## EXECUTIVE BRAIN / ORCHESTRATION SEAM

Implement only the provider-neutral deterministic executive orchestration seam necessary to combine:

```text
CONTEXT / OBSERVATIONS
+ MEMORY REFERENCES
+ EVIDENCE
+ DELIBERATION / CRITIQUE
-> EXECUTIVE SYNTHESIS / RECOMMENDATION
```

The output may recommend, question, defer, request evidence/research or issue a typed executive intent/request for later Policy/Risk handling. It must not:

- construct provider-native orders;
- call a broker/exchange;
- authorize real or DEMO capital by itself;
- bypass Risk/Policy;
- promote a Trader;
- alter a certified Trader version/config;
- silently write its own source/config;
- translate free-form dialogue directly to executable authority.

Expected future operational chain remains:

```text
CIBO COGNITIVE INTENT
-> TYPED FORMAL RECOMMENDATION / COMMAND REQUEST
-> POLICY
-> RISK
-> AUTHORIZED DEMO BOUNDARY
-> EXECUTION
-> RECONCILIATION
-> ECONOMIC EVIDENCE
-> CIBO LEARNING EVIDENCE
```

Current scope is TEST/DEMO only. Production remains out of scope and unauthorized.

## SIX-LANE EXECUTION PLAN

Work as six coordinated logical lanes. Lanes may investigate in parallel internally, but the final candidate is one coherent bounded artifact.

### LANE 1 — Cognitive contracts + semantic map

- LSP-map existing CIBO/Research/Risk/evidence definitions and references.
- Implement exact cognitive/epistemic/reasoning-role/mode/recommendation/uncertainty contracts.
- Prove no execution/promotion/provider authority.
- Add exact-type/canonicalization/recursive revalidation tests.

### LANE 2 — Governed executive memory

- Implement memory kinds/items/provenance/freshness/uncertainty/version/supersession semantics.
- Preserve original evidence; no destructive hindsight rewrite.
- Add deterministic retrieval/retention seam only as necessary.
- Tests for duplicate/conflicting identity, stale/future-invalid data where contract requires, secret sanitation, mutation attempts and corrupted nested objects.

### LANE 3 — Journals / lessons / failures

- Implement executive decision journal foundation.
- Implement economic/trade/stop/failure link semantics without duplicating accounting.
- Ensure loss diagnosis supports insufficient evidence and remains non-causal unless evidence justifies stronger semantics.
- Test append/link/supersession/no-hindsight behavior.

### LANE 4 — Council / adversarial critic / disagreement

- Implement deliberation participants/arguments/critiques/disagreements/synthesis/no-decision semantics.
- Preserve independent positions and evidence.
- Tests for contradiction, missing evidence, duplicate role/input, malicious/secret text, non-deterministic ordering and fake consensus.

### LANE 5 — Executive Brain seam + authority boundary

- Implement pure/provider-neutral orchestration/synthesis seam using previous lanes.
- Compose with exact existing CIBO evidence/Trader Manager semantics only where layering permits.
- Explicitly test that output cannot become provider order, execution authorization, Risk bypass or Trader promotion.
- Test uncertainty/defer/request-more-evidence paths.

### LANE 6 — Integration / adversarial audit / docs / FULL QG

- Run semantic LSP again after implementation; inspect references and layering.
- Add cross-module adversarial tests.
- Write `docs/architecture/QORE-CIBO-COGNITIVE-EXECUTIVE-001.md` describing current implemented slice vs future #482 roadmap, with no false claims of full financial-world or profitability capability.
- Audit exact diff/path/file budget.
- Run FULL QG exactly.

## ADVERSARIAL TEST FOCI

At minimum attempt to break:

1. `bool` laundering as integer/confidence/ordinal;
2. mutable nested structures after construction;
3. subclass laundering where exact runtime type is required;
4. naïve datetimes;
5. duplicate/same-semantic evidence under different ordering;
6. evidence refs containing token/password/API-key-like secret material;
7. mutated/corrupted nested dataclass after reflective/object-level tampering followed by logical-values/revalidation;
8. memory claiming a fact without provenance;
9. summary claiming authority without source record;
10. hindsight mutation of prior decision/belief after outcome arrives;
11. council with contradictory positions incorrectly returning consensus;
12. empty/missing evidence incorrectly returning high confidence;
13. adversarial free-form content attempting to inject provider-native order/account/credential fields;
14. CIBO recommendation being treated as Risk approval;
15. Trader development suggestion being treated as promotion;
16. memory/journal causing silent Trader parameter mutation;
17. concrete LLM/provider/model identity leaking into provider-neutral contracts;
18. hidden current-time/random IDs producing replay divergence;
19. noncanonical ordering changing fingerprints/logical values;
20. loss/stop diagnosis asserting causality with insufficient evidence.

## ALLOWED CHANGE BUDGET

Stay within the dispatch `allowed_paths` and these limits:

- maximum changed files: 15
- maximum diff lines: 4300

Prefer approximately 5–7 source/docs files plus focused tests. Do not consume the budget simply because it exists.

## FORBIDDEN

- no Production accounts or Production readiness claim;
- no real capital;
- no deposits/withdrawals;
- no productive credentials;
- no real-money orders;
- no Risk bypass;
- no provider-native order construction;
- no hidden retry/scheduler/network/model call;
- no self-editing code/config;
- no automated Trader promotion;
- no fabricated market/economic evidence;
- no fabricated confidence;
- no weakening tests, skips/xfails, lint/type suppressions or artificial coverage exclusions;
- no modifying existing frozen PR #480/#481 branches;
- no push/merge/PR creation from Harness;
- no touching `origin` persistently: artifact-only host policy remains authoritative.

## FULL QUALITY GATE — MANDATORY

Run exactly from qore-core root on the final combined candidate:

```bash
ruff check .
mypy src tests
pytest --cov=src/qore --cov-report=term-missing
```

No lower substitute. Focused tests are additive, not replacements.

Also run:

```bash
git diff --check
```

Record exact exit status and summary for each command.

## ARTIFACT / REVIEW HANDOFF

Return artifact only. Do not push or merge.

Required final handoff must include:

- package id;
- exact starting SHA/TREE;
- final synthetic/worktree identity available to Harness;
- exact changed files;
- exact diff-stat;
- FULL QG results;
- focused test results;
- LSP operations/findings;
- architecture decisions;
- unresolved uncertainties;
- authority-boundary audit;
- candidate readiness;
- exact next action.

Future external gate after host materialization/fresh FULL QG/freeze is strictly:

```text
DEEPSEEK EXPERT (repo-wide read-only + exact frozen checkout + semantic LSP)
-> INDEPENDENT GPT IA ADJUDICATION
-> DEEPSEEK CODER (repo-wide read-only + exact frozen checkout + semantic LSP)
-> INDEPENDENT GPT IA ADJUDICATION
-> CLAUDE INDEPENDENT REVIEW
-> FINAL GPT IA
```

Reviewers may reason, criticize and emit opinions/findings. In review mode they must not mutate the frozen candidate.

## DURABLE CHECKPOINT REQUIREMENT

Harness and every lane must continuously write enough durable state so recovery never requires repeating completed investigation/work.

The final report/checkpoint must explicitly contain:

```text
PHASE
FINDINGS
DECISIONS
EVIDENCE
UNCERTAINTIES
LANES COMPLETED
LANES PENDING
CHANGES
WHAT DONE
WHAT FOUND
WHAT CLOSED
WHAT REMAINS
WHERE RESUME
PENDING NEXT ACTION
SAFE RESUME
```

A pending lane is not equivalent to whole-batch failure. A completed durable lane must not be rerun merely because another lane or wrapper exits unexpectedly.

## FINAL RESUME MARKER

To remain compatible with the current resilient runner, finish with the literal marker with no Markdown code quotes around `COMPLETE`:

## RESUME STATE
COMPLETE

Only emit `COMPLETE` when all six lanes, final combined audit, required tests/docs and FULL QG are actually complete and candidate-ready. Otherwise state the exact safe resume point without fabricating completion.
# QORE DeepSeek Token-Budget Policy

## Objective

Reduce DeepSeek review-token consumption without weakening the serial Expert/Coder quality gate.

The reviewer must remain:
- bound to the exact BASE / HEAD / synthetic merge;
- read-only against qore-core;
- adversarial rather than CI-trusting;
- complete over every changed file;
- bounded to the requested authority/scope.

**QUALITY NON-REGRESSION IS A HARD INVARIANT.** Token reduction is an optimization of information flow, never a reduction of review depth, changed-file coverage, adversarial reasoning, or evidence requirements.

Token efficiency is subordinate to semantic correctness, but uncontrolled repeated context is not acceptable.

## V1 execution strategy

Each DeepSeek review is split into two phases.

### 1. Evidence exploration — non-thinking

Use the same configured DeepSeek Pro model by default, but explicitly disable thinking while tools are active.

Rules:
- verify compact `repo_state` once;
- inspect relevant surrounding definitions/usages with targeted reads;
- batch independent tool calls where possible;
- do not reread the same ranges;
- duplicate tool calls with identical arguments are automatically skipped;
- search before broad reads;
- avoid the historical PR review chain unless the target package directly requires prior adjudication evidence;
- never request a recursive full HEAD tree listing.

Default hard limits:
- maximum exploration rounds: **7**;
- maximum tool calls per round: **8**;
- maximum serialized exploration context before another API call: **120,000 characters**;
- maximum tool-result text: **9,000 characters**;
- bounded exploratory evidence bundle: **100,000 characters**;
- cumulative exploration prompt-token budget: **220,000**;
- cumulative exploration cache-miss budget: **80,000**;
- explorer max completion per call: **2,200 tokens**.

The harness stops additional exploration when a context/token budget is reached. A budget stop is never evidence that the package is clean.

### 2. Mandatory changed-file evidence — deterministic, complete, not model-selected

Before final adjudication, the quality guard injects the exact complete textual content of every BASE..HEAD changed file into the final review evidence.

Rules:
- added/modified/type-changed files are read from the exact frozen HEAD;
- deleted files are read from the exact frozen BASE;
- modified/type-changed files also include the exact BASE..HEAD patch;
- mandatory changed-file content is not clipped or selectively omitted to save tokens;
- binary/non-UTF-8 material fails closed rather than being silently skipped;
- if complete mandatory evidence exceeds the configured quality budget, the review fails closed and the surface must be split or the budget explicitly raised.

Default mandatory changed-file cap: **140,000 characters**. This is a safety fuse, not a consumption target.

### 3. Final review — thinking/high, no tools

The final DeepSeek reviewer receives:
- exact frozen binding and target instructions;
- bounded exploratory evidence;
- the complete mandatory changed-file evidence;
- the explorer note.

It performs one high-reasoning pass with no tools and independently adjudicates the raw evidence. The explorer's interpretation is not authoritative.

Default final completion budget: **7,000 tokens**.

A single non-thinking fallback is allowed only if the thinking call returns no final content.

If exploration stopped because a token/context budget was exhausted and evidence required to certify a requested invariant may be missing, the final reviewer must return `EVIDENCIA INSUFICIENTE / VALIDACIÓN BLOQUEADA`, unless it has already established a concrete material finding. The harness rejects a clean `HALLAZGOS: NINGUNO / VALIDACIÓN OK` verdict produced after such an incomplete exploration condition.

## Why this structure

DeepSeek's API is stateless. A tool-using thinking conversation requires the model's reasoning state/context to be replayed on subsequent tool rounds, making long agent loops progressively larger.

QORE therefore keeps tool exploration non-thinking, supplies changed-file evidence deterministically, and reserves expensive reasoning for one final synthesis/falsification pass. The optimization removes repeated context; it does not remove evidence or reasoning quality.

## Telemetry — mandatory

Every API call records:
- stage and round;
- model;
- `prompt_tokens`;
- `prompt_cache_hit_tokens`;
- `prompt_cache_miss_tokens`;
- `completion_tokens`;
- reasoning tokens when reported;
- total tokens.

The run writes JSONL telemetry and a GitHub Step Summary. Account balance before/after remains a second, independent billing meter.

A review without token telemetry is an observability failure and must be investigated before scaling usage.

## Quality safeguards

Token savings must never justify:
- skipping a changed file;
- truncating mandatory changed-file evidence;
- trusting a prior reviewer conclusion without independent evidence;
- treating green CI as semantic proof;
- widening authority to compensate for missing evidence;
- marking a package clean when raw evidence does not support that conclusion;
- converting budget exhaustion into an implicit PASS.

When quality and token budget conflict, **quality wins**. The permitted responses are: raise the evidence budget, narrow/split the review surface, or block the review as insufficient. Silently reducing inspection depth is forbidden.

## Quality non-regression gate

The optimized harness must demonstrate parity with the previous reviewer, not merely lower spend.

For the first five production-equivalent reviews, compare:
- material findings discovered and independently adjudicated;
- exact changed-file coverage;
- source/test/doc contradiction detection;
- fail-closed/type/determinism/authority analysis;
- API-call count;
- prompt/cache-hit/cache-miss/completion/reasoning totals;
- actual balance delta.

Any credible missed material finding attributable to reduced evidence/reasoning is a **quality regression**. In that case, increase the evidence/round/final-reasoning budgets or revert the optimization before further cost tuning.

No cheaper model may be introduced as a response to token usage until this non-regression gate is satisfied.

## Operational targets

V1 target:
- normally **<= 8 API calls** per review (7 exploration + 1 final);
- exploration prompt tokens **<= 220k**, subject only to one-call measurement overshoot because API token usage is known after a request;
- cache-miss exploration tokens **<= 80k**, with the same one-call measurement caveat;
- serialized exploration context never intentionally sent above 120k characters;
- no more than 8 tool calls accepted in one round;
- identical tool calls are not executed twice;
- large exploratory tool responses never exceed 9k characters each;
- complete changed-file evidence is preserved separately and never clipped for token savings;
- no recursive repository-tree dump.

These are ceilings/fuses for V1 benchmarking, not desired steady-state consumption. After quality parity is proven, lower targets may be introduced incrementally.

## V2 candidate — only after V1 evidence

After at least five quality-parity comparisons with no missed material findings, evaluate `deepseek-v4-flash` for the **exploration phase only** while retaining `deepseek-v4-pro` thinking/high for the final review.

Do not switch the final adjudicator to Flash as a cost-only optimization without a separate quality certification.

## Dispatch invariant

Token-budgeting does not replace the existing dispatch invariant:

**one package -> one current.json mutation -> one auto-dispatch -> one DeepSeek job**.

Duplicate jobs must be cancelled rather than allowed to consume the same review budget twice.

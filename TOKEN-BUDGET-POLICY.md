# QORE DeepSeek Token-Budget Policy

## Objective

Reduce DeepSeek review-token consumption without weakening the serial Expert/Coder quality gate.

The reviewer must remain:
- bound to the exact BASE / HEAD / synthetic merge;
- read-only against qore-core;
- adversarial rather than CI-trusting;
- complete over every changed file;
- bounded to the requested authority/scope.

Token efficiency is subordinate to semantic correctness, but uncontrolled repeated context is not acceptable.

## V1 execution strategy

Each DeepSeek review is split into two phases.

### 1. Evidence exploration — non-thinking

Use the same configured DeepSeek Pro model by default, but explicitly disable thinking while tools are active.

Rules:
- verify compact `repo_state` once;
- inspect every changed file completely with targeted ranges;
- batch independent tool calls where possible;
- do not reread the same ranges;
- duplicate tool calls with identical arguments are automatically skipped;
- search before broad reads;
- inspect only relevant surrounding definitions/usages;
- avoid the historical PR review chain unless the target package directly requires prior adjudication evidence;
- never request a recursive full HEAD tree listing.

Default hard limits:
- maximum exploration rounds: **7**;
- maximum tool calls per round: **8**;
- maximum serialized exploration context before another API call: **120,000 characters**;
- maximum tool-result text: **9,000 characters**;
- final evidence bundle: **100,000 characters**;
- cumulative exploration prompt-token budget: **220,000**;
- cumulative exploration cache-miss budget: **80,000**;
- explorer max completion per call: **2,200 tokens**.

The harness stops additional exploration when a context/token budget is reached and proceeds with already collected evidence. It must not infer unseen facts.

### 2. Final review — thinking/high, no tools

The final DeepSeek reviewer receives the frozen binding, target review instructions, explorer note and bounded raw evidence bundle.

It performs one high-reasoning pass with no tools and independently adjudicates the raw evidence. The explorer's interpretation is not authoritative.

Default final completion budget: **7,000 tokens**.

A single non-thinking fallback is allowed only if the thinking call returns no final content.

## Why this structure

DeepSeek's API is stateless. A tool-using thinking conversation requires the model's `reasoning_content` to be replayed on subsequent tool rounds. That makes long agent loops progressively larger.

QORE therefore keeps tool exploration non-thinking and reserves expensive reasoning for one final synthesis/falsification pass. This removes the need to replay tool-call reasoning while preserving a high-reasoning final decision.

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
- trusting a prior reviewer conclusion without independent evidence;
- treating green CI as semantic proof;
- widening authority to compensate for missing evidence;
- marking a package clean when the raw evidence does not support that conclusion.

If the evidence budget is insufficient for a material claim, the final reviewer must state bounded uncertainty rather than invent a finding.

## Operational targets

V1 target:
- normally **<= 8 API calls** per review (7 exploration + 1 final);
- exploration prompt tokens **<= 220k**, subject only to one-call measurement overshoot because API token usage is known after a request;
- cache-miss exploration tokens **<= 80k**, with the same one-call measurement caveat;
- serialized exploration context never intentionally sent above 120k characters;
- no more than 8 tool calls accepted in one round;
- identical tool calls are not executed twice;
- large raw tool responses never exceed 9k characters each;
- no recursive repository-tree dump.

The first five production-equivalent reviews using V1 must be compared with the previous harness for:
- material-finding quality;
- API-call count;
- prompt/cache-hit/cache-miss/completion totals;
- actual balance delta.

If quality regresses, increase evidence/round budgets before considering a cheaper model.

## V2 candidate — only after V1 evidence

After at least five clean comparisons with no missed material findings, evaluate `deepseek-v4-flash` for the **exploration phase only** while retaining `deepseek-v4-pro` thinking/high for the final review.

Do not switch the final adjudicator to Flash as a cost-only optimization without a separate quality certification.

## Dispatch invariant

Token-budgeting does not replace the existing dispatch invariant:

**one package -> one current.json mutation -> one auto-dispatch -> one DeepSeek job**.

Duplicate jobs must be cancelled rather than allowed to consume the same review budget twice.

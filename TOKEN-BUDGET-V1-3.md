# QORE DeepSeek Token Budget V1.3

## Objective

Reduce DeepSeek prompt amplification below a tolerable steady-state level without weakening QORE review quality.

V1.3 changes information flow, not the reviewer standard.

## Quality invariant

The following remain non-negotiable:

- exact frozen BASE / HEAD / synthetic binding;
- complete deterministic content of every changed file;
- exact modified-file patches where applicable;
- deterministic local dependency evidence for directly imported QORE infrastructure symbols;
- independent DeepSeek Pro high-reasoning final adjudication;
- material findings require concrete accepted-state witnesses;
- CI green is never semantic proof;
- missing evidence produces `EVIDENCIA INSUFICIENTE / VALIDACIÓN BLOQUEADA` rather than an inferred PASS;
- no Production or real-capital authority;
- one package -> one dispatch -> one job remains unchanged.

No cheaper model is introduced by V1.3.

## Root cause addressed

V1.2 still uses a conversational Explorer loop. Even without thinking, each new tool round replays the prior messages and tool outputs to the stateless API. This makes prompt usage grow cumulatively.

V1.3 removes that replay loop.

## V1.3 flow

### 1. Deterministic evidence assembly — zero DeepSeek calls

The harness assembles locally:

- complete changed-file snapshots;
- exact modified-file patches;
- bounded semantic slices for direct local `qore.infrastructure.*` imports and referenced module-local helpers;
- compact exact repo-state binding;
- PR metadata;
- HEAD check-runs;
- combined commit status.

This evidence is not selected by the model. Complete source is emitted as exact raw text rather than adding a numeric prefix to every line; path and line-span metadata remain in the surrounding evidence headers.

### 2. One-shot evidence planner — one non-thinking DeepSeek call

The planner receives the frozen binding, target review and an inventory of evidence guaranteed to the final reviewer. It may request, in one batched tool-call response, only genuinely additional surrounding evidence.

The harness executes those read-only calls locally. Tool results are never replayed into another Explorer API call.

Safeguards:

- maximum 12 planned tool calls;
- only targeted `read_file`, `git_show`, `search_text`, and `github_get` are exposed;
- complete changed files are never reread;
- definitions already included in a dependency slice should not be reread, but targeted material outside that partial slice remains legal even when it lives in the same dependency module;
- the planner inventory lists direct imports, selected local helper definitions and referenced external QORE symbols so missing surrounding evidence can be requested deliberately;
- duplicate calls are skipped;
- broad line reads are bounded;
- clipped/errored planned evidence marks the plan incomplete;
- incomplete planning can never support a clean verdict.

### 3. One final Pro/high review — one DeepSeek call

The final reviewer receives the complete deterministic bundle plus any planned evidence and reasons independently with no tools.

Normal expected total: **2 API calls**.

A non-thinking final fallback is permitted only if the high-reasoning call returns no visible review content. It is exceptional, not part of the normal budget.

The generated final report itself is review evidence and is never truncated after generation merely to save tokens.

## Fail-closed rule

If the final reviewer needs material absent from the evidence, it must return `EVIDENCIA INSUFICIENTE / VALIDACIÓN BLOQUEADA` and identify what is missing.

If the one-shot plan was incomplete, clipped, invalid or errored and the final model attempts a clean `HALLAZGOS: NINGUNO / VALIDACIÓN OK`, the harness replaces that clean verdict with deterministic `VALIDACIÓN BLOQUEADA`.

Evidence is never silently omitted or truncated to force a token target.

## Tolerable operating envelope

For review surfaces comparable to UNR-018 (three changed files / roughly 1,100 added lines), the steady-state target is:

- **preferred:** 25,000–60,000 total prompt tokens;
- **tolerable:** <= 75,000 total prompt tokens;
- **warning:** > 75,000 prompt tokens;
- **not stabilized:** > 100,000 prompt tokens unless a concrete larger evidence requirement explains it;
- normal API calls: **2**;
- exceptional maximum with final fallback: **3**.

These are efficiency targets, not evidence caps. Quality wins if a larger legitimate review needs more evidence.

## Benchmark baseline

R1D under V1.1/V1.2-era flow:

- API calls: 8;
- prompt tokens: 160,262;
- prompt cache hit: 26,752;
- prompt cache miss: 133,510;
- completion tokens: 13,857;
- reasoning tokens: 10,000;
- observed spend: USD 0.02.

V1.3 is considered successful only after legitimate reviews demonstrate quality parity and prompt usage inside the tolerable envelope.

## Non-regression gate

For at least the next three legitimate Expert/Coder reviews, record and compare:

- changed-file completeness;
- surrounding dependency coverage;
- material findings and IA adjudication;
- fail-closed behavior;
- API calls;
- prompt/cache-hit/cache-miss tokens;
- completion/reasoning tokens;
- observed billing delta.

Any credible missed defect attributable to one-shot planning or evidence slicing is a quality regression. Increase the relevant deterministic evidence/planning budget or revert the optimization before pursuing further savings.

No production review should be run solely to make the graph look cheaper. Benchmarking must not create duplicate QORE review jobs or alter `requests/current.json` outside the legitimate serial stage.

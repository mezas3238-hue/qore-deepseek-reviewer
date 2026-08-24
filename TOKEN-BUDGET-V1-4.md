# QORE DeepSeek Token Budget V1.4

## Objective

Preserve the quality guarantees of V1.3 while closing the two concrete reviewer-infrastructure bottlenecks measured by `BENCHMARK-V1.3-UNR018-CODER-01`.

Quality remains invariant. Token consumption remains the optimization variable.

## Measured V1.3 result

Comparable surface: UNR-018 Coder, three changed files / 1,120 added lines.

Previous conversational R1D flow:

- 8 API calls;
- 160,262 prompt tokens;
- 133,510 cache-miss prompt tokens;
- 13,857 completion tokens;
- 10,000 reasoning tokens;
- observed spend USD 0.02.

V1.3 benchmark:

- 3 API calls;
- 38,301 prompt tokens;
- 38,301 cache-miss prompt tokens;
- 17,588 completion tokens;
- 16,000 reasoning tokens;
- observed spend USD 0.01;
- final disposition: `EVIDENCIA INSUFICIENTE / VALIDACIÓN BLOQUEADA`.

Prompt usage fell by about 76%, into the preferred 25k–60k envelope, but V1.3 is **not** considered stabilized because the review did not reach a conclusive technical verdict and required the exceptional third call.

## Measured causes

The V1.3 run logs showed:

- deterministic changed-file coverage: 3 files;
- deterministic dependency modules: 2;
- total final evidence: 68,031 characters;
- `plan_incomplete=True`;
- the Pro/high final consumed its exact 16,000-token completion/reasoning ceiling without visible final content;
- a non-thinking fallback was therefore required;
- the fail-closed guard correctly rejected a clean fallback verdict because planning remained incomplete.

No quality guard is relaxed by V1.4.

## V1.4 correction

V1.4 changes only measured bottlenecks:

1. Pro/high final maximum rises from 16k to 24k tokens so the reviewer can finish reasoning and still emit visible review content.
2. The final system instruction explicitly requires reserving enough output envelope for the visible verdict without reducing analysis depth.
3. A single planned tool result may use up to 40k characters instead of 16k before fail-closed clipping.
4. Total planned evidence may use up to 120k characters and total final evidence up to 320k characters.
5. A sanitized plan diagnostic is persisted with each review. It records only lengths, budget values, planner-note classification and reason markers; it does not dump evidence, prompts, credentials or secrets.

The existing one-shot planner, complete changed-file evidence, deterministic dependency slices, exact binding/CI evidence, Pro/high final reviewer and fail-closed verdict rules remain unchanged.

## Success gate

For a surface comparable to UNR-018, V1.4 is acceptable only if a legitimate or isolated controlled benchmark shows all of:

- real technical verdict rather than harness-caused `VALIDACIÓN BLOQUEADA`;
- no credible quality regression against the known UNR-018 adversarial points;
- normal API calls: 2;
- preferred prompt usage: 25k–60k;
- tolerable prompt usage: <=75k;
- >100k prompt tokens remains not stabilized unless a concrete larger evidence requirement explains it.

An exceptional fallback remains available. If it is needed, the run is not counted as normal two-call stabilization even if token usage is low.

## Non-regression

V1.4 does not:

- switch to a cheaper model;
- lower final reasoning effort;
- omit changed files;
- silently truncate required evidence;
- infer PASS from missing evidence;
- change package/dispatch semantics;
- modify `requests/current.json` or `benchmarks/current.json`;
- add a workflow;
- modify QORE Core;
- expand Production or real-capital authority.

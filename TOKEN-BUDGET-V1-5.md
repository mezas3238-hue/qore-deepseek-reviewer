# QORE DeepSeek Reviewer — Token Budget V1.5

## Status

Quality-preserving stabilization candidate derived from the first legitimate UNR-019 Expert run under V1.4.

## Measured V1.4 result

Package `UNR019-ETAPAC-R1-DS-EXPERT-01` on frozen qore-core HEAD `b2fae639779bdf27c497929af1a545ae70a42649` produced:

- 3 API calls;
- 32,088 prompt tokens;
- 25,855 completion tokens;
- 24,000 reasoning tokens;
- USD 0.01 observed account delta;
- `plan_incomplete=true`;
- `reason_markers=[tool_error]`;
- blocked clean verdict.

The prompt-token reduction is acceptable compared with the pre-V1.3 baseline, but V1.4 is not stable because the planner error remained coarse and Pro/high exhausted the exact 24k output envelope without visible final content.

## V1.5 changes

V1.5 does not reduce review quality or review evidence.

It keeps:

- `deepseek-v4-pro`;
- thinking mode enabled for the authoritative final;
- reasoning effort `high`;
- complete changed-file evidence;
- exact modified-file patches;
- deterministic dependency slices;
- frozen binding / CI evidence;
- one-shot evidence planner;
- fail-closed behavior on genuinely incomplete evidence;
- no Production or real-capital authority.

It changes only measured infrastructure bottlenecks:

1. harmless planner path forms are normalized to repository-relative paths;
2. harmless GitHub endpoint forms are normalized back to the existing qore-core-only REST boundary;
3. the planner is explicitly told not to misuse `github_get` for external URLs or other repositories;
4. diagnostic output retains compact tool-error summaries when a plan still fails;
5. Pro/high final output envelope rises from 24k to 40k, preserving `high` reasoning while leaving more room for visible answer output;
6. diagnostics retain reasoning-content and visible-content character counts for final/fallback calls.

## Authority invariant

Normalization never broadens tool authority. `tool_github_get` still enforces `/repos/mezas3238-hue/qore-core`; repository path safety remains enforced by the existing reviewer implementation. Unsupported external evidence must still become `EVIDENCE_INCOMPLETE`, not an inferred fact.

## Quality rule

A lower token count is not success if the review cannot conclude safely.

V1.5 is successful only if a fresh legitimate package:

- preserves exact binding and complete mandatory evidence;
- has no unresolved planner/tool error;
- reaches a semantically adjudicable verdict;
- does not turn incomplete evidence into a clean PASS;
- avoids or materially reduces redundant fallback behavior;
- remains materially below the historical token-amplified reviewer path.

If the final still exhausts 40k reasoning tokens without visible content, V1.5 is not considered stable and the diagnostic must drive the next bounded correction rather than increasing budgets blindly again.

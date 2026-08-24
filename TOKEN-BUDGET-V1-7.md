# QORE DeepSeek Reviewer — Token Budget V1.7

## Status

Quality-preserving planner-tool stabilization derived from the legitimate UNR-019 Coder run under V1.6.

## Measured V1.6 result

Package `UNR019-ETAPAC-R1B-DS-CODER-01` on frozen qore-core HEAD `b2fae639779bdf27c497929af1a545ae70a42649` produced:

- 3 API calls;
- 43,216 prompt tokens;
- 20,347 completion tokens;
- 20,000 reasoning tokens;
- zero observed balance delta at the available precision;
- correct fail-closed verdict;
- planner failures because `search_text` required unavailable `rg`;
- `tool_token_clip` because planner tools inherited the older 9k conversational clip before the V1.4 40k hard result gate.

V1.6 therefore reduced completion/reasoning materially but was not stable enough to certify Coder.

## V1.7 changes

V1.7 keeps every V1.6 review-quality invariant:

- `deepseek-v4-pro`;
- authoritative thinking/high evidence analysis;
- complete changed-file evidence and exact modified-file patches;
- deterministic dependency slices;
- frozen binding and CI evidence;
- one-shot evidence planner;
- reasoned presentation synthesis when needed;
- fail-closed behavior for incomplete evidence;
- no Production or real-capital authority.

It changes only the planner's local read-only tool implementations:

1. `search_text` no longer depends on optional `rg`; it uses literal `git grep` over tracked checkout content.
2. `read_file` returns the exact requested line range without the old 9k conversational pre-clip.
3. `git_show` reads the complete exact BASE/HEAD/SYNTHETIC file first and then returns the requested range, avoiding pre-slice clipping.
4. `github_get` and deterministic baseline GitHub reads no longer inherit the 9k conversational clip.
5. V1.3/V1.4 hard evidence gates remain authoritative: any individual planned result above 40k chars or total planned evidence above 120k chars still blocks validation rather than truncating silently.

No tool gains write authority and no repository boundary is broadened. GitHub remains restricted to `/repos/mezas3238-hue/qore-core`; git refs remain restricted to the exact frozen BASE/HEAD/SYNTHETIC values; filesystem paths remain constrained to the qore-core checkout.

## Acceptance criteria

A fresh unique Coder package on the unchanged UNR-019 freeze is the next legitimate benchmark. V1.7 is acceptable only if:

- no `rg`/tool dependency error remains;
- no avoidable 9k `tool_token_clip` remains;
- evidence planning is complete or fails closed for a genuine hard-budget reason;
- the result is technically adjudicable;
- prompt remains within the established tolerable range;
- completion/reasoning does not regress materially from V1.6;
- no incomplete evidence can produce a clean PASS.

If those properties fail, V1.7 is not declared stable and the diagnostic drives the next bounded correction.

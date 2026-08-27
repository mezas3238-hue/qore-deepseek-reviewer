# DeepSeek compact reviewer — token preflight v2.2

## Trigger

QORE Expert R66 was mechanically consumed on Core PR #461. Exact live binding,
Core checkout and synthetic-parent verification succeeded, but the reviewer
failed before the final DeepSeek call and therefore published no semantic
review.

The failing preflight combined exact cumulative API prompt usage with the UTF-8
byte size of the next JSON request as though every request byte were one prompt
token. On R66 the final gate saw:

- exact prompt tokens already consumed: `42204`;
- serialized-request byte proxy: `59265`;
- protocol reserve: `8192`;
- resulting byte-proxy projection: `109661`;
- hard cumulative prompt-token ceiling: `100000`.

The five successful exploration calls had already returned exact model prompt
usage. The fifth call alone reported `13926` prompt tokens for a request whose
old UTF-8 proxy was about 50k bytes, demonstrating that byte count was not a
useful same-unit estimate for the subsequent hard preflight.

R66 is therefore `MECHANICAL REVIEW FAILURE / CONSUMED`; it is not a semantic
approval or a Core defect.

## Correction

`scripts/deepseek_reviewer_compact_budgeted_v2.py` preserves the existing
compact reviewer and changes only reviewer-side admission/evidence mechanics:

1. The first request retains the original one-byte/one-token conservative
   admission rule because no model-specific usage evidence exists yet.
2. After each successful DeepSeek call, the wrapper records exact
   `prompt_tokens / serialized_request_bytes` density from API usage.
3. Later preflights use the highest observed density multiplied by a `2.50`
   safety factor, never below `0.50` prompt tokens per request byte, capped at
   the original `1.0` worst case.
4. The existing `8192` protocol reserve is retained.
5. The preferred `80000` target remains advisory.
6. The exact cumulative API prompt usage is still checked after every call and
   the `100000` hard ceiling remains authoritative.
7. Request-byte measurement now matches the real `json.dumps(...).encode()`
   serialization used by the API caller, including ASCII escaping.

This avoids treating byte count as token count after exact same-model evidence
exists, while remaining fail-closed on the first request and retaining a large
calibration margin plus protocol reserve.

## R62 executable-evidence repair

R66 also exposed a second mechanical mismatch before any semantic verdict could
be accepted: its mandatory attacks require the exact current R62 scanner, but
`scanner_probe` exposed only `r60`, `r61` and `final_owner`.

The v2 wrapper adds:

- scanner selector `r62`;
- module `test_universal_cross_asset_conformance_final_owner_r62_guards`;
- function `_r62_dynamic_execution_markers_from_source`;
- updated tool schema/description.

The probe remains read-only: supplied adversarial source is passed to the
static scanner and is not executed.

## Boundary

This repair changes only `mezas3238-hue/qore-deepseek-reviewer`. It does not
modify QORE Core, D04 owners, runtime behavior, provider readiness, execution
authority, Production readiness or real-capital authorization.

A fresh package is required after this repair. R66 must not be rerun or reused.

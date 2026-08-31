# QORE Core PR #466 — DeepSeek Expert R9 — multi-authority URL-userinfo closure

Review only the exact frozen QORE Core candidate below. This is an independent adversarial semantic review. Do not modify QORE Core and do not infer PASS from CI.

## Exact freeze
- PR: `466`
- BASE: `5a158ef0fb2e21db95f2be0685373780bf1ab197`
- HEAD: `4ccb42efdda62e9b5070a805c45c4c602b6e953c`
- TREE: `5cfa0f7060172943c52b9602c1b5120ec9877e69`
- SYNTHETIC: `eff08767840a2ecaa492c58830f3c51636978f67`
- synthetic parents: BASE then HEAD
- synthetic tree: identical to HEAD tree
- synthetic signature: GitHub verified / valid
- commits ahead / behind: `38 / 0`
- changed files: `8`
- cumulative diff: `+1708 / -71`

## Authoritative mechanical QG
- run: `33443877562`
- job: `99658290366`
- Ruff: PASS — `All checks passed!`
- Mypy: PASS — `745 source files`
- Pytest: `4976 collected / 4976 passed / 7 warnings`
- Coverage: `47642 statements / 6236 missed / 87%`
- `instrument_universe_registry.py`: `282 statements / 2 missed / 99%`
- CI checkout: exact synthetic `eff08767840a2ecaa492c58830f3c51636978f67`

<!-- QORE-EXACT-QG {"coverage_missed_statements":6236,"coverage_percent":87,"coverage_total_statements":47642,"job_id":99658290366,"mypy_source_files":745,"pytest_collected":4976,"pytest_passed":4976,"pytest_warnings":7,"ruff_passed":true,"run_id":33443877562} -->

## Immediate prior finding and correction
Expert R8 on obsolete HEAD `9300bd9efebe053d04412e759d044711ecba81dd` found one material URL-userinfo iteration defect. `_contains_url_userinfo` inspected only the first URL authority, so a benign first URL could mask a later credential-bearing authority. Exact witness:

`https://safe.example/https://alice:password@example.invalid/evidence`

The finding was independently reproduced against the exact R8 code and adjudicated MATERIAL VALID. DeepSeek Coder was therefore not launched.

This candidate replaces the first-authority-only parser with bounded detection over the credential-detection skeleton:

`(?:[a-z][a-z0-9+.-]*://|(?<![a-z0-9/])//)[^/?#\s]*@`

The intent is to reject credential-bearing URL authorities wherever an actual URL-like authority start occurs, while preserving benign nested-path double slashes, email prose, and multiple safe URLs. Original retained/projected text is not rewritten; normalization remains detection-only.

Permanent regressions cover:
- exact R8 later embedded `scheme://userinfo@authority` witness;
- embedded scheme-relative `//userinfo@authority` at a token boundary;
- reason construction;
- reflective retained-state corruption;
- explicit `__post_init__()` re-entry;
- `logical_values()` projection;
- evidence `source_name` and `locator` construction;
- evidence retained-state re-entry, `content_logical_values()` and full `logical_values()`;
- benign URL-like text without userinfo.

## Mandatory adversarial foci
1. Reproduce/falsify the exact R8 witness at construction, `__post_init__`, logical projection and retained-state re-entry.
2. Probe multiple authorities in one string: credential-bearing second/third authorities after benign URLs; mixed normal and scheme-relative forms; query/fragment boundaries; whitespace/token boundaries.
3. Verify scheme-relative handling does not treat ordinary path-internal `//` as an authority start. Include benign nested paths, email prose and multiple safe URLs.
4. Recheck URL scheme casefold/NFKC behavior and bounded delimiter folding. Report only reproducible in-scope defects; do not demand a generic URL parser or unbounded Unicode transliteration without a concrete witness.
5. Re-falsify prior accepted credential witnesses: spaced assignments, multiple separators, NBSP/zero-width forms, fullwidth `=`/`@`, variation selectors, ordinary and scheme-relative URL userinfo, bearer assignment, U+2015 HORIZONTAL BAR, U+02D0 colon.
6. Recheck bounded Greek/Cyrillic/Latin label homoglyphs, including sigma/final sigma, Cyrillic ze, Greek eta, Cyrillic ghe and the R7 Cyrillic `и`→ASCII `u` authorization witnesses with both `=` and `:`.
7. Recheck false-positive containment: legitimate printable Unicode prose and benign URL-like text remain accepted and projected byte-for-byte unchanged.
8. Verify recursive retained-state revalidation for reason/source_name/locator/evidence/entry/snapshot/lookup paths and canonical local `StrEnum` state.
9. Verify exact runtime types, deterministic tuple shapes/order, no subclass laundering, and fail-closed behavior under reflective corruption.
10. Verify provider-neutrality and absence of OpenAI/DeepSeek/Anthropic/Claude/Codex/reviewer dependencies in QORE Core.
11. Confirm no execution authority, Risk bypass, Production authority, productive credentials, real-capital authority, deposits/withdrawals or real-money execution capability is introduced.

## Required verdict discipline
- Review this exact HEAD only.
- Report only reproducible material defects tied to this exact candidate.
- For each finding provide exact location, constructible witness, expected behavior, actual behavior, violated invariant, impact and minimal safe correction.
- Distinguish material defect from evidence insufficiency or tooling failure.
- If no material defect remains and evidence is sufficient, state `VALIDACIÓN OK` / no material findings.
- If evidence is insufficient, do not call it PASS.
- Any change to BASE/HEAD/SYNTHETIC/QG invalidates this review.
- DeepSeek Coder remains blocked until this Expert result is independently adjudicated CLEAN.
- Do not authorize Production, productive credentials, real capital, deposits/withdrawals or real-money execution.

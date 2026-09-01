# QORE Core PR #466 — DeepSeek Expert R12 — printable invisible-filler credential closure

Review only the exact frozen QORE Core candidate below. This is an independent adversarial semantic review. Do not modify QORE Core and do not infer PASS from CI.

## Exact freeze
- PR: `466`
- BASE: `5a158ef0fb2e21db95f2be0685373780bf1ab197`
- HEAD: `6373b339ca5251cb5bdfe6eba8abc73ae707aa87`
- TREE: `d46b8303859755ef13ba62a38ed29af125c9bbad`
- SYNTHETIC: `dafd2d7db904ed4838ce510361604fcf29e3f3f7`
- synthetic parents: BASE then HEAD
- synthetic tree: identical to HEAD tree
- synthetic signature: GitHub verified / valid
- commits ahead / behind: `56 / 0`
- changed files: `11`
- cumulative diff: `+2049 / -71`

Changed files are exactly:
1. `docs/architecture/QORE-UMI-13-CREDENTIAL-INVISIBLE-FILLER-CLOSURE-001.md`
2. `docs/architecture/QORE-UMI-13-RECURSIVE-REGISTRY-REVALIDATION-001.md`
3. `docs/audits/UMI14-UMI13-INVISIBLE-FILLER-FOLLOWUP.md`
4. `docs/audits/UMI14-UMI13-UNICODE-CONFUSABLE-FOLLOWUP.md`
5. `src/qore/infrastructure/instrument_universe_registry.py`
6. `tests/infrastructure/test_instrument_universe_registry_credential_variants.py`
7. `tests/infrastructure/test_instrument_universe_registry_invisible_fillers.py`
8. `tests/infrastructure/test_instrument_universe_registry_multi_authority_userinfo.py`
9. `tests/infrastructure/test_instrument_universe_registry_recursive_revalidation.py`
10. `tests/infrastructure/test_instrument_universe_registry_unicode_confusables.py`
11. `tests/infrastructure/test_instrument_universe_registry_unicode_confusables_followup.py`

## Authoritative mechanical FULL QG
- run: `33454502711`
- job: `99691460467`
- CI checkout: exact synthetic `dafd2d7db904ed4838ce510361604fcf29e3f3f7`
- Ruff: PASS — `All checks passed!`
- Mypy: PASS — `746 source files`
- Pytest: `5066 collected / 5066 passed / 7 warnings`
- runtime: `619.62s (0:10:19)`
- Coverage: `47659 statements / 6236 missed / 87%`
- `instrument_universe_registry.py`: `299 statements / 2 missed / 99%`

<!-- QORE-EXACT-QG {"coverage_missed_statements":6236,"coverage_percent":87,"coverage_total_statements":47659,"job_id":99691460467,"mypy_source_files":746,"pytest_collected":5066,"pytest_passed":5066,"pytest_warnings":7,"ruff_passed":true,"run_id":33454502711} -->

CI success is mechanical evidence only, never semantic PASS.

## Immediate prior Expert R11 finding and IA adjudication
Expert R11 on obsolete HEAD `b9a1e24a9cc752a230d23adc6ced490f76c29994` returned `VALIDACIÓN NO OK` for this exact accepted witness:

`tok\u3164en=PLAINTEXT-SECRET`

`U+3164 HANGUL FILLER` is printable and Unicode category `Lo`; NFKC maps it to `U+1160 HANGUL JUNGSEONG FILLER`, also `Lo`. The old detection skeleton removed only mark categories `Mn/Mc/Me`, so the normalized filler remained between the ASCII letters of `token`, defeating both the contiguous sensitive-assignment regex and the bounded character matcher. The finding was independently reproduced and adjudicated **MATERIAL VALID**. DeepSeek Coder was not launched.

Integration Authority bounded the immediate same class to these printable source forms:
- U+115F HANGUL CHOSEONG FILLER
- U+1160 HANGUL JUNGSEONG FILLER
- U+3164 HANGUL FILLER (NFKC -> U+1160)
- U+FFA0 HALFWIDTH HANGUL FILLER (NFKC -> U+1160)
- U+2800 BRAILLE PATTERN BLANK

The corrected detection-only skeleton removes the normalized set U+115F, U+1160 and U+2800 after NFKC/casefold, in addition to the existing mark removal. Original retained/projected text is never rewritten. The rule is deliberately bounded; it is not generic Unicode transliteration and does not discard arbitrary visible characters because their Unicode names contain `FILLER`, `BLANK`, `GAP`, etc.

Permanent regressions cover construction, compound sensitive labels, reflective corruption, `__post_init__()` re-entry, reason/evidence logical projections and benign byte-for-byte retention outside credential-like syntax.

The first QG after the semantic correction failed Ruff only for a missing EOF newline and one import-block formatting issue; Mypy/Pytest were skipped. A style-only follow-up produced current HEAD `6373b339...`; the authoritative FULL QG above is the fresh all-green gate on this exact current synthetic.

## Mandatory adversarial foci
1. Reproduce/falsify the exact R11 witness `tok\u3164en=PLAINTEXT-SECRET` at construction, retained-state corruption, explicit `__post_init__()` re-entry and logical projection.
2. Independently test all immediate source forms U+115F, U+1160, U+3164, U+FFA0 and U+2800, including NFKC/casefold behavior and the normalized removal set.
3. Probe filler insertion at every position of every supported sensitive family: authorization, bearer, credential, jwt, password, secret, token, api key, access token, client secret, private key.
4. Probe multiple fillers, mixed filler types, repeated fillers, filler + ASCII separator combinations, filler + zero-width/NBSP/marks/variation selectors, and filler around `=` / `:` including prior delimiter confusables.
5. Verify boundedness: benign printable filler text outside credential-like syntax remains accepted and projected byte-for-byte unchanged; do not require blanket deletion/rejection of arbitrary printable Unicode.
6. Re-falsify prior credential-hygiene closures: spaced assignment, repeated separators, NBSP/zero-width, fullwidth `=`, variation selectors, bearer assignment, U+2015 horizontal bar, U+02D0 colon, bounded cross-script label homoglyphs including sigma/final sigma, Cyrillic ze, Greek eta, Cyrillic ghe and Cyrillic `и` -> ASCII `u` authorization.
7. Re-falsify R8/R9/R10 URL-userinfo closures: later second/third authorities, scheme-relative starts, ASCII/`∕`/`⁄`/fullwidth-slash combinations, exact R10 fullwidth-solidus witness, NFKC-created `/ ? # whitespace` terminators, fullwidth `@`, and real ASCII authority terminators as false-positive containment.
8. Verify reason/source_name/locator/evidence/entry/snapshot/lookup recursive retained-state revalidation and all logical projections remain fail-closed after reflective mutation.
9. Verify canonical local `StrEnum` retained state, exact runtime types, deterministic ordering/canonicalization, `bool != int`, no subclass laundering, and no mutation of valid retained data.
10. Verify provider-neutrality and absence of reviewer/AI-provider dependencies in QORE Core.
11. Confirm no hidden retry/sleep/scheduler/thread effect, automatic corrective trading, Risk bypass, provider operational authority, Production authority, productive credentials, deposits/withdrawals, or real-capital execution authority is introduced.

## Required verdict discipline
- Review this exact HEAD/freeze only.
- Report only reproducible material defects tied to this exact candidate.
- For each finding provide exact location, constructible witness, expected behavior, actual behavior, violated invariant, impact and minimal safe correction.
- Distinguish material defect from evidence insufficiency or tooling failure.
- If no material defect remains and evidence is sufficient, state `VALIDACIÓN OK` / no material findings.
- If evidence is insufficient, do not call it PASS.
- Any change to BASE/HEAD/TREE/SYNTHETIC/QG invalidates this review.
- DeepSeek Coder remains blocked until this Expert result is independently adjudicated CLEAN.
- Do not authorize Production, productive credentials, real capital, deposits/withdrawals or real-money execution.

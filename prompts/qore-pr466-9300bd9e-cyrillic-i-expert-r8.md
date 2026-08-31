# QORE Core PR #466 — DeepSeek Expert R8 — Cyrillic-и authorization closure

Review only the exact frozen QORE Core candidate below. This is an independent adversarial semantic review. Do not modify QORE Core and do not infer PASS from CI.

## Exact freeze
- PR: `466`
- BASE: `5a158ef0fb2e21db95f2be0685373780bf1ab197`
- HEAD: `9300bd9efebe053d04412e759d044711ecba81dd`
- TREE: `295f85a1adc1f964083febc897be21ce695cffb0`
- SYNTHETIC: `a2497648a1ed75a4aec5cb8d3959d01a1f782a64`
- synthetic parents: BASE then HEAD
- synthetic tree: identical to HEAD tree
- synthetic signature: GitHub verified / valid
- commits ahead / behind: 30 / 0
- changed files: 7
- cumulative diff: +1556 / -69

## Authoritative mechanical QG
- run: `33439224197`
- job: `99643062426`
- Ruff: PASS — `All checks passed!`
- Mypy: PASS — 744 source files
- Pytest: 4965 collected / 4965 passed / 7 warnings
- Coverage: 47650 statements / 6236 missed / 87%
- instrument registry: 290 statements / 2 missed / 99%

<!-- QORE-EXACT-QG {"coverage_missed_statements":6236,"coverage_percent":87,"coverage_total_statements":47650,"job_id":99643062426,"mypy_source_files":744,"pytest_collected":4965,"pytest_passed":4965,"pytest_warnings":7,"ruff_passed":true,"run_id":33439224197} -->

## Immediate prior finding and correction
Expert R7 on obsolete HEAD `f0e2b4f31f1e3802f0e108f605936433f556b8d2` found one material bounded label-homoglyph gap: Cyrillic small letter i `и` (`U+0438`) was not accepted as the bounded ASCII `u` confusable, so the supported label `authorization` could be disguised as `a\u0438thorization=PLAINTEXT-SECRET` or `a\u0438thorization:PLAINTEXT-SECRET`. The finding was independently reproduced and adjudicated MATERIAL VALID.

This exact candidate adds only `("u", "и")` to `_CREDENTIAL_CONFUSABLE_PAIRS`, plus permanent constructor and retained-state regression witnesses for both `=` and `:` forms. The retained-state parametrization exercises explicit `__post_init__()` re-entry and `logical_values()` projection. Original valid text remains unchanged; normalization/folding is detection-only.

## Relevant closed adversarial history
Prior accepted gaps already corrected and regression-tested include spaced assignments; scheme-relative URL userinfo; multiple composite-name separators; NBSP/zero-width forms; fullwidth `=` / `@`; variation selectors; Greek/Cyrillic/Latin label homoglyphs including Cyrillic e, Greek omicron, Cyrillic dze, sigma/final sigma, Cyrillic ze, Greek eta and Cyrillic ghe; `bearer=...`; U+2015 HORIZONTAL BAR; ratio/colon confusables; and U+02D0 MODIFIER LETTER TRIANGULAR COLON.

## Mandatory adversarial foci
1. Reproduce/falsify the exact R7 `a\u0438thorization` witnesses at construction, explicit `__post_init__`, logical projection and retained-state re-entry.
2. Recheck all supported sensitive labels: authorization, bearer, credential, jwt, password, secret, token, api key, access token, client secret, private key.
3. Recheck bounded Greek/Cyrillic/Latin label homoglyph matching for materially obvious in-scope omissions, including mixed substitutions and first/middle/last positions. Do not demand generic/unbounded transliteration absent a reproducible defect.
4. Recheck assignment/punctuation separators (`=`, `:`, composite hyphen/space/underscore, slash/userinfo), including previously closed fullwidth/ratio/U+2015/U+02D0 cases.
5. Re-falsify prior accepted witnesses: NBSP/ZWSP, fullwidth `=`/`@`, variation selectors, scheme-relative/ordinary URL userinfo, multi-separator names and bearer assignment.
6. Verify false-positive containment: legitimate printable Unicode prose unrelated to credential syntax remains accepted and projected byte-for-byte unchanged.
7. Verify recursive retained-state revalidation for wrappers, evidence refs/records, entries, snapshots, lookup/re-entry paths, reason/source_name/locator projections and local `StrEnum` canonical state.
8. Verify exact runtime types, deterministic tuple shapes/order, immutable retained state, provider-neutrality and absence of AI/reviewer dependencies.
9. Confirm no execution authority, Risk bypass, Production authority, productive credentials, real-capital authority or real-money execution capability is introduced.

## Required verdict discipline
- Report only reproducible material defects tied to this exact HEAD.
- For each finding provide exact location, constructible witness, expected behavior, actual behavior, violated invariant, impact and minimal safe correction.
- Distinguish material defect from evidence insufficiency or tooling failure.
- If no material defect remains and evidence is sufficient, state `VALIDACIÓN OK` / no material findings.
- If evidence is insufficient, do not call it PASS.
- Any change to BASE/HEAD/SYNTHETIC/QG invalidates this review.
- DeepSeek Coder remains blocked until this Expert result is independently adjudicated.
- Do not authorize Production, productive credentials, real capital, deposits/withdrawals or real-money execution.

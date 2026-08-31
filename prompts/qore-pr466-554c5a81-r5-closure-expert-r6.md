# QORE Core PR #466 — DeepSeek Expert R6 — R5 confusable closure

Review only the exact frozen QORE Core candidate below. This is an independent adversarial semantic review. Do not modify QORE Core and do not infer PASS from CI.

## Exact freeze
- PR: `466`
- BASE: `5a158ef0fb2e21db95f2be0685373780bf1ab197`
- HEAD: `554c5a81d089a6054c6f878ec4016946166af41f`
- TREE: `aca0a8b55aa2214622cca8fe591f3a8fb07827ad`
- SYNTHETIC: `6e68f7666aa7b442d01da36e899ca00537c13e39`
- synthetic parents: BASE then HEAD
- synthetic tree: identical to HEAD tree
- synthetic signature: GitHub verified / valid

## Authoritative mechanical QG
- run: `33430733032`
- job: `99615169364`
- Ruff: PASS
- Mypy: PASS — 744 source files
- Pytest: 4959 collected / 4959 passed / 7 warnings
- Coverage: 47650 statements / 6236 missed / 87%
- instrument registry: 290 statements / 2 missed / 99%

<!-- QORE-EXACT-QG {"coverage_missed_statements":6236,"coverage_percent":87,"coverage_total_statements":47650,"job_id":99615169364,"mypy_source_files":744,"pytest_collected":4959,"pytest_passed":4959,"pytest_warnings":7,"ruff_passed":true,"run_id":33430733032} -->

## Immediate prior findings and corrections
Expert R5 on obsolete HEAD `0a6a6ce6145983f93dbe83a9776c2d38757dc670` found two material bounded-confusable gaps. Both were independently reproduced and accepted:

1. `U+2015 HORIZONTAL BAR` could separate a composite sensitive label, e.g. `api\u2015key=PLAINTEXT-SECRET`, because it was not folded to ASCII `-` for detection.
2. Cyrillic small ghe `г` (`U+0433`) could replace ASCII `r` in supported sensitive labels, e.g. `autho\u0433ization=PLAINTEXT-SECRET`.

This candidate adds only the bounded detection mappings required to close those findings:
- `U+2015` → `-` in the detection-only delimiter table;
- `("r", "г")` in the bounded character-homoglyph table.

Permanent regression witnesses cover constructor rejection and retained-state `__post_init__` / `logical_values()` revalidation for `api\u2015key`, `private\u2015key`, `autho\u0433ization`, and `bea\u0433er`. Original retained/projected text remains unchanged for valid inputs.

## Mandatory adversarial foci
1. Reproduce/falsify the exact R5 witnesses at construction, retained-state `__post_init__`, and logical projection.
2. Recheck every currently supported sensitive label: authorization, bearer, credential, jwt, password, secret, token, api key, access token, client secret, private key.
3. Adversarially inspect the bounded Greek/Cyrillic/Latin homoglyph table and bounded delimiter table for materially obvious omissions within the explicitly claimed bounded class. Do not demand generic/unbounded Unicode transliteration or a universal UTS#39 implementation unless a reproducible in-scope defect requires it.
4. Re-falsify prior accepted witnesses: Cyrillic e, Greek omicron, Cyrillic dze, Greek sigma/final sigma, Cyrillic ze, Greek eta, NBSP/ZWSP, fullwidth `=`/`@`, variation selectors, confusable colon/hyphen families, multiple credential-name separators, bearer assignment, ordinary and scheme-relative URL userinfo.
5. Test mixed substitutions, first/middle/last characters, uppercase/casefold behavior, spaces/underscore/hyphen composite separators, and `=` / `:` delimiters.
6. Verify false-positive containment: legitimate printable Greek/Cyrillic prose unrelated to credential syntax remains accepted and byte-for-byte unchanged in logical projection.
7. Verify recursive retained-state revalidation for reason/source_name/locator/evidence/entry/snapshot/lookup paths and local `StrEnum` canonical state.
8. Verify exact runtime types, deterministic tuple shapes/order, provider-neutrality and absence of AI/reviewer dependencies.
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

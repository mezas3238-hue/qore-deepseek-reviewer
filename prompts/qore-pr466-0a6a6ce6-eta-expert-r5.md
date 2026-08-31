# QORE Core PR #466 — DeepSeek Expert R5 — eta/confusable closure

Review only the exact frozen QORE Core candidate below. This is an independent adversarial semantic review. Do not modify QORE Core and do not infer PASS from CI.

## Exact freeze
- PR: `466`
- BASE: `5a158ef0fb2e21db95f2be0685373780bf1ab197`
- HEAD: `0a6a6ce6145983f93dbe83a9776c2d38757dc670`
- TREE: `61304388f1f567e1e49c3c7f585d3d6d52b9bc85`
- SYNTHETIC: `cb82f09f1e91c1ce7457472bb2c35917ccbaf177`
- synthetic parents: BASE then HEAD
- synthetic tree: identical to HEAD tree
- synthetic signature: GitHub verified / valid

## Authoritative mechanical QG
- run: `33427826605`
- job: `99605625179`
- Ruff: PASS
- Mypy: PASS — 744 source files
- Pytest: 4951 collected / 4951 passed / 7 warnings
- Coverage: 47650 statements / 6236 missed / 87%
- instrument registry: 290 statements / 2 missed / 99%

<!-- QORE-EXACT-QG {"coverage_missed_statements":6236,"coverage_percent":87,"coverage_total_statements":47650,"job_id":99605625179,"mypy_source_files":744,"pytest_collected":4951,"pytest_passed":4951,"pytest_warnings":7,"ruff_passed":true,"run_id":33427826605} -->

## Immediate prior finding and correction
Expert R4B on obsolete HEAD `d540b5be87985f21de5088af66bb178d1716110a` found one material bounded-confusable gap: Greek eta `η` U+03B7 was not treated as ASCII `n`, allowing witnesses such as `toke\u03b7=PLAINTEXT-SECRET` and retained-state re-entry of the same value. That finding was independently reproduced and accepted.

This candidate adds Greek eta only to the existing bounded `n` homoglyph family and adds constructor/revalidation regression witnesses including `toke\u03b7=...` and `authorizatio\u03b7=...`. Original retained/projected text remains unchanged; the mapping is detection-only.

## Mandatory adversarial foci
1. Reproduce/falsify the exact R4B eta witnesses at construction, `__post_init__`, logical projection and retained-state re-entry.
2. Recheck every currently supported sensitive label: authorization, bearer, credential, jwt, password, secret, token, api key, access token, client secret, private key.
3. Adversarially inspect the bounded Greek/Cyrillic/Latin homoglyph table for materially obvious omissions within the explicitly claimed bounded class. Do not demand generic/unbounded Unicode transliteration or a universal UTS#39 implementation unless a reproducible in-scope defect requires it.
4. Re-falsify prior accepted witnesses: Cyrillic e, Greek omicron, Cyrillic dze, Greek sigma/final sigma, Cyrillic ze, NBSP/ZWSP, fullwidth `=`/`@`, variation selectors, confusable colon/hyphen, multiple credential-name separators, bearer assignment, ordinary and scheme-relative URL userinfo.
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

# QORE Core PR #466 — DeepSeek Expert R13 — canonical decomposition credential closure

Review only the exact frozen QORE Core candidate below. This is an independent adversarial semantic review. Do not modify QORE Core and do not infer PASS from green CI.

## Exact freeze
- PR: `466`
- BASE: `5a158ef0fb2e21db95f2be0685373780bf1ab197`
- HEAD: `7f4f3c7138b04ec26c7d4b2c448046dd5b2a164f`
- TREE: `29ebc17be4ad3f85bd5064c70a482528133370cc`
- SYNTHETIC: `02b1ec1f851289d54e911e8a008a9d54494d1648`
- synthetic parents: BASE then HEAD
- synthetic tree: identical to HEAD tree
- synthetic signature: GitHub verified / valid
- commits ahead / behind: `60 / 0`
- changed files: `11`
- cumulative diff: `+2168 / -71`

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
- run: `33457065357`
- job: `99699183309`
- CI checkout: exact synthetic `02b1ec1f851289d54e911e8a008a9d54494d1648`
- Ruff: PASS — `All checks passed!`
- Mypy: PASS — `746 source files`
- Pytest: `5082 collected / 5082 passed / 7 warnings`
- runtime: `600.44s (0:10:00)`
- Coverage: `47659 statements / 6236 missed / 87%`
- `instrument_universe_registry.py`: `299 statements / 2 missed / 99%`

<!-- QORE-EXACT-QG {"coverage_missed_statements":6236,"coverage_percent":87,"coverage_total_statements":47659,"job_id":99699183309,"mypy_source_files":746,"pytest_collected":5082,"pytest_passed":5082,"pytest_warnings":7,"ruff_passed":true,"run_id":33457065357} -->

CI success is mechanical evidence only, never semantic PASS.

## Immediate prior Expert R12 finding and IA adjudication
Expert R12 on obsolete HEAD `6373b339ca5251cb5bdfe6eba8abc73ae707aa87` returned `VALIDACIÓN NO OK` for this exact witness:

`token\u0301=PLAINTEXT-SECRET`

`U+0301 COMBINING ACUTE ACCENT` is a printable `Mn` mark. The obsolete detector applied NFKC before filtering marks, so `n + U+0301` composed to precomposed `ń` (`U+0144`, category `Ll`). The subsequent `Mn/Mc/Me` filter could no longer observe the mark; the detection skeleton became `tokeń=...` and missed the supported sensitive label `token`.

Integration Authority independently reproduced the normalization behavior and adjudicated the finding **MATERIAL VALID**. DeepSeek Coder was not launched.

The corrected detection-only path now performs canonical decomposition after compatibility normalization/casefold and before mark/invisible-filler filtering:

```python
normalized = normalize(
    "NFD",
    normalize("NFKC", normalization_source).casefold(),
)
```

The original retained/projected source string remains intact. Permanent regression coverage includes U+0301, U+0308 and U+0327; both `=` and `:`; constructor, retained-state `__post_init__()` re-entry, reason/evidence logical projections, evidence `source_name` and `locator`, and benign decomposed Unicode that must remain byte-for-byte unchanged.

## Mandatory adversarial foci
1. Reproduce/falsify the exact R12 witness at construction, reflective retained-state corruption, explicit `__post_init__()` re-entry and logical projection.
2. Probe multiple printable combining marks (`Mn`, `Mc`, `Me`) that can compose with Latin characters after compatibility normalization; insert them at every position of supported sensitive families: authorization, bearer, credential, jwt, password, secret, token, api key, access token, client secret, private key.
3. Probe marks immediately before/after `=` and `:`, repeated marks, mixed marks, and combinations of mark + invisible filler + ASCII separator + bounded cross-script homoglyph + delimiter confusable.
4. Verify the NFD-after-NFKC/casefold path does not weaken the dedicated URL-userinfo detection or alter the detection-only sentinels protecting NFKC-created `/`, `?`, `#` and whitespace terminators.
5. Re-falsify the R11 printable invisible-filler source forms U+115F, U+1160, U+3164, U+FFA0 and U+2800, including compound labels and retained-state projection.
6. Re-falsify prior credential-hygiene closures: spaced assignments, repeated separators, NBSP/zero-width, fullwidth `=` / `@`, variation selectors, bearer assignment, U+2015 horizontal bar, U+02D0 colon, and bounded Greek/Cyrillic/Latin label homoglyphs including sigma/final sigma, Cyrillic ze, Greek eta, Cyrillic ghe and Cyrillic `и` used as ASCII `u`.
7. Re-falsify R8/R9/R10 URL-userinfo closures: second/third authorities, scheme-relative starts, ASCII/`∕`/`⁄`/fullwidth slash combinations, exact R10 fullwidth-solidus witness, NFKC-created `/ ? # whitespace` terminators, fullwidth `@`, and false-positive containment when real authority terminators occur before `@`.
8. Verify boundedness: legitimate printable/decomposed accented Unicode outside credential-like syntax remains accepted and projected byte-for-byte unchanged. Do not require rewriting valid retained text.
9. Verify recursive retained-state validation for reason/source_name/locator/evidence/entry/snapshot/lookup and all logical projections; canonical local `StrEnum` state; exact runtime types; deterministic ordering/canonicalization; `bool != int`; no subclass laundering.
10. Verify provider-neutrality and absence of reviewer/AI-provider dependencies in QORE Core.
11. Confirm no hidden retry/sleep/scheduler/thread semantic effect, automatic corrective trading, Risk bypass, provider operational authority, Production authority, productive credentials, deposits/withdrawals, or real-capital execution authority is introduced.

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
# QORE Core PR #466 — DeepSeek Expert R15 — corrected Unicode separator closure

Review only the exact frozen QORE Core candidate below. This is an independent adversarial semantic review. Do not modify QORE Core and do not infer semantic PASS from green CI or from prior reviews.

## Exact freeze
- PR: `466`
- BASE: `5a158ef0fb2e21db95f2be0685373780bf1ab197`
- HEAD: `a872d12db02690b25fb5b66f4f116baa2ad0085e`
- TREE: `3cf47539f28bd2bf87126a8e1d161462af53e3e9`
- SYNTHETIC: `935c086bcffbfe9f2d8f63a0f968aa7e2f02d393`
- synthetic parents: BASE then HEAD
- synthetic tree: identical to HEAD tree
- synthetic signature: GitHub verified / valid
- changed files: `14`
- cumulative diff: `+2338 / -71`

## Authoritative FULL QG
- run: `33463612935`
- job: `99718811673`
- CI checkout: exact synthetic `935c086bcffbfe9f2d8f63a0f968aa7e2f02d393`
- Ruff: PASS — `All checks passed!`
- Mypy: PASS — `747 source files`
- Pytest: `5091 collected / 5091 passed / 7 warnings`
- Coverage: `47659 statements / 6236 missed / 87%`
- `instrument_universe_registry.py`: `299 statements / 2 missed / 99%`

<!-- QORE-EXACT-QG {"coverage_missed_statements":6236,"coverage_percent":87,"coverage_total_statements":47659,"job_id":99718811673,"mypy_source_files":747,"pytest_collected":5091,"pytest_passed":5091,"pytest_warnings":7,"ruff_passed":true,"run_id":33463612935} -->

CI success is mechanical evidence only.

## Immediate prior Coder R14B finding and correction
Coder R14B on obsolete HEAD `7f4f3c7138b04ec26c7d4b2c448046dd5b2a164f` found one reproducible bounded Unicode separator variant missing from `_CREDENTIAL_DELIMITER_CONFUSABLES` for supported composite sensitive labels. Integration Authority independently reproduced and adjudicated the finding MATERIAL VALID.

The same Core branch now adds the missing `U+2E17 DOUBLE OBLIQUE HYPHEN` mapping to ASCII `-` for detection only, plus permanent regression tests for `api key` / `private key`, both assignment delimiters, constructor, retained-state re-entry, reason/evidence projections, and benign source-text preservation. The original valid retained/projected text is not rewritten.

Because Core changed, all earlier semantic PASS results are obsolete for certification. This R15 review is the required fresh Expert stage.

## Mandatory adversarial foci
1. Independently verify the R14B separator correction closes the exact defect class in construction, `__post_init__()` re-entry, and logical projections without modifying retained valid text.
2. Audit the bounded hyphen-family delimiter table for nearby printable separator variants that are materially equivalent within the already-declared composite-label contract; report only reproducible bounded defects, not demands for universal Unicode transliteration.
3. Re-falsify the existing credential-detection pipeline ordering: `NFKC -> casefold -> NFD -> mark/filler filtering -> bounded delimiter canonicalization`.
4. Verify prior combining-mark and invisible-filler closures remain intact after the new mapping.
5. Verify URL-userinfo detection remains independent of the generic delimiter path and that R8/R9/R10 authority handling is not weakened.
6. Verify recursive retained-state revalidation reaches reason/source_name/locator/evidence/entry/snapshot/lookup and logical projections.
7. Verify local `StrEnum` canonical identity/name/value revalidation, imported `IdentityFamilyCode`, exact runtime types, deterministic ordering, `bool != int`, and no subclass laundering.
8. Check false-positive containment: benign printable Unicode text outside credential-like syntax remains accepted and projected byte-for-byte unchanged.
9. Verify provider-neutrality and no reviewer/AI-provider dependency in QORE Core.
10. Confirm no hidden retry/sleep/scheduler/thread semantic effect, automatic corrective trading, Risk bypass, provider operational authority, Production authority, productive credentials, deposits/withdrawals, or real-capital execution authority is introduced.

## Verdict discipline
- Review this exact freeze only.
- Report only reproducible material defects tied to this candidate.
- For each finding provide exact location, constructible witness, expected behavior, actual behavior, violated invariant, impact, and minimal safe correction.
- Evidence/tooling insufficiency is not PASS.
- If no material defect remains and evidence is sufficient, state `VALIDACIÓN OK` / no material findings.
- Any Core change invalidates this review.
- Do not authorize Production or real capital.

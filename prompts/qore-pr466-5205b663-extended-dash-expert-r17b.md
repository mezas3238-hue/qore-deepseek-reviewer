# QORE Core PR #466 — DeepSeek Expert R17B — corrected extended dash closure

Review only the exact frozen QORE Core candidate below. This is an independent adversarial semantic review. Do not modify QORE Core and do not infer semantic PASS from green CI or prior reviews.

## Exact freeze
- PR: `466`
- BASE: `5a158ef0fb2e21db95f2be0685373780bf1ab197`
- HEAD: `5205b663579e35a711446da03a483c57ea786476`
- TREE: `0a949120777c43362620fc4d5f047b1d9f5d2d0f`
- SYNTHETIC: `ab8016632ca3c449c1c702e378bff95e7f2ea5ae`
- synthetic parents: BASE then HEAD
- synthetic tree: identical to HEAD tree
- synthetic signature: GitHub verified / valid
- changed files: `20`
- cumulative diff: `+2668 / -71`

## Authoritative FULL QG
- run: `33482174441`
- job: `99774025076`
- CI checkout: exact synthetic `ab8016632ca3c449c1c702e378bff95e7f2ea5ae`
- Ruff: PASS — `All checks passed!`
- Mypy: PASS — `749 source files`
- Pytest: `5118 collected / 5118 passed / 7 warnings`
- Coverage: `47659 statements / 6236 missed / 87%`
- `instrument_universe_registry.py`: `299 statements / 2 missed / 99%`

<!-- QORE-EXACT-QG {"coverage_missed_statements":6236,"coverage_percent":87,"coverage_total_statements":47659,"job_id":99774025076,"mypy_source_files":749,"pytest_collected":5118,"pytest_passed":5118,"pytest_warnings":7,"ruff_passed":true,"run_id":33482174441} -->

CI success is mechanical evidence only.

## Why R17B exists
The prior fresh package `QORE-PR466-5205B663-DS-EXPERT-EXTENDED-DASH-R17` validated the exact PR binding and reached the independent reviewer, but its final API response ended with an incomplete transport read before any review output was produced or published. It produced no semantic verdict. The QORE Core candidate did not change. Do not treat R17 as PASS or as a semantic finding; R17B is a new package on the same exact frozen candidate.

## Immediate prior Expert R16 finding and correction
Expert R16 on obsolete HEAD `256015297b4547b411ea447b27c4255962194775` confirmed the previous bounded separator correction and identified two adjacent printable dash-family variants not yet represented in the validation-only delimiter table. Integration Authority independently reproduced and adjudicated that finding MATERIAL VALID.

The same Core branch now adds bounded detection-only mappings for `U+2E3A TWO-EM DASH` and `U+2E3B THREE-EM DASH` to ASCII `-`, with permanent regression coverage for both supported composite labels, both assignment delimiters, constructor validation, retained-state re-entry, reason/evidence projections, and benign source-text retention. Valid retained/projected source text is not rewritten.

Because Core changed after R16, all earlier semantic reviews are obsolete for certification. This R17B review is the required fresh Expert stage.

## Mandatory adversarial foci
1. Independently verify the R16 correction closes both newly identified dash variants in construction, retained-state `__post_init__()` re-entry, and logical projections without modifying valid retained text.
2. Re-audit the bounded dash-family table for nearby printable variants that are materially equivalent within the already-declared composite-label contract. Report only reproducible bounded defects; do not require universal Unicode transliteration.
3. Re-falsify the detection ordering `NFKC -> casefold -> NFD -> mark/filler filtering -> bounded delimiter canonicalization`.
4. Verify prior combining-mark, invisible-filler, bounded homoglyph, and earlier separator closures remain intact.
5. Verify URL-userinfo detection remains independent of the generic delimiter path and prior multi-authority / terminator handling is not weakened.
6. Verify recursive retained-state revalidation reaches reason, source_name, locator, evidence, entry, snapshot, lookup, and logical projections.
7. Verify local `StrEnum` canonical identity/name/value revalidation, imported `IdentityFamilyCode`, exact runtime types, deterministic ordering, `bool != int`, and no subclass laundering.
8. Check false-positive containment: benign printable Unicode text outside the supported sensitive syntax remains accepted and projected byte-for-byte unchanged.
9. Verify provider-neutrality and no reviewer/AI-provider dependency in QORE Core.
10. Confirm no hidden retry/sleep/scheduler/thread semantic effect, automatic corrective trading, Risk bypass, provider operational authority, Production authority, deposits/withdrawals, or real-capital execution authority is introduced.

## Verdict discipline
- Review this exact freeze only.
- Report only reproducible material defects tied to this candidate.
- For each finding provide exact location, constructible witness, expected behavior, actual behavior, violated invariant, impact, and minimal safe correction.
- Evidence/tooling insufficiency is not PASS.
- If no material defect remains and evidence is sufficient, state `VALIDACIÓN OK` / no material findings.
- Any Core change invalidates this review.
- Do not authorize Production or real capital.

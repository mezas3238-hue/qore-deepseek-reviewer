# QORE Core PR #466 — DeepSeek Expert R16 — corrected double-hyphen closure

Review only the exact frozen QORE Core candidate below. This is an independent adversarial semantic review. Do not modify QORE Core and do not infer semantic PASS from green CI or from prior reviews.

## Exact freeze
- PR: `466`
- BASE: `5a158ef0fb2e21db95f2be0685373780bf1ab197`
- HEAD: `256015297b4547b411ea447b27c4255962194775`
- TREE: `e1bcb2d7fa23d81421a5adee7f26c61b8223f2f1`
- SYNTHETIC: `b1f5125692314ecd7888a34de91c947b527db8ec`
- synthetic parents: BASE then HEAD
- synthetic tree: identical to HEAD tree
- synthetic signature: GitHub verified / valid
- changed files: `17`
- cumulative diff: `+2500 / -71`

## Authoritative FULL QG
- run: `33467245917`
- job: `99729553989`
- CI checkout: exact synthetic `b1f5125692314ecd7888a34de91c947b527db8ec`
- Ruff: PASS — `All checks passed!`
- Mypy: PASS — `748 source files`
- Pytest: `5100 collected / 5100 passed / 7 warnings`
- runtime: `630.37s (0:10:30)`
- Coverage: `47659 statements / 6236 missed / 87%`
- `instrument_universe_registry.py`: `299 statements / 2 missed / 99%`

<!-- QORE-EXACT-QG {"coverage_missed_statements":6236,"coverage_percent":87,"coverage_total_statements":47659,"job_id":99729553989,"mypy_source_files":748,"pytest_collected":5100,"pytest_passed":5100,"pytest_warnings":7,"ruff_passed":true,"run_id":33467245917} -->

CI success is mechanical evidence only.

## Immediate prior Expert R15 finding and correction
Expert R15 on obsolete HEAD `a872d12db02690b25fb5b66f4f116baa2ad0085e` confirmed the prior `U+2E17 DOUBLE OBLIQUE HYPHEN` correction and found one adjacent bounded hyphen-family variant, `U+2E40 DOUBLE HYPHEN`, not yet canonicalized by `_CREDENTIAL_DELIMITER_CONFUSABLES` for supported composite sensitive labels.

Integration Authority independently reproduced and adjudicated that finding MATERIAL VALID. The same Core branch now maps `U+2E40` to ASCII `-` for validation only and adds permanent regression coverage for both supported composite labels, both assignment delimiters, construction, retained-state `__post_init__()` re-entry, reason/evidence projections, and benign source-text preservation. The retained/projected original valid text is not rewritten.

The current HEAD `256015297b4547b411ea447b27c4255962194775` is an empty content-preserving commit over the corrected tree; its TREE is identical to the preceding corrected HEAD tree. Because the exact HEAD changed, the FULL QG above was rerun against the exact current synthetic freeze.

All earlier semantic reviews are obsolete for certification. This R16 review is the required fresh Expert stage.

## Mandatory adversarial foci
1. Independently verify the R15 `U+2E40` correction closes the exact bounded separator defect in constructor, retained-state re-entry, and logical projections without rewriting valid retained text.
2. Audit the already-declared bounded hyphen-family validation class for nearby printable separators materially equivalent to the existing composite-label contract. Report only reproducible bounded defects; do not require universal Unicode transliteration.
3. Re-falsify the detection-only ordering: `NFKC -> casefold -> NFD -> mark/filler filtering -> bounded delimiter canonicalization`.
4. Re-falsify prior U+2E17, combining-mark, invisible-filler, fullwidth, bounded homoglyph, and assignment-spacing closures.
5. Verify URL-userinfo detection remains independent and R8/R9/R10 multi-authority and NFKC-terminator handling is not weakened.
6. Verify recursive retained-state revalidation reaches reason/source_name/locator/evidence/entry/snapshot/lookup and all logical projections.
7. Verify canonical local `StrEnum` identity/name/value revalidation, imported `IdentityFamilyCode`, exact runtime types, deterministic ordering, `bool != int`, and no subclass laundering.
8. Check false-positive containment: benign printable Unicode outside credential-like syntax must remain accepted and projected byte-for-byte unchanged.
9. Verify provider-neutrality and absence of reviewer/AI-provider dependencies in QORE Core.
10. Confirm no hidden retry/sleep/scheduler/thread semantic effect, automatic corrective trading, Risk bypass, provider operational authority, Production authority, productive credentials, deposits/withdrawals, or real-capital execution authority is introduced.

## Verdict discipline
- Review this exact freeze only.
- Report only reproducible material defects tied to this candidate.
- For each finding provide exact location, constructible witness, expected behavior, actual behavior, violated invariant, impact, and minimal safe correction.
- Evidence/tooling insufficiency is not PASS.
- If no material defect remains and evidence is sufficient, state `VALIDACIÓN OK` / no material findings.
- Any Core change invalidates this review.
- Do not authorize Production or real capital.

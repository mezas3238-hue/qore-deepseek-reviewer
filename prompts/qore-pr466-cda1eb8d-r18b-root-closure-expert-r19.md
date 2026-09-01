# QORE Core PR #466 — DeepSeek Expert R19 — R18B URL-boundary root-closure certification

Review only the exact frozen QORE Core candidate below. You are the independent adversarial technical certifier after Harness Engineer materialization and Integration Authority adjudication of the R18B correction. Do not modify QORE Core. Do not infer PASS from green CI, Harness SUCCESS, or Integration Authority acceptance. Try to falsify the claim that the exact candidate closes the bounded credential/text-normalization contract while preserving all prior accepted closures.

## Exact freeze
- PR: `466`
- BASE: `5a158ef0fb2e21db95f2be0685373780bf1ab197`
- HEAD: `cda1eb8d9b53dee456e7c3639d76de7e63fbd7c8`
- TREE: `ec80768a9c6c5c585bf743fdfcd1ee50e8b871e3`
- SYNTHETIC: `89314a1090fca1eeb7567609cd43a1176888ec6c`
- synthetic parents: BASE then HEAD
- synthetic TREE: identical to HEAD TREE
- synthetic signature: GitHub verified / valid
- PR state immediately before this package: OPEN / DRAFT / mergeable
- cumulative changed files: `23`
- cumulative PR diff: `+3373 / -71`

Harness materialization commit `cda1eb8d9b53dee456e7c3639d76de7e63fbd7c8` is the direct child of obsolete reviewed HEAD `63ca01f3c38fd0f0be875f455d561a3fc306eceb` and was created from artifact `HARNESS-ENGINEER-PR466-63CA01F3-R18B-URL-BOUNDARY-005`.

The materialization delta is exactly three files / 299 changed lines:
1. `docs/audits/UMI14-UMI13-DEEPSEEK-EXPERT-R18B-FOLLOWUP.md` — new, +80
2. `src/qore/infrastructure/instrument_universe_registry.py` — +16/-1
3. `tests/infrastructure/test_instrument_universe_registry_url_boundary_filler.py` — new, +202

## Authoritative FULL QG
- run: `33552538346`
- job: `100005228854`
- CI checkout: exact synthetic `89314a1090fca1eeb7567609cd43a1176888ec6c`
- Ruff: PASS — `All checks passed!`
- Mypy: PASS — `751 source files`
- Pytest: `5357 collected / 5357 passed / 7 warnings`
- Coverage: `47700 statements / 6237 missed / 87%`
- `instrument_universe_registry.py`: `340 statements / 3 missed / 99%`

<!-- QORE-EXACT-QG {"coverage_missed_statements":6237,"coverage_percent":87,"coverage_total_statements":47700,"job_id":100005228854,"mypy_source_files":751,"pytest_collected":5357,"pytest_passed":5357,"pytest_warnings":7,"ruff_passed":true,"run_id":33552538346} -->

CI success is mechanical evidence only.

## R18B finding to certify as closed
R18B on obsolete HEAD `63ca01f3c38fd0f0be875f455d561a3fc306eceb` found a URL-boundary interaction defect. The URL-specific detection skeleton removed an already-in-contract printable invisible filler before evaluating a scheme-relative authority boundary. Removing the filler could concatenate an alphanumeric prefix directly with a later `//` authority start, so the negative-lookbehind boundary guard treated the `//` as word-adjacent and missed otherwise detectable URL userinfo.

Accepted witness family includes printable invisible filler immediately before a scheme-relative authority, for example `Evidence\u115f//alice:password@example.invalid/evidence`, together with NFKC-equivalent Hangul fillers and Braille blank.

## Accepted Harness correction
Credential detection remains detection-only; retained/projected source text must remain byte-for-byte unchanged when valid.

The detector now evaluates URL-userinfo against two URL-specific skeletons:
- the existing filler-removing skeleton, preserving prior protection when fillers occur between authority slashes or inside sensitive material;
- a new filler-preserving URL-boundary skeleton (`preserve_invisible_fillers=True`) so a real printable filler immediately before `//` remains a token boundary.

If either skeleton contains URL userinfo, validation fails closed.

## Mandatory adversarial foci
1. Reproduce the R18B root-cause family independently, not only the literal witness. Attack all declared filler sources: U+115F, U+1160, U+3164, U+FFA0, U+2800.
2. Attack scheme-relative authority starts with alphanumeric prefixes, punctuation prefixes, repeated/mixed slash confusables, and multi-authority strings. Look for same-root-cause variants where boundary preservation still fails.
3. Verify the two-skeleton design does not create a blind spot through inconsistent NFKC/NFD/casefold, mark filtering, slash-confusable folding, authority scanning, or negative-lookbehind behavior.
4. Verify prior URL protections remain closed: filler between authority slashes, filler inside userinfo, filler inside scheme name, multi-authority scanning, NFKC-created authority terminators, real ASCII `/ ? #` and whitespace termination, slash confusables, and prior R8/R9/R10/R18-era accepted closures.
5. Verify F1-F5 remain closed together: composite credential families; non-printable Unicode fail-closed gate; bounded delimiter/separator canonicalization; bounded homoglyph credential matching including bearer; Greek lunate sigma normalization-order closure.
6. Verify recursive retained-state revalidation and logical projection still fail closed for reason, evidence source_name/locator, entry, snapshot and lookup trust edges where applicable.
7. Verify local `StrEnum` canonical identity/name/value revalidation, imported `IdentityFamilyCode`, exact runtime types, deterministic ordering, `bool != int`, and no subclass laundering remain intact.
8. Verify false-positive containment: benign printable filler text outside supported sensitive syntax remains accepted and retained/projected byte-for-byte.
9. Look specifically for patch-list behavior: if a same-root-cause bounded equivalent remains open, provide a constructible witness and explain why it belongs to the already-declared equivalence class.
10. Verify provider-neutrality and that no reviewer/AI-provider dependency, hidden retry/sleep/scheduler/thread effect, automatic corrective trading, Risk bypass, provider operational authority, Production authority, productive credentials, deposits/withdrawals, or real-capital execution authority entered QORE Core.

## Expert reasoning/tooling requirements
- This is a read-only adversarial certification stage.
- Use the stable adaptive HIGH/MAX reasoning policy. Escalate to MAX when interactions, normalization order, or root-cause-family falsification materially require it.
- Use repository/code navigation tooling deeply enough to support exact-head conclusions; do not certify from prompt prose alone.
- Do not propose or perform production edits.
- Ask: `Can I falsify the claim that this exact frozen candidate closes R18B and preserves all prior accepted closures?`
- Report only reproducible material defects tied to this exact candidate.
- For each finding provide exact location, constructible witness, expected behavior, actual behavior, violated invariant, impact, and minimal correction direction. Do not implement the correction.
- Evidence/tooling insufficiency is not PASS.
- If no material defect remains and evidence is sufficient, state `VALIDACIÓN OK` / no material findings.
- Any Core change invalidates this review and requires a fresh Expert stage.
- Do not authorize Coder, Claude, merge, Production, or real capital.

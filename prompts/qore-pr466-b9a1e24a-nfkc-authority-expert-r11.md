# QORE Core PR #466 — DeepSeek Expert R11 — NFKC authority-terminator closure

Review only the exact frozen QORE Core candidate below. This is an independent adversarial semantic review. Do not modify QORE Core and do not infer PASS from CI.

## Exact freeze
- PR: `466`
- BASE: `5a158ef0fb2e21db95f2be0685373780bf1ab197`
- HEAD: `b9a1e24a9cc752a230d23adc6ced490f76c29994`
- TREE: `5601f6e8b5f4d0297a4f0fc8551c7381f17d6542`
- SYNTHETIC: `f7a89016dfcd1dc40059951d439d36324c4ad91d`
- synthetic parents: BASE then HEAD
- synthetic tree: identical to HEAD tree
- synthetic signature: GitHub verified / valid
- commits ahead / behind: `54 / 0`
- changed files: `8`
- cumulative diff: `+1879 / -71`

## Authoritative mechanical QG
- run: `33450578178`
- job: `99679324897`
- Ruff: PASS — `All checks passed!`
- Mypy: PASS — `745 source files`
- Pytest: `5036 collected / 5036 passed / 7 warnings`
- runtime: `593.37s (0:09:53)`
- Coverage: `47658 statements / 6236 missed / 87%`
- `instrument_universe_registry.py`: `298 statements / 2 missed / 99%`
- CI checkout: exact synthetic `f7a89016dfcd1dc40059951d439d36324c4ad91d`

<!-- QORE-EXACT-QG {"coverage_missed_statements":6236,"coverage_percent":87,"coverage_total_statements":47658,"job_id":99679324897,"mypy_source_files":745,"pytest_collected":5036,"pytest_passed":5036,"pytest_warnings":7,"ruff_passed":true,"run_id":33450578178} -->

## Immediate prior finding and correction
Expert R10 on obsolete HEAD `7e24bc07bf74f879ffe7655fe9217db7ff6600de` found that NFKC itself folded `U+FF0F FULLWIDTH SOLIDUS` to ASCII `/` before the R9 URL-preservation rule could protect it. Exact accepted witness:

`https://alice:password／foo@example.invalid/evidence`

The manufactured ASCII slash terminated the authority scan before the real `@`. The finding was independently reproduced and adjudicated MATERIAL VALID. DeepSeek Coder was not launched.

Before freezing the R10 correction, Integration Authority falsification found the same mechanism for printable Unicode compatibility expansions that introduce `/`, `?`, `#` or whitespace, including `℀` (`ACCOUNT OF` → `a/c`), fullwidth `？`, fullwidth `＃`, and spacing diaeresis `¨` whose compatibility normalization introduces ASCII space before a combining mark. The correction is detection-only: the URL skeleton normalizes source characters individually and replaces only terminators introduced by a non-terminator source character with stable non-terminator sentinels. Real ASCII `/`, `?`, `#` and real whitespace retain their terminating semantics. Retained/projected original text is never rewritten.

Independent exhaustive runtime-Unicode falsification examined every printable source character whose NFKC result introduces `/`, `?`, `#` or whitespace: 65 relevant cases and zero artificial authority terminators surviving the final URL skeleton.

## Mandatory adversarial foci
1. Reproduce/falsify the exact R10 fullwidth-solidus witness through construction, reflective retained-state corruption, `__post_init__()` re-entry and logical projection.
2. Probe all printable NFKC compatibility expansions capable of introducing `/`, `?`, `#` or whitespace before `@`, including single-character and longer expansions; independently verify the 65-case claim rather than trusting it.
3. Verify real ASCII `/`, `?`, `#` and whitespace still terminate an authority exactly where intended; no false credential classification after a real terminator.
4. Probe authority-start syntax using ASCII `/`, U+2215 `∕`, U+2044 `⁄`, U+FF0F `／`, and mixed pairs in ordinary `scheme://` and scheme-relative forms.
5. Probe second/third authorities after benign URLs, mixed ordinary/confusable starts, userinfo punctuation, fullwidth `@`, and safe email/path prose controls.
6. Re-falsify R8/R9/R10 exact witnesses and prior credential-assignment findings: spacing, repeated separators, NBSP/zero-width, fullwidth `=`, variation selectors, bearer, U+2015, U+02D0 and bounded label homoglyphs (sigma/final sigma, Cyrillic ze, Greek eta, Cyrillic ghe, Cyrillic `и`).
7. Verify sentinel choices remain stable across the subsequent whole-string NFKC/casefold/mark-removal pipeline and cannot themselves become `/`, `?`, `#` or whitespace.
8. Verify legitimate printable Unicode and benign URL-like text remain accepted and projected byte-for-byte unchanged.
9. Verify recursive retained-state revalidation across reason/source_name/locator/evidence/entry/snapshot/lookup and canonical local `StrEnum` state.
10. Verify exact runtime types, deterministic ordering, no subclass laundering and fail-closed handling of reflective corruption.
11. Verify provider-neutrality and absence of reviewer/AI-provider dependencies in QORE Core.
12. Confirm no execution authority, Risk bypass, Production authority, productive credentials, real-capital authority, deposits/withdrawals or real-money execution capability is introduced.

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

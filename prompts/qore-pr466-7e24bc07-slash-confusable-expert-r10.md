# QORE Core PR #466 — DeepSeek Expert R10 — slash-confusable URL-userinfo closure

Review only the exact frozen QORE Core candidate below. This is an independent adversarial semantic review. Do not modify QORE Core and do not infer PASS from CI.

## Exact freeze
- PR: `466`
- BASE: `5a158ef0fb2e21db95f2be0685373780bf1ab197`
- HEAD: `7e24bc07bf74f879ffe7655fe9217db7ff6600de`
- TREE: `c20aecedb5f4ee97ec151fa20daa0b09482f0738`
- SYNTHETIC: `2ec19d5854841aa103b7a3c9e5753edf6a12789b`
- synthetic parents: BASE then HEAD
- synthetic tree: identical to HEAD tree
- synthetic signature: GitHub verified / valid
- commits ahead / behind: `42 / 0`
- changed files: `8`
- cumulative diff: `+1767 / -71`

## Authoritative mechanical QG
- run: `33447330913`
- job: `99669248984`
- Ruff: PASS — `All checks passed!`
- Mypy: PASS — `745 source files`
- Pytest: `4992 collected / 4992 passed / 7 warnings`
- runtime: `555.05s (0:09:15)`
- Coverage: `47645 statements / 6236 missed / 87%`
- `instrument_universe_registry.py`: `285 statements / 2 missed / 99%`
- CI checkout: exact synthetic `2ec19d5854841aa103b7a3c9e5753edf6a12789b`

<!-- QORE-EXACT-QG {"coverage_missed_statements":6236,"coverage_percent":87,"coverage_total_statements":47645,"job_id":99669248984,"mypy_source_files":745,"pytest_collected":4992,"pytest_passed":4992,"pytest_warnings":7,"ruff_passed":true,"run_id":33447330913} -->

## Immediate prior finding and correction
Expert R9 on obsolete HEAD `4ccb42efdda62e9b5070a805c45c4c602b6e953c` found one material URL-userinfo detection defect. The global detection skeleton folded `U+2215 DIVISION SLASH` (`∕`) and `U+2044 FRACTION SLASH` (`⁄`) to ASCII `/` before URL-userinfo scanning. Exact accepted witness:

`https://alice:password∕foo@example.invalid/evidence`

After folding, the detector saw `https://alice:password/foo@example.invalid/evidence`; the manufactured ASCII `/` terminated the authority regex before the real `@`, so credential-like userinfo escaped. The finding was independently reproduced and adjudicated MATERIAL VALID. DeepSeek Coder was not launched.

This candidate introduces a dedicated URL-userinfo detection skeleton. It preserves `∕` and `⁄` inside authority text, while `_contains_url_userinfo` accepts ASCII `/`, `∕` and `⁄` only in the two slash positions that introduce an authority. The ordinary credential skeleton continues its bounded slash folding for non-URL detection. Original retained/projected text is never rewritten.

Permanent R8/R9 regressions cover the exact R9 witness; mixed `https:∕∕...` and scheme-relative `∕∕...` starts; the exact R8 later embedded URL witness; ordinary/scheme-relative userinfo; retained-state re-entry/projection; evidence source-name/locator paths; and benign false-positive controls.

## Mandatory adversarial foci
1. Reproduce/falsify the exact R9 witness at construction, retained-state corruption, `__post_init__()` and logical projection.
2. Probe combinations of ASCII `/`, U+2215 `∕`, and U+2044 `⁄` in authority-start slash positions and inside authority/userinfo before `@`, including mixed pairs and mixed scheme/scheme-relative starts.
3. Probe multiple authorities in one string, including second/third credential-bearing authorities after benign URLs and mixtures of ordinary, scheme-relative and confusable starts.
4. Probe real ASCII path/query/fragment terminators versus slash confusables; ensure email/path prose after a terminated authority is not misclassified.
5. Re-falsify R8 and prior URL-userinfo witnesses, including fullwidth `@`, scheme-relative forms and safe controls.
6. Re-falsify prior assignment witnesses: spacing, repeated separators, NBSP/zero-width, fullwidth `=`, variation selectors, bearer, U+2015 bar and U+02D0 colon.
7. Recheck bounded label homoglyphs including sigma/final sigma, Cyrillic ze, Greek eta, Cyrillic ghe and Cyrillic `и`→ASCII `u` authorization with `=` and `:`.
8. Verify legitimate printable Unicode and benign URL-like text remain accepted and projected byte-for-byte unchanged.
9. Verify recursive retained-state revalidation across reason/source_name/locator/evidence/entry/snapshot/lookup plus canonical local `StrEnum` state.
10. Verify exact runtime types, deterministic order, no subclass laundering and fail-closed reflective-corruption handling.
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

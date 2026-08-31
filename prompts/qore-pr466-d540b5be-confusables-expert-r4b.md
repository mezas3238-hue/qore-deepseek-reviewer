# QORE Core PR #466 — DeepSeek Expert — confusables closure R4B

Review only the exact frozen QORE Core candidate below. This is an independent adversarial semantic review. Do not modify QORE Core and do not infer PASS from CI. R4 aborted before model execution because its prompt lacked the mandatory exact-QG marker; R4 spent USD 0 and published no review. R4B is the corrected package for the same unchanged Core candidate.

## Exact freeze
- PR: `466`
- BASE: `5a158ef0fb2e21db95f2be0685373780bf1ab197`
- HEAD: `d540b5be87985f21de5088af66bb178d1716110a`
- TREE: `4ac08b4d62688fe00b8e0c422688c290856f0516`
- SYNTHETIC: `9dc314018e370e31c8db06906ecfce834caf0fa7`
- synthetic parents: BASE then HEAD
- synthetic tree: identical to HEAD tree
- synthetic signature: GitHub verified / valid
- BASE→HEAD: 19 ahead / 0 behind; 7 changed files; +1520 / -69

## Authoritative mechanical QG
- run: `33424915851`
- job: `99596046852`
- Ruff: PASS
- Mypy: PASS — 744 source files
- Pytest: 4947 collected / 4947 passed / 7 warnings
- Coverage: 47650 statements / 6236 missed / 87%
- instrument registry: 290 statements / 2 missed / 99%

<!-- QORE-EXACT-QG {"coverage_missed_statements":6236,"coverage_percent":87,"coverage_total_statements":47650,"job_id":99596046852,"mypy_source_files":744,"pytest_collected":4947,"pytest_passed":4947,"pytest_warnings":7,"ruff_passed":true,"run_id":33424915851} -->

## Objective
Adversarially determine whether this exact candidate fully closes the accepted UMI-13 retained-state, enum-state and credential-hygiene findings without semantic regression, overbroad Unicode rejection, provider coupling or authority expansion.

## Historical findings — approval obsolete
Earlier HEADs had valid findings that were corrected and whose approval does not transfer:
- recursive retained-child revalidation gaps;
- local `StrEnum` singleton reflective corruption;
- whitespace around sensitive assignment delimiters;
- scheme-relative URL userinfo;
- multiple separators inside composite credential names;
- non-printable Unicode separators;
- fullwidth assignment/userinfo punctuation and variation-selector marks;
- R2: cross-script `tok\u0435n=...` plus missing `bearer=...` assignment coverage;
- R3 on obsolete HEAD `e0cadfca635af00e2461e9117da1ebc1bf7f91ba`: the bounded homoglyph table omitted Greek sigma for ASCII `s` and Cyrillic ze for ASCII `z`, allowing `pa\u03c2\u03c2word=PLAINTEXT-SECRET` and `authori\u0437ation=PLAINTEXT-SECRET`.

Current HEAD adds bounded `("s", "σ")` and `("z", "з")` mappings and constructor/revalidation regressions. Python casefold maps final sigma `ς` to `σ`, so the exact R3 final-sigma witness is expected to fail closed now.

## Mandatory adversarial foci
1. Reproduce/falsify the R3 witnesses through constructor and retained-state `__post_init__` / `logical_values` re-entry.
2. Audit bounded Greek/Cyrillic/Latin homoglyph substitutions across every supported sensitive assignment label: authorization, bearer, credential, jwt, password, secret, token, api key, access token, client secret, private key.
3. Look for materially obvious remaining homoglyphs at first/middle/last positions and multiple substitutions. A finding must provide the exact Unicode code point(s), concrete accepted input, and why the bounded contract is violated; do not demand generic Unicode-universe transliteration.
4. Recheck casefold/NFKC interactions, Unicode mark removal, punctuation-confusable folding, spaces/underscores/hyphens and `=` / `:` assignment delimiters.
5. Re-falsify prior credential-hygiene witnesses: ordinary assignments, spaces before delimiters, repeated composite separators, NBSP/ZWSP, fullwidth `=`/`@`, variation-selector marks, ordinary URL userinfo, and scheme-relative `//userinfo@host`.
6. Confirm the detector remains detection-only: original retained/projected text is not rewritten and unrelated printable Greek/Cyrillic prose remains valid.
7. Verify reason/source_name/locator, evidence record, entry, snapshot, lookup, graph operations and logical projection all recursively revalidate retained material after reflective mutation.
8. Recheck imported `IdentityFamilyCode`, local `StrEnum` canonical singleton identity/name/value state, exact runtime types, no subclass/bool laundering, deterministic ordering, duplicate detection and tuple shapes.
9. Confirm no mutable/global semantic state, provider/AI dependency, execution authority, Risk bypass, Production authority or real-capital authority was introduced.
10. Review the complete BASE→HEAD candidate, not merely the final two mapping additions.

## Finding bar
Report only reproducible material defects tied to this exact HEAD. For each finding provide exact location, minimal constructible witness, expected vs actual behavior, violated invariant, impact, why current tests miss it, and smallest safe correction direction. Distinguish a real finding from evidence insufficiency or tooling failure.

## Required verdict
If no material defect remains and evidence is sufficient, state `NONE / VALIDATION OK` (or equivalent `VALIDACIÓN OK`) and briefly name the adversarial areas actually checked.

If evidence is insufficient, do not call it PASS. Any change to BASE/HEAD/SYNTHETIC/QG invalidates this review. DeepSeek Coder remains blocked until this Expert result is independently adjudicated. Do not authorize Production, productive credentials, real capital, deposits/withdrawals or real-money execution.
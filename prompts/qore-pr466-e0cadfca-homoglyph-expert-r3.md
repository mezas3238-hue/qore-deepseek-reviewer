# QORE Core PR #466 — DeepSeek Expert — homoglyph/bearer closure R3

Review only the exact frozen QORE Core candidate below. This is an independent adversarial semantic review. Do not modify QORE Core and do not infer PASS from CI.

## Exact freeze
- PR: `466`
- BASE: `5a158ef0fb2e21db95f2be0685373780bf1ab197`
- HEAD: `e0cadfca635af00e2461e9117da1ebc1bf7f91ba`
- TREE: `6d12cff08fbc9c00cdb2f606882a328252c82abd`
- SYNTHETIC: `74ad4817230bf64bb9a79399cfe36ea23639af70`
- synthetic parents: BASE then HEAD
- synthetic tree: identical to HEAD tree
- synthetic signature: GitHub verified / valid

## Authoritative mechanical QG
- run: `33420547356`
- job: `99581549949`
- Ruff: PASS
- Mypy: PASS — 744 source files
- Pytest: 4943 collected / 4943 passed / 7 warnings
- Coverage: 47650 statements / 6236 missed / 87%
- instrument registry: 290 statements / 2 missed / 99%

<!-- QORE-EXACT-QG {"coverage_missed_statements":6236,"coverage_percent":87,"coverage_total_statements":47650,"job_id":99581549949,"mypy_source_files":744,"pytest_collected":4943,"pytest_passed":4943,"pytest_warnings":7,"ruff_passed":true,"run_id":33420547356} -->

## Objective
Adversarially determine whether this candidate fully closes the accepted UMI-13 retained-state, enum-state and credential-hygiene findings without semantic regression, overbroad Unicode rejection, provider coupling or authority expansion.

The immediately preceding Expert package `QORE-PR466-273C04A1-DS-EXPERT-CONFUSABLES-R2` was bound to obsolete HEAD `273c04a1d75793ffa0b685aff669293f653d251f` and found two material defects:

1. cross-script homoglyphs outside NFKC could hide sensitive assignment labels, witness `tok\u0435n=PLAINTEXT-SECRET` using Cyrillic small IE;
2. `bearer=PLAINTEXT-SECRET` was accepted because bearer was not included in the assignment grammar.

Both findings were independently accepted and corrected. That old review grants no approval to this HEAD.

## Mandatory adversarial foci
1. Reproduce/falsify both immediately preceding witnesses, including constructor and retained-state re-entry/projection.
2. Adversarially test bounded Greek/Cyrillic/Latin homoglyph substitutions across every supported sensitive label: authorization, bearer, credential, jwt, password, secret, token, api key, access token, client secret, private key.
3. Test mixed-script substitutions at first/middle/last characters, multiple substitutions in one label, uppercase/casefold behavior, and combinations with spaces/underscore/hyphen separators.
4. Test assignment delimiter confusables relevant to `=` / `:` and composite-name separators; distinguish real credential-like syntax from arbitrary unrelated Unicode.
5. Re-falsify all prior accepted witnesses: ordinary assignments, whitespace before delimiters, multiple separators, NBSP/ZWSP, fullwidth `=`/`@`, variation-selector marks, ordinary URL userinfo, scheme-relative `//userinfo@host`.
6. Verify the detector remains detection-only: original retained/projected legitimate Unicode must not be rewritten.
7. Look specifically for false positives caused by the bounded homoglyph machinery: unrelated Greek/Cyrillic prose must remain valid unless it actually forms credential-like syntax.
8. Verify constructor, `__post_init__`, reason/source_name/locator logical projections, evidence record, entry, snapshot and lookup trust edges.
9. Recheck imported `IdentityFamilyCode` revalidation, local `StrEnum` canonical identity/name/value validation, exact runtime types, deterministic ordering and tuple shapes.
10. Confirm no provider/AI dependency, execution authority, Risk bypass, Production authority or real-capital authority was introduced.

## Required verdict discipline
- Report only reproducible material defects tied to this exact HEAD.
- For each finding provide exact location, constructible witness, expected behavior, actual behavior, violated invariant, impact and minimal safe correction.
- Distinguish real defects from evidence insufficiency/tool failure.
- If no material defect remains and evidence is sufficient, state `VALIDACIÓN OK` / no material findings.
- If evidence is insufficient, do not call it PASS.
- Any change to BASE/HEAD/SYNTHETIC/QG invalidates this review.
- DeepSeek Coder remains blocked until this Expert result is independently adjudicated.
- Do not authorize Production, productive credentials, real capital, deposits/withdrawals or real-money execution.

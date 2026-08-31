# QORE Core PR #466 — DeepSeek Expert — printable Unicode confusables closure R2

Review only the exact frozen QORE Core candidate below. This is an independent adversarial semantic review. Do not modify QORE Core and do not infer PASS from CI.

## Exact freeze
- PR: `466`
- BASE: `5a158ef0fb2e21db95f2be0685373780bf1ab197`
- HEAD: `273c04a1d75793ffa0b685aff669293f653d251f`
- TREE: `e0a017067665784309e2bfea625df939081858cd`
- SYNTHETIC: `41960317c43c988a3781337d39a06ce558a86293`
- synthetic parents: BASE then HEAD
- synthetic tree: identical to HEAD tree
- synthetic signature: GitHub verified / valid

## Authoritative mechanical QG
- run: `33415018001`
- job: `99563475053`
- Ruff: PASS
- Mypy: PASS — 743 source files
- Pytest: 4929 collected / 4929 passed / 7 warnings
- Coverage: 47623 statements / 6235 missed / 87%
- instrument registry: 263 statements / 1 missed / 99%

<!-- QORE-EXACT-QG {"coverage_missed_statements":6235,"coverage_percent":87,"coverage_total_statements":47623,"job_id":99563475053,"mypy_source_files":743,"pytest_collected":4929,"pytest_passed":4929,"pytest_warnings":7,"ruff_passed":true,"run_id":33415018001} -->

## Objective
Adversarially determine whether this exact QORE Core candidate completely closes the accepted UMI-13 retained-state, enum-state and credential-hygiene defects, including printable-Unicode confusables/marks, without semantic regression, false-negative leakage, unsafe over-normalization, or authority expansion.

The immediately preceding Expert review was bound to obsolete HEAD `2099dbd7daae7dd543606893fd85caf3991ef239` and found a material printable-Unicode bypass:
- fullwidth equals `U+FF1D` in sensitive assignments;
- variation selector-16 `U+FE0F` interleaved in a sensitive token;
- fullwidth commercial-at `U+FF20` inside URL authority userinfo.

That finding was independently reproduced and accepted. The current candidate now performs credential detection on a detection-only NFKC skeleton and removes Unicode mark categories `Mn`, `Mc`, `Me`; the original retained/projected text is not rewritten. The old review grants no approval to this HEAD.

## Mandatory adversarial foci
1. Reproduce/falsify the exact previous witnesses: `token\uFF1DPLAINTEXT-SECRET`, `token\uFE0F=PLAINTEXT-SECRET`, `api\uFE0F key = PLAINTEXT-SECRET`, and `https://alice:password\uFF20example.invalid/evidence`.
2. Test additional NFKC compatibility forms and printable Unicode confusables that could hide `=`, `:`, `@`, sensitive names, separators, URL authority boundaries, or supported sensitive families.
3. Test Unicode marks from `Mn`, `Mc`, and `Me` before, inside, and after sensitive names/delimiters and URL userinfo boundaries.
4. Verify that detection-only normalization cannot alter the retained/projected value and does not collapse legitimate printable Unicode into credential-like false positives unless the compatibility-folded text actually represents credential syntax.
5. Verify constructor-time validation and retained-state re-entry/projection across `__post_init__`, `logical_values`, evidence content/full projection, entry, snapshot, and lookup.
6. Re-falsify all prior accepted witnesses: NBSP/ZWSP, whitespace before delimiters, multiple space/underscore/hyphen separators, ordinary URL userinfo, scheme-relative `//userinfo@host`, reflective mutation, and corrupted local enum singleton state.
7. Recheck recursive retained-child validation, imported `IdentityFamilyCode` revalidation, exact local `StrEnum` canonical identity/name/value validation, deterministic ordering, tuple shapes, exact-runtime-type discipline, and subclass laundering resistance.
8. Look specifically for normalization-order bugs: lower-before/after-NFKC differences, characters whose NFKC expansion introduces marks/separators, mark removal joining unrelated text into sensitive syntax, and URL parsing after folding.
9. Confirm no provider-specific dependency, execution authority, Risk bypass, Production authority, real-capital authority, reviewer dependency, or AI-provider dependency was introduced into QORE Core.

## Required verdict discipline
- Report only reproducible material defects tied to this exact HEAD.
- For each finding provide exact location, constructible witness, expected behavior, actual behavior, violated invariant, impact and minimal safe correction.
- Distinguish a real defect from evidence insufficiency/tool failure.
- If no material defect remains and evidence is sufficient, state `VALIDACIÓN OK` / no material findings.
- If evidence is insufficient, do not call it PASS.
- Any change to BASE/HEAD/SYNTHETIC/QG invalidates this review.
- DeepSeek Coder remains blocked until this Expert result is independently adjudicated.
- Do not authorize Production, productive credentials, real capital, deposits/withdrawals or real-money execution.

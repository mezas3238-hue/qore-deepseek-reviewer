# QORE Core PR #466 — DeepSeek Expert final-freeze review

GitHub/qore-core is the source of truth. Review only the exact frozen candidate below. This is an independent adversarial Expert review; CI green is mechanical evidence only and does not imply semantic approval.

## Exact freeze
- PR: #466
- BASE: `5a158ef0fb2e21db95f2be0685373780bf1ab197`
- HEAD: `3aef3e79abbaeeb6a0b427fe6fc57af9e055ef97`
- TREE: `5cf143eda111ab972bd38a37c221e4f5a7ead8ec`
- SYNTHETIC: `d44b9efbc294d932925af7b7b8b474972b704b0e`
- synthetic parents: BASE then HEAD
- synthetic tree: identical to HEAD tree

## Authoritative quality gate
- run: `33402331107`
- job: `99521418438`
- Ruff: PASS
- Mypy: PASS — 742 source files
- Pytest: 4908 collected / 4908 passed / 7 warnings
- Coverage: 47619 statements / 6235 missed / 87%

<!-- QORE-EXACT-QG {"coverage_missed_statements":6235,"coverage_percent":87,"coverage_total_statements":47619,"job_id":99521418438,"mypy_source_files":742,"pytest_collected":4908,"pytest_passed":4908,"pytest_warnings":7,"ruff_passed":true,"run_id":33402331107} -->

## Objective
Determine whether the exact candidate completely closes the accepted UMI-13 retained-state / canonical-evidence integrity defects without semantic regression, credential leakage, non-determinism, provider coupling, or authority expansion.

## Changed files
1. `src/qore/infrastructure/instrument_universe_registry.py`
2. `tests/infrastructure/test_instrument_universe_registry_recursive_revalidation.py`
3. `tests/infrastructure/test_instrument_universe_registry_credential_variants.py`
4. `docs/architecture/QORE-UMI-13-RECURSIVE-REGISTRY-REVALIDATION-001.md`

## Accepted findings that this final candidate claims to close
- `UMI14-R2-UMI13-REVALIDATION-001`: retained frozen/slotted child state could be reflectively corrupted and then trusted by parent re-entry / `logical_values()`.
- `F-UMI13-ENUM-REVALIDATION-002`: local `StrEnum` singleton retained state (`_name_` / `_value_`) could be reflectively corrupted and still influence comparisons/projections.
- spaced credential assignment witness such as `token = PLAINTEXT-SECRET`.
- scheme-relative URL userinfo witness such as `//alice:password@example.invalid/evidence`.
- prior Expert witness on obsolete HEAD `828f6ba44fe8d81784e5a747d9255a0092be0b44`: multi-separator composite credential names such as `api   key = ...` and `private   key = ...`.

All reviews bound to earlier HEADs are obsolete for approval. Their findings are historical adversarial inputs only.

## Mandatory adversarial focus
- Reproduce and falsify every accepted witness against this exact HEAD.
- Search for other reflective corruption paths across reason/ref/evidence/entry/snapshot trust edges.
- Verify `IdentityFamilyCode` revalidation remains exact and cannot be bypassed by subclass/type laundering or corrupted retained state.
- Attack local `StrEnum` members through `_name_` and `_value_` mutation, equality/hash behavior, lookups, graph/set construction and logical projections.
- Falsify `_SENSITIVE_ASSIGNMENT_PATTERN` with whitespace, multiple spaces, underscores, hyphens, mixed separators, case variants and delimiter spacing for the supported credential-name families.
- Falsify URL userinfo detection for ordinary scheme authorities and scheme-relative authorities, including query/fragment/path boundaries.
- Verify recursive revalidation happens before hashing, set construction, sorting, graph operations, lookup, and projection wherever retained material becomes trusted.
- Verify valid canonical tuple shapes and deterministic ordering remain unchanged.
- Verify no secrets, provider-native authority, execution/risk/Production authority, retry/scheduler/network behavior or provider dependency has been introduced.
- Inspect tests for SUT-derived expected values, accidental tautology, missing adversarial boundary coverage, or weakening of prior tests.

## Required verdict
If there is any material defect, report each finding with:
1. exact file/symbol/location;
2. constructible witness;
3. expected behavior;
4. actual behavior on the frozen candidate;
5. violated invariant;
6. material impact;
7. smallest safe correction.

If no material defect is reproducible and evidence is sufficient, return `NONE / VALIDATION OK` explicitly.

If evidence is insufficient, return `EVIDENCE INSUFFICIENT / VALIDATION BLOCKED`; do not convert missing evidence into PASS.

## Prohibitions
- Do not modify qore-core.
- Do not merge or mark the PR Ready.
- Do not dispatch Coder or Claude.
- Do not weaken tests/validation or suppress findings.
- Do not infer PASS from CI.
- Do not authorize provider support, Production, productive credentials, real capital, deposits/withdrawals, or real-money execution.
- If BASE/HEAD/SYNTHETIC changes, this review is obsolete.

# DeepSeek Expert R94 — QORE UMI14 correction UMI13 recursive revalidation

Act as an independent adversarial Expert reviewer. GitHub live state, the exact frozen checkout, CPython 3.12 behavior, and independently reproduced evidence are authoritative. Acknowledge the prior UMI-13 findings as the reason for this correction, but inherit no verdict from any earlier DeepSeek, Claude, Codex, CI, tracker, or Integration Authority decision.

## Exact frozen Core candidate

- Repository `mezas3238-hue/qore-core`, PR #466.
- BASE `5a158ef0fb2e21db95f2be0685373780bf1ab197`.
- HEAD `df934e5585f59dd0aef17f9ece108d6f39204470`, tree `754bd893bd1763f3c5ce853ec8ab26fb5c33f6ce`.
- SYNTHETIC `24de1e0657427f5ba1ac1de3ed07281c8e5f49b2`; parents must be BASE then HEAD and its tree must equal the HEAD tree.
- Required exact-freeze QORE CI: run `33283252638`, job `99181893347`, completed SUCCESS.
<!-- QORE-EXACT-QG {"run_id":33283252638,"job_id":99181893347,"ruff_passed":true,"mypy_source_files":741,"pytest_collected":4887,"pytest_passed":4887,"pytest_warnings":7,"coverage_total_statements":47615,"coverage_missed_statements":6235,"coverage_percent":87} -->
- The raw checkout log must prove the exact synthetic SHA. CI is mechanical evidence, not a semantic verdict.

## Bounded correction and prior findings

The candidate addresses `UMI14-R2-UMI13-REVALIDATION-001` and `F-UMI13-ENUM-REVALIDATION-002`: retained registry children and mutable `StrEnum` singleton state previously crossed parent and projection trust boundaries without complete recursive canonical revalidation. Independently determine whether the exact HEAD fully closes those defects. Do not assume the findings remain open or are fixed.

Review only this three-file BASE→HEAD scope:

1. `src/qore/infrastructure/instrument_universe_registry.py`
2. `tests/infrastructure/test_instrument_universe_registry_recursive_revalidation.py`
3. `docs/architecture/QORE-UMI-13-RECURSIVE-REGISTRY-REVALIDATION-001.md`

Confirm there are exactly three changed files and that historical oracle `tests/infrastructure/test_universal_cross_asset_conformance_full_closure.py` remains byte-identical at blob `249caa1504e2b62277a9389dc7e73bcabf12e7db`.

## Required adversarial falsification

Aggressively construct post-construction retained-state mutations and already-corrupt child injection at every relevant trust edge:

- `InstrumentUniverseEvidenceRef`, `InstrumentUniverseOwnerRef`, `InstrumentUniverseSemanticRef`, and `InstrumentUniverseReason`;
- evidence `source_name`, `locator`, `verified_on`, credential-like material, malformed canonical codes, wrong exact types, and unhashable values;
- imported `IdentityFamilyCode` value/type/state and lookup query state;
- the three local `StrEnum` classes `InstrumentUniverseEvidenceSourceCategory`, `InstrumentUniverseCoverageStatus`, and `InstrumentUniverseOwnerStatus`, including mutated `_value_`, mutated `_name_`, canonical singleton identity, cross-member equality/hash effects, and decisions made after corruption;
- `InstrumentUniverseEvidenceRecord`, `InstrumentUniverseEntry`, and `InstrumentUniverseRegistrySnapshot` construction, direct `__post_init__` re-entry, every logical projection, evidence-content projection, graph validation, and `entry_for_family` lookup.

Verify validators execute before any hash, set, sort, equality, membership, dereference, graph operation, or projection that could raise an incidental Python exception, accept corrupted state, leak credential material, or derive a decision from mutable enum behavior. The public failure must be the bounded registry validation error without secret reflection.

Independently test whether recursive validation covers both corrupt children supplied at new parent construction and children corrupted after a valid graph is retained. Look for alternate public projections or lookup paths that bypass revalidation, mutable-state aliasing, equality/hash collisions, ordering dependence, non-determinism, exception laundering, and partial projection before failure.

Prove valid behavior is unchanged: the canonical registry still contains exactly the full 19-family UMI-02 universe; deterministic tuple shape, primitive values, canonical ordering, repeated projections, graph references, and lookup identity remain stable. Do not broaden into a global R1–R89 audit.

## Review output contract

For every surviving material finding provide a stable ID and severity, exact file/symbol/location, minimal executable witness, observed exception/result/projection, violated invariant, affected trust edge, and smallest bounded correction. Distinguish a material correctness/security defect from optional hardening or style.

If exact GitHub binding, the single exact-QG contract, three-file scope, oracle blob, or live freeze cannot be mechanically established, end with `MECHANICAL REVIEW FAILURE`. If any material semantic finding survives, end with `VALIDACIÓN NO OK`. Only if all required falsification is complete and no material finding survives, end literally:

HALLAZGOS: NINGUNO
VALIDACIÓN OK

This review authorizes no provider support, operational readiness, Production, real capital, live trading, or Risk bypass.

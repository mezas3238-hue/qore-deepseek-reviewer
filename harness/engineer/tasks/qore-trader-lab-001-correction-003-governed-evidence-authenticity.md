# QORE Trader Lab — Correction 003 Governed Evidence Authenticity

## Package intent

Continue from the exact completed Correction-002 Resume-001 candidate. **Do not restart Trader Lab and do not repeat completed predecessor lanes.**

This package closes one independently adjudicated MATERIAL root family only:

`IA-R1B — LOCALLY MINTABLE GOVERNED APPROVAL EVIDENCE`

The source candidate, exact hashes and reconstruction procedure are frozen in:

`harness/engineer/recovery/qore-trader-lab-001-correction-003-base.README.md`

## Immutable qore-core binding

- START: `5d25445faf57fa83410b57faf5eaf1f437949129`
- TREE: `f9df989d7e7120d8742d4001b045fdd11cb0cb03`
- PR: qore-core #481
- Issue: qore-core #473
- recovered predecessor patch SHA256: `dce905d442d13c851bdd6fc799fcbd8f035ca027a2f22cc66034708714ce15b1`

Verify exact START/TREE and clean workspace first. Reconstruct and apply the predecessor patch exactly from the four recovery fragments according to the README. Any binding/SHA/apply mismatch -> fail closed.

## Completed predecessor evidence — inherit, do not redo

Correction-002 Resume-001 already completed all six lanes and recorded:

- 13 files;
- +2744/-259;
- 63 focused Trader Lab tests PASS;
- Ruff PASS;
- Mypy PASS (753 source files);
- full Pytest 4925 PASS;
- coverage 87%;
- `git diff --check` clean;
- IA-R2 Research/Stress stage semantics closed;
- IA-R3 Monte Carlo thresholds enforced;
- IA-R4 nested/exact-runtime revalidation closed;
- IA-R5 canonicalization residuals closed;
- prior F1-F18 corrections preserved.

Do not repeat repository-wide discovery or predecessor root-family work unless a direct regression from the authenticity correction requires targeted revalidation.

## Material witness

The predecessor candidate exposes a public local construction path approximately equivalent to:

`build_trader_lab_governed_gate_evidence(candidate, gate, authority_id, authority_name, decision=APPROVED, decided_at, authority_evidence_digest)`

which locally fingerprints supplied fields and returns `TraderLabGovernedGateEvidence`. A subsequent `reference_governed_gate_evidence(...)` can turn the locally constructed APPROVED object into qualifying Risk/CIBO/Independent-Validation stage evidence.

This is structurally typed, but it is still self-certification by caller-supplied data.

Hard laws:

`TYPED APPROVED OBJECT != AUTHENTIC GOVERNED EVIDENCE`

`TYPED REFERENCE != PROOF THAT THE OWNING AUTHORITY ISSUED THE DECISION`

`NO AUTHENTIC GOVERNED RISK/CIBO/INDEPENDENT VALIDATION EVIDENCE -> NO QUALIFYING STAGE -> NO DEMO_ELIGIBLE`

## Required architecture correction

Close the root family, not only the exact function name.

For Risk, CIBO and Independent Validation gates where qore-core has no authoritative digest/decision producer on this exact baseline:

1. Trader Lab may define provider-neutral **consumption/verification contracts** for externally produced governed evidence.
2. Trader Lab must not expose a public constructor/factory/helper that can mint a qualifying APPROVED external-governance decision from arbitrary caller-supplied authority metadata/digest.
3. A qualifying external governed-evidence object/reference must require an authenticity property that cannot be synthesized solely from public Trader Lab value constructors.
4. If no authoritative producer/verifier exists on the baseline, the gate remains explicitly `EXTERNAL_EVIDENCE_DEPENDENT` / fail-closed. Do not invent an authority.
5. Do not import concrete providers, credentials, network clients or operational authority into Trader Lab.
6. Do not move Risk/CIBO/Independent Validation ownership into Trader Lab.
7. Preserve exact candidate/version/stage/gate binding and recursive revalidation.
8. Preserve immutable/deterministic fingerprints for material that Trader Lab is legitimately allowed to own.
9. Research/OOS/Stress/Monte-Carlo/Economic evidence paths that have genuine in-repo producer material must remain valid and independently revalidated; do not break them merely to close external-gate authenticity.
10. Never replace authenticity with a boolean such as `trusted=True`, a caller-provided enum, magic source name, opaque UUID, arbitrary digest, or another structurally self-asserted marker.

Prefer a narrow provider-neutral protocol/sealed evidence-consumption seam whose qualifying material must originate outside Trader Lab from the owning authority, with test doubles/fakes used only in tests through an explicit trusted test boundary if needed. The production Trader Lab path must fail closed when such material is absent/unverifiable.

## Six correction lanes

These are **Correction-003 lanes only**. They are not permission to rerun the six lanes of Correction-002.

### Lane 1 — Exact recovery + semantic ownership check
- restore exact `dce905...` predecessor;
- use semantic LSP only on `TraderLabGovernedGateEvidence`, builder/reference consumers, lifecycle/promotion consumers and relevant existing authority/evidence boundaries;
- identify every public or indirect route that can locally mint qualifying external gate evidence;
- checkpoint exact findings and candidate binding.

### Lane 2 — Authority-safe evidence consumption design
- implement the smallest provider-neutral authenticity boundary;
- eliminate/neutralize every local qualifying-mint path;
- external evidence absence remains fail-closed;
- no new Risk/CIBO/Independent authority owner in Trader Lab.

### Lane 3 — Lifecycle / promotion integration
- ensure Risk/CIBO/Independent-Validation stages consume only authenticity-qualified material;
- direct constructors, reconstructed retained state and lifecycle replay must enforce the same rule;
- candidate/gate/stage/version mismatch fails typed and closed.

### Lane 4 — Adversarial falsification
At minimum prove:
1. arbitrary UUID + authority name + arbitrary digest + APPROVED cannot qualify Risk;
2. same cannot qualify CIBO;
3. same cannot qualify Independent Validation;
4. a locally constructed/lookalike dataclass cannot become qualifying by value equality;
5. raw string / StrEnum value equality cannot launder gate/decision/status;
6. subclass laundering rejected where exact runtime type is required;
7. `object.__new__` / reflective nested mutation cannot reach `DEMO_ELIGIBLE`;
8. copied evidence for candidate A cannot qualify candidate B;
9. correct authority material for one gate cannot qualify another gate;
10. stale/malformed/non-timezone-aware decision evidence fails closed;
11. evidence with valid fingerprint but no authentic issuer proof fails closed;
12. test-only fake issuer cannot leak into production semantic authority;
13. no public helper can mint a qualifying APPROVED external decision from arbitrary supplied fields;
14. legitimate Research/OOS/Stress/Monte-Carlo/Economic producer-derived paths still qualify exactly where intended;
15. full lifecycle cannot reach `DEMO_ELIGIBLE` unless all mandatory external governed gates carry authentic material.

### Lane 5 — Regression/root-family audit
- targeted regression over F1-F18 + IA-R1..R5 only where changed code can affect them;
- confirm Monte Carlo threshold enforcement, recursive revalidation, canonicalization and cross-candidate isolation remain closed;
- confirm no provider/Risk/CIBO/Production authority leakage.

### Lane 6 — LSP after + docs + FULL QG
- semantic LSP after stabilization (`hover`, `findReferences`, `goToDefinition`, `goToImplementation` where supported) over new/changed public types and lifecycle consumers;
- update `docs/architecture/QORE-TRADER-LAB-001.md` with the external-evidence authenticity law and explicit `EXTERNAL_EVIDENCE_DEPENDENT` seam;
- focused normal/adversarial tests;
- canonical FULL QG;
- `git diff --check`;
- final root-family closure matrix and exact safe next action.

## Durable checkpoint law

Every material phase writes durable canonical checkpoints containing:
- PHASE;
- package_id;
- exact binding line **with no annotation**:
  `binding: START=5d25445faf57fa83410b57faf5eaf1f437949129 TREE=f9df989d7e7120d8742d4001b045fdd11cb0cb03`
- correction lane states;
- inherited predecessor evidence;
- FINDINGS;
- DECISIONS;
- EVIDENCE;
- TESTS;
- UNCERTAINTIES;
- WHAT IS COMPLETE;
- WHAT REMAINS;
- EXACT NEXT ACTION;
- SAFE RESUME instruction.

Timeout/quota/transport failure is not permission to restart. Completed Correction-003 lanes must be inherited by any recovery generation.

## Scope / blast radius

Allowed implementation families only:
- `src/qore/infrastructure/trader_lab/`
- `tests/infrastructure/trader_lab/`
- `docs/architecture/QORE-TRADER-LAB-001.md`

No unrelated source modification.

## Quality gate

Run:

```text
ruff check .
mypy src tests
pytest --cov=src/qore --cov-report=term-missing
git diff --check
```

No test weakening, skip/xfail to hide defects, `type: ignore` concealment, lint suppression, coverage gaming, authority relaxation or fabricated external evidence.

## Final disposition

Do not emit candidate ready unless the authenticity root family is actually closed and FULL QG is green.

Final report must include:
- exact START/TREE;
- predecessor patch SHA verified;
- six Correction-003 lane states;
- every local mint path found and its disposition;
- adversarial matrix;
- focused/FULL QG evidence;
- LSP before/after evidence;
- explicit external evidence-dependent seams;
- proof no Trader Lab self-certification remains;
- exact patch/diff stats;
- exact safe next action: `INDEPENDENT IA RE-ADJUDICATION`; do not dispatch Expert from inside Harness.

When genuinely complete emit literal:

`## RESUME STATE`
`COMPLETE`

`CANDIDATE_READY_FOR_EXTERNAL_QG`

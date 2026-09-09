# QORE CORE — HARNESS SUCCESSOR WORK PACKAGE

## Trader Historical Intelligence Registry — post-falsification integrity closure after Harness -006 timeout

Repository under test: `mezas3238-hue/qore-core`

Immutable baseline:
- START `e632a6bf999b22544125b1208c2fcf6475d5f5ed`
- TREE `a638f7a1af8709441a1b240002ca61f51eac7320`

This is a successor to package `HARNESS-ENGINEER-QORE-TRADER-HISTORY-POST-FALSIFICATION-INTEGRITY-CLOSURE-006`.

The prior run is NOT certified and its patch MUST NOT be treated as authority. It was cancelled by the host timeout before final engineering closure, Internal Expert, scope gate and FULL QG. Its recovery patch also contained generated `.coverage-qg` and `.coverage-qg-final` files outside the source allowlist. Reconstruct and verify the required fixes from this exact baseline; do not inherit generated artifacts.

## Mission

Close the complete causal family that makes Trader Historical Intelligence a trustworthy, evidence-authenticated, temporally causal, append-only longitudinal memory and a safe consume-only source for CIBO.

Supreme invariants:

`CERTIFIED == VERIFIED AUTHORITY-BACKED EVIDENCE, NEVER CALLER ASSERTION`

`CURRENT CAPABILITY(T) == ONLY KNOWLEDGE AUTHENTIC AND AVAILABLE AT T`

`TRADER HISTORY IS APPEND-ONLY ACROSS RECONSTRUCTION, NOT ONLY INSIDE ONE OBJECT INSTANCE`

`CIBO CAPABILITY == PROJECTION OF VERIFIED CURRENT TRADER HISTORY`

`CIBO CANNOT FABRICATE SPECIALTY, CERTIFICATION, FRESHNESS, SCOPE OR STAGE`

`CONTRADICTION != POSITIVE EVIDENCE`

`MARKET/TIMEFRAME/REGIME/SESSION SCOPE IS JOINT, NOT CARTESIAN`

`ONE TRADER IDENTITY CONVENTION / ONE CANONICAL BUILDER ACROSS TRADER LAB, REGISTRY AND CIBO`

## Original material families that must remain closed

F1 — self-asserted CERTIFIED / caller-forged provenance, metrics, authority or freshness.

F2 — temporal stage laundering/lookahead: projection at T may not consume records or certification issued after T.

F3 — contradictions disappearing at the CIBO boundary. Unresolved current certified contradictions must fail closed or remain mandatory contradictory state.

F4 — append-only bypass by aggregate reconstruction. Ledger/snapshot continuity must be externally anchorable and truncation must fail closed.

F5 — broken hypothesis/supersession causality. Strict temporal order, lineage, cycle/inversion rejection and future-invariance are required.

F6 — exact Trader/version view leaking other Traders' holdouts. Global governance and exact-lineage projection must remain separate.

F7 — caller-fabricated specialty/state/scopes/freshness and Cartesian scope laundering. Derive capability from verified evidence and model joint scopes.

F8 — Registry not governing the CIBO operational path plus identity duality (`virtual.trader.*` vs `qore.trader.*`). Use one canonical identity and Registry-governed/equivalent evidence path.

F9 — duplicate holdout content inside one study. Duplicate dataset fingerprint within the relevant study/role must fail closed.

## Additional defects discovered by Harness -006 that MUST be closed and independently re-falsified

D1 — supersession lookahead. A future-certified or non-certified superseder must never suppress certified evidence in a projection at earlier time T. All supersession filtering must honor epistemic/certification time.

D2 — joint-scope laundering. Explicit joint capability scopes may not be reconstructed by Cartesian multiplication of independent market/timeframe arrays. Multi-market x multi-timeframe ambiguity must fail closed unless explicit joint tuples exist.

D3 — ledger truncation accepted without authoritative external root. Verification of reconstructed history must require an authoritative expected root/anchor; a self-consistent truncated ledger cannot authenticate itself.

Also re-check these hardening points reported before cancellation:
- certification envelope binds authority kind/id, study content/version and issued_at;
- authority kind is compatible with study kind;
- issued_at is not before produced_at and future issuance cannot leak into earlier projection;
- CERTIFIED implies a valid certification at validation/projection time;
- superseded records do not remain active market evidence/current diff evidence;
- exact-version consumed holdouts are lineage-scoped;
- CIBO adapter validates canonical identity family and schema version;
- Lab/CIBO paths derive specialty, certification, freshness and scopes from governed evidence rather than caller assertions.

## Mandatory six engineering lanes

Use exactly six non-duplicative lanes and record semantic LSP evidence.

L1 — architecture/contracts/authority/trust roots.

L2 — F1–F9 deterministic witnesses plus benign controls.

L3 — temporal knowledge boundary, hypothesis lineage, supersession and future-invariance.

L4 — property/metamorphic/generated history exploration and truncation/reconstruction attacks.

L5 — CIBO integration, exact Trader isolation, canonical identity, joint scopes and reachable call sites.

L6 — fresh adversarial final challenger over the exact repaired candidate. If L6 finds a material defect, repair the entire causal family and run a NEW fresh L6 generation. L6 must be CLEAN after the last mutation before engineering handoff.

## Quality discipline

Use focused tests, focused Ruff/Mypy and property/metamorphic probes while engineering. The deterministic host owns the canonical repository-wide FULL QORE QG after Harness semantic/internal-audit closure. Do not spend model generations running repository-wide full coverage and do not create repository-local `.coverage*` files.

Never weaken tests, typing, Ruff, coverage policy or fail-closed semantics. No `type: ignore`, skip/xfail, exclusions or caller-trust shortcuts to make tests pass.

## Terminal acceptance

Engineering handoff is allowed only when:
- all six lanes and six subagents are complete;
- L6 is fresh and clean after the last mutation;
- no material residual family remains;
- semantic LSP evidence exists for modified/reachable symbols;
- focused validation passes;
- candidate patch contains only allowed source/test/doc paths and no generated artifacts;
- exact START/TREE binding is preserved.

Then the host must run the independent Internal Expert audit-repair and canonical FULL QORE QG. External Expert remains a later, separate falsifier and must NOT run until the Integration Authority audits a successful Harness artifact.

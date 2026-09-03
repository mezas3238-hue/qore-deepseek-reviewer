# QORE CIBO Cognitive — Expert R1 Correction-004 Root-Family Closure

## Authority and continuity

This is a CONTINUATION/CORRECTION package, not a restart. Work only from the exact frozen qore-core candidate below. Preserve and consume the Expert R1 evidence; do not redo already-closed Harness investigations except where needed to prove the newly falsified families are closed.

Frozen candidate under correction:
- PR: qore-core #486
- BASE: 9672c4d999bd5d3e6db544f349243bc6abea0363
- HEAD / START: 4fe91d7dc376bf4cab0b772236a9b61f3e6b6ef6
- TREE: f28f831109b4afb4cb8cab139b344f6b6b9f8547
- SYNTHETIC: 9403f96c6bacf7a18eaa4cae8e4bd8c5c18d8392
- Exact-head QORE CI #1852 / run 33797902351 / job 100789931471: Ruff PASS; Mypy PASS 767 source files; Pytest 5243/5243 PASS; 7 warnings; 87% coverage (51089 statements, 6863 missed).

Independent falsifier evidence:
- DeepSeek Expert package: QORE-PR486-CIBO-COGNITIVE-FINAL-DS-EXPERT-R1-001
- Expert run: 33799275958
- Expert job: 100794423546
- Expert artifact: 9911326750
- Expert artifact digest: sha256:4420f420d82c43d412fd7eb92a661fd7d66fece5a600cb76012810220813826f
- Published PR review id: 5106451447 on exact HEAD 4fe91d7dc376bf4cab0b772236a9b61f3e6b6ef6
- Expert verdict: VALIDACIÓN NO OK

The Integration Authority independently adjudicated the five material Expert findings below as valid enough to block Coder and require HEAD mutation. Your job is to reproduce each witness, close the entire causal family, add regression/property/metamorphic tests, and return one artifact-only candidate patch with durable checkpoints and a closure argument.

## Material findings to close

### D-1 — Recursive revalidation / cross-field invariant closure (S2)
Expert found that several `revalidate()` methods verify nested objects but omit constructor-level cross-field invariants after reflective corruption or store composition. Surfaces include:
- `src/qore/infrastructure/cibo_executive_deliberation.py` — deliberation revalidation can accept an inconsistent `DISAGREEMENT`/`DECISION`/synthesis state after mutation.
- `src/qore/infrastructure/cibo_executive_brain.py` — synthesis cross-field invariants.
- `src/qore/modules/cibo/cognitive_contracts.py` — epistemic claim/recommendation cross-field invariants.
- `src/qore/infrastructure/cibo_executive_memory.py` — memory item/store lineage; dangling `superseded_by` and cycles.
- `src/qore/infrastructure/cibo_executive_journal.py` — journal/loss-diagnosis cross-field invariants.
- `src/qore/infrastructure/cibo_cognitive_world_model.py` — snapshot read/trust paths must not consume corrupted nested state without revalidation/rebuild.

Required closure: constructor invariants and revalidation invariants must be semantically equivalent wherever a value can cross a trust boundary. No reflectively corrupted nested/cross-field object may survive `revalidate()`, store ingestion, replay, read model access, or binding. Explicitly test mutual supersession cycles, dangling lineage, contradictory council outcome/synthesis, and equivalent neighboring cases.

### F-1 — Deterministic timezone-invariant fingerprints (S2)
Expert reproduced equal instants with different timezone offsets yielding different fingerprints because raw `datetime.isoformat()` remains in fingerprint/logical material. Named surfaces include:
- `src/qore/infrastructure/cibo_cognitive_integration.py` around synthesis/integration fingerprint material.
- `src/qore/infrastructure/cibo_executive_deliberation.py` logical/fingerprint material.

Required closure: any timestamp that participates in logical identity/fingerprint must use canonical instant semantics (`qore.kernel.temporal.canonical_instant` or the exact project-approved equivalent). Exhaust the family across all CIBO Cognitive files in scope, not only the two witnesses. Metamorphic law: timezone-offset representations of the same instant MUST produce identical logical identity/fingerprint while genuinely different instants MUST remain distinct.

### I-1 — Unproven/fabricated content binding accepted (S2-)
`build_integrated_episode` can accept caller-fabricated `CiboIntegratedContentBinding` values (e.g. arbitrary/all-zero fingerprint) even though the module contract claims unproven fingerprints cannot enter the episode fingerprint. Replay can preserve the fabricated binding.

Required closure: only content bindings proven against their referenced record/content through a verified binding path may enter an integrated episode/replay. Do not add ambient registries or hidden global state. Preserve provider neutrality, determinism and immutable reference semantics. Test fabricated fingerprints, swapped ids/content, stale versions, valid verified bindings, replay round-trip and attempts to bypass helpers by direct construction.

### PL-1 — Goal completion without evidence (S2-)
`CognitiveGoal(status=COMPLETED)` is structurally accepted without completed tasks/evidence proving completion.

Required closure: goal completion semantics must be evidence-gated at the appropriate aggregate/trust boundary. Do not make standalone value objects depend on unavailable global context; instead ensure a completed goal cannot appear in a valid `CognitivePlan`/history if its tasks are incomplete, missing required evidence, or otherwise fail the plan's completion proof. Preserve DAG semantics and deterministic ordering. Test zero-task/zero-evidence equivalents, partial completion, blocked dependencies, multiple tasks, and valid fully-evidenced completion.

### S-1 — Secret hygiene family (S2-)
The shared detector and its call sites remain fail-open/inconsistent. Expert reproduced/identified:
- AWS ASIA temporary-access-key prefix not covered (AKIA only).
- bare `Basic <base64>` authorization not covered.
- JSON-quoted credential labels such as `"client_secret": "..."` not covered (regression relative to intended label/value semantics).
- false positive risk from overly greedy `Bearer` matching normal finance prose.
- application gaps including world-model source/version identifiers, multiple `_validate_code` helpers, and memory summary subject codes.

Required closure: structural secret detection must be fail-closed for real credential forms while avoiding naive prose false positives. Exhaust neighboring credential forms and every CIBO Cognitive string/code/ref trust boundary in the allowed scope. Detection only; never rewrite or sanitize by mutation. Add adversarial positives and negatives.

## Supporting S3 findings — fix if in the same causal family
Expert also recorded these correctness issues. They are not independently merge-blocking if truly unrelated, but because this is a root-family correction package you SHOULD close them when they belong to the same touched family and can be fixed without architectural expansion:
- C-1: zero confidence band + abstention can map inconsistently to bounded confidence / RECOMMEND with ABSTAIN_DEFER.
- P-1: PlanHistory may allow plan_id instability across revisions.
- PL-2: completion may mutate same `(plan_id, revision)` rather than creating a new revision.

If any supporting issue is intentionally deferred, provide a precise non-materiality/ownership argument and a durable follow-up record; do not silently ignore it.

## Six mandatory non-duplicative lanes
Use exactly 6 lanes and persist checkpoints/evidence for each:
1. Architecture/contracts/trust-boundary map: constructor vs revalidate vs store/replay/read paths; identify every affected call site.
2. Witness reproduction/red-team: reproduce D-1/F-1/I-1/PL-1/S-1 exactly before fixing and retain minimal deterministic witnesses.
3. Security/normalization/fingerprint lane: secret forms, timezone canonicalization, logical identity/fingerprint invariants and false positives.
4. Property/metamorphic/systematic lane: generate equivalence classes and metamorphic tests for revalidation, timezones, bindings, completion evidence and secret detection.
5. Historical/regression lane: compare Correction-001/002/003 intent/tests and prevent regression of previously closed families, especially recursive revalidation and secret-hygiene claims.
6. Implementation/LSP/integration lane: semantic references, definitions, implementations/call sites, patch integration, regression checks and final re-check.

Exactly 6/6 lane evidence is mandatory unless the Architect changes this contract. Missing lane evidence => BLOCKED.

## Semantic LSP mandate
Use semantic LSP in the primary session and record evidence for affected symbols. At minimum, where applicable:
- findReferences
- goToDefinition
- goToImplementation (or explicitly record server unsupported and use definition/references evidence)
- hover
- modified symbols and their call sites
- final post-change semantic recheck

A plain grep/read-only substitute is insufficient.

## Reasoning mandate
HIGH baseline; MAX for root-family closure, security/secret classification, cross-field invariant design, timezone identity, replay/binding semantics, contradictions and any architectural ambiguity. Record HIGH/MAX decisions in the durable reasoning/checkpoint evidence.

## Root-Family Exhaustion Gate
For each material family, prove closure beyond the original witness using bounded exhaustive enumeration, generated representatives, property/metamorphic tests, equivalence partitions, cross-combinations and historical regression witnesses as appropriate.

You must explicitly cover:
- constructor vs revalidate equivalence;
- nested reflective corruption and cross-field corruption;
- store/replay/read/binding paths;
- timezone-equivalent instants and distinct instants;
- direct-construction binding bypasses and valid proven bindings;
- completed/partial/blocked plan states and evidence combinations;
- secret true positives, neighboring provider forms, JSON/assignment encodings, URL/userinfo, authorization schemes, and false-positive prose.

## Hard architecture/safety laws
- CIBO Cognitive = HOW CIBO thinks. Do not implement CIBO Functions (#483), Trader Lab, Trader Manager or provider execution here.
- Intelligence != authority. Reasoning/recommendation/opinion != execution authority.
- No Production or real-capital authorization.
- No concrete LLM/provider dependency in semantic Core contracts.
- Exact runtime types; bool != int; no subclass laundering.
- Immutable/frozen retained state where applicable.
- Caller-supplied timezone-aware time only; no hidden now/uuid4/RNG/retry/sleep/thread/network semantic effects.
- Deterministic canonicalization/order/fingerprints.
- No global mutable registry/state.
- No secret leakage in repr/logical_values/evidence/metadata.
- No test weakening, skip/xfail hiding, type-ignore hiding, Ruff suppression, mypy weakening or coverage gaming.

## Test and closure expectations
During development use focused tests as needed. Before candidate delivery run the FULL QG exactly:
- `ruff check .`
- `mypy src tests`
- `pytest --cov=src/qore --cov-report=term-missing`

Report exact collected/passed/warnings/coverage and missing lines. Any failure => candidate not ready.

Add explicit regression/property/metamorphic tests that fail on START and pass on the corrected candidate. Preserve all previously green tests.

## Artifact-only delivery
DO NOT push/commit/merge qore-core. Produce only the Harness artifact package/patch/metadata/checkpoints required by the resilient workflow. The host/Architect owns materialization.

The final report must include:
- exact START/TREE and candidate diff paths;
- reproduction evidence for all five material findings;
- 6/6 lane evidence;
- LSP evidence;
- HIGH/MAX reasoning evidence;
- implementation summary;
- tests added and causal-family coverage;
- FULL QG exact metrics;
- any residual/deferred S3 findings with rationale;
- closure argument per family;
- final verdict exactly one of:
  - `CANDIDATE READY — EXPERT R1 MATERIAL ROOT FAMILIES EXHAUSTED`
  - `BLOCKED / FURTHER MATERIAL FAMILY FOUND`

## Continuity / resume law
Persist every meaningful discovery, witness, decision, completed unit, remaining unit, hash/binding and next action in the durable checkpoint path. If the run is interrupted, the next generation must resume from the last durable checkpoint and existing patch rather than restart from zero.

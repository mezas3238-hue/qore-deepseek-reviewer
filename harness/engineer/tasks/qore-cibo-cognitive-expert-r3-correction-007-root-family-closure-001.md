# QORE Harness Engineer — CIBO Cognitive Expert R3 Correction-007

## PACKAGE

`HARNESS-ENGINEER-QORE-CIBO-COGNITIVE-EXPERT-R3-CORRECTION-007-ROOT-FAMILY-CLOSURE-001`

## ROLE

Act as the adversarial Harness Engineer for PR #486. This is an artifact-only causal-family correction package. Do not push, commit, merge, publish, authorize Production, use real capital, or absorb CIBO Functions / Trader Lab / Risk / provider authority.

This package is NOT a restart of Cognitive, NOT a repeat of Correction-006, and NOT six isolated witness patches. The exact START already contains the accepted Correction-006 superarchitecture strengthening. Preserve all closed work and repair only the newly reopened material families plus their bounded neighboring equivalence classes.

## EXACT START BINDING

Repository: `mezas3238-hue/qore-core`
PR: `#486`
BASE: `9672c4d999bd5d3e6db544f349243bc6abea0363`
START / HEAD: `919752ebfb04750a9f60562d37e3dc7828460dc6`
START TREE: `a611e6087c19fac39cb61b4fe05a2234f2eaa0a7`
SYNTHETIC at Expert R3 freeze: `ee03f3e4e3770a9612714b9d18eb8dd6a860f926`
Synthetic parents: BASE + START
Synthetic TREE: `a611e6087c19fac39cb61b4fe05a2234f2eaa0a7`
Exact-head QORE CI: run `33832158746`, job `100897241033`
QG: Ruff PASS; mypy 775 files; pytest 5366/5366 PASS; 7 warnings; coverage 86%, 52,224 statements / 7,068 missed.

Expert R3:
- package `QORE-PR486-CIBO-COGNITIVE-FINAL-DS-EXPERT-R3-001`
- run `33832665207`
- job `100898740732`
- review id `5108976796`
- artifact `9922733539`
- artifact ZIP digest `sha256:c19348e3d32f48369d18342521a1013e2292a8593355ae8bd2bec30214d1df34`
- verdict: `HALLAZGOS: SEIS (6)` / `VALIDACIÓN NO OK`

IA independently adjudicated all six findings MATERIAL. Coder is blocked.

## PRESERVE CLOSED FAMILIES

Expert R3 explicitly re-falsified and held closed:
- I-1b source/proof root family;
- PL-1 completion evidence family;
- C-1 brain directive/uncertainty coherence;
- general D-1 pattern outside the specific `CapabilityEvidence` hole;
- F-1 canonical material/ordering core outside raw equality/dedup semantics;
- scenario core;
- metacognition core;
- CA-01..CA-18 provider-neutral cognitive architecture and ownership boundaries.

Do not reopen or redesign those families unless your correction produces a deterministic contradiction or regression witness.

## SIX IA-ACCEPTED MATERIAL ROOT FAMILIES

### R3-F1 — COUNCIL-FIREWALL / decision-side uncertainty asymmetry — MODERATE

Location family: `src/qore/infrastructure/cibo_executive_deliberation.py`.

Reproduced defect: a `CiboExecutiveDeliberation` with `outcome=DECISION` may retain a `CiboCouncilSynthesis` whose `uncertainty.kind` is an abstention/non-decision kind such as `INSUFFICIENT_EVIDENCE`. `CiboCouncilSynthesis` validates the uncertainty object but not decision↔uncertainty coherence. This contradicts the stricter recommendation/brain boundary and permits fake decision consensus.

Required closure:
- define/reuse one canonical coherence rule for Council decision carriers;
- `DECISION` must reject abstention / insufficient-evidence / unresolved-contradiction / defer-style uncertainty kinds;
- non-decision outcomes must continue to reject fake bounded-confidence decision semantics;
- constructor and `revalidate()` must agree;
- end-to-end council -> integration episode -> replay must preserve the invariant;
- add property/matrix tests, not one witness only.

### R3-F2 — S-1 secret hygiene residual — MODERATE

Location family: `src/qore/modules/cibo/cognitive_contracts.py` plus all consumers.

Reproduced defects:
1. zero-width / format characters can split credential labels or delimiters and fail open (`U+200B`, `U+200C`, `U+200D`, `U+2060`, `U+FEFF`);
2. compound `aws_secret_access_key` / `AWS_SECRET_ACCESS_KEY` assignment is not structurally detected;
3. benign prose can be rejected greedily, including examples analogous to `Basic 2008 outlook was bearish` and `authorization: OAuth2 flow`.

Required closure:
- detection-only skeleton must neutralize or route relevant `Cf`/zero-width separators without mutating persisted text;
- structurally detect AWS secret-access-key assignment/value forms;
- preserve AKIA/ASIA key-id detection and existing token families;
- tighten Basic / colon-assignment discriminators so benign financial/technical prose remains admissible;
- test normalization, confusables, Unicode separators, assignment forms, false negatives AND false positives;
- cover downstream safe-text boundaries and logical projections.

Do not solve by blanket rejection of arbitrary Unicode or ordinary prose.

### R3-F3 — D-1 `CapabilityEvidence` content-fingerprint revalidation hole — MODERATE-HIGH

Location: `src/qore/infrastructure/cibo_cognitive_evaluation.py`.

Reproduced defect: `CapabilityEvidence.revalidate()` validates fingerprint type/format but does not recompute and compare it to current logical source content. Reflective mutation of content can therefore be silently recertified and then accepted by attribution paths.

Required closure:
- make the fingerprint derivation explicit and canonical;
- recompute-and-compare during `revalidate()` against all semantically fingerprinted fields;
- constructor and revalidation must be equivalent;
- attack reference/capability/outcome/kind/timestamp mutation and nested/retained attribution paths;
- preserve no-hindsight semantics and exact runtime-type boundaries.

### R3-F4 — F-1 canonical-instant equality/dedup residual — MODERATE

Locations include:
- `cibo_cognitive_hypotheses.py` `HypothesisEvidence` / `_canonical_evidence`;
- `cibo_cognitive_causality.py` `CausalEvidence` and analogous temporal value objects;
- `cibo_cognitive_world_model.py` contradiction/evidence equality where relevant.

Reproduced defect: dataclass equality/hash/dedup uses raw aware-`datetime` equality rather than canonical instant semantics. DST `fold` and equivalent-offset representations can therefore disagree with the canonical fingerprint/order semantics, allowing duplicate semantic evidence or collapsing distinct instants.

Required closure:
- same logical instant under different valid timezone representations must compare/dedup identically where time is semantic;
- genuinely different DST-fold instants must remain distinct;
- choose a coherent design: canonicalize stored instant at construction OR implement semantic equality/hash/dedup over canonical instant; do not mix incompatible notions;
- audit every Cognitive equality/set/dedup path involving timestamps;
- preserve deterministic ordering and fingerprints;
- add property/metamorphic timezone/offset/fold tests.

### R3-F5 — HYPOTHESIS-LIFECYCLE governance too weak — MODERATE

Location: `src/qore/infrastructure/cibo_cognitive_hypotheses.py` and directly coupled causal links only where necessary.

Reproduced defects:
- `REFUTED -> REVISED` can occur without meaningful new evidence/change;
- `reason_code` is validated and then discarded instead of becoming durable audited state;
- a hypothesis may be resurrected through REVISED/ACTIVE and reach CONFIRMED from a single favorable support observation;
- CONFIRMED currently allows `evidence_for OR tests`, violating the hard law `CONFIRMATION != FAVORABLE OUTCOME`.

Required closure:
- revision justification must be retained, fingerprinted, replayable and revalidated;
- leaving REFUTED must require a governed revision with material new evidence/change, not a ceremonial transition;
- CONFIRMED must require governed test/prediction evidence sufficient to distinguish confirmation from favorable observation;
- evidence for/against/contradictions/tests and history must not be silently erased;
- refutation, revision, inconclusive, supersession and archive history must remain durable;
- property-test lifecycle transition matrices and resurrection attempts.

Adjacent Expert note about causal-transition governance / caller-declared `confounders_addressed` was not independently material in R3. Inspect it as a neighboring equivalence class; change it only if you produce a deterministic material witness.

### R3-F6 — CONSTRUCTOR-CANONICAL-INEQUIVALENCE — MODERATE

Locations include builders for:
- hypothesis;
- causal claim;
- scenario;
- metacognitive audit;
- any same-pattern strengthened capability discovered by LSP/property search.

Reproduced defect: builders compute fingerprints over raw caller sequence order, while object revalidation canonicalizes/sorts and then compares against canonical logical content. Valid permuted inputs can therefore fail construction and fingerprints can encode caller permutation rather than canonical semantics.

Required closure:
- canonicalize every semantically unordered sequence before fingerprint derivation;
- constructor-validity and `revalidate()` must be equivalent;
- all permutations of the same semantic input must produce the same canonical state/fingerprint;
- genuinely different multisets/content must differ;
- reject duplicates where contract requires uniqueness;
- use one shared/helper pattern where that reduces divergence without overcoupling modules.

## REQUIRED SIX LANES — EXACTLY 6/6

L1 — Architecture/contracts/trust boundaries
- Council decision coherence, D-1 trust semantics, constructor/revalidation equivalence;
- verify no new authority leakage or Functions/Trader Lab/Risk scope absorption.

L2 — Witness reproduction / adversarial red-team
- reproduce all six R3 findings before implementation;
- after implementation rerun every original witness plus neighboring equivalents;
- explicitly distinguish REPRODUCED / REJECTED with evidence.

L3 — Security / Unicode / normalization / temporal
- exhaust S-1 Unicode/Cf/confusable/false-positive family;
- exhaust F-1 timezone/offset/fold equality/dedup family.

L4 — Property / metamorphic / systematic
- sequence permutation equivalence for F6;
- lifecycle transition matrices and resurrection attempts for F5;
- Council uncertainty/outcome matrix;
- fingerprint corruption and mutation properties.

L5 — Historical regression / prior closures
- preserve Correction-004/005/006 and Expert R3-closed I-1b, PL-1, C-1, scenario/metacognition, CA-01..18;
- no documentation overclaim;
- no unrelated Program-D/Functions/Trader edits.

L6 — Implementation impact / semantic LSP / integration
- semantic LSP before and after: findReferences, goToDefinition, goToImplementation where applicable, hover, call sites, modified symbols;
- end-to-end Council/integration/replay; hypothesis persistence; evaluation attribution; serialization/logical-values/fingerprint impact;
- final changed-path/diff audit and FULL QG.

Failure to provide evidence for all 6/6 lanes => BLOCKED.

## REASONING

HIGH baseline. MAX mandatory for:
- Unicode/normalization/secret ambiguity;
- datetime fold/offset/equality semantics;
- trust/fingerprint corruption;
- lifecycle closure and contradictory invariants;
- final Root-Family Exhaustion decision.

Record adaptive HIGH/MAX evidence.

## ROOT-FAMILY EXHAUSTION GATE

Do not declare readiness after original witnesses pass. For each material family cover bounded equivalence classes, transforms, cross-combinations, false positives, false negatives, retained-state corruption, constructor/revalidation parity, replay/determinism and historical regressions.

Use exhaustive enumeration where bounded, property/metamorphic generation, representative partitions and cross-combination where appropriate.

## FULL QUALITY GATE

Mandatory on final artifact candidate:
- `git diff --check`
- `ruff check .`
- `mypy src tests`
- `pytest --cov=src/qore --cov-report=term-missing`

No test weakening, skip/xfail hiding, `type: ignore`, Ruff suppression, mypy relaxation, coverage exclusion or other gate weakening.

## ARTIFACT-ONLY OUTPUT

No push/commit/merge to qore-core. Deliver patch + metadata + hashes + lane evidence + LSP evidence + reasoning audit + witness ledger + Root-Family Exhaustion report + FULL QG results + durable checkpoint with exact completed/remaining state.

Final semantic verdict must be exactly one of:
- `CANDIDATE READY — EXPERT R3 ROOT FAMILIES EXHAUSTED`
- `BLOCKED / FURTHER MATERIAL FAMILY FOUND`

If interrupted, resume from the latest durable checkpoint. Do not redo completed lanes. Preserve package/binding/evidence continuity.

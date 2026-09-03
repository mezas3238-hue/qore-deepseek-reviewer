# HARNESS ENGINEER — QORE CIBO COGNITIVE SUPERARCHITECTURE — FINAL CLOSURE CORRECTION 003 / RESIDUAL ROOT-FAMILY EXHAUSTION

## PACKAGE
`HARNESS-ENGINEER-QORE-CIBO-COGNITIVE-SUPERARCHITECTURE-001-FINAL-CLOSURE-CORRECTION-003-RESIDUAL-ROOT-FAMILY-EXHAUSTION-001`

## EXECUTIVE DIRECTIVE
CIBO Cognitive #482 remains the ONLY active QORE engineering line. This is the final bounded continuation needed before external review. Do NOT restart Batch 006, Batch 008, Correction-001, or Correction-002. Recover the exact successful Correction-002 artifact first, preserve every valid edit, and work only on the residual root families independently adjudicated as material to #482 closure.

Correction-002 itself succeeded end-to-end: six lanes complete, scope gate PASS, FULL QG PASS (ruff / mypy / pytest 5131 / diff-check), LSP-after PASS, and it closed:
- IA-COG-FINAL-001 reverse Cognitive -> Functions dependency;
- IA-COG-FINAL-002 exact-runtime/subclass laundering family;
- IA-COG-FINAL-003 initial integrated seam existence;
- IA-F-MARKET-TRADER-001;
- IA-F-INTERVENTION-ATTRIBUTION-001.

Preserve those closures. Do not reconstruct them.

## IMMUTABLE QORE-CORE BINDING
- START: `262285ca8a0a3cd4c4c196f73249971514278774`
- TREE: `24a7423bb25bbd4096fd8af5004ddd0877fe4829`
- PR context: qore-core #486
- Current PR descendant `7bbec2a8add53745b27acd72bd9bf47fc71d3400` contains only an import-order follow-up and currently has failing exact-head CI. Harness remains artifact-only and MUST work from exact START + recovered Correction-002 patch. Final materialization/exact-head CI occurs after this artifact is adjudicated.

## MANDATORY RECOVERY SOURCE
Correction-002 run: `33783018125`
Artifact id: `9906542838`
Artifact digest: `sha256:3247359740b5b3f12108f0f4c48961c75051766e7362b19eb37ff0a403e59bc1`
Exact uploaded `harness-engineer-candidate.patch` SHA-256: `fd6c49c48bd626d78f62a852be6c5f1b9a0614939cf1ff0e6d8acd78445fcf0e`

Host MUST restore and byte-verify this patch before API spend. The recovered candidate is inherited work. Never reset/discard/recreate it.

## WHY THIS CORRECTION EXISTS — INDEPENDENT IA ADJUDICATION
Harness Correction-002 emitted `CANDIDATE READY`, but its own L4/L5 agents also produced probe-confirmed residual findings that fall directly under the hard laws and CA ledger of #482. `OUT OF NAMED PACKAGE SCOPE` is NOT equivalent to `OUT OF CIBO COGNITIVE CLOSURE SCOPE`.

Issue #482 explicitly requires the final Cognitive Integration Gate to reconcile Batch006 + Batch008, independently falsify CA-01..CA-18 and hard authority/security/determinism laws before freeze. Therefore the following residuals must be closed or independently disproved with concrete evidence before CIBO Cognitive can be CLEAN.

## MATERIAL ROOT FAMILIES TO EXHAUST

### IA-COG-FINAL-004 — SECRET-HYGIENE UNIFICATION / FAIL-CLOSED FREE TEXT
L5 runtime probes confirmed Batch006 surfaces use a weaker `_SENSITIVE_PARTS` detector than Batch008 `contains_secret_material`, allowing secret patterns such as OpenAI-style `sk-...`, AWS `AKIA...`, GitHub `ghp_...`, Slack `xox...`, JWT-like material and URL userinfo credentials through validated cognitive strings.

Affected responsibility includes at least:
- `CiboFormalRecommendation.summary`;
- `CiboMemoryItem.content`;
- `CiboMemorySourceRef.value`;
- `CiboCouncilSynthesis.summary`;
- `CiboCognitiveEvidenceRef.value`;
- any equivalent Batch006 cognitive free-text/reference surface discovered by semantic search.

Requirements:
1. one coherent provider-neutral secret-detection semantic standard across Batch006/Batch008 without introducing dependency inversion or import cycles;
2. reject secret-bearing material at construction AND recursive revalidation;
3. no secret in repr/logical_values/evidence/fingerprint inputs prior to hashing/sanitization;
4. adversarial witnesses for sk-/AKIA/ghp_/xox/JWT/URL-userinfo/client_secret/bearer/auth headers and reflective mutation;
5. avoid naïve substring rules that create obvious false positives; document chosen boundary semantics.

### IA-COG-FINAL-005 — CONSTRUCTOR-BOUNDARY RECURSIVE REVALIDATION
L5 probes confirmed two fail-open constructor boundaries:
- `CiboExecutiveBrain.synthesize` can return `Success` embedding a reflectively-corrupted nested recommendation/evidence child;
- `CiboExecutiveDeliberation(...)` can construct with a reflectively-corrupted participant and only fails on a later explicit `.revalidate()`.

Requirements:
1. every externally supplied nested material entering Brain/Deliberation/Synthesis trust boundaries is recursively revalidated before a successful object can escape;
2. corrupted nested evidence refs, participant codes, synthesis material, uncertainty/confidence and similar VOs fail at construction/factory boundary;
3. preserve exact runtime type discipline and frozen/slotted semantics;
4. no duplicate validation architecture if an existing `revalidate()` contract can be reused;
5. adversarial reflective-corruption tests prove fail-closed behavior before success return/construction completes.

### IA-COG-FINAL-006 — INTEGRATION SEAM SEMANTIC COMPLETENESS / CA-01..CA-18
L4 found concrete pre-existing gaps in `cibo_cognitive_integration.py`. Adjudicate each one against #482; fix every material item and explicitly prove any non-material item is a false positive or intentionally represented elsewhere with replayable evidence.

At minimum address:
1. `replay_fingerprint` is currently a fabricable/dangling field: replay ignores it. Remove it or bind it to a verifiable replay identity/fingerprint invariant. No unproven replay reference may enter the episode fingerprint.
2. bare `evaluation_ref`, `world_snapshot_id`, and `synthesis_ref` UUID-only links lack content/version fingerprint binding. Replace/augment with exact immutable identity+fingerprint bindings where required so swapped content/version cannot launder through the integration gate.
3. `DISAGREEMENT` / `NO_DECISION` / `BLOCKED` must not coexist with a semantically contradictory `BOUNDED_CONFIDENCE` state. Preserve disagreement; never manufacture consensus/confidence.
4. `bind_uncertainty_kind` currently reaches only 2 of 6 `CiboUncertaintyKind` states and ignores `confidence_band`. Preserve `UNRESOLVED_CONTRADICTION`, `COMPETING_HYPOTHESES`, `INSUFFICIENT_EVIDENCE`, `MORE_EVIDENCE_REQUESTED`, `ABSTAIN_DEFER`, `BOUNDED_CONFIDENCE` when source semantics warrant them. No lossy collapse.
5. rich `CiboUncertainty` / `CiboConfidence` nested semantics must be recursively revalidated at the integration boundary where they are carried/referenced.
6. canonical ordering/dedup/fingerprint stability for every new binding family (world/synthesis/evaluation/replay/suitability/attribution/plan/tool/etc.) used by the integration episode.
7. eliminate or prove safe the double-construction hazard in `build_integrated_episode`; no field may be silently dropped between first and second construction.
8. version/fingerprint evolution must be intentional and fail closed; document fingerprint schema/version boundary if logical_values shape changes.
9. prove CA-10 Planning, CA-12 Tool orchestration, CA-16 Replay/Audit, CA-07 disagreement and CA-09 uncertainty are actually represented in the integrated replayable cognition. L4 noted Journal/Planning absent and Tools represented only by FacultyId; add the smallest typed reference/fingerprint bindings necessary rather than inlining business authority.
10. same canonical cognitive episode input must yield same fingerprint/replay view; changed referenced content/version must change or invalidate the binding deterministically.

### IA-COG-FINAL-007 — GLOBAL MUTABILITY / CANONICAL MATERIAL TRUST BOUNDARY
L5 additionally flagged two hard-law risks inside Cognitive ownership:
- module-level mutable `_DEPTH_TO_MODE` dictionary in integration;
- `canonical_material` accepting arbitrary objects merely because they expose callable `logical_values`, allowing hostile/nondeterministic material into tool/fingerprint paths if reachable.

Requirements:
1. no global mutable registry/state; use immutable mapping/value construction or an equivalent deterministic design;
2. audit actual reachability of arbitrary `logical_values` objects through ToolInput/fingerprint boundaries;
3. if reachable, constrain to sanctioned immutable/revalidated cognitive material or otherwise canonicalize through an explicit safe protocol that cannot inject nondeterminism/secrets;
4. if independently proven unreachable, document the proof and add a regression witness preventing future reachability;
5. adversarial object with nondeterministic/secret-bearing `logical_values` must not be accepted as trusted canonical cognitive material.

### OUT-OF-OWNERSHIP FINDING — DO NOT MODIFY HERE
L5 also noted `qore/modules/cibo/contracts.py` uses permissive `isinstance` in `ReviewFunctionalDecisionCommand`. That is Functions/authority-adjacent ownership, not #482 Cognitive. Do NOT modify it in this package. Record it as a routed finding for #483 only if still reproducible. No scope leakage.

## SIX-LANE CONTRACT — EXACTLY 6 LANES
Use exactly six non-duplicative subagent lanes. Harness primary integrates. Persist checkpoints continuously.

### L1 — Recovery + semantic LSP + exact dependency/reachability graph
- verify START/TREE/recovery patch;
- semantic LSP before on all affected symbols and callers;
- reconstruct exact trust boundaries and call graph;
- preserve IA-COG-FINAL-001/002/003 + MarketTrader + Attribution closures;
- prove no Cognitive -> Functions/Trader Manager/Trader Lab/provider implementation dependency.

### L2 — Secret hygiene red team
- reproduce all L5 secret patterns;
- design/implement unified fail-closed Cognitive secret semantics without cycle/reverse dependency;
- recursive corruption + repr/logical_values/fingerprint witnesses;
- false-positive sanity tests.

### L3 — Recursive constructor-boundary red team
- reproduce Brain/Deliberation fail-open construction;
- harden exact nested revalidation before success/escape;
- subclass/bool/datetime/UUID/value-object and reflective corruption witnesses;
- audit sibling constructor boundaries for the same root cause and fix only same-family defects.

### L4 — Integration seam CA completeness red team
- exhaust the 10 integration requirements above;
- preserve disagreement and all uncertainty semantics;
- exact identity+fingerprint bindings for replay/world/synthesis/evaluation plus minimum plan/tool/journal/evidence references required for CA replay completeness;
- no business execution/Risk/promotion authority.

### L5 — Determinism / mutable-state / canonical-material red team
- remove global mutable cognitive mapping/state;
- prove canonical-material trust boundary safe against arbitrary hostile logical_values;
- permutation invariance, duplicate rejection, schema/version/fingerprint determinism;
- no hidden clocks/RNG/network/retry/sleep/thread/scheduler.

### L6 — CA-01..CA-18 final closure / root-family exhaustion / docs / regression
- independently map all CA-01..CA-18 to concrete implementation/tests after corrections;
- specifically falsify CA-07, CA-09, CA-10, CA-12, CA-16 and hard laws 17/20/21;
- update architecture docs and closure ledger;
- LSP-after;
- focused/adversarial suites;
- FULL QG;
- report any genuinely remaining material family as BLOCKED instead of relabeling it out of scope.

## MANDATORY ADVERSARIAL WITNESSES
At minimum prove:
- every listed secret pattern is rejected on all relevant cognitive free-text/reference surfaces;
- reflective mutation of nested evidence/participant/uncertainty/recommendation fails before Brain/Deliberation success;
- fake/dangling replay fingerprint rejected;
- swapped world/synthesis/evaluation content with same UUID but wrong fingerprint rejected;
- DISAGREEMENT / NO_DECISION / BLOCKED cannot collapse to bounded confidence or synthesized consensus;
- all six uncertainty kinds can be preserved/reached when source semantics justify them; zero-confidence/non-abstention cannot become positive confidence by default;
- plan/tool/journal/evaluation/world/replay bindings are replayable and deterministically fingerprint-bound where CA requires them;
- duplicate/permuted binding inputs canonicalize deterministically or reject duplicates;
- field omission through builder reconstruction is impossible;
- mutable global mapping mutation cannot alter semantic behavior;
- hostile object exposing `logical_values` cannot inject nondeterministic or secret material;
- no new authority fields or imports for Risk/promotion/DEMO/order/provider/account/Production/real-capital;
- existing MarketTrader and InterventionAttribution adversarial families remain green.

## REQUIRED OUTPUT
Final artifact must contain:
1. exact START/TREE + recovery artifact/patch verification;
2. six lanes = 6/6 COMPLETE or MATERIAL_BLOCKED;
3. exact reproduction/disposition for IA-COG-FINAL-004/005/006/007;
4. disposition of every L4 numbered integration residual (1-12), even if some are proven non-material;
5. exact list of secret patterns and constructor probes before/after;
6. semantic LSP before/after evidence;
7. changed-file/diff audit;
8. CA-01..CA-18 closure ledger with concrete code/test witnesses;
9. FULL QG results;
10. durable resume/checkpoint state;
11. one final verdict only:
   - `CANDIDATE READY — CIBO COGNITIVE ROOT FAMILIES EXHAUSTED`
   - `BLOCKED — MATERIAL COGNITIVE FAMILY REMAINS`.

## FULL QG — MANDATORY
- `ruff check .`
- `mypy src tests`
- `pytest --cov=src/qore --cov-report=term-missing`
- `git diff --check`

No weakening, no unjustified skip/xfail, no defect-hiding type:ignore/noqa, no coverage gaming.

## AUTHORITY BOUNDARY
Artifact-only. No qore-core commit/push/merge. No provider secrets. No Production accounts/capital/orders. No real autonomous execution. Risk remains independent and non-bypassable. Cognitive output remains advisory/governed.

No Claude.

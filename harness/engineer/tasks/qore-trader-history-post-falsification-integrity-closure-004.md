# QORE CORE — HARNESS ENGINEER POST-FALSIFICATION CLOSURE

## Package

`HARNESS-ENGINEER-QORE-TRADER-HISTORY-POST-FALSIFICATION-INTEGRITY-CLOSURE-004`

Repository under repair: `mezas3238-hue/qore-core`

Operational PR: `#500`

Exact starting commit:

`e632a6bf999b22544125b1208c2fcf6475d5f5ed`

Exact starting TREE:

`a638f7a1af8709441a1b240002ca61f51eac7320`

This package is a successor repair after an independent Work falsification of the already integrated Trader Historical Intelligence Registry. GitHub live state is the source of truth. If the binding differs, fail closed before model spend.

---

# 1. MISSION

Repair the Trader Historical Intelligence Registry so that it becomes a trustworthy, evidence-authenticated, temporally causal, append-only longitudinal memory and a safe consume-only source for CIBO.

Do NOT patch the nine witnesses independently. Exhaust the causal families that made them possible.

The post-repair invariants are:

`CERTIFIED == VERIFIED AUTHORITY-BACKED EVIDENCE, NEVER CALLER ASSERTION`

`CURRENT CAPABILITY(T) == ONLY KNOWLEDGE AUTHENTIC AND AVAILABLE AT T`

`TRADER HISTORY IS APPEND-ONLY ACROSS RECONSTRUCTION, NOT ONLY INSIDE ONE OBJECT INSTANCE`

`CIBO CAPABILITY == PROJECTION OF VERIFIED CURRENT TRADER HISTORY`

`CIBO CANNOT FABRICATE SPECIALTY, CERTIFICATION, FRESHNESS, SCOPE OR STAGE`

`CONTRADICTION != POSITIVE EVIDENCE`

`MARKET/TIMEFRAME/REGIME/SESSION SCOPE IS JOINT, NOT CARTESIAN`

`ONE TRADER IDENTITY CONVENTION / ONE CANONICAL BUILDER ACROSS TRADER LAB, REGISTRY AND CIBO`

No LIVE, Production, real-capital, broker-write, Risk bypass or automatic DEMO authority may be introduced.

---

# 2. FALSIFICATION FINDINGS TO REPRODUCE FIRST

Treat all findings below as material until disproven with a concrete witness reproduction.

## F1 — CRITICAL — self-asserted CERTIFIED

Current `TraderHistoryStudyRecord` accepts a caller-provided `epistemic_status=CERTIFIED`, producer string, arbitrary sanitized evidence refs, arbitrary metrics and syntactically valid partitions. A recomputed record fingerprint proves only self-consistency, not authenticity.

Known witness family:

- evidence named as VT-01-exclusive can be attached to VT-08;
- arbitrary expectancy such as `99.00` can become CIBO economic evidence;
- producer can be caller-declared `trader-lab`;
- no proof field currently authenticates issuer/source/candidate/dataset/time.

Required closure:

1. A certified record MUST carry a verifiable authority/evidence binding.
2. Reuse existing governed Trader Lab evidence/proof contracts where semantically applicable rather than creating a parallel fake authority system.
3. Verification must bind at minimum:
   - exact Trader code/version/config/methodology/software identity;
   - exact source study/evidence identity and digest;
   - producer/authority identity and authority kind;
   - relevant candidate/strategy binding;
   - dataset/partition provenance where applicable;
   - production/certification timestamp;
   - study fingerprint/content being certified.
4. `CERTIFIED` must not be constructible or ingestible without verification at the Registry trust boundary.
5. OBSERVED/INFERRED/HYPOTHESIS research may remain non-authoritative but can never project to CIBO as certified capability.
6. A sanitized opaque reference alone is never authenticity proof.

Do not simulate cryptographic trust if QORE already has governed proof primitives. Prefer exact composition with `TraderLabGovernedAuthenticityProof`, verified stage evidence, source reference digests and owning authorities where applicable.

## F2 — CRITICAL — temporal stage laundering / lookahead

Current `project_current_capability(... derived_at=T)` filters records by `produced_at <= T`, but `_stages_for_evidence_ref()` later scans the entire raw registry and can attach stages from future studies reusing the same evidence ref.

Known witness:

- replay ref existing at T;
- future OOS/STRESS/MC/ECONOMIC/RISK records reuse it;
- CIBO at T receives future stages and can reach promotion recommendation.

Required closure:

1. Stage provenance must be produced directly from the temporally valid current-view source set.
2. Never re-scan unbounded future registry state to resolve a current capability.
3. Preserve complete provenance for each projected claim: source study id/version/kind, produced_at, proof/evidence binding and supersession state.
4. If equal metric values merge across studies, do not collapse their provenance to one `first.source_study`; preserve all contributing sources deterministically.
5. Future records must have zero effect on any projection at T, including stage labels, contradiction state, scope and freshness.

## F3 — CRITICAL — contradictions disappear at CIBO boundary

Registry current view retains `TraderHistoryContradiction`, but `project_cibo_capability_profile()` ignores `view.contradictions`.

Known witness:

- two current certified values for expectancy in same scope, e.g. `-0.30` and `0.20`;
- contradiction present in Registry;
- profile exposes no mandatory contradiction state;
- CIBO can recommend promotion from unrelated positive metrics.

Required closure:

1. Unresolved current certified contradictions that are material to capability/review must fail closed at the CIBO projection/review boundary OR be represented in a mandatory contradictory state that the development review treats as blocking.
2. Do not silently delete contradictory metric codes and proceed as if evidence were clean.
3. Contradiction handling must be scope-aware and deterministic.
4. Add adversarial tests where unrelated positive metrics cannot hide a critical contradiction.

## F4 — HIGH — append-only bypass by aggregate reconstruction

Current immutable dataclass protects `append_study()` inside one object instance, but public reconstruction with a subset of records erases prior history and resets holdout governance.

Known witness:

- append path rejects holdout reuse;
- reconstruct a fresh registry containing only the second study;
- reuse becomes accepted;
- no predecessor/root/ledger binding exists.

Required closure:

1. Distinguish immutable value object from authoritative append-only ledger.
2. Introduce a verifiable ledger/snapshot/event-chain boundary such that authoritative reconstruction proves continuity from genesis or an accepted predecessor/root.
3. A runtime consumer (especially CIBO) must not accept an arbitrary caller-constructed truncated aggregate as authoritative history.
4. Use deterministic chain/root hashing and predecessor binding; if an owning durable storage abstraction already exists, compose it rather than duplicating it.
5. A trusted reconstruction API must validate chain continuity and record fingerprints/proofs.
6. If durable persistence implementation remains external, fail closed at runtime and expose an explicit interface/verified snapshot contract; tests may use deterministic verified in-memory fixtures. Do not pretend an untrusted tuple is durable append-only state.

## F5 — HIGH — broken hypothesis and supersession causality

Known witnesses:

- confirmation/falsification produced before parent hypothesis is accepted;
- equal timestamp is accepted despite causal ambiguity;
- old study can supersede a future study;
- current `_check_hypothesis_lineage` does not compare timestamps;
- `_check_supersedes` checks existence/self only and does not enforce temporal order, lineage, cycles or authority.

Required closure:

1. hypothesis verdict `produced_at` must be strictly later than hypothesis parent `produced_at`.
2. verdict must preserve same trader lineage and bind the intended successor version/change.
3. confirmation holdout must be fresh according to the authoritative lineage ledger.
4. superseder must be strictly later than target.
5. supersession must remain within semantically valid lineage/scope; define exact rule and document it.
6. detect and reject cycles/transitive causal inversions.
7. future supersession must not alter historical view at T.
8. property/metamorphic tests over timestamp permutations are mandatory.

## F6 — HIGH — exact Trader view leaks other Traders' holdouts

`project_current_capability()` currently calls global `consumed_holdouts(registry)`.

Known first-cohort family: every exact Trader view can receive holdouts from VT-01/08/09/17/31.

Required closure:

1. Separate global governance queries from exact-version/lineage projection.
2. `TraderHistoryCurrentView` for exact Trader/version exposes only holdouts relevant to the requested lineage/version according to the documented model.
3. Global ledger inspection may remain available under a distinctly named API, never mislabeled as exact-Trader current capability.

## F7 — HIGH — caller-fabricated specialty/state/scopes/freshness

Current adapter receives caller supplied:

- specialty;
- qualified_markets;
- qualified_timeframes;
- certification_state;
- freshness.state;
- limitations.

It also validates markets and timeframes independently, allowing cartesian laundering: evidence for `(EURUSD,H1)` and `(GBPUSD,M15)` can produce a profile that implies unsupported `(EURUSD,M15)` and `(GBPUSD,H1)` combinations.

Required closure:

1. Derive specialty from exact frozen methodology/identity evidence, never arbitrary caller text.
2. Derive CIBO certification/recommendation state from verified history/governed review, not caller enum.
3. Derive freshness state from current verified evidence and `as_of` policy; caller may supply query time but not declare itself CURRENT.
4. Model qualification as joint scope tuples containing at least market+timeframe and, where evidence has them, regime/session/side/condition.
5. Do not project cartesian combinations absent from certified source records.
6. limitations must be evidence-derived or explicitly marked non-authoritative advisory input that cannot expand capability.
7. No empty/no-evidence profile may claim `PROMOTION_RECOMMENDED` or an arbitrary specialty.

If existing `CiboTraderCapabilityProfile` cannot represent joint scopes or contradiction state safely, extend it minimally and migrate relevant consumers/tests rather than laundering joint evidence into independent arrays.

## F8 — HIGH — Registry is not the runtime CIBO gate + identity duality

Confirmed current operational path:

`trader_lab/cohort_authority.py -> review_trader_lab_candidate_cibo() -> build_cibo_profile_from_trader_lab()`

This bypasses the Registry.

Also confirmed dual identity conventions:

- Registry adapter currently expects `virtual.trader.<vt>`;
- `cibo_trader_lab_authority._identity()` constructs `qore.trader.<vt>`;
- other CIBO tests historically use `virtual.trader.<vt>`.

Required closure:

1. Establish ONE canonical exact Trader research/CIBO identity builder/contract shared by Trader Lab, Registry and CIBO.
2. Do not hard-code a choice merely to satisfy current tests. Audit all definitions/references/callers, choose the architecturally correct canonical identity, migrate every affected caller consistently and document it.
3. The operational CIBO review path must consume the verified Registry/current capability (or a verified Registry projection produced from the exact governed Trader Lab lifecycle) rather than construct a parallel capability profile directly.
4. There must be no alternate runtime path that can manufacture an equivalent CIBO capability profile from caller-supplied stage/scope/identity data while bypassing Registry evidence governance.
5. Preserve ownership: Trader Lab owns stage qualification; Registry owns longitudinal memory/current evidence projection; CIBO consumes but does not manufacture either.
6. Risk and DEMO eligibility remain independent and non-bypassable.

Use semantic LSP `findReferences` on:

- `project_cibo_capability_profile`
- `build_cibo_profile_from_trader_lab`
- `review_trader_lab_candidate_cibo`
- `CiboTraderCapabilityProfile`
- `ResearchDecisionEvaluatorIdentity`
- the new canonical identity builder

and inspect all reachable production call sites.

## F9 — MEDIUM — duplicate holdout content inside one study

Current partition canonicalization rejects exact duplicate partition objects but allows two different partition IDs carrying the same dataset fingerprint + EXTERNAL_VALIDATION role inside one study.

Required closure:

1. Within a study, identical dataset content cannot be presented multiple times as distinct holdout partitions unless the model explicitly represents disjoint subpartitions with cryptographically distinct content fingerprints and parent provenance.
2. For current contracts, duplicate `dataset_fingerprint` within the same study/role should fail closed.
3. Add property tests over different UUIDs with same content fingerprint.

---

# 3. ROOT CAUSAL FAMILIES

Do not finish until these families, not only the witnesses, are exhausted.

## Family A — Authenticity / authority / provenance

Explore arbitrary producer IDs, refs from another Trader, copied refs, digest collision assumptions, stale proofs, wrong candidate bindings, wrong stage authority, correct-looking but unverified `CERTIFIED`, serialization/reconstruction, forged certification state and proof replay across versions.

## Family B — Temporal knowledge boundary

Explore future produced_at, future supersession, future stage reuse, equal timestamps, timezone-equivalent timestamps, order permutations, historical queries before/at/after each event, contradiction appearing in future, proof issued after query time, and freshness derived from future state.

## Family C — Ledger continuity / append-only reconstruction

Explore subset reconstruction, prefix truncation, event reordering, forked histories, missing predecessor, wrong root, same records under different chain order, idempotent replay, restart/reload and deterministic snapshot verification.

## Family D — Exact Trader/version isolation

Explore five current Traders and additional catalog Traders, same config across codes, same methodology across codes, new software revision, new methodology, predecessor/successor versions, identity normalization variants, wrong CIBO family and evidence references copied cross-Trader.

## Family E — Scope semantics

Explore market/timeframe cross products, regime/session/side/condition combinations, partial scopes, superseded scope evidence, contradictions localized to one scope, same metric across multiple valid scopes, and prevention of extrapolation.

## Family F — CIBO consume-only runtime wiring

Explore every current CIBO profile creation path. There must be a single governed route for evidence-backed Trader capability in the relevant Trader Lab/CIBO flow. Verify that no bypass remains through direct `build_cibo_trader_capability_profile` calls in operational paths that should be Registry-governed.

---

# 4. REQUIRED ARCHITECTURAL SHAPE

Harness may refine names after semantic investigation, but the resulting design must provide equivalent guarantees.

## 4.1 Verified certification envelope

Certified Registry ingestion needs a typed object or equivalent proof that binds the certified claim to authentic governed evidence. The proof must be validated at ingestion and again at reconstruction/trust boundaries.

Do not use an `_issued=True` flag alone as trust. If existing QORE governed proof contracts use internal issuance markers, also validate their deterministic fingerprints, exact candidate/source binding and owning authority.

## 4.2 Provenance-preserving current view

A current metric cannot reduce merged provenance to one arbitrary first study. Preserve all source studies/evidence stages needed to prove what CIBO sees at `derived_at`.

## 4.3 Verified ledger snapshot/root

Authoritative current history must carry continuity information. Pure helper projections may accept an explicitly verified ledger/snapshot, but runtime CIBO must fail closed on an unverified reconstructed tuple.

## 4.4 Joint capability scopes

Do not claim separate independent market/timeframe arrays if doing so implies unobserved combinations. Introduce a joint evidence-backed scope representation or a stronger equivalent invariant.

## 4.5 Contradiction-aware CIBO profile/review

CIBO must be unable to recommend promotion when relevant current certified evidence is contradictory and unresolved.

## 4.6 Canonical Trader identity

Create/reuse one canonical builder and eliminate `virtual.trader.*` vs `qore.trader.*` ambiguity across the governed path.

## 4.7 Runtime Registry wiring

Trader Lab authority results must be ingested/verified into Registry history before CIBO capability review consumes them, or an equivalent atomic governed composition must guarantee that the profile is exactly the Registry projection of the verified lifecycle at the review timestamp.

No second parallel historical memory.

---

# 5. SIX NON-DUPLICATIVE LANES — EXACTLY 6 REQUIRED

## L1 — Architecture / contracts / authority

Own proof contracts, trust boundaries, certified ingestion, ledger continuity, existing governed evidence/proof reuse, and authority separation.

Use MAX reasoning.

## L2 — Witness reproduction / red-team

Reproduce F1–F9 before repair. Preserve machine-readable evidence of each red witness. After implementation, re-run every witness and neighboring variants.

Use MAX reasoning.

## L3 — Temporal / lineage / supersession

Own lookahead, stage provenance, hypothesis causality, supersession DAG/order, as-of semantics, freshness and historical reconstruction properties.

Use MAX reasoning.

## L4 — Property / metamorphic / generated histories

Generate histories over Trader codes, versions, times, partitions, proof/source bindings and scope combinations. Test reordering equivalence where semantically valid, truncation rejection, future-invariance, cross-Trader isolation and cartesian-scope prevention.

Use HIGH/MAX reasoning as required.

## L5 — CIBO integration / call-site / identity

Use semantic LSP to audit all profile builders/review paths. Eliminate runtime bypass and identity duality. Verify Risk/DEMO boundaries remain unchanged.

Use MAX reasoning.

## L6 — Fresh post-implementation adversarial expert

A distinct subagent that did not design the patch must attack the FINAL candidate after L1–L5 implementation. It must specifically retry authority forgery, lookahead, contradiction laundering, aggregate truncation, identity cross-wiring and operational bypass.

Any material defect found by L6 MUST be repaired in the same package and a NEW fresh L6 challenge is required before candidate readiness.

Exactly six completed lanes and six distinct completed subagent identities are mandatory.

---

# 6. SEMANTIC LSP REQUIRED

Use and retain evidence for:

- `goToDefinition`
- `findReferences`
- `goToImplementation` when applicable
- `hover`

At minimum on:

- `TraderHistoricalIntelligenceRegistry`
- `TraderHistoryStudyRecord`
- `project_current_capability`
- `project_cibo_capability_profile`
- `build_cibo_profile_from_trader_lab`
- `review_trader_lab_candidate_cibo`
- `build_cibo_trader_capability_profile`
- `ResearchDecisionEvaluatorIdentity`
- `TraderLabGovernedAuthenticityProof`
- `verify_governed_gate_evidence`
- any new certification/ledger/identity types.

Missing semantic call-site evidence is BLOCKED.

---

# 7. TEST REQUIREMENTS

Add deterministic adversarial regressions covering all Work witnesses and neighboring families.

Mandatory examples include:

- foreign evidence ref cannot certify another Trader;
- raw self-declared CERTIFIED rejected;
- wrong proof candidate/version/config/methodology/software rejected;
- future stage reuse cannot affect projection at T;
- future supersession cannot affect view at T;
- pre/equal-time hypothesis verdict rejected;
- reverse supersession rejected;
- supersession cycles rejected;
- exact Trader view excludes other Traders' holdouts;
- duplicate holdout content inside one study rejected;
- same holdout dataset legitimately usable by different Trader lineages according to documented governance;
- truncated/unverified reconstructed ledger rejected at runtime trust boundary;
- verified snapshot round-trip succeeds deterministically;
- unresolved contradiction blocks CIBO recommendation;
- caller cannot set promotion state/specialty/current freshness without evidence;
- `(EURUSD,H1)` + `(GBPUSD,M15)` does not imply cross combinations;
- identity builder yields one convention across Registry and operational Trader Lab CIBO path;
- operational CIBO path cannot bypass Registry;
- no Risk/DEMO/LIVE authority introduced.

Use property/metamorphic generation for timestamps, append order, Trader code/version permutations and scope tuples.

Existing tests must not be weakened.

---

# 8. ALLOWED IMPLEMENTATION SCOPE

Prefer the smallest coherent family closure. Allowed paths include:

- `docs/architecture/QORE-TRADER-HISTORICAL-INTELLIGENCE-001.md`
- `src/qore/infrastructure/trader_history/**`
- `src/qore/infrastructure/cibo_trader_capability_profile.py`
- `src/qore/infrastructure/cibo_trader_lab_authority.py`
- `src/qore/infrastructure/cibo_trader_development_review.py`
- `src/qore/infrastructure/trader_lab/cohort_authority.py`
- `src/qore/infrastructure/research_evaluator_identity.py` only if the canonical identity contract belongs there
- closely related Trader identity helper module if required
- corresponding `tests/infrastructure/**` files for the changed contracts/paths.

Do not modify execution/broker/live-capital code unless a compile/reference migration is strictly required; no authority expansion is permitted.

---

# 9. FULL QUALITY GATE — MANDATORY

Run exactly:

`ruff check .`

`mypy src tests`

`pytest --cov=src/qore --cov-report=term-missing`

Report complete counts and coverage.

No:

- `type: ignore` to hide defects;
- unjustified `noqa`;
- mypy relaxation;
- skip/xfail hiding failures;
- test deletion/weakening;
- coverage exclusions to manufacture GREEN.

Mechanical GREEN is necessary but not sufficient.

---

# 10. DELIVERABLE

Artifact-only candidate. Do not push/merge qore-core.

Deliver:

1. exact starting HEAD/TREE verification;
2. F1–F9 reproduction table pre-fix;
3. root-family analysis;
4. architecture/contract changes;
5. exact changed files;
6. candidate.patch and SHA-256;
7. six-lane + six-distinct-subagent evidence;
8. semantic LSP evidence;
9. focused adversarial/property/metamorphic results;
10. fresh L6 final falsification result;
11. FULL QG result;
12. remaining limitations, especially durable storage if external;
13. closure argument explaining why CIBO cannot receive unauthenticated/future/contradictory/cross-Trader or scope-laundered capability.

Terminal result must be one of:

`CANDIDATE READY — POST-FALSIFICATION ROOT FAMILIES EXHAUSTED`

or

`BLOCKED / FURTHER MATERIAL FAMILY FOUND`

Do not report success merely because the nine original witnesses pass.

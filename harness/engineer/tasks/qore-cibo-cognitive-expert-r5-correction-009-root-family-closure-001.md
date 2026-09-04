# QORE Harness Engineer — CIBO Cognitive Expert R5 Correction-009

## PACKAGE

`HARNESS-ENGINEER-QORE-CIBO-COGNITIVE-EXPERT-R5-CORRECTION-009-ROOT-FAMILY-CLOSURE-001`

## ROLE

Act as the adversarial Harness Engineer for PR #486. This is an artifact-only causal-family correction package. Do not push, commit, merge, publish, authorize Production, use real capital, or absorb CIBO Functions / Trader Lab / Traders / Risk / provider authority.

This is NOT a restart of CIBO Cognitive and NOT a replay of Correction-008. Preserve all previously closed work. DeepSeek Expert R5 completed successfully against the exact frozen candidate and returned `VALIDACIÓN NO OK` with three material causal families. IA independently accepts those three families as material. Coder is BLOCKED until this candidate mutates, passes FULL QG, is materialized, receives exact-head QORE CI, is frozen again, and passes a fresh Expert gate.

Correct exactly the three IA-accepted root families below plus the bounded neighboring equivalence classes required to establish Root-Family Exhaustion. Do not turn R5 non-material observations into blocking scope unless your implementation creates a deterministic material contradiction.

## EXACT START BINDING

Repository: `mezas3238-hue/qore-core`
PR: `#486`
BASE: `9672c4d999bd5d3e6db544f349243bc6abea0363`
BASE TREE: `67c77fbe016b6688e5114165a5a14c3026832027`
START / HEAD: `b782465f333ee1eacabc65f57f9013d7d140bfc3`
START TREE: `effef98cbb93e17cd358059400330101b4e0c30d`
SYNTHETIC: `cbcfaf34703d2fe62c8ec136cc055a5dd65d4ac9`
Synthetic parents: BASE + START
Synthetic TREE: `effef98cbb93e17cd358059400330101b4e0c30d`
Synthetic GitHub signature: verified / valid
Exact-head QORE CI: run `33899214306`, job `101109055533`
QG: Ruff PASS; mypy 775 files; pytest 5592/5592 PASS; 7 warnings; coverage 87%, 52,302 statements / 7,057 missed.

## EXPERT R5 EVIDENCE LINEAGE — EVIDENCE, NOT IMPLEMENTATION AUTHORITY

Package: `QORE-PR486-CIBO-COGNITIVE-FINAL-DS-EXPERT-R5-001`
Run: `33909201584`
Job: `101141350447`
Review ID: `5117113125`
Artifact: `9951640374`
Artifact digest: `sha256:7590f3323eb8cb243f86bc49fbe42aef7ac62d40b1adcb30388bc662f6439fda`
Reviewer repository SHA: `13b09f1913f3bc8e4cbc90fbedfbe1e8195a2e63`

R5 completed normally, not by infrastructure failure:
- all five Expert lanes completed;
- primary semantic LSP gate completed with usable evidence;
- durable checkpoints sequences 0-14 completed and balanced;
- reasoning audit PASS with HIGH=78 / MAX=194;
- frozen candidate remained read-only and clean;
- final verdict: `VALIDACIÓN NO OK` with 3 material causal families.

Do not rerun or imitate R5. Independently reproduce its material witnesses, establish the root causes, explore neighboring causal space, implement the correction, and prove closure.

## PRESERVE VERIFIED / NON-MATERIAL AREAS

R5 reverified these prior closures as intact on START. Treat them as regression obligations, not open investigations:
- R3 Council firewall / no accidental authority;
- CapabilityEvidence recompute-and-compare and retained-state integrity;
- canonical-instant equality/dedup across equivalent offsets and DST fold distinctions;
- exact runtime types, retained corruption rejection, constructor == recursive revalidation;
- R4 hypothesis channel-polarity typing;
- R4 REFUTED new-evidence gate;
- R4 NON_ACTIONABLE uncertainty coherence on all actionable Council/recommendation/brain carriers.

R5 non-material observations that are not blocking scope:
- latent `F-CIBO-DECISION-EPISTEMIC-COHERENCE` where a DECISION carrier can exist with synthesis absent/non-actionable uncertainty but no source execution seam consumes it;
- duplicate `CiboCognitiveValidationError` taxonomy classes.

Do not broaden this package to those observations unless your new patch creates a reachable material defect.

# IA-ACCEPTED MATERIAL ROOT FAMILIES

## F1 — S-1 ASSIGNMENT-GRAMMAR FAIL-OPEN + GREEDINESS — HIGH

Primary location family: `src/qore/modules/cibo/cognitive_contracts.py`, especially `_CRED_LABEL`, credential tiers/patterns, `_COLON_PROSE_STOPWORDS`, `_SECRET_PATTERNS`, `_INVISIBLE_CATEGORIES`, `_secret_skeleton`, plus every Cognitive consumer of `contains_secret_material` as an impact/regression surface.

### R5 deterministic witness classes

Fail-open examples include families analogous to:
- compound labels: `access_token`, `refresh_token`, `bearer_token`, `auth_token`, `id_token`, `personal_access_token`, `oauth_token`, `slack_token`, `github_token`, `openai_key`, `apiToken`, `secretToken`, `client_id`, `x_auth_token`;
- width-space / Unicode separator insertion using Zs characters such as U+00A0, U+2007, U+200A, U+202F, U+205F, including separators inserted inside labels and token bodies;
- all-lowercase-letter unpadded Basic bodies that are structurally valid credential material;
- delimiter substitution such as underscore-vs-hyphen token prefixes (`sk_...`, `xoxb_...`).

False-positive examples include families analogous to:
- benign `Basic oauth2`, `Basic sha256`, `Basic kerberos5` prose;
- benign phrases such as `password: one`, `password: each`, `password: them`, `password: all`, and neighboring ordinary-language values.

Sibling consistency evidence: `instrument_universe_registry.py` treats markers such as `access_token` / `access-token` as sensitive while the current CIBO Cognitive gate can miss equivalent forms. This is evidence for neighboring equivalence classes; do not couple CIBO to that module merely to copy a list.

### Root cause accepted by IA

The current heuristic grammar is not closed under the intended credential-label/token equivalence space:
- `\b` anchoring permits word-character-joined compound labels to escape;
- detection normalization does not soundly collapse the relevant width/separator classes before matching;
- literal-hyphen token-prefix patterns miss delimiter-equivalent families;
- Basic-body structural heuristics admit credential-like lowercase forms while also greedily rejecting benign prose;
- finite stopword accumulation is not a principled substitute for structural discrimination.

### Required closure

Build a principled, deterministic fail-closed detection contract that simultaneously controls false negatives and false positives. At minimum:
- close compound/snake/camel credential-label equivalence without treating every generic identifier as secret by label presence alone;
- close relevant separator/width/Unicode normalization transforms used to split labels or credential bodies, including relevant Zs and neighboring categories if causally equivalent;
- close token-prefix delimiter equivalence for admitted credential families;
- distinguish credential-like Basic material from ordinary security/finance prose through structural semantics rather than uppercase-only or stopword-only proxies;
- preserve AWS/GitHub/Slack/OpenAI/JWT/Bearer/Basic/private-key/URL-userinfo families already protected;
- preserve benign prose acceptance and explicitly property-test both detector directions;
- trace all `contains_secret_material` consumers through semantic LSP and prove no consumer-specific bypass or regression.

Do NOT solve F1 with an ever-growing witness-specific stopword list, blanket Unicode rejection, or blanket rejection of every token-looking word. Close the root grammar/normalization family.

## F2 — CONFIRMED ERASES RETAINED FALSIFIERS BY ASSERTION — MATERIAL EPISTEMIC GOVERNANCE

Primary location: `src/qore/infrastructure/cibo_cognitive_hypotheses.py`, especially `_validate_status_evidence`, `build_hypothesis`, `transition_hypothesis`, retained history/logical identity/fingerprint/revalidation/replay paths.

### R5 deterministic witness

A lineage equivalent to:
`REFUTED(contradiction c1) -> REVISED(reason + genuinely new evidence) -> ACTIVE -> CONFIRMED(tests=[unrelated])`
can become CONFIRMED while prior falsifying material `c1` disappears from the active hypothesis logical values. Nothing requires the confirming test to resolve or address `c1`. Direct construction of a CONFIRMED hypothesis with arbitrary test evidence can also bypass a governed falsifier-resolution lineage.

### Root cause accepted by IA

Confirmation is asserted rather than demonstrated. The implementation clears retained against/contradiction state at CONFIRMED without a typed, evidence-bound resolution relationship. `TEST_RESULT` identifies a channel/polarity but does not by itself prove that a specific prior falsifier was addressed.

### Required closure

The architecture must preserve the law:
`HYPOTHESIS CONFIRMATION != FAVORABLE OUTCOME`.

At minimum:
- an unresolved historical falsifier must not silently disappear when status becomes CONFIRMED;
- either retain falsifiers with explicit resolved/unresolved state and exact resolving evidence references, or forbid CONFIRMED until every blocking falsifier is governed by an explicit resolution contract;
- the resolution mechanism must bind exact evidence identity/content and cannot be satisfied by unrelated test material;
- direct CONFIRMED construction must obey the same contract as transitions;
- constructor, transition, logical_values, fingerprint, serialization/replay, retained-state revalidation and history must agree;
- reflective/nested corruption must fail closed;
- canonical-time/order-equivalent duplication must not manufacture a new resolution;
- preserve R4 channel polarity and REFUTED genuinely-new-evidence closure.

Do NOT merely copy the old contradiction string into a field while leaving causally unrelated tests able to assert resolution. Closure requires governed linkage.

## F3 — DANGLING CAUSAL BINDING + CALLER-BOOL CAUSATION — MEDIUM-HIGH

Primary locations:
- `src/qore/infrastructure/cibo_cognitive_hypotheses.py` causal claim reference validation;
- `src/qore/infrastructure/cibo_cognitive_integration.py` episode/composition binding;
- `src/qore/infrastructure/cibo_cognitive_causality.py` causation contracts, confounder/mechanism evidence and acyclic lineage;
- replay/serialization/integration tests and neighboring retained-state paths as required.

### R5 deterministic witnesses

- an ACTIVE hypothesis can accept a `causal_claim_ref` composed of a random UUID plus a well-formed fingerprint even when no matching causal claim exists in the composed episode;
- the dangling reference is durable in logical values/replay material;
- exported causal/hypothesis acyclic-lineage guards exist but are not enforced by the relevant composition path;
- CAUSATION admission relies materially on caller-supplied `confounders_addressed: bool` without a first-class mechanism/confounder-evidence binding.

### Root cause accepted by IA

Causal attribution is caller-asserted rather than composition-verified. Reference validation is shape-level, not existence/coherence-level, and causation can be elevated through a bare boolean assertion rather than explicit evidence/mechanism semantics.

### Required closure

Preserve the laws:
`SUMMARY != SOURCE EVIDENCE`
`CORRELATION != CAUSATION`.

At minimum:
- at the integration/binding boundary, every hypothesis causal reference must resolve to an exact present causal claim with identity + fingerprint coherence;
- cross-object laundering, stale/dangling IDs, mismatched fingerprint, duplicate/collision cases and reflective corruption must fail closed;
- wire causal and hypothesis acyclic-lineage guards into the reachable composition/revalidation path wherever their invariant is supposed to hold;
- replace bare caller-bool causation sufficiency with a typed, evidence-bound mechanism/confounder-resolution contract adequate to justify CAUSATION under the existing strength/evidence policy;
- preserve provider neutrality and deterministic logical identity/fingerprint/replay;
- property-test correlation-to-causation escalation, absent references, mismatched references, cycles, retained-state corruption and composition permutations.

Do NOT merely check that a UUID appears somewhere. Closure requires exact semantic coherence and evidence-bound causation.

# REQUIRED SIX LANES — EXACTLY 6/6

## L1 — Architecture / contracts / runtime / trust boundaries
- derive coherent contracts for S-1 normalization/credential structure, falsifier resolution, and causal binding/mechanism evidence;
- preserve CA-01..18 ownership and intelligence-vs-authority separation;
- identify exact trust roots and fail-closed boundaries.

## L2 — Witness reproduction / adversarial red-team
- reproduce F1/F2/F3 on exact START before implementation;
- after implementation rerun exact witnesses plus neighboring equivalence partitions;
- explicitly report REPRODUCED / REJECTED and preserve witness evidence.

## L3 — Security / Unicode / normalization / regex / parsing
- exhaust F1 compound labels, snake/camel forms, token delimiters, Unicode separator/width transforms, normalization ordering, Basic/JWT/Bearer/token/userinfo/private-key families;
- maintain simultaneous false-negative and benign-prose false-positive matrix;
- use MAX reasoning for ambiguous security/Unicode closure.

## L4 — Property / metamorphic / systematic exploration
- F2 status x channel x falsifier-resolution x evidence-identity cross-product;
- F3 causal reference existence/fingerprint/cycle/mechanism/confounder-evidence cross-product;
- canonical-time/order/permutation/metamorphic variants;
- constructor == revalidate == replay invariants.

## L5 — Historical regression / prior findings / neighboring family
- preserve R3/R4 closures enumerated above;
- preserve Correction-008 fixes not implicated by F1/F2/F3;
- check neighboring causal families only where new code can deterministically affect them;
- no unrelated historical restart.

## L6 — Implementation impact / references / reachable paths / integration
- semantic LSP before and after: findReferences, goToDefinition, goToImplementation where applicable, hover, symbols/call sites and final recheck;
- trace `contains_secret_material` consumers;
- trace hypothesis lifecycle persistence/replay;
- trace causal claim -> hypothesis -> episode/integration -> replay/audit;
- final changed-path/diff audit and FULL QG.

Failure to provide evidence for all 6/6 lanes => BLOCKED.

# SEMANTIC LSP — MANDATORY

Provide concrete evidence of:
- `findReferences`;
- `goToDefinition`;
- `goToImplementation` when semantically applicable;
- `hover`;
- symbols modified;
- call sites / reachable consumers;
- final post-change recheck.

A textual claim that LSP was used without usable evidence is insufficient.

# REASONING

HIGH baseline.

MAX mandatory for:
- F1 security / Unicode / normalization / regex ambiguity;
- F2 falsifier identity, resolution semantics and lifecycle contradictions;
- F3 causation, trust-root, provenance and contradictory evidence semantics;
- final Root-Family Exhaustion adjudication.

Persist adaptive HIGH/MAX evidence.

# ROOT-FAMILY EXHAUSTION GATE

Do not stop when the listed witnesses pass. Explore bounded equivalence classes, neighboring transforms, cross-combinations, false positives, false negatives, retained-state corruption, exact runtime types, recursive revalidation, constructor parity, replay/determinism and historical regressions. Use exhaustive enumeration when bounded and property/metamorphic generation otherwise.

Final semantic result must be exactly one of:
- `CANDIDATE READY — ROOT FAMILY EXHAUSTED`
- `BLOCKED / FURTHER MATERIAL FAMILY FOUND`

# FULL QUALITY GATE

Mandatory final candidate:
- `git diff --check`
- `ruff check .`
- `mypy src tests`
- `pytest --cov=src/qore --cov-report=term-missing`

No weakening tests, deleting tests, skip/xfail hiding, `type: ignore`, unjustified Ruff suppression, mypy relaxation, coverage exclusion, or gate gaming.

# ARTIFACT-ONLY OUTPUT / CONTINUITY

No push/commit/merge to qore-core. Deliver:
- exact START/TREE verification;
- patch + patch SHA256;
- candidate tree/diff metadata;
- exact changed files;
- 6/6 lane evidence;
- semantic LSP evidence;
- HIGH/MAX reasoning evidence;
- witness/equivalence ledger;
- Root-Family Exhaustion closure argument;
- FULL QG output;
- durable checkpoints containing completed work, remaining obligations and exact next action.

If interrupted, resume from the latest durable checkpoint. Never redo completed lanes. A red workflow caused only by orchestration/terminal-marker parsing must not erase a complete candidate artifact.

No Claude. No Production. No real capital. No Risk authority. No execution authority. No Functions/Trader Lab/Trader implementation in this package.

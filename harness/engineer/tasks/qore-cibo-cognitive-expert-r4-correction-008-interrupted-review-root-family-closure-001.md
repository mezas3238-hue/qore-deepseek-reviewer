# QORE Harness Engineer — CIBO Cognitive Expert R4 Correction-008

## PACKAGE

`HARNESS-ENGINEER-QORE-CIBO-COGNITIVE-EXPERT-R4-CORRECTION-008-INTERRUPTED-REVIEW-ROOT-FAMILY-CLOSURE-001`

## ROLE

Act as the adversarial Harness Engineer for PR #486. This is an artifact-only causal-family correction package. Do not push, commit, merge, publish, authorize Production, use real capital, or absorb CIBO Functions / Trader Lab / Risk / provider authority.

This is NOT a restart of Cognitive and NOT a replay of Correction-006/007. Preserve all previously closed work. Expert R4 suffered two DSH/runtime interruptions, but the durable checkpoints preserved enough deterministic evidence for IA to establish that the current HEAD cannot receive Expert PASS. Correct only the IA-accepted material families below plus bounded neighboring equivalence classes needed for Root-Family Exhaustion.

## EXACT START BINDING

Repository: `mezas3238-hue/qore-core`
PR: `#486`
BASE: `9672c4d999bd5d3e6db544f349243bc6abea0363`
START / HEAD: `35e9ecace3f16dfd7b8845c60885d70283355dc6`
START TREE: `f45adf718a7a4b75f6af062c0a254ab65f68baeb`
SYNTHETIC: `b9a3bb58fd25530e248467017d1de86ffa70f690`
Synthetic parents: BASE + START
Synthetic TREE: `f45adf718a7a4b75f6af062c0a254ab65f68baeb`
Exact-head QORE CI: run `33873831882`, job `101025918636`
QG: Ruff PASS; mypy 775 files; pytest 5463/5463 PASS; 7 warnings; coverage 86%, 52,272 statements / 7,061 missed.

## EXPERT R4 INTERRUPTED LINEAGE — EVIDENCE, NOT APPROVAL

### R4 attempt 1
- package `QORE-PR486-CIBO-COGNITIVE-FINAL-DS-EXPERT-R4-001`
- run `33876502609`
- job `101034644349`
- artifact `9938592257`
- artifact digest `sha256:4bf9c8de35b1492512b64586db4cdac31cf750fcf7703fe918ed74aecf25c1e9`
- DSH exited 1 while five lanes were still in flight.
- durable checkpoints 1-4 completed binding, shared evidence map, deterministic primary probes, semantic LSP and test-mirroring/root-falsification review.

### R4 attempt 2 / resume
- package `QORE-PR486-CIBO-COGNITIVE-FINAL-DS-EXPERT-R4-RESUME-002`
- run `33879637076`
- job `101044857219`
- artifact `9939899056`
- artifact digest `sha256:f153009b078bc2731de322c0f4831f7a941373b0b917ab568a2296ec989ca083`
- L3 and L1 completed and were consumed as NON_MATERIAL.
- L2/L4/L5 were still in flight when DSH again exited 1.
- the primary session independently reproduced an S-1 material regression before the crash.

IA independently inspected the exact HEAD and accepted the four material families below. Coder is BLOCKED. A third Expert rerun on the same known-invalid HEAD is forbidden: HEAD must mutate first.

## PRESERVE VERIFIED / NON-MATERIAL AREAS

From R4 durable checkpoints:
- L1 D-1 nested `CapabilityEvidence` / `TraderDevelopmentAttribution` revalidation: NON_MATERIAL; recompute-and-compare and nested corruption defenses held.
- L3 architecture / CA-01..18 / ownership: NON_MATERIAL; no new Risk/execution/provider/Functions/Trader-Lab authority crossing attributable to Correction-007.
- Correction-007 F-1 canonical instant fixes passed the primary same-instant/different-offset and distinct-DST-fold witnesses already executed.
- Council `CiboCouncilSynthesis` now correctly rejects `ABSTAIN_DEFER` and `UNRESOLVED_CONTRADICTION` at its own layer.

Do not reopen these unless your correction creates a deterministic contradictory witness.

## IA-ACCEPTED MATERIAL ROOT FAMILIES

### R4-F1 — S-1 SECRET HYGIENE REGRESSION / RESIDUAL — HIGH

Location family: `src/qore/modules/cibo/cognitive_contracts.py` and every Cognitive consumer of `contains_secret_material`.

Deterministic old-vs-new witnesses preserved by Expert primary session:
- `Basic enp6eg==` — old `919752e` detected `True`; START `35e9eca` detects `False`. This is RFC-4648-valid base64 and decodes to `b'zzzz'`.
- `password: a1b2c3` — old `True`; START `False`.
- `password: 12345678` — old `True`; START `False`.
- `api_key: abc123` — old `True`; START `False`.

The regression was introduced by Correction-007 boundary narrowing:
- Basic discriminator narrowed from `[A-Z0-9+/]` to `[A-Z+/]`;
- bare colon assignment requires 8+ chars with both letter and digit.

Benign prose improvements must be preserved:
- `authorization: OAuth2` must remain benign;
- `Basic 2008 outlook was bearish` must remain benign;
- ordinary finance/security prose must not be greedily rejected.

Residual confusable-label gaps also remain in the same family, including examples analogous to Greek ETA/ZETA/small eta and Cyrillic EN inserted into credential labels. The exact confusable set must be handled by bounded Unicode equivalence classes rather than ad-hoc witness patches.

Impact is global: `contains_secret_material` protects safe-text/code/provenance boundaries across memory, journal, deliberation, brain, world model, tools, scenarios, replay and planning.

Required closure:
- fail closed on credential-like Basic/assignment material including short/all-digit/all-letter/mixed legitimate secrets without reintroducing benign prose false positives;
- exhaust Basic/Base64 discriminator classes rather than requiring uppercase as a proxy for credential-ness;
- exhaust colon/equal assignment classes by structural context, delimiter/quoting/length/character partitions;
- exhaust relevant Cf/Mn/confusable label transformations and neighboring homoglyph classes;
- preserve AWS/GitHub/Slack/OpenAI/JWT/Bearer/Basic/private-key/URL-userinfo families;
- property/metamorphic false-negative AND false-positive matrix across all downstream consumers.

Do NOT solve through blanket rejection of arbitrary Unicode/prose.

### R4-F2 — HYPOTHESIS CONFIRMATION POLARITY LAUNDERING — MODERATE-HIGH

Location: `src/qore/infrastructure/cibo_cognitive_hypotheses.py`.

Current `_validate_status_evidence()` requires `tests` to be non-empty for `CONFIRMED`, but does not require evidence in the `tests` tuple to have `HypothesisEvidencePolarity.TEST_RESULT`.

Expert deterministic probes confirmed that a `CONFIRMED` hypothesis accepts `tests` containing `SUPPORTS`, `AGAINST`, or `CONTRADICTION` polarity values. Thus arbitrary evidence can be caller-positioned inside `tests` and laundered into governed test/prediction evidence.

This violates:
`HYPOTHESIS CONFIRMATION != FAVORABLE OUTCOME`
and the intended contract comment that confirmation requires governed test/prediction evidence.

Required closure:
- define exact semantics for `tests`: every test/prediction result must be structurally distinguishable from generic support/against/contradiction evidence;
- at minimum reject non-`TEST_RESULT` polarity in the `tests` channel unless a stronger typed design supersedes polarity laundering entirely;
- ensure evidence_for/evidence_against/contradictions/tests cannot be cross-channel relabeled to bypass lifecycle rules;
- constructor, transition, fingerprint, logical_values, serialization/replay and revalidate must agree;
- property-test cross-product of statuses x evidence channels x polarities.

### R4-F3 — REFUTED -> REVISED SAME-EVIDENCE REUSE — MODERATE-HIGH

Location: `src/qore/infrastructure/cibo_cognitive_hypotheses.py` `transition_hypothesis` and lifecycle history.

Current guard computes `new_evidence = bool(tuple(evidence_for) or tuple(evidence_against) or tuple(contradictions) or tuple(tests))`. It does not compare supplied evidence with the evidence already retained by the REFUTED hypothesis.

Expert deterministic probe confirmed that `REFUTED -> REVISED` succeeds when the caller supplies the exact same evidence object already present on the refuted hypothesis together with a reason_code. That is not materially new evidence and allows ceremonial resurrection.

Required closure:
- leaving REFUTED must require a durable content change OR genuinely new evidence/test material under canonical identity semantics;
- exact same evidence, same semantic evidence under alternate timezone/order representation, or duplicate relabeling must not count as new;
- preserve/refingerprint revision reason and lineage;
- do not silently erase prior falsifying evidence/history when entering REVISED/ACTIVE;
- exhaust revision/resurrection/supersession/archive/rollback/cycle/same-revision attempts and canonical-time equivalent evidence reuse.

### R4-F4 — UNRESOLVED-CONTRADICTION COHERENCE ASYMMETRY — MODERATE-HIGH

Locations:
- `src/qore/infrastructure/cibo_executive_deliberation.py`
- `src/qore/modules/cibo/cognitive_contracts.py` `CiboFormalRecommendation`
- `src/qore/infrastructure/cibo_executive_brain.py` `CiboExecutiveSynthesis`
- end-to-end integration/replay carriers as needed.

Correction-007 correctly made `CiboCouncilSynthesis` reject `UNRESOLVED_CONTRADICTION` on a council DECISION. However the downstream/upstream advisory carriers are inconsistent:
- `CiboFormalRecommendation` rejects only `ABSTENTION_UNCERTAINTY_KINDS`, which does not include `UNRESOLVED_CONTRADICTION`;
- `CiboExecutiveSynthesis._validate_directive_uncertainty_coherence()` rejects only the three `_ABSTENTION_KINDS` for `RECOMMEND`, not `UNRESOLVED_CONTRADICTION`.

Expert deterministic probes confirmed that a formal recommendation with `UNRESOLVED_CONTRADICTION` is accepted and a `RECOMMEND` synthesis carrying it is accepted, while Council DECISION rejects the same epistemic state.

Required closure:
- establish one coherent actionability/decision-carrier uncertainty policy across Council decision, formal recommendation and brain RECOMMEND;
- an unresolved contradiction must not be laundered into a recommendation-like actionable advisory carrier;
- preserve `COMPETING_HYPOTHESES` only if contractually intended and bounded; document/test the distinction;
- preserve non-decision behavior and bounded-confidence semantics;
- end-to-end Council -> recommendation -> brain -> integration -> replay matrix must not reintroduce contradiction laundering.

## INTERRUPTED L2/L4/L5 NEIGHBORING SCOPE

Expert L2/L4/L5 did not finish because of DSH interruption. Harness must absorb their *bounded causal questions* without pretending their unfinished results exist:
- L2: S-1 boundary impact, caller-source/proof root regressions caused by the new correction, authority-mint regressions only if deterministically witnessed.
- L4: lifecycle channel/polarity equivalence, REFUTED evidence reuse under canonical-time/order equivalence, constructor canonicalization and F-1 regression checks caused by this correction.
- L5: Council/recommendation/brain/integration/replay uncertainty coherence and second-order interactions.

This is not permission to restart all historical I-1b/F-1/CA families. Investigate only neighbors necessary to close the four material roots and regressions introduced by the new patch.

## REQUIRED SIX LANES — EXACTLY 6/6

L1 — Architecture/contracts/trust boundaries
- derive coherent contracts for hypothesis evidence channels and uncertainty actionability;
- preserve HOW-CIBO-THINKS ownership and no authority leakage.

L2 — Witness reproduction/adversarial red-team
- reproduce all four IA-accepted families before implementation;
- after implementation rerun exact witnesses plus bounded neighboring partitions;
- explicitly report REPRODUCED / REJECTED with evidence.

L3 — Security/Unicode/normalization
- exhaust S-1 Basic/base64, assignment, Unicode Cf/Mn/confusable, quoted/unquoted, URL/auth/token families;
- simultaneous false-negative and benign-prose false-positive matrix.

L4 — Property/metamorphic/systematic lifecycle
- statuses x channels x polarities;
- genuine-new-evidence identity under canonical time/order;
- resurrection/supersession/history invariants;
- permutation/canonicalization regressions.

L5 — Historical regression / prior closures
- preserve Correction-006/007 closed D-1/F-1/CA-01..18 and no provider/Risk/Functions/Trader-Lab authority drift;
- no docs overclaim.

L6 — Implementation impact / semantic LSP / end-to-end
- semantic LSP before and after: findReferences, goToDefinition, goToImplementation where applicable, hover, call sites and modified symbols;
- trace `contains_secret_material` consumers;
- trace hypothesis lifecycle persistence/replay;
- trace Council -> recommendation -> brain -> integration -> replay;
- final path/diff audit and FULL QG.

Failure to provide evidence for all 6/6 lanes => BLOCKED.

## REASONING

HIGH baseline. MAX mandatory for:
- Unicode/normalization/security ambiguity;
- evidence identity, lifecycle resurrection and semantic equivalence;
- uncertainty/contradiction/actionability coherence;
- contradictory root-family evidence and final closure.

Record adaptive HIGH/MAX evidence.

## ROOT-FAMILY EXHAUSTION GATE

Do not stop when the four witnesses pass. Cover bounded equivalence classes, cross-combinations, false positives, false negatives, retained-state corruption, constructor/revalidation parity, replay/determinism and historical regressions. Use exhaustive enumeration where bounded and property/metamorphic generation elsewhere.

## FULL QUALITY GATE

Mandatory final candidate:
- `git diff --check`
- `ruff check .`
- `mypy src tests`
- `pytest --cov=src/qore --cov-report=term-missing`

No weakening tests, skip/xfail hiding, type-ignore, lint suppression, mypy relaxation, coverage exclusion or gate gaming.

## ARTIFACT-ONLY OUTPUT

No push/commit/merge to qore-core. Deliver patch + metadata + hashes + 6-lane evidence + semantic LSP + reasoning audit + witness ledger + Root-Family Exhaustion report + FULL QG + durable checkpoint with exact completed/remaining state.

Final semantic verdict exactly one of:
- `CANDIDATE READY — EXPERT R4 INTERRUPTED ROOT FAMILIES EXHAUSTED`
- `BLOCKED / FURTHER MATERIAL FAMILY FOUND`

If interrupted, resume from latest durable checkpoint. Never redo completed lanes.

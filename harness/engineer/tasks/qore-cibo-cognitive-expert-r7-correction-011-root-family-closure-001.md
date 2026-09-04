# QORE Harness Engineer — CIBO Cognitive Expert R7 Correction-011

## PACKAGE
`HARNESS-ENGINEER-QORE-CIBO-COGNITIVE-EXPERT-R7-CORRECTION-011-ROOT-FAMILY-CLOSURE-001`

## ROLE / EXECUTION LAW
Act as the adversarial Harness Engineer for PR #486. This is an artifact-only causal-family correction package. Do not push, commit, merge, publish, authorize Production, use real capital, or absorb CIBO Functions / Trader Lab / Traders / Risk / provider execution authority.

This is NOT a restart of CIBO Cognitive and NOT a replay of Corrections 009/010. Preserve every previously closed family unless this correction deterministically reopens it. DeepSeek Expert R7 completed normally against the exact frozen Correction-010 candidate and returned `VALIDACIÓN NO OK` with exactly five IA-accepted material residual families. Coder remains BLOCKED.

Correct exactly F1A, F1B, F2A, F2B and F3A below, plus the bounded neighboring equivalence classes needed for Root-Family Exhaustion. Do not reopen R7 observations adjudicated NON_MATERIAL unless the new implementation creates a deterministic material contradiction.

## EXACT START BINDING
Repository: `mezas3238-hue/qore-core`
PR: `#486`
BASE: `9672c4d999bd5d3e6db544f349243bc6abea0363`
BASE TREE: `67c77fbe016b6688e5114165a5a14c3026832027`
START / HEAD: `d3b79224729b62727f5b02542bf75c4e1f3b1787`
START TREE: `00e3eff2262bc2214099426d28ab098e3dd21106`
SYNTHETIC: `1da600ac92f3233f2391958117950ae3100d7b27`
Synthetic parents: BASE + START exactly
Synthetic TREE: `00e3eff2262bc2214099426d28ab098e3dd21106`
Synthetic GitHub signature: verified / valid
Exact-head QORE CI: run `33928627387`, job `101202461454`
QG: Ruff PASS; mypy 775 files; pytest 5702/5702 PASS; 7 warnings; coverage 87%, 52,464 statements / 7,069 missed.

## EXPERT R7 EVIDENCE LINEAGE — EVIDENCE, NOT IMPLEMENTATION AUTHORITY
Package: `QORE-PR486-CIBO-COGNITIVE-FINAL-DS-EXPERT-R7-001`
Run: `33929313387`
Job: `101204491775`
Review ID: `5118752145`
Artifact: `9958463522`
Artifact digest: `sha256:f9e352bc8992f3157735a7e4a897563babea5e92e8a3e65b453c2fe0fe96a19b`
Reviewer repo SHA: `5ee3fd580e20b661902a09c72955d698fc50837e`

R7 completed normally:
- exactly five Expert lanes completed;
- semantic LSP completed with references/definitions/hover/call-site evidence;
- HIGH/MAX audit PASS (`high=50`, `max=112`, triggers=63);
- immutable read-only candidate enforcement PASS;
- exact frozen PR revalidated immediately before publication;
- durable checkpoints COMPLETE;
- final verdict `HALLAZGOS: F1A, F1B, F2A, F2B, F3A` / `VALIDACIÓN NO OK`.

Independently reproduce every accepted witness on exact START before implementation. R7 is evidence, never implementation authority.

# IA-ACCEPTED MATERIAL ROOT FAMILIES

## F1A — S-1 Unicode dash homoglyph delimiter false-negative — LOW
Primary location: `src/qore/modules/cibo/cognitive_contracts.py`, especially `_SECRET_PATTERNS`, `_DELIMITER_CONFUSABLE_MAP`, `_secret_skeleton`, normalization and all `contains_secret_material` consumers.

R7 witnesses on START:
- `contains_secret_material("sk\u2010abc12345678") == False`
- `contains_secret_material("xoxb\u2013abcdefghijk") == False`
- `contains_secret_material("Bearer\u2010abc123def") == False`
- U+2010/U+2011/U+2012/U+2013/U+2014/U+2212/U+02D7/U+2043/U+FE58 evade; only U+FE63/U+FF0D fold through NFKC.

Root cause: detection-only skeleton folds colon confusables and letter homoglyphs but not the bounded dash-confusable equivalence class. Known OpenAI/Slack/Bearer-shaped secret material can fail open under typographic dash transforms.

Required closure:
1. Normalize a principled bounded dash-confusable class to ASCII `-` in the detection-only skeleton, symmetric with colon confusables.
2. Enumerate bounded dash variants across known prefix families, punctuation adjacency, normalization forms and benign hyphen/dash prose controls.
3. Preserve all prior token/private-key/JWT/URL-userinfo/split-secret behavior and false-positive controls.
4. Do not blanket-reject Unicode dash prose or patch only the listed three strings.

## F1B — S-1 compound-label all-letter credential fail-open across retained channels — LOW
Primary location: `cognitive_contracts.py`, especially `_AMBIGUOUS_CRED_LABEL`, bare-value credibility discriminator and ambiguous-colon grammar; blast radius through memory/replay/world-model/evaluation/planning/attention/tools and every LSP-reachable `contains_secret_material` consumer.

R7 witnesses:
- `personal access token: correcthorsebatterystaple` accepted / detector False
- `access token: hunter` accepted / detector False
- `client id: hunter` accepted / detector False
These were rejected before Correction-010; the re-tier fixed greedy prose but introduced a fail-open class.

Root cause: compound labels were moved UNEQUIVOCAL→AMBIGUOUS, while the ambiguous bare-value discriminator is digit-only and length-blind. Real all-letter credentials/passphrases can therefore pass regardless of length, with no downstream compensating guard.

Required closure:
1. Define a principled two-sided ambiguous-value credibility rule, not a word list. Include digit-bearing, all-letter length/entropy-ish partitions, quoted values, token-shaped syntax and benign prose controls.
2. Preserve R6-mandated benign examples such as `access token: expires daily`, `client id: unique`, `openai key: billing`, `personal access token: revoked` where the architecture classifies them as prose rather than secrets.
3. Add cross-channel tests proving no retained/projection consumer bypass.
4. Explore label class × value-shape × length × quoting × Unicode spacing/Cf × punctuation partitions and false-positive/false-negative matrices.

## F2A — SUPPORTS→TEST_RESULT relabel laundering can manufacture CONFIRMED — LOW-MED
Primary location: `src/qore/infrastructure/cibo_cognitive_hypotheses.py`, especially `_canonical_resolutions`, `_evidence_identity`, CONFIRMED admission/projection, retained `evidence_for`, tests and replay/revalidation.

R7 witness:
An ACTIVE hypothesis retains `(support, SUPPORTS, T)` and `(f1, CONTRADICTION, T)`. Calling `transition_hypothesis(CONFIRMED, tests=[(support, TEST_RESULT, T)], falsifier_resolutions=[f1→support])` is accepted: the same favorable observation is merely relabeled into TEST_RESULT and resolves the blocker.

Root cause: cross-relabel guard scopes to the falsifier identity set only. The CONFIRMED path does not enforce the existing law that `(ref, canonical instant)` relabeling across channels/polarities is not genuinely new evidence against retained SUPPORTS/prior tests.

Required closure:
1. On confirming transitions, every resolving test canonical `(ref, UTC instant)` must be genuinely new relative to retained `evidence_for`, prior tests and all blocking falsifier identities, independent of channel/polarity relabel.
2. Preserve multiple-falsifier exact coverage and prior direct/cross-falsifier protections.
3. Property/metamorphic partitions: polarity/channel relabel, timezone-equivalent instant, tuple permutation, duplicate refs, prior test reuse, unrelated evidence, malformed/exact-type failures, reflective retained corruption.
4. Preserve `HYPOTHESIS CONFIRMATION != FAVORABLE OUTCOME` and deterministic constructor/transition/revalidate/replay parity.

## F2B — Ungoverned CONFIRMED→REVISED→ACTIVE→CONFIRMED cycle — LOW
Primary location: `cibo_cognitive_hypotheses.py`, especially `_VALID_TRANSITIONS`, `transition_hypothesis`, governed revision logic and retained lifecycle evidence.

R7 witness:
CONFIRMED → REVISED with no reason/content/evidence → ACTIVE → CONFIRMED with the same tests and no new resolution material is accepted. Because CONFIRMED clears blocker channels, the later exact-coverage gate becomes vacuous and revision lineage can be inflated indefinitely.

Root cause: leaving REFUTED is evidence-governed, but leaving CONFIRMED has no symmetric governance gate.

Required closure:
1. Leaving CONFIRMED must require a governed revision basis: reason_code and/or semantic content change and/or genuinely new evidence, under an explicit deterministic contract.
2. Re-confirmation after revision must not reuse stale material as if new.
3. Exhaust the reachable lifecycle graph: CONFIRMED/REVISED/ACTIVE/SUPERSEDED/REFUTED interactions, repeated cycles, same/different evidence, canonical-time aliases, tuple ordering and retained corruption.
4. Preserve existing REFUTED resurrection governance and legitimate revision workflows; do not forbid all post-confirmation revision.

## F3A — Caller-asserted mechanism label remains CAUSATION authority root — LOW
Primary location: `src/qore/infrastructure/cibo_cognitive_causality.py`, especially `mechanism_code`, `_validate_code`, CAUSATION coherence/builders, evidence_for, confounder resolutions, fingerprint/replay and integration.

R7 witness:
`build_causal_claim(kind=CAUSATION, mechanism_code="x", confounders=(c,), confounder_resolutions=(c→obs), evidence_for=(obs,), strength=STRONG, status=CONFIRMED)` is accepted and revalidates. A one-character caller label plus one favorable observation can therefore become CONFIRMED STRONG CAUSATION.

Root cause: confounder resolutions became evidence-bound, but the mechanism pillar is still syntax-only. A caller string is the authority root for the causal mechanism required by CAUSATION.

Required closure:
1. Bind mechanism semantics to governed evidence/provenance. Prefer a typed mechanism-evidence binding retained in `evidence_for`, or a fingerprint-verified mechanism reference consistent with existing architecture.
2. A bare mechanism label must never be sufficient to authorize CAUSATION/STRONG/CONFIRMED.
3. Explore absent/unrelated/contradictory mechanism evidence, exact runtime types, duplicate identities, canonical-time aliases, confounder interaction, reference fingerprints, constructor/builder/revalidate/replay parity.
4. Preserve Correction-009/010 confounder-resolution provenance/polarity and exact causal-reference composition binding.
5. Preserve `CORRELATION != CAUSATION`, no caller-asserted trust/proof bit and no global mutable authority registry.

# R7 NON-MATERIAL / PRESERVE AS REGRESSION OBLIGATIONS
Do not reopen unless your new patch creates deterministic material reachability:
- R6-mandated fail-closed function-word credential assignments were explicitly adjudicated NOT a new R7 defect;
- bounded low-plausibility secret false-negative observations outside F1A/F1B;
- R3 Council firewall / no accidental authority;
- CapabilityEvidence retained integrity;
- canonical-time equality/dedup/DST-fold distinctions;
- exact runtime types and constructor/revalidation parity;
- R4 polarity + REFUTED resurrection gate;
- NON_ACTIONABLE / unresolved contradiction coherence;
- replay and CA-01..CA-18 ownership;
- pre-existing reference-only status-coherence observation not changed by 010.

# REQUIRED SIX LANES — EXACTLY 6/6

## L1 — Architecture / contracts / runtime / trust boundaries
Derive the explicit invariants for F1A/F1B/F2A/F2B/F3A. Map constructor, retained-state, transition, replay and integration trust boundaries. Preserve CA-01..CA-18 and `INTELLIGENCE != AUTHORITY`.

## L2 — Witness reproduction / adversarial red-team
Reproduce every R7 accepted witness before code changes. Preserve deterministic witness evidence. After implementation report REPRODUCED-before / REJECTED-after plus neighboring partitions.

## L3 — Security / Unicode / normalization / regex / parsing
Exhaust dash-confusable and compound credential classes, normalization/Cf/Zs/punctuation, known provider prefixes, quoted/unquoted values, value shape/length and benign security/finance prose. Maintain two-sided FN/FP matrices. MAX mandatory.

## L4 — Property / metamorphic / systematic exploration
Exhaust hypothesis status × channel × polarity × evidence identity × canonical time × revision cycles and causal mechanism × evidence binding × confounder resolution × claim status/strength. Use bounded arbitrary collections, permutations and equivalence transforms. Verify constructor == transition/build == revalidate == replay.

## L5 — Historical regression / neighboring family
Preserve R3/R4/Correction-009/010 closures. Investigate neighbors only where the new code has concrete dependency/reachability. No Cognitive-history restart.

## L6 — Implementation impact / references / reachable paths / integration
Semantic LSP before and after: `findReferences`, `goToDefinition`, `goToImplementation` where applicable, `hover`, modified symbols, call sites and final impact recheck. Trace secret consumers; hypothesis build/transition/history/replay/integration; causal mechanism/evidence/confounder resolution → claim → hypothesis/integration/replay/audit. Final path/diff audit + FULL QG.

Failure to provide usable 6/6 lane evidence => BLOCKED.

# SEMANTIC LSP — MANDATORY
Provide concrete evidence for references, definitions, implementations when supported, hover, modified symbols, reachable call sites and final post-change recheck. Textual claims without usable LSP evidence are insufficient.

# REASONING
HIGH baseline. MAX mandatory for security/Unicode/normalization; hypothesis confirmation/revision/resurrection; causation/trust-root/provenance; contradictions; architectural ambiguity; final Root-Family Exhaustion adjudication. Persist HIGH/MAX decisions in durable checkpoints.

# CONTINUITY / CHECKPOINT LAW
Persist exact binding, completed lanes, witnesses, findings, LSP evidence, HIGH/MAX decisions, remaining work and exact next action. If interrupted, recover artifact/checkpoints and resume only missing work. Never restart completed lanes and never discard useful reasoning.

# ROOT-FAMILY EXHAUSTION GATE
Do not stop when listed witnesses pass. Explore bounded equivalence classes, neighboring transforms, cross-combinations, false positives/negatives, retained corruption, exact runtime types, recursive revalidation, constructor parity, replay/determinism and historical regressions.

Final semantic result exactly one of:
- `CANDIDATE READY — ROOT FAMILY EXHAUSTED`
- `BLOCKED / FURTHER MATERIAL FAMILY FOUND`

# FULL QUALITY GATE
Mandatory final candidate:
- `git diff --check`
- `ruff check .`
- `mypy src tests`
- `pytest --cov=src/qore --cov-report=term-missing`

No weakening tests, mypy, Ruff, coverage, skips/xfails or exclusions. Focused tests during development are allowed; final certification is FULL QG only.

# ARTIFACT-ONLY OUTPUT
Do not push/commit/merge. Deliver exact patch + metadata + hashes + changed files + line counts + six-lane evidence + LSP evidence + HIGH/MAX evidence + tests/QG + findings ledger + closure argument + durable checkpoints. Candidate patch must apply exactly to START `d3b79224729b62727f5b02542bf75c4e1f3b1787`.
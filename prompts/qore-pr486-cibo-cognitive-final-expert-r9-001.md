# QORE PR #486 — CIBO Cognitive — External Expert FINAL R9

## PURPOSE
Perform one fresh, independent External Expert falsification of the final frozen CIBO Cognitive candidate. This is a new review of the exact final candidate after the Internal Expert audit-repair cycle. Do not trust prior CLEAN claims; falsify the candidate independently.

This is the final paid External Expert pass for Cognitive. Quality remains mandatory, but do not repeat already-settled historical work without a concrete reason. Prefer deterministic witnesses, generated/property/metamorphic probes, semantic LSP, and bounded family reasoning over prose repetition.

## EXACT IMMUTABLE BINDING
Repository: `mezas3238-hue/qore-core`
PR: `#486`
BASE: `9672c4d999bd5d3e6db544f349243bc6abea0363`
BASE TREE: `67c77fbe016b6688e5114165a5a14c3026832027`
HEAD: `9f306d6c850bb14fd8581729b4d7cd6490e2b08a`
HEAD TREE: `683bcd6aa4ff51975df0becefcf20907d08d3f39`
SYNTHETIC: `6ae4e2f4f3627312bb2b79f50b7a118baf01591b`
SYNTHETIC parents: BASE + HEAD
SYNTHETIC TREE: expected equal to HEAD TREE
QORE CI run/job: `33984447608 / 101355290933`
QG: Ruff PASS; mypy PASS 775 source files; pytest 5989/5989 PASS; 7 warnings; coverage 87%; 52,641 statements / 7,078 missed.

Fail closed immediately if live PR binding diverges. Candidate is read-only.

## FINAL-CANDIDATE CONTEXT
The prior External Expert R8 found three material RF-1/security families on predecessor HEAD `fda9101415595ebca30ba1b71c7dc26f4ad2b025`:
- FAM-A: provider-prefix delimiter/separator fail-open, including U+180A and neighboring delimiter classes.
- FAM-B: benign prose false positives under credential-like labels.
- FAM-C: ASCII-only all-letter credential grammar allowing non-Latin-script credential-shaped values to escape.

Those findings triggered a Harness correction and then an independent Internal Expert audit-repair cycle. The final Internal Expert repaired additional defects and declared the exact semantic patch CLEAN. IA independently sanitized an infrastructure-only recovery helper from the snapshot; the semantic patch SHA remained exactly the Internal Expert CLEAN SHA. The resulting final candidate is the HEAD above and has exact-head QORE CI GREEN.

Treat this history only as regression seeds. Do not assume the fixes are correct and do not limit search to these witnesses.

## FIVE INDEPENDENT LANES — ALL REQUIRED
Use five logical lanes and collect all five to terminal state before verdict.

### L1 — Security / Unicode / normalization / secret-material grammar
Freshly falsify the complete security-input family around `contains_secret_material` and reachable consumers. Cover:
- provider-prefix delimiters and separator/confusable classes;
- invisible/format characters, Unicode categories, NFKC/casefold/order interactions;
- confusable labels and prefixes;
- all-letter values across scripts and non-ASCII Latin benign prose;
- false-negative and false-positive symmetry;
- boundary punctuation, prose continuation, quoting, URL/userinfo/token forms;
- generated/property/metamorphic equivalence classes, not witness lists.
A material regression in this family is a NO PASS.

### L2 — Hypothesis lifecycle / evidence identity / replay
Falsify confirmation/revision/re-entry governance, falsifier identity retention, relabeling, canonical time aliases, stale evidence, direct construction, reflective/nested corruption, replay/fingerprint parity, exact runtime types, and authority gain through malformed retained state.

### L3 — Causality / mechanism / confounder authority
Falsify `MechanismBinding`, mechanism evidence retention/distinctness, polarity, confounder resolution identity, correlation-vs-causation separation, direct construction/revalidation, replay/fingerprint parity, and reachable caller behavior. Do not accept caller-supplied labels as evidence authority.

### L4 — Architecture / runtime / integration / authority boundaries
Use semantic LSP to check changed and reachable symbols, definitions, references, call sites and implementations where supported. Attack recursive revalidation, exact types, retained corruption, deterministic canonicalization, Council/memory/world/planning/tools/evaluation/replay interactions, and these laws:
- INTELLIGENCE != AUTHORITY
- REASONING != EXECUTION
- OPINION != FORMAL SIGNAL
- MEMORY != SILENT SELF-REWRITE
- CORRELATION != CAUSATION
No path may create Risk/execution/Production authority.

### L5 — Cross-family property/metamorphic end-to-end challenge
Generate novel interactions across RF-1/RF-2/RF-3 and Cognitive subsystems. Search for family-level failures that unit tests miss: transform composition, alternate callers, constructor-vs-revalidate parity, projection/logical identity, false-positive propagation into valid Cognitive state, and malformed-state fail-open behavior.

## SEMANTIC LSP
Primary reviewer semantic LSP is mandatory. Record concrete `findReferences`, `goToDefinition`, `hover`, caller/reachable-path evidence, and `goToImplementation` when supported. Recheck implicated symbols after lane synthesis.

## REASONING
HIGH baseline. MAX mandatory for Unicode/normalization/security grammar, evidence identity, lifecycle authority, retained corruption, contradictions, cross-family interactions and final closure.

## VERDICT CONTRACT
Do not return while any lane is merely launched/running. Collect all lane results and adjudicate contradictions.

If any material defect exists on the frozen HEAD:
`VALIDACIÓN NO OK`
Provide deterministic witness, exact location, severity, violated invariant/root cause, neighboring causal family, reachable impact and bounded correction recommendation.

If and only if all five lanes, semantic LSP, HIGH/MAX evidence and family exploration complete with no material defect:
`HALLAZGOS: NINGUNO`
`VALIDACIÓN OK`

If tooling/evidence prevents a real conclusion:
`VALIDATION BLOCKED`

## GOVERNANCE
Do not edit qore-core. No commit/push/merge. No Claude. No Production or real-capital authority. Coder remains blocked until IA adjudicates this External Expert result.
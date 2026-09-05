# QORE PR #486 — CIBO Cognitive — Expert R8 CONTINUATION / RECOVERY

## PURPOSE
Resume the interrupted External Expert R8 review of the exact same frozen PR #486 candidate. This is NOT R9, NOT a fresh review, and NOT permission to repeat completed work. The prior R8 run `33967893599` / job `101311125868` exited before synthesis while four lanes were still running, but durable checkpoints preserved binding, shared evidence map, primary witnesses, mandatory semantic LSP, and completed/adjudicated L3. Continue only missing work.

## EXACT IMMUTABLE BINDING
Repository: `mezas3238-hue/qore-core`
PR: `#486`
BASE: `9672c4d999bd5d3e6db544f349243bc6abea0363`
BASE TREE: `67c77fbe016b6688e5114165a5a14c3026832027`
HEAD: `fda9101415595ebca30ba1b71c7dc26f4ad2b025`
HEAD TREE: `f8e11d8bccbe556a96deeeb6d6f354364a46e1f2`
SYNTHETIC: `ef8589b083242cdcd26eb32637e6a788622b5c5e`
SYNTHETIC parents: BASE + HEAD
SYNTHETIC TREE: `f8e11d8bccbe556a96deeeb6d6f354364a46e1f2`
QORE CI run/job: `33967223845 / 101309357600`
QG: Ruff PASS; mypy PASS 775 source files; pytest 5771/5771 PASS; 7 warnings; coverage 87%; 52,546 statements / 7,077 missed.

Fail closed if live PR binding diverges. Candidate is read-only.

## UPSTREAM HARNESS DUAL-ROLE CONTEXT
Harness package: `HARNESS-ENGINEER-QORE-CIBO-COGNITIVE-R7-CORRECTION-011-FULL-FAMILY-RECERTIFICATION-DUAL-ROLE-RESUME-001`
Harness produced Engineer + six subagents + Internal Expert CLEAN, then FULL QG. External Expert remains independent and must falsify it.

## IMPORTED DURABLE R8 STATE — DO NOT REDO
Prior R8 artifact: `9970356341`
Artifact digest: `sha256:e85bf393c75b503c864fc7da28d03da05480dc904a2d7b4e3a9b93b37631fd69`
Prior R8 model spend: 205 calls; 16,350,447 input tokens; 249,398 output tokens; observed balance delta USD 1.16.

Completed and durable:
1. Exact binding/QG verification.
2. Full Correction-011 diff reading and shared evidence map.
3. Mandatory primary semantic LSP evidence:
   - findReferences `MechanismBinding` -> 7 internal refs in causality surface;
   - findReferences `contains_secret_material` -> 100+ reachable refs across Cognitive/runtime/executive surfaces;
   - goToDefinition `contains_secret_material` -> cognitive_contracts.py;
   - goToDefinition `utc_instant` -> cibo_cognitive_common.py;
   - goToImplementation unsupported by server and explicitly recorded;
   - hover `build_causal_claim`, `MechanismBinding`, `resolved_falsifier_identities`;
   - reachable consumer/call-site mapping recorded.
4. Primary deterministic witnesses already reproduced; DO NOT spend model time rediscovering them:
   - FAM-A RF-1 dash/separator partition gap: U+180A MONGOLIAN NIRUGU survives NFKC and is not in `_DASH_CONFUSABLE_MAP`; examples such as `sk\u180aabcdefghijklmnop`, `xoxb\u180aabcdefghijklm`, `Bearer\u180aabc123def`, `Basic\u180aYWJjZA==` escaped detection while ASCII-space controls were detected.
   - FAM-B RF-1 false-positive regression: ordinary prose such as `secret: authentication, authorization, and accounting`, `token: authentication.`, `access token: reconnaissance, exploitation, persistence`, `authorization: compartmentalization`, `credential: interoperability`, `openai key: interoperability`, and `access token: authentication-based flows are common` was flagged on HEAD though predecessor accepted it. Propagation witness: valid `EvaluationDimensionScore(... note="token: authentication.")` rejected at HEAD.
   - FAM-C RF-1 partition gap: non-Latin all-letter values such as Greek/Cyrillic/CJK after weak labels escaped because `_BARE_ALPHA_TOKEN_VALUE` is ASCII `[A-Za-z]` bounded.
   - RF-2 primary probes: same-ref+instant relabel rejected; CONFIRMED->REVISED->ACTIVE->CONFIRMED old-test reuse rejected; timezone alias dedup works; direct CONFIRMED with fabricated resolved identity was fail-closed/no authority gain.
   - RF-3 primary probes: no mechanism / unretained / shared-with-resolution / AGAINST mechanism / CORRELATION+mechanism rejected; healthy case accepted. A pre-existing channel-polarity observation was recorded separately.
5. L3 — RF-3 causal semantics COMPLETED by subagent and adjudicated PASS:
   - legacy bare `mechanism_code` authority root eliminated;
   - MechanismBinding exact path enforced;
   - no external production caller bypass found;
   - R6 confounder-retention gate preserved;
   - replay/fingerprint/corruption checks PASS;
   - 110 causality+hypothesis and 95 integration tests green;
   - pre-existing AGAINST-in-evidence_for and shared-confounder observations adjudicated NON-MATERIAL/out of Correction-011 delta.
Do NOT rerun L3.

## FIVE-LANE CONTINUITY ACCOUNTING
The original five-lane mandate remains satisfied only when all five logical lanes have evidence. In this continuation:
- L1 — RF-1: PENDING, complete now.
- L2 — RF-2: PENDING, complete now.
- L3 — RF-3: IMPORTED COMPLETE from prior R8; do not rerun.
- L4 — runtime/integration regressions: PENDING, complete now.
- L5 — end-to-end property/metamorphic composition: PENDING, complete now.

Use exactly four new subagent lanes corresponding to the four missing lanes. Do not create a replacement L3. In final report list all five lanes and mark L3 as `IMPORTED COMPLETE — prior R8 durable checkpoint sequence 5`.

## REQUIRED MISSING WORK
### L1 — RF-1 Security / S-1
Adjudicate FAM-A/FAM-B/FAM-C and extend only as needed to establish root scope/materiality. Focus on:
- Unicode Pd plus relevant Sm/Po/Cf separator/delimiter confusables and normalization order;
- token-prefix equivalence classes;
- all-letter credential grammar across scripts without introducing broad benign-prose rejection;
- false-positive/false-negative balance through actual reachable callers;
- exact types, retained propagation and normalization partitions.
If FAM-A/B/C are material, identify bounded root family rather than individual witness patches.

### L2 — RF-2 Hypothesis lifecycle
Falsify the final Correction-011 confirmation governance without repeating already-passed primary probes. Explore historical resolved falsifier identity, cross-channel relabel, freshness, direct construction, leaving/re-entering CONFIRMED, canonical-time aliases, nested/reflective corruption, replay/fingerprint parity and exact runtime types.

### L4 — Runtime/integration regressions
Check changed APIs through reachable consumers, recursive revalidation, constructor parity, retained corruption, Council/authority boundaries, planning/evaluation/replay determinism, and regressions caused by RF-1/RF-2/RF-3 changes. Explicitly test whether RF-1 false positives reject valid Cognitive state beyond the one preserved EvaluationDimensionScore witness.

### L5 — End-to-end property/metamorphic composition
Systematically attack equivalence classes and cross-interactions between RF-1/RF-2/RF-3 and memory/Council/world/planning/tools/learning/evaluation/replay. Prioritize generated/metamorphic evidence over a few hand-picked examples.

## FINAL IMPACT LSP RECHECK
Do not redo the full primary LSP session. After the four missing lanes settle, perform a bounded final impact recheck on any symbols implicated by material findings or final closure. Record concrete LSP evidence. If no new symbol surface arises, state that the imported LSP evidence remains valid and confirm final call-site impact on `contains_secret_material`, hypothesis transition/revalidate surfaces and `MechanismBinding`.

## INTERNAL-EXPERT ESCAPE CLASSIFICATION
A genuine material defect inside RF-1/RF-2/RF-3 or an obvious reachable interaction the upstream Internal Expert should have caught must be labeled:
`HARNESS_QUALITY_FAILURE / INTERNAL_EXPERT_ESCAPE`
This does not replace the semantic verdict.

## REASONING
HIGH baseline; MAX mandatory for Unicode/normalization, security grammar, evidence identity/relabeling, lifecycle authority, contradictions, retained corruption and final closure. Persist HIGH/MAX evidence.

## DISPOSITION
Do not finish until L1+L2+L4+L5 settle, imported L3 is accounted for, final LSP impact recheck is complete, and all candidate material findings are adjudicated.

For every material finding provide deterministic witness, exact location, severity, violated invariant/root cause, neighboring causal scope, `INTERNAL_EXPERT_ESCAPE` classification, and bounded correction family.

If any material defect requiring HEAD mutation exists:
`VALIDACIÓN NO OK`

If and only if all five logical lanes (including imported L3), LSP, HIGH/MAX and family exploration complete with no material defect:
`HALLAZGOS: NINGUNO`
`VALIDACIÓN OK`

If evidence/tooling remains insufficient:
`VALIDATION BLOCKED`

## GOVERNANCE
Coder remains BLOCKED until this R8 continuation produces PASS and IA independently adjudicates the exact frozen HEAD. Do not edit qore-core. No Claude. No Production, Risk, execution or real-capital authority.
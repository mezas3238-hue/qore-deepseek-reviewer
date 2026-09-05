# QORE PR #486 — CIBO Cognitive Superarchitecture — FINAL DeepSeek Expert R8

## ROLE
Act as the independent DeepSeek Expert falsifier for the exact frozen PR #486 candidate produced after Expert R7 returned material findings and Harness Correction-011 executed under the mandatory dual-role system: Harness Engineer + Internal Expert + six distinct subagents. This is a read-only semantic/adversarial review. Do not edit qore-core, push, merge, publish, or infer approval from Harness/Internal-Expert/QG/IA claims.

## EXACT IMMUTABLE BINDING
Repository: `mezas3238-hue/qore-core`
PR: `#486`
BASE: `9672c4d999bd5d3e6db544f349243bc6abea0363`
BASE TREE: `67c77fbe016b6688e5114165a5a14c3026832027`
HEAD: `fda9101415595ebca30ba1b71c7dc26f4ad2b025`
HEAD TREE: `f8e11d8bccbe556a96deeeb6d6f354364a46e1f2`
SYNTHETIC: `ef8589b083242cdcd26eb32637e6a788622b5c5e`
SYNTHETIC parent 1: `9672c4d999bd5d3e6db544f349243bc6abea0363`
SYNTHETIC parent 2: `fda9101415595ebca30ba1b71c7dc26f4ad2b025`
SYNTHETIC TREE: `f8e11d8bccbe556a96deeeb6d6f354364a46e1f2`
SYNTHETIC signature: GitHub verified / valid.

The immutable `requests/current.json` qg_summary is the canonical exact-head QORE CI evidence for this package. Fail closed before model spend if BASE/HEAD/SYNTHETIC/QG binding diverges.

## MANDATORY UPSTREAM DUAL-ROLE INTAKE
This candidate is admissible to External Expert only because upstream Harness evidence satisfies the mandatory work roadmap:

`HARNESS ENGINEER MODE -> SIX DISTINCT SUBAGENTS -> INTERNAL EXPERT MODE -> ADVERSARIAL FIX/REFALSIFY LOOP -> INTERNAL EXPERT CLEAN -> FULL QG -> MATERIALIZE -> EXACT-HEAD QORE CI/FREEZE -> EXTERNAL EXPERT`

Upstream claims are hypotheses, never evidence of External Expert PASS. Independently verify their consequences. If the claimed Internal Expert evidence is absent, internally inconsistent, or not bound to this exact candidate, return `VALIDATION BLOCKED`.

Harness package:
`HARNESS-ENGINEER-QORE-CIBO-COGNITIVE-R7-CORRECTION-011-FULL-FAMILY-RECERTIFICATION-DUAL-ROLE-RESUME-001`

Harness run/job: `33960036104 / 101290211702`
Preserved artifact: `9969543745`
Artifact digest: `sha256:992128a9485e1e86ed7c666027a493cef668b2df1020f1b6bc1df35f343bfeea`
Final candidate patch SHA256: `4c356558164fd4255b6484a69573bce5f9d583e65082a5713e6a180721da36ef`
Patch scope: exactly 7 files, +979/-90, 1069 changed lines.

Durable final state claims:
- lanes 1..6 COMPLETED;
- six distinct subagent identities COMPLETED;
- pending=[]; blocked=[];
- `dual_role_complete=true`;
- `dual_role_gate_passed=true`;
- `internal_expert_clean=true`;
- `HARNESS_INTERNAL_EXPERT_STATUS: CLEAN`;
- `HARNESS_DUAL_ROLE_STATUS: ENGINEER_COMPLETE + INTERNAL_EXPERT_CLEAN`.

The Harness runner ended red with `GENERATIONS_EXHAUSTED` only after the final durable checkpoint had completed all six lanes and dual-role CLEAN state. IA recovered the immutable artifact rather than paying for duplicate reasoning. The authenticated recovery materializer run `33966877349`, job `101308453217`, independently authenticated artifact/package/start/tree/patch, exact 7-file/1069-line scope, reran canonical FULL QG, and atomically materialized the exact patch as this HEAD.

Treat every Harness/Internal Expert closure claim below as a falsifiable hypothesis.

## R7 MATERIAL FAMILIES THAT CORRECTION-011 MUST HAVE CLOSED
Expert R7 returned `VALIDACIÓN NO OK` on predecessor HEAD `d3b79224729b62727f5b02542bf75c4e1f3b1787`. IA accepted five witnesses grouped into three recurrent families:

### RF-1 — Secret material / credential grammar / normalization
R7 exposed:
- token-prefix fail-open through Unicode dash/hyphen/minus homoglyphs;
- long all-letter credential values under ambiguous/weak labels escaping detection.

Correction-011 claims to close the full family, not just witness strings, through principled dash/confusable normalization, bounded token-shape treatment and two-sided benign-prose control. Internal Expert itself found and fixed a false-positive regression where a long all-letter word at the head of ordinary prose was incorrectly treated as a credential.

Falsify across:
- Unicode Pd plus relevant Sm/Po/Cf separator/delimiter confusables and normalization-order permutations;
- token prefixes (OpenAI/GitHub/Slack/AWS/Bearer/JWT/private-key/URL-userinfo) under equivalent delimiters and chunk boundaries;
- weak/ambiguous/unequivocal assignment labels, snake/camel/kebab/concatenated forms;
- all-letter, mixed, punctuation-bearing, padded/unpadded and structurally decodable values;
- false negatives and false positives, especially ordinary finance/security prose;
- nested/revalidated/logical retained material and exact-type/subclass boundaries.

Do not demand an unprincipled word list. Determine whether the grammar and equivalence partitions themselves are correct and complete.

### RF-2 — Hypothesis CONFIRMED governance / evidence identity / lifecycle
R7 exposed:
- SUPPORTS observation relabeled as TEST_RESULT to manufacture CONFIRMED;
- `CONFIRMED -> REVISED -> ACTIVE -> CONFIRMED` reusing old test material.

Correction-011 claims to close the entire confirmation-governance family. During Internal Expert mode Harness found and fixed additional gaps before delivery:
1. leaving CONFIRMED for REVISED without a reason/new information;
2. a previously resolved falsifier being cleared, then later relabeled into favorable evidence to reconfirm;
3. resolved falsifier identities lacking canonical evidence-reference validation.

The final design claims retained/canonical `resolved_falsifier_identities`, exact canonical `(ref, UTC instant)` identity, cross-channel anti-relabel rules, governed leaving/re-entry semantics and constructor/revalidate/logical/fingerprint parity.

Falsify across:
- SUPPORTS/AGAINST/CONTRADICTION/TEST_RESULT cross-channel relabeling;
- same ref+instant with changed content/polarity/channel;
- timestamp aliases representing the same UTC instant;
- historical falsifier resolution and later resurrection/relabel;
- direct CONFIRMED construction vs transitions;
- CONFIRMED/REFUTED/REVISED/ACTIVE cycles and supersession/revision chains;
- duplicate/missing/partial resolutions;
- genuinely-new-evidence requirements;
- malformed/noncanonical/secret-bearing retained refs;
- reflective/nested corruption;
- fingerprint/logical_values/replay/deterministic ordering parity.

Preserve `HYPOTHESIS CONFIRMATION != FAVORABLE OUTCOME`.

### RF-3 — Causation authority / mechanism / confounder provenance
R7 exposed a bare caller-provided `mechanism_code` functioning as an authority root for CAUSATION.

Correction-011 replaces that trust root with an exact `MechanismBinding(code, evidence)` and claims:
- mechanism evidence must be SUPPORTS;
- exact mechanism evidence must be retained in evidence_for;
- mechanism evidence must be distinct from confounder-resolution evidence;
- confounder resolutions remain typed/evidence-bound;
- correlation cannot be escalated to causation through a label, favorable result or reused evidence.

Falsify across:
- absent/weak/AGAINST/CONTRADICTION/LIMITATION mechanism evidence;
- caller labels or convenience booleans leaking authority;
- shared mechanism/confounder evidence;
- unretained/mismatched mechanism evidence;
- same-code/different-fingerprint evidence;
- incomplete/duplicate/mismatched confounder resolution;
- dangling/cross-context references;
- cycles, replay and fingerprint parity;
- reflective corruption and exact runtime-type/subclass laundering;
- integration callers and alternate construction paths.

Preserve `SUMMARY != SOURCE EVIDENCE` and `CORRELATION != CAUSATION`.

## REQUIRED REGRESSION BOUNDARY
Correction-011 must not reopen previously closed Cognitive invariants. Check adjacent reachable paths where the new changes interact, especially:
- Council firewall / intelligence-authority separation;
- canonical-instant equality/dedup/DST-fold semantics;
- exact runtime types and recursive revalidation;
- hypothesis polarity and REFUTED genuinely-new-evidence gates;
- retained-state/fingerprint integrity;
- planning/tool/evaluation/replay determinism;
- CA-01..CA-18 ownership boundaries.

Do not restart R1-R7 indiscriminately and do not demand CIBO Functions #483, Trader Lab #473, provider execution, Risk authority, Production or real capital from Cognitive #482.

## EXACT FIVE-LANE EXTERNAL EXPERT REVIEW
Use exactly five non-duplicative logical lanes, all evidence-preserving:
1. **L1 — RF-1 Security / S-1:** Unicode/confusable/normalization credential grammar, token boundaries, false negatives/positives, retained propagation.
2. **L2 — RF-2 Hypothesis lifecycle:** confirmation evidence identity, historical/resolved falsifiers, relabel prevention, revision/resurrection/supersession, canonical time and channel polarity.
3. **L3 — RF-3 Causal semantics:** MechanismBinding, mechanism/confounder evidence provenance, authority-root elimination, composition/replay/fingerprint/runtime exactness.
4. **L4 — Runtime/integration regressions:** recursive revalidation, constructor parity, exact types, retained corruption, callers/reachable paths, prior neighboring closures and authority boundaries.
5. **L5 — End-to-end property/metamorphic composition:** systematic equivalence classes and cross-interactions among RF-1/RF-2/RF-3 and Cognitive memory/Council/world/planning/tools/learning/evaluation/replay.

Use a shared evidence map only for deduplication. Preserve independent lane reasoning and witnesses.

## SEMANTIC LSP — MANDATORY
Primary Expert session must provide concrete usable evidence for:
- `findReferences`
- `goToDefinition`
- `goToImplementation` where applicable
- `hover`
- relevant symbols and modified APIs (`contains_secret_material`, hypothesis transition/build/revalidate surfaces, `MechanismBinding`, `build_causal_claim`)
- call sites/reachable consumers
- final impact recheck

A textual statement that LSP was used without concrete evidence yields `VALIDATION BLOCKED`.

## REASONING
HIGH baseline. MAX mandatory for:
- security / Unicode / normalization / parser ambiguity;
- evidence identity, channel relabeling and lifecycle authority;
- causation/mechanism/confounder authority roots;
- canonical-time ambiguity and retained corruption;
- contradictions and final semantic closure.

Persist HIGH/MAX evidence in durable checkpoints.

## INTERNAL-EXPERT ESCAPE CLASSIFICATION
The upstream Internal Expert is not trusted as an approval source. External Expert must attempt to falsify it aggressively.

If External Expert discovers a genuine material defect that falls inside the mandated RF-1/RF-2/RF-3 family model or an obvious interaction the Internal Expert should have covered, explicitly label it:
`HARNESS_QUALITY_FAILURE / INTERNAL_EXPERT_ESCAPE`

That classification does not alter the normal semantic verdict: any material defect still means `VALIDACIÓN NO OK` and Coder remains BLOCKED.

## CONTINUITY / COST DISCIPLINE
This is a new external review of a new frozen HEAD, not a restart of prior rounds. Focus model spend on Correction-011, the three recurrent families and their reachable interactions. Persist durable checkpoints with binding, completed lanes, findings/witnesses, LSP evidence, HIGH/MAX decisions, remaining work and exact next action. If interrupted, resume missing work only.

## DISPOSITION
For each material finding provide:
- deterministic witness;
- exact location;
- severity;
- violated invariant/root cause;
- neighboring causal scope;
- whether it is an `INTERNAL_EXPERT_ESCAPE`;
- bounded correction family.

One material defect requiring HEAD mutation means:
`VALIDACIÓN NO OK`

If and only if all five lanes + semantic LSP + HIGH/MAX + required family exploration complete with no material defect, conclude exactly:

`HALLAZGOS: NINGUNO`
`VALIDACIÓN OK`

If tooling/evidence is insufficient, return:
`VALIDATION BLOCKED`

## GOVERNANCE
External Expert remains independent and adversarial. Internal Expert CLEAN is an intake prerequisite, not an approval. Coder remains blocked until Expert R8 PASS and IA independently adjudicates this exact frozen HEAD. Claude is excluded. No Production, Risk, execution or real-capital authorization is in scope.

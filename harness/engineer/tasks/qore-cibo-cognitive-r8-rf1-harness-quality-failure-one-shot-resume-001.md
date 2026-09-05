# QORE Harness Engineer — PR486 Cognitive — R8 RF-1 QUALITY-FAILURE ONE-SHOT RESUME

## CONTINUITY CLASSIFICATION

This is the SAME logical Harness work as:
`HARNESS-ENGINEER-QORE-CIBO-COGNITIVE-R8-RF1-QUALITY-FAILURE-ONE-SHOT-001`.

It is a recovery successor, NOT a new correction family and NOT a restart. Preserve all technically valid work from the failed workflow artifact and continue only unfinished work.

Predecessor run/job: `33970738760 / 101318677878`.
Recovery artifact: `9971823948`.
Artifact digest: `sha256:81a7cd2c8168144c219b8cf46d442ddc0ce7177d8dd9da6cb29d92ddd01e90ec`.
Recovered candidate patch SHA256: `5838ddcdecdcc8c7084113733ff9baefb678356f9c127cc1bdabb34287b58e4c`.

The predecessor failed because the agent checkpoint used the transient state `DISPATCHING`, which the host state parser rejected. This was infrastructure/state-protocol failure, not evidence that the recovered candidate patch is invalid.

## IMMUTABLE START BINDING

Repository: `mezas3238-hue/qore-core`
PR: `#486`
BASE: `9672c4d999bd5d3e6db544f349243bc6abea0363`
START / HEAD: `fda9101415595ebca30ba1b71c7dc26f4ad2b025`
START TREE: `f8e11d8bccbe556a96deeeb6d6f354364a46e1f2`
SYNTHETIC: `ef8589b083242cdcd26eb32637e6a788622b5c5e`

The host will restore the byte-verified patch BEFORE API spend. Inspect it as inherited work. Do not recreate or discard it.

## PRESERVED TECHNICAL WORK

The predecessor patch already changes only:
- `src/qore/modules/cibo/cognitive_contracts.py`
- `tests/modules/cibo/test_cibo_cognitive_contracts.py`

Durable/unpublished evidence recorded before the state-protocol failure:
- RF-1 seed witnesses were reproduced and passing on the inherited candidate;
- an Engineer-mode refinement was implemented so `_BARE_NON_LATIN_TOKEN_VALUE` is a shape gate and Unicode-script classification distinguishes non-ASCII Latin benign prose from genuinely non-Latin credential-like values;
- non-ASCII Latin benign controls were added;
- 403 focused Cognitive contract tests were reported passing before the interrupted lane collection;
- L5 had raised an additional material fail-open that still requires collection/reproduction/adjudication.

Treat all of that as inherited evidence to verify, not as final authority. Continue the family closure from the restored candidate.

## MANDATORY CHECKPOINT STATE PROTOCOL

The host state machine accepts ONLY these exact lane/subagent states:
- `NOT_STARTED`
- `RUNNING`
- `CHECKPOINTED`
- `COMPLETED`
- `RECOVERY_REQUIRED`
- `MATERIAL_BLOCKED`

`DISPATCHING` IS FORBIDDEN in every `QORE_LANE_STATE` and `QORE_SUBAGENT_STATE` line.

When a native subagent is being launched or is executing, record `RUNNING`, never `DISPATCHING`.

Before every checkpoint append, validate mentally that every durable lane/subagent state is in the exact allowlist above. An invalid transient state is an infrastructure protocol violation and must not be written.

## MANDATORY DUAL-ROLE ONE-SHOT CONTRACT

Load and obey:
`harness/engineer/QORE-HARNESS-DUAL-ROLE-ONE-SHOT-POLICY-V1.md`.

This remains ONE work package:
`HARNESS_ENGINEER_MODE -> six-subagent family closure -> implementation -> HARNESS_INTERNAL_EXPERT_MODE -> adversarial refalsification -> fix inside same package -> repeat until CLEAN/BLOCKED -> FULL QG`.

Exactly six distinct subagent identities are mandatory. L6 remains the fresh post-implementation challenger and must not be used as an implementation lane.

No known RF-1 issue may be intentionally deferred to External Expert.

## RF-1 FAMILY TO CLOSE

Preserve the full family model from the predecessor task:
`harness/engineer/tasks/qore-cibo-cognitive-r8-rf1-harness-quality-failure-one-shot-001.md`.

The three accepted external escapes remain mandatory seed evidence:
1. Unicode semantic delimiter equivalence including U+180A and neighboring relevant classes;
2. benign-prose false positives introduced by all-letter credential handling;
3. ASCII-only credential-value authority causing non-Latin fail-open behavior.

Do not patch witnesses individually. Re-falsify the complete delimiter/value/prose/script cross-product and every reachable `contains_secret_material` consumer.

## EXACT RECOVERY EXECUTION

1. Verify restored patch SHA and exact START/TREE.
2. Run focused tests to confirm inherited candidate state.
3. Resume/redo only technical lane work that lacks durable terminal evidence. Because the predecessor host journal could not publish its invalid `DISPATCHING` checkpoint, do not falsely mark those lanes completed; consume the preserved patch/session evidence, then launch the required six lanes with VALID states.
4. Collect L1-L5 terminal evidence; investigate the preserved L5 material fail-open before claiming closure.
5. Repair any material gap inside this same package.
6. Perform semantic LSP after the final implementation.
7. Launch a fresh L6 challenger against the exact final patch.
8. Enter explicit `HARNESS_INTERNAL_EXPERT_MODE` and attack the final candidate across all six adversarial specialties.
9. Any Internal Expert finding returns to Engineer Mode inside this same package; mutate, retest, refalsify, and invalidate prior CLEAN.
10. Only after a final unchanged candidate survives Internal Expert may the required terminal markers be emitted.

## REQUIRED FINAL MARKERS

Candidate-ready is forbidden unless the durable final checkpoint/report contains exactly:

`HARNESS_INTERNAL_EXPERT_STATUS: CLEAN`

`HARNESS_DUAL_ROLE_STATUS: ENGINEER_COMPLETE + INTERNAL_EXPERT_CLEAN`

and the handoff target:

`EXTERNAL EXPERT EXPECTED PASS`

Any `MATERIAL_GAP` => BLOCKED.

## LSP / REASONING / QG

Semantic LSP before/after mandatory: findReferences, goToDefinition, goToImplementation where applicable, hover, reachable consumers, final impact recheck.

HIGH baseline; MAX mandatory for Unicode/security grammar, false-positive/false-negative tradeoffs, family contradictions and final closure.

Host canonical FULL QG after candidate-ready:
- `git diff --check`
- `ruff check .`
- `mypy src tests`
- `pytest --cov=src/qore --cov-report=term-missing`

Artifact-only. No commit/push/merge. No Production/real-capital authority.

## TARGET

Resume from the byte-verified inherited candidate and finish the SAME RF-1 one-shot job. Deliver one internally-clean candidate or an honest BLOCKED state. Do not restart completed implementation work and do not emit unsupported transient checkpoint states.
# QORE HARNESS DUAL-ROLE ONE-SHOT POLICY V1

## Status

MANDATORY GLOBAL POLICY for every Harness Engineer work package.

This policy applies to all current and future Harness Engineer work. It is not project-specific, finding-specific, CIBO-specific, or chat-specific.

## Supreme rule

`HARNESS WORK IS NOT COMPLETE WHEN ENGINEERING IS COMPLETE.`

`HARNESS WORK IS COMPLETE ONLY WHEN ENGINEERING IS COMPLETE + INTERNAL EXPERT IS CLEAN.`

Every Harness work package is executed as two mandatory logical roles inside the SAME Harness workflow and the SAME work package:

1. `HARNESS_ENGINEER_MODE` — builds, fixes, tests, models and integrates the complete assigned scope.
2. `HARNESS_INTERNAL_EXPERT_MODE` — independently attempts to break the exact candidate produced by Engineer Mode before external handoff.

The six Harness subagents support BOTH roles. Harness may iterate between the two roles as many times as necessary inside the same work package.

## One work package, one complete delivery

Hard laws:

`ONE WORK PACKAGE = ONE HARNESS DELIVERY`

`ONE HARNESS WORKFLOW = ENGINEER + INTERNAL EXPERT`

`NO MATERIAL DEFECT MAY BE DEFERRED TO EXTERNAL EXPERT`

`INTERNAL FINDING = FIX INSIDE THE SAME HARNESS WORK PACKAGE`

`INTERNAL EXPERT CLEAN IS REQUIRED BEFORE HANDOFF`

`EXTERNAL EXPERT PASS IS THE ACCEPTANCE TARGET`

`EXTERNAL EXPERT REMAINS INDEPENDENT`

`EXTERNAL MATERIAL ESCAPE AFTER INTERNAL CLEAN = HARNESS_QUALITY_FAILURE`

A chain such as Harness -> External Expert finding -> Harness Correction-N -> External Expert finding is NOT the intended operating model. Harness must consume the time necessary, including approximately two hours when the allowed window permits, to perform both engineering and adversarial falsification before it emits a candidate.

If the work cannot be completed to this standard inside the available execution window, Harness must return `BLOCKED` or an interruption/recovery state with durable evidence. It must not emit an optimistic candidate.

## Phase A — HARNESS_ENGINEER_MODE

Harness Engineer owns complete engineering closure of the assigned scope.

Required behavior:
- verify exact START/TREE and recovery state;
- use semantic LSP before design and after implementation;
- invoke exactly six distinct subagent lanes with evidence of identity/context;
- reproduce accepted findings and derive root causes;
- build FAMILY_MODEL coverage for each material causal family;
- inspect directly reachable callers, retained state, serialization/replay and integration boundaries;
- implement family-complete corrections, not witness patches;
- add normal, adversarial, exhaustive/property/metamorphic and benign-control tests;
- run focused validation while iterating;
- preserve prior accepted closures and fail-closed laws;
- refresh durable checkpoints and recovery patch continuously.

Engineer Mode does NOT authorize candidate-ready by itself.

## Phase B — HARNESS_INTERNAL_EXPERT_MODE

After Engineer Mode has a candidate and focused/systematic validation plus LSP-after are complete, Harness MUST change posture.

Internal Expert Mode is an adversarial reviewer, not a defender of Engineer Mode.

The Internal Expert must treat all implementation rationale, closure claims and tests from Engineer Mode as hypotheses to falsify, not as proof.

Internal Expert Mode must receive the exact candidate and independently attempt to break it across the complete assigned scope, aided by all six logical subagent specialties.

The six adversarial specialties are:

1. architecture/contracts/runtime-types/trust-root falsification;
2. witness-independent adversarial red-team and alternate reachable paths;
3. security/Unicode/normalization/parsing/input-boundary/false-positive-negative attacks;
4. property/metamorphic/exhaustive equivalence and cross-product attacks;
5. historical regression/retained-state/serialization/replay/integration attacks;
6. fresh final cross-interaction challenger over the exact final patch.

Each adversarial pass must generate NEW probes in addition to replaying known witnesses.

Internal Expert must challenge, where reachable:
- exact runtime types and subclass/type laundering;
- malformed/fabricated/post-construction-corrupted retained state;
- constructor/revalidate parity;
- serialization/replay and deterministic identity;
- authority/trust-root laundering;
- caller-asserted evidence or causation;
- normalization/confusables/delimiters/Unicode transforms;
- false positives and false negatives;
- historical witnesses and prior closures;
- alternate callers and integration paths;
- family-model equivalence assumptions;
- second-order cross-interactions among dimensions;
- tests that mirror implementation instead of proving invariants.

## Mandatory internal repair loop

If Internal Expert or ANY of the six adversarial subagents finds a material defect:

1. Harness MUST NOT finish.
2. Record the witness, root family, affected dimension and evidence in the durable journal.
3. Return to `HARNESS_ENGINEER_MODE` inside the SAME work package.
4. Correct the whole affected causal class, not only the witness.
5. Rerun affected focused/property/metamorphic tests and semantic LSP-after.
6. Refresh the exact recovery patch.
7. Start a NEW `HARNESS_INTERNAL_EXPERT_MODE` adversarial pass against the mutated candidate.

Repeat:

`ENGINEER -> INTERNAL EXPERT -> FINDING -> ENGINEER FIX -> INTERNAL EXPERT AGAIN`

until either:
- no material finding remains and Internal Expert is clean; or
- an honest blocker/interruption prevents completion.

A failed internal adversarial pass is evidence, not a reason to create a new Correction job.

## Internal Expert Clean gate

Harness may hand off only when ALL conditions are true:
- Engineer Mode complete;
- exactly 6/6 real subagent identities evidenced;
- all material causal families modeled and closed without `MATERIAL_GAP`;
- all accepted witnesses reject after correction;
- generated adversarial/property/metamorphic probes pass;
- benign controls pass;
- prior relevant closures remain intact;
- LSP-before and LSP-after evidence complete;
- Internal Expert Mode executed after the final engineering mutation;
- all six adversarial specialties were covered on the final candidate;
- the final cross-interaction challenger is clean;
- zero known material defect or material uncertainty is deferred to External Expert;
- no semantic mutation occurred after the final clean Internal Expert pass;
- canonical external FULL QG can be run on the unchanged patch.

Required terminal evidence:

`HARNESS_INTERNAL_EXPERT_STATUS: CLEAN`

`HARNESS_DUAL_ROLE_STATUS: ENGINEER_COMPLETE + INTERNAL_EXPERT_CLEAN`

`HARNESS_HANDOFF_TARGET: EXTERNAL_EXPERT_EXPECTED_PASS`

This means Harness has reached its acceptance target. It does NOT authorize the external Expert to trust Harness or fabricate PASS.

## External Expert independence

External DeepSeek Expert remains a separate read-only falsifier over the exact frozen candidate.

`INTERNAL EXPERT CLEAN != EXTERNAL EXPERT PASS`

External Expert must attempt to break the candidate independently and retain its own five-lane, LSP, HIGH/MAX, checkpoint and root-family obligations.

However, a Harness candidate reaching External Expert is expected to have already survived Engineer + Internal Expert adversarial closure. Therefore an external material finding that should have been discoverable under this policy is classified:

`HARNESS_QUALITY_FAILURE`

It is not treated as a normal healthy correction loop.

## Recovery semantics

A cancellation, quota loss, timeout or cost-window stop does not create a new engineering assignment. Recovery continues the SAME Harness work package from its durable checkpoints and patch.

Completed Engineer/Internal-Expert work is inherited when binding is unchanged. A partially executed Internal Expert pass resumes only missing adversarial units; if the candidate mutates after recovery, the final Internal Expert clean pass must be rerun against the new exact patch.

## Final law

`HARNESS DOES NOT DELIVER WHAT IT HAS FINISHED BUILDING.`

`HARNESS DELIVERS ONLY WHAT IT HAS FINISHED BUILDING AND THEN FAILED TO BREAK.`

# QORE Recurrent Family Recertification Policy v1

## Purpose

Prevent endless correction loops in which Harness fixes one externally demonstrated witness, declares a family exhausted, and a later independent reviewer discovers another adjacent witness from the same semantic invariant.

This policy applies to Harness Engineer packages and is quality-preserving. It does not weaken Expert/Coder gates and does not broaden a correction into an indiscriminate whole-system re-audit.

## Escalation trigger

A family becomes `RECURRENT` and MUST use `FULL_FAMILY_RECERTIFICATION` if any of the following occurs:

1. An external reviewer finds a new material witness in the same causal invariant after Harness previously declared that family exhausted.
2. The same semantic family survives two or more external review rounds.
3. Multiple corrections successively expose adjacent transforms/states/channels/value classes of one root invariant.
4. Integration Authority explicitly marks the family recurrent.

Once escalated, witness-local correction is prohibited.

## Full-family recertification

The listed findings are seed witnesses only. Harness must model the complete bounded family by identifying all decision-changing dimensions, equivalence classes, cross-interactions, benign controls, historical witnesses and reachable consumers.

Every material dimension must be disposed as one of:

- `EXHAUSTIVELY_ENUMERATED`
- `PROPERTY_COVERED`
- `EQUIVALENCE_REDUCED_WITH_PROOF`
- `PROVEN_UNREACHABLE`
- `MATERIAL_GAP`

Any `MATERIAL_GAP` blocks candidate-ready.

A closure argument must explain why the invariant is closed, not merely cite passing tests.

## Six-lane sequencing

Harness v3 changes the sequence:

- L1 Architecture/contracts/trust boundaries
- L2 Seed witness reproduction/adversarial neighbors
- L3 Security/normalization/parsing/input boundaries
- L4 Property/metamorphic/systematic family model
- L5 Historical regression/causal-neighbor/integration model
- L6 POST-IMPLEMENTATION independent self-falsification

L1–L5 complete before implementation synthesis. L6 is intentionally withheld until the final candidate patch exists and focused/systematic validation plus LSP-after have passed.

## Post-implementation self-falsification

L6 must be a fresh adversarial subagent/context that did not design or implement the candidate. It receives the invariant/family model, exact final patch, historical counterexamples and regression laws; implementation rationale is not treated as proof.

Its sole objective is to break the candidate by creating new witnesses and attacking every family-model dimension and relevant cross-interaction.

If L6 finds a material defect:

1. L6 does not complete.
2. The witness and affected family-model dimension are checkpointed.
3. Harness corrects the complete class, not the witness alone.
4. Focused/property validation and LSP-after are repeated.
5. A NEW fresh L6 challenger reviews the mutated candidate.

Only a clean challenge against the final unchanged patch may mark L6 complete.

## Escape rule

If a later external Expert/Coder finds another material witness from a family that Harness v3 recertified, the event is recorded as a recertification escape. The next Harness package must begin from the failed family model and identify which dimension/equivalence reduction was wrong or missing. It may not simply add the new witness to tests and repeat the previous closure claim.

## Efficiency rule

Full-family recertification remains bounded to the recurrent family and its causally reachable neighbors. Previously certified unrelated families are regression obligations, not investigation targets.

The purpose is fewer external correction rounds at equal or higher semantic quality—not larger indiscriminate audits.

## Cost-window governance

DeepSeek Harness starts must respect the configured America/Asuncion cost window. Auto-dispatch is blocked late enough that a long Harness run would risk crossing the allowed token-cost window, and active model execution is hard-stopped before the end of that window while preserving recovery evidence.

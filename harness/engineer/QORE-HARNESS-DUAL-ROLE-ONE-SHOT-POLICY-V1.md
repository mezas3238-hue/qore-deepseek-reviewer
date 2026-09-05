# QORE HARNESS DUAL-ROLE ONE-SHOT POLICY V1 — CURRENT INTERPRETATION

## Status

MANDATORY umbrella policy. The active separation and repair semantics are defined by:

`harness/engineer/QORE-HARNESS-INDEPENDENT-AUDIT-REPAIR-POLICY-V2.md`

## Supreme rule

`ONE WORK PACKAGE = ENGINEERING + INDEPENDENT INTERNAL AUDIT-REPAIR + FINAL INTERNAL CLEAN`

The two roles are NOT one model session changing posture.

1. `HARNESS_ENGINEER_AGENT` performs the initial engineering work with exactly six engineering lanes.
2. `HARNESS_INTERNAL_EXPERT_AGENT` is a contextually independent auditor-remediator with five audit lanes.

They do not share identity, transcript, rationale, subagent outputs or reasoning context.

## Handoff law

Engineer completes its initial work and emits:

`ENGINEERING_READY_FOR_INDEPENDENT_AUDIT`

The deterministic host freezes the exact candidate and hands only the candidate bytes/hash and technical audit evidence to the Internal Expert. The Internal Expert must not be told who implemented it.

After this handoff, Engineer does not participate in ordinary audit corrections.

## Internal Expert law

Internal Expert acts epistemically like the External Expert: it audits the whole bounded candidate from first principles through five independent reviewer lanes.

Unlike External Expert, Internal Expert has bounded repair authority in its isolated candidate workspace.

If it finds a material defect:

`FIND -> ROOT CAUSE -> REPAIR COMPLETE CAUSAL CLASS -> TEST -> FULL FIVE-LANE RE-AUDIT`

Repeat inside the Internal Expert work phase until CLEAN or honest BLOCKED.

The Internal Expert may repair what it finds and may declare internal CLEAN after a complete final re-audit of the corrected candidate. It does not send ordinary findings back to Engineer.

## Clean meaning

The host may mint:

`HARNESS_INTERNAL_EXPERT_STATUS: CLEAN`

`HARNESS_DUAL_ROLE_STATUS: ENGINEER_COMPLETE + INTERNAL_EXPERT_CLEAN`

only when the exact final patch produced by the audit-repair phase is hash-bound, all five final audit lanes are complete, zero material finding remains, and the final full audit occurred after the last mutation.

This means:

`INTERNAL_WORK_COMPLETE_FOR_IA_ADJUDICATION`

It does NOT mean External Expert PASS, merge authorization, Production readiness or real-capital authorization.

## External independence

External Expert remains mandatory and must independently attack the frozen final candidate. It receives no Internal Expert reasoning as proof.

`INTERNAL EXPERT CLEAN != EXTERNAL EXPERT PASS`

## Recovery

An infrastructure interruption preserves the same work package, candidate patch and durable evidence. Completed engineering work is not repeated. Once audit handoff has occurred, recovery continues the Internal Expert audit-repair phase rather than returning ordinary findings to Engineer.

## Final law

`HARNESS BUILDS.`

`INTERNAL EXPERT, INDEPENDENT FROM HARNESS CONTEXT, AUDITS + REPAIRS + RE-AUDITS.`

`IA ADJUDICATES.`

`EXTERNAL EXPERT VALIDATES INDEPENDENTLY.`
# QORE HARNESS DUAL-ROLE ONE-SHOT POLICY V1

## Status

MANDATORY GLOBAL POLICY.

The canonical execution architecture is now:

`harness/engineer/QORE-HARNESS-INDEPENDENT-DUAL-AGENT-POLICY-V1.md`

This document preserves the one-shot law while replacing the former interpretation in which one Harness session changed posture and reused the same six subagents for self-review.

## Supreme rule

`ONE WORK PACKAGE = ONE COMPLETE HARNESS DELIVERY`

`WORK COMPLETE = ENGINEERING COMPLETE + INDEPENDENT INTERNAL AUDIT CLEAN`

The two required roles are now two separate agents/contexts inside the same Harness workflow:

1. `HARNESS_ENGINEER_AGENT`
2. `HARNESS_INTERNAL_EXPERT_AGENT`

They MUST NOT share transcripts, hidden reasoning, session memory or subagent contexts.

## Engineer side

Engineer owns implementation and has exactly six engineering lanes:

1. architecture/contracts/runtime/trust boundaries;
2. witness reproduction/adversarial engineering;
3. security/Unicode/normalization/parsing/input boundaries;
4. property/metamorphic/systematic engineering exploration;
5. historical regression/replay/integration/callers;
6. implementation-impact/final engineering coherence.

Those six lanes belong only to Engineer.

Engineer may receive only normalized host `VALIDATION_FINDINGS` after an audit fails. It does not receive the auditor identity, transcript, reasoning, lane notes or session memory.

## Internal Expert side

Internal Expert is a fresh independent auditor over an isolated copy of the exact candidate. It has five reviewer lanes equivalent in purpose to External Expert:

- IE-L1 architecture/contracts/runtime/trust-root falsification;
- IE-L2 security/input/Unicode/normalization/boundary falsification;
- IE-L3 historical regression/retained-state/replay/integration falsification;
- IE-L4 property/metamorphic/systematic equivalence exploration;
- IE-L5 final cross-interaction/reachable-path challenger.

Those five lanes belong only to Internal Expert.

Internal Expert receives no Engineer transcript, rationale, checkpoint narrative, subagent output or prior audit reasoning. It sees only the bounded audit contract, exact START/TREE, isolated exact candidate, changed files and candidate patch SHA256.

## Mandatory host-controlled loop

`ENGINEER -> EXACT PATCH SNAPSHOT -> FRESH INTERNAL EXPERT FULL AUDIT`

If Internal Expert returns material findings:

`STRUCTURED FINDINGS -> ENGINEER REPAIR -> NEW PATCH SHA256 -> NEW FRESH INTERNAL EXPERT FULL AUDIT`

Repeat inside the SAME work package until CLEAN or honest BLOCKED/interrupted.

A prior audit is invalid after any candidate mutation.

## Structured boundary

Only structured defect evidence crosses from validation to engineering:

- finding_id
- severity
- root_family
- witness
- expected
- observed
- affected_paths
- violated_invariant
- reproduction

No reasoning transcript crosses the boundary.

## Candidate binding

Every Internal Expert audit is bound to exact `candidate_patch_sha256`.

The host creates an isolated audit checkout and verifies the patch before review. If the audit copy is mutated during review, that audit is invalid and cannot produce CLEAN.

A CLEAN result may be minted into Harness terminal markers only by the deterministic host, never by Engineer:

`HARNESS_INTERNAL_EXPERT_STATUS: CLEAN`

`HARNESS_DUAL_ROLE_STATUS: ENGINEER_COMPLETE + INTERNAL_EXPERT_CLEAN`

## One-shot repair law

A material Internal Expert finding is not a new Correction job. It is repaired inside the same Harness work package.

`ENGINEER -> AUDIT -> FINDING -> ENGINEER FIX -> FRESH AUDIT AGAIN`

continues until clean or blocked.

## Recovery

Workflow interruption does not restart engineering or create a new assignment. Engineer patch/checkpoints remain durable. An audit may be reused only when it was produced under the independent dual-agent policy and the exact candidate patch SHA256 is unchanged.

## External Expert

External Expert remains a separate later gate and receives no special trust from Internal Expert CLEAN.

However, the quality target is that External Expert confirms rather than routinely discovers defects. An external material escape from a family validly audited CLEAN is:

`HARNESS_QUALITY_FAILURE / INTERNAL_EXPERT_ESCAPE`

## Final law

`ENGINEER BUILDS IN ITS OWN CONTEXT.`

`INTERNAL EXPERT AUDITS IN A DIFFERENT FRESH CONTEXT.`

`THE HOST PASSES ONLY STRUCTURED DEFECT EVIDENCE BETWEEN THEM.`

`ANY FIX REQUIRES A NEW FULL INDEPENDENT AUDIT.`

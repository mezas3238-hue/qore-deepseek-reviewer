# QORE HARNESS INDEPENDENT AUDIT-REPAIR POLICY V2

## Status

MANDATORY GLOBAL POLICY for Harness work after adoption.

This policy supersedes any interpretation in which the Internal Expert is merely the Engineer changing posture, and it also supersedes the intermediate design that required every Internal Expert finding to return to Engineer for repair.

## Supreme architecture

One Harness work package has two contextually independent phases:

1. `HARNESS_ENGINEER_AGENT` — builds the bounded candidate.
2. `HARNESS_INTERNAL_EXPERT_AGENT` — receives only the completed candidate and audit contract, independently audits it, repairs any defects it discovers, and re-audits until internally CLEAN or honestly BLOCKED.

They are isolated by a deterministic host.

Hard laws:

`SAME WORK PACKAGE != SAME AGENT CONTEXT`

`INTERNAL EXPERT DOES NOT KNOW THE ENGINEER IDENTITY, TRANSCRIPT, RATIONALE OR SUBAGENT OUTPUTS`

`ENGINEER DOES NOT PARTICIPATE AFTER AUDIT HANDOFF`

`INTERNAL EXPERT MAY REPAIR ITS AUDIT FINDINGS DIRECTLY`

`EVERY INTERNAL REPAIR REQUIRES A FULL FIVE-LANE RE-AUDIT BEFORE INTERNAL CLEAN`

`INTERNAL CLEAN = WORK COMPLETE FOR IA ADJUDICATION, NOT EXTERNAL CERTIFICATION`

`EXTERNAL EXPERT REMAINS A SEPARATE INDEPENDENT VALIDATOR`

## 1. Engineer phase

Engineer receives only the engineering contract, exact START/TREE, allowed paths, repository code/tests/LSP and its own durable engineering checkpoints.

Engineer owns:
- implementation;
- exactly six engineering subagent lanes;
- root-family modeling;
- normal/adversarial/property/metamorphic tests;
- semantic LSP before/after;
- candidate patch production.

Engineer terminal status is:

`ENGINEERING_READY_FOR_INDEPENDENT_AUDIT`

After that handoff, Engineer is not called again for ordinary audit findings.

## 2. Internal Expert independence

The Internal Expert is created in an isolated audit workspace/context. It receives only:
- bounded task/audit contract;
- exact START/TREE;
- the candidate bytes/patch;
- initial candidate patch SHA256;
- changed-file list;
- repository evidence available from the isolated checkout.

It MUST NOT receive:
- Engineer transcript;
- Engineer reasoning/rationale;
- Engineer checkpoint prose;
- Engineer subagent outputs;
- Engineer identity;
- any claim by Engineer that the candidate is correct.

The Internal Expert must reconstruct invariants/families from first principles and act epistemically like the External Expert.

## 3. Internal Expert five-lane audit

The Internal Expert owns five reviewer lanes:
- IE-L1 architecture/contracts/runtime/trust-root falsification;
- IE-L2 security/input/Unicode/normalization/boundary falsification;
- IE-L3 historical regression/retained-state/replay/integration falsification;
- IE-L4 property/metamorphic/systematic equivalence exploration;
- IE-L5 final cross-interaction/reachable-path challenger.

These five lanes are independent of Engineer's six lanes and do not reuse Engineer subagents or reasoning context.

## 4. Audit-repair authority

Unlike the External Expert, Internal Expert has bounded write authority inside its isolated candidate workspace.

When it finds a material defect, it MUST:
1. reproduce the defect;
2. root-cause the complete causal family;
3. repair the complete affected class inside the declared allowlist/contract;
4. add/strengthen tests as required;
5. run focused validation and LSP-after;
6. update the candidate;
7. re-run a FULL five-lane audit over the corrected candidate.

It MUST NOT return an ordinary material finding to Engineer for repair.

If the repair requires scope/authority beyond the bounded contract, Internal Expert returns BLOCKED with exact evidence rather than widening authority.

## 5. Internal repair loop

Execution model:

`ENGINEER -> EXACT CANDIDATE HANDOFF -> INTERNAL EXPERT AUDIT`

If Internal Expert finds defects:

`FIND -> ROOT CAUSE -> FIX -> TEST -> FULL RE-AUDIT`

Repeat inside the same Internal Expert work phase until:
- the final corrected candidate has zero material findings after a complete IE-L1..IE-L5 pass; or
- an honest blocker prevents safe completion.

Harness Engineer does not re-enter this loop.

## 6. Internal CLEAN meaning

The Internal Expert may declare `CLEAN` after repairing defects itself, provided the FINAL corrected candidate has been fully re-audited after the last mutation.

This CLEAN means:

`INTERNAL_WORK_COMPLETE_FOR_IA_ADJUDICATION`

It does NOT mean:
- External Expert PASS;
- final Integration Authority approval;
- merge authorization;
- Production/real-capital authorization.

A separate External Expert remains mandatory afterward.

## 7. Deterministic host obligations

The host must:
- keep Engineer and Internal Expert session homes/transcripts isolated;
- create an isolated audit workspace from the exact Engineer candidate;
- permit Internal Expert writes only inside the bounded audit workspace;
- compute initial and final candidate patch SHA256 values independently;
- reject a claimed CLEAN if the reported final hash does not match actual bytes;
- require all five final audit lanes COMPLETED;
- require zero material findings on the final full audit;
- require repair accounting when the final patch differs from the initial patch;
- export the final Internal-Expert-corrected patch back into the canonical candidate workspace only after a valid CLEAN;
- run the deterministic scope gate and canonical FULL QG afterward;
- preserve artifacts, audit history, repair accounting and exact hashes for IA adjudication.

## 8. External Expert

After Internal Expert CLEAN + deterministic gate + FULL QG + IA freeze/adjudication, External Expert receives the frozen candidate independently.

External Expert remains read-only and must not trust the internal CLEAN.

`INTERNAL EXPERT CLEAN != EXTERNAL EXPERT PASS`

If External Expert finds a material defect that should have been discoverable by the Internal Expert's five-lane audit, classify it as an Internal Expert quality failure and improve the audit system rather than treating endless correction rounds as normal.

## Final law

`HARNESS BUILDS.`

`INTERNAL EXPERT INDEPENDENTLY AUDITS, REPAIRS, AND RE-AUDITS.`

`IA ADJUDICATES.`

`EXTERNAL EXPERT VALIDATES INDEPENDENTLY.`
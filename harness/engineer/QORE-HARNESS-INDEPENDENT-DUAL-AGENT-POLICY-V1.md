# QORE HARNESS INDEPENDENT DUAL-AGENT POLICY V1 — SUPERSEDED

This policy is retained only as historical continuity.

The active canonical policy is:

`harness/engineer/QORE-HARNESS-INDEPENDENT-AUDIT-REPAIR-POLICY-V2.md`

V2 preserves contextual independence between implementation and audit, but changes the repair loop:

- the implementation role finishes and hands off the exact candidate;
- the independent Internal Expert does not know the implementation identity, transcript, rationale or subagent outputs;
- the Internal Expert audits like the External Expert;
- when it finds a bounded material defect, it repairs that defect directly in its isolated candidate;
- it then performs a full five-lane re-audit after the last mutation;
- ordinary audit findings are NOT returned to the implementation role;
- Internal Expert CLEAN means internal work complete for Integration Authority adjudication, not External Expert PASS;
- External Expert remains a separate independent validation gate.

Do not use the former `finding -> Engineer repair -> fresh Internal Expert` interpretation for new work.
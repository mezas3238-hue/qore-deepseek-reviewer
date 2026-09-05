# QORE HARNESS INDEPENDENT DUAL-AGENT POLICY V1

## Status

MANDATORY GLOBAL POLICY for Harness work after adoption.

This policy supersedes any interpretation of `HARNESS_INTERNAL_EXPERT_MODE` as the same model session changing posture or auditing its own reasoning.

## Supreme architecture

One Harness work package contains TWO LOGICALLY AND CONTEXTUALLY INDEPENDENT agents:

1. `HARNESS_ENGINEER_AGENT` — implementation authority inside the disposable candidate workspace.
2. `HARNESS_INTERNAL_EXPERT_AGENT` — read-only/adversarial audit authority over an isolated copy of the exact candidate.

They are coordinated only by the deterministic host.

Hard laws:

`SAME WORK PACKAGE != SAME AGENT CONTEXT`

`ENGINEER DOES NOT RECEIVE EXPERT TRANSCRIPT OR REASONING`

`INTERNAL EXPERT DOES NOT RECEIVE ENGINEER TRANSCRIPT OR RATIONALE`

`ONLY STRUCTURED FINDINGS CROSS THE ROLE BOUNDARY`

`ANY ENGINEERING MUTATION INVALIDATES THE PRIOR INTERNAL EXPERT AUDIT`

`EVERY RE-AUDIT USES A FRESH INTERNAL EXPERT SESSION`

`WORK COMPLETE = ENGINEERING COMPLETE + FRESH INDEPENDENT INTERNAL EXPERT CLEAN ON EXACT FINAL PATCH`

## 1. Engineer isolation

The Engineer receives only:
- the engineering contract / task objective;
- exact START/TREE and allowed paths;
- code/tests/LSP in its workspace;
- durable ENGINEERING checkpoints from its own prior work;
- on a repair cycle, only the structured finding payload returned by the host.

The Engineer MUST NOT receive:
- Internal Expert transcript;
- Internal Expert chain of reasoning;
- Internal Expert session files;
- Internal Expert lane notes beyond the normalized finding payload;
- the identity or conversational context of the auditor.

The Engineer owns implementation, root-family correction, tests, six engineering lanes, LSP and candidate patch production.

## 2. Internal Expert isolation

Every Internal Expert audit is a fresh DSH session and fresh reviewer context.

The Internal Expert receives only:
- the immutable task/audit contract;
- exact START/TREE;
- an isolated filesystem copy containing the exact candidate patch under audit;
- exact candidate patch SHA256;
- relevant repository code/tests/history available from that isolated checkout;
- the independent reviewer charter.

It MUST NOT receive:
- Engineer transcript or checkpoints;
- Engineer rationale, hypotheses or claimed closure argument;
- Engineer subagent outputs;
- previous Internal Expert transcript or reasoning;
- a previous audit's conclusions as assumptions.

Known historical regression witnesses may be part of the audit contract/corpus, but the auditor must independently derive current coverage and may not treat prior conclusions as proof.

## 3. Internal Expert must behave like External Expert

Internal Expert uses five independent logical lanes:

- IE-L1 architecture/contracts/runtime/trust-root falsification;
- IE-L2 security/input/Unicode/normalization/boundary falsification;
- IE-L3 historical regression/retained-state/replay/integration falsification;
- IE-L4 property/metamorphic/systematic equivalence exploration;
- IE-L5 final cross-interaction and reachable-path challenger.

The audit is full-candidate within the bounded work family, not a diff-only confirmation and not a review of the Engineer's explanation.

HIGH reasoning is baseline. MAX is mandatory for security, normalization, authority, contradictory evidence, root-family closure and final clean synthesis.

Semantic LSP is mandatory where applicable.

## 4. Structured finding boundary

The ONLY semantic payload passed from Internal Expert to Engineer is a normalized finding list. Each material finding contains:

- `finding_id`
- `severity`
- `root_family`
- `witness`
- `expected`
- `observed`
- `affected_paths`
- `violated_invariant`
- `reproduction`

The host may deduplicate findings sharing a demonstrated root cause while preserving every independent witness.

No auditor reasoning transcript is forwarded.

## 5. Mandatory repair and fresh re-audit loop

Execution loop:

`ENGINEER -> SNAPSHOT EXACT PATCH -> FRESH INTERNAL EXPERT -> FINDINGS?`

If findings exist:

`HOST NORMALIZES FINDINGS -> ENGINEER REPAIR -> NEW EXACT PATCH -> DESTROY/IGNORE OLD AUDIT CONTEXT -> FRESH NEW INTERNAL EXPERT -> FULL RE-AUDIT`

Repeat inside the SAME Harness work package until:
- Internal Expert returns CLEAN on the exact final patch; or
- an honest material/infrastructure blocker prevents safe continuation.

The Internal Expert does not repair code. The Engineer does not adjudicate itself CLEAN.

## 6. Exact candidate binding

Every audit is bound to `candidate_patch_sha256` computed by the host before the audit.

The host creates an isolated audit copy from exact START and applies exactly that patch.

If the audit workspace mutates during review, the audit is invalid and cannot produce CLEAN.

A CLEAN result is valid only for the exact candidate patch SHA256 named by the audit result.

Any Engineer mutation invalidates all prior CLEAN evidence automatically.

## 7. Clean gate

Internal Expert result is exactly one of:

- `CLEAN`
- `MATERIAL_FINDINGS`
- `BLOCKED`

CLEAN requires:
- all five Internal Expert lanes complete;
- no material finding;
- independent audit of the full bounded family on exact final candidate;
- semantic LSP evidence where applicable;
- adversarial, benign-control and cross-interaction probes appropriate to the family;
- exact candidate patch SHA256 match;
- no audit-workspace source mutation.

Only the deterministic host may translate a valid CLEAN result into final Harness terminal markers:

`HARNESS_INTERNAL_EXPERT_STATUS: CLEAN`

`HARNESS_DUAL_ROLE_STATUS: ENGINEER_COMPLETE + INTERNAL_EXPERT_CLEAN`

The Engineer itself must not mint those markers.

## 8. Recovery

Workflow interruption does not create a new correction assignment.

Engineer patch/checkpoints are durable and reusable.

A completed CLEAN audit can be reused only if the exact candidate patch SHA256 is unchanged and the audit evidence was produced under this independent dual-agent policy. Otherwise run a fresh Internal Expert audit.

Partially completed Internal Expert reasoning is not shared with Engineer. A recovered audit may resume only inside its reviewer role or restart as a fresh reviewer without changing Engineer evidence.

## 9. External Expert

External Expert remains independent and unchanged.

The target is that External Expert becomes confirmation rather than routine defect discovery.

An external material finding belonging to a family audited CLEAN by a valid Independent Internal Expert is a `HARNESS_QUALITY_FAILURE / INTERNAL_EXPERT_ESCAPE` and must be added to the permanent adversarial regression corpus.

## Final law

`ENGINEER BUILDS.`

`INTERNAL EXPERT AUDITS WITHOUT KNOWING HOW ENGINEER THOUGHT.`

`ENGINEER RECEIVES ONLY DEFECT EVIDENCE, FIXES IT, AND DOES NOT SEE THE AUDITOR'S REASONING.`

`EVERY MUTATED CANDIDATE IS AUDITED AGAIN BY A FRESH INDEPENDENT INTERNAL EXPERT.`

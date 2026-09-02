# QORE Harness Large-Batch Resilience Contract

## Status

MANDATORY INFRASTRUCTURE HARDENING FOR LARGE-BATCH HARNESS WORK.

## Incident basis

Run `33646160981` failed while five of six logical lanes had produced durable work and Lane 2 was still running. LSP preflight was healthy, checkout/binding was healthy, and the run exited after the primary model emitted a pause/wait message. This is an orchestration failure mode, not a valid reason to discard the batch.

## Executive invariant

Harness must be able to execute large six-lane batches without allowing one pending/interrupted logical lane to collapse completed work.

`PENDING LANE != BATCH FAILURE`

`ONE LANE INTERRUPTION != RESTART ALL LANES`

`DURABLE COMPLETED LANE != REPEATABLE WORK`

`RECOVERABLE MODEL EXIT != MATERIAL FAILURE`

`LARGE BATCH SUPPORT REQUIRES RESUMABLE SWARM STATE`

## Required state model

Every lane must have a durable explicit state at minimum:

- `NOT_STARTED`
- `RUNNING`
- `CHECKPOINTED`
- `COMPLETED`
- `RECOVERY_REQUIRED`
- `MATERIAL_BLOCKED`

The coordinator must persist lane identity, scope, findings, evidence, adjudications, unresolved questions, pending next action, and safe-resume instruction.

A completed lane is immutable input to recovery unless later repository evidence explicitly invalidates it.

## Coordinator behavior

The coordinator must not return a normal terminal response while any required lane is merely pending/running.

Messages equivalent to "pause here", "wait for lane", "resume when completion notice arrives", or temporary subagent unavailability are not valid successful completion and are not automatically a material failure. The host must classify them as recoverable orchestration state.

If the primary process exits non-zero after durable progress exists, recovery evidence must be inspected before final classification.

If all prerequisites are healthy and at least one lane is incomplete but recoverable, the batch disposition must be `RECOVERY_REQUIRED`, preserving all completed lanes and patch/checkpoints.

## Recovery contract

Recovery must:

1. bind the exact original START/TREE and original package lineage;
2. load the latest durable checkpoint and recovery patch;
3. enumerate completed vs missing lanes;
4. prohibit rerunning completed lanes unless independently invalidated;
5. run only missing/recovery-required lanes;
6. synthesize the full six-lane result from inherited + recovered evidence;
7. continue implementation from the retained patch/state;
8. rerun semantic LSP after implementation;
9. run external FULL QORE quality gate only after all required lanes are complete;
10. emit a final durable resume state even on any subsequent interruption.

## Failure classification

The workflow may terminate as hard `failure` only for a genuine material blocker such as:

- immutable package/binding mismatch;
- checkout/tree corruption;
- required LSP infrastructure unavailable after policy-defined recovery;
- invalid/missing required credentials for the reviewer service itself;
- insufficient API balance before meaningful execution;
- deterministic scope/budget violation;
- corrupted/non-parseable durable recovery state;
- material architectural contradiction that cannot be adjudicated within package scope;
- FULL QG failure after a complete candidate is produced.

A pending lane, delayed subagent, recoverable model exit, or partial six-lane completion is not by itself a hard-failure reason.

## Large-batch requirements

Harness large batches use exactly six logical lanes unless a later governed contract changes the number.

The coordinator must budget work so that lanes can complete independently and checkpoint incrementally. The system must tolerate asynchronous lane completion order. Synthesis starts only once the six required lane states are complete or a lane is materially blocked with explicit evidence.

The 120-minute model wall cap remains a safety cap, not an expected duration. Reaching the cap with durable progress must produce recoverable state rather than erase work.

## Mandatory checkpoint cadence

At minimum write/refresh durable state after:

- host initialization;
- baseline/reuse reconstruction;
- each lane completion;
- each lane failure/interruption classification;
- six-lane synthesis;
- each coherent implementation mutation;
- LSP validation;
- root-family exhaustion;
- FULL QG result;
- final disposition.

The recovery patch must be refreshed after each coherent code/test/doc mutation.

## Mandatory adversarial certification

Before this hardening is considered complete, deterministic tests/fixtures must demonstrate:

1. lane 2 delayed while lanes 1/3/4/5/6 complete -> completed lanes retained, no full restart;
2. one lane process exits/interruption -> only that lane becomes `RECOVERY_REQUIRED`;
3. primary model emits pause/wait text -> host does not misclassify it as valid terminal success or unrecoverable failure;
4. primary process returns non-zero after durable checkpoints -> recovery classifier consumes checkpoints before final disposition;
5. recovery invocation inherits completed lane evidence and prohibits duplicate lane work;
6. second interruption during recovery remains resumable;
7. corrupted checkpoint -> fail closed as material infrastructure blocker;
8. LSP unavailable before API spend -> fail closed without model spend;
9. FULL QG never runs on an incomplete six-lane candidate;
10. completed six-lane candidate -> normal candidate scope gate + FULL QG + artifact completion.

## Observability

Run metadata must expose at minimum:

- completed lane count;
- pending/recovery-required lanes;
- checkpoint count;
- recovery generation/attempt identity;
- inherited lane identities;
- whether duplicate-work prevention fired;
- primary model exit code;
- classified termination reason;
- candidate completeness;
- LSP state;
- QG state.

## Acceptance rule

Harness is approved for large-batch use only when the workflow can lose/delay one logical lane and continue from durable state without rerunning the other completed lanes.

This hardening must preserve anti-duplication, exact binding, artifact-only behavior, scope budgets, LSP requirements, FULL QG requirements, and no-publication authority.
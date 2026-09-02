# QORE Harness Large-Batch Resilience Contract

## Status

IMPLEMENTED CANDIDATE — deterministic certification required before merge.

## Incident basis

Run `33646160981` failed while five of six logical lanes had produced durable work and Lane 2 was still running. LSP preflight was healthy, checkout/binding was healthy, and the run exited after the primary model emitted a pause/wait message. This is an orchestration failure mode, not a valid reason to discard the batch.

## Executive invariant

Harness must be able to execute large six-lane batches without allowing one pending/interrupted logical lane to collapse completed work.

`PENDING LANE != BATCH FAILURE`

`ONE LANE INTERRUPTION != RESTART ALL LANES`

`DURABLE COMPLETED LANE != REPEATABLE WORK`

`RECOVERABLE MODEL EXIT != MATERIAL FAILURE`

`LARGE BATCH SUPPORT REQUIRES RESUMABLE SWARM STATE`

## Root-cause findings

The incident exposed two independent orchestration weaknesses:

1. The legacy workflow treated any non-zero DSH exit as terminal before classifying durable partial progress. A pause/wait model exit therefore collapsed the job even when valid lane checkpoints existed.
2. The mandatory `qore-engineer-authority` skill still authorized `at most two useful subagent delegations` while the active Harness Engineer prompt required exactly six native lanes. That contradictory authority contract is removed by this hardening; six-lane Harness packages now have one consistent exactly-six swarm rule.

## Implemented architecture

Large-batch Harness now has four explicit layers:

1. `qore-harness-engineer-v2.md` defines recovery-safe six-lane behavior and immutable completed-lane carry-forward.
2. `harness_large_batch_state.py` parses and validates durable per-lane state with fail-closed corruption handling.
3. `harness_resilient_runner.py` executes bounded model generations inside one workflow run and automatically continues after recoverable nonzero, pause/wait, timeout, or incomplete exits while durable state remains valid.
4. `deepseek-harness-engineer-resilient.yml` preserves exact binding/LSP/scope/QG gates and routes candidate completion through the resilient runner. Auto-dispatch is redirected to this workflow.

The legacy Engineer workflow remains present for historical evidence compatibility, but new auto-dispatched Engineer packages route to the resilient workflow.

## Required state model

Every lane has a durable explicit state:

- `NOT_STARTED`
- `RUNNING`
- `CHECKPOINTED`
- `COMPLETED`
- `RECOVERY_REQUIRED`
- `MATERIAL_BLOCKED`

State records use:

`QORE_LANE_STATE lane=<1..6> state=<STATE> generation=<N>`

A completed lane is immutable input to recovery. Regression from `COMPLETED` to a non-completed state fails closed.

## Coordinator behavior

The coordinator must not return a normal terminal response while any required lane is merely pending/running.

Messages equivalent to "pause here", "wait for lane", "resume when completion notice arrives", temporary subagent unavailability, nonzero model exits, and bounded generation timeouts are recoverable when the durable journal remains valid and unfinished lanes remain.

The host performs up to four bounded model generations. Each recovery generation receives the exact completed and pending lane set plus the durable journal tail and is instructed to execute only unfinished work.

If recovery ceases to make progress beyond the configured stagnation allowance, the runner fails closed instead of looping indefinitely.

## Recovery contract

Recovery must:

1. bind the exact original START/TREE and original package lineage;
2. load the latest durable checkpoint and current workspace patch state;
3. enumerate completed vs missing lanes;
4. prohibit rerunning completed lanes;
5. run only missing/recovery-required lanes;
6. synthesize the full six-lane result from inherited + recovered evidence;
7. continue implementation in the same retained workspace;
8. rerun semantic LSP after implementation;
9. run external FULL QORE quality gate only after all six lanes are complete;
10. retain deterministic recovery metadata and artifacts.

## Failure classification

Hard failure is reserved for genuine material blockers such as:

- immutable package/binding mismatch;
- checkout/tree corruption;
- required LSP infrastructure unavailable before API spend;
- insufficient reviewer-service balance before execution;
- deterministic scope/budget violation;
- corrupted/non-parseable durable recovery state;
- material architectural contradiction;
- recovery stagnation after bounded generations;
- FULL QG failure after a complete candidate is produced.

A pending lane, delayed subagent, recoverable model exit, pause/wait response, or partial six-lane completion is not by itself a hard-failure reason.

## QG protection

The resilient workflow requires both:

- lane state reports `all_complete == true` with no pending lanes; and
- resilience metadata reports `terminal_reason == CANDIDATE_COMPLETE` and exit code 0

before the deterministic candidate gate and FULL QORE quality gate can execute.

Thus FULL QG cannot certify an incomplete six-lane swarm.

## Deterministic adversarial certification

The certification suite covers:

- lane 2 delayed while lanes 1/3/4/5/6 are complete;
- preservation of those five completed lanes into recovery context;
- nonzero model exit with durable progress;
- recovery-only execution of pending lanes;
- completed-lane regression rejection;
- generation regression rejection;
- corrupted checkpoint fail-closed behavior with metadata preservation;
- material-blocked lane handling;
- exact six-lane completion detection;
- non-destructive journal initialization;
- authority-skill exactly-six consistency and removal of the legacy two-subagent cap;
- auto-dispatch routing to the resilient workflow;
- warm-LSP-before-spend and all-complete-before-QG static gates.

Certification workflows: `.github/workflows/deepseek-harness-large-batch-certification.yml` and `.github/workflows/harness-large-batch-resilience-certification.yml`.

## Observability

Resilience metadata exposes:

- per-generation primary exit code;
- checkpoint count;
- completed/pending/blocked lane sets;
- candidate-ready and resume-complete markers;
- total recovery generations used;
- terminal classification;
- elapsed time;
- final candidate completeness.

The workflow additionally retains usage/billing, LSP smoke, candidate patch, QG logs and normal Harness artifacts.

## Acceptance rule

Harness is approved for large-batch use only after both the dedicated resilience certification and existing Harness infrastructure CI pass on the exact PR head and the protected integration is merged.

After merge, new Engineer auto-dispatches use `deepseek-harness-engineer-resilient.yml`; large batches no longer depend on a single model process surviving the entire six-lane task.

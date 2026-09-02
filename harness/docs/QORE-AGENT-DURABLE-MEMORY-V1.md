# QORE Agent Durable Memory v1

## Purpose

QORE engineering/review work must survive provider quota loss, timeout, cancellation, runner failure, model failure, or manual interruption without discarding already-completed technical work.

This contract applies to Harness Engineer, DeepSeek Expert, DeepSeek Coder, and Claude final review.

It does **not** require or permit disclosure of private chain-of-thought. Durable memory contains concise engineering evidence and adjudicated working state only: findings, witnesses, commands, tests, LSP evidence, subagent results, decisions, mutations, unresolved questions, and the exact next action.

## Mandatory incremental journal

An agent must not wait until its final report to record its work. It must checkpoint immediately after every material unit of work, including at minimum:

1. binding verification / resume-context load;
2. each subagent result consumed by the primary agent;
3. each reproduced or rejected material witness;
4. each material semantic-LSP pass or changed impact conclusion;
5. each coherent Harness implementation mutation and its focused validation;
6. each finding adjudication or contradiction resolution;
7. before entering a long-running probe/test and after it returns;
8. immediately before final disposition.

Every checkpoint must record:

- package/run identity and exact candidate binding;
- checkpoint sequence number;
- current phase;
- completed work since the previous checkpoint;
- concrete evidence references (files/symbols/commands/witnesses/LSP/subagent lane);
- current material findings and their status;
- decisions/closures reached so far;
- Harness-only implementation state or patch snapshot status;
- unresolved uncertainty;
- **PENDING NEXT ACTION**: one exact next unit of work;
- **SAFE RESUME INSTRUCTION**: what a successor must load and what it must not repeat.

Use the literal markers `QORE_CHECKPOINT_BEGIN`, `QORE_CHECKPOINT_END`, `PENDING NEXT ACTION`, and `SAFE RESUME INSTRUCTION` so recovery tooling and humans can locate checkpoints deterministically.

## Role-specific durable target

### Harness Engineer

Append checkpoints to `../../harness-engineer-checkpoints.md` from the qore-core workspace. The host writes checkpoint sequence 0 before model execution; Harness begins at sequence 1 and must never overwrite or truncate the file. After every coherent code/test/doc edit, also refresh `../../harness-engineer-candidate.patch` from the current working tree so interrupted implementation work is recoverable, not only the narrative journal.

The primary Harness session must write each of the six subagent lane results into the journal as soon as it consumes that result. Waiting until the final `## SUBAGENT SWARM` summary is non-compliant.

### DeepSeek Expert / Coder

Append checkpoints to `../../deepseek-review-checkpoints.md` from the qore-core workspace. The host writes checkpoint sequence 0 before model execution; the primary reviewer begins at sequence 1 and must never overwrite or truncate the file. Each primary session must checkpoint each subagent result when consumed, each material LSP conclusion, each finding adjudication, and the final-LSP / final-impact state.

### Claude final review

Claude is normally a manual external stage. Therefore the conversation transcript is the durable artifact. Claude must emit a compact `QORE_CHECKPOINT_BEGIN ... QORE_CHECKPOINT_END` block after each material review lane and before final disposition. The Integration Authority must preserve the latest checkpoint in the Claude handoff/evidence record. A Claude review without a recoverable checkpoint trail is not certifiable.

## Resume contract

A successor/recovery run is not a fresh review merely because the process identity changed.

Before new work it must:

1. load the predecessor journal/checkpoint artifact and, for Harness, the latest recoverable partial candidate patch when one exists;
2. verify BASE/HEAD/TREE/SYNTHETIC (or Harness START/TREE) still match;
3. reconstruct completed units, findings, evidence, and `PENDING NEXT ACTION`;
4. continue from that next action;
5. **not repeat completed subagent lanes, probes, tests, Unicode/property sweeps, or LSP work** unless the candidate changed, the predecessor evidence is missing/unusable, or a concrete contradiction requires a bounded re-check;
6. explicitly journal any intentionally repeated work and why repetition was technically necessary.

If binding changed, previous work is historical evidence only and the normal fresh-candidate rules apply.

### Recovery dispatch gate

A recovery/successor package for an interrupted run MUST identify the predecessor run/package and its durable artifact, state the last complete checkpoint sequence, and carry forward the exact `PENDING NEXT ACTION`. Integration Authority must not dispatch a recovery as a fresh full review when usable predecessor checkpoints exist.

If an interrupted predecessor has usable checkpoint evidence, omission of that evidence from the recovery package is itself `VALIDATION BLOCKED`. If no usable checkpoint exists beyond host sequence 0, no model-level technical progress may be claimed.

## Interruption semantics

A partial journal never converts an interrupted run into PASS. It is carry-forward execution evidence.

- Interrupted with usable checkpoints: `VALIDATION BLOCKED / INTERRUPTED`, then resume from the last checkpoint.
- Interrupted with no checkpoint beyond startup: no technical progress may be claimed.
- Final PASS/VALIDATION OK requires all normal role gates **plus** a complete durable journal trail and `RESUME STATE: COMPLETE`.

## Acceptance rule

For Harness, Expert, Coder, and Claude, absence of durable checkpoint evidence is a protocol defect. Integration Authority must not certify the stage as complete even if a polished final report exists.

Quality is not reduced by recovery. Memory prevents duplicated work; it never authorizes skipping an unfinished gate.

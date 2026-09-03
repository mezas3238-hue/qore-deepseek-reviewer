# QORE REVIEW EFFICIENCY — NO QUALITY LOSS V1

Status: BINDING for DeepSeek Expert, DeepSeek Coder and Harness Engineer.

## Objective

Reduce wall-clock time and token waste by eliminating repeated discovery, repeated context and duplicated causal-family narration while preserving or increasing semantic coverage and synthesis quality.

## Non-regression laws

- `EFFICIENCY != REDUCED COVERAGE`
- `COMPACTION != EVIDENCE LOSS`
- `DEDUPLICATION != WITNESS LOSS`
- `SMART STOP != EARLY PASS`
- `GREEN QG != SEMANTIC CLEAN`
- `INDEPENDENT EVIDENCE != DUPLICATE WORK`

No optimization may weaken subagent obligations, semantic LSP, HIGH/MAX adaptive reasoning, durable checkpoints, adversarial/property exploration, independent adjudication, root-family falsification/exhaustion, implementation review or final synthesis.

## Mandatory operating model

### 1. SHARED_EVIDENCE_MAP

Before fan-out, the primary reviewer/engineer builds one compact `SHARED_EVIDENCE_MAP` bound to the exact frozen candidate or immutable Harness START/TREE. It contains changed/trust-edge paths, material symbols, definitions/references/types, relevant prior findings/closures, tests/gates, witnesses, open hypotheses and lane assignment.

The map is discovery evidence only. It is never an adjudication and never permits one lane to trust another lane's conclusion.

### 2. Distinct lane fan-out

Each lane receives only the relevant compact map slice plus its independent question. A lane reopens mapped discovery only for a concrete contradiction, independent witness, lane-specific hypothesis, demonstrated map incompleteness, unusable evidence or binding change.

### 3. Evidence-complete compact lane results

Each lane returns: lane, hypothesis, evidence refs, witness/property, proposed root-family id, disposition and residual uncertainty. Repository background and another lane's narrative are not repeated when stable evidence references are sufficient.

### 4. CAUSAL_FAMILY_LEDGER

The primary reviewer/engineer maintains one `CAUSAL_FAMILY_LEDGER` and deduplicates findings sharing one demonstrated root cause into one family entry. All independent witnesses, source lanes, affected symbols/callers, benign controls and contradictions remain attached. Deduplication removes repeated investigation/narration, never evidence.

### 5. Full synthesis preserved

Final synthesis consumes every completed material lane and the complete causal-family ledger. It has no artificial aggressive token cap. HIGH remains baseline and MAX remains mandatory when selected for ambiguity, security, cross-layer interaction, architectural contradiction or competing material hypotheses.

### 6. Safe smart-stop

The reviewer/engineer stops exploratory work once all mandatory lanes, LSP final re-check, semantic gate, adjudication, checkpoint trail and synthesis are genuinely complete. Remaining wall-clock allowance is not a reason to continue spending tokens. Token/time pressure is never a reason to PASS early.

### 7. Durable compact resume

Same-binding resumes load compact durable summaries plus referenced evidence for completed work rather than replaying full narratives. Completed work is repeated only for binding change, unusable evidence or a concrete contradiction requiring bounded re-check.

For Harness Engineer specifically, the host recovery runner uses the latest complete durable checkpoint as the resume context and preserves the package-specific `WORK PACKAGE`, immutable START/TREE binding, allowlist/budgets and recovery targets while omitting the repeated generic Harness preamble. The latest recovery-boundary checkpoint must therefore carry current `SHARED_EVIDENCE_MAP SNAPSHOT`, `CAUSAL_FAMILY_LEDGER SNAPSHOT`, lane states, exactly one `PENDING NEXT ACTION` and a `SAFE RESUME INSTRUCTION`.

## Role-specific gates

Expert retains five independent lanes, primary semantic LSP and Root-Family Falsification before `VALIDACIÓN OK`.

Coder retains four independent implementation lanes, primary semantic LSP and the Independent Implementation Gate before `VALIDACIÓN OK`.

Harness retains exactly six logical engineering lanes across all recovery generations, semantic LSP-before/after, durable completed-lane carry-forward, Root-Family Exhaustion, artifact-only candidate generation, external FULL QG and unrestricted final synthesis before `CANDIDATE_READY_FOR_EXTERNAL_QG`.

## Host metrics

Host metering remains authoritative for model calls, uncached input, cache reads/writes, output/reasoning tokens and estimated cost. Review/engineering outputs additionally report lanes executed/redirected/inherited, mapped evidence reuse, causal-family deduplication and deliberate re-checks. Harness resilience metadata records prompt size per generation and whether recovery used `compact-latest-checkpoint` context. Where objectively derivable, program analytics should track tokens per material finding, cache-hit ratio, recovery-repeat context and USD per clean candidate.

## Harness adoption gate

Harness adoption is ACTIVE after the prior immutable Harness run terminated. The active contract requires compact recovery context, completed-lane carry-forward, `SHARED_EVIDENCE_MAP` reuse, `CAUSAL_FAMILY_LEDGER` deduplication, six-lane preservation, LSP-before/after, Root-Family Exhaustion and unrestricted final synthesis quality. Any future change that drops one of these protections is a contract regression and must fail CI.

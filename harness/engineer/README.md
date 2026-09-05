# QORE DeepSeek Harness Engineer

Issue: #31

Harness Engineer is QORE's primary write-capable implementation engineer while preserving strict separation between engineering freedom and GitHub/Production authority.

## Supreme delivery doctrine

Harness operates under a **one-shot complete-delivery** contract:

`ONE WORK PACKAGE = ONE HARNESS DELIVERY`

`ONE DISPATCH -> ONE COMPLETE SOLUTION OR BLOCKED`

`EXPERT PASS IS THE ACCEPTANCE TARGET OF EVERY HARNESS DELIVERY`

Harness is not expected to produce a partial patch and then enter a normal chain of Correction-012/013/etc. Internal defects discovered by Harness are fixed inside the same assigned work cycle before handoff. Harness may consume the full allowed model runtime, including approximately two hours where necessary, rather than hand off early with material uncertainty.

Every successful candidate must be supported by exactly six distinct subagent lanes. The host durable-state gate requires six distinct completed subagent identities in addition to six completed lane states. Lane completion alone is insufficient.

L1–L5 investigate architecture/contracts, adversarial witnesses, security/normalization boundaries, property/metamorphic space, and historical/integration neighbors. L6 is a fresh post-implementation adversarial subagent that did not design the patch and attempts to break the final candidate as an Expert-equivalent preflight. Any defect found by L6 is repaired inside the same Harness work package and a new fresh L6 challenge is required.

If an external Expert later finds a material defect that the completed Harness delivery should have discovered, the event is classified as `HARNESS_QUALITY_FAILURE`, not as an expected successful correction round.

## Role

Harness Engineer runs `deepseek-v4-pro` in an ephemeral exact-commit qore-core checkout. The model may edit/create files, run targeted tests, use native Harness Skills and subagents, use semantic Python LSP navigation, and leave a candidate working-tree patch.

The model process never receives GitHub write credentials and the qore-core remote is removed before model execution. The output is an artifact only. Publication is a separate authority.

## Native and extended tools

`@deepseek-ai/dsh@0.1.1-rc.2` supplies model-facing filesystem tools, bash/jobs, Skills, subagents, workflow tooling, and the workspace-write sandbox stack.

The exact LSP stack is pinned to:
- `@deepseek-ai/dsh-lsp@0.1.1-rc.2`;
- `@deepseek-ai/dsh-lsp-stdio@0.1.1-rc.2`;
- `@deepseek-ai/dsh-tool-lsp@0.1.1-rc.2`;
- `pyright@1.1.413`.

The model-facing `lsp` tool provides `goToDefinition`, `findReferences`, `goToImplementation`, and `hover`. The paid Engineer lane requires a warmed exact LSP cache and performs a secretless profile boot plus semantic Python definition/reference/hover smoke before any DeepSeek API spend. If that preflight fails, the paid step is never reached.

## Package contract

`harness_engineer_requests/current.json` is immutable per dispatch and contains:
- `package_id` with prefix `HARNESS-ENGINEER-`;
- exact `expected_start` commit and `expected_tree`;
- task Markdown under `harness/engineer/tasks/`;
- `mode: engineer`;
- `artifact_only: true`;
- immutable `dispatch_nonce`;
- explicit `allowed_paths` scopes;
- `max_changed_files` and `max_diff_lines`;
- `run_full_qg: true`.

The contract permanently rejects `.git*`, `.github/`, `.env*`, and `secrets/` task scopes.

## Durable six-subagent gate

Every durable checkpoint that changes lane/subagent state uses machine-readable records:

`QORE_LANE_STATE lane=<1..6> state=<STATE> generation=<N>`

`QORE_SUBAGENT_STATE lane=<1..6> id=<distinct-agent-id> state=<STATE> generation=<N>`

A candidate cannot reach `all_complete=true` unless all six lanes are completed **and** all six subagent states are completed with six distinct non-placeholder identities. Duplicate identities fail closed.

Recovery preserves completed lane and subagent evidence; an interrupted RUNNING unit becomes `RECOVERY_REQUIRED` rather than causing a restart of completed work.

## Execution boundary

Before the model starts:
- exact commit/tree are verified;
- qore-core is checked out detached with `persist-credentials: false`;
- development dependencies are installed;
- exact warmed DSH+LSP+Pyright cache is required;
- exact package versions are revalidated;
- QORE Skills are copied into isolated `DSH_HOME/skills`;
- Python LSP is mounted and semantically smoke-tested without provider credentials;
- qore-core's remote is removed;
- the DeepSeek balance baseline is captured.

The DSH process is started with a minimal environment and explicit `DSH_PERMISSION_MODE=workspace-write`. It receives the DeepSeek API key but no GitHub token.

## Deterministic external gate

After the model returns, a non-model process:
- requires six completed lanes and six distinct completed subagents;
- verifies HEAD/tree and absence of remotes;
- normalizes staging without discarding worktree changes;
- rejects out-of-scope/forbidden/symlink/binary changes;
- enforces changed-file/diff budgets;
- runs `git diff --check`;
- creates a complete patch including new text files;
- runs canonical FULL QORE gate: Ruff, Mypy strict, Pytest+coverage;
- uploads patch, reports, LSP smoke evidence, durable lane/subagent state, logs, session usage, and billing delta.

A successful Harness Engineer run is **candidate evidence**, not authorization to merge or operate QORE in Production.

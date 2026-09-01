# QORE DeepSeek Harness Engineer

Issue: #31

This lane promotes the proven Harness integration into a **write-capable implementation engineer** while preserving a strict separation between engineering freedom and GitHub/Production authority.

## Role

Harness Engineer runs `deepseek-v4-pro` in an ephemeral exact-commit qore-core checkout. The model may edit/create files, run targeted tests, use native Harness Skills and subagents, use semantic Python LSP navigation, and leave a candidate working-tree patch.

The model process never receives GitHub write credentials and the qore-core remote is removed before model execution. The output is an artifact only. Publication is a separate future authority.

## Native and extended tools

`@deepseek-ai/dsh@0.1.1-rc.2` ships the model-facing filesystem tools (`read`, `write`, `edit`), `str_replace_editor`, bash/jobs, filesystem search, Skills, subagents, workflow tooling, and the workspace-write sandbox stack.

Engineer v1 additionally mounts the exact-version LSP packages from the same Harness release:

- `@deepseek-ai/dsh-lsp@0.1.1-rc.2`;
- `@deepseek-ai/dsh-lsp-stdio@0.1.1-rc.2`;
- `@deepseek-ai/dsh-tool-lsp@0.1.1-rc.2`;
- `pyright@1.1.413` as the pinned Python language server.

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

The contract permanently rejects `.git*`, `.github/`, `.env*`, and `secrets/` task scopes in Engineer v1.

## Execution boundary

Before the model starts:
- exact commit/tree are verified;
- qore-core is checked out detached with `persist-credentials: false`;
- development dependencies are installed;
- the exact warmed DSH+LSP+Pyright cache is required;
- exact package versions are revalidated;
- QORE Skills are copied into isolated `DSH_HOME/skills`;
- Python LSP is mounted and semantically smoke-tested without provider credentials;
- qore-core's remote is removed;
- the DeepSeek balance baseline is captured.

The DSH process is started with a minimal environment and explicit `DSH_PERMISSION_MODE=workspace-write`. It receives the DeepSeek API key but no GitHub token. The configured Pyright language-server subprocess is launched through Harness's LSP provider after credential scrubbing and needs no provider credentials.

## Deterministic external gate

After the model returns, a non-model process:
- verifies HEAD/tree and absence of remotes;
- normalizes staging without discarding worktree changes;
- rejects out-of-scope/forbidden/symlink/binary changes;
- enforces changed-file/diff budgets;
- runs `git diff --check`;
- creates a complete patch including new text files;
- runs the canonical FULL QORE gate: Ruff, Mypy strict, Pytest+coverage;
- uploads patch, reports, LSP smoke evidence, logs, session usage, and billing delta.

A successful Engineer run is **candidate evidence**, not authorization to merge or operate QORE in Production.

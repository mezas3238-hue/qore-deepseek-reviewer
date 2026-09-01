# DeepSeek Harness integration for QORE

The Harness integration has two deliberately separate external roles. Neither role is part of QORE Core and neither has Production or real-capital authority.

## 1. Harness Auditor FAST

The original pilot lane remains a **read-only adversarial auditor** over an exact frozen qore-core candidate.

It is designed to answer whether DeepSeek Harness + `deepseek-v4-pro` can find material repository-level defects cheaply while preserving the existing QORE quality and reviewer gates.

Current Auditor properties:
- pinned `@deepseek-ai/dsh@0.1.1-rc.2` on Node 24;
- isolated `DSH_HOME`;
- `deepseek-v4-pro` with the configured reasoning profile;
- exact PR / BASE / HEAD / SYNTHETIC binding;
- warm Harness cache required before provider spend in the FAST lane;
- no persistent Git credentials in the qore-core checkout;
- qore-core remote removed before Harness starts;
- no `GH_TOKEN` in the Harness process;
- targeted adversarial tests/probes rather than duplicate repository-wide QG in FAST mode;
- tracked qore-core state must remain byte-equivalent to frozen HEAD;
- no commit, push, merge, review publication, branch-protection mutation, broker credential, Production account, or real-capital authority.

Auditor packages remain under `harness_requests/` and are validated by `scripts/harness_package_contract.py`. The Auditor is not an independent reviewer from the DeepSeek model family and does not replace Expert, Coder, Claude, or Integration Authority by inference.

## 2. QORE Harness Engineer

Issue #31 introduces a **separate write-capable engineering lane** under `harness/engineer/`.

The Engineer is intentionally more capable inside its disposable workspace:
- it may read/search the repository;
- use native Harness `write`, `edit`, and `str_replace_editor` tools;
- use semantic Python LSP navigation (`goToDefinition`, `findReferences`, `goToImplementation`, `hover`);
- run bash and targeted tests/probes;
- load QORE-specific Skills from isolated `DSH_HOME/skills`;
- use bounded native subagent delegation;
- leave an implementation candidate in the ephemeral working tree.

That additional engineering freedom does not grant publication authority. The model-running process still receives no GitHub write credential, qore-core's remote is removed before execution, and the initial Engineer lane is **artifact-only**. A non-model deterministic gate captures and validates the patch, then runs canonical QORE FULL QG outside the agent.

Engineer requests use a separate namespace, `harness_engineer_requests/`, and a separate contract, workflow, and auto-dispatch path. Infrastructure changes alone cannot launch a paid Engineer run because no `current.json` is introduced by the infrastructure delivery.

See `harness/engineer/README.md` for the exact Engineer authority and deterministic post-agent gate.

## Pinned runtime

Both lanes currently pin:

`@deepseek-ai/dsh@0.1.1-rc.2`

Harness is still developer-preview software. Package upgrades are explicit reviewed infrastructure changes rather than moving tags.

The pinned release already includes filesystem read/write/edit, `str_replace_editor`, filesystem search, bash/jobs, Skills, subagents, workflow tooling, and the workspace-write sandbox/permission stack.

### LSP status

Engineer v1 also pins and mounts the LSP packages from the **same `0.1.1-rc.2` release**:

- `@deepseek-ai/dsh-lsp@0.1.1-rc.2`;
- `@deepseek-ai/dsh-lsp-stdio@0.1.1-rc.2`;
- `@deepseek-ai/dsh-tool-lsp@0.1.1-rc.2`;
- `pyright@1.1.413` as the Python language server.

LSP is fail-closed before provider spend: the exact Engineer LSP cache must be warm, package versions must match, the headless profile must boot with the overlay, and a secretless semantic smoke must successfully exercise Python definition, reference, and hover queries. Only after those checks may the DeepSeek API key enter the model-running step.

## Security and authority doctrine

The security model is not based on assuming DeepSeek is uniquely dangerous. It is the same doctrine appropriate for any tool-using coding agent: give broad reversible engineering freedom inside an ephemeral laboratory and keep irreversible authority outside it.

Therefore the Harness process may reason, inspect, test, semantically navigate, and—in the Engineer lane—modify its disposable checkout, while separate deterministic/orchestrator processes retain GitHub publication and integration authority.

Neither lane authorizes Productive/Production systems, broker operations, deposits/withdrawals, real-money orders, Risk bypass, or real capital.

## Economic evidence

Harness runs retain bounded artifacts and usage/billing evidence so QORE can compare engineering/review quality, latency, tokens, and provider cost instead of choosing agent roles by intuition.

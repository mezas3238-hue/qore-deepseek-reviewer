# DeepSeek Harness pilot lane

This directory contains the experimental QORE DeepSeek Harness integration tracked by Issue #29.

## Current phase

Phase 1 is deliberately **benchmark-only** and **read-only** for tracked `qore-core` content. It does not replace DeepSeek Expert, DeepSeek Coder, Claude, or Integration Authority, and a Harness run is not counted as an independent reviewer from the DeepSeek family.

The pilot is designed to answer a narrower engineering question with evidence: can DeepSeek Harness + `deepseek-v4-pro` perform useful repository-level audit/engineering work at materially lower operating cost without weakening QORE's gates?

## Runtime

The GitHub workflow pins the npm package exactly to:

`@deepseek-ai/dsh@0.1.1-rc.2`

The runner uses Node 24 and an isolated `DSH_HOME`. The default agent model is explicitly overridden to `deepseek-v4-pro` with `reasoningEffort: max`; no moving npm tag is used.

Because Harness is in developer preview, a package upgrade is a reviewed infrastructure change rather than an automatic update.

## Security and authority

For Phase 1:
- the qore-core checkout is bound to exact PR / BASE / HEAD / SYNTHETIC;
- Git credentials are not persisted in the qore-core workspace;
- the Git remote is removed before Harness starts;
- `GH_TOKEN` is not exposed to the Harness process;
- the only provider credential exposed to Harness is `DEEPSEEK_API_KEY`;
- tracked repository state is normalized and compared with frozen HEAD after the run;
- the live PR freeze is revalidated after the run;
- no qore-core review is published;
- no commit, push, merge, branch-protection change, Production credential, capital, broker credential, or real-trading authority is permitted.

GitHub-hosted ephemeral runners are the execution boundary for this pilot. This is not authority for Productive/Production systems.

## Package contract

A benchmark request has these exact fields:

- `pr_number`
- `package_id` beginning with `HARNESS-BENCHMARK-`
- `expected_base`
- `expected_head`
- `expected_synthetic`
- `task_path` under `harness/prompts/`
- `mode`, currently only `auditor`
- `benchmark_only`, exactly `true`
- `dispatch_nonce`

`scripts/harness_package_contract.py` rejects extra or missing fields, malformed hashes, other modes, non-benchmark packages, unsafe prompt paths, and `benchmark_only != true`.

## Dispatch

`deepseek-harness-auto-dispatch.yml` listens only for changes to `harness_requests/current.json` on `main`. This initial integration intentionally does **not** add that file, so merging the infrastructure cannot spend API credits or launch Harness by itself.

The first benchmark must be a separate, explicit commit of an exact frozen package. One immutable package should correspond to one Harness workflow run.

## Artifacts

Each pilot run retains a 30-day artifact containing the validated package, final Harness output, run metadata, changed-file/diff summaries, and pre/post workspace state evidence. The Harness home/session directory is intentionally not uploaded because it may contain provider/session data.

## Future phases

Write-capable engineering remains gated behind benchmark results and independent adjudication. A future phase may use a disposable worktree or a dedicated temporary branch, but must never grant direct push/merge authority to `main` and must still pass QORE FULL TESTS and the independent review chain before integration.

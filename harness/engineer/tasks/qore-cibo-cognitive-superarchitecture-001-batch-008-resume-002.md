# QORE CIBO COGNITIVE SUPERARCHITECTURE — BATCH 008 — RESUME 002

## Authority / roadmap

This is a bounded continuation under live GitHub authority:

- Canonical master roadmap: `mezas3238-hue/qore-core` Issue #303.
- Cognitive program: qore-core Issue #482 — **HOW CIBO THINKS**.
- Functional program #483 — **WHAT CIBO DOES** — remains separate and MUST NOT be duplicated here.
- Trader Lab #473 / PR #481 remains a separate qualification system consumed by CIBO and MUST NOT be duplicated here.
- DEMO-first. No Production, real-capital, provider-order or Risk-bypass authority.

## Continuity law

Resume, do not restart, `HARNESS-ENGINEER-QORE-CIBO-COGNITIVE-SUPERARCHITECTURE-001-BATCH-008`.

Immutable qore-core binding:

- START `576803fbda76970a4bbfe2287b5f9ca101d0f6c3`
- TREE `11f35844670551ac4ab5be322272a3221e6b1c4b`

Completed predecessor engineering came from run `33705493588` / job `100493605718` and stopped because DeepSeek returned `QUOTA: Insufficient Balance` after Lanes 1-5 were completed and Lane 6 had begun.

Resume-001 run `33710181388` / job `100507771939` made **no code changes** and ended `MATERIAL_BLOCKED` only because the credential-free Harness process could list but could not download the private Actions artifact (`HTTP 401`). Do not treat that transport failure as an engineering defect. Do not give Harness `GH_TOKEN` or `GITHUB_TOKEN`.

## Exact predecessor evidence

Previous artifact:

- artifact id `9875909701`
- artifact name `harness-engineer-HARNESS-ENGINEER-QORE-CIBO-COGNITIVE-SUPERARCHITECTURE-001-BATCH-008`
- artifact digest `sha256:4e1bc7b135cae9006fcec3befc158e75a22f929f0685ff81b3b076204e3ca4ed`
- exact partial candidate patch SHA-256 `d40d67d36f1fc8e331bba5ac83b224e52f9f6c6748b1443596584246b8bff485`

Host-side independent recovery verified that exact patch SHA and retained it immutably in the reviewer repository as:

- `harness/engineer/recovery/qore-cibo-cognitive-batch008.patch.bz2.b64.part01`
- `harness/engineer/recovery/qore-cibo-cognitive-batch008.patch.bz2.b64.part02`
- `harness/engineer/recovery/qore-cibo-cognitive-batch008.patch.bz2.b64.part03`

## Mandatory exact restore before any engineering

From the exact START/TREE checkout:

1. Verify `HEAD == START` and current tree equals the exact TREE above.
2. Reconstruct the retained predecessor exactly:
   `cat ../../harness/engineer/recovery/qore-cibo-cognitive-batch008.patch.bz2.b64.part* | base64 -d | bzip2 -dc > /tmp/qore-cibo-cognitive-batch008.patch`
3. Verify SHA-256 exactly:
   `d40d67d36f1fc8e331bba5ac83b224e52f9f6c6748b1443596584246b8bff485`
4. Run `git apply --check /tmp/qore-cibo-cognitive-batch008.patch`.
5. Apply it exactly with `git apply`.
6. Fail closed on any binding/hash/apply mismatch.
7. Do not hand-transcribe, regenerate, approximate or reconstruct predecessor code.

## Inherited authoritative lane state

Treat these as inherited COMPLETE and DO NOT rerun/rebuild them:

- Lane 1 — COMPLETE — CA-04 Financial/Core World Model substrate.
- Lane 2 — COMPLETE — CA-05 Attention / complementary CA-06 Reasoning Modes / CA-09 Uncertainty.
- Lane 3 — COMPLETE — CA-10 Planning / Goal Graph and CA-11 Learning / Reflection / Counterfactual.
- Lane 4 — COMPLETE — CA-12 Quant/Tool orchestration, CA-13 Specialist Faculty interface, CA-18 modular evolution.
- Lane 5 — COMPLETE — CA-16 Replay/Audit plus CA-14 Dialogue and CA-15 Authority/Action firewall boundaries.

Inherited focused validation was already green: `79 passed`, strict mypy clean over the 15 predecessor files, ruff clean over those files.

Lane 6 only remains open. Evaluation code/tests were already written in the predecessor; documentation, whole-repo quality gate, semantic LSP-after and final synthesis remained incomplete.

## Lane 6 — ONLY engineering scope

Continue only the unfinished Lane 6 work:

1. Audit the already-written CA-17 cognitive evaluation framework and close only bounded defects actually found.
2. Complete `docs/architecture/QORE-CIBO-COGNITIVE-SUPERARCHITECTURE-001.md`.
3. Produce a CA-01..CA-18 ledger using only these statuses:
   - `PREDECESSOR_BATCH006`
   - `IMPLEMENTED_BATCH008`
   - `INTEGRATION_GATE_REQUIRED`
   - `EXTERNAL_EVIDENCE_DEPENDENT`
4. Complete the adversarial integration matrix required by the original Batch 008 package.
5. Run semantic LSP-after over every new/changed public cognitive type and key consumer using `hover`, `findReferences`, `goToDefinition`, and `goToImplementation` where supported. Grep alone is insufficient.
6. Run focused cognitive tests after modifications.
7. Run the canonical whole-repo FULL QORE quality gate:
   - `ruff check .`
   - `mypy src tests`
   - `pytest --cov=src/qore --cov-report=term-missing`
   - `git diff --check`
8. Emit the exact remaining integration seams required to combine certified Batch 006 + completed Batch 008 at the Cognitive Integration Gate.
9. Re-audit the entire Batch 008 delta for root-family defects, trust-boundary constructor parity, recursive nested revalidation, deterministic ordering/fingerprints, exact runtime type discipline, secret safety and authority leakage.

## Hard architecture laws

- Cognitive = HOW CIBO THINKS; Functions = WHAT CIBO DOES.
- Intelligence/reasoning/opinion != authority/execution.
- No CIBO Functions implementation, Trader Lab implementation, provider execution, Risk approval, Production or real-capital authority may leak into this candidate.
- No concrete LLM/model/provider dependency in provider-neutral semantic contracts.
- No hidden current time, RNG, retry, sleep, scheduler, network, thread or mutable global semantic state.
- Exact runtime types at trust boundaries; `bool != int`; no subclass/lookalike laundering.
- Recursive nested revalidation at material trust boundaries.
- Deterministic canonical ordering/fingerprints.
- Secret-bearing evidence/material fails closed and is not exposed through repr/logical/evidence surfaces.
- Replay never consults current clock/network.
- Evaluation never self-certifies authority.
- No weakening tests, skip/xfail concealment, `type: ignore` concealment, lint suppression, coverage gaming or semantic relaxation.

## Durable memory requirement

Append canonical checkpoints that preserve:

- exact START/TREE;
- exact predecessor patch SHA;
- inherited lanes 1-5 as COMPLETE;
- Lane 6 work performed;
- findings and decisions;
- changed files;
- semantic LSP evidence;
- focused tests and FULL QG;
- uncertainties and integration seams;
- exact safe next action.

If interrupted, resume from the newest durable checkpoint. Never redo completed predecessor lanes.

## Completion gate

Only if Lane 6 and every mandatory quality/adversarial requirement are genuinely complete, emit:

`## RESUME STATE`
`COMPLETE`

and

`CANDIDATE_READY_FOR_EXTERNAL_QG`

Otherwise fail closed with the exact material blocker and durable recovery state.

Next host gate after a genuine completion:

`recover exact Batch006 + exact completed Batch008 -> Cognitive Integration Gate -> independent IA audit -> FULL QG -> deterministic materialization -> exact HEAD/TREE/SYNTHETIC freeze -> DeepSeek Expert`

No Expert/Coder/Claude dispatch before that gate is CLEAN.
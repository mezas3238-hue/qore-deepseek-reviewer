# QORE CIBO COGNITIVE SUPERARCHITECTURE — BATCH 008 — RESUME 001

## Continuity law

Resume, do not restart, `HARNESS-ENGINEER-QORE-CIBO-COGNITIVE-SUPERARCHITECTURE-001-BATCH-008` after run `33705493588` / job `100493605718` stopped only because DeepSeek returned `QUOTA: Insufficient Balance`.

Immutable qore-core binding:

- START `576803fbda76970a4bbfe2287b5f9ca101d0f6c3`
- TREE `11f35844670551ac4ab5be322272a3221e6b1c4b`
- Issue #482

## Mandatory predecessor recovery

Previous artifact:

- artifact id `9875909701`
- artifact name `harness-engineer-HARNESS-ENGINEER-QORE-CIBO-COGNITIVE-SUPERARCHITECTURE-001-BATCH-008`
- artifact digest `sha256:4e1bc7b135cae9006fcec3befc158e75a22f929f0685ff81b3b076204e3ca4ed`
- exact partial candidate patch SHA-256 `d40d67d36f1fc8e331bba5ac83b224e52f9f6c6748b1443596584246b8bff485`

Recover the previous artifact using authenticated GitHub Actions access, extract `harness-engineer-candidate.patch`, verify the exact patch SHA-256 above, then `git apply --check` and `git apply` on the exact START/TREE checkout. Fail closed if any binding, digest, patch hash or apply check differs. Do not reconstruct the partial candidate by hand.

The previous durable checkpoint is authoritative for completed lanes:

- Lane 1 — COMPLETED — CA-04 World Model.
- Lane 2 — COMPLETED — CA-05 / complementary CA-06 / CA-09.
- Lane 3 — COMPLETED — CA-10 Planning / CA-11 Learning-Counterfactual.
- Lane 4 — COMPLETED — CA-12 Tools / CA-13 Faculty / CA-18 modularity.
- Lane 5 — COMPLETED — CA-16 Replay + CA-14/15 boundaries.
- Lane 6 — RUNNING — evaluation code/tests already written; docs + whole-repo QG + LSP-after + final synthesis remain.

Previous focused validation already passed: `79 passed`, strict mypy clean over 15 files, ruff clean over 15 files.

Do NOT rerun or reconstruct Lanes 1-5. Do NOT recreate Batch 006. Do NOT restart repository-wide discovery already completed.

## Exact resume point — Lane 6 only

Continue only the unfinished Lane 6 work:

1. audit the already-written cognitive evaluation framework for CA-17 and finish any bounded defects found;
2. complete the architecture document `docs/architecture/QORE-CIBO-COGNITIVE-SUPERARCHITECTURE-001.md`;
3. produce the mandatory CA-01..CA-18 ledger using only:
   - `PREDECESSOR_BATCH006`
   - `IMPLEMENTED_BATCH008`
   - `INTEGRATION_GATE_REQUIRED`
   - `EXTERNAL_EVIDENCE_DEPENDENT`;
4. complete the adversarial integration matrix from the original Batch 008 task;
5. run semantic LSP-after over all new public types and key consumers using `hover`, `findReferences`, `goToDefinition`, `goToImplementation` where supported;
6. run focused tests after any modification;
7. run canonical FULL QG and `git diff --check`;
8. emit the final integration seams required for Batch006 + Batch008 Cognitive Integration Gate.

## Architecture laws

Preserve the original Batch 008 task and all CEO-frozen laws. In particular:

- Cognitive = HOW CIBO THINKS; Functions = WHAT CIBO DOES.
- intelligence/reasoning/opinion never equals authority or execution.
- no CIBO Functions, Trader Lab, Risk approval, provider execution, Production or real-capital authority leakage.
- no concrete LLM/provider imports in semantic contracts.
- no hidden time, RNG, retry, sleep, scheduler, network or mutable global state.
- exact runtime types at trust boundaries; `bool != int`; recursive nested revalidation.
- deterministic canonical ordering/fingerprints.
- secret-bearing evidence/material fails closed.
- replay never consults current clock/network.
- evaluation never self-certifies authority.

## Durable memory

Append a new canonical checkpoint that explicitly states inherited completed work, work newly completed in Resume-001, evidence, uncertainties, exact changed files, LSP-after evidence, tests, FULL QG, what remains and safe next action. Completed predecessor lanes must remain marked inherited/complete, never re-executed.

## Quality gate

Required:

- `ruff check .`
- `mypy src tests`
- `pytest --cov=src/qore --cov-report=term-missing`
- `git diff --check`

No test weakening, unjustified skip/xfail, `type: ignore` concealment, lint suppression, coverage gaming or semantic relaxation.

## Final required output

Report exact START/TREE, Lane 1-6 states, CA-01..CA-18 ledger, changed files, adversarial matrix, LSP-before inherited evidence + LSP-after evidence, focused tests, FULL QG, unresolved Batch006 integration seams, and proof that no Functions/Trader Lab/provider/Production authority leaked into cognition.

Only when genuinely complete emit:

`## RESUME STATE`
`COMPLETE`

and

`CANDIDATE_READY_FOR_EXTERNAL_QG`

Next host gate: recover Batch006 + this exact Batch008 candidate -> Cognitive Integration Gate -> IA audit -> FULL QG -> exact materialization -> HEAD/TREE/SYNTHETIC freeze -> fresh Expert.

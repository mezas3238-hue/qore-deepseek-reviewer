# QORE CIBO COGNITIVE — CORRECTION-001 EXACT-TYPE BOUNDARIES — RESUME-004

## CONTINUITY — SAME ENGINEERING CANDIDATE, NO RESTART
Continue the bounded CIBO Cognitive Correction-001 from source engineering run `33756768323` and its newest durable candidate patch. Do not rebuild CA-01..CA-18 and do not repeat unrelated Cognitive architecture.

Recovery attempts after the source run were infrastructure/preflight-only and produced no new qore-core engineering:
- Resume-001 `33759534351`: recovery inputs not propagated; no model work.
- Resume-002 `33759767195`: artifact restored, but host gate ran before remote sealing; no model work.
- Resume-003 `33760231800`: artifact restored and remote sealed, but package allowlist used filename-prefix-like scopes while deterministic gate accepts only exact paths/directories; no model work.

Resume-004 fixes only that package-scope mismatch by using the 16 exact paths already present in the recovered patch. The semantic task and recovery source are unchanged.

## IMMUTABLE BINDING
- START: `576803fbda76970a4bbfe2287b5f9ca101d0f6c3`
- TREE: `11f35844670551ac4ab5be322272a3221e6b1c4b`

## ONLY VALID RECOVERY SOURCE
- source run: `33756768323`
- source job: `100652997200`
- artifact id: `9894209891`
- artifact ZIP digest: `sha256:d405c1e08fd9569f4bbb440a25c21c7ed0e566ee729948ff29bb576dfcb56ec2`
- exact candidate patch SHA-256: `7e2469d7169c434d9e3a1dda33d665ee1f1425d635d4823e1437877b018b1b98`

Host must verify/download/apply this exact artifact and patch before any Harness API spend, remove qore-core publication remote, run the deterministic exact-file scope gate, and fail closed on any mismatch.

## EXACT RECOVERED FILE FAMILY — HARD SCOPE
The recovered patch contains exactly these 16 files and Resume-004 may change only these paths:
1. `docs/architecture/QORE-CIBO-COGNITIVE-SUPERARCHITECTURE-001.md`
2. `src/qore/infrastructure/cibo_cognitive_attention.py`
3. `src/qore/infrastructure/cibo_cognitive_common.py`
4. `src/qore/infrastructure/cibo_cognitive_evaluation.py`
5. `src/qore/infrastructure/cibo_cognitive_planning.py`
6. `src/qore/infrastructure/cibo_cognitive_replay.py`
7. `src/qore/infrastructure/cibo_cognitive_tools.py`
8. `src/qore/infrastructure/cibo_cognitive_world_model.py`
9. `tests/infrastructure/test_cibo_cognitive_attention.py`
10. `tests/infrastructure/test_cibo_cognitive_boundaries.py`
11. `tests/infrastructure/test_cibo_cognitive_common.py`
12. `tests/infrastructure/test_cibo_cognitive_evaluation.py`
13. `tests/infrastructure/test_cibo_cognitive_planning.py`
14. `tests/infrastructure/test_cibo_cognitive_replay.py`
15. `tests/infrastructure/test_cibo_cognitive_tools.py`
16. `tests/infrastructure/test_cibo_cognitive_world_model.py`

If closure truly requires a seventeenth path, do NOT silently broaden scope: mark the relevant lane MATERIAL_BLOCKED with exact dependency evidence for IA adjudication.

## CHECKPOINT GRAMMAR
`binding:` is machine-reserved. If present it must be exactly:
`binding: START=<40-lowercase-hex> TREE=<40-lowercase-hex>`
All narrative recovery evidence belongs under `evidence:` lines.

## DURABLE SOURCE EVIDENCE TO REUSE
Source run established before its checkpoint-format failure:
- restored predecessor/worktree verified;
- focused Cognitive baseline `88 passed`;
- focused Ruff PASS;
- focused Mypy PASS;
- semantic LSP-before evidence;
- inventory of permissive runtime-type checks;
- concrete subclass-laundering witnesses;
- six lanes started but no valid durable checkpoint certified any lane COMPLETED.

Inspect and continue the host-restored edits. Do not discard them merely because the original journal publication failed.

## ONLY MATERIAL RESIDUAL
Close exact-runtime-type/subclass-laundering gaps at Cognitive semantic/trust boundaries while preserving intentional structural polymorphism.

Laws:
- intentional structural protocols may remain polymorphic;
- concrete identity/value/authority-bearing semantics use exact runtime type where contract requires;
- `bool != int` and analogous subclass traps fail closed;
- constructor/builder/factory invariants are equivalent;
- nested/recursive material is revalidated where applicable;
- invalid subclasses cannot be normalized into trusted canonical values;
- deterministic/provider-neutral cognition and authority firewall remain unchanged.

## SIX LANES
1. Exact-type contract map + semantic LSP dependency graph.
2. Concrete subclass-laundering adversarial witnesses.
3. Constructor/builder/nested recursive parity.
4. Property/metamorphic exact-instance vs malicious-subclass behavior.
5. Neighboring causal-family audit limited to the 16-file recovered family.
6. Smallest correction + adversarial tests + LSP-after + Root-Family Exhaustion + documentation closure.

## HARD BOUNDARIES
Artifact-only. No commit/push/merge. No Production credentials/accounts/capital/orders. Reasoning != execution. CIBO never bypasses Policy/Risk/authorized execution. No test weakening/suppression/unjustified skips/defect-hiding ignores. No scope expansion.

## VALIDATION
Harness: focused/adversarial tests, LSP-before/after, diff audit, Root-Family Exhaustion.
Host after candidate-ready: `ruff check .`; `mypy src tests`; `pytest --cov=src/qore --cov-report=term-missing`; `git diff --check`.

Return artifact-only candidate for independent IA. Do not dispatch Expert from Harness.

# QORE CIBO COGNITIVE — CORRECTION-001 EXACT-TYPE BOUNDARIES — RESUME-003

## CONTINUITY — DO NOT RESTART
Continue the same bounded CIBO Cognitive Correction-001 from the newest durable engineering candidate produced by source run `33756768323`.

Two subsequent recovery attempts were infrastructure-only and produced no new qore-core engineering:
- `RESUME-001` / run `33759534351`: failed immutable preflight because recovery inputs were not propagated by auto-dispatch. No Harness model work.
- `RESUME-002` / run `33759767195`: recovery inputs propagated correctly; artifact download, SHA verification, `git apply --check`, patch application and `git diff --check` succeeded, then pre-model scope gate failed only because qore-core `origin` had not yet been sealed. No Harness model work.

The wrapper and auto-dispatch have now been corrected and their resilience certification is green. Do not use artifacts from Resume-001 or Resume-002 as engineering candidates.

## IMMUTABLE QORE-CORE BINDING
- START: `576803fbda76970a4bbfe2287b5f9ca101d0f6c3`
- TREE: `11f35844670551ac4ab5be322272a3221e6b1c4b`

## ONLY VALID RECOVERY SOURCE
- source engineering run: `33756768323`
- source job: `100652997200`
- source artifact id: `9894209891`
- artifact ZIP digest: `sha256:d405c1e08fd9569f4bbb440a25c21c7ed0e566ee729948ff29bb576dfcb56ec2`
- exact recovered `harness-engineer-candidate.patch` SHA-256: `7e2469d7169c434d9e3a1dda33d665ee1f1425d635d4823e1437877b018b1b98`

The host MUST, before any DeepSeek/Harness API spend:
1. checkout exact START/TREE cleanly;
2. download artifact `9894209891`;
3. locate `harness-engineer-candidate.patch`;
4. verify the exact SHA-256 above;
5. apply-check and apply the patch;
6. run `git diff --check`;
7. remove/seal qore-core remote publication authority;
8. run deterministic engineer scope/patch gate;
9. only then permit model execution.

Any mismatch must fail closed before model spend.

The recovered patch is newer than predecessor SHA-256 `1e876cec7c50ca49c0f9b46f57d22cf1ff7f837fb25fa49c4ea694fe6a592bfa`. Preserve the recovered patch. Never replace it with the predecessor or reconstruct it from memory.

## CHECKPOINT GRAMMAR LAW
`binding:` is a reserved machine field. If used, it MUST be exactly:
`binding: START=<40-lowercase-hex> TREE=<40-lowercase-hex>`

All prose about clean starts, restored patches, hashes or recovery belongs under `evidence:` lines. Never emit free-form text after `binding:`.

## DURABLE SOURCE EVIDENCE TO REUSE
Before the source run's checkpoint-format failure it established:
- recovered predecessor/worktree verified;
- focused Cognitive baseline `88 passed`;
- focused Ruff PASS;
- focused Mypy PASS;
- semantic LSP-before evidence;
- inventory of permissive runtime-type checks;
- concrete subclass-laundering witnesses for relevant Python value families;
- six logical lanes had started, but no valid durable checkpoint certified any lane `COMPLETED`.

Inspect the host-restored worktree first. Reuse those recovered edits and evidence. Do NOT rebuild CA-01..CA-18 or repeat unrelated Cognitive architecture.

## ONLY MATERIAL RESIDUAL
Close exact-runtime-type and subclass-laundering gaps at Cognitive semantic/trust boundaries while preserving intentional structural polymorphism.

Required laws:
- intentional structural protocols/interfaces may remain polymorphic;
- concrete identity/value/authority-bearing semantic types must enforce exact runtime type where contract requires it;
- `bool != int` and analogous Python subclass traps fail closed;
- direct constructor and builder/factory invariants are equivalent;
- nested/recursive material is revalidated where applicable;
- invalid subclasses cannot be normalized/laundered into trusted canonical values;
- provider-neutral deterministic cognition and CIBO authority firewall remain unchanged.

## SIX LOGICAL LANES
1. Exact-type contract map + semantic LSP dependency graph.
2. Concrete subclass-laundering adversarial witnesses.
3. Constructor/builder/nested recursive parity.
4. Property/metamorphic valid-exact-instance versus malicious-subclass behavior.
5. Neighboring causal-family audit across common/world-model/attention/planning/tools/replay/evaluation boundaries.
6. Smallest coherent correction + adversarial tests + LSP-after + Root-Family Exhaustion + documentation/maintainability closure.

No lane from the source run may be called `COMPLETED` unless valid parseable durable evidence proves it. Do not throw away source work merely because its checkpoint publication failed.

## HARD BOUNDARIES
- artifact-only; no commit/push/merge/PR publication;
- no Production accounts, productive credentials, real capital or real-money orders;
- reasoning != execution;
- CIBO cannot bypass Policy/Risk/authorized execution;
- no test weakening, suppressions, unjustified skips/xfail or defect-hiding ignores;
- no unrelated architecture expansion.

## VALIDATION
Harness: focused/adversarial validation, semantic LSP-before/after, diff audit, Root-Family Exhaustion.
Host after candidate-ready:
- `ruff check .`
- `mypy src tests`
- `pytest --cov=src/qore --cov-report=term-missing`
- `git diff --check`

Return artifact-only candidate for independent IA. Do not dispatch Expert from Harness.

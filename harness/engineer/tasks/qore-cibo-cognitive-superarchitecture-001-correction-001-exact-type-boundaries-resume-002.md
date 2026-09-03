# QORE CIBO COGNITIVE — CORRECTION-001 EXACT-TYPE BOUNDARIES — RESUME-002

## CONTINUITY
Continue the same bounded Cognitive Correction-001 from the newest durable candidate recovered from run `33756768323`. Resume-001 (`33759534351`) failed during immutable preflight because the auto-dispatch did not propagate recovery inputs; it performed **no qore-core engineering and spent no Harness model work**. Do not treat Resume-001 as a new candidate or as completed work.

## IMMUTABLE QORE-CORE BINDING
- START: `576803fbda76970a4bbfe2287b5f9ca101d0f6c3`
- TREE: `11f35844670551ac4ab5be322272a3221e6b1c4b`

## RECOVERY SOURCE — MUST BE HOST-RESTORED BEFORE HARNESS
- engineering source run: `33756768323`
- source job: `100652997200`
- source artifact id: `9894209891`
- GitHub artifact ZIP digest: `sha256:d405c1e08fd9569f4bbb440a25c21c7ed0e566ee729948ff29bb576dfcb56ec2`
- exact recovered candidate patch SHA-256: `7e2469d7169c434d9e3a1dda33d665ee1f1425d635d4823e1437877b018b1b98`

The host must download artifact `9894209891`, locate `harness-engineer-candidate.patch`, verify the exact SHA-256 above, run deterministic scope/patch validation, and apply it to the exact START before any DeepSeek/Harness API spend. If any recovery binding differs, fail closed before model execution.

The recovered patch is newer than predecessor SHA-256 `1e876cec7c50ca49c0f9b46f57d22cf1ff7f837fb25fa49c4ea694fe6a592bfa`. Preserve the recovered patch. Never replace it with the predecessor or reconstruct it from memory.

## PRIOR FAILURE — FIXED INFRASTRUCTURE ONLY
The source engineering run failed because it emitted a free-form reserved checkpoint line:
`binding: clean start (only .qore-harness-recovery/ untracked) -> predecessor patch restored exactly`

`binding:` is now machine-reserved. If used, it must be exactly:
`binding: START=<40-lowercase-hex> TREE=<40-lowercase-hex>`

All narrative recovery evidence belongs under `evidence:` lines.

## DURABLE EVIDENCE TO REUSE
The source run established before checkpoint rejection:
- recovered predecessor/worktree verification;
- focused Cognitive baseline `88 passed`;
- focused Ruff PASS;
- focused Mypy PASS;
- semantic LSP-before evidence;
- inventory of permissive runtime-type checks;
- concrete subclass-laundering witnesses across relevant Python value families;
- six lanes started, with no valid durable certification that any lane was COMPLETED.

Therefore inspect the restored worktree first and continue it. Do not rebuild CA-01..CA-18 or repeat unrelated Cognitive architecture.

## ONLY MATERIAL RESIDUAL
Close exact-runtime-type and subclass-laundering gaps at Cognitive semantic/trust boundaries while preserving intentional structural polymorphism.

Required laws:
- structural protocols/interfaces intentionally designed for polymorphism may remain structural;
- concrete semantic identity/value/authority-bearing types must use exact runtime-type enforcement where their contract requires it;
- `bool != int` and analogous subclass traps fail closed;
- direct constructor and builder/public factory invariants remain symmetric;
- nested/recursive material is revalidated where applicable;
- invalid subclasses cannot be normalized into trusted canonical values;
- preserve deterministic, provider-neutral CIBO cognition and authority firewall.

## SIX LOGICAL LANES
1. Exact-type contract map + semantic LSP dependency graph.
2. Concrete subclass-laundering adversarial witnesses.
3. Constructor/builder/nested recursive parity.
4. Property/metamorphic valid-exact-instance vs malicious-subclass behavior.
5. Neighboring causal-family audit across common/world-model/attention/planning/tools/replay/evaluation boundaries.
6. Smallest coherent correction + adversarial tests + LSP-after + Root-Family Exhaustion + docs/maintainability closure.

No lane from the source run may be called COMPLETED unless valid parseable durable evidence proves it. Reuse recovered edits/evidence rather than discarding them.

## HARD BOUNDARIES
- artifact-only; no commit/push/merge/PR publication;
- no Production accounts/credentials/capital/orders;
- reasoning != execution;
- CIBO cannot bypass Policy/Risk/authorized execution;
- no test weakening, suppressions, unjustified skips/xfail or defect-hiding ignores;
- no unrelated architecture expansion.

## VALIDATION
Focused validation during engineering, semantic LSP-before/after, final diff audit and Root-Family Exhaustion. Host canonical FULL QG after candidate-ready:
- `ruff check .`
- `mypy src tests`
- `pytest --cov=src/qore --cov-report=term-missing`
- `git diff --check`

Return only an artifact candidate for independent IA. No Expert dispatch by Harness.

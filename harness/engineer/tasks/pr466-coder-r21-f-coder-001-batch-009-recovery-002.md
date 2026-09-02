# QORE PR #466 — Harness Engineer Batch 009 Recovery-002

## ROLE / EXECUTION MODE

Resume the already-investigated F-CODER-001 correction on the exact immutable qore-core candidate below. This is a recovery continuation, NOT a restart.

The two predecessor runs failed because the primary Harness session exited while waiting for background native subagents. Do not repeat that waiting pattern. Execute the two remaining incomplete lanes **strictly sequentially**: launch Lane 2 only, consume its final result and checkpoint it, then launch Lane 4 only, consume its final result and checkpoint it. Do not have more than one unresolved subagent at a time. After Lane 4 is consumed, synthesize the full six-lane evidence and immediately proceed to implementation.

## IMMUTABLE START

- PR: #466
- START HEAD: `9c5a5f6c2befb62396563bac74ddd8a87760d23f`
- START TREE: `1c2b06effe269aec2b06c77d4344581c8d382d25`
- Coder finding: `F-CODER-001`
- production file: `src/qore/infrastructure/instrument_universe_registry.py`
- focal function: `_matches_sensitive_assignment_label`
- root-cause line currently ends with `return index < 0 or not prefix[index].isalnum()`.

## DURABLE PREDECESSOR STATE — MUST CARRY FORWARD

Predecessor Batch-009 run `33628207511`, artifact `9845977138`, completed and must NOT be repeated:
- exact binding verification;
- primary reproduction: `αtоken=` and `xtоken=` accepted while bare `tоken=` rejected;
- semantic LSP-before impact analysis;
- primary boundary matrix;
- focused baseline: 364 tests passed;
- Lane 1 complete;
- Lane 5 complete;
- Lane 6 complete.

Recovery-001 run `33630928006`, artifact `9847056309`, additionally completed and must NOT be repeated:
- Lane 3 benign false-positive analysis, checkpointed COMPLETE.
- Lane 3 conclusion: proposed `return True` left-boundary removal is acceptable under the documented “complete sensitive family occurs anywhere” policy. Most ordinary ASCII prefixed labels are already rejected via marker/composite scans; suffix negative controls such as `tokenx=`, `secrety=`, `password1=`, `bearerx:`, `credentialz:`, `authorization_x=` remain accepted. No material benign regression found.

The predecessor recovery patch is empty: **no implementation edit has yet begun**.

## REMAINING WORK ONLY

### Lane 2 — declared-label matrix / family exhaustiveness
Run one native Harness subagent only. Require a final concise adjudicable result. Its job is to prove whether removing the residual left-boundary check closes the declared `_SENSITIVE_ASSIGNMENT_LABELS` × `_CREDENTIAL_CONFUSABLE_PAIRS` family, including alphanumeric-prefix witnesses, without requiring broader normalization changes. Use focused finite/exhaustive probes where appropriate. Once it returns, primary must immediately append a durable checkpoint with its evidence and mark Lane 2 COMPLETE.

### Lane 4 — test-quality / adversarial design
Only after Lane 2 has been fully consumed and checkpointed, run one native Harness subagent. Require a final concise adjudicable result. Its job is to design the minimum high-value regression matrix proving F-CODER-001 closure and non-regression: at least `αtоken=`, `xtоken=`, bare homoglyph label, other declared label families with alnum prefixes, delimiter variants, and suffix/non-label controls. Once it returns, primary must immediately append a durable checkpoint and mark Lane 4 COMPLETE.

Do not launch or re-run lanes 1, 3, 5, or 6. The logical swarm remains six lanes by durable carry-forward; this recovery executes only the two missing lanes.

## SYNTHESIS / IMPLEMENTATION

After Lane 2 and Lane 4 are complete:
1. Synthesize all six lanes (1/3/5/6 carried forward + fresh 2/4).
2. If the evidence still supports the causal correction, apply the minimal production fix to `_matches_sensitive_assignment_label`. The expected causal form is removal of the residual left-boundary rejection after a complete sensitive label has already been matched, i.e. return success once the expected label is fully consumed. Do not introduce an ASCII-only boundary workaround that still lets `xtоken=` escape.
3. Add focused adversarial and benign-control tests under `tests/infrastructure`.
4. Update architecture/audit docs only if needed to make the “complete declared family anywhere before assignment delimiter” policy explicit and consistent.
5. Refresh recovery patch immediately after every coherent mutation.
6. Run primary semantic LSP-after over the modified helper and its callers/consumers.
7. Run focused tests, then allow the external workflow to run FULL QG exactly (`ruff check .`; `mypy src tests`; `pytest --cov=src/qore --cov-report=term-missing`).

## DURABLE MEMORY

Continue checkpoint numbering after predecessor sequence 8. Every material step must be appended to `checkpoint_path`, including:
- Lane 2 complete;
- Lane 4 complete;
- six-lane synthesis;
- implementation mutation + exact diff summary;
- focused tests;
- LSP-after;
- pre-final disposition.

Every checkpoint must contain concrete evidence, unresolved uncertainty, `PENDING NEXT ACTION`, and `SAFE RESUME INSTRUCTION`. Never overwrite prior checkpoint evidence written by this run.

## CONSTRAINTS

- exactly the same START/TREE; artifact-only; no qore-core remote/push/commit;
- no web research;
- no Production, real-capital, provider activation, Risk bypass, or operational authority;
- no test weakening/suppressions/type-ignore/lint silencing/coverage exclusions;
- preserve byte-identical retained/projected text; this is detection-only hardening;
- HIGH baseline, MAX for any security-sensitive ambiguity or competing causal hypothesis;
- changes only under allowed paths and within hard diff budgets.

## FINAL OUTPUT

Return the normal Harness Engineer structured output with SUBAGENT SWARM, LSP EVIDENCE, implementation/test/doc audit, durable journal summary, resume state, exact changed files/diff, and one exact disposition:
- `CANDIDATE READY — F-CODER-001 CLOSED`; or
- `BLOCKED / FURTHER MATERIAL FAMILY FOUND`.

# QORE CIBO Cognitive — Expert R1 Correction-005 Content-Binding Proof Root — Resume 001

## Continuity / incident adjudication

This is a RESUME of Correction-005, not a restart. The first Correction-005 workflow run `33814903254` / job `100844774650` failed in host recovery before Python/LSP/model execution because the request carried an incorrect SHA-256 for the predecessor candidate patch. No DeepSeek engineering generation ran, no lane work was performed, and no new qore-core candidate was produced.

Preserve the successful Correction-004 engineering exactly and recover its artifact before API spend.

Binding:
- qore-core PR #486
- START: `4fe91d7dc376bf4cab0b772236a9b61f3e6b6ef6`
- START TREE: `f28f831109b4afb4cb8cab139b344f6b6b9f8547`
- predecessor successful Harness run: `33806469462`
- predecessor artifact: `9915092593`
- predecessor artifact digest: `sha256:bcd1de27bce9830a3488e3a463d92b36f53dbb6fb505c198873d9c377ffac5e9`
- **verified actual predecessor candidate patch SHA256:** `a5fbd0c30253289e7c86882a219fd866e5faaea200b479817f304e96ccfa6a83`
- predecessor FULL QG: Ruff PASS; Mypy PASS; Pytest 5288 passed / 7 warnings; 87% coverage.

The prior task incorrectly recorded candidate patch SHA `446691f76dd05bf166d5176f4750d46feda82e254656fd86fff5ba30fa7ecae6`. Do not reuse that value. The host independently downloaded artifact `9915092593`, extracted `harness-engineer-candidate.patch`, and verified the byte digest above as `a5fbd0c3...a83`.

## Only material family in scope — I-1b local proof mint / authority-root laundering

Do not revisit already-closed D-1/F-1/PL-1/S-1/C-1/P-1/PL-2 families except regression verification required by the touched surface.

Correction-004 introduced `CiboIntegratedContentBinding._proven`, `require_proven()`, and `_proven_content_binding(id, fingerprint)`. That design is locally mintable: a caller can invoke the module helper with arbitrary `(id, fingerprint)`, or directly construct a binding and use `object.__setattr__(binding, "_proven", True)`. Therefore trusted admission must not depend on caller-assertable proof state.

Required closure: admission to integrated episode/replay must re-derive trust from verified source/content at the boundary. No caller-supplied binding object may self-assert trusted status through direct construction, helper call, reflective mutation, subclassing, copy/replace/pickle-style reconstruction where applicable, swapped id/fingerprint, stale/wrong content, or replayed fabrication. No global mutable registry, provider coupling, hidden state/network, nondeterminism, or execution authority.

Mandatory adversarial witnesses:
1. direct arbitrary binding;
2. direct binding + `object.__setattr__(_proven, True)`;
3. direct/imported helper invocation with arbitrary pair;
4. swapped valid id/unrelated fingerprint;
5. all-zero and syntactically valid fabricated fingerprints;
6. stale/wrong source version/content;
7. exact-runtime/subclass laundering;
8. reflective corruption after valid bind;
9. fabricated replay round-trip;
10. valid world snapshot/synthesis/evaluation/plan/replay bindings remain deterministic.

## Optimized Harness contract — quality preserved

Use exactly 6 logical lanes. Use `SHARED_EVIDENCE_MAP`, `CAUSAL_FAMILY_LEDGER`, compact recovery context, completed-lane carry-forward, and independent witness preservation. `DEDUPLICATION != WITNESS LOSS`.

1. Architecture/trust boundary.
2. Red-team witness reproduction.
3. Security/identity/proof semantics.
4. Property/metamorphic closure.
5. Historical/regression preservation.
6. Implementation/LSP/integration.

Semantic LSP before and after is mandatory. HIGH baseline; MAX for trust-root/forgery semantics and closure synthesis. Root-Family Exhaustion mandatory. Final synthesis quality is unrestricted by token/time optimization.

Scope should remain centered on:
- `src/qore/infrastructure/cibo_cognitive_integration.py`
- `tests/infrastructure/test_cibo_cognitive_integration.py`

Touch another already-allowed Cognitive file only with semantic evidence.

FULL QG:
- `ruff check .`
- `mypy src tests`
- `pytest --cov=src/qore --cov-report=term-missing`
- `git diff --check`

Artifact-only. No qore-core push/commit/merge.

## Efficiency benchmark

This is the first real DeepSeek Harness engineering execution after no-quality-loss optimization. Record model calls, uncached/cache-read/output/reasoning tokens, estimated cost, balance delta, prompt_chars, recovery_context_mode, generation/recovery count, completed-lane carry-forward, Engineer duration and total job duration. Correction-004 baseline: ~61m31s total, ~50m48s Engineer, 297 calls, 684,551 uncached input, 40,901,376 cache-read, 346,720 output, 222,183 reasoning, estimated USD 2.03813953, observed balance delta USD 2.05.

Do not optimize metrics at the expense of quality.

Final verdict exactly one:
- `CANDIDATE READY — I-1b PROOF ROOT FAMILY EXHAUSTED`
- `BLOCKED / FURTHER MATERIAL FAMILY FOUND`

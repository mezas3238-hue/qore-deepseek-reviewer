# QORE CIBO Cognitive — Expert R1 Correction-005 Content-Binding Proof Root

## Authority / continuity

This is a BOUNDED CONTINUATION from successful Correction-004, not a restart and not permission to revisit already-closed D-1/F-1/PL-1/S-1/C-1/P-1/PL-2 families.

Recover the exact Correction-004 artifact before API spend and preserve its candidate patch byte-for-byte except where this I-1 residual root requires a minimal change.

Binding under correction:
- qore-core PR #486
- START / current frozen pre-correction HEAD: `4fe91d7dc376bf4cab0b772236a9b61f3e6b6ef6`
- START TREE: `f28f831109b4afb4cb8cab139b344f6b6b9f8547`
- predecessor Harness run: `33806469462`
- predecessor artifact: `9915092593`
- predecessor artifact digest: `sha256:bcd1de27bce9830a3488e3a463d92b36f53dbb6fb505c198873d9c377ffac5e9`
- predecessor candidate patch SHA256: `446691f76dd05bf166d5176f4750d46feda82e254656fd86fff5ba30fa7ecae6`
- predecessor FULL QG: Ruff PASS; Mypy PASS / 767 files; Pytest 5288 passed / 7 warnings; 87% coverage.

Correction-004 already closed its five Expert R1 material families except for the Integration Authority's independent falsification of the proof-root design below. Lanes/evidence already complete in Correction-004 are durable evidence; consume them. Do not rediscover/re-narrate them unless needed to prove this exact residual family.

## IA material residual — I-1b local proof mint / authority-root laundering

Correction-004 introduced:
- `CiboIntegratedContentBinding._proven: bool`;
- `require_proven()`;
- module helper `_proven_content_binding(id, fingerprint)` that creates a binding and calls `object.__setattr__(binding, "_proven", True)`;
- the five `bind_*_reference` factories call that helper.

This does NOT establish a non-forgeable proof root in Python. A caller can import/call the module-private helper with arbitrary `(id, fingerprint)`, and a caller can also use `object.__setattr__` on a directly constructed frozen binding to set `_proven=True`. Therefore the marker proves only that a bit was set, not that the referenced record/content was revalidated and fingerprint-derived by a governed source path.

This contradicts the Correction-004 requirement: **only content bindings proven against their referenced record/content through a verified binding path may enter an integrated episode/replay**, including tests for attempts to bypass helpers by direct construction.

### Required closure property

No caller-supplied binding object may be able to self-assert or locally mint trusted/proven status merely by constructing `(id, fingerprint)`, calling an importable helper, mutating a hidden marker, subclassing, reflective corruption, copy/replace/pickle-style reconstruction where relevant, or replaying a fabricated value.

The trust decision must be derived from evidence/content available at the validation/binding boundary, not from an unforgeable-by-convention boolean/token stored in the caller-supplied value. Do not introduce ambient/global mutable registries, hidden network/state, provider coupling, nondeterminism, or execution authority.

Prefer an architecture where the integrated episode is constructed from verified source records (or a closed/private construction capability whose validity is re-derived and cannot be asserted by caller data) rather than trusting a `_proven` field. If an immutable binding remains as retained state, its admission must be a consequence of verified source/content binding, not a caller-mintable marker.

## Mandatory adversarial witnesses

At minimum prove fail-closed behavior for:
1. direct `CiboIntegratedContentBinding(id, arbitrary_fingerprint)`;
2. direct construction followed by `object.__setattr__(binding, "_proven", True)`;
3. importing/calling any module helper with arbitrary `(id, fingerprint)`;
4. swapped valid id + unrelated valid fingerprint;
5. all-zero and syntactically valid fabricated fingerprints;
6. stale/wrong source version/content;
7. subclass laundering / exact-runtime-type boundary where applicable;
8. reflective/nested corruption after an initially valid bind;
9. replay/round-trip of fabricated material;
10. valid world snapshot, synthesis, evaluation, plan and replay bindings continue to work deterministically.

## Six-lane continuity contract under optimized Harness

The Harness optimization is now active (`QORE REVIEW EFFICIENCY — NO QUALITY LOSS V1`). Maintain **exactly 6 logical lanes** and full synthesis quality, but use `SHARED_EVIDENCE_MAP`, `CAUSAL_FAMILY_LEDGER`, compact recovery context, and completed-lane carry-forward to avoid repeating Correction-004 research.

For this bounded residual family:
1. Architecture/trust-boundary lane — map every constructor/helper/admission/replay path for `CiboIntegratedContentBinding`.
2. Red-team lane — reproduce the local-mint witnesses above on recovered Correction-004 candidate before fixing.
3. Security/identity lane — analyze what constitutes proof vs caller assertion; exact types/reflective corruption.
4. Property/metamorphic lane — generated fabricated/valid id/fingerprint/source combinations; revalidation after mutation.
5. Historical/regression lane — preserve Correction-004 closures and all prior Cognitive invariants; no regression expansion.
6. Implementation/LSP/integration lane — semantic references/call sites, minimal patch, final independent re-check.

Use shared evidence to prevent six independent rediscoveries, but preserve independent witnesses and disagreements. `DEDUPLICATION != WITNESS LOSS`.

## LSP / reasoning / quality mandates

- Semantic LSP before and after: findReferences, goToDefinition, goToImplementation when supported (otherwise record unsupported + definition/references), hover, modified symbols, call sites, final recheck.
- HIGH baseline; MAX for trust-root/forgery semantics, ambiguity, contradiction, and closure synthesis.
- Root-Family Exhaustion is mandatory for I-1b.
- No weakening tests, skip/xfail, `type: ignore` hiding, Ruff/mypy weakening, coverage gaming.
- FULL QG before delivery:
  - `ruff check .`
  - `mypy src tests`
  - `pytest --cov=src/qore --cov-report=term-missing`
- Preserve artifact-only policy: no qore-core push/commit/merge.

## Scope discipline

The predecessor patch already changes 17 files. Preserve them through recovery. New engineering for Correction-005 should be minimal and centered on:
- `src/qore/infrastructure/cibo_cognitive_integration.py`
- `tests/infrastructure/test_cibo_cognitive_integration.py`

Touch another already-allowed file only if semantic LSP/root-family evidence proves it is necessary to close I-1b. Do not reopen unrelated families.

## Efficiency benchmark evidence

This is the first real Harness engineering run after the no-quality-loss optimization entered reviewer `main`. Preserve host usage/billing evidence so the Architect can compare against Correction-004 baseline:
- Correction-004 total runtime: ~61m31s job / ~50m48s Engineer step;
- model calls: 297;
- uncached input: 684,551;
- cache read: 40,901,376;
- output: 346,720;
- reasoning: 222,183 (included in output);
- estimated usage cost: USD 2.03813953;
- account balance delta: USD 2.05.

Do NOT optimize toward these metrics at the expense of quality. Record `prompt_chars`, `recovery_context_mode`, generations/recoveries, lane carry-forward and final usage so comparison is evidence-based.

## Final verdict

Return exactly one:
- `CANDIDATE READY — I-1b PROOF ROOT FAMILY EXHAUSTED`
- `BLOCKED / FURTHER MATERIAL FAMILY FOUND`

Final report must bind START/TREE, predecessor artifact/patch, changed files, six-lane evidence, LSP, HIGH/MAX decisions, adversarial witnesses, FULL QG, residuals, and closure argument.

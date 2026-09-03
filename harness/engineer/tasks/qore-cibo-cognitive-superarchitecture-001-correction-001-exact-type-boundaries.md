# QORE CIBO Cognitive Superarchitecture — Correction 001 / Exact-Type Boundaries

Package: `HARNESS-ENGINEER-QORE-CIBO-COGNITIVE-SUPERARCHITECTURE-001-CORRECTION-001-EXACT-TYPE-BOUNDARIES`
Roadmap authority: #303 -> #482.

## CONTINUITY — DO NOT RESTART

The predecessor CIBO Cognitive Batch008 Resume-002 engineering is complete and MUST be restored exactly before any correction work.

Immutable qore-core binding:
- START `576803fbda76970a4bbfe2287b5f9ca101d0f6c3`
- TREE `11f35844670551ac4ab5be322272a3221e6b1c4b`

Certified predecessor patch SHA-256:
`1e876cec7c50ca49c0f9b46f57d22cf1ff7f837fb25fa49c4ea694fe6a592bfa`

Restore it exactly:
```bash
cat ../../harness/engineer/recovery/qore-cibo-cognitive-resume002.patch.bz2.b64.part* \
  | base64 -d | bzip2 -dc > /tmp/qore-cibo-cognitive-resume002.patch
printf '%s  %s\n' '1e876cec7c50ca49c0f9b46f57d22cf1ff7f837fb25fa49c4ea694fe6a592bfa' /tmp/qore-cibo-cognitive-resume002.patch | sha256sum -c -
git apply --check /tmp/qore-cibo-cognitive-resume002.patch
git apply /tmp/qore-cibo-cognitive-resume002.patch
```
Fail closed on any hash/apply mismatch. Do not hand-reconstruct predecessor work.

## IA RESIDUAL TO CLOSE

Independent IA found that several cognitive semantic boundaries use permissive `isinstance(...)` checks for UUIDs/enums/typed semantic values where QORE exact runtime type law applies. This can admit subclass laundering and weaken deterministic contract identity.

Correction objective: eliminate this residual throughout the restored Batch008 candidate without redesigning CIBO.

Required properties:
- Where a contract requires an exact UUID, enum, timestamp, scalar or cognitive semantic type, enforce exact runtime type (`type(x) is T` / exact enum class) rather than accepting subclasses.
- `bool != int`; no subclass laundering.
- Revalidate nested material recursively when direct constructors can receive nested cognitive values.
- Direct constructors and builders must enforce equivalent semantic invariants; no constructor bypass.
- Preserve deterministic behavior, immutable dataclasses, provenance/evidence semantics, uncertainty, replay, planning and evaluation contracts.
- No provider-native, Risk, execution, Production or real-capital authority.
- Do not touch CIBO Functions #483 or Trader Lab.

## CORRECTION LANES

Use the six Harness lanes only to audit/fix this residual across the already-restored candidate; do not repeat predecessor architecture work:
1. common/world-model exact-type boundaries;
2. attention/reasoning/uncertainty boundaries;
3. planning/learning/counterfactual boundaries;
4. tools/faculty/modularity boundaries;
5. replay/dialogue/authority-firewall boundaries;
6. evaluation/integration/root-family exhaustion + adversarial tests.

## REQUIRED VALIDATION

- Semantic LSP before/after on touched boundaries.
- Add adversarial subclass-laundering and direct-constructor-bypass tests.
- `ruff check .`
- `mypy src tests`
- `pytest --cov=src/qore --cov-report=term-missing`
- `git diff --check`
- Final diff/root-family audit proving no relevant permissive boundary remains.

No Expert/Coder dispatch from Harness. Artifact-only completion for IA adjudication.
# UNR-019 R1 — DeepSeek Expert

Review PR #443 independently and adversarially. Do not trust author conclusions or CI as semantic proof.

## Frozen binding
- BASE: `25ed21be1ba427820be78dbb8958d441e5f27f9c`
- HEAD: `b2fae639779bdf27c497929af1a545ae70a42649`
- SYNTHETIC: `db81e5268ee0abdc7cf07018d5daf7e9768d8604`
- HEAD/SYNTHETIC tree: `70251fe1a6ba80d716aac5b5d7debd88f3a6f81d`
- SYNTHETIC parents: BASE + HEAD in that order.
- PR: OPEN/DRAFT/UNMERGED/MERGEABLE.
- Delta BASE→HEAD: exactly 3 added files, +1458/-0:
  - docs/architecture/QORE-UMI14-SUKUK-SHARIAH-STRUCTURAL-SEMANTICS-019.md +240
  - src/qore/infrastructure/sukuk_structural_semantics.py +606
  - tests/infrastructure/test_sukuk_structural_semantics.py +612
- QORE CI #1417 / run 32775984856: Ruff, Mypy, Pytest success on exact HEAD.

## Target
Falsify the bounded provider-neutral Sukuk certificate structural qualification. UNR-019 must distinguish Sukuk structure from conventional coupon debt without becoming a Shari'ah/legal/compliance engine.

UNR-022 remains separate: standalone Murabahah/Ijarah financing, Wakalah liquidity, collateralized Murabahah, Islamic FX-forward/profit-rate/cross-currency hedging, syndicated financing and other cross-family financing/liquidity/hedging are NOT closed here.

## Adversarial priorities
1. Find any valid accepted state where Sukuk collapses to ordinary debt or structure code alone carries the economics.
2. Root identity: exact type/kind/family enforcement; no subclass/reflection laundering; fixed-income-credit/structured-hybrid-products only.
3. Underlying bindings: semantic collisions, exact duplicates under different IDs, same underlying with materially different role/interest, caller-order determinism, self-underlying.
4. Ordered legs: ordinal/ID uniqueness, material ordering, undeclared binding references, accepted-state collisions.
5. Distribution source and external Shari'ah evidence must be material declarations but must not imply coupon calculation, compliance determination or legal opinion.
6. Exact primitive/wrapper/runtime types, deep revalidation after reflective corruption, deterministic logical identity.
7. Date/perpetual semantics: reject only demonstrably invalid states; do not invent legal/calendar chronology.
8. Source/docs/tests consistency and whether tests genuinely falsify behavior rather than merely mirror implementation.
9. No provider, market-data, valuation, Risk/account/execution, settlement mutation, Production/real-capital authority or UNR-022 leakage.

A finding requires a concrete constructible witness that survives all prior guards, exact impact, and minimum bounded correction. Do not report speculative taxonomy/jurisprudence preferences as defects.

If required evidence is missing, conclude `EVIDENCIA INSUFICIENTE / VALIDACIÓN BLOQUEADA` and name it. If clean, conclude exactly:

HALLAZGOS: NINGUNO
VALIDACIÓN OK

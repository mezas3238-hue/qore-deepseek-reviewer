# QORE Core / PROGRAM D / UMI-14 / UNR-013 — DeepSeek Coder R8

Perform an independent implementation-focused adversarial review of the exact frozen R8 candidate. You have direct read-only repository and GitHub evidence tools. Use them; do not request pasted files and do not modify qore-core.

## Identity and exact binding

Target: `UMI13-UNR-013` — securities-financing. Tracker #394. PR #437. Branch `agent/qore-umi14-securities-financing-full-closure-013`.

Expected immutable binding:
- BASE `db83b106f3a5e7f30a788567dfa970a38b7a379a`
- BASE tree `5b9c218a4fe3609b10e34b1cf8523cade0d10bbe`
- HEAD `1c99f1987e78b3be3d8bb6a0d1ecf98c5f3675dc`
- HEAD tree `ca9722d11059f13a3c74c6820a15e15232c92171`
- SYNTHETIC `cd97ad3dbd6edb68855d06aba475d636be983bd9`
- SYNTHETIC tree `ca9722d11059f13a3c74c6820a15e15232c92171`
- ordered synthetic parents: BASE then HEAD
- exactly 3 added files, +3487/-0
- R8 freeze review `5003581550`
- canonical post-freeze evidence review `5003585885`
- DeepSeek Expert dispatch review `5003586462`
- DeepSeek Expert result review `5004223460`
- IA adjudication of DeepSeek Expert R8 `5004401558`
- QORE CI #1359 / run `32672074836` / attempt 2 / quality job `97274491968`
- source blob `1eeead4d5e2f874feeca8c46516d39d80d484d2a`
- tests blob `8eebd8982344682bfc04bd551fd6187ee2314c85`
- architecture blob `9f70c81a22c9b1c2edc670a73cf2d4708d606764`

Verify the live PR binding independently before substantive review. If HEAD/base/synthetic differ, declare binding failure and stop certification.

DeepSeek Expert R8 returned `VALIDACIÓN OK / HALLAZGOS: NINGUNO`; IA independently adjudicated that result as accepted without material defect. Do not trust either conclusion: attempt to falsify the implementation yourself.

## Files to inspect completely

1. `src/qore/infrastructure/securities_financing_semantics.py`
2. `tests/infrastructure/test_securities_financing_semantics.py`
3. `docs/architecture/QORE-UMI14-SECURITIES-FINANCING-SEMANTICS-001.md`

Inspect imported value types and the exact BASE..HEAD diff as needed.

## Coder priority

Review implementation correctness and negative-space discipline with emphasis on:

- exact-type boundaries (`type(x) is X`) and rejection of raw strings/subclasses;
- strict bool/int separation;
- exact UUID/date/Decimal/FinancialTenor state;
- revalidation of imported and local nested values at parent edges and inside `logical_values()`;
- malformed objects fabricated with `object.__new__` and `object.__setattr__`;
- post-construction child corruption and fail-closed behavior;
- all R8 repo payment/reset/fixing/calculation/observation invariants;
- FIXED vs FLOATING exclusivity and required/forbidden state;
- payment schedule ref vs reset schedule ref vs observation external ref separation;
- deterministic logical identity and no-collapse;
- no non-economic caller-order identity noise;
- canonical Decimal behavior for signed zero, equivalent values, extreme exponents and context independence;
- sorting/canonicalization, duplicate rejection and resource complexity for baskets/collateral/identity tuples;
- source/tests/doc correspondence;
- regression preservation for R1–R7 closure material;
- negative space and absence of network/provider I/O, wall clock, implicit UUID/randomness, generated dates, market observation, accrual/calculation/valuation, current positions/risk, execution, settlement, legal determination, Production or real-capital authority.

## Historical closure map that must remain consistent

- R1-01: securities-lending compensation completeness.
- R1-02: security quantity basis.
- R2-01: collateralization mode/external schedule semantics.
- R2-02: securities-lending compensation payment/reset timing.
- R3-01: margin-lending financing payment convention.
- R4-01: margin-lending financing reset convention.
- R5-01: margin-lending periodic fixing placement.
- R6-01: securities-lending floating compensation fixing/calculation/observation.
- `CLAUDE-UNR013-R7-01`: repo financing payment/reset/fixing identity collapse, corrected in R8.

Do not relabel these reasons.

## Material defect bar

A finding must include a concrete bounded witness. For a semantic collapse, construct CONTRACT A vs CONTRACT B that differ materially in static D04 obligations but share all represented R8 logical values. For an overrestriction, give a reasonably valid in-scope static contract rejected by a non-universal rule. For a type/revalidation/resource issue, give the exact construct and failure mode.

Do not report style preferences, optional extra tests, or theoretical complexity concerns without a material witness as defects.

## Required response

Start exactly with:

REVISOR: DEEPSEEK CODER
PACKAGE ID: UNR013-ETAPAC-R8-DS-CODER-01
VINCULACIÓN ACEPTADA: SÍ / NO
RESULTADO GENERAL: VALIDACIÓN OK / VALIDACIÓN CON HALLAZGOS

Echo the exact BASE, HEAD and SYNTHETIC actually verified.

Report mandatory results for exact types, nested revalidation, malformed-state adversarial cases, R8 repo timing/calculation/observation invariants, logical identity/no-collapse, Decimal/determinism/resources, ordering/duplicates, regressions, source/tests/doc consistency and authority separation.

For every material finding use:

FINDING ID: DS-CODER-UNR013-R8-XX
SEVERIDAD: ALTA / MEDIA / BAJA
CLASIFICACIÓN:
MATERIAL AFECTADO:
WITNESS:
RESULTADO INCORRECTO:
WHY MATERIAL:
MINIMUM CORRECTION:
TEST REQUIRED:

If there is no material finding, state `HALLAZGOS: NINGUNO`.

Any response returns first to IA adjudication. This review alone does NOT establish Ready, integration, closure of #394/UNR-013/UMI-14/PROGRAM D, Production, or real-capital authority.

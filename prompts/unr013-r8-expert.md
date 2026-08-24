# QORE Core / PROGRAM D / UMI-14 / UNR-013 — DeepSeek Expert R8

Perform an independent adversarial Full Closure review of the exact frozen R8 candidate. You have direct read-only repository and GitHub evidence tools. Use them; do not request pasted files.

## Identity and scope

Target: `UMI13-UNR-013` — securities-financing. Tracker #394. Parent #363. PR #437. Branch `agent/qore-umi14-securities-financing-full-closure-013`.

Owner is D04 static contractual semantics only for repo, securities lending, and margin lending. Production and real capital remain closed.

D04 may preserve static contractual conventions, references and logical identity. It must not execute them. D05 owns observations; D06 calendar/date resolution; D07 calculation/accrual/valuation; D08 accounts/current positions; D09 current risk/margin/exposure; D10 execution; D11 settlement/custody/movements; D22 legal/regulatory determination.

## Frozen evidence expected

- BASE `db83b106f3a5e7f30a788567dfa970a38b7a379a`
- BASE tree `5b9c218a4fe3609b10e34b1cf8523cade0d10bbe`
- HEAD `1c99f1987e78b3be3d8bb6a0d1ecf98c5f3675dc`
- HEAD tree `ca9722d11059f13a3c74c6820a15e15232c92171`
- SYNTHETIC `cd97ad3dbd6edb68855d06aba475d636be983bd9`
- SYNTHETIC tree `ca9722d11059f13a3c74c6820a15e15232c92171`
- ordered synthetic parents: BASE then HEAD
- ahead 33 / behind 0
- exactly 3 added files, +3487/-0
- freeze review `5003581550`
- post-freeze evidence review `5003585885`
- DeepSeek Expert dispatch review `5003586462`
- IA adjudication of Claude R7 finding `5003563622`
- QORE CI #1359, run `32672074836`, attempt 2, quality job `97274491968`
- source blob `1eeead4d5e2f874feeca8c46516d39d80d484d2a`
- tests blob `8eebd8982344682bfc04bd551fd6187ee2314c85`
- architecture doc blob `9f70c81a22c9b1c2edc670a73cf2d4708d606764`

Verify these independently using `repo_state`, git tools and `github_get`. If live PR HEAD differs from expected HEAD, declare binding failure and stop substantive certification.

## Files that must be read completely

1. `src/qore/infrastructure/securities_financing_semantics.py`
2. `tests/infrastructure/test_securities_financing_semantics.py`
3. `docs/architecture/QORE-UMI14-SECURITIES-FINANCING-SEMANTICS-001.md`

Also inspect relevant imported value types/usages when needed. Read long files in successive ranges until complete. Inspect the exact BASE..HEAD diff.

## Historical closure that must remain valid

- R1-01 securities-lending compensation completeness.
- R1-02 quantity basis.
- R2-01 collateralization.
- R2-02 securities-lending compensation payment/reset timing.
- R3-01 margin-lending financing payment convention.
- R4-01 margin-lending financing reset convention.
- R5-01 margin-lending periodic fixing placement.
- R6-01 securities-lending FLOATING compensation calculation/fixing/observation.
- R7 closed R6-01 by adding reset fixing timing, floating calculation, floating observation mode and external observation reference to securities-lending compensation.

Claude Code R7 then found `CLAUDE-UNR013-R7-01` HIGH: `RepoTerms` represented financing rate/calculation/observation but lacked financing payment convention, reset/re-fixing convention and periodic fixing placement, allowing materially different static repo obligations to collapse in logical identity. IA accepted this as a D04 static identity defect.

## R8 correction to falsify

R8 adds to `RepoTerms`:

- `financing_payment_mode`
- `financing_payment_tenor`
- `financing_payment_schedule_reference`
- `financing_reset_mode`
- `financing_reset_tenor`
- `financing_reset_schedule_reference`
- `financing_fixing_timing`

and preserves financing calculation/observation material.

Expected static rules include:

Payment:
- PERIODIC -> exact `FinancialTenor`, no schedule ref.
- AT_TERMINATION -> no tenor/ref.
- EXTERNAL_SCHEDULE -> exact schedule ref, no tenor.

FLOATING reset:
- PERIODIC -> exact reset tenor + exact fixing timing, no reset schedule ref.
- AT_PAYMENT -> no tenor/ref/fixing.
- REFERENCE_CONVENTION -> no tenor/ref/fixing.
- EXTERNAL_SCHEDULE -> exact schedule ref, no tenor/fixing.

Periodic fixing placement distinguishes IN_ADVANCE / IN_ARREARS / REFERENCE_CONVENTION.

FIXED must preserve payment convention but reject floating-only reset/fixing/calculation/observation material. FLOATING must require the exact reset/calculation/observation state needed by its selected modes.

Reset external schedule reference and observation external terms reference are distinct dimensions and must not collapse.

## Primary adversarial objective

Try to construct two materially different static repo contracts that share every represented R8 logical value. In particular attack:

- payment PERIODIC vs AT_TERMINATION vs EXTERNAL_SCHEDULE;
- reset PERIODIC vs AT_PAYMENT vs EXTERNAL_SCHEDULE vs REFERENCE_CONVENTION;
- fixing IN_ADVANCE vs IN_ARREARS vs REFERENCE_CONVENTION;
- calculation conventions such as daily-simple, daily-compounded, arithmetic-average;
- observation NONE / REFERENCE_CONVENTION / EXTERNAL_TERMS;
- payment schedule ref vs reset schedule ref vs observation external ref;
- independence of payment and reset dimensions;
- fixed/floating boundaries;
- external-delegation states.

Also search for material overrestriction. Do not call a design preference a defect. To claim overrestriction, give a concrete reasonably valid in-scope static contract that R8 rejects and explain why the rejected distinction belongs to D04.

## Exact-type and malformed-state review

Test the implementation conceptually and against tests for:

- `type(x) is X` boundaries where exactness is required;
- raw strings crossing enum boundaries;
- subclasses;
- bool/int ambiguity;
- malformed objects fabricated by `object.__new__`;
- post-construction mutation with `object.__setattr__`;
- nested revalidation of imported `FinancialTenor`, `EconomicIdentityId`, `DayCountConventionCode` and local wrappers;
- malformed payment/reset/reference/fixing children accepted by a parent.

## Logical identity and canonicalization

Verify that all economically/materially distinct represented dimensions survive `logical_values()` and that non-economic caller order does not create false identity. Check quantity basis, cash/security distinctions, collateralization states, duplicate policy, canonical ordering, and reference separation.

## Decimal / determinism / resource behavior

Review canonical Decimal behavior for finite-only values, signed zero, context independence, collision resistance and extreme exponent compactness. Review deterministic ordering and plausible resource behavior for large tuples/baskets/collateral. A resource observation is a defect only with a material bounded witness.

## Authority separation / negative space

Reject accidental authority for network/provider I/O, wall clock, implicit UUID/randomness, date generation, market observation, accrual/calculation/pricing/valuation, current positions/collateral/utilization, margin calls, execution, settlement, custody, legal eligibility, Production or real capital.

Static phrases such as payment/reset/fixing/calculation conventions or external references are allowed only as inert D04 contract semantics.

## Material defect criterion

For a missing dimension, demonstrate CONTRACT A vs CONTRACT B that share all currently represented fields but have materially different static contractual/economic obligations. Explain:
1. missing dimension;
2. materiality;
3. why D04 owns it;
4. why existing fields do not resolve it;
5. minimal witness;
6. minimal bounded correction;
7. required test.

For an overrestriction, demonstrate a concrete valid in-scope contract rejected by a non-universal rule.

## Required final response

Start with:

REVISOR: DEEPSEEK EXPERT
PACKAGE ID: UNR013-ETAPAC-R8-DS-EXPERT-01
VINCULACIÓN ACEPTADA: SÍ / NO
RESULTADO GENERAL: VALIDACIÓN OK / VALIDACIÓN CON HALLAZGOS

Echo exact BASE, HEAD and SYNTHETIC actually verified.

Then give `HISTORICAL FINDING CLOSURE` for R1-01, R1-02, R2-01, R2-02, R3-01, R4-01, R5-01, R6-01 and CLAUDE-UNR013-R7-01 as CERRADO / NO CERRADO with concise reasons.

Then report mandatory results for repo payment/reset/fixing/calculation/observation identity, payment/reset independence, reset-ref vs observation-ref separation, fixed/floating boundaries, exact types, nested revalidation, malformed-object adversarial cases, Decimal/determinism/resources, canonical ordering/duplicates/quantity basis/collateralization, securities-lending and margin-lending regressions, source/test/doc consistency, authority separation, negative space and Production closure.

For every finding use:

FINDING ID: DS-EXPERT-UNR013-R8-XX
SEVERIDAD: ALTA / MEDIA / BAJA
CLASIFICACIÓN: ...
MATERIAL AFECTADO:
WITNESS:
CONTRATO A:
CONTRATO B:
RESULTADO INCORRECTO:
WHY MATERIAL:
OWNER:
EXISTING FIELD CHECK:
MINIMUM CORRECTION:
TEST REQUIRED:

If no material findings, state `HALLAZGOS: NINGUNO`.

End by explicitly stating that your response alone does NOT establish Ready, integration, closure of #394/UNR-013/UMI-14/PROGRAM D, provider readiness, Production, or real-capital authority.

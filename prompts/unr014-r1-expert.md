# QORE / PROGRAM D / UMI-14 — UNR-014 R1 — DeepSeek Expert

You are **DeepSeek Expert**, the first external auditor in the serial QORE Full Closure chain.

Your task is independent adversarial review. Do not trust prior coordinator conclusions or green CI as semantic proof.

## Immutable package

- Repository: `mezas3238-hue/qore-core`
- PR: `#397`
- Target: `UMI13-UNR-014` — `event-contracts`
- Tracker: `#396`
- Package ID: `UNR014-ETAPAC-R1-DS-EXPERT-01`
- BASE: `76eda1ce4c324c3e97b70001ea4cac37a6d4a6a9`
- BASE TREE: `ca9722d11059f13a3c74c6820a15e15232c92171`
- HEAD: `4663af69a57812ff811bbe382efc6d787ae43506`
- HEAD TREE: `38ef8a4908aa63aab1da57cef557dc475f0a6a03`
- SYNTHETIC: `954ecb4214f84498211af7cf4abce56311ebb564`
- SYNTHETIC TREE: `38ef8a4908aa63aab1da57cef557dc475f0a6a03`
- ordered parents: BASE then HEAD

Exactly three additive qore-core files are authorized:

1. `src/qore/infrastructure/event_contract_semantics.py`
2. `tests/infrastructure/test_event_contract_semantics.py`
3. `docs/architecture/QORE-UMI14-EVENT-CONTRACT-SEMANTICS-001.md`

Frozen blobs:

- source: `2c7bba6773f0cd27d0003838c4bf64578a6f5e6f`
- tests: `f5d7fdb280661a570e9f290b00fd8a4c8e281c74`
- architecture: `869e5bc98aa68b86595e693172f0354f89536975`

R1 freeze review: `5004575114`.

Canonical post-freeze CI evidence will be present on PR #397 before this package is dispatched. Verify it independently from live GitHub rather than trusting this prompt.

## D04 ownership

This owner may preserve **static contractual event-contract definition and resolution terms only**.

D04 may preserve:

- event criterion;
- outcome-structure qualification;
- explicit outcome codes;
- contractual cash payouts;
- opaque event-subject reference;
- opaque contractual resolution-authority reference;
- ordered primary resolution-source codes;
- ordered fallback source codes;
- resolution-rule code;
- correction-policy code;
- source-conflict-policy code;
- optional static expiration date;
- optional static scheduled-resolution date;
- deterministic logical identity.

D04 must not perform or claim:

- D05 observed event/source evidence or current/resolved outcome;
- D06 current clock/deadline/calendar evaluation;
- D07 probability, pricing or valuation;
- D08/D09 positions, exposure, risk or current margin;
- D10 execution;
- D11 settlement/cash/position mutation;
- D22 legal/regulatory/eligibility determination;
- provider/network authority;
- Production;
- real capital.

## Core unresolved gap

`BINARY PAYOFF SHAPE != AUTHORITATIVE RESOLUTION TERMS`.

A binary payout alone does not identify which criterion, authority, source hierarchy, correction/conflict policy or resolution rule controls the contract.

R1 attempts to preserve those static distinctions without becoming a resolution engine.

## Required independent falsification

Read all three changed files completely, inspect surrounding imported definitions, inspect BASE..HEAD, inspect live PR metadata/reviews/CI, and attempt to falsify the model.

### 1. Missing static dimensions / identity collapse

Try to produce two materially different in-scope static event contracts A/B that share every represented logical value.

Attack at least:

- criterion;
- outcome structure;
- outcome codes;
- payout amount;
- payout currency identity;
- subject reference;
- resolution authority;
- primary source identities/codes;
- primary source precedence/order;
- fallback sources/order;
- resolution rule;
- correction policy;
- source-conflict policy;
- expiration date;
- scheduled-resolution date;
- evidence/reference material.

A finding is material only if you show a concrete A/B witness and explain why the missing distinction belongs to D04 rather than D05/D06/D07/D08/D09/D10/D11/D22.

### 2. Outcome ordering law

R1 canonicalizes caller input order of `outcomes` because no explicit contractual precedence/ordinal field grants authority to incidental tuple order.

Attempt to falsify this decision.

If outcome order is materially contractual for a valid in-scope event contract, provide a concrete witness where the same explicit outcome codes/payouts but different order changes a contractual obligation and cannot be represented by any existing explicit field. Distinguish true contractual precedence from UI/display/caller ordering.

Do not treat source priority similarly: primary/fallback source tuple order is intentionally preserved as contractual priority.

### 3. Independent static dates

R1 deliberately does **not** impose a universal chronology between `expiration_date` and `scheduled_resolution_date`.

Attempt to falsify both directions:

- Is there a universal D04 law that scheduled resolution must never precede expiration?
- Is there a universal D04 law that it must never follow expiration?

A finding requires a universal in-scope contract rule, not a common convention. D06 runtime time/calendar authority must remain separate.

### 4. Exact-type / malformed-state boundaries

Verify adversarially:

- exact UUID, not UUID subclasses;
- exact `EconomicIdentityId`, including nested UUID revalidation;
- exact `date`, rejecting `datetime`;
- exact finite `Decimal`, rejecting float/string/subclass/NaN/Infinity;
- exact local wrappers and rejection of raw strings;
- child objects fabricated with `object.__new__` / `object.__setattr__`;
- post-construction corruption caught by `logical_values()`;
- frozen/slotted values;
- no implicit wall clock/random UUID/global mutable state.

### 5. Decimal determinism/resources

Attempt to falsify:

- context independence;
- signed-zero canonicalization;
- equivalent numeric forms;
- extreme positive/negative exponents;
- bounded allocation behavior;
- deterministic output.

Prefreeze coverage reports one unexecuted owner line in the small fixed-form decimal branch. Coverage percentage alone is not a defect. Inspect that branch semantically and determine whether a concrete value violates canonicalization or bounded-resource requirements.

### 6. Source hierarchy semantics

Verify:

- exact non-empty primary tuple;
- optional fallback tuple;
- duplicate rejection;
- primary/fallback disjointness;
- order retained as priority material;
- source code is static opaque contractual material, not data-fetch authority.

Attempt to identify overrestriction: if a reasonably valid static contract needs the same source in both primary and fallback roles, or another state rejected by R1, provide a concrete valid witness and reason.

### 7. Outcome/payout overrestriction

R1 intentionally does not impose:

- binary-only outcome count;
- `$1/$0` payoff;
- complementary payouts;
- same payout currency across outcomes.

Verify that the owner remains extensible without accepting malformed state.

### 8. Logical identity / non-economic noise

Verify that every represented static contractual field participates in logical identity, while incidental caller outcome order does not. Check that separate contracts do not collapse and identical economic material does not split due only to irrelevant input ordering.

### 9. Tests/docs/source correspondence

Green CI is necessary but insufficient. Inspect whether tests can give false confidence, whether negative space is meaningful, and whether architecture docs overclaim or contradict source behavior.

## Finding bar

For every material finding provide:

- stable ID, e.g. `DS-EXPERT-UNR014-R1-01`;
- severity;
- exact source location/field;
- concrete valid Contract A / Contract B or concrete valid rejected contract;
- why the distinction is material;
- correct departmental owner;
- minimal bounded correction;
- whether HEAD mutation is required.

Do not report style preferences, optional extra coverage or downstream functionality as material defects.

## Required output

Begin exactly with:

`REVISOR: DEEPSEEK EXPERT`

`PACKAGE ID: UNR014-ETAPAC-R1-DS-EXPERT-01`

`VINCULACIÓN ACEPTADA: SÍ/NO`

`RESULTADO GENERAL: VALIDACIÓN OK / HALLAZGOS`

Then provide:

1. exact binding/evidence independently verified;
2. files/surrounding definitions inspected;
3. mandatory adversarial results;
4. findings with concrete witnesses, if any;
5. authority/negative-space assessment;
6. final result.

If no material defect exists, explicitly write:

`HALLAZGOS: NINGUNO`

`VALIDACIÓN OK`

Do not modify qore-core. Do not authorize Ready, merge, #396 closure, UMI-14/Program-D closure, Production or real capital.
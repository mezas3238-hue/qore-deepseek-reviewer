# QORE / PROGRAM D / UMI-14 — UNR-014 R1 — DeepSeek Coder

You are **DeepSeek Coder**, the second external auditor in the serial QORE Full Closure chain.

This review is READ-ONLY. Do not modify qore-core. Do not trust DeepSeek Expert, the coordinator, or green CI as semantic proof. Your job is implementation-level falsification after Expert + IA adjudication.

## Immutable package

- Repository: `mezas3238-hue/qore-core`
- PR: `#397`
- Target: `UMI13-UNR-014` — `event-contracts`
- Tracker: `#396`
- Package ID: `UNR014-ETAPAC-R1-DS-CODER-01`
- BASE: `76eda1ce4c324c3e97b70001ea4cac37a6d4a6a9`
- BASE TREE: `ca9722d11059f13a3c74c6820a15e15232c92171`
- HEAD: `4663af69a57812ff811bbe382efc6d787ae43506`
- HEAD TREE: `38ef8a4908aa63aab1da57cef557dc475f0a6a03`
- SYNTHETIC: `954ecb4214f84498211af7cf4abce56311ebb564`
- SYNTHETIC TREE: `38ef8a4908aa63aab1da57cef557dc475f0a6a03`
- ordered synthetic parents: BASE then HEAD

Authorized qore-core delta is exactly three additive files:

1. `src/qore/infrastructure/event_contract_semantics.py`
2. `tests/infrastructure/test_event_contract_semantics.py`
3. `docs/architecture/QORE-UMI14-EVENT-CONTRACT-SEMANTICS-001.md`

Frozen blobs:

- source: `2c7bba6773f0cd27d0003838c4bf64578a6f5e6f`
- tests: `f5d7fdb280661a570e9f290b00fd8a4c8e281c74`
- architecture: `869e5bc98aa68b86595e693172f0354f89536975`

R1 freeze review: `5004575114`.
Canonical post-freeze CI review: `5004586431`.
Expert dispatch trace: `5004587587`.

Before reviewing, verify from live GitHub that:
- PR #397 is still open, draft, unmerged;
- HEAD and synthetic match exactly;
- no HEAD mutation happened after freeze;
- canonical post-freeze CI is the exact synthetic R1 run and is green;
- an Expert review for package `UNR014-ETAPAC-R1-DS-EXPERT-01` exists on the same frozen HEAD;
- the coordinator IA adjudication of Expert exists and does not require a new round.

If any serial prerequisite or binding is missing/mismatched, return `VINCULACIÓN ACEPTADA: NO` and stop. Do not infer permission to continue.

## D04 ownership

The owner may preserve static event-contract definition and contracted resolution terms only:
- criterion;
- outcome structure/codes;
- per-outcome non-negative contractual cash payout and currency identity;
- contract instrument identity;
- subject reference;
- resolution authority reference;
- ordered primary/fallback source codes;
- resolution/correction/source-conflict rule codes;
- optional static expiration and scheduled-resolution dates;
- deterministic frozen logical identity.

It must not observe or resolve events, evaluate current time/deadlines, price/value probabilities, hold current positions/risk, execute orders, settle/move cash, make legal determinations, call providers, enable Production, or authorize real capital.

## Required Coder review

Read the complete source, tests and architecture doc. Inspect BASE..HEAD and relevant imported definitions. Then attack the implementation as code, not as prose.

### 1. Exact-type correctness

Try to break every wrapper and parent with:
- raw strings and wrong primitives;
- subclasses of `str`, `UUID`, `Decimal`, `EconomicIdentityId`, local wrappers and local dataclasses;
- `bool` where numeric behavior could leak;
- `datetime` where exact `date` is required;
- malformed values produced with `object.__new__` and `object.__setattr__`;
- malformed nested UUID/EconomicIdentity state;
- valid-class instances with corrupted child attributes.

Confirm parent construction and every `logical_values()` revalidate enough nested state to fail closed.

### 2. Logical identity implementation

Try to produce concrete A/B contracts where every represented material is equal but a static D04 obligation differs.

Attack criterion, outcome structure/code, amount, currency, subject, authority, source identities/codes, source order, fallback order, resolution rule, correction policy, conflict policy, expiration date, scheduled resolution date, terms/evidence references.

Also attack the inverse: same static contract material should not split only because caller outcome tuple order changes.

Source order is intentionally material; outcome caller order is intentionally canonicalized. Falsify either law only with a concrete contractual witness.

### 3. Collection behavior

Inspect:
- exact tuple enforcement;
- minimum two outcomes;
- unique outcome codes;
- stable sorting key and deterministic canonicalization;
- primary non-empty rule;
- fallback optional rule;
- duplicate source rejection;
- primary/fallback disjointness;
- order preservation for source priority.

Look for accidental aliasing, mutation, set/dict nondeterminism, or normalization that destroys contractual distinctions.

### 4. Decimal implementation

Audit `_canonical_decimal` line-by-line. Build concrete values mentally or by local read-only execution if available for:
- zero and signed zero;
- trailing zeros;
- integers;
- small fixed fractions;
- exponents around compact/fixed crossover;
- very large positive/negative exponents;
- context precision changes;
- finite-value enforcement;
- negative payout rejection;
- allocation proportional to exponent magnitude.

The one uncovered owner line in canonical CI is not automatically a defect. Determine whether a real semantic/resource counterexample exists.

### 5. Date behavior

Verify exact `date` and rejection of `datetime`. Confirm no implicit universal ordering law is smuggled between expiration and scheduled resolution. Do not invent runtime D06 authority.

If you believe a missing static timing dimension is material, provide a concrete in-scope contract witness and explain why it belongs to D04 under tracker #396 rather than to downstream D06 evaluation.

### 6. Opaque code boundaries

Audit canonical code syntax and length. Determine whether it can represent the tracker-authorized criterion/source/rule/policy identities without provider/network authority. A finding requires a concrete valid contractual code/reference state that cannot be represented, not a preference for URLs or richer enums.

### 7. Tests and docs

Look for tests that assert implementation behavior without proving the claimed semantic property, missing negative-space cases, or documentation that overclaims behavior. Findings must be material to Full Closure, not optional coverage suggestions.

### 8. Security/governance negative space

Search changed code for wall clock, random UUID generation, mutable globals, secrets, provider access, filesystem/network I/O, retry/scheduler/thread behavior, execution, settlement, Production or real-capital authority.

## Finding bar

Every material finding must include:
- stable ID such as `DS-CODER-UNR014-R1-01`;
- severity;
- exact code location;
- concrete failing/misrepresented contract or malformed-state witness;
- why it is material to D04 Full Closure;
- correct departmental owner;
- minimal bounded correction;
- whether HEAD mutation/new round is required.

Do not report style preferences, theoretical enhancements without a witness, or downstream D05/D06/D07/D08/D09/D10/D11/D22 functionality as defects.

## Required output

Begin exactly:

`REVISOR: DEEPSEEK CODER`

`PACKAGE ID: UNR014-ETAPAC-R1-DS-CODER-01`

`VINCULACIÓN ACEPTADA: SÍ/NO`

`RESULTADO GENERAL: VALIDACIÓN OK / HALLAZGOS`

Then include:
1. exact binding and serial prerequisites verified;
2. files/evidence inspected;
3. implementation-level adversarial results;
4. every finding with concrete witness, if any;
5. authority/negative-space result;
6. final result.

If there is no material defect, explicitly write:

`HALLAZGOS: NINGUNO`

`VALIDACIÓN OK`

Do not modify qore-core. Do not authorize Ready, merge, #396 closure, UMI-14/Program-D closure, Production or real capital.
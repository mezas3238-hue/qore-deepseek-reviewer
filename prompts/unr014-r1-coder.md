# QORE / PROGRAM D / UMI-14 — UNR-014 R1 — DeepSeek Coder

You are **DeepSeek Coder**, the second external auditor in the serial QORE Full Closure chain.

This package is created only after DeepSeek Expert actually reported and the coordinator IA adjudicated that report. Work READ-ONLY. Do not modify qore-core. Do not trust Expert, the coordinator, tests, docs, or green CI as semantic proof.

## Immutable binding

- Repository: `mezas3238-hue/qore-core`
- PR: `#397`
- Tracker: `#396`
- Target: `UMI13-UNR-014` — `event-contracts`
- Package ID: `UNR014-ETAPAC-R1-DS-CODER-01`
- BASE: `76eda1ce4c324c3e97b70001ea4cac37a6d4a6a9`
- BASE TREE: `ca9722d11059f13a3c74c6820a15e15232c92171`
- HEAD: `4663af69a57812ff811bbe382efc6d787ae43506`
- HEAD TREE: `38ef8a4908aa63aab1da57cef557dc475f0a6a03`
- SYNTHETIC: `954ecb4214f84498211af7cf4abce56311ebb564`
- SYNTHETIC TREE: `38ef8a4908aa63aab1da57cef557dc475f0a6a03`
- ordered synthetic parents: BASE then HEAD

Exactly three additive qore-core files are authorized:

1. `src/qore/infrastructure/event_contract_semantics.py`
2. `tests/infrastructure/test_event_contract_semantics.py`
3. `docs/architecture/QORE-UMI14-EVENT-CONTRACT-SEMANTICS-001.md`

Frozen blobs:

- source: `2c7bba6773f0cd27d0003838c4bf64578a6f5e6f`
- tests: `f5d7fdb280661a570e9f290b00fd8a4c8e281c74`
- architecture: `869e5bc98aa68b86595e693172f0354f89536975`

Serial evidence already present on PR #397:

- R1 freeze review: `5004575114`
- canonical post-freeze CI review: `5004586431`
- Expert dispatch trace: `5004587587`
- DeepSeek Expert report: submitted by `qore-deepseek-reviewer` at `2026-08-24T06:54:16Z`, package `UNR014-ETAPAC-R1-DS-EXPERT-01`, binding accepted, result `VALIDACIÓN OK`, `HALLAZGOS: NINGUNO`
- coordinator IA adjudication of Expert: review `5005218910`, result `EXPERT VALIDADO — SIN DEFECTO MATERIAL`

Before any substantive review, verify all serial prerequisites live. If the PR, BASE, HEAD, synthetic, blobs, Expert report, or IA adjudication do not match exactly, return `VINCULACIÓN ACEPTADA: NO` and stop.

## What Expert concluded — challenge it, do not repeat it

Expert found no material identity collapse, accepted outcome caller-order canonicalization, accepted independent expiration/scheduled-resolution dates, accepted exact-type/malformed-state boundaries, accepted Decimal canonicalization/resource behavior, accepted source hierarchy/disjointness, accepted payout extensibility, and found no D04 authority leak.

Expert also made two explicitly non-material observations:

1. a fabricated object missing required slots may raise `AttributeError` rather than the typed validation error, but is not accepted or trusted;
2. architecture section 13 preserves a pre-freeze administrative snapshot even though live PR state has advanced; Expert judged this historical/admin text non-semantic and not a reason to mutate frozen HEAD.

Your task is to independently try to prove Expert or IA wrong with concrete implementation witnesses.

## D04 authority

D04 may preserve static event-contract definition and contracted resolution terms only:

- criterion;
- outcome structure and explicit outcome codes;
- per-outcome contractual non-negative cash payout and currency economic identity;
- contract instrument identity;
- opaque subject reference;
- opaque resolution authority reference;
- ordered primary and fallback source codes;
- resolution rule, correction policy, source-conflict policy;
- optional static expiration date;
- optional static scheduled-resolution date;
- deterministic frozen logical identity.

D04 must not observe events/results, evaluate current time/deadlines, price probabilities, hold positions/risk, execute orders, settle cash, make legal determinations, call providers, enable Production, or authorize real capital.

## Required implementation-level falsification

### 1. Exact-type and malformed-state boundaries

Attack every wrapper/parent with wrong primitives, subclasses, `datetime` in date fields, Decimal subclasses/NaN/Infinity, malformed nested `EconomicIdentityId`, fabricated children through `object.__new__`/`object.__setattr__`, post-construction corruption, and partially fabricated instances with missing slots.

Determine specifically whether any malformed state can be *accepted*, converted to stable logical identity, or bypass fail-closed behavior. A mere exception-type preference is not material unless a documented contract requires a typed error and the mismatch has architectural consequence.

### 2. Logical identity completeness

Try to construct Contract A and Contract B that are materially distinct static D04 contracts but produce identical `logical_values()`. Attack criterion, outcome taxonomy, payout amount/currency, subject, authority, source identity/order, fallback order, rule/correction/conflict policy, both static dates, terms ID, instrument identity, and evidence ref.

Also attack the inverse: identical contractual material should not split solely because caller outcome tuple order changes.

A finding requires a concrete A/B witness.

### 3. Outcome ordering

Expert accepted canonicalization of outcome tuple order. Falsify it only if tuple order itself can encode a real contractual obligation for an in-scope contract despite explicit outcome codes/payouts and without relying on UI/display/caller accident.

Source tuple order is intentionally different: it is contractual priority material and must remain identity-relevant.

### 4. Collections and source hierarchy

Audit exact tuple enforcement, 2+ outcomes, unique codes, deterministic sorting, primary non-empty, fallback optional, duplicate rejection, primary/fallback disjointness, and order retention.

Try to produce a valid D04 contract that is rejected due to duplicate/disjointness rules, especially a real witness where the same exact source code must legitimately occur in both primary and fallback roles.

### 5. Decimal canonicalization and resources

Audit `_canonical_decimal` line by line, including crossover points between fixed and exponent forms. Test mentally or through read-only execution:

- signed zero;
- trailing zero equivalence;
- ordinary integers/fractions;
- positive and negative exponent boundaries;
- huge exponent magnitude;
- context precision changes;
- values with long coefficient length plus huge exponents;
- allocation behavior before every string multiplication.

Expert specifically accepted the previously uncovered fixed fractional arm. Find a concrete counterexample if one exists.

### 6. Static dates

Try to prove a universal D04 ordering law between expiration and scheduled resolution. Do not elevate a market convention to a universal law. Distinguish static terms from D06 runtime/calendar evaluation and D05 actual observation timestamp.

### 7. Docs/tests/source correspondence

Challenge the Expert judgment that stale administrative state in architecture section 13 is non-material. It is a material defect only if it changes, contradicts, or ambiguously grants semantic/authority behavior of the frozen D04 owner, or violates a closure requirement that makes the frozen evidence untrustworthy.

Inspect whether tests merely mirror implementation assumptions rather than falsify them, and whether any untested path supports a concrete material defect.

### 8. Security and negative space

Search the exact changed source for wall clock, random UUIDs, mutable global state, secrets, filesystem/network/provider access, retries/schedulers/threads, execution, settlement, Production, or real-capital authority.

## Finding standard

For every material finding include:

- stable ID, e.g. `DS-CODER-UNR014-R1-01`;
- severity;
- exact location;
- concrete failing/rejected/misrepresented contract witness;
- actual vs required behavior;
- why the issue belongs to D04;
- minimal bounded correction;
- whether HEAD mutation is required, which would invalidate R1 and require a new round.

Do not report style preferences, optional coverage additions, or downstream functionality as material findings.

## Required output

Begin exactly:

`REVISOR: DEEPSEEK CODER`

`PACKAGE ID: UNR014-ETAPAC-R1-DS-CODER-01`

`VINCULACIÓN ACEPTADA: SÍ/NO`

`RESULTADO GENERAL: VALIDACIÓN OK / HALLAZGOS`

Then provide:

1. live serial/binding verification;
2. exact files and surrounding definitions inspected;
3. adversarial implementation results;
4. findings with concrete witnesses, if any;
5. explicit judgment on the two Expert non-material observations;
6. D04/negative-space assessment;
7. final result.

If no material defect exists, explicitly write:

`HALLAZGOS: NINGUNO`

`VALIDACIÓN OK`

Do not modify qore-core. Do not authorize Ready, merge, #396 closure, UMI-14/Program-D closure, Production, or real capital.
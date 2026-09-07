# QORE PR #500 — first cTrader DEMO execution vertical — External Expert R1

## PURPOSE

Perform one fresh independent falsification of the exact first cTrader DEMO
execution candidate. Do not trust prior PASS claims and do not mistake software
readiness for operational certification. Search for any material defect that could
forge Trader Lab eligibility, select more than one candidate, connect to a LIVE
account, misread broker-native units, bypass fresh Risk authority, submit an
unprotected order, lose the broker order ID, or falsely report reconciliation.

The repository currently has no usable cTrader credentials in GitHub Actions. That
is a real external stop condition: the review may validate fail-closed behavior and
software contracts, but it must not claim that five real Lab results, a real market
preflight, or a real DEMO order have occurred.

## IMMUTABLE BINDING

- Repository: `mezas3238-hue/qore-core`
- PR: `#500`
- BASE: `c98d486a760056d9a71173c7041cf6f0c58bd9e9`
- HEAD: `b8334e15507f4b571770a2767290d34904c6dc91`
- SYNTHETIC: `d2b033724a1c0ef74237d2a6b7ccef8fe8d32e2b`
- QORE CI: run `34133120464`, job `101777757046`, SUCCESS
- QG: Ruff PASS; Mypy PASS on 920 files; Pytest 6987 PASS / 8 warnings;
  66051 statements / 10356 missed / 84% coverage.
- Delta: 44 files, +15730/-24.

Fail closed before model spend if any live binding differs.

## SIX REQUIRED LANES

### L1 — Trader Lab authenticity and five-result selection

Trace VT-01/08/09/17/31 through canonical inputs, methodology identities,
instrument binding, economic observations, admission and selection. Attack forged
dataclasses, stale or synthetic evidence presented as real, hidden clocks, partial
cohorts, cross-instrument substitution, duplicate identities and tie breaking.
Prove exactly five individual results are required and at most one retained
candidate can be `DEMO_ELIGIBLE`. Do not certify results that were not produced
against real broker evidence.

### L2 — cTrader DEMO discovery and authentication

Verify the real Spotware OpenApiPy surface, `demo.ctraderapi.com:5035`, TLS,
application authentication, token handling, account-list discovery, trading scope,
configured account selection and explicit `isLive=false`. Attack absent/default
protobuf fields, wrong account IDs, refresh/reconnect races, secret disclosure and
all QORE_CTRADER_* aliases. No LIVE/Production/real-capital path is permitted.

### L3 — Symbol, prices, volumes and timeframes

Falsify symbol enablement and exact identity, digits, relative-price decoding,
closed M1/M5/M15/H4 trendbars, stale/incomplete bars and broker metadata drift.
Check official cTrader volume semantics end to end: provider min/max/step fields
and order/deal volumes are integer hundredths of a unit. Attack any mapping that
could turn a minimum broker volume into the wrong QORE quantity or wire volume.

### L4 — Protected LIMIT and fresh Risk authority

Trace the only reachable first-order path from the selected Trader setup through
minimum valid quantity, LIMIT entry, explicit SL/TP geometry, fresh DEMO Risk
authorization, reservation, safety switch and `ExecutionSubmission`. Attack
expired/foreign/mismatched decisions, alternate MARKET paths, mutable re-creation,
wrong account/instrument, or any route where Trader/provider evidence can mint Risk
authority. Identify whether a concrete operational runner actually composes this
path; do not infer one from isolated contracts.

### L5 — Provider mutation, idempotency and broker order ID

Audit `ProtoOANewOrderReq`, absolute limit/SL/TP fields, client message ID,
idempotency behavior, error events, accepted/rejected/partial/unknown outcomes and
disconnect races. Prove an accepted mutation cannot be reported without a real
provider order reference and that an ambiguous possible effect cannot be blindly
resubmitted.

### L6 — Reconciliation and truthful closure

Falsify event/query fill decoding, deal identity, cumulative volume, duplicate or
out-of-order evidence, partial fills, completion semantics and polling. Prove the
same Risk receipt and broker order reference remain bound through reconciliation.
Check workflows, runbook claims and artifacts: absent credentials must block before
network mutation, and read-only preflight must not be presented as order evidence.

## SEMANTIC LSP AND REASONING

Use all six independent reviewer lanes to terminal state. Semantic LSP evidence is
mandatory: definitions, references, implementations where applicable, hover/types,
reachable call sites and a final exact-binding recheck. HIGH baseline; MAX for
evidence authenticity, DEMO/LIVE separation, provider volume units, Risk freshness,
unknown outcomes/idempotency and reconciliation.

## VERDICT

Read-only review. Do not edit, commit, push or merge qore-core. Do not perform a
broker mutation. Report only material findings with deterministic witness, exact
location, violated invariant, reachable impact, root family and bounded correction.

If no material finding exists, end exactly:

`HALLAZGOS: NINGUNO`

`VALIDACIÓN OK`

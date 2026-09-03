# QORE DEMO First Trader Cohort — Correction 001: Exact Runtime Boundaries

## Continuity law

This is a bounded correction over the completed Batch-004 candidate. DO NOT restart Batch-004 and DO NOT rebuild its six completed lanes. Restore the exact host-provided candidate artifact first, preserve all valid work, and correct only the independently reproduced exact-runtime / recursive-revalidation residual family plus directly necessary adversarial tests/docs.

Immutable predecessor:
- START: `9672c4d999bd5d3e6db544f349243bc6abea0363`
- TREE: `67c77fbe016b6688e5114165a5a14c3026832027`
- Harness Batch-004 run: `33763264301`
- artifact: `9897961764`
- exact artifact candidate patch SHA256: `f84de764cad51b11f5da0b2df6059ecec0ee1a9c33da6274e4a553c6c307dff0`

## Independent IA material residual

Batch-004 correctly built fail-closed shared Trader primitives and refused to invent the external methodologies for VT-01/08/09/17/31. However, multiple trust-bearing boundaries still use permissive `isinstance` checks for Trader IDs, versions/fingerprints, enums, datetimes, position/value records, session records and OHLC records. Under QORE law, subclass compatibility is not sufficient for identity/authority/economic evidence semantics.

Examples include `TraderIdentity`, `TraderAction`, `TraderState`, `PositionLifecycle`, `LiquidityLevel`, `FairValueGap`, `LiquiditySweep`, `TraderMethodologyNormalization`, `SessionWallClockTransition`, `session_contains`, OHLC tuple validation, and canonical UUID/datetime/enum handling.

Canonical laws:
`BOOL != INT`
`SUBCLASS COMPATIBILITY != TRUST-BEARING IDENTITY`
`TYPE VALIDITY MUST SURVIVE RE-ENTRY / REFLECTIVE CORRUPTION`
`DETERMINISTIC CANONICALIZATION MUST NOT LAUNDER A MALICIOUS SUBCLASS`
`TRADER OUTPUT != EXECUTION AUTHORITY`

## Six bounded lanes

### Lane 1 — semantic trust-boundary inventory
Use LSP definitions/references/implementations to enumerate every constructor and consumer of the new Batch-004 Trader primitives. Classify where exact runtime type is required versus intentional structural polymorphism (e.g. the market-clock Protocol). Record the complete root family in checkpoints.

### Lane 2 — identity/config/canonical hardening
Enforce exact runtime types for trust-bearing TraderId/TraderVersion/TraderFingerprint/UUID/datetime/enum/scalar material. Preserve intentionally generic immutable Mapping/tuple APIs only if every contained trust-bearing value is recursively exact-validated and canonicalized without laundering. Strings/bytes/bool/numeric subclasses must not cross boundaries incorrectly.

### Lane 3 — state/lifecycle/session hardening
Enforce exact types and recursive revalidation for TraderAction, TraderState, PositionLeg, PositionLifecycle, TraderSide/ActionKind/PositionStage, SessionWindow, SessionWallClockBoundary/Transition and datetime fields. `MarketClockProtocol` may remain structurally polymorphic because it is a composition interface, not an authority/identity token; its returned values must still be exact-revalidated.

### Lane 4 — OHLC/liquidity/opportunity/evidence hardening
Enforce exact types for OhlcBar and all derived liquidity/FVG/sweep/session extrema/value records, tuples, directions/kinds, timestamps and strict numeric fields. Re-entry functions must reject reflectively corrupted/subclass-laundered nested records rather than trusting constructor history. Preserve closed-bar/no-lookahead law.

### Lane 5 — methodology + adversarial/metamorphic tests
Enforce exact runtime and recursive revalidation for MethodologyElement/TraderMethodologyNormalization/classification/TraderId and the five blocked cohort records. Add malicious-subclass tests, `object.__setattr__` corruption/re-entry tests, bool-vs-int tests, datetime subclasses, enum subclasses where constructible, forged nested value objects, and cross-binding cases. The five concrete evaluators remain `MATERIAL_BLOCKED` until their external methodology fichas are formalized; do not invent trading rules.

### Lane 6 — integrated audit + docs
Audit the entire recovered 17-file candidate for the same causal family. Update architecture documentation only as needed. Preserve provider neutrality, deterministic behavior, no hidden RNG/now/retry/scheduler/thread, no forced trade, no Risk bypass, no Production/real-capital authority. Run focused tests; host owns FULL QG.

## Acceptance criteria

- Recovered Batch-004 candidate is inherited byte-exactly and not recreated.
- All trust-bearing new Trader values use exact runtime semantics where required.
- Recursive consumers reject nested reflective corruption and subclass laundering.
- Intentional Protocol polymorphism remains only at non-authority composition seams and exact-validates returned material.
- No methodology for VT-01/08/09/17/31 is invented; blocked state remains explicit.
- No test weakening/suppression/coverage gaming.
- Six durable checkpoints complete and final output says `COMPLETE` only when all six lanes are closed.

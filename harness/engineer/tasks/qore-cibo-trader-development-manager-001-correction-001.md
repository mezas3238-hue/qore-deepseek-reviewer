# HARNESS ENGINEER — QORE CIBO TRADER DEVELOPMENT MANAGER / CORRECTION 001

## PACKAGE

`HARNESS-ENGINEER-QORE-CIBO-TRADER-DEVELOPMENT-MANAGER-001-CORRECTION-001`

## TARGET

Repository: `mezas3238-hue/qore-core`
PR lineage: `#480`
Issue: `#479`
Independent IA adjudication comment: `#issuecomment-5518007416`

Exact rejected candidate input:

- HEAD `576803fbda76970a4bbfe2287b5f9ca101d0f6c3`
- TREE `11f35844670551ac4ab5be322272a3221e6b1c4b`
- BASE of current PR freeze `9672c4d999bd5d3e6db544f349243bc6abea0363`

Artifact-only. Do not push, merge, mutate PR #480 directly, or alter any other frozen PR. Return a bounded corrective patch against this exact HEAD.

## WHY THIS CORRECTION EXISTS

DeepSeek Expert R1 run `33693668970` / job `100457799418` interrupted before all reviewer lanes finished, but durable checkpoints reproduced material witnesses. GPT-5.6 Sol independently re-read the exact HEAD and adjudicated the current freeze as rejected.

Do not restart the original Batch 004 investigation. Use the existing findings as the starting point and solve the bounded defects below.

## MATERIAL DEFECTS — MUST CLOSE

### F1 — Contradictory operating evidence can still reach SELECTED

`review_capability_profile()` recognizes blocking operating evidence, including at least `PROMOTION_RECOMMENDED + SUSPEND`, as contradictory. `CiboTraderManager.decide(SELECT)` currently does not consume `profile.operating_conditions`, so a profile carrying a blocking `SUSPEND`/`RETURN_TO_LAB`-class condition can still become `SELECTED` when other gates pass.

Required invariant:

`BLOCKING/TRAINING-RETURN OPERATING CONDITION != SELECTABLE DEMO MANAGEMENT STATE`

Define the exact fail-closed policy from existing `CiboOperatingAction` semantics. Do not invent new operational authority. Add adversarial tests for every existing operating action that semantically blocks or returns a Trader to Lab, plus non-blocking conditions that must remain allowed if the current contract says so.

### F2 — Eligibility/version/A-B binding inconsistent for REDUCE/SUSPEND/BLOCK

`REDUCE` binds eligibility only if present. `SUSPEND` and `BLOCK` currently read `eligibility.experiment_arm` / `eligibility.risk_mode` without exact-type validation or `_bind_eligibility`.

Required invariants:

- if a management decision retains an experiment arm/risk mode from eligibility, that eligibility must be exact-type validated and bound to the same Trader identity + exact config fingerprint;
- stale/cross-version/cross-config eligibility must never be retained as attribution evidence;
- A/B arm/risk attribution must not be fabricated or laundered by a non-SELECT action;
- absence of eligibility must follow an explicit deterministic policy per action; do not invent an arm/risk mode.

### F3 — Temporal binding asymmetry

Establish and document one deterministic timeline policy for management decisions. At minimum, no management decision may predate the evidence/profile state it claims to act on or the eligibility certification it retains.

Consider both:

- `profile.freshness.as_of`
- `eligibility.certified_at` when eligibility is retained/required

Apply consistently across SELECT/REDUCE/SUSPEND/BLOCK according to exact semantics. Add boundary tests for equality and one-microsecond-before cases. No implicit current time.

### F4 — Typed Result boundary escape

Malformed/wrong-runtime-type `eligibility` must never cause uncaught `AttributeError` in `decide()` for REDUCE/SUSPEND/BLOCK. Public API must fail closed as typed `Failure(CiboManagerValidationError|appropriate typed manager error)`.

Test `object()`, bool/string/lookalike subclasses where relevant, reflectively corrupted nested evidence where house conventions require recursive validation, and valid eligibility controls.

## SECONDARY AUDIT — CLOSE IF REPRODUCIBLE WITHOUT SCOPE EXPANSION

Re-check the interrupted Expert checkpoint observations while touching the same contracts:

1. review contradiction coverage beyond only `SUSPEND + PROMOTION_RECOMMENDED`, especially `RETURN_TO_LAB` and other states/actions that cannot coherently recommend promotion;
2. `decided_at >= profile.freshness.as_of` consistency;
3. risk-envelope evidence anchoring to certified risk-stage evidence if the existing architecture promises that provenance rather than out-of-band certification;
4. concentration evidence/type validation before field access;
5. logical_values recursive revalidation / secret sanitation only if the accepted QORE house standard for comparable objects requires it.

Do not broaden into unrelated refactoring. If a secondary item is not materially justified by existing contracts, record it as adjudicated non-finding rather than inventing a new policy.

## SEMANTIC LSP — MANDATORY

Before edits and after stabilization use repository-wide semantic LSP, not grep-only. At minimum use:

- `hover`
- `goToDefinition`
- `findReferences`
- `goToImplementation` where applicable

Trace:

- `CiboTraderManager.decide`
- `_bind_eligibility`
- `CiboDemoEligibilityEvidence`
- `CiboOperatingAction`
- `CiboOperatingCondition`
- `CiboCertificationState`
- `CiboEvidenceFreshnessState`
- `review_capability_profile`
- `CiboManagementDecision`

Inspect relevant tests and any downstream consumers to avoid changing semantics accidentally.

## ALLOWED IMPLEMENTATION SCOPE

Prefer modifying only:

- `src/qore/infrastructure/cibo_trader_manager.py`
- `src/qore/infrastructure/cibo_trader_development_review.py` only if secondary contradiction closure is justified
- `tests/infrastructure/test_cibo_trader_manager.py`
- `tests/infrastructure/test_cibo_trader_development_review.py` only when review logic changes
- `docs/architecture/QORE-CIBO-TRADER-DEVELOPMENT-MANAGER-001.md` only to align exact implemented semantics

Do not touch CIBO Cognitive Executive Batch 006 files. Do not touch Trader Lab PR #481.

## CROSS-CUTTING INVARIANTS

- provider-neutral;
- no provider-native order construction;
- no execution authority;
- no Risk bypass;
- no Trader promotion authority;
- exact runtime types, `bool != int`, no subclass laundering where exact type required;
- frozen/slots dataclasses where applicable;
- recursive validation consistent with accepted QORE house patterns;
- timezone-aware explicit timestamps;
- no implicit now/today/uuid4;
- no hidden RNG/retry/sleep/thread/scheduler/network;
- deterministic ordering/canonicalization;
- sanitized evidence/no secrets;
- uncertainty fails closed;
- TEST/DEMO only; no Production or real-capital authority.

## REQUIRED TEST WITNESSES

At minimum prove:

1. exact old F1 witness no longer SELECTS when profile has blocking SUSPEND condition;
2. RETURN_TO_LAB-class operating condition cannot silently SELECT if semantics are blocking;
3. valid non-blocking condition remains selectable when every other gate is valid;
4. cross-version/cross-config eligibility rejected on REDUCE/SUSPEND/BLOCK whenever its attribution would be retained;
5. `eligibility=object()` returns typed Failure for all four actions, never raises;
6. decision before `profile.freshness.as_of` rejected where decision purports to act on that profile;
7. decision before retained eligibility `certified_at` rejected;
8. equality timestamp boundaries pass when otherwise valid;
9. no action can fabricate experiment arm/risk mode without validated eligibility;
10. no correction creates execution, Risk-bypass or promotion authority.

## FULL QUALITY GATE

Run exactly:

```bash
ruff check .
mypy src tests
pytest --cov=src/qore --cov-report=term-missing
git diff --check
```

Focused tests are additive only.

No test weakening, skips/xfail, type-ignore hiding, linter suppression or artificial coverage exclusions.

## BUDGET

- maximum changed files: 7
- maximum diff lines: 1400

Use less if possible.

## DURABLE CHECKPOINT / RECOVERY

Continuously retain:

```text
PHASE
FINDINGS
DECISIONS
EVIDENCE
UNCERTAINTIES
LANES COMPLETED
LANES PENDING
CHANGES
WHAT DONE
WHAT FOUND
WHAT CLOSED
WHAT REMAINS
WHERE RESUME
PENDING NEXT ACTION
SAFE RESUME
```

Never repeat completed investigation after an interruption.

Final literal marker, with no backticks:

## RESUME STATE
COMPLETE

Only emit COMPLETE if correction, adversarial tests, post-edit LSP, diff audit and FULL QG are all genuinely complete.

## HANDOFF

Return artifact only with exact patch, changed files, diffstat, LSP evidence, focused tests, FULL QG, unresolved uncertainty and candidate readiness.

After host materialization, the old freeze/reviews are obsolete. Required fresh gate is:

`FULL QG -> NEW FREEZE -> DEEPSEEK EXPERT -> GPT IA -> DEEPSEEK CODER -> GPT IA -> CLAUDE -> FINAL GPT IA`.
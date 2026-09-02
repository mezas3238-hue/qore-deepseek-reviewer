# HARNESS ENGINEER — QORE TRADER LAB CORRECTION 001

## PACKAGE

`HARNESS-ENGINEER-QORE-TRADER-LAB-001-CORRECTION-001`

## AUTHORITY / SOURCE

Repository: `mezas3238-hue/qore-core`
PR under correction: `#481`
Exact frozen defective HEAD: `5d25445faf57fa83410b57faf5eaf1f437949129`
Exact HEAD tree: `f9df989d7e7120d8742d4001b045fdd11cb0cb03`
Base before the recovery candidate: `9672c4d999bd5d3e6db544f349243bc6abea0363`
DeepSeek Expert package: `QORE-PR481-TRADER-LAB-DS-EXPERT-R1-001`
Expert verdict: `VALIDACIÓN NO OK`

This is a CORRECTION pass. Do not rebuild Trader Lab from scratch. Preserve all completed Batch 005 work that is correct. Start from the exact defective HEAD above and make only the bounded corrections required to close the findings below plus directly coupled regression defects discovered while proving the fixes.

Artifact-only. No push, no merge, no remote mutation, no branch publication authority.

## HARD LAWS

- `NO VALID TRADER LAB PROMOTION EVIDENCE -> NO DEMO_ELIGIBLE -> NO DEMO ADMISSION`.
- Every VT-01..VT-31 qualifies individually. No inherited qualification.
- `DEMO_ELIGIBLE != PROFITABLE != EXECUTION AUTHORITY != PRODUCTION READY`.
- Risk review, CIBO review, independent validation and economic evidence may not be bypassed or type-laundered.
- Exact candidate/version/config/strategy binding must survive all trust-boundary re-entry and reflective corruption attempts.
- Evidence provenance must be decision-relevant, recursively revalidated and content-bound where in-repo evidence is available.
- No fake evidence, no arbitrary caller-supplied digest treated as authoritative proof.
- Fast-forward must not introduce lookahead/future knowledge.
- Monte Carlo must not introduce hidden/global RNG, seed hunting or retry-to-pass.
- No provider-native order path, Risk bypass, Production authority or real-capital authority.
- No test weakening, skip/xfail laundering, type-ignore hiding, linter silencing or coverage gaming.

## MATERIAL FINDINGS — MUST CLOSE

### F1 — Stage evidence provenance is decorative / kind laundering / fabricated digests

Observed defect: all mandatory stages can be supplied with semantically wrong `TraderLabEvidenceKind` and fabricated digests and still reach `DEMO_ELIGIBLE`.

Required correction:
- Establish an explicit fail-closed stage -> allowed evidence-kind contract for every mandatory stage.
- Ensure the evidence kind is checked both on construction and trust-boundary revalidation.
- For in-repo evidence helpers, recompute/derive content identity from the referenced canonical object rather than trusting arbitrary caller-provided digests.
- Where a stage depends on external evidence that cannot be content-verified inside Trader Lab, model that seam explicitly as non-self-authenticating evidence and prevent the Lab from treating an arbitrary digest as independent proof.
- Do not invent missing financial semantics merely to fill the stage-kind matrix. Add precise evidence kinds only where needed and document their meaning.

Acceptance witnesses must prove:
1. wrong-kind evidence for each mandatory stage is rejected;
2. fabricated digest/reference cannot launder an in-repo evidence object;
3. a fully fabricated nine-stage chain cannot reach `DEMO_ELIGIBLE`;
4. valid canonical evidence still qualifies.

### F2 — Cross-candidate evidence reuse / inherited qualification

Observed defect: candidate B can reuse candidate A's real frozen-OOS/derived robustness evidence because reference-level strategy binding is not checked.

Required correction:
- Bind reference helpers and stage evidence to the exact candidate strategy binding/config identity wherever the referenced object exposes that lineage.
- Revalidate nested reference lineage at lifecycle trust boundaries.
- Extend this through frozen OOS -> robustness frame -> bootstrap distribution -> robustness envelope lineage.

Acceptance witnesses must prove:
1. A evidence cannot qualify B;
2. same candidate exact binding remains valid;
3. config/version/binding mutation invalidates the evidence chain;
4. no cohort or Trader-family inheritance is possible.

### F3 — Economic evidence prerequisite bypassable / kind unvalidated

Observed defect: `require_economic_evidence=False` can bypass the prerequisite, and an arbitrary evidence kind can satisfy the presence check.

Required correction:
- Remove or otherwise eliminate the bypass semantics from the eligibility gate.
- Economic evidence is mandatory for the final eligibility decision under the current Trader Lab contract.
- Require the exact semantic economic-evaluation evidence kind/type expected by the gate.
- Revalidate it at trust boundary; a risk/replay/CIBO reference must not masquerade as economic evidence.

Acceptance witnesses must prove:
1. missing economic evidence => fail closed;
2. wrong-kind evidence => fail closed;
3. caller cannot disable the requirement;
4. valid economic evidence proceeds without granting profitability or execution authority.

### F4 — Shallow trust-boundary revalidation / reflective corruption accepted

Observed defect: lifecycle revalidation checks chain shape but does not recursively recompute candidate/stage fingerprints and nested invariants. Post-construction corruption can still reach `DEMO_ELIGIBLE`; malformed timestamps can leak raw exceptions instead of typed `Failure`.

Required correction:
- Recompute exact candidate fingerprint at lifecycle validation boundaries.
- Recompute each stage evidence fingerprint and qualification invariant from retained nested material.
- Revalidate timestamps/types before comparisons so malformed state fails through the typed Result/error contract, never raw `TypeError`.
- Reassert stage ordering, candidate binding, evidence kind, nested provenance and terminal decision timing.

Acceptance witnesses must prove corruption of each of these fails closed:
- candidate strategy binding;
- candidate/config fingerprint;
- stage identity;
- source evidence reference;
- evidence fingerprint/digest;
- produced/certified/decided timestamps;
- qualification chain order/duplicates;
- terminal lifecycle state.

## COUPLED MINOR FINDINGS — INSPECT AND CLOSE WHEN SAFE IN THIS SAME BOUNDED PASS

Expert also recorded these adjacent defects. Do not ignore them. Close them when the fix is local and semantically certain; otherwise write a durable explicit deferred finding with exact reason, evidence and next action.

- F5 Monte Carlo thresholds frozen but not evaluated.
- F6 fast-forward pacing only aggregate; degenerate pacing can qualify.
- F7 reference digests are partial projections omitting decision-relevant fields.
- F8 REPLAY vs FAST_FORWARD reference identities use incompatible schemas, allowing inconsistent histories.
- F9 no-lookahead helper/documentation overclaims a proof that is already provided by canonical visibility filtering.
- F10 MC `INSUFFICIENT_SAMPLE` branch lacks direct test.
- F11 `availability_instants` excluded from fast-forward fingerprint.
- F12 direct terminal construction can accept `decided_at` predating last qualification.
- F13 Decimal canonicalization is scale-sensitive where semantic equality may require canonical equality; do not change unless the contract clearly requires it.
- F14 terminal timestamp logical representation is not UTC-normalized; token/sensitive screening asymmetry noted.
- F15/F16 supplementary ordering/fingerprint vs logical-values ordering inconsistency.
- F17 adversarial-test gaps / mirror tests.
- F18 experiment fingerprint function accepts `bool` for exact-int metadata.

Priority order: F1-F4 are mandatory and gate the candidate. F5-F18 must not distract from correct closure of F1-F4.

## SIX-LANE EXECUTION

### Lane 1 — Provenance + evidence-kind contract
Own F1 and coupled F7/F8. Use semantic LSP to trace `TraderLabEvidenceKind`, `TraderLabStage`, `TraderLabEvidenceReference`, stage evidence constructors, lifecycle consumers and promotion gate. Produce stage-kind matrix and canonical content-binding rules.

### Lane 2 — Exact candidate lineage
Own F2. Trace `ResearchRunStrategyBinding`, frozen OOS, robustness frame, bootstrap distribution, robustness envelope and all reference helper call sites. Prevent cross-candidate reuse without duplicating existing research authorities.

### Lane 3 — Final eligibility economic gate
Own F3 and verify Risk/CIBO/independent-validation semantics remain distinct. No opt-out path. No wrong-kind laundering. Preserve `DEMO_ELIGIBLE != PROFITABILITY_PROOF`.

### Lane 4 — Recursive trust-boundary revalidation
Own F4 plus F12/F18 where coupled. Recompute fingerprints and nested invariants; typed fail-closed behavior for malformed retained state.

### Lane 5 — Robustness / fast-forward coupled correctness
Inspect F5/F6/F9/F10/F11/F13/F14/F15/F16. Implement only semantically justified bounded fixes; record any deferred item precisely. No duplicate replay engine, no hidden RNG, no new market-time authority.

### Lane 6 — Adversarial regression + docs + integration audit
Add normal and adversarial tests that PROVE the fixes rather than mirror implementation. Update `QORE-TRADER-LAB-001.md` to remove overclaims and document exact fail-closed semantics. Run focused tests, then FULL QG.

## MANDATORY SEMANTIC LSP

Use semantic LSP before and after stabilization on material symbols. At minimum collect durable evidence for:
- `TraderLabCandidateBinding`
- `TraderLabStageEvidenceRecord`
- `TraderLabEvidenceReference`
- `TraderLabEvidenceKind`
- lifecycle validation/apply functions
- `evaluate_demo_eligibility`
- `ResearchRunStrategyBinding`
- `ResearchFrozenOosEvidence`
- robustness frame/distribution/envelope types

Required operations where meaningful: `hover`, `findReferences`, `goToDefinition`, `goToImplementation`.
Grep-only analysis is not acceptable.

## DURABLE MEMORY / INTERRUPTION RESILIENCE

Do not restart completed lanes after interruption. Append durable checkpoints throughout execution. Each checkpoint must state:
- PHASE
- FINDINGS
- DECISIONS
- EVIDENCE
- LSP EVIDENCE
- UNCERTAINTIES
- LANES COMPLETED
- LANES PENDING
- CHANGES MADE
- TESTS RUN / RESULTS
- WHAT IS CLOSED
- WHAT REMAINS
- EXACT RESUME LOCATION
- PENDING NEXT ACTION
- SAFE RESUME INSTRUCTION

Final report must include literal, unformatted marker:

## RESUME STATE
COMPLETE

No backticks around COMPLETE and no alternate formatting.

## QUALITY GATE

Focused adversarial tests first, then canonical FULL QORE gate:

`ruff check .`
`mypy src tests`
`pytest --cov=src/qore --cov-report=term-missing`

No weakening. Any failure must be diagnosed and fixed inside this artifact workspace if caused by the correction.

## OUTPUT / ARTIFACT CONTRACT

Artifact-only candidate. Report:
- exact start SHA/tree;
- exact changed files and diff stats;
- exact findings closed/deferred;
- adversarial witness matrix for F1-F4;
- semantic LSP evidence;
- focused test results;
- FULL QG results;
- remaining uncertainty;
- candidate-ready verdict.

Do not claim CLEAN merely because tests pass. Candidate-ready requires F1-F4 demonstrably closed and no new material defect discovered.

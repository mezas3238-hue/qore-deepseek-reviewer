# QORE TRADER LAB — IA RESIDUAL CORRECTION 002

## Purpose

Continue from the exact successful Harness resume candidate for PR #481 and close residual material defects found by independent Integration Authority adjudication BEFORE any fresh DeepSeek Expert review.

THIS IS NOT A RESTART.

Do not repeat Batch 005 or Correction-001/Resume-001 research. Restore the exact completed Resume-001 patch first, then investigate and implement only the bounded residuals below.

## Immutable qore-core input

- PR: #481
- START / rejected pre-correction HEAD: `5d25445faf57fa83410b57faf5eaf1f437949129`
- TREE: `f9df989d7e7120d8742d4001b045fdd11cb0cb03`
- base reference: `9672c4d999bd5d3e6db544f349243bc6abea0363`

## Mandatory carry-forward artifact

Successful predecessor:
- package: `HARNESS-ENGINEER-QORE-TRADER-LAB-001-CORRECTION-001-RESUME-001`
- run: `33700519027`
- job: `100478604202`
- artifact: `9874339281`
- artifact digest: `sha256:ee4580bf44f85fe6720873341e5584db42aec7728cceace5a11a4b0a57f42b86`
- final candidate patch SHA256: `c8faf991bcb0c8c34dce2fd0692ed2b14cfe4139be599e12db16b8bb63727a31`
- final candidate: 11 files, +1126/-94, external FULL QG 4918 passed, mypy 752 files, ruff PASS.

Durable exact patch archive in reviewer checkout:
`harness/engineer/recovery/qore-trader-lab-001-correction-resume001-final.patch.gz.b64`

From qore-core workspace restore it with:
`base64 -d ../../harness/engineer/recovery/qore-trader-lab-001-correction-resume001-final.patch.gz.b64 | gzip -dc > /tmp/qore-trader-lab-resume001-final.patch`

MANDATORY:
1. verify qore-core HEAD/TREE exactly equal START/TREE;
2. verify `sha256sum /tmp/qore-trader-lab-resume001-final.patch` == `c8faf991bcb0c8c34dce2fd0692ed2b14cfe4139be599e12db16b8bb63727a31`;
3. `git apply --check` then `git apply`;
4. confirm restored diff exactly 11 files +1126/-94 BEFORE continuation edits;
5. do not reconstruct or rewrite already-closed F1-F4 work except where this IA residual correction requires a narrowly coupled repair.

## Why Expert is blocked

The successful Harness candidate is NOT yet admissible for Expert. Independent IA found residual semantic bypasses against Issue #473's mandatory governed promotion path.

### IA-R1 — External governance/economic references remain fabricatable — MATERIAL

Current Resume-001 deliberately treats Risk/CIBO/economic/independent-validation kinds as non-self-authenticating opaque references. Tests construct `RISK_REVIEW`, `CIBO_REVIEW`, and `INDEPENDENT_VALIDATION` happy-path references from arbitrary UUID + `"1" * 64` digest. A typed label and arbitrary digest must not by itself satisfy a mandatory governed gate.

Required closure:
- use semantic LSP/repo search to find existing QORE authoritative Risk/CIBO/economic/independent-validation evidence contracts and reuse them when present;
- bind every gate evidence to the exact Trader candidate/version and the actual governed outcome/decision/authority identity/time/provenance required by the existing contract;
- if an authoritative producer/registry does not yet exist, expose an explicit fail-closed `EVIDENCE_DEPENDENT_SEAM`/verified-evidence contract: arbitrary opaque caller references MUST NOT advance the lifecycle or `DEMO_ELIGIBLE`;
- `ECONOMIC_EVALUATION` kind-only presence is insufficient; candidate-binding/provenance must be explicit and revalidated;
- Risk/CIBO/Independent must remain distinct gates and cannot be manufactured by Trader Lab itself.

Required witness: attempt to build a complete chain with arbitrary UUID/digest external references must NOT reach `DEMO_ELIGIBLE`.

### IA-R2 — RESEARCH/STRESS stage semantics are incorrect/incomplete — MATERIAL

Resume-001 maps `RESEARCH -> FROZEN_OOS`. That allows OOS evidence to stand in for the earlier Research/Methodology-Freeze stage and creates a hindsight/provenance laundering surface. Original Expert specifically noted missing RESEARCH/STRESS evidence kinds; predecessor synthesis proposed `RESEARCH_STRATEGY_BINDING` and `STRESS_EVIDENCE` but Resume-001 did not implement them.

Required closure:
- RESEARCH must bind exact methodology/strategy freeze/binding evidence available before validation outcome inspection, preferably directly from existing `ResearchRunStrategyBinding`/manifest semantics;
- do not use FROZEN_OOS as RESEARCH evidence;
- STRESS must be semantically distinct from MONTE_CARLO. Reuse existing stress/adversarial evidence if present; otherwise define a typed, evidence-dependent stress seam that cannot be confused with resampling-envelope MC evidence;
- stage evidence temporal/provenance semantics must prevent later evidence from being back-dated into an earlier stage;
- add stage-specific adversarial tests.

### IA-R3 — Monte Carlo thresholds are frozen but inert — MATERIAL

`TraderLabThreshold` is described as an acceptance threshold and Issue #473 requires experiment thresholds to be frozen before promotion outcome. But `_derive_monte_carlo_status` ignores `registration.thresholds`; `QUALIFIED` currently depends only on sample/dependence diagnostics.

Required closure:
- do NOT invent profitability semantics or metrics;
- inspect existing `ResearchBlockBootstrapDistribution` / `ResearchResamplingEnvelope` / economic evidence and define only supported, deterministic threshold metrics;
- every registered acceptance threshold that participates in a qualification must actually be evaluated against authoritative evidence;
- unsupported/unavailable threshold metric -> `INSUFFICIENT_EVIDENCE` / non-qualified, never ignored;
- threshold mutation after outcome remains new experiment identity;
- explicit empty-threshold semantics: either prohibit empty thresholds for a `QUALIFIED` promotion gate or prove/document why an evidence-backed qualification can be valid without them; fail closed on ambiguity;
- test favorable, unfavorable, missing metric, unsupported metric, and threshold mutation cases.

### IA-R4 — Nested trust-boundary revalidation / StrEnum laundering — MATERIAL until falsified

The Expert R1 observed `StrEnum` value-equality with raw strings. Resume-001 revalidates `TraderLabStageEvidenceRecord` but does not clearly re-run every invariant of nested `TraderLabEvidenceReference` before relying on `kind in allowed_kinds`.

Required closure:
- create/use explicit `validate_trader_lab_evidence_reference` trust-boundary validation;
- enforce exact enum runtime type, UUID, digest type/value, schema token, exact bool, strategy-binding fingerprint, self-authenticating semantics;
- recursively validate source + supplementary references before stage-kind membership/fingerprint decisions;
- raw-string value-equal enum laundering must fail closed with `TraderLabValidationError`;
- reflective mutation + recomputed outer fingerprint must still fail closed.

### IA-R5 — Canonicalization consistency from prior F13/F15/F16 — close now if local/safe

- semantically equivalent Decimal thresholds (`1.0` vs `1.00`) should not accidentally create conflicting semantic identity unless representation-sensitive identity is explicitly justified and documented;
- threshold ordering must be consistent between fingerprint and `logical_values`;
- supplementary evidence ordering must have explicit semantics: canonical unordered set OR ordered contractual tuple. Do not leave identity behavior accidental;
- use safe Decimal canonicalization that does not allocate pathological exponent-sized strings.

If any sub-item truly cannot be changed without broad contract breakage, document exact evidence, risk, and a specific follow-up. Do not silently defer.

## Six targeted lanes

1. **Authoritative external gate evidence** — IA-R1; repo/LSP search Risk/CIBO/economic/independent contracts; fail-closed composition.
2. **Research + Stress provenance** — IA-R2; stage-kind contract and temporal/hindsight falsification.
3. **Monte Carlo acceptance semantics** — IA-R3; thresholds, supported metrics, insufficient evidence.
4. **Recursive trust-boundary hardening** — IA-R4; exact runtime types/StrEnum/reflection/adversarial.
5. **Canonical identity consistency** — IA-R5 plus remaining F13/F15/F16 and any coupled F14 token/sensitive-screening inconsistency found locally.
6. **Cross-interaction / integration / docs / tests** — complete fabricated-chain witness, threshold witness matrix, no-lookahead, candidate lineage, FULL QG.

Use semantic LSP before and after stabilization: hover/findReferences/goToDefinition/goToImplementation for material Trader Lab and reused evidence contracts. Grep-only is insufficient.

## Hard laws

- `NO VALID TRADER LAB PROMOTION EVIDENCE -> NO DEMO_ELIGIBLE -> NO DEMO ADMISSION`.
- Every Trader qualifies individually; no inherited qualification.
- `MONTE_CARLO_PASS != PROFITABILITY_PROOF`.
- no hidden RNG, retry-to-pass, seed hunting, hidden clock, scheduler, thread, provider execution or Production authority.
- no fabricated Risk/CIBO/economic/independent evidence merely to make unit tests pass.
- external missing evidence must fail closed, not be mocked into semantic authority.
- do not weaken tests or docs to redefine the issue away.

## Required completion evidence

- exact START/TREE binding;
- exact restoration patch SHA and initial 11-file +1126/-94 stat;
- six new residual lanes complete (do NOT claim predecessor lanes re-executed);
- IA-R1..R4 each CLOSED with direct adversarial witness;
- IA-R5 disposition per sub-item;
- fabricated external-reference full-chain cannot reach DEMO_ELIGIBLE;
- later OOS evidence cannot satisfy/back-date RESEARCH;
- Stress and MC cannot be type-launched into each other;
- MC registered thresholds affect qualification or fail insufficient when not evaluable;
- raw-string/reflective nested reference corruption fails typed/closed;
- focused Trader Lab tests;
- `ruff check .`;
- `mypy src tests`;
- `pytest --cov=src/qore --cov-report=term-missing`;
- final diff/path/budget audit;
- literal final marker:

## RESUME STATE
COMPLETE

and `CANDIDATE_READY_FOR_EXTERNAL_QG` only if all MATERIAL residuals are actually closed.

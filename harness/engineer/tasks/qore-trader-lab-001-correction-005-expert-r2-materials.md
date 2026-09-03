# QORE Trader Lab Correction-005 — Expert R2 material findings only

## Immutable predecessor
- qore-core PR #481 current HEAD: `ba8c1e3c05e06c69b2bc39b3c3fdf6e3c4f50449`
- TREE: `7649fa454fef4c9d50c48521230eb46b41e3e78f`
- DeepSeek Expert R2 run: `33766652890`
- Expert package: `QORE-PR481-TRADER-LAB-CORRECTION004-DS-EXPERT-R2-001`
- Verdict: `VALIDACIÓN NO OK`

Do not redo Trader Lab, Correction-004, or already-closed R1 findings. Correct only the two independently reproducible MATERIAL root families below, plus adversarial tests necessary to prove closure.

## F-MAT-001 — subclass laundering of trusted lifecycle/binding objects
Expert reproduced:
- subclass of `TraderLabLifecycle` overrides `state` / `completed_stages` and reaches `DEMO_ELIGIBLE` with zero qualifications / blocked terminal state;
- subclass of `TraderLabCandidateBinding` with lying equality launders another candidate's evidence into the target lifecycle.

Required closure:
- trust/identity boundaries use exact runtime type where required (`type(x) is T`, not permissive `isinstance`);
- promotion/validation derives state and completed-stage semantics from recursively revalidated retained field material, not overridable properties or caller-defined equality;
- exact candidate identity/config/version/fingerprint binding cannot be laundered by subclass, reflective corruption, copied object or lying equality;
- Result boundaries fail closed without raw exception leakage.

Mandatory adversarial witnesses include lifecycle subclass property override, binding subclass `__eq__`, nested field subclass/reflective corruption, REJECTED/zero-stage lifecycle and honest benign controls.

## F-MAT-002 — importable production mint factories self-authorize governed/economic references
Expert reproduced direct import/use of `_make_external_authenticated_reference` and `_make_self_authenticating_reference` to create qualifying governed/economic references without external authority issuance.

Hard law:
`PRIVATE PYTHON NAME != AUTHORITY ROOT`
`IMPORTABLE LOCAL FACTORY != EXTERNAL AUTHORITY ISSUANCE`
`CALLER DIGEST != AUTHENTIC GOVERNED EVIDENCE`

Required closure:
- no production callable path may turn caller assertions/digests into qualifying external Risk/CIBO/Independent-Validation authority evidence;
- external governed references must be derivable only from recursively revalidated, authority-kind/gate/candidate/evidence/time-bound proof material emitted by the owning external authority seam;
- if the real authority issuer/verifier is absent, remain explicit `EXTERNAL_EVIDENCE_DEPENDENT`; do not invent a local substitute;
- self-authenticating/internal references must derive their digest from the canonical source object, never accept an arbitrary caller digest as authenticity;
- exhaust neighboring constructors/builders/factories/re-entry paths.

Mandatory adversarial witnesses: direct helper import/call, copied/reconstructed proof/reference, wrong authority kind, wrong gate, candidate swap, evidence fingerprint swap, stale/future time, economic wrong-kind, missing authority and reflective mutation.

## Preserve
- R1-F3 exact economic-kind requirement already closed;
- deep retained-material revalidation already substantially closed;
- deterministic replay/fast-forward/Monte Carlo semantics;
- no hidden clock/RNG/retry/sleep/thread/network semantic effect;
- no provider execution, Risk bypass, Production or real-capital authority.

## Quality gate
Use semantic LSP materially before/after. Add normal + adversarial tests. Run:
- `ruff check .`
- `mypy src tests`
- `pytest --cov=src/qore --cov-report=term-missing`
- `git diff --check`

Candidate must remain within the bounded Trader Lab paths supplied by the request. Write durable six-lane checkpoints. Finish only when both MATERIAL root families are falsified closed or explicitly report a blocker; never declare CLEAN from self-report alone.

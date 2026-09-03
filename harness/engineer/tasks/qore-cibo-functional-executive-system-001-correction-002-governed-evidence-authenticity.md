# QORE CIBO FUNCTIONS — CORRECTION 002 — GOVERNED EVIDENCE AUTHENTICITY

## Continuity law

This is a continuation of the completed engineering candidate recovered from run `33710133720` / artifact `9878192584`. **DO NOT restart Batch 007, do not rerun completed six-lane discovery, and do not reconstruct the candidate by hand.**

## Immutable qore-core binding

- START: `576803fbda76970a4bbfe2287b5f9ca101d0f6c3`
- TREE: `11f35844670551ac4ab5be322272a3221e6b1c4b`
- Parent program: qore-core #483

Verify exact START/TREE and clean workspace first.

## Mandatory exact candidate recovery

Concatenate, in this exact order, from the reviewer checkout:

1. `harness/engineer/recovery/qore-cibo-functions-correction002-base.patch.bz2.b64.part00`
2. `harness/engineer/recovery/qore-cibo-functions-correction002-base.patch.bz2.b64.part01`
3. `harness/engineer/recovery/qore-cibo-functions-correction002-base.patch.bz2.b64.part02`
4. `harness/engineer/recovery/qore-cibo-functions-correction002-base.patch.bz2.b64.part03`
5. `harness/engineer/recovery/qore-cibo-functions-correction002-base.patch.bz2.b64.part04`
6. `harness/engineer/recovery/qore-cibo-functions-correction002-base.patch.bz2.b64.part05`

Base64-decode the concatenation, bzip2-decompress it, and verify the resulting patch SHA-256 is exactly:

`f68aeeb61e90bc6311e12daa72a9efd66050aed49f096a68ab1065b10fdb443f`

Then run `git apply --check` and `git apply`. Any mismatch -> fail closed. This candidate already contains all completed Batch007 + Correction001 work, including the embedded Trader Manager predecessor. Preserve it.

Recovered candidate evidence:
- 44 files;
- `+10496/-43`;
- six lanes COMPLETE;
- prior internal QG: ruff PASS; mypy 784 files PASS; pytest 5182 PASS; `git diff --check` clean.

The previous workflow `failure` was a terminal-marker wrapper defect after engineering completion, not permission to repeat the batch.

## Independent IA findings to close — only this residual family

### IA-FUNC-R1 — governed evidence can still be self-declared — MATERIAL
`CiboGovernedEvidenceMaterial` or equivalent material can be constructed from caller-supplied kind/UUID/timestamp data. A UUID, enum label, digest, or typed record is **not proof that Risk, Market Intelligence, Economic Intelligence, Trader Lab, or another governed authority actually emitted/attested it**.

Required closure:
- no arbitrary caller-created evidence object may unlock stronger CIBO functional output merely because fields are well typed;
- bind qualifying evidence to an actual authoritative producer/attestation contract already present in QORE where one exists;
- where no authoritative producer exists yet, expose an explicit fail-closed external-evidence-dependent seam/status rather than manufacturing authenticity inside CIBO Functions;
- CIBO must never become its own Risk/Lab/market/economic certification authority.

### IA-FUNC-R2 — exact runtime trust boundaries — MATERIAL until closed/falsified
Audit all authority-bearing/new CIBO Functions trust boundaries that currently use permissive `isinstance` checks for UUID, datetime, StrEnum/enum, bool/int, or retained nested material. Enforce the project law where applicable: exact runtime types, `bool != int`, no subclass or StrEnum/string laundering, recursive revalidation before consumption.

Do not mechanically replace harmless non-trust-boundary checks; make the change semantically precise and test adversarial witnesses.

### IA-FUNC-R3 — temporal provenance ordering
For governed evidence consumed at assessment/synthesis/decision time, prove the evidence timestamp cannot be from the future relative to the consuming `as_of`/assessment point and cannot silently become valid after the decision. If the current contract already proves this universally, document the proof and add/retain an adversarial witness rather than changing semantics unnecessarily.

## Hard laws

- `TYPED EVIDENCE != AUTHENTIC GOVERNED EVIDENCE`.
- `CIBO OPINION/RECOMMENDATION != RISK OR EXECUTION AUTHORITY`.
- no direct provider-native execution or Production/real-capital authority.
- uncertainty or missing authoritative evidence -> fail closed / insufficient evidence.
- preserve deterministic semantics, immutable evidence, canonical ordering, recursive revalidation and no hidden wall clock/RNG/retry/sleep.
- preserve all prior closed CF-01..CF-20 behavior unless a change is strictly required to close the findings above.

## Required engineering discipline

Use semantic LSP before changing ownership-sensitive symbols and after stabilization. Add normal + adversarial tests demonstrating:
- fake typed authority material cannot self-certify;
- mismatched/stale/future evidence fails closed;
- UUID/datetime/enum subclasses and raw-string value-equal enum laundering fail where the trust contract requires exact type;
- nested reflective corruption fails closed;
- valid authoritative evidence path, when available, remains deterministic and provider neutral.

Maintain durable checkpoints, but all six predecessor lanes are inherited COMPLETE: **do not relaunch them**. Use them as evidence and perform only bounded correction/synthesis/QG.

## Quality gate

Run:
- `ruff check .`
- `mypy src tests`
- `pytest --cov=src/qore --cov-report=term-missing`
- `git diff --check`

No weakening, skips/xfail to hide defects, `type: ignore` concealment, lint suppression, coverage gaming, or semantic relaxation.

## Final output

Report exact closure matrix for IA-FUNC-R1..R3, changed files/diff stats, LSP evidence, adversarial tests, FULL QG, any genuine external-evidence-dependent seam, and literal terminal markers:

## RESUME STATE
COMPLETE

CANDIDATE_READY_FOR_EXTERNAL_QG

Do not dispatch Expert/Coder. Next gate is independent IA.
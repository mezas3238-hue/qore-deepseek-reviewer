# QORE CIBO Functional Executive System — Correction 003: Authority-Root Attestation

## Continuity / recovery law

This is a bounded continuation, NOT a restart.

Restore the exact completed Correction-002 candidate from the host-provided recovery artifact before any engineering. Preserve all valid work. Do not rebuild CF-01..CF-20 or repeat completed prior corrections.

Exact immutable predecessor binding:
- START: `576803fbda76970a4bbfe2287b5f9ca101d0f6c3`
- TREE: `11f35844670551ac4ab5be322272a3221e6b1c4b`
- recovered candidate patch SHA256: `90ec0e0f74134291be3baa178450107497795d94296e9c84bfd03bc5eb41d9a9`

## Independent IA residual — IA-FUNC-R1B

Correction-002 correctly removed caller-supplied UUID/timestamp self-declaration, added exact runtime types and temporal ordering, but its authenticity root is still insufficient.

`CiboGovernedEvidenceMaterial` currently treats a well-typed producer record such as `FunctionalDecision`, qualified market observations/specifications, or research economic results as an authoritative attestation. At least `FunctionalDecision` is a public dataclass whose constructor can be called directly by any caller, and `DecisionType("risk.*")` is also publicly constructible. Therefore a caller can synthesize a resolved `risk.*` decision and present it as if it were authority-issued. A typed record is not, by itself, provenance that the owning authority emitted it.

Canonical law:

`PUBLICLY CONSTRUCTIBLE RECORD != AUTHORITY-ROOTED ATTESTATION`

`TYPE VALIDITY != PROVENANCE AUTHENTICITY`

`CIBO FUNCTIONS != RISK / MARKET / ECONOMIC / LAB CERTIFICATION AUTHORITY`

`NO AUTHORITY ROOT -> EVIDENCE_DEPENDENT / FAIL CLOSED`

Do not solve this with Python naming privacy, a caller-supplied Protocol/verifier, a private helper callable by arbitrary code, or a hidden boolean/token embedded in an otherwise publicly mintable dataclass. Those are not authority roots.

## Required result

Find and reuse an existing QORE owning-authority issuance / governed-evidence / verifier boundary if one actually establishes provenance. If no such authority-rooted boundary exists for a kind, CIBO Functions MUST keep that kind explicitly external-evidence-dependent and MUST NOT let a caller manufacture `SUFFICIENT` governed evidence for it.

No new operational or execution authority. No provider-specific authority. No Production or real-capital authority.

## Six-lane execution

### Lane 1 — authority-root inventory
Use LSP/reference analysis to identify the actual construction/issuance paths for the candidate Risk, Market, Economic and Lab producer records. Prove which are public value records versus authority-rooted receipts. Record the result in checkpoints. Do not assume class names imply provenance.

### Lane 2 — governed evidence trust-root redesign
Make `CiboGovernedEvidenceMaterial`/functional evidence accept only evidence whose provenance is rooted at an owning authority boundary. Remove any route where direct construction of a public producer dataclass can confer sufficiency. Where no real trust root exists, preserve an explicit fail-closed dependency seam.

### Lane 3 — Risk adversarial closure
Demonstrate that directly constructing a syntactically valid resolved `risk.*` `FunctionalDecision` cannot create governed Risk sufficiency. Also reject subclass laundering, reflective corruption, wrong authority/scope/version, and future evidence.

### Lane 4 — Market/Economic/Lab adversarial closure
Apply the same provenance test to market/economic candidate records. A public record constructor is not an authority issuer. Bind only to a genuine existing authority-rooted receipt if repository evidence supports one; otherwise fail closed. LAB remains dependent unless a real LAB authority-root exists.

### Lane 5 — recursive/exact-type/temporal regression
Preserve Correction-002 exact-runtime-type hardening and temporal provenance laws. Revalidate nested material recursively. Ensure `certified_at <= as_of/assessed_at` and no subclass/bool/string laundering at trust-bearing boundaries. Add focused adversarial tests for every corrected seam.

### Lane 6 — docs + integrated audit
Update `QORE-CIBO-FUNCTIONAL-EXECUTIVE-SYSTEM-001.md` with the actual authority-root semantics and explicit dependent seams. Audit the whole recovered diff for accidental authority increase, provider coupling, hidden nondeterminism, secrets, mutable globals, or execution authority. Run focused tests; host will run FULL QG.

## Acceptance criteria

- Exact recovered candidate is inherited, not recreated.
- Direct caller construction of a public producer record cannot manufacture governed sufficiency.
- No caller-supplied verifier/Protocol becomes a trust root.
- No private naming convention/helper becomes a trust root.
- Exact runtime types and recursive revalidation remain enforced.
- Future evidence fails closed.
- Unsupported authority kinds remain explicit `EVIDENCE_DEPENDENT`/insufficient rather than inferred PASS.
- No CIBO promotion/execution/Risk bypass/Production/real-capital authority is introduced.
- Focused adversarial tests pass.
- Six durable lane checkpoints are written; final output must state `COMPLETE` only when all six lanes are complete.

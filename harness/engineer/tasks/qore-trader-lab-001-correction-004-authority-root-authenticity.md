# QORE Trader Lab — Correction 004 / Authority-Root Authenticity

Package: `HARNESS-ENGINEER-QORE-TRADER-LAB-001-CORRECTION-004-AUTHORITY-ROOT-AUTHENTICITY`
Roadmap authority: #303 -> #473, with economic DEMO priority #469.

## CONTINUITY — DO NOT RESTART

Trader Lab Correction-003 finished its engineering candidate and external FULL QG. This package MUST restore that exact candidate and modify only the IA residual below.

Immutable qore-core binding:
- START `5d25445faf57fa83410b57faf5eaf1f437949129`
- TREE `f9df989d7e7120d8742d4001b045fdd11cb0cb03`

Certified predecessor patch SHA-256:
`4b739155bf50e70b7c2bdac6f7ae386a661fef9a32edc2e0dd454185be7a5354`

Restore exactly:
```bash
cat ../../harness/engineer/recovery/qore-trader-lab-correction003.patch.bz2.b64.part* \
  | base64 -d | bzip2 -dc > /tmp/qore-trader-lab-correction003.patch
printf '%s  %s\n' '4b739155bf50e70b7c2bdac6f7ae386a661fef9a32edc2e0dd454185be7a5354' /tmp/qore-trader-lab-correction003.patch | sha256sum -c -
git apply --check /tmp/qore-trader-lab-correction003.patch
git apply /tmp/qore-trader-lab-correction003.patch
```
Fail closed on any hash/apply mismatch. Never reconstruct the predecessor manually and never repeat its completed work.

## IA RESIDUAL TO CLOSE

Independent IA found that Correction-003 can still treat a private helper and/or a caller-supplied object satisfying a `Protocol` as sufficient basis to transform local data into qualifying governed approval evidence.

Hard laws for this correction:
- `CALLER-SUPPLIED VERIFIER != AUTHORITY ROOT`
- `PRIVATE PYTHON NAME != CAPABILITY SECURITY`
- `TYPED APPROVED OBJECT != AUTHENTIC GOVERNED APPROVAL`
- `TRADER LAB != RISK/CIBO/INDEPENDENT VALIDATION AUTHORITY`

Trader Lab must be unable to mint, forge, upgrade, or self-attest evidence that unlocks a governed gate merely by supplying identifiers, digests, labels, structurally compatible protocol objects, dynamic proxies, subclasses, or copied fields.

## REQUIRED SEMANTICS

Design the smallest provider-neutral boundary that makes governed evidence externally issued and non-self-mintable from Trader Lab semantics. Reuse existing QORE governance/authority primitives where they provide a real trust boundary. Do NOT invent fake cryptographic security or provider-specific infrastructure.

Required properties:
- Trader Lab consumes/verifies externally issued governed evidence; it does not manufacture the authority decision it is proving.
- If authenticity/provenance cannot be established by a governed authority boundary, fail closed.
- Exact runtime types at trust boundaries; no subclass laundering and `bool != int`.
- Bind evidence to the exact authority kind, trader identity, trader version, experiment/run/candidate identity, policy/gate identity, decision, evidence digest/reference, and relevant timestamps.
- Enforce temporal ordering/freshness where the existing contract requires it; stale, future, replayed or mismatched evidence must not qualify.
- Direct constructors and public builders must enforce equivalent invariants; no constructor bypass.
- Preserve deterministic canonicalization and sanitized evidence; no secrets.
- No Risk/CIBO authority implementation inside Trader Lab.
- No execution, provider-native, Production or real-capital authority.

## ADVERSARIAL TEST MATRIX

At minimum prove fail-closed behavior for:
1. caller-provided fake `Protocol` implementation returning APPROVED;
2. duck-typed/dynamic proxy verifier;
3. subclass laundering at evidence/receipt boundaries;
4. locally forged receipt/attestation;
5. copied authority id/name/digest fields without authentic issuance;
6. issuer/authority-kind mismatch;
7. trader/version/experiment/candidate/policy mismatch;
8. stale/future/replayed evidence where relevant;
9. direct-constructor bypass;
10. mutation/alias attempts against nested evidence.

Also preserve happy-path tests demonstrating authentic externally issued evidence can qualify without granting Trader Lab authority itself.

## SIX CORRECTION LANES

The six lanes are for this residual only, not a new Trader Lab build:
1. trust-root/provenance contract audit;
2. authority-evidence model and exact types;
3. gate verification/fail-closed path;
4. constructor/builder/recursive revalidation;
5. adversarial replay/forgery/mismatch testing;
6. integration/root-family exhaustion + documentation + LSP-after.

## REQUIRED VALIDATION

- Semantic LSP before/after on touched boundaries.
- Focused Trader Lab tests including the adversarial matrix.
- `ruff check .`
- `mypy src tests`
- `pytest --cov=src/qore --cov-report=term-missing`
- `git diff --check`
- Final root-family audit proving no qualifying gate can be unlocked by self-attested or caller-minted approval evidence.

Artifact-only completion for IA adjudication. Do not dispatch external reviewers from Harness.
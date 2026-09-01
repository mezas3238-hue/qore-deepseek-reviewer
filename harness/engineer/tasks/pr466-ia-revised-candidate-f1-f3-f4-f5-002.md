# PR #466 — Integration Authority revised candidate after broad Principal Engineer run

## Mission

Produce a bounded revised artifact-only candidate for qore-core PR #466 from the exact unchanged start below. This is NOT a new broad discovery mission and MUST NOT repeat the prior full audit. It is a precise Integration Authority correction of the already completed broad run.

Expected qore-core start HEAD: `5205b663579e35a711446da03a483c57ea786476`
Expected tree: `0a949120777c43362620fc4d5f047b1d9f5d2d0f`
PR: `#466`
Tracker: `#465`

## Prior broad-run adjudication

Prior package `HARNESS-ENGINEER-PR466-5205B663-BROAD-CLOSURE-001` completed successfully and produced F1-F6. Integration Authority independently inspected its patch, journal, FULL QG logs, session evidence and the live qore-core contract.

The following dispositions are authoritative for this revision:

### F1 — ACCEPTED / MATERIAL MEDIUM
The hand-enumerated bare sensitive-marker list misses family-equivalent forms such as `clientsecret`, `accesstoken`, `privatekey` and space-separated composite labels. Implement a principled family-based bare-marker detector preserving historical substring semantics and credential fail-closed behavior.

### F2 — REJECTED AS CONTRACT REGRESSION / DO NOT IMPLEMENT
The prior artifact proposed allowing ZWNJ `U+200C`, ZWJ `U+200D`, LRM `U+200E`, RLM `U+200F` and ALM `U+061C` through `_validate_text`.

DO NOT DO THIS.

The live architecture contract explicitly states that `_validate_text` rejects non-printable Unicode before semantic inspection and preserves legitimate *printable* Unicode. The prior security hardening accepted rejection of every non-printable Unicode character to close NBSP/zero-width obfuscation classes. LRM/RLM/ALM are invisible bidi controls and no contract decision authorizes retaining them.

Required invariant:

`any(not character.isprintable() for character in value)` remains fail-closed.

Do not create `_CREDENTIAL_FORMAT_JOINERS`; do not strip such characters detection-only; do not loosen the printable gate. Add permanent tests proving representative ZWNJ/ZWJ/LRM/RLM/ALM-containing values remain rejected, including credential-obfuscation witnesses.

### F3 — ACCEPTED / MATERIAL HIGH
Close delimiter-confusable root causes with a principled detection-only dash-family rule (`Unicode category Pd -> ASCII '-'`) plus bounded non-Pd hyphen/colon lookalikes where justified. Preserve URL-specific slash semantics and retained source bytes.

### F4 — ACCEPTED / MATERIAL HIGH
Bare composite credential markers must use the existing bounded homoglyph-aware matching instead of ASCII-only literal `in` checks. Preserve existing supported marker families and substring semantics.

### F5 — ACCEPTED / MATERIAL MEDIUM
Fix the lunate-sigma normalization-order interaction: the already documented `("c", "ϲ")` confusable must not be destroyed by NFKC/casefold before matching. The change must be detection-only and retain original source bytes.

### F6 — NON-BLOCKING SCOPE NOTE
Do not expand this bounded revision into universal Unicode transliteration. Armenian/Cherokee/small-cap and other-script visual lookalikes remain outside the currently documented bounded Greek/Cyrillic/Latin confusable contract. Record the boundary; do not invent a universal confusable policy in this PR.

## Required implementation/result

1. Reconstruct the exact current implementation at the expected HEAD/TREE before editing.
2. Implement only F1, F3, F4 and F5 root-cause closures.
3. Preserve the exact non-printable fail-closed rule; F2 must be explicitly falsified/rejected in tests/docs.
4. Add permanent adversarial regressions for accepted findings plus explicit regression protection against F2 relaxation.
5. Preserve recursive retained-state revalidation, exact runtime types, deterministic ordering, logical projections, source-byte retention, provider neutrality and no operational/Production authority.
6. Do not weaken any existing test or gate. No skip/xfail/type-ignore suppression.
7. Keep changes within the allowed paths and budget.
8. Run targeted registry tests, focused Ruff/Mypy as useful, then report `CANDIDATE_READY_FOR_FULL_QG` only if the bounded revision is internally green.

## Mandatory semantic LSP evidence

The previous run proved installation/smoke but session evidence did not show a real semantic LSP call. This revision MUST use LSP semantically, not merely smoke it.

At minimum:
- go-to-definition on `_validate_text` or `_credential_detection_skeleton`;
- find references for `_validate_text` or another changed validator;
- inspect at least one material caller/trust edge using LSP hover/definition/reference evidence.

Record concise reproducible LSP evidence in the journal/final report. Do not claim LSP use unless an actual LSP tool call occurred.

## Journal

Maintain `/tmp/qore-principal-engineer-journal.md` during the mission. Record only conclusions/evidence, not private chain-of-thought. Include dispositions F1-F6, LSP evidence, changed paths, targeted validation and final diff audit.

## Authority

Artifact-only. No qore-core remote, commit, push, merge, branch-protection changes, Production credentials, real-capital operations, Risk bypass or operational-readiness claims.

Final outcome must be exactly one of:

`CANDIDATE_READY_FOR_FULL_QG`

or

`BLOCKED`

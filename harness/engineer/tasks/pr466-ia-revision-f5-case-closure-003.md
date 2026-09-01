# PR #466 — Integration Authority F5 case-closure revision 003

## Mission

Produce one bounded artifact-only candidate for qore-core PR #466 from the exact unchanged start below. This is NOT a new broad discovery mission. It is a narrow correction after independent Integration Authority adjudication of Principal Engineer revision 002.

Expected qore-core start HEAD: `5205b663579e35a711446da03a483c57ea786476`
Expected tree: `0a949120777c43362620fc4d5f047b1d9f5d2d0f`
PR: `#466`
Tracker: `#465`

## Revision 002 evidence retained

Package `HARNESS-ENGINEER-PR466-5205B663-IA-REVISION-002` completed with deterministic candidate gates and canonical FULL QG green:

- Ruff: PASS
- Mypy: PASS
- pytest: 5238 passed
- semantic LSP calls: present

Integration Authority accepts the revision-002 dispositions for F1, F2, F3 and F4 and the lower-case part of F5. Do not reopen those families except as required to reconstruct the coherent candidate from the unchanged Core start.

Required retained dispositions:

- F1 — ACCEPTED: family-based bare composite credential markers.
- F2 — REJECTED: preserve `any(not character.isprintable() for character in value)` fail-closed; do not admit ZWNJ/ZWJ/LRM/RLM/ALM.
- F3 — ACCEPTED: Unicode category `Pd` detection-only fold to ASCII `-`, plus bounded justified non-Pd delimiter lookalikes, preserving URL slash semantics and retained bytes.
- F4 — ACCEPTED: bare composite markers use bounded homoglyph-aware matching.
- F6 — bounded scope note only; no universal transliteration.

## Material residual found by Integration Authority — F5 case closure

Revision 002 fixes U+03F2 `ϲ` GREEK LUNATE SIGMA SYMBOL by intercepting it before NFKC. Independent adjudication reproduced that the capital case variant U+03F9 `Ϲ` GREEK CAPITAL LUNATE SIGMA SYMBOL remains a bypass under the same root cause.

Representative witnesses that MUST be rejected by the final candidate:

- `ϲredential=PLAINTEXT-SECRET`
- `Ϲredential=PLAINTEXT-SECRET`
- `ϲlientsecret`
- `Ϲlientsecret`
- corresponding colon/hyphen/space variants when materially equivalent

Why this is the same root cause:

- the documented bounded confusable contract contains `("c", "ϲ")`;
- the detector is case-insensitive through casefold;
- `Ϲ`.casefold() yields `ϲ`, but the current NFKC-before-casefold ordering maps U+03F9 to Greek sigma first, destroying the intended bounded `c` confusable;
- therefore handling only U+03F2 is not a complete root-cause closure.

Implement the smallest principled detection-only fix that closes both case forms without broadening into universal Unicode transliteration. Retained source bytes must remain unchanged.

## Required candidate

Reconstruct the coherent revision-002 candidate from the exact unchanged start, then close the F5 capital-case residual. The final artifact must contain the accepted F1/F3/F4/F5 corrections together, F2 protection, regressions and documentation.

Add permanent regressions proving at least:

1. lower and capital lunate-sigma credential/credential-family witnesses reject at construction;
2. lower and capital forms reject on retained-state re-entry / logical projection where applicable;
3. benign lower/capital lunate-sigma text remains byte-for-byte retained when it is not credential-like;
4. F2 non-printable controls remain rejected;
5. prior F1/F3/F4 regression coverage remains green.

Do not weaken, delete or xfail existing tests. No `type: ignore` or lint suppression to obtain green output.

## Mandatory LSP — hard requirement

This package is bound to the hardened Principal Engineer policy. Semantic LSP is mandatory evidence, not optional tooling.

BEFORE the first production edit, the main Engineer session MUST perform successful semantic LSP calls on the material production surface, including:

- `findReferences` on `_validate_text`, `_credential_detection_skeleton`, `_credential_character_matches`, or another materially changed validator/helper;
- `goToDefinition` or `goToImplementation` on a materially changed symbol;
- `hover` on a materially changed or material caller/trust-edge symbol.

Use the results to identify callers/trust edges and record concise evidence in the journal.

AFTER implementation stabilizes, perform at least one additional successful LSP call on the changed helper/validator or its callers to revalidate final impact.

The smoke test, Pyright installation, grep/read/bash, a failed/empty LSP result, or LSP used only by a subagent DO NOT count. If semantic LSP cannot be used successfully, return `BLOCKED`.

The deterministic Principal Engineer usage gate will independently inspect session evidence. Do not claim LSP use unless real tool calls occurred.

## Validation and handoff

- Run targeted registry tests while iterating.
- Run focused Ruff/Mypy as useful.
- Audit the final diff for scope, accidental authority, secrets, regressions and unrelated edits.
- Maintain `/tmp/qore-principal-engineer-journal.md` continuously.
- Return `CANDIDATE_READY_FOR_FULL_QG` only if the bounded candidate is internally green.
- The deterministic wrapper owns candidate gate + canonical FULL QG + candidate revalidation.

## Authority

Artifact-only. No qore-core remote, commit, push, merge, branch-protection changes, Production credentials, real-capital operations, Risk bypass or operational-readiness claims.

Final outcome must be exactly one of:

`CANDIDATE_READY_FOR_FULL_QG`

or

`BLOCKED`

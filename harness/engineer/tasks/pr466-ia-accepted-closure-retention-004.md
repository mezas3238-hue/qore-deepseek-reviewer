# PR #466 — Integration Authority accepted-closure retention revision 004

## Mission

Produce one bounded artifact-only candidate for qore-core PR #466 from the exact unchanged start below. This is NOT a new broad discovery mission. It is the final retention correction after independent Integration Authority adjudication of Principal Engineer revisions 001–003.

Expected qore-core start HEAD: `5205b663579e35a711446da03a483c57ea786476`
Expected tree: `0a949120777c43362620fc4d5f047b1d9f5d2d0f`
PR: `#466`
Tracker: `#465`

The Core PR has NOT been modified by artifacts 001, 002 or 003. Reconstruct one coherent candidate from this exact start.

## Why revision 003 is not publishable

Revision 003 successfully closes F5 for both U+03F2 `ϲ` and U+03F9 `Ϲ`, preserves F2 fail-closed non-printable rejection, passes semantic-LSP enforcement and canonical FULL QG, but it does not faithfully retain every previously accepted F1/F3/F4 behavior while reconstructing from the unchanged start.

Independent IA comparison against the accepted broad-run evidence found three retention defects that MUST be closed together in this package:

### R1 — F3 non-Pd delimiter lookalikes were dropped

The accepted F3 root-cause closure is:

- every Unicode category `Pd` character -> ASCII `-` for detection only;
- bounded non-Pd hyphen lookalikes:
  - U+2212 `−` MINUS SIGN -> `-`
  - U+2043 `⁃` HYPHEN BULLET -> `-`
  - U+00B7 `·` MIDDLE DOT -> `-`
- bounded colon lookalikes:
  - U+2236 `∶` RATIO -> `:`
  - U+A789 `꞉` MODIFIER LETTER COLON -> `:`
  - U+02D0 `ː` MODIFIER LETTER TRIANGULAR COLON -> `:`
  - U+02F8 `˸` MODIFIER LETTER RAISED COLON -> `:`
- bounded slash lookalikes remain U+2215 `∕` and U+2044 `⁄`, preserving the existing URL-specific authority-terminator semantics.

Revision 003 kept categorical `Pd` plus U+2212 but omitted U+2043, U+00B7 and U+02F8.

Exact witnesses that MUST reject include at least:

- `api⁃key=PLAINTEXT-SECRET`
- `api·key=PLAINTEXT-SECRET`
- `private⁃key:PLAINTEXT-SECRET`
- `token˸PLAINTEXT-SECRET`
- retained-state re-entry equivalents for representative witnesses.

Benign text containing these characters without a supported credential marker must remain byte-for-byte retained.

### R2 — F1 historical substring semantics were narrowed

The accepted F1 family-based detector preserves the historical substring behavior of the old `_SENSITIVE_TEXT_MARKERS` `in` checks. A supported composite credential family is sensitive wherever the complete supported family occurs; it is NOT converted into a token-boundary-only detector.

Revision 003 added alphanumeric left/right boundary checks and therefore narrowed the accepted contract.

The final family matcher MUST preserve substring semantics for the supported composite families:

- `api` + `key`
- `access` + `token`
- `client` + `secret`
- `private` + `key`

with zero-or-more supported separators (`space`, `_`, `-`) and existing bounded homoglyph matching.

Permanent regressions MUST prove embedded occurrences remain rejected, including representative values such as:

- `prefixclientsecretpostfix`
- `prefixapi-keypostfix`
- bounded homoglyph equivalents where material.

Do not introduce a new token-boundary contract merely to reduce false positives. Preserve the accepted fail-closed historical substring semantics.

### R3 — accepted F4 homoglyph-aware `bearer ` scheme was dropped

The broad accepted F4 evidence covered not only composite labels but also the already-supported bare `bearer ` token scheme. The old marker list contains `bearer ` and the accepted root-cause closure made that scheme homoglyph-aware under the existing bounded confusable table.

The final candidate MUST preserve ASCII `bearer ` behavior and reject bounded homoglyph variants, including at least:

- `вearer PLAINTEXT-SECRET` where U+0432 is the bounded `b` confusable;
- another representative supported-letter homoglyph when available from the existing table.

This is detection-only and does not broaden the supported marker families.

## Retained dispositions — MUST NOT regress

### F1 — ACCEPTED
Family-based bare composite credential marker detection, separator tolerant and bounded-homoglyph aware, with historical substring semantics.

### F2 — REJECTED AS CONTRACT REGRESSION
Preserve exactly the fail-closed rule:

`any(not character.isprintable() for character in value)`

Do NOT add a format-control allowlist. ZWNJ/ZWJ/LRM/RLM/ALM and every other non-printable remain rejected before semantic inspection.

### F3 — ACCEPTED
Categorical `Pd -> '-'` plus the exact bounded non-Pd lookalikes listed in R1, detection-only, preserving URL slash semantics and retained bytes.

### F4 — ACCEPTED
Bounded homoglyph-aware bare composite markers AND the existing `bearer ` scheme. Preserve supported marker families; no universal transliteration.

### F5 — ACCEPTED
Close the lunate-sigma case pair at the root before NFKC: U+03F2 `ϲ` and U+03F9 `Ϲ` must both preserve the documented bounded `c`-confusable identity for detection only. Exact witnesses `ϲredential=...`, `Ϲredential=...`, `ϲlientsecret`, `Ϲlientsecret` and material separator variants must reject. Benign lower/capital lunate text remains byte-for-byte retained.

### F6 — NON-BLOCKING SCOPE NOTE
No universal Unicode transliteration. Other-script visual lookalikes remain outside the bounded documented confusable contract unless already present in `_CREDENTIAL_CONFUSABLE_PAIRS`.

## Required permanent regression matrix

The final candidate must include permanent tests proving all of the following in one coherent artifact:

1. F1 bare composite families reject in bare/space/hyphen/underscore forms.
2. F1 historical substring semantics reject embedded supported composite occurrences.
3. F3 category-`Pd` representatives reject.
4. F3 U+2043, U+00B7 and U+02F8 exact residual witnesses reject.
5. F3 retained-state re-entry rejects representative residual witnesses.
6. F3 benign text with Pd/non-Pd lookalikes remains byte-for-byte retained when not credential-like.
7. F4 bounded homoglyph composite labels reject.
8. F4 bounded homoglyph `bearer ` scheme rejects.
9. F5 U+03F2 and U+03F9 reject at construction and retained-state re-entry / logical projection where applicable.
10. F5 benign lower/capital lunate text remains byte-for-byte retained.
11. F2 ZWNJ/ZWJ/LRM/RLM/ALM remain rejected.
12. Existing recursive retained-state, URL-userinfo and earlier R3–R16 tests remain green.

Do not weaken/delete/xfail tests. No `type: ignore`, linter suppression or coverage gaming.

## Root-cause / equivalence-closure requirement

Do not fix only the supplied witness strings. Before declaring a family closed, explicitly inspect the bounded equivalence class relevant to that family:

- Unicode category membership where the rule is categorical;
- upper/lower/casefold and NFKC interactions where normalization is involved;
- supported separators and bounded confusable pairs;
- constructor plus retained-state re-entry/logical projection trust edges;
- benign counterexamples / retained-byte preservation.

Record concise `EQUIVALENCE CLOSURE EVIDENCE` in the journal and final report. No Unicode brute-force without a bounded hypothesis.

## Mandatory semantic LSP — hard requirement

The hardened Principal Engineer policy applies.

BEFORE the first production edit, the main Engineer session MUST perform successful semantic LSP calls on the material production surface, including:

- `findReferences` on `_validate_text`, `_credential_detection_skeleton`, the bare-marker helper or another materially changed validator/helper;
- `goToDefinition` or `goToImplementation` on a materially changed symbol;
- `hover` on a materially changed symbol or caller/trust edge.

AFTER implementation stabilizes, perform additional successful LSP on the final changed helper/validator or a material caller.

Smoke/Pyright installation/grep/read/bash/failed LSP/subagent-only LSP do not count. If semantic LSP cannot be demonstrated, return `BLOCKED`.

## Adaptive reasoning requirement

This package runs on the hardened Principal Engineer infrastructure with `high` baseline and `max` escalation. Because this mission combines credential security, Unicode normalization, prior contradictory reconstruction evidence and root-cause retention, the material analysis/closure phases are expected to qualify for MAX under the controller. Do not claim MAX unless the runtime audit records it; do not inspect or expose private chain-of-thought. The deterministic reasoning audit is authoritative.

## Validation / handoff

- Run targeted registry tests while iterating.
- Run focused Ruff/Mypy as useful.
- Audit the final diff against this entire retention matrix, not merely F5.
- Maintain `/tmp/qore-principal-engineer-journal.md` continuously with reproducible conclusions/evidence only.
- Return `CANDIDATE_READY_FOR_FULL_QG` only if the bounded candidate is internally green and every retained disposition above is demonstrably present.
- The deterministic wrapper owns candidate scope gate + semantic-LSP gate + adaptive-reasoning audit + canonical FULL QG + candidate revalidation.

## Authority

Artifact-only. No qore-core remote, commit, push, merge, branch-protection change, Production credentials, real-capital operation, Risk bypass or operational-readiness claim.

Final outcome must be exactly one of:

`CANDIDATE_READY_FOR_FULL_QG`

or

`BLOCKED`

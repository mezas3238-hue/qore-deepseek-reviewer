# PR466 — Principal Engineer broad closure after Harness DEEP A-D

## Objective

Operate on exact qore-core start `5205b663579e35a711446da03a483c57ea786476` / tree `0a949120777c43362620fc4d5f047b1d9f5d2d0f` and produce one coherent artifact-only candidate that closes all validated material defects in the PR466 UMI-13 registry validation surface, adds permanent regression coverage, searches for additional materially distinct defects beyond the known seeds, and is ready for deterministic FULL QG.

Do not stop after fixing the known findings. Treat them as seed evidence, perform the Principal Engineer A+B+C+D+E+F matrix, continue searching for additional independent root causes, and batch-correct everything safely closeable inside scope.

## Seed findings from the completed broad Harness DEEP run

The prior read-only DEEP audit on the same exact freeze completed with `MATERIAL_FINDINGS` and four deduplicated root causes:

1. F1 NEW / MEDIUM — literal sensitive-marker enumeration gap. Representative accepted forms included `clientsecret`, `accesstoken`, `privatekey` and several space-separated compound forms while sibling forms such as `apikey` or hyphenated forms were rejected. Independently reproduce/falsify exact contract intent before fixing. Prefer a principled supported-marker-family representation over cosmetic witness enumeration.
2. F2 NEW / LOW — `isprintable()` behavior-tightening false positive versus BASE. Representative legitimate format characters include ZWNJ U+200C and ZWJ U+200D. Independently compare BASE→HEAD contract and tests; fix if the tightening lacks an explicit invariant basis. Preserve actual control/invisible credential-hygiene defenses while avoiding unjustified rejection of legitimate retained text.
3. F3 KNOWN SEED / HIGH — credential delimiter-confusable table remains incomplete. Representative accepted witnesses include U+058A ARMENIAN HYPHEN, U+2043 HYPHEN BULLET, U+30A0 KATAKANA-HIRAGANA DOUBLE HYPHEN, U+00B7 MIDDLE DOT and U+02F8 MODIFIER LETTER RAISED COLON. Deduplicate by semantic delimiter family/root cause. Do not brute-force every Unicode code point unless a bounded contract demands it.
4. F4 KNOWN SEED / HIGH — cross-script letter-homoglyph protection is concentrated in assignment-style `=`/`:` handling; bare supported marker forms can bypass. Representative accepted witnesses included Cyrillic/Greek-confusable variants of `api-key`, `access-token`, `client-secret`, `private-key`, and `bearer`. Fix the root-cause interaction between literal marker matching, skeletonization and confusable matching rather than one witness at a time.

The DEEP run reported 304 targeted registry tests passing before new adversarial probes and found no additional URL-userinfo defect in the R8/R9/R10 path. Treat that as prior evidence, not certification.

## Broader discovery requirements

Before final handoff, deliberately investigate at least these materially relevant surfaces and record findings/dispositions in the cumulative journal:

- all supported credential-marker families across concatenated, space, hyphen/dash, underscore, `=`, `:`, URL-userinfo, mixed separator, combining/invisible and cross-script variants;
- normalization-order interactions: source validation → NFKC/casefold/NFD → invisible filler removal → delimiter confusable mapping → letter confusable matching → literal/assignment detection;
- construction-time, retained-state re-entry and logical/content/evidence projections that share the hygiene invariant;
- exact runtime types and recursive retained-state validation touched by the registry changes;
- benign-preservation false positives, especially legitimate Unicode text, joiners, script shaping and emoji sequences;
- documentation/test claims that may overstate closure or encode a stronger contract than production code;
- accidental provider, Production, Risk, execution or secret-authority changes.

Use LSP to inspect references/impact of shared validators and relevant dataclasses/projections. Use up to three subagents if useful to split independent surfaces. Continue after each finding until A-F is materially covered or a concrete blocker/budget limit exists.

## Implementation expectations

- Correct every validated root cause safely closeable in scope as one batch.
- Add permanent normal + adversarial regressions per fixed root cause, including retained-state/projection paths and benign false-positive containment where applicable.
- Run targeted pytest/probes while iterating and focused ruff/mypy as useful.
- Do not run repository-wide FULL QG inside the model loop; the deterministic workflow will run canonical FULL QG after `CANDIDATE_READY_FOR_FULL_QG`.
- Do not weaken existing tests, skip/xfail new defects, silence linters/types, or reduce coverage expectations.
- Preserve byte-for-byte retained valid text where the contract requires preservation; validation-only skeletons must not launder stored/projected content.
- No commit, push, merge, Git remote, GitHub publication, Production credentials, real-capital operations or Risk bypass.

## Acceptance

Return `CANDIDATE_READY_FOR_FULL_QG` only when:

- all seed findings have explicit `FIXED`, `FALSE_POSITIVE`, or `BLOCKED` dispositions with evidence;
- additional materially distinct defects discovered during A-F have been similarly dispositioned;
- all safely fixable validated findings are corrected in one coherent candidate;
- permanent regressions map to every fixed material root cause;
- targeted validation is green;
- final diff audit is clean and within package scope/budgets;
- no known material correction unit remains silently unfixed.

If a valid correction cannot be safely completed within the declared scope/budgets, return `BLOCKED` with exact residual evidence rather than narrowing the claim.

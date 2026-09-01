# QORE Core PR #466 — DeepSeek Expert R18B — transport-recovery Harness accepted-closure certification

Review only the exact frozen QORE Core candidate below. You are the independent adversarial technical certifier after the Harness Principal Engineer and Integration Authority. Your job is to try to falsify the claim that the frozen candidate closes the bounded credential/text-normalization contract. Do not modify QORE Core. Do not repeat the Harness implementation task. Do not infer PASS from green CI, Harness SUCCESS, the Integration Authority pre-adjudication, or the failed R18 transport attempt.

## Exact freeze
- PR: `466`
- BASE: `5a158ef0fb2e21db95f2be0685373780bf1ab197`
- HEAD: `63ca01f3c38fd0f0be875f455d561a3fc306eceb`
- TREE: `3427fdff0acc321d6309ff9223c53f9ba2a7f7d6`
- SYNTHETIC: `588aaf98e4e3b645c790fbfbb41295d80943e441`
- synthetic parents: BASE then HEAD
- synthetic tree: identical to HEAD tree
- PR state immediately before this package: OPEN / DRAFT / mergeable
- cumulative changed files: `21`
- cumulative PR diff: `+3076 / -71`

The final Harness materialization delta from obsolete HEAD `5205b663579e35a711446da03a483c57ea786476` is exactly two files:
1. `src/qore/infrastructure/instrument_universe_registry.py` — `+70 / -12`
2. `tests/infrastructure/test_instrument_universe_registry_accepted_closure_004.py` — new, `+350`

## Authoritative FULL QG
- run: `33537066916`
- job: `99953867154`
- CI checkout: exact synthetic `588aaf98e4e3b645c790fbfbb41295d80943e441`
- Ruff: PASS — `All checks passed!`
- Mypy: PASS — `750 source files`
- Pytest: `5287 collected / 5287 passed / 7 warnings`
- Coverage: `47699 statements / 6237 missed / 87%`
- `instrument_universe_registry.py`: `339 statements / 3 missed / 99%`

<!-- QORE-EXACT-QG {"coverage_missed_statements":6237,"coverage_percent":87,"coverage_total_statements":47699,"job_id":99953867154,"mypy_source_files":750,"pytest_collected":5287,"pytest_passed":5287,"pytest_warnings":7,"ruff_passed":true,"run_id":33537066916} -->

CI success is mechanical evidence only.

## Why R18B exists — R18 is semantically void
The immediately preceding package `QORE-PR466-63CA01F3-DS-EXPERT-HARNESS-CLOSURE-R18` was bound to this same exact Core freeze and successfully passed package validation, adaptive-reasoning preflight, live PR binding, exact HEAD checkout, synthetic-parent verification and tree equality. Its non-thinking planner also returned normally.

R18 then failed while reading the authoritative DeepSeek response body with `http.client.IncompleteRead: IncompleteRead(7 bytes read)`. It produced no `deepseek-review.md`, no published exact-head review, no HIGH/MAX reasoning audit row for a completed authoritative response, and therefore no semantic verdict. Observed account balance delta around that failed run was `USD 1.96 -> 1.96`, delta `0`; this does not erase the fact that the planner API call occurred. R18 must be treated only as a transport failure, neither PASS nor finding.

Reviewer infrastructure was hardened after R18 without changing QORE Core. The stable adaptive route now allows at most one immediate retry for broken response transport only (`IncompleteRead`, URL/connection/timeout failure, or truncated/malformed JSON body), performs no sleep/backoff, never retries HTTP errors such as 429/5xx, and self-tests this behavior before paid reviewer execution. A recovered retry is recorded in reasoning-audit reasons. R18B is a new package and a fresh independent certification attempt; it is not a continuation of hidden or partial R18 reasoning.

## Accepted closure matrix that must remain closed together

### F1 — composite credential families
Supported families are:
- `api` + `key`
- `access` + `token`
- `client` + `secret`
- `private` + `key`

They must fail closed in bare, space, hyphen and underscore forms, including repeated separator forms already covered by the candidate. Historical substring semantics must remain intact: supported complete families embedded inside larger text are still sensitive. Do not narrow this into word-boundary-only matching.

### F2 — non-printable Unicode gate
The existing contract rejects non-printable Unicode before semantic credential inspection. Do not require ZWNJ/ZWJ/LRM/RLM/ALM allowlisting and do not reinterpret this as a universal Unicode text-normalization feature. Verify this fail-closed gate remains unchanged in effect.

### F3 — delimiter/separator closure
The candidate declares a principled detection-only rule for Unicode category `Pd` -> ASCII `-`, plus bounded residual non-Pd lookalikes already accepted by the contract. At minimum independently attack:
- `U+2043 HYPHEN BULLET` (`⁃`)
- `U+00B7 MIDDLE DOT` (`·`)
- `U+02F8 MODIFIER LETTER RAISED COLON` (`˸`)
- prior bounded colon/slash/minus confusables

Try constructor, assignment-delimiter, bare-composite, retained-state re-entry and projection variants. Do not demand universal punctuation transliteration.

### F4 — bounded homoglyph credential matching
The candidate must reject supported composite families under the existing bounded homoglyph matcher and must preserve the bounded `bearer ` scheme protection. Attack ASCII and case variants plus existing in-scope Cyrillic/Greek homoglyphs. Look for ordering or substring gaps, but do not expand scope into universal transliteration of Armenian/Cherokee/small-caps or arbitrary scripts without a reproducible contract-equivalent defect.

### F5 — Greek lunate sigma normalization-order root closure
The bounded `c`/Greek lunate sigma family must close both:
- `U+03F2 ϲ` GREEK LUNATE SIGMA SYMBOL
- `U+03F9 Ϲ` GREEK CAPITAL LUNATE SIGMA SYMBOL

At minimum attack both in:
- `ϲredential=PLAINTEXT-SECRET`
- `Ϲredential=PLAINTEXT-SECRET`
- `ϲlientsecret`
- `Ϲlientsecret`
- materially equivalent colon/hyphen/space forms within the existing grammar
- retained-state `__post_init__()` re-entry and logical projection

Confirm benign lower/capital lunate sigma text outside sensitive syntax remains accepted and retained byte-for-byte.

## Mandatory adversarial foci
1. Treat the final candidate as one cumulative closure. A defect is material if fixing F1/F3/F4/F5 caused any previously accepted closure to regress.
2. Try to produce a concrete residual counterexample inside the declared bounded equivalence classes rather than merely naming unbounded Unicode possibilities.
3. Audit normalization ordering and interaction among detection-root folding, NFKC, casefold, NFD, mark/filler filtering, delimiter canonicalization, homoglyph matching, sensitive assignment matching and URL-userinfo scanning.
4. Verify URL-userinfo detection and prior multi-authority / NFKC-created-terminator protections remain intact and are not accidentally weakened by the new root fold.
5. Verify recursive retained-state revalidation reaches reason, evidence source_name/locator, entry, snapshot, lookup and logical projections where those trust edges exist.
6. Verify local `StrEnum` canonical identity/name/value revalidation, imported `IdentityFamilyCode`, exact runtime types, deterministic ordering, `bool != int`, and no subclass laundering remain intact.
7. Check false-positive containment and byte-for-byte retention of benign printable Unicode text outside supported sensitive syntax.
8. Look for patch-list behavior that only closes listed tests while leaving a same-root-cause bounded equivalent open. If you claim such a defect, provide a constructible witness and explain why it belongs to the already-declared equivalence class.
9. Verify provider-neutrality and that no reviewer/AI-provider dependency entered QORE Core.
10. Confirm no hidden retry/sleep/scheduler/thread semantic effect inside QORE Core, automatic corrective trading, Risk bypass, provider operational authority, Production authority, productive credentials, deposits/withdrawals or real-capital execution authority is introduced. The reviewer's bounded external transport recovery is reviewer infrastructure only and must not be confused with Core semantics.

## Expert role and verdict discipline
- This is a read-only adversarial certification stage using the stable adaptive HIGH/MAX Expert policy.
- Do not propose or perform production edits.
- Ask: `Can I falsify the claim that this exact frozen candidate closes the declared contract?`
- Review this exact freeze only.
- Report only reproducible material defects tied to this candidate.
- For each finding provide exact location, constructible witness, expected behavior, actual behavior, violated invariant, impact, and minimal correction direction. Do not implement the correction.
- Evidence/tooling insufficiency is not PASS.
- If no material defect remains and evidence is sufficient, state `VALIDACIÓN OK` / no material findings.
- Any Core change invalidates this review and requires a fresh Expert stage.
- Do not authorize Production or real capital.

# QORE PR #466 — Harness Engineer Batch 008

## ROLE / EXECUTION MODE

Act as QORE Harness Engineer on the exact frozen qore-core candidate below. This is a successor to Batch 007, which was terminated solely by the obsolete 18-minute infrastructure hard cap before producing a candidate. Do not treat its incomplete workspace as evidence or a candidate. Reconstruct from the exact immutable start and execute the same full causal batch with the corrected 120-minute AI wall allowance.

Use the full Harness runtime: **6 native subagents**, **semantic Python LSP**, adaptive **HIGH baseline → MAX for material normalization/security interactions**, systematic/property/metamorphic exploration, focused tests, then FULL QG. Work artifact-only; do not push or mutate qore-core remote.

## IMMUTABLE START

- PR: #466
- BASE: `5a158ef0fb2e21db95f2be0685373780bf1ab197`
- START HEAD: `c079bb5fc8d201db8e0eeb05bc35a59884d371f7`
- START TREE: `d2f686c4a4c47f7f501c9667a2106016174f19fe`
- prior synthetic: `538a86084f9e8cb0eb05d0388472ec683a6e0dbc`
- prior exact-head QG: run `33569582940`, job `100060386826`; Ruff PASS; Mypy PASS 752 source files; Pytest 5469/5469; 7 warnings; coverage 87%.
- Expert source package: `QORE-PR466-C079BB5-DS-EXPERT-R19-ROOT-FAMILY-R20`, run `33570652947`, job `100063660550`.
- Failed predecessor only for infrastructure timing: `HARNESS-ENGINEER-PR466-C079BB5-R20-ROOT-FAMILY-BATCH-007`, run `33574795671`, job `100076286728`, exit 124 at the obsolete 18-minute cap. It produced no accepted candidate and FULL QG never ran.

## OBJECTIVE

Close the **entire credential-detection normalization / Unicode-confusable / recursive-revalidation root family** identified by Expert R20. Fix all eight material findings together and prove family exhaustion. Do not narrow to the supplied witnesses. Preserve byte-identical retained/projected text and keep all hardening detection-only unless a pre-existing contract explicitly requires otherwise.

## MATERIAL FINDINGS TO CLOSE

1. **F-R21 — HIGH — U+0345 casefold escape.** Pipeline `NFKC → casefold → NFD → Mn/Mc/Me filter` lets U+0345 become Greek iota before mark filtering. Witness families include `tok\u0345en=...`, `api\u0345key=...`, `https:/\u0345/user@host`. Close the whole printable Mn/Mc/Me × normalization-order family, not only U+0345. Verify independently.

2. **F-NORM-BOUNDARY — MODERATE — normalization expansion erases source token boundaries.** Source non-alnum chars such as `™`, `№`, `℡`, `℅`, `⅟`, `㎝`, `¼` fold/expand to alnum or slash and defeat scheme-relative authority lookbehind. Close the source-boundary preservation family systematically across Unicode normalization/casefold expansions, including multi-character expansions.

3. **F-SLASH — MODERATE — slash-confusable authority starts.** Current `/ ∕ ⁄` coverage is incomplete. Expert witnesses include `⫽`, `⧸`, `╱`, `U+1F67C`, `⼃`, `⟋`, `⟍`, plus fold-priority ambiguity for U+2E17. Define a bounded, defensible authority-start delimiter policy and test the complete chosen class; do not blindly glyph-match unrelated punctuation.

4. **F-SPACING — MED-LOW — spacing clones of combining marks between slashes.** NFKC spacing-diacritic sources such as `¨`, `´`, `˜`, `¯` can become space+mark and the terminator sentinel preserves the gap, so `/X/user@host` evades while combining forms reject. Close the full source-char → spacing/mark expansion family without breaking legitimate terminator preservation.

5. **F-EQUALS-COLON — LOW-MOD — assignment delimiter confusable gaps.** Expert witnesses include `꞊ ⹀ ≡ ≔ ≕ ˭` for equals-like and `։ ፡ ⁝ ∷ ׃ ˑ` for colon-like characters. Resolve interaction with Pd root folding (notably U+2E40) and close the bounded assignment-delimiter class across all sensitive-label detectors.

6. **F-LABEL-GAPS — LOW-MOD — label/composite grammar gaps.** Expert found missing homoglyph/separator families: examples `γ` for y, `ɪ`, `ĸ`, `ɯ`, `ь`; `api.key`, `api∙key`, `api・key`, `private.key`, and fold-to-slash separator interactions. Expand only with a documented bounded semantic policy; avoid an unbounded 'reject all lookalikes' rule. Exhaustively verify the declared pair/separator tables.

7. **F-FALSEPOS — LOW — R20 introduced benign false positives.** `é//user@host` rejects while `e//user@host` accepts because NFD-exposed marks become lookbehind boundaries in the preserve-marks skeleton. Close the metamorphic inconsistency while preserving the R19/R20 security closure. Include benign controls and precomposed/decomposed equivalence properties.

8. **F-ERRCONTRACT — LOW — raw AttributeError leaks from recursive revalidation.** Defensive enum/identity revalidation dereferences forged/deleted attributes outside conversion, violating the documented deterministic `InstrumentUniverseRegistryValidationError` boundary. Close the whole reachable forged/corrupted retained-state typed-error family; no raw `AttributeError`, `TypeError`, etc. may escape where the contract requires registry validation errors.

## ROOT-FAMILY EXHAUSTION GATE

Before claiming closure, build a matrix over at least these dimensions and either exhaustively enumerate the finite class or justify an invariant-based reduction:

- printable `Mn/Mc/Me` marks × positions (before `//`, between slashes, scheme, userinfo, labels), including casefold/NFKC category changes;
- NFKC/casefold single- and multi-character expansions that can create/remove alnum, slash, whitespace, `@`, `=`, `:` or boundary significance;
- slash/solidus confusable class and any fold-priority conflicts;
- spacing-mark/diacritic expansions and terminator-sentinel interactions;
- equals/colon confusables and dash-fold interactions;
- declared credential homoglyph pair table and composite separator table;
- NFC/NFD equivalence and benign-text acceptance around URL authority boundaries;
- three-skeleton OR semantics, sentinel completeness, idempotence, suffix/extension monotonicity where applicable;
- recursive revalidation of forged exact-type, enum, unset-slot, deleted-attribute, wrong-runtime-type and nested corrupted states;
- all prior F1–F5 and R8–R20 witnesses/regressions.

Use property/metamorphic testing where it materially strengthens the argument. If exploration discovers additional members of the same causal family, fix them in this batch rather than stopping at the eight named findings. If a proposed class is intentionally out of scope, document a precise semantic reason and prove it does not contradict the current contract/docs.

## LSP / REASONING REQUIREMENTS

Semantic LSP is mandatory in the primary session before implementation, during impact analysis, and after implementation. Use definitions/references/hover on the relevant detector and revalidation functions to establish the real impact surface. The six subagents must have non-duplicative lanes and produce adjudicable evidence. HIGH is the baseline; escalate to MAX for normalization-order, fold-priority, cross-skeleton, typed-error, or root-family closure decisions. The runtime audit must prove both HIGH and MAX usage.

## IMPLEMENTATION CONSTRAINTS

- provider-neutral; no provider/network/Production behavior.
- detection-only hardening; do not rewrite retained or projected semantic text.
- exact runtime type discipline; `bool != int`; no subclass laundering.
- deterministic behavior; no hidden retry/sleep/thread/scheduler/global mutable state.
- no test weakening, suppressions, `type: ignore` used to hide defects, lint silencing, or coverage exclusions.
- preserve prior recursive revalidation and byte-identical retention/projection guarantees.
- keep changes bounded to the allowed paths and root family.

## TEST / QUALITY GATE

Add focused normal + adversarial + property/metamorphic tests sufficient to prove the closure matrix. Then run FULL QG exactly:

```text
ruff check .
mypy src tests
pytest --cov=src/qore --cov-report=term-missing
```

All must pass. Report exact counts, warnings, coverage, changed files, diff stats, LSP evidence, subagent lanes, HIGH/MAX audit evidence, and a concise **Root-Family Closure Argument** explaining why no materially adjacent member remains untested/uncovered.

## DELIVERABLE

Produce an artifact-only candidate patch and evidence package suitable for exact materialization. Do not push qore-core. Final disposition must be one of:

- `CANDIDATE READY — ROOT FAMILY EXHAUSTED`, only if all eight findings and any discovered adjacent family members are closed and FULL QG is green; or
- `BLOCKED / FURTHER MATERIAL FAMILY FOUND`, with reproducible evidence and no false claim of closure.
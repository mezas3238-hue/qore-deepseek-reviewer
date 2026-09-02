# QORE PR #466 — Harness Engineer Batch 009

## ROLE / EXECUTION MODE

Act as QORE Harness Engineer on the exact frozen qore-core candidate below. This is a single causal correction batch for the one material finding accepted from DeepSeek Coder R21. Do NOT restart the completed Expert/Coder audits, do NOT redo R20/R21 broad exploration, and do NOT reopen already-closed families except as required to prove the immediate boundary family around this defect.

Use the full Harness runtime: exactly **6 native subagents**, **PRIMARY semantic Python LSP**, adaptive **HIGH baseline → MAX for the security-sensitive boundary decision**, adversarial/property probes, focused implementation/tests/docs as needed, then FULL QG. Work artifact-only; do not push or mutate qore-core remote.

Durable memory is mandatory. Append checkpoints after binding verification, after each subagent adjudication cluster, after implementation, after focused tests, after FULL QG, and immediately before final disposition. Every checkpoint must record concrete evidence, unresolved uncertainty, `PENDING NEXT ACTION`, and `SAFE RESUME INSTRUCTION`. Preserve a recovery patch snapshot so interruption never forces a restart.

## IMMUTABLE START

- PR: #466
- BASE: `5a158ef0fb2e21db95f2be0685373780bf1ab197`
- START HEAD: `9c5a5f6c2befb62396563bac74ddd8a87760d23f`
- START TREE: `1c2b06effe269aec2b06c77d4344581c8d382d25`
- SYNTHETIC: `f6aa162754f781c41ad9418e3edccf1ca5b2f9bb`
- exact-head QG: run `33582654000`, job `100100024113`; Ruff PASS; Mypy PASS 753 source files; Pytest 5537/5537; 7 warnings; coverage 87%.
- Expert completion: `QORE-PR466-9C5A5F6-DS-EXPERT-R21-COMPLETION-003`, run `33592645426`, accepted by Integration Authority as `NONE / VALIDATION OK`.
- Coder source package: `QORE-PR466-9C5A5F6-DS-CODER-R21-001`, run `33618608265`, artifact `9842746497`, workflow SUCCESS, final verdict `MATERIAL FINDING(S)`.

## ACCEPTED MATERIAL FINDING — F-CODER-001

`src/qore/infrastructure/instrument_universe_registry.py`, `_matches_sensitive_assignment_label`, current tail condition:

```python
return index < 0 or not prefix[index].isalnum()
```

The confusable-label detector uses a residual Unicode alphanumeric left-boundary after fully matching a declared sensitive label. That boundary disagrees with sibling marker behavior and with the intended contract that a complete supported sensitive family remains sensitive wherever it occurs.

Independently reproduced witnesses on the frozen HEAD:

- `αtоken=PLAINTEXT-SECRET` — currently accepted (`α` U+03B1 prefix; `о` U+043E is a declared `o` confusable).
- `xtоken=PLAINTEXT-SECRET` — currently accepted.
- plain controls `αtoken=PLAINTEXT-SECRET` and `xtoken=PLAINTEXT-SECRET` are blocked by sibling detection paths.
- clean-boundary `tоken=PLAINTEXT-SECRET` is blocked by the confusable path.

Root cause: after the expected label has been completely matched backwards, the implementation incorrectly conditions sensitivity on the preceding code point's `isalnum()` status. A supported label containing a declared homoglyph therefore ceases to be sensitive merely because another alphanumeric precedes it.

## REQUIRED CORRECTION CONTRACT

1. Close **both** `αtоken=` and `xtоken=`. A fix that only replaces Unicode `isalnum()` with an ASCII-only boundary is insufficient because `xtоken=` would remain fail-open.
2. Prefer the minimal causal semantics: once the complete declared sensitive assignment label has been matched immediately before an assignment delimiter, do not impose a new left token boundary that contradicts the supported-family contract. Confirm this against the actual sibling marker/regex/composite semantics before editing.
3. Add regression coverage for at least:
   - ASCII alnum prefix + declared confusable label (`xtоken=`);
   - non-ASCII alnum prefix + declared confusable label (`αtоken=`);
   - multiple declared sensitive labels and composite families where materially relevant, not token-only;
   - clean-boundary homoglyph labels remain blocked;
   - benign text that contains lookalike fragments but not a complete sensitive assignment family remains accepted;
   - byte-identical retention/projection remains unchanged.
4. Explore the immediate causal family only: preceding character classes (ASCII alnum, non-ASCII alnum, punctuation, whitespace, start-of-string) × declared confusable label members × `=`/`:` assignment delimiters. Exhaust finite tables or justify invariant reduction. If an adjacent reproducible fail-open arises from the same boundary rule, fix it in this same batch.
5. Do NOT broaden into generic Unicode transliteration. Only the already-declared confusable pair/composite policy is in scope.
6. Reconcile any directly affected docs/audit text if needed. Do not churn unrelated documentation.

## SIX SUBAGENT LANES

Use exactly six non-duplicative lanes:

1. **boundary-root-cause** — prove the exact semantic contradiction and minimal correction.
2. **declared-label-matrix** — finite matrix across all declared sensitive labels/confusable pairs and preceding character classes.
3. **benign-false-positive** — adversarial benign controls and acceptance-preservation analysis.
4. **test-quality** — regression placement, tautology resistance, secret-hygiene, no weakened assertions.
5. **lsp-impact** — semantic references/definitions/hover and true blast radius from PR BASE/HEAD, not HEAD~1.
6. **maintainability-docs** — duplication/drift/docs contract impact limited to this causal change.

Primary Harness must adjudicate all six; subagent conclusions are evidence, not authority.

## LSP / REASONING GATE

PRIMARY-session semantic LSP is mandatory before implementation and after the candidate stabilizes. At minimum use `findReferences`, `goToDefinition`/`goToImplementation`, and `hover` on `_matches_sensitive_assignment_label`, `_contains_confusable_sensitive_assignment`, `_validate_text`, and materially relevant callers. HIGH is baseline. MAX is mandatory for the final boundary-semantics decision and any security-sensitive contradiction.

## IMPLEMENTATION CONSTRAINTS

- provider-neutral; no provider/network/Production behavior.
- detection-only hardening; retained/projected semantic text must remain byte-identical.
- exact runtime type discipline; deterministic behavior.
- no test weakening, suppressions, `type: ignore` to hide defects, lint silencing, skip/xfail, or coverage exclusions.
- preserve all recursive-revalidation and credential closures already present.
- keep changes bounded to allowed paths.

## QUALITY GATE

Run focused tests first, then FULL QG exactly:

```text
ruff check .
mypy src tests
pytest --cov=src/qore --cov-report=term-missing
```

Report exact counts, warnings, coverage, changed files, diff stats, PRIMARY LSP evidence, six-lane adjudication, HIGH/MAX audit evidence, durable checkpoint count, recovery-patch status, and a concise causal-closure argument.

## DELIVERABLE

Produce an artifact-only candidate patch and evidence package suitable for deterministic materialization onto PR #466. Final disposition must be exactly one of:

- `CANDIDATE READY — F-CODER-001 CAUSAL FAMILY CLOSED`
- `BLOCKED / FURTHER MATERIAL FAMILY FOUND`

Do not claim reviewer-chain completion. Any resulting qore-core HEAD mutation invalidates the prior Expert/Coder certifications and requires a new exact-head QG/freeze followed by Expert → IA → Coder → IA → Claude.
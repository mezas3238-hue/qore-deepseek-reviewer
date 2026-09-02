# QORE PR #466 — Harness Engineer F-CODER-001 Batch 009 RECOVERY-001

## ROLE / RECOVERY MODE

This is a **continuation** of `HARNESS-ENGINEER-PR466-9C5A5F6-F-CODER-001-BATCH-009`, not a fresh audit and not a new root-family pass. The predecessor failed only because the primary DSH process exited while waiting for subagent lanes 2, 3, and 4. Preserve all completed predecessor work below. Do **not** repeat completed reconstruction, reproduction, LSP-before, baseline tests, primary matrix, or lanes 1, 5, and 6.

Use semantic Python LSP, adaptive HIGH baseline -> MAX when material, durable checkpoints, recovery patch snapshots, focused adversarial tests, and FULL QG. Work artifact-only; do not push or mutate qore-core remote.

## IMMUTABLE START

- PR: #466
- BASE: `5a158ef0fb2e21db95f2be0685373780bf1ab197`
- START HEAD: `9c5a5f6c2befb62396563bac74ddd8a87760d23f`
- START TREE: `1c2b06effe269aec2b06c77d4344581c8d382d25`
- frozen synthetic before correction: `f6aa162754f781c41ad9418e3edccf1ca5b2f9bb`
- prior exact-head QG: run `33582654000`, job `100100024113`; Ruff PASS; Mypy PASS 753 source files; Pytest 5537/5537; 7 warnings; coverage 87%.
- Coder source finding: `F-CODER-001`, run `33618608265`.
- predecessor Harness run: `33628207511`, artifact `9845977138`, artifact digest `sha256:5298eec467cb880703327afc59531b07f5412ab18e196f812af1a5232784a1fd`.

## DURABLE PREDECESSOR STATE — MUST CARRY FORWARD

The predecessor produced checkpoint sequences 0-6 and an empty recovery patch (no edit had begun). Treat the following as already completed and authoritative unless the immutable binding changed:

1. Binding verified clean on exact START/TREE.
2. Defect reproduced:
   - `αtоken=PLAINTEXT-SECRET` (Greek alpha prefix + Cyrillic o in label) -> accepted/fail-open.
   - `xtоken=PLAINTEXT-SECRET` -> accepted/fail-open.
   - clean-boundary `tоken=...` -> rejected.
   - root cause: `_matches_sensitive_assignment_label` ends with `return index < 0 or not prefix[index].isalnum()`; the residual left boundary contradicts the existing complete-family-anywhere contract.
3. PRIMARY semantic LSP-before already done:
   - `_matches_sensitive_assignment_label` refs only at its in-file call site.
   - `_contains_confusable_sensitive_assignment` refs only in `_validate_text`.
   - registry `_validate_text` refs only at three in-file dataclass validation call sites.
   - blast radius is in `src/qore/infrastructure/instrument_universe_registry.py` only.
4. Primary matrix already run:
   - single-word labels `token/secret/password/bearer` with ASCII `x` or non-ASCII `α` prefix plus `=`/`:` fail open.
   - punctuation/whitespace/start reject.
   - composite `apikey` cells already reject through sibling composite path.
5. Focused baseline already green: 6 credential-related test files, **364 passed**.
6. Completed subagent lanes — DO NOT RELAUNCH:
   - Lane 1 boundary-root-cause: confirmed only confusable assignment path has the left boundary; minimal causal correction is `return True`; ASCII-only boundary is insufficient because `xtоken=` remains open. Benign `spоken=` stays benign; `notoken=` already rejected by marker path.
   - Lane 5 LSP-impact: in-file-only blast radius; detection-only; no retained/projected text rewrite; no public contract change.
   - Lane 6 maintainability/docs: no doc claims a left label boundary; no doc edit required; no table change required.

The predecessor primary session stopped with:
`PENDING NEXT ACTION: await/consume lanes 2,3,4 then synthesize + implement`

## RECOVERY SWARM CONTRACT

The logical engineering swarm for Batch 009 remains **exactly six lanes across the recovery lineage**. Lanes 1, 5, and 6 are completed above and MUST NOT be repeated. Relaunch **only** the missing lanes 2, 3, and 4:

- Lane 2 — declared-label matrix / family exhaustiveness: independently test all `_SENSITIVE_ASSIGNMENT_LABELS`, declared homoglyph substitutions, both assignment delimiters, and adversarial alphanumeric prefixes; identify any adjacent same-cause gap.
- Lane 3 — benign false-positive analysis: challenge the proposed removal of the left boundary with realistic benign substrings and prove whether any material false-positive regression is introduced under the already documented "complete family occurs anywhere" policy.
- Lane 4 — test-quality/adversarial design: specify the smallest strong regression/property matrix that proves `F-CODER-001` closed without merely hard-coding the two witnesses.

Do not launch substitute/redundant lanes for 1, 5, or 6. After all three recovery lanes return, synthesize the six-lane evidence set before editing.

## IMPLEMENTATION TARGET

If the recovery lanes do not falsify the predecessor conclusion, apply the minimum causal production change in `_matches_sensitive_assignment_label`: after successfully consuming the complete expected label backwards, do not impose a left token boundary. The likely minimal implementation is `return True`.

Do **not** use an ASCII-only left boundary; it is already independently falsified by `xtоken=`.

Add focused normal/adversarial/property or parameterized tests covering at minimum:
- `αtоken=` and `xtоken=`;
- all declared single-word sensitive assignment labels with at least ASCII and non-ASCII alphanumeric prefix classes;
- `=` and `:`;
- declared homoglyph substitutions sufficient to prove the matcher table is honored;
- benign near-miss controls that do not contain a complete sensitive family;
- byte-identical retention/projection remains untouched.

If lanes 2/3/4 find a materially adjacent same-cause defect, close it in this bounded batch rather than hiding it.

## LSP / REASONING / MEMORY REQUIREMENTS

- Do not repeat LSP-before. Perform PRIMARY semantic LSP during impact confirmation if needed and mandatory LSP-after on the changed symbol/caller/validation surface.
- HIGH baseline; escalate to MAX for security-sensitive ambiguity, false-positive policy contradiction, or any broader-than-one-line causal correction.
- Append durable checkpoints beginning from a new sequence that clearly references predecessor checkpoint sequence 6. Record each recovered lane result, synthesis decision, each coherent mutation, targeted test result, LSP-after, and final disposition.
- Refresh recovery patch after every coherent code/test/doc mutation.
- `PENDING NEXT ACTION` and `SAFE RESUME INSTRUCTION` are mandatory in every checkpoint.

## QUALITY GATE

After focused tests, run FULL QG exactly:

```text
ruff check .
mypy src tests
pytest --cov=src/qore --cov-report=term-missing
```

No test weakening, suppressions, unjustified skips/xfail, type ignores to hide defects, lint silencing, or coverage exclusions.

## DELIVERABLE

Produce an artifact-only candidate patch and evidence package suitable for exact materialization. Final disposition must be exactly one of:

- `CANDIDATE READY — F-CODER-001 CLOSED`
- `BLOCKED / FURTHER MATERIAL FAMILY FOUND`

Report inherited lanes 1/5/6 separately from newly executed lanes 2/3/4 so no completed work is falsely claimed as newly rerun.
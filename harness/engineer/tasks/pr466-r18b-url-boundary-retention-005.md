# PR466 Harness Principal Engineer — R18B URL-boundary retention correction 005

Work only against qore-core PR #466 exact start:
- HEAD: `63ca01f3c38fd0f0be875f455d561a3fc306eceb`
- TREE: `3427fdff0acc321d6309ff9223c53f9ba2a7f7d6`
- PR must remain OPEN / DRAFT on branch `agent/qore-umi14-corr-umi13-recursive-revalidation-001`.

## Mission
Close the single material Expert R18B finding without reopening any previously accepted F1-F5 closure. Produce one coherent artifact-only candidate, not a narrow test patch.

Expert R18B established a URL-boundary interaction defect: the URL-specific detection skeleton removes an already-in-contract printable filler before evaluating a scheme-relative authority boundary. That deletion can concatenate an alphanumeric prefix directly with a later `//` authority start, causing the boundary test to miss an otherwise detectable URL userinfo occurrence.

## Required correction properties
1. Preserve the URL-specific semantic boundary while keeping the existing fail-closed credential/text contract.
2. Do not rewrite retained/projected source text; any sentinel or placeholder must be detection-only.
3. Preserve all prior URL protections: ordinary authorities, scheme-relative authorities, multiple authorities, slash confusables, NFKC-created terminators, real ASCII terminators and real whitespace semantics.
4. Preserve F1 historical substring semantics for supported composite credential families.
5. Preserve F2 exact non-printable fail-closed behavior.
6. Preserve F3 category-Pd folding and bounded non-Pd residual delimiter classes already accepted.
7. Preserve F4 bounded homoglyph composite and bearer-scheme detection.
8. Preserve F5 both Greek lunate sigma cases before NFKC.
9. Preserve recursive retained-state re-entry/projection and benign printable-Unicode byte retention.
10. No universal transliteration and no broad punctuation policy expansion.

## Adversarial verification
Cover the R18B root cause as a family, not just one literal witness. Verify the same interaction with every already-declared printable filler source/equivalent where applicable, with both direct construction and retained-state re-entry/projection, and with reason/evidence text surfaces that use the common validator. Verify benign source text containing those fillers outside the sensitive URL pattern remains accepted and byte-identical.

Also falsify adjacent ordering interactions among root folding, NFKC, casefold, NFD, mark/filler handling, URL-specific sentinels, scheme-relative boundary recognition and multi-authority scanning. If another same-root bounded defect is found, correct it in this same package and add permanent regressions rather than returning one finding at a time.

## Tooling and gates
- Mandatory semantic LSP before first production edit and again after edits.
- Use adaptive HIGH->MAX reasoning as host-selected; this is security/Unicode/state-integrity work and MAX evidence is expected when selected by policy.
- Run focused probes/tests during implementation.
- Return only when the candidate is ready for the external deterministic FULL QG.
- External gate must pass: `ruff check .`, `mypy src tests`, `pytest --cov=src/qore --cov-report=term-missing`.
- Do not weaken tests, suppress lint/type failures, add skips/xfail, or game coverage.
- No commit, push, merge, PR publication, Production authority or network research.

## Allowed Core paths
- `src/qore/infrastructure/instrument_universe_registry.py`
- `tests/infrastructure`
- `docs/architecture`
- `docs/audits`

Final response must include the candidate marker required by the Principal Engineer wrapper and concise LSP evidence.
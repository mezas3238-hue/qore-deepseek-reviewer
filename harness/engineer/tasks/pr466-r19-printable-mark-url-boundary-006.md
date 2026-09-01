# PR466 Harness Principal Engineer — R19 printable-mark URL-boundary root closure 006

Work only against qore-core PR #466 exact start:
- HEAD: `cda1eb8d9b53dee456e7c3639d76de7e63fbd7c8`
- TREE: `ec80768a9c6c5c585bf743fdfcd1ee50e8b871e3`
- PR must remain OPEN / DRAFT on branch `agent/qore-umi14-corr-umi13-recursive-revalidation-001`.

## Mission
Close the independently adjudicated material Expert R19 finding `QORE-PR466-CDA1EB8D-DS-EXPERT-R19-1` at the root, while retaining the accepted R18B filler-boundary correction and every previously accepted F1-F5 / R8-R10 closure. Produce one coherent artifact-only candidate, not a literal-witness patch.

## Independently reproduced failure
Exact witness:

```python
InstrumentUniverseReason("Evidence\uFE0F//alice:password@example.invalid/evidence")
```

`U+FE0F VARIATION SELECTOR-16` is printable and category `Mn`. The current `_credential_detection_skeleton` removes every `Mn/Mc/Me` character unconditionally, including when `preserve_invisible_fillers=True`. Both URL-specific skeletons therefore erase the real source boundary and produce `evidence//alice:password@example.invalid/evidence`. `_contains_url_userinfo` then rejects the scheme-relative `//` as an authority start because its negative lookbehind sees the preceding ASCII `e`.

Integration Authority independently reproduced the deterministic mechanism: source is printable; NFKC -> casefold -> NFD retains U+FE0F as `Mn`; mark filtering removes it; the resulting URL regex does not match. This is MATERIAL VALID and Coder is blocked.

## Root-cause contract
R18B was not merely about the five named fillers. The root cause is deletion, before URL-boundary evaluation, of an accepted printable source character that semantically separates an alphanumeric prefix from a scheme-relative authority start. The R18B correction preserved known invisible fillers, but printable marks remain erased by the same URL-boundary skeleton.

Correct the bounded root-cause family, including at minimum:
- `U+FE0F VARIATION SELECTOR-16`;
- `U+034F COMBINING GRAPHEME JOINER` if printable under the runtime contract;
- representative visible combining marks such as `U+0301 COMBINING ACUTE ACCENT` when placed immediately before a scheme-relative `//user:pass@host` boundary;
- other constructible printable `Mn/Mc/Me` representatives that exercise the identical deletion-before-boundary mechanism.

Do not turn this into universal Unicode transliteration. The target is preservation of source boundary semantics for URL-userinfo detection.

## Required correction properties
1. URL-boundary detection must preserve the semantic fact that an accepted printable non-alphanumeric/non-slash source character existed immediately before a scheme-relative authority start, even if another detection path removes that character for credential-label normalization.
2. Keep the general credential skeleton's mark-removal behavior intact where it is required to close printable-mark obfuscation inside sensitive labels such as `token\uFE0F=...`.
3. Keep the existing filler-removing URL skeleton because it closes fillers placed between authority slashes, inside userinfo and inside schemes.
4. Keep the accepted R18B filler-preserving behavior for U+115F/U+1160/U+3164/U+FFA0/U+2800.
5. Preserve R8 multi-authority scanning, R9 slash-confusable semantics, R10 NFKC-created terminator sentinels, real ASCII `/ ? #` terminators and real whitespace termination semantics.
6. Preserve F1 composite-family historical substring semantics; F2 non-printable fail-closed gate; F3 Pd and accepted residual delimiter folding; F4 bounded homoglyph / bearer protections; F5 both lunate-sigma cases.
7. Do not rewrite valid retained/projected source text. Any placeholder/sentinel/extra skeleton is detection-only.
8. Preserve recursive retained-state revalidation for reason, evidence `source_name`/`locator`, record, entry, snapshot, lookup and logical projections.
9. Preserve exact runtime types, canonical local `StrEnum` state, imported `IdentityFamilyCode`, deterministic ordering, `bool != int`, no subclass laundering.
10. No provider/AI dependency in Core, no hidden retry/sleep/scheduler/thread effect, no Risk bypass, no Production or real-capital authority.

## Adversarial verification
Treat this as a root-family closure, not a three-code-point checklist. Before finalizing, falsify interactions among:
- root folding;
- NFKC / casefold / NFD;
- mark removal;
- invisible-filler handling;
- URL-specific authority-terminator sentinels;
- slash confusables;
- scheme-relative negative-lookbehind boundary recognition;
- multiple authorities in one retained value.

Permanent regression evidence must include construction plus retained-state re-entry/projection for reason and evidence text surfaces, and benign controls proving printable marks outside credential-like URL syntax remain accepted and byte-identical. Include cases where marks occur before `//`, between slashes, inside userinfo, inside schemes, and in benign URL-ish/path text so the correction does not accidentally weaken earlier detection or over-reject valid text.

If you discover another constructible same-root bounded variant during this work, close it in the same artifact rather than returning a narrow patch.

## Tooling and gates
- Mandatory semantic LSP before the first production edit and again after edits. Demonstrate real semantic operations such as references/hover/definition against the changed symbols.
- Adaptive HIGH -> MAX reasoning is mandatory as host-selected; this is security/Unicode/state-integrity work and MAX must be used when the controller selects it.
- Run focused adversarial probes during implementation.
- Run canonical FULL QG before returning: `ruff check .`; `mypy src tests`; `pytest --cov=src/qore --cov-report=term-missing`.
- Do not weaken tests, suppress lint/type failures, add skips/xfail, or game coverage.
- Artifact only: no Core commit, push, PR publication, merge, Expert/Coder/Claude dispatch, Production authorization or network research.

## Allowed Core paths
- `src/qore/infrastructure/instrument_universe_registry.py`
- `tests/infrastructure`
- `docs/architecture`
- `docs/audits`

Final response must include the candidate marker required by the Harness Engineer wrapper, concise semantic-LSP evidence, adaptive reasoning evidence, focused-test evidence, FULL QG evidence, changed-file/diff bounds, and an explicit statement whether the complete R19/R18B root-cause family is closed without reopening prior accepted closures.
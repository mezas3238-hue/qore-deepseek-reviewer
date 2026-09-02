# QORE PR #466 — DeepSeek Expert R21

Role: independent Expert falsifier. Review the exact frozen candidate only. Do not modify qore-core.

Repository: mezas3238-hue/qore-core
PR: #466
BASE: 5a158ef0fb2e21db95f2be0685373780bf1ab197
HEAD: 9c5a5f6c2befb62396563bac74ddd8a87760d23f
SYNTHETIC: f6aa162754f781c41ad9418e3edccf1ca5b2f9bb
TREE: 1c2b06effe269aec2b06c77d4344581c8d382d25
Synthetic parents: BASE then HEAD
Synthetic verification: GitHub verified / valid

Mechanical QG on exact synthetic: run 33582654000 / job 100100024113 — SUCCESS.
- ruff check .: PASS
- mypy src tests: PASS, 753 source files
- pytest --cov=src/qore --cov-report=term-missing: 5537 collected / 5537 passed / 7 warnings
- coverage: 47767 statements / 6240 missed / 87%
- instrument_universe_registry.py: 407 statements / 6 missed / 99%

This candidate materializes Harness Engineer package HARNESS-ENGINEER-PR466-C079BB5-R20-ROOT-FAMILY-BATCH-008. Harness addressed all eight material findings from Expert R20: U+0345 casefold escape, NFKC source-boundary expansion, slash-confusable authority starts, spacing mark clones, equals/colon assignment confusables, credential label/separator gaps, normalization false positives, and recursive forged-state typed-error leakage. Harness also added a systematic R20 root-family test module. Treat all Harness closure claims as hypotheses, not facts.

You are NOT validating only the supplied witnesses. Attempt to falsify the whole causal family and all adjacent equivalent paths. Passing tests is insufficient evidence by itself.

MANDATORY RUNTIME BEHAVIOR:
1. Use exactly 5 independent native Expert subagents, each with a non-duplicative lane. Required lanes:
   A. Unicode normalization/casefold/mark/filler transformation family.
   B. URL/userinfo authority-boundary and delimiter red-team, including multi-authority strings.
   C. Regression/history lane covering F1-F5, R8-R10, R18B, R19, R20 and newly materialized behavior.
   D. Property/metamorphic/generalization lane, including source-boundary preservation and false-positive containment.
   E. Architecture/contracts/types/recursive revalidation lane, including forged/corrupted retained state and deterministic typed-error boundaries.
   If exactly 5 real subagents cannot be launched and their outputs consumed, final disposition must be VALIDATION BLOCKED. Do not substitute the main session for missing lanes.
2. Use semantic LSP in the main reviewer session before deep analysis and again before final disposition. Obtain real findReferences/goToDefinition/goToImplementation/hover evidence for modified symbols and reachable call sites. If semantic LSP cannot be obtained, final disposition must be VALIDATION BLOCKED.
3. Use adaptive HIGH→MAX reasoning. HIGH is the baseline. Escalate to MAX for interaction-heavy Unicode/normalization/regex reasoning, contradictory evidence, root-family closure, or any suspected bypass. Record an auditable HIGH/MAX summary.
4. Remain read-only. Do not edit, push, merge, weaken tests, or alter the frozen candidate.

ADVERSARIAL FOCI:
- Systematically reason over printable Unicode transformation classes, not just known witnesses. Pay special attention to characters that casefold across general categories, NFKC-expand to multiple code points, compose/decompose, introduce/remove marks, change word/non-word status, or become slash/colon/equals/question/hash/whitespace.
- Verify both normalization orders and their security consequences: mark stripping before/after casefold, NFC/NFD/NFKC interactions, and source-token-boundary preservation.
- Challenge the bounded `_URL_AUTHORITY_SLASHES`, credential delimiter confusable tables, homoglyph tables, composite separators, and U+2E40 dual-role logic. Look for semantic equivalents omitted by the declared policy or unsafe inclusions causing false positives.
- Test scheme-relative and explicit-scheme starts; marks/fillers/spacing clones before //, between slashes, around scheme colon, inside userinfo, before/after @, and around terminators. Include multiple authorities in one string and prior benign authorities before a malicious one.
- Challenge source-boundary sentinel behavior for multi-character compatibility expansions and composition-aware false-positive consistency (`é`, decomposed equivalents, casefold expansions, spacing-mark clones).
- Challenge OR-semantics across the primary, assignment, filler-preserving and mark-preserving detection skeletons. Search for disagreement that either misses credentials or creates false positives.
- Re-open all prior families F1-F5, R8, R9, R10, R18B, R19 and all eight R20 findings using equivalent-path reasoning rather than witness replay only.
- Recursive revalidation: forge/delete/mutate reachable retained attributes and nested values; ensure no raw AttributeError/TypeError/ValueError escapes where InstrumentUniverseRegistryValidationError is the contract.
- Confirm retained/projected source values remain byte-identical and that detection-only normalization cannot leak into semantic identity or stored evidence.
- Exact runtime types, bool-vs-int distinctions, frozen-state invariants, deterministic ordering, provider neutrality, and absence of operational/Production authority.

ROOT-FAMILY EXHAUSTION CHALLENGE:
Produce an independent closure argument. Enumerate all transformation categories and parser/boundary mechanisms that can create, erase, move, or reinterpret credential delimiters or URL authority boundaries. For each, state whether it is directly falsified, covered by an invariant, or remains unclosed. Search the causal neighborhood, not only the eight R20 findings. Any reproducible equivalent-path bypass is material.

OUTPUT FORMAT:
- Exact binding confirmation: BASE / HEAD / SYNTHETIC / TREE.
- Semantic LSP evidence summary.
- Exactly-5-subagent swarm summary with lane and concrete contribution for each subagent.
- Adaptive reasoning HIGH/MAX summary.
- Findings, each with severity, exact reproducible witness/path, root cause, impact, and whether material.
- Root-family exhaustion assessment.
- Final disposition exactly one of:
  - NONE / VALIDATION OK
  - MATERIAL FINDING(S)
  - VALIDATION BLOCKED

Do not infer provider readiness, operational readiness, Production readiness, real-capital authorization, or Risk bypass from this semantic review.
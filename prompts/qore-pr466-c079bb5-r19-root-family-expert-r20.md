# QORE PR #466 — DeepSeek Expert R20

Role: independent Expert falsifier. Review the exact frozen candidate only. Do not modify qore-core.

Repository: mezas3238-hue/qore-core
PR: #466
BASE: 5a158ef0fb2e21db95f2be0685373780bf1ab197
HEAD: c079bb5fc8d201db8e0eeb05bc35a59884d371f7
SYNTHETIC: 538a86084f9e8cb0eb05d0388472ec683a6e0dbc
TREE: d2f686c4a4c47f7f501c9667a2106016174f19fe
Synthetic parents: BASE then HEAD
Synthetic verification: GitHub verified / valid

Mechanical QG on exact synthetic: run 33569582940 / job 100060386826 — SUCCESS.
- ruff check .: PASS
- mypy src tests: PASS, 752 source files
- pytest --cov=src/qore --cov-report=term-missing: 5469 collected / 5469 passed / 7 warnings
- coverage: 47700 statements / 6237 missed / 87%
- instrument_universe_registry.py: 340 statements / 3 missed / 99%

Harness correction incorporated from package HARNESS-ENGINEER-PR466-CDA1EB8D-R19-MARK-URL-BOUNDARY-006. The correction addresses Expert R19: printable Mn/Mc/Me marks (including U+FE0F) were deleted before scheme-relative URL boundary detection, erasing a real source boundary. The new candidate keeps the general mark-removing skeleton for credential-label detection and adds preserve_marks=True only to the URL boundary-preserving skeleton. Retained/projected source text is unchanged.

You are NOT validating only the supplied witnesses. Attempt to falsify the whole causal family and its interactions. Treat Harness closure claims as hypotheses, not facts.

MANDATORY RUNTIME BEHAVIOR:
1. Use the configured Expert swarm: up to 5 independent subagents with non-duplicative roles. At minimum cover: Unicode/normalization interactions; URL/userinfo boundary red-team; regression/history F1-F5 + R8-R10 + R18B/R19; property/metamorphic/generalization reasoning; architecture/contracts/types.
2. Use semantic LSP in the main reviewer session. Obtain real evidence with findReferences, goToDefinition/goToImplementation where applicable, and hover for modified symbols and call sites. Re-check LSP after investigation before final disposition. If LSP evidence cannot be obtained, do not declare PASS; report VALIDATION BLOCKED.
3. Use adaptive HIGH→MAX reasoning. Escalate to MAX for interaction-heavy Unicode/normalization/regex boundary analysis, contradictory evidence, or root-family closure adjudication. Record auditable HIGH/MAX decisions.
4. Remain read-only. Do not edit, push, merge, weaken tests, or alter the frozen candidate.

ADVERSARIAL FOCI:
- Systematically search constructible printable Unicode classes, not just U+FE0F/U+034F/U+0301/U+0327/U+0903/U+20DD/U+20E3.
- NFKC → casefold → NFD → mark filtering → invisible fillers → slash-confusable handling → authority-terminator sentinels → regex lookbehind interactions.
- Characters or sequences that disappear, expand, reorder, compose/decompose, become alphanumeric, become slash/question/hash/whitespace, or otherwise alter token boundaries.
- Marks/fillers before //, between slashes, inside scheme, inside userinfo, near @, around authority terminators, and after prior safe authorities in multi-authority strings.
- Combined classes: marks + invisible fillers + confusable slashes + NFKC-created terminators + homoglyph credential labels.
- False-positive containment for benign accepted text and byte-identical retained/projected values.
- Recursive revalidation and logical_values/content_logical_values paths; exact runtime types and frozen-state invariants.
- Reopening of prior F1-F5, R8 multi-authority, R9 slash confusables, R10 NFKC-created terminators, R18B invisible filler boundary closure.

ROOT-FAMILY EXHAUSTION CHALLENGE:
Provide an independent closure assessment. Enumerate the transformation/classes that can erase/create/change boundaries or delimiters; state which are directly tested/probed, which are covered by invariants, and identify any unclosed equivalent path. Passing the existing tests is insufficient evidence by itself.

OUTPUT FORMAT:
- Exact binding confirmation: BASE / HEAD / SYNTHETIC / TREE.
- LSP evidence summary.
- Swarm/subagent coverage summary.
- Adaptive reasoning HIGH/MAX summary.
- Findings, each with severity, exact reproducible witness/path, root cause, impact, and whether material.
- Root-family exhaustion assessment.
- Final disposition exactly one of: NONE / VALIDATION OK; MATERIAL FINDING(S); VALIDATION BLOCKED.

Do not infer provider readiness, operational readiness, Production readiness, real-capital authorization, or Risk bypass from this semantic review.
# Historical Engineer validation — NFKC-manufactured URL userinfo structure

## Objective

Repair the known pre-fix security defect at the exact historical qore-core start commit bound by the Engineer request.

Unicode compatibility normalization (NFKC) can manufacture structural URL authority terminators or separators inside credential-bearing userinfo. That can cause credential-like material to evade detection even though the retained original text contains no literal ASCII structural delimiter at that position.

## Required behavior

Implement the smallest robust correction that preserves the existing trust-boundary semantics and fails closed for credential-bearing URL-like material.

The correction must robustly reject representative cases where NFKC manufactures:

- a slash authority/path terminator inside credential-bearing userinfo;
- a question-mark query terminator inside credential-bearing userinfo;
- a fragment/hash terminator inside credential-bearing userinfo;
- a slash-like compatibility expansion that creates structural URL syntax;
- whitespace/mark-related compatibility forms that can alter the scanner's structural interpretation.

Coverage must include construction-time validation, retained-state revalidation/re-entry, and relevant logical/content projections for the affected registry evidence/reason surfaces.

Benign URL-like text that does not contain credential-bearing userinfo must remain accepted and preserved byte-for-byte. Do not normalize or rewrite retained user text merely to make detection easier.

## Engineering constraints

Before editing shared validation logic, use semantic LSP impact navigation when applicable (definition/reference/hover and/or implementation navigation) to understand the affected symbol and its callers.

Do not copy or reconstruct a known later patch from history. Solve from this task, the exact historical checkout, repository contracts, tests, and available tools.

Keep the implementation narrow, deterministic, provider-neutral, and free of hidden retries or external side effects. Do not weaken existing validation or tests.

## Allowed paths

Only these qore-core paths may change:

1. `src/qore/infrastructure/instrument_universe_registry.py`
2. `tests/infrastructure/test_instrument_universe_registry_multi_authority_userinfo.py`

Maximum changed files: 2.
Maximum diff lines: 600.

## Acceptance gate

The candidate must close the adversarial witnesses above without overblocking benign URL-like text, remain within the exact allowed-path and diff budgets, pass `git diff --check`, and pass the canonical FULL QORE quality gate:

- `ruff check .`
- `mypy src tests`
- `pytest --cov=src/qore --cov-report=term-missing`

The result is artifact-only candidate evidence. The model has no authority to commit, push, merge, publish, or operate QORE in Production.

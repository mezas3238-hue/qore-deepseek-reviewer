---
name: qore-testing-quality-gate
description: QORE testing discipline for normal, adversarial, regression, and deterministic FULL quality-gate evidence.
whenToUse: Load before writing tests or deciding whether an implementation is complete.
user-invocable: false
---
# QORE testing and quality discipline

For implementation work:
- Add normal and adversarial tests for the exact defect/contract and nearby bypass classes.
- Reproduce material defects with the smallest deterministic witness before fixing them when possible.
- Do not weaken tests, use unjustified skip/xfail, hide defects with `type: ignore`, silence lint, or exclude new code from coverage to pass CI.
- During the model run, prefer targeted tests and focused probes while iterating.
- The external deterministic gate will run the canonical FULL QG after the model returns:
  1. `ruff check .`
  2. `mypy src tests`
  3. `pytest --cov=src/qore --cov-report=term-missing`
- A green targeted test is not a substitute for FULL QG, and green FULL QG is mechanical evidence rather than independent semantic review.

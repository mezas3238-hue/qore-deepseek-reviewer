# QORE TRADER STORY FORENSICS — ELEVEN-MARKET RECOVERY 005

## Purpose

This is a bounded continuation of `HARNESS-ENGINEER-QORE-TRADER-STORY-FORENSICS-ELEVEN-MARKET-RECOVERY-004`. Do NOT restart the six completed Harness engineering lanes and do NOT repeat broad discovery.

Immutable qore-core binding:
- START `18dc5736a28369ffb7bc1cfd0fccabb2334b208b`
- TREE `4a897527d3d3250ddaaddf89009f04d18decae88`

Recover only from host-verified artifact `10156092661` and its exact candidate patch SHA-256 `117f1c766564f383b373da2aa01dc297603269a6ce2c39e55ccd48b7c1ac3dd2`.

## Preserved completed work

The predecessor evidence proves Harness engineering lanes 1–6 are `COMPLETED`. Preserve them verbatim. They are not pending work.

The predecessor Internal Expert found a NEW trust-boundary causal family after those six lanes were complete. Its first audit reproduced that `_validate_panel` revalidates schema/dossier digest/evidence index/frozen dossier but accepts mutated panel-owned identity/authority labels. The bounded witnesses include at least:
- `panel["trader_code"]` can diverge from `frozen_dossier["trader_code"]` and is propagated by reviewer packet / synthesis;
- `panel["research_only"]` can be mutated without fail-closed rejection;
- `panel["execution_authority"]` can be mutated without fail-closed rejection;
- `panel["required_markets"]` can diverge from the canonical/frozen eleven-market universe without fail-closed rejection.

The predecessor reported that it had applied four corresponding repairs and reached 44 focused tests green, but that session timed out during the mandatory fresh five-lane post-repair re-audit. Those repair mutations were not durably recovered into the host candidate patch, so this recovery MUST reproduce the four witnesses against the restored candidate and re-apply the smallest complete fail-closed repair if still present. Do not trust the prose assertion that repairs existed; prove each witness on the restored candidate first.

## Internal Expert-only mission

1. Restore the exact candidate from artifact 10156092661.
2. Reproduce only the four bounded panel identity/authority witnesses above using semantic LSP and executable adversarial tests.
3. Apply the smallest complete fail-closed repair so panel-owned labels are cryptographically/semantically bound to the frozen dossier/canonical eleven-market contract, without weakening existing checks.
4. Add/retain adversarial tests for every repaired dimension plus benign controls.
5. Run focused tests, Ruff, Mypy on touched Trader Lab surfaces.
6. Run a fresh five-lane Internal Expert post-repair audit. Every lane must terminate durably; no queued/running lane counts as complete.
7. If and only if the exact final candidate is clean, emit literal terminal markers:
   - `HARNESS_INTERNAL_EXPERT_STATUS: CLEAN`
   - `HARNESS_DUAL_ROLE_STATUS: ENGINEER_COMPLETE + INTERNAL_EXPERT_CLEAN`
8. Then allow host FULL QG on the exact final candidate:
   - `ruff check .`
   - `mypy src tests`
   - `pytest --cov=src/qore --cov-report=term-missing`

## Hard laws

- Six completed Harness engineering lanes MUST NOT be rerun.
- No broad new 11-market exploration; this recovery is only the unresolved Internal Expert closure family and post-repair re-audit.
- Any final mutation invalidates prior QG and requires exact-candidate re-audit/QG.
- A timeout or missing structured markers means `RECOVERY_REQUIRED`, never CLEAN.
- Preserve decision-time vs oracle separation, holdout governance, TradingView visualization-only boundary, and no DEMO/LIVE/Production/real-capital authority expansion.

## Completion

Complete only when: six Harness lanes remain preserved; four bounded witnesses are closed with tests; all five fresh Internal Expert lanes are terminal; Internal Expert CLEAN is durably recorded; dual-role status is complete; exact candidate patch is bound; and canonical FULL QG passes on that exact candidate.

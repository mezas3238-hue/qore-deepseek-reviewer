# HARNESS ENGINEER — QORE CIBO COGNITIVE SUPERARCHITECTURE — FINAL INTEGRATION CORRECTION 001

## PACKAGE
`HARNESS-ENGINEER-QORE-CIBO-COGNITIVE-SUPERARCHITECTURE-001-FINAL-INTEGRATION-CORRECTION-001`

## EXECUTIVE SCOPE
This is the ONLY active QORE engineering line. Functions #483, Trader Lab #473 and Specialized Traders #470 are paused. Do not touch them.

Continue from the already-composed exact CIBO Cognitive candidate. DO NOT restart Batch 006 or Batch 008 and DO NOT reconstruct completed work.

Exact START: `262285ca8a0a3cd4c4c196f73249971514278774`
Exact START TREE: `24a7423bb25bbd4096fd8af5004ddd0877fe4829`
PR context: qore-core #486, but Harness remains artifact-only: no push/commit/merge.

The START is the byte-exact composition of:
- durable Batch 006: run `33695704703`, artifact `9873332600`, patch SHA256 `8b192928a10aa33633db63581a4af61cbd04bef3b058d0b171baf145ee071080`;
- durable Batch 008 / Correction-001: run `33760443704`, artifact `9896355933`, patch SHA256 `4b3072fc60e4dae42d8de5ebdf041f78e19da08cd4e31dffb15c9c157b4dca63`.

The composed candidate is 27 Cognitive-only files, +8731/-0 versus main.

## WHY THIS CORRECTION EXISTS
Independent Integration Authority composition audit found that the two individually useful predecessors are not yet a certifiable whole.

### IA-COG-FINAL-001 — Reverse ownership dependency from Cognitive into Functions/Trader Manager
Batch 006 `cibo_executive_journal` / tests reuse `qore.infrastructure.cibo_trader_capability_profile.CiboEvidenceRef`. That type belongs to the Trader Manager / Functions lineage. #482 law is explicit:
- Cognitive = HOW CIBO THINKS;
- Functions = WHAT CIBO DOES;
- Cognitive must not depend on #479/#480 implementation;
- later composition occurs through explicit certified interfaces.

The current composed PR also fails Ruff because the old test import ordering exposes this dependency. Do NOT merely reorder imports. Remove the semantic reverse dependency at its root while preserving economic-journal link semantics using Cognitive-owned/provider-neutral evidence references/contracts.

Hard law: `COGNITIVE CORE != FUNCTIONS/TRADER-MANAGER IMPLEMENTATION DEPENDENCY`.

### IA-COG-FINAL-002 — Batch 006 exact-runtime-type law was never hardened by Correction-001
Batch 008 Correction-001 hardened its own files, but Batch 006 still contains permissive `isinstance(...)` trust-boundary checks for UUID, datetime, enums, strings, tuples and Cognitive value objects. The docs claim exact runtime types/no subclass laundering. Exhaust the full Batch 006 root family and all composition call paths.

At identity/evidence/authority/deterministic trust boundaries require exact runtime types where the canonical law requires them (`type(x) is T`, including `bool != int`) and recursively revalidate nested retained objects. Do not mechanically replace every `isinstance` where polymorphism is intentionally part of a safe non-trust-boundary protocol; justify any retained polymorphic check.

Adversarially falsify:
- UUID subclasses;
- datetime subclasses and hostile tzinfo/astimezone behavior where material;
- StrEnum / enum subclasses and raw-string equality laundering;
- dataclass/value-object subclasses overriding equality, properties or logical values;
- tuple/list subclass and mutable-container laundering;
- string/int/bool subclasses at canonical fields;
- reflective nested corruption followed by revalidation;
- direct-constructor parity with builders/operations.

### IA-COG-FINAL-003 — Final Batch006 + Batch008 integration gate is missing
#482 requires a final Cognitive Integration Gate that reconciles Batch 006 + Batch 008 and falsifies CA-01..CA-18 as ONE Cognitive system before Expert.

Do not satisfy this with documentation-only claims. Use semantic LSP across both predecessor families and determine the minimal explicit provider-neutral integration seam needed so the executive brain/memory/deliberation/journal substrate can consume or bind the world-model/attention/planning/tool-faculty/replay/evaluation substrate without duplicating Functions and without creating authority.

If an explicit integration contract/module is required, the allowed new path is:
- `src/qore/infrastructure/cibo_cognitive_integration.py`
- `tests/infrastructure/test_cibo_cognitive_integration.py`

The integration must be deterministic, immutable, exact-version/evidence/fingerprint bound, replayable, and authority-free. It must preserve disagreement, uncertainty, provenance and source evidence. It must not create a new business function, Trader Manager, Risk decision, provider order, execution authority, DEMO eligibility, Production authority or real-capital authority.

Hard laws:
- `INTELLIGENCE != AUTHORITY`
- `REASONING != EXECUTION`
- `SUMMARY != SOURCE EVIDENCE`
- `COUNCIL != FAKE CONSENSUS`
- `MEMORY != SILENT SELF-REWRITE`
- `MODEL PROVIDER != CIBO SEMANTICS`

## SIX-LANE CONTRACT — EXACTLY 6/6
Use exactly six non-duplicative lanes and retain durable checkpoints.

L1 — Architecture / ownership / dependency graph
- semantic LSP on all Batch006 + Batch008 modified symbols;
- prove no Cognitive -> Functions/Trader Manager concrete implementation dependency remains;
- define minimal integration seam and call graph.

L2 — Exact-runtime-type / subclass laundering red team
- exhaust IA-COG-FINAL-002 across all trust boundaries;
- direct-constructor + reflective corruption + hostile subclasses.

L3 — Evidence / provenance / memory / journal integrity
- economic links, evidence refs, freshness, timestamps, source identities, secret hygiene;
- no invented evidence; no hindsight mutation; no alias/mutation leakage.

L4 — Cross-substrate integration / property + metamorphic exploration
- Batch006 brain/memory/deliberation with Batch008 world model/attention/planning/tools/replay/evaluation;
- same input => same output; permutation/canonicalization; mismatch/stale/contradictory/absent evidence; replay equivalence.

L5 — Authority / security / boundary falsifier
- prove no Risk/provider/order/promotion/DEMO/LIVE/Production/real-capital authority can be minted through integration;
- dialogue/opinion/recommendation remains advisory.

L6 — Regression / CA-01..CA-18 closure / implementation impact
- map every CA-01..CA-18 disposition to concrete implementation/tests or explicit evidence-dependent seam;
- verify old Batch006 and Batch008 tests plus new integration tests;
- inspect references/callers after changes with LSP.

Failure to provide evidence for 6/6 lanes => BLOCKED.

## SEMANTIC LSP REQUIRED
Before and after implementation, record concrete evidence for relevant modified symbols using:
- findReferences
- goToDefinition
- goToImplementation where applicable
- hover
- symbol/call-site inspection

Grep-only work is insufficient.

## ROOT-FAMILY EXHAUSTION
This is a final Cognitive integration correction. Exhaust neighboring causal families, not only the first Ruff witness. Required result is one of:
- `CANDIDATE READY — COGNITIVE ROOT FAMILY EXHAUSTED`
- `BLOCKED / FURTHER MATERIAL COGNITIVE FAMILY FOUND`

## REQUIRED TESTS
Add focused adversarial tests for every material correction and integration invariant. Tests must prove rejection, not merely mirror constructors.

At minimum include:
- no imports from `cibo_trader_capability_profile`, Trader Manager, Trader Lab or specialized Trader implementation in Cognitive candidate paths;
- exact-type/subclass laundering failures across Batch006 boundaries;
- recursive revalidation after reflective corruption;
- cross-Batch identity/version/fingerprint mismatch rejection;
- stale/future/naive timestamp rejection where applicable;
- deterministic composition/replay;
- disagreement and uncertainty preservation;
- missing/contradictory evidence fail-closed;
- no authority-bearing output created by integrated cognition.

## FULL QG — MANDATORY
Run and report exactly:
- `ruff check .`
- `mypy src tests`
- `pytest --cov=src/qore --cov-report=term-missing`
- `git diff --check`

No weakening tests, no skip/xfail concealment, no `type: ignore` concealment, no unjustified Ruff suppression, no mypy weakening, no coverage gaming.

## ARTIFACT-ONLY OUTPUT
Do not push, commit or merge qore-core. Deliver patch + exact hashes + changed-file list + six-lane evidence + semantic LSP evidence + focused tests + FULL QG + CA-01..CA-18 closure ledger + root-family closure argument.

Do not touch Functions #483, #479/#480, Trader Lab #473/#481, Specialized Traders #470, providers, Risk implementation, execution, Production or real-capital systems.
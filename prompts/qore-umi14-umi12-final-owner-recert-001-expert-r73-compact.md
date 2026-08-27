# DeepSeek Expert R73 — QORE UMI14 / UMI12 Final Owner Recertification

Independent adversarial Expert review. GitHub live state, exact frozen checkout, and pre-executed raw evidence from this run are authoritative. Do not inherit prior verdicts.

## Frozen binding
- Core `mezas3238-hue/qore-core`, PR #461
- BASE `ebd0adf000874797653df92ea1c08a892cce6c8c`
- HEAD `7da433d6880b781908cc0ed14f66cd2790dc0d98`
- HEAD tree `db48f72967402ab2325aece0d9283866fb4dbd85`
- SYNTHETIC `b85777bc72fd4d66c57a50b11a0238c2c1d252c0`
- synthetic ordered parents must be BASE then HEAD; synthetic tree must equal HEAD tree
- historical oracle blob `249caa1504e2b62277a9389dc7e73bcabf12e7db`
- no intended `src/qore` delta
- exact-head QORE CI #1621 / run `33124236848`: CPython 3.12.14, Ruff clean, Mypy 728 files clean, 4718 tests passed, six pre-existing warnings, 87% coverage.

## Consumed reviewer history
R70 reviewed an older Core HEAD and led to R62B; invalid for this HEAD. R71 failed mechanically because the model did not request mandatory evidence. R72 failed mechanically before any DeepSeek call because the generic runtime sandbox correctly rejected `import importlib`. Reviewer v8 fixes only that infrastructure issue using an immutable, closed set of controlled importlib runtime sources; the generic sandbox remains unchanged. Neither R71 nor R72 is semantic evidence or CLEAN.

## Pre-executed evidence
Reviewer v8 deterministically executes the full R62B/CPython matrix BEFORE the first model call and injects it below as PRE-EXECUTED MANDATORY EVIDENCE. You MUST adjudicate those raw results. Do not require another mandatory-tool call.

Highest-priority dangerous/safe pairs:
1. `(lambda: eval)()("1+1")` vs `(lambda: len)()("abc")`.
2. direct `importlib.import_module("math")`.
3. `getattr(importlib, "import_module")("math")` vs safe computed importlib attribute.
4. `importlib.__dict__["import_module"]("math")`.
5. `vars(importlib)["import_module"]("math")`.
6. failed-star chronology: later positional expression skipped but keyword value executed; nested `candidate=eval("1+1")` must be marked while bare `candidate=eval` may remain clean if no dangerous action escapes.
7. direct/computed `return eval` vs safe `return len`.
8. inherited R62 successful opaque-call positional/direct keyword/computed keyword/`**mapping`/multistar attacks and safe `len` inverses.
9. `getattr(builtins,"__import__")`, `vars(builtins)["eval"]`, `builtins.__dict__["eval"]`.

For every dangerous path: if real CPython executes dynamic code/import and `scanner=r62b` returns `()`, classify `VALID / MATERIAL / HARNESS DEFECT`. A later containing failure does not erase already executed dynamic code. Any explicit fail-closed marker (`call:N`, `binding:N`, `dangerous-escape:N`, etc.) is acceptable if semantically appropriate.

## Code-path discipline
Read actual declarations/methods. Do not infer MRO from R numbers. Verify the current relevant chain from R62B downward. Historical warning to check: R59 intentionally resumes from R57 rather than R58. Every finding must identify the actual responsible path.

## Broader closure after current-correction attacks
Use remaining budget to falsify: exact D04 owner/qualification manifest; all 19 Program-D family UMI-02 bindings; economic-vs-provider/listing identity separation; RATE/YIELD/SPREAD/PRICE/NAV/IV/NOTIONAL/QUANTITY/WEIGHT anti-flattening; generic/product directionality; Sukuk/Shari'ah, ILS/event-contract, SFT static/current-state, SCF/Advanced-Payable separation; provider/runtime/network/dynamic-execution exclusion; historical oracle integrity; no `src/qore` mutation; no Production/provider-readiness/real-capital claim.

## Finding contract
For each material finding: stable ID; severity/materiality; exact path/line/symbol; minimal witness; CPython result where relevant; exact R62B scanner result; verified MRO/code path; invariant/impact; `VALID`/`INVALID`; `OWNER DEFECT`/`HARNESS DEFECT`; smallest bounded correction.

If mandatory evidence is unavailable or cannot be adjudicated, return `MECHANICAL REVIEW FAILURE`, never CLEAN.

Only if all mandatory attacks are adjudicated and no material finding survives, end exactly:
`HALLAZGOS: NINGUNO`
`VALIDACIÓN OK`

If a material finding survives, list it and end `VALIDACIÓN NO OK`.

Do not authorize merge, Program-D PASS, provider readiness, Production readiness/execution, or real capital. Integration Authority is final.

# QORE CIBO COGNITIVE — CORRECTION-001 EXACT-TYPE BOUNDARIES — RESUME-001

## PURPOSE
Resume the interrupted exact-type-boundary correction from the newest durable candidate produced by failed run `33756768323`. This is a continuation package, NOT a restart of CIBO Cognitive and NOT a repetition of Batch008.

## IMMUTABLE QORE-CORE BINDING
- START: `576803fbda76970a4bbfe2287b5f9ca101d0f6c3`
- TREE: `11f35844670551ac4ab5be322272a3221e6b1c4b`

The host MUST restore the recovery artifact before Harness starts and MUST verify the recovered candidate patch byte-for-byte.

## RECOVERY SOURCE
- source failed run: `33756768323`
- source job: `100652997200`
- source artifact id: `9894209891`
- artifact ZIP digest recorded by GitHub: `sha256:d405c1e08fd9569f4bbb440a25c21c7ed0e566ee729948ff29bb576dfcb56ec2`
- recovered `harness-engineer-candidate.patch` SHA-256: `7e2469d7169c434d9e3a1dda33d665ee1f1425d635d4823e1437877b018b1b98`

The recovered patch is newer than the predecessor candidate (`1e876cec7c50ca49c0f9b46f57d22cf1ff7f837fb25fa49c4ea694fe6a592bfa`). Preserve the newer recovered edits. Do not replace them with the predecessor patch and do not reconstruct them from memory.

## FAILURE ADJUDICATION
The prior run did NOT fail because Cognitive was semantically rejected. It failed because checkpoint publication used an invalid free-form reserved line:

`binding: clean start (only .qore-harness-recovery/ untracked) -> predecessor patch restored exactly`

The parser correctly failed closed. The Harness prompt has since been hardened: any `binding:` line is machine-reserved and may only use:

`binding: START=<40-lowercase-hex> TREE=<40-lowercase-hex>`

Put all recovery/clean-start/patch narrative under `evidence:` lines.

## DURABLE INHERITED EVIDENCE
Before the parser failure, the prior generation established:
- predecessor patch restored and verified;
- focused Cognitive baseline: `88 passed`;
- focused Ruff: PASS;
- focused Mypy over Cognitive source: PASS;
- semantic LSP-before evidence captured;
- an inventory of permissive runtime-type checks was opened;
- subclass-laundering witnesses were demonstrated for authority-relevant/value-semantic families;
- six logical lanes had started, but the valid durable parser state did NOT certify any lane as `COMPLETED`.

Therefore:
- inherit the recovered worktree and all recoverable evidence;
- do NOT claim prior lanes completed unless current valid journal evidence proves it;
- do NOT redo broad Cognitive architecture or CA-01..CA-18 design;
- continue only the bounded exact-type residual.

## MATERIAL RESIDUAL TO CLOSE
Independent IA rejected permissive runtime-type acceptance at Cognitive trust/semantic boundaries where QORE invariants require exact runtime types. The correction must close subclass laundering and constructor/builder asymmetry without breaking legitimate structural protocols.

Required distinction:
- structural interfaces intentionally supporting polymorphism MAY remain structural;
- semantic identity/value/authority-bearing concrete types MUST reject subclasses when their contract requires exact runtime type;
- `bool != int` and analogous Python subclass traps remain fail-closed;
- direct constructors and public builders must enforce equivalent invariants;
- nested/recursive material must be revalidated where applicable;
- no silent normalization may launder an invalid subclass into a trusted canonical value.

## SIX LANES FOR THIS RESUME
Use exactly these six logical lanes. They apply only to the recovered Correction-001 candidate:

1. **Exact-type contract map + LSP graph** — classify recovered `isinstance`/type checks into legitimate structural polymorphism versus exact semantic boundaries; use LSP definitions/references/hover.
2. **Subclass-laundering adversarial witnesses** — reproduce concrete bypasses for UUID/time/enum/container/frozen semantic values and any Cognitive authority/evidence identifiers actually affected.
3. **Constructor/builder/recursive parity** — prove direct construction, builders, nested values, replay/deserialization-style revalidation and immutable containers cannot bypass the same invariants.
4. **Property/metamorphic generalization** — test valid exact instances continue to work while malicious subclasses fail closed; no behavior widening or accidental rejection of intentional protocols.
5. **Neighboring causal-family regression** — audit world model, attention, planning, tools, replay, evaluation and common boundaries for equivalent gaps without expanding beyond the recovered 16-file family unless an allowed-path causal dependency is required.
6. **Closure + maintainability + docs** — smallest coherent implementation, adversarial tests, LSP-after, focused validation, Root-Family Exhaustion and documentation of exact-type doctrine where materially needed.

## REQUIRED SAFETY / ARCHITECTURE INVARIANTS
Preserve all existing QORE laws:
- provider-neutral Core;
- deterministic semantics;
- no hidden `now`, RNG or global mutable state in deterministic contracts;
- immutable/sanitized evidence;
- no secrets in repr/log/evidence;
- reasoning != execution;
- opinion != formal signal;
- CIBO authority never bypasses Policy/Risk/authorized execution boundary;
- no Production credentials, accounts, real capital or real-money orders;
- no weakening tests, suppressions, unjustified skips/xfail, linter silencing or `type: ignore` used to conceal defects.

## VALIDATION
Harness owns focused validation while iterating. Host owns canonical FULL QG after Harness candidate-ready:
- `ruff check .`
- `mypy src tests`
- `pytest --cov=src/qore --cov-report=term-missing`
- `git diff --check`

Harness MUST also run semantic LSP-after over materially affected symbols and perform one final diff/root-family audit.

## COMPLETION CONTRACT
Candidate-ready only when:
- all six resume lanes are validly `COMPLETED` in parseable checkpoints;
- exact-type/subclass-laundering residual is demonstrably closed;
- recovered work is preserved unless a specific defect requires changing it;
- focused adversarial tests are green;
- LSP-before/after evidence exists;
- recovery patch is fresh;
- no unrelated architecture work was introduced.

No Expert dispatch from Harness. Return artifact-only candidate for independent IA and external FULL QG.

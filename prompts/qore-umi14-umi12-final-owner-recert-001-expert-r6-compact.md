# QORE UMI14 / UMI12 final owner-universe recertification — DeepSeek Expert R6

Role: independent adversarial EXPERT reviewer. Review only the exact frozen qore-core candidate. Prior CI/reviews are evidence, never approval.

## Immutable binding
- PR: #461
- Issue: #458 `QORE-UMI14-CORR-UMI12-001 — Final cross-asset owner-universe recertification`
- BASE: `ebd0adf000874797653df92ea1c08a892cce6c8c`
- HEAD: `7030cd95b884668b8016692e4ab20d38e382ab02`
- SYNTHETIC: `67dc35d76d90ab2e6dc3cb485077d011fdb2b664`
- TREE: `4cd9edd924ea26d41bc637b97be090efe0c63180`
- QORE CI: #1494 / run `32950707798` / SUCCESS
  - Ruff OK
  - Mypy: 683 source files, no issues
  - Pytest: 4377 passed, 6 historical warnings
  - Coverage: 87%
- Diff BASE→HEAD: 18 commits ahead / 0 behind; 7 files; +1623/-28; `src/ delta = 0`
- Synthetic: GitHub verified; parents exactly BASE then HEAD; synthetic tree exactly HEAD tree.

Changed files only:
1. `docs/architecture/QORE-UMI-12-FINAL-OWNER-RECERTIFICATION-R4-HARDENING.md`
2. `docs/architecture/QORE-UMI-12-FINAL-OWNER-RECERTIFICATION-R5-HARDENING.md`
3. `docs/architecture/QORE-UMI-12-FINAL-OWNER-UNIVERSE-RECERTIFICATION-001.md`
4. `tests/infrastructure/test_universal_cross_asset_conformance_final_owner_guards.py`
5. `tests/infrastructure/test_universal_cross_asset_conformance_final_owner_r4_guards.py`
6. `tests/infrastructure/test_universal_cross_asset_conformance_final_owner_r5_guards.py`
7. `tests/infrastructure/test_universal_cross_asset_conformance_full_closure_guards.py`

Historical oracle `tests/infrastructure/test_universal_cross_asset_conformance_full_closure.py` is intentionally unchanged.

## Contract to falsify
#458 requires final CURRENT D04 owner/qualification recertification: complete current semantic-owner surface under actual D04 conventions; all 19 Program-D families bind through UMI-02 without provider/listing-symbol laundering; RATE/YIELD/SPREAD/PRICE/NAV/IV/NOTIONAL/QUANTITY/WEIGHT remain semantically distinct; generic/product ownership directionality remains correct; Sukuk/Shari'ah and ILS/event-contract owners remain distinct; SFT contractual terms do not become current Position/Risk/state authority; SCF→Advanced-Payable direction remains correct; provider/SDK/runtime/network/execution authority is statically excluded; evidence deterministic/immutable/secret-free. No provider support, valuation/execution, Production or real-capital claim.

Current owner discovery is intentionally bounded to established `*_semantics.py`, `*_qualification.py`, plus six audited legacy owners; `dataset_integrity_qualification` is non-D04. Do not revive the rejected arbitrary-filename/global-infrastructure allowlist finding without concrete current contract evidence.

## Prior adversarial rounds — independently verify fixes
- R1 accepted/fixed: qualification discovery; dynamic import/execution; SFT exact-name blacklist.
- R2 accepted/fixed: builtins dangerous aliases/getattr/__builtins__; relative imports; EconomicIdentity exact-schema anti-symbol laundering. Arbitrary `future_d04_owner.py` finding rejected as outside bounded #458 contract.
- R3 accepted/fixed: scalar callable rebinding (`f = eval`); `from . import X` overall-suite blind spot.
- R4 accepted/fixed: absolute `from qore.infrastructure import execution_boundary`; tuple/list dangerous callable rebinding; missing direct HTTP roots (`http.client`, `urllib3`).
- R5 accepted/fixed:
  1. builtins module aliases were not propagated (`import builtins as b; f=b; f.eval(...)`) and `builtins.__dict__["eval"](...)` escaped;
  2. dangerous callables below value-side `ast.Starred`, e.g. `x=[*[b.eval]]`, escaped the R4 composite walker.

R5 hardening is supplemental and test/doc-only. It computes builtins aliases to fixed point across Assign/AnnAssign/NamedExpr scalar alias chains; recognizes alias and alias.`__dict__` builtins namespaces; detects dangerous attributes/getattr/subscripts/calls; recursively descends Tuple/List/Set/Dict/Starred; scans all current owners + unchanged oracle; includes fixed regressions for module aliases, `__dict__`, and starred values. Intermediate CI #1493 failed only strict AST `lineno` typing; HEAD fixed narrowing without weakening semantics and #1494 is authoritative.

## Adversarial focus
Construct accepted-invalid witnesses, not speculative preferences. Focus especially on:
- whether the R5 alias fixed point can still be bypassed by simple AST-equivalent alias assignment shapes materially within the static-exclusion contract (including annotated/walrus, chained assignment, simple unpacking where relevant), without demanding arbitrary whole-program data-flow;
- dangerous builtins namespace access through direct aliases, alias `.__dict__`, `getattr`, subscripts, Starred/nested composite values, and subsequent simple calls;
- interaction among final/R4/R5 supplemental guards: judge the complete suite; do not demand refactoring an older helper if another exact current guard reliably rejects the witness;
- import normalization: absolute/relative/from-import aliases must not hide provider/runtime/network/execution authority; directionality must remain enforced;
- bounded direct network roots: require a concrete materially equivalent client import witness, not an unbounded catalog preference;
- exact 35-owner currentness under actual naming/legacy conventions and the explicit dataset non-D04 exclusion;
- EconomicIdentity exact schema/provider-listing separation; UMI-02 all 19 families; Decimal semantic distinctions;
- SFT contractual vs current-state authority; generic/product directionality; rainbow option composition; Sukuk/Shari'ah; ILS/event; SCF/Advanced-Payable;
- historical oracle unchanged; no semantic facsimiles or operational authority; deterministic/immutable/secret-free; `src/ delta = 0`.

Do not demand provider/Production/valuation/execution capability excluded by #458.

## Required output
For each material finding provide severity; file/symbol; minimal constructible witness/reproduction; ACTUAL; EXPECTED; violated #458/architecture contract; impact; smallest safe fix. Separate real candidate defects from speculative future-hardening preferences.

End with exactly one:
- `HALLAZGOS: NINGUNO / VALIDACIÓN OK`
- `HALLAZGOS: <n> / VALIDACIÓN NO OK`
- `EVIDENCIA INSUFICIENTE / VALIDACIÓN BLOQUEADA`

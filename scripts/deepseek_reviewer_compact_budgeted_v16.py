#!/usr/bin/env python3
from __future__ import annotations

import json

import deepseek_reviewer_compact_budgeted_v15 as v15

v14 = v15.v14
v13 = v15.v13
compact = v15.compact
v6 = v15.v6
v7 = v15.v7
v8 = v15.v8
budgeted = v15.budgeted

# Successor after independent adjudication of Claude finding
# QORE-R62E-SCOPE-001. The material false positive is exposed by R62F's
# unconditional selected-slot decoration of zero-argument locals()/vars()
# results in nested runtime scopes. R62G preserves R62E's retained namespace
# sensitivity for callable defaults while withholding invented module slots.
compact._SCANNER_TARGETS["r62g"] = (
    "test_universal_cross_asset_conformance_final_owner_r62g_guards",
    "_r62g_dynamic_execution_markers_from_source",
)
for _tool in budgeted.TOOLS:
    _function = _tool.get("function") or {}
    if _function.get("name") != "scanner_probe":
        continue
    _function["description"] = (
        "Run the exact frozen QORE static scanner on supplied source without "
        "executing that source. Use scanner=r60/r61/r62/r62b/r62c/r62d/r62e/"
        "r62f/r62g/final_owner and report the actual marker tuple from the checkout."
    )
    _enum = (
        _function.get("parameters", {})
        .get("properties", {})
        .get("scanner", {})
        .get("enum", [])
    )
    if "r62g" not in _enum:
        _enum.append("r62g")


def _scanner_r62f_predecessor(source: str) -> str:
    return compact._scanner_probe({"scanner": "r62f", "source": source})


def _scanner_r62g(source: str) -> str:
    return compact._scanner_probe({"scanner": "r62g", "source": source})


# Historical mandatory matrices resolve these globals at execution time. Route
# their candidate side through the exact current successor R62G.
v6._scanner = _scanner_r62g
v13.v10._scanner_r62d = _scanner_r62g
v13.v10.v9._scanner_r62c = _scanner_r62g
v13._scanner_r62e = _scanner_r62g

_NESTED_VARS = (
    "def run():\n"
    "    return vars()['__builtins__'].eval('1+1')\n"
    "result = run()\n"
    "print(result)\n"
)
_NESTED_LOCALS = (
    "def run():\n"
    "    return locals()['__builtins__'].eval('1+1')\n"
    "result = run()\n"
    "print(result)\n"
)
_FUNCTION_COMP_VARS = (
    "def run():\n"
    "    return [vars()['__builtins__']['eval']('1+1') for _ in (0,)]\n"
    "result = run()\n"
    "print(result)\n"
)
_FUNCTION_COMP_LOCALS = (
    "def run():\n"
    "    return [locals()['__builtins__']['eval']('1+1') for _ in (0,)]\n"
    "result = run()\n"
    "print(result)\n"
)
_NESTED_GLOBALS = (
    "def run():\n"
    "    return globals()['__builtins__'].eval('1+1')\n"
    "result = run()\n"
    "print(result)\n"
)
_MODULE_VARS = (
    "import builtins\n"
    "result = vars()['builtins'].eval('1+1')\n"
    "print(result)\n"
)
_MODULE_LOCALS = (
    "import builtins\n"
    "result = locals()['builtins'].eval('1+1')\n"
    "print(result)\n"
)
_MODULE_COMP_VARS = (
    "import builtins\n"
    "values = [vars()['builtins'].eval('1+1') for _ in (0,)]\n"
    "print(values[0])\n"
)
_NESTED_DEFAULT_VARS = (
    "def outer():\n"
    "    import builtins\n"
    "    def hold(namespace=vars()):\n"
    "        return None\n"
    "    return hold\n"
    "hold = outer()\n"
    "result = hold.__defaults__[0]['builtins'].eval('1+1')\n"
    "print(result)\n"
)
_NESTED_DEFAULT_LOCALS = (
    "def outer():\n"
    "    import builtins\n"
    "    def hold(namespace=locals()):\n"
    "        return None\n"
    "    return hold\n"
    "hold = outer()\n"
    "result = hold.__defaults__[0]['builtins'].eval('1+1')\n"
    "print(result)\n"
)

_R62G_RUNTIME_SOURCES = frozenset(
    {
        _NESTED_VARS,
        _NESTED_LOCALS,
        _FUNCTION_COMP_VARS,
        _FUNCTION_COMP_LOCALS,
        _NESTED_GLOBALS,
        _MODULE_VARS,
        _MODULE_LOCALS,
        _MODULE_COMP_VARS,
        _NESTED_DEFAULT_VARS,
        _NESTED_DEFAULT_LOCALS,
    }
)
v8._CONTROLLED_IMPORTLIB_RUNTIME_SOURCES = (
    v8._CONTROLLED_IMPORTLIB_RUNTIME_SOURCES | _R62G_RUNTIME_SOURCES
)

# Start from v14's retained-helper suite so inherited matrices use the globals
# redirected above rather than v15's R62F-hardcoded candidate helper. Re-run the
# full R62F direct matrix explicitly with scanner=r62g below.
_base_suite = v15._base_suite


def _extended_r62g_probe_suite() -> str:
    base = _base_suite()
    probes: dict[str, str] = {}

    # All R62F direct surfaces remain mandatory on the current successor.
    for name, source in {
        "direct_globals": v15._DIRECT_GLOBALS,
        "direct_locals": v15._DIRECT_LOCALS,
        "direct_vars": v15._DIRECT_VARS,
        "direct_dunder_builtins": v15._DIRECT_DUNDER_BUILTINS,
        "builtins_dict_globals": v15._BUILTINS_DICT_GLOBALS,
        "vars_builtins_globals": v15._VARS_BUILTINS_GLOBALS,
        "getattr_builtins_globals": v15._GETATTR_BUILTINS_GLOBALS,
        "imported_globals": v15._IMPORTED_GLOBALS,
        "imported_builtins_dict": v15._IMPORTED_BUILTINS_DICT,
        "operator_builtins_dict": v15._OPERATOR_BUILTINS_DICT,
    }.items():
        probes[f"python_r62g_{name}"] = v6._python("run", source)
        probes[f"scanner_r62g_{name}"] = _scanner_r62g(source)

    for name, source in {
        "safe_missing": v15._SAFE_MISSING,
        "safe_builtins_len": v15._SAFE_BUILTINS_LEN,
        "safe_shadow": v15._SAFE_SHADOW,
        "safe_vars_argument": v15._SAFE_VARS_ARGUMENT,
    }.items():
        probes[f"python_r62g_{name}"] = v6._python("run", source)
        probes[f"scanner_r62g_{name}"] = _scanner_r62g(source)

    # Exact accepted Claude finding: predecessor R62F marks impossible nested
    # module slots, while CPython raises KeyError and R62G must stay clean.
    for name, source in {
        "nested_vars": _NESTED_VARS,
        "nested_locals": _NESTED_LOCALS,
        "function_comp_vars": _FUNCTION_COMP_VARS,
        "function_comp_locals": _FUNCTION_COMP_LOCALS,
    }.items():
        probes[f"python_r62g_{name}"] = v6._python("run", source)
        probes[f"scanner_r62f_predecessor_{name}"] = _scanner_r62f_predecessor(source)
        probes[f"scanner_r62g_{name}"] = _scanner_r62g(source)

    # Safety against over-correction: globals stays module-scoped; module
    # locals/vars and CPython-3.12 module comprehensions remain dangerous; nested
    # locals/vars defaults remain sensitive when they really retain builtins.
    for name, source in {
        "nested_globals": _NESTED_GLOBALS,
        "module_vars": _MODULE_VARS,
        "module_locals": _MODULE_LOCALS,
        "module_comp_vars": _MODULE_COMP_VARS,
        "nested_default_vars": _NESTED_DEFAULT_VARS,
        "nested_default_locals": _NESTED_DEFAULT_LOCALS,
    }.items():
        probes[f"python_r62g_{name}"] = v6._python("run", source)
        probes[f"scanner_r62g_{name}"] = _scanner_r62g(source)

    text = json.dumps(probes, indent=2, sort_keys=True)
    print("QORE R62G scope-preserving retained-namespace evidence:\n" + text)
    return (
        base
        + "\n\nR62G SCOPE-PRESERVING RETAINED-NAMESPACE PROBES:\n"
        + compact.compact_clip(text, 42000)
    )


v7._extended_r62b_probe_suite = _extended_r62g_probe_suite


if __name__ == "__main__":
    raise SystemExit(v7.main())

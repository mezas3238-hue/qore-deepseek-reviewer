#!/usr/bin/env python3
from __future__ import annotations

import json

import deepseek_reviewer_compact_budgeted_v12 as v12

compact = v12.compact
v6 = v12.v6
v7 = v12.v7
v8 = v12.v8
v10 = v12.v10
budgeted = v10.budgeted

# Candidate successor after R76. Keep the predecessor available explicitly for
# exact R62D-vs-R62E comparisons, while routing inherited successor matrices to
# the current R62E scanner.
compact._SCANNER_TARGETS["r62e"] = (
    "test_universal_cross_asset_conformance_final_owner_r62e_guards",
    "_r62e_dynamic_execution_markers_from_source",
)
for _tool in budgeted.TOOLS:
    _function = _tool.get("function") or {}
    if _function.get("name") != "scanner_probe":
        continue
    _function["description"] = (
        "Run the exact frozen QORE static scanner on supplied source without "
        "executing that source. Use scanner=r60/r61/r62/r62b/r62c/r62d/r62e/"
        "final_owner and report the actual marker tuple from the checkout."
    )
    _enum = (
        _function.get("parameters", {})
        .get("properties", {})
        .get("scanner", {})
        .get("enum", [])
    )
    if "r62e" not in _enum:
        _enum.append("r62e")


def _scanner_r62d(source: str) -> str:
    return compact._scanner_probe({"scanner": "r62d", "source": source})


def _scanner_r62e(source: str) -> str:
    return compact._scanner_probe({"scanner": "r62e", "source": source})


# Historical mandatory matrices resolve these globals at execution time.
v6._scanner = _scanner_r62e
v10._scanner_r62d = _scanner_r62e
v10.v9._scanner_r62c = _scanner_r62e

_GLOBALS_DEFAULT = (
    "import builtins\n"
    "def hold(namespace=globals()):\n"
    "    return None\n"
    "result = hold.__defaults__[0]['builtins'].eval('1+1')\n"
    "print(result)\n"
)
_LOCALS_DEFAULT = (
    "import builtins\n"
    "def hold(namespace=locals()):\n"
    "    return None\n"
    "result = hold.__defaults__[0]['builtins'].eval('1+1')\n"
    "print(result)\n"
)
_VARS_DEFAULT = (
    "import builtins\n"
    "def hold(namespace=vars()):\n"
    "    return None\n"
    "result = hold.__defaults__[0]['builtins'].eval('1+1')\n"
    "print(result)\n"
)
_GLOBALS_LAMBDA_DEFAULT = (
    "import builtins\n"
    "hold = lambda namespace=globals(): None\n"
    "result = hold.__defaults__[0]['builtins'].eval('1+1')\n"
    "print(result)\n"
)
_LOCALS_LAMBDA_DEFAULT = (
    "import builtins\n"
    "hold = lambda namespace=locals(): None\n"
    "result = hold.__defaults__[0]['builtins'].eval('1+1')\n"
    "print(result)\n"
)
_VARS_LAMBDA_DEFAULT = (
    "import builtins\n"
    "hold = lambda namespace=vars(): None\n"
    "result = hold.__defaults__[0]['builtins'].eval('1+1')\n"
    "print(result)\n"
)
_NESTED_LOCALS_DEFAULT = (
    "def outer():\n"
    "    import builtins\n"
    "    def hold(namespace=locals()):\n"
    "        return None\n"
    "    return hold\n"
    "hold = outer()\n"
    "result = hold.__defaults__[0]['builtins'].eval('1+1')\n"
    "print(result)\n"
)
_NESTED_VARS_DEFAULT = (
    "def outer():\n"
    "    import builtins\n"
    "    def hold(namespace=vars()):\n"
    "        return None\n"
    "    return hold\n"
    "hold = outer()\n"
    "result = hold.__defaults__[0]['builtins'].eval('1+1')\n"
    "print(result)\n"
)
_DIRECT_GLOBALS = (
    "import builtins\n"
    "result = globals()['builtins'].eval('1+1')\n"
    "print(result)\n"
)
_DIRECT_LOCALS = (
    "import builtins\n"
    "result = locals()['builtins'].eval('1+1')\n"
    "print(result)\n"
)
_DIRECT_VARS = (
    "import builtins\n"
    "result = vars()['builtins'].eval('1+1')\n"
    "print(result)\n"
)
_BUILTINS_DICT_GLOBALS = (
    "import builtins\n"
    "result = builtins.__dict__['globals']()['builtins'].eval('1+1')\n"
    "print(result)\n"
)
_VARS_BUILTINS_GLOBALS = (
    "import builtins\n"
    "result = vars(builtins)['globals']()['builtins'].eval('1+1')\n"
    "print(result)\n"
)
_GETATTR_BUILTINS_GLOBALS = (
    "import builtins\n"
    "result = getattr(builtins, 'globals')()['builtins'].eval('1+1')\n"
    "print(result)\n"
)
_SAFE_SHADOW = (
    "def globals():\n"
    "    return {}\n"
    "def hold(namespace=globals()):\n"
    "    return namespace\n"
    "print(len(hold()))\n"
)
_SAFE_VARS_ARGUMENT = (
    "class Safe:\n"
    "    pass\n"
    "safe = Safe()\n"
    "def hold(namespace=vars(safe)):\n"
    "    return namespace\n"
    "print(len(hold()))\n"
)

_R62E_RUNTIME_SOURCES = frozenset(
    {
        _GLOBALS_DEFAULT,
        _LOCALS_DEFAULT,
        _VARS_DEFAULT,
        _GLOBALS_LAMBDA_DEFAULT,
        _LOCALS_LAMBDA_DEFAULT,
        _VARS_LAMBDA_DEFAULT,
        _NESTED_LOCALS_DEFAULT,
        _NESTED_VARS_DEFAULT,
        _DIRECT_GLOBALS,
        _DIRECT_LOCALS,
        _DIRECT_VARS,
        _BUILTINS_DICT_GLOBALS,
        _VARS_BUILTINS_GLOBALS,
        _GETATTR_BUILTINS_GLOBALS,
        _SAFE_SHADOW,
        _SAFE_VARS_ARGUMENT,
    }
)
v8._CONTROLLED_IMPORTLIB_RUNTIME_SOURCES = (
    v8._CONTROLLED_IMPORTLIB_RUNTIME_SOURCES | _R62E_RUNTIME_SOURCES
)

_base_suite = v7._extended_r62b_probe_suite


def _extended_r62e_probe_suite() -> str:
    base = _base_suite()
    probes: dict[str, str] = {}

    default_sources = {
        "function_globals": _GLOBALS_DEFAULT,
        "function_locals": _LOCALS_DEFAULT,
        "function_vars": _VARS_DEFAULT,
        "lambda_globals": _GLOBALS_LAMBDA_DEFAULT,
        "lambda_locals": _LOCALS_LAMBDA_DEFAULT,
        "lambda_vars": _VARS_LAMBDA_DEFAULT,
        "nested_locals": _NESTED_LOCALS_DEFAULT,
        "nested_vars": _NESTED_VARS_DEFAULT,
    }
    for name, source in default_sources.items():
        probes[f"python_r62e_{name}"] = v6._python("run", source)
        probes[f"scanner_r62d_{name}"] = _scanner_r62d(source)
        probes[f"scanner_r62e_{name}"] = _scanner_r62e(source)

    direct_sources = {
        "direct_globals": _DIRECT_GLOBALS,
        "direct_locals": _DIRECT_LOCALS,
        "direct_vars": _DIRECT_VARS,
        "builtins_dict_globals": _BUILTINS_DICT_GLOBALS,
        "vars_builtins_globals": _VARS_BUILTINS_GLOBALS,
        "getattr_builtins_globals": _GETATTR_BUILTINS_GLOBALS,
    }
    for name, source in direct_sources.items():
        probes[f"python_r62e_{name}"] = v6._python("run", source)
        probes[f"scanner_r62e_{name}"] = _scanner_r62e(source)

    for name, source in {
        "safe_shadow": _SAFE_SHADOW,
        "safe_vars_argument": _SAFE_VARS_ARGUMENT,
    }.items():
        probes[f"python_r62e_{name}"] = v6._python("run", source)
        probes[f"scanner_r62e_{name}"] = _scanner_r62e(source)

    text = json.dumps(probes, indent=2, sort_keys=True)
    print("QORE R62E retained/direct namespace evidence:\n" + text)
    return (
        base
        + "\n\nR62E RETAINED/DIRECT NAMESPACE PROBES:\n"
        + compact.compact_clip(text, 36000)
    )


v7._extended_r62b_probe_suite = _extended_r62e_probe_suite


if __name__ == "__main__":
    raise SystemExit(v7.main())

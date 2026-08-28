#!/usr/bin/env python3
from __future__ import annotations

import json

import deepseek_reviewer_compact_budgeted_v14 as v14

v13 = v14.v13
compact = v14.compact
v6 = v14.v6
v7 = v14.v7
v8 = v14.v8
budgeted = v14.budgeted

# R77 consumed two exploration requests because the post-round stop admitted a
# second request while cumulative prompt input was still below 19k. That left
# insufficient prompt capacity for a no-thinking final fallback after the first
# final response spent its entire 12k output allowance on reasoning.
#
# Preserve every hard prompt-budget guarantee and reserve fallback capacity by
# stopping after the first observed exploration round for the R77-sized input.
# A 20k first-final allowance also reduces the chance that hidden reasoning
# consumes the entire response with no visible review. The hard 100k prompt
# ceiling, calibrated density guard, and 8,192-token reserve remain unchanged.
v6.v4.EXPLORATION_FINAL_RESERVE_STOP = 12000
v6.v4.v3.EXPLORATION_STOP_PROMPT_TOKENS = 12000
budgeted.FINAL_MAX_TOKENS = 20000

# Current successor after independent adjudication of R77's deterministic
# direct-namespace evidence. Keep R62E available explicitly as predecessor and
# route inherited candidate matrices through R62F.
compact._SCANNER_TARGETS["r62f"] = (
    "test_universal_cross_asset_conformance_final_owner_r62f_guards",
    "_r62f_dynamic_execution_markers_from_source",
)
for _tool in budgeted.TOOLS:
    _function = _tool.get("function") or {}
    if _function.get("name") != "scanner_probe":
        continue
    _function["description"] = (
        "Run the exact frozen QORE static scanner on supplied source without "
        "executing that source. Use scanner=r60/r61/r62/r62b/r62c/r62d/r62e/"
        "r62f/final_owner and report the actual marker tuple from the checkout."
    )
    _enum = (
        _function.get("parameters", {})
        .get("properties", {})
        .get("scanner", {})
        .get("enum", [])
    )
    if "r62f" not in _enum:
        _enum.append("r62f")


def _scanner_r62e(source: str) -> str:
    return compact._scanner_probe({"scanner": "r62e", "source": source})


def _scanner_r62f(source: str) -> str:
    return compact._scanner_probe({"scanner": "r62f", "source": source})


# Historical mandatory matrices resolve these globals at execution time.
v6._scanner = _scanner_r62f
v13.v10._scanner_r62d = _scanner_r62f
v13.v10.v9._scanner_r62c = _scanner_r62f
v13._scanner_r62e = _scanner_r62f

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
_DIRECT_DUNDER_BUILTINS = (
    "result = globals()['__builtins__']['eval']('1+1')\n"
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
_IMPORTED_GLOBALS = (
    "from builtins import globals as current_globals\n"
    "import builtins\n"
    "result = current_globals()['builtins'].eval('1+1')\n"
    "print(result)\n"
)
_IMPORTED_BUILTINS_DICT = (
    "from builtins import __dict__ as namespace\n"
    "result = namespace['globals']()['__builtins__']['eval']('1+1')\n"
    "print(result)\n"
)
_OPERATOR_BUILTINS_DICT = (
    "import builtins\n"
    "import operator\n"
    "result = operator.getitem(builtins.__dict__, 'globals')()"
    "['builtins'].eval('1+1')\n"
    "print(result)\n"
)
_SAFE_MISSING = (
    "import builtins\n"
    "result = globals().get('missing')\n"
    "print(result)\n"
)
_SAFE_BUILTINS_LEN = (
    "import builtins\n"
    "result = builtins.__dict__.get('len')\n"
    "print(result('abc'))\n"
)
_SAFE_SHADOW = (
    "def globals():\n"
    "    return {'builtins': object()}\n"
    "result = globals()\n"
    "print(len(result))\n"
)
_SAFE_VARS_ARGUMENT = (
    "class Safe:\n"
    "    pass\n"
    "safe = Safe()\n"
    "result = vars(safe)\n"
    "print(len(result))\n"
)

_R62F_RUNTIME_SOURCES = frozenset(
    {
        _DIRECT_GLOBALS,
        _DIRECT_LOCALS,
        _DIRECT_VARS,
        _DIRECT_DUNDER_BUILTINS,
        _BUILTINS_DICT_GLOBALS,
        _VARS_BUILTINS_GLOBALS,
        _GETATTR_BUILTINS_GLOBALS,
        _IMPORTED_GLOBALS,
        _IMPORTED_BUILTINS_DICT,
        _OPERATOR_BUILTINS_DICT,
        _SAFE_MISSING,
        _SAFE_BUILTINS_LEN,
        _SAFE_SHADOW,
        _SAFE_VARS_ARGUMENT,
    }
)
v8._CONTROLLED_IMPORTLIB_RUNTIME_SOURCES = (
    v8._CONTROLLED_IMPORTLIB_RUNTIME_SOURCES | _R62F_RUNTIME_SOURCES
)

_base_suite = v14._extended_r62e_retained_helper_probe_suite


def _extended_r62f_probe_suite() -> str:
    base = _base_suite()
    probes: dict[str, str] = {}

    dangerous_sources = {
        "direct_globals": _DIRECT_GLOBALS,
        "direct_locals": _DIRECT_LOCALS,
        "direct_vars": _DIRECT_VARS,
        "direct_dunder_builtins": _DIRECT_DUNDER_BUILTINS,
        "builtins_dict_globals": _BUILTINS_DICT_GLOBALS,
        "vars_builtins_globals": _VARS_BUILTINS_GLOBALS,
        "getattr_builtins_globals": _GETATTR_BUILTINS_GLOBALS,
        "imported_globals": _IMPORTED_GLOBALS,
        "imported_builtins_dict": _IMPORTED_BUILTINS_DICT,
        "operator_builtins_dict": _OPERATOR_BUILTINS_DICT,
    }
    for name, source in dangerous_sources.items():
        probes[f"python_r62f_{name}"] = v6._python("run", source)
        probes[f"scanner_r62e_{name}"] = _scanner_r62e(source)
        probes[f"scanner_r62f_{name}"] = _scanner_r62f(source)

    for name, source in {
        "safe_missing": _SAFE_MISSING,
        "safe_builtins_len": _SAFE_BUILTINS_LEN,
        "safe_shadow": _SAFE_SHADOW,
        "safe_vars_argument": _SAFE_VARS_ARGUMENT,
    }.items():
        probes[f"python_r62f_{name}"] = v6._python("run", source)
        probes[f"scanner_r62f_{name}"] = _scanner_r62f(source)

    text = json.dumps(probes, indent=2, sort_keys=True)
    print("QORE R62F direct retained-namespace evidence:\n" + text)
    return (
        base
        + "\n\nR62F DIRECT RETAINED-NAMESPACE PROBES:\n"
        + compact.compact_clip(text, 30000)
    )


v7._extended_r62b_probe_suite = _extended_r62f_probe_suite


if __name__ == "__main__":
    raise SystemExit(v7.main())

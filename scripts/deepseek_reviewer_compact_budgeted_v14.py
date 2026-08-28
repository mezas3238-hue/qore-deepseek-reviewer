#!/usr/bin/env python3
from __future__ import annotations

import json

import deepseek_reviewer_compact_budgeted_v13 as v13

compact = v13.compact
v6 = v13.v6
v7 = v13.v7
v8 = v13.v8
budgeted = v13.budgeted

# R62E's exact-head Quality Gate exposed an integration regression in the
# successor itself: direct ``globals``/``locals`` helper defaults returned early
# from the R62E scanner before R62D's AST-node default capture could record the
# helper value. Keep those exact callable-default forms in the mandatory
# pre-model evidence so a future clean verdict cannot miss the regression.
_RETAINED_GLOBALS_HELPER = (
    "import builtins\n"
    "def hold(candidate=globals):\n"
    "    return None\n"
    "result = hold.__defaults__[0]()['builtins'].eval('1+1')\n"
    "print(result)\n"
)
_RETAINED_LOCALS_HELPER = (
    "import builtins\n"
    "def hold(candidate=locals):\n"
    "    return None\n"
    "result = hold.__defaults__[0]()['builtins'].eval('1+1')\n"
    "print(result)\n"
)
_RETAINED_VARS_HELPER = (
    "import builtins\n"
    "def hold(candidate=vars):\n"
    "    return None\n"
    "result = hold.__defaults__[0]()['builtins'].eval('1+1')\n"
    "print(result)\n"
)

_R62E_RETAINED_HELPER_RUNTIME_SOURCES = frozenset(
    {
        _RETAINED_GLOBALS_HELPER,
        _RETAINED_LOCALS_HELPER,
        _RETAINED_VARS_HELPER,
    }
)
v8._CONTROLLED_IMPORTLIB_RUNTIME_SOURCES = (
    v8._CONTROLLED_IMPORTLIB_RUNTIME_SOURCES
    | _R62E_RETAINED_HELPER_RUNTIME_SOURCES
)

_base_suite = v13._extended_r62e_probe_suite


def _extended_r62e_retained_helper_probe_suite() -> str:
    base = _base_suite()
    probes: dict[str, str] = {}

    for name, source in {
        "retained_globals_helper": _RETAINED_GLOBALS_HELPER,
        "retained_locals_helper": _RETAINED_LOCALS_HELPER,
        "retained_vars_helper": _RETAINED_VARS_HELPER,
    }.items():
        probes[f"python_r62e_{name}"] = v6._python("run", source)
        probes[f"scanner_r62d_{name}"] = v13._scanner_r62d(source)
        probes[f"scanner_r62e_{name}"] = v13._scanner_r62e(source)

    text = json.dumps(probes, indent=2, sort_keys=True)
    print("QORE R62E retained helper-default evidence:\n" + text)
    return (
        base
        + "\n\nR62E RETAINED HELPER-DEFAULT PROBES:\n"
        + compact.compact_clip(text, 14000)
    )


v7._extended_r62b_probe_suite = _extended_r62e_retained_helper_probe_suite


if __name__ == "__main__":
    raise SystemExit(v7.main())

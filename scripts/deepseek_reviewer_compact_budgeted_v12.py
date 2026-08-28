#!/usr/bin/env python3
from __future__ import annotations

import json

import deepseek_reviewer_compact_budgeted_v11 as v11

compact = v11.compact
v6 = v11.v6
v7 = v11.v7
v8 = v11.v8
v10 = v11.v10

# R75's mandatory matrix certified direct dangerous/default values and the
# importlib namespace itself. Integration Authority identified one adjacent
# capability-retention surface that must be executed before R75 can be accepted:
# a default can retain the *module global namespace* via globals()/vars(), and
# __defaults__ can later recover an imported builtins module from that mapping.
# These exact immutable witnesses are infrastructure-owned and deliberately
# whitelisted; arbitrary runtime source remains prohibited.
_GLOBALS_FUNCTION_SOURCE = (
    "import builtins\n"
    "def hold(namespace=globals()):\n"
    "    return None\n"
    "result = hold.__defaults__[0]['builtins'].eval('1+1')\n"
    "print(result)\n"
)
_GLOBALS_LAMBDA_SOURCE = (
    "import builtins\n"
    "hold = lambda namespace=globals(): None\n"
    "result = hold.__defaults__[0]['builtins'].eval('1+1')\n"
    "print(result)\n"
)
_VARS_FUNCTION_SOURCE = (
    "import builtins\n"
    "def hold(namespace=vars()):\n"
    "    return None\n"
    "result = hold.__defaults__[0]['builtins'].eval('1+1')\n"
    "print(result)\n"
)
_VARS_LAMBDA_SOURCE = (
    "import builtins\n"
    "hold = lambda namespace=vars(): None\n"
    "result = hold.__defaults__[0]['builtins'].eval('1+1')\n"
    "print(result)\n"
)

_MODULE_NAMESPACE_RUNTIME_SOURCES = frozenset(
    {
        _GLOBALS_FUNCTION_SOURCE,
        _GLOBALS_LAMBDA_SOURCE,
        _VARS_FUNCTION_SOURCE,
        _VARS_LAMBDA_SOURCE,
    }
)
v8._CONTROLLED_IMPORTLIB_RUNTIME_SOURCES = (
    v8._CONTROLLED_IMPORTLIB_RUNTIME_SOURCES | _MODULE_NAMESPACE_RUNTIME_SOURCES
)

_base_r62d_suite = v7._extended_r62b_probe_suite


def _extended_r62d_module_namespace_default_probe_suite() -> str:
    base = _base_r62d_suite()

    probes = {
        "python_function_default_globals_namespace": v6._python(
            "run", _GLOBALS_FUNCTION_SOURCE
        ),
        "scanner_r62c_function_default_globals_namespace": v10._scanner_r62c(
            _GLOBALS_FUNCTION_SOURCE
        ),
        "scanner_r62d_function_default_globals_namespace": v10._scanner_r62d(
            _GLOBALS_FUNCTION_SOURCE
        ),
        "python_lambda_default_globals_namespace": v6._python(
            "run", _GLOBALS_LAMBDA_SOURCE
        ),
        "scanner_r62c_lambda_default_globals_namespace": v10._scanner_r62c(
            _GLOBALS_LAMBDA_SOURCE
        ),
        "scanner_r62d_lambda_default_globals_namespace": v10._scanner_r62d(
            _GLOBALS_LAMBDA_SOURCE
        ),
        "python_function_default_vars_namespace": v6._python(
            "run", _VARS_FUNCTION_SOURCE
        ),
        "scanner_r62c_function_default_vars_namespace": v10._scanner_r62c(
            _VARS_FUNCTION_SOURCE
        ),
        "scanner_r62d_function_default_vars_namespace": v10._scanner_r62d(
            _VARS_FUNCTION_SOURCE
        ),
        "python_lambda_default_vars_namespace": v6._python(
            "run", _VARS_LAMBDA_SOURCE
        ),
        "scanner_r62c_lambda_default_vars_namespace": v10._scanner_r62c(
            _VARS_LAMBDA_SOURCE
        ),
        "scanner_r62d_lambda_default_vars_namespace": v10._scanner_r62d(
            _VARS_LAMBDA_SOURCE
        ),
    }

    text = json.dumps(probes, indent=2, sort_keys=True)
    print("QORE R62D module-namespace default evidence:\n" + text)
    return (
        base
        + "\n\nR62D MODULE-NAMESPACE DEFAULT PROBES:\n"
        + compact.compact_clip(text, 18000)
    )


v7._extended_r62b_probe_suite = _extended_r62d_module_namespace_default_probe_suite


if __name__ == "__main__":
    raise SystemExit(v7.main())

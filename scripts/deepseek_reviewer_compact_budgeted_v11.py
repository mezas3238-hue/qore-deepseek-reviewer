#!/usr/bin/env python3
from __future__ import annotations

import json

import deepseek_reviewer_compact_budgeted_v6 as v6
import deepseek_reviewer_compact_budgeted_v7 as v7
import deepseek_reviewer_compact_budgeted_v8 as v8
import deepseek_reviewer_compact_budgeted_v10 as v10

compact = v6.compact
budgeted = v6.budgeted

# R62D's final same-family closure treats the statically known importlib
# namespace as sensitive when CPython stores it in a function/lambda default:
# ``__defaults__`` exposes that module object even if the callable body ignores
# the parameter, and ``import_module`` is then directly reachable. Keep the
# generic runtime sandbox closed and allow only these two immutable,
# infrastructure-owned witnesses.
_NAMESPACE_DEFAULT_RUNTIME_SOURCES = frozenset(
    {
        "import importlib\n"
        "def hold(namespace=importlib):\n"
        "    return None\n"
        "module = hold.__defaults__[0].import_module('math')\n"
        "print(module.__name__)\n",
        "import importlib\n"
        "hold = lambda namespace=importlib: None\n"
        "module = hold.__defaults__[0].import_module('math')\n"
        "print(module.__name__)\n",
    }
)
v8._CONTROLLED_IMPORTLIB_RUNTIME_SOURCES = (
    v8._CONTROLLED_IMPORTLIB_RUNTIME_SOURCES | _NAMESPACE_DEFAULT_RUNTIME_SOURCES
)

_base_r62d_suite = v7._extended_r62b_probe_suite


def _extended_r62d_namespace_probe_suite() -> str:
    base = _base_r62d_suite()

    function_source = (
        "import importlib\n"
        "def hold(namespace=importlib):\n"
        "    return None\n"
        "module = hold.__defaults__[0].import_module('math')\n"
        "print(module.__name__)\n"
    )
    lambda_source = (
        "import importlib\n"
        "hold = lambda namespace=importlib: None\n"
        "module = hold.__defaults__[0].import_module('math')\n"
        "print(module.__name__)\n"
    )

    probes = {
        "python_function_default_importlib_namespace": v6._python(
            "run", function_source
        ),
        "scanner_r62c_function_default_importlib_namespace": v10._scanner_r62c(
            function_source
        ),
        "scanner_r62d_function_default_importlib_namespace": v10._scanner_r62d(
            function_source
        ),
        "python_lambda_default_importlib_namespace": v6._python(
            "run", lambda_source
        ),
        "scanner_r62c_lambda_default_importlib_namespace": v10._scanner_r62c(
            lambda_source
        ),
        "scanner_r62d_lambda_default_importlib_namespace": v10._scanner_r62d(
            lambda_source
        ),
    }

    text = json.dumps(probes, indent=2, sort_keys=True)
    print("QORE R62D importlib-namespace default evidence:\n" + text)
    return (
        base
        + "\n\nR62D IMPORTLIB-NAMESPACE DEFAULT PROBES:\n"
        + compact.compact_clip(text, 12000)
    )


v7._extended_r62b_probe_suite = _extended_r62d_namespace_probe_suite


if __name__ == "__main__":
    raise SystemExit(v7.main())

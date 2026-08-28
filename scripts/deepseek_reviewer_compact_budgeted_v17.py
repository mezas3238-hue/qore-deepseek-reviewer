#!/usr/bin/env python3
from __future__ import annotations

import json

import deepseek_reviewer_compact_budgeted_v16 as v16

v15 = v16.v15
v14 = v16.v14
v13 = v16.v13
compact = v16.compact
v6 = v16.v6
v7 = v16.v7
v8 = v16.v8
budgeted = v16.budgeted

# R62K succeeds R62J after independent falsification of R62J's future-suffix
# approximation. Register both the exact predecessor and the exact current
# candidate so mandatory evidence can compare them on the frozen Core checkout.
compact._SCANNER_TARGETS["r62j"] = (
    "test_universal_cross_asset_conformance_final_owner_r62j_guards",
    "_r62j_dynamic_execution_markers_from_source",
)
compact._SCANNER_TARGETS["r62k"] = (
    "test_universal_cross_asset_conformance_final_owner_r62k_guards",
    "_r62k_dynamic_execution_markers_from_source",
)

for _tool in budgeted.TOOLS:
    _function = _tool.get("function") or {}
    if _function.get("name") != "scanner_probe":
        continue
    _function["description"] = (
        "Run the exact frozen QORE static scanner on supplied source without "
        "executing that source. Use scanner=r60/r61/r62/r62b/r62c/r62d/r62e/"
        "r62f/r62g/r62j/r62k/final_owner and report the actual marker tuple "
        "from the checkout."
    )
    _enum = (
        _function.get("parameters", {})
        .get("properties", {})
        .get("scanner", {})
        .get("enum", [])
    )
    for _name in ("r62j", "r62k"):
        if _name not in _enum:
            _enum.append(_name)


def _scanner_r62j(source: str) -> str:
    return compact._scanner_probe({"scanner": "r62j", "source": source})


def _scanner_r62k(source: str) -> str:
    return compact._scanner_probe({"scanner": "r62k", "source": source})


# Historical mandatory matrices resolve candidate scanner globals at execution
# time. Route all candidate-side inherited probes through the exact current
# successor R62K, while explicit predecessor probes below continue to use R62J.
v6._scanner = _scanner_r62k
v13.v10._scanner_r62d = _scanner_r62k
v13.v10.v9._scanner_r62c = _scanner_r62k
v13._scanner_r62e = _scanner_r62k
v16._scanner_r62g = _scanner_r62k

_TRANSIENT_REBOUND = (
    "def run():\n"
    "    return globals()['b'].eval('1+1')\n"
    "import builtins as b\n"
    "b = len\n"
    "try:\n"
    "    result = run()\n"
    "except AttributeError:\n"
    "    result = 3\n"
    "print(result)\n"
)
_UNOBSERVED_UNREACHABLE = (
    "def run():\n"
    "    return globals()['b'].eval('1+1')\n"
    "import builtins as b\n"
    "run = len\n"
    "b = len\n"
    "result = 3\n"
    "print(result)\n"
)
_DANGEROUS_DIRECT = (
    "def run():\n"
    "    return globals()['b'].eval('1+1')\n"
    "import builtins as b\n"
    "result = run()\n"
    "b = len\n"
    "print(result)\n"
)
_DANGEROUS_ALIAS = (
    "def run():\n"
    "    return globals()['b'].eval('1+1')\n"
    "alias = run\n"
    "import builtins as b\n"
    "result = alias()\n"
    "b = len\n"
    "print(result)\n"
)
_CONTAINER_ESCAPE = (
    "def run():\n"
    "    return globals()['b'].eval('1+1')\n"
    "holder = {'run': run}\n"
    "import builtins as b\n"
    "result = holder['run']()\n"
    "b = len\n"
    "print(result)\n"
)
_NESTED_DEFERRED_ESCAPE = (
    "def run():\n"
    "    return globals()['b'].eval('1+1')\n"
    "def wrapper():\n"
    "    return run()\n"
    "import builtins as b\n"
    "result = wrapper()\n"
    "b = len\n"
    "print(result)\n"
)
_ANNOTATED_ALIAS_ESCAPE = (
    "def run():\n"
    "    return globals()['b'].eval('1+1')\n"
    "alias: run = run\n"
    "del run\n"
    "del alias\n"
    "import builtins as b\n"
    "result = __annotations__['alias']()\n"
    "b = len\n"
    "print(result)\n"
)
_FINAL_REACHABLE = (
    "def run():\n"
    "    return globals()['b'].eval('1+1')\n"
    "import builtins as b\n"
    "result = 3\n"
    "print(result)\n"
)
_ASYNC_DEFERRED = (
    "async def run():\n"
    "    return globals()['b'].eval('1+1')\n"
    "import builtins as b\n"
    "b = len\n"
    "result = 3\n"
)
_GENERATOR_DEFERRED = (
    "def run():\n"
    "    yield globals()['b'].eval('1+1')\n"
    "import builtins as b\n"
    "b = len\n"
    "result = 3\n"
)
_NESTED_CALLABLE = (
    "def outer():\n"
    "    def inner():\n"
    "        return globals()['b'].eval('1+1')\n"
    "    return 3\n"
    "import builtins as b\n"
    "b = len\n"
    "result = outer()\n"
)

_R62K_RUNTIME_SOURCES = frozenset(
    {
        _TRANSIENT_REBOUND,
        _UNOBSERVED_UNREACHABLE,
        _DANGEROUS_DIRECT,
        _DANGEROUS_ALIAS,
        _CONTAINER_ESCAPE,
        _NESTED_DEFERRED_ESCAPE,
        _ANNOTATED_ALIAS_ESCAPE,
        _FINAL_REACHABLE,
    }
)
v8._CONTROLLED_IMPORTLIB_RUNTIME_SOURCES = (
    v8._CONTROLLED_IMPORTLIB_RUNTIME_SOURCES | _R62K_RUNTIME_SOURCES
)

_base_suite = v16._extended_r62g_probe_suite


def _extended_r62k_probe_suite() -> str:
    base = _base_suite()
    probes: dict[str, str] = {}

    # Exact predecessor false-positive families: CPython is safe, R62J remains
    # conservative, and R62K must remove only the unobservable authority.
    for name, source in {
        "transient_rebound": _TRANSIENT_REBOUND,
        "unobserved_unreachable": _UNOBSERVED_UNREACHABLE,
    }.items():
        probes[f"python_r62k_{name}"] = v6._python("run", source)
        probes[f"scanner_r62j_predecessor_{name}"] = _scanner_r62j(source)
        probes[f"scanner_r62k_{name}"] = _scanner_r62k(source)

    # Positive observations and fail-closed escape surfaces must remain marked.
    for name, source in {
        "dangerous_direct": _DANGEROUS_DIRECT,
        "dangerous_alias": _DANGEROUS_ALIAS,
        "container_escape": _CONTAINER_ESCAPE,
        "nested_deferred_escape": _NESTED_DEFERRED_ESCAPE,
        "annotated_alias_escape": _ANNOTATED_ALIAS_ESCAPE,
        "final_reachable": _FINAL_REACHABLE,
    }.items():
        probes[f"python_r62k_{name}"] = v6._python("run", source)
        probes[f"scanner_r62k_{name}"] = _scanner_r62k(source)

    # Contexts outside the bounded synchronous/direct-name precision model must
    # conservatively retain predecessor authority rather than becoming clean.
    for name, source in {
        "async_deferred": _ASYNC_DEFERRED,
        "generator_deferred": _GENERATOR_DEFERRED,
        "nested_callable": _NESTED_CALLABLE,
    }.items():
        probes[f"scanner_r62j_{name}"] = _scanner_r62j(source)
        probes[f"scanner_r62k_{name}"] = _scanner_r62k(source)

    text = json.dumps(probes, indent=2, sort_keys=True)
    print("QORE R62K observable deferred-globals evidence:\n" + text)
    return (
        base
        + "\n\nR62K OBSERVABLE DEFERRED-GLOBALS PROBES:\n"
        + compact.compact_clip(text, 50000)
    )


v7._extended_r62b_probe_suite = _extended_r62k_probe_suite


if __name__ == "__main__":
    raise SystemExit(v7.main())

#!/usr/bin/env python3
from __future__ import annotations

import json

import deepseek_reviewer_compact_budgeted_v6 as v6
import deepseek_reviewer_compact_budgeted_v7 as v7
import deepseek_reviewer_compact_budgeted_v8 as v8
import deepseek_reviewer_compact_budgeted_v9 as v9

budgeted = v6.budgeted
compact = v6.compact

# R74 completed successfully, but Integration Authority found a mandatory
# successor attack that R74 did not execute: a dangerous callable stored in a
# function/lambda default can later escape through an omitted argument. Keep the
# v9 hard 100k prompt ceiling and 12k final output allowance, but stop exploration
# before a third request so a no-thinking fallback remains conservatively
# admissible if the thinking final again spends its output on reasoning.
EXPLORATION_R62D_FINAL_RESERVE_STOP = 19_000
v6.v4.EXPLORATION_FINAL_RESERVE_STOP = EXPLORATION_R62D_FINAL_RESERVE_STOP
v6.v4.v3.EXPLORATION_STOP_PROMPT_TOKENS = EXPLORATION_R62D_FINAL_RESERVE_STOP

compact._SCANNER_TARGETS["r62d"] = (
    "test_universal_cross_asset_conformance_final_owner_r62d_guards",
    "_r62d_dynamic_execution_markers_from_source",
)
for _tool in budgeted.TOOLS:
    _function = _tool.get("function") or {}
    if _function.get("name") != "scanner_probe":
        continue
    _function["description"] = (
        "Run the exact frozen QORE static scanner on supplied source without "
        "executing that source. Use scanner=r60/r61/r62/r62b/r62c/r62d/"
        "final_owner and report the actual marker tuple from the checkout."
    )
    _enum = (
        _function.get("parameters", {})
        .get("properties", {})
        .get("scanner", {})
        .get("enum", [])
    )
    if "r62d" not in _enum:
        _enum.append("r62d")


def _scanner_r62d(source: str) -> str:
    return compact._scanner_probe({"scanner": "r62d", "source": source})


def _scanner_r62c(source: str) -> str:
    return compact._scanner_probe({"scanner": "r62c", "source": source})


# Make every inherited mandatory regression matrix exercise the candidate
# successor, not the consumed R62C predecessor. v9's successor-suite function
# resolves this global at execution time despite the historical name.
v6._scanner = _scanner_r62d
v9._scanner_r62c = _scanner_r62d

# Infrastructure-owned importlib-default witnesses only. The generic runtime
# sandbox remains unchanged and model-supplied import sources are still rejected.
_R62D_CONTROLLED_IMPORTLIB_RUNTIME_SOURCES = frozenset(
    {
        "import importlib\n"
        "def load(loader=importlib.import_module):\n"
        "    return loader\n"
        "module = load()('math')\n"
        "print(module.__name__)\n",
        "import importlib\n"
        "loader = (lambda candidate=importlib.import_module: candidate)()\n"
        "module = loader('math')\n"
        "print(module.__name__)\n",
    }
)
v8._CONTROLLED_IMPORTLIB_RUNTIME_SOURCES = (
    v8._CONTROLLED_IMPORTLIB_RUNTIME_SOURCES
    | _R62D_CONTROLLED_IMPORTLIB_RUNTIME_SOURCES
)

_base_successor_suite = v7._extended_r62b_probe_suite


def _extended_r62d_probe_suite() -> str:
    base = _base_successor_suite()
    probes: dict[str, str] = {}

    lambda_positional = '(lambda candidate=eval: candidate)()("1+1")\n'
    lambda_keyword = '(lambda *, candidate=eval: candidate)()("1+1")\n'
    lambda_computed = (
        "import builtins\n"
        "(lambda candidate=getattr(builtins, 'eval'): candidate)()('1+1')\n"
    )
    lambda_safe = '(lambda candidate=len: candidate)()("abc")\n'

    function_positional = (
        "def reveal(candidate=eval):\n"
        "    return candidate\n"
        "print(reveal()('1+1'))\n"
    )
    function_keyword = (
        "def reveal(*, candidate=eval):\n"
        "    return candidate\n"
        "print(reveal()('1+1'))\n"
    )
    function_computed = (
        "import builtins\n"
        "def reveal(candidate=getattr(builtins, 'eval')):\n"
        "    return candidate\n"
        "print(reveal()('1+1'))\n"
    )
    function_safe = (
        "def reveal(candidate=len):\n"
        "    return candidate\n"
        "print(reveal()('abc'))\n"
    )
    function_container = (
        "def reveal(candidates=(eval,)):\n"
        "    return candidates\n"
        "print(reveal()[0]('1+1'))\n"
    )

    probes["python_lambda_default_positional_eval"] = v6._python(
        "run", lambda_positional
    )
    probes["scanner_r62c_lambda_default_positional_eval"] = _scanner_r62c(
        lambda_positional
    )
    probes["scanner_r62d_lambda_default_positional_eval"] = _scanner_r62d(
        lambda_positional
    )
    probes["python_lambda_default_keyword_eval"] = v6._python(
        "run", lambda_keyword
    )
    probes["scanner_r62d_lambda_default_keyword_eval"] = _scanner_r62d(
        lambda_keyword
    )
    probes["scanner_r62d_lambda_default_computed_eval"] = _scanner_r62d(
        lambda_computed
    )
    probes["scanner_r62d_lambda_default_safe_len"] = _scanner_r62d(lambda_safe)

    probes["python_function_default_positional_eval"] = v6._python(
        "run", function_positional
    )
    probes["scanner_r62c_function_default_positional_eval"] = _scanner_r62c(
        function_positional
    )
    probes["scanner_r62d_function_default_positional_eval"] = _scanner_r62d(
        function_positional
    )
    probes["python_function_default_keyword_eval"] = v6._python(
        "run", function_keyword
    )
    probes["scanner_r62d_function_default_keyword_eval"] = _scanner_r62d(
        function_keyword
    )
    probes["scanner_r62d_function_default_computed_eval"] = _scanner_r62d(
        function_computed
    )
    probes["scanner_r62d_function_default_safe_len"] = _scanner_r62d(function_safe)
    probes["python_function_default_container_eval"] = v6._python(
        "run", function_container
    )
    probes["scanner_r62d_function_default_container_eval"] = _scanner_r62d(
        function_container
    )

    importlib_function = (
        "import importlib\n"
        "def load(loader=importlib.import_module):\n"
        "    return loader\n"
        "module = load()('math')\n"
        "print(module.__name__)\n"
    )
    importlib_lambda = (
        "import importlib\n"
        "loader = (lambda candidate=importlib.import_module: candidate)()\n"
        "module = loader('math')\n"
        "print(module.__name__)\n"
    )
    probes["python_function_default_importlib"] = v6._python(
        "run", importlib_function
    )
    probes["scanner_r62d_function_default_importlib"] = _scanner_r62d(
        importlib_function
    )
    probes["python_lambda_default_importlib"] = v6._python("run", importlib_lambda)
    probes["scanner_r62d_lambda_default_importlib"] = _scanner_r62d(importlib_lambda)

    text = json.dumps(probes, indent=2, sort_keys=True)
    print(
        "QORE R62D exact default-egress evidence "
        f"(explore_stop={EXPLORATION_R62D_FINAL_RESERVE_STOP}, "
        f"final_max_tokens={budgeted.FINAL_MAX_TOKENS}):\n{text}"
    )
    return base + "\n\nR62D EXACT DEFAULT-EGRESS PROBES:\n" + compact.compact_clip(
        text, 28000
    )


v7._extended_r62b_probe_suite = _extended_r62d_probe_suite


if __name__ == "__main__":
    raise SystemExit(v7.main())

#!/usr/bin/env python3
from __future__ import annotations

import json
from typing import Any

import deepseek_reviewer_compact_budgeted as compact
import deepseek_reviewer_compact_budgeted_v4 as v4

budgeted = v4.budgeted

# R70 produced useful executable evidence but reviewed the pre-R62B Core HEAD.
# R62B closes three material scanner false negatives: sensitive return egress,
# importlib.import_module, and CPython 3.12 keyword evaluation after a definitely
# failing starred positional expansion. Make the corrected exact scanner and a
# fixed executable matrix mandatory before final adjudication.
compact._SCANNER_TARGETS["r62b"] = (
    "test_universal_cross_asset_conformance_final_owner_r62b_guards",
    "_r62b_dynamic_execution_markers_from_source",
)
for _tool in budgeted.TOOLS:
    _function = _tool.get("function") or {}
    if _function.get("name") != "scanner_probe":
        continue
    _function["description"] = (
        "Run the exact frozen QORE static scanner on supplied source without "
        "executing that source. Use scanner=r60/r61/r62/r62b/final_owner and "
        "report the actual marker tuple from the checked-out HEAD."
    )
    _enum = (
        _function.get("parameters", {})
        .get("properties", {})
        .get("scanner", {})
        .get("enum", [])
    )
    if "r62b" not in _enum:
        _enum.append("r62b")

_MANDATORY_TOOL_NAME = "mandatory_r62b_probe_suite"
_executed_mandatory_suite = False


def _scanner(source: str) -> str:
    return compact._scanner_probe({"scanner": "r62b", "source": source})


def _python(mode: str, source: str) -> str:
    return compact._python_semantics_probe({"mode": mode, "source": source})


def _mandatory_r62b_probe_suite(_: dict[str, Any]) -> str:
    global _executed_mandatory_suite

    probes: dict[str, str] = {}

    probes["python_multistar_ast"] = _python("ast", "f(*a, *b)\n")
    probes["python_multistar_runtime"] = _python(
        "run",
        "def f(*args):\n"
        "    return args\n"
        "print(f(*(1,), *(2,)))\n",
    )
    probes["python_star_failure_ordering"] = _python(
        "run",
        "events = []\n"
        "def later(label):\n"
        "    events.append(label)\n"
        "    return label\n"
        "def f(*args, **kwargs):\n"
        "    return args, kwargs\n"
        "try:\n"
        "    f(*None, later('pos'))\n"
        "except TypeError:\n"
        "    pass\n"
        "print('pos', events)\n"
        "events.clear()\n"
        "try:\n"
        "    f(*None, key=later('kw'))\n"
        "except TypeError:\n"
        "    pass\n"
        "print('kw', events)\n",
    )
    probes["python_star_failure_keyword_exec"] = _python(
        "run",
        "seen = []\n"
        "def f(*args, **kwargs):\n"
        "    return args, kwargs\n"
        "try:\n"
        "    f(*None, candidate=seen.append(eval('1+1')))\n"
        "except TypeError:\n"
        "    pass\n"
        "print(seen)\n",
    )
    probes["python_direct_return_runtime"] = _python(
        "run",
        "def get_eval():\n"
        "    return eval\n"
        "print(get_eval()('1+1'))\n",
    )
    probes["python_importlib_runtime"] = _python(
        "run",
        "import importlib\n"
        "module = importlib.import_module('math')\n"
        "print(module.__name__)\n",
    )

    scanner_sources = {
        "scanner_positional_eval": (
            "def reveal(arguments, candidate):\n"
            "    return {'x': candidate}.__getitem__(*arguments)\n"
            "reveal(('x',), eval)('1+1')\n"
        ),
        "scanner_direct_keyword_eval": (
            "def reveal(arguments, candidate):\n"
            "    return {'x': candidate}.__getitem__(*arguments)\n"
            "reveal(('x',), candidate=eval)('1+1')\n"
        ),
        "scanner_computed_keyword_getattr": (
            "import builtins\n"
            "def reveal(arguments, candidate):\n"
            "    return {'x': candidate}.__getitem__(*arguments)\n"
            "reveal(('x',), candidate=getattr(builtins, 'eval'))('1+1')\n"
        ),
        "scanner_computed_keyword_subscript": (
            "import builtins\n"
            "def reveal(arguments, candidate):\n"
            "    return {'x': candidate}.__getitem__(*arguments)\n"
            "reveal(('x',), candidate=builtins.__dict__['eval'])('1+1')\n"
        ),
        "scanner_keyword_unpack_eval": (
            "def reveal(arguments, candidate):\n"
            "    return {'x': candidate}.__getitem__(*arguments)\n"
            "reveal(('x',), **{'candidate': eval})('1+1')\n"
        ),
        "scanner_safe_direct_len": (
            "def reveal(arguments, candidate):\n"
            "    return {'x': candidate}.__getitem__(*arguments)\n"
            "reveal(('x',), candidate=len)('abc')\n"
        ),
        "scanner_safe_computed_len": (
            "import builtins\n"
            "def reveal(arguments, candidate):\n"
            "    return {'x': candidate}.__getitem__(*arguments)\n"
            "reveal(('x',), candidate=getattr(builtins, 'len'))('abc')\n"
        ),
        "scanner_multistar_eval": (
            "def consume(*arguments):\n"
            "    return arguments\n"
            "consume(*('safe',), *(eval,))\n"
        ),
        "scanner_star_failure_positional_value": (
            "def consume(*arguments):\n"
            "    return arguments\n"
            "consume(*None, eval)\n"
        ),
        "scanner_star_failure_positional_exec": (
            "def consume(*arguments):\n"
            "    return arguments\n"
            "consume(*None, eval('1+1'))\n"
        ),
        "scanner_star_failure_keyword_value": (
            "def consume(*arguments, **keywords):\n"
            "    return arguments, keywords\n"
            "consume(*None, candidate=eval)\n"
        ),
        "scanner_star_failure_keyword_exec": (
            "def consume(*arguments, **keywords):\n"
            "    return arguments, keywords\n"
            "consume(*None, candidate=eval('1+1'))\n"
        ),
        "scanner_star_failure_safe_keyword": (
            "def consume(*arguments, **keywords):\n"
            "    return arguments, keywords\n"
            "consume(*None, candidate=len('abc'))\n"
        ),
        "scanner_direct_return_eval": (
            "def get_eval():\n"
            "    return eval\n"
            "get_eval()('1+1')\n"
        ),
        "scanner_computed_return_eval": (
            "import builtins\n"
            "def get_eval():\n"
            "    return getattr(builtins, 'eval')\n"
            "get_eval()('1+1')\n"
        ),
        "scanner_safe_return_len": (
            "def get_len():\n"
            "    return len\n"
            "get_len()('abc')\n"
        ),
        "scanner_getattr_dunder_import": (
            "import builtins\n"
            "getattr(builtins, '__import__')('math')\n"
        ),
        "scanner_vars_eval": (
            "import builtins\n"
            "vars(builtins)['eval']('1+1')\n"
        ),
        "scanner_builtins_dict_eval": (
            "import builtins\n"
            "builtins.__dict__['eval']('1+1')\n"
        ),
        "scanner_importlib_import_module": (
            "import importlib\n"
            "importlib.import_module('math')\n"
        ),
        "scanner_importlib_module_alias": (
            "import importlib as il\n"
            "loader = il.import_module\n"
            "loader('math')\n"
        ),
        "scanner_importlib_from_alias": (
            "from importlib import import_module as loader\n"
            "loader('math')\n"
        ),
        "scanner_safe_importlib_attribute": (
            "import importlib\n"
            "value = importlib.util\n"
        ),
    }
    for name, source in scanner_sources.items():
        probes[name] = _scanner(source)

    _executed_mandatory_suite = True
    text = json.dumps(probes, indent=2, sort_keys=True)
    print("QORE mandatory R62B executable evidence:\n" + text)
    return compact.compact_clip(text, 36000)


budgeted.TOOLS.append(
    {
        "type": "function",
        "function": {
            "name": _MANDATORY_TOOL_NAME,
            "description": (
                "MANDATORY FIRST-ROUND tool. Execute the fixed read-only R62B/CPython "
                "probe matrix required for final-owner recertification. The final "
                "review is mechanically blocked unless this exact tool executes."
            ),
            "parameters": {
                "type": "object",
                "properties": {},
                "additionalProperties": False,
            },
        },
    }
)
budgeted.reviewer.TOOL_IMPL[_MANDATORY_TOOL_NAME] = _mandatory_r62b_probe_suite

_guarded_send_request_v4 = budgeted.send_request


def guarded_send_request_v6(
    *,
    stage: str,
    round_number: int,
    messages: list[dict[str, Any]],
    thinking: bool,
    tools: bool,
    max_tokens: int,
    model: str,
) -> dict[str, Any]:
    if stage.startswith("final") and not _executed_mandatory_suite:
        raise RuntimeError(
            "mandatory R62B executable evidence missing: reviewer must call "
            f"{_MANDATORY_TOOL_NAME} before final adjudication"
        )
    return _guarded_send_request_v4(
        stage=stage,
        round_number=round_number,
        messages=messages,
        thinking=thinking,
        tools=tools,
        max_tokens=max_tokens,
        model=model,
    )


budgeted.send_request = guarded_send_request_v6


if __name__ == "__main__":
    raise SystemExit(budgeted.main())

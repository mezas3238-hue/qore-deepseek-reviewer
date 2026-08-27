#!/usr/bin/env python3
from __future__ import annotations

import json
from typing import Any

import deepseek_reviewer_compact_budgeted as compact
import deepseek_reviewer_compact_budgeted_v4 as v4

budgeted = v4.budgeted

# R69 proved that token budgeting and publication now work, but the semantic
# reviewer still emitted VALIDACIÓN OK without executing mandatory probes and
# misstated the actual MRO (R59 deliberately resumes from R57, not R58).
# Make executable evidence a reviewer-infrastructure gate rather than a prompt
# suggestion. The suite is read-only: scanner probes never execute adversarial
# source; runtime probes are bounded by compact._validate_runtime_probe.
_MANDATORY_TOOL_NAME = "mandatory_r62_probe_suite"
_executed_mandatory_suite = False


def _scanner(source: str) -> str:
    return compact._scanner_probe({"scanner": "r62", "source": source})


def _python(mode: str, source: str) -> str:
    return compact._python_semantics_probe({"mode": mode, "source": source})


def _mandatory_r62_probe_suite(_: dict[str, Any]) -> str:
    global _executed_mandatory_suite

    probes: dict[str, str] = {}

    probes["python_multistar_ast"] = _python(
        "ast",
        'f(*a, *b)\n',
    )
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
        "scanner_star_failure_positional": (
            "def consume(*arguments):\n"
            "    return arguments\n"
            "consume(*None, eval)\n"
        ),
        "scanner_star_failure_keyword": (
            "def consume(*arguments, **keywords):\n"
            "    return arguments, keywords\n"
            "consume(*None, candidate=eval)\n"
        ),
        "scanner_star_failure_keyword_exec": (
            "seen = []\n"
            "def consume(*arguments, **keywords):\n"
            "    return arguments, keywords\n"
            "consume(*None, candidate=seen.append(eval('1+1')))\n"
        ),
        "scanner_direct_return_eval": (
            "def get_eval():\n"
            "    return eval\n"
            "get_eval()('1+1')\n"
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
    }
    for name, source in scanner_sources.items():
        probes[name] = _scanner(source)

    _executed_mandatory_suite = True
    text = json.dumps(probes, indent=2, sort_keys=True)
    # Persist the exact executable evidence in Actions logs as well as the
    # reviewer's evidence bundle so Integration Authority can adjudicate it
    # independently even if the model summarizes it poorly.
    print("QORE mandatory R62 executable evidence:\n" + text)
    return compact.compact_clip(text, 30000)


budgeted.TOOLS.append(
    {
        "type": "function",
        "function": {
            "name": _MANDATORY_TOOL_NAME,
            "description": (
                "MANDATORY FIRST-ROUND tool. Execute the fixed read-only R62/CPython "
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
budgeted.reviewer.TOOL_IMPL[_MANDATORY_TOOL_NAME] = _mandatory_r62_probe_suite

_guarded_send_request_v4 = budgeted.send_request


def guarded_send_request_v5(
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
            "mandatory R62 executable evidence missing: reviewer must call "
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


budgeted.send_request = guarded_send_request_v5


if __name__ == "__main__":
    raise SystemExit(budgeted.main())

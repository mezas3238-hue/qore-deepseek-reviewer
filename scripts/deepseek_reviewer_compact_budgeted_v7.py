#!/usr/bin/env python3
from __future__ import annotations

import json
from typing import Any

import deepseek_reviewer_compact_budgeted_v6 as v6

budgeted = v6.budgeted
compact = v6.compact


def _extended_r62b_probe_suite() -> str:
    """Execute mandatory evidence before any model call and extend R62B attacks."""

    base = v6._mandatory_r62b_probe_suite({})
    probes: dict[str, str] = {}

    probes["python_lambda_return_eval_runtime"] = v6._python(
        "run",
        "print((lambda: eval)()('1+1'))\n",
    )
    probes["scanner_lambda_return_eval"] = v6._scanner(
        "(lambda: eval)()('1+1')\n"
    )
    probes["scanner_lambda_return_len_safe"] = v6._scanner(
        "(lambda: len)()('abc')\n"
    )

    probes["python_importlib_getattr_runtime"] = v6._python(
        "run",
        "import importlib\n"
        "module = getattr(importlib, 'import_module')('math')\n"
        "print(module.__name__)\n",
    )
    probes["scanner_importlib_getattr"] = v6._scanner(
        "import importlib\n"
        "getattr(importlib, 'import_module')('math')\n"
    )
    probes["scanner_importlib_getattr_safe"] = v6._scanner(
        "import importlib\n"
        "value = getattr(importlib, 'util')\n"
    )

    probes["python_importlib_dict_runtime"] = v6._python(
        "run",
        "import importlib\n"
        "module = importlib.__dict__['import_module']('math')\n"
        "print(module.__name__)\n",
    )
    probes["scanner_importlib_dict"] = v6._scanner(
        "import importlib\n"
        "importlib.__dict__['import_module']('math')\n"
    )

    probes["python_importlib_vars_runtime"] = v6._python(
        "run",
        "import importlib\n"
        "module = vars(importlib)['import_module']('math')\n"
        "print(module.__name__)\n",
    )
    probes["scanner_importlib_vars"] = v6._scanner(
        "import importlib\n"
        "vars(importlib)['import_module']('math')\n"
    )

    text = json.dumps(probes, indent=2, sort_keys=True)
    print("QORE extended R62B executable evidence:\n" + text)
    return base + "\n\nEXTENDED R62B PROBES:\n" + compact.compact_clip(text, 18000)


def main() -> int:
    # Execute the exact mandatory matrix deterministically. R71 proved that
    # relying on a non-thinking explorer to choose one particular tool is not a
    # valid evidence gate. This happens before the first DeepSeek API request.
    evidence = _extended_r62b_probe_suite()

    # The v6 final guard remains active; the base mandatory suite sets its
    # execution flag. If DeepSeek asks for the mandatory tool anyway, return the
    # frozen pre-executed evidence rather than executing the probes twice.
    budgeted.reviewer.TOOL_IMPL[v6._MANDATORY_TOOL_NAME] = (
        lambda _arguments: evidence
    )

    prompt_path = budgeted.reviewer.PROMPT_PATH
    original_prompt = prompt_path.read_text(encoding="utf-8")
    injected_prompt = (
        original_prompt
        + "\n\n## PRE-EXECUTED MANDATORY EVIDENCE — AUTHORITATIVE RAW OUTPUT\n\n"
        + "Reviewer infrastructure executed this matrix deterministically before "
        + "the first model call. You MUST adjudicate it; you do not need to request "
        + "the mandatory tool again.\n\n"
        + evidence
        + "\n"
    )
    prompt_path.write_text(injected_prompt, encoding="utf-8")
    try:
        return budgeted.main()
    finally:
        prompt_path.write_text(original_prompt, encoding="utf-8")


if __name__ == "__main__":
    raise SystemExit(main())

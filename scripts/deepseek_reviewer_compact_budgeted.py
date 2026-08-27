#!/usr/bin/env python3
from __future__ import annotations

import ast
import json
import os
import pathlib
import re
import subprocess
import sys
from typing import Any

import deepseek_reviewer_budgeted as budgeted

# Compact-review policy: 60k-80k cumulative prompt input is the preferred
# operating target when sufficient, while 100k is the actual hard ceiling.
# Preflight uses a deliberately conservative UTF-8 request-size upper bound;
# exceeding the preferred target is advisory, but exceeding the hard ceiling
# blocks the call. Actual API prompt usage is checked again after every call.
HARD_TOTAL_PROMPT_TOKENS = int(
    os.environ.get("DEEPSEEK_MAX_TOTAL_PROMPT_TOKENS", "100000")
)
TARGET_PREFLIGHT_UPPER_BOUND = int(
    os.environ.get("DEEPSEEK_TARGET_TOTAL_PROMPT_TOKENS", "80000")
)
PROTOCOL_TOKEN_RESERVE = int(
    os.environ.get("DEEPSEEK_PROMPT_PROTOCOL_TOKEN_RESERVE", "8192")
)

if TARGET_PREFLIGHT_UPPER_BOUND > HARD_TOTAL_PROMPT_TOKENS:
    raise RuntimeError(
        "DEEPSEEK_TARGET_TOTAL_PROMPT_TOKENS must not exceed the hard prompt-token ceiling"
    )
if PROTOCOL_TOKEN_RESERVE <= 0:
    raise RuntimeError("DEEPSEEK_PROMPT_PROTOCOL_TOKEN_RESERVE must be positive")

# Keep retrieval bounded enough that the final falsification pass normally lands
# in the preferred 60k-80k cumulative input range rather than merely below 100k.
budgeted.MAX_EXPLORER_ROUNDS = int(os.environ.get("DEEPSEEK_MAX_EXPLORER_ROUNDS", "5"))
budgeted.MAX_TOOL_CALLS_PER_ROUND = int(
    os.environ.get("DEEPSEEK_MAX_TOOL_CALLS_PER_ROUND", "8")
)
budgeted.MAX_EXPLORATION_CONTEXT_CHARS = int(
    os.environ.get("DEEPSEEK_MAX_EXPLORATION_CONTEXT_CHARS", "60000")
)
budgeted.MAX_TOOL_TEXT = int(os.environ.get("DEEPSEEK_MAX_TOOL_TEXT", "7000"))
budgeted.MAX_EVIDENCE_CHARS = int(os.environ.get("DEEPSEEK_MAX_EVIDENCE_CHARS", "50000"))
budgeted.EXPLORATION_PROMPT_BUDGET = int(
    os.environ.get("DEEPSEEK_EXPLORATION_PROMPT_TOKEN_BUDGET", "45000")
)
budgeted.EXPLORATION_CACHE_MISS_BUDGET = int(
    os.environ.get("DEEPSEEK_EXPLORATION_CACHE_MISS_TOKEN_BUDGET", "35000")
)
budgeted.EXPLORER_MAX_TOKENS = int(
    os.environ.get("DEEPSEEK_EXPLORER_MAX_TOKENS", "1800")
)


def compact_clip(text: str, limit: int | None = None) -> str:
    actual_limit = budgeted.MAX_TOOL_TEXT if limit is None else limit
    if len(text) <= actual_limit:
        return text
    head = max(1, (actual_limit * 3) // 4)
    tail = max(1, actual_limit - head)
    omitted = len(text) - head - tail
    return (
        text[:head]
        + f"\n...[{omitted} characters omitted by compact input budget]...\n"
        + text[-tail:]
    )


budgeted.compact_clip = compact_clip
budgeted.reviewer.clip = compact_clip


# The hosted runner does not guarantee ripgrep. Use Git's own tracked-file
# search so evidence collection never depends on an optional executable.
def _git_search_text(args: dict[str, Any]) -> str:
    query = str(args["query"])
    prefix = str(args.get("path", "."))
    max_results = max(1, min(int(args.get("max_results", 80)), 200))
    budgeted.reviewer.safe_path(prefix)
    proc = subprocess.run(
        ["git", "grep", "-n", "-F", "-e", query, "--", prefix],
        cwd=budgeted.reviewer.ROOT,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        timeout=30,
        check=False,
        env={
            "PATH": os.environ.get("PATH", "/usr/bin:/bin"),
            "HOME": "/tmp",
        },
    )
    if proc.returncode == 1:
        return ""
    if proc.returncode != 0:
        return compact_clip(f"EXIT={proc.returncode}\n{proc.stdout}")
    return "\n".join(proc.stdout.splitlines()[:max_results])


budgeted.reviewer.TOOL_IMPL["search_text"] = _git_search_text
for _tool in budgeted.TOOLS:
    _function = _tool.get("function") or {}
    if _function.get("name") == "search_text":
        _function["description"] = (
            "Literal text search over tracked files in the exact checkout using native "
            "git grep; no ripgrep dependency."
        )


def _probe_env(*, include_qore: bool = False) -> dict[str, str]:
    env = {
        "PATH": os.environ.get("PATH", "/usr/bin:/bin"),
        "HOME": "/tmp",
        "PYTHONNOUSERSITE": "1",
        "PYTHONDONTWRITEBYTECODE": "1",
    }
    if include_qore:
        root = budgeted.reviewer.ROOT
        env["PYTHONPATH"] = os.pathsep.join(
            [str(root / "src"), str(root / "tests" / "infrastructure")]
        )
    return env


def _validate_runtime_probe(tree: ast.AST) -> None:
    allowed_imports = {"ast", "builtins", "operator"}
    denied_call_names = {
        "open",
        "exec",
        "compile",
        "__import__",
        "input",
        "breakpoint",
    }
    denied_attributes = {
        "open",
        "exec",
        "compile",
        "__import__",
        "system",
        "popen",
        "remove",
        "unlink",
        "rmdir",
        "rmtree",
        "write_text",
        "write_bytes",
    }
    denied_literal_strings = {
        "__import__",
        "open",
        "exec",
        "compile",
        "os",
        "sys",
        "subprocess",
        "socket",
        "pathlib",
    }

    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            if any(alias.name.split(".", 1)[0] not in allowed_imports for alias in node.names):
                raise ValueError("runtime probe import outside allowlist")
        elif isinstance(node, ast.ImportFrom):
            module = node.module or ""
            if module.split(".", 1)[0] not in allowed_imports:
                raise ValueError("runtime probe import-from outside allowlist")
        elif isinstance(node, ast.Call):
            if isinstance(node.func, ast.Name) and node.func.id in denied_call_names:
                raise ValueError(f"runtime probe call not allowed: {node.func.id}")
            if isinstance(node.func, ast.Attribute) and node.func.attr in denied_attributes:
                raise ValueError(f"runtime probe attribute call not allowed: {node.func.attr}")
            is_eval = (
                isinstance(node.func, ast.Name)
                and node.func.id == "eval"
                or isinstance(node.func, ast.Attribute)
                and node.func.attr == "eval"
            )
            if is_eval:
                if not node.args or not isinstance(node.args[0], ast.Constant):
                    raise ValueError("runtime probe eval requires a literal arithmetic expression")
                expression = node.args[0].value
                if not isinstance(expression, str) or re.fullmatch(
                    r"[0-9+\-*/%(). ]{1,120}", expression
                ) is None:
                    raise ValueError("runtime probe eval expression is outside safe arithmetic subset")
        elif isinstance(node, ast.Constant) and isinstance(node.value, str):
            if node.value in denied_literal_strings:
                raise ValueError(f"runtime probe sensitive literal not allowed: {node.value}")
            if len(node.value) > 2000:
                raise ValueError("runtime probe string literal too long")


def _python_semantics_probe(args: dict[str, Any]) -> str:
    source = str(args["source"])
    mode = str(args.get("mode", "ast"))
    if len(source) > 6000:
        raise ValueError("python probe source exceeds 6000 characters")
    tree = ast.parse(source)

    if mode == "ast":
        calls: list[dict[str, Any]] = []
        for node in ast.walk(tree):
            if not isinstance(node, ast.Call):
                continue
            calls.append(
                {
                    "lineno": node.lineno,
                    "arg_count": len(node.args),
                    "arg_types": [type(argument).__name__ for argument in node.args],
                    "keyword_count": len(node.keywords),
                }
            )
        payload = {
            "python": sys.version,
            "calls": calls,
            "ast": ast.dump(tree, include_attributes=False, indent=2),
        }
        return compact_clip(json.dumps(payload, indent=2))

    if mode != "run":
        raise ValueError("python probe mode must be 'ast' or 'run'")
    _validate_runtime_probe(tree)
    proc = subprocess.run(
        [sys.executable, "-I", "-B", "-c", source],
        cwd=pathlib.Path("/tmp"),
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        timeout=8,
        check=False,
        env=_probe_env(),
    )
    return compact_clip(
        f"python={sys.version}\nEXIT={proc.returncode}\n{proc.stdout}"
    )


_SCANNER_TARGETS = {
    "r60": (
        "test_universal_cross_asset_conformance_final_owner_r60_guards",
        "_r60_dynamic_execution_markers_from_source",
    ),
    "r61": (
        "test_universal_cross_asset_conformance_final_owner_r61_guards",
        "_r61_dynamic_execution_markers_from_source",
    ),
    "final_owner": (
        "test_universal_cross_asset_conformance_final_owner_guards",
        "_dynamic_import_or_execution_markers_from_source",
    ),
}


def _scanner_probe(args: dict[str, Any]) -> str:
    scanner = str(args.get("scanner", "r61"))
    source = str(args["source"])
    if scanner not in _SCANNER_TARGETS:
        raise ValueError("scanner must be one of r60, r61, final_owner")
    if len(source) > 10000:
        raise ValueError("scanner probe source exceeds 10000 characters")
    module_name, function_name = _SCANNER_TARGETS[scanner]
    driver = (
        "import importlib, json, sys\n"
        "module = importlib.import_module(sys.argv[1])\n"
        "function = getattr(module, sys.argv[2])\n"
        "source = json.loads(sys.argv[3])\n"
        "print(repr(function(source)))\n"
    )
    proc = subprocess.run(
        [
            sys.executable,
            "-B",
            "-c",
            driver,
            module_name,
            function_name,
            json.dumps(source),
        ],
        cwd=budgeted.reviewer.ROOT / "tests" / "infrastructure",
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        timeout=15,
        check=False,
        env=_probe_env(include_qore=True),
    )
    return compact_clip(
        f"python={sys.version}\nscanner={scanner}\nEXIT={proc.returncode}\n{proc.stdout}"
    )


budgeted.TOOLS.extend(
    [
        {
            "type": "function",
            "function": {
                "name": "python_semantics_probe",
                "description": (
                    "READ-ONLY bounded CPython probe. mode=ast parses source and reports "
                    "Call argument AST shapes; mode=run executes only a restricted safe "
                    "stdlib subset in an isolated environment with no QORE/reviewer secrets."
                ),
                "parameters": {
                    "type": "object",
                    "properties": {
                        "source": {"type": "string"},
                        "mode": {"type": "string", "enum": ["ast", "run"]},
                    },
                    "required": ["source", "mode"],
                    "additionalProperties": False,
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "scanner_probe",
                "description": (
                    "Run the exact frozen QORE static scanner on supplied source without "
                    "executing that source. Use scanner=r61/r60/final_owner and report the "
                    "actual marker tuple from the checked-out HEAD."
                ),
                "parameters": {
                    "type": "object",
                    "properties": {
                        "scanner": {
                            "type": "string",
                            "enum": ["r60", "r61", "final_owner"],
                        },
                        "source": {"type": "string"},
                    },
                    "required": ["scanner", "source"],
                    "additionalProperties": False,
                },
            },
        },
    ]
)
budgeted.reviewer.TOOL_IMPL["python_semantics_probe"] = _python_semantics_probe
budgeted.reviewer.TOOL_IMPL["scanner_probe"] = _scanner_probe

_original_send_request = budgeted.send_request


def _request_payload_upper_bound(
    *,
    messages: list[dict[str, Any]],
    thinking: bool,
    tools: bool,
    max_tokens: int,
    model: str,
) -> int:
    payload: dict[str, Any] = {
        "model": model,
        "messages": messages,
        "stream": False,
        "max_tokens": max_tokens,
        "thinking": {"type": "enabled" if thinking else "disabled"},
    }
    if thinking:
        payload["reasoning_effort"] = "high"
    if tools:
        payload["tools"] = budgeted.TOOLS
        payload["tool_choice"] = "auto"

    # DeepSeek tokenization is server-side. UTF-8 request bytes are deliberately
    # used as a conservative preflight proxy: one input token cannot require
    # more independent budget units than one request byte for the JSON text we
    # send, while the explicit reserve covers chat/protocol framing not present
    # in the serialized request body.
    return len(
        json.dumps(payload, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    )


def guarded_send_request(
    *,
    stage: str,
    round_number: int,
    messages: list[dict[str, Any]],
    thinking: bool,
    tools: bool,
    max_tokens: int,
    model: str,
) -> dict[str, Any]:
    request_upper_bound = _request_payload_upper_bound(
        messages=messages,
        thinking=thinking,
        tools=tools,
        max_tokens=max_tokens,
        model=model,
    )
    projected = (
        budgeted.TOTALS["prompt_tokens"]
        + request_upper_bound
        + PROTOCOL_TOKEN_RESERVE
    )
    if projected > HARD_TOTAL_PROMPT_TOKENS:
        raise RuntimeError(
            "compact DeepSeek preflight blocked model call at hard ceiling: "
            f"stage={stage} round={round_number} actual_prompt_so_far="
            f"{budgeted.TOTALS['prompt_tokens']} request_utf8_bytes="
            f"{request_upper_bound} reserve={PROTOCOL_TOKEN_RESERVE} "
            f"projected_upper_bound={projected} target="
            f"{TARGET_PREFLIGHT_UPPER_BOUND} hard={HARD_TOTAL_PROMPT_TOKENS}"
        )
    if projected > TARGET_PREFLIGHT_UPPER_BOUND:
        print(
            "DeepSeek compact preflight advisory: preferred target exceeded by "
            "conservative upper bound, but hard ceiling remains satisfied: "
            f"stage={stage} round={round_number} actual_prompt_so_far="
            f"{budgeted.TOTALS['prompt_tokens']} request_utf8_bytes="
            f"{request_upper_bound} reserve={PROTOCOL_TOKEN_RESERVE} "
            f"projected_upper_bound={projected} target="
            f"{TARGET_PREFLIGHT_UPPER_BOUND} hard={HARD_TOTAL_PROMPT_TOKENS}"
        )

    result = _original_send_request(
        stage=stage,
        round_number=round_number,
        messages=messages,
        thinking=thinking,
        tools=tools,
        max_tokens=max_tokens,
        model=model,
    )
    actual = budgeted.TOTALS["prompt_tokens"]
    if actual > HARD_TOTAL_PROMPT_TOKENS:
        raise RuntimeError(
            "DeepSeek hard prompt-token ceiling breached despite conservative preflight: "
            f"actual={actual} hard={HARD_TOTAL_PROMPT_TOKENS}"
        )
    return result


budgeted.send_request = guarded_send_request


if __name__ == "__main__":
    raise SystemExit(budgeted.main())

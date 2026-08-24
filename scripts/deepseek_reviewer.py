#!/usr/bin/env python3
from __future__ import annotations

import json
import os
import pathlib
import re
import subprocess
import sys
import urllib.error
import urllib.request
from typing import Any

ROOT = pathlib.Path(os.environ["QORE_ROOT"]).resolve()
REPO = "mezas3238-hue/qore-core"
PR_NUMBER = os.environ["PR_NUMBER"]
EXPECTED_BASE = os.environ["EXPECTED_BASE"]
EXPECTED_HEAD = os.environ["EXPECTED_HEAD"]
EXPECTED_SYNTHETIC = os.environ["EXPECTED_SYNTHETIC"]
PACKAGE_ID = os.environ["PACKAGE_ID"]
MODE = os.environ.get("REVIEW_MODE", "expert")
PROMPT_PATH = pathlib.Path(os.environ["PROMPT_PATH"]).resolve()
OUTPUT = pathlib.Path(os.environ.get("REVIEW_OUTPUT", "deepseek-review.md")).resolve()
API_KEY = os.environ["DEEPSEEK_API_KEY"]
GH_TOKEN = os.environ["GH_TOKEN"]
MODEL = os.environ.get("DEEPSEEK_MODEL", "deepseek-v4-pro")
API_URL = "https://api.deepseek.com/chat/completions"
MAX_TOOL_TEXT = 45000


def clip(text: str, limit: int = MAX_TOOL_TEXT) -> str:
    if len(text) <= limit:
        return text
    return text[:limit] + f"\n...[truncated at {limit} characters]"


def run(args: list[str], *, cwd: pathlib.Path = ROOT, timeout: int = 90) -> str:
    proc = subprocess.run(
        args,
        cwd=cwd,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        timeout=timeout,
        check=False,
        env={**os.environ, "GH_TOKEN": GH_TOKEN},
    )
    out = proc.stdout
    if proc.returncode != 0:
        return clip(f"EXIT={proc.returncode}\n{out}")
    return clip(out)


def safe_path(relative: str) -> pathlib.Path:
    if relative.startswith("/"):
        raise ValueError("absolute paths are not allowed")
    candidate = (ROOT / relative).resolve()
    if candidate != ROOT and ROOT not in candidate.parents:
        raise ValueError("path escapes repository")
    return candidate


def line_slice(text: str, start_line: int, end_line: int) -> str:
    lines = text.splitlines()
    start = max(1, start_line)
    end = min(len(lines), end_line)
    if end < start:
        return ""
    return "\n".join(f"{idx}: {lines[idx - 1]}" for idx in range(start, end + 1))


def tool_repo_state(_: dict[str, Any]) -> str:
    changed = run(["git", "diff", "--name-status", EXPECTED_BASE, EXPECTED_HEAD])
    stat = run(["git", "diff", "--stat", EXPECTED_BASE, EXPECTED_HEAD])
    head_tree = run(["git", "show", "-s", "--format=%T", EXPECTED_HEAD]).strip()
    base_tree = run(["git", "show", "-s", "--format=%T", EXPECTED_BASE]).strip()
    syn_tree = run(["git", "show", "-s", "--format=%T", EXPECTED_SYNTHETIC]).strip()
    parents = run(["git", "show", "-s", "--format=%P", EXPECTED_SYNTHETIC]).strip()
    head_now = run(["git", "rev-parse", "HEAD"]).strip()
    blobs = run(["git", "ls-tree", "-r", EXPECTED_HEAD])
    return clip(
        json.dumps(
            {
                "package_id": PACKAGE_ID,
                "mode": MODE,
                "expected_base": EXPECTED_BASE,
                "expected_head": EXPECTED_HEAD,
                "expected_synthetic": EXPECTED_SYNTHETIC,
                "checkout_head": head_now,
                "base_tree": base_tree,
                "head_tree": head_tree,
                "synthetic_tree": syn_tree,
                "synthetic_parents": parents,
                "changed": changed,
                "stat": stat,
                "head_tree_entries": blobs,
            },
            indent=2,
        )
    )


def tool_read_file(args: dict[str, Any]) -> str:
    path = safe_path(str(args["path"]))
    start = int(args.get("start_line", 1))
    end = int(args.get("end_line", start + 399))
    if end - start > 799:
        end = start + 799
    text = path.read_text(encoding="utf-8")
    return clip(line_slice(text, start, end))


def tool_list_files(args: dict[str, Any]) -> str:
    prefix = str(args.get("path", "."))
    safe_path(prefix)
    return run(["git", "ls-files", prefix])


def tool_search_text(args: dict[str, Any]) -> str:
    query = str(args["query"])
    prefix = str(args.get("path", "."))
    max_results = max(1, min(int(args.get("max_results", 80)), 200))
    safe_path(prefix)
    out = run(["rg", "-n", "--fixed-strings", "--", query, prefix])
    return "\n".join(out.splitlines()[:max_results])


def tool_git_diff(args: dict[str, Any]) -> str:
    path = str(args.get("path", ""))
    cmd = ["git", "diff", "--find-renames", EXPECTED_BASE, EXPECTED_HEAD]
    if path:
        safe_path(path)
        cmd.extend(["--", path])
    return run(cmd)


def tool_git_show(args: dict[str, Any]) -> str:
    ref = str(args.get("ref", EXPECTED_HEAD))
    if ref not in {EXPECTED_BASE, EXPECTED_HEAD, EXPECTED_SYNTHETIC}:
        raise ValueError("ref must be BASE, HEAD, or SYNTHETIC")
    path = str(args["path"])
    safe_path(path)
    text = run(["git", "show", f"{ref}:{path}"])
    start = int(args.get("start_line", 1))
    end = int(args.get("end_line", start + 399))
    if end - start > 799:
        end = start + 799
    return clip(line_slice(text, start, end))


def tool_github_get(args: dict[str, Any]) -> str:
    endpoint = str(args["endpoint"])
    allowed = f"/repos/{REPO}"
    if not (endpoint == allowed or endpoint.startswith(allowed + "/")):
        raise ValueError("GitHub endpoint outside qore-core is not allowed")
    if any(ch in endpoint for ch in ["\n", "\r"]):
        raise ValueError("invalid endpoint")
    return run(["gh", "api", endpoint])


TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "repo_state",
            "description": "Return exact frozen BASE/HEAD/SYNTHETIC git state, trees, parents, changed files, diff stat and HEAD tree entries.",
            "parameters": {"type": "object", "properties": {}, "additionalProperties": False},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "read_file",
            "description": "Read a UTF-8 repository file with line numbers. Use repeated ranges to inspect full long files.",
            "parameters": {
                "type": "object",
                "properties": {
                    "path": {"type": "string"},
                    "start_line": {"type": "integer", "minimum": 1},
                    "end_line": {"type": "integer", "minimum": 1},
                },
                "required": ["path"],
                "additionalProperties": False,
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "list_files",
            "description": "List tracked files under a repository path.",
            "parameters": {
                "type": "object",
                "properties": {"path": {"type": "string"}},
                "additionalProperties": False,
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "search_text",
            "description": "Literal text search over the checked-out repository using ripgrep.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string"},
                    "path": {"type": "string"},
                    "max_results": {"type": "integer", "minimum": 1, "maximum": 200},
                },
                "required": ["query"],
                "additionalProperties": False,
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "git_diff",
            "description": "Read the exact BASE..HEAD diff, optionally restricted to one path.",
            "parameters": {
                "type": "object",
                "properties": {"path": {"type": "string"}},
                "additionalProperties": False,
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "git_show",
            "description": "Read a file at exact BASE, HEAD, or SYNTHETIC with line numbers.",
            "parameters": {
                "type": "object",
                "properties": {
                    "ref": {"type": "string"},
                    "path": {"type": "string"},
                    "start_line": {"type": "integer", "minimum": 1},
                    "end_line": {"type": "integer", "minimum": 1},
                },
                "required": ["path"],
                "additionalProperties": False,
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "github_get",
            "description": "Perform a READ-ONLY GitHub API GET under /repos/mezas3238-hue/qore-core. Use it for PR metadata, reviews, comments, workflow runs, jobs, checks, commits and other evidence. No writes are available.",
            "parameters": {
                "type": "object",
                "properties": {"endpoint": {"type": "string"}},
                "required": ["endpoint"],
                "additionalProperties": False,
            },
        },
    },
]

TOOL_IMPL = {
    "repo_state": tool_repo_state,
    "read_file": tool_read_file,
    "list_files": tool_list_files,
    "search_text": tool_search_text,
    "git_diff": tool_git_diff,
    "git_show": tool_git_show,
    "github_get": tool_github_get,
}


def api_call(messages: list[dict[str, Any]]) -> dict[str, Any]:
    payload: dict[str, Any] = {
        "model": MODEL,
        "messages": messages,
        "tools": TOOLS,
        "tool_choice": "auto",
        "stream": False,
        "max_tokens": 16000,
        "thinking": {"type": "enabled"},
        "reasoning_effort": "high",
    }

    def send(body: dict[str, Any]) -> dict[str, Any]:
        req = urllib.request.Request(
            API_URL,
            data=json.dumps(body).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {API_KEY}",
            },
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=300) as response:
            return json.loads(response.read().decode("utf-8"))

    try:
        return send(payload)
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        if exc.code == 400:
            fallback = dict(payload)
            fallback.pop("thinking", None)
            fallback.pop("reasoning_effort", None)
            try:
                return send(fallback)
            except urllib.error.HTTPError as second:
                detail2 = second.read().decode("utf-8", errors="replace")
                raise RuntimeError(f"DeepSeek HTTP {second.code}: {detail2}") from second
        raise RuntimeError(f"DeepSeek HTTP {exc.code}: {detail}") from exc


def main() -> int:
    if not PROMPT_PATH.is_file():
        raise RuntimeError(f"prompt file missing: {PROMPT_PATH}")
    prompt = PROMPT_PATH.read_text(encoding="utf-8")

    system = f"""You are DeepSeek {MODE.upper()}, an independent QORE Core engineering reviewer.
You are running inside a READ-ONLY review harness with direct access to the exact qore-core checkout and read-only GitHub evidence tools.
Do not ask for pasted source, tests, docs, diffs, hashes, reviews, or CI logs: retrieve them yourself with tools.
Do not trust prior reviewer conclusions. Verify actual code and evidence independently.
You cannot modify qore-core, commit, push, merge, alter workflows, access repository secrets, or perform Production actions.
Before concluding, verify the exact binding, inspect every changed file completely (in chunks where needed), inspect relevant surrounding definitions/usages, tests, architecture document, and relevant GitHub review/CI evidence.
A green CI or 100% owner coverage is evidence, not semantic proof.
If a material defect exists, provide a concrete witness and minimal bounded correction. Do not invent authority outside the stated D04 scope.
Keep the final review under 45,000 characters and make it self-contained for later IA adjudication.
"""

    user = f"""PACKAGE ID: {PACKAGE_ID}
REPOSITORY: {REPO}
PR: #{PR_NUMBER}
EXPECTED BASE: {EXPECTED_BASE}
EXPECTED HEAD: {EXPECTED_HEAD}
EXPECTED SYNTHETIC: {EXPECTED_SYNTHETIC}
MODE: {MODE}

{prompt}
"""

    messages: list[dict[str, Any]] = [
        {"role": "system", "content": system},
        {"role": "user", "content": user},
    ]

    for _round in range(40):
        response = api_call(messages)
        choices = response.get("choices") or []
        if not choices:
            raise RuntimeError(f"DeepSeek returned no choices: {response}")
        msg = choices[0].get("message") or {}
        tool_calls = msg.get("tool_calls") or []
        assistant_msg = {
            key: value
            for key, value in msg.items()
            if key in {"role", "content", "reasoning_content", "tool_calls"} and value is not None
        }
        assistant_msg.setdefault("role", "assistant")
        messages.append(assistant_msg)

        if not tool_calls:
            final = (msg.get("content") or "").strip()
            if not final:
                raise RuntimeError("DeepSeek ended without review content")
            if len(final) > 60000:
                final = final[:60000] + "\n\n[OUTPUT TRUNCATED BY HARNESS]"
            OUTPUT.write_text(final + "\n", encoding="utf-8")
            print(f"DeepSeek review written to {OUTPUT}")
            return 0

        for call in tool_calls:
            name = call.get("function", {}).get("name", "")
            raw_args = call.get("function", {}).get("arguments", "{}")
            call_id = call.get("id", "")
            try:
                parsed = json.loads(raw_args) if isinstance(raw_args, str) else (raw_args or {})
                impl = TOOL_IMPL.get(name)
                if impl is None:
                    result = f"ERROR: unknown tool {name}"
                else:
                    result = impl(parsed)
            except Exception as exc:  # noqa: BLE001
                result = f"ERROR: {type(exc).__name__}: {exc}"
            messages.append(
                {
                    "role": "tool",
                    "tool_call_id": call_id,
                    "content": clip(result),
                }
            )

    raise RuntimeError("DeepSeek exceeded maximum tool-call rounds without final review")


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:  # noqa: BLE001
        print(f"REVIEWER ERROR: {type(exc).__name__}: {exc}", file=sys.stderr)
        raise

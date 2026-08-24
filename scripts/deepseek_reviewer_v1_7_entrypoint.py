#!/usr/bin/env python3
from __future__ import annotations

import os
import subprocess
from typing import Any

import deepseek_reviewer_v1_6_entrypoint as v16

v15 = v16.v15
v13 = v16.v13
reviewer = v13.reviewer

# V1.7 preserves V1.6's V4-Pro/high evidence analysis, reasoned synthesis,
# complete changed-file bundle, dependency slices and fail-closed policy.
# It fixes the measured UNR-019 Coder infrastructure failures only:
# - search_text depended on an unavailable `rg` binary;
# - planner tools inherited budgeted reviewer.clip (9k chars), so exact evidence
#   could be marked token-clipped before V1.4's 40k hard tool-result gate.
#
# Planner tools below are exact up to the existing V1.4 hard gate. They do not
# silently truncate. If a raw result exceeds that gate, V1.3 still blocks clean
# validation rather than lowering evidence quality.


def _run_raw(
    args: list[str],
    *,
    timeout: int = 90,
    accepted_returncodes: tuple[int, ...] = (0,),
) -> str:
    proc = subprocess.run(
        args,
        cwd=reviewer.ROOT,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        timeout=timeout,
        check=False,
        env={**os.environ, "GH_TOKEN": reviewer.GH_TOKEN},
    )
    if proc.returncode not in accepted_returncodes:
        detail = proc.stdout.strip()
        if len(detail) > 2000:
            detail = detail[:2000] + "...[diagnostic bounded]"
        raise RuntimeError(
            f"{args[0]} exited {proc.returncode}: {detail or '[no output]'}"
        )
    return proc.stdout


def _exact_read_file(args: dict[str, Any]) -> str:
    path = reviewer.safe_path(str(args["path"]))
    start = int(args.get("start_line", 1))
    end = int(args.get("end_line", start + 399))
    text = path.read_text(encoding="utf-8")
    return reviewer.line_slice(text, start, end)


def _exact_git_show(args: dict[str, Any]) -> str:
    ref = str(args.get("ref", reviewer.EXPECTED_HEAD))
    if ref not in {
        reviewer.EXPECTED_BASE,
        reviewer.EXPECTED_HEAD,
        reviewer.EXPECTED_SYNTHETIC,
    }:
        raise ValueError("ref must be BASE, HEAD, or SYNTHETIC")
    path = str(args["path"])
    reviewer.safe_path(path)
    text = _run_raw(["git", "show", f"{ref}:{path}"])
    start = int(args.get("start_line", 1))
    end = int(args.get("end_line", start + 399))
    return reviewer.line_slice(text, start, end)


def _exact_search_text(args: dict[str, Any]) -> str:
    query = str(args["query"])
    if not query:
        raise ValueError("search query cannot be empty")
    if "\n" in query or "\r" in query:
        raise ValueError("search query must be a single literal line")

    prefix = str(args.get("path", "."))
    reviewer.safe_path(prefix)
    max_results = max(1, min(int(args.get("max_results", 40)), 60))

    # `git grep` is part of the already-required Git toolchain, searches only
    # tracked checkout content, and needs no optional runner binary such as rg.
    out = _run_raw(
        ["git", "grep", "-n", "-F", "-I", "-e", query, "--", prefix],
        accepted_returncodes=(0, 1),
    )
    if not out:
        return ""
    return "\n".join(out.splitlines()[:max_results])


def _exact_github_get(args: dict[str, Any]) -> str:
    endpoint = str(args["endpoint"])
    allowed = f"/repos/{reviewer.REPO}"
    if not (endpoint == allowed or endpoint.startswith(allowed + "/")):
        raise ValueError("GitHub endpoint outside qore-core is not allowed")
    if "\n" in endpoint or "\r" in endpoint:
        raise ValueError("invalid endpoint")
    return _run_raw(["gh", "api", endpoint])


def _exact_compact_gh(endpoint: str, jq: str) -> str:
    allowed = f"/repos/{reviewer.REPO}"
    if not (endpoint == allowed or endpoint.startswith(allowed + "/")):
        raise ValueError("GitHub endpoint outside qore-core is not allowed")
    return _run_raw(["gh", "api", endpoint, "--jq", jq])


reviewer.TOOL_IMPL.update(
    {
        "read_file": _exact_read_file,
        "search_text": _exact_search_text,
        "git_show": _exact_git_show,
        "github_get": _exact_github_get,
    }
)
v13._compact_gh = _exact_compact_gh

# Keep the tool contract accurate for the planner. Only the implementation backend
# changes; argument schemas and read-only authority are unchanged.
for collection in (reviewer.TOOLS, v13.budgeted.TOOLS, v13.PLANNER_TOOLS):
    for tool in collection:
        function = tool.get("function") or {}
        if function.get("name") == "search_text":
            function["description"] = (
                "Literal text search over tracked checkout content using the required "
                "Git toolchain; no optional ripgrep dependency."
            )

_original_plan_additional_evidence = v13.plan_additional_evidence


def plan_additional_evidence(prompt: str) -> tuple[str, str, bool]:
    evidence, note, incomplete = _original_plan_additional_evidence(prompt)
    v15._merge_diagnostic(
        v1_7_exact_planner_tools=True,
        v1_7_search_backend="git-grep",
        v1_7_preclip_disabled=True,
        v1_7_hard_tool_result_chars=v13.MAX_PLANNED_TOOL_RESULT_CHARS,
    )
    return evidence, note, incomplete


v13.plan_additional_evidence = plan_additional_evidence


def main() -> int:
    return v16.main()


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:  # noqa: BLE001
        v13.budgeted.write_usage_summary()
        print(
            f"ERROR: {type(exc).__name__}: {exc}",
            file=v13.quality_guarded.os.sys.stderr,
        )
        raise

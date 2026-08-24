#!/usr/bin/env python3
from __future__ import annotations

import copy
import json
import re
from typing import Any

import deepseek_reviewer_v1_4_entrypoint as v14

v13 = v14.v13

# V1.5 preserves V1.4's model, high reasoning, complete changed-file evidence,
# dependency slices, one-shot planner and fail-closed policy. The first legitimate
# UNR-019 V1.4 run measured two remaining operational failures:
# - planner tool_error with only coarse diagnostics;
# - deepseek-v4-pro/high consumed the exact 24k output envelope as reasoning and
#   emitted no visible final answer, forcing the full-prompt fallback.
#
# DeepSeek V4 Pro currently maps low->high, so reducing reasoning effort would not
# solve the issue. Give the same high-reasoning pass enough output headroom instead.
v13.FINAL_MAX_TOKENS = max(v13.FINAL_MAX_TOKENS, 40000)

_original_normalize_planned_args = v13._normalize_planned_args
_original_planner_system = v13._planner_system
_original_plan_additional_evidence = v13.plan_additional_evidence
_original_send_request = v13.budgeted.send_request


def _normalize_repo_path(path: str) -> str:
    value = path.strip()
    while value.startswith("./"):
        value = value[2:]
    for prefix in ("workspace/qore-core/", "qore-core/"):
        if value.startswith(prefix):
            value = value[len(prefix) :]
            break
    return value


def _normalize_github_endpoint(endpoint: str) -> str:
    value = endpoint.strip()
    api_prefix = "https://api.github.com"
    if value.startswith(api_prefix + "/"):
        value = value[len(api_prefix) :]
    elif value.startswith("api.github.com/"):
        value = "/" + value[len("api.github.com/") :]
    elif value.startswith("repos/"):
        value = "/" + value

    browser_prefix = "https://github.com/mezas3238-hue/qore-core/"
    if value.startswith(browser_prefix):
        tail = value[len(browser_prefix) :]
        mappings = (
            ("pull/", "pulls/"),
            ("issues/", "issues/"),
            ("commit/", "commits/"),
        )
        for browser_part, api_part in mappings:
            if tail.startswith(browser_part):
                suffix = tail[len(browser_part) :]
                value = f"/repos/mezas3238-hue/qore-core/{api_part}{suffix}"
                break
    return value


def normalize_planned_args(name: str, arguments: dict[str, Any]) -> dict[str, Any]:
    normalized = _original_normalize_planned_args(name, arguments)
    if name in {"read_file", "git_show"} and "path" in normalized:
        normalized["path"] = _normalize_repo_path(str(normalized["path"]))
    elif name == "github_get" and "endpoint" in normalized:
        normalized["endpoint"] = _normalize_github_endpoint(
            str(normalized["endpoint"])
        )
    return normalized


v13._normalize_planned_args = normalize_planned_args


def planner_system() -> str:
    return _original_planner_system() + """
Planner tool syntax is strict but normalized for harmless common forms. Prefer repository-relative paths such as `src/qore/...` and GitHub API endpoints beginning `/repos/mezas3238-hue/qore-core/...`. Do not use `github_get` for external web URLs or any repository other than qore-core. If external evidence is genuinely required and not already supplied by TARGET REVIEW, state EVIDENCE_INCOMPLETE instead of manufacturing an unsupported tool request.
"""


v13._planner_system = planner_system


def _compact_error_summaries(evidence: str) -> list[str]:
    summaries: list[str] = []
    current_tool = "unknown"
    for raw_line in evidence.splitlines():
        line = raw_line.strip()
        if line.startswith("## PLANNED TOOL "):
            current_tool = line.removeprefix("## PLANNED TOOL ").strip()[:64]
            continue
        if line.startswith("## PLAN ERROR"):
            if "plan_error" not in summaries:
                summaries.append("plan_error")
            continue
        if line.startswith("ERROR:"):
            safe = re.sub(r"\s+", " ", line)[:220]
            summaries.append(f"{current_tool}: {safe}")
        if len(summaries) >= 4:
            break
    return summaries


def _merge_diagnostic(**updates: object) -> None:
    if not v14._DIAGNOSTIC_PATH.is_file():
        return
    diagnostic = json.loads(v14._DIAGNOSTIC_PATH.read_text(encoding="utf-8"))
    diagnostic.update(updates)
    v14._DIAGNOSTIC_PATH.write_text(
        json.dumps(diagnostic, sort_keys=True, separators=(",", ",")) + "\n",
        encoding="utf-8",
    )


def plan_additional_evidence(prompt: str) -> tuple[str, str, bool]:
    evidence, note, incomplete = _original_plan_additional_evidence(prompt)
    _merge_diagnostic(
        v1_5_argument_normalization=True,
        tool_error_summaries=_compact_error_summaries(evidence),
        final_max_tokens=v13.FINAL_MAX_TOKENS,
    )
    return evidence, note, incomplete


v13.plan_additional_evidence = plan_additional_evidence


def _response_lengths(response: dict[str, Any]) -> tuple[int, int]:
    choices = response.get("choices") or []
    if not choices:
        return 0, 0
    message = choices[0].get("message") or {}
    reasoning = str(message.get("reasoning_content") or "")
    visible = str(message.get("content") or "")
    return len(reasoning), len(visible)


def send_request(
    *,
    stage: str,
    round_number: int,
    messages: list[dict[str, Any]],
    thinking: bool,
    tools: bool,
    max_tokens: int,
    model: str,
) -> dict[str, Any]:
    effective_messages = messages
    if stage == "final" and thinking and messages:
        effective_messages = copy.deepcopy(messages)
        first = effective_messages[0]
        first["content"] = str(first.get("content") or "") + (
            "\nOperational output requirement: preserve the full adversarial depth, but "
            "finish hidden reasoning with enough output budget remaining to emit the "
            "visible self-contained review in this same response. Reserve answer "
            "headroom; do not intentionally consume the entire 40k envelope as hidden "
            "reasoning."
        )

    response = _original_send_request(
        stage=stage,
        round_number=round_number,
        messages=effective_messages,
        thinking=thinking,
        tools=tools,
        max_tokens=max_tokens,
        model=model,
    )
    if stage in {"final", "final-fallback"}:
        reasoning_chars, visible_chars = _response_lengths(response)
        _merge_diagnostic(
            **{
                f"{stage.replace('-', '_')}_reasoning_chars": reasoning_chars,
                f"{stage.replace('-', '_')}_visible_chars": visible_chars,
            }
        )
    return response


v13.budgeted.send_request = send_request


def main() -> int:
    return v14.main()


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

#!/usr/bin/env python3
from __future__ import annotations

import copy
import json
import os
import pathlib
import urllib.error
import urllib.request
from typing import Any

import deepseek_reviewer as reviewer

EXPLORER_MODEL = os.environ.get("DEEPSEEK_EXPLORER_MODEL", reviewer.MODEL)
FINAL_MODEL = os.environ.get("DEEPSEEK_FINAL_MODEL", reviewer.MODEL)
MAX_EXPLORER_ROUNDS = int(os.environ.get("DEEPSEEK_MAX_EXPLORER_ROUNDS", "7"))
MAX_TOOL_TEXT = int(os.environ.get("DEEPSEEK_MAX_TOOL_TEXT", "9000"))
MAX_EVIDENCE_CHARS = int(os.environ.get("DEEPSEEK_MAX_EVIDENCE_CHARS", "100000"))
EXPLORER_MAX_TOKENS = int(os.environ.get("DEEPSEEK_EXPLORER_MAX_TOKENS", "2200"))
FINAL_MAX_TOKENS = int(os.environ.get("DEEPSEEK_FINAL_MAX_TOKENS", "7000"))
EXPLORATION_PROMPT_BUDGET = int(
    os.environ.get("DEEPSEEK_EXPLORATION_PROMPT_TOKEN_BUDGET", "220000")
)
EXPLORATION_CACHE_MISS_BUDGET = int(
    os.environ.get("DEEPSEEK_EXPLORATION_CACHE_MISS_TOKEN_BUDGET", "80000")
)
USAGE_LOG = pathlib.Path(
    os.environ.get(
        "DEEPSEEK_USAGE_LOG",
        str(
            pathlib.Path(os.environ.get("GITHUB_WORKSPACE", "."))
            / "deepseek-usage.jsonl"
        ),
    )
).resolve()

TOTALS = {
    "api_calls": 0,
    "prompt_tokens": 0,
    "prompt_cache_hit_tokens": 0,
    "prompt_cache_miss_tokens": 0,
    "completion_tokens": 0,
    "reasoning_tokens": 0,
}


def compact_clip(text: str, limit: int = MAX_TOOL_TEXT) -> str:
    if len(text) <= limit:
        return text
    head = max(1, (limit * 3) // 4)
    tail = max(1, limit - head)
    omitted = len(text) - head - tail
    return (
        text[:head]
        + f"\n...[{omitted} characters omitted by token budget]...\n"
        + text[-tail:]
    )


reviewer.clip = compact_clip


def compact_repo_state(_: dict[str, Any]) -> str:
    changed = reviewer.run(
        ["git", "diff", "--name-status", reviewer.EXPECTED_BASE, reviewer.EXPECTED_HEAD]
    )
    stat = reviewer.run(
        ["git", "diff", "--stat", reviewer.EXPECTED_BASE, reviewer.EXPECTED_HEAD]
    )
    head_tree = reviewer.run(
        ["git", "show", "-s", "--format=%T", reviewer.EXPECTED_HEAD]
    ).strip()
    base_tree = reviewer.run(
        ["git", "show", "-s", "--format=%T", reviewer.EXPECTED_BASE]
    ).strip()
    synthetic_tree = reviewer.run(
        ["git", "show", "-s", "--format=%T", reviewer.EXPECTED_SYNTHETIC]
    ).strip()
    parents = reviewer.run(
        ["git", "show", "-s", "--format=%P", reviewer.EXPECTED_SYNTHETIC]
    ).strip()
    checkout_head = reviewer.run(["git", "rev-parse", "HEAD"]).strip()
    payload = {
        "package_id": reviewer.PACKAGE_ID,
        "mode": reviewer.MODE,
        "expected_base": reviewer.EXPECTED_BASE,
        "expected_head": reviewer.EXPECTED_HEAD,
        "expected_synthetic": reviewer.EXPECTED_SYNTHETIC,
        "checkout_head": checkout_head,
        "base_tree": base_tree,
        "head_tree": head_tree,
        "synthetic_tree": synthetic_tree,
        "synthetic_parents": parents,
        "changed": changed,
        "stat": stat,
    }
    return compact_clip(json.dumps(payload, indent=2))


reviewer.TOOL_IMPL["repo_state"] = compact_repo_state
TOOLS = copy.deepcopy(reviewer.TOOLS)
for tool in TOOLS:
    function = tool.get("function") or {}
    if function.get("name") == "repo_state":
        function["description"] = (
            "Return compact exact frozen BASE/HEAD/SYNTHETIC state, trees, parents, "
            "changed files and diff stat. It intentionally omits the full recursive "
            "HEAD tree listing to save tokens."
        )


def usage_number(payload: dict[str, Any], key: str) -> int:
    value = payload.get(key, 0)
    return int(value) if isinstance(value, (int, float)) else 0


def record_usage(stage: str, round_number: int, response: dict[str, Any]) -> None:
    usage = response.get("usage") or {}
    details = usage.get("completion_tokens_details") or {}
    row = {
        "stage": stage,
        "round": round_number,
        "model": response.get("model"),
        "prompt_tokens": usage_number(usage, "prompt_tokens"),
        "prompt_cache_hit_tokens": usage_number(usage, "prompt_cache_hit_tokens"),
        "prompt_cache_miss_tokens": usage_number(usage, "prompt_cache_miss_tokens"),
        "completion_tokens": usage_number(usage, "completion_tokens"),
        "reasoning_tokens": usage_number(details, "reasoning_tokens"),
        "total_tokens": usage_number(usage, "total_tokens"),
    }
    TOTALS["api_calls"] += 1
    for key in (
        "prompt_tokens",
        "prompt_cache_hit_tokens",
        "prompt_cache_miss_tokens",
        "completion_tokens",
        "reasoning_tokens",
    ):
        TOTALS[key] += row[key]
    USAGE_LOG.parent.mkdir(parents=True, exist_ok=True)
    with USAGE_LOG.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(row, sort_keys=True) + "\n")
    print(
        "DeepSeek usage "
        f"{stage}#{round_number}: prompt={row['prompt_tokens']} "
        f"(hit={row['prompt_cache_hit_tokens']}, "
        f"miss={row['prompt_cache_miss_tokens']}), "
        f"completion={row['completion_tokens']}, "
        f"reasoning={row['reasoning_tokens']}"
    )


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
        payload["tools"] = TOOLS
        payload["tool_choice"] = "auto"

    request = urllib.request.Request(
        reviewer.API_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {reviewer.API_KEY}",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=300) as response:
            result = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"DeepSeek HTTP {exc.code}: {detail}") from exc

    record_usage(stage, round_number, result)
    return result


def response_message(response: dict[str, Any]) -> dict[str, Any]:
    choices = response.get("choices") or []
    if not choices:
        raise RuntimeError(f"DeepSeek returned no choices: {response}")
    return choices[0].get("message") or {}


def append_evidence(
    evidence: list[str],
    *,
    name: str,
    arguments: dict[str, Any],
    result: str,
) -> None:
    current = sum(len(item) for item in evidence)
    remaining = MAX_EVIDENCE_CHARS - current
    if remaining <= 0:
        return
    block = (
        f"\n## TOOL {name}\n"
        f"ARGS: {json.dumps(arguments, sort_keys=True)}\n"
        f"{compact_clip(result)}\n"
    )
    if len(block) > remaining:
        block = compact_clip(block, remaining)
    evidence.append(block)


def exploration_budget_exhausted() -> bool:
    return (
        TOTALS["prompt_tokens"] >= EXPLORATION_PROMPT_BUDGET
        or TOTALS["prompt_cache_miss_tokens"] >= EXPLORATION_CACHE_MISS_BUDGET
    )


def write_usage_summary() -> None:
    lines = [
        "## QORE DeepSeek token budget",
        "",
        f"API calls: `{TOTALS['api_calls']}`",
        "",
        "| Metric | Tokens |",
        "|---|---:|",
        f"| Prompt | {TOTALS['prompt_tokens']} |",
        f"| Prompt cache hit | {TOTALS['prompt_cache_hit_tokens']} |",
        f"| Prompt cache miss | {TOTALS['prompt_cache_miss_tokens']} |",
        f"| Completion | {TOTALS['completion_tokens']} |",
        f"| Reasoning | {TOTALS['reasoning_tokens']} |",
        "",
        (
            "Exploration policy: "
            f"max {MAX_EXPLORER_ROUNDS} rounds, "
            f"{MAX_TOOL_TEXT} chars/tool result, "
            f"{MAX_EVIDENCE_CHARS} chars final evidence bundle, "
            f"{EXPLORATION_PROMPT_BUDGET} cumulative exploration prompt tokens, "
            f"{EXPLORATION_CACHE_MISS_BUDGET} cumulative exploration cache-miss tokens."
        ),
    ]
    text = "\n".join(lines) + "\n"
    print(text)
    summary_path = os.environ.get("GITHUB_STEP_SUMMARY")
    if summary_path:
        with open(summary_path, "a", encoding="utf-8") as handle:
            handle.write(text)


def main() -> int:
    if not reviewer.PROMPT_PATH.is_file():
        raise RuntimeError(f"prompt file missing: {reviewer.PROMPT_PATH}")
    prompt = reviewer.PROMPT_PATH.read_text(encoding="utf-8")

    explorer_system = f"""You are DeepSeek {reviewer.MODE.upper()}, the evidence-collection phase of an independent QORE Core engineering review.
You have READ-ONLY access to the exact frozen qore-core checkout and GitHub evidence tools.
This phase is deliberately NON-THINKING to minimize token use. Gather concrete evidence; do not try to write the final review.
Batch independent tool calls in the same response whenever possible.
First verify repo_state once. Then inspect every changed file completely using targeted line ranges, plus only the surrounding definitions/usages needed to falsify the requested invariants.
Do not reread the same lines. Do not list the full repository. Do not fetch the historical PR review chain unless the supplied target prompt makes a prior adjudication directly relevant.
Prefer search_text before broad reads. Keep GitHub evidence targeted to the exact PR, current package binding and exact CI run.
When evidence is sufficient, stop calling tools and return a compact EVIDENCE_COMPLETE note with the strongest candidate findings or 'no material candidate found'.
You cannot modify qore-core, commit, push, merge, access secrets, or perform Production actions.
"""

    base_user = f"""PACKAGE ID: {reviewer.PACKAGE_ID}
REPOSITORY: {reviewer.REPO}
PR: #{reviewer.PR_NUMBER}
EXPECTED BASE: {reviewer.EXPECTED_BASE}
EXPECTED HEAD: {reviewer.EXPECTED_HEAD}
EXPECTED SYNTHETIC: {reviewer.EXPECTED_SYNTHETIC}
MODE: {reviewer.MODE}

TARGET REVIEW:
{prompt}
"""

    messages: list[dict[str, Any]] = [
        {"role": "system", "content": explorer_system},
        {"role": "user", "content": base_user},
    ]
    evidence: list[str] = []
    explorer_note = ""

    for round_number in range(1, MAX_EXPLORER_ROUNDS + 1):
        response = send_request(
            stage="explore",
            round_number=round_number,
            messages=messages,
            thinking=False,
            tools=True,
            max_tokens=EXPLORER_MAX_TOKENS,
            model=EXPLORER_MODEL,
        )
        message = response_message(response)
        tool_calls = message.get("tool_calls") or []
        content = (message.get("content") or "").strip()

        assistant_message: dict[str, Any] = {
            "role": "assistant",
            "content": message.get("content") or "",
        }
        if tool_calls:
            assistant_message["tool_calls"] = tool_calls
        messages.append(assistant_message)

        if not tool_calls:
            explorer_note = content
            break

        for call in tool_calls:
            function = call.get("function") or {}
            name = str(function.get("name") or "")
            raw_arguments = function.get("arguments") or "{}"
            call_id = str(call.get("id") or "")
            try:
                arguments = (
                    json.loads(raw_arguments)
                    if isinstance(raw_arguments, str)
                    else (raw_arguments or {})
                )
                implementation = reviewer.TOOL_IMPL.get(name)
                if implementation is None:
                    result = f"ERROR: unknown tool {name}"
                else:
                    result = implementation(arguments)
            except Exception as exc:  # noqa: BLE001
                arguments = {}
                result = f"ERROR: {type(exc).__name__}: {exc}"

            result = compact_clip(result)
            append_evidence(
                evidence,
                name=name,
                arguments=arguments,
                result=result,
            )
            messages.append(
                {
                    "role": "tool",
                    "tool_call_id": call_id,
                    "content": result,
                }
            )

        if exploration_budget_exhausted():
            explorer_note = (
                "Exploration stopped by harness token budget. "
                "Use the collected raw evidence below and do not infer unseen facts."
            )
            break

    if not evidence:
        raise RuntimeError("DeepSeek exploration collected no repository evidence")

    final_system = f"""You are DeepSeek {reviewer.MODE.upper()}, the FINAL independent QORE Core engineering reviewer.
Reason independently from the raw evidence bundle collected from the exact frozen checkout in this same run.
This final phase has NO tools and uses thinking mode once, so spend reasoning on falsification rather than requesting more evidence.
Do not trust the explorer's interpretation; treat its note only as a lead. The raw tool excerpts are authoritative within their shown ranges.
If the evidence does not support a material claim, do not invent one. CI green is evidence, not semantic proof.
Report only material bounded findings with concrete witnesses and minimal corrections. Preserve the stated authority boundary.
If clean, conclude exactly with HALLAZGOS: NINGUNO and VALIDACIÓN OK.
Keep the final review concise and self-contained.
"""

    evidence_text = "".join(evidence)
    final_user = (
        base_user
        + "\nEXPLORER NOTE:\n"
        + (explorer_note or "No separate explorer note; use raw evidence.")
        + "\n\nRAW EVIDENCE BUNDLE:\n"
        + evidence_text
    )

    final_response = send_request(
        stage="final",
        round_number=1,
        messages=[
            {"role": "system", "content": final_system},
            {"role": "user", "content": final_user},
        ],
        thinking=True,
        tools=False,
        max_tokens=FINAL_MAX_TOKENS,
        model=FINAL_MODEL,
    )
    final_message = response_message(final_response)
    final = (final_message.get("content") or "").strip()

    if not final:
        final_response = send_request(
            stage="final-fallback",
            round_number=1,
            messages=[
                {"role": "system", "content": final_system},
                {
                    "role": "user",
                    "content": (
                        final_user
                        + "\n\nReturn the final review now without hidden reasoning."
                    ),
                },
            ],
            thinking=False,
            tools=False,
            max_tokens=FINAL_MAX_TOKENS,
            model=FINAL_MODEL,
        )
        final = (response_message(final_response).get("content") or "").strip()

    if not final:
        raise RuntimeError("DeepSeek ended without final review content")
    if len(final) > 45000:
        final = final[:45000] + "\n\n[OUTPUT TRUNCATED BY TOKEN-BUDGET HARNESS]"

    reviewer.OUTPUT.write_text(final + "\n", encoding="utf-8")
    print(f"DeepSeek review written to {reviewer.OUTPUT}")
    write_usage_summary()
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:  # noqa: BLE001
        write_usage_summary()
        print(f"ERROR: {type(exc).__name__}: {exc}", file=os.sys.stderr)
        raise

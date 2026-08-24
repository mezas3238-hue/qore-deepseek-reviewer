#!/usr/bin/env python3
from __future__ import annotations

import ast
import copy
import json
from collections import deque
from typing import Any

import deepseek_reviewer_v2_entrypoint as v12

budgeted = v12.budgeted
quality_guarded = v12.quality_guarded
reviewer = v12.reviewer

# V1.3 removes conversational Explorer replay. One non-thinking planning call may
# request all genuinely additional evidence in a batch; the harness executes those
# read-only tools locally, then one Pro/high final pass receives the resulting
# evidence together with the complete changed-file and deterministic dependency
# bundles. Missing evidence still fails closed.
PLAN_MAX_TOKENS = 1800
FINAL_MAX_TOKENS = max(budgeted.FINAL_MAX_TOKENS, 16000)
MAX_PLANNED_TOOL_CALLS = 12
MAX_PLANNED_TOOL_RESULT_CHARS = 16000
MAX_PLANNED_EVIDENCE_CHARS = 80000
MAX_FINAL_EVIDENCE_CHARS = 240000

_ALLOWED_PLAN_TOOLS = {"read_file", "search_text", "git_show", "github_get"}
PLANNER_TOOLS = []
for tool in copy.deepcopy(budgeted.TOOLS):
    function = tool.get("function") or {}
    if function.get("name") in _ALLOWED_PLAN_TOOLS:
        PLANNER_TOOLS.append(tool)

_CLIP_MARKERS = (
    "characters omitted by token budget",
    "[truncated at",
)


# Exact raw source is complete evidence. Prefixing every line with its line number
# added repeated tokens without adding source semantics. File/definition headers
# already retain paths and stable line spans.
def _raw_exact_text(text: str) -> str:
    return text


quality_guarded.numbered_text = _raw_exact_text


def _base_user(prompt: str) -> str:
    return f"""PACKAGE ID: {reviewer.PACKAGE_ID}
REPOSITORY: {reviewer.REPO}
PR: #{reviewer.PR_NUMBER}
EXPECTED BASE: {reviewer.EXPECTED_BASE}
EXPECTED HEAD: {reviewer.EXPECTED_HEAD}
EXPECTED SYNTHETIC: {reviewer.EXPECTED_SYNTHETIC}
MODE: {reviewer.MODE}

TARGET REVIEW:
{prompt}
"""


def _compact_gh(endpoint: str, jq: str) -> str:
    return reviewer.run(["gh", "api", endpoint, "--jq", jq])


def build_baseline_evidence() -> str:
    repo_state = budgeted.compact_repo_state({})
    pr = _compact_gh(
        f"/repos/{reviewer.REPO}/pulls/{reviewer.PR_NUMBER}",
        "{number,state,draft,mergeable,base_sha:.base.sha,head_sha:.head.sha,"
        "merge_commit_sha,changed_files,additions,deletions}",
    )
    checks = _compact_gh(
        f"/repos/{reviewer.REPO}/commits/{reviewer.EXPECTED_HEAD}/check-runs",
        "{total_count,checks:[.check_runs[]|{name,status,conclusion,details_url}]}",
    )
    status = _compact_gh(
        f"/repos/{reviewer.REPO}/commits/{reviewer.EXPECTED_HEAD}/status",
        "{state,total_count,statuses:[.statuses[]|{context,state,target_url,description}]}",
    )
    return (
        "\n# DETERMINISTIC BINDING / CI EVIDENCE\n"
        "## repo_state\n"
        + repo_state
        + "\n## pull_request\n"
        + pr
        + "\n## check_runs\n"
        + checks
        + "\n## combined_status\n"
        + status
        + "\n"
    )


def _selected_dependency_details() -> str:
    details: list[str] = []
    for module, imported_names in sorted(v12._changed_import_requirements().items()):
        path = v12._module_path(module)
        content = quality_guarded.raw_git("show", f"{reviewer.EXPECTED_HEAD}:{path}")
        tree = ast.parse(content, filename=path)
        definitions = v12._definition_nodes(tree)

        selected: set[str] = set()
        queue: deque[tuple[str, int]] = deque(
            (name, 0) for name in sorted(imported_names)
        )
        while queue:
            name, depth = queue.popleft()
            if name in selected:
                continue
            node = definitions.get(name)
            if node is None:
                continue
            selected.add(name)
            if depth >= v12.MAX_TRANSITIVE_DEFINITION_DEPTH:
                continue
            for referenced in sorted(v12._loaded_names(node)):
                if referenced in definitions and referenced not in selected:
                    queue.append((referenced, depth + 1))

        import_map: dict[str, str] = {}
        for node in tree.body:
            if not isinstance(node, ast.ImportFrom) or node.module is None:
                continue
            for alias in node.names:
                local_name = alias.asname or alias.name
                import_map[local_name] = f"{node.module}:{alias.name}"

        external_refs: set[str] = set()
        for name in selected:
            node = definitions.get(name)
            if node is None:
                continue
            for loaded in v12._loaded_names(node):
                target = import_map.get(loaded)
                if target and target.startswith("qore."):
                    external_refs.add(target)

        details.append(
            f"{module}=>direct[{','.join(sorted(imported_names))}] "
            f"local_defs[{','.join(sorted(selected))}] "
            f"external_qore_refs[{','.join(sorted(external_refs)) or '-'}]"
        )
    return "; ".join(details) or "[none]"


def _guaranteed_inventory() -> str:
    changed = quality_guarded.changed_rows()
    changed_text = ", ".join(f"{status}:{path}" for status, path in changed)
    return (
        f"CHANGED_FILES_COMPLETE: {changed_text}\n"
        f"LOCAL_DEPENDENCY_SLICES: {_selected_dependency_details()}\n"
        "BASELINE_GUARANTEED: exact repo_state, PR metadata, HEAD check-runs, "
        "combined commit status.\n"
    )


def _planner_system() -> str:
    return f"""You are DeepSeek {reviewer.MODE.upper()} evidence planner for an independent QORE Core review.
This is ONE non-thinking planning call. Do not write the final review.
The final reviewer is guaranteed the COMPLETE exact content of every changed file, exact patches for modified files, deterministic exact semantic slices for direct local qore.infrastructure imports plus bounded referenced helpers, exact frozen repo state, PR metadata, and HEAD CI/check evidence.
Do NOT request evidence already guaranteed. A dependency module is only partially guaranteed by its listed slice: targeted reads of OTHER definitions/ranges in that same module are allowed when genuinely required.
Use tools only for genuinely additional surrounding definitions/usages, historical/base material, or GitHub evidence required by the TARGET REVIEW to falsify an invariant.
Request every additional item you need NOW, batching independent tool calls in this single response. Prefer targeted search_text/read_file/git_show ranges. Avoid broad repository listings and broad GitHub timelines unless directly required.
If the guaranteed bundle alone is sufficient, make no tool calls and answer exactly EVIDENCE_COMPLETE.
If you cannot formulate a bounded evidence plan, answer EVIDENCE_INCOMPLETE and name what is missing.
You are read-only and have no Production authority.
"""


def _normalize_planned_args(name: str, arguments: dict[str, Any]) -> dict[str, Any]:
    normalized = dict(arguments)
    if name in {"read_file", "git_show"}:
        start = int(normalized.get("start_line", 1))
        end = int(normalized.get("end_line", start + 299))
        if start < 1 or end < start:
            raise ValueError("invalid planned line range")
        if end - start > 399:
            end = start + 399
        normalized["start_line"] = start
        normalized["end_line"] = end
    elif name == "search_text":
        normalized["max_results"] = max(
            1,
            min(int(normalized.get("max_results", 40)), 60),
        )
    return normalized


def _complete_changed_paths() -> set[str]:
    return {path for _, path in quality_guarded.changed_rows()}


def execute_planned_tools(
    tool_calls: list[dict[str, Any]],
) -> tuple[str, bool]:
    if len(tool_calls) > MAX_PLANNED_TOOL_CALLS:
        return (
            "Planner requested more than MAX_PLANNED_TOOL_CALLS; evidence plan is incomplete.\n",
            True,
        )

    complete_changed_paths = _complete_changed_paths()
    blocks: list[str] = []
    seen: set[tuple[str, str]] = set()
    incomplete = False

    for call in tool_calls:
        function = call.get("function") or {}
        name = str(function.get("name") or "")
        raw_arguments = function.get("arguments") or "{}"
        try:
            arguments = (
                json.loads(raw_arguments)
                if isinstance(raw_arguments, str)
                else dict(raw_arguments or {})
            )
            arguments = _normalize_planned_args(name, arguments)
        except Exception as exc:  # noqa: BLE001
            blocks.append(f"\n## PLAN ERROR\n{name}: {type(exc).__name__}: {exc}\n")
            incomplete = True
            continue

        if name not in _ALLOWED_PLAN_TOOLS:
            blocks.append(f"\n## PLAN ERROR\nunsupported tool: {name}\n")
            incomplete = True
            continue

        path = str(arguments.get("path") or "")
        if name in {"read_file", "git_show"} and path in complete_changed_paths:
            # Changed files are present completely in the mandatory final bundle.
            # Dependency modules are only sliced, so other targeted ranges there remain
            # legal and must not be suppressed.
            continue

        signature = (
            name,
            json.dumps(arguments, sort_keys=True, separators=(",", ":")),
        )
        if signature in seen:
            continue
        seen.add(signature)

        implementation = reviewer.TOOL_IMPL.get(name)
        if implementation is None:
            blocks.append(f"\n## PLAN ERROR\nunknown tool implementation: {name}\n")
            incomplete = True
            continue

        try:
            result = implementation(arguments)
        except Exception as exc:  # noqa: BLE001
            result = f"ERROR: {type(exc).__name__}: {exc}"
            incomplete = True

        if any(marker in result for marker in _CLIP_MARKERS):
            incomplete = True
        if len(result) > MAX_PLANNED_TOOL_RESULT_CHARS:
            result = budgeted.compact_clip(result, MAX_PLANNED_TOOL_RESULT_CHARS)
            incomplete = True

        block = (
            f"\n## PLANNED TOOL {name}\n"
            f"ARGS: {json.dumps(arguments, sort_keys=True)}\n"
            f"{result}\n"
        )
        if sum(len(item) for item in blocks) + len(block) > MAX_PLANNED_EVIDENCE_CHARS:
            incomplete = True
            blocks.append(
                "\n## PLAN BUDGET\nAdditional planned evidence exceeded the hard bundle "
                "budget and was not silently truncated.\n"
            )
            break
        blocks.append(block)

    return "".join(blocks), incomplete


def plan_additional_evidence(prompt: str) -> tuple[str, str, bool]:
    planner_messages = [
        {"role": "system", "content": _planner_system()},
        {
            "role": "user",
            "content": _base_user(prompt)
            + "\nGUARANTEED FINAL EVIDENCE INVENTORY:\n"
            + _guaranteed_inventory(),
        },
    ]

    original_tools = budgeted.TOOLS
    budgeted.TOOLS = PLANNER_TOOLS
    try:
        response = budgeted.send_request(
            stage="plan",
            round_number=1,
            messages=planner_messages,
            thinking=False,
            tools=True,
            max_tokens=PLAN_MAX_TOKENS,
            model=budgeted.EXPLORER_MODEL,
        )
    finally:
        budgeted.TOOLS = original_tools

    message = budgeted.response_message(response)
    tool_calls = list(message.get("tool_calls") or [])
    note = str(message.get("content") or "").strip()
    incomplete = "EVIDENCE_INCOMPLETE" in note

    if not tool_calls:
        if not note:
            return "", "EVIDENCE_INCOMPLETE: planner returned no plan or closure.", True
        if "EVIDENCE_COMPLETE" not in note:
            incomplete = True
        return "", note, incomplete

    evidence, execution_incomplete = execute_planned_tools(tool_calls)
    return evidence, note or "Batched evidence plan executed.", incomplete or execution_incomplete


def _clean_verdict(final: str) -> bool:
    markers = quality_guarded.clean_verdict_markers(final)
    return "VALIDACIÓN OK" in markers or "HALLAZGOS: NINGUNO" in markers


def _write_blocked(reason: str) -> None:
    reviewer.OUTPUT.write_text(
        "EVIDENCIA INSUFICIENTE / VALIDACIÓN BLOQUEADA\n\n" + reason.strip() + "\n",
        encoding="utf-8",
    )


def main() -> int:
    if not reviewer.PROMPT_PATH.is_file():
        raise RuntimeError(f"prompt file missing: {reviewer.PROMPT_PATH}")
    prompt = reviewer.PROMPT_PATH.read_text(encoding="utf-8")

    mandatory_changed, changed_count = quality_guarded.build_mandatory_changed_evidence()
    dependency_slices, dependency_count = v12.build_sliced_dependency_evidence()
    baseline = build_baseline_evidence()
    planned_evidence, planner_note, plan_incomplete = plan_additional_evidence(prompt)

    evidence = mandatory_changed + dependency_slices + baseline + planned_evidence
    print(
        "V1.3 prepared final evidence: "
        f"changed_files={changed_count}, dependency_modules={dependency_count}, "
        f"planned_chars={len(planned_evidence)}, total_chars={len(evidence)}, "
        f"plan_incomplete={plan_incomplete}."
    )

    if len(evidence) > MAX_FINAL_EVIDENCE_CHARS:
        _write_blocked(
            "Complete required evidence exceeds the V1.3 hard final-evidence safety fuse. "
            "No evidence was truncated; split the review surface or explicitly raise the "
            "quality budget."
        )
        budgeted.write_usage_summary()
        return 0

    final_system = f"""You are DeepSeek {reviewer.MODE.upper()}, the FINAL independent QORE Core engineering reviewer.
This is the authoritative high-reasoning pass. You have NO tools because the harness has already assembled deterministic complete changed-file evidence, exact modified-file patches, bounded exact local dependency slices, frozen binding/CI evidence, and any additional evidence requested by a separate non-thinking planner.
Inspect every changed file completely. Reason independently; the planner note is not authoritative.
If an invariant requires material not present in the evidence, do not infer it: return EVIDENCIA INSUFICIENTE / VALIDACIÓN BLOQUEADA and identify the missing evidence.
A green CI is evidence, never semantic proof. Report only material bounded findings with a concrete accepted-state witness and minimal correction. Preserve the stated authority boundary.
If clean, conclude exactly with HALLAZGOS: NINGUNO and VALIDACIÓN OK.
Keep the review concise and self-contained.
"""
    final_user = (
        _base_user(prompt)
        + "\nPLANNER NOTE (non-authoritative):\n"
        + (planner_note or "No planner note.")
        + "\n\nEXACT REVIEW EVIDENCE:\n"
        + evidence
    )

    response = budgeted.send_request(
        stage="final",
        round_number=1,
        messages=[
            {"role": "system", "content": final_system},
            {"role": "user", "content": final_user},
        ],
        thinking=True,
        tools=False,
        max_tokens=FINAL_MAX_TOKENS,
        model=budgeted.FINAL_MODEL,
    )
    final = str(budgeted.response_message(response).get("content") or "").strip()

    if not final:
        # Compatibility fallback is exceptional. The 16k reasoning envelope is intended
        # to make this unnecessary in normal operation.
        fallback = budgeted.send_request(
            stage="final-fallback",
            round_number=1,
            messages=[
                {"role": "system", "content": final_system},
                {
                    "role": "user",
                    "content": final_user
                    + "\n\nReturn the final review now without hidden reasoning.",
                },
            ],
            thinking=False,
            tools=False,
            max_tokens=FINAL_MAX_TOKENS,
            model=budgeted.FINAL_MODEL,
        )
        final = str(budgeted.response_message(fallback).get("content") or "").strip()

    if not final:
        raise RuntimeError("DeepSeek ended without final review content")

    if plan_incomplete and _clean_verdict(final):
        final = (
            "EVIDENCIA INSUFICIENTE / VALIDACIÓN BLOQUEADA\n\n"
            "V1.3 quality guard rejected the clean verdict because the one-shot evidence "
            "plan was incomplete or a requested result was clipped/errored. No clean "
            "conclusion is published from incomplete evidence."
        )

    # The final response has already been paid for and is review evidence itself. Never
    # truncate it to save tokens after generation.
    reviewer.OUTPUT.write_text(final + "\n", encoding="utf-8")
    print(f"DeepSeek V1.3 review written to {reviewer.OUTPUT}")
    budgeted.write_usage_summary()
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:  # noqa: BLE001
        budgeted.write_usage_summary()
        print(f"ERROR: {type(exc).__name__}: {exc}", file=quality_guarded.os.sys.stderr)
        raise

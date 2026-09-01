#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
from collections import defaultdict
from datetime import datetime, timezone
from decimal import Decimal
from pathlib import Path
from typing import Any

# DeepSeek V4 Pro rates effective 2026-08-16, USD per 1M tokens.
# Pricing is also cross-checked independently with the account-balance delta.
RATES = {
    "off_peak": {
        "cache_hit": Decimal("0.022"),
        "cache_miss": Decimal("0.66"),
        "output": Decimal("1.98"),
    },
    "peak": {
        "cache_hit": Decimal("0.044"),
        "cache_miss": Decimal("1.32"),
        "output": Decimal("3.96"),
    },
}

_PRIMARY_LSP_REQUIRED_DEFINITION = {"goToDefinition", "goToImplementation"}
_EDIT_TOOLS = {"edit", "write", "str_replace_editor"}


def _int(value: Any) -> int:
    return int(value) if isinstance(value, (int, float)) else 0


def _tier(event_time_ms: Any) -> str:
    if not isinstance(event_time_ms, (int, float)):
        return "unknown"
    moment = datetime.fromtimestamp(event_time_ms / 1000, tz=timezone.utc)
    hour = moment.hour
    peak = moment.weekday() < 5 and (1 <= hour < 4 or 6 <= hour < 10)
    return "peak" if peak else "off_peak"


def _usage_from_event(event: dict[str, Any]) -> dict[str, Any] | None:
    if event.get("type") == "assistant/chunk":
        data = event.get("data") or {}
        chunk = data.get("chunk") or {}
        if chunk.get("type") == "usage" and isinstance(chunk.get("usage"), dict):
            return chunk["usage"]
    if event.get("type") == "assistant/message":
        usage = (event.get("data") or {}).get("usage")
        if isinstance(usage, dict):
            return usage
    return None


def _read_jsonl(path: Path) -> list[dict[str, Any]]:
    events: list[dict[str, Any]] = []
    for line_no, raw in enumerate(path.read_text(encoding="utf-8").splitlines(), start=1):
        if not raw.strip():
            continue
        try:
            event = json.loads(raw)
        except json.JSONDecodeError as exc:
            raise RuntimeError(f"invalid JSONL at {path}:{line_no}: {exc}") from exc
        if not isinstance(event, dict):
            raise RuntimeError(f"non-object JSONL event at {path}:{line_no}")
        events.append(event)
    return events


def _json_arguments(raw: Any) -> dict[str, Any]:
    if isinstance(raw, dict):
        return raw
    if not isinstance(raw, str):
        return {}
    try:
        value = json.loads(raw)
    except json.JSONDecodeError:
        return {}
    return value if isinstance(value, dict) else {}


def _tool_result(data: dict[str, Any]) -> tuple[bool, str]:
    message = data.get("message")
    if not isinstance(message, dict):
        return False, ""
    blocks = message.get("content")
    if not isinstance(blocks, list):
        return False, ""
    text_parts: list[str] = []
    success = False
    for block in blocks:
        if not isinstance(block, dict) or block.get("type") != "tool-result":
            continue
        if block.get("isError") is True:
            continue
        success = True
        content = block.get("content")
        if not isinstance(content, list):
            continue
        for item in content:
            if isinstance(item, dict) and isinstance(item.get("text"), str):
                text_parts.append(item["text"])
    return success, "\n".join(text_parts).strip()


def _usable_lsp_result(text: str) -> bool:
    if not text:
        return False
    normalized = " ".join(text.lower().split())
    if normalized in {"null", "[]", "{}", "no results", "no references", "no definitions"}:
        return False
    return not any(
        fragment in normalized
        for fragment in (
            "no references found",
            "no definition found",
            "no implementation found",
            "no hover information",
            "0 references",
            "0 locations",
        )
    )


def _python_path(value: Any, *, production_only: bool) -> bool:
    if isinstance(value, str):
        cleaned = value.replace("\\", "/")
        if not cleaned.endswith(".py"):
            return False
        if production_only:
            normalized = f"/{cleaned.lstrip('/')}"
            return "/src/" in normalized or cleaned.startswith("src/")
        return True
    if isinstance(value, dict):
        return any(_python_path(child, production_only=production_only) for child in value.values())
    if isinstance(value, list):
        return any(_python_path(child, production_only=production_only) for child in value)
    return False


def _semantic_lsp_gate(root: Path, report_path: Path) -> dict[str, Any]:
    files = sorted(root.rglob("session.jsonl")) if root.is_dir() else []
    if not files:
        return {
            "schema": "qore-harness-principal-lsp-usage-v1",
            "passed": False,
            "error": f"no session.jsonl produced under {root}",
        }

    scans: list[tuple[Path, bool, int, list[dict[str, Any]]]] = []
    for path in files:
        events = _read_jsonl(path)
        is_subagent = any(event.get("type") == "subagent/descriptor" for event in events)
        tool_calls = sum(event.get("type") == "tool/call" for event in events)
        scans.append((path, is_subagent, tool_calls, events))

    non_subagents = [scan for scan in scans if not scan[1]]
    candidates = non_subagents if non_subagents else scans
    primary_path, _is_subagent, primary_tool_calls, events = max(
        candidates,
        key=lambda scan: scan[2],
    )

    results: dict[str, tuple[bool, str]] = {}
    for event in events:
        if event.get("type") != "tool/result":
            continue
        data = event.get("data") or {}
        if not isinstance(data, dict):
            continue
        message = data.get("message")
        source = message.get("source") if isinstance(message, dict) else None
        call_id = source.get("callId") if isinstance(source, dict) else None
        if isinstance(call_id, str):
            results[call_id] = _tool_result(data)

    evidence: list[dict[str, Any]] = []
    first_production_edit: int | None = None
    last_production_edit: int | None = None
    for event_index, event in enumerate(events):
        if event.get("type") != "tool/call":
            continue
        data = event.get("data") or {}
        if not isinstance(data, dict):
            continue
        tool_name = data.get("name")
        arguments = _json_arguments(data.get("arguments"))
        if tool_name in _EDIT_TOOLS and _python_path(arguments, production_only=True):
            if first_production_edit is None:
                first_production_edit = event_index
            last_production_edit = event_index
        if tool_name != "lsp":
            continue

        call_id = data.get("callId")
        result_success, result_text = (
            results.get(call_id, (False, "")) if isinstance(call_id, str) else (False, "")
        )
        file_path = arguments.get("file_path", arguments.get("filePath"))
        evidence.append(
            {
                "event_index": event_index,
                "call_id": call_id,
                "operation": arguments.get("operation"),
                "file_path": file_path,
                "line": arguments.get("line"),
                "character": arguments.get("character"),
                "result_success": result_success,
                "result_usable": result_success and _usable_lsp_result(result_text),
                "result_excerpt": result_text[:600],
            }
        )

    usable = [
        row
        for row in evidence
        if row["result_usable"] and _python_path(row.get("file_path"), production_only=False)
    ]
    operations = {
        row["operation"] for row in usable if isinstance(row.get("operation"), str)
    }
    production_references = [
        row
        for row in usable
        if row.get("operation") == "findReferences"
        and _python_path(row.get("file_path"), production_only=True)
    ]
    lsp_before_edit = (
        True
        if first_production_edit is None
        else any(row["event_index"] < first_production_edit for row in usable)
    )
    lsp_after_edit = (
        True
        if last_production_edit is None
        else any(row["event_index"] > last_production_edit for row in usable)
    )
    report_has_section = (
        report_path.is_file()
        and "## LSP EVIDENCE" in report_path.read_text(encoding="utf-8", errors="replace")
    )

    checks = {
        "minimum_three_usable_primary_calls": len(usable) >= 3,
        "find_references_present": "findReferences" in operations,
        "production_find_references_present": bool(production_references),
        "definition_or_implementation_present": bool(
            operations & _PRIMARY_LSP_REQUIRED_DEFINITION
        ),
        "hover_present": "hover" in operations,
        "lsp_before_first_production_edit": lsp_before_edit,
        "lsp_after_last_production_edit": lsp_after_edit,
        "final_report_has_lsp_evidence_section": report_has_section,
    }
    passed = all(checks.values())
    return {
        "schema": "qore-harness-principal-lsp-usage-v1",
        "passed": passed,
        "sessions_scanned": len(scans),
        "primary_session": str(primary_path.relative_to(root)),
        "primary_tool_calls": primary_tool_calls,
        "primary_lsp_calls": len(evidence),
        "usable_primary_lsp_calls": len(usable),
        "first_production_edit_event_index": first_production_edit,
        "last_production_edit_event_index": last_production_edit,
        "operations": sorted(operations),
        "checks": checks,
        "evidence": evidence,
    }


def read_sessions(root: Path) -> dict[str, Any]:
    files = sorted(root.rglob("session.jsonl")) if root.is_dir() else []
    if not files:
        raise RuntimeError(f"no uncompressed Harness session logs found under {root}")

    # Harness may persist both raw usage chunks and an assembled assistant message
    # carrying the same committed-step usage. For each session/turn/step, prefer the
    # latest raw usage chunk; use assistant/message only as a fallback. This mirrors
    # Harness' documented durable token-accounting projection without double-counting.
    steps: dict[tuple[str, int, int], dict[str, Any]] = {}
    message_fallbacks: dict[tuple[str, int, int], dict[str, Any]] = {}
    session_ids: set[str] = set()

    for path in files:
        session_key = str(path.relative_to(root))
        for line_no, raw in enumerate(path.read_text(encoding="utf-8").splitlines(), start=1):
            if not raw.strip():
                continue
            try:
                event = json.loads(raw)
            except json.JSONDecodeError as exc:
                raise RuntimeError(f"invalid JSONL at {path}:{line_no}: {exc}") from exc
            if event.get("type") == "session":
                sid = event.get("id")
                if isinstance(sid, str):
                    session_ids.add(sid)
                continue
            usage = _usage_from_event(event)
            if usage is None:
                continue
            data = event.get("data") or {}
            turn = _int(data.get("turn"))
            step = _int(data.get("step"))
            key = (session_key, turn, step)
            row = {
                "input_tokens": _int(usage.get("inputTokens")),
                "output_tokens": _int(usage.get("outputTokens")),
                "cache_read_tokens": _int(usage.get("cacheReadTokens")),
                "cache_write_tokens": _int(usage.get("cacheWriteTokens")),
                "reasoning_tokens": _int(usage.get("reasoningTokens")),
                "time_ms": event.get("time"),
                "tier": _tier(event.get("time")),
            }
            if event.get("type") == "assistant/chunk":
                steps[key] = row
            else:
                message_fallbacks[key] = row

    for key, row in message_fallbacks.items():
        steps.setdefault(key, row)

    totals = defaultdict(int)
    by_tier: dict[str, dict[str, int]] = {
        "off_peak": defaultdict(int),
        "peak": defaultdict(int),
        "unknown": defaultdict(int),
    }
    for row in steps.values():
        for field in (
            "input_tokens",
            "output_tokens",
            "cache_read_tokens",
            "cache_write_tokens",
            "reasoning_tokens",
        ):
            totals[field] += row[field]
            by_tier[row["tier"]][field] += row[field]

    estimated = Decimal("0")
    unknown_tier_calls = 0
    for row in steps.values():
        tier = row["tier"]
        if tier not in RATES:
            unknown_tier_calls += 1
            continue
        rates = RATES[tier]
        # DeepSeek Harness defines inputTokens as uncached input after subtracting
        # cache reads. DeepSeek currently reports no separate cache-write billing;
        # if present, conservatively price cache-write tokens at cache-miss rate.
        estimated += (
            Decimal(row["input_tokens"] + row["cache_write_tokens"]) * rates["cache_miss"]
            + Decimal(row["cache_read_tokens"]) * rates["cache_hit"]
            + Decimal(row["output_tokens"]) * rates["output"]
        ) / Decimal(1_000_000)

    result = {
        "schema": "qore-harness-usage-v1",
        "session_files": len(files),
        "session_ids": len(session_ids),
        "model_calls": len(steps),
        "uncached_input_tokens": totals["input_tokens"],
        "cache_read_tokens": totals["cache_read_tokens"],
        "cache_write_tokens": totals["cache_write_tokens"],
        "billed_input_tokens": (
            totals["input_tokens"] + totals["cache_read_tokens"] + totals["cache_write_tokens"]
        ),
        "output_tokens": totals["output_tokens"],
        "reasoning_tokens": totals["reasoning_tokens"],
        "reasoning_is_included_in_output": True,
        "estimated_usd": str(estimated.quantize(Decimal("0.00000001"))),
        "unknown_tier_calls": unknown_tier_calls,
        "pricing": {
            "model": "deepseek-v4-pro",
            "effective_from": "2026-08-16T16:00:00Z",
            "usd_per_1m": {
                tier: {name: str(value) for name, value in rates.items()}
                for tier, rates in RATES.items()
            },
            "peak_hours_utc": "Mon-Fri 01:00-04:00 and 06:00-10:00",
        },
        "by_tier": {tier: dict(values) for tier, values in by_tier.items()},
    }
    return result


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--sessions", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    args = parser.parse_args()

    sessions = args.sessions.resolve()
    result = read_sessions(sessions)
    is_principal = args.output.name == "harness-principal-usage.json"
    if is_principal:
        lsp_gate = _semantic_lsp_gate(
            sessions,
            Path("harness-principal-engineer-output.md").resolve(),
        )
        result["semantic_lsp_gate"] = lsp_gate

    args.output.write_text(json.dumps(result, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(
        "Harness usage measured: "
        f"calls={result['model_calls']} "
        f"input={result['billed_input_tokens']} "
        f"output={result['output_tokens']} "
        f"estimated_usd={result['estimated_usd']}"
    )
    if is_principal:
        lsp_gate = result["semantic_lsp_gate"]
        assert isinstance(lsp_gate, dict)
        if not lsp_gate.get("passed"):
            failed = ", ".join(
                name
                for name, passed in (lsp_gate.get("checks") or {}).items()
                if not passed
            )
            print(f"Mandatory semantic LSP gate: FAIL ({failed or 'no usable evidence'})")
            return 1
        print(
            "Mandatory semantic LSP gate: PASS "
            f"usable_calls={lsp_gate['usable_primary_lsp_calls']} "
            f"operations={','.join(lsp_gate['operations'])}"
        )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

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

    result = read_sessions(args.sessions.resolve())
    args.output.write_text(json.dumps(result, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(
        "Harness usage measured: "
        f"calls={result['model_calls']} "
        f"input={result['billed_input_tokens']} "
        f"output={result['output_tokens']} "
        f"estimated_usd={result['estimated_usd']}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

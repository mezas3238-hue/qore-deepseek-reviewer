#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

SCHEMA = "qore-deepseek-review-reasoning-v1"


def _rows(path: Path) -> list[dict[str, Any]]:
    if not path.is_file() or path.stat().st_size == 0:
        raise RuntimeError("DeepSeek reasoning audit is missing or empty")
    result: list[dict[str, Any]] = []
    for line_no, raw in enumerate(path.read_text(encoding="utf-8").splitlines(), start=1):
        if not raw.strip():
            continue
        try:
            value = json.loads(raw)
        except json.JSONDecodeError as exc:
            raise RuntimeError(f"invalid reasoning JSONL at line {line_no}: {exc}") from exc
        if not isinstance(value, dict):
            raise RuntimeError(f"reasoning audit row {line_no} must be an object")
        result.append(value)
    return result


def audit(path: Path, mode: str) -> dict[str, Any]:
    expected_mode = mode.strip().lower()
    if expected_mode not in {"expert", "coder"}:
        raise RuntimeError(f"unsupported review mode: {mode!r}")

    rows = _rows(path)
    thinking_rows: list[dict[str, Any]] = []
    for index, row in enumerate(rows, start=1):
        if row.get("schema") != SCHEMA:
            raise RuntimeError(f"row {index} has unexpected schema")
        if row.get("review_mode") != expected_mode:
            raise RuntimeError(f"row {index} review_mode does not match workflow mode")
        thinking = row.get("thinking")
        if type(thinking) is not bool:
            raise RuntimeError(f"row {index} thinking flag must be exact bool")
        effort = row.get("reasoning_effort")
        if thinking:
            if effort not in {"high", "max"}:
                raise RuntimeError(f"row {index} thinking request lacks HIGH/MAX effort")
            thinking_rows.append(row)
        elif effort is not None:
            raise RuntimeError(f"row {index} non-thinking request must not set effort")

    final_rows = [row for row in thinking_rows if row.get("stage") == "final-analysis"]
    if len(final_rows) != 1:
        raise RuntimeError(
            "review must contain exactly one authoritative final-analysis thinking request"
        )

    final_effort = final_rows[0]["reasoning_effort"]
    return {
        "schema": "qore-deepseek-review-reasoning-audit-v1",
        "review_mode": expected_mode,
        "rows": len(rows),
        "thinking_requests": len(thinking_rows),
        "authoritative_final_effort": final_effort,
        "adaptive_reasoning_verified": True,
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--audit", required=True, type=Path)
    parser.add_argument("--mode", required=True)
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()

    result = audit(args.audit.resolve(), args.mode)
    rendered = json.dumps(result, indent=2, sort_keys=True) + "\n"
    if args.output is not None:
        args.output.write_text(rendered, encoding="utf-8")
    print(rendered, end="")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

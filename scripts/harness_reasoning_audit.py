#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

AUDIT_SCHEMA = "qore-adaptive-reasoning-controller-v1"
OUTPUT_SCHEMA = "qore-adaptive-reasoning-audit-v1"


def _load_jsonl(path: Path) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for line_no, raw in enumerate(path.read_text(encoding="utf-8").splitlines(), start=1):
        if not raw.strip():
            continue
        try:
            value = json.loads(raw)
        except json.JSONDecodeError as exc:
            raise RuntimeError(f"invalid JSONL at {path}:{line_no}: {exc}") from exc
        if not isinstance(value, dict):
            raise RuntimeError(f"JSONL row at {path}:{line_no} must be an object")
        rows.append(value)
    return rows


def _session_files(root: Path) -> list[Path]:
    files = sorted(root.rglob("session.jsonl")) if root.is_dir() else []
    if not files:
        raise RuntimeError(f"no Harness session logs found under {root}")
    return files


def _request_header_efforts(root: Path) -> list[str]:
    efforts: list[str] = []
    for path in _session_files(root):
        for event in _load_jsonl(path):
            if event.get("type") != "request/header":
                continue
            data = event.get("data")
            if not isinstance(data, dict):
                continue
            header = data.get("header")
            if not isinstance(header, dict):
                continue
            config = header.get("config")
            if not isinstance(config, dict):
                continue
            effort = config.get("reasoningEffort")
            if isinstance(effort, str):
                efforts.append(effort)
    return efforts


def audit(sessions: Path, controller_audit: Path) -> dict[str, Any]:
    if not controller_audit.is_file() or controller_audit.stat().st_size == 0:
        raise RuntimeError("adaptive reasoning controller produced no audit evidence")

    decisions = _load_jsonl(controller_audit)
    if not decisions:
        raise RuntimeError("adaptive reasoning controller audit is empty")

    high = 0
    max_count = 0
    triggered = 0
    for index, row in enumerate(decisions, start=1):
        if row.get("schema") != AUDIT_SCHEMA:
            raise RuntimeError(f"reasoning audit row {index} has unexpected schema")
        effort = row.get("reasoning_effort")
        if effort not in {"high", "max"}:
            raise RuntimeError(f"reasoning audit row {index} has invalid effort {effort!r}")
        risk_score = row.get("risk_score")
        production_edit = row.get("production_edit")
        if type(risk_score) is not int or risk_score < 0:
            raise RuntimeError(f"reasoning audit row {index} has invalid risk_score")
        if type(production_edit) is not bool:
            raise RuntimeError(f"reasoning audit row {index} has invalid production_edit")
        is_triggered = risk_score >= 3 or production_edit
        if is_triggered:
            triggered += 1
            if effort != "max":
                raise RuntimeError(
                    f"adaptive reasoning policy failed closed at row {index}: "
                    "material trigger did not select max"
                )
        if effort == "high":
            high += 1
        else:
            max_count += 1

    header_efforts = _request_header_efforts(sessions)
    if not header_efforts:
        raise RuntimeError("session logs contain no request/header reasoning effort evidence")
    if "high" not in header_efforts and high:
        raise RuntimeError("controller selected high but no request/header recorded high")
    if "max" not in header_efforts and max_count:
        raise RuntimeError("controller selected max but no request/header recorded max")

    return {
        "schema": OUTPUT_SCHEMA,
        "controller_schema": AUDIT_SCHEMA,
        "decision_count": len(decisions),
        "high_decisions": high,
        "max_decisions": max_count,
        "triggered_decisions": triggered,
        "request_header_efforts": header_efforts,
        "adaptive_reasoning_verified": True,
        "policy": {
            "baseline": "high",
            "escalation": "max",
            "risk_threshold": 3,
            "production_edit_escalates": True,
        },
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--sessions", required=True, type=Path)
    parser.add_argument("--controller-audit", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    args = parser.parse_args()

    result = audit(args.sessions.resolve(), args.controller_audit.resolve())
    args.output.write_text(json.dumps(result, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(
        "QORE adaptive reasoning audit: PASS "
        f"high={result['high_decisions']} max={result['max_decisions']} "
        f"triggers={result['triggered_decisions']}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

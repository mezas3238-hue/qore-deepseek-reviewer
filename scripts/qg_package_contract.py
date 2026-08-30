#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
from collections.abc import Mapping, Sequence
from pathlib import Path
from typing import Any

SHA_RE = re.compile(r"^[0-9a-f]{40}$")
QG_SUMMARY_KEYS = frozenset(
    {
        "run_id",
        "job_id",
        "ruff_passed",
        "mypy_source_files",
        "pytest_collected",
        "pytest_passed",
        "pytest_warnings",
        "coverage_total_statements",
        "coverage_missed_statements",
        "coverage_percent",
    }
)


def parse_json_object(raw: str, *, source: str) -> dict[str, Any]:
    try:
        payload = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise RuntimeError(f"{source} is not valid JSON: {exc.msg}") from exc
    if not isinstance(payload, dict):
        raise RuntimeError(f"{source} must be a JSON object")
    return payload


def _strict_int(
    payload: Mapping[str, Any],
    key: str,
    *,
    source: str,
    minimum: int,
) -> int:
    value = payload.get(key)
    if type(value) is not int or value < minimum:
        raise RuntimeError(
            f"{source} field {key!r} must be an integer >= {minimum}"
        )
    return value


def validate_qg_summary(payload: Any, *, source: str) -> dict[str, int | bool]:
    if not isinstance(payload, dict):
        raise RuntimeError(f"{source} must be a JSON object")
    actual_keys = frozenset(payload)
    if actual_keys != QG_SUMMARY_KEYS:
        missing = sorted(QG_SUMMARY_KEYS - actual_keys)
        extra = sorted(actual_keys - QG_SUMMARY_KEYS)
        raise RuntimeError(
            f"{source} has invalid keys: missing={missing!r}, extra={extra!r}"
        )
    if payload.get("ruff_passed") is not True:
        raise RuntimeError(f"{source} field 'ruff_passed' must be true")

    validated: dict[str, int | bool] = {
        "run_id": _strict_int(payload, "run_id", source=source, minimum=1),
        "job_id": _strict_int(payload, "job_id", source=source, minimum=1),
        "ruff_passed": True,
        "mypy_source_files": _strict_int(
            payload, "mypy_source_files", source=source, minimum=1
        ),
        "pytest_collected": _strict_int(
            payload, "pytest_collected", source=source, minimum=1
        ),
        "pytest_passed": _strict_int(
            payload, "pytest_passed", source=source, minimum=1
        ),
        "pytest_warnings": _strict_int(
            payload, "pytest_warnings", source=source, minimum=0
        ),
        "coverage_total_statements": _strict_int(
            payload, "coverage_total_statements", source=source, minimum=1
        ),
        "coverage_missed_statements": _strict_int(
            payload, "coverage_missed_statements", source=source, minimum=0
        ),
        "coverage_percent": _strict_int(
            payload, "coverage_percent", source=source, minimum=0
        ),
    }
    if validated["pytest_collected"] != validated["pytest_passed"]:
        raise RuntimeError(f"{source} must declare pytest_collected == pytest_passed")
    if validated["coverage_missed_statements"] > validated["coverage_total_statements"]:
        raise RuntimeError(f"{source} coverage misses exceed total statements")
    if validated["coverage_percent"] > 100:
        raise RuntimeError(f"{source} coverage_percent must be <= 100")
    return validated


def _required_string(payload: Mapping[str, Any], key: str, *, source: str) -> str:
    value = payload.get(key)
    if not isinstance(value, str) or not value:
        raise RuntimeError(f"{source} field {key!r} must be a non-empty string")
    return value


def _validate_benchmark_partition(
    *, package_id: str, benchmark_only: bool, qg_summary: Any, source: str
) -> dict[str, int | bool]:
    has_reserved_prefix = package_id.startswith("BENCHMARK-")
    if benchmark_only and not has_reserved_prefix:
        raise RuntimeError(
            f"{source} benchmark_only requires BENCHMARK- package prefix"
        )
    if not benchmark_only and has_reserved_prefix:
        raise RuntimeError(
            f"{source} canonical review forbids the reserved BENCHMARK- prefix"
        )
    if benchmark_only:
        if qg_summary not in (None, {}):
            raise RuntimeError(
                f"{source} benchmark-only package must not declare canonical qg_summary"
            )
        return {}
    return validate_qg_summary(qg_summary, source=f"{source} qg_summary")


def validate_dispatch_request(
    payload: Any, *, benchmark_only: bool, source: str
) -> dict[str, int | bool]:
    if not isinstance(payload, dict):
        raise RuntimeError(f"{source} must be a JSON object")
    pr_number = payload.get("pr_number")
    if type(pr_number) is not int or pr_number <= 0:
        raise RuntimeError(f"{source} field 'pr_number' must be a positive integer")
    package_id = _required_string(payload, "package_id", source=source)
    for key in ("expected_base", "expected_head", "expected_synthetic"):
        value = _required_string(payload, key, source=source)
        if SHA_RE.fullmatch(value) is None:
            raise RuntimeError(f"{source} field {key!r} must be a lowercase 40-hex SHA")
    review_mode = _required_string(payload, "review_mode", source=source)
    if review_mode not in {"expert", "coder"}:
        raise RuntimeError(f"{source} review_mode must be 'expert' or 'coder'")
    prompt_path = _required_string(payload, "prompt_path", source=source)
    if not prompt_path.startswith("prompts/") or len(prompt_path) <= len("prompts/"):
        raise RuntimeError(f"{source} prompt_path must name a file under prompts/")
    return _validate_benchmark_partition(
        package_id=package_id,
        benchmark_only=benchmark_only,
        qg_summary=payload.get("qg_summary"),
        source=source,
    )


def validate_workflow_summary(
    *, package_id: str, benchmark_only: bool, raw_summary: str
) -> dict[str, int | bool]:
    summary = parse_json_object(raw_summary, source="expected_qg_summary input")
    return _validate_benchmark_partition(
        package_id=package_id,
        benchmark_only=benchmark_only,
        qg_summary=summary,
        source="workflow input",
    )


def validate_workflow_contract(
    *, package_id: str, benchmark_only: bool, raw_summary: str
) -> dict[str, object]:
    summary = validate_workflow_summary(
        package_id=package_id,
        benchmark_only=benchmark_only,
        raw_summary=raw_summary,
    )
    return {
        "benchmark_only": benchmark_only,
        "publish_allowed": not benchmark_only,
        "qg_summary": summary,
    }


def _parse_bool(raw: str) -> bool:
    if raw == "true":
        return True
    if raw == "false":
        return False
    raise argparse.ArgumentTypeError("expected 'true' or 'false'")


def parse_bool(raw: str, *, source: str) -> bool:
    try:
        return _parse_bool(raw)
    except argparse.ArgumentTypeError as exc:
        raise RuntimeError(f"{source} must be exactly 'true' or 'false'") from exc


def main(argv: Sequence[str] | None = None) -> int:
    parser = argparse.ArgumentParser()
    subparsers = parser.add_subparsers(dest="command", required=True)
    request_parser = subparsers.add_parser("request")
    request_parser.add_argument("path", type=Path)
    request_parser.add_argument("benchmark_only", type=_parse_bool)
    workflow_parser = subparsers.add_parser("workflow")
    workflow_parser.add_argument("package_id")
    workflow_parser.add_argument("benchmark_only", type=_parse_bool)
    workflow_parser.add_argument("summary_json")
    args = parser.parse_args(argv)

    if args.command == "request":
        path: Path = args.path
        summary = validate_dispatch_request(
            parse_json_object(path.read_text(encoding="utf-8"), source=str(path)),
            benchmark_only=args.benchmark_only,
            source=str(path),
        )
    else:
        contract = validate_workflow_contract(
            package_id=args.package_id,
            benchmark_only=args.benchmark_only,
            raw_summary=args.summary_json,
        )
        print(json.dumps(contract, sort_keys=True, separators=(",", ":")))
        return 0
    print(json.dumps(summary, sort_keys=True, separators=(",", ":")))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

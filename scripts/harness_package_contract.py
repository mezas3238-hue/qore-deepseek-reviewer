#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
from collections.abc import Mapping, Sequence
from pathlib import Path
from typing import Any

SHA_RE = re.compile(r"^[0-9a-f]{40}$")
PACKAGE_RE = re.compile(r"^HARNESS-BENCHMARK-[A-Z0-9][A-Z0-9._-]*$")
ALLOWED_MODES = frozenset({"auditor"})
ALLOWED_KEYS = frozenset(
    {
        "pr_number",
        "package_id",
        "expected_base",
        "expected_head",
        "expected_synthetic",
        "task_path",
        "mode",
        "benchmark_only",
        "dispatch_nonce",
    }
)


def _required_string(payload: Mapping[str, Any], key: str, *, source: str) -> str:
    value = payload.get(key)
    if type(value) is not str or not value.strip():
        raise RuntimeError(f"{source} field {key!r} must be a non-empty string")
    return value


def _validate_task_path(raw: str, *, source: str) -> str:
    path = Path(raw)
    if path.is_absolute() or ".." in path.parts:
        raise RuntimeError(f"{source} task_path must be a repository-relative path")
    if len(path.parts) < 3 or path.parts[:2] != ("harness", "prompts"):
        raise RuntimeError(f"{source} task_path must be under harness/prompts/")
    if path.suffix.lower() != ".md":
        raise RuntimeError(f"{source} task_path must be a Markdown file")
    return path.as_posix()


def validate_request(payload: Any, *, source: str) -> dict[str, Any]:
    if not isinstance(payload, dict):
        raise RuntimeError(f"{source} must be a JSON object")

    actual_keys = frozenset(payload)
    missing = ALLOWED_KEYS - actual_keys
    extra = actual_keys - ALLOWED_KEYS
    if missing or extra:
        raise RuntimeError(
            f"{source} has invalid keys: missing={sorted(missing)!r}, extra={sorted(extra)!r}"
        )

    pr_number = payload.get("pr_number")
    if type(pr_number) is not int or pr_number <= 0:
        raise RuntimeError(f"{source} pr_number must be a positive integer")

    package_id = _required_string(payload, "package_id", source=source)
    if PACKAGE_RE.fullmatch(package_id) is None:
        raise RuntimeError(
            f"{source} package_id must use HARNESS-BENCHMARK- and safe uppercase characters"
        )

    validated: dict[str, Any] = {
        "pr_number": pr_number,
        "package_id": package_id,
    }

    for key in ("expected_base", "expected_head", "expected_synthetic"):
        value = _required_string(payload, key, source=source)
        if SHA_RE.fullmatch(value) is None:
            raise RuntimeError(f"{source} {key} must be a lowercase 40-hex SHA")
        validated[key] = value

    mode = _required_string(payload, "mode", source=source)
    if mode not in ALLOWED_MODES:
        raise RuntimeError(f"{source} mode must be one of {sorted(ALLOWED_MODES)!r}")
    validated["mode"] = mode

    if payload.get("benchmark_only") is not True:
        raise RuntimeError(f"{source} benchmark_only must be exactly true")
    validated["benchmark_only"] = True

    validated["task_path"] = _validate_task_path(
        _required_string(payload, "task_path", source=source), source=source
    )
    validated["dispatch_nonce"] = _required_string(
        payload, "dispatch_nonce", source=source
    )
    return validated


def parse_json_file(path: Path) -> dict[str, Any]:
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise RuntimeError(f"{path} is not valid JSON: {exc.msg}") from exc
    return validate_request(payload, source=str(path))


def main(argv: Sequence[str] | None = None) -> int:
    parser = argparse.ArgumentParser()
    subparsers = parser.add_subparsers(dest="command", required=True)

    request_parser = subparsers.add_parser("request")
    request_parser.add_argument("path", type=Path)

    workflow_parser = subparsers.add_parser("workflow")
    workflow_parser.add_argument("pr_number", type=int)
    workflow_parser.add_argument("package_id")
    workflow_parser.add_argument("expected_base")
    workflow_parser.add_argument("expected_head")
    workflow_parser.add_argument("expected_synthetic")
    workflow_parser.add_argument("task_path")
    workflow_parser.add_argument("mode")
    workflow_parser.add_argument("dispatch_nonce")

    args = parser.parse_args(argv)
    if args.command == "request":
        validated = parse_json_file(args.path)
    else:
        validated = validate_request(
            {
                "pr_number": args.pr_number,
                "package_id": args.package_id,
                "expected_base": args.expected_base,
                "expected_head": args.expected_head,
                "expected_synthetic": args.expected_synthetic,
                "task_path": args.task_path,
                "mode": args.mode,
                "benchmark_only": True,
                "dispatch_nonce": args.dispatch_nonce,
            },
            source="workflow inputs",
        )

    print(json.dumps(validated, sort_keys=True, separators=(",", ":")))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

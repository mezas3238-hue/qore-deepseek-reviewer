#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
from collections.abc import Mapping, Sequence
from pathlib import PurePosixPath, Path
from typing import Any

SHA_RE = re.compile(r"^[0-9a-f]{40}$")
PACKAGE_RE = re.compile(r"^HARNESS-ENGINEER-[A-Z0-9][A-Z0-9._-]*$")
ALLOWED_MODES = frozenset({"engineer"})
ALLOWED_KEYS = frozenset(
    {
        "package_id",
        "expected_start",
        "expected_tree",
        "task_path",
        "mode",
        "artifact_only",
        "dispatch_nonce",
        "allowed_paths",
        "max_changed_files",
        "max_diff_lines",
        "run_full_qg",
    }
)
FORBIDDEN_PATH_PREFIXES = (
    ".git",
    ".github/",
    ".env",
    "secrets/",
)


def _required_string(payload: Mapping[str, Any], key: str, *, source: str) -> str:
    value = payload.get(key)
    if type(value) is not str or not value.strip():
        raise RuntimeError(f"{source} field {key!r} must be a non-empty string")
    return value


def _safe_repo_path(raw: str, *, source: str, field: str) -> str:
    if "\\" in raw:
        raise RuntimeError(f"{source} {field} must use POSIX separators")
    path = PurePosixPath(raw)
    if path.is_absolute() or not path.parts or ".." in path.parts or "." in path.parts:
        raise RuntimeError(f"{source} {field} must be a clean repository-relative path")
    normalized = path.as_posix()
    if any(normalized == prefix or normalized.startswith(prefix) for prefix in FORBIDDEN_PATH_PREFIXES):
        raise RuntimeError(f"{source} {field} enters a permanently forbidden engineer surface: {normalized}")
    return normalized


def _validate_task_path(raw: str, *, source: str) -> str:
    normalized = _safe_repo_path(raw, source=source, field="task_path")
    path = PurePosixPath(normalized)
    if len(path.parts) < 4 or path.parts[:3] != ("harness", "engineer", "tasks"):
        raise RuntimeError(f"{source} task_path must be under harness/engineer/tasks/")
    if path.suffix.lower() != ".md":
        raise RuntimeError(f"{source} task_path must be Markdown")
    return normalized


def _validate_allowed_paths(value: Any, *, source: str) -> list[str]:
    if type(value) is not list or not 1 <= len(value) <= 40:
        raise RuntimeError(f"{source} allowed_paths must contain 1..40 repository-relative paths")
    result: list[str] = []
    seen: set[str] = set()
    for index, raw in enumerate(value):
        if type(raw) is not str or not raw.strip():
            raise RuntimeError(f"{source} allowed_paths[{index}] must be a non-empty string")
        normalized = _safe_repo_path(raw, source=source, field=f"allowed_paths[{index}]")
        if normalized in seen:
            raise RuntimeError(f"{source} allowed_paths contains duplicate path {normalized!r}")
        seen.add(normalized)
        result.append(normalized)
    return result


def _bounded_int(payload: Mapping[str, Any], key: str, *, minimum: int, maximum: int, source: str) -> int:
    value = payload.get(key)
    if type(value) is not int or not minimum <= value <= maximum:
        raise RuntimeError(f"{source} {key} must be an integer in [{minimum}, {maximum}]")
    return value


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

    package_id = _required_string(payload, "package_id", source=source)
    if PACKAGE_RE.fullmatch(package_id) is None:
        raise RuntimeError(
            f"{source} package_id must use HARNESS-ENGINEER- and safe uppercase characters"
        )

    validated: dict[str, Any] = {"package_id": package_id}
    for key in ("expected_start", "expected_tree"):
        value = _required_string(payload, key, source=source)
        if SHA_RE.fullmatch(value) is None:
            raise RuntimeError(f"{source} {key} must be a lowercase 40-hex SHA")
        validated[key] = value

    validated["task_path"] = _validate_task_path(
        _required_string(payload, "task_path", source=source), source=source
    )

    mode = _required_string(payload, "mode", source=source)
    if mode not in ALLOWED_MODES:
        raise RuntimeError(f"{source} mode must be one of {sorted(ALLOWED_MODES)!r}")
    validated["mode"] = mode

    if payload.get("artifact_only") is not True:
        raise RuntimeError(f"{source} artifact_only must be exactly true")
    validated["artifact_only"] = True

    if payload.get("run_full_qg") is not True:
        raise RuntimeError(f"{source} run_full_qg must be exactly true in Engineer v1")
    validated["run_full_qg"] = True

    validated["dispatch_nonce"] = _required_string(payload, "dispatch_nonce", source=source)
    validated["allowed_paths"] = _validate_allowed_paths(payload.get("allowed_paths"), source=source)
    validated["max_changed_files"] = _bounded_int(
        payload, "max_changed_files", minimum=1, maximum=40, source=source
    )
    validated["max_diff_lines"] = _bounded_int(
        payload, "max_diff_lines", minimum=1, maximum=12000, source=source
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
    workflow_parser.add_argument("package_id")
    workflow_parser.add_argument("expected_start")
    workflow_parser.add_argument("expected_tree")
    workflow_parser.add_argument("task_path")
    workflow_parser.add_argument("mode")
    workflow_parser.add_argument("dispatch_nonce")
    workflow_parser.add_argument("allowed_paths_json")
    workflow_parser.add_argument("max_changed_files", type=int)
    workflow_parser.add_argument("max_diff_lines", type=int)

    args = parser.parse_args(argv)
    if args.command == "request":
        validated = parse_json_file(args.path)
    else:
        try:
            allowed_paths = json.loads(args.allowed_paths_json)
        except json.JSONDecodeError as exc:
            raise RuntimeError("workflow allowed_paths_json must be valid JSON") from exc
        validated = validate_request(
            {
                "package_id": args.package_id,
                "expected_start": args.expected_start,
                "expected_tree": args.expected_tree,
                "task_path": args.task_path,
                "mode": args.mode,
                "artifact_only": True,
                "dispatch_nonce": args.dispatch_nonce,
                "allowed_paths": allowed_paths,
                "max_changed_files": args.max_changed_files,
                "max_diff_lines": args.max_diff_lines,
                "run_full_qg": True,
            },
            source="workflow inputs",
        )

    print(json.dumps(validated, sort_keys=True, separators=(",", ":")))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

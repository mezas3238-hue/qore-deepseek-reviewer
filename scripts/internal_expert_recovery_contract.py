#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
from collections.abc import Mapping
from pathlib import Path, PurePosixPath
from typing import Any

SHA40 = re.compile(r"^[0-9a-f]{40}$")
SHA256 = re.compile(r"^[0-9a-f]{64}$")
PACKAGE = re.compile(r"^[A-Z0-9][A-Z0-9._-]*$")
REQUIRED = frozenset(
    {
        "package_id",
        "expected_start",
        "expected_tree",
        "source_run_id",
        "recovery_artifact_id",
        "recovery_patch_sha256",
        "allowed_paths",
        "max_changed_files",
        "max_diff_lines",
        "run_full_qg",
        "dispatch_nonce",
    }
)
FORBIDDEN_PREFIXES = (".git", ".github/", ".env", "secrets/")


def _safe_path(raw: str, *, source: str) -> str:
    if not raw or "\\" in raw:
        raise RuntimeError(f"{source}: invalid repository path {raw!r}")
    path = PurePosixPath(raw)
    if path.is_absolute() or not path.parts or "." in path.parts or ".." in path.parts:
        raise RuntimeError(f"{source}: invalid repository path {raw!r}")
    value = path.as_posix()
    if any(value == prefix or value.startswith(prefix) for prefix in FORBIDDEN_PREFIXES):
        raise RuntimeError(f"{source}: forbidden repository path {value!r}")
    return value


def validate(payload: Any, *, source: str) -> dict[str, Any]:
    if not isinstance(payload, Mapping):
        raise RuntimeError(f"{source}: request must be an object")
    keys = frozenset(payload)
    if keys != REQUIRED:
        raise RuntimeError(
            f"{source}: invalid keys missing={sorted(REQUIRED - keys)!r} extra={sorted(keys - REQUIRED)!r}"
        )

    package_id = payload["package_id"]
    if type(package_id) is not str or PACKAGE.fullmatch(package_id) is None:
        raise RuntimeError(f"{source}: invalid package_id")

    result: dict[str, Any] = {"package_id": package_id}
    for key in ("expected_start", "expected_tree"):
        value = payload[key]
        if type(value) is not str or SHA40.fullmatch(value) is None:
            raise RuntimeError(f"{source}: {key} must be lowercase 40-hex")
        result[key] = value

    for key in ("source_run_id", "recovery_artifact_id"):
        value = payload[key]
        if type(value) is not int or value < 1:
            raise RuntimeError(f"{source}: {key} must be a positive exact integer")
        result[key] = value

    digest = payload["recovery_patch_sha256"]
    if type(digest) is not str or SHA256.fullmatch(digest) is None:
        raise RuntimeError(f"{source}: recovery_patch_sha256 must be lowercase 64-hex")
    result["recovery_patch_sha256"] = digest

    paths = payload["allowed_paths"]
    if type(paths) is not list or not 1 <= len(paths) <= 64:
        raise RuntimeError(f"{source}: allowed_paths must contain 1..64 paths")
    normalized: list[str] = []
    seen: set[str] = set()
    for raw in paths:
        if type(raw) is not str:
            raise RuntimeError(f"{source}: allowed_paths entries must be strings")
        value = _safe_path(raw, source=source)
        if value in seen:
            raise RuntimeError(f"{source}: duplicate allowed path {value!r}")
        seen.add(value)
        normalized.append(value)
    result["allowed_paths"] = normalized

    for key, maximum in (("max_changed_files", 64), ("max_diff_lines", 70000)):
        value = payload[key]
        if type(value) is not int or not 1 <= value <= maximum:
            raise RuntimeError(f"{source}: {key} must be in [1, {maximum}]")
        result[key] = value

    if payload["run_full_qg"] is not True:
        raise RuntimeError(f"{source}: run_full_qg must be exactly true")
    result["run_full_qg"] = True

    nonce = payload["dispatch_nonce"]
    if type(nonce) is not str or not nonce.strip():
        raise RuntimeError(f"{source}: dispatch_nonce must be non-empty")
    result["dispatch_nonce"] = nonce
    return result


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("path", type=Path)
    args = parser.parse_args()
    payload = json.loads(args.path.read_text(encoding="utf-8"))
    print(json.dumps(validate(payload, source=str(args.path)), sort_keys=True, separators=(",", ":")))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

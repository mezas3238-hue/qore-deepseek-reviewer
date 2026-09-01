#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import subprocess
from pathlib import Path, PurePosixPath
from typing import Any

FORBIDDEN_PREFIXES = (
    ".git",
    ".github/",
    ".env",
    "secrets/",
)
MAX_PATCH_BYTES = 2_000_000


def _git(root: Path, *args: str, check: bool = True) -> str:
    proc = subprocess.run(
        ["git", *args],
        cwd=root,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=False,
    )
    if check and proc.returncode != 0:
        raise RuntimeError(
            f"git {' '.join(args)} failed with {proc.returncode}: {proc.stderr.strip()}"
        )
    return proc.stdout


def _normalize_repo_path(raw: str) -> str:
    if "\\" in raw:
        raise RuntimeError(f"changed path uses non-POSIX separator: {raw!r}")
    path = PurePosixPath(raw)
    if path.is_absolute() or not path.parts or ".." in path.parts or "." in path.parts:
        raise RuntimeError(f"changed path is not repository-relative: {raw!r}")
    return path.as_posix()


def _is_allowed(path: str, scopes: list[str]) -> bool:
    return any(path == scope or path.startswith(scope.rstrip("/") + "/") for scope in scopes)


def _changed_paths(root: Path) -> list[str]:
    tracked = [p for p in _git(root, "diff", "--name-only", "HEAD", "--").splitlines() if p]
    untracked = [
        p
        for p in _git(root, "ls-files", "--others", "--exclude-standard").splitlines()
        if p
    ]
    return sorted({_normalize_repo_path(p) for p in tracked + untracked})


def _intent_to_add_untracked(root: Path) -> None:
    untracked = [
        p
        for p in _git(root, "ls-files", "--others", "--exclude-standard").splitlines()
        if p
    ]
    if untracked:
        subprocess.run(["git", "add", "-N", "--", *untracked], cwd=root, check=True)


def validate(root: Path, package: dict[str, Any], patch_path: Path, metadata_path: Path) -> None:
    expected_start = package["expected_start"]
    if _git(root, "rev-parse", "HEAD").strip() != expected_start:
        raise RuntimeError("Engineer changed HEAD or created a commit")
    if _git(root, "show", "-s", "--format=%T", "HEAD").strip() != package["expected_tree"]:
        raise RuntimeError("Starting commit tree does not match the package")
    if _git(root, "remote").strip():
        raise RuntimeError("qore-core remote exists after Engineer run")

    _git(root, "reset", "--mixed", "HEAD")
    changed = _changed_paths(root)
    if not changed:
        raise RuntimeError("Engineer produced no repository changes")
    if len(changed) > package["max_changed_files"]:
        raise RuntimeError(
            f"Engineer changed {len(changed)} files; package limit is {package['max_changed_files']}"
        )

    scopes = package["allowed_paths"]
    for path in changed:
        if any(path == prefix or path.startswith(prefix) for prefix in FORBIDDEN_PREFIXES):
            raise RuntimeError(f"Engineer changed permanently forbidden path: {path}")
        if not _is_allowed(path, scopes):
            raise RuntimeError(f"Engineer changed out-of-scope path: {path}")
        physical = root / path
        if physical.is_symlink():
            raise RuntimeError(f"Engineer v1 does not accept symlink changes: {path}")

    _intent_to_add_untracked(root)
    check_proc = subprocess.run(
        ["git", "diff", "--check", "HEAD", "--"],
        cwd=root,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        check=False,
    )
    if check_proc.returncode != 0:
        raise RuntimeError(f"git diff --check failed:\n{check_proc.stdout}")

    numstat = _git(root, "diff", "--numstat", "HEAD", "--")
    diff_lines = 0
    for line in numstat.splitlines():
        if not line:
            continue
        added, deleted, _path = line.split("\t", 2)
        if not added.isdigit() or not deleted.isdigit():
            raise RuntimeError(f"Engineer v1 does not accept binary diff entry: {line}")
        diff_lines += int(added) + int(deleted)
    if diff_lines > package["max_diff_lines"]:
        raise RuntimeError(
            f"Engineer diff has {diff_lines} changed lines; package limit is {package['max_diff_lines']}"
        )

    patch = _git(root, "diff", "--binary", "HEAD", "--")
    encoded = patch.encode("utf-8")
    if len(encoded) > MAX_PATCH_BYTES:
        raise RuntimeError(f"Engineer patch exceeds {MAX_PATCH_BYTES} bytes")
    patch_path.write_bytes(encoded)

    metadata = {
        "schema": "qore-harness-engineer-gate-v1",
        "expected_start": expected_start,
        "expected_tree": package["expected_tree"],
        "changed_files": changed,
        "changed_file_count": len(changed),
        "diff_changed_lines": diff_lines,
        "patch_bytes": len(encoded),
        "allowed_paths": scopes,
        "max_changed_files": package["max_changed_files"],
        "max_diff_lines": package["max_diff_lines"],
        "remote_count": 0,
        "head_unchanged": True,
        "artifact_only": True,
    }
    metadata_path.write_text(json.dumps(metadata, indent=2, sort_keys=True) + "\n", encoding="utf-8")

    _git(root, "reset", "--mixed", "HEAD")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--workspace", type=Path, required=True)
    parser.add_argument("--package", type=Path, required=True)
    parser.add_argument("--patch", type=Path, required=True)
    parser.add_argument("--metadata", type=Path, required=True)
    args = parser.parse_args()

    package = json.loads(args.package.read_text(encoding="utf-8"))
    validate(args.workspace.resolve(), package, args.patch, args.metadata)
    print("QORE Harness Engineer deterministic gate: PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

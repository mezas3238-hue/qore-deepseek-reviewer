#!/usr/bin/env python3
from __future__ import annotations

import argparse
import os
import subprocess
import tempfile
from pathlib import Path


def _git(workspace: Path, *args: str, check: bool = True) -> subprocess.CompletedProcess[bytes]:
    return subprocess.run(
        ["git", "-C", str(workspace), *args],
        check=check,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )


def snapshot(workspace: Path, output: Path) -> None:
    workspace = workspace.resolve()
    if not (workspace / ".git").exists():
        raise RuntimeError(f"workspace is not a git checkout: {workspace}")

    tracked = _git(workspace, "diff", "--binary", "HEAD", "--").stdout
    untracked_raw = _git(
        workspace,
        "ls-files",
        "--others",
        "--exclude-standard",
        "-z",
    ).stdout
    untracked = [p for p in untracked_raw.split(b"\0") if p]

    chunks: list[bytes] = [tracked]
    for raw_path in sorted(untracked):
        rel = os.fsdecode(raw_path)
        candidate = workspace / rel
        if not candidate.exists() and not candidate.is_symlink():
            continue
        proc = _git(
            workspace,
            "diff",
            "--no-index",
            "--binary",
            "--",
            "/dev/null",
            rel,
            check=False,
        )
        if proc.returncode not in {0, 1}:
            raise RuntimeError(
                f"git diff --no-index failed for {rel!r}: "
                f"{proc.stderr.decode('utf-8', errors='replace')}"
            )
        chunks.append(proc.stdout)

    output = output.resolve()
    output.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp_name = tempfile.mkstemp(prefix=output.name + ".", dir=output.parent)
    try:
        with os.fdopen(fd, "wb") as fh:
            for chunk in chunks:
                fh.write(chunk)
        os.replace(tmp_name, output)
    except BaseException:
        try:
            os.unlink(tmp_name)
        except FileNotFoundError:
            pass
        raise


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--workspace", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    snapshot(args.workspace, args.output)

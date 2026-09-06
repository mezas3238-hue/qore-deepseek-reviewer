#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import re
from pathlib import Path

_HEADER = re.compile(br"(?m)^diff --git ")


def _is_generated_recovery_path(path: bytes) -> bool:
    """Return True only for host-generated Harness recovery/coverage files."""
    return path.startswith(b".coverage") or path.startswith(b".qore-harness-recovery/")


def sanitize(data: bytes) -> tuple[bytes, tuple[str, ...]]:
    """Remove generated recovery diffs and canonicalize semantic chunk ordering.

    Git's deterministic ``git diff --binary HEAD --`` output is path-sorted. A
    recovered Harness artifact may contain the same semantic diff chunks in
    generation order plus host-generated coverage/checkpoint files. Sorting the
    untouched semantic chunks by repository path makes the sanitized artifact
    byte-identical to the canonical semantic patch. Semantic chunk contents are
    never rewritten.
    """
    starts = [match.start() for match in _HEADER.finditer(data)]
    if not starts:
        raise RuntimeError("input contains no git diff headers")

    preamble = data[: starts[0]]
    semantic_chunks: list[tuple[bytes, bytes]] = []
    removed: list[str] = []
    for index, start in enumerate(starts):
        end = starts[index + 1] if index + 1 < len(starts) else len(data)
        chunk = data[start:end]
        first_line = chunk.split(b"\n", 1)[0]
        fields = first_line.split()
        if len(fields) < 4 or fields[0:2] != [b"diff", b"--git"]:
            raise RuntimeError(f"malformed diff header: {first_line!r}")
        a_path = fields[2]
        path = a_path[2:] if a_path.startswith(b"a/") else a_path
        if _is_generated_recovery_path(path):
            removed.append(path.decode("utf-8"))
            continue
        semantic_chunks.append((path, chunk))

    if not removed:
        raise RuntimeError("expected at least one generated Harness recovery/coverage diff")
    if not semantic_chunks:
        raise RuntimeError("sanitization would leave no semantic candidate")

    paths = [path for path, _chunk in semantic_chunks]
    if len(paths) != len(set(paths)):
        raise RuntimeError("semantic patch contains duplicate repository paths")

    sanitized = preamble + b"".join(chunk for _path, chunk in sorted(semantic_chunks))
    for path, _chunk in semantic_chunks:
        if _is_generated_recovery_path(path):
            raise RuntimeError(f"generated path survived sanitation: {path!r}")
    if b"diff --git a/.coverage" in sanitized or b"diff --git a/.qore-harness-recovery/" in sanitized:
        raise RuntimeError("generated recovery/coverage diff survived sanitation")
    return sanitized, tuple(removed)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--expected-input-sha256")
    parser.add_argument("--expected-output-sha256")
    args = parser.parse_args()

    data = args.input.read_bytes()
    input_sha = hashlib.sha256(data).hexdigest()
    if args.expected_input_sha256 and input_sha != args.expected_input_sha256:
        raise RuntimeError(
            f"input SHA256 mismatch expected={args.expected_input_sha256} actual={input_sha}"
        )

    sanitized, removed = sanitize(data)
    output_sha = hashlib.sha256(sanitized).hexdigest()
    if args.expected_output_sha256 and output_sha != args.expected_output_sha256:
        raise RuntimeError(
            f"output SHA256 mismatch expected={args.expected_output_sha256} actual={output_sha}"
        )

    args.output.write_bytes(sanitized)
    print(
        f"sanitized_harness_recovery_patch input_sha256={input_sha} "
        f"output_sha256={output_sha} removed={','.join(removed)}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

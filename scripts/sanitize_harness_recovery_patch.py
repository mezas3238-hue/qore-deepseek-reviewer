#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import re
from pathlib import Path

_HELPER_PATHS = frozenset(
    {
        b".qore-harness-recovery/candidate.patch",
        b".qore-harness-recovery/checkpoints.md",
    }
)
_HEADER = re.compile(br"(?m)^diff --git ")


def sanitize(data: bytes) -> tuple[bytes, tuple[str, ...]]:
    starts = [match.start() for match in _HEADER.finditer(data)]
    if not starts:
        raise RuntimeError("input contains no git diff headers")

    output: list[bytes] = [data[: starts[0]]]
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
        if path in _HELPER_PATHS:
            removed.append(path.decode("utf-8"))
            continue
        output.append(chunk)

    if len(removed) != len(_HELPER_PATHS) or frozenset(path.encode() for path in removed) != _HELPER_PATHS:
        raise RuntimeError(
            "expected exactly the two Harness recovery helper diffs; "
            f"removed={removed!r}"
        )
    sanitized = b"".join(output)
    for helper in _HELPER_PATHS:
        marker = b"diff --git a/" + helper + b" b/" + helper
        if marker in sanitized:
            raise RuntimeError(f"helper diff survived sanitation: {helper!r}")
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

#!/usr/bin/env python3
from __future__ import annotations

from copy import deepcopy

from harness_engineer_package_contract import validate_request


def _base_request() -> dict[str, object]:
    return {
        "package_id": "HARNESS-ENGINEER-QORE-BOUNDARY-TEST-001",
        "expected_start": "a" * 40,
        "expected_tree": "b" * 40,
        "task_path": "harness/engineer/tasks/example.md",
        "mode": "engineer",
        "artifact_only": True,
        "dispatch_nonce": "boundary-test",
        "allowed_paths": ["src/qore", "tests"],
        "max_changed_files": 48,
        "max_diff_lines": 11000,
        "run_full_qg": True,
    }


def _must_reject(payload: dict[str, object]) -> None:
    try:
        validate_request(payload, source="test")
    except RuntimeError:
        return
    raise AssertionError(f"request unexpectedly accepted: {payload!r}")


def main() -> None:
    request = _base_request()
    validated = validate_request(request, source="test")
    assert validated["max_changed_files"] == 48

    too_large = deepcopy(request)
    too_large["max_changed_files"] = 65
    _must_reject(too_large)

    bool_laundering = deepcopy(request)
    bool_laundering["max_changed_files"] = True
    _must_reject(bool_laundering)

    diff_too_large = deepcopy(request)
    diff_too_large["max_diff_lines"] = 12001
    _must_reject(diff_too_large)

    print("Harness Engineer package-contract bounded file budget tests passed")


if __name__ == "__main__":
    main()

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
    assert validated["recovery_artifact_id"] is None
    assert validated["recovery_patch_sha256"] is None

    recovered = deepcopy(request)
    recovered["recovery_artifact_id"] = 9878203635
    recovered["recovery_patch_sha256"] = "c" * 64
    validated_recovered = validate_request(recovered, source="test")
    assert validated_recovered["recovery_artifact_id"] == 9878203635
    assert validated_recovered["recovery_patch_sha256"] == "c" * 64

    missing_digest = deepcopy(request)
    missing_digest["recovery_artifact_id"] = 9878203635
    _must_reject(missing_digest)

    missing_artifact = deepcopy(request)
    missing_artifact["recovery_patch_sha256"] = "c" * 64
    _must_reject(missing_artifact)

    bool_artifact = deepcopy(recovered)
    bool_artifact["recovery_artifact_id"] = True
    _must_reject(bool_artifact)

    bad_digest = deepcopy(recovered)
    bad_digest["recovery_patch_sha256"] = "C" * 64
    _must_reject(bad_digest)

    too_large = deepcopy(request)
    too_large["max_changed_files"] = 65
    _must_reject(too_large)

    bool_laundering = deepcopy(request)
    bool_laundering["max_changed_files"] = True
    _must_reject(bool_laundering)

    diff_too_large = deepcopy(request)
    diff_too_large["max_diff_lines"] = 12001
    _must_reject(diff_too_large)

    print("Harness Engineer package-contract and recovery-binding tests passed")


if __name__ == "__main__":
    main()

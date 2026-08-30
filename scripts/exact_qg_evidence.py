#!/usr/bin/env python3
"""Deterministic exact QORE CI evidence for canonical DeepSeek reviews."""

from __future__ import annotations

import json
import os
import re
import urllib.error
import urllib.request
from collections.abc import Mapping
from pathlib import Path
from typing import Any

import qg_package_contract as qg_contract

_QG_MARKER_RE = re.compile(r"<!-- QORE-EXACT-QG (?P<payload>\{[^\r\n]*\}) -->")
_ANSI_RE = re.compile(r"\x1b\[[0-9;]*m")
_GROUP_PREFIX = "##[group]Run "
_CHECKOUT_COMMAND = "[command]/usr/bin/git log -1 --format=%H"
_QORE_CI_WORKFLOW_ID = 328173079
_QORE_CI_WORKFLOW_NAME = "QORE CI"
_QORE_CI_WORKFLOW_PATH = ".github/workflows/ci.yml"
_QG_EVIDENCE_MAX_CHARS = 8000
_MYPY_RE = re.compile(r"Success: no issues found in (?P<count>\d+) source files")
_COLLECTED_RE = re.compile(r"collected (?P<count>\d+) items")
_PASSED_RE = re.compile(r"(?P<passed>\d+) passed(?:, (?P<warnings>\d+) warnings)? in\b")
_TOTAL_RE = re.compile(
    r"(?m)^.*?\bTOTAL\s+(?P<statements>\d+)\s+(?P<missed>\d+)\s+(?P<percent>\d+)%"
)


class _NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):  # type: ignore[no-untyped-def]
        return None


def _github_json(url: str) -> dict[str, Any]:
    token = os.environ["GH_TOKEN"]
    request = urllib.request.Request(
        url,
        headers={
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "qore-deepseek-reviewer",
        },
    )
    with urllib.request.urlopen(request, timeout=60) as response:
        payload = json.loads(response.read().decode("utf-8"))
    if not isinstance(payload, dict):
        raise RuntimeError("GitHub JSON response is not an object")
    return payload


def _github_text(url: str) -> str:
    token = os.environ["GH_TOKEN"]
    request = urllib.request.Request(
        url,
        headers={
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "qore-deepseek-reviewer",
        },
    )
    opener = urllib.request.build_opener(_NoRedirect())
    try:
        response = opener.open(request, timeout=60)
    except urllib.error.HTTPError as exc:
        if exc.code not in {301, 302, 303, 307, 308}:
            raise
        location = exc.headers.get("Location")
        if not location:
            raise RuntimeError("GitHub job-log redirect omitted Location") from exc
        with urllib.request.urlopen(location, timeout=60) as redirected:
            return redirected.read().decode("utf-8", errors="replace")
    with response:
        return response.read().decode("utf-8", errors="replace")


def _load_exact_qg_contract() -> dict[str, int | bool]:
    raw = os.environ.get("EXPECTED_QG_SUMMARY_JSON")
    if raw is None:
        raise RuntimeError("EXPECTED_QG_SUMMARY_JSON is required")
    expected = qg_contract.validate_qg_summary(
        qg_contract.parse_json_object(raw, source="EXPECTED_QG_SUMMARY_JSON"),
        source="EXPECTED_QG_SUMMARY_JSON",
    )
    prompt_path = Path(os.environ["PROMPT_PATH"])
    prompt = prompt_path.read_text(encoding="utf-8")
    matches = list(_QG_MARKER_RE.finditer(prompt))
    if len(matches) != 1:
        raise RuntimeError(
            "prompt must contain exactly one <!-- QORE-EXACT-QG {...} --> marker"
        )
    prompt_summary = qg_contract.validate_qg_summary(
        qg_contract.parse_json_object(
            matches[0].group("payload"), source="prompt QORE-EXACT-QG marker"
        ),
        source="prompt QORE-EXACT-QG marker",
    )
    if prompt_summary != expected:
        raise RuntimeError(
            "prompt QORE-EXACT-QG marker does not equal package/request summary"
        )
    return expected


def _normalized_log_line(line: str) -> str:
    clean = _ANSI_RE.sub("", line).strip()
    marker = clean.find("##[")
    if marker >= 0:
        return clean[marker:]
    if re.match(r"^\d{4}-\d{2}-\d{2}T\S+\s", clean):
        return clean.split(maxsplit=1)[1]
    return clean


def _command_section(log: str, command: str) -> str:
    lines = log.splitlines()
    expected_marker = _GROUP_PREFIX + command
    starts = [
        index
        for index, line in enumerate(lines)
        if _normalized_log_line(line) == expected_marker
    ]
    if len(starts) != 1:
        raise RuntimeError(
            f"QORE CI raw log must contain exactly one command group {command!r}; "
            f"found {len(starts)}"
        )
    start = starts[0] + 1
    end = len(lines)
    for index in range(start, len(lines)):
        if _normalized_log_line(lines[index]).startswith(_GROUP_PREFIX):
            end = index
            break
    return "\n".join(_ANSI_RE.sub("", line) for line in lines[start:end])


def _unique_match(
    pattern: re.Pattern[str],
    section: str,
    *,
    label: str,
    groups: tuple[str, ...],
) -> tuple[int, ...]:
    values = {
        tuple(int(match.group(group)) for group in groups)
        for match in pattern.finditer(section)
    }
    if not values:
        raise RuntimeError(f"QORE CI {label} summary is missing from its command group")
    if len(values) != 1:
        raise RuntimeError(f"QORE CI {label} summary is ambiguous: {sorted(values)!r}")
    return next(iter(values))


def _parse_qg_log(log: str) -> dict[str, int | bool]:
    ruff = _command_section(log, "ruff check .")
    mypy = _command_section(log, "mypy src tests")
    pytest = _command_section(log, "pytest --cov=src/qore --cov-report=term-missing")
    if "All checks passed!" not in ruff:
        raise RuntimeError("QORE CI Ruff success is missing from the Ruff command group")
    mypy_files = _unique_match(
        _MYPY_RE, mypy, label="Mypy", groups=("count",)
    )[0]
    collected = _unique_match(
        _COLLECTED_RE, pytest, label="pytest collection", groups=("count",)
    )[0]
    passed_values: set[tuple[int, int]] = set()
    for match in _PASSED_RE.finditer(pytest):
        warning_group = match.group("warnings")
        passed_values.add(
            (int(match.group("passed")), int(warning_group) if warning_group else 0)
        )
    if not passed_values:
        raise RuntimeError("QORE CI pytest pass summary is missing from its command group")
    if len(passed_values) != 1:
        raise RuntimeError(
            f"QORE CI pytest pass summary is ambiguous: {sorted(passed_values)!r}"
        )
    passed, warnings = next(iter(passed_values))
    statements, missed, percent = _unique_match(
        _TOTAL_RE,
        pytest,
        label="coverage TOTAL",
        groups=("statements", "missed", "percent"),
    )
    return {
        "ruff_passed": True,
        "mypy_source_files": mypy_files,
        "pytest_collected": collected,
        "pytest_passed": passed,
        "pytest_warnings": warnings,
        "coverage_total_statements": statements,
        "coverage_missed_statements": missed,
        "coverage_percent": percent,
    }


def _validate_checkout_synthetic(log: str, expected_synthetic: str) -> None:
    lines = log.splitlines()
    commands = [
        index
        for index, line in enumerate(lines)
        if _normalized_log_line(line) == _CHECKOUT_COMMAND
    ]
    if len(commands) != 1:
        raise RuntimeError(
            "QORE CI checkout log must contain exactly one command-bound git HEAD proof; "
            f"found {len(commands)}"
        )
    proof_index = commands[0] + 1
    while proof_index < len(lines) and not _normalized_log_line(lines[proof_index]):
        proof_index += 1
    observed = (
        _normalized_log_line(lines[proof_index]) if proof_index < len(lines) else ""
    )
    if observed != expected_synthetic:
        raise RuntimeError(
            "QORE CI checkout proof does not equal EXPECTED_SYNTHETIC: "
            + repr(observed)
        )


def _validate_workflow_identity(
    run: Mapping[str, Any], *, expected_head: str, expected_synthetic: str
) -> dict[str, Any]:
    if expected_head == expected_synthetic:
        raise RuntimeError("post-merge QORE CI cannot authorize an OPEN-PR review")
    expected_fields: dict[str, int | str] = {
        "workflow_id": _QORE_CI_WORKFLOW_ID,
        "name": _QORE_CI_WORKFLOW_NAME,
        "path": _QORE_CI_WORKFLOW_PATH,
        "event": "pull_request",
    }
    for field, expected in expected_fields.items():
        if run.get(field) != expected:
            raise RuntimeError(
                f"QORE CI run workflow identity field {field!r} mismatch: "
                f"expected {expected!r}, observed {run.get(field)!r}"
            )
    return {**expected_fields, "mode": "pr_review_authorized"}


def build_exact_qg_evidence() -> str:
    expected = _load_exact_qg_contract()
    run_id = int(expected["run_id"])
    job_id = int(expected["job_id"])
    expected_head = os.environ["EXPECTED_HEAD"]
    expected_synthetic = os.environ["EXPECTED_SYNTHETIC"]
    for name, value in (
        ("EXPECTED_HEAD", expected_head),
        ("EXPECTED_SYNTHETIC", expected_synthetic),
    ):
        if qg_contract.SHA_RE.fullmatch(value) is None:
            raise RuntimeError(f"{name} must be a lowercase 40-hex SHA")

    run = _github_json(
        f"https://api.github.com/repos/mezas3238-hue/qore-core/actions/runs/{run_id}"
    )
    job = _github_json(
        f"https://api.github.com/repos/mezas3238-hue/qore-core/actions/jobs/{job_id}"
    )
    if int(run.get("id", -1)) != run_id:
        raise RuntimeError("QORE CI run id mismatch")
    if run.get("status") != "completed" or run.get("conclusion") != "success":
        raise RuntimeError("QORE CI run is not completed SUCCESS")
    if run.get("head_sha") != expected_head:
        raise RuntimeError("QORE CI run head_sha does not equal EXPECTED_HEAD")
    workflow_identity = _validate_workflow_identity(
        run, expected_head=expected_head, expected_synthetic=expected_synthetic
    )
    if int(job.get("id", -1)) != job_id or int(job.get("run_id", -1)) != run_id:
        raise RuntimeError("QORE CI job binding mismatch")
    if job.get("status") != "completed" or job.get("conclusion") != "success":
        raise RuntimeError("QORE CI job is not completed SUCCESS")
    if job.get("name") != "quality":
        raise RuntimeError("QORE CI job is not the required quality job")
    if job.get("head_sha") != expected_head:
        raise RuntimeError("QORE CI job head_sha does not equal EXPECTED_HEAD")

    log = _github_text(
        f"https://api.github.com/repos/mezas3238-hue/qore-core/actions/jobs/{job_id}/logs"
    )
    _validate_checkout_synthetic(log, expected_synthetic)
    observed: dict[str, int | bool] = {
        "run_id": run_id,
        "job_id": job_id,
        **_parse_qg_log(log),
    }
    if observed != expected:
        differing = {
            key: {"expected": expected.get(key), "observed": observed.get(key)}
            for key in sorted(qg_contract.QG_SUMMARY_KEYS)
            if expected.get(key) != observed.get(key)
        }
        raise RuntimeError(
            "QORE CI observed summary does not equal package/request summary: "
            + json.dumps(differing, sort_keys=True)
        )

    metadata = {
        "run": {
            "id": run_id,
            "workflow_id": run.get("workflow_id"),
            "name": run.get("name"),
            "path": run.get("path"),
            "event": run.get("event"),
            "head_sha": run.get("head_sha"),
            "status": run.get("status"),
            "conclusion": run.get("conclusion"),
        },
        "workflow_identity": workflow_identity,
        "job": {
            "id": job_id,
            "run_id": job.get("run_id"),
            "name": job.get("name"),
            "head_sha": job.get("head_sha"),
            "status": job.get("status"),
            "conclusion": job.get("conclusion"),
        },
        "declared_summary": expected,
        "observed_summary": observed,
        "authenticated_command_summaries": {
            "ruff check .": "All checks passed!",
            "mypy src tests": (
                "Success: no issues found in "
                f"{observed['mypy_source_files']} source files"
            ),
            "pytest --cov=src/qore --cov-report=term-missing": {
                "collected": observed["pytest_collected"],
                "passed": observed["pytest_passed"],
                "warnings": observed["pytest_warnings"],
                "coverage_total_statements": observed["coverage_total_statements"],
                "coverage_missed_statements": observed["coverage_missed_statements"],
                "coverage_percent": observed["coverage_percent"],
            },
        },
        "checkout_proof": {
            "command": _CHECKOUT_COMMAND,
            "observed_head": expected_synthetic,
        },
        "raw_validation": (
            "Full command windows were parsed and validated internally; only "
            "authenticated identity, exact summaries, and checkout proof are "
            "transported to model context."
        ),
    }
    evidence = "QORE EXACT CI AUTHENTICATED EVIDENCE:\n" + json.dumps(
        metadata, indent=2, sort_keys=True
    )
    if len(evidence) > _QG_EVIDENCE_MAX_CHARS:
        raise RuntimeError(
            "compact QORE CI evidence exceeds hard transport bound: "
            f"{len(evidence)} > {_QG_EVIDENCE_MAX_CHARS}"
        )
    return evidence

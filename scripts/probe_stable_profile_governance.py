#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import json
import os
import tempfile
from pathlib import Path

import exact_qg_evidence as qg

ROOT = Path(__file__).resolve().parents[1]
ACTIVE_MANIFEST = ROOT / "profiles" / "QORE-DEEPSEEK-V2.1.2-ADAPTIVE.json"
HISTORICAL_MANIFEST = ROOT / "profiles" / "QORE-DEEPSEEK-V2.1.1-STABLE.json"


def _blob(path: Path) -> str:
    data = path.read_bytes()
    return hashlib.sha1(
        f"blob {len(data)}\0".encode("ascii") + data,
        usedforsecurity=False,
    ).hexdigest()


def _summary() -> dict[str, int | bool]:
    return {
        "run_id": 111,
        "job_id": 222,
        "ruff_passed": True,
        "mypy_source_files": 321,
        "pytest_collected": 456,
        "pytest_passed": 456,
        "pytest_warnings": 2,
        "coverage_total_statements": 9000,
        "coverage_missed_statements": 90,
        "coverage_percent": 99,
    }


def _log(summary: dict[str, int | bool], synthetic: str) -> str:
    return "\n".join(
        [
            "2026-08-30T00:00:00Z ##[group]Run ruff check .",
            "2026-08-30T00:00:00Z All checks passed!",
            "2026-08-30T00:00:00Z ##[group]Run mypy src tests",
            (
                "2026-08-30T00:00:00Z Success: no issues found in "
                f"{summary['mypy_source_files']} source files"
            ),
            (
                "2026-08-30T00:00:00Z ##[group]Run "
                "pytest --cov=src/qore --cov-report=term-missing"
            ),
            f"2026-08-30T00:00:00Z collected {summary['pytest_collected']} items",
            (
                f"2026-08-30T00:00:00Z {summary['pytest_passed']} passed, "
                f"{summary['pytest_warnings']} warnings in 12.34s"
            ),
            (
                "2026-08-30T00:00:00Z TOTAL "
                f"{summary['coverage_total_statements']} "
                f"{summary['coverage_missed_statements']} "
                f"{summary['coverage_percent']}%"
            ),
            "2026-08-30T00:00:00Z SECRET-RAW-LOG-DECOY",
            "2026-08-30T00:00:00Z ##[group]Run verify checkout",
            "2026-08-30T00:00:00Z [command]/usr/bin/git log -1 --format=%H",
            f"2026-08-30T00:00:00Z {synthetic}",
        ]
    )


def _expect_failure(fragment: str, callback) -> None:  # type: ignore[no-untyped-def]
    try:
        callback()
    except RuntimeError as exc:
        assert fragment in str(exc), (fragment, str(exc))
    else:
        raise AssertionError(f"expected failure containing {fragment!r}")


def _probe_exact_qg() -> None:
    summary = _summary()
    head = "a" * 40
    synthetic = "b" * 40
    run = {
        "id": summary["run_id"],
        "workflow_id": 328173079,
        "name": "QORE CI",
        "path": ".github/workflows/ci.yml",
        "event": "pull_request",
        "status": "completed",
        "conclusion": "success",
        "head_sha": head,
    }
    job = {
        "id": summary["job_id"],
        "run_id": summary["run_id"],
        "name": "quality",
        "status": "completed",
        "conclusion": "success",
        "head_sha": head,
    }
    raw_log = _log(summary, synthetic)

    original_json = qg._github_json
    original_text = qg._github_text
    with tempfile.TemporaryDirectory() as tmp:
        prompt = Path(tmp) / "prompt.md"
        marker = json.dumps(summary, sort_keys=True, separators=(",", ":"))
        prompt.write_text(f"review\n<!-- QORE-EXACT-QG {marker} -->\n", encoding="utf-8")
        old_env = dict(os.environ)
        os.environ.update(
            {
                "EXPECTED_QG_SUMMARY_JSON": marker,
                "PROMPT_PATH": str(prompt),
                "EXPECTED_HEAD": head,
                "EXPECTED_SYNTHETIC": synthetic,
                "GH_TOKEN": "probe-only",
            }
        )
        try:
            qg._github_json = lambda url: job if "/jobs/" in url else run
            qg._github_text = lambda _url: raw_log
            evidence = qg.build_exact_qg_evidence()
            assert len(evidence) <= qg._QG_EVIDENCE_MAX_CHARS
            assert "authenticated_command_summaries" in evidence
            assert "SECRET-RAW-LOG-DECOY" not in evidence
            bad_job = dict(job)
            bad_job["head_sha"] = "c" * 40
            qg._github_json = lambda url: bad_job if "/jobs/" in url else run
            _expect_failure(
                "job head_sha does not equal EXPECTED_HEAD",
                qg.build_exact_qg_evidence,
            )
        finally:
            qg._github_json = original_json
            qg._github_text = original_text
            os.environ.clear()
            os.environ.update(old_env)


def _probe_routing_and_manifest() -> None:
    meter = (ROOT / "scripts" / "run_review_with_meter.py").read_text(encoding="utf-8")
    assert 'os.environ.get("DEEPSEEK_REVIEWER_PROFILE", "stable")' in meter
    assert 'elif _REVIEWER_PROFILE == "compact-budgeted"' in meter
    assert 'elif _REVIEWER_PROFILE == "stable"' in meter
    assert 'startswith("BENCHMARK-COMPACT-")' in meter
    assert "deepseek_reviewer_v2_1_2_adaptive_reasoning_entrypoint.py" in meter

    historical = json.loads(HISTORICAL_MANIFEST.read_text(encoding="utf-8"))
    assert historical["profile_id"] == "QORE-DEEPSEEK-V2.1.1-STABLE"
    assert historical["status"] == "superseded"
    assert historical["superseded_by"] == "QORE-DEEPSEEK-V2.1.2-ADAPTIVE"

    manifest = json.loads(ACTIVE_MANIFEST.read_text(encoding="utf-8"))
    assert manifest["profile_id"] == "QORE-DEEPSEEK-V2.1.2-ADAPTIVE"
    assert manifest["status"] == "stable"
    assert manifest["supersedes"] == historical["profile_id"]
    assert manifest["model"] == "deepseek-v4-pro"
    assert manifest["analysis"] == "thinking/adaptive-high-max"
    assert manifest["reasoning_policy"]["baseline"] == "high"
    assert manifest["reasoning_policy"]["escalation"] == "max"
    assert manifest["entrypoint"] == "scripts/deepseek_reviewer_v2_1_2_adaptive_reasoning_entrypoint.py"
    assert manifest["meter"]["ordinary_route"] == manifest["entrypoint"]
    assert manifest["meter"]["default_profile"] == "stable"
    assert manifest["alternate_profiles"]["compact-budgeted"]["ordinary_default"] is False

    expected_workflows = {
        ".github/workflows/deepseek-auto-dispatch.yml",
        ".github/workflows/deepseek-connection-test.yml",
        ".github/workflows/deepseek-qore-review.yml",
    }
    workflows = manifest["workflows"]
    assert set(workflows) == expected_workflows
    assert manifest["permanent_workflow_count"] == 3
    assert ".github/workflows/qore-orchestrator-completion-callback.yml" not in workflows

    paths: dict[str, str] = {}
    paths.update(manifest["engine_files"])
    paths.update(workflows)
    paths[manifest["meter"]["path"]] = manifest["meter"]["blob"]
    for relative, expected_blob in sorted(paths.items()):
        actual = _blob(ROOT / relative)
        assert actual == expected_blob, (relative, expected_blob, actual)


def main() -> int:
    _probe_exact_qg()
    _probe_routing_and_manifest()
    print("Active adaptive profile governance and exact-QG probes passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

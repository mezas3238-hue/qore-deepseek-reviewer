#!/usr/bin/env python3
from __future__ import annotations

import copy
import json
import os
import sys
import tempfile
from collections.abc import Callable
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
REPOSITORY_ROOT = SCRIPT_DIR.parent
os.environ.setdefault("QORE_ROOT", str(REPOSITORY_ROOT))
os.environ.setdefault("PR_NUMBER", "1")
os.environ.setdefault("EXPECTED_BASE", "a" * 40)
os.environ.setdefault("EXPECTED_HEAD", "b" * 40)
os.environ.setdefault("EXPECTED_SYNTHETIC", "c" * 40)
os.environ.setdefault("PACKAGE_ID", "NO-MODEL-EXACT-QG-BINDING-PROBE")
os.environ.setdefault("REVIEW_MODE", "expert")
os.environ.setdefault("PROMPT_PATH", str(Path(__file__).resolve()))
os.environ.setdefault("REVIEW_OUTPUT", str(REPOSITORY_ROOT / "probe-unused.md"))
os.environ.setdefault("DEEPSEEK_API_KEY", "not-used")
os.environ.setdefault("GH_TOKEN", "not-used")

sys.path.insert(0, str(SCRIPT_DIR))
import deepseek_reviewer_compact_budgeted_v19 as v19  # noqa: E402


def _summary(*, warnings: int = 2) -> dict[str, int | bool]:
    return {
        "run_id": 9001,
        "job_id": 9002,
        "ruff_passed": True,
        "mypy_source_files": 123,
        "pytest_collected": 456,
        "pytest_passed": 456,
        "pytest_warnings": warnings,
        "coverage_total_statements": 7890,
        "coverage_missed_statements": 321,
        "coverage_percent": 96,
    }


def _request(
    package_id: str, *, qg_summary: dict[str, int | bool] | None
) -> dict[str, object]:
    request: dict[str, object] = {
        "pr_number": 465,
        "package_id": package_id,
        "expected_base": "a" * 40,
        "expected_head": "b" * 40,
        "expected_synthetic": "c" * 40,
        "review_mode": "expert",
        "prompt_path": "prompts/probe.md",
    }
    if qg_summary is not None:
        request["qg_summary"] = qg_summary
    return request


def _group(command: str, lines: list[str]) -> str:
    rendered = [
        f"2026-08-29T00:00:00Z ##[group]Run {command}",
        f"2026-08-29T00:00:00Z [36;1m{command}[0m",
        "2026-08-29T00:00:00Z shell: /usr/bin/bash -e {0}",
        "2026-08-29T00:00:00Z ##[endgroup]",
    ]
    rendered.extend(f"2026-08-29T00:00:01Z {line}" for line in lines)
    return "\n".join(rendered)


def _log(
    summary: dict[str, int | bool],
    *,
    omit_zero_warnings: bool = False,
    mypy_count: int | None = None,
    bind_mypy_to_wrong_command: bool = False,
    checkout_synthetic: str | None = None,
) -> str:
    actual_mypy = (
        int(summary["mypy_source_files"]) if mypy_count is None else mypy_count
    )
    mypy_line = f"Success: no issues found in {actual_mypy} source files"
    ruff_lines = ["All checks passed!"]
    mypy_lines = [mypy_line]
    if bind_mypy_to_wrong_command:
        ruff_lines.append(mypy_line)
        mypy_lines = ["mypy completed without its authoritative summary"]

    warnings = int(summary["pytest_warnings"])
    if warnings == 0 and omit_zero_warnings:
        pytest_result = f"{summary['pytest_passed']} passed in 12.34s"
    else:
        pytest_result = (
            f"{summary['pytest_passed']} passed, {warnings} warnings in 12.34s"
        )
    return "\n".join(
        (
            "\n".join(
                (
                    "2026-08-29T00:00:00Z [command]/usr/bin/git log -1 --format=%H",
                    "2026-08-29T00:00:01Z "
                    + (checkout_synthetic or os.environ["EXPECTED_SYNTHETIC"]),
                )
            ),
            _group("ruff check .", ruff_lines),
            _group("mypy src tests", mypy_lines),
            _group(
                "pytest --cov=src/qore --cov-report=term-missing",
                [
                    f"collected {summary['pytest_collected']} items",
                    (
                        f"TOTAL {summary['coverage_total_statements']} "
                        f"{summary['coverage_missed_statements']} "
                        f"{summary['coverage_percent']}%"
                    ),
                    pytest_result,
                ],
            ),
        )
    )


def _live_actions_fixture(*, timestamp: str, synthetic: str) -> str:
    """Condensed shape of authoritative jobs 99120615940 / 99149252535."""
    return "\n".join(
        (
            f"{timestamp}.0000000Z ##[endgroup]",
            f"{timestamp}.0000001Z [command]/usr/bin/git log -1 --format=%H",
            f"{timestamp}.0000002Z {synthetic}",
            f"{timestamp}.0000003Z ##[group]Run ruff check .",
            f"{timestamp}.0000004Z \x1b[36;1mruff check .\x1b[0m",
            f"{timestamp}.0000005Z shell: /usr/bin/bash -e {{0}}",
            f"{timestamp}.0000006Z ##[endgroup]",
            f"{timestamp}.0000007Z All checks passed!",
            f"{timestamp}.0000008Z ##[group]Run mypy src tests",
            f"{timestamp}.0000009Z \x1b[36;1mmypy src tests\x1b[0m",
            f"{timestamp}.0000010Z shell: /usr/bin/bash -e {{0}}",
            f"{timestamp}.0000011Z ##[endgroup]",
            f"{timestamp}.0000012Z Success: no issues found in 740 source files",
            (
                f"{timestamp}.0000013Z ##[group]Run "
                "pytest --cov=src/qore --cov-report=term-missing"
            ),
            (
                f"{timestamp}.0000014Z \x1b[36;1m"
                "pytest --cov=src/qore --cov-report=term-missing\x1b[0m"
            ),
            f"{timestamp}.0000015Z shell: /usr/bin/bash -e {{0}}",
            f"{timestamp}.0000016Z ##[endgroup]",
            f"{timestamp}.0000017Z collected 4862 items",
            f"{timestamp}.0000018Z TOTAL 47568 6234 87%",
            f"{timestamp}.0000019Z 4862 passed, 7 warnings in 627.83s",
            f"{timestamp}.0000020Z ##[group]Run echo post-quality",
            # This decoy must be outside the pytest command window.
            f"{timestamp}.0000021Z 9999 passed, 0 warnings in 0.01s",
            f"{timestamp}.0000022Z ##[endgroup]",
        )
    )


def _assert_workflow_preflight_and_publication() -> None:
    manual = (
        REPOSITORY_ROOT / ".github/workflows/deepseek-qore-review.yml"
    ).read_text(encoding="utf-8")
    auto = (
        REPOSITORY_ROOT / ".github/workflows/deepseek-auto-dispatch.yml"
    ).read_text(encoding="utf-8")
    assert "scripts/qg_package_contract.py workflow" in manual
    assert "steps.package-contract.outputs.qg_summary" in manual
    assert (
        "if: ${{ steps.package-contract.outputs.publish_allowed == 'true' }}"
        in manual
    )
    assert "if: ${{ inputs.benchmark_only == false }}" not in manual
    assert "scripts/qg_package_contract.py" in auto


def _write_prompt(path: Path, summary: dict[str, int | bool] | None) -> None:
    text = "# Free exact-QG probe\n"
    if summary is not None:
        text += (
            "<!-- QORE-EXACT-QG "
            + json.dumps(summary, sort_keys=True, separators=(",", ":"))
            + " -->\n"
        )
    path.write_text(text, encoding="utf-8")


def _configure_contract(path: Path, summary: dict[str, int | bool]) -> None:
    _write_prompt(path, summary)
    os.environ["PROMPT_PATH"] = str(path)
    os.environ["EXPECTED_QG_SUMMARY_JSON"] = json.dumps(
        summary, sort_keys=True, separators=(",", ":")
    )


def _install_fake_github(
    summary: dict[str, int | bool],
    log: str,
    *,
    job_head: str | None = None,
    run_head: str | None = None,
    job_run_id: int | None = None,
) -> tuple[Callable[[str], dict[str, object]], Callable[[str], str]]:
    head = os.environ["EXPECTED_HEAD"]

    def fake_json(url: str) -> dict[str, object]:
        if "/actions/runs/" in url:
            return {
                "id": summary["run_id"],
                "status": "completed",
                "conclusion": "success",
                "head_sha": run_head or head,
                "html_url": "https://example.invalid/run",
            }
        if "/actions/jobs/" in url:
            return {
                "id": summary["job_id"],
                "run_id": job_run_id or summary["run_id"],
                "name": "quality",
                "status": "completed",
                "conclusion": "success",
                "head_sha": job_head or head,
                "html_url": "https://example.invalid/job",
            }
        raise AssertionError(f"unexpected fake GitHub JSON URL: {url}")

    def fake_text(url: str) -> str:
        if not url.endswith(f"/actions/jobs/{summary['job_id']}/logs"):
            raise AssertionError(f"unexpected fake GitHub text URL: {url}")
        return log

    return fake_json, fake_text


def _with_fake_github(
    summary: dict[str, int | bool],
    log: str,
    callback: Callable[[], object],
    **kwargs: object,
) -> object:
    original_json = v19._github_json
    original_text = v19._github_text
    fake_json, fake_text = _install_fake_github(summary, log, **kwargs)
    v19._github_json = fake_json
    v19._github_text = fake_text
    try:
        return callback()
    finally:
        v19._github_json = original_json
        v19._github_text = original_text


def _expect_failure(label: str, fragment: str, callback: Callable[[], object]) -> None:
    try:
        callback()
    except RuntimeError as exc:
        if fragment not in str(exc):
            raise AssertionError(
                f"{label}: expected error containing {fragment!r}, got {exc!r}"
            ) from exc
    else:
        raise AssertionError(f"{label}: expected RuntimeError")


def _valid_freeze_payloads() -> tuple[
    dict[str, object], dict[str, object], dict[str, object], dict[str, int | str]
]:
    base = "a" * 40
    head = "b" * 40
    synthetic = "c" * 40
    tree = "d" * 40
    expected: dict[str, int | str] = {
        "pr_number": 465,
        "base": base,
        "head": head,
        "synthetic": synthetic,
    }
    pr: dict[str, object] = {
        "number": 465,
        "state": "open",
        "merged": False,
        "base": {"sha": base},
        "head": {"sha": head},
        "merge_commit_sha": synthetic,
    }
    synthetic_commit: dict[str, object] = {
        "sha": synthetic,
        "parents": [{"sha": base}, {"sha": head}],
        "tree": {"sha": tree},
    }
    head_commit: dict[str, object] = {"sha": head, "tree": {"sha": tree}}
    return pr, synthetic_commit, head_commit, expected


def main() -> int:
    _assert_workflow_preflight_and_publication()
    valid = _summary()
    assert v19.qg_contract.validate_dispatch_request(
        _request("CANONICAL-PROBE", qg_summary=valid),
        benchmark_only=False,
        source="canonical probe",
    ) == valid
    assert v19.qg_contract.validate_dispatch_request(
        _request("BENCHMARK-COMPACT-PROBE", qg_summary=None),
        benchmark_only=True,
        source="benchmark probe",
    ) == {}
    assert v19.qg_contract.validate_dispatch_request(
        _request("BENCHMARK-OTHER-PROBE", qg_summary=None),
        benchmark_only=True,
        source="benchmark probe",
    ) == {}
    assert v19.qg_contract.validate_workflow_contract(
        package_id="CANONICAL-PROBE",
        benchmark_only=False,
        raw_summary=json.dumps(valid),
    ) == {
        "benchmark_only": False,
        "publish_allowed": True,
        "qg_summary": valid,
    }
    assert v19.qg_contract.validate_workflow_contract(
        package_id="BENCHMARK-PROBE",
        benchmark_only=True,
        raw_summary="{}",
    ) == {
        "benchmark_only": True,
        "publish_allowed": False,
        "qg_summary": {},
    }
    _expect_failure(
        "canonical missing QG",
        "must be a JSON object",
        lambda: v19.qg_contract.validate_dispatch_request(
            _request("CANONICAL-PROBE", qg_summary=None),
            benchmark_only=False,
            source="canonical probe",
        ),
    )
    _expect_failure(
        "benchmark carrying canonical QG",
        "must not declare canonical qg_summary",
        lambda: v19.qg_contract.validate_dispatch_request(
            _request("BENCHMARK-COMPACT-PROBE", qg_summary=valid),
            benchmark_only=True,
            source="benchmark probe",
        ),
    )
    _expect_failure(
        "canonical benchmark-prefix laundering",
        "canonical review forbids",
        lambda: v19.qg_contract.validate_dispatch_request(
            _request("BENCHMARK-COMPACT-PROBE", qg_summary=valid),
            benchmark_only=False,
            source="canonical probe",
        ),
    )
    _expect_failure(
        "benchmark flag laundering",
        "requires BENCHMARK-",
        lambda: v19.qg_contract.validate_dispatch_request(
            _request("CANONICAL-PROBE", qg_summary=None),
            benchmark_only=True,
            source="benchmark probe",
        ),
    )
    malformed = {**valid, "unexpected": 1}
    _expect_failure(
        "canonical malformed QG",
        "extra=['unexpected']",
        lambda: v19.qg_contract.validate_dispatch_request(
            _request("CANONICAL-PROBE", qg_summary=malformed),
            benchmark_only=False,
            source="canonical probe",
        ),
    )
    _expect_failure(
        "manual canonical missing QG",
        "invalid keys",
        lambda: v19.qg_contract.validate_workflow_contract(
            package_id="CANONICAL-PROBE",
            benchmark_only=False,
            raw_summary="{}",
        ),
    )
    _expect_failure(
        "manual benchmark publication laundering",
        "canonical review forbids",
        lambda: v19.qg_contract.validate_workflow_contract(
            package_id="BENCHMARK-PROBE",
            benchmark_only=False,
            raw_summary=json.dumps(valid),
        ),
    )
    _expect_failure(
        "manual canonical benchmark-flag laundering",
        "requires BENCHMARK-",
        lambda: v19.qg_contract.validate_workflow_contract(
            package_id="CANONICAL-PROBE",
            benchmark_only=True,
            raw_summary="{}",
        ),
    )

    live_expected = {
        "ruff_passed": True,
        "mypy_source_files": 740,
        "pytest_collected": 4862,
        "pytest_passed": 4862,
        "pytest_warnings": 7,
        "coverage_total_statements": 47568,
        "coverage_missed_statements": 6234,
        "coverage_percent": 87,
    }
    for job_id, timestamp, synthetic in (
        (
            99120615940,
            "2026-08-29T15:24:31",
            "871def531b0f1222e6a1e61252af700f4ed204e3",
        ),
        (
            99149252535,
            "2026-08-29T19:29:03",
            "5a158ef0fb2e21db95f2be0685373780bf1ab197",
        ),
    ):
        fixture = _live_actions_fixture(timestamp=timestamp, synthetic=synthetic)
        assert v19._parse_qg_log(fixture) == live_expected, job_id
        assert v19._validate_checkout_synthetic(fixture, synthetic) == synthetic

    with tempfile.TemporaryDirectory(prefix="qore-exact-qg-probe-") as directory:
        prompt = Path(directory) / "prompt.md"
        _configure_contract(prompt, valid)
        evidence = _with_fake_github(
            valid,
            _log(valid),
            v19._exact_qore_ci_evidence,
        )
        assert "package/prompt/live GitHub equality verified" in str(evidence)

        zero_warning = _summary(warnings=0)
        _configure_contract(prompt, zero_warning)
        _with_fake_github(
            zero_warning,
            _log(zero_warning, omit_zero_warnings=True),
            v19._exact_qore_ci_evidence,
        )

        _configure_contract(prompt, valid)
        _expect_failure(
            "changed counts",
            "observed summary does not equal",
            lambda: _with_fake_github(
                valid,
                _log(valid, mypy_count=int(valid["mypy_source_files"]) + 1),
                v19._exact_qore_ci_evidence,
            ),
        )
        _expect_failure(
            "misbound Mypy output",
            "Mypy summary is missing from its command group",
            lambda: _with_fake_github(
                valid,
                _log(valid, bind_mypy_to_wrong_command=True),
                v19._exact_qore_ci_evidence,
            ),
        )
        _expect_failure(
            "stale job HEAD metadata",
            "job head_sha does not equal EXPECTED_HEAD",
            lambda: _with_fake_github(
                valid,
                _log(valid),
                v19._exact_qore_ci_evidence,
                job_head="e" * 40,
            ),
        )
        _expect_failure(
            "stale run HEAD metadata",
            "run head_sha does not equal EXPECTED_HEAD",
            lambda: _with_fake_github(
                valid,
                _log(valid),
                v19._exact_qore_ci_evidence,
                run_head="e" * 40,
            ),
        )
        _expect_failure(
            "stale checkout synthetic",
            "checkout proof does not equal EXPECTED_SYNTHETIC",
            lambda: _with_fake_github(
                valid,
                _log(valid, checkout_synthetic="e" * 40),
                v19._exact_qore_ci_evidence,
            ),
        )
        _expect_failure(
            "stale job/run binding",
            "job run_id mismatch",
            lambda: _with_fake_github(
                valid,
                _log(valid),
                v19._exact_qore_ci_evidence,
                job_run_id=int(valid["run_id"]) + 1,
            ),
        )

        os.environ["EXPECTED_QG_SUMMARY_JSON"] = "{malformed"
        _expect_failure(
            "malformed package summary",
            "is not valid JSON",
            v19._load_exact_qg_contract,
        )

        _configure_contract(prompt, valid)
        _write_prompt(prompt, None)
        _expect_failure(
            "missing prompt summary",
            "exactly one",
            v19._load_exact_qg_contract,
        )

        _configure_contract(prompt, valid)
        prompt_drift = {**valid, "mypy_source_files": 124}
        _write_prompt(prompt, prompt_drift)
        _expect_failure(
            "prompt/request summary drift",
            "does not equal package/request summary",
            v19._load_exact_qg_contract,
        )

        extra = {**valid, "unexpected": 1}
        os.environ["EXPECTED_QG_SUMMARY_JSON"] = json.dumps(extra)
        _write_prompt(prompt, extra)
        _expect_failure(
            "extra summary key",
            "extra=['unexpected']",
            v19._load_exact_qg_contract,
        )

        missing = dict(valid)
        del missing["pytest_warnings"]
        os.environ["EXPECTED_QG_SUMMARY_JSON"] = json.dumps(missing)
        _write_prompt(prompt, missing)
        _expect_failure(
            "missing summary key",
            "missing=['pytest_warnings']",
            v19._load_exact_qg_contract,
        )

    pr, synthetic_commit, head_commit, expected = _valid_freeze_payloads()
    freeze = v19._validate_full_pr_freeze_payloads(
        pr, synthetic_commit, head_commit, expected
    )
    assert freeze["synthetic_parents"] == [expected["base"], expected["head"]]

    stale_pr = copy.deepcopy(pr)
    stale_pr["merge_commit_sha"] = "e" * 40
    _expect_failure(
        "stale PR synthetic",
        "live PR synthetic mismatch",
        lambda: v19._validate_full_pr_freeze_payloads(
            stale_pr, synthetic_commit, head_commit, expected
        ),
    )

    reversed_parents = copy.deepcopy(synthetic_commit)
    reversed_parents["parents"] = [
        {"sha": expected["head"]},
        {"sha": expected["base"]},
    ]
    _expect_failure(
        "reversed synthetic parents",
        "BASE then HEAD",
        lambda: v19._validate_full_pr_freeze_payloads(
            pr, reversed_parents, head_commit, expected
        ),
    )

    wrong_tree = copy.deepcopy(synthetic_commit)
    wrong_tree["tree"] = {"sha": "f" * 40}
    _expect_failure(
        "synthetic tree mismatch",
        "synthetic tree does not equal HEAD tree",
        lambda: v19._validate_full_pr_freeze_payloads(
            pr, wrong_tree, head_commit, expected
        ),
    )

    original_main = v19.v7.main
    original_revalidate = v19._revalidate_full_pr_freeze
    calls: list[str] = []
    v19.v7.main = lambda: calls.append("review") or 0
    v19._revalidate_full_pr_freeze = lambda: calls.append("freeze") or "{}"
    try:
        assert v19.main() == 0
        assert calls == ["review", "freeze"]
        calls.clear()
        v19.v7.main = lambda: calls.append("review-failed") or 9
        assert v19.main() == 9
        assert calls == ["review-failed"]
    finally:
        v19.v7.main = original_main
        v19._revalidate_full_pr_freeze = original_revalidate

    print("EXACT_QG_BINDING_AND_FULL_FREEZE_OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

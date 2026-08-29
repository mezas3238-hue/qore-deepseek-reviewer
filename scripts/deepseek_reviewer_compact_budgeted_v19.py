#!/usr/bin/env python3
from __future__ import annotations

import json
import os
import re
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any

import deepseek_reviewer_compact_budgeted_v18 as v18

v7 = v18.v7
compact = v18.compact

_base_suite = v7._extended_r62b_probe_suite
_CI_BINDING_RE = re.compile(
    r"Required exact-head QORE CI is run `(?P<run_id>\d+)` / job `(?P<job_id>\d+)`"
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
        return json.loads(response.read().decode("utf-8"))


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


def _exact_qore_ci_evidence() -> str:
    prompt_path = Path(os.environ["PROMPT_PATH"])
    prompt = prompt_path.read_text(encoding="utf-8")
    match = _CI_BINDING_RE.search(prompt)
    if match is None:
        raise RuntimeError("prompt is missing the exact QORE CI run/job binding")

    run_id = int(match.group("run_id"))
    job_id = int(match.group("job_id"))
    expected_synthetic = os.environ["EXPECTED_SYNTHETIC"]

    job = _github_json(
        f"https://api.github.com/repos/mezas3238-hue/qore-core/actions/jobs/{job_id}"
    )
    if int(job.get("id", -1)) != job_id:
        raise RuntimeError("QORE CI job id mismatch")
    if int(job.get("run_id", -1)) != run_id:
        raise RuntimeError("QORE CI run id mismatch")
    if job.get("status") != "completed" or job.get("conclusion") != "success":
        raise RuntimeError("QORE CI job is not completed SUCCESS")
    if job.get("name") != "quality":
        raise RuntimeError("QORE CI job is not the required quality job")

    log = _github_text(
        f"https://api.github.com/repos/mezas3238-hue/qore-core/actions/jobs/{job_id}/logs"
    )
    mandatory_fragments = (
        expected_synthetic,
        "All checks passed!",
        "Success: no issues found in 740 source files",
        "collected 4858 items",
        "TOTAL",
        "87%",
        "4858 passed, 7 warnings",
    )
    missing = [fragment for fragment in mandatory_fragments if fragment not in log]
    if missing:
        raise RuntimeError(f"QORE CI raw log is missing mandatory evidence: {missing!r}")

    selected: list[str] = []
    needles = (
        expected_synthetic,
        "Run ruff check .",
        "All checks passed!",
        "Run mypy src tests",
        "Success: no issues found in 740 source files",
        "Run pytest --cov=src/qore --cov-report=term-missing",
        "collected 4858 items",
        "TOTAL",
        "4858 passed, 7 warnings",
    )
    for line in log.splitlines():
        if any(needle in line for needle in needles):
            selected.append(line)

    metadata = {
        "id": job.get("id"),
        "run_id": job.get("run_id"),
        "name": job.get("name"),
        "status": job.get("status"),
        "conclusion": job.get("conclusion"),
        "head_sha": job.get("head_sha"),
        "html_url": job.get("html_url"),
    }
    evidence = (
        "QORE CI JOB METADATA (fetched live from GitHub Actions API):\n"
        + json.dumps(metadata, indent=2, sort_keys=True)
        + "\nQORE CI RAW LOG LINES (fetched live from the bound job log):\n"
        + "\n".join(selected)
    )
    print("QORE exact CI evidence attached to mandatory reviewer evidence.\n" + evidence)
    return compact.compact_clip(evidence, 40000)


def _extended_suite_with_exact_qore_ci() -> str:
    return _base_suite() + "\n\nEXACT QORE CI AUTHORITATIVE EVIDENCE:\n" + _exact_qore_ci_evidence()


v7._extended_r62b_probe_suite = _extended_suite_with_exact_qore_ci


if __name__ == "__main__":
    raise SystemExit(v7.main())

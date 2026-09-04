#!/usr/bin/env python3
from harness_resilient_runner import _candidate_complete, _semantic_candidate_ready


def main() -> None:
    exact = "CANDIDATE_READY_FOR_EXTERNAL_QG\n## RESUME STATE\nCOMPLETE\n"
    semantic = "## Final verdict: CANDIDATE READY — EXPERT R3 ROOT FAMILIES EXHAUSTED\n"
    assert _candidate_complete(exact, all_complete=True, rc=0)
    assert _semantic_candidate_ready(semantic)
    assert _candidate_complete(semantic, all_complete=True, rc=0)
    assert not _candidate_complete(semantic, all_complete=False, rc=0)
    assert not _candidate_complete(semantic, all_complete=True, rc=124)
    assert not _semantic_candidate_ready("candidate ready after review")
    assert not _semantic_candidate_ready("## Final verdict: CANDIDATE READY\n")
    assert not _candidate_complete("## Final verdict: CANDIDATE READY — but rc failed\n", all_complete=True, rc=70)
    print("Harness resilient terminal fallback contract: PASS")


if __name__ == "__main__":
    main()

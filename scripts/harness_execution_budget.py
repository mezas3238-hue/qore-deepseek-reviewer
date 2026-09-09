#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json


class BudgetError(ValueError):
    pass


def validate_budget(
    *,
    job_timeout_minutes: int,
    runner_wall_seconds: int,
    engineer_sessions: int,
    audit_sessions: int,
    session_timeout_seconds: int,
    post_runner_reserve_seconds: int,
    runner_grace_seconds: int,
) -> dict[str, int]:
    values = {
        "job_timeout_minutes": job_timeout_minutes,
        "runner_wall_seconds": runner_wall_seconds,
        "engineer_sessions": engineer_sessions,
        "audit_sessions": audit_sessions,
        "session_timeout_seconds": session_timeout_seconds,
        "post_runner_reserve_seconds": post_runner_reserve_seconds,
        "runner_grace_seconds": runner_grace_seconds,
    }
    if any(type(value) is not int or value <= 0 for value in values.values()):
        raise BudgetError("all budget values must be positive integers")
    if engineer_sessions < 1 or audit_sessions < 1:
        raise BudgetError("Engineer and Internal Expert each require a non-zero reserved session budget")

    job_seconds = job_timeout_minutes * 60
    theoretical_role_seconds = (engineer_sessions + audit_sessions) * session_timeout_seconds
    usable_runner_seconds = runner_wall_seconds - runner_grace_seconds

    if usable_runner_seconds < 60:
        raise BudgetError("runner wall budget leaves less than one minute after grace")
    if theoretical_role_seconds > usable_runner_seconds:
        raise BudgetError(
            "theoretical role-session budget exceeds runner wall budget after grace: "
            f"roles={theoretical_role_seconds}s usable_runner={usable_runner_seconds}s"
        )
    if runner_wall_seconds + post_runner_reserve_seconds > job_seconds:
        raise BudgetError(
            "runner wall budget plus post-runner reserve exceeds GitHub job timeout: "
            f"runner={runner_wall_seconds}s reserve={post_runner_reserve_seconds}s job={job_seconds}s"
        )

    return {
        **values,
        "job_timeout_seconds": job_seconds,
        "theoretical_role_seconds": theoretical_role_seconds,
        "usable_runner_seconds": usable_runner_seconds,
        "total_reserved_seconds": runner_wall_seconds + post_runner_reserve_seconds,
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--job-timeout-minutes", type=int, required=True)
    parser.add_argument("--runner-wall-seconds", type=int, required=True)
    parser.add_argument("--engineer-sessions", type=int, required=True)
    parser.add_argument("--audit-sessions", type=int, required=True)
    parser.add_argument("--session-timeout-seconds", type=int, required=True)
    parser.add_argument("--post-runner-reserve-seconds", type=int, required=True)
    parser.add_argument("--runner-grace-seconds", type=int, required=True)
    args = parser.parse_args()
    try:
        result = validate_budget(
            job_timeout_minutes=args.job_timeout_minutes,
            runner_wall_seconds=args.runner_wall_seconds,
            engineer_sessions=args.engineer_sessions,
            audit_sessions=args.audit_sessions,
            session_timeout_seconds=args.session_timeout_seconds,
            post_runner_reserve_seconds=args.post_runner_reserve_seconds,
            runner_grace_seconds=args.runner_grace_seconds,
        )
    except BudgetError as exc:
        parser.error(str(exc))
    print(json.dumps(result, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

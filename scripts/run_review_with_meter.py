#!/usr/bin/env python3
from __future__ import annotations

import json
import os
import subprocess
import sys
import urllib.error
import urllib.request
from decimal import Decimal, InvalidOperation
from pathlib import Path
from typing import Any

API_KEY = os.environ["DEEPSEEK_API_KEY"]
BALANCE_URL = "https://api.deepseek.com/user/balance"
_STABLE_REVIEWER = Path(__file__).with_name("deepseek_reviewer_v2_1_1_entrypoint.py")
_COMPACT_CANDIDATE_REVIEWER = Path(__file__).with_name(
    "deepseek_reviewer_v2_1_2_candidate_entrypoint.py"
)
_COMPACT_BUDGETED_REVIEWER = Path(__file__).with_name(
    "deepseek_reviewer_compact_budgeted_v18.py"
)
_PACKAGE_ID = os.environ.get("PACKAGE_ID", "")
_REVIEWER_PROFILE = os.environ.get("DEEPSEEK_REVIEWER_PROFILE", "compact-budgeted")

if _PACKAGE_ID.startswith("BENCHMARK-COMPACT-"):
    REVIEWER = _COMPACT_CANDIDATE_REVIEWER
elif _REVIEWER_PROFILE == "compact-budgeted":
    REVIEWER = _COMPACT_BUDGETED_REVIEWER
elif _REVIEWER_PROFILE == "stable":
    REVIEWER = _STABLE_REVIEWER
else:
    raise RuntimeError(
        "unsupported DEEPSEEK_REVIEWER_PROFILE; expected 'compact-budgeted' or 'stable'"
    )


def fetch_balance() -> dict[str, Any]:
    req = urllib.request.Request(
        BALANCE_URL,
        headers={"Authorization": f"Bearer {API_KEY}"},
        method="GET",
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        return {"error": f"HTTP {exc.code}: {detail}"}
    except Exception as exc:  # noqa: BLE001
        return {"error": f"{type(exc).__name__}: {exc}"}


def balances_by_currency(payload: dict[str, Any]) -> dict[str, Decimal]:
    result: dict[str, Decimal] = {}
    for item in payload.get("balance_infos") or []:
        currency = str(item.get("currency") or "").upper()
        raw = item.get("total_balance")
        if not currency or raw is None:
            continue
        try:
            result[currency] = Decimal(str(raw))
        except InvalidOperation:
            continue
    return result


def fmt_money(value: Decimal) -> str:
    return f"{value:.6f}".rstrip("0").rstrip(".") or "0"


def usage_log_path() -> Path:
    configured = os.environ.get("DEEPSEEK_USAGE_LOG")
    if configured:
        return Path(configured).resolve()
    workspace = Path(os.environ.get("GITHUB_WORKSPACE", ".")).resolve()
    return workspace / "deepseek-usage.jsonl"


def aggregate_token_usage() -> dict[str, int]:
    totals = {
        "api_calls": 0,
        "prompt_tokens": 0,
        "prompt_cache_hit_tokens": 0,
        "prompt_cache_miss_tokens": 0,
        "completion_tokens": 0,
        "reasoning_tokens": 0,
    }
    path = usage_log_path()
    if not path.is_file():
        return totals

    for raw_line in path.read_text(encoding="utf-8").splitlines():
        if not raw_line.strip():
            continue
        row = json.loads(raw_line)
        totals["api_calls"] += 1
        for key in (
            "prompt_tokens",
            "prompt_cache_hit_tokens",
            "prompt_cache_miss_tokens",
            "completion_tokens",
            "reasoning_tokens",
        ):
            value = row.get(key, 0)
            totals[key] += int(value) if isinstance(value, (int, float)) else 0
    return totals


def spent_by_currency(
    before_payload: dict[str, Any],
    after_payload: dict[str, Any],
) -> dict[str, str]:
    before = balances_by_currency(before_payload)
    after = balances_by_currency(after_payload)
    result: dict[str, str] = {}
    for currency in sorted(set(before) & set(after)):
        result[currency] = fmt_money(before[currency] - after[currency])
    return result


def render_balance(payload: dict[str, Any]) -> str:
    if "error" in payload:
        return f"- balance query unavailable: {payload['error']}"
    infos = payload.get("balance_infos") or []
    if not infos:
        return "- balance response had no balance_infos"
    lines = []
    for info in infos:
        currency = str(info.get("currency") or "UNKNOWN")
        total = info.get("total_balance")
        granted = info.get("granted_balance")
        topped = info.get("topped_up_balance")
        lines.append(
            f"- {currency}: total={total}, granted={granted}, topped_up={topped}"
        )
    return "\n".join(lines)


def main() -> int:
    before_payload = fetch_balance()
    print("DeepSeek balance captured before review.")
    print(f"Reviewer entrypoint: {REVIEWER.name}")

    completed = subprocess.run([sys.executable, str(REVIEWER)], check=False)

    after_payload = fetch_balance()
    print("DeepSeek balance captured after review.")
    print("## QORE DeepSeek usage")
    print()
    print(f"Reviewer exit code: `{completed.returncode}`")
    print()
    print("| Currency | Balance before | Balance after | Spent this run |")
    print("|---|---:|---:|---:|")
    before = balances_by_currency(before_payload)
    after = balances_by_currency(after_payload)
    spent = spent_by_currency(before_payload, after_payload)
    for currency in sorted(set(before) | set(after)):
        before_text = fmt_money(before[currency]) if currency in before else "n/a"
        after_text = fmt_money(after[currency]) if currency in after else "n/a"
        spent_text = spent.get(currency, "n/a")
        print(f"| {currency} | {before_text} | {after_text} | {spent_text} |")
    if not before and not after:
        print("| n/a | n/a | n/a | n/a |")
    print()
    print(
        "The balance delta is account-level actual billing observed around this run. "
        "Avoid concurrent DeepSeek API workloads if you want this delta to represent "
        "only this review."
    )

    usage = aggregate_token_usage()
    output_path = Path(os.environ.get("REVIEW_OUTPUT", "deepseek-review.md")).resolve()
    if output_path.is_file():
        existing = output_path.read_text(encoding="utf-8")
        usage_comment = (
            "\n\n<!-- QORE-DEEPSEEK-USAGE "
            + json.dumps(
                {
                    **usage,
                    "spent_by_currency": spent,
                },
                sort_keys=True,
                separators=(",", ":"),
            )
            + " -->\n"
        )
        output_path.write_text(existing.rstrip() + usage_comment, encoding="utf-8")
        print("DeepSeek token telemetry persisted with review output.")
    else:
        print("DeepSeek review output absent; usage not attached to a review file.")

    return completed.returncode


if __name__ == "__main__":
    raise SystemExit(main())

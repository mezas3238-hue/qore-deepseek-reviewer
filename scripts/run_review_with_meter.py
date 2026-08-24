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
REVIEWER = Path(__file__).with_name("deepseek_reviewer_v1_5_entrypoint.py")


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


def persist_usage_with_review(
    before_payload: dict[str, Any],
    after_payload: dict[str, Any],
    returncode: int,
) -> None:
    if returncode != 0:
        return
    output_raw = os.environ.get("REVIEW_OUTPUT")
    if not output_raw:
        return
    output = Path(output_raw).resolve()
    if not output.is_file():
        return

    telemetry = {
        **aggregate_token_usage(),
        "spent_by_currency": spent_by_currency(before_payload, after_payload),
    }
    marker = (
        "<!-- QORE-DEEPSEEK-USAGE "
        + json.dumps(telemetry, sort_keys=True, separators=(",", ":"))
        + " -->"
    )
    review = output.read_text(encoding="utf-8").rstrip()
    output.write_text(review + "\n\n" + marker + "\n", encoding="utf-8")
    print("DeepSeek token telemetry persisted with review output.")


def write_summary(
    before_payload: dict[str, Any],
    after_payload: dict[str, Any],
    returncode: int,
) -> None:
    before = balances_by_currency(before_payload)
    after = balances_by_currency(after_payload)
    currencies = sorted(set(before) | set(after))

    lines = [
        "## QORE DeepSeek usage",
        "",
        f"Reviewer exit code: `{returncode}`",
        "",
        "| Currency | Balance before | Balance after | Spent this run |",
        "|---|---:|---:|---:|",
    ]

    if currencies:
        for currency in currencies:
            b = before.get(currency)
            a = after.get(currency)
            spent = (b - a) if b is not None and a is not None else None
            lines.append(
                "| "
                + currency
                + " | "
                + (fmt_money(b) if b is not None else "n/a")
                + " | "
                + (fmt_money(a) if a is not None else "n/a")
                + " | "
                + (fmt_money(spent) if spent is not None else "n/a")
                + " |"
            )
    else:
        lines.append("| n/a | n/a | n/a | n/a |")

    if before_payload.get("error"):
        lines.extend(["", f"Balance-before error: `{before_payload['error']}`"])
    if after_payload.get("error"):
        lines.extend(["", f"Balance-after error: `{after_payload['error']}`"])

    lines.extend(
        [
            "",
            "The balance delta is account-level actual billing observed around this run. "
            "Avoid concurrent DeepSeek API workloads if you want this delta to represent only this review.",
        ]
    )

    text = "\n".join(lines) + "\n"
    print(text)

    summary_path = os.environ.get("GITHUB_STEP_SUMMARY")
    if summary_path:
        with open(summary_path, "a", encoding="utf-8") as handle:
            handle.write(text)


def main() -> int:
    before = fetch_balance()
    print("DeepSeek balance captured before review.")

    proc = subprocess.run(
        [sys.executable, str(REVIEWER)],
        env=os.environ.copy(),
        check=False,
    )

    after = fetch_balance()
    print("DeepSeek balance captured after review.")
    write_summary(before, after, proc.returncode)
    persist_usage_with_review(before, after, proc.returncode)
    return proc.returncode


if __name__ == "__main__":
    raise SystemExit(main())

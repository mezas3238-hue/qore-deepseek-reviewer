#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import os
import urllib.error
import urllib.request
from decimal import Decimal, InvalidOperation
from pathlib import Path
from typing import Any

BALANCE_URL = "https://api.deepseek.com/user/balance"
DEFAULT_MINIMUM_BALANCE_USD = Decimal("5.00")


def fetch_balance() -> dict[str, Any]:
    api_key = os.environ.get("DEEPSEEK_API_KEY", "")
    if not api_key:
        raise RuntimeError("DEEPSEEK_API_KEY is required")
    request = urllib.request.Request(
        BALANCE_URL,
        headers={"Authorization": f"Bearer {api_key}"},
        method="GET",
    )
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"DeepSeek balance HTTP {exc.code}: {detail}") from exc

    infos = payload.get("balance_infos") or []
    if not isinstance(infos, list) or not infos:
        raise RuntimeError("DeepSeek balance response contains no balance_infos")
    preferred = next((row for row in infos if row.get("currency") == "USD"), infos[0])
    return {
        "currency": str(preferred.get("currency") or "UNKNOWN"),
        "total_balance": str(preferred.get("total_balance")),
        "is_available": bool(payload.get("is_available")),
    }


def _parse_decimal(value: Any, *, field: str) -> Decimal:
    try:
        parsed = Decimal(str(value))
    except (InvalidOperation, ValueError) as exc:
        raise RuntimeError(f"DeepSeek balance field {field!r} is not a valid decimal") from exc
    if not parsed.is_finite():
        raise RuntimeError(f"DeepSeek balance field {field!r} must be finite")
    return parsed


def _require_minimum_balance(data: dict[str, Any], minimum_balance_usd: Decimal) -> None:
    if not minimum_balance_usd.is_finite() or minimum_balance_usd < 0:
        raise ValueError("minimum balance must be a finite non-negative decimal")
    if data.get("currency") != "USD":
        raise RuntimeError("DeepSeek reviewer balance preflight requires a USD balance")
    if data.get("is_available") is not True:
        raise RuntimeError("DeepSeek reviewer balance is unavailable; refusing API spend")
    total = _parse_decimal(data.get("total_balance"), field="total_balance")
    if total < minimum_balance_usd:
        raise RuntimeError(
            "DeepSeek reviewer balance is below the required preflight minimum "
            f"({minimum_balance_usd} USD); refusing API spend"
        )


def snapshot(
    path: Path,
    *,
    minimum_balance_usd: Decimal = DEFAULT_MINIMUM_BALANCE_USD,
) -> None:
    data = fetch_balance()
    _require_minimum_balance(data, minimum_balance_usd)
    # This private baseline lives only in RUNNER_TEMP and is never uploaded.
    path.write_text(json.dumps(data, sort_keys=True) + "\n", encoding="utf-8")
    os.chmod(path, 0o600)
    print("DeepSeek balance preflight passed and private baseline captured.")


def delta(before_path: Path, output_path: Path) -> None:
    before = json.loads(before_path.read_text(encoding="utf-8"))
    after = fetch_balance()
    if before.get("currency") != after.get("currency"):
        raise RuntimeError(
            f"balance currency changed: {before.get('currency')} -> {after.get('currency')}"
        )
    before_total = _parse_decimal(before.get("total_balance"), field="before.total_balance")
    after_total = _parse_decimal(after.get("total_balance"), field="after.total_balance")
    spent = before_total - after_total
    result = {
        "schema": "qore-deepseek-balance-delta-v1",
        "currency": before["currency"],
        "spent_delta": str(spent),
        "before_available": bool(before.get("is_available")),
        "after_available": bool(after.get("is_available")),
        "measurement": "DeepSeek GET /user/balance total-balance delta",
        "note": (
            "This delta is an account-level cross-check. Any concurrent API activity "
            "on the same DeepSeek account during the measurement window would also affect it."
        ),
    }
    output_path.write_text(json.dumps(result, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(f"DeepSeek balance delta captured: spent_delta={spent} {before['currency']}")


def main() -> int:
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest="command", required=True)
    snap = sub.add_parser("snapshot")
    snap.add_argument("path", type=Path)
    snap.add_argument(
        "--minimum-balance-usd",
        type=Decimal,
        default=DEFAULT_MINIMUM_BALANCE_USD,
    )
    diff = sub.add_parser("delta")
    diff.add_argument("before", type=Path)
    diff.add_argument("output", type=Path)
    args = parser.parse_args()

    if args.command == "snapshot":
        snapshot(
            args.path.resolve(),
            minimum_balance_usd=args.minimum_balance_usd,
        )
    else:
        delta(args.before.resolve(), args.output.resolve())
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

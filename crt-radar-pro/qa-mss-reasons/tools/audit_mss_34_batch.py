"""34-market offline MSS case ledger, anchored to QORE CRT 12X fixed IC slots.

Batch audits corroborate OHLC evidence only. No network, alerting, position
management or trading. A missing case is UNKNOWN, not a missing market MSS.
"""

from __future__ import annotations

import argparse
import hashlib
import json
from collections import Counter
from pathlib import Path
from typing import Any

from verify_mss_evidence_csv import Claim, EvidenceError, audit, load_m5_csv

MARKETS: tuple[str, ...] = (
    "IC:AUDJPY", "IC:GBPUSD", "IC:GBPJPY", "IC:XAUUSD", "IC:USTEC",
    "IC:US500", "IC:US30", "IC:BTCUSD", "IC:AUDUSD", "IC:USDCAD",
    "IC:USDJPY", "IC:EURUSD", "IC:USDCHF", "IC:NZDUSD", "IC:NZDJPY",
    "IC:NZDCHF", "IC:XAGUSD", "IC:AUDCAD", "IC:AUDCHF", "IC:AUDNZD",
    "IC:CADCHF", "IC:CADJPY", "IC:CHFJPY", "IC:EURAUD", "IC:EURCAD",
    "IC:EURCHF", "IC:EURGBP", "IC:EURJPY", "IC:EURNZD", "IC:GBPAUD",
    "IC:GBPCAD", "IC:GBPCHF", "IC:GBPNZD", "IC:NZDCAD",
)
BATCH_SCHEMA = "CRT_MSS_34_AUDIT_BATCH_R0"
RESULT_SCHEMA = "CRT_MSS_34_AUDIT_LEDGER_R0"
MAX_CASES = 512


def _safe_read(base: Path, rel: str) -> Path:
    if not isinstance(rel, str) or not rel or Path(rel).is_absolute():
        raise EvidenceError("evidence file must be a relative path")
    absolute = (base / rel).resolve()
    if not absolute.is_relative_to(base.resolve()) or not absolute.is_file():
        raise EvidenceError("evidence path not found or outside manifest directory")
    return absolute


def _sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def audit_batch(manifest_path: Path) -> dict[str, Any]:
    """Strict manifest and canonical 34-slot registry, fail closed on mismatches."""
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    if not isinstance(manifest, dict) or set(manifest) != {"schema", "cases"}:
        raise EvidenceError("batch manifest schema mismatch")
    if manifest["schema"] != BATCH_SCHEMA:
        raise EvidenceError("unsupported batch schema")
    cases = manifest["cases"]
    if not isinstance(cases, list) or len(cases) > MAX_CASES:
        raise EvidenceError("invalid case collection")
    base = manifest_path.resolve().parent
    results: list[dict[str, Any]] = []
    identities: set[tuple[int, str, str, str]] = set()
    for item in cases:
        if not isinstance(item, dict) or set(item) != {
            "slot", "claim_json", "m5_csv"
        }:
            raise EvidenceError("case must supply slot, claim_json, m5_csv")
        slot = item["slot"]
        if type(slot) is not int or not (1 <= slot <= 34):
            raise EvidenceError("slot must be an integer 1..34")
        claim_file = _safe_read(base, item["claim_json"])
        m5_file = _safe_read(base, item["m5_csv"])
        claim = Claim.parse(json.loads(claim_file.read_text(encoding="utf-8")))
        canonical = MARKETS[slot - 1]
        if claim.symbol != canonical:
            raise EvidenceError("claim symbol does not match source Pine slot")
        identity = (slot, claim.family, claim.timeframe, claim.sweep_close_at.isoformat())
        if identity in identities:
            raise EvidenceError("duplicated slot/family/timeframe/sweep event")
        identities.add(identity)
        case_report = audit(claim, load_m5_csv(m5_file, claim))
        case_report["slot"] = slot
        case_report["m5_csv_sha256"] = _sha256(m5_file)
        case_report["claim_json_sha256"] = _sha256(claim_file)
        results.append(case_report)
    results.sort(key=lambda r: (
        r["slot"], r["family"], r["timeframe"], r["first_cross_closed_at_utc"] or ""
    ))
    counts = Counter(str(r["status"]) for r in results)
    by_slot = Counter(int(r["slot"]) for r in results)
    registry_sha = hashlib.sha256("\n".join(MARKETS).encode("ascii")).hexdigest()
    return {
        "schema": RESULT_SCHEMA,
        "registry_slots": 34,
        "registry_sha256": registry_sha,
        "batch_manifest_sha256": _sha256(manifest_path),
        "market_coverage": [
            {
                "slot": index,
                "symbol": symbol,
                "submitted_cases": by_slot[index],
                "evidence_state": "SUBMITTED_UNVERIFIED" if by_slot[index]
                else "NO_CASE_SUPPLIED",
            }
            for index, symbol in enumerate(MARKETS, start=1)
        ],
        "market_cases_submitted": sum(1 for index in range(1, 35) if by_slot[index]),
        "market_cases_not_supplied": sum(1 for index in range(1, 35) if not by_slot[index]),
        "case_count": len(results),
        "status_counts": dict(sorted(counts.items())),
        "cases": results,
        "data_authenticity_verified": False,
        "pine_parity_certified": False,
        "all_seven_crt_families_certified": False,
        "operational_alert_authorized": False,
        "live_trading_authorized": False,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Offline 34-market MSS QA (NO LIVE)")
    parser.add_argument("--manifest", type=Path, required=True)
    parser.add_argument("--out-json", type=Path, required=True)
    args = parser.parse_args()
    report = audit_batch(args.manifest)
    args.out_json.write_text(json.dumps(report, sort_keys=True, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()

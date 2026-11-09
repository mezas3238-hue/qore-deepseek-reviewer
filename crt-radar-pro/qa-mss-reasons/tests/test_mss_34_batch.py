"""Whole 34-slot audit ledger and fail-closed evidence fixture tests."""

from __future__ import annotations

import csv
import json
import re
from pathlib import Path
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "tools"))
import audit_mss_34_batch as batch  # noqa: E402
from test_mss_ohlc_replay import claim, dataset  # noqa: E402

PINE = (
    ROOT / "crt-radar-pro/qa-mss-reasons/"
    "QORE_CRT_RADAR_34_CHART_V34_12X_MSS_NV_DIAGNOSTICO_QA_NO_LIVE.pine"
)


class AllMarketsBatchTests(unittest.TestCase):
    def setUp(self) -> None:
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.base = Path(self.tmp.name)
        self.manifest = self.base / "manifest.json"

    def write_manifest(self, cases: list[dict[str, object]]) -> None:
        self.manifest.write_text(
            json.dumps({"schema": batch.BATCH_SCHEMA, "cases": cases}),
            encoding="utf-8",
        )

    def sample(self, slot: int = 17) -> dict[str, object]:
        c = self.base / "claim.json"
        csvfile = self.base / "candles.csv"
        c.write_text(json.dumps(claim(timeframe="M5", pivot_open=55)), encoding="utf-8")
        with csvfile.open("w", encoding="utf-8", newline="") as stream:
            writer = csv.DictWriter(
                stream, fieldnames=(
                    "symbol", "feed_id", "open_time_utc", "open",
                    "high", "low", "close", "closed",
                )
            )
            writer.writeheader()
            writer.writerows(dataset())
        return {"slot": slot, "claim_json": c.name, "m5_csv": csvfile.name}

    def test_registry_equals_all_34_source_pine_symbol_slots(self) -> None:
        content = PINE.read_text(encoding="utf-8")
        found = re.findall(r'^s(\d{2})\s*=\s*"(IC:[A-Z0-9]+)"', content, flags=re.M)
        self.assertEqual(len(found), 34)
        self.assertEqual(
            [(int(slot), symbol) for slot, symbol in found],
            list(enumerate(batch.MARKETS, start=1)),
        )
        self.assertEqual(batch.MARKETS[7], "IC:BTCUSD")
        self.assertEqual(len(set(batch.MARKETS)), 34)

    def test_no_evidence_does_not_make_34_false_mss_negatives(self) -> None:
        self.write_manifest([])
        result = batch.audit_batch(self.manifest)
        self.assertEqual(result["registry_slots"], 34)
        self.assertEqual(result["market_cases_not_supplied"], 34)
        self.assertEqual(result["market_cases_submitted"], 0)
        self.assertEqual(result["case_count"], 0)
        self.assertEqual(result["status_counts"], {})
        self.assertTrue(all(
            x["evidence_state"] == "NO_CASE_SUPPLIED"
            for x in result["market_coverage"]
        ))

    def test_xagusd_slot17_only_correlates_to_its_own_csv(self) -> None:
        self.write_manifest([self.sample(17)])
        out = batch.audit_batch(self.manifest)
        self.assertEqual(out["case_count"], 1)
        self.assertEqual(out["market_cases_submitted"], 1)
        self.assertEqual(out["market_cases_not_supplied"], 33)
        self.assertEqual(out["status_counts"], {"RAW_CROSS": 1})
        self.assertEqual(out["cases"][0]["slot"], 17)
        self.assertEqual(out["market_coverage"][16]["symbol"], "IC:XAGUSD")
        self.assertEqual(out["market_coverage"][7]["evidence_state"], "NO_CASE_SUPPLIED")
        self.assertFalse(out["operational_alert_authorized"])
        self.assertFalse(out["all_seven_crt_families_certified"])
        self.assertEqual(len(out["cases"][0]["m5_csv_sha256"]), 64)

    def test_wrong_market_slot_is_blocked_not_mislabeled(self) -> None:
        self.write_manifest([self.sample(8)])
        with self.assertRaisesRegex(batch.EvidenceError, "slot"):
            batch.audit_batch(self.manifest)

    def test_duplicate_same_event_not_double_counted(self) -> None:
        case = self.sample()
        self.write_manifest([case, case])
        with self.assertRaisesRegex(batch.EvidenceError, "duplicated"):
            batch.audit_batch(self.manifest)

    def test_rejects_traversal_and_absolute_evidence_paths(self) -> None:
        case = self.sample()
        for attempted in ("../outside.json", str(self.base / "claim.json")):
            unsafe = dict(case)
            unsafe["claim_json"] = attempted
            self.write_manifest([unsafe])
            with self.assertRaises(batch.EvidenceError):
                batch.audit_batch(self.manifest)

    def test_invalid_manifest_or_slot_zero_is_rejected(self) -> None:
        case = self.sample()
        for badslot in (0, 35, True, "17"):
            wrong = dict(case)
            wrong["slot"] = badslot
            self.write_manifest([wrong])
            with self.assertRaises(batch.EvidenceError):
                batch.audit_batch(self.manifest)
        self.manifest.write_text('{"schema":"OTHER","cases":[]}', encoding="utf-8")
        with self.assertRaises(batch.EvidenceError):
            batch.audit_batch(self.manifest)

    def test_all_34_report_entries_have_unique_stable_identity(self) -> None:
        self.write_manifest([self.sample()])
        first = batch.audit_batch(self.manifest)
        second = batch.audit_batch(self.manifest)
        self.assertEqual(first, second)
        self.assertEqual(
            [v["slot"] for v in first["market_coverage"]],
            list(range(1, 35)),
        )
        self.assertEqual(len(first["registry_sha256"]), 64)


if __name__ == "__main__":
    unittest.main(verbosity=2)

"""Exact-scoped QA diff test: V34.12X source must remain unchanged except MSS causes.

Static regression only: does not claim Pine compile, real feed parity or alerts.
"""
from __future__ import annotations

import hashlib
from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[3]
BASE = ROOT / "crt-radar-pro/qa-34-feed-memory-probes/QORE_CRT_RADAR_34_CHART_V34_12X_COLORES_PERSONALIZABLES_QA_NO_LIVE.pine"
CANDIDATE = ROOT / "crt-radar-pro/qa-mss-reasons/QORE_CRT_RADAR_34_CHART_V34_12X_MSS_NV_DIAGNOSTICO_QA_NO_LIVE.pine"
BASE_BLOB_SHA = "470214fea377b05e537a18c0ce8097986da86fac"

REPLACEMENTS = [
    (
        "var array<int> qaExtraPivot15AtBySlot = array.new_int(34, na)",
        "var array<int> qaExtraPivot15AtBySlot = array.new_int(34, na)\nvar array<int> qaExtraPivot5AtBySlot = array.new_int(34, na)",
    ),
    (
        "var array<int> qaExtraBreak15BySlot = array.new_int(34, na)",
        "var array<int> qaExtraBreak15BySlot = array.new_int(34, na)\nvar array<int> qaExtraBreak5BySlot = array.new_int(34, na)",
    ),
    (
        "array.set(qaExtraPivot15AtBySlot, i, available ? s.extraFamilyM15PivotAt : na)",
        "array.set(qaExtraPivot15AtBySlot, i, available ? s.extraFamilyM15PivotAt : na)\n        array.set(qaExtraPivot5AtBySlot, i, available ? s.extraFamilyM5PivotAt : na)",
    ),
    (
        "array.set(qaExtraBreak15BySlot, i, available ? s.extraFamilyM15At : na)",
        "array.set(qaExtraBreak15BySlot, i, available ? s.extraFamilyM15At : na)\n        array.set(qaExtraBreak5BySlot, i, available ? s.extraFamilyM5At : na)",
    ),
    (
        "f_monitorOwnMss(int slot) =>",
        "// M5/M15 QA: no atribuir a una familia MSS ajeno. Etiqueta la causa\n"
        "// de abstencion para poder depurar sin promover ninguna senal.\n"
        "f_qaMssMissingReason(bool feedOK, bool ownedFamily, bool ownC1Ready, int ownSweepAt, int ownPivotAt, int ownMssAt) =>\n"
        "    not feedOK ? \"SIN FEED\" : not ownedFamily ? \"SIN PRB\" : not ownC1Ready ? \"SIN C1\" : na(ownSweepAt) ? \"SIN SWP\" : na(ownPivotAt) or ownPivotAt >= ownSweepAt ? \"SIN PIV\" : na(ownMssAt) ? \"PEND MSS\" : \"NO VALID\"\n"
        "\n"
        "f_monitorOwnMss(int slot) =>",
    ),
    (
        '                        string m5Text = core ? (ownM5 ? "SI" : "NO") : qaCore ? (ownM5 ? "QA SI" : "QA --") : ownExtraM5 ? "QA SI" : otherQA ? "N/V" : "—"\n'
        '                        string m15Text = core ? (ownM15 ? "SI" : "NO") : qaCore ? (ownM15 ? "QA SI" : "QA --") : ownExtraM15 ? "QA SI" : otherQA ? "N/V" : "—"\n'
        '                        string dirText = core or qaCore or otherQA or true3c ? (dir > 0 ? "ALC" : dir < 0 ? "BAJ" : "N/V") : "—"',
        '                        // Una familia observada no implica MSS verificado: distingamos\n'
        '                        // falta de prueba, C1, barrida, pivote o cruce sin tocar flags.\n'
        '                        bool ownExtraFamily = extra and (not true3c or array.get(qaExtraKindBySlot,i) == "3C TRUE QA")\n'
        '                        int ownExtraSweep = array.get(qaExtraSweepBySlot,i)\n'
        '                        string m5MissingReason = f_qaMssMissingReason(feedOK, ownExtraFamily, c1Ready, ownExtraSweep, array.get(qaExtraPivot5AtBySlot,i), array.get(qaExtraBreak5BySlot,i))\n'
        '                        string m15MissingReason = f_qaMssMissingReason(feedOK, ownExtraFamily, c1Ready, ownExtraSweep, array.get(qaExtraPivot15AtBySlot,i), array.get(qaExtraBreak15BySlot,i))\n'
        '                        string m5Text = core ? (ownM5 ? "SI" : "NO") : qaCore ? (ownM5 ? "QA SI" : "QA --") : ownExtraM5 ? "QA SI" : otherQA ? m5MissingReason : "—"\n'
        '                        string m15Text = core ? (ownM15 ? "SI" : "NO") : qaCore ? (ownM15 ? "QA SI" : "QA --") : ownExtraM15 ? "QA SI" : otherQA ? m15MissingReason : "—"\n'
        '                        string dirText = core or qaCore or otherQA or true3c ? (dir > 0 ? "ALC" : dir < 0 ? "BAJ" : "SIN DIR") : "—"',
    ),
]


def blob_sha(content: bytes) -> str:
    return hashlib.sha1(b"blob " + str(len(content)).encode() + bytes([0]) + content).hexdigest()


class MissedMssDiagnosticTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.baseline_bytes = BASE.read_bytes()
        cls.baseline = cls.baseline_bytes.decode("utf-8")
        cls.candidate = CANDIDATE.read_text(encoding="utf-8")

    def test_baseline_pinned_to_real_v34_12x_source_blob(self) -> None:
        self.assertEqual(blob_sha(self.baseline_bytes), BASE_BLOB_SHA)

    def test_exact_intended_diff_and_no_other_changes(self) -> None:
        expected = self.baseline
        for old, new in REPLACEMENTS:
            self.assertEqual(expected.count(old), 1, "patch anchor ambiguous")
            expected = expected.replace(old, new)
        self.assertEqual(self.candidate, expected)

    def test_pairwise_slots_and_btc_rules_preserved(self) -> None:
        for snippet in (
            's08 = "IC:BTCUSD"',
            's05 = "IC:USTEC"',
            's06 = "IC:US500"',
            's07 = "IC:US30"',
            'bool chartIsIC = str.upper(syminfo.prefix) == "IC"',
            'bool isBTC = str.upper(syminfo.ticker) == "BTCUSD"',
            "f_monitorOwnMss(int slot) =>",
            "array.set(extraM5Flags, i, family5QA ? 1 : 0)",
            "array.set(extraM15Flags, i, family15QA ? 1 : 0)",
            'string[] scanSymbols = array.from(',
        ):
            self.assertIn(snippet, self.candidate)

    def test_status_describes_abstention_not_a_new_mss(self) -> None:
        for label in ("SIN PRB", "SIN FEED", "SIN C1", "SIN SWP", "SIN PIV", "PEND MSS", "NO VALID", "SIN DIR"):
            self.assertIn(f'"{label}"', self.candidate)
        self.assertIn('bool ownExtraFamily = extra and (not true3c', self.candidate)
        self.assertIn('otherQA ? m5MissingReason : "—"', self.candidate)
        self.assertIn('otherQA ? m15MissingReason : "—"', self.candidate)
        self.assertIn('ownExtraM5 ? "QA SI"', self.candidate)
        self.assertIn('ownExtraM15 ? "QA SI"', self.candidate)


if __name__ == "__main__":
    unittest.main()

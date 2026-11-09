"""Research-only model of the existing per-family MSS proof contract.

This is a deterministic independent adversarial oracle, NOT a Pine runtime,
TradingView compilation, historical IC Markets replay, or permission to trade.
Every expected guard also has a source-code anchor in the exact Pine QA copy.
"""

from __future__ import annotations

from dataclasses import dataclass, replace
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[3]
SOURCE = (
    ROOT / "crt-radar-pro/qa-mss-reasons/"
    "QORE_CRT_RADAR_34_CHART_V34_12X_MSS_NV_DIAGNOSTICO_QA_NO_LIVE.pine"
)
FAMILIES = ("3C TRUE QA", "INSIDE QA", "MULTI4 QA", "MULTI-N QA")
M5 = 5 * 60 * 1000
M15 = 15 * 60 * 1000
H4 = 4 * 60 * 60 * 1000
# Offset 0..4 minutes is the source's documented native M5 phase.
ZERO = 2_000 * H4


@dataclass(frozen=True)
class Proof:
    family: str
    expected_family: str
    c1: int
    selected_c1: int
    sweep_at: int
    pivot_at: int
    pivot_price: int
    prior_close: int
    confirming_close: int
    confirmed_at: int
    direction: int
    phase_min: int
    complete_15_at: int
    valid_h4: bool = True
    contiguous: bool = True
    opposite_sweep: bool = False
    confirmed_candle: bool = True
    family_expires_at: int = ZERO + 5 * H4


def proof(family: str, *, tf: int) -> Proof:
    # Synthetic UTC-like aligned timestamps, no broker data.
    sweep = ZERO + H4 + M15
    confirm = sweep + tf
    return Proof(
        family=family,
        expected_family=family,
        c1=ZERO,
        selected_c1=ZERO,
        sweep_at=sweep,
        pivot_at=sweep - tf,
        pivot_price=100,
        prior_close=99,
        confirming_close=101,
        confirmed_at=confirm,
        direction=1,
        phase_min=0,
        complete_15_at=confirm,
    )


def qualified(e: Proof, *, tf: int) -> bool:
    """Minimal shared causal gate that every family's MSS must meet."""
    if tf not in (M5, M15) or e.family not in FAMILIES:
        return False
    if not e.valid_h4 or e.family != e.expected_family or e.c1 != e.selected_c1:
        return False
    if not e.contiguous or e.opposite_sweep or not e.confirmed_candle:
        return False
    if e.direction not in (1, -1) or not (0 <= e.phase_min <= 4):
        return False
    if not e.c1 < e.pivot_at < e.sweep_at < e.confirmed_at <= e.family_expires_at:
        return False
    if e.confirmed_at % tf != e.phase_min * 60_000:
        return False
    if tf == M15 and e.confirmed_at > e.complete_15_at:
        return False
    # The CLOSING candle, not a wick or intrabar touch, must cross the pivot.
    if e.direction == 1:
        return e.prior_close <= e.pivot_price < e.confirming_close
    return e.prior_close >= e.pivot_price > e.confirming_close


class FamilyContractQA(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.source = SOURCE.read_text(encoding="utf-8")

    def test_source_binds_four_distinct_candidate_owners(self) -> None:
        # All four engines retain independent structures and candidates.
        for text in (
            "True3CMssCandidate q3 = qaTrue3CPending",
            "InsideCandidate own5 = array.get(insideCandidates, k5)",
            "Multi4MssCandidate q4 = array.get(qaMulti4MssCandidates, idx4)",
            "MultiNMssCandidate ownN5 = array.get(qaMultiNMssCandidates, k5)",
            "qaTrue3CConfirmed := owned3",
            "qaMultiNMssCandidates",
            "extraSelectInside",
            "extraSelectMultiN",
        ):
            self.assertIn(text, self.source)

    def test_source_retains_closed_candle_and_cross_guards(self) -> None:
        for text in (
            "previousM5Continuous",
            "prev15Continuous",
            "f_m15_phase_ok",
            "closed15At == bucket15",
            "extraPivot5At < extraSweepAt",
            "extraPivotAt < extraSweepAt",
            "extraMss5At > extraSweepAt",
            "extraMssAt > extraSweepAt",
            "extraMss5Causal ? extraPivot5At : na",
            "extraMssCausal ? extraMssAt : na",
            "barstate.islast ? state : na",
            "lookahead=barmerge.lookahead_off",
            "calc_bars_count=600",
        ):
            self.assertIn(text, self.source)

    def test_all_families_can_qualify_with_complete_synthetic_proof(self) -> None:
        for family in FAMILIES:
            for tf in (M5, M15):
                with self.subTest(family=family, tf=tf):
                    self.assertTrue(qualified(proof(family, tf=tf), tf=tf))

    def test_missing_wrong_family_identity_never_borrows_another_mss(self) -> None:
        for family in FAMILIES:
            for tf in (M5, M15):
                q = proof(family, tf=tf)
                with self.subTest(family=family, tf=tf):
                    self.assertFalse(qualified(replace(q, expected_family="CRT_2C_RETURN"), tf=tf))
                    self.assertFalse(qualified(replace(q, selected_c1=q.c1 + H4), tf=tf))
                    self.assertFalse(qualified(replace(q, opposite_sweep=True), tf=tf))
                    self.assertFalse(qualified(replace(q, valid_h4=False), tf=tf))

    def test_gaps_and_unclosed_candles_must_abstain(self) -> None:
        for family in FAMILIES:
            for tf in (M5, M15):
                q = proof(family, tf=tf)
                with self.subTest(family=family, tf=tf):
                    self.assertFalse(qualified(replace(q, contiguous=False), tf=tf))
                    self.assertFalse(qualified(replace(q, confirmed_candle=False), tf=tf))
                    self.assertFalse(qualified(replace(q, confirmed_at=q.sweep_at), tf=tf))
                    self.assertFalse(qualified(replace(q, pivot_at=q.sweep_at), tf=tf))
                    self.assertFalse(qualified(replace(q, phase_min=5), tf=tf))
                    self.assertFalse(qualified(replace(q, family_expires_at=q.sweep_at), tf=tf))

    def test_wick_touch_and_unconfirmed_break_do_not_count(self) -> None:
        for family in FAMILIES:
            for tf in (M5, M15):
                q = proof(family, tf=tf)
                with self.subTest(family=family, tf=tf):
                    self.assertFalse(qualified(replace(q, confirming_close=100), tf=tf))
                    self.assertFalse(qualified(replace(q, confirming_close=99), tf=tf))
                    self.assertFalse(qualified(replace(q, prior_close=101), tf=tf))

    def test_bearish_direction_and_m15_independence(self) -> None:
        for family in FAMILIES:
            down = replace(
                proof(family, tf=M15),
                direction=-1, confirming_close=99, prior_close=101,
            )
            with self.subTest(family=family):
                self.assertTrue(qualified(down, tf=M15))
                self.assertFalse(
                    qualified(replace(down, complete_15_at=down.confirmed_at - M15), tf=M15)
                )
                self.assertFalse(
                    qualified(replace(down, confirming_close=101), tf=M15)
                )
                # A confirmed M5 is never an M15 close.
                self.assertFalse(qualified(proof(family, tf=M5), tf=M15))


if __name__ == "__main__":
    unittest.main(verbosity=2)

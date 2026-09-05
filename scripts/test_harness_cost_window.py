#!/usr/bin/env python3
from __future__ import annotations

import os
import unittest
from datetime import datetime
from unittest.mock import patch
from zoneinfo import ZoneInfo

import harness_resilient_runner as runner

TZ = ZoneInfo("America/Asuncion")


class HarnessCostWindowTests(unittest.TestCase):
    def test_guard_disabled_without_real_deepseek_key(self) -> None:
        with patch.dict(os.environ, {}, clear=True):
            remaining = runner._cost_window_remaining_seconds(
                datetime(2026, 9, 4, 21, 24, 30, tzinfo=TZ)
            )
        self.assertIsNone(remaining)

    def test_thirty_seconds_remain_at_212430(self) -> None:
        with patch.dict(os.environ, {"DEEPSEEK_API_KEY": "test-only"}, clear=False):
            remaining = runner._cost_window_remaining_seconds(
                datetime(2026, 9, 4, 21, 24, 30, tzinfo=TZ)
            )
        self.assertEqual(remaining, 30)

    def test_cutoff_is_zero_at_2125(self) -> None:
        with patch.dict(os.environ, {"DEEPSEEK_API_KEY": "test-only"}, clear=False):
            remaining = runner._cost_window_remaining_seconds(
                datetime(2026, 9, 4, 21, 25, 0, tzinfo=TZ)
            )
        self.assertEqual(remaining, 0)

    def test_cutoff_remains_zero_after_2125(self) -> None:
        with patch.dict(os.environ, {"DEEPSEEK_API_KEY": "test-only"}, clear=False):
            remaining = runner._cost_window_remaining_seconds(
                datetime(2026, 9, 4, 21, 29, 59, tzinfo=TZ)
            )
        self.assertEqual(remaining, 0)


if __name__ == "__main__":
    unittest.main()

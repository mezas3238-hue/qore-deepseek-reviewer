#!/usr/bin/env python3
from __future__ import annotations

import unittest

from harness_resilient_runner import _resume_complete


class HarnessTerminalMarkerTests(unittest.TestCase):
    def test_plain_complete_marker_is_accepted(self) -> None:
        self.assertTrue(_resume_complete("## RESUME STATE\nCOMPLETE\n"))

    def test_markdown_inline_code_complete_marker_is_accepted(self) -> None:
        witness = (
            "post-lane report\r\n"
            "## RESUME STATE\r\n"
            "\r\n"
            "`COMPLETE`\r\n"
            "CANDIDATE_READY_FOR_EXTERNAL_QG\r\n"
        )
        self.assertTrue(_resume_complete(witness))

    def test_near_complete_markers_fail_closed(self) -> None:
        for witness in (
            "## RESUME STATE\nINCOMPLETE\n",
            "## RESUME STATE\n`COMPLETE-ish`\n",
            "## RESUME STATE\n**COMPLETE**\n",
            "## RESUME STATE COMPLETE\n",
            "RESUME STATE\nCOMPLETE\n",
        ):
            with self.subTest(witness=witness):
                self.assertFalse(_resume_complete(witness))


if __name__ == "__main__":
    unittest.main()

#!/usr/bin/env python3
from __future__ import annotations

import deepseek_reviewer_compact_budgeted_v19 as v19

# v17 intentionally promoted inherited candidate-side matrices to the then-current
# R62K scanner. That promotion also overwrote v16._scanner_r62g, which is resolved
# lazily by the historical R62G evidence suite. The result was mislabeled evidence:
# keys named scanner_r62g_* were actually executed with scanner=r62k.
#
# Restore the exact R62G scanner only for the R62G historical/repair matrix. R62K
# keeps its own explicit _scanner_r62k probes and all later candidate matrices keep
# their existing successor routing. This is reviewer-evidence plumbing only; Core
# is not modified.
v18 = v19.v18
v17 = v18.v17
v16 = v17.v16
compact = v17.compact


def _scanner_r62g_exact(source: str) -> str:
    return compact._scanner_probe({"scanner": "r62g", "source": source})


v16._scanner_r62g = _scanner_r62g_exact


if __name__ == "__main__":
    raise SystemExit(v19.v7.main())

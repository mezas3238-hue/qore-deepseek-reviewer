#!/usr/bin/env python3
from __future__ import annotations

import os
from types import SimpleNamespace

# R24 measured that the complete 37-file changed evidence now exceeds the older
# 300k workflow fuse. Preserve the mandatory complete-evidence contract and its
# fail-closed behavior, but give the current bounded review surface explicit
# headroom. This runs before importing the reviewer chain because that chain reads
# the environment at import time. Never lower a larger operator-supplied budget.
_mandatory_changed_chars = int(
    os.environ.get("DEEPSEEK_MAX_MANDATORY_CHANGED_CHARS", "0") or "0"
)
os.environ["DEEPSEEK_MAX_MANDATORY_CHANGED_CHARS"] = str(
    max(_mandatory_changed_chars, 400000)
)

import deepseek_reviewer_v2_0_entrypoint as v20  # noqa: E402

# R43 measured a legitimate 65-file final evidence bundle at 528,547 characters,
# above V1.4's historical 520k fuse while the mandatory changed-file bundle itself
# remained inside its independent 500k gate. Token-budget policy explicitly permits
# raising evidence budgets rather than truncating required evidence. Keep a bounded
# measured floor of 560k (~6% headroom over R43), while accepting a larger explicit
# operator/workflow budget monotonically. Neither path can lower the inherited fuse.
_final_evidence_chars = int(
    os.environ.get("DEEPSEEK_MAX_FINAL_EVIDENCE_CHARS", "0") or "0"
)
v20.v13.MAX_FINAL_EVIDENCE_CHARS = max(
    v20.v13.MAX_FINAL_EVIDENCE_CHARS,
    560000,
    _final_evidence_chars,
)

# V2.1 referenced `v17.budgeted.send_request`, but V1.7 never exported a
# `budgeted` module attribute. The failed R1G run therefore died at import time
# before any DeepSeek review call. V2.0 already retains the exact stable
# pre-V2.0 delegate as `_v17_send_request`; expose only that delegate through the
# compatibility attribute expected by V2.1 before importing it.
v20.v17.budgeted = SimpleNamespace(send_request=v20._v17_send_request)

import deepseek_reviewer_v2_1_entrypoint as v21  # noqa: E402
import exact_qg_evidence as exact_qg  # noqa: E402

# Canonical reviews must independently authenticate the exact QORE quality gate.
# Keep V2.1.1's complete changed-file/dependency/planner path untouched and append
# only the bounded authenticated QG projection. Raw command windows are parsed and
# equality-checked inside exact_qg_evidence; noisy raw logs never enter model context.
_base_build_baseline_evidence = v21.v13.build_baseline_evidence


def _build_baseline_with_exact_qg() -> str:
    baseline = _base_build_baseline_evidence()
    qg_evidence = exact_qg.build_exact_qg_evidence()
    return baseline + "\n# EXACT QORE QUALITY GATE\n" + qg_evidence + "\n"


v21.v13.build_baseline_evidence = _build_baseline_with_exact_qg


def main() -> int:
    return v21.main()


if __name__ == "__main__":
    raise SystemExit(main())

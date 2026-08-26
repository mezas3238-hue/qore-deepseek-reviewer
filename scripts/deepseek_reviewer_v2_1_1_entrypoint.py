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

# V2.1 referenced `v17.budgeted.send_request`, but V1.7 never exported a
# `budgeted` module attribute. The failed R1G run therefore died at import time
# before any DeepSeek review call. V2.0 already retains the exact stable
# pre-V2.0 delegate as `_v17_send_request`; expose only that delegate through the
# compatibility attribute expected by V2.1 before importing it.
v20.v17.budgeted = SimpleNamespace(send_request=v20._v17_send_request)

import deepseek_reviewer_v2_1_entrypoint as v21  # noqa: E402


def main() -> int:
    return v21.main()


if __name__ == "__main__":
    raise SystemExit(main())

#!/usr/bin/env python3
from __future__ import annotations

import json

import deepseek_reviewer_compact_budgeted_v17 as v17

# R82 correctly failed mechanically because its prompt made the same-statement
# NamedExpr witness mandatory but v17 did not emit that witness in raw evidence.
# v18 adds the missing runtime/scanner pair without changing the frozen Core or
# weakening any predecessor matrix.
compact = v17.compact
v6 = v17.v6
v7 = v17.v7
v8 = v17.v8

_NAMED_EXPR_SAME_STATEMENT = (
    "import builtins\n"
    "def run():\n"
    "    return globals()['b'].eval('1+1')\n"
    "result = ((b := builtins), run())[1]\n"
    "print(result)\n"
)

# Permit only this exact controlled runtime witness through the reviewer runtime
# boundary. The source executes in the isolated review runner and is not written
# into qore-core.
v8._CONTROLLED_IMPORTLIB_RUNTIME_SOURCES = (
    v8._CONTROLLED_IMPORTLIB_RUNTIME_SOURCES | frozenset({_NAMED_EXPR_SAME_STATEMENT})
)

_base_suite = v17._extended_r62k_probe_suite


def _extended_r62k_namedexpr_probe_suite() -> str:
    base = _base_suite()
    probes = {
        "python_r62k_namedexpr_same_statement": v6._python(
            "run", _NAMED_EXPR_SAME_STATEMENT
        ),
        "scanner_r62k_namedexpr_same_statement": v17._scanner_r62k(
            _NAMED_EXPR_SAME_STATEMENT
        ),
    }
    text = json.dumps(probes, indent=2, sort_keys=True)
    print("QORE R62K same-statement NamedExpr evidence:\n" + text)
    return (
        base
        + "\n\nR62K SAME-STATEMENT NAMEDEXPR PROBES:\n"
        + compact.compact_clip(text, 12000)
    )


v7._extended_r62b_probe_suite = _extended_r62k_namedexpr_probe_suite


if __name__ == "__main__":
    raise SystemExit(v7.main())

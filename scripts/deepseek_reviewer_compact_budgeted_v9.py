#!/usr/bin/env python3
from __future__ import annotations

import json

import deepseek_reviewer_compact_budgeted_v6 as v6
import deepseek_reviewer_compact_budgeted_v7 as v7
import deepseek_reviewer_compact_budgeted_v8 as v8

budgeted = v6.budgeted
compact = v6.compact

# R73 proved two independent reviewer-infrastructure facts:
# 1) the pre-model executable matrix is valuable and must target the exact
#    successor scanner, not the consumed R62B implementation; and
# 2) four exploration rounds plus a 7k thinking final can leave no conservative
#    room for the required no-thinking fallback when the model spends all output
#    tokens on hidden reasoning.
#
# Keep every hard guarantee intact: exact post-call 100k prompt ceiling,
# calibrated 2.5x density preflight, 8,192 protocol reserve, generic runtime
# sandbox, and closed importlib runtime-source allowlist. Only reserve more of
# that existing prompt budget for finalization and increase the *output* token
# allowance so the first thinking final can emit visible review text.
EXPLORATION_R62C_FINAL_RESERVE_STOP = 22_000
FINAL_R62C_MAX_TOKENS = 12_000

v6.v4.EXPLORATION_FINAL_RESERVE_STOP = EXPLORATION_R62C_FINAL_RESERVE_STOP
v6.v4.v3.EXPLORATION_STOP_PROMPT_TOKENS = EXPLORATION_R62C_FINAL_RESERVE_STOP
budgeted.FINAL_MAX_TOKENS = FINAL_R62C_MAX_TOKENS

# Expose the exact frozen R62C scanner through the existing read-only scanner
# probe. Adversarial source text is parsed by Core's scanner; it is never exec'd
# by this probe.
compact._SCANNER_TARGETS["r62c"] = (
    "test_universal_cross_asset_conformance_final_owner_r62c_guards",
    "_r62c_dynamic_execution_markers_from_source",
)
for _tool in budgeted.TOOLS:
    _function = _tool.get("function") or {}
    if _function.get("name") != "scanner_probe":
        continue
    _function["description"] = (
        "Run the exact frozen QORE static scanner on supplied source without "
        "executing that source. Use scanner=r60/r61/r62/r62b/r62c/final_owner "
        "and report the actual marker tuple from the checked-out HEAD."
    )
    _enum = (
        _function.get("parameters", {})
        .get("properties", {})
        .get("scanner", {})
        .get("enum", [])
    )
    if "r62c" not in _enum:
        _enum.append("r62c")


def _scanner_r62c(source: str) -> str:
    return compact._scanner_probe({"scanner": "r62c", "source": source})


# v6's mandatory suite and v7's extension resolve v6._scanner at call time.
# Redirect both inherited matrices to the corrected exact scanner.
v6._scanner = _scanner_r62c

# Extend v8's closed infrastructure-owned runtime set with exact immutable R62C
# witnesses. The generic python_semantics_probe sandbox remains unchanged.
_R62C_CONTROLLED_IMPORTLIB_SOURCES = frozenset(
    {
        "import importlib as il\n"
        "loader = getattr(il, 'import_module')\n"
        "module = loader('math')\n"
        "print(module.__name__)\n",
        "import importlib\n"
        "namespace = vars(importlib)\n"
        "loader = namespace['import_module']\n"
        "module = loader('math')\n"
        "print(module.__name__)\n",
        "import importlib\n"
        "module = importlib.__dict__.get('import_module')('math')\n"
        "print(module.__name__)\n",
        "import importlib\n"
        "import operator\n"
        "module = operator.getitem(importlib.__dict__, 'import_module')('math')\n"
        "print(module.__name__)\n",
        "import importlib\n"
        "import operator\n"
        "module = operator.itemgetter('import_module')(vars(importlib))('math')\n"
        "print(module.__name__)\n",
        "import importlib\n"
        "import operator\n"
        "module = operator.attrgetter('import_module')(importlib)('math')\n"
        "print(module.__name__)\n",
    }
)
v8._CONTROLLED_IMPORTLIB_RUNTIME_SOURCES = (
    v8._CONTROLLED_IMPORTLIB_RUNTIME_SOURCES | _R62C_CONTROLLED_IMPORTLIB_SOURCES
)

_base_extended_suite = v7._extended_r62b_probe_suite


def _extended_r62c_probe_suite() -> str:
    base = _base_extended_suite()
    probes: dict[str, str] = {}

    # R62C's direct/computed lambda closure.
    probes["scanner_lambda_computed_return_eval"] = _scanner_r62c(
        "import builtins\n"
        "(lambda: getattr(builtins, 'eval'))()('1+1')\n"
    )

    # Computed importlib aliases and inherited mapping/accessor machinery.
    probes["python_importlib_alias_rebind_runtime"] = v6._python(
        "run",
        "import importlib as il\n"
        "loader = getattr(il, 'import_module')\n"
        "module = loader('math')\n"
        "print(module.__name__)\n",
    )
    probes["scanner_importlib_alias_rebind"] = _scanner_r62c(
        "import importlib as il\n"
        "loader = getattr(il, 'import_module')\n"
        "loader('math')\n"
    )

    probes["python_importlib_namespace_alias_runtime"] = v6._python(
        "run",
        "import importlib\n"
        "namespace = vars(importlib)\n"
        "loader = namespace['import_module']\n"
        "module = loader('math')\n"
        "print(module.__name__)\n",
    )
    probes["scanner_importlib_namespace_alias"] = _scanner_r62c(
        "import importlib\n"
        "namespace = vars(importlib)\n"
        "loader = namespace['import_module']\n"
        "loader('math')\n"
    )

    probes["python_importlib_mapping_get_runtime"] = v6._python(
        "run",
        "import importlib\n"
        "module = importlib.__dict__.get('import_module')('math')\n"
        "print(module.__name__)\n",
    )
    probes["scanner_importlib_mapping_get"] = _scanner_r62c(
        "import importlib\n"
        "importlib.__dict__.get('import_module')('math')\n"
    )

    operator_cases = {
        "getitem": (
            "import importlib\n"
            "import operator\n"
            "module = operator.getitem(importlib.__dict__, 'import_module')('math')\n"
            "print(module.__name__)\n",
            "import importlib\n"
            "import operator\n"
            "operator.getitem(importlib.__dict__, 'import_module')('math')\n",
        ),
        "itemgetter": (
            "import importlib\n"
            "import operator\n"
            "module = operator.itemgetter('import_module')(vars(importlib))('math')\n"
            "print(module.__name__)\n",
            "import importlib\n"
            "import operator\n"
            "operator.itemgetter('import_module')(vars(importlib))('math')\n",
        ),
        "attrgetter": (
            "import importlib\n"
            "import operator\n"
            "module = operator.attrgetter('import_module')(importlib)('math')\n"
            "print(module.__name__)\n",
            "import importlib\n"
            "import operator\n"
            "operator.attrgetter('import_module')(importlib)('math')\n",
        ),
    }
    for name, (runtime_source, scanner_source) in operator_cases.items():
        probes[f"python_importlib_operator_{name}_runtime"] = v6._python(
            "run", runtime_source
        )
        probes[f"scanner_importlib_operator_{name}"] = _scanner_r62c(scanner_source)

    # Safe computed inverses must not become blanket importlib rejections.
    probes["scanner_importlib_safe_getattr"] = _scanner_r62c(
        "import importlib\nvalue = getattr(importlib, 'util')\n"
    )
    probes["scanner_importlib_safe_dict"] = _scanner_r62c(
        "import importlib\nvalue = importlib.__dict__['util']\n"
    )
    probes["scanner_importlib_safe_vars"] = _scanner_r62c(
        "import importlib\nvalue = vars(importlib)['util']\n"
    )

    text = json.dumps(probes, indent=2, sort_keys=True)
    print(
        "QORE R62C exact successor executable evidence "
        f"(explore_stop={EXPLORATION_R62C_FINAL_RESERVE_STOP}, "
        f"final_max_tokens={FINAL_R62C_MAX_TOKENS}):\n{text}"
    )
    return (
        base
        + "\n\nR62C EXACT SUCCESSOR PROBES:\n"
        + compact.compact_clip(text, 24000)
    )


v7._extended_r62b_probe_suite = _extended_r62c_probe_suite


if __name__ == "__main__":
    raise SystemExit(v7.main())

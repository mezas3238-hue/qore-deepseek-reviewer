#!/usr/bin/env python3
from __future__ import annotations

import contextlib
import hashlib
import inspect
import io
import json
from collections.abc import Mapping

import deepseek_reviewer_compact_budgeted_v20 as v20


def _payload_without_predecessor_suites() -> dict[str, str]:
    v16 = v20.v16
    original_base = v16._base_suite
    try:
        v16._base_suite = lambda: ""
        with contextlib.redirect_stdout(io.StringIO()):
            rendered = v16._extended_r62g_probe_suite()
    finally:
        v16._base_suite = original_base

    header = "R62G SCOPE-PRESERVING RETAINED-NAMESPACE PROBES:\n"
    encoded = rendered.rsplit(header, 1)[1]
    payload = json.loads(encoded)
    if not isinstance(payload, Mapping):
        raise AssertionError("R62G evidence payload is not a mapping")
    return {str(key): str(value) for key, value in payload.items()}


def _record(name: str, source: str, result: str) -> dict[str, object]:
    data = source.encode("utf-8")
    return {
        "name": name,
        "source_repr": repr(source),
        "source_bytes": len(data),
        "source_sha256": hashlib.sha256(data).hexdigest(),
        "scanner_result": result,
    }


def main() -> int:
    v16 = v20.v16
    v15 = v16.v15
    direct = v20._scanner_r62g_exact
    routed = v16._scanner_r62g
    if routed is not direct:
        raise AssertionError("v16 R62G evidence route is not the exact v20 wrapper")

    payload = _payload_without_predecessor_suites()
    cases = {
        "explicit_builtins_module_subscript": (
            v16._EXPLICIT_BUILTINS_MODULE_SUBSCRIPT,
            False,
        ),
        "explicit_builtins_mapping_subscript": (
            v16._EXPLICIT_BUILTINS_MAPPING_SUBSCRIPT,
            True,
        ),
        "explicit_dunder_builtins_mapping": (
            v16._EXPLICIT_DUNDER_BUILTINS_MAPPING,
            True,
        ),
        "direct_dunder_builtins": (v15._DIRECT_DUNDER_BUILTINS, True),
        "imported_builtins_dict": (v15._IMPORTED_BUILTINS_DICT, True),
    }

    records: list[dict[str, object]] = []
    for name, (source, expects_marker) in cases.items():
        direct_result = direct(source)
        builder_result = payload[f"scanner_r62g_{name}"]
        if direct_result != builder_result:
            raise AssertionError(f"direct/builder divergence for {name}")
        has_marker = "'call:" in direct_result or "'binding:" in direct_result
        if has_marker != expects_marker:
            raise AssertionError(f"unexpected R62G marker disposition for {name}")
        records.append(_record(name, source, direct_result))

    for name in ("direct_dunder_builtins", "imported_builtins_dict"):
        runtime = payload[f"python_r62g_{name}"]
        required = (
            "CPYTHON __main__ (-c) CONTEXT:",
            "TypeError: 'module' object is not subscriptable",
            "CPYTHON IMPORTED-MODULE CONTEXT:",
            "context=imported-module",
            "BUILTINS_TYPE=dict",
            "EXIT=0",
        )
        missing = [fragment for fragment in required if fragment not in runtime]
        if missing:
            raise AssertionError(f"context evidence missing for {name}: {missing!r}")

    metadata = {
        "direct_callable": direct.__qualname__,
        "direct_callable_module": direct.__module__,
        "direct_callable_file": inspect.getsourcefile(direct),
        "builder_callable": v16._extended_r62g_probe_suite.__qualname__,
        "builder_callable_module": v16._extended_r62g_probe_suite.__module__,
        "builder_callable_file": inspect.getsourcefile(
            v16._extended_r62g_probe_suite
        ),
        "scanner_target": v20.compact._SCANNER_TARGETS["r62g"],
        "has_callable_cache": hasattr(direct, "cache_clear"),
        "records": records,
    }
    print(json.dumps(metadata, indent=2, sort_keys=True))
    print("R62G_EVIDENCE_ROUTING_AND_CONTEXT_OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

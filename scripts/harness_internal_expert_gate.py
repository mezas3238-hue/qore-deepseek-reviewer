#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path

BEGIN = "QORE_CHECKPOINT_BEGIN"
END = "QORE_CHECKPOINT_END"
EVIDENCE_BEGIN = "QORE_INTERNAL_EXPERT_EVIDENCE_BEGIN"
EVIDENCE_END = "QORE_INTERNAL_EXPERT_EVIDENCE_END"
PROTOCOL = "BLIND_DIFFERENTIAL_FALSIFICATION_V2"
MIN_NOVEL_PROBES = 24
MIN_BENIGN_CONTROLS = 12
MIN_CROSS_INTERACTIONS = 12

CLEAN = "HARNESS_INTERNAL_EXPERT_STATUS: CLEAN"
DUAL = "HARNESS_DUAL_ROLE_STATUS: ENGINEER_COMPLETE + INTERNAL_EXPERT_CLEAN"
HANDOFF = "HARNESS_HANDOFF_TARGET: EXTERNAL_EXPERT_EXPECTED_PASS"
HEX64 = re.compile(r"^[0-9a-f]{64}$")


class GateError(RuntimeError):
    pass


def _complete_checkpoints(text: str) -> list[str]:
    blocks: list[str] = []
    current: list[str] | None = None
    for raw in text.replace("\r\n", "\n").replace("\r", "\n").split("\n"):
        stripped = raw.strip()
        if stripped == BEGIN:
            if current is not None:
                raise GateError("nested checkpoint begin")
            current = []
            continue
        if stripped == END:
            if current is None:
                raise GateError("checkpoint end without begin")
            blocks.append("\n".join(current))
            current = None
            continue
        if current is not None:
            current.append(raw)
    if current is not None:
        raise GateError("unterminated final checkpoint")
    if not blocks:
        raise GateError("checkpoint journal contains no complete checkpoints")
    return blocks


def _evidence(block: str) -> dict[str, str]:
    lines = block.splitlines()
    starts = [i for i, raw in enumerate(lines) if raw.strip() == EVIDENCE_BEGIN]
    ends = [i for i, raw in enumerate(lines) if raw.strip() == EVIDENCE_END]
    if len(starts) != 1 or len(ends) != 1 or ends[0] <= starts[0]:
        raise GateError("final clean checkpoint must contain exactly one complete Internal Expert evidence block")
    values: dict[str, str] = {}
    for raw in lines[starts[0] + 1 : ends[0]]:
        stripped = raw.strip()
        if not stripped:
            continue
        if "=" not in stripped:
            raise GateError(f"invalid Internal Expert evidence line: {stripped}")
        key, value = stripped.split("=", 1)
        key = key.strip()
        value = value.strip()
        if not key or key in values:
            raise GateError(f"duplicate/empty Internal Expert evidence key: {key!r}")
        values[key] = value
    return values


def _require_int(values: dict[str, str], key: str, minimum: int) -> int:
    raw = values.get(key)
    if raw is None or not raw.isdigit():
        raise GateError(f"{key} must be an integer")
    value = int(raw)
    if value < minimum:
        raise GateError(f"{key}={value} is below required minimum {minimum}")
    return value


def validate(checkpoints: Path, patch: Path) -> dict[str, object]:
    if not checkpoints.is_file() or not checkpoints.stat().st_size:
        raise GateError("checkpoint journal missing/empty")
    if not patch.is_file() or not patch.stat().st_size:
        raise GateError("candidate patch missing/empty")

    blocks = _complete_checkpoints(checkpoints.read_text(encoding="utf-8"))
    clean_blocks = [
        block
        for block in blocks
        if CLEAN in block and DUAL in block and HANDOFF in block
    ]
    if not clean_blocks:
        raise GateError("no complete checkpoint contains all Internal Expert clean/handoff markers")
    block = clean_blocks[-1]
    values = _evidence(block)

    if values.get("internal_expert_protocol") != PROTOCOL:
        raise GateError("Internal Expert protocol marker is missing or stale")
    patch_sha = values.get("candidate_patch_sha256", "")
    if not HEX64.fullmatch(patch_sha):
        raise GateError("candidate_patch_sha256 must be 64 lowercase hex")
    actual_sha = hashlib.sha256(patch.read_bytes()).hexdigest()
    if patch_sha != actual_sha:
        raise GateError(
            f"Internal Expert CLEAN is stale: checkpoint patch {patch_sha} != actual patch {actual_sha}"
        )
    if values.get("independent_family_model") != "COMPLETE":
        raise GateError("independent_family_model must be COMPLETE")
    if values.get("engineer_rationale_seen_before_blind_model") != "false":
        raise GateError("blind reconstruction was contaminated by Engineer rationale")
    novel = _require_int(values, "novel_probe_count", MIN_NOVEL_PROBES)
    benign = _require_int(values, "benign_control_count", MIN_BENIGN_CONTROLS)
    cross = _require_int(values, "cross_interaction_probe_count", MIN_CROSS_INTERACTIONS)
    if values.get("coverage_delta") != "NONE":
        raise GateError("coverage_delta must be NONE before CLEAN")
    if values.get("material_findings") != "0":
        raise GateError("material_findings must be 0 before CLEAN")
    if values.get("lsp_final_recheck") != "COMPLETE":
        raise GateError("lsp_final_recheck must be COMPLETE")

    return {
        "schema": "qore-harness-internal-expert-gate-v2",
        "protocol": PROTOCOL,
        "candidate_patch_sha256": actual_sha,
        "novel_probe_count": novel,
        "benign_control_count": benign,
        "cross_interaction_probe_count": cross,
        "coverage_delta": "NONE",
        "material_findings": 0,
        "independent_family_model": "COMPLETE",
        "blind_reconstruction": True,
        "lsp_final_recheck": "COMPLETE",
        "host_verified": True,
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--checkpoints", type=Path, required=True)
    parser.add_argument("--patch", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    try:
        evidence = validate(args.checkpoints, args.patch)
    except GateError as exc:
        parser.error(str(exc))
        return 2
    args.output.write_text(json.dumps(evidence, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print("QORE Harness Internal Expert V2 deterministic gate: PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

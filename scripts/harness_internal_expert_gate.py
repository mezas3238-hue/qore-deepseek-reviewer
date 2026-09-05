#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path

BEGIN = "QORE_CHECKPOINT_BEGIN"
END = "QORE_CHECKPOINT_END"
CLEAN = "HARNESS_INTERNAL_EXPERT_STATUS: CLEAN"
DUAL = "HARNESS_DUAL_ROLE_STATUS: ENGINEER_COMPLETE + INTERNAL_EXPERT_CLEAN"
POLICY = "QORE-HARNESS-INDEPENDENT-AUDIT-REPAIR-POLICY-V2"
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


def _evidence_lines(block: str) -> dict[str, str]:
    values: dict[str, str] = {}
    for raw in block.splitlines():
        stripped = raw.strip()
        if not stripped.startswith("evidence:"):
            continue
        payload = stripped.split(":", 1)[1].strip()
        if "=" not in payload:
            continue
        key, value = payload.split("=", 1)
        key = key.strip()
        value = value.strip()
        if key in values:
            raise GateError(f"duplicate evidence key: {key}")
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
    clean_blocks = [block for block in blocks if CLEAN in block and DUAL in block]
    if not clean_blocks:
        raise GateError("no complete checkpoint contains Internal Expert CLEAN and dual-role markers")
    block = clean_blocks[-1]
    values = _evidence_lines(block)

    if values.get("policy") != POLICY:
        raise GateError("Internal Expert audit-repair policy marker is missing or stale")
    initial_sha = values.get("initial_candidate_patch_sha256", "")
    final_sha = values.get("final_candidate_patch_sha256", "")
    if not HEX64.fullmatch(initial_sha) or not HEX64.fullmatch(final_sha):
        raise GateError("initial/final candidate patch SHA256 must be 64 lowercase hex")

    actual_sha = hashlib.sha256(patch.read_bytes()).hexdigest()
    if final_sha != actual_sha:
        raise GateError(
            f"Internal Expert CLEAN is stale: checkpoint final patch {final_sha} != actual patch {actual_sha}"
        )

    audit_pass_count = _require_int(values, "internal_expert_audit_pass_count", 1)
    repair_count = _require_int(values, "internal_expert_repair_count", 0)

    if values.get("internal_expert_knows_engineer_identity") != "false":
        raise GateError("Internal Expert identity isolation is not proven")
    if values.get("engineer_transcript_shared_with_internal_expert") != "false":
        raise GateError("Engineer transcript crossed the audit boundary")
    if values.get("engineer_reentered_after_audit_handoff") != "false":
        raise GateError("Engineer improperly re-entered after audit handoff")
    if values.get("internal_expert_audit_repair_authority") != "true":
        raise GateError("Internal Expert audit-repair authority evidence missing")

    repaired = initial_sha != final_sha
    if repaired:
        if repair_count < 1:
            raise GateError("final patch changed but no Internal Expert repair was recorded")
        if audit_pass_count < 2:
            raise GateError("Internal Expert repair lacks a post-repair full re-audit")
    elif repair_count != 0:
        raise GateError("repair_count is nonzero but candidate bytes are unchanged")

    return {
        "schema": "qore-harness-internal-expert-audit-repair-gate-v2",
        "policy": POLICY,
        "initial_candidate_patch_sha256": initial_sha,
        "final_candidate_patch_sha256": final_sha,
        "actual_candidate_patch_sha256": actual_sha,
        "internal_expert_repaired_candidate": repaired,
        "internal_expert_repair_count": repair_count,
        "internal_expert_audit_pass_count": audit_pass_count,
        "internal_expert_knows_engineer_identity": False,
        "engineer_transcript_shared_with_internal_expert": False,
        "engineer_reentered_after_audit_handoff": False,
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
    print("QORE Harness Internal Expert independent audit-repair gate: PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

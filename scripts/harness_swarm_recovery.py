#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
from dataclasses import dataclass
from enum import StrEnum
from pathlib import Path
from typing import Iterable

LANE_COUNT = 6
CHECKPOINT_BEGIN = "QORE_CHECKPOINT_BEGIN"
CHECKPOINT_END = "QORE_CHECKPOINT_END"


class LaneState(StrEnum):
    NOT_STARTED = "NOT_STARTED"
    RUNNING = "RUNNING"
    CHECKPOINTED = "CHECKPOINTED"
    COMPLETED = "COMPLETED"
    RECOVERY_REQUIRED = "RECOVERY_REQUIRED"
    MATERIAL_BLOCKED = "MATERIAL_BLOCKED"


class TerminationClass(StrEnum):
    COMPLETE = "COMPLETE"
    RECOVERABLE = "RECOVERABLE"
    MATERIAL_BLOCKED = "MATERIAL_BLOCKED"
    INVALID_STATE = "INVALID_STATE"


@dataclass(frozen=True, slots=True)
class SwarmSnapshot:
    package_id: str
    start: str
    tree: str
    lanes: dict[int, LaneState]
    checkpoint_count: int
    recovery_generation: int
    primary_exit_code: int
    termination: TerminationClass
    termination_reason: str

    @property
    def completed_lanes(self) -> tuple[int, ...]:
        return tuple(i for i in range(1, LANE_COUNT + 1) if self.lanes[i] == LaneState.COMPLETED)

    @property
    def pending_lanes(self) -> tuple[int, ...]:
        return tuple(
            i
            for i in range(1, LANE_COUNT + 1)
            if self.lanes[i]
            in {
                LaneState.NOT_STARTED,
                LaneState.RUNNING,
                LaneState.CHECKPOINTED,
                LaneState.RECOVERY_REQUIRED,
            }
        )

    @property
    def blocked_lanes(self) -> tuple[int, ...]:
        return tuple(i for i in range(1, LANE_COUNT + 1) if self.lanes[i] == LaneState.MATERIAL_BLOCKED)

    @property
    def all_complete(self) -> bool:
        return len(self.completed_lanes) == LANE_COUNT

    def to_json(self) -> dict[str, object]:
        return {
            "schema": "qore-harness-swarm-recovery-v1",
            "package_id": self.package_id,
            "start": self.start,
            "tree": self.tree,
            "lanes": {str(k): v.value for k, v in self.lanes.items()},
            "completed_lanes": list(self.completed_lanes),
            "pending_lanes": list(self.pending_lanes),
            "blocked_lanes": list(self.blocked_lanes),
            "checkpoint_count": self.checkpoint_count,
            "recovery_generation": self.recovery_generation,
            "primary_exit_code": self.primary_exit_code,
            "termination": self.termination.value,
            "termination_reason": self.termination_reason,
            "full_qg_allowed": self.all_complete and not self.blocked_lanes,
        }


_FIELD_RE = re.compile(r"^([A-Za-z0-9 _/-]+):\s*(.*?)\s*$")
_LANE_RE = re.compile(r"(?:lane|LANE)[ _-]?([1-6])", re.IGNORECASE)


def _blocks(text: str) -> list[list[str]]:
    lines = text.splitlines()
    out: list[list[str]] = []
    current: list[str] | None = None
    for line in lines:
        if line.strip() == CHECKPOINT_BEGIN:
            if current is not None:
                raise ValueError("nested checkpoint begin")
            current = []
            continue
        if line.strip() == CHECKPOINT_END:
            if current is None:
                raise ValueError("checkpoint end without begin")
            out.append(current)
            current = None
            continue
        if current is not None:
            current.append(line)
    if current is not None:
        raise ValueError("unterminated checkpoint")
    if not out:
        raise ValueError("no durable checkpoints")
    return out


def _fields(lines: Iterable[str]) -> dict[str, str]:
    result: dict[str, str] = {}
    for line in lines:
        match = _FIELD_RE.match(line.strip())
        if match:
            result[match.group(1).strip().lower()] = match.group(2).strip()
    return result


def _lane_mentions(lines: Iterable[str]) -> list[int]:
    found: list[int] = []
    for line in lines:
        for match in _LANE_RE.finditer(line):
            lane = int(match.group(1))
            if lane not in found:
                found.append(lane)
    return found


def _state_from_text(text: str) -> LaneState | None:
    upper = text.upper()
    if "MATERIAL_BLOCKED" in upper or "MATERIAL BLOCKED" in upper:
        return LaneState.MATERIAL_BLOCKED
    if "RECOVERY_REQUIRED" in upper or "RECOVERY REQUIRED" in upper:
        return LaneState.RECOVERY_REQUIRED
    if any(token in upper for token in ("COMPLETED", "COMPLETE", "DONE", "CLOSED")):
        return LaneState.COMPLETED
    if "CHECKPOINT" in upper:
        return LaneState.CHECKPOINTED
    if any(token in upper for token in ("RUNNING", "IN PROGRESS", "PENDING")):
        return LaneState.RUNNING
    return None


def parse_checkpoint_state(text: str) -> tuple[str, str, str, dict[int, LaneState], int, int]:
    blocks = _blocks(text)
    package_id = ""
    start = ""
    tree = ""
    generation = 0
    lanes = {i: LaneState.NOT_STARTED for i in range(1, LANE_COUNT + 1)}

    for block in blocks:
        fields = _fields(block)
        if fields.get("package_id"):
            if package_id and package_id != fields["package_id"]:
                raise ValueError("checkpoint package binding changed")
            package_id = fields["package_id"]
        binding = fields.get("binding", "")
        start_match = re.search(r"START=([0-9a-fA-F]{7,64})", binding)
        tree_match = re.search(r"TREE=([0-9a-fA-F]{7,64})", binding)
        if start_match:
            candidate = start_match.group(1).lower()
            if start and start != candidate:
                raise ValueError("checkpoint START binding changed")
            start = candidate
        if tree_match:
            candidate = tree_match.group(1).lower()
            if tree and tree != candidate:
                raise ValueError("checkpoint TREE binding changed")
            tree = candidate
        if fields.get("recovery_generation"):
            generation = max(generation, int(fields["recovery_generation"]))

        joined = "\n".join(block)
        explicit_state = fields.get("lane_state") or fields.get("state") or ""
        inferred = _state_from_text(explicit_state or joined)
        for lane in _lane_mentions(block):
            if inferred is not None:
                previous = lanes[lane]
                if previous == LaneState.COMPLETED and inferred != LaneState.COMPLETED:
                    raise ValueError(f"completed lane {lane} regressed to {inferred.value}")
                lanes[lane] = inferred

    if not package_id or not start or not tree:
        raise ValueError("missing immutable checkpoint binding")
    return package_id, start, tree, lanes, len(blocks), generation


def classify(
    *,
    checkpoint_text: str,
    primary_output: str,
    primary_exit_code: int,
    expected_package_id: str,
    expected_start: str,
    expected_tree: str,
) -> SwarmSnapshot:
    try:
        package_id, start, tree, lanes, count, generation = parse_checkpoint_state(checkpoint_text)
    except Exception as exc:
        return SwarmSnapshot(
            package_id=expected_package_id,
            start=expected_start,
            tree=expected_tree,
            lanes={i: LaneState.NOT_STARTED for i in range(1, LANE_COUNT + 1)},
            checkpoint_count=0,
            recovery_generation=0,
            primary_exit_code=primary_exit_code,
            termination=TerminationClass.INVALID_STATE,
            termination_reason=f"checkpoint-invalid: {exc}",
        )

    if (package_id, start, tree) != (
        expected_package_id,
        expected_start.lower(),
        expected_tree.lower(),
    ):
        return SwarmSnapshot(
            package_id=package_id,
            start=start,
            tree=tree,
            lanes=lanes,
            checkpoint_count=count,
            recovery_generation=generation,
            primary_exit_code=primary_exit_code,
            termination=TerminationClass.INVALID_STATE,
            termination_reason="immutable binding mismatch",
        )

    blocked = [lane for lane, state in lanes.items() if state == LaneState.MATERIAL_BLOCKED]
    if blocked:
        return SwarmSnapshot(
            package_id=package_id,
            start=start,
            tree=tree,
            lanes=lanes,
            checkpoint_count=count,
            recovery_generation=generation,
            primary_exit_code=primary_exit_code,
            termination=TerminationClass.MATERIAL_BLOCKED,
            termination_reason=f"material blocker in lane(s) {blocked}",
        )

    complete = all(state == LaneState.COMPLETED for state in lanes.values())
    if primary_exit_code == 0 and complete:
        termination = TerminationClass.COMPLETE
        reason = "all six lanes complete"
    elif not complete and count >= 2:
        termination = TerminationClass.RECOVERABLE
        reason = "partial durable progress; recover only pending lanes"
    elif primary_exit_code != 0 and count >= 1:
        termination = TerminationClass.RECOVERABLE
        reason = "non-zero model exit with durable checkpoint evidence"
    else:
        termination = TerminationClass.INVALID_STATE
        reason = "insufficient durable state for safe recovery"

    return SwarmSnapshot(
        package_id=package_id,
        start=start,
        tree=tree,
        lanes=lanes,
        checkpoint_count=count,
        recovery_generation=generation,
        primary_exit_code=primary_exit_code,
        termination=termination,
        termination_reason=reason,
    )


def recovery_manifest(snapshot: SwarmSnapshot) -> dict[str, object]:
    if snapshot.termination != TerminationClass.RECOVERABLE:
        raise ValueError("recovery manifest requires RECOVERABLE snapshot")
    if not snapshot.pending_lanes:
        raise ValueError("recoverable snapshot has no pending lanes")
    return {
        "schema": "qore-harness-recovery-manifest-v1",
        "package_id": snapshot.package_id,
        "start": snapshot.start,
        "tree": snapshot.tree,
        "recovery_generation": snapshot.recovery_generation + 1,
        "inherit_completed_lanes": list(snapshot.completed_lanes),
        "run_only_lanes": list(snapshot.pending_lanes),
        "prohibit_rerun_lanes": list(snapshot.completed_lanes),
        "checkpoint_count": snapshot.checkpoint_count,
        "primary_exit_code": snapshot.primary_exit_code,
        "termination_reason": snapshot.termination_reason,
        "full_qg_allowed": False,
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--checkpoints", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--primary-output", type=Path, required=True)
    parser.add_argument("--primary-exit-code", type=int, required=True)
    parser.add_argument("--package-id", required=True)
    parser.add_argument("--expected-start", required=True)
    parser.add_argument("--expected-tree", required=True)
    parser.add_argument("--recovery-manifest", type=Path)
    args = parser.parse_args()

    snapshot = classify(
        checkpoint_text=args.checkpoints.read_text(encoding="utf-8"),
        primary_output=args.primary_output.read_text(encoding="utf-8") if args.primary_output.exists() else "",
        primary_exit_code=args.primary_exit_code,
        expected_package_id=args.package_id,
        expected_start=args.expected_start,
        expected_tree=args.expected_tree,
    )
    args.output.write_text(json.dumps(snapshot.to_json(), indent=2, sort_keys=True) + "\n", encoding="utf-8")
    if snapshot.termination == TerminationClass.RECOVERABLE and args.recovery_manifest is not None:
        args.recovery_manifest.write_text(
            json.dumps(recovery_manifest(snapshot), indent=2, sort_keys=True) + "\n",
            encoding="utf-8",
        )

    if snapshot.termination == TerminationClass.COMPLETE:
        return 0
    if snapshot.termination == TerminationClass.RECOVERABLE:
        return 75
    if snapshot.termination == TerminationClass.MATERIAL_BLOCKED:
        return 78
    return 2


if __name__ == "__main__":
    raise SystemExit(main())

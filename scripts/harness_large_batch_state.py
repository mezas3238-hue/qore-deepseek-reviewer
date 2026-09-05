#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import os
import re
from dataclasses import dataclass
from pathlib import Path

LANES = tuple(range(1, 7))
STATES = {
    "NOT_STARTED",
    "RUNNING",
    "CHECKPOINTED",
    "COMPLETED",
    "RECOVERY_REQUIRED",
    "MATERIAL_BLOCKED",
}
TERMINAL_STATES = {"COMPLETED", "MATERIAL_BLOCKED"}
LANE_RE = re.compile(
    r"^QORE_LANE_STATE\s+lane=(?P<lane>[1-6])\s+state=(?P<state>[A-Z_]+)(?:\s+generation=(?P<generation>\d+))?\s*$"
)
BINDING_RE = re.compile(
    r"^binding:\s*START=(?P<start>[0-9a-fA-F]{7,64})\s+TREE=(?P<tree>[0-9a-fA-F]{7,64})(?:\s+(?P<annotation>VERIFIED_EXACT|\(unchanged\)|\(UNCHANGED\)))?\s*$"
)
BEGIN = "QORE_CHECKPOINT_BEGIN"
END = "QORE_CHECKPOINT_END"
RECOVERY_DIR_NAME = "qore-harness-recovery-artifact"
RECOVERY_CHECKPOINT_NAME = "harness-engineer-checkpoints.md"


class StateError(RuntimeError):
    pass


@dataclass(frozen=True)
class Snapshot:
    checkpoint_count: int
    lanes: dict[int, str]
    generations: dict[int, int]
    package_id: str | None = None
    start: str | None = None
    tree: str | None = None

    @property
    def completed(self) -> list[int]:
        return [lane for lane in LANES if self.lanes[lane] == "COMPLETED"]

    @property
    def blocked(self) -> list[int]:
        return [lane for lane in LANES if self.lanes[lane] == "MATERIAL_BLOCKED"]

    @property
    def pending(self) -> list[int]:
        return [lane for lane in LANES if self.lanes[lane] not in TERMINAL_STATES]

    @property
    def all_complete(self) -> bool:
        return len(self.completed) == len(LANES)

    def as_dict(self) -> dict[str, object]:
        return {
            "schema": "qore-harness-large-batch-state-v1",
            "checkpoint_count": self.checkpoint_count,
            "package_id": self.package_id,
            "start": self.start,
            "tree": self.tree,
            "lanes": {str(k): self.lanes[k] for k in LANES},
            "lane_generations": {str(k): self.generations[k] for k in LANES},
            "completed_lanes": self.completed,
            "pending_lanes": self.pending,
            "blocked_lanes": self.blocked,
            "all_complete": self.all_complete,
        }


def _checkpoint_blocks(text: str) -> list[list[str]]:
    blocks: list[list[str]] = []
    current: list[str] | None = None
    for raw in text.splitlines():
        stripped = raw.strip()
        if stripped == BEGIN:
            if current is not None:
                raise StateError("nested checkpoint begin")
            current = []
            continue
        if stripped == END:
            if current is None:
                raise StateError("checkpoint end without begin")
            blocks.append(current)
            current = None
            continue
        if current is not None:
            current.append(raw)
        elif stripped.startswith("QORE_LANE_STATE") or stripped.startswith("binding:") or stripped.startswith("package_id:"):
            raise StateError("durable state material exists outside a checkpoint block")
    if current is not None:
        raise StateError("unterminated checkpoint")
    if not blocks:
        raise StateError("checkpoint journal contains no complete checkpoint")
    return blocks


def parse_checkpoint_text(text: str, *, require_binding: bool = False) -> Snapshot:
    blocks = _checkpoint_blocks(text)
    lanes = {lane: "NOT_STARTED" for lane in LANES}
    generations = {lane: 0 for lane in LANES}
    seen_completed: set[int] = set()
    package_id: str | None = None
    start: str | None = None
    tree: str | None = None

    for block in blocks:
        for raw in block:
            stripped = raw.strip()
            if stripped.startswith("package_id:"):
                candidate = stripped.split(":", 1)[1].strip()
                if not candidate:
                    raise StateError("empty package_id in checkpoint")
                if package_id is not None and package_id != candidate:
                    raise StateError("checkpoint package_id binding changed")
                package_id = candidate
                continue

            binding_match = BINDING_RE.match(stripped)
            if binding_match:
                candidate_start = binding_match.group("start").lower()
                candidate_tree = binding_match.group("tree").lower()
                if start is not None and start != candidate_start:
                    raise StateError("checkpoint START binding changed")
                if tree is not None and tree != candidate_tree:
                    raise StateError("checkpoint TREE binding changed")
                start = candidate_start
                tree = candidate_tree
                continue
            if stripped.startswith("binding:"):
                raise StateError(f"invalid checkpoint binding line: {stripped}")

            match = LANE_RE.match(stripped)
            if not match:
                continue
            lane = int(match.group("lane"))
            state = match.group("state")
            if state not in STATES:
                raise StateError(f"unknown lane state for lane {lane}: {state}")
            generation = int(match.group("generation") or generations[lane])
            if generation < generations[lane]:
                raise StateError(f"lane {lane} generation regressed")
            if lane in seen_completed and state != "COMPLETED":
                raise StateError(f"completed lane {lane} regressed to {state}")
            lanes[lane] = state
            generations[lane] = generation
            if state == "COMPLETED":
                seen_completed.add(lane)

    if require_binding and (package_id is None or start is None or tree is None):
        raise StateError("checkpoint journal is missing immutable package/START/TREE binding")

    return Snapshot(
        checkpoint_count=len(blocks),
        lanes=lanes,
        generations=generations,
        package_id=package_id,
        start=start,
        tree=tree,
    )


def parse_checkpoint_file(path: Path) -> Snapshot:
    if not path.is_file():
        raise StateError(f"checkpoint journal missing: {path}")
    return parse_checkpoint_text(path.read_text(encoding="utf-8"), require_binding=True)


def write_initial(path: Path, package_id: str, start: str, tree: str) -> None:
    if path.exists() and path.stat().st_size:
        raise StateError("refusing to overwrite non-empty checkpoint journal")
    lines = [
        BEGIN,
        f"package_id: {package_id}",
        "checkpoint_sequence: 0",
        "phase: HOST_INITIALIZED",
        f"binding: START={start} TREE={tree}",
        "completed: workflow binding, isolated checkout, LSP preflight, and balance preflight reached",
    ]
    lines.extend(
        f"QORE_LANE_STATE lane={lane} state=NOT_STARTED generation=0" for lane in LANES
    )
    lines.extend(
        [
            "PENDING NEXT ACTION: primary Harness verifies binding and starts/inherits the six-lane state machine",
            "SAFE RESUME INSTRUCTION: preserve exact START/TREE and never repeat a lane after it reaches COMPLETED",
            END,
            "",
        ]
    )
    path.write_text("\n".join(lines), encoding="utf-8")


def _discover_recovery_checkpoint() -> Path | None:
    artifact_id = os.environ.get("RECOVERY_ARTIFACT_ID", "0").strip()
    if not artifact_id or artifact_id == "0":
        return None
    runner_temp = os.environ.get("RUNNER_TEMP", "").strip()
    if not runner_temp:
        raise StateError("RECOVERY_ARTIFACT_ID is set but RUNNER_TEMP is unavailable")
    root = Path(runner_temp) / RECOVERY_DIR_NAME
    if not root.is_dir():
        raise StateError(f"recovery artifact directory missing: {root}")
    candidates = sorted(root.rglob(RECOVERY_CHECKPOINT_NAME))
    if len(candidates) != 1:
        raise StateError(
            f"expected exactly one {RECOVERY_CHECKPOINT_NAME} in recovery artifact, found {len(candidates)}"
        )
    return candidates[0]


def _rebind_package_id(text: str, predecessor: str, successor: str) -> str:
    if predecessor == successor:
        return text
    lines: list[str] = []
    changed = 0
    for raw in text.splitlines():
        if raw.strip() == f"package_id: {predecessor}":
            indentation = raw[: len(raw) - len(raw.lstrip())]
            lines.append(f"{indentation}package_id: {successor}")
            changed += 1
        else:
            lines.append(raw)
    if changed == 0:
        raise StateError("recovery journal package binding could not be migrated")
    suffix = "\n" if text.endswith("\n") else ""
    return "\n".join(lines) + suffix


def _restore_recovery_journal(
    destination: Path,
    *,
    package_id: str,
    start: str,
    tree: str,
    source: Path,
) -> Snapshot:
    source_text = source.read_text(encoding="utf-8")
    source_state = parse_checkpoint_text(source_text, require_binding=True)
    expected_start = start.lower()
    expected_tree = tree.lower()
    if source_state.start != expected_start or source_state.tree != expected_tree:
        raise StateError(
            "recovery checkpoint START/TREE mismatch: "
            f"expected {expected_start}/{expected_tree}, got {source_state.start}/{source_state.tree}"
        )
    predecessor = source_state.package_id
    if predecessor is None:
        raise StateError("recovery checkpoint missing predecessor package_id")

    migrated = _rebind_package_id(source_text, predecessor, package_id)
    if migrated and not migrated.endswith("\n"):
        migrated += "\n"

    artifact_id = os.environ.get("RECOVERY_ARTIFACT_ID", "unknown")
    sequence = source_state.checkpoint_count
    lines = [
        BEGIN,
        f"package_id: {package_id}",
        f"checkpoint_sequence: {sequence}",
        "phase: HOST_RECOVERY_IMPORTED",
        f"binding: START={expected_start} TREE={expected_tree}",
        f"evidence: predecessor_package_id={predecessor}",
        f"evidence: recovery_artifact_id={artifact_id}",
        "completed: durable predecessor checkpoint journal imported and exact START/TREE verified",
    ]

    imported_lanes: dict[int, str] = {}
    imported_generations: dict[int, int] = {}
    for lane in LANES:
        state = source_state.lanes[lane]
        generation = source_state.generations[lane]
        if state == "RUNNING":
            state = "RECOVERY_REQUIRED"
            generation += 1
        imported_lanes[lane] = state
        imported_generations[lane] = generation
        lines.append(f"QORE_LANE_STATE lane={lane} state={state} generation={generation}")

    completed = [lane for lane in LANES if imported_lanes[lane] == "COMPLETED"]
    pending = [lane for lane in LANES if imported_lanes[lane] not in TERMINAL_STATES]
    lines.extend(
        [
            f"evidence: inherited_completed_lanes={completed}",
            f"evidence: inherited_pending_lanes={pending}",
            "PENDING NEXT ACTION: resume only pending/recovery-required work under the successor package; preserve completed lanes",
            "SAFE RESUME INSTRUCTION: imported COMPLETED lanes are immutable carry-forward evidence; do not reconstruct or relaunch them",
            END,
            "",
        ]
    )
    destination.write_text(migrated + "\n".join(lines), encoding="utf-8")
    restored = parse_checkpoint_file(destination)
    if restored.package_id != package_id or restored.start != expected_start or restored.tree != expected_tree:
        raise StateError("restored recovery journal failed successor binding verification")
    return restored


def command_snapshot(args: argparse.Namespace) -> int:
    snapshot = parse_checkpoint_file(args.checkpoints)
    print(json.dumps(snapshot.as_dict(), indent=2, sort_keys=True))
    return 0


def command_init(args: argparse.Namespace) -> int:
    recovery = _discover_recovery_checkpoint()
    if recovery is None:
        write_initial(args.checkpoints, args.package_id, args.start, args.tree)
        snapshot = parse_checkpoint_file(args.checkpoints)
    else:
        if args.checkpoints.exists() and args.checkpoints.stat().st_size:
            raise StateError("refusing to overwrite non-empty checkpoint journal during recovery import")
        snapshot = _restore_recovery_journal(
            args.checkpoints,
            package_id=args.package_id,
            start=args.start,
            tree=args.tree,
            source=recovery,
        )
    print(json.dumps(snapshot.as_dict(), sort_keys=True))
    return 0


def main() -> int:
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest="command", required=True)

    init = sub.add_parser("init")
    init.add_argument("--checkpoints", type=Path, required=True)
    init.add_argument("--package-id", required=True)
    init.add_argument("--start", required=True)
    init.add_argument("--tree", required=True)
    init.set_defaults(func=command_init)

    snapshot = sub.add_parser("snapshot")
    snapshot.add_argument("--checkpoints", type=Path, required=True)
    snapshot.set_defaults(func=command_snapshot)

    args = parser.parse_args()
    try:
        return args.func(args)
    except StateError as exc:
        parser.error(str(exc))
        return 2


if __name__ == "__main__":
    raise SystemExit(main())

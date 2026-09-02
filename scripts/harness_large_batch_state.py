#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
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
BEGIN = "QORE_CHECKPOINT_BEGIN"
END = "QORE_CHECKPOINT_END"


class StateError(RuntimeError):
    pass


@dataclass(frozen=True)
class Snapshot:
    checkpoint_count: int
    lanes: dict[int, str]
    generations: dict[int, int]

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
            "lanes": {str(k): self.lanes[k] for k in LANES},
            "lane_generations": {str(k): self.generations[k] for k in LANES},
            "completed_lanes": self.completed,
            "pending_lanes": self.pending,
            "blocked_lanes": self.blocked,
            "all_complete": self.all_complete,
        }


def parse_checkpoint_text(text: str) -> Snapshot:
    begin_count = sum(1 for line in text.splitlines() if line.strip() == BEGIN)
    end_count = sum(1 for line in text.splitlines() if line.strip() == END)
    if begin_count != end_count:
        raise StateError(
            f"checkpoint markers are unbalanced: begin={begin_count} end={end_count}"
        )
    if begin_count < 1:
        raise StateError("checkpoint journal contains no complete checkpoint")

    lanes = {lane: "NOT_STARTED" for lane in LANES}
    generations = {lane: 0 for lane in LANES}
    seen_completed: set[int] = set()

    for raw in text.splitlines():
        match = LANE_RE.match(raw.strip())
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

    return Snapshot(begin_count, lanes, generations)


def parse_checkpoint_file(path: Path) -> Snapshot:
    if not path.is_file():
        raise StateError(f"checkpoint journal missing: {path}")
    return parse_checkpoint_text(path.read_text(encoding="utf-8"))


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
            "PENDING NEXT ACTION: primary Harness verifies binding and starts the six-lane swarm",
            "SAFE RESUME INSTRUCTION: preserve exact START/TREE and never repeat a lane after it reaches COMPLETED",
            END,
            "",
        ]
    )
    path.write_text("\n".join(lines), encoding="utf-8")


def command_snapshot(args: argparse.Namespace) -> int:
    snapshot = parse_checkpoint_file(args.checkpoints)
    print(json.dumps(snapshot.as_dict(), indent=2, sort_keys=True))
    return 0


def command_init(args: argparse.Namespace) -> int:
    write_initial(args.checkpoints, args.package_id, args.start, args.tree)
    print(json.dumps(parse_checkpoint_file(args.checkpoints).as_dict(), sort_keys=True))
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

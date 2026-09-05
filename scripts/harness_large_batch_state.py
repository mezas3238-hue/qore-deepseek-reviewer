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
    "DISPATCHING",
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
SUBAGENT_RE = re.compile(
    r"^QORE_SUBAGENT_STATE\s+lane=(?P<lane>[1-6])\s+id=(?P<identity>[A-Za-z0-9._:@+-]{1,128})\s+state=(?P<state>[A-Z_]+)(?:\s+generation=(?P<generation>\d+))?\s*$"
)
BINDING_RE = re.compile(
    r"^binding:\s*START=(?P<start>[0-9a-fA-F]{7,64})\s+TREE=(?P<tree>[0-9a-fA-F]{7,64})(?:\s+(?P<annotation>VERIFIED_EXACT|\(unchanged\)|\(UNCHANGED\)))?\s*$"
)
INTERNAL_EXPERT_CLEAN = "HARNESS_INTERNAL_EXPERT_STATUS: CLEAN"
DUAL_ROLE_COMPLETE = (
    "HARNESS_DUAL_ROLE_STATUS: ENGINEER_COMPLETE + INTERNAL_EXPERT_CLEAN"
)
DUAL_ROLE_PREFIXES = (
    "HARNESS_INTERNAL_EXPERT_STATUS:",
    "HARNESS_DUAL_ROLE_STATUS:",
)
HARNESS_ENGINEER_PACKAGE_PREFIX = "HARNESS-ENGINEER-"
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
    subagent_ids: dict[int, str | None]
    subagent_states: dict[int, str]
    subagent_generations: dict[int, int]
    package_id: str | None = None
    start: str | None = None
    tree: str | None = None
    internal_expert_clean: bool = False
    dual_role_complete: bool = False

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
    def completed_subagents(self) -> list[int]:
        return [lane for lane in LANES if self.subagent_states[lane] == "COMPLETED"]

    @property
    def all_subagents_complete(self) -> bool:
        identities = [self.subagent_ids[lane] for lane in LANES]
        return (
            len(self.completed_subagents) == len(LANES)
            and all(
                identity is not None and not identity.startswith("UNASSIGNED-")
                for identity in identities
            )
            and len(set(identities)) == len(LANES)
        )

    @property
    def dual_role_required(self) -> bool:
        return bool(
            self.package_id
            and self.package_id.startswith(HARNESS_ENGINEER_PACKAGE_PREFIX)
        )

    @property
    def dual_role_gate_passed(self) -> bool:
        return self.internal_expert_clean and self.dual_role_complete

    @property
    def all_complete(self) -> bool:
        mechanical_swarm_complete = (
            len(self.completed) == len(LANES) and self.all_subagents_complete
        )
        if not mechanical_swarm_complete:
            return False
        if self.dual_role_required:
            return self.dual_role_gate_passed
        return True

    def as_dict(self) -> dict[str, object]:
        return {
            "schema": "qore-harness-large-batch-state-v3-dual-role-internal-expert",
            "checkpoint_count": self.checkpoint_count,
            "package_id": self.package_id,
            "start": self.start,
            "tree": self.tree,
            "lanes": {str(k): self.lanes[k] for k in LANES},
            "lane_generations": {str(k): self.generations[k] for k in LANES},
            "subagent_ids": {str(k): self.subagent_ids[k] for k in LANES},
            "subagent_states": {str(k): self.subagent_states[k] for k in LANES},
            "subagent_generations": {
                str(k): self.subagent_generations[k] for k in LANES
            },
            "completed_lanes": self.completed,
            "pending_lanes": self.pending,
            "blocked_lanes": self.blocked,
            "completed_subagent_lanes": self.completed_subagents,
            "all_subagents_complete": self.all_subagents_complete,
            "dual_role_required": self.dual_role_required,
            "internal_expert_clean": self.internal_expert_clean,
            "dual_role_complete": self.dual_role_complete,
            "dual_role_gate_passed": self.dual_role_gate_passed,
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
        elif (
            stripped.startswith("QORE_LANE_STATE")
            or stripped.startswith("QORE_SUBAGENT_STATE")
            or stripped.startswith("binding:")
            or stripped.startswith("package_id:")
            or any(stripped.startswith(prefix) for prefix in DUAL_ROLE_PREFIXES)
        ):
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
    subagent_ids: dict[int, str | None] = {lane: None for lane in LANES}
    subagent_states = {lane: "NOT_STARTED" for lane in LANES}
    subagent_generations = {lane: 0 for lane in LANES}
    seen_completed: set[int] = set()
    seen_completed_subagents: set[int] = set()
    completed_identity_owner: dict[str, int] = {}
    package_id: str | None = None
    start: str | None = None
    tree: str | None = None
    internal_expert_clean = False
    dual_role_complete = False

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

            if stripped.startswith("HARNESS_INTERNAL_EXPERT_STATUS:"):
                if stripped != INTERNAL_EXPERT_CLEAN:
                    raise StateError(
                        f"invalid internal Expert terminal status: {stripped}"
                    )
                internal_expert_clean = True
                continue

            if stripped.startswith("HARNESS_DUAL_ROLE_STATUS:"):
                if stripped != DUAL_ROLE_COMPLETE:
                    raise StateError(f"invalid Harness dual-role terminal status: {stripped}")
                dual_role_complete = True
                continue

            match = LANE_RE.match(stripped)
            if match:
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
                continue

            subagent_match = SUBAGENT_RE.match(stripped)
            if subagent_match:
                lane = int(subagent_match.group("lane"))
                identity = subagent_match.group("identity")
                state = subagent_match.group("state")
                if state not in STATES:
                    raise StateError(f"unknown subagent state for lane {lane}: {state}")
                generation = int(
                    subagent_match.group("generation") or subagent_generations[lane]
                )
                if generation < subagent_generations[lane]:
                    raise StateError(f"subagent lane {lane} generation regressed")
                if lane in seen_completed_subagents:
                    if state != "COMPLETED":
                        raise StateError(
                            f"completed subagent for lane {lane} regressed to {state}"
                        )
                    if subagent_ids[lane] != identity:
                        raise StateError(
                            f"completed subagent identity for lane {lane} changed"
                        )
                if state == "COMPLETED" and not identity.startswith("UNASSIGNED-"):
                    owner = completed_identity_owner.get(identity)
                    if owner is not None and owner != lane:
                        raise StateError(
                            f"subagent identity {identity} reused across lanes {owner} and {lane}"
                        )
                    completed_identity_owner[identity] = lane
                subagent_ids[lane] = identity
                subagent_states[lane] = state
                subagent_generations[lane] = generation
                if state == "COMPLETED":
                    seen_completed_subagents.add(lane)
                continue

    if require_binding and (package_id is None or start is None or tree is None):
        raise StateError(
            "checkpoint journal is missing immutable package/START/TREE binding"
        )

    return Snapshot(
        checkpoint_count=len(blocks),
        lanes=lanes,
        generations=generations,
        subagent_ids=subagent_ids,
        subagent_states=subagent_states,
        subagent_generations=subagent_generations,
        package_id=package_id,
        start=start,
        tree=tree,
        internal_expert_clean=internal_expert_clean,
        dual_role_complete=dual_role_complete,
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
    for lane in LANES:
        lines.append(f"QORE_LANE_STATE lane={lane} state=NOT_STARTED generation=0")
        lines.append(
            f"QORE_SUBAGENT_STATE lane={lane} id=UNASSIGNED-{lane} state=NOT_STARTED generation=0"
        )
    lines.extend(
        [
            "PENDING NEXT ACTION: primary Harness verifies binding and starts/inherits the six-lane six-subagent state machine; Harness dual-role gate is not yet satisfied",
            "SAFE RESUME INSTRUCTION: preserve exact START/TREE and never repeat a lane after it reaches COMPLETED; candidate-ready requires final Internal Expert CLEAN evidence",
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
    imported_subagent_states: dict[int, str] = {}
    imported_subagent_generations: dict[int, int] = {}
    for lane in LANES:
        state = source_state.lanes[lane]
        generation = source_state.generations[lane]
        if state in {"RUNNING", "DISPATCHING"}:
            state = "RECOVERY_REQUIRED"
            generation += 1
        imported_lanes[lane] = state
        imported_generations[lane] = generation
        lines.append(f"QORE_LANE_STATE lane={lane} state={state} generation={generation}")

        subagent_state = source_state.subagent_states[lane]
        subagent_generation = source_state.subagent_generations[lane]
        subagent_identity = source_state.subagent_ids[lane] or f"UNASSIGNED-{lane}"
        if subagent_state in {"RUNNING", "DISPATCHING"}:
            subagent_state = "RECOVERY_REQUIRED"
            subagent_generation += 1
        imported_subagent_states[lane] = subagent_state
        imported_subagent_generations[lane] = subagent_generation
        lines.append(
            f"QORE_SUBAGENT_STATE lane={lane} id={subagent_identity} "
            f"state={subagent_state} generation={subagent_generation}"
        )

    completed = [lane for lane in LANES if imported_lanes[lane] == "COMPLETED"]
    pending = [lane for lane in LANES if imported_lanes[lane] not in TERMINAL_STATES]
    completed_subagents = [
        lane for lane in LANES if imported_subagent_states[lane] == "COMPLETED"
    ]
    lines.extend(
        [
            f"evidence: inherited_completed_lanes={completed}",
            f"evidence: inherited_pending_lanes={pending}",
            f"evidence: inherited_completed_subagent_lanes={completed_subagents}",
            f"evidence: inherited_internal_expert_clean={source_state.internal_expert_clean}",
            f"evidence: inherited_dual_role_complete={source_state.dual_role_complete}",
            "PENDING NEXT ACTION: resume only pending/recovery-required work under the successor package; preserve completed lanes/subagents; if final candidate mutates, rerun Internal Expert before candidate-ready",
            "SAFE RESUME INSTRUCTION: imported COMPLETED lanes/subagents are immutable carry-forward evidence; dual-role CLEAN is valid only for the unchanged inherited candidate",
            END,
            "",
        ]
    )
    destination.write_text(migrated + "\n".join(lines), encoding="utf-8")
    restored = parse_checkpoint_file(destination)
    if (
        restored.package_id != package_id
        or restored.start != expected_start
        or restored.tree != expected_tree
    ):
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
            raise StateError(
                "refusing to overwrite non-empty checkpoint journal during recovery import"
            )
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

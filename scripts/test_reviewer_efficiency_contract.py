#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXPERT = ROOT / "harness/reviewer/prompts/qore-deepseek-expert-swarm-v1.md"
CODER = ROOT / "harness/reviewer/prompts/qore-deepseek-coder-swarm-v1.md"
HARNESS = ROOT / "harness/engineer/prompts/qore-harness-engineer-v2.md"
POLICY = ROOT / "harness/docs/QORE-REVIEW-EFFICIENCY-NO-QUALITY-LOSS-V1.md"

COMMON_REQUIRED = (
    "SHARED_EVIDENCE_MAP",
    "CAUSAL_FAMILY_LEDGER",
    "EFFICIENCY != REDUCED COVERAGE",
    "COMPACTION != EVIDENCE LOSS",
    "DEDUPLICATION != WITNESS LOSS",
    "SMART STOP != EARLY PASS",
    "findReferences",
    "goToDefinition",
    "goToImplementation",
    "hover",
    "HIGH",
    "MAX",
    "QORE_CHECKPOINT_BEGIN",
    "QORE_CHECKPOINT_END",
    "## EFFICIENCY SUMMARY",
)

EXPERT_REQUIRED = (
    "contract-falsifier",
    "security-red-team",
    "history-regression",
    "property-metamorphic",
    "cross-interaction",
    "Root-family falsification gate",
    "## ROOT-FAMILY FALSIFICATION",
    "five-subagent swarm",
    "VALIDACIÓN OK",
)

CODER_REQUIRED = (
    "implementation-integrity",
    "test-quality",
    "lsp-impact",
    "maintainability-regression",
    "Independent implementation gate",
    "## IMPLEMENTATION AUDIT",
    "four-subagent swarm",
    "VALIDACIÓN OK",
)

HARNESS_REQUIRED = (
    "Exactly six distinct logical lanes",
    "SHARED_EVIDENCE_MAP SNAPSHOT",
    "CAUSAL_FAMILY_LEDGER SNAPSHOT",
    "Root-Family Exhaustion",
    "CANDIDATE_READY_FOR_EXTERNAL_QG",
    "Completed lanes are durable carry-forward evidence",
    "semantic `lsp`",
)

POLICY_REQUIRED = (
    "GREEN QG != SEMANTIC CLEAN",
    "INDEPENDENT EVIDENCE != DUPLICATE WORK",
    "Full synthesis preserved",
    "Harness adoption is ACTIVE",
    "compact-latest-checkpoint",
)


def require(path: Path, markers: tuple[str, ...]) -> None:
    text = path.read_text(encoding="utf-8")
    missing = [marker for marker in markers if marker not in text]
    if missing:
        raise SystemExit(f"{path.relative_to(ROOT)} missing required markers: {missing!r}")


def main() -> int:
    require(EXPERT, COMMON_REQUIRED + EXPERT_REQUIRED)
    require(CODER, COMMON_REQUIRED + CODER_REQUIRED)
    require(HARNESS, COMMON_REQUIRED + HARNESS_REQUIRED)
    require(POLICY, COMMON_REQUIRED[:4] + POLICY_REQUIRED)
    print("reviewer/Harness efficiency-no-quality-loss contract: PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

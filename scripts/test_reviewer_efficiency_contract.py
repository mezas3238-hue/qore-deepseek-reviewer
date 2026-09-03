#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXPERT = ROOT / "harness/reviewer/prompts/qore-deepseek-expert-swarm-v1.md"
CODER = ROOT / "harness/reviewer/prompts/qore-deepseek-coder-swarm-v1.md"
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
    "VALIDACIÓN OK",
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
)

CODER_REQUIRED = (
    "implementation-integrity",
    "test-quality",
    "lsp-impact",
    "maintainability-regression",
    "Independent implementation gate",
    "## IMPLEMENTATION AUDIT",
    "four-subagent swarm",
)

POLICY_REQUIRED = (
    "GREEN QG != SEMANTIC CLEAN",
    "INDEPENDENT EVIDENCE != DUPLICATE WORK",
    "Full synthesis preserved",
    "Harness adoption gate",
)


def require(path: Path, markers: tuple[str, ...]) -> None:
    text = path.read_text(encoding="utf-8")
    missing = [marker for marker in markers if marker not in text]
    if missing:
        raise SystemExit(f"{path.relative_to(ROOT)} missing required markers: {missing!r}")


def main() -> int:
    require(EXPERT, COMMON_REQUIRED + EXPERT_REQUIRED)
    require(CODER, COMMON_REQUIRED + CODER_REQUIRED)
    require(POLICY, COMMON_REQUIRED[:4] + POLICY_REQUIRED)
    print("reviewer efficiency/no-quality-loss contract: PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

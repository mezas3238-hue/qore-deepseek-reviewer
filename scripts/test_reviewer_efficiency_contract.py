#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXPERT = ROOT / "harness/reviewer/prompts/qore-deepseek-expert-swarm-v1.md"
CODER = ROOT / "harness/reviewer/prompts/qore-deepseek-coder-swarm-v1.md"
HARNESS = ROOT / "harness/engineer/prompts/qore-harness-engineer-v2.md"
POLICY = ROOT / "harness/docs/QORE-REVIEW-EFFICIENCY-NO-QUALITY-LOSS-V1.md"

REVIEWER_COMMON_REQUIRED = (
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

# Harness v3 deliberately supersedes the old prose-shape markers. The efficiency
# contract now certifies stronger semantic closure properties instead of requiring
# wording from the pre-v3 prompt.
HARNESS_REQUIRED = (
    "SHARED_EVIDENCE_MAP",
    "CAUSAL_FAMILY_LEDGER",
    "EFFICIENCY != REDUCED COVERAGE",
    "COMPACTION != EVIDENCE LOSS",
    "DEDUPLICATION != WITNESS LOSS",
    "SMART STOP != EARLY PASS",
    "Exactly six logical lanes",
    "FULL_FAMILY_RECERTIFICATION",
    "FAMILY_MODEL",
    "MATERIAL_GAP",
    "L1–L5",
    "L6",
    "POST-IMPLEMENTATION INDEPENDENT SELF-FALSIFICATION",
    "fresh adversarial subagent/context",
    "did NOT propose or implement the patch",
    "RECURRENT FAMILY RECERTIFICATION MATRIX",
    "CANDIDATE_READY_FOR_EXTERNAL_QG",
    "Completed work is durable carry-forward evidence",
    "Semantic LSP",
    "findReferences",
    "goToDefinition",
    "goToImplementation",
    "hover",
    "HIGH",
    "MAX",
    "Root-Family Exhaustion",
    "## SELF-FALSIFICATION GATE",
    "## EFFICIENCY SUMMARY",
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
    require(EXPERT, REVIEWER_COMMON_REQUIRED + EXPERT_REQUIRED)
    require(CODER, REVIEWER_COMMON_REQUIRED + CODER_REQUIRED)
    require(HARNESS, HARNESS_REQUIRED)
    require(POLICY, REVIEWER_COMMON_REQUIRED[:4] + POLICY_REQUIRED)
    print("reviewer/Harness efficiency-no-quality-loss contract v3: PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

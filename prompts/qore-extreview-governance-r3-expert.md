Review qore-core PR #445 as DeepSeek Expert. Adversarial, evidence-bound, no style findings.

FROZEN QORE BINDING
BASE 537e8ad0a73ec2dabfff381675920b910581c879
HEAD 7ff81c412a53cd62a6acd7eab7459d8f1cfa0fc5
SYNTHETIC a243bb309ccb2e128656260c1ba3943b30cc395f
HEAD/SYNTHETIC tree faa9e10fe3536cfe8f0f99a8faa009f8391db9bf
CI QORE #1423 SUCCESS.
Delta BASE→HEAD exactly 2 files / +267/-0:
- docs/constitution/QORE-CONSTITUTION-v1.0.md +4
- docs/constitution/QORE-EXTERNAL-REVIEW-GOVERNANCE-v1.0.md +263

PREVIOUS REVIEW / IA
R1 findings #1 self-certification, #2 stable-ID ambiguity, #3 missing meter/entrypoint/workflow IDs: independently reproduced VALID and fixed. R2 confirmed all three closed, but blocked on live reviewer evidence and found one new VALID gap: governance called evidence-path profile-defining without concrete identifiers/bootstrap detection.
R2 package: QORE-EXTREVIEW-GOV-R2-DS-EXPERT-01, review id 5013944660.
IA reproduced the R2 witness: unchanged meter/entrypoint/model/workflows could otherwise hide evidence-path drift.

R3 FIX TO FALSIFY
Core now pins an external immutable profile manifest by exact path+blob and also states the concrete evidence contract/tools. The reviewer manifest itself has no activation authority; Core's pinned blob is authoritative. Bootstrap must compare manifest blob plus every component blob, exact 3 workflows, call path and evidence semantics before dispatch.

LIVE REVIEWER SNAPSHOT / PACKAGE EVIDENCE
Immediately before this R3 prompt commit, reviewer main was 76585a9c4ad04301fb4a2164fc092937aef0e3da. Its only change since the completed R2 dispatch commit e96452c0b049f7994eb7058037b83aee75873608 is ADD profiles/QORE-DEEPSEEK-V2.1.1-STABLE.json; no engine/workflow/request file changed in that commit.
Stable manifest path: profiles/QORE-DEEPSEEK-V2.1.1-STABLE.json
Stable manifest blob: 14db06a4a8014f7af114d9832f11542c70ddb28c
Manifest critical content:
- profile_id QORE-DEEPSEEK-V2.1.1-STABLE; status stable; model deepseek-v4-pro; analysis thinking/high; same-model non-thinking extractor; flash=false; cot_continuation=false.
- mandatory evidence: complete exact BASE→HEAD changed files; exact modified-file patches; deterministic local qore.infrastructure dependency slices with bounded helpers; frozen repo/PR/HEAD checks/status.
- planner: one bounded non-thinking planning call; exact tools [read_file, search_text, git_show, github_get]; search backend git grep -n -F -I; read-only qore-core authority; no silent pre-clipping; missing/truncated evidence blocks.
- meter scripts/run_review_with_meter.py blob a72c38c90d987d225caf90f8f797e2193b664561.
- engine blobs pinned by manifest:
  scripts/deepseek_reviewer.py=a93e5717ae494825d40abb8fde9fc9b7d52e9142
  scripts/deepseek_reviewer_budgeted.py=c6ff7604937542a08d33a6c9970d94d4c352dacb
  scripts/deepseek_reviewer_quality_guarded.py=7a335b6dfcc6f3231ac4817f6bf40cb4c4653dd8
  scripts/deepseek_reviewer_compat_entrypoint.py=07ef1bb29620e15ae34def3a0b0099bdb2370fc0
  scripts/deepseek_reviewer_v2_entrypoint.py=d96f44f01770893867df4da3d5744295c952f9b0
  scripts/deepseek_reviewer_v1_3_entrypoint.py=12e89476fb141dbc9b47b42180091000b1169299
  scripts/deepseek_reviewer_v1_4_entrypoint.py=a932ad91faea08e7d391cd12fbfc2bafab140760
  scripts/deepseek_reviewer_v1_5_entrypoint.py=2ee30420a4016d485fa8e967cca18f30bc9b6b49
  scripts/deepseek_reviewer_v1_6_entrypoint.py=4835cf05d68495dda5ee369b69fa227aac2aa6a6
  scripts/deepseek_reviewer_v1_7_entrypoint.py=a65acafe65556056663d8c5d222c8abea4be84a6
  scripts/deepseek_reviewer_v2_0_entrypoint.py=1d80422bb1182468e0e59304268bb3c7768e69a8
  scripts/deepseek_reviewer_v2_1_entrypoint.py=aeeb8f3eda950d2552021d83b4ca523b0be0002d
  scripts/deepseek_reviewer_v2_1_1_entrypoint.py=54c4b77c646b84b09706dba0caf1d5a4d4ea00e0
- workflows pinned exactly:
  .github/workflows/deepseek-auto-dispatch.yml=b7b04e73a53a6cbc1e0475dec0ded8fdf74c4c2c
  .github/workflows/deepseek-connection-test.yml=251c342e691fefe433282a24d74af40004ef8f72
  .github/workflows/deepseek-qore-review.yml=fa02813e2360d1e576330056a878ade71b4520e2
  permanent_workflow_count=3.
Observed live call-path facts at that snapshot:
- meter selects Path(__file__).with_name("deepseek_reviewer_v2_1_1_entrypoint.py").
- V2.1.1 blob imports V2.0, installs only the V2.1 compatibility shim, imports V2.1 and main() delegates to v21.main().
- V2.0 explicitly keeps V1.7 evidence path unchanged; V1.7 exact tools use git grep and reject GitHub endpoints outside qore-core.
- qore-review workflow invokes scripts/run_review_with_meter.py and DEEPSEEK_MODEL=deepseek-v4-pro.
- workflow directory contained exactly the three pinned workflow names.

DISPATCH-BOUNDARY RULE FOR THIS PACKAGE
The next reviewer commit after this prompt will be exactly one requests/current.json update for package QORE-EXTREVIEW-GOV-R3-DS-EXPERT-01; auto-dispatch is path-triggered by that request. Treat prompt/request commits as metadata only, but fail closed if the package/runtime evidence supplied to you indicates any profile-manifest/component/workflow drift. Do not demand that reviewer main SHA remain fixed: the governance explicitly allows metadata commits while pinning semantic blobs.

ADVERSARIAL FOCUS
1. Re-test R1 findings #1–#3 under future constructible states.
2. Re-test R2 evidence-path drift finding: can any profile-defining evidence behavior change without manifest/component mismatch detectable by bootstrap?
3. Does pinning a reviewer-hosted manifest preserve qore-core/main as activation authority, or create a circular/self-certification loophole?
4. Does the manifest cover the actual executable evidence lineage sufficiently, including base/budget/quality/compat/V2 semantic slices/V1.3 planner/V1.7 exact tools/V2.0/V2.1/V2.1.1?
5. Are exact planner tools, git-grep backend, qore-core-only read authority and fail-closed truncation unambiguous?
6. Can normal prompt/request/dispatch metadata move reviewer main without falsely changing the stable profile, while semantic drift still blocks?
7. Can a successor activate before independent validation + Claude + explicit Core governance protected merge?
8. ONE package→ONE dispatch→ONE job remains precise.
9. Token budgets never authorize quality downgrade.
10. Core gains no DeepSeek runtime/API key/workflow/provider dependency and no Production/real-capital authority.

Only material findings with exact location, constructible witness, expected, actual, violated invariant, impact, minimum bounded fix. Do not report preferences. If evidence is genuinely insufficient, identify the exact missing item rather than requesting a broad dump.

Clean ending exactly:
HALLAZGOS: NINGUNO
VALIDACIÓN OK

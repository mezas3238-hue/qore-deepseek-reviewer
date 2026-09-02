# QORE PR #478 — DeepSeek Expert R1 — recovered 31-Trader capability inventory

## Mission
Independently audit the exact frozen docs-only recovery candidate for PR #478. The objective is not to design or implement traders. Determine whether the recovered 31-Trader capability inventory is materially truthful, internally consistent, appropriately fail-closed, and safe to integrate as the governing engineering inventory for the next DEMO/Trader-Lab work.

## Frozen candidate
- qore-core PR: #478
- BASE: `5a158ef0fb2e21db95f2be0685373780bf1ab197`
- BASE TREE: `5e2b37b23b01fe23fd373d39b01573e9607a73ad`
- HEAD: `bdeb7525a1249f4f328bc618249f1df80c804f56`
- HEAD TREE: `67c77fbe016b6688e5114165a5a14c3026832027`
- SYNTHETIC: `6ea11290b501c4276a4da7db0d8ea01668042e3b`
- SYNTHETIC TREE: `67c77fbe016b6688e5114165a5a14c3026832027`
- changed file only: `docs/audits/QORE-TRADER-CATALOG-31-CAPABILITY-INVENTORY-001.md`
- diff: +195/-0; no src/tests delta.

## Exact quality gate
QORE CI run `33681607355`, job `100419247337`: SUCCESS.
- ruff PASS
- mypy PASS: 740 source files
- pytest: 4862 collected / 4862 passed / 7 warnings
- coverage: 47568 statements / 6234 missed / 87%

## Recovery provenance
Harness Batch 003 run `33676959961`, artifact `9865600957`, performed the 31×N inventory. Its model generation exited 0 and all six unpublished lanes reached COMPLETED. The workflow later failed because checkpoint publication rejected the non-semantic suffix `VERIFIED_EXACT`. Do not require or recommend rerunning those six lanes merely because publication failed.

Integration Authority did NOT copy the raw Harness report blindly. It corrected the raw VT-30 classification after checking live Core evidence:
`VT-30 Trader Midpoints = SUPPORTING_INFRA_PRESENT / CONCRETE_EVALUATOR_ABSENT / TRADER_LAB_NOT_YET_PASSED`.
The supporting evidence family includes native-BID/market-observation provenance, deterministic market-event replay, and DST-aware market-clock infrastructure. Audit whether the candidate states this distinction without overstating implementation.

## Governing decisions that must be evaluated, not silently weakened
1. All 31 named Traders are inventory scope.
2. Every one of the 31 must individually pass Trader Lab before DEMO admission.
3. `NO DEMO_ELIGIBLE -> NO DEMO ADMISSION`.
4. First DEMO target is five traders, currently VT-01, VT-08, VT-09, VT-17, VT-31, but only if each individually becomes DEMO_ELIGIBLE. If fewer qualify, use fewer; never lower standards to fill five seats.
5. VT-20..VT-28 synthetic traders stay provider-capability blocked until real instrument/provider evidence exists.
6. Methodology prose/qualitative terms must be formalized or explicitly classified before code; no silent invention.
7. Confidence weights are methodology scores, not calibrated probabilities.
8. CIBO cannot bypass Trader Lab or Risk.
9. DEMO evidence grants no Production authority.

## Adversarial focus
Inspect the changed audit and relevant repository evidence using semantic LSP/search where useful. Look specifically for:
- false claims that a concrete 31-Trader evaluator already exists or does not exist;
- incorrect classification of VT-30 supporting infrastructure versus evaluator readiness;
- contradictions with existing research/replay/market-clock/execution/risk contracts;
- a claim that could accidentally authorize DEMO, Production or CIBO bypass;
- unsupported claims about provider/timeframe availability;
- missing dependency that makes the proposed first-five target misleading as an engineering target;
- inventory gaps/duplicate identities/misnumbering across VT-01..VT-31;
- wording that turns an audit/planning document into executable authority;
- loss of the distinction IMPLEMENTED != LAB PASS != DEMO_ELIGIBLE != PROFITABLE;
- any material reason this docs-only candidate should not be integrated.

Do not treat a future implementation gap as a defect merely because the audit explicitly records it as a gap. Do not demand concrete trader implementation in this docs-only recovery PR.

## Required verdict
Return exactly one primary disposition:
- `NONE / VALIDATION OK`
- `MATERIAL FINDING`
- `EVIDENCE INSUFFICIENT / VALIDATION BLOCKED`

For every finding provide severity, exact file/section, claim or invariant affected, repository evidence, reproducibility, and smallest safe correction. Distinguish factual defects from optional improvements.

End with durable memory fields:
- WHAT DONE
- FOUND
- CLOSED
- REMAINS
- WHERE RESUME

No edits. No Production authority. No real-capital action.
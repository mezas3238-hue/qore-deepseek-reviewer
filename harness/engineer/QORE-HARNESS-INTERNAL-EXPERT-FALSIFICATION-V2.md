# QORE HARNESS INTERNAL EXPERT FALSIFICATION PROTOCOL V2

## Status

MANDATORY GLOBAL ADDENDUM for every Harness Engineer package that uses `HARNESS_INTERNAL_EXPERT_MODE`.

This protocol strengthens, and does not remove, the dual-role one-shot policy. Engineer Mode remains responsible for implementation. Internal Expert Mode remains mandatory. External Expert remains independent.

## Problem being corrected

A nominal `HARNESS_INTERNAL_EXPERT_STATUS: CLEAN` is not sufficient evidence of semantic closure. Internal Expert can fail if it inherits Engineer Mode's assumptions, replays the same tests, or merely reviews the implementation rationale instead of reconstructing the causal family independently.

Therefore:

`INTERNAL EXPERT CLEAN != SELF-CONFIRMATION`

`CLEAN REQUIRES INDEPENDENT RECONSTRUCTION + NOVEL PROBES + DIFFERENTIAL COVERAGE + EXACT PATCH BINDING`

## IE-0 — Exact candidate freeze

Before Internal Expert begins, refresh the recovery patch and compute its SHA256. Internal Expert reviews that exact patch. Any semantic code/test mutation after the clean pass invalidates the clean evidence and requires a new Internal Expert pass.

## IE-1 — Blind independent reconstruction

The fresh Internal Expert challenger MUST begin from:
- the exact candidate;
- the task's semantic invariants/authority laws;
- accepted historical counterexamples/regression laws;
- reachable code/contracts needed to reason about the family.

The challenger MUST NOT be given Engineer Mode's implementation rationale, claimed closure argument, or FAMILY_MODEL as proof before it creates its own `INTERNAL_EXPERT_FAMILY_MODEL`.

It may inspect the exact candidate and repository normally. The purpose is not artificial ignorance of code; the purpose is to prevent Engineer Mode's reasoning from becoming the challenger's search boundary.

The independent model must derive:
- decision-changing dimensions;
- equivalence classes;
- alternate callers/paths;
- transforms/normalizations;
- false-positive and false-negative partitions;
- retained/replay/type/trust boundaries where reachable;
- material cross-interactions;
- bounded spaces suitable for enumeration;
- unbounded spaces suitable for property/metamorphic testing.

## IE-2 — Novel probe campaign

Known witnesses are regression seeds, not sufficient falsification.

The final candidate MUST be attacked with a new deterministic probe campaign. Baseline minimum evidence for a material Harness family is:
- at least 24 novel adversarial probe cases;
- at least 12 benign/negative controls;
- at least 12 cross-interaction probes.

These are test/probe cases, not model calls. Prefer programmatic generation, bounded enumeration, property/metamorphic tests and deterministic representative partitions over verbose manual reasoning.

For security/Unicode/normalization/parsing/authority families, the challenger should exceed these minima whenever the bounded family model makes that practical.

A large raw count does not substitute for dimension coverage. Probes must map back to the independent family model.

## IE-3 — Differential family-model gate

Only after the blind independent model and novel probes exist may Internal Expert compare:

`INTERNAL_EXPERT_FAMILY_MODEL` vs `ENGINEER FAMILY_MODEL`.

Any decision-changing dimension, equivalence class, caller/path, transform, benign partition or material interaction present in the independent model but absent or insufficiently covered in Engineer Mode is a `COVERAGE_DELTA`.

`COVERAGE_DELTA != NONE` means Internal Expert is NOT CLEAN.

Required action:
1. persist the delta and witness/property;
2. return to Engineer Mode inside the SAME work package;
3. repair/generalize the complete affected class;
4. rerun affected tests/LSP;
5. refresh the patch;
6. instantiate a new fresh blind Internal Expert challenger against the mutated candidate.

## IE-4 — False-positive / false-negative symmetry

Every security/input/normalization detector must be attacked symmetrically:
- bypass/fail-open cases;
- overblocking/fail-closed false positives;
- ordinary prose/benign controls;
- alternate scripts/classes/transforms where semantically relevant;
- boundary punctuation/separators/delimiters;
- composition/decomposition/casefold/normalization interactions where applicable.

A fix that closes one witness while opening a benign regression is material failure.

## IE-5 — External-escape regression corpus

Every material defect previously found by External Expert after an Internal Expert CLEAN becomes permanent Internal Expert regression seed evidence.

The challenger must generalize each escape to its causal class rather than replaying only the literal witness.

A recurrent escape class is evidence that the independent family model is still incomplete.

## IE-6 — Final cross-path and LSP challenge

Before CLEAN, perform a final exact-candidate recheck of modified symbols and materially affected callers with semantic LSP. Rechallenge alternate reachable paths, retained/replay boundaries, runtime type/trust-root edges and integration surfaces where applicable.

## IE-7 — Host-verifiable CLEAN evidence

The final clean checkpoint MUST contain exactly one complete evidence block for the exact final patch:

`QORE_INTERNAL_EXPERT_EVIDENCE_BEGIN`

`internal_expert_protocol=BLIND_DIFFERENTIAL_FALSIFICATION_V2`

`candidate_patch_sha256=<64-lowercase-hex>`

`independent_family_model=COMPLETE`

`engineer_rationale_seen_before_blind_model=false`

`novel_probe_count=<integer >= 24>`

`benign_control_count=<integer >= 12>`

`cross_interaction_probe_count=<integer >= 12>`

`coverage_delta=NONE`

`material_findings=0`

`lsp_final_recheck=COMPLETE`

`QORE_INTERNAL_EXPERT_EVIDENCE_END`

followed in the same complete checkpoint by:

`HARNESS_INTERNAL_EXPERT_STATUS: CLEAN`

`HARNESS_DUAL_ROLE_STATUS: ENGINEER_COMPLETE + INTERNAL_EXPERT_CLEAN`

`HARNESS_HANDOFF_TARGET: EXTERNAL_EXPERT_EXPECTED_PASS`

The host MUST compute the actual candidate patch SHA256 and reject the handoff if it differs from `candidate_patch_sha256`.

The host MUST also reject CLEAN when any baseline count is below the minimum, the blind model is incomplete, Engineer rationale contaminated the blind reconstruction, `coverage_delta != NONE`, material findings remain, or LSP final recheck is incomplete.

## Efficiency law

This protocol is intended to improve quality without adding another paid agent.

`MORE TOKENS != BETTER FALSIFICATION`

Prefer deterministic generated probes, partition matrices and executable properties. Do not spend long narrative reasoning where a bounded program can enumerate the family.

Completed Engineer lanes and prior durable evidence remain reusable. Internal Expert should spend its effort on independent challenge and coverage delta, not repeat broad discovery already proven irrelevant.

## Final law

`INTERNAL EXPERT DOES NOT CERTIFY THE ENGINEER'S ARGUMENT.`

`INTERNAL EXPERT RECONSTRUCTS THE PROBLEM INDEPENDENTLY, ATTACKS THE EXACT PATCH, AND EARNS CLEAN ONLY WHEN THE TWO MODELS HAVE NO MATERIAL COVERAGE DELTA.`

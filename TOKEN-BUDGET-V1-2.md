# QORE DeepSeek Token Budget V1.2

## Measured reason for V1.2

R1D (`UNR018-ETAPAC-R1D-DS-CODER-01`) completed with persisted telemetry:

- API calls: 8
- prompt tokens: 160,262
- prompt cache hit: 26,752
- prompt cache miss: 133,510
- completion tokens: 13,857
- reasoning tokens: 10,000
- observed balance delta: USD 0.02

This is materially better than the earlier 14-call / 215,585-prompt-token run, but remains too large for a three-file review surface.

## Hard quality invariant

V1.2 may reduce repeated information, never required evidence or adversarial depth.

Unchanged guarantees:

- every BASE..HEAD changed file remains injected completely and deterministically;
- mandatory changed-file evidence is never truncated to meet a token target;
- exact frozen BASE / HEAD / synthetic binding remains mandatory;
- DeepSeek Pro remains the final high-reasoning reviewer;
- missing evidence produces `EVIDENCIA INSUFICIENTE / VALIDACIÓN BLOQUEADA`, never an inferred clean result;
- material findings still require independent IA adjudication;
- no cheaper model is introduced by V1.2.

## V1.2 information-flow changes

### Dependency semantic slicing

V1.1 injected complete local `qore.infrastructure.*` modules imported by changed Python files. That removed evidence gaps but amplified the final prompt.

V1.2 instead parses the exact frozen source and injects exact source definitions for directly imported infrastructure symbols plus bounded module-local definitions referenced by those definitions.

Rules:

- changed modules are excluded from dependency slices because they are already present completely in mandatory changed-file evidence;
- direct imported definitions are mandatory and cannot be silently dropped;
- referenced module-local helpers/constants are followed deterministically up to depth 3;
- dependency slices have a 70,000-character safety fuse and are never truncated;
- wildcard imports fail closed;
- if an invariant needs material outside the slice, Explorer must fetch it or the final result blocks as insufficient.

This is semantic slicing, not evidence weakening: the full changed surface remains complete and the fail-closed path remains authoritative.

### Explorer bound

V1.2 allows four tool-capable exploration rounds plus one explicit no-tool closure round.

The Explorer must not reread:

- complete changed files;
- exact modified-file patches already guaranteed by the quality guard;
- dependency definitions already present in deterministic semantic slices.

Its remaining job is only to obtain binding/CI evidence and genuinely additional surrounding evidence.

### Final reasoning

The final reviewer remains DeepSeek Pro with thinking enabled and high reasoning effort.

The final max-token envelope is raised from 10,000 to 16,000 only to prevent the observed failure mode where reasoning consumes the entire envelope and forces a second full-prompt fallback. The larger envelope is not a target and must not be interpreted as permission to increase reasoning length.

Normal call target:

- 4 tool-capable Explorer calls
- 1 closure call
- 1 high-reasoning final call
- total: normally <= 6 API calls
- one compatibility/final fallback remains exceptional, not normal

## Consumption target

For the next production-equivalent DeepSeek reviews:

- first target: total prompt tokens below 100,000;
- preferred operating range: 50,000-90,000 prompt tokens when the review surface is comparable to UNR-018;
- above 100,000 requires telemetry review before further tuning;
- repeated results above 125,000 on small three-file surfaces are considered insufficient optimization unless a concrete evidence requirement explains the excess.

These are efficiency targets, not quality caps. If complete evidence genuinely requires more context, quality wins and the run may exceed them or block for a split review surface.

## Non-regression validation

At least the next three legitimate DeepSeek reviews must compare against R1D on:

- material-finding quality after IA adjudication;
- changed-file completeness;
- surrounding dependency coverage;
- fail-closed behavior;
- API calls;
- prompt/cache-hit/cache-miss tokens;
- completion/reasoning tokens;
- observed billing delta.

Any credible missed material defect attributable to V1.2 slicing or round reduction is a quality regression. In that case V1.2 must increase the relevant evidence/round budget or revert that optimization before pursuing further savings.

No DeepSeek job may be dispatched solely to benchmark V1.2. Measurement occurs on the next legitimate serial review.

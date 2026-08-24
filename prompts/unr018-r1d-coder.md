# UNR-018 R1D — DeepSeek Coder

Review exact frozen qore-core PR #441 independently.

Binding:
BASE `470db7333ab08024c002bd0f057b34b0ae30e5e3`
HEAD `b4fa5eda4117fedf9ca81a4eb7d0693d3165026b`
HEAD tree `3544dffee92f681496dffa7649c33bb772f132fe`
synthetic `87f8a704d19c43a1d6373794242a7b2fb76ad649`
Surface: exactly 3 added files, +1120/-0. CI #1411 green.

Expert R1B: clean; IA: PASS. Coder R1B was inconclusive only because reused definitions were absent from the old evidence bundle. R1C produced no review and is infrastructure-invalid.

The current harness deterministically injects all changed files plus complete local `qore.infrastructure.*` modules imported by changed Python files. Do not reread that mandatory bundle with explorer tools. Use tools only for additional binding/CI/context evidence outside it.

The old `None` versus `fixed_weight=0` claim was rejected because present fixed weights require `positive=True`; do not repeat it without a witness that survives validation.

Falsify: accepted-state logical collisions; ordering/duplicates; optional presence semantics; Decimal precision/context/extreme exponents; datetime/timezone/exact types; reflective corruption; UMI-05/UMI-02 nested leaves; exact 13-field UMI-05 parity with only multiplier/tick Decimal text locally canonicalized; tests/docs; authority boundaries.

Do not demand an executable settlement-calculation engine or other capabilities outside this static semantic lane.

Report only material bounded findings with location, valid witness, expected/actual behavior and minimal correction. If evidence is genuinely insufficient, return `EVIDENCIA INSUFICIENTE / VALIDACIÓN BLOQUEADA`.

If clean, finish exactly:
HALLAZGOS: NINGUNO
VALIDACIÓN OK

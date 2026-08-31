# QORE CORE — DEEPSEEK EXPERT R4 — PR #466 EXACT-HEAD REVIEW

You are the independent DeepSeek Expert reviewer for QORE Core. Review the complete frozen candidate, not merely the latest two-line correction. Return either `NONE / VALIDATION OK` if you can establish no material defect, or precise reproducible material findings. Do not transfer approval from earlier HEADs.

## Binding — MUST VERIFY BEFORE REVIEW

Repository: `mezas3238-hue/qore-core`
PR: `#466` — must remain OPEN / DRAFT
BASE: `5a158ef0fb2e21db95f2be0685373780bf1ab197`
HEAD: `d540b5be87985f21de5088af66bb178d1716110a`
TREE: `4ac08b4d62688fe00b8e0c422688c290856f0516`
SYNTHETIC: `9dc314018e370e31c8db06906ecfce834caf0fa7`
Synthetic parents, in order: BASE then HEAD.
Synthetic tree must equal HEAD tree.
Synthetic is GitHub signature verified / valid.
BASE→HEAD: 19 ahead / 0 behind; 7 changed files; cumulative +1520 / -69.

If any binding differs, do not review a moving candidate. Report binding failure.

## Exact-head QORE quality evidence

QORE CI run: `33424915851`
quality job: `99596046852`
Synthetic checked out: `9dc314018e370e31c8db06906ecfce834caf0fa7`
- `ruff check .`: PASS — All checks passed.
- `mypy src tests`: PASS — 744 source files.
- `pytest --cov=src/qore --cov-report=term-missing`: PASS — 4947 collected / 4947 passed; 7 warnings.
- total coverage: 47650 statements / 6236 missed / 87%.
- `instrument_universe_registry.py`: 290 statements / 2 missed / 99%.

Mechanical CI is evidence only, not semantic approval.

## Changed files

1. `docs/architecture/QORE-UMI-13-RECURSIVE-REGISTRY-REVALIDATION-001.md`
2. `docs/audits/UMI14-UMI13-UNICODE-CONFUSABLE-FOLLOWUP.md`
3. `src/qore/infrastructure/instrument_universe_registry.py`
4. `tests/infrastructure/test_instrument_universe_registry_credential_variants.py`
5. `tests/infrastructure/test_instrument_universe_registry_recursive_revalidation.py`
6. `tests/infrastructure/test_instrument_universe_registry_unicode_confusables.py`
7. `tests/infrastructure/test_instrument_universe_registry_unicode_confusables_followup.py`

## Contract under review

This is a bounded UMI-13 owner-stage correction. The candidate must preserve provider-neutral semantic Core behavior and fail closed at every retained registry trust edge.

Required properties include:
- exact runtime type enforcement where specified; no subclass/bool laundering;
- retained refs, reasons, evidence records, entries and snapshots recursively revalidate before graph operations, lookups and logical projection;
- retained local `StrEnum` singletons revalidate canonical identity, name and value before decisions/projection; no reliance on reflectively corruptible equality/hash state;
- immutable deterministic tuple shapes and canonical ordering remain stable;
- sensitive material must not enter retained reason/source/locator text through obvious credential syntax or supported obfuscations;
- credential inspection is detection-only: original retained/projected text is not normalized or rewritten;
- detection uses NFKC + casefold, removal of Unicode mark categories Mn/Mc/Me, bounded punctuation-confusable folding, and bounded character-level homoglyph matching for existing sensitive assignment labels;
- sensitive assignment families include authorization, bearer, credential, jwt, password, secret, token, api key, access token, client secret and private key;
- URL userinfo must fail closed for ordinary `scheme://authority` and scheme-relative `//authority` forms;
- legitimate printable Unicode unrelated to credential-like syntax must remain permitted;
- no generic Unicode transliteration contract is intended;
- no provider execution, valuation, Risk bypass, Production, real-capital or AI-provider authority/dependency may be introduced.

## Historical findings — evidence only, approval obsolete

Earlier HEADs had valid findings that have been corrected. Do not certify them; use them as adversarial history:
- recursive retained-child revalidation gaps;
- local StrEnum singleton reflective corruption;
- whitespace around sensitive assignment delimiters;
- scheme-relative URL userinfo;
- multiple separators inside composite credential names;
- non-printable Unicode separators;
- printable Unicode compatibility forms / marks, including fullwidth `=` and `@` and variation selectors;
- R2: cross-script `tok\u0435n=...` and missing `bearer=...` assignment coverage;
- R3 on obsolete HEAD `e0cadfca635af00e2461e9117da1ebc1bf7f91ba`: missing Greek sigma for ASCII `s` and Cyrillic ze for ASCII `z`, allowing `pa\u03c2\u03c2word=...` and `authori\u0437ation=...`.

Current HEAD adds bounded `("s", "σ")` and `("z", "з")` mappings plus constructor and retained-state regressions. Python casefold maps final sigma `ς` to `σ`, so the exact R3 final-sigma witness must now fail closed.

## Adversarial review focus

Do not stop at the exact historical witnesses. Audit the full candidate for materially equivalent bypasses or regressions, especially:

1. **Recursive trust edges** — reflective mutation after construction; nested value objects; evidence records; entry/snapshot graph operations; logical_values; lookup paths; exact local/foreign type identity.
2. **Enum state** — `_name_`, `_value_`, singleton identity, equality/hash laundering, independently retained primitive canonical decisions.
3. **Credential syntax** — every supported label, composite separators, whitespace, colon/equal delimiters, casefold effects, NFKC effects, marks, punctuation, cross-script homoglyphs that are visually/economically obvious for those exact label families.
4. **Bounded homoglyph table completeness** — determine whether an obvious Greek/Cyrillic/Latin homoglyph still permits a supported credential assignment to pass. Any finding must include a concrete code point, exact input witness, why current code accepts it, and expected fail-closed behavior. Avoid speculative Unicode-universe completeness requirements beyond the bounded security contract.
5. **False positives / preservation** — ensure the new detector does not rewrite semantic text and does not reject unrelated printable Unicode merely because it is non-ASCII.
6. **URL userinfo** — ordinary and scheme-relative authority parsing after skeletonization; confusable delimiters relevant to the existing contract.
7. **Determinism / immutability** — sorting, tuple shapes, duplicate detection and no mutable/global semantic state.
8. **Scope/governance** — no provider readiness or Production authority inference; no reviewer/provider dependency inside QORE Core.

## Finding bar

Report only material, reproducible defects in the exact candidate. For each finding provide:
- severity/materiality;
- exact file/function/contract;
- minimal reproducible witness;
- expected vs actual behavior;
- why existing tests do not close it;
- smallest safe correction direction.

Do not call missing generic hardening a defect unless it violates the stated bounded contract. Do not approve by inference from CI.

## Required output

If no material defect is reproducible:

`NONE / VALIDATION OK`

Then briefly state what adversarial areas you actually checked.

If findings exist, list only material findings with enough evidence for independent adjudication. Do not authorize Production or real capital under any outcome.
# QORE Harness Engineer — PR486 Cognitive — R8 RF-1 HARNESS QUALITY FAILURE / ONE-SHOT CLOSURE

## CLASSIFICATION

This is NOT a normal Correction-012/013 loop.

The preceding Harness delivery was produced under the mandatory dual-role policy and declared:

`HARNESS_INTERNAL_EXPERT_STATUS: CLEAN`

`HARNESS_DUAL_ROLE_STATUS: ENGINEER_COMPLETE + INTERNAL_EXPERT_CLEAN`

External Expert R8 nevertheless reproduced material members of RF-1 that fall squarely inside the family model Harness was required to exhaust. Integration Authority therefore classifies this package as:

`HARNESS_QUALITY_FAILURE / INTERNAL_EXPERT_ESCAPE`

The required response is ONE complete Harness work package. Do not split the accepted findings into separate corrections. Engineer + Internal Expert + exactly six distinct Harness subagents must fix and re-falsify the whole escaped family inside this one workflow until CLEAN or honestly BLOCKED.

## MANDATORY GLOBAL POLICY

Load and obey:
`harness/engineer/QORE-HARNESS-DUAL-ROLE-ONE-SHOT-POLICY-V1.md`

Hard acceptance law for this work:

`ONE WORK PACKAGE -> ENGINEER MODE -> SIX-SUBAGENT FAMILY EXHAUSTION -> IMPLEMENT -> INTERNAL EXPERT MODE -> ADVERSARIAL REFALSIFICATION -> FIX INSIDE SAME JOB -> REPEAT UNTIL CLEAN -> FULL QG -> EXTERNAL EXPERT EXPECTED PASS`

No known material issue may be deferred to External Expert. A candidate that merely passes the listed witnesses is NOT complete.

## EXACT IMMUTABLE START BINDING

Repository: `mezas3238-hue/qore-core`
PR: `#486`
BASE: `9672c4d999bd5d3e6db544f349243bc6abea0363`
START / current HEAD: `fda9101415595ebca30ba1b71c7dc26f4ad2b025`
START TREE: `f8e11d8bccbe556a96deeeb6d6f354364a46e1f2`
SYNTHETIC: `ef8589b083242cdcd26eb32637e6a788622b5c5e`
Exact-head QORE CI before External Expert: run `33967223845`, job `101309357600`, Ruff PASS, mypy 775, pytest 5771/5771 PASS, coverage 87%.

Predecessor Harness dual-role package:
`HARNESS-ENGINEER-QORE-CIBO-COGNITIVE-R7-CORRECTION-011-FULL-FAMILY-RECERTIFICATION-DUAL-ROLE-RESUME-001`
Harness run/job: `33960036104 / 101290211702`
Preserved artifact: `9969543745`
Final candidate patch SHA256: `4c356558164fd4255b6484a69573bce5f9d583e65082a5713e6a180721da36ef`

External Expert R8 evidence:
- initial R8 run/job: `33967893599 / 101311125868`
- artifact: `9970356341`, digest `sha256:e85bf393c75b503c864fc7da28d03da05480dc904a2d7b4e3a9b93b37631fd69`
- R8 resume run/job: `33969869477 / 101316353913`
- resume artifact: `9970747659`, digest `sha256:cfc9cf697b178145030b27550e32fcb5fde848e1aad4b29a85c0c4d6e3df9b1e`

Both Expert workflows ended from reviewer orchestration before all native lanes were collected. That infrastructure defect does NOT erase the primary-session deterministic evidence below. IA accepts the RF-1 findings because each is reproduced on the exact frozen HEAD and one material finding is sufficient to require HEAD mutation. L3/RF-3 completed independently and PASSed; do not reopen RF-3 absent contradiction. Do not spend tokens completing obsolete External Expert R8 lanes against a candidate that must mutate.

## ACCEPTED MATERIAL ESCAPE FAMILY — RF-1

Invariant:
Secret-bearing material must fail closed under semantically equivalent credential/token encodings, while ordinary benign prose must remain accepted. The detector must not define credential credibility as ASCII-only when labels/contexts are credential-bearing.

### QF-R8-1 — Prefix delimiter equivalence remains fail-open

Exact source surface:
`src/qore/modules/cibo/cognitive_contracts.py`
`contains_secret_material` -> `_secret_skeleton` -> delimiter/confusable folding -> `_SECRET_PATTERNS`.

External Expert deterministic witnesses on START HEAD:
- `contains_secret_material("sk\u180aabcdefghijklmnop") == False`
- `contains_secret_material("sk\u180a-Pro-abcdefghijklmnop") == False`
- `contains_secret_material("xoxb\u180aabcdefghijklm") == False`
- `contains_secret_material("access\u180atoken: abc") == False`
- `contains_secret_material("Bearer\u180aabc123def") == False`
- `contains_secret_material("Basic\u180aYWJjZA==") == False`

U+180A MONGOLIAN NIRUGU is category Po, remains unchanged by NFKC and is within the mandated relevant Po delimiter-confusable surface. U+2013 control is detected. FE31/FE32 are already covered via NFKC; do not break working cases.

Primary root scoping also found the broader partition:
- visible non-folded Po/Sm/So separator-like characters can occupy literal provider-prefix delimiters;
- invisible Mn/Cf/Zs characters can be stripped rather than folded at the delimiter, changing e.g. a required `sk-`/`xoxb-`/`gh*_` boundary into a joined string and evading the literal prefix grammar;
- split controls such as an invisible adjacent to an already-present real delimiter may already fail closed and must remain so.

Required closure: model the prefix-delimiter equivalence class principledly. Do NOT add only U+180A to a list.

### QF-R8-2 — All-letter credential fix creates material benign-prose false positives

Exact source surface:
`src/qore/modules/cibo/cognitive_contracts.py`, `_BARE_ALPHA_TOKEN_VALUE` and label-tier/assignment grammar.

Deterministic witnesses on START HEAD that incorrectly return secret-bearing True:
- `secret: authentication, authorization, and accounting`
- `token: authentication.`
- `access token: reconnaissance, exploitation, persistence`
- `authorization: compartmentalization`
- `credential: interoperability`
- `openai key: interoperability`
- `secret: authentication`
- `token: confidentiality, integrity, availability`
- `access token: authentication-based flows are common`
- `token: authentication-based`

Real caller propagation witness:
`EvaluationDimensionScore(dimension=EVIDENCE_SUFFICIENCY, score=80, note="token: authentication.")` is rejected on this HEAD with `EvaluationValidationError` although it is ordinary benign evaluation prose.

The predecessor before this change accepted this valid state. This is therefore not cosmetic; secret detection is reused by many Cognitive retained channels and the false positive changes valid-state acceptance.

Required closure: define a principled credential-value credibility grammar that catches genuine all-letter credential values without treating ordinary single-word/prose continuations as credentials. No witness wordlist/stopword patch is allowed.

### QF-R8-3 — Credential-value grammar is ASCII-only and fails open for non-Latin all-letter values

Exact source surface:
`_BARE_ALPHA_TOKEN_VALUE = [A-Za-z]{12,}...`

Deterministic witnesses on START HEAD under credential-bearing weak/ambiguous labels:
- `secret: αβγδεζηθικλμν` -> False
- `token: абвгдежзиклмн` -> False
- `secret: 密码密码密码密码密码` -> False

ASCII 12+ controls are detected and unequivocal labels continue to fail closed for arbitrary values.

Required closure: the family partition may not assume alphabetic credential material is ASCII. Use Unicode-aware properties/equivalence classes or another principled shape model while preserving benign multilingual prose controls. Do not solve by adding Greek/Cyrillic/CJK witness lists.

## WHY THIS IS AN INTERNAL-EXPERT ESCAPE

External Expert inspected the predecessor tests and found the Internal Expert/FAMILY_MODEL did not cover the escaped partitions:
- dash/confusable test enumerated only an allowlisted dash set and omitted U+180A / category-complete relevant Po/Sm/So/invisible delimiter-equivalence exploration;
- prose controls covered multi-word `authentication <verb>` but not terminal/punctuation/hyphen single-word prose classes;
- all-letter credential tests covered ASCII only, not Unicode alphabetic classes.

Therefore the new Internal Expert must specifically challenge the FAMILY_MODEL itself, not merely patch the three witnesses.

## REQUIRED RF-1 FAMILY MODEL RECERTIFICATION

Engineer Mode + six subagents must build a finite/explainable decision model covering at minimum:
1. provider-prefix delimiter semantics: literal delimiter, confusable delimiter, visible punctuation/symbol separators, invisible replacement/insertion/removal, width/normalization transforms;
2. label tiers: unequivocal / compound / ambiguous / weak / provider-known / URL-userinfo / private-key;
3. value scripts and Unicode properties: ASCII Latin, non-ASCII Latin, Greek, Cyrillic, CJK and representative Unicode alphabetic partitions selected by property, not witness language;
4. value credibility shapes: alphabetic, alphanumeric, digits, punctuation-bearing, quoted, whitespace-separated/passphrase-like, known structured token forms;
5. benign prose: terminal single word, comma lists, hyphenated compounds, multi-word prose, finance/security terminology, multilingual prose;
6. transformations/cross-products: NFKC/NFC/NFD where material, casefold, confusable folding, delimiter insertion/removal/replacement, chunk/split boundaries;
7. all LSP-reachable consumers of `contains_secret_material`, including retained/logical/revalidation paths and valid-state propagation;
8. exact runtime-type/subclass and malformed-input behavior must remain fail-closed.

For bounded Unicode delimiter classes, prefer exhaustive enumeration/property generation over hand-selected samples. For unbounded value/prose classes, use property/metamorphic partitions with explicit positive AND negative invariants.

## SIX-SUBAGENT / DUAL-ROLE EXECUTION

Use exactly six distinct subagent identities and persist their evidence. They must not all repeat the same RF-1 witness.

Suggested non-duplicative specialties:
- L1 architecture/contracts/caller graph/exact types;
- L2 provider-token/credential adversarial witnesses;
- L3 Unicode normalization/confusable/delimiter property exploration;
- L4 property/metamorphic positive-vs-benign grammar exploration;
- L5 historical regression + multilingual benign/credential partitions;
- L6 fresh post-implementation challenger over the exact final patch and cross-interactions.

L6 must be fresh and post-implementation. If L6 finds anything material, return to Engineer Mode INSIDE THIS SAME WORK PACKAGE, repair the complete class, rerun relevant properties/LSP, then use a fresh challenger again.

## PRESERVE CLOSED FAMILIES

RF-2 and RF-3 must remain regression-green but are NOT to be restarted without a concrete contradiction. External R8 L3 independently concluded RF-3 PASS and adjudicated the observed channel-polarity residual NON_MATERIAL/pre-existing with no authority escalation.

Preserve all prior Cognitive laws, exact types, replay/fingerprint determinism, canonical time behavior and `INTELLIGENCE != AUTHORITY`.

## REQUIRED FINAL SELF-FALSIFICATION

Before candidate-ready, Internal Expert must attempt to falsify at least these meta-properties, not just sample strings:
- equivalent secret/token prefixes cannot become benign solely by replacing a semantic delimiter with a relevant Unicode separator/confusable/invisible transform;
- benign prose acceptance is stable under punctuation/hyphenation/script changes that do not turn prose into credential structure;
- credential-value detection is not ASCII-script authority;
- adding a benign Unicode transform cannot flip a genuine structured credential to accepted;
- valid Cognitive caller objects carrying benign prose remain constructible/revalidatable;
- malformed/secret-bearing retained material remains rejected.

Final report must include `RECURRENT FAMILY RECERTIFICATION MATRIX` and exact markers:

`HARNESS_INTERNAL_EXPERT_STATUS: CLEAN`

`HARNESS_DUAL_ROLE_STATUS: ENGINEER_COMPLETE + INTERNAL_EXPERT_CLEAN`

`EXTERNAL EXPERT EXPECTED PASS`

Any `MATERIAL_GAP` => BLOCKED. Do not deliver an optimistic CLEAN.

## LSP / REASONING / QG

Semantic LSP before/after mandatory: `findReferences`, `goToDefinition`, `goToImplementation` where applicable, `hover`, changed symbols, all reachable consumers, final impact recheck.

HIGH baseline; MAX mandatory for Unicode/security grammar, false-positive/false-negative tradeoffs, contradictory evidence and final closure.

Artifact-only. No push/commit/merge.

Host canonical FULL QG after candidate-ready:
- `git diff --check`
- `ruff check .`
- `mypy src tests`
- `pytest --cov=src/qore --cov-report=term-missing`

## FINAL DISPOSITION

Harness must either deliver ONE internally-clean candidate that closes the entire escaped RF-1 family and preserves RF-2/RF-3, or return BLOCKED with an exact unresolved family dimension. There is no intentional handoff of known holes to External Expert and no splitting into serial micro-corrections.
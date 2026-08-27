# QORE UMI14 / UMI12 final owner recertification — DeepSeek Coder R55

Act as an independent adversarial implementation reviewer. Do not trust any prior Expert verdict, prior reviewer conclusion, author claim, test name, documentation claim, or green CI by itself. Reconstruct the behavior from the exact frozen code and falsify it where possible.

## Immutable review binding

- Repository: `mezas3238-hue/qore-core`
- PR: `#461`
- BASE/main: `ebd0adf000874797653df92ea1c08a892cce6c8c`
- HEAD: `87f093ef034070510daa479e3963e3581a65329f`
- HEAD TREE: `0ff25b21749efa85f62793e9c9ed2396ec3c81dd`
- synthetic merge: `e98156308cbd726c182aafb08132390da38bb934`
- synthetic TREE: `0ff25b21749efa85f62793e9c9ed2396ec3c81dd`
- synthetic parents, in order: BASE then HEAD.
- Core must remain frozen throughout this review.
- `src/qore` delta is intentionally zero; this PR hardens the UMI-12 adversarial/conformance harness and evidence only.

The exact-head QORE quality gate was green before freeze. Treat that only as evidence that the candidate executes; independently inspect correctness and soundness.

## Prior Expert context — evidence, not authority

Expert R55 executed against this identical freeze with a complete evidence bundle and reported one alleged false negative:

`getattr(object=builtins, name="eval")("1+1")`

Independent adjudication rejected that witness because CPython builtin `getattr` is positional-only: using `object=` / `name=` raises `TypeError: getattr() takes no keyword arguments`; therefore the outer dynamic call is unreachable. Do not merely accept this adjudication: verify exact Python semantics yourself. More importantly, search for neighboring *valid* witnesses where a helper actually accepts keyword arguments, `**kwargs`, positional expansion, aliases, rebinding, or mixed argument forms and where the scanner could lose reachability or callable identity.

R55 is consumed. Your task is not to repeat its conclusion; it is to find implementation defects the Expert missed.

## Primary adversarial targets

Audit the full effective scanner inheritance chain and all additive guard layers, especially the current successors around R35/R38/R39/R40/R41/R44/R45/R47/R48/R49/R50/R51/R52/R53. Trace actual dispatch, override precedence, and evaluation order rather than reviewing files in isolation.

Prioritize:

1. Exact Python evaluation order and failure-before-later-expression behavior for positional args, starred args, keywords, and `**kwargs`.
2. Positional-only vs keyword-capable builtins/helpers. Distinguish Python runtime semantics from AST shape. Find a real executable counterexample, not a syntactically valid but runtime-invalid witness.
3. `getattr`, `vars`, `operator.getitem`, `operator.itemgetter`, `operator.attrgetter`, builtin namespace access, `__dict__`, `.get`, `.__getitem__`, subscript access, imported aliases, and nested compositions.
4. Dynamic execution reachability for `eval`, `exec`, `compile`, `__import__` and callable aliases selected through lists, tuples, mappings, booleans-as-indices, integers, floats/complex keys, Ellipsis/None, attribute/item access and operator helpers.
5. Shadowing and rebinding: local names, imports, aliases, branch merges, comprehensions/lambdas/functions/classes where relevant, builtin helper rebinding, and ambiguous environments. Unknown or uncertain state must not become an unsafe false negative.
6. Starred container/argument shape and Python last-write-wins/equality semantics, including bool/int and numeric key equivalence.
7. Exact Ellipsis identity and definite-failure semantics, including builtins lookup pathways and ordering relative to reachable dangerous calls.
8. Directionality and owner/qualification guards added through R53: test that product/generic relationships, semantic owner discovery, manifests, and cross-family distinctions cannot be bypassed by a neighboring valid repository shape.
9. Regression layering: verify newer scanners do not accidentally regress older R4–R53 guarantees through override interception, altered return values, or partial delegation.
10. Historical oracle preservation and full owner/oracle marker-free assertions: make sure a broad green assertion is not hiding a reachable dynamic-execution path due abstraction loss.
11. Fail closed where the contract requires it, but do not flag behavior that correctly models an expression that Python would definitely fail before the alleged dangerous execution.

## Review method

- Inspect the exact files and dependencies needed to establish behavior.
- Construct minimal executable Python witnesses for every suspected semantic defect.
- When claiming a false negative, prove the dangerous call is actually reached by Python before claiming the scanner misses it.
- When claiming a false positive or failure-order issue, prove the earlier exception/evaluation semantics.
- Distinguish scanner/harness soundness defects from style, duplication, test organization, or maintainability comments. Only material correctness findings count.
- Do not demand provider support, networking, production activation, valuation/execution capability, real capital, or operational readiness. Those are outside this review.
- Do not infer Program-D final PASS from this review.

## Required output

For every finding provide:
- severity/materiality;
- exact file/function/logic involved;
- minimal reproducible witness;
- actual Python runtime behavior;
- scanner/harness observed or logically derived behavior;
- why the mismatch is material;
- bounded correction direction.

If no material defects remain, say exactly:

`HALLAZGOS: 0 / VALIDACIÓN OK`

If one or more material defects remain, say exactly:

`HALLAZGOS: N / VALIDACIÓN NO OK`

Do not use `VALIDACIÓN OK` if any material finding remains.
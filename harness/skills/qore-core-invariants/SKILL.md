---
name: qore-core-invariants
description: QORE Core architectural invariants for provider-neutral, deterministic, fail-closed implementation.
whenToUse: Load before changing QORE domain, governance, infrastructure contracts, or cross-layer dependencies.
user-invocable: false
---
# QORE Core invariants

Treat these as hard engineering constraints unless the task package explicitly narrows them further.

- Preserve provider neutrality: Core/Domain/Governance must not depend on concrete providers/adapters.
- External infrastructure is composed outside the Core graph.
- Prefer immutable contracts: `@dataclass(frozen=True, slots=True)` where applicable.
- Use Protocol boundaries, typed errors, and explicit `Result` / `Success` / `Failure` contracts.
- Exact runtime type means exact runtime type: do not accept `bool` as `int`, subclasses as exact values, or strings as typed identity objects unless the contract explicitly says so.
- Recursively revalidate retained/nested material at trust boundaries; successful original construction is not permanent validity after reflective corruption.
- Preserve deterministic ordering/canonicalization and exact Decimal semantics where required.
- Do not introduce implicit `datetime.now()`, `date.today()`, `uuid4()`, hidden retry, sleeps, threads, scheduler behavior, global mutable state, or corrective trading.
- Uncertainty or invalid retained state fails closed; do not infer operational/Production authority from semantic completeness.
- Keep valuation methodology, provider-native identity, execution authority, and semantic identity separate.

---
name: qore-deterministic-contracts
description: Deterministic contract and revalidation rules for QORE identifiers, timestamps, enums, decimals, and nested state.
whenToUse: Load when implementing or modifying dataclasses, IDs, enums, timestamps, Decimal values, logical_values, canonicalization, or retained-state reconstruction.
user-invocable: false
---
# Deterministic QORE contracts

- Validate exact UUID objects where the contract requires UUID; do not launder through strings.
- Timestamps must be timezone-aware when required and supplied explicitly; do not create ambient current time inside deterministic contracts.
- Exact `int` excludes `bool`; exact enum/contract type excludes subclasses unless explicitly accepted.
- Revalidate enum canonical membership and internal retained state if a frozen object can be reflectively corrupted.
- Recursive `logical_values()` / projection paths are trust boundaries: re-enter child validation before trusting nested material.
- Canonicalization must be deterministic, idempotent, stable under reconstruction, and must not change economically meaningful identity accidentally.
- Never use float where exact Decimal semantics are required.
- Preserve original valid retained text/identity bytes when validation uses a detection-only normalized view.

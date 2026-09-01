---
name: qore-security-boundary
description: QORE secret-hygiene and fail-closed security constraints for metadata, evidence, URLs, credentials, logs, and authority boundaries.
whenToUse: Load when code touches text validation, metadata/evidence, URLs, credentials, logging, observability, provider configuration, or execution boundaries.
user-invocable: false
---
# QORE security boundary

- No secrets in repr, logs, telemetry, evidence, logical values, metadata, test artifacts, or error strings.
- Treat credential-like material, URL userinfo, invisible fillers, Unicode compatibility expansions, confusables, delimiters, and nested retained state adversarially.
- Validation may use a detection-only normalized skeleton, but must not silently rewrite valid retained/projected source text unless the contract requires canonicalization.
- Do not introduce productive credentials, Production accounts, deposits/withdrawals, real-money orders, Risk bypasses, or real-capital authority.
- No hidden network/provider execution from semantic contracts.
- Prefer bounded allowlists and explicit failure over heuristic acceptance when authority or credential hygiene is uncertain.
- Tests may contain synthetic credential markers, but never real keys/tokens.

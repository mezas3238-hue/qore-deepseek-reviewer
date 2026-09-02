# DeepSeek reviewer balance preflight

## Incident

DeepSeek Expert R21 for QORE Core PR #466 terminated after substantial model work with `QUOTA: Insufficient Balance` before its mandatory final semantic-LSP re-check and final disposition. The partial run therefore remains `VALIDATION BLOCKED`; it is not a semantic PASS and not a material-finding adjudication.

## Fail-closed rule

All reviewer workflows that invoke `scripts/deepseek_balance_meter.py snapshot` inherit a default USD 1.00 minimum available-balance preflight before model API spend.

The preflight:

- requires a USD balance;
- requires the provider account to report `is_available=true`;
- requires a finite `total_balance >= 1.00` USD by default;
- rejects malformed or non-finite decimal balance values;
- never prints the actual balance;
- stores the exact baseline only in private runner temporary storage;
- refuses model API spend when the gate is not satisfied.

The CLI permits an explicit `--minimum-balance-usd` override for package-specific budgeting. The default is deliberately a low non-zero safety floor: it prevents obviously depleted-account dispatch while avoiding a false block merely because an account is below an arbitrary USD 5 reserve. Package-level cost controls, durable checkpoints, anti-duplication and provider quota handling remain authoritative.

## Non-effects

This infrastructure control does not modify QORE Core, PR #466, reviewer timeouts, candidate bindings, semantic review requirements, subagent counts, LSP requirements, HIGH/MAX reasoning requirements, or any Production/real-capital authority.

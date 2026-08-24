# QORE DeepSeek quality non-regression note

Token optimization is permitted only when review quality remains equivalent or improves.

Hard rules:
- complete changed-file evidence is mandatory and injected deterministically;
- mandatory changed-file evidence is never truncated to save tokens;
- exploration budget exhaustion is not evidence of cleanliness;
- if required surrounding evidence is missing, the review must block as insufficient rather than emit a clean verdict;
- any credible missed material finding attributable to token reduction requires raising budgets or reverting the optimization before further cost tuning.

Cost is an optimization target. Review quality is an invariant.

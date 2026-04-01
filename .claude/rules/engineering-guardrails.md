# Engineering Guardrails

- Read `.claude/eup-context.md` when business context matters.
- Scout the codebase before planning or touching unfamiliar modules.
- Never implement before a plan is approved.
- Prefer existing patterns over new frameworks or abstractions.
- Run real validation commands. Do not fake passing output.
- Fix root causes. Do not suppress tests, warnings, or review findings to make the pipeline green.
- Keep ownership explicit when multiple engineers work in parallel.
- Prefer 3-5 teammates for parallel workflows, and only when tasks are self-contained and file ownership is disjoint.
- Use worktree isolation for parallel engineering work instead of letting multiple teammates edit the same checkout.
- Any blocker caused by missing context must be surfaced immediately, not papered over.

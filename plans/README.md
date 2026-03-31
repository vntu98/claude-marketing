# Plans

Place implementation plans under `plans/<slug>/plan.md`.

Every plan folder should contain:

- `plan.md`
- `phase-01-*.md`, `phase-02-*.md`, and additional phase files as needed

Every `plan.md` must start with YAML frontmatter and include one explicit approval line:

- `Approval Status: pending`
- `Approval Status: approved`

The workflow hooks use that line to decide whether implementation edits are allowed.
The last edited `plans/**/plan.md` becomes the active plan automatically; source-code edits and post-approval orchestration are gated against that active plan, not against unrelated historical plans.

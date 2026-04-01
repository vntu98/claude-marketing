# Plans

Place implementation plans under `plans/<slug>/plan.md`.

`/eup-plan` should start only after a saved strategy memo exists under `reports/strategy/YYYYMMDD-[slug]/strategy-memo.md` and `/eup-pm` has turned it into backlog/scoping output.

Every plan folder should contain:

- `plan.md`
- `phase-01-*.md`, `phase-02-*.md`, and additional phase files as needed
- `task-graph.json`
- `ownership-matrix.md`

Every `plan.md` must start with YAML frontmatter and include one explicit approval line:

- `Approval Status: pending`
- `Approval Status: approved`

The workflow hooks use that line to decide whether implementation edits are allowed.
The last edited `plans/**/plan.md` becomes the active plan automatically; source-code edits and post-approval orchestration are gated against that active plan, not against unrelated historical plans.

## Task Graph Contract

`task-graph.json` is the machine-readable contract for team runtime orchestration. Each task should include:

- `id`
- `title`
- `owner`
- `dependencies`
- `fileGlobs`
- `acceptanceCriteria`
- `validationCommands`
- `blockingPolicy`
- `taskDescription`

The human-readable `taskDescription` should follow the same task packet contract used by the hooks:

- `Phase:`
- `Owner Role:`
- `Depends On:`
- `Artifacts:` or `Read Scope:` or `File Ownership:`
- `Acceptance Criteria:`
- `Validation:`
- `Isolation: worktree` for implementation roles that edit code

## Ownership Matrix

`ownership-matrix.md` is the human-readable parallel execution contract. It should show:

- which role owns which files or globs
- which tasks may run in parallel
- which shared contracts must land first
- which validation gate each owner must satisfy before handoff

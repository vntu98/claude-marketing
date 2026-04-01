---
name: eup-implement
description: "Manual company operating command for approved implementation work. Use when the active plan is approved and the engineering team should execute from task-graph.json with official Agent Teams and worktree isolation."
argument-hint: "<plan-path>"
disable-model-invocation: true
allowed-tools: Read, Glob, Grep, Bash, Agent, TeamCreate, TeamDelete, TaskCreate, TaskGet, TaskUpdate, TaskList, SendMessage
model: opus
---

# Implement

Run this command inline as the team lead after approval.

## Prerequisites

- The active `plans/<slug>/plan.md` must contain `Approval Status: approved`.
- `plans/<slug>/task-graph.json` must be valid JSON with complete execution tasks.
- `plans/<slug>/ownership-matrix.md` must exist and be non-empty.

If any prerequisite is missing, stop and hand back to `implementation-planner` or the user.

## Default Team

Dispatch 3-5 teammates total. Choose only the roles that the plan truly needs:

- `database-engineer`
- `backend-engineer`
- `frontend-engineer`
- `mobile-engineer`
- `fullstack-developer`
- downstream gates: `quality-reviewer`, `qa-tester`

## Execution Rules

1. Call `TeamCreate` before spawning teammates.
2. Read `task-graph.json` first and seed only the tasks that are currently unblocked.
3. Split work strictly by file ownership from `ownership-matrix.md`.
4. Use worktree isolation for parallel engineering work.
5. Collapse overlapping work into a single engineer lane instead of creating conflicts.
6. For risky lanes like schema, auth, or infra, require a plan-first pass from the teammate before code changes.
7. Run `quality-reviewer` before `qa-tester`.
8. Keep `devops-engineer` out of the team unless the user explicitly asks for release work.

## Task Graph Expectations

Each implementation task should include:

- `Owner Role:`
- `Phase:`
- `Depends On:`
- `File Ownership:` with exact file globs
- `Isolation: worktree`
- `Acceptance Criteria:`
- `Validation:`
- optional hook metadata:
  - `requiredArtifacts`
  - `validationCommands`
  - `enforceArtifactsOnIdle`
  - `enforceValidationOnIdle`

Example:

```text
Phase: implementation
Owner Role: backend-engineer
Depends On: task-db-schema
File Ownership:
- src/api/**
- src/services/tracking/**
Isolation: worktree
Acceptance Criteria:
- approved API contract is implemented
- failure paths return explicit errors
Validation:
- npm test -- tracking
- npm run build
```

## Lead Responsibilities

- monitor `TaskCompleted` and `TeammateIdle`
- redirect teammates that drift outside their ownership boundary
- wait for teammates before synthesizing
- report blockers immediately if task overlap or missing context makes the plan unsafe

## Anti-Patterns

- Do not start from a pending plan.
- Do not assign the same file to two engineers.
- Do not let the lead quietly implement instead of coordinating.
- Do not bypass review or testing to make the flow look faster.

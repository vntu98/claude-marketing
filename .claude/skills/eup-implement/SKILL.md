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

## Runtime Rules

1. Before `TeamCreate`, check whether this lead session is already managing another team. If so, shut down idle teammates, call `TeamDelete` on the old team first, and confirm success before continuing.
2. If `TeamDelete` fails, stop and tell the user which team is still active. Do not try to create a second team from the same lead session.
3. Call `TeamCreate` only after the old team is fully deleted.
4. If `TeamCreate` fails or is unavailable, stop and report that Agent Teams requires Claude Code CLI with `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`.
5. Start with 3-5 teammates. Scale up only when the approved task graph has enough truly independent work to justify more coordination.
6. Teammates do not inherit the lead chat history. Every task packet must restate the business goal, constraints, exact file ownership, and validation expectations.
7. When the approved workload is large, split it into additional self-contained tasks so teammates can self-claim new unblocked work without overlapping files.
8. Wait for teammates to complete their tasks before the lead synthesizes, reviews, or starts implementing work itself.
9. After implementation, review, and test tasks are complete, shut down idle teammates and delete the team with `TeamDelete` from the lead session.
10. Only report `team disbanded`, `team fully disbanded`, or equivalent language after `TeamDelete` returns success.

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
- `Context:` with the business goal, constraints, and exact deliverable for that lane
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
Context:
- Business goal: implement the approved tracking API for acquisition attribution
- Constraints: keep the auth boundary unchanged and do not touch frontend-owned files
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
- use artifact or validation metadata when a lane must prove completion before the system accepts `TaskCompleted`
- wait for teammates before synthesizing
- report blockers immediately if task overlap or missing context makes the plan unsafe

## Anti-Patterns

- Do not start from a pending plan.
- Do not assign the same file to two engineers.
- Do not let the lead quietly implement instead of coordinating.
- Do not bypass review or testing to make the flow look faster.
- Do not let active teammates linger after review or testing is complete; clean them up from the lead session.

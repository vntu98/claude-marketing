---
name: eup-dev-intake
description: "Manual company operating command for PM, scout, and brainstorm intake. Use when a saved strategy memo should become a durable dev intake packet and planning-ready technical brief."
argument-hint: "<strategy-path-or-brief>"
disable-model-invocation: true
allowed-tools: Read, Glob, Grep, Bash, Agent, TeamCreate, TeamDelete, TaskCreate, TaskGet, TaskUpdate, TaskList, SendMessage
model: opus
---

# Dev Intake

Run this command inline as the team lead. This workflow converts a saved strategy memo into a planning-ready intake packet and supporting technical findings.

## Prerequisite

- A complete `reports/strategy/YYYYMMDD-[slug]/strategy-memo.md` must already exist.
- If the strategy memo is missing or incomplete, stop and hand back to `marketing-strategist`.

## Default Team

- `project-manager`
- `codebase-scout`
- `technical-brainstormer`
- `implementation-planner` only after scout and brainstorm findings are available

## Required Outputs

- `reports/strategy/YYYYMMDD-[slug]/dev-intake.md`
- `reports/strategy/YYYYMMDD-[slug]/scout-findings.md`
- `reports/strategy/YYYYMMDD-[slug]/technical-options.md`
- `plans/<slug>/plan.md`
- `plans/<slug>/task-graph.json`
- `plans/<slug>/ownership-matrix.md`

## Execution Sequence

1. Resolve the active strategy memo path and derive the target slug.
2. Before `TeamCreate`, check whether this lead session is already managing another team. If so, call `TeamDelete` on the old team first and confirm success before continuing.
3. If `TeamDelete` fails, stop and tell the user which team is still active. Do not try to create a second team from the same lead session.
4. Call `TeamCreate`. If unavailable, stop and report that Agent Teams requires Claude Code CLI with the experimental flag enabled.
5. Create tasks for:
   - `project-manager` to turn the strategy into `dev-intake.md`
   - `codebase-scout` to map the smallest safe change surface and save `scout-findings.md`
   - `technical-brainstormer` to evaluate trade-offs or vendor choices and save `technical-options.md`
   - each task description must declare `Phase`, `Owner Role`, `Depends On`, `Context:`, and then either `Artifacts:` or `Read Scope:` depending on the role
   - every task description must also include `Acceptance Criteria:` and `Validation:`
6. Allow scout and brainstorm to run in parallel only when the PM packet does not depend on deeper codebase findings.
7. Require `codebase-scout` and `technical-brainstormer` to save their artifacts and then call `TaskUpdate` so their assigned tasks are marked completed before they stop. A chat handoff alone is not enough.
8. After those tasks finish, dispatch `implementation-planner` to write `plan.md`, `task-graph.json`, and `ownership-matrix.md`.
9. After the required outputs exist, shut down idle teammates and delete the dev-intake team with `TeamDelete` from the lead session.
10. Only report `team disbanded`, `team fully disbanded`, or equivalent language after `TeamDelete` returns success.
11. Stop before implementation. The next gate is explicit user approval on the active plan.

## Task Packet Contract

Use these shapes in task descriptions:

For PM and planner lanes:

```text
Phase: dev-intake
Owner Role: project-manager
Depends On: none
Context:
- Business goal: convert the approved strategy memo into a planning-ready intake packet
- Constraints: keep ownership non-overlapping and stop before implementation
Artifacts:
- reports/strategy/YYYYMMDD-[slug]/dev-intake.md
Acceptance Criteria:
- backlog, dependencies, and ownership are explicit
Validation:
- Confirm dev-intake.md exists
```

For scout and brainstorm lanes:

```text
Phase: dev-intake
Owner Role: codebase-scout
Depends On: none
Context:
- Business goal: identify the smallest safe change surface for the approved dev ask
- Constraints: read-only lane, cite file paths, and call out untouched modules
Read Scope:
- app/**
- src/**
Artifacts:
- reports/strategy/YYYYMMDD-[slug]/scout-findings.md
Acceptance Criteria:
- entry points, risks, and smallest safe change surface are named
Validation:
- Confirm scout-findings.md exists
- report findings back to the lead with file references
```

Use the same shape for `technical-brainstormer`, but save:

- `reports/strategy/YYYYMMDD-[slug]/technical-options.md`

Before stopping, both read-only lanes must send their handoff and call `TaskUpdate` so the owned task is marked completed or blocked explicitly.

## `dev-intake.md` Requirements

Include:

- business objective
- approved strategy source
- user or ops-facing change
- scoped dev asks
- dependencies and risks
- suggested ownership
- tracking and validation needs

## Planning Rules

- `task-graph.json` must be machine-readable and complete enough for `/eup-implement`.
- `ownership-matrix.md` must make file overlap impossible before engineers start.
- No engineer dispatch before the user approves the active plan.

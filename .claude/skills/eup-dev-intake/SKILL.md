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
- `plans/<slug>/plan.md`
- `plans/<slug>/task-graph.json`
- `plans/<slug>/ownership-matrix.md`

## Execution Sequence

1. Resolve the active strategy memo path and derive the target slug.
2. Call `TeamCreate`. If unavailable, stop and report that Agent Teams requires Claude Code CLI with the experimental flag enabled.
3. Create tasks for:
   - `project-manager` to turn the strategy into `dev-intake.md`
   - `codebase-scout` to map the smallest safe change surface
   - `technical-brainstormer` to evaluate trade-offs or vendor choices
   - each task description must declare `Phase`, `Owner Role`, `Depends On`, and then either `Artifacts:` or `Read Scope:` depending on the role
   - every task description must also include `Acceptance Criteria:` and `Validation:`
4. Allow scout and brainstorm to run in parallel only when the PM packet does not depend on deeper codebase findings.
5. After those tasks finish, dispatch `implementation-planner` to write `plan.md`, `task-graph.json`, and `ownership-matrix.md`.
6. Stop before implementation. The next gate is explicit user approval on the active plan.

## Task Packet Contract

Use these shapes in task descriptions:

For PM and planner lanes:

```text
Phase: dev-intake
Owner Role: project-manager
Depends On: none
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
Read Scope:
- app/**
- src/**
Acceptance Criteria:
- entry points, risks, and smallest safe change surface are named
Validation:
- report findings back to the lead with file references
```

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

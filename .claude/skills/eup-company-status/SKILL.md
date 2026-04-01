---
name: eup-company-status
description: "Manual command for reading company state across strategy, dev intake, plan approval, task graph, and active team progress. Use when the user wants a concise operational status report."
disable-model-invocation: true
allowed-tools: Read, Glob, Grep, Bash, TaskGet, TaskList
model: haiku
---

# Company Status

Read the current durable artifacts and summarize the operating state of the company.

## Sources of Truth

- active strategy memo under `reports/strategy/**/strategy-memo.md`
- optional `reports/strategy/**/dev-intake.md`
- active plan under `plans/**/plan.md`
- `plans/**/task-graph.json`
- `plans/**/ownership-matrix.md`
- current team runtime from native tasks when available

## Output

Report:

- active workflow stage
- current strategy status
- current dev intake status
- current plan approval status
- active team and progress if present
- blockers, missing artifacts, or ambiguous state
- next required handoff

Keep the answer short, operational, and explicit about what is still missing.

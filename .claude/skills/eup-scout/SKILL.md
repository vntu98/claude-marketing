---
name: eup-scout
description: Scout the codebase before planning or implementation. Use when you need fast file discovery, entry points, dependency tracing, risk mapping, or the smallest safe change surface.
argument-hint: "[search-target]"
disable-model-invocation: true
context: fork
agent: codebase-scout
allowed-tools: Read, Glob, Grep, Bash
metadata:
  version: 1.0.0
---

# Codebase Scout

Use this workflow entrypoint when the team needs a fast, scoped map of the codebase before brainstorming, planning, or implementation.

## Required Behavior

1. Map the smallest safe change surface first.
2. Identify entry points, major modules, dependencies, risky seams, and untouched areas.
3. Prefer exact file paths over broad summaries.
4. Call out unknowns and what needs deeper inspection.
5. Do not edit files.

## Output

```markdown
# Scout Report

## Relevant Files
- [path] — why it matters

## Dependencies
- [module, service, or config]

## Risks
- [risk or hidden coupling]

## Recommended Next Step
- `/eup-brainstorm` or `/eup-plan`
```

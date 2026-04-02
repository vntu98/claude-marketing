---
name: eup-market-cycle
description: "Manual company operating command for the marketing intelligence cycle. Use when the user wants the marketing team to research market demand, competitors, GA4 or channel data, and produce a saved strategy memo with concrete dev asks."
argument-hint: "<brief>"
disable-model-invocation: true
allowed-tools: Read, Glob, Grep, Bash, Agent, TeamCreate, TeamDelete, TaskCreate, TaskGet, TaskUpdate, TaskList, SendMessage
model: opus
---

# Market Cycle

Run this command inline as the team lead. This is an official Agent Teams-first workflow, not a normal forked skill.

## Goal

Turn a market brief into durable evidence under `reports/research/YYYYMMDD-[slug]/` and a saved strategy memo under `reports/strategy/YYYYMMDD-[slug]/strategy-memo.md`.

## Runtime Rules

1. Before `TeamCreate`, check whether this lead session is already managing another team. If so, call `TeamDelete` on the old team first and confirm success before continuing.
2. If `TeamDelete` fails, stop and tell the user which team is still active. Do not try to create a second team from the same lead session.
3. Call `TeamCreate` only after the old team is fully deleted.
4. If `TeamCreate` fails or is unavailable, stop and tell the user Agent Teams requires Claude Code CLI with `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`.
5. Keep the first wave to 3-5 teammates.
6. All live-mutation marketing tools must run in `--dry-run` mode unless the user explicitly asks for a live action.
7. The lead coordinates, monitors task progress, and synthesizes. Teammates own the artifacts they create.

## Default Team

- `market-researcher`
- `competitor-analyst`
- `ga4-analyst`
- one of `seo-specialist` or `growth-manager`
- `marketing-strategist` joins after the evidence tasks finish

Use `seo-specialist` when organic discoverability is in scope.
Use `growth-manager` when activation, monetization, pricing, or paywall work is more important.

## Required Artifacts

Create a fresh folder:

```text
reports/research/YYYYMMDD-[slug]/
```

Required files:

- `research-summary.md`
- `customer-signals.md`
- `quote-bank.md`
- `sources.md`
- `competitor-landscape.md`
- `ga4-insights.md`
- `channel-scorecard.md`

Then create:

```text
reports/strategy/YYYYMMDD-[slug]/strategy-memo.md
```

## Task Template

Every created team task must have a real task packet in `task_description`. Use this exact shape so `TaskCreated` and idle hooks can validate it:

```text
Phase: market-discovery
Owner Role: market-researcher
Depends On: none
Context:
- Business goal: explain the market question this lane must answer
- Constraints: include brief-specific audience, geography, and evidence requirements because teammates do not inherit the lead chat history
Artifacts:
- reports/research/YYYYMMDD-[slug]/research-summary.md
- reports/research/YYYYMMDD-[slug]/customer-signals.md
Acceptance Criteria:
- JTBD, pains, triggers, and desired outcomes are evidence-backed
- Sources and quotes are saved
Validation:
- Confirm required artifacts exist
- Confirm report analysis is written in English
```

Optional metadata may still be attached when helpful:
- `requiredArtifacts`
- `validationCommands`
- `enforceArtifactsOnIdle`
- `enforceValidationOnIdle`

Use the optional metadata above when the lead must block `TaskCompleted` or `TeammateIdle` until artifacts exist or validation is explicitly recorded.

## Execution Sequence

1. Derive `YYYYMMDD-[slug]` from the brief.
2. If another team is still attached to this lead session, delete it with `TeamDelete` and verify the deletion succeeded before creating the new team.
3. Create the new team.
4. Create evidence tasks:
   - market and customer language research
   - competitor landscape and switching triggers
   - GA4 / channel analysis using `tools/ga4.js`, `tools/google-search-console.js`, `tools/semrush.js`, or ads tools when credentials exist
   - optional SEO or growth support lane
   - each task description must declare `Phase`, `Owner Role`, `Depends On`, a short `Context`, named `Artifacts`, `Acceptance Criteria`, and `Validation`
5. Spawn teammates using the project agent definitions by name.
6. Monitor `TaskCompleted` and `TeammateIdle`. Reassign only when tasks are truly independent.
7. After evidence tasks complete, dispatch `marketing-strategist` to synthesize `strategy-memo.md`.
8. After all required artifacts exist and the strategy memo is saved, shut down idle teammates and delete the team with `TeamDelete` from the lead session.
9. Only report `team disbanded`, `team fully disbanded`, or equivalent language after `TeamDelete` returns success.
10. Report the saved research folder, strategy memo path, and the next recommended handoff.

## Strategy Memo Requirements

The strategist output must include:

- target audience
- positioning
- channel priorities
- priority experiments
- measurement notes
- concrete dev asks
- PM intake packet
- role handoffs

## Anti-Patterns

- Do not synthesize strategy before evidence artifacts exist.
- Do not let the lead silently do all the work itself.
- Do not run more teammates than the task graph justifies.
- Do not publish or mutate external systems without explicit user approval.
- Do not say a team is disbanded just because teammates look idle; require successful `TeamDelete`.

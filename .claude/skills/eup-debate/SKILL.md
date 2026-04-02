---
name: eup-debate
description: "Manual company operating command for structured debate across marketing and dev. Use when a saved strategy memo or a scoped task should be challenged from both commercial and technical angles before dev intake or planning is locked."
argument-hint: "<question-or-strategy-path>"
disable-model-invocation: true
allowed-tools: Read, Glob, Grep, Bash, Agent, TeamCreate, TeamDelete, TaskCreate, TaskGet, TaskUpdate, TaskList, SendMessage
model: opus
---

# Debate

Run this command inline as the team lead. This is an Agent Teams-first debate workflow for the whole company.

## Goal

Take one problem, strategy memo, or initiative and force the company to argue from both marketing and technical angles before locking the next move.

Debate is only successful if it produces a bounded decision among explicitly named options. Generic discussion, fuzzy "pros and cons", or everyone converging on the same vague answer is a failed debate.

Use this after marketing research is done and a strategy memo already exists, or when the user has a concrete task that should be debated before PM intake or planning.

Use debate only when at least one of these is true:

- there are 2+ viable directions and the wrong choice is costly or slow to reverse
- commercial upside and technical feasibility point in different directions
- the strategy memo still has high-uncertainty assumptions
- the user explicitly asks for challenge, adversarial review, or internal disagreement

Skip debate and move straight to the next workflow when:

- the next move is routine execution with no real decision left
- one option is clearly dominant and already evidence-backed
- an implementation plan is already approved unless the user explicitly wants to reopen the decision

## Prerequisites

Preferred input:

- a saved `reports/strategy/YYYYMMDD-[slug]/strategy-memo.md`

Acceptable fallback:

- a clear debate question or task description in the prompt

If a strategy memo exists, read it first and treat it as the source of truth for the debate context.

## Runtime Rules

1. Before `TeamCreate`, check whether this lead session is already managing another team. If so, call `TeamDelete` on the old team first and confirm success before continuing.
2. If `TeamDelete` fails, stop and tell the user which team is still active. Do not try to create a second team from the same lead session.
3. Call `TeamCreate` only after the old team is fully deleted.
4. If `TeamCreate` fails or is unavailable, stop and tell the user Agent Teams requires Claude Code CLI with `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`.
5. Keep the debate team to 3-5 teammates.
6. Debate output must be durable and saved under the strategy folder so later PM/planning work can consume it.
7. Before thesis tasks start, the moderator must lock a bounded option set with 2-3 materially different options. Include a no-action or defer baseline when that is a realistic alternative.
8. Every round must attack a specific option, cite saved artifacts or file paths, and name what evidence would weaken or kill that option.
9. The lead moderates rounds, tracks progress, and enforces that rebuttals read the opposing artifacts before responding.
10. Rebuttals must concede at least one valid opposing point and either narrow scope, add a condition, or change the recommendation.
11. If no option clearly beats the strongest alternative and the no-action baseline, the final outcome must be "do not lock the decision yet."
12. After `debate-memo.md` is saved and all tasks are complete, shut down idle teammates and delete the team with `TeamDelete`.
13. Only report `team disbanded`, `team fully disbanded`, or equivalent language after `TeamDelete` returns success.

## Debate Team Design

Core lanes:

- `marketing-strategist` — primary market thesis
- `technical-brainstormer` — primary technical thesis
- `implementation-planner` — moderator and final decision memo writer

Choose up to 2 challenge lanes that best fit the debate:

- `growth-manager` — challenge acquisition, activation, monetization, pricing, experimentation assumptions
- `seo-specialist` — challenge discoverability, SEO, content, and IA assumptions
- `ga4-analyst` — challenge KPI interpretation, instrumentation confidence, funnel evidence, and measurement claims
- `project-manager` — challenge delivery scope, sequencing, ownership, and execution risk
- `quality-reviewer` — challenge operational, regression, trust-boundary, and testing risk when the debate hinges on quality or reliability

Use `seo-specialist` when the question is discoverability, content, IA, or SEO-heavy.
Use `growth-manager` when the question is acquisition, activation, monetization, pricing, or experimentation-heavy.
Use `ga4-analyst` when the disagreement depends on KPI quality, funnel interpretation, or tracking confidence.
Use `quality-reviewer` when the disagreement depends on correctness, security, operational safety, or rollback risk.

## Required Debate Artifacts

If a saved strategy memo path is provided, save inside the same strategy folder:

```text
reports/strategy/YYYYMMDD-[slug]/
```

If the prompt is only a debate question, derive a fresh `YYYYMMDD-[slug]` from the question and create:

```text
reports/strategy/YYYYMMDD-[slug]/
```

Required files:

- `debate-brief.md`
- `marketing-thesis.md`
- `dev-thesis.md`
- `marketing-challenge.md`
- `dev-challenge.md`
- `marketing-rebuttal.md`
- `dev-rebuttal.md`
- `debate-memo.md`

## Task Packet Contract

Every debate task must use a real task packet in `task_description` so `TaskCreated`, `TaskCompleted`, and `TeammateIdle` can enforce the workflow.

For artifact-writing lanes such as `marketing-strategist`, `growth-manager`, `seo-specialist`, `ga4-analyst`, `project-manager`, or `implementation-planner`:

```text
Phase: debate
Owner Role: marketing-strategist
Depends On: task-debate-brief
Option Set:
- Option A: creator-led growth
- Option B: SEO-first acquisition
- Option C: defer and keep the current motion
Decision Criteria:
- expected impact
- confidence
- speed to learn
- implementation cost
- reversibility
Context:
- Debate question: choose between creator-led growth and SEO-first acquisition for this initiative
- Lane objective: argue the strongest commercial case for the assigned direction
- Must read: strategy-memo.md and debate-brief.md
Artifacts:
- reports/strategy/YYYYMMDD-[slug]/marketing-thesis.md
Acceptance Criteria:
- recommendation, assumptions, trade-offs, and risks are explicit
- argument engages the real debate question, not generic pros/cons
Validation:
- Confirm marketing-thesis.md exists
- Send a concise summary to the lead and mark the task completed or blocked via TaskUpdate
```

For read-heavy lanes such as `technical-brainstormer` or `quality-reviewer`, include both `Read Scope:` and `Artifacts:` because they must inspect the relevant surface and still save a durable debate artifact:

```text
Phase: debate
Owner Role: technical-brainstormer
Depends On: task-debate-brief
Option Set:
- Option A: creator-led growth
- Option B: SEO-first acquisition
- Option C: defer and keep the current motion
Decision Criteria:
- expected impact
- confidence
- speed to learn
- implementation cost
- reversibility
Context:
- Debate question: choose the technical direction that best supports the commercial goal with acceptable risk
- Lane objective: argue the strongest technical case and explicitly name delivery trade-offs
- Must read: strategy-memo.md and debate-brief.md
Read Scope:
- app/**
- src/**
- plans/**
- docs/**
Artifacts:
- reports/strategy/YYYYMMDD-[slug]/dev-thesis.md
Acceptance Criteria:
- recommendation, architecture implications, reversibility, and delivery risk are explicit
- weakest assumptions are challenged directly
Validation:
- Confirm dev-thesis.md exists
- Send a concise summary to the lead and mark the task completed or blocked via TaskUpdate
```

## Round Structure

### Round 0: Brief

The lead or `implementation-planner` writes `debate-brief.md` with:

- debate question
- source strategy memo path
- decision that must be made
- exact option set with 2-3 materially different options
- no-action or defer baseline when realistic
- constraints
- weighted decision criteria
- kill criteria or invalidation triggers for each option
- evidence gaps that matter before locking the decision
- what counts as winning

The brief should also name the exact option set being debated. If the options are fuzzy, stop and tighten the question before spawning the team.

### Round 1: Thesis

- `marketing-strategist` writes `marketing-thesis.md`
- `technical-brainstormer` writes `dev-thesis.md`

Each thesis must state:

- recommended direction
- why it wins
- assumptions
- trade-offs
- strongest alternative
- why the no-action baseline loses or wins
- what evidence would make this thesis wrong
- what the other side is likely to underestimate

### Round 2: Challenge

- one challenge lane chosen from `growth-manager`, `seo-specialist`, or `ga4-analyst` reads `marketing-thesis.md` and writes `marketing-challenge.md`
- one challenge lane chosen from `project-manager` or `quality-reviewer` reads `dev-thesis.md` and writes `dev-challenge.md`

Each challenge must attack:

- weak assumptions
- timing risk
- execution complexity
- hidden costs
- easier alternatives
- the no-action or defer baseline if the thesis ignores it
- what would have to be true for the thesis to be rejected now

### Round 3: Rebuttal

- `marketing-strategist` reads `dev-thesis.md`, `marketing-challenge.md`, and `dev-challenge.md`, then writes `marketing-rebuttal.md`
- `technical-brainstormer` reads `marketing-thesis.md`, `marketing-challenge.md`, and `dev-challenge.md`, then writes `dev-rebuttal.md`

Use direct `SendMessage` between the challenged thesis owner and the relevant challenge owner when clarification is needed. Avoid `broadcast` unless the moderator is announcing a round change or a shared blocker.

Each rebuttal must:

- concede at least one valid criticism
- update or narrow the recommendation if the criticism lands
- explain why the thesis still beats the strongest alternative
- name the kill criteria that remain unresolved

### Round 4: Decision

- `implementation-planner` reads all debate artifacts and writes `debate-memo.md`

## `debate-memo.md` Requirements

The final memo must include:

- the winning recommendation
- the strongest rejected alternative
- the no-action or defer baseline
- why the winner beats the alternative now
- what assumptions must be true
- what metrics or evidence would invalidate the decision
- what would make the team reopen the decision
- whether the company should decide now, defer, or gather more evidence first
- whether the next handoff is:
  - `/eup-dev-intake`
  - `/eup-plan`
  - updated strategy work
  - no action yet

The memo should include a short decision matrix comparing the winner and the strongest rejected alternative on:

- expected impact
- confidence
- speed to learn
- implementation cost
- reversibility
- operational risk

If the score is effectively tied, the memo must explicitly say the decision is not yet locked and route the work to further research, updated strategy work, or a tighter scoped experiment.

If the debate materially changes technical scope, the memo must explicitly say PM and planning should consume it before reusing the previous plan.

## Task Metadata

Every debate task should carry metadata when useful:

- `phase`
- `requiredArtifacts`
- `validationCommands`
- `enforceArtifactsOnIdle`
- `enforceValidationOnIdle`
- `enforceArtifactsOnCompletion`
- `enforceValidationOnCompletion`

## Anti-Patterns

- Do not let the same person write both the thesis and the challenge against that same thesis.
- Do not synthesize before challenge and rebuttal rounds are complete.
- Do not reduce debate to generic pros/cons.
- Do not debate undefined options or let everyone argue for the same answer.
- Do not ignore the no-action or defer baseline when it is a realistic alternative.
- Do not make unsupported claims sound decisive; weak evidence should reduce confidence, not magically win the debate.
- Do not skip durable artifacts; later workflow steps must be able to read the debate output.
- Do not open a debate for routine work just to make the process feel sophisticated.

---
name: eup-signup-optimization
description: When the user wants to improve signup conversion, reduce registration friction, tighten trial starts, or optimize the acquisition-to-activation handoff. Also use when the user mentions "signup flow," "registration drop-off," "trial signup," "account creation," "reduce friction," "registration conversion," or "why are users not completing signup."
context: fork
agent: growth-manager
allowed-tools: Read, Glob, Grep, WebSearch, WebFetch, Bash, Write, Edit
metadata:
  version: 1.0.0
---

# Signup Optimization

You are focused on getting more qualified users from landing page or ad click to completed account creation.

## Before Starting

- Read `.claude/eup-context.md` first when it exists.
- Read any relevant research, GA4 notes, and plans before proposing changes.
- Assume the product is a language-learning application unless the task says otherwise.

## What To Diagnose

1. Traffic quality: which channels or campaigns are sending users into the flow?
2. Friction points: where do users stall, bounce, or abandon?
3. Intent mismatch: does the promise in ads or landing pages match the signup experience?
4. Data capture: what fields or steps are actually required before a learner can get value?

## Required Output

- Funnel breakdown: visit → CTA click → signup start → account created
- Friction audit: fields, steps, unclear copy, weak trust signals, technical blockers
- 3-5 ranked experiments with expected impact, confidence, and instrumentation needs
- Clear dev asks when implementation is needed

## Language-Learning Heuristics

- Do not ask learners for more information than required before first lesson access.
- Bias toward "start learning now" rather than generic "create account" framing.
- If placement test, language selection, or onboarding quiz exists, decide what belongs before signup vs. after signup.
- Keep first success tightly connected to the acquisition promise: first lesson, first vocabulary set, first speaking exercise, or streak setup.

## Deliverable Format

```markdown
# Signup Optimization Brief

## Funnel Snapshot
- [metric + interpretation]

## Core Friction
- [issue]

## Recommended Experiments
1. [change] — impact / confidence / effort

## Dev Asks
- [specific engineering requirement]
```

## Hard Rules

- You may write docs, plans, or briefs, but you do not edit product code.
- Tie every recommendation to a measurable event or funnel step.
- If analytics is weak, call out the instrumentation gap before pretending certainty.

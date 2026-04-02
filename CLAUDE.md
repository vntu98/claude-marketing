# EUP — Unified Marketing + Dev Pipeline

An AI company-first `eup-*` skill catalog plus a project-level agent roster in `.claude/agents/`. The default company context is a language-learning app business: market research, competitor analysis, GA4 and tracking, strategy synthesis, social distribution, PM orchestration, approval-gated planning, implementation, review, and release.

This repository assumes Claude Code CLI with official Agent Teams enabled. The repo is the source of truth for roles, hooks, skills, artifact contracts, and approval gates; runtime team and task state stay in Claude Code local storage.

Every agent in this company operates at a senior or staff-level bar: explicit trade-offs, evidence-backed decisions, failure-mode awareness, and disciplined handoffs.

## Required Reading

- `.claude/rules/primary-workflow.md`
- `.claude/rules/agent-contracts.md`
- `.claude/rules/engineering-guardrails.md`

## Pipeline

```
/eup-context
      ↓
/eup-market-cycle
      ↓
market-researcher + competitor-analyst + ga4-analyst + seo-specialist|growth-manager
      ↓
marketing-strategist → reports/strategy/YYYYMMDD-[slug]/strategy-memo.md
      ↓
/eup-debate (optional)
      ↓
/eup-dev-intake
      ↓
project-manager + codebase-scout + technical-brainstormer
      ↓
/eup-plan → plans/<slug>/plan.md + task-graph.json + ownership-matrix.md
      ↓
⛔ USER APPROVAL REQUIRED
      ↓
/eup-implement
      ↓
database-engineer + backend-engineer + frontend-engineer + mobile-engineer|fullstack-developer
      ↓
/eup-review → /eup-test → /eup-devops
```

## Marketing Team (16 skills)

| Skill | Role |
|-------|------|
| `eup-context` | Foundation: product, audience, voice, positioning |
| `eup-research` | VOC mining: Reddit, G2, interviews, surveys |
| `eup-strategy` | Strategy memo: positioning, channel priorities, experiments, dev asks |
| `eup-social-content` | Platform-specific posts, batch creation |
| `eup-copywriting` | Headlines, CTAs, landing page copy |
| `eup-copy-editing` | QA with 7 Sweeps Framework |
| `eup-ad-creative` | 100+ ad variations for paid social |
| `eup-email-sequence` | Automated email flows (welcome, nurture) |
| `eup-psychology` | Persuasion: AIDA, Social Proof, Scarcity |
| `eup-analytics` | GA4 events, UTM, conversion tracking |
| `eup-marketing-ideas` | 139 proven marketing ideas |
| `eup-abtest` | A/B test design and statistical rigor |
| `eup-launch` | ORB framework: Owned/Rented/Borrowed |
| `eup-revops` | Lead lifecycle, routing, CRM automation |
| `eup-seo-audit` | SEO audits, crawl/index diagnostics, on-page SEO |
| `eup-site-architecture` | Navigation, URL structure, internal linking, IA handoff |

## Growth Team (4 skills)

| Skill | Role |
|-------|------|
| `eup-signup-optimization` | Signup flow friction, registration completion, activation handoff |
| `eup-onboarding-activation` | First-session activation, lesson completion, habit loops |
| `eup-monetization-paywall` | Upgrade surfaces, paywall offers, monetization experiments |
| `eup-pricing-strategy` | Pricing, packaging, tiering, and monetization framing |

## Dev Team (12 skills)

| Skill | Role |
|-------|------|
| `eup-pm` | **Inline orchestrator**: marketing → dev tasks, main session delegates specialists |
| `eup-scout` | Scout: codebase mapping, dependency tracing, risk discovery |
| `eup-plan` | Architect: tech stack, system design, user approval gate |
| `eup-brainstorm` | Tech consultant: solution evaluation, trade-offs |
| `eup-code` | Full-stack: general implementation |
| `eup-frontend` | React/Next.js/Vue, Tailwind, responsive UI |
| `eup-backend` | APIs, auth, integrations, webhooks |
| `eup-mobile` | Flutter/Dart cross-platform iOS + Android |
| `eup-db` | PostgreSQL/MongoDB schema, migrations |
| `eup-review` | Code review: security, performance, a11y |
| `eup-test` | Unit/integration/E2E, coverage targets |
| `eup-devops` | CI/CD, Docker, Vercel/Railway deploy |

## Standard EUP Commands

| Command | Role |
|---------|------|
| `eup-market-cycle` | Manual marketing intelligence run using Agent Teams and durable research artifacts |
| `eup-debate` | Manual cross-company debate across marketing and dev before intake or planning is locked |
| `eup-dev-intake` | Manual PM/scout/brainstorm intake that writes `dev-intake.md` and feeds planning |
| `eup-implement` | Manual engineering execution from an approved plan and task graph |
| `eup-company-status` | Manual company status summary across strategy, plan, approval, and team progress |
| `eup-scout` | Scout the codebase before planning or implementation |
| `eup-brainstorm` | Explore technical options and recommend one path |
| `eup-plan` | Create the approved multi-phase implementation plan |
| `eup-frontend` | Frontend execution for web UI and learner-facing flows |

## Execution Rules

1. Run `/eup-context` first — skills and agents read `.claude/eup-context.md`
2. `/eup-market-cycle` should save research artifacts under `reports/research/YYYYMMDD-[slug]/`, including `ga4-insights.md` and `channel-scorecard.md` when analytics are in scope
3. `marketing-strategist` must save the handoff artifact at `reports/strategy/YYYYMMDD-[slug]/strategy-memo.md` before dev intake starts
4. `/eup-debate` is the optional cross-company challenge step after strategy and before intake or planning when the decision still needs adversarial review
5. When multiple strategy memos exist and no active strategy state is set, the most recently edited `reports/strategy/**/strategy-memo.md` becomes the active input for `/eup-dev-intake`
6. `/eup-dev-intake` is blocked until that saved strategy memo is complete, and it should save `reports/strategy/YYYYMMDD-[slug]/dev-intake.md`
7. `/eup-plan` writes `plans/<slug>/plan.md` with `Approval Status: pending` plus `task-graph.json` and `ownership-matrix.md`; that plan becomes the active plan automatically
8. No source-code implementation before the user explicitly approves the active plan
9. The main session is the team lead. Teammates claim tasks, report progress through native task updates, and do not recursively spawn more teammates
10. Marketing, PM, growth, and planner roles are restricted to reports/docs/plans/tracking artifacts. Engineers own implementation files
11. Each implementation agent owns distinct files or worktrees — zero overlap

## Senior Company Rule

- All employees in `.claude/agents/` are senior-only and must declare `seniority: senior`.
- Senior outputs are expected to call out trade-offs, operational risk, validation, and rollback implications without skipping straight to implementation.
- If context, ownership, or approval is missing, the right move is to stop and escalate, not improvise.

## Operating Defaults

- If the user does not name a specific app, assume company-level context from `.claude/eup-context.md`.
- `tracking-plan.md` is the canonical measurement plan for GA4, funnel instrumentation, and activation metrics.
- Social scheduling should be prepared with dry-run tooling first (`tools/buffer.js`, `tools/zapier.js`) before any live publish action.
- Marketing and growth data access should prefer local read-only tooling (`tools/ga4.js`, `tools/google-search-console.js`, `tools/semrush.js`, ads tools) and only perform live mutation when the user explicitly asks.
- Optional MCP servers are configured through `.mcp.json` using the example in `.mcp.json.example`.

## Reference Baseline
All workflow-critical skills, hooks, and tools should live inside this repository so the company can operate without depending on external reference folders.

# Agent Contracts

## Common Output

Every project agent ends with:

```markdown
**Status:** DONE | DONE_WITH_CONCERNS | BLOCKED | NEEDS_CONTEXT
**Summary:** 1-2 sentence summary
**Next Handoff:** next agent or user action
```

## Seniority Standard

Every company role is senior-only. Each agent must operate like a senior or staff-level specialist who:

- leads with trade-offs, evidence quality, and explicit assumptions
- surfaces failure modes, rollback implications, and monitoring or validation needs
- escalates unclear ownership, missing context, or approval gaps instead of guessing
- protects workflow discipline: no skipped discovery, planning, review, or testing gates
- hands off crisply with owner, scope, and next decision

## Ownership Table

| Agent | Primary responsibility | May edit files |
|------|-------------------------|----------------|
| `market-researcher` | Market and customer research | Yes, `reports/**` and docs-only research artifacts |
| `competitor-analyst` | Competitor, SEO, positioning intel | Yes, `reports/**` and docs-only research artifacts |
| `ga4-analyst` | GA4, funnel analysis, and measurement plans | Yes, `reports/**`, docs-only measurement artifacts, and `tracking-plan.md` |
| `marketing-strategist` | Strategy memo and experiments | Optional docs/plans only |
| `social-media-manager` | Social publishing, queue setup, scheduling ops | Optional docs/plans/reports only |
| `seo-specialist` | SEO audit, indexation, site architecture, and technical SEO findings | Optional docs/plans/reports only |
| `revops-manager` | Lead lifecycle, routing, CRM automation design | Optional docs/plans only |
| `growth-manager` | Signup, activation, paywall, pricing, experiment backlog | Optional docs/plans only |
| `project-manager` | Backlog, ownership, sequencing, and dev intake packet | Optional `reports/strategy/**/dev-intake.md`, docs, and plans only |
| `codebase-scout` | Codebase topology and risks | No |
| `technical-brainstormer` | Trade-off analysis and recommendation | No |
| `implementation-planner` | Approved implementation plan | Yes, `plans/**` only |
| `database-engineer` | Schema and data layer | Yes |
| `backend-engineer` | APIs, auth, services | Yes |
| `frontend-engineer` | UI, UX, web app code | Yes |
| `mobile-engineer` | Flutter/mobile code | Yes |
| `fullstack-developer` | Small cross-cutting implementation | Yes |
| `quality-reviewer` | Code review and risk callouts | No |
| `qa-tester` | Tests, coverage, build verification | Yes, test scope only |
| `devops-engineer` | CI/CD and release engineering | Yes, with explicit deploy request for live ops |

## Hard Rules

- Research and review roles do not quietly edit source code.
- Research roles may write `reports/**`, measurement docs, and tracking plans, but not product code.
- Marketing ops roles can write docs, plans, or reports, but they do not mutate product code.
- Growth and PM roles can write docs, plans, or dev intake packets, but they do not mutate product code.
- Planner owns `plans/**`; engineers do not rewrite the plan without explicit instruction.
- Tester can add tests in assigned scope but does not rewrite product code unless the task explicitly includes it.
- DevOps never deploys silently.
- In Agent Teams mode, teammates claim tasks explicitly, respect file ownership, and send actionable completion or blocker messages back to the lead.

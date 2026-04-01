# EUP — AI Marketing + Development Pipeline

Claude Code company setup built around official Claude Code primitives: shared instructions in [CLAUDE.md](CLAUDE.md), hooks in [.claude/settings.json](.claude/settings.json), specialist subagents in [.claude/agents](.claude/agents), reusable skills in [.claude/skills](.claude/skills), and Agent Teams runtime orchestration through native task tools. The default operating company is a language-learning app business, and every role runs at a senior or staff-level bar.

Project-local overrides live in `.claude/settings.local.json` and are gitignored. The repo assumes Claude Code CLI with `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` enabled in project settings. All project subagents are described with explicit `Use proactively` routing so Claude Code can auto-delegate them more reliably. Phase 1 runtime hardening is now in place: task packet validation at `TaskCreated`, session-state save/replay, richer teammate context injection, and `worktree` isolation for implementation-capable roles.

## Setup

```bash
cd /path/to/claude-marketing
claude

# Run first — all other skills depend on this
/eup-context
```

Optional:

- Copy `.mcp.json.example` to `.mcp.json` if you want shared docs/browser MCP servers.
- Fill `.env.local` from `.env.example` to unlock live data via `tools/*.js`.

## Runtime Guardrails

The company runtime now enforces these operating rules:

- `TaskCreated` validates that every team task includes a real task packet with owner, dependencies, acceptance criteria, and validation.
- Implementation writes are allowed only when the active plan bundle is truly ready: `Approval Status: approved`, valid `task-graph.json`, and non-empty `ownership-matrix.md`.
- Session snapshots are persisted under `.claude/session-state/` and replayed on `startup`, `resume`, and `compact` so work can continue without re-scoping from memory.
- Teammates receive richer `SubagentStart` context: peers, assigned tasks, active strategy artifact, active plan artifact, and current team progress.
- Implementation-capable roles (`database-engineer`, `backend-engineer`, `frontend-engineer`, `mobile-engineer`, `fullstack-developer`, `qa-tester`, `devops-engineer`) declare `isolation: worktree` for safe parallel execution.
- `TaskCompleted` and `TeammateIdle` update runtime state that feeds the status line and the current handoff view.

## Senior Company Roster

All 20 employees below are senior-only. They are expected to lead with trade-offs, evidence quality, failure modes, validation, rollback, and explicit handoffs.

### Marketing Intelligence

| Employee | Responsibility |
|---------|----------------|
| `market-researcher` | Research customer language, JTBD, pains, triggers, and research artifacts in `reports/research/**` |
| `competitor-analyst` | Benchmark direct, adjacent, and substitute competitors; produce `competitor-landscape.md` |
| `ga4-analyst` | Analyze GA4, audit instrumentation, update `tracking-plan.md`, and turn metrics into decisions |
| `marketing-strategist` | Turn research + analytics into positioning, channel priorities, experiment bets, and concrete dev asks |

### Marketing Ops And Growth

| Employee | Responsibility |
|---------|----------------|
| `social-media-manager` | Build social calendars, queue plans, and dry-run publishing workflows with Buffer/Zapier before live posting |
| `seo-specialist` | Audit crawlability, on-page SEO, internal linking, and site architecture handoff needs |
| `revops-manager` | Define lifecycle stages, CRM routing, automation rules, and marketing-to-sales handoff quality |
| `growth-manager` | Own signup friction, onboarding activation, paywall optimization, pricing, and experiment backlog |

### PM And Planning

| Employee | Responsibility |
|---------|----------------|
| `project-manager` | Convert strategy into backlog, ownership, dependencies, and controller-ready task packets |
| `codebase-scout` | Map the codebase, trace dependencies, and identify the smallest safe change surface |
| `technical-brainstormer` | Compare technical options, trade-offs, and recommend one path |
| `implementation-planner` | Write `plans/<slug>/plan.md`, phases, rollback, tests, and approval-gated implementation scope |

### Engineering, Quality, And Release

| Employee | Responsibility |
|---------|----------------|
| `database-engineer` | Own schema, migrations, indexes, and data-layer changes |
| `backend-engineer` | Own APIs, auth, services, integrations, and server-side workflows |
| `frontend-engineer` | Own web UI, responsive UX, forms, and client-side behavior |
| `mobile-engineer` | Own Flutter/mobile implementation |
| `fullstack-developer` | Own small cross-cutting changes when a specialist split is unnecessary |
| `quality-reviewer` | Run the review gate for correctness, security, performance, and regression risk |
| `qa-tester` | Run real tests/builds and only author tests in approved test scope |
| `devops-engineer` | Own CI/CD, release automation, and deploy only on explicit go-live request |

## The Pipeline

```text
MARKETING                                               DEV
━━━━━━━━━                                              ━━━

/eup-context (company context)
       ↓
/eup-market-cycle
       ↓
market-researcher + competitor-analyst + ga4-analyst + seo-specialist|growth-manager
       ↓
marketing-strategist (save strategy memo)
       ↓
/eup-social-content         ┐
/eup-seo-audit             │
/eup-site-architecture     │ support / refine   →   /eup-dev-intake
/eup-revops                │                            ↓
/eup-signup-optimization   │                      /eup-scout (codebase-scout)
/eup-onboarding-activation │                            ↓
/eup-monetization-paywall  │                      /eup-brainstorm
/eup-pricing-strategy      ┘                            ↓
                                                /eup-plan
                                         (implementation-planner)
                                                      ↓
                                               ⛔ USER APPROVAL
                                                      ↓
                                              /eup-implement
                                                       ↓
                                         /eup-db         ┐
                                         /eup-backend    │ parallel
                                         /eup-frontend   │ specialists
                                         /eup-mobile     │
                                         /eup-code       ┘
                                                      ↓
                                          /eup-review → /eup-test
                                                      ↓
                                       /eup-devops (explicit ship)
```

## Core Company Skills

### Marketing (16)

| Command | What it does |
|---------|-------------|
| `/eup-market-cycle` | Manual Agent Teams workflow: research, competitor intel, GA4/channel analysis, strategy memo |
| `/eup-context` | Product, audience, voice, positioning |
| `/eup-research` | Mine customer language from Reddit, G2, interviews |
| `/eup-strategy` | Strategy memo: positioning, channel priorities, experiments, dev asks |
| `/eup-social-content` | Social posts for LinkedIn, Twitter, Instagram, TikTok |
| `/eup-copywriting` | Headlines, CTAs, landing page copy |
| `/eup-copy-editing` | QA copy with 7 Sweeps Framework |
| `/eup-ad-creative` | 100+ ad variations for paid campaigns |
| `/eup-email-sequence` | Welcome, nurture, re-engagement email flows |
| `/eup-psychology` | AIDA, Social Proof, Scarcity, Loss Aversion |
| `/eup-analytics` | GA4, UTM, conversion tracking setup |
| `/eup-marketing-ideas` | 139 marketing ideas filtered by stage/budget |
| `/eup-abtest` | A/B test design with statistical rigor |
| `/eup-launch` | Launch playbook: Owned/Rented/Borrowed channels |
| `/eup-revops` | Lifecycle stages, lead routing, CRM automation |
| `/eup-seo-audit` | SEO audit: crawlability, indexation, on-page issues |
| `/eup-site-architecture` | Navigation, URL structure, internal linking, IA handoff |

### Growth (4)

| Command | What it does |
|---------|-------------|
| `/eup-signup-optimization` | Reduce signup friction and improve registration completion |
| `/eup-onboarding-activation` | Optimize first-session activation and lesson habit loops |
| `/eup-monetization-paywall` | Improve paywalls, upgrade moments, and monetization offers |
| `/eup-pricing-strategy` | Design pricing, packaging, and tier messaging |

### Dev (12)

| Command | What it does |
|---------|-------------|
| `/eup-dev-intake` | Manual Agent Teams workflow: PM intake, scout, brainstorm, and planning handoff |
| `/eup-implement` | Manual Agent Teams workflow: approved implementation from `task-graph.json` and `ownership-matrix.md` |
| `/eup-company-status` | Read current company state across strategy, plan, approval, and active team progress |
| `/eup-pm` | Manual PM orchestration helper that writes durable `dev-intake.md` packets |
| `/eup-scout` | Fast codebase scouting, dependency tracing, and risk mapping |
| `/eup-plan` | Architect: tech stack, system design, approval gate |
| `/eup-brainstorm` | Evaluate solutions, compare trade-offs |
| `/eup-code` | Full-stack implementation |
| `/eup-frontend` | React/Next.js + Tailwind UI |
| `/eup-backend` | APIs, auth, integrations |
| `/eup-mobile` | Flutter/Dart cross-platform |
| `/eup-db` | PostgreSQL/MongoDB schema + migrations |
| `/eup-review` | Code review: security, performance, a11y |
| `/eup-test` | Unit, integration, E2E tests |
| `/eup-devops` | CI/CD, Docker, deploy to Vercel/Railway |

## Example: End-to-End

```
"I need a landing page to capture leads from our LinkedIn campaign"

1. /eup-context             → load company or app context
2. /eup-research            → collect learner pain points and competitor language
3. /eup-analytics           → define or update GA4 tracking plan
4. /eup-signup-optimization → tighten acquisition flow
5. /eup-strategy            → save strategy memo with positioning, experiments, and dev asks
6. /eup-dev-intake          → write `dev-intake.md`, scout, brainstorm
7. /eup-plan                → write `plan.md`, `task-graph.json`, `ownership-matrix.md` → ⛔ you approve
8. main session delegates approved work:
   - database-engineer: growth and event schema
   - frontend-engineer: landing page and onboarding UI
   - backend-engineer: signup API and tracking endpoints
9. /eup-implement          → orchestrated implementation with task graph + worktree-safe ownership
10. eup-review + eup-test → quality gates
11. /eup-devops          → deploy only when asked
```

## Workflow Files

- Shared settings: `.claude/settings.json`
- Project agents: `.claude/agents/*.md`
- Workflow rules: `.claude/rules/*.md`
- Runtime hooks: `.claude/hooks/*.cjs`
- Session snapshots: `.claude/session-state/latest.md` and `.claude/session-state/archive/*.md`
- Validation: `.claude/scripts/validate-workflow.cjs`
- Tests: `.claude/tests/claude-workflow.test.cjs`
- Measurement plan: `tracking-plan.md`

## Task Packet Contract

Every team task created by `/eup-market-cycle`, `/eup-dev-intake`, or `/eup-implement` should have a `task_description` that follows this contract:

```text
Phase: implementation
Owner Role: backend-engineer
Depends On: task-db
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

Use one of these scope sections depending on the role:

- `Artifacts:` for PM, planner, strategist, and report-writing lanes
- `Read Scope:` for scout, brainstorm, and review lanes
- `File Ownership:` plus `Isolation: worktree` for implementation lanes

If a task packet is incomplete, the `TaskCreated` hook will block it before the teammate starts work.

## Session Recovery

The repo now keeps lightweight workflow memory on disk:

- latest snapshot: `.claude/session-state/latest.md`
- archived snapshots: `.claude/session-state/archive/*.md`

What gets captured:

- active strategy memo and status
- active plan and approval status
- active team, phase, and task progress
- latest completed task or runtime signal

What this changes operationally:

- after `startup`, `resume`, or `compact`, Claude can re-load the saved workflow snapshot
- the right move is to re-open the active plan and strategy, then continue from the saved handoff instead of re-running discovery from scratch

## Validate The Team

```bash
node .claude/scripts/validate-workflow.cjs
node --test .claude/tests/claude-workflow.test.cjs
node --test tools/tests/*.cjs
```

The validation suite checks the workflow contract, role scopes, approval gate, Agent Teams hooks, status line behavior, dry-run marketing tooling, and the `seniority: senior` requirement across the full roster.

It now also covers:

- `TaskCreated` task-packet enforcement
- session-state save/replay
- richer teammate context injection
- `worktree` isolation declarations for implementation roles

## CLI Tools (16)

Node.js scripts in `tools/` for direct API access. `--dry-run` on all.

Recommended usage:

- Treat every external mutation as dry-run first.
- Keep `.env.local` or shell exports local; do not commit secrets.
- Use these scripts as the live-data layer for GA4, GSC, SEO, ads, email, and workflow automation until you wire richer MCP servers.

| Tool | API |
|------|-----|
| `ga4.js` | Google Analytics 4 |
| `buffer.js` | Social scheduling |
| `meta-ads.js` | Facebook/Instagram ads |
| `google-ads.js` | Google Ads |
| `linkedin-ads.js` | LinkedIn ads |
| `tiktok-ads.js` | TikTok ads |
| `mailchimp.js` | Email campaigns |
| `resend.js` | Transactional email |
| `semrush.js` | SEO & competitors |
| `google-search-console.js` | Search performance |
| `hotjar.js` | Heatmaps & recordings |
| `optimizely.js` | A/B testing |
| `typeform.js` | Forms & surveys |
| `airops.js` | AI content pipeline |
| `dub.js` | Link shortener |
| `zapier.js` | Workflow automation |

## Credits

This company workflow is now self-contained inside the repository.

# EUP — AI Marketing + Development Pipeline

Claude Code company setup built around official Claude Code primitives: shared instructions in [CLAUDE.md](CLAUDE.md), hooks in [.claude/settings.json](.claude/settings.json), specialist subagents in [.claude/agents](.claude/agents), and reusable skills in [.claude/skills](.claude/skills). The default operating company is a language-learning app business, and every role runs at a senior or staff-level bar.

Project-local overrides live in `.claude/settings.local.json` and are gitignored. All project subagents are described with explicit `Use proactively` routing so Claude Code can auto-delegate them more reliably.

## Setup

```bash
cd /path/to/claude-marketing
claude

# Run first — all other skills depend on this
/eup-context
```

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
market-researcher + competitor-analyst + ga4-analyst
       ↓
/eup-strategy (marketing-strategist)
       ↓
/eup-social-content         ┐
/eup-seo-audit             │
/eup-site-architecture     │ support / refine   →   /eup-pm (project-manager)
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
| `/eup-pm` | Inline orchestrator: breaks strategy into dev tasks and tells the main session what to delegate |
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
5. /eup-pm                  → break into dev tasks
6. /eup-plan                → design architecture → ⛔ you approve
7. main session delegates approved work:
   - database-engineer: growth and event schema
   - frontend-engineer: landing page and onboarding UI
   - backend-engineer: signup API and tracking endpoints
8. /eup-pm with the approved plan → orchestrated implementation
9. eup-review + eup-test → quality gates
10. /eup-devops          → deploy only when asked
```

## Workflow Files

- Shared settings: `.claude/settings.json`
- Project agents: `.claude/agents/*.md`
- Workflow rules: `.claude/rules/*.md`
- Validation: `.claude/scripts/validate-workflow.cjs`
- Tests: `.claude/tests/claude-workflow.test.cjs`
- Measurement plan: `tracking-plan.md`

## Validate The Team

```bash
node .claude/scripts/validate-workflow.cjs
node --test .claude/tests/claude-workflow.test.cjs
node --test tools/tests/ga4-presets.test.cjs
node --test tools/tests/buffer-dry-run.test.cjs
```

The validation suite checks the workflow contract, role scopes, approval gate, hook behavior, GA4/social dry-run tooling, and now the `seniority: senior` requirement across the full roster.

## CLI Tools (16)

Node.js scripts in `tools/` for direct API access. `--dry-run` on all.

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

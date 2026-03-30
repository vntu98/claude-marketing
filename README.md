# EUP — AI Marketing + Development Pipeline

24 skills, unified `eup-` prefix. One pipeline: **idea → strategy → content → code → ship**.

## Setup

```bash
cd /path/to/claude-marketing
claude

# Run first — all other skills depend on this
/eup-context
```

## The Pipeline

```
MARKETING                              DEV
━━━━━━━━━                             ━━━

/eup-context (foundation)
       ↓
/eup-research (customer voice)
       ↓
/eup-strategy (content plan)
       ↓
/eup-social-content  ┐
/eup-copywriting     │
/eup-ad-creative     │ create     →    /eup-pm (orchestrator)
/eup-email-sequence  │                       ↓
/eup-copy-editing    ┘             /eup-brainstorm → /eup-plan
                                         ↓
                                 ⛔ USER APPROVAL
                                         ↓
                                /eup-db         ┐
                                /eup-backend    │ parallel
                                /eup-frontend   │ subagents
                                /eup-mobile     ┘
                                         ↓
                                /eup-review → /eup-test
                                         ↓
                                   /eup-devops (ship)
```

## All 24 Skills

### Marketing (13)

| Command | What it does |
|---------|-------------|
| `/eup-context` | Product, audience, voice, positioning |
| `/eup-research` | Mine customer language from Reddit, G2, interviews |
| `/eup-strategy` | Content pillars, topic clusters, calendar |
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

### Dev (11)

| Command | What it does |
|---------|-------------|
| `/eup-pm` | Orchestrator: breaks strategy into dev tasks, spawns parallel agents |
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

1. /eup-context          → set up product context (if not done)
2. /eup-copywriting      → write landing page copy
3. /eup-pm               → break into dev tasks
4. /eup-plan             → design architecture → ⛔ you approve
5. eup-pm spawns parallel:
   - eup-db: leads schema
   - eup-frontend: landing page
   - eup-backend: lead capture API
6. eup-review + eup-test → quality gates
7. /eup-devops           → deploy
```

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

Marketing skills from [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills). Licensed under MIT.

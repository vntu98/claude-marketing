# EUP — Unified Marketing + Dev Pipeline

24 AI skills with `eup-` prefix. One flow: idea → strategy → content → code → ship.

## Pipeline

```
/eup-context → /eup-research → /eup-strategy → /eup-social-content + /eup-copywriting + /eup-ad-creative + /eup-email
                                                          ↓
                                              /eup-pm → /eup-plan → ⛔ USER APPROVAL
                                                          ↓
                                    /eup-db + /eup-backend + /eup-frontend + /eup-mobile
                                                          ↓
                                              /eup-review → /eup-test → /eup-devops
```

## Marketing Team (13 skills)

| Skill | Role |
|-------|------|
| `eup-context` | Foundation: product, audience, voice, positioning |
| `eup-research` | VOC mining: Reddit, G2, interviews, surveys |
| `eup-strategy` | Content pillars, topic clusters, calendar |
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

## Dev Team (11 skills)

| Skill | Role |
|-------|------|
| `eup-pm` | **Orchestrator**: marketing → dev tasks, spawns parallel subagents |
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

## Execution Rules

1. Run `/eup-context` first — all skills read this
2. Marketing creates strategy → Dev implements it
3. `/eup-plan` MUST get user approval before dev starts
4. `/eup-pm` spawns parallel subagents (context: fork)
5. Each subagent owns distinct files — zero overlap

## Reference Repo
Source marketing skills: `./marketingskills/` (cloned from GitHub)

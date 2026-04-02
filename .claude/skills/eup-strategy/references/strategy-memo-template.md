# Strategy Memo Template

Use this structure for every saved strategy handoff at:

`reports/strategy/YYYYMMDD-[slug]/strategy-memo.md`

Rules:
- Analysis, decisions, and recommendations must be written in English
- A memo should lock only one strategic decision or one tightly related initiative
- If the downstream consumer is PM or implementation planning, fully populate `Concrete Dev Asks`, `PM Intake Packet`, and `Role Handoffs`

## strategy-memo.md

```markdown
# Strategy Memo

## Executive Summary
- Business context and goal
- Decision to finalize
- Confidence level

## Target Audience
- Priority ICP / segment
- Most important pain or job
- Primary evidence reference

## Positioning
- Problem to lead with
- Promise to make
- Message to avoid or competitor frame to reject

## Strategic Wedge
- Why this wedge now
- Why the other wedges lost
- Explicit non-goals

## Channel Priorities
| Channel | Role | Why it matters now | Conditions to win |
|------|---------|---------------|--------------------|
| Search / SEO | ... | ... | ... |
| Social | ... | ... | ... |

## Priority Experiments
| Experiment | Goal | Confidence | Owner | Gating |
|------------|----------|------------|-------|--------|
| ... | ... | High / Medium / Low | ... | ... |

## Measurement Notes
- Primary KPI
- Instrumentation gap
- Success criteria
- Measurement owner

## Concrete Dev Asks
- Surface or flow to build or update
- Tracking / analytics requirements
- Automation / CMS / integration needs
- Dependencies or preconditions

## PM Intake Packet
- Business outcome needing technical support
- User or ops flow in scope
- Required surfaces
- Tracking requirements
- Dependencies
- Risks / unknowns
- Out of scope

## Role Handoffs
- `project-manager`: which backlog slice to scope first
- `social-media-manager`: what to do next
- `seo-specialist`: which IA, content, or discoverability area to refine
- `revops-manager`: which lifecycle, CRM, or routing preparation is needed
- `growth-manager`: which funnel or monetization hypothesis to pick up next
```

# Plan Template

## plan.md (Overview)

Example phase files for the same plan folder:

- `phase-01-foundation.md`
- `phase-02-data-and-backend.md`
- `phase-03-product-and-ux.md`
- `phase-04-integrations.md`
- `phase-05-quality-and-release.md`

```markdown
---
title: "[Project Name]"
description: "[One-line outcome]"
status: pending
priority: P1
effort: 5d
created: 2026-03-31
tags: [marketing, dev]
---

# Plan: [Project Name]

Approval Status: pending

## Context
[Why this project exists — what marketing strategy or business need it serves]

## Tech Stack
| Layer | Choice | Rationale |
|-------|--------|-----------|
| Frontend | Next.js 14 + Tailwind | SSR, API routes, team familiarity |
| Backend | NestJS / Express | [reason] |
| Database | PostgreSQL | [reason] |
| Mobile | Flutter | [reason] |
| Auth | Better Auth | [reason] |
| Hosting | Vercel + Railway | [reason] |
| Email | Resend | [reason] |

## Architecture
[Mermaid diagram here]

## Phases
| Phase | Name | Skills | Effort | Dependencies |
|-------|------|--------|--------|-------------|
| 1 | Foundation | eup-db, eup-backend | 1-2 days | None |
| 2 | Core Features | eup-frontend, eup-backend | 3-5 days | Phase 1 |
| 3 | Integration | eup-backend | 1-2 days | Phase 2 |
| 4 | Polish & Deploy | eup-review, eup-test, eup-devops | 1-2 days | Phase 3 |

## Ownership
| Phase | Owner | File Scope |
|-------|-------|------------|
| 1 | database-engineer | `src/db/**` |
| 2 | backend-engineer | `src/api/**` |
| 3 | frontend-engineer | `src/components/**`, `src/app/**` |
| 4 | quality-reviewer + qa-tester + devops-engineer | tests, CI, deploy config |

## Risks
- [Risk 1]: [Mitigation]
- [Risk 2]: [Mitigation]
```

## phase-XX-name.md (Phase Detail)

```markdown
# Phase [N]: [Name]

## Overview
- **Priority:** P0
- **Effort:** [X days]
- **Skills involved:** eup-db, eup-backend
- **Owner:** database-engineer
- **Blocked by:** [Phase N-1 or None]

## Functional Requirements
1. [Requirement with acceptance criteria]
2. [Requirement with acceptance criteria]

## Non-Functional Requirements
- Response time < 200ms for API endpoints
- Mobile-responsive down to 320px width
- WCAG 2.1 AA accessibility compliance

## Architecture Notes
[Any architecture decisions specific to this phase]

## Files to Create

### New Files
| File | Purpose | Skill |
|------|---------|-------|
| `src/db/schema/leads.ts` | Leads table schema | eup-db |
| `src/api/routes/leads.ts` | Lead capture endpoint | eup-backend |
| `src/components/LeadForm.tsx` | Lead capture form | eup-frontend |

### Files to Modify
| File | Change | Skill |
|------|--------|-------|
| `src/db/index.ts` | Add leads table export | eup-db |
| `src/api/router.ts` | Register leads routes | eup-backend |

## Implementation Steps

### Step 1: Database Schema (eup-db)
1. Create `src/db/schema/leads.ts` with columns: id, email, name, source, utm_*, created_at
2. Add index on email (unique) and created_at
3. Run migration: `npx drizzle-kit generate && npx drizzle-kit migrate`

### Step 2: API Endpoint (eup-backend)
1. Create `src/api/routes/leads.ts` with POST /api/leads
2. Validate input: email (required, valid format), name (optional)
3. Store lead in database
4. Trigger welcome email via Resend
5. Return 201 with lead ID

### Step 3: Frontend Form (eup-frontend)
1. Create `src/components/LeadForm.tsx`
2. Form fields: email (required), name (optional)
3. Client-side validation before submit
4. Success/error state handling
5. GA4 event on successful submission

## Success Criteria
- [ ] POST /api/leads returns 201 for valid input
- [ ] POST /api/leads returns 422 for invalid email
- [ ] Lead appears in database after submission
- [ ] Welcome email sent within 30 seconds
- [ ] GA4 event fires on form submission
- [ ] Form works on mobile (320px+)

## Test Plan
- Unit: Input validation, email format checking
- Integration: API endpoint with test database
- E2E: Full form submission flow

## Rollback
- Revert migration [name]
- Disable endpoint behind feature flag if release regression appears
```

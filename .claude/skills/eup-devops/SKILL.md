---
name: eup-devops
description: "When the user wants to deploy, set up CI/CD, containerize, or manage infrastructure. Also use when the user mentions 'deploy,' 'deployment,' 'CI/CD,' 'Docker,' 'Kubernetes,' 'hosting,' 'infrastructure,' 'pipeline,' 'GitHub Actions,' 'Vercel,' 'Cloudflare,' 'Railway,' 'environment variables,' 'production,' 'staging,' 'go live,' or 'ship it.' Use as the final step before going live."
disable-model-invocation: true
context: fork
agent: devops-engineer
allowed-tools: Read, Glob, Grep, Write, Edit, Bash
metadata:
  version: 1.1.0
---

# DevOps Engineer

You are a DevOps engineer who handles deployment, CI/CD, and infrastructure. You are the last step in the pipeline: after code is written, reviewed, and tested, you make it live.

## Before Starting

**Check for product marketing context first:**
If `.claude/eup-context.md` exists, read it for project context.

**Check for existing plans:**
If `./plans/` contains relevant plan files, read the deployment and infrastructure requirements.

**Verify gates passed:**
Before deploying, confirm:
1. [ ] Code reviewed by `eup-review`?
2. [ ] Tests passing (`eup-test`)?
3. [ ] Environment variables configured?

## Platform Selection

| Project Type | Platform | Why |
|-------------|----------|-----|
| Next.js web app | **Vercel** | Zero-config, automatic previews, edge functions |
| Static site | **Cloudflare Pages** | Global CDN, fast, free tier |
| Node.js backend | **Railway** | Easy, good free tier, auto-deploy |
| Docker containers | **Fly.io** or **Cloud Run** | Global, auto-scaling |
| PostgreSQL | **Supabase** or **Neon** | Managed, good free tier |
| Redis | **Upstash** | Serverless, pay-per-request |
| Full infra | **GCP** or **AWS** | Complete control, enterprise |

## CI/CD: GitHub Actions

### Basic Pipeline

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test

  deploy:
    needs: lint-and-test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

For more CI/CD templates, see [references/ci-cd-templates.md](references/ci-cd-templates.md).

## Docker

### Multi-Stage Dockerfile (Node.js)

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

For Docker patterns, see [references/docker-patterns.md](references/docker-patterns.md).

## Environment Variables

### Structure

```bash
# .env.example (committed — no real values)
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname
RESEND_API_KEY=re_xxxx
GA4_MEASUREMENT_ID=G-XXXX
NEXT_PUBLIC_APP_URL=http://localhost:3000

# .env.local (gitignored — real values)
DATABASE_URL=postgresql://real-connection-string
RESEND_API_KEY=re_real_key
```

### Rules

1. **Never commit `.env`** — Only `.env.example` with placeholder values
2. **Prefix public vars** — `NEXT_PUBLIC_` for client-side access in Next.js
3. **Validate on startup** — Fail fast if required vars are missing
4. **Use platform secrets** — Vercel Environment Variables, Railway Secrets, GitHub Secrets

```typescript
// lib/env.ts — Validate env vars on startup
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  RESEND_API_KEY: z.string().startsWith('re_'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export const env = envSchema.parse(process.env);
```

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Code reviewed and approved
- [ ] Environment variables set in platform
- [ ] Database migrations ready
- [ ] No secrets in code
- [ ] CORS configured for production domain
- [ ] Error tracking set up (Sentry)

### Deployment Steps
1. Run database migrations (if any)
2. Deploy backend services
3. Deploy frontend
4. Run smoke tests
5. Monitor error rates for 15 minutes

### Post-Deployment
- [ ] Smoke tests pass (can load pages, submit forms)
- [ ] No spike in error rates
- [ ] Performance acceptable (check Core Web Vitals)
- [ ] SSL certificate active
- [ ] Analytics tracking confirmed

## Branch Strategy

```
main ──────────────────────────── Production
  │
  ├── dev ─────────────────────── Staging (auto-deploy)
  │     │
  │     ├── feature/lead-form ─── Preview (PR deploy)
  │     └── fix/email-bug ─────── Preview (PR deploy)
  │
  └── (hotfix/critical-fix) ───── Direct to main (emergency only)
```

## Monitoring

| Tool | Purpose | Free Tier |
|------|---------|-----------|
| **Sentry** | Error tracking | 5K events/mo |
| **Better Stack** | Uptime monitoring | 10 monitors |
| **Vercel Analytics** | Web Vitals | Included |
| **Axiom** | Log aggregation | 500MB/mo |

## Related Skills

**Upstream:**
- **eup-review**: Code must be reviewed before deploy
- **eup-test**: Tests must pass before deploy

**Cross-reference:**
- **eup-analytics**: For verifying GA4 events in production
- **eup-launch**: For coordinating deploy with launch campaigns
- **eup-pm**: For reporting deployment status

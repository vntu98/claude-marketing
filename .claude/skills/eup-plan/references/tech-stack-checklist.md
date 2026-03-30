# Tech Stack Evaluation Checklist

## Decision Framework

Score each option 1-5 on these criteria:

| Criteria | Weight | Questions to Ask |
|----------|--------|-----------------|
| Team familiarity | 25% | Has the team used this before? Learning curve? |
| Time to market | 25% | How fast can we ship v1? Boilerplate available? |
| Scalability | 20% | Can it handle 10x growth? Horizontal scaling? |
| Ecosystem | 15% | Libraries, community, documentation quality? |
| Cost | 15% | Hosting costs at current and projected scale? |

## Common Stack Patterns

### Marketing Website / Landing Page
```
Frontend: Next.js 14 (App Router) + Tailwind CSS
Backend:  Next.js API Routes (or separate Express)
Database: PostgreSQL (via Drizzle ORM)
Hosting:  Vercel (auto-deploy from Git)
Email:    Resend + React Email
Analytics: GA4 + GTM
```
**Best for:** Lead capture, content sites, campaign landing pages

### SaaS Dashboard
```
Frontend: Next.js 14 + shadcn/ui + Tailwind
Backend:  NestJS or Next.js API Routes
Database: PostgreSQL + Redis (caching)
Auth:     Better Auth or NextAuth.js
Hosting:  Vercel (FE) + Railway (BE) + Supabase (DB)
```
**Best for:** Social media dashboard, analytics tools, CMS

### API-First Backend
```
Runtime:  Node.js (Express/Fastify) or Python (FastAPI)
Database: PostgreSQL + Redis
Auth:     JWT + refresh tokens
Queue:    BullMQ (Node) or Celery (Python)
Hosting:  Railway / Render / Cloud Run
```
**Best for:** Mobile app backend, microservices, integrations

### Mobile App
```
Framework: Flutter (Dart)
State:     Riverpod or BLoC
HTTP:      Dio
Storage:   Hive (local) + API (remote)
Backend:   Any of the above API patterns
```
**Best for:** Cross-platform iOS + Android apps

## Hosting Cost Comparison

| Platform | Free Tier | Paid From | Best For |
|----------|-----------|-----------|----------|
| Vercel | 100GB BW, serverless | $20/mo | Next.js, static sites |
| Railway | $5 credit/mo | $5/mo | Backends, databases |
| Supabase | 500MB DB, 50K auth | $25/mo | PostgreSQL + Auth |
| Render | Static sites free | $7/mo | Docker, backends |
| Fly.io | 3 shared VMs | Pay-per-use | Global edge, containers |
| Cloudflare | Workers free tier | $5/mo | Edge functions, R2 storage |

## Database Selection Guide

| Use Case | Choose | Why |
|----------|--------|-----|
| Relational data, complex queries | PostgreSQL | ACID, JOINs, JSON support |
| Flexible schema, rapid prototyping | MongoDB | Schema-less, quick iteration |
| Key-value cache | Redis | Speed, pub/sub, queues |
| Full-text search | PostgreSQL (pg_trgm) or Meilisearch | Built-in or dedicated |
| Time-series data | TimescaleDB (PG extension) | Compression, continuous aggs |

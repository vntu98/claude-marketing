# Task Templates

## Landing Page Project

```markdown
### P0: Database
- [ ] Design leads table schema (eup-db) — S
- [ ] Create migration files (eup-db) — S

### P0: Backend
- [ ] Lead capture API endpoint (eup-backend) — M
- [ ] Form validation (eup-backend) — S
- [ ] Email notification on new lead (eup-backend) — S

### P1: Frontend
- [ ] Landing page layout from copy (eup-frontend) — L
- [ ] Lead capture form component (eup-frontend) — M
- [ ] Thank-you page (eup-frontend) — S
- [ ] Responsive testing (eup-frontend) — S

### P1: Tracking
- [ ] GA4 conversion event (eup-backend) — S
- [ ] UTM parameter handling (eup-backend) — S
- [ ] Meta/LinkedIn pixel (eup-frontend) — S

### P2: Optimization
- [ ] A/B test setup for hero CTA (eup-frontend) — M
- [ ] Performance optimization (eup-frontend) — S
```

## Social Media Dashboard

```markdown
### P0: Database
- [ ] Posts table with platform enum (eup-db) — M
- [ ] Scheduling queue table (eup-db) — S
- [ ] Analytics snapshots table (eup-db) — S

### P0: Backend
- [ ] CRUD API for posts (eup-backend) — M
- [ ] Buffer API integration (eup-backend) — L
- [ ] Scheduling worker/cron (eup-backend) — M

### P1: Frontend
- [ ] Content calendar view (eup-frontend) — L
- [ ] Post composer with preview (eup-frontend) — L
- [ ] Analytics dashboard (eup-frontend) — M

### P1: Mobile
- [ ] Post creation flow (eup-mobile) — L
- [ ] Push notification for scheduled posts (eup-mobile) — M

### P2: Integration
- [ ] GA4 traffic source overlay (eup-backend) — M
- [ ] Auto-suggest best posting times (eup-backend) — M
```

## Email Automation System

```markdown
### P0: Database
- [ ] Subscribers table (eup-db) — S
- [ ] Email sequences table (eup-db) — M
- [ ] Send log table (eup-db) — S

### P0: Backend
- [ ] Resend/Mailchimp integration (eup-backend) — L
- [ ] Sequence trigger engine (eup-backend) — L
- [ ] Webhook receiver for events (eup-backend) — M

### P1: Frontend
- [ ] Sequence builder UI (eup-frontend) — XL
- [ ] Email template editor (eup-frontend) — L
- [ ] Subscriber management (eup-frontend) — M

### P2: Analytics
- [ ] Open/click rate dashboard (eup-frontend) — M
- [ ] A/B test for subject lines (eup-backend) — M
```

## Mobile App (Flutter)

```markdown
### P0: Setup
- [ ] Flutter project scaffolding (eup-mobile) — M
- [ ] API client setup with auth (eup-mobile) — M
- [ ] Navigation structure (eup-mobile) — M

### P1: Core Screens
- [ ] Dashboard/home screen (eup-mobile) — L
- [ ] Content list with filters (eup-mobile) — M
- [ ] Detail/edit screen (eup-mobile) — M
- [ ] Settings/profile (eup-mobile) — S

### P1: Backend Support
- [ ] Mobile-optimized API endpoints (eup-backend) — M
- [ ] Push notification service (eup-backend) — M

### P2: Polish
- [ ] Offline mode with local cache (eup-mobile) — L
- [ ] App store assets and submission (eup-mobile) — M
```

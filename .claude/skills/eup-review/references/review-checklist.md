# Code Review Checklist

## General
- [ ] Code compiles/runs without errors
- [ ] No `console.log` or debug statements left in
- [ ] No commented-out code
- [ ] No `any` types in TypeScript
- [ ] File sizes under 200 lines
- [ ] Consistent naming conventions
- [ ] No duplicate code (DRY)
- [ ] Imports are used (no unused imports)

## Security
- [ ] No hardcoded secrets, API keys, or passwords
- [ ] User input validated at API boundary (Zod/Joi)
- [ ] SQL queries use parameterized statements (ORM)
- [ ] Auth middleware on all protected routes
- [ ] CORS configured for specific origins
- [ ] Rate limiting on public/auth endpoints
- [ ] Error responses don't leak internal details
- [ ] No `eval()`, `innerHTML`, or other XSS vectors
- [ ] File uploads validated (type, size)
- [ ] HTTPS enforced in production

## API (Backend)
- [ ] RESTful conventions (proper HTTP methods, status codes)
- [ ] Input validation with clear error messages
- [ ] Pagination on list endpoints
- [ ] Consistent error response format
- [ ] Proper HTTP status codes (201 for create, 404 for not found, etc.)
- [ ] No N+1 database queries
- [ ] Database transactions where needed
- [ ] Idempotent operations where appropriate

## Frontend (React/Next.js)
- [ ] Server Components by default (minimal `'use client'`)
- [ ] `key` prop on all list items
- [ ] No unnecessary re-renders (check effect dependencies)
- [ ] Loading and error states handled
- [ ] Images use `next/image` with proper dimensions
- [ ] Forms have validation (client + server)
- [ ] Responsive at all breakpoints (320px - 1920px)

## Accessibility
- [ ] Semantic HTML elements used
- [ ] All images have alt text
- [ ] Form inputs have labels
- [ ] Focus management correct
- [ ] Color contrast >= 4.5:1
- [ ] Keyboard navigation works
- [ ] Screen reader tested (basic)

## Mobile (Flutter)
- [ ] Works on both iOS and Android
- [ ] Handles device rotation
- [ ] Respects system font size
- [ ] Loading/error/empty states for all async data
- [ ] Back button/gesture handled
- [ ] Dark mode supported
- [ ] No overflow at any screen size

## Database
- [ ] Indexes on frequently queried columns
- [ ] Migrations are reversible
- [ ] No raw SQL (use ORM methods)
- [ ] Proper constraints (NOT NULL, UNIQUE, FK)
- [ ] Timestamps on all tables
- [ ] Soft delete where appropriate

## Testing
- [ ] Critical paths have tests
- [ ] Edge cases covered
- [ ] No flaky tests
- [ ] Test data doesn't depend on external state
- [ ] Mocks are minimal (prefer real implementations)

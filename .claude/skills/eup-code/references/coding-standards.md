# Coding Standards

## File Organization

```
✅ Good: Feature-based, colocated
src/features/leads/
├── lead-form.tsx          # Component
├── lead-form.test.tsx     # Test next to component
├── lead-service.ts        # Business logic
├── lead-types.ts          # Types/interfaces
└── use-lead-form.ts       # Custom hook

❌ Bad: Type-based, scattered
src/components/lead-form.tsx
src/tests/lead-form.test.tsx
src/services/lead-service.ts
src/types/lead-types.ts
src/hooks/use-lead-form.ts
```

## Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Files | kebab-case | `lead-capture-form.tsx` |
| Components | PascalCase | `LeadCaptureForm` |
| Functions | camelCase | `createLead` |
| Constants | UPPER_SNAKE | `MAX_RETRIES` |
| Types/Interfaces | PascalCase | `Lead`, `CreateLeadInput` |
| CSS classes | Tailwind utilities | `className="px-4 py-2"` |
| Database tables | snake_case | `lead_events` |
| API routes | kebab-case | `/api/leads` |
| Env variables | UPPER_SNAKE | `DATABASE_URL` |

## Error Handling

```typescript
// ✅ Specific error handling
try {
  const lead = await createLead(data);
  return { success: true, data: lead };
} catch (error) {
  if (error instanceof z.ZodError) {
    return { success: false, error: 'Validation failed', details: error.errors };
  }
  if (error instanceof UniqueConstraintError) {
    return { success: false, error: 'Email already exists' };
  }
  throw error; // Re-throw unexpected errors
}

// ❌ Generic catch-all
try {
  const lead = await createLead(data);
} catch (e) {
  console.log('error');  // Swallowed, no context
}
```

## Import Order

```typescript
// 1. External libraries
import { z } from 'zod';
import { db } from 'drizzle-orm';

// 2. Internal modules (absolute paths)
import { leads } from '@/db/schema/leads';
import { AppError } from '@/lib/errors';

// 3. Relative imports
import { LeadCard } from './lead-card';
import type { Lead } from './types';
```

## Comments

```typescript
// ✅ Explain WHY, not WHAT
// Buffer API has a 10-request/second rate limit per profile
await rateLimiter.acquire('buffer');

// ❌ Useless comment
// Create a new lead
const lead = await createLead(data);
```

## Git Commit Messages

```
feat: add lead capture API endpoint
fix: prevent duplicate email submissions
refactor: extract validation into shared schema
test: add integration tests for lead API
```

## Code Smell Checklist

Before submitting code, check for:
- [ ] No `any` types
- [ ] No `console.log` left in (use proper logging)
- [ ] No commented-out code
- [ ] No hardcoded strings (use constants or env vars)
- [ ] No unused imports
- [ ] No files > 200 lines
- [ ] No functions > 50 lines
- [ ] No deeply nested callbacks (> 3 levels)

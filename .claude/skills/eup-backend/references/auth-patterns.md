# Authentication Patterns

## JWT + Refresh Token Flow

```
┌─────────┐          ┌─────────┐          ┌──────────┐
│  Client  │          │   API   │          │ Database │
└────┬─────┘          └────┬────┘          └────┬─────┘
     │ POST /auth/login    │                    │
     │ { email, password } │                    │
     ├────────────────────>│                    │
     │                     │ verify credentials │
     │                     ├───────────────────>│
     │                     │    user data       │
     │                     │<───────────────────┤
     │  { accessToken,     │                    │
     │    refreshToken }   │ store refreshToken │
     │<────────────────────┤───────────────────>│
     │                     │                    │
     │ GET /api/leads      │                    │
     │ Auth: Bearer <at>   │                    │
     ├────────────────────>│                    │
     │                     │ verify JWT         │
     │    { data: [...] }  │                    │
     │<────────────────────┤                    │
     │                     │                    │
     │ (access token       │                    │
     │  expired)           │                    │
     │                     │                    │
     │ POST /auth/refresh  │                    │
     │ { refreshToken }    │                    │
     ├────────────────────>│                    │
     │                     │ verify RT in DB    │
     │                     ├───────────────────>│
     │  { accessToken }    │ rotate RT          │
     │<────────────────────┤───────────────────>│
```

## Implementation (Better Auth)

```typescript
// lib/auth.ts
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './db';

export const auth = betterAuth({
  database: drizzleAdapter(db),
  emailAndPassword: { enabled: true },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,  // 7 days
    updateAge: 60 * 60 * 24,       // refresh daily
  },
});
```

## Middleware Pattern

```typescript
// middleware/auth.ts
import { auth } from '../lib/auth';

export async function requireAuth(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
  }
  return session;
}

export async function requireRole(req: Request, role: string) {
  const session = await requireAuth(req);
  if (session.user.role !== role) {
    throw new AppError(403, 'FORBIDDEN', 'Insufficient permissions');
  }
  return session;
}
```

## API Key Authentication (for service-to-service)

```typescript
// For webhook endpoints and external integrations
function verifyApiKey(req: Request) {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.API_KEY) {
    throw new AppError(401, 'INVALID_API_KEY', 'Invalid API key');
  }
}
```

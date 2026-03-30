# API Design Patterns

## Project Structure (Next.js API Routes)

```
src/
├── app/
│   └── api/
│       ├── auth/
│       │   ├── login/route.ts
│       │   ├── register/route.ts
│       │   └── refresh/route.ts
│       ├── leads/
│       │   ├── route.ts          # GET (list), POST (create)
│       │   └── [id]/route.ts     # GET, PATCH, DELETE
│       ├── posts/
│       │   ├── route.ts
│       │   └── [id]/route.ts
│       └── webhooks/
│           ├── stripe/route.ts
│           └── resend/route.ts
├── lib/
│   ├── auth.ts                   # Auth utilities
│   ├── db.ts                     # Database client
│   └── validation.ts             # Shared Zod schemas
├── services/
│   ├── lead-service.ts           # Lead business logic
│   ├── email-service.ts          # Email sending
│   └── analytics-service.ts      # GA4 events
└── integrations/
    ├── buffer.ts                 # Buffer API client
    ├── resend.ts                 # Resend API client
    └── ga4.ts                    # GA4 Measurement Protocol
```

## Project Structure (Express/NestJS)

```
src/
├── controllers/
│   ├── lead.controller.ts
│   ├── auth.controller.ts
│   └── post.controller.ts
├── services/
│   ├── lead.service.ts
│   ├── auth.service.ts
│   └── email.service.ts
├── middleware/
│   ├── auth.middleware.ts
│   ├── validation.middleware.ts
│   └── rate-limit.middleware.ts
├── routes/
│   ├── lead.routes.ts
│   ├── auth.routes.ts
│   └── index.ts
├── integrations/
│   └── ...
└── utils/
    ├── errors.ts
    └── logger.ts
```

## Pagination Pattern

```typescript
interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

async function paginate<T>(
  query: any,
  page: number = 1,
  limit: number = 20
): Promise<PaginatedResponse<T>> {
  const offset = (page - 1) * limit;
  const [data, total] = await Promise.all([
    query.limit(limit).offset(offset),
    query.count(),
  ]);
  return {
    data,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
}
```

## Error Handling Pattern

```typescript
class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
  }
}

// Usage
throw new AppError(404, 'NOT_FOUND', 'Lead not found');
throw new AppError(422, 'VALIDATION_ERROR', 'Invalid input', zodErrors);

// Global error handler
function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: { code: err.code, message: err.message, details: err.details }
    });
  }
  // Don't leak internal errors
  console.error(err);
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' } });
}
```

## Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

// General API: 100 req/min
const apiLimiter = rateLimit({ windowMs: 60_000, max: 100 });

// Auth endpoints: 5 req/min
const authLimiter = rateLimit({ windowMs: 60_000, max: 5 });

app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);
```

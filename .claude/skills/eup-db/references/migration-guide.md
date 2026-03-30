# Database Migration Guide

## Drizzle ORM Workflow

### Setup
```bash
npm install drizzle-orm postgres
npm install -D drizzle-kit
```

### drizzle.config.ts
```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema/*',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

### Commands
```bash
npx drizzle-kit generate    # Generate migration from schema diff
npx drizzle-kit migrate     # Run pending migrations
npx drizzle-kit push        # Push schema directly (dev only)
npx drizzle-kit studio      # Visual schema browser
```

## Migration Best Practices

### 1. One Change Per Migration
```
✅ 0001_add_leads_table.sql
✅ 0002_add_leads_source_column.sql
✅ 0003_add_leads_email_index.sql

❌ 0001_add_everything.sql
```

### 2. Always Reversible
```sql
-- UP
ALTER TABLE leads ADD COLUMN phone VARCHAR(20);

-- DOWN
ALTER TABLE leads DROP COLUMN phone;
```

### 3. Non-Destructive First
When changing schemas in production:
1. **Add** new column (nullable or with default)
2. **Deploy** code that writes to both old and new
3. **Migrate** data from old to new
4. **Deploy** code that reads from new only
5. **Remove** old column

### 4. Seed Data
```typescript
// src/db/seed.ts
import { db } from './index';
import { leads } from './schema/leads';

async function seed() {
  await db.insert(leads).values([
    { email: 'test@example.com', name: 'Test User', source: 'organic' },
    { email: 'demo@example.com', name: 'Demo User', source: 'paid' },
  ]);
}

seed().then(() => process.exit(0));
```

## Common Migration Patterns

### Add Column with Default
```sql
ALTER TABLE posts ADD COLUMN status VARCHAR(20) DEFAULT 'draft' NOT NULL;
```

### Rename Column (safe)
```sql
-- Step 1: Add new column
ALTER TABLE posts ADD COLUMN post_status VARCHAR(20);
-- Step 2: Copy data
UPDATE posts SET post_status = status;
-- Step 3: Drop old column (after code is updated)
ALTER TABLE posts DROP COLUMN status;
-- Step 4: Rename new column
ALTER TABLE posts RENAME COLUMN post_status TO status;
```

### Add Index Concurrently (no downtime)
```sql
CREATE INDEX CONCURRENTLY idx_leads_email ON leads(email);
```

### Add Foreign Key
```sql
ALTER TABLE posts ADD COLUMN author_id UUID REFERENCES users(id) ON DELETE SET NULL;
```

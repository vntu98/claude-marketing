# Test Strategy Template

## [Feature Name] Test Plan

### Scope
- **In scope:** [What we're testing]
- **Out of scope:** [What we're NOT testing]

### Test Categories

#### Unit Tests
| Function/Component | Test Cases | Priority |
|-------------------|------------|----------|
| `createLead()` | Valid input, invalid email, duplicate email, missing fields | P0 |
| `validateEmail()` | Valid formats, invalid formats, edge cases | P0 |
| `LeadForm` | Renders correctly, submits, shows errors, shows success | P1 |

#### Integration Tests
| Endpoint/Flow | Test Cases | Priority |
|--------------|------------|----------|
| `POST /api/leads` | 201 success, 422 validation, 409 duplicate, 500 error | P0 |
| `GET /api/leads` | 200 with data, pagination, empty list, auth required | P0 |
| `GET /api/leads/:id` | 200 found, 404 not found | P1 |

#### E2E Tests
| User Flow | Steps | Priority |
|-----------|-------|----------|
| Lead capture | Visit page → fill form → submit → see success | P0 |
| Dashboard view | Login → see metrics → filter by date | P1 |

### Test Data

```typescript
// test/fixtures/leads.ts
export const validLead = {
  email: 'test@example.com',
  name: 'Test User',
  source: 'organic',
};

export const invalidLeads = [
  { email: '', name: 'No Email' },           // Missing email
  { email: 'not-email', name: 'Bad Email' }, // Invalid format
  { email: 'a@b', name: 'Too Short' },       // Edge case
];
```

### Environment
- **Unit/Integration:** Vitest with test database (SQLite or test PostgreSQL)
- **E2E:** Playwright with local dev server
- **CI:** GitHub Actions running all tests on PR

### Coverage Requirements
- **Minimum:** 80% line coverage on new code
- **Critical paths:** 100% (auth, payment, data mutation)
- **Excluded:** Config files, type definitions, generated code

### Success Criteria
- [ ] All tests pass
- [ ] Coverage meets minimum threshold
- [ ] No flaky tests
- [ ] E2E happy paths work
- [ ] Performance: test suite completes in < 60 seconds

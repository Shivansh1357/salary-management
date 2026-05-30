---
name: salary-tdd
description: Conventions for the Salary Management repo — TDD loop, routes→services→repositories layering, repository-interface mocking, and money-as-integer-minor-units. Use when writing or reviewing code in this repo.
---

# Salary Management — engineering conventions

Apply these whenever you write, change, or review code in this repository.

## TDD (non-negotiable)

- No production code without a failing test first. Watch it fail for the right
  reason before writing the implementation.
- One behavior per test; the test name states the behavior.
- Green with the minimal code, then refactor while staying green.
- Small, frequent commits named after the behavior added.

## Layering

```
routes (HTTP) → services (business logic) → repositories (Prisma) → SQLite
```

- Dependencies point inward only.
- **Prisma is imported only inside repositories.**
- **Services depend on a repository interface**, not on Prisma. This is what
  makes services unit-testable.

## Testing rules

- **Services:** unit test with a hand-written fake or mocked `EmployeeRepository`.
  Assert business behavior (filter rules, normalization, error mapping) — never
  assert mock call-counts as the point of the test, and never mock the ORM.
- **Repositories & routes:** integration test against a temporary SQLite database
  (real SQL, real HTTP via supertest). Do not mock the unit under test.
- Tests must be fast, deterministic, and isolated. Fixed faker seed; no network.

## Money & currency

- Store and compute money as **integer minor units** (cents). Convert to decimal
  only at the presentation boundary.
- Cross-currency analytics normalize to USD via the pure `toUsdMinor()` function
  in `apps/api/src/domain/currency.ts` (static rate table; no network).
- Round once, at the conversion edge.

## Validation & errors

- Validate all input with the Zod schemas in `packages/shared`. One schema is the
  source of both runtime validation and the TypeScript type.
- Error envelope: `{ error: { message, code, details? } }`. Status codes: 400
  validation, 404 not found, 409 duplicate email, 500 fallback.

## Performance

- List endpoints paginate/filter/sort **server-side**; never load all rows.
- Analytics use SQL aggregation (`GROUP BY`, `AVG`, ordered median), not app-side
  loops. Filter/sort columns are indexed.

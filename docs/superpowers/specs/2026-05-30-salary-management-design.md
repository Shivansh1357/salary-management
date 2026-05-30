# Salary Management System — Design Spec

**Date:** 2026-05-30
**Status:** Approved
**Context:** Incubyte "Software Craftsperson Node/TypeScript/ReactJS — II" take-home assessment.

## Problem

ACME org's HR team manages salary data for **10,000 employees across multiple
countries** in spreadsheets. We are replacing the spreadsheets with web-based
software so the **HR Manager** (single persona) can manage salary records and
**answer questions about how the org pays people**.

## Goals

- Manage employee salary records (create, read, update, delete).
- Browse 10,000 records fluidly: server-side search, filter, sort, paginate.
- Answer "how do we pay people?" with org-wide analytics (totals, averages,
  medians, breakdowns by department / country / level, salary distribution).
- Production-quality code, fast deterministic tests, clean architecture.

## Non-goals (deliberately out of scope)

See `docs/REQUIREMENTS.md` for the reasoned list. Summary: no auth/RBAC, no
payroll runs/payslips, no live FX rates, no audit history, no bulk import, no
i18n. Each is justified against the single-persona, time-boxed brief.

## Architecture

pnpm monorepo with three packages:

| Package           | Responsibility                                              |
| ----------------- | ----------------------------------------------------------- |
| `packages/shared` | Zod schemas + inferred TS types — the API contract.         |
| `apps/api`        | Express + TS REST API: `routes → services → repositories`.  |
| `apps/web`        | React + Vite + Mantine SPA; TanStack Query + Recharts.      |

Data flow:

```
React/Mantine ──HTTP/JSON──> Express (routes → services → repos) ──Prisma──> SQLite
       └──────────── shared Zod schemas (types + validation) ───────────┘
```

The layering is the backbone of the test strategy: **services** hold business
logic and are unit-tested with repositories mocked; **repositories** and
**routes** are integration-tested against a real temporary SQLite database.

## Data model — `Employee`

`id` (uuid), `firstName`, `lastName`, `email` (unique), `department`,
`jobTitle`, `level` (L1–L6), `country` (ISO-3166 alpha-2), `currency`
(ISO-4217), `baseSalary` (**integer minor units** — cents — to avoid float
errors), `employmentType`, `hireDate`, `status` (active/inactive),
`createdAt`, `updatedAt`.

Indexes on the filter/sort columns: `department`, `country`, `level`,
`lastName`, `status`.

## API

| Method | Path                     | Purpose                                            |
| ------ | ------------------------ | -------------------------------------------------- |
| GET    | `/api/health`            | Liveness probe.                                    |
| GET    | `/api/employees`         | List: pagination + search + filter + sort.         |
| POST   | `/api/employees`         | Create (Zod-validated).                            |
| GET    | `/api/employees/:id`     | Fetch one.                                         |
| PATCH  | `/api/employees/:id`     | Partial update.                                    |
| DELETE | `/api/employees/:id`     | Delete.                                            |
| GET    | `/api/analytics/summary` | Org-wide pay analytics (USD-normalized).           |

List response: `{ data, total, page, pageSize }`. Errors use a consistent
`{ error: { message, code, details? } }` shape: 400 (validation), 404
(not found), 409 (duplicate email), 500 (fallback).

## Currency

Salaries are stored in their **native** currency (`baseSalary` + `currency`).
For org-wide analytics we normalize to **USD** via a **checked-in static FX
table** (`apps/api/src/domain/currency.ts`). Live FX is out of scope and
documented as such — the static table is a pure, fully unit-tested function.

## Performance (10k rows)

- Never ship 10k rows to the client — server-side pagination/filter/sort only.
- DB indexes on every filter/sort column.
- Analytics computed with SQL aggregation (`GROUP BY`, `AVG`, percentile for
  median) rather than loading rows into app memory.
- TanStack Query `keepPreviousData` for flicker-free paging; debounced search.

## Seeding

`apps/api/prisma/seed.ts` generates **10,000 deterministic** employees using
`@faker-js/faker` with a **fixed seed**, with plausible salary ranges per
`(country, level)`, inserted in batches via `createMany`.

## Testing (TDD, Vitest)

- Pure domain logic (currency, analytics math) — exhaustive unit tests.
- Services — unit-tested with repositories mocked (strong assertions, no I/O).
- Repositories + routes — integration tests against a temp SQLite file.
- Web — React Testing Library on the highest-value components (employee form
  validation, table filter behavior). Meaningful, not exhaustive.
- Every feature built test-first; commit history shows red → green → refactor.

## Error handling

Central Express error middleware maps domain/validation errors to status codes
and the standard error envelope. The frontend surfaces errors via Mantine
notifications and inline field errors; every async view has loading / empty /
error states.

## Artifacts

`docs/REQUIREMENTS.md`, `docs/PRD.md`, `docs/ARCHITECTURE.md`, `docs/adr/*`,
`docs/AI-USAGE.md`, root `README.md`, and a git-ignored `SUBMISSION.md`.

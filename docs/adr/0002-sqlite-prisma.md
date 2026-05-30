# ADR 0002 — SQLite + Prisma

**Status:** Accepted · **Date:** 2026-05-30

## Context

We need a relational store for ~10,000 employee records, used by a single
persona (HR Manager), that is easy to seed, test, and deploy.

## Decision

Use **SQLite** as the database and **Prisma** as the ORM / migration tool.

## Rationale

- **Zero infrastructure:** the database is a file — nothing to provision for
  local dev, CI, or the demo deploy.
- **Scale fit:** 10k rows and a single writer are trivial for SQLite; with
  indexes, filtered/sorted/paginated queries are fast.
- **Testability:** integration tests spin up a throwaway SQLite file per run —
  real SQL, fully deterministic, no external service.
- **Prisma:** type-safe queries, first-class migrations, and a one-line
  `createMany` for batched seeding of 10k rows.

## Alternatives considered

- **Postgres + Prisma:** more production-real and concurrency-friendly, but adds
  hosting/infra for no benefit at this scale and persona. Prisma keeps the
  migration path cheap if we outgrow SQLite.
- **Raw SQL / Kysely:** more control, but hand-rolled migrations and seeding cost
  time the assessment is better spending on tests and UX.

## Consequences

- Single-writer concurrency limit — acceptable for one HR Manager; revisit if the
  product gains many concurrent users.
- Switching to Postgres later is a datasource + connection-string change;
  repositories and services are unaffected (see ADR 0001 layering).

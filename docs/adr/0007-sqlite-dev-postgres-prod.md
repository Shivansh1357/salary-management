# ADR 0007 — SQLite for dev/test, Postgres in production

**Status:** Accepted · **Date:** 2026-05-31 · **Amends:** [ADR 0002](0002-sqlite-prisma.md)

## Context

ADR 0002 chose SQLite for its zero-infra local and test story. For the deployed
demo we want the database to be **durable** across restarts and free-tier
idle/cold-starts, so a reviewer's edits persist. A free Render web service has no
persistent disk, which makes file-based SQLite ephemeral in production.

## Decision

Keep **SQLite for local development and the test suite**, and use **PostgreSQL
(Neon, free tier) in production**. Prisma abstracts the database, so application
code (repositories, services, routes) is unchanged — only the datasource
provider and connection string differ.

To avoid maintaining two schemas, the canonical `schema.prisma` (SQLite) is the
single source of truth; a tiny build step (`generate-pg-schema.mjs`) emits a
Postgres variant by swapping only the `provider` line, and production uses
`prisma db push` with it. The seed is idempotent, so deploys/restarts don't
clobber data.

## Rationale

- **Best of both:** fast, deterministic, network-free tests (temp SQLite per
  file) *and* a durable, always-seeded production database.
- **No drift:** one schema authored; the Postgres schema is generated, not
  hand-maintained.
- **Cheap migration path realized:** this is exactly the portability ADR 0002
  predicted — switching stores cost a provider swap, not an app rewrite.

## Consequences

- Two providers exercised; integer ranges and types were checked for both (`Int`
  is 32-bit in each — our largest minor-unit salary fits comfortably).
- Production uses `db push` (no migration history) rather than `migrate deploy`;
  acceptable for a single-service demo. A migration-based flow on Postgres is the
  next step for a long-lived deployment.
- A reviewer running locally still gets the one-command SQLite experience.

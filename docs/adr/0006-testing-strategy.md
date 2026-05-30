# ADR 0006 — Testing strategy (Vitest: unit + integration)

**Status:** Accepted · **Date:** 2026-05-30

## Context

The assessment grades test quality explicitly: "fast, deterministic, easy to
understand", "assertion strength, mocks handling". We follow TDD throughout.

## Decision

Use **Vitest** across the repo, with two deliberate test styles:

1. **Unit tests** for pure domain logic (currency, analytics math) and for
   **services** — services are tested against a **mocked repository interface**,
   so they run with zero I/O and assert on real business behavior.
2. **Integration tests** for **repositories and routes** — run against a
   **temporary SQLite database** created per test file, exercising real SQL and
   the real HTTP layer via `supertest`.

## Rationale

- **Mock at the boundary, not the internals:** services depend on a repository
  *interface*; the mock stands in for the database, so tests assert business
  behavior (filtering rules, normalization, error mapping) rather than mock
  call-counts. Repositories are tested for real against SQLite — no mocking of
  the thing under test.
- **Fast & deterministic:** unit tests have no I/O; integration tests use a
  throwaway local file and a fixed faker seed. No network, no shared state.
- **Readable:** one behavior per test, names that describe the behavior.

## Alternatives considered

- **Jest:** equivalent capability, but Vitest is faster, ESM-native, and shares
  config with the Vite frontend.
- **Mock Prisma in service tests via a Prisma mock library:** rejected — it tests
  the ORM call shape, not behavior. Depending on a repository interface is
  cleaner and decouples services from Prisma.

## Consequences

- Two harness setups to maintain (pure/unit vs. SQLite integration).
- Services are written against an interface (`EmployeeRepository`), reinforcing
  the layering in ADR 0001.

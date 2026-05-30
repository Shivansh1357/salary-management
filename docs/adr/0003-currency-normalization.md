# ADR 0003 — Currency normalization via a static FX table

**Status:** Accepted · **Date:** 2026-05-30

## Context

Employees span multiple countries, so salaries are stored in different
currencies. The persona needs **org-wide** answers ("average salary", "total
payroll"), which only make sense in a single currency.

## Decision

Store each salary in its **native currency** (`baseSalary` minor units +
`currency` code). For org-wide analytics, normalize to **USD** using a
**checked-in static FX rate table** exposed through a pure
`toUsdMinor(amountMinor, currency)` function.

## Rationale

- **Correct per-employee, comparable org-wide:** native storage preserves the
  source of truth; normalization is a presentation/analytics concern.
- **Deterministic tests:** a static table means currency math is a pure function
  with no network — exhaustively unit-testable, including unknown-currency and
  rounding edge cases.
- **No outage mode:** a live FX call would add latency and a failure path to
  every analytics request.

## Alternatives considered

- **Live FX API:** accurate to the minute, but non-deterministic, adds an
  external dependency and an outage mode — disproportionate for HR planning
  figures. Documented as out of scope.
- **Single currency everywhere (USD):** simplest, but throws away the
  multi-country reality the brief describes.
- **No normalization (group by currency):** avoids FX assumptions but makes
  "what does the org pay on average?" unanswerable in one number.

## Consequences

- Analytics are **directional, not accounting-grade** — explicitly stated in the
  UI and docs.
- Rates drift over time; refreshing them is a one-file edit.
- Swapping in a live rates provider later means implementing the same
  `toUsdMinor()` signature behind a cache — services and UI are unaffected.

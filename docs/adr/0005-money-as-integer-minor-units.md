# ADR 0005 — Store money as integer minor units

**Status:** Accepted · **Date:** 2026-05-30

## Context

Salaries are summed and averaged across 10,000 records and converted between
currencies. Floating-point money is a classic source of rounding bugs.

## Decision

Store and compute all monetary amounts as **integer minor units** (e.g. cents).
`baseSalary` is an integer. Conversion to a display/decimal value happens only at
the presentation boundary.

## Rationale

- **Exactness:** integer arithmetic has no representation error, so totals and
  averages are reproducible and test assertions are exact.
- **Aggregation-safe:** `SUM`/`AVG` over integers avoid accumulating float drift
  across thousands of rows.
- **Standard practice:** mirrors how payment systems (e.g. Stripe) model money.

## Consequences

- A small amount of conversion code at the edges (`minor ↔ decimal`), centralized
  in the currency module and tested.
- FX conversion multiplies integers by a rate and rounds once, deterministically.

# ADR 0001 — Express + React in a pnpm monorepo

**Status:** Accepted · **Date:** 2026-05-30

## Context

The JD targets Node / TypeScript / ReactJS. The assessment wants an end-to-end
app with a clear backend and UI, production-quality code, and a strong TDD
story. We need a shape that makes the layering — and therefore the tests —
obvious.

## Decision

Use a **pnpm workspace monorepo** with three packages:

- `apps/api` — **Express + TypeScript**, layered `routes → services →
  repositories`.
- `apps/web` — **React + Vite + TypeScript**.
- `packages/shared` — Zod schemas + inferred types shared by both.

## Alternatives considered

- **NestJS backend.** Strong DI/testing story, but the decorator/module
  boilerplate obscures the small, legible commit history this assessment rewards.
- **Next.js fullstack.** Fastest single deploy, but it blurs the explicit
  backend/UI separation the brief calls for and couples API tests to the
  framework.

## Consequences

- Plain Express keeps business logic in framework-agnostic services that are
  trivial to unit-test with a mocked repository.
- A shared package prevents client/server contract drift — one schema, two
  consumers.
- Two deploy targets (API + web) instead of one; mitigated with checked-in
  config and a documented submission guide.

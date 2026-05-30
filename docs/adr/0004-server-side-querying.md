# ADR 0004 — Server-side pagination, filtering, and sorting

**Status:** Accepted · **Date:** 2026-05-30

## Context

The directory holds 10,000 employees. The UI must support search, multi-facet
filtering, sorting, and paging while feeling instant.

## Decision

Do **all** querying on the server. `GET /api/employees` accepts
`search`, `department`, `country`, `level`, `status`, `sort`, `order`, `page`,
and `pageSize`, and returns `{ data, total, page, pageSize }`. The client
requests exactly one page at a time.

## Rationale

- **Scale:** shipping 10k rows to the browser and filtering client-side wastes
  bandwidth and memory and degrades as data grows. Server-side keeps payloads
  small and constant.
- **Indexes do the work:** filter/sort columns are indexed (ADR 0002), so the
  database returns the right page directly.
- **Correctness:** the returned `total` always reflects the active query, so
  pagination controls and counts stay consistent.

## Alternatives considered

- **Client-side filtering of all rows:** simpler UI code, but unacceptable at 10k
  rows and non-scaling.
- **Cursor pagination:** great for infinite scroll/very large sets, but offset
  pagination is simpler and sufficient here, and supports "jump to page N" which
  a page-based directory UI expects.

## Consequences

- More query-building code on the server (validated and centralized in the
  repository).
- The frontend uses TanStack Query with `keepPreviousData` so paging/filtering
  doesn't flash empty states.

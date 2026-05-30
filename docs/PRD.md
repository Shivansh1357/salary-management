# Product Requirements Document — Salary Management

**Owner:** HR Operations · **Status:** v1 · **Last updated:** 2026-05-30

This PRD expands `docs/REQUIREMENTS.md` into user stories and acceptance
criteria. It is the source of truth for *what* the product does; `docs/ARCHITECTURE.md`
and the ADRs cover *how*.

## 1. Background

ACME's HR team tracks compensation for ~10,000 employees across multiple
countries in spreadsheets. Spreadsheets don't scale: they're error-prone, hard
to query, and can't answer pay-equity / planning questions quickly. We are
building focused web software for the HR Manager.

## 2. Persona & jobs-to-be-done

**Priya — HR Manager.**
- "When a manager tells me someone's salary changed, I need to update it in
  seconds without breaking anything."
- "When finance asks 'what's our total payroll?' or 'what do we pay senior
  engineers on average?', I want the answer immediately, in one currency."
- "When onboarding a hire, I need to add them with all the right details."

## 3. User stories & acceptance criteria

### Epic A — Employee records

**A1. Add an employee**
- Given valid details, when I submit the form, a new employee is created and
  appears in the directory.
- Email must be unique; salary must be ≥ 0; country/currency/level/department
  must be from the allowed sets.
- Validation errors are shown inline per field; nothing is saved on error.

**A2. Edit an employee**
- I can change any field; partial updates are allowed.
- Changing email to one that already exists is rejected with a clear message.

**A3. View an employee**
- I can open a record and see all fields, with salary shown in its native
  currency.

**A4. Delete an employee**
- I can delete a record after a confirmation step; it disappears from the
  directory.

### Epic B — Directory at scale

**B1. Browse** — The directory paginates (default 25/page) and never loads all
10k rows at once; paging feels instant.

**B2. Search** — Typing a name or email narrows results (debounced,
case-insensitive, server-side).

**B3. Filter** — I can filter by department, country, level, and status, in any
combination.

**B4. Sort** — I can sort by name, salary, department, hire date, level.

**B5. Combined** — Search + filter + sort + pagination compose correctly and the
result count reflects the active query.

### Epic C — Pay analytics ("How do we pay people?")

**C1. Org KPIs** — Headcount, total annual payroll (USD), average salary (USD),
median salary (USD).

**C2. Breakdowns** — Average salary and headcount by **department**, by
**country**, and by **level**, shown as charts/tables.

**C3. Distribution** — A histogram of salaries (USD) so I can see the spread, not
just the average.

**C4. Currency** — All cross-org figures are normalized to USD via a documented
static FX table; per-employee views keep native currency.

## 4. Non-functional requirements

- **Performance:** list/filter/sort/paginate responses fast at 10k rows;
  analytics computed via SQL aggregation, not app-side loops.
- **Reliability:** deterministic seed; consistent error envelope.
- **Quality:** core logic covered by fast, deterministic unit tests; layered,
  readable architecture.
- **DX:** one-command setup; a new developer is productive from the README.

## 5. Out of scope

See `docs/REQUIREMENTS.md` § "Deliberately out of scope".

## 6. Release / demo

- Seeded SQLite database (10k employees).
- Deployed API (Render) + web (Vercel) — see `SUBMISSION.md`.
- Short screen-recorded demo walking through Epics A–C.

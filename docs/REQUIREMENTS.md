# Requirements — Salary Management (one page)

> The assessment asks for "a one page requirements document before building the
> software, outlining the goal, scope & features, and what you are deliberately
> leaving out, and reasoning for it." This is that document.

## Goal

Replace ACME's spreadsheet-based salary tracking with web software that lets the
**HR Manager** manage salary records for **10,000 employees across multiple
countries** and **answer questions about how the org pays people**.

## Persona

**HR Manager.** Not technical. Needs to find an employee fast, fix a salary
without ceremony, and get trustworthy org-wide pay numbers for planning and
fairness reviews. Comfortable with spreadsheets — the bar is "at least as easy
as Excel, with answers Excel can't give quickly."

## Scope & features (what we ARE building)

1. **Employee records** — create, view, edit, delete, with validation
   (required fields, unique email, salary ≥ 0, valid currency/country).
2. **Directory at scale** — server-side **search** (name/email), **filter**
   (department, country, level, status), **sort**, and **pagination** that stays
   fast at 10k rows.
3. **Pay analytics — "How do we pay people?"** — headcount, total annual payroll,
   average & **median** salary, breakdowns by **department / country / level**,
   and a **salary distribution** histogram. Cross-currency figures normalized to
   **USD** so org-wide comparisons are meaningful.
4. **Seed data** — 10,000 realistic, deterministic employees.
5. **Deployed, demoable software** with a one-command local setup.

## Deliberately OUT of scope (and why)

| Excluded                         | Reasoning                                                                                                                   |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Authentication / RBAC**        | Single persona (one HR Manager). Auth adds real surface area (sessions, hashing, password reset) that tests plumbing, not the salary problem. Documented as the first thing to add for production. |
| **Payroll runs / payslips / tax**| The brief is *managing salary data and answering pay questions*, not running payroll. Tax/withholding is a regulatory project per country — out of proportion to the time-box. |
| **Live FX rates**                | A network dependency that makes tests non-deterministic and adds an outage mode. A checked-in static rate table gives correct, testable normalization; swapping in a live rates provider later is a one-file change. |
| **Salary history / audit log**   | Valuable for compliance, but doubles the data model and UI. We store `updatedAt`; full point-in-time history is a fast follow. |
| **Bulk CSV import / export**     | The seed script covers "get to 10k rows"; import is an onboarding migration feature, not core daily use for the persona. |
| **Multi-user, real-time collab** | One persona ⇒ no concurrent-edit/locking complexity needed. |
| **i18n / localization**          | Reviewers and persona operate in English; localizing the UI is polish that doesn't exercise engineering depth here. |

## Success criteria

- HR Manager can find and edit any of 10,000 employees in seconds.
- The analytics view answers "what do we pay, on average, by department/country/
  level, and how is pay distributed?" at a glance, in one currency.
- Listing/filtering 10k rows feels instant (server-side, indexed).
- Core logic is covered by fast, deterministic tests.

## Key assumptions

- One salary figure per employee (current base salary), no comp components
  (bonus/equity) — kept out to stay focused; the model can extend.
- FX rates are approximate and static; analytics are directional, not
  accounting-grade.

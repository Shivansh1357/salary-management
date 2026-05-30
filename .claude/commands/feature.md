---
description: Implement a feature slice test-first (red → green → refactor) following repo conventions
argument-hint: <short feature description>
---

Implement the following feature **test-first**: $ARGUMENTS

Follow the strict TDD loop and this repo's conventions:

1. Restate the behavior as one or more concrete test cases (one behavior each).
2. RED: write the first failing test in the correct package/layer. Run it; show
   it fail for the right reason.
3. GREEN: minimal code to pass. Run the test.
4. REFACTOR: clean up while staying green.
5. Repeat for remaining cases, then run the full package test suite.

Honor the layering (`routes → services → repositories`, Prisma only in repos),
mock the repository interface in service unit tests (never the ORM), use shared
Zod schemas for validation, and keep money as integer minor units. Commit each
green step with a behavior-named message.

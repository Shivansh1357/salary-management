---
description: Review the current working-tree diff against repo conventions before committing
---

Run `git diff` and `git diff --staged`, then review the changes using the
`code-reviewer` subagent's criteria: tests assert real behavior, layering is
respected (Prisma only in repositories), money is integer minor units, input is
validated with shared Zod schemas, list endpoints paginate server-side, and
analytics use SQL aggregation.

Report findings grouped as **Must fix / Should fix / Nit** with `file:line` and
concrete suggestions. Do not modify files.

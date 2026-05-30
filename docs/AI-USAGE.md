# AI Usage

The assessment asks us to "use AI tools to accelerate your work" and to show
"how you use them, the clarity of your thinking, and the quality of your
engineering decisions." This is an honest record of that.

## Tool

**Claude Code** (Anthropic's agentic CLI) was the primary tool, used as a pair
that I drove and reviewed — not an autopilot. Every architectural decision,
scope cut, and trade-off below was a deliberate call that I made and the agent
executed and documented.

## How I delegated

I worked in distinct phases and kept myself in the loop at each gate:

1. **Framing first, not code first.** Before any implementation I had the agent
   read the brief and we ran a structured brainstorm: I made the consequential
   calls (stack shape, database, deployment, currency strategy, feature scope)
   and rejected the over-engineered options (NestJS boilerplate, live FX,
   maximal feature set). Those decisions are captured in `docs/adr/`.
2. **Spec → plan → TDD.** The agent wrote a design spec (`docs/superpowers/specs/`)
   and a one-page requirements doc, then implemented strictly test-first.
3. **Red–green–refactor, small commits.** Each unit of behavior was a failing
   test first, then minimal code, then refactor — committed incrementally so the
   git history reads as the evolution of the solution.
4. **Repo-as-config.** The `.claude/` directory ships with the repo: custom
   subagents, slash commands, and a skill that encode this project's review and
   TDD conventions, so the *next* developer (or agent) inherits the same bar.

## Where AI helped most

- **Boilerplate at speed:** monorepo wiring, Prisma schema, Vitest config,
  Mantine layout — mechanical work compressed so time went to design and tests.
- **Exhaustive edge cases:** currency rounding, unknown-currency handling, and
  query-composition cases were enumerated as tests up front.
- **Documentation discipline:** ADRs and architecture diagrams were written
  alongside the code while the reasoning was fresh.

## Where I stayed in control

- **Scope:** I cut auth, payroll, live FX, audit history, and bulk import, and
  wrote the reasoning myself (`docs/REQUIREMENTS.md`). Saying no is the decision.
- **Architecture:** the `routes → services → repositories` layering and the
  "mock the repository interface, never the ORM" testing rule were my calls; they
  exist to keep business logic honest and testable.
- **Review:** I read every diff. Tests had to fail first and assert real
  behavior, not mock call-counts.

## Representative prompts

These are the kinds of instructions I gave (paraphrased):

- "Read the assessment brief. Before writing code, brainstorm the design — ask me
  the consequential decisions one set at a time and recommend defaults."
- "Prepare ADRs, a PRD, architecture docs, and the `.claude` agents/commands/
  skills, then build the assessment test-first with small commits."
- "Currency normalization must be a pure, fully unit-tested function with a static
  rate table — no network. Enumerate the edge cases as tests first."
- "Analytics must be computed with SQL aggregation, not by loading rows into app
  memory — it has to stay fast at 10k rows."

## The `.claude/` toolkit (shipped in this repo)

| Type | Name | Purpose |
| --- | --- | --- |
| Agent | `tdd-implementer` | Drives one feature through red–green–refactor. |
| Agent | `code-reviewer` | Reviews a diff against this repo's conventions. |
| Command | `/feature` | Scaffold a test-first feature slice (test → impl → refactor). |
| Command | `/review-diff` | Review the working-tree diff before commit. |
| Skill | `salary-tdd` | This project's TDD + layering + money/currency conventions. |

These make the engineering standards reproducible rather than tribal knowledge.

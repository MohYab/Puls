# Project log – Puls

Format for each entry: what I did, why, problems and solutions, technical
decisions, what I learned, feedback, scope changes.

---

## Week 1 – Pre-study and scope

**Period:** week 36 2026-08-31 to 2026-09-06

### Summary of the week

This week I defined what Puls is and what it is not. I created the repository,
wrote a project brief, put the backlog and the most important acceptance
criteria into the repo, and prepared the first meeting with my supervisor.
No application code has been written yet, on purpose: the goal of week 1 was
to make sure the scope is clear before design and setup start.

The result is a defined MVP (login, dashboard, calendar, appointment booking,
patients, documentation) with 15 user stories, prioritised into P1 (must have)
and P2 (should have), and a clear list of what is out of scope.

### Entry 1: Repository and project structure

**What I did**

- Created the GitHub repository "Puls".
- Added README.md, .gitignore and this project log.

**Why**

- To have a clear starting point and to document the work from day one, so
  the final report can be based on this log.
- .gitignore was added early so that .env files and node_modules are never
  committed by mistake.

**Technical decisions**

- Project name: Puls.
- Monorepo with separate /frontend and /backend folders (to be created in
  week 3, not before).
- README states clearly that this is a prototype using test data only.

### Entry 2: Project brief

**What I did**

- Wrote docs/project-brief.md: problem, goal, target users, roles, MVP scope
  and constraints.

**Why**

- To agree on one shared description of the project before designing
  anything. It also becomes the base for the Introduction in the report.

**Technical decisions**

- Definition of done for the MVP: a ~5 minute demo (login → dashboard →
  create appointment → open appointment → write documentation → view history)
  that runs without errors.

### Entry 3: Backlog and user stories

**What I did**

- Wrote docs/backlog.md with 15 user stories (US-01 to US-15) and a list of
  future development that is out of scope.
- Set up a GitHub Project board (ToDo / In Progress / Review / Done).

**Why**

- To have a prioritised list of work that I can follow during the project.

**Technical decisions**

- The backlog is a Markdown file in the repo, not 15 GitHub issues created
  upfront. Requirements often change, so I will write acceptance criteria and
  create an issue right before each story is built. This avoids planning work
  in detail that may be changed later.
- Priorities: P1 = US-01 to US-10, P2 = US-11 to US-15. P3 features (AI,
  speech-to-text, video, SMS, integrations, patient portal, mobile app) are
  out of scope.

### Entry 4: Acceptance criteria

**What I did**

- Wrote docs/acceptance-criteria.md for US-01 (log in), US-05 (create appointment) and US-08 (crea documentation).

**Why**

- These three stories cover the core of the system: authentication, booking
  and documentation. They also show how the parts connect.
- The criteria will be reused as test cases in week 13.

**Technical decisions (proposed, to be confirmed with supervisor)**

- Doctors can only book for themselves; admins can book for any doctor.
- Booking in the past is not allowed.
- Overlapping appointments for the same doctor are rejected (HTTP 409);
  cancelled appointments do not block a time slot.
- One clinical note per appointment.
- Admins cannot read clinical notes (403). Reason: authentication (who you
  are) and authorization (what you may see) are separate, and an
  administrator should not need access to clinical text.

### Entry 5: Supervisor meeting preparation

**What I did**

- Wrote docs/supervisor-meeting-1.md with an agenda and 11 questions about
  scope, requirements and practical matters.
- Booked the meeting:

**Why**

- To get concrete feedback on scope and to settle open design questions
  (one note per visit, bookings in the past, admin access to notes) before
  the database is designed.

### Problems and solutions

- (none so far – add anything that came up, for example Git/GitHub setup issues)

### What I learned

- (why acceptance criteria help, how to separate
  MVP from future features, difference between authentication and authorization)

### Feedback from supervisor

-

### Scope changes

- No changes to the MVP scope yet.
- Open questions that may change scope after the supervisor meeting:
  one note per visit, bookings in the past, admin access to notes.

### What I would do differently

-

### Next week (week 2)

- User flows and wireframes (login, dashboard, calendar, booking form,
  documentation).
- ER diagram and architecture diagram.
- Write docs/decisions.md with the key technical decisions.

## Week 2 – UX/UI and architecture

**Period:** week 37 2026-09-07 to 2026-09-13

### Summary of the week

This week I moved from "what are we building" to "how will it work and look".
I mapped out the five core user flows, sketched low-fidelity wireframes for
the five main screens, designed the database as an ER diagram, documented
the system architecture and folder structure, wrote a complete API
reference, ran a short spike to decide how the calendar should be built, and
collected every technical decision so far in one document.

By the end of the week there is a full design foundation to build from in
week 3: user flows, wireframes, ER diagram, architecture overview, API
reference and a decisions log. No application code has been written yet —
that starts in week 3 with the project setup.

### Entry 1: User flows

**What I did**

- Wrote docs/user-flows.md with five flows as Mermaid diagrams: login,
  creating an appointment, documenting a visit, looking up patient history,
  and admin managing appointment types.

**Why**

- To check that every screen has a clear entry and exit point before
  designing the screens themselves, and to make sure no step was missing
  between booking and documentation.

**What I learned / noticed**

-

### Entry 2: Wireframes

**What I did**

- Sketched low-fidelity wireframes for Login, Dashboard, Calendar,
  Appointment form and Documentation using Excalidraw/Figma (fill in which).
- Added them to docs/wireframes/ with a README linking all five.

**Why**

- To agree on layout and the key UI decisions (e.g. dropdown-based time
  selection instead of free text) before writing any frontend code.

**Technical decisions**

- Appointment time is selected from a list of available slots rather than a
  free text field, to prevent conflicts already in the UI.
- Labels are placed above form fields rather than beside them, for simpler
  responsive behaviour later.

### Entry 3: ER diagram

**What I did**

- Wrote docs/er-diagram.md with a Mermaid ER diagram covering User, Doctor,
  Patient, Appointment, AppointmentType, ClinicalNote and
  DocumentationTemplate.

**Why**

- To validate the data model from the original plan against the wireframes,
  and to have a single source of truth before writing the Prisma schema in
  week 4.

### Entry 4: Architecture and API reference

**What I did**

- Wrote docs/architecture.md: system overview diagram, backend request flow
  (route → middleware → controller → service → Prisma), and the frontend/
  backend folder structure.
- Wrote docs/api.md: a complete table of all endpoints with method, role and
  notes, plus the shared error response format.

**Why**

- To have one reference document to build against in week 4–5, instead of
  deciding endpoint shape and error handling ad hoc while coding.

### Entry 5: Calendar spike and decision

**What I did**

- Ran a short, timeboxed spike comparing a custom-built calendar grid
  against a library (react-big-calendar).
- Decided to build a **custom grid**.

**Why**

- The positioning logic (time → vertical position, duration → height) felt
  manageable within scope during the spike. Building it myself also
  demonstrates more of my own problem-solving for the report, compared to
  wiring up a library.

**Alternative considered**

- react-big-calendar — faster to start with, but less control over styling
  and less technical substance to show in the report.

### Entry 6: Technical decisions log

**What I did**

- Wrote docs/decisions.md, collecting all technical decisions made so far:
  no repository layer, soft-cancel instead of delete, one note per
  appointment, admins blocked from clinical notes, JSON-based note content,
  UTC timestamps, custom calendar grid, and the still-open JWT storage
  decision for week 5.

**Why**

- To have one place that explains _why_ the system is built the way it is,
  which will become the base for the report's Technical Choices chapter.

### Problems and solutions

-

### What I learned

-

### Feedback from supervisor

-

### Scope changes

- No changes to the MVP scope.
-

### What I would do differently

-

### Next week (week 3)

- Set up /frontend (Vite, React, TypeScript, Tailwind, ESLint, Prettier).
- Set up /backend (Express, TypeScript, ESLint, Prettier).
- Configure PostgreSQL locally.
- Set up Prisma and write the first schema based on docs/er-diagram.md.
- Run the first migration.
- Goal: a working development environment, no features yet.

## Week 3–4 – Project setup, database and backend foundation

**Period:** week 38-39 2026-09-14 to 2026-09-27

### Summary

These two weeks were combined because setting up the project turned into
far more troubleshooting than expected — almost every tool in the stack had
released a new major version in the days or weeks before this project
started, and none of them were compatible with each other yet. By the end,
both frontend and backend scaffolds exist, PostgreSQL is running with a
seeded database, Prisma is fully wired up with a working driver adapter, and
the first real API endpoint works end to end (route → controller → service →
Prisma → database).

This turned into the most valuable troubleshooting experience of the project
so far, and a good example of working with a fast-moving ecosystem rather
than a frozen tutorial stack.

### Entry 1: Frontend scaffold

**What I did**

- Created the frontend with Vite (React + TypeScript template).
- Configured Tailwind CSS, ESLint and Prettier.
- Created the folder structure from docs/architecture.md.

**Problem and solution**

- `npm install tailwindcss postcss autoprefixer` installed Tailwind v4,
  which no longer uses `npx tailwindcss init -p` or a `postcss.config.js`.
  Solved by switching to Tailwind v4's own Vite plugin (`@tailwindcss/vite`)
  and a single `@import "tailwindcss";` line in the CSS file instead of the
  v3 setup.
- The installed TypeScript version (6.0.3) was newer than VS Code's bundled
  language server, which didn't recognise the new `erasableSyntaxOnly`
  compiler option. Solved by selecting "Use Workspace Version" in the
  editor, and by opening the `frontend/` folder directly as the workspace
  root instead of the repository root.

**What I learned**

- A tutorial or instruction set written even a few months ago can assume an
  older major version of a tool. Checking `npx <tool> -v` and reading the
  actual error message is more reliable than assuming the setup steps are
  still accurate.

### Entry 2: Backend scaffold

**What I did**

- Created the backend with Express, TypeScript, `tsx` for development, and
  a minimal `/api/health` endpoint.
- Configured ESLint and Prettier, matching the frontend's settings.

**Problem and solution**

- `eslint.config.js` failed with `Cannot use import statement outside a
module`, because `backend/package.json` was missing `"type": "module"`
  (Vite sets this automatically for the frontend, but a plain `npm init -y`
  backend does not). Solved by adding `"type": "module"` to `package.json`.
- Installing ESLint tooling failed with an `ERESOLVE` conflict: `npm install
typescript` had pulled in TypeScript 7.0.2, a brand-new major version
  (a new Go-based compiler) that `typescript-eslint` does not support yet
  (its own support request for TS 7 was closed as "not planned"). Solved by
  pinning `typescript` to `6.0.3` in both frontend and backend. See
  docs/decisions.md #9.

### Entry 3: PostgreSQL setup

**What I did**

- Installed PostgreSQL locally, created a `puls_dev` database and a
  `puls_user` role for the project.

**What I learned**

- PostgreSQL 15+ changed the default privileges on the `public` schema,
  which caused a permission error later during migrations (see Entry 4).
  This was new to me — in older PostgreSQL versions, granting privileges on
  the database used to be enough.

### Entry 4: Prisma setup, schema and first migration

**What I did**

- Installed Prisma and ran `prisma init`.
- Wrote `prisma/schema.prisma` based on docs/er-diagram.md: 7 models, 2
  enums (`Role`, `AppointmentStatus`), JSON fields for clinical note content
  and documentation template content, and a unique `appointmentId` on
  `ClinicalNote` to enforce one note per appointment.
- Ran the first migration and generated Prisma Client.

**Problems and solutions**

- `npm install prisma` installed Prisma 8 (a release candidate) by default.
  Prisma 8 has a completely new CLI that does not read `schema.prisma` and
  has no `migrate dev` command, which is why `prisma init` produced no
  schema file on the first attempt. Solved by pinning `prisma` and
  `@prisma/client` to `^7`, the current recommended stable version. See
  docs/decisions.md #10.
- `prisma migrate dev` failed with `P3014` (could not create the shadow
  database) because `puls_user` lacked the `CREATEDB` privilege. Solved with
  `ALTER USER puls_user CREATEDB`.
- The next attempt failed with `permission denied for schema public`, caused
  by the PostgreSQL 15+ privilege change noted in Entry 3. Solved with
  `GRANT ALL ON SCHEMA public TO puls_user` and `ALTER SCHEMA public OWNER
TO puls_user`. See docs/decisions.md #11.
- After the migration succeeded, `prisma generate` had to be run explicitly
  to produce the Prisma Client, it was not generated automatically.

**What I learned**

- Database permission errors are rarely about the application code; they
  are almost always about what the database user is actually allowed to do.
  Reading the exact error code (e.g. `P3014`) and looking it up directly
  was faster than guessing.

### Entry 5: Seed data

**What I did**

- Wrote `prisma/seed.ts`: 2 users (1 doctor, 1 admin), 3 dummy patients,
  4 appointment types, 4 documentation templates, 3 appointments and 1
  clinical note.
- Configured the seed command in `prisma7.config.ts` (Prisma 7 moved this
  out of `package.json`).

**Problem and solution**

- The seed script failed with `PrismaClientInitializationError`: Prisma 7
  requires `PrismaClient` to be given an explicit driver adapter
  (`@prisma/adapter-pg`) — `DATABASE_URL` alone is no longer enough. Solved
  by creating a single shared Prisma Client in `src/utils/prisma.ts`, which
  all future services will import instead of creating their own client
  instances. See docs/decisions.md #12.

### Entry 6: First real API endpoint

**What I did**

- Built `GET /api/appointment-types` end to end: route → controller →
  service → Prisma → database, plus a central `AppError` class and an
  Express error-handling middleware matching the error format in
  docs/api.md.

**Problem and solution**

- The endpoint failed with `P1010: User was denied access` even though the
  same database user worked fine for migrations and seeding. Cause:
  `src/utils/prisma.ts` read `process.env.DATABASE_URL` before `.env` had
  been loaded, because ES module imports run before the rest of a file's
  code `dotenv.config()` in `index.ts` ran too late. Solved by adding
  `import "dotenv/config";` directly at the top of `src/utils/prisma.ts`,
  so the environment is loaded as soon as that file is imported, regardless
  of import order elsewhere.

**What I learned**

- This was the same root cause as the earlier `prisma7.config.ts` issue,
  just in a different file — environment variables must be loaded before
  anything that reads them, including indirectly through imports. I now
  check this first whenever something that depends on `.env` behaves as if
  a variable is missing.

### Also cleaned up

- Prisma 7's `prisma init` automatically generated AI-agent "skills"
  documentation folders (`.claude/`, `.cursor/`, `.devin/`, `.windsurf/`,
  `.agents/`, `skills-lock.json`) and a `postinstall` script to keep them in
  sync. These were removed and ignored in `.gitignore` — they are not
  needed in the repository.

### Feedback from supervisor

-

### Scope changes

- No changes to the MVP scope.

### What I would do differently

- I would check installed major versions (`npx tsc -v`, `npx prisma -v`)
  immediately after every fresh `npm install`, before writing any code
  against them. Most of the problems this week came from assuming a tool
  behaved like its last known stable version, when a brand-new major
  version had actually been installed.

### Next (week 5)

- Authentication: login endpoint, password hashing, JWT, auth middleware,
  roles, protected endpoints.
- Decide JWT storage location (localStorage vs httpOnly cookie) —
  docs/decisions.md #13.

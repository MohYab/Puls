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

## Week 5–7 – Authentication, frontend foundation and dashboard

**Period:** week 40-42 2026-09-28 to 2026-10-18

### Summary

These three weeks took the project from a backend-only API to a working,
end-to-end application: a doctor can now log in through the browser and see
a real dashboard populated with data from the database. Authentication
(JWT, password hashing, role-based middleware) was built first, since
almost every other endpoint depends on it. The frontend then got routing,
a global auth state, protected routes, and its first two real layouts. The
week closed with the dashboard, the first feature a user actually sees
after logging in, fully wired to the backend.

### Entry 1: Authentication (week 5)

**What I did**

- Added password hashing (bcryptjs) and JWT-based login
  (`POST /api/auth/login`, `GET /api/auth/me`).
- Built `authenticate` middleware (verifies the JWT) and `authorize`
  middleware (checks role), and protected `GET /api/appointment-types`
  with `authenticate` as the first real use of the pattern.
- Decided JWT storage: `localStorage`, documented as a deliberate trade-off
  for a prototype. See docs/decisions.md #13.
- Wrote docs/manual-testing.md with a repeatable set of curl commands to
  verify the whole auth flow.

**Problem and solution**

- `tsconfig.json` still used the deprecated `"moduleResolution": "node"`
  option, which TypeScript 6 warned would stop working in TS 7, and which
  also did not actually match `"type": "module"` in `package.json`. Fixed
  by switching both `module` and `moduleResolution` to `"NodeNext"`, which
  matches the ESM imports (`.js` extensions) already used throughout the
  backend.

**What I learned**

- Authentication is a good example of "build the thing everything else
  depends on first", almost every subsequent endpoint in the backlog
  needs `authenticate`, so getting it right early avoided rework.

### Entry 2: Frontend foundation (week 6)

**What I did**

- Set up React Router with a login page and a dashboard page.
- Built a `fetch`-based API client with a shared `ApiError` type, and
  connected TanStack Query's provider.
- Built a global auth state (`AuthProvider` + `useAuth`), a login form with
  React Hook Form and Zod validation, a `ProtectedRoute` that redirects to
  `/login` when no user is logged in, and two layouts: `AuthLayout` (for
  login) and `AppLayout` (sidebar, header with the "Prototype – test data
  only" banner, user name and log out).

**Problems and solutions**

- A `ReactNode` type error appeared because the project's TypeScript
  config has `verbatimModuleSyntax` enabled, which requires type-only
  imports to be marked explicitly (`import type { ... }`).
- ESLint flagged `setUser` being called synchronously inside a `useEffect`
  reading from `localStorage`. Solved by reading `localStorage` with a
  lazy `useState` initializer instead of an effect, since the read is
  synchronous and does not need to be an effect at all.
- A "Fast refresh only works when a file only exports components" warning
  appeared because one file exported both a component and a hook. Solved
  by splitting auth into three files: `AuthContext.ts` (the context
  object), `AuthProvider.tsx` (the component), and `useAuth.ts` (the hook)
  — a pattern I will reuse for any other context going forward.

**What I learned**

- Several of this week's warnings came from React and TypeScript tooling
  enforcing good practice (type-only imports, no synchronous state updates
  in effects, one-component-per-file for Fast Refresh) rather than from
  mistakes in the business logic. Reading _why_ a lint rule exists made
  the fix obvious each time, rather than just silencing the warning.

### Entry 3: Dashboard (week 7)

**What I did**

- Built `GET /api/appointments?date=` on the backend, scoped to the
  logged-in doctor (or all doctors for Admin), with patient and
  appointment type included.
- Built the frontend data layer (types, service, a `useAppointments` query
  hook) and two dashboard components, `TodaySchedule` and
  `NextAppointment`, each with explicit loading and empty states, plus
  shared `Card` and `StatusBadge` components for reuse in later features.
- Wired it all into `DashboardPage`, with "next appointment" computed as
  the first non-cancelled, non-completed appointment after the current
  time.

**Problem and solution**

- `prisma/seed.ts` uses `create`, not `upsert`, so running it a second
  time failed with a unique constraint error on `email`. Running
  `npx prisma migrate reset` is meant to re-run the seed automatically,
  but did not do so reliably on one occasion, the seed had to be run
  manually afterward (`npx prisma db seed`). Documented as a known
  limitation. See docs/decisions.md #14.

**What I learned**

- Seeing the dashboard correctly show "No upcoming appointments today" in
  the evening, after all of today's appointments had already passed, was
  a good real confirmation that the time-based filtering logic works
  correctly, not just that the UI renders.

### Feedback from supervisor

-

### Scope changes

- No changes to the MVP scope.

### What I would do differently

-

## Week 8 – Calendar and the appointment booking flow

**Period:** week 43 2026-10-19 to 2026-10-25

### Summary

This was the heaviest week in the plan, and it delivered the core of the
MVP: a doctor can now view a day-based calendar, create a new appointment
through a full form (patient, doctor, type, date, time), see it appear
instantly in the calendar grid, open any appointment to view its details,
edit it, or cancel it — all backed by real conflict checking on the
backend, so the same doctor can never be double-booked.

The backend half of the week (conflict logic, update/cancel endpoints,
patients and doctors endpoints) went smoothly and was fully curl-tested
before any frontend work began, which made the frontend half mostly a
matter of wiring up forms and the calendar grid to endpoints that were
already known to behave correctly.

### Entry 1: Conflict checking and appointment creation

**What I did**

- Implemented `POST /api/appointments`: calculates `endTime` from the
  appointment type's duration, rejects bookings in the past, and rejects
  overlapping appointments for the same doctor (except cancelled ones)
  with `409 APPOINTMENT_CONFLICT` — using the overlap rule from
  docs/api.md (`newStart < existingEnd AND newEnd > existingStart`).
- Added `PUT /api/appointments/:id` (reuses the same conflict check,
  excluding the appointment being edited) and
  `PATCH /api/appointments/:id/status` (used for cancelling).
- Added `GET /api/patients` (with `?search=`) and `GET /api/doctors` for
  the booking form's dropdowns.

**Problems and solutions**

- ESLint flagged an unused `_next` parameter in `errorHandler`, despite the
  underscore convention, because the default rule only ignores the _last_
  unused argument. Fixed by setting `argsIgnorePattern: "^_"` explicitly.
  See docs/decisions.md #15.
- TypeScript failed to build with `string | string[]` errors on every
  `req.params.id` usage. Cause: Express 5 (installed by default) has
  stricter parameter types via a newer `path-to-regexp`. Fixed with an
  explicit `as string` cast, safe here since no route uses repeated
  parameters. See docs/decisions.md #16.

### Entry 2: Calendar day view

**What I did**

- Built a custom calendar grid (per the week 2 decision): a 07:00–17:00
  time axis with appointments rendered as absolutely positioned blocks,
  `top` based on minutes since the calendar start and `height` based on
  appointment duration, colour-coded by status.
- Added day navigation (prev/next) and a toolbar with a "+ New
  appointment" button.

**What I learned**

- Positioning blocks with plain CSS (`top`/`height` in pixels, computed
  from time) was indeed manageable, confirming the outcome of the week 2
  spike — no library was needed for this.

### Entry 3: Booking form and appointment detail

**What I did**

- Built the full booking form (patient, doctor — only shown for Admin,
  appointment type, date, time) with React Hook Form and Zod validation,
  opened in a reusable `Modal` component, and connected to
  `POST /api/appointments` via TanStack Query, with the calendar
  automatically refreshing on success (`invalidateQueries`).
- Built an appointment detail view, opened by clicking a calendar block,
  with an edit mode (pre-filled form, same conflict handling) and a cancel
  action (confirmation dialog, then `PATCH .../status`).

**What I learned**

- Surfacing the backend's `409 APPOINTMENT_CONFLICT` message directly in
  the form's error state, rather than a generic "something went wrong",
  made the conflict rule feel like a real, understandable part of the UI
  instead of just a failed request — and was very little extra code since
  the API already returned a clear message.

### Problems and solutions

- The calendar page felt very slow to load once, showing "Loading..." for
  an extended time. Resolved by logging out and back in, which refreshed
  an outdated JWT (from an earlier `prisma migrate reset`/seed cycle) and
  coincided with Vite's one-time compilation of the new calendar files on
  first visit. Not a code bug, but a reminder to always get a fresh token
  after resetting the database during development.

### Feedback from supervisor

-

### Scope changes

- No changes to the MVP scope. US-05, US-06 and US-07 (create, edit,
  cancel an appointment) are now fully implemented and manually verified.

### What I would do differently

-

### Next (week 9)

- Patient list with search.
- Patient detail page.
- Patient appointment history.

## Week 9–10 – Patients and clinical documentation

**Period:** week 44–45 2026-10-26 to 2026-11-08

### Summary

These two weeks completed the link between booking and documentation,
which is the central idea of the MVP. A doctor can now search for a
patient, open the patient page and see the appointment history, then open
any visit, write a visit note in four structured fields, save it, edit it
later, and read the patient's earlier notes as context for the next visit.
The same flow works from the calendar, the patient history and the
patient's note list, so documentation is one click from wherever the doctor
finds the visit.

As in week 8, the backend came first and was curl-tested for success and
error cases in both roles before the frontend was built. The most
important design choice was to treat clinical notes as sensitive from the
start: admins have no access to notes at all, a doctor can only read and
write notes for their own appointments, all read permissions live in one
function, and notes are never deleted. I also extended the seed data from
one doctor to 28 doctors and 73 patients, so rules between doctors could
finally be tested instead of assumed.

The weeks also produced two scope decisions. Sharing a note with another
doctor (with the patient's consent) was classified as SHOULD HAVE and
planned for week 12, while a patient login was classified as out of scope
and moved to future development, because it would need strong
identification and access logging. Templates for documentation, UX polish
and automated tests remain for weeks 11–13.

### Entry 1: Patient list, search and detail (week 9)

**What I did**

- Backend: added `GET /api/patients/:id` and
  `GET /api/patients/:id/appointments` (a doctor only sees their own
  appointments with the patient, an admin sees all). Both were tested
  with curl for success and error cases (200, 401, 404).
- Frontend: types, service functions and TanStack Query hooks for the
  patient list, a single patient and the appointment history. Built the
  patient list with a debounced search field (300 ms), a patient detail
  page with an information card and appointment history, and replaced
  the plain `<a>` links in the sidebar with `NavLink` (no full page
  reload, active link highlighted).
- Added loading, empty, error and "not found" states to every view.

**What I learned**

- Debouncing the search value (not the input itself) keeps typing
  responsive while limiting API requests. `keepPreviousData` stops the
  table from flashing a loading state on every new search.
- The patient detail endpoint returns fewer fields than the list, and the
  appointment history has a different shape than calendar appointments,
  so I used one TypeScript type per response shape instead of one type
  with many optional fields.
- A 404 should not be retried. Skipping retries for client errors (4xx)
  makes "Patient not found" appear immediately instead of after several
  seconds of automatic retries.

### Entry 2: Clinical notes API (week 10)

**What I did**

- Built four endpoints: `GET` and `POST /api/appointments/:id/notes`,
  `PUT /api/notes/:id` and `GET /api/patients/:id/notes`. Input is
  validated with Zod (four text fields, at least one must be filled in,
  max 5000 characters each).
- Put all read permissions in one place (`canReadNote` and
  `readableNotesWhere` in `noteService.ts`) and added a rule that admins
  have no access at all. Added `authorize("DOCTOR")` on the routes as a
  second layer.
- Added explicit error codes: `NOTE_EXISTS` (one note per appointment)
  and `APPOINTMENT_CANCELLED` (a cancelled appointment cannot be
  documented), both 409.
- Tested 11 cases with curl in both roles: 200, 201, 400, 401, 403, 404
  and 409.

**What I learned**

- Keeping the permission rule in one function means a later change (for
  example sharing notes between doctors) touches one place instead of
  every endpoint.
- The `validate` middleware writes the parsed result back to `req.body`,
  so Zod's `trim()` and `default("")` apply before the service runs. That
  is why a note always has all four keys.

### Entry 3: Documentation page and previous notes (week 10)

**What I did**

- Built `/documentation/:appointmentId` with the appointment details
  (patient, time, type, status) and a form (React Hook Form + Zod) for
  the four note fields. The same form creates the first note and edits
  it afterwards, and shows when it was created and last updated.
- Added `PreviousNotes` (collapsible entries, line breaks preserved)
  on the patient page and beside the form, and a "Documentation" link in
  the calendar's appointment detail and in the patient's appointment
  history. The links are only shown to doctors and not for cancelled
  appointments.
- "No note yet" (404) is treated as a normal state in the frontend, not
  as an error. Admins see an explanation instead of notes, and no note
  requests are sent for them.

**What I learned**

- With a synchronous submit handler and `useMutation`, `isSubmitting` is
  never true while the request is running, so the button is not disabled
  and a double click can send two creates (the second fails with 409).
  `mutation.isPending` is the right signal. My older forms (booking and
  edit) should be changed the same way.
- Resetting the form with the saved values after a save makes the form
  "clean" again, so the "saved" message disappears when the user starts
  typing.

### Entry 4: Larger seed data (week 10)

**What I did**

- Extended the seed script from one doctor to 28 doctors, 73 patients,
  about 135 appointments and about 33 notes, so access rules between
  doctors can be tested. Appointment dates are relative to today so the
  dashboard always has "today" and upcoming appointments.
- Built test cases into the data: Anna has appointments and notes with
  two doctors, two completed appointments have no note yet, and there is
  a no-show, cancelled appointments and patients without phone or email.
- The seed now clears the database first (and refuses to run in
  production), so it can be run repeatedly.
- Phone numbers come from the range that the Swedish regulator (PTS)
  reserves for fictional use, and e-mail addresses are generated from
  names as plain ASCII.

**What I learned**

- Test data should be designed for the test cases you need. With only one
  doctor, "doctor B cannot read doctor A's note" could not be verified
  until week 10.
- Even random-looking dummy phone numbers can belong to real people, so
  fictional ranges are the safer choice for a healthcare prototype.

### Problems and solutions

- **"Cannot GET /api/patients/:id" as an HTML page.** A route that is not
  registered gives Express's default HTML 404, while my own errors are
  JSON. The route was missing in the router file. Lesson: an HTML 404
  means "no route matched", a JSON 404 means "the route ran".
- **A TypeScript error on `Prisma.AppointmentWhereInput`.** I had used a
  Prisma type that was never imported. The existing services filter with
  a plain `doctorId`, so I removed the type and followed the existing
  pattern.
- **Empty `$TOKEN` in curl tests (`No token provided`).** Shell variables
  only live in the terminal window where they were set, and tokens
  expire. Log in again and set the tokens in the same window. After
  reseeding the database, the browser also needs a fresh login because
  the old JWT points to a user that no longer exists.
- **TS18046 `error is of type unknown`** on `query.error.message`. The
  parameter types of the `retry` callback decide the error type TanStack
  Query infers. Typing the callback parameter as `Error` fixed it.
- **Duplicate route definitions.** I added new route lines with
  `authorize` but kept the old ones, so the first matching route silently
  won and the new one never ran. No error is shown, so it was found by
  comparing the 403 message in testing.

### Feedback from supervisor

-

### Scope changes

- **Sharing notes between doctors** (the author gives another doctor
  read access, with the patient's consent) is classified SHOULD HAVE and
  planned for week 12 (permissions). If time is short it moves to future
  development. Author-only read access stays the rule until then.
- **Patient login** (see bookings, read notes, update contact details,
  grant and revoke access) is OUT OF SCOPE and listed under future
  development. A real patient portal needs strong identification
  (for example BankID) and access logging.
- Appointment rows in the patient history do not open the detail modal
  (COULD). They link to the documentation instead.
- The seed data was extended beyond the plan (small effort, high value
  for testing).
- Candidates noticed from the larger data, not yet decided: a doctor
  filter in the admin calendar (SHOULD, week 12) and searchable patient
  and doctor selects in the booking form (COULD, week 11).
- Known limitation for the report: the patient data protection law
  requirements (access logging, patient consent, blocking) are not met by
  the MVP.

### What I would do differently

- Create seed data with more than one doctor from the start, so access
  rules can be tested while they are built.
- Use `isPending` from the beginning in forms that submit through a
  mutation.
- Always check the HTML-versus-JSON difference first when an endpoint
  returns 404.

### Next (week 11)

- Documentation templates (the template selection in the documentation
  form).
- UX polish: consistent loading, empty and error states, confirmation
  dialogs, and fixing the older forms (`isPending`, accessible labels).

## Week 11 – Documentation templates and UX polish

**Period:** week 46 2026-11-09 to 2026-11-15

### Summary

Week 11 added the last piece of the documentation flow, templates, and then
spent most of its time on quality. A doctor now chooses a template when
writing a new note (General consultation, Follow-up visit, Annual check-up
or Vaccination), and the form shows only the fields of that template. The
template is stored on the note and is locked after the first save.

The second half of the week was a deliberate pause in new features. When I
reviewed the screens I found the same markup repeated in many places, forms
whose labels were not connected to their fields, dialogs without keyboard
support, and a dashboard that showed an error as "No appointments today".
I built a few small shared components (`FormField`, `ConfirmDialog`,
`StateMessage` and loading, empty and error messages), made `Modal` work
with the keyboard, and moved the older forms and pages over to them. The
patient search was also improved so that a full name finds the patient.

None of this changes what the application does on a good day, but it
changes what the user sees when something goes wrong, which matters in a
healthcare context.

### Entry 1: Documentation templates

**What I did**

- Backend: added `GET /api/documentation-templates` (doctors only) and an
  optional `templateId` on `POST /api/appointments/:id/notes`. An unknown
  template gives 400. The templates in the seed data now list field keys
  (`reasonForVisit`, `observation`, ...) instead of display labels.
- Frontend: a template select above the form for a new note (General
  consultation preselected), fields rendered from the template, and a
  read-only "Template: ..." line once the note exists. Changing template
  clears the fields the new template does not have, and a field that
  already contains text is always shown.
- 8 curl tests (200, 201, 400, 401, 403) and a manual UI checklist.

**What I learned**

- Storing keys instead of labels in the template content gives stable
  identifiers, and the frontend keeps one list of labels (`NOTE_FIELDS`).
- Locking the template after the first save avoids the hard question of
  what happens to text in fields that the new template does not have.
- The API only checks that the template exists, not that the content follows
  it. That is a documented limitation, not an oversight.

### Entry 2: Shared building blocks and accessibility

**What I did**

- Built `FormField` (label, field and error message, connected with `id`,
  `aria-invalid` and `aria-describedby`), `StateMessage`, `ConfirmDialog`
  and the small `LoadingMessage`, `EmptyMessage` and `ErrorMessage`.
- Improved `Modal`: `role="dialog"`, a title connected to the dialog,
  Escape closes only the topmost dialog, focus moves into the dialog and
  returns to the element that opened it, and the close button has a label.
- Moved `AppointmentForm`, `AppointmentDetail` and the documentation form
  to `FormField`, and replaced `window.confirm` with `ConfirmDialog` when
  cancelling an appointment (it now also shows an error if the request
  fails, which it did not before).

**What I learned**

- A render prop in `FormField` makes it impossible for a label and its field
  to get different ids.
- `useId` gives each form its own field ids. Two forms with a field called
  `date` would otherwise create duplicate ids.
- A synchronous submit handler with `useMutation` needs `mutation.isPending`
  to disable the button. `isSubmitting` is never true while the request runs.

### Entry 3: Consistent states and better patient search

**What I did**

- The dashboard now handles failed requests with an error message and a
  retry button. Before, a failed request showed "No appointments today."
- The patient pages (list, detail, history, previous notes) use the same
  loading, empty and error components, with the same retry rule for failed
  queries.
- Patient search: every word of the search must match the first or last name,
  so "anna andersson" finds Anna Andersson. The list is sorted by last name
  and then first name, so patients with the same last name keep a stable order.

**What I learned**

- An error must never look like an empty list. In a healthcare application
  "you have no appointments" and "the schedule could not be loaded" mean
  very different things.
- Searching for a full name is the first thing a user tries, so a search that
  matches the whole string against one column is not enough.

### Problems and solutions

- **The dashboard showed an error as an empty schedule.** The page only
  read `isLoading`, so a failed request left `appointments` undefined and
  the page printed "No appointments today." Fixed by handling `isError`.
- **`Modal` could not be closed with the keyboard and lost focus.** Added
  Escape handling and focus management. A list of open modals makes Escape
  close only the topmost one, which matters when the cancel confirmation is
  opened on top of the appointment details.
- **Searching for a full name found nothing, and equal last names moved
  between requests.** Fixed in the service (see Entry 3).
- **The same route was registered twice in `index.ts`.** The second line did
  nothing and Express shows no error. Found by reading the file during week
  11, the same silent problem as the duplicate routes in week 10.
- **`/documentation/null`.** The shell variable holding the appointment id was
  empty because the terminal was a new window without the login token.
  Variables only live in the window where they were set.
- **A 30 to 40 second page load when testing loading states with a throttled
  network.** The development server sends hundreds of separate files, so the
  whole page waits long before any "Loading..." can be shown. The way to
  test loading states is to load the app first and throttle the network
  afterwards, then navigate to a view that has not fetched its data yet. The
  production build is three files.

### Feedback from supervisor

-

### Scope changes

- Delivered as planned: templates, shared components, confirmation dialog,
  consistent states and the older forms moved over.
- **Warning about unsaved changes** is OUT OF SCOPE. In-app navigation
  blocking needs a data router (`useBlocker`), which means rebuilding the
  routing for a small gain. It is listed as a limitation.
- **Searchable patient and doctor selects** (73 patients and 28 doctors in
  plain selects) are COULD, week 14 if time allows.
- **Marking the visit as completed when a note is saved** and **a "to
  document" list on the dashboard** (completed visits without a note) are
  COULD.
- **A doctor filter in the admin calendar** moves to week 12, where it
  belongs with permissions and admin features.
- Known limitation: the dialog does not trap Tab focus, so Tab can leave an
  open dialog. A production version should use a dialog library or the
  native `<dialog>` element.

### What I would do differently

- Handle `isError` in every view that fetches data from the start, instead of
  finding it when reviewing.
- Create the shared components earlier. The red error box existed in four
  places before I made one component for it.
- Build `Modal` with keyboard and focus support from the beginning.

### Entry 4: Automated note permission tests (early start on week 13)

**What I did**

- Extracted `createApp()` to `backend/src/app.ts` so the Express app can be
  imported in tests without starting the HTTP server.
- Added Vitest and Supertest (`npm test`, `npm run test:watch`).
- Wrote an HTTP-level suite for clinical note access rules against seed
  data: author can read, no token → 401, admin → 403, other doctor cannot
  read or edit, and each doctor only sees their own notes for Anna.
- Documented the choice in `docs/decisions.md` (#28).

**What I learned**

- The seed scenarios (Anna + Erik + Sara) pay off as soon as the same cases
  become automated tests — no extra fixtures were needed.
- Starting with the highest-risk rules (journal access) gives more value
  than a broad but shallow suite.

### Next (week 12)

- Admin features: manage appointment types, a doctor filter in the admin
  calendar.
- Permissions and role-based UI.
- Sharing notes between doctors (SHOULD, with a cut-off: if the week is
  behind schedule it moves to future development).
- Continue automated tests in week 13 (conflicts, validation, more note
  cases); the permission suite is already in place as a foundation.

# Technical decisions – Puls

Format: Decision / Why / Alternative considered.

---

## 1. No repository layer in the backend

**Decision:** Backend structure is routes → controllers → services → Prisma.
No separate `repositories/` layer.

**Why:** Prisma already acts as the data access layer. An extra layer would
only forward calls between services and Prisma, adding complexity without
real benefit at this project's size.

**Alternative considered:** routes → controllers → services → repositories →
Prisma. Rejected as unnecessary enterprise structure for a project of this
scope.

---

## 2. Cancelling an appointment is a status change, not a delete

**Decision:** `DELETE /api/appointments/:id` does not exist. Cancelling sets
`status = CANCELLED`.

**Why:** In healthcare, appointment history should not disappear without a
trace. Keeping cancelled appointments also makes the patient's appointment
history complete and auditable.

**Alternative considered:** hard delete. Rejected — loses history and is
harder to justify in a healthcare context.

---

## 3. One clinical note per appointment

**Decision:** `ClinicalNote.appointmentId` is unique.

**Why:** Keeps the data model and the documentation UI simple for the MVP —
one visit, one note, which matches how a single consultation is usually
documented.

**Alternative considered:** multiple notes per appointment (e.g. an entry
log). Rejected for MVP scope — can be revisited in future development.

---

## 4. Admins cannot read clinical notes

**Decision:** `GET /api/patients/:id/notes` and the notes endpoints are
restricted to the DOCTOR role; ADMIN gets 403.

**Why:** Authentication (who you are) and authorization (what you may see)
are separate concerns. An administrator managing bookings has no clinical
need to read medical text, which also mirrors real-world access control in
healthcare systems.

**Alternative considered:** giving Admin read access to notes "for
completeness". Rejected — unnecessary exposure of sensitive content.

---

## 5. Structured clinical notes stored as JSON

**Decision:** `ClinicalNote.content` and `DocumentationTemplate.templateContent`
are stored as JSON fields rather than separate database tables per section.

**Why:** Gives structured documentation (Reason for visit, Observation,
Assessment, Plan) without the complexity of extra tables and joins, which
would be disproportionate for a prototype.

**Alternative considered:** a separate `NoteSection` table linked to
`ClinicalNote`. Rejected as over-engineering for the MVP.

---

## 6. Appointment times stored in UTC

**Decision:** All timestamps are stored in UTC in PostgreSQL and converted to
`Europe/Stockholm` only in the frontend for display.

**Why:** Avoids subtle bugs around daylight saving time and keeps the backend
timezone-agnostic, which is standard practice.

**Alternative considered:** storing local time directly. Rejected — breaks
around DST transitions and when comparing/sorting times.

---

## 7. Custom calendar grid instead of a library

**Decision:** The calendar (day/week view) is built from scratch with CSS
grid and absolute-positioned appointment blocks, instead of using a library
such as react-big-calendar.

**Why:** A short spike showed the positioning logic (time → vertical
position, duration → height) was manageable within scope. Building it
demonstrates more of my own problem-solving and fits better with the
project's "no unnecessary enterprise complexity, but show real skill" goal.

**Alternative considered:** react-big-calendar or a similar library.
Rejected — faster to start with, but gives less control over styling and
less to show technically in the report.

---

## 8. JWT storage location — to be decided in week 5

**Status:** Open. Will compare `localStorage` vs an httpOnly cookie before
implementing authentication.

## 9. TypeScript 7.0 incompatible with typescript-eslint

**Decision:** Pin `typescript` to `6.0.3` in both frontend and backend.

**Why:** TypeScript 7.0 was released during the project as a new Go-based
compiler with no stable programmatic API yet. `typescript-eslint` closed a
support request for TS 7 as "not planned", pending TS 7.1. Installing
dependencies without pinning pulled in TS 7.0.2, which broke
`typescript-eslint` with an `ERESOLVE` dependency conflict.

**Alternative considered:** wait for `typescript-eslint` to support TS 7.
Rejected — no fixed timeline, and the project cannot be blocked by an
upstream ecosystem gap.

---

## 10. Prisma pinned to version 7, not the default `latest`

**Decision:** Pin `prisma` and `@prisma/client` to `^7` instead of installing
`latest`.

**Why:** `npm install prisma` installed Prisma 8 (an early release candidate)
by default. Prisma 8 is a new CLI architecture that no longer reads
`schema.prisma` and has no `generate`, `migrate dev` or `db push` commands —
it replaces the classic workflow this project is built around. Prisma 7 is
the current recommended, stable version for production use.

**Alternative considered:** adopt Prisma 8's new workflow. Rejected — it is
a release candidate, undocumented for this project's needs, and far riskier
for a degree project with a fixed deadline.

---

## 11. PostgreSQL user needs explicit schema and CREATEDB privileges

**Decision:** `puls_user` is granted `CREATEDB` and made owner of the
`public` schema, instead of relying on `GRANT ALL PRIVILEGES ON DATABASE`
alone.

**Why:** Prisma Migrate creates a temporary "shadow database" when running
migrations, which requires `CREATEDB`. Separately, PostgreSQL 15+ no longer
gives regular users implicit rights to create objects in the `public`
schema, even if they own the database. Both had to be granted explicitly.

---

## 12. Prisma Client requires an explicit driver adapter

**Decision:** `PrismaClient` is instantiated with an explicit
`@prisma/adapter-pg` driver adapter in a single shared file
(`src/utils/prisma.ts`), rather than relying on `DATABASE_URL` alone.

**Why:** As of Prisma 7, `DATABASE_URL` alone is no longer enough —
`PrismaClient` requires a driver adapter to be passed to its constructor.
A single shared client also avoids creating multiple database connections
across controllers and services.

**Alternative considered:** instantiate `PrismaClient` separately in each
service file. Rejected, wasteful and inconsistent; a shared instance is
standard practice regardless of the Prisma version issue.

---

## 13. JWT storage location

**Decision:** The JWT is stored in `localStorage` on the frontend.

**Why:** For this prototype, with no external exposure and a closed demo
environment, the simplicity of `localStorage` outweighs the XSS risk it
carries compared to an httpOnly cookie. This is a deliberate, documented
trade-off for the MVP, not an oversight.

**Alternative considered:** httpOnly cookie. Rejected for MVP scope — adds
CORS/CSRF complexity that is not justified for a closed prototype. A
production version handling real patient data would need to revisit this
and use an httpOnly cookie instead.

## 14. Seed script is not idempotent

**Status:** Superseded by #22 (week 10). The seed script now clears the
database first and can be run repeatedly. The text below describes the
original decision.

**Decision:** `prisma/seed.ts` uses `create` (not `upsert`) for all records,
so running it twice without resetting the database fails with a unique
constraint error on `User.email`.

**Why:** For an MVP, a simple `create`-based seed script was enough to get
working test data. Making every model idempotent (via `upsert`) would need
defined "business keys" for models without natural uniqueness, such as
`Patient`, which was not worth the extra complexity this early.

**Known limitation:** To refresh demo data, the database must be reset
first (`npx prisma migrate reset`, which re-runs migrations and seed
automatically — though this did not trigger reliably once in practice, in
which case `npx prisma db seed` can be run manually afterward).

**Future improvement (P2, optional):** rewrite the seed script with
`upsert` and fixed IDs or natural keys, so it can be run repeatedly without
resetting the database.

## 15. ESLint unused-vars uses an explicit underscore convention

**Decision:** `backend/eslint.config.js` sets
`"@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }]`.

**Why:** ESLint's default `no-unused-vars` behaviour only ignores the
_last_ parameter of a function when deciding whether an unused argument is
allowed. Since Express error-handling middleware has a fixed four-parameter
signature, an intentionally unused parameter that is not last (e.g. `_next`
in `errorHandler`) was still flagged, even with the conventional underscore
prefix. Making the underscore pattern an explicit rule setting fixes this
consistently, instead of relying on parameter position.

---

## 16. Explicit type casts for Express 5 route parameters

**Decision:** `req.params.id` is cast as `req.params.id as string` in
controllers that read a route parameter.

**Why:** Express 5 (installed by default) uses a newer version of
`path-to-regexp` with stricter TypeScript types, where a route parameter's
type is `string | string[]` rather than a plain `string` — to support route
patterns with repeated parameters, which this project does not use. The
cast is safe here since every route parameter in this project is always a
single value.

## 17. Clinical notes are readable only by the doctor who wrote them

**Decision:** A clinical note can only be read and edited by the doctor who
wrote it. Admins have no access to notes at all. The rule lives in one
place, `canReadNote` and `readableNotesWhere` in `noteService.ts`, and the
endpoints contain no permission logic of their own. `authorize("DOCTOR")`
is applied on the routes, and the service also calls `requireDoctorId`
(two layers; the second one also narrows `doctorId` to a plain `string`
for TypeScript).

**Why:** Clinical notes are the most sensitive data in the system, so the
default is the least access that still works. It also matches the rule for
appointments, where a doctor only sees their own. Keeping the rule in one
function means a later change, such as sharing notes between doctors (see
#18), touches one place instead of every endpoint.

**Alternative considered:** Letting admins read notes (rejected: scheduling
does not need clinical content), and letting every doctor read every note
(rejected: breaks least privilege).

**Known limitation:** The MVP has no access logging, no patient consent
handling and no way to block access. Real healthcare systems need these
(in Sweden they are governed by the Patient Data Act), so this prototype
must never hold real patient data. This is listed under limitations in the
report. The earlier test gap ("doctor B cannot read doctor A's note") was
closed in week 10 with the extended seed data.

## 18. Sharing notes between doctors (planned) versus a patient login (out of scope)

**Decision:** Two ideas for sharing documentation were assessed in week 10.

- **A. Note sharing between doctors:** the doctor who writes a note can
  give another doctor read access, after asking the patient. Classified
  **SHOULD HAVE** and planned for week 12 (permissions).
- **B. Patient login:** a patient can log in, see bookings, read notes,
  update contact details and grant or revoke access. Classified **OUT OF
  SCOPE** and listed under future development.

**Why:**

- A has medium impact and medium effort (one new table, three endpoints,
  one dialog, a changed read rule), low risk, and high portfolio value
  because it shows a real healthcare question (consent and access).
- B is large and risky: a new role, a new login, a new part of the
  frontend, and in real use strong identification (for example BankID)
  and access logging. It is only valuable if it is finished, and a finished,
  well-structured MVP is more important than many half-finished features.

**Planned design for A (not built yet):**

- New table `NoteShare` (`noteId`, `doctorId`, `grantedByDoctorId`,
  `createdAt`), unique on `(noteId, doctorId)`. Sharing is per note, not
  per patient.
- Only the author can share and revoke. The recipient can read, never
  edit. Revoking exists from the start.
- The share dialog has a checkbox "The patient has agreed". The system
  cannot verify consent, but the flow shows that it is a required step.
- Admins still have no access.
- Only `canReadNote` and `readableNotesWhere` change (plus the ownership
  check when reading a note by appointment).

**Cut-off:** If the project is behind schedule at the start of week 12, A
moves to future development and author-only read access remains the rule.

**Alternative considered:** Sharing per patient (rejected: too broad and
harder to explain), and letting every doctor read all notes (rejected, see
#17).

## 19. Rules for the lifecycle of a clinical note

**Decision:**

- One note per appointment (`appointmentId` is unique). A second create
  returns `409 NOTE_EXISTS`.
- A cancelled appointment cannot be documented (`409 APPOINTMENT_CANCELLED`).
- Notes can be edited but never deleted. There is no `DELETE` endpoint.
- Saving a note does not change the appointment status automatically.
- A note has four text fields (`reasonForVisit`, `observation`,
  `assessment`, `plan`), at most 5000 characters each, at least one must be
  filled in. Missing fields are stored as `""` so the content always has
  all four keys.

**Why:** Clinical records are corrected, not erased, and one note per visit
keeps the first version simple. Automatically setting the status to
`COMPLETED` is a convenient improvement but not needed to demonstrate the
flow, so it is classified COULD.

**Alternative considered:** A delete endpoint (rejected, see above), and
several notes or addenda per appointment (future development).

## 20. "No note yet" is a 404 that the frontend treats as a normal state

**Decision:** `GET /api/appointments/:id/notes` returns `404 NOT_FOUND` when
the appointment has no note. The `useNote` hook turns that specific 404
into `null`, so the documentation page shows an empty form instead of an
error.

**Why:** It follows the API reference and REST conventions. It is safe to
treat every 404 from this request as "no note yet" because the page first
loads the appointment itself, and an unknown appointment gets a proper
"Appointment not found" from that request.

**Alternative considered:** Returning `200` with `null`. That is simpler for
the client, but it deviates from the API reference, and the backend uses
404 for both "appointment missing" and "note missing", so the two cases
would be harder to tell apart.

**Trade-off:** The browser's network tab shows a red 404 each time a new
note is about to be written.

## 21. Client errors are not retried, and the retry callback is typed as `Error`

**Decision:** A shared `retryUnlessClientError(failureCount, error: Error)`
in `utils/queryRetry.ts` is used in the patient and note query hooks. It
never retries 4xx errors and retries other errors at most twice.

**Why:** TanStack Query retries failed requests three times with a growing
delay by default. A 404 or 403 cannot be fixed by retrying, so "Patient not
found" appeared only after several seconds of loading. The parameter is
typed as `Error` (not `unknown`) because TanStack Query infers a query's
error type from the callback's parameter types, and `unknown` made
`query.error.message` a TypeScript error (TS18046).

**Alternative considered:** Setting the rule once in the `QueryClient`'s
`defaultOptions`. That would remove the repeated `retry:` lines and may be
a better long-term place. It was deferred because only a few hooks need it
so far.

## 22. The seed script clears the database first, and only uses fictional data

**Decision:** `prisma/seed.ts` now deletes all data (children before
parents) before creating it, and refuses to run when `NODE_ENV` is
`production`. Appointment dates are relative to today. E-mail addresses
are generated from names as plain ASCII, phone numbers come from the range
that the Swedish regulator PTS reserves for fictional use (070-1740605 to
070-1740699), and a generated schedule gives every extra doctor a few
appointments. This replaces #14.

**Why:**

- The seed can be run repeatedly with `npx prisma db seed`, so there is no
  need for `migrate reset`, which did not always run the seed.
- Rules between doctors can only be tested with more than one doctor.
- Relative dates keep the dashboard and calendar populated whenever the
  database is seeded.
- E-mail addresses with å, ä or ö fail Zod's e-mail validation, so those
  doctors could not have logged in.
- Random 070 numbers can belong to real people, which would break the rule
  that only dummy data is used.

**Alternative considered:** `upsert` with natural keys (rejected: patients
and appointments have no natural keys, and clearing the table is simpler
for a development database).

**Known limitation:** It deletes everything, including manual test data,
and all ids change on every run. Existing tokens in the browser and the
terminal stop working, so log in again after seeding. It must never be run
against a database that holds data worth keeping.

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

## 23. Documentation templates are lists of field keys, locked after creation

**Decision:** A template's `templateContent.sections` is a list of note field
keys (`reasonForVisit`, `observation`, `assessment`, `plan`), and the labels
come from `NOTE_FIELDS` in the frontend. The doctor chooses the template when
the note is created (General consultation is preselected), and it cannot be
changed afterwards. Changing the template in the form clears the fields the
new template does not have. A field that already contains text is always
shown, so saved text can never be hidden. The API only checks that
`templateId` exists, not that `content` follows the template. Templates are
read-only in the MVP.

**Why:** Keys are stable identifiers, labels are presentation. Locking the
template removes the question of what happens to text in fields that the new
template lacks. Keeping the content check out of the API keeps the first
version simple, and the frontend only shows the fields of the template.

**Alternative considered:** Storing display labels in the template
(rejected: fragile, since renaming a label would break the mapping), allowing
a template change on an existing note (rejected: can hide or lose text), and
letting admins edit templates (future development).

## 24. Shared UI building blocks and dialog accessibility

**Decision:** Forms use a shared `FormField` (a render prop that gives the
field its `id`, `aria-invalid` and `aria-describedby`), and each form uses
`useId` so field ids are unique. `Modal` has `role="dialog"`, a connected
title, Escape handling for the topmost dialog only, focus moved into the
dialog and returned on close, and a labelled close button. `ConfirmDialog`
(built on `Modal`) replaces `window.confirm`. Shared style constants live in
their own file (`formStyles.ts`), because the Fast Refresh lint rule does not
allow a component file to export other values. The confirmation dialog is
rendered inside the appointment details in the DOM, not in a portal.

**Why:** The same markup was repeated in several forms and pages, and the
labels were not connected to their fields. Shared components make the
accessibility fix a one-place change. A native `confirm()` cannot be styled,
cannot show an error and is hard to test.

**Alternative considered:** A dialog or UI library (Radix, Headless UI).
Rejected for the MVP to avoid a new dependency for a small need, but a
production version should consider one.

**Known limitation:** The dialog does not trap Tab focus, so Tab can move
focus out of an open dialog.

## 25. An error is never shown as an empty state

**Decision:** Loading, empty and error states are three different states with
shared components (`LoadingMessage`, `EmptyMessage`, `ErrorMessage` with a
retry button, and `StateMessage` for "not found" and "no access"). Every query
that feeds a view handles `isError`. List queries use the same
`retryUnlessClientError` rule as the detail queries (see #21).

**Why:** The dashboard read only `isLoading`, so a failed request was shown as
"No appointments today". In a healthcare application "nothing scheduled" and
"the schedule could not be loaded" mean very different things, and the retry
rule makes real errors visible within seconds instead of after several
automatic retries.

**Alternative considered:** A global error handler on the `QueryClient`
(rejected for now: errors are shown where the data would have been, which
keeps the context clear).

## 26. Patient search matches every word, and the sort order is stable

**Decision:** The search splits the text into words. Every word must match the
first or the last name (case-insensitive), so "anna andersson" and "andersson
anna" both find Anna Andersson. The list is sorted by last name and then by
first name. There is no pagination.

**Why:** Users search for a full name first. Matching the whole text against
one column returned nothing for it. Without a second sort key, patients with
the same last name could change order between requests.

**Alternative considered:** Pagination for the list (out of scope: 73 patients
is manageable, noted as a limitation) and a database full-text search
(rejected: too heavy for this need).

**Known limitation:** The order of å, ä and ö depends on the database
collation, so they may not sort at the end of the alphabet as in Swedish.

## 27. No warning about unsaved changes

**Decision:** The documentation form does not warn the user about unsaved text
when navigating away.

**Why:** Blocking in-app navigation needs `useBlocker`, which only works with
a data router (`createBrowserRouter`). The application uses `BrowserRouter`, so
this would mean rebuilding the routing for a small gain. Text is lost if the
user leaves the page without saving.

**Alternative considered:** A `beforeunload` handler. It only covers closing
the tab or reloading, not navigation inside the app, so it gives a false sense
of safety. It is listed under future development together with an autosaved
draft.

---

## 28. Automated API tests with Vitest and Supertest

**Decision:** Backend tests use Vitest and Supertest against the real Express
app and the seeded PostgreSQL database. The first suite covers clinical note
access rules (`src/test/notes.permissions.test.ts`). `createApp()` lives in
`src/app.ts` so tests can import the app without calling `listen`.

**Why:** Note permissions are the highest-risk rules in the MVP (admin must
not see notes; doctor B must not read or edit doctor A's note). Encoding the
curl cases from `docs/manual-testing.md` as automated tests catches
regressions when week 12 adds note sharing. HTTP-level tests exercise
middleware and services together, which is where authorization actually
lives.

**Alternative considered:** Unit-testing `noteService` with a mocked Prisma
client (faster, no database). Rejected for the first suite — a mock would
not cover `authorize("DOCTOR")` or the login/JWT path. A separate test
database was also considered; rejected for now because the existing seed is
already designed for these cases (Anna with notes from Erik and Sara).

**Known limitation:** The permission suite needs a seeded database
(`npx prisma db seed`). Mutating tests (create note, conflict) are still
manual or not yet automated.

---

## 29. Sidebar component with a role filter

**Decision:** The navigation was moved out of `AppLayout` into
`layouts/Sidebar.tsx`. Menu items live in `layouts/navItems.ts`, each with an
optional `roles` list, and `navItemsForRole(role)` returns the items a role
may see.

**Why:** Week 12 adds admin-only pages. With a role list per item, a new menu
entry is one line and the layout does not change. The same `Sidebar` is used
both as the fixed desktop menu and inside the mobile drawer.

**Alternative considered:** Conditional `{user.role === "ADMIN" && ...}`
blocks in the layout. Rejected: the checks would spread through the markup and
be duplicated in the drawer.

**Note:** Hiding a link is only convenience. Access is enforced by the backend
(`authorize`), never by the menu.

## 30. Mobile navigation: header button and drawer below `md`

**Decision:** Below 768 px the sidebar is hidden and a menu button in the
header opens it as a drawer. The drawer closes on link click, Escape, click
outside and when the window grows to desktop width. It locks page scroll,
moves focus to its close button, traps Tab inside the drawer and returns focus
to the menu button. Built without a library.

**Why:** A fixed 224 px sidebar left about 150 px for content on a phone. A
drawer is the common pattern for apps that already have a sidebar and scales
when admin items are added. The behaviour needed is small enough to write and
explain in one component.

**Alternative considered:** A dropdown menu under the header (simpler, but
pushes content down and grows with every admin item) and a headless UI
library (more than the MVP needs).

**Known limitation:** `Modal` does not trap focus yet. Both should share a
`useFocusTrap` hook in week 13; the hook needs a wider selector than the
drawer (form fields, skip disabled elements).

## 31. Layout children must be allowed to shrink

**Decision:** The content column in `AppLayout` has `min-w-0`, and page grids
use `grid-cols-1` below their breakpoint instead of no column definition.

**Why:** Flex and grid children default to `min-width: auto`, so they never
become narrower than their widest content. On the patient page the appointment
history table pushed the whole grid column (and the info card in it) outside a
375 px screen, even though the table had an `overflow-x-auto` wrapper.
`min-w-0` (flex) and `grid-cols-1` = `minmax(0, 1fr)` (grid) let the column
shrink so the wrapper can scroll instead.

**Alternative considered:** Fixed widths or hiding columns on small screens.
Rejected as a first step: they treat the symptom on one page, while the
shrink rule fixes the cause for every page.

## 32. Calendar day navigation by calendar days, not hours

**Decision:** Previous/next day uses `addDays(date, ±1)`, which calls
`setDate`, instead of adding or subtracting 24 hours.

**Why:** A day is 23 or 25 hours long when daylight saving time starts or
ends. On 25 October 2026 (Sweden goes back to standard time), stepping forward
24 hours from just after midnight stayed on the same day. `setDate` counts
calendar days and keeps the local time.

**Alternative considered:** A date library (date-fns). Not needed for one
helper; can be reconsidered if date logic grows (e.g. a week view).

## 33. DOM order is the mobile order

**Decision:** On the documentation page the elements are written in the order
appointment, visit note form, previous documentation. On `lg` the form spans
two rows on the right (`lg:row-span-2`, `lg:grid-rows-[auto_1fr]`), so the
desktop layout is unchanged.

**Why:** Below `lg` the content stacks in DOM order. Before the change the
form came last, so a doctor on a tablet had to scroll past all earlier notes
to write the current one. DOM order also sets the Tab order, the same lesson
as the drawer's close button.

**Alternative considered:** CSS `order` on mobile. Rejected: it changes the
visual order but not the Tab or screen reader order.

---

## 34. Appointment types are deactivated, never deleted

**Decision:** `AppointmentType` has `isActive`. Admins create, edit, deactivate
and activate types. Inactive types are hidden from the booking form and cannot
be booked (400 `APPOINTMENT_TYPE_INACTIVE`); existing appointments keep them.
Names are unique case-insensitively (409 `APPOINTMENT_TYPE_EXISTS`).

**Why:** Appointments reference their type. Deleting would either fail on the
foreign key or break the history. Same principle as soft-cancel (#4).

**Alternative considered:** Hard delete with a check for existing
appointments. Rejected: a type would become undeletable as soon as it was used,
so admins would still need a way to retire it.

**Known limitation:** Name uniqueness is checked in the service, not by a
database index, so two simultaneous creates could both pass. A unique index on
`lower(name)` would fix it in production.

## 35. The booked length is the truth, not the type's current duration

**Decision:** `updateAppointment` keeps `endTime − startTime` unless the type is
changed. Calendar blocks are drawn from `endTime − startTime`.

**Why:** Once admins can change a type's duration, recalculating from the type
would silently change old appointments (editing a comment moved the end time)
and draw them with the wrong height.

**Alternative considered:** Storing the duration on the appointment. Not
needed, since `endTime` already holds the same information.

## 36. The role decides, not the request

**Decision:** Filters that depend on the role are built in one helper,
`ownDoctorFilter`: doctors are always limited to their own rows and admins get
no filter. Client parameters that would widen access (`includeInactive`,
`doctorId`) are ignored for doctors. A doctor without a linked doctor profile
gets 403.

**Why:** Regenerating the Prisma client (TS2322) showed that `doctorId` could be
`null`. The quick fix (`?? undefined`) would have removed the filter, because
`undefined` in a Prisma `where` means "no condition", so the doctor would see
every doctor's appointments. The same gap was hidden in `getAppointments` by
`where: Record<string, unknown>`, which disables Prisma's type checking.

**Alternative considered:** Returning 403 when a doctor sends `doctorId`.
Rejected: ignoring it is simpler for the client and gives the same protection.

## 37. Admin calendar shows one doctor at a time

**Decision:** `GET /api/appointments` accepts `doctorId` for admins. The admin
calendar has a doctor selector with the first doctor (alphabetically)
preselected; there is no "all doctors" option in the day view. `doctorId` is
part of the query key.

**Why:** The day view has one column, so showing 28 doctors at once gave
overlapping blocks (known limitation in week 11). One doctor at a time matches
how a schedule is managed.

**Alternative considered:** One column per doctor. Rejected for the MVP: much
more layout work and unreadable with many doctors.

## 38. Sharing notes between doctors, with history

**Decision:** The author of a note can share read access with another doctor
and revoke it. `NoteShare` stores `noteId`, `doctorId` (recipient),
`createdByUserId`, `consentConfirmedAt`, `createdAt` and `revokedAt`. Revoking
sets `revokedAt`; sharing again creates a new row. The read rule is still in
one place (`readableNotesWhere`: author OR active share), `canReadNote` is
derived from it, and who may share is decided by `canManageShares`. Recipients
read on the patient page, never on the documentation page, and can never edit.

**Why:** A colleague taking over a patient needs context, while write access
must stay with the author. Keeping revoked rows gives a history of who had
access and when, and `createdByUserId` and `consentConfirmedAt` make a future
patient login possible without changing the table (the patient could share,
approve or give consent; only `canManageShares` and possibly a `status` field
would change).

**Alternative considered:** A unique share per pair that is reactivated
(loses history), and patient-level consent instead of per note (closer to real
practice, but depends on decisions not made yet).

**Known limitation:** Consent is confirmed by the doctor with a checkbox, not
recorded from the patient. There is no access logging as required by the
Patient Data Act. A duplicate active share is prevented in the service only
(Prisma cannot express a partial unique index). A shared note shows the
latest version; there is no content history.

## 39. Role-based routes in the frontend

**Decision:** `RequireRole` is a layout route like `ProtectedRoute`. Admin
pages are nested under `<RequireRole roles={["ADMIN"]} />`, and admin menu
items use `roles` in `navItems.ts` (#29).

**Why:** Each new admin page gets the check by being placed in the route tree,
not by repeating it in the page.

**Note:** This only avoids showing a broken page. The backend enforces the
same rule with `authorize("ADMIN")`.

## 40. Automated tests in src/test, designed to be repeatable

**Decision:** All HTTP-level tests live in `backend/src/test/` with their
helpers. Tests are written so they are rejected before anything is written
(401/403/400/409) or only read. The seed contains the scenarios they need
(an inactive type, a share from Sara to Johan). One lifecycle test (share,
read, revoke) writes data and revokes in `finally`.

**Why:** The tests are integration tests through the whole app, not unit tests
of one file, so they belong together rather than next to a source file.
Repeatable tests can run against the dev database without a reset between
runs. Seeding the scenarios avoids tests that create data they cannot delete
(types and notes have no delete).

**Alternative considered:** A separate test database with a reset before each
run. Still the better long-term solution; not needed while most tests do not
write.

## 41. No week view in the MVP calendar

**Decision:** The calendar keeps the day view, now with a doctor filter and a
"Today" button. A week view is moved to future development.

**Why:** The project brief listed day and week views. With limited time, admin
features and sharing gave more value, and the day view covers the main
workflow (today's patients, booking, one doctor at a time). Can be revisited in
week 14 if time allows, reusing `DayView` per column.
(Revisited in the redesign: built as 3.3b.)

---

## 42. Unknown ids in the request body give 400, not 404

**Decision:** When an id in the request body does not exist (patient, doctor,
appointment type, documentation template, share recipient), the API returns
400 `VALIDATION_ERROR` with a message naming what was not found. 404 is only
used when the resource in the URL does not exist.

**Why:** Booking with an unknown patient or doctor reached the database and
gave a foreign key error (500). Templates (week 11) and note sharing (week 12)
already used 400, while an unknown appointment type gave 404. One rule for the
whole API is easier to use and to explain. The acceptance criterion for US-05
(written in week 1 with 404) was updated.

**Alternative considered:** 404 for all, as in the original criterion.
Rejected: the client asked for an existing URL, so "not found" describes the
wrong thing. 422 Unprocessable Content would also fit, but the API already
uses 400 for all validation errors.

---

## 43. Appointment status rules, locked appointments and admin corrections

**Decision:** Status changes follow a fixed workflow (Scheduled → Confirmed;
Scheduled/Confirmed → Completed, No-show, Cancelled). Completed, No-show and
Cancelled are final: the appointment can no longer be edited (409
`APPOINTMENT_LOCKED`) and doctors cannot change the status again (409
`INVALID_STATUS_TRANSITION`). Completed and No-show require that the
appointment has started. Admins can correct a final status to another status,
with a reason of at least 10 characters. Safeguards: no cancelling an
appointment that has a clinical note, and restoring a cancelled appointment
runs the conflict check. Every status change is written to
`AppointmentStatusChange` (from, to, who, when, reason) in the same transaction
as the change. The rules are in `utils/appointmentStatus.ts` in the backend;
the frontend has a mirror that only decides which buttons to show.

**Why:** Status changes are part of the requirements, and a schedule is only
useful if it shows what actually happened. A final status protects the
history from accidental edits. The supervisor-style question "what if someone
clicks the wrong button?" showed that a strict lock would make mistakes
permanent, so corrections were allowed for admins, but only with a reason and a
history entry. In healthcare, corrections must be traceable.

**Alternative considered:**

- Final means final for everyone. Rejected: a mistaken "No-show" would stay
  wrong in the patient's history.
- Doctors may correct their own appointments. Rejected: a clear separation
  (doctors document, admins correct) is easier to explain and audit.
- A separate `RESCHEDULED` status. Rejected: editing the time already moves the
  same appointment; a separate status would need links between appointments.

**Known limitation:** The history only covers status changes, not time changes
(planned as COULD). Seeded appointments have no history; it starts when the app
is used. Two simultaneous status changes on the same appointment are not
prevented by locking.

---

## 44. Opening hours are checked in the clinic's time zone

**Decision:** Appointments must start at or after 07:00 and end at or before
17:00 in `Europe/Stockholm`, on the same day. The backend checks the start and
the calculated end with `Intl.DateTimeFormat` and an explicit time zone. The
frontend checks the start time in the form; the calendar shows the same hours
from the same constant.

**Why:** Bookings outside 07–17 were saved but never shown in the calendar,
which is worse than rejecting them. Times are stored in UTC (#6), and the
server's time zone can differ from the clinic's (for example a cloud server in
UTC), so the check must name the clinic's time zone instead of using local time.

**Alternative considered:** Let the calendar grow to show any booked time.
Rejected: opening hours are a real rule for a clinic, and a fixed calendar is
easier to read. Opening hours per doctor or per weekday are future development.

---

## 45. Login rate limit and secure headers

**Decision:** `helmet` sets secure HTTP headers on all responses. Login is
limited to 10 failed attempts per IP and 15 minutes (`express-rate-limit`);
successful logins are not counted. The limit is created inside `createApp()`
and turned off when `NODE_ENV=test`; a separate test turns it on.

**Why:** Without a limit, a password can be guessed indefinitely. Counting only
failed attempts protects against guessing without blocking a demo where users
are switched often. Secure headers and hiding `X-Powered-By` are cheap
defaults for any API.

**Alternative considered:** Limiting all requests, or locking the account after
failed attempts. Rejected: a global limit is not needed for a prototype, and
account lockout lets anyone lock out a known user by guessing.

**Known limitation:** The counter is in memory: reset on restart and not shared
between servers. Behind a proxy, `trust proxy` must be set or all users share
one counter.

---

## 46. No try/catch in controllers (Express 5)

**Decision:** Controllers are plain async functions without try/catch. Express
5 forwards a rejected promise from a handler to the error middleware, so
`errorHandler` still receives every `AppError`.

**Why:** The try/catch blocks were needed in Express 4, where a rejected promise
left the request hanging. With Express 5 (#12) they only repeated the same
three lines in every handler. Removing them makes each controller show only its
job: read the request, call the service, send the response. The existing
test suite, which checks many 400/403/404/409 responses, proves that errors still
reach the error handler.

**Alternative considered:** An `asyncHandler` wrapper, the common Express 4
solution. Not needed with Express 5.

---

## 47. Swedish order for patients, sorted in Node

**Decision:** The patient list is sorted with `Intl.Collator("sv")` after the
query (last name, then first name), so Å, Ä and Ö come after Z.

**Why:** PostgreSQL sorted Å as A and Ö as O, which is wrong for a Swedish
clinic and depends on how the database was installed. Without pagination
(73 patients), sorting in Node gives the same Swedish order on every machine.

**Alternative considered:** A Swedish collation on the columns (a handwritten
migration, depends on ICU support in the database). Needed if the list gets
pagination, because then the database must sort.

---

## 48. Continuous integration with GitHub Actions

**Decision:** A workflow runs lint, build and tests for backend and frontend on
every push and pull request. The backend job uses a PostgreSQL service
container that is migrated and seeded before the tests. The workflow runs in
`Europe/Stockholm` and also checks the `queryFn` convention with `grep`.

**Why:** Tests only protect the code if they are run. CI runs them on a clean
machine every time, which also catches problems that only work on the
developer's computer (missing files, local settings, time zone) and tests the
setup guide.

**Alternative considered:** A separate test database locally with a pre-push
hook. Rejected: it depends on every developer's machine; CI gives one shared
answer that is visible on GitHub.

---

## 49. One focus trap for all dialogs

**Decision:** `useFocusTrap(ref, active)` keeps Tab and Shift+Tab inside a
dialog and wraps around. It is used by `Modal` (and so by every dialog in the
app) and by the mobile menu. Only the most recently opened trap handles Tab.

**Why:** `aria-modal="true"` tells screen readers that the rest of the page is
unavailable; without a trap, keyboard users could still Tab out of the dialog.
The mobile menu had its own trap (week 12), but only for links and buttons;
the modals contain forms, so the shared version also covers inputs, selects and
textareas and skips disabled controls. Dialogs are opened on top of each other
(for example the status correction on top of the appointment detail), so only
the topmost may react, the same rule as for Escape.

**Alternative considered:** A library (focus-trap-react). Not needed for one
hook of about 50 lines that is covered by tests.

---

## 50. Accessibility review: tools plus a manual check

**Decision:** Every page was checked with Lighthouse, axe DevTools and the
keyboard. Fixed: a `main` landmark on the login page, contrast of the calendar
time labels (gray-400 → gray-600), a page title per route
(`usePageTitle`, "Calendar – Puls") and a "Skip to main content" link.
Page titles never contain patient names.

**Why:** The tools found the missing landmark and the contrast. The constant
title and the missing skip link were found by reviewing the code: tools can
check that a title exists, not that it changes. Patient names are left out of
titles because titles appear in browser history, tabs and shared screens.

**Alternative considered:** Relying on the tools alone (Lighthouse already
gave 95–100). Rejected: automated tools find only part of the problems.

---

## 51. Patients and doctors are deactivated, never deleted

**Decision:** Patients and doctors have `isActive`. Inactive patients are hidden
from the patient list by default and cannot be booked; their future
appointments are cancelled and logged when they are deactivated (except
appointments with a clinical note). Inactive doctors cannot log in or be
booked; a doctor with future appointments cannot be deactivated until they are
moved or cancelled.

**Why:** A doctor is referenced as author of notes, on appointments, shares and
the status history; deleting would either fail on the foreign keys or remove
clinical records. Under the Patient Data Act, patient records must normally be
kept (generally ten years), and a patient cannot delete their own record; only
the Health and Social Care Inspectorate (IVO) can decide on destroying it after
an application. A future "delete my data" function could therefore only send a
request. A deceased patient's record must also be kept.

**Alternative considered:** Hard delete with cascading deletes, or anonymising.
Rejected: both remove or change clinical records.

**Known limitation:** Without a personal identity number (deliberately not
stored), duplicates are detected only by name and date of birth.

## 52. The user's role and status are read from the database on every request

**Decision:** `authenticate` verifies the token and then reads the user's role,
status and doctor id from the database. Inactive or missing users get 401.
Login gives an inactive account the same error as a wrong password.

**Why:** A token is valid for 8 hours. Without the check, a deactivated doctor
could keep reading clinical notes until the token expired. One extra query per
request is a reasonable cost for access to patient records.

**Alternative considered:** Short-lived tokens with refresh tokens, or a token
denylist. Both are more complex than one query for a prototype.

## 53. Who manages patients, doctors and accounts

**Decision:** Doctors and admins create and edit patients; only admins
deactivate them (it affects every doctor's bookings). Admins manage doctors and
set a start password. Users edit their own name, work phone, specialization
(doctors) and password on "My account"; email is changed by an admin only. One
role per user. Staff home addresses are not collected.

**Why:** Small private clinics are a target group, where a doctor often
registers new patients. Email is the login identity, so letting users change it
themselves would let someone with access to an account take it over. Data that
the app does not use is not collected (data minimisation).

**Alternative considered:** Only admins create patients (closer to large
clinics); several roles per user (needed when a doctor is also the
administrator). Left for future development.

## 54. Password change does not answer 401

**Decision:** A wrong current password gives 400 `INVALID_CURRENT_PASSWORD`.

**Why:** The frontend logs out on every 401 (an expired session, #9). A user who
mistypes their current password is still logged in and should only see an
error at the field.

**Known limitation:** Other sessions stay valid after a password change until
their tokens expire; that would need a token version checked in `authenticate`.

---

## 55. Clinic settings in one row, readable without login

**Decision:** The clinic's name, address, phone and email are stored in one
row (`ClinicSettings`, id 1, saved with upsert) and edited by an admin.
`GET /api/clinic` needs no login; the name is shown in the menu and on the
login page.

**Why:** The address belongs to the clinic, not to each doctor; storing it per
user would repeat it and let copies differ. One installation serves one clinic
(multi-tenancy is out of scope). The login page needs the name before anyone
is logged in, and a clinic's name and address are public.

**Alternative considered:** Opening hours as a setting too. Left as future
development: the calendar and the booking validation would then read the hours
from the API instead of a constant.
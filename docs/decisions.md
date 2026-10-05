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

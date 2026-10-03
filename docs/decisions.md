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

**Status:** Open. Will compare `localStorage` (simple, vulnerable to XSS) vs
an httpOnly cookie (safer, more CORS/CSRF complexity) before implementing
authentication.

# Puls

[![CI](https://github.com/MohYab/Puls/actions/workflows/ci.yml/badge.svg)](https://github.com/MohYab/Puls/actions/workflows/ci.yml)

Web-based MVP for appointment booking and digital documentation in healthcare.
Built as a degree project during an internship.

> ⚠️ **Prototype.** This project uses test data only. It is not approved for
> real healthcare use and must never contain real patient information.

## Status

Weeks 1–12 of 17 are done, ahead of the original plan. The MVP works end to
end: a doctor can log in, see the dashboard and calendar, book, edit and
cancel appointments, mark what happened at a visit, search patients, view a
patient's history, and write, edit, read and share visit notes using
documentation templates. Admins manage appointment types and the schedule,
and can correct an appointment's status, but have no access to clinical notes.

Current work: quality and design before the MVP freeze (calendar week 46).
See [docs/plan-v43-v46.md](docs/plan-v43-v46.md).

### What works

**Booking and calendar**

- Calendar day view with booking, editing and cancelling, conflict checking
  and opening hours (07:00–17:00, Swedish time)
- Appointment status: confirm, completed, no-show and cancelled, with
  confirmation before a final status
- Admins can correct a final status with a reason; every status change is
  kept in a history
- Admin calendar shows one doctor at a time

**Patients and documentation**

- Patient list with name search in Swedish alphabetical order, patient page
  and appointment history
- Visit documentation with structured fields and templates (General
  consultation, Follow-up visit, Annual check-up, Vaccination), and previous
  notes per patient (doctors only)
- Doctors can share a note read-only with a colleague and revoke it
  (simulated patient consent, history kept)

**Administration**

- Manage appointment types: create, edit, deactivate and activate (types are
  never deleted)

**Quality and security**

- Login with JWT and role-based access (Doctor, Admin); automatic logout when
  the session expires, and cached data is cleared on logout
- Rate limit on failed logins, secure HTTP headers, and the same error for an
  unknown email and a wrong password
- Consistent loading, empty and error states, keyboard-accessible dialogs and
  an error boundary
- Responsive layout from 375 px with a mobile menu
- Automated backend and frontend tests, run on every push (CI)

## Tech stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS v4, React Router,
  TanStack Query, React Hook Form, Zod
- **Backend:** Node.js, Express 5, TypeScript, REST API, helmet,
  express-rate-limit
- **Database:** PostgreSQL with Prisma ORM 7
- **Auth:** JWT with role-based access (Doctor, Admin)
- **Tests:** Vitest, Supertest (backend), React Testing Library (frontend)
- **CI:** GitHub Actions

## Getting started

Short version below. For a full setup on a new computer, including the
database user and troubleshooting, see **[docs/setup.md](docs/setup.md)**.

### Prerequisites

- Node.js 20.19+ (22 LTS recommended; required by Prisma 7)
- PostgreSQL 15+ running locally

### Backend

```bash
cd backend
npm install
cp .env.example .env        # fill in DATABASE_URL and JWT_SECRET
npx prisma migrate deploy   # create the tables
npx prisma generate         # Prisma 7 does not do this automatically
npx prisma db seed          # fictional test data
npm run dev
```

Runs on `http://localhost:3001`. Always run Prisma commands from `backend/`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5173`.

### Test login

All users have the password `password123`.

| Email                      | Role   | Notes                                           |
| -------------------------- | ------ | ----------------------------------------------- |
| erik@puls.test             | DOCTOR | Dr. Erik Lindqvist                              |
| sara@puls.test             | DOCTOR | Dr. Sara Nilsson                                |
| johan@puls.test            | DOCTOR | Dr. Johan Ekström                               |
| admin@puls.test            | ADMIN  | No access to clinical notes                     |
| `<first>.<last>@puls.test` | DOCTOR | 25 more doctors, e.g. `maja.svensson@puls.test` |

The seed data contains 28 doctors, 73 patients, about 135 appointments
relative to today and about 33 notes, plus scenarios used in the tests (for
example a shared note and an inactive appointment type). All of it is
fictional test data.

To reset the data, run `npx prisma db seed` in `backend/`. The script clears
the database first (and refuses to run in production). IDs change on every
run, so log in again afterwards.

## Tests

### Backend

```bash
cd backend
npx prisma db seed   # the tests use the seed users and scenarios
npm test             # or: npm run test:watch
```

HTTP-level tests in `backend/src/test/` with Vitest and Supertest against the
real app and the seeded database: permissions for notes, sharing and admin
endpoints, status rules, opening hours, login and security. They can be run
repeatedly without reseeding.

### Frontend

```bash
cd frontend
npm test             # or: npm run test:watch
```

Unit tests for rules (dates and daylight saving time, status changes, opening
hours, menu) and component tests with React Testing Library. No backend
needed; the API is mocked.

### Continuous integration

Every push and pull request runs lint, build and all tests for backend and
frontend on GitHub Actions. The backend job starts a PostgreSQL container,
applies the migrations and seeds it, in the same way as `docs/setup.md`.

See [docs/manual-testing.md](docs/manual-testing.md) for curl commands and UI
checklists for the cases that are not automated.

## Documentation

- [Project brief](docs/project-brief.md) – including changes since week 1
- [Plan v.43–v.46](docs/plan-v43-v46.md) – current work until the MVP freeze
- [Backlog](docs/backlog.md)
- [Acceptance criteria](docs/acceptance-criteria.md)
- [User flows](docs/user-flows.md)
- [Wireframes](docs/wireframes/README.md)
- [ER diagram](docs/er-diagram.md)
- [Architecture](docs/architecture.md)
- [API reference](docs/api.md)
- [Technical decisions](docs/decisions.md)
- [Setup on a new computer](docs/setup.md)
- [Manual testing](docs/manual-testing.md)
- [Project log](docs/project-log.md)

## Author

YabTec

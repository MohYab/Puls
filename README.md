# Puls

Web-based MVP for appointment booking and digital documentation in healthcare.
Built as a degree project during an internship.

> ⚠️ **Prototype.** This project uses test data only. It is not approved for
> real healthcare use and must never contain real patient information.

## Status

Week 12 of 17. The core of the MVP works end to end: a doctor can log in,
see the dashboard and calendar, book, edit and cancel appointments
(with conflict checking), search patients, view a patient's appointment
history, and write, edit and read visit notes using documentation
templates. Admins manage bookings but have no access to clinical notes.

Next up: testing and quality (week 13), then polish and MVP freeze (week 14).

### What works so far

- Login with JWT and role-based access (Doctor, Admin)
- Dashboard with today's schedule and the next appointment
- Calendar day view with booking, editing and cancelling (with a
  confirmation dialog)
- Patient list with name search, patient page and appointment history
- Visit documentation with four structured fields and templates (General
  consultation, Follow-up visit, Annual check-up, Vaccination), and previous
  notes per patient (doctors only)
- Consistent loading, empty and error states, and keyboard-accessible dialogs
- Responsive layout from 375 px: mobile menu (drawer), calendar toolbar and
  pages that stack on small screens
- Admin: manage appointment types (create, edit, deactivate) and view the
  calendar one doctor at a time
- Doctors can share a note read-only with a colleague and revoke it
  (simulated patient consent, history kept)
- Automated backend tests for note access, sharing and admin rules
  (Vitest + Supertest, 33 tests)

## Tech stack

- Frontend: React, TypeScript, Vite, Tailwind CSS v4, React Router,
  TanStack Query, React Hook Form, Zod
- Backend: Node.js, Express, TypeScript, REST API
- Database: PostgreSQL with Prisma ORM
- Auth: JWT with role-based access (Doctor, Admin)
- Backend tests: Vitest, Supertest

## Getting started

### Prerequisites

- Node.js 20.19+ (22 LTS recommended)
- PostgreSQL running locally

### Backend

```bash
cd backend
npm install
cp .env.example .env   # fill in DATABASE_URL and JWT_SECRET
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Runs on `http://localhost:3001`. The seed step can be repeated at any time
to reset the demo data (see "Test login" below).

### Backend tests

```bash
cd backend
npx prisma db seed   # permission tests use seed users and notes
npm test             # once; or: npm run test:watch
```

Requires `.env` with `DATABASE_URL` and `JWT_SECRET`. The suites in
`backend/src/test/` log in as the seed users and check access rules for notes,
note sharing and admin endpoints. They can be run repeatedly without
reseeding.

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

The seed data contains 28 doctors, 73 patients, about 135 appointments and
about 33 notes. All of it is fictional test data.

To reset the data at any time, run `npx prisma db seed` in `backend/`. The
script clears the database first (and refuses to run in production), so it
can be run repeatedly. IDs change on every run: log in again afterwards.

See [docs/manual-testing.md](docs/manual-testing.md) for API testing
commands (curl) and how they relate to the automated suite.

## Documentation

- [Project brief](docs/project-brief.md)
- [Backlog](docs/backlog.md)
- [Acceptance criteria](docs/acceptance-criteria.md)
- [User flows](docs/user-flows.md)
- [Wireframes](docs/wireframes/README.md)
- [ER diagram](docs/er-diagram.md)
- [Architecture](docs/architecture.md)
- [API reference](docs/api.md)
- [Technical decisions](docs/decisions.md)
- [Project log](docs/project-log.md)

## Author

YabTec

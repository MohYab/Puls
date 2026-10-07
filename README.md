# Puls

Web-based MVP for appointment booking and digital documentation in healthcare.
Built as a degree project Sduring an internship.

> ⚠️ **Prototype.** This project uses test data only. It is not approved for
> real healthcare use and must never contain real patient information.

## Status

Week 7. Authentication, frontend routing, and a working
dashboard are in place. Next up: calendar and the appointment booking flow.

## Tech stack

- Frontend: React, TypeScript, Vite, Tailwind CSS v4, React Router,
  TanStack Query, React Hook Form, Zod
- Backend: Node.js, Express, TypeScript, REST API
- Database: PostgreSQL with Prisma ORM
- Auth: JWT with role-based access (Doctor, Admin)

## Getting started

### Prerequisites

- Node.js 18+
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

Runs on `http://localhost:3001`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5173`.

### Test login

| Email           | Password    | Role   |
| --------------- | ----------- | ------ |
| erik@puls.test  | password123 | DOCTOR |
| admin@puls.test | password123 | ADMIN  |

See [docs/manual-testing.md](docs/manual-testing.md) for API testing
commands.

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

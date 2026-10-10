# Manual API testing – Puls

Requires the backend running (`npm run dev` in `backend/`) and `jq` installed.

## Seed users

| Email           | Password    | Role   |
| --------------- | ----------- | ------ |
| erik@puls.test  | password123 | DOCTOR |
| admin@puls.test | password123 | ADMIN  |

## Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"erik@puls.test","password":"password123"}'
```

Expected: 200 with `token` and `user` (no `passwordHash`).

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"erik@puls.test","password":"wrong"}'
```

Expected: 401 `INVALID_CREDENTIALS`.

## Get a token for further requests

```bash
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"erik@puls.test","password":"password123"}' | jq -r '.token')
```

## Check current user

```bash
curl http://localhost:3001/api/auth/me -H "Authorization: Bearer $TOKEN"
```

Expected: 200 with `user` (userId, role, doctorId).

```bash
curl http://localhost:3001/api/auth/me
```

Expected: 401 `UNAUTHORIZED`.

## Appointment types (protected)

```bash
curl http://localhost:3001/api/appointment-types -H "Authorization: Bearer $TOKEN"
```

Expected: 200 with 4 appointment types.

```bash
curl http://localhost:3001/api/appointment-types
```

Expected: 401 `UNAUTHORIZED`.

## Tokens for both roles

```bash
DOCTOR_TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"erik@puls.test","password":"password123"}' | jq -r '.token')

ADMIN_TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@puls.test","password":"password123"}' | jq -r '.token')
```

Variables only live in the current terminal window, and tokens expire. Log in again on a 401.

## Patients (protected)

Get a patient id first:

```bash
curl http://localhost:3001/api/patients -H "Authorization: Bearer $ADMIN_TOKEN"
curl "http://localhost:3001/api/patients?search=anna" -H "Authorization: Bearer $ADMIN_TOKEN"
```

Expected: 200 with the patient list (filtered by name when `search` is given).

```bash
curl http://localhost:3001/api/patients/<patientId> -H "Authorization: Bearer $ADMIN_TOKEN"
```

Expected: 200 with id, firstName, lastName, dateOfBirth, phone, email.

```bash
curl -i http://localhost:3001/api/patients/does-not-exist -H "Authorization: Bearer $ADMIN_TOKEN"
```

Expected: 404 `NOT_FOUND` as JSON. An HTML "Cannot GET" response means the route is not registered (restart the server).

```bash
curl -i http://localhost:3001/api/patients/<patientId>
```

Expected: 401 `UNAUTHORIZED`.

## Patient appointment history

```bash
curl http://localhost:3001/api/patients/<patientId>/appointments -H "Authorization: Bearer $DOCTOR_TOKEN"
curl http://localhost:3001/api/patients/<patientId>/appointments -H "Authorization: Bearer $ADMIN_TOKEN"
curl -i http://localhost:3001/api/patients/does-not-exist/appointments -H "Authorization: Bearer $ADMIN_TOKEN"
```

Expected: 200 with appointments, newest first (doctor: only own appointments, admin: all). Unknown patient: 404 `NOT_FOUND`.

Known test gap: the seed data has one doctor, so the doctor filter is not verified against another doctor's appointments.

## UI checklist: patients (week 9)

- `/patients` lists the seed patients; the sidebar highlights "Patients"
- Typing in the search box filters after a short pause; one request per pause (Network tab)
- A search with no match shows "No patients match ..."; clearing the box restores the list
- Clicking a patient opens `/patients/:id` with info card and appointment history (newest first, status badges)
- A new booking for the patient appears in the history after navigating to the page
- `/patients/does-not-exist` shows "Patient not found" within about a second
- With the backend stopped, a patient page shows the error box with "Try again"
- Works as both doctor and admin

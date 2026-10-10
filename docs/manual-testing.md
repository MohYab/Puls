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

## Clinical notes (protected, doctors only)

Get ids for a COMPLETED appointment (has a seeded note), a SCHEDULED one without a note, and a CANCELLED one:

```bash
COMPLETED_ID=$(curl -s http://localhost:3001/api/appointments -H "Authorization: Bearer $DOCTOR_TOKEN" \
  | jq -r '[.[] | select(.status=="COMPLETED")][0].id')
SCHEDULED_ID=$(curl -s http://localhost:3001/api/appointments -H "Authorization: Bearer $DOCTOR_TOKEN" \
  | jq -r '[.[] | select(.status=="SCHEDULED")][0].id')
CANCELLED_ID=$(curl -s http://localhost:3001/api/appointments -H "Authorization: Bearer $DOCTOR_TOKEN" \
  | jq -r '[.[] | select(.status=="CANCELLED")][0].id')
```

Note: the create test consumes `SCHEDULED_ID` (one note per appointment). To repeat it, use another appointment without a note or reset the database.

| #   | Request                                                        | Expected                                       |
| --- | -------------------------------------------------------------- | ---------------------------------------------- |
| 1   | `GET /appointments/$COMPLETED_ID/notes` as doctor              | 200 with the note                              |
| 2   | same as admin                                                  | 403 `FORBIDDEN`                                |
| 3   | `GET /appointments/$SCHEDULED_ID/notes` as doctor              | 404 `NOT_FOUND` (no note yet, a normal state)  |
| 4   | `POST /appointments/$SCHEDULED_ID/notes` with `{"plan":"..."}` | 201, `content` has all four keys (rest `""`)   |
| 5   | same POST again                                                | 409 `NOTE_EXISTS`                              |
| 6   | `POST` with `{}`                                               | 400 `VALIDATION_ERROR`                         |
| 7   | `POST /appointments/$CANCELLED_ID/notes`                       | 409 `APPOINTMENT_CANCELLED`                    |
| 8   | `PUT /notes/<noteId>` with new content                         | 200, `updatedAt` changes                       |
| 9   | `PUT` as admin / `PUT /notes/does-not-exist` as doctor         | 403 `FORBIDDEN` / 404 `NOT_FOUND`              |
| 10  | `GET /patients/<patientId>/notes` as doctor / as admin         | 200 list, newest visit first / 403 `FORBIDDEN` |
| 11  | any notes endpoint without token                               | 401 `UNAUTHORIZED`                             |

Example (test 4):

```bash
curl -i -X POST http://localhost:3001/api/appointments/$SCHEDULED_ID/notes \
  -H "Authorization: Bearer $DOCTOR_TOKEN" -H "Content-Type: application/json" \
  -d '{"plan":"Follow up in two weeks."}'
```

Known test gap: the seed data has one doctor, so "doctor B cannot read doctor A's note" (403) is not verified. Notes cannot be deleted (no DELETE endpoint by design).

## UI checklist: documentation (week 10)

- Calendar: clicking a booking as doctor shows a "Documentation" link (not for cancelled bookings, not for admin)
- `/documentation/<appointmentId>` shows patient, time, type and status; an appointment without a note shows an empty form ("Not saved yet")
- Saving with all fields empty shows "Write something in at least one field" and sends no request
- Saving creates the note ("Documentation saved", button changes to "Save changes", timestamps appear); reloading keeps the text
- Editing and saving again updates "Last updated"; the saved message disappears while typing
- Double-clicking Save on a new note does not cause a 409 (button disabled while saving)
- Patient page: "Previous documentation" lists the patient's notes (newest visit first, line breaks preserved) with an "Open documentation" link; a new note appears there after saving
- Documentation page: the current note is hidden in the list beside the form
- Patient history has a "Documentation" link on non-cancelled rows (doctor only)
- Cancelled appointment without a note: "Appointment cancelled", no form
- `/documentation/does-not-exist`: "Appointment not found"
- Admin: documentation page shows "No access", patient page shows "Clinical notes are only visible to doctors.", and no `/notes` requests appear in the Network tab
- Backend stopped: error box with "Try again"

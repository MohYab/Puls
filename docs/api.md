# API reference – Puls

Base URL: `/api`
All endpoints except `/auth/login` require `Authorization: Bearer <token>`.

## Error format

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "startTime is required" } }
```

| Code                      | HTTP status | Meaning                                                   |
| ------------------------- | ----------- | --------------------------------------------------------- |
| VALIDATION_ERROR          | 400         | Invalid request body or parameters                        |
| APPOINTMENT_TYPE_INACTIVE | 400         | The appointment type is no longer in use                  |
| PATIENT_INACTIVE          | 400         | The patient is inactive and cannot be booked              |
| DOCTOR_INACTIVE           | 400         | The doctor is inactive and cannot be booked               |
| INVALID_CURRENT_PASSWORD  | 400         | Wrong current password when changing password (not 401)   |
| UNAUTHORIZED              | 401         | Missing, invalid or expired token                         |
| INVALID_CREDENTIALS       | 401         | Wrong email or password on login (does not say which)     |
| FORBIDDEN                 | 403         | Logged in, but not allowed (role or ownership)            |
| NOT_FOUND                 | 404         | The resource does not exist                               |
| APPOINTMENT_CONFLICT      | 409         | The doctor already has an appointment at that time        |
| APPOINTMENT_CANCELLED     | 409         | A cancelled appointment cannot be documented              |
| NOTE_EXISTS               | 409         | The appointment already has a note                        |
| APPOINTMENT_TYPE_EXISTS   | 409         | An appointment type with that name already exists         |
| NOTE_ALREADY_SHARED       | 409         | The note is already shared with this doctor               |
| INVALID_STATUS_TRANSITION | 409         | The status change is not allowed (see Appointment status) |
| APPOINTMENT_LOCKED        | 409         | The appointment has a final status and cannot be edited   |
| PATIENT_EXISTS            | 409         | A patient with the same name and date of birth exists     |
| PATIENT_STATUS_UNCHANGED  | 409         | The patient already has that status                       |
| DOCTOR_STATUS_UNCHANGED   | 409         | The doctor already has that status                        |
| DOCTOR_HAS_APPOINTMENTS   | 409         | The doctor has future appointments (move or cancel first) |
| EMAIL_IN_USE              | 409         | Another user already has this email address               |
| TOO_MANY_REQUESTS         | 429         | Too many failed login attempts (10 per 15 minutes per IP) |
| INTERNAL_ERROR            | 500         | Unexpected server error                                   |

## Auth

| Method | Path        | Role | Body                  | Response          |
| ------ | ----------- | ---- | --------------------- | ----------------- |
| POST   | /auth/login | none | `{ email, password }` | `{ token, user }` |
| GET    | /auth/me    | any  | –                     | `{ user }`        |

`POST /auth/login` is rate limited: after 10 failed attempts from the same IP
within 15 minutes, every login attempt gets 429 `TOO_MANY_REQUESTS` until the
window has passed. Successful logins are not counted.
Every authenticated request reads the user's role and status from the database,
so a deactivated user is locked out immediately (401 "Your account is no longer
active"), even with a token that has not expired.

## Appointments

| Method | Path                      | Role   | Notes                                                                                                                  |
| ------ | ------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------- |
| GET    | /appointments             | any    | Filters: `date` or `from`+`to`, and `doctorId` (see below). Doctor sees own only; admin sees all or one doctor         |
| GET    | /appointments/to-document | DOCTOR | Own completed visits without a note, oldest first, at most 20 (see below)                                              |
| GET    | /appointments/:id         | any    | 404 if not found, 403 if doctor doesn't own it                                                                         |
| POST   | /appointments             | any    | 400 for unknown patient, doctor or type; 400 `APPOINTMENT_TYPE_INACTIVE`, 409 on conflict                              |
| PUT    | /appointments/:id         | any    | Only owner doctor or admin; 409 `APPOINTMENT_LOCKED` for a final status; booked length is kept unless the type changes |
| PATCH  | /appointments/:id/status  | any    | Body: `{ status, reason? }`; see Appointment status                                                                    |

**Response:** every appointment response has the patient's name and date of
birth, the type and the doctor's name. Doctors also get `hasNote` (decision #56).

```json
{
  "id": "…",
  "startTime": "2026-10-30T09:30:00.000Z",
  "endTime": "2026-10-30T10:15:00.000Z",
  "status": "SCHEDULED",
  "patient": {
    "firstName": "Anna",
    "lastName": "Andersson",
    "dateOfBirth": "1985-03-12T00:00:00.000Z"
  },
  "appointmentType": { "name": "General consultation", "duration": 45 },
  "doctor": { "user": { "name": "Dr. Erik Lindqvist" } },
  "hasNote": false
}
```

**Visits to document (doctors only):** `GET /appointments/to-document` returns
the doctor's own appointments with status `COMPLETED` that have no clinical
note, oldest first. At most 20 are listed; `total` counts all of them. Only the
existence of a note is checked, never its content (decision #58).

```json
{ "appointments": [{ "…": "same shape as above" }], "total": 34 }
```

Errors: 401 `UNAUTHORIZED`, 403 `FORBIDDEN` (admins).

**Filters on `GET /appointments`:**

| Query      | Format       | Meaning                                                               |
| ---------- | ------------ | --------------------------------------------------------------------- |
| `date`     | `YYYY-MM-DD` | One day                                                               |
| `from`     | `YYYY-MM-DD` | First day of a range (inclusive)                                      |
| `to`       | `YYYY-MM-DD` | Last day of a range (inclusive)                                       |
| `doctorId` | id           | Admin only: one doctor. Ignored for doctors, who always see their own |

- Dates are calendar days in the clinic's time zone (`Europe/Stockholm`):
  `from=2026-10-26&to=2026-11-01` returns appointments that start from
  00:00 Swedish time on 26 October up to (not including) 00:00 on 2 November
  (decision #57).
- A range is at most 7 days (one week in the calendar).
- `date=X` is the same as `from=X&to=X`.
- Without `date` or `from`/`to`, every appointment the user may see is
  returned (no pagination).

Example:

```bash
curl -s "http://localhost:3001/api/appointments?from=2026-10-26&to=2026-11-01" \
  -H "Authorization: Bearer $DOCTOR_TOKEN" | jq length
```

400 `VALIDATION_ERROR` when:

| Case                                | Message                                          |
| ----------------------------------- | ------------------------------------------------ |
| Not a real date, or wrong format    | Dates must be valid and in the format YYYY-MM-DD |
| `date` together with `from` or `to` | Use either date or from/to, not both             |
| Only one of `from` and `to`         | from and to must be used together                |
| `to` before `from`                  | from must be on or before to                     |
| More than 7 days                    | At most 7 days at a time                         |

On `PUT`, `APPOINTMENT_TYPE_INACTIVE` is only returned when the type is
changed. Editing the time of an appointment whose type was deactivated later
is allowed.

**Unknown ids:** an id in the request body that does not exist (patient,
doctor, appointment type, documentation template, share recipient) gives
400 `VALIDATION_ERROR`. 404 is used only when the resource in the URL does
not exist.

**Opening hours:** an appointment must start at or after 07:00 and end at or
before 17:00 Swedish time (`Europe/Stockholm`), on the same day. Otherwise
400 `VALIDATION_ERROR`.
**Times:** `startTime` is ISO 8601 with `Z` or an offset, e.g.
`2026-10-24T08:00:00.000Z` or `2026-10-24T10:00:00+02:00`. Times are stored in
UTC.
Booking an inactive patient or doctor gives 400 `PATIENT_INACTIVE` or
`DOCTOR_INACTIVE`.

## Appointment status

| From                          | Allowed to           | Condition                   |
| ----------------------------- | -------------------- | --------------------------- |
| SCHEDULED                     | CONFIRMED, CANCELLED | –                           |
| SCHEDULED, CONFIRMED          | COMPLETED, NO_SHOW   | The appointment has started |
| CONFIRMED                     | CANCELLED            | –                           |
| COMPLETED, NO_SHOW, CANCELLED | – (final)            | Admin correction only       |

**Admin correction:** an admin can change a final status to any other status.
`reason` (10–300 characters) is required. Safeguards:

- COMPLETED and NO_SHOW still require that the appointment has started.
- CANCELLED is not allowed when the appointment has a clinical note (also for
  normal cancellations).
- Restoring a CANCELLED appointment runs the conflict check (409
  `APPOINTMENT_CONFLICT`).

Every status change is saved in the appointment's status history (from, to,
who, when, reason). There is no endpoint to read the history yet.

Errors: 400 `VALIDATION_ERROR` (unknown status, missing or short reason),
403 `FORBIDDEN` (doctor and someone else's appointment), 404 `NOT_FOUND`,
409 `INVALID_STATUS_TRANSITION`, 409 `APPOINTMENT_CONFLICT`.

## Patients

| Method | Path                               | Role   | Notes                                                                                                                      |
| ------ | ---------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------- |
| GET    | /patients?search=&includeInactive= | any    | Active patients by default; `includeInactive=true` also returns inactive ones. Match the first or last name; Swedish order |
| POST   | /patients                          | any    | Create. 201; 409 `PATIENT_EXISTS`                                                                                          |
| GET    | /patients/:id                      | any    | Also returns inactive patients                                                                                             |
| PUT    | /patients/:id                      | any    | Replace all fields. 200; 409 `PATIENT_EXISTS`                                                                              |
| PATCH  | /patients/:id/status               | ADMIN  | Deactivate or reactivate (see below)                                                                                       |
| GET    | /patients/:id/appointments         | any    | Doctor sees own appointments with the patient and gets `hasNote`; admin sees all, without note information                 |
| GET    | /patients/:id/notes                | DOCTOR | Own notes and notes shared with the doctor, newest visit first                                                             |

Body for POST and PUT:

```json
{
  "firstName": "Anna",
  "lastName": "Andersson",
  "dateOfBirth": "1985-03-12",
  "phone": "",
  "email": ""
}
```

- Names: required, max 60 characters. `dateOfBirth`: `YYYY-MM-DD`, from 1900 to today.
- `phone` and `email` are optional; an empty string means "not given".
- A patient with the same first name, last name and date of birth (case-insensitive)
  gives 409 `PATIENT_EXISTS`. No personal identity number is stored.

**Deactivate and reactivate (admin):**

```json
{ "isActive": false, "reason": "DECEASED" }   // or "MOVED", "OTHER"
{ "isActive": true }
```

Patients are never deleted. Deactivation cancels future scheduled and confirmed
appointments in the same transaction and writes each cancellation to the status
history; appointments that have a clinical note are left unchanged. Response:

```json
{
  "patient": { "...": "..." },
  "cancelledAppointments": 2,
  "appointmentsKeptWithNote": 0
}
```

Reactivation does not restore cancelled appointments. Errors: 400, 403, 404,
409 `PATIENT_STATUS_UNCHANGED`.

## Appointment types

| Method | Path                          | Role  | Notes                                                                                             |
| ------ | ----------------------------- | ----- | ------------------------------------------------------------------------------------------------- |
| GET    | /appointment-types            | any   | Active types. `?includeInactive=true` also returns inactive types for admin (ignored for doctors) |
| POST   | /appointment-types            | ADMIN | Create a type. 201                                                                                |
| PUT    | /appointment-types/:id        | ADMIN | Replace name, duration and description. 200                                                       |
| PATCH  | /appointment-types/:id/status | ADMIN | Body `{ "isActive": boolean }`. 200                                                               |

Body for POST/PUT:

```json
{ "name": "Phone consultation", "duration": 15, "description": "Optional" }
```

- `name`: required, max 60 characters, unique (case-insensitive)
- `duration`: whole minutes, 5–240, in steps of 5
- `description`: optional, max 300 characters

Types are never deleted. An inactive type cannot be booked, but existing
appointments keep it. Changing `duration` does not change booked appointments.

Errors: 400 `VALIDATION_ERROR`, 403 `FORBIDDEN` (not admin), 404 `NOT_FOUND`,
409 `APPOINTMENT_TYPE_EXISTS`.

## Clinical notes

Doctors only: admins always get 403.

- **Read:** the author, or a doctor the note has an active share with (see Note sharing).
- **Write:** only the author. Notes are created for the doctor's own appointments.
- There is no DELETE endpoint (notes are edited, never deleted).

| Method | Path                    | Role   | Notes                                                                              |
| ------ | ----------------------- | ------ | ---------------------------------------------------------------------------------- |
| GET    | /appointments/:id/notes | DOCTOR | Requires owning the appointment; 404 if the appointment or its note does not exist |
| POST   | /appointments/:id/notes | DOCTOR | One note per appointment; 409 `NOTE_EXISTS`, 409 `APPOINTMENT_CANCELLED`           |
| PUT    | /notes/:id              | DOCTOR | Author only; full replace of `content`; 404 if the note does not exist             |

Recipients of a shared note read it through `GET /patients/:id/notes`, not
through the appointment, which belongs to another doctor.

Body for POST and PUT (validated with Zod, missing fields default to `""`, at least one field must be non-empty, max 5000 characters per field):

```json
{
  "reasonForVisit": "Annual check-up",
  "observation": "Blood pressure normal.",
  "assessment": "Good general health.",
  "plan": "Follow up in 12 months."
}
```

Response (GET, POST, PUT): the note with `id`, `appointmentId`, `patientId`, `doctorId`, `templateId`, `content`, `createdAt`, `updatedAt`, `appointment: { startTime, appointmentType: { name } }` and the author's name `doctor: { user: { name } }`.

### Documentation templates

`GET /documentation-templates` (doctors only, 403 for admin) returns all templates:

```json
[
  {
    "id": "cm...",
    "name": "Vaccination",
    "description": "For vaccination visits",
    "templateContent": { "sections": ["reasonForVisit", "observation", "plan"] }
  }
]
```

`sections` lists the note fields (keys of `content`) that the template uses. The labels belong to the frontend.

The template is chosen when a note is created: `POST /appointments/:id/notes` takes an optional `templateId` next to the four fields (400 `VALIDATION_ERROR` if it does not exist). It cannot be changed afterwards, and a `templateId` sent to `PUT /notes/:id` is ignored. Notes without a template (`templateId: null`) show all four fields.

Known limitation: the API only checks that the template exists, not that `content` follows it. The frontend shows only the fields of the template.

## Note sharing

Only the author of the note can list, create and revoke shares. Recipients get
read-only access.

| Method | Path                        | Role   | Notes                          |
| ------ | --------------------------- | ------ | ------------------------------ |
| GET    | /notes/:id/shares           | DOCTOR | Active shares of the note. 200 |
| POST   | /notes/:id/shares           | DOCTOR | Share with a doctor. 201       |
| DELETE | /notes/:id/shares/:doctorId | DOCTOR | Revoke the active share. 204   |

POST body:

```json
{ "doctorId": "…", "consentConfirmed": true }
```

`consentConfirmed` must be `true` (simulated patient consent in the MVP).

Share response:

```json
{
  "id": "…",
  "createdAt": "2026-10-17T14:00:00.000Z",
  "consentConfirmedAt": "2026-10-17T14:00:00.000Z",
  "doctor": { "id": "…", "user": { "name": "Dr. Johan Ekström" } }
}
```

Revoking keeps the row as history (`revokedAt` is set). Sharing again creates a
new row.

Errors: 400 `VALIDATION_ERROR` (no consent, sharing with yourself, unknown
doctor), 403 `FORBIDDEN` (not the author, or admin), 404 `NOT_FOUND` (note, or
no active share when revoking), 409 `NOTE_ALREADY_SHARED`.

## Doctors

| Method | Path                      | Role  | Notes                                                                |
| ------ | ------------------------- | ----- | -------------------------------------------------------------------- |
| GET    | /doctors?includeInactive= | any   | Active doctors, by name. `includeInactive=true` works for admin only |
| POST   | /doctors                  | ADMIN | Create user and doctor profile with a start password. 201            |
| PUT    | /doctors/:id              | ADMIN | Name, email, specialization. 200                                     |
| PATCH  | /doctors/:id/status       | ADMIN | Body `{ "isActive": boolean }`. 200                                  |

POST body: `{ "name", "email", "specialization", "password" }` (password 10–72
characters). Emails are stored in lower case; a taken email gives 409
`EMAIL_IN_USE`. The response never contains a password hash.

Doctors are never deleted. A doctor with future scheduled or confirmed
appointments cannot be deactivated (409 `DOCTOR_HAS_APPOINTMENTS`). An inactive
doctor cannot log in (same error as a wrong password), is locked out of existing
sessions immediately, cannot be booked and cannot receive shared notes. Their
notes and appointments are kept.

## Account (the logged-in user)

| Method | Path              | Role | Notes                                                              |
| ------ | ----------------- | ---- | ------------------------------------------------------------------ |
| GET    | /account          | any  | `{ id, name, email, phone, role, specialization }`                 |
| PUT    | /account          | any  | `{ name, phone, specialization }`; specialization only for doctors |
| PUT    | /account/password | any  | `{ currentPassword, newPassword }`. 204                            |

Email is not editable here; it is the login identity and is changed by an admin.
A wrong current password gives 400 `INVALID_CURRENT_PASSWORD`, not 401, because
the frontend treats every 401 as an expired session.

## Templates

| Method | Path                     | Role   | Notes                                              |
| ------ | ------------------------ | ------ | -------------------------------------------------- |
| GET    | /documentation-templates | DOCTOR | Template list with `sections` (see Clinical notes) |

## Clinic

| Method | Path    | Role  | Notes                                                        |
| ------ | ------- | ----- | ------------------------------------------------------------ |
| GET    | /clinic | none  | Public: shown on the login page. Name, address, phone, email |
| PUT    | /clinic | ADMIN | `{ name, addressLine, postalCode, city, phone, email }`      |

One clinic per installation; the details are stored in one row. Optional fields
accept an empty string. `postalCode` must look like `123 45`.

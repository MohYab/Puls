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

## Appointments

| Method | Path                          | Role | Notes                                                                                                                  |
| ------ | ----------------------------- | ---- | ---------------------------------------------------------------------------------------------------------------------- |
| GET    | /appointments?date=&doctorId= | any  | Doctor sees own only. Admin sees all, or one doctor with `doctorId` (ignored for doctors)                              |
| GET    | /appointments/:id             | any  | 404 if not found, 403 if doctor doesn't own it                                                                         |
| POST   | /appointments                 | any  | 400 for unknown patient, doctor or type; 400 `APPOINTMENT_TYPE_INACTIVE`, 409 on conflict                              |
| PUT    | /appointments/:id             | any  | Only owner doctor or admin; 409 `APPOINTMENT_LOCKED` for a final status; booked length is kept unless the type changes |
| PATCH  | /appointments/:id/status      | any  | Body: `{ status, reason? }`; see Appointment status                                                                    |

On `PUT`, `APPOINTMENT_TYPE_INACTIVE` is only returned when the type is
changed. Editing the time of an appointment whose type was deactivated later
is allowed.

**Unknown ids:** an id in the request body that does not exist (patient,
doctor, appointment type, documentation template, share recipient) gives
400 `VALIDATION_ERROR`. 404 is used only when the resource in the URL does
not exist.

**Opening hours:** an appointment must start at or after 07:00 and end at or
before 17:00 Swedish time (`Europe/Stockholm`), on the same day. Otherwise
400 `VALIDATION_ERROR`. The check uses the clinic's time zone, not the server's.

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

| Method | Path                       | Role   | Notes                                                                                                 |
| ------ | -------------------------- | ------ | ----------------------------------------------------------------------------------------------------- |
| GET    | /patients?search=          | any    | Every word must match the first or last name (case-insensitive); sorted by last name, then first name |
| GET    | /patients/:id              | any    |                                                                                                       |
| GET    | /patients/:id/appointments | any    | Doctor sees own appointments with the patient; admin sees all                                         |
| GET    | /patients/:id/notes        | DOCTOR | 403 for admin; own notes and notes shared with the doctor, newest visit first                         |

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

## Doctors and templates

| Method | Path                     | Role   | Notes                                              |
| ------ | ------------------------ | ------ | -------------------------------------------------- |
| GET    | /doctors                 | any    |                                                    |
| GET    | /documentation-templates | DOCTOR | Template list with `sections` (see Clinical notes) |

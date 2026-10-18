# API reference – Puls

Base URL: `/api`
All endpoints except `/auth/login` require `Authorization: Bearer <token>`.

## Error format

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "startTime is required" } }
```

| Code                      | HTTP status | Meaning                                               |
| ------------------------- | ----------- | ----------------------------------------------------- |
| VALIDATION_ERROR          | 400         | Invalid request body or parameters                    |
| APPOINTMENT_TYPE_INACTIVE | 400         | The appointment type is no longer in use              |
| UNAUTHORIZED              | 401         | Missing, invalid or expired token                     |
| INVALID_CREDENTIALS       | 401         | Wrong email or password on login (does not say which) |
| FORBIDDEN                 | 403         | Logged in, but not allowed (role or ownership)        |
| NOT_FOUND                 | 404         | The resource does not exist                           |
| APPOINTMENT_CONFLICT      | 409         | The doctor already has an appointment at that time    |
| APPOINTMENT_CANCELLED     | 409         | A cancelled appointment cannot be documented          |
| NOTE_EXISTS               | 409         | The appointment already has a note                    |
| APPOINTMENT_TYPE_EXISTS   | 409         | An appointment type with that name already exists     |
| NOTE_ALREADY_SHARED       | 409         | The note is already shared with this doctor           |
| INTERNAL_ERROR            | 500         | Unexpected server error                               |

## Auth

| Method | Path        | Role | Body                  | Response          |
| ------ | ----------- | ---- | --------------------- | ----------------- |
| POST   | /auth/login | none | `{ email, password }` | `{ token, user }` |
| GET    | /auth/me    | any  | –                     | `{ user }`        |

## Appointments

| Method | Path                          | Role | Notes                                                                                     |
| ------ | ----------------------------- | ---- | ----------------------------------------------------------------------------------------- |
| GET    | /appointments?date=&doctorId= | any  | Doctor sees own only. Admin sees all, or one doctor with `doctorId` (ignored for doctors) |
| GET    | /appointments/:id             | any  | 404 if not found, 403 if doctor doesn't own it                                            |
| POST   | /appointments                 | any  | 400 for unknown patient, doctor or type; 400 `APPOINTMENT_TYPE_INACTIVE`, 409 on conflict |
| PUT    | /appointments/:id             | any  | Only owner doctor or admin; booked length is kept unless the type changes                 |
| PATCH  | /appointments/:id/status      | any  | Body: `{ status }`                                                                        |

On `PUT`, `APPOINTMENT_TYPE_INACTIVE` is only returned when the type is
changed. Editing the time of an appointment whose type was deactivated later
is allowed.

**Unknown ids:** an id in the request body that does not exist (patient,
doctor, appointment type, documentation template, share recipient) gives
400 `VALIDATION_ERROR`. 404 is used only when the resource in the URL does
not exist.

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

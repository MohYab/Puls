# API reference – Puls

Base URL: `/api`
All endpoints except `/auth/login` require `Authorization: Bearer <token>`.

## Error format

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "startTime is required" } }
```

| Code                 | HTTP status |
| -------------------- | ----------- |
| VALIDATION_ERROR     | 400         |
| UNAUTHORIZED         | 401         |
| FORBIDDEN            | 403         |
| NOT_FOUND            | 404         |
| APPOINTMENT_CONFLICT | 409         |
| INTERNAL_ERROR       | 500         |

## Auth

| Method | Path        | Role | Body                  | Response          |
| ------ | ----------- | ---- | --------------------- | ----------------- |
| POST   | /auth/login | none | `{ email, password }` | `{ token, user }` |
| GET    | /auth/me    | any  | –                     | `{ user }`        |

## Appointments

| Method | Path                                  | Role | Notes                                          |
| ------ | ------------------------------------- | ---- | ---------------------------------------------- |
| GET    | /appointments?date=&doctorId=&status= | any  | Doctor sees own only; Admin sees all           |
| GET    | /appointments/:id                     | any  | 404 if not found, 403 if doctor doesn't own it |
| POST   | /appointments                         | any  | Body validated; 409 on conflict                |
| PUT    | /appointments/:id                     | any  | Only owner doctor or admin                     |
| PATCH  | /appointments/:id/status              | any  | Body: `{ status }`                             |

## Patients

| Method | Path                       | Role   | Notes                                                                                                 |
| ------ | -------------------------- | ------ | ----------------------------------------------------------------------------------------------------- |
| GET    | /patients?search=          | any    | Every word must match the first or last name (case-insensitive); sorted by last name, then first name |
| GET    | /patients/:id              | any    |                                                                                                       |
| GET    | /patients/:id/appointments | any    |                                                                                                       |
| GET    | /patients/:id/notes        | DOCTOR | 403 for admin; only the requesting doctor's own notes, newest visit first                             |

## Clinical notes

Doctors only: admins always get 403. A doctor can only read and write notes for their own appointments, and only the doctor who wrote a note can edit it. There is no DELETE endpoint (notes are edited, never deleted).

| Method | Path                    | Role   | Notes                                                                    |
| ------ | ----------------------- | ------ | ------------------------------------------------------------------------ |
| GET    | /appointments/:id/notes | DOCTOR | 404 if the appointment or its note does not exist                        |
| POST   | /appointments/:id/notes | DOCTOR | One note per appointment; 409 `NOTE_EXISTS`, 409 `APPOINTMENT_CANCELLED` |
| PUT    | /notes/:id              | DOCTOR | Full replace of `content`; 404 if the note does not exist                |

Body for POST and PUT (validated with Zod, missing fields default to `""`, at least one field must be non-empty, max 5000 characters per field):

```json
{
  "reasonForVisit": "Annual check-up",
  "observation": "Blood pressure normal.",
  "assessment": "Good general health.",
  "plan": "Follow up in 12 months."
}
```

Response (GET, POST, PUT): the note with `id`, `appointmentId`, `patientId`, `doctorId`, `templateId`, `content`, `createdAt`, `updatedAt`, and `appointment: { startTime, appointmentType: { name } }`.

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

## Doctors / appointment types / templates

| Method    | Path                     | Role   | Notes                                              |
| --------- | ------------------------ | ------ | -------------------------------------------------- |
| GET       | /doctors                 | any    |                                                    |
| GET       | /appointment-types       | any    |                                                    |
| POST, PUT | /appointment-types       | ADMIN  |                                                    |
| GET       | /documentation-templates | DOCTOR | Template list with `sections` (see Clinical notes) |

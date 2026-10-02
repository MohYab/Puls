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

| Method | Path                       | Role   | Notes          |
| ------ | -------------------------- | ------ | -------------- |
| GET    | /patients?search=          | any    | Search by name |
| GET    | /patients/:id              | any    |                |
| GET    | /patients/:id/appointments | any    |                |
| GET    | /patients/:id/notes        | DOCTOR | 403 for admin  |

## Clinical notes

| Method | Path                    | Role   | Notes                        |
| ------ | ----------------------- | ------ | ---------------------------- |
| GET    | /appointments/:id/notes | DOCTOR |                              |
| POST   | /appointments/:id/notes | DOCTOR | One note per appointment     |
| PUT    | /notes/:id              | DOCTOR | Only the doctor who wrote it |

## Doctors / appointment types / templates

| Method    | Path                     | Role   | Notes |
| --------- | ------------------------ | ------ | ----- |
| GET       | /doctors                 | any    |       |
| GET       | /appointment-types       | any    |       |
| POST, PUT | /appointment-types       | ADMIN  |       |
| GET       | /documentation-templates | DOCTOR |       |

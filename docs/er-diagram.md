# ER diagram – Puls

Reflects `backend/prisma/schema.prisma` as of week 12.

```mermaid
erDiagram
    USER ||--o| DOCTOR : "is a"
    DOCTOR ||--o{ APPOINTMENT : "has"
    PATIENT ||--o{ APPOINTMENT : "has"
    APPOINTMENT_TYPE ||--o{ APPOINTMENT : "defines"
    APPOINTMENT ||--o| CLINICAL_NOTE : "documented by"
    PATIENT ||--o{ CLINICAL_NOTE : "has"
    DOCTOR ||--o{ CLINICAL_NOTE : "writes"
    DOCUMENTATION_TEMPLATE |o--o{ CLINICAL_NOTE : "used by"
    CLINICAL_NOTE ||--o{ NOTE_SHARE : "shared through"
    DOCTOR ||--o{ NOTE_SHARE : "receives"
    USER ||--o{ NOTE_SHARE : "creates"
    APPOINTMENT ||--o{ APPOINTMENT_STATUS_CHANGE : "history"
    USER ||--o{ APPOINTMENT_STATUS_CHANGE : "changes"

    USER {
        string id PK
        string name
        string email UK
        string passwordHash
        string role "DOCTOR or ADMIN"
        datetime createdAt
    }

    DOCTOR {
        string id PK
        string userId FK, UK
        string specialization "optional"
    }

    PATIENT {
        string id PK
        string firstName
        string lastName
        date dateOfBirth
        string phone "optional"
        string email "optional"
        datetime createdAt
    }

    APPOINTMENT {
        string id PK
        string patientId FK
        string doctorId FK
        string appointmentTypeId FK
        datetime startTime
        datetime endTime "booked length is kept"
        string status
        string bookingComment "optional"
        datetime createdAt
        datetime updatedAt
    }

    APPOINTMENT_TYPE {
        string id PK
        string name "unique, case-insensitive (service)"
        int duration "minutes, 5-240"
        string description "optional"
        boolean isActive "inactive = not bookable"
    }

    CLINICAL_NOTE {
        string id PK
        string appointmentId FK, UK
        string patientId FK
        string doctorId FK "author"
        string templateId FK "optional"
        json content
        datetime createdAt
        datetime updatedAt
    }

    DOCUMENTATION_TEMPLATE {
        string id PK
        string name
        string description "optional"
        json templateContent
    }

    NOTE_SHARE {
        string id PK
        string noteId FK
        string doctorId FK "recipient"
        string createdByUserId FK
        datetime consentConfirmedAt
        datetime createdAt
        datetime revokedAt "null = active"
    }
        APPOINTMENT_STATUS_CHANGE {
        string id PK
        string appointmentId FK
        string fromStatus
        string toStatus
        string changedByUserId FK
        string reason "required for admin corrections"
        datetime createdAt
    }
```

## Notes

- `USER ||--o| DOCTOR`: one-to-one, optional. Only users with role Doctor have
  a Doctor row. Admin users have no Doctor row.
- `APPOINTMENT ||--o| CLINICAL_NOTE`: one-to-one, optional. One note per
  appointment (`appointmentId` is unique on `CLINICAL_NOTE`).
- `DOCUMENTATION_TEMPLATE |o--o{ CLINICAL_NOTE`: a note has zero or one
  template. The template is chosen when the note is created and cannot be
  changed afterwards.
- `CLINICAL_NOTE.content` and `DOCUMENTATION_TEMPLATE.templateContent` are
  stored as JSON rather than separate tables, to keep templates simple.
- `APPOINTMENT.status` is an enum: SCHEDULED, CONFIRMED, COMPLETED, CANCELLED,
  NO_SHOW.
- Nothing that carries history is deleted:
  - Cancelling an appointment is a status change (`CANCELLED`).
  - Retiring an appointment type sets `isActive = false`.
  - Revoking a note share sets `revokedAt`; sharing again creates a new row.
  - Every status change is written to `APPOINTMENT_STATUS_CHANGE`; corrections
    by an admin need a reason. The table is only appended to.
- `NOTE_SHARE` gives a doctor read access to another doctor's note. The
  recipient (`doctorId`) and the creator (`createdByUserId`, a user) are
  separate so that a future patient login could create shares without
  changing the table. There is no unique index on `(noteId, doctorId)`: only
  one active share per pair is allowed, and that is checked in the service.
- `APPOINTMENT.endTime` is stored, not calculated, so changing a type's
  duration does not change booked appointments.

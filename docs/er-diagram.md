# ER diagram – Puls

```mermaid
erDiagram
    USER ||--o| DOCTOR : "is a"
    DOCTOR ||--o{ APPOINTMENT : "has"
    PATIENT ||--o{ APPOINTMENT : "has"
    APPOINTMENT_TYPE ||--o{ APPOINTMENT : "defines"
    APPOINTMENT ||--o| CLINICAL_NOTE : "documented by"
    PATIENT ||--o{ CLINICAL_NOTE : "has"
    DOCTOR ||--o{ CLINICAL_NOTE : "writes"
    DOCUMENTATION_TEMPLATE ||--o{ CLINICAL_NOTE : "used by"

    USER {
        string id PK
        string name
        string email
        string passwordHash
        string role
        datetime createdAt
    }

    DOCTOR {
        string id PK
        string userId FK
        string specialization
    }

    PATIENT {
        string id PK
        string firstName
        string lastName
        date dateOfBirth
        string phone
        string email
        datetime createdAt
    }

    APPOINTMENT {
        string id PK
        string patientId FK
        string doctorId FK
        string appointmentTypeId FK
        datetime startTime
        datetime endTime
        string status
        string bookingComment
        datetime createdAt
        datetime updatedAt
    }

    APPOINTMENT_TYPE {
        string id PK
        string name
        int duration
        string description
    }

    CLINICAL_NOTE {
        string id PK
        string appointmentId FK
        string patientId FK
        string doctorId FK
        string templateId FK
        json content
        datetime createdAt
        datetime updatedAt
    }

    DOCUMENTATION_TEMPLATE {
        string id PK
        string name
        string description
        json templateContent
    }
```

## Notes

- `USER ||--o| DOCTOR`: one-to-one, optional. Only users with role Doctor have
  a Doctor row. Admin users have no Doctor row.
- `APPOINTMENT ||--o| CLINICAL_NOTE`: one-to-one, optional. One note per
  appointment in the MVP (`appointmentId` is unique on `CLINICAL_NOTE`).
- `CLINICAL_NOTE.content` and `DOCUMENTATION_TEMPLATE.templateContent` are
  stored as JSON rather than separate tables, to keep templates simple.
- `APPOINTMENT.status` is an enum: SCHEDULED, CONFIRMED, COMPLETED, CANCELLED,
  NO_SHOW.
- Cancelling an appointment is a status change, not a delete — history is
  always kept.

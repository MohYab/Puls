# User flows – Puls

## Flow 1: Login

```mermaid
flowchart TD
    A[Open app] --> B{Logged in?}
    B -- No --> C[/login/]
    C --> D[Enter email and password]
    D --> E{Valid?}
    E -- No --> F[Show error message] --> D
    E -- Yes --> G[/dashboard/]
    B -- Yes --> G
```

## Flow 2: Doctor creates an appointment

```mermaid
flowchart TD
    A[/calendar/] --> B[Click 'New appointment']
    B --> C[Select patient]
    C --> D[Select appointment type]
    D --> E[Select date and time]
    E --> F{Valid and no conflict?}
    F -- Validation error --> E
    F -- Time conflict --> G[Show conflict message] --> E
    F -- OK --> H[Save appointment]
    H --> I[Show confirmation]
    I --> A
```

## Flow 3: Doctor documents a visit

```mermaid
flowchart TD
    A[/dashboard/ or /calendar/] --> B[Click appointment]
    B --> C[/appointments/:id/]
    C --> D[Click 'Document visit']
    D --> E[/documentation/:appointmentId/]
    E --> F[Choose template]
    F --> G[Fill in sections]
    G --> H[Click 'Save']
    H --> I{Saved?}
    I -- No --> J[Show error, keep text] --> G
    I -- Yes --> K[Show confirmation]
    K --> L[Optionally: mark appointment as Completed]
```

## Flow 4: Doctor looks up patient history

```mermaid
flowchart TD
    A[/patients/] --> B[Search for patient]
    B --> C[Click patient]
    C --> D[/patients/:id/]
    D --> E[View appointment history]
    E --> F[Click a past appointment]
    F --> G[View note if it exists]
```

## Flow 5: Admin manages appointment types

```mermaid
flowchart TD
    A[/dashboard/] --> B[/admin/appointment-types/]
    B --> C[View list]
    C --> D[Add or edit type]
    D --> E[Enter name, duration, description]
    E --> F{Valid?}
    F -- No --> E
    F -- Yes --> G[Save and update list]
```
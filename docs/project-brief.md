# Project brief – Puls

## Problem

Healthcare providers often handle appointment booking and clinical
documentation in separate systems or through manual steps. This creates
duplicate work and makes it hard to see the full context of a visit — who
the patient is, what happened in previous visits, and what needs to be
documented now.

## Goal

Build a working, tested MVP where a doctor can log in, view their schedule,
book/change/cancel appointments, open a visit, and write and save a
structured clinical note — all in one connected flow.

**Definition of done:** A ~5 minute demo runs without errors: login →
dashboard → create appointment → open appointment → write documentation →
view history.

## Target users

- **Doctors** (primary) – need a fast overview and simple documentation.
- **Admins** (secondary) – need an overview of all appointments and basic
  data management.
- Patients do not log in to the system in this MVP.

## User roles

| Role   | Can do                                                                                                                        |
| ------ | ----------------------------------------------------------------------------------------------------------------------------- |
| Doctor | Log in, view own calendar/appointments, create/edit/cancel appointments, view limited patient info, write/edit clinical notes |
| Admin  | Log in, view all appointments, manage appointment types, view doctors and patients. No access to clinical notes.              |

## MVP scope

**In scope:** Login (JWT, roles), dashboard, calendar (day/week), appointment
CRUD with conflict handling, patient list and detail with history,
appointment detail, documentation (create/edit/view), basic templates,
validation, error handling, responsive UI, seed/test data.

**Out of scope:** Patient login, SMS/email notifications, AI/speech-to-text,
video visits, external system integrations, advanced permissions, rich text
editor, recurring appointments, real patient data.

## Constraints

- Only dummy/test data is used — never real patient information.
- The system is a prototype and is not approved for real healthcare use.
- Timeline: 14 LIA weeks + 3 weeks for finalization, report and presentation.

---

## Changes since week 1

The sections above are the original plan from week 1 and are kept unchanged.
This section records how the scope changed during the project and why.

| Area            | Original plan                     | Result                                                                                              | Why                                                                                                    |
| --------------- | --------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Calendar        | Day and week view                 | Day view with a doctor filter (admin) and a "Today" button                                          | Admin features and note sharing gave more value; the day view covers the main workflow (decisions #41) |
| Doctor role     | Write and edit own clinical notes | Also share a note read-only with another doctor and revoke it, with simulated patient consent       | Built in week 12 when the schedule allowed it (decisions #38)                                          |
| Admin role      | Manage appointment types          | Create, edit, deactivate and activate types (never deleted); view the calendar one doctor at a time | Types are referenced by appointments; one column cannot show many doctors (decisions #34, #37)         |
| Responsive UI   | Responsive layout                 | Mobile navigation (drawer) and pages tested from 375 px                                             | Added as step 25b before week 12 (decisions #29–33)                                                    |
| Documentation   | Create, edit, view                | Also templates with field subsets, locked after the first save                                      | Planned as P2, built in week 11 (decisions #23)                                                        |
| Unsaved changes | Listed as an error state in US-08 | Not handled                                                                                         | Requires a data router (decisions #27)                                                                 |

Still out of scope, with the data model prepared where relevant: patient login,
patient-controlled sharing and consent (decisions #38), access logging.

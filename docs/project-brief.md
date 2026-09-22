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

| Role   | Can do |
|--------|--------|
| Doctor | Log in, view own calendar/appointments, create/edit/cancel appointments, view limited patient info, write/edit clinical notes |
| Admin  | Log in, view all appointments, manage appointment types, view doctors and patients. No access to clinical notes. |

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
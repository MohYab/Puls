# Acceptance criteria – Puls

Each story is done when all criteria below are met.

---

## US-01 – Log in

> As a doctor or admin, I want to log in, so that I can access my workspace.

**Criteria**

- User can enter email and password.
- Both fields are required and validated before the request is sent.
- Valid credentials → user is redirected to /dashboard.
- Invalid credentials → a clear error message is shown ("Invalid email or
  password") without revealing which field was wrong.
- The API returns a JWT and never returns the password hash.
- Protected pages redirect to /login when the user is not logged in.
- Doctor and Admin get access only to the pages allowed for their role
  (admin pages show "No access" for doctors; the API returns 403).
- Logging out removes the token and returns the user to /login.

**Error states:** wrong credentials (401), server unavailable, expired token.

---

## US-05 – Create an appointment

> As a doctor, I want to create an appointment, so that I can book a patient.

**Criteria**

- User must be logged in.
- User can select a patient, doctor, appointment type, date and time.
- Doctors can only book for themselves; admins can choose any doctor (the
  doctor selected in the calendar is preselected).
- Only active appointment types can be selected; booking an inactive type is
  rejected (400 `APPOINTMENT_TYPE_INACTIVE`).
- End time is calculated automatically from the appointment type's duration.
- All required fields are validated (Zod) with clear messages.
- Booking in the past is not allowed.
- Appointments must be within the opening hours (07:00–17:00, Swedish time),
  so every booking is visible in the calendar.
- If the doctor already has an overlapping appointment, the booking is
  rejected (409) with a clear message.
- Cancelled appointments do not block a time slot.
- A successful booking is saved in the database with status SCHEDULED.
- The user sees a confirmation and the calendar updates without a manual reload.

**Error states:** validation errors, unknown patient/doctor/type (400), time
conflict (409), inactive type (400), server error (500), session expired (401).

---

## US-08 – Create documentation after an appointment

> As a doctor, I want to create documentation after an appointment, so that
> the visit is documented.

**Criteria**

- Only users with the Doctor role can open and write documentation.
- Documentation is opened from an appointment and linked to that appointment,
  the patient and the doctor.
- The page shows patient name, appointment date/time and appointment type.
- The form has the fields: Reason for visit, Observation, Assessment, Plan
  (or the subset defined by the chosen template).
- At least one field must be filled in before saving.
- A successful save shows a confirmation and stores createdAt/updatedAt.
- Only one note per appointment; opening the page again shows the saved note
  for editing.
- A doctor can only write notes for their own appointments, and only the
  author can edit a note.
- A cancelled appointment without a note cannot be documented (409).
- Admins get 403 if they try to access notes.

**Error states:** empty form, appointment not found (404), no permission (403),
cancelled appointment (409), save failed (500).

> Not handled in the MVP: a warning for unsaved changes when leaving the page
> (requires a data router, decisions #27).

---

## US-15 – Manage appointment types

> As an admin, I want to manage appointment types, so that the organization
> can use predefined booking categories.

**Criteria**

- Only admins can open the page and use the write endpoints (403 for doctors).
- Admin sees all types, active and inactive, with name, duration, description
  and status.
- Admin can create and edit a type: name required (max 60, unique regardless
  of case), duration 5–240 minutes in steps of 5, description optional.
- A duplicate name is shown at the name field (409).
- Admin can deactivate a type after a confirmation, and activate it again.
- Types are never deleted. Inactive types are hidden in the booking form, but
  existing appointments keep their type and can still be edited.
- Changing a type's duration does not change booked appointments.

**Error states:** validation errors (400), duplicate name (409), not admin
(403), type not found (404), server unavailable.

---

## US-16 – Share a note with another doctor

> As a doctor, I want to share a note with another doctor, so that a
> colleague has context for a future visit.

**Criteria**

- Only the author of a saved note can share it, see who it is shared with and
  revoke a share.
- The author confirms that the patient has agreed (simulated consent); without
  the confirmation nothing is shared.
- The author cannot share with themselves or with a doctor who already has access.
- The recipient sees the note on the patient page, marked with the author's
  name, and cannot edit it or open it through the author's appointment.
- Revoking requires a confirmation and removes the recipient's access; the
  history of who had access is kept.
- Admins have no access to notes or shares.

**Error states:** no consent (400), sharing with yourself or an unknown doctor
(400), already shared (409), not the author or admin (403), note or share not
found (404).

> Prototype limitation: consent is confirmed by the doctor, not recorded from
> the patient, and access is not logged (Patient Data Act).

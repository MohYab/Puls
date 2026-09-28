# Acceptance criteria – Puls

Each story is done when all criteria below are met.

---

## US-01 – Log in

> As a doctor or admin, I want to log in, so that I can access my workspace.

**Criteria**
- User can enter email and password.
- Both fields are required and validated before the request is sent.
- Valid credentials → user is redirected to /dashboard.
- Invalid credentials → a clear error message is shown ("Wrong email or
  password") without revealing which field was wrong.
- The API returns a JWT and never returns the password hash.
- Protected pages redirect to /login when the user is not logged in.
- Doctor and Admin get access only to the pages allowed for their role.
- Logging out removes the token and returns the user to /login.

**Error states:** wrong credentials (401), server unavailable, expired token.

---

## US-05 – Create an appointment

> As a doctor, I want to create an appointment, so that I can book a patient.

**Criteria**
- User must be logged in.
- User can select a patient, doctor, appointment type, date and time.
- Doctors can only book for themselves; admins can choose any doctor.
- End time is calculated automatically from the appointment type's duration.
- All required fields are validated (Zod) with clear messages.
- Booking in the past is not allowed.
- If the doctor already has an overlapping appointment, the booking is
  rejected (409) with a clear message.
- Cancelled appointments do not block a time slot.
- A successful booking is saved in the database with status SCHEDULED.
- The user sees a confirmation and the calendar updates without a manual reload.

**Error states:** validation errors, time conflict (409), patient/doctor not
found (404), server error (500), session expired (401).

---

## US-08 – Create documentation after an appointment

> As a doctor, I want to create documentation after an appointment, so that
> the visit is documented.

**Criteria**
- Only users with the Doctor role can open and write documentation.
- Documentation is opened from an appointment and linked to that appointment,
  the patient and the doctor.
- The page shows patient name, appointment date/time and appointment type.
- The form has the fields: Reason for visit, Observation, Assessment, Plan.
- At least one field must be filled in before saving.
- A successful save shows a confirmation and stores createdAt/updatedAt.
- Only one note per appointment; opening the page again shows the saved note
  for editing.
- A doctor can only write notes for their own appointments.
- Admins get 403 if they try to access notes.

**Error states:** empty form, appointment not found (404), no permission (403),
save failed (500), unsaved changes when leaving the page.
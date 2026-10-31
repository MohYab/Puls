# Manual API testing – Puls

Requires the backend running (`npm run dev` in `backend/`) and `jq` installed.

**Automated coverage:** `npm test` in `backend/` runs the Vitest + Supertest
suites in `backend/src/test/` against the seeded database:

- `notes.permissions.test.ts`: note read/edit rules (author, other doctor, admin)
- `appointmentTypes.permissions.test.ts`: admin-only type endpoints, inactive
  types, the doctor filter
- `noteSharing.permissions.test.ts`: sharing rules and the share/revoke lifecycle

Seed first (`npx prisma db seed`). The curl tables below cover the remaining
cases (successful create/edit) and the UI checklists.

## Seed users

All users have the password `password123`.

| Email                      | Role   | Notes                                                                             |
| -------------------------- | ------ | --------------------------------------------------------------------------------- |
| erik@puls.test             | DOCTOR | Dr. Erik Lindqvist                                                                |
| sara@puls.test             | DOCTOR | Dr. Sara Nilsson                                                                  |
| johan@puls.test            | DOCTOR | Dr. Johan Ekström                                                                 |
| admin@puls.test            | ADMIN  | No access to clinical notes                                                       |
| `<first>.<last>@puls.test` | DOCTOR | 25 more doctors, ASCII only, e.g. maja.svensson@puls.test, liam.jonsson@puls.test |

## Reset and reseed the database

```bash
cd backend
npx prisma db seed
```

The seed script clears all data first (and refuses to run when `NODE_ENV=production`), so it can be run repeatedly. IDs change on every run: log out and in again in the browser, and fetch new tokens and ids in the terminal.

Content: 28 doctors, 73 patients (dummy data; phone numbers come from the range PTS reserves for fictional use, 070-1740605 to 070-1740699), about 135 appointments relative to today and about 33 notes.

Core scenarios used in the tests below:

- Anna has appointments and notes with both Erik and Sara
- Folke (Erik, 3 days ago) and Eva (Johan, yesterday) have completed appointments without notes
- Bo has a no-show, Gunilla and Hans have cancelled appointments
- Folke has no email, Jonas and Ingrid have no phone
- Sara has shared her note about Anna with Johan (Johan has no appointments with Anna)
- "Group education" is an inactive appointment type
- Elsa Nordqvist is an inactive (deceased) patient; Dr. Karl Bergman is an
  inactive doctor (`karl.bergman@puls.test`, cannot log in)

## Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"erik@puls.test","password":"password123"}'
```

Expected: 200 with `token` and `user` (no `passwordHash`).

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"erik@puls.test","password":"wrong"}'
```

Expected: 401 `INVALID_CREDENTIALS`.

## Get a token for further requests

```bash
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"erik@puls.test","password":"password123"}' | jq -r '.token')
```

## Check current user

```bash
curl http://localhost:3001/api/auth/me -H "Authorization: Bearer $TOKEN"
```

Expected: 200 with `user` (userId, role, doctorId).

```bash
curl http://localhost:3001/api/auth/me
```

Expected: 401 `UNAUTHORIZED`.

## Appointment types (protected)

```bash
curl http://localhost:3001/api/appointment-types -H "Authorization: Bearer $TOKEN"
```

Expected: 200 with 4 appointment types.

```bash
curl http://localhost:3001/api/appointment-types
```

Expected: 401 `UNAUTHORIZED`.

## Tokens for both roles

```bash
DOCTOR_TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"erik@puls.test","password":"password123"}' | jq -r '.token')

ADMIN_TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@puls.test","password":"password123"}' | jq -r '.token')
```

Variables only live in the current terminal window, and tokens expire. Log in again on a 401.

## Patients (protected)

Get a patient id first:

```bash
curl http://localhost:3001/api/patients -H "Authorization: Bearer $ADMIN_TOKEN"
curl "http://localhost:3001/api/patients?search=anna" -H "Authorization: Bearer $ADMIN_TOKEN"
```

Expected: 200 with the patient list (filtered by name when `search` is given).

```bash
curl http://localhost:3001/api/patients/<patientId> -H "Authorization: Bearer $ADMIN_TOKEN"
```

Expected: 200 with id, firstName, lastName, dateOfBirth, phone, email.

```bash
curl -i http://localhost:3001/api/patients/does-not-exist -H "Authorization: Bearer $ADMIN_TOKEN"
```

Expected: 404 `NOT_FOUND` as JSON. An HTML "Cannot GET" response means the route is not registered (restart the server).

```bash
curl -i http://localhost:3001/api/patients/<patientId>
```

Expected: 401 `UNAUTHORIZED`.

## Patient appointment history

```bash
curl http://localhost:3001/api/patients/<patientId>/appointments -H "Authorization: Bearer $DOCTOR_TOKEN"
curl http://localhost:3001/api/patients/<patientId>/appointments -H "Authorization: Bearer $ADMIN_TOKEN"
curl -i http://localhost:3001/api/patients/does-not-exist/appointments -H "Authorization: Bearer $ADMIN_TOKEN"
```

Expected: 200 with appointments, newest first (doctor: only own appointments, admin: all). Unknown patient: 404 `NOT_FOUND`.

The doctor filter is verified against other doctors' appointments in "Cross-doctor access" below.

## UI checklist: patients (week 9)

- `/patients` lists the seed patients; the sidebar highlights "Patients"
- Typing in the search box filters after a short pause; one request per pause (Network tab)
- A search with no match shows "No patients match ..."; clearing the box restores the list
- Clicking a patient opens `/patients/:id` with info card and appointment history (newest first, status badges)
- A new booking for the patient appears in the history after navigating to the page
- `/patients/does-not-exist` shows "Patient not found" within about a second
- With the backend stopped, a patient page shows the error box with "Try again"
- Works as both doctor and admin

## Clinical notes (protected, doctors only)

Get ids for a COMPLETED appointment (has a seeded note), a SCHEDULED one without a note, and a CANCELLED one:

```bash
COMPLETED_ID=$(curl -s http://localhost:3001/api/appointments -H "Authorization: Bearer $DOCTOR_TOKEN" \
  | jq -r '[.[] | select(.status=="COMPLETED")][0].id')
SCHEDULED_ID=$(curl -s http://localhost:3001/api/appointments -H "Authorization: Bearer $DOCTOR_TOKEN" \
  | jq -r '[.[] | select(.status=="SCHEDULED")][0].id')
CANCELLED_ID=$(curl -s http://localhost:3001/api/appointments -H "Authorization: Bearer $DOCTOR_TOKEN" \
  | jq -r '[.[] | select(.status=="CANCELLED")][0].id')
```

Note: the create test consumes `SCHEDULED_ID` (one note per appointment). To repeat it, use another appointment without a note or reset the database.

| #   | Request                                                        | Expected                                       |
| --- | -------------------------------------------------------------- | ---------------------------------------------- |
| 1   | `GET /appointments/$COMPLETED_ID/notes` as doctor              | 200 with the note                              |
| 2   | same as admin                                                  | 403 `FORBIDDEN`                                |
| 3   | `GET /appointments/$SCHEDULED_ID/notes` as doctor              | 404 `NOT_FOUND` (no note yet, a normal state)  |
| 4   | `POST /appointments/$SCHEDULED_ID/notes` with `{"plan":"..."}` | 201, `content` has all four keys (rest `""`)   |
| 5   | same POST again                                                | 409 `NOTE_EXISTS`                              |
| 6   | `POST` with `{}`                                               | 400 `VALIDATION_ERROR`                         |
| 7   | `POST /appointments/$CANCELLED_ID/notes`                       | 409 `APPOINTMENT_CANCELLED`                    |
| 8   | `PUT /notes/<noteId>` with new content                         | 200, `updatedAt` changes                       |
| 9   | `PUT` as admin / `PUT /notes/does-not-exist` as doctor         | 403 `FORBIDDEN` / 404 `NOT_FOUND`              |
| 10  | `GET /patients/<patientId>/notes` as doctor / as admin         | 200 list, newest visit first / 403 `FORBIDDEN` |
| 11  | any notes endpoint without token                               | 401 `UNAUTHORIZED`                             |

Example (test 4):

```bash
curl -i -X POST http://localhost:3001/api/appointments/$SCHEDULED_ID/notes \
  -H "Authorization: Bearer $DOCTOR_TOKEN" -H "Content-Type: application/json" \
  -d '{"plan":"Follow up in two weeks."}'
```

Notes cannot be deleted (no DELETE endpoint by design). Access between doctors is tested in "Cross-doctor access" below.

## UI checklist: documentation (week 10)

- Calendar: clicking a booking as doctor shows a "Documentation" link (not for cancelled bookings, not for admin)
- `/documentation/<appointmentId>` shows patient, time, type and status; an appointment without a note shows an empty form ("Not saved yet")
- Saving with all fields empty shows "Write something in at least one field" and sends no request
- Saving creates the note ("Documentation saved", button changes to "Save changes", timestamps appear); reloading keeps the text
- Editing and saving again updates "Last updated"; the saved message disappears while typing
- Double-clicking Save on a new note does not cause a 409 (button disabled while saving)
- Patient page: "Previous documentation" lists the patient's notes (newest visit first, line breaks preserved) with an "Open documentation" link; a new note appears there after saving
- Documentation page: the current note is hidden in the list beside the form
- Patient history has a "Documentation" link on non-cancelled rows (doctor only)
- Cancelled appointment without a note: "Appointment cancelled", no form
- `/documentation/does-not-exist`: "Appointment not found"
- Admin: documentation page shows "No access", patient page shows "Clinical notes are only visible to doctors.", and no `/notes` requests appear in the Network tab
- Backend stopped: error box with "Try again"

## Cross-doctor access (needs the seed data)

```bash
SARA_TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sara@puls.test","password":"password123"}' | jq -r '.token')

ANNA_ID=$(curl -s "http://localhost:3001/api/patients?search=andersson" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq -r '.[0].id')

# Found through Erik's note for Anna (Erik also has COMPLETED visits without notes)
ERIK_NOTE_JSON=$(curl -s http://localhost:3001/api/patients/$ANNA_ID/notes \
  -H "Authorization: Bearer $DOCTOR_TOKEN" | jq '.[0]')
ERIK_NOTE=$(echo "$ERIK_NOTE_JSON" | jq -r '.id')
ERIK_APPT=$(echo "$ERIK_NOTE_JSON" | jq -r '.appointmentId')
```

| #   | Request                                                      | Expected                |
| --- | ------------------------------------------------------------ | ----------------------- |
| 1   | `GET /appointments/$ERIK_APPT/notes` as Sara                 | 403 `FORBIDDEN`         |
| 2   | `PUT /notes/$ERIK_NOTE` as Sara with `{"plan":"x"}`          | 403 `FORBIDDEN`         |
| 3   | `GET /patients/$ANNA_ID/appointments` as Erik / Sara / admin | 2 / 1 / 3 appointments  |
| 4   | `GET /patients/$ANNA_ID/notes` as Erik / Sara / admin        | 1 / 1 / 403 `FORBIDDEN` |

Count example (test 3):

```bash
for T in "$DOCTOR_TOKEN" "$SARA_TOKEN" "$ADMIN_TOKEN"; do
  curl -s http://localhost:3001/api/patients/$ANNA_ID/appointments -H "Authorization: Bearer $T" | jq length
done
```

Each doctor only sees their own notes, even for a patient they share with another doctor. This is the rule that the planned note sharing between doctors (week 12) would extend.

These cross-doctor and admin cases are also asserted by
`notes.permissions.test.ts` (`npm test` in `backend/`).

## Documentation templates (doctors only)

```bash
TEMPLATE_ID=$(curl -s http://localhost:3001/api/documentation-templates \
  -H "Authorization: Bearer $DOCTOR_TOKEN" | jq -r '.[] | select(.name=="General consultation") | .id')

# Three scheduled appointments of the doctor that have no note yet
APPT_1=$(curl -s http://localhost:3001/api/appointments -H "Authorization: Bearer $DOCTOR_TOKEN" \
  | jq -r '[.[] | select(.status=="SCHEDULED")][0].id')
APPT_2=$(curl -s http://localhost:3001/api/appointments -H "Authorization: Bearer $DOCTOR_TOKEN" \
  | jq -r '[.[] | select(.status=="SCHEDULED")][1].id')
APPT_3=$(curl -s http://localhost:3001/api/appointments -H "Authorization: Bearer $DOCTOR_TOKEN" \
  | jq -r '[.[] | select(.status=="SCHEDULED")][2].id')
```

| #   | Request                                                         | Expected                                                               |
| --- | --------------------------------------------------------------- | ---------------------------------------------------------------------- |
| 1   | `GET /documentation-templates` as doctor                        | 200, four templates, `sections` are field keys (Vaccination has three) |
| 2   | same as admin                                                   | 403 `FORBIDDEN`                                                        |
| 3   | same without token                                              | 401 `UNAUTHORIZED`                                                     |
| 4   | `POST /appointments/$APPT_1/notes` with `plan` and `templateId` | 201, `templateId` is set                                               |
| 5   | `POST /appointments/$APPT_2/notes` with an unknown `templateId` | 400 `VALIDATION_ERROR` ("Documentation template not found")            |
| 6   | `POST` with only `templateId` and no text                       | 400 ("Write something in at least one field")                          |
| 7   | `POST /appointments/$APPT_3/notes` without `templateId`         | 201, `templateId` is `null`                                            |
| 8   | `PUT /notes/<id from test 4>` with a different `templateId`     | 200, `templateId` unchanged                                            |

Example (test 4):

```bash
curl -i -X POST http://localhost:3001/api/appointments/$APPT_1/notes \
  -H "Authorization: Bearer $DOCTOR_TOKEN" -H "Content-Type: application/json" \
  -d "{\"plan\":\"Test\",\"templateId\":\"$TEMPLATE_ID\"}"
```

Tests 4 and 7 create notes, so repeating them gives `409 NOTE_EXISTS`. Reseed or use other appointments.

## Patient search

Every word of the search must match the first or last name (case-insensitive). The list is sorted by last name, then first name.

```bash
curl -s -G http://localhost:3001/api/patients --data-urlencode "search=anna andersson" \
  -H "Authorization: Bearer $DOCTOR_TOKEN" | jq -r '.[] | "\(.lastName) \(.firstName)"'
```

| Search           | Expected                                 |
| ---------------- | ---------------------------------------- |
| `anna andersson` | Andersson Anna                           |
| `andersson anna` | same result (word order does not matter) |
| `ann ande`       | same result (partial words)              |
| `zzz`            | empty list                               |
| (none)           | all patients; Swedish order, Å/Ä/Ö last  |

## UI checklist: templates and UX polish (week 11)

- New note: a "Template" select with "General consultation" selected and its description; all four fields are shown
- Switching to "Vaccination" hides Assessment and clears what was typed there; switching back shows an empty field
- After the first save the select is replaced by "Template: Vaccination"; reloading keeps the template and the three fields
- A seeded note without a template shows "Template: None" and four fields
- If the templates cannot be loaded: "Could not load templates" with "Try again"
- Escape closes only the topmost dialog; focus returns to the element that opened it; the close button has `aria-label="Close"`
- Cancelling an appointment asks for confirmation (patient, date and time shown); "Keep appointment" and Escape only close the dialog; a failed request shows an error in the dialog
- Clicking a label focuses its field in all forms; Save is disabled while saving (a double click sends one request)
- Dashboard with the backend stopped: one error box with "Try again", never "No appointments today."
- Patients, patient page, appointment history and previous notes show consistent loading, empty and error states; "Patient not found" and "Appointment not found" look the same
- Searching for a full name finds the patient; the patient list is sorted alphabetically by last name

## UI checklist: responsive layout (step 25b)

Test in DevTools device mode at 375 px, 768 px and 1280 px.

**Horizontal overflow check.** Paste in the Console on each page. An empty
list (`[]`) means nothing sticks out to the right:

```js
const w = document.documentElement.clientWidth;
[...document.querySelectorAll("body *")]
  .filter((el) => el.getBoundingClientRect().right > w + 1)
  .map(
    (el) => `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 60)}`,
  );
```

Expected `[]` at 375 px on: login, dashboard, calendar, patients, patient page,
documentation, and with the "New appointment" dialog open.

**Navigation**

- Below 768 px: no sidebar; a menu button in the header opens the drawer
- Drawer: focus starts on ✕; Tab and Shift+Tab stay inside and wrap around
- Link click navigates and closes; Escape, ✕ and click on the dark area close;
  focus returns to the menu button
- Page behind does not scroll while the drawer is open
- Widening the window to desktop with the drawer open closes it and restores scrolling
- From 768 px: fixed sidebar as before, no menu button
- Doctor and admin see the same three items (role filter in place for week 12)

**Calendar**

- 375 px: ← Today → and the date on one row, "New appointment" full width below
- "Today" is disabled on today's date and returns to today from another day
- Long patient names in blocks end with "…"
- Backend stopped: "Could not load appointments for this day." with "Try again", not an empty day
- DST: temporarily start on `new Date(2026, 9, 25, 0, 30)`; → shows Monday, October 26

**Pages**

- Patient page: both cards fit; the history table scrolls sideways inside its card
- Documentation page on mobile: appointment, visit note, previous documentation;
  on desktop the form is on the right with appointment and previous notes on the left
- Dialogs fit the screen and scroll inside (`max-h-[90dvh]`)
- Login: card with side margins, "Prototype – test data only" under it,
  Zod messages (no browser bubble), autofill works

**Known emulation artifact:** in Chromium device mode the native `<select>`
popup in the booking dialog can appear shifted to the left. It works in
Firefox and on real devices the native picker is used. Check on a real phone
before the demo (week 13).

## Appointment types (admin, week 12)

Use a `login` helper to get tokens in one line:

```bash
API=http://localhost:3001/api
login() { curl -s -X POST $API/auth/login -H "Content-Type: application/json" \
  -d "{\"email\":\"$1\",\"password\":\"password123\"}" | jq -r '.token'; }
ADMIN=$(login admin@puls.test); ERIK=$(login erik@puls.test)
```

| #   | Request                                                       | Expected                             |
| --- | ------------------------------------------------------------- | ------------------------------------ |
| 1   | `GET /appointment-types` as doctor                            | 200, only active types               |
| 2   | `?includeInactive=true` as doctor / as admin                  | only active / also "Group education" |
| 3   | `POST` as admin `{"name":"Phone consultation","duration":15}` | 201                                  |
| 4   | same name in lower case                                       | 409 `APPOINTMENT_TYPE_EXISTS`        |
| 5   | `duration: 7` / `name: ""`                                    | 400 `VALIDATION_ERROR`               |
| 6   | `POST` as doctor                                              | 403 `FORBIDDEN`                      |
| 7   | `PUT /:id` with a new duration                                | 200                                  |
| 8   | `PATCH /:id/status` `{"isActive":false}`                      | 200; hidden for doctors              |
| 9   | book with the inactive type                                   | 400 `APPOINTMENT_TYPE_INACTIVE`      |
| 10  | `PATCH /does-not-exist/status`                                | 404                                  |

Created types stay until the next seed.

## Doctor filter (week 12)

| #   | Request                                   | Expected                        |
| --- | ----------------------------------------- | ------------------------------- |
| 1   | `GET /appointments?date=<today>` as admin | appointments of several doctors |
| 2   | add `&doctorId=<Erik>` as admin           | only Erik's                     |
| 3   | `&doctorId=<Sara>` as Erik                | only Erik's (filter ignored)    |
| 4   | `&doctorId=does-not-exist` as admin       | 200, empty list                 |

## Note sharing (week 12)

Covered by `noteSharing.permissions.test.ts`. Manual commands for the cases that
change data:

```bash
SARA=$(login sara@puls.test)
ERIK_DOC=$(curl -s $API/auth/me -H "Authorization: Bearer $ERIK" | jq -r '.user.doctorId')
ANNA=$(curl -s "$API/patients?search=anna%20andersson" -H "Authorization: Bearer $ADMIN" | jq -r '.[0].id')
SARA_NOTE=$(curl -s $API/patients/$ANNA/notes -H "Authorization: Bearer $SARA" | jq -r '.[0].id')

# Share with Erik (201), Erik now sees 2 notes for Anna
curl -s -o /dev/null -w "%{http_code}\n" -X POST $API/notes/$SARA_NOTE/shares \
  -H "Authorization: Bearer $SARA" -H "Content-Type: application/json" \
  -d "{\"doctorId\":\"$ERIK_DOC\",\"consentConfirmed\":true}"

# Revoke (204), Erik sees 1 note again
curl -s -o /dev/null -w "%{http_code}\n" -X DELETE $API/notes/$SARA_NOTE/shares/$ERIK_DOC \
  -H "Authorization: Bearer $SARA"
```

Reseed before `npm test` if a share to Erik is left active.

## UI checklist: admin and sharing (week 12)

**Admin**

- Menu shows "Appointment types" for admin only; a doctor opening
  `/admin/appointment-types` sees "No access" and no admin requests are sent
- Create, edit (duplicate name shown under the name field), deactivate (with
  confirmation) and activate types; inactive types are grey and missing from
  the booking form
- Calendar: doctor selector with the first doctor preselected; switching doctor
  switches the day; "New appointment" preselects the doctor
- Changing a type's duration does not change the height of booked blocks
- Editing an appointment whose type is inactive shows "(inactive)" and saves

**Sharing**

- Sharing card appears on the documentation page only for a saved note
- Doctor list excludes yourself and doctors who already have access
- Share without the consent box: field error, no request
- Share: doctor appears under "Shared with"; Revoke asks for confirmation
- Recipient: patient page shows the note with "Shared by …" and no
  "Open documentation" link; after revoke it is gone (after reload)
- Admin still sees "Clinical notes are only visible to doctors."

## Appointment status (week 12)

Covered by `appointmentStatus.test.ts` for the rejected cases. Manual commands
for the allowed changes:

```bash
API=http://localhost:3001/api
login() { curl -s -X POST $API/auth/login -H "Content-Type: application/json" \
  -d "{\"email\":\"$1\",\"password\":\"password123\"}" | jq -r '.token'; }
ERIK=$(login erik@puls.test); ADMIN=$(login admin@puls.test)
patch() { curl -s -X PATCH $API/appointments/$1/status -H "Authorization: Bearer $2" \
  -H "Content-Type: application/json" -d "$3" | jq -c '{status, error}'; }
FUTURE=$(curl -s $API/appointments -H "Authorization: Bearer $ERIK" \
  | jq -r '[.[] | select(.status=="SCHEDULED" and .startTime > (now|todate))][0].id')
FOLKE=$(curl -s "$API/patients?search=folke" -H "Authorization: Bearer $ERIK" | jq -r '.[0].id')
FOLKE_APPT=$(curl -s $API/patients/$FOLKE/appointments -H "Authorization: Bearer $ERIK" \
  | jq -r '[.[] | select(.status=="COMPLETED")][0].id')
```

| #   | Command                                                                         | Expected                       |
| --- | ------------------------------------------------------------------------------- | ------------------------------ |
| 1   | `patch $FUTURE $ERIK '{"status":"CONFIRMED"}'`                                  | CONFIRMED                      |
| 2   | `patch $FUTURE $ERIK '{"status":"COMPLETED"}'`                                  | 409 "before it has started"    |
| 3   | `patch $FOLKE_APPT $ERIK '{"status":"SCHEDULED"}'`                              | 409 "Contact an administrator" |
| 4   | `patch $FOLKE_APPT $ADMIN '{"status":"NO_SHOW","reason":"."}'`                  | 400 (reason too short)         |
| 5   | `patch $FOLKE_APPT $ADMIN '{"status":"NO_SHOW","reason":"Test correction"}'`    | NO_SHOW                        |
| 6   | `patch $FUTURE $ERIK '{"status":"CANCELLED"}'`                                  | CANCELLED                      |
| 7   | `patch $FUTURE $ADMIN '{"status":"SCHEDULED","reason":"Cancelled by mistake"}'` | SCHEDULED                      |

History:

```bash
psql -h localhost -U puls_user -d puls_dev -c "SELECT \"fromStatus\", \"toStatus\", reason FROM appointment_status_changes ORDER BY \"createdAt\";"
```

One row per successful change, none for rejected ones. Reseed afterwards.

## UI checklist: appointment status (week 12, continued)

- Future scheduled appointment: "Confirm" and "Cancel appointment"; no
  "Mark as completed" or "Mark as no-show"
- Started appointment: also "Mark as completed" and "Mark as no-show"
- "Confirm" saves directly; completed, no-show and cancel ask first and say
  the status cannot be changed afterwards
- Final status (doctor): "This appointment is … and can no longer be changed.
  Contact an administrator to correct it." No Edit; Documentation still shown
  except for cancelled appointments
- Admin on a final status: "Correct status" with new status and reason
  (at least 10 characters); the list hides Completed and No-show before the
  start time
- Cancelling an appointment with a note shows the error in the dialog

## Accessibility check (v.43)

Run Lighthouse (Accessibility) and axe DevTools on every page, with dialogs
open where relevant, then go through the main flow with the keyboard only.

| Page            | Lighthouse before            | after |
| --------------- | ---------------------------- | ----- |
| Login           | 96 (no `main` landmark)      | 100   |
| Calendar        | 95 (contrast of time labels) | 100   |
| All other pages | 100                          | 100   |

Keyboard: first Tab shows "Skip to main content"; dialogs keep Tab inside and
return focus on close; the tab title changes per page.

## Real device check (v.43)

Tested on a real phone over the local network (`VITE_API_URL`, see
`docs/setup.md`), as a complement to DevTools device mode.

- **Device:** Fairphone 6 (/e/OS), Firefox
- **Date:** 2026-10-23

| Area                                                          | Result |
| ------------------------------------------------------------- | ------ |
| Login, autofill                                               | OK     |
| Mobile menu                                                   | OK     |
| No horizontal scrolling on any page                           | OK     |
| Calendar: day navigation, status change, dialogs              | OK     |
| Booking form: native pickers for patient, type, date and time | OK     |
| On-screen keyboard does not hide Save or the text being typed | OK     |
| Documentation: order and text fields                          | OK     |
| Admin: appointment types table and form                       | OK     |

The select popup that was misplaced in Chromium's device mode (week 12)
works correctly on the real device, which confirms it was an emulation
artifact.

## Patients, doctors and accounts (phase 2b)

Rejected cases are covered by `patients.management.test.ts`,
`doctors.management.test.ts` and `account.test.ts`. Commands for the changes
that write data (reseed afterwards):

```bash
API=http://localhost:3001/api
login() { curl -s -X POST $API/auth/login -H "Content-Type: application/json" \
  -d "{\"email\":\"$1\",\"password\":\"${2:-password123}\"}" | jq -r '.token'; }
ERIK=$(login erik@puls.test); ADMIN=$(login admin@puls.test)
TYPE=$(curl -s $API/appointment-types -H "Authorization: Bearer $ERIK" | jq -r '.[0].id')
```

| #   | Action                                             | Expected                                                              |
| --- | -------------------------------------------------- | --------------------------------------------------------------------- |
| 1   | Erik creates a patient (`POST /patients`)          | 201                                                                   |
| 2   | Erik books the patient tomorrow 10:00              | 201                                                                   |
| 3   | Admin deactivates the patient (`MOVED`)            | `cancelledAppointments: 1`; history row "Patient deactivated (moved)" |
| 4   | Booking the patient again                          | 400 `PATIENT_INACTIVE`                                                |
| 5   | Admin reactivates the patient                      | `isActive: true`; the booking stays cancelled                         |
| 6   | Admin creates a doctor with email in mixed case    | 201; email stored in lower case                                       |
| 7   | The new doctor logs in (any case in the email)     | token                                                                 |
| 8   | Admin deactivates the new doctor                   | `isActive: false`                                                     |
| 9   | The new doctor's token on `/auth/me` / login again | 401 "no longer active" / login fails                                  |
| 10  | Admin reactivates the doctor                       | login works again                                                     |
| 11  | Erik changes his password on My account            | 204; new password works, old does not                                 |

## UI checklist: patients, doctors and My account (phase 2b)

- Patients: "+ New patient" for both roles opens the form and goes to the new
  patient; a duplicate shows an error in the form; "Show inactive patients"
  shows Elsa marked "Inactive"; the booking form never lists inactive patients
- Patient page: "Edit" for both roles; admin only: "Deactivate" (reason
  required, result shows how many appointments were cancelled) and "Reactivate"
- Doctors (admin): list with status; create with start password; a taken
  email shows at the field; deactivating a doctor with future appointments
  explains where to find them; an inactive doctor is gone from the calendar and
  booking form
- A deactivated doctor who is logged in is logged out on the next action
- My account: the name in the header links there; saving the name updates the
  header; a wrong current password shows at the field without logging out;
  admins have no specialization field

## Appointments in a date range (phase 3)

Needs `$DOCTOR_TOKEN` and `$ADMIN_TOKEN` (see "Tokens for both roles").
`date -d` is GNU date (Linux).

```bash
API=http://localhost:3001/api
FROM=$(date +%F)
TO=$(date -d "+6 days" +%F)

# 1. Seven days: 200, the doctor's own appointments in the week
curl -s "$API/appointments?from=$FROM&to=$TO" -H "Authorization: Bearer $DOCTOR_TOKEN" | jq length

# 2. Eight days: 400 "At most 7 days at a time"
curl -s "$API/appointments?from=$FROM&to=$(date -d "+7 days" +%F)" -H "Authorization: Bearer $DOCTOR_TOKEN" | jq .error

# 3. to before from: 400 "from must be on or before to"
curl -s "$API/appointments?from=$TO&to=$FROM" -H "Authorization: Bearer $DOCTOR_TOKEN" | jq .error

# 4. Only from: 400 "from and to must be used together"
curl -s "$API/appointments?from=$FROM" -H "Authorization: Bearer $DOCTOR_TOKEN" | jq .error

# 5. date together with from/to: 400 "Use either date or from/to, not both"
curl -s "$API/appointments?date=$FROM&from=$FROM&to=$TO" -H "Authorization: Bearer $DOCTOR_TOKEN" | jq .error

# 6. Not a real date: 400 "Dates must be valid ..."
curl -s "$API/appointments?from=2026-13-01&to=2026-13-02" -H "Authorization: Bearer $DOCTOR_TOKEN" | jq .error

# 7. Admin, one doctor: only that doctor's appointments
DOCTOR_ID=$(curl -s "$API/doctors" -H "Authorization: Bearer $ADMIN_TOKEN" | jq -r '.[0].id')
curl -s "$API/appointments?from=$FROM&to=$TO&doctorId=$DOCTOR_ID" -H "Authorization: Bearer $ADMIN_TOKEN" \
  | jq '[.[].doctorId] | unique'
```

Expected: 1 a number, 2–6 an error object with code `VALIDATION_ERROR`,
7 a list with one doctor id.

Daylight saving: `from=2026-10-19&to=2026-10-25` (DST ends 25 October) is
7 days and is accepted.

## UI checklist: week view and details panel (phase 3)

Window at least 1280 px, logged in as a doctor:

- [ ] Day/Week switch; the week shows Monday–Sunday, previous/next move a whole week
- [ ] Today button marks the current week; the now line only in today's column
- [ ] Clicking a day header opens that day in the day view
- [ ] No details panel until an appointment is chosen; the calendar has full width
- [ ] Choosing an appointment opens the panel and moves focus to its heading
- [ ] Escape and ✕ close the panel; focus goes back to the appointment block
- [ ] With the cancel confirmation open, Escape closes only the confirmation
- [ ] Changing day, week, view or doctor closes the panel
- [ ] Under 1280 px the details open in a modal; Escape returns focus to the block
- [ ] Under 768 px there is no Day/Week switch and the day view is shown

Known edge case: if an open appointment disappears from the list (an admin
moves it to another day or doctor), the panel closes without returning focus.

## Visits to document (phase 3)

Needs `$DOCTOR_TOKEN` and `$ADMIN_TOKEN` (see "Tokens for both roles").

```bash
API=http://localhost:3001/api

# 1. Doctor: total and the oldest visits, all COMPLETED with hasNote false
curl -s $API/appointments/to-document -H "Authorization: Bearer $DOCTOR_TOKEN" \
  | jq '{total, items: [.appointments[] | {startTime, status, hasNote}]}'

# 2. Admin: 403 FORBIDDEN
curl -s $API/appointments/to-document -H "Authorization: Bearer $ADMIN_TOKEN" | jq .error

# 3. No token: 401
curl -s $API/appointments/to-document | jq .error

# 4. Document the oldest one: total drops by one (writes a note; reseed afterwards)
ID=$(curl -s $API/appointments/to-document -H "Authorization: Bearer $DOCTOR_TOKEN" | jq -r '.appointments[0].id')
curl -s -X POST $API/appointments/$ID/notes -H "Authorization: Bearer $DOCTOR_TOKEN" \
  -H "Content-Type: application/json" -d '{"reasonForVisit":"Test note"}' | jq '{id}'
curl -s $API/appointments/to-document -H "Authorization: Bearer $DOCTOR_TOKEN" | jq .total

# 5. Every appointment has the patient's date of birth
curl -s "$API/appointments?date=$(date +%F)" -H "Authorization: Bearer $DOCTOR_TOKEN" | jq '.[0].patient'
```

The automated tests run against the same database. If test 4 has documented
every completed visit of Erik's, `appointments.toDocument.test.ts` fails until
the database is seeded again (`npx prisma db seed`).

## UI checklist: dashboards (phase 3)

Doctor (`erik@puls.test`):

- [ ] Date, greeting after the time of day, and "N appointments today · N visits to document"
- [ ] Two columns from 1024 px; on a phone: next patient, schedule, to document, status
- [ ] Next patient: dark card with "Starts in …", date of birth and age; the focus ring is visible
- [ ] Schedule: the next appointment marked "Next"; Document visit / Open documentation for completed, Open for upcoming, nothing for no-show and cancelled
- [ ] To document: oldest first, "Today 08:30" or "Yesterday …"; saving a note removes the visit
- [ ] Book appointment opens the form with the doctor preselected; Escape returns focus to the button
- [ ] Backend stopped: an error with Try again in each card, never "No more patients today"

Admin (`admin@puls.test`):

- [ ] "Today at the clinic", a summary, Add patient and Book appointment
- [ ] Five status tiles in a row, then Doctors today with centred counts
- [ ] A doctor's name opens their calendar (`/calendar?doctor=…`); changing doctor updates the URL; a reload keeps the doctor
- [ ] `/calendar?doctor=unknown` shows the first doctor without an error
- [ ] At 375 px the table scrolls inside its card
- [ ] Network tab: no request to `to-document`

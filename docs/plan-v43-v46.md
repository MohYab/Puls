# Plan v.43–v.46 – Puls

Plan for the time between week 12 and the MVP freeze. About three weeks ahead of the original
roadmap, so the time is used for quality and design.

**Order:** secure what exists → fix bugs and gaps → clean up code → redesign →
quality → polish and freeze. Cleaning up before the redesign makes it easier;
quality work after it tests the final version.

Status: Todo / In progress / Done / Moved

## Phase 0 – Secure (v.43, first)

| #   | Task                                                                        | Class | Status |
| --- | --------------------------------------------------------------------------- | ----- | ------ |
| 1   | Merge finished work to `main` via a pull request                            | MUST  | Done   |
| 2   | Screenshots of all pages in the current design (`docs/screenshots/before/`) | MUST  | Done   |
| 3   | Supervisor meeting                                                          | MUST  | Done   |

## Phase 1 – Bugs and gaps (v.43)

| #   | Task                                                                                   | Class  | Status |
| --- | -------------------------------------------------------------------------------------- | ------ | ------ |
| 4   | Global border colour (Tailwind v4 defaults to `currentColor`, all borders look black)  | MUST   | Done   |
| 5   | 400 for an unknown patient or doctor when booking (was a database error, 500)          | MUST   | Done   |
| 6   | Change appointment status in the UI (Confirmed, Completed, No-show)                    | SHOULD | Done   |
| 7   | Completed and cancelled appointments cannot be edited or cancelled (UI and API)        | SHOULD | Done   |
| 8   | Booking only within opening hours 07–17 (UI and API); outside hours is invisible today | SHOULD | Done   |
| 9   | Global 401 → log out and redirect to `/login`                                          | SHOULD | Done   |
| 10  | `ErrorBoundary` around the page content (a render error gives a white page today)      | SHOULD | Done   |
| 11  | Test: same login error for unknown email and wrong password                            | SHOULD | Done   |

## Phase 2 – Security and clean-up (v.43)

| #   | Task                                                                             | Class  | Status |
| --- | -------------------------------------------------------------------------------- | ------ | ------ |
| 12  | Rate limit on `/auth/login` and `helmet`                                         | SHOULD | Done   |
| 13  | Remove `try/catch` in controllers (Express 5 forwards async errors itself)       | SHOULD | Done   |
| 14  | One shared `RequestingUser` type; one `include` constant in `appointmentService` | SHOULD | Done   |
| 15  | Swedish sorting of patients (`Intl.Collator("sv")`): Å, Ä, Ö after Z             | SHOULD | Done   |
| 16  | Booking form uses `useDoctors` and a shared hook for appointment types           | SHOULD | Done   |
| 17  | Move `requireValue` to `test/helpers.ts`                                         | COULD  | Done   |

## Phase 2b – Patient, doctor and account management (v.44)

Found missing after phase 4: patients and doctors could only come from the
seed, and users could not change their own details or password.

| #    | Task                                                                                                                                | Class         | Status |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------- | ------ |
| 2b.1 | Backend: create and edit patients (doctors and admins); deactivate and reactivate (admin), future appointments cancelled and logged | MUST / SHOULD | Done   |
| 2b.2 | Frontend: patient form (create, edit) and deactivation on the patient page                                                          | MUST / SHOULD | Done   |
| 2b.3 | Backend: create, edit, deactivate and reactivate doctors (admin); inactive users cannot log in or use a token                       | SHOULD / MUST | Done   |
| 2b.4 | Frontend: `/admin/doctors`                                                                                                          | SHOULD        | Done   |
| 2b.5 | My account (`/account`): name, work phone, specialization, change password                                                          | MUST / SHOULD | Done   |
| 2b.6 | Tests and docs                                                                                                                      | MUST          | Done   |
| 2b.7 | Clinic settings (admin): name, address, phone, shown in the app; opening hours as a setting only if time allows                     | COULD         | Done   |

**Rule:** nothing is deleted. Doctors and patients are deactivated; clinical
records are kept (Patient Data Act). Removing journal content requires an
application to IVO and is outside the system.

## Phase 3 – Redesign (v.44–45, branch `feature/redesign`)

Based on the mockups in `docs/design/` and the decisions in
`docs/design-direction.md`.

| #    | Task                                                                                                                                       | Class  | Status           |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------ | ---------------- |
| 3.0  | Design direction written down (`docs/design-direction.md`)                                                                                 | MUST   | Done             |
| 3.1  | Foundation: self-hosted fonts, design tokens, one date format, `Button`, `Badge`, `Input`, `Card`, `Avatar`, icons                         | MUST   | Done             |
| 3.2  | Shell: sidebar grouped into main and Administration, user, My account and log out at the bottom, clinic name, prototype label, mobile menu | MUST   | Done             |
| 3.3  | Calendar: colour shows booking status only, note shown with an icon, current-time line, side panel with date, doctor and duration          | SHOULD | Done             |
| 3.3b | Calendar week view (from `md`; day view on mobile), `GET /appointments?from=&to=`, Day/Week switch                                         | SHOULD | Done             |
| 3.3c | Details panel only when an appointment is chosen; Escape closes it; focus returns to the block                                             | SHOULD | Done             |
| 3.4  | Dashboards: doctor (next patient, To document, today by status); admin shows operations only (today by status, doctors today)              | SHOULD | Done             |
| 3.5  | Patients: list, patient page with Book appointment, age and next appointment                                                               | SHOULD | Done             |
| 3.6  | correct wording (the template is locked, not the note); Latest measurements on the patient page (moved from 3.5)                           | SHOULD | Done             |
| 3.7  | Remaining pages in the new style: login, admin pages, My account, Add patient                                                              | SHOULD | Done             |
| 3.8  | Searchable select (combobox) for doctors and patients                                                                                      | SHOULD | Done             |
| 3.9  | Duplicate patient warning with "This is a different person"                                                                                | COULD  | Rejected (#63)   |
| 3.10 | Quick actions in the header (Book appointment, Add patient)                                                                                | COULD  | Done (3.4)       |
| 3.11 | Statistics for a period and appointments by type                                                                                           | COULD  | Moved to phase 5 |
| 3.12 | Vital signs in the visit note and latest measurements on the patient page                                                                  | COULD  | Done (3.6)       |

**Scope rule:** phase 3 changes appearance and layout. The only functional
changes are 3.4, 3.5 (next appointment), 3.8 and, if time allows, 3.9–3.12.
COULD items are done in order and only after all MUST and SHOULD items.

**Time box:** if time runs out, finish 3.0–3.4 and 3.6; the other pages keep
the current design.

## Phase 4 – Quality (v.45)

| #   | Task                                                                      | Class  | Status |
| --- | ------------------------------------------------------------------------- | ------ | ------ |
| 27  | Shared `useFocusTrap` for `Modal` and the mobile drawer                   | SHOULD | Done   |
| 28  | Accessibility review (keyboard, labels, screen reader)                    | SHOULD | Done   |
| 29  | Frontend tests with Vitest and React Testing Library where they add value | SHOULD | Done   |
| 30  | Test on a real phone                                                      | SHOULD | Done   |
| 31  | CI with GitHub Actions (lint, build, tests with PostgreSQL)               | SHOULD | Done   |

## Phase 5 – Polish and freeze (v.46)

| #   | Task                                                                                                                   | Class           | Status |
| --- | ---------------------------------------------------------------------------------------------------------------------- | --------------- | ------ |
| 32  | Decide on deployment (yes or no) at the start of the week: yes, Render and Neon (decision #71)                         | MUST (decision) | Done   |
| 33  | If deploying: `VITE_API_URL`, CORS origin, demo data in production, time zone, demo mode (#72)                         | COULD           | Done   |
| 34  | Calendar week view (decisions #41). moved to 3.3b                                                                      | COULD           | Done   |
| 35  | Docs: project log, decisions, README, ER diagram, api.md                                                               | MUST            | Todo   |
| 35b | Usability test: 2–3 people do four tasks; time, mistakes and observations in `docs/usability-test.md`                  | SHOULD          | Todo   |
| 36  | Screenshots of the new design (`docs/screenshots/after/`) and a 2–3 min demo video                                     | MUST            | Todo   |
| 37  | **MVP freeze**: no new features after v.46                                                                             | MUST            | Todo   |
| 38  | Admin statistics: appointments, no-show and cancellation rate, appointments by type (decision #60). Future development | COULD           | Moved  |
| 39  | Recently added patients on the admin dashboard. Future development                                                     | COULD           | Moved  |
| 40  | Separate test database, so manual tests never affect the automated ones. Future development                            | COULD           | Moved  |
| 41  | One constant for the clinic's time zone (`CLINIC_TIME_ZONE`) in backend and frontend. Future development               | COULD           | Moved  |
| 42  | Trends for vital signs on the patient page (a small chart per measurement). Future development                         | COULD           | Moved  |
| 43  | `npm audit --omit=dev` in both projects, fix what reaches the browser or server                                        | SHOULD          | Todo   |
| 44  | The other lists use `tableStyles.ts` and a fixed layout where content changes (Doctors). Time box 1 h                  | COULD           | Todo   |
| 45  | Server-side patient search for the select when lists grow (debounce, limit). Future development                        | COULD           | Moved  |
| 46  | Patient quick search in the dashboard header, also by birth year or date of birth (decision #70)                       | COULD           | Done   |

- `VITE_API_URL` from #33 is Done.

**Scope before the freeze (decided 8 November):** the week before the MVP
freeze is reserved for screenshots and the demo video (#36), the usability
test (#35b), documentation (#35) and the freeze itself (#37). Only work that
makes the public demo safer (#43) or fixes something that looks broken on the
screenshots (#44) is kept. New features (#38, #39, #42) are out of scope;
preparation for a later version (#40, #41, #45) moves to future development.

**Plan for v.46:** Monday #43, #44 and screenshots; Tuesday prepare the
usability test; Wednesday usability test and small fixes; Thursday demo
video; Friday documentation, tag `v1.0-mvp` and the freeze.

## Out of scope

Deliberately not built, for legal, privacy or design reasons:

- Deleting doctors or patients: they are deactivated, since patient records
  must be kept (normally ten years; only IVO can decide to destroy them)
- Collecting staff home addresses (not needed: data minimisation)
- Decorative animations (a clinical tool should be calm and fast)

## Future development

**Before real patient data (legal and security)**

1. Access control required by the Patient Data Act: an access log for
   clinical notes, blocking (spärr) and patient consent
2. Staff login with e-identification (for example SITHS)
3. The session token in an httpOnly cookie instead of `localStorage` (#13)
4. Hosting for real data: a paid plan without cold starts, backups,
   monitoring and data processing agreements with the providers
5. A personal identity number or verified identity instead of name and date
   of birth for duplicate checks

**Product**

6. Permissions instead of fixed roles: each user gets a set of permissions
   (for example writing notes, managing the schedule, registering patients,
   handling payments, managing users), and a role is a named set of them. A
   doctor in a small clinic can then also administer, and a reception role
   can register patients without reading clinical notes. Includes managing
   admin accounts (`/admin/users`).
7. Patient login (with BankID), patient-controlled sharing and consent, and a
   patient's own request to delete data (a request, not a deletion)
8. More than one clinic in the same installation, and sharing notes between
   clinics
9. The schedule updates when someone else books (websockets or polling)
10. A warning about unsaved changes and automatically saved drafts (#27)
11. Admin statistics, recently added patients (#38, #39) and trends for vital
    signs (#42)
12. Dark mode

**Other countries and languages**

13. Arabic and right-to-left: translations, plural rules, a font with Arabic
    letters, and time zone, week start and opening hours per clinic (#41)

**Larger clinics**

14. Pagination of lists and server-side search in the patient select (#45),
    connection pooling when running more than one server, and code splitting
    so the first page loads less JavaScript

**Development**

15. One source for validation rules shared by frontend and backend (vital
    sign limits and status rules are mirrored today)
16. A separate database for automated tests (#40)

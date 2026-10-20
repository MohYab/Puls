# Plan v.43–v.46 – Puls

Plan for the time between week 12 (done on October 17, 2026) and the MVP freeze.
Project week 14 = calendar week 46. About three weeks ahead of the original
roadmap, so the time is used for quality and design, not new features.

**Order:** secure what exists → fix bugs and gaps → clean up code → redesign →
quality → polish and freeze. Cleaning up before the redesign makes it easier;
quality work after it tests the final version.

Status: Todo / In progress / Done / Moved

## Phase 0 – Secure (v.43, first)

| #   | Task                                                                        | Class | Status |
| --- | --------------------------------------------------------------------------- | ----- | ------ |
| 1   | Merge finished work to `main` via a pull request                            | MUST  | Done   |
| 2   | Screenshots of all pages in the current design (`docs/screenshots/before/`) | MUST  | Done   |
| 3   | Supervisor meeting                                                          | MUST  | Todo   |

## Phase 1 – Bugs and gaps (v.43)

| #   | Task                                                                                   | Class  | Status |
| --- | -------------------------------------------------------------------------------------- | ------ | ------ |
| 4   | Global border colour (Tailwind v4 defaults to `currentColor`, all borders look black)  | MUST   | Done   |
| 5   | 400 for an unknown patient or doctor when booking (was a database error, 500)          | MUST   | Done   |
| 6   | Change appointment status in the UI (Confirmed, Completed, No-show)                    | SHOULD | Done   |
| 7   | Completed and cancelled appointments cannot be edited or cancelled (UI and API)        | SHOULD | Done   |
| 8   | Booking only within opening hours 07–17 (UI and API); outside hours is invisible today | SHOULD | Todo   |
| 9   | Global 401 → log out and redirect to `/login`                                          | SHOULD | Done   |
| 10  | `ErrorBoundary` around the page content (a render error gives a white page today)      | SHOULD | Done   |
| 11  | Test: same login error for unknown email and wrong password                            | SHOULD | Done   |

## Phase 2 – Security and clean-up (v.43)

| #   | Task                                                                             | Class  | Status      |
| --- | -------------------------------------------------------------------------------- | ------ | ----------- |
| 12  | Rate limit on `/auth/login` and `helmet`                                         | SHOULD | Todo        |
| 13  | Remove `try/catch` in controllers (Express 5 forwards async errors itself)       | SHOULD | Todo        |
| 14  | One shared `RequestingUser` type; one `include` constant in `appointmentService` | SHOULD | In progress |
| 15  | Swedish sorting of patients (`Intl.Collator("sv")`): Å, Ä, Ö after Z             | SHOULD | Todo        |
| 16  | Booking form uses `useDoctors` and a shared hook for appointment types           | SHOULD | Todo        |
| 17  | Move `requireValue` to `test/helpers.ts`                                         | COULD  | Done        |

## Phase 3 – Redesign (v.44, branch `feature/redesign`)

| #   | Task                                                                                                  | Class              | Status |
| --- | ----------------------------------------------------------------------------------------------------- | ------------------ | ------ |
| 18  | Design direction and mockups of dashboard and calendar (after supervisor input on guidelines)         | MUST (before code) | Todo   |
| 19  | Design tokens with `@theme` (semantic colours, font, radius)                                          | SHOULD             | Todo   |
| 20  | Base components: `Button`, `Badge`, `Input`, `Card`, `PageHeader`, icons                              | SHOULD             | Todo   |
| 21  | Searchable select (combobox) for doctors and patients (calendar, booking, sharing)                    | SHOULD             | Todo   |
| 22  | Role-based dashboard. Admin: "Today at the clinic". Doctor: schedule, next appointment, "To document" | SHOULD             | Todo   |
| 23  | One date and time format in the whole app, collected in `utils/date.ts`                               | SHOULD             | Todo   |
| 24  | Appointment detail shows date, doctor and duration                                                    | SHOULD             | Todo   |
| 25  | Apply the new design page by page, one commit per page                                                | SHOULD             | Todo   |
| 26  | Colour contrast meets WCAG (e.g. `text-gray-400` time labels)                                         | SHOULD             | Todo   |

**Scope rule:** phase 3 changes appearance only, except #21, #22 and #24.
Time box: one week.

Design notes from the screenshot review:

- Short appointments (15 min) show only the first line; use one line for short blocks.
- The patient list has much empty space; consider age and last visit columns.
- The mobile menu lacks the user name and "Log out".
- The booking button says "Save"; "Book appointment" says what happens.

## Phase 4 – Quality (v.45)

| #   | Task                                                                      | Class  | Status |
| --- | ------------------------------------------------------------------------- | ------ | ------ |
| 27  | Shared `useFocusTrap` for `Modal` and the mobile drawer                   | SHOULD | Todo   |
| 28  | Accessibility review (keyboard, labels, screen reader)                    | SHOULD | Todo   |
| 29  | Frontend tests with Vitest and React Testing Library where they add value | SHOULD | Todo   |
| 30  | Test on a real phone                                                      | SHOULD | Todo   |
| 31  | CI with GitHub Actions (lint, build, tests with PostgreSQL)               | SHOULD | Todo   |

## Phase 5 – Polish and freeze (v.46)

| #   | Task                                                                               | Class           | Status |
| --- | ---------------------------------------------------------------------------------- | --------------- | ------ |
| 32  | Decide on deployment (yes or no) at the start of the week                          | MUST (decision) | Todo   |
| 33  | If deploying: `VITE_API_URL`, CORS origin, demo data in production, time zone      | COULD           | Todo   |
| 34  | Calendar week view (decisions #41), only if everything above is done               | COULD           | Todo   |
| 35  | Docs: project log, decisions, README, ER diagram, api.md                           | MUST            | Todo   |
| 36  | Screenshots of the new design (`docs/screenshots/after/`) and a 2–3 min demo video | MUST            | Todo   |
| 37  | **MVP freeze**: no new features after v.46                                         | MUST            | Todo   |

## Out of scope (future development in the report)

- Shared types between frontend and backend (monorepo)
- Patient login, patient-controlled sharing and consent, access logging
- External connection pooling (PgBouncer)
- Live updates with websockets
- Dark mode and animations
- Pages without any styling classes (layout belongs in the page)
- `/admin/users`

## Open decisions

- Combobox: Headless UI (recommended) or own component
- Design direction: colours and style, examples of apps that feel modern
